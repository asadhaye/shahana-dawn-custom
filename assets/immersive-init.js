/* Shahana Collection - Immersive Store Initialization */
(function() {
  'use strict';
  
  // Wait for libraries to be available
  function initWhenReady() {
    // Check if THREE is available and expose it
    if (typeof THREE !== 'undefined' && !window.THREE) {
      window.THREE = THREE;
      console.log('✅ THREE.js exposed to window');
    }
    
    // Check if Lenis is available and expose it
    if (typeof Lenis !== 'undefined' && !window.Lenis) {
      window.Lenis = Lenis;
      console.log('✅ Lenis exposed to window');
    }
    
    if (typeof window.THREE === 'undefined' || typeof window.Lenis === 'undefined') {
      console.log('⏳ Waiting for THREE.js and Lenis...');
      setTimeout(initWhenReady, 100);
      return;
    }
    
    console.log('🎨 Initializing Shahana Collection Immersive Store...');
    
    // Initialize Lenis smooth scroll
    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    });
    
    window.lenis = lenis;
    console.log('📜 Lenis initialized');
    
    // Dispatch ready event for sections
    const event = new CustomEvent('immersive:ready', { 
      detail: { THREE: window.THREE, lenis: window.lenis } 
    });
    document.dispatchEvent(event);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
