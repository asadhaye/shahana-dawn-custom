/**
 * Unit Tests for fetchSectionHtml and openGlassPanelWithSection
 *
 * Feature: immersive-store-section-rendering-helpers
 *
 * Tests verify the Section Rendering API helper functions as implemented
 * in assets/immersive-store.js.
 *
 * Since immersive-store.js is not a module, the function logic is reproduced
 * here verbatim for isolated unit testing.
 */

'use strict';

// ---------------------------------------------------------------------------
// fetchSectionHtml — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

/**
 * Builds a URL with sections parameter and optional extra params,
 * fetches the JSON response, and returns the HTML for the given section.
 * Uses ?sections= (JSON response) for consistent error handling.
 * Returns a Promise that resolves to the HTML string or null on error.
 */
function fetchSectionHtml(path, sectionId, extraParams) {
  // Build base URL - path can be a product/collection/search URL
  var url = path;
  var separator = url.indexOf('?') >= 0 ? '&' : '?';
  url += separator + 'sections=' + encodeURIComponent(sectionId);

  if (extraParams && typeof extraParams === 'object') {
    Object.keys(extraParams).forEach(function (key) {
      if (extraParams[key] != null) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
      }
    });
  } else if (extraParams && typeof extraParams === 'string') {
    url += '&' + extraParams;
  }

  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (response) {
      if (!response.ok) {
        console.warn('[Immersive] Section Rendering fetch failed:', sectionId, response.status);
        return null;
      }
      return response.json();
    })
    .then(function (json) {
      if (!json || typeof json !== 'object') {
        console.warn('[Immersive] Section Rendering returned invalid JSON:', sectionId);
        return null;
      }
      var html = json[sectionId];
      if (!html) {
        console.warn('[Immersive] Section Rendering missing section:', sectionId);
        return null;
      }
      return html;
    })
    .catch(function (err) {
      console.warn('[Immersive] Section Rendering error:', sectionId, err);
      return null;
    });
}

// ---------------------------------------------------------------------------
// Helper to create mock panel element
// ---------------------------------------------------------------------------

function createMockPanel(id, withContentArea) {
  var panel = document.createElement('div');
  panel.id = id;
  panel.setAttribute('data-msg-load-error', 'Test error message');

  if (withContentArea) {
    var contentArea = document.createElement('div');
    contentArea.className = 'immersive-store__panel-content';
    panel.appendChild(contentArea);
  }

  return panel;
}

// ---------------------------------------------------------------------------
// Tests: fetchSectionHtml — URL construction
// ---------------------------------------------------------------------------

describe('fetchSectionHtml — URL construction', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('URL construction without extraParams uses ?sections= parameter', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'glass-product': '<div>Product HTML</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/products/my-product', 'glass-product');

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Get the URL that fetch was called with
    var fetchUrl = global.fetch.mock.calls[0][0];

    // Assert URL contains the path
    expect(fetchUrl).toContain('/products/my-product');

    // Assert URL uses ?sections= (not ?section_id=)
    expect(fetchUrl).toContain('?sections=glass-product');

    // Assert the resolved value is the HTML
    expect(result).toBe('<div>Product HTML</div>');
  });

  test('URL construction with extraParams as object includes encoded params', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'immersive-product-grid': '<div>Search results</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/search', 'immersive-product-grid', { q: 'red dress' });

    var fetchUrl = global.fetch.mock.calls[0][0];

    // Assert URL contains the path
    expect(fetchUrl).toContain('/search');

    // Assert URL uses sections parameter
    expect(fetchUrl).toContain('sections=immersive-product-grid');

    // Assert URL contains encoded query param
    expect(fetchUrl).toContain('q=red%20dress');

    expect(result).toBe('<div>Search results</div>');
  });

  test('URL construction with extraParams as string appends directly', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'glass-product': '<div>HTML</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/products/test', 'glass-product', 'custom=param');

    var fetchUrl = global.fetch.mock.calls[0][0];

    expect(fetchUrl).toContain('&custom=param');
    expect(result).toBe('<div>HTML</div>');
  });

  test('URL uses & separator when path already has query string', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ section: '<div>HTML</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await fetchSectionHtml('/products/test?existing=param', 'section');

    var fetchUrl = global.fetch.mock.calls[0][0];

    // Should use & not ? for the sections param
    expect(fetchUrl).toMatch(/\?existing=param&sections=/);
  });

  test('fetch includes X-Requested-With header', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ section: '<div>HTML</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await fetchSectionHtml('/test', 'section');

    var fetchOptions = global.fetch.mock.calls[0][1];

    expect(fetchOptions.headers).toBeDefined();
    expect(fetchOptions.headers['X-Requested-With']).toBe('XMLHttpRequest');
  });
});

// ---------------------------------------------------------------------------
// Tests: fetchSectionHtml — Error handling
// ---------------------------------------------------------------------------

describe('fetchSectionHtml — Error handling', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Missing section key in JSON returns null and logs warning', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'other-section': '<div>Other HTML</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/test', 'glass-product');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[Immersive] Section Rendering missing section:', 'glass-product');
  });

  test('HTTP error response returns null and logs warning', async () => {
    var mockResponse = {
      ok: false,
      status: 500,
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/test', 'section');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[Immersive] Section Rendering fetch failed:', 'section', 500);
  });

  test('Invalid JSON (non-object) returns null and logs warning', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue('not an object'),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/test', 'section');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[Immersive] Section Rendering returned invalid JSON:', 'section');
  });

  test('Invalid JSON (null) returns null and logs warning', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    var result = await fetchSectionHtml('/test', 'section');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[Immersive] Section Rendering returned invalid JSON:', 'section');
  });

  test('Network error returns null and logs warning', async () => {
    var networkError = new Error('Network failure');
    global.fetch = jest.fn().mockRejectedValue(networkError);

    var result = await fetchSectionHtml('/test', 'section');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('[Immersive] Section Rendering error:', 'section', networkError);
  });
});

// ---------------------------------------------------------------------------
// Tests: openGlassPanelWithSection — Integration with mocked dependencies
// ---------------------------------------------------------------------------

describe('openGlassPanelWithSection — Integration', () => {
  // Create a version of openGlassPanelWithSection that uses injectable dependencies
  function createOpenGlassPanelWithSection(deps) {
    var openPanel = deps.openPanel;
    var closePanel = deps.closePanel;
    var showErrorFeedback = deps.showErrorFeedback;
    var transitionPanelContent = deps.transitionPanelContent;

    return function openGlassPanelWithSection(path, sectionId, extraParams, panelId, renderCallback) {
      var panel = document.getElementById(panelId);
      if (!panel) return;

      var triggerEl = document.activeElement;

      // Open panel and set up focus trap
      openPanel(panel, triggerEl);

      // Fetch and render content using Section Rendering API
      fetchSectionHtml(path, sectionId, extraParams)
        .then(function (html) {
          if (!html) {
            var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
            showErrorFeedback(panel, errMsg);
            closePanel(panel);
            return;
          }

          function render() {
            var contentArea = panel.querySelector('.immersive-store__panel-content');
            if (contentArea) {
              contentArea.innerHTML = html;
            } else {
              panel.innerHTML = html;
            }

            // Call panel-specific setup
            if (typeof renderCallback === 'function') {
              renderCallback(panel);
            }
          }

          transitionPanelContent(panel, render);
        })
        .catch(function (error) {
          console.error('[Immersive] Panel fetch failed:', error);
          var errMsg =
            panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
          showErrorFeedback(panel, errMsg);
          closePanel(panel);
        });
    };
  }

  var panel;
  var renderCallback;
  var openPanelMock, closePanelMock, showErrorFeedbackMock, transitionPanelContentMock;
  var openGlassPanelWithSection;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '';
    panel = createMockPanel('glass-panel', true);
    document.body.appendChild(panel);

    // Set up active element
    var activeBtn = document.createElement('button');
    document.body.appendChild(activeBtn);
    activeBtn.focus();

    // Set up mocks
    openPanelMock = jest.fn();
    closePanelMock = jest.fn();
    showErrorFeedbackMock = jest.fn();
    transitionPanelContentMock = jest.fn(function (panel, renderFn) {
      // Execute render immediately for testing
      renderFn();
    });

    // Create the function with injected dependencies
    openGlassPanelWithSection = createOpenGlassPanelWithSection({
      openPanel: openPanelMock,
      closePanel: closePanelMock,
      showErrorFeedback: showErrorFeedbackMock,
      transitionPanelContent: transitionPanelContentMock,
    });

    renderCallback = jest.fn();

    // Mock fetch for fetchSectionHtml
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'glass-product': '<div>Panel content</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Successful load tests
  // ---------------------------------------------------------------------------

  test('calls openPanel with panel and active element', async () => {
    var activeElement = document.activeElement;

    await openGlassPanelWithSection('/products/my-product', 'glass-product', null, 'glass-panel', renderCallback);

    expect(openPanelMock).toHaveBeenCalledWith(panel, activeElement);
  });

  test('fetches with correct URL and section ID', async () => {
    await openGlassPanelWithSection('/products/my-product', 'glass-product', null, 'glass-panel', renderCallback);

    var fetchUrl = global.fetch.mock.calls[0][0];
    expect(fetchUrl).toContain('/products/my-product');
    expect(fetchUrl).toContain('sections=glass-product');
  });

  test('sets panel content innerHTML', async () => {
    await openGlassPanelWithSection('/products/my-product', 'glass-product', null, 'glass-panel', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    var contentArea = panel.querySelector('.immersive-store__panel-content');
    expect(contentArea.innerHTML).toBe('<div>Panel content</div>');
  });

  test('calls renderCallback with panel', async () => {
    await openGlassPanelWithSection('/products/my-product', 'glass-product', null, 'glass-panel', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(renderCallback).toHaveBeenCalledTimes(1);
    expect(renderCallback).toHaveBeenCalledWith(panel);
  });

  test('calls transitionPanelContent with panel and render function', async () => {
    await openGlassPanelWithSection('/products/my-product', 'glass-product', null, 'glass-panel', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(transitionPanelContentMock).toHaveBeenCalledTimes(1);
    expect(transitionPanelContentMock).toHaveBeenCalledWith(panel, expect.any(Function));
  });

  test('falls back to panel.innerHTML when no content area exists', async () => {
    // Create panel without content area
    var panelNoContent = createMockPanel('panel-no-content', false);
    document.body.appendChild(panelNoContent);

    await openGlassPanelWithSection('/products/test', 'glass-product', null, 'panel-no-content', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panelNoContent.innerHTML).toBe('<div>Panel content</div>');
  });

  // ---------------------------------------------------------------------------
  // Error handling tests
  // ---------------------------------------------------------------------------

  test('null HTML from fetchSectionHtml shows error and closes panel', async () => {
    // Mock fetch to return missing section
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'other-section': '<div>Other</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await openGlassPanelWithSection('/products/test', 'glass-product', null, 'glass-panel', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should show error feedback
    expect(showErrorFeedbackMock).toHaveBeenCalledWith(panel, 'Test error message');

    // Should close panel
    expect(closePanelMock).toHaveBeenCalledWith(panel);

    // Should NOT call renderCallback
    expect(renderCallback).not.toHaveBeenCalled();
  });

  test('null HTML uses default error message when data attribute missing', async () => {
    panel.removeAttribute('data-msg-load-error');

    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ other: '<div>Other</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await openGlassPanelWithSection('/products/test', 'glass-product', null, 'glass-panel', jest.fn());

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(showErrorFeedbackMock).toHaveBeenCalledWith(panel, 'Unable to load content. Please try again.');
  });

  test('thrown error from fetch is handled by fetchSectionHtml returning null', async () => {
    var testError = new Error('Network failure');
    global.fetch = jest.fn().mockRejectedValue(testError);

    await openGlassPanelWithSection('/products/test', 'glass-product', null, 'glass-panel', renderCallback);

    // Wait for all microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // fetchSectionHtml catches the error and returns null, so openGlassPanelWithSection
    // handles it in the .then() block, not .catch()
    // This means showErrorFeedback is called, not console.error
    expect(showErrorFeedbackMock).toHaveBeenCalled();
    expect(closePanelMock).toHaveBeenCalledWith(panel);
    expect(renderCallback).not.toHaveBeenCalled();
  });

  test('returns early when panel element not found', async () => {
    // Don't add panel to DOM
    document.body.innerHTML = '';

    global.fetch = jest.fn();

    await openGlassPanelWithSection('/products/test', 'glass-product', null, 'non-existent-panel', jest.fn());

    // Should not call fetch
    expect(global.fetch).not.toHaveBeenCalled();
    expect(openPanelMock).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Extra params handling tests
  // ---------------------------------------------------------------------------

  test('passes extraParams object to fetchSectionHtml', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'immersive-product-grid': '<div>Results</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await openGlassPanelWithSection('/search', 'immersive-product-grid', { q: 'red dress' }, 'glass-panel', jest.fn());

    var fetchUrl = global.fetch.mock.calls[0][0];
    expect(fetchUrl).toContain('q=red%20dress');
  });

  test('handles null extraParams', async () => {
    var mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ 'glass-panel': '<div>Collection</div>' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await openGlassPanelWithSection('/collections/test', 'glass-panel', null, 'glass-panel', jest.fn());

    var fetchUrl = global.fetch.mock.calls[0][0];
    expect(fetchUrl).toContain('sections=glass-panel');
    expect(fetchUrl).not.toContain('&null');
  });
});
