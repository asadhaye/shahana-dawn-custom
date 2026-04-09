---
name: "shopify-liquid-theme"
displayName: "Shopify Liquid Theme"
description: "Comprehensive guide for building Shopify Liquid themes covering architecture, schema, Liquid syntax, CSS/JS standards, and WCAG 2.2 accessibility patterns. Use when creating or editing sections, blocks, snippets, or any .liquid file."
keywords: ["shopify", "liquid", "theme", "dawn", "sections", "schema", "accessibility", "wcag", "bem", "web-components"]
author: "Shopify"
---

# Shopify Liquid Theme

## Overview

This power packages three official Shopify skill guides for building production-quality Liquid themes:

- **shopify-liquid-themes** — Architecture, Liquid syntax, filters, tags, objects, schema, translations
- **liquid-theme-standards** — CSS (BEM, design tokens, logical properties), JavaScript (Web Components, no dependencies), HTML standards
- **liquid-theme-a11y** — WCAG 2.2 patterns for every e-commerce component: product cards, carousels, modals, cart drawers, forms, filters, price display

## Available Steering Files

- **liquid-themes** — Full Liquid syntax reference, schema/settings (33 types), filter/tag/object quick references, LiquidDoc, translations
- **theme-standards** — CSS BEM naming, design tokens, CSS custom properties, JS Web Component pattern, progressive enhancement, JSON template editing with `jq`
- **theme-a11y** — WCAG 2.2 component patterns, focus management, keyboard navigation, live regions, reduced motion, color contrast

Load the steering file most relevant to your current task. For a full feature build you may need all three.

## Quick Decision Guide

| Task | Load |
|------|------|
| Writing a section, block, or snippet | `liquid-themes` |
| Schema settings, `visible_if`, presets | `liquid-themes` |
| Translations / `t:` filter | `liquid-themes` |
| CSS naming, design tokens, RTL | `theme-standards` |
| JavaScript, Web Components, fetch | `theme-standards` |
| Editing `templates/*.json` or `config/*.json` | `theme-standards` |
| Modal, drawer, focus trap | `theme-a11y` |
| Product card, carousel, tabs | `theme-a11y` |
| Forms, filters, price display | `theme-a11y` |
| Reduced motion, color contrast | `theme-a11y` |

## Key Rules (Always Apply)

- Every user-facing string uses `{{ 'key' | t }}` — no hardcoded English
- Schema labels use `t:` prefix: `"label": "t:labels.heading"`
- `{% stylesheet %}` / `{% javascript %}` do not process Liquid — use inline `style` for dynamic values
- `{% render %}` only (never `{% include %}`)
- Snippets cannot access outer-scope variables — pass everything as render params
- Use `{% doc %}` on all snippets
- Native HTML first (`<dialog>`, `<details>`, `popover`) — add ARIA only when native semantics are insufficient
- Animate only `transform` and `opacity`; always provide `prefers-reduced-motion` overrides
