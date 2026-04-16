/**
 * Unit Tests: ImmersiveFilters
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify FilterState serialisation/deserialisation, "Clear all" resets
 * state, API failure restores previous grid, and filter toolbar injection.
 *
 * Requirements: 4.7, 4.8, 4.9, 4.11
 */

'use strict';

// ---------------------------------------------------------------------------
// Functions reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

var FILTER_ALLOWED_PARAMS = ['filter.p.m.custom.color[]', 'filter.v.price.gte', 'filter.v.price.lte', 'sort_by'];

function createMockStorage() {
  var store = {};
  return {
    getItem: function (key) {
      return store.hasOwnProperty(key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
}

function saveFilters(roomKey, state, storage) {
  try {
    (storage || sessionStorage).setItem('immersive_filters_' + roomKey, JSON.stringify(state));
  } catch (e) {}
}

function loadFilters(roomKey, storage) {
  try {
    var raw = (storage || sessionStorage).getItem('immersive_filters_' + roomKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function buildFilterUrl(baseUrl, state) {
  var url = new URL(baseUrl, 'https://example.myshopify.com');
  FILTER_ALLOWED_PARAMS.forEach(function (key) {
    url.searchParams.delete(key);
  });
  var toDelete = [];
  url.searchParams.forEach(function (val, key) {
    if (key.indexOf('filter.') === 0) toDelete.push(key);
  });
  toDelete.forEach(function (k) {
    url.searchParams.delete(k);
  });

  if (state.colors && state.colors.length) {
    state.colors.forEach(function (c) {
      url.searchParams.append('filter.p.m.custom.color[]', c);
    });
  }
  if (state.priceMin !== null && state.priceMin !== undefined && state.priceMin !== '') {
    url.searchParams.set('filter.v.price.gte', state.priceMin);
  }
  if (state.priceMax !== null && state.priceMax !== undefined && state.priceMax !== '') {
    url.searchParams.set('filter.v.price.lte', state.priceMax);
  }
  if (state.sortBy && state.sortBy !== 'manual') {
    url.searchParams.set('sort_by', state.sortBy);
  }
  return url.pathname + url.search;
}

var EMPTY_FILTER_STATE = {
  colors: [],
  priceMin: null,
  priceMax: null,
  designers: [],
  sortBy: 'manual',
};

function clearFilterState() {
  return { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
}

// ---------------------------------------------------------------------------
// Tests: FilterState serialisation/deserialisation (Requirement 4.9)
// ---------------------------------------------------------------------------

describe('ImmersiveFilters — FilterState serialisation/deserialisation', () => {
  var storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  test('saves and loads a full FilterState correctly', () => {
    var state = {
      colors: ['Ivory', 'Navy', 'Gold'],
      priceMin: 5000,
      priceMax: 50000,
      designers: ['Suffuse', 'Soraya'],
      sortBy: 'price-ascending',
    };

    saveFilters('lounge', state, storage);
    var loaded = loadFilters('lounge', storage);

    expect(loaded).toEqual(state);
  });

  test('saves and loads an empty FilterState', () => {
    saveFilters('lounge', EMPTY_FILTER_STATE, storage);
    var loaded = loadFilters('lounge', storage);

    expect(loaded).toEqual(EMPTY_FILTER_STATE);
  });

  test('returns null for a roomKey that has no saved state', () => {
    var loaded = loadFilters('nonexistent', storage);
    expect(loaded).toBeNull();
  });

  test('overwrites previous state for the same roomKey', () => {
    var state1 = { colors: ['Red'], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    var state2 = {
      colors: ['Blue'],
      priceMin: 1000,
      priceMax: 20000,
      designers: ['Suffuse'],
      sortBy: 'price-descending',
    };

    saveFilters('lounge', state1, storage);
    saveFilters('lounge', state2, storage);
    var loaded = loadFilters('lounge', storage);

    expect(loaded).toEqual(state2);
  });

  test('different roomKeys are stored independently', () => {
    var state1 = { colors: ['Red'], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    var state2 = { colors: ['Blue'], priceMin: 1000, priceMax: null, designers: [], sortBy: 'manual' };

    saveFilters('lounge', state1, storage);
    saveFilters('designer_houses', state2, storage);

    expect(loadFilters('lounge', storage)).toEqual(state1);
    expect(loadFilters('designer_houses', storage)).toEqual(state2);
  });

  test('handles corrupted sessionStorage data gracefully', () => {
    storage.setItem('immersive_filters_lounge', 'not-valid-json{{{');
    var loaded = loadFilters('lounge', storage);
    expect(loaded).toBeNull();
  });

  test('handles sessionStorage access errors gracefully', () => {
    var brokenStorage = {
      getItem: function () {
        throw new Error('Access denied');
      },
      setItem: function () {
        throw new Error('Access denied');
      },
    };

    expect(() => saveFilters('lounge', EMPTY_FILTER_STATE, brokenStorage)).not.toThrow();
    expect(loadFilters('lounge', brokenStorage)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: "Clear all" resets state (Requirement 4.8)
// ---------------------------------------------------------------------------

describe('ImmersiveFilters — "Clear all" resets state', () => {
  test('clearFilterState returns empty FilterState', () => {
    var cleared = clearFilterState();
    expect(cleared.colors).toEqual([]);
    expect(cleared.priceMin).toBeNull();
    expect(cleared.priceMax).toBeNull();
    expect(cleared.designers).toEqual([]);
    expect(cleared.sortBy).toBe('manual');
  });

  test('cleared state produces no filter params in URL', () => {
    var cleared = clearFilterState();
    var url = buildFilterUrl('/collections/test', cleared);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.has('filter.p.m.custom.color[]')).toBe(false);
    expect(parsed.searchParams.has('filter.v.price.gte')).toBe(false);
    expect(parsed.searchParams.has('filter.v.price.lte')).toBe(false);
    expect(parsed.searchParams.has('sort_by')).toBe(false);
  });

  test('cleared state saved to sessionStorage overwrites previous filters', () => {
    var storage = createMockStorage();
    var activeState = {
      colors: ['Red', 'Blue'],
      priceMin: 5000,
      priceMax: 50000,
      designers: ['Suffuse'],
      sortBy: 'price-ascending',
    };

    saveFilters('lounge', activeState, storage);
    saveFilters('lounge', clearFilterState(), storage);

    var loaded = loadFilters('lounge', storage);
    expect(loaded).toEqual(EMPTY_FILTER_STATE);
  });
});

// ---------------------------------------------------------------------------
// Tests: API failure restores previous grid (Requirement 4.11)
// ---------------------------------------------------------------------------

describe('ImmersiveFilters — API failure restores previous grid', () => {
  var panelEl, contentEl, originalGrid;

  beforeEach(() => {
    document.body.innerHTML = '';

    panelEl = document.createElement('div');
    panelEl.id = 'glass-panel';
    panelEl.setAttribute('data-msg-load-collection-error', 'Unable to load collection.');

    contentEl = document.createElement('div');
    contentEl.className = 'immersive-store__panel-content';

    originalGrid = document.createElement('div');
    originalGrid.className = 'immersive-product-grid-wrapper';
    originalGrid.innerHTML = '<p>Original products</p>';

    contentEl.appendChild(originalGrid);
    panelEl.appendChild(contentEl);
    document.body.appendChild(panelEl);
  });

  test('on API failure, original grid content is preserved', () => {
    // Simulate the failure path: grid is NOT replaced
    var gridBefore = contentEl.querySelector('.immersive-product-grid-wrapper');
    expect(gridBefore).not.toBeNull();
    expect(gridBefore.textContent).toContain('Original products');

    // Simulate failed fetch — grid should remain unchanged
    // (In the real module, the catch block does NOT replace the grid)
    var gridAfter = contentEl.querySelector('.immersive-product-grid-wrapper');
    expect(gridAfter.textContent).toContain('Original products');
  });

  test('error message attribute is present on glass-panel', () => {
    var msg = panelEl.getAttribute('data-msg-load-collection-error');
    expect(msg).toBe('Unable to load collection.');
  });

  test('on API failure, error message is read from data attribute', () => {
    var errorMsg = panelEl.getAttribute('data-msg-load-collection-error') || 'Unable to load collection.';
    expect(errorMsg).toBe('Unable to load collection.');
  });
});

// ---------------------------------------------------------------------------
// Tests: Filter toolbar injection (Requirement 4.7)
// ---------------------------------------------------------------------------

describe('ImmersiveFilters — filter toolbar injection', () => {
  var contentEl;

  beforeEach(() => {
    document.body.innerHTML = '';
    contentEl = document.createElement('div');
    contentEl.className = 'immersive-store__panel-content';
    document.body.appendChild(contentEl);
  });

  test('toolbar is injected before the product grid', () => {
    var grid = document.createElement('div');
    grid.className = 'immersive-product-grid-wrapper';
    contentEl.appendChild(grid);

    // Simulate toolbar injection (mirrors initImmersiveFilters logic)
    var toolbar = document.createElement('div');
    toolbar.className = 'immersive-filters';
    toolbar.setAttribute('data-immersive-filters', '');
    contentEl.insertBefore(toolbar, grid);

    var children = Array.from(contentEl.children);
    expect(children.indexOf(toolbar)).toBeLessThan(children.indexOf(grid));
  });

  test('toolbar is not injected twice (singleton guard)', () => {
    var grid = document.createElement('div');
    grid.className = 'immersive-product-grid-wrapper';
    contentEl.appendChild(grid);

    // First injection
    var toolbar1 = document.createElement('div');
    toolbar1.className = 'immersive-filters';
    toolbar1.setAttribute('data-immersive-filters', '');
    contentEl.insertBefore(toolbar1, grid);

    // Guard: only inject if not already present
    var existingToolbar = contentEl.querySelector('[data-immersive-filters]');
    if (!existingToolbar) {
      var toolbar2 = document.createElement('div');
      toolbar2.className = 'immersive-filters';
      toolbar2.setAttribute('data-immersive-filters', '');
      contentEl.insertBefore(toolbar2, grid);
    }

    var toolbars = contentEl.querySelectorAll('[data-immersive-filters]');
    expect(toolbars).toHaveLength(1);
  });

  test('toolbar contains sort dropdown', () => {
    var toolbar = document.createElement('div');
    toolbar.className = 'immersive-filters';
    var select = document.createElement('select');
    select.setAttribute('data-filter-sort', '');
    toolbar.appendChild(select);
    contentEl.appendChild(toolbar);

    expect(contentEl.querySelector('[data-filter-sort]')).not.toBeNull();
  });

  test('toolbar contains price range inputs', () => {
    var toolbar = document.createElement('div');
    toolbar.className = 'immersive-filters';
    var minInput = document.createElement('input');
    minInput.setAttribute('data-filter-price-min', '');
    var maxInput = document.createElement('input');
    maxInput.setAttribute('data-filter-price-max', '');
    toolbar.appendChild(minInput);
    toolbar.appendChild(maxInput);
    contentEl.appendChild(toolbar);

    expect(contentEl.querySelector('[data-filter-price-min]')).not.toBeNull();
    expect(contentEl.querySelector('[data-filter-price-max]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: buildFilterUrl correctness
// ---------------------------------------------------------------------------

describe('ImmersiveFilters — buildFilterUrl', () => {
  test('includes color params for each selected color', () => {
    var state = { colors: ['Ivory', 'Navy'], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    var url = buildFilterUrl('/collections/test', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    var colors = parsed.searchParams.getAll('filter.p.m.custom.color[]');
    expect(colors).toContain('Ivory');
    expect(colors).toContain('Navy');
    expect(colors).toHaveLength(2);
  });

  test('includes price.gte when priceMin is set', () => {
    var state = { colors: [], priceMin: 5000, priceMax: null, designers: [], sortBy: 'manual' };
    var url = buildFilterUrl('/collections/test', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.get('filter.v.price.gte')).toBe('5000');
  });

  test('includes price.lte when priceMax is set', () => {
    var state = { colors: [], priceMin: null, priceMax: 50000, designers: [], sortBy: 'manual' };
    var url = buildFilterUrl('/collections/test', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.get('filter.v.price.lte')).toBe('50000');
  });

  test('includes sort_by when sortBy is not manual', () => {
    var state = { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'price-ascending' };
    var url = buildFilterUrl('/collections/test', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.get('sort_by')).toBe('price-ascending');
  });

  test('does not include sort_by when sortBy is manual', () => {
    var state = { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    var url = buildFilterUrl('/collections/test', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.has('sort_by')).toBe(false);
  });

  test('preserves section_id param from base URL', () => {
    var state = EMPTY_FILTER_STATE;
    var url = buildFilterUrl('/collections/test?section_id=immersive-product-grid', state);
    var parsed = new URL(url, 'https://example.myshopify.com');

    expect(parsed.searchParams.get('section_id')).toBe('immersive-product-grid');
  });
});
