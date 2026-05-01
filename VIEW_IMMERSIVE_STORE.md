# 🎬 View the Immersive Store — Quick Start

## ✅ Development Server is Running!

**Local Preview**: http://127.0.0.1:9292  
**Shopify Preview**: https://shahana-uk.myshopify.com/?preview_theme_id=191085937022

---

## 🎯 Where to Go

### 1. **Homepage (Standard 2D Store)**
```
http://127.0.0.1:9292/
```
- Standard Dawn homepage
- Look for the Bridge CTA to the 3D store
- This is the SEO landing page

### 2. **Immersive Store (3D Experience)** ⭐
```
http://127.0.0.1:9292/pages/immersive
```
**This is what you want to see!**

---

## 🗺️ What to Explore in the Immersive Store

### Step-by-Step Tour

#### **1. Entry (Storefront Room)**
- You'll land in the Storefront room
- Move your mouse around → see the parallax depth effect
- Look for the glowing "Enter Store" hotspot
- Click it → transitions to Lounge

#### **2. Hub (Lounge Room)**
- Central hub with 3 editorial wings
- You'll see 3 hotspots:
  - **"Explore Designers"** (left/center)
  - **"Dress the Occasion"** (center/right)
  - **"The Edit"** (right)
- Click any hotspot → opens editorial overlay

#### **3. Editorial Overlays**
Try each one:

**Designer Houses Editorial**:
- Click "Explore Designers" hotspot
- Scroll through 3 designer tiles (Suffuse, Soraya, Saad Bin Shahzad)
- Click "Explore Collection" on any tile → opens collection grid
- Click a product → opens product detail panel
- Try adding to cart or wishlist

**Occasions Editorial**:
- Click "Dress the Occasion" hotspot
- Scroll through 4 occasion cards (Eid, Bridal, Formals, Pret)
- Click "Shop Now" → opens collection grid

**Featured Collections Editorial**:
- Click "The Edit" hotspot
- Scroll through 3 featured collections
- Click "View Collection" → opens collection grid

#### **4. Fixed Header (Always Visible)**
Top-right icons:
- **Menu** (hamburger) → navigation drawer
- **Search** → search the store
- **Account** → customer account
- **Wishlist** (heart) → saved items
- **Cart** → shopping cart
- **3D→2D Switch** → return to standard store

#### **5. Glass Panels**
When you click a collection or product:
- **Collection Grid**: Scrollable product grid with filters
- **Product Detail**: Full product info, variants, add-to-cart, VTO
- **Close button** (top-right) → returns to previous view
- **Escape key** → also closes

---

## 🎮 Interactive Features to Try

### Parallax Effect
- Move your mouse slowly across the screen
- Notice the depth-based parallax on the room background
- Try it in different rooms

### Hotspot Interactions
- Hover over hotspots → they glow/pulse
- Click → smooth transition to next room or editorial
- Focus states for keyboard navigation (Tab key)

### Glass Panel Navigation
1. Open a collection (click any "Explore Collection" CTA)
2. Click a product card → product detail opens
3. Select a variant (size/color)
4. Click "Add to Cart"
5. See the cart count update in header
6. Close panel → back to editorial

### Wishlist
1. Open a product panel
2. Click the heart icon (top-right of product)
3. Click wishlist icon in header → see saved items
4. Works without login (localStorage)

### Search
1. Click search icon in header
2. Type "bridal" or "silk"
3. Press Enter
4. Search results open in glass panel
5. Click any product

### Virtual Try-On (if logged in)
1. Open a product panel
2. Look for "Try it on" section
3. Upload a photo
4. See the product on you (AI-powered)

---

## 🔗 Deep-Link Testing

Try these URLs to test deep-linking:

### Open Specific Collection
```
http://127.0.0.1:9292/pages/immersive?open_collection=suffuse
```
Should open the Suffuse collection grid immediately

### Open Specific Product
```
http://127.0.0.1:9292/pages/immersive?open_product={product-handle}
```
Replace `{product-handle}` with an actual product handle from your store

### Open Search Results
```
http://127.0.0.1:9292/pages/immersive?open_search=bridal
```
Should open search results for "bridal"

---

## 🎨 Visual Features to Notice

### Design Elements
- **Glassmorphism**: Frosted glass effect on panels
- **Gold accents**: Pakistani gold (#d4af37) throughout
- **Typography**: Elegant serif headings, clean sans-serif body
- **Animations**: Smooth transitions, fade-ins, parallax

### Responsive Behavior
- Resize your browser window
- Try mobile view (DevTools → Toggle Device Toolbar)
- Notice reduced parallax on mobile
- Touch-friendly hotspots

### Accessibility
- Try keyboard navigation (Tab, Shift+Tab, Escape)
- Check focus indicators
- Try with reduced motion (System Preferences → Accessibility → Display → Reduce motion)

---

## 📱 Mobile Testing

### Using Browser DevTools
1. Open DevTools (F12 or Cmd+Opt+I)
2. Click "Toggle Device Toolbar" (Cmd+Shift+M)
3. Select a mobile device (iPhone 12, Pixel 5, etc.)
4. Reload the page
5. Notice:
   - Mobile-optimized textures
   - Reduced parallax strength
   - Touch-friendly hotspots
   - Tilt control toggle (experimental)

---

## 🐛 What to Look For

### Things That Should Work
- ✅ Smooth room transitions
- ✅ Parallax effect on mouse move
- ✅ Hotspots clickable and accessible
- ✅ Editorial overlays open/close smoothly
- ✅ Glass panels fetch content correctly
- ✅ Add to cart works
- ✅ Wishlist saves items
- ✅ Search returns results
- ✅ Close buttons restore focus
- ✅ Keyboard navigation works
- ✅ No console errors

### Things to Test
- [ ] Does the parallax feel smooth?
- [ ] Are hotspots easy to find and click?
- [ ] Do editorial overlays scroll smoothly?
- [ ] Do collection grids load quickly?
- [ ] Does add-to-cart work?
- [ ] Does the wishlist persist?
- [ ] Does search work?
- [ ] Does the 3D→2D switch work?
- [ ] Does reduced motion disable animations?

---

## 🎬 Recommended Viewing Order

### First Time Viewing
1. Start at `/pages/immersive`
2. Wait for onboarding overlay (if enabled)
3. Dismiss onboarding → see Storefront room
4. Move mouse → feel the parallax
5. Click "Enter Store" → Lounge room
6. Click "Explore Designers" → Designer Houses editorial
7. Scroll through designers
8. Click "Explore Collection" on Suffuse
9. Browse products in grid
10. Click a product → see product detail
11. Close panel → back to editorial
12. Close editorial → back to Lounge
13. Try the other 2 editorials
14. Click 3D→2D switch → return to homepage

### Second Viewing (Deep Features)
1. Test deep-linking with URL parameters
2. Try the wishlist feature
3. Test search functionality
4. Try Virtual Try-On (if logged in)
5. Test keyboard navigation
6. Test mobile view
7. Test reduced motion

---

## 📊 Performance Monitoring

### Open DevTools Performance Tab
1. F12 → Performance tab
2. Start recording
3. Navigate through rooms
4. Stop recording
5. Look for:
   - Frame rate (should be 60fps)
   - Long tasks (should be minimal)
   - Layout shifts (should be none)

### Network Tab
1. F12 → Network tab
2. Reload page
3. Look for:
   - Three.js loaded (three.min.js)
   - immersive-store.js loaded
   - Texture images loaded
   - Section Rendering API calls

---

## 🎯 Key URLs Reference

| What | URL |
|------|-----|
| **Local Homepage** | http://127.0.0.1:9292/ |
| **Local Immersive Store** | http://127.0.0.1:9292/pages/immersive |
| **Shopify Preview** | https://shahana-uk.myshopify.com/?preview_theme_id=191085937022 |
| **Theme Editor** | https://shahana-uk.myshopify.com/admin/themes/191085937022/editor?hr=9292 |

---

## 💡 Pro Tips

1. **Keep DevTools Console open** — watch for any errors or warnings
2. **Use Network tab** — see Section Rendering API calls in action
3. **Try keyboard navigation** — Tab through everything
4. **Test on real mobile device** — use the Shopify preview URL
5. **Check different browsers** — Chrome, Firefox, Safari
6. **Test with slow connection** — DevTools → Network → Throttling
7. **Test with reduced motion** — System preferences

---

## 🚀 Next Steps

After viewing:
1. Read `IMMERSIVE_STORE_GUIDE.md` for full architecture
2. Check `immersive-store.md` for development guidelines
3. Review `immersive-known-gaps.md` for known issues
4. Explore the code in `assets/immersive-store.js`
5. Check section files in `sections/immersive-*.liquid`

---

## 🛑 To Stop the Server

When you're done viewing:
```bash
# Press Ctrl+C in the terminal where the server is running
# Or use Kiro to stop the process
```

---

**Enjoy exploring the immersive store! 🎉**
