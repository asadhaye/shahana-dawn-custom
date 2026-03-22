/**
 * Property-Based Tests and Unit Tests for Cart/Error Feedback
 *
 * Feature: immersive-store-glass-panel-improvements
 *
 * Property 13: Cart Addition Feedback
 *   Validates: Requirements 5.1, 5.4
 *
 * Unit Tests: Error Feedback Display
 *   Validates: Requirements 6.3
 *
 * Functions are reproduced verbatim from dawn/assets/immersive-store.js
 * for isolated testing (the source file is a browser script with no exports).
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// showCartFeedback — reproduced from dawn/assets/immersive-store.js (line 720)
// ---------------------------------------------------------------------------

function showCartFeedback(panel) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-cart-feedback';
  feedback.textContent = 'Added to cart!';
  feedback.style.cssText =
    'position: fixed; top: 20px; right: 20px; background: rgba(212, 175, 55, 0.9); color: #000; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600;';

  document.body.appendChild(feedback);

  setTimeout(function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) {
        document.body.removeChild(feedback);
      }
    }, 300);
  }, 2000);
}

// ---------------------------------------------------------------------------
// showErrorFeedback — reproduced from dawn/assets/immersive-store.js (line 739)
// ---------------------------------------------------------------------------

function showErrorFeedback(panel, message) {
  var feedback = document.createElement('div');
  feedback.className = 'immersive-error-feedback';
  feedback.textContent = message;
  feedback.style.cssText =
    'position: fixed; top: 20px; right: 20px; background: rgba(239, 68, 68, 0.9); color: #fff; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; font-weight: 600; cursor: pointer;';

  document.body.appendChild(feedback);

  var dismissFeedback = function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) {
        document.body.removeChild(feedback);
      }
    }, 300);
  };

  feedback.addEventListener('click', dismissFeedback);
  setTimeout(dismissFeedback, 4000);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generates an arbitrary panel-like object (div with optional attributes). */
const panelArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 9999999 }),
  collectionHandle: fc.stringMatching(/^[a-z][a-z0-9-]{0,49}$/),
  productCount: fc.integer({ min: 0, max: 50 }),
});

/** Creates a minimal panel element from an arbitrary panel descriptor. */
function createPanel(panelData) {
  var panel = document.createElement('div');
  panel.id = 'glass-panel-' + panelData.id;
  panel.setAttribute('data-collection', panelData.collectionHandle);
  return panel;
}

// ---------------------------------------------------------------------------
// Property 13: Cart Addition Feedback
//
// "For any successful product addition to cart, a visual feedback element
//  SHALL appear in the DOM within 200ms of the cart add action."
//
// Validates: Requirements 5.1, 5.4
// ---------------------------------------------------------------------------

describe('Property 13: Cart Addition Feedback', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * **Validates: Requirements 5.1, 5.4**
   *
   * For any panel input, calling showCartFeedback() must synchronously
   * append a .immersive-cart-feedback element to the DOM.
   * Because appendChild is synchronous, the element is present in 0ms —
   * well within the 200ms requirement.
   *
   * We use fast-check to confirm this property holds across 100 arbitrary
   * panel inputs.
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 13: Cart Addition Feedback
    'showCartFeedback appends .immersive-cart-feedback to DOM within 200ms for any panel input',
    () => {
      fc.assert(
        fc.property(panelArbitrary, function (panelData) {
          // Clean up between iterations
          document.body.innerHTML = '';

          var panel = createPanel(panelData);

          var before = Date.now();
          showCartFeedback(panel);
          var elapsed = Date.now() - before;

          // 1. The feedback element must exist in the DOM
          var feedbackEl = document.querySelector('.immersive-cart-feedback');
          if (!feedbackEl) return false;

          // 2. It must have appeared within 200ms (synchronous call, so elapsed ≈ 0)
          if (elapsed > 200) return false;

          // 3. The element must be a child of document.body
          if (feedbackEl.parentNode !== document.body) return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 5.1**
   *
   * For any panel input, the feedback element must display the success
   * message "Added to cart!" so the user knows the action succeeded.
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 13: Cart Addition Feedback
    'showCartFeedback element contains "Added to cart!" text for any panel input',
    () => {
      fc.assert(
        fc.property(panelArbitrary, function (panelData) {
          document.body.innerHTML = '';

          var panel = createPanel(panelData);
          showCartFeedback(panel);

          var feedbackEl = document.querySelector('.immersive-cart-feedback');
          if (!feedbackEl) return false;

          return feedbackEl.textContent === 'Added to cart!';
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 5.4**
   *
   * Timing invariant: the elapsed time between calling showCartFeedback()
   * and the feedback element being queryable from the DOM must be < 200ms
   * for all panel inputs. Since appendChild is synchronous this is always
   * satisfied, but we measure it explicitly to guard against regressions.
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 13: Cart Addition Feedback
    'feedback appears in under 200ms for any panel input (timing invariant)',
    () => {
      fc.assert(
        fc.property(panelArbitrary, function (panelData) {
          document.body.innerHTML = '';

          var panel = createPanel(panelData);

          var t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
          showCartFeedback(panel);
          var t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();

          var elapsed = t1 - t0;

          var feedbackEl = document.querySelector('.immersive-cart-feedback');
          return feedbackEl !== null && elapsed < 200;
        }),
        { numRuns: 100, verbose: false }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Unit Tests: Error Feedback Display
//
// Validates: Requirements 6.3
// "WHEN product details are unavailable, THE Glass_Panel SHALL display a
//  descriptive error message."
// ---------------------------------------------------------------------------

describe('showErrorFeedback — error message appears with correct text (Requirement 6.3)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('appends .immersive-error-feedback element to the DOM', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'This product is currently unavailable');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
  });

  test('displays the exact error message passed as argument', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'This product is currently unavailable');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl.textContent).toBe('This product is currently unavailable');
  });

  test('error element is appended to document.body', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Unable to load content');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl.parentNode).toBe(document.body);
  });
});

describe('showErrorFeedback — error dismisses after timeout (Requirement 6.3)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('feedback element is still present before 4 seconds', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Network error');

    jest.advanceTimersByTime(3999);

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
  });

  test('feedback begins fade-out at 4 seconds (opacity set to 0)', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Network error');

    jest.advanceTimersByTime(4000);

    var errorEl = document.querySelector('.immersive-error-feedback');
    // The dismissFeedback function sets opacity to '0' at the 4s mark
    expect(errorEl).not.toBeNull();
    expect(errorEl.style.opacity).toBe('0');
  });

  test('feedback element is removed from DOM after 4300ms (4s + 300ms fade)', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Network error');

    jest.advanceTimersByTime(4300);

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).toBeNull();
  });

  test('clicking the feedback element triggers immediate dismissal (opacity 0)', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Cart error');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();

    errorEl.click();

    expect(errorEl.style.opacity).toBe('0');
  });

  test('feedback is removed from DOM 300ms after manual click', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Cart error');

    var errorEl = document.querySelector('.immersive-error-feedback');
    errorEl.click();

    jest.advanceTimersByTime(300);

    expect(document.querySelector('.immersive-error-feedback')).toBeNull();
  });
});

describe('showErrorFeedback — multiple error scenarios (Requirement 6.3)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('displays network error message', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Unable to load content. Please check your connection and try again.');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe(
      'Unable to load content. Please check your connection and try again.'
    );
  });

  test('displays cart error message', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Unable to add product to cart. Please try again.');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Unable to add product to cart. Please try again.');
  });

  test('displays validation error message', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'Please select a size');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Please select a size');
  });

  test('displays product unavailable error message', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'This product is currently unavailable');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('This product is currently unavailable');
  });

  test('displays sold-out variant error message', () => {
    var panel = document.createElement('div');
    showErrorFeedback(panel, 'This variant is sold out');

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('This variant is sold out');
  });
});
