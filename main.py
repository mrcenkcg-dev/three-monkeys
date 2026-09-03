import os
import sqlite3
import time
import threading
import json
import urllib.request
from flask import Flask, render_template_string, request, redirect, url_for

app = Flask(__name__)

# --- DATABASE SETUP ---
DB_FILE = "hub.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS community_deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            deal_url TEXT NOT NULL,
            clicks INTEGER DEFAULT 0
        )
    ''')
    try:
        cursor.execute("ALTER TABLE community_deals ADD COLUMN clicks INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

init_db()

# --- AUTOMATED SEEDER AGENT ---
def auto_seeder_agent():
    """
    Runs continuously in a background thread.
    Fetches trending UK/Global deals every hour and populates hub.db automatically.
    Uses built-in urllib to avoid external dependency requirements.
    """
    print("🤖 Auto-Seeder Agent initialized and running...")
    
    # Curated backup seed pool to guarantee initial content
    seed_pool = [
        ("Trading212 - Free Share up to £100", "Banking & Finance", "https://www.trading212.com/"),
        ("TopCashback - £10 Sign Up Bonus", "Cashback & Rewards", "https://www.topcashback.co.uk/"),
        ("Revolut - Instant Digital Account & Cards", "Banking & Finance", "https://www.revolut.com/"),
        ("Amazon UK - Daily Lightning Deals", "Tech & Deals", "https://www.amazon.co.uk/gp/goldbox")
    ]
    
    while True:
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # 1. Seed base pool if database has missing entries
            for title, category, url in seed_pool:
                cursor.execute("SELECT id FROM community_deals WHERE title = ?", (title,))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
                        (title, category, url)
                    )
                    print(f"🤖 Auto-Seeder: Added '{title}' to hub database.")
            conn.commit()

            # 2. Fetch live public deals feed (Reddit API - r/beermoneyuk) using built-in urllib
            url_endpoint = "https://www.reddit.com/r/beermoneyuk/hot.json?limit=5"
            req = urllib.request.Request(url_endpoint, headers={"User-Agent": "ThreeMonkeysHub/1.0"})
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    title = post_data.get("title", "")[:80] # Truncate title
                    deal_link = post_data.get("url", "")
                    
                    # Filter for valid external links and skip internal discussion threads
                    if deal_link and "reddit.com" not in deal_link and title:
                        cursor.execute("SELECT id FROM community_deals WHERE deal_url = ?", (deal_link,))
                        if not cursor.fetchone():
                            cursor.execute(
                                "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
                                (title, "Banking & Finance", deal_link)
                            )
                            print(f"🤖 Auto-Seeder: Scraped & Published -> '{title}'")
                            conn.commit()

            conn.close()
        except Exception as e:
            print(f"⚠️ Auto-Seeder Agent warning: {e}")
            
        # Sleep for 1 hour before checking for new deals again
        time.sleep(3600)

# Start Auto-Seeder Agent in a separate background thread
seeder_thread = threading.Thread(target=auto_seeder_agent, daemon=True)
seeder_thread.start()

# --- STOREFRONT HTML TEMPLATE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Monkeys - Community Deals Hub</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; }
        h1 { text-align: center; color: #0f172a; margin-bottom: 24px; }
        .card { background: #ffffff; padding: 24px; margin-bottom: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .featured { border: 2px solid #3b82f6; background: #eff6ff; }
        .btn { display: inline-block; width: 100%; text-align: center; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; box-sizing: border-box; }
        .btn:hover { background: #1d4ed8; }
        form { display: flex; flex-direction: column; gap: 12px; }
        label { font-weight: 600; font-size: 0.9rem; color: #334155; }
        form input, form select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; }
        .click-badge { display: inline-block; margin-top: 6px; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.825em; font-weight: 600; }
        .bot-badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; font-weight: bold; margin-left: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Three Monkeys Hub 🐒</h1>
        
        <!-- FEATURED MONZO OFFER -->
        <div class="card featured">
            <h2>🔥 Featured Partner Offer: Monzo</h2>
            <p>Sign up for Monzo today using our official link and get your instant welcome bonus cash reward!</p>
            <a href="https://join.monzo.com/c/wq24nrr2" target="_blank" class="btn">Claim Monzo Bonus</a>
        </div>

        <!-- COMMUNITY SUBMISSION FORM -->
        <div class="card">
            <h2>🚀 Add Your Deal / Link</h2>
            <p>Post your deal or referral link to our open community hub!</p>
            <form action="/submit" method="POST">
                <label>Offer Title / App Name:</label>
                <input type="text" name="title" placeholder="e.g., Free Stock on Robinhood" required>
                
                <label>Category:</label>
                <select name="category">
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Cashback & Rewards">Cashback & Rewards</option>
                    <option value="Tech & Deals">Tech & Deals</option>
                    <option value="Other">Other</option>
                </select>

                <label>Your Referral / Deal Link:</label>
                <input type="url" name="deal_url" placeholder="https://..." required>

                <button type="submit" class="btn">Publish Deal To Hub</button>
            </form>
        </div>

        <!-- LIVE COMMUNITY DEALS LIST -->
        <div class="card">
            <h2>🌐 Live Community Deals <span class="bot-badge">🤖 Auto-Updated 24/7</span></h2>
            {% if deals %}
                <ul style="list-style: none; padding: 0;">
                {% for deal in deals %}
                    <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                        <strong>[{{ deal[2] }}] {{ deal[1] }}</strong><br>
                        <span class="click-badge">🔥 {{ deal[4] }} clicks routed</span><br><br>
                        <a href="/redirect/{{ deal[0] }}" target="_blank" class="btn" style="background: #0066cc;">Visit Deal →</a>
                    </li>
                {% endfor %}
                </ul>
            {% else %}
                <p>Fetching automated deals... Refresh in a few seconds!</p>
            {% endif %}
        </div>
    </div>
</body>
</html>
"""

# --- ROUTES ---
@app.route("/")
def home():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM community_deals ORDER BY id DESC")
    deals = cursor.fetchall()
    conn.close()
    return render_template_string(HTML_TEMPLATE, deals=deals)

@app.route("/submit", methods=["POST"])
def submit_deal():
    title = request.form.get("title")
    category = request.form.get("category")
    deal_url = request.form.get("deal_url")

    if title and deal_url:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)", 
                       (title, category, deal_url))
        conn.commit()
        conn.close()

    return redirect(url_for("home"))

@app.route("/redirect/<int:deal_id>")
def track_and_redirect(deal_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("SELECT deal_url FROM community_deals WHERE id = ?", (deal_id,))
    result = cursor.fetchone()
    
    if result:
        cursor.execute("UPDATE community_deals SET clicks = clicks + 1 WHERE id = ?", (deal_id,))
        conn.commit()
        conn.close()
        return redirect(result[0])
    
    conn.close()
    return redirect(url_for("home"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
