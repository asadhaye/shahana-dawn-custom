# Immersive Shopping Journey — Complete User Flow

**Status:** In Progress  
**Priority:** High  
**Owner:** Shahana Collection  
**Last Updated:** April 28, 2026

---

## Overview

This spec documents the complete user shopping journey through the Shahana Collection immersive store — from entry point through product discovery, selection, and checkout. It ties together all immersive store pieces (canvas, editorial, product panels, cart, checkout) into a cohesive experience.

### Goals

1. **Seamless navigation** — Users move fluidly between 3D rooms, editorial overlays, product panels, and cart
2. **Context preservation** — State (room, mode, focus) persists across interactions
3. **Accessibility first** — All interactions keyboard-navigable, screen-reader friendly, reduced-motion aware
4. **Performance** — Lazy-load textures, cache panels, throttle parallax
5. **Conversion** — Clear CTAs, minimal friction, trust signals (wishlist, recommendations, reviews)

---

## Architecture Overview

### Core Components

| Component | File | Responsibility |
|-----------|------|-----------------|
| **Canvas** | `sections/immersive-canvas.liquid` | WebGL canvas, hotspot UI, fixed header, overlay shells |
| **State Manager** | `assets/immersive/core/state-manager.js` | Session state, preferences, persistence |
| **Store Engine** | `assets/immersive-store.js` | Three.js scene, room rendering, parallax, navigation |
| **Editorial** | `sections/immersive-editorial.liquid` | Room-specific content (designers, occasions, featured) |
| **Product Panel** | `sections/glass-product.liquid` | Product detail, variants, VTO, add-to-cart |
| **Product Grid** | `sections/immersive-product-grid.liquid` | Collection/search results grid |
| **Cart** | `sections/immersive-cart.liquid` | Cart drawer, item management |
| **Checkout** | `sections/immersive-checkout.liquid` | Checkout flow, order confirmation |

### Data Flow

```
User enters /pages/immersive
    ↓
safeBindImmersiveInit() — guards against double-init
    ↓
initImmersiveScene() — Three.js setup, room textures, hotspots
    ↓
bindImmersiveNav() — wire hotspot clicks, room transitions
    ↓
showImmersiveOnboardingIfNeeded() — first-time user guidance
    ↓
User interacts with hotspots/UI
    ↓
State updates (currentRoom, mode, editorialRoom)
    ↓
Panels open via Section Rendering API
    ↓
User adds to cart / continues shopping
    ↓
Cart drawer opens
    ↓
User proceeds to checkout
```

---

## User Journey Stages

### Stage 1: Entry & Onboarding

**Trigger:** User navigates to `/pages/immersive` or clicks Bridge CTA from 2D store

**Flow:**
1. Canvas renders with `storefront` room (default)
2. Onboarding overlay appears (if first-time visitor)
3. User dismisses onboarding → focus returns to canvas
4. Preference banner written to localStorage (`immersive_preferred_mode = '3d'`)

**Key Functions:**
- `safeBindImmersiveInit()` — entry point, guards re-init
- `showImmersiveOnboardingIfNeeded()` — conditional onboarding
- `writeImmersivePreference()` — persist 3D preference

**Accessibility:**
- Onboarding overlay: `role="dialog" aria-modal="true"`, focus trap, Escape to close
- Dismiss button restores focus to canvas

---

### Stage 2: Room Navigation & Exploration

**Trigger:** User clicks hotspot or uses keyboard navigation

**Flow:**
1. Hotspot click detected → `handleHotspotClick(hotspot)`
2. State updates: `immersiveState.currentRoom = newRoom`
3. Camera transitions to new room (Three.js animation)
4. Textures load for new room (cached if available)
5. Hotspots update for new room
6. Analytics recorded: `recordBrowsingSignal(roomKey)`

**Rooms:**
- `storefront` — entry room, main lounge
- `designer_houses` — Suffuse, Soraya, Saad Bin Shahzad
- `occasions` — Eid, Bridal, Formals, Casual Pret
- `featured_collections` — seasonal highlights

**Key Functions:**
- `bindImmersiveNav()` — wire hotspot interactions
- `recordBrowsingSignal(roomKey)` — analytics
- `updateHotspotElements()` — refresh hotspots per room
- `focusNextHotspot(direction)` — keyboard navigation

**Accessibility:**
- Hotspots keyboard-navigable (Tab, Shift+Tab, Enter, Arrow keys)
- `announceHotspot(label)` — screen reader announcements
- Hotspot focus visible, high contrast

---

### Stage 3: Editorial Exploration

**Trigger:** User clicks editorial hotspot (e.g., "Explore Designers")

**Flow:**
1. Hotspot has `targetEditorialRoom` property
2. `enterEditorialMode(roomKey, triggerEl)` called
3. State updates: `immersiveState.mode = 'editorial'`, `immersiveState.editorialRoom = roomKey`
4. Editorial overlay (`#immersive-editorial-overlay`) activates
5. Content fetched via Section Rendering API: `GET /pages/immersive?section_id=editorial_designer_houses`
6. Overlay fades in with scroll parallax
7. User scrolls through editorial content (designers, occasions, featured)

**Key Functions:**
- `enterEditorialMode(roomKey, triggerEl)` — activate editorial
- `exitEditorialMode()` — close editorial, restore focus
- `fetchWithCache(url)` — Section Rendering API with caching

**Accessibility:**
- Editorial overlay: `role="dialog" aria-modal="true"`, focus trap
- Scroll parallax respects `prefers-reduced-motion`
- Close button (X) and Escape key both close overlay
- Focus restored to trigger hotspot on close

---

### Stage 4: Product Discovery

**Trigger:** User clicks collection link in editorial or hotspot

**Flow:**
1. Collection link clicked (e.g., "Suffuse")
2. `openCollectionPanel(collectionHandle)` called
3. Glass panel (`#glass-panel`) activates
4. Content fetched: `GET /collections/suffuse?section_id=glass-panel`
5. `immersive-product-grid.liquid` renders product grid
6. Products display with images, prices, quick-view buttons
7. User scrolls through products

**Key Functions:**
- `openCollectionPanel(collectionHandle)` — fetch and render collection
- `openSearchPanel(searchTerms)` — fetch and render search results
- `fetchWithCache(url)` — cache collection/search responses

**Accessibility:**
- Glass panel: `role="dialog" aria-modal="true"`, focus trap
- Product cards: keyboard-navigable, proper focus styles
- Product images: alt text
- Close button and Escape key close panel

---

### Stage 5: Product Detail & Selection

**Trigger:** User clicks product card or "View Details" button

**Flow:**
1. Product card clicked
2. `openProductPanel(productHandle)` called
3. Glass panel content replaced with product detail
4. Content fetched: `GET /products/silk-saree?section_id=glass-product`
5. `glass-product.liquid` renders:
   - Product media gallery (images, video)
   - Product title, price, rating
   - Variant selector (size, color, etc.)
   - Virtual Try-On widget (if customer signed in)
   - Add-to-cart button
   - Related products carousel
   - Share buttons
6. User selects variant and quantity

**Key Functions:**
- `openProductPanel(productHandle)` — fetch and render product
- `loadProductRecommendations(panel)` — fetch related products
- Variant selection via ARIA radiogroup pattern

**Accessibility:**
- Variant picker: `role="radiogroup"`, arrow key navigation
- Add-to-cart button: clear label, loading state
- Product media: alt text, keyboard-navigable gallery
- Price: semantic markup, currency symbol

---

### Stage 6: Add to Cart & Feedback

**Trigger:** User clicks "Add to Cart" button

**Flow:**
1. Variant validation (required fields selected)
2. Add-to-cart request sent to Shopify
3. Success feedback: toast message, cart count updates
4. Cart icon badge shows item count
5. Optional: "View Cart" or "Continue Shopping" CTA
6. Product panel remains open for continued browsing

**Key Functions:**
- Form submission via standard Shopify product form
- `showFeedback(message, type)` — toast notifications
- Cart count update via `updateCartCount()`

**Accessibility:**
- Success message: `role="status" aria-live="polite"`
- Error message: `role="alert" aria-live="assertive"`
- Focus remains on add-to-cart button or moves to feedback

---

### Stage 7: Cart Review

**Trigger:** User clicks cart icon or "View Cart" CTA

**Flow:**
1. Cart drawer (`#immersive-cart`) opens
2. Content fetched: `GET /cart?section_id=immersive-cart`
3. `immersive-cart.liquid` renders:
   - Cart items with images, prices, quantities
   - Item removal buttons
   - Quantity adjusters
   - Subtotal, shipping estimate, taxes
   - "Proceed to Checkout" button
   - "Continue Shopping" button
4. User reviews items, adjusts quantities, or removes items

**Key Functions:**
- `openCartDrawer()` — fetch and render cart
- `updateCartItem(lineId, quantity)` — adjust quantity
- `removeCartItem(lineId)` — remove item

**Accessibility:**
- Cart drawer: `role="dialog" aria-modal="true"`, focus trap
- Quantity input: proper `<input type="number">` semantics
- Remove button: clear label, confirmation optional
- Close button and Escape key close drawer

---

### Stage 8: Checkout

**Trigger:** User clicks "Proceed to Checkout" button

**Flow:**
1. Checkout button clicked
2. User redirected to Shopify checkout (`/checkout`)
3. Standard Shopify checkout flow (not immersive)
4. User completes payment, shipping, billing
5. Order confirmation page

**Note:** Checkout is handled by Shopify's native checkout — immersive store does not override this flow.

---

### Stage 9: Post-Purchase & Return

**Trigger:** User completes order or returns to store

**Flow:**
1. Order confirmation page displays
2. User can:
   - Return to immersive store (`/pages/immersive`)
   - Browse 2D store (`/`)
   - View account orders (`/account/orders`)
3. If returning to immersive store:
   - State resets (room, mode, panels)
   - Preference banner may appear on 2D pages
   - User can continue shopping

**Key Functions:**
- `clearState()` — reset session state on new visit
- Preference banner logic in `theme.liquid`

---

## State Management

### Session State (`immersiveState`)

```javascript
{
  currentRoom: 'storefront',        // Current room key
  mode: 'showroom',                 // 'showroom' | 'editorial' | 'panel'
  editorialRoom: null,              // Room key when in editorial mode
  lastHotspot: null,                // DOM element for focus restoration
  guided: false,                    // Guided sequence mode
  navigationStack: []               // Room history for back button
}
```

### Persistence

| Key | Storage | Purpose | Lifetime |
|-----|---------|---------|----------|
| `immersive_state` | sessionStorage | Room, mode, focus | Session |
| `immersive_preferred_mode` | localStorage | User prefers 3D | Persistent |
| `immersive_onboarding_seen` | localStorage | Skip onboarding | Persistent |
| `immersive_wishlist` | localStorage | Saved items | Persistent |

### State Transitions

```
Entry
  ↓
showroom (default)
  ↓ (hotspot click)
showroom (new room)
  ↓ (editorial hotspot)
editorial
  ↓ (close editorial)
showroom
  ↓ (product click)
panel
  ↓ (close panel)
showroom
  ↓ (cart click)
cart (drawer)
  ↓ (close cart)
showroom
```

---

## Performance Optimization

### Texture Loading

- **Desktop:** 1600px width, 75% quality
- **Mobile:** 900px width, 75% quality
- **Depth maps:** 60% quality
- **Caching:** Last 2–3 rooms cached in memory
- **Lazy load:** Textures load on room entry, not on page load

### Panel Caching

- **Collection panels:** Cached by URL (e.g., `/collections/suffuse?section_id=glass-panel`)
- **Product panels:** Cached by URL (e.g., `/products/silk-saree?section_id=glass-product`)
- **Cache duration:** Session-long (cleared on page reload)
- **Cache size:** Max 10 entries; LRU eviction

### Parallax Throttling

- **Throttle:** `requestAnimationFrame` (60fps max)
- **Lerp factor:** 0.08 (smooth, responsive)
- **Reduced motion:** Parallax disabled when `prefers-reduced-motion: reduce`

### Image Optimization

- **Format:** WebP for depth maps, JPEG for textures
- **Responsive:** `srcset` for product images
- **Lazy load:** Product images in grid use `loading="lazy"`

---

## Accessibility Checklist

### Keyboard Navigation

- [ ] Tab/Shift+Tab cycles through hotspots
- [ ] Arrow keys navigate hotspots (up/down/left/right)
- [ ] Enter/Space activates hotspot
- [ ] Escape closes overlays (editorial, product panel, cart)
- [ ] Tab cycles through dialog controls (close button, form fields)

### Screen Reader Support

- [ ] Hotspots announced with `aria-label`
- [ ] Dialogs have `role="dialog" aria-modal="true" aria-labelledby`
- [ ] Form fields have associated `<label>` elements
- [ ] Feedback messages use `role="status"` or `role="alert"`
- [ ] Product images have descriptive alt text
- [ ] Variant options announced (e.g., "Size: Small, Medium, Large")

### Visual Accessibility

- [ ] Focus indicators visible (2px outline, high contrast)
- [ ] Color not sole indicator (use icons + text)
- [ ] Text contrast ≥4.5:1 (WCAG AA)
- [ ] Buttons ≥44px × 44px (touch target)
- [ ] No flashing/blinking content

### Motion & Animation

- [ ] Parallax respects `prefers-reduced-motion`
- [ ] Transitions ≤300ms (not too slow)
- [ ] No auto-playing video/animation
- [ ] Tilt control respects `prefers-reduced-motion`

---

## Analytics & Signals

### Browsing Signals

Recorded when user enters a room:

```javascript
recordBrowsingSignal(roomKey);
// Sends to GA4: event_name='immersive_room_view', room_key=roomKey
```

### Product Signals

Recorded when user views product detail:

```javascript
// GA4: event_name='view_item', product_id, product_name, price, collection
```

### Add-to-Cart Signals

Recorded when user adds item to cart:

```javascript
// GA4: event_name='add_to_cart', product_id, quantity, price
```

### Conversion Signals

Recorded on order confirmation:

```javascript
// GA4: event_name='purchase', transaction_id, value, currency, items[]
```

---

## Error Handling

### WebGL Failure

If Three.js fails to initialize:

1. `showWebGLFallback()` renders static background
2. Hotspots remain clickable as links
3. Collections/products accessible via links
4. User can still browse and add to cart

### Network Errors

If Section Rendering API fails:

1. `renderEmptyState(type, context)` shows error message
2. Retry button provided
3. Link to 2D store as fallback
4. Error logged to console (dev only)

### Storage Errors

If localStorage/sessionStorage unavailable (private browsing):

1. All storage operations wrapped in `try/catch`
2. Graceful degradation — state not persisted
3. Onboarding shown every visit
4. Preference banner not shown

---

## Testing Strategy

### Unit Tests

- [ ] State manager: save/load/clear state
- [ ] Preference manager: write/read/clear preference
- [ ] Hotspot keyboard navigation
- [ ] Parallax calculations
- [ ] Money formatting

### Integration Tests

- [ ] Room transition flow
- [ ] Editorial overlay open/close
- [ ] Product panel open/close
- [ ] Add-to-cart flow
- [ ] Cart drawer open/close

### E2E Tests

- [ ] Complete user journey: entry → product → cart → checkout
- [ ] Keyboard-only navigation
- [ ] Screen reader navigation
- [ ] Mobile touch interactions
- [ ] Reduced motion preferences

### Performance Tests

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Texture load time < 1s per room

---

## Rollout Plan

### Phase 1: Core Flow (Week 1)

- [ ] Canvas + hotspot navigation
- [ ] Room transitions
- [ ] State management
- [ ] Basic accessibility

### Phase 2: Editorial & Products (Week 2)

- [ ] Editorial overlays
- [ ] Product panels
- [ ] Product grid
- [ ] Add-to-cart

### Phase 3: Cart & Checkout (Week 3)

- [ ] Cart drawer
- [ ] Checkout integration
- [ ] Order confirmation
- [ ] Post-purchase flow

### Phase 4: Polish & Optimization (Week 4)

- [ ] Performance tuning
- [ ] Accessibility audit
- [ ] Analytics integration
- [ ] Error handling
- [ ] Mobile optimization

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Immersive store entry rate | 15% of visitors | TBD |
| Product view rate (immersive) | 40% of entries | TBD |
| Add-to-cart rate (immersive) | 8% of product views | TBD |
| Conversion rate (immersive) | 2% of entries | TBD |
| Average session duration | 3+ minutes | TBD |
| Bounce rate | <30% | TBD |
| Mobile adoption | 25% of immersive traffic | TBD |
| Accessibility score | 95+ (Lighthouse) | TBD |

---

## References

- [Immersive Store Architecture](immersive-store.md)
- [State Manager](../assets/immersive/core/state-manager.js)
- [Store Engine](../assets/immersive-store.js)
- [Canvas Section](../sections/immersive-canvas.liquid)
- [Product Panel](../sections/glass-product.liquid)
- [Cart Section](../sections/immersive-cart.liquid)
