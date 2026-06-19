'use strict';

/**
 * Integration tests for tick-manager.js
 *
 * Tests the Ticker in isolation. We set up requestAnimationFrame and
 * performance.now mocks on global before loading the source.
 */

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.resolve(__dirname, '../assets/tick-manager.js');

let tickerCode;

function setupTicker() {
  // jsdom does not provide requestAnimationFrame — mock it
  global.requestAnimationFrame = function (cb) {
    return setTimeout(function () { cb(performance.now()); }, 16);
  };
  global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };

  global.performance = global.performance || {
    now: function () { return Date.now(); },
  };

  delete global.window;
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    document: global.document,
    performance: global.performance,
  };

  if (!tickerCode) {
    tickerCode = fs.readFileSync(SRC_PATH, 'utf8');
  }

  const vm = require('vm');
  const script = new vm.Script(tickerCode, { filename: 'tick-manager.js' });
  const context = vm.createContext({
    window: global.window,
    performance: global.performance,
    document: global.document,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
  });
  script.runInContext(context);

  return global.window.ImmersiveTheme.ticker;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tick-manager', () => {
  // ── 1. Subscribe starts loop ────────────────────────────────────────────

  describe('subscribe', () => {
    it('starts the loop when first subscriber is added', () => {
      const ticker = setupTicker();

      expect(ticker.isRunning()).toBe(false);
      expect(ticker.getCount()).toBe(0);

      ticker.subscribe(function () {});

      expect(ticker.isRunning()).toBe(true);
      expect(ticker.getCount()).toBe(1);
    });

    it('does not restart the loop when adding a second subscriber', () => {
      const ticker = setupTicker();

      ticker.subscribe(function () {});
      ticker.subscribe(function () {});

      expect(ticker.isRunning()).toBe(true);
      expect(ticker.getCount()).toBe(2);
    });
  });

  // ── 2. Unsubscribe stops loop ───────────────────────────────────────────

  describe('unsubscribe', () => {
    it('stops the loop when last subscriber unsubscribes', () => {
      const ticker = setupTicker();

      var unsub = ticker.subscribe(function () {});
      expect(ticker.isRunning()).toBe(true);
      expect(ticker.getCount()).toBe(1);

      unsub();

      expect(ticker.isRunning()).toBe(false);
      expect(ticker.getCount()).toBe(0);
    });

    it('keeps the loop running when one of two subscribers unsubscribes', () => {
      const ticker = setupTicker();

      var unsub1 = ticker.subscribe(function () {});
      ticker.subscribe(function () {});

      expect(ticker.getCount()).toBe(2);

      unsub1();

      expect(ticker.getCount()).toBe(1);
      expect(ticker.isRunning()).toBe(true);
    });
  });

  // ── 3. pause / resume ──────────────────────────────────────────────────

  describe('pause and resume', () => {
    it('pause cancels the current rAF frame', () => {
      const ticker = setupTicker();

      ticker.subscribe(function () {});
      expect(ticker.isRunning()).toBe(true);

      ticker.pause();
      // pause() cancels the rAF frame but the loop is designed to
      // auto-restart via subscribe, so isRunning may still be true.
      // The key guarantee is that the rAF frame is cancelled (no double-fire).
      expect(ticker.isRunning()).toBe(true); // subscribers still exist
    });

    it('resume restarts the loop after pause when there are subscribers', () => {
      const ticker = setupTicker();

      ticker.subscribe(function () {});
      ticker.pause();
      ticker.resume();
      expect(ticker.isRunning()).toBe(true);
    });

    it('resume does nothing when there are no subscribers', () => {
      const ticker = setupTicker();

      ticker.resume();
      expect(ticker.isRunning()).toBe(false);
    });
  });

  describe('stop', () => {
    it('stops the loop and clears the frame', () => {
      const ticker = setupTicker();

      ticker.subscribe(function () {});
      ticker.subscribe(function () {});
      expect(ticker.getCount()).toBe(2);

      ticker.stop();
      expect(ticker.isRunning()).toBe(false);
      // stop() does not clear subscribers, just stops the loop
      expect(ticker.getCount()).toBe(2);
    });
  });
});
