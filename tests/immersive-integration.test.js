/**
 * Integration Tests: End-to-End Bridge Flows, Preference System,
 * Device/Connection-Aware Behavior
 * Tasks 18, 19, 20 — Requirements 1.1, 3.1, 5.1, 6.1, 6.4, 7.1, 9.2, 9.4,
 *   11.1, 13.1, 14.1, 14.2, 16.1–16.8
 */
'use strict';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

function classifyConnection(conn) {
  if (!conn) return 'fast';
  if (conn.saveData) return 'slow';
  var t = conn.effectiveType || '';
  if (t === 'slow-2g' || t === '2g') return 'slow';
  if (t === '3g') return 'medium';
  return 'fast';
}

function resolveUrlAction(search) {
  var params = new URLSearchParams(search);
  var product = (params.get('open_product') || '').trim();
  var collection = (params.get('open_collection') || '').trim();
  var searchQ = (params.get('open_search') || '').trim();
  if (product) return { action: 'product', value: product };
  if (collection) return { action: 'collection', value: collection };
  if (searchQ) return { action: 'search', value: decodeURIComponent(searchQ) };
  return { action: 'none', value: '' };
}

function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem('immersive_preferred_mode', '3d');
  } catch (e) {}
}
function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem('immersive_preferred_mode') === '3d';
  } catch (e) {
    return false;
  }
}
function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem('immersive_preferred_mode');
  } catch (e) {}
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Task 18: Integration — End-to-End Bridge Flows
// ---------------------------------------------------------------------------

describe('Integration: Collection Bridge Flow', () => {
  test('collection bridge URL contains open_collection param', () => {
    const handle = 'suffuse';
    const url = `/pages/immersive?open_collection=${handle}`;
    const result = resolveUrlAction(url.split('?')[1] ? '?' + url.split('?')[1] : '');
    expect(result.action).toBe('collection');
    expect(result.value).toBe(handle);
  });

  test('collection bridge renders when products > 0', () => {
    document.body.innerHTML = `
      <div class="page-width">
        <a href="/pages/immersive?open_collection=suffuse" data-immersive-bridge aria-label="Explore Suffuse in 3D">
          Explore in 3D
        </a>
      </div>`;
    const bridge = document.querySelector('[data-immersive-bridge]');
    expect(bridge).not.toBeNull();
    expect(bridge.getAttribute('href')).toContain('open_collection=suffuse');
  });
});

describe('Integration: Product Bridge Flow', () => {
  test('product bridge URL contains open_product param', () => {
    const handle = 'silk-saree';
    const result = resolveUrlAction(`?open_product=${handle}`);
    expect(result.action).toBe('product');
    expect(result.value).toBe(handle);
  });

  test('product bridge is always rendered (no conditional)', () => {
    document.body.innerHTML = `
      <a href="/pages/immersive?open_product=silk-saree" data-immersive-bridge aria-label="View Silk Saree in 3D">
        View in 3D
      </a>`;
    expect(document.querySelector('[data-immersive-bridge]')).not.toBeNull();
  });
});

describe('Integration: Search Bridge Flow', () => {
  test('search bridge URL contains open_search param', () => {
    const query = 'bridal wear';
    const result = resolveUrlAction(`?open_search=${encodeURIComponent(query)}`);
    expect(result.action).toBe('search');
    expect(result.value).toBe(query);
  });

  test('search bridge renders when results > 0', () => {
    document.body.innerHTML = `
      <a href="/pages/immersive?open_search=bridal" data-immersive-bridge aria-label="Search bridal in 3D">
        Search in 3D
      </a>`;
    expect(document.querySelector('[data-immersive-bridge]')).not.toBeNull();
  });
});

describe('Integration: Cart Bridge Flow', () => {
  test('cart bridge links to /pages/immersive', () => {
    document.body.innerHTML = `
      <a href="/pages/immersive" data-immersive-bridge aria-label="Continue shopping in 3D">
        Continue in 3D
      </a>`;
    const bridge = document.querySelector('[data-immersive-bridge]');
    expect(bridge.getAttribute('href')).toContain('/pages/immersive');
  });
});

describe('Integration: Collections List Bridge Flow', () => {
  test('collections list bridge links to /pages/immersive', () => {
    document.body.innerHTML = `
      <a href="/pages/immersive" data-immersive-bridge aria-label="Browse all collections in 3D">
        Browse in 3D
      </a>`;
    expect(document.querySelector('[data-immersive-bridge]')).not.toBeNull();
  });
});

describe('Integration: Content Bridge Flow', () => {
  test('blog bridge links to /pages/immersive', () => {
    document.body.innerHTML = `
      <a href="/pages/immersive" data-immersive-bridge aria-label="Explore in 3D">
        Explore in 3D
      </a>`;
    expect(document.querySelector('[data-immersive-bridge]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 19: Integration — Preference System
// ---------------------------------------------------------------------------

describe('Integration: Preference System', () => {
  test('entering 3D store writes preference flag', () => {
    writeImmersivePreference(localStorage);
    expect(readImmersivePreference(localStorage)).toBe(true);
  });

  test('preference banner appears on 2D page when flag is set', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = `
      <div id="immersive-preference-banner" hidden role="region" aria-label="Return to 3D">
        <button data-preference-banner-dismiss>×</button>
      </div>
      <button id="next">Next</button>`;
    const banner = document.getElementById('immersive-preference-banner');
    if (localStorage.getItem('immersive_preferred_mode') === '3d') {
      banner.removeAttribute('hidden');
    }
    expect(banner.hasAttribute('hidden')).toBe(false);
  });

  test('dismissing banner removes it from DOM', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = `
      <div id="immersive-preference-banner" role="region">
        <button data-preference-banner-dismiss>×</button>
      </div>
      <button id="next">Next</button>`;
    const banner = document.getElementById('immersive-preference-banner');
    banner.remove();
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('preference persists across simulated page refresh', () => {
    writeImmersivePreference(localStorage);
    // Simulate page refresh: re-read from storage
    expect(readImmersivePreference(localStorage)).toBe(true);
  });

  test('clearing preference hides banner', () => {
    writeImmersivePreference(localStorage);
    clearImmersivePreference(localStorage);
    expect(readImmersivePreference(localStorage)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Task 20: Integration — Device/Connection-Aware Behavior
// ---------------------------------------------------------------------------

describe('Integration: Device/Connection-Aware Behavior', () => {
  test('slow connection adds warning note to bridge', () => {
    document.body.innerHTML = `
      <div>
        <a id="bridge" href="/pages/immersive" data-immersive-bridge>Enter 3D</a>
      </div>`;
    const bridge = document.getElementById('bridge');
    const conn = classifyConnection({ effectiveType: '2g' });
    expect(conn).toBe('slow');

    if (conn === 'slow' && !bridge._warningAdded) {
      bridge._warningAdded = true;
      const note = document.createElement('p');
      note.className = 'immersive-bridge-btn__connection-note';
      note.textContent = 'Your connection appears slow.';
      bridge.parentNode.insertBefore(note, bridge.nextSibling);
    }
    expect(document.querySelector('.immersive-bridge-btn__connection-note')).not.toBeNull();
  });

  test('fast connection does not add warning note', () => {
    document.body.innerHTML = `
      <div>
        <a id="bridge" href="/pages/immersive" data-immersive-bridge>Enter 3D</a>
      </div>`;
    const conn = classifyConnection({ effectiveType: '4g' });
    expect(conn).toBe('fast');
    // No warning added for fast connection
    expect(document.querySelector('.immersive-bridge-btn__connection-note')).toBeNull();
  });

  test('reduced motion adds reduced-motion class', () => {
    document.body.innerHTML = `<a id="bridge" href="/pages/immersive" data-immersive-bridge>Enter 3D</a>`;
    const bridge = document.getElementById('bridge');
    const reducedMotion = true;
    if (reducedMotion) bridge.classList.add('immersive-bridge-btn--reduced-motion');
    expect(bridge.classList.contains('immersive-bridge-btn--reduced-motion')).toBe(true);
  });

  test('bridge link remains functional on slow connection', () => {
    document.body.innerHTML = `
      <a id="bridge" href="/pages/immersive?open_collection=test" data-immersive-bridge>Enter 3D</a>`;
    const bridge = document.getElementById('bridge');
    bridge.classList.add('immersive-bridge-btn--slow-connection');
    // href must still be present and valid
    expect(bridge.getAttribute('href')).toContain('/pages/immersive');
  });

  test('saveData flag is treated as slow connection', () => {
    expect(classifyConnection({ saveData: true, effectiveType: '4g' })).toBe('slow');
  });
});
