# Troubleshooting Guide — Immersive Journey Bridges

Quick reference for the most likely issues and how to fix them.

---

## Issue 1: Bridge Banner Not Rendering

### Symptom
Bridge banner doesn't appear on collection/search/product/cart/collections list/content pages.

### Diagnosis
1. Open DevTools → Elements tab
2. Search for `immersive-bridge-banner` class
3. If not found → snippet not included or conditional logic is wrong

### Root Causes & Fixes

#### Cause A: Snippet not included in section
**Check:** Is `{% render 'immersive-bridge-btn' with ... %}` present in the section?

**Fix:**
- Collection: `sections/main-collection-product-grid.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Search: `sections/main-search.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Product: `sections/main-product.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Cart: `sections/main-cart-items.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Collections List: `sections/main-list-collections.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Blog: `sections/main-blog.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`
- Article: `sections/main-article.liquid` — should have `{% render 'immersive-bridge-btn' with bridge_url: ... %}`

#### Cause B: Conditional logic is wrong
**Check:** Is the bridge wrapped in a conditional that's evaluating to false?

**Examples:**
- Collection bridge should only render when `collection.products_count > 0`
- Search bridge should only render when `search.performed and search.results_count > 0`
- Cart bridge should only render when `cart.item_count > 0`

**Fix:** Verify the conditional logic matches the requirements.

#### Cause C: Parameters not passed correctly
**Check:** Are all required parameters passed to the snippet?

**Required parameters:**
- `bridge_url` — the href value (e.g., `/?open_collection=suffuse`)
- `bridge_label` — the CTA text (already translated)
- `bridge_aria` — the aria-label (already translated)

**Optional parameters:**
- `bridge_heading` — override heading (defaults to shop name)
- `bridge_image` — Shopify image object
- `bridge_subtext` — optional subtext
- `bridge_slow_connection_warning` — warning message for device-aware behavior
- `bridge_class` — CSS modifier class (e.g., `--collection`)

**Fix:** Check that all parameters are passed with correct values.

---

## Issue 2: Bridge URL Parameter Not Working

### Symptom
Clicking bridge navigates to `/pages/immersive-store` but panel doesn't open (or opens wrong panel).

### Diagnosis
1. Open DevTools → Console tab
2. Click bridge → check for any errors
3. Check URL in address bar → should have `?open_collection=...` or `?open_product=...` or `?search=...`
4. If URL is correct but panel doesn't open → URL handler not working

### Root Causes & Fixes

#### Cause A: URL parameter not in query string
**Check:** Is the URL parameter actually in the query string?

**Fix:** Verify the bridge `href` is constructed correctly:
- Collection: `href="/?open_collection={{ collection.handle | url_encode }}"`
- Search: `href="/?open_search={{ search.terms | url_encode }}"`
- Product: `href="/?open_product={{ product.handle | url_encode }}"`

#### Cause B: URL parameter handler not parsing correctly
**Check:** Is `immersive-store.js` parsing the URL parameter?

**Fix:** In `assets/immersive-store.js`, inside `safeBindImmersiveInit()`, verify:
```javascript
var openProduct = params.get('open_product');
var openCollection = params.get('open_collection');
var openSearch = params.get('open_search');
```

#### Cause C: Panel function not called
**Check:** Is the panel function being called after parsing?

**Fix:** In `assets/immersive-store.js`, verify the priority logic:
```javascript
if (openProduct) {
  setTimeout(() => openProductPanel(openProduct), 400);
} else if (openCollection) {
  setTimeout(() => openCollectionPanel(openCollection), 400);
} else if (openSearch) {
  setTimeout(() => openSearchPanel(openSearch), 400);
}
```

#### Cause D: Panel element not found
**Check:** Does the glass panel element exist in the DOM?

**Fix:** Verify `sections/glass-panel.liquid` is included in `templates/page.immersive.json`.

#### Cause E: Scene not initialized yet
**Check:** Is the 3D scene initialized before the panel function is called?

**Fix:** The 400ms `setTimeout` should give the scene time to initialize. If it's still not working, increase to 600ms or 800ms.

---

## Issue 3: Preference Banner Not Appearing

### Symptom
After visiting 3D store, preference banner doesn't appear on 2D pages.

### Diagnosis
1. Navigate to `/pages/immersive-store` and wait for scene to load
2. Open DevTools → Application → Local Storage
3. Check if `immersive_preferred_mode` key exists with value `'3d'`
4. If key doesn't exist → `writeImmersivePreference()` not called
5. If key exists but banner doesn't appear → banner HTML not rendered or JS not running

### Root Causes & Fixes

#### Cause A: `writeImmersivePreference()` not called
**Check:** Is `writeImmersivePreference()` called in `initImmersiveScene()`?

**Fix:** In `assets/immersive-store.js`, inside `initImmersiveScene()`, after `hideLoader()`, add:
```javascript
writeImmersivePreference();
```

#### Cause B: Preference banner HTML not rendered
**Check:** Is the banner HTML present in `layout/theme.liquid`?

**Fix:** In `layout/theme.liquid`, verify the banner HTML is present:
```liquid
{%- unless template == 'page.immersive' or template == 'index' or template == 'password' -%}
  <div id="immersive-preference-banner" hidden role="region" aria-label="{{ 'sections.immersive_journey_bridges.preference_banner_aria' | t }}">
    <!-- banner content -->
  </div>
  <script>
    // banner script
  </script>
{%- endunless -%}
```

#### Cause C: Preference banner script not running
**Check:** Is the inline script in `layout/theme.liquid` executing?

**Fix:** Verify the script is present and runs immediately after the banner HTML:
```javascript
(function() {
  var banner = document.getElementById('immersive-preference-banner');
  if (!banner) return;
  try {
    var pref = localStorage.getItem('immersive_preferred_mode');
    if (pref === '3d') {
      banner.removeAttribute('hidden');
    }
  } catch (e) {}
})();
```

#### Cause D: localStorage not working (private browsing)
**Check:** Is localStorage available?

**Fix:** The script should be wrapped in `try/catch` to handle private browsing. If localStorage is not available, the banner will stay hidden (which is acceptable).

#### Cause E: Template guard is hiding banner
**Check:** Is the banner wrapped in a template guard that's excluding the current page?

**Fix:** Verify the template guard is correct:
```liquid
{%- unless template == 'page.immersive' or template == 'index' or template == 'password' -%}
```

This should show the banner on all 2D pages (collection, search, product, cart, etc.) but NOT on immersive, index, or password pages.

---

## Issue 4: Device-Aware Behavior Not Working

### Symptom
Slow connection warning doesn't appear, or reduced motion animations still play.

### Diagnosis
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to a collection page
4. Check if bridge banner has `.immersive-bridge-banner--slow-connection` class
5. If not → `bridge-behavior.js` not loaded or `initBridgeBehavior()` not called

### Root Causes & Fixes

#### Cause A: `bridge-behavior.js` not loaded
**Check:** Is `bridge-behavior.js` loaded in `layout/theme.liquid`?

**Fix:** In `layout/theme.liquid`, verify:
```liquid
<script src="{{ 'bridge-behavior.js' | asset_url }}" defer></script>
```

#### Cause B: `initBridgeBehavior()` not called
**Check:** Is `initBridgeBehavior()` called on DOMContentLoaded?

**Fix:** In `assets/bridge-behavior.js`, verify:
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBridgeBehavior);
} else {
  initBridgeBehavior();
}
```

#### Cause C: Bridge elements not found
**Check:** Are bridge elements present in the DOM?

**Fix:** Verify bridges are rendered (see Issue 1).

#### Cause D: CSS classes not applied
**Check:** Are the CSS modifier classes being added to the bridge element?

**Fix:** In `assets/bridge-behavior.js`, verify `applyConstraintWarning()` is adding classes:
```javascript
if (isSlowConnection) {
  bridge.classList.add('immersive-bridge-banner--slow-connection');
}
if (hasReducedMotion) {
  bridge.classList.add('immersive-bridge-banner--reduced-motion');
}
```

#### Cause E: CSS not styling the modifier classes
**Check:** Are the CSS rules for `.immersive-bridge-banner--slow-connection` and `.immersive-bridge-banner--reduced-motion` present?

**Fix:** In `snippets/immersive-bridge-btn.liquid`, inside the `{% stylesheet %}` block, verify:
```css
.immersive-bridge-banner--slow-connection {
  opacity: 0.85;
}

.immersive-bridge-banner--reduced-motion {
  animation: none !important;
  transition: none !important;
}
```

---

## Issue 5: Console Errors

### Symptom
JavaScript errors in DevTools console.

### Diagnosis
1. Open DevTools → Console tab
2. Look for red error messages
3. Click error to see stack trace
4. Identify which file/function is throwing the error

### Common Errors & Fixes

#### Error: "Cannot read property 'get' of undefined"
**Cause:** `URLSearchParams` not supported or `params` is undefined

**Fix:** In `assets/immersive-store.js`, verify:
```javascript
var params = new URLSearchParams(window.location.search);
if (!params) return; // guard
```

#### Error: "Cannot read property 'removeAttribute' of null"
**Cause:** Element not found in DOM

**Fix:** Add null check before calling methods:
```javascript
var banner = document.getElementById('immersive-preference-banner');
if (!banner) return;
banner.removeAttribute('hidden');
```

#### Error: "localStorage is not defined"
**Cause:** Running in a context where localStorage is not available (e.g., private browsing)

**Fix:** Wrap all localStorage calls in `try/catch`:
```javascript
try {
  localStorage.setItem('key', 'value');
} catch (e) {
  // localStorage not available
}
```

#### Error: "Uncaught SyntaxError: Unexpected token"
**Cause:** Liquid syntax error or malformed JSON

**Fix:** Check the Liquid template for syntax errors (missing `%}`, `}}`, etc.)

#### Error: "404 Not Found: bridge-behavior.js"
**Cause:** Asset file not found

**Fix:** Verify `assets/bridge-behavior.js` exists and is uploaded to Shopify.

---

## Issue 6: Preference Banner Dismiss Not Working

### Symptom
Clicking "Dismiss" button doesn't remove the banner.

### Diagnosis
1. Open DevTools → Elements tab
2. Find the dismiss button: `<button data-preference-banner-dismiss>`
3. Click it in the page
4. Check if banner is removed from DOM

### Root Causes & Fixes

#### Cause A: Dismiss button not found
**Check:** Is the dismiss button present in the banner HTML?

**Fix:** In `layout/theme.liquid`, verify the button is present:
```liquid
<button type="button" data-preference-banner-dismiss>
  {{ 'sections.immersive_journey_bridges.preference_banner_dismiss' | t }}
</button>
```

#### Cause B: Dismiss script not running
**Check:** Is the dismiss event listener attached?

**Fix:** In `layout/theme.liquid`, verify the script is present:
```javascript
var dismissBtn = banner.querySelector('[data-preference-banner-dismiss]');
if (dismissBtn) {
  dismissBtn.addEventListener('click', function() {
    banner.remove();
    // move focus
  });
}
```

#### Cause C: Event listener not attached
**Check:** Is the event listener being attached to the button?

**Fix:** Verify the script runs after the button is rendered.

---

## Issue 7: Bridge Not Clickable

### Symptom
Bridge banner appears but clicking it doesn't navigate.

### Diagnosis
1. Open DevTools → Elements tab
2. Find the bridge element: `<a data-immersive-bridge>`
3. Check the `href` attribute
4. Try clicking it manually

### Root Causes & Fixes

#### Cause A: `href` is empty or malformed
**Check:** Is the `href` attribute present and correct?

**Fix:** Verify the bridge URL is constructed correctly in the section:
```liquid
{% render 'immersive-bridge-btn' with bridge_url: '/?open_collection=' | append: collection.handle %}
```

#### Cause B: JavaScript preventing default
**Check:** Is any JavaScript preventing the default link behavior?

**Fix:** Verify no `preventDefault()` is called on the bridge link click.

#### Cause C: CSS `pointer-events: none`
**Check:** Is the bridge element hidden behind another element?

**Fix:** Verify the bridge has `cursor: pointer` and no `pointer-events: none`.

---

## Issue 8: Localization Keys Missing

### Symptom
Bridge text shows as `[missing translation]` or key name instead of translated text.

### Diagnosis
1. Open `locales/en.default.json`
2. Search for `sections.immersive_journey_bridges`
3. Verify all 28 keys are present

### Root Causes & Fixes

#### Cause A: Localization keys not added
**Check:** Are all 28 keys present in `locales/en.default.json`?

**Fix:** Add all missing keys under `sections.immersive_journey_bridges`:
```json
"sections": {
  "immersive_journey_bridges": {
    "bridge_eyebrow": "Explore in 3D",
    "collection_cta": "Explore in 3D Store",
    "collection_cta_aria": "Explore {{ title }} in the 3D Store",
    "search_cta": "View results in 3D Store",
    "search_cta_aria": "View results for {{ terms }} in the 3D Store",
    "search_heading": "Search: {{ terms }}",
    "product_cta": "Experience in 3D Store",
    "product_cta_aria": "Experience {{ title }} in the 3D Store",
    "cart_cta": "Return to 3D Browsing",
    "cart_cta_aria": "Return to 3D Browsing in the immersive store",
    "cart_heading": "Continue Shopping in 3D",
    "collections_list_cta": "Explore in 3D Store",
    "collections_list_cta_aria": "Explore all collections in the 3D Store",
    "collections_heading": "Explore Collections in 3D",
    "content_cta": "Explore the 3D Store",
    "content_cta_aria": "Explore the Shahana Collection 3D Store",
    "content_heading": "Discover in 3D",
    "slow_connection_warning": "3D store is optimized for faster connections",
    "preference_banner_text": "Welcome back — your 3D store is ready.",
    "preference_banner_cta": "Return to 3D Store",
    "preference_banner_dismiss": "Dismiss",
    "preference_banner_dismiss_aria": "Dismiss the 3D store prompt",
    "preference_banner_aria": "3D store preference prompt",
    "switch_to_2d": "Switch to 2D",
    "switch_to_2d_aria": "Switch to the standard 2D store",
    "switch_to_3d": "Switch to 3D",
    "switch_to_3d_aria": "Switch to the immersive 3D store"
  }
}
```

#### Cause B: Key name mismatch
**Check:** Is the key name in the Liquid template exactly matching the key in the JSON?

**Fix:** Verify the key name is spelled correctly and uses the correct namespace.

---

## Quick Debugging Checklist

If something is broken, go through this checklist:

- [ ] Is the element present in the DOM? (DevTools → Elements)
- [ ] Are there any console errors? (DevTools → Console)
- [ ] Is the asset file loaded? (DevTools → Network)
- [ ] Is the Liquid syntax correct? (no missing `%}`, `}}`, etc.)
- [ ] Are all parameters passed to the snippet? (check section file)
- [ ] Is the localization key present? (check `locales/en.default.json`)
- [ ] Is the CSS class applied? (DevTools → Elements → Styles)
- [ ] Is the JavaScript function called? (add `console.log()` to verify)
- [ ] Is localStorage available? (DevTools → Application → Local Storage)
- [ ] Is the event listener attached? (DevTools → Elements → Event Listeners)

---

## Still Stuck?

If you can't find the issue:

1. **Check the IMPLEMENTATION-REVIEW.md** — Review the expected behavior for each component
2. **Check the DEPLOYMENT-CHECKLIST.md** — Follow the smoke test steps to isolate the issue
3. **Check the spec files** — Review requirements and design to understand the expected behavior
4. **Add console.log() statements** — Debug by logging values at key points
5. **Use DevTools** — Use Elements, Console, Network, and Application tabs to inspect state

---

**Good luck! You've got this.** 🚀
