# Bugfix Requirements Document

## Introduction

The immersive store navigation system is broken due to modular JavaScript files not exposing their public functions to the global scope. After refactoring the codebase to extract functions into modular files under `assets/immersive/`, these modules fail to expose their APIs globally, causing navigation hotspots, search results, editorial overlays, and product/collection panels to be non-functional. The main `immersive-store.js` file and other modules expect functions like `goToRoom`, `openCollectionPanel`, `enterEditorialMode`, etc. to be globally available, but they are only defined locally within their respective modules.

This bug affects core user journeys: navigating between rooms, opening product/collection panels from search results, and accessing editorial content. The impact is severe as it renders the immersive store experience completely non-functional.

## Bug Analysis

### Bug 1: Global API Exposure

#### Current Behavior (Defect)

1.1 WHEN a user clicks a navigation hotspot in the immersive store THEN the system fails to execute `goToRoom()` and displays "TypeError: goToRoom is not a function" in the browser console

1.2 WHEN a user clicks a search result to navigate to a room or collection THEN the system fails to execute the navigation function and the click has no effect

1.3 WHEN a user clicks an editorial hotspot to open an editorial overlay THEN the system fails to execute `enterEditorialMode()` or `exitEditorialMode()` and displays "TypeError: enterEditorialMode is not a function" in the browser console

1.4 WHEN a user attempts to open a product panel from any context THEN the system fails to execute `openProductPanel()` and displays "TypeError: openProductPanel is not a function" in the browser console

1.5 WHEN a user attempts to open a collection panel from any context THEN the system fails to execute `openCollectionPanel()` and displays "TypeError: openCollectionPanel is not a function" in the browser console

1.6 WHEN `immersive-store.js` checks for the existence of `goToRoom` at line 1678 using `typeof goToRoom === 'function'` THEN the check returns false because the function is not globally accessible

1.7 WHEN `assets/immersive/features/search.js` at line 202 calls `goToRoom()` THEN the system throws a ReferenceError because the function is not in the global scope

1.8 WHEN `assets/immersive/editorial/editorial-mode.js` at line 210 calls `goToRoom('lounge')` THEN the system throws a ReferenceError because the function is not in the global scope

1.9 WHEN any modular file under `assets/immersive/` defines public functions THEN these functions remain locally scoped and are not accessible to other modules or the main `immersive-store.js` file

#### Expected Behavior (Correct)

2.1 WHEN a user clicks a navigation hotspot in the immersive store THEN the system SHALL successfully execute `goToRoom()` from the global scope and navigate to the target room without console errors

2.2 WHEN a user clicks a search result to navigate to a room or collection THEN the system SHALL successfully execute the appropriate navigation function and open the correct panel or navigate to the correct room

2.3 WHEN a user clicks an editorial hotspot to open an editorial overlay THEN the system SHALL successfully execute `enterEditorialMode()` or `exitEditorialMode()` from the global scope and display the editorial content without console errors

2.4 WHEN a user attempts to open a product panel from any context THEN the system SHALL successfully execute `openProductPanel()` from the global scope and display the product details without console errors

2.5 WHEN a user attempts to open a collection panel from any context THEN the system SHALL successfully execute `openCollectionPanel()` from the global scope and display the collection grid without console errors

2.6 WHEN `immersive-store.js` checks for the existence of `goToRoom` at line 1678 using `typeof goToRoom === 'function'` THEN the check SHALL return true because the function is globally accessible via `window.ImmersiveRoomManager.goToRoom`

2.7 WHEN `assets/immersive/features/search.js` at line 202 calls `goToRoom()` THEN the system SHALL successfully execute the function from the global scope without throwing errors

2.8 WHEN `assets/immersive/editorial/editorial-mode.js` at line 210 calls `goToRoom('lounge')` THEN the system SHALL successfully execute the function from the global scope and navigate to the lounge room

2.9 WHEN any modular file under `assets/immersive/` defines public functions THEN these functions SHALL be exposed to the global scope via a namespaced object (e.g., `window.ImmersiveModuleName`) following the pattern established by `state-manager.js`

2.10 WHEN all modular files expose their public APIs THEN the system SHALL maintain the existing pattern where `window.ImmersiveStateManager` is already properly exposed, ensuring consistency across all modules

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN `state-manager.js` exposes its API via `window.ImmersiveStateManager` THEN the system SHALL CONTINUE TO provide access to `saveState`, `loadState`, `clearState`, and other state management functions exactly as before

3.2 WHEN `immersive-store.js` initializes the immersive scene THEN the system SHALL CONTINUE TO execute the initialization sequence without modification to the core WebGL rendering logic

3.3 WHEN modular files define private helper functions that are not intended for external use THEN these functions SHALL CONTINUE TO remain locally scoped and not be exposed globally

3.4 WHEN the immersive store loads on the `/pages/immersive` template THEN the system SHALL CONTINUE TO load all JavaScript modules in the correct order via the existing script loading mechanism in `layout/theme.liquid`

3.5 WHEN users interact with features that do not depend on cross-module function calls (e.g., local event handlers, DOM manipulation within a single module) THEN these features SHALL CONTINUE TO function exactly as before

3.6 WHEN the browser console is opened during normal operation of fixed functionality THEN the system SHALL CONTINUE TO show no errors related to module loading or initialization

3.7 WHEN the theme editor is used to customize the immersive store THEN the system SHALL CONTINUE TO support live preview and section reloading without breaking the global API exposure

3.8 WHEN the immersive store is accessed on mobile devices THEN the system SHALL CONTINUE TO provide the same functionality with globally accessible APIs working identically to desktop

3.9 WHEN users navigate between rooms using methods that currently work (if any exist outside the broken hotspot system) THEN these methods SHALL CONTINUE TO function without modification

3.10 WHEN analytics tracking fires for immersive store events THEN the system SHALL CONTINUE TO track events correctly, with the global API exposure not interfering with existing analytics logic

### Bug 2: Missing Navigation History and Back Button

#### Current Behavior (Defect)

4.1 WHEN a user navigates through multiple rooms in sequence (e.g., `storefront → lounge → designer_houses → occasions`) THEN the system does not track the navigation path or order of visited rooms

4.2 WHEN a user is in the `occasions` room after navigating from `designer_houses` THEN clicking "Back to lounge" takes them to the lounge instead of returning to the previous room (`designer_houses`)

4.3 WHEN the `immersiveState` object is examined THEN it contains only `currentRoom` but no `previousRoom`, `roomHistory`, or `navigationStack` properties

4.4 WHEN the `_browsingContext.visitedRooms` array is examined THEN it contains a flat list of visited room keys without preserving the order or sequence of navigation

4.5 WHEN a user wants to navigate back to their previous room THEN there is no back button in the immersive header or UI to enable this action

4.6 WHEN a user navigates between rooms THEN the browser history API (`history.pushState`) is not used, preventing browser back button integration

4.7 WHEN the `goToRoom()` function is called THEN it updates `immersiveState.currentRoom` but does not push the previous room onto any navigation stack

4.8 WHEN breadcrumbs are rendered in product/collection panels THEN they show the panel hierarchy (Store / Collection / Product) but do not reflect the room navigation history

4.9 WHEN a user navigates from `lounge → designer_houses → lounge → occasions` THEN the system cannot distinguish between the two visits to the lounge or provide context-aware back navigation

4.10 WHEN the room manager's `goToRoom()` function at `assets/immersive/core/room-manager.js` line 222 is called THEN it saves state with `saveState({ room: roomKey, panel: null, product: null, collection: null })` but does not preserve navigation history

#### Expected Behavior (Correct)

5.1 WHEN a user navigates through multiple rooms in sequence (e.g., `storefront → lounge → designer_houses → occasions`) THEN the system SHALL track the complete navigation path in a `navigationStack` array preserving the order of visited rooms

5.2 WHEN a user is in the `occasions` room after navigating from `designer_houses` THEN a "Back" button or action SHALL return them to `designer_houses` (the previous room in the navigation stack)

5.3 WHEN the `immersiveState` object is examined THEN it SHALL contain a `navigationStack` property storing the sequence of visited rooms (e.g., `['storefront', 'lounge', 'designer_houses', 'occasions']`)

5.4 WHEN the `_browsingContext.visitedRooms` array is examined THEN it SHALL continue to exist for room recommendation purposes, separate from the navigation stack used for back navigation

5.5 WHEN a user wants to navigate back to their previous room THEN a back button SHALL be available in the immersive header (next to the mode switch button) that is enabled when `navigationStack.length > 1`

5.6 WHEN a user navigates between rooms THEN the system SHALL optionally integrate with the browser history API using `history.pushState` to enable browser back button support

5.7 WHEN the `goToRoom()` function is called THEN it SHALL push the current room onto the navigation stack before navigating to the new room, unless the navigation is a "back" action

5.8 WHEN breadcrumbs are rendered in product/collection panels THEN they SHALL continue to show the panel hierarchy without modification, as room navigation history is separate from panel breadcrumbs

5.9 WHEN a user navigates from `lounge → designer_houses → lounge → occasions` THEN the navigation stack SHALL contain `['lounge', 'designer_houses', 'lounge', 'occasions']` allowing accurate back navigation through each step

5.10 WHEN the room manager's `goToRoom()` function is called with a `fromBack` parameter set to true THEN it SHALL pop the current room from the navigation stack instead of pushing it, enabling proper back navigation

5.11 WHEN a user clicks the back button in the immersive header THEN the system SHALL call `goToRoom(previousRoom, false, true)` where the third parameter indicates this is a back navigation action

5.12 WHEN the navigation stack is empty or has only one room THEN the back button SHALL be visually disabled or hidden to prevent invalid navigation attempts

5.13 WHEN a user opens a panel (product/collection) from a room THEN the navigation stack SHALL remain unchanged, as panel navigation is separate from room navigation

5.14 WHEN a user closes a panel and returns to the room view THEN the navigation stack SHALL remain unchanged, preserving the ability to navigate back through rooms

5.15 WHEN the immersive store initializes and loads state from `sessionStorage` THEN it SHALL restore the navigation stack if it exists, allowing navigation history to persist across page refreshes within the same session

#### Unchanged Behavior (Regression Prevention)

6.1 WHEN the existing "Back to lounge" hotspots in `designer_houses`, `occasions`, and `featured_collections` rooms are clicked THEN they SHALL CONTINUE TO navigate directly to the lounge room as hardcoded, independent of the navigation stack

6.2 WHEN the `_browsingContext.visitedRooms` array is used for room recommendations THEN it SHALL CONTINUE TO function exactly as before, tracking which rooms have been visited for personalization purposes

6.3 WHEN the `trackRoomVisit()` function is called THEN it SHALL CONTINUE TO add rooms to `_browsingContext.visitedRooms` for recommendation logic without modification

6.4 WHEN breadcrumbs in product/collection panels are clicked THEN they SHALL CONTINUE TO navigate within the panel hierarchy (Store → Collection → Product) without affecting room navigation

6.5 WHEN the `syncVisitedRooms()` function updates the room picker UI THEN it SHALL CONTINUE TO use `_browsingContext.visitedRooms` to show visited room indicators

6.6 WHEN a user navigates to a room via a deep-link URL parameter (e.g., `?open_collection=suffuse`) THEN the system SHALL CONTINUE TO open the specified panel without modifying the navigation stack behavior

6.7 WHEN the guided mode sequence advances through rooms THEN it SHALL CONTINUE TO use `goToRoom()` for navigation, and the navigation stack SHALL track these automated transitions

6.8 WHEN editorial overlays are opened and closed THEN they SHALL CONTINUE TO use `enterEditorialMode()` and `exitEditorialMode()` without affecting the room navigation stack

6.9 WHEN the 3D→2D mode switch button is clicked THEN it SHALL CONTINUE TO navigate to the homepage and clear the immersive preference without modifying navigation history logic

6.10 WHEN the immersive store is accessed on mobile devices THEN the navigation stack and back button SHALL function identically to desktop, with the back button appropriately sized for touch targets
