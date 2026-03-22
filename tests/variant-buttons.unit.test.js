/**
 * Unit Tests for setupVariantButtons click handler
 *
 * Feature: immersive-store-glass-panel-improvements
 * Validates: Requirements 3.1, 3.4
 *
 * Since immersive-store.js is a browser script with no module exports,
 * the setupVariantButtons function logic is reproduced here verbatim
 * from dawn/assets/immersive-store.js for isolated unit testing.
 */

'use strict';

// ---------------------------------------------------------------------------
// setupVariantButtons — reproduced from dawn/assets/immersive-store.js
// ---------------------------------------------------------------------------

function setupVariantButtons(panel) {
  var buttons = panel.querySelectorAll('.immersive-variant-button, .glass-product-section__variant-button');
  var hiddenInput = panel.querySelector('.immersive-variant-input, .glass-product-section__variant-input');

  if (buttons.length === 0) return;

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      if (button.disabled) return;

      // Remove active state from all buttons
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
      });

      // Add active state to clicked button
      button.classList.add('active');

      // Update hidden input
      var variantId = button.getAttribute('data-variant-id');
      if (hiddenInput && variantId) {
        hiddenInput.value = variantId;
      }
    });

    // Add keyboard navigation
    button.addEventListener('keydown', function (event) {
      if (button.disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        var nextIndex = index + 1;
        while (nextIndex < buttons.length) {
          if (!buttons[nextIndex].disabled) {
            buttons[nextIndex].focus();
            break;
          }
          nextIndex++;
        }
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        var prevIndex = index - 1;
        while (prevIndex >= 0) {
          if (!buttons[prevIndex].disabled) {
            buttons[prevIndex].focus();
            break;
          }
          prevIndex--;
        }
      }
    });
  });

  // Set first available variant as active
  var firstAvailable = panel.querySelector(
    '.immersive-variant-button:not([disabled]), .glass-product-section__variant-button:not([disabled])'
  );
  if (firstAvailable) {
    firstAvailable.click();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a mock panel element with variant buttons and a hidden input.
 *
 * @param {Array<{id: string, available: boolean}>} variants
 * @param {string} [initialValue] - initial value for the hidden input
 * @returns {HTMLElement}
 */
function createMockPanel(variants, initialValue) {
  var panel = document.createElement('div');

  var container = document.createElement('div');
  container.className = 'immersive-variant-buttons';
  container.setAttribute('role', 'radiogroup');

  variants.forEach(function (v) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'immersive-variant-button';
    btn.setAttribute('data-variant-id', v.id);
    btn.textContent = v.id;
    if (!v.available) {
      btn.disabled = true;
    }
    container.appendChild(btn);
  });

  var hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'id';
  hiddenInput.className = 'immersive-variant-input';
  hiddenInput.value = initialValue || '';

  panel.appendChild(container);
  panel.appendChild(hiddenInput);
  return panel;
}

// ---------------------------------------------------------------------------
// Tests: Requirement 3.1 — clicking variant button updates hidden input
// ---------------------------------------------------------------------------

describe('Variant button click — updates hidden input (Requirement 3.1)', () => {
  test('clicking a variant button sets the hidden input value to that variant id', () => {
    var panel = createMockPanel([
      { id: '12345', available: true },
      { id: '67890', available: true },
    ]);

    setupVariantButtons(panel);

    // Click the second button (first was auto-selected on setup)
    var buttons = panel.querySelectorAll('.immersive-variant-button');
    buttons[1].click();

    var hiddenInput = panel.querySelector('.immersive-variant-input');
    expect(hiddenInput.value).toBe('67890');
  });

  test('clicking the first button sets the hidden input to the first variant id', () => {
    var panel = createMockPanel([
      { id: 'AAA', available: true },
      { id: 'BBB', available: true },
      { id: 'CCC', available: true },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');
    buttons[0].click();

    var hiddenInput = panel.querySelector('.immersive-variant-input');
    expect(hiddenInput.value).toBe('AAA');
  });

  test('auto-selects first available variant on setup', () => {
    var panel = createMockPanel([
      { id: '111', available: true },
      { id: '222', available: true },
    ]);

    setupVariantButtons(panel);

    var hiddenInput = panel.querySelector('.immersive-variant-input');
    expect(hiddenInput.value).toBe('111');
  });

  test('auto-selects first AVAILABLE variant when first variant is disabled', () => {
    var panel = createMockPanel([
      { id: 'DISABLED', available: false },
      { id: 'AVAILABLE', available: true },
    ]);

    setupVariantButtons(panel);

    var hiddenInput = panel.querySelector('.immersive-variant-input');
    expect(hiddenInput.value).toBe('AVAILABLE');
  });
});

// ---------------------------------------------------------------------------
// Tests: Requirement 3.4 — disabled variant button does not update selection
// ---------------------------------------------------------------------------

describe('Disabled variant button — does not update selection (Requirement 3.4)', () => {
  test('clicking a disabled button does not change the hidden input value', () => {
    var panel = createMockPanel([
      { id: '111', available: true },
      { id: '999', available: false },
    ]);

    setupVariantButtons(panel);

    // After setup, first available ('111') is selected
    var hiddenInput = panel.querySelector('.immersive-variant-input');
    expect(hiddenInput.value).toBe('111');

    // Click the disabled button
    var buttons = panel.querySelectorAll('.immersive-variant-button');
    var disabledBtn = buttons[1];
    disabledBtn.click();

    // Value must remain unchanged
    expect(hiddenInput.value).toBe('111');
  });

  test('clicking a disabled button does not add active class to it', () => {
    var panel = createMockPanel([
      { id: 'A', available: true },
      { id: 'B', available: false },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');
    var disabledBtn = buttons[1];
    disabledBtn.click();

    expect(disabledBtn.classList.contains('active')).toBe(false);
  });

  test('all-disabled panel leaves hidden input unchanged', () => {
    var panel = createMockPanel([
      { id: 'X', available: false },
      { id: 'Y', available: false },
    ]);
    var hiddenInput = panel.querySelector('.immersive-variant-input');
    hiddenInput.value = 'original';

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');
    buttons[0].click();
    buttons[1].click();

    expect(hiddenInput.value).toBe('original');
  });
});

// ---------------------------------------------------------------------------
// Tests: Requirement 3.4 — active class is applied correctly
// ---------------------------------------------------------------------------

describe('Active class management (Requirement 3.4)', () => {
  test('clicking a button adds the active class to it', () => {
    var panel = createMockPanel([
      { id: '1', available: true },
      { id: '2', available: true },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');
    buttons[1].click();

    expect(buttons[1].classList.contains('active')).toBe(true);
  });

  test('clicking a button removes active class from all other buttons', () => {
    var panel = createMockPanel([
      { id: '1', available: true },
      { id: '2', available: true },
      { id: '3', available: true },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');

    // Click second button
    buttons[1].click();
    expect(buttons[0].classList.contains('active')).toBe(false);
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(buttons[2].classList.contains('active')).toBe(false);
  });

  test('only one button is active at a time after multiple clicks', () => {
    var panel = createMockPanel([
      { id: 'S', available: true },
      { id: 'M', available: true },
      { id: 'L', available: true },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');

    buttons[0].click();
    buttons[2].click();
    buttons[1].click();

    var activeButtons = Array.from(buttons).filter(function (b) {
      return b.classList.contains('active');
    });

    expect(activeButtons.length).toBe(1);
    expect(activeButtons[0]).toBe(buttons[1]);
  });

  test('first available button gets active class on setup', () => {
    var panel = createMockPanel([
      { id: 'first', available: true },
      { id: 'second', available: true },
    ]);

    setupVariantButtons(panel);

    var buttons = panel.querySelectorAll('.immersive-variant-button');
    expect(buttons[0].classList.contains('active')).toBe(true);
    expect(buttons[1].classList.contains('active')).toBe(false);
  });

  test('panel with no buttons does not throw', () => {
    var panel = document.createElement('div');
    expect(() => setupVariantButtons(panel)).not.toThrow();
  });
});
