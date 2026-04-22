# FAB Drag & Drop Feature

## Overview
The Floating Assistive Ball (FAB) is now **fully draggable**, allowing users to position it anywhere on the screen according to their preference. The position is automatically saved and persists across sessions.

## How It Works

### For Users

#### Desktop
1. **Hover** over the FAB → Cursor changes to "grab" hand
2. **Click and hold** the FAB button
3. **Drag** to desired position
4. **Release** → FAB snaps to nearest edge (left or right)
5. Position is **automatically saved**

#### Mobile/Touch
1. **Touch and hold** the FAB button
2. **Drag** to desired position
3. **Release** → FAB snaps to nearest edge
4. Position is **automatically saved**

### Visual Feedback

**Cursor States:**
- `cursor: grab` — Ready to drag
- `cursor: grabbing` — Currently dragging

**Hover Indicator:**
- Subtle dotted line appears on hover (shows it's draggable)
- Scale animation (1.08×) on hover

## Technical Implementation

### JavaScript Features

#### 1. Drag Detection
```javascript
var isDragging = false;
var hasMoved = false;
var dragStartX = 0;
var dragStartY = 0;
```

#### 2. Position Persistence
```javascript
// Save to localStorage
localStorage.setItem('immersive_fab_position', JSON.stringify({
  top: fab.style.top,
  right: fab.style.right,
  bottom: fab.style.bottom,
  left: fab.style.left,
  transform: fab.style.transform
}));

// Load on page load
var saved = localStorage.getItem('immersive_fab_position');
```

#### 3. Edge Snapping
```javascript
function snapToEdge(x, y) {
  // Calculates distance to each edge
  // Snaps to closest edge (left or right)
  // Maintains vertical position
}
```

#### 4. Click vs Drag Detection
```javascript
// Only toggle menu if not dragged
if (hasMoved) {
  hasMoved = false;
  return; // Don't toggle
}
// Otherwise, toggle menu
```

### CSS Features

#### 1. Cursor Feedback
```css
.immersive-fab__trigger {
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.immersive-fab__trigger:active {
  cursor: grabbing;
}
```

#### 2. Drag Indicator
```css
.immersive-fab__trigger::before {
  content: '';
  /* Dotted line indicator */
  opacity: 0;
}

.immersive-fab__trigger:hover::before {
  opacity: 1;
}
```

## Behavior Details

### Edge Snapping
- **Threshold**: 40px from edge
- **Snap to**: Left or right edge (whichever is closer)
- **Vertical**: Free positioning (respects header and footer)
- **Minimum distances**:
  - Top: 72px (below header)
  - Sides: 20px from edge
  - Bottom: 20px from bottom

### Position Constraints
```javascript
// Horizontal
left: Math.max(20, Math.min(x, viewportWidth - fabWidth - 20))

// Vertical
top: Math.max(72, Math.min(y, viewportHeight - fabHeight - 20))
```

### Default Position
If no saved position exists:
```css
top: 50%;
right: 1.25rem;
transform: translateY(-50%);
```

## User Experience

### Drag Scenarios

#### Scenario 1: Drag to Left
```
Before:                After:
┌─────────────────┐   ┌─────────────────┐
│            ┌──┐ │   │ ┌──┐            │
│            │ S│ │   │ │S │            │
│            └──┘ │   │ └──┘            │
└─────────────────┘   └─────────────────┘
```

#### Scenario 2: Drag to Top-Right
```
Before:                After:
┌─────────────────┐   ┌─────────────────┐
│                 │   │            ┌──┐ │
│            ┌──┐ │   │            │ S│ │
│            │ S│ │   │            └──┘ │
│            └──┘ │   │                 │
└─────────────────┘   └─────────────────┘
```

#### Scenario 3: Drag to Bottom-Left
```
Before:                After:
┌─────────────────┐   ┌─────────────────┐
│            ┌──┐ │   │                 │
│            │ S│ │   │ ┌──┐            │
│            └──┘ │   │ │S │            │
└─────────────────┘   └─────────────────┘
```

### Interaction Flow

```
1. User hovers FAB
   → Cursor: grab
   → Indicator: dotted line appears

2. User clicks and holds
   → Cursor: grabbing
   → Transition: disabled
   → isDragging: true

3. User moves mouse/finger
   → FAB follows cursor
   → hasMoved: true (if >5px)

4. User releases
   → FAB snaps to edge
   → Position saved to localStorage
   → Transition: re-enabled
   → isDragging: false

5. User clicks again (without dragging)
   → Menu toggles open/closed
```

## Edge Cases Handled

### 1. Click vs Drag
- **Problem**: User might accidentally drag when trying to click
- **Solution**: Only mark as "moved" if dragged >5px
- **Result**: Small movements still trigger click

### 2. Menu Open During Drag
- **Problem**: Dragging while menu is open could be confusing
- **Solution**: Disable drag when `isOpen === true`
- **Result**: Must close menu before dragging

### 3. Viewport Resize
- **Problem**: Saved position might be off-screen after resize
- **Solution**: Constraints ensure FAB stays within bounds
- **Result**: FAB repositions to valid area

### 4. Private Browsing
- **Problem**: localStorage might not be available
- **Solution**: Wrapped in try/catch with fallback
- **Result**: Drag still works, just doesn't persist

### 5. Touch Scrolling
- **Problem**: Dragging might trigger page scroll
- **Solution**: `e.preventDefault()` on touch events
- **Result**: Smooth drag without scroll interference

## Accessibility

### Keyboard Users
- FAB is still keyboard accessible (Tab to focus)
- Enter/Space to toggle menu
- Escape to close menu
- **Note**: Drag is mouse/touch only (standard pattern)

### Screen Readers
- ARIA labels remain functional
- Drag state doesn't affect announcements
- Position changes don't trigger announcements

### Reduced Motion
- Drag still works
- Snap animation respects `prefers-reduced-motion`
- No jarring movements

## Performance

### Optimizations
- ✅ No drag listeners until user interacts
- ✅ `requestAnimationFrame` not needed (native drag is smooth)
- ✅ Position saved only on drag end (not during)
- ✅ localStorage access wrapped in try/catch
- ✅ Event listeners use passive: false only where needed

### Memory
- Minimal overhead (~10 variables)
- No memory leaks (listeners on document, not created/destroyed)
- localStorage: ~200 bytes per saved position

## Browser Compatibility

Tested and working:
- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Firefox 88+ (Desktop & Mobile)
- ✅ Safari 14+ (Desktop & iOS)
- ✅ Edge 90+
- ✅ Samsung Internet 14+

## Troubleshooting

### FAB Won't Drag
1. Check if menu is open (close it first)
2. Verify JavaScript is enabled
3. Check browser console for errors
4. Try refreshing the page

### Position Not Saving
1. Check if localStorage is enabled
2. Verify not in private/incognito mode
3. Check browser storage quota
4. Clear localStorage and try again

### FAB Jumps on Release
- This is expected behavior (edge snapping)
- FAB snaps to nearest edge for consistency
- Vertical position is maintained

### FAB Off-Screen After Resize
- Constraints prevent this
- If it happens, drag FAB to reset position
- Or clear localStorage: `localStorage.removeItem('immersive_fab_position')`

## Future Enhancements

Potential improvements:
- [ ] Add "Reset Position" button in theme editor
- [ ] Allow disabling edge snapping (free positioning)
- [ ] Add position presets (top-left, top-right, etc.)
- [ ] Visual grid for precise positioning
- [ ] Keyboard drag support (arrow keys)
- [ ] Multi-position memory (per page)
- [ ] Drag tutorial on first visit

## Developer Notes

### Disabling Drag
To disable drag functionality:
```javascript
// Comment out these lines in initImmersiveBottomNav()
// fabTrigger.addEventListener('mousedown', onDragStart);
// fabTrigger.addEventListener('touchstart', onDragStart, { passive: false });
```

### Changing Snap Behavior
```javascript
// In snapToEdge() function
var snapThreshold = 40; // Change this value
// Higher = more aggressive snapping
// Lower = more free positioning
// 0 = no snapping
```

### Changing Default Position
```css
/* In assets/immersive-theme.css */
.immersive-fab {
  top: 50%;        /* Change vertical position */
  right: 1.25rem;  /* Change horizontal position */
  transform: translateY(-50%); /* Keep for centering */
}
```

## Summary

The FAB drag feature provides:
- ✨ **User Control**: Position FAB anywhere on screen
- 💾 **Persistence**: Position saved across sessions
- 🎯 **Smart Snapping**: Automatically aligns to edges
- 📱 **Touch Support**: Works on mobile and tablets
- ♿ **Accessible**: Doesn't break keyboard navigation
- 🚀 **Performant**: Smooth drag with no lag

Users can now customize their experience by placing the FAB exactly where they want it!
