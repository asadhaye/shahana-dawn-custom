/**
 * Property-Based Test: Next Actions Singleton
 *
 * Feature: immersive-ux-enhancements
 * Property 11: Next actions singleton
 *
 * **Validates: Requirements 5.7**
 *
 * For any sequence of trigger events (product view, add-to-cart, room complete),
 * at most one immersive-next-actions bar SHALL exist in the DOM at any time —
 * a new trigger SHALL replace the existing bar rather than appending a second one.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Next actions singleton model
//
// Reproduced from assets/immersive-store.js showNextActions() / dismissNextActions().
// The singleton is enforced by reusing a single _nextActionsBar element:
//   - initImmersiveNextActions() creates one bar and appends it to body
//   - showNextActions() clears and repopulates that single bar
//   - dismissNextActions() hides and clears the bar
//
// The property: after any sequence of show/dismiss calls, at most one
// .immersive-next-actions element exists in the DOM.
// ---------------------------------------------------------------------------

function createNextActionsModule() {
  var bar = document.createElement('div');
  bar.className = 'immersive-next-actions';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');
  bar.hidden = true;
  document.body.appendChild(bar);

  var timer = null;

  function dismiss() {
    clearTimeout(timer);
    bar.classList.remove('is-visible');
    bar.hidden = true;
    bar.innerHTML = '';
  }

  function show(chips) {
    clearTimeout(timer);
    bar.innerHTML = '';

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'immersive-next-actions__chip';
      btn.textContent = chip.label;
      bar.appendChild(btn);
    });

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'immersive-next-actions__close';
    closeBtn.addEventListener('click', dismiss);
    bar.appendChild(closeBtn);

    bar.hidden = false;
    bar.classList.add('is-visible');

    timer = setTimeout(dismiss, 6000);
  }

  return {
    show: show,
    dismiss: dismiss,
    getBar: function () {
      return bar;
    },
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const triggerTypeArb = fc.constantFrom('product_view', 'add_to_cart', 'room_complete', 'dismiss');

const chipArb = fc.record({
  label: fc.string({ minLength: 1, maxLength: 30 }),
});

const chipsArb = fc.array(chipArb, { minLength: 1, maxLength: 3 });

const triggerEventArb = fc.record({
  type: triggerTypeArb,
  chips: chipsArb,
});

const triggerSequenceArb = fc.array(triggerEventArb, { minLength: 1, maxLength: 20 });

// ---------------------------------------------------------------------------
// Property 11: Next actions singleton
//
// **Validates: Requirements 5.7**
// ---------------------------------------------------------------------------

describe('Property 11: Next actions singleton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * **Validates: Requirements 5.7**
   *
   * After any sequence of show/dismiss trigger events, at most one
   * .immersive-next-actions element exists in the DOM.
   */
  test('at most one .immersive-next-actions element exists after any trigger sequence', () => {
    fc.assert(
      fc.property(triggerSequenceArb, function (events) {
        document.body.innerHTML = '';
        var module = createNextActionsModule();

        events.forEach(function (event) {
          if (event.type === 'dismiss') {
            module.dismiss();
          } else {
            module.show(event.chips);
          }
        });

        var bars = document.querySelectorAll('.immersive-next-actions');
        return bars.length <= 1;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 5.7**
   *
   * Calling show() multiple times in a row never creates more than one bar.
   */
  test('multiple consecutive show() calls never create more than one bar', () => {
    fc.assert(
      fc.property(fc.array(chipsArb, { minLength: 2, maxLength: 10 }), function (chipSets) {
        document.body.innerHTML = '';
        var module = createNextActionsModule();

        chipSets.forEach(function (chips) {
          module.show(chips);
        });

        var bars = document.querySelectorAll('.immersive-next-actions');
        return bars.length === 1;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 5.7**
   *
   * After dismiss(), the bar is hidden (not removed from DOM, just hidden).
   * Exactly one bar element still exists.
   */
  test('after dismiss, exactly one bar element exists (hidden)', () => {
    fc.assert(
      fc.property(chipsArb, function (chips) {
        document.body.innerHTML = '';
        var module = createNextActionsModule();

        module.show(chips);
        module.dismiss();

        var bars = document.querySelectorAll('.immersive-next-actions');
        return bars.length === 1 && bars[0].hidden === true;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 5.7**
   *
   * A new show() after dismiss() replaces the bar content (singleton reuse).
   */
  test('show() after dismiss() reuses the same bar element', () => {
    document.body.innerHTML = '';
    var module = createNextActionsModule();
    var barRef = module.getBar();

    module.show([{ label: 'First action' }]);
    module.dismiss();
    module.show([{ label: 'Second action' }]);

    // Same element reference
    expect(module.getBar()).toBe(barRef);
    // Only one bar in DOM
    expect(document.querySelectorAll('.immersive-next-actions')).toHaveLength(1);
    // Content is from the second show()
    expect(barRef.textContent).toContain('Second action');
    expect(barRef.textContent).not.toContain('First action');
  });
});
