/* ============================================
   SHAHANA COLLECTION - CONFIGURATION FILE
   Customize your immersive store without editing core files
   ============================================ */

window.ImmersiveConfig = {
  
  // ============================================
  // IMAGES
  // ============================================
  images: {
    // Replace these with your Shopify asset filenames
    exterior: 'immersive-base.png',      // The dissolving image (Canvas One)
    interior: 'immersive-base.png',      // The revealing image (Canvas Two)
    depth: 'immersive-depth.png',        // Depth map for parallax effects
  },

  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Pakistani gold (Zardozi-inspired)
    primary: {
      hex: '#d4af37',
      rgb: { r: 212, g: 175, b: 55 },
      glsl: { r: 0.85, g: 0.65, b: 0.13 }  // RGB values 0.0-1.0 for shaders
    },
    
    // Background colors
    background: {
      dark: '#000000',
      panel: 'rgba(0, 0, 0, 0.75)'
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      accent: '#d4af37'
    }
  },

  // ============================================
  // SCROLL BEHAVIOR
  // ============================================
  scroll: {
    // When to show hotspots (0.0 = top, 1.0 = bottom)
    hotspotTrigger: 0.95,
    
    // Lenis smooth scroll settings
    duration: 1.2,              // Scroll duration (higher = slower)
    smoothness: 0.1,            // Smoothness factor (lower = smoother)
    
    // Easing function: 'linear', 'easeOut', 'easeInOut'
    easing: 'easeOut'
  },

  // ============================================
  // HOTSPOTS
  // ============================================
  hotspots: [
    {
      id: 'hotspot-1',
      label: 'DESIGNER HOUSES',
      collection: 'designer-houses',
      position: { top: '35%', left: '25%' }
    },
    {
      id: 'hotspot-2',
      label: 'OCCASIONS',
      collection: 'occasions',
      position: { top: '50%', left: '60%' }
    },
    {
      id: 'hotspot-3',
      label: 'FEATURED COLLECTIONS',
      collection: 'featured',
      position: { top: '65%', left: '35%' }
    }
  ],

  // ============================================
  // SHADER EFFECTS
  // ============================================
  shaders: {
    // Edge detection sensitivity (0.0-1.0)
    // Lower = more edges detected, Higher = fewer edges
    edgeThreshold: 0.15,
    
    // Edge glow intensity (1.0-5.0)
    edgeGlowIntensity: 2.0,
    
    // Dissolve speed multiplier (0.5-2.0)
    // Higher = faster dissolve
    dissolveSpeed: 1.0,
    
    // Animation speed for pulsing effects
    pulseSpeed: 2.0
  },

  // ============================================
  // GLASS PANEL
  // ============================================
  panel: {
    // Panel width (pixels or 'auto' for responsive)
    width: 600,
    
    // Blur amount for backdrop filter
    blurAmount: 24,
    
    // Animation duration (seconds)
    animationDuration: 0.6,
    
    // Products per page
    productsPerPage: 8
  },

  // ============================================
  // PERFORMANCE
  // ============================================
  performance: {
    // Maximum pixel ratio (1-3)
    // Lower = better performance, Higher = sharper on retina displays
    maxPixelRatio: 2,
    
    // Enable/disable shader animations
    enableAnimations: true,
    
    // Texture quality: 'low' (1024), 'medium' (1920), 'high' (2560)
    textureQuality: 'medium'
  },

  // ============================================
  // ACCESSIBILITY
  // ============================================
  accessibility: {
    // Enable keyboard navigation
    keyboardNav: true,
    
    // Reduce motion for users who prefer it
    respectReducedMotion: true,
    
    // Focus outline color
    focusColor: '#d4af37'
  },

  // ============================================
  // ANALYTICS (Optional)
  // ============================================
  analytics: {
    // Track hotspot clicks
    trackHotspots: true,
    
    // Track scroll depth
    trackScroll: true,
    
    // Google Analytics event category
    eventCategory: 'Immersive Store'
  },

  // ============================================
  // MOBILE SETTINGS
  // ============================================
  mobile: {
    // Disable smooth scroll on mobile (recommended for iOS)
    disableSmoothScroll: true,
    
    // Full-width panel on mobile
    fullWidthPanel: true,
    
    // Reduce shader quality on mobile
    reducedShaderQuality: true
  },

  // ============================================
  // DEBUG MODE
  // ============================================
  debug: {
    // Enable console logging
    enabled: false,
    
    // Show scroll progress indicator
    showScrollProgress: false,
    
    // Show FPS counter
    showFPS: false
  }

};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Convert hex to RGB
window.ImmersiveConfig.hexToRgb = function(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Convert RGB to GLSL format (0.0-1.0)
window.ImmersiveConfig.rgbToGlsl = function(r, g, b) {
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255
  };
};

// Get texture quality dimensions
window.ImmersiveConfig.getTextureSize = function() {
  const quality = this.performance.textureQuality;
  const sizes = {
    low: 1024,
    medium: 1920,
    high: 2560
  };
  return sizes[quality] || 1920;
};

// Check if user prefers reduced motion
window.ImmersiveConfig.prefersReducedMotion = function() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Log debug message
window.ImmersiveConfig.log = function(message, type = 'info') {
  if (!this.debug.enabled) return;
  
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${emoji[type] || 'ℹ️'} ${message}`);
};

// Track analytics event
window.ImmersiveConfig.trackEvent = function(action, label, value) {
  if (!this.analytics.trackHotspots && !this.analytics.trackScroll) return;
  
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: this.analytics.eventCategory,
      event_label: label,
      value: value
    });
  }
  
  // Google Analytics Universal
  if (typeof ga !== 'undefined') {
    ga('send', 'event', this.analytics.eventCategory, action, label, value);
  }
  
  this.log(`Event tracked: ${action} - ${label}`, 'success');
};

// ============================================
// INITIALIZATION CHECK
// ============================================

if (window.ImmersiveConfig.debug.enabled) {
  console.log('🎨 Immersive Config Loaded:', window.ImmersiveConfig);
}

// Export for use in immersive-store.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.ImmersiveConfig;
}
