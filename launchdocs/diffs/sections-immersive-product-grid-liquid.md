# sections/immersive-product-grid.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Fluid reveal data attributes removed

### launch-readiness-fixes
```liquid
<section
  ...
  data-enable-fluid-reveal="{{ section.settings.enable_fluid_reveal }}"
  data-fluid-reveal-intensity="{{ section.settings.fluid_reveal_intensity }}"
>
```

### main
```liquid
<section
  ...
>
```

**Impact:** Fluid reveal effect removed from product grid. The `fluid-reveal.js` module is no longer loaded.

---

## Change 2: Empty state hint text removed

### launch-readiness-fixes
```liquid
<p class="immersive-empty-state__hint" aria-live="polite">
  Tip: if you can't find items, try a keyword search or explore the lounge rooms.
</p>
```

### main
Removed.

**Impact:** Hard-coded English hint text removed (was not using `| t` filter — a localization bug).

---

## Change 3: Schema — Fluid Reveal settings removed

### launch-readiness-fixes (removed in main)
```json
{
  "type": "header",
  "content": "Fluid Reveal Effect"
},
{
  "type": "checkbox",
  "id": "enable_fluid_reveal",
  "label": "Enable fluid reveal hover effect",
  "default": true
},
{
  "type": "range",
  "id": "fluid_reveal_intensity",
  "label": "Effect intensity",
  "min": 1,
  "max": 10,
  "step": 1,
  "default": 5,
  "info": "Higher values create more dramatic distortion"
}
```

**Impact:** Fluid reveal feature completely removed from product grid.
