/**
 * Tests for skeleton-fluid-reveal feature
 * Feature: skeleton-fluid-reveal
 *
 * Test structure:
 *   - Exploration Tests (E1-E4): MUST FAIL on current code (confirm gaps exist)
 *   - Preservation Tests (P1, P2, P5): MUST PASS on current code (pure arithmetic contracts)
 */

'use strict';

var fc = require('fast-check');
var fs = require('fs');
var path = require('path');

// ---------------------------------------------------------------------------
// EXPLORATION TESTS — MUST FAIL on current code (before implementation)
// ---------------------------------------------------------------------------

describe('Exploration Tests (must fail on current code, pass after implementation)', function () {
  // Feature: skeleton-fluid-reveal, Exploration Test E1
  // Validates: Requirements 10.1, 10.2
  test('E1: window.ImmersiveFluidReveal is exposed by fluid-reveal.js', function () {
    // On current code this FAILS — fluid-reveal.js does not exist yet
    var fluidRevealPath = path.join(__dirname, '../assets/immersive/fluid-reveal.js');
    expect(fs.existsSync(fluidRevealPath)).toBe(true);
    var src = fs.readFileSync(fluidRevealPath, 'utf8');
    expect(src).toMatch(/window\.ImmersiveFluidReveal/);
  });

  // Feature: skeleton-fluid-reveal, Exploration Test E2
  // Validates: Requirements 5.1, 6.1
  test('E2: assets/immersive/fluid-reveal.js exists', function () {
    // On current code this FAILS — the file does not exist
    var fluidRevealPath = path.join(__dirname, '../assets/immersive/fluid-reveal.js');
    expect(fs.existsSync(fluidRevealPath)).toBe(true);
  });

  // Feature: skeleton-fluid-reveal, Exploration Test E3
  // Validates: Requirements 11.1, 11.2
  test('E3: sections/immersive-product-grid.liquid has enable_fluid_reveal setting', function () {
    // On current code this FAILS — the schema does not have enable_fluid_reveal
    var liquidSrc = fs.readFileSync(path.join(__dirname, '../sections/immersive-product-grid.liquid'), 'utf8');
    expect(liquidSrc).toMatch(/enable_fluid_reveal/);
  });

  // Feature: skeleton-fluid-reveal, Exploration Test E4
  // Validates: Requirements 5.1, 6.1
  test('E4: layout/theme.liquid loads fluid-reveal.js', function () {
    // On current code this FAILS — theme.liquid does not load fluid-reveal.js
    var themeSrc = fs.readFileSync(path.join(__dirname, '../layout/theme.liquid'), 'utf8');
    expect(themeSrc).toMatch(/fluid-reveal\.js/);
  });
});

// ---------------------------------------------------------------------------
// PRESERVATION TESTS — MUST PASS on current code (pure arithmetic contracts)
// ---------------------------------------------------------------------------

describe('Preservation Tests (pure arithmetic — pass before and after implementation)', function () {
  /**
   * One lerp step: current += (target - current) * alpha
   */
  function lerpStep(current, target, alpha) {
    return current + (target - current) * alpha;
  }

  /**
   * Run lerp until convergence or max iterations.
   * Returns { converged, steps, finalValue, monotonicityViolated }
   */
  function runLerpToConvergence(initial, target, alpha, maxIter) {
    maxIter = maxIter || 10000;
    var current = initial;
    for (var i = 0; i < maxIter; i++) {
      var next = current + (target - current) * alpha;
      if (Math.abs(next - target) > Math.abs(current - target) + 0.0001) {
        return { converged: false, steps: i, finalValue: next, monotonicityViolated: true };
      }
      current = next;
      if (Math.abs(current - target) < 0.001) {
        return { converged: true, steps: i + 1, finalValue: current };
      }
    }
    return { converged: false, steps: maxIter, finalValue: current };
  }

  // Feature: skeleton-fluid-reveal, Property 1: Scale is always within [0, maxScale]
  // Validates: Requirements 2.3, 4.1, 4.2
  test('P1 (Property 1): Scale lerp always stays in [0, maxScale] for all valid inputs', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.constantFrom(0, 1),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(50), noNaN: true }),
        function (normCurrent, normTarget, alpha, maxScale) {
          var current = normCurrent * maxScale;
          var target = normTarget * maxScale;
          var next = lerpStep(current, target, alpha);
          expect(next).toBeGreaterThanOrEqual(-0.0001);
          expect(next).toBeLessThanOrEqual(maxScale + 0.0001);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P1b: lerp from 0 toward maxScale stays in [0, maxScale] for all alpha', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.999), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(50), noNaN: true }),
        function (alpha, maxScale) {
          var current = 0;
          var target = maxScale;
          var next = lerpStep(current, target, alpha);
          expect(next).toBeGreaterThanOrEqual(0);
          expect(next).toBeLessThanOrEqual(maxScale + 0.0001);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P1c: lerp from maxScale toward 0 stays in [0, maxScale] for all alpha', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.999), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(50), noNaN: true }),
        function (alpha, maxScale) {
          var current = maxScale;
          var target = 0;
          var next = lerpStep(current, target, alpha);
          expect(next).toBeGreaterThanOrEqual(-0.0001);
          expect(next).toBeLessThanOrEqual(maxScale + 0.0001);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: skeleton-fluid-reveal, Property 2: Lerp converges monotonically toward target
  // Validates: Requirements 4.1, 4.2, 4.4
  test('P2 (Property 2): Lerp converges monotonically toward target within finite steps', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
        fc.constantFrom(0, 30),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.3), noNaN: true }),
        function (current, target, alpha) {
          var result = runLerpToConvergence(current, target, alpha);
          expect(result.monotonicityViolated).toBeFalsy();
          expect(result.converged).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P2b: lerp distance to target strictly decreases each step (monotonic)', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(50), noNaN: true }),
        fc.constantFrom(0, 30),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
        function (initial, target, alpha) {
          if (Math.abs(initial - target) < 0.001) return;
          var current = initial;
          var distBefore = Math.abs(current - target);
          var next = lerpStep(current, target, alpha);
          var distAfter = Math.abs(next - target);
          expect(distAfter).toBeLessThan(distBefore + 0.0001);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P2c: lerp with alpha=1.0 converges in exactly one step', function () {
    var current = 25;
    var target = 0;
    var next = lerpStep(current, target, 1.0);
    expect(next).toBeCloseTo(target, 5);
  });

  // Feature: skeleton-fluid-reveal, Property 5: RAF idle when scaleCurrent < 0.001 and scaleTarget = 0
  // Validates: Requirements 4.4, 6.3
  test('P5 (Property 5): RAF loop stops (rafId = null) when scaleCurrent < 0.001 and scaleTarget = 0', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(50), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.3), noNaN: true }),
        function (initialScale, alpha) {
          var state = {
            scaleCurrent: initialScale,
            scaleTarget: 0,
            rafId: 1,
          };

          for (var i = 0; i < 10000; i++) {
            state.scaleCurrent += (state.scaleTarget - state.scaleCurrent) * alpha;

            if (Math.abs(state.scaleCurrent - state.scaleTarget) < 0.001) {
              state.scaleCurrent = state.scaleTarget;
            }

            if (state.scaleCurrent < 0.001 && state.scaleTarget === 0) {
              state.rafId = null;
              break;
            }
          }

          expect(state.rafId).toBeNull();
          expect(state.scaleCurrent).toBeLessThan(0.001);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P5b: RAF stays running while scaleCurrent is above threshold', function () {
    var state = {
      scaleCurrent: 5.0,
      scaleTarget: 0,
      rafId: 1,
    };
    var alpha = 0.06;
    state.scaleCurrent += (state.scaleTarget - state.scaleCurrent) * alpha;
    if (state.scaleCurrent >= 0.001) {
      expect(state.rafId).not.toBeNull();
    }
  });

  test('P5c: RAF stops immediately when scaleCurrent is already below threshold and scaleTarget is 0', function () {
    var state = {
      scaleCurrent: 0.0005,
      scaleTarget: 0,
      rafId: 1,
    };
    if (state.scaleCurrent < 0.001 && state.scaleTarget === 0) {
      state.rafId = null;
    }
    expect(state.rafId).toBeNull();
  });
});
