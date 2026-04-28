# Immersive Shopping Journey — Visual Map

**Complete user flow from entry to checkout**

---

## End-to-End Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMMERSIVE SHOPPING JOURNEY MAP                           │
└─────────────────────────────────────────────────────────────────────────────┘

STAGE 1: ENTRY & ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

  User navigates to /pages/immersive
           ↓
  safeBindImmersiveInit() guards against double-init
           ↓
  requestAnimationFrame() defers to next frame
           ↓
  initImmersiveScene() — Three.js setup
           ├─ Create scene, camera, renderer
           ├─ Load storefront room textures
           ├─ Create hotspots
           └─ Write preference: immersive_preferred_mode = '3d'
           ↓
  bindImmersiveNav() — wire interactions
           ├─ Hotspot click handlers
           ├─ Menu drawer integration
           ├─ Cart toggle
           └─ Mode switch (3D→2D)
           ↓
  showImmersiveOnboardingIfNeeded()
           ├─ Check if first-time visitor
           ├─ Show overlay with instructions
           └─ Dismiss → focus returns to canvas
           ↓
  ✓ User sees immersive store, ready to explore


STAGE 2: ROOM NAVIGATION
═══════════════════════════════════════════════════════════════════════════════

  User clicks hotspot (e.g., "Explore Designers")
           ↓
  handleHotspotClick(hotspot)
           ├─ Save trigger element: immersiveState.lastHotspot = hotspot
           ├─ Update state: immersiveState.currentRoom = 'designer_houses'
           └─ Record signal: recordBrowsingSignal('designer_houses')
           ↓
  Camera animates to new room (Three.js)
           ├─ Smooth transition over 800ms
           ├─ Load textures for new room (cached if available)
           └─ Update hotspots for new room
           ↓
  updateHotspotElements()
           ├─ Remove old hotspots from DOM
           ├─ Render new hotspots for current room
           └─ Re-bind click handlers
           ↓
  ✓ User sees new room with new hotspots


STAGE 3: EDITORIAL EXPLORATION (Optional)
═══════════════════════════════════════════════════════════════════════════════

  User clicks editorial hotspot (e.g., "Explore Designers")
           ↓
  enterEditorialMode(roomKey, triggerEl)
           ├─ Save trigger: immersiveState.lastHotspot = triggerEl
           ├─ Update state: immersiveState.mode = 'editorial'
           ├─ Update state: immersiveState.editorialRoom = 'designer_houses'
           └─ Record signal: recordBrowsingSignal('designer_houses')
           ↓
  Fetch editorial content via Section Rendering API
           ├─ GET /pages/immersive?section_id=editorial_designer_houses
           ├─ Response: immersive-editorial.liquid rendered
           └─ Cache response for future use
           ↓
  Editorial overlay (#immersive-editorial-overlay) activates
           ├─ Inject content into overlay
           ├─ Fade in with scroll parallax
           ├─ Move focus to close button
           └─ Announce to screen readers
           ↓
  User scrolls through editorial content
           ├─ Designer bios, images, CTAs
           ├─ Parallax effect on scroll
           └─ Links to collections
           ↓
  User clicks collection link (e.g., "Suffuse")
           ├─ Close editorial overlay
           └─ Open collection panel (see Stage 4)
           ↓
  OR User clicks close button / presses Escape
           ├─ exitEditorialMode()
           ├─ Fade out overlay
           ├─ Restore focus to trigger hotspot
           └─ Return to showroom mode
           ↓
  ✓ User back in showroom or viewing collection


STAGE 4: PRODUCT DISCOVERY
═══════════════════════════════════════════════════════════════════════════════

  User clicks collection link (from editorial or hotspot)
           ↓
  openCollectionPanel(collectionHandle)
           ├─ Save trigger: immersiveState.lastHotspot = trigger
           ├─ Update state: immersiveState.mode = 'panel'
           └─ Record signal: recordBrowsingSignal(collectionHandle)
           ↓
  Fetch collection grid via Section Rendering API
           ├─ GET /collections/suffuse?section_id=glass-panel
           ├─ Response: immersive-product-grid.liquid rendered
           └─ Cache response
           ↓
  Glass panel (#glass-panel) activates
           ├─ Inject product grid into panel
           ├─ Fade in smoothly
           ├─ Move focus to close button
           ├─ Set role="dialog" aria-modal="true"
           └─ Announce to screen readers
           ↓
  User sees product grid
           ├─ Product images, titles, prices
           ├─ "View Details" buttons
           ├─ Keyboard navigation (Tab, Arrow keys)
           └─ Scroll through products
           ↓
  User clicks product card (e.g., "Silk Saree")
           ├─ Close collection panel
           └─ Open product panel (see Stage 5)
           ↓
  OR User clicks close button / presses Escape
           ├─ closePanel('glass-panel')
           ├─ Fade out panel
           ├─ Restore focus to trigger hotspot
           └─ Return to showroom mode
           ↓
  ✓ User viewing collection or product detail


STAGE 5: PRODUCT DETAIL & SELECTION
═══════════════════════════════════════════════════════════════════════════════

  User clicks product card or "View Details" button
           ↓
  openProductPanel(productHandle, collectionHandle)
           ├─ Save trigger: immersiveState.lastHotspot = trigger
           ├─ Update state: immersiveState.mode = 'panel'
           └─ Record signal: recordBrowsingSignal(productHandle)
           ↓
  Fetch product detail via Section Rendering API
           ├─ GET /products/silk-saree?section_id=glass-product
           ├─ Response: glass-product.liquid rendered
           └─ Cache response
           ↓
  Glass panel content replaced with product detail
           ├─ Product media gallery (images, video)
           ├─ Product title, price, rating
           ├─ Variant selector (size, color, etc.)
           ├─ Virtual Try-On widget (if signed in)
           ├─ Add-to-cart button
           ├─ Related products carousel
           └─ Share buttons
           ↓
  User selects variant (e.g., size "Medium")
           ├─ Variant picker uses ARIA radiogroup pattern
           ├─ Arrow keys navigate options
           ├─ Enter/Space selects option
           └─ Hidden input[name="id"] updated with variant ID
           ↓
  User adjusts quantity (optional)
           ├─ Quantity input with +/- buttons
           └─ Value updated
           ↓
  ✓ User ready to add to cart


STAGE 6: ADD TO CART & FEEDBACK
═══════════════════════════════════════════════════════════════════════════════

  User clicks "Add to Cart" button
           ↓
  Form submission intercepted
           ├─ e.preventDefault()
           ├─ Validate variant selected
           └─ Validate quantity > 0
           ↓
  POST /cart/add.js with form data
           ├─ Variant ID, quantity, properties
           └─ Shopify processes request
           ↓
  Success response received
           ├─ showFeedback('Added to cart!', 'success')
           ├─ Toast message appears (3s auto-dismiss)
           ├─ updateCartCount()
           ├─ Fetch /cart.js to get new count
           ├─ Update cart icon badge
           ├─ recordAddToCart(product)
           ├─ Send GA4 event: add_to_cart
           └─ showAfterAddToCart(product) — optional next actions
           ↓
  Product panel remains open
           ├─ User can continue browsing
           ├─ Can select different variant
           ├─ Can add another quantity
           └─ Can close panel to return to showroom
           ↓
  OR Error response received
           ├─ showFeedback('Error adding to cart', 'error')
           ├─ Error message appears
           ├─ User can retry
           └─ Product panel remains open
           ↓
  ✓ Item added to cart (or error shown)


STAGE 7: CART REVIEW
═══════════════════════════════════════════════════════════════════════════════

  User clicks cart icon (in immersive header)
           ↓
  openCartDrawer()
           ├─ Fetch /cart?section_id=immersive-cart
           ├─ Response: immersive-cart.liquid rendered
           └─ Cache response
           ↓
  Cart drawer opens (Dawn's cart-drawer component)
           ├─ Slide in from right (or bottom on mobile)
           ├─ Overlay backdrop
           ├─ Move focus to close button
           └─ Set role="dialog" aria-modal="true"
           ↓
  User sees cart contents
           ├─ Cart items with images, prices, quantities
           ├─ Item removal buttons
           ├─ Quantity adjusters
           ├─ Subtotal, shipping estimate, taxes
           ├─ "Proceed to Checkout" button
           └─ "Continue Shopping" button
           ↓
  User adjusts quantities or removes items
           ├─ Quantity change: PATCH /cart/change.js
           ├─ Item removal: POST /cart/remove.js
           ├─ Cart updates in real-time
           └─ Subtotal recalculates
           ↓
  User clicks "Continue Shopping"
           ├─ closeCartDrawer()
           ├─ Fade out drawer
           ├─ Restore focus to cart icon
           └─ Return to showroom mode
           ↓
  OR User clicks "Proceed to Checkout"
           ├─ Redirect to /checkout
           └─ Shopify checkout flow (see Stage 8)
           ↓
  ✓ User reviewing cart or proceeding to checkout


STAGE 8: CHECKOUT
═══════════════════════════════════════════════════════════════════════════════

  User redirected to /checkout
           ↓
  Shopify checkout page loads
           ├─ Standard Shopify checkout (not immersive)
           ├─ Customer info form
           ├─ Shipping method selection
           ├─ Payment method selection
           └─ Order review
           ↓
  User completes checkout
           ├─ Enters email, shipping address, payment info
           ├─ Selects shipping method
           ├─ Completes payment
           └─ Order confirmed
           ↓
  Order confirmation page displays
           ├─ Order number, items, total
           ├─ Shipping address
           ├─ Estimated delivery date
           ├─ "Continue Shopping" button (optional)
           └─ "View Account" button (optional)
           ↓
  recordPurchase(order)
           ├─ Send GA4 event: purchase
           ├─ Include transaction_id, value, currency, items[]
           └─ Send to other analytics platforms
           ↓
  ✓ Order completed


STAGE 9: POST-PURCHASE & RETURN
═══════════════════════════════════════════════════════════════════════════════

  User clicks "Continue Shopping" (optional)
           ↓
  Redirect to /pages/immersive
           ↓
  safeBindImmersiveInit() runs again
           ├─ Check if already initialized
           ├─ If yes, return early
           └─ If no, initialize scene
           ↓
  clearState()
           ├─ Clear sessionStorage
           ├─ Reset immersiveState to defaults
           └─ currentRoom = 'storefront', mode = 'showroom'
           ↓
  User back in immersive store
           ├─ Can continue shopping
           ├─ Can browse other collections
           ├─ Can add more items to cart
           └─ Can proceed to checkout again
           ↓
  OR User navigates to 2D store (/)
           ↓
  Preference banner appears (if preference flag set)
           ├─ "You prefer the 3D store. Return to immersive experience?"
           ├─ CTA button: "Go to 3D Store"
           ├─ Dismiss button: "Not now"
           └─ Focus management on dismiss
           ↓
  User can:
           ├─ Click CTA → return to /pages/immersive
           ├─ Click dismiss → banner removed, focus restored
           └─ Ignore banner → continue browsing 2D store
           ↓
  ✓ User can continue shopping or return to 3D store


STATE TRANSITIONS
═══════════════════════════════════════════════════════════════════════════════

  Entry
    ↓
  showroom (default)
    ├─ (hotspot click) → showroom (new room)
    ├─ (editorial hotspot) → editorial
    ├─ (collection link) → panel
    └─ (cart click) → cart (drawer)
    ↓
  editorial
    ├─ (close) → showroom
    └─ (collection link) → panel
    ↓
  panel
    ├─ (close) → showroom
    ├─ (product click) → panel (new product)
    └─ (back to collection) → panel (collection grid)
    ↓
  cart (drawer)
    ├─ (close) → showroom
    └─ (checkout) → /checkout
    ↓
  /checkout
    ├─ (complete) → order confirmation
    └─ (cancel) → /pages/immersive (showroom)
    ↓
  order confirmation
    └─ (continue shopping) → /pages/immersive (showroom)


KEYBOARD NAVIGATION
═══════════════════════════════════════════════════════════════════════════════

  Tab                 → Focus next hotspot
  Shift+Tab           → Focus previous hotspot
  Arrow keys (↑↓←→)   → Focus hotspot in direction
  Enter / Space       → Activate focused hotspot
  Escape              → Close open overlay/panel
  
  Within panel:
  Tab                 → Focus next element in panel
  Shift+Tab           → Focus previous element in panel
  Escape              → Close panel, restore focus to trigger


FOCUS MANAGEMENT
═══════════════════════════════════════════════════════════════════════════════

  Panel opens:
    1. Save trigger element: immersiveState.lastHotspot = trigger
    2. Move focus to close button (or first focusable element)
    3. Trap focus within panel (Tab cycles within panel)
    
  Panel closes:
    1. Fade out panel
    2. Restore focus to trigger element: immersiveState.lastHotspot.focus()
    3. Release focus trap


ACCESSIBILITY FEATURES
═══════════════════════════════════════════════════════════════════════════════

  ✓ Keyboard navigation (Tab, Arrow keys, Enter, Escape)
  ✓ Screen reader support (ARIA labels, roles, live regions)
  ✓ Focus management (visible indicators, focus trap, restoration)
  ✓ Reduced motion support (parallax disabled, animations removed)
  ✓ Color contrast (≥4.5:1 WCAG AA)
  ✓ Touch targets (≥44px × 44px)
  ✓ Semantic HTML (headings, lists, forms)
  ✓ Error messages (role="alert" aria-live="assertive")
  ✓ Success messages (role="status" aria-live="polite")


PERFORMANCE OPTIMIZATIONS
═══════════════════════════════════════════════════════════════════════════════

  ✓ Lazy texture loading (load on room entry, not on page load)
  ✓ Texture caching (last 2–3 rooms cached in memory)
  ✓ Panel caching (collection/product panels cached by URL)
  ✓ Parallax throttling (requestAnimationFrame, 60fps max)
  ✓ Image optimization (responsive srcset, lazy loading)
  ✓ Reduced motion support (parallax disabled when prefers-reduced-motion)
  ✓ Memory management (dispose textures when cache full)


ANALYTICS SIGNALS
═══════════════════════════════════════════════════════════════════════════════

  Room view:           recordBrowsingSignal(roomKey)
  Product view:        recordBrowsingSignal(productHandle)
  Add-to-cart:         recordAddToCart(product)
  Purchase:            recordPurchase(order)
  Friction point:      trackFrictionPoint(event, data)
  
  GA4 events:
  - immersive_room_view
  - view_item
  - add_to_cart
  - purchase
  - friction_point


ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════════

  WebGL failure:
    → showWebGLFallback()
    → Static background + clickable hotspots
    → Collections/products accessible via links
    
  Network error:
    → renderEmptyState(type, context)
    → Retry button provided
    → Link to 2D store as fallback
    
  Storage error:
    → Graceful degradation
    → State not persisted
    → Onboarding shown every visit
    → Preference banner not shown
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT INTERACTIONS                              │
└─────────────────────────────────────────────────────────────────────────────┘

                          immersive-canvas.liquid
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            immersive-store.js   state-manager.js  CSS/JS
                    │               │
        ┌───────────┼───────────┐   │
        │           │           │   │
    Three.js    Hotspots    Navigation
        │           │           │
        │           └─────┬─────┘
        │                 │
        │         ┌───────┴────────┐
        │         │                │
        │    glass-panel.liquid    │
        │         │                │
        │    ┌────┴────┐           │
        │    │         │           │
        │  glass-product.liquid    │
        │  immersive-product-grid  │
        │                          │
        └──────────────┬───────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
      immersive-cart.liquid   checkout
            │
      main-cart-items
      main-cart-footer


Data Flow:
──────────

User Input
    ↓
Event Handler (click, keydown, etc.)
    ↓
State Update (immersiveState)
    ↓
State Persistence (sessionStorage)
    ↓
DOM Update (show/hide panels, update content)
    ↓
Analytics Signal (GA4, etc.)
    ↓
User Feedback (toast, focus, announcement)
```

---

## State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STATE MACHINE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

States:
  - currentRoom: 'storefront' | 'lounge' | 'designer_houses' | 'occasions' | 'featured_collections'
  - mode: 'showroom' | 'editorial' | 'panel'
  - editorialRoom: null | 'designer_houses' | 'occasions' | 'featured_collections'
  - lastHotspot: null | HTMLElement
  - guided: boolean
  - navigationStack: Array<string>

Transitions:

  showroom → showroom (room change)
    Trigger: hotspot click
    Action: update currentRoom, load textures, update hotspots
    
  showroom → editorial
    Trigger: editorial hotspot click
    Action: update mode, editorialRoom; fetch editorial content
    
  editorial → showroom
    Trigger: close button / Escape
    Action: update mode to showroom; restore focus
    
  editorial → panel
    Trigger: collection link click
    Action: update mode to panel; fetch collection grid
    
  showroom → panel
    Trigger: collection link click
    Action: update mode to panel; fetch collection grid
    
  panel → panel (product change)
    Trigger: product card click
    Action: fetch product detail; replace panel content
    
  panel → showroom
    Trigger: close button / Escape
    Action: update mode to showroom; restore focus
    
  showroom → cart
    Trigger: cart icon click
    Action: open cart drawer
    
  cart → showroom
    Trigger: close button / Escape / "Continue Shopping"
    Action: close cart drawer; restore focus
    
  cart → checkout
    Trigger: "Proceed to Checkout" click
    Action: redirect to /checkout
    
  checkout → order confirmation
    Trigger: payment completed
    Action: display order confirmation
    
  order confirmation → showroom
    Trigger: "Continue Shopping" click
    Action: redirect to /pages/immersive; reset state
```

---

## Performance Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERFORMANCE TIMELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘

Page Load:
  0ms     → Page starts loading
  100ms   → HTML parsed, DOM ready
  200ms   → CSS loaded, layout calculated
  300ms   → JavaScript loaded (defer)
  400ms   → Three.js loaded
  500ms   → immersive-store.js loaded
  600ms   → safeBindImmersiveInit() called
  700ms   → requestAnimationFrame() deferred
  800ms   → initImmersiveScene() starts
  1000ms  → Storefront textures loaded
  1200ms  → Canvas renders first frame
  1500ms  → Onboarding overlay shown (if first-time)
  2000ms  → User can interact

Hotspot Click:
  0ms     → User clicks hotspot
  10ms    → Event handler fires
  20ms    → State updated
  30ms    → Camera animation starts
  50ms    → Textures start loading
  100ms   → Camera animation in progress
  200ms   → Textures loaded
  300ms   → Hotspots updated
  400ms   → Camera animation complete
  500ms   → User sees new room

Panel Open:
  0ms     → User clicks product card
  10ms    → Event handler fires
  20ms    → Section Rendering API call starts
  50ms    → Network request sent
  100ms   → Server processing
  200ms   → Response received
  250ms   → HTML injected into panel
  300ms   → Panel fade-in animation starts
  350ms   → Focus moved to close button
  400ms   → Panel fade-in complete
  500ms   → User can interact with panel

Add-to-Cart:
  0ms     → User clicks "Add to Cart"
  10ms    → Form submission intercepted
  20ms    → Validation runs
  30ms    → POST /cart/add.js starts
  50ms    → Network request sent
  100ms   → Server processing
  200ms   → Response received
  250ms   → Cart count updated
  300ms   → Toast message shown
  350ms   → Analytics event sent
  400ms   → Toast auto-dismiss starts
  3000ms  → Toast dismissed
```

---

## References

- [Immersive Shopping Journey Spec](SPEC.md)
- [Implementation Tasks](TASKS.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Quick Reference](QUICK_REFERENCE.md)
