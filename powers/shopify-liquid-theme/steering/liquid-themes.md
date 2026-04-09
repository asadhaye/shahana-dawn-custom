# Shopify Liquid Themes — Syntax, Schema & Translations

## Theme Architecture

```
.
├── sections/    # Full-width page modules with {% schema %} — hero, product grid, testimonials
├── blocks/      # Nestable components with {% schema %} — slides, feature items, text blocks
├── snippets/    # Reusable fragments via {% render %} — buttons, icons, image helpers
├── layout/      # Page wrappers (must include {{ content_for_header }} and {{ content_for_layout }})
├── templates/   # JSON files defining which sections appear on each page type
├── config/      # Global theme settings (settings_schema.json, settings_data.json)
├── locales/     # Translation files (en.default.json, fr.json, etc.)
└── assets/      # Static CSS, JS, images (prefer {% stylesheet %}/{% javascript %} instead)
```

| Need | Use | Why |
|------|-----|-----|
| Full-width customizable module | Section | Has `{% schema %}`, appears in editor, renders blocks |
| Small nestable component with editor settings | Block | Has `{% schema %}`, can nest inside sections/blocks |
| Reusable logic, not editable by merchant | Snippet | No schema, rendered via `{% render %}`, takes params |
| Logic shared across blocks/snippets | Snippet | Blocks can't `{% render %}` other blocks |

## Liquid Syntax

### Delimiters

- `{{ ... }}` — Output
- `{{- ... -}}` — Output with whitespace trimming
- `{% ... %}` — Logic tag
- `{%- ... -%}` — Logic tag with whitespace trimming

### Critical Gotchas

1. No parentheses in conditions — use nested `{% if %}` instead
2. No ternary — always `{% if cond %}value{% else %}other{% endif %}`
3. `for` loops max 50 iterations — use `{% paginate %}` for larger arrays
4. `contains` only works with strings — can't check objects in arrays
5. `{% stylesheet %}`/`{% javascript %}` don't render Liquid
6. Snippets can't access outer-scope variables — pass as render params
7. `{% include %}` is deprecated — always use `{% render 'snippet_name' %}`
8. `{% liquid %}` tag — multi-line logic without delimiters; use `echo` for output

### Variables

```liquid
{% assign my_var = 'value' %}
{% capture my_var %}computed {{ value }}{% endcapture %}
{% increment counter %}
{% decrement counter %}
```

## Filter Quick Reference

**Array:** `compact`, `concat`, `find`, `find_index`, `first`, `has`, `join`, `last`, `map`, `reject`, `reverse`, `size`, `sort`, `sort_natural`, `sum`, `uniq`, `where`
**String:** `append`, `capitalize`, `downcase`, `escape`, `handleize`, `lstrip`, `newline_to_br`, `prepend`, `remove`, `replace`, `rstrip`, `slice`, `split`, `strip`, `strip_html`, `truncate`, `truncatewords`, `upcase`, `url_decode`, `url_encode`
**Math:** `abs`, `at_least`, `at_most`, `ceil`, `divided_by`, `floor`, `minus`, `modulo`, `plus`, `round`, `times`
**Money:** `money`, `money_with_currency`, `money_without_currency`, `money_without_trailing_zeros`
**Color:** `color_brightness`, `color_darken`, `color_lighten`, `color_mix`, `color_modify`, `color_saturate`, `color_desaturate`, `color_to_hex`, `color_to_hsl`, `color_to_rgb`
**Media:** `image_url`, `image_tag`, `video_tag`, `external_video_tag`, `media_tag`, `model_viewer_tag`
**URL:** `asset_url`, `asset_img_url`, `file_url`, `shopify_asset_url`
**HTML:** `link_to`, `script_tag`, `stylesheet_tag`, `time_tag`, `placeholder_svg_tag`
**Localization:** `t` (translate), `format_address`, `currency_selector`
**Other:** `date`, `default`, `json`, `structured_data`, `font_face`, `font_url`, `payment_button`, `preload_tag`

## Tags Quick Reference

| Category | Tags |
|----------|------|
| Theme | `content_for`, `layout`, `section`, `sections`, `schema`, `stylesheet`, `javascript`, `style` |
| Control | `if`, `elsif`, `else`, `unless`, `case`, `when` |
| Iteration | `for`, `break`, `continue`, `cycle`, `tablerow`, `paginate` |
| Variable | `assign`, `capture`, `increment`, `decrement`, `echo` |
| HTML | `form`, `render`, `raw`, `comment`, `liquid` |
| Documentation | `doc` |

## Objects Quick Reference

**Global:** `cart`, `collections`, `customer`, `localization`, `pages`, `request`, `routes`, `settings`, `shop`, `template`, `theme`, `linklists`, `images`, `blogs`, `articles`, `all_products`, `metaobjects`, `canonical_url`, `content_for_header`, `content_for_layout`, `page_title`, `page_description`, `handle`, `current_page`

| Template | Objects |
|----------|---------|
| `/product` | `product`, `remote_product` |
| `/collection` | `collection`, `current_tags` |
| `/cart` | `cart` |
| `/article` | `article`, `blog` |
| `/blog` | `blog`, `current_tags` |
| `/page` | `page` |
| `/search` | `search` |
| `/customers/*` | `customer`, `order` |

## Schema Tag

### Section schema structure

```json
{
  "name": "t:sections.hero.name",
  "tag": "section",
  "class": "hero-section",
  "limit": 1,
  "settings": [],
  "max_blocks": 16,
  "blocks": [{ "type": "@theme" }],
  "presets": [{ "name": "t:sections.hero.name" }],
  "enabled_on": { "templates": ["index"] },
  "disabled_on": { "templates": ["password"] }
}
```

### Block schema structure

```json
{
  "name": "t:blocks.slide.name",
  "tag": "div",
  "class": "slide",
  "settings": [],
  "blocks": [{ "type": "@theme" }],
  "presets": [{ "name": "t:blocks.slide.name" }]
}
```

### Setting type decision table

| Need | Setting Type | Key Fields |
|------|-------------|------------|
| On/off toggle | `checkbox` | `default: true/false` |
| Short text | `text` | `placeholder` |
| Long text | `textarea` | `placeholder` |
| Rich text (with `<p>`) | `richtext` | — |
| Inline rich text (no `<p>`) | `inline_richtext` | — |
| Number input | `number` | `placeholder` |
| Slider | `range` | `min`, `max`, `default` (all required), `step`, `unit` |
| Dropdown/segmented | `select` | `options: [{value, label}]` |
| Radio buttons | `radio` | `options: [{value, label}]` |
| Text alignment | `text_alignment` | `default: "left"/"center"/"right"` |
| Color picker | `color` | `default: "#000000"` |
| Image upload | `image_picker` | — |
| Video upload | `video` | — |
| External video URL | `video_url` | `accept: ["youtube", "vimeo"]` |
| Product picker | `product` | — |
| Collection picker | `collection` | — |
| Page picker | `page` | — |
| Blog picker | `blog` | — |
| Article picker | `article` | — |
| URL entry | `url` | — |
| Menu picker | `link_list` | — |
| Font picker | `font_picker` | `default` (required) |
| Editor header | `header` | `content` (no `id` needed) |
| Editor description | `paragraph` | `content` (no `id` needed) |
| Color scheme | `color_scheme` | — |
| Metaobject | `metaobject` | `metaobject_type` (required) |
| Product list | `product_list` | `limit` (max 50) |
| Collection list | `collection_list` | `limit` (max 50) |

### `visible_if` pattern

```json
{
  "visible_if": "{{ block.settings.layout == 'vertical' }}",
  "type": "select",
  "id": "alignment",
  "label": "t:labels.alignment",
  "options": [...]
}
```

### Block entry types

- `{ "type": "@theme" }` — Accept any theme block
- `{ "type": "@app" }` — Accept app blocks
- `{ "type": "slide" }` — Accept only the `slide` block type

## CSS & JavaScript in Sections

```liquid
{% stylesheet %}
  .my-component { display: flex; }
{% endstylesheet %}

{% javascript %}
  console.log('loaded');
{% endjavascript %}
```

- One tag each per file — multiple `{% stylesheet %}` tags will error
- No Liquid inside — use CSS variables or inline `style` attributes instead
- Only supported in `sections/`, `blocks/`, and `snippets/`

### `{% style %}` tag (Liquid-aware CSS)

```liquid
{% style %}
  .section-{{ section.id }} {
    background: {{ section.settings.bg_color }};
  }
{% endstyle %}
```

## LiquidDoc (`{% doc %}`)

Required for snippets (always) and blocks rendered via `{% content_for 'block' %}`.

```liquid
{% doc %}
  Brief description of what this file renders.

  @param {type} name - Description of required parameter
  @param {type} [name] - Description of optional parameter

  @example
  {% render 'snippet-name', name: value %}
{% enddoc %}
```

**Param types:** `string`, `number`, `boolean`, `image`, `object`, `array`

## Translations

```liquid
<!-- Correct -->
<h2>{{ 'sections.hero.heading' | t }}</h2>

<!-- With interpolation -->
{{ 'products.price_range' | t: min: product.price_min | money, max: product.price_max | money }}
```

Locale file:
```json
{
  "products": {
    "price_range": "From {{ min }} to {{ max }}"
  }
}
```

### Locale file structure

```
locales/
├── en.default.json          # English translations (required)
├── en.default.schema.json   # Editor setting translations (required)
├── fr.json
└── fr.schema.json
```

### Key naming conventions

- Use snake_case and hierarchical keys (max 3 levels)
- Sentence case for all text
- Schema labels use `t:` prefix: `"label": "t:labels.heading"`
- Group by component: `sections.hero.heading`, `blocks.slide.title`

### Passing translations to JavaScript

```liquid
<section
  class="glass-product-section"
  data-error-select-variant="{{ 'sections.immersive_store.error_select_variant' | t | escape }}"
  data-error-add-to-cart="{{ 'sections.immersive_store.error_add_to_cart' | t | escape }}"
  data-success-added="{{ 'sections.immersive_store.added_to_cart' | t | escape }}"
>
```

```javascript
var msg = container.getAttribute('data-error-select-variant') || 'Please select a size';
```

### Font preloading

```liquid
{%- unless settings.type_body_font.system? -%}
  {{ settings.type_body_font | font_url | preload_tag: as: 'font' }}
{%- endunless -%}
```
