/**
 * Fluid Reveal — SVG filter hover effect on product card images
 * Feature: skeleton-fluid-reveal
 *
 * Exposes window.ImmersiveFluidReveal = { init, destroy, isActive }
 *
 * Design: One shared SVG feTurbulence + feDisplacementMap filter, one shared RAF loop.
 * Only one card can be hovered at a time. The loop starts on mouseenter and stops
 * automatically when scaleCurrent drops below 0.001 after mouseleave.
 *
 * Guards: prefers-reduced-motion, hover:none, enabled=false, CSS.supports check.
 * Does NOT touch webgl-engine.js or the Three.js render loop.
 */

var _rafId = null;
var _activeCard = null;
var _filterEl = null;
var _turbulenceEl = null;
var _time = 0;
var _lastFrameTime = 0;
var _maxScale = 30;
var _lerpAlpha = 0.06;
var _cardStates = null; // WeakMap

function _injectSvgFilter() {
  if (document.getElementById('immersive-fluid-filter-svg')) return true;
  try {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'immersive-fluid-filter-svg';
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    svg.innerHTML =
      '<defs><filter id="immersive-fluid-filter" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="3" seed="2" result="noise"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter></defs>';
    document.body.appendChild(svg);
    _filterEl = svg.querySelector('feDisplacementMap');
    _turbulenceEl = svg.querySelector('feTurbulence');
    return true;
  } catch (e) {
    console.warn('[FluidReveal] Could not inject SVG filter:', e);
    return false;
  }
}

function _startRaf() {
  if (_rafId !== null) return;
  _lastFrameTime = performance.now();
  function loop(now) {
    try {
      var delta = Math.min((now - _lastFrameTime) / 1000, 0.1);
      _lastFrameTime = now;
      _time += delta;

      if (_activeCard && _cardStates) {
        var state = _cardStates.get(_activeCard);
        if (state) {
          state.scaleCurrent += (state.scaleTarget - state.scaleCurrent) * _lerpAlpha;
          if (Math.abs(state.scaleCurrent - state.scaleTarget) < 0.001) {
            state.scaleCurrent = state.scaleTarget;
          }

          if (_filterEl) {
            _filterEl.setAttribute('scale', state.scaleCurrent.toFixed(2));
          }
          if (_turbulenceEl && state.scaleCurrent > 0.001) {
            var freq = (0.015 + Math.sin(_time * 0.8) * 0.005).toFixed(4);
            _turbulenceEl.setAttribute('baseFrequency', freq + ' ' + freq);
          }

          // Apply/remove CSS filter on the image element
          if (state.imageEl) {
            if (state.scaleCurrent > 0.001) {
              state.imageEl.style.filter = 'url(#immersive-fluid-filter)';
            } else if (state.scaleTarget === 0) {
              state.imageEl.style.filter = '';
            }
          }

          // Stop RAF when fully at rest
          if (state.scaleCurrent < 0.001 && state.scaleTarget === 0) {
            _rafId = null;
            return;
          }
        }
      }
    } catch (e) {
      console.warn('[FluidReveal] RAF error:', e);
      _rafId = null;
      return;
    }
    _rafId = requestAnimationFrame(loop);
  }
  _rafId = requestAnimationFrame(loop);
}

function _stopRaf() {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
}

function init(cards, options) {
  // Guards
  if (typeof window.matchMedia !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (options && options.enabled === false) return;
  if (!CSS || !CSS.supports || !CSS.supports('filter', 'url(#f)')) return;

  _maxScale = options && options.maxScale ? options.maxScale : 30;
  _cardStates = new WeakMap();

  if (!_injectSvgFilter()) {
    var panelNone = document.getElementById('glass-panel');
    if (panelNone) panelNone.setAttribute('data-fluid-reveal-path', 'none');
    return;
  }

  var panel = document.getElementById('glass-panel');
  if (panel) panel.setAttribute('data-fluid-reveal-path', 'svg');

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var imageEl = card.querySelector('.immersive-product-link');
    if (!imageEl) continue;

    var state = { scaleTarget: 0, scaleCurrent: 0, imageEl: imageEl };
    _cardStates.set(card, state);

    (function (c) {
      c.addEventListener('mouseenter', function () {
        _activeCard = c;
        var s = _cardStates && _cardStates.get(c);
        if (s) s.scaleTarget = _maxScale;
        _startRaf();
      });
      c.addEventListener('mouseleave', function () {
        var s = _cardStates && _cardStates.get(c);
        if (s) s.scaleTarget = 0;
        // RAF continues until scaleCurrent reaches 0
      });
    })(card);
  }
}

function destroy() {
  _stopRaf();
  _activeCard = null;
  _cardStates = null;
  _time = 0;

  var svg = document.getElementById('immersive-fluid-filter-svg');
  if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
  _filterEl = null;
  _turbulenceEl = null;

  var panel = document.getElementById('glass-panel');
  if (panel) panel.removeAttribute('data-fluid-reveal-path');
}

function isActive() {
  return _filterEl !== null;
}

window.ImmersiveFluidReveal = {
  init: init,
  destroy: destroy,
  isActive: isActive,
};
