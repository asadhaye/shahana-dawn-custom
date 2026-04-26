/**
 * Panel: wishlist-panel
 * TODO: Extract from immersive-store.js
 */

function addToWishlist(handle, source, sourceEl) {
  if (!handle) return;
  // Check for existing entry (handle may be string or object)
  var alreadySaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });
  if (alreadySaved) return;
  _wishlistItems.push({ handle: handle, discoveryRoom: immersiveState.currentRoom || null });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  _triggerHeartPulse();
  _flyToWishlist(sourceEl);
  if (typeof recordBrowsingSignal === 'function') recordBrowsingSignal(immersiveState.currentRoom);
  trackImmersiveEvent('wishlist_add', { product_handle: handle, source: source || 'unknown' });
}

function removeFromWishlist(handle, source) {
  if (!handle) return;
  _wishlistItems = _wishlistItems.filter(function (item) {
    return (typeof item === 'string' ? item : item.handle) !== handle;
  });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: source || 'unknown' });
}

function getWishlist() {
  return _wishlistItems.slice();
}

function _persistWishlist() {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(_wishlistItems));
  } catch (e) {}
}

function updateWishlistBadge() {
  var badge = document.querySelector('[data-wishlist-badge]');
  if (!badge) return;
  badge.textContent = _wishlistItems.length;
  badge.hidden = _wishlistItems.length === 0;
  if (typeof window.updateBottomNavBadges === 'function') {
    window.updateBottomNavBadges(_wishlistItems.length, null);
  }
}

function syncAllWishlistToggles(root) {
  var toggles = root.querySelectorAll('[data-wishlist-toggle]');
  for (var i = 0; i < toggles.length; i++) {
    var toggle = toggles[i];
    var handle = toggle.getAttribute('data-product-handle');
    var isSaved =
      handle &&
      _wishlistItems.some(function (item) {
        return (typeof item === 'string' ? item : item.handle) === handle;
      });
    toggle.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    toggle.classList.toggle('is-saved', !!isSaved);
    var labelSave = toggle.getAttribute('data-label-save');
    var labelSaved = toggle.getAttribute('data-label-saved');
    if (labelSave && labelSaved) {
      toggle.setAttribute('aria-label', isSaved ? labelSaved : labelSave);
    }
  }
}

function _triggerHeartPulse() {
  if (reduceMotion) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  btn.classList.remove('immersive-wishlist-btn--pulse');
  void btn.offsetWidth; // force reflow
  btn.classList.add('immersive-wishlist-btn--pulse');
  setTimeout(function () {
    btn.classList.remove('immersive-wishlist-btn--pulse');
  }, 600);
}

function _flyToWishlist(sourceEl) {
  if (reduceMotion || !sourceEl) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  var srcRect = sourceEl.getBoundingClientRect();
  var btnRect = btn.getBoundingClientRect();
  var token = document.createElement('div');
  token.className = 'immersive-fly-token';
  token.setAttribute('aria-hidden', 'true');
  token.style.left = srcRect.left + srcRect.width / 2 - 8 + 'px';
  token.style.top = srcRect.top + srcRect.height / 2 - 8 + 'px';
  document.body.appendChild(token);
  requestAnimationFrame(function () {
    var dx = btnRect.left + btnRect.width / 2 - 8 - (srcRect.left + srcRect.width / 2 - 8);
    var dy = btnRect.top + btnRect.height / 2 - 8 - (srcRect.top + srcRect.height / 2 - 8);
    token.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease';
    token.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.3)';
    token.style.opacity = '0';
  });
  setTimeout(function () {
    if (token.parentNode) token.parentNode.removeChild(token);
  }, 550);
}

function toggleWishlistItem(handle, source, sourceEl) {
  var isSaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });

  // Mark panel as having user interaction (wishlist toggle)
  var panel = document.getElementById('glass-panel');
  if (panel && !panel.hidden) {
    panel.setAttribute('data-user-interacted', 'true');
  }

  if (isSaved) {
    removeFromWishlist(handle, source);
  } else {
    addToWishlist(handle, source, sourceEl);
  }
}

function cacheWishlistProduct(handle, panelEl) {
  if (!handle || !panelEl) return;
  var titleEl = panelEl.querySelector('.glass-product-section__title');
  var priceEl = panelEl.querySelector('.glass-product-section__price');
  var imgEl = panelEl.querySelector('.glass-product-section__media-main img');
  if (!titleEl) return;
  _wishlistProductCache[handle] = {
    title: titleEl.textContent.trim(),
    price: priceEl ? priceEl.textContent.trim() : '',
    imageSrc: imgEl ? imgEl.getAttribute('src') : '',
  };
}

function renderWishlistPanel() {
  var body = document.querySelector('[data-wishlist-body]');
  var panelEl = document.getElementById('immersive-wishlist-panel');
  if (!body || !panelEl) return;

  var emptyMsg =
    panelEl.getAttribute('data-msg-empty-encouragement') ||
    panelEl.getAttribute('data-msg-empty') ||
    "You haven't saved any products yet.";
  var viewMsg = panelEl.getAttribute('data-msg-view') || 'View product';
  var removeMsg = panelEl.getAttribute('data-msg-remove') || 'Remove from wishlist';

  if (_wishlistItems.length === 0) {
    body.innerHTML = renderEmptyState('wishlist');
    return;
  }

  // Group items by discoveryRoom
  var groups = {};
  var groupOrder = [];
  for (var i = 0; i < _wishlistItems.length; i++) {
    var item = _wishlistItems[i];
    var handle = typeof item === 'string' ? item : item.handle;
    var room = (typeof item === 'string' ? null : item.discoveryRoom) || null;
    var groupKey = room || '__saved__';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
      groupOrder.push(groupKey);
    }
    groups[groupKey].push(handle);
  }

  var roomBadgeEl = document.getElementById('immersive-room-badge');
  var html = '';

  for (var g = 0; g < groupOrder.length; g++) {
    var groupKey = groupOrder[g];
    var handles = groups[groupKey];

    // Resolve room label
    var roomLabel;
    if (groupKey === '__saved__') {
      roomLabel = 'Saved';
    } else {
      roomLabel = (roomBadgeEl && roomBadgeEl.getAttribute('data-room-name-' + groupKey)) || groupKey;
    }

    html += '<h3 class="immersive-wishlist__room-label">Found in: ' + roomLabel + '</h3>';

    for (var j = 0; j < handles.length; j++) {
      var handle = handles[j];
      var cached = _wishlistProductCache[handle] || {};
      var title = cached.title || handle;
      var price = cached.price || '';
      var imgSrc = cached.imageSrc || '';
      var imgHtml = imgSrc
        ? '<img src="' +
          imgSrc +
          '" alt="' +
          title.replace(/"/g, '&quot;') +
          '" loading="lazy" width="80" height="107">'
        : '<div style="width:80px;height:107px;background:rgba(255,255,255,0.05);border-radius:0.25rem;"></div>';

      html +=
        '<article class="immersive-wishlist-card" data-wishlist-card data-product-handle="' +
        handle +
        '">' +
        imgHtml +
        '<div class="immersive-wishlist-card__info">' +
        '<p class="immersive-wishlist-card__title">' +
        title +
        '</p>' +
        '<p class="immersive-wishlist-card__price">' +
        price +
        '</p>' +
        '</div>' +
        '<div class="immersive-wishlist-card__actions">' +
        '<button type="button" data-wishlist-view data-product-handle="' +
        handle +
        '" aria-label="' +
        viewMsg +
        ' ' +
        title.replace(/"/g, '&quot;') +
        '">' +
        viewMsg +
        '</button>' +
        '<button type="button" data-wishlist-remove data-product-handle="' +
        handle +
        '" aria-label="' +
        removeMsg +
        '">' +
        removeMsg +
        '</button>' +
        '</div>' +
        '</article>';
    }
  }

  body.innerHTML = html;
}

function openWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  _wishlistPanelTrigger = document.activeElement;
  renderWishlistPanel();
  panel.removeAttribute('hidden');
  var closeBtn = panel.querySelector('[data-wishlist-close]');
  if (closeBtn) {
    requestAnimationFrame(function () {
      closeBtn.focus();
    });
  }
  // Wire focus trap and Escape via a lightweight inline handler
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusableElements(panel);
    if (!focusable.length) return;
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
  }
  function onEscape(e) {
    if (e.key === 'Escape') closeWishlistPanel('escape');
  }
  panel._wlTrapFocus = trapFocus;
  panel._wlEscape = onEscape;
  panel.addEventListener('keydown', trapFocus);
  panel.addEventListener('keydown', onEscape);

  // Add click handler for empty state actions
  function handleWishlistClick(e) {
    var emptyAction = e.target.closest('[data-empty-action]');
    if (emptyAction) {
      var action = emptyAction.getAttribute('data-empty-action');
      if (action) {
        handleEmptyStateAction(action);
      }
      return;
    }
  }
  panel._wlClickHandler = handleWishlistClick;
  panel.addEventListener('click', handleWishlistClick);

  trackImmersiveEvent('wishlist_panel_opened', { item_count: _wishlistItems.length });
}

function closeWishlistPanel(closeMethod) {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  if (panel._wlTrapFocus) panel.removeEventListener('keydown', panel._wlTrapFocus);
  if (panel._wlEscape) panel.removeEventListener('keydown', panel._wlEscape);
  if (panel._wlClickHandler) panel.removeEventListener('click', panel._wlClickHandler);

  // IMPORTANT: Restore focus BEFORE setting hidden attribute to avoid accessibility violation
  if (_wishlistPanelTrigger && typeof _wishlistPanelTrigger.focus === 'function') {
    _wishlistPanelTrigger.focus();
  }
  _wishlistPanelTrigger = null;

  // Set hidden after focus restoration
  panel.setAttribute('hidden', '');
}

function initWishlist() {
  try {
    var stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    var raw = Array.isArray(stored) ? stored : [];
    // Migrate old string-format items to object format
    _wishlistItems = raw.map(function (item) {
      if (typeof item === 'string') return { handle: item, discoveryRoom: null };
      return item;
    });
  } catch (e) {
    _wishlistItems = [];
  }
  updateWishlistBadge();
  syncAllWishlistToggles(document);

  // Single delegated listener for all wishlist interactions
  document.addEventListener('click', function (e) {
    // Open panel
    if (e.target.closest('[data-wishlist-open]')) {
      openWishlistPanel();
      return;
    }
    // Close panel
    if (e.target.closest('[data-wishlist-close]')) {
      closeWishlistPanel('button');
      return;
    }
    // Toggle (card or product panel)
    var toggle = e.target.closest('[data-wishlist-toggle]');
    if (toggle) {
      var handle = toggle.getAttribute('data-product-handle');
      var source = toggle.closest('#glass-panel') ? 'product_panel' : 'product_card';
      if (handle) toggleWishlistItem(handle, source, toggle);
      return;
    }
    // Remove from wishlist panel
    var removeBtn = e.target.closest('[data-wishlist-remove]');
    if (removeBtn) {
      var rHandle = removeBtn.getAttribute('data-product-handle');
      if (rHandle) {
        removeFromWishlist(rHandle, 'wishlist_panel');
        var card = removeBtn.closest('[data-wishlist-card]');
        if (card) card.parentNode.removeChild(card);
        // Show empty state if no cards remain
        var body = document.querySelector('[data-wishlist-body]');
        if (body && !body.querySelector('[data-wishlist-card]')) {
          renderWishlistPanel();
        }
      }
      return;
    }
    // View product from wishlist panel
    var viewBtn = e.target.closest('[data-wishlist-view]');
    if (viewBtn) {
      var vHandle = viewBtn.getAttribute('data-product-handle');
      if (vHandle) {
        trackImmersiveEvent('wishlist_view_product', { product_handle: vHandle });
        closeWishlistPanel();
        openProductPanel(vHandle, null);
      }
      return;
    }
  });
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Wishlist Panel Public API
 *
 * Provides functions for managing wishlist functionality in the immersive store.
 * All wishlist operations (add, remove, toggle, display) are exposed globally
 * to enable cross-module interactions.
 *
 * Private functions (_persistWishlist, _triggerHeartPulse, _flyToWishlist) remain
 * locally scoped as internal implementation details.
 *
 * @namespace ImmersiveWishlist
 */
if (typeof window !== 'undefined') {
  window.ImmersiveWishlist = {
    addToWishlist: addToWishlist,
    removeFromWishlist: removeFromWishlist,
    getWishlist: getWishlist,
    updateWishlistBadge: updateWishlistBadge,
    syncAllWishlistToggles: syncAllWishlistToggles,
    toggleWishlistItem: toggleWishlistItem,
    cacheWishlistProduct: cacheWishlistProduct,
    renderWishlistPanel: renderWishlistPanel,
    openWishlistPanel: openWishlistPanel,
    closeWishlistPanel: closeWishlistPanel,
    initWishlist: initWishlist,
  };

  // Backward-compatible global aliases for critical functions
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.openWishlistPanel = openWishlistPanel;
  window.closeWishlistPanel = closeWishlistPanel;
}
