#!/usr/bin/env python3
"""
Shahana 3D Immersive Store - Room Canvas Generator
Generates luxury Pakistani fashion themed backgrounds for each room.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import math
import os

# Output directory
OUTPUT_DIR = "/Users/asad/Desktop/sc-ui/shahana-dawn-custom/dawn/assets/room-canvas"

# Canvas specifications
WIDTH = 1600
HEIGHT = 900
MOBILE_WIDTH = 900
MOBILE_HEIGHT = 1600

# Luminous Heritage color palette
COLORS = {
    'gold': (201, 168, 108),        # Warm gold
    'maroon': (139, 21, 56),       # Deep maroon
    'amber': (212, 175, 55),       # Luminous gold
    'ivory': (255, 253, 240),      # Ivory
    'midnight': (25, 25, 112),      # Midnight blue
    'blush': (201, 169, 169),      # Blush rose
    'charcoal': (36, 36, 40),      # Deep charcoal
    'warm_black': (28, 22, 18),    # Warm black
    'deep_gold': (180, 140, 80),   # Deeper gold for gradients
    'soft_gold': (230, 200, 150),   # Softer gold
}


def lerp(c1, c2, t):
    """Linear interpolation between two colors"""
    return tuple(int(c1[i] * (1-t) + c2[i] * t) for i in range(3))


def create_gradient_base(width, height, color_top, color_bottom, opacity_top=1.0, opacity_bottom=0.6):
    """Create a vertical gradient background"""
    img = Image.new('RGB', (width, height), color_top)
    pixels = img.load()
    
    for y in range(height):
        t = y / height
        r = lerp(color_top, color_bottom, t)
        opacity = lerp((opacity_top,), (opacity_bottom,), t)[0]
        for x in range(width):
            base = lerp(color_top, color_bottom, t)
            pixels[x, y] = base
    
    return img


def add_radial_glow(img, cx, cy, radius, color, strength=0.4):
    """Add a radial glow effect"""
    draw = ImageDraw.Draw(img)
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    for r in range(radius, 0, -20):
        alpha = int(80 * strength * (r / radius))
        glow_color = color + (alpha,)
        overlay_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=glow_color)
    
    img.paste(overlay, (0, 0), overlay)
    return img


def draw_filigree_pattern(draw, cx, cy, size, color, depth=4):
    """Draw an ornate filigree pattern"""
    for layer in range(depth):
        scale = (depth - layer) / depth
        r = size * scale
        
        # Outer ring
        color_layer = tuple(max(20, int(c * (0.3 + 0.2 * scale))) for c in color)
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color_layer, width=1)
        
        # Inner detail
        r2 = r * 0.7
        color_inner = tuple(max(30, int(c * (0.4 + 0.2 * scale))) for c in color)
        draw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline=color_inner, width=1)
        
        # Cross details
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            x1 = cx + int(r2 * 0.5 * math.cos(rad))
            y1 = cy + int(r2 * 0.5 * math.sin(rad))
            x2 = cx + int(r * 0.9 * math.cos(rad))
            y2 = cy + int(r * 0.9 * math.sin(rad))
            draw.line([x1, y1, x2, y2], fill=color_layer, width=1)


def draw_fabric_drape(draw, x, y, width, height, color, curve_factor=0.3):
    """Draw draped fabric effect"""
    points = []
    segments = 20
    
    for i in range(segments + 1):
        t = i / segments
        px = x + t * width
        wave = math.sin(t * math.pi * 3) * height * curve_factor
        py = y + t * height + wave
        points.append((px, py))
    
    # Draw as curved shape
    for i in range(len(points) - 1):
        color_intensity = 0.3 + 0.2 * abs(math.sin(points[i][0] / width * math.pi))
        c = tuple(max(15, int(col * color_intensity)) for col in color)
        draw.line([points[i], points[i+1]], fill=c, width=2)
    
    return points


def draw_kantha_shadow(draw, cx, cy, size, color, density=0.15):
    """Draw kantha-style shadow stitching"""
    import random
    random.seed(int(cx * cy))  # Deterministic
    
    # Horizontal lines with variation
    for y_offset in range(-size//3, size//3, 12):
        y = cy + y_offset + random.randint(-3, 3)
        x_start = cx - size//2 + random.randint(0, 8)
        x_end = cx + size//2 - random.randint(0, 8)
        
        color_intensity = density + random.uniform(-0.05, 0.05)
        c = tuple(max(20, int(col * color_intensity)) for col in color)
        
        draw.line([x_start, y, x_end, y], fill=c, width=1)


def draw_embossed_border(draw, x, y, w, h, color, width=3):
    """Draw ornate embossed border pattern"""
    # Main border
    draw.rectangle([x, y, x+w, y+h], outline=color, width=width)
    
    # Corner ornaments
    corner_size = 30
    corners = [
        (x, y), (x+w-corner_size, y), 
        (x, y+h-corner_size), (x+w-corner_size, y+h-corner_size)
    ]
    
    for cx, cy in corners:
        draw_filigree_pattern(draw, cx + corner_size//2, cy + corner_size//2, corner_size//2, color, depth=2)


def add_texture_overlay(img, strength=0.08):
    """Add subtle film grain texture"""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    import random
    random.seed(42)
    
    for _ in range(int(img.width * img.height * strength)):
        x = random.randint(0, img.width - 1)
        y = random.randint(0, img.height - 1)
        alpha = random.randint(5, 20)
        overlay_draw.point((x, y), fill=(255, 255, 255, alpha))
    
    img.paste(overlay, (0, 0), overlay)
    return img


def create_room_base(width, height, style='lounge'):
    """Create base room background with gradient"""
    img = Image.new('RGB', (width, height), COLORS['warm_black'])
    draw = ImageDraw.Draw(img)
    
    if style == 'storefront':
        # Warm amber gradient with golden glow from center
        top_color = (35, 28, 22)
        bottom_color = (18, 12, 8)
        
    elif style == 'lounge':
        # Rich midnight to warm charcoal
        top_color = (28, 22, 35)
        bottom_color = (18, 14, 20)
        
    elif style == 'designer_houses':
        # Luxurious deep maroon to charcoal
        top_color = (45, 18, 30)
        bottom_color = (22, 14, 18)
        
    elif style == 'occasions':
        # Warm gold to maroon
        top_color = (40, 28, 25)
        bottom_color = (25, 15, 18)
        
    elif style == 'featured_collections':
        # Elegant midnight blue to charcoal
        top_color = (20, 20, 35)
        bottom_color = (15, 15, 25)
    
    # Create vertical gradient
    for y in range(height):
        t = y / height
        r = int(top_color[0] * (1-t) + bottom_color[0] * t)
        g = int(top_color[1] * (1-t) + bottom_color[1] * t)
        b = int(top_color[2] * (1-t) + bottom_color[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    return img


# ============== ROOM GENERATORS ==============

def create_storefront(width=WIDTH, height=HEIGHT):
    """Create storefront entry room"""
    print("Creating storefront...")
    img = create_room_base(width, height, 'storefront')
    draw = ImageDraw.Draw(img)
    
    # Central golden glow - the entry portal
    glow_color = COLORS['amber']
    add_radial_glow(img, width//2, height//2, width//2, glow_color, strength=0.5)
    
    # Subtle fabric texture lines
    for i in range(0, height, 25):
        opacity = 0.08 if (i // 25) % 2 == 0 else 0.05
        color = tuple(int(c * opacity + 28 * (1-opacity)) for c in COLORS['gold'])
        draw.line([(0, i), (width, i)], fill=color, width=1)
    
    # Central ornate circle - entry point
    cx, cy = width//2, height//2 + 50
    circle_size = min(width, height) // 4
    
    # Concentric circles
    for i in range(5):
        r = circle_size - i * 15
        color = tuple(max(20, int(c * (0.2 + 0.15 * (5-i)/5))) for c in COLORS['gold'])
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2)
    
    # Filigree inner detail
    draw_filigree_pattern(draw, cx, cy, circle_size//2, COLORS['gold'], depth=3)
    
    # Label area - elegant empty space for "Start Experience"
    # Bottom area with subtle gradient back to lobby
    for y in range(height - 150, height):
        t = (y - (height - 150)) / 150
        color = tuple(int(c * t + 28 * (1-t)) for c in COLORS['warm_black'])
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add film grain texture
    add_texture_overlay(img, strength=0.06)
    
    # Save
    output_path = f"{OUTPUT_DIR}/storefront-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    # Mobile version
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/storefront-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")


def create_lounge(width=WIDTH, height=HEIGHT):
    """Create main lounge hub"""
    print("Creating lounge...")
    img = create_room_base(width, height, 'lounge')
    draw = ImageDraw.Draw(img)
    
    # Three subtle vertical columns for navigation
    column_positions = [width * 0.2, width * 0.5, width * 0.8]
    
    for i, col_x in enumerate(column_positions):
        # Soft vertical glow
        glow_color = COLORS['blush'] if i == 1 else COLORS['gold']
        add_radial_glow(img, col_x, height * 0.35, height//3, glow_color, strength=0.35)
    
    # Horizontal warm line dividing content zones
    y_line = height * 0.55
    draw.line([(width//4, y_line), (3*width//4, y_line)], fill=COLORS['gold'], width=1)
    
    # Subtle kantha shadow stitching effect at top
    draw_kantha_shadow(draw, width//2, height//6, width//2, COLORS['maroon'], density=0.1)
    
    # Bottom navigation area - warm invitation
    for y in range(int(height * 0.7), height):
        t = (y - height * 0.7) / (height * 0.3)
        color = tuple(int(c * t + 28 * (1-t)) for c in COLORS['warm_black'])
        draw.line([(0, y), (width, y)], fill=color)
    
    # Corner ornaments
    draw_embossed_border(draw, 40, 40, width-80, height-80, COLORS['gold'], width=1)
    
    # Add film grain texture
    add_texture_overlay(img, strength=0.05)
    
    # Save
    output_path = f"{OUTPUT_DIR}/lounge-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    # Mobile version
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/lounge-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")


def create_designer_houses(width=WIDTH, height=HEIGHT):
    """Create designer houses room"""
    print("Creating designer houses...")
    img = create_room_base(width, height, 'designer_houses')
    draw = ImageDraw.Draw(img)
    
    # Three designer zones - warm intimate spaces
    zones = [
        (width * 0.13, height * 0.4, COLORS['gold']),
        (width * 0.5, height * 0.45, COLORS['amber']),
        (width * 0.87, height * 0.4, COLORS['blush'])
    ]
    
    for cx, cy, color in zones:
        # Intimate glow for each designer
        add_radial_glow(img, cx, cy, height//4, color, strength=0.4)
    
    # Elegant connecting line
    draw.line([(zones[0][0], zones[0][1]), (zones[2][0], zones[2][1])], 
              fill=COLORS['maroon'], width=1)
    
    # Top header area - editorial space
    draw_kantha_shadow(draw, width//2, height//8, width//2, COLORS['gold'], density=0.08)
    
    # Bottom back button area
    by = height * 0.85
    draw.line([(width//3, by), (2*width//3, by)], fill=COLORS['gold'], width=1)
    
    # Side borders
    draw.line([(60, 100), (60, height-100)], fill=COLORS['maroon'], width=1)
    draw.line([(width-60, 100), (width-60, height-100)], fill=COLORS['maroon'], width=1)
    
    # Add film grain texture
    add_texture_overlay(img, strength=0.05)
    
    # Save
    output_path = f"{OUTPUT_DIR}/designer-houses-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    # Mobile version
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/designer-houses-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")


def create_occasions(width=WIDTH, height=HEIGHT):
    """Create occasions room"""
    print("Creating occasions...")
    img = create_room_base(width, height, 'occasions')
    draw = ImageDraw.Draw(img)
    
    # Four occasion zones arranged in pairs
    occasions = [
        (width * 0.25, height * 0.4, COLORS['gold']),
        (width * 0.42, height * 0.5, COLORS['maroon']),
        (width * 0.58, height * 0.4, COLORS['amber']),
        (width * 0.75, height * 0.5, COLORS['blush'])
    ]
    
    for cx, cy, color in occasions:
        add_radial_glow(img, cx, cy, height//5, color, strength=0.35)
    
    # Horizontal connection
    draw.line([(width * 0.25, height * 0.45), (width * 0.75, height * 0.45)], 
              fill=COLORS['gold'], width=1)
    
    # Top editorial label area
    draw_kantha_shadow(draw, width//2, height//8, width//3, COLORS['gold'], density=0.1)
    
    # Bottom back navigation
    bx, by = width//2, height * 0.85
    draw.ellipse([bx-40, by-10, bx+40, by+10], outline=COLORS['gold'], width=1)
    
    # Side decorative elements
    for y in range(120, height-120, 40):
        color = tuple(max(20, int(c * 0.15)) for c in COLORS['maroon'])
        draw.line([(30, y), (50, y)], fill=color, width=2)
        draw.line([(width-50, y), (width-30, y)], fill=color, width=2)
    
    # Add film grain texture
    add_texture_overlay(img, strength=0.05)
    
    # Save
    output_path = f"{OUTPUT_DIR}/occasions-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    # Mobile version
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/occasions-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")


def create_featured_collections(width=WIDTH, height=HEIGHT):
    """Create featured collections room"""
    print("Creating featured collections...")
    img = create_room_base(width, height, 'featured_collections')
    draw = ImageDraw.Draw(img)
    
    # Three featured collection zones
    collections = [
        (width * 0.25, height * 0.4, COLORS['amber']),
        (width * 0.5, height * 0.5, COLORS['gold']),
        (width * 0.75, height * 0.4, COLORS['blush'])
    ]
    
    for cx, cy, color in collections:
        add_radial_glow(img, cx, cy, height//3, color, strength=0.4)
    
    # Elegant arc connecting collections
    for i in range(0, 180, 2):
        rad = math.radians(i)
        x = width//2 + int(width//4 * math.cos(rad))
        y = height * 0.5 - int(height//5 * math.sin(rad))
        alpha = 0.3 + 0.2 * math.sin(rad)
        color = tuple(max(20, int(c * alpha)) for c in COLORS['gold'])
        if y > height * 0.3:
            draw.point((x, y), fill=color)
    
    # Top editorial area
    draw_embossed_border(draw, width//2 - 150, 60, 300, 50, COLORS['gold'], width=1)
    
    # Bottom back navigation
    draw.line([(width//3, height * 0.85), (2*width//3, height * 0.85)], 
              fill=COLORS['gold'], width=1)
    
    # Corner filigree
    draw_filigree_pattern(draw, 80, 80, 40, COLORS['gold'], depth=2)
    draw_filigree_pattern(draw, width-80, 80, 40, COLORS['gold'], depth=2)
    draw_filigree_pattern(draw, 80, height-80, 40, COLORS['gold'], depth=2)
    draw_filigree_pattern(draw, width-80, height-80, 40, COLORS['gold'], depth=2)
    
    # Add film grain texture
    add_texture_overlay(img, strength=0.05)
    
    # Save
    output_path = f"{OUTPUT_DIR}/featured-collections-base.webp"
    img.save(output_path, 'WEBP', quality=75)
    print(f"  Saved: {output_path}")
    
    # Mobile version
    img_mobile = img.resize((MOBILE_WIDTH, MOBILE_HEIGHT), Image.LANCZOS)
    output_path_mobile = f"{OUTPUT_DIR}/featured-collections-m-base.webp"
    img_mobile.save(output_path_mobile, 'WEBP', quality=75)
    print(f"  Saved: {output_path_mobile}")


def create_depth_map(width=WIDTH, height=HEIGHT, room_type='lounge'):
    """Create grayscale depth map for parallax effect"""
    print(f"Creating depth map for {room_type}...")
    img = Image.new('L', (width, height), 200)
    draw = ImageDraw.Draw(img)
    
    # Create depth zones based on room type
    if room_type == 'storefront':
        # Central focus point
        for r in range(width//2, 0, -20):
            depth = 200 - int(100 * (1 - r / (width//2)))
            draw.ellipse([width//2-r, height//2-r, width//2+r, height//2+r], fill=depth)
    
    elif room_type in ['lounge', 'designer_houses', 'featured_collections']:
        # Multiple depth points
        zones = [(0.2, 0.35), (0.5, 0.35), (0.8, 0.35)]
        for zx, zy in zones:
            cx, cy = int(width * zx), int(height * zy)
            for r in range(150, 0, -15):
                depth = 180 - int(80 * (1 - r / 150))
                draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=depth)
    
    elif room_type == 'occasions':
        # Four zones
        zones = [(0.25, 0.4), (0.42, 0.5), (0.58, 0.4), (0.75, 0.5)]
        for zx, zy in zones:
            cx, cy = int(width * zx), int(height * zy)
            for r in range(120, 0, -12):
                depth = 180 - int(80 * (1 - r / 120))
                draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=depth)
    
    # Save depth map
    output_path = f"{OUTPUT_DIR}/{room_type}-depth.webp"
    img.save(output_path, 'WEBP', quality=60)
    print(f"  Saved: {output_path}")


# ============== MAIN ==============

def main():
    print("=" * 50)
    print("Shahana 3D Immersive Store - Room Canvas Generator")
    print("=" * 50)
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("\nGenerating room canvases...")
    
    # Generate all room base images
    create_storefront()
    create_lounge()
    create_designer_houses()
    create_occasions()
    create_featured_collections()
    
    # Generate depth maps
    print("\nGenerating depth maps...")
    create_depth_map(room_type='storefront')
    create_depth_map(room_type='lounge')
    create_depth_map(room_type='designer_houses')
    create_depth_map(room_type='occasions')
    create_depth_map(room_type='featured_collections')
    
    print("\n" + "=" * 50)
    print("Generation complete!")
    print(f"Files saved to: {OUTPUT_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    main()