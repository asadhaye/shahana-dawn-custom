# snippets/immersive-bridge-btn.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Parameters simplified — heading and image removed

### launch-readiness-fixes
```liquid
@param {string} [bridge_heading] - Optional override heading (defaults to shop.name)
@param {object} [bridge_image] - Optional Shopify image object for preview thumbnail
```
Usage example:
```liquid
bridge_class: 'collection',
bridge_heading: collection.title,
bridge_subtext: 'Immersive 3D Experience',
bridge_image: collection.featured_image
```

### main
```liquid
bridge_class: 'collection'
```

**Impact:** `bridge_heading` and `bridge_image` parameters removed. Bridge buttons are simpler — no thumbnail image, no heading.

---

## Change 2: Image thumbnail HTML removed

### launch-readiness-fixes (removed in main)
```liquid
{%- if bridge_image != blank -%}
  <span class="immersive-bridge-btn__media">
    {{-
      bridge_image
      | image_tag:
        loading: 'lazy',
        sizes: '(max-width: 768px) 100vw, 50vw',
        widths: '160,240,320',
        alt: bridge_heading | default: shop.name
    -}}
  </span>
{%- endif -%}
```

**Impact:** Collection/product thumbnail preview removed from bridge buttons.

---

## Change 3: HTML structure flattened — `__content` wrapper removed

### launch-readiness-fixes
```liquid
<span class="immersive-bridge-btn__content">
  <span class="immersive-bridge-btn__eyebrow" aria-hidden="true">
    <span class="immersive-bridge-btn__dot"></span>
    {{- 'sections.immersive_journey_bridges.bridge_eyebrow' | t -}}
  </span>
  {%- if bridge_heading != blank -%}
    <h3 class="immersive-bridge-btn__heading" aria-hidden="true">
      {{- bridge_heading | escape -}}
    </h3>
  {%- endif -%}
  <span class="immersive-bridge-btn__text">
    <span class="immersive-bridge-btn__label" aria-hidden="true">
      {{- bridge_label | escape -}}
    </span>
    {%- if bridge_subtext != blank -%}
      <span class="immersive-bridge-btn__subtext">{{- bridge_subtext | escape -}}</span>
    {%- endif -%}
  </span>
</span>
```

### main
```liquid
<span class="immersive-bridge-btn__eyebrow" aria-hidden="true">
  <span class="immersive-bridge-btn__dot"></span>
  {{- 'sections.immersive_journey_bridges.bridge_eyebrow' | t -}}
</span>
<span class="immersive-bridge-btn__text">
  <span class="immersive-bridge-btn__label" aria-hidden="true">
    {{- bridge_label | escape -}}
  </span>
  {%- if bridge_subtext != blank -%}
    <span class="immersive-bridge-btn__subtext">{{- bridge_subtext | escape -}}</span>
  {%- endif -%}
</span>
```

**Impact:** `__content` wrapper and `__heading` element removed. Flatter, simpler structure.

---

## Change 4: CSS — media and heading styles removed, wrapper spacing added

### launch-readiness-fixes (removed in main)
```css
.immersive-bridge-btn__media { display: inline-flex; width: 48px; height: 48px; ... }
.immersive-bridge-btn__media img { width: 100%; height: 100%; object-fit: cover; }
.immersive-bridge-btn__content { display: flex; flex-direction: column; ... }
.immersive-bridge-btn__heading { margin: 0; font-size: 0.85rem; font-weight: 700; ... }
/* Mobile: hide media and heading */
.immersive-bridge-btn__media { display: none; }
.immersive-bridge-btn__heading { display: none; }
```

### main (added)
```css
.immersive-bridge-btn__wrapper {
  padding: 1rem 0;
}
```
