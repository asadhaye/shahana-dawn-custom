# Product: Shahana Collection — Immersive Store

A Dawn-based Shopify Online Store 2.0 theme for a Pakistani luxury fashion brand. The core differentiator is a WebGL-powered 3D showroom built with Three.js, accessible from a standard 2D storefront via Bridge CTAs.

## What it is

- A luxury fashion e-commerce theme with an immersive, editorial, 3D-inspired shopping experience
- The 2D storefront (homepage `/`, collections, products, search, cart) is the primary SEO surface and default shopping experience
- The 3D experience lives at `/pages/immersive` — a dedicated page with the WebGL canvas, room navigation, and editorial overlays
- Shoppers can switch between 2D and 3D at any time via Bridge CTAs (2D→3D) and the mode switch pill in the 3D store header (3D→2D)
- Standard Dawn templates (`/products/`, `/collections/`) remain fully functional and independent

## The 2D ↔ 3D bridge system

- **2D→3D bridges:** Pill CTAs on collection, product, search, cart, collections list, blog, and article pages that deep-link into the 3D store with context (e.g. `/?open_collection=suffuse`)
- **3D→2D switch:** A mode switch pill in the immersive store header that returns the shopper to the standard 2D store
- **Preference banner:** After visiting the 3D store, a non-blocking banner appears on 2D pages offering to return the shopper to the immersive experience
- **Device-aware behavior:** `bridge-behavior.js` detects slow connections and reduced motion preferences and adjusts bridge messaging accordingly

## The immersive experience

- Single-canvas parallax rendering using Three.js + depth maps
- Room-based navigation: storefront → lounge → designer_houses / occasions / featured_collections
- Per-room editorial overlays ("living stories") with scroll parallax and view transitions
- Glassmorphism product panels loaded via Shopify's Section Rendering API
- Virtual Try-On widget for signed-in customers
- Wishlist manager (guest-friendly, localStorage-backed)
- URL deep-link parameters: `?open_product`, `?open_collection`, `?open_search`

## Target audience

Luxury fashion merchants — primarily Pakistani bridal/formal wear. The theme is designed to be generalisable to other luxury fashion brands via schema settings.

## Brand context

- Gold accent color: `#d4af37` (Pakistani gold)
- Aesthetic: editorial, immersive, high-end fashion
- Collections: designer houses (Suffuse, Soraya, Saad Bin Shahzad), occasions (Eid, Bridal, Formals), featured collections
