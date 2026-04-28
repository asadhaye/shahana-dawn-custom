# Merchant Guide: Immersive Bridge System

Welcome to the Shahana Collection immersive theme. This guide explains how to configure and customize the bridge system that connects your 2D storefront to the 3D immersive experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Bridge Button Configuration](#bridge-button-configuration)
3. [Preference Banner Configuration](#preference-banner-configuration)
4. [Troubleshooting](#troubleshooting)
5. [FAQ](#faq)

---

## Overview

The **bridge system** is a set of features that seamlessly connect your standard 2D storefront to the 3D immersive store experience. It includes:

- **Bridge buttons** on collection, product, search, cart, and content pages that link to the 3D store
- **Preference banner** that appears on 2D pages after customers visit the 3D store
- **Device-aware messaging** that adapts to slow connections and accessibility preferences
- **Deep linking** that opens specific products or collections directly in the 3D store

### Key URLs

| Page | URL | Bridge Button |
|------|-----|----------------|
| Homepage | `/` | Optional (can be added via section) |
| Collections | `/collections/{handle}` | Yes (when collection has products) |
| Products | `/products/{handle}` | Yes |
| Search | `/search` | Yes (when results exist) |
| Cart | `/cart` | Yes (when cart has items) |
| Collections List | `/collections` | Yes |
| Blog/Articles | `/blogs/*` | Yes |
| 3D Store | `/pages/immersive` | N/A (canonical immersive URL) |

---

## Bridge Button Configuration

### What is a Bridge Button?

A bridge button is a call-to-action (CTA) that invites customers to explore your products in the 3D immersive store. It appears on 2D pages and links directly to the 3D experience.

### Where Bridge Buttons Appear

Bridge buttons are automatically rendered on:

1. **Collection pages** — when the collection has products
2. **Product pages** — always visible
3. **Search results** — when search returns results
4. **Cart page** — when cart has items
5. **Collections list** — always visible
6. **Blog/article pages** — always visible

### Customizing Bridge Button Text

Bridge button text is controlled via the theme's language settings. To customize:

1. Go to **Online Store → Settings → Languages**
2. Search for `immersive_journey_bridges`
3. Edit the following keys:

| Key | Default | Purpose |
|-----|---------|---------|
| `collection_cta` | "Explore in 3D Store" | Collection page CTA |
| `product_cta` | "Experience in 3D Store" | Product page CTA |
| `search_cta` | "View results in 3D Store" | Search results CTA |
| `cart_cta` | "Return to 3D Browsing" | Cart page CTA |
| `collections_list_cta` | "Explore in 3D Store" | Collections list CTA |
| `content_cta` | "Explore the 3D Store" | Blog/article CTA |

### Customizing Bridge Button Images

To add custom preview images to bridge buttons:

1. Go to **Online Store → Customize → Sections**
2. Select the section containing the bridge button (e.g., "Featured Collection")
3. Look for the **Bridge Button Image** setting
4. Upload a custom image (recommended: 400×300px or larger)
5. The image will display with responsive sizing on all devices

### Bridge Button Styling

Bridge buttons use the theme's accent color (#d4af37 by default). To customize:

1. Go to **Online Store → Customize → Colors**
2. Adjust the **Accent color** setting
3. Bridge buttons will automatically update

### Disabling Bridge Buttons

To disable bridge buttons on specific pages:

1. Go to **Online Store → Customize → Sections**
2. Select the section containing the bridge button
3. Look for **Show Bridge Button** toggle
4. Turn off to hide the bridge button

---

## Preference Banner Configuration

### What is the Preference Banner?

The preference banner is a non-blocking message that appears on 2D pages after a customer visits the 3D store. It says "Welcome back — your 3D store is ready" and offers a link to return to the 3D experience.

### When Does It Appear?

The preference banner appears when:

1. Customer visits the 3D store at `/pages/immersive`
2. Customer navigates back to a 2D page (collection, product, search, etc.)
3. The preference is stored in the browser (persists across sessions)

### When Does It NOT Appear?

The preference banner does NOT appear on:

- The 3D store page itself (`/pages/immersive`)
- The homepage (`/`)
- Password-protected pages

### Customizing Preference Banner Text

To customize the preference banner message:

1. Go to **Online Store → Settings → Languages**
2. Search for `immersive_journey_bridges`
3. Edit these keys:

| Key | Default | Purpose |
|-----|---------|---------|
| `preference_banner_text` | "Welcome back — your 3D store is ready." | Banner message |
| `preference_banner_cta` | "Return to 3D Store" | Button text |
| `preference_banner_dismiss` | "Dismiss" | Dismiss button text |

### Enabling/Disabling Preference Banner

The preference banner is enabled by default. To disable it:

1. Go to **Online Store → Customize → Theme Settings**
2. Look for **Immersive Store Preferences**
3. Toggle **Show Preference Banner** to off

### Auto-Dismiss Timeout

To automatically dismiss the preference banner after a delay:

1. Go to **Online Store → Customize → Theme Settings**
2. Look for **Immersive Store Preferences**
3. Set **Preference Banner Auto-Dismiss** (in seconds)
4. Set to `0` to disable auto-dismiss

---

## Device & Connection-Aware Messaging

### Slow Connection Warning

On slow connections (2G, 3G, or with data-saver enabled), the bridge button displays a warning:

**"3D store is optimized for faster connections"**

This warning:
- Does NOT prevent customers from accessing the 3D store
- Is informational only
- Respects the customer's choice to proceed

### Customizing Slow Connection Warning

To customize the warning message:

1. Go to **Online Store → Settings → Languages**
2. Search for `immersive_journey_bridges`
3. Edit `slow_connection_warning`

### Reduced Motion Support

If a customer has enabled "Reduce motion" in their OS settings:

- Bridge button animations are disabled
- Hover effects are simplified
- Transitions are instant instead of animated

This is automatic and requires no configuration.

---

## Troubleshooting

### Bridge Button Not Appearing

**Problem:** Bridge button doesn't show on collection/product pages.

**Solutions:**
1. Verify the section is enabled in **Online Store → Customize → Sections**
2. Check that **Show Bridge Button** toggle is ON
3. For collections: verify the collection has at least one product
4. For search: verify search results exist
5. Clear browser cache and refresh

### Preference Banner Not Appearing

**Problem:** Preference banner doesn't show after visiting 3D store.

**Solutions:**
1. Verify **Show Preference Banner** is enabled in theme settings
2. Check that you're on a 2D page (not `/pages/immersive` or `/`)
3. Verify browser allows localStorage (not in private browsing mode)
4. Clear browser cache and refresh
5. Visit the 3D store again to reset the preference

### Bridge Button Text Not Updating

**Problem:** Custom text doesn't appear on bridge buttons.

**Solutions:**
1. Go to **Online Store → Settings → Languages**
2. Verify you're editing the correct language (usually `en.default`)
3. Search for `immersive_journey_bridges` keys
4. Save changes and refresh the storefront
5. Clear browser cache if changes don't appear

### 3D Store Not Loading

**Problem:** Clicking bridge button doesn't open 3D store.

**Solutions:**
1. Verify `/pages/immersive` page exists in **Online Store → Pages**
2. Verify the page has the correct template assigned (`page.immersive`)
3. Check browser console for JavaScript errors
4. Verify WebGL is supported in your browser (Chrome 90+, Firefox 88+, Safari 14+)
5. Try a different browser to isolate the issue

---

## FAQ

### Q: Can I customize the bridge button color?

**A:** Yes! The bridge button uses your theme's accent color. Go to **Online Store → Customize → Colors** and adjust the **Accent color** setting.

### Q: Can I add bridge buttons to the homepage?

**A:** Yes! Add the "Immersive Bridge Button" section to your homepage via **Online Store → Customize → Sections**.

### Q: What happens if a customer has JavaScript disabled?

**A:** Bridge buttons are semantic `<a>` links, so they work without JavaScript. The 3D store will load normally.

### Q: Can I track how many customers use the bridge?

**A:** Yes! The theme sends analytics events to Google Analytics 4 (GA4) and Meta Pixel. Check your analytics dashboard for "immersive_bridge_click" events.

### Q: Does the preference banner work on mobile?

**A:** Yes! The preference banner is fully responsive and works on all devices.

### Q: Can I customize the preference banner position?

**A:** The preference banner appears at the top of the page by default. To customize position, edit the CSS in **Online Store → Customize → Custom CSS**.

### Q: What if a customer clears their browser cache?

**A:** The preference flag is stored in localStorage. If the customer clears their cache, the preference is reset and the banner won't appear until they visit the 3D store again.

### Q: Can I disable the bridge system entirely?

**A:** Yes! Go to **Online Store → Customize → Theme Settings** and toggle **Enable Immersive Bridge System** to off. This disables all bridge buttons and the preference banner.

---

## Support

For additional help:

1. Check the [Developer Guide](./DEVELOPER_GUIDE_BRIDGE_SYSTEM.md)
2. Review the [Troubleshooting Guide](./TROUBLESHOOTING_BRIDGE_SYSTEM.md)
3. Contact Shahana Collection support

---

**Last Updated:** April 28, 2026
**Version:** 1.0.0
