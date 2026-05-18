# Immersive Store Documentation

## Analytics Events

The immersive store tracks user interactions using both GA4 (via `dataLayer`) and Meta Pixel (via `fbq`). All events follow a consistent naming convention and payload structure.

### Event Naming Convention

- **GA4 Event Names**: All prefixed with `immersive_` (e.g., `immersive_room_viewed`)
- **Meta Pixel Events**: Standard events use Shopify's standard names (`AddToCart`), custom events use `Immersive` prefix with PascalCase (e.g., `ImmersiveRoomViewed`)

### Payload Structure

Every event includes these required parameters:

```javascript
{
  event_category: 'immersive_store',
  event_label: name,
  immersive_surface: 'immersive-3d-store',
  // ... event-specific parameters
}
```

### Event Inventory

| Event Name | GA4 Name | Meta Pixel | When It Fires | Parameters |
|------------|----------|------------|---------------|------------|
| **Room Navigation** | | | | |
| Room Viewed | `immersive_room_viewed` | `ImmersiveRoomViewed` | When entering a room (lounge, designer_houses, occasions, featured_collections) | `room_key` |
| Hotspot Clicked | `immersive_hotspot_clicked` | `ImmersiveHotspotClicked` | When user clicks a hotspot in the 3D scene | `target_type` ('room', 'collection', 'editorial'), `target_room_key`, `target_collection_handle`, `target_editorial_room` |
| **Panel Interactions** | | | | |
| Panel Opened | `immersive_panel_opened` | `ImmersivePanelOpened` | When opening product or collection panel | `panel_type` ('product', 'collection'), `product_handle`, `collection_handle` |
| Editorial Entered | `immersive_editorial_entered` | `ImmersiveEditorialEntered` | When entering an editorial overlay (designer_houses, occasions, featured_collections) | `room` |
| **E-Commerce Actions** | | | | |
| Add to Cart | `immersive_add_to_cart_checkout` | `AddToCart` | When product is added to cart via glass panel | `product_handle` |
| **Wishlist Actions** | | | | |
| Wishlist Add | `immersive_wishlist_add` | `ImmersiveWishlistAdd` | When product is added to wishlist | `product_handle`, `source` ('product_card', 'product_panel', 'wishlist_panel') |
| Wishlist Remove | `immersive_wishlist_remove` | `ImmersiveWishlistRemove` | When product is removed from wishlist | `product_handle`, `source` ('product_panel', 'wishlist_panel') |
| Wishlist Panel Opened | `immersive_wishlist_panel_opened` | `ImmersiveWishlistPanelOpened` | When wishlist panel is opened | `item_count` |
| Wishlist View Product | `immersive_wishlist_view_product` | `ImmersiveWishlistViewProduct` | When viewing product from wishlist panel | `product_handle` |
| **Guided Mode** | | | | |
| Guided Mode Entered | `immersive_guided_mode_entered` | `ImmersiveGuidedModeEntered` | When entering guided mode (clicking "Start Experience") | `room` |
| Guided Mode Exited | `immersive_guided_mode_exited` | `ImmersiveGuidedModeExited` | When exiting guided mode (clicking "Back to Lounge") | `room` |

### Implementation Details

#### GA4 Integration

Events are pushed to `window.dataLayer` with the format:

```javascript
window.dataLayer.push({
  event: 'immersive_' + name,
  ecommerce: null,
  immersive: payload
});
```

#### Meta Pixel Integration

Standard events use Shopify's standard Meta Pixel events:
- `AddToCart` for cart actions

Custom events use the naming pattern `Immersive + EventName`:
- `ImmersiveRoomViewed`
- `ImmersiveHotspotClicked`
- `ImmersivePanelOpened`
- `ImmersiveEditorialEntered`
- `ImmersiveWishlistAdd`
- `ImmersiveWishlistRemove`
- `ImmersiveWishlistPanelOpened`
- `ImmersiveWishlistViewProduct`
- `ImmersiveGuidedModeEntered`
- `ImmersiveGuidedModeExited`

#### Event Tracking Function

All events are tracked via the `trackImmersiveEvent(name, params)` function defined in `assets/immersive-store.js`:

```javascript
function trackImmersiveEvent(name, params) {
  params = params || {};
  var payload = Object.assign(
    {
      event_category: 'immersive_store',
      event_label: name,
      immersive_surface: 'immersive-3d-store',
    },
    params,
  );

  // GA4 via dataLayer
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'immersive_' + name, ecommerce: null, immersive: payload });
  }

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    switch (name) {
      case 'add_to_cart_checkout':
        window.fbq('track', 'AddToCart', payload);
        break;
      default:
        var metaName = 'Immersive' + name.replace(/_([a-z])/g, function (_, c) {
          return c.toUpperCase();
        });
        metaName = metaName.charAt(0).toUpperCase() + metaName.slice(1);
        window.fbq('trackCustom', metaName, payload);
    }
  }
}
```

### Testing Analytics

To verify event tracking:

1. Open browser DevTools → Network tab
2. Filter by `collect` (GA4) or `fbq` (Meta Pixel)
3. Perform actions in the immersive store
4. Verify events are sent with correct names and parameters

### Privacy & Compliance

- All tracking respects `prefers-reduced-motion` and user consent preferences
- No personal data is sent in event payloads
- Events are only tracked after Shopify's cookie consent is granted (handled by `cookie-banner.js`)
