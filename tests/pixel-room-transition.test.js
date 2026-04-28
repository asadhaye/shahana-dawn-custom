/**
 * Tests for pixel-room-transition feature
 * Feature: pixel-room-transition
 *
 * Test structure:
 *   - Exploration Tests (E1-E4): MUST FAIL on current code (confirm gaps exist)
 *   - Preservation Tests (P1-P3): MUST PASS on current code (pure arithmetic contracts)
 */

'use strict';

var fc = require('fast-check');
var fs = require('fs');
var path = require('path');

// ---------------------------------------------------------------------------
// Pure helper functions — JS equivalents of the GLSL shader formulas
// ---------------------------------------------------------------------------

/**
 * Compute block size from transition progress t.
 * Mirrors the GLSL formula in fragmentShaderSource.
 * Phase 1 (t < 0.5): block size grows 1 → 32
 * Phase 2 (t >= 0.5): block size shrinks 32 → 1
 */
function computeBlockSize(t) {
  // Clamp t to [0, 1] (mirrors GLSL clamp)
  var tc = Math.max(0.0, Math.min(1.0, t));
  var blockSize;
  if (tc < 0.5) {
    blockSize = 1.0 + (tc / 0.5) * 31.0;
  } else {
    blockSize = 32.0 - ((tc - 0.5) / 0.5) * 31.0;
  }
  // Clamp to [1, 32]
  return Math.max(1.0, Math.min(32.0, blockSize));
}

/**
 * Simulate the shader output color for the crossfade branch.
 * mix(color1, color2, t) — linear interpolation per channel.
 */
function mix(color1, color2, t) {
  return {
    r: color1.r + (color2.r - color1.r) * t,
    g: color1.g + (color2.g - color1.g) * t,
    b: color1.b + (color2.b - color1.b) * t,
    a: color1.a + (color2.a - color1.a) * t,
  };
}

/**
 * Simulate the shader output for the full pixel dissolve / crossfade branch.
 * When inactive (uPixelTransition < 0.5 OR uReducedMotion > 0.5),
 * output must equal mix(color1, color2, t).
 *
 * When active, we return a sentinel to indicate the pixel dissolve path was taken.
 */
function simulateShaderOutput(t, uPixelTransition, uReducedMotion, color1, color2) {
  var tc = Math.max(0.0, Math.min(1.0, t));
  var inactive = uPixelTransition < 0.5 || uReducedMotion > 0.5;
  if (inactive) {
    return mix(color1, color2, tc);
  }
  // Active pixel dissolve path — return sentinel
  return { pixelDissolvePath: true };
}

/**
 * Check if two colors are equal within floating-point tolerance.
 */
function colorsEqual(a, b, tol) {
  tol = tol || 1e-5;
  return (
    Math.abs(a.r - b.r) < tol && Math.abs(a.g - b.g) < tol && Math.abs(a.b - b.b) < tol && Math.abs(a.a - b.a) < tol
  );
}

/**
 * Compute quantized UV coordinate (JS equivalent of GLSL formula).
 * pixelCoords = floor(uv * res / blockSize) * blockSize
 * sampledUv   = pixelCoords / res
 */
function quantizeUv(uv, res, blockSize) {
  var pixelCoord = Math.floor((uv * res) / blockSize) * blockSize;
  return pixelCoord / res;
}

// ---------------------------------------------------------------------------
// EXPLORATION TESTS — MUST FAIL on current code (before implementation)
// ---------------------------------------------------------------------------

describe('Exploration Tests (must fail on current code, pass after implementation)', function () {
  var webglSrc;
  var liquidSrc;

  beforeAll(function () {
    webglSrc = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/webgl-engine.js'), 'utf8');
    liquidSrc = fs.readFileSync(path.join(__dirname, '../sections/immersive-canvas.liquid'), 'utf8');
  });

  // Feature: pixel-room-transition, Exploration Test E1
  // Validates: Requirements 2.1, 3.2
  test('E1: uniforms.uPixelTransition exists in webgl-engine.js uniforms object', function () {
    // On current code this FAILS — uPixelTransition is not yet in the uniforms object
    expect(webglSrc).toMatch(/uPixelTransition\s*:\s*\{\s*value\s*:/);
  });

  // Feature: pixel-room-transition, Exploration Test E2
  // Validates: Requirements 5.1, 5.2, 5.5
  test('E2: uniforms.uResolution exists in webgl-engine.js uniforms object', function () {
    // On current code this FAILS — uResolution is not yet in the uniforms object
    expect(webglSrc).toMatch(/uResolution\s*:\s*\{\s*value\s*:/);
  });

  // Feature: pixel-room-transition, Exploration Test E3
  // Validates: Requirements 1.1, 1.2, 1.4
  test('E3: fragmentShaderSource contains uPixelTransition uniform declaration', function () {
    // On current code this FAILS — the shader does not declare uPixelTransition
    expect(webglSrc).toMatch(/uniform\s+float\s+uPixelTransition/);
  });

  // Feature: pixel-room-transition, Exploration Test E4
  // Validates: Requirements 3.1, 3.4
  test('E4: immersive-canvas.liquid has transition_style setting in schema', function () {
    // On current code this FAILS — the schema does not have transition_style
    expect(liquidSrc).toMatch(/transition_style/);
  });
});

// ---------------------------------------------------------------------------
// PRESERVATION TESTS — MUST PASS on current code (pure arithmetic contracts)
// ---------------------------------------------------------------------------

describe('Preservation Tests (pure arithmetic — pass before and after implementation)', function () {
  // Feature: pixel-room-transition, Property 1: Block size is always in [1, 32]
  // Validates: Requirements 1.1, 1.2, 8.3, 8.4, 8.5
  test('P1 (Property 1): block size formula always produces values in [1.0, 32.0] for all t in [0, 1]', function () {
    fc.assert(
      fc.property(fc.float({ min: 0.0, max: 1.0, noNaN: true }), function (t) {
        var blockSize = computeBlockSize(t);
        expect(blockSize).toBeGreaterThanOrEqual(1.0);
        expect(blockSize).toBeLessThanOrEqual(32.0);
      }),
      { numRuns: 200 },
    );
  });

  test('P1b: block size equals 1.0 at t=0.0 and t=1.0 (sharp boundaries)', function () {
    expect(computeBlockSize(0.0)).toBeCloseTo(1.0, 5);
    expect(computeBlockSize(1.0)).toBeCloseTo(1.0, 5);
  });

  test('P1c: block size equals 32.0 at t=0.5 from both sides (continuous crossover)', function () {
    var eps = 1e-6;
    var leftOf = computeBlockSize(0.5 - eps);
    var rightOf = computeBlockSize(0.5 + eps);
    // Both sides should be very close to 32.0
    expect(leftOf).toBeCloseTo(32.0, 2);
    expect(rightOf).toBeCloseTo(32.0, 2);
    // And they should be close to each other (continuity)
    expect(Math.abs(leftOf - rightOf)).toBeLessThan(0.01);
  });

  test('P1d: block size at exactly t=0.5 equals 32.0', function () {
    expect(computeBlockSize(0.5)).toBeCloseTo(32.0, 5);
  });

  // Feature: pixel-room-transition, Property 2: Crossfade identity when pixel dissolve inactive
  // Validates: Requirements 1.5, 4.2
  test('P2 (Property 2): when pixel dissolve inactive, output equals mix(color1, color2, t)', function () {
    var mockColor1 = { r: 0.2, g: 0.4, b: 0.6, a: 1.0 };
    var mockColor2 = { r: 0.8, g: 0.6, b: 0.4, a: 1.0 };

    fc.assert(
      fc.property(
        fc.float({ min: 0.0, max: 1.0, noNaN: true }),
        fc.constantFrom(0.0, 1.0), // uPixelTransition
        fc.constantFrom(0.0, 1.0), // uReducedMotion
        function (t, uPixelTransition, uReducedMotion) {
          var inactive = uPixelTransition < 0.5 || uReducedMotion > 0.5;
          if (!inactive) return; // only test inactive case

          var result = simulateShaderOutput(t, uPixelTransition, uReducedMotion, mockColor1, mockColor2);
          var expected = mix(mockColor1, mockColor2, Math.max(0.0, Math.min(1.0, t)));

          expect(colorsEqual(result, expected)).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P2b: crossfade at t=0 returns color1 exactly', function () {
    var c1 = { r: 0.1, g: 0.2, b: 0.3, a: 1.0 };
    var c2 = { r: 0.9, g: 0.8, b: 0.7, a: 1.0 };
    var result = simulateShaderOutput(0.0, 0.0, 0.0, c1, c2);
    expect(colorsEqual(result, c1)).toBe(true);
  });

  test('P2c: crossfade at t=1 returns color2 exactly', function () {
    var c1 = { r: 0.1, g: 0.2, b: 0.3, a: 1.0 };
    var c2 = { r: 0.9, g: 0.8, b: 0.7, a: 1.0 };
    var result = simulateShaderOutput(1.0, 0.0, 0.0, c1, c2);
    expect(colorsEqual(result, c2)).toBe(true);
  });

  test('P2d: uReducedMotion=1.0 forces crossfade even when uPixelTransition=1.0', function () {
    var c1 = { r: 0.1, g: 0.2, b: 0.3, a: 1.0 };
    var c2 = { r: 0.9, g: 0.8, b: 0.7, a: 1.0 };
    var t = 0.3;
    // uPixelTransition=1.0 but uReducedMotion=1.0 → must use crossfade
    var result = simulateShaderOutput(t, 1.0, 1.0, c1, c2);
    var expected = mix(c1, c2, t);
    expect(colorsEqual(result, expected)).toBe(true);
  });

  // Feature: pixel-room-transition, Property 3: UV quantization snaps to correct screen-space grid
  // Validates: Requirements 1.4, 5.3, 5.4
  test('P3 (Property 3): quantized UV pixel coordinate is always a multiple of blockSize', function () {
    fc.assert(
      fc.property(
        fc.float({ min: 0.0, max: 1.0, noNaN: true }), // uvX
        fc.float({ min: 0.0, max: 1.0, noNaN: true }), // uvY
        fc.integer({ min: 1, max: 4096 }), // resW
        fc.integer({ min: 1, max: 4096 }), // resH
        fc.float({ min: 1.0, max: 32.0, noNaN: true }), // blockSize
        function (uvX, uvY, resW, resH, blockSize) {
          var pixelX = Math.floor((uvX * resW) / blockSize) * blockSize;
          var pixelY = Math.floor((uvY * resH) / blockSize) * blockSize;
          // Pixel coordinates must be multiples of blockSize
          expect(Math.abs(pixelX % blockSize)).toBeLessThan(0.001);
          expect(Math.abs(pixelY % blockSize)).toBeLessThan(0.001);
        },
      ),
      { numRuns: 200 },
    );
  });

  test('P3b: when blockSize=1.0, quantized UV equals floor(uv * res) / res (identity for integer coords)', function () {
    fc.assert(
      fc.property(fc.float({ min: 0.0, max: 1.0, noNaN: true }), fc.integer({ min: 1, max: 4096 }), function (uv, res) {
        var quantized = quantizeUv(uv, res, 1.0);
        // floor(uv * res) / res — should be <= uv and within 1/res of uv
        expect(quantized).toBeLessThanOrEqual(uv + 1e-9);
        expect(quantized).toBeGreaterThanOrEqual(0.0);
        expect(uv - quantized).toBeLessThan(1.0 / res + 1e-9);
      }),
      { numRuns: 200 },
    );
  });

  test('P3c: quantized UV is always in [0, 1] range', function () {
    fc.assert(
      fc.property(
        fc.float({ min: 0.0, max: 1.0, noNaN: true }),
        fc.integer({ min: 1, max: 4096 }),
        fc.float({ min: 1.0, max: 32.0, noNaN: true }),
        function (uv, res, blockSize) {
          var quantized = quantizeUv(uv, res, blockSize);
          expect(quantized).toBeGreaterThanOrEqual(0.0);
          expect(quantized).toBeLessThanOrEqual(1.0 + 1e-9);
        },
      ),
      { numRuns: 200 },
    );
  });
});
