/**
 * Tests for hero-parallax.js
 *
 * Feature: immersive-store-modular-refactor
 *
 * Covers:
 *   - Property 1: Hero parallax transform is proportional and clamped
 *   - Property 2: Hero parallax is a no-op under reduced motion
 *   - Unit tests for edge cases (missing DOM, destroy, namespace aliases)
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDOM() {
  const overlay = document.createElement('div');
  overlay.id = 'immersive-editorial-overlay';
  overlay.scrollTop = 0;
  const heroImg = document.createElement('div');
  heroImg.className = 'immersive-editorial__hero-bg';
  overlay.appendChild(heroImg);
  document.body.appendChild(overlay);
  return { overlay, heroImg };
}

function cleanDOM() {
  document.body.innerHTML = '';
}

function setupGlobals(reduceMotionValue, matchMediaMatches) {
  global.reduceMotion = reduceMotionValue;
  global.window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: matchMediaMatches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// ---------------------------------------------------------------------------
// Property 1: Hero parallax transform is proportional and clamped
// ---------------------------------------------------------------------------

describe('Property 1: Hero parallax transform is proportional and clamped', () => {
  // Feature: immersive-store-modular-refactor, Property 1: Hero parallax transform is proportional and clamped

  beforeEach(() => {
    jest.resetModules();
    cleanDOM();
    setupGlobals(false, false);
    global.requestAnimationFrame = jest.fn((cb) => {
      return 1;
    });
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    cleanDOM();
  });

  test('Property 1 — transform converges to translateY(min(scrollTop * 0.3, 60)px) for any scrollTop in [0, 300]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 300 }), (scrollTop) => {
        jest.resetModules();
        cleanDOM();
        setupGlobals(false, false);

        let rafCallback = null;
        global.requestAnimationFrame = jest.fn((cb) => {
          rafCallback = cb;
          return 1;
        });
        global.cancelAnimationFrame = jest.fn();

        const { overlay, heroImg } = buildDOM();

        require('../assets/immersive/editorial/hero-parallax.js');
        window.initEditorialHeroParallax();

        overlay.scrollTop = scrollTop;
        overlay.dispatchEvent(new Event('scroll'));

        for (let i = 0; i < 200; i++) {
          if (typeof rafCallback === 'function') {
            const cb = rafCallback;
            rafCallback = null;
            cb();
          }
        }

        const expectedOffset = Math.min(scrollTop * 0.3, 60);
        const actualTransform = heroImg.style.transform;
        const match = actualTransform.match(/translateY\(([^p]+)px\)/);
        if (!match) {
          throw new Error('Expected transform to match translateY(Npx), got: ' + actualTransform);
        }
        const actualOffset = parseFloat(match[1]);
        const epsilon = 1e-4;
        if (Math.abs(actualOffset - expectedOffset) > epsilon) {
          throw new Error(
            'Transform did not converge: expected ' +
              expectedOffset +
              ', got ' +
              actualOffset +
              ' (scrollTop=' +
              scrollTop +
              ')',
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Hero parallax is a no-op under reduced motion
// ---------------------------------------------------------------------------

describe('Property 2: Hero parallax is a no-op under reduced motion', () => {
  // Feature: immersive-store-modular-refactor, Property 2: Hero parallax is a no-op under reduced motion

  beforeEach(() => {
    jest.resetModules();
    cleanDOM();
  });

  afterEach(() => {
    cleanDOM();
  });

  test('Property 2 — no rAF started and no scroll listener added when reduced motion is active', () => {
    fc.assert(
      fc.property(fc.constant(true), (_reduceMotion) => {
        jest.resetModules();
        cleanDOM();
        setupGlobals(false, true);

        const rafMock = jest.fn();
        global.requestAnimationFrame = rafMock;
        global.cancelAnimationFrame = jest.fn();

        const addEventListenerSpy = jest.spyOn(window.EventTarget.prototype, 'addEventListener');

        buildDOM();

        jest.resetModules();
        require('../assets/immersive/editorial/hero-parallax.js');
        window.initEditorialHeroParallax();

        expect(rafMock).not.toHaveBeenCalled();

        const scrollListenerAdded = addEventListenerSpy.mock.calls.some((call) => call[0] === 'scroll');
        expect(scrollListenerAdded).toBe(false);

        addEventListenerSpy.mockRestore();
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests: edge cases
// ---------------------------------------------------------------------------

describe('hero-parallax.js edge cases', () => {
  let rafCallback;

  beforeEach(() => {
    jest.resetModules();
    cleanDOM();
    setupGlobals(false, false);
    rafCallback = null;
    global.requestAnimationFrame = jest.fn((cb) => {
      rafCallback = cb;
      return 1;
    });
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    cleanDOM();
  });

  test('missing #immersive-editorial-overlay → returns without error and does not start rAF', () => {
    require('../assets/immersive/editorial/hero-parallax.js');
    expect(() => {
      window.initEditorialHeroParallax();
    }).not.toThrow();
    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  test('missing .immersive-editorial__hero-bg → returns without error and does not start rAF', () => {
    const overlay = document.createElement('div');
    overlay.id = 'immersive-editorial-overlay';
    document.body.appendChild(overlay);

    require('../assets/immersive/editorial/hero-parallax.js');
    expect(() => {
      window.initEditorialHeroParallax();
    }).not.toThrow();
    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  test('destroyEditorialHeroParallax resets heroImg.style.transform to empty string', () => {
    const { overlay, heroImg } = buildDOM();
    require('../assets/immersive/editorial/hero-parallax.js');

    window.initEditorialHeroParallax();
    overlay.scrollTop = 100;
    overlay.dispatchEvent(new Event('scroll'));

    for (let i = 0; i < 50; i++) {
      if (typeof rafCallback === 'function') {
        const cb = rafCallback;
        rafCallback = null;
        cb();
      }
    }

    expect(heroImg.style.transform).not.toBe('');
    window.destroyEditorialHeroParallax();
    expect(heroImg.style.transform).toBe('');
  });

  test('window.ImmersiveHeroParallax.init is the same function as window.initEditorialHeroParallax', () => {
    require('../assets/immersive/editorial/hero-parallax.js');
    expect(window.ImmersiveHeroParallax.init).toBe(window.initEditorialHeroParallax);
  });

  test('window.ImmersiveHeroParallax.destroy is the same function as window.destroyEditorialHeroParallax', () => {
    require('../assets/immersive/editorial/hero-parallax.js');
    expect(window.ImmersiveHeroParallax.destroy).toBe(window.destroyEditorialHeroParallax);
  });
});
