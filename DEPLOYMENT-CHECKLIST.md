# ✅ Shahana Collection - Deployment Checklist

## Pre-Deployment Checklist

### 📋 Files Ready
- [ ] `layout/theme.immersive.liquid` created
- [ ] `templates/page.immersive.json` created
- [ ] `sections/immersive-product-grid.liquid` created
- [ ] `assets/immersive-store.js` created
- [ ] `assets/immersive-style.css` created
- [ ] `assets/immersive-config.js` created
- [ ] `snippets/immersive-product-card.liquid` created (optional)

### 🖼️ Images Prepared
- [ ] Exterior image ready (1920x1080+, < 2MB)
- [ ] Interior image ready (1920x1080+, < 2MB)
- [ ] Images optimized (compressed)
- [ ] Images named correctly:
  - [ ] `exterior-image.jpg`
  - [ ] `lounge-interior.jpg`

### 🏪 Shopify Store Ready
- [ ] Shopify store accessible
- [ ] Admin access confirmed
- [ ] Dawn theme installed (or compatible theme)
- [ ] Theme backup created

---

## Deployment Steps

### Step 1: Upload Files (5 minutes)

#### Option A: Shopify CLI (Recommended)
```bash
# Navigate to theme directory
cd dawn

# Login to Shopify
shopify login

# Push theme
shopify theme push

# Confirm upload
✓ Files uploaded successfully
```

- [ ] CLI installed and configured
- [ ] Logged into Shopify
- [ ] Files pushed successfully
- [ ] No errors in terminal

#### Option B: Theme Editor (Manual)
1. Go to **Online Store > Themes**
2. Click **Actions > Edit code**
3. Upload each file to correct directory:

**Layout Files:**
- [ ] Upload `theme.immersive.liquid` to `layout/`

**Template Files:**
- [ ] Upload `page.immersive.json` to `templates/`

**Section Files:**
- [ ] Upload `immersive-product-grid.liquid` to `sections/`

**Asset Files:**
- [ ] Upload `immersive-store.js` to `assets/`
- [ ] Upload `immersive-style.css` to `assets/`
- [ ] Upload `immersive-config.js` to `assets/`

**Snippet Files (Optional):**
- [ ] Upload `immersive-product-card.liquid` to `snippets/`

### Step 2: Upload Images (2 minutes)

1. Go to **Online Store > Themes > Actions > Edit code**
2. Click **Assets** folder
3. Click **Add a new asset**
4. Upload images:
   - [ ] `exterior-image.jpg` uploaded
   - [ ] `lounge-interior.jpg` uploaded
5. Note the exact filenames for next step

### Step 3: Update Image References (1 minute)

1. Open `assets/immersive-store.js` in Theme Editor
2. Find lines ~380-390 (texture loading section)
3. Replace placeholder URLs:

```javascript
// BEFORE:
const textureOne = textureLoader.load(
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',

// AFTER:
const textureOne = textureLoader.load(
  '{{ "exterior-image.jpg" | asset_url }}',
```

4. Do the same for `textureTwo`:

```javascript
const textureTwo = textureLoader.load(
  '{{ "lounge-interior.jpg" | asset_url }}',
```

- [ ] Texture One URL updated
- [ ] Texture Two URL updated
- [ ] File saved

### Step 4: Create Collections (3 minutes)

1. Go to **Products > Collections**
2. Create three collections:

**Collection 1:**
- [ ] Name: "Designer Houses"
- [ ] Handle: `designer-houses` (must be exact)
- [ ] Add 4-8 products
- [ ] Add collection image (optional)

**Collection 2:**
- [ ] Name: "Occasions"
- [ ] Handle: `occasions` (must be exact)
- [ ] Add 4-8 products
- [ ] Add collection image (optional)

**Collection 3:**
- [ ] Name: "Featured Collections"
- [ ] Handle: `featured` (must be exact)
- [ ] Add 4-8 products
- [ ] Add collection image (optional)

**Verify:**
- [ ] All collections have products
- [ ] Handles match exactly (lowercase, hyphens)
- [ ] Products have images
- [ ] Products have prices

### Step 5: Create Page (1 minute)

1. Go to **Online Store > Pages**
2. Click **Add page**
3. Fill in details:
   - [ ] Title: "Immersive Store" (or your choice)
   - [ ] Content: Leave blank or add intro text
4. In right sidebar:
   - [ ] Template: Select **page.immersive**
   - [ ] Visibility: Visible
5. Click **Save**
6. Note the page URL: `/pages/immersive-store`

- [ ] Page created
- [ ] Template selected
- [ ] Page published
- [ ] URL noted

---

## Testing Checklist

### Desktop Testing (5 minutes)

**Browser: Chrome**
- [ ] Visit page URL
- [ ] Page loads without errors
- [ ] Black background visible
- [ ] Exterior image loads
- [ ] Scroll down smoothly
- [ ] Dissolve effect works
- [ ] Interior image reveals
- [ ] Hotspots appear at bottom
- [ ] Hotspots pulse animation works
- [ ] Hover expands hotspot to pill
- [ ] Click opens glass panel
- [ ] Products load in panel
- [ ] Images display correctly
- [ ] Prices show correctly
- [ ] Add to cart works
- [ ] Close button works
- [ ] Panel slides out smoothly

**Browser: Firefox**
- [ ] Repeat all Chrome tests
- [ ] Note any differences

**Browser: Safari**
- [ ] Repeat all Chrome tests
- [ ] Note any differences

### Mobile Testing (5 minutes)

**Device: iPhone**
- [ ] Visit page URL
- [ ] Page loads
- [ ] Scroll works (may not be smooth on iOS)
- [ ] Dissolve effect works
- [ ] Hotspots appear
- [ ] Tap hotspot opens panel
- [ ] Panel is full-width
- [ ] Products display in single column
- [ ] Add to cart works
- [ ] Close button works

**Device: Android**
- [ ] Repeat iPhone tests
- [ ] Note any differences

### Performance Testing (2 minutes)

**Desktop:**
- [ ] Open DevTools (F12)
- [ ] Go to Performance tab
- [ ] Record while scrolling
- [ ] Check FPS (should be ~60)
- [ ] Check for errors in Console

**Mobile:**
- [ ] Use Chrome Remote Debugging
- [ ] Check FPS (should be 30-60)
- [ ] Check for errors

### Accessibility Testing (3 minutes)

- [ ] Tab through hotspots (keyboard navigation)
- [ ] Focus states visible
- [ ] Screen reader announces hotspot labels
- [ ] Close button accessible via keyboard
- [ ] Add to cart buttons accessible
- [ ] No console errors about accessibility

---

## Post-Deployment Checklist

### Verification (2 minutes)

- [ ] All files uploaded successfully
- [ ] No 404 errors in Console
- [ ] Images load correctly
- [ ] Shaders compile without errors
- [ ] Three.js loads from CDN
- [ ] Lenis loads from CDN
- [ ] No JavaScript errors

### Configuration (3 minutes)

**Optional Customizations:**
- [ ] Adjust hotspot positions if needed
- [ ] Change gold color if desired
- [ ] Modify scroll trigger point
- [ ] Update hotspot labels
- [ ] Adjust panel width

**Edit `assets/immersive-config.js`:**
```javascript
// Example customizations
colors: {
  primary: {
    hex: '#YOUR_COLOR',  // Change gold color
  }
},
scroll: {
  hotspotTrigger: 0.90,  // Show hotspots earlier
},
hotspots: [
  {
    position: { top: '40%', left: '30%' }  // Adjust position
  }
]
```

- [ ] Customizations made (if any)
- [ ] File saved
- [ ] Changes tested

### Documentation (1 minute)

- [ ] Save page URL for team
- [ ] Document any customizations made
- [ ] Note any issues encountered
- [ ] Share with stakeholders

---

## Troubleshooting Guide

### Issue: Images Not Loading

**Symptoms:**
- Black screen with no images
- Console error: "Failed to load texture"

**Solutions:**
- [ ] Check image filenames match exactly
- [ ] Verify Liquid syntax: `{{ "filename.jpg" | asset_url }}`
- [ ] Confirm images uploaded to assets/
- [ ] Check file extensions (.jpg vs .jpeg)
- [ ] Try clearing browser cache

### Issue: Hotspots Not Appearing

**Symptoms:**
- Scroll to bottom but no hotspots

**Solutions:**
- [ ] Scroll all the way to 95%+
- [ ] Check console for JavaScript errors
- [ ] Verify `immersive-store.js` loaded
- [ ] Check `scrollProgress` value in console
- [ ] Try different browser

### Issue: Glass Panel Empty

**Symptoms:**
- Panel opens but shows loading spinner forever

**Solutions:**
- [ ] Check collection handles match exactly
- [ ] Verify collections have products
- [ ] Check Network tab for 404 errors
- [ ] Confirm section file uploaded
- [ ] Test section URL directly: `/?section_id=immersive-product-grid`

### Issue: Shaders Look Wrong

**Symptoms:**
- No dissolve effect
- Colors incorrect
- Glitchy appearance

**Solutions:**
- [ ] Check WebGL support in browser
- [ ] Clear browser cache
- [ ] Check console for shader errors
- [ ] Verify Three.js loaded (check Network tab)
- [ ] Try different browser
- [ ] Check GPU drivers updated

### Issue: Scroll Not Smooth

**Symptoms:**
- Jerky scrolling
- No smooth effect

**Solutions:**
- [ ] Verify Lenis loaded (check Network tab)
- [ ] Check console for Lenis errors
- [ ] Note: iOS Safari disables smooth scroll by default
- [ ] Try desktop browser
- [ ] Check `immersive-config.js` settings

### Issue: Add to Cart Not Working

**Symptoms:**
- Button click does nothing
- Error in console

**Solutions:**
- [ ] Check product has available variants
- [ ] Verify form action: `/cart/add`
- [ ] Check variant ID is valid
- [ ] Test with different product
- [ ] Check Shopify cart settings

---

## Performance Optimization

### If FPS is Low:

- [ ] Reduce `maxPixelRatio` in config (2 → 1)
- [ ] Lower texture quality in config
- [ ] Disable animations in config
- [ ] Compress images further
- [ ] Test on different device

### If Load Time is Slow:

- [ ] Compress images (use TinyPNG)
- [ ] Enable lazy loading
- [ ] Preload critical assets
- [ ] Use WebP format if supported
- [ ] Check CDN performance

---

## Launch Checklist

### Before Going Live:

- [ ] All tests passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile experience good
- [ ] Accessibility verified
- [ ] Team reviewed
- [ ] Stakeholder approved

### Going Live:

- [ ] Update navigation to link to page
- [ ] Add to main menu (optional)
- [ ] Announce to customers
- [ ] Monitor analytics
- [ ] Watch for errors

### Post-Launch:

- [ ] Monitor page views
- [ ] Track hotspot clicks
- [ ] Check conversion rate
- [ ] Gather user feedback
- [ ] Plan improvements

---

## Support Resources

### If You Need Help:

**Documentation:**
- [ ] Read `IMMERSIVE-STORE-README.md`
- [ ] Check `IMMERSIVE-QUICKSTART.md`
- [ ] Review `VISUAL-GUIDE.md`

**Community:**
- [ ] Shopify Community Forums
- [ ] Three.js Discord
- [ ] Stack Overflow

**Debug Mode:**
- [ ] Enable in `immersive-config.js`:
```javascript
debug: {
  enabled: true,
  showScrollProgress: true,
  showFPS: true
}
```

---

## Success Criteria

### Deployment Successful When:

- [x] All files uploaded
- [x] Images loading
- [x] Scroll effect working
- [x] Hotspots appearing
- [x] Panel opening
- [x] Products loading
- [x] Add to cart working
- [x] Mobile responsive
- [x] No console errors
- [x] Performance good (30+ FPS)

---

## Final Sign-Off

**Deployed By:** ___________________

**Date:** ___________________

**Time:** ___________________

**Store URL:** ___________________

**Page URL:** ___________________

**Notes:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Status:** 
- [ ] ✅ Deployment Successful
- [ ] ⚠️ Deployment with Issues (see notes)
- [ ] ❌ Deployment Failed (see notes)

---

**Deployment Complete!** 🎉

*Your immersive store is now live. Monitor performance and gather feedback for future improvements.*
