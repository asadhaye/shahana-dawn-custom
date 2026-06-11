/**
 * immersive-core.js — Shahana Dawn Immersive Store
 * Core module: WebGL rendering, room navigation, state management,
 * panel system, product/collection panels, wishlist, and event tracking.
 *
 * This file MUST load before immersive-features.js.
 * Both files replace the former monolithic immersive-store.js.
 */

// No-op stub for analytics tracking (may be overridden by external analytics)
if (typeof window.trackImmersiveEvent === 'undefined') {
  window.trackImmersiveEvent = function () {};
}

/* IMMERSIVE_THREE.JS_COMPATIBILITY
 * Shim for backwards compatibility with three.js r150–r170+.
 */
(function () {
  if (typeof THREE === 'undefined') return;

  // Encoding shims - sRGBEncoding was renamed to SRGBColorSpace in r152+
  if (!THREE.SRGBColorSpace && THREE.sRGBEncoding) {
    THREE.SRGBColorSpace = THREE.sRGBEncoding;
  }

  // LinearEncoding was renamed in later versions
  if (!THREE.LinearEncoding) {
    THREE.LinearEncoding = 3001;
  }

  // LinearFilter should always exist, but just in case
  if (!THREE.LinearFilter) {
    THREE.LinearFilter = 9728;
  }

  // MathUtils.degToRad was moved in r155+
  if (!THREE.MathUtils) {
    THREE.MathUtils = {
      degToRad: function (degrees) {
        return (degrees * Math.PI) / 180;
      },
    };
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] three.js compatibility shims applied');
  }
})();

/* OVERRIDE NOTICE: Several functions defined in this file (e.g., getRecommendation,
 * evaluateRoomRecommendation, showRoomRecommendation, trackRoomVisit,
 * performEditorialUIActivation, exitGuidedMode, activateGuidedMode,
 * updateCameraForMode, updateBackToLoungeVisibility) are intentionally minimal
 * stubs that get overridden by immersive-features.js when both files load together.
 * Do NOT remove these stubs — they serve as fallbacks if features.js is absent. */

var STORE_ROOMS = {
  storefront: {
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-d-base.webp?v=1774971846&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-m-base.webp?v=1774971846&width=900&quality=75',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-d-depth.webp?v=1774971845&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/storefront-m-depth.webp?v=1774971846&width=900&quality=60',
    hotspots: [
      {
        x: 50,
        y: 68,
        label: 'Start Experience',
        targetRoom: 'lounge',
        mobileX: 55,
        mobileY: 63,
        startExperience: true,
      },
    ],
  },

  lounge: {
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/Lounge-Base-flow.jpg?v=1775054500&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-m-base.jpg?v=1775054009&width=900&quality=75',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-depthmap-Grayscale.png?v=1775054498&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/lounge-m-depth-greyscale.png?v=1775054007&width=900&quality=60',
    hotspots: [
      { x: 20, y: 35, label: 'Designer Houses', targetRoom: 'designer_houses', mobileX: 15, mobileY: 80 },
      { x: 50, y: 35, label: 'Occasions', targetRoom: 'occasions', mobileX: 50, mobileY: 80 },
      { x: 80, y: 35, label: 'Featured Collections', targetRoom: 'featured_collections', mobileX: 85, mobileY: 80 },
      { x: 40, y: 45, label: 'Story', targetRoom: 'featured_collections', targetStory: true, mobileX: 40, mobileY: 45 },
      { x: 65, y: 55, label: 'Codex', targetCodex: true, mobileX: 65, mobileY: 50 },
    ],
  },

  designer_houses: {
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-base.jpg?v=1775510548&width=1600',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-base.jpg?v=1775516126&width=900',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-depth.webp?v=1775510548&width=1600',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-depth.png?v=1775516123&width=900',
    hotspots: [
      { x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' },
      { x: 13, y: 40, label: 'Suffuse', targetCollection: 'suffuse' },
      { x: 50, y: 45, label: 'Soraya', targetCollection: 'soraya' },
      { x: 87, y: 40, label: 'Saad Bin Shahzad', targetCollection: 'saad-bin-shahzad' },
      { x: 50, y: 90, label: 'Back to lounge', targetRoom: 'lounge' },
    ],
  },

  occasions: {
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah.png?v=1775312813&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah.png?v=1775312813&width=900&quality=75',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah-depth-map.png?v=1776515933',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-eid-bridal-mehndi-dawat-nikah-depth-map.png?v=1776515933',
    hotspots: [
      { x: 25, y: 40, label: 'Eid Collection', targetCollection: 'eid-collection' },
      { x: 42, y: 50, label: 'Bridal & Mehndi', targetCollection: 'bridal-mehndi' },
      { x: 58, y: 40, label: 'Luxury Formals', targetCollection: 'luxury-formals' },
      { x: 75, y: 50, label: 'Casual Pret', targetCollection: 'casual-pret' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
    ],
  },

  featured_collections: {
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-base.jpg?v=1772037254&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-base.jpg?v=1772037254&width=900&quality=75',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261&width=900&quality=60',
    hotspots: [
      { x: 25, y: 40, label: 'SS5 Summer Pret 26', targetCollection: 'summer-pret-26-eid-edit-saad-bin-shahzad' },
      { x: 50, y: 40, label: 'Suffuse Luxury Pret', targetCollection: 'luxury-pret-suffuse' },
      { x: 75, y: 40, label: 'Soraya Eid Pret', targetCollection: 'lumene-festive-25-26-soraya-official' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ],
  },
};

var CODEX_THEME_TO_ROOM = {
  Eid: 'occasions',
  Bridal: 'designer_houses',
  Heritage: 'designer_houses',
  Formals: 'occasions',
  Everyday: 'occasions',
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTENER REGISTRY - Prevent memory leaks
// ─────────────────────────────────────────────────────────────────────────────
var ListenerRegistry = {
  registry: {},

  add: function (key, element, event, handler, options) {
    if (!this.registry[key]) this.registry[key] = [];
    element.addEventListener(event, handler, options);
    this.registry[key].push({ element: element, event: event, handler: handler });
  },

  cleanup: function (key) {
    if (!this.registry[key]) return;
    this.registry[key].forEach(function (listener) {
      try {
        listener.element.removeEventListener(listener.event, listener.handler);
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Listener removal failed', e);
      }
    });
    delete this.registry[key];
  },

  cleanupAll: function () {
    var self = this;
    Object.keys(this.registry).forEach(function (key) {
      self.cleanup(key);
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IMMERSIVE STORE NAMESPACE - Prevent global pollution
// ─────────────────────────────────────────────────────────────────────────────
if (!window.ShahanaImmersive) {
  window.ShahanaImmersive = {
    store: {
      get: function (key, fallback) {
        try {
          var raw = localStorage.getItem(key);
          if (raw === null) return fallback;
          return JSON.parse(raw);
        } catch (e) {
          return fallback;
        }
      },
      set: function (key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] localStorage write failed:', key, e);
          return false;
        }
      },
      remove: function (key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      },
    },
    graphics: {
      renderer: null,
      scene: null,
      camera: null,
      planeMesh: null,
      uniforms: null,
    },
    room: {
      current: null,
      subMode: null,
      transitioning: false,
    },
    cache: {
      textures: [],
      content: {},
      gallery: {},
    },
    settings: {
      reduceMotion: false,
      isMobile: false,
      isTablet: false,
      textureQuality: 1.0,
      targetFPS: 60,
      interactionEnabled: false,
    },
    search: {
      activeIndex: -1,
      results: [],
      debounceTimer: null,
      abortController: null,
    },
    gesture: {
      lastRoomTransition: 0,
      cooldown: 600,
      roomSequence: ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'],
    },
    quickAdd: {
      modal: null,
      trigger: null,
    },
    hotspot: {
      elements: [],
      focusedIndex: -1,
    },
    device: {
      isMobile: false,
      isTablet: false,
      isLowEnd: false,
    },
    layout: {
      registry: {},
      current: {},
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE OPTIMIZATION
// ─────────────────────────────────────────────────────────────────────────────
function initDeviceOptimization() {
  var isMobile = /iPhone|iPad|Android|Mobile/.test(navigator.userAgent);
  var isTablet = /iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
  var cores = navigator.hardwareConcurrency || 1;
  var memory = navigator.deviceMemory || 4;
  var isLowEnd = cores <= 2 || memory <= 2;

  window.ShahanaImmersive.device.isMobile = isMobile;
  window.ShahanaImmersive.device.isTablet = isTablet;
  window.ShahanaImmersive.device.isLowEnd = isLowEnd;
  window.ShahanaImmersive.settings.isMobile = isMobile;
  window.ShahanaImmersive.settings.isTablet = isTablet;

  if (isLowEnd) {
    window.ShahanaImmersive.settings.textureQuality = 0.5;
    window.ShahanaImmersive.settings.targetFPS = 24;
  } else if (isMobile) {
    window.ShahanaImmersive.settings.textureQuality = 0.75;
    window.ShahanaImmersive.settings.targetFPS = 30;
  } else {
    window.ShahanaImmersive.settings.textureQuality = 1.0;
    window.ShahanaImmersive.settings.targetFPS = 60;
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Device optimization initialized:', {
      isMobile: isMobile,
      isTablet: isTablet,
      isLowEnd: isLowEnd,
      textureQuality: window.ShahanaImmersive.settings.textureQuality,
      targetFPS: window.ShahanaImmersive.settings.targetFPS,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
var LoadingState = {
  isLoading: false,
  startTime: null,
  timeout: 15000,
  timeoutId: null,

  start: function () {
    this.isLoading = true;
    this.startTime = Date.now();
    var self = this;
    this.timeoutId = setTimeout(function () {
      if (self.isLoading) {
        self.fail('Loading took too long. Please check your connection.');
      }
    }, this.timeout);
  },

  complete: function () {
    this.isLoading = false;
    clearTimeout(this.timeoutId);
  },

  fail: function (message) {
    this.isLoading = false;
    clearTimeout(this.timeoutId);
    if (typeof showFeedback === 'function') {
      showFeedback(message, 'error');
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
var Analytics = {
  track: function (event, data) {
    try {
      if (window.gtag) {
        gtag('event', event, data);
      }
      if (window.shopifyAnalytics && typeof shopifyAnalytics.track === 'function') {
        shopifyAnalytics.track('immersive:' + event, data);
      }
    } catch (e) {
      if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Analytics error:', e);
    }
  },

  trackRoomTransition: function (fromRoom, toRoom) {
    this.track('room_transition', { from: fromRoom, to: toRoom, timestamp: Date.now() });
  },

  trackError: function (errorType, message) {
    this.track('error', { type: errorType, message: message, timestamp: Date.now() });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT REGISTRY - Three Configurable Layouts
// ─────────────────────────────────────────────────────────────────────────────
var LAYOUT_REGISTRY = {
  'asymmetric-gallery': {
    name: 'Asymmetric Gallery',
    description: 'Indrajaal-inspired organic gallery layout for Designer Houses',
    rooms: ['designer_houses'],
    config: {
      spacing: 3.5,
      maxItems: 12,
      draggable: true,
      physics: true,
      parallaxStrength: 0.08,
    },
  },
  'scroll-narrative': {
    name: 'Scroll Narrative',
    description: 'Story-driven vertical scroll layout for Occasions',
    rooms: ['occasions'],
    config: {
      spacing: 2.5,
      maxItems: 8,
      draggable: false,
      physics: false,
      parallaxStrength: 0.04,
      scrollDriven: true,
    },
  },
  'masonry-featured': {
    name: 'Masonry Featured',
    description: 'Curated grid with featured highlight for Collections',
    rooms: ['featured_collections'],
    config: {
      spacing: 3.0,
      maxItems: 9,
      draggable: true,
      physics: false,
      parallaxStrength: 0.06,
      featuredIndex: 0,
    },
  },
  'infinite-drag-gallery': {
    name: 'Infinite Drag Gallery',
    description: '2D infinite draggable grid with inertia and wrap',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      spacing: 0.08,
      cardWidth: 0.7,
      cardHeight: 1.05,
      columns: 4,
      friction: 0.95,
      draggable: true,
      physics: true,
      infinite: true,
      shaderEffects: true,
    },
  },
  'scroll-story': {
    name: 'Scroll Story',
    description: 'Native RAF infinite scroll list with LERP + modulo recycling + shaders',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      itemSpacing: 2.5,
      lerpFactor: 0.1,
      cardHeight: 0.5,
      cardAspect: 3 / 4,
      draggable: true,
      physics: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
  'scroll-tunnel': {
    name: 'Scroll Tunnel',
    description: 'PerspectiveCamera scroll-driven Z-axis depth tunnel with chromatic aberration',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      tunnelLength: 15,
      fov: 60,
      cardHeight: 0.5,
      cardAspect: 3 / 4,
      draggable: true,
      physics: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
};

function getLayoutForRoom(roomKey) {
  if (!roomKey || typeof roomKey !== 'string') {
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Invalid roomKey:', roomKey);
    return null;
  }
  for (var layoutKey in LAYOUT_REGISTRY) {
    var layout = LAYOUT_REGISTRY[layoutKey];
    if (layout && layout.rooms && layout.rooms.indexOf(roomKey) !== -1) {
      return layout;
    }
  }
  return null;
}

function applyLayoutToRoom(roomKey, layoutKey) {
  if (!LAYOUT_REGISTRY[layoutKey]) {
    console.error('[Immersive] Layout not found:', layoutKey);
    return false;
  }
  window.ShahanaImmersive.layout.current[roomKey] = layoutKey;
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Applied layout', layoutKey, 'to room', roomKey);
  }
  return true;
}

function getRoomForCollectionHandleFromCodex(handle) {
  if (!handle || !window.codexCollectionThemes) return null;
  var theme = window.codexCollectionThemes[handle];
  if (!theme) return null;
  var roomKey = CODEX_THEME_TO_ROOM[theme];
  if (!roomKey) return null;
  var room = getRoomData(roomKey);
  if (!room) return null;
  return roomKey;
}

var ROOM_VISUAL_PROFILES = {
  default: {
    uAtmosphericMood: 0.25,
    uScrollVignette: 0.1,
    uScrollChroma: 0.05,
  },
  featured_collections: {
    uAtmosphericMood: 0.5,
    uScrollVignette: 0.18,
    uScrollChroma: 0.09,
  },
  'featured_collections:story': {
    uAtmosphericMood: 0.8,
    uScrollVignette: 0.32,
    uScrollChroma: 0.16,
  },
};

function getRoomVisualProfile(roomKey, mode) {
  var key = mode ? roomKey + ':' + mode : roomKey;
  var profile = ROOM_VISUAL_PROFILES[key] || ROOM_VISUAL_PROFILES[roomKey] || null;

  if (!profile) {
    if (window.__IMMERSIVE_DEV__) {
      console.warn(
        '[Immersive] No visual profile defined for room "' +
          roomKey +
          '"' +
          (mode ? ' (mode: "' + mode + '")' : '') +
          '. Falling back to default profile. Add a profile to ROOM_VISUAL_PROFILES to fix.',
      );
    }
    profile = ROOM_VISUAL_PROFILES.default;
  }

  return profile;
}

function applyRoomVisualProfile(roomKey, mode, deltaTimeSec) {
  if (!uniforms) return;
  var profile = getRoomVisualProfile(roomKey, mode);
  var dt = typeof deltaTimeSec === 'number' ? deltaTimeSec : 0.016;
  var speed = 2;

  function lerp(current, target, dtLocal) {
    return current + (target - current) * Math.min(1, dtLocal * speed);
  }

  if (uniforms.uAtmosphericMood && typeof uniforms.uAtmosphericMood.value === 'number') {
    uniforms.uAtmosphericMood.value = lerp(uniforms.uAtmosphericMood.value, profile.uAtmosphericMood, dt);
  }
  if (uniforms.uScrollVignette && typeof uniforms.uScrollVignette.value === 'number') {
    uniforms.uScrollVignette.value = lerp(uniforms.uScrollVignette.value, profile.uScrollVignette, dt);
  }
  if (uniforms.uScrollChroma && typeof uniforms.uScrollChroma.value === 'number') {
    uniforms.uScrollChroma.value = lerp(uniforms.uScrollChroma.value, profile.uScrollChroma, dt);
  }
}

// Dispose gallery stage resources to prevent GPU memory leaks
function disposeGalleryStage(roomKey) {
  var state = galleryStageRegistry[roomKey];
  if (!state) return;

  // Track cleanup for analytics
  Analytics.track('gallery_stage_disposed', { room: roomKey, timestamp: Date.now() });

  if (state.group) {
    state.group.traverse(function (obj) {
      if (obj.isMesh) {
        if (obj.geometry) {
          try {
            obj.geometry.dispose();
          } catch (e) {}
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(function (m) {
              if (m.map) {
                try {
                  m.map.dispose();
                } catch (e) {}
              }
              try {
                m.dispose();
              } catch (e) {}
            });
          } else {
            if (obj.material.map) {
              try {
                obj.material.map.dispose();
              } catch (e) {}
            }
            try {
              obj.material.dispose();
            } catch (e) {}
          }
        }
      }
    });
    try {
      scene.remove(state.group);
    } catch (e) {}
  }

  // Dispose all textures
  if (state.textures) {
    state.textures.forEach(function (tex) {
      if (tex) {
        try {
          tex.dispose();
        } catch (e) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Texture disposal failed:', tex, e);
          }
        }
      }
    });
    state.textures = [];
  }

  // Clean up listeners
  ListenerRegistry.cleanup('gallery-' + roomKey);

  // Clear state
  state.dragState = null;
  state.scrollState = null;
  state.interactionListeners = null;
  state.group = null;

  delete galleryStageRegistry[roomKey];
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Disposed gallery stage for room:', roomKey);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL STORY — Native RAF infinite scroll list with LERP + modulo recycling
// ─────────────────────────────────────────────────────────────────────────────
function _buildScrollStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var isScrollStory = options.layout === 'scroll-story';
  var cardH = options.cardHeight || (isScrollStory ? 0.5 : 0.4);
  var cardAspect = options.cardAspect || (isScrollStory ? 3 / 4 : 2 / 3);
  var cardW = cardH * cardAspect;
  var itemSpacing = cfg.itemSpacing || 2.5; // Y gap between items (world units)
  var lerpFactor = cfg.lerpFactor || 0.1; // LERP smoothing (lower = smoother)
  var isHelix = !isScrollStory;

  // ── Scroll state ──
  group.userData.currentScrollY = 0;
  group.userData.targetScrollY = 0;
  group.userData.itemSpacing = itemSpacing;
  group.userData.totalHeight = items.length * itemSpacing;
  group.userData.lerpFactor = lerpFactor;
  group.userData.isScrollStory = isScrollStory;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Story texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: isScrollStory ? 'scroll-story' : 'helix',
      cardCount: 0,
      itemSpacing: itemSpacing,
      isScrollStory: isScrollStory,
      currentScrollY: 0,
      targetScrollY: 0,
      lerpFactor: lerpFactor,
    };
    return;
  }

  // ── Shared shader uniforms ──
  var sharedUniforms = isScrollStory
    ? {
        uTime: { value: 0 },
        uScrollY: { value: 0 },
        uVelocity: { value: 0 },
      }
    : null;

  // ── Vertex shader: wave bend from scroll velocity ──
  var vertSrc = [
    'varying vec2 vUv;',
    'varying float vDist;',
    'uniform float uTime;',
    'uniform float uScrollY;',
    'uniform float uVelocity;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    // Wave bend: skew geometry based on scroll velocity
    '  float wave = sin(pos.y * 2.0 + uTime * 3.0) * uVelocity * 0.02;',
    '  pos.x += wave;',
    '  pos.z += abs(wave) * 0.5;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vDist = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  // ── Fragment shader: chromatic aberration + vignette ──
  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uScrollY;',
    'uniform float uVelocity;',
    'varying vec2 vUv;',
    'varying float vDist;',
    'void main() {',
    '  float aberration = smoothstep(1.0, 8.0, vDist) * 0.003 * (1.0 + abs(uVelocity) * 0.5);',
    '  vec2 dir = vUv - 0.5;',
    '  float edge = smoothstep(0.0, 0.5, length(dir));',
    '  float shift = aberration * edge;',
    '  vec2 rUV = clamp(vUv + dir * shift, 0.001, 0.999);',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = clamp(vUv - dir * shift, 0.001, 0.999);',
    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',
    '  float vig = 1.0 - smoothstep(0.3, 0.8, length(vUv - 0.5));',
    '  gl_FragColor = vec4(r, g, b, a * vig);',
    '}',
  ].join('\n');

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var geom = new THREE.PlaneGeometry(cardW, cardH, 1, 1);

    var mat;
    if (isScrollStory) {
      mat = new THREE.ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: fragSrc,
        uniforms: {
          uTexture: { value: entry.tex },
          uTime: sharedUniforms.uTime,
          uScrollY: sharedUniforms.uScrollY,
          uVelocity: sharedUniforms.uVelocity,
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    } else {
      mat = new THREE.MeshBasicMaterial({
        map: entry.tex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
    }

    var mesh = new THREE.Mesh(geom, mat);

    if (isScrollStory) {
      // ── Flat Y-axis list ──
      var yPos = -(idx * itemSpacing);
      mesh.position.set(0, yPos, 0);
      mesh.userData.initialY = yPos;
    } else {
      // ── Helix fallback ──
      var angle = (idx / count) * Math.PI * 2 * 2.5;
      var y = (idx - count / 2) * 0.6;
      mesh.position.set(Math.cos(angle) * 0.8, y, Math.sin(angle) * 0.8);
      mesh.lookAt(0, y, 0);
      mesh.rotateY(Math.PI);
    }

    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: isScrollStory ? 'scroll-story' : 'helix',
      initialY: mesh.position.y,
      baseY: mesh.position.y,
    };

    group.add(mesh);
    planes.push(mesh);

    // ── Canvas title label ──
    if (item.title) {
      var labelCanvas = document.createElement('canvas');
      var lCtx = labelCanvas.getContext('2d');
      labelCanvas.width = 768;
      labelCanvas.height = 120;
      lCtx.clearRect(0, 0, 768, 120);
      lCtx.font = 'bold 48px Georgia, serif';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillStyle = '#ece3c2';
      lCtx.fillText(item.title.toUpperCase(), 384, 40);
      lCtx.font = '500 12px Arial, sans-serif';
      lCtx.fillStyle = 'rgba(255,255,255,0.5)';
      lCtx.fillText('[ TAP TO EXPLORE ]', 384, 90);

      var labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      var labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      var labelW = cardW * 0.9;
      var labelH = labelW * (120 / 768);
      var labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(labelW, labelH), labelMat);
      labelMesh.position.set(0, mesh.position.y - cardH * 0.55, isScrollStory ? 0.05 : 0);
      labelMesh.renderOrder = 999;
      group.add(labelMesh);
      labels.push(labelMesh);
    }
  });

  scene.add(group);

  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: isScrollStory ? 'scroll-story' : 'helix',
    isScrollStory: isScrollStory,
    isScrollDriven: isScrollStory,
    itemSpacing: itemSpacing,
    totalHeight: count * itemSpacing,
    lerpFactor: lerpFactor,
    currentScrollY: 0,
    targetScrollY: 0,
    prevScrollY: 0,
    cardCount: count,
    sharedUniforms: sharedUniforms,
  };
}

// -----------------------------------------------------------------------------
// SCROLL TUNNEL — PerspectiveCamera scroll-driven 3D tunnel
// -----------------------------------------------------------------------------
function _buildScrollTunnel(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var cardH = options.cardHeight || 0.5;
  var cardAspect = options.cardAspect || 3 / 4;
  var cardW = cardH * cardAspect;
  var tunnelLength = cfg.tunnelLength || 15;
  var fov = cfg.fov || 60;
  var near = cfg.near || 0.1;
  var far = cfg.far || 100;

  // ── Create PerspectiveCamera for tunnel depth effect ──
  // Replace the global OrthographicCamera with a PerspectiveCamera
  // so that cards at different Z depths appear with proper foreshortening
  var size = renderer.getSize ? renderer.getSize({ x: 0, y: 0 }) : { x: window.innerWidth, y: window.innerHeight };
  var aspect = size.x / size.y;
  var tunnelCam = new THREE.PerspectiveCamera(fov, aspect, near, far);
  if (camera && camera.dispose) camera.dispose();
  tunnelCam.position.z = 0;
  camera = tunnelCam; // replace global camera ref

  group.userData.scrollZ = 0;
  group.userData.targetScrollZ = 0;
  group.userData.tunnelLength = tunnelLength;
  group.userData.fov = fov;
  group.userData.isScrollTunnel = true;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Tunnel texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'scroll-tunnel',
      cardCount: 0,
      tunnelLength: tunnelLength,
      scrollZ: 0,
      targetScrollZ: 0,
      fov: fov,
      isScrollTunnel: true,
      sharedUniforms: { uTime: { value: 0 }, uScrollZ: { value: 0 }, uFov: { value: fov } },
    };
    return;
  }

  var sharedUniforms = {
    uTime: { value: 0 },
    uScrollZ: { value: 0 },
    uFov: { value: fov },
  };

  var vertSrc = [
    'varying vec2 vUv;',
    'varying float vDist;',
    'uniform float uTime;',
    'uniform float uScrollZ;',
    'uniform float uFov;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    '  float velocity = uScrollZ;', // reused as velocity proxy
    '  float wave = sin(pos.y * 2.0 + uTime * 3.0) * velocity * 0.01;',
    '  pos.x += clamp(wave, -0.5, 0.5);',
    '  pos.z += abs(wave) * 0.3;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vDist = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uScrollZ;',
    'uniform float uFov;',
    'varying vec2 vUv;',
    'varying float vDist;',
    'void main() {',
    '  float aberration = smoothstep(1.0, 12.0, vDist) * 0.006;',
    '  vec2 dir = vUv - 0.5;',
    '  float edge = smoothstep(0.0, 0.5, length(dir));',
    '  float shift = aberration * edge;',
    '  vec2 rUV = clamp(vUv + dir * shift, 0.001, 0.999);',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = clamp(vUv - dir * shift, 0.001, 0.999);',
    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',
    '  float vig = 1.0 - smoothstep(0.3, 0.85, length(vUv - 0.5));',
    '  gl_FragColor = vec4(r, g, b, a * vig);',
    '}',
  ].join('\n');

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var geom = new THREE.PlaneGeometry(cardW, cardH, 1, 1);

    var mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uTexture: { value: entry.tex },
        uTime: sharedUniforms.uTime,
        uScrollZ: sharedUniforms.uScrollZ,
        uFov: sharedUniforms.uFov,
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    var mesh = new THREE.Mesh(geom, mat);

    var zPos = -2 - (idx / Math.max(count - 1, 1)) * tunnelLength;
    var xOff = (idx % 2 === 0 ? -1 : 1) * (0.2 + (idx % 3) * 0.1);
    var yOff = Math.sin(idx * 0.7) * 0.15;
    mesh.position.set(xOff, yOff, zPos);
    mesh.lookAt(0, yOff, zPos - 1);

    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: 'scroll-tunnel',
      baseZ: zPos,
      baseY: yOff,
      parallaxFactor: 1.0 + (idx % 5) * 0.15,
    };

    group.add(mesh);
    planes.push(mesh);

    if (item.title) {
      var labelCanvas = document.createElement('canvas');
      var lCtx = labelCanvas.getContext('2d');
      labelCanvas.width = 768;
      labelCanvas.height = 120;
      lCtx.clearRect(0, 0, 768, 120);
      lCtx.font = 'bold 48px Georgia, serif';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillStyle = '#ece3c2';
      lCtx.fillText(item.title.toUpperCase(), 384, 40);
      lCtx.font = '500 12px Arial, sans-serif';
      lCtx.fillStyle = 'rgba(255,255,255,0.5)';
      lCtx.fillText('[ TAP TO EXPLORE ]', 384, 90);

      var labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      var labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      var labelW = cardW * 0.9;
      var labelH = labelW * (120 / 768);
      var labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(labelW, labelH), labelMat);
      labelMesh.position.set(xOff, yOff - cardH * 0.55, zPos - 0.05);
      labelMesh.renderOrder = 999;
      group.add(labelMesh);
      labels.push(labelMesh);
    }
  });

  scene.add(group);

  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'scroll-tunnel',
    tunnelLength: tunnelLength,
    fov: fov,
    scrollZ: 0,
    targetScrollZ: 0,
    prevScrollZ: 0,
    cardCount: count,
    sharedUniforms: sharedUniforms,
    isScrollTunnel: true,
    isScrollDriven: true,
  };
}

function buildGalleryStageForRoom(roomKey, scene, options) {
  // Dispose old gallery stage before creating new one
  if (currentRoomKey && galleryStageRegistry[currentRoomKey]) {
    disposeGalleryStage(currentRoomKey);
  }

  var items = getGalleryStageConfig(roomKey);
  if (!items.length) return null;
  if (!window.THREE) return null;
  var THREE = window.THREE;

  options = options || {};
  var layout = options.layout || 'arc';

  // Restore OrthographicCamera if switching away from scroll-tunnel
  if (layout !== 'scroll-tunnel' && camera instanceof THREE.PerspectiveCamera) {
    if (camera && camera.dispose) camera.dispose();
    var size = renderer.getSize ? renderer.getSize({ x: 0, y: 0 }) : { x: window.innerWidth, y: window.innerHeight };
    var aspect = size.x / size.y;
    camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 2);
    camera.position.z = 1;
    camera.updateProjectionMatrix();
  }

  var radius = options.radius || 7;
  var arcDegrees = options.arcDegrees || 140;
  var verticalOffset = options.verticalOffset || 0.2;
  var tiltDegrees = options.tiltDegrees || -4;

  var group = new THREE.Group();
  group.position.set(0, 0, 0);
  var textureLoader = new THREE.TextureLoader();
  var planes = [];
  var textures = [];
  var labels = [];

  var count = items.length;

  if (
    layout === 'scroll-story' ||
    (layout === 'helix' && !(options.layoutConfig && options.layoutConfig.scrollDriven))
  ) {
    _buildScrollStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'scroll-tunnel') {
    _buildScrollTunnel(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (
    layout === 'masonry-featured' ||
    (layout === 'grid' && options.layoutConfig && options.layoutConfig.featuredIndex !== undefined)
  ) {
    // ── Masonry Featured layout ──
    // First item (featuredIndex) is a large hero card, centered, closer to camera.
    // Remaining items arranged in masonry grid around it with varying sizes
    // and subtle 3D depth offsets for a curated editorial feel.
    var isMasonry = layout === 'masonry-featured';
    var featuredIdx =
      options.layoutConfig && options.layoutConfig.featuredIndex !== undefined ? options.layoutConfig.featuredIndex : 0;
    var masonrySpacing = (options.layoutConfig && options.layoutConfig.spacing) || 0.6;
    var parallaxStr = (options.layoutConfig && options.layoutConfig.parallaxStrength) || 0.06;
    var gridCols = options.gridCols || 3;
    var gridSpacingX = options.gridSpacingX || masonrySpacing;
    var gridSpacingY = options.gridSpacingY || masonrySpacing * 1.2;
    var baseCardH = options.cardHeight || 0.5;
    var gridCardAspect = options.cardAspect || 3 / 4;
    var baseCardW = baseCardH * gridCardAspect;

    var startX = -((gridCols - 1) * gridSpacingX) / 2;
    var startY = ((Math.ceil(count / gridCols) - 1) * gridSpacingY) / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var isFeatured = index === featuredIdx;

      // Featured card: 2x size, centered, closer to camera
      var thisCardH = isFeatured ? baseCardH * 1.8 : baseCardH;
      var thisCardAspect = isFeatured ? gridCardAspect : gridCardAspect * (0.9 + (index % 5) * 0.04);
      var thisCardW = thisCardH * thisCardAspect;

      var geom = new THREE.PlaneGeometry(thisCardW, thisCardH, 1, 1);
      var mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });

      var mesh = new THREE.Mesh(geom, mat);

      var col, row, x, y, z;
      if (isFeatured) {
        // Featured: centered, closer to camera (Z=1.5, well within frustum)
        x = 0;
        y = 0;
        z = 1.5;
      } else {
        // Masonry: grid with organic offsets, Z centered around 0.8-1.2
        var masonryIndex = index < featuredIdx ? index : index - 1;
        col = masonryIndex % gridCols;
        row = Math.floor(masonryIndex / gridCols);
        x = startX + col * gridSpacingX + (isMasonry ? ((masonryIndex % 7) - 3) * 0.1 : 0);
        y = startY - row * gridSpacingY + (isMasonry ? ((masonryIndex % 5) - 2) * 0.08 : 0);
        z = 1.0 + Math.abs(col - gridCols / 2) * parallaxStr * 0.3 + row * parallaxStr * 0.2;
      }

      mesh.position.set(x, y, z);
      mesh.lookAt(0, y, z - 10);

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: productHandle || item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: isMasonry ? 'masonry-featured' : 'grid',
        baseX: x,
        baseY: y,
        baseZ: z,
        isFeatured: isFeatured,
        col: isFeatured ? -1 : col,
        row: isFeatured ? -1 : row,
      };

      group.add(mesh);
      planes.push(mesh);

      // Title overlay at bottom of card
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = isFeatured ? 1024 : 512;
        labelCanvas.height = isFeatured ? 96 : 64;
        lCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
        lCtx.font = 'bold ' + (isFeatured ? 36 : 28) + 'px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = isFeatured ? '#d4af37' : '#ffffff';
        lCtx.fillText(item.title, labelCanvas.width / 2, labelCanvas.height / 2);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
          side: THREE.DoubleSide,
        });
        var labelW = thisCardW * (isFeatured ? 0.7 : 0.85);
        var labelH = labelW * (labelCanvas.height / labelCanvas.width);
        var labelGeom = new THREE.PlaneGeometry(labelW, labelH);
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(x, y - thisCardH * 0.5 - labelH * 0.3, z + 0.01);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: isMasonry ? 'masonry-featured' : 'grid',
      currentPage: 0,
      targetPage: 0,
      totalPages: 1,
      gridCols: gridCols,
      gridSpacingX: gridSpacingX,
      gridSpacingY: gridSpacingY,
      baseCardW: baseCardW,
      baseCardH: baseCardH,
      startX: startX,
      startY: startY,
      featuredIndex: featuredIdx,
      parallaxStrength: parallaxStr,
    };
  } else if (layout === 'vertical') {
    // ── Vertical scroll layout (indrajaal-museum homepage style) ──
    // Items stacked vertically in 3D space, scroll-driven
    var cardSpacing = options.cardSpacing || 3.5;
    var cardH = options.cardHeight || 2.2;
    var cardAspect = options.cardAspect || 2 / 3;
    var cardW = cardH * cardAspect;
    var startY = ((count - 1) * cardSpacing) / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var geom = new THREE.PlaneGeometry(cardW, cardH, 1, 1);
      var mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });

      var mesh = new THREE.Mesh(geom, mat);
      var y = startY - index * cardSpacing;
      mesh.position.set(0, y, 0);
      mesh.rotation.x = THREE.MathUtils.degToRad(tiltDegrees);

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: 'vertical',
        baseY: y,
      };

      group.add(mesh);
      planes.push(mesh);

      // Large title label below each card (indrajaal style: ~100px font, tight spacing, cream on dark)
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = 1024;
        labelCanvas.height = 160;
        lCtx.clearRect(0, 0, 1024, 160);
        lCtx.font = 'bold 72px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = '#ece3c2';
        lCtx.letterSpacing = '-5px';
        lCtx.fillText(item.title.toUpperCase(), 512, 60);

        // Sub-label: "[ EXPLORE COLLECTION ]"
        lCtx.font = '500 14px Arial, sans-serif';
        lCtx.fillStyle = 'rgba(255,255,255,0.5)';
        lCtx.letterSpacing = '3px';
        lCtx.fillText('[ EXPLORE COLLECTION ]', 512, 120);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
          side: THREE.DoubleSide,
        });
        var labelW = cardW * 1.2;
        var labelH = labelW * (160 / 1024);
        var labelGeom = new THREE.PlaneGeometry(labelW, labelH);
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(0, y - cardH * 0.5 - labelH * 0.6, 0.05);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: 'vertical',
      scrollY: 0,
      targetScrollY: 0,
      currentRotationX: 0,
      targetRotationX: 0,
      cardSpacing: cardSpacing,
      cardCount: count,
      cardH: cardH,
      startY: startY,
    };
  } else if (layout === 'asymmetric-gallery') {
    // ── Asymmetric Gallery: delegated to infinite-drag-gallery builder ──
    options.layoutConfig = options.layoutConfig || {};
    options.layoutConfig.infinite = true;
    options.layoutConfig.friction = 0.95;
    options.layoutConfig.shaderEffects = true;
    _buildInfiniteDragGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'infinite-drag-gallery') {
    _buildInfiniteDragGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else {
    // ── Arc carousel layout (original horizontal rotation) ──
    var step = count > 1 ? arcDegrees / (count - 1) : 0;
    var startAngle = -arcDegrees / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var aspect = item.imageWidth && item.imageHeight ? item.imageWidth / item.imageHeight : 16 / 9;
      var h = 2.0;
      var w = h * aspect;

      var geom = new THREE.PlaneGeometry(w, h, 1, 1);
      var mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95,
      });

      var mesh = new THREE.Mesh(geom, mat);
      var angleDeg = startAngle + step * index;
      var rad = (angleDeg * Math.PI) / 180;
      var x = Math.sin(rad) * radius;
      var z = Math.cos(rad) * radius * -1;

      mesh.position.set(x, verticalOffset, z);
      mesh.lookAt(new THREE.Vector3(0, verticalOffset, 0));
      mesh.rotation.x += THREE.MathUtils.degToRad(tiltDegrees);

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: 'arc',
      };

      group.add(mesh);
      planes.push(mesh);

      // Add a text label below the card
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = 512;
        labelCanvas.height = 96;
        lCtx.clearRect(0, 0, 512, 96);
        lCtx.font = 'bold 36px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = '#d4af37';
        lCtx.fillText(item.title, 256, 48);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
        });
        var labelW = w * 0.8;
        var labelH = labelW * (96 / 512);
        var labelGeom = new THREE.PlaneGeometry(labelW, labelH);
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(x, verticalOffset - h * 0.55, z);
        labelMesh.lookAt(new THREE.Vector3(0, verticalOffset - h * 0.55, 0));
        labelMesh.rotation.x += THREE.MathUtils.degToRad(tiltDegrees);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: 'arc',
      currentAngle: 0,
      targetAngle: 0,
      radius: radius,
      arcDegrees: arcDegrees,
      verticalOffset: verticalOffset,
      tiltDegrees: tiltDegrees,
    };
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Gallery stage built for room:', roomKey, 'items:', items.length, 'layout:', layout);
  }
  return galleryStageRegistry[roomKey];
}

// ─────────────────────────────────────────────────────────────
// INFINITE DRAG GALLERY — shared builder
// ─────────────────────────────────────────────────────────────
function _buildInfiniteDragGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var COLS = cfg.columns || 4;
  var GUTTER = cfg.spacing || 0.08;
  var cardW = cfg.cardWidth || 0.7;
  var cardH = cfg.cardHeight || 1.05;
  var useShader = !!cfg.shaderEffects;

  var loadedItems = [];
  var texCache = {};
  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Gallery texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'infinite-drag-gallery',
      cardCount: 0,
      gridCols: COLS,
      gridTotalW: 0,
      gridTotalH: 0,
      cardW: cardW,
      cardH: cardH,
      spacing: GUTTER,
      velocityX: 0,
      velocityY: 0,
      useShader: useShader,
    };
    return;
  }

  // Duplicate to fill 3 viewport widths + 3 viewport heights for infinite drag
  var vpH = camera.top - camera.bottom;
  var vpW = camera.right - camera.left;
  var minRows = Math.max(6, Math.ceil((3 * vpH) / (cardH + GUTTER)));
  var minCols = Math.max(4, Math.ceil((3 * vpW) / (cardW + GUTTER)));
  var totalCardsNeeded = minCols * minRows;
  var dupItems = [];
  var si = 0;
  while (dupItems.length < totalCardsNeeded) {
    var src = loadedItems[si % loadedItems.length];
    if (!src) break;
    dupItems.push({ item: src.item, tex: src.tex, originalIndex: src.index });
    si++;
  }

  var totalRows = Math.ceil(dupItems.length / COLS);
  var gridTotalW = COLS * cardW + (COLS - 1) * GUTTER;
  var gridTotalH = totalRows * (cardH + GUTTER);
  var startX = -gridTotalW / 2 + cardW / 2;
  var startY = gridTotalH / 2 - cardH / 2;

  // Shared shader uniforms
  var sharedUniforms = {
    uTime: { value: 0 },
    uVelocity: { value: 0 },
  };

  dupItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var col = idx % COLS;
    var row = Math.floor(idx / COLS);
    var geom = new THREE.PlaneGeometry(cardW, cardH, 1, 1);

    var mat;
    if (useShader) {
      mat = new THREE.ShaderMaterial({
        vertexShader: [
          'varying vec2 vUv;',
          'void main() {',
          '  vUv = uv;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n'),
        fragmentShader: [
          'precision highp float;',
          'uniform sampler2D uTexture;',
          'uniform float uTime;',
          'uniform float uVelocity;',
          'varying vec2 vUv;',
          'void main() {',
          '  float shift = uVelocity * 0.003;',
          '  vec2 dir = vUv - 0.5;',
          '  float dist = length(dir);',
          '  float edge = smoothstep(0.0, 0.5, dist);',
          '  float amount = shift * edge;',
          '  vec2 rUV = clamp(vUv + dir * amount, 0.0, 1.0);',
          '  vec2 gUV = vUv;',
          '  vec2 bUV = clamp(vUv - dir * amount, 0.0, 1.0);',
          '  float r = texture2D(uTexture, rUV).r;',
          '  float g = texture2D(uTexture, gUV).g;',
          '  float b = texture2D(uTexture, bUV).b;',
          '  float a = texture2D(uTexture, gUV).a;',
          '  gl_FragColor = vec4(r, g, b, a);',
          '}',
        ].join('\n'),
        uniforms: {
          uTexture: { value: entry.tex },
          uTime: sharedUniforms.uTime,
          uVelocity: sharedUniforms.uVelocity,
        },
        transparent: true,
        side: THREE.DoubleSide,
      });
    } else {
      mat = new THREE.MeshBasicMaterial({ map: entry.tex, transparent: true, opacity: 1.0, side: THREE.DoubleSide });
    }

    var mesh = new THREE.Mesh(geom, mat);
    var x = startX + col * (cardW + GUTTER);
    var y = startY - row * (cardH + GUTTER);
    mesh.position.set(x, y, 1.0);
    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.originalIndex,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: 'infinite-drag-gallery',
      baseX: x,
      baseY: y,
      baseZ: 1.0,
      cardW: cardW,
      cardH: cardH,
      row: row,
      col: col,
    };
    group.add(mesh);
    planes.push(mesh);
  });

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'infinite-drag-gallery',
    cardCount: dupItems.length,
    gridCols: COLS,
    totalRows: totalRows,
    cardW: cardW,
    cardH: cardH,
    spacing: GUTTER,
    gridTotalW: gridTotalW,
    gridTotalH: gridTotalH,
    velocityX: 0,
    velocityY: 0,
    useShader: useShader,
    sharedUniforms: sharedUniforms,
  };
}

// ─────────────────────────────────────────────────────────────
// Gallery hint UI
// ─────────────────────────────────────────────────────────────

function showGalleryHint(roomKey) {
  var existing = document.getElementById('immersive-gallery-hint');
  if (existing) existing.remove();

  var l = getGalleryLayout(roomKey);
  var isScrollLayout = l === 'vertical' || l === 'asymmetric-gallery' || l === 'scroll-narrative';
  var hint = document.createElement('div');
  hint.id = 'immersive-gallery-hint';
  hint.className = 'immersive-gallery-hint';
  hint.innerHTML = isScrollLayout
    ? '<span class="immersive-gallery-hint__text">Scroll or drag to explore &middot; Click a card to view collection</span>'
    : '<span class="immersive-gallery-hint__text">Drag to browse &middot; Click a card to explore</span>';
  hint.setAttribute('aria-live', 'polite');
  document.body.appendChild(hint);

  setTimeout(function () {
    hint.classList.add('is-fading');
    setTimeout(function () {
      hint.remove();
    }, 600);
  }, 4000);
}

// Gallery carousel interaction - drag to rotate like Indrajaal
var galleryDragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  velocity: 0,
  velocityX: 0,
  velocityY: 0,
};

function initGalleryCarousel(canvas) {
  if (!canvas) return;
  ListenerRegistry.cleanup('gallery-carousel');
  var state = galleryStageRegistry[currentRoomKey];
  var layout = state ? state.layout : 'arc';
  var isScrollLayout =
    layout === 'asymmetric-gallery' ||
    layout === 'scroll-narrative' ||
    layout === 'vertical' ||
    layout === 'infinite-drag-gallery' ||
    layout === 'scroll-story' ||
    layout === 'scroll-tunnel';
  var isHelixLayout = layout === 'helix' || layout === 'scroll-narrative';
  var isGridLayout = layout === 'grid' || layout === 'masonry-featured';
  var isInfiniteDrag = layout === 'infinite-drag-gallery';
  var isScrollStory = layout === 'scroll-story';
  var isScrollTunnel = layout === 'scroll-tunnel';

  var startHandler = function (e) {
    // Guard: don't capture touch/click until user has entered the 3D experience
    if (window.ShahanaImmersive && window.ShahanaImmersive.settings && !window.ShahanaImmersive.settings.interactionEnabled) return;
    if (!galleryStageRegistry[currentRoomKey]) return;
    galleryDragState.isDragging = true;
    galleryDragState.startX = e.clientX || e.touches?.[0]?.clientX || 0;
    galleryDragState.startY = e.clientY || e.touches?.[0]?.clientY || 0;
    galleryDragState.lastX = galleryDragState.startX;
    galleryDragState.lastY = galleryDragState.startY;
    galleryDragState.velocityX = 0;
    galleryDragState.velocityY = 0;
    canvas.style.cursor = 'grabbing';
  };

  var moveHandler = function (e) {
    if (!galleryDragState.isDragging) return;
    var x = e.clientX || e.touches?.[0]?.clientX || 0;
    var y = e.clientY || e.touches?.[0]?.clientY || 0;
    var s = galleryStageRegistry[currentRoomKey];
    if (!s) return;

    var dx = x - galleryDragState.lastX;
    var dy = y - galleryDragState.lastY;

    if (isScrollLayout) {
      // Scroll-driven layouts: asymmetric-gallery, scroll-narrative, vertical
      // Y drag translates/scrolls, X drag adds subtle rotation
      var deltaY = dy * 0.012;
      var deltaX = dx * 0.003;
      if (layout === 'asymmetric-gallery') {
        // Asymmetric: parallax-driven Y scroll + subtle Y-axis rotation
        s.targetScrollY = Math.max(
          -(s.cardCount - 1) * s.asymSpacing * 0.5,
          Math.min(s.asymSpacing * 0.5, s.targetScrollY - deltaY),
        );
        s.targetRotationY += dx * 0.002;
      } else {
        // Vertical / scroll-narrative: standard scroll + tilt
        s.targetScrollY = Math.max(
          -(s.cardCount - 1) * s.cardSpacing * 0.5,
          Math.min(s.cardSpacing * 0.5, s.targetScrollY - deltaY),
        );
        s.targetRotationX = Math.max(-0.15, Math.min(0.15, s.targetRotationX + deltaX));
      }
      galleryDragState.velocityX = dx * 0.5;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isHelixLayout) {
      // Helix: X drag rotates around spiral, Y drag scrolls up/down
      s.targetRotationY += dx * 0.006;
      var _hh = ((s.totalAngle || 2.5 * Math.PI * 2) / (Math.PI * 2)) * (s.helixPitch || 2.8) * 0.5;
      s.targetScrollY = Math.max(-_hh, Math.min(_hh, s.targetScrollY - dy * 0.01));
      galleryDragState.velocityX = dx * 0.5;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isGridLayout) {
      // Grid / masonry-featured: horizontal drag scrolls through items
      if (s.targetPage !== undefined) {
        s.targetPage -= dx * 0.004;
      } else {
        // Masonry: horizontal drag shifts the group
        s.targetRotationY += dx * 0.003;
      }
      galleryDragState.velocityX = dx * 0.5;
    } else if (isInfiniteDrag) {
      // Infinite drag gallery: direct velocity tracking for X + Y
      galleryDragState.velocityX = dx * 0.8;
      galleryDragState.velocityY = dy * 0.8;
      // Apply immediate position change for responsiveness
      if (s.group) {
        s.group.position.x += dx * 0.008;
        s.group.position.y -= dy * 0.008;
      }
    } else if (isScrollStory) {
      // Scroll story: drag Y moves through list (Y-axis)
      s.targetScrollY -= dy * 0.02;
      // No clamp — infinite scroll via modulo
      // Subtle X parallax
      s.group.position.x += dx * 0.003;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isScrollTunnel) {
      // Scroll tunnel: drag Y moves camera through tunnel (Z-axis)
      s.targetScrollZ -= dy * 0.02;
      // Subtle X parallax
      s.group.position.x += dx * 0.003;
      galleryDragState.velocityY = dy * 0.5;
    } else {
      // Arc carousel: horizontal drag rotates
      var delta = dx * 0.008;
      s.targetAngle += delta;
      galleryDragState.velocity = delta;
    }
    galleryDragState.lastX = x;
    galleryDragState.lastY = y;
  };

  var endHandler = function () {
    galleryDragState.isDragging = false;
    canvas.style.cursor = 'grab';
  };

  var wheelHandler = function (e) {
    if (!galleryStageRegistry[currentRoomKey]) return;
    e.preventDefault();
    var s = galleryStageRegistry[currentRoomKey];
    if (!s) return;

    if (isScrollLayout) {
      if (layout === 'asymmetric-gallery') {
        s.targetScrollY = Math.max(
          -(s.cardCount - 1) * s.asymSpacing * 0.5,
          Math.min(s.asymSpacing * 0.5, s.targetScrollY - e.deltaY * 0.008),
        );
      } else {
        s.targetScrollY = Math.max(
          -(s.cardCount - 1) * s.cardSpacing * 0.5,
          Math.min(s.cardSpacing * 0.5, s.targetScrollY - e.deltaY * 0.008),
        );
      }
    } else if (isInfiniteDrag) {
      // Wheel adds to velocity for infinite drag
      galleryDragState.velocityY += e.deltaY * 0.05;
      galleryDragState.velocityX += e.deltaX * 0.05;
    } else if (isScrollStory) {
      // Wheel scrolls through story list (Y-axis)
      s.targetScrollY -= e.deltaY * 0.015;
      // No clamp — infinite scroll via modulo
    } else if (isScrollTunnel) {
      // Wheel scrolls through tunnel (Z-axis)
      s.targetScrollZ -= e.deltaY * 0.015;
      // No clamp — camera moves freely through tunnel
    } else if (isHelixLayout) {
      s.targetRotationY += e.deltaY * 0.003;
    } else if (isGridLayout) {
      if (s.targetPage !== undefined) {
        s.targetPage -= e.deltaY * 0.002;
      } else {
        s.targetRotationY += e.deltaY * 0.002;
      }
    } else {
      s.targetAngle += e.deltaY * 0.002;
    }
  };

  canvas.style.cursor = 'grab';
  ListenerRegistry.add('gallery-carousel', canvas, 'mousedown', startHandler);
  // Issue 23: touchstart must be non-passive so the browser knows we may
  // call preventDefault on touchmove (needed for drag-to-rotate gallery).
  ListenerRegistry.add('gallery-carousel', canvas, 'touchstart', startHandler, { passive: false });
  ListenerRegistry.add('gallery-carousel', document, 'mousemove', moveHandler);
  ListenerRegistry.add('gallery-carousel', document, 'touchmove', moveHandler, { passive: false });
  ListenerRegistry.add('gallery-carousel', document, 'mouseup', endHandler);
  ListenerRegistry.add('gallery-carousel', document, 'touchend', endHandler);
  ListenerRegistry.add('gallery-carousel', canvas, 'wheel', wheelHandler, { passive: false });
}

function animateGalleryCarousel() {
  var state = galleryStageRegistry[currentRoomKey];
  if (!state || !state.group) return;

  var layout = state.layout;
  var isScrollAnim =
    layout === 'asymmetric-gallery' ||
    layout === 'scroll-narrative' ||
    layout === 'vertical' ||
    layout === 'scroll-story' ||
    layout === 'scroll-tunnel';
  var isInfiniteDrag = layout === 'infinite-drag-gallery';
  var isScrollStory = layout === 'scroll-story';
  var isScrollTunnel = layout === 'scroll-tunnel';

  if (isScrollAnim) {
    // ── Scroll-driven animation: scroll-narrative, vertical, scroll-story ──
    var scrollSpacing = layout === 'scroll-story' ? state.itemSpacing || 2.5 : state.cardSpacing || 3.5;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.targetScrollY += galleryDragState.velocityY * 0.012;
        galleryDragState.velocityY *= 0.93;
      }
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetRotationX += galleryDragState.velocityX * 0.003;
        state.targetRotationX *= 0.93;
      }
    }

    // Clamp
    var maxScr = (state.cardCount - 1) * scrollSpacing * 0.5;
    state.targetScrollY = Math.max(-maxScr, Math.min(maxScr * 0.5, state.targetScrollY));
    state.targetRotationX = Math.max(-0.15, Math.min(0.15, state.targetRotationX));

    // Interpolate
    state.scrollY += (state.targetScrollY - state.scrollY) * 0.1;
    state.currentRotationX += (state.targetRotationX - state.currentRotationX) * 0.08;
    state.group.position.y = state.scrollY;
    state.group.rotation.x = state.currentRotationX;

    // Fade cards based on distance from center
    state.planes.forEach(function (plane) {
      var cardY = plane.userData.baseY + state.scrollY;
      var distFromCenter = Math.abs(cardY);
      var normalizedDist = Math.min(distFromCenter / (scrollSpacing * 2), 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - normalizedDist * 0.7);
      }
    });

    // ── Scroll-story specific: LERP scroll + modulo recycling + opacity ──
    if (isScrollStory) {
      var lerp = state.lerpFactor || 0.1;
      var prev = state.currentScrollY;
      // Core LERP: current += (target - current) * factor
      state.currentScrollY += (state.targetScrollY - state.currentScrollY) * lerp;
      // Scroll velocity for shader
      var velocity = state.currentScrollY - prev;
      // Apply scroll to group Y position
      state.group.position.y = state.currentScrollY;
      // Modulo recycling: wrap items that exit viewport
      var totalH = state.totalHeight;
      var halfH = totalH / 2;
      state.planes.forEach(function (plane) {
        if (!plane.userData) return;
        var y = plane.userData.initialY + state.currentScrollY;
        // Modulo wrap for infinite scroll
        y = ((y + halfH) % totalH) - halfH;
        plane.position.y = y;
        // Opacity based on distance from center (hover revelation)
        var dist = Math.abs(y);
        var t = Math.min(dist / (state.itemSpacing * 2.0), 1.0);
        var opacity = 1.0 - t * t * (3.0 - 2.0 * t); // smoothstep
        if (plane.material && plane.material.opacity !== undefined) {
          plane.material.opacity = opacity;
        }
      });
      // Update shader uniforms
      if (state.sharedUniforms) {
        state.sharedUniforms.uTime.value = performance.now() * 0.001;
        state.sharedUniforms.uScrollY.value = state.currentScrollY;
        state.sharedUniforms.uVelocity.value = velocity;
      }
    }
    // ── Scroll-tunnel specific: move camera through Z-axis tunnel ──
    if (isScrollTunnel) {
      var prevZ = state.scrollZ;
      state.scrollZ += (state.targetScrollZ - state.scrollZ) * 0.08;
      var scrollVelocity = state.scrollZ - prevZ;
      // Move camera through tunnel
      if (camera) {
        camera.position.z = state.scrollZ;
      }
      // Subtle floating
      var time = performance.now() * 0.001;
      if (camera) {
        camera.position.y = Math.sin(time * 0.5) * 0.03;
      }
      // Update shader uniforms
      if (state.sharedUniforms) {
        state.sharedUniforms.uTime.value = time;
        state.sharedUniforms.uScrollZ.value = state.scrollZ;
        state.sharedUniforms.uFov.value = state.fov || 60;
      }
      // Opacity based on Z distance from camera
      state.planes.forEach(function (plane) {
        if (!plane.userData) return;
        var relZ = Math.abs(plane.userData.baseZ - state.scrollZ);
        var t = Math.min(relZ / (state.tunnelLength * 0.35), 1.0);
        var opacity = 1.0 - t * t * (3.0 - 2.0 * t);
        if (plane.material && plane.material.opacity !== undefined) {
          plane.material.opacity = opacity;
        }
      });
    }
  } else if (isInfiniteDrag) {
    // ── Infinite drag gallery: X + Y velocity with friction, infinite wrap ──
    var friction = 0.95;
    var vpW = camera.right - camera.left;
    var vpH = camera.top - camera.bottom;
    var thresholdX = vpW / 2 + state.cardW * 0.5 + state.spacing;
    var thresholdY = vpH / 2 + state.cardH * 0.5 + state.spacing;
    var totalW = state.gridTotalW + state.spacing;
    var totalH = state.gridTotalH + state.spacing;

    // Apply velocity to group position
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.group.position.x += galleryDragState.velocityX * 0.008;
        galleryDragState.velocityX *= friction;
      }
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.group.position.y += galleryDragState.velocityY * 0.008;
        galleryDragState.velocityY *= friction;
      }
    }

    // Infinite wrap: reposition meshes that exit viewport
    var cam = camera;
    var vpLeft = cam.position.x + cam.left;
    var vpRight = cam.position.x + cam.right;
    var vpTop = cam.position.y + cam.top;
    var vpBottom = cam.position.y + cam.bottom;
    var tmpVec = new THREE.Vector3();

    state.planes.forEach(function (plane) {
      if (!plane.userData) return;
      plane.getWorldPosition(tmpVec);
      if (tmpVec.x > vpRight + thresholdX) {
        plane.userData.baseX -= totalW;
        plane.position.x = plane.userData.baseX;
      } else if (tmpVec.x < vpLeft - thresholdX) {
        plane.userData.baseX += totalW;
        plane.position.x = plane.userData.baseX;
      }
      plane.getWorldPosition(tmpVec);
      if (tmpVec.y > vpTop + thresholdY) {
        plane.userData.baseY -= totalH;
        plane.position.y = plane.userData.baseY;
      } else if (tmpVec.y < vpBottom - thresholdY) {
        plane.userData.baseY += totalH;
        plane.position.y = plane.userData.baseY;
      }
    });

    // Update shader uniforms
    if (state.useShader && state.sharedUniforms) {
      var speed = Math.sqrt(
        galleryDragState.velocityX * galleryDragState.velocityX +
          galleryDragState.velocityY * galleryDragState.velocityY,
      );
      state.sharedUniforms.uTime.value = performance.now() * 0.001;
      state.sharedUniforms.uVelocity.value = speed;
    }
  } else if (layout === 'helix' || layout === 'scroll-narrative') {
    // ── Helix / scroll-narrative animation ──
    // If scrollDriven, the scroll-narrative uses the scroll loop above (isScrollAnim).
    // This branch handles helix and scroll-narrative drag-to-rotate.
    // Drag X rotates around the helix, drag Y scrolls up/down through spiral.
    var _hr = state.helixRadius || 5;
    var _hp = state.helixPitch || 2.8;
    var _ht = state.totalAngle || 2.5 * Math.PI * 2;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetRotationY += galleryDragState.velocityX * 0.004;
        galleryDragState.velocityX *= 0.94;
      }
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.targetScrollY -= galleryDragState.velocityY * 0.008;
        galleryDragState.velocityY *= 0.94;
      }
    }

    // Clamp: scrollY maps to angular offset within the helix
    var _halfSpan = (_ht / (Math.PI * 2)) * _hp * 0.5;
    state.targetScrollY = Math.max(-_halfSpan, Math.min(_halfSpan, state.targetScrollY));

    // Smooth interpolation
    state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.08;
    state.currentScrollY += (state.targetScrollY - state.currentScrollY) * 0.1;

    // Apply rotation to whole group (spins the helix)
    state.group.rotation.y = state.currentRotationY;
    // Apply vertical offset to whole group
    state.group.position.y = state.currentScrollY;

    // Fade cards based on angular distance from front-facing position
    state.planes.forEach(function (plane) {
      var _baseAngle = plane.userData.baseAngle || 0;
      var _cardY = plane.userData.baseY || 0;
      var _angleInHelix = _baseAngle + state.currentRotationY;
      var _yInHelix = _cardY + state.currentScrollY;
      // Fade based on how far from center Y
      var _distY = Math.abs(_yInHelix);
      var _norm = Math.min(_distY / (_halfSpan * 0.8 + 0.01), 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - _norm * 0.6);
      }
    });
  } else if (layout === 'grid' || layout === 'masonry-featured') {
    // ── Grid / masonry-featured animation ──
    // Horizontal drag/scroll pages through the grid.
    var _gz = state.gridSpacingX || 3.2;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetPage -= galleryDragState.velocityX * 0.003;
        galleryDragState.velocityX *= 0.92;
      }
    }

    // Clamp to page bounds (continuous — can scroll smoothly between pages)
    var _maxPage = Math.max(0, (state.totalPages || 1) - 1);
    state.targetPage = Math.max(-0.5, Math.min(_maxPage + 0.5, state.targetPage));

    // Smooth interpolation of Z position (pages are 20 units apart in Z)
    state.currentZ += (state.targetPage * -20 - state.currentZ) * 0.08;
    state.currentPage = Math.round(state.targetPage);

    // Apply Z translation to group (slides pages in/out)
    state.group.position.z = state.currentZ;

    // Fade cards based on Z distance from camera (current page = fully visible)
    state.planes.forEach(function (plane) {
      var _pd = plane.userData.pageDepth || 0;
      var _zd = Math.abs(_pd - state.currentZ);
      var _gridNorm = Math.min(_zd / 15, 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - _gridNorm * 0.85);
      }
    });
  } else {
    // ── Arc carousel animation (original) ──
    // Apply inertia when not dragging
    if (!galleryDragState.isDragging && Math.abs(galleryDragState.velocity) > 0.0001) {
      state.targetAngle += galleryDragState.velocity;
      galleryDragState.velocity *= 0.95;
    }
    // Smooth rotation
    state.currentAngle += (state.targetAngle - state.currentAngle) * 0.08;
    var count = state.planes.length;
    if (count < 2) return;
    var arcDegrees = state.arcDegrees || 140;
    var radius = state.radius || 7;
    var step = arcDegrees / (count - 1);
    var startAngle = -arcDegrees / 2;
    state.planes.forEach(function (plane, index) {
      var baseAngle = startAngle + step * index;
      var angleDeg = baseAngle + state.currentAngle * (180 / Math.PI);
      var rad = (angleDeg * Math.PI) / 180;
      var x = Math.sin(rad) * radius;
      var z = Math.cos(rad) * radius * -1;
      plane.position.x = x;
      plane.position.z = z;
    });
  }
}

var galleryRaycaster = new (window.THREE ? window.THREE.Raycaster : function () {})();
var galleryMouse = new (window.THREE ? window.THREE.Vector2 : function () {})();

function handleGalleryStageClick(event, camera, canvas) {
  // Issue 9: Don't process gallery clicks if user clicked a hotspot or UI element
  if (
    event.target &&
    event.target.closest(
      '[data-hotspot-btn], .immersive-header, .immersive-fab, .immersive-guided-prompt, .immersive-room-badge, .immersive-flash-sale-banner',
    )
  )
    return;
  if (!currentRoomKey || !galleryStageRegistry[currentRoomKey]) return;
  if (!window.THREE) return;

  var state = galleryStageRegistry[currentRoomKey];
  if (!state.planes || !state.planes.length) return;

  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) / rect.width;
  var y = (event.clientY - rect.top) / rect.height;
  galleryMouse.x = x * 2 - 1;
  galleryMouse.y = -(y * 2 - 1);

  galleryRaycaster.setFromCamera(galleryMouse, camera);
  var intersects = galleryRaycaster.intersectObjects(state.planes, true);
  if (!intersects.length) return;
  var mesh = intersects[0].object;
  var data = mesh.userData || {};

  if (data.productHandle && typeof window.openProductPanel === 'function') {
    window.openProductPanel(data.productHandle);
  } else if (data.collectionHandle && typeof window.openCollectionPanel === 'function') {
    window.openCollectionPanel(data.collectionHandle);
  }
}

// ---------------------------------------------------------------------------
// HOTSPOT CONFIGURATION
// ---------------------------------------------------------------------------

function getLiquidRoomConfig() {
  var configEl = document.getElementById('immersive-rooms-config');
  if (!configEl) return null;
  try {
    return JSON.parse(configEl.textContent);
  } catch (e) {
    // Silently fail for production
    return null;
  }
}

function getRoomConfigWithLiquidOverride(roomKey) {
  var jsConfig = STORE_ROOMS[roomKey];
  if (!jsConfig) return null;

  var liquidConfig = getLiquidRoomConfig();
  if (!liquidConfig || !liquidConfig[roomKey]) return jsConfig;

  var liquid = liquidConfig[roomKey];
  var merged = {};

  Object.keys(jsConfig).forEach(function (key) {
    merged[key] = jsConfig[key];
  });

  ['baseTextureUrl', 'mobileBaseTextureUrl', 'depthMapUrl', 'mobileDepthMapUrl', 'hotspots'].forEach(function (key) {
    if (liquid[key] != null) {
      merged[key] = liquid[key];
    }
  });

  return merged;
}

function getRoomData(roomKey) {
  var room =
    typeof getRoomConfigWithLiquidOverride === 'function'
      ? getRoomConfigWithLiquidOverride(roomKey)
      : STORE_ROOMS[roomKey];

  if (!room) {
    // Room config missing - silently skip
    return null;
  }

  return room;
}

var renderer;
var scene;
var camera;
var planeMesh;
var uniforms;
var currentRoomKey = null;
var currentRoomSubMode = null;
var transitioning = false;
var currentImageAspect = 16 / 9;

var textureCache = [];
var textureRefCount = {};
var MAX_CACHED_TEXTURES = 5;
var galleryStageRegistry = {};

// ─────────────────────────────────────────────────────────────────────────────
// Animation Frame Scheduler - tracks all rAF calls for cleanup
// ─────────────────────────────────────────────────────────────────────────────
var _rafIds = [];
function scheduleRaf(callback) {
  var id = requestAnimationFrame(callback);
  _rafIds.push(id);
  return id;
}
function cancelAllRafs() {
  _rafIds.forEach(function (id) {
    cancelAnimationFrame(id);
  });
  _rafIds = [];
}

function getGalleryStageConfig(roomKey) {
  if (!window.immersiveWebglGalleryConfigs) return [];
  return window.immersiveWebglGalleryConfigs[roomKey] || [];
}

// Returns the gallery layout mode for a room key.
// 'vertical' = indrajaal-museum homepage style (scroll-driven vertical stack)
// 'arc' = original horizontal carousel (default fallback)
function getGalleryLayout(roomKey) {
  // Read merchant-chosen layout from per-room section data attributes.
  // Returns the semantic layout name (asymmetric-gallery, scroll-narrative,
  // masonry-featured) which buildGalleryStageForRoom handles as distinct branches.
  var sectionEl = document.querySelector('.immersive-store');
  if (!sectionEl) {
    // Fallback per room — use new 3D layout names
    if (roomKey === 'designer_houses') return 'asymmetric-gallery';
    if (roomKey === 'occasions') return 'scroll-story';
    if (roomKey === 'featured_collections') return 'masonry-featured';
    return 'arc';
  }

  // Try per-room attribute first: data-<room>-layout
  var perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
  var setting = sectionEl.getAttribute(perRoomAttr);

  // Legacy fallback: single global data-gallery-layout
  if (!setting) {
    setting = sectionEl.getAttribute('data-gallery-layout');
  }

  // Valid semantic layout names (passthrough to buildGalleryStageForRoom)
  var validLayouts = {
    'asymmetric-gallery': 1,
    'scroll-story': 1,
    'scroll-tunnel': 1,
    'masonry-featured': 1,
    // Legacy/internal names still supported
    vertical: 1,
    arc: 1,
    helix: 1,
    grid: 1,
    'infinite-drag-gallery': 1,
  };

  if (validLayouts[setting]) return setting;

  // Per-room fallback when setting is missing/invalid — use new 3D layouts
  if (roomKey === 'designer_houses') return 'infinite-drag-gallery';
  if (roomKey === 'occasions') return 'scroll-story';
  if (roomKey === 'featured_collections') return 'masonry-featured';
  return 'arc';
}

function loadGalleryConfigsFromDOM() {
  // Method 1: Read from <script id="immersive-webgl-gallery-configs"> (output by immersive-canvas)
  var el = document.getElementById('immersive-webgl-gallery-configs');
  if (el) {
    try {
      var data = JSON.parse(el.textContent);
      if (data && typeof data === 'object') {
        window.immersiveWebglGalleryConfigs = data;
      }
    } catch (e) {}
  }

  // Method 2: Read from [data-immersive-webgl-gallery-config] DOM elements (output by webgl_gallery_exclusives section)
  // This overrides Method 1 and provides richer data (images, titles, product/collection handles)
  var configEls = document.querySelectorAll('[data-immersive-webgl-gallery-config]');
  if (configEls.length) {
    if (!window.immersiveWebglGalleryConfigs) {
      window.immersiveWebglGalleryConfigs = {};
    }
    configEls.forEach(function (configEl) {
      var roomKey = configEl.getAttribute('data-room-key') || 'storefront';
      var items = Array.prototype.slice
        .call(configEl.querySelectorAll('.immersive-webgl-gallery-config__item'))
        .map(function (itemEl) {
          var imgEl = itemEl.querySelector('.immersive-webgl-gallery-config__img');
          return {
            index: parseInt(itemEl.dataset.galleryIndex || '0', 10),
            room: itemEl.dataset.galleryRoom || roomKey,
            title: itemEl.dataset.galleryTitle || '',
            subtitle: itemEl.dataset.gallerySubtitle || '',
            productHandle: itemEl.dataset.galleryProductHandle || null,
            productId: itemEl.dataset.galleryProductId || null,
            collectionHandle: itemEl.dataset.galleryCollectionHandle || null,
            imageSrc: imgEl ? imgEl.src : null,
            imageWidth: imgEl ? parseInt(imgEl.getAttribute('width'), 10) || 1920 : 1920,
            imageHeight: imgEl ? parseInt(imgEl.getAttribute('height'), 10) || 1080 : 1080,
          };
        });
      window.immersiveWebglGalleryConfigs[roomKey] = items;
    });
  }

  if (window.__IMMERSIVE_DEV__ && window.immersiveWebglGalleryConfigs) {
    var rooms = Object.keys(window.immersiveWebglGalleryConfigs).join(', ');
    var counts = {};
    Object.keys(window.immersiveWebglGalleryConfigs).forEach(function (k) {
      counts[k] = window.immersiveWebglGalleryConfigs[k].length;
    });
    console.log('[Immersive] Gallery configs loaded for rooms:', rooms, 'counts:', JSON.stringify(counts));
  }
}

var lastFrameTime = typeof performance !== 'undefined' ? performance.now() : 0;
var fpsCounter = 0;
var fpsTimer = typeof performance !== 'undefined' ? performance.now() : 0;
var animationFrameId = null;

var immersiveCanvasId = 'immersive-canvas';
var uiLayerId = 'ui-layer';
var glassPanelId = 'glass-panel';

var _immersiveInitBound = false;

var contentCache = {};
var contentCacheOrder = [];
var MAX_CACHE_ENTRIES = 20;
var CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute TTL for cached entries

// Runtime state — mirrors ShahanaImmersive.room for backward compatibility.
// Prefer ShahanaImmersive.room for new code; immersiveState is kept for existing callers.
var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null,
  guided: false,
};

var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
if (shopRoot.slice(-1) !== '/') shopRoot += '/';

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var isMobile = null;
var isTablet = null;
var usesMobileImg = null;
var canvasRect = null;

function evaluateDeviceFlags() {
  // Use actual device type from initDeviceOptimization, not viewport width
  // This prevents loading mobile images on desktop browsers with narrow windows
  var actualDeviceIsMobile = /iPhone|iPad|Android|Mobile/.test(navigator.userAgent);
  var actualDeviceIsTablet = /iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);

  // Only use viewport width as a secondary factor for responsive layout
  // but don't override the actual device type detection
  isMobile = actualDeviceIsMobile || window.innerWidth < 480;
  isTablet = actualDeviceIsTablet || (window.innerWidth >= 480 && window.innerWidth < 768);

  var connectionQuality = 1.0;
  if ('connection' in navigator && navigator.connection) {
    var effType = navigator.connection.effectiveType;
    var qualityMap = {
      'slow-2g': 0.5,
      '2g': 0.5,
      '3g': 0.75,
      '4g': 1.0,
    };
    connectionQuality = qualityMap[effType] || 1.0;

    if (navigator.connection.saveData) {
      connectionQuality = Math.min(connectionQuality, 0.5);
    }

    // Connection quality tracked silently
  }

  usesMobileImg = window.innerWidth < 1024 || connectionQuality < 0.75;
  textureWidth = usesMobileImg ? Math.floor(1200 * connectionQuality) : Math.floor(1920 * connectionQuality);
}

function updateCanvasRect() {
  if (renderer && renderer.domElement) {
    canvasRect = renderer.domElement.getBoundingClientRect();
  }
}

evaluateDeviceFlags();

var textureWidth = usesMobileImg ? 1200 : 1920;
var parallaxStrength = usesMobileImg ? 0.03 : 0.08;

var STATE_KEY = 'immersive_state';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var WISHLIST_KEY = 'immersive_wishlist';
// NOTE: localStorage stores UI state only (wishlist handles, browsing signals).
// No authentication tokens, personal data, or payment information is stored.
// These stores are accessible to any same-origin script per browser security model.
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';
var NAVIGATION_HISTORY_KEY = 'immersive_nav_history';

var _wishlistItems = [];
var _wishlistProductCache = {};
var wishlistPanelTrigger = null;
var activeHotspots = [];
var navigationHistory = [];

function saveState(patch) {
  try {
    var current = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    sessionStorage.setItem(STATE_KEY, JSON.stringify(Object.assign(current, patch)));
  } catch (e) {
    if (window.__IMMERSIVE_DEV__) {
      console.warn('[Immersive] saveState failed:', e);
    }
  }
}

function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
  } catch (e) {
    if (window.__IMMERSIVE_DEV__) {
      console.warn('[Immersive] loadState failed:', e);
    }
    return {};
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch (e) {}
}

function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem(PREFERRED_MODE_KEY, '3d');
  } catch (e) {}
}

function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem(PREFERRED_MODE_KEY);
  } catch (e) {}
}

function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem(PREFERRED_MODE_KEY) === '3d';
  } catch (e) {
    return false;
  }
}

var _navigationHistory = [];

function pushNavigationHistory(roomKey) {
  if (!roomKey) return;
  if (_navigationHistory.length > 0 && _navigationHistory[_navigationHistory.length - 1] === roomKey) {
    return;
  }
  _navigationHistory.push(roomKey);
  if (_navigationHistory.length > 20) {
    _navigationHistory.shift();
  }
  saveNavigationHistory();
  updateBackButton();
}

function popNavigationHistory() {
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] popNavigationHistory - before:', JSON.stringify(_navigationHistory));
  }
  if (_navigationHistory.length > 1) {
    _navigationHistory.pop();
    saveNavigationHistory();
    updateBackButton();
    var previousRoom = _navigationHistory[_navigationHistory.length - 1];
    if (window.__IMMERSIVE_DEV__) {
      console.log(
        '[Immersive] popNavigationHistory - after:',
        JSON.stringify(_navigationHistory),
        'returning:',
        previousRoom,
      );
    }
    return previousRoom;
  }
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] popNavigationHistory - no history to pop');
  }
  return null;
}

// initWishlist is defined in immersive-features.js (more complete version)
// Kept here as a no-op in case something calls it before features loads.
function initWishlist() {
  // Delegated to immersive-features.js initWishlist (uses _wishlistItems)
}

function saveNavigationHistory() {
  try {
    sessionStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(_navigationHistory));
  } catch (e) {}
}

function loadNavigationHistory() {
  try {
    var stored = sessionStorage.getItem(NAVIGATION_HISTORY_KEY);
    _navigationHistory = stored ? JSON.parse(stored) : [];
  } catch (e) {
    _navigationHistory = [];
  }
}

function updateBackButton() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;
  if (_navigationHistory.length > 1) {
    backBtn.hidden = false;
    backBtn.disabled = false;
  } else {
    backBtn.hidden = true;
    backBtn.disabled = true;
  }
}

function initBackButton() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;
  loadNavigationHistory();
  updateBackButton();
  backBtn.addEventListener('click', function () {
    if (window.__IMMERSIVE_DEV__) {
      console.log('[Back] Clicked, mode:', immersiveState.mode, 'history length:', _navigationHistory.length);
    }
    if (immersiveState.mode === 'editorial') {
      // Exiting editorial mode
      exitEditorialMode();
      return;
    }
    var panel = document.getElementById(glassPanelId);
    if (panel && !panel.hasAttribute('hidden')) {
      closePanel(panel);
    }
    var previousRoom = popNavigationHistory();
    if (previousRoom && typeof goToRoom === 'function') {
      goToRoom(previousRoom, false, true);
    }
  });
}

function initFab() {
  var fab = document.querySelector('[data-immersive-fab]');
  var trigger = fab && fab.querySelector('[data-fab-trigger]');
  var actionsContainer = fab && fab.querySelector('[data-fab-actions]');
  if (!fab || !trigger || !actionsContainer) return;

  var isOpen = false;
  // Issue 7: Shared drag state between mousedown/mousemove/mouseup
  var isDragging = false;
  var hasMoved = false;
  var dragStartX = 0;
  var dragStartY = 0;

  trigger.addEventListener('click', function (e) {
    // Issue 7: If user was dragging (not just clicking), suppress toggle
    if (hasMoved) {
      hasMoved = false;
      isDragging = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    isOpen = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      actionsContainer.removeAttribute('hidden');
      fab.classList.add('immersive-fab--open');
    } else {
      actionsContainer.setAttribute('hidden', '');
      fab.classList.remove('immersive-fab--open');
    }
  });

  var startY, startTopPct, startRight;

  fab.addEventListener('mousedown', function (e) {
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startY = e.clientY;
    var style = window.getComputedStyle(fab);
    var topMatch = style.top.match(/([\d.]+)%/);
    startTopPct = topMatch ? parseFloat(topMatch[1]) : 50;
    var rightMatch = style.right.match(/([\d.]+)px/);
    startRight = rightMatch ? parseFloat(rightMatch[1]) : 20;
    fab.style.transition = 'none';
    fab.style.transform = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx = Math.abs(e.clientX - dragStartX);
    var dy = Math.abs(e.clientY - dragStartY);
    // Only count as "moved" after 5px threshold
    if (dx > 5 || dy > 5) {
      hasMoved = true;
    }
    var deltaY = startY - e.clientY;
    var windowH = window.innerHeight;
    var newTopPct = startTopPct + (deltaY / windowH) * 100;
    fab.style.top = newTopPct + '%';
    fab.style.right = startRight + 'px';
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      fab.style.transition = '';
      fab.style.transform = 'translateY(-50%)';
    }
  });

  fab.addEventListener('click', function (e) {
    // Issue 2: Wishlist FAB button should open the wishlist panel, not click
    // an arbitrary [data-wishlist-toggle] on the page (which could be a
    // product card toggle inside an open collection panel).
    var action = e.target.closest('[data-bottom-nav-wishlist]');
    if (action) {
      var wishlistPanel = document.getElementById('immersive-wishlist-panel');
      if (wishlistPanel) {
        // Toggle the wishlist panel visibility
        if (wishlistPanel.hasAttribute('hidden')) {
          wishlistPanel.removeAttribute('hidden');
          var closeBtn = wishlistPanel.querySelector('[data-wishlist-close]');
          if (closeBtn) closeBtn.focus();
        } else {
          wishlistPanel.setAttribute('hidden', '');
        }
      }
      return;
    }
    action = e.target.closest('[data-bottom-nav-cart]');
    if (action) {
      // Issue 2 (cart): Use Dawn's cart-drawer instead of [data-cart-toggle]
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open();
      }
      return;
    }
    action = e.target.closest('[data-bottom-nav-2d]');
    if (action) {
      window.location.href = '/';
    }
  });

  fab.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      trigger.setAttribute('aria-expanded', 'false');
      actionsContainer.setAttribute('hidden', '');
      fab.classList.remove('immersive-fab--open');
    }
  });
}

function initStoryModeListener() {
  window.addEventListener('immersive:story-mode-change', function (event) {
    var detail = event && event.detail ? event.detail : {};
    var active = !!detail.active;
    if (currentRoomKey === 'featured_collections') {
      currentRoomSubMode = active ? 'story' : null;
    } else {
      currentRoomSubMode = null;
    }
    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive] Story mode:', currentRoomSubMode);
    }
  });
}

var vertexShaderSource = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

var fragmentShaderSource = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture1;
  uniform sampler2D uDepth1;
  uniform sampler2D uTexture2;
  uniform sampler2D uDepth2;
  uniform float uTransitionProgress;
  uniform vec2 uMouse;
  uniform float uTiltOffsetX;
  uniform float uTiltOffsetY;
  uniform float uParallaxStrength;
  uniform float uScrollOffset;
  uniform float uScrollVignette;
  uniform float uScrollChroma;
  uniform float uAtmosphericMood;
  uniform float uTime;

  float noise(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec2 parallaxUv(vec2 uv, sampler2D depthTex, vec2 mouse) {
    vec3 depthSample = texture2D(depthTex, uv).rgb;
    float depth = dot(depthSample, vec3(0.299, 0.587, 0.114));
    float d = depth - 0.5;
    vec2 centeredMouse = mouse - 0.5;

    vec2 tiltOffset = vec2(uTiltOffsetX, uTiltOffsetY);
    vec2 offset = (centeredMouse + tiltOffset) * uParallaxStrength * d;

    float scrollWeight = d + 0.5;
    float backCounterShift = (1.0 - scrollWeight) * -0.08;
    float foreSinkingShift = scrollWeight * 0.25;
    float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;

    return uv + offset + vec2(0.0, totalVerticalShift);
  }

  void main() {
    vec2 uv1 = parallaxUv(vUv, uDepth1, uMouse);
    vec2 uv2 = parallaxUv(vUv, uDepth2, uMouse);

    float chroma = uScrollChroma * 0.008;
    vec4 color1, color2;
    if (chroma > 0.0001) {
      vec2 rOffset = vec2(chroma, 0.0);
      vec2 bOffset = vec2(-chroma, 0.0);
      color1 = vec4(
        texture2D(uTexture1, uv1 + rOffset).r,
        texture2D(uTexture1, uv1).g,
        texture2D(uTexture1, uv1 + bOffset).b,
        1.0
      );
      color2 = vec4(
        texture2D(uTexture2, uv2 + rOffset).r,
        texture2D(uTexture2, uv2).g,
        texture2D(uTexture2, uv2 + bOffset).b,
        1.0
      );
    } else {
      color1 = texture2D(uTexture1, uv1);
      color2 = texture2D(uTexture2, uv2);
    }

    float t = clamp(uTransitionProgress, 0.0, 1.0);
    vec4 color = mix(color1, color2, t);

    float breathing = sin(uTime * 0.8) * 0.015 + 0.985;
    color.rgb *= breathing;

    float n = noise(vUv + fract(uTime));
    color.rgb += (n - 0.5) * 0.012;

    vec2 vigUv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vigUv * vec2(0.6, 0.8), vigUv * vec2(0.6, 0.8));
    vignette = clamp(vignette, 0.0, 1.0);
    float vigStrength = 0.18 + uScrollVignette * 0.32;
    color.rgb *= mix(1.0 - vigStrength, 1.0, pow(vignette, 1.4));

    vec3 moodColor = vec3(1.1, 1.05, 0.9);
    color.rgb = mix(color.rgb, color.rgb * moodColor, uAtmosphericMood);

    gl_FragColor = color;
  }
`;

function getRoomTextureUrls(roomKey) {
  var room = getRoomData(roomKey);
  if (!room) {
    // Room definition not found - silently skip
    return null;
  }

  var mobile = usesMobileImg;
  var baseUrl = mobile && room.mobileBaseTextureUrl ? room.mobileBaseTextureUrl : room.baseTextureUrl;
  var depthUrl = mobile && room.mobileDepthMapUrl ? room.mobileDepthMapUrl : room.depthMapUrl;

  if (!baseUrl || !depthUrl) {
    // Missing texture URLs - silently skip
    return null;
  }

  return { roomKey: roomKey, baseTextureUrl: baseUrl, depthMapUrl: depthUrl, hotspots: room.hotspots };
}

function preloadAdjacentRoomTextures(currentRoomKey) {
  var room = getRoomData(currentRoomKey);
  if (!room || !room.hotspots || !room.hotspots.length) return;

  var neighborKeys = new Set();

  room.hotspots.forEach(function (hotspot) {
    if (hotspot.targetRoom) {
      neighborKeys.add(hotspot.targetRoom);
    }
  });

  if (!neighborKeys.size) return;

  var preloadFn = function () {
    neighborKeys.forEach(function (roomKey) {
      var neighborData = getRoomTextureUrls(roomKey);
      if (!neighborData) return;
      loadRoomTextures(neighborData, function () {});
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadFn, { timeout: 1000 });
  } else {
    setTimeout(preloadFn, 250);
  }
}

function preloadRoom(roomKey) {
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;
  var cacheKey = roomData.baseTextureUrl + '|' + roomData.depthMapUrl;

  var isCached = textureCache.some(function (entry) {
    return entry && entry.key === cacheKey;
  });

  if (isCached) return;
  loadRoomTextures(roomData, function () {});
}

function showWelcomeToast() {
  try {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
  } catch (e) {}
  // Issue 25: If onboarding overlay is present and enabled, skip welcome toast (redundant)
  var _ob = document.getElementById('immersive-onboarding');
  if (_ob && !_ob.hasAttribute('hidden') && _ob.getAttribute('data-show-once') !== 'false') return;
  var section = document.querySelector('[data-msg-welcome-toast]');
  var msg = section && section.getAttribute('data-msg-welcome-toast');
  if (!msg) return;
  var wrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!wrapper) return;
  var toast = document.createElement('div');
  toast.className = 'immersive-welcome-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  if (!reduceMotion) toast.classList.add('immersive-welcome-toast--animate-in');

  var textSpan = document.createElement('span');
  textSpan.className = 'immersive-welcome-toast__text';
  textSpan.textContent = msg;

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-welcome-toast__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  toast.appendChild(textSpan);
  toast.appendChild(closeBtn);
  wrapper.appendChild(toast);
  var timer = setTimeout(function () {
    _dismissWelcomeToast(toast);
  }, 5000);
  closeBtn.addEventListener('click', function () {
    clearTimeout(timer);
    _dismissWelcomeToast(toast);
  });
}

function _dismissWelcomeToast(toast) {
  if (!toast || !toast.parentNode) return;
  if (reduceMotion) {
    toast.remove();
    return;
  }
  toast.classList.remove('immersive-welcome-toast--animate-in');
  toast.classList.add('immersive-welcome-toast--animate-out');
  setTimeout(function () {
    if (toast.parentNode) toast.remove();
  }, 300);
}

function initImmersiveScene() {
  var canvas = document.getElementById(immersiveCanvasId);
  var uiLayer = document.getElementById(uiLayerId);
  if (!canvas || !uiLayer) return;

  // Listen for gallery config ready events from data provider sections
  document.addEventListener('immersive:galleryConfigReady', function (evt) {
    var roomKey = evt.detail && evt.detail.roomKey;
    if (!roomKey || roomKey !== currentRoomKey) return;
    if (!getGalleryStageConfig(roomKey).length) return;
    // Dispose old stage if exists
    if (galleryStageRegistry[roomKey]) {
      disposeGalleryStage(roomKey);
    }
    var layout = getGalleryLayout(roomKey);
    // Read semantic layout name from per-room attribute to look up LAYOUT_REGISTRY config
    var sectionEl = document.querySelector('.immersive-store');
    var perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
    var semanticLayout = sectionEl ? sectionEl.getAttribute(perRoomAttr) : null;
    var layoutConfig =
      semanticLayout && LAYOUT_REGISTRY && LAYOUT_REGISTRY[semanticLayout]
        ? LAYOUT_REGISTRY[semanticLayout].config
        : {};
    buildGalleryStageForRoom(roomKey, scene, {
      layout: layout,
      radius: 6,
      arcDegrees: 120,
      verticalOffset: 0.3,
      tiltDegrees: -3,
      cardSpacing: layoutConfig.spacing || 3.5,
      cardHeight: 2.2,
      cardAspect: 2 / 3,
      layoutConfig: layoutConfig,
    });
    if (renderer && renderer.domElement) {
      initGalleryCarousel(renderer.domElement);
    }
    // Hide hotspot buttons — gallery cards are the interaction
    var _uiLayer2 = document.getElementById('ui-layer');
    if (_uiLayer2) {
      _uiLayer2.querySelectorAll('.immersive-hotspot').forEach(function (btn) {
        btn.style.display = 'none';
      });
    }
    hideLoader();
  });

  if (!window.THREE || !isWebGLSupported()) {
    showWebGLFallback(canvas);
    return;
  }

  // Guard: if canvas already has a 2D context (e.g. from Shopify Chat/Replay),
  // clear it before claiming WebGL context
  var existingCtx = canvas.getContext('2d') || canvas.getContext('bitmaprenderer');
  if (existingCtx) {
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Canvas had existing context — clearing before WebGL init');
    // Force-release the existing context by resizing to 0
    canvas.width = 0;
    canvas.height = 0;
  }

  showLoader();

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  // Use viewport width to ensure canvas matches header width (handles scrollbar differences)
  var initWidth = window.innerWidth || canvas.clientWidth || canvas.offsetWidth;
  var initHeight = window.innerHeight || canvas.clientHeight || canvas.offsetHeight;
  renderer.setSize(initWidth, initHeight, false);

  // WebGL context loss recovery
  ListenerRegistry.add('webgl-context-lost', canvas, 'webglcontextlost', function (e) {
    e.preventDefault();
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] WebGL context lost');
    showWebGLFallback(canvas);
  });
  ListenerRegistry.add('webgl-context-restored', canvas, 'webglcontextrestored', function () {
    if (window.__IMMERSIVE_DEV__) console.log('[Immersive] WebGL context restored — reinitializing');
    initImmersiveScene();
  });

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;

  var geometry = new THREE.PlaneGeometry(2, 2);
  var textureLoader = new THREE.TextureLoader();

  var placeholderData = new Uint8Array([0, 0, 0, 255]);
  var placeholder = new THREE.DataTexture(placeholderData, 1, 1);
  placeholder.minFilter = THREE.LinearFilter;
  placeholder.magFilter = THREE.LinearFilter;
  placeholder.needsUpdate = true;

  uniforms = {
    uTexture1: { value: placeholder },
    uDepth1: { value: placeholder },
    uTexture2: { value: placeholder },
    uDepth2: { value: placeholder },
    uTransitionProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTiltOffsetX: { value: 0 },
    uTiltOffsetY: { value: 0 },
    uParallaxStrength: { value: parallaxStrength },
    uScrollOffset: { value: 0 },
    uScrollVignette: { value: 0 },
    uScrollChroma: { value: 0 },
    uAtmosphericMood: { value: 0 },
  };

  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: uniforms,
    transparent: false,
  });

  planeMesh = new THREE.Mesh(geometry, material);
  scene.add(planeMesh);

  updateCanvasRect();
  window.addEventListener('mousemove', handleMouseMove);

  bindResizeHandling();
  handleResize();
  animate();

  var canvasEl = renderer.domElement;
  canvasEl.addEventListener('click', function (event) {
    handleGalleryStageClick(event, camera, canvasEl);
  });

  // Global escape handler — exits gallery/editorial mode
  document.addEventListener('keydown', function onEscKey(e) {
    if (e.key === 'Escape' && immersiveState.mode === 'editorial' && immersiveState.editorialRoom) {
      if (typeof exitEditorialMode === 'function') exitEditorialMode();
    }
  });

  var state = loadState();
  var hasOpenPanel = (state.panel === 'product' && state.product) || (state.panel === 'collection' && state.collection);
  var startRoom = hasOpenPanel && state.room && getRoomData(state.room) ? state.room : 'storefront';

  if (!hasOpenPanel) clearState();

  // Load gallery configs from DOM before first room render
  loadGalleryConfigsFromDOM();

  // Also re-read after a short delay to catch sections that render late
  setTimeout(function () {
    loadGalleryConfigsFromDOM();
  }, 100);

  goToRoom(startRoom, true);
  pushNavigationHistory(startRoom);
  writeImmersivePreference();

  if (state.panel === 'product' && state.product) {
    setTimeout(function () {
      openProductPanel(state.product, state.collection);
    }, 400);
  } else if (state.panel === 'collection' && state.collection) {
    setTimeout(function () {
      openCollectionPanel(state.collection);
    }, 400);
  }
}

function isWebGLSupported() {
  try {
    var testCanvas = document.createElement('canvas');
    return !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

function showWebGLFallback(canvas) {
  var room = getRoomData('lounge');
  if (!room) return;
  var wrapper = canvas.parentElement;
  if (!wrapper) return;
  var img = document.createElement('img');
  var _fallbackImgTimeout = setTimeout(function () {
    if (!img.complete) {
      console.warn('[Immersive] Fallback image load timeout:', room.baseTextureUrl);
      img.style.display = 'none';
    }
  }, 30000);
  img.onload = function () {
    clearTimeout(_fallbackImgTimeout);
  };
  img.onerror = function () {
    clearTimeout(_fallbackImgTimeout);
  };
  img.src = room.baseTextureUrl;
  img.alt = '';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  wrapper.appendChild(img);
  canvas.style.display = 'none';
  renderHotspots('lounge');
}

// ---------------------------------------------------------------------------
// Three.js logo transition overlay
// ---------------------------------------------------------------------------

var transitionLogoMesh = null;
var transitionLogoTex = null;

function showLoader() {
  if (!scene || !window.THREE) return;
  var THREE = window.THREE;

  // Already showing
  if (transitionLogoMesh) return;

  // Read logo URL from the canvas wrapper data attribute
  var wrapper = document.querySelector('.immersive-store__canvas-wrapper');
  var logoUrl = wrapper ? wrapper.getAttribute('data-logo-url') : '';
  if (!logoUrl) return;

  // Load logo texture
  transitionLogoTex = new THREE.TextureLoader().load(logoUrl, function (tex) {
    tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    tex.anisotropy = 8;
  });
  transitionLogoTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;

  // Compute aspect-corrected plane that covers the full viewport in screen-space.
  // We place the plane at z = -1 (just in front of the camera) and size it so
  // it spans the full frustum at that depth — effectively a fullscreen quad.
  var aspect = camera ? camera.aspect : window.innerWidth / window.innerHeight;
  var vFov = camera ? (camera.fov * Math.PI) / 180 : (70 * Math.PI) / 180;
  var h = 2 * Math.tan(vFov / 2) * 1.05; // z = 1
  var w = h * aspect;

  // Logo plane: use a larger plane scaled down so the logo sits in the centre
  // with plenty of black around it.
  var logoH = h * 0.35; // logo fills 35 % of viewport height
  var imgAspect = transitionLogoTex.image ? transitionLogoTex.image.width / transitionLogoTex.image.height : 1;
  var logoW = logoH * Math.max(imgAspect, 0.5);

  var geom = new THREE.PlaneGeometry(logoW, logoH, 1, 1);
  var mat = new THREE.MeshBasicMaterial({
    map: transitionLogoTex,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  });

  transitionLogoMesh = new THREE.Mesh(geom, mat);
  transitionLogoMesh.renderOrder = 9999;
  transitionLogoMesh.material.onBeforeCompile = function (shader) {
    shader.uniforms.uTime = { value: 0 };
    shader.fragmentShader =
      'uniform float uTime;\n' +
      shader.fragmentShader.replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        'float pulse = 0.85 + 0.15 * sin(uTime * 2.5);\n' +
          'gl_FragColor = vec4(outgoingLight, diffuseColor.a * pulse);',
      );
    transitionLogoMesh.userData.shader = shader;
  };

  scene.add(transitionLogoMesh);

  // Fade the logo in via the existing room-transition opacity uniform so it
  // matches the shader cross-fade timing.  We drive the material opacity from
  // the render loop.
  transitionLogoMesh.userData.fadeIn = true;
  transitionLogoMesh.userData.fadeOut = false;
  transitionLogoMesh.userData.fadeStart = performance.now();
}

function hideLoader() {
  if (!transitionLogoMesh) return;
  transitionLogoMesh.userData.fadeIn = false;
  transitionLogoMesh.userData.fadeOut = true;
  transitionLogoMesh.userData.fadeStart = performance.now();
}

// Called every frame from the main render loop to drive logo opacity.
function updateTransitionLogo(timeNow) {
  if (!transitionLogoMesh) return;

  var mesh = transitionLogoMesh;
  var mat = mesh.material;
  var ud = mesh.userData;
  var elapsed = (timeNow - ud.fadeStart) / 1000; // seconds

  if (ud.fadeIn && !ud.fadeOut) {
    // Fade in over 0.35 s
    mat.opacity = Math.min(elapsed / 0.35, 1.0);
    if (mat.opacity >= 1) {
      ud.fadeIn = false;
    }
  } else if (ud.fadeOut) {
    // Fade out over 0.35 s, then dispose
    mat.opacity = Math.max(1.0 - elapsed / 0.35, 0.0);
    if (mat.opacity <= 0) {
      // Clean up
      if (transitionLogoTex) {
        transitionLogoTex.dispose();
        transitionLogoTex = null;
      }
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      transitionLogoMesh = null;
      return;
    }
  }

  // Pulse animation (glow) while visible
  if (mat.opacity > 0 && mat.onBeforeCompile) {
    // handled by onBeforeCompile shader
  }
  if (ud.shader) {
    ud.shader.uniforms.uTime.value = timeNow / 1000;
  }
}

var mouseTarget = { x: 0.5, y: 0.5 };
var mouseCurrent = { x: 0.5, y: 0.5 };
var lerpFactor = 0.08;

function handleMouseMove(event) {
  if (!canvasRect) updateCanvasRect();
  if (!canvasRect) return;
  var rect = canvasRect;
  mouseTarget.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  mouseTarget.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  if (Math.abs(mouseTarget.x - 0.5) > 0.01 || Math.abs(mouseTarget.y - 0.5) > 0.01) {
    // Mouse position tracked silently
  }
}

var resizeRaf = null;
var lastMobile = isMobile;
var lastOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

function onWindowResize() {
  if (resizeRaf !== null) return;
  resizeRaf = requestAnimationFrame(function () {
    resizeRaf = null;
    var wasMobile = isMobile;
    var wasUsesMobileImg = usesMobileImg;
    evaluateDeviceFlags();
    updateCanvasRect();
    handleResize();

    var currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    if (isMobile !== lastMobile || currentOrientation !== lastOrientation || usesMobileImg !== wasUsesMobileImg) {
      lastMobile = isMobile;
      lastOrientation = currentOrientation;
      if (currentRoomKey) renderHotspots(currentRoomKey);

      // Reload room texture if device type, orientation, or mobile-image flag changed
      if (
        (wasMobile !== isMobile || usesMobileImg !== wasUsesMobileImg || currentOrientation !== lastOrientation) &&
        currentRoomKey
      ) {
        var roomData = getRoomTextureUrls(currentRoomKey);
        if (roomData) {
          showLoader();
          loadRoomTextures(roomData, function (baseTexture, depthTexture) {
            if (uniforms) {
              uniforms.uTexture1.value = baseTexture;
              uniforms.uDepth1.value = depthTexture;
              uniforms.uTexture2.value = baseTexture;
              uniforms.uDepth2.value = depthTexture;
              uniforms.uTransitionProgress.value = 0;
            }
            // Rebuild gallery stage for new screen size
            if (getGalleryStageConfig(currentRoomKey).length) {
              if (galleryStageRegistry[currentRoomKey]) {
                disposeGalleryStage(currentRoomKey);
              }
              var _sectionEl = document.querySelector('.immersive-store');
              var _perRoomAttr = 'data-' + currentRoomKey.replace(/_/g, '-') + '-layout';
              var _semanticLayout = _sectionEl ? _sectionEl.getAttribute(_perRoomAttr) : null;
              var _layoutConfig =
                _semanticLayout && LAYOUT_REGISTRY && LAYOUT_REGISTRY[_semanticLayout]
                  ? LAYOUT_REGISTRY[_semanticLayout].config
                  : {};
              buildGalleryStageForRoom(currentRoomKey, scene, {
                layout: getGalleryLayout(currentRoomKey),
                radius: 6,
                arcDegrees: 120,
                verticalOffset: 0.3,
                tiltDegrees: -3,
                cardSpacing: _layoutConfig.spacing || 3.5,
                cardHeight: 2.2,
                cardAspect: 2 / 3,
                layoutConfig: _layoutConfig,
              });
            }
            hideLoader();
          });
        }
      }
    }
  });
}

var resizeObserver = null;
var orientationMediaQuery = null;
var orientationListener = null;

function bindResizeHandling() {
  // Use ResizeObserver for canvas size changes when available (more accurate)
  // Fall back to window resize listener for broader compatibility
  if ('ResizeObserver' in window && renderer && renderer.domElement) {
    resizeObserver = new ResizeObserver(function () {
      onWindowResize();
    });
    resizeObserver.observe(renderer.domElement);
  } else {
    ListenerRegistry.add('window-resize', window, 'resize', onWindowResize);
  }
  // Issue 13: Removed separate orientation matchMedia listener.
  // Orientation changes always fire a resize event too, and our RAF
  // debounce in onWindowResize already deduplicates. The extra listener
  // caused triple-fires (resize + observer + orientation) leading to
  // incorrect device flag evaluation on some mobile browsers.
}

function unbindResizeHandling() {
  // Clean up whichever resize mechanism was used
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', onWindowResize);
  }
  if (orientationMediaQuery && orientationListener) {
    orientationMediaQuery.removeEventListener('change', orientationListener);
    orientationMediaQuery = null;
    orientationListener = null;
  }
}

function handleResize(roomKeyOverride) {
  if (!renderer || !camera) return;
  evaluateDeviceFlags();
  var canvas = renderer.domElement;
  // Use viewport width to ensure canvas matches header width (handles scrollbar differences)
  var width = window.innerWidth || canvas.clientWidth;
  var height = window.innerHeight || canvas.clientHeight;
  if (width === 0 || height === 0) return;

  renderer.setSize(width, height, false);

  // Update camera to match new aspect ratio
  var aspect = width / height;
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = aspect;
  } else {
    camera.left = -aspect;
    camera.right = aspect;
    camera.top = 1;
    camera.bottom = -1;
  }
  camera.updateProjectionMatrix();

  if (planeMesh) {
    var resolvedRoomKey = roomKeyOverride || currentRoomKey;
    var room = resolvedRoomKey && getRoomData(resolvedRoomKey);
    var hasDedicatedMobileImage = usesMobileImg && room && room.mobileBaseTextureUrl;
    if (hasDedicatedMobileImage && isMobile) {
      planeMesh.scale.set(1, 1, 1);
    } else if (hasDedicatedMobileImage && isTablet) {
      var canvasAspect = width / height;
      var imageAspect = currentImageAspect;
      if (canvasAspect > imageAspect) {
        planeMesh.scale.set(1, canvasAspect / imageAspect, 1);
      } else {
        planeMesh.scale.set(imageAspect / canvasAspect, 1, 1);
      }
    } else {
      var canvasAspect = width / height;
      var imageAspect = currentImageAspect;
      if (canvasAspect > imageAspect) {
        planeMesh.scale.set(1, canvasAspect / imageAspect, 1);
      } else {
        planeMesh.scale.set(imageAspect / canvasAspect, 1, 1);
      }
    }
    planeMesh.position.set(0, 0, 0);
  }
  if (immersiveState.mode === 'editorial') cacheEditorialOverlay();
}

var editorialScrollProgress = 0;
var editorialOverlayEl = null;
var editorialMaxScroll = 0;
var atmosphericMoodProgress = 0;

function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay') || null;
  editorialMaxScroll = editorialOverlayEl ? editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight : 0;
}

var tiltControlEnabled = false;
var tiltBeta = 0;
var tiltGamma = 0;
var tiltXSmoothed = 0;
var tiltYSmoothed = 0;
var tiltNormX = 0;
var tiltNormY = 0;

function handleDeviceOrientation(event) {
  tiltBeta = event.beta || 0;
  tiltGamma = event.gamma || 0;
}

function enableTiltControl() {
  if (tiltControlEnabled) return;
  if (!isMobile) return;
  if (reduceMotion) return;
  if (!window.DeviceOrientationEvent) return;

  function startListening() {
    tiltControlEnabled = true;
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(function (state) {
        if (state === 'granted') {
          startListening();
        } else {
          tiltControlEnabled = false;
        }
      })
      .catch(function () {
        tiltControlEnabled = false;
      });
  } else {
    startListening();
  }
}

function disableTiltControl() {
  if (!tiltControlEnabled) return;
  tiltControlEnabled = false;
  window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
  tiltBeta = 0;
  tiltGamma = 0;
  tiltXSmoothed = 0;
  tiltYSmoothed = 0;
}

function initTiltControlToggle() {
  var toggleBtn = document.querySelector('[data-immersive-tilt-toggle]');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', function () {
    if (tiltControlEnabled) {
      disableTiltControl();
      toggleBtn.setAttribute('aria-pressed', 'false');
    } else {
      enableTiltControl();
      if (tiltControlEnabled) {
        toggleBtn.setAttribute('aria-pressed', 'true');
      }
    }
  });
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  if (!uniforms) return;

  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

  // Animate gallery carousel rotation
  if (galleryStageRegistry[currentRoomKey]) {
    animateGalleryCarousel();
  }

  // Animate transition logo overlay
  updateTransitionLogo(performance.now());

  if (!reduceMotion && activeHotspots.length > 0) {
    for (var i = 0; i < activeHotspots.length; i++) {
      var h = activeHotspots[i];
      var dx = mouseCurrent.x - h.x;
      var dy = mouseCurrent.y - h.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var scale = 1.0;
      if (dist < 0.15) {
        var proximity = 1.0 - dist / 0.15;
        scale = 1.0 + 0.3 * proximity;
      }
      h.el.style.setProperty('--hotspot-scale', scale);
    }
  }

  if (tiltControlEnabled && immersiveState.mode === 'showroom' && !reduceMotion) {
    if (typeof tiltBeta === 'undefined' || typeof tiltGamma === 'undefined') {
      disableTiltControl();
    } else {
      tiltNormX = Math.max(-1, Math.min(1, (tiltGamma || 0) / 45));
      tiltNormY = Math.max(-1, Math.min(1, ((tiltBeta || 0) - 45) / 45));
    }
  }
  tiltXSmoothed += (tiltNormX - tiltXSmoothed) * 0.1;
  tiltYSmoothed += (tiltNormY - tiltYSmoothed) * 0.1;

  if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
    uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
    uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
  }

  if (!tiltControlEnabled && (tiltXSmoothed !== 0 || tiltYSmoothed !== 0)) {
    tiltXSmoothed *= 0.85;
    tiltYSmoothed *= 0.85;
    if (Math.abs(tiltXSmoothed) < 0.001) tiltXSmoothed = 0;
    if (Math.abs(tiltYSmoothed) < 0.001) tiltYSmoothed = 0;
    if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
      uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
      uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
    }
  }

  if (immersiveState.mode === 'editorial') {
    if (!editorialOverlayEl) cacheEditorialOverlay();
    if (editorialOverlayEl && editorialMaxScroll > 0) {
      var targetProgress = editorialOverlayEl.scrollTop / editorialMaxScroll;
      editorialScrollProgress += (targetProgress - editorialScrollProgress) * 0.1;
      uniforms.uScrollOffset.value = editorialScrollProgress;
      if (!reduceMotion) {
        uniforms.uScrollVignette.value += (editorialScrollProgress - uniforms.uScrollVignette.value) * 0.06;
        uniforms.uScrollChroma.value += (editorialScrollProgress - uniforms.uScrollChroma.value) * 0.06;
        if (immersiveState.editorialRoom === 'featured_collections') {
          atmosphericMoodProgress += (editorialScrollProgress - atmosphericMoodProgress) * 0.04;
          uniforms.uAtmosphericMood.value = atmosphericMoodProgress;
        }
      }
    }
  } else if (editorialScrollProgress > 0.001) {
    editorialScrollProgress *= 0.85;
    uniforms.uScrollOffset.value = editorialScrollProgress;
    if (!reduceMotion) {
      uniforms.uScrollVignette.value *= 0.85;
      uniforms.uScrollChroma.value *= 0.85;
      atmosphericMoodProgress *= 0.85;
      uniforms.uAtmosphericMood.value = atmosphericMoodProgress;
    }
  } else {
    editorialScrollProgress = 0;
    atmosphericMoodProgress = 0;
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
    uniforms.uAtmosphericMood.value = 0;
  }

  var frameNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
  var lastNow = window._immersiveLastFrameTime || frameNow;
  var deltaSec = (frameNow - lastNow) / 1000;
  window._immersiveLastFrameTime = frameNow;
  applyRoomVisualProfile(currentRoomKey, currentRoomSubMode, deltaSec);

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  if (typeof performance !== 'undefined' && window.__IMMERSIVE_DEV__) {
    var frameTime = frameNow - lastFrameTime;
    lastFrameTime = frameNow;
    fpsCounter++;
    if (frameNow - fpsTimer > 1000) {
      var fps = Math.round((fpsCounter * 1000) / (frameNow - fpsTimer));
      fpsCounter = 0;
      fpsTimer = frameNow;
    }
    if (frameTime > 16.67) {
      console.warn('[Immersive] Frame budget exceeded', frameTime);
    }
  }
}

function updateRoomBadge(roomKey) {
  var badge = document.getElementById('immersive-room-badge');
  if (!badge) return;
  var nameEl = badge.querySelector('[data-room-badge-name]');
  var guidanceEl = badge.querySelector('[data-room-badge-guidance]');
  var name = badge.getAttribute('data-room-name-' + roomKey) || roomKey;
  var guidance = badge.getAttribute('data-room-guidance-' + roomKey) || '';
  if (nameEl) nameEl.textContent = name;
  if (guidanceEl) guidanceEl.textContent = guidance;
}

function goToRoom(roomKey, initial, skipHistory) {
  galleryDragState.isDragging = false;
  galleryDragState.velocity = 0;
  galleryDragState.velocityX = 0;
  galleryDragState.velocityY = 0;
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;

  saveState({ room: roomKey, panel: null, product: null, collection: null });
  immersiveState.currentRoom = roomKey;
  // Gallery rooms pre-set mode/editorialRoom before calling goToRoom.
  // Don't override if already set to editorial.
  if (immersiveState.mode !== 'editorial') {
    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
  }

  if (!initial && !skipHistory) {
    pushNavigationHistory(roomKey);
  }

  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    transitioning = true;
    showLoader();
    if (reduceMotion) {
      uiLayer.style.transition = '';
      uiLayer.style.opacity = '0';
      _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
    } else {
      uiLayer.style.transition = 'opacity 0.25s ease-in-out';
      uiLayer.style.opacity = '0';
      setTimeout(function () {
        _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
      }, 250);
    }
  } else {
    _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
  }
  // Clear any pending rAF IDs from previous room transition
  _rafIds = [];
}

function focusCodexSection() {
  var codex =
    document.querySelector('[data-codex-typo-index]') || document.querySelector('[data-codex-collections-grid]');
  if (!codex) return;
  try {
    codex.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    var rect = codex.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - 80;
    window.scrollTo(0, top);
  }
}

function focusStoryRailSection() {
  var story = document.querySelector('[data-immersive-story-rail]');
  if (!story) return;
  try {
    story.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    var rect = story.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - 80;
    window.scrollTo(0, top);
  }
}

function _startRoomTextureLoad(roomKey, roomData, uiLayer, initial) {
  // Capture expected room at time of request; reject stale loads
  var expectedRoom = roomKey;
  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
    // Guard: skip stale texture loads if room changed since this request started
    if (!initial && currentRoomKey !== null && currentRoomKey !== expectedRoom) return;
    if (initial || currentRoomKey === null) {
      uniforms.uTexture1.value = baseTexture;
      uniforms.uDepth1.value = depthTexture;
      uniforms.uTexture2.value = baseTexture;
      uniforms.uDepth2.value = depthTexture;
      currentRoomKey = roomKey;
      uiLayer.style.transition = '';
      uiLayer.style.opacity = '1';
      renderHotspots(roomKey);
      updateRoomBadge(roomKey);
      preloadAdjacentRoomTextures(roomKey);
      var tagline = document.getElementById('immersive-tagline');
      if (tagline) tagline.classList.remove('is-visible');
      hideLoader();
      showWelcomeToast();
      trackImmersiveEvent('room_viewed', { room_key: roomKey });
      return;
    }

    var oldBase = uniforms.uTexture1.value;
    var oldDepth = uniforms.uDepth1.value;

    uniforms.uTexture2.value = baseTexture;
    uniforms.uDepth2.value = depthTexture;

    var duration = reduceMotion ? 0 : 800;
    var start = performance.now();
    var startProgress = uniforms.uTransitionProgress.value;

    function step(now) {
      var elapsed = now - start;
      var t = Math.min(elapsed / duration, 1);
      var eased = t * t * (3 - 2 * t);
      uniforms.uTransitionProgress.value = startProgress + (1 - startProgress) * eased;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (oldBase && !isCachedTexture(oldBase)) oldBase.dispose();
        if (oldDepth && !isCachedTexture(oldDepth)) oldDepth.dispose();

        uniforms.uTexture1.value = uniforms.uTexture2.value;
        uniforms.uDepth1.value = uniforms.uDepth2.value;
        uniforms.uTransitionProgress.value = 0;
        currentRoomKey = roomKey;

        if (getGalleryStageConfig(roomKey).length) {
          var _sectionEl2 = document.querySelector('.immersive-store');
          var _perRoomAttr2 = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
          var _semanticLayout2 = _sectionEl2 ? _sectionEl2.getAttribute(_perRoomAttr2) : null;
          var _layoutConfig2 =
            _semanticLayout2 && LAYOUT_REGISTRY && LAYOUT_REGISTRY[_semanticLayout2]
              ? LAYOUT_REGISTRY[_semanticLayout2].config
              : {};
          buildGalleryStageForRoom(roomKey, scene, {
            layout: getGalleryLayout(roomKey),
            radius: 6,
            arcDegrees: 120,
            verticalOffset: 0.3,
            tiltDegrees: -3,
            cardSpacing: _layoutConfig2.spacing || 3.5,
            cardHeight: 2.2,
            cardAspect: 2 / 3,
            layoutConfig: _layoutConfig2,
          });
          initGalleryCarousel(renderer.domElement);

          // Hide hotspot buttons — gallery cards are the interaction
          var _uiLayer = document.getElementById('ui-layer');
          if (_uiLayer) {
            _uiLayer.querySelectorAll('.immersive-hotspot').forEach(function (btn) {
              btn.style.display = 'none';
            });
          }

          // Adjust atmosphere for gallery mode
          if (uniforms) {
            if (uniforms.uAtmosphericMood) uniforms.uAtmosphericMood.value = 0.6;
            if (uniforms.uScrollVignette) uniforms.uScrollVignette.value = 0.25;
          }

          // Show gallery hint
          if (typeof showGalleryHint === 'function') {
            showGalleryHint(roomKey);
          }
        } else {
          // Only render hotspots for non-gallery rooms
          renderHotspots(roomKey);
        }

        updateRoomBadge(roomKey);
        preloadAdjacentRoomTextures(roomKey);
        var tagline = document.getElementById('immersive-tagline');
        if (tagline) tagline.classList.remove('is-visible');
        trackImmersiveEvent('room_viewed', { room_key: roomKey });

        if (reduceMotion) {
          uiLayer.style.transition = '';
          uiLayer.style.opacity = '1';
          transitioning = false;
        } else {
          uiLayer.style.transition = 'opacity 0.25s ease-in-out';
          uiLayer.style.opacity = '1';
          setTimeout(function () {
            transitioning = false;
          }, 250);
        }
      }
    }

    requestAnimationFrame(step);
  });
}

function loadRoomTextures(roomData, callback) {
  var cacheKey = roomData.baseTextureUrl + '|' + roomData.depthMapUrl;

  var cachedIndex = textureCache.findIndex(function (entry) {
    return entry && entry.key === cacheKey;
  });

  if (cachedIndex !== -1) {
    var cached = textureCache.splice(cachedIndex, 1)[0];
    textureCache.unshift(cached);
    callback(cached.base, cached.depth);
    return;
  }

  var loader = new THREE.TextureLoader();
  var loaded = { base: null, depth: null };
  var failed = false;
  var retryAttempts = 0;

  var timeoutId = setTimeout(function () {
    if (!loaded.base || !loaded.depth) {
      onError('timeout');
    }
  }, 15000);

  function onBothLoaded() {
    if (!loaded.base || !loaded.depth) return;
    clearTimeout(timeoutId);

    if (loaded.base.image && loaded.depth.image) {
      textureCache.unshift({ key: cacheKey, base: loaded.base, depth: loaded.depth });
      textureRefCount[cacheKey] = (textureRefCount[cacheKey] || 0) + 1;
      if (textureCache.length > MAX_CACHED_TEXTURES) {
        var oldest = textureCache.pop();
        if (oldest && oldest.key) {
          textureRefCount[oldest.key] = (textureRefCount[oldest.key] || 1) - 1;
          var isActive =
            uniforms &&
            uniforms.uTexture1 &&
            uniforms.uDepth1 &&
            (uniforms.uTexture1.value === oldest.base || uniforms.uDepth1.value === oldest.depth);
          if (!isActive && textureRefCount[oldest.key] <= 0) {
            try {
              if (oldest.base) oldest.base.dispose();
              if (oldest.depth) oldest.depth.dispose();
            } catch (e) {}
            delete textureRefCount[oldest.key];
          }
        }
      }
    }

    callback(loaded.base, loaded.depth);
  }

  function onError(which) {
    if (failed) return;
    failed = true;
    clearTimeout(timeoutId);
    // Failed to load texture - tracked silently

    if (!retryAttempts || retryAttempts < 1) {
      retryAttempts = (retryAttempts || 0) + 1;
      // Retrying texture load
      setTimeout(function () {
        loadRoomTextures(roomData, callback);
      }, 1000);
      return;
    }

    hideLoader();
    if (!currentRoomKey) {
      var canvas = document.getElementById(immersiveCanvasId);
      if (canvas) showWebGLFallback(canvas);
    }
    // Issue 4: Mid-session texture failure -- show user-facing error and let them retry
    if (typeof showFeedback === 'function') {
      showFeedback('Unable to load scene. Please check your connection and try again.', 'error');
    }
    transitioning = false;
  }

  loader.load(
    roomData.baseTextureUrl,
    function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (tex.image && tex.image.width && tex.image.height) {
        currentImageAspect = tex.image.width / tex.image.height;
        var loadingRoomKey = roomData.roomKey;
        requestAnimationFrame(function () {
          handleResize(loadingRoomKey);
        });
      }
      loaded.base = tex;
      onBothLoaded();
    },
    undefined,
    function () {
      onError('base');
    },
  );

  loader.load(
    roomData.depthMapUrl,
    function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      loaded.depth = tex;
      if (window.__IMMERSIVE_DEV__) {
        console.log(
          '[Immersive] Depth texture loaded for',
          roomData.roomKey,
          'size:',
          tex.image?.width + 'x' + tex.image?.height,
        );
      }
      onBothLoaded();
    },
    undefined,
    function () {
      onError('depth');
    },
  );
}

function isCachedTexture(texture) {
  return textureCache.some(function (entry) {
    return entry.base === texture || entry.depth === texture;
  });
}

function renderHotspots(roomKey) {
  var room = getRoomData(roomKey);
  var uiLayer = document.getElementById(uiLayerId);
  if (!room || !uiLayer) return;

  function getEditorialSafeMinYPercent() {
    var header = document.querySelector('.immersive-header');
    if (!header) return null;
    var headerRect = header.getBoundingClientRect();
    var layerRect = uiLayer.getBoundingClientRect();
    if (!layerRect || !layerRect.height) return null;
    var safeTopPx = headerRect.bottom + 8;
    var safeTopRelativePx = safeTopPx - layerRect.top;
    var minY = (safeTopRelativePx / layerRect.height) * 100;
    return Math.max(0, Math.min(95, minY));
  }

  function render() {
    uiLayer.innerHTML = '';
    activeHotspots = [];
    var editorialMinYPercent = getEditorialSafeMinYPercent();

    var sortedHotspots = room.hotspots.slice().sort(function (a, b) {
      var ay = usesMobileImg && a.mobileY != null ? a.mobileY : a.y;
      var by = usesMobileImg && b.mobileY != null ? b.mobileY : b.y;
      var ax = usesMobileImg && a.mobileX != null ? a.mobileX : a.x;
      var bx = usesMobileImg && b.mobileX != null ? b.mobileX : b.x;
      if (Math.abs(ay - by) >= 10) return ay - by;
      return ax - bx;
    });

    sortedHotspots.forEach(function (hotspot) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'immersive-hotspot';
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-label', hotspot.label);
      button.setAttribute('data-hotspot-btn', '');
      var srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = hotspot.label;
      button.appendChild(srSpan);

      var ringSpan = document.createElement('span');
      ringSpan.className = 'immersive-hotspot__ring';
      ringSpan.setAttribute('aria-hidden', 'true');
      button.appendChild(ringSpan);

      if (hotspot.label && hotspot.label.trim()) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'immersive-hotspot__label';
        labelSpan.setAttribute('aria-hidden', 'true');
        labelSpan.textContent = hotspot.label;
        button.appendChild(labelSpan);
      }

      button.style.position = 'absolute';
      var posX = usesMobileImg && hotspot.mobileX != null ? hotspot.mobileX : hotspot.x;
      var posY = usesMobileImg && hotspot.mobileY != null ? hotspot.mobileY : hotspot.y;
      if (hotspot.targetEditorialRoom && editorialMinYPercent !== null && posY < editorialMinYPercent) {
        posY = editorialMinYPercent;
      }
      button.style.left = posX + '%';
      button.style.top = posY + '%';

      activeHotspots.push({
        el: button,
        x: posX / 100,
        y: posY / 100,
      });

      button.addEventListener('click', function () {
        if (window.__IMMERSIVE_DEV__) {
          console.log('[Immersive] Hotspot clicked:', JSON.stringify(hotspot));
        }

        if (!hotspot.startExperience) {
          exitGuidedMode();
        }

        if (hotspot.targetEditorialRoom) {
          enterEditorialMode(hotspot.targetEditorialRoom, button);
        } else if (hotspot.targetRoom) {
          if (hotspot.startExperience) {
            activateGuidedMode();
            window.ShahanaImmersive.settings.interactionEnabled = true;
          }
          goToRoom(hotspot.targetRoom);
        } else if (hotspot.targetStory) {
          goToRoom(hotspot.target || 'featured_collections');
          currentRoomSubMode = 'story';
          setTimeout(focusStoryRailSection, 300);
        } else if (hotspot.targetCodex) {
          goToRoom('featured_collections');
          setTimeout(focusCodexSection, 300);
        } else if (hotspot.targetCollection) {
          openCollectionPanel(hotspot.targetCollection);
        }
      });

      if (hotspot.targetRoom || hotspot.targetEditorialRoom) {
        button.addEventListener(
          'mouseenter',
          function () {
            if (hotspot.targetRoom) {
              preloadRoom(hotspot.targetRoom);
            }
          },
          { once: true },
        );
      }

      uiLayer.appendChild(button);
    });
  }

  if (document.startViewTransition) {
    document.startViewTransition(render);
  } else {
    render();
  }
}

function openDialogFocus(panel, triggerEl) {
  if (!panel) return;
  panel._panelTrigger = triggerEl || null;
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  var firstFocusable =
    closeBtn ||
    panel.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
  if (firstFocusable) {
    requestAnimationFrame(function () {
      firstFocusable.focus();
    });
  }
  if (!panel._onEscapeKey) {
    panel._onEscapeKey = function (e) {
      if (e.key === 'Escape') closePanel(panel);
    };
    panel.addEventListener('keydown', panel._onEscapeKey);
  }
}

function closeDialogFocus(panel, triggerEl) {
  if (!panel) return;
  if (panel._onEscapeKey) {
    panel.removeEventListener('keydown', panel._onEscapeKey);
    panel._onEscapeKey = null;
  }
  var target = triggerEl || panel._panelTrigger;
  panel._panelTrigger = null;
  if (target && typeof target.focus === 'function') {
    requestAnimationFrame(function () {
      target.focus();
    });
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])'
    )
  ).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
}

function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstFocusableEl = focusableElements[0];
  const lastFocusableEl = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) { // Shift + Tab
    if (document.activeElement === firstFocusableEl) {
      lastFocusableEl.focus();
      event.preventDefault();
    }
  } else { // Tab
    if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      event.preventDefault();
    }
  }
}

function openPanel(panel, triggerEl) {
  if (!panel) return null;
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  if (closeBtn && !closeBtn._clickBound) {
    closeBtn._clickBound = true;
    ListenerRegistry.add('panel-close-' + panel.id, closeBtn, 'click', function () {
      closePanel(panel);
    });
  }
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');
  panel.setAttribute('data-open', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  
  // Store the trigger element to return focus later
  panel._panelTrigger = triggerEl;

  // Add focus trap
  const trapFocusHandler = trapFocus.bind(null, panel);
  ListenerRegistry.add('panel-trap-focus-' + panel.id, panel, 'keydown', trapFocusHandler);
  
  // Handle escape key
  const escapeHandler = function(e) {
    if (e.key === 'Escape') closePanel(panel);
  };
  ListenerRegistry.add('panel-escape-' + panel.id, panel, 'keydown', escapeHandler);

  var enteringClass =
    panel.id === 'glass-panel' ? 'immersive-store__panel--entering' : 'immersive-editorial-overlay--entering';
  if (!reduceMotion) {
    panel.classList.add(enteringClass);
    setTimeout(function () {
      panel.classList.remove(enteringClass);
      // Ensure focus is within the panel
      const focusable = getFocusableElements(panel);
      if (focusable.length > 0) focusable[0].focus();
      else panel.focus(); // Fallback to panel itself
    }, 350);
  } else {
    const focusable = getFocusableElements(panel);
    if (focusable.length > 0) focusable[0].focus();
    else panel.focus(); // Fallback to panel itself
  }
  return triggerEl;
}

function closePanel(panel) {
  if (!panel) return;
  
  // Remove focus trap and escape handler
  ListenerRegistry.cleanup('panel-trap-focus-' + panel.id);
  ListenerRegistry.cleanup('panel-escape-' + panel.id);

  panel.removeAttribute('data-open');
  panel.removeAttribute('role');
  panel.removeAttribute('aria-modal');

  // Return focus to the element that opened the panel
  if (panel._panelTrigger && typeof panel._panelTrigger.focus === 'function') {
    requestAnimationFrame(function() {
      panel._panelTrigger.focus();
    });
  }
  panel._panelTrigger = null;
  // Issue 5: Clear panel state from sessionStorage on close so a page
  // refresh doesn't reopen the panel with potentially stale data.
  if (typeof clearState === 'function') clearState();
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}

function setPanelRoomLabel(panel) {
  var labelEl = panel && panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || '' : '';
  labelEl.textContent = roomName;
}

function fetchWithCache(url) {
  var cached = contentCache[url];
  if (cached) {
    // Check staleness — evict entries older than CACHE_TTL_MS
    if (cached.timestamp && (Date.now() - cached.timestamp) > CACHE_TTL_MS) {
      delete contentCache[url];
      var staleIdx = contentCacheOrder.indexOf(url);
      if (staleIdx > -1) contentCacheOrder.splice(staleIdx, 1);
      cached = null;
    }
  }
  if (cached) {
    var idx = contentCacheOrder.indexOf(url);
    if (idx > -1) contentCacheOrder.splice(idx, 1);
    contentCacheOrder.push(url);
    return Promise.resolve(cached.html);
  }
  var _ctrl = new AbortController();
  var _fetchTimeout = setTimeout(function () {
    _ctrl.abort();
  }, 30000);
  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: _ctrl.signal })
    .then(function (response) {
      clearTimeout(_fetchTimeout);
      if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
      return response.text();
    })
    .catch(function (_fetchErr) {
      clearTimeout(_fetchTimeout);
      if (_fetchErr.name === 'AbortError') console.warn('[Immersive] Fetch timed out:', url);
      throw _fetchErr;
    })
    .then(function (html) {
      if (contentCacheOrder.length >= MAX_CACHE_ENTRIES) {
        var oldest = contentCacheOrder.shift();
        delete contentCache[oldest];
      }
      contentCache[url] = { html: html, timestamp: Date.now() };
      contentCacheOrder.push(url);
      return html;
    });
}

function fetchSectionHtml(path, sectionId, extraParams) {
  var url = path;
  var separator = url.indexOf('?') >= 0 ? '&' : '?';
  url += separator + 'sections=' + encodeURIComponent(sectionId);

  if (extraParams && typeof extraParams === 'object') {
    Object.keys(extraParams).forEach(function (key) {
      if (extraParams[key] != null) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
      }
    });
  }

  var _ctrl2 = new AbortController();
  var _fetchTimeout2 = setTimeout(function () {
    _ctrl2.abort();
  }, 30000);
  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: _ctrl2.signal })
    .then(function (response) {
      clearTimeout(_fetchTimeout2);
      if (!response.ok) return null;
      return response.json();
    })
    .catch(function (err) {
      clearTimeout(_fetchTimeout2);
      if (err.name === 'AbortError') console.warn('[Immersive] Fetch timed out:', url);
      return null;
    })
    .then(function (json) {
      if (!json || typeof json !== 'object') return null;
      var html = json[sectionId];
      if (!html) return null;
      return html;
    })
    .catch(function (err) {
      // Section Rendering error - tracked silently
      return null;
    });
}

function recordBrowsingSignal(roomKey) {
  if (!roomKey) return;
  try {
    var raw = localStorage.getItem('immersive_browsing_signals');
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) signals = [];
    signals.push(roomKey);
    if (signals.length > 50) signals = signals.slice(signals.length - 50);
    localStorage.setItem('immersive_browsing_signals', JSON.stringify(signals));
  } catch (e) {}
}

function trackRoomVisit(roomKey) {
  if (_browsingContext && _browsingContext.visitedRooms.indexOf(roomKey) === -1) {
    _browsingContext.visitedRooms.push(roomKey);
  }
  evaluateRoomRecommendation();
}

var _browsingContext = { visitedRooms: [], savedProducts: [], viewedCollections: [], cartCollections: [] };

var BRIDAL_KEYWORDS = ['bridal', 'bride', 'wedding', 'mehndi', 'nikah', 'walima', 'barat'];
var DESIGNER_HOUSE_COLLECTIONS = ['suffuse', 'soraya', 'saad-bin-shahzad'];

function getRecommendation(context) {
  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

function evaluateRoomRecommendation() {
  if (!_browsingContext.visitedRooms.length) return;
  var rec = getRecommendation(_browsingContext);
  if (!rec) return;
  try {
    if (sessionStorage.getItem('immersive_rec_dismissed_' + rec.roomKey)) return;
  } catch (e) {}
}

function showRoomRecommendation(rec) {
  var existing = document.querySelector('.immersive-rec-chip');
  if (existing) existing.remove();
}

function performEditorialUIActivation(overlay, canvas) {
  if (canvas && !reduceMotion) {
    canvas.classList.add('editorial-blur');
  }
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('is-active');
  overlay.scrollTop = 0;

  var backBtn = document.getElementById('immersive-editorial-back');
  if (backBtn) {
    if (!reduceMotion) {
      overlay.classList.add('immersive-editorial-overlay--entering');
      setTimeout(function () {
        overlay.classList.remove('immersive-editorial-overlay--entering');
        backBtn.focus();
      }, 350);
    } else {
      requestAnimationFrame(function () {
        backBtn.focus();
      });
    }
    if (!backBtn._editorialBound) {
      backBtn._editorialBound = true;
      backBtn.addEventListener('click', exitEditorialMode);
    }
  }
}

function exitGuidedMode() {
  if (!immersiveState || !immersiveState.guided) return;

  immersiveState.guided = false;

  var prompt = document.getElementById('immersive-guided-prompt');
  if (prompt) {
    prompt.style.display = 'none';
    prompt.setAttribute('aria-hidden', 'true');
  }

  var progress = document.getElementById('immersive-guided-progress');
  if (progress) {
    progress.style.display = 'none';
    progress.setAttribute('aria-hidden', 'true');
  }

  if (window.__immersiveGuidedTimeout) {
    clearTimeout(window.__immersiveGuidedTimeout);
    window.__immersiveGuidedTimeout = null;
  }

  try {
    trackImmersiveEvent &&
      trackImmersiveEvent('guided_mode_exited', {
        room: immersiveState.currentRoom || null,
      });
  } catch (e) {}
}

function activateGuidedMode() {
  if (!immersiveState) return;

  immersiveState.guided = true;

  var prompt = document.getElementById('immersive-guided-prompt');
  if (prompt) {
    prompt.style.display = 'block';
    prompt.removeAttribute('aria-hidden');
  }

  var progress = document.getElementById('immersive-guided-progress');
  if (progress) {
    progress.style.display = 'flex';
    progress.removeAttribute('aria-hidden');
  }

  var progressDots = progress ? progress.querySelectorAll('.immersive-guided-progress__dot') : [];
  progressDots.forEach(function (dot, index) {
    dot.classList.remove('is-active', 'is-done');
    if (index === 0) dot.classList.add('is-active');
  });

  try {
    trackImmersiveEvent &&
      trackImmersiveEvent('guided_mode_entered', {
        room: immersiveState.currentRoom || null,
      });
  } catch (e) {}
}

function updateCameraForMode() {
  if (!camera) return;
  var strength = isMobile ? 0.03 : 0.08;
  if (uniforms && uniforms.uParallaxStrength) {
    uniforms.uParallaxStrength.value = strength;
  }
}

function updateBackToLoungeVisibility(roomKey) {
  var btn = document.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  btn.hidden = roomKey === 'lounge';
}

function readGalleryConfig() {
  var root = document.querySelector('[data-immersive-webgl-gallery-config]');
  if (!root) return [];

  var items = root.querySelectorAll('[data-gallery-index]');
  var result = [];

  items.forEach(function (item) {
    result.push({
      roomKey: root.getAttribute('data-room-key') || null,
      index: parseInt(item.getAttribute('data-gallery-index') || '0', 10),
      title: item.getAttribute('data-gallery-title') || '',
      subtitle: item.getAttribute('data-gallery-subtitle') || '',
      productHandle: item.getAttribute('data-gallery-product-handle') || '',
      collectionHandle: item.getAttribute('data-gallery-collection-handle') || '',
    });
  });

  return result;
}

window.readGalleryConfig = readGalleryConfig;

function openOverlay(overlayId, overlayContentId, fetchUrl, onOpenCallback) {
  var overlay = document.getElementById(overlayId);
  var overlayContent = document.getElementById(overlayContentId);

  if (!overlay || !overlayContent) return;

  // Clear previous room content to prevent flash of old content when switching rooms
  overlayContent.innerHTML = '';

  if (!contentCache[fetchUrl]) {
    overlayContent.innerHTML =
      '<div style="height:60vh;display:flex;align-items:center;justify-content:center;color:#d4af37;">Loading...</div>';
  }

  var performUIActivation = function () {
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-active');
    overlay.scrollTop = 0;
    if (typeof onOpenCallback === 'function') {
      onOpenCallback(overlay, overlayContent);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(performUIActivation);
  } else {
    performUIActivation();
  }

  fetchWithCache(fetchUrl)
    .then(function (response) {
      // Handle Section Rendering API JSON response
      var html = response;
      try {
        var json = JSON.parse(response);
        // Extract HTML from first section key if JSON
        var sectionKeys = Object.keys(json);
        if (sectionKeys.length > 0 && typeof json[sectionKeys[0]] === 'string') {
          html = json[sectionKeys[0]];
        }
      } catch (e) {
        // Not JSON, use response as-is (plain HTML)
      }
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var images = temp.querySelectorAll('img:not([loading])');
      for (var i = 0; i < images.length; i++) {
        images[i].setAttribute('loading', 'lazy');
      }
      overlayContent.innerHTML = temp.innerHTML;

      // Fix: Find the specific layout container and ensure it is visible inside the overlay
      var editorialSection = overlayContent.querySelector('.immersive-editorial');
      if (editorialSection) {
        editorialSection.style.setProperty('display', 'block', 'important');
      }

      // Initialize editorial layout-specific JS
      if (typeof initDesignersEditorial === 'function') initDesignersEditorial(overlayContent);
      if (typeof initOccasionsEditorial === 'function') initOccasionsEditorial(overlayContent);
      if (typeof initFeaturedCollectionsEditorial === 'function') initFeaturedCollectionsEditorial(overlayContent);
      if (typeof initCoverflow === 'function') initCoverflow(overlayContent);
      if (typeof initStacked === 'function') initStacked(overlayContent);
      if (typeof initPerspective === 'function') initPerspective(overlayContent);

      // Initialize quick view buttons on any product cards in the overlay
      var cards = overlayContent.querySelectorAll('.immersive-product-card');
      cards.forEach(function (card) {
        if (typeof initQuickViewButtons === 'function') initQuickViewButtons(card);
      });
    })
    .catch(function (err) {
      console.error('[Immersive] Overlay fetch failed:', err);
      // Fallback: use the source section's innerHTML which is already in the DOM
      var fallbackSection = document.querySelector(
        '.immersive-editorial[data-room-key="' +
          ((window.immersiveState && window.immersiveState.editorialRoom) || '') +
          '"]',
      );
      if (fallbackSection) {
        overlayContent.innerHTML = fallbackSection.innerHTML;
        var editorialSection = overlayContent.querySelector('.immersive-editorial');
        if (editorialSection) {
          editorialSection.style.setProperty('display', 'block', 'important');
        }
        if (typeof initDesignersEditorial === 'function') initDesignersEditorial(overlayContent);
        if (typeof initOccasionsEditorial === 'function') initOccasionsEditorial(overlayContent);
        if (typeof initFeaturedCollectionsEditorial === 'function') initFeaturedCollectionsEditorial(overlayContent);
      } else {
        overlayContent.innerHTML =
          '<div style="height:60vh;display:flex;align-items:center;justify-content:center;color:#d4af37;padding:2rem;text-align:center;">' +
          '<p>The story is temporarily unavailable.</p>' +
          '<p style="font-size:0.8rem;color:rgba(212,175,55,0.6);margin-top:1rem;">Please check your connection and try again.</p>' +
          '</div>';
      }
    });
}

// ---------------------------------------------------------------------------
// Shared editorial data layer -- cross-room state for the immersive overlay
// ---------------------------------------------------------------------------
var editorialData = {
  currentRoom: null,
  previousRoom: null,
  viewedProducts: [], // product handles seen across rooms
  viewedCollections: [], // collection handles seen across rooms
  navigationHistory: [], // room keys visited in this editorial session
  wishlistHandles: null, // cache of wishlist handles (synced from global _wishlistItems)

  enterRoom: function (roomKey) {
    if (this.currentRoom) {
      this.previousRoom = this.currentRoom;
    }
    this.currentRoom = roomKey;
    this.navigationHistory.push(roomKey);
    this.refreshWishlist();
  },

  exitRoom: function () {
    this.previousRoom = this.currentRoom;
    this.currentRoom = null;
  },

  getViewedProducts: function () {
    return this.viewedProducts.slice();
  },

  addViewedProduct: function (handle) {
    if (handle && this.viewedProducts.indexOf(handle) === -1) {
      this.viewedProducts.push(handle);
    }
  },

  addViewedCollection: function (handle) {
    if (handle && this.viewedCollections.indexOf(handle) === -1) {
      this.viewedCollections.push(handle);
    }
  },

  refreshWishlist: function () {
    if (typeof _wishlistItems !== 'undefined') {
      this.wishlistHandles = _wishlistItems.map(function (item) {
        return typeof item === 'string' ? item : item.handle;
      });
    }
  },

  isInWishlist: function (productHandle) {
    if (!this.wishlistHandles) this.refreshWishlist();
    return this.wishlistHandles && this.wishlistHandles.indexOf(productHandle) !== -1;
  },

  getNavigationHistory: function () {
    return this.navigationHistory.slice();
  },

  hasVisitedRoom: function (roomKey) {
    return this.navigationHistory.indexOf(roomKey) !== -1;
  },
};

// ---------------------------------------------------------------------------
// Editorial layout initializers
// ---------------------------------------------------------------------------

function initDesignersEditorial(root) {
  if (!root) return;
  var designersEl = root.querySelector('.immersive-designers');
  if (!designersEl) return;

  var markers = designersEl.querySelectorAll('.immersive-designers__marker');
  var heroStates = designersEl.querySelectorAll('.immersive-designers__hero-state');
  var productsContainer = designersEl.querySelector('.immersive-designers__products');
  if (!markers.length || !heroStates.length) return;

  function switchDesigner(index) {
    heroStates.forEach(function (state, i) {
      state.classList.toggle('is-active', i === index);
    });
    markers.forEach(function (marker, i) {
      marker.classList.toggle('is-active', i === index);
    });
  }

  markers.forEach(function (marker) {
    marker.addEventListener('click', function () {
      var idx = parseInt(marker.getAttribute('data-index'), 10);
      if (isNaN(idx)) return;
      switchDesigner(idx);

      // Load products for this designer's collection
      var collectionHandle = marker.getAttribute('data-collection-handle');
      if (collectionHandle && productsContainer) {
        if (typeof editorialData !== 'undefined') {
          editorialData.addViewedCollection(collectionHandle);
        }
        productsContainer.innerHTML = '<div class="immersive-editorial__loading">Loading...</div>';
        var fetchUrl = shopRoot + 'collections/' + collectionHandle + '?sections=immersive-product-grid';
        fetchWithCache(fetchUrl)
          .then(function (html) {
            if (html) {
              productsContainer.innerHTML = html;
              // Track viewed products
              var productHandles = productsContainer.querySelectorAll('[data-product-handle]');
              productHandles.forEach(function (el) {
                if (typeof editorialData !== 'undefined') {
                  editorialData.addViewedProduct(el.getAttribute('data-product-handle'));
                }
              });
              // Init product card clicks within editorial
              productHandles.forEach(function (card) {
                card.addEventListener('click', function (e) {
                  e.preventDefault();
                  var handle = card.getAttribute('data-product-handle');
                  if (handle) {
                    if (typeof editorialData !== 'undefined') {
                      editorialData.addViewedProduct(handle);
                    }
                    exitEditorialMode();
                    setTimeout(function () {
                      openProductPanel(handle, collectionHandle);
                    }, 120);
                  }
                });
              });
            } else {
              productsContainer.innerHTML = '<p class="immersive-editorial__empty">No products found.</p>';
            }
          })
          .catch(function () {
            productsContainer.innerHTML = '<p class="immersive-editorial__empty">Unable to load products.</p>';
          });
      }
    });
  });
}

function initOccasionsEditorial(root) {
  if (!root) return;
  // Occasions are primarily content-driven; collection links handled by overlay delegation
  // Add any occasion-specific JS here (e.g., scroll-triggered chapter reveals)
}

function initFeaturedCollectionsEditorial(root) {
  if (!root) return;
  // Featured collection items use data-collection, handled by overlay delegation
  // Add any codex-specific JS here (e.g., grid animation on scroll)
}
// All top-level `var` and `function` declarations are already on `window`,
// but we expose these explicitly for clarity and robustness.
// ---------------------------------------------------------------------------
window.STORE_ROOMS = STORE_ROOMS;
window.immersiveState = immersiveState;
window.contentCache = contentCache;
window.shopRoot = shopRoot;
window.reduceMotion = reduceMotion;
window.immersiveCanvasId = immersiveCanvasId;
window.uiLayerId = uiLayerId;
window.glassPanelId = glassPanelId;
window.currentRoomKey = currentRoomKey;

// Initialize device optimization on load
initDeviceOptimization();

// ---------------------------------------------------------------------------
// Auto-init: bind initImmersiveScene to DOMContentLoaded (with double-init guard)
// _immersiveInitBound is defined at top of file (line ~1583)
// ---------------------------------------------------------------------------
function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  _immersiveInitBound = true;
  if (typeof initImmersiveScene === 'function') initImmersiveScene();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeBindImmersiveInit);
} else {
  safeBindImmersiveInit();
}
