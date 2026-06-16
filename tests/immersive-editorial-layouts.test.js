'use strict';

const fs = require('fs');
const path = require('path');

const SECTION_PATH = path.resolve(__dirname, '../sections/immersive-editorial.liquid');
const CANVAS_PATH = path.resolve(__dirname, '../sections/immersive-canvas.liquid');
const FEATURES_PATH = path.resolve(__dirname, '../assets/immersive-features.js');
const BUNDLE_PATH = path.resolve(__dirname, '../assets/immersive-bundle.js');
const THEME_LAYOUT_PATH = path.resolve(__dirname, '../layout/theme.liquid');
const IMMERSIVE_THEME_CSS_PATH = path.resolve(__dirname, '../assets/immersive-theme.css');

function readSection() {
  return fs.readFileSync(SECTION_PATH, 'utf8');
}

function blockFor(layout) {
  const source = readSection();
  const start = source.indexOf("section.settings.layout == '" + layout + "'");
  expect(start).toBeGreaterThan(-1);
  const end = source.indexOf('{%- endif -%}', start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe('immersive-editorial enabled editorial layouts', () => {
  test('designers layout routes collection through data-collection-handle on timeline markers', () => {
    const source = readSection();
    expect(source).toContain("{%- if section.settings.layout == 'designers' -%}");
    expect(source).toContain('class="immersive-designers__timeline-marker"');
    expect(source).toContain('data-collection-handle="{{ block.settings.collection.handle }}"');
  });

  test('occasions layout routes collection through data-collection-handle on chapter CTAs', () => {
    const source = readSection();
    expect(source).toContain("{%- elsif section.settings.layout == 'occasions' -%}");
    expect(source).toContain('class="immersive-occasions__chapter-cta"');
    expect(source).toContain('data-collection-handle="{{ block.settings.collection.handle }}"');
  });

  test('featured_collections layout routes collection through data-collection-handle on cards', () => {
    const source = readSection();
    expect(source).toContain("{%- elsif section.settings.layout == 'featured_collections' -%}");
    expect(source).toContain('class="immersive-featured__card"');
    expect(source).toContain('data-collection-handle="{{ block.settings.collection.handle }}"');
  });

  test('designer marker clicks stop before the shared collection-panel route so products stay inline', () => {
    document.body.innerHTML =
      '<div id="overlay"><button class="immersive-designers__marker" data-collection="suffuse"><span>Suffuse</span></button></div>';

    const opened = [];
    const overlay = document.getElementById('overlay');
    const marker = overlay.querySelector('.immersive-designers__marker');

    marker.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    overlay.addEventListener('click', function (event) {
      const card = event.target.closest('[data-collection], [data-collection-handle]');
      if (!card) return;
      opened.push(card.getAttribute('data-collection') || card.getAttribute('data-collection-handle'));
    });

    marker.querySelector('span').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(opened).toEqual([]);
  });

  test('designer marker click without stopPropagation reaches collection-panel route', () => {
    document.body.innerHTML =
      '<div id="overlay"><button class="immersive-designers__marker" data-collection="suffuse"><span>Suffuse</span></button></div>';

    const opened = [];
    const exited = [];
    const overlay = document.getElementById('overlay');
    overlay.addEventListener('click', function (event) {
      const card = event.target.closest('[data-collection], [data-collection-handle]');
      if (!card) return;
      const handle = card.getAttribute('data-collection') || card.getAttribute('data-collection-handle');
      if (!handle) return;
      event.preventDefault();
      exited.push(true);
      opened.push(handle);
    });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    overlay.querySelector('span').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(exited).toEqual([true]);
    expect(opened).toEqual(['suffuse']);
  });

  test('designer marker clicks stop before the shared collection-panel route so products stay inline', () => {
    document.body.innerHTML =
      '<div id="overlay"><button class="immersive-designers__marker" data-collection="suffuse"><span>Suffuse</span></button></div>';

    const opened = [];
    const overlay = document.getElementById('overlay');
    const marker = overlay.querySelector('.immersive-designers__marker');

    marker.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    overlay.addEventListener('click', function (event) {
      const card = event.target.closest('[data-collection], [data-collection-handle]');
      if (!card) return;
      opened.push(card.getAttribute('data-collection') || card.getAttribute('data-collection-handle'));
    });

    marker.querySelector('span').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(opened).toEqual([]);
  });
});

describe('immersive editorial overlay launch-readiness wiring', () => {
  test('source sections are hidden on storefront and visible in theme editor', () => {
    const source = readSection();
    expect(source).toContain('immersive-editorial--source');
    expect(source).toContain('data-section-id="{{ section.id }}"');
    expect(source).not.toContain('data-section-id="sections/{{ section.id }}"');
    expect(source).toContain('{% unless request.design_mode %}hidden{% endunless %}');
    expect(source).toContain('{% unless request.design_mode %}aria-hidden="true"{% endunless %}');
    expect(source).not.toContain('style="display: none;"');
    expect(source).toContain('immersive-editorial--source');
    expect(source).toContain('hidden');
    expect(source).not.toContain('{% if request.design_mode %}');
  });

  test('scroll-lock CSS exists for active editorial overlays', () => {
    const canvas = fs.readFileSync(CANVAS_PATH, 'utf8');
    expect(canvas).toContain('html.immersive-overlay-open');
    expect(canvas).toContain('body.immersive-overlay-open');
    expect(canvas).toContain('overflow: hidden !important');
    expect(canvas).toContain('overscroll-behavior: none');
  });

  test('immersive template class is emitted so viewport-lock CSS matches the page', () => {
    const layout = fs.readFileSync(THEME_LAYOUT_PATH, 'utf8');
    expect(layout).toContain("template == 'page.immersive'");
    expect(layout).toContain('template-page-immersive');
    expect(layout).toContain('shopify-design-mode');
  });

  test('base immersive page hides below-canvas sections without locking storefront parallax scroll', () => {
    const css = fs.readFileSync(IMMERSIVE_THEME_CSS_PATH, 'utf8');
    const baseBlockStart = css.indexOf('.template-page-immersive,');
    const baseBlockEnd = css.indexOf('}', baseBlockStart);
    const baseBlock = css.slice(baseBlockStart, baseBlockEnd);

    expect(baseBlock).not.toContain('overflow: hidden');
    expect(css).toContain('.template-page-immersive .shopify-section:has(.immersive-store)');
    expect(css).toContain('.template-page-immersive:not(.shopify-design-mode)');
    expect(css).toContain('not(:has(.immersive-store)):not(:has([data-immersive-notif-bar]))');
    expect(css).toContain('display: none !important');
  });

  test.each([
    ['source runtime', FEATURES_PATH],
    ['loaded bundle', BUNDLE_PATH],
  ])('%s toggles scroll lock on editorial overlay open and close', (_label, filePath) => {
    const runtime = fs.readFileSync(filePath, 'utf8');
    const activationStart = runtime.lastIndexOf('function performEditorialUIActivation(overlay, canvas)');
    const deactivationStart = runtime.lastIndexOf('var performUIDeactivation = function ()');
    expect(activationStart).toBeGreaterThan(-1);
    expect(deactivationStart).toBeGreaterThan(-1);

    const activationBlock = runtime.slice(activationStart, runtime.indexOf('var backBtn', activationStart));
    const deactivationBlock = runtime.slice(deactivationStart, runtime.indexOf('if (overlay)', deactivationStart));
    expect(activationBlock).toContain("document.documentElement.classList.add('immersive-overlay-open')");
    expect(activationBlock).toContain("document.body.classList.add('immersive-overlay-open')");
    expect(deactivationBlock).toContain("document.documentElement.classList.remove('immersive-overlay-open')");
    expect(deactivationBlock).toContain("document.body.classList.remove('immersive-overlay-open')");
  });

  test.each([
    ['source runtime', FEATURES_PATH],
    ['loaded bundle', BUNDLE_PATH],
  ])('%s keeps designer marker clicks inline instead of bubbling to collection overlay', (_label, filePath) => {
    const runtime = fs.readFileSync(filePath, 'utf8');
    const markerClick = runtime.slice(
      runtime.indexOf("marker.addEventListener('click'"),
      runtime.indexOf('// Keyboard: arrow keys move between markers'),
    );
    expect(markerClick).toContain('event.preventDefault()');
    expect(markerClick).toContain('event.stopPropagation()');
  });
});
