# Test Phase 2: Editorial Overlays

**Quick testing guide for editorial overlay functions**

---

## Setup

1. Navigate to `/pages/immersive` in your browser
2. Open DevTools Console (F12)
3. You're ready to test!

---

## Test 1: Open Editorial Overlay

### In Browser Console:
```javascript
// Get a hotspot element to use as trigger
var hotspot = document.querySelector('[data-hotspot]');

// Open editorial overlay
enterEditorialMode('designer_houses', hotspot);
```

### Expected Result:
- Editorial overlay opens with designer houses content
- Overlay fades in smoothly
- Focus moves to close button
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof enterEditorialMode); // Should be 'function'

// Check if overlay exists
console.log(document.getElementById('immersive-editorial-overlay')); // Should exist

// Check if editorial section exists
console.log(document.querySelector('[data-room-key="designer_houses"]'));
```

---

## Test 2: Scroll Parallax

### In Browser:
1. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
2. Scroll down in the overlay
3. Watch parallax items move smoothly

### Expected Result:
- Parallax items move as you scroll
- Movement is smooth (60fps)
- No jank or stuttering
- No console errors

### If It Fails:
```javascript
// Check if parallax items exist
var overlay = document.getElementById('immersive-editorial-overlay');
console.log(overlay.querySelectorAll('[data-parallax-item]').length);

// Check if parallax is initialized
console.log(typeof initEditorialScrollParallax); // Should be 'function'
```

---

## Test 3: Close Editorial Overlay

### In Browser Console:
```javascript
// First open overlay
enterEditorialMode('designer_houses', hotspot);

// Then close it
exitEditorialMode();
```

### Expected Result:
- Overlay fades out
- Overlay hidden
- Focus returns to trigger hotspot
- Mode resets to 'showroom'
- No console errors

### If It Fails:
```javascript
// Check if function exists
console.log(typeof exitEditorialMode); // Should be 'function'

// Check if overlay is hidden
console.log(document.getElementById('immersive-editorial-overlay').hidden);
```

---

## Test 4: Keyboard Navigation (Escape)

### In Browser:
1. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
2. Press Escape key

### Expected Result:
- Overlay closes
- Focus returns to trigger hotspot
- No console errors

### If It Fails:
```javascript
// Check if Escape handler is bound
console.log(typeof bindEditorialOverlayClose); // Should be 'function'

// Check if overlay is hidden after Escape
// (Open overlay, press Escape, then check)
console.log(document.getElementById('immersive-editorial-overlay').hidden);
```

---

## Test 5: Click Close Button

### In Browser:
1. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
2. Click the close button (X) in the overlay header

### Expected Result:
- Overlay closes
- Focus returns to trigger hotspot
- No console errors

### If It Fails:
```javascript
// Check if close button exists
var overlay = document.getElementById('immersive-editorial-overlay');
console.log(overlay.querySelector('[data-editorial-close]'));

// Check if click handler is bound
console.log(typeof bindEditorialOverlayClose); // Should be 'function'
```

---

## Test 6: Click Back Button

### In Browser:
1. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
2. Look for a back button in the editorial content
3. Click it

### Expected Result:
- Overlay closes
- Focus returns to trigger hotspot
- No console errors

### If It Fails:
```javascript
// Check if back button exists
var overlay = document.getElementById('immersive-editorial-overlay');
console.log(overlay.querySelector('[data-editorial-back]'));

// Check if click handler is bound
console.log(typeof bindEditorialBackButton); // Should be 'function'
```

---

## Test 7: Click Editorial Hotspot

### In Browser:
1. Navigate to a room with editorial hotspots
2. Click an editorial hotspot (e.g., "Explore Designers")

### Expected Result:
- Editorial overlay opens
- No page navigation
- No console errors

### If It Fails:
```javascript
// Check if hotspot handler is bound
console.log(typeof bindEditorialHotspots); // Should be 'function'

// Check if hotspots have data attribute
console.log(document.querySelectorAll('[data-target-editorial-room]').length);
```

---

## Test 8: Reduced Motion

### In Browser:
1. Enable reduced motion in OS settings (or use DevTools)
2. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
3. Scroll in the overlay

### Expected Result:
- Parallax items do NOT move
- Overlay still opens/closes
- No console errors

### If It Fails:
```javascript
// Check if reduced motion is respected
var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
console.log('Prefers reduced motion:', prefersReduced);

// Check if parallax respects it
var item = document.querySelector('[data-parallax-item]');
console.log('Item transform:', item.style.transform);
```

---

## Test 9: Caching

### In Browser:
1. Open editorial overlay: `enterEditorialMode('designer_houses', hotspot)`
2. Close it: `exitEditorialMode()`
3. Open it again: `enterEditorialMode('designer_houses', hotspot)`

### Expected Result:
- First open: takes ~200-500ms (network request)
- Second open: instant (<100ms) (cached)
- No duplicate network requests
- No console errors

### If It Fails:
```javascript
// Check cache
console.log(Object.keys(contentCache).length); // Should have entries

// Check Network tab in DevTools
// Should see only one request for the same URL
```

---

## Test 10: Multiple Editorial Overlays

### In Browser:
```javascript
// Open designer_houses editorial
enterEditorialMode('designer_houses', hotspot);

// Close it
exitEditorialMode();

// Open occasions editorial
enterEditorialMode('occasions', hotspot);

// Close it
exitEditorialMode();

// Open featured_collections editorial
enterEditorialMode('featured_collections', hotspot);
```

### Expected Result:
- All three editorials open correctly
- Each has correct content
- No console errors
- Smooth transitions

### If It Fails:
```javascript
// Check if all editorial sections exist
console.log(document.querySelector('[data-room-key="designer_houses"]'));
console.log(document.querySelector('[data-room-key="occasions"]'));
console.log(document.querySelector('[data-room-key="featured_collections"]'));
```

---

## Full Editorial Journey Test

### Step-by-Step:

1. Navigate to `/pages/immersive`
2. Navigate to a room with editorial hotspots
3. Click an editorial hotspot
4. Editorial overlay opens → ✅
5. Scroll through editorial content
6. Parallax items move smoothly → ✅
7. Click close button
8. Overlay closes, focus returns → ✅
9. Click same hotspot again
10. Overlay opens instantly (cached) → ✅

### Expected Result:
- Complete editorial journey works end-to-end
- No page navigation
- No console errors
- Smooth animations
- Proper focus management

---

## Debugging Tips

### Check State
```javascript
console.log('State:', immersiveState);
console.log('Mode:', immersiveState.mode);
console.log('Editorial room:', immersiveState.editorialRoom);
console.log('Last hotspot:', immersiveState.lastHotspot);
```

### Check Cache
```javascript
console.log('Cached URLs:', Object.keys(contentCache));
console.log('Cache size:', Object.keys(contentCache).length);
```

### Check Elements
```javascript
console.log('Editorial overlay:', document.getElementById('immersive-editorial-overlay'));
console.log('Editorial hotspots:', document.querySelectorAll('[data-target-editorial-room]').length);
console.log('Parallax items:', document.querySelectorAll('[data-parallax-item]').length);
```

### Check Network
```javascript
// Open DevTools Network tab
// Filter by XHR
// You should see:
// - /pages/immersive?section_id={editorial_section_id}
```

---

## Common Issues

### Issue: Overlay doesn't open
**Solution:** Check if editorial section exists
```javascript
console.log(document.querySelector('[data-room-key="designer_houses"]'));
```

### Issue: Parallax doesn't work
**Solution:** Check if parallax items exist
```javascript
var overlay = document.getElementById('immersive-editorial-overlay');
console.log(overlay.querySelectorAll('[data-parallax-item]').length);
```

### Issue: Focus doesn't move
**Solution:** Check if close button exists
```javascript
var overlay = document.getElementById('immersive-editorial-overlay');
console.log(overlay.querySelector('[data-editorial-close]'));
```

### Issue: Overlay doesn't close
**Solution:** Check if close handler is bound
```javascript
console.log(typeof bindEditorialOverlayClose); // Should be 'function'
```

---

## Success Criteria

✅ All 10 tests pass  
✅ No console errors  
✅ Smooth parallax animation  
✅ Proper focus management  
✅ Keyboard navigation works  
✅ Caching works  
✅ Complete editorial journey works  

---

## Next Steps

If all tests pass:
1. ✅ Phase 1 is complete (product discovery)
2. ✅ Phase 2 is complete (editorial overlays)
3. Move to Phase 3: Cart & checkout
4. Finish with Phase 4: Optimization & testing

If tests fail:
1. Check debugging tips above
2. Review QUICK_REFERENCE.md
3. Check browser console for errors
4. Verify editorial sections exist in DOM
5. Check that all elements have correct data attributes

---

## Questions?

Refer to:
- [PHASE_2_COMPLETE.md](PHASE_2_COMPLETE.md) — What was built
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Quick lookup
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — Detailed guide
