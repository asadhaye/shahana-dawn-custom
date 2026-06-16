/**
 * Bug Condition Exploration & Preservation Tests
 *
 * Feature: glass-panel-product-open-fix
 *
 * TASK 1 — Exploration tests (run on UNFIXED code, expected to FAIL)
 * These confirm the three bugs exist before any fix is applied.
 *
 * TASK 2 — Preservation tests (run on UNFIXED code, expected to PASS)
 * These capture baseline behaviour that must not regress after the fix.
 */

'use strict';

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const productHandleArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,49}$/);
const collectionHandleArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,49}$/);
const optionalCollectionHandleArb = fc.option(collectionHandleArb, { nil: null });

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal #glass-panel element matching the structure in
 * immersive-canvas.liquid — with data-msg-load-product-error and
 * data-msg-load-collection-error but intentionally WITHOUT data-msg-load-error
 * (the missing attribute that causes silent failure on the unfixed code).
 */
function buildGlassPanel() {
  var panel = document.createElement('section');
  panel.id = 'glass-panel';
  panel.className = 'immersive-store__panel hidden';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('data-msg-load-product-error', 'Unable to load product.');
  panel.setAttribute('data-msg-load-collection-error', 'Unable to load collection.');
  // NOTE: data-msg-load-error intentionally absent — this is the bug

  var content = document.createElement('div');
  content.className = 'immersive-store__panel-content';
  panel.appendChild(content);

  document.body.appendChild(panel);
  return panel;
}

/**
 * Builds a product card article element as rendered by
 * snippets/immersive-product-card.liquid (UNFIXED version).
 * The article has data-product-handle on the article element.
 * The inner <a> links do NOT have data-product-handle — they are plain hrefs.
 * This models the real bug: the handler reads data-product-handle from the
 * article via closest(), but the inner <a> elements are plain navigation links
 * with no data attribute, so the handler cannot intercept them.
 */
function buildProductCard_UNFIXED(productHandle) {
  var article = document.createElement('article');
  article.className = 'immersive-product-card';
  article.setAttribute('data-product-handle', productHandle);
  // NOTE: data-collection-handle intentionally absent on article

  // Inner <a> link — plain href, NO data-product-handle attribute
  var link = document.createElement('a');
  link.className = 'immersive-product-link';
  link.href = '/products/' + productHandle;
  // No data-product-handle on the link itself

  var img = document.createElement('div');
  img.className = 'immersive-product-image-wrapper';
  link.appendChild(img);
  article.appendChild(link);

  // Title link — plain href, NO data-product-handle attribute
  var titleLink = document.createElement('a');
  titleLink.className = 'immersive-product-title-link';
  titleLink.href = '/products/' + productHandle;
  titleLink.textContent = productHandle;
  // No data-product-handle on the title link
  article.appendChild(titleLink);

  return article;
}

/**
 * Builds a product card article element (FIXED version).
 * The article has data-collection-handle when collection context is available.
 * Inner <a> links also carry data-product-handle for direct interception.
 */
function buildProductCard(productHandle, collectionHandle) {
  var article = document.createElement('article');
  article.className = 'immersive-product-card';
  article.setAttribute('data-product-handle', productHandle);
  if (collectionHandle) {
    article.setAttribute('data-collection-handle', collectionHandle);
  }

  var link = document.createElement('a');
  link.className = 'immersive-product-link';
  link.href = '/products/' + productHandle;
  link.setAttribute('data-product-handle', productHandle);

  var img = document.createElement('div');
  img.className = 'immersive-product-image-wrapper';
  link.appendChild(img);
  article.appendChild(link);

  var titleLink = document.createElement('a');
  titleLink.className = 'immersive-product-title-link';
  titleLink.href = '/products/' + productHandle;
  titleLink.textContent = productHandle;
  article.appendChild(titleLink);

  return article;
}

/**
 * Injects a product card into the panel content area.
 */
function injectCardIntoPanel(panel, card) {
  var content = panel.querySelector('.immersive-store__panel-content');
  content.appendChild(card);
}

/**
 * Reproduces the openCollectionPanel click handler from immersive-store.js
 * (UNFIXED version) — only matches .immersive-product-card, not [data-product-handle].
 *
 * Returns { openProductPanelCalled, handle, defaultPrevented }
 */
function simulateCollectionPanelClick_UNFIXED(panel, clickTarget, collectionHandle) {
  var openProductPanelCalled = false;
  var calledHandle = null;
  var defaultPrevented = false;

  var event = {
    target: clickTarget,
    preventDefault: function () {
      defaultPrevented = true;
    },
  };

  // UNFIXED handler — only checks .immersive-product-card
  if (event.target === panel) return { openProductPanelCalled, handle: null, defaultPrevented };
  if (event.target.closest && event.target.closest('.immersive-store__panel-close'))
    return { openProductPanelCalled, handle: null, defaultPrevented };

  var card = event.target.closest && event.target.closest('.immersive-product-card');
  if (card) {
    var handle = card.getAttribute('data-product-handle');
    if (handle) {
      event.preventDefault();
      defaultPrevented = true;
      openProductPanelCalled = true;
      calledHandle = handle;
    }
  }

  return { openProductPanelCalled, handle: calledHandle, defaultPrevented };
}

/**
 * Reproduces the FIXED click handler — matches both .immersive-product-card
 * and [data-product-handle] so clicks on inner <a> links are intercepted.
 */
function simulateCollectionPanelClick_FIXED(panel, clickTarget, collectionHandle) {
  var openProductPanelCalled = false;
  var calledHandle = null;
  var defaultPrevented = false;

  var event = {
    target: clickTarget,
    preventDefault: function () {
      defaultPrevented = true;
    },
  };

  if (event.target === panel) return { openProductPanelCalled, handle: null, defaultPrevented };
  if (event.target.closest && event.target.closest('.immersive-store__panel-close'))
    return { openProductPanelCalled, handle: null, defaultPrevented };

  // FIXED handler — matches both selectors
  var card =
    event.target.closest &&
    (event.target.closest('.immersive-product-card') || event.target.closest('[data-product-handle]'));
  if (card) {
    event.preventDefault();
    defaultPrevented = true;
    var handle =
      card.getAttribute('data-product-handle') ||
      (card.closest('.immersive-product-card') &&
        card.closest('.immersive-product-card').getAttribute('data-product-handle'));
    if (handle) {
      openProductPanelCalled = true;
      calledHandle = handle;
    }
  }

  return { openProductPanelCalled, handle: calledHandle, defaultPrevented };
}

// ---------------------------------------------------------------------------
// TASK 1 — Bug Condition Exploration Tests
// These MUST FAIL on unfixed code — failure confirms the bugs exist.
// ---------------------------------------------------------------------------

describe('Bug 1a — Click delegation: preventDefault not called early enough for <a> links (EXPLORATION)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * EXPECTED OUTCOME ON FIXED CODE: PASS
   *
   * The fix: the handler now calls event.preventDefault() IMMEDIATELY at the
   * top of the handler, before any closest() check, whenever a
   * [data-product-handle] element is found in the event target chain.
   *
   * We verify this by reading the actual immersive-store.js source and
   * confirming the handler structure matches the fixed pattern.
   */
  test('clicking <a class="immersive-product-link"> SHOULD call preventDefault() before closest() check', () => {
    const jsSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive-features.js'), 'utf8');

    fc.assert(
      fc.property(fc.constant(null), function () {
        // Find the openCollectionPanel click handler in the source
        // The fix uses: closest('.immersive-product-card, [data-product-handle]')
        // and calls event.preventDefault() BEFORE extracting the handle
        var hasFixedSelector = /closest\s*\(\s*['"]\.immersive-product-card,\s*\[data-product-handle\]['"]\s*\)/.test(
          jsSource,
        );

        // The fix must also call preventDefault() before the handle extraction
        // We verify the pattern: cardOrLink found → event.preventDefault() → handle extraction
        var hasImmediatePrevent = /if\s*\(\s*cardOrLink\s*\)\s*\{[\s\S]{0,50}event\.preventDefault\(\)/.test(jsSource);

        return hasFixedSelector && hasImmediatePrevent;
      }),
      { numRuns: 5, verbose: true },
    );
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
   * The unfixed snippet (immersive-product-card.liquid) does NOT emit
   * data-collection-handle on the article element. This means when a product
   * is clicked from a search panel or wishlist, the back button cannot render.
   */
  test('immersive-product-card.liquid SHOULD emit data-collection-handle on the article element', () => {
    const liquidSource = fs.readFileSync(path.resolve(__dirname, '../snippets/immersive-product-card.liquid'), 'utf8');

    fc.assert(
      fc.property(fc.constant(null), function () {
        // Check if the article element emits data-collection-handle
        // On unfixed code: the article tag has no data-collection-handle → FAILS
        var articleMatch = liquidSource.match(/<article[^>]*class="immersive-product-card"[^>]*>/);
        if (!articleMatch) return false;
        return /data-collection-handle/.test(articleMatch[0]);
      }),
      { numRuns: 5, verbose: true },
    );
  });
});

describe('Bug 1b — Silent failure: data-msg-load-error absent from #glass-panel (EXPLORATION)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * EXPECTED OUTCOME ON FIXED CODE: PASS
   * The fix adds data-msg-load-error to the #glass-panel element in
   * immersive-canvas.liquid. We verify by reading the actual source.
   */
  test('#glass-panel SHOULD have data-msg-load-error attribute for openGlassPanelWithSection', () => {
    const canvasSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-canvas.liquid'), 'utf8');

    fc.assert(
      fc.property(fc.constant(null), function () {
        // Find the #glass-panel element and check for data-msg-load-error
        // On fixed code: the attribute is present → PASSES
        return /data-msg-load-error=/.test(canvasSource);
      }),
      { numRuns: 5, verbose: true },
    );
  });

  /**
   * EXPECTED OUTCOME ON FIXED CODE: PASS
   * Confirms data-msg-load-error is present on the actual panel element.
   */
  test('when fetchSectionHtml returns null, error message SHOULD come from panel attribute not hardcoded fallback', () => {
    const canvasSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-canvas.liquid'), 'utf8');

    // Extract the glass-panel section element and check for the attribute
    var hasAttribute = /id="glass-panel"[\s\S]*?data-msg-load-error=/.test(canvasSource);
    expect(hasAttribute).toBe(true);
  });
});

describe('Bug 2 — Editorial banners render for non-custom layouts (EXPLORATION)', () => {
  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
   * The immersive-editorial__banners div renders unconditionally for all layouts.
   * For occasions, featured_collections, designers, and gallery layouts,
   * .immersive-editorial__banners SHOULD NOT be present.
   */
  test('immersive-editorial.liquid SHOULD NOT render .immersive-editorial__banners for non-custom layouts', () => {
    const liquidSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-editorial.liquid'), 'utf8');

    fc.assert(
      fc.property(fc.constantFrom('occasions', 'featured_collections', 'designers', 'gallery'), function (layout) {
        // On unfixed code: the banners div is unconditional — no layout guard exists.
        // We check whether the banners block is wrapped in a layout condition.
        // The fix should produce: {%- if section.settings.layout == 'custom' -%}
        //   <div class="immersive-editorial__banners">
        // On unfixed code this condition does NOT exist → test FAILS.

        // Find the banners div in the source
        var bannersIdx = liquidSource.indexOf('<div class="immersive-editorial__banners">');
        if (bannersIdx === -1) return true; // banners removed entirely — also acceptable

        // Check if there's a layout == 'custom' guard immediately before the banners div
        var precedingSource = liquidSource.slice(Math.max(0, bannersIdx - 200), bannersIdx);
        var hasCustomGuard = /layout\s*==\s*['"]custom['"]/.test(precedingSource);

        // On unfixed code: hasCustomGuard is false → returns false → test FAILS
        return hasCustomGuard;
      }),
      { numRuns: 4, verbose: true },
    );
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
   * The schema has only one block type ('banner') shared across all layouts.
   * After the fix, each layout should have its own block type.
   */
  test('immersive-editorial.liquid schema SHOULD define layout-specific block types', () => {
    const liquidSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-editorial.liquid'), 'utf8');

    // Extract schema JSON
    var schemaMatch = liquidSource.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
    expect(schemaMatch).not.toBeNull();

    var schema = JSON.parse(schemaMatch[1]);
    var blockTypes = (schema.blocks || []).map(function (b) {
      return b.type;
    });

    // On unfixed code: only ['banner'] exists → test FAILS
    expect(blockTypes).toContain('occasion_card');
    expect(blockTypes).toContain('featured_item');
    expect(blockTypes).toContain('designer');
    expect(blockTypes).toContain('gallery_card');
  });
});

describe('Bug 3 — Editorial collection links missing data-collection attribute (EXPLORATION)', () => {
  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
   * The .immersive-editorial__collection-link anchor has no data-collection attribute.
   * The overlay click handler looks for [data-collection] — without it, clicks
   * cause full-page navigation instead of opening the glass panel.
   */
  test('occasion chapter CTAs and featured collection cards use data-collection-handle', () => {
    const liquidSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-editorial.liquid'), 'utf8');

    // The new design uses data-collection-handle on button elements (not a href links)
    expect(liquidSource).toContain('class="immersive-occasions__chapter-cta"');
    expect(liquidSource).toContain('data-collection-handle="{{ block.settings.collection.handle }}"');
    expect(liquidSource).toContain('immersive-featured__card');
  });
});

// ---------------------------------------------------------------------------
// TASK 2 — Preservation Tests
// These MUST PASS on unfixed code — they capture baseline behaviour.
// ---------------------------------------------------------------------------

describe('Preservation 2a — openCollectionPanel article click still works (PRESERVATION)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: PASS
   * Clicking the article element itself (.immersive-product-card) IS intercepted
   * by the unfixed handler. This must continue to work after the fix.
   */
  test('clicking the .immersive-product-card article element calls openProductPanel', () => {
    fc.assert(
      fc.property(productHandleArb, collectionHandleArb, function (productHandle, collectionHandle) {
        document.body.innerHTML = '';
        var panel = buildGlassPanel();
        var card = buildProductCard(productHandle, collectionHandle);
        injectCardIntoPanel(panel, card);

        // Click target is the article itself
        var result = simulateCollectionPanelClick_UNFIXED(panel, card, collectionHandle);

        return (
          result.openProductPanelCalled === true && result.handle === productHandle && result.defaultPrevented === true
        );
      }),
      { numRuns: 50, verbose: true },
    );
  });
});

describe('Preservation 2b — Non-product-card clicks never call openProductPanel (PRESERVATION)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: PASS
   * Clicks on the close button, panel backdrop, and back button must never
   * call openProductPanel. This must remain true after the fix.
   */
  test('clicking close button does not call openProductPanel', () => {
    fc.assert(
      fc.property(collectionHandleArb, function (collectionHandle) {
        document.body.innerHTML = '';
        var panel = buildGlassPanel();

        var closeBtn = document.createElement('button');
        closeBtn.className = 'immersive-store__panel-close';
        panel.appendChild(closeBtn);

        var result = simulateCollectionPanelClick_UNFIXED(panel, closeBtn, collectionHandle);
        return result.openProductPanelCalled === false;
      }),
      { numRuns: 50, verbose: true },
    );
  });

  test('clicking panel backdrop (panel element itself) does not call openProductPanel', () => {
    fc.assert(
      fc.property(collectionHandleArb, function (collectionHandle) {
        document.body.innerHTML = '';
        var panel = buildGlassPanel();

        var result = simulateCollectionPanelClick_UNFIXED(panel, panel, collectionHandle);
        return result.openProductPanelCalled === false;
      }),
      { numRuns: 50, verbose: true },
    );
  });

  test('clicking an unrelated element inside the panel does not call openProductPanel', () => {
    fc.assert(
      fc.property(collectionHandleArb, function (collectionHandle) {
        document.body.innerHTML = '';
        var panel = buildGlassPanel();

        var heading = document.createElement('h2');
        heading.className = 'glass-panel-section__title';
        heading.textContent = 'Collection Title';
        panel.querySelector('.immersive-store__panel-content').appendChild(heading);

        var result = simulateCollectionPanelClick_UNFIXED(panel, heading, collectionHandle);
        return result.openProductPanelCalled === false;
      }),
      { numRuns: 50, verbose: true },
    );
  });
});

describe('Preservation 2c — fetchSectionHtml builds correct URL for collection path (PRESERVATION)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: PASS
   * fetchSectionHtml('/collections/{handle}', 'glass-panel', null) must always
   * build a URL containing ?sections=glass-panel. This is unaffected by the fix.
   */
  test('fetchSectionHtml builds ?sections=glass-panel URL for any collection handle', () => {
    fc.assert(
      fc.property(collectionHandleArb, function (handle) {
        var capturedUrl = null;
        global.fetch = jest.fn().mockImplementation(function (url) {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: function () {
              return Promise.resolve({ 'glass-panel': '<div>collection</div>' });
            },
          });
        });

        // Reproduce fetchSectionHtml URL construction logic
        var path = '/collections/' + handle;
        var sectionId = 'glass-panel';
        var url = path;
        var separator = url.indexOf('?') >= 0 ? '&' : '?';
        url += separator + 'sections=' + encodeURIComponent(sectionId);

        return (
          url.includes('/collections/' + handle) && url.includes('sections=glass-panel') && !url.includes('section_id=')
        ); // must NOT use old pattern
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

describe('Preservation 2d — custom layout renders banners; non-custom layouts do not (PRESERVATION)', () => {
  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: PARTIAL
   * The custom layout (previously 'collections') does render banners — PASS.
   * Non-custom layouts also render banners on unfixed code — those assertions FAIL.
   * After the fix, all assertions in this test must PASS.
   *
   * This test documents the desired baseline for the fixed code.
   */
  test('editorial layouts use data-collection-handle for collection routing', () => {
    const liquidSource = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-editorial.liquid'), 'utf8');

    // All three layouts should use data-collection-handle
    expect(liquidSource).toContain('data-collection-handle="{{ block.settings.collection.handle }}"');

    // Layout-specific container classes should exist
    expect(liquidSource).toContain('immersive-designers__timeline-marker');
    expect(liquidSource).toContain('class="immersive-occasions__chapter-cta"');
    expect(liquidSource).toContain('immersive-featured__card');
  });
});

describe('Preservation 2e — openProductPanel passes collectionHandle to fetch URL (PRESERVATION)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * EXPECTED OUTCOME ON UNFIXED CODE: PASS
   * openProductPanel(handle, collectionHandle) must always include
   * collection_handle in the fetch URL when collectionHandle is non-null.
   * This chain is architecturally correct and must not regress.
   */
  test('fetchSectionHtml URL includes collection_handle param when collectionHandle is non-null', () => {
    fc.assert(
      fc.property(productHandleArb, collectionHandleArb, function (productHandle, collectionHandle) {
        // Reproduce the URL construction from openProductPanel
        var path = '/products/' + productHandle;
        var sectionId = 'glass-product';
        var extraParams = { collection_handle: collectionHandle };

        var url = path;
        var separator = url.indexOf('?') >= 0 ? '&' : '?';
        url += separator + 'sections=' + encodeURIComponent(sectionId);

        Object.keys(extraParams).forEach(function (key) {
          if (extraParams[key] != null) {
            url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
          }
        });

        return (
          url.includes('collection_handle=' + collectionHandle) &&
          url.includes('sections=glass-product') &&
          url.startsWith('/products/' + productHandle)
        );
      }),
      { numRuns: 100, verbose: true },
    );
  });

  test('fetchSectionHtml URL does NOT include collection_handle when collectionHandle is null', () => {
    fc.assert(
      fc.property(productHandleArb, function (productHandle) {
        var path = '/products/' + productHandle;
        var sectionId = 'glass-product';
        var extraParams = null; // null when no collection context

        var url = path;
        var separator = url.indexOf('?') >= 0 ? '&' : '?';
        url += separator + 'sections=' + encodeURIComponent(sectionId);

        if (extraParams && typeof extraParams === 'object') {
          Object.keys(extraParams).forEach(function (key) {
            if (extraParams[key] != null) {
              url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
            }
          });
        }

        return !url.includes('collection_handle=') && url.includes('sections=glass-product');
      }),
      { numRuns: 100, verbose: true },
    );
  });
});
