/**
 * InfiniteGallery — 2D infinite draggable gallery for Three.js
 *
 * Creates a flat 2D grid of image meshes on #immersive-canvas using an
 * OrthographicCamera. Supports native JS drag physics with inertia on both
 * X and Y axes. Infinite wrapping on all 4 edges. RGB-shift shader distortion
 * proportional to drag speed. Raycaster for click/hover through #ui-layer.
 *
 * Usage:
 *   var gallery = new InfiniteGallery({
 *     canvasId: 'immersive-canvas',
 *     uiLayerId: 'ui-layer',
 *     columns: 4,
 *     spacing: 0.08,
 *     cardWidth: 0.85,
 *     cardHeight: 1.05,
 *     friction: 0.95,
 *   });
 *   gallery.init();
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Shader source
  // ---------------------------------------------------------------------------
  var VERTEX_SHADER = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n');

  var FRAGMENT_SHADER = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uVelocity;',
    'uniform vec2 uResolution;',
    'varying vec2 vUv;',

    // Attempt a subtle RGB shift proportional to velocity
    'void main() {',
    '  float shift = uVelocity * 0.003;',
    '  vec2 dir = vUv - 0.5;',
    '  float dist = length(dir);',
    '  float edge = smoothstep(0.0, 0.5, dist);',
    '  float amount = shift * edge;',

    '  vec2 rUV = vUv + dir * amount;',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = vUv - dir * amount;',

    // Clamp to avoid sampling outside texture
    '  rUV = clamp(rUV, 0.0, 1.0);',
    '  bUV = clamp(bUV, 0.0, 1.0);',

    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',

    '  gl_FragColor = vec4(r, g, b, a);',
    '}',
  ].join('\n');

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------
  function InfiniteGallery(opts) {
    opts = opts || {};

    // DOM
    this.canvasId = opts.canvasId || 'immersive-canvas';
    this.uiLayerId = opts.uiLayerId || 'ui-layer';

    // Grid
    this.columns = opts.columns || 4;
    this.spacing = opts.spacing || 0.08;
    this.cardWidth = opts.cardWidth || 0.85;
    this.cardHeight = opts.cardHeight || 1.05;
    this.dupMultiplier = opts.dupMultiplier || 3; // duplicate items to fill N viewports

    // Physics
    this.friction = opts.friction || 0.95;
    this.minVelocity = 0.001;

    // Internal
    this._rafId = null;
    this._disposed = false;
    this._meshData = []; // [{mesh, baseX, baseY, origItem}]
    this._hoveredMesh = null;
    this._canvasRect = null;

    // Bind methods
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onResize = this._onResize.bind(this);
    this._renderLoop = this._renderLoop.bind(this);
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype.init = function () {
    if (this._disposed) return;
    if (typeof THREE === 'undefined') {
      console.warn('[InfiniteGallery] THREE not available');
      return;
    }

    var canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      console.warn('[InfiniteGallery] Canvas not found:', this.canvasId);
      return;
    }

    this.canvas = canvas;

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);

    var w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    var h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);

    // --- Scene ---
    this.scene = new THREE.Scene();

    // --- Camera ---
    this._updateCamera(w, h);

    // --- Build grid ---
    this._buildGrid();

    // --- Raycaster ---
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    // --- Drag state ---
    this._dragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      velocityX: 0,
      velocityY: 0,
    };

    // --- Group ---
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Move meshes into the group
    this._meshData.forEach(function (d) {
      this.group.attach(d.mesh);
    }.bind(this));

    // --- Events ---
    this._bindEvents();

    // --- Start loop ---
    this._rafId = requestAnimationFrame(this._renderLoop);

    if (window.__IMMERSIVE_DEV__) {
      console.log(
        '[InfiniteGallery] Init: ' + this._meshData.length + ' meshes, ' +
        this.columns + ' cols, card ' + this.cardWidth + 'x' + this.cardHeight +
        ', spacing ' + this.spacing
      );
    }
  };

  InfiniteGallery.prototype.dispose = function () {
    this._disposed = true;

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this._unbindEvents();

    // Dispose meshes
    this._meshData.forEach(function (d) {
      if (d.mesh.geometry) d.mesh.geometry.dispose();
      if (d.mesh.material) {
        if (d.mesh.material.uniforms && d.mesh.material.uniforms.uTexture) {
          var tex = d.mesh.material.uniforms.uTexture.value;
          if (tex && tex.dispose) tex.dispose();
        }
        d.mesh.material.dispose();
      }
    });
    this._meshData = [];

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (window.__IMMERSIVE_DEV__) {
      console.log('[InfiniteGallery] Disposed');
    }
  };

  // ---------------------------------------------------------------------------
  // Camera
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._updateCamera = function (w, h) {
    var aspect = w / h;
    var viewH = 2.0; // world units visible vertically
    var viewW = viewH * aspect;

    this.camera = new THREE.OrthographicCamera(
      -viewW / 2, viewW / 2,
      viewH / 2, -viewH / 2,
      0.01, 100
    );
    this.camera.position.z = 10;

    // Store viewport dimensions for wrap logic
    this._vp = {
      viewW: viewW,
      viewH: viewH,
      halfW: viewW / 2,
      halfH: viewH / 2,
    };
  };

  // ---------------------------------------------------------------------------
  // Grid builder
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._buildGrid = function () {
    var items = this._loadItems();
    if (!items.length) return;

    var texLoader = new THREE.TextureLoader();

    // Deduplicate textures by src
    var texCache = {};

    // Duplicate items to fill N viewport areas in each direction
    var totalVpData = this.dupMultiplier * 3; // horizontal + vertical coverage
    var totalNeeded = this.columns * Math.ceil(totalVpData / this.columns);
    var dupItems = [];
    var si = 0;
    while (dupItems.length < totalNeeded && items.length > 0) {
      var src = dupItems.length % items.length;
      dupItems.push(items[src]);
    }

    var totalRows = Math.ceil(dupItems.length / this.columns);
    var gridTotalW = this.columns * this.cardWidth + (this.columns - 1) * this.spacing;
    var gridTotalH = totalRows * (this.cardHeight + this.spacing) - this.spacing;

    this._gridMetrics = {
      gridTotalW: gridTotalW,
      gridTotalH: gridTotalH,
      totalRows: totalRows,
      cardCount: dupItems.length,
    };

    var startX = -gridTotalW / 2 + this.cardWidth / 2;
    var startY = gridTotalH / 2 - this.cardHeight / 2;

    var sharedUniforms = {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(
        this.canvas.clientWidth || window.innerWidth,
        this.canvas.clientHeight || window.innerHeight
      )},
    };

    dupItems.forEach(function (item, idx) {
      if (!item.imageSrc) return;

      var col = idx % this.columns;
      var row = Math.floor(idx / this.columns);

      // Load or reuse texture
      var tex = texCache[item.imageSrc];
      if (!tex) {
        tex = texLoader.load(item.imageSrc);
        tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        tex.anisotropy = 8;
        texCache[item.imageSrc] = tex;
      }

      var uniforms = {
        uTexture: { value: tex },
        uTime: sharedUniforms.uTime,
        uVelocity: sharedUniforms.uVelocity,
        uResolution: sharedUniforms.uResolution,
      };

      var mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: uniforms,
        transparent: true,
        side: THREE.DoubleSide,
      });

      var geom = new THREE.PlaneGeometry(this.cardWidth, this.cardHeight, 1, 1);
      var mesh = new THREE.Mesh(geom, mat);

      var x = startX + col * (this.cardWidth + this.spacing);
      var y = startY - row * (this.cardHeight + this.spacing);
      mesh.position.set(x, y, 0);

      mesh.userData = {
        galleryIndex: item.index,
        title: item.title || '',
        subtitle: item.subtitle || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        baseX: x,
        baseY: y,
        row: row,
        col: col,
      };

      this.scene.add(mesh);
      this._meshData.push({
        mesh: mesh,
        baseX: x,
        baseY: y,
        origItem: item,
      });
    }.bind(this));

    // Center the group vertically
    this.group.position.y = 0;
    this.group.position.x = 0;
  };

  InfiniteGallery.prototype._loadItems = function () {
    // Read from window.immersiveWebglGalleryConfigs (populated by loadGalleryConfigsFromDOM)
    var configs = window.immersiveWebglGalleryConfigs;
    if (!configs) return [];

    // Use the current room key from the global, or default
    var roomKey = (typeof currentRoomKey !== 'undefined' && currentRoomKey) ? currentRoomKey : 'designer_houses';
    var items = configs[roomKey] || configs['designer_houses'] || [];

    return items.map(function (item, idx) {
      return {
        index: item.index != null ? item.index : idx,
        imageSrc: item.imageSrc,
        title: item.title,
        subtitle: item.subtitle,
        productHandle: item.productHandle,
        collectionHandle: item.collectionHandle,
        imageWidth: item.imageWidth,
        imageHeight: item.imageHeight,
      };
    }).filter(function (item) {
      return !!item.imageSrc;
    });
  };

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._bindEvents = function () {
    var el = this.canvas;
    if (!el) return;

    el.style.cursor = 'grab';

    // Pointer events
    el.addEventListener('mousedown', this._onPointerDown, { passive: true });
    el.addEventListener('touchstart', this._onPointerDown, { passive: true });
    window.addEventListener('mousemove', this._onPointerMove, { passive: true });
    window.addEventListener('touchmove', this._onPointerMove, { passive: true });
    window.addEventListener('mouseup', this._onPointerUp, { passive: true });
    window.addEventListener('touchend', this._onPointerUp, { passive: true });

    // Click
    el.addEventListener('click', this._onPointerUp.bind(this, true), { passive: false });

    // Resize
    window.addEventListener('resize', this._onResize, { passive: true });

    this._eventsBound = true;
  };

  InfiniteGallery.prototype._unbindEvents = function () {
    var el = this.canvas;
    if (!el) return;

    el.removeEventListener('mousedown', this._onPointerDown);
    el.removeEventListener('touchstart', this._onPointerDown);
    window.removeEventListener('mousemove', this._onPointerMove);
    window.removeEventListener('touchmove', this._onPointerMove);
    window.removeEventListener('mouseup', this._onPointerUp);
    window.removeEventListener('touchend', this._onPointerUp);
    window.removeEventListener('resize', this._onResize);

    this._eventsBound = false;
  };

  InfiniteGallery.prototype._getPointerPos = function (e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX || 0, y: e.clientY || 0 };
  };

  // ---------------------------------------------------------------------------
  // Pointer handlers
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._onPointerDown = function (e) {
    var pos = this._getPointerPos(e);
    var ds = this._dragState;
    ds.isDragging = true;
    ds.startX = pos.x;
    ds.startY = pos.y;
    ds.lastX = pos.x;
    ds.lastY = pos.y;
    ds.velocityX = 0;
    ds.velocityY = 0;
    this.canvas.style.cursor = 'grabbing';

    // Hide hint
    var hint = document.getElementById('immersive-gallery-hint');
    if (hint) hint.style.opacity = '0';
  };

  InfiniteGallery.prototype._onPointerMove = function (e) {
    var pos = this._getPointerPos(e);
    var ds = this._dragState;

    // Update raycaster for hover detection every frame
    this._updateMouse(pos.x, pos.y);

    if (!ds.isDragging) return;

    var dx = pos.x - ds.lastX;
    var dy = pos.y - ds.lastY;

    // Store velocity (pixels per frame)
    ds.velocityX = dx;
    ds.velocityY = dy;

    ds.lastX = pos.x;
    ds.lastY = pos.y;
  };

  InfiniteGallery.prototype._onPointerUp = function (e) {
    var ds = this._dragState;
    if (!ds.isDragging) return;
    ds.isDragging = false;
    this.canvas.style.cursor = 'grab';
  };

  InfiniteGallery.prototype._updateMouse = function (clientX, clientY) {
    if (!this._canvasRect) {
      this._canvasRect = this.canvas ? this.canvas.getBoundingClientRect() : null;
    }
    if (!this._canvasRect) return;

    var x = ((clientX - this._canvasRect.left) / this._canvasRect.width) * 2 - 1;
    var y = -((clientY - this._canvasRect.top) / this._canvasRect.height) * 2 + 1;
    this._mouse.set(x, y);
  };

  InfiniteGallery.prototype._onResize = function () {
    var w = this.canvas.clientWidth || this.canvas.offsetWidth || window.innerWidth;
    var h = this.canvas.clientHeight || this.canvas.offsetHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this._updateCamera(w, h);
    this._canvasRect = null; // force recalc
  };

  // ---------------------------------------------------------------------------
  // Render loop
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._renderLoop = function () {
    if (this._disposed) return;
    this._rafId = requestAnimationFrame(this._renderLoop);

    var ds = this._dragState;
    var friction = this.friction;

    // --- Physics: apply velocity to group ---
    if (!ds.isDragging) {
      if (Math.abs(ds.velocityX) > this.minVelocity) {
        this.group.position.x += ds.velocityX * 0.008;
        ds.velocityX *= friction;
      }
      if (Math.abs(ds.velocityY) > this.minVelocity) {
        this.group.position.y += ds.velocityY * 0.008;
        ds.velocityY *= friction;
      }
    }

    // Combined velocity magnitude for shader
    var speed = Math.sqrt(ds.velocityX * ds.velocityX + ds.velocityY * ds.velocityY);

    // --- Infinite wrap ---
    this._wrapMeshes();

    // --- Update shader uniforms ---
    var time = performance.now() * 0.001;
    this._meshData.forEach(function (d) {
      var mat = d.mesh.material;
      if (mat && mat.uniforms) {
        if (mat.uniforms.uTime) mat.uniforms.uTime.value = time;
        if (mat.uniforms.uVelocity) mat.uniforms.uVelocity.value = speed;
      }
    });

    // --- Raycaster hover ---
    this._checkHover();

    // --- Render ---
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  // ---------------------------------------------------------------------------
  // Infinite wrapping
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._wrapMeshes = function () {
    var metrics = this._gridMetrics;
    if (!metrics || !metrics.gridTotalW || !metrics.gridTotalH) return;

    var vp = this._vp;
    if (!vp) return;

    var thresholdX = vp.halfW + this.cardWidth * 0.5 + this.spacing;
    var thresholdY = vp.halfH + this.cardHeight * 0.5 + this.spacing;
    var totalW = metrics.gridTotalW + this.spacing;
    var totalH = metrics.gridTotalH + this.spacing;

    // Use the camera's world-space viewport edges
    var cam = this.camera;
    var vpLeft = cam.position.x + cam.left;
    var vpRight = cam.position.x + cam.right;
    var vpTop = cam.position.y + cam.top;
    var vpBottom = cam.position.y + cam.bottom;

    // But since camera is fixed at (0,0,10) and group moves, we check mesh
    // world positions against the camera's frustum
    var tmpVec = new THREE.Vector3();

    this._meshData.forEach(function (d) {
      var mesh = d.mesh;

      // Get world position (group.position + mesh.local position)
      mesh.getWorldPosition(tmpVec);

      // Horizontal wrap
      if (tmpVec.x > vpRight + thresholdX) {
        d.baseX -= totalW;
        mesh.position.x = d.baseX;
      } else if (tmpVec.x < vpLeft - thresholdX) {
        d.baseX += totalW;
        mesh.position.x = d.baseX;
      }

      // Recompute world X after potential horizontal wrap
      mesh.getWorldPosition(tmpVec);

      // Vertical wrap
      if (tmpVec.y > vpTop + thresholdY) {
        d.baseY -= totalH;
        mesh.position.y = d.baseY;
      } else if (tmpVec.y < vpBottom - thresholdY) {
        d.baseY += totalH;
        mesh.position.y = d.baseY;
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Raycaster (hover)
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype._checkHover = function () {
    if (!this._raycaster || !this._meshData.length) return;

    // Only update raycaster every other frame for perf
    if (!this._frameCount) this._frameCount = 0;
    this._frameCount++;
    if (this._frameCount % 2 !== 0) return;

    this._raycaster.setFromCamera(this._mouse, this.camera);
    var meshes = this._meshData.map(function (d) { return d.mesh; });
    var hits = this._raycaster.intersectObjects(meshes, false);

    var uiLayer = document.getElementById(this.uiLayerId);
    var labelEl = uiLayer ? uiLayer.querySelector('[data-infinite-gallery-label]') : null;

    if (hits.length > 0) {
      var mesh = hits[0].object;
      var data = mesh.userData || {};

      if (this._hoveredMesh !== mesh) {
        this._hoveredMesh = mesh;
        this.canvas.style.cursor = 'pointer';

        // Show label
        if (labelEl) {
          var textEl = labelEl.querySelector('.infinite-gallery-label__text') || labelEl;
          textEl.textContent = data.title || '';
          labelEl.hidden = false;
        }

        if (window.__IMMERSIVE_DEV__) {
          console.log('[InfiniteGallery] Hover:', data.title, data.productHandle);
        }
      }
    } else {
      if (this._hoveredMesh) {
        this._hoveredMesh = null;
        this.canvas.style.cursor = this._dragState.isDragging ? 'grabbing' : 'grab';
        if (labelEl) labelEl.hidden = true;
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  InfiniteGallery.prototype.goToItem = function (index) {
    var d = this._meshData[index];
    if (!d) return;
    var mesh = d.mesh;
    mesh.getWorldPosition(new THREE.Vector3());
    this.group.position.x -= mesh.position.x + this.group.position.x;
    this.group.position.y -= mesh.position.y + this.group.position.y;
    this._dragState.velocityX = 0;
    this._dragState.velocityY = 0;
  };

  InfiniteGallery.prototype.getVelocity = function () {
    return {
      x: this._dragState.velocityX,
      y: this._dragState.velocityY,
    };
  };

  // ---------------------------------------------------------------------------
  // Expose
  // ---------------------------------------------------------------------------
  window.InfiniteGallery = InfiniteGallery;
})();
