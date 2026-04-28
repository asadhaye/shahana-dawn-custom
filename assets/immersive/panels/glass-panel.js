/**
 * Panel: glass-panel
 * TODO: Extract from immersive-store.js
 */

function setPanelRoomLabel(panel) {
  var labelEl = panel && panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || '' : '';
  labelEl.textContent = roomName;
}

function openPanel(panel, triggerEl) {
  if (!panel) return null;

  // Remove hidden state for CSS transitions
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');

  // Apply ARIA
  panel.setAttribute('data-open', 'true');

  // Determine entering class based on panel id
  var enteringClass =
    panel.id === 'glass-panel' ? 'immersive-store__panel--entering' : 'immersive-editorial-overlay--entering';

  if (!reduceMotion) {
    panel.classList.add(enteringClass);
    setTimeout(function () {
      panel.classList.remove(enteringClass);
      openDialogFocus(panel, triggerEl);
    }, 350);
  } else {
    openDialogFocus(panel, triggerEl);
  }

  return triggerEl;
}

function closePanel(panel, closeMethod) {
  if (!panel) return;

  // Track friction point based on close method
  var frictionType = 'exit_via_close_button'; // default

  if (closeMethod === 'escape') {
    frictionType = 'exit_via_escape_key';
  } else if (closeMethod === 'backdrop') {
    frictionType = 'exit_via_backdrop_click';
  } else if (closeMethod === 'back_to_2d') {
    frictionType = 'back_to_2d_from_panel';
  }

  // Check if user took any action before closing
  var hadInteraction = panel.getAttribute('data-user-interacted') === 'true';

  if (!hadInteraction && panel.id === 'glass-panel') {
    trackFrictionPoint('panel_closed_no_action', {
      close_method: closeMethod || 'button',
      panel_id: panel.id,
      room: immersiveState.currentRoom,
    });
  } else if (hadInteraction) {
    trackFrictionPoint('panel_closed_after_view', {
      close_method: closeMethod || 'button',
      panel_id: panel.id,
      room: immersiveState.currentRoom,
    });
  }

  panel.removeAttribute('data-open');
  panel.removeAttribute('data-user-interacted');
  closeDialogFocus(panel._panelTrigger);
  panel._panelTrigger = null;

  // Destroy fluid reveal effect before hiding the panel
  if (typeof ImmersiveFluidReveal !== 'undefined') {
    ImmersiveFluidReveal.destroy();
  }

  // Wait for CSS transition before hiding from DOM
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}

function openOverlay(overlayId, overlayContentId, fetchUrl, onOpenCallback) {
  var overlay = document.getElementById(overlayId);
  var overlayContent = document.getElementById(overlayContentId);

  if (!overlay || !overlayContent) {
    console.warn('[Immersive] Overlay not found:', overlayId);
    return;
  }

  // Show loading spinner if not in cache
  if (!contentCache[fetchUrl]) {
    var msgLoading = (overlay && overlay.getAttribute('data-msg-loading')) || 'Loading…';
    overlayContent.innerHTML =
      '<div class="immersive-editorial-loader" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37;">' +
      '<div class="immersive-loader__ring"></div>' +
      '<p style="margin-top:1.5rem; font-size:0.9rem; letter-spacing:0.1em; text-transform:uppercase;">' +
      msgLoading +
      '</p>' +
      '</div>';
  }

  // Perform UI activation (view transition or direct)
  var performUIActivation = function () {
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-active');
    overlay.scrollTop = 0;

    // Call callback after content is ready
    if (typeof onOpenCallback === 'function') {
      onOpenCallback(overlay, overlayContent);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(performUIActivation);
  } else {
    performUIActivation();
  }

  // Fetch content
  fetchWithCache(fetchUrl)
    .then(function (html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var images = temp.querySelectorAll('img:not([loading])');
      for (var i = 0; i < images.length; i++) {
        images[i].setAttribute('loading', 'lazy');
      }
      overlayContent.innerHTML = temp.innerHTML;
    })
    .catch(function (err) {
      console.error('[Immersive] Overlay fetch failed:', err);
      var msgError = (overlay && overlay.getAttribute('data-msg-error')) || 'The story is temporarily unavailable.';
      var msgTryAgain = (overlay && overlay.getAttribute('data-msg-try-again')) || 'Try again';
      overlayContent.innerHTML =
        '<div class="immersive-editorial-error" style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; text-align:center; padding:2rem;">' +
        '<p style="font-size:1.1rem; margin-bottom:1.5rem;">' +
        msgError +
        '</p>' +
        '<button type="button" class="immersive-header__btn" onclick="enterEditorialMode(\'' +
        (overlay.getAttribute('data-room-key') || '') +
        '\')">' +
        msgTryAgain +
        '</button>' +
        '</div>';
    });
}

function transitionPanelContent(panel, renderCallback) {
  if (!panel) return;

  if (document.startViewTransition) {
    document.startViewTransition(renderCallback);
  } else {
    renderCallback();
  }
}
// ---------------------------------------------------------------------------
// Lightweight Global Focus Trap for Immersive Panels (Safe, Non-intrusive)
// ---------------------------------------------------------------------------
(function () {
  // Utility to collect focusable elements inside a container
  function getFocusable(container) {
    if (!container) return [];
    try {
      return Array.prototype.slice
        .call(
          container.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
        .filter(function (el) {
          return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
        });
    } catch (e) {
      return [];
    }
  }

  // Mount a minimal focus trap on panels that are open
  function ensureFocusTrap(panel, trigger) {
    if (!panel || !panel.classList) return;
    // Determine if panel is open: simple heuristic
    var isOpen = !(panel.hasAttribute('hidden') || panel.getAttribute('aria-hidden') === 'true');
    if (!isOpen) return;

    var focusables = getFocusable(panel);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    function onKey(e) {
      if (e.key !== 'Tab') return;
      var active = document.activeElement;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    panel.addEventListener('keydown', onKey);
    // Initial focus for accessibility
    setTimeout(function () {
      first.focus();
    }, 0);
    // Restore focus on close will be handled by existing close logic; this is a best-effort focus return
    if (trigger && typeof trigger.focus === 'function') {
      // After a brief delay, return focus to trigger when panel closes
      var onClose = function () {
        try {
          trigger.focus();
        } catch (e) {}
        panel.removeEventListener('keydown', onKey);
      };
      // Hook into a broad event if available; otherwise ignore
      document.addEventListener('immersive:panel:closed', onClose, { once: true });
    }
  }

  // Observe openings of glass panels and attach traps when they become visible
  document.addEventListener('DOMNodeInserted', function (ev) {
    var node = ev.target;
    if (!node || !node.classList) return;
    if (node.classList.contains('immersive-panel') || node.closest('.immersive-panel')) {
      var panel = node.classList.contains('immersive-panel') ? node : node.closest('.immersive-panel');
      var trigger = null;
      try {
        trigger = document.activeElement;
      } catch (e) {}
      ensureFocusTrap(panel, trigger);
    }
  });
})();

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Glass Panel Public API
 *
 * Provides functions for managing glass panel overlays in the immersive store.
 * All panel operations (open, close, content transitions) are exposed globally
 * to enable cross-module interactions.
 *
 * @namespace ImmersiveGlassPanel
 */
if (typeof window !== 'undefined') {
  window.ImmersiveGlassPanel = {
    openPanel: openPanel,
    closePanel: closePanel,
    setPanelRoomLabel: setPanelRoomLabel,
    openOverlay: openOverlay,
    transitionPanelContent: transitionPanelContent,
  };

  // Backward-compatible global aliases for critical functions
  window.openPanel = openPanel;
  window.closePanel = closePanel;
}
