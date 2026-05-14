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
  - `npx jest tests/glass-panel.property.test.js -t "opens product panel" --forceExit`

Build note: there is no separate bundling/build pipeline in this codebase.

## High-level architecture
### Theme shell and script loading
- `layout/theme.liquid` is the global shell.
- It conditionally loads `assets/three.min.js` and `assets/immersive-store.js` only on `page.immersive`.
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
- `assets/immersive-store.js` is the monolithic runtime engine:
  - Base room map (`STORE_ROOMS`)
  - Merge of room settings from `#immersive-rooms-config`
  - Three.js scene + shader transitions
  - Hotspots, room navigation, guided mode, onboarding, wishlist, preference state
  - On-demand loading of section HTML for collection/product/editorial surfaces
  - Re-init hooks for Theme Editor (`shopify:section:load`)

### On-demand panel surfaces
- Collection panel section: `sections/glass-panel.liquid`
- Product panel section: `sections/glass-product.liquid`
- 2D→3D bridge CTA snippet: `snippets/immersive-bridge-btn.liquid`

## Data/state model to preserve
- Storage keys used by immersive flow include:
  - `immersive_preferred_mode`
  - `immersive_onboarding_seen`
  - `immersive_wishlist`
  - `immersive_state`
  - `immersive_nav_history`
- Section rendering calls in this codebase use `?sections=<section_id>` and inject the returned section HTML.

## Practical implementation constraints
- Keep immersive architecture intact (do not collapse immersive templates into standard Dawn flow).
- Prefer configuring room assets/hotspots via `immersive-canvas` settings and emitted JSON over hardcoding in JS.
- Keep user-facing text translatable using existing Liquid `| t` patterns.
- Follow Shopify developer guidance for theme app extension practices:
  - https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/build
