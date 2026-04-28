/**
 * Feature: quick-add
 * TODO: Extract from immersive-store.js
 */

function initImmersiveQuickAdd() {
  // Event delegation on document for all [data-quick-add] buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var handle = btn.getAttribute('data-product-handle');
    if (handle) openQuickAdd(handle, btn);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _quickAddModal && !_quickAddModal.hidden) {
      closeQuickAdd();
    }
  });
}

function openQuickAdd(handle, triggerEl) {
  _quickAddTrigger = triggerEl || null;
  var cacheKey = 'quickadd_' + handle;
  var loadProductUrl = '/products/' + handle + '.js';

  // Use contentCache if available
  var cached = contentCache && contentCache[cacheKey];
  if (cached) {
    renderQuickAddModal(cached, triggerEl);
    return;
  }

  fetch(loadProductUrl, {
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Product fetch failed');
      return res.json();
    })
    .then(function (product) {
      if (contentCache) contentCache[cacheKey] = product;
      renderQuickAddModal(product, triggerEl);
    })
    .catch(function () {
      var glassPanel = document.getElementById('glass-panel');
      var errorMsg =
        (glassPanel && glassPanel.getAttribute('data-msg-load-product-error')) || 'Unable to load product.';
      showFeedback(errorMsg, 'error');
    });
}

function renderQuickAddModal(product, triggerEl) {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Singleton — remove existing modal
  if (_quickAddModal) _quickAddModal.remove();

  var modal = document.createElement('div');
  modal.className = 'immersive-quick-add-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'quick-add-modal-title');
  if (reduceMotion) modal.classList.add('no-animation');

  var inner = document.createElement('div');
  inner.className = 'immersive-quick-add-modal__inner';

  // Header
  var header = document.createElement('div');
  header.className = 'immersive-quick-add-modal__header';
  var title = document.createElement('h3');
  title.id = 'quick-add-modal-title';
  title.className = 'immersive-quick-add-modal__title';
  title.textContent = product.title;
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-quick-add-modal__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML =
    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', closeQuickAdd);
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Price
  var price = document.createElement('div');
  price.className = 'immersive-quick-add-modal__price';
  price.setAttribute('data-quick-add-price', '');
  var firstVariant = product.variants && product.variants[0];
  price.textContent = firstVariant ? formatMoney(firstVariant.price) : '';

  // Variants (if more than one)
  var selectedVariantId = firstVariant ? firstVariant.id : null;
  var variantGroup = null;

  if (product.variants && product.variants.length > 1) {
    variantGroup = document.createElement('div');
    variantGroup.className = 'immersive-quick-add-modal__variants';
    variantGroup.setAttribute('role', 'radiogroup');
    variantGroup.setAttribute('aria-label', 'Select size');

    product.variants.forEach(function (variant, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'immersive-quick-add-modal__variant';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      btn.setAttribute('data-variant-id', variant.id);
      btn.setAttribute('data-variant-price', variant.price);
      btn.textContent = variant.title;
      if (!variant.available) {
        btn.disabled = true;
        btn.classList.add('is-unavailable');
      }
      if (i === 0) btn.classList.add('is-selected');

      btn.addEventListener('click', function () {
        if (!variant.available) return;
        selectedVariantId = variant.id;
        // Update aria-checked
        variantGroup.querySelectorAll('[role="radio"]').forEach(function (b) {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('is-selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('is-selected');
        // Update price
        var priceEl = modal.querySelector('[data-quick-add-price]');
        if (priceEl) priceEl.textContent = formatMoney(variant.price);
        // Update CTA
        var cta = modal.querySelector('[data-quick-add-cta]');
        if (cta) {
          cta.disabled = false;
          var glassPanel = document.getElementById('glass-panel');
          cta.textContent = (glassPanel && glassPanel.getAttribute('data-msg-add-to-cart')) || 'Add to cart';
        }
      });

      variantGroup.appendChild(btn);
    });
  }

  // Read localised strings from glass panel data attributes
  var _glassPanel = document.getElementById('glass-panel');
  var _msgAddToCart = (_glassPanel && _glassPanel.getAttribute('data-msg-add-to-cart')) || 'Add to cart';
  var _msgSoldOut = (_glassPanel && _glassPanel.getAttribute('data-msg-sold-out')) || 'Sold out';
  var _msgAdding = (_glassPanel && _glassPanel.getAttribute('data-msg-adding')) || 'Adding\u2026';

  // CTA
  var cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'immersive-quick-add-modal__cta';
  cta.setAttribute('data-quick-add-cta', '');
  var firstAvailable =
    product.variants &&
    product.variants.find(function (v) {
      return v.available;
    });
  if (!firstAvailable) {
    cta.disabled = true;
    cta.textContent = _msgSoldOut;
  } else {
    cta.textContent = _msgAddToCart;
    selectedVariantId = firstAvailable.id;
  }

  cta.addEventListener('click', function () {
    if (!selectedVariantId) return;
    cta.disabled = true;
    cta.textContent = _msgAdding;
    addToCartQuickAdd(selectedVariantId, 1, product, cta);
  });

  inner.appendChild(header);
  inner.appendChild(price);
  if (variantGroup) inner.appendChild(variantGroup);
  inner.appendChild(cta);
  modal.appendChild(inner);
  document.body.appendChild(modal);
  _quickAddModal = modal;

  // Focus trap
  requestAnimationFrame(function () {
    closeBtn.focus();
  });

  // Trap Tab/Shift+Tab
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = modal.querySelectorAll('button:not(:disabled), [tabindex="0"]');
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function addToCartQuickAdd(variantId, quantity, product, ctaBtn) {
  var glassPanel = document.getElementById('glass-panel');
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify({ id: parseInt(variantId, 10), quantity: quantity || 1 }),
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Cart add failed');
      return res.json();
    })
    .then(function () {
      closeQuickAdd();
      var successMsg = (glassPanel && glassPanel.getAttribute('data-msg-added-to-cart')) || 'Added to cart!';
      showFeedback(successMsg, 'success');
      // Update cart badge
      fetch('/cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json();
        })
        .then(function (cart) {
          var badge = document.querySelector('[data-cart-count]');
          if (badge) badge.textContent = cart.item_count;
          if (typeof window.updateBottomNavBadges === 'function') {
            window.updateBottomNavBadges(null, cart.item_count);
          }
        })
        .catch(function () {});
      // Show next actions
      if (typeof showAfterAddToCart === 'function') {
        showAfterAddToCart({ handle: product.handle, vendor: product.vendor });
      }
    })
    .catch(function () {
      if (ctaBtn) {
        ctaBtn.disabled = false;
        ctaBtn.textContent = (glassPanel && glassPanel.getAttribute('data-msg-add-to-cart')) || 'Add to cart';
      }
      var errorMsg = (glassPanel && glassPanel.getAttribute('data-msg-error-add-to-cart')) || 'Unable to add to cart.';
      showFeedback(errorMsg, 'error');
    });
}

function closeQuickAdd() {
  if (_quickAddModal) {
    _quickAddModal.remove();
    _quickAddModal = null;
  }
  if (_quickAddTrigger) {
    try {
      _quickAddTrigger.focus();
    } catch (e) {}
    _quickAddTrigger = null;
  }
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Quick Add Public API
 *
 * Provides functions for managing quick add functionality in the immersive store.
 * Quick add allows users to add products to cart without opening the full product panel.
 *
 * Private helper functions (renderQuickAddModal, addToCartQuickAdd, closeQuickAdd)
 * remain locally scoped as internal implementation details.
 *
 * @namespace ImmersiveQuickAdd
 */
if (typeof window !== 'undefined') {
  window.ImmersiveQuickAdd = {
    initImmersiveQuickAdd: initImmersiveQuickAdd,
    openQuickAdd: openQuickAdd,
  };

  // Backward-compatible global aliases
  window.initImmersiveQuickAdd = initImmersiveQuickAdd;
  window.openQuickAdd = openQuickAdd;
}
