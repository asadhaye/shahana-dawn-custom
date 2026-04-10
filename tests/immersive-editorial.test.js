'use strict';

// Feature: immersive-editorial

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// DOM helpers — mirror the section's HTML contract (Restructured)
// ---------------------------------------------------------------------------

function renderSection(settings, blocks) {
  settings = settings || {};
  blocks = blocks || [];
  var roomKey = settings.room_key || 'featured_collections';
  var layout = settings.layout || 'collections';

  var heroHtml = '';
  if (layout === 'designers') {
    var heroStates = blocks.map(function(b, i) {
      return (
        '<div class="immersive-designers__hero-state' + (i === 0 ? ' is-active' : '') + '" data-hero-index="' + i + '">' +
          (b.image ? '<img class="immersive-designers__hero-bg" src="' + b.image + '" alt="">' : '') +
          '<div class="immersive-designers__hero-content">' +
            (b.logo ? '<img class="immersive-designers__hero-logo" src="' + b.logo + '" alt="">' : '') +
            (b.body ? '<div class="immersive-designers__manifest">' + b.body + '</div>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');
    heroHtml = '<div class="immersive-editorial__hero immersive-editorial__hero--designers"><div class="immersive-designers__hero-transition-wrap">' + heroStates + '</div></div>';
  } else {
    var h2Html = settings.hero_heading ? '<h2 class="immersive-editorial__heading">' + settings.hero_heading + '</h2>' : '';
    var bgHtml = settings.hero_background_image ? '<img class="immersive-editorial__hero-bg" src="' + settings.hero_background_image + '" alt="" aria-hidden="true">' : '';
    heroHtml = '<div class="immersive-editorial__hero">' + bgHtml + '<div class="immersive-editorial__hero-panel">' + h2Html + '</div></div>';
  }

  var contentHtml = '';
  if (layout === 'designers') {
    var markers = blocks.map(function(b, i) {
      return '<button class="immersive-designers__marker" data-index="' + i + '">' + (b.heading || '') + '</button>';
    }).join('');
    contentHtml = (
      '<div class="immersive-designers" data-room-key="' + roomKey + '">' +
        '<div class="immersive-designers__timeline">' +
          '<div class="immersive-designers__rail">' + markers + '</div>' +
          '<div class="immersive-designers__thumb"></div>' +
        '</div>' +
        '<div class="immersive-designers__products"></div>' +
      '</div>'
    );
  } else if (layout === 'occasions') {
    var cards = blocks.map(function(b, i) {
      return (
        '<a class="immersive-occasions__card">' +
          '<div class="immersive-occasions__card-media"><img src="' + (b.image || '') + '"></div>' +
          '<div class="immersive-occasions__card-content"><h3 class="immersive-occasions__card-heading">' + (b.heading || '') + '</h3></div>' +
        '</a>'
      );
    }).join('');
    contentHtml = '<div class="immersive-occasions"><div class="immersive-occasions__list">' + cards + '</div></div>';
  } else if (layout === 'featured_collections') {
    var items = blocks.map(function(b, i) {
      return (
        '<a class="immersive-featured__item">' +
          '<div class="immersive-featured__item-media"><img src="' + (b.image || '') + '"></div>' +
          '<div class="immersive-featured__item-info"><h3 class="immersive-featured__item-heading">' + (b.heading || '') + '</h3></div>' +
        '</a>'
      );
    }).join('');
    contentHtml = '<div class="immersive-featured"><div class="immersive-featured__grid">' + items + '</div></div>';
  }

  return (
    '<section id="immersive-editorial-' + roomKey + '" class="immersive-editorial immersive-editorial--' + roomKey + ' immersive-editorial--layout-' + layout + '" data-room-key="' + roomKey + '" data-layout="' + layout + '">' +
      heroHtml +
      contentHtml +
    '</section>'
  );
}

function parseRoot(html) {
  var d = document.createElement('div');
  d.innerHTML = html;
  return d.querySelector('section');
}

function query(html, sel) {
  var d = document.createElement('div');
  d.innerHTML = html;
  return d.querySelector(sel);
}

function queryAll(html, sel) {
  var d = document.createElement('div');
  d.innerHTML = html;
  return Array.from(d.querySelectorAll(sel));
}

// ---------------------------------------------------------------------------
// PART 1: Liquid section DOM contract
// ---------------------------------------------------------------------------

describe('immersive-editorial section DOM contract', function () {
  test('root id for designer_houses', function () {
    expect(parseRoot(renderSection({ room_key: 'designer_houses' })).id).toBe('immersive-editorial-designer_houses');
  });

  test('applies BEM classes', function () {
    var root = parseRoot(renderSection({ room_key: 'featured_collections', layout: 'featured_collections' }));
    expect(root.classList.contains('immersive-editorial')).toBe(true);
    expect(root.classList.contains('immersive-editorial--featured_collections')).toBe(true);
    expect(root.classList.contains('immersive-editorial--layout-featured_collections')).toBe(true);
  });

  test('sets data-room-key and data-layout', function () {
    var root = parseRoot(renderSection({ room_key: 'occasions', layout: 'occasions' }));
    expect(root.dataset.roomKey).toBe('occasions');
    expect(root.dataset.layout).toBe('occasions');
  });

  test('renders h2 when hero_heading set (non-designers)', function () {
    var h2 = query(renderSection({ hero_heading: 'Our Collections', layout: 'occasions' }), 'h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Our Collections');
  });

  test('renders multiple hero states in designers layout', function () {
    var html = renderSection({ layout: 'designers' }, [{ heading: 'A' }, { heading: 'B' }]);
    expect(queryAll(html, '.immersive-designers__hero-state').length).toBe(2);
  });

  test('hero bg image has aria-hidden=true in standard layout', function () {
    var img = query(renderSection({ hero_background_image: '/hero.jpg', layout: 'occasions' }), '.immersive-editorial__hero-bg');
    expect(img).not.toBeNull();
    expect(img.getAttribute('aria-hidden')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// PART 2: Property-based tests
// ---------------------------------------------------------------------------

describe('immersive-editorial property tests', function () {
  test('Property 1: root element identity for all room_key/layout combinations', function () {
    fc.assert(
      fc.property(
        fc.constantFrom('designer_houses', 'occasions', 'featured_collections'),
        fc.constantFrom('designers', 'occasions', 'featured_collections'),
        function (roomKey, layout) {
          var root = parseRoot(renderSection({ room_key: roomKey, layout: layout }));
          return (
            root.id === 'immersive-editorial-' + roomKey &&
            root.classList.contains('immersive-editorial') &&
            root.classList.contains('immersive-editorial--' + roomKey) &&
            root.classList.contains('immersive-editorial--layout-' + layout) &&
            root.dataset.roomKey === roomKey &&
            root.dataset.layout === layout
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  test('Property 3: marker/card count equals block count', function () {
    fc.assert(
      fc.property(
        fc.constantFrom('designers', 'occasions', 'featured_collections'),
        fc.array(
          fc.record({
            heading: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        function (layout, blocks) {
          var html = renderSection({ layout: layout }, blocks);
          var selector = layout === 'designers' ? '.immersive-designers__marker' :
                         layout === 'occasions' ? '.immersive-occasions__card' :
                         '.immersive-featured__item';
          return queryAll(html, selector).length === blocks.length;
        },
      ),
      { numRuns: 100 },
    );
  });
});
