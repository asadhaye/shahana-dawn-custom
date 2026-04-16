/**
 * Property-Based Test: Countdown Non-Negativity
 *
 * Feature: immersive-ux-enhancements
 * Property 7: Countdown non-negativity
 *
 * **Validates: Requirements 8.3**
 *
 * For any endTime value, computeCountdown(endTime) SHALL return a
 * CountdownState where either expired === true (for past times) OR all of
 * days, hours, minutes, and seconds are >= 0 (for future times) —
 * negative countdown values SHALL never be produced.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// computeCountdown — reproduced verbatim from assets/immersive-store.js
// ---------------------------------------------------------------------------

function computeCountdown(endTime) {
  var now = Date.now();
  var end = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();
  if (isNaN(end) || end <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  var diff = Math.floor((end - now) / 1000);
  var days = Math.floor(diff / 86400);
  var hours = Math.floor((diff % 86400) / 3600);
  var minutes = Math.floor((diff % 3600) / 60);
  var seconds = diff % 60;
  return { days: days, hours: hours, minutes: minutes, seconds: seconds, expired: false };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates arbitrary Date objects spanning past and future times.
 * fc.date() generates dates in a wide range including past and future.
 */
const dateArb = fc.date();

/**
 * Generates dates guaranteed to be in the past (relative to test execution).
 */
const pastDateArb = fc.date({ max: new Date(Date.now() - 1000) });

/**
 * Generates dates guaranteed to be in the future (relative to test execution).
 * We use at least 5 seconds in the future to avoid flakiness.
 */
const futureDateArb = fc.date({ min: new Date(Date.now() + 5000) });

/**
 * Generates invalid date inputs (strings that are not valid ISO 8601).
 */
const invalidDateArb = fc.oneof(
  fc.constant('not-a-date'),
  fc.constant(''),
  fc.constant('2024-13-45'),
  fc.constant('abc'),
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(NaN),
);

// ---------------------------------------------------------------------------
// Property 7: Countdown non-negativity
//
// **Validates: Requirements 8.3**
// ---------------------------------------------------------------------------

describe('Property 7: Countdown non-negativity', () => {
  /**
   * **Validates: Requirements 8.3**
   *
   * For any Date object (past or future), computeCountdown() must return
   * either expired=true OR all fields >= 0. Never negative values.
   */
  test('computeCountdown never produces negative field values for any Date', () => {
    fc.assert(
      fc.property(dateArb, function (date) {
        var state = computeCountdown(date);
        if (state.expired) return true; // expired is valid
        return state.days >= 0 && state.hours >= 0 && state.minutes >= 0 && state.seconds >= 0;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * Past dates always produce expired=true.
   */
  test('past dates always produce expired=true', () => {
    fc.assert(
      fc.property(pastDateArb, function (date) {
        var state = computeCountdown(date);
        return state.expired === true;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * Future dates always produce expired=false with all fields >= 0.
   */
  test('future dates always produce expired=false with all fields >= 0', () => {
    fc.assert(
      fc.property(futureDateArb, function (date) {
        var state = computeCountdown(date);
        if (state.expired) return false; // future date should not be expired
        return state.days >= 0 && state.hours >= 0 && state.minutes >= 0 && state.seconds >= 0;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * Invalid date inputs produce expired=true (silently handled).
   */
  test('invalid date inputs produce expired=true (silently skipped)', () => {
    fc.assert(
      fc.property(invalidDateArb, function (invalid) {
        var state = computeCountdown(invalid);
        return state.expired === true;
      }),
      { numRuns: 100, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * When expired=true, all numeric fields are 0 (not negative).
   */
  test('expired state always has all fields equal to 0', () => {
    fc.assert(
      fc.property(pastDateArb, function (date) {
        var state = computeCountdown(date);
        return state.days === 0 && state.hours === 0 && state.minutes === 0 && state.seconds === 0;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * hours field is always in [0, 23] for non-expired states.
   */
  test('hours field is always in [0, 23] for non-expired states', () => {
    fc.assert(
      fc.property(futureDateArb, function (date) {
        var state = computeCountdown(date);
        if (state.expired) return true;
        return state.hours >= 0 && state.hours <= 23;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * minutes field is always in [0, 59] for non-expired states.
   */
  test('minutes field is always in [0, 59] for non-expired states', () => {
    fc.assert(
      fc.property(futureDateArb, function (date) {
        var state = computeCountdown(date);
        if (state.expired) return true;
        return state.minutes >= 0 && state.minutes <= 59;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 8.3**
   *
   * seconds field is always in [0, 59] for non-expired states.
   */
  test('seconds field is always in [0, 59] for non-expired states', () => {
    fc.assert(
      fc.property(futureDateArb, function (date) {
        var state = computeCountdown(date);
        if (state.expired) return true;
        return state.seconds >= 0 && state.seconds <= 59;
      }),
      { numRuns: 300, verbose: true },
    );
  });
});
