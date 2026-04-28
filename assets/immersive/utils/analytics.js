/**
 * Analytics utilities for immersive store
 * Extracted from immersive-store.js
 */

var frictionPoints = [];

function trackImmersiveEvent(eventName, eventData) {
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: 'immersive_event',
      eventName: eventName,
      eventData: eventData || {},
    });
  }
  if (typeof window.fbq !== 'undefined') {
    window.fbq('trackCustom', eventName, eventData || {});
  }
}

function trackFrictionPoint(point, context) {
  frictionPoints.push({
    point: point,
    context: context || {},
    timestamp: Date.now(),
  });
  trackImmersiveEvent('friction_point', { point: point, context: context });
}

function getFrictionSummary() {
  return frictionPoints;
}

/**
 * Record browsing signal for personalization
 * Stores room navigation history in localStorage for room recommendations
 * @param {string} roomKey - Room key to record
 */
var BROWSING_SIGNALS_KEY = 'immersive_browsing_signals';

function recordBrowsingSignal(roomKey) {
  if (!roomKey) return;
  try {
    var raw = localStorage.getItem(BROWSING_SIGNALS_KEY);
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) signals = [];
    signals.push(roomKey);
    if (signals.length > 50) signals = signals.slice(signals.length - 50);
    localStorage.setItem(BROWSING_SIGNALS_KEY, JSON.stringify(signals));
  } catch (e) {
    // Silently fail if localStorage is unavailable (private browsing, etc.)
  }
}

// Export to global scope
window.ImmersiveAnalytics = {
  trackImmersiveEvent: trackImmersiveEvent,
  trackFrictionPoint: trackFrictionPoint,
  getFrictionSummary: getFrictionSummary,
  recordBrowsingSignal: recordBrowsingSignal,
};

// Backward-compatible global alias
window.recordBrowsingSignal = recordBrowsingSignal;
