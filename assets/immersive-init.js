/**
 * Immersive Init — coordination layer for the 3D store.
 *
 * Loads after immersive-core.js and immersive-features.js.
 * Contains:
 *   - Init wrappers that call existing modular functions
 *   - Entirely missing features ported from legacy (search, gestures, quick-add, etc.)
 *   - Full FAB (replaces simplified version in immersive-core.js)
 *   - safeBindImmersiveInit() + Shopify theme editor re-init handlers
 */

// ---------------------------------------------------------------------------
// State Variables
// ---------------------------------------------------------------------------

var _immersiveInitBound = false;
var _searchActiveIndex = -1;
var _searchResults = [];
var _searchDebounceTimer = null;
var _searchAbortController = null;
var _gestureLastRoomTransition = 0;
var _gestureCooldown = 600;
var SWIPE_ROOM_SEQUENCE = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];
var _nextActionsBar = null;
var _nextActionsTimer = null;
var _quickAddModal = null;
var _quickAddTrigger = null;
var _hotspotElements = [];
var _focusedHotspotIndex = -1;
var _esrCooldown = false;
var _esrWheelBound = false;
var _pctRafPending = false;
var _pctActiveCard = null;
var _pctPendingNormX = 0;
var _pctPendingNormY = 0;
var parallaxStrength = 0;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function getSearchResultIcon(type) {
  var icons = {
    product:
      '<path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5z"/>',
    collection:
      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    room: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  };
  var path = icons[type] || icons.product;
  return (
    '<svg class="immersive-search-result__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    path +
    '</svg>'
  );
}

function formatMoney(cents) {
  if (!cents && cents !== 0) return '';
  return 'PKR ' + (cents / 100).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function showFeedback(message, type) {
  var existing = document.querySelector('.immersive-feedback-toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'immersive-feedback-toast immersive-feedback-toast--' + (type || 'info');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);padding:0.75rem 1.5rem;border-radius:8px;font-size:0.875rem;z-index:10000;max-width:90vw;text-align:center;';
  if (type === 'error') {
    toast.style.background = 'rgba(220,38,38,0.9)';
    toast.style.color = '#fff';
  } else if (type === 'success') {
    toast.style.background = 'rgba(34,197,94,0.9)';
    toast.style.color = '#fff';
  } else {
    toast.style.background = 'rgba(15,23,42,0.9)';
    toast.style.color = '#d4af37';
  }
  document.body.appendChild(toast);
  setTimeout(function () {
    if (toast.parentNode) toast.remove();
  }, 3000);
}

function _esrEaseOutParallax(durationMs, callback) {
  var startValue = typeof parallaxStrength !== 'undefined' ? parallaxStrength : 0;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var elapsed = ts - startTime;
    var t = Math.min(elapsed / durationMs, 1);
    if (typeof parallaxStrength !== 'undefined') {
      parallaxStrength = startValue * (1 - t);
    }
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (typeof parallaxStrength !== 'undefined') parallaxStrength = 0;
      if (typeof callback === 'function') callback();
    }
  }
  requestAnimationFrame(step);
}

function _esrTrigger() {
  if (!immersiveState || immersiveState.mode !== 'showroom') return;
  var editorialRooms = ['designer_houses', 'occasions', 'featured_collections'];
  if (editorialRooms.indexOf(immersiveState.currentRoom) === -1) return;
  var panel = document.getElementById('glass-panel');
  if (panel && (panel.classList.contains('is-active') || (!panel.hidden && !panel.classList.contains('hidden'))))
    return;
  if (_esrCooldown) return;
  _esrCooldown = true;
  setTimeout(function () {
    _esrCooldown = false;
  }, 700);
  var roomKey = immersiveState.currentRoom;
  var reduceMotionESR = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionESR) {
    if (typeof enterEditorialMode === 'function') enterEditorialMode(roomKey, null);
  } else {
    _esrEaseOutParallax(300, function () {
      if (typeof enterEditorialMode === 'function') enterEditorialMode(roomKey, null);
    });
  }
}

function _esrOnWheel(event) {
  if (event.deltaY > 0) _esrTrigger();
}

function _esrOnSwipeDown(deltaX, deltaY) {
  var absDy = Math.abs(deltaY);
  var absDx = Math.abs(deltaX);
  if (absDy < 60) return;
  if (absDx > 0 && absDy / absDx <= 2.5) return;
  if (deltaY < 0) return;
  _esrTrigger();
}

function _pctOnMouseMove(event) {
  var card = event.target && event.target.closest && event.target.closest('.immersive-product-card');
  if (!card) return;
  if (document.activeElement === card || card.contains(document.activeElement)) return;
  var rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  var centerX = rect.left + rect.width / 2;
  var centerY = rect.top + rect.height / 2;
  if (typeof _pctClamp === 'function') {
    _pctPendingNormX = _pctClamp((event.clientX - centerX) / (rect.width / 2), -1, 1);
    _pctPendingNormY = _pctClamp((event.clientY - centerY) / (rect.height / 2), -1, 1);
  }
  _pctActiveCard = card;
  card.classList.remove('tilt-reset');
  if (!_pctRafPending && typeof _pctApplyTilt === 'function') {
    _pctRafPending = true;
    requestAnimationFrame(_pctApplyTilt);
  }
}

function _pctOnMouseLeave(event) {
  var card =
    (event.target && event.target.closest && event.target.closest('.immersive-product-card')) || _pctActiveCard;
  if (card) {
    card.classList.add('tilt-reset');
    card.style.transform = '';
  }
  _pctActiveCard = null;
}

// ---------------------------------------------------------------------------
// Immersive Search
// ---------------------------------------------------------------------------

function initImmersiveSearch() {
  var container = document.querySelector('[data-immersive-search]');
  if (!container) return;
  var input = container.querySelector('#immersive-search-input');
  var dropdown = container.querySelector('#immersive-search-results');
  if (!input || !dropdown) return;

  var msgNoResults = container.getAttribute('data-msg-no-results') || 'No results';
  var msgNoResultsHint = container.getAttribute('data-msg-no-results-hint') || '';
  var msgUnavailable = container.getAttribute('data-msg-unavailable') || 'Search unavailable';
  var labelProducts = container.getAttribute('data-label-products') || 'Products';
  var labelCollections = container.getAttribute('data-label-collections') || 'Collections';
  var labelRooms = container.getAttribute('data-label-rooms') || 'Rooms';

  var ROOM_LIST = [
    { roomKey: 'storefront', label: 'Storefront' },
    { roomKey: 'lounge', label: 'Lounge' },
    { roomKey: 'designer_houses', label: 'Designer Houses' },
    { roomKey: 'occasions', label: 'Occasions' },
    { roomKey: 'featured_collections', label: 'Featured Collections' },
  ];

  function focusSearch() {
    input.focus();
    input.select();
  }

  function closeDropdown() {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    _searchActiveIndex = -1;
    _searchResults = [];
  }

  function fuzzyMatchRooms(term) {
    var t = term.toLowerCase();
    return ROOM_LIST.filter(function (r) {
      return r.label.toLowerCase().indexOf(t) !== -1 || r.roomKey.indexOf(t) !== -1;
    });
  }

  function buildResultEl(item, type, index) {
    var el = document.createElement('div');
    el.className = 'immersive-search__result';
    el.setAttribute('role', 'option');
    el.setAttribute('id', 'immersive-search-result-' + index);
    el.setAttribute('aria-selected', 'false');
    var iconType = type === 'collection' ? 'collection' : 'product';
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon(iconType);
    var iconEl = iconWrapper.firstChild;
    if (iconEl) el.appendChild(iconEl);
    var info = document.createElement('div');
    info.className = 'immersive-search__result-info';
    var title = document.createElement('span');
    title.className = 'immersive-search__result-title';
    title.textContent = item.title || '';
    info.appendChild(title);
    if (item.price) {
      var meta = document.createElement('span');
      meta.className = 'immersive-search__result-meta';
      meta.textContent = item.price;
      info.appendChild(meta);
    }
    el.appendChild(info);
    el.addEventListener('click', function () {
      selectResult(index);
    });
    return el;
  }

  function buildRoomResultEl(room, index) {
    var el = document.createElement('div');
    el.className = 'immersive-search__result';
    el.setAttribute('role', 'option');
    el.setAttribute('id', 'immersive-search-result-' + index);
    el.setAttribute('aria-selected', 'false');
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon('room');
    var iconEl = iconWrapper.firstChild;
    if (iconEl) el.appendChild(iconEl);
    var info = document.createElement('div');
    info.className = 'immersive-search__result-info';
    var title = document.createElement('span');
    title.className = 'immersive-search__result-title';
    title.textContent = room.label;
    info.appendChild(title);
    var meta = document.createElement('span');
    meta.className = 'immersive-search__result-meta';
    meta.textContent = 'Room';
    info.appendChild(meta);
    el.appendChild(info);
    el.addEventListener('click', function () {
      selectResult(index);
    });
    return el;
  }

  function renderResults(apiResults, roomMatches) {
    dropdown.innerHTML = '';
    var hasContent = false;
    _searchResults = [];
    if (apiResults.products && apiResults.products.length) {
      hasContent = true;
      var groupLabel = document.createElement('span');
      groupLabel.className = 'immersive-search__group-label';
      groupLabel.textContent = labelProducts;
      dropdown.appendChild(groupLabel);
      apiResults.products.forEach(function (item) {
        _searchResults.push({ type: 'product', data: item });
        dropdown.appendChild(buildResultEl(item, 'product', _searchResults.length - 1));
      });
    }
    if (apiResults.collections && apiResults.collections.length) {
      hasContent = true;
      var groupLabel2 = document.createElement('span');
      groupLabel2.className = 'immersive-search__group-label';
      groupLabel2.textContent = labelCollections;
      dropdown.appendChild(groupLabel2);
      apiResults.collections.forEach(function (item) {
        _searchResults.push({ type: 'collection', data: item });
        dropdown.appendChild(buildResultEl(item, 'collection', _searchResults.length - 1));
      });
    }
    if (roomMatches && roomMatches.length) {
      hasContent = true;
      var groupLabel3 = document.createElement('span');
      groupLabel3.className = 'immersive-search__group-label';
      groupLabel3.textContent = labelRooms;
      dropdown.appendChild(groupLabel3);
      roomMatches.forEach(function (room) {
        _searchResults.push({ type: 'room', data: room });
        dropdown.appendChild(buildRoomResultEl(room, _searchResults.length - 1));
      });
    }
    if (!hasContent) {
      var noRes = document.createElement('div');
      noRes.className = 'immersive-search__no-results';
      noRes.textContent = msgNoResults.replace('{{term}}', input.value);
      if (msgNoResultsHint) {
        var hint = document.createElement('span');
        hint.className = 'immersive-search__no-results-hint';
        hint.textContent = msgNoResultsHint;
        noRes.appendChild(hint);
      }
      dropdown.appendChild(noRes);
    }
    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    _searchActiveIndex = -1;
  }

  function selectResult(index) {
    var item = _searchResults[index];
    if (!item) return;
    closeDropdown();
    input.value = '';
    if (item.type === 'product') {
      if (typeof openProductPanel === 'function') openProductPanel(item.data.handle);
    } else if (item.type === 'collection') {
      if (typeof openCollectionPanel === 'function') openCollectionPanel(item.data.handle);
    } else if (item.type === 'room') {
      if (typeof goToRoom === 'function') goToRoom(item.data.roomKey);
    }
  }

  function navigateResults(direction) {
    if (!_searchResults.length) return;
    if (direction === 'down') {
      _searchActiveIndex = Math.min(_searchActiveIndex + 1, _searchResults.length - 1);
    } else {
      _searchActiveIndex = Math.max(_searchActiveIndex - 1, 0);
    }
    var allResults = dropdown.querySelectorAll('[role="option"]');
    allResults.forEach(function (el, i) {
      el.setAttribute('aria-selected', i === _searchActiveIndex ? 'true' : 'false');
    });
    var activeId = 'immersive-search-result-' + _searchActiveIndex;
    input.setAttribute('aria-activedescendant', activeId);
  }

  function doSearch(term) {
    if (!term || term.length < 2) {
      closeDropdown();
      return;
    }
    var roomMatches = fuzzyMatchRooms(term);
    if (_searchAbortController) {
      try {
        _searchAbortController.abort();
      } catch (e) {}
    }
    var timeoutId = setTimeout(function () {
      dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }, 3000);
    var url =
      '/search/suggest?q=' + encodeURIComponent(term) + '&resources[type]=product,collection&resources[limit]=5';
    fetch(url, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(function (data) {
        var resources = (data.resources && data.resources.results) || {};
        renderResults(
          {
            products: resources.products || [],
            collections: resources.collections || [],
          },
          roomMatches,
        );
      })
      .catch(function () {
        clearTimeout(timeoutId);
        if (roomMatches.length) {
          renderResults({ products: [], collections: [] }, roomMatches);
        } else {
          dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
          dropdown.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
      });
  }

  input.addEventListener('input', function () {
    clearTimeout(_searchDebounceTimer);
    var term = input.value.trim();
    _searchDebounceTimer = setTimeout(function () {
      doSearch(term);
    }, 200);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResults('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults('up');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (_searchActiveIndex >= 0) {
        selectResult(_searchActiveIndex);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
  });
}

// ---------------------------------------------------------------------------
// Immersive Gestures
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

function initImmersiveGestures() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvasWrapper = document.getElementById('immersive-canvas') || document.querySelector('.immersive-store');
  if (!canvasWrapper) return;

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;

  canvasWrapper.addEventListener(
    'touchstart',
    function (e) {
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true },
  );

  canvasWrapper.addEventListener('touchmove', function () {}, { passive: true });

  canvasWrapper.addEventListener(
    'touchend',
    function (e) {
      var target = e.target;
      if (
        target &&
        target.closest('button, a, input, select, textarea, [role="radio"], [role="option"], [data-immersive-search]')
      )
        return;
      var touch = e.changedTouches[0];
      var deltaX = touch.clientX - touchStartX;
      var deltaY = touch.clientY - touchStartY;
      var elapsed = Date.now() - touchStartTime;
      if (elapsed > 600) return;
      var gesture = classifyGesture(deltaX, deltaY);
      if (gesture === 'none') return;
      var glassPanel = document.getElementById('glass-panel');
      var panelOpen = glassPanel && !glassPanel.hidden && !glassPanel.classList.contains('hidden');
      if (gesture === 'horizontal') {
        var now = Date.now();
        if (now - _gestureLastRoomTransition < _gestureCooldown) return;
        _gestureLastRoomTransition = now;
        if (panelOpen) return;
        var currentRoom = (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'storefront';
        var idx = SWIPE_ROOM_SEQUENCE.indexOf(currentRoom);
        if (idx === -1) idx = 0;
        var nextIdx;
        if (deltaX < 0) {
          nextIdx = (idx + 1) % SWIPE_ROOM_SEQUENCE.length;
        } else {
          nextIdx = (idx - 1 + SWIPE_ROOM_SEQUENCE.length) % SWIPE_ROOM_SEQUENCE.length;
        }
        if (typeof goToRoom === 'function') {
          goToRoom(SWIPE_ROOM_SEQUENCE[nextIdx], reduceMotion ? 'instant' : undefined);
        }
      } else if (gesture === 'vertical-down' && panelOpen) {
        var closeBtn = glassPanel && glassPanel.querySelector('.immersive-store__panel-close');
        if (closeBtn) closeBtn.click();
      } else if (gesture === 'vertical-down' && !panelOpen) {
        _esrOnSwipeDown(deltaX, deltaY);
      } else if (gesture === 'vertical-up' && !panelOpen) {
        var wishlistOpenBtn = document.querySelector('[data-wishlist-open]');
        if (wishlistOpenBtn) wishlistOpenBtn.click();
      }
    },
    { passive: true },
  );
}

// ---------------------------------------------------------------------------
// Next Actions
// ---------------------------------------------------------------------------

function initImmersiveNextActions() {
  _nextActionsBar = document.createElement('div');
  _nextActionsBar.className = 'immersive-next-actions';
  _nextActionsBar.setAttribute('role', 'status');
  _nextActionsBar.setAttribute('aria-live', 'polite');
  _nextActionsBar.hidden = true;
  document.body.appendChild(_nextActionsBar);
}

function showNextActions(chips) {
  if (!_nextActionsBar) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  clearTimeout(_nextActionsTimer);
  _nextActionsBar.innerHTML = '';
  var inner = document.createElement('div');
  inner.className = 'immersive-next-actions__inner';
  chips.forEach(function (chip) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'immersive-next-actions__chip immersive-chip';
    btn.textContent = chip.label;
    btn.addEventListener('click', function () {
      dismissNextActions();
      if (typeof chip.action === 'function') chip.action();
    });
    inner.appendChild(btn);
  });
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-next-actions__close';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.innerHTML =
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', dismissNextActions);
  inner.appendChild(closeBtn);
  _nextActionsBar.appendChild(inner);
  _nextActionsBar.hidden = false;
  if (!reduceMotion) _nextActionsBar.classList.add('is-visible');
  _nextActionsTimer = setTimeout(dismissNextActions, 6000);
}

function dismissNextActions() {
  clearTimeout(_nextActionsTimer);
  if (_nextActionsBar) {
    _nextActionsBar.classList.remove('is-visible');
    _nextActionsBar.hidden = true;
    _nextActionsBar.innerHTML = '';
  }
}

// ---------------------------------------------------------------------------
// Quick Add
// ---------------------------------------------------------------------------

function closeQuickAdd() {
  if (_quickAddModal) {
    _quickAddModal.remove();
    _quickAddModal = null;
  }
  if (_quickAddTrigger) {
    _quickAddTrigger.focus();
    _quickAddTrigger = null;
  }
}

function renderQuickAddModal(product, triggerEl) {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (_quickAddModal) _quickAddModal.remove();
  var modal = document.createElement('div');
  modal.className = 'immersive-quick-add-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'quick-add-modal-title');
  if (reduceMotion) modal.classList.add('no-animation');
  var inner = document.createElement('div');
  inner.className = 'immersive-quick-add-modal__inner';
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
  var price = document.createElement('div');
  price.className = 'immersive-quick-add-modal__price';
  price.setAttribute('data-quick-add-price', '');
  var firstVariant = product.variants && product.variants[0];
  price.textContent = firstVariant ? formatMoney(firstVariant.price) : '';
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
        variantGroup.querySelectorAll('[role="radio"]').forEach(function (b) {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('is-selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('is-selected');
        var priceEl = modal.querySelector('[data-quick-add-price]');
        if (priceEl) priceEl.textContent = formatMoney(variant.price);
        var cta = modal.querySelector('[data-quick-add-cta]');
        if (cta) {
          cta.disabled = false;
          cta.textContent = 'Add to cart';
        }
      });
      variantGroup.appendChild(btn);
    });
  }
  var cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'immersive-quick-add-modal__cta';
  cta.setAttribute('data-quick-add-cta', '');
  cta.setAttribute('data-variant-id', selectedVariantId);
  cta.textContent = 'Add to cart';
  if (firstVariant && !firstVariant.available) {
    cta.disabled = true;
    cta.textContent = 'Sold out';
  }
  cta.addEventListener('click', function () {
    if (!selectedVariantId) return;
    cta.disabled = true;
    cta.textContent = 'Adding...';
    fetch(window.routes.cart_add_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: selectedVariantId, quantity: 1 }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Add to cart failed');
        return res.json();
      })
      .then(function () {
        closeQuickAdd();
        if (typeof showFeedback === 'function') {
          showFeedback('Added to cart', 'success');
        }
        if (typeof showNextActions === 'function') {
          showNextActions([
            {
              label: 'View cart',
              action: function () {
                var cartDrawer = document.querySelector('cart-drawer');
                if (cartDrawer && typeof cartDrawer.open === 'function') cartDrawer.open();
              },
            },
          ]);
        }
      })
      .catch(function () {
        cta.disabled = false;
        cta.textContent = 'Add to cart';
        if (typeof showFeedback === 'function') {
          showFeedback('Unable to add to cart', 'error');
        }
      });
  });
  inner.appendChild(header);
  inner.appendChild(price);
  if (variantGroup) inner.appendChild(variantGroup);
  inner.appendChild(cta);
  modal.appendChild(inner);
  document.body.appendChild(modal);
  _quickAddModal = modal;
  setTimeout(function () {
    closeBtn.focus();
  }, 50);
}

function openQuickAdd(handle, triggerEl) {
  _quickAddTrigger = triggerEl || null;
  var cacheKey = 'quickadd_' + handle;
  var loadProductUrl = '/products/' + handle + '.js';
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
      if (typeof showFeedback === 'function') {
        showFeedback(errorMsg, 'error');
      }
    });
}

function initImmersiveQuickAdd() {
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var handle = btn.getAttribute('data-product-handle');
    if (handle) openQuickAdd(handle, btn);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _quickAddModal && !_quickAddModal.hidden) {
      closeQuickAdd();
    }
  });
}

// ---------------------------------------------------------------------------
// Hotspot Keyboard Navigation
// ---------------------------------------------------------------------------

function updateHotspotElements() {
  _hotspotElements = Array.from(document.querySelectorAll('[data-hotspot-btn]'));
  _focusedHotspotIndex = -1;
}

function focusNextHotspot(direction) {
  if (_hotspotElements.length === 0) return;
  _focusedHotspotIndex += direction;
  if (_focusedHotspotIndex >= _hotspotElements.length) {
    _focusedHotspotIndex = 0;
  } else if (_focusedHotspotIndex < 0) {
    _focusedHotspotIndex = _hotspotElements.length - 1;
  }
  var hotspot = _hotspotElements[_focusedHotspotIndex];
  if (hotspot) {
    hotspot.focus();
    var label = hotspot.getAttribute('aria-label') || 'Hotspot';
    announceHotspot(label);
  }
}

function announceHotspot(label) {
  var announcer = document.getElementById('immersive-hotspot-announcer');
  if (announcer) {
    announcer.textContent = label;
  }
}

function initHotspotKeyboardNav() {
  var canvas = document.getElementById('immersive-canvas');
  if (!canvas) return;
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Immersive 3D store navigation. Use Tab to navigate hotspots, Enter to activate.');
  canvas.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      focusNextHotspot(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Enter' && _focusedHotspotIndex >= 0) {
      e.preventDefault();
      var focusedHotspot = _hotspotElements[_focusedHotspotIndex];
      if (focusedHotspot) {
        focusedHotspot.click();
      }
    }
  });
  var hotspotObserver = new MutationObserver(function () {
    updateHotspotElements();
  });
  hotspotObserver.observe(canvas, { childList: true, subtree: true });
  updateHotspotElements();
}

// ---------------------------------------------------------------------------
// Editorial Scroll Reveal
// ---------------------------------------------------------------------------

function initEditorialScrollReveal() {
  if (_esrWheelBound) return;
  var canvasWrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!canvasWrapper) return;
  canvasWrapper.addEventListener('wheel', _esrOnWheel, { passive: true });
  _esrWheelBound = true;
}

// ---------------------------------------------------------------------------
// Init Wrappers (call existing modular functions)
// ---------------------------------------------------------------------------

function initImmersiveRoomRecommender() {
  if (typeof _wishlistItems !== 'undefined') {
    var bc = typeof _browsingContext !== 'undefined' ? _browsingContext : null;
    if (bc) {
      bc.savedProducts = _wishlistItems.map(function (item) {
        return item.handle || '';
      });
    }
  }
}

function initImmersiveLimitedTime() {
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var threshold = parseInt(storeEl.getAttribute('data-low-stock-threshold'), 10);
    if (!isNaN(threshold)) {
      if (typeof _lowStockThreshold !== 'undefined') {
        _lowStockThreshold = threshold;
      }
    }
  }
  if (typeof scanLimitedTimeCards === 'function') scanLimitedTimeCards();
  if (typeof showFlashSaleAlert === 'function') showFlashSaleAlert();
}

function initEditorialBackToLounge() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  if (!overlay) return;
  var btn = overlay.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  var label = overlay.getAttribute('data-back-to-lounge-label') || 'Back to Lounge';
  btn.textContent = label;
  if (!btn._btlBound) {
    btn._btlBound = true;
    btn.addEventListener('click', function () {
      if (typeof exitEditorialMode === 'function') exitEditorialMode();
      if (typeof goToRoom === 'function') goToRoom('lounge');
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof exitEditorialMode === 'function') exitEditorialMode();
        if (typeof goToRoom === 'function') goToRoom('lounge');
      }
    });
  }
}

function initProductCardTilt() {
  var reduceMotionPCT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionPCT) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  var panel = document.getElementById('glass-panel');
  if (!panel) return;
  panel.addEventListener('mousemove', _pctOnMouseMove);
  panel.addEventListener('mouseleave', _pctOnMouseLeave);
}

function initGuidedMode() {
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var wing = storeEl.getAttribute('data-guided-featured-wing');
    if (wing && typeof _guidedFeaturedWing !== 'undefined') _guidedFeaturedWing = wing;
  }
  var promptCta = document.querySelector('[data-guided-prompt-cta]');
  var promptSkip = document.querySelector('[data-guided-prompt-skip]');
  if (promptCta) {
    promptCta.addEventListener('click', function () {
      if (typeof hideGuidedPrompt === 'function') hideGuidedPrompt();
      if (typeof _guidedAdvance === 'function') _guidedAdvance();
    });
  }
  if (promptSkip) {
    promptSkip.addEventListener('click', function () {
      if (typeof exitGuidedMode === 'function') exitGuidedMode();
    });
  }
  var intentEvents = ['mousedown', 'touchstart', 'keydown', 'wheel'];
  intentEvents.forEach(function (evt) {
    document.addEventListener(
      evt,
      function () {
        if (immersiveState && immersiveState.guided) {
          if (typeof _guidedResetIdleTimer === 'function') _guidedResetIdleTimer();
        }
      },
      { passive: true },
    );
  });
}

// ---------------------------------------------------------------------------
// Full FAB (replaces simplified version in immersive-core.js)
// ---------------------------------------------------------------------------

function initImmersiveBottomNav() {
  var fab = document.querySelector('[data-immersive-fab]');
  if (!fab) return;
  var fabTrigger = fab.querySelector('[data-fab-trigger]');
  var fabActions = fab.querySelector('[data-fab-actions]');
  var wishlistBtn = fab.querySelector('[data-bottom-nav-wishlist]');
  var cartBtn = fab.querySelector('[data-bottom-nav-cart]');
  var twoDBtn = fab.querySelector('[data-bottom-nav-2d]');
  var wishlistBadge = fab.querySelector('[data-bottom-nav-wishlist-badge]');
  var cartBadge = fab.querySelector('[data-bottom-nav-cart-badge]');
  var isOpen = false;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var fabStartX = 0;
  var fabStartY = 0;
  var hasMoved = false;

  function loadFabPosition() {
    try {
      var saved = localStorage.getItem('immersive_fab_position');
      if (saved) {
        var pos = JSON.parse(saved);
        fab.style.top = pos.top;
        fab.style.right = pos.right;
        fab.style.bottom = pos.bottom;
        fab.style.left = pos.left;
        fab.style.transform = pos.transform || 'none';
      }
    } catch (e) {}
  }

  function saveFabPosition() {
    try {
      var pos = {
        top: fab.style.top,
        right: fab.style.right,
        bottom: fab.style.bottom,
        left: fab.style.left,
        transform: fab.style.transform,
      };
      localStorage.setItem('immersive_fab_position', JSON.stringify(pos));
    } catch (e) {}
  }

  function snapToEdge(x, y) {
    var rect = fab.getBoundingClientRect();
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var fabWidth = rect.width;
    var fabHeight = rect.height;
    var snapThreshold = 40;
    var centerX = x + fabWidth / 2;
    var centerY = y + fabHeight / 2;
    var distToLeft = centerX;
    var distToRight = viewportWidth - centerX;
    var distToTop = centerY;
    var distToBottom = viewportHeight - centerY;
    var minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    if (minDist < snapThreshold || minDist === distToLeft || minDist === distToRight) {
      if (distToLeft < distToRight) {
        fab.style.left = '1.25rem';
        fab.style.right = 'auto';
      } else {
        fab.style.right = '1.25rem';
        fab.style.left = 'auto';
      }
      fab.style.top = Math.max(72, Math.min(y, viewportHeight - fabHeight - 20)) + 'px';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    } else {
      fab.style.left = Math.max(20, Math.min(x, viewportWidth - fabWidth - 20)) + 'px';
      fab.style.top = Math.max(72, Math.min(y, viewportHeight - fabHeight - 20)) + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    }
  }

  function onDragStart(e) {
    if (isOpen) return;
    var touch = e.type === 'touchstart' ? e.touches[0] : e;
    isDragging = true;
    hasMoved = false;
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    var rect = fab.getBoundingClientRect();
    fabStartX = rect.left;
    fabStartY = rect.top;
  }

  function onDragMove(e) {
    if (!isDragging) return;
    var touch = e.type === 'touchmove' ? e.touches[0] : e;
    var deltaX = touch.clientX - dragStartX;
    var deltaY = touch.clientY - dragStartY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
      fab.style.transition = 'none';
      fab.style.cursor = 'grabbing';
      e.preventDefault();
    }
    if (hasMoved) {
      var newX = fabStartX + deltaX;
      var newY = fabStartY + deltaY;
      fab.style.left = newX + 'px';
      fab.style.top = newY + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.transform = 'none';
    }
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    fab.style.transition = '';
    fab.style.cursor = '';
    if (hasMoved) {
      var rect = fab.getBoundingClientRect();
      snapToEdge(rect.left, rect.top);
      saveFabPosition();
      e.preventDefault();
    }
  }

  if (fabTrigger) {
    fabTrigger.addEventListener('mousedown', onDragStart);
    fabTrigger.addEventListener('touchstart', onDragStart, { passive: false });
  }
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
  loadFabPosition();

  if (fabTrigger && fabActions) {
    fabTrigger.addEventListener('click', function (e) {
      if (hasMoved) {
        hasMoved = false;
        return;
      }
      isOpen = !isOpen;
      fabTrigger.setAttribute('aria-expanded', isOpen);
      fabActions.hidden = !isOpen;
      if (isOpen) {
        var actions = fabActions.querySelectorAll('.immersive-fab__action');
        actions.forEach(function (action, index) {
          action.style.animation =
            'fab-action-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ' + index * 0.05 + 's forwards';
        });
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (isOpen && !fab.contains(e.target)) {
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
      fabTrigger.focus();
    }
  });

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function () {
      if (typeof exitGuidedMode === 'function') exitGuidedMode();
      if (typeof openWishlistPanel === 'function') openWishlistPanel();
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      if (typeof exitGuidedMode === 'function') exitGuidedMode();
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open(cartBtn);
      }
      isOpen = false;
      fabTrigger.setAttribute('aria-expanded', 'false');
      fabActions.hidden = true;
    });
  }

  if (twoDBtn) {
    twoDBtn.addEventListener('click', function (e) {
      var modeSwitchBtn = document.querySelector('[data-mode-switch-2d]');
      if (modeSwitchBtn) {
        e.preventDefault();
        modeSwitchBtn.click();
      }
    });
  }

  window.updateBottomNavBadges = function (wishlistCount, cartCount) {
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
      wishlistBadge.hidden = wishlistCount === 0;
    }
    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.hidden = cartCount === 0;
    }
  };

  var glassPanel = document.getElementById('glass-panel');
  if (glassPanel) {
    var panelObserver = new MutationObserver(function () {
      var panelIsOpen = !glassPanel.hidden && !glassPanel.classList.contains('hidden');
      fab.style.display = panelIsOpen ? 'none' : 'flex';
    });
    panelObserver.observe(glassPanel, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }
}

// ---------------------------------------------------------------------------
// Master Init + Section Handlers
// ---------------------------------------------------------------------------

function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  if (!document.getElementById('immersive-canvas')) return;
  _immersiveInitBound = true;

  if (typeof renderer !== 'undefined' && renderer) {
    try {
      renderer.dispose();
    } catch (e) {}
    renderer = null;
    scene = null;
    camera = null;
    planeMesh = null;
    uniforms = null;
    if (typeof currentRoomKey !== 'undefined') currentRoomKey = null;
    if (typeof transitioning !== 'undefined') transitioning = false;
    if (typeof textureCache !== 'undefined') {
      textureCache.forEach(function (entry) {
        try {
          if (entry.base) entry.base.dispose();
          if (entry.depth) entry.depth.dispose();
        } catch (e) {}
      });
      textureCache = [];
    }
    if (typeof contentCache !== 'undefined') contentCache = {};
  }

  requestAnimationFrame(function () {
    if (typeof initImmersiveScene === 'function') initImmersiveScene();
    if (typeof bindImmersiveNav === 'function') bindImmersiveNav();
    if (typeof setupImageParallax === 'function') setupImageParallax();
    if (typeof showImmersiveOnboardingIfNeeded === 'function') showImmersiveOnboardingIfNeeded();
    if (typeof initWishlist === 'function') initWishlist();
    if (typeof bindCookieBanner === 'function') bindCookieBanner();
    if (typeof initTiltControlToggle === 'function') initTiltControlToggle();

    if (typeof initImmersiveRoomRecommender === 'function') initImmersiveRoomRecommender();
    if (typeof initImmersiveLimitedTime === 'function') initImmersiveLimitedTime();
    if (typeof initEditorialBackToLounge === 'function') initEditorialBackToLounge();
    if (typeof initProductCardTilt === 'function') initProductCardTilt();
    if (typeof initGuidedMode === 'function') initGuidedMode();

    if (typeof initImmersiveSearch === 'function') initImmersiveSearch();
    if (typeof initImmersiveGestures === 'function') initImmersiveGestures();
    if (typeof initImmersiveNextActions === 'function') initImmersiveNextActions();
    if (typeof initImmersiveQuickAdd === 'function') initImmersiveQuickAdd();
    if (typeof initHotspotKeyboardNav === 'function') initHotspotKeyboardNav();
    if (typeof initEditorialScrollReveal === 'function') initEditorialScrollReveal();

    if (typeof initImmersiveBottomNav === 'function') initImmersiveBottomNav();

    setTimeout(function () {
      _immersiveInitBound = false;
    }, 500);
  });
}

function scheduleImmersiveInit() {
  if (typeof window === 'undefined') return;
  function run() {
    try {
      safeBindImmersiveInit();
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) console.error('[Immersive] Init failed:', e);
    }
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1000 });
  } else {
    setTimeout(run, 300);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleImmersiveInit);
} else {
  scheduleImmersiveInit();
}

document.addEventListener('shopify:section:load', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false;
    safeBindImmersiveInit();
    if (typeof initImmersiveSearch === 'function') initImmersiveSearch();
    if (typeof initImmersiveBottomNav === 'function') initImmersiveBottomNav();
    if (typeof initImmersiveLimitedTime === 'function') initImmersiveLimitedTime();
  }
});

document.addEventListener('shopify:section:select', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    safeBindImmersiveInit();
  }
});

document.addEventListener('shopify:section:unload', function (e) {
  if (e.target && e.target.querySelector && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false;
  }
});
