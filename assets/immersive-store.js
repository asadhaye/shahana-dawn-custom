const STORE_ROOMS = {
  storefront: {
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/immersive-base.png?v=1771996316",
    mobileBaseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/immersive-base.png?v=1771996316", // Use mobile-optimized image here
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/immersive-depth.png?v=1771996334",
    hotspots:[
      { x: 50, y: 40, label: "Enter store", targetRoom: "lounge" }
    ]
  },

  lounge: {
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/store-base.png?v=1772029869",
    mobileBaseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/store-base.png?v=1772029869",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/store-depth-map.png?v=1772030053",
    hotspots:[
      { x: 25, y: 27, label: "Designer Houses", targetRoom: "designer_houses" },
      { x: 50, y: 27, label: "Occasions", targetRoom: "occasions" },
      { x: 75, y: 28, label: "Featured Collections", targetRoom: "featured_collections" }
    ]
  },

  designer_houses: {
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737",
    mobileBaseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.jpg?v=1772196737",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/brand.png?v=1772196733",
    hotspots:[
      { x: 13, y: 40, label: "Suffuse", targetCollection: "suffuse" },
      { x: 50, y: 45, label: "Soraya", targetCollection: "soraya" },
      { x: 87, y: 40, label: "Saad Bin Shahzad", targetCollection: "saad-bin-shahzad" },
      { x: 50, y: 90, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },

  occasions: {
    // Replace with your occasions room image URLs
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-base.png?v=YOUR_HASH",
    mobileBaseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-base.png?v=YOUR_HASH",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/occasions-depth.png?v=YOUR_HASH",
    hotspots:[
      { x: 25, y: 40, label: "Eid Collection", targetCollection: "eid-collection" },
      { x: 42, y: 50, label: "Bridal & Mehndi", targetCollection: "bridal-mehndi" },
      { x: 58, y: 40, label: "Luxury Formals", targetCollection: "luxury-formals" },
      { x: 75, y: 50, label: "Casual Pret", targetCollection: "casual-pret" },
      { x: 50, y: 85, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },

  featured_collections: {
    // Replace with your featured collections room image URLs
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-base.png?v=YOUR_HASH",
    mobileBaseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-base.png?v=YOUR_HASH",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-depth.png?v=YOUR_HASH",
    hotspots:[
      { x: 25, y: 40, label: "SS5 Summer Pret 26", targetCollection: "summer-pret-26-eid-edit-saad-bin-shahzad" },
      { x: 50, y: 50, label: "Suffuse Luxury Pret", targetCollection: "luxury-pret-suffuse" },
      { x: 75, y: 40, label: "Soraya Eid Pret", targetCollection: "lumene-festive-25-26-soraya-official" },
      { x: 50, y: 85, label: "Back to lounge", targetRoom: "lounge" }
    ]
  }
};

let renderer;
let scene;
let camera;
let planeMesh;
let uniforms;
let currentRoomKey = null;
let transitioning = false;

// Texture cache to avoid re-loading and enable VRAM disposal
var textureCache = {};
var isMobileDevice = window.innerWidth < 768;
var textureWidth = isMobileDevice ? 1200 : 1920;
// Reduce parallax intensity on mobile to save GPU
var parallaxStrength = isMobileDevice ? 0.02 : 0.04;

const immersiveCanvasId = "immersive-canvas";
const uiLayerId = "ui-layer";
const glassPanelId = "glass-panel";

// Content cache for performance
var contentCache = {};

// Session state persistence — survives refresh, cleared on tab close
var STATE_KEY = 'immersive_state';

function saveState(patch) {
  try {
    var current = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    sessionStorage.setItem(STATE_KEY, JSON.stringify(Object.assign(current, patch)));
  } catch(e) {}
}

function loadState() {
  try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}'); } catch(e) { return {}; }
}

function clearState() {
  try { sessionStorage.removeItem(STATE_KEY); } catch(e) {}
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

  vec2 parallaxUv(vec2 uv, sampler2D depthTex, vec2 mouse) {
    float depth = texture2D(depthTex, uv).r;
    vec2 centeredMouse = mouse - 0.5;
    vec2 offset = centeredMouse * uParallaxStrength * depth;
    return uv + offset;
  }

  void main() {
    vec2 uv1 = parallaxUv(vUv, uDepth1, uMouse);
    vec2 uv2 = parallaxUv(vUv, uDepth2, uMouse);

    vec4 color1 = texture2D(uTexture1, uv1);
    vec4 color2 = texture2D(uTexture2, uv2);

    float t = clamp(uTransitionProgress, 0.0, 1.0);
    vec4 color = mix(color1, color2, t);

    gl_FragColor = color;
  }
`;

function getRoomTextureUrls(roomKey) {
  var room = STORE_ROOMS[roomKey];
  if (!room) return null;

  var baseUrl = isMobileDevice && room.mobileBaseTextureUrl ? room.mobileBaseTextureUrl : room.baseTextureUrl;
  var depthUrl = room.depthMapUrl;

  if (roomKey === "storefront") {
    var wrapper = document.querySelector(".immersive-store__canvas-wrapper");
    if (wrapper) {
      var dataBaseUrl = wrapper.getAttribute("data-base-url");
      var dataDepthUrl = wrapper.getAttribute("data-depth-url");
      if (dataBaseUrl) baseUrl = dataBaseUrl;
      if (dataDepthUrl) depthUrl = dataDepthUrl;
    }
  }

  return { baseTextureUrl: baseUrl, depthMapUrl: depthUrl, hotspots: room.hotspots };
}

// Preload a room's textures in the background (called on hotspot hover)
function preloadRoom(roomKey) {
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;
  var cacheKey = roomData.baseTextureUrl + "|" + roomData.depthMapUrl;
  if (textureCache[cacheKey]) return; // already cached
  loadRoomTextures(roomData, function() {}); // load silently into cache
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

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobileDevice });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.2, 10);
  camera.position.z = 1;

  var geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

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
    uParallaxStrength: { value: parallaxStrength }
  };

  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: uniforms,
    transparent: false
  });

  planeMesh = new THREE.Mesh(geometry, material);
  scene.add(planeMesh);

  canvas.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("resize", handleResize);
  handleResize();

  animate();

  // Restore previous session state, or start at storefront
  var state = loadState();
  var startRoom = state.room || 'storefront';
  goToRoom(startRoom, true);

  // Restore open panel after room loads
  if (state.panel === 'product' && state.product) {
    // Small delay to let the room render first
    setTimeout(function() {
      openProductPanel(state.product, state.collection);
    }, 400);
  } else if (state.panel === 'collection' && state.collection) {
    setTimeout(function() {
      openCollectionPanel(state.collection);
    }, 400);
  }
}

function isWebGLSupported() {
  try {
    var testCanvas = document.createElement("canvas");
    return !!(testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"));
  } catch (e) {
    return false;
  }
}

function showWebGLFallback(canvas) {
  var room = STORE_ROOMS["storefront"];
  if (!room) return;
  var wrapper = canvas.parentElement;
  if (!wrapper) return;
  var img = document.createElement("img");
  img.src = room.baseTextureUrl;
  img.alt = "";
  img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
  wrapper.appendChild(img);
  canvas.style.display = "none";
  // Still render hotspots
  renderHotspots("storefront");
}

function showLoader() {
  var wrapper = document.querySelector(".immersive-store__canvas-wrapper");
  if (!wrapper) return;
  var loader = document.createElement("div");
  loader.id = "immersive-loader";
  loader.innerHTML = '<div class="immersive-loader__ring"></div>';
  loader.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:50;pointer-events:none;";
  loader.querySelector(".immersive-loader__ring").style.cssText = "width:48px;height:48px;border:3px solid rgba(212,175,55,0.2);border-top-color:#d4af37;border-radius:50%;animation:immersive-spin 0.8s linear infinite;";
  // Inject keyframes once
  if (!document.getElementById("immersive-loader-style")) {
    var style = document.createElement("style");
    style.id = "immersive-loader-style";
    style.textContent = "@keyframes immersive-spin{to{transform:rotate(360deg)}}";
    document.head.appendChild(style);
  }
  wrapper.appendChild(loader);
}

function hideLoader() {
  var loader = document.getElementById("immersive-loader");
  if (!loader) return;
  loader.style.transition = "opacity 0.4s ease";
  loader.style.opacity = "0";
  setTimeout(function() { loader.remove(); }, 400);
}

function handleMouseMove(event) {
  var canvas = renderer ? renderer.domElement : null;
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) / rect.width;
  var y = (event.clientY - rect.top) / rect.height;
  uniforms.uMouse.value.set(x, 1 - y);
}

function handleResize() {
  if (!renderer) return;
  var canvas = renderer.domElement;
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height, false);
  
  // Use cover behavior on desktop (>= 768px), contain on mobile (< 768px)
  var isMobile = width < 768;
  
  if (camera && planeMesh) {
    var canvasAspect = width / height;
    var imageAspect = 16 / 9; // Assuming most room images are landscape ~16:9
    
    if (isMobile) {
      // Mobile: use contain to show full image without cropping text
      if (canvasAspect > imageAspect) {
        // Canvas is wider than image - fit to height
        var scale = imageAspect / canvasAspect;
        planeMesh.scale.set(scale, 1, 1);
      } else {
        // Canvas is taller than image - fit to width
        var scale = canvasAspect / imageAspect;
        planeMesh.scale.set(1, scale, 1);
      }
      // Reset position for mobile
      planeMesh.position.x = 0;
    } else {
      // Desktop: use cover to fill screen
      if (canvasAspect > imageAspect) {
        // Canvas is wider than image - fit to width, crop top/bottom
        var scale = canvasAspect / imageAspect;
        planeMesh.scale.set(1, scale, 1);
        planeMesh.position.x = 0;
      } else {
        // Canvas is taller than image - fit to height, crop left/right
        var scale = imageAspect / canvasAspect;
        planeMesh.scale.set(scale, 1, 1);
        // Shift right to show more of the left side where text is
        planeMesh.position.x = 0.15;
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function goToRoom(roomKey, initial) {
  if (transitioning) return;
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;

  saveState({ room: roomKey, panel: null, product: null, collection: null });

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    uiLayer.style.transition = "opacity 0.3s ease";
    uiLayer.style.opacity = "0";
  }

  loadRoomTextures(roomData, function(baseTexture, depthTexture) {
    if (initial || currentRoomKey === null) {
      uniforms.uTexture1.value = baseTexture;
      uniforms.uDepth1.value = depthTexture;
      uniforms.uTexture2.value = baseTexture;
      uniforms.uDepth2.value = depthTexture;
      currentRoomKey = roomKey;
      uiLayer.style.opacity = "1";
      renderHotspots(roomKey);
      hideLoader();
      return;
    }

    // Dispose old textures from VRAM before transitioning
    var oldBase = uniforms.uTexture1.value;
    var oldDepth = uniforms.uDepth1.value;

    uniforms.uTexture2.value = baseTexture;
    uniforms.uDepth2.value = depthTexture;

    transitioning = true;
    var duration = 800;
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
        // Dispose old textures if not cached (cached ones stay in memory)
        if (oldBase && !isCachedTexture(oldBase)) oldBase.dispose();
        if (oldDepth && !isCachedTexture(oldDepth)) oldDepth.dispose();

        uniforms.uTexture1.value = uniforms.uTexture2.value;
        uniforms.uDepth1.value = uniforms.uDepth2.value;
        uniforms.uTransitionProgress.value = 0;
        currentRoomKey = roomKey;
        transitioning = false;
        renderHotspots(roomKey);
        uiLayer.style.opacity = "1";
      }
    }

    requestAnimationFrame(step);
  });
}

function loadRoomTextures(roomData, callback) {
  var cacheKey = roomData.baseTextureUrl + "|" + roomData.depthMapUrl;

  if (textureCache[cacheKey]) {
    callback(textureCache[cacheKey].base, textureCache[cacheKey].depth);
    return;
  }

  var loader = new THREE.TextureLoader();
  var loaded = { base: null, depth: null };

  function onBothLoaded() {
    if (!loaded.base || !loaded.depth) return;
    textureCache[cacheKey] = { base: loaded.base, depth: loaded.depth };
    callback(loaded.base, loaded.depth);
  }

  loader.load(roomData.baseTextureUrl, function(tex) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    loaded.base = tex;
    onBothLoaded();
  });

  loader.load(roomData.depthMapUrl, function(tex) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    loaded.depth = tex;
    onBothLoaded();
  });
}

function isCachedTexture(texture) {
  return Object.values(textureCache).some(function(entry) {
    return entry.base === texture || entry.depth === texture;
  });
}

function renderHotspots(roomKey) {
  var room = STORE_ROOMS[roomKey];
  var uiLayer = document.getElementById(uiLayerId);
  if (!room || !uiLayer) return;

  function render() {
    uiLayer.innerHTML = "";

    room.hotspots.forEach(function (hotspot) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = hotspot.label;
      button.className = "immersive-hotspot";
      button.style.position = "absolute";
      button.style.left = hotspot.x + "%";
      button.style.top = hotspot.y + "%";
      button.style.transform = "translate(-50%, -50%)";

      button.addEventListener("click", function () {
        if (hotspot.targetRoom) {
          goToRoom(hotspot.targetRoom);
        } else if (hotspot.targetCollection) {
          openCollectionPanel(hotspot.targetCollection);
        }
      });

      // Preload next room textures on hover
      if (hotspot.targetRoom) {
        button.addEventListener("mouseenter", function() {
          preloadRoom(hotspot.targetRoom);
        }, { once: true });
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

// Helper function to close the panel smoothly
function closePanel() {
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;
  
  panel.removeAttribute("data-open");
  saveState({ panel: null, product: null, collection: null });
  
  // Wait for the CSS transition to finish before hiding from DOM
  setTimeout(function() {
    panel.classList.add("hidden");
  }, 400); 
}

function fetchWithCache(url) {
  if (contentCache[url]) {
    return Promise.resolve(contentCache[url]);
  }
  
  return fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.text();
    })
    .then(function(html) {
      contentCache[url] = html;
      return html;
    });
}

function setupVariantButtons(panel) {
  var buttons = panel.querySelectorAll('.immersive-variant-button, .glass-product-section__variant-button');
  var hiddenInput = panel.querySelector('.immersive-variant-input, .glass-product-section__variant-input');
  
  if (buttons.length === 0) return;
  
  buttons.forEach(function(button, index) {
    button.addEventListener('click', function() {
      if (button.disabled) return;
      
      // Remove active state from all buttons
      buttons.forEach(function(btn) {
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
    button.addEventListener('keydown', function(event) {
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
  var firstAvailable = panel.querySelector('.immersive-variant-button:not([disabled]), .glass-product-section__variant-button:not([disabled])');
  if (firstAvailable) {
    firstAvailable.click();
  }
}

function setupBuyNowForm(panel) {
  var forms = panel.querySelectorAll('form[data-product-form], .glass-product-section__form');
  
  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Validate variant selection
      var variantInput = form.querySelector('.immersive-variant-input, .glass-product-section__variant-input, input[name="id"]');
      if (!variantInput || !variantInput.value) {
        showErrorFeedback(panel, 'Please select a size');
        return;
      }
      
      var formData = new FormData(form);
      
      // Add to cart first
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(function(response) {
        if (!response.ok) {
          return response.json().then(function(error) {
            throw new Error(error.description || 'Unable to add to cart');
          });
        }
        return response.json();
      })
      .then(function(data) {
        // Show success feedback
        showCartFeedback(panel);
        
        // Redirect to checkout
        setTimeout(function() {
          window.location.href = '/checkout';
        }, 500);
      })
      .catch(function(error) {
        console.error('Error adding to cart:', error);
        showErrorFeedback(panel, error.message || 'Unable to add product to cart. Please try again.');
      });
    });
  });
}

function setupImageParallax(panel) {
  // Collection grid cards
  var cards = panel.querySelectorAll('.immersive-product-card');
  cards.forEach(function(card) {
    var imgs = card.querySelectorAll('.immersive-product-image, .immersive-product-image-hover');
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      imgs.forEach(function(img) {
        img.style.transform = 'translate(' + (x * 12) + 'px, ' + (y * 12) + 'px) scale(1.08)';
      });
    });
    card.addEventListener('mouseleave', function() {
      imgs.forEach(function(img) { img.style.transform = ''; });
    });
  });

  // Product panel main image
  var mediaMain = panel.querySelector('.glass-product-section__media-main');
  if (mediaMain) {
    var img = mediaMain.querySelector('img');
    if (img) {
      // overflow:hidden is already on the container — scale the img slightly so parallax doesn't show edges
      img.style.transition = 'transform 0.1s ease-out';
      img.style.transform = 'scale(1.06)';
      mediaMain.addEventListener('mousemove', function(e) {
        var rect = mediaMain.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.transform = 'scale(1.06) translate(' + (x * 14) + 'px, ' + (y * 14) + 'px)';
      });
      mediaMain.addEventListener('mouseleave', function() {
        img.style.transform = 'scale(1.06)';
      });
    }
  }
}

function setupDeliveryDates(panel) {
  var fromEl = panel.querySelector('.delivery-from');
  var toEl   = panel.querySelector('.delivery-to');
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
    return date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  var today = new Date();
  fromEl.textContent = fmt(skipWeekend(addDays(today, 14)));
  toEl.textContent   = fmt(skipWeekend(addDays(today, 24)));
}

function setupShareButton(panel) {
  var buttons = panel.querySelectorAll('.glass-product-section__share-btn');
  if (!buttons.length) return;

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
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
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function() {
            btn.textContent = '✓ Copied!';
            setTimeout(function() { btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram'; }, 2500);
          });
          return;
        case 'tiktok':
          // TikTok has no direct web share — copy link
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function() {
            btn.textContent = '✓ Copied!';
            setTimeout(function() { btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> TikTok'; }, 2500);
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

  var userPhotoInput  = container.querySelector('#virtual-tryon-user-photo');
  var tryOnBtn        = container.querySelector('#virtual-tryon-btn');
  var resultImg       = container.querySelector('#virtual-tryon-result-img');
  var resultContainer = container.querySelector('#virtual-tryon-result');
  var loadingSpinner  = container.querySelector('#virtual-tryon-loading');
  var quotaBadge      = container.querySelector('#vtryon-quota-badge');

  if (!userPhotoInput || !tryOnBtn) return;

  var productTitle       = container.getAttribute('data-product-title') || '';
  var productImageUrlRaw = container.getAttribute('data-product-image-url') || '';
  var productImageUrl    = productImageUrlRaw.startsWith('//') ? 'https:' + productImageUrlRaw
    : productImageUrlRaw.startsWith('/') ? window.location.origin + productImageUrlRaw
    : productImageUrlRaw;

  var customerId         = container.getAttribute('data-customer-id') || '';
  var customerToken      = container.getAttribute('data-customer-token') || '';
  var isRecentPurchaser  = container.getAttribute('data-is-recent-purchaser') === 'true';
  var quotaMax           = parseInt(container.getAttribute('data-quota-max') || '1', 10);

  // Show quota badge
  if (quotaBadge) {
    quotaBadge.textContent = quotaMax + ' try-on' + (quotaMax !== 1 ? 's' : '') + ' available';
  }

  var userImageDataUrl = null;

  userPhotoInput.addEventListener('change', function(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) { tryOnBtn.disabled = true; return; }

    var uploadText = container.querySelector('.vtryon__upload-text');
    var uploadIcon = container.querySelector('.vtryon__upload-icon');
    var preview    = container.querySelector('.vtryon__preview');
    if (uploadText) uploadText.textContent = file.name;

    var reader = new FileReader();
    reader.onload = function(e) {
      if (preview && uploadIcon) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadIcon.style.display = 'none';
      }
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 768; canvas.height = 1024;
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
      img.onerror = function() { alert('Could not read your photo. Please try a different image.'); };
      img.src = e.target.result;
    };
    reader.onerror = function() { alert('Could not read your photo. Please try a different image.'); };
    reader.readAsDataURL(file);
  });

  tryOnBtn.addEventListener('click', async function() {
    if (!userImageDataUrl) return;

    var statusText = container.querySelector('.vtryon__status');
    var errorBox   = container.querySelector('.vtryon__error');
    var seconds = 0;
    var timer = null;

    function setStatus(msg) { if (statusText) statusText.textContent = msg; }
    function showError(msg) {
      if (errorBox) { errorBox.textContent = msg; errorBox.style.display = 'block'; }
      setStatus('');
    }

    try {
      tryOnBtn.disabled = true;
      if (resultContainer) resultContainer.style.display = 'none';
      if (errorBox) errorBox.style.display = 'none';
      if (loadingSpinner) loadingSpinner.style.display = 'block';

      // Step 1: Upload user photo as raw binary
      setStatus('Uploading your photo…');
      var blob = await (function() {
        return new Promise(function(resolve, reject) {
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
      setStatus('Processing embroidery & texture details…');
      timer = setInterval(function() {
        seconds++;
        if (seconds === 10) setStatus('Generating realistic drapes…');
        if (seconds === 25) setStatus('Finalizing your look… almost there!');
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
        var errData = await tryonRes.json().catch(function() { return {}; });
        // Handle quota exceeded with a friendly message
        if (errData.code === 'quota_exceeded') {
          throw new Error(errData.error || 'You have used all your try-ons.');
        }
        if (errData.code === 'auth_required') {
          throw new Error('Please sign in to use Virtual Try-On.');
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
        quotaBadge.textContent = remaining + ' try-on' + (remaining !== 1 ? 's' : '') + ' remaining';
        if (remaining === 0) quotaBadge.style.color = 'rgba(252,165,165,0.8)';
      }

      setStatus('Looking great!');
      if (resultImg) {
        if (resultImg._objectUrl) URL.revokeObjectURL(resultImg._objectUrl);
        resultImg._objectUrl = objectUrl;
        resultImg.src = objectUrl;
        resultImg.hidden = false;      }
      if (resultContainer) resultContainer.style.display = 'block';

    } catch (error) {
      console.error('Try-on error:', error);
      showError(error.message);
    } finally {
      clearInterval(timer);
      tryOnBtn.disabled = false;
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  });
}

function showCartFeedback(panel) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-cart-feedback';
  feedback.textContent = 'Added to cart!';
  feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(212, 175, 55, 0.9); color: #000; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600;';
  
  document.body.appendChild(feedback);
  
  setTimeout(function() {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function() {
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
  feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(239, 68, 68, 0.9); color: #fff; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600; cursor: pointer;';
  
  document.body.appendChild(feedback);
  
  var dismissFeedback = function() {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function() {
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

function openCollectionPanel(collectionHandle) {
  saveState({ panel: 'collection', collection: collectionHandle, product: null });
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  // Remove hidden class so CSS transitions work
  panel.classList.remove("hidden");

  // Fetch from the collection URL with section_id parameter
  var fetchUrl = "/collections/" + collectionHandle + "?section_id=glass-panel";
  
  console.log('Fetching collection:', collectionHandle, 'URL:', fetchUrl);

  fetchWithCache(fetchUrl)
    .then(function (html) {
      console.log('Collection response received, length:', html ? html.length : 0);
      if (!html) {
        showErrorFeedback(panel, 'Unable to load collection. Please try again.');
        return;
      }

      function render() {
        // Inject into the content div, NOT the whole panel, to save the close button!
        var contentArea = panel.querySelector(".immersive-store__panel-content");
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        panel.setAttribute("data-open", "true");

        // Setup variant buttons after content is injected
        setupVariantButtons(panel);
        
        // Setup buy now form handler
        setupBuyNowForm(panel);

        // Setup image parallax on product cards
        setupImageParallax(panel);

        // Setup virtual try-on
        setupVirtualTryOn(panel);

        // Setup click handlers for this panel
        panel.onclick = function (event) {
          // 1. Handle backdrop click (clicking outside content)
          if (event.target === panel) {
            closePanel();
            return;
          }

          // 2. Handle Close Button
          if (event.target.closest(".immersive-store__panel-close")) {
            closePanel();
            return;
          }

          // 3. Handle Product Card Click
          var card = event.target.closest(".immersive-product-card");
          if (!card) return;

          var handle = card.getAttribute("data-product-handle");
          if (!handle) return;

          event.preventDefault();
          openProductPanel(handle, collectionHandle);
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) { 
      console.error("Error fetching collection:", collectionHandle, error);
      showErrorFeedback(panel, 'Unable to load collection "' + collectionHandle + '". Please check your connection and try again.');
    });
}

function openProductPanel(productHandle, collectionHandle) {
  saveState({ panel: 'product', product: productHandle, collection: collectionHandle || null });
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  panel.classList.remove("hidden");

  // Always fetch from product URL - the product object is only available there
  var fetchUrl = "/products/" + productHandle + "?section_id=glass-product";
  
  // Pass collection handle as a parameter so the back button works
  if (collectionHandle) {
    fetchUrl += "&collection_handle=" + collectionHandle;
  }

  console.log('Fetching product:', productHandle, 'from collection:', collectionHandle, 'URL:', fetchUrl);

  fetchWithCache(fetchUrl)
    .then(function (html) {
      console.log('Product response received, length:', html ? html.length : 0);
      if (!html) {
        showErrorFeedback(panel, 'Unable to load product details. Please try again.');
        return;
      }

      function render() {
        var contentArea = panel.querySelector(".immersive-store__panel-content");
        if (contentArea) {
          contentArea.innerHTML = html;
        } else {
          panel.innerHTML = html;
        }

        panel.setAttribute("data-open", "true");

        // Setup variant buttons after content is injected
        setupVariantButtons(panel);
        
        // Setup buy now form handler
        setupBuyNowForm(panel);

        // Setup image parallax on product cards
        setupImageParallax(panel);

        // Setup share button
        setupShareButton(panel);

        // Setup delivery dates
        setupDeliveryDates(panel);

        // Setup virtual try-on
        setupVirtualTryOn(panel);

        panel.onclick = function (event) {
          // 1. Handle backdrop click
          if (event.target === panel) {
            closePanel();
            return;
          }

          // 2. Handle Close Button
          if (event.target.closest(".immersive-store__panel-close")) {
            closePanel();
            return;
          }

          // 3. Handle Back Button (PDP -> Collection)
          var backButton = event.target.closest(".glass-product-section__back");
          if (backButton) {
            var backHandle = backButton.getAttribute("data-collection-handle");
            if (backHandle) {
              event.preventDefault();
              openCollectionPanel(backHandle);
            }
            return;
          }

          // 4. Handle Related Product Click
          var relatedItem = event.target.closest(".glass-product-section__related-item");
          if (relatedItem) {
            var relatedHandle = relatedItem.getAttribute("data-product-handle");
            if (relatedHandle) {
              event.preventDefault();
              openProductPanel(relatedHandle, collectionHandle);
            }
            return;
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) { 
      console.error("Error fetching product:", error);
      showErrorFeedback(panel, 'Unable to load product. Please check your connection and try again.');
    });
}

function bindImmersiveNav() {
  var menuToggle = document.getElementById("menu-toggle");
  var menuPanel = document.getElementById("immersive-menu");
  
  if (!menuToggle || !menuPanel) return;

  // 1. Toggle Menu Open/Close
  menuToggle.addEventListener("click", function () {
    var isOpen = menuPanel.classList.contains("is-open");
    
    if (isOpen) {
      // Close it
      menuPanel.classList.remove("is-open");
      menuToggle.textContent = "Menu";
      menuToggle.setAttribute("aria-expanded", "false");
    } else {
      // Open it
      menuPanel.classList.add("is-open");
      menuToggle.textContent = "Close";
      menuToggle.setAttribute("aria-expanded", "true");
    }
  });

  // 2. Handle Clicks Inside the Menu
  menuPanel.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-room], button[data-collection]");
    if (!button) return;

    var roomKey = button.getAttribute("data-room");
    var collectionHandle = button.getAttribute("data-collection");

    // Close the menu automatically when a link is clicked
    menuPanel.classList.remove("is-open");
    menuToggle.textContent = "Menu";
    menuToggle.setAttribute("aria-expanded", "false");

    // Route the user
    if (roomKey) {
      event.preventDefault();
      goToRoom(roomKey);
    } else if (collectionHandle) {
      event.preventDefault();
      openCollectionPanel(collectionHandle);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    initImmersiveScene();
    bindImmersiveNav();
  });
} else {
  initImmersiveScene();
  bindImmersiveNav();
}