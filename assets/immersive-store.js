const STORE_ROOMS = {
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
    ],
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
    mobileBaseTextureUrl: 'https://picsum.photos/id/1080/900/1600',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=900&quality=60',
    hotspots: [
      { x: 25, y: 40, label: 'SS5 Summer Pret 26', targetCollection: 'summer-pret-26-eid-edit-saad-bin-shahzad' },
      { x: 50, y: 50, label: 'Suffuse Luxury Pret', targetCollection: 'luxury-pret-suffuse' },
      { x: 75, y: 40, label: 'Soraya Eid Pret', targetCollection: 'lumene-festive-25-26-soraya-official' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ],
  },
};

// Merge theme-editor-configured room data (from section JSON block) into STORE_ROOMS
(function mergeDynamicRoomConfig() {
  var configEl = document.getElementById('immersive-rooms-config');
  if (!configEl) return;
  var jsonText = configEl.textContent || configEl.innerText || '';
  if (!jsonText.trim()) return;
  var config;
  try {
    config = JSON.parse(jsonText);
  } catch (e) {
    console.warn('[Immersive] Failed to parse immersive-rooms-config JSON', e);
    return;
  }
  if (!config || typeof config !== 'object') return;
  Object.keys(config).forEach(function (roomKey) {
    var roomConfig = config[roomKey];
    if (!roomConfig || typeof roomConfig !== 'object') return;
    if (!STORE_ROOMS[roomKey]) STORE_ROOMS[roomKey] = {};
    Object.keys(roomConfig).forEach(function (field) {
      // Only override if the value is non-null/non-empty
      if (roomConfig[field] !== null && roomConfig[field] !== '') {
        console.log('[Immersive] Config override:', roomKey, field, JSON.stringify(roomConfig[field]).slice(0, 120));
        STORE_ROOMS[roomKey][field] = roomConfig[field];
      }
    });
  });
})();

// ---------------------------------------------------------------------------
// Hotspot normalization helpers
// Map raw hotspot config into a normalized shape with an explicit type and
// target. This lets us handle 'room', 'collection_panel', and 'editorial'
// hotspots consistently regardless of whether they came from the hardcoded
// STORE_ROOMS or from the immersive-rooms-config JSON override.
// Pure helpers — no DOM access, no side effects.
// ---------------------------------------------------------------------------

function normalizeHotspot(raw, roomKey, index) {
  if (!raw) return null;
  var type, target;
  if (raw.targetRoom) {
    type = 'room';
    target = raw.targetRoom;
  } else if (raw.targetCollection) {
    type = 'collection_panel';
    target = raw.targetCollection;
  } else if (raw.targetEditorialRoom) {
    type = 'editorial';
    target = raw.targetEditorialRoom;
  } else {
    type = 'unknown';
    target = null;
  }
  return {
    id: raw.id || roomKey + '-' + (raw.targetRoom || raw.targetCollection || raw.targetEditorialRoom || index),
    type: type,
    target: target,
    label: raw.label || '',
    position: { x: raw.x, y: raw.y, z: raw.z },
    mobilePosition:
      typeof raw.mobileX === 'number' && typeof raw.mobileY === 'number' ? { x: raw.mobileX, y: raw.mobileY } : null,
    _raw: raw,
  };
}

function getNormalizedHotspots(roomKey) {
  var room = STORE_ROOMS[roomKey];
  if (!room || !Array.isArray(room.hotspots)) return [];
  return room.hotspots
    .map(function (raw, index) {
      return normalizeHotspot(raw, roomKey, index);
    })
    .filter(Boolean);
}

let renderer;
let scene;
let camera;
let planeMesh;
let uniforms;
let currentRoomKey = null;
let transitioning = false;
var currentImageAspect = 16 / 9; // updated when a texture loads

// Texture cache to avoid re-loading and enable VRAM disposal
// LRU cache: array of { key, base, depth } ordered by recency (most recent first)
var textureCache = [];
var MAX_CACHED_TEXTURES = 5; // Only keep most recently used 5 textures

// Performance monitoring (dev only)
var lastFrameTime = typeof performance !== 'undefined' ? performance.now() : 0;
var fpsCounter = 0;
var fpsTimer = typeof performance !== 'undefined' ? performance.now() : 0;

// Session state persistence — survives refresh, cleared on tab close

const immersiveCanvasId = 'immersive-canvas';
const uiLayerId = 'ui-layer';
const glassPanelId = 'glass-panel';

// Content cache for performance
var contentCache = {};

var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null, // To restore focus accurately
  guided: false, // Guided sequence mode
};

// Locale-aware root for building URLs (supports /fr/, /en-us/, etc.)
var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
if (shopRoot.slice(-1) !== '/') shopRoot += '/';

// Reduced motion detection
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cached device flags — updated on resize to avoid repeated window.innerWidth reads
// on high-frequency events (mousemove, animate loop, hotspot rendering)
var isMobile = null;
var isTablet = null;
var usesMobileImg = null;
var canvasRect = null;

function evaluateDeviceFlags() {
  isMobile = window.innerWidth < 768;
  isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  // Connection-aware texture quality
  var connectionQuality = 1.0; // Default to high quality
  if ('connection' in navigator && navigator.connection) {
    var effType = navigator.connection.effectiveType;
    // Map connection quality to texture scale factor
    var qualityMap = {
      'slow-2g': 0.5,
      '2g': 0.5,
      '3g': 0.75,
      '4g': 1.0,
    };
    connectionQuality = qualityMap[effType] || 1.0;

    // Also check saveData preference
    if (navigator.connection.saveData) {
      connectionQuality = Math.min(connectionQuality, 0.5);
    }

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive] Connection quality:', effType, '→ scale:', connectionQuality);
    }
  }

  // Use mobile textures on small screens OR poor connections
  usesMobileImg = window.innerWidth < 1024 || connectionQuality < 0.75;

  // Update texture size calculation to use connection quality
  textureWidth = usesMobileImg ? Math.floor(1200 * connectionQuality) : Math.floor(1920 * connectionQuality);
}

function updateCanvasRect() {
  if (renderer && renderer.domElement) {
    canvasRect = renderer.domElement.getBoundingClientRect();
  }
}

// Initial evaluation before anything else runs
evaluateDeviceFlags();

var textureWidth = usesMobileImg ? 1200 : 1920;
// Parallax runs even with reduceMotion — CSS animations are suppressed separately
var parallaxStrength = usesMobileImg ? 0.03 : 0.08;

// ─────────────────────────────────────────────────────────────
// Analytics helpers (GA4 via dataLayer + Meta Pixel via fbq)
// ─────────────────────────────────────────────────────────────
function trackImmersiveEvent(name, params) {
  params = params || {};
  var payload = Object.assign(
    {
      event_category: 'immersive_store',
      event_label: name,
      immersive_surface: 'immersive-3d-store',
    },
    params,
  );

  // GA4 via dataLayer
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'immersive_' + name, ecommerce: null, immersive: payload });
  }

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    switch (name) {
      case 'add_to_cart_checkout':
        window.fbq('track', 'AddToCart', payload);
        break;
      default:
        var metaName =
          'Immersive' +
          name.replace(/_([a-z])/g, function (_, c) {
            return c.toUpperCase();
          });
        metaName = metaName.charAt(0).toUpperCase() + metaName.slice(1);
        window.fbq('trackCustom', metaName, payload);
    }
  }
}

var STATE_KEY = 'immersive_state';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var WISHLIST_KEY = 'immersive_wishlist';
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';
var NAVIGATION_HISTORY_KEY = 'immersive_nav_history';

var _wishlistItems = [];
var _wishlistProductCache = {};
var _wishlistPanelTrigger = null;
var _activeHotspots = []; // To track hotspot proximity scaling
var _navigationHistory = []; // Navigation history stack for back button

function saveState(patch) {
  try {
    var current = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    sessionStorage.setItem(STATE_KEY, JSON.stringify(Object.assign(current, patch)));
  } catch (e) {}
}

function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
  } catch (e) {
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

// ── Navigation History Management ────────────────────────────────
function pushNavigationHistory(roomKey) {
  if (!roomKey) return;
  // Don't push if it's the same as the last entry
  if (_navigationHistory.length > 0 && _navigationHistory[_navigationHistory.length - 1] === roomKey) {
    return;
  }
  _navigationHistory.push(roomKey);
  // Limit history to 20 entries
  if (_navigationHistory.length > 20) {
    _navigationHistory.shift();
  }
  saveNavigationHistory();
  updateBackButton();
}

function popNavigationHistory() {
  console.log('[Immersive] popNavigationHistory - before:', JSON.stringify(_navigationHistory));
  if (_navigationHistory.length > 1) {
    // Remove current room
    _navigationHistory.pop();
    saveNavigationHistory();
    updateBackButton();
    // Return previous room
    var previousRoom = _navigationHistory[_navigationHistory.length - 1];
    console.log(
      '[Immersive] popNavigationHistory - after:',
      JSON.stringify(_navigationHistory),
      'returning:',
      previousRoom,
    );
    return previousRoom;
  }
  console.log('[Immersive] popNavigationHistory - no history to pop');
  return null;
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

  console.log(
    '[Immersive] updateBackButton - history length:',
    _navigationHistory.length,
    'history:',
    _navigationHistory,
  );

  // Show button if there's history to go back to (more than 1 entry)
  if (_navigationHistory.length > 1) {
    backBtn.hidden = false;
    backBtn.disabled = false;
    console.log('[Immersive] Back button shown');
  } else {
    backBtn.hidden = true;
    backBtn.disabled = true;
    console.log('[Immersive] Back button hidden');
  }
}

function initBackButton() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;

  loadNavigationHistory();
  updateBackButton();

  backBtn.addEventListener('click', function () {
    console.log('[Immersive] Back button clicked');
    var previousRoom = popNavigationHistory();
    console.log('[Immersive] Previous room:', previousRoom);
    if (previousRoom && typeof goToRoom === 'function') {
      // Navigate without adding to history
      goToRoom(previousRoom, false, true); // Add skipHistory flag
    }
  });
}

const vertexShaderSource = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderSource = `
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

    // Chromatic aberration: shift R and B channels slightly apart on scroll
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

    // Breathing effect: gentle light pulsation
    float breathing = sin(uTime * 0.8) * 0.015 + 0.985;
    color.rgb *= breathing;

    // Subtle film grain
    float n = noise(vUv + fract(uTime));
    color.rgb += (n - 0.5) * 0.012;

    // Edge vignette that deepens on scroll
    vec2 vigUv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vigUv * vec2(0.6, 0.8), vigUv * vec2(0.6, 0.8));
    vignette = clamp(vignette, 0.0, 1.0);
    float vigStrength = 0.18 + uScrollVignette * 0.32;
    color.rgb *= mix(1.0 - vigStrength, 1.0, pow(vignette, 1.4));

    // Atmospheric Mood shift (Warmth/Gold tint)
    vec3 moodColor = vec3(1.1, 1.05, 0.9); // Gold warmth
    color.rgb = mix(color.rgb, color.rgb * moodColor, uAtmosphericMood);

    gl_FragColor = color;
  }
`;

function getRoomTextureUrls(roomKey) {
  var room = STORE_ROOMS[roomKey];
  if (!room) {
    console.error('[Immersive] Room definition not found for key:', roomKey);
    return null;
  }

  var mobile = usesMobileImg;
  // Falling back: if mobile-specific URL is explicitly null/empty, we MUST use the desktop base URL
  var baseUrl = mobile && room.mobileBaseTextureUrl ? room.mobileBaseTextureUrl : room.baseTextureUrl;
  var depthUrl = mobile && room.mobileDepthMapUrl ? room.mobileDepthMapUrl : room.depthMapUrl;

  // Final fallback: if even the desktop URL is missing, this room cannot be loaded
  if (!baseUrl || !depthUrl) {
    console.warn('[Immersive] Missing texture URLs for room:', roomKey, { baseUrl: baseUrl, depthUrl: depthUrl });
    return null;
  }

  return { roomKey: roomKey, baseTextureUrl: baseUrl, depthMapUrl: depthUrl, hotspots: room.hotspots };
}

// Preload a room's textures in the background (called on hotspot hover)
function preloadRoom(roomKey) {
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;
  var cacheKey = roomData.baseTextureUrl + '|' + roomData.depthMapUrl;

  // Check if already cached (LRU array)
  var isCached = textureCache.some(function (entry) {
    return entry.key === cacheKey;
  });

  if (isCached) return; // already cached
  loadRoomTextures(roomData, function () {}); // load silently into cache
}

function showWelcomeToast() {
  try {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
  } catch (e) {}
  var section = document.querySelector('[data-msg-welcome-toast]');
  var msg = section && section.getAttribute('data-msg-welcome-toast');
  if (!msg) return;
  var closeLabel = 'Close';
  var wrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!wrapper) return;
  var toast = document.createElement('div');
  toast.className = 'immersive-welcome-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  if (!reduceMotion) toast.classList.add('immersive-welcome-toast--animate-in');
  toast.innerHTML =
    '<span class="immersive-welcome-toast__text">' +
    msg +
    '</span>' +
    '<button type="button" class="immersive-welcome-toast__close" aria-label="' +
    closeLabel +
    '">×</button>';
  wrapper.appendChild(toast);
  var timer = setTimeout(function () {
    _dismissWelcomeToast(toast);
  }, 5000);
  toast.querySelector('.immersive-welcome-toast__close').addEventListener('click', function () {
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

  // WebGL fallback - show static image if WebGL not supported
  if (!window.THREE || !isWebGLSupported()) {
    showWebGLFallback(canvas);
    return;
  }

  showLoader();

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  var initWidth = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
  var initHeight = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
  renderer.setSize(initWidth, initHeight, false);

  scene = new THREE.Scene();
  // Orthographic camera exactly covering clip space — plane fills screen perfectly
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;

  // Full-screen quad — 2x2 in clip space, single quad (no subdivisions needed)
  var geometry = new THREE.PlaneGeometry(2, 2);
  var textureLoader = new THREE.TextureLoader();

  // Create a 1x1 black pixel texture directly without loading
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

  // Initial layout evaluations
  updateCanvasRect();
  window.addEventListener('mousemove', handleMouseMove);

  // Throttled resize handler — RAF-debounced to reduce layout thrashing
  var resizeRaf = null;
  var lastMobile = isMobile;
  function onWindowResize() {
    if (resizeRaf !== null) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = null;
      evaluateDeviceFlags();
      updateCanvasRect();
      handleResize();
      // Re-render hotspots if mobile/desktop breakpoint crossed
      if (isMobile !== lastMobile) {
        lastMobile = isMobile;
        if (currentRoomKey) renderHotspots(currentRoomKey);
      }
    });
  }
  window.addEventListener('resize', onWindowResize);
  handleResize();
  animate();

  // Always start at lounge on a fresh page load.
  // Only restore a non-lounge room if a panel was open (user was mid-browsing).
  var state = loadState();
  var hasOpenPanel = (state.panel === 'product' && state.product) || (state.panel === 'collection' && state.collection);
  var startRoom = hasOpenPanel && state.room && STORE_ROOMS[state.room] ? state.room : 'lounge';

  if (!hasOpenPanel) clearState();

  goToRoom(startRoom, true);

  // Add initial room to navigation history so back button can work
  pushNavigationHistory(startRoom);

  writeImmersivePreference();

  // Restore open panel after room loads
  if (state.panel === 'product' && state.product) {
    // Small delay to let the room render first
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
  var room = STORE_ROOMS['lounge'];
  if (!room) return;
  var wrapper = canvas.parentElement;
  if (!wrapper) return;
  var img = document.createElement('img');
  img.src = room.baseTextureUrl;
  img.alt = '';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  wrapper.appendChild(img);
  canvas.style.display = 'none';
  // Still render hotspots
  renderHotspots('lounge');
}

function showLoader() {
  var wrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!wrapper) return;
  var loader = document.createElement('div');
  loader.id = 'immersive-loader';
  loader.innerHTML = '<div class="immersive-loader__ring"></div>';
  loader.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:50;pointer-events:none;';
  loader.querySelector('.immersive-loader__ring').style.cssText =
    'width:48px;height:48px;border:3px solid rgba(212,175,55,0.2);border-top-color:#d4af37;border-radius:50%;animation:immersive-spin 0.8s linear infinite;';
  // Inject keyframes once
  if (!document.getElementById('immersive-loader-style')) {
    var style = document.createElement('style');
    style.id = 'immersive-loader-style';
    style.textContent = '@keyframes immersive-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  }
  wrapper.appendChild(loader);
}

function hideLoader() {
  var loader = document.getElementById('immersive-loader');
  if (!loader) return;
  loader.style.transition = 'opacity 0.4s ease';
  loader.style.opacity = '0';
  setTimeout(function () {
    loader.remove();
  }, 400);
}

var mouseMoveRafPending = false;
var mouseTarget = { x: 0.5, y: 0.5 };
var mouseCurrent = { x: 0.5, y: 0.5 };
var lerpFactor = 0.08;

function handleMouseMove(event) {
  if (!canvasRect) updateCanvasRect();
  if (!canvasRect) return;
  // Use cached canvasRect to avoid repeated getBoundingClientRect() on every mouse move
  var rect = canvasRect;
  mouseTarget.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  mouseTarget.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
}

function handleResize(roomKeyOverride) {
  if (!renderer || !camera) return;
  evaluateDeviceFlags();
  var canvas = renderer.domElement;
  var width = canvas.clientWidth || window.innerWidth;
  var height = canvas.clientHeight || window.innerHeight;
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height, false);
  if (planeMesh) {
    // Use the override key (passed during initial load before currentRoomKey is set)
    // to avoid falling through to the desktop branch on tablets.
    var resolvedRoomKey = roomKeyOverride || currentRoomKey;
    var room = resolvedRoomKey && STORE_ROOMS[resolvedRoomKey];
    var hasDedicatedMobileImage = usesMobileImg && room && room.mobileBaseTextureUrl;
    if (hasDedicatedMobileImage && isMobile) {
      // Phone: image is composed for this exact viewport — fill quad directly, no crop
      planeMesh.scale.set(1, 1, 1);
    } else if (hasDedicatedMobileImage && isTablet) {
      // Tablet: use mobile image but cover-scale it to fill the larger screen responsively
      var canvasAspect = width / height;
      var imageAspect = currentImageAspect;
      if (canvasAspect > imageAspect) {
        planeMesh.scale.set(1, canvasAspect / imageAspect, 1);
      } else {
        planeMesh.scale.set(imageAspect / canvasAspect, 1, 1);
      }
    } else {
      // Desktop: cover-scale desktop image
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
  // Recache editorial overlay dimensions if active — viewport change affects maxScroll
  if (immersiveState.mode === 'editorial') cacheEditorialOverlay();
}

var editorialScrollProgress = 0;
var editorialOverlayEl = null;
var editorialMaxScroll = 0;
var atmosphericMoodProgress = 0;

// ---------------------------------------------------------------------------
// Tilt-control experiment globals (opt-in, mobile-only, feature-flagged)
// ---------------------------------------------------------------------------
var tiltControlEnabled = false;
var tiltBeta = 0; // Front-back tilt (degrees, typically -180 to 180)
var tiltGamma = 0; // Left-right tilt (degrees, typically -90 to 90)
var tiltXSmoothed = 0; // Smoothed normalized X tilt [-1, 1]
var tiltYSmoothed = 0; // Smoothed normalized Y tilt [-1, 1]

function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay') || null;
  editorialMaxScroll = editorialOverlayEl ? editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight : 0;
}

// ---------------------------------------------------------------------------
// Tilt-control experiment functions (opt-in, mobile-only)
// These provide subtle gyroscope-based scene influence on mobile devices.
// ---------------------------------------------------------------------------

/**
 * Handles device orientation events and stores raw tilt values.
 * @param {DeviceOrientationEvent} event - The device orientation event.
 */
function handleDeviceOrientation(event) {
  tiltBeta = event.beta || 0;
  tiltGamma = event.gamma || 0;
}

/**
 * Enables tilt control after user gesture (required for iOS permission).
 * Guards against non-mobile, reduceMotion, and missing API.
 */
function enableTiltControl() {
  if (tiltControlEnabled) return;
  if (!isMobile) return;
  if (reduceMotion) return;
  if (!window.DeviceOrientationEvent) return;

  function startListening() {
    tiltControlEnabled = true;
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  // iOS 13+ requires explicit permission from a user gesture
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
    // Non-iOS or older iOS: start directly
    startListening();
  }
}

/**
 * Disables tilt control and resets all tilt state.
 */
function disableTiltControl() {
  if (!tiltControlEnabled) return;
  tiltControlEnabled = false;
  window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
  tiltBeta = 0;
  tiltGamma = 0;
  tiltXSmoothed = 0;
  tiltYSmoothed = 0;
}

/**
 * Initializes the tilt toggle button listener.
 * Looks for [data-immersive-tilt-toggle] in the DOM.
 */
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
  requestAnimationFrame(animate);
  if (!uniforms) return;

  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

  // Hotspot proximity scaling
  if (!reduceMotion && _activeHotspots.length > 0) {
    for (var i = 0; i < _activeHotspots.length; i++) {
      var h = _activeHotspots[i];
      var dx = mouseCurrent.x - h.x;
      var dy = mouseCurrent.y - h.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      // Scale between 1.0 (far) and 1.3 (close), threshold: 0.15 normalized
      var scale = 1.0;
      if (dist < 0.15) {
        var proximity = 1.0 - dist / 0.15; // 0 to 1
        scale = 1.0 + 0.3 * proximity;
      }
      h.el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    }
  }

  // Tilt-control integration (mobile-only, showroom mode, opt-in)
  // Provides subtle gyroscope-based scene influence when enabled
  if (tiltControlEnabled && immersiveState.mode === 'showroom' && !reduceMotion) {
    // Normalize tilt values to [-1, 1] range (typical device range ~[-45, 45])
    var tiltNormX = Math.max(-1, Math.min(1, (tiltGamma || 0) / 45));
    var tiltNormY = Math.max(-1, Math.min(1, ((tiltBeta || 0) - 45) / 45)); // Beta ~45 when flat

    // Smooth values with lerp (0.1 factor for gentle response)
    tiltXSmoothed += (tiltNormX - tiltXSmoothed) * 0.1;
    tiltYSmoothed += (tiltNormY - tiltYSmoothed) * 0.1;

    // Apply to shader uniforms if they exist (future-proof check)
    if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
      uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05; // Gently scaled
      uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
    }
  } else if (!tiltControlEnabled && (tiltXSmoothed !== 0 || tiltYSmoothed !== 0)) {
    // Decay smoothed values when tilt is disabled
    tiltXSmoothed *= 0.85;
    tiltYSmoothed *= 0.85;
    if (Math.abs(tiltXSmoothed) < 0.001) tiltXSmoothed = 0;
    if (Math.abs(tiltYSmoothed) < 0.001) tiltYSmoothed = 0;
    if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
      uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
      uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
    }
  }

  // Scroll-linked sinking effect — uses cached overlay ref to avoid per-frame DOM queries
  if (immersiveState.mode === 'editorial') {
    if (!editorialOverlayEl) cacheEditorialOverlay();
    if (editorialOverlayEl && editorialMaxScroll > 0) {
      var targetProgress = editorialOverlayEl.scrollTop / editorialMaxScroll;
      editorialScrollProgress += (targetProgress - editorialScrollProgress) * 0.1;
      uniforms.uScrollOffset.value = editorialScrollProgress;
      if (!reduceMotion) {
        uniforms.uScrollVignette.value += (editorialScrollProgress - uniforms.uScrollVignette.value) * 0.06;
        uniforms.uScrollChroma.value += (editorialScrollProgress - uniforms.uScrollChroma.value) * 0.06;
        // Sync mood for 'featured_collections'
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

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  // Performance monitoring (dev only)
  // Enable by setting window.__IMMERSIVE_DEV__ = true in console
  if (typeof performance !== 'undefined' && window.__IMMERSIVE_DEV__) {
    var now = performance.now();
    var frameTime = now - lastFrameTime;
    lastFrameTime = now;

    // Simple FPS counter (show in console every second)
    fpsCounter++;
    if (now - fpsTimer > 1000) {
      var fps = Math.round((fpsCounter * 1000) / (now - fpsTimer));
      console.log(
        '[Immersive] FPS: ' +
          fps +
          ' | Frame time: ' +
          frameTime.toFixed(2) +
          'ms' +
          (frameTime > 16.67 ? ' ⚠️ SLOW' : ''),
      );
      fpsCounter = 0;
      fpsTimer = now;
    }

    // Frame budget warning (16.67ms = 60fps)
    if (frameTime > 16.67) {
      console.warn('[Immersive] Frame budget exceeded: ' + frameTime.toFixed(2) + 'ms (>' + 16.67 + 'ms for 60fps)');
    }
  }
}

function updateRoomBadge(roomKey) {
  var badge = document.getElementById('immersive-room-badge');
  if (!badge) {
    console.warn('[Immersive] Room badge element not found for room:', roomKey);
    return;
  }
  var nameEl = badge.querySelector('[data-room-badge-name]');
  var guidanceEl = badge.querySelector('[data-room-badge-guidance]');
  var name = badge.getAttribute('data-room-name-' + roomKey) || roomKey;
  var guidance = badge.getAttribute('data-room-guidance-' + roomKey) || '';
  if (nameEl) nameEl.textContent = name;
  if (guidanceEl) guidanceEl.textContent = guidance;
}

function goToRoom(roomKey, initial, skipHistory) {
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);

  // If no textures are configured for this room, ABORT navigation to prevent state-image mismatch
  // This ensures we never see one room's hotspots over another room's background
  if (!roomData) {
    console.error('[Immersive] Cannot navigate to room without textures:', roomKey);
    return;
  }

  saveState({ room: roomKey, panel: null, product: null, collection: null });
  immersiveState.currentRoom = roomKey;
  immersiveState.mode = 'showroom';
  immersiveState.editorialRoom = null;

  // Track navigation history (unless it's initial load or back button navigation)
  if (!initial && !skipHistory) {
    pushNavigationHistory(roomKey);
  }

  // Track room visit for recommender and clear any active countdown timers
  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    // Phase 1: Set transitioning = true immediately to suppress hotspot clicks
    transitioning = true;

    if (reduceMotion) {
      // Reduced motion: skip CSS fade, apply synchronously
      uiLayer.style.transition = '';
      uiLayer.style.opacity = '0';
      _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
    } else {
      // Phase 1: CSS fade-out of UI layer (250ms) before WebGL crossfade
      uiLayer.style.transition = 'opacity 0.25s ease-in-out';
      uiLayer.style.opacity = '0';
      setTimeout(function () {
        _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
      }, 250);
    }
  } else {
    _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
  }
}

function _startRoomTextureLoad(roomKey, roomData, uiLayer, initial) {
  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
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

    // Phase 2: WebGL crossfade
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

        // Phase 3: Render new hotspots and badge, then fade-in UI layer
        renderHotspots(roomKey);
        updateRoomBadge(roomKey);
        var tagline = document.getElementById('immersive-tagline');
        if (tagline) tagline.classList.remove('is-visible');
        trackImmersiveEvent('room_viewed', { room_key: roomKey });

        if (reduceMotion) {
          uiLayer.style.transition = '';
          uiLayer.style.opacity = '1';
          transitioning = false;
        } else {
          // Phase 3: CSS fade-in of UI layer (250ms) after WebGL crossfade
          uiLayer.style.transition = 'opacity 0.25s ease-in-out';
          uiLayer.style.opacity = '1';
          // Allow hotspot clicks again after fade-in begins
          setTimeout(function () {
            transitioning = false;
          }, 250);
        }
      }
    }

    requestAnimationFrame(step);
  });
}

function updateCameraForMode() {
  if (!camera) return;

  var strength;

  if (immersiveState.mode === 'editorial') {
    switch (immersiveState.editorialRoom) {
      case 'designer_houses':
        strength = 0.1;
        break;
      case 'occasions':
        strength = 0.09;
        break;
      case 'featured_collections':
        strength = 0.11;
        break;
      default:
        strength = isMobile ? 0.03 : 0.08;
    }
  } else {
    strength = isMobile ? 0.03 : 0.08;
  }

  if (uniforms && uniforms.uParallaxStrength) {
    uniforms.uParallaxStrength.value = strength;
  }
  // Note: camera.fov is intentionally NOT set — camera is THREE.OrthographicCamera
}

function loadRoomTextures(roomData, callback) {
  var cacheKey = roomData.baseTextureUrl + '|' + roomData.depthMapUrl;

  // Check cache first (LRU: most recent first)
  var cachedIndex = textureCache.findIndex(function (entry) {
    return entry.key === cacheKey;
  });

  if (cachedIndex !== -1) {
    // Move to front (most recently used)
    var cached = textureCache.splice(cachedIndex, 1)[0];
    textureCache.unshift(cached);
    callback(cached.base, cached.depth);
    return;
  }

  var loader = new THREE.TextureLoader();
  // Do not set crossOrigin — Shopify CDN serves images without CORS headers
  // and setting crossOrigin='anonymous' triggers a preflight that fails
  var loaded = { base: null, depth: null };
  var failed = false;

  // Safety net: only trigger on genuine network errors, not slow loads.
  // 45s covers large WebP files on slow mobile connections.
  var timeoutId = setTimeout(function () {
    if (!loaded.base || !loaded.depth) {
      onError('timeout');
    }
  }, 45000);

  function onBothLoaded() {
    if (!loaded.base || !loaded.depth) return;
    clearTimeout(timeoutId);

    // Only cache if both textures loaded successfully (have real image data)
    if (loaded.base.image && loaded.depth.image) {
      // Add to front of cache (most recently used)
      textureCache.unshift({ key: cacheKey, base: loaded.base, depth: loaded.depth });

      // Remove oldest if over limit
      if (textureCache.length > MAX_CACHED_TEXTURES) {
        var oldest = textureCache.pop();
        console.log('[Immersive] Evicting oldest texture from cache:', oldest.key);
        try {
          if (oldest.base) oldest.base.dispose();
          if (oldest.depth) oldest.depth.dispose();
        } catch (e) {
          console.warn('[Immersive] Error disposing texture:', e);
        }
      }
    }

    callback(loaded.base, loaded.depth);
  }

  function onError(which) {
    if (failed) return;
    failed = true;
    clearTimeout(timeoutId);
    console.warn(
      '[Immersive] Failed to load ' + which + ' texture.',
      'base URL:',
      roomData.baseTextureUrl,
      'depth URL:',
      roomData.depthMapUrl,
      'currentRoomKey:',
      currentRoomKey,
    );
    hideLoader();
    if (!currentRoomKey) {
      var canvas = document.getElementById(immersiveCanvasId);
      if (canvas) showWebGLFallback(canvas);
    }
  }

  loader.load(
    roomData.baseTextureUrl,
    function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (tex.image && tex.image.width && tex.image.height) {
        currentImageAspect = tex.image.width / tex.image.height;
        // Defer resize to next frame so canvas layout is settled before scaling.
        // Pass the loading room's key so handleResize can pick the correct scale
        // branch even before currentRoomKey is set (initial load race condition).
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
  var room = STORE_ROOMS[roomKey];
  var uiLayer = document.getElementById(uiLayerId);
  if (!room || !uiLayer) return;

  // Keep top-of-scene editorial hotspots below the fixed header so they remain clickable.
  function getEditorialSafeMinYPercent() {
    var header = document.querySelector('.immersive-header');
    if (!header) return null;
    var headerRect = header.getBoundingClientRect();
    var layerRect = uiLayer.getBoundingClientRect();
    if (!layerRect || !layerRect.height) return null;
    var safeTopPx = headerRect.bottom + 8; // small breathing room below header edge
    var safeTopRelativePx = safeTopPx - layerRect.top;
    var minY = (safeTopRelativePx / layerRect.height) * 100;
    return Math.max(0, Math.min(95, minY));
  }

  function render() {
    uiLayer.innerHTML = '';
    _activeHotspots = [];
    var editorialMinYPercent = getEditorialSafeMinYPercent();

    var relevantRooms = getRelevantRooms();
    var uiLayerEl = document.getElementById(uiLayerId);
    var basedOnSavesLabel = (uiLayerEl && uiLayerEl.getAttribute('data-msg-based-on-saves')) || '';

    // Sort hotspots by reading order: y ascending (primary), x ascending (secondary),
    // using a 10-point row-grouping threshold. Do not mutate the original array.
    var sortedHotspots = room.hotspots.slice().sort(function (a, b) {
      var ay = usesMobileImg && a.mobileY != null ? a.mobileY : a.y;
      var by = usesMobileImg && b.mobileY != null ? b.mobileY : b.y;
      var ax = usesMobileImg && a.mobileX != null ? a.mobileX : a.x;
      var bx = usesMobileImg && b.mobileX != null ? b.mobileX : b.x;
      // Group into rows with a 10-point threshold
      if (Math.abs(ay - by) >= 10) return ay - by;
      return ax - bx;
    });

    sortedHotspots.forEach(function (hotspot) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'immersive-hotspot';
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-label', hotspot.label);
      button.setAttribute('data-hotspot-btn', ''); // For keyboard navigation
      var srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = hotspot.label;
      button.appendChild(srSpan);

      // Ring affordance
      var ringSpan = document.createElement('span');
      ringSpan.className = 'immersive-hotspot__ring';
      ringSpan.setAttribute('aria-hidden', 'true');
      button.appendChild(ringSpan);

      // Label affordance — only when label is non-empty and non-whitespace
      if (hotspot.label && hotspot.label.trim()) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'immersive-hotspot__label';
        labelSpan.setAttribute('aria-hidden', 'true');
        labelSpan.textContent = hotspot.label;
        button.appendChild(labelSpan);
      }

      // Personalization indicator — shown when this hotspot targets a relevant room
      if (hotspot.targetRoom && relevantRooms[hotspot.targetRoom] && basedOnSavesLabel) {
        var indicator = document.createElement('span');
        indicator.className = 'immersive-hotspot__personalization';
        indicator.setAttribute('aria-label', basedOnSavesLabel);
        indicator.textContent = basedOnSavesLabel;
        button.appendChild(indicator);
      }
      button.style.position = 'absolute';
      var posX = usesMobileImg && hotspot.mobileX != null ? hotspot.mobileX : hotspot.x;
      var posY = usesMobileImg && hotspot.mobileY != null ? hotspot.mobileY : hotspot.y;
      if (hotspot.targetEditorialRoom && editorialMinYPercent !== null && posY < editorialMinYPercent) {
        posY = editorialMinYPercent;
      }
      button.style.left = posX + '%';
      button.style.top = posY + '%';
      button.style.transform = 'translate(-50%, -50%)';

      // Track for proximity scaling (use normalized 0-1 coordinates)
      _activeHotspots.push({
        el: button,
        x: posX / 100,
        y: posY / 100,
      });

      button.addEventListener('click', function () {
        var details = { room_key: roomKey, hotspot_label: hotspot.label };
        console.log('[Immersive] Hotspot clicked:', JSON.stringify(hotspot));

        // Exit guided mode on any manual hotspot interaction (unless this is the start trigger)
        if (!hotspot.startExperience) {
          exitGuidedMode();
        }

        if (hotspot.targetEditorialRoom) {
          details.target_type = 'editorial';
          details.target_editorial_room = hotspot.targetEditorialRoom;
          trackImmersiveEvent('hotspot_clicked', details);
          enterEditorialMode(hotspot.targetEditorialRoom, button);
          return;
        }
        if (hotspot.targetRoom) {
          details.target_type = 'room';
          details.target_room_key = hotspot.targetRoom;
          trackImmersiveEvent('hotspot_clicked', details);
          // Activate guided mode when "Start Experience" is clicked
          if (hotspot.startExperience) {
            activateGuidedMode();
          }
          goToRoom(hotspot.targetRoom);
        } else if (hotspot.targetCollection) {
          details.target_type = 'collection';
          details.target_collection_handle = hotspot.targetCollection;
          trackImmersiveEvent('hotspot_clicked', details);
          openCollectionPanel(hotspot.targetCollection);
        } else {
          console.warn('[Immersive] Hotspot has no target:', JSON.stringify(hotspot));
        }
      });

      // Preload next room textures or editorial content on hover
      if (hotspot.targetRoom || hotspot.targetEditorialRoom) {
        button.addEventListener(
          'mouseenter',
          function () {
            if (hotspot.targetRoom) {
              preloadRoom(hotspot.targetRoom);
            }
            if (hotspot.targetEditorialRoom) {
              // Pre-fetch editorial section HTML into contentCache
              var sourceSection = document.querySelector(
                '.immersive-editorial[data-room-key="' + hotspot.targetEditorialRoom + '"]',
              );
              var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');
              if (sectionInstanceId) {
                var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;
                fetchWithCache(fetchUrl).catch(function () {});
              }
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

  // Update keyboard navigation after hotspots are rendered
  updateHotspotElements();
}

// ─────────────────────────────────────────────────────────────
// Focus management helpers for dialogs/panels
// ─────────────────────────────────────────────────────────────

var FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Moves focus into the panel — to the close button if present,
 * otherwise to the first focusable element.
 * Also sets up Escape key handling and Tab focus trap.
 */
function openDialogFocus(panel, triggerEl) {
  if (!panel) return;

  // Store trigger for restoration on close
  panel._panelTrigger = triggerEl || null;

  // Focus the close button first, then fall back to first focusable element
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  var firstFocusable = closeBtn || panel.querySelector(FOCUSABLE_SELECTORS);

  if (firstFocusable) {
    requestAnimationFrame(function () {
      firstFocusable.focus();
    });
  }

  // Escape key closes the panel
  if (!panel._onEscapeKey) {
    panel._onEscapeKey = function (e) {
      if (e.key === 'Escape') closePanel(panel);
    };
    panel.addEventListener('keydown', panel._onEscapeKey);
  }

  // Tab focus trap — keep focus cycling within the panel
  if (!panel._onTabKey) {
    panel._onTabKey = function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTORS)).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    panel.addEventListener('keydown', panel._onTabKey);
  }
}

/**
 * Restores focus to the element that triggered the panel open.
 * Cleans up Escape and Tab key listeners.
 */
function closeDialogFocus(panel, triggerEl) {
  if (!panel) return;

  // Remove key listeners
  if (panel._onEscapeKey) {
    panel.removeEventListener('keydown', panel._onEscapeKey);
    panel._onEscapeKey = null;
  }
  if (panel._onTabKey) {
    panel.removeEventListener('keydown', panel._onTabKey);
    panel._onTabKey = null;
  }

  // Restore focus to trigger
  var target = triggerEl || panel._panelTrigger;
  panel._panelTrigger = null;
  if (target && typeof target.focus === 'function') {
    requestAnimationFrame(function () {
      target.focus();
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Skeleton Loader Helpers - Loading states for content
// ─────────────────────────────────────────────────────────────

function renderSkeletonGrid(count) {
  // count: number of skeleton cards (default 6)
  // returns: HTML string
  count = count || 6;

  var cards = '';
  for (var i = 0; i < count; i++) {
    cards +=
      '<div class="immersive-skeleton-card">' +
      '<div class="immersive-skeleton-card__image"></div>' +
      '<div class="immersive-skeleton-card__content">' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--short"></div>' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--medium"></div>' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--long"></div>' +
      '</div>' +
      '</div>';
  }

  return '<div class="immersive-skeleton-grid">' + cards + '</div>';
}

function renderSkeletonProduct() {
  // returns: HTML string for product panel skeleton
  return (
    '<div class="immersive-skeleton-product">' +
    '<div class="immersive-skeleton-product__media"></div>' +
    '<div class="immersive-skeleton-product__details">' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--title"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--price"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__cta"></div>' +
    '</div>' +
    '</div>'
  );
}

function renderSkeletonRoom() {
  // returns: HTML string for room loading skeleton
  var uiLayer = document.getElementById('ui-layer');
  var loadingText = (uiLayer && uiLayer.getAttribute('data-msg-loading-room')) || 'Loading room...';

  return '<div class="immersive-skeleton-room">' + loadingText + '</div>';
}

// ─────────────────────────────────────────────────────────────
// Enhanced Empty State Helpers - Recovery actions for empty content
// ─────────────────────────────────────────────────────────────

function renderEmptyState(type, context) {
  // type: 'collection' | 'search' | 'wishlist'
  // context: { term: string } for search, {} otherwise
  // returns: HTML string
  context = context || {};

  var icons = {
    collection:
      '<path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    wishlist:
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  };

  var headingKeys = {
    collection: 'sections.immersive_store.empty_states.collection_heading',
    search: 'sections.immersive_store.empty_states.search_heading',
    wishlist: 'sections.immersive_store.empty_states.wishlist_heading',
  };

  var bodyKeys = {
    collection: 'sections.immersive_store.empty_states.collection_body',
    search: 'sections.immersive_store.empty_states.search_body',
    wishlist: 'sections.immersive_store.empty_states.wishlist_body',
  };

  var actionConfigs = {
    collection: [
      { key: 'sections.immersive_store.empty_states.collection_search', action: 'search' },
      { key: 'sections.immersive_store.empty_states.collection_browse', action: 'browse', secondary: true },
    ],
    search: [
      { key: 'sections.immersive_store.empty_states.collection_search', action: 'search' },
      { key: 'sections.immersive_store.empty_states.collection_browse', action: 'browse', secondary: true },
    ],
    wishlist: [{ key: 'sections.immersive_store.empty_states.wishlist_action', action: 'explore' }],
  };

  // Get locale strings from UI layer data attributes
  var uiLayer = document.getElementById('ui-layer');
  function getLocaleString(key, fallback) {
    if (!uiLayer) return fallback;
    var dataKey = 'data-msg-' + key.replace(/\./g, '-').replace(/_/g, '-');
    return uiLayer.getAttribute(dataKey) || fallback;
  }

  var icon = icons[type] || icons.collection;
  var heading = getLocaleString(
    headingKeys[type],
    type === 'collection'
      ? 'This collection is empty'
      : type === 'search'
        ? 'No results found'
        : 'Your wishlist is empty',
  );
  var body = getLocaleString(
    bodyKeys[type],
    type === 'collection'
      ? "We're working on adding new pieces."
      : type === 'search'
        ? 'Try different keywords.'
        : 'Start exploring to discover pieces you love.',
  );

  var actions = actionConfigs[type] || actionConfigs.collection;
  var actionsHtml = '';

  actions.forEach(function (actionConfig) {
    var actionText = getLocaleString(
      actionConfig.key,
      actionConfig.action === 'search'
        ? 'Search products'
        : actionConfig.action === 'browse'
          ? 'Browse rooms'
          : 'Explore collections',
    );
    var secondaryClass = actionConfig.secondary ? ' immersive-empty-state__action--secondary' : '';
    actionsHtml +=
      '<button type="button" class="immersive-empty-state__action' +
      secondaryClass +
      '" data-empty-action="' +
      actionConfig.action +
      '">' +
      actionText +
      '</button>';
  });

  return (
    '<div class="immersive-empty-state" data-empty-state="' +
    type +
    '">' +
    '<svg class="immersive-empty-state__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    icon +
    '</svg>' +
    '<h3 class="immersive-empty-state__heading">' +
    heading +
    '</h3>' +
    '<p class="immersive-empty-state__body">' +
    body +
    '</p>' +
    '<div class="immersive-empty-state__actions">' +
    actionsHtml +
    '</div>' +
    '</div>'
  );
}

function handleEmptyStateAction(action) {
  // Handle empty state CTA actions
  // "Search products" → focus search input
  // "Browse rooms" → open room picker sheet
  // "Explore collections" → close wishlist, open room picker

  switch (action) {
    case 'search':
      // Focus search input
      var searchInput = document.querySelector('.immersive-search__input, [data-search-input]');
      if (searchInput) {
        searchInput.focus();
      }
      break;

    case 'browse':
      // Open room picker sheet
      var fabEl = document.querySelector('.immersive-fab');
      if (fabEl && typeof openRoomPicker === 'function') {
        openRoomPicker();
      } else {
        // Fallback: navigate to lounge
        navigateToRoom('lounge');
      }
      break;

    case 'explore':
      // Close wishlist panel if open, then open room picker
      var wishlistPanel = document.getElementById('immersive-wishlist-panel');
      if (wishlistPanel && !wishlistPanel.hidden) {
        closePanel(wishlistPanel);
      }

      // Open room picker or navigate to lounge
      var fabEl = document.querySelector('.immersive-fab');
      if (fabEl && typeof openRoomPicker === 'function') {
        openRoomPicker();
      } else {
        navigateToRoom('lounge');
      }
      break;

    default:
      console.warn('[Immersive] Unknown empty state action:', action);
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Fade in content with smooth transition
// ─────────────────────────────────────────────────────────────
function fadeInContent(container, html) {
  // container: DOM element
  // html: HTML string to inject
  // Fades out, injects, fades in
  // Skips animation if reduceMotion === true

  if (!container) return;

  if (reduceMotion) {
    container.innerHTML = html;
    return;
  }

  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';

  setTimeout(function () {
    container.innerHTML = html;
    container.style.opacity = '1';
  }, 150);
}

// ─────────────────────────────────────────────────────────────
// Helper: Fade out content with smooth transition
// ─────────────────────────────────────────────────────────────
function fadeOutContent(container, callback) {
  // container: DOM element
  // callback: function to call after fade-out
  // Skips animation if reduceMotion === true

  if (!container) {
    if (callback) callback();
    return;
  }

  if (reduceMotion) {
    if (callback) callback();
    return;
  }

  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';

  setTimeout(function () {
    if (callback) callback();
  }, 150);
}

// ─────────────────────────────────────────────────────────────
// Helper: Get icon SVG for search result type
// ─────────────────────────────────────────────────────────────
function getSearchResultIcon(type) {
  // type: 'product' | 'collection' | 'room'
  // returns: SVG string

  var icons = {
    product:
      '<path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5z"/>',
    collection:
      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    room: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  };

  var path = icons[type] || icons.product;

  return (
    '<svg class="immersive-search-result__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    path +
    '</svg>'
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Set the room label in the panel header
// ─────────────────────────────────────────────────────────────
function setPanelRoomLabel(panel) {
  var labelEl = panel && panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || '' : '';
  labelEl.textContent = roomName;
}

// ─────────────────────────────────────────────────────────────
// Helper: Open a panel with focus management, ARIA, and slide-up animation
// ─────────────────────────────────────────────────────────────
function openPanel(panel, triggerEl) {
  if (!panel) return null;

  // Remove hidden state for CSS transitions
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');

  // Apply ARIA
  panel.setAttribute('data-open', 'true');

  // Determine entering class based on panel id
  var enteringClass =
    panel.id === 'glass-panel' ? 'immersive-store__panel--entering' : 'immersive-editorial-overlay--entering';

  if (!reduceMotion) {
    panel.classList.add(enteringClass);
    setTimeout(function () {
      panel.classList.remove(enteringClass);
      openDialogFocus(panel, triggerEl);
    }, 350);
  } else {
    openDialogFocus(panel, triggerEl);
  }

  return triggerEl;
}

// ─────────────────────────────────────────────────────────────
// Helper: Close a panel/overlay with consistent behavior
// ─────────────────────────────────────────────────────────────
// Closes a panel, removes focus trap, restores focus to trigger,
// and applies CSS classes for transition.
function closePanel(panel) {
  if (!panel) return;

  panel.removeAttribute('data-open');
  closeDialogFocus(panel, panel._panelTrigger);
  panel._panelTrigger = null;

  // Wait for CSS transition before hiding from DOM
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}

// ─────────────────────────────────────────────────────────────
// Helper: Open a glass panel with Section Rendering API content
// ─────────────────────────────────────────────────────────────
// Generic helper for opening product/collection/search panels.
// Accepts fetchUrl, panelId, and renderCallback for panel-specific setup.
function openGlassPanel(fetchUrl, panelId, renderCallback) {
  var panel = document.getElementById(panelId);
  if (!panel) return;

  var triggerEl = document.activeElement;

  // Open panel and set up focus trap
  openPanel(panel, triggerEl);

  // Fetch and render content
  fetchWithCache(fetchUrl)
    .then(function (html) {
      if (!html) {
        var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        return;
      }

      function render() {
        var contentArea = panel.querySelector('.immersive-store__panel-content');
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        // Call panel-specific setup
        if (typeof renderCallback === 'function') {
          renderCallback(panel);
        }

        // Setup click handlers for this panel
        panel.onclick = function (event) {
          if (event.target === panel) {
            closePanel(panel);
            return;
          }
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel(panel);
            return;
          }
          // Allow renderCallback to add custom handlers
          if (renderCallback && renderCallback.onPanelClick) {
            renderCallback.onPanelClick(event, panel);
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('[Immersive] Panel fetch failed:', error);
      var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
      showErrorFeedback(panel, errMsg);
      closePanel(panel);
    });
}

// ─────────────────────────────────────────────────────────────
// Helper: Open glass panel using Section Rendering API
// ─────────────────────────────────────────────────────────────
// Uses fetchSectionHtml for consistent JSON-based Section Rendering.
// Accepts path, sectionId, extraParams, panelId, and renderCallback.
function openGlassPanelWithSection(path, sectionId, extraParams, panelId, renderCallback) {
  var panel = document.getElementById(panelId);
  if (!panel) return;

  var triggerEl = document.activeElement;

  // Open panel and set up focus trap
  openPanel(panel, triggerEl);

  // Fetch and render content using Section Rendering API
  fetchSectionHtml(path, sectionId, extraParams)
    .then(function (html) {
      if (!html) {
        var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        return;
      }

      function render() {
        var contentArea = panel.querySelector('.immersive-store__panel-content');
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        // Call panel-specific setup
        if (typeof renderCallback === 'function') {
          renderCallback(panel);
        }
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('[Immersive] Panel fetch failed:', error);
      var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
      showErrorFeedback(panel, errMsg);
      closePanel(panel);
    });
}

// ─────────────────────────────────────────────────────────────
// Helper: Open an overlay with Section Rendering API content
// ─────────────────────────────────────────────────────────────
// Generic helper for opening editorial overlays.
// Handles view transitions, focus management, and escape handling.
function openOverlay(overlayId, overlayContentId, fetchUrl, onOpenCallback) {
  var overlay = document.getElementById(overlayId);
  var overlayContent = document.getElementById(overlayContentId);

  if (!overlay || !overlayContent) {
    console.warn('[Immersive] Overlay not found:', overlayId);
    return;
  }

  // Show loading spinner if not in cache
  if (!contentCache[fetchUrl]) {
    var msgLoading = (overlay && overlay.getAttribute('data-msg-loading')) || 'Loading…';
    overlayContent.innerHTML =
      '<div class="immersive-editorial-loader" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37;">' +
      '<div class="immersive-loader__ring"></div>' +
      '<p style="margin-top:1.5rem; font-size:0.9rem; letter-spacing:0.1em; text-transform:uppercase;">' +
      msgLoading +
      '</p>' +
      '</div>';
  }

  // Perform UI activation (view transition or direct)
  var performUIActivation = function () {
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-active');
    overlay.scrollTop = 0;

    // Call callback after content is ready
    if (typeof onOpenCallback === 'function') {
      onOpenCallback(overlay, overlayContent);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(performUIActivation);
  } else {
    performUIActivation();
  }

  // Fetch content
  fetchWithCache(fetchUrl)
    .then(function (html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var images = temp.querySelectorAll('img:not([loading])');
      for (var i = 0; i < images.length; i++) {
        images[i].setAttribute('loading', 'lazy');
      }
      overlayContent.innerHTML = temp.innerHTML;
    })
    .catch(function (err) {
      console.error('[Immersive] Overlay fetch failed:', err);
      var msgError = (overlay && overlay.getAttribute('data-msg-error')) || 'The story is temporarily unavailable.';
      var msgTryAgain = (overlay && overlay.getAttribute('data-msg-try-again')) || 'Try again';
      overlayContent.innerHTML =
        '<div class="immersive-editorial-error" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; text-align:center; padding:2rem;">' +
        '<p style="font-size:1.1rem; margin-bottom:1.5rem;">' +
        msgError +
        '</p>' +
        '<button type="button" class="immersive-header__btn" onclick="enterEditorialMode(\'' +
        (overlay.getAttribute('data-room-key') || '') +
        '\')">' +
        msgTryAgain +
        '</button>' +
        '</div>';
    });
}

// ─────────────────────────────────────────────────────────────
// Helper: Close an overlay with consistent behavior
// ─────────────────────────────────────────────────────────────
function closeOverlay(overlay, triggerEl) {
  if (!overlay) return;

  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');

  // Remove event listeners
  if (overlay._onEscape) {
    overlay.removeEventListener('keydown', overlay._onEscape);
    overlay._onEscape = null;
  }
  if (overlay._onClick) {
    overlay.removeEventListener('click', overlay._onClick);
    overlay._onClick = null;
  }

  // Restore focus to trigger
  if (triggerEl && typeof triggerEl.focus === 'function') {
    requestAnimationFrame(function () {
      triggerEl.focus();
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for a product
// ─────────────────────────────────────────────────────────────
function openProductPanel(productHandle, collectionHandle) {
  exitGuidedMode();
  recordBrowsingSignal(immersiveState.currentRoom);
  saveState({ panel: 'product', product: productHandle, collection: collectionHandle || null });

  var path = shopRoot + 'products/' + productHandle;
  var extraParams = collectionHandle ? { collection_handle: collectionHandle } : null;
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var triggerEl = document.activeElement;

  console.log('Fetching product:', productHandle, 'from collection:', collectionHandle);

  // Open panel and show skeleton immediately
  openPanel(panel, triggerEl);

  var contentArea = panel.querySelector('.immersive-store__panel-content');
  if (contentArea) {
    contentArea.innerHTML = renderSkeletonProduct();
    contentArea.style.opacity = '1';
  }

  // Fetch real content
  fetchSectionHtml(path, 'glass-product', extraParams)
    .then(function (html) {
      if (!html) {
        var errMsg = panel.getAttribute('data-msg-load-product-error') || 'Unable to load product. Please try again.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        return;
      }

      function render() {
        if (contentArea) {
          fadeInContent(contentArea, html);
        } else {
          panel.innerHTML = html;
        }

        // Panel-specific setup
        setPanelRoomLabel(panel);
        setupVariantButtons(panel);
        setupBuyNowForm(panel);
        setupMediaThumbs(panel);
        setupImageParallax(panel);
        setupShareButton(panel);
        setupDeliveryDates(panel);
        setupVirtualTryOn(panel);
        loadProductRecommendations(panel);
        cacheWishlistProduct(productHandle, panel);
        syncAllWishlistToggles(panel);

        trackImmersiveEvent('panel_opened', {
          panel_type: 'product',
          product_handle: productHandle,
          collection_handle: collectionHandle || null,
        });

        // Panel click handler
        panel.onclick = function (event) {
          if (event.target === panel) {
            closePanel(panel);
            return;
          }
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel(panel);
            return;
          }

          // Back button (PDP -> Collection)
          var backButton = event.target.closest('.glass-product-section__back');
          if (backButton) {
            var backHandle = backButton.getAttribute('data-collection-handle');
            if (backHandle) {
              event.preventDefault();
              openCollectionPanel(backHandle);
            }
            return;
          }

          // Breadcrumb navigation
          var breadcrumbBtn = event.target.closest('[data-breadcrumb-action]');
          if (breadcrumbBtn) {
            var action = breadcrumbBtn.getAttribute('data-breadcrumb-action');
            if (action === 'close-panel') {
              closePanel(panel);
            } else if (action === 'open-collection') {
              var colHandle = breadcrumbBtn.getAttribute('data-collection-handle');
              if (colHandle) openCollectionPanel(colHandle);
            }
            return;
          }

          // Vendor name → open vendor collection panel
          var vendorBtn = event.target.closest('[data-vendor-collection]');
          if (vendorBtn) {
            var vendorHandle = vendorBtn.getAttribute('data-vendor-collection');
            if (vendorHandle) openCollectionPanel(vendorHandle);
            return;
          }

          // Prev/next product navigation
          var navBtn = event.target.closest('.glass-product-section__product-nav-btn[data-product-handle]');
          if (navBtn) {
            var navHandle = navBtn.getAttribute('data-product-handle');
            var navColHandle = navBtn.getAttribute('data-collection-handle');
            if (navHandle) openProductPanel(navHandle, navColHandle || collectionHandle);
            return;
          }

          // Related product click
          var relatedItem = event.target.closest('.glass-product-section__related-item');
          if (relatedItem) {
            var relatedHandle = relatedItem.getAttribute('data-product-handle');
            if (relatedHandle) {
              event.preventDefault();
              openProductPanel(relatedHandle, collectionHandle);
            }
            return;
          }

          // Any product link
          var productLink = event.target.closest('a[data-product-handle]');
          if (productLink) {
            var linkHandle = productLink.getAttribute('data-product-handle');
            if (linkHandle) {
              event.preventDefault();
              openProductPanel(linkHandle, collectionHandle);
            }
            return;
          }

          // Recommendation card links
          var recLink = event.target.closest('[data-related-root] a[href*="/products/"]');
          if (recLink) {
            var href = recLink.getAttribute('href') || '';
            var match = href.match(/\/products\/([^/?#]+)/);
            if (match) {
              event.preventDefault();
              openProductPanel(match[1], collectionHandle);
            }
            return;
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('[Immersive] Panel fetch failed:', error);
      var errMsg =
        panel.getAttribute('data-msg-load-product-error') || 'Unable to load product. Please check your connection.';
      showErrorFeedback(panel, errMsg);
      closePanel(panel);
    });
}

// ─────────────────────────────────────────────────────────────
// Browsing signals — personalized room suggestions (Feature 6)
// ─────────────────────────────────────────────────────────────
var BROWSING_SIGNALS_KEY = 'immersive_browsing_signals';

function recordBrowsingSignal(roomKey) {
  if (!roomKey) return;
  try {
    var raw = localStorage.getItem(BROWSING_SIGNALS_KEY);
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) signals = [];
    signals.push(roomKey);
    if (signals.length > 50) signals = signals.slice(signals.length - 50);
    localStorage.setItem(BROWSING_SIGNALS_KEY, JSON.stringify(signals));
  } catch (e) {}
}

function getRelevantRooms() {
  try {
    var raw = localStorage.getItem(BROWSING_SIGNALS_KEY);
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) return {};
    var counts = {};
    signals.forEach(function (k) {
      counts[k] = (counts[k] || 0) + 1;
    });
    var relevant = {};
    Object.keys(counts).forEach(function (k) {
      if (counts[k] >= 2) relevant[k] = true;
    });
    return relevant;
  } catch (e) {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for a collection
// ─────────────────────────────────────────────────────────────
function openCollectionPanel(collectionHandle) {
  exitGuidedMode();
  recordBrowsingSignal(immersiveState.currentRoom);
  saveState({ panel: 'collection', collection: collectionHandle, product: null });

  var path = shopRoot + 'collections/' + collectionHandle;
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var triggerEl = document.activeElement;

  console.log('Fetching collection:', collectionHandle);

  // Open panel and show skeleton immediately
  openPanel(panel, triggerEl);

  var contentArea = panel.querySelector('.immersive-store__panel-content');
  if (contentArea) {
    contentArea.innerHTML = renderSkeletonGrid(6);
    contentArea.style.opacity = '1';
  }

  // Fetch real content
  fetchSectionHtml(path, 'glass-panel', null)
    .then(function (html) {
      if (!html) {
        var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        return;
      }

      function render() {
        if (contentArea) {
          fadeInContent(contentArea, html);
        } else {
          panel.innerHTML = html;
        }

        // Panel-specific setup
        setPanelRoomLabel(panel);
        setupVariantButtons(panel);
        setupBuyNowForm(panel);
        setupImageParallax(panel);
        setupVirtualTryOn(panel);
        syncAllWishlistToggles(panel);

        trackImmersiveEvent('panel_opened', {
          panel_type: 'collection',
          collection_handle: collectionHandle,
        });

        // Init filters after collection content loads
        var gridWrapper = panel.querySelector('.immersive-product-grid-wrapper');
        if (gridWrapper) {
          var collHandle = gridWrapper.closest('[data-collection-handle]')
            ? gridWrapper.closest('[data-collection-handle]').getAttribute('data-collection-handle')
            : collectionHandle;
          var currentRoomForFilters = (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'lounge';
          initImmersiveFilters(panel, collHandle || collectionHandle, currentRoomForFilters, 'glass-panel');
        }

        // Panel click handler
        panel.onclick = function (event) {
          if (event.target === panel) {
            closePanel(panel);
            return;
          }
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel(panel);
            return;
          }

          // Empty state action handling
          var emptyAction = event.target.closest('[data-empty-action]');
          if (emptyAction) {
            var action = emptyAction.getAttribute('data-empty-action');
            if (action) {
              handleEmptyStateAction(action);
            }
            return;
          }

          // Product card click — intercept clicks on the article OR any child
          // element with data-product-handle (e.g. inner <a> links).
          // event.preventDefault() is called IMMEDIATELY before any other logic
          // so browser navigation on <a href> elements is cancelled synchronously.
          var cardOrLink = event.target.closest('.immersive-product-card, [data-product-handle]');
          if (cardOrLink) {
            event.preventDefault();
            var handle = cardOrLink.getAttribute('data-product-handle');
            if (!handle) {
              var parentCard = cardOrLink.closest('.immersive-product-card');
              handle = parentCard && parentCard.getAttribute('data-product-handle');
            }
            if (handle) {
              openProductPanel(handle, collectionHandle);
            }
            return;
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('[Immersive] Panel fetch failed:', error);
      var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
      showErrorFeedback(panel, errMsg);
      closePanel(panel);
    });
}

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for search results
// ─────────────────────────────────────────────────────────────
function openSearchPanel(encodedQuery) {
  var query = '';
  try {
    query = decodeURIComponent(encodedQuery);
  } catch (e) {
    query = encodedQuery;
  }
  if (!query) return;

  var path = shopRoot + 'search';
  var extraParams = { q: query };

  console.log('Searching for:', query);

  openGlassPanelWithSection(path, 'immersive-product-grid', extraParams, glassPanelId, function (panel) {
    // Panel-specific setup
    setupVariantButtons(panel);
    setupImageParallax(panel);
    syncAllWishlistToggles(panel);

    trackImmersiveEvent('search_panel_opened', { query: query });

    // Panel click handler
    panel.onclick = function (event) {
      if (event.target === panel) {
        closePanel(panel);
        return;
      }
      if (event.target.closest('.immersive-store__panel-close')) {
        closePanel(panel);
        return;
      }

      // Empty state action handling
      var emptyAction = event.target.closest('[data-empty-action]');
      if (emptyAction) {
        var action = emptyAction.getAttribute('data-empty-action');
        if (action) {
          handleEmptyStateAction(action);
        }
        return;
      }

      // Product card click
      var card = event.target.closest('.immersive-product-card');
      if (card) {
        var handle = card.getAttribute('data-product-handle');
        if (handle) {
          event.preventDefault();
          openProductPanel(handle, null);
        }
        return;
      }
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Editorial overlay entry point (single, canonical implementation)
// ─────────────────────────────────────────────────────────────
function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl || null;

  // Reset scroll-linked state
  editorialScrollProgress = 0;
  if (uniforms && uniforms.uScrollOffset) {
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
    uniforms.uAtmosphericMood.value = 0;
  }
  cacheEditorialOverlay();
  updateCameraForMode();

  trackImmersiveEvent('editorial_entered', { room: roomKey });

  var overlay = document.getElementById('immersive-editorial-overlay');
  var overlayContent = document.getElementById('immersive-editorial-overlay-content');
  var canvas = document.getElementById(immersiveCanvasId);

  if (!overlay || !overlayContent) {
    console.warn('[Immersive] Editorial overlay not found');
    return;
  }

  // Get section instance ID
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');

  if (!sectionInstanceId) {
    console.warn('[Immersive] No immersive-editorial section instance found on page for room:', roomKey);
    if (sourceSection) {
      overlayContent.innerHTML = sourceSection.innerHTML;
      performEditorialUIActivation(overlay, canvas);
    }
    return;
  }

  var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;

  // Open overlay with callback for post-content setup
  openOverlay(
    'immersive-editorial-overlay',
    'immersive-editorial-overlay-content',
    fetchUrl,
    function (overlay, overlayContent) {
      performEditorialUIActivation(overlay, canvas);

      // Re-initialize any parallax scripts
      if (window.ImmersiveEditorial && window.ImmersiveEditorial.init) {
        window.ImmersiveEditorial.init(overlayContent);
      }

      // Back to Lounge visibility + hero parallax
      updateBackToLoungeVisibility(roomKey);
      initEditorialHeroParallax();

      // Setup escape handler
      if (!overlay._onEscape) {
        overlay._onEscape = function (e) {
          if (e.key === 'Escape') exitEditorialMode();
        };
        overlay.addEventListener('keydown', overlay._onEscape);
      }

      // Setup collection click delegation
      if (!overlay._onClick) {
        overlay._onClick = function (e) {
          var productLink = e.target.closest('[data-product-handle]');
          if (productLink) {
            var productHandle = productLink.getAttribute('data-product-handle');
            if (productHandle) {
              e.preventDefault();
              openProductPanel(productHandle, null);
              return;
            }
          }
          var card = e.target.closest('[data-collection]');
          if (!card) return;
          var handle = card.getAttribute('data-collection');
          if (!handle) return;
          e.preventDefault();
          exitEditorialMode();
          setTimeout(function () {
            openCollectionPanel(handle);
          }, 120);
        };
        overlay.addEventListener('click', overlay._onClick);
      }
    },
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Perform editorial overlay UI activation
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Editorial overlay exit point (paired with enterEditorialMode)
// ─────────────────────────────────────────────────────────────
function exitEditorialMode() {
  destroyEditorialHeroParallax();
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);
  var triggerEl = immersiveState.lastHotspot;

  var performUIDeactivation = function () {
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      if (overlay._onEscape) {
        overlay.removeEventListener('keydown', overlay._onEscape);
        overlay._onEscape = null;
      }
      if (overlay._onClick) {
        overlay.removeEventListener('click', overlay._onClick);
        overlay._onClick = null;
      }
    }

    if (canvas) {
      canvas.classList.remove('editorial-blur');
    }

    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
    editorialOverlayEl = null;
    editorialMaxScroll = 0;
    updateCameraForMode();

    if (triggerEl) {
      requestAnimationFrame(function () {
        triggerEl.focus();
      });
    }
  };

  if (document.startViewTransition && triggerEl) {
    overlay.style.viewTransitionName = 'editorial-morph';
    triggerEl.style.viewTransitionName = 'editorial-morph';

    var transition = document.startViewTransition(performUIDeactivation);

    transition.finished.finally(function () {
      overlay.style.viewTransitionName = '';
      triggerEl.style.viewTransitionName = '';
      immersiveState.lastHotspot = null;
    });
  } else {
    performUIDeactivation();
    immersiveState.lastHotspot = null;
  }
}

function fetchWithCache(url) {
  if (contentCache[url]) {
    return Promise.resolve(contentCache[url]);
  }

  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.text();
    })
    .then(function (html) {
      contentCache[url] = html;
      return html;
    });
}

// ─────────────────────────────────────────────────────────────
// Helper: Transition panel content with optional view transition
// ─────────────────────────────────────────────────────────────
// Wraps content rendering in a view transition if supported.
// Falls back to direct rendering on older browsers.
function transitionPanelContent(panel, renderCallback) {
  if (!panel) return;

  if (document.startViewTransition) {
    document.startViewTransition(renderCallback);
  } else {
    renderCallback();
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Fetch Section Rendering API response
// ─────────────────────────────────────────────────────────────
// Builds a URL with sections parameter and optional extra params,
// fetches the JSON response, and returns the HTML for the given section.
// Uses ?sections= (JSON response) for consistent error handling.
// Returns a Promise that resolves to the HTML string or null on error.
function fetchSectionHtml(path, sectionId, extraParams) {
  // Build base URL - path can be a product/collection/search URL
  var url = path;
  var separator = url.indexOf('?') >= 0 ? '&' : '?';
  url += separator + 'sections=' + encodeURIComponent(sectionId);

  if (extraParams && typeof extraParams === 'object') {
    Object.keys(extraParams).forEach(function (key) {
      if (extraParams[key] != null) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
      }
    });
  } else if (extraParams && typeof extraParams === 'string') {
    url += '&' + extraParams;
  }

  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (response) {
      if (!response.ok) {
        console.warn('[Immersive] Section Rendering fetch failed:', sectionId, response.status);
        return null;
      }
      return response.json();
    })
    .then(function (json) {
      if (!json || typeof json !== 'object') {
        console.warn('[Immersive] Section Rendering returned invalid JSON:', sectionId);
        return null;
      }
      var html = json[sectionId];
      if (!html) {
        console.warn('[Immersive] Section Rendering missing section:', sectionId);
        return null;
      }
      return html;
    })
    .catch(function (err) {
      console.warn('[Immersive] Section Rendering error:', sectionId, err);
      return null;
    });
}

function setupVariantButtons(panel) {
  var buttons = panel.querySelectorAll('.immersive-variant-button, .glass-product-section__variant-button');
  var hiddenInput = panel.querySelector('.immersive-variant-input, .glass-product-section__variant-input');

  if (buttons.length === 0) return;

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      if (button.disabled) return;

      // Remove active state from all buttons
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
      });

      // Add active state to clicked button
      button.classList.add('active');

      // Update hidden input
      var variantId = button.getAttribute('data-variant-id');
      if (hiddenInput && variantId) {
        hiddenInput.value = variantId;
      }
    });

    // Add keyboard navigation
    button.addEventListener('keydown', function (event) {
      if (button.disabled) return;

      // Enter or Space to activate
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }

      // Arrow key navigation
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        var nextIndex = index + 1;
        while (nextIndex < buttons.length) {
          if (!buttons[nextIndex].disabled) {
            buttons[nextIndex].focus();
            break;
          }
          nextIndex++;
        }
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        var prevIndex = index - 1;
        while (prevIndex >= 0) {
          if (!buttons[prevIndex].disabled) {
            buttons[prevIndex].focus();
            break;
          }
          prevIndex--;
        }
      }
    });
  });

  // Set first available variant as active
  var firstAvailable = panel.querySelector(
    '.immersive-variant-button:not([disabled]), .glass-product-section__variant-button:not([disabled])',
  );
  if (firstAvailable) {
    firstAvailable.click();
  }
}

function setupBuyNowForm(panel) {
  var forms = panel.querySelectorAll('form[data-product-form], .glass-product-section__form');
  var container = panel.querySelector('.glass-product-section');
  var msgSelectVariant = (container && container.getAttribute('data-error-select-variant')) || 'Please select a size';
  var msgAddToCart =
    (container && container.getAttribute('data-error-add-to-cart')) || 'Unable to add to cart. Please try again.';

  forms.forEach(function (form) {
    // Track which submit button was clicked so we can distinguish
    // add-to-cart (name="add") from payment_button accelerated checkout buttons
    var lastClickedSubmit = null;
    form.addEventListener(
      'click',
      function (e) {
        var btn = e.target.closest('[type="submit"], button[name]');
        if (btn) lastClickedSubmit = btn;
      },
      true,
    );

    form.addEventListener('submit', function (event) {
      // If the clicked button is NOT the add-to-cart button (e.g. it's a
      // payment_button / Buy Now), let Shopify handle it natively
      var isAddToCart =
        !lastClickedSubmit ||
        lastClickedSubmit.getAttribute('name') === 'add' ||
        lastClickedSubmit.classList.contains('glass-product-section__add-to-cart');

      if (!isAddToCart) {
        // Let the native form submit proceed for accelerated checkout buttons
        lastClickedSubmit = null;
        return;
      }

      event.preventDefault();
      lastClickedSubmit = null;

      // Validate variant selection
      var variantInput = form.querySelector(
        '.immersive-variant-input, .glass-product-section__variant-input, input[name="id"]',
      );
      if (!variantInput || !variantInput.value) {
        showErrorFeedback(panel, msgSelectVariant);
        return;
      }

      var formData = new FormData(form);
      // Ensure sections param is set for cart drawer to update correctly
      formData.set('sections', 'cart-drawer,cart-icon-bubble');
      formData.set('sections_url', window.location.pathname);

      fetch(shopRoot + 'cart/add.js', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (error) {
              throw new Error(error.description || msgAddToCart);
            });
          }
          return response.json();
        })
        .then(function () {
          showCartFeedback(panel);

          try {
            var productHandleEl = panel.querySelector('[data-product-handle]');
            var productHandle = productHandleEl ? productHandleEl.getAttribute('data-product-handle') : null;
            trackImmersiveEvent('add_to_cart_checkout', { product_handle: productHandle });
          } catch (e) {}

          // Show next actions after add-to-cart
          try {
            var productCtx = panel.querySelector('[data-product-handle]');
            var productHandleForNext = productCtx ? productCtx.getAttribute('data-product-handle') : null;
            var vendorEl = panel.querySelector('[data-product-vendor]');
            var vendorForNext = vendorEl ? vendorEl.getAttribute('data-product-vendor') : null;
            if (typeof showAfterAddToCart === 'function' && productHandleForNext) {
              showAfterAddToCart({
                handle: productHandleForNext,
                vendor: vendorForNext || '',
                collectionHandle: null,
                roomKey: (immersiveState && immersiveState.currentRoom) || 'lounge',
              });
            }
          } catch (e) {}

          // Open Dawn's cart drawer if available, otherwise navigate to cart
          var cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && typeof cartDrawer.open === 'function') {
            // Refresh cart drawer contents then open it
            fetch(shopRoot + '?section_id=cart-drawer', {
              headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
              .then(function (r) {
                return r.text();
              })
              .then(function (html) {
                var temp = document.createElement('div');
                temp.innerHTML = html;
                var newDrawer = temp.querySelector('cart-drawer');
                if (newDrawer) {
                  cartDrawer.innerHTML = newDrawer.innerHTML;
                }
                cartDrawer.open();
              })
              .catch(function () {
                cartDrawer.open();
              });
          } else {
            window.location.href = shopRoot + 'cart';
          }
        })
        .catch(function (error) {
          console.error('Error adding to cart:', error);
          showErrorFeedback(panel, error.message || msgAddToCart);
        });
    });
  });
}

function setupMediaThumbs(panel) {
  var mainContainer = panel.querySelector('[data-parallax-main]');
  if (!mainContainer) return;

  var thumbs = panel.querySelectorAll('.glass-product-section__thumb');
  if (!thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var idx = parseInt(thumb.getAttribute('data-media-index'), 10);
      // data-media-index is offset:1 in Liquid, so idx 0 = media[1]
      // We need to fetch the full media list from the product media elements
      var allMedia = panel.querySelectorAll(
        '.glass-product-section__media-main img, .glass-product-section__media-main video',
      );

      // Build the new img from the thumb's own media tag
      var thumbMedia = thumb.querySelector('img, video');
      if (!thumbMedia) return;

      // Swap the main image src
      var mainImg = mainContainer.querySelector('[data-parallax-image]');
      if (mainImg && thumbMedia.tagName === 'IMG') {
        // Swap src/srcset/alt
        var newSrc = thumbMedia.getAttribute('src');
        var newSrcset = thumbMedia.getAttribute('srcset') || '';
        var newAlt = thumbMedia.getAttribute('alt') || '';

        mainImg.setAttribute('src', newSrc);
        if (newSrcset) mainImg.setAttribute('srcset', newSrcset);
        mainImg.setAttribute('alt', newAlt);

        // Reset parallax transform
        mainImg.style.transform = 'scale(1.06) translate(0px, 0px)';
      }

      // Active state on thumbs
      thumbs.forEach(function (t) {
        t.classList.remove('is-active');
      });
      thumb.classList.add('is-active');
    });
  });
}

function setupImageParallax(panel) {
  // Delegate to the global data-attribute-driven implementation
  // which is called once on init and re-called after panel content loads
  var root = panel || document;
  var containers = root.querySelectorAll('[data-parallax-container]');
  if (!containers.length || reduceMotion) return;

  containers.forEach(function (container) {
    if (container._parallaxBound) return; // avoid double-binding
    container._parallaxBound = true;

    var images = container.querySelectorAll('[data-parallax-image]');
    if (!images.length) return;

    var intensity = parseFloat(container.getAttribute('data-parallax-intensity') || '12');
    var rafPending = false;
    var lastX = 0;
    var lastY = 0;

    function applyParallax(x, y) {
      var rect = container.getBoundingClientRect();
      var cx = Math.max(-1, Math.min(1, ((x - rect.left) / rect.width - 0.5) * 2));
      var cy = Math.max(-1, Math.min(1, ((y - rect.top) / rect.height - 0.5) * 2));
      images.forEach(function (img) {
        img.style.transform = 'scale(1.06) translate(' + cx * intensity + 'px, ' + cy * intensity + 'px)';
      });
    }

    function resetParallax() {
      images.forEach(function (img) {
        img.style.transform = 'scale(1.06) translate(0px, 0px)';
      });
    }

    container.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        applyParallax(lastX, lastY);
        rafPending = false;
      });
    });
    container.addEventListener('mouseleave', function () {
      rafPending = false;
      resetParallax();
    });
    container.addEventListener(
      'touchmove',
      function (e) {
        var t = e.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function () {
          applyParallax(lastX, lastY);
          rafPending = false;
        });
      },
      { passive: true },
    );
    container.addEventListener('touchend', resetParallax);
  });
}

function setupDeliveryDates(panel) {
  var fromEl = panel.querySelector('.delivery-from');
  var toEl = panel.querySelector('.delivery-to');
  if (!fromEl || !toEl) return;

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function skipWeekend(date) {
    var day = date.getDay();
    if (day === 0) date.setDate(date.getDate() + 1);
    else if (day === 6) date.setDate(date.getDate() + 2);
    return date;
  }
  function fmt(date) {
    var lang = document.documentElement.lang || 'en-GB';
    try {
      return date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (e) {
      return date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }

  var today = new Date();
  var fromDate = fmt(skipWeekend(addDays(today, 14)));
  var toDate = fmt(skipWeekend(addDays(today, 24)));

  // Use the localized template if available, otherwise fall back to direct span injection
  var templateEl = panel.querySelector('[data-delivery-template]');
  if (templateEl) {
    var tpl = templateEl.getAttribute('data-delivery-template') || '';
    templateEl.innerHTML = tpl
      .replace('[[from]]', '<strong>' + fromDate + '</strong>')
      .replace('[[to]]', '<strong>' + toDate + '</strong>');
  } else {
    fromEl.textContent = fromDate;
    toEl.textContent = toDate;
  }
}

function setupShareButton(panel) {
  var buttons = panel.querySelectorAll('.glass-product-section__share-btn');
  if (!buttons.length) return;

  var shareContainer = panel.querySelector('.glass-product-section__share-buttons');
  var copiedMsg = (shareContainer && shareContainer.getAttribute('data-copied-success')) || '\u2713 Copied!';

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var url = encodeURIComponent(btn.getAttribute('data-product-url') || window.location.href);
      var title = encodeURIComponent(btn.getAttribute('data-product-title') || document.title);
      var platform = btn.getAttribute('data-platform');
      var shareUrl;

      switch (platform) {
        case 'whatsapp':
          shareUrl = 'https://wa.me/?text=' + title + '%20' + url;
          break;
        case 'facebook':
          shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
          break;
        case 'instagram':
          // Instagram has no direct web share URL — copy link instead
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function () {
            btn.textContent = copiedMsg;
            setTimeout(function () {
              btn.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram';
            }, 2500);
          });
          return;
        case 'tiktok':
          // TikTok has no direct web share — copy link
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function () {
            btn.textContent = copiedMsg;
            setTimeout(function () {
              btn.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> TikTok';
            }, 2500);
          });
          return;
        default:
          return;
      }

      window.open(shareUrl, '_blank', 'noopener,width=600,height=500');
    });
  });
}

function setupVirtualTryOn(panel) {
  var container = panel.querySelector('#virtual-tryon-container');
  if (!container) return;

  // If not signed in, the gate UI is shown — no JS needed
  if (container.getAttribute('data-signed-in') !== 'true') return;

  var userPhotoInput = container.querySelector('#virtual-tryon-user-photo');
  var tryOnBtn = container.querySelector('#virtual-tryon-btn');
  var resultImg = container.querySelector('#virtual-tryon-result-img');
  var resultContainer = container.querySelector('#virtual-tryon-result');
  var loadingSpinner = container.querySelector('#virtual-tryon-loading');
  var quotaBadge = container.querySelector('#vtryon-quota-badge');

  if (!userPhotoInput || !tryOnBtn) return;

  var productTitle = container.getAttribute('data-product-title') || '';
  var productImageUrlRaw = container.getAttribute('data-product-image-url') || '';
  var productImageUrl = productImageUrlRaw.startsWith('//')
    ? 'https:' + productImageUrlRaw
    : productImageUrlRaw.startsWith('/')
      ? window.location.origin + productImageUrlRaw
      : productImageUrlRaw;

  var customerId = container.getAttribute('data-customer-id') || '';
  var customerToken = container.getAttribute('data-customer-token') || '';
  var isRecentPurchaser = container.getAttribute('data-is-recent-purchaser') === 'true';
  var quotaMax = parseInt(container.getAttribute('data-quota-max') || '1', 10);

  // Localized strings from data-* attributes
  var msgErrorPhotoRead =
    container.getAttribute('data-error-photo-read') || 'Could not read your photo. Please try a different image.';
  var msgErrorQuotaExceeded = container.getAttribute('data-error-quota-exceeded') || 'You have used all your try-ons.';
  var msgErrorAuthRequired =
    container.getAttribute('data-error-auth-required') || 'Please sign in to use Virtual Try-On.';
  var msgStatusUploading = container.getAttribute('data-status-uploading') || 'Uploading your photo\u2026';
  var msgStatusProcessing =
    container.getAttribute('data-status-processing') || 'Processing embroidery & texture details\u2026';
  var msgStatusDraping = container.getAttribute('data-status-draping') || 'Generating realistic drapes\u2026';
  var msgStatusFinalizing =
    container.getAttribute('data-status-finalizing') || 'Finalizing your look\u2026 almost there!';
  var msgStatusSuccess = container.getAttribute('data-status-success') || 'Looking great!';

  // Show quota badge
  if (quotaBadge) {
    var quotaAvailableTpl = container.getAttribute('data-quota-available') || '{{ count }} try-ons available';
    quotaBadge.textContent = quotaAvailableTpl.replace('{{ count }}', quotaMax);
  }

  function trackTryOn(name, extra) {
    trackImmersiveEvent(
      name,
      Object.assign(
        {
          product_title: productTitle,
          customer_id_present: !!customerId,
        },
        extra || {},
      ),
    );
  }

  var userImageDataUrl = null;

  userPhotoInput.addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      tryOnBtn.disabled = true;
      return;
    }

    var uploadText = container.querySelector('.vtryon__upload-text');
    var uploadIcon = container.querySelector('.vtryon__upload-icon');
    var preview = container.querySelector('.vtryon__preview');
    if (uploadText) uploadText.textContent = file.name;

    var reader = new FileReader();
    reader.onload = function (e) {
      if (preview && uploadIcon) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadIcon.style.display = 'none';
      }
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 768;
        canvas.height = 1024;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 768, 1024);
        var scale = Math.min(768 / img.width, 1024 / img.height);
        var x = (768 - img.width * scale) / 2;
        var y = (1024 - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        userImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        tryOnBtn.disabled = false;
      };
      img.onerror = function () {
        showError(msgErrorPhotoRead);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      showError(msgErrorPhotoRead);
    };
    reader.readAsDataURL(file);
  });

  tryOnBtn.addEventListener('click', async function () {
    if (!userImageDataUrl) return;

    var statusText = container.querySelector('.vtryon__status');
    var errorBox = container.querySelector('.vtryon__error');
    var seconds = 0;
    var timer = null;

    function setStatus(msg) {
      if (statusText) statusText.textContent = msg;
    }
    function showError(msg) {
      if (errorBox) {
        errorBox.textContent = msg;
        // Do NOT toggle display — keep the live region in the accessibility tree
        // so screen readers announce the injected text. CSS hides it when empty.
      }
      setStatus('');
    }

    try {
      tryOnBtn.disabled = true;
      if (resultContainer) resultContainer.style.display = 'none';
      if (errorBox) errorBox.textContent = ''; // clear previous error without hiding the live region
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      trackTryOn('tryon_started', {});
      setStatus(msgStatusUploading);
      var blob = await (function () {
        return new Promise(function (resolve, reject) {
          var byteString = atob(userImageDataUrl.split(',')[1]);
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          resolve(new Blob([ab], { type: 'image/jpeg' }));
        });
      })();

      var uploadRes = await fetch('https://scuk-vton.vercel.app/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });
      var uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) throw new Error(uploadData.error || 'Upload failed');

      var userImageUrl = uploadData.url;

      // Step 2: Call /api/tryon with customer auth + quota fields
      setStatus(msgStatusProcessing);
      timer = setInterval(function () {
        seconds++;
        if (seconds === 10) setStatus(msgStatusDraping);
        if (seconds === 25) setStatus(msgStatusFinalizing);
      }, 1000);

      var tryonRes = await fetch('https://scuk-vton.vercel.app/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_image_url: userImageUrl,
          product_image_url: productImageUrl,
          garment_description: productTitle || 'Luxury Pakistani ethnic wear',
          full_body: true,
          customer_id: customerId,
          customer_token: customerToken,
          is_recent_purchaser: isRecentPurchaser,
        }),
      });

      if (!tryonRes.ok) {
        var errData = await tryonRes.json().catch(function () {
          return {};
        });
        // Handle quota exceeded with a friendly message
        if (errData.code === 'quota_exceeded') {
          throw new Error(errData.error || msgErrorQuotaExceeded);
        }
        if (errData.code === 'auth_required') {
          throw new Error(msgErrorAuthRequired);
        }
        throw new Error(errData.error || 'Try-on failed');
      }

      // Step 3: Result streamed as image/jpeg
      var imgBlob = await tryonRes.blob();
      var objectUrl = URL.createObjectURL(imgBlob);

      // Update quota badge
      var quotaUsed = parseInt(tryonRes.headers.get('X-Quota-Used') || '1', 10);
      var quotaMaxHeader = parseInt(tryonRes.headers.get('X-Quota-Max') || String(quotaMax), 10);
      var remaining = quotaMaxHeader - quotaUsed;
      if (quotaBadge) {
        var quotaRemainingTpl = container.getAttribute('data-quota-remaining') || '{{ count }} try-ons remaining';
        quotaBadge.textContent = quotaRemainingTpl.replace('{{ count }}', remaining);
        if (remaining === 0) quotaBadge.style.color = 'rgba(252,165,165,0.8)';
      }

      setStatus(msgStatusSuccess);
      if (resultImg) {
        if (resultImg._objectUrl) URL.revokeObjectURL(resultImg._objectUrl);
        resultImg._objectUrl = objectUrl;
        resultImg.src = objectUrl;
        resultImg.hidden = false;
      }
      if (resultContainer) resultContainer.style.display = 'block';
      trackTryOn('tryon_completed', { quota_remaining: remaining });
    } catch (error) {
      console.error('Try-on error:', error);
      showError(error.message);
      trackTryOn('tryon_failed', { error_message: error && error.message ? error.message : 'Unknown error' });
    } finally {
      clearInterval(timer);
      tryOnBtn.disabled = false;
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  });
}

function showCartFeedback(panel) {
  var glassPanel = document.getElementById(glassPanelId);
  var msg = (glassPanel && glassPanel.getAttribute('data-msg-added-to-cart')) || 'Added to cart!';
  var feedback = document.createElement('div');
  feedback.className = 'immersive-cart-feedback';
  feedback.textContent = msg;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.style.cssText =
    'position: fixed; top: 20px; right: 20px; background: rgba(212, 175, 55, 0.9); color: #000; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600;';

  document.body.appendChild(feedback);

  setTimeout(function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) {
        document.body.removeChild(feedback);
      }
    }, 300);
  }, 2000);
}

// ============================================================
// Immersive Cart Modal
// ============================================================
function openImmersiveCart() {
  // Check if modal already exists
  var existingModal = document.getElementById('immersive-cart-modal');
  if (existingModal) {
    existingModal.style.display = 'flex';
    return;
  }

  // Create modal structure
  var modal = document.createElement('div');
  modal.id = 'immersive-cart-modal';
  modal.className = 'immersive-cart-shell';
  modal.setAttribute('data-overlay-opacity', '0.65');
  modal.setAttribute('data-panel-background', '#0a0f1e');
  modal.setAttribute('data-title', 'Your Immersive Cart');
  modal.setAttribute('data-close-label', 'Close');

  modal.innerHTML = `
    <div class="immersive-cart-shell__panel" role="dialog" aria-modal="true" aria-labelledby="immersive-cart-title">
      <header class="immersive-cart-shell__header">
        <h1 id="immersive-cart-title" class="immersive-cart-shell__title">Your Immersive Cart</h1>
        <button
          class="immersive-cart-shell__close"
          type="button"
          data-close-cart
          aria-label="Close immersive cart"
        >×</button>
      </header>
      <div class="immersive-cart-shell__content" id="immersive-cart-content">
        <div class="immersive-cart-loading">Loading cart...</div>
      </div>
    </div>
  `;

  // Inject CSS
  if (!document.getElementById('immersive-cart-styles')) {
    var style = document.createElement('style');
    style.id = 'immersive-cart-styles';
    style.textContent = `
      .immersive-cart-shell {
        position: fixed;
        inset: 0;
        background: rgba(6, 8, 14, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        z-index: 10000;
        animation: immersiveCartFadeIn 0.25s ease-out;
      }
      @keyframes immersiveCartFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      .immersive-cart-shell__panel {
        width: min(1100px, 92%);
        max-height: 88vh;
        overflow: hidden;
        background: rgba(16, 22, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(6px);
        color: #f9fafb;
        display: flex;
        flex-direction: column;
      }
      .immersive-cart-shell__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(8, 12, 28, 0.6);
      }
      .immersive-cart-shell__title {
        margin: 0;
        font-size: 1.25rem;
        color: #d4af37;
        text-transform: none;
      }
      .immersive-cart-shell__close {
        background: none;
        border: 1px solid rgba(212, 175, 55, 0.8);
        color: #d4af37;
        border-radius: 6px;
        width: 38px;
        height: 34px;
        font-size: 1.5rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .immersive-cart-shell__close:hover {
        background: rgba(212, 175, 55, 0.1);
        border-color: #d4af37;
      }
      .immersive-cart-shell__content {
        padding: 16px 18px 20px;
        overflow: auto;
        flex: 1;
      }
      .immersive-cart-loading {
        text-align: center;
        padding: 2rem;
        color: #d4af37;
      }
      @media (max-width: 720px) {
        .immersive-cart-shell {
          padding: 1rem;
        }
        .immersive-cart-shell__panel {
          width: 96%;
          max-height: 90vh;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  // Load cart content
  fetch(shopRoot + '?section_id=cart-drawer')
    .then(function (r) {
      return r.text();
    })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var cartDrawerContent = doc.querySelector('#CartDrawer');

      var contentEl = document.getElementById('immersive-cart-content');
      if (contentEl && cartDrawerContent) {
        contentEl.innerHTML = cartDrawerContent.innerHTML;
      }
    })
    .catch(function () {
      var contentEl = document.getElementById('immersive-cart-content');
      if (contentEl) {
        contentEl.innerHTML = '<p style="text-align:center;color:#d4af37;">Failed to load cart</p>';
      }
    });

  // Close button handler
  var closeBtn = modal.querySelector('[data-close-cart]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeImmersiveCart);
  }

  // Close on overlay click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeImmersiveCart();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', handleCartEscape);

  // Focus trap
  trapCartFocus(modal.querySelector('.immersive-cart-shell__panel'));
}

function closeImmersiveCart() {
  var modal = document.getElementById('immersive-cart-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease';
    setTimeout(function () {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 200);
  }
  document.removeEventListener('keydown', handleCartEscape);
}

function handleCartEscape(e) {
  if (e.key === 'Escape') {
    closeImmersiveCart();
  }
}

function trapCartFocus(container) {
  var focusables = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;

  var first = focusables[0];
  var last = focusables[focusables.length - 1];

  first.focus();

  container.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function showErrorFeedback(panel, message) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-error-feedback';
  feedback.textContent = message;
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  feedback.style.cssText =
    'position: fixed; top: 20px; right: 20px; background: rgba(239, 68, 68, 0.9); color: #fff; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600; cursor: pointer;';

  document.body.appendChild(feedback);

  var dismissFeedback = function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) {
        document.body.removeChild(feedback);
      }
    }, 300);
  };

  // Allow manual dismissal
  feedback.addEventListener('click', dismissFeedback);

  // Auto-dismiss after 4 seconds
  setTimeout(dismissFeedback, 4000);
}

function showImmersiveOnboardingIfNeeded() {
  var overlay = document.getElementById('immersive-onboarding');
  if (!overlay) return;

  // Respect the "show once" setting — if data-show-once="true", skip if already seen
  var showOnce = overlay.getAttribute('data-show-once') !== 'false';
  if (showOnce) {
    var seen = false;
    try {
      seen = !!localStorage.getItem(ONBOARDING_KEY);
    } catch (e) {
      // localStorage blocked (private browsing) — treat as unseen
    }
    if (seen) return;
  }

  var previousFocus = document.activeElement;
  overlay.removeAttribute('hidden');

  var dismissBtn = overlay.querySelector('[data-onboarding-dismiss]');
  if (dismissBtn) {
    requestAnimationFrame(function () {
      dismissBtn.focus();
    });

    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusableElements(overlay);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function onEscape(e) {
      if (e.key === 'Escape') dismissBtn.click();
    }
    overlay.addEventListener('keydown', trapFocus);
    overlay.addEventListener('keydown', onEscape);

    dismissBtn.addEventListener('click', function onDismiss() {
      dismissBtn.removeEventListener('click', onDismiss);
      overlay.removeEventListener('keydown', trapFocus);
      overlay.removeEventListener('keydown', onEscape);
      if (showOnce) {
        try {
          localStorage.setItem(ONBOARDING_KEY, '1');
        } catch (e) {}
      }
      overlay.setAttribute('hidden', '');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        requestAnimationFrame(function () {
          previousFocus.focus();
        });
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Wishlist Manager
// ─────────────────────────────────────────────────────────────

function getWishlist() {
  return _wishlistItems.slice();
}

function _persistWishlist() {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(_wishlistItems));
  } catch (e) {}
}

function updateWishlistBadge() {
  var badge = document.querySelector('[data-wishlist-badge]');
  if (!badge) return;
  badge.textContent = _wishlistItems.length;
  badge.hidden = _wishlistItems.length === 0;
  if (typeof window.updateBottomNavBadges === 'function') {
    window.updateBottomNavBadges(_wishlistItems.length, null);
  }
}

function syncAllWishlistToggles(root) {
  var toggles = root.querySelectorAll('[data-wishlist-toggle]');
  for (var i = 0; i < toggles.length; i++) {
    var toggle = toggles[i];
    var handle = toggle.getAttribute('data-product-handle');
    var isSaved =
      handle &&
      _wishlistItems.some(function (item) {
        return (typeof item === 'string' ? item : item.handle) === handle;
      });
    toggle.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    toggle.classList.toggle('is-saved', !!isSaved);
    var labelSave = toggle.getAttribute('data-label-save');
    var labelSaved = toggle.getAttribute('data-label-saved');
    if (labelSave && labelSaved) {
      toggle.setAttribute('aria-label', isSaved ? labelSaved : labelSave);
    }
  }
}

function _triggerHeartPulse() {
  if (reduceMotion) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  btn.classList.remove('immersive-wishlist-btn--pulse');
  void btn.offsetWidth; // force reflow
  btn.classList.add('immersive-wishlist-btn--pulse');
  setTimeout(function () {
    btn.classList.remove('immersive-wishlist-btn--pulse');
  }, 600);
}

function _flyToWishlist(sourceEl) {
  if (reduceMotion || !sourceEl) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  var srcRect = sourceEl.getBoundingClientRect();
  var btnRect = btn.getBoundingClientRect();
  var token = document.createElement('div');
  token.className = 'immersive-fly-token';
  token.setAttribute('aria-hidden', 'true');
  token.style.left = srcRect.left + srcRect.width / 2 - 8 + 'px';
  token.style.top = srcRect.top + srcRect.height / 2 - 8 + 'px';
  document.body.appendChild(token);
  requestAnimationFrame(function () {
    var dx = btnRect.left + btnRect.width / 2 - 8 - (srcRect.left + srcRect.width / 2 - 8);
    var dy = btnRect.top + btnRect.height / 2 - 8 - (srcRect.top + srcRect.height / 2 - 8);
    token.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease';
    token.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.3)';
    token.style.opacity = '0';
  });
  setTimeout(function () {
    if (token.parentNode) token.parentNode.removeChild(token);
  }, 550);
}

function addToWishlist(handle, source, sourceEl) {
  if (!handle) return;
  // Check for existing entry (handle may be string or object)
  var alreadySaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });
  if (alreadySaved) return;
  _wishlistItems.push({ handle: handle, discoveryRoom: immersiveState.currentRoom || null });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  _triggerHeartPulse();
  _flyToWishlist(sourceEl);
  if (typeof recordBrowsingSignal === 'function') recordBrowsingSignal(immersiveState.currentRoom);
  trackImmersiveEvent('wishlist_add', { product_handle: handle, source: source || 'unknown' });
}

function removeFromWishlist(handle, source) {
  if (!handle) return;
  _wishlistItems = _wishlistItems.filter(function (item) {
    return (typeof item === 'string' ? item : item.handle) !== handle;
  });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: source || 'unknown' });
}

function toggleWishlistItem(handle, source, sourceEl) {
  var isSaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });
  if (isSaved) {
    removeFromWishlist(handle, source);
  } else {
    addToWishlist(handle, source, sourceEl);
  }
}

function cacheWishlistProduct(handle, panelEl) {
  if (!handle || !panelEl) return;
  var titleEl = panelEl.querySelector('.glass-product-section__title');
  var priceEl = panelEl.querySelector('.glass-product-section__price');
  var imgEl = panelEl.querySelector('.glass-product-section__media-main img');
  if (!titleEl) return;
  _wishlistProductCache[handle] = {
    title: titleEl.textContent.trim(),
    price: priceEl ? priceEl.textContent.trim() : '',
    imageSrc: imgEl ? imgEl.getAttribute('src') : '',
  };
}

function renderWishlistPanel() {
  var body = document.querySelector('[data-wishlist-body]');
  var panelEl = document.getElementById('immersive-wishlist-panel');
  if (!body || !panelEl) return;

  var emptyMsg =
    panelEl.getAttribute('data-msg-empty-encouragement') ||
    panelEl.getAttribute('data-msg-empty') ||
    "You haven't saved any products yet.";
  var viewMsg = panelEl.getAttribute('data-msg-view') || 'View product';
  var removeMsg = panelEl.getAttribute('data-msg-remove') || 'Remove from wishlist';

  if (_wishlistItems.length === 0) {
    body.innerHTML = renderEmptyState('wishlist');
    return;
  }

  // Group items by discoveryRoom
  var groups = {};
  var groupOrder = [];
  for (var i = 0; i < _wishlistItems.length; i++) {
    var item = _wishlistItems[i];
    var handle = typeof item === 'string' ? item : item.handle;
    var room = (typeof item === 'string' ? null : item.discoveryRoom) || null;
    var groupKey = room || '__saved__';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
      groupOrder.push(groupKey);
    }
    groups[groupKey].push(handle);
  }

  var roomBadgeEl = document.getElementById('immersive-room-badge');
  var html = '';

  for (var g = 0; g < groupOrder.length; g++) {
    var groupKey = groupOrder[g];
    var handles = groups[groupKey];

    // Resolve room label
    var roomLabel;
    if (groupKey === '__saved__') {
      roomLabel = 'Saved';
    } else {
      roomLabel = (roomBadgeEl && roomBadgeEl.getAttribute('data-room-name-' + groupKey)) || groupKey;
    }

    html += '<h3 class="immersive-wishlist__room-label">Found in: ' + roomLabel + '</h3>';

    for (var j = 0; j < handles.length; j++) {
      var handle = handles[j];
      var cached = _wishlistProductCache[handle] || {};
      var title = cached.title || handle;
      var price = cached.price || '';
      var imgSrc = cached.imageSrc || '';
      var imgHtml = imgSrc
        ? '<img src="' +
          imgSrc +
          '" alt="' +
          title.replace(/"/g, '&quot;') +
          '" loading="lazy" width="80" height="107">'
        : '<div style="width:80px;height:107px;background:rgba(255,255,255,0.05);border-radius:0.25rem;"></div>';

      html +=
        '<article class="immersive-wishlist-card" data-wishlist-card data-product-handle="' +
        handle +
        '">' +
        imgHtml +
        '<div class="immersive-wishlist-card__info">' +
        '<p class="immersive-wishlist-card__title">' +
        title +
        '</p>' +
        '<p class="immersive-wishlist-card__price">' +
        price +
        '</p>' +
        '</div>' +
        '<div class="immersive-wishlist-card__actions">' +
        '<button type="button" data-wishlist-view data-product-handle="' +
        handle +
        '" aria-label="' +
        viewMsg +
        ' ' +
        title.replace(/"/g, '&quot;') +
        '">' +
        viewMsg +
        '</button>' +
        '<button type="button" data-wishlist-remove data-product-handle="' +
        handle +
        '" aria-label="' +
        removeMsg +
        '">' +
        removeMsg +
        '</button>' +
        '</div>' +
        '</article>';
    }
  }

  body.innerHTML = html;
}

function openWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  _wishlistPanelTrigger = document.activeElement;
  renderWishlistPanel();
  panel.removeAttribute('hidden');
  var closeBtn = panel.querySelector('[data-wishlist-close]');
  if (closeBtn) {
    requestAnimationFrame(function () {
      closeBtn.focus();
    });
  }
  // Wire focus trap and Escape via a lightweight inline handler
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  function onEscape(e) {
    if (e.key === 'Escape') closeWishlistPanel();
  }
  panel._wlTrapFocus = trapFocus;
  panel._wlEscape = onEscape;
  panel.addEventListener('keydown', trapFocus);
  panel.addEventListener('keydown', onEscape);

  // Add click handler for empty state actions
  function handleWishlistClick(e) {
    var emptyAction = e.target.closest('[data-empty-action]');
    if (emptyAction) {
      var action = emptyAction.getAttribute('data-empty-action');
      if (action) {
        handleEmptyStateAction(action);
      }
      return;
    }
  }
  panel._wlClickHandler = handleWishlistClick;
  panel.addEventListener('click', handleWishlistClick);

  trackImmersiveEvent('wishlist_panel_opened', { item_count: _wishlistItems.length });
}

function closeWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  if (panel._wlTrapFocus) panel.removeEventListener('keydown', panel._wlTrapFocus);
  if (panel._wlEscape) panel.removeEventListener('keydown', panel._wlEscape);
  if (panel._wlClickHandler) panel.removeEventListener('click', panel._wlClickHandler);
  panel.setAttribute('hidden', '');
  if (_wishlistPanelTrigger && typeof _wishlistPanelTrigger.focus === 'function') {
    requestAnimationFrame(function () {
      _wishlistPanelTrigger.focus();
    });
  }
  _wishlistPanelTrigger = null;
}

function initWishlist() {
  try {
    var stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    var raw = Array.isArray(stored) ? stored : [];
    // Migrate old string-format items to object format
    _wishlistItems = raw.map(function (item) {
      if (typeof item === 'string') return { handle: item, discoveryRoom: null };
      return item;
    });
  } catch (e) {
    _wishlistItems = [];
  }
  updateWishlistBadge();
  syncAllWishlistToggles(document);

  // Single delegated listener for all wishlist interactions
  document.addEventListener('click', function (e) {
    // Open panel
    if (e.target.closest('[data-wishlist-open]')) {
      openWishlistPanel();
      return;
    }
    // Close panel
    if (e.target.closest('[data-wishlist-close]')) {
      closeWishlistPanel();
      return;
    }
    // Toggle (card or product panel)
    var toggle = e.target.closest('[data-wishlist-toggle]');
    if (toggle) {
      var handle = toggle.getAttribute('data-product-handle');
      var source = toggle.closest('#glass-panel') ? 'product_panel' : 'product_card';
      if (handle) toggleWishlistItem(handle, source, toggle);
      return;
    }
    // Remove from wishlist panel
    var removeBtn = e.target.closest('[data-wishlist-remove]');
    if (removeBtn) {
      var rHandle = removeBtn.getAttribute('data-product-handle');
      if (rHandle) {
        removeFromWishlist(rHandle, 'wishlist_panel');
        var card = removeBtn.closest('[data-wishlist-card]');
        if (card) card.parentNode.removeChild(card);
        // Show empty state if no cards remain
        var body = document.querySelector('[data-wishlist-body]');
        if (body && !body.querySelector('[data-wishlist-card]')) {
          renderWishlistPanel();
        }
      }
      return;
    }
    // View product from wishlist panel
    var viewBtn = e.target.closest('[data-wishlist-view]');
    if (viewBtn) {
      var vHandle = viewBtn.getAttribute('data-product-handle');
      if (vHandle) {
        trackImmersiveEvent('wishlist_view_product', { product_handle: vHandle });
        closeWishlistPanel();
        openProductPanel(vHandle, null);
      }
      return;
    }
  });
}

function loadProductRecommendations(panel) {
  var sectionEl = panel.querySelector('.glass-product-section');
  var relatedRoot = panel.querySelector('[data-related-root]');
  if (!sectionEl || !relatedRoot) return;

  var productId = sectionEl.getAttribute('data-product-id');
  if (!productId) return;

  // Use the existing Dawn related-products section for rendering
  var url =
    shopRoot +
    'recommendations/products?product_id=' +
    encodeURIComponent(productId) +
    '&limit=4&intent=related' +
    '&section_id=glass-product-recommendations';

  fetchWithCache(url)
    .then(function (html) {
      if (html && html.trim()) relatedRoot.innerHTML = html;
    })
    .catch(function () {
      // Silent failure — leave relatedRoot empty, panel remains usable
    });
}

function bindImmersiveNav() {
  // 1. Wire cart toggle to Dawn's cart-drawer web component
  var cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', function () {
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open(cartToggle);
      } else {
        window.location.href = shopRoot + 'cart';
      }
    });
  }

  // 1b. Wire 3D→2D mode switch — clears the 3D preference so the
  //     preference banner won't nudge the user back to 3D immediately.
  var modeSwitchBtn = document.querySelector('[data-mode-switch-2d]');
  if (modeSwitchBtn) {
    modeSwitchBtn.addEventListener('click', function () {
      clearImmersivePreference();
    });
  }

  // 2. Intercept menu-drawer link clicks so collection/product links open
  //    inside the glass panel instead of navigating away.
  var menuDrawerEl = document.getElementById('menu-drawer');
  if (menuDrawerEl) {
    menuDrawerEl.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href') || '';

      // Match /collections/{handle} — open collection panel
      var collectionMatch = href.match(/\/collections\/([^/?#]+)/);
      if (collectionMatch) {
        e.preventDefault();
        closeMenuDrawer();
        openCollectionPanel(collectionMatch[1]);
        return;
      }

      // Match /products/{handle} — open product panel
      var productMatch = href.match(/\/products\/([^/?#]+)/);
      if (productMatch) {
        e.preventDefault();
        closeMenuDrawer();
        openProductPanel(productMatch[1], null);
        return;
      }

      // All other links (pages, external, etc.) navigate normally —
      // just close the drawer first so it doesn't stay open mid-navigation
      closeMenuDrawer();
    });
  }
}

function closeMenuDrawer() {
  var details = document.getElementById('Details-menu-drawer-container');
  if (details) details.removeAttribute('open');
}

function bindCookieBanner() {
  var banner = document.getElementById('immersive-cookie-banner');
  if (!banner) return;

  var COOKIE_KEY = 'immersive_cookie_notice';
  try {
    if (localStorage.getItem(COOKIE_KEY)) return; // already dismissed
  } catch (e) {}

  // Show the banner
  banner.removeAttribute('hidden');

  function dismiss() {
    banner.setAttribute('hidden', '');
    try {
      localStorage.setItem(COOKIE_KEY, '1');
    } catch (e) {}
  }

  var acceptBtn = document.getElementById('immersive-cookie-accept');
  var declineBtn = document.getElementById('immersive-cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', dismiss);
  if (declineBtn) declineBtn.addEventListener('click', dismiss);
}

// ---------------------------------------------------------------------------
// ImmersiveEditorial — reusable timeline + dynamic product loader

// ---------------------------------------------------------------------------
// ImmersiveEditorial — reusable timeline + dynamic product loader
// Exposed on window.ImmersiveEditorial so enterEditorialMode can call
// ImmersiveEditorial.init(overlayContent) after injecting section HTML.
// Supports any editorial room that uses the .immersive-designers pattern.
// ---------------------------------------------------------------------------
(function () {
  // Section ID used with the Section Rendering API to fetch product grids.
  // Matches sections/immersive-designer-grid.liquid.
  var PRODUCTS_SECTION_ID = 'immersive-designer-grid';

  // Minimum px movement before a drag is committed (avoids accidental drags on click)
  var DRAG_THRESHOLD = 4;

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMoneyFromCents(cents) {
    var amount = Number(cents || 0) / 100;
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      try {
        return window.Shopify.formatMoney(cents);
      } catch (e) {}
    }
    return '$' + amount.toFixed(2);
  }

  function renderTimelineProductsFallback(productsContainer, products) {
    if (!productsContainer) return;
    if (!Array.isArray(products) || !products.length) {
      productsContainer.innerHTML = '';
      return;
    }
    var cards = products
      .map(function (product) {
        var title = escapeHtml(product.title || '');
        var handle = escapeHtml(product.handle || '');
        var productUrl = shopRoot + 'products/' + handle;
        var imgSrc = '';
        if (product.image && product.image.src) {
          imgSrc = product.image.src;
        } else if (Array.isArray(product.images) && product.images.length) {
          imgSrc = product.images[0];
        }
        var media = imgSrc
          ? '<a href="' +
            productUrl +
            '" class="immersive-product-link" data-product-handle="' +
            handle +
            '">' +
            '<img class="immersive-product-image" src="' +
            escapeHtml(imgSrc) +
            '" alt="' +
            title +
            '" loading="lazy">' +
            '</a>'
          : '<div class="immersive-product-image immersive-product-image-placeholder">No image</div>';
        return (
          '<article class="immersive-product-card" data-product-handle="' +
          handle +
          '">' +
          media +
          '<div class="immersive-product-info">' +
          '<h3 class="immersive-product-title"><a href="' +
          productUrl +
          '" class="immersive-product-title-link" data-product-handle="' +
          handle +
          '">' +
          title +
          '</a></h3>' +
          '<div class="immersive-product-price"><span>' +
          formatMoneyFromCents(product.price_min || product.price || 0) +
          '</span></div>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
    productsContainer.innerHTML = '<div class="immersive-designer-grid">' + cards + '</div>';
  }

  // ---------------------------------------------------------------------------
  // Product loading via Section Rendering API
  // ---------------------------------------------------------------------------
  function loadTimelineCollection(markerEl, productsContainer, options) {
    if (!markerEl || !productsContainer) return;
    var handle = markerEl.getAttribute('data-collection-handle');
    if (!handle) {
      productsContainer.innerHTML = '';
      return;
    }
    var sectionId = (options && options.productsSectionId) || PRODUCTS_SECTION_ID;
    var url = '/collections/' + encodeURIComponent(handle) + '?sections=' + encodeURIComponent(sectionId);

    productsContainer.innerHTML =
      '<div class="immersive-designers__products-loading" aria-live="polite" role="status">' +
      (options && options.loadingText ? options.loadingText : 'Loading\u2026') +
      '</div>';

    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (response) {
        if (!response.ok) throw new Error('Network error ' + response.status);
        return response.json();
      })
      .then(function (json) {
        var html = json[sectionId];
        if (!html) {
          return fetch(shopRoot + 'collections/' + encodeURIComponent(handle) + '/products.json?limit=12', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })
            .then(function (res) {
              if (!res.ok) throw new Error('Products API error ' + res.status);
              return res.json();
            })
            .then(function (productsJson) {
              renderTimelineProductsFallback(productsContainer, productsJson && productsJson.products);
            });
        }
        productsContainer.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('[ImmersiveEditorial] Product load failed:', err);
        productsContainer.innerHTML = '';
      });
  }

  // ---------------------------------------------------------------------------
  // Timeline thumb positioning
  // ---------------------------------------------------------------------------
  function positionThumb(thumb, activeMarker, rail) {
    if (!thumb || !activeMarker || !rail) return;
    var railRect = rail.getBoundingClientRect();
    var markerRect = activeMarker.getBoundingClientRect();
    var left = markerRect.left - railRect.left;
    var width = markerRect.width;
    // Offset thumb to sit behind the rail's own padding
    thumb.style.left = left + 'px';
    thumb.style.width = width + 'px';
  }

  // ---------------------------------------------------------------------------
  // Activate a marker: update ARIA/classes, move thumb, load products
  // ---------------------------------------------------------------------------
  function activateMarker(markers, thumb, rail, productsContainer, index, options, root) {
    var target = markers[index];
    if (!target) return;

    for (var i = 0; i < markers.length; i++) {
      markers[i].classList.remove('is-active');
      markers[i].setAttribute('aria-pressed', 'false');
    }
    target.classList.add('is-active');
    target.setAttribute('aria-pressed', 'true');

    positionThumb(thumb, target, rail);
    loadTimelineCollection(target, productsContainer, options);

    // Kinetic Hero Transition
    var heroStates = root.querySelectorAll('.immersive-designers__hero-state');
    heroStates.forEach(function (state) {
      state.classList.remove('is-active');
      if (parseInt(state.getAttribute('data-hero-index'), 10) === index) {
        state.classList.add('is-active');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Snap to nearest marker based on pointer X position over the rail
  // ---------------------------------------------------------------------------
  function snapToNearest(markers, pointerX, railRect) {
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < markers.length; i++) {
      var rect = markers[i].getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      var dist = Math.abs(pointerX - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  // ---------------------------------------------------------------------------
  // Wire up a single .immersive-designers container
  // ---------------------------------------------------------------------------
  function initDesignersTimeline(root, options) {
    var rail = root.querySelector('.immersive-designers__rail');
    var thumb = root.querySelector('.immersive-designers__thumb');
    var roomKey = root.getAttribute('data-room-key') || 'designers';
    var productsContainer = root.querySelector('.immersive-designers__products');

    if (!rail || !thumb || !productsContainer) return;

    var markers = Array.prototype.slice.call(rail.querySelectorAll('.immersive-designers__marker'));
    if (!markers.length) return;

    var activeIndex = 0;
    var dragging = false;
    var dragStartX = 0;
    var dragMoved = false;

    // Activate first marker on init (after layout is painted)
    requestAnimationFrame(function () {
      activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
    });

    // Click on a marker
    markers.forEach(function (marker, i) {
      marker.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      marker.addEventListener('click', function () {
        if (dragMoved) return; // swallow click that ended a drag
        activeIndex = i;
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      });
    });

    // Keyboard: arrow keys move between markers
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = clamp(activeIndex + 1, 0, markers.length - 1);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
        markers[activeIndex].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = clamp(activeIndex - 1, 0, markers.length - 1);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
        markers[activeIndex].focus();
      }
    });

    // Drag: pointer events on the rail for smooth scrubbing
    rail.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      rail.setPointerCapture(e.pointerId);
    });

    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - dragStartX) > DRAG_THRESHOLD) {
        dragMoved = true;
      }
      if (!dragMoved) return;
      var railRect = rail.getBoundingClientRect();
      var nearest = snapToNearest(markers, e.clientX, railRect);
      if (nearest !== activeIndex) {
        activeIndex = nearest;
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      }
    });

    rail.addEventListener('pointerup', function (e) {
      if (dragging && dragMoved) {
        var railRect = rail.getBoundingClientRect();
        activeIndex = snapToNearest(markers, e.clientX, railRect);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      }
      dragging = false;
    });

    rail.addEventListener('pointercancel', function () {
      dragging = false;
    });

    // Re-position thumb on resize (font/layout changes can shift markers)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var active = markers[activeIndex];
        if (active) positionThumb(thumb, active, rail);
      }, 120);
    });
  }

  // ---------------------------------------------------------------------------
  // Public API — called by enterEditorialMode after injecting HTML
  // ---------------------------------------------------------------------------
  function init(container, options) {
    var roots = (container || document).querySelectorAll('.immersive-designers');
    for (var i = 0; i < roots.length; i++) {
      initDesignersTimeline(roots[i], options || {});
    }
  }

  window.ImmersiveEditorial = { init: init };
})();

// ============================================================
// ImmersiveSearch — inline header search with Cmd/Ctrl+K
// ============================================================

var _searchDebounceTimer = null;
var _searchActiveIndex = -1;
var _searchResults = [];
var _searchAbortController = null;

var SWIPE_ROOM_SEQUENCE = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];

function initImmersiveSearch() {
  var container = document.querySelector('[data-immersive-search]');
  if (!container) return;

  var input = container.querySelector('#immersive-search-input');
  var dropdown = container.querySelector('#immersive-search-results');
  if (!input || !dropdown) return;

  var msgNoResults = container.getAttribute('data-msg-no-results') || 'No results';
  var msgNoResultsHint = container.getAttribute('data-msg-no-results-hint') || '';
  var msgUnavailable = container.getAttribute('data-msg-unavailable') || 'Search unavailable';
  var labelProducts = container.getAttribute('data-label-products') || 'Products';
  var labelCollections = container.getAttribute('data-label-collections') || 'Collections';
  var labelRooms = container.getAttribute('data-label-rooms') || 'Rooms';

  // Room list for client-side fuzzy match
  var ROOM_LIST = [
    { roomKey: 'storefront', label: 'Storefront' },
    { roomKey: 'lounge', label: 'Lounge' },
    { roomKey: 'designer_houses', label: 'Designer Houses' },
    { roomKey: 'occasions', label: 'Occasions' },
    { roomKey: 'featured_collections', label: 'Featured Collections' },
  ];

  function focusSearch() {
    input.focus();
    input.select();
  }

  function closeDropdown() {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    _searchActiveIndex = -1;
    _searchResults = [];
  }

  function fuzzyMatchRooms(term) {
    var t = term.toLowerCase();
    return ROOM_LIST.filter(function (r) {
      return r.label.toLowerCase().indexOf(t) !== -1 || r.roomKey.indexOf(t) !== -1;
    });
  }

  function renderResults(apiResults, roomMatches) {
    dropdown.innerHTML = '';
    var hasContent = false;

    // Build flat list for keyboard nav
    _searchResults = [];

    // Products
    if (apiResults.products && apiResults.products.length) {
      hasContent = true;
      var groupLabel = document.createElement('span');
      groupLabel.className = 'immersive-search__group-label';
      groupLabel.textContent = labelProducts;
      dropdown.appendChild(groupLabel);
      apiResults.products.forEach(function (item) {
        _searchResults.push({ type: 'product', data: item });
        dropdown.appendChild(buildResultEl(item, 'product', _searchResults.length - 1));
      });
    }

    // Collections
    if (apiResults.collections && apiResults.collections.length) {
      hasContent = true;
      var groupLabel2 = document.createElement('span');
      groupLabel2.className = 'immersive-search__group-label';
      groupLabel2.textContent = labelCollections;
      dropdown.appendChild(groupLabel2);
      apiResults.collections.forEach(function (item) {
        _searchResults.push({ type: 'collection', data: item });
        dropdown.appendChild(buildResultEl(item, 'collection', _searchResults.length - 1));
      });
    }

    // Rooms (client-side)
    if (roomMatches && roomMatches.length) {
      hasContent = true;
      var groupLabel3 = document.createElement('span');
      groupLabel3.className = 'immersive-search__group-label';
      groupLabel3.textContent = labelRooms;
      dropdown.appendChild(groupLabel3);
      roomMatches.forEach(function (room) {
        _searchResults.push({ type: 'room', data: room });
        dropdown.appendChild(buildRoomResultEl(room, _searchResults.length - 1));
      });
    }

    if (!hasContent) {
      var noRes = document.createElement('div');
      noRes.className = 'immersive-search__no-results';
      noRes.textContent = msgNoResults.replace('{{term}}', input.value);
      if (msgNoResultsHint) {
        var hint = document.createElement('span');
        hint.className = 'immersive-search__no-results-hint';
        hint.textContent = msgNoResultsHint;
        noRes.appendChild(hint);
      }
      dropdown.appendChild(noRes);
    }

    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    _searchActiveIndex = -1;
  }

  function buildResultEl(item, type, index) {
    var el = document.createElement('div');
    el.className = 'immersive-search__result';
    el.setAttribute('role', 'option');
    el.setAttribute('id', 'immersive-search-result-' + index);
    el.setAttribute('aria-selected', 'false');

    // Add icon based on type
    var iconType = type === 'collection' ? 'collection' : 'product';
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon(iconType);
    var iconEl = iconWrapper.firstChild;
    if (iconEl) {
      el.appendChild(iconEl);
    }

    var info = document.createElement('div');
    info.className = 'immersive-search__result-info';

    var title = document.createElement('span');
    title.className = 'immersive-search__result-title';
    title.textContent = item.title || '';
    info.appendChild(title);

    if (item.price) {
      var meta = document.createElement('span');
      meta.className = 'immersive-search__result-meta';
      meta.textContent = item.price;
      info.appendChild(meta);
    }

    el.appendChild(info);

    el.addEventListener('click', function () {
      selectResult(index);
    });

    return el;
  }

  function buildRoomResultEl(room, index) {
    var el = document.createElement('div');
    el.className = 'immersive-search__result';
    el.setAttribute('role', 'option');
    el.setAttribute('id', 'immersive-search-result-' + index);
    el.setAttribute('aria-selected', 'false');

    // Add room icon
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon('room');
    var iconEl = iconWrapper.firstChild;
    if (iconEl) {
      el.appendChild(iconEl);
    }

    var info = document.createElement('div');
    info.className = 'immersive-search__result-info';

    var title = document.createElement('span');
    title.className = 'immersive-search__result-title';
    title.textContent = room.label;
    info.appendChild(title);

    var meta = document.createElement('span');
    meta.className = 'immersive-search__result-meta';
    meta.textContent = 'Room';
    info.appendChild(meta);

    el.appendChild(info);

    el.addEventListener('click', function () {
      selectResult(index);
    });

    return el;
  }

  function selectResult(index) {
    var item = _searchResults[index];
    if (!item) return;
    closeDropdown();
    input.value = '';

    if (item.type === 'product') {
      if (typeof openProductPanel === 'function') openProductPanel(item.data.handle);
    } else if (item.type === 'collection') {
      if (typeof openCollectionPanel === 'function') openCollectionPanel(item.data.handle);
    } else if (item.type === 'room') {
      if (typeof goToRoom === 'function') goToRoom(item.data.roomKey);
    }
  }

  function navigateResults(direction) {
    if (!_searchResults.length) return;
    var prev = _searchActiveIndex;
    if (direction === 'down') {
      _searchActiveIndex = Math.min(_searchActiveIndex + 1, _searchResults.length - 1);
    } else {
      _searchActiveIndex = Math.max(_searchActiveIndex - 1, 0);
    }
    // Update aria-selected
    var allResults = dropdown.querySelectorAll('[role="option"]');
    allResults.forEach(function (el, i) {
      el.setAttribute('aria-selected', i === _searchActiveIndex ? 'true' : 'false');
    });
    var activeId = 'immersive-search-result-' + _searchActiveIndex;
    input.setAttribute('aria-activedescendant', activeId);
  }

  function doSearch(term) {
    if (!term || term.length < 2) {
      closeDropdown();
      return;
    }

    var roomMatches = fuzzyMatchRooms(term);

    // Cancel previous request
    if (_searchAbortController) {
      try {
        _searchAbortController.abort();
      } catch (e) {}
    }

    var timeoutId = setTimeout(function () {
      // Show unavailable after 3s
      dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }, 3000);

    var url =
      '/search/suggest?q=' + encodeURIComponent(term) + '&resources[type]=product,collection&resources[limit]=5';

    fetch(url, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(function (data) {
        var resources = (data.resources && data.resources.results) || {};
        renderResults(
          {
            products: resources.products || [],
            collections: resources.collections || [],
          },
          roomMatches,
        );
      })
      .catch(function () {
        clearTimeout(timeoutId);
        // Show room results only if API fails
        if (roomMatches.length) {
          renderResults({ products: [], collections: [] }, roomMatches);
        } else {
          dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
          dropdown.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
      });
  }

  // Input handler with debounce
  input.addEventListener('input', function () {
    clearTimeout(_searchDebounceTimer);
    var term = input.value.trim();
    _searchDebounceTimer = setTimeout(function () {
      doSearch(term);
    }, 200);
  });

  // Keyboard navigation
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResults('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults('up');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (_searchActiveIndex >= 0) {
        selectResult(_searchActiveIndex);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  // Cmd/Ctrl+K global shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
  });
}

// ============================================================
// ImmersiveBottomNav — floating bottom navigation bar
// ============================================================

function initImmersiveBottomNav() {
  var fab = document.querySelector('[data-immersive-fab]');
  if (!fab) return;

  var fabTrigger = fab.querySelector('[data-fab-trigger]');
  var fabActions = fab.querySelector('[data-fab-actions]');
  var wishlistBtn = fab.querySelector('[data-bottom-nav-wishlist]');
  var cartBtn = fab.querySelector('[data-bottom-nav-cart]');
  var twoDBtn = fab.querySelector('[data-bottom-nav-2d]');
  var wishlistBadge = fab.querySelector('[data-bottom-nav-wishlist-badge]');
  var cartBadge = fab.querySelector('[data-bottom-nav-cart-badge]');

  var isOpen = false;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var fabStartX = 0;
  var fabStartY = 0;
  var hasMoved = false;

  // Load saved position from localStorage
  function loadFabPosition() {
    try {
      var saved = localStorage.getItem('immersive_fab_position');
      if (saved) {
        var pos = JSON.parse(saved);
        fab.style.top = pos.top;
        fab.style.right = pos.right;
        fab.style.bottom = pos.bottom;
        fab.style.left = pos.left;
        fab.style.transform = pos.transform || 'none';
      }
    } catch (e) {
      console.warn('Could not load FAB position:', e);
    }
  }

  // Save position to localStorage
  function saveFabPosition() {
    try {
      var pos = {
        top: fab.style.top,
        right: fab.style.right,
        bottom: fab.style.bottom,
        left: fab.style.left,
        transform: fab.style.transform,
      };
      localStorage.setItem('immersive_fab_position', JSON.stringify(pos));
    } catch (e) {
      console.warn('Could not save FAB position:', e);
    }
  }

  // Snap to edge helper
  function snapToEdge(x, y) {
    var rect = fab.getBoundingClientRect();
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var fabWidth = rect.width;
    var fabHeight = rect.height;
    var snapThreshold = 40; // pixels from edge to snap

    var centerX = x + fabWidth / 2;
    var centerY = y + fabHeight / 2;

    // Determine which edge is closest
    var distToLeft = centerX;
    var distToRight = viewportWidth - centerX;
    var distToTop = centerY;
    var distToBottom = viewportHeight - centerY;

    var minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    // Snap to closest edge if within threshold
    if (minDist < snapThreshold || minDist === distToLeft || minDist === distToRight) {
      if (distToLeft < distToRight) {
        // Snap to left
        fab.style.left = '1.25rem';
        fab.style.right = 'auto';
      } else {
        // Snap to right
        fab.style.right = '1.25rem';
        fab.style.left = 'auto';
      }
      fab.style.top = Math.max(72, Math.min(y, viewportHeight - fabHeight - 20)) + 'px';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    } else {
      // Free position
      fab.style.left = Math.max(20, Math.min(x, viewportWidth - fabWidth - 20)) + 'px';
      fab.style.top = Math.max(72, Math.min(y, viewportHeight - fabHeight - 20)) + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    }
  }

  // Mouse/Touch drag handlers
  function onDragStart(e) {
    if (isOpen) return; // Don't drag when menu is open

    var touch = e.type === 'touchstart' ? e.touches[0] : e;
    isDragging = true;
    hasMoved = false;
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;

    var rect = fab.getBoundingClientRect();
    fabStartX = rect.left;
    fabStartY = rect.top;

    // Don't prevent default here - let click events through
    // Only prevent default in onDragMove if actually dragging
  }

  function onDragMove(e) {
    if (!isDragging) return;

    var touch = e.type === 'touchmove' ? e.touches[0] : e;
    var deltaX = touch.clientX - dragStartX;
    var deltaY = touch.clientY - dragStartY;

    // Mark as moved if dragged more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;

      // Only apply drag styling and prevent default when actually dragging
      fab.style.transition = 'none';
      fab.style.cursor = 'grabbing';
      e.preventDefault();
    }

    if (hasMoved) {
      var newX = fabStartX + deltaX;
      var newY = fabStartY + deltaY;

      fab.style.left = newX + 'px';
      fab.style.top = newY + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    }
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    fab.style.transition = '';
    fab.style.cursor = '';

    if (hasMoved) {
      var rect = fab.getBoundingClientRect();
      snapToEdge(rect.left, rect.top);
      saveFabPosition();
      e.preventDefault(); // Only prevent default if we actually dragged
    }
  }

  // Attach drag listeners to trigger button
  if (fabTrigger) {
    fabTrigger.addEventListener('mousedown', onDragStart);
    fabTrigger.addEventListener('touchstart', onDragStart, { passive: false });
  }

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);

  // Load saved position on init
  loadFabPosition();

  // Toggle FAB menu (only if not dragged)
  if (fabTrigger && fabActions) {
    fabTrigger.addEventListener('click', function (e) {
      if (hasMoved) {
        hasMoved = false;
        return; // Don't toggle if we just finished dragging
      }

      isOpen = !isOpen;
      fabTrigger.setAttribute('aria-expanded', isOpen);
      fabActions.hidden = !isOpen;

      // Animate actions in/out
      if (isOpen) {
        var actions = fabActions.querySelectorAll('.immersive-fab__action');
        actions.forEach(function (action, index) {
          action.style.animation =
            'fab-action-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ' + index * 0.05 + 's forwards';
        });
      }
    });
  }

  // Close FAB when clicking outside
  document.addEventListener('click', function (e) {
    if (isOpen && !fab.contains(e.target)) {
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    }
  });

  // Close FAB on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
      fabTrigger.focus();
    }
  });

  // Wire Wishlist button → directly open wishlist panel
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function () {
      exitGuidedMode();
      // Directly open the wishlist panel
      var wishlistPanel = document.querySelector('[data-wishlist-panel]');
      if (wishlistPanel) {
        openWishlistPanel();
      }
      // Close FAB
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    });
  }

  // Wire Cart button → open immersive cart modal
  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      exitGuidedMode();
      // Open immersive cart modal
      openImmersiveCart();
      // Close FAB
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    });
  }

  // 2D button mirrors data-mode-switch-2d
  if (twoDBtn) {
    twoDBtn.addEventListener('click', function (e) {
      var modeSwitchBtn = document.querySelector('[data-mode-switch-2d]');
      if (modeSwitchBtn) {
        e.preventDefault();
        modeSwitchBtn.click();
      }
      // fallback: href="/" on the <a> handles navigation
    });
  }

  // Badge sync — called from wishlist/cart update paths
  window.updateBottomNavBadges = function (wishlistCount, cartCount) {
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
      wishlistBadge.hidden = wishlistCount === 0;
    }
    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.hidden = cartCount === 0;
    }

    // Also update header cart badge
    var headerCartBadge = document.querySelector('[data-header-cart-badge]');
    if (headerCartBadge) {
      headerCartBadge.textContent = cartCount;
      headerCartBadge.hidden = cartCount === 0;
    }
  };

  // Wire header cart button
  var headerCartBtn = document.querySelector('[data-header-cart]');
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', function () {
      exitGuidedMode();
      // Open immersive cart modal
      openImmersiveCart();
    });
  }

  // Hide FAB when glass-panel opens; show when it closes
  var glassPanel = document.getElementById('glass-panel');
  if (glassPanel) {
    var panelObserver = new MutationObserver(function () {
      var isOpen = !glassPanel.hidden && !glassPanel.classList.contains('hidden');
      fab.style.display = isOpen ? 'none' : 'flex';
    });
    panelObserver.observe(glassPanel, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }
}

// ============================================================
// ImmersiveGestures — swipe navigation for rooms and panels
// ============================================================

var _gestureLastRoomTransition = 0;
var _gestureCooldown = 600; // ms

function classifyGesture(deltaX, deltaY) {
  var absDx = Math.abs(deltaX);
  var absDy = Math.abs(deltaY);
  if (absDx < 60 && absDy < 60) return 'none';
  if (absDy === 0) return absDx >= 60 ? 'horizontal' : 'none';
  var ratio = absDx / absDy;
  if (ratio > 2.5) return 'horizontal';
  if (absDy >= 60) return deltaY > 0 ? 'vertical-down' : 'vertical-up';
  return 'none';
}

function initImmersiveGestures() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvasWrapper = document.getElementById('immersive-canvas') || document.querySelector('.immersive-store');
  if (!canvasWrapper) return;

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;

  canvasWrapper.addEventListener(
    'touchstart',
    function (e) {
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true },
  );

  canvasWrapper.addEventListener(
    'touchmove',
    function () {
      // passive — no action needed, just prevent jank
    },
    { passive: true },
  );

  canvasWrapper.addEventListener(
    'touchend',
    function (e) {
      // Ignore gestures starting on interactive elements
      var target = e.target;
      if (
        target &&
        target.closest('button, a, input, select, textarea, [role="radio"], [role="option"], [data-immersive-search]')
      )
        return;

      var touch = e.changedTouches[0];
      var deltaX = touch.clientX - touchStartX;
      var deltaY = touch.clientY - touchStartY;
      var elapsed = Date.now() - touchStartTime;

      // Ignore slow drags (> 600ms — likely a scroll, not a swipe)
      if (elapsed > 600) return;

      var gesture = classifyGesture(deltaX, deltaY);
      if (gesture === 'none') return;

      var glassPanel = document.getElementById('glass-panel');
      var panelOpen = glassPanel && !glassPanel.hidden && !glassPanel.classList.contains('hidden');

      if (gesture === 'horizontal') {
        // Cooldown guard
        var now = Date.now();
        if (now - _gestureLastRoomTransition < _gestureCooldown) return;
        _gestureLastRoomTransition = now;

        if (panelOpen) return; // Don't change rooms while panel is open

        // Find current room and navigate
        var currentRoom = (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'storefront';
        var idx = SWIPE_ROOM_SEQUENCE.indexOf(currentRoom);
        if (idx === -1) idx = 0;

        var nextIdx;
        if (deltaX < 0) {
          // Swipe left → next room
          nextIdx = (idx + 1) % SWIPE_ROOM_SEQUENCE.length;
        } else {
          // Swipe right → previous room
          nextIdx = (idx - 1 + SWIPE_ROOM_SEQUENCE.length) % SWIPE_ROOM_SEQUENCE.length;
        }

        if (typeof goToRoom === 'function') {
          goToRoom(SWIPE_ROOM_SEQUENCE[nextIdx], reduceMotion ? 'instant' : undefined);
        }
      } else if (gesture === 'vertical-down' && panelOpen) {
        // Swipe down → close panel
        var closeBtn = glassPanel && glassPanel.querySelector('.immersive-store__panel-close');
        if (closeBtn) closeBtn.click();
      } else if (gesture === 'vertical-down' && !panelOpen) {
        // Swipe down + panel closed → scroll-to-reveal editorial
        _esrOnSwipeDown(deltaX, deltaY);
      } else if (gesture === 'vertical-up' && !panelOpen) {
        // Swipe up → open wishlist
        var wishlistOpenBtn = document.querySelector('[data-wishlist-open]');
        if (wishlistOpenBtn) wishlistOpenBtn.click();
      }
    },
    { passive: true },
  );
}

// ============================================================
// ImmersiveFilters — smart filters inside collection panels
// ============================================================

var FILTER_ALLOWED_PARAMS = ['filter.p.m.custom.color[]', 'filter.v.price.gte', 'filter.v.price.lte', 'sort_by'];

function saveFilters(roomKey, state) {
  try {
    sessionStorage.setItem('immersive_filters_' + roomKey, JSON.stringify(state));
  } catch (e) {}
}

function loadFilters(roomKey) {
  try {
    var raw = sessionStorage.getItem('immersive_filters_' + roomKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function buildFilterUrl(baseUrl, state) {
  var url = new URL(baseUrl, window.location.origin);
  // Remove any existing filter params
  FILTER_ALLOWED_PARAMS.forEach(function (key) {
    url.searchParams.delete(key);
  });
  // Also remove array-style color params
  var toDelete = [];
  url.searchParams.forEach(function (val, key) {
    if (key.indexOf('filter.') === 0) toDelete.push(key);
  });
  toDelete.forEach(function (k) {
    url.searchParams.delete(k);
  });

  // Apply new state — only allowlisted keys
  if (state.colors && state.colors.length) {
    state.colors.forEach(function (c) {
      url.searchParams.append('filter.p.m.custom.color[]', c);
    });
  }
  if (state.priceMin !== null && state.priceMin !== undefined && state.priceMin !== '') {
    url.searchParams.set('filter.v.price.gte', state.priceMin);
  }
  if (state.priceMax !== null && state.priceMax !== undefined && state.priceMax !== '') {
    url.searchParams.set('filter.v.price.lte', state.priceMax);
  }
  if (state.sortBy && state.sortBy !== 'manual') {
    url.searchParams.set('sort_by', state.sortBy);
  }
  return url.pathname + url.search;
}

function initImmersiveFilters(panelEl, collectionHandle, roomKey, sectionId) {
  if (!panelEl || !collectionHandle) return;

  var contentEl = panelEl.querySelector('.immersive-store__panel-content');
  if (!contentEl) return;

  var currentState = loadFilters(roomKey) || {
    colors: [],
    priceMin: null,
    priceMax: null,
    designers: [],
    sortBy: 'manual',
  };

  var baseUrl = '/collections/' + collectionHandle + '?section_id=' + (sectionId || 'immersive-product-grid');

  function applyFilters(state) {
    currentState = state;
    saveFilters(roomKey, state);

    // Update filter chips
    var chipsContainer = contentEl.querySelector('[data-filter-chips-container]');
    if (chipsContainer) {
      var hasActiveFilters =
        state.colors.length > 0 ||
        state.priceMin !== null ||
        state.priceMax !== null ||
        state.designers.length > 0 ||
        (state.sortBy && state.sortBy !== 'manual');

      if (hasActiveFilters) {
        chipsContainer.innerHTML = renderActiveFilterChips(state);
        chipsContainer.hidden = false;

        // Wire up chip removal handlers
        chipsContainer.querySelectorAll('[data-remove-filter]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var filterKey = btn.getAttribute('data-remove-filter');
            removeFilterChip(filterKey, currentState, applyFilters);
          });
        });

        // Wire up "Clear All" button
        var clearAllBtn = chipsContainer.querySelector('[data-clear-all-filters]');
        if (clearAllBtn) {
          clearAllBtn.addEventListener('click', function () {
            clearFilters();
          });
        }
      } else {
        chipsContainer.hidden = true;
        chipsContainer.innerHTML = '';
      }
    }

    var url = buildFilterUrl(baseUrl, state);
    fetchWithCache(url)
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var newGrid = tmp.querySelector('.immersive-product-grid-wrapper');
        var existingGrid = contentEl.querySelector('.immersive-product-grid-wrapper');
        if (newGrid && existingGrid) {
          existingGrid.replaceWith(newGrid);
        } else if (newGrid) {
          contentEl.appendChild(newGrid);
        }
        // Re-scan for limited-time indicators on new cards
        if (typeof scanLimitedTimeCards === 'function') scanLimitedTimeCards(contentEl);
      })
      .catch(function () {
        var errorMsg = panelEl.getAttribute('data-msg-load-collection-error') || 'Unable to load collection.';
        showFeedback(errorMsg, 'error');
      });
  }

  function clearFilters() {
    currentState = { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    saveFilters(roomKey, currentState);

    // Hide filter chips
    var chipsContainer = contentEl.querySelector('[data-filter-chips-container]');
    if (chipsContainer) {
      chipsContainer.hidden = true;
      chipsContainer.innerHTML = '';
    }

    applyFilters(currentState);
    // Reset toolbar UI
    var toolbar = contentEl.querySelector('.immersive-filters');
    if (toolbar) {
      toolbar.querySelectorAll('.immersive-filters__color-swatch').forEach(function (s) {
        s.setAttribute('aria-pressed', 'false');
        s.classList.remove('is-active');
      });
      toolbar.querySelectorAll('.immersive-filters__designer-chip').forEach(function (c) {
        c.setAttribute('aria-pressed', 'false');
        c.classList.remove('is-active');
      });
      var minInput = toolbar.querySelector('[data-filter-price-min]');
      var maxInput = toolbar.querySelector('[data-filter-price-max]');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      var sortSelect = toolbar.querySelector('[data-filter-sort]');
      if (sortSelect) sortSelect.value = 'manual';
    }
  }

  function buildToolbar() {
    // Extract colors and designers from rendered product cards
    var colors = [];
    var designers = [];
    contentEl.querySelectorAll('[data-product-handle]').forEach(function (card) {
      var color = card.getAttribute('data-product-color');
      var vendor = card.getAttribute('data-product-vendor');
      if (color && colors.indexOf(color) === -1) colors.push(color);
      if (vendor && designers.indexOf(vendor) === -1) designers.push(vendor);
    });

    var toolbar = document.createElement('div');
    toolbar.className = 'immersive-filters';
    toolbar.setAttribute('data-immersive-filters', '');

    // Sort
    var sortRow = document.createElement('div');
    sortRow.className = 'immersive-filters__row';
    var sortSelect = document.createElement('select');
    sortSelect.className = 'immersive-filters__sort';
    sortSelect.setAttribute('data-filter-sort', '');
    sortSelect.setAttribute('aria-label', 'Sort by');
    [
      { value: 'manual', label: 'Featured' },
      { value: 'price-ascending', label: 'Price: Low to High' },
      { value: 'price-descending', label: 'Price: High to Low' },
      { value: 'title-ascending', label: 'A–Z' },
    ].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (currentState.sortBy === opt.value) o.selected = true;
      sortSelect.appendChild(o);
    });
    sortSelect.addEventListener('change', function () {
      currentState.sortBy = sortSelect.value;
      applyFilters(currentState);
    });
    sortRow.appendChild(sortSelect);

    // Price range
    var priceRow = document.createElement('div');
    priceRow.className = 'immersive-filters__row immersive-filters__price-row';
    var minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'immersive-filters__price-input';
    minInput.setAttribute('data-filter-price-min', '');
    minInput.placeholder = 'Min PKR';
    minInput.value = currentState.priceMin || '';
    var maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'immersive-filters__price-input';
    maxInput.setAttribute('data-filter-price-max', '');
    maxInput.placeholder = 'Max PKR';
    maxInput.value = currentState.priceMax || '';
    var priceApply = document.createElement('button');
    priceApply.type = 'button';
    priceApply.className = 'immersive-filters__price-apply';
    priceApply.textContent = 'Apply';
    priceApply.addEventListener('click', function () {
      currentState.priceMin = minInput.value ? Number(minInput.value) : null;
      currentState.priceMax = maxInput.value ? Number(maxInput.value) : null;
      applyFilters(currentState);
    });
    priceRow.appendChild(minInput);
    priceRow.appendChild(maxInput);
    priceRow.appendChild(priceApply);

    // Colors
    if (colors.length) {
      var colorRow = document.createElement('div');
      colorRow.className = 'immersive-filters__row immersive-filters__color-row';
      colors.forEach(function (color) {
        var swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'immersive-filters__color-swatch';
        swatch.setAttribute('aria-pressed', currentState.colors.indexOf(color) !== -1 ? 'true' : 'false');
        swatch.setAttribute('aria-label', color);
        swatch.setAttribute('title', color);
        swatch.style.background = color.toLowerCase();
        if (currentState.colors.indexOf(color) !== -1) swatch.classList.add('is-active');
        swatch.addEventListener('click', function () {
          var idx = currentState.colors.indexOf(color);
          if (idx === -1) {
            currentState.colors.push(color);
            swatch.setAttribute('aria-pressed', 'true');
            swatch.classList.add('is-active');
          } else {
            currentState.colors.splice(idx, 1);
            swatch.setAttribute('aria-pressed', 'false');
            swatch.classList.remove('is-active');
          }
          applyFilters(currentState);
        });
        colorRow.appendChild(swatch);
      });
      toolbar.appendChild(colorRow);
    }

    // Designers
    if (designers.length) {
      var designerRow = document.createElement('div');
      designerRow.className = 'immersive-filters__row immersive-filters__designer-row';
      designers.forEach(function (vendor) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'immersive-filters__designer-chip immersive-chip';
        chip.setAttribute('aria-pressed', currentState.designers.indexOf(vendor) !== -1 ? 'true' : 'false');
        chip.textContent = vendor;
        if (currentState.designers.indexOf(vendor) !== -1) chip.classList.add('is-active');
        chip.addEventListener('click', function () {
          var idx = currentState.designers.indexOf(vendor);
          if (idx === -1) {
            currentState.designers.push(vendor);
            chip.setAttribute('aria-pressed', 'true');
            chip.classList.add('is-active');
          } else {
            currentState.designers.splice(idx, 1);
            chip.setAttribute('aria-pressed', 'false');
            chip.classList.remove('is-active');
          }
          applyFilters(currentState);
        });
        designerRow.appendChild(chip);
      });
      toolbar.appendChild(designerRow);
    }

    toolbar.appendChild(sortRow);
    toolbar.appendChild(priceRow);

    // Clear all
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'immersive-filters__clear';
    clearBtn.textContent = 'Clear all';
    clearBtn.addEventListener('click', clearFilters);
    toolbar.appendChild(clearBtn);

    return toolbar;
  }

  // Inject toolbar before the product grid
  var existingToolbar = contentEl.querySelector('[data-immersive-filters]');
  if (!existingToolbar) {
    var grid = contentEl.querySelector('.immersive-product-grid-wrapper');
    if (grid) {
      var toolbar = buildToolbar();
      contentEl.insertBefore(toolbar, grid);
    }
  }

  // Apply saved filters on init if any are active
  var hasSavedFilters =
    currentState.colors.length ||
    currentState.priceMin ||
    currentState.priceMax ||
    currentState.designers.length ||
    (currentState.sortBy && currentState.sortBy !== 'manual');
  if (hasSavedFilters) {
    applyFilters(currentState);
  }
}

// ============================================================
// ImmersiveNextActions — contextual action chips after key events
// ============================================================

var _nextActionsTimer = null;
var _nextActionsBar = null;

function initImmersiveNextActions() {
  // Create singleton bar element
  _nextActionsBar = document.createElement('div');
  _nextActionsBar.className = 'immersive-next-actions';
  _nextActionsBar.setAttribute('role', 'status');
  _nextActionsBar.setAttribute('aria-live', 'polite');
  _nextActionsBar.hidden = true;
  document.body.appendChild(_nextActionsBar);
}

function showNextActions(chips) {
  if (!_nextActionsBar) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear existing
  clearTimeout(_nextActionsTimer);
  _nextActionsBar.innerHTML = '';

  // Build chips
  var inner = document.createElement('div');
  inner.className = 'immersive-next-actions__inner';

  chips.forEach(function (chip) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'immersive-next-actions__chip immersive-chip';
    btn.textContent = chip.label;
    btn.addEventListener('click', function () {
      dismissNextActions();
      if (typeof chip.action === 'function') chip.action();
    });
    inner.appendChild(btn);
  });

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-next-actions__close';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.innerHTML =
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', dismissNextActions);
  inner.appendChild(closeBtn);

  _nextActionsBar.appendChild(inner);
  _nextActionsBar.hidden = false;
  if (!reduceMotion) _nextActionsBar.classList.add('is-visible');

  // Auto-dismiss after 6s
  _nextActionsTimer = setTimeout(dismissNextActions, 6000);
}

function dismissNextActions() {
  clearTimeout(_nextActionsTimer);
  if (_nextActionsBar) {
    _nextActionsBar.classList.remove('is-visible');
    _nextActionsBar.hidden = true;
    _nextActionsBar.innerHTML = '';
  }
}

function showAfterProductView(product) {
  if (!product) return;
  showNextActions([
    {
      label: 'Continue exploring ' + (product.roomLabel || 'the store'),
      action: function () {
        if (product.roomKey && typeof goToRoom === 'function') goToRoom(product.roomKey);
      },
    },
    {
      label: 'See more from ' + (product.vendor || 'this designer'),
      action: function () {
        if (product.collectionHandle && typeof openCollectionPanel === 'function') {
          openCollectionPanel(product.collectionHandle);
        }
      },
    },
  ]);
}

function showAfterAddToCart(product) {
  if (!product) return;
  showNextActions([
    {
      label: 'Complete the look',
      action: function () {
        if (product.handle && typeof openProductPanel === 'function') {
          openProductPanel(product.handle);
        }
      },
    },
    {
      label: 'View cart',
      action: function () {
        var cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) cartToggle.click();
      },
    },
  ]);
}

function showAfterRoomComplete(roomKey) {
  showNextActions([
    {
      label: "Discover what's next",
      action: function () {
        if (typeof evaluateRoomRecommendation === 'function') evaluateRoomRecommendation();
      },
    },
  ]);
}

// ============================================================
// ImmersiveRoomRecommender — rule-based room suggestions
// ============================================================

var _browsingContext = {
  visitedRooms: [],
  savedProducts: [],
  viewedCollections: [],
  cartCollections: [],
};

var BRIDAL_KEYWORDS = ['bridal', 'bride', 'wedding', 'mehndi', 'nikah', 'walima', 'barat'];
var DESIGNER_HOUSE_COLLECTIONS = ['suffuse', 'soraya', 'saad-bin-shahzad'];

function getRecommendation(context) {
  // Override hook for ML-driven scoring
  if (typeof window.ImmersiveRecommenderOverride === 'function') {
    try {
      var override = window.ImmersiveRecommenderOverride(context);
      if (override && override.roomKey) return override;
    } catch (e) {}
  }

  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  // Rule 1: wishlist/cart contains bridal/mehndi → occasions
  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  // Rule 2: wishlist contains designer-house products → designer_houses
  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  // Rule 3: visited designer_houses but not occasions
  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  // Rule 4: visited occasions but not featured_collections
  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  // Default fallback
  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

function evaluateRoomRecommendation() {
  if (!_browsingContext.visitedRooms.length) return;
  var rec = getRecommendation(_browsingContext);
  if (!rec) return;

  // Check if already dismissed this session
  try {
    if (sessionStorage.getItem('immersive_rec_dismissed_' + rec.roomKey)) return;
  } catch (e) {}

  showRoomRecommendation(rec);
}

function showRoomRecommendation(rec) {
  // Remove existing chip
  var existing = document.querySelector('.immersive-rec-chip');
  if (existing) existing.remove();

  var chip = document.createElement('div');
  chip.className = 'immersive-rec-chip';
  chip.setAttribute('role', 'complementary');
  chip.setAttribute('aria-label', rec.reason + ': ' + rec.label);

  var reason = document.createElement('span');
  reason.className = 'immersive-rec-chip__reason';
  reason.textContent = rec.reason;

  var label = document.createElement('button');
  label.type = 'button';
  label.className = 'immersive-rec-chip__label';
  label.textContent = rec.label + ' →';
  label.addEventListener('click', function () {
    chip.remove();
    if (typeof goToRoom === 'function') goToRoom(rec.roomKey);
  });

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'immersive-rec-chip__dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss suggestion');
  dismiss.innerHTML = '×';
  dismiss.addEventListener('click', function () {
    try {
      sessionStorage.setItem('immersive_rec_dismissed_' + rec.roomKey, '1');
    } catch (e) {}
    chip.remove();
  });

  chip.appendChild(reason);
  chip.appendChild(label);
  chip.appendChild(dismiss);
  document.body.appendChild(chip);

  // Auto-dismiss after 10s
  setTimeout(function () {
    if (chip.parentNode) chip.remove();
  }, 10000);
}

function initImmersiveRoomRecommender() {
  // Sync browsing context with wishlist
  if (typeof _wishlistItems !== 'undefined') {
    _browsingContext.savedProducts = _wishlistItems.map(function (item) {
      return item.handle || '';
    });
  }
}

// ============================================================
// ImmersiveQuickAdd — quick add to cart from product cards
// ============================================================

var _quickAddModal = null;
var _quickAddTrigger = null;

function initImmersiveQuickAdd() {
  // Event delegation on document for all [data-quick-add] buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var handle = btn.getAttribute('data-product-handle');
    if (handle) openQuickAdd(handle, btn);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _quickAddModal && !_quickAddModal.hidden) {
      closeQuickAdd();
    }
  });
}

function openQuickAdd(handle, triggerEl) {
  _quickAddTrigger = triggerEl || null;
  var cacheKey = 'quickadd_' + handle;
  var loadProductUrl = '/products/' + handle + '.js';

  // Use contentCache if available
  var cached = contentCache && contentCache[cacheKey];
  if (cached) {
    renderQuickAddModal(cached, triggerEl);
    return;
  }

  fetch(loadProductUrl, {
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Product fetch failed');
      return res.json();
    })
    .then(function (product) {
      if (contentCache) contentCache[cacheKey] = product;
      renderQuickAddModal(product, triggerEl);
    })
    .catch(function () {
      var glassPanel = document.getElementById('glass-panel');
      var errorMsg =
        (glassPanel && glassPanel.getAttribute('data-msg-load-product-error')) || 'Unable to load product.';
      showFeedback(errorMsg, 'error');
    });
}

function renderQuickAddModal(product, triggerEl) {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Singleton — remove existing modal
  if (_quickAddModal) _quickAddModal.remove();

  var modal = document.createElement('div');
  modal.className = 'immersive-quick-add-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'quick-add-modal-title');
  if (reduceMotion) modal.classList.add('no-animation');

  var inner = document.createElement('div');
  inner.className = 'immersive-quick-add-modal__inner';

  // Header
  var header = document.createElement('div');
  header.className = 'immersive-quick-add-modal__header';
  var title = document.createElement('h3');
  title.id = 'quick-add-modal-title';
  title.className = 'immersive-quick-add-modal__title';
  title.textContent = product.title;
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-quick-add-modal__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML =
    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', closeQuickAdd);
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Price
  var price = document.createElement('div');
  price.className = 'immersive-quick-add-modal__price';
  price.setAttribute('data-quick-add-price', '');
  var firstVariant = product.variants && product.variants[0];
  price.textContent = firstVariant ? formatMoney(firstVariant.price) : '';

  // Variants (if more than one)
  var selectedVariantId = firstVariant ? firstVariant.id : null;
  var variantGroup = null;

  if (product.variants && product.variants.length > 1) {
    variantGroup = document.createElement('div');
    variantGroup.className = 'immersive-quick-add-modal__variants';
    variantGroup.setAttribute('role', 'radiogroup');
    variantGroup.setAttribute('aria-label', 'Select size');

    product.variants.forEach(function (variant, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'immersive-quick-add-modal__variant';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      btn.setAttribute('data-variant-id', variant.id);
      btn.setAttribute('data-variant-price', variant.price);
      btn.textContent = variant.title;
      if (!variant.available) {
        btn.disabled = true;
        btn.classList.add('is-unavailable');
      }
      if (i === 0) btn.classList.add('is-selected');

      btn.addEventListener('click', function () {
        if (!variant.available) return;
        selectedVariantId = variant.id;
        // Update aria-checked
        variantGroup.querySelectorAll('[role="radio"]').forEach(function (b) {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('is-selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('is-selected');
        // Update price
        var priceEl = modal.querySelector('[data-quick-add-price]');
        if (priceEl) priceEl.textContent = formatMoney(variant.price);
        // Update CTA
        var cta = modal.querySelector('[data-quick-add-cta]');
        if (cta) {
          cta.disabled = false;
          cta.textContent = 'Add to cart';
        }
      });

      variantGroup.appendChild(btn);
    });
  }

  // CTA
  var cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'immersive-quick-add-modal__cta';
  cta.setAttribute('data-quick-add-cta', '');
  var firstAvailable =
    product.variants &&
    product.variants.find(function (v) {
      return v.available;
    });
  if (!firstAvailable) {
    cta.disabled = true;
    cta.textContent = 'Sold out';
  } else {
    cta.textContent = 'Add to cart';
    selectedVariantId = firstAvailable.id;
  }

  cta.addEventListener('click', function () {
    if (!selectedVariantId) return;
    cta.disabled = true;
    cta.textContent = 'Adding\u2026';
    addToCartQuickAdd(selectedVariantId, 1, product, cta);
  });

  inner.appendChild(header);
  inner.appendChild(price);
  if (variantGroup) inner.appendChild(variantGroup);
  inner.appendChild(cta);
  modal.appendChild(inner);
  document.body.appendChild(modal);
  _quickAddModal = modal;

  // Focus trap
  requestAnimationFrame(function () {
    closeBtn.focus();
  });

  // Trap Tab/Shift+Tab
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = modal.querySelectorAll('button:not(:disabled), [tabindex="0"]');
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function addToCartQuickAdd(variantId, quantity, product, ctaBtn) {
  var glassPanel = document.getElementById('glass-panel');
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify({ id: parseInt(variantId, 10), quantity: quantity || 1 }),
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Cart add failed');
      return res.json();
    })
    .then(function () {
      closeQuickAdd();
      var successMsg = (glassPanel && glassPanel.getAttribute('data-msg-added-to-cart')) || 'Added to cart!';
      showFeedback(successMsg, 'success');
      // Update cart badge
      fetch('/cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json();
        })
        .then(function (cart) {
          var badge = document.querySelector('[data-cart-count]');
          if (badge) badge.textContent = cart.item_count;
          if (typeof window.updateBottomNavBadges === 'function') {
            window.updateBottomNavBadges(null, cart.item_count);
          }
        })
        .catch(function () {});
      // Show next actions
      if (typeof showAfterAddToCart === 'function') {
        showAfterAddToCart({ handle: product.handle, vendor: product.vendor });
      }
    })
    .catch(function () {
      if (ctaBtn) {
        ctaBtn.disabled = false;
        ctaBtn.textContent = 'Add to cart';
      }
      var errorMsg = (glassPanel && glassPanel.getAttribute('data-msg-error-add-to-cart')) || 'Unable to add to cart.';
      showFeedback(errorMsg, 'error');
    });
}

function closeQuickAdd() {
  if (_quickAddModal) {
    _quickAddModal.remove();
    _quickAddModal = null;
  }
  if (_quickAddTrigger) {
    try {
      _quickAddTrigger.focus();
    } catch (e) {}
    _quickAddTrigger = null;
  }
}

function formatMoney(cents) {
  if (!cents && cents !== 0) return '';
  return 'PKR ' + (cents / 100).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function trackRoomVisit(roomKey) {
  if (_browsingContext.visitedRooms.indexOf(roomKey) === -1) {
    _browsingContext.visitedRooms.push(roomKey);
  }
  evaluateRoomRecommendation();
  syncVisitedRooms();
}

// ============================================================
// ImmersiveLimitedTime — countdown timers, low-stock badges, flash sale
// ============================================================

var _limitedTimeIntervals = [];
var _lowStockThreshold = 5;

function computeCountdown(endTime) {
  var now = Date.now();
  var end = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();
  if (isNaN(end) || end <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  var diff = Math.floor((end - now) / 1000);
  var days = Math.floor(diff / 86400);
  var hours = Math.floor((diff % 86400) / 3600);
  var minutes = Math.floor((diff % 3600) / 60);
  var seconds = diff % 60;
  return { days: days, hours: hours, minutes: minutes, seconds: seconds, expired: false };
}

function renderCountdown(endTime, containerEl) {
  if (!containerEl) return;
  var reduceMotionLT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var endDate = new Date(endTime);
  if (isNaN(endDate.getTime())) return; // silently skip invalid dates

  function update() {
    var state = computeCountdown(endDate);
    if (state.expired) {
      containerEl.innerHTML = '';
      return;
    }
    var parts = [];
    if (state.days > 0) parts.push(state.days + 'd');
    parts.push(pad(state.hours) + 'h');
    parts.push(pad(state.minutes) + 'm');
    parts.push(pad(state.seconds) + 's');
    containerEl.textContent = parts.join(' ');
    if (!reduceMotionLT) containerEl.classList.add('is-ticking');
  }

  update();
  var intervalId = setInterval(update, 1000);
  _limitedTimeIntervals.push(intervalId);
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function renderLowStockBadge(quantity, containerEl) {
  if (!containerEl || quantity === null || quantity === undefined || isNaN(quantity)) return;
  if (quantity > _lowStockThreshold) return;
  var badge = document.createElement('span');
  badge.className = 'immersive-low-stock-badge immersive-badge';
  badge.textContent = 'Only ' + quantity + ' left';
  containerEl.appendChild(badge);
}

function scanLimitedTimeCards(scopeEl) {
  var scope = scopeEl || document;
  scope.querySelectorAll('[data-sale-end-date]').forEach(function (card) {
    var endDate = card.getAttribute('data-sale-end-date');
    var qty = parseInt(card.getAttribute('data-inventory-quantity'), 10);
    var urgency = card.querySelector('[data-urgency-container]');
    if (!urgency) return;
    urgency.innerHTML = '';
    if (endDate) {
      var countdownEl = document.createElement('span');
      countdownEl.className = 'immersive-countdown';
      urgency.appendChild(countdownEl);
      renderCountdown(endDate, countdownEl);
    }
    if (!isNaN(qty)) {
      renderLowStockBadge(qty, urgency);
    }
  });
}

function showFlashSaleAlert() {
  var banners = document.querySelectorAll('[data-flash-sale-banner]');
  banners.forEach(function (banner) {
    var dismissKey = 'immersive_flash_dismissed';
    try {
      if (sessionStorage.getItem(dismissKey)) return;
    } catch (e) {}

    banner.hidden = false;

    var endDate = banner.getAttribute('data-sale-end-date');
    var countdownEl = banner.querySelector('[data-flash-countdown]');
    if (endDate && countdownEl) renderCountdown(endDate, countdownEl);

    var dismissBtn = banner.querySelector('[data-flash-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.hidden = true;
        try {
          sessionStorage.setItem(dismissKey, '1');
        } catch (e) {}
      });
    }
  });
}

function clearLimitedTimeIntervals() {
  _limitedTimeIntervals.forEach(function (id) {
    clearInterval(id);
  });
  _limitedTimeIntervals = [];
}

function initImmersiveLimitedTime() {
  // Read threshold from section setting
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var threshold = parseInt(storeEl.getAttribute('data-low-stock-threshold'), 10);
    if (!isNaN(threshold)) _lowStockThreshold = threshold;
  }

  // Scan existing cards
  scanLimitedTimeCards();

  // Show flash sale banners
  showFlashSaleAlert();
}

// Guard against double-init (theme editor fires section events rapidly)
// ─────────────────────────────────────────────────────────────
// Keyboard Navigation for Hotspots - Accessibility Enhancement
// ─────────────────────────────────────────────────────────────

var _hotspotElements = [];
var _focusedHotspotIndex = -1;

/**
 * Initialize keyboard navigation for hotspots
 * Sets up Tab/Shift+Tab navigation and Enter activation
 */
function initHotspotKeyboardNav() {
  var canvas = document.getElementById('immersive-canvas');
  if (!canvas) return;

  // Set canvas as focusable application
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Immersive 3D store navigation. Use Tab to navigate hotspots, Enter to activate.');

  // Handle keyboard navigation
  canvas.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      focusNextHotspot(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Enter' && _focusedHotspotIndex >= 0) {
      e.preventDefault();
      var focusedHotspot = _hotspotElements[_focusedHotspotIndex];
      if (focusedHotspot) {
        focusedHotspot.click();
      }
    }
  });
}

/**
 * Update the list of hotspot elements after renderHotspots() is called
 */
function updateHotspotElements() {
  _hotspotElements = Array.from(document.querySelectorAll('[data-hotspot-btn]'));
  _focusedHotspotIndex = -1;
}

/**
 * Focus the next/previous hotspot in the sequence
 * @param {number} direction - 1 for forward, -1 for backward
 */
function focusNextHotspot(direction) {
  if (_hotspotElements.length === 0) return;

  _focusedHotspotIndex += direction;

  // Wrap around
  if (_focusedHotspotIndex >= _hotspotElements.length) {
    _focusedHotspotIndex = 0;
  } else if (_focusedHotspotIndex < 0) {
    _focusedHotspotIndex = _hotspotElements.length - 1;
  }

  var hotspot = _hotspotElements[_focusedHotspotIndex];
  if (hotspot) {
    hotspot.focus();
    var label = hotspot.getAttribute('aria-label') || 'Hotspot';
    announceHotspot(label);
  }
}

/**
 * Announce hotspot label to screen readers
 * @param {string} label - The hotspot label to announce
 */
function announceHotspot(label) {
  var announcer = document.getElementById('immersive-hotspot-announcer');
  if (announcer) {
    announcer.textContent = label;
  }
}

// ─────────────────────────────────────────────────────────────
// Active Filter Chips - Visual filter state indicators
// ─────────────────────────────────────────────────────────────

/**
 * Render active filter chips based on current filter state
 * @param {Object} filterState - Current filter state object
 * @returns {string} HTML string for filter chips
 */
function renderActiveFilterChips(filterState) {
  if (!filterState || Object.keys(filterState).length === 0) {
    return '';
  }

  var chips = [];
  var hasActiveFilters = false;

  // Color filters
  if (filterState.colors && filterState.colors.length > 0) {
    filterState.colors.forEach(function (color) {
      chips.push(
        '<div class="immersive-chip" data-filter-type="color" data-filter-value="' +
          color +
          '">' +
          color +
          '<button type="button" class="immersive-chip__remove" data-remove-filter="color:' +
          color +
          '" aria-label="Remove ' +
          color +
          ' filter">×</button></div>',
      );
      hasActiveFilters = true;
    });
  }

  // Price range filter
  if (filterState.priceMin || filterState.priceMax) {
    var priceLabel = '';
    if (filterState.priceMin && filterState.priceMax) {
      priceLabel = '$' + filterState.priceMin + ' - $' + filterState.priceMax;
    } else if (filterState.priceMin) {
      priceLabel = 'Over $' + filterState.priceMin;
    } else if (filterState.priceMax) {
      priceLabel = 'Under $' + filterState.priceMax;
    }

    if (priceLabel) {
      chips.push(
        '<div class="immersive-chip" data-filter-type="price">' +
          priceLabel +
          '<button type="button" class="immersive-chip__remove" data-remove-filter="price" aria-label="Remove price filter">×</button></div>',
      );
      hasActiveFilters = true;
    }
  }

  // Designer filters
  if (filterState.designers && filterState.designers.length > 0) {
    filterState.designers.forEach(function (designer) {
      chips.push(
        '<div class="immersive-chip" data-filter-type="designer" data-filter-value="' +
          designer +
          '">' +
          designer +
          '<button type="button" class="immersive-chip__remove" data-remove-filter="designer:' +
          designer +
          '" aria-label="Remove ' +
          designer +
          ' filter">×</button></div>',
      );
      hasActiveFilters = true;
    });
  }

  // Sort filter
  if (filterState.sort && filterState.sort !== 'manual') {
    var sortLabels = {
      'price-ascending': 'Price: Low to High',
      'price-descending': 'Price: High to Low',
      'title-ascending': 'A-Z',
      'title-descending': 'Z-A',
      'created-ascending': 'Oldest First',
      'created-descending': 'Newest First',
    };
    var sortLabel = sortLabels[filterState.sort] || filterState.sort;

    chips.push(
      '<div class="immersive-chip" data-filter-type="sort" data-filter-value="' +
        filterState.sort +
        '">Sort: ' +
        sortLabel +
        '<button type="button" class="immersive-chip__remove" data-remove-filter="sort" aria-label="Remove sort filter">×</button></div>',
    );
    hasActiveFilters = true;
  }

  if (!hasActiveFilters) {
    return '';
  }

  return (
    '<div class="immersive-active-filters">' +
    '<div class="immersive-active-filters__chips">' +
    chips.join('') +
    '</div>' +
    '<button type="button" class="immersive-active-filters__clear" data-clear-all-filters>' +
    'Clear All</button>' +
    '</div>'
  );
}

/**
 * Remove a specific filter chip and update the collection
 * @param {string} filterKey - The filter key to remove (e.g., "color:red", "price", "sort")
 * @param {Object} currentState - Current filter state
 * @param {Function} applyFiltersCallback - Callback to apply updated filters
 */
function removeFilterChip(filterKey, currentState, applyFiltersCallback) {
  if (!filterKey || !currentState || !applyFiltersCallback) return;

  var parts = filterKey.split(':');
  var filterType = parts[0];
  var filterValue = parts[1];

  switch (filterType) {
    case 'color':
      if (filterValue) {
        var colorIdx = currentState.colors.indexOf(filterValue);
        if (colorIdx !== -1) {
          currentState.colors.splice(colorIdx, 1);
        }
      }
      break;

    case 'price':
      currentState.priceMin = null;
      currentState.priceMax = null;
      break;

    case 'designer':
      if (filterValue) {
        var designerIdx = currentState.designers.indexOf(filterValue);
        if (designerIdx !== -1) {
          currentState.designers.splice(designerIdx, 1);
        }
      }
      break;

    case 'sort':
      currentState.sortBy = 'manual';
      break;

    default:
      console.warn('[Immersive] Unknown filter type:', filterType);
      return;
  }

  // Re-apply filters with updated state
  applyFiltersCallback(currentState);
}

var _immersiveInitBound = false;

function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  if (!document.getElementById('immersive-canvas')) return;
  _immersiveInitBound = true;

  // Tear down existing WebGL renderer if present (section was replaced in editor)
  if (renderer) {
    try {
      renderer.dispose();
    } catch (e) {}
    renderer = null;
    scene = null;
    camera = null;
    planeMesh = null;
    uniforms = null;
    currentRoomKey = null;
    transitioning = false;

    // Dispose all cached textures (LRU array)
    textureCache.forEach(function (entry) {
      try {
        if (entry.base) entry.base.dispose();
        if (entry.depth) entry.depth.dispose();
      } catch (e) {}
    });
    textureCache = [];

    contentCache = {};
  }

  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();
    initWishlist();
    bindCookieBanner();
    initTiltControlToggle(); // Tilt-control experiment (opt-in, mobile-only)
    initHotspotKeyboardNav(); // Keyboard navigation for hotspots
    initBackButton(); // Back button navigation history

    // UX Enhancement modules
    initImmersiveSearch();
    initImmersiveBottomNav();
    initImmersiveGestures();
    initEditorialGestureReveal();
    initEditorialBackToLounge();
    initProductCardTilt();
    initGuidedMode();
    initImmersiveNextActions();
    initImmersiveRoomRecommender();
    initImmersiveQuickAdd();
    initImmersiveLimitedTime();

    try {
      if (window.URLSearchParams) {
        var params = new URLSearchParams(window.location.search);
        var openProduct = params.get('open_product');
        var openCollection = params.get('open_collection');
        var openSearch = params.get('open_search');

        if (openProduct) {
          // Priority 1: product (existing behaviour)
          setTimeout(function () {
            openProductPanel(openProduct);
          }, 400);
        } else if (openCollection) {
          // Priority 2: collection
          setTimeout(function () {
            openCollectionPanel(openCollection);
          }, 400);
        } else if (openSearch) {
          // Priority 3: search
          setTimeout(function () {
            openSearchPanel(openSearch);
          }, 400);
        }
      }
    } catch (e) {}

    // Allow re-init after 500ms (covers rapid theme editor saves)
    setTimeout(function () {
      _immersiveInitBound = false;
    }, 500);
  });
}

/**
 * Idle-based initialization wrapper.
 * Defers immersive initialization to reduce main-thread load at initial paint.
 * Uses requestIdleCallback with a 1s timeout fallback, or setTimeout for unsupported browsers.
 */
function scheduleImmersiveInit() {
  if (typeof window === 'undefined') return;

  function run() {
    try {
      safeBindImmersiveInit();
    } catch (e) {
      console.error('[Immersive] Init failed:', e);
    }
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1000 });
  } else {
    setTimeout(run, 300);
  }
}

// Initial page load — defer to idle time for better initial paint performance
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleImmersiveInit);
} else {
  scheduleImmersiveInit();
}

// Theme editor: re-init when the canvas section is reloaded or selected
document.addEventListener('shopify:section:load', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false; // force re-init on explicit section reload
    safeBindImmersiveInit();
    // Re-init new modules on section reload
    initImmersiveSearch();
    initImmersiveBottomNav();
    initImmersiveLimitedTime();
  }
});

document.addEventListener('shopify:section:select', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    safeBindImmersiveInit();
  }
});

document.addEventListener('shopify:section:unload', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false;
  }
});

// ============================================================
// IMMERSIVE EDITORIAL ENHANCEMENTS
// ============================================================

// ── EditorialScrollReveal state ─────────────────────────────
var _esrCooldown = false;
var _esrWheelBound = false;

// ── EditorialHeroParallax state ─────────────────────────────
var _ehpScrollTarget = 0;
var _ehpScrollCurrent = 0;
var _ehpRafId = null;
var _ehpOverlay = null;
var _ehpHeroImg = null;

// ── ProductCardTilt state ───────────────────────────────────
var _pctRafPending = false;
var _pctActiveCard = null;
var _pctPendingNormX = 0;
var _pctPendingNormY = 0;

// ── VisitedRoomsIndicator ───────────────────────────────────
var VISITED_ROOMS_EXCLUDE = ['lounge', 'storefront'];

// ============================================================
// EditorialScrollReveal
// ============================================================

function _esrEaseOutParallax(durationMs, callback) {
  var startValue = typeof parallaxStrength !== 'undefined' ? parallaxStrength : 0;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var elapsed = ts - startTime;
    var t = Math.min(elapsed / durationMs, 1);
    if (typeof parallaxStrength !== 'undefined') {
      parallaxStrength = startValue * (1 - t);
    }
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (typeof parallaxStrength !== 'undefined') parallaxStrength = 0;
      if (typeof callback === 'function') callback();
    }
  }
  requestAnimationFrame(step);
}

function _esrTrigger() {
  if (!immersiveState || immersiveState.mode !== 'showroom') return;
  var editorialRooms = ['designer_houses', 'occasions', 'featured_collections'];
  if (editorialRooms.indexOf(immersiveState.currentRoom) === -1) return;

  var panel = document.getElementById('glass-panel');
  if (panel && (panel.classList.contains('is-active') || (!panel.hidden && !panel.classList.contains('hidden'))))
    return;

  if (_esrCooldown) return;

  _esrCooldown = true;
  setTimeout(function () {
    _esrCooldown = false;
  }, 700);

  var roomKey = immersiveState.currentRoom;
  var reduceMotionESR = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotionESR) {
    enterEditorialMode(roomKey, null);
  } else {
    _esrEaseOutParallax(300, function () {
      enterEditorialMode(roomKey, null);
    });
  }
}

function _esrOnWheel(event) {
  if (event.deltaY > 0) _esrTrigger();
}

function initEditorialGestureReveal() {
  if (_esrWheelBound) return;
  var canvasWrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!canvasWrapper) return;

  // Preserve native scroll behavior for the sticky immersive section.
  // Only touch swipe-down gestures can trigger editorial reveal now.
  _esrWheelBound = true;
}

// Called from ImmersiveGestures swipe-down path (panel not open)
function _esrOnSwipeDown(deltaX, deltaY) {
  var absDy = Math.abs(deltaY);
  var absDx = Math.abs(deltaX);
  if (absDy < 60) return;
  if (absDx > 0 && absDy / absDx <= 2.5) return;
  if (deltaY < 0) return; // must be downward (positive deltaY)
  _esrTrigger();
}

// ============================================================
// EditorialBackToLounge
// ============================================================

function updateBackToLoungeVisibility(roomKey) {
  var btn = document.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  btn.hidden = roomKey === 'lounge';
}

function initEditorialBackToLounge() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  if (!overlay) return;

  var btn = overlay.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;

  // Populate label from data attribute
  var label = overlay.getAttribute('data-back-to-lounge-label') || 'Back to Lounge';
  btn.textContent = label;

  if (!btn._btlBound) {
    btn._btlBound = true;
    btn.addEventListener('click', function () {
      exitEditorialMode();
      goToRoom('lounge');
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        exitEditorialMode();
        goToRoom('lounge');
      }
    });
  }
}

// ============================================================
// VisitedRoomsIndicator
// ============================================================

function syncVisitedRooms() {
  var picker = document.querySelector('[data-bottom-nav-room-picker]');
  if (!picker) return;

  var visitedLabel = picker.getAttribute('data-room-visited-label') || 'Visited';
  var visited = (_browsingContext && _browsingContext.visitedRooms) || [];
  var buttons = picker.querySelectorAll('[data-room-key]');

  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var key = btn.getAttribute('data-room-key');
    var isVisited = visited.indexOf(key) !== -1 && VISITED_ROOMS_EXCLUDE.indexOf(key) === -1;
    if (isVisited) {
      btn.classList.add('is-visited');
      btn.setAttribute('aria-description', visitedLabel);
    } else {
      btn.classList.remove('is-visited');
      btn.removeAttribute('aria-description');
    }
  }
}

// ============================================================
// EditorialHeroParallax
// ============================================================

function _ehpOnScroll() {
  if (!_ehpOverlay) return;
  _ehpScrollTarget = Math.min(Math.max(_ehpOverlay.scrollTop * 0.3, 0), 60);
}

function _ehpLoop() {
  _ehpScrollCurrent += (_ehpScrollTarget - _ehpScrollCurrent) * 0.08;
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = 'translateY(' + _ehpScrollCurrent + 'px)';
  }
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

function initEditorialHeroParallax() {
  var reduceMotionEHP = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionEHP) return;

  _ehpOverlay = document.getElementById('immersive-editorial-overlay');
  if (!_ehpOverlay) return;

  _ehpHeroImg = _ehpOverlay.querySelector('.immersive-editorial__hero-bg');
  if (!_ehpHeroImg) {
    destroyEditorialHeroParallax();
    return;
  }

  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;

  _ehpOverlay.addEventListener('scroll', _ehpOnScroll, { passive: true });
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

function destroyEditorialHeroParallax() {
  if (_ehpOverlay) _ehpOverlay.removeEventListener('scroll', _ehpOnScroll);
  if (_ehpRafId !== null) {
    cancelAnimationFrame(_ehpRafId);
    _ehpRafId = null;
  }
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = '';
  }
  _ehpOverlay = null;
  _ehpHeroImg = null;
  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;
}

// ============================================================
// ProductCardTilt
// ============================================================

function _pctClamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function _pctApplyTilt() {
  if (!_pctActiveCard) {
    _pctRafPending = false;
    return;
  }
  var rotateY = _pctPendingNormX * 8;
  var rotateX = -_pctPendingNormY * 8;
  _pctActiveCard.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
  _pctRafPending = false;
}

function _pctOnMouseMove(event) {
  var card = event.target && event.target.closest && event.target.closest('.immersive-product-card');
  if (!card) return;

  // Keyboard focus guard
  if (document.activeElement === card || card.contains(document.activeElement)) return;

  var rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  var centerX = rect.left + rect.width / 2;
  var centerY = rect.top + rect.height / 2;
  _pctPendingNormX = _pctClamp((event.clientX - centerX) / (rect.width / 2), -1, 1);
  _pctPendingNormY = _pctClamp((event.clientY - centerY) / (rect.height / 2), -1, 1);
  _pctActiveCard = card;

  card.classList.remove('tilt-reset');

  if (!_pctRafPending) {
    _pctRafPending = true;
    requestAnimationFrame(_pctApplyTilt);
  }
}

function _pctOnMouseLeave(event) {
  var card =
    (event.target && event.target.closest && event.target.closest('.immersive-product-card')) || _pctActiveCard;
  if (card) {
    card.classList.add('tilt-reset');
    card.style.transform = '';
  }
  _pctActiveCard = null;
}

function initProductCardTilt() {
  var reduceMotionPCT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionPCT) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var panel = document.getElementById('glass-panel');
  if (!panel) return;

  panel.addEventListener('mousemove', _pctOnMouseMove);
  panel.addEventListener('mouseleave', _pctOnMouseLeave);
}

// ============================================================
// GUIDED MODE — Concierge sequence
// Storefront → Lounge → Editorial → Collection → Product
// ============================================================

var _guidedIdleTimer = null;
var _guidedPromptTimer = null;
var _guidedStep = 0; // 0=lounge, 1=editorial, 2=collection, 3=product
var _guidedFeaturedWing = 'designer_houses'; // overridden from section setting on init

var GUIDED_IDLE_MS = 10000; // 10s before auto-advance
var GUIDED_PROMPT_MS = 3500; // 3.5s before showing soft prompt in lounge

// Steps: 0=lounge, 1=editorial, 2=collection, 3=product
var GUIDED_STEPS = ['lounge', 'editorial', 'collection', 'product'];

function initGuidedMode() {
  // Read featured wing from section data attribute
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var wing = storeEl.getAttribute('data-guided-featured-wing');
    if (wing) _guidedFeaturedWing = wing;
  }

  // Wire prompt CTA and skip buttons
  var promptCta = document.querySelector('[data-guided-prompt-cta]');
  var promptSkip = document.querySelector('[data-guided-prompt-skip]');

  if (promptCta) {
    promptCta.addEventListener('click', function () {
      hideGuidedPrompt();
      _guidedAdvance();
    });
  }
  if (promptSkip) {
    promptSkip.addEventListener('click', function () {
      exitGuidedMode();
    });
  }

  // Exit guided mode on any user intent signals
  var intentEvents = ['mousedown', 'touchstart', 'keydown', 'wheel'];
  intentEvents.forEach(function (evt) {
    document.addEventListener(
      evt,
      function () {
        if (immersiveState.guided) {
          // Reset idle timer on activity — don't exit, just delay auto-advance
          _guidedResetIdleTimer();
        }
      },
      { passive: true },
    );
  });
}

function activateGuidedMode() {
  // Don't restart if dismissed this session
  try {
    if (sessionStorage.getItem('immersive_guided_dismissed')) return;
  } catch (e) {}

  immersiveState.guided = true;
  _guidedStep = 0;
  _updateGuidedDots(0);
  _showGuidedProgress();
  _guidedStartIdleTimer();
}

function exitGuidedMode() {
  if (!immersiveState.guided) return;
  immersiveState.guided = false;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  _guidedIdleTimer = null;
  _guidedPromptTimer = null;
  hideGuidedPrompt();
  _hideGuidedProgress();
  try {
    sessionStorage.setItem('immersive_guided_dismissed', '1');
  } catch (e) {}
}

function _guidedStartIdleTimer() {
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);

  if (!immersiveState.guided) return;

  // Show soft prompt after 3.5s
  _guidedPromptTimer = setTimeout(function () {
    if (immersiveState.guided) showGuidedPrompt();
  }, GUIDED_PROMPT_MS);

  // Auto-advance after 10s
  _guidedIdleTimer = setTimeout(function () {
    if (immersiveState.guided) {
      hideGuidedPrompt();
      _guidedAdvance();
    }
  }, GUIDED_IDLE_MS);
}

function _guidedResetIdleTimer() {
  if (!immersiveState.guided) return;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  hideGuidedPrompt();
  _guidedStartIdleTimer();
}

function _guidedAdvance() {
  if (!immersiveState.guided) return;

  _guidedStep++;
  _updateGuidedDots(_guidedStep);

  if (_guidedStep === 1) {
    // Step 1: Enter editorial of featured wing
    enterEditorialMode(_guidedFeaturedWing, null);
    // After editorial, guided mode waits for user to scroll/interact
    // Auto-advance to collection after idle
    _guidedStartIdleTimer();
  } else if (_guidedStep === 2) {
    // Step 2: Open the first collection from the featured wing
    exitEditorialMode();
    var firstCollection = _guidedGetFirstCollection(_guidedFeaturedWing);
    if (firstCollection) {
      setTimeout(function () {
        openCollectionPanel(firstCollection);
      }, 200);
    } else {
      // No collection configured — exit guided mode gracefully
      exitGuidedMode();
    }
  } else if (_guidedStep >= 3) {
    // Step 3+: Guided sequence complete — exit
    exitGuidedMode();
  }
}

function _guidedGetFirstCollection(wingKey) {
  var room = STORE_ROOMS[wingKey];
  if (!room || !room.hotspots) return null;
  for (var i = 0; i < room.hotspots.length; i++) {
    if (room.hotspots[i].targetCollection) return room.hotspots[i].targetCollection;
  }
  return null;
}

function showGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.hidden = false;
  requestAnimationFrame(function () {
    prompt.classList.add('is-visible');
  });
}

function hideGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.classList.remove('is-visible');
  // Hide after transition
  setTimeout(function () {
    if (!prompt.classList.contains('is-visible')) prompt.hidden = true;
  }, 500);
}

function _showGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.hidden = false;
  requestAnimationFrame(function () {
    el.classList.add('is-visible');
  });
}

function _hideGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.classList.remove('is-visible');
  setTimeout(function () {
    if (!el.classList.contains('is-visible')) el.hidden = true;
  }, 400);
}

function _updateGuidedDots(activeStep) {
  var dots = document.querySelectorAll('[data-guided-step]');
  for (var i = 0; i < dots.length; i++) {
    var step = parseInt(dots[i].getAttribute('data-guided-step'), 10);
    dots[i].classList.remove('is-active', 'is-done');
    if (step === activeStep) {
      dots[i].classList.add('is-active');
    } else if (step < activeStep) {
      dots[i].classList.add('is-done');
    }
  }
}
