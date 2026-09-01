import os
import time
import threading
import sqlite3
import urllib.request
import xml.etree.ElementTree as ET
from http.server import HTTPServer, BaseHTTPRequestHandler

AFFILIATE_TAG = "mrcenk20-21"

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
    conn.commit()
    conn.close()

# --- MONKEY 1 & 2: MINER & CLEANER (BACKGROUND WORKER) ---
def auto_miner_loop():
    """Runs continuously in the background fetching and cleaning Amazon deals."""
    print("[Three Monkeys] Background Miner & Cleaner active...")
    while True:
        try:
            # Fetch tech deal feed (Amazon UK Tech RSS / Deal Feed)
            feed_url = "https://www.amazon.co.uk/gp/rss/bestsellers/computers/ref=zg_bs_computers_rss_link"
            req = urllib.request.Request(feed_url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)
                
                conn = sqlite3.connect('data.db')
                cursor = conn.cursor()
                
                for item in root.findall('.//item'):
                    title = item.find('title').text if item.find('title') is not None else "Tech Deal"
                    raw_link = item.find('link').text if item.find('link') is not None else ""
                    
                    if raw_link:
                        # CLEANER AGENT: Strip tracking & inject mrcenk20-21
                        clean_link = raw_link.split('?')[0] + f"?tag={AFFILIATE_TAG}"
                        
                        # Store in DB (Ignore duplicates)
                        cursor.execute('''
                            INSERT OR IGNORE INTO deals (title, price, link)
                            VALUES (?, ?, ?)
                        ''', (title, "Check Amazon UK", clean_link))
                
                conn.commit()
                conn.close()
                print("[Three Monkeys] Successfully mined and updated latest deals.")
        except Exception as e:
            print(f"[Three Monkeys] Miner Loop Error: {e}")
            
        # Run every 2 hours
        time.sleep(7200)

# --- STOREFRONT SERVER ---
class StoreHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()

        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT title, price, link FROM deals ORDER BY id DESC LIMIT 20')
        deals = cursor.fetchall()
        conn.close()

        cards_html = ""
        if not deals:
            cards_html = """
            <div class="card">
                <h3>System Initializing...</h3>
                <p>The Monkeys are currently scanning Amazon UK for live deals. Check back in a few minutes!</p>
            </div>
            """
        else:
            for title, price, link in deals:
                cards_html += f"""
                <div class="card">
                    <h3>{title}</h3>
                    <p class="price">{price}</p>
                    <a href="{link}" target="_blank" rel="noopener noreferrer" class="buy-btn">View Deal on Amazon UK</a>
                </div>
                """

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Three Monkeys | Automated Tech Deals</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 900px; margin: 0 auto; text-align: center; }}
                h1 {{ color: #38bdf8; margin-bottom: 8px; }}
                .subtitle {{ color: #94a3b8; margin-bottom: 32px; }}
                .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }}
                .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: left; display: flex; flex-direction: column; justify-content: space-between; }}
                .card h3 {{ margin-top: 0; color: #f1f5f9; font-size: 1rem; line-height: 1.4; }}
                .price {{ color: #38bdf8; font-weight: bold; font-size: 1.1rem; margin: 8px 0; }}
                .buy-btn {{ display: block; background: #f59e0b; color: #0f172a; font-weight: bold; padding: 10px; text-decoration: none; border-radius: 8px; margin-top: 12px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Three Monkeys Automated Deals</h1>
                <p class="subtitle">24/7 Autonomous Amazon UK Tech Scanner</p>
                <div class="grid">{cards_html}</div>
            </div>
        </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

def run():
    init_db()
    
    # Start the automated miner in a background thread
    miner_thread = threading.Thread(target=auto_miner_loop, daemon=True)
    miner_thread.start()
    
    port = int(os.environ.get("PORT", 8000))
    server_address = ('', port)
    httpd = HTTPServer(server_address, StoreHandler)
    print(f"Server starting on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
