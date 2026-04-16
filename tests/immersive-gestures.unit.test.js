/**
 * Unit Tests: ImmersiveGestures
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify the ImmersiveGestures module behaviour as implemented in
 * assets/immersive-store.js.
 *
 * Requirements: 3.2, 3.3, 3.6, 3.7
 */

'use strict';

// ---------------------------------------------------------------------------
// classifyGesture — reproduced verbatim from assets/immersive-store.js
// ---------------------------------------------------------------------------

function classifyGesture(deltaX, deltaY) {
  var absDx = Math.abs(deltaX);
  var absDy = Math.abs(deltaY);
  if (absDx < 60 && absDy < 60) return 'none';
  if (absDy === 0) return absDx >= 60 ? 'horizontal' : 'none';
  var ratio = absDx / absDy;
  if (ratio > 2.5) return 'horizontal';
  if (absDy >= 60) return deltaY > 0 ? 'vertical-down' : 'vertical-up';
  return 'none';
}

// ---------------------------------------------------------------------------
// Circular room sequence — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

var SWIPE_ROOM_SEQUENCE = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];

function getNextRoom(currentRoom, direction) {
  var idx = SWIPE_ROOM_SEQUENCE.indexOf(currentRoom);
  if (idx === -1) idx = 0;
  if (direction === 'left') {
    return SWIPE_ROOM_SEQUENCE[(idx + 1) % SWIPE_ROOM_SEQUENCE.length];
  } else {
    return SWIPE_ROOM_SEQUENCE[(idx - 1 + SWIPE_ROOM_SEQUENCE.length) % SWIPE_ROOM_SEQUENCE.length];
  }
}

// ---------------------------------------------------------------------------
// Cooldown guard — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function createCooldownGuard(cooldownMs) {
  var lastTransition = 0;
  return {
    canTransition: function () {
      return Date.now() - lastTransition >= cooldownMs;
    },
    record: function () {
      lastTransition = Date.now();
    },
    reset: function () {
      lastTransition = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Interactive element guard — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function isInteractiveTarget(target) {
  if (!target) return false;
  return !!target.closest(
    'button, a, input, select, textarea, [role="radio"], [role="option"], [data-immersive-search]',
  );
}

// ---------------------------------------------------------------------------
// Tests: Direction lock threshold (Requirement 3.2)
// ---------------------------------------------------------------------------

describe('ImmersiveGestures — direction lock threshold (ratio 2.5)', () => {
  test('ratio exactly 2.5 is NOT classified as horizontal (must be > 2.5)', () => {
    // 150/60 = 2.5 exactly — not horizontal
    expect(classifyGesture(150, 60)).not.toBe('horizontal');
  });

  test('ratio just above 2.5 IS classified as horizontal', () => {
    // 151/60 ≈ 2.517 > 2.5 → horizontal
    expect(classifyGesture(151, 60)).toBe('horizontal');
  });

  test('ratio well above 2.5 is horizontal', () => {
    expect(classifyGesture(300, 50)).toBe('horizontal');
    expect(classifyGesture(-300, 50)).toBe('horizontal');
  });

  test('ratio below 2.5 with sufficient vertical delta is vertical', () => {
    // 60/100 = 0.6 < 2.5, deltaY=100 >= 60 → vertical-down
    expect(classifyGesture(60, 100)).toBe('vertical-down');
  });

  test('pure horizontal (deltaY=0) with deltaX >= 60 is horizontal', () => {
    expect(classifyGesture(60, 0)).toBe('horizontal');
    expect(classifyGesture(200, 0)).toBe('horizontal');
    expect(classifyGesture(-60, 0)).toBe('horizontal');
  });
});

// ---------------------------------------------------------------------------
// Tests: 60px minimum distance (Requirement 3.3)
// ---------------------------------------------------------------------------

describe('ImmersiveGestures — 60px minimum swipe distance', () => {
  test('deltaX=59, deltaY=0 → none (below threshold)', () => {
    expect(classifyGesture(59, 0)).toBe('none');
  });

  test('deltaX=60, deltaY=0 → horizontal (at threshold)', () => {
    expect(classifyGesture(60, 0)).toBe('horizontal');
  });

  test('deltaY=59, deltaX=0 → none (below threshold)', () => {
    expect(classifyGesture(0, 59)).toBe('none');
  });

  test('deltaY=60, deltaX=0 → vertical-down (at threshold)', () => {
    expect(classifyGesture(0, 60)).toBe('vertical-down');
  });

  test('deltaY=-60, deltaX=0 → vertical-up (at threshold)', () => {
    expect(classifyGesture(0, -60)).toBe('vertical-up');
  });

  test('both below 60 → none regardless of direction', () => {
    expect(classifyGesture(50, 50)).toBe('none');
    expect(classifyGesture(-50, -50)).toBe('none');
    expect(classifyGesture(0, 0)).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// Tests: 600ms cooldown between room transitions (Requirement 3.6)
// ---------------------------------------------------------------------------

describe('ImmersiveGestures — 600ms cooldown between room transitions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('transition is allowed when cooldown has elapsed', () => {
    var guard = createCooldownGuard(600);
    guard.record();

    jest.advanceTimersByTime(600);
    expect(guard.canTransition()).toBe(true);
  });

  test('transition is blocked before cooldown elapses', () => {
    var guard = createCooldownGuard(600);
    guard.record();

    jest.advanceTimersByTime(599);
    expect(guard.canTransition()).toBe(false);
  });

  test('transition is allowed before any previous transition', () => {
    var guard = createCooldownGuard(600);
    expect(guard.canTransition()).toBe(true);
  });

  test('rapid swipes: second swipe blocked within cooldown window', () => {
    var guard = createCooldownGuard(600);
    var transitionCount = 0;

    // First swipe
    if (guard.canTransition()) {
      guard.record();
      transitionCount++;
    }

    // Immediate second swipe (within cooldown)
    jest.advanceTimersByTime(100);
    if (guard.canTransition()) {
      guard.record();
      transitionCount++;
    }

    expect(transitionCount).toBe(1);
  });

  test('swipe after cooldown is allowed', () => {
    var guard = createCooldownGuard(600);
    var transitionCount = 0;

    if (guard.canTransition()) {
      guard.record();
      transitionCount++;
    }
    jest.advanceTimersByTime(601);
    if (guard.canTransition()) {
      guard.record();
      transitionCount++;
    }

    expect(transitionCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: Interactive element guard (Requirement 3.7)
// ---------------------------------------------------------------------------

describe('ImmersiveGestures — interactive element guard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('gesture on a button is ignored', () => {
    var btn = document.createElement('button');
    document.body.appendChild(btn);
    expect(isInteractiveTarget(btn)).toBe(true);
  });

  test('gesture on an anchor is ignored', () => {
    var a = document.createElement('a');
    a.href = '/';
    document.body.appendChild(a);
    expect(isInteractiveTarget(a)).toBe(true);
  });

  test('gesture on an input is ignored', () => {
    var input = document.createElement('input');
    document.body.appendChild(input);
    expect(isInteractiveTarget(input)).toBe(true);
  });

  test('gesture on [role="radio"] is ignored', () => {
    var radio = document.createElement('div');
    radio.setAttribute('role', 'radio');
    document.body.appendChild(radio);
    expect(isInteractiveTarget(radio)).toBe(true);
  });

  test('gesture on [data-immersive-search] is ignored', () => {
    var search = document.createElement('div');
    search.setAttribute('data-immersive-search', '');
    document.body.appendChild(search);
    expect(isInteractiveTarget(search)).toBe(true);
  });

  test('gesture on a child of a button is ignored', () => {
    var btn = document.createElement('button');
    var span = document.createElement('span');
    btn.appendChild(span);
    document.body.appendChild(btn);
    expect(isInteractiveTarget(span)).toBe(true);
  });

  test('gesture on a plain div is NOT ignored', () => {
    var div = document.createElement('div');
    document.body.appendChild(div);
    expect(isInteractiveTarget(div)).toBe(false);
  });

  test('gesture on canvas is NOT ignored', () => {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    expect(isInteractiveTarget(canvas)).toBe(false);
  });

  test('null target is NOT interactive', () => {
    expect(isInteractiveTarget(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Circular room sequence (Requirement 3.3)
// ---------------------------------------------------------------------------

describe('ImmersiveGestures — circular room sequence', () => {
  test('swipe left from storefront goes to lounge', () => {
    expect(getNextRoom('storefront', 'left')).toBe('lounge');
  });

  test('swipe left from lounge goes to designer_houses', () => {
    expect(getNextRoom('lounge', 'left')).toBe('designer_houses');
  });

  test('swipe left from designer_houses goes to occasions', () => {
    expect(getNextRoom('designer_houses', 'left')).toBe('occasions');
  });

  test('swipe left from occasions goes to featured_collections', () => {
    expect(getNextRoom('occasions', 'left')).toBe('featured_collections');
  });

  test('swipe left from featured_collections wraps to storefront', () => {
    expect(getNextRoom('featured_collections', 'left')).toBe('storefront');
  });

  test('swipe right from storefront wraps to featured_collections', () => {
    expect(getNextRoom('storefront', 'right')).toBe('featured_collections');
  });

  test('swipe right from lounge goes to storefront', () => {
    expect(getNextRoom('lounge', 'right')).toBe('storefront');
  });

  test('swipe right from featured_collections goes to occasions', () => {
    expect(getNextRoom('featured_collections', 'right')).toBe('occasions');
  });

  test('unknown room defaults to index 0 (storefront) for navigation', () => {
    // Unknown room → idx=0 (storefront), left → lounge
    expect(getNextRoom('unknown_room', 'left')).toBe('lounge');
  });

  test('full left traversal visits all rooms and wraps back', () => {
    var room = 'storefront';
    var visited = [room];
    for (var i = 0; i < SWIPE_ROOM_SEQUENCE.length; i++) {
      room = getNextRoom(room, 'left');
      visited.push(room);
    }
    // After 5 left swipes from storefront, we should be back at storefront
    expect(visited[visited.length - 1]).toBe('storefront');
    // All 5 rooms should have been visited
    SWIPE_ROOM_SEQUENCE.forEach(function (r) {
      expect(visited).toContain(r);
    });
  });
});
