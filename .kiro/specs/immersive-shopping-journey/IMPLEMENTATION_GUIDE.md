# Immersive Shopping Journey — Implementation Guide

**Status:** Ready for Development  
**Last Updated:** April 28, 2026

---

## Quick Start

This guide walks you through implementing the complete immersive shopping journey. The foundation is already in place — you'll be extending and connecting existing pieces.

### What's Already Built

✅ **State Manager** (`assets/immersive/core/state-manager.js`)
- Session state persistence
- Preference management (3D mode preference)
- Onboarding tracking

✅ **Canvas & Hotspots** (`sections/immersive-canvas.liquid`)
- WebGL canvas rendering
- Hotspot UI layer
- Fixed header with cart, menu, wishlist
- Overlay shells (glass panel, editorial, cart, etc.)

✅ **Navigation** (`assets/immersive-store.js`)
- Hotspot click handling
- Room transitions
- Keyboard navigation (Tab, Arrow keys, Enter)
- Menu drawer integration

✅ **Product Panel** (`sections/glass-product.liquid`)
- Product detail rendering
- Variant selection
- Add-to-cart button
- Related products

✅ **Cart Section** (`sections/immersive-cart.liquid`)
- Cart drawer shell
- Integration with main-cart-items and main-cart-footer

### What You'll Build

🔨 **Phase 1: Core Flow Verification** (2–3 hours)
- Verify canvas initialization
- Test hotspot navigation
- Confirm state persistence
- Test keyboard navigation

🔨 **Phase 2: Product Discovery Flow** (4–5 hours)
- Implement collection panel opening
- Implement product panel opening
- Test Section Rendering API integration
- Verify focus management

🔨 **Phase 3: Add-to-Cart Flow** (2–3 hours)
- Implement add-to-cart handler
- Add success/error feedback
- Update cart count
- Test product panel remains open

🔨 **Phase 4: Cart & Checkout** (2–3 hours)
- Implement cart drawer opening
- Test cart item management
- Verify checkout redirect
- Test post-purchase flow

---

## Phase 1: Core Flow Verification

### 1.1 Verify Canvas Initialization

**Goal:** Ensure the immersive canvas initializes correctly on `/pages/immersive`

**Steps:**

1. Navigate to `/pages/immersive` in your browser
2. Open DevTools Console (F12)
3. Verify no errors appear
4. Check that:
   - Canvas element exists: `document.getElementById('immersive-canvas')` ✓
   - State manager loaded: `window.ImmersiveStateManager` ✓
   - Initial state correct: `immersiveState.currentRoom === 'storefront'` ✓

**Debugging:**

If canvas doesn't render:
```javascript
// Check if Three.js loaded
console.log(typeof THREE); // Should be 'object'

// Check if immersive-store.js loaded
console.log(typeof initImmersiveScene); // Should be 'function'

// Check for errors in safeBindImmersiveInit
console.log(_immersiveInitBound); // Should be true
```

**Files to Check:**
- `layout/theme.liquid` — verify Three.js and immersive-store.js are loaded on `page.immersive`
- `sections/immersive-canvas.liquid` — verify canvas element exists
- `assets/immersive-store.js` — verify `safeBindImmersiveInit()` runs

---

### 1.2 Test Hotspot Navigation

**Goal:** Verify hotspots are clickable and navigate between rooms

**Steps:**

1. On `/pages/immersive`, look for glowing hotspots on the canvas
2. Click a hotspot (e.g., "Explore Designers")
3. Verify:
   - Camera animates to new room
   - Hotspots update for new room
   - State updates: `immersiveState.currentRoom` changes
   - No console errors

**Debugging:**

If hotspots don't appear:
```javascript
// Check if hotspots are rendered
var hotspots = document.querySelectorAll('[data-hotspot]');
console.log('Hotspots found:', hotspots.length);

// Check if hotspot click handler is bound
var firstHotspot = hotspots[0];
console.log('Hotspot data:', firstHotspot.dataset);
```

If hotspots don't navigate:
```javascript
// Check if room transition is working
console.log('Current room:', immersiveState.currentRoom);
// Click a hotspot, then check again
console.log('New room:', immersiveState.currentRoom);
```

**Files to Check:**
- `assets/immersive-store.js` — `bindImmersiveNav()` function
- `sections/immersive-canvas.liquid` — hotspot rendering

---

### 1.3 Confirm State Persistence

**Goal:** Verify session state and preferences persist correctly

**Steps:**

1. On `/pages/immersive`, navigate to a room (e.g., "designer_houses")
2. Verify state saved: `sessionStorage.getItem('immersive_state')`
3. Refresh the page
4. Verify state restored: `immersiveState.currentRoom` should still be "designer_houses"
5. Navigate to a 2D page (e.g., `/`)
6. Verify preference banner appears (if onboarding was shown)

**Debugging:**

If state doesn't persist:
```javascript
// Check sessionStorage
console.log(sessionStorage.getItem('immersive_state'));

// Check if saveState() is being called
// Add a breakpoint in saveState() or log it
```

If preference banner doesn't appear:
```javascript
// Check localStorage
console.log(localStorage.getItem('immersive_preferred_mode'));

// Check if writeImmersivePreference() was called
// Should be called in initImmersiveScene()
```

**Files to Check:**
- `assets/immersive/core/state-manager.js` — state persistence functions
- `layout/theme.liquid` — preference banner logic

---

### 1.4 Test Keyboard Navigation

**Goal:** Verify all hotspots and UI elements are keyboard-navigable

**Steps:**

1. On `/pages/immersive`, press Tab
2. Verify focus moves to first hotspot (visible focus indicator)
3. Press Tab again — focus moves to next hotspot
4. Press Shift+Tab — focus moves to previous hotspot
5. Press Arrow keys (↑↓←→) — focus moves in spatial direction
6. Press Enter — hotspot activates (room transitions)
7. Press Escape — any open overlay closes

**Debugging:**

If Tab doesn't navigate hotspots:
```javascript
// Check if keyboard nav is initialized
console.log(typeof initHotspotKeyboardNav); // Should be 'function'

// Check if canvas has tabindex
var canvas = document.getElementById('immersive-canvas');
console.log('Canvas tabindex:', canvas.getAttribute('tabindex'));
console.log('Canvas role:', canvas.getAttribute('role'));
```

If focus indicator not visible:
```javascript
// Check CSS for focus styles
// Look for .immersive-hotspot:focus or [data-hotspot]:focus
// Should have outline or box-shadow
```

**Files to Check:**
- `assets/immersive-store.js` — `initHotspotKeyboardNav()`, `focusNextHotspot()`, `announceHotspot()`
- `assets/immersive-theme.css` — focus styles

---

## Phase 2: Product Discovery Flow

### 2.1 Implement Collection Panel Opening

**Goal:** When user clicks a collection link, open the collection grid in the glass panel

**Current State:**
- `openCollectionPanel(collectionHandle)` function exists in `immersive-store.js`
- Glass panel shell exists in `immersive-canvas.liquid`
- `immersive-product-grid.liquid` section exists

**What You Need to Do:**

1. **Verify Section Rendering API call:**

```javascript
// In immersive-store.js, find openCollectionPanel()
// It should fetch: GET /collections/{handle}?section_id=glass-panel
// Response contains rendered immersive-product-grid.liquid

function openCollectionPanel(collectionHandle) {
  var url = '/collections/' + collectionHandle + '?section_id=glass-panel';
  
  // Fetch with cache
  fetchWithCache(url, function(html) {
    // Inject into glass panel
    var panel = document.getElementById('glass-panel');
    panel.querySelector('.immersive-store__panel-content').innerHTML = html;
    
    // Show panel
    panel.removeAttribute('hidden');
    panel.classList.remove('hidden');
    
    // Move focus to close button
    var closeBtn = panel.querySelector('.immersive-store__panel-close');
    closeBtn.focus();
  });
}
```

2. **Test collection panel opening:**

```javascript
// In browser console
openCollectionPanel('suffuse');
// Should fetch and display collection grid
```

3. **Verify product grid renders:**

Check that `immersive-product-grid.liquid` renders:
- Product images
- Product titles
- Product prices
- "View Details" buttons
- Keyboard navigation works

**Files to Modify:**
- `assets/immersive-store.js` — ensure `openCollectionPanel()` is complete
- `sections/immersive-product-grid.liquid` — ensure it renders correctly

---

### 2.2 Implement Product Panel Opening

**Goal:** When user clicks a product card, open the product detail in the glass panel

**Current State:**
- `openProductPanel(productHandle)` function exists
- `glass-product.liquid` section exists

**What You Need to Do:**

1. **Verify Section Rendering API call:**

```javascript
function openProductPanel(productHandle, collectionHandle) {
  var url = '/products/' + productHandle + '?section_id=glass-product';
  if (collectionHandle) {
    url += '&collection_handle=' + collectionHandle;
  }
  
  // Fetch with cache
  fetchWithCache(url, function(html) {
    // Inject into glass panel
    var panel = document.getElementById('glass-panel');
    panel.querySelector('.immersive-store__panel-content').innerHTML = html;
    
    // Show panel
    panel.removeAttribute('hidden');
    panel.classList.remove('hidden');
    
    // Move focus to product title or close button
    var closeBtn = panel.querySelector('.immersive-store__panel-close');
    closeBtn.focus();
    
    // Announce to screen readers
    announceHotspot('Product detail opened: ' + productHandle);
  });
}
```

2. **Test product panel opening:**

```javascript
// In browser console
openProductPanel('silk-saree', 'suffuse');
// Should fetch and display product detail
```

3. **Verify product detail renders:**

Check that `glass-product.liquid` renders:
- Product media gallery
- Product title, price, rating
- Variant selector (size, color, etc.)
- Add-to-cart button
- Related products
- Share buttons

**Files to Modify:**
- `assets/immersive-store.js` — ensure `openProductPanel()` is complete
- `sections/glass-product.liquid` — ensure it renders correctly

---

### 2.3 Test Section Rendering API Integration

**Goal:** Verify Section Rendering API calls work correctly

**Steps:**

1. **Test collection fetch:**

```javascript
// In browser console
fetch('/collections/suffuse?section_id=glass-panel')
  .then(r => r.text())
  .then(html => console.log(html.substring(0, 200)));
// Should return HTML of immersive-product-grid.liquid
```

2. **Test product fetch:**

```javascript
// In browser console
fetch('/products/silk-saree?section_id=glass-product')
  .then(r => r.text())
  .then(html => console.log(html.substring(0, 200)));
// Should return HTML of glass-product.liquid
```

3. **Verify caching works:**

```javascript
// In browser console
// First fetch should hit network
// Second fetch should use cache
openCollectionPanel('suffuse');
// Wait 1 second
openCollectionPanel('suffuse');
// Check Network tab — second request should be cached
```

**Files to Check:**
- `assets/immersive-store.js` — `fetchWithCache()` function
- `sections/glass-panel.liquid` — panel shell structure

---

### 2.4 Verify Focus Management

**Goal:** Ensure focus is managed correctly when opening/closing panels

**Steps:**

1. Click a hotspot to open a panel
2. Verify focus moves to close button (or first focusable element)
3. Press Tab — focus cycles within panel
4. Press Escape — panel closes
5. Verify focus returns to trigger hotspot

**Debugging:**

If focus doesn't move to panel:
```javascript
// Check if focus trap is implemented
var panel = document.getElementById('glass-panel');
console.log('Panel focused element:', document.activeElement);
// Should be close button or first focusable element
```

If focus doesn't return to hotspot:
```javascript
// Check if lastHotspot is saved
console.log('Last hotspot:', immersiveState.lastHotspot);
// Should be the DOM element that triggered the panel
```

**Files to Check:**
- `assets/immersive-store.js` — focus management in `openProductPanel()`, `openCollectionPanel()`
- `sections/glass-panel.liquid` — focus trap implementation

---

## Phase 3: Add-to-Cart Flow

### 3.1 Implement Add-to-Cart Handler

**Goal:** When user clicks "Add to Cart", handle the request and show feedback

**Current State:**
- `glass-product.liquid` has an add-to-cart button
- Button is part of a standard Shopify product form

**What You Need to Do:**

1. **Intercept form submission:**

```javascript
// In immersive-store.js or glass-product.liquid
var productForm = document.querySelector('form[action*="/cart/add"]');
if (productForm) {
  productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    var formData = new FormData(productForm);
    
    // Send to cart
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      // Success
      showFeedback('Added to cart!', 'success');
      updateCartCount();
      
      // Record analytics
      recordAddToCart(data);
      
      // Show next actions (optional)
      showAfterAddToCart(data);
    })
    .catch(err => {
      // Error
      showFeedback('Error adding to cart', 'error');
    });
  });
}
```

2. **Implement feedback function:**

```javascript
function showFeedback(message, type) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-feedback immersive-feedback--' + type;
  feedback.setAttribute('role', type === 'error' ? 'alert' : 'status');
  feedback.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  feedback.textContent = message;
  
  document.body.appendChild(feedback);
  
  // Auto-dismiss after 3 seconds
  setTimeout(function() {
    feedback.remove();
  }, 3000);
}
```

3. **Implement cart count update:**

```javascript
function updateCartCount() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      var cartCount = document.querySelector('[data-cart-count]');
      if (cartCount) {
        cartCount.textContent = cart.item_count;
      }
    });
}
```

**Files to Modify:**
- `assets/immersive-store.js` — add `showFeedback()`, `updateCartCount()`, add-to-cart handler
- `sections/glass-product.liquid` — ensure form is properly structured

---

### 3.2 Test Add-to-Cart Flow

**Steps:**

1. Open a product panel
2. Select a variant (size, color, etc.)
3. Click "Add to Cart"
4. Verify:
   - Success feedback appears
   - Cart count updates
   - Product panel remains open
   - No console errors

**Debugging:**

If add-to-cart fails:
```javascript
// Check if form exists
var form = document.querySelector('form[action*="/cart/add"]');
console.log('Form found:', !!form);

// Check if variant is selected
var variantInput = form.querySelector('input[name="id"]');
console.log('Variant selected:', variantInput.value);

// Try manual fetch
fetch('/cart/add.js', {
  method: 'POST',
  body: new FormData(form)
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Files to Check:**
- `assets/immersive-store.js` — add-to-cart handler
- `sections/glass-product.liquid` — form structure

---

## Phase 4: Cart & Checkout

### 4.1 Implement Cart Drawer Opening

**Goal:** When user clicks cart icon, open the cart drawer

**Current State:**
- Cart icon exists in immersive header
- Cart drawer shell exists in `immersive-cart.liquid`

**What You Need to Do:**

1. **Wire cart icon click:**

```javascript
// In immersive-store.js, in bindImmersiveNav()
var cartToggle = document.getElementById('cart-toggle');
if (cartToggle) {
  cartToggle.addEventListener('click', function() {
    openCartDrawer();
  });
}
```

2. **Implement cart drawer opening:**

```javascript
function openCartDrawer() {
  var cartDrawer = document.querySelector('cart-drawer');
  if (cartDrawer && typeof cartDrawer.open === 'function') {
    // Use Dawn's native cart-drawer component
    cartDrawer.open(document.getElementById('cart-toggle'));
  } else {
    // Fallback: navigate to /cart
    window.location.href = '/cart';
  }
}
```

3. **Test cart drawer:**

```javascript
// In browser console
openCartDrawer();
// Should open cart drawer with items
```

**Files to Modify:**
- `assets/immersive-store.js` — add `openCartDrawer()` function
- `sections/immersive-canvas.liquid` — ensure cart icon is wired

---

### 4.2 Test Cart Item Management

**Steps:**

1. Add a product to cart
2. Click cart icon
3. Verify cart drawer opens with item
4. Adjust quantity
5. Verify cart updates
6. Remove item
7. Verify item removed

**Debugging:**

If cart drawer doesn't open:
```javascript
// Check if cart-drawer component exists
var cartDrawer = document.querySelector('cart-drawer');
console.log('Cart drawer found:', !!cartDrawer);

// Check if it has open method
console.log('Has open method:', typeof cartDrawer.open);
```

**Files to Check:**
- `sections/immersive-cart.liquid` — cart drawer shell
- `layout/theme.liquid` — cart-drawer component loading

---

### 4.3 Verify Checkout Redirect

**Steps:**

1. Add items to cart
2. Open cart drawer
3. Click "Proceed to Checkout"
4. Verify redirected to Shopify checkout (`/checkout`)
5. Complete checkout
6. Verify order confirmation page

**Debugging:**

If checkout doesn't redirect:
```javascript
// Check if checkout button exists
var checkoutBtn = document.querySelector('[href*="/checkout"]');
console.log('Checkout button found:', !!checkoutBtn);

// Check if it's clickable
checkoutBtn.click();
```

**Files to Check:**
- `sections/main-cart-footer.liquid` — checkout button
- `layout/theme.liquid` — checkout redirect logic

---

### 4.4 Test Post-Purchase Flow

**Steps:**

1. Complete a test order
2. On order confirmation page, verify:
   - Order details display
   - "Continue Shopping" button works
   - Clicking it returns to immersive store
3. On immersive store, verify:
   - State resets (room, mode, panels)
   - User can continue shopping

**Debugging:**

If state doesn't reset:
```javascript
// Check if clearState() is called on new visit
console.log('Session state:', sessionStorage.getItem('immersive_state'));
// Should be empty or null on new visit
```

**Files to Check:**
- `layout/theme.liquid` — post-purchase logic
- `assets/immersive/core/state-manager.js` — state clearing

---

## Testing Checklist

### Functional Testing

- [ ] Canvas initializes without errors
- [ ] Hotspots are clickable and navigate between rooms
- [ ] State persists across page reloads
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter, Escape)
- [ ] Collection panel opens and displays products
- [ ] Product panel opens and displays details
- [ ] Add-to-cart works and shows feedback
- [ ] Cart count updates
- [ ] Cart drawer opens and displays items
- [ ] Checkout redirect works
- [ ] Post-purchase flow works

### Accessibility Testing

- [ ] Keyboard-only navigation works end-to-end
- [ ] Screen reader announces hotspots and panels
- [ ] Focus indicators visible
- [ ] Focus trap works in panels
- [ ] Escape key closes panels
- [ ] Focus restored to trigger element
- [ ] Color contrast ≥4.5:1
- [ ] Touch targets ≥44px × 44px

### Performance Testing

- [ ] Canvas renders smoothly (60fps)
- [ ] Panel opens quickly (<500ms)
- [ ] No memory leaks on repeated opens/closes
- [ ] Textures load without blocking UI
- [ ] Parallax throttled to 60fps

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Common Issues & Solutions

### Issue: Canvas doesn't render

**Solution:**
1. Check if Three.js loaded: `console.log(typeof THREE)`
2. Check if immersive-store.js loaded: `console.log(typeof initImmersiveScene)`
3. Check for errors in console
4. Verify `layout/theme.liquid` loads scripts on `page.immersive`

### Issue: Hotspots don't navigate

**Solution:**
1. Check if hotspots exist: `document.querySelectorAll('[data-hotspot]').length`
2. Check if click handler bound: add `console.log()` in hotspot click handler
3. Verify room textures load: check Network tab for texture URLs
4. Check for errors in console

### Issue: Panel doesn't open

**Solution:**
1. Check if Section Rendering API call succeeds: `fetch('/collections/suffuse?section_id=glass-panel')`
2. Check if HTML is injected into panel: `document.getElementById('glass-panel').innerHTML`
3. Check if panel is visible: `document.getElementById('glass-panel').hidden`
4. Check for errors in console

### Issue: Add-to-cart fails

**Solution:**
1. Check if form exists: `document.querySelector('form[action*="/cart/add"]')`
2. Check if variant selected: `form.querySelector('input[name="id"]').value`
3. Try manual fetch: `fetch('/cart/add.js', { method: 'POST', body: new FormData(form) })`
4. Check for errors in console

### Issue: Focus doesn't move to panel

**Solution:**
1. Check if panel has focusable elements: `panel.querySelectorAll('button, a, input').length`
2. Check if close button exists: `panel.querySelector('.immersive-store__panel-close')`
3. Manually set focus: `panel.querySelector('.immersive-store__panel-close').focus()`
4. Check for errors in console

---

## Next Steps

1. **Start with Phase 1** — verify canvas and hotspots work
2. **Move to Phase 2** — implement product discovery
3. **Move to Phase 3** — implement add-to-cart
4. **Move to Phase 4** — implement cart and checkout
5. **Test thoroughly** — use the testing checklist
6. **Optimize** — profile performance and fix bottlenecks
7. **Deploy** — push to production

---

## Resources

- [Immersive Shopping Journey Spec](SPEC.md)
- [Implementation Tasks](TASKS.md)
- [State Manager](../../assets/immersive/core/state-manager.js)
- [Store Engine](../../assets/immersive-store.js)
- [Canvas Section](../../sections/immersive-canvas.liquid)
- [Product Panel](../../sections/glass-product.liquid)
- [Cart Section](../../sections/immersive-cart.liquid)
