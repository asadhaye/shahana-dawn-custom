# Immersive Store Code Review Report

**Date:** May 5, 2026  
**Theme:** shahana-dawn-custom  
**Focus:** Immersive 3D Store Implementation

---

## Executive Summary

The immersive store has solid foundational code with Three.js integration, room navigation, and guided mode features. However, there are **critical URL issues**, **missing collection mappings**, and **placeholder images** that need attention before full functionality.

---

## Critical Findings (Act Immediately)

| # | Finding | File:Line | Impact |
|---|---------|-----------|--------|
| 1 | Malformed CDN URLs - `v=1775510548=85` should be `v=1775510548&width=85` | `assets/immersive-store.js:76-79` | Designer houses room images won't load |
| 2 | 9 out of 10 collection handles don't exist in store | `assets/immersive-store.js:82-119` | Hotspot clicks lead to 404 pages |
| 3 | Placeholder image URL in production | `assets/immersive-store.js:111` | Shows random placeholder image on mobile |

---

## High Priority

| # | Finding | File:Line | Impact |
|---|---------|-----------|--------|
| 4 | ExitGuidedMode fix not deployed | `assets/immersive-store.js:2119` | Console error persists on preview |
| 5 | Multiple placeholder images in Liquid | `sections/immersive-editorial.liquid:33,78,82,173,256` | Editorial content shows test images |
| 6 | Featured collections room depth maps use brand.png | `assets/immersive-store.js:114-115` | Wrong depth map for room |

---

## Medium Priority

| # | Finding | File:Line | Impact |
|---|---------|-----------|--------|
| 7 | No fallback when collection doesn't exist | `assets/immersive-store.js` | Silent failure on collection hotspots |
| 8 | Hardcoded store ID (0594/0435/3692) | Multiple locations | May need parametrization for multi-store |

---

## Details

### 1. Malformed CDN URLs (CRITICAL)

**Location:** `assets/immersive-store.js:76-79`

```javascript
// BROKEN - missing &width= before quality value
baseTextureUrl: 'https://cdn.shopify.com/.../designer-d-base.jpg?v=1775510548=85'
mobileBaseTextureUrl: 'https://cdn.shopify.com/.../designer-m-base.jpg?v=1775516126=75'
depthMapUrl: 'https://cdn.shopify.com/.../designer-d-depth.webp?v=1775510548=70'
mobileDepthMapUrl: 'https://cdn.shopify.com/.../designer-m-depth.png?v=1775516123=70'

// SHOULD BE
baseTextureUrl: 'https://cdn.shopify.com/.../designer-d-base.jpg?v=1775510548&width=1600'
```

**Impact:** Designer Houses room will fail to load background images.

---

### 2. Missing Collection Handles (CRITICAL)

**Verified in store:** Only `suffuse` collection exists.

| Hotspot Label | targetCollection | Exists? |
|---------------|------------------|---------|
| Suffuse | suffuse | YES |
| Soraya | soraya | NO |
| Saad Bin Shahzad | saad-bin-shahzad | NO |
| Eid Collection | eid-collection | NO |
| Bidal & Mehndi | bridal-mehndi | NO |
| Luxury Formals | luxury-formals | NO |
| Casual Pret | casual-pret | NO |
| SS5 Summer Pret 26 | summer-pret-26-eid-edit-saad-bin-shahzad | NO |
| Suffuse Luxury Pret | luxury-pret-suffuse | NO |
| Soraya Eid Pret | lumene-festive-25-26-soraya-official | NO |

**Impact:** 9 out of 10 collection hotspots will show 404 pages.

---

### 3. Placeholder Images (HIGH)

**Location:** `assets/immersive-store.js:111`

```javascript
mobileBaseTextureUrl: 'https://picsum.photos/id/1080/900/1600',
```

This should be replaced with a real Shopify CDN asset.

---

### 4. ExitGuidedMode Not Deployed

The fix is in local code at `assets/immersive-store.js:2119` but not yet deployed to preview/production.

---

## Recommended Actions

### Immediate (Before Launch)

1. **Fix malformed URLs** in `designer_houses` room config (lines 76-79)
2. **Update collection handles** to point to real collections in store
3. **Replace placeholder** `picsum.photos` URL on line 111
4. **Deploy** `exitGuidedMode` and `activateGuidedMode` fixes

### Before Production

5. Replace all `picsum.photos` placeholders in `immersive-editorial.liquid`
6. Add graceful fallback for missing collections
7. Verify all 5 room backgrounds load correctly

---

## Files Reviewed

- `assets/immersive-store.js` (2497 lines)
- `sections/immersive-canvas.liquid`
- `sections/immersive-editorial.liquid`
- `sections/immersive-exclusive-carousel.liquid`
- `sections/immersive-gallery.liquid`
- `sections/immersive-codex.liquid`

---

## Positive Findings

- Three.js compatibility shims for r150+ (lines 1-32)
- Proper room state management with STORE_ROOMS config
- Guided mode implementation complete
- Fallback content for failed overlay fetches
- Reduced motion accessibility support (line 2247)