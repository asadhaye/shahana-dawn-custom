/**
 * Skeleton loader utilities
 * Extracted from immersive-store.js
 */

function renderSkeletonGrid(count) {
  var html = '<div class="immersive-skeleton-grid">';
  for (var i = 0; i < (count || 6); i++) {
    html += '<div class="immersive-skeleton-card">';
    html += '<div class="immersive-skeleton-image"></div>';
    html += '<div class="immersive-skeleton-text"></div>';
    html += '<div class="immersive-skeleton-text short"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderSkeletonProduct() {
  var html = '<div class="immersive-skeleton-product">';
  html += '<div class="immersive-skeleton-gallery"></div>';
  html += '<div class="immersive-skeleton-details">';
  html += '<div class="immersive-skeleton-text large"></div>';
  html += '<div class="immersive-skeleton-text"></div>';
  html += '<div class="immersive-skeleton-text short"></div>';
  html += '</div>';
  html += '</div>';
  return html;
}

function renderSkeletonRoom() {
  return '<div class="immersive-skeleton-room"></div>';
}

// Export to global scope
window.ImmersiveSkeleton = {
  renderSkeletonGrid: renderSkeletonGrid,
  renderSkeletonProduct: renderSkeletonProduct,
  renderSkeletonRoom: renderSkeletonRoom
};
