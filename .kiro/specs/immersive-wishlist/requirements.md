# Requirements Document

## Introduction

The Immersive Wishlist feature allows shoppers to save products to a personal wishlist while browsing the 3D immersive store. Saved items persist across page refreshes via `localStorage`. A dedicated glassmorphism wishlist panel — consistent with the existing glass panel UI — lets users view, manage, and act on their saved products without leaving the immersive experience. A wishlist toggle button is accessible from the immersive header at all times.

The feature is a client-side, guest-friendly wishlist. It does not require a Shopify customer account. Wishlist state is stored in `localStorage` under a namespaced key and is scoped to the browser. All user-facing strings use the `| t` filter; all JS-accessible strings are passed via `data-*` attributes.

---

## Glossary

- **Wishlist**: The ordered set of product handles saved by the user in the current browser.
- **Wishlist_Manager**: The JavaScript module responsible for reading and writing wishlist state to `localStorage`.
- **Wishlist_Panel**: The glassmorphism overlay dialog (`role="dialog"`) that displays saved products and allows management actions.
- **Wishlist_Button**: The toggle button rendered in the immersive header that opens the Wishlist_Panel and displays the current item count.
- **Wishlist_Toggle**: The per-product heart/bookmark icon button rendered on product cards and in the product detail panel that adds or removes a product from the Wishlist.
- **Product_Handle**: The Shopify product handle string used as the stable identifier for wishlist entries.
- **Glass_Panel**: The existing full-screen glassmorphism overlay dialog used for collection and product panels (`#glass-panel`).
- **Immersive_Header**: The fixed header bar rendered by `sections/immersive-canvas.liquid` containing the search, account, and cart buttons.
- **Section_Rendering_API**: Shopify's mechanism for fetching section HTML via `GET /products/{handle}?section_id=...`.

---

## Requirements

### Requirement 1: Wishlist State Management

**User Story:** As a shopper, I want my wishlist to persist across page refreshes, so that I do not lose saved items when I navigate away and return.

#### Acceptance Criteria

1. THE Wishlist_Manager SHALL store the wishlist as a JSON array of Product_Handle strings in `localStorage` under the key `immersive_wishlist`.
2. THE Wishlist_Manager SHALL wrap all `localStorage` reads and writes in `try/catch` blocks so that private-browsing restrictions do not throw uncaught errors.
3. IF `localStorage` is unavailable, THEN THE Wishlist_Manager SHALL maintain wishlist state in memory for the duration of the page session.
4. WHEN a product is added to the wishlist, THE Wishlist_Manager SHALL append the Product_Handle to the stored array only if it is not already present (idempotent add).
5. WHEN a product is removed from the wishlist, THE Wishlist_Manager SHALL remove all occurrences of the Product_Handle from the stored array.
6. THE Wishlist_Manager SHALL expose a read-only method that returns the current wishlist as an array of Product_Handle strings without mutating state.
7. FOR ALL sequences of add and remove operations on a Product_Handle, THE Wishlist_Manager SHALL produce a final state equivalent to applying only the last operation (no duplicate entries, no ghost removals).

---

### Requirement 2: Wishlist Toggle on Product Cards

**User Story:** As a shopper browsing the 3D store, I want to save a product to my wishlist directly from the product card, so that I can bookmark items without opening the full product panel.

#### Acceptance Criteria

1. THE `immersive-product-card.liquid` snippet SHALL render a Wishlist_Toggle button with `data-wishlist-toggle` and `data-product-handle="{{ product.handle }}"` attributes.
2. WHEN the Wishlist_Toggle is clicked and the product is not in the wishlist, THE Wishlist_Manager SHALL add the product and THE Wishlist_Toggle SHALL update its `aria-pressed` attribute to `"true"` and its visual state to indicate the item is saved.
3. WHEN the Wishlist_Toggle is clicked and the product is already in the wishlist, THE Wishlist_Manager SHALL remove the product and THE Wishlist_Toggle SHALL update its `aria-pressed` attribute to `"false"` and its visual state to indicate the item is not saved.
4. WHEN the immersive store initialises, THE Wishlist_Manager SHALL set the `aria-pressed` state of all rendered Wishlist_Toggle buttons to reflect the current wishlist contents.
5. THE Wishlist_Toggle SHALL have an accessible label using `aria-label` sourced from `data-*` attributes set via `| t` filter, with distinct labels for the saved and unsaved states.
6. THE Wishlist_Toggle SHALL be positioned as an overlay on the product card image and SHALL NOT obscure the primary product link or the add-to-cart button.

---

### Requirement 3: Wishlist Toggle on Product Detail Panel

**User Story:** As a shopper viewing a product detail panel, I want to save or unsave the product from within the panel, so that I can manage my wishlist without closing the panel.

#### Acceptance Criteria

1. THE `glass-product.liquid` section SHALL render a Wishlist_Toggle button with `data-wishlist-toggle` and `data-product-handle="{{ panel_product.handle }}"` attributes adjacent to the add-to-cart button.
2. WHEN the product detail panel is injected into the DOM via the Section_Rendering_API, THE Wishlist_Manager SHALL initialise the Wishlist_Toggle `aria-pressed` state to reflect whether the product is currently in the wishlist.
3. WHEN the Wishlist_Toggle in the product detail panel is activated, THE Wishlist_Manager SHALL add or remove the product and update the toggle state as specified in Requirement 2, criteria 2 and 3.
4. WHEN a product is added or removed via the product detail panel Wishlist_Toggle, THE Wishlist_Button count in the Immersive_Header SHALL update to reflect the new wishlist size without a page reload.

---

### Requirement 4: Wishlist Button in Immersive Header

**User Story:** As a shopper, I want a persistent wishlist button in the immersive header, so that I can see how many items I have saved and open the wishlist panel at any time.

#### Acceptance Criteria

1. THE `immersive-canvas.liquid` section SHALL render a Wishlist_Button in the Immersive_Header with `data-wishlist-open` attribute and an accessible `aria-label` sourced via `| t` filter.
2. THE Wishlist_Button SHALL display the current wishlist item count as a numeric badge when the count is greater than zero.
3. WHEN the wishlist count is zero, THE Wishlist_Button SHALL hide the numeric badge.
4. WHEN a product is added to or removed from the wishlist by any Wishlist_Toggle, THE Wishlist_Button badge SHALL update synchronously to reflect the new count.
5. WHEN the Wishlist_Button is clicked, THE Wishlist_Panel SHALL open as a dialog overlay.
6. THE Wishlist_Button SHALL be styled consistently with the existing `.immersive-header__icon-btn` pattern using the gold accent colour `#d4af37`.

---

### Requirement 5: Wishlist Panel

**User Story:** As a shopper, I want to view and manage all my saved products in a dedicated panel, so that I can review my wishlist and take action on items.

#### Acceptance Criteria

1. THE Wishlist_Panel SHALL be rendered as a `role="dialog"` element with `aria-modal="true"` and `aria-labelledby` referencing a visible heading, consistent with the existing Glass_Panel ARIA pattern.
2. WHEN the Wishlist_Panel opens, THE Wishlist_Manager SHALL render one card per saved product, displaying at minimum: product image, product title, price, and action buttons (view product, remove from wishlist).
3. WHEN the wishlist is empty and the Wishlist_Panel is opened, THE Wishlist_Panel SHALL display an empty-state message sourced via `| t` filter.
4. WHEN the "Remove" action is activated on a wishlist card, THE Wishlist_Manager SHALL remove the product from the wishlist, THE card SHALL be removed from the Wishlist_Panel DOM, and all Wishlist_Toggle buttons for that product SHALL update their `aria-pressed` state to `"false"`.
5. WHEN the "View product" action is activated on a wishlist card, THE Glass_Panel SHALL open the product detail view for that product via the Section_Rendering_API, and THE Wishlist_Panel SHALL close.
6. THE Wishlist_Panel SHALL apply the glassmorphism visual style (`backdrop-filter: blur`, semi-transparent dark background, gold border accents) consistent with the existing `#glass-panel` and `.immersive-menu` components.
7. THE Wishlist_Panel SHALL be scrollable when the number of saved products exceeds the visible panel height.

---

### Requirement 6: Wishlist Panel Focus Management and Keyboard Navigation

**User Story:** As a keyboard or assistive technology user, I want the wishlist panel to behave as a proper dialog, so that I can navigate and manage my wishlist without a mouse.

#### Acceptance Criteria

1. WHEN the Wishlist_Panel opens, THE Wishlist_Panel SHALL move focus to the close button or the first focusable element within the panel, using the existing `openDialogFocus()` helper pattern.
2. WHILE the Wishlist_Panel is open, THE Wishlist_Panel SHALL trap Tab and Shift+Tab focus within the panel boundary.
3. WHEN the Escape key is pressed while the Wishlist_Panel is open, THE Wishlist_Panel SHALL close.
4. WHEN the Wishlist_Panel closes, THE Wishlist_Panel SHALL restore focus to the Wishlist_Button that triggered the open action, using the existing `closeDialogFocus()` helper pattern.
5. THE Wishlist_Panel close button SHALL have an accessible label sourced via `| t` filter.

---

### Requirement 7: Wishlist Count Persistence and Initialisation

**User Story:** As a returning shopper, I want the wishlist count badge to reflect my saved items immediately on page load, so that I know my wishlist is intact without opening the panel.

#### Acceptance Criteria

1. WHEN the immersive store page loads, THE Wishlist_Manager SHALL read the wishlist from `localStorage` and update the Wishlist_Button badge count before the first rendered frame.
2. WHEN the immersive store page loads, THE Wishlist_Manager SHALL set the `aria-pressed` state of all Wishlist_Toggle buttons present in the initial DOM to reflect the stored wishlist.
3. WHEN new panel content is injected into the DOM via the Section_Rendering_API, THE Wishlist_Manager SHALL initialise any Wishlist_Toggle buttons in the newly injected content to reflect the current wishlist state.
4. FOR ALL valid sequences of page loads and wishlist mutations, THE count displayed on the Wishlist_Button SHALL equal the number of unique Product_Handle strings in the stored wishlist array.

---

### Requirement 8: Wishlist Analytics

**User Story:** As a store owner, I want wishlist interactions tracked alongside existing immersive analytics, so that I can understand which products shoppers are saving.

#### Acceptance Criteria

1. WHEN a product is added to the wishlist, THE Wishlist_Manager SHALL call `trackImmersiveEvent('wishlist_add', { product_handle: handle, source: source })` where `source` is `'product_card'` or `'product_panel'`.
2. WHEN a product is removed from the wishlist via a Wishlist_Toggle, THE Wishlist_Manager SHALL call `trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: source })`.
3. WHEN a product is removed from the wishlist via the Wishlist_Panel remove action, THE Wishlist_Manager SHALL call `trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: 'wishlist_panel' })`.
4. WHEN the Wishlist_Panel is opened, THE Wishlist_Manager SHALL call `trackImmersiveEvent('wishlist_panel_opened', { item_count: count })`.
5. WHEN the "View product" action is activated from the Wishlist_Panel, THE Wishlist_Manager SHALL call `trackImmersiveEvent('wishlist_view_product', { product_handle: handle })`.

---

### Requirement 9: Localisation

**User Story:** As a merchant selling to an international audience, I want all wishlist UI strings to use the Shopify translation system, so that the feature works correctly in all supported locales.

#### Acceptance Criteria

1. THE `locales/en.default.json` file SHALL contain all wishlist user-facing strings under the namespace `sections.immersive_store.wishlist`.
2. THE Wishlist_Toggle aria-labels, Wishlist_Button aria-label, Wishlist_Panel heading, empty-state message, close button label, remove button label, and view-product button label SHALL each reference a distinct `| t` key.
3. WHERE a string requires a dynamic count placeholder (e.g. "3 saved items"), THE translation key SHALL use a Liquid/Shopify `count:` placeholder compatible with the `| t` filter.
4. THE Wishlist_Manager SHALL read all JS-consumed strings from `data-*` attributes set in Liquid via `| t | escape`, following the existing pattern in `glass-product.liquid` and `immersive-canvas.liquid`.

---

### Requirement 10: Reduced Motion and Accessibility

**User Story:** As a user who has enabled reduced motion, I want wishlist animations to be suppressed, so that the experience is comfortable and accessible.

#### Acceptance Criteria

1. THE Wishlist_Panel open and close transitions SHALL be suppressed when `prefers-reduced-motion: reduce` is active, using the existing `reduceMotion` variable in `immersive-store.js`.
2. THE Wishlist_Toggle active/saved state transition (e.g. heart fill animation) SHALL be suppressed when `prefers-reduced-motion: reduce` is active via a `@media (prefers-reduced-motion: reduce)` CSS override.
3. THE Wishlist_Toggle SHALL use a filled vs. outline heart SVG icon to communicate saved state without relying solely on colour, satisfying WCAG 1.4.1 (Use of Colour).
4. THE Wishlist_Panel SHALL include a visible focus indicator on all interactive elements consistent with the existing `outline: 2px solid #d4af37` focus style used throughout the immersive store.
