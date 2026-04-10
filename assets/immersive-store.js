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
    hotspots: [{ x: 50, y: 68, label: 'Enter store', targetRoom: 'lounge', mobileX: 55, mobileY: 63 }],
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
    baseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=900&quality=60',
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
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=1600&quality=60',
    mobileDepthMapUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=900&quality=60',
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
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=1600&quality=75',
    mobileBaseTextureUrl:
      'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737&width=900&quality=75',
    depthMapUrl: 'https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733&width=1600&quality=60',
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

let renderer;
let scene;
let camera;
let planeMesh;
let uniforms;
let currentRoomKey = null;
let transitioning = false;
var currentImageAspect = 16 / 9; // updated when a texture loads

// Texture cache to avoid re-loading and enable VRAM disposal
var textureCache = {};

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
  usesMobileImg = window.innerWidth < 1024;
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

var _wishlistItems = [];
var _wishlistProductCache = {};
var _wishlistPanelTrigger = null;

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
  uniform float uParallaxStrength;
  uniform float uScrollOffset;
  uniform float uScrollVignette;
  uniform float uScrollChroma;

  vec2 parallaxUv(vec2 uv, sampler2D depthTex, vec2 mouse) {
    vec3 depthSample = texture2D(depthTex, uv).rgb;
    float depth = dot(depthSample, vec3(0.299, 0.587, 0.114));
    float d = depth - 0.5;
    vec2 centeredMouse = mouse - 0.5;

    vec2 offset = centeredMouse * uParallaxStrength * d;

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

    // Edge vignette that deepens on scroll
    vec2 vigUv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vigUv * vec2(0.6, 0.8), vigUv * vec2(0.6, 0.8));
    vignette = clamp(vignette, 0.0, 1.0);
    float vigStrength = 0.18 + uScrollVignette * 0.32;
    color.rgb *= mix(1.0 - vigStrength, 1.0, pow(vignette, 1.4));

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
  if (textureCache[cacheKey]) return; // already cached
  loadRoomTextures(roomData, function () {}); // load silently into cache
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
    uParallaxStrength: { value: parallaxStrength },
    uScrollOffset: { value: 0 },
    uScrollVignette: { value: 0 },
    uScrollChroma: { value: 0 },
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

function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay') || null;
  editorialMaxScroll = editorialOverlayEl ? editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight : 0;
}

function animate() {
  requestAnimationFrame(animate);
  if (!uniforms) return;

  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

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
      }
    }
  } else if (editorialScrollProgress > 0.001) {
    editorialScrollProgress *= 0.85;
    uniforms.uScrollOffset.value = editorialScrollProgress;
    if (!reduceMotion) {
      uniforms.uScrollVignette.value *= 0.85;
      uniforms.uScrollChroma.value *= 0.85;
    }
  } else {
    editorialScrollProgress = 0;
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function goToRoom(roomKey, initial) {
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

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    uiLayer.style.transition = 'opacity 0.3s ease';
    uiLayer.style.opacity = '0';
  }

  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
    if (initial || currentRoomKey === null) {
      uniforms.uTexture1.value = baseTexture;
      uniforms.uDepth1.value = depthTexture;
      uniforms.uTexture2.value = baseTexture;
      uniforms.uDepth2.value = depthTexture;
      currentRoomKey = roomKey;
      uiLayer.style.opacity = '1';
      renderHotspots(roomKey);
      var tagline = document.getElementById('immersive-tagline');
      if (tagline) tagline.classList.remove('is-visible');
      hideLoader();
      trackImmersiveEvent('room_viewed', { room_key: roomKey });
      return;
    }

    var oldBase = uniforms.uTexture1.value;
    var oldDepth = uniforms.uDepth1.value;

    uniforms.uTexture2.value = baseTexture;
    uniforms.uDepth2.value = depthTexture;

    transitioning = true;
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
        transitioning = false;
        renderHotspots(roomKey);
        var tagline = document.getElementById('immersive-tagline');
        if (tagline) tagline.classList.remove('is-visible');
        uiLayer.style.opacity = '1';
        trackImmersiveEvent('room_viewed', { room_key: roomKey });
      }
    }

    requestAnimationFrame(step);
  });
}

function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  // Store the trigger hotspot to restore focus on exit precisely
  immersiveState.lastHotspot = triggerEl || null;

  // Reset scroll-linked state to prevent "jumps" on entry
  editorialScrollProgress = 0;
  if (uniforms && uniforms.uScrollOffset) {
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
  }
  // Cache overlay element and max scroll once on entry — avoids per-frame DOM queries
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

  // View Transition: Morph hotspot to overlay (Entry)
  var performUIActivation = function () {
    if (canvas && !reduceMotion) {
      canvas.classList.add('editorial-blur');
    }
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-active');
    overlay.scrollTop = 0;

    var backBtn = document.getElementById('immersive-editorial-back');
    if (backBtn) {
      requestAnimationFrame(function () {
        backBtn.focus();
      });
      if (!backBtn._editorialBound) {
        backBtn._editorialBound = true;
        backBtn.addEventListener('click', exitEditorialMode);
      }
    }
  };

  var startTransition = function () {
    if (document.startViewTransition && triggerEl) {
      // Assign names inside the transition callback so the browser never sees
      // two elements with the same name simultaneously (avoids InvalidStateError)
      var transition = document.startViewTransition(function () {
        triggerEl.style.viewTransitionName = 'editorial-morph';
        overlay.style.viewTransitionName = 'editorial-morph';
        performUIActivation();
      });
      transition.finished.finally(function () {
        if (triggerEl) triggerEl.style.viewTransitionName = '';
        overlay.style.viewTransitionName = '';
      });
    } else if (document.startViewTransition) {
      document.startViewTransition(function () {
        performUIActivation();
      });
    } else {
      performUIActivation();
    }
  };

  // Resolve the real Shopify section instance ID from the DOM
  // <section class="immersive-editorial" data-room-key="designer_houses" data-section-id="{{ section.id }}">
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');

  if (!sectionInstanceId) {
    console.warn('[Immersive] No immersive-editorial section instance found on page for room:', roomKey);
    // Fallback: clone existing DOM if the section is present but has no section ID
    if (sourceSection) {
      overlayContent.innerHTML = sourceSection.innerHTML;
      startTransition();
    }
    return;
  }

  var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;

  var msgLoading = (overlay && overlay.getAttribute('data-msg-loading')) || 'Loading\u2026';
  var msgError = (overlay && overlay.getAttribute('data-msg-error')) || 'The story is temporarily unavailable.';
  var msgTryAgain = (overlay && overlay.getAttribute('data-msg-try-again')) || 'Try again';

  // Show loading spinner if not in cache
  if (!contentCache[fetchUrl]) {
    overlayContent.innerHTML =
      '<div class="immersive-editorial-loader" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37;">' +
      '<div class="immersive-loader__ring"></div>' +
      '<p style="margin-top:1.5rem; font-size:0.9rem; letter-spacing:0.1em; text-transform:uppercase;">' +
      msgLoading +
      '</p>' +
      '</div>';
    startTransition();
  } else {
    startTransition();
  }

  fetchWithCache(fetchUrl)
    .then(function (html) {
      // Add loading="lazy" to injected images to preserve performance
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var images = temp.querySelectorAll('img:not([loading])');
      for (var i = 0; i < images.length; i++) {
        images[i].setAttribute('loading', 'lazy');
      }

      overlayContent.innerHTML = temp.innerHTML;

      // Re-initialize any parallax scripts if necessary
      if (window.ImmersiveEditorial) {
        window.ImmersiveEditorial.init && window.ImmersiveEditorial.init(overlayContent);
      }
    })
    .catch(function (err) {
      console.error('[Immersive] Editorial fetch failed:', err);
      overlayContent.innerHTML =
        '<div class="immersive-editorial-error" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; text-align:center; padding:2rem;">' +
        '<p style="font-size:1.1rem; margin-bottom:1.5rem;">' +
        msgError +
        '</p>' +
        '<button type="button" class="immersive-header__btn" onclick="enterEditorialMode(\'' +
        roomKey +
        '\')">' +
        msgTryAgain +
        '</button>' +
        '</div>';
    });

  if (!overlay._onEscapeEditorial) {
    overlay._onEscapeEditorial = function (e) {
      if (e.key === 'Escape') exitEditorialMode();
    };
    overlay.addEventListener('keydown', overlay._onEscapeEditorial);
  }

  // Delegate clicks on gallery cards with data-collection — open glass panel instead of navigating
  if (!overlay._onCollectionClick) {
    overlay._onCollectionClick = function (e) {
      var card = e.target.closest('[data-collection]');
      if (!card) return;
      var handle = card.getAttribute('data-collection');
      if (!handle) return;
      e.preventDefault();
      exitEditorialMode();
      // Small delay so the overlay exit animation starts before the panel opens
      setTimeout(function () {
        openCollectionPanel(handle);
      }, 120);
    };
    overlay.addEventListener('click', overlay._onCollectionClick);
  }
}

function exitEditorialMode() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);
  var triggerEl = immersiveState.lastHotspot;

  var performUIDeactivation = function () {
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      if (overlay._onEscapeEditorial) {
        overlay.removeEventListener('keydown', overlay._onEscapeEditorial);
        overlay._onEscapeEditorial = null;
      }
      if (overlay._onCollectionClick) {
        overlay.removeEventListener('click', overlay._onCollectionClick);
        overlay._onCollectionClick = null;
      }
    }

    if (canvas) {
      canvas.classList.remove('editorial-blur');
    }

    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
    editorialOverlayEl = null; // clear cached ref — will be re-resolved on next entry
    editorialMaxScroll = 0;
    updateCameraForMode();

    if (triggerEl) {
      requestAnimationFrame(function () {
        triggerEl.focus();
      });
    }
  };

  // View Transition on Exit: Morph back from overlay to hotspot
  if (document.startViewTransition && triggerEl) {
    overlay.style.viewTransitionName = 'editorial-morph';
    triggerEl.style.viewTransitionName = 'editorial-morph';

    var transition = document.startViewTransition(function () {
      performUIDeactivation();
    });

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

  if (textureCache[cacheKey]) {
    callback(textureCache[cacheKey].base, textureCache[cacheKey].depth);
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
      textureCache[cacheKey] = { base: loaded.base, depth: loaded.depth };
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
  return Object.values(textureCache).some(function (entry) {
    return entry.base === texture || entry.depth === texture;
  });
}

function renderHotspots(roomKey) {
  var room = STORE_ROOMS[roomKey];
  var uiLayer = document.getElementById(uiLayerId);
  if (!room || !uiLayer) return;

  function render() {
    uiLayer.innerHTML = '';

    room.hotspots.forEach(function (hotspot) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'immersive-hotspot';
      button.setAttribute('aria-label', hotspot.label);
      var srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = hotspot.label;
      button.appendChild(srSpan);
      button.style.position = 'absolute';
      var posX = usesMobileImg && hotspot.mobileX != null ? hotspot.mobileX : hotspot.x;
      var posY = usesMobileImg && hotspot.mobileY != null ? hotspot.mobileY : hotspot.y;
      button.style.left = posX + '%';
      button.style.top = posY + '%';
      button.style.transform = 'translate(-50%, -50%)';

      button.addEventListener('click', function () {
        var details = { room_key: roomKey, hotspot_label: hotspot.label };
        console.log('[Immersive] Hotspot clicked:', JSON.stringify(hotspot));
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

      // Preload next room textures on hover
      if (hotspot.targetRoom) {
        button.addEventListener(
          'mouseenter',
          function () {
            preloadRoom(hotspot.targetRoom);
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

function transitionPanelContent(panel, render) {
  if (!panel) return;
  if (document.startViewTransition) {
    document.startViewTransition(function () {
      render();
    });
  } else {
    render();
  }
}

// ── Focus management helpers ──────────────────────────────────────────────────

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(function (el) {
    return !el.closest('[hidden]') && el.offsetParent !== null;
  });
}

var _panelTrigger = null;
var _menuTrigger = null;

function openDialogFocus(dialog, triggerEl) {
  // Save the element that opened the dialog so we can restore focus on close
  if (triggerEl) triggerEl._dialogTrigger = true;

  var closeBtn = dialog.querySelector('.immersive-store__panel-close, [data-menu-close]');
  var firstFocusable = closeBtn || getFocusableElements(dialog)[0];
  if (firstFocusable) {
    requestAnimationFrame(function () {
      firstFocusable.focus();
    });
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusableElements(dialog);
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
    if (e.key === 'Escape') {
      if (dialog.id === glassPanelId) closePanel();
      else closeMenuDrawer();
    }
  }

  dialog._trapFocus = trapFocus;
  dialog._onEscape = onEscape;
  dialog.addEventListener('keydown', trapFocus);
  dialog.addEventListener('keydown', onEscape);

  return triggerEl;
}

function closeDialogFocus(dialog, triggerEl) {
  if (dialog._trapFocus) dialog.removeEventListener('keydown', dialog._trapFocus);
  if (dialog._onEscape) dialog.removeEventListener('keydown', dialog._onEscape);
  if (triggerEl && typeof triggerEl.focus === 'function') {
    requestAnimationFrame(function () {
      triggerEl.focus();
    });
  }
}

// ── Panel open/close ──────────────────────────────────────────────────────────

// Helper function to close the panel smoothly
function closePanel() {
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  panel.removeAttribute('data-open');
  saveState({ panel: null, product: null, collection: null });

  closeDialogFocus(panel, _panelTrigger);
  _panelTrigger = null;

  // Wait for the CSS transition to finish before hiding from DOM
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}

function closeMenu() {
  var menuPanel = document.getElementById('immersive-menu');
  var menuToggle = document.getElementById('menu-toggle');
  if (!menuPanel) return;
  menuPanel.classList.remove('is-open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-label', menuToggle.getAttribute('data-label-open') || 'Menu');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  closeDialogFocus(menuPanel, _menuTrigger);
  _menuTrigger = null;
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

function openSearchPanel(encodedQuery) {
  var query = '';
  try {
    query = decodeURIComponent(encodedQuery);
  } catch (e) {
    query = encodedQuery;
  }
  if (!query) return;

  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  _panelTrigger = document.activeElement;
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');

  var fetchUrl = shopRoot + 'search?q=' + encodeURIComponent(query) + '&section_id=immersive-product-grid';

  fetchWithCache(fetchUrl)
    .then(function (html) {
      if (!html) {
        var errMsg =
          (panel && panel.getAttribute('data-msg-load-collection-error')) ||
          'Unable to load results. Please try again.';
        showErrorFeedback(panel, errMsg);
        return;
      }
      function render() {
        var contentArea = panel.querySelector('.immersive-store__panel-content');
        if (contentArea) contentArea.innerHTML = html;
        panel.setAttribute('data-open', 'true');
        openDialogFocus(panel, _panelTrigger);
        setupVariantButtons(panel);
        setupImageParallax(panel);
        syncAllWishlistToggles(panel);
        trackImmersiveEvent('search_panel_opened', { query: query });
        panel.onclick = function (event) {
          if (event.target === panel) {
            closePanel();
            return;
          }
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel();
            return;
          }
          var card = event.target.closest('.immersive-product-card');
          if (!card) return;
          var handle = card.getAttribute('data-product-handle');
          if (!handle) return;
          event.preventDefault();
          openProductPanel(handle, null);
        };
      }
      transitionPanelContent(panel, render);
    })
    .catch(function (err) {
      console.error('[Immersive] Search panel fetch failed:', err);
      var errMsg =
        (panel && panel.getAttribute('data-msg-load-collection-error')) || 'Unable to load results. Please try again.';
      showErrorFeedback(panel, errMsg);
    });
}

function openCollectionPanel(collectionHandle) {
  saveState({ panel: 'collection', collection: collectionHandle, product: null });
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  _panelTrigger = document.activeElement;

  // Remove hidden class and hidden attribute so CSS transitions work
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');

  // Fetch from the collection URL with section_id parameter
  var fetchUrl = shopRoot + 'collections/' + collectionHandle + '?section_id=glass-panel';

  console.log('Fetching collection:', collectionHandle, 'URL:', fetchUrl);

  fetchWithCache(fetchUrl)
    .then(function (html) {
      console.log('Collection response received, length:', html ? html.length : 0);
      if (!html) {
        var errMsg =
          (panel && panel.getAttribute('data-msg-load-collection-error')) ||
          'Unable to load collection. Please try again.';
        showErrorFeedback(panel, errMsg);
        return;
      }

      function render() {
        // Inject into the content div, NOT the whole panel, to save the close button!
        var contentArea = panel.querySelector('.immersive-store__panel-content');
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        panel.setAttribute('data-open', 'true');
        openDialogFocus(panel, _panelTrigger);

        trackImmersiveEvent('panel_opened', {
          panel_type: 'collection',
          collection_handle: collectionHandle,
        });

        // Setup variant buttons after content is injected
        setupVariantButtons(panel);

        // Setup buy now form handler
        setupBuyNowForm(panel);

        // Setup image parallax on product cards
        setupImageParallax(panel);

        // Setup virtual try-on
        setupVirtualTryOn(panel);

        // Sync wishlist toggle states in newly injected collection content
        syncAllWishlistToggles(panel);

        // Setup click handlers for this panel
        panel.onclick = function (event) {
          // 1. Handle backdrop click (clicking outside content)
          if (event.target === panel) {
            closePanel();
            return;
          }

          // 2. Handle Close Button
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel();
            return;
          }

          // 3. Handle Product Card Click
          var card = event.target.closest('.immersive-product-card');
          if (!card) return;

          var handle = card.getAttribute('data-product-handle');
          if (!handle) return;

          event.preventDefault();
          openProductPanel(handle, collectionHandle);
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('Error fetching collection:', collectionHandle, error);
      var errMsg =
        (panel && panel.getAttribute('data-msg-load-collection-error')) ||
        'Unable to load collection. Please check your connection and try again.';
      showErrorFeedback(panel, errMsg);
    });
}

function openProductPanel(productHandle, collectionHandle) {
  saveState({ panel: 'product', product: productHandle, collection: collectionHandle || null });
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  _panelTrigger = document.activeElement;
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');

  // Always fetch from product URL - the product object is only available there
  var fetchUrl = shopRoot + 'products/' + productHandle + '?section_id=glass-product';

  // Pass collection handle as a parameter so the back button works
  if (collectionHandle) {
    fetchUrl += '&collection_handle=' + collectionHandle;
  }

  console.log('Fetching product:', productHandle, 'from collection:', collectionHandle, 'URL:', fetchUrl);

  fetchWithCache(fetchUrl)
    .then(function (html) {
      console.log('Product response received, length:', html ? html.length : 0);
      if (!html) {
        var errMsg =
          (panel && panel.getAttribute('data-msg-load-product-error')) ||
          'Unable to load product details. Please try again.';
        showErrorFeedback(panel, errMsg);
        return;
      }

      function render() {
        var contentArea = panel.querySelector('.immersive-store__panel-content');
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        panel.setAttribute('data-open', 'true');
        openDialogFocus(panel, _panelTrigger);

        trackImmersiveEvent('panel_opened', {
          panel_type: 'product',
          product_handle: productHandle,
          collection_handle: collectionHandle || null,
        });

        // Setup variant buttons after content is injected
        setupVariantButtons(panel);

        // Setup buy now form handler
        setupBuyNowForm(panel);

        // Setup media thumbnail switching
        setupMediaThumbs(panel);

        // Setup image parallax on product cards
        setupImageParallax(panel);

        // Setup share button
        setupShareButton(panel);

        // Setup delivery dates
        setupDeliveryDates(panel);

        // Setup virtual try-on
        setupVirtualTryOn(panel);

        // Load dynamic product recommendations into [data-related-root]
        loadProductRecommendations(panel);

        // Cache product data for wishlist panel and sync toggle state
        cacheWishlistProduct(productHandle, panel);
        syncAllWishlistToggles(panel);

        panel.onclick = function (event) {
          // 1. Handle backdrop click
          if (event.target === panel) {
            closePanel();
            return;
          }

          // 2. Handle Close Button
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel();
            return;
          }

          // 3. Handle Back Button (PDP -> Collection)
          var backButton = event.target.closest('.glass-product-section__back');
          if (backButton) {
            var backHandle = backButton.getAttribute('data-collection-handle');
            if (backHandle) {
              event.preventDefault();
              openCollectionPanel(backHandle);
            }
            return;
          }

          // 4. Handle Related Product Click (and any <a data-product-handle> link)
          var relatedItem = event.target.closest('.glass-product-section__related-item');
          if (relatedItem) {
            var relatedHandle = relatedItem.getAttribute('data-product-handle');
            if (relatedHandle) {
              event.preventDefault();
              openProductPanel(relatedHandle, collectionHandle);
            }
            return;
          }

          // 5. Intercept any <a data-product-handle> link (e.g. product card title/image)
          var productLink = event.target.closest('a[data-product-handle]');
          if (productLink) {
            var linkHandle = productLink.getAttribute('data-product-handle');
            if (linkHandle) {
              event.preventDefault();
              openProductPanel(linkHandle, collectionHandle);
            }
            return;
          }

          // 6. Intercept recommendation card links (Dawn card-product uses plain /products/{handle} hrefs)
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
      console.error('Error fetching product:', error);
      var errMsg =
        (panel && panel.getAttribute('data-msg-load-product-error')) ||
        'Unable to load product. Please check your connection and try again.';
      showErrorFeedback(panel, errMsg);
    });
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
}

function syncAllWishlistToggles(root) {
  var toggles = root.querySelectorAll('[data-wishlist-toggle]');
  for (var i = 0; i < toggles.length; i++) {
    var toggle = toggles[i];
    var handle = toggle.getAttribute('data-product-handle');
    var isSaved = handle && _wishlistItems.indexOf(handle) !== -1;
    toggle.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    toggle.classList.toggle('is-saved', !!isSaved);
    var labelSave = toggle.getAttribute('data-label-save');
    var labelSaved = toggle.getAttribute('data-label-saved');
    if (labelSave && labelSaved) {
      toggle.setAttribute('aria-label', isSaved ? labelSaved : labelSave);
    }
  }
}

function addToWishlist(handle, source) {
  if (!handle || _wishlistItems.indexOf(handle) !== -1) return;
  _wishlistItems.push(handle);
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEvent('wishlist_add', { product_handle: handle, source: source || 'unknown' });
}

function removeFromWishlist(handle, source) {
  if (!handle) return;
  _wishlistItems = _wishlistItems.filter(function (h) {
    return h !== handle;
  });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: source || 'unknown' });
}

function toggleWishlistItem(handle, source) {
  if (_wishlistItems.indexOf(handle) !== -1) {
    removeFromWishlist(handle, source);
  } else {
    addToWishlist(handle, source);
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

  var emptyMsg = panelEl.getAttribute('data-msg-empty') || "You haven't saved any products yet.";
  var viewMsg = panelEl.getAttribute('data-msg-view') || 'View product';
  var removeMsg = panelEl.getAttribute('data-msg-remove') || 'Remove from wishlist';

  if (_wishlistItems.length === 0) {
    body.innerHTML = '<p data-wishlist-empty>' + emptyMsg + '</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < _wishlistItems.length; i++) {
    var handle = _wishlistItems[i];
    var cached = _wishlistProductCache[handle] || {};
    var title = cached.title || handle;
    var price = cached.price || '';
    var imgSrc = cached.imageSrc || '';
    var imgHtml = imgSrc
      ? '<img src="' + imgSrc + '" alt="' + title.replace(/"/g, '&quot;') + '" loading="lazy" width="80" height="107">'
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
  trackImmersiveEvent('wishlist_panel_opened', { item_count: _wishlistItems.length });
}

function closeWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  if (panel._wlTrapFocus) panel.removeEventListener('keydown', panel._wlTrapFocus);
  if (panel._wlEscape) panel.removeEventListener('keydown', panel._wlEscape);
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
    _wishlistItems = Array.isArray(stored) ? stored : [];
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
      if (handle) toggleWishlistItem(handle, source);
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

function bindImmersiveInit() {
  if (!document.getElementById('immersive-canvas')) return;
  // Defer until after first paint so the canvas has real layout dimensions
  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();
    initWishlist();
    bindCookieBanner();
  });
}

// Guard against double-init (theme editor fires section events rapidly)
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
    Object.keys(textureCache).forEach(function (k) {
      try {
        if (textureCache[k].base) textureCache[k].base.dispose();
        if (textureCache[k].depth) textureCache[k].depth.dispose();
      } catch (e) {}
    });
    textureCache = {};
    contentCache = {};
  }

  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();
    initWishlist();
    bindCookieBanner();

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

// Initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeBindImmersiveInit);
} else {
  safeBindImmersiveInit();
}

// Theme editor: re-init when the canvas section is reloaded or selected
document.addEventListener('shopify:section:load', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false; // force re-init on explicit section reload
    safeBindImmersiveInit();
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
