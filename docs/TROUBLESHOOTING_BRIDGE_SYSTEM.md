# Troubleshooting Guide: Immersive Bridge System

This guide helps you diagnose and resolve common issues with the immersive bridge system.

---

## Table of Contents

1. [Bridge Button Issues](#bridge-button-issues)
2. [Preference Banner Issues](#preference-banner-issues)
3. [3D Store Loading Issues](#3d-store-loading-issues)
4. [Performance Issues](#performance-issues)
5. [Accessibility Issues](#accessibility-issues)
6. [Browser Compatibility](#browser-compatibility)

---

## Bridge Button Issues

### Bridge Button Not Appearing

**Symptom:** Bridge button doesn't show on collection, product, or search pages.

**Diagnosis Steps:**

1. **Check if section is enabled:**
   - Go to **Online Store → Customize → Sections**
   - Verify the section containing the bridge button is added
   - Look for a toggle labeled "Show Bridge Button" or similar

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for red error messages
   - Note any errors and check [Browser Compatibility](#browser-compatibility)

3. **Verify content exists:**
   - For collections: verify the collection has at least one product
   - For search: perform a search that returns results
   - For cart: add items to cart

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools → Application → Clear storage

**Solutions:**

| Issue | Solution |
|-------|----------|
| Section not added | Add the section via **Customize → Sections** |
| Section disabled | Enable the section toggle |
| No products in collection | Add products to the collection |
| No search results | Perform a search that returns results |
| Cache issue | Hard refresh browser (Ctrl+Shift+R) |
| JavaScript error | Check console and note error message |

---

### Bridge Button Text Not Updating

**Symptom:** Custom text doesn't appear on bridge buttons after editing language settings.

**Diagnosis Steps:**

1. **Verify you're editing the correct language:**
   - Go to **Online Store → Settings → Languages**
   - Confirm you're editing the active language (usually `en.default`)

2. **Verify the key exists:**
   - Search for `immersive_journey_bridges`
   - Look for the specific key (e.g., `collection_cta`)

3. **Check for typos:**
   - Verify the key name is spelled correctly
   - Keys are case-sensitive

4. **Clear cache:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache completely

**Solutions:**

| Issue | Solution |
|-------|----------|
| Wrong language selected | Switch to the correct language (usually `en.default`) |
| Key doesn't exist | Create the key in the language editor |
| Typo in key name | Correct the spelling (keys are case-sensitive) |
| Cache not cleared | Hard refresh (Ctrl+Shift+R) and clear storage |

---

### Bridge Button Not Clickable

**Symptom:** Bridge button appears but doesn't respond to clicks.

**Diagnosis Steps:**

1. **Check if JavaScript is enabled:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Type `typeof window.ImmersiveStateManager`
   - Should return `"object"` (not `"undefined"`)

2. **Check if bridge URL is valid:**
   - Right-click bridge button → Inspect
   - Look for `href` attribute
   - Verify URL starts with `/pages/immersive`

3. **Check for JavaScript errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for red error messages

**Solutions:**

| Issue | Solution |
|-------|----------|
| JavaScript disabled | Enable JavaScript in browser settings |
| Invalid URL | Verify `/pages/immersive` page exists |
| JavaScript error | Check console and note error message |
| Event listener not attached | Refresh page and try again |

---

## Preference Banner Issues

### Preference Banner Not Appearing

**Symptom:** Preference banner doesn't show after visiting 3D store.

**Diagnosis Steps:**

1. **Verify preference banner is enabled:**
   - Go to **Online Store → Customize → Theme Settings**
   - Look for **Immersive Store Preferences**
   - Verify **Show Preference Banner** is toggled ON

2. **Check if preference flag is set:**
   - Open DevTools (F12)
   - Go to **Application → Local Storage**
   - Look for key `immersive_preferred_mode`
   - Value should be `"3d"`

3. **Verify you're on a 2D page:**
   - Preference banner only appears on 2D pages
   - It does NOT appear on `/pages/immersive` or `/`
   - Try navigating to a collection or product page

4. **Check browser storage:**
   - Verify browser allows localStorage
   - Private browsing mode may block localStorage
   - Try in a regular (non-private) browser window

**Solutions:**

| Issue | Solution |
|-------|----------|
| Banner disabled | Enable in **Theme Settings → Immersive Store Preferences** |
| Preference flag not set | Visit 3D store to set the flag |
| On wrong page | Navigate to a 2D page (collection, product, etc.) |
| Private browsing | Use a regular browser window (not private) |
| localStorage blocked | Check browser privacy settings |

---

### Preference Banner Appearing on Wrong Pages

**Symptom:** Preference banner appears on homepage or 3D store page (where it shouldn't).

**Diagnosis Steps:**

1. **Check current page URL:**
   - Homepage should be `/` (not `/pages/immersive`)
   - 3D store should be `/pages/immersive` (not `/pages/immersive-store`)

2. **Check page template:**
   - Go to **Online Store → Pages**
   - Select the page
   - Verify template is correct:
     - Homepage: `index.json`
     - 3D store: `page.immersive`

3. **Check theme.liquid:**
   - Verify preference banner is only rendered on non-immersive pages
   - Should have condition: `{% if template != 'page.immersive' %}`

**Solutions:**

| Issue | Solution |
|-------|----------|
| Wrong page template | Assign correct template in **Pages** settings |
| Incorrect URL | Verify canonical URL is `/pages/immersive` |
| Condition missing | Add template check in `layout/theme.liquid` |

---

### Preference Banner Not Dismissing

**Symptom:** Dismiss button doesn't remove preference banner.

**Diagnosis Steps:**

1. **Check if dismiss button is clickable:**
   - Right-click dismiss button → Inspect
   - Verify it's a `<button>` element
   - Check for `data-dismiss` or similar attribute

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Click dismiss button
   - Look for error messages

3. **Check if JavaScript is loaded:**
   - Open DevTools (F12)
   - Go to **Sources** tab
   - Look for preference banner script
   - Verify it's loaded without errors

**Solutions:**

| Issue | Solution |
|-------|----------|
| Button not clickable | Verify button element is properly rendered |
| JavaScript error | Check console and note error message |
| Script not loaded | Refresh page and try again |
| Event listener not attached | Check browser console for errors |

---

## 3D Store Loading Issues

### 3D Store Not Loading

**Symptom:** Clicking bridge button doesn't open 3D store, or 3D store loads but shows blank canvas.

**Diagnosis Steps:**

1. **Verify `/pages/immersive` page exists:**
   - Go to **Online Store → Pages**
   - Look for a page with handle `immersive`
   - If not found, create it

2. **Verify page template is correct:**
   - Select the immersive page
   - Check **Theme template** dropdown
   - Should be set to `page.immersive`

3. **Check browser console for WebGL errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for errors containing "WebGL" or "Three.js"

4. **Verify browser supports WebGL:**
   - Check [Browser Compatibility](#browser-compatibility)
   - Try a different browser to isolate the issue

5. **Check network tab for failed requests:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Reload page
   - Look for red (failed) requests
   - Note the failed URLs

**Solutions:**

| Issue | Solution |
|-------|----------|
| Page doesn't exist | Create page with handle `immersive` |
| Wrong template | Assign `page.immersive` template |
| WebGL not supported | Use a compatible browser (Chrome 90+, Firefox 88+, Safari 14+) |
| Failed network request | Check URL and verify asset exists |
| Blank canvas | Check console for errors and note them |

---

### 3D Store Loads But Products Don't Appear

**Symptom:** 3D store loads but product panels are empty or show loading spinner indefinitely.

**Diagnosis Steps:**

1. **Check network requests:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Click a hotspot to open a product panel
   - Look for Section Rendering API request (should be a GET request to `/products/{handle}?section_id=...`)
   - Check if request succeeded (status 200) or failed (status 4xx/5xx)

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for error messages related to Section Rendering API

3. **Verify product exists:**
   - Go to **Products** in admin
   - Search for the product handle
   - Verify product is published and has inventory

**Solutions:**

| Issue | Solution |
|-------|----------|
| Section Rendering API failed | Check network request status and error message |
| Product not found | Verify product exists and is published |
| Product not published | Publish product in admin |
| Network error | Check internet connection and try again |

---

## Performance Issues

### Bridge Button Slow to Load

**Symptom:** Bridge button takes a long time to appear on page.

**Diagnosis Steps:**

1. **Check page load time:**
   - Open DevTools (F12)
   - Go to **Performance** tab
   - Reload page
   - Look for long tasks or slow rendering

2. **Check if bridge button image is large:**
   - Right-click bridge button → Inspect
   - Look for `<img>` tag
   - Check image size in DevTools → Network tab
   - Image should be <100KB

3. **Check for JavaScript errors:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for error messages

**Solutions:**

| Issue | Solution |
|-------|----------|
| Large image | Optimize image (compress, resize) |
| Slow network | Use faster connection or optimize assets |
| JavaScript error | Check console and fix error |

---

### 3D Store Slow to Load

**Symptom:** 3D store takes a long time to load or feels sluggish.

**Diagnosis Steps:**

1. **Check device capabilities:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Type `navigator.hardwareConcurrency`
   - Should be ≥2 for good performance

2. **Check connection speed:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Check throttling setting (should be "No throttling")
   - Check connection type (should be 4G or better)

3. **Check texture loading:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Look for image requests (should be <1MB each)

**Solutions:**

| Issue | Solution |
|-------|----------|
| Slow device | Use a faster device or close other apps |
| Slow connection | Use faster connection (4G or WiFi) |
| Large textures | Optimize textures (compress, resize) |
| Too many requests | Check for duplicate requests and cache them |

---

## Accessibility Issues

### Bridge Button Not Keyboard Accessible

**Symptom:** Can't tab to bridge button or activate it with Enter key.

**Diagnosis Steps:**

1. **Check if button is focusable:**
   - Press Tab key repeatedly
   - Verify bridge button receives focus (visible outline)

2. **Check if button is a semantic element:**
   - Right-click bridge button → Inspect
   - Should be `<a>` or `<button>` element
   - Should NOT be `<div>` or `<span>`

3. **Check focus styles:**
   - Tab to bridge button
   - Verify focus indicator is visible (outline or highlight)

**Solutions:**

| Issue | Solution |
|-------|----------|
| Not focusable | Verify button is `<a>` or `<button>` element |
| No focus indicator | Add CSS `:focus-visible` styles |
| Tab order wrong | Check `tabindex` attributes |

---

### Bridge Button Not Announced by Screen Reader

**Symptom:** Screen reader doesn't announce bridge button or aria-label.

**Diagnosis Steps:**

1. **Check aria-label:**
   - Right-click bridge button → Inspect
   - Look for `aria-label` attribute
   - Should contain descriptive text (e.g., "Explore in 3D Store")

2. **Check button text:**
   - If no aria-label, button should have visible text
   - Screen reader will announce visible text

3. **Test with screen reader:**
   - Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
   - Navigate to bridge button
   - Verify announcement includes button purpose

**Solutions:**

| Issue | Solution |
|-------|----------|
| No aria-label | Add `aria-label` attribute with descriptive text |
| No visible text | Add visible button text or aria-label |
| Wrong announcement | Update aria-label to be more descriptive |

---

### Animations Not Disabled for Reduced Motion

**Symptom:** Bridge button animations still play even with "Reduce motion" enabled in OS.

**Diagnosis Steps:**

1. **Check if prefers-reduced-motion is detected:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Type `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
   - Should return `true` if reduced motion is enabled

2. **Check CSS media query:**
   - Right-click bridge button → Inspect
   - Look for `@media (prefers-reduced-motion: reduce)` rule
   - Should disable animations

3. **Check JavaScript:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for `reduceMotion` variable
   - Should be `true` if reduced motion is enabled

**Solutions:**

| Issue | Solution |
|-------|----------|
| Media query missing | Add `@media (prefers-reduced-motion: reduce)` rule |
| Animations not disabled | Set `transition: none` in media query |
| JavaScript not checking | Add `reduceMotion` check in JavaScript |

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| IE 11 | Any | ❌ Not supported |

### WebGL Support

The 3D store requires WebGL support. To check:

1. Open DevTools (F12)
2. Go to **Console** tab
3. Type `!!window.WebGLRenderingContext`
4. Should return `true`

If `false`, WebGL is not supported in your browser.

### Feature Detection

The bridge system uses feature detection to gracefully degrade:

- **localStorage:** Falls back to no persistence if unavailable
- **navigator.connection:** Falls back to no connection detection if unavailable
- **prefers-reduced-motion:** Falls back to animations enabled if unavailable
- **WebGL:** Falls back to static background if unavailable

---

## Getting Help

If you can't resolve the issue:

1. **Check the logs:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Copy all error messages

2. **Check the network:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Look for failed requests (red)
   - Note the URLs and status codes

3. **Contact support:**
   - Provide browser and OS information
   - Provide error messages from console
   - Provide failed URLs from network tab
   - Describe steps to reproduce the issue

---

**Last Updated:** April 28, 2026
**Version:** 1.0.0
