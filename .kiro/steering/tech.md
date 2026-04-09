# Tech Stack

## Platform

- Shopify Online Store 2.0
- Dawn theme (base) — respect Dawn's architecture and naming conventions
- Liquid templating language

## Key assets / libraries

- `assets/three.min.js` — Three.js (local copy; CDN blocked by Shopify MIME policy)
- `assets/immersive-store.js` — WebGL engine, room config, parallax, Section Rendering API calls, analytics, focus management, URL param handler, preference manager, wishlist manager (localStorage-backed), cookie consent banner, onboarding overlay
- `assets/immersive-theme.css` — global immersive styles, loaded on `page.immersive` only
- `assets/bridge-behavior.js` — device/connection-aware bridge behavior, loaded on all pages

## Template architecture

| Template | URL | Loads WebGL? | Header/Footer? |
|---|---|---|---|
| `index.json` | `/` | No | Yes |
| `page.immersive.json` | `/pages/immersive` | Yes | No |
| All other Dawn templates | `/collections/*`, `/products/*`, etc. | No | Yes |

The homepage is a standard 2D Dawn storefront. The 3D experience lives exclusively at `/pages/immersive`. Bridge CTAs on 2D pages link to the 3D store.

## CSS approach

- BEM naming throughout immersive components (`.immersive-*`, `.glass-product-section__*`, `.vtryon__*`, `.immersive-bridge-btn*`)
- Section/snippet-scoped CSS via `{% stylesheet %}` blocks
- Global immersive overrides in `assets/immersive-theme.css` (page.immersive only)
- Dawn CSS custom properties for design tokens (colors, spacing)

## JavaScript conventions

- Vanilla JS (no build step, no bundler)
- Section-scoped behavior via `{% javascript %}` blocks
- Target elements via `data-*` attributes, not class selectors
- `{% javascript %}` blocks run once per file — use data attributes for instance scoping
- Localized strings passed as `data-*` attributes on container elements, read in JS

## Script loading

```liquid
{{- comment -}} In layout/theme.liquid {{- endcomment -}}

{{- comment -}} WebGL — page.immersive only {{- endcomment -}}
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
{%- endif -%}

{{- comment -}} Bridge behavior — all pages {{- endcomment -}}
<script src="{{ 'bridge-behavior.js' | asset_url }}" defer="defer"></script>
```

`immersive-theme.css` is loaded conditionally on `page.immersive` only.

## Testing

- Jest + jsdom for unit/property-based tests
- `fast-check` for property-based testing
- Tests live in `tests/`

## Common commands

```bash
# Run tests (single pass)
npm test

# Run specific test file
npm run test:run

# Push theme to Shopify
shopify theme push

# Download Three.js (one-time setup)
curl -o assets/three.min.js https://threejs.org/build/three.min.js
```

## Analytics integrations

- GA4 via `window.dataLayer`
- Meta Pixel via `window.fbq`
- Both must be loaded before `immersive-store.js`

## Browser support

Chrome 90+, Firefox 88+, Safari 14+
