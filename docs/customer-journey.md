# Shahana Collection — 3D Store Customer Journey

> **Purpose:** This document maps every shopper touchpoint in the immersive 3D store at `/pages/immersive`, describes the technical architecture behind each transition, and provides AI image-generation prompts for every visual touchpoint. It is intended for the content team and any AI agent generating on-brand imagery for the store.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Journey Map](#journey-map)
   - [Phase 1 — Discovery](#phase-1--discovery)
   - [Phase 2 — Entry](#phase-2--entry)
   - [Phase 2G — Guided Mode (Concierge Sequence)](#phase-2g--guided-mode-concierge-sequence)
   - [Phase 3 — Room Navigation](#phase-3--room-navigation)
   - [Phase 4 — Editorial Exploration](#phase-4--editorial-exploration)
   - [Phase 5 — Product Browsing](#phase-5--product-browsing)
   - [Phase 6 — Cart & Checkout](#phase-6--cart--checkout)
   - [Phase 7 — Return Visit](#phase-7--return-visit)
3. [Image Prompt Guidance](#image-prompt-guidance)
4. [Enhancement Touchpoints](#enhancement-touchpoints)

---

## Architecture Overview

The immersive store uses a three-layer rendering model:

```
Layer 3 — DOM Overlays (z-index 200+)
  #glass-panel          role="dialog"  — collection + product panels
  #immersive-editorial-overlay  role="dialog"  — editorial room stories
  #immersive-wishlist-panel     role="dialog"  — saved items
  #immersive-quick-add-modal    role="dialog"  — quick add to cart

Layer 2 — DOM UI Layer (z-index 10–150)
  #ui-layer             — hotspots, room badge, next-actions bar
  .immersive-header     — fixed header (search, menu, cart, wishlist)
  .immersive-bottom-nav — floating bottom nav (outside #ui-layer)
  .immersive-room-recommender-chip — bottom-right recommendation

Layer 1 — WebGL Canvas (z-index 0)
  <canvas id="immersive-canvas"> — Three.js renderer
  Depth-map parallax driven by mouse + tilt (mobile)
  Room textures: base image + depth map per room
```

### Section Rendering API pattern

All panel and editorial content is fetched at runtime:

| Endpoint | Content |
|----------|---------|
| `/collections/{handle}?section_id=immersive-product-grid` | Product grid inside glass-panel |
| `/products/{handle}?section_id=glass-product` | Product detail inside glass-panel |
| `{pathname}?section_id={editorial-section-id}` | Editorial overlay content |

All fetches go through `fetchWithCache(url)` — URL-keyed, adds `X-Requested-With: XMLHttpRequest`.

### State objects

| Object | Purpose |
|--------|---------|
| `immersiveState` | `{ mode, currentRoom, editorialRoom, lastHotspot, guided }` |
| `_browsingContext` | `{ visitedRooms, savedProducts, viewedCollections, cartCollections }` |
| `contentCache` | URL-keyed HTML cache for Section Rendering API responses |

### Room structure

```
storefront → lounge → designer_houses
                    → occasions
                    → featured_collections
```

Each room has `baseTextureUrl`, `depthMapUrl` (mobile variants too), and `hotspots[]`.

---

## Journey Map

### Phase 1 — Discovery

#### Touchpoint 1.1 — 2D Homepage Bridge

**Trigger:** Shopper lands on `/` (standard Dawn homepage)
**System response:** Dawn renders the homepage with a Bridge CTA pill pointing to `/pages/immersive`
**Key files:** `templates/index.json`, `snippets/immersive-bridge-btn.liquid`, `assets/bridge-behavior.js`
**State changes:** None — pre-immersive

---

### Phase 2 — Entry

#### Touchpoint 2.1 — Storefront (First Scene)

**Trigger:** Shopper navigates to `/pages/immersive`
**System response:**
- `safeBindImmersiveInit()` fires on DOMContentLoaded
- Three.js loads the storefront room texture + depth map (separate desktop 16:9 and mobile 9:16 assets)
- Depth-map parallax begins responding to mouse (desktop) or gyroscope tilt (mobile, opt-in)
- Single hotspot: `[Start Experience]` at centre-bottom
- Onboarding overlay shown if first visit
**Key files:** `sections/immersive-canvas.liquid`, `assets/immersive-store.js`
**State:** `immersiveState.mode = 'showroom'`, `currentRoom = 'storefront'`, `guided = false`

#### Touchpoint 2.2 — Onboarding Overlay

**Trigger:** First visit (no `immersive_onboarding_seen` in localStorage)
**System response:** `#immersive-onboarding` dialog shown; focus moves to dismiss button; escape or dismiss writes flag and removes overlay
**Key files:** `sections/immersive-canvas.liquid`, `assets/immersive-store.js`

#### Touchpoint 2.3 — Start Experience CTA

**Trigger:** Shopper clicks `[Start Experience]` hotspot (replaces old "Enter Store")
**System response:**
- `activateGuidedMode()` fires — sets `immersiveState.guided = true`, step dots appear (top-centre), idle timer starts
- `goToRoom('lounge')` — Three.js transitions to lounge
**State:** `currentRoom = 'lounge'`, `guided = true`, `_guidedStep = 0`

---

### Phase 2G — Guided Mode (Concierge Sequence)

> Guided mode is a luxury concierge experience that leads the shopper through a curated narrative: Lounge → Editorial → Collection. It activates on "Start Experience" and exits immediately on any manual intent. The featured wing (which editorial room to enter) is merchant-configurable in the theme editor.

#### Touchpoint 2G.1 — Lounge (Guided Step 0)

**Trigger:** Arrival via "Start Experience"
**System response:**
- Step dot 0 activates (gold)
- After 3.5s idle: soft prompt appears — `[Begin a curated experience]` / `[Explore freely]`
- After 10s idle (or prompt CTA click): auto-advances to editorial
- Any user activity (mouse/touch/scroll/keydown) resets the 10s timer
**State:** `guided = true`, `_guidedStep = 0`

#### Touchpoint 2G.2 — Soft Prompt

**Trigger:** 3.5s of idle in lounge while guided mode is active
**System response:** Glassmorphism pill appears above bottom nav with two actions:
- `[Begin a curated experience]` → immediately advances to editorial
- `[Explore freely]` → calls `exitGuidedMode()`, sets `immersive_guided_dismissed` in sessionStorage
**Key files:** `assets/immersive-store.js` — `showGuidedPrompt()`, `hideGuidedPrompt()`

#### Touchpoint 2G.3 — Editorial Entry (Guided Step 1)

**Trigger:** 10s idle OR prompt CTA click
**System response:**
- Step dot 1 activates
- `enterEditorialMode(featuredWing, null)` fires (featured wing = merchant setting, default: `designer_houses`)
- Editorial overlay opens with hero parallax active
- Idle timer resets — 10s before auto-advancing to collection
**State:** `mode = 'editorial'`, `editorialRoom = featuredWing`, `_guidedStep = 1`

#### Touchpoint 2G.4 — Collection Entry (Guided Step 2)

**Trigger:** 10s idle in editorial while guided mode is active
**System response:**
- Step dot 2 activates
- `exitEditorialMode()` fires
- `openCollectionPanel(firstCollection)` opens the first collection from the featured wing's hotspots
- Guided mode exits after this step (`exitGuidedMode()`)
**State:** `guided = false`, glass-panel open, `_guidedStep = 2`

#### Touchpoint 2G.5 — Guided Mode Exit (Any Manual Intent)

**Trigger:** Any of: manual hotspot click, panel open, bottom nav (wishlist/cart), search, swipe, `[Explore freely]` click
**System response:**
- `exitGuidedMode()` fires immediately
- Step dots hide
- Timers cleared
- `immersive_guided_dismissed = '1'` written to sessionStorage (prevents restart in same session)
**State:** `guided = false`

---

### Phase 3 — Room Navigation

#### Touchpoint 3.1 — Lounge (Discovery Hub)

**Trigger:** Arrival from storefront or Back to Lounge from any editorial overlay
**System response:** Three.js renders lounge. Three hotspots appear: `[Designer Houses]`, `[Occasions]`, `[Featured Collections]`
**Key files:** `assets/immersive-store.js` — `STORE_ROOMS.lounge.hotspots`
**State:** `currentRoom = 'lounge'`
**Enhancement:** VisitedRoomsIndicator marks previously visited rooms in room picker

#### Touchpoint 3.2 — Bottom Navigation Bar

**Trigger:** Visible on all room views; hidden when glass-panel is open
**System response:** `initImmersiveBottomNav()` — four items: Rooms, Wishlist, Cart, Classic Store; badges sync from `_wishlistItems` and cart count
**Key files:** `sections/immersive-canvas.liquid`, `assets/immersive-store.js`, `assets/immersive-theme.css`

#### Touchpoint 3.3 — Room Picker Sheet

**Trigger:** Shopper taps `[Rooms]` in bottom nav
**System response:** `syncVisitedRooms()` runs first (applies `.is-visited` to visited rooms), then `roomPicker.hidden = false`; shopper can jump to any room directly
**Enhancement:** VisitedRoomsIndicator — gold checkmark on visited room buttons
**State:** `_browsingContext.visitedRooms` read

#### Touchpoint 3.4 — Wing Entry (Designer Houses / Occasions / Featured Collections)

**Trigger:** Shopper taps a lounge hotspot
**System response:** `goToRoom(roomKey)` — texture transition; new hotspots rendered; `trackRoomVisit(roomKey)` appends to `_browsingContext.visitedRooms`
**State:** `currentRoom = roomKey`

#### Touchpoint 3.5 — Swipe Navigation (Mobile)

**Trigger:** Horizontal swipe on canvas (ratio > 2.5, distance ≥ 60px, panel closed)
**System response:** `ImmersiveGestures` fires `goToRoom(adjacentRoom)` in circular sequence
**Enhancement:** Swipe-down (panel closed) now also triggers `EditorialScrollReveal`

#### Touchpoint 3.6 — Room Recommender Chip

**Trigger:** On wishlist change, room exit, or panel close — `evaluateRoomRecommendation()` runs
**System response:** Rule engine evaluates `_browsingContext`; if a recommendation fires, a dismissible chip appears bottom-right with room thumbnail, label, and reason
**State:** `_browsingContext` read; dismissal stored in `sessionStorage`

---

### Phase 4 — Editorial Exploration

#### Touchpoint 4.1 — Scroll-to-Reveal Editorial (NEW)

**Trigger:** Shopper scrolls down (wheel event, desktop) or swipes down (mobile) while in `designer_houses`, `occasions`, or `featured_collections` room, with no panel open
**System response:** `_esrTrigger()` → parallaxStrength eases to 0 over 300ms → `enterEditorialMode(currentRoom, null)` fires
**Key files:** `assets/immersive-store.js` — `initEditorialScrollReveal()`, `_esrEaseOutParallax()`
**State:** `immersiveState.mode = 'editorial'`, `editorialRoom = currentRoom`

#### Touchpoint 4.2 — Editorial Hotspot Click (Existing)

**Trigger:** Shopper clicks `[Explore Designers]` / `[Our Occasions]` / `[Featured Stories]` hotspot (type: `editorial`)
**System response:** Same as 4.1 — `enterEditorialMode(roomKey, triggerEl)` — but with a trigger element for focus restoration
**State:** Same as 4.1

#### Touchpoint 4.3 — Editorial Overlay Active

**Trigger:** After `enterEditorialMode()` completes content fetch + DOM activation
**System response:**
- Canvas blurs (`editorial-blur` CSS class)
- Overlay fades in (`is-active`)
- `EditorialBackToLounge` button populated and shown
- `EditorialHeroParallax` starts — `initEditorialHeroParallax()` attaches scroll listener + rAF loop on `.immersive-editorial__hero-bg`
**Key files:** `sections/immersive-editorial.liquid`, `assets/immersive-store.js`

#### Touchpoint 4.4 — Editorial Hero Parallax (NEW)

**Trigger:** Shopper scrolls the editorial overlay
**System response:** `_ehpOnScroll()` updates `_ehpScrollTarget = min(scrollTop * 0.3, 60)`; rAF loop lerps hero image `translateY`
**Enhancement:** CSS parallax — no WebGL involvement

#### Touchpoint 4.5 — Editorial Collection Click

**Trigger:** Shopper clicks a collection card or brand tile inside the editorial
**System response:** `exitEditorialMode()` → `openCollectionPanel(handle)` (120ms delay for transition)
**State:** `mode = 'showroom'`, glass-panel opens

#### Touchpoint 4.6 — Back to Room (Close Editorial)

**Trigger:** Shopper clicks the back/close button (`#immersive-editorial-back`)
**System response:** `exitEditorialMode()` → `destroyEditorialHeroParallax()` → overlay deactivates; focus restores to trigger element (or first hotspot)
**State:** `mode = 'showroom'`, `editorialRoom = null`

#### Touchpoint 4.7 — Back to Lounge from Editorial (NEW)

**Trigger:** Shopper clicks `[Back to Lounge]` chip inside editorial overlay
**System response:** `exitEditorialMode()` then `goToRoom('lounge')` — returns to hub without passing through the 3D room first
**Enhancement:** EditorialBackToLounge — hidden when current editorial room is `lounge`

---

### Phase 5 — Product Browsing

#### Touchpoint 5.1 — Collection Panel Open

**Trigger:** Shopper clicks a `targetCollection` hotspot in any room
**System response:** `openCollectionPanel(handle)` → `fetchWithCache(url)` → HTML injected into `#glass-panel`; panel activates; `initImmersiveFilters()` runs after content loads; `initImmersiveLimitedTime()` scans new cards
**State:** glass-panel open, `_browsingContext.viewedCollections` updated

#### Touchpoint 5.2 — Filter Toolbar (ImmersiveFilters)

**Trigger:** Injected automatically when collection panel opens
**System response:** Color swatches, price range, designer chips, sort dropdown injected above grid; state persisted to `sessionStorage` as `immersive_filters_{roomKey}`
**State:** `FilterState` in sessionStorage

#### Touchpoint 5.3 — Product Card Tilt (NEW)

**Trigger:** Shopper hovers mouse over a product card inside glass-panel (pointer:fine devices only)
**System response:** `_pctOnMouseMove()` computes normalised cursor offset → rAF applies `perspective(600px) rotateX() rotateY()` (max 8deg) to card; `mouseleave` resets with 400ms ease-out
**Enhancement:** ProductCardTilt — CSS-only depth effect, no WebGL

#### Touchpoint 5.4 — Quick Add Button

**Trigger:** Shopper clicks `[+ Add]` on a product card
**System response:** `openQuickAdd(handle)` → fetches `/products/{handle}.js`; single-variant → direct cart add; multi-variant → modal with radiogroup, focus trap, Escape closes
**State:** Cart badge updates, `showAfterAddToCart()` fires

#### Touchpoint 5.5 — Product Panel Open

**Trigger:** Shopper clicks a product card link or product result in search
**System response:** `openProductPanel(handle)` → glass-panel loads `glass-product.liquid` content; variant picker, size chart, share links, VTO widget, recommendations all render
**State:** `_browsingContext.savedProducts` may update; 8s timer starts for `showAfterProductView()`

#### Touchpoint 5.6 — Wishlist Save

**Trigger:** Shopper taps the heart/save button on a product card or in the product panel
**System response:** `toggleWishlistItem(handle)` → `localStorage` update → `updateWishlistBadge()` → `updateBottomNavBadges()` → `evaluateRoomRecommendation()` may fire a new chip
**State:** `_browsingContext.savedProducts` updated, `_wishlistItems` updated

#### Touchpoint 5.7 — Next Actions Bar

**Trigger:** After product panel open ≥ 8s (or explicit close), add-to-cart success, or room complete
**System response:** `showNextActions([...chips])` — singleton bar appears above bottom nav with contextual action chips; auto-dismisses after 6s
**State:** Singleton — new trigger replaces existing bar

#### Touchpoint 5.8 — Search

**Trigger:** Shopper types in the inline search input (header) or presses Cmd/Ctrl+K
**System response:** 200ms debounce → `/search/suggest` API → grouped dropdown (Products / Collections / Rooms); keyboard navigation with `aria-activedescendant`
**State:** Search results in `_searchResults`; selection dispatches to `openProductPanel`, `openCollectionPanel`, or `goToRoom`

---

### Phase 6 — Cart & Checkout

#### Touchpoint 6.1 — Add to Cart

**Trigger:** Shopper confirms add in quick-add modal, or taps Add to Cart in product panel
**System response:** POST to `/cart/add.js` → success toast → cart badge updates → `showAfterAddToCart()` fires
**State:** `_browsingContext.cartCollections` updated

#### Touchpoint 6.2 — Cart Panel / Checkout

**Trigger:** Shopper taps Cart in bottom nav or header
**System response:** Dawn's native cart drawer or cart page; exits the 3D experience
**State:** `immersive_preferred_mode = '3d'` written to localStorage (via `writeImmersivePreference()`)

---

### Phase 7 — Return Visit

#### Touchpoint 7.1 — Preference Banner (2D Pages)

**Trigger:** Shopper returns to any 2D page after having visited the 3D store
**System response:** `theme.liquid` inline script reads `immersive_preferred_mode`; banner offers return to 3D store
**Key files:** `layout/theme.liquid`, `assets/bridge-behavior.js`

#### Touchpoint 7.2 — Deep-Link Return

**Trigger:** Shopper clicks a Bridge CTA with `?open_product=` or `?open_collection=` param
**System response:** `safeBindImmersiveInit()` reads URL params → auto-opens the appropriate panel after 400ms
**State:** Resumes from `immersiveState` if session state was saved

---

## Image Prompt Guidance

> For each touchpoint that requires a visual asset, the following prompts specify subject, environment, lighting, mood, aspect ratio, and brand style keywords. All prompts are designed for Midjourney v6 (`--style raw`) or DALL-E 3.
>
> **Brand style keywords for all prompts:** luxury Pakistani fashion, gold accent `#d4af37`, editorial photography, glassmorphism overlay, soft bokeh, cinematic lighting, 8K photorealistic
>
> **Tilt bleed rule (room textures only):** Compose key elements in the central 70% of the frame. Leave ≥15% atmospheric bleed on all edges (soft bokeh, receding architecture, open sky) so the depth-map parallax and mobile tilt pan smoothly without revealing hard edges.

---

### Phase 2 — Entry

#### 2.1 Storefront — Base Texture (Desktop 16:9, 1600px)
> Grand Pakistani boutique exterior at golden hour, ornate carved marble archway with a softly glowing entrance, warm amber light spilling onto a white stone forecourt, silk dupatta draped loosely across the frame, central 70% contains the doorway and forecourt, outer 15% fades into soft architectural bokeh and sky, a single glowing CTA button visible at centre-bottom of the scene, editorial luxury fashion photography, 16:9, 8K photorealistic, `--ar 16:9 --style raw --v 6`

#### 2.1 Storefront — "Start Experience" CTA Hotspot
> The hotspot should feel like a glowing invitation, not a button. The room image should have a natural focal point at centre-bottom — a lit doorstep, a glowing threshold, or a pool of warm light — so the "Start Experience" label floats naturally over it.

#### 2.1 Storefront — Depth Map (Greyscale 16:9, 1600px)
> Greyscale luminance depth map of a boutique exterior: foreground arch and draped fabric pure white (near), midground forecourt and columns medium grey, background sky gradient to dark grey, smooth continuous gradient reaching all four edges, no abrupt cuts, no surface texture detail, pure depth information only

#### 2.1 Storefront — Mobile Base Texture (Portrait 9:16, 900px)
> Pakistani boutique entrance at golden hour, portrait orientation, ornate marble doorway centred vertically in the middle 70% of the frame, top 15% soft amber sky bokeh, bottom 15% fading stone floor texture, editorial luxury fashion, 9:16, 8K photorealistic, `--ar 9:16 --style raw --v 6`

### Phase 2G — Guided Mode UI

#### 2G — Step Dots Progress Indicator
> No image needed — pure CSS. Four 6px gold dots (`#d4af37`) on a dark glassmorphism pill, top-centre of viewport. Active dot scales to 1.4×. Completed dots fade to 45% opacity gold.

#### 2G — Soft Prompt Pill
> No image needed — pure CSS glassmorphism. Dark pill with gold CTA text and muted skip text. Appears above the bottom nav after 3.5s idle.

---

### Phase 3 — Room Navigation

#### 3.1 Lounge — Base Texture (Desktop 16:9, 1600px)
> Opulent Pakistani fashion lounge interior at dusk, three visual zones: left corridor arch framing a designer display, centre grand archway leading to a bridal courtyard, right gallery niche with embroidered pieces, deep velvet seating, ornate brass lanterns, warm gold and ivory light, key elements composed in central 70% with atmospheric corridor depths fading to near-black at all edges, editorial luxury fashion, 16:9, 8K photorealistic, `--ar 16:9 --style raw --v 6`

#### 3.1 Lounge — Depth Map (Greyscale 16:9, 1600px)
> Greyscale depth map of a lounge interior: foreground seating and rug pure white, midground arches and lanterns medium grey, far corridors and background walls near black, smooth gradient to all edges, no hard cuts, no texture

#### 3.1 Lounge — Mobile Base Texture (Portrait 9:16, 900px)
> Pakistani fashion lounge interior, portrait orientation, three horizontal navigation zones visible in the central 60%: left arch, centre grand arch, right gallery, top 15% decorative ceiling and chandelier bokeh, bottom 15% Persian rug fading to black, editorial fashion, 9:16, 8K photorealistic

---

### Wing 1 — Designer Houses

#### Designer Houses — 3D Room Base Texture (Desktop 16:9, 1600px)
> High-fashion Pakistani atelier showroom, three brand display zones across the width, polished white marble floor with gold veining, spotlit mannequins in embroidered couture, minimalist architectural shelving, centre zone slightly brighter, all brand display elements in central 70%, outer 15% fades to architectural shadow and marble depth, editorial fashion photography, 16:9, 8K photorealistic, `--ar 16:9 --style raw --v 6`

#### Designer Houses — Depth Map (Greyscale 16:9, 1600px)
> Greyscale depth map of a fashion atelier: foreground floor and mannequin bases pure white, midground display fixtures medium grey, background walls near black, smooth edge gradients, no texture

#### Suffuse — Editorial Hero Background (16:9, 1600px)
> Minimalist luxury fashion atelier, single ivory-on-ivory embroidered lehenga on a mannequin under one directional spotlight, polished white marble floor, off-white walls, extreme negative space, the garment fills the left-centre of the frame, editorial fashion photography, 16:9, 8K photorealistic

#### Soraya — Editorial Hero Background (16:9, 1600px)
> Opulent fashion showroom with deep midnight blue velvet walls, brass and gold display fixtures, a heavily embellished navy and gold gharara displayed under warm tungsten light, dark luxury editorial aesthetic, 16:9, 8K photorealistic

#### Saad Bin Shahzad — Editorial Hero Background (16:9, 1600px)
> Contemporary Pakistani fashion studio, raw polished concrete walls with dramatic raking side light, a structured black sherwani with fine gold thread embroidery on a mannequin, architectural minimalism meets couture, 16:9, 8K photorealistic

---

### Wing 2 — Occasions

#### Occasions — 3D Room Base Texture (Desktop 16:9, 1600px)
> Ethereal Pakistani bridal haveli courtyard at dusk, string lights and marigold garland arches overhead, rose and jasmine petals on white marble, four softly lit display zones across the width (Eid, Bridal, Formals, Pret), key display elements in central 70%, outer 15% fades to soft garden bokeh and evening sky, editorial fashion photography, 16:9, 8K photorealistic, `--ar 16:9 --style raw --v 6`

#### Occasions — Depth Map (Greyscale 16:9, 1600px)
> Greyscale depth map of a haveli courtyard: foreground petals and garland arch pure white, midground courtyard floor and pillars medium grey, background archways near black, smooth edge gradients

#### Bridal — Occasion Card (Portrait 3:4, 1200px)
> Pakistani bride in a heavily embroidered crimson and gold bridal lehenga with full jewellery set, standing in a haveli archway at golden hour, marigold garlands in the background, soft directional light, editorial fashion photography, portrait 3:4, 8K photorealistic, `--ar 3:4 --style raw --v 6`

#### Mehndi — Occasion Card (Portrait 3:4, 1200px)
> Pakistani woman in a vibrant yellow and lime green mehndi outfit with intricate henna on hands, surrounded by marigold and rose petals, warm afternoon garden light, joyful editorial fashion photography, portrait 3:4, 8K photorealistic

#### Eid — Occasion Card (Portrait 3:4, 1200px)
> Pakistani woman in a pastel mint and silver embroidered shalwar kameez, standing in a grand marble mosque courtyard at Eid morning, soft diffused light, serene editorial fashion photography, portrait 3:4, 8K photorealistic

#### Luxury Formals — Occasion Card (Portrait 3:4, 1200px)
> Pakistani woman in a deep emerald heavily embroidered formal gown, standing in a candlelit ballroom with ornate crystal chandeliers, elegant evening editorial fashion photography, portrait 3:4, 8K photorealistic

---

### Wing 3 — Featured Collections

#### Featured Collections — 3D Room Base Texture (Desktop 16:9, 1600px)
> Contemporary Pakistani fashion gallery, stark white walls with dramatic directional spotlights, three oversized editorial lookbook prints mounted on gallery walls, polished concrete floor with a single ornate gold-framed mirror at centre, curated edit display zones in central 70%, outer 15% fades to gallery shadow and architectural depth, editorial fashion photography, 16:9, 8K photorealistic, `--ar 16:9 --style raw --v 6`

#### Featured Collections — Depth Map (Greyscale 16:9, 1600px)
> Greyscale depth map of a gallery space: foreground mirror and floor pure white, midground wall prints medium grey, background far walls near black, smooth gradients, no texture

#### Featured Item Card — Generic (Landscape 4:3, 1000px)
> Pakistani luxury fashion editorial, three models in coordinated embroidered outfits in a minimalist white studio with gold accent props, overhead soft box lighting, 4:3, 8K photorealistic, `--ar 4:3 --style raw --v 6`

---

### Phase 5 — Product Browsing

#### 5.1 Collection Panel Header / Banner (Landscape 16:9, 1600px)
> Pakistani luxury fashion collection banner, editorial flat lay or model shot on neutral marble background, gold jewelry and embroidered fabric details visible, wide cinematic composition, 16:9, 8K photorealistic

#### 5.5 Product Gallery — On-Model Shot (Square 1:1, 1200px)
> Pakistani woman wearing an embroidered luxury outfit, shot in a minimalist white studio with soft wrap lighting, full-length portrait, product details clearly visible, editorial fashion photography, 1:1, 8K photorealistic

#### 5.5 Product Gallery — Detail Close-Up (Square 1:1, 1200px)
> Extreme close-up of Pakistani embroidery work — gold zari threadwork on deep jewel-toned fabric, macro editorial photography, soft directional lighting revealing texture depth, 1:1, 8K photorealistic

---

## Enhancement Touchpoints

| Enhancement | Touchpoint | Trigger | Key File |
|-------------|-----------|---------|----------|
| GuidedMode | 2.3, 2G.1–2G.5 | "Start Experience" CTA click | `immersive-store.js`, `immersive-canvas.liquid`, `immersive-theme.css` |
| EditorialScrollReveal | 4.1 | Wheel/swipe-down in room (panel closed) | `immersive-store.js` |
| EditorialBackToLounge | 4.7 | Click `[Back to Lounge]` chip in editorial | `immersive-store.js`, `immersive-canvas.liquid` |
| VisitedRoomsIndicator | 3.3 | Room picker opens; `trackRoomVisit()` fires | `immersive-store.js`, `immersive-theme.css` |
| EditorialHeroParallax | 4.4 | Scroll inside editorial overlay | `immersive-store.js`, `immersive-theme.css` |
| ProductCardTilt | 5.3 | Mousemove on product card (pointer:fine) | `immersive-store.js`, `immersive-product-card.liquid` |

### Guided Mode — State & Timing Reference

| State | Value | Meaning |
|-------|-------|---------|
| `immersiveState.guided` | `true` | Guided sequence active |
| `immersiveState.guided` | `false` | Free browsing |
| `_guidedStep` | `0` | Lounge |
| `_guidedStep` | `1` | Editorial |
| `_guidedStep` | `2` | Collection (guided exits) |
| `sessionStorage.immersive_guided_dismissed` | `'1'` | Won't restart this session |

| Timer | Duration | Purpose |
|-------|----------|---------|
| Soft prompt | 3.5s | Show "Begin a curated experience" pill |
| Auto-advance | 10s | Move to next step |
| Timer reset | On any user activity | Prevents rushed feeling |

---

*Last updated: after guided mode + Start Experience CTA implementation.*
