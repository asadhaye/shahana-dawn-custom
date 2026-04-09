# Immersive Journey Bridges — Systematic Testing Guidance

This document provides step-by-step instructions for testing the Immersive Journey Bridges feature across all six dimensions outlined in your requirements.

---

## 1. Bridge Navigation & Deep-Linking Tests

### 1.1 From 2D Context → 3D URL Navigation

**Test Case 1.1.1: Collection Bridge Navigation**
- Navigate to `/collections/suffuse` (or any collection)
- Verify Collection Bridge renders above product grid
- Click the bridge button
- Verify URL changes to `/?open_collection=suffuse`
- Verify collection panel opens in 3D store with correct products
- Verify deep-link parameter is preserved in URL bar

**Test Case 1.1.2: Search Bridge Navigation**
- Navigate to `/search?q=bridal` (or any search term)
- Verify Search Bridge renders in search header
- Click the bridge button
- Verify URL changes to `/?open_search=bridal` (URL-encoded)
- Verify search results panel opens in 3D store with matching products
- Verify search term is preserved in URL bar

**Test Case 1.1.3: Product Bridge Navigation**
- Navigate to `/products/product-handle` (any product)
- Verify Product Bridge renders below buy buttons
- Click the bridge button
- Verify URL changes to `/?open_product=product-handle`
- Verify product panel opens in 3D store with correct product
- Verify product handle is preserved in URL bar

**Test Case 1.1.4: Cart Bridge Navigation**
- Add items to cart
- Navigate to `/cart`
- Verify Cart Bridge renders after cart heading
- Click the bridge button
- Verify URL changes to `/pages/immersive-store`
- Verify 3D store opens (no specific panel, just home)

**Test Case 1.1.5: Collections List Bridge Navigation**
- Navigate to `/collections`
- Verify Collections List Bridge renders after heading
- Click the bridge button
- Verify URL changes to `/pages/immersive-store`
- Verify 3D store opens

**Test Case 1.1.6: Content Bridge Navigation (Blog)**
- Navigate to `/blogs/news` (or any blog index)
- Verify Content Bridge renders after blog title
- Click the bridge button
- Verify URL changes to `/pages/immersive-store`
- Verify 3D store opens

**Test Case 1.1.7: Content Bridge Navigation (Article)**
- Navigate to `/blogs/news/article-title` (any article)
- Verify Content Bridge renders after article content
- Click the bridge button
- Verify URL changes to `/pages/immersive-store`
- Verify 3D store opens

### 1.2 Deep-Link Parameter Preservation

**Test Case 1.2.1: Collection Deep-Link with Special Characters**
- Navigate to `/?open_collection=designer-houses` (handle with hyphens)
- Verify collection panel opens correctly
- Verify URL bar shows `/?open_collection=designer-houses`

**Test Case 1.2.2: Search Deep-Link with Spaces**
- Navigate to `/?open_search=bridal%20collection` (URL-encoded spaces)
- Verify search results panel opens with correct query
- Verify URL bar shows `/?open_search=bridal%20collection`

**Test Case 1.2.3: Search Deep-Link with Special Characters**
- Navigate to `/?open_search=size%3A%22small%22` (URL-encoded special chars)
- Verify search results panel opens without errors
- Verify URL bar shows encoded parameter

**Test Case 1.2.4: Product Deep-Link with Numbers**
- Navigate to `/?open_product=product-123-abc` (handle with numbers)
- Verify product panel opens correctly
- Verify URL bar shows `/?open_product=product-123-abc`

### 1.3 User Preference Respect

**Test Case 1.3.1: 3D Opted-Out User Sees 2D Bridge**
- Clear localStorage: `localStorage.removeItem('immersive_preferred_mode')`
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders
- Click bridge button
- Verify 3D store opens (user hasn't opted out yet)

**Test Case 1.3.2: 3D Opted-In User Sees Preference Banner**
- Set localStorage: `localStorage.setItem('immersive_preferred_mode', '3d')`
- Navigate to `/collections/suffuse` (any 2D page)
- Verify Preference Banner appears at bottom of page
- Verify banner text: "Welcome back — your 3D store is ready."
- Verify "Return to 3D Store" link is clickable
- Verify "Dismiss" button removes banner

**Test Case 1.3.3: Preference Banner Not on Immersive Page**
- Set localStorage: `localStorage.setItem('immersive_preferred_mode', '3d')`
- Navigate to `/pages/immersive-store`
- Verify Preference Banner does NOT appear
- Verify no banner in DOM (check DevTools)

**Test Case 1.3.4: Preference Banner Not on Home Page**
- Set localStorage: `localStorage.setItem('immersive_preferred_mode', '3d')`
- Navigate to `/`
- Verify Preference Banner does NOT appear
- Verify no banner in DOM

---

## 2. From 3D Side → "Back to Classic" Paths

### 2.1 Back to 2D URL Navigation

**Test Case 2.1.1: Back from Collection Panel**
- Open 3D store: `/pages/immersive-store`
- Click on a collection hotspot (or use menu to navigate to collection)
- Verify collection panel opens
- Click "Back to Collections" or close panel
- Verify URL remains `/pages/immersive-store` (or returns to home)
- Verify 3D store is still visible

**Test Case 2.1.2: Back from Product Panel**
- Open 3D store: `/pages/immersive-store`
- Click on a product hotspot (or use menu to navigate to product)
- Verify product panel opens
- Click "Back to Collections" or close panel
- Verify URL remains `/pages/immersive-store`
- Verify 3D store is still visible

**Test Case 2.1.3: Back from Search Panel**
- Open 3D store with search: `/?open_search=bridal`
- Verify search results panel opens
- Click "Back to Collections" or close panel
- Verify URL remains `/?open_search=bridal` (or returns to home)
- Verify 3D store is still visible

**Test Case 2.1.4: "View in 2D" Link on Product Panel**
- Open 3D store: `/pages/immersive-store`
- Open product panel
- Verify "View in 2D" or similar link exists (if implemented)
- Click link
- Verify URL changes to `/products/product-handle`
- Verify 2D product page loads

### 2.2 State Preservation

**Test Case 2.2.1: Search Term Preserved in URL**
- Navigate to `/?open_search=bridal`
- Verify search results panel opens
- Close panel
- Verify URL still shows `/?open_search=bridal`
- Refresh page
- Verify search results panel opens again with same query

**Test Case 2.2.2: Collection Preserved in URL**
- Navigate to `/?open_collection=suffuse`
- Verify collection panel opens
- Close panel
- Verify URL still shows `/?open_collection=suffuse`
- Refresh page
- Verify collection panel opens again

---

## 3. Behavior with JavaScript Disabled

### 3.1 Bridge Links Work as Plain Links

**Test Case 3.1.1: Collection Bridge Without JS**
- Disable JavaScript in DevTools (or use NoScript extension)
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders as plain `<a>` element
- Right-click bridge button → "Inspect Element"
- Verify HTML shows `<a href="/?open_collection=suffuse">...</a>`
- Click bridge button
- Verify page navigates to `/?open_collection=suffuse` (standard link navigation)
- Verify 3D store loads (even without JS, URL parameter is visible)

**Test Case 3.1.2: Search Bridge Without JS**
- Disable JavaScript
- Navigate to `/search?q=bridal`
- Verify Search Bridge renders as plain `<a>` element
- Click bridge button
- Verify page navigates to `/?open_search=bridal`

**Test Case 3.1.3: Product Bridge Without JS**
- Disable JavaScript
- Navigate to `/products/product-handle`
- Verify Product Bridge renders as plain `<a>` element
- Click bridge button
- Verify page navigates to `/?open_product=product-handle`

**Test Case 3.1.4: Cart Bridge Without JS**
- Disable JavaScript
- Add items to cart, navigate to `/cart`
- Verify Cart Bridge renders as plain `<a>` element
- Click bridge button
- Verify page navigates to `/pages/immersive-store`

**Test Case 3.1.5: Preference Banner Without JS**
- Disable JavaScript
- Set localStorage: `localStorage.setItem('immersive_preferred_mode', '3d')`
- Navigate to `/collections/suffuse`
- Verify Preference Banner does NOT appear (it's JS-only)
- Verify no errors in console

### 3.2 Device-Awareness Script Not Executed

**Test Case 3.2.1: Bridge Behavior Without bridge-behavior.js**
- Disable JavaScript
- Navigate to `/collections/suffuse` on a slow connection (DevTools throttling)
- Verify Collection Bridge renders normally (no warning text)
- Verify bridge is still clickable

**Test Case 3.2.2: Reduced Motion Not Applied Without JS**
- Disable JavaScript
- Enable `prefers-reduced-motion: reduce` in DevTools
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders with pulsing dot animation (no reduced motion applied)
- Verify bridge is still clickable

---

## 4. Bridge Banner Snippet Usage

### 4.1 Parameter Validation

**Test Case 4.1.1: All Required Parameters Present**
- Inspect Collection Bridge in DevTools
- Verify HTML includes:
  - `href="/?open_collection=suffuse"` (bridge_url)
  - `aria-label="Explore Suffuse in the 3D Store"` (bridge_aria)
  - `data-immersive-bridge` attribute
  - CTA text: "Explore in 3D Store" (bridge_label)

**Test Case 4.1.2: Image Variant Correct**
- Inspect Collection Bridge in DevTools
- Verify `<img>` tag includes:
  - `loading="lazy"` attribute
  - `srcset` with multiple widths (`160, 240, 320`)
  - `sizes` attribute for responsive loading
  - `alt=""` (empty alt for decorative image)

**Test Case 4.1.3: Placeholder SVG When No Image**
- Create a collection without a featured image
- Navigate to that collection
- Verify Collection Bridge renders placeholder SVG
- Verify SVG has `viewBox="0 0 80 60"`
- Verify SVG uses brand accent color (`#d4af37`)

**Test Case 4.1.4: Bridge URL Always Full Path**
- Inspect all six bridge buttons in DevTools
- Verify all `href` values start with `/` (root-relative):
  - Collection: `/?open_collection=...`
  - Search: `/?open_search=...`
  - Product: `/?open_product=...`
  - Cart: `/pages/immersive-store`
  - Collections List: `/pages/immersive-store`
  - Content: `/pages/immersive-store`
- Verify no relative paths (e.g., `open_collection=...` without leading `/`)

### 4.2 Image Cropping & Lazy Loading

**Test Case 4.2.1: Image Cropping on Desktop**
- Navigate to `/collections/suffuse` on desktop (1440px+)
- Verify Collection Bridge image is 320px wide
- Verify image is cropped to fit (object-fit: cover)
- Verify no distortion or stretching

**Test Case 4.2.2: Image Cropping on Tablet**
- Navigate to `/collections/suffuse` on tablet (768px)
- Verify Collection Bridge image is 240px wide
- Verify image is cropped to fit
- Verify no distortion

**Test Case 4.2.3: Image Cropping on Mobile**
- Navigate to `/collections/suffuse` on mobile (375px)
- Verify Collection Bridge image is 160px wide
- Verify image is cropped to fit
- Verify no distortion

**Test Case 4.2.4: Lazy Loading**
- Navigate to `/collections/suffuse`
- Open DevTools → Network tab
- Scroll down to Collection Bridge
- Verify image is NOT loaded until bridge is visible in viewport
- Scroll bridge into view
- Verify image loads immediately

**Test Case 4.2.5: Placeholder SVG on Light/Dark Backgrounds**
- Create a collection without featured image
- Navigate to that collection
- Verify placeholder SVG is visible on light background
- Verify placeholder SVG is visible on dark background
- Verify SVG uses brand accent color (readable on both)

---

## 5. Preference Manager & Device-Aware Logic

### 5.1 Preference Storage

**Test Case 5.1.1: Preference Stored in localStorage**
- Open 3D store: `/pages/immersive-store`
- Wait for scene to load
- Open DevTools → Application → localStorage
- Verify key `immersive_preferred_mode` exists
- Verify value is `'3d'`

**Test Case 5.1.2: Preference Persists Across Sessions**
- Set localStorage: `localStorage.setItem('immersive_preferred_mode', '3d')`
- Close browser tab
- Open new tab, navigate to `/collections/suffuse`
- Verify Preference Banner appears
- Verify localStorage still contains `immersive_preferred_mode: '3d'`

**Test Case 5.1.3: Preference Survives Page Refresh**
- Open 3D store: `/pages/immersive-store`
- Wait for scene to load
- Refresh page (Cmd+R or Ctrl+R)
- Verify localStorage still contains `immersive_preferred_mode: '3d'`
- Verify 3D store loads again

**Test Case 5.1.4: Private Browsing Doesn't Break**
- Open private/incognito window
- Navigate to `/pages/immersive-store`
- Wait for scene to load
- Verify no errors in console
- Verify 3D store loads normally (localStorage access fails silently)

### 5.2 Device/Connection Detection

**Test Case 5.2.1: Slow Connection Warning**
- Open DevTools → Network tab
- Set throttling to "Slow 3G"
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders
- Verify bridge heading text changes to: "3D store is optimized for faster connections"
- Verify bridge has `--slow-connection` CSS class (opacity 0.85)

**Test Case 5.2.2: Reduced Motion Support**
- Open DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion
- Select "prefers-reduced-motion: reduce"
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders
- Verify pulsing dot animation is NOT running
- Verify bridge has `--reduced-motion` CSS class
- Verify no transitions on hover

**Test Case 5.2.3: Normal Connection No Warning**
- Open DevTools → Network tab
- Set throttling to "No throttling"
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders normally
- Verify heading text is NOT changed to warning
- Verify bridge does NOT have `--slow-connection` class

**Test Case 5.2.4: Reduced Motion Disabled**
- Open DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion
- Select "prefers-reduced-motion: no-preference"
- Navigate to `/collections/suffuse`
- Verify Collection Bridge renders
- Verify pulsing dot animation IS running
- Verify bridge does NOT have `--reduced-motion` class
- Verify transitions work on hover

**Test Case 5.2.5: Device-Aware Behavior Only on 3D Links**
- Navigate to `/collections/suffuse` on slow connection
- Verify Collection Bridge (3D link) shows warning
- Verify "View in 2D" link (if present) does NOT show warning
- Verify other 2D links on page are unaffected

---

## 6. SEO Validation

### 6.1 Crawl & Indexability

**Test Case 6.1.1: 2D Routes Remain Reachable**
- Use Google Search Console or similar tool
- Verify `/collections/{handle}` is crawlable
- Verify `/products/{handle}` is crawlable
- Verify `/search` is crawlable
- Verify `/pages/{content}` is crawlable
- Verify no 404 errors

**Test Case 6.1.2: 3D Routes Separate from Canonical**
- Navigate to `/pages/immersive-store`
- Inspect page source
- Verify `<link rel="canonical" href="https://example.com/pages/immersive-store">`
- Verify canonical does NOT point to `/` or any 2D page
- Verify 3D page is self-referential

**Test Case 6.1.3: Product Overlays Don't Conflict**
- Open 3D store: `/pages/immersive-store`
- Open product panel
- Inspect page source (DevTools → Elements)
- Verify no `<link rel="canonical">` tag in product panel HTML
- Verify no structured data (JSON-LD) in product panel
- Verify canonical remains `/pages/immersive-store`

**Test Case 6.1.4: robots.txt Allows 3D Page**
- Fetch `https://example.com/robots.txt`
- Verify `/pages/immersive-store` is NOT blocked
- Verify `/pages/immersive-store` is NOT disallowed

### 6.2 Deep-Link Parameters

**Test Case 6.2.1: Query Parameters Don't Affect Canonical**
- Navigate to `/?open_collection=suffuse`
- Inspect page source
- Verify `<link rel="canonical" href="https://example.com/">`
- Verify canonical does NOT include `?open_collection=suffuse`

**Test Case 6.2.2: Search Parameters Don't Affect Canonical**
- Navigate to `/?open_search=bridal`
- Inspect page source
- Verify `<link rel="canonical" href="https://example.com/">`
- Verify canonical does NOT include `?open_search=bridal`

**Test Case 6.2.3: Product Parameters Don't Affect Canonical**
- Navigate to `/?open_product=product-handle`
- Inspect page source
- Verify `<link rel="canonical" href="https://example.com/">`
- Verify canonical does NOT include `?open_product=product-handle`

### 6.3 Content & Internal Linking

**Test Case 6.3.1: Editorial Sections Render Rich Copy**
- Open 3D store: `/pages/immersive-store`
- Navigate to editorial section (e.g., designer houses)
- Verify editorial content is rendered as HTML (not just images)
- Verify text is selectable (not in canvas)
- Verify links are clickable

**Test Case 6.3.2: Editorial Links Are Crawlable**
- Inspect editorial section in DevTools
- Verify links use `<a href="/collections/...">` format
- Verify links are not JavaScript-only
- Verify links are not hidden from crawlers

**Test Case 6.3.3: Bridge Banners Use Meaningful CTA Text**
- Inspect all six bridge buttons
- Verify CTA text is descriptive (e.g., "Explore in 3D Store", not "Click here")
- Verify aria-labels are descriptive (e.g., "Explore Suffuse in the 3D Store")
- Verify no generic placeholder text

**Test Case 6.3.4: Bridge Banners Not Hidden Behind JS**
- Disable JavaScript
- Navigate to `/collections/suffuse`
- Verify Collection Bridge is visible (not hidden)
- Verify bridge text is readable (not behind JS-only state)

---

## 7. Metaobjects — Audit Current Room Configuration

### 7.1 Current Room Configuration Audit

**Test Case 7.1.1: Identify Room Image Controls**
- Open `sections/immersive-canvas.liquid` in editor
- Search for `room_key` or `storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections`
- Identify where room images are currently configured:
  - [ ] In section schema settings?
  - [ ] In a separate configuration section?
  - [ ] In `<script id="immersive-rooms-config">`?
- Document the current approach

**Test Case 7.1.2: Identify Hotspot Text Controls**
- Open `sections/immersive-canvas.liquid`
- Search for hotspot labels (e.g., "Our Designers", "Occasions")
- Identify where hotspot text is currently editable:
  - [ ] In section schema settings?
  - [ ] In a separate configuration section?
  - [ ] Hard-coded in JavaScript?
- Document the current approach

**Test Case 7.1.3: Identify Depth Map Controls**
- Open `sections/immersive-canvas.liquid`
- Search for `depthMapUrl` or `depth_map`
- Identify where depth maps are currently configured:
  - [ ] In section schema settings?
  - [ ] Hard-coded in `immersive-store.js`?
- Document the current approach

**Test Case 7.1.4: Create Room Configuration Audit Document**
- For each room key (storefront, lounge, designer_houses, occasions, featured_collections):
  - Document which section setting controls base image(s)
  - Document which section setting controls depth map(s)
  - Document which section setting controls hotspot labels
  - Example:
    ```
    Room: designer_houses
    - Base image: section setting "Designer Houses Image"
    - Depth map: hard-coded in immersive-store.js
    - Hotspot labels: hard-coded in STORE_ROOMS
    ```

---

## 8. Regression & Performance Testing

### 8.1 Lighthouse / PageSpeed Insights

**Test Case 8.1.1: Immersive Page Performance**
- Run Lighthouse on `/pages/immersive-store`
- Verify LCP (Largest Contentful Paint) < 3.5s
- Verify FCP (First Contentful Paint) < 1.8s
- Verify CLS (Cumulative Layout Shift) < 0.1
- Verify Performance score ≥ 50 (acceptable for 3D page)

**Test Case 8.1.2: Home Page Performance**
- Run Lighthouse on `/`
- Verify LCP < 2.5s
- Verify FCP < 1.8s
- Verify CLS < 0.1
- Verify Performance score ≥ 70

**Test Case 8.1.3: Collection Page Performance**
- Run Lighthouse on `/collections/suffuse`
- Verify LCP < 2.5s
- Verify FCP < 1.8s
- Verify CLS < 0.1
- Verify Performance score ≥ 70

**Test Case 8.1.4: Product Page Performance**
- Run Lighthouse on `/products/product-handle`
- Verify LCP < 2.5s
- Verify FCP < 1.8s
- Verify CLS < 0.1
- Verify Performance score ≥ 70

### 8.2 Console Monitoring

**Test Case 8.2.1: No Console Errors on Initial Load**
- Open `/pages/immersive-store`
- Open DevTools → Console
- Wait for page to fully load
- Verify no red error messages
- Verify no uncaught exceptions

**Test Case 8.2.2: No Console Errors with Deep-Link Parameters**
- Open `/?open_collection=suffuse`
- Open DevTools → Console
- Wait for page to fully load
- Verify no red error messages
- Verify no uncaught exceptions

**Test Case 8.2.3: No Console Errors with Search Parameters**
- Open `/?open_search=bridal`
- Open DevTools → Console
- Wait for page to fully load
- Verify no red error messages
- Verify no uncaught exceptions

**Test Case 8.2.4: No requestAnimationFrame Violations**
- Open `/pages/immersive-store`
- Open DevTools → Console
- Interact with 3D store (move mouse, navigate rooms)
- Verify no warnings about "requestAnimationFrame" violations
- Verify no warnings about "long tasks"

---

## Testing Checklist

Use this checklist to track testing progress:

### Bridge Navigation (7 tests)
- [ ] 1.1.1 Collection Bridge Navigation
- [ ] 1.1.2 Search Bridge Navigation
- [ ] 1.1.3 Product Bridge Navigation
- [ ] 1.1.4 Cart Bridge Navigation
- [ ] 1.1.5 Collections List Bridge Navigation
- [ ] 1.1.6 Content Bridge Navigation (Blog)
- [ ] 1.1.7 Content Bridge Navigation (Article)

### Deep-Link Preservation (4 tests)
- [ ] 1.2.1 Collection Deep-Link with Special Characters
- [ ] 1.2.2 Search Deep-Link with Spaces
- [ ] 1.2.3 Search Deep-Link with Special Characters
- [ ] 1.2.4 Product Deep-Link with Numbers

### User Preference Respect (4 tests)
- [ ] 1.3.1 3D Opted-Out User Sees 2D Bridge
- [ ] 1.3.2 3D Opted-In User Sees Preference Banner
- [ ] 1.3.3 Preference Banner Not on Immersive Page
- [ ] 1.3.4 Preference Banner Not on Home Page

### Back to 2D Navigation (4 tests)
- [ ] 2.1.1 Back from Collection Panel
- [ ] 2.1.2 Back from Product Panel
- [ ] 2.1.3 Back from Search Panel
- [ ] 2.1.4 "View in 2D" Link on Product Panel

### State Preservation (2 tests)
- [ ] 2.2.1 Search Term Preserved in URL
- [ ] 2.2.2 Collection Preserved in URL

### JavaScript Disabled (5 tests)
- [ ] 3.1.1 Collection Bridge Without JS
- [ ] 3.1.2 Search Bridge Without JS
- [ ] 3.1.3 Product Bridge Without JS
- [ ] 3.1.4 Cart Bridge Without JS
- [ ] 3.1.5 Preference Banner Without JS

### Device-Awareness Without JS (2 tests)
- [ ] 3.2.1 Bridge Behavior Without bridge-behavior.js
- [ ] 3.2.2 Reduced Motion Not Applied Without JS

### Bridge Banner Parameters (5 tests)
- [ ] 4.1.1 All Required Parameters Present
- [ ] 4.1.2 Image Variant Correct
- [ ] 4.1.3 Placeholder SVG When No Image
- [ ] 4.1.4 Bridge URL Always Full Path

### Image Cropping & Lazy Loading (5 tests)
- [ ] 4.2.1 Image Cropping on Desktop
- [ ] 4.2.2 Image Cropping on Tablet
- [ ] 4.2.3 Image Cropping on Mobile
- [ ] 4.2.4 Lazy Loading
- [ ] 4.2.5 Placeholder SVG on Light/Dark Backgrounds

### Preference Storage (4 tests)
- [ ] 5.1.1 Preference Stored in localStorage
- [ ] 5.1.2 Preference Persists Across Sessions
- [ ] 5.1.3 Preference Survives Page Refresh
- [ ] 5.1.4 Private Browsing Doesn't Break

### Device/Connection Detection (5 tests)
- [ ] 5.2.1 Slow Connection Warning
- [ ] 5.2.2 Reduced Motion Support
- [ ] 5.2.3 Normal Connection No Warning
- [ ] 5.2.4 Reduced Motion Disabled
- [ ] 5.2.5 Device-Aware Behavior Only on 3D Links

### SEO Crawl & Indexability (4 tests)
- [ ] 6.1.1 2D Routes Remain Reachable
- [ ] 6.1.2 3D Routes Separate from Canonical
- [ ] 6.1.3 Product Overlays Don't Conflict
- [ ] 6.1.4 robots.txt Allows 3D Page

### Deep-Link Parameters (3 tests)
- [ ] 6.2.1 Query Parameters Don't Affect Canonical
- [ ] 6.2.2 Search Parameters Don't Affect Canonical
- [ ] 6.2.3 Product Parameters Don't Affect Canonical

### Content & Internal Linking (4 tests)
- [ ] 6.3.1 Editorial Sections Render Rich Copy
- [ ] 6.3.2 Editorial Links Are Crawlable
- [ ] 6.3.3 Bridge Banners Use Meaningful CTA Text
- [ ] 6.3.4 Bridge Banners Not Hidden Behind JS

### Metaobjects Audit (4 tests)
- [ ] 7.1.1 Identify Room Image Controls
- [ ] 7.1.2 Identify Hotspot Text Controls
- [ ] 7.1.3 Identify Depth Map Controls
- [ ] 7.1.4 Create Room Configuration Audit Document

### Performance Testing (4 tests)
- [ ] 8.1.1 Immersive Page Performance
- [ ] 8.1.2 Home Page Performance
- [ ] 8.1.3 Collection Page Performance
- [ ] 8.1.4 Product Page Performance

### Console Monitoring (4 tests)
- [ ] 8.2.1 No Console Errors on Initial Load
- [ ] 8.2.2 No Console Errors with Deep-Link Parameters
- [ ] 8.2.3 No Console Errors with Search Parameters
- [ ] 8.2.4 No requestAnimationFrame Violations

**Total: 68 test cases**

---

## Notes

- Tests should be run on multiple browsers (Chrome, Firefox, Safari, Edge)
- Tests should be run on multiple devices (desktop, tablet, mobile)
- Tests should be run with both JavaScript enabled and disabled
- Tests should be run with various network conditions (fast, slow, offline)
- Tests should be run with various accessibility settings (reduced motion, high contrast, etc.)
- Document any failures or unexpected behavior
- Report results to the development team

