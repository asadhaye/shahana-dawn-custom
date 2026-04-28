/**
 * Feature: fab
 * Stub module — full FAB implementation lives in immersive-store.js (initImmersiveBottomNav).
 * This file exposes the global namespace so other modules can reference it safely.
 */

function initImmersiveFAB() {
  // No-op: real implementation is initImmersiveBottomNav() in immersive-store.js
}

if (typeof window !== 'undefined') {
  window.ImmersiveFAB = {
    initImmersiveFAB: initImmersiveFAB,
  };
  window.initImmersiveFAB = initImmersiveFAB;
}
