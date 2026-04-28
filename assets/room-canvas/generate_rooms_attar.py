#!/usr/bin/env python3
"""
ATTAR-inspired room canvases for Shahana 3D Immersive Store
Produces warm, luxury canvases for storefront/lounge/designer_houses/occasions/featured_collections
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

# Canvas specs
WIDTH, HEIGHT = 1600, 900
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'tmp_attar')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Palette (soft, luxury-inspired)
COL = {
    'gold': (212, 175, 55),      # amber-gold
    'maroon': (139, 21, 56),     # deep maroon
    'ivory': (255, 253, 240),    # ivory
    'amber': (210, 176, 54),     # warm amber
    'midnight': (25, 25, 112),   # midnight blue
}

# Fonts (fallbacks from canvas-design fonts)
FONT_PATHS = [
    '/Users/asad/.agents/skills/canvas-design/canvas-fonts/Outfit-Regular.ttf',
    '/Users/asad/.agents/skills/canvas-design/canvas-fonts/Lora-Italic.ttf',
    '/Users/asad/.agents/skills/canvas-design/canvas-fonts/WorkSans-Regular.ttf',
]
FONTS = []
for p in FONT_PATHS:
    try:
        FONTS.append(ImageFont.truetype(p, 26))
    except Exception:
        pass
if not FONTS:
    FONTS = [ImageFont.load_default()]

def gradient_bg(draw, w, h, color_top, color_bot):
    for y in range(h):
        t = y / h
        r = int(color_top[0] * (1-t) + color_bot[0] * t)
        g = int(color_top[1] * (1-t) + color_bot[1] * t)
        b = int(color_top[2] * (1-t) + color_bot[2] * t)
        draw.line([(0, y), (w, y)], fill=(r,g,b))

def central_ornament(img, cx, cy, radius):
    draw = ImageDraw.Draw(img)
    # concentric rings
    for i in range(4):
        r = radius - i*12
        color = tuple(min(255, int(COL['gold'][j] * (1 - i*0.15))) for j in range(3))
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2)
    # subtle filigree-like spokes
    for a in range(0,360,30):
        rad = math.radians(a)
        x = int(cx + (radius-8) * math.cos(rad))
        y = int(cy + (radius-8) * math.sin(rad))
        draw.line([cx, cy, x, y], fill=COL['amber'], width=1)

def label_room(img, text, font_index=0):
    draw = ImageDraw.Draw(img)
    w, h = img.size
    f = FONTS[font_index % len(FONTS)]
    # small label in bottom-right corner
    margin = 40
    # textsize may be deprecated in some Pillow versions; try textbbox first
    try:
        bbox = draw.textbbox((0, 0), text, font=f)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        text_w, text_h = f.getsize(text)
    x = w - text_w - margin
    y = h - text_h - margin
    draw.text((x, y), text, fill=(230,230,230), font=f)

def make_room(name, color_top, color_bot, label):
    img = Image.new('RGB', (WIDTH, HEIGHT), color_top)
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, WIDTH, HEIGHT, color_top, color_bot)
    # soft vignette
    for y in range(HEIGHT):
        alpha = int(255 * (0.25 + 0.75 * (y/HEIGHT)))
        draw.line([(0,y),(WIDTH,y)], fill=(0,0,0,0))
    # central ornament
    central_ornament(img, WIDTH//2, HEIGHT//2, min(WIDTH, HEIGHT)//4)
    # label
    label_room(img, label)
    return img

def save(img, name):
    path = os.path.join(OUTPUT_DIR, f"{name}-attar-base.webp")
    img.save(path, 'WEBP', quality=75)
    return path

def main():
    rooms = [
        ('storefront', COL['amber'], COL['midnight'], 'Storefront Entry'),
        ('lounge', COL['gold'] if 'gold' in COL else (212,175,55), COL['midnight'], 'Lounge'),
        ('designer_houses', COL['maroon'], COL['ivory'], 'Designer Houses'),
        ('occasions', COL['amber'], COL['midnight'], 'Occasions'),
        ('featured_collections', COL['gold'], COL['amber'], 'Featured Collections'),
    ]
    for name, top, bottom, label in rooms:
        img = make_room(name, top, bottom, label)
        save(img, name)
    print("Generated ATTAR room canvases. Outputs in:", OUTPUT_DIR)

if __name__ == '__main__':
    main()
