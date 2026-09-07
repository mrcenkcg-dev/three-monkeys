import os
from moviepy.editor import ColorClip, TextClip, CompositeVideoClip

print("Starting video build...")

# Low resolution (640x360) and 15 fps keep RAM usage under 100MB
bg = ColorClip(size=(640, 360), color=(20, 20, 20), duration=3)
txt = TextClip("Tech Deal Test", fontsize=30, color='white').set_duration(3).set_position('center')

video = CompositeVideoClip([bg, txt])
video.write_videofile(
    "test_deal.mp4", 
    fps=15, 
    preset="ultrafast", 
    threads=1
)

print("SUCCESS: Video created successfully!")
