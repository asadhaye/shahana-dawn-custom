# assets/immersive-theme.css — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Badge border opacity reduced (line ~413)

### launch-readiness-fixes
```css
border: 1px solid rgba(212, 175, 55, 0.6);
```

### main
```css
border: 1px solid rgba(212, 175, 55, 0.35);
```

**Impact:** Room badge border is more subtle/transparent in main.

---

## Change 2: `.immersive-search` layout — flex-grow replaced with constrained flex

### launch-readiness-fixes
```css
.immersive-search {
  position: relative;
  flex-grow: 1;
  margin: 0 1rem;
  max-width: none;
  min-width: 0;
}
```

### main
```css
.immersive-search {
  position: relative;
  flex: 1;
  max-width: 480px;
  min-width: 280px;
}
```

**Impact:** Search bar now has explicit min/max width constraints instead of growing unbounded. Margin removed (handled by parent flex gap).

---

## Change 3: `.immersive-search__field` — `width: 100%` removed

### launch-readiness-fixes
```css
.immersive-search__field {
  /* ... */
  width: 100%;
}
```

### main
```css
.immersive-search__field {
  /* ... */
  /* width: 100% removed */
}
```

---

## Change 4: Responsive breakpoints — margin replaced with max/min-width

### launch-readiness-fixes
```css
@media (max-width: 1024px) {
  .immersive-search { margin: 0 0.75rem; }
}
@media (max-width: 768px) {
  .immersive-search { margin: 0 0.5rem; }
}
@media (max-width: 480px) {
  .immersive-search { margin: 0 0.5rem; }
}
```

### main
```css
@media (max-width: 1024px) {
  .immersive-search { max-width: 360px; min-width: 240px; }
}
@media (max-width: 768px) {
  .immersive-search { max-width: 280px; min-width: 200px; }
}
@media (max-width: 480px) {
  .immersive-search { max-width: 220px; min-width: 180px; }
}
```

---

## Change 5: Feedback toast styles REMOVED (~80 lines)

### launch-readiness-fixes (removed in main)
```css
/* Feedback Messages (Toast Notifications) */
.immersive-feedback { position: fixed; bottom: 20px; right: 20px; ... }
.immersive-feedback--success { background-color: #10b981; color: white; }
.immersive-feedback--error { background-color: #ef4444; color: white; }
.immersive-feedback--visible { opacity: 1; transform: translateY(0); ... }
@media (max-width: 640px) { .immersive-feedback { ... } }
@media (prefers-reduced-motion: reduce) { .immersive-feedback { ... } }
```

**Impact:** Toast notification styles removed from global CSS. These were likely moved to section-scoped `{% stylesheet %}` blocks or removed entirely.

---

## Change 6: Editorial overlay styles REMOVED (~160 lines)

### launch-readiness-fixes (removed in main)
```css
/* Editorial Overlay */
#immersive-editorial-overlay { position: fixed; top: 0; ... }
#immersive-editorial-overlay[hidden] { display: none; }
#immersive-editorial-overlay-content { flex: 1; ... }
.immersive-editorial-header { position: sticky; ... }
.immersive-editorial-header__title { ... }
.immersive-editorial-header__close { ... }
[data-parallax-item] { transition: transform 0.1s ease-out; }
.immersive-editorial-content { ... }
.immersive-editorial-section { ... }
/* + mobile and reduced-motion variants */
```

**Impact:** Editorial overlay global styles removed. These are now handled by section-scoped `{% stylesheet %}` blocks in `immersive-editorial.liquid` and `immersive-canvas.liquid`.
