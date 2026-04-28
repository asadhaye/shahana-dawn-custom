/**
 * DOM utilities for focus management and accessibility
 * Extracted from immersive-store.js
 */

var FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
}

function openDialogFocus(dialog) {
  if (!dialog) return;
  var focusable = getFocusableElements(dialog);
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

function closeDialogFocus(triggerElement) {
  if (triggerElement && typeof triggerElement.focus === 'function') {
    triggerElement.focus();
  }
}

/**
 * Fade in content with smooth transition
 * @param {HTMLElement} container - DOM element to fade in
 * @param {string} html - HTML string to inject
 */
function fadeInContent(container, html) {
  if (!container) return;

  if (window.reduceMotion) {
    container.innerHTML = html;
    return;
  }

  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';

  setTimeout(function () {
    container.innerHTML = html;
    container.style.opacity = '1';
  }, 150);
}

/**
 * Fade out content with smooth transition
 * @param {HTMLElement} container - DOM element to fade out
 * @param {Function} callback - Function to call after fade-out
 */
function fadeOutContent(container, callback) {
  if (!container) {
    if (callback) callback();
    return;
  }

  if (window.reduceMotion) {
    if (callback) callback();
    return;
  }

  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';

  setTimeout(function () {
    if (callback) callback();
  }, 150);
}

/**
 * Announce text to screen readers
 * @param {string} label - Text to announce
 */
function announceHotspot(label) {
  var announcer = document.getElementById('immersive-hotspot-announcer');
  if (announcer) {
    announcer.textContent = label;
  }
}

// Export to global scope
window.ImmersiveDOM = {
  getFocusableElements: getFocusableElements,
  openDialogFocus: openDialogFocus,
  closeDialogFocus: closeDialogFocus,
  fadeInContent: fadeInContent,
  fadeOutContent: fadeOutContent,
  announceHotspot: announceHotspot,
  FOCUSABLE_SELECTORS: FOCUSABLE_SELECTORS,
};

// Backward-compatible global aliases
window.fadeInContent = fadeInContent;
window.fadeOutContent = fadeOutContent;
window.announceHotspot = announceHotspot;
