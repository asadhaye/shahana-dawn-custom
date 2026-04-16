/**
 * Property-Based Test: Quick Add Modal Singleton
 *
 * Feature: immersive-ux-enhancements
 * Property 8: Quick Add modal singleton
 *
 * **Validates: Requirements 7.9**
 *
 * For any sequence of openQuickAdd() calls, at most one quick-add modal
 * element SHALL exist in the DOM at any point in time — opening a second
 * modal SHALL reuse or replace the existing one.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Quick Add modal singleton model
//
// Reproduced from assets/immersive-store.js renderQuickAddModal():
//   - Singleton enforced by removing existing modal before creating new one
//   - _quickAddModal tracks the current modal reference
//   - closeQuickAdd() removes the modal from DOM and nulls the reference
// ---------------------------------------------------------------------------

function createQuickAddModule() {
  var _modal = null;

  function openModal(productData) {
    // Singleton: remove existing modal before creating new one
    if (_modal) {
      _modal.remove();
      _modal = null;
    }

    var modal = document.createElement('div');
    modal.className = 'immersive-quick-add-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'quick-add-modal-title');

    var title = document.createElement('h3');
    title.id = 'quick-add-modal-title';
    title.textContent = productData.title || 'Product';
    modal.appendChild(title);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'immersive-quick-add-modal__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', closeModal);
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);
    _modal = modal;
    return modal;
  }

  function closeModal() {
    if (_modal) {
      _modal.remove();
      _modal = null;
    }
  }

  return {
    openModal: openModal,
    closeModal: closeModal,
    getModal: function () {
      return _modal;
    },
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const productDataArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 40 }),
  handle: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
});

const openCloseEventArb = fc.record({
  type: fc.constantFrom('open', 'close'),
  product: productDataArb,
});

const eventSequenceArb = fc.array(openCloseEventArb, { minLength: 1, maxLength: 20 });

// ---------------------------------------------------------------------------
// Property 8: Quick Add modal singleton
//
// **Validates: Requirements 7.9**
// ---------------------------------------------------------------------------

describe('Property 8: Quick Add modal singleton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * **Validates: Requirements 7.9**
   *
   * After any sequence of open/close events, at most one
   * .immersive-quick-add-modal element exists in the DOM.
   */
  test('at most one quick-add modal exists in DOM after any open/close sequence', () => {
    fc.assert(
      fc.property(eventSequenceArb, function (events) {
        document.body.innerHTML = '';
        var module = createQuickAddModule();

        events.forEach(function (event) {
          if (event.type === 'open') {
            module.openModal(event.product);
          } else {
            module.closeModal();
          }
        });

        var modals = document.querySelectorAll('.immersive-quick-add-modal');
        return modals.length <= 1;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 7.9**
   *
   * Multiple consecutive openModal() calls never create more than one modal.
   */
  test('multiple consecutive openModal() calls never create more than one modal', () => {
    fc.assert(
      fc.property(fc.array(productDataArb, { minLength: 2, maxLength: 10 }), function (products) {
        document.body.innerHTML = '';
        var module = createQuickAddModule();

        products.forEach(function (product) {
          module.openModal(product);
        });

        var modals = document.querySelectorAll('.immersive-quick-add-modal');
        return modals.length === 1;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 7.9**
   *
   * After closeModal(), no modal exists in the DOM.
   */
  test('after closeModal(), no modal exists in DOM', () => {
    fc.assert(
      fc.property(productDataArb, function (product) {
        document.body.innerHTML = '';
        var module = createQuickAddModule();

        module.openModal(product);
        module.closeModal();

        var modals = document.querySelectorAll('.immersive-quick-add-modal');
        return modals.length === 0;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 7.9**
   *
   * Opening a second modal replaces the first — the second modal's title
   * is shown, not the first's.
   */
  test('opening a second modal replaces the first modal content', () => {
    document.body.innerHTML = '';
    var module = createQuickAddModule();

    module.openModal({ title: 'First Product', handle: 'first-product' });
    module.openModal({ title: 'Second Product', handle: 'second-product' });

    var modals = document.querySelectorAll('.immersive-quick-add-modal');
    expect(modals).toHaveLength(1);
    expect(modals[0].textContent).toContain('Second Product');
    expect(modals[0].textContent).not.toContain('First Product');
  });
});
