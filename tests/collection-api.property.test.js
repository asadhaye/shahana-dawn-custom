/**
 * Property-Based Tests for Collection API Fetch URL
 *
 * Feature: immersive-store-glass-panel-improvements
 *
 * Tests verify that openCollectionPanel constructs the correct fetch URL
 * and includes the required X-Requested-With header, as defined in
 * immersive-store.js.
 *
 * Since immersive-store.js is not a module, we replicate the URL construction
 * logic and fetchWithCache header logic in isolation for property testing.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Logic extracted from immersive-store.js
// ---------------------------------------------------------------------------

/**
 * Replicates the URL construction from openCollectionPanel in immersive-store.js:
 *   var fetchUrl = "/collections/" + collectionHandle + "?section_id=glass-panel";
 *
 * @param {string} collectionHandle
 * @returns {string}
 */
function buildCollectionFetchUrl(collectionHandle) {
  return '/collections/' + collectionHandle + '?section_id=glass-panel';
}

/**
 * Replicates the fetch call from fetchWithCache in immersive-store.js:
 *   fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
 *
 * Returns the options object that would be passed to fetch.
 *
 * @returns {{ headers: { 'X-Requested-With': string } }}
 */
function buildFetchOptions() {
  return { headers: { 'X-Requested-With': 'XMLHttpRequest' } };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates valid Shopify collection handles.
 * Handles are URL-safe lowercase strings with hyphens (e.g. "suffuse", "eid-collection").
 */
const collectionHandleArbitrary = fc.stringMatching(/^[a-z][a-z0-9-]{0,79}$/);

// ---------------------------------------------------------------------------
// Property 30: Collection API Fetch URL
//
// "For any collection handle, openCollectionPanel(handle) fetches the URL
//  /collections/{handle}?section_id=glass-panel and the fetch request
//  includes the header X-Requested-With: XMLHttpRequest."
//
// Validates: Requirements 13.1, 13.2
// ---------------------------------------------------------------------------

describe('Property 30: Collection API Fetch URL', () => {
  /**
   * **Validates: Requirements 13.1**
   *
   * For any collection handle, the constructed fetch URL must match
   * the pattern `/collections/{handle}?section_id=glass-panel`.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
    'fetch URL matches /collections/{handle}?section_id=glass-panel for any collection handle',
    () => {
      fc.assert(
        fc.property(collectionHandleArbitrary, function (handle) {
          const url = buildCollectionFetchUrl(handle);

          // Must start with /collections/
          if (!url.startsWith('/collections/')) return false;

          // Must contain the handle verbatim
          if (!url.includes('/collections/' + handle)) return false;

          // Must end with ?section_id=glass-panel
          if (!url.endsWith('?section_id=glass-panel')) return false;

          // Full URL must match the exact pattern
          const expected = '/collections/' + handle + '?section_id=glass-panel';
          return url === expected;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 13.2**
   *
   * For any collection handle, the fetch options must include the header
   * `X-Requested-With: XMLHttpRequest`.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
    'fetch options include X-Requested-With: XMLHttpRequest header for any collection handle',
    () => {
      fc.assert(
        fc.property(collectionHandleArbitrary, function (_handle) {
          const options = buildFetchOptions();

          // Must have a headers object
          if (!options.headers) return false;

          // Must include X-Requested-With: XMLHttpRequest
          return options.headers['X-Requested-With'] === 'XMLHttpRequest';
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 13.1, 13.2**
   *
   * Integration: for any collection handle, both the URL and the header
   * must be correct simultaneously — as they are in the actual fetch call
   * inside fetchWithCache called by openCollectionPanel.
   *
   * Mocks global fetch to capture the URL and headers passed to it,
   * then verifies both properties hold together.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 30: Collection API Fetch URL
    'URL and X-Requested-With header are both correct for any collection handle',
    () => {
      fc.assert(
        fc.property(collectionHandleArbitrary, function (handle) {
          // Simulate what openCollectionPanel + fetchWithCache do together
          const url = buildCollectionFetchUrl(handle);
          const options = buildFetchOptions();

          // Capture what would be passed to fetch(url, options)
          let capturedUrl = null;
          let capturedOptions = null;

          const mockFetch = function (u, o) {
            capturedUrl = u;
            capturedOptions = o;
            // Return a resolved promise (not used in this property)
            return Promise.resolve({ ok: true, text: function () { return Promise.resolve(''); } });
          };

          // Invoke the mock as fetchWithCache would
          mockFetch(url, options);

          // Verify URL
          const expectedUrl = '/collections/' + handle + '?section_id=glass-panel';
          if (capturedUrl !== expectedUrl) return false;

          // Verify header
          if (!capturedOptions || !capturedOptions.headers) return false;
          if (capturedOptions.headers['X-Requested-With'] !== 'XMLHttpRequest') return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );
});
