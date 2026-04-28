# Developer Guide: Immersive Bridge System

This guide provides technical documentation for developers extending or maintaining the immersive bridge system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component API Reference](#component-api-reference)
3. [Extending the Bridge System](#extending-the-bridge-system)
4. [Testing Guide](#testing-guide)
5. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### System Design

The bridge system consists of three layers:

```
┌─────────────────────────────────────────────────────────┐
│ 2D Storefront (Liquid/DOM)                              │
│ - Bridge buttons on collection, product, search pages   │
│ - Preference banner on 2D pages                         │
│ - Device/connection-aware messaging                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Bridge Layer (JavaScript)                               │
│ - URL parameter parsing                                 │
│ - Preference persistence (localStorage)                 │
│ - Device/connection detection                           │
│ - Analytics tracking                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3D Immersive Store (Three.js)                           │
│ - WebGL canvas rendering                                │
│ - Room navigation                                       │
│ - Product panels (Section Rendering API)                │
│ - Editorial overlays                                    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User clicks bridge button** → URL parameter added (`?open_product=handle`)
2. **3D store loads** → JavaScript parses URL parameters
3. **Scene initializes** → Preference flag written to localStorage
4. **User navigates to 2D page** → Preference banner appears (if flag is set)
5. **User clicks preference banner** → Returns to 3D store with preference maintained

### Key Files

| File | Purpose |
|------|---------|
| `snippets/immersive-bridge-btn.liquid` | Bridge button component |
| `assets/bridge-behavior.js` | Device/connection-aware behavior |
| `assets/immersive-store.js` | 3D engine and URL parameter handler |
| `assets/immersive/core/state-manager.js` | Preference persistence |
| `layout/theme.liquid` | Preference banner rendering |

---

## Component API Reference

### Bridge Button Snippet

**File:** `snippets/immersive-bridge-btn.liquid`

**Parameters:**

```liquid
{% render 'immersive-bridge-btn',
  bridge_url: '/pages/immersive?open_collection=suffuse',
  bridge_label: 'Explore in 3D Store',
  bridge_aria: 'Explore Suffuse collection in the 3D Store',
  bridge_class: 'collection',
  bridge_heading: 'Explore in 3D',
  bridge_subtext: 'See how these pieces look in our immersive showroom',
  bridge_image: collection.featured_image
%}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bridge_url` | string | Yes | Destination URL (e.g., `/pages/immersive?open_collection=handle`) |
| `bridge_label` | string | Yes | Button text (already translated) |
| `bridge_aria` | string | Yes | aria-label for accessibility |
| `bridge_class` | string | No | BEM modifier suffix (e.g., `collection`, `product`) |
| `bridge_heading` | string | No | Optional heading above button |
| `bridge_subtext` | string | No | Optional subtext below button |
| `bridge_image` | image | No | Optional preview image |

**Output:**

```html
<a href="/pages/immersive?open_collection=suffuse" 
   class="immersive-bridge-btn immersive-bridge-btn--collection"
   aria-label="Explore Suffuse collection in the 3D Store">
  <span class="immersive-bridge-btn__label">Explore in 3D Store</span>
</a>
```

### Preference Manager API

**File:** `assets/immersive/core/state-manager.js`

**Public API:**

```javascript
// Write preference flag to localStorage
window.ImmersiveStateManager.writeImmersivePreference();

// Read preference flag from localStorage
var prefers3d = window.ImmersiveStateManager.readImmersivePreference();

// Clear preference flag
window.ImmersiveStateManager.clearImmersivePreference();

// Save session state
window.ImmersiveStateManager.saveState({ currentRoom: 'lounge' });

// Load session state
var state = window.ImmersiveStateManager.loadState();

// Clear session state
window.ImmersiveStateManager.clearState();
```

**Storage Keys:**

| Key | Storage | Purpose |
|-----|---------|---------|
| `immersive_preferred_mode` | localStorage | User preference for 3D mode |
| `immersive_state` | sessionStorage | Current room, mode, navigation stack |
| `immersive_onboarding_seen` | localStorage | Onboarding overlay shown flag |
| `immersive_wishlist` | localStorage | Saved products |

### URL Parameter Handler

**File:** `assets/immersive-store.js`

**Parameters:**

| Parameter | Type | Example | Priority |
|-----------|------|---------|----------|
| `open_product` | string | `?open_product=silk-saree` | 1 (highest) |
| `open_collection` | string | `?open_collection=suffuse` | 2 |
| `open_search` | string | `?open_search=bridal` | 3 (lowest) |

**Priority Rule:**

```javascript
if (openProduct) {
  openProductPanel(openProduct);
} else if (openCollection) {
  openCollectionPanel(openCollection);
} else if (openSearch) {
  openSearchPanel(openSearch);
}
```

**Implementation:**

```javascript
var params = new URLSearchParams(window.location.search);
var openProduct = params.get('open_product');
var openCollection = params.get('open_collection');
var openSearch = params.get('open_search');

// Parameters are decoded and validated before use
if (openProduct && openProduct.trim()) {
  setTimeout(function() {
    openProductPanel(openProduct);
  }, 400); // Wait for scene to be ready
}
```

### Bridge Behavior API

**File:** `assets/bridge-behavior.js`

**Functions:**

```javascript
// Detect slow connection
var isSlowConnection = navigator.connection && 
  ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);

// Detect data saver preference
var saveDataEnabled = navigator.connection && navigator.connection.saveData;

// Detect reduced motion preference
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Update bridge heading for slow connections
if (isSlowConnection) {
  bridgeHeading.textContent = 'Explore in 3D (optimized for faster connections)';
}
```

---

## Extending the Bridge System

### Adding a New Bridge Entry Point

To add a bridge button to a new page type:

1. **Create the bridge button in your section/snippet:**

```liquid
{% render 'immersive-bridge-btn',
  bridge_url: '/pages/immersive?open_collection=new-collection',
  bridge_label: 'Explore in 3D Store',
  bridge_aria: 'Explore in the 3D Store',
  bridge_class: 'custom-page'
%}
```

2. **Add localization keys** to `locales/en.default.json`:

```json
{
  "sections": {
    "immersive_journey_bridges": {
      "custom_page_cta": "Explore in 3D Store",
      "custom_page_cta_aria": "Explore in the 3D Store"
    }
  }
}
```

3. **Test the bridge button:**
   - Verify it renders on your page
   - Click it and verify the 3D store opens
   - Verify the correct panel opens (product/collection/search)

### Customizing Bridge Button Styling

Bridge buttons use BEM CSS naming. To customize:

1. **Override CSS in your section:**

```css
.immersive-bridge-btn {
  background-color: var(--color-accent);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
}

.immersive-bridge-btn:hover {
  opacity: 0.9;
}

@media (prefers-reduced-motion: reduce) {
  .immersive-bridge-btn {
    transition: none;
  }
}
```

2. **Use CSS custom properties:**

```css
.immersive-bridge-btn {
  --bridge-bg: var(--color-accent);
  --bridge-text: var(--color-text);
  --bridge-padding: 1rem 2rem;
}
```

### Adding Custom Warning Messages

To add custom warning messages for slow connections:

1. **Add data attributes to bridge button:**

```liquid
{% render 'immersive-bridge-btn',
  bridge_url: '/pages/immersive?open_collection=suffuse',
  bridge_label: 'Explore in 3D Store',
  bridge_aria: 'Explore in the 3D Store',
  bridge_warning: 'This experience works best on faster connections'
%}
```

2. **Update bridge-behavior.js to read custom messages:**

```javascript
var bridgeBtn = document.querySelector('[data-bridge-warning]');
if (bridgeBtn && isSlowConnection) {
  var customWarning = bridgeBtn.getAttribute('data-bridge-warning');
  bridgeHeading.textContent = customWarning;
}
```

### Extending Preference System

To add custom preference flags:

1. **Add new storage key:**

```javascript
var CUSTOM_PREFERENCE_KEY = 'immersive_custom_preference';

function writeCustomPreference(value) {
  try {
    localStorage.setItem(CUSTOM_PREFERENCE_KEY, value);
  } catch (e) {
    // Handle private browsing
  }
}

function readCustomPreference() {
  try {
    return localStorage.getItem(CUSTOM_PREFERENCE_KEY);
  } catch (e) {
    return null;
  }
}
```

2. **Export to window API:**

```javascript
window.ImmersiveStateManager.writeCustomPreference = writeCustomPreference;
window.ImmersiveStateManager.readCustomPreference = readCustomPreference;
```

---

## Testing Guide

### Unit Tests

Run unit tests for bridge button rendering:

```bash
npm test -- tests/bridge-button.unit.test.js
```

**Test cases:**

- Bridge button renders when collection has products
- Bridge button does not render when collection is empty
- Bridge button includes correct aria-label
- Bridge button escapes HTML special characters
- Bridge button applies BEM modifier classes

### Integration Tests

Run integration tests for end-to-end flows:

```bash
npm test -- tests/bridge-integration.test.js
```

**Test cases:**

- Navigate to collection page → click bridge → verify 3D store opens
- Navigate to product page → click bridge → verify product panel opens
- Enter 3D store → navigate to 2D page → verify preference banner appears
- Click preference banner → verify 3D store opens with preference maintained

### Property-Based Tests

Run property-based tests for correctness properties:

```bash
npm test -- tests/bridge-properties.test.js
```

**Properties tested:**

- Bridge button renders if and only if content exists
- URL parameter priority rule is enforced
- Empty URL parameters are ignored
- Preference flag persists across sessions
- Preference flag is isolated from other localStorage keys

### Manual Testing

1. **Test on different devices:**
   - Desktop (1440px)
   - Tablet (768px)
   - Mobile (375px)

2. **Test on different browsers:**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+

3. **Test accessibility:**
   - Tab through bridge buttons
   - Verify focus indicator is visible
   - Test with screen reader (NVDA, JAWS, VoiceOver)
   - Enable "Reduce motion" and verify animations are disabled

4. **Test on slow connections:**
   - Use Chrome DevTools to throttle connection
   - Verify warning message appears
   - Verify bridge button still works

---

## Performance Considerations

### Script Loading

- `bridge-behavior.js` loads on all pages (lightweight, ~2KB)
- `immersive-store.js` loads only on `/pages/immersive` (heavy, ~50KB)
- Preference banner JS loads only on 2D pages (lightweight, ~1KB)

### Storage Operations

- localStorage reads: <5ms
- localStorage writes: <10ms
- sessionStorage reads: <2ms
- sessionStorage writes: <5ms

### Rendering Performance

- Bridge button snippet renders in <50ms
- Preference banner renders in <20ms
- No layout shifts when bridge button is rendered

### Optimization Tips

1. **Lazy load bridge button images:**
   - Use `loading="lazy"` attribute
   - Images load only when entering viewport

2. **Cache Section Rendering API responses:**
   - Use `fetchWithCache()` helper
   - Avoid redundant API calls

3. **Debounce device flag evaluation:**
   - Evaluate device flags on resize (not on every mousemove)
   - Cache results to avoid repeated calculations

4. **Minimize localStorage access:**
   - Read preference flag once on page load
   - Cache result in memory
   - Write only when preference changes

---

## Debugging

### Enable Debug Mode

```javascript
window.__IMMERSIVE_DEV__ = true;
```

This enables console logging for:
- URL parameter parsing
- Preference flag reads/writes
- Device flag evaluation
- Connection quality detection

### Common Issues

**Bridge button not rendering:**
- Check browser console for errors
- Verify section is enabled
- Verify content exists (products, search results, etc.)

**Preference banner not appearing:**
- Check localStorage for `immersive_preferred_mode` key
- Verify you're on a 2D page (not `/pages/immersive`)
- Check browser console for errors

**3D store not loading:**
- Verify `/pages/immersive` page exists
- Check browser console for WebGL errors
- Verify browser supports WebGL (Chrome 90+, Firefox 88+, Safari 14+)

---

## Support

For additional help:

1. Check the [Merchant Guide](./MERCHANT_GUIDE_BRIDGE_SYSTEM.md)
2. Review the [Troubleshooting Guide](./TROUBLESHOOTING_BRIDGE_SYSTEM.md)
3. Check the [Known Issues](../.kiro/steering/immersive-known-gaps.md)

---

**Last Updated:** April 28, 2026
**Version:** 1.0.0
