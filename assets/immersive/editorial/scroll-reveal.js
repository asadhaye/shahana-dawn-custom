/**
 * Editorial: scroll-reveal
 * TODO: Extract from immersive-store.js
 */

function initEditorialScrollReveal() {
  if (_esrWheelBound) return;
  var canvasWrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!canvasWrapper) return;
  canvasWrapper.addEventListener('wheel', _esrOnWheel, { passive: true });
  _esrWheelBound = true;
}

function _esrEaseOutParallax(durationMs, callback) {
  var startValue = typeof parallaxStrength !== 'undefined' ? parallaxStrength : 0;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var elapsed = ts - startTime;
    var t = Math.min(elapsed / durationMs, 1);
    if (typeof parallaxStrength !== 'undefined') {
      parallaxStrength = startValue * (1 - t);
    }
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (typeof parallaxStrength !== 'undefined') parallaxStrength = 0;
      if (typeof callback === 'function') callback();
    }
  }
  requestAnimationFrame(step);
}

function _esrTrigger() {
  if (!immersiveState || immersiveState.mode !== 'showroom') return;
  var editorialRooms = ['designer_houses', 'occasions', 'featured_collections'];
  if (editorialRooms.indexOf(immersiveState.currentRoom) === -1) return;

  var panel = document.getElementById('glass-panel');
  if (panel && (panel.classList.contains('is-active') || (!panel.hidden && !panel.classList.contains('hidden'))))
    return;

  if (_esrCooldown) return;

  _esrCooldown = true;
  setTimeout(function () {
    _esrCooldown = false;
  }, 700);

  var roomKey = immersiveState.currentRoom;
  var reduceMotionESR = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotionESR) {
    enterEditorialMode(roomKey, null);
  } else {
    _esrEaseOutParallax(300, function () {
      enterEditorialMode(roomKey, null);
    });
  }
}

function _esrOnWheel(event) {
  if (event.deltaY > 0) _esrTrigger();
}

function _esrOnSwipeDown(deltaX, deltaY) {
  var absDy = Math.abs(deltaY);
  var absDx = Math.abs(deltaX);
  if (absDy < 60) return;
  if (absDx > 0 && absDy / absDx <= 2.5) return;
  if (deltaY < 0) return; // must be downward (positive deltaY)
  _esrTrigger();
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Editorial Scroll Reveal Public API
 *
 * Provides functions for managing scroll-triggered editorial reveals.
 * When users scroll down in editorial rooms, the editorial overlay is revealed.
 *
 * Private helper functions (_esrEaseOutParallax, _esrTrigger, _esrOnWheel, _esrOnSwipeDown)
 * remain locally scoped as internal implementation details.
 *
 * @namespace ImmersiveScrollReveal
 */
if (typeof window !== 'undefined') {
  window.ImmersiveScrollReveal = {
    initEditorialScrollReveal: initEditorialScrollReveal,
  };

  // Backward-compatible global alias
  window.initEditorialScrollReveal = initEditorialScrollReveal;
}
