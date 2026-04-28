/**
 * WebGL Engine - Three.js scene management
 * Extracted from immersive-store.js
 */

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
  uniform vec3  uBgColor;
  uniform vec3  uBlob1Color;
  uniform vec3  uBlob2Color;
  uniform vec3  uBgColorNext;
  uniform vec3  uBlob1ColorNext;
  uniform vec3  uBlob2ColorNext;
  uniform float uVelocityIntensity;
  uniform float uReducedMotion;
  uniform float uPixelTransition;
  uniform vec2  uResolution;

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
    float t = clamp(uTransitionProgress, 0.0, 1.0);

    // [NEW] Mood background layer — computed analytically before parallax sampling
    vec3 bgBlended    = mix(uBgColor,    uBgColorNext,    t);
    vec3 blob1Blended = mix(uBlob1Color, uBlob1ColorNext, t);
    vec3 blob2Blended = mix(uBlob2Color, uBlob2ColorNext, t);

    float animTime = uTime * (1.0 - uReducedMotion);
    vec2 blob1Center = vec2(0.3 + sin(animTime * 0.23) * 0.15, 0.4 + cos(animTime * 0.17) * 0.12);
    vec2 blob2Center = vec2(0.7 + cos(animTime * 0.19) * 0.13, 0.6 + sin(animTime * 0.21) * 0.14);
    float blob1 = 1.0 - smoothstep(0.0, 0.45, length(vUv - blob1Center));
    float blob2 = 1.0 - smoothstep(0.0, 0.40, length(vUv - blob2Center));
    vec3 moodBg = bgBlended
      + clamp(blob1Blended * blob1, 0.0, 1.0)
      + clamp(blob2Blended * blob2, 0.0, 1.0);
    moodBg = clamp(moodBg, 0.0, 1.0);

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

    vec4 color;
    if (uPixelTransition > 0.5 && uReducedMotion < 0.5) {
      float blockSize;
      vec2 sampledUv;
      if (t < 0.5) {
        blockSize = clamp(1.0 + (t / 0.5) * 31.0, 1.0, 32.0);
        vec2 pixelCoords = floor(vUv * uResolution / blockSize) * blockSize;
        sampledUv = pixelCoords / uResolution;
        color = texture2D(uTexture1, parallaxUv(sampledUv, uDepth1, uMouse));
      } else {
        blockSize = clamp(32.0 - ((t - 0.5) / 0.5) * 31.0, 1.0, 32.0);
        vec2 pixelCoords = floor(vUv * uResolution / blockSize) * blockSize;
        sampledUv = pixelCoords / uResolution;
        color = texture2D(uTexture2, parallaxUv(sampledUv, uDepth2, uMouse));
      }
    } else {
      color = mix(color1, color2, t);
    }

    // Composite room texture over mood background.
    // Use a softer blend: mood background only shows in very dark areas (luma < 0.15).
    // This preserves the original image brightness while adding subtle atmosphere
    // in near-black regions without darkening the overall scene.
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float moodBlend = clamp(1.0 - luma * 6.0, 0.0, 0.4);
    color.rgb = mix(color.rgb, color.rgb + moodBg * moodBlend, moodBlend);

    // Breathing effect: gentle light pulsation
    float breathing = sin(uTime * 0.8) * 0.015 + 0.985;
    color.rgb *= breathing;

    // [NEW] Velocity brightness lift — after breathing, before film grain
    color.rgb *= (1.0 + uVelocityIntensity * 0.12);

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

// ---------------------------------------------------------------------------
// Module-level variables for atmosphere feature
// ---------------------------------------------------------------------------
var velocityRaw = 0;
var velocityCurrent = 0;
var prevMouseX = 0.5;
var prevMouseY = 0.5;
var driftTarget = 0;
var driftCurrent = 0;
// lastFrameTime is repurposed from the dev FPS monitor for uTime delta computation.
// It is initialised to 0 so the first frame skips the delta addition.
var lastFrameTime = 0;

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
    uTime: { value: 0.0 },
    uVelocityIntensity: { value: 0.0 },
    uReducedMotion: { value: reduceMotion ? 1.0 : 0.0 },
    uPixelTransition: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(initWidth, initHeight) },
    uBgColor: { value: new THREE.Color('#0a0a0f') },
    uBlob1Color: { value: new THREE.Color('#1a1025') },
    uBlob2Color: { value: new THREE.Color('#0d0d1a') },
    uBgColorNext: { value: new THREE.Color('#0a0a0f') },
    uBlob1ColorNext: { value: new THREE.Color('#1a1025') },
    uBlob2ColorNext: { value: new THREE.Color('#0d0d1a') },
  };

  // Read transition style from Liquid-rendered data attribute and set uPixelTransition
  var canvasWrapper = document.querySelector('.immersive-store__canvas-wrapper');
  var transitionStyle = canvasWrapper && canvasWrapper.getAttribute('data-transition-style');
  var pixelTransitionEnabled = transitionStyle === 'pixel_dissolve' ? 1.0 : 0.0;
  if (reduceMotion) {
    pixelTransitionEnabled = 0.0;
    if (transitionStyle === 'pixel_dissolve') {
      console.info('[Immersive] Pixel dissolve suppressed: prefers-reduced-motion is enabled.');
    }
  }
  uniforms.uPixelTransition.value = pixelTransitionEnabled;

  // Initialise mood colour uniforms to storefront palette
  if (
    typeof ImmersiveAtmosphere !== 'undefined' &&
    typeof STORE_ROOMS !== 'undefined' &&
    STORE_ROOMS.storefront &&
    STORE_ROOMS.storefront.mood
  ) {
    ImmersiveAtmosphere.initMoodUniforms(uniforms, STORE_ROOMS.storefront.mood);
  }

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

  // Always start at storefront on a fresh page load.
  // Only restore a non-storefront room if a panel was open (user was mid-browsing).
  var state = loadState();
  var hasOpenPanel = (state.panel === 'product' && state.product) || (state.panel === 'collection' && state.collection);
  var startRoom = hasOpenPanel && state.room && STORE_ROOMS[state.room] ? state.room : 'storefront';

  // Restore navigation stack from saved state
  if (state.navigationStack && Array.isArray(state.navigationStack)) {
    immersiveState.navigationStack = state.navigationStack;
  }

  if (!hasOpenPanel) clearState();

  goToRoom(startRoom, true);
  writeImmersivePreference();

  // Update back button visibility after restoration
  if (typeof updateBackButtonVisibility === 'function') {
    updateBackButtonVisibility();
  }

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
  var room = STORE_ROOMS['storefront'];
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
  renderHotspots('storefront');
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
  if (uniforms && uniforms.uResolution) {
    uniforms.uResolution.value.set(width, height);
  }
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

function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay') || null;
  editorialMaxScroll = editorialOverlayEl ? editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight : 0;
}

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

  // [NEW] uTime increment — frame-rate independent, skip delta on first frame
  var now = performance.now();
  if (lastFrameTime !== 0) {
    var delta = (now - lastFrameTime) / 1000.0;
    uniforms.uTime.value += delta;
  }
  lastFrameTime = now;

  // [NEW] Velocity signal — Euclidean distance between current and previous mouse position
  if (!reduceMotion) {
    var dvx = mouseCurrent.x - prevMouseX;
    var dvy = mouseCurrent.y - prevMouseY;
    var velocityRawFrame = Math.sqrt(dvx * dvx + dvy * dvy);
    if (velocityRawFrame < 0.001) velocityRawFrame = 0;
    velocityCurrent += (velocityRawFrame - velocityCurrent) * 0.15;
    if (velocityCurrent > 1.0) velocityCurrent = 1.0;
    uniforms.uVelocityIntensity.value = velocityCurrent;
  } else {
    velocityCurrent = 0;
    uniforms.uVelocityIntensity.value = 0.0;
  }
  prevMouseX = mouseCurrent.x;
  prevMouseY = mouseCurrent.y;

  // [NEW] Mood colour lerp — advance current palette toward next palette
  if (typeof ImmersiveAtmosphere !== 'undefined') {
    ImmersiveAtmosphere.updateMoodUniforms(uniforms, 0.04);
  }

  // [NEW] Drift lerp — planeMesh.position.y briefly offsets on room entry
  if (!reduceMotion) {
    driftCurrent += (driftTarget - driftCurrent) * 0.08;
  } else {
    driftCurrent = 0;
  }
  if (planeMesh) planeMesh.position.y = driftCurrent;

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
    var devNow = performance.now();
    var frameTime = devNow - (window.__immersiveLastDevFrame || devNow);
    window.__immersiveLastDevFrame = devNow;

    // Simple FPS counter (show in console every second)
    fpsCounter++;
    if (devNow - fpsTimer > 1000) {
      var fps = Math.round((fpsCounter * 1000) / (devNow - fpsTimer));
      console.log(
        '[Immersive] FPS: ' +
          fps +
          ' | Frame time: ' +
          frameTime.toFixed(2) +
          'ms' +
          (frameTime > 16.67 ? ' ⚠️ SLOW' : ''),
      );
      fpsCounter = 0;
      fpsTimer = devNow;
    }

    // Frame budget warning (16.67ms = 60fps)
    if (frameTime > 16.67) {
      console.warn('[Immersive] Frame budget exceeded: ' + frameTime.toFixed(2) + 'ms (>' + 16.67 + 'ms for 60fps)');
    }
  }
}

/**
 * WebGL Engine Public API
 * Exposed functions:
 * - initImmersiveScene() - Initialize the Three.js scene
 * - isWebGLSupported() - Check if WebGL is supported
 * - showWebGLFallback(canvas) - Show fallback image when WebGL not supported
 * - showLoader() - Show loading spinner
 * - hideLoader() - Hide loading spinner
 * - handleResize(roomKeyOverride) - Handle window resize
 * - enableTiltControl() - Enable gyroscope tilt control (mobile)
 * - disableTiltControl() - Disable tilt control
 * - initTiltControlToggle() - Initialize tilt control toggle button
 */

// Expose public API to global scope
window.ImmersiveWebGL = {
  initImmersiveScene: initImmersiveScene,
  isWebGLSupported: isWebGLSupported,
  showWebGLFallback: showWebGLFallback,
  showLoader: showLoader,
  hideLoader: hideLoader,
  handleResize: handleResize,
  enableTiltControl: enableTiltControl,
  disableTiltControl: disableTiltControl,
  initTiltControlToggle: initTiltControlToggle,
};

// Backward-compatible global aliases for critical functions
window.initImmersiveScene = initImmersiveScene;
window.handleResize = handleResize;
