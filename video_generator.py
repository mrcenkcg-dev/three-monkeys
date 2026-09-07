import os
from moviepy import ColorClip, TextClip, CompositeVideoClip

def create_tech_deal_short(product_title, discount_price, original_price):
    """
    Takes product info and renders a 1080x1920 vertical video (YouTube Short).
    Uses default system fonts to ensure seamless execution on Linux cloud servers (Render).
    """
    output_filename = "test_deal.mp4"
    duration = 5  # 5 seconds duration
    
    # Dark Blue Background (1080x1920 Vertical format for Shorts)
    background = ColorClip(size=(1080, 1920), color=(15, 23, 42), duration=duration)
    
    # Headline
    header = (TextClip(text="🔥 TECH DEAL ALERT 🔥", font_size=55, color="#F59E0B")
              .with_duration(duration)
              .with_position(("center", 350)))
    
    # Product Title
    title = (TextClip(text=product_title, font_size=45, color="white")
             .with_duration(duration)
             .with_position(("center", 650)))
             
    # Price & Discount Text
    price_text = f"NOW {discount_price}  (Was {original_price})"
    price = (TextClip(text=price_text, font_size=55, color="#10B981")
             .with_duration(duration)
             .with_position(("center", 950)))
             
    # Call To Action
    cta = (TextClip(text="Check Link in Description 👇", font_size=40, color="#9CA3AF")
           .with_duration(duration)
           .with_position(("center", 1300)))
    
    # Combine layers into single video stream
    final_video = CompositeVideoClip([background, header, title, price, cta])
    
    # Render MP4 file
    final_video.write_videofile(output_filename, fps=24, preset="ultrafast")
    final_video.close()
    
    print(f"\nSuccess! Video generated: {output_filename}")

if __name__ == "__main__":
    create_tech_deal_short(
        product_title="Sony WH-1000XM5", 
        discount_price="£289", 
        original_price="£380"
    )
