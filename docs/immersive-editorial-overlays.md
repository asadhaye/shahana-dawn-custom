# Immersive Editorial Overlays

Three editorial overlays provide narrative experiences for key rooms in the immersive store. Each opens via hotspot and uses Section Rendering API to inject content into `#immersive-editorial-overlay`.

---

## 1. Designer Hub (`designer_houses` room)

**Opened by:** "Explore Designers" hotspot

### Structure

```
┌─────────────────────────────────────┐
│ Hero (per designer)                │
│ ┌─────┐  ┌────────────────────┐   │
│ │ IMG │  │ LOGO + MANIFESTO    │   │
│ └─────┘  └────────────────────┘   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Timeline Rail                      │
│ [Suffuse][Soraya][Saad Bin Shahzad]│
│    ↑ thumb slides                 │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Designer Products Grid              │
│ [Product] [Product] [Product]     │
└─────────────────────────────────────┘
```

### Blocks

| Block | Settings | Description |
|-------|---------|-------------|
| `designer` | `image`, `logo`, `heading`, `body`, `collection` | Designer hero + products |

### Interaction

- Timeline markers slide on click
- Hero switches to selected designer
- Products load via `/collections/{handle}?sections=immersive-designer-grid`

---

## 2. Occasions Story (`occasions` room)

**Opened by:** "Our Occasions" hotspot

### Structure

```
┌─────────────────────────────────────┐
│ Hero: Heading + Subheading          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Chapter 1 (Eid)                  │
│ [Image] [Eyebrow + Heading]       │
│ [View Collection →]             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Chapter 2 (Bridal & Mehndi)        │
│ [Image] [Eyebrow + Heading]       │
│ [View Collection →]             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ ... (vertical scroll)              │
└─────────────────────────────────────┘
```

### Blocks

| Block | Settings | Description |
|-------|---------|-------------|
| `occasion_card` | `image`, `heading`, `body`, `collection`, `cta_url` | Story chapter |

### Interaction

- Scroll through chapters (Eid → Bridal & Mehndi → Dawat → Nikah)
- "View Collection" opens glass panel via `data-collection` attribute

---

## 3. Featured Collections (`featured_collections` room)

**Opened by:** "Featured Stories" hotspot

### Structure

```
┌─────────────────────────────────────┐
│ Optional Hero: Heading + Subheading  │
└─────────────────────────────────────┐
┌──────────┐ ┌──────────┐ ┌──────────┐
│ [IMG]   │ │ [IMG]   │ │ [IMG]   │
│ Heading │ │ Heading │ │ Heading │
│ Body    │ │ Body    │ │ Body    │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ [IMG]   │ │ [IMG]   │
│ Heading │ │ Heading │
└──────────┘ └──────────┘
```

### Blocks

| Block | Settings | Description |
|-------|---------|-------------|
| `featured_item` | `image`, `heading`, `body`, `collection`, `cta_url` | Gallery card |

### Interaction

- Grid gallery for browsing multiple collections
- Click opens glass panel or navigates to CTA URL

---

## Room Hotspot Mapping

| Room | Hotspot | Opens Overlay |
|------|--------|-----------|
| `designer_houses` | "Explore Designers" | Designer Hub |
| `designer_houses` | "Suffuse", "Soraya", "Saad Bin Shahzad" | Direct collection (shortcut) |
| `occasions` | "Our Occasions" | Occasions Story |
| `occasions` | "Eid Collection", "Bridal & Mehndi", "Luxury Formals", "Casual Pret" | Direct collection (shortcut) |
| `featured_collections` | "Featured Stories" | Featured Collections |
| `featured_collections` | "SS5 Summer Pret '26", "Suffuse Luxury Pret", "Soraya Eid Pret" | Direct collection (shortcut) |

---

## Technical Implementation

### Section Rendering API

All overlays load via:
```javascript
fetchUrl = '/pages/immersive?sections=editorial_{room_key}';
// or
fetchUrl = '/collections/{handle}?sections=immersive-designer-grid';
```

### JavaScript Functions

| Function | File | Description |
|----------|------|-------------|
| `openEditorialOverlay()` | `immersive-store.js` | Opens overlay and fetches content |
| `initDesignersEditorial()` | `immersive-store.js` | Initializes timeline/toggle |
| `loadDesignerGrid()` | `immersive-store.js` | Loads products on marker click |
| `initEditorialHeroParallax()` | `immersive-store.js` | Parallax effect |

### CSS Classes

| Class Prefix | Description |
|-------------|-------------|
| `.immersive-designers__*` | Designer Hub components |
| `.immersive-occasions__*` | Occasions Story components |
| `.immersive-featured__*` | Featured Collections components |
| `.immersive-editorial__*` | Shared Editorial components |