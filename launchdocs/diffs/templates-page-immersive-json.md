# templates/page.immersive.json — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: FAB icon SVG replaced — embedded PNG → simple monogram

### launch-readiness-fixes
The `fab_icon_svg` setting contained a large base64-encoded PNG image embedded inside an SVG `<image>` tag (~3KB of base64 data).

### main
```json
"fab_icon_svg": "<svg viewbox=\"0 0 40 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><text x=\"50%\" y=\"54%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"serif\" font-size=\"22\" font-weight=\"700\" fill=\"#d4af37\">S</text></svg>"
```

**Impact:** FAB icon is now a simple "S" monogram SVG instead of an embedded PNG. Much smaller, scales cleanly, and matches the brand aesthetic.

---

## Change 2: `transition_style` setting removed

### launch-readiness-fixes
```json
"transition_style": "crossfade"
```

### main
Removed.

**Impact:** Consistent with the schema change in `immersive-canvas.liquid` — the transition style setting is gone.

---

## Change 3: Maria B designer block removed

### launch-readiness-fixes
```json
"designer_FiGk6q": {
  "type": "designer",
  "settings": {
    "image": "shopify://shop_images/Maria_B.jpg",
    "heading": "Maria B",
    "body": "",
    "collection": "maria-b"
  }
}
```
And in `block_order`:
```json
"designer_FiGk6q"
```

### main
Removed from both `blocks` and `block_order`.

**Impact:** Maria B is no longer listed as a designer in the editorial section. The remaining designers are Suffuse, Soraya, and Saad Bin Shahzad.
