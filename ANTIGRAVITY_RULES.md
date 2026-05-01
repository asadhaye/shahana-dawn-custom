# ANTIGRAVITY - 3D Immersive Shopify Theme Rules
## Project Identity
**Project**: Shahana 3D Immersive Store
**Theme**: Dawn Custom (Luxury Pakistani Women's Fashion)
**Agent**: Antigravity
---
## Brand Essence
Shahana represents the pinnacle of luxury Pakistani fashion—where heritage craftsmanship meets contemporary elegance. Every interaction should feel like stepping into an exclusive atelier where time slows, fabrics whisper, and beauty is measured in thread counts and generations of artistry.
### Design DNA
- **Palette**: Gold, maroon, emerald, ivory, midnight blue, blush rose
- **Materials**: Silk, chiffon, organza, velvet, jamawar, cambai
- **Mood**: Intimate, opulent, unhurried, ceremonial
- **Typography**: Elegant serifs, refined weights, generous tracking
---
## 3D Immersive Store Architecture
### Room System
| Room | Purpose | Navigation |
|------|---------|------------|
| `storefront` | Entry portal | Start Experience |
| `lounge` | Main hub | 3 category branches |
| `designer_houses` | Designer collections | Suffuse, Soraya, Saad Bin Shahzad |
| `occasions` | Event-based shopping | Eid, Bridal, Formals, Casual |
| `featured_collections` | Seasonal showcases | SS5, Luxury Pret, Soraya Eid |
| `*_editorial` | Brand storytelling | Editorial content rooms |
### Shopping Journey
```
Entry → Lounge → Room → Collection Panel → Product Panel → Cart
```
---
## Technical Foundation
### Core Files
- `dawn/assets/immersive-store.js` (6800+ lines) - Three.js parallax engine
- `dawn/snippets/immersive-*.liquid` - UI components
- `dawn/sections/immersive-*.liquid` - Layout sections
### Three.js Implementation
- **Renderer**: WebGLRenderer with antialiasing
- **Camera**: OrthographicCamera for 2D parallax
- **Textures**: LRU cache (5 max), WebP format
- **Performance**: RAF-throttled resize, reduced motion support
### Texture Specifications
| Type | Desktop | Mobile | Quality |
|------|---------|--------|---------|
| Base | 1600px | 900px | 75% |
| Depth | 1600px | 900px | 60% (grayscale) |
---
## Hotspot System
### Hotspot Types
```javascript
{ targetRoom: 'room_key' }           // Navigate between rooms
{ targetCollection: 'handle' }      // Open collection panel
{ targetEditorialRoom: 'name' }      // Open editorial content
```
### Position Format
- Desktop: `x: 0-100, y: 0-100` (percentage)
- Mobile: `mobileX: 0-100, mobileY: 0-100`
### Label Guidelines
- Max 2-3 words
- Displayed as tooltip on hover
- Avoid overlapping hotspots (min 15% spacing)
---
## Room Configuration
### Adding a New Room
1. Define in `STORE_ROOMS`:
```javascript
room_name: {
  baseTextureUrl: '...',
  mobileBaseTextureUrl: '...',
  depthMapUrl: '...',
  mobileDepthMapUrl: '...',
  hotspots: [...]
}
```
2. Use JSON override for texture changes (never modify URLs directly)
3. Ensure depth map aligns with base texture for parallax effect
---
## Analytics Tracking
### Events (trackImmersiveEvent)
| Event | Trigger |
|-------|--------|
| `room_enter` | User enters room |
| `hotspot_click` | User clicks hotspot |
| `collection_open` | Panel opens |
| `product_view` | Product details |
| `add_to_cart` | Purchase action |
| `wishlist_toggle` | Save/unsave |
| `friction_point` | Exit without action |
### Friction Points Monitored
- Panel closed without action
- Back to 2D from room
- Navigation abandoned
- Empty collection exit
---
## Accessibility
- Reduced motion support (`prefers-reduced-motion`)
- Keyboard navigation for hotspots
- Mobile-optimized touch targets (min 44px)
- High contrast labels on dark textures
---
## Performance Budget
- Texture size: < 500KB (desktop), < 200KB (mobile)
- Cache limit: 5 textures (LRU eviction)
- Animation: 60fps target, graceful degradation
- Initial load: < 3s on 4G connection
---
## Canvas Image Requirements
### Room Base Images
For each room, base images must:
1. Follow **Shahana luxury aesthetic** (heritage Pakistani fashion)
2. Feature **warm, intimate lighting** (candlelight, golden hour)
3. Include **strategic negative space** for hotspot placement
4. Align **depth map zones** with visual focal points
5. Use **rich fabric textures** and traditional motifs
### Image Style Guide
- Warm amber/gold tones
- Soft focus, shallow depth of field
- Ornate details (gharara, churidar, dupatta styling)
- Subtle gold filigree or embossed patterns
- Intimate scale (not editorial/loud)
---
## Tech Stack
- **Three.js** r150 - WebGL parallax
- **Liquid** - Shopify templating
- **Vanilla JS** - No framework dependencies
- **CSS Variables** - Theme customization
---
## Shopify Resources
- **Store**: shahana
- **Theme**: Dawn custom
- **CDN**: `https://cdn.shopify.com/s/files/1/0594/0435/3692/files/`
- **Storefront GraphQL**: `https://shahana.myshopify.com/api/2024-01/graphql.json`
---
*Antigravity rules - Shahana 3D Immersive Store*
*Updated: April 2026*
