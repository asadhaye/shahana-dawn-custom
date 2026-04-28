# Immersive Shopping Journey — Requirements

**Feature Name:** immersive-shopping-journey  
**Status:** In Progress  
**Last Updated:** 2026-04-27

---

## 1. Overview

The Shahana Collection immersive store is a luxury fashion e-commerce experience built with Three.js. This spec documents the complete shopping journey from entry to purchase, identifying all customization points and ensuring merchants can configure the experience entirely through the Shopify theme editor.

### Current Architecture

- **Entry Point:** `/pages/immersive` (canonical immersive URL)
- **Rooms:** storefront → lounge → designer_houses / occasions / featured_collections
- **Editorial Overlays:** Per-room living stories with scroll parallax
- **Product Panels:** Glass morphism design with Section Rendering API
- **Bridge CTAs:** 2D ↔ 3D navigation on all standard templates
- **Preference System:** localStorage-backed mode preference banner

---

## 2. User Journey Map

### 2.1 Entry Points

**Requirement R1.1:** The system SHALL support multiple entry points into the immersive experience:

- **Primary:** `/pages/immersive` (canonical URL)
- **Deep-links:** `?open_product={handle}`, `?open_collection={handle}`, `?open_search={terms}`
- **Bridge CTAs:** From 2D pages (collections, products, search, cart, blog)
- **Preference Banner:** Non-blocking banner on 2D pages after first 3D visit

**Acceptance Criteria:**
- [ ] All entry points resolve to `/pages/immersive` (no legacy `/pages/immersive-store` URLs)
- [ ] Deep-link parameters are parsed and prioritized: `open_product` > `open_collection` > `open_search`
- [ ] Preference banner appears only on 2D pages when `immersive_preferred_mode = '3d'` in localStorage
- [ ] Preference banner is suppressed on `page.immersive`, `index`, and `password` templates

### 2.2 Onboarding & Welcome

**Requirement R1.2:** The system SHALL display a configurable welcome screen on first visit:

- **Title:** Merchant-configurable heading
- **Description:** Merchant-configurable body text
- **Dismiss Button:** Merchant-configurable label
- **Show Once:** Toggle to show only on first visit or every visit
- **Accessibility:** `role="dialog" aria-modal="true"` with focus trap

**Acceptance Criteria:**
- [ ] Welcome screen is rendered as `#immersive-onboarding` dialog
- [ ] All text is translatable via `| t` filter
- [ ] `data-show-once` attribute controls repeat behavior
- [ ] Dismiss button restores focus to next sibling element
- [ ] Welcome screen is suppressed when `onboarding_enabled = false`

### 2.3 Room Navigation Flow

**Requirement R1.3:** The system SHALL provide a hierarchical room navigation structure:

```
storefront (entry)
  ↓ hotspot: "Enter Store"
lounge (hub)
  ↓ hotspots:
    - "Designer Houses" → designer_houses (editorial)
    - "Occasions" → occasions (editorial)
    - "Featured Collections" → featured_collections (editorial)
  ↓ back button
storefront
```

**Acceptance Criteria:**
- [ ] Each room has configurable base image (desktop/mobile) and depth map
- [ ] Each room has configurable hotspots with labels and target rooms
- [ ] Hotspots support both room navigation (`targetRoom`) and editorial overlays (`targetEditorialRoom`)
- [ ] Back button navigates to previous room in history
- [ ] Room badge displays current room name and guidance text
- [ ] All room names and guidance text are translatable

### 2.4 Editorial Overlays

**Requirement R1.4:** The system SHALL render per-room editorial overlays with merchant-configurable content:

**Designer Houses Room:**
- Hero section: eyebrow, heading, subheading
- Designer cards: image, logo, name, manifesto, collection link
- Scroll parallax with live room background

**Occasions Room:**
- Hero section: eyebrow, heading, subheading
- Occasion cards: image, heading, description, collection link
- Scroll parallax with live room background

**Featured Collections Room:**
- Hero section: eyebrow, heading, subheading
- Collection cards: image, heading, description, collection link
- Scroll parallax with live room background

**Acceptance Criteria:**
- [ ] Each editorial overlay is a reusable `immersive-editorial` section with `room_key` setting
- [ ] Each editorial overlay has a `layout` setting to control DOM structure
- [ ] All editorial content (headings, descriptions, CTAs) is merchant-configurable via blocks
- [ ] All editorial text is translatable via `| t` filter
- [ ] Editorial overlays support scroll parallax with `prefers-reduced-motion` guard
- [ ] Editorial overlays are fetched via Section Rendering API on hotspot click

### 2.5 Product Discovery

**Requirement R1.5:** The system SHALL support multiple product discovery flows:

**Collection Browsing:**
- Hotspot click → collection grid panel
- Grid shows products from merchant-selected collection
- Pagination or infinite scroll
- Product cards with image, name, price, variant selector

**Product Detail:**
- Hotspot click → product detail panel
- Media carousel, price, variants, add-to-cart, VTO widget
- Related products section
- Social share buttons

**Search:**
- Header search input with autocomplete
- Search results panel with product grid
- Grouped results: products, collections, rooms

**Wishlist:**
- FAB button in immersive header
- Wishlist panel with saved products
- Add/remove from wishlist
- View product link

**Acceptance Criteria:**
- [ ] Collection panels are rendered via Section Rendering API: `GET /collections/{handle}?section_id=glass-panel`
- [ ] Product panels are rendered via Section Rendering API: `GET /products/{handle}?section_id=glass-product`
- [ ] Search results are rendered via Section Rendering API: `GET /search?q={terms}&section_id=immersive-product-grid`
- [ ] All panels are cached by URL via `fetchWithCache()`
- [ ] Wishlist is localStorage-backed and guest-friendly
- [ ] Wishlist badge shows count of saved items

### 2.6 Cart & Checkout

**Requirement R1.6:** The system SHALL integrate with Shopify's standard cart and checkout:

- **Add to Cart:** Product panel form submits to `/cart/add.js`
- **Cart Button:** FAB button opens cart drawer or redirects to `/cart`
- **Checkout:** Standard Shopify checkout flow
- **Success Feedback:** Toast message after add-to-cart

**Acceptance Criteria:**
- [ ] Product form uses standard Shopify `{% form 'product', product %}` structure
- [ ] Add-to-cart success shows toast with `role="status" aria-live="polite"`
- [ ] Add-to-cart error shows toast with `role="alert" aria-live="assertive"`
- [ ] Cart button respects theme's cart type setting (drawer/page/notification)
- [ ] Checkout flow is unmodified from standard Shopify

### 2.7 Mobile Experience

**Requirement R1.7:** The system SHALL provide a responsive mobile experience:

- **Viewport:** Optimized for 375px–768px screens
- **Touch Interactions:** Tap to navigate, swipe to pan parallax
- **Tilt Control:** Optional gyroscope-based parallax (mobile-only, opt-in)
- **Reduced Motion:** Parallax disabled when `prefers-reduced-motion: reduce`
- **Performance:** Optimized texture loading and rendering

**Acceptance Criteria:**
- [ ] Mobile base images and depth maps are loaded (smaller file size)
- [ ] Hotspots have mobile-specific X/Y coordinates
- [ ] Touch parallax is throttled via `requestAnimationFrame`
- [ ] Tilt control is feature-flagged and requires user gesture
- [ ] Tilt control respects `prefers-reduced-motion`
- [ ] No horizontal scroll on mobile

### 2.8 Accessibility

**Requirement R1.8:** The system SHALL meet WCAG 2.1 Level AA accessibility standards:

- **Semantic HTML:** Proper heading hierarchy, landmarks, form labels
- **Focus Management:** Focus trap in dialogs, focus restoration on close
- **ARIA:** Proper roles, labels, live regions for dynamic content
- **Keyboard Navigation:** All interactive elements keyboard-accessible
- **Color Contrast:** 4.5:1 minimum for text
- **Reduced Motion:** All animations respect `prefers-reduced-motion`

**Acceptance Criteria:**
- [ ] All dialogs (glass-panel, wishlist, editorial overlay) have focus trap
- [ ] All buttons and links have visible focus states
- [ ] All images have alt text or `aria-hidden="true"`
- [ ] All form inputs have associated labels
- [ ] All dynamic content updates use `aria-live` regions
- [ ] No color-only indicators (e.g., "red = error")
- [ ] All animations are disabled when `prefers-reduced-motion: reduce`

---

## 3. Customization Points

### 3.1 Theme Editor Configuration

**Requirement R2.1:** All customization SHALL be available in the Shopify theme editor without code changes:

**Immersive Canvas Section Settings:**
- Logo image
- Transition style (crossfade / pixel dissolve)
- Navigation menu
- FAQ page link
- Onboarding enabled/disabled
- Onboarding title, description, button label
- Onboarding show-once toggle
- Low stock threshold
- Guided featured wing (default room for guided mode)

**Room Configuration (per room):**
- Base image (desktop/mobile)
- Depth map (desktop/mobile)
- Hotspot 1–4: label, collection, X/Y coordinates (desktop/mobile)

**Editorial Section Settings (per room):**
- Room key (designer_houses / occasions / featured_collections)
- Layout (designers / occasions / featured_collections)
- Hero eyebrow, heading, subheading
- Block-driven content (designer cards, occasion cards, collection cards)

**Acceptance Criteria:**
- [ ] All settings are in `{% schema %}` blocks with proper labels and info text
- [ ] All settings are translatable via `t:sections.immersive_store.settings.*` keys
- [ ] All settings have sensible defaults
- [ ] Settings changes are reflected in theme editor preview
- [ ] No hardcoded values in Liquid templates (all via settings)

### 3.2 Image Management

**Requirement R2.2:** Merchants SHALL upload and manage all images via the theme editor:

**Room Images:**
- Base image (parallax background)
- Depth map (parallax effect)
- Desktop and mobile variants

**Editorial Images:**
- Designer brand images
- Designer logos
- Occasion images
- Collection featured images

**Product Images:**
- Managed via Shopify product admin (not theme editor)

**Acceptance Criteria:**
- [ ] All image pickers use Shopify's native image picker
- [ ] Images are optimized via `| image_url: width: X` filter
- [ ] Mobile images are smaller file size than desktop
- [ ] Depth maps are grayscale (no color information)
- [ ] All images have alt text fields

### 3.3 Collection Linking

**Requirement R2.3:** Merchants SHALL link collections to hotspots and editorial content:

**Hotspot Collections:**
- Each hotspot can link to a collection
- Collection is opened in glass panel on hotspot click

**Editorial Collections:**
- Each designer/occasion/collection card links to a collection
- Collection is opened in glass panel on card click

**Acceptance Criteria:**
- [ ] All collection pickers use Shopify's native collection picker
- [ ] Collection handles are validated (no 404s)
- [ ] Collection links are translatable (label text)
- [ ] Collections can be reused across multiple hotspots/cards

### 3.4 Text & Translation

**Requirement R2.4:** All user-facing text SHALL be translatable:

**Translatable Strings:**
- Room names and guidance text
- Hotspot labels
- Editorial headings and descriptions
- Button labels (add to cart, wishlist, etc.)
- Error messages and feedback
- Onboarding text

**Acceptance Criteria:**
- [ ] All strings use `| t` filter in Liquid
- [ ] All schema labels use `t:sections.immersive_store.*` keys
- [ ] All keys exist in `locales/en.default.json` and `locales/en.default.schema.json`
- [ ] Merchants can add translations via Shopify's language editor

---

## 4. Correctness Properties

### P1: Entry Point Consistency

**Property:** All entry points to the immersive experience resolve to the canonical URL `/pages/immersive`.

**Invariant:** No legacy URLs (`/pages/immersive-store`, `?view=immersive`) are used.

**Test:** Verify all Bridge CTAs, preference banner, and deep-links use `/pages/immersive`.

### P2: Room Navigation Integrity

**Property:** Room navigation follows the defined hierarchy and never creates orphaned states.

**Invariant:** Back button always returns to the previous room; forward navigation always targets a valid room.

**Test:** Verify room history stack is maintained and back button is disabled at root.

### P3: Editorial Content Consistency

**Property:** Editorial overlays always display content from the correct room and collection.

**Invariant:** No content mismatch between hotspot target and overlay content.

**Test:** Verify `room_key` and `layout` settings match the hotspot `targetEditorialRoom`.

### P4: Accessibility Compliance

**Property:** All interactive elements are keyboard-accessible and screen-reader-friendly.

**Invariant:** Focus is never lost; dialogs have focus trap; all dynamic content has `aria-live`.

**Test:** Verify keyboard navigation, focus management, and ARIA attributes.

### P5: Mobile Responsiveness

**Property:** The experience is fully functional on mobile devices (375px–768px).

**Invariant:** No horizontal scroll; touch interactions work; performance is acceptable.

**Test:** Verify mobile images load, hotspots are tappable, parallax is smooth.

### P6: Reduced Motion Respect

**Property:** All animations are disabled when `prefers-reduced-motion: reduce` is set.

**Invariant:** No parallax, no transitions, no animations when reduced motion is enabled.

**Test:** Verify animations are disabled in browser dev tools with reduced motion enabled.

---

## 5. Out of Scope

- Virtual Try-On implementation (covered by separate spec)
- Three.js shader optimization (covered by pixel-room-transition spec)
- Analytics integration (covered by separate spec)
- A/B testing framework
- Advanced inventory management
- Multi-currency support (beyond Shopify's native support)

---

## 6. Success Criteria

- [ ] Complete user journey is documented and validated with merchants
- [ ] All customization points are editable in theme editor
- [ ] All images, collections, and text are merchant-configurable
- [ ] Mobile experience is fully functional and performant
- [ ] Accessibility standards are met (WCAG 2.1 AA)
- [ ] All correctness properties pass property-based tests
- [ ] Merchant documentation is clear and comprehensive
