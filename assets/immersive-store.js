const STORE_ROOMS = {
  storefront: {
    // Exterior view (arrival)
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/immersive-base.png?v=1771996316",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/immersive-depth.png?v=1771996334",
    hotspots: [
      { x: 50, y: 60, label: "Enter store", targetRoom: "lounge" }
    ]
  },

  lounge: {
    // VIP Lounge interior
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/store-base.png?v=1772029869",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/store-depth-map.png?v=1772030053",
    hotspots: [
      // Brands / Designers
      { x: 20, y: 40, label: "Suffuse", targetCollection: "suffuse" },
      { x: 20, y: 50, label: "Soraya", targetCollection: "soraya" },
      { x: 20, y: 60, label: "Saad Bin Shahzad", targetCollection: "saad-bin-shahzad" },

      // Occasions (e.g., floating neon signs)
      { x: 55, y: 40, label: "Eid collection", targetCollection: "eid-collection" },
      { x: 55, y: 50, label: "Bridal & mehndi", targetRoom: "bridal_room" },
      { x: 55, y: 60, label: "Luxury formals", targetRoom: "festive" },
      { x: 55, y: 70, label: "Casual pret", targetCollection: "casual-pret" },

      // Quick “Featured” shortcut
      { x: 85, y: 50, label: "Featured", targetRoom: "featured_room" }
    ]
  },

  bridal_room: {
    // A dedicated Bridal & Mehndi room
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-base.jpg?v=1772037254",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/luxurious-depth.png?v=1772037261",
    hotspots: [
      { x: 35, y: 45, label: "Bridal & mehndi", targetCollection: "bridal-mehndi" },
      { x: 10, y: 90, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },

  festive: {
    // Festive / luxury gallery
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/festive-base.png?v=1772034395",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/festive-depth.png?v=1772034391",
    hotspots: [
      { x: 35, y: 40, label: "Luxury formals", targetCollection: "luxury-formals" },
      { x: 50, y: 50, label: "Luxury pret", targetCollection: "luxury-pret" },
      { x: 65, y: 60, label: "Casual pret", targetCollection: "casual-pret" },
      { x: 10, y: 90, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },

  featured_room: {
    // Featured collections: Mommy & Me, Unstitched, etc.
    baseTextureUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-base.png?v=YOUR_HASH",
    depthMapUrl: "https://cdn.shopify.com/s/files/1/0594/0435/3692/files/featured-depth.png?v=YOUR_HASH",
    hotspots: [
      { x: 35, y: 40, label: "Mommy and me", targetCollection: "mommy-and-me" },
      { x: 50, y: 50, label: "Luxury pret", targetCollection: "luxury-pret" },
      { x: 65, y: 60, label: "Casual pret", targetCollection: "casual-pret" },
      { x: 50, y: 75, label: "Unstitched", targetCollection: "unstitched" },
      { x: 10, y: 90, label: "Back to lounge", targetRoom: "lounge" }
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

const immersiveCanvasId = "immersive-canvas";
const uiLayerId = "ui-layer";
const glassPanelId = "glass-panel";

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

  vec2 parallaxUv(vec2 uv, sampler2D depthTex, vec2 mouse) {
    float depth = texture2D(depthTex, uv).r;
    vec2 centeredMouse = mouse - 0.5;
    float strength = 0.03;
    vec2 offset = centeredMouse * strength * depth;
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

  var baseUrl = room.baseTextureUrl;
  var depthUrl = room.depthMapUrl;

  if (roomKey === "storefront") {
    var wrapper = document.querySelector(".immersive-store__canvas-wrapper");
    if (wrapper) {
      var dataBaseUrl = wrapper.getAttribute("data-base-url");
      var dataDepthUrl = wrapper.getAttribute("data-depth-url");
      if (dataBaseUrl) {
        baseUrl = dataBaseUrl;
      }
      if (dataDepthUrl) {
        depthUrl = dataDepthUrl;
      }
    }
  }

  return {
    baseTextureUrl: baseUrl,
    depthMapUrl: depthUrl,
    hotspots: room.hotspots
  };
}

function initImmersiveScene() {
  var canvas = document.getElementById(immersiveCanvasId);
  var uiLayer = document.getElementById(uiLayerId);
  if (!canvas || !uiLayer || !window.THREE) return;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  var geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

  var textureLoader = new THREE.TextureLoader();
  var placeholder = textureLoader.load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAmsB9UHZHs8AAAAASUVORK5CYII=");
  placeholder.minFilter = THREE.LinearFilter;
  placeholder.magFilter = THREE.LinearFilter;

  uniforms = {
    uTexture1: { value: placeholder },
    uDepth1: { value: placeholder },
    uTexture2: { value: placeholder },
    uDepth2: { value: placeholder },
    uTransitionProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
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

  var loader = new THREE.TextureLoader();

  var baseTexture = loader.load(roomData.baseTextureUrl, function (tex) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
  });
  var depthTexture = loader.load(roomData.depthMapUrl, function (tex) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
  });

  if (initial || currentRoomKey === null) {
    uniforms.uTexture1.value = baseTexture;
    uniforms.uDepth1.value = depthTexture;
    uniforms.uTexture2.value = baseTexture;
    uniforms.uDepth2.value = depthTexture;
    currentRoomKey = roomKey;
    uiLayer.style.opacity = "1";
    renderHotspots(roomKey);
    return;
  }

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

function openCollectionPanel(collectionHandle) {
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var url = new URL(window.location.href);
  url.searchParams.set("section_id", "glass-panel");
  url.searchParams.set("collection_handle", collectionHandle);

  fetch(url.toString(), { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then(function (response) {
      if (!response.ok) return "";
      return response.text();
    })
    .then(function (html) {
      if (!html) return;

      function render() {
        panel.innerHTML = html;
        panel.setAttribute("data-open", "true");
        panel.style.transform = "translateX(0%)";
        panel.style.opacity = "1";

        panel.onclick = function (event) {
          var target = event.target;
          var card = target.closest(".immersive-product-card");
          if (!card) return;

          var handle = card.getAttribute("data-product-handle");
          if (!handle) return;

          event.preventDefault();
          openProductPanel(handle, collectionHandle);
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function () {});
}

function openProductPanel(productHandle, collectionHandle) {
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var url = new URL(window.location.href);
  url.searchParams.set("section_id", "glass-product");
  url.searchParams.set("product_handle", productHandle);

  if (collectionHandle) {
    url.searchParams.set("collection_handle", collectionHandle);
  }

  fetch(url.toString(), { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then(function (response) {
      if (!response.ok) return "";
      return response.text();
    })
    .then(function (html) {
      if (!html) return;

      function render() {
        panel.innerHTML = html;
        panel.setAttribute("data-open", "true");
        panel.style.transform = "translateX(0%)";
        panel.style.opacity = "1";

        panel.onclick = function (event) {
          var target = event.target;

          var backButton = target.closest(".glass-product-section__back");
          if (backButton) {
            var backHandle = backButton.getAttribute("data-collection-handle");
            if (backHandle) {
              event.preventDefault();
              openCollectionPanel(backHandle);
            }
            return;
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function () {});
}

function bindImmersiveNav() {
  var nav = document.querySelector(".immersive-nav");
  if (!nav) return;

  var links = nav.querySelectorAll(".immersive-nav__link");

  function setActive(link) {
    links.forEach(function (l) {
      l.classList.remove("immersive-nav__link--active");
    });
    if (link) {
      link.classList.add("immersive-nav__link--active");
    }
  }

  nav.addEventListener("click", function (event) {
    var button = event.target.closest(".immersive-nav__link");
    if (!button) return;

    var roomKey = button.getAttribute("data-room");
    var collectionHandle = button.getAttribute("data-collection");

    if (roomKey) {
      event.preventDefault();
      setActive(button);
      goToRoom(roomKey);
      return;
    }

    if (collectionHandle) {
      event.preventDefault();
      setActive(button);
      openCollectionPanel(collectionHandle);
      return;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initImmersiveScene);
} else {
  initImmersiveScene();
}