import os
import time
import requests

# Storefront and Social Media Endpoints
STOREFRONT_URL = "https://free-monkey-system.onrender.com"
FACEBOOK_PROFILE = "https://www.facebook.com/mahmut.gokduman.50"
TIKTOK_PROFILE = "https://cenktiktok.com/@mahmutgokduman7"
YOUTUBE_CHANNEL = "http://www.youtube.com/@cenkmahmutgokduman2307"

# Promotion Payload
MONZO_PROMO_TITLE = "Get a Cash Bonus with Monzo!"
MONZO_LINK = "https://join.monzo.com/c/wq24nrr2"

def post_to_facebook():
    """Posts promotion update via Facebook API if credentials exist."""
    token = os.environ.get("FB_PAGE_ACCESS_TOKEN")
    page_id = os.environ.get("FB_PAGE_ID")
    
    if not token or not page_id:
        print("[Watcher] FB credentials not found in environment. Skipping API post.")
        return

    url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
    message = f"🎉 {MONZO_PROMO_TITLE}\n\nClaim reward: {MONZO_LINK}\nPortal: {STOREFRONT_URL}"
    
    try:
        res = requests.post(url, data={'message': message, 'access_token': token})
        if res.status_code == 200:
            print("[Watcher] Posted to Facebook successfully!")
        else:
            print(f"[Watcher] FB Post Status: {res.status_code}")
    except Exception as e:
        print(f"[Watcher] FB Request Exception: {e}")

def run_watcher_agent():
    print("[Watcher Agent] Starting social tracking loop...")
    print(f"[Watcher] Target Storefront: {STOREFRONT_URL}")
    print(f"[Watcher] Channels: Facebook | TikTok | YouTube")

    while True:
        try:
            # Check storefront health
            health = requests.get(STOREFRONT_URL)
            if health.status_code == 200:
                print(f"[Watcher] Storefront live status: OK ({health.status_code})")
            
            # Execute social broadcast routine
            post_to_facebook()
            
        except Exception as e:
            print(f"[Watcher] Loop Error: {e}")

        # Sleep interval (4 hours)
        time.sleep(14400)
File "/opt/render/project/src/watcher.py", line 58
  run_watcher_agent()if __name__ == "__main__":
                                              ^
SyntaxError: invalid syntax
    run_watcher_agent()

