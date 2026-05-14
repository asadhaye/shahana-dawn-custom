# IMMERSIVE DESIGNERS — AI IDE IMPLEMENTATION CONTEXT

## Core Direction

Transform the current “timeline carousel” into:
- cinematic editorial commerce
- emotionally luxurious
- tactile and atmospheric
- calm, slow, museum-like
- premium fashion house energy

DO NOT rewrite architecture.
DO NOT rebuild section logic.
DO NOT change data flow.
DO NOT touch Shopify section rendering architecture unless required.

Focus only on:
1. typography
2. spacing
3. timeline affordance
4. motion refinement
5. luxury perception
6. discoverability

---

# PRIORITY 1 — TIMELINE UX REFINEMENT

## Current Problem
Timeline feels invisible and mechanical.

## Implement

### Marker Improvements
Increase visual hierarchy:
- font-size: 0.9375rem
- letter-spacing: 0.12em
- font-weight: 500
- subtle gold text glow
- smoother opacity states

Inactive markers:
- opacity: 0.45

Hover:
- opacity: 0.8

Active:
- opacity: 1

### Add Underline Animation
On hover and active:
- animated gold underline
- transform scaleX animation
- duration: 400ms
- ease: cubic-bezier(0.22,1,0.36,1)

### Timeline Rail
Current rail is too weak.

Increase:
- height from 2px → 4px
- add glow
- add subtle ambient gradient

### Active Thumb
Create floating luminous thumb:
- soft blur glow
- gold ambient halo
- scale slightly on active transition
- easing should feel organic

### Timeline Drag Feel
Reduce harshness:
- add interpolation smoothing
- add momentum easing
- no abrupt snapping

---

# PRIORITY 2 — HERO ATMOSPHERE

## Current Problem
Hero transitions feel generic and mechanical.

## Implement

### Hero Transition Layering
Separate transitions:
1. background image
2. overlay gradient
3. title
4. manifest
5. metadata

Each must animate independently.

### Transition Timing
DO NOT use identical durations.

Suggested:
- background: 1200ms
- overlay: 900ms
- title: 700ms
- manifest: 850ms
- metadata: 1000ms

### Motion Style
Use:
cubic-bezier(0.22,1,0.36,1)

Avoid:
- linear
- ease
- ease-in-out

### Background Motion
Replace static scale transition with:
- slow parallax drift
- subtle zoom breathing
- extremely low intensity

### Manifest Typography
Increase emotional readability:
- larger clamp range
- line-height: 1.6
- max-width reduced
- more negative space

### Hero Content Positioning
Move content slightly upward.
Current layout sits visually heavy.

Add:
- more breathing room above timeline
- stronger vertical rhythm

---

# PRIORITY 3 — PRODUCT DISCOVERABILITY

## Current Problem
Products feel disconnected and hidden.

## Implement

### Scroll Cue
At bottom of hero:
- animated “Explore Collection” indicator
- subtle bouncing motion
- ultra minimal

### Products Entrance
Products should fade upward on reveal:
- stagger cards
- slight translateY
- opacity transition
- once-only intersection animation

### Product Grid Rhythm
Increase spacing:
- more gap between cards
- more top padding

### Section Transition
Add atmospheric divider between hero and products:
- gradient fog fade
- dark-to-transparent cinematic transition

---

# PRIORITY 4 — PRODUCT CARD LUXURY PASS

## Keep Existing Architecture
Do not rewrite card system.

## Refine

### Glassmorphism
Reduce harshness:
- softer blur
- less opacity
- more elegant shadows

### Hover Motion
Current hover is too “ecommerce”.

Replace:
translateY(-4px)

With:
- subtle float
- minimal tilt
- softer shadow bloom

### Image Hover
Slow down hover transition.
Make it feel editorial, not marketplace.

### Typography
Product titles:
- slightly smaller
- more refined spacing
- less aggressive weight

Prices:
- quieter hierarchy
- avoid loud sale styling

### Buttons
Reduce visual aggression.

Buttons should feel:
- quiet luxury
- tactile
- understated

Avoid:
- bright hover fills
- excessive glow

---

# PRIORITY 5 — LOADING EXPERIENCE

## Current Problem
Loading state feels broken and cheap.

## Implement

### Skeleton States
Instead of text loading:
- shimmer placeholders
- image skeletons
- metadata lines
- card silhouettes

### Transition Into Loaded State
Cards should:
- fade in
- slight upward motion
- staggered reveal

---

# PRIORITY 6 — MICRO INTERACTIONS

## Wishlist
Add:
- soft pulse when saved
- tiny scale feedback
- smooth state morph

## Quick View
Reduce aggressiveness:
- lower opacity
- softer appearance
- slower reveal

## Availability Badge
Make more premium:
- less saturated
- softer contrast
- cleaner typography

---

# PRIORITY 7 — MOBILE EXPERIENCE

## Current Problem
Timeline becomes cramped.

## Implement

### Mobile Timeline
Convert into:
- horizontally scrollable luxury rail
- snap points
- momentum scrolling

### Hero Height
Reduce slightly on mobile:
- 100vh feels excessive
- use ~85vh

### Typography Scaling
Reduce aggressive clamps on small screens.

---

# PRIORITY 8 — PERFORMANCE + MOTION SAFETY

## Important

Maintain:
- prefers-reduced-motion support
- GPU-safe transforms
- no layout thrashing
- transform/opacity only

Avoid:
- expensive blur stacking
- excessive box shadows
- large repaint areas

---

# DO NOT TOUCH

- Shopify section rendering architecture
- collection loading logic
- Liquid data structure
- product form logic
- variant architecture
- cart logic
- accessibility structure
- reduced motion handling

---

# OVERALL TARGET FEEL

Reference emotional direction:
- luxury fashion editorial
- cinematic museum archive
- modern couture presentation
- quiet wealth
- tactile premium interfaces
- emotionally slow
- atmospheric
- not “tech startup”
- not “normal ecommerce”

The UI should feel like:
“walking through a luxury fashion installation online”
rather than
“browsing products on a store”