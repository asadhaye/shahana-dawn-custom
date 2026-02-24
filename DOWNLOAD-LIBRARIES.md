# Download Required Libraries for Immersive Store

The immersive WebGL experience requires Two JavaScript libraries that must be downloaded locally due to Shopify's MIME type restrictions on external CDNs.

## Required Files

### 1. Three.js (r172)
- **URL**: https://threejs.org/build/three.min.js
- **Save as**: `dawn/assets/three.min.js`
- **Size**: ~600KB

### 2. Lenis Smooth Scroll (v1.0.42)
- **URL**: https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js
- **Save as**: `dawn/assets/lenis.min.js`
- **Size**: ~20KB

## Download Instructions

### Option 1: Using curl (Terminal/Command Line)

```bash
# Navigate to your project directory
cd /Users/asad/Desktop/sc-ui/shahana-dawn-custom

# Download Three.js
curl -o dawn/assets/three.min.js https://threejs.org/build/three.min.js

# Download Lenis
curl -o dawn/assets/lenis.min.js https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js
```

### Option 2: Manual Download (Browser)

1. **Download Three.js**:
   - Open: https://threejs.org/build/three.min.js
   - Right-click → "Save As..."
   - Save to: `dawn/assets/three.min.js`

2. **Download Lenis**:
   - Open: https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js
   - Right-click → "Save As..."
   - Save to: `dawn/assets/lenis.min.js`

## Upload to Shopify

After downloading, the files will automatically sync to Shopify if your dev server is running:

```bash
shopify theme dev --store shahanacollection.myshopify.com
```

Or push manually:

```bash
shopify theme push --theme 190459740542 --only assets/three.min.js --only assets/lenis.min.js
```

## Verify Installation

Once uploaded, check the browser console at:
http://127.0.0.1:9292/pages/immersive

You should see:
- ✅ No "THREE is not defined" errors
- ✅ No MIME type mismatch errors
- ✅ WebGL canvas rendering with your images

## Files Updated

The following files now reference the local libraries:
- ✅ `dawn/layout/theme.liquid` - Loads THREE and Lenis globally
- ✅ `dawn/sections/immersive-canvas.liquid` - Uses THREE for WebGL rendering

## Next Steps

After libraries are installed:
1. Add the "Immersive store" section to a page in Shopify admin
2. Upload your base image and depth map in section settings
3. Test the parallax and scroll effects
4. Customize hotspot positions and product collections
