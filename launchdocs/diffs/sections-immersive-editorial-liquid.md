# sections/immersive-editorial.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Parallax gallery layout block removed

### launch-readiness-fixes (removed in main)
```liquid
{%- if section.settings.layout == 'parallax' -%}
  {%- assign parallax_blocks = section.blocks | where: 'type', 'parallax_image' -%}
  {%- if parallax_blocks.size >= 3 -%}
    <div
      class="immersive-parallax-gallery"
      data-parallax-gallery
      data-max-offset="{{ section.settings.max_offset_px | default: 120 }}"
    >
      {%- assign block_count = 0 -%}
      {%- for block in parallax_blocks -%}
        {%- if block_count < 6 -%}
          {%- assign depth = block.settings.depth_layer | default: 'midground' -%}
          {%- assign multiplier_override = block.settings.depth_multiplier_override | default: 0 | times: 1.0 -%}
          {%- if multiplier_override > 0 -%}
            {%- assign depth_multiplier = multiplier_override -%}
          {%- elsif depth == 'background' -%}
            {%- assign depth_multiplier = 0.2 -%}
          {%- elsif depth == 'foreground' -%}
            {%- assign depth_multiplier = 1.0 -%}
          {%- else -%}
            {%- assign depth_multiplier = 0.5 -%}
          {%- endif -%}
          <div
            class="immersive-parallax-gallery__item"
            data-depth="{{ depth_multiplier }}"
            {{ block.shopify_attributes }}
          >
            {%- if block.settings.image != blank -%}
              <img src="{{ block.settings.image | image_url: width: 800 }}" ...>
            {%- else -%}
              <div class="immersive-parallax-gallery__placeholder"></div>
            {%- endif -%}
          </div>
          {%- assign block_count = block_count | plus: 1 -%}
        {%- endif -%}
      {%- endfor -%}
    </div>
  {%- endif -%}
{%- endif -%}
```

**Impact:** The `parallax` layout type and `parallax_image` block type are removed. The `editorial-parallax-gallery` spec and its associated `scroll-reveal.js` module are gone.

---

## Change 2: `theme-check-disable/enable` comments removed

Several `{%- comment -%}theme-check-disable VariableName, RemoteAsset{%- endcomment -%}` and corresponding `enable` comments were removed throughout the file.

**Impact:** Minor — these were suppressing theme check warnings for placeholder `picsum.photos` URLs. The warnings may now appear in theme check output.

---

## Change 3: Parallax gallery CSS removed from `{% stylesheet %}`

### launch-readiness-fixes (removed in main)
```css
/* Parallax gallery layout — scroll-driven horizontal image strip */
.immersive-parallax-gallery {
  display: flex;
  gap: 1rem;
  overflow: hidden;
  width: 100%;
  position: relative;
}

.immersive-parallax-gallery__item {
  flex: 0 0 auto;
  width: clamp(200px, 30vw, 400px);
  will-change: transform;
}

.immersive-parallax-gallery__item img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 3/4;
}
```

**Impact:** Parallax gallery styles removed along with the HTML.
