/**
 * Guided Mode - Concierge sequence
 * TODO: Extract from immersive-store.js
 */

function initGuidedMode() {
  // Read featured wing from section data attribute
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var wing = storeEl.getAttribute('data-guided-featured-wing');
    if (wing) _guidedFeaturedWing = wing;
  }

  // Wire prompt CTA and skip buttons
  var promptCta = document.querySelector('[data-guided-prompt-cta]');
  var promptSkip = document.querySelector('[data-guided-prompt-skip]');

  if (promptCta) {
    promptCta.addEventListener('click', function () {
      hideGuidedPrompt();
      _guidedAdvance();
    });
  }
  if (promptSkip) {
    promptSkip.addEventListener('click', function () {
      exitGuidedMode();
    });
  }

  // Exit guided mode on any user intent signals
  var intentEvents = ['mousedown', 'touchstart', 'keydown', 'wheel', 'mousemove'];
  intentEvents.forEach(function (evt) {
    document.addEventListener(
      evt,
      function () {
        if (immersiveState.guided) {
          // Reset idle timer on activity — don't exit, just delay auto-advance
          _guidedResetIdleTimer();
        }
      },
      { passive: true },
    );
  });
}

function activateGuidedMode() {
  // Don't restart if dismissed this session
  try {
    if (sessionStorage.getItem('immersive_guided_dismissed')) return;
  } catch (e) {}

  immersiveState.guided = true;
  _guidedStep = 0;
  _updateGuidedDots(0);
  _showGuidedProgress();
  _guidedStartIdleTimer();
}

function exitGuidedMode() {
  if (!immersiveState.guided) return;
  immersiveState.guided = false;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  _guidedIdleTimer = null;
  _guidedPromptTimer = null;
  hideGuidedPrompt();
  _hideGuidedProgress();
  try {
    sessionStorage.setItem('immersive_guided_dismissed', '1');
  } catch (e) {}
}

function _guidedStartIdleTimer() {
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);

  if (!immersiveState.guided) return;

  // Show soft prompt after 3.5s
  _guidedPromptTimer = setTimeout(function () {
    if (immersiveState.guided) showGuidedPrompt();
  }, GUIDED_PROMPT_MS);

  // Auto-advance after 10s
  _guidedIdleTimer = setTimeout(function () {
    if (immersiveState.guided) {
      hideGuidedPrompt();
      _guidedAdvance();
    }
  }, GUIDED_IDLE_MS);
}

function _guidedResetIdleTimer() {
  if (!immersiveState.guided) return;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  hideGuidedPrompt();
  _guidedStartIdleTimer();
}

function _guidedAdvance() {
  if (!immersiveState.guided) return;

  _guidedStep++;
  _updateGuidedDots(_guidedStep);

  if (_guidedStep === 1) {
    // Step 1: Enter editorial of featured wing
    enterEditorialMode(_guidedFeaturedWing, null);
    // After editorial, guided mode waits for user to scroll/interact
    // Auto-advance to collection after idle
    _guidedStartIdleTimer();
  } else if (_guidedStep === 2) {
    // Step 2: Open the first collection from the featured wing
    exitEditorialMode();
    var firstCollection = _guidedGetFirstCollection(_guidedFeaturedWing);
    if (firstCollection) {
      setTimeout(function () {
        openCollectionPanel(firstCollection);
      }, 200);
    } else {
      // No collection configured — exit guided mode gracefully
      exitGuidedMode();
    }
  } else if (_guidedStep >= 3) {
    // Step 3+: Guided sequence complete — exit
    exitGuidedMode();
  }
}

function _guidedGetFirstCollection(wingKey) {
  var room = STORE_ROOMS[wingKey];
  if (!room || !room.hotspots) return null;
  for (var i = 0; i < room.hotspots.length; i++) {
    if (room.hotspots[i].targetCollection) return room.hotspots[i].targetCollection;
  }
  return null;
}

function showGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.hidden = false;
  requestAnimationFrame(function () {
    prompt.classList.add('is-visible');
  });
}

function hideGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.classList.remove('is-visible');
  // Hide after transition
  setTimeout(function () {
    if (!prompt.classList.contains('is-visible')) prompt.hidden = true;
  }, 500);
}

function _showGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.hidden = false;
  requestAnimationFrame(function () {
    el.classList.add('is-visible');
  });
}

function _hideGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.classList.remove('is-visible');
  setTimeout(function () {
    if (!el.classList.contains('is-visible')) el.hidden = true;
  }, 400);
}

function _updateGuidedDots(activeStep) {
  var dots = document.querySelectorAll('[data-guided-step]');
  for (var i = 0; i < dots.length; i++) {
    var step = parseInt(dots[i].getAttribute('data-guided-step'), 10);
    dots[i].classList.remove('is-active', 'is-done');
    if (step === activeStep) {
      dots[i].classList.add('is-active');
    } else if (step < activeStep) {
      dots[i].classList.add('is-done');
    }
  }
}

// ============================================================================
// GLOBAL API EXPOSURE
// ============================================================================

/**
 * @namespace ImmersiveGuided
 * @description Public API for the Immersive Guided Mode system.
 *
 * Provides functions to initialize, activate, and control the guided concierge
 * sequence that walks users through the immersive store experience.
 *
 * @example
 * // Initialize guided mode
 * window.ImmersiveGuided.initGuidedMode();
 *
 * // Activate guided sequence
 * window.ImmersiveGuided.activateGuidedMode();
 *
 * // Exit guided mode
 * window.ImmersiveGuided.exitGuidedMode();
 *
 * // Show/hide guided prompt
 * window.ImmersiveGuided.showGuidedPrompt();
 * window.ImmersiveGuided.hideGuidedPrompt();
 */
window.ImmersiveGuided = {
  initGuidedMode: initGuidedMode,
  activateGuidedMode: activateGuidedMode,
  exitGuidedMode: exitGuidedMode,
  showGuidedPrompt: showGuidedPrompt,
  hideGuidedPrompt: hideGuidedPrompt,
};

// Backward-compatible global aliases for critical functions
window.activateGuidedMode = activateGuidedMode;
window.exitGuidedMode = exitGuidedMode;
