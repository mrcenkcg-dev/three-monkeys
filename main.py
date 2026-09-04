import os
import sqlite3
from flask import Flask, jsonify, request, redirect

app = Flask(__name__)

DATABASE = "deals.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
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
    conn.close()

# Initialize DB on startup
init_db()

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "AI Exchange Building",
        "endpoints": {
            "stats": "/api/v1/stats",
            "buy_slot": "/api/v1/buy-slot (POST)"
        }
    })

@app.route("/api/v1/buy-slot", methods=["POST"])
def buy_slot():
    data = request.get_json() or {}
    
    title = data.get("title")
    category = data.get("category", "General")
    deal_url = data.get("deal_url")
    fee_paid = data.get("fee_paid", 0.0)
    
    if not title or not deal_url:
        return jsonify({"error": "Missing title or deal_url"}), 400
        
    # Enforce minimum 1p (0.01) micro-toll
    if float(fee_paid) < 0.01:
        return jsonify({
            "error": "Payment insufficient",
            "required_min_fee": 0.01,
            "provided_fee": fee_paid
        }), 402

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO community_deals (title, category, deal_url, clicks) VALUES (?, ?, ?, 0)",
        (title, category, deal_url)
    )
    deal_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Slot successfully purchased and published",
        "deal_id": deal_id,
        "fee_accepted": fee_paid,
        "redirect_endpoint": f"/r/{deal_id}"
    }), 201

@app.route("/r/<int:deal_id>")
def track_and_redirect(deal_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT deal_url, clicks FROM community_deals WHERE id = ?", (deal_id,))
    deal = cursor.fetchone()
    
    if not deal:
        conn.close()
        return jsonify({"error": "Deal not found"}), 404
        
    cursor.execute("UPDATE community_deals SET clicks = clicks + 1 WHERE id = ?", (deal_id,))
    conn.commit()
    conn.close()
    
    return redirect(deal["deal_url"])

@app.route("/api/v1/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*), SUM(clicks) FROM community_deals")
    row = cursor.fetchone()
    
    total_deals = row[0] or 0
    total_clicks = row[1] or 0
    estimated_revenue_gbp = total_deals * 0.01
    
    conn.close()
    
    return jsonify({
        "status": "active",
        "total_active_slots": total_deals,
        "total_routed_traffic": total_clicks,
        "estimated_entrance_revenue_gbp": round(estimated_revenue_gbp, 2),
        "currency": "GBP"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
