# Requirements Document: Product Designer UX Fixes

## Introduction

This document defines requirements for 7 critical UX improvements to the Shahana Collection immersive 3D store, identified through product design analysis. These improvements address friction points that impact conversion, accessibility, and user confidence.

**Timeline:** Immediate implementation (1-2 days)

---

## Glossary

- **Skeleton Loader**: Animated placeholder UI shown while content loads
- **Empty State**: UI shown when no content is available (empty collection, search, wishlist)
- **Filter Chip**: Dismissible pill showing an active filter
- **Availability Badge**: Visual indicator showing product stock status
- **Section Rendering API**: Shopify's mechanism for fetching section HTML via URL params
- **Glassmorphism**: Frosted glass aesthetic with backdrop blur and transparency
- **Hotspot**: Interactive button overlaid on the 3D canvas for navigation

---

## Requirements

### Requirement 1: Skeleton Loaders

**User Story:** As a shopper, I want to see visual feedback while content loads so that I know the store is working and don't abandon the experience.

#### Acceptance Criteria

1. WHEN a collection panel is opened, THE system SHALL display a skeleton grid with 6 placeholder cards before the Section Rendering API response arrives.
2. WHEN a product panel is opened, THE system SHALL display a skeleton layout with placeholder media gallery, title, price, and CTA before the Section Rendering API response arrives.
3. WHEN a room texture is loading, THE system SHALL display a low-resolution preview thumbnail with a shimmer overlay and optional progress indicator.
4. THE skeleton loader SHALL use a shimmer animation that moves from left to right over 1.5 seconds, repeating infinitely.
5. THE shimmer animation SHALL use the glassmorphism color palette: `rgba(255,255,255,0.05)` → `rgba(255,255,255,0.1)` → `rgba(255,255,255,0.05)`.
6. WHEN the real content arrives, THE skeleton SHALL fade out over 150ms and the real content SHALL fade in over 150ms.
7. WHERE `prefers-reduced-motion` is enabled, THE shimmer animation SHALL be disabled and skeleton SHALL use a static gradient.
8. THE skeleton loader SHALL be removed from the DOM after the fade-out completes.

---

### Requirement 2: Enhanced Empty States

**User Story:** As a shopper, I want helpful guidance when I encounter empty results so that I can continue shopping instead of hitting a dead end.

#### Acceptance Criteria

1. WHEN a collection has zero products (after filters or naturally empty), THE system SHALL display an empty state with: icon, heading, body text, and two action buttons.
2. THE empty collection state SHALL include a "Search products" button that focuses the search input in the header.
3. THE empty collection state SHALL include a "Browse rooms" button that opens the room picker sheet.
4. WHEN a search query returns zero results, THE system SHALL display an empty state with: search icon, "No results for '{term}'" heading, suggestion text, and "Browse rooms" button.
5. WHEN the wishlist is empty, THE system SHALL display an empty state with: heart icon, "Your wishlist is empty" heading, encouragement text, and "Explore collections" button.
6. THE empty state icon SHALL be an SVG with `aria-hidden="true"` and SHALL use the gold accent color (`#d4af37`).
7. THE empty state heading SHALL be an `<h3>` with proper hierarchy.
8. THE empty state action buttons SHALL have clear `aria-label` attributes.
9. ALL empty state strings SHALL use the `| t` filter with keys under `sections.immersive_store.empty_states.*`.

---

### Requirement 3: Keyboard Navigation for Hotspots

**User Story:** As a keyboard-only user, I want to navigate hotspots using Tab and Enter so that I can explore the 3D store without a mouse.

#### Acceptance Criteria

1. WHEN the immersive canvas is focused, THE system SHALL allow Tab key navigation through all visible hotspots in the current room.
2. WHEN Tab is pressed, THE system SHALL move focus to the next hotspot in DOM order (left-to-right, top-to-bottom).
3. WHEN Shift+Tab is pressed, THE system SHALL move focus to the previous hotspot.
4. WHEN a hotspot receives focus, THE system SHALL display a visible focus ring with `outline: 2px solid #d4af37; outline-offset: 4px;`.
5. WHEN a hotspot receives focus, THE system SHALL announce the hotspot label via an `aria-live="polite"` region.
6. WHEN Enter is pressed on a focused hotspot, THE system SHALL activate the hotspot (same behavior as click).
7. WHEN a room transition occurs, THE system SHALL reset focus to the first hotspot in the new room.
8. THE canvas element SHALL have `tabindex="0"`, `role="application"`, and `aria-label="Immersive 3D showroom. Press Tab to navigate hotspots."`.
9. WHERE `prefers-reduced-motion` is enabled, THE focus ring animation SHALL be disabled.

---

### Requirement 4: Active Filter Chips

**User Story:** As a shopper, I want to see which filters are active so that I understand why certain products are missing and can easily remove filters.

#### Acceptance Criteria

1. WHEN any filter is applied (color, price, designer, sort), THE system SHALL display an active filter chip bar above the product grid.
2. THE active filter chip bar SHALL contain: "Active filters:" label, individual filter chips, and a "Clear all" button.
3. EACH filter chip SHALL display: filter value (e.g., "Ivory"), and a close button (X icon).
4. WHEN a filter chip's close button is clicked, THE system SHALL remove that filter and re-fetch the collection.
5. WHEN the "Clear all" button is clicked, THE system SHALL remove all filters and re-fetch the unfiltered collection.
6. THE active filter chip bar SHALL persist when the panel is closed and reopened (read from `sessionStorage`).
7. THE active filter chip bar SHALL be hidden when no filters are active.
8. EACH filter chip SHALL have `role="button"` and `aria-label="Remove {filter_name} filter"`.
9. THE "Clear all" button SHALL have `aria-label="Clear all filters"`.
10. ALL filter chip strings SHALL use the `| t` filter with keys under `sections.immersive_store.filters.*`.

---

### Requirement 5: Availability Badges on Product Cards

**User Story:** As a shopper, I want to see product availability at a glance so that I don't waste time clicking on sold-out items.

#### Acceptance Criteria

1. WHEN a product card is rendered, THE system SHALL display an availability badge in the top-left corner.
2. IF the product is available, THE badge SHALL display "In Stock" with a green background (`#51cf66`).
3. IF the product is sold out, THE badge SHALL display "Sold Out" with a red background (`#ff6b6b`).
4. THE availability badge SHALL have: `font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; padding: 0.25rem 0.5rem; border-radius: 4px;`.
5. THE availability badge SHALL be positioned `top: 0.5rem; left: 0.5rem;` with `z-index: 3;`.
6. THE availability badge SHALL use the `products.product.in_stock` and `products.product.sold_out` locale keys.
7. THE availability badge SHALL have `aria-hidden="true"` (availability is already conveyed by the disabled Add to Cart button).

---

### Requirement 6: Loading States for Panel Transitions

**User Story:** As a shopper, I want smooth transitions when panels load so that the experience feels polished and intentional.

#### Acceptance Criteria

1. WHEN a panel is opened, THE system SHALL set the panel content opacity to `0` before fetching.
2. WHEN the Section Rendering API response arrives, THE system SHALL inject the HTML and fade the content to `opacity: 1` over 150ms.
3. WHEN a panel is closed, THE system SHALL fade the panel to `opacity: 0` over 150ms before hiding it.
4. THE fade transition SHALL use `transition: opacity 150ms ease-in-out;`.
5. WHERE `prefers-reduced-motion` is enabled, THE fade transition SHALL be disabled (instant show/hide).
6. THE panel content area SHALL have `min-height: 400px;` to prevent layout shift during loading.

---

### Requirement 7: Search Result Visual Hierarchy

**User Story:** As a shopper, I want to quickly distinguish between products, collections, and rooms in search results so that I can find what I'm looking for faster.

#### Acceptance Criteria

1. WHEN search results are rendered, THE system SHALL display an icon before each result item indicating its type.
2. PRODUCT results SHALL use a shopping bag icon (SVG, 16x16px, gold stroke).
3. COLLECTION results SHALL use a grid icon (SVG, 16x16px, gold stroke).
4. ROOM results SHALL use a compass icon (SVG, 16x16px, gold stroke).
5. THE result groups (Products, Collections, Rooms) SHALL be separated by `margin-bottom: 1rem;`.
6. THE group heading (e.g., "Products") SHALL use `font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(212,175,55,0.7);`.
7. EACH result item SHALL have `padding: 0.75rem; border-radius: 8px;` and SHALL highlight on hover with `background: rgba(255,255,255,0.05);`.
8. THE icon SHALL have `aria-hidden="true"` (type is already conveyed by the group heading).

---

## Edge Cases

### Skeleton Loaders
- **Slow connection (>5s)**: Skeleton remains visible until content loads; no timeout
- **API failure**: Skeleton is replaced with error message (existing error handling)
- **Cached content**: Skeleton may flash briefly (<100ms); acceptable

### Empty States
- **Filters applied but no results**: Show "No products match your filters" with "Clear filters" CTA
- **Collection exists but has no products**: Show "This collection is empty" with "Browse other collections" CTA
- **Search with special characters**: Escape query string in "No results for '{term}'" message

### Keyboard Navigation
- **No hotspots in room**: Canvas remains focusable but Tab does nothing (announce "No hotspots in this room")
- **Hotspot removed during focus**: Move focus to next available hotspot or canvas
- **Panel opens during hotspot focus**: Focus moves to panel close button (existing behavior)

### Active Filter Chips
- **All filters removed**: Hide chip bar entirely
- **Filter state corrupted in sessionStorage**: Silently ignore and start fresh
- **Filter applied but collection has no products**: Show empty state with "Clear filters" CTA

### Availability Badges
- **Product has variants with mixed availability**: Show "In Stock" if ANY variant is available
- **Inventory data unavailable**: Hide badge (fail silently)

### Loading States
- **Content loads instantly (<50ms)**: Skip fade animation (no flash)
- **User closes panel during load**: Cancel fetch and cleanup

### Search Result Hierarchy
- **Zero results in a group**: Hide that group entirely (don't show empty heading)
- **Only one result type**: Still show icon and group heading for consistency

---

## Non-Functional Requirements

### Performance
- Skeleton loaders SHALL NOT increase bundle size by more than 2KB
- Empty states SHALL NOT increase bundle size by more than 1KB
- All animations SHALL run at 60fps on mid-range devices

### Accessibility
- All new interactive elements SHALL have proper ARIA labels
- All animations SHALL respect `prefers-reduced-motion`
- All color contrasts SHALL meet WCAG 2.2 Level AA (4.5:1 for normal text)
- Keyboard navigation SHALL follow logical tab order

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+
- Graceful degradation for older browsers (no skeleton, static empty states)

### Localization
- All user-facing strings SHALL use the `| t` filter
- All new locale keys SHALL be added to `locales/en.default.json`
- All locale keys SHALL follow the `sections.immersive_store.*` namespace convention

---

## Success Criteria

1. All 7 improvements are implemented and working
2. No regressions in existing functionality
3. All animations respect `prefers-reduced-motion`
4. All interactive elements have proper ARIA labels
5. All new strings use `| t` filter
6. Manual QA passes on Chrome, Firefox, Safari (desktop + mobile)
7. Lighthouse Accessibility score remains ≥95

---

## Out of Scope

- Color contrast audit (separate task)
- Alternative 2D navigation for WebGL fallback (separate task)
- Wishlist context metadata (separate task)
- Visual weight adjustments (separate task)
- Room texture loading progress bar (separate task)
