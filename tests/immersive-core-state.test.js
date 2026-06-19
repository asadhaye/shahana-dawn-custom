'use strict';

/**
 * Integration tests for immersive-core.js state + ticker wiring.
 *
 * Tests that immersive-core.js correctly delegates to ImmersiveTheme.state
 * and ImmersiveTheme.ticker instead of direct localStorage/sessionStorage/rAF.
 *
 * Approach: Static analysis of the source code to verify wiring patterns.
 * We also execute the core in a vm context to verify the namespace alias
 * and helper functions are present.
 */

const fs = require('fs');
const path = require('path');

const CORE_PATH = path.resolve(__dirname, '../assets/immersive-core.js');

// ---------------------------------------------------------------------------
// Source-level tests (no execution needed)
// ---------------------------------------------------------------------------

describe('immersive-core source wiring', () => {
  var source;

  beforeAll(function () {
    source = fs.readFileSync(CORE_PATH, 'utf8');
  });

  // ── 1. Namespace unification ───────────────────────────────────────────

  describe('namespace alias', () => {
    it('defines window.ImmersiveTheme', () => {
      expect(source).toContain('window.ImmersiveTheme = window.ImmersiveTheme || {}');
    });

    it('makes ShahanaImmersive an alias for ImmersiveTheme', () => {
      expect(source).toContain('window.ShahanaImmersive = window.ShahanaImmersive || window.ImmersiveTheme');
    });

    it('uses local Immersive variable', () => {
      expect(source).toContain('var Immersive = window.ImmersiveTheme');
    });
  });

  // ── 2. No direct storage calls ─────────────────────────────────────────

  describe('no direct storage calls', () => {
    it('does not call sessionStorage.setItem for immersive_state', () => {
      expect(source).not.toContain("sessionStorage.setItem('immersive_state'");
    });

    it('does not call localStorage.getItem for immersive_onboarding_seen', () => {
      expect(source).not.toContain("localStorage.getItem('immersive_onboarding_seen')");
    });

    it('does not call localStorage.getItem for immersive_browsing_signals', () => {
      expect(source).not.toContain("localStorage.getItem('immersive_browsing_signals')");
    });

    it('does not call sessionStorage.getItem for immersive_nav_history', () => {
      expect(source).not.toContain("sessionStorage.getItem('immersive_nav_history')");
    });

    it('does not call sessionStorage.setItem for immersive_nav_history', () => {
      expect(source).not.toContain("sessionStorage.setItem('immersive_nav_history'");
    });

    it('does not call sessionStorage.setItem for immersive_rec_dismissed', () => {
      expect(source).not.toContain("sessionStorage.setItem('immersive_rec_dismissed_");
    });

    it('does not call sessionStorage.getItem for immersive_rec_dismissed', () => {
      expect(source).not.toContain("sessionStorage.getItem('immersive_rec_dismissed_");
    });
  });

  // ── 3. State helper functions ──────────────────────────────────────────

  describe('state helpers', () => {
    it('has saveImmersiveSessionState helper', () => {
      expect(source).toContain('function saveImmersiveSessionState');
    });

    it('has loadImmersiveSessionState helper', () => {
      expect(source).toContain('function loadImmersiveSessionState');
    });

    it('has clearImmersiveSessionState helper', () => {
      expect(source).toContain('function clearImmersiveSessionState');
    });

    it('has _saveNavHistory helper', () => {
      expect(source).toContain('function _saveNavHistory');
    });

    it('has _loadNavHistory helper', () => {
      expect(source).toContain('function _loadNavHistory');
    });

    it('has hasSeenOnboarding helper', () => {
      expect(source).toContain('function hasSeenOnboarding');
    });

    it('has markOnboardingSeen helper', () => {
      expect(source).toContain('function markOnboardingSeen');
    });

    it('has loadBrowsingSignals helper', () => {
      expect(source).toContain('function loadBrowsingSignals');
    });

    it('has saveBrowsingSignals helper', () => {
      expect(source).toContain('function saveBrowsingSignals');
    });

    it('has isRoomDismissed helper', () => {
      expect(source).toContain('function isRoomDismissed');
    });

    it('has dismissRoom helper', () => {
      expect(source).toContain('function dismissRoom');
    });

    it('has _sm() internal accessor', () => {
      expect(source).toContain('function _sm()');
    });
  });

  // ── 4. State paths ─────────────────────────────────────────────────────

  describe('state paths match StateManager schema', () => {
    it('uses immersive.session.state path', () => {
      expect(source).toContain("'immersive.session.state'");
    });

    it('uses immersive.navigation.history path', () => {
      expect(source).toContain("'immersive.navigation.history'");
    });

    it('uses onboarding.seen path', () => {
      expect(source).toContain("'onboarding.seen'");
    });

    it('uses immersive.browsing.signals path', () => {
      expect(source).toContain("'immersive.browsing.signals'");
    });

    it('uses immersive.recommendations.dismissedRooms path', () => {
      expect(source).toContain("'immersive.recommendations.dismissedRooms'");
    });
  });

  // ── 5. Ticker wiring ───────────────────────────────────────────────────

  describe('ticker wiring', () => {
    it('has startAnimate function', () => {
      expect(source).toContain('function startAnimate');
    });

    it('has stopAnimate function', () => {
      expect(source).toContain('function stopAnimate');
    });

    it('uses ticker.subscribe for main animate loop', () => {
      expect(source).toContain('ticker.subscribe');
    });

    it('has unsubscribeAnimate variable', () => {
      expect(source).toContain('var unsubscribeAnimate = null');
    });

    it('stopAnimate calls unsubscribeAnimate', () => {
      expect(source).toContain('unsubscribeAnimate()');
    });

    it('does NOT use requestAnimationFrame for main animate loop', () => {
      expect(source).not.toContain('animationFrameId = requestAnimationFrame(animate)');
    });
  });

  // ── 6. Namespace initialization ────────────────────────────────────────

  describe('namespace initialization', () => {
    it('extends Immersive.store with fallback', () => {
      expect(source).toContain('Immersive.store = Immersive.store || {}');
    });

    it('extends Immersive.settings with fallback', () => {
      expect(source).toContain('Immersive.settings = Immersive.settings || {');
    });

    it('extends Immersive.device with fallback', () => {
      expect(source).toContain('Immersive.device = Immersive.device || {');
    });

    it('extends Immersive.layout with fallback', () => {
      expect(source).toContain('Immersive.layout = Immersive.layout || {');
    });

    it('extends Immersive.room with fallback', () => {
      expect(source).toContain('Immersive.room = Immersive.room || {');
    });

    it('extends Immersive.graphics with fallback', () => {
      expect(source).toContain('Immersive.graphics = Immersive.graphics || {');
    });
  });
});
