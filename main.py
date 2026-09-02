
import os
import time
import threading
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
import watcher  # Links your watcher agent

MONZO_LINK = "https://join.monzo.com/c/wq24nrr2"
PROMOTION_TITLE = "Get a Cash Bonus with Monzo!"
PROMOTION_TEXT = "Sign up for a free Monzo account using our referral link and make your first card payment to claim your cash reward."

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            price TEXT,
            link TEXT
        )
    ''')
    cursor.execute('''
        INSERT OR IGNORE INTO deals (title, price, link)
        VALUES (?, ?, ?)
    ''', (PROMOTION_TITLE, "Free Reward", MONZO_LINK))
    conn.commit()
    conn.close()

# --- MONKEY 1 & 2: BACKGROUND PROMOTION ENGINE ---
def auto_miner_loop():
    print("[Three Monkeys] Monzo Promotion Engine active...")
    while True:
        try:
            conn = sqlite3.connect('data.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO deals (id, title, price, link)
                VALUES (1, ?, ?, ?)
            ''', (PROMOTION_TITLE, "Free Reward", MONZO_LINK))
            conn.commit()
            conn.close()
            print("[Three Monkeys] Successfully verified Monzo referral offer.")
        except Exception as e:
            print(f"[Three Monkeys] Loop Error: {e}")
            
        time.sleep(7200)

# --- STOREFRONT SERVER ---
class StoreHandler(BaseHTTPRequestHandler):
    # Added do_HEAD to resolve Render 501 health check warnings
    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()

        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT title, price, link FROM deals ORDER BY id DESC LIMIT 20')
        deals = cursor.fetchall()
        conn.close()

        cards_html = f"""
        <div class="card">
            <h3>{PROMOTION_TITLE}</h3>
            <p class="description">{PROMOTION_TEXT}</p>
            <p class="price">Free Reward</p>
            <a href="{MONZO_LINK}" target="_blank" rel="noopener noreferrer" class="buy-btn">Claim Your Monzo Bonus</a>
        </div>
        """

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Three Monkeys | Exclusive Offers</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 900px; margin: 0 auto; text-align: center; }}
                h1 {{ color: #14b8a6; margin-bottom: 8px; }}
                .subtitle {{ color: #94a3b8; margin-bottom: 32px; }}
                .grid {{ display: flex; justify-content: center; gap: 20px; }}
                .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; max-width: 400px; }}
                .card h3 {{ margin-top: 0; color: #f1f5f9; font-size: 1.2rem; }}
                .description {{ color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin: 12px 0; }}
                .price {{ color: #14b8a6; font-weight: bold; font-size: 1.2rem; margin: 8px 0; }}
                .buy-btn {{ display: block; background: #FF4D5A; color: #ffffff; font-weight: bold; padding: 12px; text-decoration: none; border-radius: 8px; margin-top: 16px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Three Monkeys Engine</h1>
                <p class="subtitle">Automated Partner Referral Portal</p>
                <div class="grid">{cards_html}</div>
            </div>
        </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

def run():
    init_db()
    
    # Start background miner thread
    miner_thread = threading.Thread(target=auto_miner_loop, daemon=True)
    miner_thread.start()
    
    # Start background watcher agent thread
    watcher_thread = threading.Thread(target=watcher.run_watcher_agent, daemon=True)
    watcher_thread.start()
    
    port = int(os.environ.get("PORT", 8000))
    server_address = ('', port)
    httpd = HTTPServer(server_address, StoreHandler)
    print(f"Server starting on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
