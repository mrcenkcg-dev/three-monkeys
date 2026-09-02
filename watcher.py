
import os
import time
import sqlite3
import requests

# --- CONFIGURATION & API KEYS ---
# Add your API credentials to Environment Variables in Render or paste directly
FACEBOOK_PAGE_ID = os.environ.get("FACEBOOK_PAGE_ID", "YOUR_FB_PAGE_ID")
FACEBOOK_ACCESS_TOKEN = os.environ.get("FACEBOOK_ACCESS_TOKEN", "YOUR_FB_ACCESS_TOKEN")

YOUTUBE_CLIENT_ID = os.environ.get("YOUTUBE_CLIENT_ID", "YOUR_YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET = os.environ.get("YOUTUBE_CLIENT_SECRET", "YOUR_YOUTUBE_CLIENT_SECRET")

TIKTOK_ACCESS_TOKEN = os.environ.get("TIKTOK_ACCESS_TOKEN", "YOUR_TIKTOK_ACCESS_TOKEN")

# --- SOCIAL MEDIA API INTEGRATIONS ---

def post_to_facebook(message, link):
    """Posts text and referral link to Facebook Page via Graph API."""
    print("[Watcher Agent] Attempting Facebook post...")
    url = f"https://graph.facebook.com/v18.0/{FACEBOOK_PAGE_ID}/feed"
    payload = {
        "message": f"{message}\n\nClaim here: {link}",
        "access_token": FACEBOOK_ACCESS_TOKEN
    }
    
    # Placeholder for active request
    if FACEBOOK_ACCESS_TOKEN != "YOUR_FB_ACCESS_TOKEN":
        try:
            res = requests.post(url, data=payload)
            print(f"[Watcher Agent] Facebook Response: {res.status_code}")
        except Exception as e:
            print(f"[Watcher Agent] Facebook Post Error: {e}")
    else:
        print("[Watcher Agent] Skipping Facebook - API token missing.")


def post_to_youtube_shorts(video_path, title, description):
    """Placeholder for YouTube Data API v3 video upload."""
    print("[Watcher Agent] Attempting YouTube Shorts upload...")
    # NOTE: YouTube requires Google OAuth2 authentication flow and google-api-python-client package
    if YOUTUBE_CLIENT_ID != "YOUR_YOUTUBE_CLIENT_ID":
        # Insert YouTube API upload logic here
        pass
    else:
        print("[Watcher Agent] Skipping YouTube - Client ID missing.")


def post_to_tiktok(video_path, caption):
    """Placeholder for TikTok Content Posting API."""
    print("[Watcher Agent] Attempting TikTok upload...")
    # NOTE: TikTok API requires registered App with video.upload scope
    if TIKTOK_ACCESS_TOKEN != "YOUR_TIKTOK_ACCESS_TOKEN":
        # Insert TikTok API upload logic here
        pass
    else:
        print("[Watcher Agent] Skipping TikTok - Access Token missing.")


# --- MAIN WATCHER AGENT LOOP ---

def run_watcher_agent():
    """Monitors database for active promotions and triggers social posts on schedule."""
    print("[Three Monkeys] Watcher Agent starting...")
    
    while True:
        try:
            # 1. Fetch latest active promo from database
            conn = sqlite3.connect('data.db')
            cursor = conn.cursor()
            cursor.execute('SELECT title, link FROM deals ORDER BY id DESC LIMIT 1')
            deal = cursor.fetchone()
            conn.close()
            
            if deal:
                title, link = deal
                promo_message = f"💳 Free Cash Bonus! {title}\nSign up for Monzo and spend 50p to activate your reward."
                
                print(f"[Watcher Agent] Found Active Offer: {title}")
                
                # 2. Trigger social media posting functions
                post_to_facebook(promo_message, link)
                post_to_youtube_shorts(video_path="promo.mp4", title=title, description=promo_message)
                post_to_tiktok(video_path="promo.mp4", caption=promo_message)
            else:
                print("[Watcher Agent] No active deals found in database.")
                
        except Exception as e:
            print(f"[Watcher Agent] Watcher Engine Error: {e}")
            
        # 3. Interval delay (e.g., runs once every 12 hours)
        print("[Watcher Agent] Sleeping for 12 hours until next social broadcast...")
        time.sleep(43200)


if __name__ == "__main__":
    run_watcher_agent()

