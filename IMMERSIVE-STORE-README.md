# Shahana Collection - Immersive Store Implementation Guide

## 🎨 Overview

This implementation creates a scroll-driven WebGL experience for a Pakistani luxury fashion brand, combining isometric navigation with cinematic scene transitions inspired by Drake Related and Shopify Editions Winter 2026.

## 📁 Files Created

```
dawn/
├── layout/
│   └── theme.immersive.liquid          # Custom layout with dual-canvas setup
├── templates/
│   └── page.immersive.json             # Template using immersive layout
├── sections/
│   └── immersive-product-grid.liquid   # AJAX-loaded product grid
├── assets/
│   ├── immersive-style.css             # Glassmorphism UI & hotspot styles
│   └── immersive-store.js              # WebGL engine + Lenis scroll
```

## 🚀 Setup Instructions

### Step 1: Upload to Shopify

1. **Via Shopify CLI** (Recommended):
   ```bash
   cd dawn
   shopify theme push
   ```

2. **Via Theme Editor**:
   - Go to Online Store > Themes
   - Click "Actions" > "Edit code"
   - Upload each file to its respective directory

### Step 2: Replace Placeholder Images

In `immersive-store.js`, replace the placeholder texture URLs (lines ~380-390):

```javascript
// Replace these with your Shopify asset URLs
const textureOne = textureLoader.load(
  '{{ "exterior-image.jpg" | asset_url }}',  // Your exterior/building image
  () => console.log('✅ Texture One loaded')
);

const textureTwo = textureLoader.load(
  '{{ "lounge-interior.jpg" | asset_url }}',  // Your lounge/interior image
  () => console.log('✅ Texture Two loaded')
);
```

**Image Requirements**:
- Format: JPG or PNG
- Resolution: 1920x1080 or higher
- Aspect Ratio: 16:9 recommended
- File Size: < 2MB for optimal loading

### Step 3: Create Collections

Create three collections in Shopify Admin:
1. **designer-houses** (handle: `designer-houses`)
2. **occasions** (handle: `occasions`)
3. **featured** (handle: `featured`)

These handles match the hotspot `data-collection` attributes.

### Step 4: Create a Page with Immersive Template

1. Go to **Online Store > Pages**
2. Click **Add page**
3. Title: "Immersive Store" (or your choice)
4. In the right sidebar, under **Theme template**, select **page.immersive**
5. Save

### Step 5: Test the Experience

Visit your new page URL (e.g., `yourstore.com/pages/immersive-store`)

**Expected Behavior**:
- Page loads with black background
- Scroll down to see the dissolve/reveal effect
- At ~95% scroll, three hotspots fade in
- Click hotspots to open the glass panel with products

## 🎯 Customization Guide

### Adjusting Hotspot Positions

Edit `layout/theme.immersive.liquid` (lines ~120-140):

```html
<div class="hotspot" data-collection="designer-houses" 
     style="position: absolute; top: 35%; left: 25%;">
```

Change `top` and `left` percentages to reposition.

### Changing Gold Color

The Pakistani gold color (`#d4af37`) is used throughout. To change:

**CSS** (`immersive-style.css`):
- Search for `#d4af37` and `rgb(212, 175, 55)`
- Replace with your brand color

**GLSL Shaders** (`immersive-store.js`):
- Line ~60: `const vec3 goldColor = vec3(0.85, 0.65, 0.13);`
- Change RGB values (0-1 range)

### Adjusting Scroll Trigger Point

In `immersive-store.js` (line ~620):

```javascript
if (scrollProgress >= 0.95) {  // Change 0.95 to your preferred threshold
  showHotspots();
}
```

### Modifying Dissolve Speed

In shader uniforms (line ~380):

```javascript
materialOne.uniforms.uProgress.value = scrollProgress;
```

Apply easing:
```javascript
materialOne.uniforms.uProgress.value = easeOutCubic(scrollProgress);

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
```

### Changing Products Per Page

Edit `sections/immersive-product-grid.liquid` schema (line ~150):

```json
{
  "type": "range",
  "id": "products_per_page",
  "default": 8,  // Change this number
}
```

## 🔧 Advanced Customization

### Adding More Hotspots

1. **Add HTML** in `theme.immersive.liquid`:
```html
<div class="hotspot" data-collection="new-arrivals" 
     style="position: absolute; top: 45%; left: 70%;">
  <div class="hotspot-dot"></div>
  <div class="hotspot-label">NEW ARRIVALS</div>
</div>
```

2. **Create matching collection** with handle `new-arrivals`

### Custom Shader Effects

The shaders use Sobel edge detection. To modify:

**Increase Edge Thickness**:
```glsl
float pixelSize = 2.0;  // Increase from 1.0
```

**Change Edge Color**:
```glsl
const vec3 goldColor = vec3(0.85, 0.65, 0.13);  // RGB values 0-1
```

**Adjust Edge Intensity**:
```glsl
float edgeThreshold = 0.15;  // Lower = more edges, Higher = fewer edges
```

### Mobile Optimization

The CSS includes responsive breakpoints. To adjust:

```css
@media (max-width: 768px) {
  #glass-panel {
    width: 100vw;  /* Full width on mobile */
  }
}
```

## 🐛 Troubleshooting

### Issue: Textures Not Loading

**Solution**: Check browser console for CORS errors. Ensure images are hosted on Shopify CDN:
```javascript
const textureOne = textureLoader.load(
  '{{ "your-image.jpg" | asset_url }}',  // Must use Liquid filter
);
```

### Issue: Hotspots Not Appearing

**Solution**: 
1. Scroll to bottom of page (95%+)
2. Check console for JavaScript errors
3. Verify `scrollProgress` is updating:
```javascript
console.log('Scroll Progress:', scrollProgress);
```

### Issue: Glass Panel Empty

**Solution**:
1. Verify collection handles match exactly
2. Check Section Rendering API response:
```javascript
fetch('/?section_id=immersive-product-grid&collection=designer-houses')
  .then(r => r.text())
  .then(html => console.log(html));
```

### Issue: Shaders Not Compiling

**Solution**: Check browser console for WebGL errors. Ensure:
- Three.js r172 is loaded
- Browser supports WebGL 2.0
- No syntax errors in GLSL code

### Issue: Scroll Not Smooth

**Solution**: Verify Lenis is loaded:
```javascript
console.log('Lenis:', typeof Lenis);  // Should output "function"
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Mobile Safari (smooth scroll disabled by default)

## 🎨 Design Philosophy

### Pakistani Luxury Aesthetic

The golden color (`#d4af37`) is inspired by:
- **Zardozi**: Traditional gold embroidery
- **Gota Work**: Metallic ribbon embellishment
- **Mughal Architecture**: Gold leaf detailing

### Scroll-Driven Narrative

1. **0-50%**: Exterior dissolves, edges glow gold
2. **50-95%**: Interior reveals, full color emerges
3. **95-100%**: Hotspots appear, inviting interaction

### Glassmorphism Panel

The product panel uses:
- `backdrop-filter: blur(24px)` for frosted glass
- `rgba(0, 0, 0, 0.75)` for dark transparency
- Gold borders for luxury accent

## 🚀 Performance Optimization

### Image Optimization

Use Shopify's image filters:
```liquid
{{ product.featured_image | image_url: width: 600, format: 'pjpg' }}
```

### Lazy Loading

Products use `loading="lazy"`:
```html
<img loading="lazy" src="...">
```

### Shader Optimization

- Pixel ratio capped at 2x: `Math.min(window.devicePixelRatio, 2)`
- Sobel kernel optimized for 3x3 sampling
- Edge detection cached per frame

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Lenis Smooth Scroll](https://github.com/studio-freight/lenis)
- [Shopify Section Rendering API](https://shopify.dev/docs/api/section-rendering)
- [WebGL Shader Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)

## 🎓 Learning Path

1. **Beginner**: Adjust colors, positions, and text
2. **Intermediate**: Modify shader parameters and scroll timing
3. **Advanced**: Create custom shader effects and add new scenes

## 📞 Support

For issues specific to this implementation:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test with browser DevTools Network tab
4. Ensure collections and products exist

## 🎉 Next Steps

1. **Add Analytics**: Track hotspot clicks
2. **A/B Testing**: Test different scroll triggers
3. **Accessibility**: Add keyboard navigation
4. **SEO**: Implement structured data for products
5. **Performance**: Add service worker for offline support

---

**Built with ❤️ for Shahana Collection**

*Combining Pakistani craftsmanship with cutting-edge web technology*
