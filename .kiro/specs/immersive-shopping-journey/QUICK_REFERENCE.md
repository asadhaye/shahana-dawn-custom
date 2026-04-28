# Immersive Shopping Journey — Quick Reference

**Quick lookup for common tasks and functions**

---

## Key Functions

### State Management

```javascript
// Save session state
saveState({ currentRoom: 'lounge', mode: 'showroom' });

// Load session state
var state = loadState();

// Clear session state
clearState();

// Write 3D preference
writeImmersivePreference();

// Read 3D preference
if (readImmersivePreference()) { /* user prefers 3D */ }

// Clear 3D preference
clearImmersivePreference();
```

### Navigation

```javascript
// Open collection panel
openCollectionPanel('suffuse');

// Open product panel
openProductPanel('silk-saree', 'suffuse');

// Open search results
openSearchPanel('bridal');

// Open cart drawer
openCartDrawer();

// Close panel
closePanel();

// Navigate back
navigateBack();
```

### Feedback & Notifications

```javascript
// Show feedback message
showFeedback('Added to cart!', 'success');
showFeedback('Error adding to cart', 'error');

// Announce to screen readers
announceHotspot('Product detail opened');

// Update cart count
updateCartCount();
```

### Analytics

```javascript
// Record room view
recordBrowsingSignal('designer_houses');

// Record add-to-cart
recordAddToCart(product);

// Record friction point
trackFrictionPoint('back_to_2d_from_room', { from_room: 'lounge' });
```

---

## Key Elements

### Canvas & Hotspots

```html
<!-- Canvas element -->
<canvas id="immersive-canvas" aria-hidden="true"></canvas>

<!-- UI layer -->
<div id="ui-layer"></div>

<!-- Hotspot announcer (screen reader) -->
<div id="immersive-hotspot-announcer" class="visually-hidden" aria-live="polite"></div>

<!-- Hotspot example -->
<button data-hotspot data-room="designer_houses" aria-label="Explore Designers">
  Explore Designers
</button>
```

### Glass Panel (Product/Collection)

```html
<!-- Panel shell -->
<section id="glass-panel" role="dialog" aria-modal="true" aria-labelledby="glass-panel-title" hidden>
  <header class="immersive-store__panel-header">
    <h2 id="glass-panel-title">Panel Title</h2>
    <button type="button" class="immersive-store__panel-close" aria-label="Close">×</button>
  </header>
  <div class="immersive-store__panel-content">
    <!-- Content injected here -->
  </div>
</section>
```

### Cart Drawer

```html
<!-- Cart drawer (Dawn component) -->
<cart-drawer id="CartDrawer">
  <!-- Cart content -->
</cart-drawer>

<!-- Cart toggle button -->
<button id="cart-toggle" aria-label="Cart">
  <span data-cart-count>0</span>
</button>
```

### Editorial Overlay

```html
<!-- Editorial overlay -->
<section id="immersive-editorial-overlay" role="dialog" aria-modal="true" hidden>
  <div id="immersive-editorial-overlay-content">
    <!-- Editorial content injected here -->
  </div>
</section>
```

---

## Key Data Attributes

### Hotspots

```html
<button
  data-hotspot
  data-room="designer_houses"
  data-target-editorial-room="designer_houses"
  data-collection="suffuse"
  aria-label="Explore Designers"
>
  Explore Designers
</button>
```

### Product Cards

```html
<div
  class="immersive-product-card"
  data-product-handle="silk-saree"
  data-collection-handle="suffuse"
>
  <!-- Card content -->
</div>
```

### Sections

```html
<section
  class="glass-product-section"
  data-product-id="123456"
  data-product-handle="silk-saree"
  data-error-select-variant="Please select a size"
  data-error-add-to-cart="Error adding to cart"
  data-success-added="Added to cart!"
>
  <!-- Product content -->
</section>
```

---

## Key CSS Classes

### Canvas & UI

```css
.immersive-store                    /* Main container */
.immersive-store__canvas-wrapper    /* Canvas wrapper */
.immersive-store__panel             /* Glass panel */
.immersive-store__panel-header      /* Panel header */
.immersive-store__panel-close       /* Close button */
.immersive-store__panel-content     /* Panel content area */
```

### Hotspots

```css
.immersive-hotspot                  /* Hotspot button */
.immersive-hotspot:focus            /* Focus state */
.immersive-hotspot--active          /* Active state */
```

### Feedback

```css
.immersive-feedback                 /* Feedback message */
.immersive-feedback--success        /* Success state */
.immersive-feedback--error          /* Error state */
```

### Editorial

```css
.immersive-editorial                /* Editorial section */
.immersive-editorial--designers     /* Designers layout */
.immersive-editorial--occasions     /* Occasions layout */
.immersive-editorial--featured      /* Featured layout */
```

---

## Key Translation Keys

### Immersive Store

```liquid
{{ 'sections.immersive_store.welcome_toast' | t }}
{{ 'sections.immersive_store.error_select_variant' | t }}
{{ 'sections.immersive_store.error_add_to_cart' | t }}
{{ 'sections.immersive_store.added_to_cart' | t }}
{{ 'sections.immersive_store.back_to_room' | t: room_name: 'Lounge' }}
{{ 'sections.immersive_store.close' | t }}
```

### Product Panel

```liquid
{{ 'sections.immersive.product_panel.product_detail_aria' | t }}
{{ 'sections.immersive.product_panel.variant_group_label' | t }}
{{ 'sections.immersive.product_panel.care_heading' | t }}
```

### Product Grid

```liquid
{{ 'sections.immersive.product_grid.empty' | t }}
{{ 'sections.immersive.product_grid.back_to_collection' | t }}
```

---

## Common Patterns

### Opening a Panel

```javascript
function openPanel(url, panelId) {
  // Fetch content
  fetchWithCache(url, function(html) {
    // Inject into panel
    var panel = document.getElementById(panelId);
    panel.querySelector('.immersive-store__panel-content').innerHTML = html;
    
    // Show panel
    panel.removeAttribute('hidden');
    panel.classList.remove('hidden');
    
    // Move focus
    var closeBtn = panel.querySelector('.immersive-store__panel-close');
    closeBtn.focus();
    
    // Announce
    announceHotspot('Panel opened');
  });
}
```

### Closing a Panel

```javascript
function closePanel(panelId, triggerEl) {
  var panel = document.getElementById(panelId);
  
  // Hide panel
  panel.setAttribute('hidden', '');
  panel.classList.add('hidden');
  
  // Clear content
  panel.querySelector('.immersive-store__panel-content').innerHTML = '';
  
  // Restore focus
  if (triggerEl) {
    triggerEl.focus();
  }
}
```

### Handling Form Submission

```javascript
var form = document.querySelector('form[action*="/cart/add"]');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    fetch('/cart/add.js', {
      method: 'POST',
      body: new FormData(form)
    })
    .then(r => r.json())
    .then(data => {
      showFeedback('Added to cart!', 'success');
      updateCartCount();
    })
    .catch(err => {
      showFeedback('Error adding to cart', 'error');
    });
  });
}
```

### Keyboard Navigation

```javascript
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close any open panel
    var panel = document.getElementById('glass-panel');
    if (!panel.hidden) {
      closePanel('glass-panel');
    }
  }
  
  if (e.key === 'Tab') {
    // Navigate hotspots
    focusNextHotspot(e.shiftKey ? -1 : 1);
  }
  
  if (e.key === 'Enter') {
    // Activate focused hotspot
    var focused = document.activeElement;
    if (focused && focused.hasAttribute('data-hotspot')) {
      focused.click();
    }
  }
});
```

---

## Debugging Tips

### Check State

```javascript
// Current state
console.log('State:', immersiveState);

// Session storage
console.log('Session:', sessionStorage.getItem('immersive_state'));

// Local storage
console.log('Preference:', localStorage.getItem('immersive_preferred_mode'));
```

### Check Elements

```javascript
// Canvas
console.log('Canvas:', document.getElementById('immersive-canvas'));

// Hotspots
console.log('Hotspots:', document.querySelectorAll('[data-hotspot]'));

// Panel
console.log('Panel:', document.getElementById('glass-panel'));

// Cart
console.log('Cart drawer:', document.querySelector('cart-drawer'));
```

### Check Functions

```javascript
// State manager
console.log('State manager:', window.ImmersiveStateManager);

// Navigation
console.log('openCollectionPanel:', typeof openCollectionPanel);
console.log('openProductPanel:', typeof openProductPanel);

// Feedback
console.log('showFeedback:', typeof showFeedback);
```

### Check Network

```javascript
// Test Section Rendering API
fetch('/collections/suffuse?section_id=glass-panel')
  .then(r => r.text())
  .then(html => console.log('Response length:', html.length));

// Test cart API
fetch('/cart.js')
  .then(r => r.json())
  .then(cart => console.log('Cart:', cart));
```

---

## Performance Tips

### Optimize Texture Loading

```javascript
// Desktop: 1600px, 75% quality
// Mobile: 900px, 75% quality
// Depth maps: 60% quality

// Use responsive image URLs
var textureUrl = baseUrl + '?width=1600&quality=75';
var mobileTextureUrl = baseUrl + '?width=900&quality=75';
```

### Cache Panels

```javascript
// Cache by URL
var contentCache = {};

function fetchWithCache(url, callback) {
  if (contentCache[url]) {
    callback(contentCache[url]);
  } else {
    fetch(url)
      .then(r => r.text())
      .then(html => {
        contentCache[url] = html;
        callback(html);
      });
  }
}
```

### Throttle Parallax

```javascript
// Use requestAnimationFrame
var parallaxPending = false;

function updateParallax() {
  if (parallaxPending) return;
  parallaxPending = true;
  
  requestAnimationFrame(function() {
    // Update parallax
    parallaxPending = false;
  });
}

document.addEventListener('mousemove', updateParallax);
```

---

## Accessibility Checklist

- [ ] All interactive elements keyboard-navigable
- [ ] Focus indicators visible (2px outline, high contrast)
- [ ] Dialogs have `role="dialog" aria-modal="true"`
- [ ] Feedback messages use `role="status"` or `role="alert"`
- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Color not sole indicator
- [ ] Text contrast ≥4.5:1
- [ ] Touch targets ≥44px × 44px
- [ ] Reduced motion respected

---

## Browser DevTools Tips

### Chrome DevTools

```javascript
// Pause on exception
// Ctrl+Shift+I → Sources → Pause on exceptions

// Breakpoint on element change
// Right-click element → Break on → subtree modifications

// Performance profiling
// Ctrl+Shift+I → Performance → Record

// Accessibility tree
// Ctrl+Shift+I → Elements → Accessibility tree
```

### Firefox DevTools

```javascript
// Inspector
// F12 → Inspector

// Console
// F12 → Console

// Debugger
// F12 → Debugger

// Performance
// F12 → Performance
```

### Safari DevTools

```javascript
// Web Inspector
// Cmd+Option+I

// Console
// Cmd+Option+C

// Debugger
// Cmd+Option+U
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read property 'focus' of null` | Element doesn't exist | Check element selector, verify element rendered |
| `Uncaught TypeError: fetch is not a function` | Fetch not supported | Use polyfill or check browser support |
| `CORS error` | Cross-origin request blocked | Use same-origin URLs, check CORS headers |
| `localStorage is not defined` | Private browsing | Wrap in try/catch, use sessionStorage fallback |
| `Three is not defined` | Three.js not loaded | Check script loading order, verify `defer` attribute |
| `Cannot read property 'innerHTML' of undefined` | Panel doesn't exist | Check panel ID, verify panel rendered |
| `Focus trap not working` | Focus management issue | Check focus trap implementation, verify focusable elements |

---

## Resources

- [Immersive Shopping Journey Spec](SPEC.md)
- [Implementation Tasks](TASKS.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [State Manager](../../assets/immersive/core/state-manager.js)
- [Store Engine](../../assets/immersive-store.js)
- [Canvas Section](../../sections/immersive-canvas.liquid)
- [Product Panel](../../sections/glass-product.liquid)
- [Cart Section](../../sections/immersive-cart.liquid)
