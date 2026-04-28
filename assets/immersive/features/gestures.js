/**
 * Feature: gestures
 * TODO: Extract from immersive-store.js
 */

function initImmersiveGestures() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvasWrapper = document.getElementById('immersive-canvas') || document.querySelector('.immersive-store');
  if (!canvasWrapper) return;

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;

  canvasWrapper.addEventListener(
    'touchstart',
    function (e) {
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true },
  );

  canvasWrapper.addEventListener(
    'touchmove',
    function () {
      // passive — no action needed, just prevent jank
    },
    { passive: true },
  );

  canvasWrapper.addEventListener(
    'touchend',
    function (e) {
      // Ignore gestures starting on interactive elements
      var target = e.target;
      if (
        target &&
        target.closest('button, a, input, select, textarea, [role="radio"], [role="option"], [data-immersive-search]')
      )
        return;

      var touch = e.changedTouches[0];
      var deltaX = touch.clientX - touchStartX;
      var deltaY = touch.clientY - touchStartY;
      var elapsed = Date.now() - touchStartTime;

      // Ignore slow drags (> 600ms — likely a scroll, not a swipe)
      if (elapsed > 600) return;

      var gesture = classifyGesture(deltaX, deltaY);
      if (gesture === 'none') return;

      var glassPanel = document.getElementById('glass-panel');
      var panelOpen = glassPanel && !glassPanel.hidden && !glassPanel.classList.contains('hidden');

      if (gesture === 'horizontal') {
        // Cooldown guard
        var now = Date.now();
        if (now - _gestureLastRoomTransition < _gestureCooldown) return;
        _gestureLastRoomTransition = now;

        if (panelOpen) return; // Don't change rooms while panel is open

        // Find current room and navigate
        var currentRoom = (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'storefront';
        var idx = SWIPE_ROOM_SEQUENCE.indexOf(currentRoom);
        if (idx === -1) idx = 0;

        var nextIdx;
        if (deltaX < 0) {
          // Swipe left → next room
          nextIdx = (idx + 1) % SWIPE_ROOM_SEQUENCE.length;
        } else {
          // Swipe right → previous room
          nextIdx = (idx - 1 + SWIPE_ROOM_SEQUENCE.length) % SWIPE_ROOM_SEQUENCE.length;
        }

        if (typeof goToRoom === 'function') {
          goToRoom(SWIPE_ROOM_SEQUENCE[nextIdx], reduceMotion ? 'instant' : undefined);
        }
      } else if (gesture === 'vertical-down' && panelOpen) {
        // Swipe down → close panel
        var closeBtn = glassPanel && glassPanel.querySelector('.immersive-store__panel-close');
        if (closeBtn) closeBtn.click();
      } else if (gesture === 'vertical-down' && !panelOpen) {
        // Swipe down + panel closed → scroll-to-reveal editorial
        _esrOnSwipeDown(deltaX, deltaY);
      } else if (gesture === 'vertical-up' && !panelOpen) {
        // Swipe up → open wishlist
        var wishlistOpenBtn = document.querySelector('[data-wishlist-open]');
        if (wishlistOpenBtn) wishlistOpenBtn.click();
      }
    },
    { passive: true },
  );
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Gestures Public API
 *
 * Provides functions for managing touch gestures in the immersive store.
 * Supports swipe gestures for room navigation, panel closing, and wishlist access.
 *
 * Private helper functions and gesture classification logic remain locally scoped
 * as internal implementation details.
 *
 * @namespace ImmersiveGestures
 */
if (typeof window !== 'undefined') {
  window.ImmersiveGestures = {
    initImmersiveGestures: initImmersiveGestures,
  };

  // Backward-compatible global alias
  window.initImmersiveGestures = initImmersiveGestures;
}
