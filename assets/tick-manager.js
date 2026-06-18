/**
 * Immersive Theme Tick Manager
 *
 * Centralized requestAnimationFrame loop for all animations.
 * Replaces scattered rAF calls to prevent battery drain, jank, and leaks.
 *
 * @see https://shopify.dev/docs/themes/best-practices/optimize-your-javascript
 */

(function() {
  'use strict';

  var subscribers = new Set();
  var isRunning = false;
  var frameId = null;
  var lastTimestamp = 0;

  /**
   * Main animation loop
   * @param {number} timestamp - DOMHighResTimeStamp from rAF
   */
  function loop(timestamp) {
    // Calculate delta time (ms since last frame)
    var deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Notify all subscribers
    subscribers.forEach(function(fn) {
      try {
        fn(timestamp, deltaTime);
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) {
          console.error('[Immersive TickManager] Subscriber error:', e);
        }
      }
    });

    // Continue loop if there are subscribers
    if (subscribers.size > 0) {
      frameId = requestAnimationFrame(loop);
    } else {
      isRunning = false;
      frameId = null;
    }
  }

  /**
   * Start the animation loop
   */
  function start() {
    if (isRunning) return;
    isRunning = true;
    lastTimestamp = performance.now();
    frameId = requestAnimationFrame(loop);

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive TickManager] Started');
    }
  }

  /**
   * Stop the animation loop
   */
  function stop() {
    if (!isRunning) return;
    isRunning = false;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive TickManager] Stopped');
    }
  }

  /**
   * Subscribe a callback to the tick loop
   * @param {Function} fn - Callback receiving (timestamp, deltaTime)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(fn) {
    if (typeof fn !== 'function') {
      if (window.__IMMERSIVE_DEV__) {
        console.warn('[Immersive TickManager] subscribe() requires a function');
      }
      return function() {};
    }

    subscribers.add(fn);

    if (!isRunning) {
      start();
    }

    // Return unsubscribe function
    return function unsubscribe() {
      subscribers.delete(fn);

      // Auto-stop if no more subscribers
      if (subscribers.size === 0 && isRunning) {
        stop();
      }
    };
  }

  /**
   * Check if the tick manager is running
   * @returns {boolean}
   */
  function isRunningState() {
    return isRunning;
  }

  /**
   * Get number of active subscribers
   * @returns {number}
   */
  function getSubscriberCount() {
    return subscribers.size;
  }

  /**
   * Pause the tick loop temporarily (for debugging/testing)
   */
  function pause() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  /**
   * Resume the tick loop after pause
   */
  function resume() {
    if (subscribers.size > 0 && !isRunning) {
      start();
    }
  }

  // Expose API
  window.ImmersiveTheme = window.ImmersiveTheme || {};
  window.ImmersiveTheme.ticker = {
    subscribe: subscribe,
    start: start,
    stop: stop,
    isRunning: isRunningState,
    getCount: getSubscriberCount,
    pause: pause,
    resume: resume
  };

  // Auto-start on DOM ready if needed
  // (The loop will auto-stop when no subscribers remain)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Lazy start - only when first subscriber joins
    });
  }

})();