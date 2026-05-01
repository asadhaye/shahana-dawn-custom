# Duplicate Functions Report

**Date:** April 22, 2026  
**Status:** ⚠️ CRITICAL ISSUE - Phase 2 Incomplete

---

## 🚨 Problem Summary

Phase 2 extraction created the module files BUT:
1. ❌ **Functions were NOT removed from main file** (duplicates exist)
2. ❌ **Code is NOT using the module exports** (still calling old functions)
3. ❌ **No actual code reduction happened**

---

## 📊 Duplicate Functions Found

### Utility Functions (Should be in modules):

| Function | Line in Main File | Should be in Module | Status |
|----------|------------------|---------------------|--------|
| `fetchWithCache()` | 843 | `assets/immersive/utils/fetch.js` | ❌ DUPLICATE |
| `trackImmersiveEvent()` | 221 | `assets/immersive/utils/analytics.js` | ❌ DUPLICATE |
| `openDialogFocus()` | 395 | `assets/immersive/utils/dom.js` | ❌ DUPLICATE |
| `renderSkeletonGrid()` | 476 | `assets/immersive/utils/skeleton.js` | ❌ DUPLICATE |
| `renderSkeletonProduct()` | 497 | `assets/immersive/utils/skeleton.js` | ❌ DUPLICATE |
| `renderSkeletonRoom()` | 514 | `assets/immersive/utils/skeleton.js` | ❌ DUPLICATE |

**Total Duplicates: 6 functions**

---

## 🔍 Analysis

### What Happened:

1. ✅ Module files were created correctly
2. ✅ `layout/theme.liquid` was updated to load modules
3. ✅ Import comments were added to main file
4. ❌ **Functions were NOT removed from main file**
5. ❌ **Function calls were NOT updated to use modules**

### Current State:

```javascript
// Main file has:
function fetchWithCache(url) { ... }  // Line 843

// Module has:
window.ImmersiveFetch = {
  fetchWithCache: fetchWithCache,  // Line 33 in fetch.js
  ...
};

// Code is calling:
fetchWithCache(url)  // ❌ Calls duplicate in main file

// Should be calling:
window.ImmersiveFetch.fetchWithCache(url)  // ✅ Uses module
```

---

## 💥 Impact

### File Size:
- **Expected reduction:** ~500 lines
- **Actual reduction:** 0 lines (functions duplicated)
- **Current size:** 6,022 lines (should be ~5,500)

### Performance:
- ❌ Duplicate code loaded (wasted bandwidth)
- ❌ Duplicate functions in memory
- ❌ Potential bugs (which version is being used?)

### Maintainability:
- ❌ Changes must be made in two places
- ❌ Risk of divergence between versions
- ❌ Confusing for developers

---

## ✅ How to Fix

### Option 1: Use Cursor AI (Recommended - 15 minutes)

```
Open Cursor, paste:

@assets/immersive-store.js @DUPLICATE_FUNCTIONS_REPORT.md

Fix Phase 2 duplicates:

1. Remove these functions from immersive-store.js:
   - fetchWithCache (line 843)
   - trackImmersiveEvent (line 221)
   - openDialogFocus (line 395)
   - renderSkeletonGrid (line 476)
   - renderSkeletonProduct (line 497)
   - renderSkeletonRoom (line 514)

2. Update ALL calls to use module exports:
   - fetchWithCache(url) → window.ImmersiveFetch.fetchWithCache(url)
   - trackImmersiveEvent(name, params) → window.ImmersiveAnalytics.trackImmersiveEvent(name, params)
   - openDialogFocus(panel, trigger) → window.ImmersiveDOM.openDialogFocus(panel, trigger)
   - renderSkeletonGrid(count) → window.ImmersiveSkeleton.renderSkeletonGrid(count)
   - renderSkeletonProduct() → window.ImmersiveSkeleton.renderSkeletonProduct()
   - renderSkeletonRoom() → window.ImmersiveSkeleton.renderSkeletonRoom()

3. Test: npm test

4. Verify no duplicates remain:
   grep -n "^function fetchWithCache" assets/immersive-store.js
   (should return nothing)
```

### Option 2: Manual Fix (30 minutes)

**Step 1: Find all function calls**
```bash
# Find fetchWithCache calls
grep -n "fetchWithCache(" assets/immersive-store.js

# Find trackImmersiveEvent calls
grep -n "trackImmersiveEvent(" assets/immersive-store.js

# Find openDialogFocus calls
grep -n "openDialogFocus(" assets/immersive-store.js

# Find renderSkeleton calls
grep -n "renderSkeleton" assets/immersive-store.js
```

**Step 2: Replace all calls**
```bash
# Use sed to replace (macOS)
sed -i '' 's/fetchWithCache(/window.ImmersiveFetch.fetchWithCache(/g' assets/immersive-store.js
sed -i '' 's/trackImmersiveEvent(/window.ImmersiveAnalytics.trackImmersiveEvent(/g' assets/immersive-store.js
sed -i '' 's/openDialogFocus(/window.ImmersiveDOM.openDialogFocus(/g' assets/immersive-store.js
sed -i '' 's/renderSkeletonGrid(/window.ImmersiveSkeleton.renderSkeletonGrid(/g' assets/immersive-store.js
sed -i '' 's/renderSkeletonProduct(/window.ImmersiveSkeleton.renderSkeletonProduct(/g' assets/immersive-store.js
sed -i '' 's/renderSkeletonRoom(/window.ImmersiveSkeleton.renderSkeletonRoom(/g' assets/immersive-store.js
```

**Step 3: Remove duplicate functions**
```bash
# Remove fetchWithCache (lines 843-856)
sed -i '' '843,856d' assets/immersive-store.js

# Remove trackImmersiveEvent (lines 221-245)
sed -i '' '221,245d' assets/immersive-store.js

# Remove openDialogFocus (lines 395-450)
sed -i '' '395,450d' assets/immersive-store.js

# Remove renderSkeletonGrid (lines 476-495)
sed -i '' '476,495d' assets/immersive-store.js

# Remove renderSkeletonProduct (lines 497-512)
sed -i '' '497,512d' assets/immersive-store.js

# Remove renderSkeletonRoom (lines 514-522)
sed -i '' '514,522d' assets/immersive-store.js
```

**Step 4: Test**
```bash
npm test
```

---

## 🎯 Expected Result After Fix

### File Size:
- **Before:** 6,022 lines
- **After:** ~5,500 lines
- **Reduction:** ~500 lines

### Code Quality:
- ✅ No duplicates
- ✅ All calls use module exports
- ✅ Single source of truth for each function
- ✅ Easier to maintain

### Tests:
- ✅ All tests passing
- ✅ No regressions

---

## 📝 Verification Checklist

After fixing, verify:

- [ ] No duplicate functions remain:
  ```bash
  grep -n "^function fetchWithCache" assets/immersive-store.js
  grep -n "^function trackImmersiveEvent" assets/immersive-store.js
  grep -n "^function openDialogFocus" assets/immersive-store.js
  grep -n "^function renderSkeleton" assets/immersive-store.js
  ```
  All should return nothing.

- [ ] All calls use module exports:
  ```bash
  grep -n "window.ImmersiveFetch" assets/immersive-store.js
  grep -n "window.ImmersiveAnalytics" assets/immersive-store.js
  grep -n "window.ImmersiveDOM" assets/immersive-store.js
  grep -n "window.ImmersiveSkeleton" assets/immersive-store.js
  ```
  Should find multiple matches.

- [ ] Tests pass:
  ```bash
  npm test
  ```

- [ ] File size reduced:
  ```bash
  wc -l assets/immersive-store.js
  # Should be ~5,500 lines
  ```

---

## 🚀 Next Steps

1. **Fix Phase 2 duplicates** (use Cursor AI or manual fix above)
2. **Test thoroughly** (`npm test` + manual QA)
3. **Commit:** `git commit -m "fix: remove Phase 2 duplicate functions"`
4. **Then proceed to Phase 3** (WebGL engine extraction)

---

## 💡 Recommendation

**Use Cursor AI** - It will:
- Find all function calls automatically
- Update them correctly
- Remove duplicates safely
- Test automatically

**Time: 15 minutes vs 30 minutes manual**
**Risk: Low vs Medium**

---

## 📞 Need Help?

This is a good use of your 150 Kiro credits:
- **50 credits:** Fix Phase 2 duplicates
- **50 credits:** Verify and test
- **50 credits:** Save for Phase 3 review

Or use Cursor AI and save all 150 credits for later phases!
