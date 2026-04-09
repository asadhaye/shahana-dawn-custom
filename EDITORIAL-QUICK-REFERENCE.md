# Editorial Quick Reference

**For:** Quick lookup of editorial room details, hotspots, and configuration

---

## The 3 Editorial Rooms at a Glance

| Room | Key | Layout | Hero | Hotspots | Collections | Parallax |
|------|-----|--------|------|----------|-------------|----------|
| **Designer Houses** | `designer_houses` | `designers` | Brand showcase | 1 editorial + 3 brands | Suffuse, Soraya, Saad Bin Shahzad | Yes |
| **Occasions** | `occasions` | `occasions` | Occasion showcase | 1 editorial + 4 occasions | Eid, Bridal, Formals, Casual | Yes |
| **Featured Collections** | `featured_collections` | `collections` | Seasonal showcase | 1 editorial + 3 collections | SS5 Summer, Suffuse Luxury, Soraya Eid | Yes |

---

## Hotspot Positions

### Designer Houses Room

```
Top:    { x: 50, y: 15 } → "Explore Designers" (editorial)
Left:   { x: 13, y: 40 } → "Suffuse" (collection)
Center: { x: 50, y: 45 } → "Soraya" (collection)
Right:  { x: 87, y: 40 } → "Saad Bin Shahzad" (collection)
Bottom: { x: 50, y: 90 } → "Back to lounge" (room)
```

### Occasions Room

```
Top:     { x: 50, y: 15 } → "Our Occasions" (editorial)
Left:    { x: 25, y: 40 } → "Eid Collection" (collection)
Center1: { x: 42, y: 50 } → "Bridal & Mehndi" (collection)
Right:   { x: 58, y: 40 } → "Luxury Formals" (collection)
Center2: { x: 75, y: 50 } → "Casual Pret" (collection)
Bottom:  { x: 50, y: 85 } → "Back to lounge" (room)
```

### Featured Collections Room

```
Top:    { x: 50, y: 15 } → "Featured Stories" (editorial)
Left:   { x: 25, y: 40 } → "SS5 Summer Pret 26" (collection)
Center: { x: 50, y: 50 } → "Suffuse Luxury Pret" (collection)
Right:  { x: 75, y: 40 } → "Soraya Eid Pret" (collection)
Bottom: { x: 50, y: 85 } → "Back to lounge" (room)
```

---

## Theme Editor Configuration

### Designer Houses Settings

```
designer_houses_base_image              → Desktop base texture
designer_houses_base_image_mobile       → Mobile base texture
designer_houses_depth_map               → Desktop depth map
designer_houses_depth_map_mobile        → Mobile depth map
designer_houses_slot_1_collection       → Suffuse collection
designer_houses_slot_1_label            → "Suffuse" label
designer_houses_slot_2_collection       → Soraya collection
designer_houses_slot_2_label            → "Soraya" label
designer_houses_slot_3_collection       → Saad Bin Shahzad collection
designer_houses_slot_3_label            → "Saad Bin Shahzad" label
```

### Occasions Settings

```
occasions_base_image                    → Desktop base texture
occasions_base_image_mobile             → Mobile base texture
occasions_depth_map                     → Desktop depth map
occasions_depth_map_mobile              → Mobile depth map
occasions_slot_1_collection             → Eid collection
occasions_slot_1_label                  → "Eid Collection" label
occasions_slot_2_collection             → Bridal collection
occasions_slot_2_label                  → "Bridal & Mehndi" label
occasions_slot_3_collection             → Formals collection
occasions_slot_3_label                  → "Luxury Formals" label
occasions_slot_4_collection             → Casual collection
occasions_slot_4_label                  → "Casual Pret" label
```

### Featured Collections Settings

```
featured_collections_base_image         → Desktop base texture
featured_collections_base_image_mobile  → Mobile base texture
featured_collections_depth_map          → Desktop depth map
featured_collections_depth_map_mobile   → Mobile depth map
featured_collections_slot_1_collection  → Collection 1
featured_collections_slot_1_label       → Collection 1 label
featured_collections_slot_2_collection  → Collection 2
featured_collections_slot_2_label       → Collection 2 label
featured_collections_slot_3_collection  → Collection 3
featured_collections_slot_3_label       → Collection 3 label
```

---

## Editorial Section Settings

### Section-Level Settings

```
room_key                → designer_houses | occasions | featured_collections
layout                  → designers | occasions | collections
hero_background_image   → Full-width hero background
hero_eyebrow            → Small eyebrow label
hero_heading            → Main heading
hero_subheading         → Rich text intro
```

### Banner Block Settings

```
image                   → Banner image
logo                    → Brand logo (designers layout only)
heading                 → Banner heading
body                    → Rich text body
cta_label               → CTA button text
cta_url                 → CTA destination
collection              → Linked collection
depth_layer             → Parallax depth (0-100)
```

---

## Key Functions

### `enterEditorialMode(roomKey, triggerEl)`

**Called when:** User clicks editorial hotspot  
**Parameters:**
- `roomKey` — `'designer_houses'`, `'occasions'`, or `'featured_collections'`
- `triggerEl` — The hotspot element (for View Transition animation)

**What it does:**
1. Finds editorial section in DOM
2. Fetches section via Section Rendering API
3. Renders HTML into overlay
4. Applies View Transition animation
5. Blurs canvas background
6. Enables scroll parallax

### `exitEditorialMode()`

**Called when:** User clicks back button or presses Escape  
**What it does:**
1. Hides overlay
2. Unblurs canvas
3. Restores focus to hotspot
4. Resets scroll parallax

### `updateCameraForMode()`

**Called when:** Entering/exiting editorial mode  
**What it does:**
- Adjusts camera FOV or parallax strength
- Respects `prefers-reduced-motion`
- Keeps changes subtle

---

## CSS Classes

### Room-Specific

```
.immersive-editorial--designer_houses
.immersive-editorial--occasions
.immersive-editorial--featured_collections
```

### Layout-Specific

```
.immersive-editorial--layout-designers
.immersive-editorial--layout-occasions
.immersive-editorial--layout-collections
```

### Component Classes

```
.immersive-editorial__hero
.immersive-editorial__hero-bg
.immersive-editorial__hero-panel
.immersive-editorial__eyebrow
.immersive-editorial__heading
.immersive-editorial__subheading
.immersive-editorial__banners
.immersive-editorial__banner
.immersive-editorial__banner-media
.immersive-editorial__banner-logo
.immersive-editorial__banner-content
.immersive-editorial__banner-heading
.immersive-editorial__banner-body
.immersive-editorial__cta
.immersive-editorial__collection-link
```

---

## Locale Keys

### Editorial Hotspot Labels

```
sections.immersive_store.nav_explore_designers      → "Explore Designers"
sections.immersive_store.nav_our_occasions          → "Our Occasions"
sections.immersive_store.nav_featured_stories       → "Featured Stories"
```

### Editorial Section Strings

```
sections.immersive_editorial.loading                → "Loading…"
sections.immersive_editorial.error_unavailable      → "The story is temporarily unavailable."
sections.immersive_editorial.try_again              → "Try again"
sections.immersive_editorial.overlay_title          → "Editorial Content"
```

---

## State Variables

### `immersiveState`

```javascript
immersiveState.mode              // 'browsing' or 'editorial'
immersiveState.currentRoom       // Current 3D room
immersiveState.editorialRoom     // Current editorial room (if in editorial mode)
immersiveState.lastHotspot       // Hotspot that triggered editorial
```

### Scroll Parallax

```javascript
editorialScrollProgress          // 0 to 1 (scroll progress)
editorialOverlayEl               // Cached overlay element
editorialMaxScroll               // Cached max scroll value
```

---

## localStorage Keys

```
immersive_onboarding_seen        → '1' (suppress onboarding)
immersive_wishlist               → JSON array of handles
immersive_cookie_notice          → '1' (suppress cookie banner)
immersive_preferred_mode         → '3d' (user visited 3D store)
```

---

## File Locations

| File | Purpose |
|------|---------|
| `sections/immersive-canvas.liquid` | Renders JSON config block |
| `sections/immersive-editorial.liquid` | Reusable editorial section |
| `assets/immersive-store.js` | Three.js engine + editorial functions |
| `templates/page.immersive.json` | Template with 3 editorial sections |
| `locales/en.default.json` | Translation keys |

---

## Common Tasks

### Add a New Editorial Banner

1. Go to **Customize → Home page → Immersive Editorial → [Room Name]**
2. Click **Add Banner**
3. Fill in:
   - Image
   - Heading
   - Body text
   - CTA label + URL
   - (Optional) Logo (designers layout only)
   - (Optional) Collection link
4. Save

### Change a Room's Base Image

1. Go to **Customize → Homepage → Immersive Canvas**
2. Scroll to **[Room Name] Settings**
3. Upload new base image
4. Save

### Change a Collection Hotspot

1. Go to **Customize → Homepage → Immersive Canvas**
2. Scroll to **[Room Name] Settings**
3. Change **Slot [N] Collection** picker
4. (Optional) Change **Slot [N] Label**
5. Save

### Adjust Parallax Depth

1. Go to **Customize → Home page → Immersive Editorial → [Room Name]**
2. Click on a banner block
3. Adjust **Depth Layer** slider (0-100)
4. Save

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Editorial overlay doesn't open | Section instance ID not found | Verify `data-section-id` is present on section element |
| Scroll parallax not working | Uniforms not updated | Check `editorialScrollProgress` is being calculated |
| Hotspot doesn't morph | View Transition API not supported | Fallback to instant transition (expected on Safari/Firefox) |
| Focus not restored | `lastHotspot` not saved | Verify `immersiveState.lastHotspot = triggerEl` is called |
| Editorial content not loading | Section Rendering API fetch failed | Check network tab for 404 or 500 errors |

---

## Performance Tips

1. **Cache overlay element** on entry to avoid per-frame DOM queries
2. **Only read `scrollTop`** per frame (cheap, no layout)
3. **Lerp scroll progress** at factor 0.1 for smooth animation
4. **Clear cached values** on exit to free memory
5. **Use `requestAnimationFrame`** for all animations
6. **Lazy-load images** in editorial content
7. **Respect `prefers-reduced-motion`** for animations

---

**Quick reference complete!** 🚀
