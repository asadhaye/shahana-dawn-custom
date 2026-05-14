/* =============================================================================
   Immersive Luxury Refinements — JS Behaviors
   IntersectionObserver reveals, smooth timeline, skeleton states
   ============================================================================= */

(function () {
  'use strict';

  var LUX_CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // ── Intersection Observer for product card reveals ──────────────────────

  var revealObserver = null;

  function initRevealObserver() {
    if (!('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var card = entry.target;
            card.classList.add('is-visible');
            revealObserver.unobserve(card);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
  }

  function observeCards(container) {
    if (!revealObserver) initRevealObserver();
    if (!revealObserver || !container) return;

    var cards = container.querySelectorAll('.immersive-product-card');
    cards.forEach(function (card, i) {
      card.classList.add('luxury-reveal');
      card.style.transitionDelay = (i * 80) + 'ms';
      revealObserver.observe(card);
    });
  }

  // ── Smooth Timeline Thumb ───────────────────────────────────────────────

  var thumbSmoothing = {
    current: 0,
    target: 0,
    rafId: null,
    active: false
  };

  function smoothThumbUpdate() {
    if (!thumbSmoothing.active) return;

    var diff = thumbSmoothing.target - thumbSmoothing.current;
    if (Math.abs(diff) < 0.5) {
      thumbSmoothing.current = thumbSmoothing.target;
      thumbSmoothing.rafId = null;
      thumbSmoothing.active = false;
      applyThumbPosition(thumbSmoothing.current);
      return;
    }

    // Organic easing — decelerates as it approaches target
    thumbSmoothing.current += diff * 0.12;
    applyThumbPosition(thumbSmoothing.current);
    thumbSmoothing.rafId = requestAnimationFrame(smoothThumbUpdate);
  }

  function applyThumbPosition(progress) {
    var thumb = document.querySelector('.immersive-designers__thumb');
    if (!thumb) return;

    var rail = document.querySelector('.immersive-designers__rail');
    if (!rail) return;

    var markers = rail.querySelectorAll('.immersive-designers__marker');
    if (markers.length < 2) return;

    var railRect = rail.getBoundingClientRect();
    var firstMarker = markers[0].getBoundingClientRect();
    var lastMarker = markers[markers.length - 1].getBoundingClientRect();
    var activeMarker = rail.querySelector('.immersive-designers__marker.is-active');

    if (!activeMarker) return;

    var activeRect = activeMarker.getBoundingClientRect();
    var startX = firstMarker.left + firstMarker.width / 2 - railRect.left;
    var endX = lastMarker.left + lastMarker.width / 2 - railRect.left;
    var activeX = activeRect.left + activeRect.width / 2 - railRect.left;
    var thumbWidth = Math.max(activeRect.width * 0.6, 40);

    thumb.style.left = (activeX - thumbWidth / 2) + 'px';
    thumb.style.width = thumbWidth + 'px';
  }

  function initSmoothThumb() {
    var rail = document.querySelector('.immersive-designers__rail');
    if (!rail) return;

    rail.addEventListener('click', function (e) {
      var marker = e.target.closest('.immersive-designers__marker');
      if (!marker) return;

      // Allow the original click handler to fire first, then smooth the thumb
      requestAnimationFrame(function () {
        applyThumbPosition(1);
      });
    });
  }

  // ── Skeleton Loading States ─────────────────────────────────────────────

  function showSkeletonLoading(container) {
    if (!container) return;

    var grid = container.querySelector('.immersive-designer-grid') ||
               container.querySelector('.immersive-designers__products');
    if (!grid) return;

    // Show 4 skeleton cards
    var skeletonHTML = '';
    for (var i = 0; i < 4; i++) {
      skeletonHTML += '<div class="immersive-skeleton immersive-skeleton--card">' +
        '<div class="immersive-skeleton immersive-skeleton--image"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text immersive-skeleton--text-short"></div>' +
        '<div class="immersive-skeleton immersive-skeleton--text immersive-skeleton--text-short" style="width:40%"></div>' +
        '</div>';
    }

    var skeletonContainer = document.createElement('div');
    skeletonContainer.className = 'immersive-skeleton-grid';
    skeletonContainer.setAttribute('aria-hidden', 'true');
    skeletonContainer.innerHTML = skeletonHTML;
    grid.parentNode.insertBefore(skeletonContainer, grid);
    grid.style.display = 'none';
  }

  function hideSkeletonLoading(container) {
    if (!container) return;

    var skeleton = container.querySelector('.immersive-skeleton-grid');
    if (skeleton) {
      skeleton.remove();
    }

    var grid = container.querySelector('.immersive-designer-grid') ||
               container.querySelector('.immersive-designers__products');
    if (grid) {
      grid.style.display = '';
    }
  }

  // ── Scroll Cue Injection ────────────────────────────────────────────────

  function injectScrollCue() {
    var heroWrap = document.querySelector('.immersive-designers__hero-transition-wrap');
    if (!heroWrap) return;
    if (heroWrap.querySelector('.immersive-designers__scroll-cue')) return;

    var cue = document.createElement('div');
    cue.className = 'immersive-designers__scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = '<span class="immersive-designers__scroll-cue-text">Explore Collection</span>' +
                    '<div class="immersive-designers__scroll-cue-line"></div>';
    heroWrap.appendChild(cue);
  }

  // ── Card Entrance Animation ─────────────────────────────────────────────

  function animateCardEntrance(container) {
    if (!container) return;

    var cards = container.querySelectorAll('.immersive-product-card');
    cards.forEach(function (card, i) {
      card.classList.add('luxury-entering');
      card.style.animationDelay = (i * 80) + 'ms';
      // Clean up after animation completes
      card.addEventListener('animationend', function handler() {
        card.classList.remove('luxury-entering');
        card.style.animationDelay = '';
        card.removeEventListener('animationend', handler);
      });
    });
  }

  // ── Mutation Observer for Dynamic Product Loading ───────────────────────

  var productObserver = null;

  function watchForProducts() {
    var productsContainer = document.querySelector('.immersive-designers__products');
    if (!productsContainer) return;

    productObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
          // Products were injected — animate them in
          setTimeout(function () {
            hideSkeletonLoading(productsContainer);
            animateCardEntrance(productsContainer);
            observeCards(productsContainer);
          }, 50);
        }
      });
    });

    productObserver.observe(productsContainer, { childList: true, subtree: true });
  }

  // ── Init ────────────────────────────────────────────────────────────────

  function init() {
    // Only run in editorial overlay context
    var overlay = document.getElementById('immersive-editorial-overlay');
    var overlayContent = document.getElementById('immersive-editorial-overlay-content');
    if (!overlay && !overlayContent) return;

    var designersSection = document.querySelector('.immersive-designers');
    if (!designersSection) return;

    // Inject scroll cue
    injectScrollCue();

    // Init smooth thumb
    initSmoothThumb();

    // Watch for product loading
    watchForProducts();

    // If products are already loaded, animate them
    var existingCards = designersSection.querySelectorAll('.immersive-product-card');
    if (existingCards.length > 0) {
      setTimeout(function () {
        animateCardEntrance(designersSection);
        observeCards(designersSection);
      }, 100);
    } else {
      // Show skeleton while waiting
      showSkeletonLoading(designersSection);
    }
  }

  // Run on DOM ready and on section load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init when editorial overlay opens (products may load async)
  document.addEventListener('immersive:editorial-opened', function () {
    setTimeout(init, 300);
  });

  // Shopify section load
  document.addEventListener('shopify:section:load', function () {
    setTimeout(init, 100);
  });

})();
