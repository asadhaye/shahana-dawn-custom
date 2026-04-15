# Requirements Document

## Introduction

This feature delivers six targeted polish improvements to the Shahana Collection immersive 3D store experience at `/pages/immersive`. The goal is to elevate the experience from functional to emotionally resonant — replacing abrupt transitions with calm motion, adding micro-animations to wishlist interactions, reframing CTAs with trust-building copy, unifying the microcopy voice, personalising the preference banner, and surfacing room suggestions based on browsing behaviour. All improvements must respect `prefers-reduced-motion`, use the `| t` filter for all strings, follow BEM naming under `.immersive-*`, and remain compatible with the existing Three.js + Dawn architecture.

---

## Glossary

- **Immersive_Store**: The WebGL 3D showroom at `/pages/immersive`, powered by `assets/immersive-store.js` and `sections/immersive-canvas.liquid`
- **Room_Badge**: The `#immersive-room-badge` overlay element that displays the current room name and guidance text
- **Hotspot**: An interactive DOM element rendered in `#ui-layer` that triggers room navigation or panel opening
- **goToRoom()**: The JavaScript function in `assets/immersive-store.js` responsible for room transitions, driving the `uTransitionProgress` WebGL uniform
- **UI_Layer**: The `#ui-layer` DOM element that hosts all hotspot and overlay elements on top of the WebGL canvas
- **Wishlist_Panel**: The `#immersive-wishlist-panel` dialog element rendered by `sections/immersive-canvas.liquid`
- **_wishlistItems**: The in-memory array in `assets/immersive-store.js` that holds saved wishlist product objects
- **addToWishlist()**: The JavaScript function that adds a product to `_wishlistItems` and persists to localStorage
- **renderWishlistPanel()**: The JavaScript function that re-renders the wishlist panel DOM from `_wishlistItems`
- **Bridge_CTA**: The pill-shaped link rendered by `snippets/immersive-bridge-btn.liquid` that connects 2D pages to the 3D store
- **Preference_Banner**: The `#immersive-preference-banner` element in `layout/theme.liquid` shown on 2D pages when `immersive_preferred_mode = '3d'` is set in localStorage
- **Welcome_Toast**: A transient, non-blocking notification shown on first entry to the immersive store
- **Microcopy**: All user-facing UI strings within the immersive experience, stored in `locales/en.default.json` and accessed via the `| t` filter
- **Browsing_Signal**: A behavioural data point (collection viewed, product saved) stored in localStorage with no PII
- **Personalization_Indicator**: A subtle visual label on a hotspot indicating relevance based on browsing signals
- **Reduced_Motion**: The `prefers-reduced-motion: reduce` media query; all animations must be suppressed when active

---

## Requirements

### Requirement 1: Smooth Room Transitions

**User Story:** As a shopper navigating between rooms, I want transitions to feel calm and deliberate, so that the experience feels premium rather than jarring.

#### Acceptance Criteria

1. WHEN `goToRoom()` is called, THE Immersive_Store SHALL fade out the Room_Badge and all visible Hotspots in the current room over a duration of 200–300ms before the WebGL crossfade begins.
2. WHEN the `uTransitionProgress` uniform reaches 1.0 (WebGL crossfade complete), THE Immersive_Store SHALL fade in the Room_Badge and new Hotspots for the destination room over a duration of 200–300ms.
3. THE Immersive_Store SHALL apply a CSS easing function of `ease-in-out` or equivalent cubic-bezier to all UI layer fade transitions during room changes.
4. WHILE a room transition is in progress (`transitioning === true`), THE Immersive_Store SHALL suppress all Hotspot click interactions to prevent double-triggering.
5. IF `prefers-reduced-motion` is active, THEN THE Immersive_Store SHALL skip all CSS fade animations and apply UI layer changes immediately, while still completing the WebGL crossfade at its existing duration.
6. THE Immersive_Store SHALL complete the full transition sequence (fade-out UI → WebGL crossfade → fade-in UI) within 800–1100ms total under normal conditions.

---

### Requirement 2: Emotional Wishlist Polish

**User Story:** As a shopper saving pieces I love, I want the wishlist to feel warm and delightful, so that saving items feels like a meaningful act rather than a utility function.

#### Acceptance Criteria

1. WHEN `addToWishlist()` is called for a product, THE Immersive_Store SHALL play a heart-pulse animation on the wishlist icon button (`data-wishlist-open`) lasting 400–600ms.
2. WHEN `addToWishlist()` is called for a product, THE Immersive_Store SHALL play a fly-to-wishlist animation where a visual token travels from the product card to the wishlist icon button over 400–600ms.
3. IF `prefers-reduced-motion` is active, THEN THE Immersive_Store SHALL skip the heart-pulse and fly-to-wishlist animations while still updating the wishlist badge count and panel content.
4. WHEN `renderWishlistPanel()` is called and `_wishlistItems` contains items, THE Immersive_Store SHALL group wishlist items by the room in which they were discovered, rendering a room label heading (e.g. "Found in: Lounge") above each group.
5. WHEN `addToWishlist()` is called, THE Immersive_Store SHALL record the `currentRoomKey` at the time of saving as the discovery room for that item.
6. WHEN `renderWishlistPanel()` is called and `_wishlistItems` is empty, THE Immersive_Store SHALL display the empty-state string `sections.immersive_store.wishlist.empty_encouragement` in place of the item list.
7. THE Wishlist_Panel empty state SHALL render the encouragement copy defined in `locales/en.default.json` under `sections.immersive_store.wishlist.empty_encouragement`.
8. THE Immersive_Store SHALL persist the discovery room alongside each wishlist item in localStorage so that room groupings survive page refresh.

---

### Requirement 3: Bridge CTAs with Trust

**User Story:** As a first-time visitor on a 2D page, I want the entry point to the 3D store to feel inviting and trustworthy, so that I feel confident clicking through.

#### Acceptance Criteria

1. THE Bridge_CTA SHALL display the label text sourced from `sections.immersive_journey_bridges.bridge_label_explore_3d` in `locales/en.default.json`, with the value "Explore in 3D".
2. THE Bridge_CTA SHALL display a subtext line sourced from `sections.immersive_journey_bridges.bridge_subtext` in `locales/en.default.json`, with the value "See curated rooms and collections in an interactive space."
3. WHEN a visitor enters the Immersive_Store for the first time in a session (no `immersive_onboarding_seen` key in localStorage), THE Immersive_Store SHALL display a Welcome_Toast after the scene has initialised.
4. THE Welcome_Toast SHALL display the string sourced from `sections.immersive_store.welcome_toast` in `locales/en.default.json`, with the value "You're in the 3D store — tap any hotspot to explore. Switch back anytime."
5. THE Welcome_Toast SHALL be rendered with `role="status"` and `aria-live="polite"` so screen readers announce it without interrupting the user.
6. THE Welcome_Toast SHALL auto-dismiss after 5000ms and SHALL be dismissible by the user at any time via a close button.
7. IF `prefers-reduced-motion` is active, THEN THE Welcome_Toast SHALL appear and disappear without fade or slide animations.
8. THE Welcome_Toast SHALL not be shown on subsequent visits within the same session once `immersive_onboarding_seen` is set in localStorage.

---

### Requirement 4: Unified Microcopy Tone

**User Story:** As a shopper using the immersive store, I want all UI text to feel warm, curated, and natural, so that the experience feels coherent and premium throughout.

#### Acceptance Criteria

1. THE Immersive_Store SHALL use the string `sections.immersive_store.add_to_edit` (value: "Add to my edit") in place of any "Add to cart" label within immersive UI surfaces (product panels, product cards).
2. THE Immersive_Store SHALL use the string `sections.immersive_store.action_done` (value: "Done") in place of any "Close" label on immersive panel close buttons.
3. WHEN a back-navigation action references a specific room, THE Immersive_Store SHALL use the string `sections.immersive_store.back_to_room` (value: "← Back to {{ room_name }}") with the room name interpolated.
4. THE Immersive_Store SHALL source all immersive UI strings from `locales/en.default.json` via the `| t` filter; no hard-coded English strings SHALL appear in Liquid templates or JavaScript.
5. THE Immersive_Store SHALL apply the updated string keys consistently across `sections/immersive-canvas.liquid`, `snippets/immersive-product-card.liquid`, and any section that renders immersive product panels.
6. WHERE a string key is updated, THE Immersive_Store SHALL add the new key to `locales/en.default.json` and remove or deprecate the old key to avoid orphaned translations.

---

### Requirement 5: Preference Banner as Personalisation

**User Story:** As a returning visitor who previously used the 3D store, I want the preference banner to feel like a warm welcome back rather than a generic prompt, so that returning to the 3D store feels like a feature I own.

#### Acceptance Criteria

1. THE Preference_Banner SHALL display the text sourced from `sections.immersive_journey_bridges.preference_banner_text` with the value "Welcome back — your 3D store is ready."
2. THE Preference_Banner CTA SHALL display the label sourced from `sections.immersive_journey_bridges.preference_banner_cta` with the value "Return to 3D Store".
3. THE Preference_Banner SHALL link to `/pages/immersive` (the canonical immersive URL) and SHALL NOT link to any legacy URL.
4. WHEN the dismiss button is activated, THE Preference_Banner SHALL animate out with a fade and slide-down transition over 200–300ms before being removed from the DOM.
5. IF `prefers-reduced-motion` is active, THEN THE Preference_Banner SHALL be removed from the DOM immediately on dismiss without animation.
6. THE Preference_Banner dismiss button SHALL restore focus to the next focusable sibling element after the banner is removed.
7. THE Preference_Banner SHALL be suppressed on the `page.immersive`, `index`, and `password` templates, consistent with existing behaviour.

---

### Requirement 6: Personalized Room Suggestions

**User Story:** As a returning shopper, I want the immersive store to subtly highlight rooms relevant to my browsing history, so that I can quickly find pieces aligned with my taste.

#### Acceptance Criteria

1. WHEN a shopper views a collection panel or product panel within the Immersive_Store, THE Immersive_Store SHALL record the associated room key as a browsing signal in localStorage under the key `immersive_browsing_signals`.
2. WHEN a shopper saves a product via `addToWishlist()`, THE Immersive_Store SHALL record the associated room key as a browsing signal in localStorage under the key `immersive_browsing_signals`.
3. THE Immersive_Store SHALL store browsing signals as an array of room key strings with no personally identifiable information.
4. WHEN `renderHotspots()` is called for a room, THE Immersive_Store SHALL read `immersive_browsing_signals` from localStorage and identify rooms with two or more recorded signals as "relevant".
5. WHEN a Hotspot targets a room identified as relevant, THE Immersive_Store SHALL render a Personalization_Indicator label sourced from `sections.immersive_store.based_on_saves` (value: "Based on your saves") adjacent to that Hotspot.
6. THE Personalization_Indicator SHALL be visually subtle — smaller than the hotspot label, using reduced opacity — and SHALL NOT obscure the hotspot interaction target.
7. THE Personalization_Indicator SHALL include `aria-label` text that communicates relevance to screen reader users.
8. IF localStorage is unavailable (e.g. private browsing), THEN THE Immersive_Store SHALL silently skip signal recording and indicator rendering without throwing errors.
9. THE Immersive_Store SHALL cap the `immersive_browsing_signals` array at 50 entries, discarding the oldest entries when the cap is reached, to prevent unbounded localStorage growth.
10. THE Immersive_Store SHALL store only room key strings in `immersive_browsing_signals`; product handles, collection handles, and any user-identifiable data SHALL NOT be stored in this key.
