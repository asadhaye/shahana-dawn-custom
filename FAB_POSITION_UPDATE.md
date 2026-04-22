# FAB Position Update

## Change Summary
Moved the Floating Assistive Ball (FAB) from **bottom-right** to **middle-right** position to avoid conflicts with chat widgets (Inbox, Intercom, etc.).

## New Position

### Desktop & Tablet
```css
.immersive-fab {
  position: fixed;
  top: 50%;                    /* Vertically centered */
  right: 1.25rem;              /* 20px from right edge */
  transform: translateY(-50%); /* Perfect vertical centering */
}
```

### Mobile (≤768px)
```css
.immersive-fab {
  right: 0.875rem; /* 14px from right edge */
  /* top: 50% and transform remain the same */
}
```

## Visual Comparison

### Before (Bottom-Right)
```
┌─────────────────────────────┐
│                             │
│    Immersive Store          │
│                             │
│                             │
│                             │
│                             │
│                        ┌──┐ │
│  Tagline               │💬│ │ ← Chat widget
│                        └──┘ │
│                        ┌──┐ │
│                        │ S│ │ ← FAB (CONFLICT!)
│                        └──┘ │
└─────────────────────────────┘
```

### After (Middle-Right)
```
┌─────────────────────────────┐
│                             │
│    Immersive Store          │
│                             │
│                        ┌──┐ │
│                        │ S│ │ ← FAB (Centered)
│                        └──┘ │
│                             │
│                             │
│  Tagline                    │
│                        ┌──┐ │
│                        │💬│ │ ← Chat widget (No conflict)
│                        └──┘ │
└─────────────────────────────┘
```

## Benefits

✅ **No Conflicts**: FAB doesn't overlap with chat widgets, cookie banners, or other bottom-right elements
✅ **Always Visible**: Vertically centered means it's visible regardless of scroll position
✅ **Better Ergonomics**: Middle-right is easier to reach on tall screens
✅ **Consistent**: Same relative position on all screen sizes
✅ **Accessible**: Doesn't interfere with other interactive elements

## Technical Details

### Vertical Centering
Using `top: 50%` with `transform: translateY(-50%)` ensures perfect vertical centering:
- Works with any viewport height
- Maintains position during scroll
- No JavaScript required
- Smooth and performant

### Z-Index
```css
z-index: 120;
```
High enough to appear above most content but below modals (typically 1000+).

### Responsive Adjustments
- **Desktop**: 1.25rem (20px) from right
- **Mobile**: 0.875rem (14px) from right (slightly closer for easier thumb reach)

## Common Chat Widget Positions

Most chat widgets occupy the bottom-right corner:
- **Intercom**: Bottom-right, ~20px from edges
- **Drift**: Bottom-right, ~24px from edges
- **Zendesk**: Bottom-right, ~16px from edges
- **Tidio**: Bottom-right, ~20px from edges
- **LiveChat**: Bottom-right, ~20px from edges

By positioning the FAB in the middle-right, we avoid all these conflicts.

## Alternative Positions (If Needed)

If middle-right doesn't work for your use case, here are alternatives:

### Middle-Left
```css
.immersive-fab {
  left: 1.25rem;
  right: auto;
}
```

### Top-Right
```css
.immersive-fab {
  top: 5rem; /* Below header */
  transform: none;
}
```

### Bottom-Left
```css
.immersive-fab {
  bottom: 1.75rem;
  left: 1.25rem;
  right: auto;
  top: auto;
  transform: none;
}
```

## Testing Checklist

- [x] FAB appears in middle-right position
- [x] FAB is vertically centered on all screen sizes
- [x] FAB doesn't overlap with chat widgets
- [x] FAB doesn't overlap with cookie banners
- [x] FAB is accessible on mobile (thumb-friendly)
- [x] FAB maintains position during scroll
- [x] Action menu opens upward/downward correctly
- [x] Labels appear on the left (not cut off)

## Notes

- The FAB uses `position: fixed` so it stays in place during scroll
- The `transform: translateY(-50%)` is crucial for perfect centering
- On mobile, the FAB is slightly closer to the edge for easier reach
- The z-index (120) ensures it appears above content but below modals
- This position works well with most third-party widgets

## Merchant Communication

If merchants ask about the FAB position, explain:
> "The FAB is positioned in the middle-right of the screen to avoid conflicts with chat widgets and other elements that typically appear in the bottom-right corner. This ensures all interactive elements remain accessible and don't overlap."

## Future Enhancements

Potential improvements:
- [ ] Add position setting in theme editor (top/middle/bottom + left/right)
- [ ] Auto-detect chat widgets and adjust position dynamically
- [ ] Add drag-and-drop positioning (advanced)
- [ ] Remember user's preferred position (localStorage)
