# 🚀 Shahana Collection - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Upload Files (2 minutes)

Using Shopify CLI:
```bash
cd dawn
shopify theme push
```

Or manually upload these files via Theme Editor:

```
✅ layout/theme.immersive.liquid
✅ templates/page.immersive.json
✅ sections/immersive-product-grid.liquid
✅ assets/immersive-style.css
✅ assets/immersive-store.js
✅ snippets/immersive-product-card.liquid (optional)
```

### 2. Add Your Images (1 minute)

1. Upload two images to `assets/`:
   - `exterior-image.jpg` (building/exterior shot)
   - `lounge-interior.jpg` (interior/lounge shot)

2. Edit `assets/immersive-store.js` (lines 380-390):

```javascript
// BEFORE (placeholder URLs):
const textureOne = textureLoader.load(
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',

// AFTER (your Shopify assets):
const textureOne = textureLoader.load(
  '{{ "exterior-image.jpg" | asset_url }}',
```

**Important**: You must use Liquid syntax `{{ "filename.jpg" | asset_url }}` for Shopify-hosted images.

### 3. Create Collections (1 minute)

In Shopify Admin > Products > Collections, create:

| Collection Name | Handle (URL) | Products |
|----------------|--------------|----------|
| Designer Houses | `designer-houses` | Add 4-8 products |
| Occasions | `occasions` | Add 4-8 products |
| Featured Collections | `featured` | Add 4-8 products |

**Note**: The "handle" must match exactly (lowercase, hyphens).

### 4. Create Page (30 seconds)

1. Go to **Online Store > Pages**
2. Click **Add page**
3. Title: "Immersive Store"
4. Template: Select **page.immersive** from dropdown
5. Click **Save**

### 5. Test (30 seconds)

Visit: `yourstore.myshopify.com/pages/immersive-store`

**Expected behavior**:
- ✅ Black screen with image
- ✅ Scroll down → image dissolves with gold edges
- ✅ At bottom → 3 hotspots appear
- ✅ Click hotspot → glass panel slides in with products

---

## 🎨 Quick Customizations

### Change Gold Color

**CSS** (`immersive-style.css`):
```css
/* Find and replace all instances of: */
#d4af37  →  #YOUR_COLOR
rgb(212, 175, 55)  →  rgb(YOUR_R, YOUR_G, YOUR_B)
```

**JavaScript** (`immersive-store.js`):
```glsl
/* In both shaders, change: */
const vec3 goldColor = vec3(0.85, 0.65, 0.13);
/* To your color (RGB values 0.0-1.0): */
const vec3 goldColor = vec3(R/255, G/255, B/255);
```

### Move Hotspots

Edit `layout/theme.immersive.liquid` (lines 120-140):

```html
<!-- Change top/left percentages: -->
<div class="hotspot" data-collection="designer-houses" 
     style="position: absolute; top: 35%; left: 25%;">
```

### Change Hotspot Labels

```html
<div class="hotspot-label">YOUR NEW TEXT</div>
```

### Adjust Scroll Trigger

In `immersive-store.js` (line 620):

```javascript
if (scrollProgress >= 0.95) {  // Change to 0.8 for earlier trigger
  showHotspots();
}
```

---

## 🐛 Troubleshooting

### Problem: Images not loading

**Solution**: Check that you're using Liquid syntax:
```javascript
// ❌ WRONG:
'https://yourstore.com/assets/image.jpg'

// ✅ CORRECT:
'{{ "image.jpg" | asset_url }}'
```

### Problem: Hotspots don't appear

**Solution**: Scroll all the way to the bottom (95%+)

### Problem: Glass panel is empty

**Solution**: 
1. Check collection handles match exactly
2. Ensure collections have products
3. Check browser console for errors

### Problem: Shaders look wrong

**Solution**: 
1. Clear browser cache
2. Check that Three.js r172 is loading (view page source)
3. Try a different browser (Chrome recommended)

---

## 📱 Mobile Testing

The experience is responsive, but test on:
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ iPad

**Note**: Smooth scroll is disabled on mobile Safari by default (iOS limitation).

---

## 🎯 Next Steps

1. **Add more products** to your collections
2. **Customize colors** to match your brand
3. **Adjust hotspot positions** for your images
4. **Test on different devices**
5. **Share with your team** for feedback

---

## 📚 Full Documentation

See `IMMERSIVE-STORE-README.md` for:
- Advanced customization
- Shader modification
- Performance optimization
- Browser support details

---

## 🆘 Need Help?

**Common Issues**:
1. Images not loading → Use Liquid asset_url filter
2. Hotspots not appearing → Scroll to 95%+
3. Panel empty → Check collection handles
4. Shaders broken → Clear cache, try Chrome

**Debug Mode**:
Open browser console (F12) and look for:
- `🎨 Initializing Shahana Collection...`
- `✅ Texture One loaded`
- `✅ Texture Two loaded`
- `🎯 X hotspots initialized`

---

**Built for Shahana Collection** 🇵🇰

*Questions? Check the full README or Shopify Community forums.*
