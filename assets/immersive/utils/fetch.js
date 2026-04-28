/**
 * Fetch utilities for Section Rendering API
 * Extracted from immersive-store.js
 */

var contentCache = {};

function fetchWithCache(url) {
  if (contentCache[url]) {
    return Promise.resolve(contentCache[url]);
  }
  return fetch(url, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .then(function (html) {
      contentCache[url] = html;
      return html;
    });
}

function fetchSectionHtml(path, sectionId, extraParams) {
  var params = new URLSearchParams(extraParams || {});
  params.set('section_id', sectionId);
  var url = path + '?' + params.toString();
  return fetchWithCache(url);
}

// Export to global scope
window.ImmersiveFetch = {
  fetchWithCache: fetchWithCache,
  fetchSectionHtml: fetchSectionHtml,
  clearCache: function() { contentCache = {}; }
};
