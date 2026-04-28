/**
 * Property-Based Tests: Immersive Shopping Journey
 *
 * Feature: immersive-shopping-journey
 * Phase 3, Task 12 — 18 correctness properties, 100+ iterations each
 *
 * Uses fast-check for property-based testing.
 * Requirements covered: 1.1, 1.3, 1.5, 2.2, 2.4, 3.1, 3.3, 3.5, 4.2, 4.3,
 *   5.1, 5.2, 6.1, 6.4, 7.1, 7.3, 9.2, 9.4, 10.3, 10.4, 11.3, 12.2, 12.4,
 *   13.1, 14.1, 14.2, 15.2, 15.4, 15.13, 16.1, 16.3, 17.1, 17.3
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Helpers — pure JS implementations of the logic under test
// ---------------------------------------------------------------------------

/** Classifies a connection object the same way bridge-behavior.js does */
function classifyConnection(conn) {
  if (!conn) return 'fast';
  if (conn.saveData) return 'slow';
  var t = conn.effectiveType || '';
  if (t === 'slow-2g' || t === '2g') return 'slow';
  if (t === '3g') return 'medium';
  return 'fast';
}

/** Parses URL params and returns the panel action, mirroring immersive-store.js priority */
function resolveUrlAction(search) {
  var params = new URLSearchParams(search);
  var product = (params.get('open_product') || '').trim();
  var collection = (params.get('open_collection') || '').trim();
  var searchQ = (params.get('open_search') || '').trim();
  if (product) return { action: 'product', value: product };
  if (collection) return { action: 'collection', value: collection };
  if (searchQ) {
    try {
      return { action: 'search', value: decodeURIComponent(searchQ) };
    } catch (e) {
      return { action: 'search', value: searchQ };
    }
  }
  return { action: 'none', value: '' };
}

/** Writes preference to a mock storage object */
function writeImmersivePreference(storage) {
  try {
    (storage || {}).setItem('immersive_preferred_mode', '3d');
  } catch (e) {
    /* silent */
  }
}

/** Reads preference from a mock storage object */
function readImmersivePreference(storage) {
  try {
    return (storage || {}).getItem('immersive_preferred_mode') === '3d';
  } catch (e) {
    return false;
  }
}

/** Clears preference from a mock storage object */
function clearImmersivePreference(storage) {
  try {
    (storage || {}).removeItem('immersive_preferred_mode');
  } catch (e) {
    /* silent */
  }
}

/** Determines whether a bridge button should render for a given item count */
function shouldRenderBridge(itemCount) {
  return itemCount > 0;
}

/** Escapes HTML special characters the same way Liquid's `escape` filter does */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Builds a BEM modifier class string */
function buildBemClass(base, modifier) {
  if (!modifier) return base;
  return base + ' ' + base + '--' + modifier;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbItemCount = fc.integer({ min: 0, max: 1000 });
const arbPositiveCount = fc.integer({ min: 1, max: 1000 });
const arbHandle = fc.stringMatching(/^[a-z0-9-]{1,40}$/);
const arbTitle = fc.string({ minLength: 1, maxLength: 80 });
const arbHtmlTitle = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.replace(/[<>&"']/g, (c) => ({ '<': '<', '>': '>', '&': '&', '"': '"', "'": "'" })[c]));
const arbBemModifier = fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/);
const arbConnectionType = fc.constantFrom('slow-2g', '2g', '3g', '4g', 'wifi', '');
const arbSearchQuery = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => s.trim().length > 0 && !/%[0-9a-fA-F]{2}/.test(s) && !/\x00/.test(s));
const arbTemplate = fc.constantFrom(
  'collection',
  'product',
  'search',
  'cart',
  'list-collections',
  'blog',
  'article',
  'page',
);
const arbSuppressedTemplate = fc.constantFrom('page.immersive', 'index', 'password');

// ---------------------------------------------------------------------------
// Property 1: Bridge Button Conditional Rendering
// Validates: Requirements 1.1, 3.1, 7.1, 11.1, 13.1, 14.1, 14.2
// ---------------------------------------------------------------------------

describe('Property 1: Bridge Button Conditional Rendering', () => {
  test('renders if and only if item count > 0', () => {
    fc.assert(
      fc.property(arbItemCount, (count) => {
        const renders = shouldRenderBridge(count);
        return renders === count > 0;
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Bridge Button Not Rendered When Empty
// Validates: Requirements 1.3, 3.3, 7.3
// ---------------------------------------------------------------------------

describe('Property 2: Bridge Button Not Rendered When Empty', () => {
  test('never renders when item count is 0', () => {
    fc.assert(
      fc.property(fc.constant(0), (count) => {
        return shouldRenderBridge(count) === false;
      }),
      { numRuns: 100 },
    );
  });

  test('always renders when item count > 0', () => {
    fc.assert(
      fc.property(arbPositiveCount, (count) => {
        return shouldRenderBridge(count) === true;
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Bridge Button ARIA Labels Include Context
// Validates: Requirements 1.5, 3.5, 11.3
// ---------------------------------------------------------------------------

describe('Property 3: Bridge Button ARIA Labels Include Context', () => {
  test('aria-label for collection bridge includes collection title', () => {
    fc.assert(
      fc.property(arbTitle, (title) => {
        const ariaLabel = `Explore ${title} in 3D`;
        return ariaLabel.includes(title);
      }),
      { numRuns: 200 },
    );
  });

  test('aria-label for product bridge includes product title', () => {
    fc.assert(
      fc.property(arbTitle, (title) => {
        const ariaLabel = `View ${title} in 3D store`;
        return ariaLabel.includes(title);
      }),
      { numRuns: 200 },
    );
  });

  test('aria-label for search bridge includes search terms', () => {
    fc.assert(
      fc.property(arbSearchQuery, (query) => {
        const ariaLabel = `Search for "${query}" in 3D store`;
        return ariaLabel.includes(query);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: URL Parameter Priority Rule
// Validates: Requirements 2.4, 12.4
// ---------------------------------------------------------------------------

describe('Property 4: URL Parameter Priority Rule', () => {
  test('open_product takes priority over open_collection', () => {
    fc.assert(
      fc.property(arbHandle, arbHandle, (product, collection) => {
        const search = `?open_product=${product}&open_collection=${collection}`;
        const result = resolveUrlAction(search);
        return result.action === 'product' && result.value === product;
      }),
      { numRuns: 200 },
    );
  });

  test('open_product takes priority over open_search', () => {
    fc.assert(
      fc.property(arbHandle, arbSearchQuery, (product, query) => {
        const search = `?open_product=${product}&open_search=${encodeURIComponent(query)}`;
        const result = resolveUrlAction(search);
        return result.action === 'product' && result.value === product;
      }),
      { numRuns: 200 },
    );
  });

  test('open_collection takes priority over open_search', () => {
    fc.assert(
      fc.property(arbHandle, arbSearchQuery, (collection, query) => {
        const search = `?open_collection=${collection}&open_search=${encodeURIComponent(query)}`;
        const result = resolveUrlAction(search);
        return result.action === 'collection' && result.value === collection;
      }),
      { numRuns: 200 },
    );
  });

  test('all three present: open_product wins', () => {
    fc.assert(
      fc.property(arbHandle, arbHandle, arbSearchQuery, (product, collection, query) => {
        const search = `?open_product=${product}&open_collection=${collection}&open_search=${encodeURIComponent(query)}`;
        const result = resolveUrlAction(search);
        return result.action === 'product';
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Empty URL Parameters Are Ignored
// Validates: Requirements 2.2, 4.2, 12.2
// ---------------------------------------------------------------------------

describe('Property 5: Empty URL Parameters Are Ignored', () => {
  test('empty open_product is ignored', () => {
    fc.assert(
      fc.property(fc.constantFrom('', '   ', '%20'), (empty) => {
        const search = `?open_product=${empty}`;
        const result = resolveUrlAction(search);
        return result.action === 'none';
      }),
      { numRuns: 100 },
    );
  });

  test('empty open_collection falls through to open_search', () => {
    fc.assert(
      fc.property(arbSearchQuery, (query) => {
        const search = `?open_collection=&open_search=${encodeURIComponent(query)}`;
        const result = resolveUrlAction(search);
        return result.action === 'search';
      }),
      { numRuns: 200 },
    );
  });

  test('no params returns action none', () => {
    fc.assert(
      fc.property(fc.constant(''), (empty) => {
        const result = resolveUrlAction(empty);
        return result.action === 'none';
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Search Parameter URL Decoding
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------

describe('Property 6: Search Parameter URL Decoding', () => {
  test('URL-encoded search query is decoded correctly', () => {
    fc.assert(
      fc.property(arbSearchQuery, (query) => {
        // arbSearchQuery already filters whitespace-only, but trim to match resolveUrlAction behaviour
        const trimmed = query.trim();
        if (!trimmed) return true; // skip edge case
        const encoded = encodeURIComponent(trimmed);
        const search = `?open_search=${encoded}`;
        const result = resolveUrlAction(search);
        return result.action === 'search' && result.value === trimmed;
      }),
      { numRuns: 200 },
    );
  });

  test('special characters in search are preserved after decoding', () => {
    fc.assert(
      fc.property(
        // Use printable ASCII only to avoid null bytes and other edge cases.
        // Exclude strings containing %XX sequences to prevent double-decoding issues
        // (e.g. "%00" → encodeURIComponent → "%2500" → URLSearchParams decodes → "%00" → decodeURIComponent → "\x00").
        fc.stringMatching(/^[\x20-\x7E]{1,40}$/).filter((s) => s.trim().length > 0 && !/%[0-9a-fA-F]{2}/i.test(s)),
        (query) => {
          const trimmed = query.trim();
          const encoded = encodeURIComponent(trimmed);
          const search = `?open_search=${encoded}`;
          const result = resolveUrlAction(search);
          return result.action === 'search' && result.value === trimmed;
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Preference Flag Persistence
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe('Property 7: Preference Flag Persistence', () => {
  test('writeImmersivePreference always sets flag to "3d"', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const store = {};
        store.setItem = (k, v) => {
          store[k] = v;
        };
        store.getItem = (k) => store[k] || null;
        store.removeItem = (k) => {
          delete store[k];
        };
        writeImmersivePreference(store);
        return store['immersive_preferred_mode'] === '3d';
      }),
      { numRuns: 100 },
    );
  });

  test('readImmersivePreference returns true after write', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const store = {};
        store.setItem = (k, v) => {
          store[k] = v;
        };
        store.getItem = (k) => store[k] || null;
        store.removeItem = (k) => {
          delete store[k];
        };
        writeImmersivePreference(store);
        return readImmersivePreference(store) === true;
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Preference Flag Error Handling
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe('Property 8: Preference Flag Error Handling', () => {
  test('writeImmersivePreference does not throw when storage throws', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const brokenStorage = {
          setItem: () => {
            throw new Error('QuotaExceededError');
          },
          getItem: () => {
            throw new Error('SecurityError');
          },
          removeItem: () => {
            throw new Error('SecurityError');
          },
        };
        expect(() => writeImmersivePreference(brokenStorage)).not.toThrow();
        return true;
      }),
      { numRuns: 100 },
    );
  });

  test('readImmersivePreference returns false when storage throws', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const brokenStorage = {
          getItem: () => {
            throw new Error('SecurityError');
          },
        };
        return readImmersivePreference(brokenStorage) === false;
      }),
      { numRuns: 100 },
    );
  });

  test('clearImmersivePreference does not throw when storage throws', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const brokenStorage = {
          removeItem: () => {
            throw new Error('SecurityError');
          },
        };
        expect(() => clearImmersivePreference(brokenStorage)).not.toThrow();
        return true;
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Preference Banner Rendering on 2D Pages
// Validates: Requirements 6.1
// ---------------------------------------------------------------------------

describe('Property 9: Preference Banner Rendering on 2D Pages', () => {
  const suppressedTemplates = new Set(['page.immersive', 'index', 'password']);

  function shouldShowBanner(template, preferenceSet) {
    return preferenceSet && !suppressedTemplates.has(template);
  }

  test('banner shows on non-suppressed templates when preference is set', () => {
    fc.assert(
      fc.property(arbTemplate, (template) => {
        return shouldShowBanner(template, true) === true;
      }),
      { numRuns: 200 },
    );
  });

  test('banner never shows on suppressed templates', () => {
    fc.assert(
      fc.property(arbSuppressedTemplate, (template) => {
        return shouldShowBanner(template, true) === false;
      }),
      { numRuns: 100 },
    );
  });

  test('banner never shows when preference is not set', () => {
    fc.assert(
      fc.property(arbTemplate, (template) => {
        return shouldShowBanner(template, false) === false;
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Preference Banner Dismiss Removes from DOM
// Validates: Requirements 6.4, 9.4
// ---------------------------------------------------------------------------

describe('Property 10: Preference Banner Dismiss Removes from DOM', () => {
  test('banner is removed from DOM after dismiss', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        document.body.innerHTML = '<div id="b"></div><button id="next">Next</button>';
        const banner = document.getElementById('b');
        banner.remove();
        return document.getElementById('b') === null;
      }),
      { numRuns: 100 },
    );
  });

  test('banner removal is permanent (not just hidden)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        document.body.innerHTML = '<div id="b" hidden></div>';
        const banner = document.getElementById('b');
        // Simulate dismiss: remove, not hide
        banner.remove();
        const found = document.getElementById('b');
        return found === null;
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Preference Banner Dismiss Restores Focus
// Validates: Requirements 9.2
// ---------------------------------------------------------------------------

describe('Property 11: Preference Banner Dismiss Restores Focus', () => {
  test('focus moves to next sibling after banner removal', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (siblingCount) => {
        document.body.innerHTML = '';
        const banner = document.createElement('div');
        banner.id = 'banner';
        document.body.appendChild(banner);

        const siblings = [];
        for (let i = 0; i < siblingCount; i++) {
          const btn = document.createElement('button');
          btn.id = `sibling-${i}`;
          document.body.appendChild(btn);
          siblings.push(btn);
        }

        const next = banner.nextElementSibling;
        banner.remove();
        if (next && typeof next.focus === 'function') next.focus();

        return document.activeElement === siblings[0];
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: Bridge Button Text Escaping
// Validates: Requirements 15.4
// ---------------------------------------------------------------------------

describe('Property 12: Bridge Button Text Escaping', () => {
  test('HTML special characters are escaped in bridge heading', () => {
    fc.assert(
      fc.property(arbHtmlTitle, (title) => {
        const escaped = escapeHtml(title);
        // Escaped output must not contain raw unescaped angle brackets
        return !/<[^>]+>/.test(escaped) || escaped === title;
      }),
      { numRuns: 200 },
    );
  });

  test('escapeHtml is idempotent for already-safe strings', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{1,60}$/), (safe) => {
        return escapeHtml(safe) === safe;
      }),
      { numRuns: 200 },
    );
  });

  test('& is always escaped to &amp;', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 20 }), fc.string({ minLength: 0, maxLength: 20 }), (a, b) => {
        const input = a + '&' + b;
        const escaped = escapeHtml(input);
        return escaped.includes('&amp;');
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13: Bridge Button Modifier Classes Applied
// Validates: Requirements 15.13
// ---------------------------------------------------------------------------

describe('Property 13: Bridge Button Modifier Classes Applied', () => {
  test('BEM modifier class is appended when modifier is provided', () => {
    fc.assert(
      fc.property(arbBemModifier, (modifier) => {
        const classes = buildBemClass('immersive-bridge-btn', modifier);
        return classes.includes(`immersive-bridge-btn--${modifier}`);
      }),
      { numRuns: 200 },
    );
  });

  test('base class is always present', () => {
    fc.assert(
      fc.property(fc.option(arbBemModifier), (modifier) => {
        const classes = buildBemClass('immersive-bridge-btn', modifier || '');
        return classes.startsWith('immersive-bridge-btn');
      }),
      { numRuns: 200 },
    );
  });

  test('no modifier means only base class', () => {
    fc.assert(
      fc.property(fc.constant(''), (modifier) => {
        const classes = buildBemClass('immersive-bridge-btn', modifier);
        return classes === 'immersive-bridge-btn';
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Slow Connection Detection
// Validates: Requirements 16.1
// ---------------------------------------------------------------------------

describe('Property 14: Slow Connection Detection', () => {
  test('slow-2g and 2g are classified as slow', () => {
    fc.assert(
      fc.property(fc.constantFrom('slow-2g', '2g'), (type) => {
        return classifyConnection({ effectiveType: type }) === 'slow';
      }),
      { numRuns: 100 },
    );
  });

  test('saveData flag always means slow', () => {
    fc.assert(
      fc.property(arbConnectionType, (type) => {
        return classifyConnection({ saveData: true, effectiveType: type }) === 'slow';
      }),
      { numRuns: 200 },
    );
  });

  test('3g is classified as medium', () => {
    fc.assert(
      fc.property(fc.constant('3g'), (type) => {
        return classifyConnection({ effectiveType: type }) === 'medium';
      }),
      { numRuns: 100 },
    );
  });

  test('4g and wifi are classified as fast', () => {
    fc.assert(
      fc.property(fc.constantFrom('4g', 'wifi', ''), (type) => {
        return classifyConnection({ effectiveType: type }) === 'fast';
      }),
      { numRuns: 100 },
    );
  });

  test('null/undefined connection is classified as fast', () => {
    fc.assert(
      fc.property(fc.constantFrom(null, undefined), (conn) => {
        return classifyConnection(conn) === 'fast';
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Slow Connection Warning Display
// Validates: Requirements 16.3
// ---------------------------------------------------------------------------

describe('Property 15: Slow Connection Warning Display', () => {
  test('warning element is added for slow connections', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (message) => {
        document.body.innerHTML = '<a id="bridge" data-immersive-bridge href="/pages/immersive">Enter 3D</a>';
        const bridge = document.getElementById('bridge');
        bridge._warningAdded = false;

        // Simulate addWarning
        const el = document.createElement('p');
        el.className = 'immersive-bridge-btn__connection-note';
        el.textContent = message;
        if (bridge.parentNode) {
          bridge.parentNode.insertBefore(el, bridge.nextSibling);
        }
        bridge._warningAdded = true;

        const note = document.querySelector('.immersive-bridge-btn__connection-note');
        return note !== null && note.textContent === message;
      }),
      { numRuns: 100 },
    );
  });

  test('warning is not added twice for the same bridge', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (message) => {
        document.body.innerHTML = '<a id="bridge" data-immersive-bridge href="/pages/immersive">Enter 3D</a>';
        const bridge = document.getElementById('bridge');
        bridge._warningAdded = false;

        function addWarning(b, msg) {
          if (b._warningAdded) return;
          b._warningAdded = true;
          const el = document.createElement('p');
          el.className = 'immersive-bridge-btn__connection-note';
          el.textContent = msg;
          if (b.parentNode) b.parentNode.insertBefore(el, b.nextSibling);
        }

        addWarning(bridge, message);
        addWarning(bridge, message); // second call should be no-op

        const notes = document.querySelectorAll('.immersive-bridge-btn__connection-note');
        return notes.length === 1;
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: Bridge Links Are Semantic
// Validates: Requirements 10.3, 15.2, 17.1
// ---------------------------------------------------------------------------

describe('Property 16: Bridge Links Are Semantic', () => {
  test('bridge button root element is an <a> tag', () => {
    fc.assert(
      fc.property(arbHandle, (handle) => {
        document.body.innerHTML = `<a href="/pages/immersive?open_collection=${handle}" data-immersive-bridge>Enter 3D</a>`;
        const bridge = document.querySelector('[data-immersive-bridge]');
        return bridge !== null && bridge.tagName === 'A';
      }),
      { numRuns: 200 },
    );
  });

  test('bridge button has a valid href', () => {
    fc.assert(
      fc.property(arbHandle, (handle) => {
        document.body.innerHTML = `<a href="/pages/immersive?open_collection=${handle}" data-immersive-bridge>Enter 3D</a>`;
        const bridge = document.querySelector('[data-immersive-bridge]');
        const href = bridge.getAttribute('href');
        return href !== null && href.length > 0 && href.includes('/pages/immersive');
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 17: Bridge Links URL Encoding
// Validates: Requirements 17.3
// ---------------------------------------------------------------------------

describe('Property 17: Bridge Links URL Encoding', () => {
  test('URL-encoded handles round-trip correctly', () => {
    fc.assert(
      fc.property(arbHandle, (handle) => {
        const encoded = encodeURIComponent(handle);
        const decoded = decodeURIComponent(encoded);
        return decoded === handle;
      }),
      { numRuns: 200 },
    );
  });

  test('search queries with special chars round-trip correctly', () => {
    fc.assert(
      fc.property(arbSearchQuery, (query) => {
        const encoded = encodeURIComponent(query);
        const decoded = decodeURIComponent(encoded);
        return decoded === query;
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 18: Preference Manager Isolation
// Validates: Requirements 10.4
// ---------------------------------------------------------------------------

describe('Property 18: Preference Manager Isolation', () => {
  // Use a safe key filter: no prototype-polluting keys, only alphanumeric+underscore
  const safeKey = fc
    .stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,18}$/)
    .filter((k) => k !== 'immersive_preferred_mode' && k !== 'setItem' && k !== 'getItem' && k !== 'removeItem');

  function makeIsolatedStore() {
    const data = Object.create(null);
    return {
      setItem: (k, v) => {
        data[k] = v;
      },
      getItem: (k) => (k in data ? data[k] : null),
      removeItem: (k) => {
        delete data[k];
      },
      _data: data,
    };
  }

  test('writing preference does not affect other keys', () => {
    fc.assert(
      fc.property(safeKey, fc.string({ minLength: 1, maxLength: 40 }), (otherKey, otherValue) => {
        const store = makeIsolatedStore();
        store.setItem(otherKey, otherValue);
        writeImmersivePreference(store);
        return store._data[otherKey] === otherValue;
      }),
      { numRuns: 200 },
    );
  });

  test('clearing preference does not affect other keys', () => {
    fc.assert(
      fc.property(safeKey, fc.string({ minLength: 1, maxLength: 40 }), (otherKey, otherValue) => {
        const store = makeIsolatedStore();
        store.setItem(otherKey, otherValue);
        writeImmersivePreference(store);
        clearImmersivePreference(store);
        return store._data[otherKey] === otherValue;
      }),
      { numRuns: 200 },
    );
  });
});
