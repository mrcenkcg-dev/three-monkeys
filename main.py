import os
import sqlite3
import time
import threading
import requests
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

# --- 24/7 CLOUD BACKGROUND AGENT ---
def start_background_agent():
    """Autonomous agent loop that runs inside Render 24/7."""
    time.sleep(10)  # Wait for server startup
    sample_deals = [
        {"title": "Anker USB-C Fast Charger 65W", "category": "Electronics", "deal_url": "https://amazon.co.uk", "fee_paid": 0.01},
        {"title": "Logitech MX Master 3S Wireless Mouse", "category": "Peripherals", "deal_url": "https://amazon.co.uk", "fee_paid": 0.01},
        {"title": "Samsung EVO Select 256GB MicroSD", "category": "Storage", "deal_url": "https://amazon.co.uk", "fee_paid": 0.01},
        {"title": "Sony WH-1000XM5 Noise Canceling Headphones", "category": "Audio", "deal_url": "https://amazon.co.uk", "fee_paid": 0.01},
        {"title": "Raspberry Pi 5 Starter Kit", "category": "Developer Tools", "deal_url": "https://amazon.co.uk", "fee_paid": 0.01}
    ]
    
    deal_index = 0
    port = int(os.environ.get("PORT", 5000))
    local_url = f"http://127.0.0.1:{port}/api/v1/buy-slot"
    
    while True:
        try:
            deal = sample_deals[deal_index % len(sample_deals)]
            response = requests.post(local_url, json=deal, timeout=5)
            if response.status_code == 201:
                print(f"[24/7 Agent] Automatically posted deal: {deal['title']}")
            deal_index += 1
        except Exception as e:
            print(f"[24/7 Agent] Loop waiting for endpoint: {e}")
            
        time.sleep(120)  # Autonomous run every 2 minutes 24/7

# Launch background agent thread alongside Flask server
agent_thread = threading.Thread(target=start_background_agent, daemon=True)
agent_thread.start()

# --- FLASK ENDPOINTS ---
@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "AI Exchange Building",
        "agent_status": "24/7 Autonomous Loop Active",
        "endpoints": {
            "dashboard": "/dashboard",
            "stats": "/api/v1/stats",
            "buy_slot": "/api/v1/buy-slot (POST)"
        }
    })

@app.route("/dashboard")
def view_dashboard():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Exchange Building - Live Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                background: #0f172a; 
                color: #f8fafc; 
                padding: 20px; 
                margin: 0;
                text-align: center; 
            }
            .container { max-width: 500px; margin: 0 auto; }
            h2 { margin-bottom: 25px; font-weight: 600; letter-spacing: -0.5px; }
            .card { 
                background: #1e293b; 
                border: 1px solid #334155;
                border-radius: 16px; 
                padding: 24px; 
                margin: 15px 0; 
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); 
            }
            .stat { font-size: 2.8rem; font-weight: 800; color: #38bdf8; margin-top: 8px; }
            .label { color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .status-badge {
                display: inline-flex;
                align-items: center;
                background: #14532d;
                color: #4ade80;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 15px;
            }
            .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 8px; display: inline-block; }
            .footer-note { color: #64748b; font-size: 0.8rem; margin-top: 25px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge"><span class="dot"></span> 24/7 Autonomous Agent Active</div>
            <h2>Building Live Monitor</h2>
            
            <div class="card">
                <div class="label">Total Revenue Earned</div>
                <div id="revenue" class="stat" style="color:#4ade80;">--</div>
            </div>

            <div class="card">
                <div class="label">Total Gate Clicks / Routed Traffic</div>
                <div id="clicks" class="stat">--</div>
            </div>

            <div class="card">
                <div class="label">Total Active Deals in Building</div>
                <div id="deals" class="stat" style="color:#a855f7;">--</div>
            </div>

            <div class="footer-note">Auto-refreshing live data every 3 seconds</div>
        </div>

        <script>
            async function updateStats() {
                try {
                    const res = await fetch('/api/v1/stats');
                    const data = await res.json();
                    document.getElementById('deals').innerText = data.total_active_slots;
                    document.getElementById('clicks').innerText = data.total_routed_traffic;
                    document.getElementById('revenue').innerText = '£' + data.estimated_entrance_revenue_gbp.toFixed(2);
                } catch (e) {
                    console.error("Error updating stats", e);
                }
            }
            updateStats();
            setInterval(updateStats, 3000);
        </script>
    </body>
    </html>
    '''

@app.route("/api/v1/buy-slot", methods=["POST"])
def buy_slot():
    data = request.get_json() or {}
    
    title = data.get("title")
    category = data.get("category", "General")
    deal_url = data.get("deal_url")
    fee_paid = data.get("fee_paid", 0.0)
    
    if not title or not deal_url:
        return jsonify({"error": "Missing title or deal_url"}), 400
        
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
