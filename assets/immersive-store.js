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

  goToRoom("storefront", true);
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

function setupVirtualTryOn(panel) {
  var container = panel.querySelector('#virtual-tryon-container');
  if (!container) return;

  var userPhotoInput = container.querySelector('#virtual-tryon-user-photo');
  var tryOnBtn = container.querySelector('#virtual-tryon-btn');
  var resultImg = container.querySelector('#virtual-tryon-result-img');
  var resultContainer = container.querySelector('#virtual-tryon-result');
  var loadingSpinner = container.querySelector('#virtual-tryon-loading');

  if (!userPhotoInput || !tryOnBtn) return;

  var productTitle = container.getAttribute('data-product-title') || '';
  var productDescription = container.getAttribute('data-product-description') || '';
  var productImageUrlRaw = container.getAttribute('data-product-image-url') || '';
  var productImageUrl = productImageUrlRaw.startsWith('//') ? 'https:' + productImageUrlRaw : productImageUrlRaw;

  var userImageDataUrl = null;
  var cachedProductImageDataUrl = null;

  userPhotoInput.addEventListener('change', function(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      userImageDataUrl = reader.result;
      tryOnBtn.disabled = false;
    };
    reader.onerror = function() {
      alert('Could not read your photo. Please try a different image.');
    };
    reader.readAsDataURL(file);
  });

  tryOnBtn.addEventListener('click', async function() {
    if (!userImageDataUrl) return;
    try {
      tryOnBtn.disabled = true;
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      if (resultContainer) resultContainer.style.display = 'none';

      if (!cachedProductImageDataUrl && productImageUrl) {
        var res = await fetch(productImageUrl);
        var blob = await res.blob();
        cachedProductImageDataUrl = await new Promise(function(resolve, reject) {
          var r = new FileReader();
          r.onload = function() { resolve(r.result); };
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      }

      var response = await fetch('https://scuk-vton.vercel.app/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_image_base64: userImageDataUrl,
          product_image_base64: cachedProductImageDataUrl,
          product_title: productTitle,
          product_description: productDescription,
        }),
      });

      var data = await response.json();

      if (data && data.success) {
        var src = data.image_url || (data.image_base64 ? 'data:image/png;base64,' + data.image_base64 : null);
        if (!src) throw new Error('No image in response');
        if (resultImg) { resultImg.src = src; resultImg.hidden = false; }
        if (resultContainer) resultContainer.style.display = 'block';
      } else {
        alert('Failed to generate try-on. Please try again.');
      }
    } catch (error) {
      console.error('Try-on error:', error);
      alert('An error occurred. Please try again.');
    } finally {
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