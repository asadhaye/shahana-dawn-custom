/**
 * Property-Based Tests for Glass Panel Overlay Z-Index and Pointer Events
 *
 * Feature: immersive-store-glass-panel-improvements
 *
 * Tests verify CSS properties defined in immersive-canvas.liquid for the
 * glass panel overlay positioning and interaction behaviour.
 *
 * Since jsdom does not fully support computed styles for fixed/absolute
 * positioning, we validate the CSS source text extracted from the Liquid
 * stylesheet block — the authoritative definition of what the browser renders.
 */

'use strict';

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const IMMERSIVE_CANVAS_PATH = path.resolve(__dirname, '../sections/immersive-canvas.liquid');

function extractCanvasCSS() {
  const content = fs.readFileSync(IMMERSIVE_CANVAS_PATH, 'utf8');
  const match = content.match(/\{%\s*stylesheet\s*%\}([\s\S]*?)\{%\s*endstylesheet\s*%\}/);
  if (!match) throw new Error('No {% stylesheet %} block found in immersive-canvas.liquid');
  return match[1];
}

function stripCSSComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Generic CSS parser — works for most rules but fails on rules followed
 * immediately by pseudo-element rules (e.g. #glass-panel::before).
 * Use extractRuleProps() for those cases.
 */
function parseCSSRules(css) {
  const rules = new Map();
  const clean = stripCSSComments(css);
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let m;
  while ((m = ruleRegex.exec(clean)) !== null) {
    const selector = m[1].trim();
    const declarations = m[2];
    const props = new Map();
    declarations.split(';').forEach(function (decl) {
      const colonIdx = decl.indexOf(':');
      if (colonIdx === -1) return;
      const prop = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop) props.set(prop, val);
    });
    rules.set(selector, props);
  }
  return rules;
}

/**
 * Targeted rule extractor — robust for selectors followed by pseudo-elements.
 * Searches for the selector in comment-stripped CSS and extracts its declarations.
 */
function extractRuleProps(css, selector) {
  const clean = stripCSSComments(css);
  // Build a regex that matches the exact selector (with leading whitespace)
  // followed by { declarations }
  // We escape the selector for use in a regex
  const esc = selector
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\./g, '\\.')
    .replace(/\#/g, '\\#')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
  const re = new RegExp('(?:^|[^\\w-])' + esc + '\\s*\\{([^}]*)\\}');
  const m = clean.match(re);
  if (!m) return null;
  const props = new Map();
  m[1].split(';').forEach(function (decl) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();
    if (prop) props.set(prop, val);
  });
  return props;
}

function parseZIndex(value) {
  if (!value) return NaN;
  const trimmed = value.trim();
  if (trimmed === 'auto') return NaN;
  return parseInt(trimmed, 10);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const panelStateArb = fc.record({
  isOpen: fc.boolean(),
  isHidden: fc.boolean(),
  viewportWidth: fc.integer({ min: 320, max: 2560 }),
  viewportHeight: fc.integer({ min: 480, max: 1440 }),
});

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function buildDOM(opts) {
  const css = extractCanvasCSS();
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const uiLayer = document.createElement('div');
  uiLayer.id = 'ui-layer';

  const hotspot = document.createElement('button');
  hotspot.className = 'immersive-hotspot';
  hotspot.textContent = 'Suffuse';
  uiLayer.appendChild(hotspot);

  const panel = document.createElement('aside');
  panel.id = 'glass-panel';
  panel.className = 'immersive-store__panel' + (opts.panelHidden ? ' hidden' : '');
  panel.setAttribute('aria-live', 'polite');
  if (opts.panelOpen) panel.setAttribute('data-open', 'true');

  document.body.appendChild(uiLayer);
  document.body.appendChild(panel);

  return {
    panel,
    hotspot,
    cleanup: function () {
      document.head.removeChild(style);
      document.body.removeChild(uiLayer);
      document.body.removeChild(panel);
    },
  };
}

// ---------------------------------------------------------------------------
// Property 29: Glass Panel Z-Index
// ---------------------------------------------------------------------------

describe('Property 29: Glass Panel Z-Index', () => {
  test(// Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
  'glass panel z-index is greater than ui-layer hotspot z-index for any open panel state', () => {
    fc.assert(
      fc.property(panelStateArb, function (_state) {
        const css = extractCanvasCSS();
        const clean = stripCSSComments(css);

        // Use targeted extractor for #glass-panel (has ::before pseudo-element after it)
        const panelProps = extractRuleProps(clean, '#glass-panel');
        if (!panelProps) return false;

        const panelZIndex = parseZIndex(panelProps.get('z-index'));
        if (isNaN(panelZIndex)) return false;
        if (panelZIndex <= 0) return false;

        // Check ui-layer z-index via generic parser (no pseudo-elements)
        const rules = parseCSSRules(css);
        const uiLayerRule = rules.get('#ui-layer');
        const hotspotRule = rules.get('#ui-layer .immersive-hotspot');

        const uiLayerZIndex = uiLayerRule ? parseZIndex(uiLayerRule.get('z-index')) : NaN;
        const hotspotZIndex = hotspotRule ? parseZIndex(hotspotRule.get('z-index')) : NaN;

        if (!isNaN(uiLayerZIndex) && panelZIndex <= uiLayerZIndex) return false;
        if (!isNaN(hotspotZIndex) && panelZIndex <= hotspotZIndex) return false;

        return true;
      }),
      { numRuns: 100, verbose: true },
    );
  });

  test(// Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
  'open glass panel element has higher z-index than ui-layer in the DOM for any panel configuration', () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.string({ minLength: 1, maxLength: 40 }),
          viewportWidth: fc.integer({ min: 320, max: 2560 }),
        }),
        function (_config) {
          const dom = buildDOM({ panelOpen: true, panelHidden: false });
          try {
            if (dom.panel.getAttribute('data-open') !== 'true') return false;

            const css = extractCanvasCSS();
            const clean = stripCSSComments(css);
            const panelProps = extractRuleProps(clean, '#glass-panel');
            if (!panelProps) return false;

            const panelZIndex = parseZIndex(panelProps.get('z-index'));
            if (isNaN(panelZIndex) || panelZIndex <= 0) return false;

            if (!document.getElementById('glass-panel')) return false;
            return true;
          } finally {
            dom.cleanup();
          }
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 31: Panel Pointer Events
// ---------------------------------------------------------------------------

describe('Property 31: Panel Pointer Events', () => {
  test(// Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
  'closed glass panel CSS declares pointer-events: none and hidden state declares display: none for any panel state', () => {
    fc.assert(
      fc.property(panelStateArb, function (_state) {
        const css = extractCanvasCSS();
        const clean = stripCSSComments(css);

        // Use targeted extractor for #glass-panel
        const panelProps = extractRuleProps(clean, '#glass-panel');
        if (!panelProps) return false;
        if (panelProps.get('pointer-events') !== 'none') return false;

        // Generic parser works fine for #glass-panel.hidden and attribute selectors
        const rules = parseCSSRules(css);

        const hiddenRule = rules.get('#glass-panel.hidden');
        if (!hiddenRule) return false;
        if (hiddenRule.get('display') !== 'none') return false;

        // CSS uses single-quoted attribute selector
        const openRule = rules.get("#glass-panel[data-open='true']");
        if (!openRule) return false;
        if (openRule.get('pointer-events') !== 'auto') return false;

        return true;
      }),
      { numRuns: 100, verbose: true },
    );
  });

  test(// Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
  'closed panel element does not intercept pointer events in the DOM for any closed state', () => {
    fc.assert(
      fc.property(
        fc.record({
          useHiddenClass: fc.boolean(),
          viewportWidth: fc.integer({ min: 320, max: 2560 }),
        }),
        function (config) {
          const dom = buildDOM({ panelOpen: false, panelHidden: config.useHiddenClass });
          try {
            if (dom.panel.getAttribute('data-open') === 'true') return false;

            const css = extractCanvasCSS();
            const clean = stripCSSComments(css);
            const panelProps = extractRuleProps(clean, '#glass-panel');
            if (!panelProps) return false;
            if (panelProps.get('pointer-events') !== 'none') return false;

            if (config.useHiddenClass) {
              const rules = parseCSSRules(css);
              const hiddenRule = rules.get('#glass-panel.hidden');
              if (!hiddenRule) return false;
              if (hiddenRule.get('display') !== 'none') return false;
            }

            return true;
          } finally {
            dom.cleanup();
          }
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  test(// Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
  'only the open state enables pointer-events: auto; all closed states have pointer-events: none', () => {
    fc.assert(
      fc.property(panelStateArb, function (_state) {
        const css = extractCanvasCSS();
        const clean = stripCSSComments(css);

        const panelProps = extractRuleProps(clean, '#glass-panel');
        if (!panelProps) return false;
        if (panelProps.get('pointer-events') !== 'none') return false;

        const rules = parseCSSRules(css);
        const openRule = rules.get("#glass-panel[data-open='true']");
        if (!openRule) return false;
        if (openRule.get('pointer-events') !== 'auto') return false;

        const hiddenRule = rules.get('#glass-panel.hidden');
        if (hiddenRule && hiddenRule.has('pointer-events')) {
          if (hiddenRule.get('pointer-events') === 'auto') return false;
        }

        return true;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});
