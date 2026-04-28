/**
 * Editorial: timeline
 * Stub module — full timeline implementation lives in immersive-store.js (initDesignersTimeline).
 * This file exposes the global namespace so other modules can reference it safely.
 */

function loadTimelineCollection() {
  // No-op: real implementation is in immersive-store.js
}

if (typeof window !== 'undefined') {
  window.ImmersiveTimeline = {
    loadTimelineCollection: loadTimelineCollection,
  };
  window.loadTimelineCollection = loadTimelineCollection;
}
