/**
 * Editorial: hero-parallax
 * TODO: Extract from immersive-store.js
 */

function initEditorialHeroParallax() {
  var reduceMotionEHP = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionEHP) return;

  _ehpOverlay = document.getElementById('immersive-editorial-overlay');
  if (!_ehpOverlay) return;

  _ehpHeroImg = _ehpOverlay.querySelector('.immersive-editorial__hero-bg');
  if (!_ehpHeroImg) {
    destroyEditorialHeroParallax();
    return;
  }

  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;

  _ehpOverlay.addEventListener('scroll', _ehpOnScroll, { passive: true });
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

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

function _ehpOnScroll() {
  if (!_ehpOverlay) return;
  _ehpScrollTarget = Math.min(Math.max(_ehpOverlay.scrollTop * 0.3, 0), 60);
}

function _ehpLoop() {
  _ehpScrollCurrent += (_ehpScrollTarget - _ehpScrollCurrent) * 0.08;
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = 'translateY(' + _ehpScrollCurrent + 'px)';
  }
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Editorial Hero Parallax Public API
 *
 * Provides functions for managing hero parallax effects in editorial overlays.
 * The hero parallax creates a smooth scrolling effect on editorial hero images.
 *
 * Private helper functions (_ehpOnScroll, _ehpLoop) remain locally scoped
 * as internal implementation details.
 *
 * @namespace ImmersiveEditorialParallax
 */
if (typeof window !== 'undefined') {
  window.ImmersiveEditorialParallax = {
    initEditorialHeroParallax: initEditorialHeroParallax,
    destroyEditorialHeroParallax: destroyEditorialHeroParallax,
  };

  // Backward-compatible global aliases
  window.initEditorialHeroParallax = initEditorialHeroParallax;
  window.destroyEditorialHeroParallax = destroyEditorialHeroParallax;
}
