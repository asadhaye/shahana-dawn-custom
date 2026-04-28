/**
 * Feature: limited-time
 * TODO: Extract from immersive-store.js
 */

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

function renderCountdown(endTime, containerEl) {
  if (!containerEl) return;
  var reduceMotionLT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var endDate = new Date(endTime);
  if (isNaN(endDate.getTime())) return; // silently skip invalid dates

  function update() {
    var state = computeCountdown(endDate);
    if (state.expired) {
      containerEl.innerHTML = '';
      return;
    }
    var parts = [];
    if (state.days > 0) parts.push(state.days + 'd');
    parts.push(pad(state.hours) + 'h');
    parts.push(pad(state.minutes) + 'm');
    parts.push(pad(state.seconds) + 's');
    containerEl.textContent = parts.join(' ');
    if (!reduceMotionLT) containerEl.classList.add('is-ticking');
  }

  update();
  var intervalId = setInterval(update, 1000);
  _limitedTimeIntervals.push(intervalId);
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function renderLowStockBadge(quantity, containerEl) {
  if (!containerEl || quantity === null || quantity === undefined || isNaN(quantity)) return;
  if (quantity > _lowStockThreshold) return;
  var badge = document.createElement('span');
  badge.className = 'immersive-low-stock-badge immersive-badge';
  badge.textContent = 'Only ' + quantity + ' left';
  containerEl.appendChild(badge);
}

function scanLimitedTimeCards(scopeEl) {
  var scope = scopeEl || document;
  scope.querySelectorAll('[data-sale-end-date]').forEach(function (card) {
    var endDate = card.getAttribute('data-sale-end-date');
    var qty = parseInt(card.getAttribute('data-inventory-quantity'), 10);
    var urgency = card.querySelector('[data-urgency-container]');
    if (!urgency) return;
    urgency.innerHTML = '';
    if (endDate) {
      var countdownEl = document.createElement('span');
      countdownEl.className = 'immersive-countdown';
      urgency.appendChild(countdownEl);
      renderCountdown(endDate, countdownEl);
    }
    if (!isNaN(qty)) {
      renderLowStockBadge(qty, urgency);
    }
  });
}

function showFlashSaleAlert() {
  var banners = document.querySelectorAll('[data-flash-sale-banner]');
  banners.forEach(function (banner) {
    var dismissKey = 'immersive_flash_dismissed';
    try {
      if (sessionStorage.getItem(dismissKey)) return;
    } catch (e) {}

    banner.hidden = false;

    var endDate = banner.getAttribute('data-sale-end-date');
    var countdownEl = banner.querySelector('[data-flash-countdown]');
    if (endDate && countdownEl) renderCountdown(endDate, countdownEl);

    var dismissBtn = banner.querySelector('[data-flash-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.hidden = true;
        try {
          sessionStorage.setItem(dismissKey, '1');
        } catch (e) {}
      });
    }
  });
}

function clearLimitedTimeIntervals() {
  _limitedTimeIntervals.forEach(function (id) {
    clearInterval(id);
  });
  _limitedTimeIntervals = [];
}

function initImmersiveLimitedTime() {
  // Read threshold from section setting
  var storeEl = document.querySelector('.immersive-store');
  if (storeEl) {
    var threshold = parseInt(storeEl.getAttribute('data-low-stock-threshold'), 10);
    if (!isNaN(threshold)) _lowStockThreshold = threshold;
  }

  // Scan existing cards
  scanLimitedTimeCards();

  // Show flash sale banners
  showFlashSaleAlert();
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Limited Time Public API
 *
 * Provides functions for managing limited-time offers and urgency indicators.
 * Includes countdown timers, low stock badges, and flash sale alerts.
 *
 * Private helper functions (computeCountdown, renderCountdown, pad, renderLowStockBadge,
 * scanLimitedTimeCards, showFlashSaleAlert) remain locally scoped as internal
 * implementation details.
 *
 * @namespace ImmersiveLimitedTime
 */
if (typeof window !== 'undefined') {
  window.ImmersiveLimitedTime = {
    initImmersiveLimitedTime: initImmersiveLimitedTime,
    clearLimitedTimeIntervals: clearLimitedTimeIntervals,
    scanLimitedTimeCards: scanLimitedTimeCards,
  };

  // Backward-compatible global aliases
  window.initImmersiveLimitedTime = initImmersiveLimitedTime;
  window.clearLimitedTimeIntervals = clearLimitedTimeIntervals;
}
