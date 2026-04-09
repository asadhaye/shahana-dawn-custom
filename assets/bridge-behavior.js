/**
 * Bridge Behavior Script
 * Detects device constraints (slow connections, motion sensitivity) and modifies bridge UI accordingly
 * Runs on all pages (2D and 3D) to provide device-aware warnings
 */

/**
 * Detects if the user is on a slow connection
 * Uses navigator.connection API with feature detection
 * @returns {boolean} true if slow connection detected, false otherwise
 */
function detectSlowConnection() {
  // Feature detection guard
  if (!navigator.connection) return false;

  var conn = navigator.connection;
  var saveData = conn.saveData || false;
  var effectiveType = conn.effectiveType || '';

  return saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;
}

/**
 * Applies constraint warnings to bridge elements
 * Modifies heading text and adds CSS modifier classes for slow connections and motion sensitivity
 * @param {HTMLElement} bridge - The bridge element with data-immersive-bridge attribute
 * @param {boolean} isSlowConnection - Whether user is on a slow connection
 * @param {boolean} hasReducedMotion - Whether user has prefers-reduced-motion enabled
 */
function applyConstraintWarning(bridge, isSlowConnection, hasReducedMotion) {
  // Only apply warning to bridges pointing to 3D store
  var href = bridge.getAttribute('href') || '';
  var is3DLink = href.indexOf('/pages/immersive-store') !== -1 || href.indexOf('?open_') !== -1;
  if (!is3DLink) return;

  // Modify heading text with warning message for slow connections
  if (isSlowConnection) {
    bridge.classList.add('immersive-bridge-banner--slow-connection');
    var label = bridge.querySelector('.immersive-bridge-btn__label');
    if (label) {
      var warningMsg = bridge.getAttribute('data-slow-connection-warning') || 'Optimized for faster connections';
      label.textContent = warningMsg;
    }
  }

  // Add reduced motion class if motion sensitivity is high
  if (hasReducedMotion) {
    bridge.classList.add('immersive-bridge-banner--reduced-motion');
  }
}

/**
 * Initializes bridge behavior detection and applies constraints
 * Runs on DOMContentLoaded
 */
function initBridgeBehavior() {
  var bridges = document.querySelectorAll('[data-immersive-bridge]');
  if (!bridges.length) return;

  var isSlowConnection = detectSlowConnection();
  var hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bridges.forEach(function (bridge) {
    if (isSlowConnection || hasReducedMotion) {
      applyConstraintWarning(bridge, isSlowConnection, hasReducedMotion);
    }
  });
}

// Run on DOMContentLoaded or immediately if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBridgeBehavior);
} else {
  initBridgeBehavior();
}
