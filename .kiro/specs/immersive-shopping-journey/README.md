# Immersive Shopping Journey — Complete Documentation

**Shahana Collection Immersive Store**  
**Status:** Ready for Implementation  
**Last Updated:** April 28, 2026

---

## Overview

This spec package documents the complete user shopping journey through the Shahana Collection immersive store — from entry point through product discovery, selection, and checkout.

The immersive store is a Three.js-powered 3D experience built on top of Shopify's Online Store 2.0 and the Dawn theme. It provides a seamless, accessible, and performant shopping experience that bridges 2D and 3D browsing.

---

## What's Included

### 📋 Documents

1. **[SPEC.md](SPEC.md)** — Complete specification
   - 9 journey stages with detailed flows
   - Architecture overview
   - State management and persistence
   - Performance optimization strategies
   - Accessibility requirements
   - Analytics signals
   - Error handling

2. **[TASKS.md](TASKS.md)** — Implementation tasks
   - 16 tasks organized in 4 phases
   - Task dependencies and timeline
   - Success criteria
   - Risk mitigation

3. **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** — Step-by-step guide
   - Phase 1: Core flow verification (2–3 hours)
   - Phase 2: Product discovery (4–5 hours)
   - Phase 3: Add-to-cart (2–3 hours)
   - Phase 4: Cart & checkout (2–3 hours)
   - Testing checklist
   - Common issues & solutions

4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Quick lookup
   - Key functions and their usage
   - Key elements and data attributes
   - Common patterns and code snippets
   - Debugging tips
   - Performance tips
   - Accessibility checklist

5. **[JOURNEY_MAP.md](JOURNEY_MAP.md)** — Visual maps
   - End-to-end journey flow
   - Component interaction diagram
   - State machine
   - Performance timeline

---

## Quick Start

### For Developers

1. **Read [SPEC.md](SPEC.md)** to understand the complete journey
2. **Review [JOURNEY_MAP.md](JOURNEY_MAP.md)** to visualize the flow
3. **Follow [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** to build each phase
4. **Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for quick lookups
5. **Reference [TASKS.md](TASKS.md)** for task tracking

### For Project Managers

1. **Review [TASKS.md](TASKS.md)** for timeline and dependencies
2. **Check [SPEC.md](SPEC.md)** for success metrics
3. **Use [JOURNEY_MAP.md](JOURNEY_MAP.md)** for stakeholder presentations

### For QA/Testing

1. **Use [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** testing checklist
2. **Reference [QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for debugging
3. **Check [SPEC.md](SPEC.md)** for accessibility requirements

---

## Architecture at a Glance

```
User enters /pages/immersive
    ↓
Canvas initializes (Three.js)
    ↓
User navigates rooms (hotspots)
    ↓
User explores editorial (overlays)
    ↓
User discovers products (collection grid)
    ↓
User views product detail (product panel)
    ↓
User adds to cart (feedback)
    ↓
User reviews cart (cart drawer)
    ↓
User proceeds to checkout (Shopify)
    ↓
Order confirmed
```

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| **Canvas** | `sections/immersive-canvas.liquid` | WebGL canvas, hotspots, overlays |
| **State Manager** | `assets/immersive/core/state-manager.js` | Session state, preferences |
| **Store Engine** | `assets/immersive-store.js` | Three.js scene, navigation |
| **Product Panel** | `sections/glass-product.liquid` | Product detail, variants, add-to-cart |
| **Product Grid** | `sections/immersive-product-grid.liquid` | Collection/search results |
| **Cart** | `sections/immersive-cart.liquid` | Cart drawer |
| **Editorial** | `sections/immersive-editorial.liquid` | Room-specific content |

---

## Journey Stages

### Stage 1: Entry & Onboarding
User navigates to `/pages/immersive` and sees the immersive store with optional onboarding overlay.

### Stage 2: Room Navigation
User clicks hotspots to navigate between rooms (storefront, lounge, designer_houses, occasions, featured_collections).

### Stage 3: Editorial Exploration (Optional)
User clicks editorial hotspots to view room-specific content (designers, occasions, featured collections).

### Stage 4: Product Discovery
User clicks collection links to view product grids in the glass panel.

### Stage 5: Product Detail & Selection
User clicks product cards to view product detail with variants, media, and add-to-cart.

### Stage 6: Add to Cart & Feedback
User selects variant and quantity, clicks "Add to Cart", sees success/error feedback.

### Stage 7: Cart Review
User clicks cart icon to open cart drawer, reviews items, adjusts quantities.

### Stage 8: Checkout
User clicks "Proceed to Checkout" and completes Shopify checkout.

### Stage 9: Post-Purchase & Return
User completes order and can return to immersive store to continue shopping.

---

## Key Features

### ✅ Seamless Navigation
- Hotspot-based room navigation
- Editorial overlays with scroll parallax
- Product panels with Section Rendering API
- Focus management and restoration

### ✅ Accessibility First
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Screen reader support (ARIA labels, roles, live regions)
- Focus indicators and focus trap
- Reduced motion support
- WCAG 2.1 AA compliance

### ✅ Performance Optimized
- Lazy texture loading
- Texture caching (last 2–3 rooms)
- Panel caching (by URL)
- Parallax throttling (60fps)
- Image optimization (responsive, lazy loading)

### ✅ State Management
- Session state persistence (sessionStorage)
- Preference persistence (localStorage)
- Focus restoration on panel close
- Navigation history (back button)

### ✅ Analytics Integration
- Room view signals
- Product view signals
- Add-to-cart signals
- Purchase signals
- Friction point tracking

### ✅ Error Handling
- WebGL fallback (static background)
- Network error retry
- Storage error graceful degradation
- User-friendly error messages

---

## Implementation Timeline

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| Phase 1 | Core flow & navigation | 12 hours | Ready |
| Phase 2 | Product discovery | 14 hours | Ready |
| Phase 3 | Add-to-cart | 7 hours | Ready |
| Phase 4 | Polish & optimization | 21 hours | Ready |
| **Total** | **16 tasks** | **54 hours** | **Ready** |

---

## Success Metrics

### Functional
- ✓ All 16 tasks completed and tested
- ✓ Complete user journey works end-to-end
- ✓ No console errors or warnings
- ✓ All features work on desktop, tablet, mobile

### Performance
- ✓ LCP < 2.5s
- ✓ FID < 100ms
- ✓ CLS < 0.1
- ✓ Lighthouse score ≥90

### Accessibility
- ✓ Keyboard-only navigation works
- ✓ Screen reader navigation works
- ✓ Lighthouse accessibility score ≥95
- ✓ WCAG 2.1 AA compliance

### Analytics
- ✓ Room view events tracked
- ✓ Product view events tracked
- ✓ Add-to-cart events tracked
- ✓ Purchase events tracked

---

## Getting Started

### Step 1: Read the Spec
Start with [SPEC.md](SPEC.md) to understand the complete journey and architecture.

### Step 2: Review the Journey Map
Check [JOURNEY_MAP.md](JOURNEY_MAP.md) to visualize the flow and state transitions.

### Step 3: Follow the Implementation Guide
Use [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) to build each phase step-by-step.

### Step 4: Reference Quick Lookup
Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for functions, elements, and patterns.

### Step 5: Track Tasks
Use [TASKS.md](TASKS.md) to track progress and manage dependencies.

---

## Key Concepts

### State Management
The immersive store maintains session state in `immersiveState`:
- `currentRoom` — current room key
- `mode` — 'showroom', 'editorial', or 'panel'
- `editorialRoom` — room key when in editorial mode
- `lastHotspot` — trigger element for focus restoration
- `guided` — guided sequence mode flag
- `navigationStack` — room history for back button

### Focus Management
When a panel opens:
1. Save trigger element: `immersiveState.lastHotspot = trigger`
2. Move focus to close button
3. Trap focus within panel (Tab cycles within panel)

When a panel closes:
1. Fade out panel
2. Restore focus to trigger element
3. Release focus trap

### Section Rendering API
Panels are fetched via Section Rendering API:
- Collection: `GET /collections/{handle}?section_id=glass-panel`
- Product: `GET /products/{handle}?section_id=glass-product`
- Editorial: `GET /pages/immersive?section_id=editorial_{room}`

Responses are cached by URL for performance.

### Analytics Signals
Key events tracked:
- `immersive_room_view` — user enters room
- `view_item` — user views product
- `add_to_cart` — user adds item to cart
- `purchase` — user completes order
- `friction_point` — user exits experience

---

## Common Tasks

### Opening a Panel
```javascript
openCollectionPanel('suffuse');
openProductPanel('silk-saree', 'suffuse');
openSearchPanel('bridal');
```

### Closing a Panel
```javascript
closePanel('glass-panel');
```

### Showing Feedback
```javascript
showFeedback('Added to cart!', 'success');
showFeedback('Error adding to cart', 'error');
```

### Updating Cart Count
```javascript
updateCartCount();
```

### Recording Analytics
```javascript
recordBrowsingSignal('designer_houses');
recordAddToCart(product);
trackFrictionPoint('back_to_2d_from_room', { from_room: 'lounge' });
```

---

## Debugging Tips

### Check State
```javascript
console.log('State:', immersiveState);
console.log('Session:', sessionStorage.getItem('immersive_state'));
console.log('Preference:', localStorage.getItem('immersive_preferred_mode'));
```

### Check Elements
```javascript
console.log('Canvas:', document.getElementById('immersive-canvas'));
console.log('Hotspots:', document.querySelectorAll('[data-hotspot]'));
console.log('Panel:', document.getElementById('glass-panel'));
```

### Check Network
```javascript
fetch('/collections/suffuse?section_id=glass-panel')
  .then(r => r.text())
  .then(html => console.log('Response length:', html.length));
```

---

## Testing Strategy

### Unit Tests
- State manager: save/load/clear state
- Preference manager: write/read/clear preference
- Hotspot keyboard navigation
- Parallax calculations
- Money formatting

### Integration Tests
- Room transition flow
- Editorial overlay open/close
- Product panel open/close
- Add-to-cart flow
- Cart drawer open/close

### E2E Tests
- Complete user journey: entry → product → cart → checkout
- Keyboard-only navigation
- Screen reader navigation
- Mobile touch interactions
- Reduced motion preferences

### Performance Tests
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Texture load time < 1s per room

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Mobile Chrome (latest)
- Mobile Safari (latest)

---

## Accessibility Compliance

- ✓ WCAG 2.1 Level AA
- ✓ Keyboard navigation
- ✓ Screen reader support
- ✓ Focus management
- ✓ Color contrast (≥4.5:1)
- ✓ Touch targets (≥44px × 44px)
- ✓ Reduced motion support

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| Lighthouse | ≥90 | TBD |
| Accessibility | ≥95 | TBD |

---

## Resources

### Internal
- [State Manager](../../assets/immersive/core/state-manager.js)
- [Store Engine](../../assets/immersive-store.js)
- [Canvas Section](../../sections/immersive-canvas.liquid)
- [Product Panel](../../sections/glass-product.liquid)
- [Product Grid](../../sections/immersive-product-grid.liquid)
- [Cart Section](../../sections/immersive-cart.liquid)
- [Editorial Section](../../sections/immersive-editorial.liquid)

### External
- [Shopify Online Store 2.0](https://shopify.dev/themes/architecture)
- [Dawn Theme](https://github.com/Shopify/dawn)
- [Three.js Documentation](https://threejs.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility](https://www.w3.org/WAI/)

---

## Support

For questions or issues:
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common patterns
2. Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for debugging
3. Check browser console for errors
4. Review [JOURNEY_MAP.md](JOURNEY_MAP.md) for flow understanding

---

## Next Steps

1. ✅ Read all documentation
2. ✅ Review existing code
3. ✅ Start Phase 1 implementation
4. ✅ Test thoroughly
5. ✅ Optimize performance
6. ✅ Deploy to production

---

**Ready to build? Start with [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)!**
