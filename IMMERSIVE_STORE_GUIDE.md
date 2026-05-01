# Shahana Collection — Immersive Store Guide

## What's Built Right Now

### 🏗️ Architecture Overview

```
Homepage (/)                    Immersive Store (/pages/immersive)
─────────────                   ──────────────────────────────────
Standard 2D Dawn                WebGL 3D Experience
├─ Slideshow                    ├─ Canvas Layer (Three.js)
├─ Featured Collections         │  ├─ Storefront Room (entry)
├─ Bridge CTA → 3D Store        │  ├─ Lounge Room (hub)
└─ Header/Footer                │  └─ 3 Editorial Rooms:
                                │     ├─ Designer Houses
                                │     ├─ Occasions
                                │     └─ Featured Collections
                                │
                                ├─ UI Layer (overlays)
                                │  ├─ Fixed Header
                                │  │  ├─ Menu Drawer
                                │  │  ├─ Search
                                │  │  ├─ Account
                                │  │  ├─ Wishlist
                                │  │  ├─ Cart
                                │  │  └─ 3D→2D Switch
                                │  │
                                │  ├─ Glass Panel (products/collections)
                                │  ├─ Wishlist Panel
                                │  ├─ Editorial Overlay
                                │  ├─ Onboarding Overlay
                                │  └─ Cookie Banner
                                │
                                └─ Notification Bar (top ticker)
```

---

## 🎯 Entry Points

### 1. Homepage Bridge CTA
- **Location**: `/` (standard Dawn homepage)
- **What it does**: Pill CTA linking to `/pages/immersive`
- **Deep-link support**: Can link with context like `/?open_collection=suffuse`

### 2. Collection/Product Bridge CTAs
- **Location**: All standard Dawn templates
- **What it does**: Context-aware CTAs on collection/product pages
- **Example**: On `/collections/suffuse` → "View in 3D Store" → `/pages/immersive?open_collection=suffuse`

### 3. Direct URL
- **URL**: `/pages/immersive`
- **What it does**: Direct entry to the immersive experience

---

## 🏛️ The 3D Showroom

### Room Structure

```
┌─────────────────────────────────────────────────────────┐
│                     STOREFRONT                          │
│                    (Entry Room)                         │
│                                                         │
│  [Enter Store] ──────────────────────────────────────┐  │
└─────────────────────────────────────────────────────┼──┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────┐
│                       LOUNGE                            │
│                     (Hub Room)                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Designer   │  │  Occasions   │  │   Featured   │  │
│  │    Houses    │  │              │  │ Collections  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌─────────┐        ┌─────────┐       ┌─────────┐
    │Editorial│        │Editorial│       │Editorial│
    │ Overlay │        │ Overlay │       │ Overlay │
    └─────────┘        └─────────┘       └─────────┘
```

### Room Details

#### **Storefront Room**
- **Purpose**: Entry point, sets the mood
- **Hotspots**: "Enter Store" → navigates to Lounge
- **Visuals**: Depth-mapped parallax background

#### **Lounge Room**
- **Purpose**: Central hub with 3 editorial wings
- **Hotspots**:
  - "Explore Designers" → Designer Houses editorial
  - "Dress the Occasion" → Occasions editorial
  - "The Edit" → Featured Collections editorial
- **Visuals**: Depth-mapped parallax background

#### **Editorial Rooms** (3 total)
Each editorial room has:
- **Living background**: The room's WebGL scene stays active
- **Editorial overlay**: Scrollable content with hero + cards
- **Real links**: All CTAs link to actual collections/products
- **Close button**: Returns to Lounge, restores focus

---

## 📋 What Each Editorial Contains

### 1. Designer Houses Editorial
**Room Key**: `designer_houses`  
**Layout**: `designers`

**Content**:
- Hero section with eyebrow + heading + subheading
- 3 Designer tiles:
  - **Suffuse**: Luxury with fluid silhouettes
  - **Soraya**: Heritage meets contemporary
  - **Saad Bin Shahzad**: Architectural precision

**Each tile has**:
- Designer logo
- Hero image
- Description
- "Explore Collection" CTA → `/collections/{handle}`

---

### 2. Occasions Editorial
**Room Key**: `occasions`  
**Layout**: `occasions`

**Content**:
- Hero section
- 4 Occasion cards:
  - **Eid Collection**: Festive embroidered lawns
  - **Bridal & Mehndi**: Complete bridal wardrobe
  - **Luxury Formals**: Heavily embellished pieces
  - **Casual Pret**: Everyday elegance

**Each card has**:
- Occasion image
- Heading + description
- "Shop Now" CTA → `/collections/{handle}`

---

### 3. Featured Collections Editorial
**Room Key**: `featured_collections`  
**Layout**: `featured_collections`

**Content**:
- Hero section
- 3 Featured items:
  - **SS5 Summer Pret '26**: Saad Bin Shahzad
  - **Suffuse Luxury Pret**: Everyday elevated
  - **Soraya Eid Pret**: Lumene Festive '25–'26

**Each item has**:
- Collection image
- Heading + description
- "View Collection" CTA → `/collections/{handle}`

---

## 🎨 Visual Features

### Depth-Mapped Parallax
- Mouse movement creates subtle 3D depth effect
- Uses depth maps to calculate displacement
- Respects `prefers-reduced-motion`
- Mobile: reduced parallax strength (0.03 vs 0.08)

### Glass Panel System
- **Product panels**: Full product detail with variants, add-to-cart, VTO
- **Collection panels**: Product grid with filters
- **Search panels**: Search results in grid format
- All fetched via Section Rendering API

### Wishlist Manager
- Guest-friendly (localStorage-backed)
- Accessible from fixed header
- Syncs across sessions
- Heart icon on product cards

### Virtual Try-On (VTO)
- Available on product panels
- Requires customer login
- Upload photo → see product on you
- Privacy-first (consent required)

---

## 🔗 Deep-Link Parameters

The immersive store supports URL parameters for direct navigation:

| Parameter | Effect | Example |
|-----------|--------|---------|
| `?open_product={handle}` | Opens product glass panel | `/pages/immersive?open_product=silk-saree` |
| `?open_collection={handle}` | Opens collection grid panel | `/pages/immersive?open_collection=suffuse` |
| `?open_search={terms}` | Opens search results panel | `/pages/immersive?open_search=bridal` |

**Priority**: `open_product` > `open_collection` > `open_search`

---

## 🎯 User Flows

### Flow 1: Browse Designer Houses
1. Land on `/pages/immersive` (Storefront room)
2. Click "Enter Store" hotspot → Lounge room
3. Click "Explore Designers" hotspot → Designer Houses editorial opens
4. Scroll through 3 designer tiles
5. Click "Explore Collection" on Suffuse → Collection grid opens in glass panel
6. Click product card → Product detail opens in glass panel
7. Select variant → Add to cart
8. Close panel → Back to editorial
9. Close editorial → Back to Lounge

### Flow 2: Deep-Link from 2D Store
1. Browse `/collections/suffuse` (standard Dawn page)
2. See "View in 3D Store" bridge CTA
3. Click → `/pages/immersive?open_collection=suffuse`
4. Immersive store loads → Collection grid opens automatically
5. Browse products in glass panel
6. Click 3D→2D switch → Return to `/`

### Flow 3: Search in Immersive Store
1. In immersive store, click search icon in header
2. Type "bridal" → Enter
3. Search results open in glass panel
4. Click product → Product detail opens
5. Add to wishlist → Heart icon fills
6. Close panel → Back to showroom

---

## 🛠️ Technical Stack

### Frontend
- **Three.js**: WebGL rendering, depth maps, parallax
- **Vanilla JS**: No build step, no bundler
- **Liquid**: Templating, translations, schema
- **CSS**: BEM naming, scoped via `{% stylesheet %}`

### Shopify Integration
- **Section Rendering API**: Dynamic panel content
- **Online Store 2.0**: JSON templates, section schemas
- **Dawn base**: Extends Dawn architecture
- **Localization**: All strings use `| t` filter

### Performance
- Conditional script loading (page.immersive only)
- Texture caching (last 2-3 rooms)
- RequestAnimationFrame throttling
- Reduced motion support
- Mobile-optimized textures

---

## 📱 Responsive Behavior

### Desktop (≥769px)
- Full parallax effect (strength: 0.08)
- High-res textures (1600px width)
- Pixel ratio capped at 2
- All features enabled

### Mobile (<769px)
- Reduced parallax (strength: 0.03)
- Mobile-optimized textures (900px width)
- Pixel ratio capped at 1.5
- Touch-friendly hotspots
- Tilt control experiment (opt-in)

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Focus trap in dialogs
- Escape to close panels
- Focus restoration on close

### Screen Readers
- Semantic HTML (`<section>`, `<nav>`, `<button>`)
- ARIA labels on all icons
- `role="dialog"` on overlays
- `aria-live` regions for feedback

### Motion Sensitivity
- Respects `prefers-reduced-motion`
- Disables parallax when detected
- Disables camera animations
- Instant transitions fallback

---

## 🎬 How to View It

### Option 1: Development Server (Recommended)
```bash
shopify theme dev
```
Then visit the preview URL and navigate to `/pages/immersive`

### Option 2: Push to Development Theme
```bash
shopify theme push --development
```
Then visit your store's development theme

### Option 3: View Live Theme
If already pushed to live:
```
https://shahana-uk.myshopify.com/pages/immersive
```

---

## 🐛 Known Issues & Gaps

See `immersive-known-gaps.md` for:
- Dead code to be removed
- Technical debt
- Future improvements

---

## 📚 Related Documentation

- `structure.md` — Project structure
- `tech.md` — Tech stack details
- `shopify.dev_assistant.md` — Development guidelines
- `immersive-store.md` — Full architecture guide
- `product.md` — Product context
