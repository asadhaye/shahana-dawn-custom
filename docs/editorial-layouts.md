# Editorial Layouts — Complete Reference

All 9 layout options in `sections/immersive-editorial.liquid`:

---

## 1. **designers** — Designer Hub (Interactive ✅)

**Structure:**
```
┌─────────────────────────────────────┐
│ Timeline Rail                      │
│ [Suffuse][Soraya][Saad Bin Shahzad]│
│    ↑ thumb slides                 │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Products Grid (load on click)     │
│ [Product] [Product] [Product]     │
└─────────────────────────────────────┘
```

- **Type**: Editorial overlay for `designer_houses` room
- **Interaction**: Timeline slides, products load via Section Rendering API
- **JS**: `initDesignersEditorial()`, `loadDesignerGrid()`
- **Status**: ✅ Complete

---

## 2. **occasions** — Story Chapters (Interactive ✅)

**Structure:**
```
┌─────────────────────────────────────┐
│ Hero: Heading + Subheading          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Chapter 1 (Eid)                     │
│ [Image] [Eyebrow + Heading]        │
│ [View Collection →]               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Chapter 2 (Bridal)                 │
│ [Image] [Eyebrow + Heading]        │
│ [View Collection →]               │
└─────────────────────────────────────┘
```

- **Type**: Editorial overlay for `occasions` room
- **Interaction**: Vertical scroll, click collection opens glass panel
- **Status**: ✅ Complete

---

## 3. **featured_collections** — Grid Gallery (Interactive ✅)

**Structure:**
```
┌─────────────────────────────────────┐
│ Optional Hero                       │
└─────────────────────────────────────┐
┌──────────┐ ┌──────────┐ ┌──────────┐
│ [IMG]   │ │ [IMG]   │ │ [IMG]   │
│ Heading │ │ Heading │ │ Heading │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ [IMG]   │ │ [IMG]   │
│ Heading │ │ Heading │
└──────────┘ └──────────┘
```

- **Type**: Editorial overlay for `featured_collections` room
- **Interaction**: Grid click opens collection
- **Status**: ✅ Complete

---

## 4. **gallery** — Basic Grid (Static ⚠️)

**Structure:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ [Image]  │ │ [Image]  │ │ [Image]  │
│ Label    │ │ Label    │ │ Label    │
└──────────┘ └──────────┘ └─���────────┘
```

- **Type**: Standalone gallery
- **Interaction**: Static links
- **Status**: ⚠️ May need JS for proper gallery behavior

---

## 5. **custom** — Banner Stack (Static ⚠️)

**Structure:**
```
┌─────────────────────────────────────┐
│ Banner 1: Full-width image         │
│ [Text overlay + CTA]               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Banner 2: Full-width image         │
│ [Text overlay + CTA]               │
└─────────────────────────────────────┘
```

- **Type**: Custom banner layout
- **Interaction**: Static CTAs
- **Status**: ⚠️ Basic implementation

---

## 6. **coverflow** — Apple-Style Carousel (Interactive ✅)

**Structure:**
```
      ┌─────────┐                     
     │  Image   │ ← center, large
  ┌────────┐  └─────────┐  ┌────────┐ 
  │ Image  │                 │ Image  │ ← sides, small  
  └────────┘                 └────────┘ 
      [←] [→] Navigation buttons
```

- **Type**: Coverflow carousel
- **Interaction**: Prev/Next buttons, clickable slides
- **JS**: Requires `initCoverflow()` 
- **Status**: ⚠️ JS may be incomplete

---

## 7. **stacked** — Stacked Card Deck (Interactive ✅)

**Structure:**
```
┌─────────────────────────────────────┐
│  ─── Card 1 ───  (top, visible)    │
│  [Image + Label + CTA]              │
└─────────────────────────────────────┘
     Card 2 (behind)
     Card 3 (behind)
```

- **Type**: 3D stacked cards
- **Interaction**: Scroll to reveal cards
- **JS**: Requires `initStacked()`
- **Status**: ⚠️ JS may be incomplete

---

## 8. **perspective** — 3D Perspective Gallery (Interactive ✅)

**Structure:**
```
   Card 1 ╲
          ╲  ════════→ moves right
     Card 2 ───
          ╱  ← moves left
   Card 3 ╱
```

- **Type**: 3D perspective gallery
- **Interaction**: Scroll to shift perspective
- **JS**: Requires `initPerspective()`
- **Status**: ⚠️ JS may be incomplete

---

## 9. **marquee** — Scrolling Text (Animated ⚠️)

**Structure:**
```
═══════════════════════════════════
← Scrolling text continuously →
═══════════════════════════════════
```

- **Type**: Infinite marquee text
- **Interaction**: Auto-scrolling, CSS animation
- **JS**: Pure CSS, no JS needed
- **Status**: ✅ Complete

---

## Summary Table

| Layout | Type | Interaction | Room | Status |
|--------|------|-------------|------|--------|
| `designers` | Editorial | Timeline + products | designer_houses | ✅ |
| `occasions` | Editorial | Scroll + collection | occasions | ✅ |
| `featured_collections` | Editorial | Grid click | featured_collections | ✅ |
| `gallery` | Standalone | Static links | - | ⚠️ |
| `custom` | Standalone | Static CTAs | - | ⚠️ |
| `coverflow` | Carousel | Buttons | - | ⚠️ |
| `stacked` | Carousel | Scroll | - | ⚠️ |
| `perspective` | Gallery | Scroll | - | ⚠️ |
| `marquee` | Animation | Auto-scroll | - | ✅ |

---

## Key Architecture

All layouts use:

- **Section Rendering API** for dynamic content
- **Template**: `page.immersive.json` with 10 sections
- **CSS**: Embedded in each section via `{% stylesheet %}`
- **JS**: `immersive-store.js` for 3D + overlay logic

The first 3 (`designers`, `occasions`, `featured_collections`) are the main **immersive overlays** tied to rooms. The others are standalone layouts.