/**
 * Feature: room-recommender
 * TODO: Extract from immersive-store.js
 */

function trackRoomVisit(roomKey) {
  if (_browsingContext.visitedRooms.indexOf(roomKey) === -1) {
    _browsingContext.visitedRooms.push(roomKey);
  }
  evaluateRoomRecommendation();
  syncVisitedRooms();
}

function getRecommendation(context) {
  // Override hook for ML-driven scoring
  if (typeof window.ImmersiveRecommenderOverride === 'function') {
    try {
      var override = window.ImmersiveRecommenderOverride(context);
      if (override && override.roomKey) return override;
    } catch (e) {}
  }

  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  // Rule 1: wishlist/cart contains bridal/mehndi → occasions
  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  // Rule 2: wishlist contains designer-house products → designer_houses
  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  // Rule 3: visited designer_houses but not occasions
  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  // Rule 4: visited occasions but not featured_collections
  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  // Default fallback
  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

function evaluateRoomRecommendation() {
  if (!_browsingContext.visitedRooms.length) return;
  var rec = getRecommendation(_browsingContext);
  if (!rec) return;

  // Check if already dismissed this session
  try {
    if (sessionStorage.getItem('immersive_rec_dismissed_' + rec.roomKey)) return;
  } catch (e) {}

  showRoomRecommendation(rec);
}

function showRoomRecommendation(rec) {
  // Remove existing chip
  var existing = document.querySelector('.immersive-rec-chip');
  if (existing) existing.remove();

  var chip = document.createElement('div');
  chip.className = 'immersive-rec-chip';
  chip.setAttribute('role', 'complementary');
  chip.setAttribute('aria-label', rec.reason + ': ' + rec.label);

  var reason = document.createElement('span');
  reason.className = 'immersive-rec-chip__reason';
  reason.textContent = rec.reason;

  var label = document.createElement('button');
  label.type = 'button';
  label.className = 'immersive-rec-chip__label';
  label.textContent = rec.label + ' →';
  label.addEventListener('click', function () {
    chip.remove();
    if (typeof goToRoom === 'function') goToRoom(rec.roomKey);
  });

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'immersive-rec-chip__dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss suggestion');
  dismiss.innerHTML = '×';
  dismiss.addEventListener('click', function () {
    try {
      sessionStorage.setItem('immersive_rec_dismissed_' + rec.roomKey, '1');
    } catch (e) {}
    chip.remove();
  });

  chip.appendChild(reason);
  chip.appendChild(label);
  chip.appendChild(dismiss);
  document.body.appendChild(chip);

  // Auto-dismiss after 10s
  setTimeout(function () {
    if (chip.parentNode) chip.remove();
  }, 10000);
}

function initImmersiveRoomRecommender() {
  // Sync browsing context with wishlist
  if (typeof _wishlistItems !== 'undefined') {
    _browsingContext.savedProducts = _wishlistItems.map(function (item) {
      return item.handle || '';
    });
  }
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Room Recommender Public API
 *
 * Provides functions for managing intelligent room recommendations based on
 * user browsing behavior, wishlist, and cart contents.
 *
 * Private helper functions (getRecommendation, evaluateRoomRecommendation,
 * showRoomRecommendation) remain locally scoped as internal implementation details.
 *
 * @namespace ImmersiveRecommender
 */
if (typeof window !== 'undefined') {
  window.ImmersiveRecommender = {
    trackRoomVisit: trackRoomVisit,
    initImmersiveRoomRecommender: initImmersiveRoomRecommender,
  };

  // Backward-compatible global aliases
  window.trackRoomVisit = trackRoomVisit;
  window.initImmersiveRoomRecommender = initImmersiveRoomRecommender;
}
