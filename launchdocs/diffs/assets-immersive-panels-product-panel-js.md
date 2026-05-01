# assets/immersive/panels/product-panel.js — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Buy Now — cart navigation target changed

### launch-readiness-fixes
```javascript
// Navigate to immersive cart page instead of opening drawer
window.location.href = shopRoot + 'pages/immersive-cart';
```

### main
```javascript
// Open Dawn's cart drawer if available, otherwise navigate to cart
var cartDrawer = document.querySelector('cart-drawer');
if (cartDrawer && typeof cartDrawer.open === 'function') {
  // Refresh cart drawer contents then open it
  fetch(shopRoot + '?section_id=cart-drawer', {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var newDrawer = temp.querySelector('cart-drawer');
      if (newDrawer) {
        cartDrawer.innerHTML = newDrawer.innerHTML;
      }
      cartDrawer.open();
    })
    .catch(function () {
      cartDrawer.open();
    });
} else {
  window.location.href = shopRoot + 'cart';
}
```

**Impact:** This is a significant UX change. In `launch-readiness-fixes`, Buy Now navigated to a custom `/pages/immersive-cart` page (which has since been deleted). In `main`, Buy Now:
1. Tries to open Dawn's native `<cart-drawer>` web component
2. Refreshes the drawer contents via Section Rendering API first
3. Falls back to navigating to `/cart` if no drawer is present

This keeps the user in the immersive experience after adding to cart, rather than navigating away.
