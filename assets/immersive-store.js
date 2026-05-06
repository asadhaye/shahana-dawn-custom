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

  console.log('[Immersive] three.js compatibility shims applied');
})();

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
      { x: 40, y: 45, label: 'Story', targetRoom: 'featured_collections', targetStory: true, mobileX: 40, mobileY: 45 },
      { x: 65, y: 55, label: 'Codex', targetCodex: true, mobileX: 65, mobileY: 50 },
    ],
  },

  designer_houses: {
    baseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-base.jpg?v=1775510548&width=1600',
    mobileBaseTextureUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-base.jpg?v=1775516126&width=900',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-d-depth.webp?v=1775510548&width=1600',
    mobileDepthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/designer-m-depth.png?v=1775516123&width=900',
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
};

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
  var profile = ROOM_VISUAL_PROFILES[key] || ROOM_VISUAL_PROFILES[roomKey] || ROOM_VISUAL_PROFILES.default;
  return profile || ROOM_VISUAL_PROFILES.default;
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

  if (state.group) {
    state.group.traverse(function (obj) {
      if (obj.isMesh) {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    });
    scene.remove(state.group);
  }

  if (state.textures) {
    state.textures.forEach(function (tex) {
      if (tex) tex.dispose();
    });
  }

  delete galleryStageRegistry[roomKey];
  console.log('[Immersive] Disposed gallery stage for room:', roomKey);
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
  var radius = options.radius || 7;
  var arcDegrees = options.arcDegrees || 140;
  var verticalOffset = options.verticalOffset || 0.2;
  var tiltDegrees = options.tiltDegrees || -4;

  var group = new THREE.Group();
  group.position.set(0, 0, 0);
  var textureLoader = new THREE.TextureLoader();
  var planes = [];
  var textures = [];

  var count = items.length;
  var step = count > 1 ? arcDegrees / (count - 1) : 0;
  var startAngle = -arcDegrees / 2;

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;

    var tex = textureLoader.load(
      item.imageSrc,
      function (texture) {
        // Success callback
        texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        texture.anisotropy = 8;
      },
      undefined,
      function (err) {
        // Error callback - texture failed to load
        console.warn('[Immersive] Gallery texture load error:', err);
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
    };

    group.add(mesh);
    planes.push(mesh);
  });

  scene.add(group);

  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    textures: textures,
    currentAngle: 0,
    targetAngle: 0,
    radius: radius,
  };

  console.log('[Immersive] Gallery stage built for room:', roomKey, 'items:', items.length);
  return galleryStageRegistry[roomKey];
}

var galleryRaycaster = new (window.THREE ? window.THREE.Raycaster : function () {})();
var galleryMouse = new (window.THREE ? window.THREE.Vector2 : function () {})();

function handleGalleryStageClick(event, camera, canvas) {
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
    console.warn('[Immersive] Failed to parse room config:', e);
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
    console.warn('[Immersive] Room config missing for key "%s". Skipping room.', roomKey);
    return null;
  }

  return room;
}

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
  } else if (raw.targetCodex) {
    type = 'codex';
    target = null;
  } else if (raw.targetStory) {
    type = 'story';
    target = raw.targetRoom || 'featured_collections';
  } else {
    type = 'unknown';
    target = null;
  }
  return {
    id:
      raw.id ||
      roomKey +
        '-' +
        (raw.targetRoom ||
          raw.targetCollection ||
          raw.targetEditorialRoom ||
          (raw.targetCodex ? 'codex' : raw.targetStory ? 'story' : index)),
    type: type,
    target: target,
    label: raw.label || '',
    targetCodex: raw.targetCodex || false,
    targetStory: raw.targetStory || false,
    position: { x: raw.x, y: raw.y, z: raw.z },
    mobilePosition:
      typeof raw.mobileX === 'number' && typeof raw.mobileY === 'number' ? { x: raw.mobileX, y: raw.mobileY } : null,
    _raw: raw,
  };
}

function getNormalizedHotspots(roomKey) {
  var room = getRoomData(roomKey);
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
let currentRoomSubMode = null;
let transitioning = false;
var currentImageAspect = 16 / 9;

var textureCache = [];
var MAX_CACHED_TEXTURES = 5;
var galleryStageRegistry = {};

function getGalleryStageConfig(roomKey) {
  if (!window.immersiveWebglGalleryConfigs) return [];
  return window.immersiveWebglGalleryConfigs[roomKey] || [];
}

var lastFrameTime = typeof performance !== 'undefined' ? performance.now() : 0;
var fpsCounter = 0;
var fpsTimer = typeof performance !== 'undefined' ? performance.now() : 0;

const immersiveCanvasId = 'immersive-canvas';
const uiLayerId = 'ui-layer';
const glassPanelId = 'glass-panel';

var _immersiveInitBound = false;

var contentCache = {};

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
  isMobile = window.innerWidth < 768;
  isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

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

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive] Connection quality:', effType, '→ scale:', connectionQuality);
    }
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

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'immersive_' + name, ecommerce: null, immersive: payload });
  }

  if (typeof window.fbq === 'function') {
    if (name === 'add_to_cart_checkout') {
      window.fbq('track', 'AddToCart', payload);
    } else {
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

var wishlistItems = [];
var wishlistProductCache = {};
var wishlistPanelTrigger = null;
var activeHotspots = [];
var navigationHistory = [];

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
  console.log('[Immersive] popNavigationHistory - before:', JSON.stringify(_navigationHistory));
  if (_navigationHistory.length > 1) {
    _navigationHistory.pop();
    saveNavigationHistory();
    updateBackButton();
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

function initWishlist() {
  console.log('[Immersive] initWishlist called');
  try {
    var saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      wishlistItems = JSON.parse(saved);
      console.log('[Immersive] loaded wishlist:', wishlistItems.length, 'items');
    }
  } catch (e) {
    wishlistItems = [];
  }
  wishlistPanelTrigger = document.querySelector('[data-wishlist-trigger]') || document.getElementById('wishlist-panel-trigger');
  if (wishlistPanelTrigger) {
    wishlistPanelTrigger.addEventListener('click', function () {
      console.log('[Immersive] wishlist trigger clicked');
    });
  }
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
      goToRoom(previousRoom, false, true);
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
    console.log('[Immersive] Story mode:', currentRoomSubMode);
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
    console.error('[Immersive] Room definition not found for key:', roomKey);
    return null;
  }

  var mobile = usesMobileImg;
  var baseUrl = mobile && room.mobileBaseTextureUrl ? room.mobileBaseTextureUrl : room.baseTextureUrl;
  var depthUrl = mobile && room.mobileDepthMapUrl ? room.mobileDepthMapUrl : room.depthMapUrl;

  if (!baseUrl || !depthUrl) {
    console.warn('[Immersive] Missing texture URLs for room:', roomKey, { baseUrl: baseUrl, depthUrl: depthUrl });
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
    return entry.key === cacheKey;
  });

  if (isCached) return;
  loadRoomTextures(roomData, function () {});
}

function showWelcomeToast() {
  try {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
  } catch (e) {}
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
  toast.innerHTML =
    '<span class="immersive-welcome-toast__text">' +
    msg +
    '</span>' +
    '<button type="button" class="immersive-welcome-toast__close" aria-label="Close">×</button>';
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

  var state = loadState();
  var hasOpenPanel = (state.panel === 'product' && state.product) || (state.panel === 'collection' && state.collection);
  var startRoom = hasOpenPanel && state.room && getRoomData(state.room) ? state.room : 'storefront';

  if (!hasOpenPanel) clearState();

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
  img.src = room.baseTextureUrl;
  img.alt = '';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  wrapper.appendChild(img);
  canvas.style.display = 'none';
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
  var rect = canvasRect;
  mouseTarget.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  mouseTarget.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
}

var resizeRaf = null;
var lastMobile = isMobile;
var lastOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

function onWindowResize() {
  if (resizeRaf !== null) return;
  resizeRaf = requestAnimationFrame(function () {
    resizeRaf = null;
    evaluateDeviceFlags();
    updateCanvasRect();
    handleResize();

    var currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    if (isMobile !== lastMobile || currentOrientation !== lastOrientation) {
      lastMobile = isMobile;
      lastOrientation = currentOrientation;
      if (currentRoomKey) renderHotspots(currentRoomKey);
    }
  });
}

var resizeObserver = null;
var orientationMediaQuery = null;
var orientationListener = null;

function bindResizeHandling() {
  if (!renderer || !renderer.domElement) {
    window.addEventListener('resize', onWindowResize);
    return;
  }

  var canvas = renderer.domElement;
  window.addEventListener('resize', onWindowResize);

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(function () {
      onWindowResize();
    });
    resizeObserver.observe(canvas);
  }

  if (window.matchMedia) {
    orientationMediaQuery = window.matchMedia('(orientation: portrait)');
    orientationListener = function () {
      onWindowResize();
    };
    orientationMediaQuery.addEventListener('change', orientationListener);
  }
}

function unbindResizeHandling() {
  window.removeEventListener('resize', onWindowResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
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
  var width = canvas.clientWidth || window.innerWidth;
  var height = canvas.clientHeight || window.innerHeight;
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height, false);
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
  requestAnimationFrame(animate);
  if (!uniforms) return;

  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

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
      h.el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    }
  }

  if (tiltControlEnabled && immersiveState.mode === 'showroom' && !reduceMotion) {
    var tiltNormX = Math.max(-1, Math.min(1, (tiltGamma || 0) / 45));
    var tiltNormY = Math.max(-1, Math.min(1, ((tiltBeta || 0) - 45) / 45));

    tiltXSmoothed += (tiltNormX - tiltXSmoothed) * 0.1;
    tiltYSmoothed += (tiltNormY - tiltYSmoothed) * 0.1;

    if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
      uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
      uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
    }
  } else if (!tiltControlEnabled && (tiltXSmoothed !== 0 || tiltYSmoothed !== 0)) {
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

  var now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  var lastNow = window._immersiveLastFrameTime || now;
  var deltaSec = (now - lastNow) / 1000;
  window._immersiveLastFrameTime = now;
  applyRoomVisualProfile(currentRoomKey, currentRoomSubMode, deltaSec);

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  if (typeof performance !== 'undefined' && window.__IMMERSIVE_DEV__) {
    var now = performance.now();
    var frameTime = now - lastFrameTime;
    lastFrameTime = now;
    fpsCounter++;
    if (now - fpsTimer > 1000) {
      var fps = Math.round((fpsCounter * 1000) / (now - fpsTimer));
      console.log('[Immersive] FPS:', fps, '| Frame time:', frameTime.toFixed(2) + 'ms');
      fpsCounter = 0;
      fpsTimer = now;
    }
    if (frameTime > 16.67) {
      console.warn('[Immersive] Frame budget exceeded:', frameTime.toFixed(2) + 'ms');
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
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;

  saveState({ room: roomKey, panel: null, product: null, collection: null });
  immersiveState.currentRoom = roomKey;
  immersiveState.mode = 'showroom';
  immersiveState.editorialRoom = null;

  if (!initial && !skipHistory) {
    pushNavigationHistory(roomKey);
  }

  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    transitioning = true;
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
          buildGalleryStageForRoom(roomKey, scene, {
            radius: 7,
            arcDegrees: 140,
            verticalOffset: 0.3,
            tiltDegrees: -4,
          });
        }

        renderHotspots(roomKey);
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
    return entry.key === cacheKey;
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
  }, 45000);

  function onBothLoaded() {
    if (!loaded.base || !loaded.depth) return;
    clearTimeout(timeoutId);

    if (loaded.base.image && loaded.depth.image) {
      textureCache.unshift({ key: cacheKey, base: loaded.base, depth: loaded.depth });
      if (textureCache.length > MAX_CACHED_TEXTURES) {
        var oldest = textureCache.pop();
        console.log('[Immersive] Evicting oldest texture from cache:', oldest.key);
        try {
          if (oldest.base) oldest.base.dispose();
          if (oldest.depth) oldest.depth.dispose();
        } catch (e) {}
      }
    }

    callback(loaded.base, loaded.depth);
  }

  function onError(which) {
    if (failed) return;
    failed = true;
    clearTimeout(timeoutId);
    console.warn('[Immersive] Failed to load ' + which + ' texture.');

    if (!retryAttempts || retryAttempts < 1) {
      retryAttempts = (retryAttempts || 0) + 1;
      console.log('[Immersive] Retrying texture load (attempt ' + retryAttempts + ')');
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
      button.style.transform = 'translate(-50%, -50%)';

      activeHotspots.push({
        el: button,
        x: posX / 100,
        y: posY / 100,
      });

      button.addEventListener('click', function () {
        console.log('[Immersive] Hotspot clicked:', JSON.stringify(hotspot));

        if (!hotspot.startExperience) {
          exitGuidedMode();
        }

        if (hotspot.targetEditorialRoom) {
          enterEditorialMode(hotspot.targetEditorialRoom, button);
        } else if (hotspot.targetRoom) {
          if (hotspot.startExperience) {
            activateGuidedMode();
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

function openPanel(panel, triggerEl) {
  if (!panel) return null;
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  if (closeBtn && !closeBtn._clickBound) {
    closeBtn._clickBound = true;
    closeBtn.addEventListener('click', function () {
      closePanel(panel);
    });
  }
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');
  panel.setAttribute('data-open', 'true');
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

function closePanel(panel) {
  if (!panel) return;
  panel.removeAttribute('data-open');
  closeDialogFocus(panel, panel._panelTrigger);
  panel._panelTrigger = null;
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}


function openProductPanel(productHandle, collectionHandle) {
  exitGuidedMode();
  recordBrowsingSignal(immersiveState.currentRoom);
  saveState({ panel: 'product', product: productHandle, collection: collectionHandle || null });

  var path = shopRoot + 'products/' + productHandle;
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var triggerEl = document.activeElement;
  openPanel(panel, triggerEl);

  var contentArea = panel.querySelector('.immersive-store__panel-content');
  if (contentArea) {
    contentArea.innerHTML = '<div style="padding:3rem;text-align:center;">Loading...</div>';
  }

  fetchSectionHtml(path, 'glass-product', collectionHandle ? { collection_handle: collectionHandle } : null)
    .then(function (html) {
      if (!html) {
        closePanel(panel);
        return;
      }
      if (contentArea) {
        contentArea.innerHTML = html;
      }
      setPanelRoomLabel(panel);
      trackImmersiveEvent('panel_opened', { panel_type: 'product', product_handle: productHandle });
    })
    .catch(function () {
      closePanel(panel);
    });
}

function openCollectionPanel(collectionHandle) {
  exitGuidedMode();
  recordBrowsingSignal(immersiveState.currentRoom);
  saveState({ panel: 'collection', collection: collectionHandle, product: null });

  var path = shopRoot + 'collections/' + collectionHandle;
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var triggerEl = document.activeElement;
  openPanel(panel, triggerEl);

  var contentArea = panel.querySelector('.immersive-store__panel-content');
  if (contentArea) {
    contentArea.innerHTML = '<div style="padding:3rem;text-align:center;">Loading...</div>';
  }

  fetchSectionHtml(path, 'glass-panel', null)
    .then(function (html) {
      if (!html) {
        closePanel(panel);
        return;
      }
      if (contentArea) {
        contentArea.innerHTML = html;
      }
      setPanelRoomLabel(panel);
      trackImmersiveEvent('panel_opened', { panel_type: 'collection', collection_handle: collectionHandle });
    })
    .catch(function () {
      closePanel(panel);
    });
}

function setPanelRoomLabel(panel) {
  var labelEl = panel && panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || '' : '';
  labelEl.textContent = roomName;
}

function fetchWithCache(url) {
  if (contentCache[url]) {
    return Promise.resolve(contentCache[url]);
  }
  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (response) {
      if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
      return response.text();
    })
    .then(function (html) {
      contentCache[url] = html;
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

  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (response) {
      if (!response.ok) return null;
      return response.json();
    })
    .then(function (json) {
      if (!json || typeof json !== 'object') return null;
      var html = json[sectionId];
      if (!html) return null;
      return html;
    })
    .catch(function (err) {
      console.warn('[Immersive] Section Rendering error:', sectionId, err);
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

function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl || null;

  editorialScrollProgress = 0;
  if (uniforms) {
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

  if (!overlay || !overlayContent) return;

  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');

  if (!sectionInstanceId) return;

  var fetchUrl = window.location.pathname + '?sections=' + sectionInstanceId;
  openOverlay(
    'immersive-editorial-overlay',
    'immersive-editorial-overlay-content',
    fetchUrl,
    function (overlay, overlayContent) {
      performEditorialUIActivation(overlay, canvas);
      initEditorialHeroParallax();
      updateBackToLoungeVisibility(roomKey);
    },
  );
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

function exitEditorialMode() {
  destroyEditorialHeroParallax();
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);
  var triggerEl = immersiveState.lastHotspot;

  var performUIDeactivation = function () {
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
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
    document.startViewTransition(performUIDeactivation);
  } else {
    performUIDeactivation();
    immersiveState.lastHotspot = null;
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
    trackImmersiveEvent && trackImmersiveEvent('guided_mode_exited', {
      room: immersiveState.currentRoom || null
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
    trackImmersiveEvent && trackImmersiveEvent('guided_mode_entered', {
      room: immersiveState.currentRoom || null
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

function openOverlay(overlayId, overlayContentId, fetchUrl, onOpenCallback) {
  var overlay = document.getElementById(overlayId);
  var overlayContent = document.getElementById(overlayContentId);

  if (!overlay || !overlayContent) return;

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
      overlayContent.innerHTML =
        '<div style="height:60vh;display:flex;align-items:center;justify-content:center;color:#d4af37;">The story is temporarily unavailable.</div>';
    });
}

function closeOverlay(overlay, triggerEl) {
  if (!overlay) return;
  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
  if (triggerEl && typeof triggerEl.focus === 'function') {
    requestAnimationFrame(function () {
      triggerEl.focus();
    });
  }
}

function initEditorialHeroParallax() {
  var reduceMotionEHP = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionEHP) return;

  var overlay = document.getElementById('immersive-editorial-overlay');
  if (!overlay) return;

  var heroImg = overlay.querySelector('.immersive-editorial__hero-bg');
  if (!heroImg) return;

  var scrollTarget = 0;
  var scrollCurrent = 0;
  var rafId = null;

  function onScroll() {
    if (!overlay) return;
    scrollTarget = Math.min(Math.max(overlay.scrollTop * 0.3, 0), 60);
  }

  function loop() {
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;
    if (heroImg) {
      heroImg.style.transform = 'translateY(' + scrollCurrent + 'px)';
    }
    rafId = requestAnimationFrame(loop);
  }

  overlay.addEventListener('scroll', onScroll, { passive: true });
  rafId = requestAnimationFrame(loop);
}

function destroyEditorialHeroParallax() {}

function showFeedback(message, type) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-feedback';
  feedback.textContent = message;
  feedback.setAttribute('role', 'alert');
  feedback.style.cssText =
    'position:fixed;top:20px;right:20px;background:' +
    (type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(212,175,55,0.9)') +
    ';color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:10000;font-weight:600;cursor:pointer;';
  document.body.appendChild(feedback);
  setTimeout(function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    }, 300);
  }, 4000);
}

function showCartFeedback(panel) {
  var glassPanel = document.getElementById(glassPanelId);
  var msg = (glassPanel && glassPanel.getAttribute('data-msg-added-to-cart')) || 'Added to cart!';
  showFeedback(msg, 'success');
}

function renderSkeletonGrid(count) {
  count = count || 6;
  var cards = '';
  for (var i = 0; i < count; i++) {
    cards +=
      '<div class="immersive-skeleton-card"><div class="immersive-skeleton-card__image"></div><div class="immersive-skeleton-card__content"><div class="immersive-skeleton-card__line"></div><div class="immersive-skeleton-card__line"></div></div></div>';
  }
  return '<div class="immersive-skeleton-grid">' + cards + '</div>';
}

function openImmersiveCart() {
  var existingModal = document.getElementById('immersive-cart-modal');
  if (existingModal) {
    existingModal.style.display = 'flex';
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'immersive-cart-modal';
  modal.className = 'immersive-cart-shell';
  modal.innerHTML =
    '<div class="immersive-cart-shell__panel" role="dialog" aria-labelledby="cart-title"><header class="immersive-cart-shell__header"><h1 id="cart-title">Your Cart</h1><button type="button" data-close-cart>×</button></header><div class="immersive-cart-shell__content">Loading...</div></div>';
  modal.style.cssText =
    'position:fixed;inset:0;background:rgba(6,8,14,0.65);display:flex;align-items:center;justify-content:center;padding:2rem;z-index:10000;';
  document.body.appendChild(modal);

  var closeBtn = modal.querySelector('[data-close-cart]');
  closeBtn.addEventListener('click', closeImmersiveCart);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeImmersiveCart();
  });

  fetch(shopRoot + '?section_id=cart-drawer', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (r) {
      return r.text();
    })
    .then(function (html) {
      var content = modal.querySelector('.immersive-cart-shell__content');
      if (content) content.innerHTML = html;
    })
    .catch(function () {
      var content = modal.querySelector('.immersive-cart-shell__content');
      if (content) content.innerHTML = '<p>Failed to load cart</p>';
    });
}

function closeImmersiveCart() {
  var modal = document.getElementById('immersive-cart-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease';
    setTimeout(function () {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  }
}

var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null,
  guided: false,
};

function bindImmersiveNav() {
  var cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', function () {
      openImmersiveCart();
    });
  }

  var menuDrawer = document.getElementById('menu-drawer');
  if (menuDrawer) {
    menuDrawer.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      var collectionMatch = href.match(/\/collections\/([^/?#]+)/);
      if (collectionMatch) {
        e.preventDefault();
        openCollectionPanel(collectionMatch[1]);
        return;
      }
      var productMatch = href.match(/\/products\/([^/?#]+)/);
      if (productMatch) {
        e.preventDefault();
        openProductPanel(productMatch[1], null);
      }
    });
  }
}

var contentCache = {};
var CACHE_TTL_MS = 5 * 60 * 1000;
var cacheTimestamps = {};

function setupCacheInvalidation() {
  if (window.__immersiveCacheInvalidationBound) return;
  window.__immersiveCacheInvalidationBound = true;

  document.addEventListener('cart:updated', function () {
    console.log('[Immersive] Cart updated, clearing content cache');
    clearContentCache();
  });
}

function clearContentCache() {
  Object.keys(contentCache).forEach(function (key) {
    delete contentCache[key];
  });
  Object.keys(cacheTimestamps).forEach(function (key) {
    delete cacheTimestamps[key];
  });
  contentCache = {};
  cacheTimestamps = {};
}

function getCachedContent(url, allowStale) {
  var now = Date.now();
  if (contentCache[url]) {
    var age = now - (cacheTimestamps[url] || 0);
    if (age < CACHE_TTL_MS || allowStale) {
      return contentCache[url];
    }
  }
  return null;
}

function setCachedContent(url, html) {
  contentCache[url] = html;
  cacheTimestamps[url] = Date.now();
}

function initImmersiveSceneIfReady() {
  if (_immersiveInitBound) return;
  if (!document.getElementById(immersiveCanvasId)) return;
  _immersiveInitBound = true;

  requestAnimationFrame(function () {
    initImmersiveScene();
    setupCacheInvalidation();
    bindImmersiveNav();
    initBackButton();
    initStoryModeListener();
    initTiltControlToggle();
    initWishlist();
    showImmersiveOnboardingIfNeeded();
    checkUrlForCollection();
  });
}

function showImmersiveOnboardingIfNeeded() {
  console.log('[Immersive] showImmersiveOnboardingIfNeeded called');
  try {
    var seen = localStorage.getItem(ONBOARDING_KEY);
    if (seen) {
      console.log('[Immersive] onboarding already seen');
      return;
    }
  } catch (e) {}
  var overlay = document.getElementById('immersive-onboarding');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function checkUrlForCollection() {
  var params = new URLSearchParams(window.location.search);
  var collection = params.get('open_collection');
  if (collection && typeof openCollectionPanel === 'function') {
    console.log('[Immersive] Opening collection from URL:', collection);
    openCollectionPanel(collection);
  }
  var product = params.get('open_product');
  if (product && typeof openProductPanel === 'function') {
    console.log('[Immersive] Opening product from URL:', product);
    openProductPanel(product, null);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImmersiveSceneIfReady);
} else {
  initImmersiveSceneIfReady();
}

document.addEventListener('shopify:section:load', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false;
    initImmersiveSceneIfReady();
  }
});
