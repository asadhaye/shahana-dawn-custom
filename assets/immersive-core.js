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
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/base-featured-collections-room-mobile.png?v=1778760315',
    depthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/depth-featured-collections-room-mobile.png?v=1778760239&width=900&quality=60',
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

window.immersiveState = immersiveState;
window.STORE_ROOMS = STORE_ROOMS;
window.contentCache = contentCache;

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

var STATE_KEY = 'immersive_state';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var WISHLIST_KEY = 'immersive_wishlist';
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';
var NAVIGATION_HISTORY_KEY = 'immersive_nav_history';

var _wishlistItems = [];
var _wishlistProductCache = {};
var _wishlistPanelTrigger = null;
var _activeHotspots = []; // To track hotspot proximity scaling
var _navigationHistory = [];

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

// Navigation history for back button
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
  return null;
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
      if (typeof exitEditorialMode === 'function') exitEditorialMode();
      return;
    }
    var panel = document.getElementById(glassPanelId);
    if (panel && !panel.hasAttribute('hidden')) {
      if (typeof closePanel === 'function') closePanel(panel);
    }
    var previousRoom = popNavigationHistory();
    if (previousRoom && typeof goToRoom === 'function') {
      goToRoom(previousRoom, false, true);
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
  writeImmersivePreference();

  // Restore open panel after room loads
  if (state.panel === 'product' && state.product) {
    // Small delay to let the room render first
    setTimeout(function () {
      if (typeof openProductPanel === 'function') openProductPanel(state.product, state.collection);
    }, 400);
  } else if (state.panel === 'collection' && state.collection) {
    setTimeout(function () {
      if (typeof openCollectionPanel === 'function') openCollectionPanel(state.collection);
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
      // Push initial room to navigation history
      pushNavigationHistory(roomKey);
      if (typeof trackImmersiveEvent === 'function') trackImmersiveEvent('room_viewed', { room_key: roomKey });
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
        if (typeof trackImmersiveEvent === 'function') trackImmersiveEvent('room_viewed', { room_key: roomKey });

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
          if (typeof exitGuidedMode === 'function') exitGuidedMode();
        }

        if (hotspot.targetEditorialRoom) {
          details.target_type = 'editorial';
          details.target_editorial_room = hotspot.targetEditorialRoom;
          if (typeof trackImmersiveEvent === 'function') trackImmersiveEvent('hotspot_clicked', details);
          if (typeof enterEditorialMode === 'function') enterEditorialMode(hotspot.targetEditorialRoom, button);
          return;
        }
        if (hotspot.targetRoom) {
          details.target_type = 'room';
          details.target_room_key = hotspot.targetRoom;
          if (typeof trackImmersiveEvent === 'function') trackImmersiveEvent('hotspot_clicked', details);
          // Activate guided mode when "Start Experience" is clicked
          if (hotspot.startExperience) {
            if (typeof activateGuidedMode === 'function') activateGuidedMode();
          }
          goToRoom(hotspot.targetRoom);
        } else if (hotspot.targetCollection) {
          details.target_type = 'collection';
          details.target_collection_handle = hotspot.targetCollection;
          if (typeof trackImmersiveEvent === 'function') trackImmersiveEvent('hotspot_clicked', details);
          if (typeof openCollectionPanel === 'function') openCollectionPanel(hotspot.targetCollection);
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
  if (typeof updateHotspotElements === 'function') updateHotspotElements();
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
      if (typeof onOpenCallback === 'function') {
        onOpenCallback(overlay, overlayContent);
      }
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
    window.contentCache = contentCache;
  }

  requestAnimationFrame(function () {
    initImmersiveScene();
    initBackButton(); // Initialize back button for navigation history
    if (typeof bindImmersiveNav === 'function') bindImmersiveNav();
    if (typeof setupImageParallax === 'function') setupImageParallax();
    if (typeof showImmersiveOnboardingIfNeeded === 'function') showImmersiveOnboardingIfNeeded();
    if (typeof initWishlist === 'function') initWishlist();
    if (typeof bindCookieBanner === 'function') bindCookieBanner();
    if (typeof initTiltControlToggle === 'function') initTiltControlToggle(); // Tilt-control experiment (opt-in, mobile-only)
    initHotspotKeyboardNav(); // Keyboard navigation for hotspots

    // UX Enhancement modules
    if (typeof initImmersiveSearch === 'function') initImmersiveSearch();
    if (typeof initImmersiveBottomNav === 'function') initImmersiveBottomNav();
    if (typeof initImmersiveGestures === 'function') initImmersiveGestures();
    if (typeof initEditorialScrollReveal === 'function') initEditorialScrollReveal();
    if (typeof initEditorialBackToLounge === 'function') initEditorialBackToLounge();
    if (typeof initProductCardTilt === 'function') initProductCardTilt();
    if (typeof initGuidedMode === 'function') initGuidedMode();
    if (typeof initImmersiveNextActions === 'function') initImmersiveNextActions();
    if (typeof initImmersiveRoomRecommender === 'function') initImmersiveRoomRecommender();
    if (typeof initImmersiveQuickAdd === 'function') initImmersiveQuickAdd();
    if (typeof initImmersiveLimitedTime === 'function') initImmersiveLimitedTime();

    try {
      if (window.URLSearchParams) {
        var params = new URLSearchParams(window.location.search);
        var openProduct = params.get('open_product');
        var openCollection = params.get('open_collection');
        var openSearch = params.get('open_search');

        if (openProduct) {
          // Priority 1: product (existing behaviour)
          setTimeout(function () {
            if (typeof openProductPanel === 'function') openProductPanel(openProduct);
          }, 400);
        } else if (openCollection) {
          // Priority 2: collection
          setTimeout(function () {
            if (typeof openCollectionPanel === 'function') openCollectionPanel(openCollection);
          }, 400);
        } else if (openSearch) {
          // Priority 3: search
          setTimeout(function () {
            if (typeof openSearchPanel === 'function') openSearchPanel(openSearch);
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
    if (typeof initImmersiveSearch === 'function') initImmersiveSearch();
    if (typeof initImmersiveBottomNav === 'function') initImmersiveBottomNav();
    if (typeof initImmersiveLimitedTime === 'function') initImmersiveLimitedTime();
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
