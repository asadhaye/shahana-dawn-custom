/**
 * Unit Tests for Wishlist Manager, Preference System, Onboarding, and Cookie Banner
 *
 * Feature: immersive-store-wishlist-and-preferences
 *
 * Tests verify the wishlist, preference, onboarding, and cookie banner functions
 * as implemented in assets/immersive-store.js.
 *
 * Since immersive-store.js is not a module, the function logic is reproduced
 * here verbatim for isolated unit testing.
 */

'use strict';

// ---------------------------------------------------------------------------
// Global state and constants (replicated from immersive-store.js)
// ---------------------------------------------------------------------------

var _wishlistItems = [];
var _wishlistProductCache = {};
var _wishlistPanelTrigger = null;
var WISHLIST_KEY = 'immersive_wishlist';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';

// Mock for trackImmersiveEvent
var trackImmersiveEventMock;

// ---------------------------------------------------------------------------
// Wishlist functions — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

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
}

function syncAllWishlistToggles(root) {
  var toggles = root.querySelectorAll('[data-wishlist-toggle]');
  for (var i = 0; i < toggles.length; i++) {
    var toggle = toggles[i];
    var handle = toggle.getAttribute('data-product-handle');
    var isSaved = handle && _wishlistItems.indexOf(handle) !== -1;
    toggle.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    toggle.classList.toggle('is-saved', !!isSaved);
    var labelSave = toggle.getAttribute('data-label-save');
    var labelSaved = toggle.getAttribute('data-label-saved');
    if (labelSave && labelSaved) {
      toggle.setAttribute('aria-label', isSaved ? labelSaved : labelSave);
    }
  }
}

function addToWishlist(handle, source) {
  if (!handle || _wishlistItems.indexOf(handle) !== -1) return;
  _wishlistItems.push(handle);
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEventMock('wishlist_add', { product_handle: handle, source: source || 'unknown' });
}

function removeFromWishlist(handle, source) {
  if (!handle) return;
  _wishlistItems = _wishlistItems.filter(function (h) {
    return h !== handle;
  });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEventMock('wishlist_remove', { product_handle: handle, source: source || 'unknown' });
}

function toggleWishlistItem(handle, source) {
  if (_wishlistItems.indexOf(handle) !== -1) {
    removeFromWishlist(handle, source);
  } else {
    addToWishlist(handle, source);
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

  var emptyMsg = panelEl.getAttribute('data-msg-empty') || "You haven't saved any products yet.";
  var viewMsg = panelEl.getAttribute('data-msg-view') || 'View product';
  var removeMsg = panelEl.getAttribute('data-msg-remove') || 'Remove from wishlist';

  if (_wishlistItems.length === 0) {
    body.innerHTML = '<p data-wishlist-empty>' + emptyMsg + '</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < _wishlistItems.length; i++) {
    var handle = _wishlistItems[i];
    var cached = _wishlistProductCache[handle] || {};
    var title = cached.title || handle;
    var price = cached.price || '';
    var imgSrc = cached.imageSrc || '';
    var imgHtml = imgSrc
      ? '<img src="' + imgSrc + '" alt="' + title.replace(/"/g, '&quot;') + '" loading="lazy" width="80" height="107">'
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
  body.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Preference functions — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem(PREFERRED_MODE_KEY, '3d');
  } catch (e) {}
}

function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem(PREFERRED_MODE_KEY);
  } catch (e) {}
}

function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem(PREFERRED_MODE_KEY) === '3d';
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Onboarding function — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function getFocusableElements(root) {
  var selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(selector)).filter(function (el) {
    return !el.disabled && el.offsetParent !== null;
  });
}

function showImmersiveOnboardingIfNeeded() {
  var overlay = document.getElementById('immersive-onboarding');
  if (!overlay) return;

  var showOnce = overlay.getAttribute('data-show-once') !== 'false';
  if (showOnce) {
    var seen = false;
    try {
      seen = !!localStorage.getItem(ONBOARDING_KEY);
    } catch (e) {}
    if (seen) return;
  }

  var previousFocus = document.activeElement;
  overlay.removeAttribute('hidden');

  var dismissBtn = overlay.querySelector('[data-onboarding-dismiss]');
  if (dismissBtn) {
    requestAnimationFrame(function () {
      dismissBtn.focus();
    });

    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusableElements(overlay);
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
      if (e.key === 'Escape') dismissBtn.click();
    }
    overlay.addEventListener('keydown', trapFocus);
    overlay.addEventListener('keydown', onEscape);

    dismissBtn.addEventListener('click', function onDismiss() {
      dismissBtn.removeEventListener('click', onDismiss);
      overlay.removeEventListener('keydown', trapFocus);
      overlay.removeEventListener('keydown', onEscape);
      if (showOnce) {
        try {
          localStorage.setItem(ONBOARDING_KEY, '1');
        } catch (e) {}
      }
      overlay.setAttribute('hidden', '');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        requestAnimationFrame(function () {
          previousFocus.focus();
        });
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Cookie banner function — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function bindCookieBanner() {
  var banner = document.getElementById('immersive-cookie-banner');
  if (!banner) return;

  var COOKIE_KEY = 'immersive_cookie_notice';
  try {
    if (localStorage.getItem(COOKIE_KEY)) return;
  } catch (e) {}

  banner.removeAttribute('hidden');

  function dismiss() {
    banner.setAttribute('hidden', '');
    try {
      localStorage.setItem(COOKIE_KEY, '1');
    } catch (e) {}
  }

  var acceptBtn = document.getElementById('immersive-cookie-accept');
  var declineBtn = document.getElementById('immersive-cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', dismiss);
  if (declineBtn) declineBtn.addEventListener('click', dismiss);
}

// ---------------------------------------------------------------------------
// Tests: getWishlist
// ---------------------------------------------------------------------------

describe('getWishlist', () => {
  beforeEach(() => {
    _wishlistItems = [];
  });

  test('returns empty array when no items', () => {
    expect(getWishlist()).toEqual([]);
  });

  test('returns copy of items array', () => {
    _wishlistItems = ['product-1', 'product-2'];
    var result = getWishlist();

    expect(result).toEqual(['product-1', 'product-2']);

    // Verify it's a copy, not the same reference
    result.push('product-3');
    expect(_wishlistItems).toEqual(['product-1', 'product-2']);
  });

  test('returns new array each call', () => {
    _wishlistItems = ['product-1'];
    var result1 = getWishlist();
    var result2 = getWishlist();

    expect(result1).not.toBe(result2);
    expect(result1).toEqual(result2);
  });
});

// ---------------------------------------------------------------------------
// Tests: addToWishlist
// ---------------------------------------------------------------------------

describe('addToWishlist', () => {
  beforeEach(() => {
    _wishlistItems = [];
    _wishlistProductCache = {};
    trackImmersiveEventMock = jest.fn();
    document.body.innerHTML = '';

    // Mock localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('adds handle to wishlist', () => {
    addToWishlist('product-1', 'test');
    expect(_wishlistItems).toContain('product-1');
  });

  test('does not add duplicate handles', () => {
    addToWishlist('product-1', 'test');
    addToWishlist('product-1', 'test');
    expect(_wishlistItems).toEqual(['product-1']);
  });

  test('does not add falsy handle', () => {
    addToWishlist(null, 'test');
    addToWishlist('', 'test');
    addToWishlist(undefined, 'test');
    expect(_wishlistItems).toEqual([]);
  });

  test('persists to localStorage', () => {
    addToWishlist('product-1', 'test');
    var stored = JSON.parse(localStorage.getItem(WISHLIST_KEY));
    expect(stored).toContain('product-1');
  });

  test('tracks analytics event with source', () => {
    addToWishlist('product-1', 'product_card');
    expect(trackImmersiveEventMock).toHaveBeenCalledWith('wishlist_add', {
      product_handle: 'product-1',
      source: 'product_card',
    });
  });

  test('tracks analytics with unknown source when not provided', () => {
    addToWishlist('product-1');
    expect(trackImmersiveEventMock).toHaveBeenCalledWith('wishlist_add', {
      product_handle: 'product-1',
      source: 'unknown',
    });
  });

  test('updates badge element', () => {
    var badge = document.createElement('span');
    badge.setAttribute('data-wishlist-badge', '');
    document.body.appendChild(badge);

    addToWishlist('product-1', 'test');

    expect(badge.textContent).toBe('1');
    expect(badge.hidden).toBe(false);
  });

  test('hides badge when empty after remove', () => {
    _wishlistItems = ['product-1'];

    var badge = document.createElement('span');
    badge.setAttribute('data-wishlist-badge', '');
    document.body.appendChild(badge);

    removeFromWishlist('product-1', 'test');

    expect(badge.hidden).toBe(true);
  });

  test('syncs toggle buttons', () => {
    var toggle = document.createElement('button');
    toggle.setAttribute('data-wishlist-toggle', '');
    toggle.setAttribute('data-product-handle', 'product-1');
    toggle.setAttribute('data-label-save', 'Save');
    toggle.setAttribute('data-label-saved', 'Saved');
    document.body.appendChild(toggle);

    addToWishlist('product-1', 'test');

    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.classList.contains('is-saved')).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe('Saved');
  });
});

// ---------------------------------------------------------------------------
// Tests: removeFromWishlist
// ---------------------------------------------------------------------------

describe('removeFromWishlist', () => {
  beforeEach(() => {
    _wishlistItems = ['product-1', 'product-2', 'product-3'];
    trackImmersiveEventMock = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('removes handle from wishlist', () => {
    removeFromWishlist('product-2', 'test');
    expect(_wishlistItems).toEqual(['product-1', 'product-3']);
  });

  test('does nothing if handle not in wishlist', () => {
    removeFromWishlist('non-existent', 'test');
    expect(_wishlistItems).toEqual(['product-1', 'product-2', 'product-3']);
  });

  test('does nothing if handle is falsy', () => {
    removeFromWishlist(null, 'test');
    removeFromWishlist('', 'test');
    expect(_wishlistItems).toEqual(['product-1', 'product-2', 'product-3']);
  });

  test('persists removal to localStorage', () => {
    removeFromWishlist('product-1', 'test');
    var stored = JSON.parse(localStorage.getItem(WISHLIST_KEY));
    expect(stored).not.toContain('product-1');
  });

  test('tracks analytics event', () => {
    removeFromWishlist('product-1', 'wishlist_panel');
    expect(trackImmersiveEventMock).toHaveBeenCalledWith('wishlist_remove', {
      product_handle: 'product-1',
      source: 'wishlist_panel',
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: toggleWishlistItem
// ---------------------------------------------------------------------------

describe('toggleWishlistItem', () => {
  beforeEach(() => {
    _wishlistItems = [];
    trackImmersiveEventMock = jest.fn();
    localStorage.clear();
  });

  test('adds item if not in wishlist', () => {
    toggleWishlistItem('product-1', 'test');
    expect(_wishlistItems).toContain('product-1');
  });

  test('removes item if in wishlist', () => {
    _wishlistItems = ['product-1'];
    toggleWishlistItem('product-1', 'test');
    expect(_wishlistItems).not.toContain('product-1');
  });

  test('passes source to add/remove', () => {
    toggleWishlistItem('product-1', 'product_card');
    expect(trackImmersiveEventMock).toHaveBeenCalledWith(
      'wishlist_add',
      expect.objectContaining({
        source: 'product_card',
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: cacheWishlistProduct
// ---------------------------------------------------------------------------

describe('cacheWishlistProduct', () => {
  beforeEach(() => {
    _wishlistProductCache = {};
  });

  test('caches product data from panel elements', () => {
    var panel = document.createElement('div');
    panel.innerHTML = `
      <h1 class="glass-product-section__title">Test Product</h1>
      <span class="glass-product-section__price">$99.00</span>
      <div class="glass-product-section__media-main">
        <img src="/test-image.jpg">
      </div>
    `;

    cacheWishlistProduct('product-1', panel);

    expect(_wishlistProductCache['product-1']).toEqual({
      title: 'Test Product',
      price: '$99.00',
      imageSrc: '/test-image.jpg',
    });
  });

  test('does nothing if handle is falsy', () => {
    cacheWishlistProduct(null, document.createElement('div'));
    cacheWishlistProduct('', document.createElement('div'));
    expect(Object.keys(_wishlistProductCache)).toHaveLength(0);
  });

  test('does nothing if panelEl is falsy', () => {
    cacheWishlistProduct('product-1', null);
    expect(Object.keys(_wishlistProductCache)).toHaveLength(0);
  });

  test('does nothing if title element missing', () => {
    var panel = document.createElement('div');
    panel.innerHTML = '<span class="glass-product-section__price">$99.00</span>';

    cacheWishlistProduct('product-1', panel);

    expect(_wishlistProductCache['product-1']).toBeUndefined();
  });

  test('handles missing optional elements', () => {
    var panel = document.createElement('div');
    panel.innerHTML = '<h1 class="glass-product-section__title">Test Product</h1>';

    cacheWishlistProduct('product-1', panel);

    expect(_wishlistProductCache['product-1']).toEqual({
      title: 'Test Product',
      price: '',
      imageSrc: '',
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: renderWishlistPanel
// ---------------------------------------------------------------------------

describe('renderWishlistPanel', () => {
  var body, panelEl;

  beforeEach(() => {
    _wishlistItems = [];
    _wishlistProductCache = {};
    document.body.innerHTML = '';

    body = document.createElement('div');
    body.setAttribute('data-wishlist-body', '');

    panelEl = document.createElement('div');
    panelEl.id = 'immersive-wishlist-panel';
    panelEl.setAttribute('data-msg-empty', 'No saved items');
    panelEl.setAttribute('data-msg-view', 'View');
    panelEl.setAttribute('data-msg-remove', 'Remove');

    document.body.appendChild(body);
    document.body.appendChild(panelEl);
  });

  test('shows empty message when no items', () => {
    renderWishlistPanel();

    expect(body.innerHTML).toContain('No saved items');
    expect(body.querySelector('[data-wishlist-empty]')).not.toBeNull();
  });

  test('renders cards for each item', () => {
    _wishlistItems = ['product-1', 'product-2'];
    _wishlistProductCache = {
      'product-1': { title: 'Product One', price: '$10', imageSrc: '/img1.jpg' },
      'product-2': { title: 'Product Two', price: '$20', imageSrc: '/img2.jpg' },
    };

    renderWishlistPanel();

    var cards = body.querySelectorAll('[data-wishlist-card]');
    expect(cards).toHaveLength(2);
  });

  test('renders product data from cache', () => {
    _wishlistItems = ['product-1'];
    _wishlistProductCache = {
      'product-1': { title: 'Test Product', price: '$99', imageSrc: '/test.jpg' },
    };

    renderWishlistPanel();

    expect(body.innerHTML).toContain('Test Product');
    expect(body.innerHTML).toContain('$99');
    expect(body.innerHTML).toContain('/test.jpg');
  });

  test('falls back to handle when not cached', () => {
    _wishlistItems = ['uncached-product'];

    renderWishlistPanel();

    expect(body.innerHTML).toContain('uncached-product');
  });

  test('renders placeholder when no image', () => {
    _wishlistItems = ['product-1'];
    _wishlistProductCache = {
      'product-1': { title: 'Test', price: '$10', imageSrc: '' },
    };

    renderWishlistPanel();

    expect(body.innerHTML).toContain('background:rgba(255,255,255,0.05)');
  });

  test('creates view and remove buttons with correct attributes', () => {
    _wishlistItems = ['product-1'];
    _wishlistProductCache = {
      'product-1': { title: 'Test', price: '$10', imageSrc: '' },
    };

    renderWishlistPanel();

    var viewBtn = body.querySelector('[data-wishlist-view]');
    var removeBtn = body.querySelector('[data-wishlist-remove]');

    expect(viewBtn).not.toBeNull();
    expect(removeBtn).not.toBeNull();
    expect(viewBtn.getAttribute('data-product-handle')).toBe('product-1');
    expect(removeBtn.getAttribute('data-product-handle')).toBe('product-1');
  });

  test('escapes quotes in aria-label for HTML safety', () => {
    _wishlistItems = ['product-1'];
    _wishlistProductCache = {
      'product-1': { title: 'Product with "quotes"', price: '$10', imageSrc: '' },
    };

    renderWishlistPanel();

    // The HTML should contain &quot; for the escaped quotes
    expect(body.innerHTML).toContain('&quot;');
  });

  test('returns early if body element missing', () => {
    body.remove();
    renderWishlistPanel();
    // Should not throw
  });

  test('returns early if panel element missing', () => {
    panelEl.remove();
    renderWishlistPanel();
    // Should not throw
  });
});

// ---------------------------------------------------------------------------
// Tests: writeImmersivePreference
// ---------------------------------------------------------------------------

describe('writeImmersivePreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('writes 3d preference to localStorage', () => {
    writeImmersivePreference();
    expect(localStorage.getItem(PREFERRED_MODE_KEY)).toBe('3d');
  });

  test('uses provided storage object', () => {
    var mockStorage = {};
    mockStorage.setItem = jest.fn();

    writeImmersivePreference(mockStorage);

    expect(mockStorage.setItem).toHaveBeenCalledWith(PREFERRED_MODE_KEY, '3d');
  });

  test('handles localStorage errors gracefully', () => {
    var originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw
    expect(() => writeImmersivePreference()).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
});

// ---------------------------------------------------------------------------
// Tests: readImmersivePreference
// ---------------------------------------------------------------------------

describe('readImmersivePreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns true when preference is 3d', () => {
    localStorage.setItem(PREFERRED_MODE_KEY, '3d');
    expect(readImmersivePreference()).toBe(true);
  });

  test('returns false when preference is not set', () => {
    expect(readImmersivePreference()).toBe(false);
  });

  test('returns false when preference is other value', () => {
    localStorage.setItem(PREFERRED_MODE_KEY, '2d');
    expect(readImmersivePreference()).toBe(false);
  });

  test('uses provided storage object', () => {
    var mockStorage = {
      getItem: jest.fn().mockReturnValue('3d'),
    };

    expect(readImmersivePreference(mockStorage)).toBe(true);
    expect(mockStorage.getItem).toHaveBeenCalledWith(PREFERRED_MODE_KEY);
  });

  test('returns false on localStorage error', () => {
    var mockStorage = {
      getItem: jest.fn(() => {
        throw new Error('Access denied');
      }),
    };

    expect(readImmersivePreference(mockStorage)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: showImmersiveOnboardingIfNeeded
// ---------------------------------------------------------------------------

describe('showImmersiveOnboardingIfNeeded', () => {
  var overlay, dismissBtn;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';

    dismissBtn = document.createElement('button');
    dismissBtn.setAttribute('data-onboarding-dismiss', '');

    overlay = document.createElement('div');
    overlay.id = 'immersive-onboarding';
    overlay.setAttribute('hidden', '');
    overlay.setAttribute('data-show-once', 'true');
    overlay.appendChild(dismissBtn);

    document.body.appendChild(overlay);

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows overlay when not seen before', () => {
    showImmersiveOnboardingIfNeeded();
    expect(overlay.hasAttribute('hidden')).toBe(false);
  });

  test('does not show overlay if already seen', () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    showImmersiveOnboardingIfNeeded();
    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  test('shows overlay if data-show-once is false', () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    overlay.setAttribute('data-show-once', 'false');

    showImmersiveOnboardingIfNeeded();

    expect(overlay.hasAttribute('hidden')).toBe(false);
  });

  test('returns early if overlay element missing', () => {
    overlay.remove();
    showImmersiveOnboardingIfNeeded();
    // Should not throw
  });

  test('focuses dismiss button on show', () => {
    showImmersiveOnboardingIfNeeded();
    expect(document.activeElement).toBe(dismissBtn);
  });

  test('writes to localStorage on dismiss', () => {
    showImmersiveOnboardingIfNeeded();
    dismissBtn.click();

    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('1');
  });

  test('hides overlay on dismiss', () => {
    showImmersiveOnboardingIfNeeded();
    dismissBtn.click();

    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  test('restores focus on dismiss', () => {
    var previousBtn = document.createElement('button');
    document.body.appendChild(previousBtn);
    previousBtn.focus();

    showImmersiveOnboardingIfNeeded();
    dismissBtn.click();

    expect(document.activeElement).toBe(previousBtn);
  });

  test('escape key triggers dismiss', () => {
    showImmersiveOnboardingIfNeeded();

    var escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    overlay.dispatchEvent(escapeEvent);

    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  test('shows overlay even without dismiss button', () => {
    dismissBtn.remove();
    showImmersiveOnboardingIfNeeded();

    expect(overlay.hasAttribute('hidden')).toBe(false);
  });

  test('handles localStorage blocked gracefully', () => {
    var originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Access denied');
    });

    // Should not throw and should show overlay
    expect(() => showImmersiveOnboardingIfNeeded()).not.toThrow();
    expect(overlay.hasAttribute('hidden')).toBe(false);

    localStorage.getItem = originalGetItem;
  });
});

// ---------------------------------------------------------------------------
// Tests: bindCookieBanner
// ---------------------------------------------------------------------------

describe('bindCookieBanner', () => {
  var banner, acceptBtn, declineBtn;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';

    acceptBtn = document.createElement('button');
    acceptBtn.id = 'immersive-cookie-accept';

    declineBtn = document.createElement('button');
    declineBtn.id = 'immersive-cookie-decline';

    banner = document.createElement('div');
    banner.id = 'immersive-cookie-banner';
    banner.setAttribute('hidden', '');
    banner.appendChild(acceptBtn);
    banner.appendChild(declineBtn);

    document.body.appendChild(banner);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows banner when not dismissed before', () => {
    bindCookieBanner();
    expect(banner.hasAttribute('hidden')).toBe(false);
  });

  test('does not show banner if already dismissed', () => {
    localStorage.setItem('immersive_cookie_notice', '1');
    bindCookieBanner();
    expect(banner.hasAttribute('hidden')).toBe(true);
  });

  test('returns early if banner element missing', () => {
    banner.remove();
    bindCookieBanner();
    // Should not throw
  });

  test('accept button dismisses banner', () => {
    bindCookieBanner();
    acceptBtn.click();

    expect(banner.hasAttribute('hidden')).toBe(true);
    expect(localStorage.getItem('immersive_cookie_notice')).toBe('1');
  });

  test('decline button dismisses banner', () => {
    bindCookieBanner();
    declineBtn.click();

    expect(banner.hasAttribute('hidden')).toBe(true);
    expect(localStorage.getItem('immersive_cookie_notice')).toBe('1');
  });

  test('handles missing accept button', () => {
    acceptBtn.remove();
    bindCookieBanner();
    // Should not throw
    expect(banner.hasAttribute('hidden')).toBe(false);
  });

  test('handles missing decline button', () => {
    declineBtn.remove();
    bindCookieBanner();
    // Should not throw
    expect(banner.hasAttribute('hidden')).toBe(false);
  });

  test('handles localStorage blocked on read', () => {
    var originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Access denied');
    });

    // Should not throw and should show banner
    expect(() => bindCookieBanner()).not.toThrow();
    expect(banner.hasAttribute('hidden')).toBe(false);

    localStorage.getItem = originalGetItem;
  });

  test('handles localStorage blocked on write', () => {
    var originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });

    bindCookieBanner();

    // Should not throw on click
    expect(() => acceptBtn.click()).not.toThrow();
    expect(banner.hasAttribute('hidden')).toBe(true);

    localStorage.setItem = originalSetItem;
  });
});
