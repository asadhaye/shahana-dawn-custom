# Performance Optimizations — Quick Reference

## Enable Dev Mode

```javascript
// In browser console:
window.__IMMERSIVE_DEV__ = true;
```

## What You'll See

### Console Output (Every Second)
```
[Immersive] FPS: 60 | Frame time: 16.23ms
[Immersive] Connection quality: 4g → scale: 1
[Immersive] Evicting oldest texture from cache: room1|depth1
```

### Warnings
```
[Immersive] Frame budget exceeded: 22.15ms (>16.67ms for 60fps)
```

---

## Performance Metrics

### Target Performance
- **FPS**: 60 (16.67ms per frame)
- **Texture Cache**: 5 textures max
- **Memory**: Stable (no growth over time)

### Connection Quality

| Connection | Texture Scale | Desktop Size | Mobile Size |
|------------|---------------|--------------|-------------|
| 4G | 100% | 1920px | 1200px |
| 3G | 75% | 1440px | 900px |
| 2G | 50% | 960px | 600px |
| saveData | 50% | 960px | 600px |

---

## Quick Diagnostics

### Check FPS
```javascript
// Enable dev mode, watch console for 5 seconds
window.__IMMERSIVE_DEV__ = true;
```

### Check Texture Cache
```javascript
// In console:
textureCache.length  // Should be ≤5
```

### Check Connection Quality
```javascript
// In console:
navigator.connection.effectiveType  // '4g', '3g', '2g', 'slow-2g'
navigator.connection.saveData       // true/false
```

### Check Texture Size
```javascript
// In console:
textureWidth  // Current texture width in pixels
```

---

## Troubleshooting

### Low FPS (<60)
1. Check frame time in console
2. Look for "Frame budget exceeded" warnings
3. Check if CPU/GPU throttled in DevTools
4. Verify texture cache size (should be ≤5)

### High Memory Usage
1. Check texture cache size: `textureCache.length`
2. Should never exceed 5
3. Watch for eviction logs when navigating rooms

### Slow Loading
1. Check connection quality in console
2. Verify texture size matches connection
3. Check Network tab for actual download sizes

### Layout Shifts
1. Product card images should have no fixed dimensions
2. CSS should handle sizing via `aspect-ratio`
3. Check for CLS in Lighthouse

---

## Configuration

### Adjust Cache Size
```javascript
// In assets/immersive-store.js (line ~179)
var MAX_CACHED_TEXTURES = 5;  // Change this
```

### Adjust Quality Thresholds
```javascript
// In evaluateDeviceFlags() (line ~220)
var qualityMap = {
  'slow-2g': 0.5,  // 50% quality
  '2g': 0.5,
  '3g': 0.75,      // 75% quality
  '4g': 1.0        // 100% quality
};
```

---

## Performance Testing

### Test LRU Cache
1. Enable dev mode
2. Navigate through 6+ rooms
3. Watch for eviction logs
4. Verify cache stays at 5

### Test Connection Quality
1. Open DevTools → Network tab
2. Throttle to 3G
3. Reload page
4. Check texture sizes (should be 75% of normal)

### Test Frame Budget
1. Enable dev mode
2. Open DevTools → Performance tab
3. Throttle CPU to 4x slowdown
4. Watch for frame budget warnings

---

## Files Modified

| File | Changes |
|------|---------|
| `assets/immersive-store.js` | LRU cache, performance monitoring, connection quality |
| `snippets/immersive-product-card.liquid` | Removed fixed image dimensions |

---

## Quick Commands

```javascript
// Enable dev mode
window.__IMMERSIVE_DEV__ = true;

// Check cache
console.log('Cache size:', textureCache.length);

// Check connection
console.log('Connection:', navigator.connection?.effectiveType);

// Check texture size
console.log('Texture width:', textureWidth);

// Force garbage collection (Chrome only)
if (window.gc) window.gc();
```

---

## Expected Behavior

### Normal Operation
- FPS: 55-60
- Frame time: 14-17ms
- Cache size: 1-5 textures
- No warnings

### Under Load
- FPS: 45-60
- Frame time: 17-22ms
- Occasional frame budget warnings
- Cache evictions when navigating

### Poor Connection
- Smaller textures loaded
- Faster initial load
- Same FPS (rendering unchanged)

---

## Red Flags

🚨 **Cache size > 5** — LRU eviction not working
🚨 **FPS < 30** — Serious performance issue
🚨 **Frame time > 33ms** — Dropping below 30fps
🚨 **Memory growing** — Texture leak
🚨 **No eviction logs** — Cache not working

---

## Support

For performance issues:
1. Enable dev mode
2. Capture console logs for 30 seconds
3. Note FPS, frame time, and warnings
4. Check Network tab for texture sizes
5. Report findings with browser/device info
