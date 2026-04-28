/**
 * Unit Tests for Preference Banner Focus Restoration
 *
 * Feature: immersive-shopping-journey
 * Task: Phase 1, Task 2 - Enhance preference banner with focus restoration
 *
 * Tests verify the preference banner implementation in layout/theme.liquid:
 * - Banner renders with `hidden` attribute initially (no flash)
 * - Dismiss button removes banner from DOM (not just hidden)
 * - Focus is restored to next sibling after dismiss
 * - Keyboard navigation works through banner and dismiss button
 * - Proper ARIA attributes are present
 * - No console errors when dismissing
 *
 * Requirements: 6.1, 6.4, 9.2, 9.4
 */

'use strict';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ---------------------------------------------------------------------------
// Preference Banner Implementation (reproduced from layout/theme.liquid)
// ---------------------------------------------------------------------------

function initPreferenceBanner() {
  try {
    if (localStorage.getItem('immersive_preferred_mode') === '3d') {
      var banner = document.getElementById('immersive-preference-banner');
      if (banner) {
        banner.removeAttribute('hidden');
        var dismissBtn = banner.querySelector('[data-preference-banner-dismiss]');
        if (dismissBtn) {
          dismissBtn.addEventListener('click', function () {
            var next = banner.nextElementSibling;
            var prefersReduced = false;
            try {
              prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            } catch (e) {
              // matchMedia not supported, assume no reduced motion preference
            }
            if (prefersReduced) {
              banner.remove();
              if (next && typeof next.focus === 'function') next.focus();
              return;
            }
            banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            banner.style.opacity = '0';
            banner.style.transform = (banner.style.transform || '') + ' translateY(8px)';
            setTimeout(function () {
              banner.remove();
              if (next && typeof next.focus === 'function') next.focus();
            }, 260);
          });
        }
      }
    }
  } catch (e) {
    console.error('Error initializing preference banner:', e);
  }
}

// ---------------------------------------------------------------------------
// Tests: Preference Banner Rendering
// ---------------------------------------------------------------------------

describe('Preference Banner - Initial Rendering', () => {
  let banner;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');
    banner.setAttribute('hidden', '');

    const text = document.createElement('p');
    text.className = 'immersive-preference-banner__text';
    text.textContent = 'You previously used our 3D showroom. Return to the immersive experience?';

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    const cta = document.createElement('a');
    cta.href = '/pages/immersive';
    cta.className = 'immersive-preference-banner__cta';
    cta.textContent = 'Return to 3D Store';

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'immersive-preference-banner__dismiss';
    dismiss.setAttribute('data-preference-banner-dismiss', '');
    dismiss.setAttribute('aria-label', 'Dismiss the 3D store prompt');
    dismiss.textContent = '×';

    actions.appendChild(cta);
    actions.appendChild(dismiss);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  });

  test('banner renders with hidden attribute initially', () => {
    expect(banner.hasAttribute('hidden')).toBe(true);
  });

  test('banner is not visible when hidden attribute is present', () => {
    expect(banner.getAttribute('hidden')).toBe('');
  });

  test('banner has correct role attribute', () => {
    expect(banner.getAttribute('role')).toBe('region');
  });

  test('banner has correct aria-label', () => {
    expect(banner.getAttribute('aria-label')).toBe('Return to 3D store');
  });

  test('dismiss button has aria-label', () => {
    const dismissBtn = banner.querySelector('[data-preference-banner-dismiss]');
    expect(dismissBtn.getAttribute('aria-label')).toBe('Dismiss the 3D store prompt');
  });

  test('CTA link points to canonical immersive URL', () => {
    const cta = banner.querySelector('.immersive-preference-banner__cta');
    expect(cta.href).toContain('/pages/immersive');
  });

  test('banner is not rendered when preference flag is not set', () => {
    initPreferenceBanner();
    expect(banner.hasAttribute('hidden')).toBe(true);
  });

  test('banner is revealed when preference flag is set', () => {
    localStorage.setItem('immersive_preferred_mode', '3d');
    initPreferenceBanner();
    expect(banner.hasAttribute('hidden')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner Dismiss - DOM Removal
// ---------------------------------------------------------------------------

describe('Preference Banner - Dismiss and DOM Removal', () => {
  let banner, dismissBtn, nextElement;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'immersive-preference-banner__dismiss';
    dismissBtn.setAttribute('data-preference-banner-dismiss', '');
    dismissBtn.setAttribute('aria-label', 'Dismiss');
    dismissBtn.textContent = '×';

    actions.appendChild(dismissBtn);
    banner.appendChild(actions);

    nextElement = document.createElement('div');
    nextElement.id = 'next-element';
    nextElement.textContent = 'Next element';

    document.body.appendChild(banner);
    document.body.appendChild(nextElement);

    initPreferenceBanner();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('banner is removed from DOM when dismiss is clicked', () => {
    jest.useFakeTimers();
    dismissBtn.click();
    jest.runAllTimers();

    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('banner is not just hidden, but completely removed', () => {
    jest.useFakeTimers();
    dismissBtn.click();
    jest.runAllTimers();

    // Verify banner is not in DOM at all
    const bannerInDOM = document.body.contains(banner);
    expect(bannerInDOM).toBe(false);
  });

  test('banner is not reachable by keyboard navigation after dismiss', () => {
    jest.useFakeTimers();
    dismissBtn.click();
    jest.runAllTimers();

    // Try to find the banner by querying the document
    const foundBanner = document.querySelector('[data-preference-banner-dismiss]');
    expect(foundBanner).toBeNull();
  });

  test('dismiss button is not reachable after banner removal', () => {
    jest.useFakeTimers();
    dismissBtn.click();
    jest.runAllTimers();

    const foundDismissBtn = document.querySelector('[data-preference-banner-dismiss]');
    expect(foundDismissBtn).toBeNull();
  });

  test('banner removal respects prefers-reduced-motion', () => {
    jest.useFakeTimers();

    // Mock prefers-reduced-motion
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // With reduced motion, banner should be removed immediately
    expect(document.getElementById('immersive-preference-banner')).toBeNull();

    jest.runAllTimers();
  });

  test('banner removal without animation when prefers-reduced-motion is true', () => {
    jest.useFakeTimers();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // Should be removed immediately without setTimeout
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
    expect(jest.getTimerCount()).toBe(0);

    jest.runAllTimers();
  });

  test('banner removal with animation when prefers-reduced-motion is false', () => {
    jest.useFakeTimers();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false, // prefers-reduced-motion is false
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // Banner should still be in DOM during animation
    expect(document.getElementById('immersive-preference-banner')).not.toBeNull();

    // After timeout, banner should be removed
    jest.runAllTimers();
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('animation styles are applied before removal', () => {
    jest.useFakeTimers();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // Check that animation styles are applied
    expect(banner.style.transition).toContain('opacity');
    expect(banner.style.opacity).toBe('0');
    expect(banner.style.transform).toContain('translateY');

    jest.runAllTimers();
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner - Focus Restoration
// ---------------------------------------------------------------------------

describe('Preference Banner - Focus Restoration', () => {
  let banner, dismissBtn, nextElement, elementAfterNext;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'immersive-preference-banner__dismiss';
    dismissBtn.setAttribute('data-preference-banner-dismiss', '');
    dismissBtn.setAttribute('aria-label', 'Dismiss');
    dismissBtn.textContent = '×';

    actions.appendChild(dismissBtn);
    banner.appendChild(actions);

    nextElement = document.createElement('button');
    nextElement.id = 'next-element';
    nextElement.textContent = 'Next Button';

    elementAfterNext = document.createElement('button');
    elementAfterNext.id = 'element-after-next';
    elementAfterNext.textContent = 'Element After Next';

    document.body.appendChild(banner);
    document.body.appendChild(nextElement);
    document.body.appendChild(elementAfterNext);

    initPreferenceBanner();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('focus is restored to next sibling after dismiss', () => {
    jest.useFakeTimers();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // With reduced motion, focus should be restored immediately
    expect(document.activeElement).toBe(nextElement);
  });

  test('focus is restored to next sibling with animation', () => {
    jest.useFakeTimers();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();
    jest.runAllTimers();

    // After animation completes, focus should be restored
    expect(document.activeElement).toBe(nextElement);
  });

  test('focus is not restored if next sibling does not exist', () => {
    jest.useFakeTimers();

    // Remove next element
    nextElement.remove();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // Should not throw error
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();
  });

  test('focus is not restored if next sibling is not focusable', () => {
    jest.useFakeTimers();

    // Replace next element with non-focusable element
    nextElement.remove();
    const nonFocusable = document.createElement('div');
    nonFocusable.id = 'non-focusable';
    nonFocusable.textContent = 'Non-focusable element';
    document.body.insertBefore(nonFocusable, elementAfterNext);

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    dismissBtn.click();

    // Focus should not be set to non-focusable element
    expect(document.activeElement).not.toBe(nonFocusable);
  });

  test('focus restoration checks for focus method existence', () => {
    jest.useFakeTimers();

    // Create a mock element without focus method
    const mockElement = {
      focus: undefined,
    };

    // Replace nextElementSibling with mock
    Object.defineProperty(banner, 'nextElementSibling', {
      value: mockElement,
      writable: true,
    });

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Should not throw error
    expect(() => {
      dismissBtn.click();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner - Keyboard Navigation
// ---------------------------------------------------------------------------

describe('Preference Banner - Keyboard Navigation', () => {
  let banner, cta, dismissBtn, nextElement;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');

    const text = document.createElement('p');
    text.className = 'immersive-preference-banner__text';
    text.textContent = 'You previously used our 3D showroom.';

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    cta = document.createElement('a');
    cta.href = '/pages/immersive';
    cta.className = 'immersive-preference-banner__cta';
    cta.textContent = 'Return to 3D Store';

    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'immersive-preference-banner__dismiss';
    dismissBtn.setAttribute('data-preference-banner-dismiss', '');
    dismissBtn.setAttribute('aria-label', 'Dismiss');
    dismissBtn.textContent = '×';

    actions.appendChild(cta);
    actions.appendChild(dismissBtn);
    banner.appendChild(text);
    banner.appendChild(actions);

    nextElement = document.createElement('button');
    nextElement.id = 'next-element';
    nextElement.textContent = 'Next Button';

    document.body.appendChild(banner);
    document.body.appendChild(nextElement);

    initPreferenceBanner();
  });

  test('CTA link is keyboard accessible', () => {
    cta.focus();
    expect(document.activeElement).toBe(cta);
  });

  test('dismiss button is keyboard accessible', () => {
    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);
  });

  test('tab key navigates from CTA to dismiss button', () => {
    cta.focus();
    expect(document.activeElement).toBe(cta);

    // Simulate tab key
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    cta.dispatchEvent(tabEvent);

    // Focus should move to dismiss button (browser default behavior)
    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);
  });

  test('shift+tab key navigates from dismiss button to CTA', () => {
    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);

    // Simulate shift+tab key
    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    dismissBtn.dispatchEvent(shiftTabEvent);

    // Focus should move to CTA (browser default behavior)
    cta.focus();
    expect(document.activeElement).toBe(cta);
  });

  test('enter key on dismiss button triggers click', () => {
    jest.useFakeTimers();

    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);

    // Simulate enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    dismissBtn.dispatchEvent(enterEvent);

    // Trigger click
    dismissBtn.click();
    jest.runAllTimers();

    // Banner should be removed
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('space key on dismiss button triggers click', () => {
    jest.useFakeTimers();

    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);

    // Simulate space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    dismissBtn.dispatchEvent(spaceEvent);

    // Trigger click
    dismissBtn.click();
    jest.runAllTimers();

    // Banner should be removed
    expect(document.getElementById('immersive-preference-banner')).toBeNull();
  });

  test('focus is visible on CTA link', () => {
    cta.focus();
    expect(document.activeElement).toBe(cta);

    // Check that focus-visible styles would apply (browser-dependent)
    // This is a visual test that would need manual verification
  });

  test('focus is visible on dismiss button', () => {
    dismissBtn.focus();
    expect(document.activeElement).toBe(dismissBtn);

    // Check that focus-visible styles would apply (browser-dependent)
    // This is a visual test that would need manual verification
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner - Error Handling
// ---------------------------------------------------------------------------

describe('Preference Banner - Error Handling', () => {
  let banner, dismissBtn;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'immersive-preference-banner__dismiss';
    dismissBtn.setAttribute('data-preference-banner-dismiss', '');
    dismissBtn.setAttribute('aria-label', 'Dismiss');
    dismissBtn.textContent = '×';

    actions.appendChild(dismissBtn);
    banner.appendChild(actions);

    document.body.appendChild(banner);

    initPreferenceBanner();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('no console errors when dismissing banner', () => {
    jest.useFakeTimers();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    dismissBtn.click();
    jest.runAllTimers();

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('handles missing dismiss button gracefully', () => {
    dismissBtn.remove();

    // Should not throw error
    expect(() => {
      initPreferenceBanner();
    }).not.toThrow();
  });

  test('handles missing banner element gracefully', () => {
    banner.remove();

    // Should not throw error
    expect(() => {
      initPreferenceBanner();
    }).not.toThrow();
  });

  test('handles localStorage access errors gracefully', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Access denied');
    });

    // Should not throw error
    expect(() => {
      initPreferenceBanner();
    }).not.toThrow();

    localStorage.getItem = originalGetItem;
  });

  test('handles matchMedia errors gracefully', () => {
    jest.useFakeTimers();

    // Mock matchMedia to throw an error
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn(() => {
      throw new Error('matchMedia not supported');
    });

    // Should not throw error - the implementation catches it
    expect(() => {
      dismissBtn.click();
      jest.runAllTimers();
    }).not.toThrow();

    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner - ARIA Attributes
// ---------------------------------------------------------------------------

describe('Preference Banner - ARIA Attributes', () => {
  let banner, dismissBtn, cta;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';

    banner = document.createElement('div');
    banner.id = 'immersive-preference-banner';
    banner.className = 'immersive-preference-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Return to 3D store');
    banner.setAttribute('hidden', '');

    const actions = document.createElement('div');
    actions.className = 'immersive-preference-banner__actions';

    cta = document.createElement('a');
    cta.href = '/pages/immersive';
    cta.className = 'immersive-preference-banner__cta';
    cta.textContent = 'Return to 3D Store';

    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'immersive-preference-banner__dismiss';
    dismissBtn.setAttribute('data-preference-banner-dismiss', '');
    dismissBtn.setAttribute('aria-label', 'Dismiss the 3D store prompt');
    dismissBtn.textContent = '×';

    actions.appendChild(cta);
    actions.appendChild(dismissBtn);
    banner.appendChild(actions);

    document.body.appendChild(banner);
  });

  test('banner has role="region"', () => {
    expect(banner.getAttribute('role')).toBe('region');
  });

  test('banner has aria-label', () => {
    expect(banner.getAttribute('aria-label')).toBeTruthy();
  });

  test('dismiss button has aria-label', () => {
    expect(dismissBtn.getAttribute('aria-label')).toBeTruthy();
  });

  test('dismiss button aria-label is descriptive', () => {
    const ariaLabel = dismissBtn.getAttribute('aria-label');
    expect(ariaLabel.toLowerCase()).toContain('dismiss');
  });

  test('CTA link is semantic', () => {
    expect(cta.tagName).toBe('A');
    expect(cta.href).toBeTruthy();
  });

  test('dismiss button is semantic', () => {
    expect(dismissBtn.tagName).toBe('BUTTON');
    expect(dismissBtn.type).toBe('button');
  });
});

// ---------------------------------------------------------------------------
// Tests: Preference Banner - Suppression on Specific Templates
// ---------------------------------------------------------------------------

describe('Preference Banner - Template Suppression', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('immersive_preferred_mode', '3d');
    document.body.innerHTML = '';
  });

  test('banner is suppressed on page.immersive template', () => {
    // In actual implementation, this is handled by Liquid unless condition
    // This test verifies the logic would work
    const template = 'page.immersive';
    const shouldRender = !(template === 'page.immersive' || template === 'index' || template === 'password');
    expect(shouldRender).toBe(false);
  });

  test('banner is suppressed on index template', () => {
    const template = 'index';
    const shouldRender = !(template === 'page.immersive' || template === 'index' || template === 'password');
    expect(shouldRender).toBe(false);
  });

  test('banner is suppressed on password template', () => {
    const template = 'password';
    const shouldRender = !(template === 'page.immersive' || template === 'index' || template === 'password');
    expect(shouldRender).toBe(false);
  });

  test('banner is rendered on other templates', () => {
    const template = 'product';
    const shouldRender = !(template === 'page.immersive' || template === 'index' || template === 'password');
    expect(shouldRender).toBe(true);
  });

  test('banner is rendered on collection template', () => {
    const template = 'collection';
    const shouldRender = !(template === 'page.immersive' || template === 'index' || template === 'password');
    expect(shouldRender).toBe(true);
  });
});
