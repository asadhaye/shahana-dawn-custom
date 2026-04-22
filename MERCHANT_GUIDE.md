# Floating Assistive Ball (FAB) — Merchant Guide

## What's New?

Your immersive store now features a **Floating Assistive Ball** — a modern, elegant navigation element that provides quick access to key shopping actions.

### Visual Changes

#### Before:
- Bottom navigation bar with multiple buttons
- Header with wishlist, cart, and mode switch buttons
- Smaller search bar
- Smaller tagline text

#### After:
- ✨ **Floating circular button** in bottom-right corner with your custom icon
- 🎯 **Cleaner header** with only menu, search, and account
- 🔍 **Larger, more prominent search bar** (responsive across all devices)
- 📝 **Larger tagline text** for better readability

---

## The Floating Assistive Ball

### What It Does

The FAB is a circular button that floats in the **middle-right** of your immersive store (vertically centered on the right edge). This position avoids conflicts with chat widgets and other bottom-right elements. When clicked, it reveals three quick actions:

1. **Wishlist** ❤️ — Opens the customer's saved items
2. **Cart** 🛍️ — Opens the shopping cart
3. **Classic Store** 🖥️ — Returns to the standard 2D storefront

### How It Works

**For Customers:**
- **Drag to reposition**: Click and hold the FAB, then drag to any position on screen
- **Auto-snap**: FAB automatically snaps to the nearest edge (left or right)
- **Position saved**: Your preferred position is remembered across visits
- Click the floating button to open the menu
- Click any action to execute it
- Hover over actions to see labels
- Click outside or press Escape to close
- Badge indicators show wishlist and cart counts

**For You (Merchant):**
- Fully customizable icon via theme editor
- Automatically hides when product panels are open
- Responsive design works on all devices
- Accessible for keyboard and screen reader users

---

## Customizing Your FAB Icon

### Step 1: Access Theme Editor
1. Go to **Online Store** → **Themes**
2. Click **Customize** on your active theme
3. Navigate to the **Immersive Store** page (`/pages/immersive`)

### Step 2: Find FAB Settings
1. Click on the **Immersive Canvas** section
2. Scroll down to **"Assistive Navigation Ball"** header
3. Find the **"FAB icon SVG"** field

### Step 3: Customize the Icon

#### Default Icon
The default icon is your brand's **'S' monogram** in gold:
```html
<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' 
        font-family='serif' font-size='22' font-weight='700' fill='#d4af37'>S</text>
</svg>
```

#### Custom Icon Examples

**Brand Logo:**
```html
<svg viewBox='0 0 24 24' fill='currentColor'>
  <path d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/>
</svg>
```

**Shopping Bag:**
```html
<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
  <path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'/>
  <line x1='3' y1='6' x2='21' y2='6'/>
  <path d='M16 10a4 4 0 0 1-8 0'/>
</svg>
```

**Sparkle:**
```html
<svg viewBox='0 0 24 24' fill='currentColor'>
  <path d='M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5L12 0z'/>
</svg>
```

**Custom Letter:**
```html
<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' 
        font-family='serif' font-size='22' font-weight='700' fill='#d4af37'>A</text>
</svg>
```

### SVG Guidelines

✅ **Do:**
- Use `viewBox` for proper scaling
- Use `currentColor` or `#d4af37` (gold) for colors
- Keep SVG simple and recognizable
- Test on mobile devices
- Use stroke-width of 2 for line icons

❌ **Don't:**
- Use fixed `width` or `height` attributes
- Use complex gradients or filters
- Use external image references
- Make the icon too detailed (won't scale well)

---

## Drag & Drop Positioning

### Customer Experience

Your customers can **drag the FAB to any position** on the screen:

1. **Hover** over the FAB → Cursor changes to a "grab" hand
2. **Click and hold** the FAB button
3. **Drag** to desired position
4. **Release** → FAB snaps to the nearest edge (left or right)
5. **Position is saved** automatically and persists across visits

### Visual Feedback

- **Grab cursor**: Indicates the FAB is draggable
- **Dotted line**: Appears on hover as a subtle hint
- **Smooth animation**: FAB follows the cursor smoothly
- **Edge snapping**: Automatically aligns to left or right edge

### Benefits

✅ **Personalization**: Each customer can position the FAB where they prefer  
✅ **Accessibility**: Customers can move it away from other elements  
✅ **Flexibility**: Works around chat widgets, cookie banners, etc.  
✅ **Persistence**: Position is remembered across sessions  
✅ **Mobile-friendly**: Touch drag works perfectly on mobile devices

### Default Position

If a customer hasn't moved the FAB, it appears in the **middle-right** of the screen (vertically centered on the right edge).

---

## Enhanced Search Bar

### What Changed
- **Larger size** on all devices
- **Better visibility** with enhanced borders
- **Responsive design** that adapts to screen size

### Sizes by Device
- **Desktop**: 280px–480px (flexible width)
- **Tablet**: 240px–360px
- **Mobile**: 200px–280px
- **Small Mobile**: 180px–220px

### Features
- Keyboard shortcut indicator (⌘K on desktop)
- Auto-complete dropdown
- Search products, collections, and rooms
- Enhanced focus states

---

## Larger Tagline Text

The tagline at the bottom of your immersive store is now **33% larger** for better readability:

- **Desktop**: 1.5rem (was 1.125rem)
- **Mobile**: 1.25rem (was 0.95rem)

This makes your brand message more prominent and easier to read.

---

## Accessibility Features

The FAB is built with accessibility in mind:

- ✅ **Keyboard Navigation**: Tab to focus, Enter to activate, Escape to close
- ✅ **Screen Readers**: Proper ARIA labels and announcements
- ✅ **Touch Friendly**: Large tap targets (48px+) for mobile
- ✅ **Reduced Motion**: Animations disabled for users who prefer less motion
- ✅ **Focus Management**: Clear focus indicators and logical tab order

---

## Troubleshooting

### FAB Not Appearing
1. Ensure you're on the `/pages/immersive` page
2. Check that the Immersive Canvas section is enabled
3. Clear browser cache and refresh

### Custom Icon Not Showing
1. Verify SVG syntax is valid (use an SVG validator)
2. Ensure SVG has a `viewBox` attribute
3. Check for unclosed tags or syntax errors
4. Try the default icon first to confirm functionality

### Actions Not Working
1. Ensure wishlist and cart features are enabled
2. Check that the classic store URL is correct
3. Test in a different browser
4. Check browser console for JavaScript errors

---

## Best Practices

### Icon Design
- **Keep it simple**: The icon is small, so avoid complex details
- **Brand consistency**: Use your brand's visual language
- **Test on mobile**: Ensure it's recognizable at small sizes
- **Consider contrast**: Gold (#d4af37) works well on dark backgrounds

### User Experience
- **Don't change too often**: Customers will learn the icon's location
- **Test with real users**: Get feedback on icon recognizability
- **Monitor analytics**: Track usage of wishlist, cart, and classic store links

---

## Support

Need help customizing your FAB?

1. **Theme Documentation**: Check the full theme documentation
2. **Shopify Support**: Contact Shopify support for theme-related questions
3. **Developer**: Reach out to your theme developer for custom modifications

---

## Summary

The Floating Assistive Ball provides:
- ✨ Modern, elegant navigation
- 🎨 Fully customizable icon
- 📱 Mobile-friendly design
- ♿ Accessible for all users
- 🚀 Quick access to key actions

Enjoy your enhanced immersive store experience!
