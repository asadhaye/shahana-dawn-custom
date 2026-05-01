# snippets/immersive-product-card.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: `role="article"` and `aria-label` removed from card root

### launch-readiness-fixes
```liquid
<div
  class="immersive-product-card"
  role="article"
  aria-label="{{ 'sections.immersive.product_card.view_product' | t: title: product.title | escape }}"
  ...
>
```

### main
```liquid
<div
  class="immersive-product-card"
  ...
>
```

**Impact:** Accessibility regression — `role="article"` and descriptive `aria-label` removed. Cards are no longer individually labelled for screen readers.

---

## Change 2: Image `width` and `height` attributes removed

### launch-readiness-fixes
```liquid
<img
  src="{{ product.featured_image | image_url: width: 400 }}"
  alt="{{ product.featured_image.alt | escape }}"
  loading="lazy"
  width="{{ product.featured_image.width }}"
  height="{{ product.featured_image.height }}"
>
```

### main
```liquid
<img
  src="{{ product.featured_image | image_url: width: 400 }}"
  alt="{{ product.featured_image.alt | escape }}"
  loading="lazy"
>
```

Same change applied to the hover/second image.

**Impact:** Removing explicit `width`/`height` attributes can cause layout shift (CLS) as the browser doesn't know the image dimensions before loading.

---

## Change 3: Inline `<script>` for variant sync removed

### launch-readiness-fixes (removed in main)
```html
<script>
  // Sync variant selection to the hidden input so add-to-cart uses the correct variant
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.immersive-variant-button');
    if (!btn) return;
    var card = btn.closest('.immersive-product-card');
    if (!card) return;
    var input = card.querySelector('.immersive-variant-input');
    if (input && btn.dataset.variantId) {
      input.value = btn.dataset.variantId;
    }
  });
</script>
```

**Impact:** Variant selection sync script removed. This may affect add-to-cart functionality when a variant is selected on a product card — the hidden input may not update correctly.
