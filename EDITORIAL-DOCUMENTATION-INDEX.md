# Editorial Documentation Index

**Complete guide to the 3 editorial rooms in the Shahana Collection immersive store**

---

## Documents Created

### 1. **EDITORIAL-PAGES-GUIDE.md** (Comprehensive)
**Best for:** Understanding the complete editorial architecture and how it works

**Covers:**
- Overview of the 3 editorial rooms
- Room structure and hotspot definitions
- How rooms are configured in the theme editor
- User flow from 3D room to editorial overlay
- Detailed breakdown of each editorial room (Designer Houses, Occasions, Featured Collections)
- Technical flow diagram
- Key Three.js functions (`enterEditorialMode`, `exitEditorialMode`, `updateCameraForMode`)
- Key Liquid sections (`immersive-editorial.liquid`)
- Scroll parallax effect ("sinking room" illusion)
- View Transition animation (hotspot morph)
- Focus management and accessibility
- State management
- SEO and accessibility considerations
- Example: Adding a fourth editorial

**Use when:** You need to understand the complete editorial system

---

### 2. **EDITORIAL-ARCHITECTURE-SUMMARY.md** (Strategic)
**Best for:** High-level overview and architectural decisions

**Covers:**
- The big picture (5 rooms, 3 editorial)
- Three editorial rooms explained
- Technical architecture and data flow
- State management
- The "sinking room" effect
- View Transition animation
- Focus management
- Configuration hierarchy
- Editorial section instances
- Summary for Three.js tool
- Next steps for implementation

**Use when:** You need to understand the overall architecture and design decisions

---

### 3. **EDITORIAL-QUICK-REFERENCE.md** (Tactical)
**Best for:** Quick lookup of specific details

**Covers:**
- 3 editorial rooms at a glance (table)
- Hotspot positions for each room
- Theme editor configuration settings
- Editorial section settings and blocks
- Key functions
- CSS classes
- Locale keys
- State variables
- localStorage keys
- File locations
- Common tasks (how to add banners, change images, etc.)
- Troubleshooting guide
- Performance tips

**Use when:** You need to quickly find specific information

---

## How to Use These Documents

### For Three.js Developers

1. **Start with:** EDITORIAL-ARCHITECTURE-SUMMARY.md
   - Understand the 5 rooms and 3 editorial rooms
   - Understand the data flow
   - Understand state management

2. **Then read:** EDITORIAL-PAGES-GUIDE.md (sections on Three.js functions)
   - Understand `enterEditorialMode()` and `exitEditorialMode()`
   - Understand scroll parallax implementation
   - Understand View Transition animation

3. **Reference:** EDITORIAL-QUICK-REFERENCE.md
   - Look up function signatures
   - Look up state variables
   - Look up CSS classes

### For Liquid/Theme Developers

1. **Start with:** EDITORIAL-ARCHITECTURE-SUMMARY.md
   - Understand the configuration hierarchy
   - Understand editorial section instances

2. **Then read:** EDITORIAL-PAGES-GUIDE.md (sections on Liquid sections)
   - Understand `immersive-editorial.liquid` structure
   - Understand theme editor configuration
   - Understand Section Rendering API pattern

3. **Reference:** EDITORIAL-QUICK-REFERENCE.md
   - Look up theme editor settings
   - Look up section settings and blocks
   - Look up locale keys

### For Designers/Merchants

1. **Start with:** EDITORIAL-QUICK-REFERENCE.md (Common Tasks section)
   - How to add a new editorial banner
   - How to change a room's base image
   - How to change a collection hotspot
   - How to adjust parallax depth

2. **Then read:** EDITORIAL-PAGES-GUIDE.md (sections on the 3 editorial rooms)
   - Understand what each room is for
   - Understand the layout variants
   - Understand the scroll parallax effect

### For Project Managers/Architects

1. **Start with:** EDITORIAL-ARCHITECTURE-SUMMARY.md
   - Understand the big picture
   - Understand the data flow
   - Understand the configuration hierarchy

2. **Then read:** EDITORIAL-PAGES-GUIDE.md (sections on technical flow)
   - Understand how editorial overlays are triggered
   - Understand the View Transition animation
   - Understand focus management

---

## Key Concepts

### The 3 Editorial Rooms

| Room | Purpose | Layout | Collections |
|------|---------|--------|-------------|
| **Designer Houses** | Showcase luxury brands | 3-col brand tiles | Suffuse, Soraya, Saad Bin Shahzad |
| **Occasions** | Curate by occasion | 4-col story grid | Eid, Bridal, Formals, Casual |
| **Featured Collections** | Seasonal collections | 2-col alternating | SS5 Summer, Suffuse Luxury, Soraya Eid |

### The User Flow

```
User in 3D Room
    ↓
Clicks Editorial Hotspot (e.g., "Explore Designers")
    ↓
enterEditorialMode('designer_houses', hotspotEl)
    ↓
Fetch editorial section via Section Rendering API
    ↓
Render into overlay with View Transition animation
    ↓
User reads editorial content with scroll parallax
    ↓
User clicks back button or presses Escape
    ↓
exitEditorialMode()
    ↓
Back to 3D Room
```

### The "Sinking Room" Effect

As user scrolls the editorial overlay:
- **Foreground objects** sink DOWN
- **Background objects** shift UP
- **Result:** Powerful 3D depth illusion

### View Transition Animation

When entering editorial mode:
- Hotspot morphs into overlay
- Smooth animation via View Transition API
- Fallback to instant transition for unsupported browsers

---

## File Structure

```
.kiro/specs/immersive-journey-bridges/
├── requirements.md
├── design.md
└── tasks.md

sections/
├── immersive-canvas.liquid          # Renders JSON config block
├── immersive-editorial.liquid       # Reusable editorial section
├── main-collection-product-grid.liquid
├── main-search.liquid
├── main-product.liquid
├── main-cart-items.liquid
├── main-list-collections.liquid
├── main-blog.liquid
└── main-article.liquid

assets/
├── immersive-store.js               # Three.js engine + editorial functions
├── bridge-behavior.js               # Device-aware behavior
└── three.min.js

templates/
└── page.immersive.json              # Includes 3 immersive-editorial sections

locales/
└── en.default.json                  # Translation keys

layout/
└── theme.liquid                     # Loads scripts conditionally

snippets/
└── immersive-bridge-btn.liquid      # Bridge CTA component
```

---

## Key Functions

### Three.js Functions

| Function | Purpose |
|----------|---------|
| `enterEditorialMode(roomKey, triggerEl)` | Open editorial overlay |
| `exitEditorialMode()` | Close editorial overlay |
| `updateCameraForMode()` | Adjust camera for editorial mode |
| `mergeDynamicRoomConfig()` | Merge theme editor config into STORE_ROOMS |
| `goToRoom(roomKey)` | Navigate to a 3D room |
| `renderHotspots(roomKey)` | Render hotspots for a room |

### Liquid Sections

| Section | Purpose |
|---------|---------|
| `immersive-canvas.liquid` | Main canvas + UI layer + JSON config |
| `immersive-editorial.liquid` | Reusable editorial section (one per room) |
| `immersive-product-grid.liquid` | Product grid for collection panels |
| `glass-product.liquid` | Product detail view |

---

## Configuration

### Theme Editor Settings

All 5 rooms are fully configurable from **Customize → Homepage → Immersive Canvas**:

- Base images (desktop + mobile)
- Depth maps (desktop + mobile)
- Collection hotspots (3-4 per room)
- Hotspot labels

### Editorial Section Settings

Each editorial is configured from **Customize → Sections → Immersive Editorial**:

- Room key (which room)
- Layout (designers, occasions, collections)
- Hero background image
- Hero eyebrow, heading, subheading
- Banner blocks (unlimited)

---

## Performance

### Optimization Techniques

1. **Cache overlay element** on entry
2. **Only read `scrollTop`** per frame (cheap)
3. **Lerp scroll progress** for smooth animation
4. **Clear cached values** on exit
5. **Use `requestAnimationFrame`** for animations
6. **Lazy-load images** in editorial content
7. **Respect `prefers-reduced-motion`** for animations

### Metrics

- **Scroll parallax:** 0.06 (mobile) to 0.12 (desktop) parallax strength
- **Lerp factor:** 0.1 (smooth animation)
- **Decay factor:** 0.85 (smooth reset on exit)
- **View Transition:** Instant on unsupported browsers

---

## Accessibility

### Features

- ✅ Focus trap in editorial overlay
- ✅ Escape key closes overlay
- ✅ Focus restored to hotspot on exit
- ✅ ARIA labels on all interactive elements
- ✅ Semantic HTML (section, h2, p, a, button)
- ✅ Reduced motion support
- ✅ Keyboard navigation (Tab, Shift+Tab)
- ✅ Screen reader support

### ARIA Attributes

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-editorial-overlay-heading"
  aria-hidden="true"
>
```

---

## SEO

### Considerations

- ✅ Editorial sections rendered in initial HTML (not JS-only)
- ✅ Semantic HTML with proper heading hierarchy
- ✅ Crawlable links to collections and products
- ✅ Canonical URLs remain clean (no query params)
- ✅ No duplicate content issues
- ✅ Proper internal linking structure

---

## Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Editorial overlay doesn't open | Section instance ID not found | Verify `data-section-id` on section |
| Scroll parallax not working | Uniforms not updated | Check `editorialScrollProgress` calculation |
| Hotspot doesn't morph | View Transition API not supported | Expected on Safari/Firefox (instant transition) |
| Focus not restored | `lastHotspot` not saved | Verify `immersiveState.lastHotspot = triggerEl` |
| Editorial content not loading | Section Rendering API fetch failed | Check network tab for errors |

---

## Next Steps

### For Implementation

1. **Understand the architecture** (read EDITORIAL-ARCHITECTURE-SUMMARY.md)
2. **Understand the details** (read EDITORIAL-PAGES-GUIDE.md)
3. **Reference specific details** (use EDITORIAL-QUICK-REFERENCE.md)
4. **Implement changes** (follow Common Tasks in EDITORIAL-QUICK-REFERENCE.md)

### For Maintenance

1. **Keep theme editor config in sync** with room definitions
2. **Keep locale keys up to date** with editorial content
3. **Monitor performance** (scroll parallax, View Transition animation)
4. **Test accessibility** (keyboard navigation, screen readers)
5. **Test on multiple browsers** (Chrome, Firefox, Safari, Edge)

---

## Related Documentation

- **DEPLOYMENT-CHECKLIST.md** — 48-hour deployment verification guide
- **TROUBLESHOOTING-GUIDE.md** — Solutions for common issues
- **IMPLEMENTATION-REVIEW.md** — Technical review of the feature
- **IMMERSIVE-STORE.md** — Complete immersive store architecture

---

**Happy coding!** 🎨✨
