'use strict';

// Feature: editorial-parallax-gallery

const fs = require('fs');
const path = require('path');
const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Load the actual liquid file for exploration tests
// ---------------------------------------------------------------------------

var liquidFilePath = path.join(__dirname, '..', 'sections', 'immersive-editorial.liquid');
var liquidContent = fs.readFileSync(liquidFilePath, 'utf8');

// ---------------------------------------------------------------------------
// PART 1: Exploration tests — MUST FAIL on current code (before implementation)
// These tests confirm the feature does NOT yet exist.
// After implementation (Task 3), all four must PASS.
// ---------------------------------------------------------------------------

describe('Exploration: editorial-parallax-gallery feature not yet present', function () {
  // E1: layout select does not yet have 'parallax' as an option
  test('E1: immersive-editorial.liquid has parallax as a layout option', function () {
    // After implementation, the schema layout select must include value "parallax"
    expect(liquidContent).toContain('"value": "parallax"');
  });

  // E2: no parallax_image block type exists yet
  test('E2: immersive-editorial.liquid has parallax_image block type', function () {
    // After implementation, the schema blocks array must include type "parallax_image"
    expect(liquidContent).toContain('"type": "parallax_image"');
  });

  // E3: no max_offset_px setting exists yet
  test('E3: immersive-editorial.liquid has max_offset_px setting', function () {
    // After implementation, the schema settings must include id "max_offset_px"
    expect(liquidContent).toContain('"id": "max_offset_px"');
  });

  // E4: no data-parallax-gallery attribute in the HTML
  test('E4: immersive-editorial.liquid has data-parallax-gallery attribute', function () {
    // After implementation, the Liquid template must render data-parallax-gallery
    expect(liquidContent).toContain('data-parallax-gallery');
  });
});

// ---------------------------------------------------------------------------
// PART 2: Preservation tests — MUST PASS on current code AND after implementation
// These test pure arithmetic properties of the parallax controller logic.
// ---------------------------------------------------------------------------

// Pure arithmetic helpers — mirror the Parallax_Controller formulas exactly

function computeScrollTarget(scrollTop, maxScroll) {
  return maxScroll > 0 ? scrollTop / maxScroll : 0;
}

function computeTranslateX(scrollCurrent, depthMultiplier, maxOffset) {
  return scrollCurrent * depthMultiplier * maxOffset;
}

function lerpStep(current, target, factor) {
  return current + (target - current) * factor;
}

describe('Preservation: parallax controller pure arithmetic properties', function () {
  // P1: Scroll progress always in [0, 1]
  // Validates: Requirements 2.1, 2.3, 2.4
  test('P1: Scroll progress is always in [0, 1]', function () {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }), // maxScroll (scrollHeight - clientHeight)
        fc.float({ min: 0, max: 1, noNaN: true }), // normalised scrollTop position
        function (maxScroll, t) {
          var scrollTop = Math.round(t * maxScroll);
          var scrollTarget = computeScrollTarget(scrollTop, maxScroll);
          return scrollTarget >= 0 && scrollTarget <= 1 + 1e-9;
        },
      ),
      { numRuns: 100 },
    );
  });

  // P1 edge case: maxScroll = 0 returns 0 (no division by zero)
  test('P1 edge: maxScroll = 0 returns scrollTarget = 0', function () {
    expect(computeScrollTarget(0, 0)).toBe(0);
    expect(computeScrollTarget(100, 0)).toBe(0);
  });

  // P2: translateX always in [0, maxOffset]
  // Validates: Requirements 2.1, 2.3, 2.4, 3.1
  test('P2: translateX is always in [0, maxOffset]', function () {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollCurrent
        fc.float({ min: 0, max: 1, noNaN: true }), // depthMultiplier
        fc.integer({ min: 20, max: 240 }), // maxOffset
        function (scrollCurrent, depth, maxOffset) {
          var tx = computeTranslateX(scrollCurrent, depth, maxOffset);
          return tx >= 0 && tx <= maxOffset + 1e-9;
        },
      ),
      { numRuns: 100 },
    );
  });

  // P3: Lerp converges monotonically toward target without overshoot
  // Validates: Requirements 5.1, 5.3
  test('P3: Lerp converges monotonically toward target without overshoot', function () {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollCurrent
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollTarget
        function (current, target) {
          if (Math.abs(current - target) < 1e-9) return true; // skip degenerate case
          var next = lerpStep(current, target, 0.08);
          var distBefore = Math.abs(current - target);
          var distAfter = Math.abs(next - target);
          // Monotonic convergence: distance must strictly decrease
          var converges = distAfter < distBefore;
          // No overshoot: next must be strictly between current and target
          var noOvershoot = current <= target ? next >= current && next <= target : next <= current && next >= target;
          return converges && noOvershoot;
        },
      ),
      { numRuns: 100 },
    );
  });

  // P5: Depth layer ordering holds for all scroll progress values
  // Validates: Requirements 3.1, 3.3
  test('P5: Depth layer ordering holds — foreground > midground > background', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: 1, noNaN: true }), // scrollCurrent (exclude 0 — all equal at 0)
        fc.integer({ min: 1, max: 240 }), // maxOffset
        function (scrollCurrent, maxOffset) {
          var txBackground = computeTranslateX(scrollCurrent, 0.2, maxOffset);
          var txMidground = computeTranslateX(scrollCurrent, 0.5, maxOffset);
          var txForeground = computeTranslateX(scrollCurrent, 1.0, maxOffset);
          return txForeground > txMidground && txMidground > txBackground;
        },
      ),
      { numRuns: 100 },
    );
  });
});
