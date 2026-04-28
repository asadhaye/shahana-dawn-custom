/**
 * Unit Tests: Bridge Button Rendering
 * Task 13 — Requirements 1.1, 1.3, 1.5, 15.2, 15.4, 15.13
 */
'use strict';

// Helpers mirroring Liquid snippet logic
function shouldRenderBridge(itemCount) {
  return itemCount > 0;
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function buildBridgeHtml({ url, label, aria, modifier, heading, subtext }) {
  const modClass = modifier ? ` immersive-bridge-btn--${modifier}` : '';
  const headingHtml = heading ? `<h3 class="immersive-bridge-btn__heading">${escapeHtml(heading)}</h3>` : '';
  const subtextHtml = subtext ? `<span class="immersive-bridge-btn__subtext">${escapeHtml(subtext)}</span>` : '';
  return `<a href="${url}" class="immersive-bridge-btn${modClass}" aria-label="${escapeHtml(aria)}" data-immersive-bridge>
    <span class="immersive-bridge-btn__content">
      ${headingHtml}
      <span class="immersive-bridge-btn__label">${escapeHtml(label)}</span>
      ${subtextHtml}
    </span>
  </a>`;
}

describe('Bridge Button — Conditional Rendering', () => {
  test('renders when collection has products', () => {
    expect(shouldRenderBridge(5)).toBe(true);
  });
  test('renders when collection has exactly 1 product', () => {
    expect(shouldRenderBridge(1)).toBe(true);
  });
  test('does not render when collection is empty', () => {
    expect(shouldRenderBridge(0)).toBe(false);
  });
  test('renders when search has results', () => {
    expect(shouldRenderBridge(12)).toBe(true);
  });
  test('does not render when search has no results', () => {
    expect(shouldRenderBridge(0)).toBe(false);
  });
});

describe('Bridge Button — Semantic HTML', () => {
  test('root element is an <a> tag', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_collection=test',
      label: 'Explore in 3D',
      aria: 'Explore Test Collection in 3D',
      modifier: 'collection',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.tagName).toBe('A');
  });

  test('href points to /pages/immersive', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_collection=suffuse',
      label: 'Explore in 3D',
      aria: 'Explore Suffuse in 3D',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.getAttribute('href')).toContain('/pages/immersive');
  });

  test('has data-immersive-bridge attribute', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'Enter 3D',
      aria: 'Enter 3D Store',
    });
    expect(document.querySelector('[data-immersive-bridge]')).not.toBeNull();
  });
});

describe('Bridge Button — ARIA Labels', () => {
  test('aria-label includes collection title', () => {
    const title = 'Suffuse Collection';
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_collection=suffuse',
      label: 'Explore in 3D',
      aria: `Explore ${title} in 3D`,
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.getAttribute('aria-label')).toContain(title);
  });

  test('aria-label includes product title', () => {
    const title = 'Silk Saree';
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_product=silk-saree',
      label: 'View in 3D',
      aria: `View ${title} in 3D Store`,
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.getAttribute('aria-label')).toContain(title);
  });

  test('aria-label is not empty', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'Enter 3D',
      aria: 'Enter the 3D immersive store',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.getAttribute('aria-label').length).toBeGreaterThan(0);
  });
});

describe('Bridge Button — HTML Escaping', () => {
  test('heading with < > is escaped', () => {
    const heading = '<script>alert(1)</script>';
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'Enter 3D',
      aria: 'Enter 3D Store',
      heading,
    });
    const h3 = document.querySelector('.immersive-bridge-btn__heading');
    expect(h3.innerHTML).not.toContain('<script>');
    expect(h3.innerHTML).toContain('&lt;script&gt;');
  });

  test('label with & is escaped', () => {
    const label = 'Explore & Discover';
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label,
      aria: 'Explore and Discover in 3D',
    });
    const labelEl = document.querySelector('.immersive-bridge-btn__label');
    expect(labelEl.innerHTML).toContain('&amp;');
  });

  test('aria-label with quotes is escaped', () => {
    const aria = 'View "Silk Saree" in 3D';
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'View in 3D',
      aria,
    });
    const el = document.querySelector('[data-immersive-bridge]');
    // The DOM attribute value will have the unescaped string
    expect(el.getAttribute('aria-label')).toBe(aria);
  });
});

describe('Bridge Button — BEM Modifier Classes', () => {
  test('collection modifier class is applied', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_collection=test',
      label: 'Explore in 3D',
      aria: 'Explore in 3D',
      modifier: 'collection',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.classList.contains('immersive-bridge-btn--collection')).toBe(true);
  });

  test('product modifier class is applied', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive?open_product=test',
      label: 'View in 3D',
      aria: 'View in 3D',
      modifier: 'product',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.classList.contains('immersive-bridge-btn--product')).toBe(true);
  });

  test('base class is always present', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'Enter 3D',
      aria: 'Enter 3D',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.classList.contains('immersive-bridge-btn')).toBe(true);
  });

  test('no modifier means only base class', () => {
    document.body.innerHTML = buildBridgeHtml({
      url: '/pages/immersive',
      label: 'Enter 3D',
      aria: 'Enter 3D',
    });
    const el = document.querySelector('[data-immersive-bridge]');
    expect(el.className).toBe('immersive-bridge-btn');
  });
});
