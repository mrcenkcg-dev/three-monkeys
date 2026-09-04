import os
import sqlite3
import timethree-monkeys
/main.py
Go to filedef init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Enable WAL mode so multi-threaded AI agents don't lock SQLite
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA busy_timeout=5000;")
    
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
    conn.close()t
T
mrcenkcg-dev
mrcenkcg-dev
Implement M2M stats API and enhance comments
792a421
 · 
37 minutes ago
three-monkeys
/main.py

Code

Blame
340 lines (286 loc) · 13.3 KB
def track_and_redirect(deal_id):
import os
import sqlite3
import time
import threading
import json
import urllib.request
from flask import Flask, render_template_string, request, redirect, url_for, jsonify

app = Flask(__name__)

# --- DATABASE SETUP ---
DB_FILE = "hub.db"

def get_db():
    # Adding timeout=20 prevents 'database is locked' errors with multi-threaded agents
    return sqlite3.connect(DB_FILE, timeout=20)

def init_db():
    conn = get_db()
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

# --- M2M LIVE STATS & MONITORING DASHBOARD API ---
@app.route("/api/v1/stats", methods=["GET"])
def api_m2m_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Total slot listings (Check-Ins)
    cursor.execute("SELECT COUNT(*) FROM community_deals")
    total_slots = cursor.fetchone()[0]
    
    # 2. Total outbound routing clicks (Check-Outs)
    cursor.execute("SELECT SUM(clicks) FROM community_deals")
    total_clicks = cursor.fetchone()[0] or 0
    
    # 3. Calculate estimated 1p micro-fee earnings (0.01 GBP per slot)
    estimated_revenue_gbp = total_slots * 0.01

    conn.close()

    return jsonify({
        "status": "online",
        "market_mode": "M2M_AI_BOT_HUB",
        "total_active_slots": total_slots,
        "total_clicks_routed": total_clicks,
        "estimated_microfee_earnings_gbp": round(estimated_revenue_gbp, 2),
        "timestamp": time.time()
    }), 200

# --- PUBLIC M2M API GATEWAY FOR EXTERNAL AI BOTS ---
@app.route("/api/v1/buy-slot", methods=["POST"])
@app.route("/api/v1/submit", methods=["POST"])
def api_buy_slot():
    data = request.get_json(silent=True) or {}
    
    title = data.get("title")
    category = data.get("category", "Tech & Deals")
    deal_url = data.get("deal_url") or data.get("advert_url")
    fee_paid = data.get("fee_paid", 0.01)

    if not title or not deal_url:
        return jsonify({
            "status": "error",
            "message": "Missing required parameters. 'title' and 'deal_url' are required."
        }), 400

    try:
        if float(fee_paid) < 0.01:
            return jsonify({
                "status": "error", 
                "message": "Minimum 1p micro-fee (0.01) required."
            }), 402
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid fee_paid format."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
        (title, category, deal_url)
    )
    deal_id = cursor.lastrowid
    conn.commit()
    conn.close()

    print(f"🤖 Public API: External AI Bot bought slot #{deal_id} for '{title}'")

    return jsonify({
        "status": "success",
        "message": "Ad slot purchased and published live to billboard",
        "deal_id": deal_id,
        "fee_received": fee_paid,
        "live_url": f"https://free-monkey-system.onrender.com/redirect/{deal_id}"
    }), 201

# --- AUTOMATED SEEDER AGENT ---
def auto_seeder_agent():
    print("🤖 Auto-Seeder Agent initialized and running...")
    
    seed_pool = [
        ("Trading212 - Free Share up to £100", "Banking & Finance", "https://www.trading212.com/"),
        ("TopCashback - £10 Sign Up Bonus", "Cashback & Rewards", "https://www.topcashback.co.uk/"),
        ("Revolut - Instant Digital Account & Cards", "Banking & Finance", "https://www.revolut.com/"),
        ("Amazon UK - Daily Lightning Deals", "Tech & Deals", "https://www.amazon.co.uk/gp/goldbox")
    ]
    
    while True:
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            for title, category, url in seed_pool:
                cursor.execute("SELECT id FROM community_deals WHERE title = ?", (title,))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
                        (title, category, url)
                    )
                    print(f"🤖 Auto-Seeder: Added '{title}' to hub database.")
            conn.commit()

            url_endpoint = "https://www.reddit.com/r/beermoneyuk/hot.json?limit=5"
            req = urllib.request.Request(url_endpoint, headers={"User-Agent": "ThreeMonkeysHub/1.0"})
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    title = post_data.get("title", "")[:80]
                    deal_link = post_data.get("url", "")
                    
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
            
        time.sleep(3600)

# --- AUTOMATED POSTER AGENT ---
def auto_poster_agent():
    print("📣 Auto-Poster Traffic Agent initialized and running...")
    HUB_URL = "https://free-monkey-system.onrender.com"
    WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")

    while True:
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, title, category, clicks FROM community_deals ORDER BY clicks DESC, id DESC LIMIT 3")
            deals = cursor.fetchall()
            conn.close()

            if deals:
                featured = deals[0]
                teaser_message = (
                    f"🔥 **HOT DEAL TEASER** 🔥\n\n"
                    f"👉 **{featured[1]}** [{featured[2]}]\n"
                    f"📈 {featured[3]} clicks routed so far!\n\n"
                    f"Claim this deal & share yours for free at:\n"
                    f"🌐 {HUB_URL}"
                )
                
                print("\n==========================================")
                print("📣 Auto-Poster generated new promo payload:")
                print(teaser_message)
                print("==========================================\n")

                if WEBHOOK_URL:
                    payload = json.dumps({"content": teaser_message}).encode("utf-8")
                    req = urllib.request.Request(
                        WEBHOOK_URL, 
                        data=payload, 
                        headers={"Content-Type": "application/json", "User-Agent": "ThreeMonkeysHub/1.0"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        print("✅ Auto-Poster: Promo payload successfully dispatched!")

        except Exception as e:
            print(f"⚠️ Auto-Poster Agent warning: {e}")

        time.sleep(7200)

# Start background agents
seeder_thread = threading.Thread(target=auto_seeder_agent, daemon=True)
seeder_thread.start()

poster_thread = threading.Thread(target=auto_poster_agent, daemon=True)
poster_thread.start()

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
        
        <div class="card featured">
            <h2>🔥 Featured Partner Offer: Monzo</h2>
            <p>Sign up for Monzo today using our official link and get your instant welcome bonus cash reward!</p>
            <a href="https://join.monzo.com/c/wq24nrr2" target="_blank" class="btn">Claim Monzo Bonus</a>
        </div>

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

# --- WEB ROUTES ---
@app.route("/")
def home():
    conn = get_db()
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
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)", 
                       (title, category, deal_url))
        conn.commit()
        conn.close()

    return redirect(url_for("home"))

@app.route("/redirect/<int:deal_id>")
def track_and_redirect(deal_id):
    conn = get_db()
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
import threading
import json
import urllib.request
from flask import Flask, render_template_string, request, redirect, url_for, jsonify

app = Flask(__name__)

# --- DATABASE SETUP ---
DB_FILE = "hub.db"

def get_db():
    # Adding timeout=20 prevents 'database is locked' errors with multi-threaded agents
    return sqlite3.connect(DB_FILE, timeout=20)

def init_db():
    conn = get_db()
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

# --- M2M LIVE STATS & MONITORING DASHBOARD API ---
@app.route("/api/v1/stats", methods=["GET"])
def api_m2m_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Total slot listings (Check-Ins)
    cursor.execute("SELECT COUNT(*) FROM community_deals")
    total_slots = cursor.fetchone()[0]
    
    # 2. Total outbound routing clicks (Check-Outs)
    cursor.execute("SELECT SUM(clicks) FROM community_deals")
    total_clicks = cursor.fetchone()[0] or 0
    
    # 3. Calculate estimated 1p micro-fee earnings (0.01 GBP per slot)
    estimated_revenue_gbp = total_slots * 0.01

    conn.close()

    return jsonify({
        "status": "online",
        "market_mode": "M2M_AI_BOT_HUB",
        "total_active_slots": total_slots,
        "total_clicks_routed": total_clicks,
        "estimated_microfee_earnings_gbp": round(estimated_revenue_gbp, 2),
        "timestamp": time.time()
    }), 200

# --- PUBLIC M2M API GATEWAY FOR EXTERNAL AI BOTS ---
@app.route("/api/v1/buy-slot", methods=["POST"])
@app.route("/api/v1/submit", methods=["POST"])
def api_buy_slot():
    data = request.get_json(silent=True) or {}
    
    title = data.get("title")
    category = data.get("category", "Tech & Deals")
    deal_url = data.get("deal_url") or data.get("advert_url")
    fee_paid = data.get("fee_paid", 0.01)

    if not title or not deal_url:
        return jsonify({
            "status": "error",
            "message": "Missing required parameters. 'title' and 'deal_url' are required."
        }), 400

    try:
        if float(fee_paid) < 0.01:
            return jsonify({
                "status": "error", 
                "message": "Minimum 1p micro-fee (0.01) required."
            }), 402
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid fee_paid format."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
        (title, category, deal_url)
    )
    deal_id = cursor.lastrowid
    conn.commit()
    conn.close()

    print(f"🤖 Public API: External AI Bot bought slot #{deal_id} for '{title}'")

    return jsonify({
        "status": "success",
        "message": "Ad slot purchased and published live to billboard",
        "deal_id": deal_id,
        "fee_received": fee_paid,
        "live_url": f"https://free-monkey-system.onrender.com/redirect/{deal_id}"
    }), 201

# --- AUTOMATED SEEDER AGENT ---
def auto_seeder_agent():
    print("🤖 Auto-Seeder Agent initialized and running...")
    
    seed_pool = [
        ("Trading212 - Free Share up to £100", "Banking & Finance", "https://www.trading212.com/"),
        ("TopCashback - £10 Sign Up Bonus", "Cashback & Rewards", "https://www.topcashback.co.uk/"),
        ("Revolut - Instant Digital Account & Cards", "Banking & Finance", "https://www.revolut.com/"),
        ("Amazon UK - Daily Lightning Deals", "Tech & Deals", "https://www.amazon.co.uk/gp/goldbox")
    ]
    
    while True:
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            for title, category, url in seed_pool:
                cursor.execute("SELECT id FROM community_deals WHERE title = ?", (title,))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
                        (title, category, url)
                    )
                    print(f"🤖 Auto-Seeder: Added '{title}' to hub database.")
            conn.commit()

            url_endpoint = "https://www.reddit.com/r/beermoneyuk/hot.json?limit=5"
            req = urllib.request.Request(url_endpoint, headers={"User-Agent": "ThreeMonkeysHub/1.0"})
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    title = post_data.get("title", "")[:80]
                    deal_link = post_data.get("url", "")
                    
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
            
        time.sleep(3600)

# --- AUTOMATED POSTER AGENT ---
def auto_poster_agent():
    print("📣 Auto-Poster Traffic Agent initialized and running...")
    HUB_URL = "https://free-monkey-system.onrender.com"
    WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")

    while True:
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, title, category, clicks FROM community_deals ORDER BY clicks DESC, id DESC LIMIT 3")
            deals = cursor.fetchall()
            conn.close()

            if deals:
                featured = deals[0]
                teaser_message = (
                    f"🔥 **HOT DEAL TEASER** 🔥\n\n"
                    f"👉 **{featured[1]}** [{featured[2]}]\n"
                    f"📈 {featured[3]} clicks routed so far!\n\n"
                    f"Claim this deal & share yours for free at:\n"
                    f"🌐 {HUB_URL}"
                )
                
                print("\n==========================================")
                print("📣 Auto-Poster generated new promo payload:")
                print(teaser_message)
                print("==========================================\n")

                if WEBHOOK_URL:
                    payload = json.dumps({"content": teaser_message}).encode("utf-8")
                    req = urllib.request.Request(
                        WEBHOOK_URL, 
                        data=payload, 
                        headers={"Content-Type": "application/json", "User-Agent": "ThreeMonkeysHub/1.0"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        print("✅ Auto-Poster: Promo payload successfully dispatched!")

        except Exception as e:
            print(f"⚠️ Auto-Poster Agent warning: {e}")

        time.sleep(7200)

# Start background agents
seeder_thread = threading.Thread(target=auto_seeder_agent, daemon=True)
seeder_thread.start()

poster_thread = threading.Thread(target=auto_poster_agent, daemon=True)
poster_thread.start()

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
        
        <div class="card featured">
            <h2>🔥 Featured Partner Offer: Monzo</h2>
            <p>Sign up for Monzo today using our official link and get your instant welcome bonus cash reward!</p>
            <a href="https://join.monzo.com/c/wq24nrr2" target="_blank" class="btn">Claim Monzo Bonus</a>
        </div>

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

# --- WEB ROUTES ---
@app.route("/")
def home():
    conn = get_db()
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
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)", 
                       (title, category, deal_url))
        conn.commit()
        conn.close()

    return redirect(url_for("home"))

@app.route("/redirect/<int:deal_id>")
def track_and_redirect(deal_id):
    conn = get_db()
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
