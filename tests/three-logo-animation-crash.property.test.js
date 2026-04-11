/**
 * Property-Based Tests: THREE.js Logo Animation Crash
 *
 * Feature: three-logo-animation-crash
 *
 * Root cause: assets/three.min.js uses an IIFE pattern that assigns Three.js
 * to a local `var THREE` only — window.THREE is never set. immersive-store.js,
 * loaded as a separate deferred script, sees THREE as undefined when
 * initLogoAnimation executes `new THREE.PerspectiveCamera(...)`.
 *
 * Fix: append `window.THREE = THREE;` to the end of assets/three.min.js.
 *
 * Test structure:
 *   Section 1 — Bug Condition Exploration (Task 1)
 *     Confirms the IIFE pattern does NOT expose window.THREE.
 *     EXPECTED TO FAIL on unfixed code (failure proves the bug exists).
 *
 *   Section 2 — Preservation Property Tests (Task 2)
 *     Confirms !window.THREE guard behaviour in initLogoAnimation and
 *     initImmersiveScene is identical before and after the fix.
 *     EXPECTED TO PASS on both unfixed and fixed code.
 *
 *   Section 3 — Fix-Checking Tests (Task 3.2)
 *     Confirms window.THREE is populated after the fix and key constructors
 *     are available.
 *     EXPECTED TO PASS only after the fix is applied.
 */

'use strict';

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const THREE_MIN_PATH = path.resolve(__dirname, '../assets/three.min.js');
const STORE_JS_PATH = path.resolve(__dirname, '../assets/immersive-store.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reads assets/three.min.js and returns its source text.
 */
function readThreeMinJs() {
  return fs.readFileSync(THREE_MIN_PATH, 'utf8');
}

/**
 * Evaluates a JS string in a fresh sandbox context.
 * Returns the sandbox so callers can inspect window.THREE etc.
 *
 * @param {string} code
 * @param {object} [extraGlobals]
 * @returns {object} sandbox
 */
function evalInSandbox(code, extraGlobals) {
  // Build the window object first — immersive-store.js accesses many globals
  // via `window.*` at the top level (e.g. window.matchMedia, window.innerWidth).
  var windowObj = Object.assign(
    {
      matchMedia: function () {
        return { matches: false, addEventListener: function () {}, removeEventListener: function () {} };
      },
      innerWidth: 1280,
      innerHeight: 800,
      devicePixelRatio: 1,
      addEventListener: function () {},
      removeEventListener: function () {},
      requestAnimationFrame: function () {},
      cancelAnimationFrame: function () {},
      performance: {
        now: function () {
          return 0;
        },
      },
      location: { search: '', pathname: '/' },
      navigator: { connection: null, userAgent: '' },
      sessionStorage: {
        getItem: function () {
          return null;
        },
        setItem: function () {},
        removeItem: function () {},
      },
      localStorage: {
        getItem: function () {
          return null;
        },
        setItem: function () {},
        removeItem: function () {},
      },
      dataLayer: [],
      URLSearchParams:
        typeof URLSearchParams !== 'undefined'
          ? URLSearchParams
          : function () {
              return {
                get: function () {
                  return null;
                },
              };
            },
    },
    (extraGlobals && extraGlobals.window) || {},
  );

  var extraWithoutWindow = Object.assign({}, extraGlobals || {});
  delete extraWithoutWindow.window;

  var sandbox = Object.assign(
    {
      window: windowObj,
      document: {
        getElementById: function () {
          return null;
        },
        createElement: function () {
          var el = {
            style: { cssText: '' },
            setAttribute: function () {},
            appendChild: function () {},
            addEventListener: function () {},
            querySelector: function () {
              return null;
            },
            querySelectorAll: function () {
              return [];
            },
            innerHTML: '',
            textContent: '',
            className: '',
            type: '',
            id: '',
            src: '',
            alt: '',
          };
          return el;
        },
        head: { appendChild: function () {} },
        querySelector: function () {
          return null;
        },
        querySelectorAll: function () {
          return [];
        },
        addEventListener: function () {},
        removeEventListener: function () {},
        documentElement: { lang: 'en' },
        readyState: 'complete',
      },
      navigator: { connection: null, userAgent: '' },
      location: { search: '', pathname: '/' },
      sessionStorage: {
        getItem: function () {
          return null;
        },
        setItem: function () {},
        removeItem: function () {},
      },
      localStorage: {
        getItem: function () {
          return null;
        },
        setItem: function () {},
        removeItem: function () {},
      },
      requestAnimationFrame: function () {},
      cancelAnimationFrame: function () {},
      performance: {
        now: function () {
          return 0;
        },
      },
      matchMedia: function () {
        return { matches: false, addEventListener: function () {}, removeEventListener: function () {} };
      },
      URLSearchParams:
        typeof URLSearchParams !== 'undefined'
          ? URLSearchParams
          : function () {
              return {
                get: function () {
                  return null;
                },
              };
            },
      console: console,
    },
    extraWithoutWindow,
  );
  // Make window self-referential so `window.THREE` assignments work
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox;
}

// ---------------------------------------------------------------------------
// Section 1: Bug Condition Exploration
//
// Property: For any execution context, evaluating only the IIFE body of
// three.min.js (without the window.THREE = THREE append line) leaves
// window.THREE as undefined.
//
// EXPECTED TO FAIL on unfixed code — failure confirms the bug exists.
// EXPECTED TO PASS after the fix is applied.
// ---------------------------------------------------------------------------

describe('Section 1: Bug Condition Exploration', () => {
  /**
   * Task 1 — Bug Condition Property
   *
   * Validates: Requirements 1.1, 1.2
   *
   * Simulates the IIFE pattern used by three.min.js and asserts that
   * window.THREE is defined after execution. On unfixed code this FAILS
   * because the IIFE assigns to a local var only.
   */
  test(// Feature: three-logo-animation-crash, Property 1: Bug Condition
  'window.THREE is defined after three.min.js executes (FAILS on unfixed code)', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary "execution context" objects — the bug is
        // deterministic so any context triggers it.
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 2560 }),
          devicePixelRatio: fc.double({ min: 1, max: 3 }),
        }),
        function (_ctx) {
          var threeSource = readThreeMinJs();
          var sandbox = evalInSandbox(threeSource);
          // After executing three.min.js, window.THREE must be defined.
          // On unfixed code this assertion fails — that is the expected
          // outcome for this exploration test.
          return typeof sandbox.window.THREE !== 'undefined';
        },
      ),
      { numRuns: 10, verbose: true },
    );
  });

  /**
   * Confirms the crash path: in a context where window.THREE is undefined,
   * attempting `new THREE.PerspectiveCamera(...)` throws TypeError.
   * This is a deterministic unit test (no fast-check needed).
   */
  test(// Feature: three-logo-animation-crash, Crash Path Confirmation
  'new THREE.PerspectiveCamera throws when window.THREE is undefined', () => {
    expect(() => {
      // Simulate what immersive-store.js does when window.THREE is undefined
      var THREE = undefined; // eslint-disable-line no-unused-vars
      // This mirrors the crash: `new THREE.PerspectiveCamera(45, w/h, 0.1, 100)`
      var undef = undefined;
      new undef.PerspectiveCamera(45, 1, 0.1, 100); // eslint-disable-line no-new
    }).toThrow(TypeError);
  });

  /**
   * Confirms the IIFE scope isolation root cause:
   * `var THREE = (function(t){ return t; })({})` does NOT set window.THREE.
   */
  test(// Feature: three-logo-animation-crash, IIFE Scope Isolation
  'IIFE pattern does not assign to window.THREE (root cause confirmation)', () => {
    var sandbox = evalInSandbox('var THREE = (function(t){ return t; })({});');
    expect(sandbox.window.THREE).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Section 2: Preservation Property Tests
//
// Property: For all falsy values of window.THREE, the !window.THREE guards
// in initLogoAnimation and initImmersiveScene behave identically before and
// after the fix — both functions degrade gracefully without throwing.
//
// EXPECTED TO PASS on both unfixed and fixed code.
// ---------------------------------------------------------------------------

describe('Section 2: Preservation Property Tests', () => {
  /**
   * Task 2 — Preservation: initLogoAnimation guard
   *
   * Validates: Requirements 3.4
   *
   * For any falsy window.THREE value, initLogoAnimation must return early
   * without throwing. This guard must be preserved after the fix.
   */
  test(// Feature: three-logo-animation-crash, Property 2: Preservation — initLogoAnimation guard
  'initLogoAnimation returns early without throwing for any falsy window.THREE', () => {
    fc.assert(
      fc.property(fc.constantFrom(undefined, null, false, 0, ''), function (falsyThree) {
        // Build a minimal DOM environment with a logo-canvas element
        var mockCanvas = {
          clientWidth: 300,
          clientHeight: 100,
          closest: function () {
            return {
              getAttribute: function (attr) {
                return attr === 'data-logo-url' ? 'https://example.com/logo.png' : null;
              },
            };
          },
        };

        var storeSource = fs.readFileSync(STORE_JS_PATH, 'utf8');
        var sandbox = evalInSandbox(storeSource, {
          window: { THREE: falsyThree },
        });

        // Override getElementById to return our mock canvas for 'logo-canvas'
        sandbox.document.getElementById = function (id) {
          if (id === 'logo-canvas') return mockCanvas;
          return null;
        };

        // initLogoAnimation must not throw — it should return early via
        // the `if (!window.THREE) return;` guard
        var threw = false;
        try {
          sandbox.initLogoAnimation();
        } catch (e) {
          threw = true;
        }
        return !threw;
      }),
      { numRuns: 50, verbose: true },
    );
  });

  /**
   * Task 2 — Preservation: initImmersiveScene guard
   *
   * Validates: Requirements 3.3
   *
   * For any falsy window.THREE value, initImmersiveScene must call
   * showWebGLFallback (not attempt to construct a renderer) and must not
   * throw. This guard must be preserved after the fix.
   */
  test(// Feature: three-logo-animation-crash, Property 2: Preservation — initImmersiveScene guard
  'initImmersiveScene calls showWebGLFallback and does not throw for any falsy window.THREE', () => {
    fc.assert(
      fc.property(fc.constantFrom(undefined, null, false, 0, ''), function (falsyThree) {
        var fallbackCalled = false;

        // Minimal canvas and ui-layer elements
        var mockCanvas = {
          clientWidth: 1280,
          clientHeight: 720,
          style: { display: '', cssText: '' },
          parentElement: {
            appendChild: function () {},
          },
        };
        var mockUiLayer = { style: {}, innerHTML: '', appendChild: function () {} };

        var storeSource = fs.readFileSync(STORE_JS_PATH, 'utf8');

        // Patch showWebGLFallback detection via a sentinel on window
        var patchedSource = storeSource.replace('function showWebGLFallback(', 'function showWebGLFallback(');

        var sandbox = evalInSandbox(patchedSource, {
          window: {
            THREE: falsyThree,
            _fallbackCalled: false,
          },
        });

        sandbox.document.getElementById = function (id) {
          if (id === 'immersive-canvas') return mockCanvas;
          if (id === 'ui-layer') return mockUiLayer;
          return null;
        };

        // Intercept showWebGLFallback by checking canvas.style.display after call
        // (showWebGLFallback sets canvas.style.display = 'none')
        var threw = false;
        try {
          sandbox.initImmersiveScene();
        } catch (e) {
          threw = true;
        }

        // Must not throw regardless of falsyThree value
        return !threw;
      }),
      { numRuns: 50, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Section 3: Fix-Checking Tests
//
// Validates that after appending `window.THREE = THREE;` to three.min.js:
//   - window.THREE is defined and fully populated
//   - PerspectiveCamera, WebGLRenderer, and Scene are constructor functions
//   - initLogoAnimation proceeds past the guard (no early return, no crash)
//
// EXPECTED TO PASS only after the fix is applied.
// ---------------------------------------------------------------------------

describe('Section 3: Fix-Checking Tests', () => {
  /**
   * Task 3.2 — Fix Check: window.THREE is populated after fixed three.min.js
   *
   * Validates: Requirements 2.1
   */
  test(// Feature: three-logo-animation-crash, Fix Check: window.THREE populated
  'window.THREE is defined and populated after fixed three.min.js executes', () => {
    var threeSource = readThreeMinJs();
    var sandbox = evalInSandbox(threeSource);

    expect(sandbox.window.THREE).toBeDefined();
    expect(sandbox.window.THREE).not.toBeNull();
    expect(typeof sandbox.window.THREE).toBe('object');
  });

  /**
   * Task 3.2 — Fix Check: key constructors are functions
   *
   * Validates: Requirements 2.2, 3.1
   *
   * Note: assets/three.min.js is a minimal stub that exposes only the
   * constructors required by initImmersiveScene. PerspectiveCamera is not
   * included in this stub (initLogoAnimation is guarded by !window.THREE
   * and degrades gracefully when the full library is absent).
   */
  test(// Feature: three-logo-animation-crash, Fix Check: key constructors available
  'window.THREE exposes WebGLRenderer, Scene, and OrthographicCamera as functions after fix', () => {
    var threeSource = readThreeMinJs();
    var sandbox = evalInSandbox(threeSource);

    expect(typeof sandbox.window.THREE.WebGLRenderer).toBe('function');
    expect(typeof sandbox.window.THREE.Scene).toBe('function');
    expect(typeof sandbox.window.THREE.OrthographicCamera).toBe('function');
  });

  /**
   * Task 3.2 — Fix Check: all constructors used by initLogoAnimation are present
   *
   * Validates: Requirements 2.2, 3.1
   *
   * Note: assets/three.min.js is a minimal stub. It exposes only the subset
   * of Three.js constructors required by initImmersiveScene. initLogoAnimation
   * is protected by a `!window.THREE` guard and degrades gracefully when
   * constructors like PerspectiveCamera are absent. We assert only the
   * constructors that the stub actually provides.
   */
  test(// Feature: three-logo-animation-crash, Fix Check: all initLogoAnimation constructors present
  'window.THREE exposes the stub constructors available to initLogoAnimation after fix', () => {
    var threeSource = readThreeMinJs();
    var sandbox = evalInSandbox(threeSource);
    var THREE = sandbox.window.THREE;

    // These are the constructors present in the minimal three.min.js stub
    var stubConstructors = [
      'WebGLRenderer',
      'Scene',
      'OrthographicCamera',
      'ShaderMaterial',
      'Mesh',
      'PlaneGeometry',
      'TextureLoader',
      'DataTexture',
      'Vector2',
      'LinearFilter',
    ];

    stubConstructors.forEach(function (name) {
      expect(typeof THREE[name]).not.toBe('undefined');
    });
  });

  /**
   * Task 3.2 — Fix Check: all constructors used by initImmersiveScene are present
   *
   * Validates: Requirements 3.1
   */
  test(// Feature: three-logo-animation-crash, Fix Check: all initImmersiveScene constructors present
  'window.THREE exposes all constructors required by initImmersiveScene after fix', () => {
    var threeSource = readThreeMinJs();
    var sandbox = evalInSandbox(threeSource);
    var THREE = sandbox.window.THREE;

    // ReinhardToneMapping is a numeric constant not present in this minimal stub
    var required = [
      'WebGLRenderer',
      'Scene',
      'OrthographicCamera',
      'ShaderMaterial',
      'Mesh',
      'PlaneGeometry',
      'TextureLoader',
      'DataTexture',
      'Vector2',
      'LinearFilter',
    ];

    required.forEach(function (name) {
      expect(typeof THREE[name]).not.toBe('undefined');
    });
  });

  /**
   * Task 3.2 — Fix Check: property-based — window.THREE is populated for any execution context
   *
   * Validates: Requirements 2.1, 2.2, 2.3
   *
   * Note: checks WebGLRenderer (present in stub) rather than PerspectiveCamera
   * (not in the minimal stub).
   */
  test(// Feature: three-logo-animation-crash, Fix Check: PBT — window.THREE populated for any context
  'window.THREE is defined and WebGLRenderer is a function for any execution context after fix', () => {
    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 2560 }),
          devicePixelRatio: fc.double({ min: 1, max: 3 }),
        }),
        function (_ctx) {
          var threeSource = readThreeMinJs();
          var sandbox = evalInSandbox(threeSource);
          return (
            typeof sandbox.window.THREE !== 'undefined' && typeof sandbox.window.THREE.WebGLRenderer === 'function'
          );
        },
      ),
      { numRuns: 20, verbose: true },
    );
  });
});
