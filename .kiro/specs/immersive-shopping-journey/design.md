# Design Document: Immersive Shopping Journey

## Overview

The Immersive Shopping Journey feature completes the end-to-end 3D shopping experience for Shahana Collection by establishing a bidirectional bridge system between the 2D storefront and the WebGL-powered 3D showroom. This design document outlines the technical architecture, component structure, data flows, and state management required to implement six bridge entry points (collection, search, product, cart, collections list, and content pages) plus a persistent 3D mode preference system.

### Key Goals

1. **Seamless Context Preservation** — Users can switch between 2D and 3D experiences without losing their browsing context (product, collection, search query)
2. **Progressive Enhancement** — All bridges function as standard `<a>` elements without JavaScript; device/connection-aware messaging is a non-blocking enhancement
3. **Preference Persistence** — Returning visitors who prefer the 3D experience are guided back via a non-intrusive banner
4. **Accessibility First** — All interactive elements meet WCAG 2.1+ standards with proper focus management, ARIA labels, and keyboard navigation
5. **Performance Optimized** — Bridge CTAs are lightweight, Section Rendering API calls are cached, and texture loading is optimized per room

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shopify Online Store 2.0                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  2D Storefront (Standard Dawn Templates)                 │   │
│  │  ├─ Homepage (/)                                         │   │
│  │  ├─ Collections (/collections/*)                        │   │
│  │  ├─ Products (/products/*)                              │   │
│  │  ├─ Search (/search)                                    │   │
│  │  ├─ Cart (/cart)                                        │   │
│  │  ├─ Collections List (/collections)                     │   │
│  │  └─ Blog/Articles (/blogs/*, /blogs/*/articles/*)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓ Bridge CTAs (6 entry points)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  3D Immersive Store (/pages/immersive)                   │   │
│  │  ├─ Three.js Canvas + Parallax                          │   │
│  │  ├─ Room Navigation (storefront → lounge → rooms)       │   │
│  │  ├─ Glass Panels (product, collection, search)          │   │
│  │  ├─ Editorial Overlays (per-room stories)               │   │
│  │  └─ Wishlist + Cart Integration                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↑ Mode Switch (3D → 2D)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Preference System (localStorage)                        │   │
│  │  ├─ Write: immersive_preferred_mode = '3d'              │   │
│  │  ├─ Read: Preference Banner on 2D pages                 │   │
│  │  └─ Dismiss: Session-scoped banner removal              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Entry Points & Deep-Link Parameters

| Entry Point | URL | Parameter | Effect |
|---|---|---|---|
| Collection Bridge | `/collections/{handle}` | `?open_collection={handle}` | Opens collection grid panel |
| Product Bridge | `/products/{handle}` | `?open_product={handle}` | Opens product detail panel |
| Search Bridge | `/search?q={terms}` | `?open_search={terms}` | Opens search results panel |
| Cart Bridge | `/cart` | (none) | Links to `/pages/immersive` |
| Collections List Bridge | `/collections` | (none) | Links to `/pages/immersive` |
| Content Bridge | `/blogs/*`, `/blogs/*/articles/*` | (none) | Links to `/pages/immersive` |

**Priority Rule:** When multiple parameters are present, `open_product` > `open_collection` > `open_search`.

---

## Components and Interfaces

### 1. Bridge Button Component (`snippets/immersive-bridge-btn.liquid`)

A reusable, parameterized Liquid snippet that renders all bridge CTAs across 2D pages.

**Parameters:**
```liquid
{% render 'immersive-bridge-btn',
  bridge_url: '/?open_collection=suffuse',
  bridge_label: 'Explore in 3D',
  bridge_aria: 'Explore Suffuse collection in 3D showroom',
  bridge_class: 'collection',
  bridge_heading: 'Shahana Collection',
  bridge_subtext: 'Immersive 3D Experience',
  bridge_image: collection.featured_image
%}
```

**Responsibilities:**
- Render semantic `<a href>` element with `data-immersive-bridge` attribute
- Include responsive image or placeholder SVG
- Apply BEM CSS classes (`.immersive-bridge-btn`, `.immersive-bridge-btn--{class}`)
- Include `:focus-visible` outline for keyboard navigation
- Include hover states with subtle animations
- Respect `prefers-reduced-motion` media query
- Escape all user-provided text to prevent XSS

**Output Structure:**
```html
<a
  href="/?open_collection=suffuse"
  class="immersive-bridge-btn immersive-bridge-btn--collection"
  data-immersive-bridge
  aria-label="Explore Suffuse collection in 3D showroom"
>
  <div class="immersive-bridge-btn__media">
    <!-- Image or placeholder SVG -->
  </div>
  <div class="immersive-bridge-btn__content">
    <span class="immersive-bridge-btn__eyebrow">
      <span class="immersive-bridge-btn__dot"></span>
      Immersive 3D Experience
    </span>
    <h3 class="immersive-bridge-btn__heading">Shahana Collection</h3>
    <span class="immersive-bridge-btn__cta">
      Explore in 3D
      <svg class="immersive-bridge-btn__arrow"><!-- arrow icon --></svg>
    </span>
  </div>
</a>
```

### 2. Preference Banner Component (`layout/theme.liquid`)

A non-blocking, dismissible banner injected on 2D pages when `immersive_preferred_mode = '3d'` is set in localStorage.

**Responsibilities:**
- Render as `hidden` in initial HTML (no flash)
- Reveal only after JS reads localStorage
- Include link to `/pages/immersive` with localized label
- Include dismiss button that removes banner from DOM
- Restore focus to next sibling after dismiss
- Suppress on `page.immersive`, `index`, and `password` templates
- Handle private browsing gracefully (no localStorage)

**Output Structure:**
```html
<div
  id="immersive-preference-banner"
  class="immersive-preference-banner"
  role="region"
  aria-label="Return to 3D store"
  hidden
>
  <div class="immersive-preference-banner__content">
    <p class="immersive-preference-banner__text">
      You previously used our 3D showroom. Return to the immersive experience?
    </p>
    <div class="immersive-preference-banner__actions">
      <a href="/pages/immersive" class="immersive-preference-banner__cta">
        Return to 3D Store
      </a>
      <button
        type="button"
        class="immersive-preference-banner__dismiss"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  </div>
</div>
```

### 3. URL Parameter Handler (in `assets/immersive-store.js`)

Extends existing URL parameter parsing to handle `open_collection` and `open_search` in addition to `open_product`.

**Responsibilities:**
- Parse URL query parameters on page load
- Apply priority rule: `open_product` > `open_collection` > `open_search`
- Defer panel opening by 400ms to allow scene to render
- Fetch Section Rendering API responses for collection/search panels
- Handle empty/invalid parameters gracefully
- Log errors to console for debugging

**Pseudocode:**
```javascript
function handleUrlParams() {
  var params = new URLSearchParams(window.location.search);
  var openProduct = params.get('open_product');
  var openCollection = params.get('open_collection');
  var openSearch = params.get('open_search');

  setTimeout(function() {
    if (openProduct && openProduct.trim()) {
      openProductPanel(openProduct);
    } else if (openCollection && openCollection.trim()) {
      openCollectionPanel(openCollection);
    } else if (openSearch && openSearch.trim()) {
      openSearchPanel(decodeURIComponent(openSearch));
    }
  }, 400);
}
```

### 4. Preference Manager (in `assets/immersive/core/state-manager.js`)

Manages reading/writing the `immersive_preferred_mode` localStorage key.

**Responsibilities:**
- Write `'3d'` to localStorage on successful scene init
- Read preference on 2D pages to trigger banner display
- Handle private browsing environments gracefully
- Provide clear API for preference state

**API:**
```javascript
writeImmersivePreference(storage)  // Write '3d' to localStorage
readImmersivePreference(storage)   // Read '3d' from localStorage
clearImmersivePreference(storage)  // Remove preference
```

### 5. Device/Connection-Aware Bridge Behavior (in `assets/bridge-behavior.js`)

A lightweight script loaded on all pages that detects slow connections and motion sensitivity, then adjusts bridge messaging accordingly.

**Responsibilities:**
- Query all `[data-immersive-bridge]` elements on DOMContentLoaded
- Detect slow connections via `navigator.connection` API
- Detect motion sensitivity via `prefers-reduced-motion` media query
- Modify bridge heading text for slow connections (non-blocking warning)
- Wrap all feature detection in guards for browser compatibility
- Pass localized strings via `data-*` attributes from Liquid

**Pseudocode:**
```javascript
function initBridgeBehavior() {
  var bridges = document.querySelectorAll('[data-immersive-bridge]');
  var isSlowConnection = checkSlowConnection();
  var hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bridges.forEach(function(bridge) {
    if (isSlowConnection && bridge.href.includes('?open_')) {
      var heading = bridge.querySelector('.immersive-bridge-btn__heading');
      if (heading) {
        heading.textContent = bridge.getAttribute('data-slow-connection-warning');
      }
    }
  });
}

function checkSlowConnection() {
  if (!navigator.connection) return false;
  return navigator.connection.saveData ||
         ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);
}
```

---

## Data Models

### State Structure

```javascript
immersiveState = {
  currentRoom: 'storefront',        // Current room key
  mode: 'showroom',                 // 'showroom' | 'editorial' | 'panel'
  editorialRoom: null,              // Room key when in editorial mode
  lastHotspot: null,                // DOM element for focus restoration
  guided: false,                    // Guided sequence mode
  navigationStack: [],              // History for back button
  panelType: null,                  // 'product' | 'collection' | 'search'
  panelContent: null,               // Cached panel HTML
};
```

### localStorage Keys

| Key | Value | Scope | Lifetime |
|---|---|---|---|
| `immersive_preferred_mode` | `'3d'` | Cross-session | Until cleared |
| `immersive_onboarding_seen` | `'true'` | Cross-session | Until cleared |
| `immersive_wishlist` | JSON array | Cross-session | Until cleared |
| `immersive_cookie_notice` | `'accepted'` | Cross-session | Until cleared |

### Section Rendering API Endpoints

| Endpoint | Section | Use Case |
|---|---|---|
| `/collections/{handle}?section_id=glass-panel` | `glass-panel` | Collection grid |
| `/products/{handle}?section_id=glass-product` | `glass-product` | Product detail |
| `/search?q={terms}&section_id=immersive-product-grid` | `immersive-product-grid` | Search results |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Bridge Button Conditional Rendering

*For any* collection/product/search context with a non-zero item count, the corresponding bridge button SHALL be rendered in the DOM.

**Validates: Requirements 1.1, 3.1, 7.1, 11.1, 13.1, 14.1, 14.2**

### Property 2: Bridge Button Not Rendered When Empty

*For any* collection/search/cart context with zero items, the corresponding bridge button SHALL NOT be rendered in the DOM.

**Validates: Requirements 1.3, 3.3, 7.3**

### Property 3: Bridge Button ARIA Labels Include Context

*For any* bridge button with a collection/product/search context, the `aria-label` attribute SHALL include the relevant title or search terms.

**Validates: Requirements 1.5, 3.5, 11.3**

### Property 4: URL Parameter Priority Rule

*For any* URL containing multiple deep-link parameters (`open_product`, `open_collection`, `open_search`), the URL_Param_Handler SHALL prioritize `open_product` over `open_collection` over `open_search`.

**Validates: Requirements 2.4, 12.4**

### Property 5: Empty URL Parameters Are Ignored

*For any* URL parameter with an empty or whitespace-only value, the URL_Param_Handler SHALL not trigger the corresponding panel opening.

**Validates: Requirements 2.2, 4.2, 12.2**

### Property 6: Search Parameter URL Decoding

*For any* search query containing URL-encoded special characters, the URL_Param_Handler SHALL correctly decode the parameter before constructing the Section Rendering API fetch URL.

**Validates: Requirements 4.3**

### Property 7: Preference Flag Persistence

*For any* successful immersive scene initialization, the Preference_Manager SHALL write `'3d'` to localStorage under the key `immersive_preferred_mode`.

**Validates: Requirements 5.1**

### Property 8: Preference Flag Error Handling

*For any* environment where localStorage is unavailable (private browsing), the Preference_Manager SHALL not throw an exception when attempting to write the preference flag.

**Validates: Requirements 5.2**

### Property 9: Preference Banner Rendering on 2D Pages

*For any* 2D page (excluding `page.immersive`, `index`, and `password` templates) where `immersive_preferred_mode = '3d'` is set in localStorage, the Preference_Banner SHALL be rendered in the DOM.

**Validates: Requirements 6.1**

### Property 10: Preference Banner Dismiss Removes from DOM

*For any* Preference_Banner that is dismissed, the banner element SHALL be completely removed from the DOM (not merely hidden) so it is no longer reachable by keyboard navigation.

**Validates: Requirements 6.4, 9.4**

### Property 11: Preference Banner Dismiss Restores Focus

*For any* Preference_Banner dismiss action, focus SHALL be restored to a logical next element in the DOM (typically the next sibling).

**Validates: Requirements 9.2**

### Property 12: Bridge Button Text Escaping

*For any* bridge button with user-provided text (collection title, product title, search terms), the rendered HTML SHALL escape all HTML special characters to prevent XSS injection.

**Validates: Requirements 15.4**

### Property 13: Bridge Button Modifier Classes Applied

*For any* bridge button with a `bridge_class` parameter, the rendered element SHALL include the corresponding BEM modifier class (e.g., `.immersive-bridge-btn--collection`).

**Validates: Requirements 15.13**

### Property 14: Slow Connection Detection

*For any* user with `navigator.connection.saveData = true` OR `navigator.connection.effectiveType` in `['slow-2g', '2g', '3g']`, the Bridge_Behavior script SHALL classify the connection as "slow".

**Validates: Requirements 16.1**

### Property 15: Slow Connection Warning Display

*For any* bridge link pointing to the 3D store on a slow connection, the Bridge_Behavior script SHALL modify the bridge heading text to display a localized warning message.

**Validates: Requirements 16.3**

### Property 16: Bridge Links Are Semantic

*For any* bridge button rendered by `immersive-bridge-btn.liquid`, the root element SHALL be a semantic `<a>` element with a valid `href` attribute.

**Validates: Requirements 10.3, 15.2, 17.1**

### Property 17: Bridge Links URL Encoding

*For any* bridge link containing query parameters with special characters, the URL SHALL be properly encoded so that the link is valid and discoverable by crawlers.

**Validates: Requirements 17.3**

### Property 18: Preference Manager Isolation

*For any* write operation by the Preference_Manager, other localStorage keys (`immersive_onboarding_seen`, `immersive_wishlist`, `immersive_cookie_notice`) SHALL remain unchanged.

**Validates: Requirements 10.4**

---

## Error Handling

### Bridge Button Rendering Errors

**Scenario:** A collection/product/search context is missing or malformed.

**Handling:**
- Bridge button snippet guards against nil/blank values with Liquid `if` checks
- Missing collection/product handles result in no bridge button rendered
- Graceful degradation: 2D page remains fully functional without bridge

### URL Parameter Handling Errors

**Scenario:** URL parameter contains invalid collection/product handle or malformed search query.

**Handling:**
- URL_Param_Handler validates parameter values before constructing Section Rendering API URLs
- Invalid handles result in 404 responses from Section Rendering API
- Error handler displays empty state message in glass panel
- User can dismiss panel and continue browsing

### localStorage Errors

**Scenario:** localStorage is unavailable (private browsing, quota exceeded, etc.).

**Handling:**
- All localStorage operations wrapped in `try/catch` blocks
- Preference_Manager silently fails without throwing exceptions
- Preference_Banner is not rendered if localStorage is unavailable
- 2D pages remain fully functional without preference banner

### Section Rendering API Errors

**Scenario:** Section Rendering API fetch fails (network error, 500 error, etc.).

**Handling:**
- Fetch wrapped in error handler with retry logic (optional)
- Error message displayed in glass panel with user-friendly text
- User can dismiss panel and continue browsing
- Fallback to empty state or cached content if available

---

## Testing Strategy

### Unit Tests (Example-Based)

**Bridge Button Rendering:**
- Test that bridge button renders when collection has products
- Test that bridge button does not render when collection is empty
- Test that bridge button includes correct aria-label with collection title
- Test that bridge button renders as semantic `<a>` element

**Preference Banner:**
- Test that preference banner renders when `immersive_preferred_mode = '3d'`
- Test that preference banner does not render on `page.immersive` template
- Test that dismiss button removes banner from DOM
- Test that dismiss button restores focus to next sibling

**URL Parameter Handler:**
- Test that `open_product` parameter triggers product panel opening
- Test that `open_collection` parameter triggers collection panel opening
- Test that `open_search` parameter triggers search panel opening
- Test that empty parameters are ignored
- Test that `open_product` takes priority over `open_collection`

**Preference Manager:**
- Test that `writeImmersivePreference()` writes `'3d'` to localStorage
- Test that `readImmersivePreference()` returns true when flag is set
- Test that localStorage errors are caught and handled gracefully

**Bridge Behavior:**
- Test that slow connections are detected via `navigator.connection`
- Test that motion sensitivity is detected via `prefers-reduced-motion`
- Test that warning message is displayed for slow connections
- Test that feature detection guards prevent errors in unsupported browsers

### Property-Based Tests (100+ iterations)

**Bridge Button Rendering Property:**
- Generate random collections with varying product counts (0-1000)
- Verify bridge button renders if and only if product count > 0
- Verify aria-label includes collection title for all generated collections

**URL Parameter Handling Property:**
- Generate random collection/product handles and search queries
- Set URL parameters with various combinations
- Verify correct panel opens based on priority rule
- Verify empty parameters are ignored

**Preference Manager Property:**
- Generate random scene initialization scenarios
- Verify `immersive_preferred_mode` is written to localStorage
- Verify other localStorage keys are not affected

**Bridge Behavior Property:**
- Generate random connection types and motion preferences
- Verify slow connections are correctly classified
- Verify warning messages are displayed appropriately

### Integration Tests

**End-to-End Bridge Flow:**
- Navigate to collection page, click bridge button, verify collection panel opens in 3D store
- Navigate to product page, click bridge button, verify product panel opens in 3D store
- Perform search, click bridge button, verify search results panel opens in 3D store
- Add items to cart, click bridge button, verify 3D store loads

**Preference System Flow:**
- Enter 3D store, verify `immersive_preferred_mode` is written to localStorage
- Navigate to 2D page, verify preference banner appears
- Dismiss preference banner, verify banner is removed from DOM
- Refresh page, verify preference banner reappears (preference persists)

**Device/Connection-Aware Flow:**
- Mock slow connection, verify bridge heading displays warning message
- Mock motion sensitivity, verify animations are disabled
- Verify bridge links remain functional on slow connections

### Accessibility Tests

**Keyboard Navigation:**
- Tab through all bridge buttons, verify focus indicator is visible
- Tab through preference banner, verify dismiss button is reachable
- Verify focus is restored after preference banner dismiss

**Screen Reader Testing:**
- Verify bridge button aria-label is announced correctly
- Verify preference banner role="region" and aria-label are announced
- Verify dismiss button aria-label is announced

**Reduced Motion:**
- Enable `prefers-reduced-motion`, verify animations are disabled
- Verify bridge button pulsing animation is removed
- Verify hover transitions are removed

### Performance Tests

**Bridge Button Rendering:**
- Verify bridge button snippet renders in < 50ms
- Verify no layout shifts when bridge button is rendered

**URL Parameter Handling:**
- Verify URL parameters are parsed and handled within 400ms
- Verify Section Rendering API calls are cached and reused

**Preference Manager:**
- Verify localStorage writes complete in < 10ms
- Verify localStorage reads complete in < 5ms

---

## Mobile & Accessibility Considerations

### Responsive Design

**Bridge Button:**
- Desktop (≥1024px): Full-width card with image and text
- Tablet (768px-1023px): Reduced padding, smaller font sizes
- Mobile (<768px): Stacked layout, full-width, touch-friendly tap targets (≥44px)

**Preference Banner:**
- Desktop: Sticky footer or floating banner
- Tablet: Reduced padding, smaller font sizes
- Mobile: Full-width banner, stacked actions

### Touch Interactions

**Bridge Button:**
- Tap target ≥44px × 44px for mobile
- No hover states on touch devices (use `:active` instead)
- Smooth scroll to bridge button when rendered

**Preference Banner:**
- Dismiss button ≥44px × 44px
- Sufficient spacing between CTA and dismiss button
- No accidental dismissal on scroll

### Accessibility Patterns

**Focus Management:**
- Bridge buttons: visible `:focus-visible` outline (2px solid #d4af37)
- Preference banner dismiss: focus restoration to next sibling
- All interactive elements keyboard-accessible

**ARIA Attributes:**
- Bridge buttons: `aria-label` with context (collection/product/search)
- Preference banner: `role="region"` with `aria-label`
- Dismiss button: `aria-label="Dismiss"`

**Reduced Motion:**
- All animations disabled when `prefers-reduced-motion: reduce`
- Bridge button pulsing animation removed
- Hover transitions removed
- Fade transitions replaced with instant visibility changes

### Color Contrast

**Bridge Button:**
- Text: #0F172A (slate-900) on #FFFFFF (white) — 16.5:1 contrast
- Border: #d4af37 (gold) on #FFFFFF (white) — 4.8:1 contrast
- Hover border: #d4af37 (gold) on #FFFFFF (white) — 4.8:1 contrast

**Preference Banner:**
- Text: #0F172A (slate-900) on #FFFFFF (white) — 16.5:1 contrast
- CTA: #FFFFFF (white) on #d4af37 (gold) — 4.8:1 contrast
- Dismiss: #0F172A (slate-900) on #FFFFFF (white) — 16.5:1 contrast

---

## Performance Optimizations

### Bridge Button Rendering

**Optimization:** Lazy-load bridge button images using native `loading="lazy"` attribute.

**Implementation:**
```liquid
{% if bridge_image %}
  <img
    src="{{ bridge_image | image_url: width: 240 }}"
    srcset="{{ bridge_image | image_url: width: 160 }} 160w, {{ bridge_image | image_url: width: 240 }} 240w, {{ bridge_image | image_url: width: 320 }} 320w"
    sizes="(max-width: 768px) 100vw, 50vw"
    loading="lazy"
    alt=""
  >
{% endif %}
```

### URL Parameter Handling

**Optimization:** Cache Section Rendering API responses by URL to avoid redundant fetches.

**Implementation:**
```javascript
var sectionRenderingCache = {};

function fetchWithCache(url) {
  if (sectionRenderingCache[url]) {
    return Promise.resolve(sectionRenderingCache[url]);
  }
  return fetch(url)
    .then(function(response) { return response.text(); })
    .then(function(html) {
      sectionRenderingCache[url] = html;
      return html;
    });
}
```

### Preference Manager

**Optimization:** Defer localStorage reads until needed (lazy evaluation).

**Implementation:**
```javascript
var preferenceCache = null;

function readImmersivePreference() {
  if (preferenceCache !== null) return preferenceCache;
  try {
    preferenceCache = localStorage.getItem(PREFERRED_MODE_KEY) === '3d';
    return preferenceCache;
  } catch (e) {
    return false;
  }
}
```

### Bridge Behavior

**Optimization:** Debounce connection/motion detection to avoid repeated checks.

**Implementation:**
```javascript
var connectionCheckDone = false;

function initBridgeBehavior() {
  if (connectionCheckDone) return;
  connectionCheckDone = true;
  // ... detection logic
}
```

---

## Configuration Schema

### Bridge Button Snippet Parameters

```json
{
  "bridge_url": {
    "type": "string",
    "description": "Destination URL (e.g., /?open_collection=suffuse)"
  },
  "bridge_label": {
    "type": "string",
    "description": "Already-translated CTA label text"
  },
  "bridge_aria": {
    "type": "string",
    "description": "Already-translated aria-label text"
  },
  "bridge_class": {
    "type": "string",
    "description": "Optional CSS modifier class (e.g., collection, product, search)"
  },
  "bridge_heading": {
    "type": "string",
    "description": "Optional override heading (defaults to shop.name)"
  },
  "bridge_subtext": {
    "type": "string",
    "description": "Optional override subtext line"
  },
  "bridge_image": {
    "type": "object",
    "description": "Optional Shopify image object for preview thumbnail"
  }
}
```

### Preference Banner Configuration

```json
{
  "preference_banner_enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable/disable preference banner on 2D pages"
  },
  "preference_banner_position": {
    "type": "string",
    "enum": ["sticky-footer", "floating", "inline"],
    "default": "sticky-footer",
    "description": "Banner positioning strategy"
  },
  "preference_banner_dismiss_timeout": {
    "type": "number",
    "default": 0,
    "description": "Auto-dismiss banner after N seconds (0 = no auto-dismiss)"
  }
}
```

---

## Localization Keys

All user-facing strings are defined in `locales/en.default.json` under the `sections.immersive_journey_bridges` namespace:

```json
{
  "sections": {
    "immersive_journey_bridges": {
      "bridge_eyebrow": "Immersive 3D Experience",
      "collection_cta": "Explore in 3D",
      "collection_cta_aria": "Explore {{ collection_title }} collection in 3D showroom",
      "search_cta": "View in 3D",
      "search_cta_aria": "View search results for '{{ search_terms }}' in 3D showroom",
      "product_cta": "View in 3D",
      "product_cta_aria": "View {{ product_title }} in 3D showroom",
      "cart_cta": "Return to 3D Browsing",
      "cart_cta_aria": "Return to 3D showroom",
      "collections_list_cta": "Explore All Collections in 3D",
      "collections_list_cta_aria": "Explore all collections in 3D showroom",
      "content_cta": "Explore in 3D",
      "content_cta_aria": "Explore Shahana Collection in 3D showroom",
      "preference_banner_text": "You previously used our 3D showroom. Return to the immersive experience?",
      "preference_banner_cta": "Return to 3D Store",
      "preference_banner_dismiss": "Dismiss",
      "preference_banner_dismiss_aria": "Dismiss preference banner",
      "preference_banner_aria": "Return to 3D store",
      "slow_connection_warning": "3D store is heavier on slower connections"
    }
  }
}
```

---

## Summary

The Immersive Shopping Journey feature establishes a complete bidirectional bridge system between the 2D storefront and the 3D immersive experience. By implementing six bridge entry points, a persistent preference system, and device/connection-aware messaging, the feature enables seamless context-preserving navigation while maintaining accessibility, performance, and SEO integrity. The design prioritizes progressive enhancement, ensuring all bridges function as standard navigation links without JavaScript, with device-aware messaging as a non-blocking enhancement layer.

