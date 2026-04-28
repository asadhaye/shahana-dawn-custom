// Lightweight client-side filters for the immersive product grid (2D fallback friendly)
(function () {
  function getChipsContainer() {
    // Try common containers
    var c =
      document.querySelector('.immersive-product-grid__filters') ||
      document.querySelector('[data-filter-chips-container]');
    return c;
  }
  function clearActive() {
    var chips = getChipsContainer() ? getChipsContainer().querySelectorAll('.immersive-filter-chip') : [];
    chips.forEach(function (ch) {
      ch.classList.remove('active');
    });
  }

  function initImmersiveFilters(panel, collectionHandle, roomKey, sectionId) {
    // Placeholder for filter initialization
    // Full implementation to be extracted from immersive-store.js
    console.log('[Immersive] Filters initialized for collection:', collectionHandle);
  }

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.immersive-filter-chip');
    if (!chip) return;
    var value = chip.getAttribute('data-filter-value') || chip.textContent.trim();
    // activate this chip and filter cards by color as a simple heuristic
    clearActive();
    chip.classList.add('active');
    var grid = document.querySelector('.immersive-product-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('.immersive-product-card');
    cards.forEach(function (card) {
      var color = card.getAttribute('data-filter-color') || '';
      if (value.toLowerCase() === 'all' || color.toLowerCase() === value.toLowerCase()) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Expose initImmersiveFilters globally
  if (typeof window !== 'undefined') {
    window.initImmersiveFilters = initImmersiveFilters;
  }
})();

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Immersive Filters Public API
 *
 * Provides functions for managing product filtering in the immersive store.
 * Filters allow users to narrow down product grids by attributes like color.
 *
 * Note: Filter functionality is primarily event-driven via IIFE.
 * The initImmersiveFilters function is exposed for programmatic initialization.
 *
 * @namespace ImmersiveFilters
 */
if (typeof window !== 'undefined') {
  window.ImmersiveFilters = {
    initImmersiveFilters: window.initImmersiveFilters || function () {},
  };
}
