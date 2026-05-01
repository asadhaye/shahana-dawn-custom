# assets/immersive/editorial/hero-parallax.js — Branch Diff

**launch-readiness-fixes → main**

---

## Summary

The file was a stub in `launch-readiness-fixes` with a `TODO` comment. In `main` it is fully implemented.

---

## launch-readiness-fixes (stub)

```javascript
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

function _ehpOnScroll() { ... }
function _ehpLoop() { ... }

// Global API Exposure
if (typeof window !== 'undefined') {
  window.ImmersiveEditorialParallax = {
    initEditorialHeroParallax: initEditorialHeroParallax,
    destroyEditorialHeroParallax: destroyEditorialHeroParallax,
  };
  // Backward-compatible global aliases
  window.initEditorialHeroParallax = initEditorialHeroParallax;
  window.destroyEditorialHeroParallax = destroyEditorialHeroParallax;
}
```

---

## main (fully documented, restructured)

Key differences from the stub:

1. **Private helpers moved to top** — `_ehpOnScroll` and `_ehpLoop` are defined before the public API functions (better readability).

2. **Reduced-motion guard enhanced** — checks both the global `reduceMotion` flag (set by monolith) AND `matchMedia` directly:
   ```javascript
   var reduceMotionEHP =
     (typeof reduceMotion !== 'undefined' && reduceMotion) ||
     window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   ```

3. **`initEditorialHeroParallax` — calls `destroyEditorialHeroParallax()` on missing overlay** (not just `return`):
   ```javascript
   if (!_ehpOverlay) {
     destroyEditorialHeroParallax();
     return;
   }
   ```

4. **Namespace renamed** — `ImmersiveEditorialParallax` → `ImmersiveHeroParallax` with shorter method names:
   ```javascript
   window.ImmersiveHeroParallax = {
     init: initEditorialHeroParallax,
     destroy: destroyEditorialHeroParallax,
   };
   ```

5. **Full JSDoc comments** added throughout.

**Impact:** The module is now production-ready with proper documentation, a cleaner namespace, and a more robust reduced-motion guard. The namespace rename (`ImmersiveEditorialParallax` → `ImmersiveHeroParallax`) is a breaking change for any code calling the old namespace directly.
