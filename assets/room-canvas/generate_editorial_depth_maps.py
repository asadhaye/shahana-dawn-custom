#!/usr/bin/env python3
"""Generate depth maps for editorial canvases (heritage and ceremonial).
Produces grayscale depth maps suitable for parallax layering.
"""
from PIL import Image, ImageDraw
import os

OUTPUT_DIR = "/Users/asad/Desktop/sc-ui/shahana-dawn-custom/dawn/assets/room-canvas"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def gradient_depth(width, height, start=200, end=50):
    img = Image.new('L', (width, height))
    for y in range(height):
        t = y / height
        val = int(start * (1 - t) + end * t)
        for x in range(width):
            img.putpixel((x, y), val)
    return img

def radial_depth(width, height, center=None, maxr=None, depth=180):
    img = Image.new('L', (width, height), color=depth)
    cx = center[0] if center else width//2
    cy = center[1] if center else height//2
    maxr = maxr if maxr else min(width, height)//2
    draw = ImageDraw.Draw(img)
    for r in range(int(maxr), 0, -4):
        val = int(255 * (1 - (r / maxr)) * 0.6 + depth*0.4)
        bbox = [cx - r, cy - r, cx + r, cy + r]
        draw.ellipse(bbox, fill=val)
    return img

def main():
    w, h = 1600, 900
    # Heritage depth map: gradient with subtle vignette
    heritage = gradient_depth(w, h, start=210, end=40)
    heritage_path = os.path.join(OUTPUT_DIR, 'heritage-editorial-depth.webp')
    heritage.save(heritage_path, 'WEBP', quality=60)
    print('Saved', heritage_path)

    # Ceremonial depth map: radial depth around center
    ceremonial = radial_depth(w, h, center=(w//2, h//2), maxr=min(w,h)//2, depth=150)
    ceremonial_path = os.path.join(OUTPUT_DIR, 'ceremonial-editorial-depth.webp')
    ceremonial.save(ceremonial_path, 'WEBP', quality=60)
    print('Saved', ceremonial_path)

if __name__ == '__main__':
    main()
