# Design Document: Product Designer UX Fixes

## Overview

This document provides technical design for 7 critical UX improvements to the immersive 3D store. All improvements are implemented as progressive enhancements using vanilla JavaScript, CSS, and Liquid templates. No new dependencies are introduced.

---

## Architecture

### Component Hierarchy

```
immersive-store.js (orchestrator)
├── Skeleton Loaders (renderSkeletonGrid, renderSkeletonProduct, renderSkeletonRoom)
├── Empty States (renderEmptyState)
├── Keyboard Navigation (initHotspotKeyboardNav, focusNextHotspot)
├── Active Filter Chips (renderActiveFilterChips, removeFilterChip)
├── Availability Badges (Liquid-only, no JS)
├── Loading States (fadeInContent, fadeOutContent)
└── Search Hierarchy (renderSearchResultWithIcon)
```

### File Changes

| File | Changes |
|------|---------|
| `assets/immersive-store.js` | +300 lines (6 new functions, 2 modified functions) |
| `assets/immersive-theme.css` | +200 lines (skeleton, empty states, chips, badges) |
| `sections/immersive-canvas.liquid` | +50 lines (ARIA live region for hotspot announcements) |
| `sections/immersive-product-grid.liquid` | +30 lines (empty state markup) |
| `snippets/immersive-product-card.liquid` | +15 lines (availability badge) |
| `locales/en.default.json` | +25 keys |

---

## Component Designs

### 1. Skeleton Loaders

#### 1.1 Skeleton Grid (Collection Panel)

**Function signature:**
```javascript
function renderSkeletonGrid(count) {
  // count: number of skeleton cards (default 6)
  // returns: HTML string
}
```

**HTML structure:**
```html
<div class="immersive-skeleton-grid">
  <div class="immersive-skeleton-card">
    <div class="immersive-skeleton-card__image"></div>
    <div class="immersive-skeleton-card__content">
      <div class="immersive-skeleton-card__line immersive-skeleton-card__line--short"></div>
      <div class="immersive-skeleton-card__line immersive-skeleton-card__line--medium"></div>
      <div class="immersive-skeleton-card__line immersive-skeleton-card__line--long"></div>
    </div>
  </div>
  <!-- Repeat 5 more times -->
</div>
```

**CSS:**
```css
.immersive-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.immersive-skeleton-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.immersive-skeleton-card__image {
  aspect-ratio: 2 / 3;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.1) 50%,
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.immersive-skeleton-card__content {
  padding: 1.25rem;
}

.immersive-skeleton-card__line {
  height: 12px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  margin-bottom: 0.75rem;
  animation: shimmer 1.5s infinite;
}

.immersive-skeleton-card__line--short { width: 40%; }
.immersive-skeleton-card__line--medium { width: 70%; }
.immersive-skeleton-card__line--long { width: 100%; }

@media (prefers-reduced-motion: reduce) {
  .immersive-skeleton-card__image,
  .immersive-skeleton-card__line {
    animation: none;
    background: rgba(255,255,255,0.08);
  }
}
```

#### 1.2 Skeleton Product (Product Panel)

**Function signature:**
```javascript
function renderSkeletonProduct() {
  // returns: HTML string
}
```

**HTML structure:**
```html
<div class="immersive-skeleton-product">
  <div class="immersive-skeleton-product__media"></div>
  <div class="immersive-skeleton-product__details">
    <div class="immersive-skeleton-product__line immersive-skeleton-product__line--title"></div>
    <div class="immersive-skeleton-product__line immersive-skeleton-product__line--price"></div>
    <div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>
    <div class="immersive-skeleton-product__cta"></div>
  </div>
</div>
```

**CSS:** Similar to skeleton grid, adapted for product layout

#### 1.3 Integration with openCollectionPanel

**Before:**
```javascript
function openCollectionPanel(handle) {
  var url = shopRoot + 'collections/' + handle + '?section_id=immersive-product-grid';
  fetchWithCache(url).then(function(html) {
    content.innerHTML = html;
    openDialogFocus(panel);
  });
}
```

**After:**
```javascript
function openCollectionPanel(handle) {
  var panel = document.getElementById('glass-panel');
  var content = panel.querySelector('.immersive-store__panel-content');
  
  // Show skeleton immediately
  content.innerHTML = renderSkeletonGrid(6);
  content.style.opacity = '1';
  openDialogFocus(panel);
  
  // Fetch real content
  var url = shopRoot + 'collections/' + handle + '?section_id=immersive-product-grid';
  fetchWithCache(url).then(function(html) {
    fadeInContent(content, html);
  });
}
```

---

### 2. Enhanced Empty States

#### 2.1 Empty State Component

**Function signature:**
```javascript
function renderEmptyState(type, context) {
  // type: 'collection' | 'search' | 'wishlist'
  // context: { term: string } for search, {} otherwise
  // returns: HTML string
}
```

**HTML structure:**
```html
<div class="immersive-empty-state">
  <svg class="immersive-empty-state__icon" aria-hidden="true">
    <!-- Icon varies by type -->
  </svg>
  <h3 class="immersive-empty-state__heading">
    <!-- Heading varies by type -->
  </h3>
  <p class="immersive-empty-state__body">
    <!-- Body text varies by type -->
  </p>
  <div class="immersive-empty-state__actions">
    <button type="button" class="immersive-empty-state__action" data-empty-action="search">
      <!-- CTA text varies by type -->
    </button>
    <button type="button" class="immersive-empty-state__action immersive-empty-state__action--secondary" data-empty-action="browse">
      <!-- CTA text varies by type -->
    </button>
  </div>
</div>
```

**CSS:**
```css
.immersive-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  min-height: 400px;
}

.immersive-empty-state__icon {
  width: 64px;
  height: 64px;
  color: #d4af37;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.immersive-empty-state__heading {
  font-size: 1.5rem;
  font-weight: 600;
  color: #d4af37;
  margin: 0 0 0.75rem;
}

.immersive-empty-state__body {
  font-size: 1rem;
  color: rgba(249, 250, 251, 0.7);
  margin: 0 0 2rem;
  max-width: 400px;
}

.immersive-empty-state__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.immersive-empty-state__action {
  padding: 0.75rem 1.5rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 8px;
  color: #d4af37;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.immersive-empty-state__action:hover {
  background: rgba(212, 175, 55, 0.25);
  transform: translateY(-1px);
}

.immersive-empty-state__action--secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(249, 250, 251, 0.9);
}

@media (prefers-reduced-motion: reduce) {
  .immersive-empty-state__action {
    transition: none;
    transform: none !important;
  }
}
```

#### 2.2 Integration with immersive-product-grid.liquid

**Add to section:**
```liquid
{%- if collection.products.size == 0 -%}
  <div class="immersive-empty-state" data-empty-state="collection">
    <svg class="immersive-empty-state__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5z"/>
    </svg>
    <h3 class="immersive-empty-state__heading">
      {{ 'sections.immersive_store.empty_states.collection_heading' | t }}
    </h3>
    <p class="immersive-empty-state__body">
      {{ 'sections.immersive_store.empty_states.collection_body' | t }}
    </p>
    <div class="immersive-empty-state__actions">
      <button type="button" class="immersive-empty-state__action" data-empty-action="search">
        {{ 'sections.immersive_store.empty_states.collection_search' | t }}
      </button>
      <button type="button" class="immersive-empty-state__action immersive-empty-state__action--secondary" data-empty-action="browse">
        {{ 'sections.immersive_store.empty_states.collection_browse' | t }}
      </button>
    </div>
  </div>
{%- endif -%}
```

---

### 3. Keyboard Navigation for Hotspots

#### 3.1 Hotspot Focus Management

**Global state:**
```javascript
var _focusedHotspotIndex = -1;
var _hotspotElements = [];
```

**Function signatures:**
```javascript
function initHotspotKeyboardNav() {
  // Attaches keyboard listeners to canvas
  // Called once in safeBindImmersiveInit()
}

function updateHotspotElements() {
  // Refreshes _hotspotElements array from DOM
  // Called after renderHotspots()
}

function focusNextHotspot(direction) {
  // direction: 1 (forward) or -1 (backward)
  // Updates _focusedHotspotIndex and applies focus
}

function announceHotspot(label) {
  // Updates ARIA live region with hotspot label
}
```

**Implementation:**
```javascript
function initHotspotKeyboardNav() {
  var canvas = document.getElementById('immersive-canvas');
  if (!canvas) return;
  
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Immersive 3D showroom. Press Tab to navigate hotspots.');
  
  canvas.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      focusNextHotspot(e.shiftKey ? -1 : 1);
    }
    if (e.key === 'Enter' && _focusedHotspotIndex >= 0) {
      var hotspot = _hotspotElements[_focusedHotspotIndex];
      if (hotspot) hotspot.click();
    }
  });
}

function updateHotspotElements() {
  var uiLayer = document.getElementById('ui-layer');
  if (!uiLayer) return;
  _hotspotElements = Array.from(uiLayer.querySelectorAll('[data-hotspot-btn]'));
  _focusedHotspotIndex = -1;
}

function focusNextHotspot(direction) {
  if (_hotspotElements.length === 0) {
    announceHotspot('No hotspots in this room');
    return;
  }
  
  _focusedHotspotIndex += direction;
  
  // Wrap around
  if (_focusedHotspotIndex < 0) {
    _focusedHotspotIndex = _hotspotElements.length - 1;
  } else if (_focusedHotspotIndex >= _hotspotElements.length) {
    _focusedHotspotIndex = 0;
  }
  
  var hotspot = _hotspotElements[_focusedHotspotIndex];
  if (hotspot) {
    hotspot.focus();
    var label = hotspot.getAttribute('aria-label') || hotspot.textContent;
    announceHotspot(label);
  }
}

function announceHotspot(label) {
  var liveRegion = document.getElementById('immersive-hotspot-announcer');
  if (liveRegion) {
    liveRegion.textContent = label;
  }
}
```

**Liquid changes (immersive-canvas.liquid):**
```liquid
<!-- Add ARIA live region for hotspot announcements -->
<div id="immersive-hotspot-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>
```

**CSS for focus ring:**
```css
[data-hotspot-btn]:focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 4px;
  border-radius: 8px;
}

@media (prefers-reduced-motion: reduce) {
  [data-hotspot-btn]:focus-visible {
    outline-offset: 2px;
  }
}
```

---

### 4. Active Filter Chips

#### 4.1 Filter Chip Component

**Function signature:**
```javascript
function renderActiveFilterChips(filterState) {
  // filterState: { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' }
  // returns: HTML string
}

function removeFilterChip(filterKey, filterValue) {
  // filterKey: 'color' | 'priceMin' | 'priceMax' | 'designer' | 'sortBy'
  // filterValue: string value to remove
  // Updates filterState, re-fetches collection
}
```

**HTML structure:**
```html
<div class="immersive-active-filters" data-active-filters>
  <span class="immersive-active-filters__label">Active filters:</span>
  <div class="immersive-active-filters__chips">
    <button type="button" class="immersive-chip" data-filter-chip="color:ivory" aria-label="Remove Ivory filter">
      Ivory
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <!-- More chips -->
  </div>
  <button type="button" class="immersive-active-filters__clear" data-clear-filters>
    Clear all
  </button>
</div>
```

**CSS:**
```css
.immersive-active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.immersive-active-filters__label {
  font-size: 0.875rem;
  color: rgba(249, 250, 251, 0.7);
  font-weight: 600;
}

.immersive-active-filters__chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.immersive-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 9999px;
  color: #d4af37;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.immersive-chip:hover {
  background: rgba(212, 175, 55, 0.25);
  border-color: rgba(212, 175, 55, 0.6);
}

.immersive-chip svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.5;
}

.immersive-active-filters__clear {
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(249, 250, 251, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.immersive-active-filters__clear:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .immersive-chip,
  .immersive-active-filters__clear {
    transition: none;
  }
}
```

#### 4.2 Integration with ImmersiveFilters

**Modify applyFilters() in immersive-store.js:**
```javascript
function applyFilters(filterState) {
  // Existing filter logic...
  
  // Render active filter chips
  var chipsContainer = document.querySelector('[data-filter-chips-container]');
  if (chipsContainer) {
    var hasActiveFilters = filterState.colors.length > 0 || 
                          filterState.priceMin !== null || 
                          filterState.priceMax !== null || 
                          filterState.designers.length > 0 || 
                          filterState.sortBy !== 'manual';
    
    if (hasActiveFilters) {
      chipsContainer.innerHTML = renderActiveFilterChips(filterState);
      chipsContainer.hidden = false;
    } else {
      chipsContainer.hidden = true;
    }
  }
  
  // Re-fetch collection...
}
```

---

### 5. Availability Badges on Product Cards

**Liquid changes (snippets/immersive-product-card.liquid):**
```liquid
<!-- Add after opening <article> tag -->
<div class="immersive-product-card__availability">
  {%- if product.available -%}
    <span class="immersive-product-card__availability-badge immersive-product-card__availability-badge--in-stock" aria-hidden="true">
      {{ 'products.product.in_stock' | t }}
    </span>
  {%- else -%}
    <span class="immersive-product-card__availability-badge immersive-product-card__availability-badge--sold-out" aria-hidden="true">
      {{ 'products.product.sold_out' | t }}
    </span>
  {%- endif -%}
</div>
```

**CSS (add to snippet's {% stylesheet %} block):**
```css
.immersive-product-card__availability {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 3;
}

.immersive-product-card__availability-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 4px;
}

.immersive-product-card__availability-badge--in-stock {
  background: #51cf66;
  color: #000;
}

.immersive-product-card__availability-badge--sold-out {
  background: #ff6b6b;
  color: #fff;
}
```

---

### 6. Loading States for Panel Transitions

**Function signatures:**
```javascript
function fadeInContent(container, html) {
  // container: DOM element
  // html: HTML string to inject
  // Fades out, injects, fades in
}

function fadeOutContent(container, callback) {
  // container: DOM element
  // callback: function to call after fade-out
}
```

**Implementation:**
```javascript
function fadeInContent(container, html) {
  if (reduceMotion) {
    container.innerHTML = html;
    return;
  }
  
  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';
  
  setTimeout(function() {
    container.innerHTML = html;
    container.style.opacity = '1';
  }, 150);
}

function fadeOutContent(container, callback) {
  if (reduceMotion) {
    if (callback) callback();
    return;
  }
  
  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';
  
  setTimeout(function() {
    if (callback) callback();
  }, 150);
}
```

**CSS:**
```css
.immersive-store__panel-content {
  min-height: 400px;
  transition: opacity 150ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .immersive-store__panel-content {
    transition: none !important;
  }
}
```

---

### 7. Search Result Visual Hierarchy

**Function signature:**
```javascript
function renderSearchResultWithIcon(result) {
  // result: { type: 'product' | 'collection' | 'room', title: string, handle: string, ... }
  // returns: HTML string with icon
}
```

**HTML structure:**
```html
<button type="button" class="immersive-search-result" data-result-type="product" data-result-handle="...">
  <svg class="immersive-search-result__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <!-- Icon varies by type -->
  </svg>
  <span class="immersive-search-result__title">Product Title</span>
</button>
```

**CSS:**
```css
.immersive-search-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #f9fafb;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.immersive-search-result:hover {
  background: rgba(255, 255, 255, 0.05);
}

.immersive-search-result__icon {
  flex-shrink: 0;
  color: #d4af37;
}

.immersive-search-result__title {
  flex: 1;
  font-size: 0.875rem;
}

.immersive-search__group-heading {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.7);
  padding: 0.5rem 0.75rem;
  margin-top: 1rem;
}

.immersive-search__group-heading:first-child {
  margin-top: 0;
}

@media (prefers-reduced-motion: reduce) {
  .immersive-search-result {
    transition: none;
  }
}
```

---

## Testing Strategy

### Unit Tests
- `renderSkeletonGrid()` returns valid HTML with correct number of cards
- `renderEmptyState()` returns correct HTML for each type
- `focusNextHotspot()` wraps around correctly
- `renderActiveFilterChips()` generates correct chips from filterState
- `fadeInContent()` respects `prefers-reduced-motion`

### Integration Tests
- Skeleton loader appears before Section Rendering API response
- Empty state appears when collection has zero products
- Keyboard Tab navigates through hotspots
- Filter chips update when filters change
- Availability badge shows correct status

### Manual QA Checklist
- [ ] Skeleton loaders appear on slow connections
- [ ] Empty states show correct CTAs
- [ ] Keyboard navigation works without mouse
- [ ] Filter chips are dismissible
- [ ] Availability badges are visible
- [ ] Panel transitions are smooth
- [ ] Search results have icons
- [ ] All animations respect `prefers-reduced-motion`
- [ ] All interactive elements have ARIA labels
- [ ] All strings use `| t` filter

---

## Performance Considerations

- Skeleton loaders use CSS animations (GPU-accelerated)
- Empty states are static HTML (no JS overhead)
- Keyboard navigation uses event delegation (single listener)
- Filter chips use event delegation (single listener per chip bar)
- Availability badges are Liquid-only (no JS)
- Loading states use CSS transitions (GPU-accelerated)
- Search icons are inline SVG (no additional requests)

**Estimated bundle size increase:** +2.5KB minified

---

## Accessibility Considerations

- All skeleton loaders have `aria-hidden="true"` (decorative)
- All empty state icons have `aria-hidden="true"` (decorative)
- All empty state CTAs have clear `aria-label` attributes
- Hotspot announcements use `aria-live="polite"`
- Filter chips have `role="button"` and `aria-label`
- Availability badges have `aria-hidden="true"` (redundant with button state)
- Loading states maintain focus position
- Search result icons have `aria-hidden="true"` (redundant with group heading)

---

## Rollback Plan

If any component causes issues:
1. Comment out the `init*()` call in `safeBindImmersiveInit()`
2. Remove the CSS block from `immersive-theme.css`
3. Revert Liquid changes if necessary

All components are independent and can be disabled individually.

---

## Future Enhancements

- Skeleton loader for room texture loading (Phase 3)
- Color contrast audit and fixes (Phase 2)
- Alternative 2D navigation for WebGL fallback (Phase 2)
- Wishlist context metadata (Phase 2)
- Visual weight adjustments (Phase 3)
