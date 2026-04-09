# 48-Hour Deployment Checklist — Immersive Journey Bridges

**Deadline:** Friday EOD (48 hours from Wednesday 7 AM)  
**Status:** Feature complete, ready for verification and deployment  
**Estimated time:** 4 hours today (Wed) + 2 hours tomorrow (Thu) + 1 hour Friday (deploy)

---

## TODAY (Wednesday) — Smoke Test (4 hours)

### Phase 1: Verify Core Functionality (1.5 hours)

**Goal:** Confirm all six bridges render correctly and navigate to the right destinations.

#### 1.1 Collection Bridge
- [ ] Navigate to any collection page (e.g., `/collections/suffuse`)
- [ ] Verify pill CTA appears above product grid (dark/gold pill with eyebrow "Explore in 3D")
- [ ] Verify pill only appears when `collection.products_count > 0`
- [ ] Click bridge → should navigate to `/?open_collection=suffuse`
- [ ] Verify collection panel opens in 3D store (glass panel renders)
- [ ] Verify no console errors

#### 1.2 Search Bridge
- [ ] Perform a search (e.g., `/search?q=bridal`)
- [ ] Verify pill CTA appears above search results (only when results exist)
- [ ] Verify pill does NOT appear when search returns zero results
- [ ] Click bridge → should navigate to `/?open_search=bridal`
- [ ] Verify search results panel opens in 3D store
- [ ] Verify no console errors

#### 1.3 Product Bridge
- [ ] Navigate to any product page (e.g., `/products/suffuse-eid-dress`)
- [ ] Verify pill CTA appears after buy buttons block
- [ ] Click bridge → should navigate to `/?open_product=suffuse-eid-dress`
- [ ] Verify product panel opens in 3D store
- [ ] Verify no console errors

#### 1.4 Cart Bridge
- [ ] Add a product to cart
- [ ] Navigate to `/cart`
- [ ] Verify pill CTA appears after cart heading (only when `cart.item_count > 0`)
- [ ] Verify pill does NOT appear on empty cart
- [ ] Click bridge → should navigate to `/pages/immersive-store`
- [ ] Verify 3D store opens (no specific panel)
- [ ] Verify no console errors

#### 1.5 Collections List Bridge
- [ ] Navigate to `/collections` (collections list page)
- [ ] Verify pill CTA appears after collections heading
- [ ] Click bridge → should navigate to `/pages/immersive-store`
- [ ] Verify 3D store opens
- [ ] Verify no console errors

#### 1.6 Content Bridge (Blog + Article)
- [ ] Navigate to any blog index (e.g., `/blogs/news`)
- [ ] Verify pill CTA appears after blog title
- [ ] Click bridge → should navigate to `/pages/immersive-store`
- [ ] Navigate to any blog post (e.g., `/blogs/news/post-title`)
- [ ] Verify pill CTA appears in the article back-link area
- [ ] Click bridge → should navigate to `/pages/immersive-store`
- [ ] Verify 3D store opens
- [ ] Verify no console errors

### Phase 2: Verify Preference Banner (1 hour)

**Goal:** Confirm preference banner shows/hides correctly and preference logic works.

#### 2.1 First-time visitor (no preference set)
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify `immersive_preferred_mode` key does NOT exist
- [ ] Navigate to any 2D page (collection, search, product, etc.)
- [ ] Verify preference banner does NOT appear
- [ ] Verify no console errors

#### 2.2 After visiting 3D store (preference set)
- [ ] Navigate to `/pages/immersive-store`
- [ ] Wait for 3D scene to load
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify `immersive_preferred_mode` key now exists with value `'3d'`
- [ ] Navigate back to a 2D page (e.g., `/collections/suffuse`)
- [ ] Verify preference banner NOW appears at bottom of page
- [ ] Verify banner text says "Welcome back — your 3D store is ready."
- [ ] Verify banner has "Return to 3D Store" CTA link
- [ ] Verify banner has "Dismiss" button
- [ ] Verify no console errors

#### 2.3 Dismiss preference banner
- [ ] With preference banner visible, click "Dismiss" button
- [ ] Verify banner disappears from DOM
- [ ] Verify focus moves to next element (no focus trap)
- [ ] Verify `immersive_preferred_mode` key still exists in localStorage (preference not cleared)
- [ ] Refresh page
- [ ] Verify banner reappears (preference persists)
- [ ] Verify no console errors

#### 2.4 Preference banner not on immersive/index pages
- [ ] Navigate to `/pages/immersive-store`
- [ ] Verify preference banner does NOT appear (template guard working)
- [ ] Navigate to `/` (home)
- [ ] Verify preference banner does NOT appear (template guard working)
- [ ] Verify no console errors

### Phase 3: Verify Device-Aware Behavior (1 hour)

**Goal:** Confirm reduced motion behavior works. Note: slow connection warning requires the Network Information API (`navigator.connection`), which is only available in Chrome/Edge — skip on Safari/Firefox.

#### 3.1 Slow connection warning (Chrome/Edge only)
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Slow 3G"
- [ ] Navigate to any collection page
- [ ] Verify bridge pill has `.immersive-bridge-banner--slow-connection` class applied
- [ ] Verify pill label text changes to warning message: "3D store is optimized for faster connections"
- [ ] Reset throttling to normal
- [ ] Verify no console errors

> Note: `bridge-behavior.js` targets `[data-immersive-bridge]` elements. On slow connections, the pill label text is replaced with the warning message and the CSS modifier class is applied to the `<a>` element.

#### 3.2 Reduced motion preference
- [ ] Open DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion
- [ ] Select "prefers-reduced-motion: reduce"
- [ ] Navigate to any collection page
- [ ] Verify bridge pill has `.immersive-bridge-banner--reduced-motion` class applied
- [ ] Verify pulsing dot animation is disabled (CSS `animation: none` via `@media (prefers-reduced-motion: reduce)`)
- [ ] Verify arrow transition on hover is disabled
- [ ] Verify bridge is still clickable
- [ ] Reset prefers-reduced-motion
- [ ] Verify no console errors

#### 3.3 Both slow connection AND reduced motion (Chrome/Edge only)
- [ ] Enable both slow 3G throttling AND prefers-reduced-motion: reduce
- [ ] Navigate to any collection page
- [ ] Verify bridge pill has both modifier classes applied
- [ ] Verify animations are disabled
- [ ] Verify bridge is still clickable
- [ ] Reset both settings
- [ ] Verify no console errors

### Phase 4: Verify No Regressions (0.5 hours)

**Goal:** Confirm existing functionality still works.

#### 4.1 Collection page functionality
- [ ] Navigate to `/collections/suffuse`
- [ ] Verify product grid loads
- [ ] Verify facet filtering still works (click a filter)
- [ ] Verify pagination still works (if applicable)
- [ ] Verify bridge pill does NOT interfere with grid layout
- [ ] Verify no console errors

#### 4.2 Search page functionality
- [ ] Perform a search
- [ ] Verify search results load
- [ ] Verify facet filtering still works
- [ ] Verify bridge pill does NOT interfere with results layout
- [ ] Verify no console errors

#### 4.3 Product page functionality
- [ ] Navigate to any product page
- [ ] Verify product media loads
- [ ] Verify variant selector works
- [ ] Verify "Add to cart" button works
- [ ] Verify bridge pill does NOT interfere with product layout
- [ ] Verify no console errors

#### 4.4 Cart page functionality
- [ ] Navigate to `/cart`
- [ ] Verify cart items display
- [ ] Verify quantity adjustment works
- [ ] Verify "Remove" button works
- [ ] Verify bridge pill does NOT interfere with cart layout
- [ ] Verify no console errors

#### 4.5 Header/footer functionality
- [ ] Verify header navigation still works
- [ ] Verify footer links still work
- [ ] Verify search box in header still works
- [ ] Verify cart icon in header still works
- [ ] Verify no console errors

---

## TOMORROW (Thursday) — Final QA (2 hours)

### Phase 5: Cross-Browser & Device Testing (1 hour)

**Goal:** Verify feature works on all major browsers and devices.

#### 5.1 Desktop browsers
- [ ] Chrome (latest) — all 6 bridges, preference banner, device-aware behavior
- [ ] Firefox (latest) — all 6 bridges, preference banner
- [ ] Safari (latest) — all 6 bridges, preference banner
- [ ] Edge (latest) — all 6 bridges, preference banner

#### 5.2 Mobile devices
- [ ] iPhone (Safari) — all 6 bridges, preference banner, responsive layout (pill goes full-width at ≤749px)
- [ ] Android (Chrome) — all 6 bridges, preference banner, responsive layout
- [ ] Tablet (iPad) — all 6 bridges, preference banner, responsive layout

#### 5.3 Accessibility testing
- [ ] Keyboard navigation: Tab to bridge pill, verify focus ring visible (gold outline)
- [ ] Keyboard navigation: Tab through preference banner, verify focus visible
- [ ] Keyboard navigation: Escape key closes any open panels (existing behavior)
- [ ] Screen reader (VoiceOver on Mac): Verify bridge `aria-label` is read (e.g., "Explore Suffuse in the 3D Store")
- [ ] Screen reader: Verify eyebrow/label/arrow are NOT announced (all `aria-hidden="true"`)
- [ ] Screen reader: Verify preference banner region is announced

### Phase 6: Performance & Console Check (1 hour)

**Goal:** Verify no performance regressions and no console errors.

#### 6.1 Lighthouse audit
- [ ] Run Lighthouse on `/` (home page)
- [ ] Verify LCP is reasonable (target: < 3s on 4G)
- [ ] Verify CLS is low (target: < 0.1)
- [ ] Verify no new performance warnings
- [ ] Run Lighthouse on `/pages/immersive-store`
- [ ] Verify LCP is reasonable (3D page will be heavier, but should be < 5s)
- [ ] Verify no new performance warnings

#### 6.2 Console check
- [ ] Open DevTools → Console tab
- [ ] Navigate through all 6 bridge locations
- [ ] Verify NO errors or warnings in console
- [ ] Verify NO 404s for assets (`bridge-behavior.js`, etc.)
- [ ] Verify NO uncaught exceptions

#### 6.3 Network tab check
- [ ] Open DevTools → Network tab
- [ ] Navigate to a collection page
- [ ] Verify `bridge-behavior.js` loads successfully
- [ ] Verify no failed requests
- [ ] Verify no excessive requests

---

## FRIDAY — Deploy & Monitor (1 hour)

### Phase 7: Pre-Deployment Final Check (0.25 hours)

- [ ] Verify all Wednesday smoke tests passed
- [ ] Verify all Thursday QA tests passed
- [ ] Verify no new issues reported by team
- [ ] Verify no console errors on production-like environment

### Phase 8: Deploy to Production (0.5 hours)

- [ ] Push theme to production via Shopify CLI: `shopify theme push`
- [ ] Verify deployment completed successfully
- [ ] Verify no deployment errors in Shopify admin

### Phase 9: Post-Deployment Monitoring (0.25 hours)

- [ ] Monitor error logs for any exceptions
- [ ] Verify all 6 bridges render correctly on production
- [ ] Verify preference banner appears on production
- [ ] Verify no console errors on production
- [ ] Spot-check on mobile device
- [ ] Gather initial user feedback

---

## Critical Issues to Watch For

If you encounter any of these during testing, **STOP and fix immediately** (these are blockers):

### 🔴 Blocker 1: Bridge not rendering
- **Symptom:** Bridge pill doesn't appear on collection/search/product/cart/collections list/content pages
- **Likely cause:** Snippet not rendered in section, or conditional logic is wrong
- **Fix:** Check that `{% render 'immersive-bridge-btn' %}` is present in the section and parameters are passed correctly

### 🔴 Blocker 2: Bridge URL parameter not working
- **Symptom:** Clicking bridge navigates to the immersive store but panel doesn't open
- **Likely cause:** URL parameter handler not parsing correctly, or panel function not called
- **Fix:** Check `immersive-store.js` for `open_collection`, `open_product`, `open_search` parameter parsing

### 🔴 Blocker 3: Preference banner not appearing
- **Symptom:** After visiting 3D store, preference banner doesn't appear on 2D pages
- **Likely cause:** `writeImmersivePreference()` not called, or localStorage not working
- **Fix:** Check that `writeImmersivePreference()` is called in `initImmersiveScene()` after `hideLoader()`

### 🔴 Blocker 4: Device-aware behavior not working
- **Symptom:** Reduced motion animations still play when `prefers-reduced-motion: reduce` is set
- **Likely cause:** `bridge-behavior.js` not loaded, or CSS `@media (prefers-reduced-motion)` block missing from snippet
- **Fix:** Check that `bridge-behavior.js` is loaded in `layout/theme.liquid` and the snippet's `{% stylesheet %}` block includes the reduced motion guard

### 🔴 Blocker 5: Console errors
- **Symptom:** Any JavaScript errors in DevTools console
- **Likely cause:** Syntax error, missing function, or undefined variable
- **Fix:** Check error message and trace to source file; fix immediately

---

## Non-Blocking Issues (Can be fixed later)

If you encounter any of these, **document them but proceed with deployment**:

- Minor styling tweaks (spacing, colors, fonts)
- Animation timing adjustments
- Localization string improvements
- Analytics tracking enhancements

---

## Success Criteria

✅ **Feature is ready to deploy if:**
- All 6 bridges render and navigate correctly
- Preference banner shows/hides correctly
- Reduced motion behavior works
- No regressions on existing functionality
- No console errors
- No performance regressions
- All browsers/devices tested pass

❌ **Feature is NOT ready if:**
- Any blocker issue is present
- Any console errors exist
- Any regression on existing functionality
- Performance significantly degraded

---

## Time Breakdown

| Phase | Time | Status |
|-------|------|--------|
| 1. Core functionality | 1.5h | Today |
| 2. Preference banner | 1h | Today |
| 3. Device-aware behavior | 1h | Today |
| 4. No regressions | 0.5h | Today |
| **Total Today** | **4h** | |
| 5. Cross-browser/device | 1h | Tomorrow |
| 6. Performance/console | 1h | Tomorrow |
| **Total Tomorrow** | **2h** | |
| 7-9. Deploy & monitor | 1h | Friday |
| **Total Friday** | **1h** | |
| **TOTAL** | **7h** | |

---

## Quick Reference: File Locations

| Component | File | Key Function/Note |
|-----------|------|-------------------|
| Bridge Pill CTA | `snippets/immersive-bridge-btn.liquid` | Renders pill UI; params: `bridge_url`, `bridge_label`, `bridge_aria`, `bridge_class` |
| Collection Bridge | `sections/main-collection-product-grid.liquid` | Renders snippet; guarded by `collection.products_count > 0` |
| Search Bridge | `sections/main-search.liquid` | Renders snippet; guarded by `search.results_count > 0` |
| Product Bridge | `sections/main-product.liquid` | Renders snippet inside `buy_buttons` block |
| Cart Bridge | `sections/main-cart-items.liquid` | Renders snippet; guarded by `cart.item_count > 0` |
| Collections List Bridge | `sections/main-list-collections.liquid` | Renders snippet; always visible |
| Content Bridge | `sections/main-blog.liquid`, `sections/main-article.liquid` | Renders snippet; always visible |
| URL Handler | `assets/immersive-store.js` | `safeBindImmersiveInit()` — parses `open_collection`, `open_product`, `open_search` |
| Preference Manager | `assets/immersive-store.js` | `writeImmersivePreference()`, `readImmersivePreference()` |
| Device-Aware Behavior | `assets/bridge-behavior.js` | `initBridgeBehavior()` — applies modifier classes to `[data-immersive-bridge]` |
| Preference Banner | `layout/theme.liquid` | Inline HTML + script; guarded against `page.immersive` and `index` templates |
| Localization | `locales/en.default.json` | `sections.immersive_journey_bridges.*` |

---

## Next Steps After Deployment

Once deployed and verified on Friday:

1. **Monitor for 24 hours** — Watch error logs and user feedback
2. **Gather metrics** — Track bridge click-through rates and conversion
3. **Plan Phase 2** — Metaobjects, analytics dashboard, preference toggle in 3D menu
4. **Document learnings** — Update internal docs with any issues found

---

**You've got this. 48 hours to verify and deploy. Let's go.** 🚀
