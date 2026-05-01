# sections/immersive-canvas.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: `data-transition-style` attribute removed from canvas wrapper

### launch-readiness-fixes
```liquid
<section
  ...
  data-transition-style="{{ section.settings.transition_style | default: 'crossfade' | escape }}"
>
```

### main
```liquid
<section
  ...
>
```

**Impact:** `transition_style` setting removed. The pixel dissolve transition option is gone; only crossfade remains (hardcoded in JS).

---

## Change 2: Search bar moved from center to right header group

### launch-readiness-fixes
The search bar (`<div class="immersive-search" data-immersive-search ...>`) was in the **center** of the header, between the nav and the right icons.

### main
The search bar is now inside `<div class="immersive-header__right">`, alongside the account link.

**Impact:** Visual layout change — search is no longer a centered, prominent element but is grouped with the right-side icons.

---

## Change 3: 3D→2D mode switch pill removed from header

### launch-readiness-fixes
```liquid
<!-- Right: mode switch + account + back button -->
<div class="immersive-header__right">
  <!-- 3D → 2D mode switch pill -->
  <a
    href="{{ routes.root_url }}"
    class="immersive-header__mode-switch"
    aria-label="{{ 'sections.immersive_journey_bridges.switch_to_2d_aria' | t }}"
    data-mode-switch-2d
  >
    <svg><!-- monitor icon --></svg>
    <span class="immersive-header__mode-switch-label">
      {{- 'sections.immersive_journey_bridges.switch_to_2d' | t -}}
    </span>
  </a>
  ...
```

### main
```liquid
<!-- Right: expanded search + account -->
<div class="immersive-header__right">
  <div class="immersive-search" data-immersive-search ...>
    ...
  </div>
  ...
```

**Impact:** The mode switch pill (3D→2D) is no longer in the header. This is a significant UX change — users can no longer switch back to 2D from the immersive header using this element.

---

## Change 4: Back button removed from header

### launch-readiness-fixes
```liquid
<!-- Back button (navigation history) -->
<button
  type="button"
  class="immersive-header__icon-btn immersive-back-btn"
  data-immersive-back
  aria-label="{{ 'sections.immersive_store.back_to_previous_room' | t }}"
  hidden
  disabled
>
  <svg><!-- arrow-left icon --></svg>
</button>
```

### main
Removed entirely.

**Impact:** Navigation history back button removed. Users can no longer navigate back through room history using a dedicated button.

---

## Change 5: Glass panel `data-msg-*` attributes reduced

### launch-readiness-fixes
```liquid
<section
  id="glass-panel"
  ...
  data-msg-add-to-cart="{{ 'sections.immersive_store.add_to_cart' | t | escape }}"
  data-msg-sold-out="{{ 'sections.immersive_store.sold_out' | t | escape }}"
  data-msg-adding="{{ 'sections.immersive_store.adding' | t | escape }}"
>
```

### main
These three `data-msg-*` attributes removed.

**Impact:** The `add_to_cart`, `sold_out`, and `adding` localized strings are no longer passed via the glass panel container. These may now be hardcoded in JS or passed differently.

---

## Change 6: Cookie consent banner HTML removed

### launch-readiness-fixes
```liquid
<div
  id="immersive-cookie-banner"
  class="immersive-cookie-banner"
  role="region"
  aria-label="{{ 'sections.immersive_store.cookie_banner.aria_label' | t }}"
  hidden
>
  <p class="immersive-cookie-banner__text">
    {{ 'sections.immersive_store.cookie_banner.text' | t }}
    <a href="/policies/privacy-policy" class="immersive-cookie-banner__learn-more">
      {{ 'sections.immersive_store.cookie_banner.learn_more' | t }}
    </a>
  </p>
  <div class="immersive-cookie-banner__actions">
    <button type="button" id="immersive-cookie-accept" ...>
      {{ 'sections.immersive_store.cookie_banner.accept' | t }}
    </button>
    <button type="button" id="immersive-cookie-decline" ...>
      {{ 'sections.immersive_store.cookie_banner.decline' | t }}
    </button>
  </div>
</div>
```

### main
Removed entirely.

**Impact:** Cookie consent banner removed from the immersive experience. Cookie consent is now handled by the standard Shopify/Dawn mechanism.

---

## Change 7: Back button CSS removed from `{% stylesheet %}`

### launch-readiness-fixes
```css
/* Back button — navigation history */
.immersive-back-btn { opacity: 1; transition: ...; }
.immersive-back-btn:hover:not(:disabled) { color: #e8c84a; ... }
.immersive-back-btn:disabled { opacity: 0.3; cursor: not-allowed; ... }
.immersive-back-btn[hidden] { display: none; }
.immersive-back-btn:focus-visible { outline: 2px solid #d4af37; ... }
@media (max-width: 768px) { .immersive-back-btn { ... } }
@media (prefers-reduced-motion: reduce) { .immersive-back-btn { ... } }
```

### main
Removed entirely (back button HTML also removed).

---

## Change 8: Cookie banner CSS removed from `{% stylesheet %}`

### launch-readiness-fixes
~60 lines of `.immersive-cookie-banner` CSS removed.

### main
Removed entirely (cookie banner HTML also removed).

---

## Change 9: Schema — `transition_style` setting removed

### launch-readiness-fixes
```json
{
  "type": "header",
  "content": "Room Transition"
},
{
  "type": "select",
  "id": "transition_style",
  "label": "t:sections.immersive_store.settings.transition_style.label",
  "options": [
    { "value": "crossfade", "label": "t:sections.immersive_store.settings.transition_style.option_crossfade" },
    { "value": "pixel_dissolve", "label": "t:sections.immersive_store.settings.transition_style.option_pixel_dissolve" }
  ],
  "default": "crossfade",
  "info": "t:sections.immersive_store.settings.transition_style.info"
}
```

### main
Removed entirely.
