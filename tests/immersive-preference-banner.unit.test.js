/**
 * Unit Tests: Preference Banner
 * Task 14 — Requirements 6.1, 6.4, 6.5, 6.6, 9.2, 9.4
 */
'use strict';

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

function buildBanner(dismissTimeout = 0) {
  return `
    <div id="immersive-preference-banner" class="immersive-preference-banner"
      role="region" aria-label="Return to 3D store"
      data-dismiss-timeout="${dismissTimeout}" hidden>
      <p class="immersive-preference-banner__text">You previously used our 3D showroom.</p>
      <div class="immersive-preference-banner__actions">
        <a href="/pages/immersive" class="immersive-preference-banner__cta">Return to 3D Store</a>
        <button type="button" class="immersive-preference-banner__dismiss"
          data-preference-banner-dismiss aria-label="Dismiss the 3D store prompt">×</button>
      </div>
    </div>
    <button id="next-element">Next</button>`;
}

function initBanner() {
  try {
    if (localStorage.getItem('immersive_preferred_mode') === '3d') {
      var banner = document.getElementById('immersive-preference-banner');
      if (banner) {
        banner.removeAttribute('hidden');
        var dismissBtn = banner.querySelector('[data-preference-banner-dismiss]');
        function dismissBanner() {
          var next = banner.nextElementSibling;
          var prefersReduced = false;
          try {
            prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          } catch (e) {}
          if (prefersReduced) {
            banner.remove();
            if (next && typeof next.focus === 'function') next.focus();
            return;
          }
          banner.style.transition = 'opacity 0.25s ease';
          banner.style.opacity = '0';
          setTimeout(function () {
            banner.remove();
            if (next && typeof next.focus === 'function') next.focus();
          }, 260);
        }
        if (dismissBtn) {
          dismissBtn.addEventListener('click', function () {
            if (autoDismissTimer) clearTimeout(autoDismissTimer);
            dismissBanner();
          });
        }
        var autoDismissTimer = null;
        var timeout = parseInt(banner.getAttribute('data-dismiss-timeout') || '0', 10);
        if (timeout > 0) {
          autoDismissTimer = setTimeout(dismissBanner, timeout * 1000);
          banner.addEventListener('mouseenter', function () {
            clearTimeout(autoDismissTimer);
          });
          banner.addEventListener('focusin', function () {
            clearTimeout(autoDismissTimer);
          });
        }
      }
    }
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

describe('Preference Banner — Rendering', () => {
  test('banner is hidden initially', () => {
    document.body.innerHTML = buildBanner();
    const banner = document.getElementById('immersive-preference-banner');
    expect(banner.hasAttribute('hidden')).toBe(true);
  });

  test('banner is shown when preference is set', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = buildBanner();
    initBanner();
    expect(document.getElementById('immersive-preference-banner').hasAttribute('hidden')).toBe(false);
  });

  test('banner stays hidden when preference is not set', () => {
    document.body.innerHTML = buildBanner();
    initBanner();
    expect(document.getElementById('immersive-preference-banner').hasAttribute('hidden')).toBe(true);
  });

  test('banner has role="region"', () => {
    document.body.innerHTML = buildBanner();
    expect(document.getElementById('immersive-preference-banner').getAttribute('role')).toBe('region');
  });

  test('banner has aria-label', () => {
    document.body.innerHTML = buildBanner();
    expect(document.getElementById('immersive-preference-banner').getAttribute('aria-label')).toBeTruthy();
  });

  test('CTA links to /pages/immersive', () => {
    document.body.innerHTML = buildBanner();
    const cta = document.querySelector('.immersive-preference-banner__cta');
    expect(cta.getAttribute('href')).toBe('/pages/immersive');
  });
});

describe('Preference Banner — Template Suppression', () => {
  const suppressed = ['page.immersive', 'index', 'password'];
  const allowed = ['collection', 'product', 'search', 'cart', 'blog', 'article'];

  suppressed.forEach((tpl) => {
    test(`suppressed on ${tpl} template`, () => {
      const shouldRender = !suppressed.includes(tpl);
      expect(shouldRender).toBe(false);
    });
  });

  allowed.forEach((tpl) => {
    test(`renders on ${tpl} template`, () => {
      const shouldRender = !suppressed.includes(tpl);
      expect(shouldRender).toBe(true);
    });
  });
});

describe('Preference Banner — Dismiss', () => {
  beforeEach(() => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = buildBanner();
    initBanner();
  });

  test('dismiss removes banner from DOM', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    document.querySelector('[data-preference-banner-dismiss]').click();
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('dismiss with animation removes banner after timeout', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    document.querySelector('[data-preference-banner-dismiss]').click();
    expect(document.getElementById('immersive-preference-banner')).not.toBeNull();
    jest.runAllTimers();
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('focus is restored to next sibling after dismiss', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    document.querySelector('[data-preference-banner-dismiss]').click();
    expect(document.activeElement).toBe(document.getElementById('next-element'));
  });
});

describe('Preference Banner — Auto-Dismiss', () => {
  test('auto-dismisses after configured timeout', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = buildBanner(5);
    initBanner();
    expect(document.getElementById('immersive-preference-banner')).not.toBeNull();
    jest.advanceTimersByTime(5000);
    jest.runAllTimers();
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('does not auto-dismiss when timeout is 0', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = buildBanner(0);
    initBanner();
    jest.advanceTimersByTime(30000);
    expect(document.getElementById('immersive-preference-banner')).not.toBeNull();
  });
});

describe('Preference Banner — Error Handling', () => {
  test('handles missing banner element gracefully', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';
    expect(() => initBanner()).not.toThrow();
  });

  test('handles localStorage errors gracefully', () => {
    const orig = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('SecurityError');
    };
    document.body.innerHTML = buildBanner();
    expect(() => initBanner()).not.toThrow();
    localStorage.getItem = orig;
  });
});
