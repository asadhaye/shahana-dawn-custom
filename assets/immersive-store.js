/* ============================================
   SHAHANA COLLECTION - IMMERSIVE STORE ENGINE
   WebGL + Lenis Scroll-Driven Experience
   Three.js r172 | Vanilla JavaScript
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // GLOBAL STATE
  // ============================================
  let scrollProgress = 0;
  let lenis = null;
  let rendererOne = null;
  let rendererTwo = null;
  let sceneOne = null;
  let sceneTwo = null;
  let cameraOne = null;
  let cameraTwo = null;
  let materialOne = null;
  let materialTwo = null;
  let meshOne = null;
  let meshTwo = null;
  let time = 0;

  // Viewport dimensions
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  // ============================================
  // SHADER DEFINITIONS
  // ============================================

  // Vertex Shader (shared by both canvases)
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment Shader 1: THE DISSOLVE (Canvas One - Exterior)
  // As scroll progresses, the image dissolves from center outward
  // Applies edge detection with golden glow (Zardozi-inspired)
  const fragmentShaderOne = `
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform sampler2D tDiffuse;
    
    varying vec2 vUv;
    
    // Sobel edge detection kernel
    const mat3 sobelX = mat3(
      -1.0, 0.0, 1.0,
      -2.0, 0.0, 2.0,
      -1.0, 0.0, 1.0
    );
    
    const mat3 sobelY = mat3(
      -1.0, -2.0, -1.0,
       0.0,  0.0,  0.0,
       1.0,  2.0,  1.0
    );
    
    // Pakistani gold color (Zardozi/Gota work inspired)
    const vec3 goldColor = vec3(0.85, 0.65, 0.13);
    
    // Sample texture with offset for edge detection
    vec3 sampleTexture(vec2 uv, vec2 offset) {
      vec2 sampleUV = uv + offset / uResolution;
      // Clamp to avoid edge artifacts
      sampleUV = clamp(sampleUV, 0.0, 1.0);
      return texture2D(tDiffuse, sampleUV).rgb;
    }
    
    // Calculate edge intensity using Sobel operator
    float calculateEdge(vec2 uv) {
      float pixelSize = 1.0;
      
      // Sample 3x3 neighborhood
      float gx = 0.0;
      float gy = 0.0;
      
      for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
          vec2 offset = vec2(float(i), float(j)) * pixelSize;
          vec3 sample = sampleTexture(uv, offset);
          float luminance = dot(sample, vec3(0.299, 0.587, 0.114));
          
          // Apply Sobel kernels
          float sx = sobelX[i+1][j+1];
          float sy = sobelY[i+1][j+1];
          
          gx += luminance * sx;
          gy += luminance * sy;
        }
      }
      
      // Calculate edge magnitude
      return sqrt(gx * gx + gy * gy);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample original texture
      vec4 texColor = texture2D(tDiffuse, uv);
      
      // Calculate distance from center (for radial dissolve)
      vec2 center = vec2(0.5, 0.5);
      float distFromCenter = distance(uv, center);
      
      // Normalize distance (0.0 at center, 1.0 at corners)
      float maxDist = distance(vec2(0.0, 0.0), center);
      float normalizedDist = distFromCenter / maxDist;
      
      // Calculate dissolve threshold based on progress and distance
      // As uProgress increases, dissolve expands outward from center
      float dissolveThreshold = uProgress * 1.5;
      float dissolveFactor = smoothstep(dissolveThreshold - 0.2, dissolveThreshold + 0.2, normalizedDist);
      
      // Calculate edge intensity
      float edgeIntensity = calculateEdge(uv);
      
      // Enhance edges in the dissolve region
      float edgeThreshold = 0.15;
      float isEdge = smoothstep(edgeThreshold - 0.05, edgeThreshold + 0.05, edgeIntensity);
      
      // Convert to grayscale as it dissolves
      float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      vec3 grayColor = vec3(gray);
      
      // Mix between color and grayscale based on progress
      vec3 desaturated = mix(texColor.rgb, grayColor, uProgress * 0.8);
      
      // Apply golden edge glow
      vec3 edgeGlow = goldColor * isEdge * (1.0 - dissolveFactor) * 2.0;
      
      // Add subtle animation to edge glow
      float pulse = sin(uTime * 2.0 + normalizedDist * 10.0) * 0.5 + 0.5;
      edgeGlow *= (0.7 + pulse * 0.3);
      
      // Combine desaturated image with edge glow
      vec3 finalColor = desaturated + edgeGlow;
      
      // Calculate final opacity
      // Edges remain visible longer, then fade to transparent
      float edgeOpacity = isEdge * (1.0 - smoothstep(0.7, 1.0, uProgress));
      float baseOpacity = 1.0 - dissolveFactor;
      float finalOpacity = max(baseOpacity, edgeOpacity);
      
      gl_FragColor = vec4(finalColor, finalOpacity * texColor.a);
    }
  `;

  // Fragment Shader 2: THE REVEAL (Canvas Two - Lounge Interior)
  // Starts dark with golden edge-detected lines
  // As scroll progresses, reveals full-color image
  const fragmentShaderTwo = `
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform sampler2D tDiffuse;
    
    varying vec2 vUv;
    
    // Sobel edge detection kernel
    const mat3 sobelX = mat3(
      -1.0, 0.0, 1.0,
      -2.0, 0.0, 2.0,
      -1.0, 0.0, 1.0
    );
    
    const mat3 sobelY = mat3(
      -1.0, -2.0, -1.0,
       0.0,  0.0,  0.0,
       1.0,  2.0,  1.0
    );
    
    // Pakistani gold color
    const vec3 goldColor = vec3(0.85, 0.65, 0.13);
    
    // Sample texture with offset
    vec3 sampleTexture(vec2 uv, vec2 offset) {
      vec2 sampleUV = uv + offset / uResolution;
      sampleUV = clamp(sampleUV, 0.0, 1.0);
      return texture2D(tDiffuse, sampleUV).rgb;
    }
    
    // Calculate edge intensity
    float calculateEdge(vec2 uv) {
      float pixelSize = 1.0;
      
      float gx = 0.0;
      float gy = 0.0;
      
      for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
          vec2 offset = vec2(float(i), float(j)) * pixelSize;
          vec3 sample = sampleTexture(uv, offset);
          float luminance = dot(sample, vec3(0.299, 0.587, 0.114));
          
          float sx = sobelX[i+1][j+1];
          float sy = sobelY[i+1][j+1];
          
          gx += luminance * sx;
          gy += luminance * sy;
        }
      }
      
      return sqrt(gx * gx + gy * gy);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample original texture
      vec4 texColor = texture2D(tDiffuse, uv);
      
      // Calculate edge intensity
      float edgeIntensity = calculateEdge(uv);
      float edgeThreshold = 0.15;
      float isEdge = smoothstep(edgeThreshold - 0.05, edgeThreshold + 0.05, edgeIntensity);
      
      // Calculate distance from center for radial reveal
      vec2 center = vec2(0.5, 0.5);
      float distFromCenter = distance(uv, center);
      float maxDist = distance(vec2(0.0, 0.0), center);
      float normalizedDist = distFromCenter / maxDist;
      
      // Reverse progress (starts at 1.0, ends at 0.0)
      float reverseProgress = 1.0 - uProgress;
      
      // Calculate reveal factor (opposite of dissolve)
      float revealThreshold = reverseProgress * 1.5;
      float revealFactor = 1.0 - smoothstep(revealThreshold - 0.2, revealThreshold + 0.2, normalizedDist);
      
      // Start with dark background
      vec3 darkColor = vec3(0.05, 0.05, 0.08);
      
      // Golden edge glow (strong at start, fades as image reveals)
      vec3 edgeGlow = goldColor * isEdge * reverseProgress * 3.0;
      
      // Add animation to edge glow
      float pulse = sin(uTime * 2.0 + normalizedDist * 10.0) * 0.5 + 0.5;
      edgeGlow *= (0.7 + pulse * 0.3);
      
      // Mix between dark+edges and full color based on reveal
      vec3 edgeOnlyColor = darkColor + edgeGlow;
      vec3 finalColor = mix(edgeOnlyColor, texColor.rgb, revealFactor);
      
      // Brightness adjustment - starts dark, gets brighter
      float brightness = 0.3 + revealFactor * 0.7;
      finalColor *= brightness;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    console.log('🎨 Initializing Shahana Collection Immersive Store...');
    
    initLenis();
    initWebGL();
    initHotspots();
    initGlassPanel();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('✨ Immersive Store Ready');
  }

  // ============================================
  // LENIS SMOOTH SCROLL SETUP
  // ============================================

  function initLenis() {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2
    });

    console.log('📜 Lenis smooth scroll initialized');
  }

  // ============================================
  // WEBGL SETUP
  // ============================================

  function initWebGL() {
    const canvasOne = document.getElementById('canvas-one');
    const canvasTwo = document.getElementById('canvas-two');

    if (!canvasOne || !canvasTwo) {
      console.error('Canvas elements not found');
      return;
    }

    // Initialize renderers
    rendererOne = new THREE.WebGLRenderer({
      canvas: canvasOne,
      alpha: true,
      antialias: true
    });
    rendererOne.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererOne.setSize(viewportWidth, viewportHeight);

    rendererTwo = new THREE.WebGLRenderer({
      canvas: canvasTwo,
      alpha: false,
      antialias: true
    });
    rendererTwo.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererTwo.setSize(viewportWidth, viewportHeight);

    // Create scenes
    sceneOne = new THREE.Scene();
    sceneTwo = new THREE.Scene();

    // Create orthographic cameras for full-screen effect
    const aspect = viewportWidth / viewportHeight;
    cameraOne = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    cameraOne.position.z = 1;

    cameraTwo = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    cameraTwo.position.z = 1;

    // Create full-screen plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Load placeholder textures
    // TODO: Replace these URLs with actual Shopify asset URLs
    const textureLoader = new THREE.TextureLoader();
    
    // Placeholder: Exterior image for Canvas One
    const textureOne = textureLoader.load(
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
      () => console.log('✅ Texture One loaded')
    );
    
    // Placeholder: Interior lounge image for Canvas Two
    const textureTwo = textureLoader.load(
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
      () => console.log('✅ Texture Two loaded')
    );

    // Create shader materials
    materialOne = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewportWidth, viewportHeight) },
        tDiffuse: { value: textureOne }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShaderOne,
      transparent: true
    });

    materialTwo = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewportWidth, viewportHeight) },
        tDiffuse: { value: textureTwo }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShaderTwo,
      transparent: false
    });

    // Create meshes
    meshOne = new THREE.Mesh(geometry, materialOne);
    meshTwo = new THREE.Mesh(geometry, materialTwo);

    // Add to scenes
    sceneOne.add(meshOne);
    sceneTwo.add(meshTwo);

    console.log('🎬 WebGL scenes initialized');
  }

  // ============================================
  // HOTSPOT INTERACTION
  // ============================================

  function initHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    
    hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', handleHotspotClick);
    });

    console.log(`🎯 ${hotspots.length} hotspots initialized`);
  }

  function handleHotspotClick(e) {
    e.preventDefault();
    
    const collection = this.dataset.collection;
    console.log(`🔍 Loading collection: ${collection}`);
    
    // Blur the canvas
    const canvasWrapper = document.getElementById('canvas-wrapper');
    canvasWrapper.classList.add('blurred');
    
    // Open glass panel
    const glassPanel = document.getElementById('glass-panel');
    glassPanel.classList.add('open');
    
    // Fetch products via Shopify Section Rendering API
    loadProducts(collection);
  }

  // ============================================
  // GLASS PANEL & AJAX ROUTING
  // ============================================

  function initGlassPanel() {
    const closeButton = document.getElementById('close-panel');
    
    if (closeButton) {
      closeButton.addEventListener('click', closeGlassPanel);
    }
  }

  function closeGlassPanel() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const glassPanel = document.getElementById('glass-panel');
    
    canvasWrapper.classList.remove('blurred');
    glassPanel.classList.remove('open');
    
    console.log('❌ Glass panel closed');
  }

  function loadProducts(collection) {
    const panelContent = document.getElementById('panel-content');
    
    // Show loading spinner
    panelContent.innerHTML = '<div class="loading-spinner"></div>';
    
    // Fetch products from Shopify Section Rendering API
    // The section_id parameter tells Shopify which section to render
    fetch(`/?section_id=immersive-product-grid&collection=${collection}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        // Inject the HTML into the panel
        panelContent.innerHTML = html;
        console.log(`✅ Products loaded for: ${collection}`);
        
        // Initialize any interactive elements in the loaded content
        initProductCards();
      })
      .catch(error => {
        console.error('❌ Error loading products:', error);
        panelContent.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #d4af37;">
            <p>Unable to load products.</p>
            <p style="font-size: 14px; opacity: 0.7;">Please try again.</p>
          </div>
        `;
      });
  }

  function initProductCards() {
    // Add any additional interactivity to product cards
    const addToCartButtons = document.querySelectorAll('.immersive-add-to-cart');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', handleAddToCart);
    });
  }

  function handleAddToCart(e) {
    e.preventDefault();
    
    const form = this.closest('form');
    const formData = new FormData(form);
    
    // Add to cart via Shopify AJAX API
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('✅ Added to cart:', data);
      
      // Visual feedback
      this.textContent = 'ADDED ✓';
      this.style.background = 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)';
      
      setTimeout(() => {
        this.textContent = 'ADD TO CART';
        this.style.background = '';
      }, 2000);
    })
    .catch(error => {
      console.error('❌ Error adding to cart:', error);
      this.textContent = 'ERROR';
      setTimeout(() => {
        this.textContent = 'ADD TO CART';
      }, 2000);
    });
  }

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function animate() {
    requestAnimationFrame(animate);
    
    // Update Lenis
    if (lenis) {
      lenis.raf(Date.now());
      
      // Calculate scroll progress (0.0 to 1.0)
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      
      // Show hotspots when scroll reaches 95%
      if (scrollProgress >= 0.95) {
        showHotspots();
      } else {
        hideHotspots();
      }
    }
    
    // Update time
    time += 0.01;
    
    // Update shader uniforms
    if (materialOne) {
      materialOne.uniforms.uTime.value = time;
      materialOne.uniforms.uProgress.value = scrollProgress;
    }
    
    if (materialTwo) {
      materialTwo.uniforms.uTime.value = time;
      materialTwo.uniforms.uProgress.value = scrollProgress;
    }
    
    // Render scenes
    if (rendererOne && sceneOne && cameraOne) {
      rendererOne.render(sceneOne, cameraOne);
    }
    
    if (rendererTwo && sceneTwo && cameraTwo) {
      rendererTwo.render(sceneTwo, cameraTwo);
    }
  }

  // ============================================
  // HOTSPOT VISIBILITY
  // ============================================

  function showHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(hotspot => {
      hotspot.classList.add('visible');
    });
  }

  function hideHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(hotspot => {
      hotspot.classList.remove('visible');
    });
  }

  // ============================================
  // WINDOW RESIZE HANDLER
  // ============================================

  function onWindowResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    
    const aspect = viewportWidth / viewportHeight;
    
    // Update cameras
    if (cameraOne) {
      cameraOne.left = -aspect;
      cameraOne.right = aspect;
      cameraOne.updateProjectionMatrix();
    }
    
    if (cameraTwo) {
      cameraTwo.left = -aspect;
      cameraTwo.right = aspect;
      cameraTwo.updateProjectionMatrix();
    }
    
    // Update renderers
    if (rendererOne) {
      rendererOne.setSize(viewportWidth, viewportHeight);
    }
    
    if (rendererTwo) {
      rendererTwo.setSize(viewportWidth, viewportHeight);
    }
    
    // Update shader resolution uniforms
    if (materialOne) {
      materialOne.uniforms.uResolution.value.set(viewportWidth, viewportHeight);
    }
    
    if (materialTwo) {
      materialTwo.uniforms.uResolution.value.set(viewportWidth, viewportHeight);
    }
    
    console.log(`📐 Resized to ${viewportWidth}x${viewportHeight}`);
  }

  // ============================================
  // START APPLICATION
  // ============================================

  // Wait for DOM and Three.js to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
