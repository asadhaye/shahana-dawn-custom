# ROOM CANVAS SPECIFICATIONS

## Generated Room Base Images

All room canvases follow the **Luminous Heritage** design philosophy:
- Warm amber/gold tones
- Intimate lighting (candlelight, golden hour)
- Rich fabric textures
- Subtle gold filigree patterns
- Kantha shadow stitching effects
- Film grain texture overlay

---

## Room Files

### Storefront (Entry Portal)
```
dawn/assets/room-canvas/storefront-base.webp      (30KB, 1600x900)
dawn/assets/room-canvas/storefront-m-base.webp  (20KB, 900x1600)
dawn/assets/room-canvas/storefront-depth.webp     (4.8KB, grayscale)
```

**Hotspots:**
- Center: Start Experience → Lounge

---

### Lounge (Main Hub)
```
dawn/assets/room-canvas/lounge-base.webp      (22KB, 1600x900)
dawn/assets/room-canvas/lounge-m-base.webp  (14KB, 900x1600)
dawn/assets/room-canvas/lounge-depth.webp     (5.6KB, grayscale)
```

**Hotspots:**
- Left (20%): Designer Houses → designer_houses
- Center (50%): Occasions → occasions
- Right (80%): Featured Collections → featured_collections

---

### Designer Houses
```
dawn/assets/room-canvas/designer-houses-base.webp      (19KB, 1600x900)
dawn/assets/room-canvas/designer-houses-m-base.webp  (12KB, 900x1600)
dawn/assets/room-canvas/designer_houses-depth.webp     (5.6KB, grayscale)
```

**Hotspots:**
- Top (50%, 15%): Explore Designers → editorial
- Left (13%, 40%): Suffuse → collection:suffuse
- Center (50%, 45%): Soraya → collection:soraya
- Right (87%, 40%): Saad Bin Shahzad → collection:saad-bin-shahzad
- Bottom (50%, 90%): Back to Lounge → lounge

---

### Occasions
```
dawn/assets/room-canvas/occasions-base.webp      (17KB, 1600x900)
dawn/assets/room-canvas/occasions-m-base.webp  (10KB, 900x1600)
dawn/assets/room-canvas/occasions-depth.webp     (5.3KB, grayscale)
```

**Hotspots:**
- Top (50%, 15%): Our Occasions → editorial
- Zone 1 (25%, 40%): Eid Collection → collection:eid-collection
- Zone 2 (42%, 50%): Bridal & Mehndi → collection:bridal-mehndi
- Zone 3 (58%, 40%): Luxury Formals → collection:luxury-formals
- Zone 4 (75%, 50%): Casual Pret → collection:casual-pret
- Bottom (50%, 85%): Back to Lounge → lounge

---

### Featured Collections
```
dawn/assets/room-canvas/featured-collections-base.webp      (23KB, 1600x900)
dawn/assets/room-canvas/featured-collections-m-base.webp  (15KB, 900x1600)
dawn/assets/room-canvas/featured_collections-depth.webp     (5.6KB, grayscale)
```

**Hotspots:**
- Top (50%, 15%): Featured Stories → editorial
- Left (25%, 40%): SS5 Summer Pret 26 → collection:summer-pret-26-eid-edit-saad-bin-shahzad
- Center (50%, 50%): Suffuse Luxury Pret → collection:luxury-pret-suffuse
- Right (75%, 40%): Soraya Eid Pret → collection:lumene-festive-25-26-soraya-official
- Bottom (50%, 85%): Back to Lounge → lounge

---

## Editorial Rooms

### Heritage Editorial
```
dawn/assets/room-canvas/heritage-editorial-base.webp      (33KB, 1600x900)
dawn/assets/room-canvas/heritage-editorial-m-base.webp  (22KB, 900x1600)
```

### Ceremonial Editorial
```
dawn/assets/room-canvas/ceremonial-editorial-base.webp      (30KB, 1600x900)
dawn/assets/room-canvas/ceremonial-editorial-m-base.webp  (20KB, 900x1600)
```

---

## Color Palette (CSS Reference)

```css
:root {
  --shahana-gold: #C9A86C;        /* Warm gold */
  --shahana-maroon: #8B1538;     /* Deep maroon */
  --shahana-amber: #D4AF37;      /* Luminous gold */
  --shahana-ivory: #FFFDD0;      /* Ivory */
  --shahana-midnight: #191970;    /* Midnight blue */
  --shahana-blush: #C9A9A9;      /* Blush rose */
  --shahana-charcoal: #242428;    /* Deep charcoal */
  --shahana-warm-black: #1C1612; /* Warm black */
}
```

---

## Texture Specifications

| Type | Desktop | Mobile | Quality | Format |
|------|---------|--------|---------|--------|
| Room Base | 1600×900 | 900×1600 | 75% | WebP |
| Depth Map | 1600×900 | 900×1600 | 60% | WebP (grayscale) |

---

*Generated: April 2026*
*Philosophy: Luminous Heritage*