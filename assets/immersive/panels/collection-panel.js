/**
 * Panel: collection-panel
 * TODO: Extract from immersive-store.js
 */

function openCollectionPanel(collectionHandle) {
  exitGuidedMode();
  recordBrowsingSignal(immersiveState.currentRoom);
  saveState({ panel: 'collection', collection: collectionHandle, product: null });

  var path = shopRoot + 'collections/' + collectionHandle;
  var panel = document.getElementById(glassPanelId);
  if (!panel) return;

  var triggerEl = document.activeElement;

  console.log('Fetching collection:', collectionHandle);

  // Open panel and show skeleton immediately
  openPanel(panel, triggerEl);

  var contentArea = panel.querySelector('.immersive-store__panel-content');
  if (contentArea) {
    contentArea.innerHTML = renderSkeletonGrid(6);
    contentArea.style.opacity = '1';
  }

  // Fetch real content
  fetchSectionHtml(path, 'glass-panel', null)
    .then(function (html) {
      if (!html) {
        var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel, 'button');
        return;
      }

      function render() {
        if (contentArea) {
          fadeInContent(contentArea, html);
        } else {
          panel.innerHTML = html;
        }

        // Panel-specific setup
        setPanelRoomLabel(panel);
        setupVariantButtons(panel);
        setupBuyNowForm(panel);
        setupImageParallax(panel);
        setupVirtualTryOn(panel);
        syncAllWishlistToggles(panel);

        // Init fluid reveal effect after collection content loads
        if (typeof ImmersiveFluidReveal !== 'undefined') {
          ImmersiveFluidReveal.destroy();
          var grid = panel.querySelector('[data-enable-fluid-reveal]');
          var enabled = !grid || grid.getAttribute('data-enable-fluid-reveal') !== 'false';
          var intensity = grid ? parseInt(grid.getAttribute('data-fluid-reveal-intensity') || '5', 10) : 5;
          var maxScale = 10 + (intensity - 1) * (40 / 9);
          var cards = panel.querySelectorAll('.immersive-product-card');
          ImmersiveFluidReveal.init(cards, { maxScale: maxScale, enabled: enabled });
        }

        trackImmersiveEvent('panel_opened', {
          panel_type: 'collection',
          collection_handle: collectionHandle,
        });

        // Init filters after collection content loads
        var gridWrapper = panel.querySelector('.immersive-product-grid-wrapper');
        if (gridWrapper) {
          var collHandle = gridWrapper.closest('[data-collection-handle]')
            ? gridWrapper.closest('[data-collection-handle]').getAttribute('data-collection-handle')
            : collectionHandle;
          var currentRoomForFilters = (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'lounge';
          initImmersiveFilters(panel, collHandle || collectionHandle, currentRoomForFilters, 'glass-panel');
        }

        // Panel click handler
        panel.onclick = function (event) {
          if (event.target === panel) {
            closePanel(panel, 'backdrop');
            return;
          }
          if (event.target.closest('.immersive-store__panel-close')) {
            closePanel(panel, 'button');
            closePanel(panel);
            return;
          }

          // Empty state action handling
          var emptyAction = event.target.closest('[data-empty-action]');
          if (emptyAction) {
            var action = emptyAction.getAttribute('data-empty-action');
            if (action) {
              handleEmptyStateAction(action);
            }
            return;
          }

          // Product card click — intercept clicks on the article OR any child
          // element with data-product-handle (e.g. inner <a> links).
          // event.preventDefault() is called IMMEDIATELY before any other logic
          // so browser navigation on <a href> elements is cancelled synchronously.
          var cardOrLink = event.target.closest('.immersive-product-card, [data-product-handle]');
          if (cardOrLink) {
            event.preventDefault();
            var handle = cardOrLink.getAttribute('data-product-handle');
            if (!handle) {
              var parentCard = cardOrLink.closest('.immersive-product-card');
              handle = parentCard && parentCard.getAttribute('data-product-handle');
            }
            if (handle) {
              openProductPanel(handle, collectionHandle);
            }
            return;
          }
        };
      }

      transitionPanelContent(panel, render);
    })
    .catch(function (error) {
      console.error('[Immersive] Panel fetch failed:', error);
      var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
      showErrorFeedback(panel, errMsg);
      closePanel(panel, 'button');
    });
}

// ---------------------------------------------------------------------------
// Global API Exposure
// ---------------------------------------------------------------------------
/**
 * Collection Panel Public API
 *
 * Provides functions for managing collection panel functionality in the immersive store.
 * The collection panel displays product grids and enables browsing collections within
 * the immersive experience.
 *
 * @namespace ImmersiveCollectionPanel
 */
if (typeof window !== 'undefined') {
  window.ImmersiveCollectionPanel = {
    openCollectionPanel: openCollectionPanel,
  };

  // Backward-compatible global alias for critical function
  window.openCollectionPanel = openCollectionPanel;
}
