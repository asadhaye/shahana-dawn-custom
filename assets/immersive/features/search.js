/**
 * Feature: search
 * TODO: Extract from immersive-store.js
 */

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

  // Room list for client-side fuzzy match
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

  function renderResults(apiResults, roomMatches) {
    dropdown.innerHTML = '';
    var hasContent = false;

    // Build flat list for keyboard nav
    _searchResults = [];

    // Products
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

    // Collections
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

    // Rooms (client-side)
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

  function buildResultEl(item, type, index) {
    var el = document.createElement('div');
    el.className = 'immersive-search__result';
    el.setAttribute('role', 'option');
    el.setAttribute('id', 'immersive-search-result-' + index);
    el.setAttribute('aria-selected', 'false');

    // Add icon based on type
    var iconType = type === 'collection' ? 'collection' : 'product';
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon(iconType);
    var iconEl = iconWrapper.firstChild;
    if (iconEl) {
      el.appendChild(iconEl);
    }

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

    // Add room icon
    var iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = getSearchResultIcon('room');
    var iconEl = iconWrapper.firstChild;
    if (iconEl) {
      el.appendChild(iconEl);
    }

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
    var prev = _searchActiveIndex;
    if (direction === 'down') {
      _searchActiveIndex = Math.min(_searchActiveIndex + 1, _searchResults.length - 1);
    } else {
      _searchActiveIndex = Math.max(_searchActiveIndex - 1, 0);
    }
    // Update aria-selected
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

    // Cancel previous request
    if (_searchAbortController) {
      try {
        _searchAbortController.abort();
      } catch (e) {}
    }

    var timeoutId = setTimeout(function () {
      // Show unavailable after 3s
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
        // Show room results only if API fails
        if (roomMatches.length) {
          renderResults({ products: [], collections: [] }, roomMatches);
        } else {
          dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
          dropdown.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
      });
  }

  // Input handler with debounce
  input.addEventListener('input', function () {
    clearTimeout(_searchDebounceTimer);
    var term = input.value.trim();
    _searchDebounceTimer = setTimeout(function () {
      doSearch(term);
    }, 200);
  });

  // Keyboard navigation
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

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  // Cmd/Ctrl+K global shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
  });
}

function openSearchPanel(encodedQuery) {
  var query = '';
  try {
    query = decodeURIComponent(encodedQuery);
  } catch (e) {
    query = encodedQuery;
  }
  if (!query) return;

  var path = shopRoot + 'search';
  var extraParams = { q: query };

  console.log('Searching for:', query);

  openGlassPanelWithSection(path, 'immersive-product-grid', extraParams, glassPanelId, function (panel) {
    // Panel-specific setup
    setupVariantButtons(panel);
    setupImageParallax(panel);
    syncAllWishlistToggles(panel);

    trackImmersiveEvent('search_panel_opened', { query: query });

    // Check if search returned no results and track friction
    var emptyState = panel.querySelector('[data-empty-state="search"]');
    if (emptyState) {
      trackFrictionPoint('search_no_results_exit', {
        query: query,
        room: immersiveState.currentRoom,
      });
    }

    // Panel click handler
    panel.onclick = function (event) {
      if (event.target === panel) {
        closePanel(panel, 'backdrop');
        return;
      }
      if (event.target.closest('.immersive-store__panel-close')) {
        closePanel(panel, 'button');
        return;
      }

      // Empty state action handling
      var emptyAction = event.target.closest('[data-empty-action]');
      if (emptyAction) {
        var action = emptyAction.getAttribute('data-empty-action');
        if (action) {
          handleEmptyStateAction(action);
        }
        return;
      }

      // Product card click
      var card = event.target.closest('.immersive-product-card');
      if (card) {
        var handle = card.getAttribute('data-product-handle');
        if (handle) {
          event.preventDefault();
          openProductPanel(handle, null);
        }
        return;
      }
    };
  });
}

function getSearchResultIcon(type) {
  // type: 'product' | 'collection' | 'room'
  // returns: SVG string

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

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Search Public API
 *
 * Provides functions for managing search functionality in the immersive store.
 * Includes predictive search with products, collections, and room suggestions.
 *
 * Private helper functions (focusSearch, closeDropdown, fuzzyMatchRooms, renderResults,
 * buildResultEl, buildRoomResultEl, selectResult, navigateResults, doSearch, getSearchResultIcon)
 * remain locally scoped as internal implementation details.
 *
 * @namespace ImmersiveSearch
 */
if (typeof window !== 'undefined') {
  window.ImmersiveSearch = {
    initImmersiveSearch: initImmersiveSearch,
    openSearchPanel: openSearchPanel,
  };

  // Backward-compatible global alias for critical function
  window.openSearchPanel = openSearchPanel;
}
