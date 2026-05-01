# assets/immersive/core/room-manager.js — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: `STORE_ROOMS` declaration — `var` → `const`, null placeholders → real CDN URLs

### launch-readiness-fixes
```javascript
/**
 * STORE_ROOMS — Default room configuration
 * These are fallback defaults. Merchant-configured images from the theme editor
 * (immersive-rooms-config JSON) will override these values.
 * Merchants can customize: base images, depth maps, collection hotspots, room mood colors
 */
var STORE_ROOMS = {
  storefront: {
    baseTextureUrl: null,        // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0a0f', blob1: '#1a1025', blob2: '#0d0d1a' },
    hotspots: [ ... ]
  },
  lounge: {
    baseTextureUrl: null,
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0f0a08', blob1: '#2a1a10', blob2: '#1a0f0a' },
    hotspots: [ ... ]
  },
  designer_houses: {
    baseTextureUrl: null,
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#080a12', blob1: '#101828', blob2: '#0a1020' },
    hotspots: [
      { x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' },
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 90, label: 'Back to lounge', targetRoom: 'lounge' },
    ]
  },
  occasions: {
    baseTextureUrl: null,
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0810', blob1: '#1e1028', blob2: '#120a1e' },
    hotspots: [
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
    ]
  },
  featured_collections: {
    baseTextureUrl: null,
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0a08', blob1: '#1e1e10', blob2: '#140408' },
    hotspots: [
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ]
  }
};
```

### main
```javascript
const STORE_ROOMS = {
  storefront: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-d-base.webp?v=1774971846&width=1600&quality=75',
    mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-m-base.webp?v=1774971846&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-d-depth.webp?v=1774971845&width=1600&quality=60',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-m-depth.webp?v=1774971846&width=900&quality=60',
    hotspots: [ ... ]
  },
  lounge: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/Lounge-Base-flow.jpg?v=1775054500&width=1600&quality=75',
    mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-m-base.jpg?v=1775054009&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-depthmap-Grayscale.png?v=1775054498&width=1600&quality=60',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-m-depth-greyscale.png?v=1775054007&width=900&quality=60',
    hotspots: [ ... ]
  },
  designer_houses: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-base.jpg?v=1775510548=85',
    mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-base.jpg?v=1775516126=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-depth.webp?v=1775510548=70',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-depth.png?v=1775516123=70',
    hotspots: [
      { x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' },
      { x: 13, y: 40, label: 'Suffuse', targetCollection: 'suffuse' },
      { x: 50, y: 45, label: 'Soraya', targetCollection: 'soraya' },
      { x: 87, y: 40, label: 'Saad Bin Shahzad', targetCollection: 'saad-bin-shahzad' },
      { x: 50, y: 90, label: 'Back to lounge', targetRoom: 'lounge' },
    ]
  },
  occasions: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah.png?v=1775312813&width=1600&quality=75',
    mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah.png?v=1775312813&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah-depth-map.png?v=1776515933',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah-depth-map.png?v=1776515933',
    hotspots: [
      { x: 25, y: 40, label: 'Eid Collection', targetCollection: 'eid-collection' },
      { x: 42, y: 50, label: 'Bridal & Mehndi', targetCollection: 'bridal-mehndi' },
      { x: 58, y: 40, label: 'Luxury Formals', targetCollection: 'luxury-formals' },
      { x: 75, y: 50, label: 'Casual Pret', targetCollection: 'casual-pret' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
    ]
  },
  featured_collections: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-base.jpg?v=1772037254&width=1600&quality=75',
    mobileBaseTextureUrl: 'https://picsum.photos/id/1080/900/1600',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261&width=1600&quality=60',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=900&quality=60',
    hotspots: [
      { x: 25, y: 40, label: 'SS5 Summer Pret 26', targetCollection: 'summer-pret-26-eid-edit-saad-bin-shahzad' },
      { x: 50, y: 50, label: 'Suffuse Luxury Pret', targetCollection: 'luxury-pret-suffuse' },
      { x: 75, y: 40, label: 'Soraya Eid Pret', targetCollection: 'lumene-festive-25-26-soraya-official' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ]
  }
};
```

**Impact:**
- `var` → `const` (minor style change)
- All `null` texture URLs replaced with real Shopify CDN URLs
- `mood` objects removed from all rooms (atmosphere system removed)
- Collection hotspots hardcoded for `designer_houses`, `occasions`, `featured_collections` (previously merchant-configurable via theme editor)
- ⚠️ `featured_collections` mobile base uses a placeholder `picsum.photos` URL — needs replacing with real asset

---

## Change 2: `goToRoom()` — atmosphere/mood handoff removed

### launch-readiness-fixes (removed in main)
```javascript
// [NEW] Mood palette handoff and entry drift — skip on initial load
if (!initial) {
  var mood = STORE_ROOMS[roomKey] && STORE_ROOMS[roomKey].mood;
  if (mood && typeof ImmersiveAtmosphere !== 'undefined') {
    ImmersiveAtmosphere.setNextMood(mood);
  }
  if (!reduceMotion) {
    driftTarget = fromBack ? -0.04 : 0.04;
  } else {
    driftTarget = 0;
    driftCurrent = 0;
  }
}
```

**Impact:** `ImmersiveAtmosphere` integration and entry drift removed. The `atmosphere.js` module is no longer loaded.

---

## Change 3: `_startRoomTextureLoad()` — atmosphere snap and drift reset removed

### launch-readiness-fixes (removed in main)
```javascript
// [NEW] Snap colour uniforms and reset drift on crossfade completion
if (typeof ImmersiveAtmosphere !== 'undefined') {
  ImmersiveAtmosphere.snapCurrentToNext(uniforms);
}
driftTarget = 0;
```

---

## Change 4: `navigateBack()` — panel-close-first logic inverted

### launch-readiness-fixes
```javascript
function navigateBack() {
  // If a panel is open, close it and stay in the current room
  var glassPanel = document.getElementById('glass-panel');
  if (glassPanel && !glassPanel.hidden) {
    closePanel(glassPanel, 'back_button');
    return; // don't navigate — let the user see the room they're in
  }

  // No panel open — navigate to previous room
  if (!immersiveState.navigationStack || immersiveState.navigationStack.length === 0) {
    console.warn('[Immersive] Cannot navigate back: navigation stack is empty');
    return;
  }
  // Pop previous room from stack
  var previousRoom = immersiveState.navigationStack.pop();
  ...
}
```

### main
```javascript
function navigateBack() {
  // Check if navigation stack is empty
  if (!immersiveState.navigationStack || immersiveState.navigationStack.length === 0) {
    console.warn('[Immersive] Cannot navigate back: navigation stack is empty');
    return;
  }

  // Close any open panels before navigating back
  var glassPanel = document.getElementById('glass-panel');
  if (glassPanel && !glassPanel.hidden) {
    closePanel(glassPanel, 'back_button');
  }

  // Pop previous room from stack
  var previousRoom = immersiveState.navigationStack.pop();
  ...
}
```

**Impact:** Behaviour change — in `launch-readiness-fixes`, pressing back when a panel is open closes the panel and stays in the room (two-press back). In `main`, pressing back closes the panel AND navigates to the previous room in the same action.
