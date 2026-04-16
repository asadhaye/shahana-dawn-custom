/**
 * Unit Tests: ImmersiveNextActions
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify 6s auto-dismiss, manual close, chip labels per trigger type,
 * and prefers-reduced-motion instant show/hide.
 *
 * Requirements: 5.5, 5.6, 5.8
 */

'use strict';

// ---------------------------------------------------------------------------
// Next actions module — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function createNextActionsModule(reduceMotion) {
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

    var inner = document.createElement('div');
    inner.className = 'immersive-next-actions__inner';

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'immersive-next-actions__chip immersive-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', function () {
        dismiss();
        if (typeof chip.action === 'function') chip.action();
      });
      inner.appendChild(btn);
    });

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'immersive-next-actions__close';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.addEventListener('click', dismiss);
    inner.appendChild(closeBtn);

    bar.appendChild(inner);
    bar.hidden = false;

    if (!reduceMotion) {
      bar.classList.add('is-visible');
    }
    // With reduceMotion: bar is shown (hidden=false) but no animation class

    timer = setTimeout(dismiss, 6000);
  }

  function showAfterProductView(product) {
    if (!product) return;
    show([
      { label: 'Continue exploring ' + (product.roomLabel || 'the store') },
      { label: 'See more from ' + (product.vendor || 'this designer') },
    ]);
  }

  function showAfterAddToCart(product) {
    if (!product) return;
    show([{ label: 'Complete the look' }, { label: 'View cart' }]);
  }

  function showAfterRoomComplete(roomKey) {
    show([{ label: "Discover what's next" }]);
  }

  return {
    show: show,
    dismiss: dismiss,
    showAfterProductView: showAfterProductView,
    showAfterAddToCart: showAfterAddToCart,
    showAfterRoomComplete: showAfterRoomComplete,
    getBar: function () {
      return bar;
    },
    getTimer: function () {
      return timer;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests: 6s auto-dismiss (Requirement 5.5)
// ---------------------------------------------------------------------------

describe('ImmersiveNextActions — 6s auto-dismiss', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('bar is visible immediately after show()', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);
    expect(module.getBar().hidden).toBe(false);
  });

  test('bar is hidden after 6000ms', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    jest.advanceTimersByTime(6000);
    expect(module.getBar().hidden).toBe(true);
  });

  test('bar is still visible at 5999ms', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    jest.advanceTimersByTime(5999);
    expect(module.getBar().hidden).toBe(false);
  });

  test('calling show() again resets the 6s timer', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'First' }]);

    jest.advanceTimersByTime(4000);
    module.show([{ label: 'Second' }]); // resets timer

    jest.advanceTimersByTime(4000); // 4s after second show — should still be visible
    expect(module.getBar().hidden).toBe(false);

    jest.advanceTimersByTime(2001); // now 6s after second show — should be hidden
    expect(module.getBar().hidden).toBe(true);
  });

  test('bar content is cleared after auto-dismiss', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    jest.advanceTimersByTime(6000);
    expect(module.getBar().innerHTML).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Tests: Manual close (Requirement 5.6)
// ---------------------------------------------------------------------------

describe('ImmersiveNextActions — manual close button', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('close button dismisses the bar immediately', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    var closeBtn = module.getBar().querySelector('.immersive-next-actions__close');
    expect(closeBtn).not.toBeNull();
    closeBtn.click();

    expect(module.getBar().hidden).toBe(true);
  });

  test('close button clears bar content', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    var closeBtn = module.getBar().querySelector('.immersive-next-actions__close');
    closeBtn.click();

    expect(module.getBar().innerHTML).toBe('');
  });

  test('close button cancels the auto-dismiss timer', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    var closeBtn = module.getBar().querySelector('.immersive-next-actions__close');
    closeBtn.click();

    // Advance past 6s — bar should remain hidden (timer was cancelled)
    jest.advanceTimersByTime(6000);
    expect(module.getBar().hidden).toBe(true);
  });

  test('close button has aria-label="Dismiss"', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test action' }]);

    var closeBtn = module.getBar().querySelector('.immersive-next-actions__close');
    expect(closeBtn.getAttribute('aria-label')).toBe('Dismiss');
  });
});

// ---------------------------------------------------------------------------
// Tests: Chip labels per trigger type (Requirements 5.1, 5.2, 5.3)
// ---------------------------------------------------------------------------

describe('ImmersiveNextActions — chip labels per trigger type', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('showAfterProductView shows "Continue exploring" and "See more from" chips', () => {
    var module = createNextActionsModule(false);
    module.showAfterProductView({ roomLabel: 'Lounge', vendor: 'Suffuse', roomKey: 'lounge' });

    var chips = module.getBar().querySelectorAll('.immersive-next-actions__chip');
    var labels = Array.from(chips).map(function (c) {
      return c.textContent;
    });

    expect(
      labels.some(function (l) {
        return l.indexOf('Continue exploring') !== -1;
      }),
    ).toBe(true);
    expect(
      labels.some(function (l) {
        return l.indexOf('See more from') !== -1;
      }),
    ).toBe(true);
  });

  test('showAfterProductView interpolates room label', () => {
    var module = createNextActionsModule(false);
    module.showAfterProductView({ roomLabel: 'Designer Houses', vendor: 'Soraya' });

    var barText = module.getBar().textContent;
    expect(barText).toContain('Designer Houses');
  });

  test('showAfterProductView interpolates vendor name', () => {
    var module = createNextActionsModule(false);
    module.showAfterProductView({ roomLabel: 'Lounge', vendor: 'Suffuse' });

    var barText = module.getBar().textContent;
    expect(barText).toContain('Suffuse');
  });

  test('showAfterAddToCart shows "Complete the look" and "View cart" chips', () => {
    var module = createNextActionsModule(false);
    module.showAfterAddToCart({ handle: 'silk-saree', vendor: 'Suffuse' });

    var chips = module.getBar().querySelectorAll('.immersive-next-actions__chip');
    var labels = Array.from(chips).map(function (c) {
      return c.textContent;
    });

    expect(labels).toContain('Complete the look');
    expect(labels).toContain('View cart');
  });

  test('showAfterRoomComplete shows "Discover what\'s next" chip', () => {
    var module = createNextActionsModule(false);
    module.showAfterRoomComplete('lounge');

    var chips = module.getBar().querySelectorAll('.immersive-next-actions__chip');
    var labels = Array.from(chips).map(function (c) {
      return c.textContent;
    });

    expect(
      labels.some(function (l) {
        return l.indexOf("Discover what's next") !== -1;
      }),
    ).toBe(true);
  });

  test('showAfterProductView with null product does nothing', () => {
    var module = createNextActionsModule(false);
    module.showAfterProductView(null);
    expect(module.getBar().hidden).toBe(true);
  });

  test('showAfterAddToCart with null product does nothing', () => {
    var module = createNextActionsModule(false);
    module.showAfterAddToCart(null);
    expect(module.getBar().hidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: prefers-reduced-motion instant show/hide (Requirement 5.8)
// ---------------------------------------------------------------------------

describe('ImmersiveNextActions — prefers-reduced-motion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('with reduceMotion=false, is-visible class is added on show', () => {
    var module = createNextActionsModule(false);
    module.show([{ label: 'Test' }]);
    expect(module.getBar().classList.contains('is-visible')).toBe(true);
  });

  test('with reduceMotion=true, is-visible class is NOT added on show', () => {
    var module = createNextActionsModule(true);
    module.show([{ label: 'Test' }]);
    expect(module.getBar().classList.contains('is-visible')).toBe(false);
  });

  test('with reduceMotion=true, bar is still shown (hidden=false)', () => {
    var module = createNextActionsModule(true);
    module.show([{ label: 'Test' }]);
    expect(module.getBar().hidden).toBe(false);
  });

  test('with reduceMotion=true, dismiss still hides the bar', () => {
    var module = createNextActionsModule(true);
    module.show([{ label: 'Test' }]);
    module.dismiss();
    expect(module.getBar().hidden).toBe(true);
  });

  test('with reduceMotion=true, is-visible class is removed on dismiss', () => {
    var module = createNextActionsModule(true);
    module.show([{ label: 'Test' }]);
    module.dismiss();
    expect(module.getBar().classList.contains('is-visible')).toBe(false);
  });
});
