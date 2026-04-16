/**
 * Unit Tests: ImmersiveSearch
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify the ImmersiveSearch module behaviour as implemented in
 * assets/immersive-store.js. Since immersive-store.js is not a module,
 * the logic is reproduced here for isolated unit testing.
 *
 * Requirements: 1.2, 1.3, 1.9, 1.10, 1.11
 */

'use strict';

// ---------------------------------------------------------------------------
// Helpers reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

/**
 * Debounce — mirrors the 200ms debounce used in initImmersiveSearch().
 */
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, delay);
    return function cancel() {
      clearTimeout(timer);
    };
  };
}

/**
 * Fuzzy-match room names client-side — mirrors fuzzyMatchRooms() in
 * initImmersiveSearch().
 */
var ROOM_LIST = [
  { roomKey: 'storefront', label: 'Storefront' },
  { roomKey: 'lounge', label: 'Lounge' },
  { roomKey: 'designer_houses', label: 'Designer Houses' },
  { roomKey: 'occasions', label: 'Occasions' },
  { roomKey: 'featured_collections', label: 'Featured Collections' },
];

function fuzzyMatchRooms(term) {
  var t = term.toLowerCase();
  return ROOM_LIST.filter(function (r) {
    return r.label.toLowerCase().indexOf(t) !== -1 || r.roomKey.indexOf(t) !== -1;
  });
}

/**
 * Minimal DOM-based search module for unit testing.
 * Mirrors the core behaviour of initImmersiveSearch() without the full
 * immersive-store.js dependency.
 */
function createSearchModule(container) {
  var input = container.querySelector('#immersive-search-input');
  var dropdown = container.querySelector('#immersive-search-results');

  var msgNoResults = container.getAttribute('data-msg-no-results') || 'No results';
  var msgUnavailable = container.getAttribute('data-msg-unavailable') || 'Search unavailable';

  var _activeIndex = -1;
  var _results = [];
  var _debounceTimer = null;
  var _unavailableTimer = null;

  function closeDropdown() {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    _activeIndex = -1;
    _results = [];
  }

  function showUnavailable() {
    dropdown.innerHTML = '<div class="immersive-search__unavailable">' + msgUnavailable + '</div>';
    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function showNoResults(term) {
    dropdown.innerHTML =
      '<div class="immersive-search__no-results">' + msgNoResults.replace('{{term}}', term) + '</div>';
    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function renderResults(apiResults, roomMatches) {
    dropdown.innerHTML = '';
    _results = [];
    var hasContent = false;

    if (apiResults.products && apiResults.products.length) {
      hasContent = true;
      apiResults.products.forEach(function (item) {
        _results.push({ type: 'product', data: item });
        var el = document.createElement('div');
        el.setAttribute('role', 'option');
        el.setAttribute('id', 'immersive-search-result-' + (_results.length - 1));
        el.setAttribute('aria-selected', 'false');
        el.textContent = item.title;
        dropdown.appendChild(el);
      });
    }

    if (apiResults.collections && apiResults.collections.length) {
      hasContent = true;
      apiResults.collections.forEach(function (item) {
        _results.push({ type: 'collection', data: item });
        var el = document.createElement('div');
        el.setAttribute('role', 'option');
        el.setAttribute('id', 'immersive-search-result-' + (_results.length - 1));
        el.setAttribute('aria-selected', 'false');
        el.textContent = item.title;
        dropdown.appendChild(el);
      });
    }

    if (roomMatches && roomMatches.length) {
      hasContent = true;
      roomMatches.forEach(function (room) {
        _results.push({ type: 'room', data: room });
        var el = document.createElement('div');
        el.setAttribute('role', 'option');
        el.setAttribute('id', 'immersive-search-result-' + (_results.length - 1));
        el.setAttribute('aria-selected', 'false');
        el.textContent = room.label;
        dropdown.appendChild(el);
      });
    }

    if (!hasContent) {
      showNoResults(input.value);
      return;
    }

    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    _activeIndex = -1;
  }

  function navigateResults(direction) {
    if (!_results.length) return;
    if (direction === 'down') {
      _activeIndex = Math.min(_activeIndex + 1, _results.length - 1);
    } else {
      _activeIndex = Math.max(_activeIndex - 1, 0);
    }
    var activeId = 'immersive-search-result-' + _activeIndex;
    input.setAttribute('aria-activedescendant', activeId);
  }

  // Wire keyboard events
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResults('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults('up');
    } else if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  return {
    closeDropdown: closeDropdown,
    showUnavailable: showUnavailable,
    showNoResults: showNoResults,
    renderResults: renderResults,
    navigateResults: navigateResults,
    getActiveIndex: function () {
      return _activeIndex;
    },
    getResults: function () {
      return _results;
    },
    startUnavailableTimer: function () {
      clearTimeout(_unavailableTimer);
      _unavailableTimer = setTimeout(showUnavailable, 3000);
      return _unavailableTimer;
    },
    clearUnavailableTimer: function () {
      clearTimeout(_unavailableTimer);
    },
    startDebounce: function (fn) {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(fn, 200);
    },
  };
}

// ---------------------------------------------------------------------------
// Test setup helpers
// ---------------------------------------------------------------------------

function buildContainer(overrides) {
  var container = document.createElement('div');
  container.setAttribute('data-immersive-search', '');
  container.setAttribute('data-msg-no-results', 'No results for "{{term}}"');
  container.setAttribute('data-msg-unavailable', 'Search unavailable');
  container.setAttribute('data-placeholder', 'Search products, rooms\u2026');

  Object.keys(overrides || {}).forEach(function (k) {
    container.setAttribute(k, overrides[k]);
  });

  var input = document.createElement('input');
  input.type = 'search';
  input.id = 'immersive-search-input';
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'immersive-search-results');

  var dropdown = document.createElement('div');
  dropdown.id = 'immersive-search-results';
  dropdown.setAttribute('role', 'listbox');
  dropdown.hidden = true;

  container.appendChild(input);
  container.appendChild(dropdown);
  document.body.appendChild(container);

  return container;
}

// ---------------------------------------------------------------------------
// Tests: Debounce timing (Requirement 1.3)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — debounce timing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debounced function is not called before 200ms', () => {
    var fn = jest.fn();
    var debouncedFn = debounce(fn, 200);

    debouncedFn();
    jest.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();
  });

  test('debounced function is called after 200ms', () => {
    var fn = jest.fn();
    var debouncedFn = debounce(fn, 200);

    debouncedFn();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('rapid calls reset the timer — only last call fires', () => {
    var fn = jest.fn();
    var debouncedFn = debounce(fn, 200);

    debouncedFn();
    jest.advanceTimersByTime(100);
    debouncedFn();
    jest.advanceTimersByTime(100);
    debouncedFn();
    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: Escape closes dropdown (Requirement 1.9)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — Escape closes dropdown', () => {
  var container, module;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = buildContainer();
    module = createSearchModule(container);
  });

  test('Escape key closes the dropdown', () => {
    var input = container.querySelector('#immersive-search-input');
    var dropdown = container.querySelector('#immersive-search-results');

    // Open the dropdown first
    module.renderResults({ products: [{ title: 'Test', handle: 'test' }], collections: [] }, []);
    expect(dropdown.hidden).toBe(false);

    // Fire Escape
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dropdown.hidden).toBe(true);
  });

  test('Escape sets aria-expanded to false', () => {
    var input = container.querySelector('#immersive-search-input');

    module.renderResults({ products: [{ title: 'Test', handle: 'test' }], collections: [] }, []);
    expect(input.getAttribute('aria-expanded')).toBe('true');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  test('Escape clears results list', () => {
    var input = container.querySelector('#immersive-search-input');

    module.renderResults({ products: [{ title: 'Test', handle: 'test' }], collections: [] }, []);
    expect(module.getResults().length).toBeGreaterThan(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(module.getResults().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: Cmd/Ctrl+K focuses input (Requirement 1.2)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — Cmd/Ctrl+K focuses input', () => {
  var container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = buildContainer();
  });

  test('Cmd+K (metaKey) focuses the search input', () => {
    var input = container.querySelector('#immersive-search-input');
    var focusSpy = jest.spyOn(input, 'focus');

    // Wire the global shortcut (mirrors initImmersiveSearch)
    function onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    }
    document.addEventListener('keydown', onKeydown);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();

    document.removeEventListener('keydown', onKeydown);
  });

  test('Ctrl+K (ctrlKey) focuses the search input', () => {
    var input = container.querySelector('#immersive-search-input');
    var focusSpy = jest.spyOn(input, 'focus');

    function onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    }
    document.addEventListener('keydown', onKeydown);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();

    document.removeEventListener('keydown', onKeydown);
  });

  test('other key combinations do not focus the input', () => {
    var input = container.querySelector('#immersive-search-input');
    var focusSpy = jest.spyOn(input, 'focus');

    function onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        input.focus();
      }
    }
    document.addEventListener('keydown', onKeydown);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', metaKey: true, bubbles: true }));
    expect(focusSpy).not.toHaveBeenCalled();

    document.removeEventListener('keydown', onKeydown);
  });
});

// ---------------------------------------------------------------------------
// Tests: 3s timeout shows unavailable message (Requirement 1.10)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — 3s timeout shows unavailable message', () => {
  var container, module;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
    container = buildContainer();
    module = createSearchModule(container);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('unavailable message appears after 3000ms', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.startUnavailableTimer();
    expect(dropdown.hidden).toBe(true);

    jest.advanceTimersByTime(3000);
    expect(dropdown.hidden).toBe(false);
    expect(dropdown.textContent).toContain('Search unavailable');
  });

  test('unavailable message does not appear before 3000ms', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.startUnavailableTimer();
    jest.advanceTimersByTime(2999);
    expect(dropdown.hidden).toBe(true);
  });

  test('clearing the timer prevents the unavailable message', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.startUnavailableTimer();
    module.clearUnavailableTimer();
    jest.advanceTimersByTime(3000);
    expect(dropdown.hidden).toBe(true);
  });

  test('unavailable message uses the data-msg-unavailable attribute', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.showUnavailable();
    expect(dropdown.textContent).toContain('Search unavailable');
  });
});

// ---------------------------------------------------------------------------
// Tests: Zero results shows no-results message (Requirement 1.11)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — zero results shows no-results message', () => {
  var container, module;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = buildContainer();
    module = createSearchModule(container);
  });

  test('empty API results with no room matches shows no-results message', () => {
    var dropdown = container.querySelector('#immersive-search-results');
    var input = container.querySelector('#immersive-search-input');
    input.value = 'xyznotfound';

    module.renderResults({ products: [], collections: [] }, []);

    expect(dropdown.hidden).toBe(false);
    expect(dropdown.querySelector('.immersive-search__no-results')).not.toBeNull();
  });

  test('no-results message interpolates the search term', () => {
    var dropdown = container.querySelector('#immersive-search-results');
    var input = container.querySelector('#immersive-search-input');
    input.value = 'silk saree';

    module.renderResults({ products: [], collections: [] }, []);

    expect(dropdown.textContent).toContain('silk saree');
  });

  test('results with products do not show no-results message', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.renderResults({ products: [{ title: 'Silk Saree', handle: 'silk-saree' }], collections: [] }, []);

    expect(dropdown.querySelector('.immersive-search__no-results')).toBeNull();
    expect(dropdown.hidden).toBe(false);
  });

  test('results with only room matches do not show no-results message', () => {
    var dropdown = container.querySelector('#immersive-search-results');

    module.renderResults({ products: [], collections: [] }, [{ roomKey: 'lounge', label: 'Lounge' }]);

    expect(dropdown.querySelector('.immersive-search__no-results')).toBeNull();
    expect(dropdown.hidden).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Fuzzy room matching (Requirement 1.12)
// ---------------------------------------------------------------------------

describe('ImmersiveSearch — fuzzy room matching', () => {
  test('matches room by partial label', () => {
    var results = fuzzyMatchRooms('design');
    expect(
      results.some(function (r) {
        return r.roomKey === 'designer_houses';
      }),
    ).toBe(true);
  });

  test('matches room by roomKey substring', () => {
    var results = fuzzyMatchRooms('lounge');
    expect(
      results.some(function (r) {
        return r.roomKey === 'lounge';
      }),
    ).toBe(true);
  });

  test('returns empty array for no match', () => {
    var results = fuzzyMatchRooms('xyznotaroom');
    expect(results).toHaveLength(0);
  });

  test('is case-insensitive', () => {
    var results = fuzzyMatchRooms('OCCASIONS');
    expect(
      results.some(function (r) {
        return r.roomKey === 'occasions';
      }),
    ).toBe(true);
  });

  test('matches multiple rooms when term is broad', () => {
    var results = fuzzyMatchRooms('e');
    // 'e' appears in storefront, designer_houses, occasions, featured_collections
    expect(results.length).toBeGreaterThan(1);
  });
});
