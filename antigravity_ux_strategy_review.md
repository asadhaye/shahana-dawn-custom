# Immersive Store UX Review: Bridging WebGL and DOM

Your architecture is highly impressive. Utilizing a single-canvas WebGL setup with depth maps, dynamic routing via the Section Rendering API, and ARIA-compliant dialogs is definitely a top-tier approach for Shopify. 

The reason you are feeling "stuck" and experiencing a disjointed feeling between `immersive-store.js` and `immersive-editorial.liquid` comes down to **spatial context**.

Right now, a user is meant to feel like they are *standing inside a room*. When they click an editorial hotspot and the browser scrolls down to a standard DOM section underneath the canvas, the canvas leaves the viewport. The user’s mental model breaks immediately—they are no longer "inside a room", they are just on a normal webpage.

Here are the two best ways to merge them into a **single, unbroken user experience**, along with concrete implementation steps.

---

## Option 1: The "Fixed Spatial Scroll" Overlay (Highly Recommended)
*Use case: Apple-style story telling. Keep the WebGL scene as the background of the editorial.*

Instead of scrolling the canvas out of view, we make the canvas `position: fixed` behind the page. When the user enters "Editorial Mode", the HTML editorial content scrolls **over the top** of the 3D room using glassmorphic backgrounds, so the 3D room is still subtly visible behind the text.

### How to implement:

**1. Update the Canvas CSS**
Make the WebGL wrapper stick to the background.
```css
#immersive-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
```

**2. Update Editorial Sections CSS**
Make the editorial sections sit inside an overlay layer that lives *above* the canvas but starts hidden. 
When active, its background should be mostly transparent or frosted glass so the 3D scene bleeds through.
```css
.immersive-editorial-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none; /* Ignore scrolls when inactive */
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 10; 
}
.immersive-editorial-wrapper.is-active {
  pointer-events: auto;
  opacity: 1;
}

.immersive-editorial-section {
  display: none;
  background: rgba(15, 15, 15, 0.4); /* Dark glass */
  backdrop-filter: blur(12px); /* Let the WebGL bleed through */
}
.immersive-editorial-section.is-current {
  display: block;
}
```

**3. Update `immersive-store.js`**
Rewrite `enterEditorialMode()` so it doesn't scroll down the page, but rather un-hides the glass editorial wrapper and blurs the WebGL.

```javascript
function enterEditorialMode(roomKey) {
  // 1. Activate the wrapper
  document.querySelector('.immersive-editorial-wrapper').classList.add('is-active');
  
  // 2. Hide all and show target
  document.querySelectorAll('.immersive-editorial-section').forEach(el => el.classList.remove('is-current'));
  document.getElementById(`immersive-editorial-${roomKey}`).classList.add('is-current');

  // 3. Optional: Blur the WebGL rendering or push the depth map back
  // You can apply a CSS blur to the canvas element, or tweak uniforms.
  document.getElementById('immersive-canvas').style.filter = "blur(8px)";
  
  // 4. Reset scroll
  window.scrollTo(0, 0);
  
  trackImmersiveEvent('editorial_entered', { room: roomKey });
}
```
> [!IMPORTANT]
> You will need to add a "Close" or "Back to Room" floating button inside the Editorial sections that calls an `exitEditorialMode()` function to reverse these classes.

---

## Option 2: The "Immersive Panel" Approach
*Use case: Consistency. Treat Editorials the exact same way you treat Products and Collections.*

Since you already use a slide-out glass panel (`glass-panel.liquid`) for Collections and Products, you can reuse this mental model. Instead of placing the `immersive-editorial.liquid` sections permanently at the bottom of the homepage, fetch them via the **Section Rendering API** dynamically into the glass panel.

### How to implement:

**1. Re-use your `fetchWithCache` logic**
When a user clicks the Editorial hotspot, open the same Glass Panel used for products, but inject the editorial HTML.

```javascript
function enterEditorialMode(roomKey) {
  // Assuming you have a hidden page for rendering, or you render via a dummy page:
  const fetchUrl = shopRoot + `pages/editorial-content?section_id=immersive-editorial-${roomKey}`;
  
  openDialogFocus('editorial-panel'); 
  
  fetchWithCache(fetchUrl).then(html => {
    document.getElementById('glass-panel-content').innerHTML = html;
  });
}
```

> [!NOTE]
> *Wait, how do we target specific sections?* Shopify's Section Rendering API requires a section ID that actually exists on the URL being requested. A better approach for Shopify is to create a template suffix (e.g., `page.editorial-designer.liquid`) containing strictly the editorial section, and fetch *that* page URL with `?section_id=...`

**Why Option 2 is powerful:** 
- **Code reuse:** You use the exact same JS dialog logic, caching, and open/close animations you built for products.
- **Mental Model:** "Clicking a hotspot opens a glass panel" is universally applied across the entire immersive experience, enforcing UX predictability.

---

## Final UX Polish Recommendations

If you want to absolutely **WOW** the user, here are three micro-interactions to add to your JS:

> [!TIP]
> **Parallax linked to Scroll (if using Option 1)**
> Inside your `animate()` loop, grab `window.scrollY`. Map it to a slight Z-scale or Y-offset in your `uniforms.uMouse`. This way, as the user scrolls *down* reading the Editorial DOM, the 3D room behind the frosted glass imperceptibly rotates or sinks deeper into the background.

> [!TIP]
> **Transition Hotspots**
> Before firing `enterEditorialMode()`, scale up the hotspot button out of the screen using `document.startViewTransition()`. Make the HTML editorial fade in *from* the coordinates of the clicked hotspot.

> [!TIP]
> **Audio / Haptics**
> A tiny soft "woosh" or ambient sound effect when diving into an editorial room completely sells the transition from "Shopping Mode" to "Story Mode".
