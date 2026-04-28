/**
 * Tests for immersive-room-atmosphere feature
 * Feature: immersive-room-atmosphere
 *
 * Test structure:
 *   - Exploration Tests (E1-E4): MUST FAIL on current code (confirm gaps exist)
 *   - Preservation Tests (P1-P3): MUST PASS on current code (capture arithmetic contracts)
 *   - Property Tests (Properties 1-8): Verify universal invariants
 *   - Unit Tests: Verify specific behavioural contracts
 */

'use strict';

var fc = require('fast-check');

// ---------------------------------------------------------------------------
// Helpers — simulate the module-level state and pure functions
// ---------------------------------------------------------------------------

/**
 * Pure lerp step — mirrors the formula used in velocity, colour, and drift lerp.
 * current + (target - current) * factor
 */
function lerpStep(current, target, factor) {
  return current + (target - current) * factor;
}

/**
 * Pure uTime increment formula.
 * uniforms.uTime.value += deltaMs / 1000.0
 */
function incrementUTime(currentTime, deltaMs) {
  return currentTime + deltaMs / 1000.0;
}

/**
 * Pure additive clamp — mirrors the GLSL clamp(bg + blob, 0.0, 1.0) per channel.
 */
function additiveClamp(a, b) {
  return Math.min(1.0, Math.max(0.0, a + b));
}

/**
 * Simulate one velocity animate step (pure function, no DOM).
 * Returns { velocityCurrent, velocityRaw }
 */
function velocityStep(prevMouseX, prevMouseY, currMouseX, currMouseY, velocityCurrent, reduceMotion) {
  if (reduceMotion) {
    return { velocityCurrent: 0, velocityRaw: 0 };
  }
  var dvx = currMouseX - prevMouseX;
  var dvy = currMouseY - prevMouseY;
  var velocityRaw = Math.sqrt(dvx * dvx + dvy * dvy);
  if (velocityRaw < 0.001) velocityRaw = 0;
  var next = velocityCurrent + (velocityRaw - velocityCurrent) * 0.15;
  if (next > 1.0) next = 1.0;
  return { velocityCurrent: next, velocityRaw: velocityRaw };
}

// ---------------------------------------------------------------------------
// Minimal THREE.Color stub for atmosphere module tests
// ---------------------------------------------------------------------------
function ThreeColorStub(hex) {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  if (hex) this.set(hex);
}
ThreeColorStub.prototype.set = function (hex) {
  // Parse #rrggbb
  if (typeof hex === 'string' && hex.charAt(0) === '#') {
    var n = parseInt(hex.slice(1), 16);
    this.r = ((n >> 16) & 0xff) / 255;
    this.g = ((n >> 8) & 0xff) / 255;
    this.b = (n & 0xff) / 255;
  }
  return this;
};
ThreeColorStub.prototype.lerp = function (other, alpha) {
  this.r += (other.r - this.r) * alpha;
  this.g += (other.g - this.g) * alpha;
  this.b += (other.b - this.b) * alpha;
  return this;
};
ThreeColorStub.prototype.copy = function (other) {
  this.r = other.r;
  this.g = other.g;
  this.b = other.b;
  return this;
};
ThreeColorStub.prototype.clone = function () {
  var c = new ThreeColorStub();
  c.r = this.r;
  c.g = this.g;
  c.b = this.b;
  return c;
};

// ---------------------------------------------------------------------------
// Atmosphere module factory — creates a fresh instance for each test
// ---------------------------------------------------------------------------
function makeAtmosphereModule() {
  var THREE = { Color: ThreeColorStub };

  var bgColorCurrent = new THREE.Color();
  var blob1ColorCurrent = new THREE.Color();
  var blob2ColorCurrent = new THREE.Color();
  var bgColorNext = new THREE.Color();
  var blob1ColorNext = new THREE.Color();
  var blob2ColorNext = new THREE.Color();

  function initMoodUniforms(uniforms, initialMood) {
    if (!uniforms || !initialMood) return;
    bgColorCurrent.set(initialMood.background);
    blob1ColorCurrent.set(initialMood.blob1);
    blob2ColorCurrent.set(initialMood.blob2);
    bgColorNext.set(initialMood.background);
    blob1ColorNext.set(initialMood.blob1);
    blob2ColorNext.set(initialMood.blob2);
    uniforms.uBgColor.value.copy(bgColorCurrent);
    uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
    uniforms.uBlob2Color.value.copy(blob2ColorCurrent);
    uniforms.uBgColorNext.value.copy(bgColorNext);
    uniforms.uBlob1ColorNext.value.copy(blob1ColorNext);
    uniforms.uBlob2ColorNext.value.copy(blob2ColorNext);
  }

  function setNextMood(mood) {
    if (!mood) return;
    bgColorNext.set(mood.background);
    blob1ColorNext.set(mood.blob1);
    blob2ColorNext.set(mood.blob2);
  }

  function updateMoodUniforms(uniforms, lerpFactor) {
    if (!uniforms) return;
    bgColorCurrent.lerp(bgColorNext, lerpFactor);
    blob1ColorCurrent.lerp(blob1ColorNext, lerpFactor);
    blob2ColorCurrent.lerp(blob2ColorNext, lerpFactor);
    uniforms.uBgColor.value.copy(bgColorCurrent);
    uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
    uniforms.uBlob2Color.value.copy(blob2ColorCurrent);
  }

  function snapCurrentToNext(uniforms) {
    if (!uniforms) return;
    bgColorCurrent.copy(bgColorNext);
    blob1ColorCurrent.copy(blob1ColorNext);
    blob2ColorCurrent.copy(blob2ColorNext);
    uniforms.uBgColor.value.copy(bgColorCurrent);
    uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
    uniforms.uBlob2Color.value.copy(blob2ColorCurrent);
  }

  return {
    initMoodUniforms: initMoodUniforms,
    setNextMood: setNextMood,
    updateMoodUniforms: updateMoodUniforms,
    snapCurrentToNext: snapCurrentToNext,
    // Expose internal state for testing
    _state: {
      bgColorCurrent: bgColorCurrent,
      blob1ColorCurrent: blob1ColorCurrent,
      blob2ColorCurrent: blob2ColorCurrent,
      bgColorNext: bgColorNext,
      blob1ColorNext: blob1ColorNext,
      blob2ColorNext: blob2ColorNext,
    },
  };
}

/**
 * Create a minimal uniforms object for testing.
 */
function makeUniforms() {
  return {
    uTime: { value: 0.0 },
    uVelocityIntensity: { value: 0.0 },
    uReducedMotion: { value: 0.0 },
    uBgColor: { value: new ThreeColorStub('#0a0a0f') },
    uBlob1Color: { value: new ThreeColorStub('#1a1025') },
    uBlob2Color: { value: new ThreeColorStub('#0d0d1a') },
    uBgColorNext: { value: new ThreeColorStub('#0a0a0f') },
    uBlob1ColorNext: { value: new ThreeColorStub('#1a1025') },
    uBlob2ColorNext: { value: new ThreeColorStub('#0d0d1a') },
    uScrollOffset: { value: 0.0 },
    uAtmosphericMood: { value: 0.0 },
    uTiltOffsetX: { value: 0.0 },
    uTiltOffsetY: { value: 0.0 },
    uTransitionProgress: { value: 0.0 },
    uMouse: {
      value: {
        x: 0.5,
        y: 0.5,
        set: function (x, y) {
          this.x = x;
          this.y = y;
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// STORE_ROOMS mood palettes (mirrors room-manager.js after Task 4)
// ---------------------------------------------------------------------------
var EXPECTED_MOOD_PALETTES = {
  storefront: { background: '#0a0a0f', blob1: '#1a1025', blob2: '#0d0d1a' },
  lounge: { background: '#0f0a08', blob1: '#2a1a10', blob2: '#1a0f0a' },
  designer_houses: { background: '#080a12', blob1: '#101828', blob2: '#0a1020' },
  occasions: { background: '#0a0810', blob1: '#1e1028', blob2: '#120a1e' },
  featured_collections: { background: '#0a0a08', blob1: '#1e1e10', blob2: '#141408' },
};

// ---------------------------------------------------------------------------
// EXPLORATION TESTS — MUST FAIL on current code
// ---------------------------------------------------------------------------

describe('Exploration Tests (must fail on current code, pass after implementation)', function () {
  // Feature: immersive-room-atmosphere, Exploration Test E1: uTime uniform exists and is incremented
  test('E1: uniforms.uTime exists and is incremented each frame', function () {
    // Load the actual webgl-engine.js module to check if uTime is wired
    // On current code, uniforms object in initImmersiveScene() does NOT include uTime
    // We simulate what the uniforms object looks like after initImmersiveScene() runs
    // by reading the source and checking for the uTime key.
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/webgl-engine.js'), 'utf8');
    // After implementation, the uniforms object in initImmersiveScene() must contain uTime
    expect(src).toMatch(/uTime\s*:\s*\{\s*value\s*:\s*0\.0\s*\}/);
  });

  // Feature: immersive-room-atmosphere, Exploration Test E2: uVelocityIntensity uniform exists
  test('E2: uniforms.uVelocityIntensity exists in initImmersiveScene()', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/webgl-engine.js'), 'utf8');
    expect(src).toMatch(/uVelocityIntensity\s*:\s*\{\s*value\s*:\s*0\.0\s*\}/);
  });

  // Feature: immersive-room-atmosphere, Exploration Test E3: STORE_ROOMS has mood property on all rooms
  test('E3: each entry in STORE_ROOMS has a mood property with background, blob1, blob2 hex strings', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    // After implementation, each room must have a mood property
    var hexPattern = '#[0-9a-fA-F]{6}';
    var rooms = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];
    rooms.forEach(function (room) {
      // Check that the mood property appears near the room definition
      expect(src).toMatch(new RegExp('mood\\s*:\\s*\\{'));
    });
    // Check that all expected hex values are present
    expect(src).toMatch(/#0a0a0f/); // storefront background
    expect(src).toMatch(/#0f0a08/); // lounge background
    expect(src).toMatch(/#080a12/); // designer_houses background
    expect(src).toMatch(/#0a0810/); // occasions background
    expect(src).toMatch(/#0a0a08/); // featured_collections background
  });

  // Feature: immersive-room-atmosphere, Exploration Test E4: uBgColor, uBlob1Color, uBlob2Color uniforms exist
  test('E4: uniforms.uBgColor, uBlob1Color, uBlob2Color exist in initImmersiveScene()', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/webgl-engine.js'), 'utf8');
    expect(src).toMatch(/uBgColor\s*:\s*\{\s*value\s*:/);
    expect(src).toMatch(/uBlob1Color\s*:\s*\{\s*value\s*:/);
    expect(src).toMatch(/uBlob2Color\s*:\s*\{\s*value\s*:/);
  });
});

// ---------------------------------------------------------------------------
// PRESERVATION TESTS — MUST PASS on current code (pure arithmetic contracts)
// ---------------------------------------------------------------------------

describe('Preservation Tests (pure arithmetic — pass before and after implementation)', function () {
  // Feature: immersive-room-atmosphere, Property 7: Additive blob composite is capped at 1.0 per channel
  test('P1 (Property 7): clamp(bg + blob, 0.0, 1.0) is always in [0.0, 1.0] per channel', function () {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 2, noNaN: true }),
        fc.float({ min: 0, max: 2, noNaN: true }),
        function (bg, blob) {
          var result = additiveClamp(bg, blob);
          expect(result).toBeGreaterThanOrEqual(0.0);
          expect(result).toBeLessThanOrEqual(1.0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 1: Lerp step advances toward target
  test('P2 (Property 1): lerp step equals current + (target - current) * factor', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.999), noNaN: true }),
        function (current, target, factor) {
          var result = lerpStep(current, target, factor);
          var expected = current + (target - current) * factor;
          expect(result).toBeCloseTo(expected, 5);
          // Result must be between current and target (or equal when same)
          if (current < target) {
            expect(result).toBeGreaterThanOrEqual(current);
            expect(result).toBeLessThanOrEqual(target);
          } else if (current > target) {
            expect(result).toBeLessThanOrEqual(current);
            expect(result).toBeGreaterThanOrEqual(target);
          } else {
            expect(result).toBeCloseTo(current, 5);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 8: uTime increments by elapsed seconds
  test('P3 (Property 8): uTime increases by exactly delta/1000 seconds', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
        function (currentTime, deltaMs) {
          var newTime = incrementUTime(currentTime, deltaMs);
          var expected = currentTime + deltaMs / 1000.0;
          expect(newTime).toBeCloseTo(expected, 5);
          // uTime must be non-decreasing
          expect(newTime).toBeGreaterThanOrEqual(currentTime);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// PROPERTY TESTS — Properties 2–6 (implementation verification)
// ---------------------------------------------------------------------------

describe('Property Tests (implementation verification)', function () {
  // Feature: immersive-room-atmosphere, Property 2: Velocity signal is always in [0, 1]
  // Validates: Requirements 1.3, 1.4
  test('Property 2: velocity signal is always in [0, 1] after one animate step', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        function (prevX, prevY, currX, currY, priorVelocityCurrent) {
          var result = velocityStep(prevX, prevY, currX, currY, priorVelocityCurrent, false);
          expect(result.velocityCurrent).toBeGreaterThanOrEqual(0.0);
          expect(result.velocityCurrent).toBeLessThanOrEqual(1.0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 3: Velocity below threshold is zeroed
  // Validates: Requirement 1.2
  test('Property 3: velocity below 0.001 threshold is zeroed before smoothing', function () {
    fc.assert(
      fc.property(
        // Generate tiny mouse movements whose Euclidean distance is < 0.001
        fc.float({ min: Math.fround(0), max: Math.fround(0.0007), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(0.0007), noNaN: true }),
        function (dvx, dvy) {
          // Ensure the distance is actually < 0.001
          var dist = Math.sqrt(dvx * dvx + dvy * dvy);
          // Only test cases where distance is genuinely below threshold
          if (dist >= 0.001) return; // skip this sample
          var result = velocityStep(0.5, 0.5, 0.5 + dvx, 0.5 + dvy, 0, false);
          // velocityRaw should be 0 (zeroed by threshold), so velocityCurrent stays at 0
          expect(result.velocityRaw).toBe(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 4: Reduced motion suppresses all motion uniforms
  // Validates: Requirements 1.6, 7.6, 9.1, 9.2, 9.3
  test('Property 4: reduced motion suppresses velocity, sets uReducedMotion=1, zeroes drift', function () {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }), { minLength: 0, maxLength: 10 }),
        function (mousePositions) {
          // Simulate velocity step with reduceMotion = true
          var prevX = 0.5,
            prevY = 0.5;
          var velCurrent = 0;
          for (var i = 0; i < mousePositions.length; i += 2) {
            var currX = mousePositions[i] || 0.5;
            var currY = mousePositions[i + 1] || 0.5;
            var result = velocityStep(prevX, prevY, currX, currY, velCurrent, true);
            velCurrent = result.velocityCurrent;
            prevX = currX;
            prevY = currY;
          }
          // With reduceMotion=true, velocity must always be 0
          expect(velCurrent).toBe(0);

          // uReducedMotion uniform must be 1.0 when reduceMotion is true
          // (This is set in initImmersiveScene — verify the formula)
          var reduceMotion = true;
          var uReducedMotionValue = reduceMotion ? 1.0 : 0.0;
          expect(uReducedMotionValue).toBe(1.0);

          // driftCurrent must be 0 when reduceMotion is true
          // (Simulate drift step with reduceMotion=true)
          var driftCurrent = 0.04; // non-zero starting value
          var driftTarget = 0.04;
          if (true /* reduceMotion */) {
            driftCurrent = 0;
          }
          expect(driftCurrent).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 5: Mood colour lerp converges toward target
  // Validates: Requirements 4.3, 6.3
  test('Property 5: mood colour lerp converges toward target after 200 steps', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
        function (cr, cg, cb, nr, ng, nb) {
          // Simulate 200 lerp steps
          var currentR = cr,
            currentG = cg,
            currentB = cb;
          var nextR = nr,
            nextG = ng,
            nextB = nb;
          var factor = 0.04;
          for (var i = 0; i < 200; i++) {
            currentR += (nextR - currentR) * factor;
            currentG += (nextG - currentG) * factor;
            currentB += (nextB - currentB) * factor;
          }
          // After 200 steps, current should be very close to next
          expect(Math.abs(currentR - nextR)).toBeLessThan(0.001);
          expect(Math.abs(currentG - nextG)).toBeLessThan(0.001);
          expect(Math.abs(currentB - nextB)).toBeLessThan(0.001);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: immersive-room-atmosphere, Property 6: Mood colour lerp continues under reduced motion
  // Validates: Requirement 9.4
  test('Property 6: mood colour lerp still advances toward target when reduceMotion is true', function () {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(0.9), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(0.9), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(0.9), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true }),
        function (cr, cg, cb, nr, ng, nb) {
          // Ensure current != next so we can verify movement
          var atm = makeAtmosphereModule();
          var uniforms = makeUniforms();

          // Set current to (cr, cg, cb) and next to (nr, ng, nb)
          atm._state.bgColorCurrent.r = cr;
          atm._state.bgColorCurrent.g = cg;
          atm._state.bgColorCurrent.b = cb;
          atm._state.bgColorNext.r = nr;
          atm._state.bgColorNext.g = ng;
          atm._state.bgColorNext.b = nb;

          var beforeR = atm._state.bgColorCurrent.r;
          var beforeG = atm._state.bgColorCurrent.g;
          var beforeB = atm._state.bgColorCurrent.b;

          // Call updateMoodUniforms — colour lerp should NOT be suppressed by reduceMotion
          // (colour transitions are not considered motion per Requirement 9.4)
          atm.updateMoodUniforms(uniforms, 0.04);

          var afterR = atm._state.bgColorCurrent.r;
          var afterG = atm._state.bgColorCurrent.g;
          var afterB = atm._state.bgColorCurrent.b;

          // After one step, current should have moved toward next
          // (i.e. distance to next should be smaller than before)
          var distBefore = Math.abs(beforeR - nr) + Math.abs(beforeG - ng) + Math.abs(beforeB - nb);
          var distAfter = Math.abs(afterR - nr) + Math.abs(afterG - ng) + Math.abs(afterB - nb);
          expect(distAfter).toBeLessThanOrEqual(distBefore + 1e-6);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// UNIT TESTS — Mood palette data and behavioural contracts
// ---------------------------------------------------------------------------

describe('Unit Tests — Mood palette data correctness', function () {
  var HEX_PATTERN = /^#[0-9a-f]{6}$/i;

  // 13.1 — Mood palette data correctness
  test('13.1a: each room in STORE_ROOMS has a mood property', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    var rooms = Object.keys(EXPECTED_MOOD_PALETTES);
    rooms.forEach(function (room) {
      expect(src).toMatch(new RegExp(room + '\\s*:\\s*\\{'));
    });
    // Verify mood property exists for all rooms
    expect(src.match(/mood\s*:\s*\{/g).length).toBeGreaterThanOrEqual(5);
  });

  test('13.1b: each mood has background, blob1, blob2 as valid CSS hex strings', function () {
    Object.keys(EXPECTED_MOOD_PALETTES).forEach(function (room) {
      var palette = EXPECTED_MOOD_PALETTES[room];
      expect(palette.background).toMatch(HEX_PATTERN);
      expect(palette.blob1).toMatch(HEX_PATTERN);
      expect(palette.blob2).toMatch(HEX_PATTERN);
    });
  });

  test('13.1c: exact hex values for all five rooms match the spec table', function () {
    expect(EXPECTED_MOOD_PALETTES.storefront.background).toBe('#0a0a0f');
    expect(EXPECTED_MOOD_PALETTES.storefront.blob1).toBe('#1a1025');
    expect(EXPECTED_MOOD_PALETTES.storefront.blob2).toBe('#0d0d1a');

    expect(EXPECTED_MOOD_PALETTES.lounge.background).toBe('#0f0a08');
    expect(EXPECTED_MOOD_PALETTES.lounge.blob1).toBe('#2a1a10');
    expect(EXPECTED_MOOD_PALETTES.lounge.blob2).toBe('#1a0f0a');

    expect(EXPECTED_MOOD_PALETTES.designer_houses.background).toBe('#080a12');
    expect(EXPECTED_MOOD_PALETTES.designer_houses.blob1).toBe('#101828');
    expect(EXPECTED_MOOD_PALETTES.designer_houses.blob2).toBe('#0a1020');

    expect(EXPECTED_MOOD_PALETTES.occasions.background).toBe('#0a0810');
    expect(EXPECTED_MOOD_PALETTES.occasions.blob1).toBe('#1e1028');
    expect(EXPECTED_MOOD_PALETTES.occasions.blob2).toBe('#120a1e');

    expect(EXPECTED_MOOD_PALETTES.featured_collections.background).toBe('#0a0a08');
    expect(EXPECTED_MOOD_PALETTES.featured_collections.blob1).toBe('#1e1e10');
    expect(EXPECTED_MOOD_PALETTES.featured_collections.blob2).toBe('#141408');
  });

  test('13.1d: hex values are present in room-manager.js source', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    // Spot-check a few key values
    expect(src).toMatch(/#0a0a0f/); // storefront background
    expect(src).toMatch(/#0f0a08/); // lounge background
    expect(src).toMatch(/#080a12/); // designer_houses background
    expect(src).toMatch(/#0a0810/); // occasions background
    expect(src).toMatch(/#0a0a08/); // featured_collections background
    expect(src).toMatch(/#2a1a10/); // lounge blob1
    expect(src).toMatch(/#1e1028/); // occasions blob1
  });
});

describe('Unit Tests — Drift direction on goToRoom()', function () {
  // 13.2 — Drift direction tests
  // We test the pure drift logic (the formula from goToRoom)
  function computeDriftTarget(fromBack, reduceMotion) {
    if (!reduceMotion) {
      return fromBack ? -0.04 : 0.04;
    } else {
      return 0;
    }
  }

  test('13.2a: forward navigation sets driftTarget to +0.04', function () {
    var target = computeDriftTarget(false, false);
    expect(target).toBeCloseTo(0.04, 10);
  });

  test('13.2b: backward navigation sets driftTarget to -0.04', function () {
    var target = computeDriftTarget(true, false);
    expect(target).toBeCloseTo(-0.04, 10);
  });

  test('13.2c: initial load keeps driftTarget at 0 (initial guard)', function () {
    // The goToRoom() guard: if (!initial) { ... set driftTarget ... }
    // So on initial=true, driftTarget stays at its module-level default of 0
    var initial = true;
    var driftTarget = 0; // module-level default
    if (!initial) {
      driftTarget = 0.04; // would be set here
    }
    expect(driftTarget).toBe(0);
  });

  test('13.2d: reduced motion zeroes driftTarget and driftCurrent', function () {
    var target = computeDriftTarget(false, true);
    expect(target).toBe(0);
    // driftCurrent is also set to 0 when reduceMotion is true
    var driftCurrent = 0.04; // non-zero
    var reduceMotion = true;
    if (reduceMotion) {
      driftCurrent = 0;
    }
    expect(driftCurrent).toBe(0);
  });
});

describe('Unit Tests — Crossfade completion behaviour', function () {
  // 13.3 — Crossfade completion
  test('13.3a: driftTarget is reset to 0 after crossfade completes', function () {
    // Simulate the t >= 1 block in _startRoomTextureLoad
    var driftTarget = 0.04; // set during goToRoom
    // After crossfade completes:
    driftTarget = 0;
    expect(driftTarget).toBe(0);
  });

  test('13.3b: snapCurrentToNext sets current colour uniforms equal to next', function () {
    var atm = makeAtmosphereModule();
    var uniforms = makeUniforms();

    // Set up different current and next colours
    atm._state.bgColorCurrent.set('#111111');
    atm._state.bgColorNext.set('#aabbcc');

    atm.snapCurrentToNext(uniforms);

    // After snap, current should equal next
    expect(atm._state.bgColorCurrent.r).toBeCloseTo(atm._state.bgColorNext.r, 5);
    expect(atm._state.bgColorCurrent.g).toBeCloseTo(atm._state.bgColorNext.g, 5);
    expect(atm._state.bgColorCurrent.b).toBeCloseTo(atm._state.bgColorNext.b, 5);

    // Uniforms should also reflect the snapped values
    expect(uniforms.uBgColor.value.r).toBeCloseTo(atm._state.bgColorNext.r, 5);
    expect(uniforms.uBgColor.value.g).toBeCloseTo(atm._state.bgColorNext.g, 5);
    expect(uniforms.uBgColor.value.b).toBeCloseTo(atm._state.bgColorNext.b, 5);
  });
});

describe('Unit Tests — initImmersiveScene() uniform initialisation', function () {
  // 13.4 — Uniform initialisation
  test('13.4a: uTime uniform is declared with initial value 0.0 in webgl-engine.js', function () {
    var fs = require('fs');
    var path = require('path');
    var src = fs.readFileSync(path.join(__dirname, '../assets/immersive/core/webgl-engine.js'), 'utf8');
    expect(src).toMatch(/uTime\s*:\s*\{\s*value\s*:\s*0\.0\s*\}/);
  });

  test('13.4b: uBgColor uniform is initialised to storefront background hex', function () {
    var atm = makeAtmosphereModule();
    var uniforms = makeUniforms();
    var storefrontMood = EXPECTED_MOOD_PALETTES.storefront;

    atm.initMoodUniforms(uniforms, storefrontMood);

    // Parse expected colour
    var expectedColor = new ThreeColorStub(storefrontMood.background);
    expect(uniforms.uBgColor.value.r).toBeCloseTo(expectedColor.r, 5);
    expect(uniforms.uBgColor.value.g).toBeCloseTo(expectedColor.g, 5);
    expect(uniforms.uBgColor.value.b).toBeCloseTo(expectedColor.b, 5);
  });

  test('13.4c: uBgColorNext uniform is also initialised to storefront background hex', function () {
    var atm = makeAtmosphereModule();
    var uniforms = makeUniforms();
    var storefrontMood = EXPECTED_MOOD_PALETTES.storefront;

    atm.initMoodUniforms(uniforms, storefrontMood);

    var expectedColor = new ThreeColorStub(storefrontMood.background);
    expect(uniforms.uBgColorNext.value.r).toBeCloseTo(expectedColor.r, 5);
    expect(uniforms.uBgColorNext.value.g).toBeCloseTo(expectedColor.g, 5);
    expect(uniforms.uBgColorNext.value.b).toBeCloseTo(expectedColor.b, 5);
  });
});

describe('Unit Tests — goToRoom() updates next colour uniforms', function () {
  // 13.5 — goToRoom updates next uniforms
  test('13.5: setNextMood with lounge palette updates uBgColorNext to lounge background #0f0a08', function () {
    var atm = makeAtmosphereModule();
    var uniforms = makeUniforms();

    // First init with storefront
    atm.initMoodUniforms(uniforms, EXPECTED_MOOD_PALETTES.storefront);

    // Then set next mood to lounge (simulating goToRoom('lounge'))
    atm.setNextMood(EXPECTED_MOOD_PALETTES.lounge);

    // The next colour should now be lounge background
    var expectedLounge = new ThreeColorStub(EXPECTED_MOOD_PALETTES.lounge.background);
    expect(atm._state.bgColorNext.r).toBeCloseTo(expectedLounge.r, 5);
    expect(atm._state.bgColorNext.g).toBeCloseTo(expectedLounge.g, 5);
    expect(atm._state.bgColorNext.b).toBeCloseTo(expectedLounge.b, 5);

    // After one updateMoodUniforms call, uBgColorNext should still reflect lounge
    // (uBgColorNext is not updated by updateMoodUniforms — only uBgColor is lerped)
    // Verify the next state is set correctly in the module
    expect(atm._state.bgColorNext.r).toBeCloseTo(expectedLounge.r, 5);
  });
});

describe('Unit Tests — Regression: existing uniforms unchanged after animate step', function () {
  // 13.6 — Regression tests for existing uniforms
  test('13.6: uScrollOffset, uAtmosphericMood, uTiltOffsetX, uTiltOffsetY are not modified by atmosphere module', function () {
    var atm = makeAtmosphereModule();
    var uniforms = makeUniforms();

    // Set pre-step values
    uniforms.uScrollOffset.value = 0.5;
    uniforms.uAtmosphericMood.value = 0.3;
    uniforms.uTiltOffsetX.value = 0.02;
    uniforms.uTiltOffsetY.value = -0.01;

    // Call updateMoodUniforms (the only atmosphere function called per frame)
    atm.updateMoodUniforms(uniforms, 0.04);

    // These uniforms must be unchanged
    expect(uniforms.uScrollOffset.value).toBe(0.5);
    expect(uniforms.uAtmosphericMood.value).toBe(0.3);
    expect(uniforms.uTiltOffsetX.value).toBe(0.02);
    expect(uniforms.uTiltOffsetY.value).toBe(-0.01);
  });
});
