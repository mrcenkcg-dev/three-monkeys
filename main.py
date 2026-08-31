
import os
import subprocess
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Retrieve Amazon tag from environment variable
AMAZON_TAG = os.environ.get("AMAZON_TAG", "mrcenk20-21")

# Curated products showcase
PRODUCTS = [
    {
        "title": "Wireless Noise Cancelling Headphones",
        "asin": "B08N5WRWNW",
        "img": "https://m.media-amazon.com/images/I/61+hb70vC6L._AC_SL1500_.jpg"
    },
    {
        "title": "Mechanical Gaming Keyboard",
        "asin": "B08C69F3NQ",
        "img": "https://m.media-amazon.com/images/I/71cngLX2xaL._AC_SL1500_.jpg"
    },
    {
        "title": "Ultra-Wide Gaming Monitor",
        "asin": "B095J68CKG",
        "img": "https://m.media-amazon.com/images/I/81T3v76wZ1L._AC_SL1500_.jpg"
    }
]

class WebAndHealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Health check endpoint for lightweight monitoring (cron-job.org)
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", "2")
            self.end_headers()
            self.wfile.write(b"OK")
            return

        # Main landing page: Amazon Deals Storefront
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        cards_html = ""
        for item in PRODUCTS:
            affiliate_url = f"https://www.amazon.co.uk/dp/{item['asin']}?tag={AMAZON_TAG}"
            cards_html += f"""
            <div style="border:1px solid #e0e0e0; border-radius:12px; padding:16px; margin:16px 0; background:#fff; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <img src="{item['img']}" alt="{item['title']}" style="max-width:180px; height:auto; border-radius:8px; margin-bottom:12px;">
                <h3 style="font-size:1.1rem; color:#333; margin:8px 0;">{item['title']}</h3>
                <a href="{affiliate_url}" target="_blank" style="display:inline-block; background:#ffd814; color:#111; padding:10px 20px; border-radius:20px; text-decoration:none; font-weight:bold; margin-top:8px; border:1px solid #fcd200;">
                    View Deal on Amazon &rarr;
                </a>
            </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Curated Tech Deals</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f7f9fa; max-width:600px; margin:0 auto; padding:20px;">
            <header style="text-align:center; margin-bottom:24px;">
                <h1 style="color:#111; margin-bottom:4px;">🔥 Top Tech Deals</h1>
                <p style="color:#666; font-size:0.95rem;">Handpicked tech deals refreshed daily.</p>
            </header>
            <main>
                {cards_html}
            </main>
            <footer style="text-align:center; margin-top:32px; font-size:0.75rem; color:#888;">
                <p>As an Amazon Associate, I earn from qualifying purchases.</p>
            </footer>
        </body>
        </html>
        """
        self.wfile.write(html_content.encode('utf-8'))

    def log_message(self, format, *args):
        return  # Keep console logs clean

def run_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), WebAndHealthHandler)
    server.serve_forever()

# 1. Start Web Server in background thread
threading.Thread(target=run_server, daemon=True).start()

# 2. Initialize DB schema
subprocess.run(["python", "database.py"])

# 3. Launch sub-processes (Monkey Court)
watcher = subprocess.Popen(["python", "watcher.py"])
miner = subprocess.Popen(["python", "miner.py"])
cleaner = subprocess.Popen(["python", "cleaner.py"])

print("All 3 Monkey Court agents and Web Storefront successfully online!")

# 4. Main loop watchdog
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    watcher.terminate()
    miner.terminate()
    cleaner.terminate()
