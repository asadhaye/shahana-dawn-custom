# Requirements Document

## Introduction

This feature adds a new "Explore" room to the immersive 3D store that displays a scrollable grid of collection cards (2:3 portrait aspect ratio). The gallery rendering code already exists via `immersive-webgl-gallery-config.liquid`, so this feature primarily involves:

1. Adding the "explore" room to STORE_ROOMS configuration
2. Adding an "Explore" hotspot in the Lounge to navigate to the gallery
3. Implementing the gallery rendering logic in immersive-store.js to read and display the gallery config data
4. Fixing the canvas blocking issue so users can scroll to content below the immersive canvas

The Explore room will NOT use traditional background textures - instead, the collection images themselves create the visual environment on a dark background.

## Glossary

- **Explore_Room**: A new 3D room in the immersive store that displays a scrollable grid of collection cards
- **STORE_ROOMS**: JavaScript configuration object in `assets/immersive-store.js` that defines all available 3D rooms
- **Lounge**: The central hub room in the immersive store from which users navigate to other rooms
- **Hotspot**: An interactive clickable area in a 3D room that triggers navigation or actions
- **Collection_Card**: A visual card displaying a collection's image, title, and metadata
- **Collection_Panel**: A slide-out panel that displays collection details and products
- **Canvas_Wrapper**: The container element (`.immersive-store__canvas-wrapper`) that holds the 3D canvas
- **Immersive_Canvas**: The HTML5 canvas element (`#immersive-canvas`) that renders the 3D room
- **Base_Texture**: The primary image texture for a 3D room (desktop version)
- **Depth_Map**: A grayscale image that defines depth information for parallax effects
- **Mobile_Texture**: Mobile-optimized version of the base texture
- **Mobile_Depth_Map**: Mobile-optimized version of the depth map
- **Page_Scroll**: The ability for users to scroll vertically through the entire page content
- **Below_Canvas_Content**: Page sections that appear after the immersive canvas (Story rail, Exclusive carousel, Codex sections)

## Requirements

### Requirement 1: Explore Room Configuration

**User Story:** As a developer, I want to add the Explore room to the STORE_ROOMS configuration, so that the room is recognized by the immersive store system.

#### Acceptance Criteria

1. THE System SHALL add an "explore" key to the STORE_ROOMS object in `assets/immersive-store.js`
2. THE Explore_Room configuration SHALL NOT include baseTextureUrl or depthMapUrl properties (no background textures needed)
3. THE Explore_Room configuration SHALL include a `hotspots` array property for defining interactive areas (e.g., back to lounge)
4. THE Explore_Room SHALL use a solid dark background color instead of textured backgrounds
5. THE Explore_Room configuration SHALL include a flag or property indicating it's a "gallery" type room
6. WHEN the Explore_Room is accessed, THE System SHALL render the collection grid without loading background textures
7. THE Explore_Room SHALL be treated as a special room type that displays DOM content (collection grid) instead of WebGL parallax backgrounds

### Requirement 2: Explore Room Visual Design (No Background Textures)

**User Story:** As a user, I want the Explore room to display collection images as the primary visual content without a separate background texture, so that the collections themselves create the immersive environment.

#### Acceptance Criteria

1. THE Explore_Room SHALL NOT use traditional base textures or depth maps
2. THE Explore_Room background SHALL be a solid dark color (e.g., #050509 or #0a0a14)
3. THE collection images SHALL be the primary visual content displayed in a grid layout
4. THE collection images SHALL fill the viewport and create the visual environment
5. THE System SHALL display collection images in a masonry or grid layout similar to a museum gallery
6. THE collection images SHALL be the only textured content in the room (no parallax background)
7. THE Explore_Room SHALL focus on showcasing collection imagery rather than environmental textures

### Requirement 3: Lounge Hotspot for Explore Room

**User Story:** As a user, I want to see an "Explore" hotspot in the Lounge room, so that I can navigate to the Explore room.

#### Acceptance Criteria

1. THE System SHALL add an "Explore" hotspot to the Lounge room's hotspots array
2. THE Explore hotspot SHALL have a `targetRoom` property set to "explore"
3. THE Explore hotspot SHALL have a `label` property set to "Explore" (or localized equivalent)
4. THE Explore hotspot SHALL have an `x` coordinate of 50 (percentage)
5. THE Explore hotspot SHALL have a `y` coordinate of 50 (percentage)
6. THE Explore hotspot SHALL have a `mobileX` coordinate for mobile positioning
7. THE Explore hotspot SHALL have a `mobileY` coordinate for mobile positioning
8. WHEN a user clicks the Explore hotspot, THE System SHALL navigate to the Explore_Room
9. WHEN a user hovers over the Explore hotspot, THE System SHALL display visual feedback (scaling, glow, or label)

### Requirement 4: Collection Grid Display System

**User Story:** As a user, I want to see a scrollable grid of all store collections in the Explore room filling the entire viewport, so that I can browse all available collections in an immersive gallery environment.

#### Acceptance Criteria

1. WHEN the Explore_Room is loaded, THE System SHALL fetch all store collections
2. THE System SHALL display collections in a full-viewport grid layout (similar to the reference image showing a museum gallery)
3. THE Collection_Grid SHALL fill the entire viewport with collection images as the primary visual content
4. THE Collection_Grid SHALL be scrollable in all directions (up, down, left, right) like an infinite gallery
5. THE collection images SHALL be displayed at varying sizes to create visual interest (masonry or varied grid layout)
6. WHEN the collection count exceeds the viewport, THE System SHALL enable smooth scrolling
7. THE System SHALL display a loading indicator while fetching collections
8. IF collection fetching fails, THEN THE System SHALL display an error message to the user
9. THE Collection_Grid SHALL create an immersive gallery experience where images are the environment
10. THE background behind the grid SHALL be a solid dark color (e.g., #050509) to make images stand out

### Requirement 5: Collection Card Display

**User Story:** As a user, I want each collection to be displayed as a portrait card (2:3 aspect ratio), so that I can browse collections in a consistent gallery format.

#### Acceptance Criteria

1. THE System SHALL display each collection as a Collection_Card with 2:3 portrait aspect ratio
2. THE Collection_Card SHALL feature the collection's image as the primary visual element
3. THE Collection_Card SHALL include the collection's title overlaid or positioned below the image
4. THE Collection_Card SHALL maintain consistent sizing across all cards (no varied sizes)
5. THE Collection_Card SHALL use high-quality images (minimum 600px width)
6. WHEN a collection has no featured image, THE System SHALL display a placeholder image
7. THE Collection_Card SHALL include subtle hover effects (scale or glow) to indicate interactivity
8. THE Collection_Card SHALL use a subtle border or shadow to separate from the dark background

### Requirement 6: Collection Card Interaction

**User Story:** As a user, I want to click on a collection card to view its details, so that I can explore products within that collection.

#### Acceptance Criteria

1. WHEN a user clicks a Collection_Card, THE System SHALL open the Collection_Panel
2. THE Collection_Panel SHALL display the selected collection's details
3. THE Collection_Panel SHALL display products from the selected collection
4. THE System SHALL maintain the Explore_Room in the background while the panel is open
5. WHEN the Collection_Panel is closed, THE System SHALL return focus to the Explore_Room
6. THE System SHALL track which collection was opened for analytics purposes
7. WHEN a Collection_Card is focused via keyboard, THE System SHALL provide visual focus indicators

### Requirement 7: Responsive Grid Layout

**User Story:** As a user on different devices, I want the collection grid to adapt to my screen size with consistent 2:3 portrait cards, so that I have an optimal viewing experience.

#### Acceptance Criteria

1. THE System SHALL display 5-6 columns on desktop viewports (≥1024px width)
2. THE System SHALL display 3-4 columns on tablet viewports (768px - 1023px width)
3. THE System SHALL display 2 columns on mobile viewports (<768px width)
4. ALL Collection_Cards SHALL maintain 2:3 portrait aspect ratio across all breakpoints
5. THE System SHALL maintain consistent spacing between Collection_Cards across all breakpoints
6. THE Collection_Grid SHALL use CSS Grid for responsive layout
7. WHEN the viewport is resized, THE System SHALL adjust the grid layout without page reload

### Requirement 8: Canvas Blocking Issue Resolution

**User Story:** As a user, I want to scroll past the immersive canvas to view content below, so that I can access the Story rail, Exclusive carousel, and Codex sections.

#### Acceptance Criteria

1. THE System SHALL remove `height: 100vh` from the Canvas_Wrapper element
2. THE System SHALL remove `overflow: hidden` from the Canvas_Wrapper element
3. THE System SHALL allow Page_Scroll to continue past the Immersive_Canvas
4. WHEN a user scrolls down, THE System SHALL reveal Below_Canvas_Content
5. THE Immersive_Canvas SHALL remain functional during page scroll
6. THE 3D room parallax effects SHALL continue to work while the canvas is in viewport
7. WHEN the canvas scrolls out of viewport, THE System SHALL pause or optimize 3D rendering
8. THE System SHALL maintain proper z-index layering between canvas and below-canvas content

### Requirement 9: Canvas Scroll Behavior

**User Story:** As a user, I want the 3D canvas to behave naturally during page scroll, so that the experience feels cohesive.

#### Acceptance Criteria

1. WHEN the Immersive_Canvas is in viewport, THE System SHALL render 3D room animations
2. WHEN the Immersive_Canvas scrolls partially out of viewport, THE System SHALL continue rendering
3. WHEN the Immersive_Canvas is completely out of viewport, THE System SHALL pause rendering to conserve resources
4. THE System SHALL use Intersection Observer API to detect canvas viewport visibility
5. WHEN the user scrolls back up to the canvas, THE System SHALL resume rendering
6. THE System SHALL maintain smooth scroll performance (≥30fps) during canvas visibility transitions
7. THE parallax mouse effects SHALL only apply when the canvas is in viewport and user is hovering over it

### Requirement 10: Fixed Canvas Wrapper Removal

**User Story:** As a developer, I want to remove the `position: fixed` styling from the canvas wrapper, so that the canvas scrolls naturally with page content.

#### Acceptance Criteria

1. THE System SHALL change the Canvas_Wrapper position from `fixed` to `relative` or `static`
2. THE Canvas_Wrapper SHALL flow naturally in the document layout
3. THE Immersive_Canvas SHALL maintain its aspect ratio and dimensions
4. THE hotspots overlay SHALL remain properly positioned relative to the canvas
5. THE glass panel (collection/product panel) SHALL remain fixed and overlay the entire viewport
6. THE immersive header SHALL remain fixed at the top of the viewport
7. THE FAB (Floating Assistive Ball) SHALL remain fixed at the bottom of the viewport

### Requirement 11: Explore Room Content Loading

**User Story:** As a developer, I want the Explore room to efficiently load collection data, so that performance remains optimal.

#### Acceptance Criteria

1. THE System SHALL fetch collection data using the Shopify Storefront API or AJAX
2. THE System SHALL cache collection data for 5 minutes to reduce API calls
3. THE System SHALL implement lazy loading for collection images
4. WHEN a Collection_Card image enters the viewport, THE System SHALL load the image
5. THE System SHALL display a skeleton loader or placeholder while images load
6. THE System SHALL handle API rate limiting gracefully
7. IF the API request fails, THEN THE System SHALL retry up to 3 times with exponential backoff

### Requirement 12: Explore Room Accessibility

**User Story:** As a user with assistive technology, I want the Explore room to be fully accessible, so that I can navigate and interact with collections.

#### Acceptance Criteria

1. THE System SHALL provide keyboard navigation for the Collection_Grid
2. THE System SHALL announce the Explore_Room name when entering the room
3. THE Collection_Card SHALL be focusable via keyboard (Tab key)
4. THE Collection_Card SHALL be activatable via keyboard (Enter or Space key)
5. THE System SHALL provide ARIA labels for all Collection_Cards
6. THE System SHALL announce collection count to screen readers
7. THE System SHALL maintain focus management when opening and closing the Collection_Panel
8. THE Collection_Grid scrolling SHALL be accessible via keyboard (Arrow keys or Tab navigation)

### Requirement 13: Explore Room Navigation History

**User Story:** As a user, I want the back button to work correctly when navigating to and from the Explore room, so that I can easily return to previous rooms.

#### Acceptance Criteria

1. WHEN a user navigates to the Explore_Room, THE System SHALL add the room to navigation history
2. WHEN a user clicks the back button from the Explore_Room, THE System SHALL navigate to the previous room
3. THE System SHALL maintain the navigation history stack across room transitions
4. THE back button SHALL be visible when navigation history exists
5. THE back button SHALL be hidden when no navigation history exists
6. THE System SHALL update the back button state when entering the Explore_Room
7. THE navigation history SHALL persist during the session (sessionStorage)

### Requirement 14: Explore Room Analytics

**User Story:** As a store owner, I want to track user interactions in the Explore room, so that I can understand browsing behavior.

#### Acceptance Criteria

1. WHEN a user enters the Explore_Room, THE System SHALL fire an analytics event
2. WHEN a user clicks a Collection_Card, THE System SHALL track which collection was clicked
3. WHEN a user scrolls the Collection_Grid, THE System SHALL track scroll depth
4. THE System SHALL track time spent in the Explore_Room
5. THE System SHALL send analytics events to Google Analytics 4 (GA4) via dataLayer
6. THE System SHALL send analytics events to Meta Pixel (Facebook) via fbq
7. THE analytics events SHALL include room name, collection handle, and timestamp

### Requirement 15: Explore Room Performance

**User Story:** As a user, I want the Explore room to load and render quickly, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. THE Explore_Room textures SHALL load within 2 seconds on a 3G connection
2. THE Collection_Grid SHALL render within 1 second after room load
3. THE System SHALL maintain 60fps during grid scrolling on desktop
4. THE System SHALL maintain 30fps during grid scrolling on mobile
5. THE System SHALL use CSS transforms for scroll animations to leverage GPU acceleration
6. THE System SHALL debounce scroll event handlers to reduce CPU usage
7. THE System SHALL limit the number of visible Collection_Cards to optimize rendering (virtualization)

### Requirement 16: Canvas Scroll Performance Optimization

**User Story:** As a user, I want smooth page scrolling even with the 3D canvas active, so that the experience feels responsive.

#### Acceptance Criteria

1. THE System SHALL maintain 60fps page scroll performance on desktop
2. THE System SHALL maintain 30fps page scroll performance on mobile
3. THE System SHALL use `requestAnimationFrame` for canvas rendering
4. THE System SHALL throttle canvas render calls during rapid scrolling
5. WHEN the canvas is out of viewport, THE System SHALL reduce render frequency to 1fps or pause
6. THE System SHALL use `will-change` CSS property on scrolling elements to optimize compositing
7. THE System SHALL avoid layout thrashing by batching DOM reads and writes

### Requirement 17: Explore Room Error Handling

**User Story:** As a user, I want clear error messages if the Explore room fails to load, so that I understand what went wrong.

#### Acceptance Criteria

1. IF the Explore_Room textures fail to load, THEN THE System SHALL display an error message
2. IF the collection data fails to fetch, THEN THE System SHALL display a retry button
3. IF a Collection_Card image fails to load, THEN THE System SHALL display a placeholder image
4. THE error messages SHALL be user-friendly and non-technical
5. THE System SHALL log detailed error information to the browser console for debugging
6. THE System SHALL track error events in analytics for monitoring
7. IF the WebGL context is lost, THEN THE System SHALL attempt to restore it or show a fallback

### Requirement 18: Explore Room Localization

**User Story:** As a user in a non-English locale, I want the Explore room UI to be in my language, so that I can understand the interface.

#### Acceptance Criteria

1. THE Explore hotspot label SHALL use the localized string from theme translations
2. THE "Explore" room badge name SHALL use the localized string
3. THE Collection_Grid empty state message SHALL use the localized string
4. THE error messages SHALL use localized strings
5. THE loading indicator text SHALL use localized strings
6. THE System SHALL support RTL (right-to-left) languages for grid layout
7. THE System SHALL load locale-specific collection data if available

### Requirement 19: Explore Room Mobile Optimization

**User Story:** As a mobile user, I want the Explore room to work smoothly on my device, so that I can browse collections on the go.

#### Acceptance Criteria

1. THE System SHALL use mobile-optimized textures (lower resolution) on mobile devices
2. THE Collection_Grid SHALL support touch scrolling with momentum
3. THE Collection_Card SHALL respond to touch events (tap to open)
4. THE System SHALL disable hover effects on touch devices
5. THE System SHALL use mobile-appropriate spacing and sizing for Collection_Cards
6. THE System SHALL limit the number of initially loaded collections on mobile (lazy load more)
7. THE System SHALL optimize image sizes for mobile bandwidth (use srcset or responsive images)

### Requirement 20: Canvas Wrapper CSS Refactoring

**User Story:** As a developer, I want to refactor the canvas wrapper CSS to allow page scrolling, so that the implementation is clean and maintainable.

#### Acceptance Criteria

1. THE System SHALL update the `.immersive-store__canvas-wrapper` CSS class
2. THE canvas wrapper SHALL use `position: relative` instead of `position: fixed`
3. THE canvas wrapper SHALL remove the `height: 100vh` constraint
4. THE canvas wrapper SHALL remove the `overflow: hidden` constraint
5. THE canvas wrapper SHALL allow natural height based on content
6. THE Immersive_Canvas SHALL maintain its dimensions using `width: 100%` and `aspect-ratio` or explicit height
7. THE CSS changes SHALL not break existing room functionality (Lounge, Designer Houses, Occasions, Featured Collections)
