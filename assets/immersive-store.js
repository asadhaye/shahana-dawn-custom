// ============================================================================
// UTILITIES (Extracted to modules - Phase 2)
// ============================================================================
// Fetch utilities: window.ImmersiveFetch
// Analytics utilities: window.ImmersiveAnalytics
// DOM utilities: window.ImmersiveDOM
// Skeleton utilities: window.ImmersiveSkeleton
// Load order: These modules must be loaded before immersive-store.js

// Extracted null block to assets/immersive/core/room-manager.js

// Feature flag: disable editor overrides by default for safety
var immersiveEditorOverridesEnabled = false;
try {
  immersiveEditorOverridesEnabled = window && window.__IMMERSIVE_EDITOR_OVERRIDES_ENABLED === true;
} catch (e) {
  // If the flag cannot be read, default to disabled for safety
  immersiveEditorOverridesEnabled = false;
}

(function () {
  // Note: Fallback path left disabled by default to avoid SEO impact.
  // 3D immersive canvas is optional enhancement; 2D content remains indexable.
})();

// Merge theme-editor-configured room data (from section JSON block) into STORE_ROOMS
(function mergeDynamicRoomConfig() {
  if (!immersiveEditorOverridesEnabled) {
    console.log('[Immersive] Editor overrides are disabled by feature flag. Using canonical STORE_ROOMS only.');
    return;
  }
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

// Extracted immersiveState to immersive/core/state-manager.js

// Friction point analytics extracted to assets/immersive/utils/analytics.js

var frictionThreshold = 10; // Log warning every N occurrences

// Extracted trackFrictionPoint (Phase 2 Utility)

// Extracted getFrictionSummary (Phase 2 Utility)

// Expose friction summary to console for debugging
if (typeof window !== 'undefined') {
  window.__immersiveFrictionSummary = getFrictionSummary;
}

// Locale-aware root for building URLs (supports /fr/, /en-us/, etc.)
var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
if (shopRoot.slice(-1) !== '/') shopRoot += '/';

// Reduced motion detection
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Depth-based parallax refinements (Codrops-inspired)
// - If a depth map is provided for the current room, apply a light parallax
//   offset to the texture coordinates based on mouse movement.
// - Respect prefers-reduced-motion by skipping live offset updates.
// ---------------------------------------------------------------------------
var depthParallaxEnabled = false;
var depthParallaxFactor = 0.08; // offset scale for parallax effect
function _initDepthParallaxForCurrentRoom() {
  if (!planeMesh || !planeMesh.material || !planeMesh.material.map) return;
  var room = STORE_ROOMS && currentRoomKey ? STORE_ROOMS[currentRoomKey] || {} : {};
  var depthMap = room.depthMapUrl || room.maybeDepthMapUrl;
  depthParallaxEnabled = !!depthMap;
  // If we have a depth map, ensure the texture supports offset and wrap
  try {
    if (planeMesh.material.map) {
      planeMesh.material.map.wrapS = planeMesh.material.map.wrapT = THREE.RepeatWrapping;
      planeMesh.material.map.repeat.set(1, 1);
      planeMesh.material.map.needsUpdate = true;
    }
  } catch (e) {
    // ignore; may be using non-THREE texture API in some builds
  }
}

function _applyDepthParallax(e) {
  if (!depthParallaxEnabled || reduceMotion) return;
  if (!planeMesh || !planeMesh.material || !planeMesh.material.map) return;
  try {
    var t = planeMesh.material.map;
    // Normalize mouse to [-1, 1]
    var nx = (e.clientX / window.innerWidth) * 2 - 1;
    var ny = -(e.clientY / window.innerHeight) * 2 + 1;
    // Apply a small offset based on the depth factor
    t.offset.x = nx * depthParallaxFactor;
    t.offset.y = ny * depthParallaxFactor;
    t.needsUpdate = true;
  } catch (err) {
    // ignore if texture/plane not yet ready
  }
}

// Hook into mousemove to drive depth parallax when available
document.addEventListener('mousemove', _applyDepthParallax, { passive: true });

// Initialize when the page has loaded (texture/plane may not be ready immediately)
window.addEventListener('load', function () {
  _initDepthParallaxForCurrentRoom();
});

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

// Parallax runs even with reduceMotion — CSS animations are suppressed separately
// Slightly reduce strength on mobile for performance
var parallaxStrength = usesMobileImg ? 0.02 : 0.06;

// ─────────────────────────────────────────────────────────────
// Analytics helpers (GA4 via dataLayer + Meta Pixel via fbq)
// ─────────────────────────────────────────────────────────────
// Extracted trackImmersiveEvent (Phase 2 Utility)

// Extracted state persistence keys to immersive/core/state-manager.js

var _wishlistItems = [];
var _wishlistProductCache = {};
var _wishlistPanelTrigger = null;
var _activeHotspots = []; // To track hotspot proximity scaling

// Extracted state functions to immersive/core/state-manager.js

// Extracted shaders to assets/immersive/core/webgl-engine.js

// Extracted getRoomTextureUrls to assets/immersive/core/room-manager.js

// Preload a room's textures in the background (called on hotspot hover)
// Extracted preloadRoom to assets/immersive/core/room-manager.js

// Extracted showWelcomeToast to assets/immersive/core/room-manager.js

// Extracted _dismissWelcomeToast to assets/immersive/core/room-manager.js

// Extracted initImmersiveScene to assets/immersive/core/webgl-engine.js

// Extracted isWebGLSupported to assets/immersive/core/webgl-engine.js

// Extracted showWebGLFallback to assets/immersive/core/webgl-engine.js

// Extracted showLoader to assets/immersive/core/webgl-engine.js

// Extracted hideLoader to assets/immersive/core/webgl-engine.js

var mouseTarget = { x: 0.5, y: 0.5 };
var mouseCurrent = { x: 0.5, y: 0.5 };
var lerpFactor = 0.08;

// Extracted handleMouseMove to assets/immersive/core/webgl-engine.js

// Extracted handleResize to assets/immersive/core/webgl-engine.js

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

// Extracted cacheEditorialOverlay to assets/immersive/core/webgl-engine.js

// ---------------------------------------------------------------------------
// Tilt-control experiment functions (opt-in, mobile-only)
// These provide subtle gyroscope-based scene influence on mobile devices.
// ---------------------------------------------------------------------------

/**
 * Handles device orientation events and stores raw tilt values.
 * @param {DeviceOrientationEvent} event - The device orientation event.
 */
// Extracted handleDeviceOrientation to assets/immersive/core/webgl-engine.js

/**
 * Enables tilt control after user gesture (required for iOS permission).
 * Guards against non-mobile, reduceMotion, and missing API.
 */
// Extracted enableTiltControl to assets/immersive/core/webgl-engine.js

/**
 * Disables tilt control and resets all tilt state.
 */
// Extracted disableTiltControl to assets/immersive/core/webgl-engine.js

/**
 * Initializes the tilt toggle button listener.
 * Looks for [data-immersive-tilt-toggle] in the DOM.
 */
// Extracted initTiltControlToggle to assets/immersive/core/webgl-engine.js

// Extracted animate to assets/immersive/core/webgl-engine.js

// Extracted updateRoomBadge to assets/immersive/core/room-manager.js

// Extracted goToRoom to assets/immersive/core/room-manager.js

// Extracted _startRoomTextureLoad to assets/immersive/core/room-manager.js

// Extracted updateCameraForMode to assets/immersive/core/room-manager.js

// Extracted loadRoomTextures to assets/immersive/core/room-manager.js

// Extracted isCachedTexture to assets/immersive/core/room-manager.js

// Extracted renderHotspots to assets/immersive/core/room-manager.js

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
// Extracted openDialogFocus (Phase 2 Utility)

/**
 * Restores focus to the element that triggered the panel open.
 * Cleans up Escape and Tab key listeners.
 */
// Extracted closeDialogFocus (Phase 2 Utility)

// ─────────────────────────────────────────────────────────────
// Skeleton Loader Helpers - Loading states for content
// ─────────────────────────────────────────────────────────────

// Extracted renderSkeletonGrid (Phase 2 Utility)

// Extracted renderSkeletonProduct (Phase 2 Utility)

// Extracted renderSkeletonRoom (Phase 2 Utility)

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

  // Track empty collection exit when user takes action
  trackFrictionPoint('empty_collection_exit', {
    action: action,
    room: immersiveState.currentRoom,
  });

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
        closePanel(wishlistPanel, 'button');
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
// Extracted to assets/immersive/utils/dom.js

// ─────────────────────────────────────────────────────────────
// Helper: Fade out content with smooth transition
// ─────────────────────────────────────────────────────────────
// Extracted to assets/immersive/utils/dom.js

// ─────────────────────────────────────────────────────────────
// Helper: Get icon SVG for search result type
// ─────────────────────────────────────────────────────────────
// Extracted getSearchResultIcon to assets/immersive/features/search.js

// ─────────────────────────────────────────────────────────────
// Helper: Set the room label in the panel header
// ─────────────────────────────────────────────────────────────
// Extracted setPanelRoomLabel to assets/immersive/panels/glass-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Open a panel with focus management, ARIA, and slide-up animation
// ─────────────────────────────────────────────────────────────
// Extracted openPanel to assets/immersive/panels/glass-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Close a panel/overlay with consistent behavior
// ─────────────────────────────────────────────────────────────
// Closes a panel, removes focus trap, restores focus to trigger,
// and applies CSS classes for transition.
// Extracted closePanel to assets/immersive/panels/glass-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Open a glass panel with Section Rendering API content
// ─────────────────────────────────────────────────────────────
// Generic helper for opening product/collection/search panels.
// Accepts fetchUrl, panelId, and renderCallback for panel-specific setup.

// ─────────────────────────────────────────────────────────────
// Helper: Open glass panel using Section Rendering API
// ─────────────────────────────────────────────────────────────
// Uses fetchSectionHtml for consistent JSON-based Section Rendering.
// Accepts path, sectionId, extraParams, panelId, and renderCallback.

// ─────────────────────────────────────────────────────────────
// Helper: Open an overlay with Section Rendering API content
// ─────────────────────────────────────────────────────────────
// Generic helper for opening editorial overlays.
// Handles view transitions, focus management, and escape handling.
// Extracted openOverlay to assets/immersive/panels/glass-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Close an overlay with consistent behavior
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for a product
// ─────────────────────────────────────────────────────────────
// Extracted openProductPanel to assets/immersive/panels/product-panel.js

// ─────────────────────────────────────────────────────────────
// Browsing signals — personalized room suggestions (Feature 6)
// ─────────────────────────────────────────────────────────────
// Extracted to assets/immersive/utils/analytics.js

// Extracted getRelevantRooms to assets/immersive/core/room-manager.js

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for a collection
// ─────────────────────────────────────────────────────────────
// Extracted openCollectionPanel to assets/immersive/panels/collection-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Open the glass panel for search results
// ─────────────────────────────────────────────────────────────
// Extracted openSearchPanel to assets/immersive/features/search.js

// ─────────────────────────────────────────────────────────────
// Editorial overlay entry point (single, canonical implementation)
// ─────────────────────────────────────────────────────────────
// Extracted enterEditorialMode to assets/immersive/editorial/editorial-mode.js

// ─────────────────────────────────────────────────────────────
// Helper: Perform editorial overlay UI activation
// ─────────────────────────────────────────────────────────────
// Extracted performEditorialUIActivation to assets/immersive/editorial/editorial-mode.js

// ─────────────────────────────────────────────────────────────
// Editorial overlay exit point (paired with enterEditorialMode)
// ─────────────────────────────────────────────────────────────
// Extracted exitEditorialMode to assets/immersive/editorial/editorial-mode.js

// Extracted fetchWithCache (Phase 2 Utility)

// ─────────────────────────────────────────────────────────────
// Helper: Transition panel content with optional view transition
// ─────────────────────────────────────────────────────────────
// Wraps content rendering in a view transition if supported.
// Falls back to direct rendering on older browsers.
// Extracted transitionPanelContent to assets/immersive/panels/glass-panel.js

// ─────────────────────────────────────────────────────────────
// Helper: Fetch Section Rendering API response
// ─────────────────────────────────────────────────────────────
// Builds a URL with sections parameter and optional extra params,
// fetches the JSON response, and returns the HTML for the given section.
// Uses ?sections= (JSON response) for consistent error handling.
// Returns a Promise that resolves to the HTML string or null on error.
// Extracted fetchSectionHtml (Phase 2 Utility)

// Extracted setupVariantButtons to assets/immersive/panels/product-panel.js

// Extracted setupBuyNowForm to assets/immersive/panels/product-panel.js

// Extracted setupMediaThumbs to assets/immersive/panels/product-panel.js

// Extracted setupImageParallax to assets/immersive/panels/product-panel.js

// Extracted setupDeliveryDates to assets/immersive/panels/product-panel.js

// Extracted setupShareButton to assets/immersive/panels/product-panel.js

// Extracted setupVirtualTryOn to assets/immersive/panels/product-panel.js

// Extracted showCartFeedback to assets/immersive/panels/product-panel.js

// Extracted showErrorFeedback to assets/immersive/panels/product-panel.js

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

// Extracted getWishlist to assets/immersive/panels/wishlist-panel.js

// Extracted _persistWishlist to assets/immersive/panels/wishlist-panel.js

// Extracted updateWishlistBadge to assets/immersive/panels/wishlist-panel.js

// Extracted syncAllWishlistToggles to assets/immersive/panels/wishlist-panel.js

// Extracted _triggerHeartPulse to assets/immersive/panels/wishlist-panel.js

// Extracted _flyToWishlist to assets/immersive/panels/wishlist-panel.js

// Extracted addToWishlist to assets/immersive/panels/wishlist-panel.js

// Extracted removeFromWishlist to assets/immersive/panels/wishlist-panel.js

// Extracted toggleWishlistItem to assets/immersive/panels/wishlist-panel.js

// Extracted cacheWishlistProduct to assets/immersive/panels/wishlist-panel.js

// Extracted renderWishlistPanel to assets/immersive/panels/wishlist-panel.js

// Extracted openWishlistPanel to assets/immersive/panels/wishlist-panel.js

// Extracted closeWishlistPanel to assets/immersive/panels/wishlist-panel.js

// Extracted initWishlist to assets/immersive/panels/wishlist-panel.js

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
      // Track friction point when user exits 3D experience
      trackFrictionPoint('back_to_2d_from_room', {
        from_room: immersiveState.currentRoom,
        from_mode: immersiveState.mode,
      });
      clearImmersivePreference();
    });
  }

  // 1c. Wire back button — navigates to previous room in navigation stack
  var backBtn = document.querySelector('[data-immersive-back]');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      navigateBack();
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

// Extracted initImmersiveSearch to assets/immersive/features/search.js

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

  // Wire Cart button → navigate to immersive cart page
  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      exitGuidedMode();

      // Navigate to the immersive cart page
      window.location.href = '/pages/immersive-cart';

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
  };

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

// Extracted initImmersiveGestures to assets/immersive/features/gestures.js

// ============================================================
// ImmersiveFilters — smart filters inside collection panels
// ============================================================

var FILTER_ALLOWED_PARAMS = ['filter.p.m.custom.color[]', 'filter.v.price.gte', 'filter.v.price.lte', 'sort_by'];

// Extracted saveFilters to assets/immersive/features/filters.js

// Extracted loadFilters to assets/immersive/features/filters.js

// Extracted buildFilterUrl to assets/immersive/features/filters.js

// Extracted initImmersiveFilters to assets/immersive/features/filters.js

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

// Extracted getRecommendation to assets/immersive/features/room-recommender.js

// Extracted evaluateRoomRecommendation to assets/immersive/features/room-recommender.js

// Extracted showRoomRecommendation to assets/immersive/features/room-recommender.js

// Extracted initImmersiveRoomRecommender to assets/immersive/features/room-recommender.js

// ============================================================
// ImmersiveQuickAdd — quick add to cart from product cards
// ============================================================

var _quickAddModal = null;
var _quickAddTrigger = null;

// Extracted initImmersiveQuickAdd to assets/immersive/features/quick-add.js

// Extracted openQuickAdd to assets/immersive/features/quick-add.js

// Extracted renderQuickAddModal to assets/immersive/features/quick-add.js

// Extracted addToCartQuickAdd to assets/immersive/features/quick-add.js

// Extracted closeQuickAdd to assets/immersive/features/quick-add.js

function formatMoney(cents) {
  if (!cents && cents !== 0) return '';
  return 'PKR ' + (cents / 100).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Extracted trackRoomVisit to assets/immersive/features/room-recommender.js

// ============================================================
// ImmersiveLimitedTime — countdown timers, low-stock badges, flash sale
// ============================================================

var _limitedTimeIntervals = [];
var _lowStockThreshold = 5;

// Extracted computeCountdown to assets/immersive/features/limited-time.js

// Extracted renderCountdown to assets/immersive/features/limited-time.js

// Extracted pad to assets/immersive/features/limited-time.js

// Extracted renderLowStockBadge to assets/immersive/features/limited-time.js

// Extracted scanLimitedTimeCards to assets/immersive/features/limited-time.js

// Extracted showFlashSaleAlert to assets/immersive/features/limited-time.js

// Extracted clearLimitedTimeIntervals to assets/immersive/features/limited-time.js

// Extracted initImmersiveLimitedTime to assets/immersive/features/limited-time.js

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
// Extracted to assets/immersive/utils/dom.js

// ─────────────────────────────────────────────────────────────
// Active Filter Chips - Visual filter state indicators
// ─────────────────────────────────────────────────────────────

/**
 * Render active filter chips based on current filter state
 * @param {Object} filterState - Current filter state object
 * @returns {string} HTML string for filter chips
 */
// Extracted renderActiveFilterChips to assets/immersive/features/filters.js

/**
 * Remove a specific filter chip and update the collection
 * @param {string} filterKey - The filter key to remove (e.g., "color:red", "price", "sort")
 * @param {Object} currentState - Current filter state
 * @param {Function} applyFiltersCallback - Callback to apply updated filters
 */
// Extracted removeFilterChip to assets/immersive/features/filters.js

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

    // UX Enhancement modules
    initImmersiveSearch();
    initImmersiveBottomNav();
    initImmersiveGestures();
    initEditorialScrollReveal();
    initEditorialBackToLounge();
    initProductCardTilt();
    initGuidedMode();
    initImmersiveNextActions();
    initImmersiveRoomRecommender();
    initImmersiveQuickAdd();
    initImmersiveLimitedTime();

    // Shopping journey handlers are managed by modular files:
    // - assets/immersive/panels/collection-panel.js (openCollectionPanel)
    // - assets/immersive/panels/product-panel.js (openProductPanel)
    // - assets/immersive/editorial/editorial-mode.js (enterEditorialMode, exitEditorialMode)
    // - assets/immersive/utils/fetch.js (fetchWithCache, fetchSectionHtml)
    // These are loaded in layout/theme.liquid and expose functions globally

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

// Extracted _esrEaseOutParallax to assets/immersive/editorial/scroll-reveal.js

// Extracted _esrTrigger to assets/immersive/editorial/scroll-reveal.js

// Extracted _esrOnWheel to assets/immersive/editorial/scroll-reveal.js

// Extracted initEditorialScrollReveal to assets/immersive/editorial/scroll-reveal.js

// Called from ImmersiveGestures swipe-down path (panel not open)
// Extracted _esrOnSwipeDown to assets/immersive/editorial/scroll-reveal.js

// ============================================================
// EditorialBackToLounge
// ============================================================

// Extracted updateBackToLoungeVisibility to assets/immersive/editorial/editorial-mode.js

// Extracted initEditorialBackToLounge to assets/immersive/editorial/editorial-mode.js

// ============================================================
// VisitedRoomsIndicator
// ============================================================

// Extracted syncVisitedRooms to assets/immersive/core/room-manager.js

// ============================================================
// EditorialHeroParallax
// ============================================================

// Extracted _ehpOnScroll to assets/immersive/editorial/hero-parallax.js

// Extracted _ehpLoop to assets/immersive/editorial/hero-parallax.js

// Extracted initEditorialHeroParallax to assets/immersive/editorial/hero-parallax.js

// Extracted destroyEditorialHeroParallax to assets/immersive/editorial/hero-parallax.js

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

var GUIDED_IDLE_MS = 30000; // 30s before auto-advance — give users time to explore
var GUIDED_PROMPT_MS = 20000; // 20s before showing soft prompt

// Steps: 0=lounge, 1=editorial, 2=collection, 3=product
var GUIDED_STEPS = ['lounge', 'editorial', 'collection', 'product'];

// Extracted initGuidedMode to assets/immersive/guided/guided-mode.js

// Extracted activateGuidedMode to assets/immersive/guided/guided-mode.js

// Extracted exitGuidedMode to assets/immersive/guided/guided-mode.js

// Extracted _guidedStartIdleTimer to assets/immersive/guided/guided-mode.js

// Extracted _guidedResetIdleTimer to assets/immersive/guided/guided-mode.js

// Extracted _guidedAdvance to assets/immersive/guided/guided-mode.js

// Extracted _guidedGetFirstCollection to assets/immersive/guided/guided-mode.js

// Extracted showGuidedPrompt to assets/immersive/guided/guided-mode.js

// Extracted hideGuidedPrompt to assets/immersive/guided/guided-mode.js

// Extracted _showGuidedProgress to assets/immersive/guided/guided-mode.js

// Extracted _hideGuidedProgress to assets/immersive/guided/guided-mode.js

// Extracted _updateGuidedDots to assets/immersive/guided/guided-mode.js

/**
 * ============================================================================
 * SHOPPING JOURNEY FUNCTIONS
 * ============================================================================
 * Core functions for the complete immersive shopping journey:
 * - Panel management (open/close)
 * - Content fetching via Section Rendering API
 * - Feedback and notifications
 * - Cart management
 */

/**
 * Fetch content with caching
 * @param {string} url - URL to fetch
 * @param {Function} callback - Callback with HTML response
 */
var contentCache = {};
