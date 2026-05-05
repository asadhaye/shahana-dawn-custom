# Implementation Plan: Explore Room and Canvas Fix

## Overview

This implementation adds a new "Explore" room to the immersive 3D store that displays a scrollable grid of collection cards in 2:3 portrait aspect ratio. The Explore room uses a gallery-based rendering approach (DOM-based grid) instead of WebGL parallax textures. Additionally, this implementation fixes the canvas blocking issue by refactoring the canvas wrapper CSS from `position: fixed` to `position: relative`, allowing users to scroll to content below the immersive canvas.

**Key Implementation Areas**:
- Add "explore" room configuration to STORE_ROOMS
- Add "Explore" hotspot in Lounge room for navigation
- Implement gallery rendering system to read `window.immersiveWebglGalleryConfigs`
- Create responsive CSS Grid layout with 2:3 portrait collection cards
- Implement lazy loading with Intersection Observer
- Refactor canvas wrapper CSS to allow page scrolling
- Implement scroll performance optimization (pause rendering when canvas out of viewport)
- Add error handling and accessibility features

## Tasks

- [ ] 1. Add Explore room configuration to STORE_ROOMS
  - Add "explore" key to STORE_ROOMS object in `assets/immersive-store.js`
  - Set `isGalleryRoom: true` flag to indicate gallery-type room
  - Add hotspots array with "Back to Lounge" hotspot (x: 50, y: 90)
  - Do NOT include baseTextureUrl, depthMapUrl, mobileBaseTextureUrl, or mobileDepthMapUrl properties
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Add Explore hotspot to Lounge room
  - Add new hotspot object to `STORE_ROOMS.lounge.hotspots` array
  - Set properties: `x: 50, y: 50, label: 'Explore', targetRoom: 'explore', mobileX: 50, mobileY: 50`
  - Position can be adjusted based on visual design preferences
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 3. Implement gallery room detection and routing
  - [ ] 3.1 Modify `navigateToRoom()` function to detect gallery rooms
    - Check if `roomConfig.isGalleryRoom === true`
    - If gallery room, call `renderGalleryRoom(roomKey)` and hide WebGL canvas
    - If texture room, show WebGL canvas and load textures as usual
    - Update room badge and navigation history
    - _Requirements: 1.6, 1.7, 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 3.2 Implement canvas visibility toggle functions
    - Create `hideCanvas()` function to hide WebGL canvas for gallery rooms
    - Create `showCanvas()` function to show WebGL canvas for texture rooms
    - Ensure proper z-index and display properties
    - _Requirements: 1.6, 1.7_

- [ ] 4. Create gallery container and CSS structure
  - [ ] 4.1 Create gallery container element in DOM
    - Add `<div id="gallery-container" class="gallery-container"></div>` to appropriate location (within `#ui-layer` or as sibling)
    - Ensure container is positioned correctly relative to canvas
    - Set initial display to `none` (shown only when gallery room is active)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [ ] 4.2 Implement responsive CSS Grid layout
    - Create `.collection-grid` class with CSS Grid display
    - Desktop (≥1024px): `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`, gap: 1.5rem
    - Tablet (768px-1023px): `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`, gap: 1.5rem
    - Mobile (<768px): `grid-template-columns: repeat(2, 1fr)`, gap: 1rem
    - Set background to dark color (#050509 or #0a0a14)
    - Set min-height to 100vh to fill viewport
    - Add padding: 2rem (desktop/tablet), 1rem (mobile)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 4.3 Implement collection card CSS with 2:3 aspect ratio
    - Create `.collection-card` class with cursor pointer
    - Create `.collection-card__image-wrapper` with `aspect-ratio: 2 / 3`
    - Create `.collection-card__img` with `width: 100%, height: 100%, object-fit: cover`
    - Create `.collection-card__title` with overlay or below-image positioning
    - Add hover effects: scale(1.02) and subtle glow/shadow
    - Add focus styles for keyboard navigation
    - Add subtle border or shadow for separation from dark background
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5. Implement gallery rendering system
  - [ ] 5.1 Create `renderGalleryRoom(roomKey)` function
    - Read collection data from `window.immersiveWebglGalleryConfigs[roomKey]`
    - Handle missing or empty gallery data (call `showEmptyGalleryMessage()`)
    - Generate HTML for collection grid using array map
    - Each card should have: `data-collection-handle`, `data-index`, `data-src` for lazy loading
    - Inject HTML into gallery container
    - Call `setupLazyLoading()`, `attachCardClickHandlers()`, and `setupImageErrorHandling()`
    - Show gallery container and hide canvas
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 11.1, 11.2_
  
  - [ ] 5.2 Create `showEmptyGalleryMessage(roomKey)` function
    - Display user-friendly message: "No collections available in this gallery."
    - Add "Return to Lounge" button that calls `navigateToRoom('lounge')`
    - Use localized strings if available
    - _Requirements: 4.8, 17.1, 17.2, 17.3, 17.4, 18.3_

- [ ] 6. Implement lazy loading for collection images
  - [ ] 6.1 Create `setupLazyLoading(container)` function
    - Select all images with `data-src` attribute
    - Create Intersection Observer with `rootMargin: '50px'` (start loading 50px before viewport)
    - When image enters viewport: set `img.src = img.dataset.src`, remove `data-src`, unobserve
    - Handle browsers without Intersection Observer support (load all images immediately)
    - _Requirements: 11.3, 11.4, 11.5, 17.7_
  
  - [ ] 6.2 Create `setupImageErrorHandling(container)` function
    - Select all `.collection-card__img` elements
    - Add error event listener to each image
    - On error: replace with SVG placeholder, add error class, log warning
    - _Requirements: 5.6, 17.3_

- [ ] 7. Implement collection card interaction handlers
  - [ ] 7.1 Create `attachCardClickHandlers(container)` function
    - Select all `.collection-card` elements
    - Add click event listener: extract `collectionHandle` from `data-collection-handle`, call `openCollectionPanel(collectionHandle)`
    - Add keyboard event listener: handle Enter and Space keys to trigger click
    - Set `tabindex="0"` and `role="button"` for accessibility
    - Set `aria-label` with collection title
    - Track analytics event on click: `trackEvent('explore_room_collection_click', { collection, room })`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 12.3, 12.4, 12.5, 14.2_

- [ ] 8. Refactor canvas wrapper CSS to allow scrolling
  - [ ] 8.1 Update canvas wrapper CSS in `sections/immersive-canvas.liquid`
    - Change `.immersive-store__canvas-wrapper` from `position: fixed` to `position: relative`
    - Remove `inset: 0` property (not needed for relative positioning)
    - Remove `overflow: hidden` to allow page scrolling
    - Keep `width: 100%` and `height: 100vh` to maintain initial canvas size
    - Keep `background: #000` or appropriate background color
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_
  
  - [ ] 8.2 Verify existing room functionality after CSS changes
    - Test Lounge room parallax effects
    - Test Designer Houses room navigation and hotspots
    - Test Occasions room navigation and hotspots
    - Test Featured Collections room navigation and hotspots
    - Ensure hotspots remain properly positioned
    - Ensure glass panel (collection/product panel) remains fixed
    - Ensure immersive header remains fixed
    - Ensure FAB remains fixed
    - _Requirements: 10.4, 10.5, 10.6, 10.7, 20.7_

- [ ] 9. Checkpoint - Test navigation and basic gallery rendering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement canvas scroll performance optimization
  - [ ] 10.1 Create `setupCanvasScrollOptimization()` function
    - Select canvas element and canvas wrapper
    - Create Intersection Observer with thresholds: [0, 0.1, 0.5, 0.9, 1.0]
    - When canvas enters viewport: set `immersiveState.canvasVisible = true`, call `resumeRendering()`
    - When canvas exits viewport: set `immersiveState.canvasVisible = false`, call `pauseRendering()`
    - Handle browsers without Intersection Observer support (always render)
    - Call this function during initialization
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 17.7_
  
  - [ ] 10.2 Modify animation loop to respect canvas visibility
    - In `animate()` or main render loop, check `immersiveState.canvasVisible`
    - If canvas not visible: reduce render frequency to 1fps (use setTimeout with 1000ms)
    - If canvas visible: render at normal frequency (60fps using requestAnimationFrame)
    - Ensure smooth transitions when visibility changes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 16.5_
  
  - [ ] 10.3 Add canvas visibility state to immersiveState object
    - Add `canvasVisible: true` property to immersiveState
    - Add `currentRoomType: 'texture'` property ('texture' | 'gallery')
    - Add `galleryScrollPosition: 0` property to track scroll position
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 11. Implement accessibility features
  - [ ] 11.1 Add ARIA labels and roles to gallery elements
    - Set `role="region"` and `aria-label="Collection Gallery"` on gallery container
    - Set `role="button"` on collection cards (done in task 7.1)
    - Set `aria-label` with collection title on each card (done in task 7.1)
    - Add `aria-live="polite"` region for announcing collection count
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [ ] 11.2 Implement screen reader announcements
    - When entering Explore room, announce: "Explore room. [count] collections available."
    - Use `aria-live` region or focus management to trigger announcement
    - Ensure collection count is accurate and updated
    - _Requirements: 12.2, 12.6_
  
  - [ ] 11.3 Implement keyboard navigation for gallery
    - Ensure collection cards are focusable via Tab key (done in task 7.1)
    - Ensure collection cards are activatable via Enter/Space (done in task 7.1)
    - Maintain focus management when opening collection panel
    - Return focus to clicked card when panel closes
    - _Requirements: 12.1, 12.3, 12.4, 12.7, 12.8_

- [ ] 12. Implement navigation history management
  - [ ] 12.1 Update navigation history when entering Explore room
    - In `navigateToRoom()`, add room to navigation history stack
    - Store history in sessionStorage for persistence
    - Update back button visibility based on history
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 12.2 Implement back button functionality for Explore room
    - When back button clicked from Explore, navigate to previous room
    - Pop room from navigation history stack
    - Update back button state
    - _Requirements: 13.2, 13.3, 13.4, 13.5_

- [ ] 13. Implement analytics tracking
  - [ ] 13.1 Track Explore room entry event
    - Fire analytics event when user enters Explore room
    - Event name: `explore_room_enter`
    - Include: room name, timestamp
    - Send to GA4 via dataLayer and Meta Pixel via fbq
    - _Requirements: 14.1, 14.5, 14.6, 14.7_
  
  - [ ] 13.2 Track collection card click events
    - Fire analytics event when user clicks collection card (done in task 7.1)
    - Event name: `explore_room_collection_click`
    - Include: collection handle, room name, timestamp
    - Send to GA4 and Meta Pixel
    - _Requirements: 14.2, 14.5, 14.6, 14.7_
  
  - [ ] 13.3 Track scroll depth and time spent
    - Implement scroll depth tracking (25%, 50%, 75%, 100%)
    - Track time spent in Explore room (on entry and exit)
    - Fire events: `explore_room_scroll_depth`, `explore_room_time_spent`
    - _Requirements: 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ] 14. Implement error handling and edge cases
  - [ ] 14.1 Handle missing gallery configuration
    - Check if `window.immersiveWebglGalleryConfigs[roomKey]` exists (done in task 5.1)
    - Display empty state message if missing or empty (done in task 5.2)
    - Log warning to console for debugging
    - _Requirements: 17.1, 17.2, 17.5_
  
  - [ ] 14.2 Handle room navigation errors
    - In `navigateToRoom()`, check if room exists in STORE_ROOMS
    - Display error toast if room not found
    - Log error to console
    - _Requirements: 17.1, 17.4, 17.5_
  
  - [ ] 14.3 Handle collection panel load errors
    - In `openCollectionPanel()`, wrap API call in try-catch
    - Display error message in panel if fetch fails
    - Provide retry button
    - Track error event in analytics
    - _Requirements: 17.2, 17.3, 17.4, 17.6_

- [ ] 15. Implement localization support
  - [ ] 15.1 Add localized strings for Explore room UI
    - Add "Explore" hotspot label to theme translations
    - Add "Explore" room badge name to translations
    - Add empty state message to translations
    - Add error messages to translations
    - Add loading indicator text to translations
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ] 15.2 Support RTL languages for grid layout
    - Add CSS for RTL support using `[dir="rtl"]` selector
    - Ensure grid layout works correctly in RTL mode
    - Test with Arabic or Hebrew locale
    - _Requirements: 18.6_

- [ ] 16. Implement mobile optimizations
  - [ ] 16.1 Optimize gallery for mobile devices
    - Use mobile-appropriate spacing and sizing (done in task 4.2)
    - Support touch scrolling with momentum (native browser behavior)
    - Disable hover effects on touch devices using `@media (hover: none)`
    - Optimize image sizes for mobile bandwidth (use srcset or responsive images)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  
  - [ ] 16.2 Limit initial collection load on mobile
    - Detect mobile device (screen width or user agent)
    - Load first 20 collections initially on mobile
    - Implement "Load More" button or infinite scroll for remaining collections
    - _Requirements: 19.6_

- [ ] 17. Checkpoint - Test all functionality end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 18. Write unit tests for core functions
  - [ ]* 18.1 Test STORE_ROOMS configuration
    - Verify `explore` room exists in STORE_ROOMS
    - Verify `explore` room has `isGalleryRoom: true`
    - Verify `explore` room has no texture URLs
    - Verify `explore` room has hotspots array
    - Verify Lounge has "Explore" hotspot with correct properties
  
  - [ ]* 18.2 Test gallery rendering functions
    - Test `renderGalleryRoom()` with valid data
    - Test `renderGalleryRoom()` with empty data
    - Test `renderGalleryRoom()` with missing config
    - Verify correct HTML structure is generated
    - Verify collection cards have correct data attributes
  
  - [ ]* 18.3 Test lazy loading functionality
    - Test `setupLazyLoading()` creates Intersection Observer
    - Test images load when entering viewport (mock Intersection Observer)
    - Test images don't load when out of viewport
  
  - [ ]* 18.4 Test click handlers and keyboard navigation
    - Test collection card click opens panel
    - Test keyboard navigation (Enter/Space)
    - Test analytics tracking on click
  
  - [ ]* 18.5 Test canvas visibility optimization
    - Test Intersection Observer detects canvas visibility
    - Test rendering pauses when canvas out of viewport
    - Test rendering resumes when canvas enters viewport

- [ ]* 19. Write integration tests for navigation flow
  - [ ]* 19.1 Test navigation from Storefront to Lounge to Explore
    - Navigate from Storefront → Lounge → Explore
    - Verify Explore room displays collection grid
    - Navigate back to Lounge from Explore
    - Verify back button works correctly
  
  - [ ]* 19.2 Test gallery display and interactions
    - Verify collection cards render with correct images
    - Verify 2:3 aspect ratio is maintained
    - Verify responsive grid layout (desktop, tablet, mobile)
    - Verify lazy loading works (images load on scroll)
    - Click collection card and verify panel opens
  
  - [ ]* 19.3 Test canvas scrolling behavior
    - Verify canvas is visible on page load
    - Scroll down past canvas
    - Verify below-canvas content is accessible
    - Scroll back up and verify canvas is still functional

- [ ]* 20. Perform accessibility audit
  - [ ]* 20.1 Test keyboard navigation
    - Tab through collection cards
    - Verify focus indicators are visible
    - Press Enter/Space to open collection panel
    - Verify focus management when panel opens/closes
  
  - [ ]* 20.2 Test screen reader compatibility
    - Test with NVDA, JAWS, or VoiceOver
    - Verify room name is announced when entering Explore
    - Verify collection count is announced
    - Verify collection card labels are read correctly
  
  - [ ]* 20.3 Run automated accessibility tests
    - Run axe-core or WAVE on Explore room
    - Fix any WCAG 2.1 Level AA violations
    - Verify ARIA attributes are correct

- [ ]* 21. Perform cross-browser testing
  - [ ]* 21.1 Test on desktop browsers
    - Chrome (latest 2 versions)
    - Firefox (latest 2 versions)
    - Safari (latest 2 versions)
    - Edge (latest 2 versions)
    - Verify Intersection Observer support or graceful degradation
    - Verify CSS Grid layout works correctly
    - Verify aspect-ratio CSS property works or has fallback
  
  - [ ]* 21.2 Test on mobile browsers
    - Mobile Safari (iOS 14+)
    - Chrome Mobile (Android 10+)
    - Verify touch interactions work correctly
    - Verify responsive layout adapts properly
    - Verify performance is acceptable (30fps minimum)

- [ ]* 22. Perform performance testing
  - [ ]* 22.1 Measure load performance
    - Run Lighthouse audit on Explore room
    - Verify Time to First Collection Card Render < 1s
    - Verify Largest Contentful Paint (LCP) < 2.5s
    - Verify First Input Delay (FID) < 100ms
  
  - [ ]* 22.2 Measure scroll performance
    - Use DevTools Performance panel to measure scroll fps
    - Verify 60fps on desktop during scroll
    - Verify 30fps on mobile during scroll
    - Verify no layout thrashing (batch DOM reads/writes)
  
  - [ ]* 22.3 Check for memory leaks
    - Navigate between rooms multiple times
    - Use DevTools Memory profiler to check for leaks
    - Verify Intersection Observers are properly cleaned up
    - Verify event listeners are properly removed

- [ ] 23. Final checkpoint and documentation
  - Ensure all tests pass, ask the user if questions arise.
  - Update code comments for new functions
  - Document any configuration changes needed
  - Document any known limitations or browser compatibility issues

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests are not applicable for this feature (UI rendering and DOM manipulation)
- Unit tests and integration tests validate functionality and user flows
- The implementation uses JavaScript (existing codebase language)
- The gallery rendering system reads from `window.immersiveWebglGalleryConfigs` populated by `immersive-webgl-gallery-config.liquid`
- The canvas wrapper CSS change is critical for allowing page scrolling
- Intersection Observer is used for both lazy loading and scroll performance optimization
- All interactive elements must be keyboard accessible and have proper ARIA labels
- Analytics tracking is integrated throughout for monitoring user behavior
