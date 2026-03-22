/**
 * Unit Tests for setupBuyNowForm handler
 *
 * Feature: immersive-store-glass-panel-improvements
 * Validates: Requirements 4.1
 *
 * Since immersive-store.js is a browser script with no module exports,
 * the relevant functions are reproduced here verbatim from
 * dawn/assets/immersive-store.js for isolated unit testing.
 */

'use strict';

// ---------------------------------------------------------------------------
// showCartFeedback — reproduced from dawn/assets/immersive-store.js
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
// showErrorFeedback — reproduced from dawn/assets/immersive-store.js
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
// setupBuyNowForm — reproduced from dawn/assets/immersive-store.js
// ---------------------------------------------------------------------------

function setupBuyNowForm(panel) {
  var forms = panel.querySelectorAll('form[data-product-form], .glass-product-section__form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var variantInput = form.querySelector(
        '.immersive-variant-input, .glass-product-section__variant-input, input[name="id"]'
      );
      if (!variantInput || !variantInput.value) {
        showErrorFeedback(panel, 'Please select a size');
        return;
      }

      var formData = new FormData(form);

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (error) {
              throw new Error(error.description || 'Unable to add to cart');
            });
          }
          return response.json();
        })
        .then(function (data) {
          showCartFeedback(panel);
          setTimeout(function () {
            window.location.href = '/checkout';
          }, 500);
        })
        .catch(function (error) {
          console.error('Error adding to cart:', error);
          showErrorFeedback(panel, error.message || 'Unable to add product to cart. Please try again.');
        });
    });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal panel with a product form.
 *
 * @param {string} [variantValue] - value for the hidden variant input ('', or a variant id)
 * @returns {{ panel: HTMLElement, form: HTMLElement, variantInput: HTMLElement }}
 */
function createPanelWithForm(variantValue) {
  var panel = document.createElement('div');

  var form = document.createElement('form');
  form.setAttribute('data-product-form', '');

  var variantInput = document.createElement('input');
  variantInput.type = 'hidden';
  variantInput.name = 'id';
  variantInput.className = 'immersive-variant-input';
  variantInput.value = variantValue !== undefined ? variantValue : '';

  form.appendChild(variantInput);
  panel.appendChild(form);

  return { panel: panel, form: form, variantInput: variantInput };
}

/**
 * Fires a submit event on the given form and returns the event object
 * so callers can inspect whether preventDefault was called.
 */
function submitForm(form) {
  var event = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

// ---------------------------------------------------------------------------
// Tests: form submission calls event.preventDefault()
// ---------------------------------------------------------------------------

describe('setupBuyNowForm — prevents default form submission (Requirement 4.1)', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 123 }),
    });
  });

  afterEach(() => {
    delete global.fetch;
    // Clean up any feedback elements appended to body
    document.body.innerHTML = '';
  });

  test('submit event has preventDefault called', () => {
    var { panel, form, variantInput } = createPanelWithForm('12345');
    setupBuyNowForm(panel);

    var event = new Event('submit', { bubbles: true, cancelable: true });
    var preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    form.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: validation error when no variant selected
// ---------------------------------------------------------------------------

describe('setupBuyNowForm — validation error when no variant selected (Requirement 4.1)', () => {
  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  test('shows error feedback when variant input is empty', () => {
    var { panel, form } = createPanelWithForm(''); // empty value = no selection
    setupBuyNowForm(panel);

    submitForm(form);

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Please select a size');
  });

  test('does NOT call fetch when variant input is empty', () => {
    var fetchSpy = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = fetchSpy;

    var { panel, form } = createPanelWithForm('');
    setupBuyNowForm(panel);

    submitForm(form);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('shows error feedback when there is no variant input element at all', () => {
    var panel = document.createElement('div');
    var form = document.createElement('form');
    form.setAttribute('data-product-form', '');
    // No hidden input added
    panel.appendChild(form);

    setupBuyNowForm(panel);
    submitForm(form);

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Please select a size');
  });
});

// ---------------------------------------------------------------------------
// Tests: successful cart addition triggers redirect
// ---------------------------------------------------------------------------

/** Flush all pending microtasks (promise callbacks). */
function flushPromises() {
  // Chain enough microtask ticks to drain the fetch promise chain
  return Promise.resolve()
    .then(function () { return Promise.resolve(); })
    .then(function () { return Promise.resolve(); })
    .then(function () { return Promise.resolve(); });
}

describe('setupBuyNowForm — successful cart addition redirects to /checkout (Requirement 4.1)', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  test('redirects to /checkout after successful fetch', async () => {
    jest.useFakeTimers();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 42 }),
    });

    var { panel, form } = createPanelWithForm('99999');
    setupBuyNowForm(panel);

    submitForm(form);

    // Flush all microtasks so the .then() callbacks run
    await flushPromises();

    // Advance past the 500ms redirect timeout
    jest.advanceTimersByTime(500);

    jest.useRealTimers();

    expect(window.location.href).toBe('/checkout');
  });

  test('shows cart feedback before redirecting', async () => {
    jest.useFakeTimers();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 42 }),
    });

    var { panel, form } = createPanelWithForm('99999');
    setupBuyNowForm(panel);

    submitForm(form);

    await flushPromises();

    jest.useRealTimers();

    var feedbackEl = document.querySelector('.immersive-cart-feedback');
    expect(feedbackEl).not.toBeNull();
    expect(feedbackEl.textContent).toBe('Added to cart!');
  });
});

// ---------------------------------------------------------------------------
// Tests: error handling displays error message
// ---------------------------------------------------------------------------

describe('setupBuyNowForm — error handling displays error message (Requirement 4.1)', () => {
  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  test('shows error feedback on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    var { panel, form } = createPanelWithForm('12345');
    setupBuyNowForm(panel);

    submitForm(form);

    await flushPromises();

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Network error');
  });

  test('shows error feedback when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ description: 'This variant is sold out' }),
    });

    var { panel, form } = createPanelWithForm('12345');
    setupBuyNowForm(panel);

    submitForm(form);

    await flushPromises();

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('This variant is sold out');
  });

  test('shows fallback error message when error has no message', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error(''));

    var { panel, form } = createPanelWithForm('12345');
    setupBuyNowForm(panel);

    submitForm(form);

    await flushPromises();

    var errorEl = document.querySelector('.immersive-error-feedback');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Unable to add product to cart. Please try again.');
  });
});
