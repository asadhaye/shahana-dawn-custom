# 🎨 Shahana Collection - Visual Implementation Guide

## 🖼️ User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    STEP 1: INITIAL VIEW                         │
│                    (Scroll: 0%)                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                  EXTERIOR IMAGE                           │ │
│  │              (Full color, no effects)                     │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    ↓ User scrolls down ↓                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    STEP 2: DISSOLVE BEGINS                      │
│                    (Scroll: 25%)                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │              ╔═══════════════════╗                        │ │
│  │              ║  Center starts    ║                        │ │
│  │              ║  to dissolve      ║                        │ │
│  │              ║  with golden      ║                        │ │
│  │              ║  edges            ║                        │ │
│  │              ╚═══════════════════╝                        │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    ↓ Continue scrolling ↓                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    STEP 3: FULL DISSOLVE                        │
│                    (Scroll: 50%)                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │    ╔═══════════════════════════════════════════════╗     │ │
│  │    ║                                               ║     │ │
│  │    ║         LOUNGE INTERIOR REVEALED              ║     │ │
│  │    ║         (Full color emerging)                 ║     │ │
│  │    ║                                               ║     │ │
│  │    ╚═══════════════════════════════════════════════╝     │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    ↓ Almost there ↓                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    STEP 4: HOTSPOTS APPEAR                      │
│                    (Scroll: 95%+)                               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │              ⚪ DESIGNER HOUSES                            │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                          ⚪ OCCASIONS                      │ │
│  │                                                           │ │
│  │                  ⚪ FEATURED COLLECTIONS                   │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    ↓ Click hotspot ↓                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    STEP 5: GLASS PANEL OPENS                    │
│                                                                 │
│  ┌─────────────────────────┬─────────────────────────────────┐ │
│  │                         │  ╔═══════════════════════════╗  │ │
│  │                         │  ║  [X]                      ║  │ │
│  │   BLURRED BACKGROUND    │  ║                           ║  │ │
│  │                         │  ║  DESIGNER HOUSES          ║  │ │
│  │                         │  ║                           ║  │ │
│  │                         │  ║  ┌─────┐  ┌─────┐        ║  │ │
│  │                         │  ║  │ 👗  │  │ 👗  │        ║  │ │
│  │                         │  ║  │$299 │  │$399 │        ║  │ │
│  │                         │  ║  └─────┘  └─────┘        ║  │ │
│  │                         │  ║                           ║  │ │
│  │                         │  ║  ┌─────┐  ┌─────┐        ║  │ │
│  │                         │  ║  │ 👗  │  │ 👗  │        ║  │ │
│  │                         │  ║  │$499 │  │$599 │        ║  │ │
│  │                         │  ║  └─────┘  └─────┘        ║  │ │
│  │                         │  ╚═══════════════════════════╝  │ │
│  └─────────────────────────┴─────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎭 Hotspot Interaction States

### State 1: Hidden (Scroll < 95%)
```
(Nothing visible)
```

### State 2: Visible (Scroll ≥ 95%)
```
    ⚪  ← Pulsing white dot
```

### State 3: Hover
```
┌──────────────────────────┐
│  DESIGNER HOUSES         │  ← Expands to pill shape
└──────────────────────────┘     with golden text
```

### State 4: Active (Clicked)
```
┌──────────────────────────┐
│  DESIGNER HOUSES ✓       │  ← Brief press effect
└──────────────────────────┘     then opens panel
```

## 🎨 Color Palette

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PRIMARY GOLD (Pakistani Zardozi)                       │
│  ████████  #d4af37  rgb(212, 175, 55)                  │
│                                                         │
│  BACKGROUND DARK                                        │
│  ████████  #000000  rgb(0, 0, 0)                       │
│                                                         │
│  GLASS PANEL                                            │
│  ████████  rgba(0, 0, 0, 0.75) + blur(24px)           │
│                                                         │
│  TEXT PRIMARY                                           │
│  ████████  #ffffff  rgb(255, 255, 255)                 │
│                                                         │
│  TEXT SECONDARY                                         │
│  ████████  rgba(255, 255, 255, 0.7)                    │
│                                                         │
│  BORDER ACCENT                                          │
│  ████████  rgba(212, 175, 55, 0.3)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📐 Layout Dimensions

### Desktop (1920x1080)
```
┌────────────────────────────────────────────────────────────┐
│                     1920px width                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                                                      │  │
│  │                  1080px height                       │  │
│  │                  (Sticky canvas)                     │  │
│  │                                                      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ← 600px →  Glass Panel (when open)                       │
└────────────────────────────────────────────────────────────┘
```

### Mobile (375x667)
```
┌──────────────────────┐
│     375px width      │
│  ┌────────────────┐  │
│  │                │  │
│  │                │  │
│  │   667px        │  │
│  │   height       │  │
│  │                │  │
│  │                │  │
│  └────────────────┘  │
│                      │
│  Full-width panel    │
│  (when open)         │
└──────────────────────┘
```

## 🔄 Animation Timeline

```
Time: 0s ──────────────────────────────────────────────────> 10s
      │                                                      │
      │  Scroll Progress: 0% ──────────────────────> 100%   │
      │                                                      │
      ├─ Exterior visible (full color)                      │
      │                                                      │
      ├─ Dissolve begins (25%)                              │
      │  └─ Center starts grayscale                         │
      │     └─ Golden edges appear                          │
      │                                                      │
      ├─ Dissolve expands (50%)                             │
      │  └─ Interior reveals                                │
      │     └─ Color emerges                                │
      │                                                      │
      ├─ Full reveal (75%)                                  │
      │  └─ Interior fully visible                          │
      │                                                      │
      └─ Hotspots fade in (95%)                             │
         └─ Ready for interaction                           │
```

## 🎬 Shader Effect Visualization

### Canvas One (Dissolve)
```
Progress: 0%          Progress: 50%         Progress: 100%
┌─────────┐          ┌─────────┐           ┌─────────┐
│█████████│          │░░░░░░░░░│           │         │
│█████████│    →     │░░╔═══╗░░│     →     │   ╔═╗   │
│█████████│          │░░║   ║░░│           │   ║ ║   │
│█████████│          │░░╚═══╝░░│           │   ╚═╝   │
│█████████│          │░░░░░░░░░│           │         │
└─────────┘          └─────────┘           └─────────┘
Full color           Grayscale +           Only golden
                     golden edges          edges remain
```

### Canvas Two (Reveal)
```
Progress: 0%          Progress: 50%         Progress: 100%
┌─────────┐          ┌─────────┐           ┌─────────┐
│   ╔═╗   │          │░░╔═══╗░░│           │█████████│
│   ║ ║   │    →     │░░║███║░░│     →     │█████████│
│   ╚═╝   │          │░░║███║░░│           │█████████│
│         │          │░░╚═══╝░░│           │█████████│
│         │          │░░░░░░░░░│           │█████████│
└─────────┘          └─────────┘           └─────────┘
Golden edges         Partial color         Full color
only                 revealed              revealed
```

## 🎯 Hotspot Positioning Guide

```
┌─────────────────────────────────────────────────────────┐
│  0%,0%                                        100%,0%    │
│    ┌─────────────────────────────────────────────┐      │
│    │                                             │      │
│    │                                             │      │
│    │         ⚪ (35%, 25%)                        │      │
│    │         DESIGNER HOUSES                     │      │
│    │                                             │      │
│    │                                             │      │
│    │                                             │      │
│    │                      ⚪ (50%, 60%)           │      │
│    │                      OCCASIONS              │      │
│    │                                             │      │
│    │                                             │      │
│    │                                             │      │
│    │              ⚪ (65%, 35%)                   │      │
│    │              FEATURED                       │      │
│    │                                             │      │
│    └─────────────────────────────────────────────┘      │
│  0%,100%                                    100%,100%    │
└─────────────────────────────────────────────────────────┘

Format: (top%, left%)
Adjust these percentages in immersive-config.js
```

## 📊 Performance Visualization

```
FPS Target: 60 FPS
┌────────────────────────────────────────────────────────┐
│ 60 │████████████████████████████████████████████████│ │
│ 50 │                                                │ │
│ 40 │                                                │ │
│ 30 │                                                │ │
│ 20 │                                                │ │
│ 10 │                                                │ │
│  0 └────────────────────────────────────────────────┘ │
│     Desktop    Tablet     Mobile                      │
└────────────────────────────────────────────────────────┘

Load Time: < 3 seconds
┌────────────────────────────────────────────────────────┐
│ HTML/CSS/JS  ████░░░░░░░░░░░░░░░░░░░░░░░░░░  135 KB  │
│ Textures     ████████████░░░░░░░░░░░░░░░░░░  500 KB  │
│ Three.js     ████████████████░░░░░░░░░░░░░░  600 KB  │
│ Lenis        ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░   50 KB  │
└────────────────────────────────────────────────────────┘
Total: ~1.3 MB (first load)
```

## 🗂️ File Organization

```
📁 dawn/
│
├── 📄 layout/
│   └── theme.immersive.liquid ────────┐
│                                      │
├── 📄 templates/                      │
│   └── page.immersive.json ───────────┤
│                                      │
├── 📄 sections/                       ├─→ Core Files
│   └── immersive-product-grid.liquid ─┤
│                                      │
├── 📄 assets/                         │
│   ├── immersive-store.js ────────────┤
│   ├── immersive-style.css ───────────┤
│   └── immersive-config.js ───────────┘
│
├── 📄 snippets/
│   └── immersive-product-card.liquid ─→ Optional
│
└── 📄 Documentation/
    ├── IMMERSIVE-STORE-README.md ─────┐
    ├── IMMERSIVE-QUICKSTART.md ───────┤
    ├── IMMERSIVE-FILE-STRUCTURE.md ───┼─→ Guides
    ├── IMPLEMENTATION-SUMMARY.md ─────┤
    └── VISUAL-GUIDE.md ───────────────┘
```

## 🎓 Code Structure

```
immersive-store.js
├── Global State
│   ├── scrollProgress
│   ├── lenis
│   ├── renderers (x2)
│   ├── scenes (x2)
│   └── materials (x2)
│
├── Shader Definitions
│   ├── vertexShader (shared)
│   ├── fragmentShaderOne (dissolve)
│   └── fragmentShaderTwo (reveal)
│
├── Initialization
│   ├── initLenis()
│   ├── initWebGL()
│   ├── initHotspots()
│   └── initGlassPanel()
│
├── Event Handlers
│   ├── handleHotspotClick()
│   ├── handleAddToCart()
│   └── onWindowResize()
│
├── AJAX Functions
│   ├── loadProducts()
│   └── initProductCards()
│
└── Animation Loop
    ├── animate()
    ├── showHotspots()
    └── hideHotspots()
```

## 🔌 Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │ Scrolls
     ▼
┌──────────────┐
│    Lenis     │
└────┬─────────┘
     │ Updates scrollProgress
     ▼
┌──────────────┐
│   Shaders    │
└────┬─────────┘
     │ Renders effects
     ▼
┌──────────────┐
│   Canvas     │
└────┬─────────┘
     │ Displays
     ▼
┌──────────────┐
│  Hotspots    │ ← Appear at 95%
└────┬─────────┘
     │ Click
     ▼
┌──────────────┐
│ AJAX Request │
└────┬─────────┘
     │ Fetches
     ▼
┌──────────────┐
│   Shopify    │
└────┬─────────┘
     │ Returns HTML
     ▼
┌──────────────┐
│ Glass Panel  │
└────┬─────────┘
     │ Displays products
     ▼
┌──────────────┐
│ Add to Cart  │
└──────────────┘
```

## 🎨 Design Inspiration

```
Drake Related          Shopify Editions       Pakistani Luxury
(Isometric Nav)        (WebGL Scroll)         (Zardozi Gold)
      │                      │                       │
      └──────────┬───────────┴───────────┬───────────┘
                 │                       │
                 ▼                       ▼
         ┌────────────────────────────────────┐
         │  SHAHANA COLLECTION                │
         │  Immersive Store Experience        │
         └────────────────────────────────────┘
```

---

**Visual Guide Complete** ✅

*Use this guide to understand the user experience and technical implementation at a glance.*
