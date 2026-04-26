/**
 * Editorial: editorial-mode
 * TODO: Extract from immersive-store.js
 */

function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl || null;

  // Reset scroll-linked state
  editorialScrollProgress = 0;
  if (uniforms && uniforms.uScrollOffset) {
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
    uniforms.uAtmosphericMood.value = 0;
  }
  cacheEditorialOverlay();
  updateCameraForMode();

  trackImmersiveEvent('editorial_entered', { room: roomKey });

  var overlay = document.getElementById('immersive-editorial-overlay');
  var overlayContent = document.getElementById('immersive-editorial-overlay-content');
  var canvas = document.getElementById(immersiveCanvasId);

  if (!overlay || !overlayContent) {
    console.warn('[Immersive] Editorial overlay not found');
    return;
  }

  // Get section instance ID
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');

  if (!sectionInstanceId) {
    console.warn('[Immersive] No immersive-editorial section instance found on page for room:', roomKey);
    if (sourceSection) {
      overlayContent.innerHTML = sourceSection.innerHTML;
      performEditorialUIActivation(overlay, canvas);
    }
    return;
  }

  var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;

  // Open overlay with callback for post-content setup
  openOverlay(
    'immersive-editorial-overlay',
    'immersive-editorial-overlay-content',
    fetchUrl,
    function (overlay, overlayContent) {
      performEditorialUIActivation(overlay, canvas);

      // Re-initialize any parallax scripts
      if (window.ImmersiveEditorial && window.ImmersiveEditorial.init) {
        window.ImmersiveEditorial.init(overlayContent);
      }

      // Back to Lounge visibility + hero parallax
      updateBackToLoungeVisibility(roomKey);
      initEditorialHeroParallax();

      // Setup escape handler
      if (!overlay._onEscape) {
        overlay._onEscape = function (e) {
          if (e.key === 'Escape') exitEditorialMode();
        };
        overlay.addEventListener('keydown', overlay._onEscape);
      }

      // Setup collection click delegation
      if (!overlay._onClick) {
        overlay._onClick = function (e) {
          var productLink = e.target.closest('[data-product-handle]');
          if (productLink) {
            var productHandle = productLink.getAttribute('data-product-handle');
            if (productHandle) {
              e.preventDefault();
              openProductPanel(productHandle, null);
              return;
            }
          }
          var card = e.target.closest('[data-collection]');
          if (!card) return;
          var handle = card.getAttribute('data-collection');
          if (!handle) return;
          e.preventDefault();
          exitEditorialMode();
          setTimeout(function () {
            openCollectionPanel(handle);
          }, 120);
        };
        overlay.addEventListener('click', overlay._onClick);
      }
    },
  );
}

function exitEditorialMode() {
  destroyEditorialHeroParallax();
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);
  var triggerEl = immersiveState.lastHotspot;

  var performUIDeactivation = function () {
    // IMPORTANT: Move focus BEFORE setting aria-hidden to avoid accessibility violation
    if (triggerEl) {
      triggerEl.focus();
    }

    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      if (overlay._onEscape) {
        overlay.removeEventListener('keydown', overlay._onEscape);
        overlay._onEscape = null;
      }
      if (overlay._onClick) {
        overlay.removeEventListener('click', overlay._onClick);
        overlay._onClick = null;
      }
    }

    if (canvas) {
      canvas.classList.remove('editorial-blur');
    }

    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
    editorialOverlayEl = null;
    editorialMaxScroll = 0;
    updateCameraForMode();
  };

  if (document.startViewTransition && triggerEl) {
    overlay.style.viewTransitionName = 'editorial-morph';
    triggerEl.style.viewTransitionName = 'editorial-morph';

    var transition = document.startViewTransition(performUIDeactivation);

    transition.finished.finally(function () {
      overlay.style.viewTransitionName = '';
      triggerEl.style.viewTransitionName = '';
      immersiveState.lastHotspot = null;
    });
  } else {
    performUIDeactivation();
    immersiveState.lastHotspot = null;
  }
}

function performEditorialUIActivation(overlay, canvas) {
  if (canvas && !reduceMotion) {
    canvas.classList.add('editorial-blur');
  }
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('is-active');
  overlay.scrollTop = 0;

  var backBtn = document.getElementById('immersive-editorial-back');
  if (backBtn) {
    if (!reduceMotion) {
      overlay.classList.add('immersive-editorial-overlay--entering');
      setTimeout(function () {
        overlay.classList.remove('immersive-editorial-overlay--entering');
        backBtn.focus();
      }, 350);
    } else {
      requestAnimationFrame(function () {
        backBtn.focus();
      });
    }
    if (!backBtn._editorialBound) {
      backBtn._editorialBound = true;
      backBtn.addEventListener('click', exitEditorialMode);
    }
  }
}

function updateBackToLoungeVisibility(roomKey) {
  var btn = document.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  btn.hidden = roomKey === 'lounge';
}

function initEditorialBackToLounge() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  if (!overlay) return;

  var btn = overlay.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;

  // Populate label from data attribute
  var label = overlay.getAttribute('data-back-to-lounge-label') || 'Back to Lounge';
  btn.textContent = label;

  if (!btn._btlBound) {
    btn._btlBound = true;
    btn.addEventListener('click', function () {
      exitEditorialMode();
      goToRoom('lounge');
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        exitEditorialMode();
        goToRoom('lounge');
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Editorial Mode Public API
 *
 * Provides functions for managing editorial mode in the immersive store.
 * Editorial mode displays rich editorial content overlays for specific rooms
 * (designer houses, occasions, featured collections).
 *
 * Private helper functions (performEditorialUIActivation, updateBackToLoungeVisibility)
 * remain locally scoped as internal implementation details.
 *
 * @namespace ImmersiveEditorial
 */
if (typeof window !== 'undefined') {
  window.ImmersiveEditorial = {
    enterEditorialMode: enterEditorialMode,
    exitEditorialMode: exitEditorialMode,
    initEditorialBackToLounge: initEditorialBackToLounge,
  };

  // Backward-compatible global aliases for critical functions
  window.enterEditorialMode = enterEditorialMode;
  window.exitEditorialMode = exitEditorialMode;
}
