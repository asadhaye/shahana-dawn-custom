#!/usr/bin/env python3
"""
Shahana 3D Immersive Store - Editorial Room Canvas Generator
Generates editorial/storytelling room backgrounds.
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os
from generate_rooms import *

OUTPUT_DIR = "/Users/asad/Desktop/sc-ui/shahana-dawn-custom/dawn/assets/room-canvas"

def create_editorial_base(width=WIDTH, height=HEIGHT, theme='heritage'):
    """Create editorial room base with warm heritage aesthetic"""
    img = Image.new('RGB', (width, height), COLORS['warm_black'])
    draw = ImageDraw.Draw(img)
    
    if theme == 'heritage':
        # Rich warm gradient with gold undertones
        top_color = (40, 30, 35)
        bottom_color = (20, 15, 18)
    elif theme == 'elegant':
        # Midnight blue elegance
        top_color = (25, 25, 45)
        bottom_color = (15, 15, 28)
    elif theme == 'ceremonial':
        # Deep maroon celebration
        top_color = (50, 22, 35)
        bottom_color = (25, 12, 20)
    
    # Create vertical gradient
    for y in range(height):
        t = y / height
        r = int(top_color[0] * (1-t) + bottom_color[0] * t)
        g = int(top_color[1] * (1-t) + bottom_color[1] * t)
        b = int(top_color[2] * (1-t) + bottom_color[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    return img


def create_heritage_editorial(width=WIDTH, height=HEIGHT):
    """Create heritage storytelling editorial room"""
    print("Creating heritage editorial...")
    img = create_editorial_base(width, height, 'heritage')
    draw = ImageDraw.Draw(img)
    
    # Central warm light - the story focal point
    add_radial_glow(img, width//2, height//2 - 30, height//2, COLORS['gold'], strength=0.45)
    
    # Elegant frame for content
    frame_margin = width // 8
    draw_embossed_border(draw, frame_margin, 80, width - 2*frame_margin, height - 160, 
                        COLORS['gold'], width=2)
    
    # Central ornate medallion
    cx, cy = width//2, height//2 - 30
    medallion_size = height // 3
    
    # Layered medallion
    for i in range(4):
        r = medallion_size - i * 20
        color = tuple(max(25, int(c * (0.25 + 0.2 * (4-i)/4))) for c in COLORS['gold'])
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2)
    
    # Inner filigree
    draw_filigree_pattern(draw, cx, cy, medallion_size//2, COLORS['amber'], depth=3)
    
    # Top editorial label area
    draw_kantha_shadow(draw, width//2, height//8, width//3, COLORS['gold'], density=0.12)
    
    # Side decorative borders
    draw.line([(80, 120), (80, height-120)], fill=COLORS['maroon'], width=1)
    draw.line([(width-80, 120), (width-80, height-120)], fill=COLORS['maroon'], width=1)
    
    # Bottom area with subtle texture
    for y in range(int(height * 0.78), height):
        t = (y - height * 0.78) / (height * 0.22)
        color = tuple(int(c * t + 28 * (1-t)) for c in COLORS['warm_black'])
        draw.line([(0, y), (width, y)], fill=color)
    
    # Fabric drape effect at bottom
    for x in range(100, width-100, 30):
        for y in range(int(height * 0.82), int(height * 0.95), 15):
            wave = math.sin(x / 50) * 5
            color = tuple(max(15, int(c * 0.2)) for c in COLORS['gold'])
            draw.point((x + int(wave), y), fill=color)
    
    add_texture_overlay(img, strength=0.06)
    
    # Save
    output_path = f"{OUTPUT_DIR}/heritage-editorial-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/heritage-editorial-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")
    
    return output_path


def create_ceremonial_editorial(width=WIDTH, height=HEIGHT):
    """Create ceremonial celebration editorial room"""
    print("Creating ceremonial editorial...")
    img = create_editorial_base(width, height, 'ceremonial')
    draw = ImageDraw.Draw(img)
    
    # Rich warm glow - celebration
    add_radial_glow(img, width//2, height//2, height//2, COLORS['maroon'], strength=0.5)
    add_radial_glow(img, width//2, height//2, height//3, COLORS['amber'], strength=0.3)
    
    # Festive ornamental frame
    frame_margin = width // 10
    draw_embossed_border(draw, frame_margin, 70, width - 2*frame_margin, height - 140, 
                        COLORS['gold'], width=2)
    
    # Central celebration medallion
    cx, cy = width//2, height//2
    medallion_size = height // 3
    
    for i in range(5):
        r = medallion_size - i * 15
        color = tuple(max(30, int(c * (0.3 + 0.15 * (5-i)/5))) for c in COLORS['gold'])
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2)
    
    # Inner star pattern
    for angle in range(0, 360, 36):
        rad = math.radians(angle)
        x1 = cx + int(medallion_size//3 * math.cos(rad))
        y1 = cy + int(medallion_size//3 * math.sin(rad))
        x2 = cx + int(medallion_size * 0.7 * math.cos(rad))
        y2 = cy + int(medallion_size * 0.7 * math.sin(rad))
        color = tuple(max(40, int(c * 0.35)) for c in COLORS['gold'])
        draw.line([x1, y1, x2, y2], fill=color, width=1)
    
    # Top label area
    draw_kantha_shadow(draw, width//2, height//8, width//3, COLORS['gold'], density=0.1)
    
    # Bottom warmth
    for y in range(int(height * 0.8), height):
        t = (y - height * 0.8) / (height * 0.2)
        color = tuple(int(c * t + 28 * (1-t)) for c in COLORS['warm_black'])
        draw.line([(0, y), (width, y)], fill=color)
    
    add_texture_overlay(img, strength=0.06)
    
    # Save
    output_path = f"{OUTPUT_DIR}/ceremonial-editorial-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/ceremonial-editorial-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")
    
    return output_path


def main():
    print("\n" + "=" * 50)
    print("Generating Editorial Rooms")
    print("=" * 50)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    create_heritage_editorial()
    create_ceremonial_editorial()
    
    # Update STORE_ROOMS config with new URLs
    config_json = """
// Configuration for room textures
// Add to immersive-rooms-config JSON block

DESIGNER_HOUSES: {
  baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-houses-base.webp',
  mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-houses-m-base.webp',
  depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer_houses-depth.webp'
}

FEATURED_COLLECTIONS: {
  baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-collections-base.webp',
  mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-collections-m-base.webp',
  depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured_collections-depth.webp'
}
"""
    
    print("\n" + "=" * 50)
    print("Editorial rooms complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()