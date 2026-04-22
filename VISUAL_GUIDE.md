# Visual Guide — Floating Assistive Ball

## Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  ☰ Menu    [🔍 ═══════ Search Bar ═══════ ⌘K]    👤 Account │ ← HEADER (Cleaner)
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                    🏛️ Immersive Store                        │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│                                                               │
│  "Explore luxury fashion in 3D"  ← TAGLINE (Larger)         │
│                                                               │
│                                                          ┌──┐ │
│                                                          │ S│ │ ← FAB
│                                                          └──┘ │   (Floating)
└─────────────────────────────────────────────────────────────┘
```

## FAB States

### Closed State
```
┌──────┐
│  S   │  ← Trigger button only
└──────┘
```

### Open State
```
┌──────┐
│  ❤️  │  ← Wishlist (with badge if items saved)
└──────┘
   ↓
┌──────┐
│  🛍️  │  ← Cart (with badge if items in cart)
└──────┘
   ↓
┌──────┐
│  🖥️  │  ← Classic Store
└──────┘
   ↓
┌──────┐
│  S   │  ← Trigger (rotated 45°)
└──────┘
```

### With Hover Labels
```
                    ┌──────────┐
                    │ Wishlist │ ← Label appears on hover
                    └──────────┘
┌──────┐                 ↓
│  ❤️  │ ←──────────────┘
└──────┘
```

## Header Comparison

### Before
```
┌─────────────────────────────────────────────────────────────┐
│  ☰  [🔍 Search]  👤  ❤️  🛍️  📱  🔄                          │
│  │    (Small)   │   │   │   │   └─ Mode Switch             │
│  │              │   │   │   └───── Tilt Toggle             │
│  │              │   │   └───────── Cart                     │
│  │              │   └───────────── Wishlist                 │
│  │              └───────────────── Account                  │
│  └──────────────────────────────── Menu                     │
└─────────────────────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────────────────────┐
│  ☰  [🔍 ═══════ Search Bar ═══════ ⌘K]  👤                 │
│  │         (Larger, Responsive)          │                  │
│  │                                       └─ Account          │
│  └───────────────────────────────────────── Menu            │
└─────────────────────────────────────────────────────────────┘
```

## Search Bar Sizes

### Desktop (≥1025px)
```
[🔍 ═══════════════════════════════════════ ⌘K]
     280px minimum ↔ 480px maximum
```

### Tablet (769-1024px)
```
[🔍 ═══════════════════════════ ⌘K]
     240px minimum ↔ 360px maximum
```

### Mobile (481-768px)
```
[🔍 ═══════════════════]
     200px ↔ 280px
```

### Small Mobile (≤480px)
```
[🔍 ═══════════]
     180px ↔ 220px
```

## FAB Sizes

### Desktop
```
┌────────────┐
│            │
│     S      │  56px × 56px
│            │
└────────────┘
```

### Mobile
```
┌───────────┐
│           │
│    S      │  52px × 52px
│           │
└───────────┘
```

## Tagline Size Comparison

### Before
```
"Explore luxury fashion in 3D"
         (1.125rem / 18px)
```

### After
```
"Explore luxury fashion in 3D"
         (1.5rem / 24px)
         ↑ 33% larger
```

## FAB Animation Sequence

### Opening (0.3s total)
```
Frame 1 (0ms):     Frame 2 (50ms):    Frame 3 (100ms):   Frame 4 (150ms):
┌──────┐           ┌──────┐            ┌──────┐            ┌──────┐
│  S   │           │  ❤️  │ ← Fade in  │  ❤️  │            │  ❤️  │
└──────┘           └──────┘            └──────┘            └──────┘
                   ┌──────┐            ┌──────┐            ┌──────┐
                   │  S   │            │  🛍️  │ ← Fade in  │  🛍️  │
                   └──────┘            └──────┘            └──────┘
                                       ┌──────┐            ┌──────┐
                                       │  S   │            │  🖥️  │ ← Fade in
                                       └──────┘            └──────┘
                                                           ┌──────┐
                                                           │  ⤫   │ ← Rotated
                                                           └──────┘
```

## Interaction Flow

### User Journey
```
1. User sees FAB in corner
   ┌──────┐
   │  S   │
   └──────┘

2. User clicks FAB
   ┌──────┐
   │  ⤫   │ ← Rotates 45°
   └──────┘
   Menu opens ↑

3. User hovers over action
   ┌──────────┐
   │ Wishlist │ ← Label appears
   └──────────┘
        ↓
   ┌──────┐
   │  ❤️  │ ← Scales 1.1×
   └──────┘

4. User clicks action
   → Wishlist panel opens
   → FAB menu closes
   → Focus returns to trigger
```

## Responsive Behavior

### Desktop (≥1025px)
```
┌─────────────────────────────────────────────────────────────┐
│  ☰  [🔍 ═══════════════════════════════════════ ⌘K]  👤    │
│                                                               │
│                                                               │
│                                                               │
│                                                          ┌──┐ │
│  "Explore luxury fashion in 3D" (1.5rem)                │ S│ │
│                                                          └──┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tablet (769-1024px)
```
┌──────────────────────────────────────────────────────┐
│  ☰  [🔍 ═══════════════════════ ⌘K]  👤            │
│                                                      │
│                                                      │
│                                                 ┌──┐ │
│  "Explore luxury fashion in 3D" (1.5rem)       │ S│ │
│                                                 └──┘ │
└──────────────────────────────────────────────────────┘
```

### Mobile (≤768px)
```
┌────────────────────────────────────────┐
│  ☰  [🔍 ═══════════]  👤              │
│                                        │
│                                        │
│                                   ┌──┐ │
│  "Explore luxury fashion" (1.25rem)│S│ │
│                                   └──┘ │
└────────────────────────────────────────┘
```

## Color Scheme

### FAB Colors
```
Trigger Button:
├─ Background: rgba(10, 10, 10, 0.92) — Dark with transparency
├─ Border: rgba(212, 175, 55, 0.6) — Gold at 60% opacity
├─ Icon: #d4af37 — Solid gold
└─ Shadow: rgba(0, 0, 0, 0.5) — Soft black shadow

Action Buttons:
├─ Background: rgba(10, 10, 10, 0.88) — Slightly lighter
├─ Border: rgba(212, 175, 55, 0.3) — Gold at 30% opacity
├─ Icon: rgba(245, 240, 232, 0.75) — Off-white at 75%
└─ Hover Icon: #d4af37 — Solid gold

Labels:
├─ Background: rgba(10, 10, 10, 0.9) — Dark
├─ Border: rgba(212, 175, 55, 0.25) — Gold at 25%
└─ Text: rgba(245, 240, 232, 0.85) — Off-white at 85%

Badges:
├─ Background: #d4af37 — Solid gold
└─ Text: #000 — Black
```

## Accessibility Features

### Keyboard Navigation
```
Tab → Focus FAB trigger
Enter → Open menu
Tab → Focus first action (Wishlist)
Tab → Focus second action (Cart)
Tab → Focus third action (Classic Store)
Escape → Close menu, return focus to trigger
```

### Screen Reader Announcements
```
FAB Trigger:
"Navigation menu button, collapsed"

When opened:
"Navigation menu button, expanded"

Wishlist Action:
"Wishlist button, 3 items saved"

Cart Action:
"Cart button, 2 items in cart"

Classic Store Action:
"Classic store link"
```

## Custom Icon Examples

### Default (Shahana 'S')
```
┌──────┐
│      │
│  S   │  ← Serif font, gold color
│      │
└──────┘
```

### Brand Logo
```
┌──────┐
│      │
│  🏛️  │  ← Custom brand icon
│      │
└──────┘
```

### Shopping Bag
```
┌──────┐
│      │
│  🛍️  │  ← Shopping bag icon
│      │
└──────┘
```

### Sparkle
```
┌──────┐
│      │
│  ✨  │  ← Sparkle/star icon
│      │
└──────┘
```

## Summary

The Floating Assistive Ball provides:
- ✨ **Modern Design**: Circular, floating, elegant
- 🎨 **Customizable**: Merchant can change icon
- 📱 **Responsive**: Works on all screen sizes
- ♿ **Accessible**: Keyboard, screen reader, reduced motion
- 🚀 **Efficient**: Quick access to key actions

All while keeping the header clean and the search bar prominent!
