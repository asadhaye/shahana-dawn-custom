# Low Credit Execution Guide (150 Credits)

## 🎯 Goal: Complete Phases 2-8 with Minimal AI Assistance

You have **150 credits** remaining. Here's how to complete the refactoring **yourself** using the scripts I've created.

---

## 📋 What I've Created for You

### ✅ Ready to Use:
1. **`scripts/phase2-extract-utilities.sh`** - Fully automated Phase 2
2. **`scripts/phase3-8-mega-script.sh`** - Creates structure for Phases 3-8
3. **`EFFICIENT_EXECUTION_PLAN.md`** - Detailed strategy guide
4. **`REFACTORING_CHECKLIST.md`** - Complete checklist
5. **`PHASE_1_COMPLETE.md`** - Phase 1 completion report

---

## 🚀 Execution Plan (No AI Credits Needed)

### Phase 2: Extract Utilities (30 minutes, 0 credits)

**Run the script yourself:**
```bash
# Make script executable
chmod +x scripts/phase2-extract-utilities.sh

# Run it
bash scripts/phase2-extract-utilities.sh
```

**What it does:**
- ✅ Creates 4 utility modules automatically
- ✅ Updates immersive-store.js with imports
- ✅ Creates backup automatically

**Manual step (5 minutes):**
Update `layout/theme.liquid` to load the new modules:

```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'immersive/utils/fetch.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/analytics.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/dom.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/skeleton.js' | asset_url }}" defer></script>
  <script src="{{ 'three.min.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer></script>
{%- endif -%}
```

**Test:**
```bash
npm test
```

**Commit:**
```bash
git add assets/immersive/ layout/theme.liquid
git commit -m "refactor: extract utilities to modules (Phase 2)"
```

---

### Phases 3-8: Create Structure (10 minutes, 0 credits)

**Run the mega script:**
```bash
chmod +x scripts/phase3-8-mega-script.sh
bash scripts/phase3-8-mega-script.sh
```

**What it does:**
- ✅ Creates folder structure for all modules
- ✅ Creates placeholder files with TODOs
- ✅ Creates optimization checklist
- ✅ Creates test generator script

**Result:**
```
assets/immersive/
├── core/
│   ├── webgl-engine.js (placeholder)
│   ├── room-manager.js (placeholder)
│   └── state-manager.js (placeholder)
├── features/
│   ├── search.js (placeholder)
│   ├── filters.js (placeholder)
│   └── ... (7 files)
├── panels/
│   └── ... (4 files)
├── editorial/
│   └── ... (4 files)
└── guided/
    └── guided-mode.js (placeholder)
```

---

## 🔧 Manual Extraction Guide (Phases 3-6)

### How to Extract Functions Manually

**Step 1: Find the function**
```bash
# Example: Find initImmersiveSearch
grep -n "function initImmersiveSearch" assets/immersive-store.js
```

**Step 2: Copy the function**
- Open `assets/immersive-store.js`
- Find the function (use line number from grep)
- Copy from `function name` to closing `}`

**Step 3: Paste into module file**
- Open the placeholder file (e.g., `assets/immersive/features/search.js`)
- Replace the placeholder with the actual function

**Step 4: Export the function**
```javascript
// At the end of the module file
window.ImmersiveSearch = {
  init: initImmersiveSearch,
  doSearch: doSearch,
  // ... other functions
};
```

**Step 5: Remove from main file**
- Delete the function from `immersive-store.js`
- Add a comment: `// Moved to immersive/features/search.js`

**Step 6: Update references**
- Replace `initImmersiveSearch()` with `window.ImmersiveSearch.init()`

---

## 📊 Extraction Priority (Do in This Order)

### Phase 3: Core (Most Important)
1. **webgl-engine.js** - Extract WebGL/Three.js code
   - Functions: `initImmersiveScene`, `animate`, `handleResize`
   - Lines: ~200-800

2. **room-manager.js** - Extract room management
   - Functions: `goToRoom`, `loadRoomTextures`, `renderHotspots`
   - Lines: ~800-1200

3. **state-manager.js** - Extract state management
   - Functions: `saveState`, `loadState`, `writeImmersivePreference`
   - Lines: ~1-199

### Phase 4: Features (Medium Priority)
Extract these one by one:
- `search.js` - Search functionality
- `filters.js` - Filter functionality
- `fab.js` - Floating action button
- `gestures.js` - Gesture handling
- `quick-add.js` - Quick add modal
- `limited-time.js` - Countdown timers
- `room-recommender.js` - Personalization

### Phase 5: Panels (Medium Priority)
- `glass-panel.js` - Panel system
- `product-panel.js` - Product details
- `collection-panel.js` - Collection grid
- `wishlist-panel.js` - Wishlist management

### Phase 6: Editorial (Low Priority)
- `editorial-mode.js` - Editorial overlay
- `scroll-reveal.js` - Scroll animations
- `hero-parallax.js` - Hero parallax
- `timeline.js` - Timeline interactions
- `guided-mode.js` - Guided tour

---

## 🎯 Minimal Viable Refactoring (If Time is Limited)

**If you only have time for essentials, do this:**

1. ✅ **Phase 1: Dead Code Removal** (DONE)
2. ✅ **Phase 2: Extract Utilities** (30 min, automated)
3. ⏭️ **Skip Phases 3-6** (manual extraction)
4. ✅ **Phase 7: Quick Performance Wins** (1 hour, see below)
5. ⏭️ **Skip Phase 8** (testing can come later)

**Total time: 1.5 hours**
**Total credits: 0** (all manual)

---

## ⚡ Phase 7: Quick Performance Wins (No Credits)

### 1. Cache DOM References (15 minutes)

**Find repeated queries:**
```bash
grep -n "document.getElementById" assets/immersive-store.js | head -20
```

**Add cache at top of file:**
```javascript
// DOM Cache
var _domCache = {};
function getCached(id) {
  if (!_domCache[id]) {
    _domCache[id] = document.getElementById(id);
  }
  return _domCache[id];
}
```

**Replace:**
```javascript
// Before
var panel = document.getElementById('glass-panel');

// After
var panel = getCached('glass-panel');
```

### 2. Add Event Cleanup (15 minutes)

**Find event listeners:**
```bash
grep -n "addEventListener" assets/immersive-store.js | head -20
```

**Add cleanup:**
```javascript
// Store reference
panel._clickHandler = handleClick;
panel.addEventListener('click', handleClick);

// Later, on close:
if (panel._clickHandler) {
  panel.removeEventListener('click', panel._clickHandler);
  panel._clickHandler = null;
}
```

### 3. Debounce Resize (5 minutes)

**Already done!** ✅ (Check if `handleResize` is debounced)

---

## 📈 Progress Tracking

### Checklist:

- [x] Phase 1: Dead Code Removal (DONE)
- [ ] Phase 2: Extract Utilities (30 min, automated)
- [ ] Phase 3: Extract Core (2 hours, manual)
- [ ] Phase 4: Extract Features (4 hours, manual)
- [ ] Phase 5: Extract Panels (3 hours, manual)
- [ ] Phase 6: Extract Editorial (2 hours, manual)
- [ ] Phase 7: Performance Optimization (1 hour, manual)
- [ ] Phase 8: Testing & Documentation (2 hours, manual)

**Total Time: ~14 hours of manual work**

---

## 🆘 When to Use Your 150 Credits

**Save your credits for:**

1. **Debugging issues** (50 credits)
   - If something breaks after extraction
   - If tests fail unexpectedly

2. **Code review** (50 credits)
   - Review your extracted modules
   - Check for missed references

3. **Final optimization** (50 credits)
   - Performance profiling
   - Final cleanup suggestions

**Don't use credits for:**
- ❌ Running scripts (do it yourself)
- ❌ Creating files (scripts do this)
- ❌ Reading documentation (it's all written)

---

## 🎓 Learning Resources

### Grep Cheat Sheet:
```bash
# Find function definition
grep -n "^function functionName" file.js

# Find function calls
grep -n "functionName(" file.js

# Find all functions
grep -n "^function " file.js

# Count lines in a function
sed -n '/^function name/,/^}/p' file.js | wc -l
```

### Sed Cheat Sheet:
```bash
# Extract lines 100-200
sed -n '100,200p' file.js

# Delete lines 100-200
sed '100,200d' file.js

# Replace text
sed 's/oldtext/newtext/g' file.js
```

---

## ✅ Success Criteria

**You'll know you're done when:**

1. ✅ All tests pass: `npm test`
2. ✅ File size reduced: `wc -l assets/immersive-store.js` (should be <4000 lines)
3. ✅ Modules created: `ls -la assets/immersive/`
4. ✅ No console errors in browser
5. ✅ All features work in manual QA

---

## 🚀 Quick Start (Right Now)

**Do this immediately (5 minutes):**

```bash
# 1. Make scripts executable
chmod +x scripts/phase2-extract-utilities.sh
chmod +x scripts/phase3-8-mega-script.sh

# 2. Run Phase 2
bash scripts/phase2-extract-utilities.sh

# 3. Update theme.liquid (see above)

# 4. Test
npm test

# 5. Commit
git add .
git commit -m "refactor: Phase 2 complete - utilities extracted"
```

**Then take a break!** ☕

**Come back later for Phases 3-8** (manual extraction, ~14 hours total)

---

## 💡 Pro Tips

1. **Work in small batches** - Extract 1-2 functions at a time
2. **Test frequently** - Run `npm test` after each extraction
3. **Use git branches** - Create a branch per phase
4. **Keep backups** - Scripts create them automatically
5. **Don't rush** - Quality > speed

---

## 📞 Need Help?

**Use your 150 credits wisely:**

- **Stuck on extraction?** Ask me to review your code
- **Tests failing?** Ask me to debug
- **Performance issues?** Ask me to profile

**Don't ask me to:**
- Run scripts (you can do this)
- Create files (scripts do this)
- Read files (you can do this)

---

## 🎉 You've Got This!

You have everything you need:
- ✅ Automated scripts for Phase 2
- ✅ Structure generator for Phases 3-8
- ✅ Detailed extraction guide
- ✅ Performance optimization checklist
- ✅ Testing strategy

**Start with Phase 2 right now. It's fully automated!**

```bash
bash scripts/phase2-extract-utilities.sh
```

Good luck! 🚀
