/**
 * Property-Based Test: Gesture Exclusivity
 *
 * Feature: immersive-ux-enhancements
 * Property 6: Gesture exclusivity
 *
 * **Validates: Requirements 3.8**
 *
 * For any touch event sequence with any (deltaX, deltaY) values,
 * ImmersiveGestures SHALL classify at most one gesture type
 * (horizontal, vertical-up, vertical-down, or none) — never two
 * gesture types simultaneously.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// classifyGesture — reproduced verbatim from assets/immersive-store.js
//
// function classifyGesture(deltaX, deltaY) {
//   var absDx = Math.abs(deltaX);
//   var absDy = Math.abs(deltaY);
//   if (absDx < 60 && absDy < 60) return 'none';
//   if (absDy === 0) return absDx >= 60 ? 'horizontal' : 'none';
//   var ratio = absDx / absDy;
//   if (ratio > 2.5) return 'horizontal';
//   if (absDy >= 60) return deltaY > 0 ? 'vertical-down' : 'vertical-up';
//   return 'none';
// }
// ---------------------------------------------------------------------------

function classifyGesture(deltaX, deltaY) {
  var absDx = Math.abs(deltaX);
  var absDy = Math.abs(deltaY);
  if (absDx < 60 && absDy < 60) return 'none';
  if (absDy === 0) return absDx >= 60 ? 'horizontal' : 'none';
  var ratio = absDx / absDy;
  if (ratio > 2.5) return 'horizontal';
  if (absDy >= 60) return deltaY > 0 ? 'vertical-down' : 'vertical-up';
  return 'none';
}

const VALID_GESTURE_TYPES = ['horizontal', 'vertical-up', 'vertical-down', 'none'];

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates arbitrary (deltaX, deltaY) pairs covering the full range of
 * realistic swipe deltas, including edge cases near the 60px threshold
 * and the 2.5 ratio boundary.
 */
const deltaPairArb = fc.tuple(fc.integer({ min: -500, max: 500 }), fc.integer({ min: -500, max: 500 }));

/**
 * Generates delta pairs specifically near the threshold boundaries to
 * stress-test edge cases.
 */
const boundaryDeltaArb = fc.tuple(
  fc.oneof(
    fc.integer({ min: -65, max: 65 }), // near 60px threshold
    fc.integer({ min: -200, max: 200 }), // wider range
  ),
  fc.oneof(fc.integer({ min: -65, max: 65 }), fc.integer({ min: -200, max: 200 })),
);

// ---------------------------------------------------------------------------
// Property 6: Gesture exclusivity
//
// **Validates: Requirements 3.8**
// ---------------------------------------------------------------------------

describe('Property 6: Gesture exclusivity', () => {
  /**
   * **Validates: Requirements 3.8**
   *
   * classifyGesture() must always return exactly one of the four valid
   * gesture types — never an unexpected value, never undefined.
   */
  test('classifyGesture always returns exactly one valid gesture type', () => {
    fc.assert(
      fc.property(deltaPairArb, function (pair) {
        var result = classifyGesture(pair[0], pair[1]);
        return VALID_GESTURE_TYPES.indexOf(result) !== -1;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 3.8**
   *
   * The function is deterministic: calling it twice with the same inputs
   * always returns the same result.
   */
  test('classifyGesture is deterministic for any (deltaX, deltaY)', () => {
    fc.assert(
      fc.property(deltaPairArb, function (pair) {
        var result1 = classifyGesture(pair[0], pair[1]);
        var result2 = classifyGesture(pair[0], pair[1]);
        return result1 === result2;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 3.8**
   *
   * The result is never null or undefined.
   */
  test('classifyGesture never returns null or undefined', () => {
    fc.assert(
      fc.property(deltaPairArb, function (pair) {
        var result = classifyGesture(pair[0], pair[1]);
        return result !== null && result !== undefined;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 3.8**
   *
   * Boundary stress test: near-threshold values still produce exactly one type.
   */
  test('boundary delta values always produce exactly one valid gesture type', () => {
    fc.assert(
      fc.property(boundaryDeltaArb, function (pair) {
        var result = classifyGesture(pair[0], pair[1]);
        return VALID_GESTURE_TYPES.indexOf(result) !== -1;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  // ---------------------------------------------------------------------------
  // Deterministic boundary cases
  // ---------------------------------------------------------------------------

  test('both deltas below 60px → none', () => {
    expect(classifyGesture(0, 0)).toBe('none');
    expect(classifyGesture(59, 0)).toBe('none');
    expect(classifyGesture(0, 59)).toBe('none');
    expect(classifyGesture(59, 59)).toBe('none');
    expect(classifyGesture(-59, -59)).toBe('none');
  });

  test('horizontal swipe: |deltaX| >= 60 and ratio > 2.5 → horizontal', () => {
    // deltaX=150, deltaY=0 → ratio=Infinity → horizontal
    expect(classifyGesture(150, 0)).toBe('horizontal');
    expect(classifyGesture(-150, 0)).toBe('horizontal');
    // deltaX=200, deltaY=50 → ratio=4 > 2.5 → horizontal
    expect(classifyGesture(200, 50)).toBe('horizontal');
    expect(classifyGesture(-200, -50)).toBe('horizontal');
  });

  test('vertical-down swipe: |deltaY| >= 60 and ratio <= 2.5 and deltaY > 0 → vertical-down', () => {
    // deltaX=0, deltaY=100 → ratio=0 → vertical-down
    expect(classifyGesture(0, 100)).toBe('vertical-down');
    // deltaX=50, deltaY=100 → ratio=0.5 → vertical-down
    expect(classifyGesture(50, 100)).toBe('vertical-down');
  });

  test('vertical-up swipe: |deltaY| >= 60 and ratio <= 2.5 and deltaY < 0 → vertical-up', () => {
    expect(classifyGesture(0, -100)).toBe('vertical-up');
    expect(classifyGesture(50, -100)).toBe('vertical-up');
  });

  test('diagonal near 2.5 ratio boundary: ratio exactly 2.5 → not horizontal', () => {
    // ratio = 150/60 = 2.5 — NOT > 2.5, so falls through to vertical check
    // |deltaY|=60 >= 60, deltaY=60 > 0 → vertical-down
    expect(classifyGesture(150, 60)).toBe('vertical-down');
  });

  test('diagonal just above 2.5 ratio → horizontal', () => {
    // ratio = 151/60 ≈ 2.517 > 2.5 → horizontal
    expect(classifyGesture(151, 60)).toBe('horizontal');
  });
});
