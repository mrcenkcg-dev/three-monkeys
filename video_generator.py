import os
from moviepy.editor import ColorClip, TextClip, CompositeVideoClip

print("Starting video build...")

# 1. Create a simple 5-second background clip (low resolution to save memory)
bg = ColorClip(size=(640, 360), color=(20, 20, 20), duration=5)

# 2. Add text
txt = TextClip("Tech Deal Test", fontsize=40, color='white').set_duration(5).set_position('center')

# 3. Combine and write file using low memory settings
video = CompositeVideoClip([bg, txt])
video.write_videofile(
    "test_deal.mp4", 
    fps=15, 
    preset="ultrafast", 
    threads=1
)

print("SUCCESS: Video created successfully!")
