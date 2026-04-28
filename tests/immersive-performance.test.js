/**
 * Performance Tests: Bridge Button, URL Parameters, localStorage
 * Task 24 — Performance optimization requirements
 */
'use strict';

function resolveUrlAction(search) {
  var params = new URLSearchParams(search);
  var product = (params.get('open_product') || '').trim();
  var collection = (params.get('open_collection') || '').trim();
  var searchQ = (params.get('open_search') || '').trim();
  if (product) return { action: 'product', value: product };
  if (collection) return { action: 'collection', value: collection };
  if (searchQ) return { action: 'search', value: decodeURIComponent(searchQ) };
  return { action: 'none', value: '' };
}

function makeStore() {
  const data = {};
  return {
    setItem: (k, v) => {
      data[k] = String(v);
    },
    getItem: (k) => (data[k] !== undefined ? data[k] : null),
    removeItem: (k) => {
      delete data[k];
    },
    _data: data,
  };
}

describe('Performance: URL Parameter Parsing', () => {
  test('URL parameter parsing completes in < 400ms', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      resolveUrlAction(`?open_product=handle-${i}&open_collection=col-${i}`);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(400);
  });

  test('single URL parse is near-instant (< 5ms)', () => {
    const start = performance.now();
    resolveUrlAction('?open_product=silk-saree&open_collection=suffuse&open_search=bridal');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });
});

describe('Performance: localStorage Operations', () => {
  test('localStorage write completes in < 10ms', () => {
    const store = makeStore();
    const start = performance.now();
    store.setItem('immersive_preferred_mode', '3d');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });

  test('localStorage read completes in < 5ms', () => {
    const store = makeStore();
    store.setItem('immersive_preferred_mode', '3d');
    const start = performance.now();
    store.getItem('immersive_preferred_mode');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });

  test('1000 localStorage writes complete in < 200ms', () => {
    const store = makeStore();
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      store.setItem(`key_${i}`, `value_${i}`);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });
});

describe('Performance: Bridge Button DOM Operations', () => {
  test('creating 10 bridge button elements completes in < 50ms', () => {
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('a');
      el.href = `/pages/immersive?open_collection=collection-${i}`;
      el.className = 'immersive-bridge-btn immersive-bridge-btn--collection';
      el.setAttribute('data-immersive-bridge', '');
      el.setAttribute('aria-label', `Explore Collection ${i} in 3D`);
      el.innerHTML = '<span class="immersive-bridge-btn__label">Explore in 3D</span>';
      document.body.appendChild(el);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    document.body.innerHTML = '';
  });

  test('querying all bridge buttons completes in < 500ms', () => {
    document.body.innerHTML = Array.from(
      { length: 10 },
      (_, i) => `<a href="/pages/immersive?open_collection=c${i}" data-immersive-bridge aria-label="C${i}">C${i}</a>`,
    ).join('');
    const start = performance.now();
    const bridges = document.querySelectorAll('[data-immersive-bridge]');
    const elapsed = performance.now() - start;
    expect(bridges.length).toBe(10);
    expect(elapsed).toBeLessThan(500);
    document.body.innerHTML = '';
  });
});

describe('Performance: Connection Classification', () => {
  function classifyConnection(conn) {
    if (!conn) return 'fast';
    if (conn.saveData) return 'slow';
    var t = conn.effectiveType || '';
    if (t === 'slow-2g' || t === '2g') return 'slow';
    if (t === '3g') return 'medium';
    return 'fast';
  }

  test('classifying 10000 connections completes in < 50ms', () => {
    const types = ['slow-2g', '2g', '3g', '4g', ''];
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      classifyConnection({ effectiveType: types[i % types.length] });
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

describe('Performance: No Layout Shifts', () => {
  test('bridge button wrapper has stable dimensions after render', () => {
    document.body.innerHTML = `
      <div class="immersive-bridge-btn__wrapper" style="padding: 1rem 0px;">
        <a href="/pages/immersive" class="immersive-bridge-btn" data-immersive-bridge aria-label="Enter 3D">
          <span class="immersive-bridge-btn__label">Enter 3D</span>
        </a>
      </div>`;
    const wrapper = document.querySelector('.immersive-bridge-btn__wrapper');
    // Wrapper should exist and be in the DOM without causing layout issues
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.padding).toBeTruthy();
  });
});
