# sections/glass-product.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: CSS class name fix — `glass-product-section__empty` → `glass-panel-section__empty`

### launch-readiness-fixes
```liquid
<p class="glass-product-section__empty">{{ 'sections.immersive.product_grid.empty' | t }}</p>
```

### main
```liquid
<p class="glass-panel-section__empty">{{ 'sections.immersive.product_grid.empty' | t }}</p>
```

**Impact:** BEM class name corrected to match the panel container's block name.

---

## Change 2: Add-to-cart button background — glassmorphism → solid gold

### launch-readiness-fixes
```css
background: rgba(212, 175, 55, 0.9);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

### main
```css
background: #d4af37;
```

**Impact:** Add-to-cart button is now solid gold instead of semi-transparent glass. More legible and consistent with brand.

---

## Change 3: Accelerated checkout button styles removed (~40 lines)

### launch-readiness-fixes (removed in main)
```css
/* Accelerated checkout buttons (PayPal, Apple Pay, etc.) */
.glass-product-section .shopify-payment-button { ... }
.glass-product-section .shopify-payment-button__button { border-radius: 999px !important; ... }
.glass-product-section .shopify-payment-button__button:hover { opacity: 1; transform: translateY(-1px); }
.glass-product-section .shopify-payment-button__more-options { ... }
.glass-product-section .shopify-payment-button__more-options:hover { ... }
/* Mobile variants */
.glass-product-section .shopify-payment-button { max-width: 100%; }
.glass-product-section .shopify-payment-button__button { font-size: 0.9rem !important; }
```

**Impact:** Custom accelerated checkout button styling removed. Dawn's default styles apply.

---

## Change 4: `.glass-product-section__empty` CSS removed

### launch-readiness-fixes (removed in main)
```css
.glass-product-section__empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  padding: 3rem 1rem;
}
```
