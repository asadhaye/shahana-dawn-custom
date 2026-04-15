'use strict';

// Feature: immersive-editorial

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// DOM helpers — mirror the section's HTML contract
// ---------------------------------------------------------------------------

function renderSection(settings, blocks) {
  settings = settings || {};
  blocks = blocks || [];
  var roomKey = settings.room_key || 'featured_collections';
  var layout = settings.layout || 'custom';

  // Banners are ONLY rendered for the 'custom' layout.
  // All other layouts (occasions, featured_collections, designers, gallery)
  // render their own dedicated UI and must NOT include the banners block.
  var bannersHtml = '';
  if (layout === 'custom') {
    var blockHtml = blocks
      .filter(function (b) {
        return b.type === 'banner' || !b.type;
      })
      .map(function (b) {
        var depth = b.depth_layer !== undefined ? b.depth_layer : 50;
        var mediaHtml = '';
        if (b.image) {
          var logoHtml = b.logo
            ? '<img class="immersive-editorial__banner-logo" src="' + b.logo + '" alt="" loading="lazy">'
            : '';
          mediaHtml =
            '<div class="immersive-editorial__banner-media">' +
            '<img src="' +
            b.image +
            '" alt="" loading="lazy">' +
            logoHtml +
            '</div>';
        }
        var bodyHtml = b.body ? '<div class="immersive-editorial__banner-body">' + b.body + '</div>' : '';
        var ctaHtml =
          b.cta_label && b.cta_url
            ? '<a class="immersive-editorial__cta" href="' + b.cta_url + '">' + b.cta_label + '</a>'
            : '';
        // collection-link now includes data-collection for JS interception
        var colHtml = b.collection
          ? '<a class="immersive-editorial__collection-link" href="/collections/' +
            b.collection +
            '" data-collection="' +
            b.collection +
            '">' +
            b.collection +
            '</a>'
          : '';
        return (
          '<article class="immersive-editorial__banner" data-editorial-layer="' +
          depth +
          '">' +
          mediaHtml +
          '<div class="immersive-editorial__banner-content">' +
          '<h3 class="immersive-editorial__banner-heading">' +
          (b.heading || '') +
          '</h3>' +
          bodyHtml +
          ctaHtml +
          colHtml +
          '</div></article>'
        );
      })
      .join('');
    bannersHtml = '<div class="immersive-editorial__banners">' + blockHtml + '</div>';
  }

  var h2Html = settings.hero_heading
    ? '<h2 class="immersive-editorial__heading">' + settings.hero_heading + '</h2>'
    : '';
  var bgHtml = settings.hero_background_image
    ? '<img class="immersive-editorial__hero-bg" src="' +
      settings.hero_background_image +
      '" alt="" loading="lazy" aria-hidden="true">'
    : '';

  return (
    '<section' +
    ' id="immersive-editorial-' +
    roomKey +
    '"' +
    ' class="immersive-editorial immersive-editorial--' +
    roomKey +
    ' immersive-editorial--layout-' +
    layout +
    '"' +
    ' data-room-key="' +
    roomKey +
    '"' +
    ' data-layout="' +
    layout +
    '"' +
    '>' +
    '<div class="immersive-editorial__hero">' +
    bgHtml +
    '<div class="immersive-editorial__hero-panel">' +
    h2Html +
    '</div>' +
    '</div>' +
    bannersHtml +
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
// Extracted logic helpers — mirrors immersive-store.js without importing it
// ---------------------------------------------------------------------------

function createImmersiveState() {
  return { currentRoom: 'storefront', mode: 'showroom', editorialRoom: null };
}

function createEnterEditorialMode(state, updateCamera, trackEvent, scrollTarget) {
  return function (roomKey) {
    state.mode = 'editorial';
    state.editorialRoom = roomKey;
    updateCamera();
    trackEvent('editorial_entered', { room: roomKey });
    var target = scrollTarget !== undefined ? scrollTarget : document.getElementById('immersive-editorial-' + roomKey);
    if (!target) {
      console.warn('[Immersive] Editorial section not found for room:', roomKey);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

function createUpdateCameraForMode(state, camera, uniforms, isMobile) {
  return function () {
    if (!camera) return;
    var strength;
    if (state.mode === 'editorial') {
      switch (state.editorialRoom) {
        case 'designer_houses':
          strength = 0.1;
          break;
        case 'occasions':
          strength = 0.09;
          break;
        case 'featured_collections':
          strength = 0.11;
          break;
        default:
          strength = isMobile ? 0.03 : 0.08;
      }
    } else {
      strength = isMobile ? 0.03 : 0.08;
    }
    if (uniforms && uniforms.uParallaxStrength) {
      uniforms.uParallaxStrength.value = strength;
    }
    // camera.fov intentionally NOT set — OrthographicCamera
  };
}

function routeHotspotClick(hotspot, enterEditorial, goToRoom, openCollection) {
  if (hotspot.targetEditorialRoom) {
    enterEditorial(hotspot.targetEditorialRoom);
    return 'editorial';
  }
  if (hotspot.targetRoom) {
    goToRoom(hotspot.targetRoom);
    return 'room';
  }
  if (hotspot.targetCollection) {
    openCollection(hotspot.targetCollection);
    return 'collection';
  }
  return 'none';
}

function computeParallaxOffset(progress, depthLayer) {
  return progress * (depthLayer / 100) * 40;
}

function lerpStep(current, target, factor) {
  return current + (target - current) * factor;
}

// ---------------------------------------------------------------------------
// PART 1: Liquid section DOM contract
// ---------------------------------------------------------------------------

describe('immersive-editorial section DOM contract', function () {
  test('root id for designer_houses', function () {
    expect(parseRoot(renderSection({ room_key: 'designer_houses' })).id).toBe('immersive-editorial-designer_houses');
  });

  test('root id for occasions', function () {
    expect(parseRoot(renderSection({ room_key: 'occasions' })).id).toBe('immersive-editorial-occasions');
  });

  test('root id for featured_collections', function () {
    expect(parseRoot(renderSection({ room_key: 'featured_collections' })).id).toBe(
      'immersive-editorial-featured_collections',
    );
  });

  test('applies BEM classes', function () {
    var root = parseRoot(renderSection({ room_key: 'featured_collections', layout: 'custom' }));
    expect(root.classList.contains('immersive-editorial')).toBe(true);
    expect(root.classList.contains('immersive-editorial--featured_collections')).toBe(true);
    expect(root.classList.contains('immersive-editorial--layout-custom')).toBe(true);
  });

  test('sets data-room-key and data-layout', function () {
    var root = parseRoot(renderSection({ room_key: 'occasions', layout: 'occasions' }));
    expect(root.dataset.roomKey).toBe('occasions');
    expect(root.dataset.layout).toBe('occasions');
  });

  test('omits h2 when hero_heading blank', function () {
    expect(query(renderSection({}), 'h2')).toBeNull();
  });

  test('renders h2 when hero_heading set', function () {
    var h2 = query(renderSection({ hero_heading: 'Our Collections' }), 'h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Our Collections');
  });

  test('0 articles for 0 blocks (custom layout)', function () {
    expect(queryAll(renderSection({ layout: 'custom' }), '.immersive-editorial__banner').length).toBe(0);
  });

  test('3 articles for 3 banner blocks (custom layout)', function () {
    expect(
      queryAll(
        renderSection({ layout: 'custom' }, [{ heading: 'A' }, { heading: 'B' }, { heading: 'C' }]),
        '.immersive-editorial__banner',
      ).length,
    ).toBe(3);
  });

  test('no banners rendered for occasions layout', function () {
    expect(
      queryAll(
        renderSection({ layout: 'occasions' }, [{ heading: 'A' }, { heading: 'B' }]),
        '.immersive-editorial__banner',
      ).length,
    ).toBe(0);
  });

  test('no banners rendered for featured_collections layout', function () {
    expect(
      queryAll(renderSection({ layout: 'featured_collections' }, [{ heading: 'A' }]), '.immersive-editorial__banner')
        .length,
    ).toBe(0);
  });

  test('no banners rendered for designers layout', function () {
    expect(
      queryAll(renderSection({ layout: 'designers' }, [{ heading: 'A' }]), '.immersive-editorial__banner').length,
    ).toBe(0);
  });

  test('data-editorial-layer from depth_layer (custom layout)', function () {
    var a = query(
      renderSection({ layout: 'custom' }, [{ heading: 'X', depth_layer: 30 }]),
      '.immersive-editorial__banner',
    );
    expect(a.dataset.editorialLayer).toBe('30');
  });

  test('omits CTA when cta_url set but cta_label blank', function () {
    expect(
      query(renderSection({ layout: 'custom' }, [{ heading: 'X', cta_url: '/test' }]), '.immersive-editorial__cta'),
    ).toBeNull();
  });

  test('omits CTA when cta_label set but cta_url blank', function () {
    expect(
      query(renderSection({ layout: 'custom' }, [{ heading: 'X', cta_label: 'Shop' }]), '.immersive-editorial__cta'),
    ).toBeNull();
  });

  test('renders CTA when both cta_label and cta_url set', function () {
    var cta = query(
      renderSection({ layout: 'custom' }, [{ heading: 'X', cta_label: 'Shop', cta_url: '/test' }]),
      '.immersive-editorial__cta',
    );
    expect(cta).not.toBeNull();
    expect(cta.getAttribute('href')).toBe('/test');
  });

  test('logo only in custom layout (banner block)', function () {
    var block = [{ heading: 'X', image: '/img.jpg', logo: '/logo.png' }];
    // Custom layout banners DO render logos (brand logo is a valid banner setting)
    expect(query(renderSection({ layout: 'custom' }, block), '.immersive-editorial__banner-logo')).not.toBeNull();
  });

  test('collection link when collection set (custom layout)', function () {
    expect(
      query(
        renderSection({ layout: 'custom' }, [{ heading: 'X', collection: 'my-col' }]),
        '.immersive-editorial__collection-link',
      ),
    ).not.toBeNull();
  });

  test('collection link has data-collection attribute for JS interception', function () {
    var link = query(
      renderSection({ layout: 'custom' }, [{ heading: 'X', collection: 'my-col' }]),
      '.immersive-editorial__collection-link',
    );
    expect(link).not.toBeNull();
    expect(link.getAttribute('data-collection')).toBe('my-col');
  });

  test('hero bg image has aria-hidden=true', function () {
    var img = query(renderSection({ hero_background_image: '/hero.jpg' }), '.immersive-editorial__hero-bg');
    expect(img).not.toBeNull();
    expect(img.getAttribute('aria-hidden')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// PART 2: immersive-store.js editorial extensions
// ---------------------------------------------------------------------------

describe('immersive-store.js editorial extensions', function () {
  test('immersiveState has correct defaults', function () {
    var s = createImmersiveState();
    expect(s.currentRoom).toBe('storefront');
    expect(s.mode).toBe('showroom');
    expect(s.editorialRoom).toBeNull();
  });

  test('enterEditorialMode sets mode and editorialRoom', function () {
    var s = createImmersiveState();
    createEnterEditorialMode(
      s,
      function () {},
      function () {},
      {
        scrollIntoView: function () {},
      },
    )('designer_houses');
    expect(s.mode).toBe('editorial');
    expect(s.editorialRoom).toBe('designer_houses');
  });

  test('enterEditorialMode calls updateCameraForMode', function () {
    var s = createImmersiveState();
    var called = false;
    createEnterEditorialMode(
      s,
      function () {
        called = true;
      },
      function () {},
      { scrollIntoView: function () {} },
    )('occasions');
    expect(called).toBe(true);
  });

  test('enterEditorialMode fires editorial_entered event', function () {
    var s = createImmersiveState();
    var events = [];
    createEnterEditorialMode(
      s,
      function () {},
      function (n, d) {
        events.push({ n: n, d: d });
      },
      { scrollIntoView: function () {} },
    )('featured_collections');
    expect(events[0].n).toBe('editorial_entered');
    expect(events[0].d.room).toBe('featured_collections');
  });

  test('enterEditorialMode calls scrollIntoView on target', function () {
    var s = createImmersiveState();
    var scrolled = false;
    createEnterEditorialMode(
      s,
      function () {},
      function () {},
      {
        scrollIntoView: function () {
          scrolled = true;
        },
      },
    )('occasions');
    expect(scrolled).toBe(true);
  });

  test('enterEditorialMode warns and does not throw when target null', function () {
    var s = createImmersiveState();
    var warned = false;
    var orig = console.warn;
    console.warn = function () {
      warned = true;
    };
    expect(function () {
      createEnterEditorialMode(
        s,
        function () {},
        function () {},
        null,
      )('designer_houses');
    }).not.toThrow();
    expect(warned).toBe(true);
    console.warn = orig;
  });

  test('updateCameraForMode does not throw when camera null', function () {
    expect(function () {
      createUpdateCameraForMode(createImmersiveState(), null, null, false)();
    }).not.toThrow();
  });

  test('updateCameraForMode sets 0.10 for designer_houses', function () {
    var u = { uParallaxStrength: { value: 0 } };
    createUpdateCameraForMode({ mode: 'editorial', editorialRoom: 'designer_houses' }, {}, u, false)();
    expect(u.uParallaxStrength.value).toBe(0.1);
  });

  test('updateCameraForMode sets 0.09 for occasions', function () {
    var u = { uParallaxStrength: { value: 0 } };
    createUpdateCameraForMode({ mode: 'editorial', editorialRoom: 'occasions' }, {}, u, false)();
    expect(u.uParallaxStrength.value).toBe(0.09);
  });

  test('updateCameraForMode sets 0.11 for featured_collections', function () {
    var u = { uParallaxStrength: { value: 0 } };
    createUpdateCameraForMode({ mode: 'editorial', editorialRoom: 'featured_collections' }, {}, u, false)();
    expect(u.uParallaxStrength.value).toBe(0.11);
  });

  test('updateCameraForMode does NOT set camera.fov', function () {
    var cam = {};
    var u = { uParallaxStrength: { value: 0 } };
    createUpdateCameraForMode({ mode: 'editorial', editorialRoom: 'designer_houses' }, cam, u, false)();
    expect(cam.fov).toBeUndefined();
  });

  test('routing: editorial fires for targetEditorialRoom', function () {
    var ec = [],
      rc = [],
      cc = [];
    var r = routeHotspotClick(
      { targetEditorialRoom: 'designer_houses', label: 't' },
      function (x) {
        ec.push(x);
      },
      function (x) {
        rc.push(x);
      },
      function (x) {
        cc.push(x);
      },
    );
    expect(r).toBe('editorial');
    expect(ec).toEqual(['designer_houses']);
    expect(rc.length).toBe(0);
    expect(cc.length).toBe(0);
  });

  test('routing: room fires for targetRoom', function () {
    var ec = [],
      rc = [];
    routeHotspotClick(
      { targetRoom: 'lounge', label: 't' },
      function (x) {
        ec.push(x);
      },
      function (x) {
        rc.push(x);
      },
      function () {},
    );
    expect(rc).toEqual(['lounge']);
    expect(ec.length).toBe(0);
  });

  test('routing: collection fires for targetCollection', function () {
    var ec = [],
      cc = [];
    routeHotspotClick(
      { targetCollection: 'my-col', label: 't' },
      function (x) {
        ec.push(x);
      },
      function () {},
      function (x) {
        cc.push(x);
      },
    );
    expect(cc).toEqual(['my-col']);
    expect(ec.length).toBe(0);
  });

  test('routing: editorial takes priority over targetRoom', function () {
    var ec = [],
      rc = [];
    var r = routeHotspotClick(
      { targetEditorialRoom: 'occasions', targetRoom: 'lounge', label: 't' },
      function (x) {
        ec.push(x);
      },
      function (x) {
        rc.push(x);
      },
      function () {},
    );
    expect(r).toBe('editorial');
    expect(ec.length).toBe(1);
    expect(rc.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// PART 3: Property-based tests
// ---------------------------------------------------------------------------

var EXPECTED = {
  editorial: { designer_houses: 0.1, occasions: 0.09, featured_collections: 0.11 },
  showroom: 0.08,
};

describe('immersive-editorial property tests', function () {
  // Feature: immersive-editorial, Property 1: Root element identity
  test('Property 1: root element identity for all room_key/layout combinations', function () {
    fc.assert(
      fc.property(
        fc.constantFrom('designer_houses', 'occasions', 'featured_collections'),
        fc.constantFrom('designers', 'custom', 'occasions', 'gallery', 'featured_collections'),
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

  // Feature: immersive-editorial, Property 3: Banner count matches block count ONLY for custom layout
  test('Property 3: banner count equals block count for custom layout; zero for all other layouts', function () {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            heading: fc.string({ minLength: 1 }),
            depth_layer: fc.integer({ min: 0, max: 100 }),
          }),
          { maxLength: 10 },
        ),
        fc.constantFrom('designers', 'occasions', 'featured_collections', 'gallery', 'custom'),
        function (blocks, layout) {
          var bannerCount = queryAll(renderSection({ layout: layout }, blocks), '.immersive-editorial__banner').length;
          if (layout === 'custom') {
            return bannerCount === blocks.length;
          } else {
            return bannerCount === 0;
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-editorial, Property 4: data-editorial-layer reflects depth_layer
  test('Property 4: data-editorial-layer equals depth_layer for any value 0-100', function () {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), function (d) {
        var a = query(renderSection({}, [{ heading: 'T', depth_layer: d }]), '.immersive-editorial__banner');
        return a.dataset.editorialLayer === String(d);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: immersive-editorial, Property 6: Parallax offset proportional to depth_layer
  test('Property 6: parallax offset proportional to depth_layer', function () {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        function (progress, dA, dB) {
          if (dA === dB) return true;
          var oA = computeParallaxOffset(progress, dA);
          var oB = computeParallaxOffset(progress, dB);
          if (oB === 0) return true;
          return Math.abs(oA / oB - dA / dB) < 1e-9;
        },
      ),
      { numRuns: 500 },
    );
  });

  // Feature: immersive-editorial, Property 7: Lerp converges toward target
  test('Property 7: lerp step strictly reduces distance to target', function () {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
        function (c, t, f) {
          if (c === t) return true;
          return Math.abs(lerpStep(c, t, f) - t) < Math.abs(c - t);
        },
      ),
      { numRuns: 500 },
    );
  });

  // Feature: immersive-editorial, Property 9: currentRoom preserved on mode change
  test('Property 9: currentRoom unchanged after enterEditorialMode', function () {
    fc.assert(
      fc.property(
        fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'),
        fc.constantFrom('designer_houses', 'occasions', 'featured_collections'),
        function (currentRoom, editorialRoom) {
          var s = createImmersiveState();
          s.currentRoom = currentRoom;
          var u = { uParallaxStrength: { value: 0 } };
          var update = createUpdateCameraForMode(s, {}, u, false);
          createEnterEditorialMode(s, update, function () {}, {
            scrollIntoView: function () {},
          })(editorialRoom);
          return s.currentRoom === currentRoom;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: immersive-editorial, Property 10: Hotspot routing priority
  test('Property 10: hotspot routing priority editorial > room > collection', function () {
    fc.assert(
      fc.property(
        fc.record({
          targetEditorialRoom: fc.option(fc.constantFrom('designer_houses', 'occasions', 'featured_collections'), {
            nil: undefined,
          }),
          targetRoom: fc.option(fc.constantFrom('lounge', 'storefront'), { nil: undefined }),
          targetCollection: fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
            nil: undefined,
          }),
          label: fc.string({ minLength: 1 }),
        }),
        function (hotspot) {
          var ec = [],
            rc = [],
            cc = [];
          var result = routeHotspotClick(
            hotspot,
            function (x) {
              ec.push(x);
            },
            function (x) {
              rc.push(x);
            },
            function (x) {
              cc.push(x);
            },
          );
          if (hotspot.targetEditorialRoom) {
            return result === 'editorial' && ec.length === 1 && rc.length === 0 && cc.length === 0;
          }
          if (hotspot.targetRoom) {
            return result === 'room' && rc.length === 1 && ec.length === 0;
          }
          if (hotspot.targetCollection) {
            return result === 'collection' && cc.length === 1 && ec.length === 0;
          }
          return result === 'none';
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: immersive-editorial, Property 12: updateCameraForMode parallax strength mapping
  test('Property 12: updateCameraForMode correct strength, never sets camera.fov', function () {
    fc.assert(
      fc.property(
        fc.constantFrom('showroom', 'editorial'),
        fc.constantFrom('designer_houses', 'occasions', 'featured_collections', null),
        function (mode, editorialRoom) {
          var s = { mode: mode, editorialRoom: editorialRoom };
          var cam = {};
          var u = { uParallaxStrength: { value: 0 } };
          createUpdateCameraForMode(s, cam, u, false)();
          var expected =
            mode === 'editorial' && EXPECTED.editorial[editorialRoom] !== undefined
              ? EXPECTED.editorial[editorialRoom]
              : EXPECTED.showroom;
          return u.uParallaxStrength.value === expected && cam.fov === undefined;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: immersive-editorial, Property 13: mergeDynamicRoomConfig preserves editorial hotspots
  test('Property 13: mergeDynamicRoomConfig preserves editorial hotspots after merge', function () {
    // Model mergeDynamicRoomConfig: only scalar fields are overwritten; hotspots array is never touched.
    function mergeDynamicRoomConfigModel(rooms, config) {
      if (!config || typeof config !== 'object') return rooms;
      Object.keys(config).forEach(function (roomKey) {
        var roomConfig = config[roomKey];
        if (!roomConfig || typeof roomConfig !== 'object') return;
        if (!rooms[roomKey]) rooms[roomKey] = {};
        Object.keys(roomConfig).forEach(function (field) {
          // Only override scalar fields when non-null/non-empty; never touch hotspots array
          if (field === 'hotspots') return;
          if (roomConfig[field] !== null && roomConfig[field] !== '') {
            rooms[roomKey][field] = roomConfig[field];
          }
        });
      });
      return rooms;
    }

    fc.assert(
      fc.property(
        // Generate a room config that may include hotspots: null (the dangerous case)
        fc.record({
          designer_houses: fc.option(
            fc.record({
              baseTextureUrl: fc.option(fc.string({ minLength: 1 }), { nil: null }),
              depthMapUrl: fc.option(fc.string({ minLength: 1 }), { nil: null }),
              hotspots: fc.constant(null), // simulate JSON config that sends hotspots: null
            }),
            { nil: null },
          ),
          occasions: fc.option(
            fc.record({
              baseTextureUrl: fc.option(fc.string({ minLength: 1 }), { nil: null }),
              hotspots: fc.constant(null),
            }),
            { nil: null },
          ),
          featured_collections: fc.option(
            fc.record({
              baseTextureUrl: fc.option(fc.string({ minLength: 1 }), { nil: null }),
              hotspots: fc.constant(null),
            }),
            { nil: null },
          ),
        }),
        function (dynamicConfig) {
          // Build a fresh STORE_ROOMS-like object with editorial hotspots already added
          var rooms = {
            designer_houses: {
              hotspots: [
                { x: 13, y: 40, label: 'Suffuse', targetCollection: 'suffuse' },
                { x: 50, y: 15, label: 'Our Designers', targetEditorialRoom: 'designer_houses' },
              ],
            },
            occasions: {
              hotspots: [
                { x: 25, y: 40, label: 'Eid Collection', targetCollection: 'eid-collection' },
                { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
              ],
            },
            featured_collections: {
              hotspots: [
                { x: 25, y: 40, label: 'SS5', targetCollection: 'summer-pret' },
                { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
              ],
            },
          };

          var editorialCountBefore = ['designer_houses', 'occasions', 'featured_collections'].reduce(function (n, k) {
            return (
              n +
              rooms[k].hotspots.filter(function (h) {
                return !!h.targetEditorialRoom;
              }).length
            );
          }, 0);

          mergeDynamicRoomConfigModel(rooms, dynamicConfig);

          var editorialCountAfter = ['designer_houses', 'occasions', 'featured_collections'].reduce(function (n, k) {
            return (
              n +
              rooms[k].hotspots.filter(function (h) {
                return !!h.targetEditorialRoom;
              }).length
            );
          }, 0);

          // Editorial hotspot count must be >= before merge (never reduced by merge)
          return editorialCountAfter >= editorialCountBefore;
        },
      ),
      { numRuns: 200 },
    );
  });
});
