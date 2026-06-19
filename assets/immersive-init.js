/**
 * Immersive Init — coordination layer for the 3D store.
 *
 * Loads after immersive-core.js and immersive-features.js.
 * Contains:
 *   - Init wrappers that call existing modular functions
 *   - Entirely missing features ported from legacy (search, gestures, quick-add, etc.)
 *   - Full FAB
 *   - safeBindImmersiveInit() + Shopify theme editor re-init handlers
 *
 * OVERRIDE NOTICE: Several functions defined in this file (e.g., showNextActions,
 * dismissNextActions, _nextActionsTimer, _nextActionsBar) override stubs
 * from immersive-features.js. This file also re-declares some functions that
 * exist in immersive-core.js or immersive-features.js; those are intentional
 * overrides — the init.js version is the authoritative implementation when
 * all three files load together. Do NOT remove these — the override chain
 * (core stub → features override → init override) is the designed loading order.
 */

// ---------------------------------------------------------------------------
// State Variables
// ---------------------------------------------------------------------------

var _immersiveInitBound = false;
var _searchActiveIndex = -1;
var _searchResults = [];
var _searchDebounceTimer = null;
var _searchAbortController = null;
var _searchTimeoutId = null;
var _gestureLastRoomTransition = 0;
var _gestureCooldown = 600;
var SWIPE_ROOM_SEQUENCE = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];
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
  document.body.appendChild(toast);
  var roomBadge = document.getElementById('immersive-room-badge');
  if (roomBadge) roomBadge.classList.add('is-toast-visible');
  setTimeout(function () {
    toast.classList.add('immersive-feedback-toast--out');
    if (roomBadge) roomBadge.classList.remove('is-toast-visible');
    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 350);
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
    // Issue 8: Show metadata for both products and collections
    var metaText = '';
    if (type === 'product' && item.price) {
      metaText = item.price;
    } else if (type === 'collection') {
      // Shopify suggest API returns products_count for collections
      if (item.products_count !== undefined && item.products_count !== null) {
        metaText = item.products_count + ' product' + (item.products_count !== 1 ? 's' : '');
      }
    }
    if (metaText) {
      var meta = document.createElement('span');
      meta.className = 'immersive-search__result-meta';
      meta.textContent = metaText;
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
    if (_searchTimeoutId) clearTimeout(_searchTimeoutId);
    var timeoutId = setTimeout(function () {
      dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }, 3000);
    _searchTimeoutId = timeoutId;
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
        if (_searchTimeoutId) { clearTimeout(_searchTimeoutId); _searchTimeoutId = null; }
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

  ListenerRegistry.add(
    'gesture-touchstart',
    canvasWrapper,
    'touchstart',
    function (e) {
      if (window.ShahanaImmersive && window.ShahanaImmersive.settings && !window.ShahanaImmersive.settings.interactionEnabled) return;
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true },
  );

  ListenerRegistry.add('gesture-touchmove', canvasWrapper, 'touchmove', function () {}, { passive: true });

  ListenerRegistry.add(
    'gesture-touchend',
    canvasWrapper,
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
        // Issue 12: Reset cooldown after room transition completes so rapid
        // swipes don't queue up and fire all at once when cooldown expires.
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
  ListenerRegistry.add('quick-add-close', closeBtn, 'click', closeQuickAdd);
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
    fetch((window.routes && window.routes.cart_add_url) || '/cart/add.js', {
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
      // Issue 22: Try both attribute names for consistent error messaging
      var errorMsg =
        (glassPanel &&
          (glassPanel.getAttribute('data-msg-load-product-error') || glassPanel.getAttribute('data-msg-load-error'))) ||
        'Unable to load product.';
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
  // Give each hotspot its own tabindex so screen readers can enumerate them.
  // Follows Dawn's getFocusableElements() pattern for discoverable controls.
  _hotspotElements.forEach(function (el, i) {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });
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

  // Make canvas a focusable group label; individual hotspots get their own
  // tabindex via updateHotspotElements().  Follows Dawn's CartDrawer focus
  // trap pattern: TAB cycles only within focusable elements of the active
  // container, Shift+TAB reverses, Escape exits to the canvas.
  canvas.setAttribute('tabindex', '-1');
  canvas.setAttribute('role', 'group');
  canvas.setAttribute(
    'aria-label',
    'Immersive 3D store hotspots. Use Tab to move between hotspots, Enter to activate, Escape to leave.',
  );

  // Global keydown on the UI layer container, so it works even when focus
  // is on the canvas wrapper (which sits behind hotspot buttons).
  var uiLayer = document.getElementById('ui-layer');
  var keyTarget = uiLayer || canvas;

  keyTarget.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      // If there are no hotspots, do nothing
      if (_hotspotElements.length === 0) return;

      // Find which hotspot (if any) is currently focussed
      var currentIndex = -1;
      for (var hi = 0; hi < _hotspotElements.length; hi++) {
        if (_hotspotElements[hi] === document.activeElement) {
          currentIndex = hi;
          break;
        }
      }

      // If focus is on a hotspot, move to the next/prev one
      if (currentIndex !== -1) {
        e.preventDefault();
        var nextIndex = currentIndex + (e.shiftKey ? -1 : 1);
        if (nextIndex >= _hotspotElements.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = _hotspotElements.length - 1;
        _hotspotElements[nextIndex].focus();
        _focusedHotspotIndex = nextIndex;
        announceHotspot(_hotspotElements[nextIndex].getAttribute('aria-label') || 'Hotspot');
        return;
      }

      // If focus is on the canvas wrapper / UI layer, move to first/last
      e.preventDefault();
      var targetIdx = e.shiftKey ? _hotspotElements.length - 1 : 0;
      _hotspotElements[targetIdx].focus();
      _focusedHotspotIndex = targetIdx;
      announceHotspot(_hotspotElements[targetIdx].getAttribute('aria-label') || 'Hotspot');
      return;
    }

    // Escape returns focus to canvas and leaves hotspot ring
    if (e.key === 'Escape') {
      _focusedHotspotIndex = -1;
      canvas.focus();
      return;
    }

    // Enter / Space activates the focussed hotspot
    if ((e.key === 'Enter' || e.key === ' ') && _focusedHotspotIndex >= 0) {
      e.preventDefault();
      var focusedHotspot = _hotspotElements[_focusedHotspotIndex];
      if (focusedHotspot) {
        focusedHotspot.click();
      }
    }
  });

  // Use Dawn's getFocusableElements() to set tabindex on each hotspot so
  // they are individually reachable (screen readers can enumerate them).
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
// Promo Code Overlay
// ---------------------------------------------------------------------------

function initPromoCodeOverlay() {
  var overlay = document.getElementById('immersive-promo-code');
  if (!overlay) return;
  var form = overlay.querySelector('[data-promo-code-form]');
  var input = overlay.querySelector('#immersive-promo-code-input');
  var feedback = overlay.querySelector('[data-promo-code-feedback]');
  var closeBtn = overlay.querySelector('.immersive-promo-code-overlay__close');
  var msgSuccess = overlay.getAttribute('data-msg-success') || 'Discount applied!';
  var msgError = overlay.getAttribute('data-msg-error') || 'Invalid discount code.';
  var msgEmpty = overlay.getAttribute('data-msg-empty') || 'Please enter a code.';
  var shopRoot = (window.routes && window.routes.root_url) || '/';

  if (!shopRoot.endsWith('/')) shopRoot += '/';

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = 'immersive-promo-code-overlay__feedback immersive-promo-code-overlay__feedback--' + type;
    feedback.hidden = false;
    setTimeout(function () {
      feedback.hidden = true;
    }, 4000);
  }

  function openOverlay() {
    overlay.hidden = false;
    if (input) input.focus();
    if (typeof exitGuidedMode === 'function') exitGuidedMode();
  }

  function closeOverlay() {
    overlay.hidden = true;
    if (input) input.value = '';
    if (feedback) feedback.hidden = true;
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.hidden) {
      closeOverlay();
    }
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = input ? input.value.trim() : '';
      if (!code) {
        showFeedback(msgEmpty, 'error');
        return;
      }
      var submitBtn = form.querySelector('.immersive-promo-code-overlay__submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Applying...';
      }
      fetch(shopRoot + 'cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ discount: code }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Discount update failed');
          return res.json();
        })
        .then(function (cartData) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Apply';
          }
          var hasDiscount = cartData.cart_level_discount_applications && cartData.cart_level_discount_applications.length > 0;
          if (hasDiscount) {
            showFeedback(msgSuccess, 'success');
            if (typeof showFeedback === 'function') {
              showFeedback(msgSuccess, 'success');
            }
            if (input) input.value = '';
            if (typeof trackImmersiveEvent === 'function') {
              trackImmersiveEvent('promo_code_applied', { code: code });
            }
            var cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer && typeof cartDrawer.open === 'function') {
              cartDrawer.open();
            }
            setTimeout(closeOverlay, 2000);
          } else {
            showFeedback(msgError, 'error');
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Apply';
          }
          showFeedback(msgError, 'error');
        });
    });
  }

  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('[data-promo-code-remove]');
    if (!removeBtn) return;
    var codeToRemove = removeBtn.getAttribute('data-promo-code-remove');
    if (!codeToRemove) return;
    fetch(shopRoot + 'cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ discount: '' }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Remove discount failed');
        return res.json();
      })
      .then(function () {
        if (typeof showFeedback === 'function') {
          showFeedback('Discount removed', 'success');
        }
        var activeSection = overlay.querySelector('[data-promo-code-active]');
        if (activeSection) activeSection.remove();
        if (typeof trackImmersiveEvent === 'function') {
          trackImmersiveEvent('promo_code_removed', { code: codeToRemove });
        }
      })
      .catch(function () {
        showFeedback('Could not remove discount', 'error');
      });
  });

  // Open overlay from FAB overlay trigger
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-immersive-overlay="immersive-promo-code"]');
    if (!trigger) return;
    e.preventDefault();
    openOverlay();
    // Close FAB menu
    var fabTrigger = document.querySelector('[data-fab-trigger]');
    var fabActions = document.querySelector('[data-fab-actions]');
    if (fabTrigger) fabTrigger.setAttribute('aria-expanded', 'false');
    if (fabActions) fabActions.hidden = true;
  });
}

// ---------------------------------------------------------------------------
// Full FAB
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
        // Issue 18: Use CSS custom properties instead of inline styles to
        // avoid flash on first load. Applied atomically via cssText.
        var css = '';
        if (pos.top) css += 'top:' + pos.top + ';';
        if (pos.right && pos.right !== 'auto') css += 'right:' + pos.right + ';left:auto;';
        if (pos.left && pos.left !== 'auto') css += 'left:' + pos.left + ';right:auto;';
        if (pos.transform && pos.transform !== 'none') css += 'transform:' + pos.transform + ';';
        if (css) fab.style.cssText = css;
      }
    } catch (e) {}
  }

  function saveFabPosition() {
    try {
      // Issue 18: Only save meaningful position values, not the full
      // inline style set. This prevents CSS conflicts on restore.
      var pos = {
        top: fab.style.top || '',
        right: fab.style.right || '',
        left: fab.style.left || '',
        transform: fab.style.transform || '',
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
    ListenerRegistry.add('fab-drag', fabTrigger, 'touchstart', onDragStart, { passive: false });
  }
  document.addEventListener('mousemove', onDragMove);
  ListenerRegistry.add('fab-drag', document, 'touchmove', onDragMove, { passive: false });
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

function initHomeButton() {
  var homeBtn = document.querySelector('[data-immersive-home-btn]');
  if (homeBtn) {
    homeBtn.addEventListener('click', function () {
      if (typeof goToRoom === 'function') {
        goToRoom('storefront');
      } else {
        window.location.href = '/pages/immersive';
      }
    });
  }
}

function initSearchShortcut() {
  var shortcutEl = document.querySelector('[data-search-shortcut]');
  if (shortcutEl) {
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    shortcutEl.textContent = isMac ? '⌘K' : 'Ctrl+K';
  }
}

function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  if (!document.getElementById('immersive-canvas')) return;
  _immersiveInitBound = true;

  if (typeof renderer !== 'undefined' && renderer) {
    if (typeof animationFrameId !== 'undefined' && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
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
    if (typeof initBackButton === 'function') initBackButton();
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
    if (typeof initPromoCodeOverlay === 'function') initPromoCodeOverlay();

    if (typeof initHomeButton === 'function') initHomeButton();
    if (typeof initSearchShortcut === 'function') initSearchShortcut();

    if (typeof window.ImmersiveCarousel !== 'undefined' && window.ImmersiveCarousel.init) {
      window.ImmersiveCarousel.init();
    }

    // Initialize InfiniteGallery for gallery rooms
    if (typeof window.InfiniteGallery !== 'undefined') {
      var _igRoom = typeof currentRoomKey !== 'undefined' ? currentRoomKey : '';
      if (_igRoom === 'designer_houses' || _igRoom === 'occasions' || _igRoom === 'featured_collections') {
        window._infiniteGallery = new window.InfiniteGallery({
          columns: 4,
          spacing: 0.08,
          cardWidth: 0.7,
          cardHeight: 1.05,
          friction: 0.95,
        });
        window._infiniteGallery.init();
      }
    }

    setTimeout(function () {
      _immersiveInitBound = false;
    }, 500);
  });
}

function hideInitialLoader() {
  var el = document.getElementById('immersive-initial-loader');
  if (el) el.classList.add('is-hidden');
}

// Safety net: force-hide the loading overlay if nothing else does within 10 seconds
var _loaderSafetyTimer = setTimeout(function () {
  hideInitialLoader();
}, 10000);

function scheduleImmersiveInit() {
  if (typeof window === 'undefined') return;
  function run() {
    try {
      safeBindImmersiveInit();
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) console.error('[Immersive] Init failed:', e);
    }
    // If init succeeded, the loader should already be hidden by the bundle.
    // Cancel the safety timer to avoid a flash.
    clearTimeout(_loaderSafetyTimer);
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
    if (typeof initPromoCodeOverlay === 'function') initPromoCodeOverlay();
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

    // Stop main animate loop driven by ImmersiveTheme.ticker
    if (typeof window.ShahanaImmersive !== 'undefined' &&
        typeof window.ShahanaImmersive.stopAnimate === 'function') {
      window.ShahanaImmersive.stopAnimate();
    }

    // Teardown: clean up all ListenerRegistry entries + dispose GPU resources
    if (typeof ListenerRegistry !== 'undefined') ListenerRegistry.cleanupAll();
    if (typeof unbindResizeHandling === 'function') unbindResizeHandling();
    if (typeof disposeGalleryStage === 'function') { Object.keys(galleryStageRegistry || {}).forEach(function(k) { disposeGalleryStage(k); }); }
    if (typeof renderer !== 'undefined' && renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    // Clean up bridge behavior resources
    if (typeof window.ShahanaImmersive !== 'undefined' && 
        typeof window.ShahanaImmersive.bridgeBehavior !== 'undefined' && 
        typeof window.ShahanaImmersive.bridgeBehavior.destroy === 'function') {
      window.ShahanaImmersive.bridgeBehavior.destroy();
    }
    // Clean up editorial hero parallax resources
    if (typeof window.ShahanaImmersive !== 'undefined' && 
        typeof window.ShahanaImmersive.editorialFeatures !== 'undefined' && 
        typeof window.ShahanaImmersive.editorialFeatures.destroyEditorialHeroParallax === 'function') {
      window.ShahanaImmersive.editorialFeatures.destroyEditorialHeroParallax();
    }
    // Clean up guided mode timers
    if (typeof window.ShahanaImmersive !== 'undefined' && 
        typeof window.ShahanaImmersive.editorialFeatures !== 'undefined' && 
        typeof window.ShahanaImmersive.editorialFeatures.cleanupGuidedModeTimers === 'function') {
      window.ShahanaImmersive.editorialFeatures.cleanupGuidedModeTimers();
    }
    // Clean up codex typo index resources
    if (typeof window.ShahanaImmersive !== 'undefined' &&
        typeof window.ShahanaImmersive.codexFeatures !== 'undefined' &&
        typeof window.ShahanaImmersive.codexFeatures.destroyCodexTypoIndex === 'function') {
      window.ShahanaImmersive.codexFeatures.destroyCodexTypoIndex();
    }
    // Clean up search timeout
    if (_searchTimeoutId) {
      clearTimeout(_searchTimeoutId);
      _searchTimeoutId = null;
    }
  }
});

/* =============================================================================
   LUXURY REFINEMENTS (merged from immersive-luxury-refinements.js)
   IntersectionObserver reveals, smooth timeline, skeleton states
   Class names updated to match current template DOM.
   ============================================================================= */

/* =============================================================================
   Immersive Luxury Refinements — JS Behaviors
   IntersectionObserver reveals, smooth timeline, skeleton states
   ============================================================================= */

(function () {
  'use strict';

  var LUX_CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // ── Intersection Observer for product card reveals ──────────────────────

  var revealObserver = null;

  function initRevealObserver() {
    if (!('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var card = entry.target;
            card.classList.add('is-visible');
            revealObserver.unobserve(card);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
  }

  function observeCards(container) {
    if (!revealObserver) initRevealObserver();
    if (!revealObserver || !container) return;

    var cards = container.querySelectorAll('.immersive-product-card');
    cards.forEach(function (card, i) {
      card.classList.add('luxury-reveal');
      card.style.transitionDelay = (i * 80) + 'ms';
      revealObserver.observe(card);
    });
  }

  // ── Smooth Timeline Thumb ───────────────────────────────────────────────

  var thumbSmoothing = {
    current: 0,
    target: 0,
    rafId: null,
    active: false
  };

  function smoothThumbUpdate() {
    if (!thumbSmoothing.active) return;

    var diff = thumbSmoothing.target - thumbSmoothing.current;
    if (Math.abs(diff) < 0.5) {
      thumbSmoothing.current = thumbSmoothing.target;
      thumbSmoothing.rafId = null;
      thumbSmoothing.active = false;
      applyThumbPosition(thumbSmoothing.current);
      return;
    }

    // Organic easing — decelerates as it approaches target
    thumbSmoothing.current += diff * 0.12;
    applyThumbPosition(thumbSmoothing.current);
    thumbSmoothing.rafId = requestAnimationFrame(smoothThumbUpdate);
  }

  function applyThumbPosition(progress) {
    var thumb = document.querySelector('.immersive-designers__thumb');
    if (!thumb) return;

    var rail = document.querySelector('.immersive-designers__timeline-rail');
    if (!rail) return;

    var markers = rail.querySelectorAll('.immersive-designers__timeline-marker');
    if (markers.length < 2) return;

    var railRect = rail.getBoundingClientRect();
    var firstMarker = markers[0].getBoundingClientRect();
    var lastMarker = markers[markers.length - 1].getBoundingClientRect();
    var activeMarker = rail.querySelector('.immersive-designers__timeline-marker.is-active');

    if (!activeMarker) return;

    var activeRect = activeMarker.getBoundingClientRect();
    var startX = firstMarker.left + firstMarker.width / 2 - railRect.left;
    var endX = lastMarker.left + lastMarker.width / 2 - railRect.left;
    var activeX = activeRect.left + activeRect.width / 2 - railRect.left;
    var thumbWidth = Math.max(activeRect.width * 0.6, 40);

    thumb.style.left = (activeX - thumbWidth / 2) + 'px';
    thumb.style.width = thumbWidth + 'px';
  }

  function initSmoothThumb() {
    var rail = document.querySelector('.immersive-designers__timeline-rail');
    if (!rail) return;

    rail.addEventListener('click', function (e) {
      var marker = e.target.closest('.immersive-designers__timeline-marker');
      if (!marker) return;

      // Allow the original click handler to fire first, then smooth the thumb
      requestAnimationFrame(function () {
        applyThumbPosition(1);
      });
    });
  }

  // ── Skeleton Loading States ─────────────────────────────────────────────

  function showSkeletonLoading(container) {
    if (!container) return;

    var grid = container.querySelector('.immersive-designer-grid') ||
               container.querySelector('.immersive-designers__products');
    if (!grid) return;

    // Show 4 skeleton cards
    var skeletonHTML = '';
    for (var i = 0; i < 4; i++) {
      skeletonHTML += '<div class="immersive-skeleton immersive-skeleton--card">' +
        '<div class="immersive-skeleton immersive-skeleton--image"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text immersive-skeleton--text-short"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text immersive-skeleton--text-short" style="width:40%"></div>' +
        '</div>';
    }

    var skeletonContainer = document.createElement('div');
    skeletonContainer.className = 'immersive-skeleton-grid';
    skeletonContainer.setAttribute('aria-hidden', 'true');
    skeletonContainer.innerHTML = skeletonHTML;
    grid.parentNode.insertBefore(skeletonContainer, grid);
    grid.style.display = 'none';
  }

  function hideSkeletonLoading(container) {
    if (!container) return;

    var skeleton = container.querySelector('.immersive-skeleton-grid');
    if (skeleton) {
      skeleton.remove();
    }

    var grid = container.querySelector('.immersive-designer-grid') ||
               container.querySelector('.immersive-designers__products');
    if (grid) {
      grid.style.display = '';
    }
  }

  // ── Scroll Cue Injection ────────────────────────────────────────────────

  function injectScrollCue() {
    var heroWrap = document.querySelector('.immersive-designers__hero-transition-wrap');
    if (!heroWrap) return;
    if (heroWrap.querySelector('.immersive-designers__scroll-cue')) return;

    var cue = document.createElement('div');
    cue.className = 'immersive-designers__scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = '<span class="immersive-designers__scroll-cue-text">Explore Collection</span>' +
                    '<div class="immersive-designers__scroll-cue-line"></div>';
    heroWrap.appendChild(cue);
  }

  // ── Card Entrance Animation ─────────────────────────────────────────────

  function animateCardEntrance(container) {
    if (!container) return;

    var cards = container.querySelectorAll('.immersive-product-card');
    cards.forEach(function (card, i) {
      card.classList.add('luxury-entering');
      card.style.animationDelay = (i * 80) + 'ms';
      // Clean up after animation completes
      card.addEventListener('animationend', function handler() {
        card.classList.remove('luxury-entering');
        card.style.animationDelay = '';
        card.removeEventListener('animationend', handler);
      });
    });
  }

  // ── Mutation Observer for Dynamic Product Loading ───────────────────────

  var productObserver = null;

  function watchForProducts() {
    var productsContainer = document.querySelector('.immersive-designers__products');
    if (!productsContainer) return;

    productObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
          // Products were injected — animate them in
          setTimeout(function () {
            hideSkeletonLoading(productsContainer);
            animateCardEntrance(productsContainer);
            observeCards(productsContainer);
          }, 50);
        }
      });
    });

    productObserver.observe(productsContainer, { childList: true, subtree: true });
  }

  // ── Init ────────────────────────────────────────────────────────────────

  function init() {
    // Only run in editorial overlay context
    var overlay = document.getElementById('immersive-editorial-overlay');
    var overlayContent = document.getElementById('immersive-editorial-overlay-content');
    if (!overlay && !overlayContent) return;

    var designersSection = document.querySelector('.immersive-designers');
    if (!designersSection) return;

    // Inject scroll cue
    injectScrollCue();

    // Init smooth thumb
    initSmoothThumb();

    // Watch for product loading
    watchForProducts();

    // If products are already loaded, animate them
    var existingCards = designersSection.querySelectorAll('.immersive-product-card');
    if (existingCards.length > 0) {
      setTimeout(function () {
        animateCardEntrance(designersSection);
        observeCards(designersSection);
      }, 100);
    } else {
      // Show skeleton while waiting
      showSkeletonLoading(designersSection);
    }
  }

  // Run on DOM ready and on section load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init when editorial overlay opens (products may load async)
  document.addEventListener('immersive:editorial-opened', function () {
    setTimeout(init, 300);
  });

  // Shopify section load
  document.addEventListener('shopify:section:load', function () {
    setTimeout(init, 100);
  });

})();
