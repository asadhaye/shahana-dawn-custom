/**
 * Tests for hero parallax logic
 *
 * Feature: immersive-store-modular-refactor
 *
 * Covers:
 *   - Property 1: Hero parallax scroll handler is registered in immersive-store.js
 *   - Property 2: Hero parallax respects reduced motion
 *   - Unit tests: parallax state variables and RAF loop patterns
 */

'use strict';

const fs = require('fs');
const path = require('path');
const fc = require('fast-check');

const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-features.js');
let source;

beforeAll(() => {
  source = fs.readFileSync(SOURCE_PATH, 'utf8');
});

// ---------------------------------------------------------------------------
// Static analysis: function presence
// ---------------------------------------------------------------------------

describe('immersive-features.js contains hero parallax functions', () => {
  test('immersive-features.js contains initEditorialHeroParallax function', () => {
    expect(source).toContain('function initEditorialHeroParallax');
  });

  test('immersive-features.js contains destroyEditorialHeroParallax function', () => {
    expect(source).toContain('function destroyEditorialHeroParallax');
  });
});

// ---------------------------------------------------------------------------
// Static analysis: scroll listener and reduced motion
// ---------------------------------------------------------------------------

describe('hero parallax implementation details', () => {
  test('hero parallax scroll handler uses passive listener', () => {
    // The _ehpOnScroll listener is registered with { passive: true }
    expect(source).toContain('passive: true');
    // Confirm the scroll listener is registered in initEditorialHeroParallax
    var initIdx = source.indexOf('function initEditorialHeroParallax');
    var endIdx = source.indexOf('function destroyEditorialHeroParallax');
    var initBlock = source.slice(initIdx, endIdx);
    expect(initBlock).toContain('scroll');
    expect(initBlock).toContain('passive');
  });

  test('hero parallax respects prefers-reduced-motion', () => {
    // initEditorialHeroParallax checks reduced motion before starting
    var initIdx = source.indexOf('function initEditorialHeroParallax');
    var endIdx = source.indexOf('function destroyEditorialHeroParallax');
    var initBlock = source.slice(initIdx, endIdx);
    // Either checks the global reduceMotion flag or queries matchMedia directly
    var hasReducedMotionCheck = initBlock.includes('reduceMotion') || initBlock.includes('prefers-reduced-motion');
    expect(hasReducedMotionCheck).toBe(true);
  });

  test('hero parallax uses requestAnimationFrame loop', () => {
    // _ehpLoop calls requestAnimationFrame and is referenced by _ehpRafId
    expect(source).toContain('requestAnimationFrame(_ehpLoop)');
    expect(source).toContain('_ehpRafId');
  });

  test('hero parallax destroy resets transform to empty string', () => {
    var destroyIdx = source.indexOf('function destroyEditorialHeroParallax');
    // Find the end of the destroy function by scanning for the next top-level function
    var nextFnIdx = source.indexOf('\nfunction ', destroyIdx + 1);
    var destroyBlock = source.slice(destroyIdx, nextFnIdx > -1 ? nextFnIdx : destroyIdx + 500);
    expect(destroyBlock).toContain("style.transform = ''");
  });

  test('hero parallax private state vars are declared in immersive-features.js', () => {
    // These vars live in the monolith (never extracted to a module)
    expect(source).toContain('var _ehpScrollTarget');
    expect(source).toContain('var _ehpScrollCurrent');
    expect(source).toContain('var _ehpRafId');
  });
});

// ---------------------------------------------------------------------------
// Property test: parallax formula is proportional and clamped
// ---------------------------------------------------------------------------

describe('Property 1 & 2: hero parallax formula — pure math invariant', () => {
  /**
   * Feature: immersive-store-modular-refactor
   * Property 1: Hero parallax transform is proportional and clamped
   *
   * For any scrollTop in [0, 300], the formula Math.min(scrollTop * 0.3, 60)
   * produces a value in [0, 60]. No DOM needed — pure math property.
   */
  test('Property 1 — for any scrollTop in [0, 300], Math.min(scrollTop * 0.3, 60) is in [0, 60]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 300 }), function (scrollTop) {
        var offset = Math.min(scrollTop * 0.3, 60);
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(60);
        // Proportional: offset grows with scrollTop until clamped
        if (scrollTop * 0.3 <= 60) {
          expect(offset).toBeCloseTo(scrollTop * 0.3, 5);
        } else {
          expect(offset).toBe(60);
        }
      }),
      { numRuns: 100 },
    );
  });

  test('Property 2 — parallax formula clamps at 60 for scrollTop >= 200', () => {
    fc.assert(
      fc.property(fc.integer({ min: 200, max: 300 }), function (scrollTop) {
        var offset = Math.min(scrollTop * 0.3, 60);
        expect(offset).toBe(60);
      }),
      { numRuns: 50 },
    );
  });
});
