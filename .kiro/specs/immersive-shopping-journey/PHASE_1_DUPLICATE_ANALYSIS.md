# Phase 1 Duplicate Code Analysis

**Date:** April 28, 2026  
**Status:** ⚠️ FOUND DUPLICATES - Need Extraction

---

## Summary

Phase 1 helper functions are still defined in `assets/immersive-store.js` but are being used by modular files. These should be extracted to a utility module for consistency.

---

## Phase 1 Helper Functions Found

### 1. `fadeInContent(container, html)` — Lines 527-549

**Location:** `assets/immersive-store.js:527`

**Used by:**
- `assets/immersive/panels/collection-panel.js:40`
- `assets/immersive/panels/product-panel.js:41`

**Status:** ⚠️ Should be extracted to `assets/immersive/utils/dom.js`

### 2. `fadeOutContent(container, callback)` — Lines 552-573

**Location:** `assets/immersive-store.js:552`

**Used by:**
- (Checked in modular files - not directly used, but available globally)

**Status:** ⚠️ Should be extracted to `assets/immersive/utils/dom.js`

### 3. `recordBrowsingSignal(roomKey)` — Lines 630-641

**Location:** `assets/immersive-store.js:630`

**Used by:**
- `assets/immersive/panels/collection-panel.js:8`
- `assets/immersive/panels/product-panel.js:8`
- `assets/immersive/panels/wishlist-panel.js:19`

**Status:** ⚠️ Should be extracted to `assets/immersive/utils/analytics.js`

### 4. `announceHotspot(label)` — Lines 1832-1837

**Location:** `assets/immersive-store.js:1832`

**Used by:**
- (Not used in modular files - only in immersive-store.js)

**Status:** ⚠️ Can stay in `immersive-store.js` or extract to `assets/immersive/utils/dom.js`

### 5. `showAfterAddToCart(product)` — Lines 1659-1680

**Location:** `assets/immersive-store.js:1659`

**Used by:**
- `assets/immersive/features/quick-add.js:240`
- `assets/immersive/panels/product-panel.js:333`

**Status:** ⚠️ Should be extracted to `assets/immersive/utils/analytics.js` or `assets/immersive/features/next-actions.js`

---

## Recommendation

### Option A: Extract to Existing Modules (RECOMMENDED)

1. **`fadeInContent()` and `fadeOutContent()`** → `assets/immersive/utils/dom.js`
   - These are DOM utilities
   - Already has focus management functions
   - Logical home for content transitions

2. **`recordBrowsingSignal()`** → `assets/immersive/utils/analytics.js`
   - This is analytics/tracking
   - Already has event tracking functions
   - Logical home for browsing signals

3. **`showAfterAddToCart()`** → `assets/immersive/features/next-actions.js`
   - This is a feature (next actions after add-to-cart)
   - Should be in features folder
   - Or keep in immersive-store.js if it's core

4. **`announceHotspot()`** → `assets/immersive/utils/dom.js`
   - This is a DOM/accessibility utility
   - Logical home for announcements

### Option B: Keep in immersive-store.js

If these are considered "core" functions that should be in the main file, they can stay. However, this violates the modular architecture principle.

---

## Impact Analysis

### If Extracted (Option A)

**Pros:**
- ✅ Consistent modular architecture
- ✅ Easier to maintain
- ✅ Clearer dependencies
- ✅ Better code organization

**Cons:**
- ⚠️ Need to update modular files to import from new locations
- ⚠️ Need to ensure proper script loading order

### If Kept in immersive-store.js (Option B)

**Pros:**
- ✅ No changes needed
- ✅ Works as-is

**Cons:**
- ❌ Violates modular architecture
- ❌ Inconsistent with other extracted functions
- ❌ Harder to maintain long-term

---

## Recommended Action

**Extract to modular files (Option A)** for consistency with the existing architecture.

### Steps:

1. **Add to `assets/immersive/utils/dom.js`:**
   - `fadeInContent()`
   - `fadeOutContent()`
   - `announceHotspot()`

2. **Add to `assets/immersive/utils/analytics.js`:**
   - `recordBrowsingSignal()`

3. **Add to `assets/immersive/features/next-actions.js` (or keep in immersive-store.js):**
   - `showAfterAddToCart()`

4. **Update modular files to use global functions:**
   - `collection-panel.js` → Use `window.ImmersiveDOM.fadeInContent()`
   - `product-panel.js` → Use `window.ImmersiveDOM.fadeInContent()`
   - `wishlist-panel.js` → Use `window.ImmersiveAnalytics.recordBrowsingSignal()`

5. **Remove from `immersive-store.js`:**
   - Delete the duplicate definitions

6. **Update `layout/theme.liquid`:**
   - Ensure modular files load before `immersive-store.js`

---

## Files to Modify

| File | Action | Functions |
|------|--------|-----------|
| `assets/immersive/utils/dom.js` | Add | `fadeInContent()`, `fadeOutContent()`, `announceHotspot()` |
| `assets/immersive/utils/analytics.js` | Add | `recordBrowsingSignal()` |
| `assets/immersive-store.js` | Remove | All 5 functions |
| `assets/immersive/panels/collection-panel.js` | Update | Use `window.ImmersiveDOM.fadeInContent()` |
| `assets/immersive/panels/product-panel.js` | Update | Use `window.ImmersiveDOM.fadeInContent()` |
| `assets/immersive/panels/wishlist-panel.js` | Update | Use `window.ImmersiveAnalytics.recordBrowsingSignal()` |
| `assets/immersive/features/quick-add.js` | Update | Use `window.ImmersiveNextActions.showAfterAddToCart()` |

---

## Conclusion

Phase 1 helper functions should be extracted to modular files for consistency with the existing architecture. This will complete the cleanup and ensure all functions follow the same pattern.

**Recommendation:** Proceed with Option A (Extract to modular files)

