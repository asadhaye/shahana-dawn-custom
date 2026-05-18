# Immersive Store Modularization - Execution Plan

## Overview
Complete the migration from monolithic `immersive-store.js` to modular files (`immersive-core.js`, `immersive-features.js`, `immersive-init.js`).

---

## Step 1: Update Test Files (33 files)

### Category A: Static Analysis Tests (7 files) — SOURCE_PATH updates required

#### 1. `tests/wishlist-panel.test.js`
**Change:** `immersive-store.js` → `immersive-features.js`
```diff
- const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
+ const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-features.js');

- describe('immersive-store.js contains wishlist functions', () => {
-   test('immersive-store.js contains addToWishlist function', () => {
+ describe('immersive-features.js contains wishlist functions', () => {
+   test('immersive-features.js contains addToWishlist function', () => {
```
Apply same pattern to all 5 test assertions in this file.

#### 2. `tests/module-api.test.js`
**Change:** Split into 3 source paths
```diff
- const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
+ const CORE_PATH = path.join(__dirname, '..', 'assets', 'immersive-core.js');
+ const FEATURES_PATH = path.join(__dirname, '..', 'assets', 'immersive-features.js');
+ const INIT_PATH = path.join(__dirname, '..', 'assets', 'immersive-init.js');
```

Update describe blocks:
- Glass panel functions → `CORE_PATH`
- Wishlist functions → `FEATURES_PATH`
- Editorial functions → `FEATURES_PATH`
- Room manager functions → `CORE_PATH`
- Hero-parallax functions → `FEATURES_PATH`

Add new describe block for init functions:
```javascript
describe('immersive-init.js — init wrapper functions', () => {
  test('contains function safeBindImmersiveInit', () => {
    expect(initSource).toContain('function safeBindImmersiveInit');
  });
  // Add other init function checks
});
```

#### 3. `tests/room-manager.test.js`
**Change:** `immersive-store.js` → `immersive-core.js`
```diff
- const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
+ const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-core.js');

- describe('immersive-store.js contains room manager functions', () => {
-   test('immersive-store.js contains goToRoom function', () => {
+ describe('immersive-core.js contains room manager functions', () => {
+   test('immersive-core.js contains goToRoom function', () => {
```

**Note:** `STORE_ROOMS` check may need adjustment — verify it exists in `immersive-core.js` or move to config file check.

#### 4. `tests/theme-editor-reinit.test.js`
**Change:** `immersive-store.js` → `immersive-init.js`
```diff
- source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'immersive-store.js'), 'utf8');
+ source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'immersive-init.js'), 'utf8');

- test('immersive-store.js registers a shopify:section:load event listener', function () {
+ test('immersive-init.js registers a shopify:section:load event listener', function () {
```

Apply to all 12 test assertions.

#### 5. `tests/hero-parallax.test.js`
**Change:** `immersive-store.js` → `immersive-features.js`
```diff
- const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
+ const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-features.js');

- describe('immersive-store.js contains hero parallax functions', () => {
-   test('immersive-store.js contains initEditorialHeroParallax function', () => {
+ describe('immersive-features.js contains hero parallax functions', () => {
+   test('immersive-features.js contains initEditorialHeroParallax function', () => {
```

**Note:** Verify `_ehpScrollTarget`, `_ehpScrollCurrent`, `_ehpRafId` vars exist in `immersive-features.js`.

#### 6. `tests/glass-panel.property.test.js`
**Change:** One test reads `immersive-store.js` for variant button keyboard handlers
```diff
- var IMMERSIVE_STORE_PATH = path.resolve(__dirname, '../assets/immersive-store.js');
+ var IMMERSIVE_STORE_PATH = path.resolve(__dirname, '../assets/immersive-features.js');
```
(Line ~1779)

#### 7. `tests/glass-panel-product-open-fix.test.js`
**Change:** One test reads `immersive-store.js` for click delegation fix
```diff
- const jsSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive-store.js'), 'utf8');
+ const jsSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive-features.js'), 'utf8');
```
(Line ~233)

### Category B: Inline Reproduction Tests (26 files) — No path changes needed

These files reproduce logic inline and don't read source files. Comments referencing `immersive-store.js` are documentation-only and can be updated optionally:

- `immersive-search.unit.test.js`
- `immersive-search-grouping.property.test.js`
- `immersive-search-keyboard-nav.property.test.js`
- `immersive-room-recommender.unit.test.js`
- `immersive-room-recommender.property.test.js`
- `immersive-quick-add.unit.test.js`
- `immersive-quick-add.property.test.js`
- `immersive-next-actions.unit.test.js`
- `immersive-next-actions.property.test.js`
- `immersive-limited-time.unit.test.js`
- `immersive-limited-time.property.test.js`
- `immersive-gestures.unit.test.js`
- `immersive-gestures.property.test.js`
- `immersive-filters.unit.test.js`
- `immersive-filters.property.test.js`
- `immersive-bottom-nav-badge.property.test.js`
- `immersive-editorial.test.js`
- `hotspot-navigation.property.test.js`
- `hero-parallax.test.js` (property tests only)
- `glass-panel.property.test.js` (most tests)
- `glass-panel-product-open-fix.test.js` (most tests)
- `feedback.property.test.js`
- `bridge-behavior.unit.test.js`
- `buy-now-form.unit.test.js`
- `text-contrast.property.test.js`
- `panel-overlay.property.test.js`
- `wishlist-and-preferences.unit.test.js`
- `variant-buttons.unit.test.js`
- `section-rendering.unit.test.js`

---

## Step 2: Delete Legacy `immersive-store.js`

```bash
rm assets/immersive-store.js
```

**Verification:**
```bash
grep -r "immersive-store.js" assets/ tests/ --include="*.js" --include="*.liquid"
```
Should return 0 results after Step 1.

---

## Step 3: Remove Duplicate FAB Logic from `immersive-core.js`

**What to remove:**
- Simplified FAB implementation in `immersive-core.js` (lines ~TBD)
- Keep full FAB implementation in `immersive-init.js`

**Verification:**
```bash
grep -n "initFAB\|fabDrag\|fabPosition" assets/immersive-core.js
```
Should return 0 results after cleanup.

---

## Step 4: Verify Dynamic Section Loading

**Check `immersive-features.js` for:**
```javascript
// Should contain section rendering calls like:
fetch('/collections/' + handle + '?sections=immersive-product-grid')
fetch('/products/' + handle + '?sections=immersive-designer-grid')
```

**Verification:**
```bash
grep -n "immersive-product-grid\|immersive-designer-grid" assets/immersive-features.js
```

---

## Execution Order

1. ✅ Update 7 static analysis test files (Category A)
2. ✅ Run tests to verify: `npm test`
3. ✅ Delete `assets/immersive-store.js`
4. ✅ Remove duplicate FAB from `immersive-core.js`
5. ✅ Verify dynamic section loading
6. ✅ Run full test suite: `npm test`

---

## Risk Mitigation

- **Before deleting:** Run `npm test` to ensure all tests pass with new paths
- **Git safety:** All changes can be reverted via `git checkout`
- **Fallback:** Keep `immersive-store.js` in git history (don't force push)
