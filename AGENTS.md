# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project type
- This repository is a Shopify Online Store 2.0 theme (Dawn-based) with two experiences:
  - Standard storefront (`templates/index.json`)
  - Immersive 3D storefront (`templates/page.immersive.json`)
- Treat Shopify CLI as the primary development workflow.

## Common commands
### Shopify CLI (primary)
- Start local theme dev server:
  - `shopify theme dev`
- Run theme checks/linting:
  - `shopify theme check`

### JS test workflow (Jest)
- Install test deps:
  - `npm install`
- Run all tests:
  - `npm test`
- Run immersive glass-panel focused tests:
  - `npm run test:run`
- Run a single test file:
  - `npx jest tests/wishlist-panel.test.js --forceExit`
- Run one test case by name:
  - `npx jest tests/glass-panel-property.test.js -t "opens product panel" --forceExit`

### Immersive JS bundle
- After editing any immersive source file, rebuild:
  - `npm run build:immersive`
- Build order: `immersive-state-manager.js` + `tick-manager.js` + `immersive-core.js` + `immersive-features.js` → `assets/immersive-bundle.js` → `assets/immersive-bundle.min.js`
- `theme.liquid` loads `immersive-bundle.min.js` on the immersive page template (single file, no separate script tags)

Build note: the immersive JS bundle is built via `npm run build:immersive`. Always rebuild after editing any source file.

## High-level architecture
### Theme shell and script loading
- `layout/theme.liquid` is the global shell.
- It conditionally loads `assets/three.min.js` and `assets/immersive-bundle.min.js` and `assets/immersive-init.js` only on `page.immersive`.
- It loads `assets/bridge-behavior.js` globally.
- It also shows the non-immersive preference banner when `localStorage.immersive_preferred_mode === '3d'`.

### Immersive page composition
- `templates/page.immersive.json` composes the immersive experience from sections.
- `sections/immersive-canvas.liquid` is the main immersive host:
  - Renders canvas and immersive overlays/panels
  - Emits room config JSON via `<script id="immersive-rooms-config" type="application/json">`
  - Exposes runtime text/settings through `data-*` attributes
- `sections/immersive-editorial.liquid` provides room-scoped editorial content (rendered on-demand in overlay).

### Runtime orchestration
- `assets/immersive-core.js` is the core runtime engine:
  - Base room map (`STORE_ROOMS`)
  - Merge of room settings from `#immersive-rooms-config`
  - Three.js scene + shader transitions
  - Hotspots, room navigation, guided mode, onboarding, wishlist, preference state
  - On-demand loading of section HTML for collection/product/editorial surfaces
  - Re-init hooks for Theme Editor (`shopify:section:load`)
- `assets/immersive-features.js` extends core with wishlist, panels, editorial, analytics
- `assets/immersive-state-manager.js` defines `window.ImmersiveTheme.state` (single source of truth for all state)
- `assets/tick-manager.js` defines `window.ImmersiveTheme.ticker` (single rAF loop for all animations)
- `window.ShahanaImmersive` is an alias for `window.ImmersiveTheme` (backward compatibility)
- All state access goes through `ImmersiveTheme.state.get()`/`set()` — no direct localStorage/sessionStorage
- All animation goes through `ImmersiveTheme.ticker.subscribe()` — no direct requestAnimationFrame

### On-demand panel surfaces
- Collection panel section: `sections/glass-panel.liquid`
- Product panel section: `sections/glass-product.liquid`
- 2D→3D bridge CTA snippet: `snippets/immersive-bridge-btn.liquid`

## Data/state model to preserve
- All state flows through `window.ImmersiveTheme.state` (StateManager)
- State paths used by immersive flow:
  - `preferredMode` (localStorage) — '3d' or null
  - `onboarding.seen` (localStorage) — boolean
  - `immersive.browsing.signals` (localStorage) — array of signal objects
  - `immersive.session.state` (sessionStorage) — runtime session state
  - `immersive.navigation.history` (sessionStorage) — room nav stack
  - `immersive.recommendations.dismissedRooms` (sessionStorage) — dismissal map
  - `immersive.ui.filters` (sessionStorage) — filter state
- Legacy keys (`immersive_preferred_mode`, `immersive_state`, etc.) are auto-migrated by the StateManager
- All animation flows through `window.ImmersiveTheme.ticker` (TickManager)
- Section rendering calls in this codebase use `?sections=<section_id>` and inject the returned section HTML.

## Practical implementation constraints
- Keep immersive architecture intact (do not collapse immersive templates into standard Dawn flow).
- Prefer configuring room assets/hotspots via `immersive-canvas` settings and emitted JSON over hardcoding in JS.
- Keep user-facing text translatable using existing Liquid `| t` patterns.
- Follow Shopify developer guidance for theme app extension practices:
  - https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/build
