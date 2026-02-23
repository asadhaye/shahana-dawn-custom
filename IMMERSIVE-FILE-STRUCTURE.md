# 📁 Shahana Collection - File Structure

## Complete File Tree

```
dawn/
│
├── layout/
│   ├── theme.liquid                      # Default Dawn layout (unchanged)
│   └── theme.immersive.liquid            # ✨ NEW: Immersive layout with dual canvas
│
├── templates/
│   ├── index.json                        # Default homepage (unchanged)
│   ├── product.json                      # Default product page (unchanged)
│   └── page.immersive.json               # ✨ NEW: Template using immersive layout
│
├── sections/
│   ├── header.liquid                     # Default header (unchanged)
│   ├── footer.liquid                     # Default footer (unchanged)
│   └── immersive-product-grid.liquid     # ✨ NEW: AJAX-loaded product grid
│
├── snippets/
│   ├── product-card.liquid               # Default product card (unchanged)
│   └── immersive-product-card.liquid     # ✨ NEW: Enhanced product card (optional)
│
├── assets/
│   ├── base.css                          # Default Dawn styles (unchanged)
│   ├── global.js                         # Default Dawn scripts (unchanged)
│   ├── immersive-style.css               # ✨ NEW: Glassmorphism & hotspot styles
│   ├── immersive-store.js                # ✨ NEW: WebGL engine + Lenis scroll
│   ├── immersive-config.js               # ✨ NEW: Configuration file
│   ├── exterior-image.jpg                # 🖼️ ADD: Your exterior/building image
│   └── lounge-interior.jpg               # 🖼️ ADD: Your lounge/interior image
│
├── config/
│   └── settings_data.json                # Theme settings (unchanged)
│
├── IMMERSIVE-STORE-README.md             # ✨ NEW: Full documentation
├── IMMERSIVE-QUICKSTART.md               # ✨ NEW: Quick start guide
└── IMMERSIVE-FILE-STRUCTURE.md           # ✨ NEW: This file
```

## File Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS PAGE                         │
│              /pages/immersive-store                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              templates/page.immersive.json                  │
│              Specifies: layout = theme.immersive            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              layout/theme.immersive.liquid                  │
│              • Loads CSS: immersive-style.css               │
│              • Loads JS: immersive-config.js                │
│              • Loads JS: immersive-store.js                 │
│              • Loads CDN: Three.js, Lenis                   │
│              • Renders: Dual canvas + hotspots              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              assets/immersive-store.js                      │
│              • Initializes WebGL scenes                     │
│              • Loads textures from assets/                  │
│              • Handles scroll with Lenis                    │
│              • Shows hotspots at 95% scroll                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              USER CLICKS HOTSPOT                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AJAX Request to Shopify                        │
│              /?section_id=immersive-product-grid            │
│              &collection=designer-houses                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              sections/immersive-product-grid.liquid         │
│              • Fetches products from collection             │
│              • Renders product cards                        │
│              • Returns HTML to JavaScript                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Glass Panel Opens                              │
│              • Displays products                            │
│              • Add to cart functionality                    │
└─────────────────────────────────────────────────────────────┘
```

## File Purposes

### Core Files (Required)

| File | Purpose | Size | Dependencies |
|------|---------|------|--------------|
| `layout/theme.immersive.liquid` | Main layout with canvas setup | ~150 lines | Three.js, Lenis |
| `assets/immersive-store.js` | WebGL engine & scroll logic | ~700 lines | Three.js, Lenis, Config |
| `assets/immersive-style.css` | UI styles & animations | ~400 lines | None |
| `sections/immersive-product-grid.liquid` | Product grid section | ~150 lines | None |
| `templates/page.immersive.json` | Page template | ~10 lines | None |

### Configuration Files (Optional but Recommended)

| File | Purpose | Size | Dependencies |
|------|---------|------|--------------|
| `assets/immersive-config.js` | Centralized settings | ~300 lines | None |
| `snippets/immersive-product-card.liquid` | Reusable product card | ~100 lines | None |

### Documentation Files (Reference)

| File | Purpose | Size |
|------|---------|------|
| `IMMERSIVE-STORE-README.md` | Full documentation | ~500 lines |
| `IMMERSIVE-QUICKSTART.md` | Quick start guide | ~200 lines |
| `IMMERSIVE-FILE-STRUCTURE.md` | This file | ~100 lines |

### Asset Files (You Provide)

| File | Purpose | Recommended Size | Format |
|------|---------|------------------|--------|
| `assets/exterior-image.jpg` | Dissolving exterior image | 1920x1080 | JPG/PNG |
| `assets/lounge-interior.jpg` | Revealing interior image | 1920x1080 | JPG/PNG |

## Data Flow

### 1. Page Load
```
User → Page → Layout → CSS/JS → WebGL Init → Textures Load
```

### 2. Scroll Interaction
```
User Scrolls → Lenis Updates → Progress Calculated → Shaders Update → Canvas Renders
```

### 3. Hotspot Click
```
Click → Blur Canvas → Open Panel → AJAX Request → Render Products → Show Panel
```

### 4. Add to Cart
```
Click Button → Form Submit → Shopify API → Cart Updated → Visual Feedback
```

## File Dependencies

### JavaScript Dependencies
```
immersive-store.js
├── Requires: Three.js (CDN)
├── Requires: Lenis (CDN)
├── Reads: immersive-config.js
└── Calls: sections/immersive-product-grid.liquid (AJAX)
```

### CSS Dependencies
```
immersive-style.css
├── No external dependencies
└── Standalone styles
```

### Liquid Dependencies
```
theme.immersive.liquid
├── Includes: immersive-style.css
├── Includes: immersive-config.js
├── Includes: immersive-store.js
└── Loads: Three.js, Lenis (CDN)

immersive-product-grid.liquid
├── Uses: Shopify product objects
├── Uses: Shopify collection objects
└── Optional: immersive-product-card.liquid snippet
```

## Modification Guide

### To Change Colors
```
Edit: assets/immersive-config.js
Lines: 20-35 (colors object)
```

### To Move Hotspots
```
Edit: assets/immersive-config.js
Lines: 60-80 (hotspots array)
```

### To Adjust Scroll Behavior
```
Edit: assets/immersive-config.js
Lines: 45-55 (scroll object)
```

### To Modify Shaders
```
Edit: assets/immersive-store.js
Lines: 50-200 (shader definitions)
```

### To Change Panel Styles
```
Edit: assets/immersive-style.css
Lines: 150-250 (glass panel styles)
```

## File Size Summary

| Category | Total Size | Files |
|----------|-----------|-------|
| JavaScript | ~50 KB | 2 files |
| CSS | ~15 KB | 1 file |
| Liquid | ~20 KB | 4 files |
| Documentation | ~50 KB | 3 files |
| **Total** | **~135 KB** | **10 files** |

*Note: Excludes image assets (add ~500 KB for images)*

## Installation Checklist

- [ ] Upload `layout/theme.immersive.liquid`
- [ ] Upload `templates/page.immersive.json`
- [ ] Upload `sections/immersive-product-grid.liquid`
- [ ] Upload `assets/immersive-style.css`
- [ ] Upload `assets/immersive-store.js`
- [ ] Upload `assets/immersive-config.js`
- [ ] Upload `assets/exterior-image.jpg` (your image)
- [ ] Upload `assets/lounge-interior.jpg` (your image)
- [ ] Create collections (designer-houses, occasions, featured)
- [ ] Create page with immersive template
- [ ] Test on desktop browser
- [ ] Test on mobile device

## Backup Recommendation

Before uploading, backup these existing files:
- `layout/theme.liquid` (unchanged, but backup anyway)
- `config/settings_data.json` (unchanged, but backup anyway)

## Version Control

If using Git:
```bash
git add layout/theme.immersive.liquid
git add templates/page.immersive.json
git add sections/immersive-product-grid.liquid
git add assets/immersive-*
git add snippets/immersive-product-card.liquid
git commit -m "Add immersive store experience"
git push
```

## Uninstallation

To remove the immersive store:
1. Delete all files marked with ✨ NEW above
2. Delete the page using the immersive template
3. No other files are modified

---

**File Structure Complete** ✅

*All files are modular and don't interfere with existing Dawn theme functionality.*
