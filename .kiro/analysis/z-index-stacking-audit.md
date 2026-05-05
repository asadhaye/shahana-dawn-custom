# Z-Index and Stacking Context Audit

**Date**: May 5, 2026  
**Scope**: Immersive Store Subsystem  
**Status**: 🔴 Critical Issues Found

---

## Executive Summary

The immersive store has **significant z-index management issues** with inconsistent layering, overlapping ranges, and no clear hierarchy. This audit identifies 31+ z-index declarations across 6 files with values ranging from -1 to 9999.

### Critical Issues

1. **No Z-Index Scale**: Values are arbitrary (50, 90, 105, 120, 300, 310, 320, 1100, 9000, 9100, 9999)
2. **Overlapping Ranges**: Multiple fixed elements compete in the 300-320 range
3. **Extreme Values**: Cookie banner (9100) and fly token (9999) are unnecessarily high
4. **Inconsistent Patterns**: No naming convention or logical grouping
5. **Stacking Context Conflicts**: Multiple elements with `transform`, `filter`, `opacity` create isolated contexts

---

## Current Z-Index Inventory

### File: `sections/immersive-canvas.liquid` (15 declarations)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.immersive-store__room-badge` | 50 | absolute | Room name display | ⚠️ Same as FAB buttons |
| `.immersive-store__room-badge-name` | 5 | relative | Badge text | ✅ Local context |
| `.immersive-store__canvas-wrapper` | 2 | fixed | Canvas container | ⚠️ Low for fixed element |
| `.immersive-store__logo` | 19 | relative | Logo in header | ⚠️ Odd number, no pattern |
| `.immersive-header` | 310 | fixed | Main header | 🔴 Conflicts with notification bar (320) |
| `.immersive-header__search-overlay` | 90 | fixed | Search overlay | ⚠️ Lower than header (310) |
| `.immersive-hotspots` | 300 | fixed | Clickable hotspots | 🔴 Same as glass panel |
| `.immersive-glass-panel::before` | -1 | absolute | Frosted glass effect | ✅ Behind parent |
| `.immersive-glass-panel` | 300 | fixed | Collection/product panel | 🔴 Same as hotspots |
| `.immersive-search-panel` | 105 | fixed | Search results panel | ⚠️ Between header and glass panel |
| `.immersive-header__back-btn` | 120 | fixed | Back navigation button | ⚠️ Higher than header (310)? |
| `.immersive-wishlist-panel` | 1100 | fixed | Wishlist panel | 🔴 Extremely high, no justification |
| `.immersive-fly-token` | 9999 | fixed | Token animation | 🔴 Unnecessarily extreme |
| `.immersive-bottom-nav__button-label` | 50 | absolute | FAB button labels | ⚠️ Same as room badge |
| `.immersive-cookie-banner` | 9100 | fixed | Cookie consent | 🔴 Extremely high |

### File: `sections/immersive-notification-bar.liquid` (2 declarations)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.immersive-notification-bar` | 320 | fixed | Top notification bar | 🔴 Higher than header (310) |
| `.immersive-notification-bar__shimmer` | 3 | absolute | Shimmer effect | ✅ Local context |

### File: `sections/immersive-editorial.liquid` (10 declarations)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.immersive-designers__hero` | 1 | relative | Hero section | ✅ Local context |
| `.immersive-designers__hero-content` | 2 | relative | Hero content | ✅ Local context |
| `.immersive-designers__hero-image` | 0 | absolute | Hero background | ✅ Behind content |
| `.immersive-editorial__hero-panel` | 1 | relative | Editorial panel | ✅ Local context |
| `.immersive-editorial__nav` | 10 | sticky | Sticky navigation | ⚠️ May conflict with other sticky elements |
| `.immersive-editorial__nav-item` | 1 | relative | Nav item | ✅ Local context |
| `.immersive-editorial__nav-indicator` | 2 | absolute | Active indicator | ✅ Local context |
| `.immersive-editorial__content-fade` | 2 | absolute | Fade overlay | ✅ Local context |
| `.immersive-editorial__cta` | 10 | relative | Call-to-action button | ⚠️ Same as sticky nav |
| `.immersive-editorial__gallery-nav-btn` | 10 | absolute | Gallery nav button | ⚠️ Same as sticky nav |
| `.immersive-editorial__gallery-fade` | 2 | absolute | Gallery fade | ✅ Local context |

### File: `snippets/immersive-product-card.liquid` (3 declarations)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.immersive-product-card__add-btn` | 2 | relative | Add to cart button | ✅ Local context |
| `.immersive-product-card__badge` | 5 | absolute | Product badge | ✅ Local context |
| `.immersive-product-card__wishlist-btn` | 3 | absolute | Wishlist button | ✅ Local context |

### File: `sections/codex-typo-index.liquid` (1 declaration)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.codex-typo-index__tooltip` | 10 | absolute | Tooltip overlay | ⚠️ May conflict with editorial nav |

### File: `layout/theme.liquid` (1 declaration)

| Element | Z-Index | Position | Purpose | Issues |
|---------|---------|----------|---------|--------|
| `.immersive-preference-banner` | 9000 | fixed | 2D/3D preference banner | 🔴 Extremely high |

---

## Stacking Context Analysis

### Elements Creating New Stacking Contexts

These elements create **isolated stacking contexts** where child z-index values only compete within their parent:

1. **Transform-based contexts**:
   - `.immersive-store__room-badge` (transform: translateX)
   - `.immersive-preference-banner` (transform: translateX)
   - `.immersive-header__back-btn` (likely has transform)
   - All elements with `transform: translate*`

2. **Filter-based contexts**:
   - `.immersive-header` (backdrop-filter: blur)
   - `.immersive-glass-panel` (backdrop-filter: blur)
   - `.immersive-preference-banner` (backdrop-filter: blur)
   - `.immersive-notification-bar` (backdrop-filter: blur)

3. **Opacity-based contexts**:
   - `.immersive-search-panel` (opacity transitions)
   - `.immersive-wishlist-panel` (opacity transitions)
   - Multiple elements with `opacity < 1`

4. **Position: fixed/sticky**:
   - All fixed elements create stacking contexts
   - `.immersive-editorial__nav` (position: sticky)

---

## Critical Conflicts

### 🔴 Conflict 1: Header vs Notification Bar
- **Header**: z-index 310
- **Notification Bar**: z-index 320
- **Issue**: Notification bar appears above header, but both are fixed at top
- **Impact**: Visual hierarchy unclear, may cause click-through issues

### 🔴 Conflict 2: Hotspots vs Glass Panel
- **Hotspots**: z-index 300
- **Glass Panel**: z-index 300
- **Issue**: Same z-index, order depends on DOM position
- **Impact**: Unpredictable layering, potential click-through issues

### 🔴 Conflict 3: Extreme Values
- **Wishlist Panel**: z-index 1100
- **Preference Banner**: z-index 9000
- **Cookie Banner**: z-index 9100
- **Fly Token**: z-index 9999
- **Issue**: No justification for such high values
- **Impact**: Makes it impossible to layer elements above them if needed

### ⚠️ Conflict 4: Back Button Position
- **Back Button**: z-index 120
- **Header**: z-index 310
- **Issue**: Back button is lower than header but should be above it
- **Impact**: May be hidden behind header elements

### ⚠️ Conflict 5: Search Overlay Position
- **Search Overlay**: z-index 90
- **Header**: z-index 310
- **Issue**: Search overlay is lower than header
- **Impact**: May not properly overlay header when active

---

## Recommended Z-Index Scale

### Proposed Hierarchy (0-1000 scale)

```css
/* 0-99: Base Content Layer */
--z-canvas-wrapper: 1;           /* Canvas container */
--z-content-base: 10;            /* Default content */
--z-content-elevated: 20;        /* Elevated content (cards, etc.) */

/* 100-199: UI Layer */
--z-room-badge: 100;             /* Room name badge */
--z-hotspots: 110;               /* Interactive hotspots */
--z-fab-labels: 120;             /* FAB button labels */

/* 200-299: Overlays */
--z-search-overlay: 200;         /* Search overlay background */
--z-search-panel: 210;           /* Search results panel */

/* 300-399: Fixed UI Elements */
--z-header: 300;                 /* Main header */
--z-notification-bar: 310;       /* Notification bar (above header) */
--z-back-button: 320;            /* Back button (above header) */

/* 400-499: Panels */
--z-glass-panel: 400;            /* Collection/product panel */
--z-wishlist-panel: 410;         /* Wishlist panel */

/* 500-599: Modals */
--z-modal-backdrop: 500;         /* Modal backdrop */
--z-modal-content: 510;          /* Modal content */

/* 600-699: System UI */
--z-preference-banner: 600;      /* 2D/3D preference banner */
--z-cookie-banner: 610;          /* Cookie consent banner */

/* 700-799: Animations & Effects */
--z-fly-token: 700;              /* Token fly animation */
--z-tooltip: 710;                /* Tooltips */

/* 800-899: Debug & Dev Tools */
--z-debug-overlay: 800;          /* Debug overlays */

/* 900-999: Emergency Override (use sparingly) */
--z-critical-alert: 900;         /* Critical alerts only */
```

---

## Implementation Plan

### Phase 1: Define CSS Custom Properties (1 hour)

**File**: `sections/immersive-canvas.liquid` → Add to `<style>` block

```css
:root {
  /* Z-Index Scale */
  --z-canvas-wrapper: 1;
  --z-content-base: 10;
  --z-content-elevated: 20;
  --z-room-badge: 100;
  --z-hotspots: 110;
  --z-fab-labels: 120;
  --z-search-overlay: 200;
  --z-search-panel: 210;
  --z-header: 300;
  --z-notification-bar: 310;
  --z-back-button: 320;
  --z-glass-panel: 400;
  --z-wishlist-panel: 410;
  --z-modal-backdrop: 500;
  --z-modal-content: 510;
  --z-preference-banner: 600;
  --z-cookie-banner: 610;
  --z-fly-token: 700;
  --z-tooltip: 710;
}
```

### Phase 2: Update Immersive Canvas (2 hours)

**File**: `sections/immersive-canvas.liquid`

Replace all z-index declarations:

```css
/* Before */
.immersive-header { z-index: 310; }

/* After */
.immersive-header { z-index: var(--z-header); }
```

**Changes**:
- `.immersive-store__canvas-wrapper`: 2 → `var(--z-canvas-wrapper)` (1)
- `.immersive-store__logo`: 19 → `var(--z-content-elevated)` (20)
- `.immersive-header`: 310 → `var(--z-header)` (300)
- `.immersive-header__search-overlay`: 90 → `var(--z-search-overlay)` (200)
- `.immersive-hotspots`: 300 → `var(--z-hotspots)` (110)
- `.immersive-glass-panel`: 300 → `var(--z-glass-panel)` (400)
- `.immersive-search-panel`: 105 → `var(--z-search-panel)` (210)
- `.immersive-header__back-btn`: 120 → `var(--z-back-button)` (320)
- `.immersive-wishlist-panel`: 1100 → `var(--z-wishlist-panel)` (410)
- `.immersive-fly-token`: 9999 → `var(--z-fly-token)` (700)
- `.immersive-cookie-banner`: 9100 → `var(--z-cookie-banner)` (610)
- `.immersive-store__room-badge`: 50 → `var(--z-room-badge)` (100)
- `.immersive-bottom-nav__button-label`: 50 → `var(--z-fab-labels)` (120)

### Phase 3: Update Notification Bar (30 min)

**File**: `sections/immersive-notification-bar.liquid`

```css
.immersive-notification-bar {
  z-index: var(--z-notification-bar); /* 310 */
}
```

### Phase 4: Update Editorial Sections (30 min)

**File**: `sections/immersive-editorial.liquid`

```css
.immersive-editorial__nav {
  z-index: var(--z-content-elevated); /* 20 - sticky nav */
}

.codex-typo-index__tooltip {
  z-index: var(--z-tooltip); /* 710 */
}
```

### Phase 5: Update Theme Layout (30 min)

**File**: `layout/theme.liquid`

```css
.immersive-preference-banner {
  z-index: var(--z-preference-banner); /* 600 */
}
```

### Phase 6: Testing (2 hours)

**Test Cases**:
1. ✅ Header appears above canvas
2. ✅ Notification bar appears above header
3. ✅ Back button appears above header
4. ✅ Glass panel appears above hotspots
5. ✅ Wishlist panel appears above glass panel
6. ✅ Search overlay appears above canvas but below header
7. ✅ Search panel appears above search overlay
8. ✅ Preference banner appears above all panels
9. ✅ Cookie banner appears above preference banner
10. ✅ Fly token animation appears above content but below system UI

**Browser Testing**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## Benefits of Proposed Scale

1. **Predictable Hierarchy**: Clear 100-point increments for major layers
2. **Room for Growth**: Space between layers for future additions
3. **Semantic Naming**: CSS custom properties describe purpose
4. **Easy Maintenance**: Single source of truth for z-index values
5. **No Extreme Values**: Maximum z-index is 900 (vs current 9999)
6. **Conflict Resolution**: Clear separation between competing elements

---

## Migration Risks

### Low Risk
- Local z-index contexts (product cards, editorial sections) - already isolated
- Elements with clear hierarchy (backdrop → content)

### Medium Risk
- Fixed elements (header, panels) - need careful testing
- Transform-based elements - may create unexpected stacking contexts

### High Risk
- Glass panel vs hotspots - currently same z-index, need to verify click behavior
- Search overlay vs header - need to verify overlay covers header correctly
- Back button position - need to verify it appears above header

---

## Rollback Plan

If issues arise:

1. **Quick Rollback**: Revert CSS custom property values to original numbers
2. **Partial Rollback**: Keep scale but adjust specific values
3. **Full Rollback**: Remove CSS custom properties, restore inline values

---

## Next Steps

1. ✅ Review this audit with team
2. ⏳ Get approval for proposed z-index scale
3. ⏳ Implement Phase 1 (CSS custom properties)
4. ⏳ Implement Phases 2-5 (update all files)
5. ⏳ Perform Phase 6 testing
6. ⏳ Deploy to staging
7. ⏳ QA on staging
8. ⏳ Deploy to production

---

## Additional Recommendations

### 1. Document Stacking Context Rules

Add to developer documentation:

```markdown
## Z-Index Guidelines

1. Always use CSS custom properties (--z-*) instead of hardcoded values
2. Never use z-index > 900 without team approval
3. Prefer DOM order over z-index when possible
4. Be aware of stacking context creation (transform, filter, opacity, position)
5. Test z-index changes across all browsers
```

### 2. Add Linting Rules

Consider adding CSS linting to catch:
- Hardcoded z-index values (should use custom properties)
- Z-index values > 900
- Duplicate z-index values on fixed/absolute elements

### 3. Visual Debugging Tool

Create a debug mode that shows z-index values on hover:

```javascript
if (window.__IMMERSIVE_DEV__) {
  document.querySelectorAll('[style*="z-index"], [class*="z-"]').forEach(el => {
    const zIndex = window.getComputedStyle(el).zIndex;
    if (zIndex !== 'auto') {
      el.title = `z-index: ${zIndex}`;
    }
  });
}
```

---

## Conclusion

The current z-index system is **unmanageable and error-prone**. The proposed scale provides:
- Clear hierarchy (0-900 range)
- Semantic naming (CSS custom properties)
- Room for growth (100-point increments)
- Easy maintenance (single source of truth)

**Estimated Implementation Time**: 6-7 hours  
**Risk Level**: Medium (requires thorough testing)  
**Priority**: High (prevents future layering bugs)

---

**Audit Completed By**: Kiro AI  
**Date**: May 5, 2026  
**Status**: Awaiting Approval
