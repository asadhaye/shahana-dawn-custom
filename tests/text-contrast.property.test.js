/**
 * Property-Based Tests for Text Contrast Ratio
 *
 * Feature: immersive-store-glass-panel-improvements
 *
 * Property 25: Text Contrast Ratio
 *   Validates: Requirements 9.4
 *
 * "For any text element in a product card, the contrast ratio between the
 *  text color and the base background color SHALL meet WCAG AA requirements
 *  (minimum 4.5:1 for normal text, 3:1 for large text)."
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// WCAG Contrast Calculation Utilities
// ---------------------------------------------------------------------------

/**
 * Converts an sRGB channel value (0–255) to linear light.
 * Uses the IEC 61966-2-1 formula as specified by WCAG 2.1.
 *
 * @param {number} channel - sRGB value in range [0, 255]
 * @returns {number} Linear light value in range [0, 1]
 */
function sRGBToLinear(channel) {
  var c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of an RGB colour as defined by
 * WCAG 2.1 (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance).
 *
 * @param {number} r - Red channel [0, 255]
 * @param {number} g - Green channel [0, 255]
 * @param {number} b - Blue channel [0, 255]
 * @returns {number} Relative luminance in range [0, 1]
 */
function relativeLuminance(r, g, b) {
  var R = sRGBToLinear(r);
  var G = sRGBToLinear(g);
  var B = sRGBToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates the WCAG contrast ratio between two colours.
 * The ratio is always >= 1 (lighter / darker + 0.05).
 *
 * @param {number} l1 - Relative luminance of colour 1
 * @param {number} l2 - Relative luminance of colour 2
 * @returns {number} Contrast ratio in range [1, 21]
 */
function contrastRatio(l1, l2) {
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Blends an RGBA foreground colour onto an opaque RGB background using
 * standard alpha compositing (Porter-Duff "over" operation).
 *
 * @param {number} fgR - Foreground red [0, 255]
 * @param {number} fgG - Foreground green [0, 255]
 * @param {number} fgB - Foreground blue [0, 255]
 * @param {number} fgA - Foreground alpha [0, 1]
 * @param {number} bgR - Background red [0, 255]
 * @param {number} bgG - Background green [0, 255]
 * @param {number} bgB - Background blue [0, 255]
 * @returns {{ r: number, g: number, b: number }} Composited opaque RGB colour
 */
function alphaComposite(fgR, fgG, fgB, fgA, bgR, bgG, bgB) {
  return {
    r: Math.round(fgR * fgA + bgR * (1 - fgA)),
    g: Math.round(fgG * fgA + bgG * (1 - fgA)),
    b: Math.round(fgB * fgA + bgB * (1 - fgA)),
  };
}

// ---------------------------------------------------------------------------
// Colour definitions used in the implementation
// ---------------------------------------------------------------------------

/**
 * The glassmorphism background used for product cards and the glass panel.
 * CSS: rgba(15, 23, 42, 0.85)
 *
 * For contrast purposes we composite this onto a solid black canvas
 * (the WebGL scene is dark), giving an effective opaque background.
 */
var CARD_BG_RGBA = { r: 15, g: 23, b: 42, a: 0.85 };

/** Solid black canvas behind the glass panel (WebGL scene). */
var CANVAS_BG = { r: 0, g: 0, b: 0 };

/**
 * Computes the effective opaque background colour by compositing the
 * card's semi-transparent background onto the canvas background.
 *
 * @returns {{ r: number, g: number, b: number }}
 */
function effectiveBackground() {
  return alphaComposite(
    CARD_BG_RGBA.r, CARD_BG_RGBA.g, CARD_BG_RGBA.b, CARD_BG_RGBA.a,
    CANVAS_BG.r, CANVAS_BG.g, CANVAS_BG.b
  );
}

/**
 * Text colours used in the product cards (from the CSS implementation).
 *
 * Each entry has:
 *   name        - human-readable label for test output
 *   r, g, b     - RGB channels [0, 255]
 *   a           - alpha [0, 1]
 *   isLargeText - true if the element qualifies as "large text" under WCAG
 *                 (>= 18pt / 24px regular, or >= 14pt / ~18.67px bold)
 */
var TEXT_COLOURS = [
  // Product titles: #ffffff — typically rendered at ~16px bold (large text threshold)
  { name: 'Product title (#ffffff)', r: 255, g: 255, b: 255, a: 1.0, isLargeText: false },
  // Product prices: #ffffff
  { name: 'Product price (#ffffff)', r: 255, g: 255, b: 255, a: 1.0, isLargeText: false },
  // Collection titles: #ffffff — rendered at larger size, qualifies as large text
  { name: 'Collection title (#ffffff)', r: 255, g: 255, b: 255, a: 1.0, isLargeText: true },
  // Collection descriptions: rgba(255, 255, 255, 0.8)
  { name: 'Collection description (rgba(255,255,255,0.8))', r: 255, g: 255, b: 255, a: 0.8, isLargeText: false },
  // Vendor names: rgba(212, 175, 55, 0.9) — golden colour
  { name: 'Vendor name (rgba(212,175,55,0.9))', r: 212, g: 175, b: 55, a: 0.9, isLargeText: false },
];

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates arbitrary background opacity values in the range [0.7, 1.0].
 * The implementation uses 0.85; we test that contrast holds across a
 * realistic range of opacity values that might be used in the glassmorphism
 * background.
 */
var bgOpacityArbitrary = fc.float({ min: Math.fround(0.7), max: Math.fround(1.0), noNaN: true });

/**
 * Generates arbitrary text element descriptors (index into TEXT_COLOURS).
 */
var textElementArbitrary = fc.integer({ min: 0, max: TEXT_COLOURS.length - 1 });

// ---------------------------------------------------------------------------
// Property 25: Text Contrast Ratio
//
// "For any text element in a product card, the contrast ratio between the
//  text color and the base background color SHALL meet WCAG AA requirements
//  (minimum 4.5:1 for normal text, 3:1 for large text)."
//
// Validates: Requirements 9.4
// ---------------------------------------------------------------------------

describe('Property 25: Text Contrast Ratio', () => {
  /**
   * **Validates: Requirements 9.4**
   *
   * For any text element in a product card, the contrast ratio between the
   * composited text colour and the composited background colour must meet
   * WCAG AA minimums:
   *   - Normal text: >= 4.5:1
   *   - Large text:  >= 3:1
   *
   * We use fast-check to verify this property holds across all text colour /
   * background opacity combinations (100 iterations).
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 25: Text Contrast Ratio
    'all product card text colours meet WCAG AA contrast ratio against the glassmorphism background for any background opacity',
    () => {
      fc.assert(
        fc.property(
          bgOpacityArbitrary,
          textElementArbitrary,
          function (bgOpacity, textIdx) {
            var textColour = TEXT_COLOURS[textIdx];

            // Composite the card background onto the canvas background using
            // the generated opacity value.
            var bg = alphaComposite(
              CARD_BG_RGBA.r, CARD_BG_RGBA.g, CARD_BG_RGBA.b, bgOpacity,
              CANVAS_BG.r, CANVAS_BG.g, CANVAS_BG.b
            );

            // Composite the text colour onto the effective background.
            var fg = alphaComposite(
              textColour.r, textColour.g, textColour.b, textColour.a,
              bg.r, bg.g, bg.b
            );

            var bgLuminance = relativeLuminance(bg.r, bg.g, bg.b);
            var fgLuminance = relativeLuminance(fg.r, fg.g, fg.b);
            var ratio = contrastRatio(fgLuminance, bgLuminance);

            // WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text
            var minimum = textColour.isLargeText ? 3.0 : 4.5;

            return ratio >= minimum;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 9.4**
   *
   * Explicit verification of each specific text colour used in the
   * implementation against the exact background colour (rgba(15,23,42,0.85)
   * composited onto black).
   *
   * This test documents the actual contrast ratios and ensures they all
   * pass WCAG AA thresholds.
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 25: Text Contrast Ratio
    'each specific text colour used in the implementation meets WCAG AA contrast ratio',
    () => {
      var bg = effectiveBackground();
      var bgLuminance = relativeLuminance(bg.r, bg.g, bg.b);

      TEXT_COLOURS.forEach(function (textColour) {
        var fg = alphaComposite(
          textColour.r, textColour.g, textColour.b, textColour.a,
          bg.r, bg.g, bg.b
        );

        var fgLuminance = relativeLuminance(fg.r, fg.g, fg.b);
        var ratio = contrastRatio(fgLuminance, bgLuminance);
        var minimum = textColour.isLargeText ? 3.0 : 4.5;

        expect(ratio).toBeGreaterThanOrEqual(minimum);
      });
    }
  );

  /**
   * **Validates: Requirements 9.4**
   *
   * Property: for any text element index, the contrast ratio calculation
   * is symmetric — swapping foreground and background luminance values
   * produces the same ratio (since we always divide lighter by darker).
   *
   * This validates the correctness of the contrastRatio() implementation.
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 25: Text Contrast Ratio
    'contrast ratio calculation is symmetric for any pair of luminance values',
    () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
          fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
          function (l1, l2) {
            var ratio1 = contrastRatio(l1, l2);
            var ratio2 = contrastRatio(l2, l1);
            // Allow tiny floating-point rounding differences
            return Math.abs(ratio1 - ratio2) < 1e-10;
          }
        ),
        { numRuns: 100, verbose: false }
      );
    }
  );

  /**
   * **Validates: Requirements 9.4**
   *
   * Property: the contrast ratio is always in the range [1, 21].
   * A ratio of 1 means identical colours; 21 is the maximum (black on white).
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 25: Text Contrast Ratio
    'contrast ratio is always between 1 and 21 for any luminance pair',
    () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
          fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
          function (l1, l2) {
            var ratio = contrastRatio(l1, l2);
            return ratio >= 1.0 && ratio <= 21.0;
          }
        ),
        { numRuns: 100, verbose: false }
      );
    }
  );
});
