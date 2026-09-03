import os
import sqlite3
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
            deal_url TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- STOREFRONT HTML TEMPLATE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Monkeys - Community Deals Hub</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; color: #111; }
        .card { background: #fff; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .featured { border: 2px solid #ff4d4d; background: #fff8f8; }
        .btn { display: inline-block; background: #ff4d4d; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; border: none; cursor: pointer; }
        .btn:hover { background: #e03e3e; }
        form input, form select { width: 100%; padding: 10px; margin: 8px 0 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
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
            <h2>🌐 Live Community Deals</h2>
            {% if deals %}
                <ul>
                {% for deal in deals %}
                    <li style="margin-bottom: 15px;">
                        <strong>[{{ deal[2] }}] {{ deal[1] }}</strong><br>
                        <a href="{{ deal[3] }}" target="_blank" style="color: #0066cc;">Visit Deal →</a>
                    </li>
                {% endfor %}
                </ul>
            {% else %}
                <p>No community deals posted yet. Be the first to add one above!</p>
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
        cursor.execute("INSERT INTO community_deals (title, category, deal_url) VALUES (?, ?, ?)", 
                       (title, category, deal_url))
        conn.commit()
        conn.close()

    return redirect(url_for("home"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
