# Test the Shopping Journey Implementation Now

**Quick testing guide for the functions just implemented**

---

## Setup

1. Navigate to `/pages/immersive` in your browser
2. Open DevTools Console (F12)
3. You're ready to test!

---

## Test 1: Open Collection Panel

### In Browser Console:
```javascript
openCollectionPanel('suffuse');
```

### Expected Result:
- Glass panel opens with product grid
- Products from "Suffuse" collection display
- Panel fades in smoothly
- Focus moves to close button
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof openCollectionPanel); // Should be 'function'

// Check if glass panel exists
console.log(document.getElementById('glass-panel')); // Should exist

// Check if Section Rendering API works
fetch('/collections/suffuse?section_id=glass-panel')
  .then(r => r.text())
  .then(html => console.log('Response length:', html.length));
```

---

## Test 2: Open Product Panel

### In Browser Console:
```javascript
openProductPanel('silk-saree', 'suffuse');
```

### Expected Result:
- Glass panel opens with product detail
- Product title, price, images display
- Variant selector visible
- Add-to-cart button visible
- Panel fades in smoothly
- Focus moves to close button
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof openProductPanel); // Should be 'function'

// Check if Section Rendering API works
fetch('/products/silk-saree?section_id=glass-product')
  .then(r => r.text())
  .then(html => console.log('Response length:', html.length));
```

---

## Test 3: Close Panel

### In Browser Console:
```javascript
// First open a panel
openProductPanel('silk-saree');

// Then close it
closePanel();
```

### Expected Result:
- Panel fades out
- Panel hidden
- Focus returns to previous element
- Mode resets to 'showroom'
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof closePanel); // Should be 'function'

// Check if panel is hidden
console.log(document.getElementById('glass-panel').hidden);
```

---

## Test 4: Show Feedback

### In Browser Console:
```javascript
// Show success feedback
showFeedback('Added to cart!', 'success');

// Show error feedback (after 3 seconds)
setTimeout(() => {
  showFeedback('Error adding to cart', 'error');
}, 3000);
```

### Expected Result:
- Toast message appears in bottom-right
- Success message is green
- Error message is red
- Message auto-dismisses after 3 seconds
- Smooth fade-in/out animation
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof showFeedback); // Should be 'function'

// Check if feedback element created
console.log(document.querySelector('.immersive-feedback'));
```

---

## Test 5: Update Cart Count

### In Browser Console:
```javascript
updateCartCount();
```

### Expected Result:
- Cart count badge updates
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof updateCartCount); // Should be 'function'

// Check if cart count element exists
console.log(document.querySelector('[data-cart-count]'));

// Check if /cart.js works
fetch('/cart.js')
  .then(r => r.json())
  .then(cart => console.log('Cart:', cart));
```

---

## Test 6: Click Product Card

### In Browser:
1. Open a collection panel: `openCollectionPanel('suffuse')`
2. Click on a product card in the grid

### Expected Result:
- Product panel opens with that product's detail
- No page navigation
- No console errors

### If It Fails:
```javascript
// Check if product card handler is bound
console.log(typeof bindProductCardHandlers); // Should be 'function'

// Check if product cards have data attributes
console.log(document.querySelectorAll('[data-product-handle]').length);
```

---

## Test 7: Click Collection Link

### In Browser:
1. Open a product panel: `openProductPanel('silk-saree')`
2. Look for a collection link in the product detail
3. Click it

### Expected Result:
- Collection panel opens
- No page navigation
- No console errors

### If It Fails:
```javascript
// Check if collection link handler is bound
console.log(typeof bindCollectionLinkHandlers); // Should be 'function'

// Check if collection links exist
console.log(document.querySelectorAll('a[href*="/collections/"]').length);
```

---

## Test 8: Add to Cart

### In Browser:
1. Open a product panel: `openProductPanel('silk-saree')`
2. Select a variant (size, color, etc.)
3. Click "Add to Cart"

### Expected Result:
- Success feedback appears
- Cart count updates
- Product panel remains open
- No page navigation
- No console errors

### If It Fails:
```javascript
// Check if form handler is bound
var form = document.querySelector('form[action*="/cart/add"]');
console.log('Form found:', !!form);

// Check if variant is selected
var variantInput = form.querySelector('input[name="id"]');
console.log('Variant selected:', variantInput.value);

// Try manual add-to-cart
fetch('/cart/add.js', {
  method: 'POST',
  body: new FormData(form)
})
.then(r => r.json())
.then(data => console.log('Response:', data));
```

---

## Test 9: Keyboard Navigation

### In Browser:
1. Open a product panel: `openProductPanel('silk-saree')`
2. Press Escape

### Expected Result:
- Panel closes
- Focus returns to previous element
- No console errors

### If It Fails:
```javascript
// Check if Escape handler is bound
console.log(typeof bindGlassPanelClose); // Should be 'function'

// Check if panel is hidden after Escape
// (Open panel, press Escape, then check)
console.log(document.getElementById('glass-panel').hidden);
```

---

## Test 10: Caching

### In Browser:
1. Open a collection panel: `openCollectionPanel('suffuse')`
2. Close it: `closePanel()`
3. Open it again: `openCollectionPanel('suffuse')`

### Expected Result:
- First open: takes ~200-500ms (network request)
- Second open: instant (<100ms) (cached)
- No duplicate network requests
- No console errors

### If It Fails:
```javascript
// Check cache
console.log(Object.keys(contentCache).length); // Should have entries

// Check Network tab in DevTools
// Should see only one request for the same URL
```

---

## Full User Journey Test

### Step-by-Step:

1. Navigate to `/pages/immersive`
2. Click a hotspot to navigate to a room
3. Click a collection link or hotspot
4. Collection panel opens → ✅
5. Click a product card
6. Product panel opens → ✅
7. Select a variant
8. Click "Add to Cart"
9. Success feedback appears → ✅
10. Cart count updates → ✅
11. Press Escape
12. Panel closes, focus returns → ✅

### Expected Result:
- Complete user journey works end-to-end
- No page navigation
- No console errors
- Smooth animations
- Proper focus management

---

## Debugging Tips

### Check State
```javascript
console.log('State:', immersiveState);
console.log('Mode:', immersiveState.mode);
console.log('Last hotspot:', immersiveState.lastHotspot);
```

### Check Cache
```javascript
console.log('Cached URLs:', Object.keys(contentCache));
console.log('Cache size:', Object.keys(contentCache).length);
```

### Check Elements
```javascript
console.log('Glass panel:', document.getElementById('glass-panel'));
console.log('Product cards:', document.querySelectorAll('[data-product-handle]').length);
console.log('Collection links:', document.querySelectorAll('a[href*="/collections/"]').length);
```

### Check Network
```javascript
// Open DevTools Network tab
// Filter by XHR
// You should see:
// - /collections/{handle}?section_id=glass-panel
// - /products/{handle}?section_id=glass-product
// - /cart/add.js
// - /cart.js
```

---

## Common Issues

### Issue: Panel doesn't open
**Solution:** Check if Section Rendering API call succeeds
```javascript
fetch('/collections/suffuse?section_id=glass-panel')
  .then(r => r.text())
  .then(html => console.log('Response length:', html.length));
```

### Issue: Add-to-cart fails
**Solution:** Check if form exists and variant is selected
```javascript
var form = document.querySelector('form[action*="/cart/add"]');
console.log('Form:', form);
console.log('Variant:', form.querySelector('input[name="id"]').value);
```

### Issue: Focus doesn't move
**Solution:** Check if close button exists
```javascript
var closeBtn = document.getElementById('glass-panel').querySelector('.immersive-store__panel-close');
console.log('Close button:', closeBtn);
closeBtn.focus(); // Manually focus
```

### Issue: Feedback doesn't show
**Solution:** Check if CSS is loaded
```javascript
var feedback = document.createElement('div');
feedback.className = 'immersive-feedback immersive-feedback--success';
feedback.textContent = 'Test';
document.body.appendChild(feedback);
// Should see green toast in bottom-right
```

---

## Success Criteria

✅ All 10 tests pass  
✅ No console errors  
✅ Smooth animations  
✅ Proper focus management  
✅ Keyboard navigation works  
✅ Caching works  
✅ Complete user journey works  

---

## Next Steps

If all tests pass:
1. ✅ Phase 1 is complete
2. Move to Phase 2: Editorial overlays
3. Continue with Phase 3: Cart & checkout
4. Finish with Phase 4: Optimization & testing

If tests fail:
1. Check debugging tips above
2. Review QUICK_REFERENCE.md
3. Check browser console for errors
4. Verify Section Rendering API works
5. Check that all elements exist in DOM

---

## Questions?

Refer to:
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Quick lookup
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — Detailed guide
- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) — What was built
