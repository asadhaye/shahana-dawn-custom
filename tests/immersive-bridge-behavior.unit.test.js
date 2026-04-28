/**
 * Unit Tests: Bridge Behavior (device/connection-aware)
 * Task 17 — Requirements 16.1–16.8
 */
'use strict';

function classifyConnection(conn) {
  if (!conn) return 'fast';
  if (conn.saveData) return 'slow';
  var t = conn.effectiveType || '';
  if (t === 'slow-2g' || t === '2g') return 'slow';
  if (t === '3g') return 'medium';
  return 'fast';
}

function is3DLink(href) {
  return (
    href.indexOf('/pages/immersive') !== -1 ||
    href.indexOf('open_product') !== -1 ||
    href.indexOf('open_collection') !== -1 ||
    href.indexOf('open_search') !== -1
  );
}

function wireBridge(bridge, conn, reducedMotion) {
  var href = bridge.getAttribute('href') || '';
  if (!is3DLink(href)) return;
  if (reducedMotion) bridge.classList.add('immersive-bridge-btn--reduced-motion');
  if (conn === 'slow') {
    bridge.classList.add('immersive-bridge-btn--slow-connection');
    var label = bridge.querySelector('.immersive-bridge-btn__label');
    if (label) {
      label.textContent = bridge.getAttribute('data-slow-label') || 'Enter 3D Store';
    }
    if (!bridge._warningAdded) {
      bridge._warningAdded = true;
      var el = document.createElement('p');
      el.className = 'immersive-bridge-btn__connection-note';
      el.textContent = bridge.getAttribute('data-slow-note') || 'Your connection appears slow.';
      if (bridge.parentNode) bridge.parentNode.insertBefore(el, bridge.nextSibling);
    }
  } else if (conn === 'medium') {
    bridge.classList.add('immersive-bridge-btn--medium-connection');
    if (!bridge._warningAdded) {
      bridge._warningAdded = true;
      var el2 = document.createElement('p');
      el2.className = 'immersive-bridge-btn__connection-note';
      el2.textContent = bridge.getAttribute('data-medium-note') || 'The 3D store works best on a faster connection.';
      if (bridge.parentNode) bridge.parentNode.insertBefore(el2, bridge.nextSibling);
    }
  }
}

describe('classifyConnection', () => {
  test('null connection → fast', () => expect(classifyConnection(null)).toBe('fast'));
  test('undefined connection → fast', () => expect(classifyConnection(undefined)).toBe('fast'));
  test('saveData=true → slow', () => expect(classifyConnection({ saveData: true })).toBe('slow'));
  test('slow-2g → slow', () => expect(classifyConnection({ effectiveType: 'slow-2g' })).toBe('slow'));
  test('2g → slow', () => expect(classifyConnection({ effectiveType: '2g' })).toBe('slow'));
  test('3g → medium', () => expect(classifyConnection({ effectiveType: '3g' })).toBe('medium'));
  test('4g → fast', () => expect(classifyConnection({ effectiveType: '4g' })).toBe('fast'));
  test('empty effectiveType → fast', () => expect(classifyConnection({ effectiveType: '' })).toBe('fast'));
});

describe('is3DLink', () => {
  test('/pages/immersive is a 3D link', () => expect(is3DLink('/pages/immersive')).toBe(true));
  test('open_product param is a 3D link', () => expect(is3DLink('/?open_product=test')).toBe(true));
  test('open_collection param is a 3D link', () => expect(is3DLink('/?open_collection=test')).toBe(true));
  test('open_search param is a 3D link', () => expect(is3DLink('/?open_search=test')).toBe(true));
  test('/collections/test is NOT a 3D link', () => expect(is3DLink('/collections/test')).toBe(false));
  test('/products/test is NOT a 3D link', () => expect(is3DLink('/products/test')).toBe(false));
});

describe('wireBridge — slow connection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="wrapper">
        <a id="bridge" href="/pages/immersive?open_collection=test" data-immersive-bridge>
          <span class="immersive-bridge-btn__label">Explore in 3D</span>
        </a>
      </div>`;
  });

  test('adds slow-connection class', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'slow', false);
    expect(bridge.classList.contains('immersive-bridge-btn--slow-connection')).toBe(true);
  });

  test('adds warning note element', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'slow', false);
    expect(document.querySelector('.immersive-bridge-btn__connection-note')).not.toBeNull();
  });

  test('warning note is not added twice', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'slow', false);
    wireBridge(bridge, 'slow', false);
    expect(document.querySelectorAll('.immersive-bridge-btn__connection-note').length).toBe(1);
  });

  test('uses data-slow-note attribute when present', () => {
    const bridge = document.getElementById('bridge');
    bridge.setAttribute('data-slow-note', 'Custom slow message');
    wireBridge(bridge, 'slow', false);
    const note = document.querySelector('.immersive-bridge-btn__connection-note');
    expect(note.textContent).toBe('Custom slow message');
  });
});

describe('wireBridge — medium connection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="wrapper">
        <a id="bridge" href="/pages/immersive" data-immersive-bridge>
          <span class="immersive-bridge-btn__label">Enter 3D</span>
        </a>
      </div>`;
  });

  test('adds medium-connection class', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'medium', false);
    expect(bridge.classList.contains('immersive-bridge-btn--medium-connection')).toBe(true);
  });

  test('adds warning note', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'medium', false);
    expect(document.querySelector('.immersive-bridge-btn__connection-note')).not.toBeNull();
  });
});

describe('wireBridge — reduced motion', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a id="bridge" href="/pages/immersive" data-immersive-bridge>Enter 3D</a>`;
  });

  test('adds reduced-motion class when reducedMotion=true', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'fast', true);
    expect(bridge.classList.contains('immersive-bridge-btn--reduced-motion')).toBe(true);
  });

  test('does not add reduced-motion class when reducedMotion=false', () => {
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'fast', false);
    expect(bridge.classList.contains('immersive-bridge-btn--reduced-motion')).toBe(false);
  });
});

describe('wireBridge — non-3D links are skipped', () => {
  test('does not modify non-3D links', () => {
    document.body.innerHTML = `<a id="bridge" href="/collections/test" data-immersive-bridge>Collections</a>`;
    const bridge = document.getElementById('bridge');
    wireBridge(bridge, 'slow', false);
    expect(bridge.classList.contains('immersive-bridge-btn--slow-connection')).toBe(false);
  });
});
