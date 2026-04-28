/**
 * Unit Tests: URL Parameter Handler
 * Task 15 — Requirements 2.1–2.4, 4.1–4.4, 12.1–12.4
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

describe('URL Parameter Handler — open_product', () => {
  test('open_product triggers product panel', () => {
    expect(resolveUrlAction('?open_product=silk-saree').action).toBe('product');
  });
  test('open_product value is the handle', () => {
    expect(resolveUrlAction('?open_product=silk-saree').value).toBe('silk-saree');
  });
  test('empty open_product is ignored', () => {
    expect(resolveUrlAction('?open_product=').action).toBe('none');
  });
  test('whitespace-only open_product is ignored', () => {
    expect(resolveUrlAction('?open_product=%20').action).toBe('none');
  });
});

describe('URL Parameter Handler — open_collection', () => {
  test('open_collection triggers collection panel', () => {
    expect(resolveUrlAction('?open_collection=suffuse').action).toBe('collection');
  });
  test('open_collection value is the handle', () => {
    expect(resolveUrlAction('?open_collection=suffuse').value).toBe('suffuse');
  });
  test('empty open_collection is ignored', () => {
    expect(resolveUrlAction('?open_collection=').action).toBe('none');
  });
});

describe('URL Parameter Handler — open_search', () => {
  test('open_search triggers search panel', () => {
    expect(resolveUrlAction('?open_search=bridal').action).toBe('search');
  });
  test('open_search value is decoded', () => {
    expect(resolveUrlAction('?open_search=bridal%20wear').value).toBe('bridal wear');
  });
  test('open_search with special chars is decoded', () => {
    expect(resolveUrlAction('?open_search=silk%20%26%20chiffon').value).toBe('silk & chiffon');
  });
  test('empty open_search is ignored', () => {
    expect(resolveUrlAction('?open_search=').action).toBe('none');
  });
});

describe('URL Parameter Handler — Priority Rule', () => {
  test('open_product beats open_collection', () => {
    const r = resolveUrlAction('?open_product=silk-saree&open_collection=suffuse');
    expect(r.action).toBe('product');
    expect(r.value).toBe('silk-saree');
  });
  test('open_product beats open_search', () => {
    const r = resolveUrlAction('?open_product=silk-saree&open_search=bridal');
    expect(r.action).toBe('product');
  });
  test('open_collection beats open_search', () => {
    const r = resolveUrlAction('?open_collection=suffuse&open_search=bridal');
    expect(r.action).toBe('collection');
    expect(r.value).toBe('suffuse');
  });
  test('all three: open_product wins', () => {
    const r = resolveUrlAction('?open_product=p&open_collection=c&open_search=s');
    expect(r.action).toBe('product');
  });
  test('no params: action is none', () => {
    expect(resolveUrlAction('').action).toBe('none');
  });
  test('unrelated params: action is none', () => {
    expect(resolveUrlAction('?foo=bar&baz=qux').action).toBe('none');
  });
});
