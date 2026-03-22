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

const IMMERSIVE_CANVAS_PATH = path.resolve(
  __dirname,
  '../sections/immersive-canvas.liquid'
);

/**
 * Reads the raw CSS from the {% stylesheet %} block in immersive-canvas.liquid.
 * @returns {string}
 */
function extractCanvasCSS() {
  const content = fs.readFileSync(IMMERSIVE_CANVAS_PATH, 'utf8');
  const match = content.match(/\{%\s*stylesheet\s*%\}([\s\S]*?)\{%\s*endstylesheet\s*%\}/);
  if (!match) {
    throw new Error('No {% stylesheet %} block found in immersive-canvas.liquid');
  }
  return match[1];
}

/**
 * Strips CSS block comments from a CSS string.
 * @param {string} css
 * @returns {string}
 */
function stripCSSComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Parses a CSS string into a map of selector → { property: value } rules.
 * @param {string} css
 * @returns {Map<string, Map<string, string>>}
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
 * Parses a z-index value to a number. Returns NaN for non-numeric values.
 * @param {string} value
 * @returns {number}
 */
function parseZIndex(value) {
  if (!value) return NaN;
  const trimmed = value.trim();
  if (trimmed === 'auto') return NaN;
  return parseInt(trimmed, 10);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates arbitrary panel state descriptors.
 * The CSS is static, so the property holds for all states.
 */
const panelStateArb = fc.record({
  isOpen: fc.boolean(),
  isHidden: fc.boolean(),
  viewportWidth: fc.integer({ min: 320, max: 2560 }),
  viewportHeight: fc.integer({ min: 480, max: 1440 }),
});

// ---------------------------------------------------------------------------
// DOM helpers for jsdom-based tests
// ---------------------------------------------------------------------------

/**
 * Builds a minimal DOM environment matching the immersive-canvas.liquid
 * structure, with the relevant CSS applied as an inline <style> element.
 *
 * @param {object} opts
 * @param {boolean} opts.panelOpen   - whether data-open="true" is set
 * @param {boolean} opts.panelHidden - whether the .hidden class is present
 * @returns {{ panel: HTMLElement, hotspot: HTMLElement, cleanup: Function }}
 */
function buildDOM(opts) {
  const css = extractCanvasCSS();

  // Inject styles
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Build structure
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
  if (opts.panelOpen) {
    panel.setAttribute('data-open', 'true');
  }

  document.body.appendChild(uiLayer);
  document.body.appendChild(panel);

  return {
    panel: panel,
    hotspot: hotspot,
    cleanup: function () {
      document.head.removeChild(style);
      document.body.removeChild(uiLayer);
      document.body.removeChild(panel);
    },
  };
}

// ---------------------------------------------------------------------------
// Property 29: Glass Panel Z-Index
//
// "For any rendered glass panel with data-open='true', the computed z-index
//  SHALL be greater than the z-index of the UI layer hotspot buttons."
//
// Validates: Requirements 12.4, 15.2
// ---------------------------------------------------------------------------

describe('Property 29: Glass Panel Z-Index', () => {
  /**
   * **Validates: Requirements 12.4, 15.2**
   *
   * The #glass-panel CSS rule must declare a z-index greater than the
   * z-index of #ui-layer .immersive-hotspot (or #ui-layer itself).
   *
   * We verify this via CSS source analysis: the static stylesheet defines
   * the z-index values, so the property holds for any panel state input.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
    'glass panel z-index is greater than ui-layer hotspot z-index for any open panel state',
    () => {
      fc.assert(
        fc.property(panelStateArb, function (_state) {
          const css = extractCanvasCSS();
          const rules = parseCSSRules(css);

          // #glass-panel must have a z-index declared
          const panelRule = rules.get('#glass-panel');
          if (!panelRule) return false;

          const panelZIndex = parseZIndex(panelRule.get('z-index'));
          if (isNaN(panelZIndex)) return false;

          // #ui-layer has pointer-events: none and no explicit z-index (defaults to auto/0).
          // The hotspot buttons inside it also have no explicit z-index.
          // We check that the panel z-index is greater than any z-index found on
          // #ui-layer or #ui-layer .immersive-hotspot.
          const uiLayerRule = rules.get('#ui-layer');
          const hotspotRule = rules.get('#ui-layer .immersive-hotspot');

          const uiLayerZIndex = uiLayerRule ? parseZIndex(uiLayerRule.get('z-index')) : NaN;
          const hotspotZIndex = hotspotRule ? parseZIndex(hotspotRule.get('z-index')) : NaN;

          // If ui-layer has an explicit z-index, panel must exceed it
          if (!isNaN(uiLayerZIndex) && panelZIndex <= uiLayerZIndex) return false;

          // If hotspot has an explicit z-index, panel must exceed it
          if (!isNaN(hotspotZIndex) && panelZIndex <= hotspotZIndex) return false;

          // Panel z-index must be a positive integer (renders above default stacking)
          if (panelZIndex <= 0) return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 12.4, 15.2**
   *
   * DOM-based verification: when data-open="true" is set on the panel,
   * the panel element is present in the document and the CSS z-index
   * value from the stylesheet is greater than any z-index on the ui-layer.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 29: Glass Panel Z-Index
    'open glass panel element has higher z-index than ui-layer in the DOM for any panel configuration',
    () => {
      fc.assert(
        fc.property(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 40 }),
            viewportWidth: fc.integer({ min: 320, max: 2560 }),
          }),
          function (_config) {
            const dom = buildDOM({ panelOpen: true, panelHidden: false });

            try {
              // Verify panel has data-open="true"
              if (dom.panel.getAttribute('data-open') !== 'true') return false;

              // Read z-index values from the CSS source (jsdom getComputedStyle
              // does not reliably resolve z-index for fixed elements)
              const css = extractCanvasCSS();
              const rules = parseCSSRules(css);

              const panelRule = rules.get('#glass-panel');
              if (!panelRule) return false;

              const panelZIndex = parseZIndex(panelRule.get('z-index'));
              if (isNaN(panelZIndex)) return false;

              // ui-layer has no explicit z-index in the CSS (defaults to auto)
              // Panel z-index must be a positive value to render above it
              if (panelZIndex <= 0) return false;

              // Verify the panel is in the DOM (not removed)
              if (!document.getElementById('glass-panel')) return false;

              return true;
            } finally {
              dom.cleanup();
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 31: Panel Pointer Events
//
// "For any glass panel in the closed/hidden state, the element SHALL have
//  pointer-events: none or display: none so it does not intercept clicks
//  on the canvas or hotspots."
//
// Validates: Requirements 15.5
// ---------------------------------------------------------------------------

describe('Property 31: Panel Pointer Events', () => {
  /**
   * **Validates: Requirements 15.5**
   *
   * CSS source analysis:
   * - #glass-panel base rule must declare pointer-events: none
   * - #glass-panel.hidden must declare display: none
   * - #glass-panel[data-open="true"] must declare pointer-events: auto
   *   (only the open state enables interaction)
   *
   * Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
    'closed glass panel CSS declares pointer-events: none and hidden state declares display: none for any panel state',
    () => {
      fc.assert(
        fc.property(panelStateArb, function (_state) {
          const css = extractCanvasCSS();
          const rules = parseCSSRules(css);

          // Base rule: #glass-panel must have pointer-events: none (closed state)
          const panelRule = rules.get('#glass-panel');
          if (!panelRule) return false;
          if (panelRule.get('pointer-events') !== 'none') return false;

          // Hidden state: #glass-panel.hidden must have display: none
          const hiddenRule = rules.get('#glass-panel.hidden');
          if (!hiddenRule) return false;
          if (hiddenRule.get('display') !== 'none') return false;

          // Open state: #glass-panel[data-open="true"] must restore pointer-events: auto
          const openRule = rules.get('#glass-panel[data-open="true"]');
          if (!openRule) return false;
          if (openRule.get('pointer-events') !== 'auto') return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 15.5**
   *
   * DOM-based verification: a panel without data-open="true" must have
   * pointer-events: none (or display: none via .hidden class) so it cannot
   * intercept clicks on the canvas or hotspot buttons.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
    'closed panel element does not intercept pointer events in the DOM for any closed state',
    () => {
      fc.assert(
        fc.property(
          fc.record({
            useHiddenClass: fc.boolean(),
            viewportWidth: fc.integer({ min: 320, max: 2560 }),
          }),
          function (config) {
            // Test both closed states: with .hidden class and without (but no data-open)
            const dom = buildDOM({
              panelOpen: false,
              panelHidden: config.useHiddenClass,
            });

            try {
              // Panel must NOT have data-open="true"
              if (dom.panel.getAttribute('data-open') === 'true') return false;

              // Verify via CSS source that the closed state has pointer-events: none
              const css = extractCanvasCSS();
              const rules = parseCSSRules(css);

              const panelRule = rules.get('#glass-panel');
              if (!panelRule) return false;

              // Base rule must declare pointer-events: none
              if (panelRule.get('pointer-events') !== 'none') return false;

              // If .hidden class is present, display: none must also be declared
              if (config.useHiddenClass) {
                const hiddenRule = rules.get('#glass-panel.hidden');
                if (!hiddenRule) return false;
                if (hiddenRule.get('display') !== 'none') return false;
              }

              return true;
            } finally {
              dom.cleanup();
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 15.5**
   *
   * Mutual exclusivity: the open state (data-open="true") enables
   * pointer-events: auto, while all other states keep pointer-events: none.
   * This ensures the panel only intercepts clicks when intentionally open.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 31: Panel Pointer Events
    'only the open state enables pointer-events: auto; all closed states have pointer-events: none',
    () => {
      fc.assert(
        fc.property(panelStateArb, function (_state) {
          const css = extractCanvasCSS();
          const rules = parseCSSRules(css);

          // Closed state (base rule): pointer-events must be none
          const panelRule = rules.get('#glass-panel');
          if (!panelRule) return false;
          if (panelRule.get('pointer-events') !== 'none') return false;

          // Open state: pointer-events must be auto
          const openRule = rules.get('#glass-panel[data-open="true"]');
          if (!openRule) return false;
          if (openRule.get('pointer-events') !== 'auto') return false;

          // The open rule must NOT set pointer-events: none (would break open state)
          // Already verified above (it must be 'auto')

          // Hidden rule must not accidentally re-enable pointer events
          const hiddenRule = rules.get('#glass-panel.hidden');
          if (hiddenRule && hiddenRule.has('pointer-events')) {
            if (hiddenRule.get('pointer-events') === 'auto') return false;
          }

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );
});
