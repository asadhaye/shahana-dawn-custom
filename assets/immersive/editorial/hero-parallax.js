/**
 * Editorial: hero-parallax
 *
 * Scroll-linked parallax effect for the editorial overlay hero image.
 * Translates `.immersive-editorial__hero-bg` vertically at 30% of the
 * overlay's scrollTop, clamped to a maximum of 60px, using a lerped
 * requestAnimationFrame loop for smooth motion.
 *
 * Depends on globals from immersive-store.js: none (self-contained).
 * Reads window.reduceMotion if available, but also checks matchMedia directly.
 *
 * Load order: after immersive-store.js, before editorial-mode.js.
 */

// ── Private state ────────────────────────────────────────────────────────────
var _ehpScrollTarget = 0; // target scroll offset (set by scroll listener)
var _ehpScrollCurrent = 0; // current lerped offset (updated in rAF loop)
var _ehpRafId = null; // requestAnimationFrame handle
var _ehpOverlay = null; // cached #immersive-editorial-overlay element
var _ehpHeroImg = null; // cached .immersive-editorial__hero-bg element

// ── Private helpers ──────────────────────────────────────────────────────────

/**
 * Scroll listener: updates the target offset from the overlay's scrollTop.
 * Clamped to [0, 60] — 30% of scroll position, max 60px.
 */
function _ehpOnScroll() {
  if (!_ehpOverlay) return;
  _ehpScrollTarget = Math.min(Math.max(_ehpOverlay.scrollTop * 0.3, 0), 60);
}

/**
 * rAF loop: lerps _ehpScrollCurrent toward _ehpScrollTarget (factor 0.08),
 * applies the result as a translateY transform on the hero image, then
 * schedules the next frame.
 */
function _ehpLoop() {
  _ehpScrollCurrent += (_ehpScrollTarget - _ehpScrollCurrent) * 0.08;
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = 'translateY(' + _ehpScrollCurrent + 'px)';
  }
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise the hero parallax effect.
 *
 * Guards:
 *  - Returns immediately if prefers-reduced-motion is active.
 *  - Calls destroyEditorialHeroParallax() and returns if the overlay or hero
 *    image element cannot be found in the DOM.
 *
 * On success: resets state, attaches a passive scroll listener to the overlay,
 * and starts the rAF loop.
 */
function initEditorialHeroParallax() {
  // Reduced-motion guard — check both the global flag (set by monolith) and
  // matchMedia directly so this module works standalone in tests.
  var reduceMotionEHP =
    (typeof reduceMotion !== 'undefined' && reduceMotion) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionEHP) return;

  _ehpOverlay = document.getElementById('immersive-editorial-overlay');
  if (!_ehpOverlay) {
    destroyEditorialHeroParallax();
    return;
  }

  _ehpHeroImg = _ehpOverlay.querySelector('.immersive-editorial__hero-bg');
  if (!_ehpHeroImg) {
    destroyEditorialHeroParallax();
    return;
  }

  // Reset state before (re-)attaching
  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;

  _ehpOverlay.addEventListener('scroll', _ehpOnScroll, { passive: true });
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

/**
 * Tear down the hero parallax effect.
 *
 * Cancels the active rAF loop, removes the scroll listener, resets the hero
 * image transform to an empty string, and nulls all private state.
 */
function destroyEditorialHeroParallax() {
  if (_ehpOverlay) _ehpOverlay.removeEventListener('scroll', _ehpOnScroll);
  if (_ehpRafId !== null) {
    cancelAnimationFrame(_ehpRafId);
    _ehpRafId = null;
  }
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = '';
  }
  _ehpOverlay = null;
  _ehpHeroImg = null;
  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;
}

// ── Global namespace exposure ────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  /**
   * Namespace object for structured access.
   * @namespace ImmersiveHeroParallax
   */
  window.ImmersiveHeroParallax = {
    init: initEditorialHeroParallax,
    destroy: destroyEditorialHeroParallax,
  };

  // Backward-compatible flat aliases — used by editorial-mode.js and any
  // inline Liquid event handlers that call these functions directly.
  window.initEditorialHeroParallax = initEditorialHeroParallax;
  window.destroyEditorialHeroParallax = destroyEditorialHeroParallax;
}
