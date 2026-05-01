# Efficient Execution Plan: Phases 2-8 (Minimum Credits)

## Strategy for Minimal Credit Usage

### Key Principles:
1. **Batch operations** - Create multiple files in one go
2. **Use scripts** - Automate extraction with bash/node scripts
3. **Minimize file reads** - Read once, extract multiple times
4. **Skip redundant verification** - Trust automated tests
5. **Use templates** - Generate boilerplate programmatically

---

## Phase 2: Extract Utilities (2 hours → 30 minutes)

### Efficient Approach: Single Extraction Script

**Create one script that does everything:**

```bash
# scripts/phase2-extract-utilities.sh
# - Reads immersive-store.js once
# - Extracts 4 utility modules
# - Updates main file with imports
# - Runs tests automatically
```

**Steps:**
1. Create extraction script (1 file write)
2. Run script (1 command)
3. Verify tests pass (1 command)
4. Commit (1 command)

**Total Operations:** ~4 (vs 20+ manual operations)

---

## Phase 3: Extract WebGL Engine (1 day → 2 hours)

### Efficient Approach: Automated Module Extraction

**Create extraction script with line ranges:**

```bash
# scripts/phase3-extract-webgl.sh
# - Extract lines 200-800 → webgl-engine.js
# - Extract lines 801-1200 → room-manager.js
# - Extract lines 1-199 → state-manager.js
# - Update imports automatically
```

**Steps:**
1. Create extraction script (1 file write)
2. Run script (1 command)
3. Run tests (1 command)
4. Visual regression test (1 command)
5. Commit (1 command)

**Total Operations:** ~5 (vs 30+ manual operations)

---

## Phase 4: Extract Features (3 days → 4 hours)

### Efficient Approach: Parallel Feature Extraction

**Create one script per feature, run in parallel:**

```bash
# scripts/phase4-extract-features.sh
# Extracts all 7 features in parallel:
# - search.js
# - filters.js
# - fab.js
# - gestures.js
# - quick-add.js
# - limited-time.js
# - room-recommender.js
```

**Steps:**
1. Create extraction script (1 file write)
2. Run script (1 command)
3. Run tests (1 command)
4. Commit (1 command)

**Total Operations:** ~4 (vs 50+ manual operations)

---

## Phase 5: Extract Panels (2 days → 3 hours)

### Efficient Approach: Panel Extraction Script

```bash
# scripts/phase5-extract-panels.sh
# Extracts 4 panel modules:
# - glass-panel.js
# - product-panel.js
# - collection-panel.js
# - wishlist-panel.js
```

**Steps:**
1. Create extraction script (1 file write)
2. Run script (1 command)
3. Run tests (1 command)
4. Commit (1 command)

**Total Operations:** ~4 (vs 40+ manual operations)

---

## Phase 6: Extract Editorial & Guided (2 days → 2 hours)

### Efficient Approach: Editorial Extraction Script

```bash
# scripts/phase6-extract-editorial.sh
# Extracts 5 editorial modules
```

**Steps:**
1. Create extraction script (1 file write)
2. Run script (1 command)
3. Run tests (1 command)
4. Commit (1 command)

**Total Operations:** ~4 (vs 30+ manual operations)

---

## Phase 7: Performance Optimization (1 week → 1 day)

### Efficient Approach: Automated Performance Fixes

**Create optimization script:**

```bash
# scripts/phase7-optimize.sh
# - Cache DOM references (regex replacements)
# - Batch layout operations (AST transformation)
# - Add event cleanup (pattern matching)
# - Lazy load features (dynamic imports)
```

**Steps:**
1. Create optimization script (1 file write)
2. Run script (1 command)
3. Run benchmarks (1 command)
4. Commit (1 command)

**Total Operations:** ~4 (vs 100+ manual operations)

---

## Phase 8: Testing & Documentation (1 week → 2 days)

### Efficient Approach: Test Generation Script

**Create test generator:**

```bash
# scripts/phase8-generate-tests.sh
# - Scans all modules
# - Generates unit test templates
# - Generates JSDoc comments
# - Updates README
```

**Steps:**
1. Create test generator (1 file write)
2. Run generator (1 command)
3. Fill in test assertions (manual, but templated)
4. Run tests (1 command)
5. Commit (1 command)

**Total Operations:** ~5 + manual test writing

---

## Credit Usage Comparison

### Manual Approach (High Credits):
| Phase | Operations | Estimated Credits |
|-------|-----------|------------------|
| Phase 2 | 20+ file reads/writes | 500+ |
| Phase 3 | 30+ file reads/writes | 800+ |
| Phase 4 | 50+ file reads/writes | 1200+ |
| Phase 5 | 40+ file reads/writes | 1000+ |
| Phase 6 | 30+ file reads/writes | 800+ |
| Phase 7 | 100+ file reads/writes | 2500+ |
| Phase 8 | 50+ file reads/writes | 1200+ |
| **Total** | **320+** | **8000+** |

### Automated Approach (Low Credits):
| Phase | Operations | Estimated Credits |
|-------|-----------|------------------|
| Phase 2 | 4 operations | 50 |
| Phase 3 | 5 operations | 60 |
| Phase 4 | 4 operations | 50 |
| Phase 5 | 4 operations | 50 |
| Phase 6 | 4 operations | 50 |
| Phase 7 | 4 operations | 50 |
| Phase 8 | 5 operations | 60 |
| **Total** | **30** | **370** |

**Savings: ~95% fewer credits** (370 vs 8000)

---

## Implementation Strategy

### Option A: All-in-One Mega Script (Fastest, Riskiest)
```bash
# scripts/refactor-all-phases.sh
# Runs phases 2-7 in sequence
# Total time: 4 hours
# Total operations: ~20
```

**Pros:**
- Minimal credits (~200)
- Fastest execution
- One commit

**Cons:**
- Hard to debug if something breaks
- No incremental testing
- All-or-nothing approach

---

### Option B: Phase-by-Phase Scripts (Recommended)
```bash
# Run each phase script separately
bash scripts/phase2-extract-utilities.sh
npm test && git commit -m "Phase 2 complete"

bash scripts/phase3-extract-webgl.sh
npm test && git commit -m "Phase 3 complete"

# ... etc
```

**Pros:**
- Incremental progress
- Easy to debug
- Can stop/resume anytime
- Safe rollback per phase

**Cons:**
- Slightly more credits (~370)
- More commits

---

### Option C: Hybrid Approach (Best Balance)
```bash
# Group low-risk phases together
bash scripts/phase2-4-extract-all.sh  # Utilities + Features
npm test && git commit -m "Phases 2-4 complete"

bash scripts/phase5-6-extract-panels-editorial.sh
npm test && git commit -m "Phases 5-6 complete"

bash scripts/phase7-optimize.sh
npm test && git commit -m "Phase 7 complete"

bash scripts/phase8-generate-tests.sh
npm test && git commit -m "Phase 8 complete"
```

**Pros:**
- Good balance of speed and safety
- Moderate credits (~250)
- Logical grouping
- 4 commits (clean history)

**Cons:**
- Slightly more complex scripts

---

## Recommended Execution Order

### Week 1: Extraction (Phases 2-6)
**Day 1:** Create all extraction scripts (1 session, ~100 credits)
**Day 2:** Run Phase 2-4 script, test, commit (1 session, ~50 credits)
**Day 3:** Run Phase 5-6 script, test, commit (1 session, ~50 credits)

### Week 2: Optimization & Testing (Phases 7-8)
**Day 4:** Create optimization script (1 session, ~50 credits)
**Day 5:** Run optimization, benchmark, commit (1 session, ~50 credits)
**Day 6:** Create test generator (1 session, ~50 credits)
**Day 7:** Generate tests, fill assertions, commit (1 session, ~50 credits)

**Total Credits: ~400**
**Total Time: 7 days (vs 3-4 weeks manual)**

---

## Next Steps

### Immediate Action:
```bash
# Create the extraction scripts directory
mkdir -p scripts/refactoring

# Start with Phase 2 script
# I'll create a smart extraction script that:
# 1. Reads immersive-store.js once
# 2. Extracts utilities based on function names
# 3. Creates module files
# 4. Updates imports
# 5. Runs tests
```

### What You Need to Decide:

**Choose your approach:**
- [ ] **Option A:** All-in-one mega script (fastest, riskiest)
- [ ] **Option B:** Phase-by-phase scripts (safest, recommended)
- [ ] **Option C:** Hybrid approach (best balance)

**Choose your pace:**
- [ ] **Aggressive:** All phases in 1 week (~400 credits)
- [ ] **Moderate:** One phase per week (~50 credits/week)
- [ ] **Conservative:** Manual review between phases (~100 credits/week)

---

## Script Templates

### Template: Extraction Script Structure
```bash
#!/bin/bash
# Phase X: Extract [Module Name]

set -e

SOURCE="assets/immersive-store.js"
BACKUP="assets/immersive-store.js.backup.$(date +%Y%m%d_%H%M%S)"
TARGET_DIR="assets/immersive"

# 1. Create backup
cp "$SOURCE" "$BACKUP"

# 2. Extract functions by pattern
extract_function() {
  local func_name="$1"
  local output_file="$2"
  
  # Use sed/awk to extract function
  sed -n "/^function $func_name/,/^}/p" "$SOURCE" >> "$output_file"
}

# 3. Create module files
mkdir -p "$TARGET_DIR/utils"
echo "// Extracted utilities" > "$TARGET_DIR/utils/fetch.js"

# 4. Extract each function
extract_function "fetchWithCache" "$TARGET_DIR/utils/fetch.js"
extract_function "fetchSectionHtml" "$TARGET_DIR/utils/fetch.js"

# 5. Add module exports
echo "window.ImmersiveFetch = { fetchWithCache, fetchSectionHtml };" >> "$TARGET_DIR/utils/fetch.js"

# 6. Remove from source (mark as extracted)
sed -i.bak '/^function fetchWithCache/,/^}/d' "$SOURCE"

# 7. Add import to source
sed -i.bak '1i\
// Utilities extracted to modules\
' "$SOURCE"

# 8. Run tests
npm test

echo "✅ Phase X complete"
```

---

## Cost-Benefit Analysis

### Manual Refactoring:
- **Time:** 3-4 weeks
- **Credits:** ~8,000
- **Risk:** High (human error)
- **Reversibility:** Difficult

### Automated Refactoring:
- **Time:** 1-2 weeks
- **Credits:** ~400
- **Risk:** Low (scripted, tested)
- **Reversibility:** Easy (backups)

**ROI: 20x better** (time + credits + risk)

---

## Ready to Start?

Tell me which option you prefer, and I'll create the scripts:

1. **Option A** - All-in-one mega script
2. **Option B** - Phase-by-phase scripts (recommended)
3. **Option C** - Hybrid approach

Or just say "start phase 2" and I'll use Option B (safest).
