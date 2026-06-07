/**
 * bridge-behavior.js
 * Connection-aware bridge messaging — informs the user, never redirects.
 *
 * Fast (4g / wifi)    → no changes
 * Medium (3g)         → subtle warning below the button
 * Slow (2g / saveData)→ button label updated + warning message
 * Reduced motion      → modifier class added (CSS handles the rest)
 * 
 * NetworkInformation API enhancements:
 * - Uses navigator.connection for accurate connection type
 * - Supports NetworkInformation API (Chrome 62+, Safari 15.4+)
 * - Event listener for connection changes while on page
 */

(function () {
  function classifyConnection() {
    // Primary: NetworkInformation API
    if (!navigator.connection) return 'fast';
    var c = navigator.connection;
    if (c.saveData) return 'slow';
    var t = c.effectiveType || '';
    if (t === 'slow-2g' || t === '2g') return 'slow';
    if (t === '3g') return 'medium';
    return 'fast';
  }

  function getConnectionSpeed() {
    // Returns estimated speed in Mbps if available
    if (navigator.connection && navigator.connection.downlink) {
      return navigator.connection.downlink;
    }
    return null;
  }

  function getRoundTripTime() {
    // Returns RTT in ms if available  
    if (navigator.connection && navigator.connection.rtt) {
      return navigator.connection.rtt;
    }
    return null;
  }

  function getDataSaverStatus() {
    return navigator.connection ? navigator.connection.saveData : false;
  }

  function is3DLink(href) {
    return (
      href.indexOf('/pages/immersive') !== -1 ||
      href.indexOf('open_product') !== -1 ||
      href.indexOf('open_collection') !== -1 ||
      href.indexOf('open_search') !== -1
    );
  }

  function addWarning(bridge, message) {
    if (bridge._warningAdded) return;
    bridge._warningAdded = true;

    var el = document.createElement('p');
    el.className = 'immersive-bridge-btn__connection-note';
    el.textContent = message;
    if (bridge.parentNode) {
      bridge.parentNode.insertBefore(el, bridge.nextElementSibling);
    }
  }

  function wireBridge(bridge, conn, reducedMotion) {
    var href = bridge.getAttribute('href') || '';
    if (!is3DLink(href)) return;

    if (reducedMotion) {
      bridge.classList.add('immersive-bridge-btn--reduced-motion');
    }

    if (conn === 'slow') {
      bridge.classList.add('immersive-bridge-btn--slow-connection');
      var label = bridge.querySelector('.immersive-bridge-btn__label');
      if (label) {
        label.textContent = bridge.getAttribute('data-slow-label') || 'Enter 3D Store';
      }
      addWarning(
        bridge,
        bridge.getAttribute('data-slow-note') ||
          (window.__bridgeSettings && window.__bridgeSettings.slowNote) ||
          'Your connection appears slow — the 3D experience may take longer to load.',
      );
    } else if (conn === 'medium') {
      bridge.classList.add('immersive-bridge-btn--medium-connection');
      addWarning(
        bridge,
        bridge.getAttribute('data-medium-note') ||
          (window.__bridgeSettings && window.__bridgeSettings.mediumNote) ||
          'The 3D store works best on a faster connection.',
      );
    }
  }

  var connectionChangeHandler = null;

  function init() {
    var bridges = document.querySelectorAll('[data-immersive-bridge]');
    if (!bridges.length) return;

    var conn = classifyConnection();
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    bridges.forEach(function (b) {
      wireBridge(b, conn, reducedMotion);
    });

    // Re-evaluate if connection changes mid-session
    if (navigator.connection && navigator.connection.addEventListener) {
      // Clean up any existing listener to prevent duplicates
      if (connectionChangeHandler) {
        navigator.connection.removeEventListener('change', connectionChangeHandler);
      }

      connectionChangeHandler = function () {
        var updated = classifyConnection();
        var speed = getConnectionSpeed();
        var rtt = getRoundTripTime();

        // Log connection metrics for analytics
        if (window.__IMMERSIVE_DEV__) {
          console.log('[Bridge] Connection changed:', {
            type: updated,
            downlink: speed ? speed + ' Mbps' : 'unknown',
            rtt: rtt ? rtt + 'ms' : 'unknown',
            saveData: getDataSaverStatus()
          });
        }

        bridges.forEach(function (b) {
          b.classList.remove('immersive-bridge-btn--slow-connection', 'immersive-bridge-btn--medium-connection');
          var note = b.nextElementSibling;
          if (note && note.classList && note.classList.contains('immersive-bridge-btn__connection-note')) {
            note.parentNode.removeChild(note);
          }
          b._warningAdded = false;
          wireBridge(b, updated, reducedMotion);
        });
      };

      navigator.connection.addEventListener('change', connectionChangeHandler);
    }
  }

  function destroy() {
    if (navigator.connection && navigator.connection.removeEventListener && connectionChangeHandler) {
      navigator.connection.removeEventListener('change', connectionChangeHandler);
      connectionChangeHandler = null;
    }
  }

  // Expose the destroy function globally so it can be called during section unload
  if (!window.ShahanaImmersive) {
    window.ShahanaImmersive = {};
  }
  if (!window.ShahanaImmersive.bridgeBehavior) {
    window.ShahanaImmersive.bridgeBehavior = {};
  }
  window.ShahanaImmersive.bridgeBehavior.destroy = destroy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
