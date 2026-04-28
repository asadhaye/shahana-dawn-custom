/**
 * Room Manager - Room transitions and hotspots
 * TODO: Extract from immersive-store.js lines ~800-1200
 * Functions: goToRoom, loadRoomTextures, renderHotspots
 * Also supports lazy-loading of editorial UI modules for editorial rooms.
 */

// Lazy-load helper for editorial modules
var _editorialScriptsLoaded = false;
function _loadScript(url) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[src="' + url + '"]')) {
      return resolve();
    }
    var s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function _ensureEditorialScriptsLoaded() {
  if (_editorialScriptsLoaded) return Promise.resolve();
  // Attempt to load the editorial modules if they aren't loaded yet
  var needsLoading = typeof window.enterEditorialMode !== 'function';
  if (!needsLoading) {
    _editorialScriptsLoaded = true;
    return Promise.resolve();
  }
  return Promise.all([
    _loadScript('/assets/immersive/editorial/hero-parallax.js'),
    _loadScript('/assets/immersive/editorial/editorial-mode.js'),
  ])
    .then(function () {
      _editorialScriptsLoaded = true;
    })
    .catch(function () {
      _editorialScriptsLoaded = false;
      throw new Error('Failed to load editorial modules');
    });
}

/**
 * STORE_ROOMS — Default room configuration
 *
 * These are fallback defaults. Merchant-configured images from the theme editor
 * (immersive-rooms-config JSON) will override these values.
 *
 * Merchants can customize:
 * - Base images (desktop & mobile) for each room
 * - Depth maps (desktop & mobile) for parallax effects
 * - Collection hotspots and labels
 * - Room mood colors
 */
var STORE_ROOMS = {
  storefront: {
    baseTextureUrl: null, // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0a0f', blob1: '#1a1025', blob2: '#0d0d1a' },
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
    baseTextureUrl: null, // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0f0a08', blob1: '#2a1a10', blob2: '#1a0f0a' },
    hotspots: [
      { x: 20, y: 35, label: 'Designer Houses', targetRoom: 'designer_houses', mobileX: 15, mobileY: 80 },
      { x: 50, y: 35, label: 'Occasions', targetRoom: 'occasions', mobileX: 50, mobileY: 80 },
      { x: 80, y: 35, label: 'Featured Collections', targetRoom: 'featured_collections', mobileX: 85, mobileY: 80 },
    ],
  },

  designer_houses: {
    baseTextureUrl: null, // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#080a12', blob1: '#101828', blob2: '#0a1020' },
    hotspots: [
      { x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' },
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 90, label: 'Back to lounge', targetRoom: 'lounge' },
    ],
  },

  occasions: {
    baseTextureUrl: null, // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0810', blob1: '#1e1028', blob2: '#120a1e' },
    hotspots: [
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
    ],
  },

  featured_collections: {
    baseTextureUrl: null, // Merchant configurable
    mobileBaseTextureUrl: null,
    depthMapUrl: null,
    mobileDepthMapUrl: null,
    mood: { background: '#0a0a08', blob1: '#1e1e10', blob2: '#141408' },
    hotspots: [
      // Collection hotspots configured by merchant in theme editor
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ],
  },
};

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

/**
 * Navigate to a room
 * @param {string} roomKey - The room to navigate to
 * @param {boolean} initial - Whether this is the initial room load
 * @param {boolean} fromBack - Whether this navigation is from the back button (don't push to stack)
 */
function goToRoom(roomKey, initial, fromBack) {
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);

  // If no textures are configured for this room, ABORT navigation to prevent state-image mismatch
  // This ensures we never see one room's hotspots over another room's background
  if (!roomData) {
    console.error('[Immersive] Cannot navigate to room without textures:', roomKey);
    return;
  }

  // Push current room onto navigation stack (unless initial load or back navigation)
  if (!initial && !fromBack && immersiveState.currentRoom !== roomKey) {
    immersiveState.navigationStack.push(immersiveState.currentRoom);
    saveState({
      room: roomKey,
      panel: null,
      product: null,
      collection: null,
      navigationStack: immersiveState.navigationStack,
    });
  } else {
    saveState({ room: roomKey, panel: null, product: null, collection: null });
  }

  immersiveState.currentRoom = roomKey;
  immersiveState.mode = 'showroom';
  immersiveState.editorialRoom = null;

  // Update back button visibility after room change
  if (typeof updateBackButtonVisibility === 'function') {
    updateBackButtonVisibility();
  }

  // Track room visit for recommender and clear any active countdown timers
  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

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

        // [NEW] Snap colour uniforms and reset drift on crossfade completion
        if (typeof ImmersiveAtmosphere !== 'undefined') {
          ImmersiveAtmosphere.snapCurrentToNext(uniforms);
        }
        driftTarget = 0;

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

/**
 * Navigate back to the previous room in the navigation stack.
 * If a panel is currently open, the first press closes the panel only
 * and stays in the current room. A second press then navigates back.
 */
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
  var fromRoom = immersiveState.currentRoom;

  // Navigate to previous room with fromBack=true to prevent pushing onto stack
  goToRoom(previousRoom, false, true);

  // Track analytics event
  if (typeof trackImmersiveEvent === 'function') {
    trackImmersiveEvent('navigation_back', {
      from_room: fromRoom,
      to_room: previousRoom,
      stack_depth: immersiveState.navigationStack.length,
    });
  }
}

/**
 * Update back button visibility based on navigation stack state
 */
function updateBackButtonVisibility() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;

  var hasHistory = immersiveState.navigationStack && immersiveState.navigationStack.length > 0;

  if (hasHistory) {
    // Show and enable back button
    backBtn.hidden = false;
    backBtn.disabled = false;
  } else {
    // Hide and disable back button
    backBtn.hidden = true;
    backBtn.disabled = true;
  }
}

/**
 * Check if back navigation is possible
 * @returns {boolean} True if navigation stack has items, false otherwise
 */
function canNavigateBack() {
  return immersiveState.navigationStack && immersiveState.navigationStack.length > 0;
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
          // Ensure editorial modules are loaded before entering editorial mode
          _ensureEditorialScriptsLoaded()
            .then(function () {
              enterEditorialMode(hotspot.targetEditorialRoom, button);
            })
            .catch(function () {
              // Fallback: attempt to enter editorial mode anyway; if modules fail to load, we stay in 3D view
              enterEditorialMode(hotspot.targetEditorialRoom, button);
            });
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

/**
 * Room Manager Public API
 * Exposed functions:
 * - goToRoom(roomKey, initial) - Navigate to a room
 * - preloadRoom(roomKey) - Preload room textures
 * - renderHotspots(roomKey) - Render hotspots for a room
 * - updateRoomBadge(roomKey) - Update room badge UI
 * - loadRoomTextures(roomData, callback) - Load room textures
 * - getRoomTextureUrls(roomKey) - Get texture URLs for a room
 * - updateCameraForMode() - Update camera settings based on mode
 * - syncVisitedRooms() - Sync visited rooms UI
 * - STORE_ROOMS - Room configuration constant
 */

// Expose public API to global scope
window.ImmersiveRoomManager = {
  goToRoom: goToRoom,
  preloadRoom: preloadRoom,
  renderHotspots: renderHotspots,
  updateRoomBadge: updateRoomBadge,
  loadRoomTextures: loadRoomTextures,
  getRoomTextureUrls: getRoomTextureUrls,
  updateCameraForMode: updateCameraForMode,
  syncVisitedRooms: syncVisitedRooms,
  navigateBack: navigateBack,
  canNavigateBack: canNavigateBack,
  updateBackButtonVisibility: updateBackButtonVisibility,
  STORE_ROOMS: STORE_ROOMS,
};

// Backward-compatible global aliases for critical functions
window.goToRoom = goToRoom;
window.renderHotspots = renderHotspots;
window.navigateBack = navigateBack;
window.canNavigateBack = canNavigateBack;
