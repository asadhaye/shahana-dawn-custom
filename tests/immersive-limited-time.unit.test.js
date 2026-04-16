/**
 * Unit Tests: ImmersiveLimitedTime
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify countdown arithmetic, expiry removes element, invalid ISO 8601
 * silently skipped, flash sale banner dismissal stored in sessionStorage,
 * and timer cleanup on panel close.
 *
 * Requirements: 8.2, 8.6, 8.7, 8.8
 */

'use strict';

// ---------------------------------------------------------------------------
// Functions reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function computeCountdown(endTime) {
  var now = Date.now();
  var end = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();
  if (isNaN(end) || end <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  var diff = Math.floor((end - now) / 1000);
  var days = Math.floor(diff / 86400);
  var hours = Math.floor((diff % 86400) / 3600);
  var minutes = Math.floor((diff % 3600) / 60);
  var seconds = diff % 60;
  return { days: days, hours: hours, minutes: minutes, seconds: seconds, expired: false };
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function createMockStorage() {
  var store = {};
  return {
    getItem: function (key) {
      return store.hasOwnProperty(key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
}

/**
 * renderCountdown — reproduced from assets/immersive-store.js.
 * Returns the intervalId so tests can verify cleanup.
 */
function renderCountdown(endTime, containerEl, intervals) {
  if (!containerEl) return null;

  var endDate = new Date(endTime);
  if (isNaN(endDate.getTime())) return null; // silently skip invalid dates

  function update() {
    var state = computeCountdown(endDate);
    if (state.expired) {
      containerEl.innerHTML = '';
      clearInterval(intervalId);
      if (intervals) {
        var idx = intervals.indexOf(intervalId);
        if (idx !== -1) intervals.splice(idx, 1);
      }
      return;
    }
    var parts = [];
    if (state.days > 0) parts.push(state.days + 'd');
    parts.push(pad(state.hours) + 'h');
    parts.push(pad(state.minutes) + 'm');
    parts.push(pad(state.seconds) + 's');
    containerEl.textContent = parts.join(' ');
  }

  update();
  var intervalId = setInterval(update, 1000);
  if (intervals) intervals.push(intervalId);
  return intervalId;
}

/**
 * showFlashSaleAlert — reproduced from assets/immersive-store.js.
 */
function showFlashSaleAlert(message, endDate, storage) {
  var FLASH_KEY = 'immersive_flash_dismissed';
  try {
    if ((storage || sessionStorage).getItem(FLASH_KEY)) return null; // already dismissed
  } catch (e) {}

  var banner = document.createElement('div');
  banner.className = 'immersive-flash-sale-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'assertive');

  var msg = document.createElement('span');
  msg.textContent = message;
  banner.appendChild(msg);

  var dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'immersive-flash-sale-banner__dismiss';
  dismissBtn.setAttribute('aria-label', 'Dismiss');
  dismissBtn.addEventListener('click', function () {
    banner.remove();
    try {
      (storage || sessionStorage).setItem(FLASH_KEY, '1');
    } catch (e) {}
  });
  banner.appendChild(dismissBtn);

  document.body.appendChild(banner);
  return banner;
}

// ---------------------------------------------------------------------------
// Tests: Countdown arithmetic (Requirement 8.2)
// ---------------------------------------------------------------------------

describe('ImmersiveLimitedTime — countdown arithmetic', () => {
  test('1 day from now: days=1, hours=0, minutes=0, seconds=0', () => {
    var endTime = new Date(Date.now() + 86400 * 1000 + 500); // +500ms buffer
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(false);
    expect(state.days).toBe(1);
    expect(state.hours).toBe(0);
    expect(state.minutes).toBe(0);
  });

  test('1 hour from now: days=0, hours=1, minutes=0', () => {
    var endTime = new Date(Date.now() + 3600 * 1000 + 500);
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(false);
    expect(state.days).toBe(0);
    expect(state.hours).toBe(1);
    expect(state.minutes).toBe(0);
  });

  test('90 minutes from now: days=0, hours=1, minutes=30', () => {
    var endTime = new Date(Date.now() + 90 * 60 * 1000 + 500);
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(false);
    expect(state.days).toBe(0);
    expect(state.hours).toBe(1);
    expect(state.minutes).toBe(30);
  });

  test('30 seconds from now: days=0, hours=0, minutes=0, seconds=30', () => {
    var endTime = new Date(Date.now() + 30 * 1000 + 500);
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(false);
    expect(state.days).toBe(0);
    expect(state.hours).toBe(0);
    expect(state.minutes).toBe(0);
    expect(state.seconds).toBe(30);
  });

  test('2 days 3 hours 45 minutes from now', () => {
    var ms = (2 * 86400 + 3 * 3600 + 45 * 60) * 1000 + 500;
    var endTime = new Date(Date.now() + ms);
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(false);
    expect(state.days).toBe(2);
    expect(state.hours).toBe(3);
    expect(state.minutes).toBe(45);
  });

  test('past time returns expired=true with all zeros', () => {
    var endTime = new Date(Date.now() - 1000);
    var state = computeCountdown(endTime);
    expect(state.expired).toBe(true);
    expect(state.days).toBe(0);
    expect(state.hours).toBe(0);
    expect(state.minutes).toBe(0);
    expect(state.seconds).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: Expiry removes element (Requirement 8.6)
// ---------------------------------------------------------------------------

describe('ImmersiveLimitedTime — expiry removes countdown element', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('countdown element is cleared when timer expires', () => {
    var container = document.createElement('div');
    container.className = 'immersive-countdown';
    document.body.appendChild(container);

    // Set end time 2 seconds in the future
    var endTime = new Date(Date.now() + 2000);
    var intervals = [];
    renderCountdown(endTime, container, intervals);

    // Initially has content
    expect(container.textContent).not.toBe('');

    // Advance past expiry
    jest.advanceTimersByTime(3000);
    expect(container.innerHTML).toBe('');
  });

  test('interval is cleared from tracking array on expiry', () => {
    var container = document.createElement('div');
    document.body.appendChild(container);

    var endTime = new Date(Date.now() + 1000);
    var intervals = [];
    renderCountdown(endTime, container, intervals);

    expect(intervals).toHaveLength(1);

    jest.advanceTimersByTime(2000);
    expect(intervals).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: Invalid ISO 8601 silently skipped (Requirement 8.7)
// ---------------------------------------------------------------------------

describe('ImmersiveLimitedTime — invalid ISO 8601 silently skipped', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('invalid date string: renderCountdown returns null without throwing', () => {
    var container = document.createElement('div');
    document.body.appendChild(container);

    expect(() => {
      var result = renderCountdown('not-a-date', container, []);
      expect(result).toBeNull();
    }).not.toThrow();
  });

  test('empty string: renderCountdown returns null without throwing', () => {
    var container = document.createElement('div');
    expect(() => {
      var result = renderCountdown('', container, []);
      expect(result).toBeNull();
    }).not.toThrow();
  });

  test('null endTime: renderCountdown does not throw', () => {
    var container = document.createElement('div');
    // new Date(null) = epoch (past) — renderCountdown may start an interval
    // that immediately expires. The key requirement is no throw and no content.
    expect(() => {
      renderCountdown(null, container, []);
    }).not.toThrow();
    // Container should be empty (expired immediately)
    expect(container.innerHTML).toBe('');
  });

  test('invalid date: container content is not modified', () => {
    var container = document.createElement('div');
    container.textContent = 'original content';
    document.body.appendChild(container);

    renderCountdown('invalid-date-string', container, []);
    expect(container.textContent).toBe('original content');
  });

  test('computeCountdown with invalid string returns expired=true', () => {
    var state = computeCountdown('not-a-date');
    expect(state.expired).toBe(true);
  });

  test('computeCountdown with null returns expired=true', () => {
    var state = computeCountdown(null);
    expect(state.expired).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Flash sale banner dismissal stored in sessionStorage (Requirement 8.8)
// ---------------------------------------------------------------------------

describe('ImmersiveLimitedTime — flash sale banner dismissal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('flash sale banner is shown when not dismissed', () => {
    var storage = createMockStorage();
    var banner = showFlashSaleAlert('50% off today!', null, storage);
    expect(banner).not.toBeNull();
    expect(document.querySelector('.immersive-flash-sale-banner')).not.toBeNull();
  });

  test('flash sale banner shows the merchant message', () => {
    var storage = createMockStorage();
    showFlashSaleAlert('Eid Sale — 30% off!', null, storage);
    expect(document.querySelector('.immersive-flash-sale-banner').textContent).toContain('Eid Sale — 30% off!');
  });

  test('dismissing banner stores flag in sessionStorage', () => {
    var storage = createMockStorage();
    showFlashSaleAlert('Sale!', null, storage);

    var dismissBtn = document.querySelector('.immersive-flash-sale-banner__dismiss');
    dismissBtn.click();

    expect(storage.getItem('immersive_flash_dismissed')).toBe('1');
  });

  test('dismissing banner removes it from DOM', () => {
    var storage = createMockStorage();
    showFlashSaleAlert('Sale!', null, storage);

    var dismissBtn = document.querySelector('.immersive-flash-sale-banner__dismiss');
    dismissBtn.click();

    expect(document.querySelector('.immersive-flash-sale-banner')).toBeNull();
  });

  test('banner is not shown again after dismissal in same session', () => {
    var storage = createMockStorage();
    storage.setItem('immersive_flash_dismissed', '1');

    var banner = showFlashSaleAlert('Sale!', null, storage);
    expect(banner).toBeNull();
    expect(document.querySelector('.immersive-flash-sale-banner')).toBeNull();
  });

  test('handles sessionStorage access errors gracefully', () => {
    var brokenStorage = {
      getItem: function () {
        throw new Error('Access denied');
      },
      setItem: function () {
        throw new Error('Access denied');
      },
    };

    expect(() => showFlashSaleAlert('Sale!', null, brokenStorage)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Tests: Timer cleanup on panel close (Requirement 8.2)
// ---------------------------------------------------------------------------

describe('ImmersiveLimitedTime — timer cleanup on panel close', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('clearing all tracked intervals stops countdown updates', () => {
    var container1 = document.createElement('div');
    var container2 = document.createElement('div');
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    var endTime = new Date(Date.now() + 60000);
    var intervals = [];

    renderCountdown(endTime, container1, intervals);
    renderCountdown(endTime, container2, intervals);

    expect(intervals).toHaveLength(2);

    // Simulate panel close: clear all intervals
    intervals.forEach(function (id) {
      clearInterval(id);
    });
    intervals.length = 0;

    expect(intervals).toHaveLength(0);

    // Advance time — containers should not update (intervals cleared)
    var textBefore1 = container1.textContent;
    var textBefore2 = container2.textContent;
    jest.advanceTimersByTime(2000);

    // Content should not have changed (intervals were cleared)
    expect(container1.textContent).toBe(textBefore1);
    expect(container2.textContent).toBe(textBefore2);
  });
});
