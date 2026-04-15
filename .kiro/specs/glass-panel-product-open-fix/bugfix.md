# Bugfix Requirements Document

## Introduction

Products are not opening in the glass panel (`#glass-panel`) when clicked from within the immersive store. This affects product cards rendered inside collection panels (via `sections/glass-panel.liquid`) and any other surface that calls `openProductPanel()`. The glass panel is the primary product detail surface in the 3D immersive experience at `/pages/immersive`, so this bug blocks the core purchase flow.

The panel is opened via `openProductPanel()` → `openGlassPanelWithSection()` → `fetchSectionHtml()`, which uses the Shopify Section Rendering API (`?sections=glass-product`) to fetch product detail HTML from `sections/glass-product.liquid`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks a product card (`[data-product-handle]`) inside the collection glass panel THEN the system does not open the product detail panel

1.2 WHEN `openProductPanel(handle, collectionHandle)` is called with a valid product handle THEN the system fails to render product content into `#glass-panel .immersive-store__panel-content`

1.3 WHEN `fetchSectionHtml()` is called for a product path with `sectionId = 'glass-product'` THEN the system either returns null, returns an error, or returns HTML that is not injected into the panel

1.4 WHEN a product link (`<a data-product-handle>` or `.immersive-product-card`) is clicked inside the glass panel THEN the system does not call `event.preventDefault()` and intercept the navigation, allowing a full page navigation or doing nothing

### Expected Behavior (Correct)

2.1 WHEN a user clicks a product card (`[data-product-handle]`) inside the collection glass panel THEN the system SHALL open the product detail panel with the correct product's content rendered inside `#glass-panel .immersive-store__panel-content`

2.2 WHEN `openProductPanel(handle, collectionHandle)` is called with a valid product handle THEN the system SHALL fetch `/products/{handle}?sections=glass-product`, inject the returned HTML into the panel content area, and call all panel setup functions (`setupVariantButtons`, `setupBuyNowForm`, `setupMediaThumbs`, etc.)

2.3 WHEN `fetchSectionHtml()` is called for a product path with `sectionId = 'glass-product'` THEN the system SHALL receive a valid JSON response containing the `glass-product` key and return its HTML string

2.4 WHEN a product link or card is clicked inside the glass panel THEN the system SHALL call `event.preventDefault()`, extract the `data-product-handle` attribute, and call `openProductPanel(handle, collectionHandle)`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a collection hotspot is clicked in the immersive store THEN the system SHALL CONTINUE TO open the collection glass panel with the correct collection's product grid

3.2 WHEN the glass panel close button is clicked THEN the system SHALL CONTINUE TO close the panel and restore focus to the triggering element

3.3 WHEN `openCollectionPanel(handle)` is called THEN the system SHALL CONTINUE TO fetch and render the collection grid via `sections/glass-panel.liquid`

3.4 WHEN `openSearchPanel(query)` is called THEN the system SHALL CONTINUE TO fetch and render search results via `sections/immersive-product-grid.liquid`

3.5 WHEN a product panel is open and the user clicks the back button THEN the system SHALL CONTINUE TO navigate back to the originating collection panel

3.6 WHEN the page loads with `?open_product={handle}` in the URL THEN the system SHALL CONTINUE TO open the product panel for that handle on init

3.7 WHEN `fetchSectionHtml()` is called for a collection path THEN the system SHALL CONTINUE TO return the correct HTML for `sections/glass-panel.liquid`
