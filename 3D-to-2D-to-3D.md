Immersive 3D Store – Architectural & Implementation Guide.

0. Objectives

This document defines how to maintain and extend the 2D Dawn homepage and the 3D immersive store in a way that:

    Follows Shopify theme architecture best practices
        Templates & JSON templates
        Sections & section schema
        JavaScript & stylesheet tags vs asset files
        Performance best practices
    Preserves and improves SEO best practices
        SEO and meta tags in themes
        JSON‑LD structured data
    Introduces metaobjects to centralize 3D configuration where appropriate
        Metaobjects – custom data in themes
    Ensures the Bridge UX between 2D and 3D is implemented in a smart, device/connection-aware way without hurting SEO or causing cloaking.

Use this document to evaluate current code, refactor where needed, and implement new behavior.
1. Routing & Templates
1.1 Home vs Pages – routing constraints

    Shopify has exactly one homepage:
        Template: templates/index.json
        URL: / (root).
    All other content types have a fixed prefix:
        Pages: /pages/{handle}
        Collections: /collections/{handle}
        Products: /products/{handle}
        Blogs: /blogs/{handle}

Action items:

    Do not attempt to place the 3D store directly at /immersive as a native template; this is not supported by Shopify.
    Keep the 3D store as a Page:
        Page resource in Admin with a handle like immersive or 3d-store.
        URL: /pages/immersive (or /pages/3d-store).
    If a nicer marketing URL is desired (/immersive):
        Use URL redirects in Admin → Navigation → URL Redirects:
            /immersive → /pages/immersive
        Accept that the browser’s address bar will still show /pages/... after redirect.

1.2 Template architecture

Maintain the following separation:

    2D classic homepage
        Template file: templates/index.json
        URL: /
        Purpose:
            Main SEO landing page.
            Standard Dawn section layout.
            Hosts a Bridge CTA to the 3D store.

    3D immersive store
        Template file: templates/page.immersive.json (or templates/page.3d-store.json).
        URL: /pages/immersive (or /pages/3d-store).
        Purpose:
            Dedicated layout with:
                immersive-canvas section (WebGL canvas + UI).
                immersive-editorial sections for Designer houses, Occasions, Featured collections.
            Fully editable via theme editor.

Instructions:

    Ensure templates/index.json is configured as the classic 2D homepage and is not used for 3D content.
    Ensure there is a JSON template templates/page.immersive.json (or similarly named) that contains:
        "immersive_canvas": immersive-canvas
        "editorial_designer_houses": immersive-editorial
        "editorial_occasions": immersive-editorial
        "editorial_featured_collections": immersive-editorial
    Assign this page template to the Immersive Store Page in Admin (Online Store → Pages → select page → Theme template: page.immersive).

2. Sections & Snippets – 3D Store Architecture
2.1 Core sections

Maintain and evolve these sections:

    sections/immersive-canvas.liquid
        Responsibilities:
            Renders the WebGL canvas (<canvas id="immersive-canvas">).
            Renders the hotspot UI layer (#ui-layer).
            Renders shell DOM for:
                Glass panel overlay (#glass-panel).
                Wishlist panel (#immersive-wishlist-panel).
                Editorial overlay (#immersive-editorial-overlay).
                Onboarding overlay (#immersive-onboarding).
                Immersive navigation (#menu-toggle, #immersive-menu).
            Renders <script id="immersive-rooms-config" type="application/json"> that contains configuration JSON for rooms (intended to be built from metaobjects / section settings).
            Includes 3D-specific CSS (via {% stylesheet %} or assets/immersive-theme.css).
        Best practices:
            Keep HTML semantic (<section>, <nav>, <article>, <header>, etc.).
            Ensure all user-facing text uses translations: ``.
            Avoid inline styles except where using CSS variables from settings.

    sections/immersive-editorial.liquid
        Responsibilities:
            For each room (designer_houses, occasions, featured_collections), render a section containing:
                Hero eyebrow + heading.
                Banner blocks with headings, body text, and CTAs linking to collections.
            Provide SEO-friendly content in clear HTML:
                <section> wrapper.
                <header> with <h2> hero heading (or optional <h1> if configured).
                Each block as <article> with <h3> and <p>/<div> for body.
                <a> CTAs with descriptive text and proper href.
        Best practices:
            Use richtext for body settings; render with {{ block.settings.body }} (not escaped).
            Escape headings/labels: {{ ... | escape }}.
            Use consistent heading hierarchy: one h1 per template (configurable via a boolean setting), h2 for other hero headings, h3 for banner headings.

    sections/glass-panel.liquid & sections/glass-product.liquid
        Responsibilities:
            Serve as Section Rendering API endpoints for:
                Collection overlay (grid).
                Product overlay.
        Best practices:
            Treat them as UX overlays only. Do not duplicate canonical meta tags or structured data already present on /collections/... and /products/... templates.
            Focus on accessible, semantic markup and performance.

2.2 Snippets

Maintain:

    snippets/immersive-product-card.liquid
        Reusable product card with hover swap, wishlist toggle, etc.
        Use semantic markup and ARIA attributes.
    snippets/virtual-tryon.liquid
        Virtual Try-On UI, integrated into product overlays.
        Ensure text labels and error messages are translatable.

3. JavaScript & Assets
3.1 Current asset-based setup

    assets/immersive-store.js: main immersive engine:
        WebGL initialization (Three.js renderer, scene, camera, shaders).
        Room management (STORE_ROOMS, goToRoom, loadRoomTextures).
        Hotspot rendering and interactions.
        Editorial overlay (enterEditorialMode, exitEditorialMode).
        Panel system (openCollectionPanel, openProductPanel, closePanel).
        Wishlist manager.
        Analytics helpers.
    assets/three.min.js: Three.js core.
    assets/immersive-theme.css: global immersive CSS.

layout/theme.liquid conditionally loads these only on:

    Homepage (template.name == 'index') and/or
    Immersive page (template.name == 'page' and page.handle == 'immersive', or similar).

3.2 Guidance & checks

    Keep using assets for three.min.js and immersive-store.js for now:
        This is acceptable and follows Shopify constraints on external scripts (CSP/MIME).
        Make sure they are loaded with defer to avoid blocking rendering:
            {{ 'three.min.js' | asset_url | script_tag }}
            {{ 'immersive-store.js' | asset_url | script_tag }}

    Ensure initializers are guarded:
        bindImmersiveInit() checks for #immersive-canvas before doing work.
        No JS should assume the immersive DOM exists on templates where it’s not rendered.

    Follow performance best practices:
        Avoid heavy layout reads in requestAnimationFrame loops.
        Respect prefers-reduced-motion for parallax and animations.
        Limit devicePixelRatio for Three.js renderer on mobile and high-density screens.

    Keep business logic and rendering inside immersive-store.js rather than scattering script tags around templates.

4. Bridge UX – Smart, Device/Connection-Aware Implementation
4.1 Requirements

    Provide a bridge between:
        2D classic homepage /
        3D immersive store /pages/immersive
    Make the bridge device/connection-aware:
        On strong connections and suitable devices, encourage 3D.
        On slow connections / data-saver / small devices, encourage 2D.
    Do not auto-redirect in a way that could be interpreted as cloaking:
        Googlebot should still be able to access both / and /pages/immersive.
        Avoid conditionally blocking bots from the 3D page.

4.2 Implementation guidance

On classic homepage (/):

    Add a visible CTA to the 3D store in a header or dedicated section:

liquid
1
2
3
4
5
6
7
8
   <a href="/pages/immersive" class="bridge-btn" data-immersive-cta>
     {{ 'immersive.bridge.enter_3d' | t }}
   </a>
   <noscript>
     <a href="/pages/immersive">
       {{ 'immersive.bridge.enter_3d_noscript' | t }}
     </a>
   </noscript>

    Add a small JS snippet in the main theme script (not in immersive-store.js):
        Use navigator.connection (if available) to detect effectiveType and saveData.
        Use window.matchMedia('(prefers-reduced-motion: reduce)') to detect motion sensitivity.
        If conditions indicate a slow/limited environment:
            Change CTA text to something like “Classic store recommended on your connection”.
            Optionally add a small explanatory tooltip/notice.
        Do not remove the link or redirect automatically.

On immersive page (/pages/immersive):

    Add an obvious “Back to classic store” CTA back to /:

liquid
1
2
3
   <a href="/" class="bridge-btn bridge-btn--back">
     {{ 'immersive.bridge.back_to_classic' | t }}
   </a>

    Optionally add a JS-only notice when conditions are slow:
        E.g. a non-blocking banner: “3D store may feel heavy on your connection; the classic store is recommended.”

SEO considerations:

    Links must be plain <a href> elements; no JS-only navigation.
    Text on buttons should be clear and localized.
    Do not show entirely different content trees based on connection/device; only adjust messaging and recommendations.

5. SEO Best Practices – Keep Them Front & Center

Ensure all changes respect Shopify SEO guidelines:

    Canonical homepage:
        index.json remains the primary SEO entry.
        Titles, meta descriptions, and JSON-LD are optimized there.
    Structured HTML on 3D page:
        immersive-editorial sections must contain real, indexable text and real <a> links to collections and products.
    Heading hierarchy:
        One h1 per template (configurable via boolean in section settings).
        Use h2/h3 accordingly in immersive-editorial.
    Meta tags:
        Use Shopify’s default handling from Dawn for <title> and <meta name="description">.
        Ensure the Immersive Page’s title/description reflect its purpose (e.g., “3D Immersive Boutique | Brand Name”).
    Structured data:
        Leave product and collection structured data in canonical /products/... and /collections/... templates (Dawn’s defaults).
        Do not emit separate Product/Collection JSON-LD from glass-product/glass-panel overlays.
    Performance:
        Follow performance best practices.
        Ensure heavy JS runs only on templates that need it.
        Keep LCP on / fast by not overloading above-the-fold with heavy scripts.

6. Metaobjects – Centralizing 3D Configuration (Phase 1)

The current theme already allows changing room images and hotspot text from the theme editor. Regardless of the current implementation (likely using section settings/blocks), the next step is to move towards metaobject-backed configuration.
6.1 Goals for phase 1

    Keep room keys & basic layout hardcoded in STORE_ROOMS as defaults.
    Use metaobjects to override image/depth map URLs and user-facing labels.
    Generate a JSON config for immersive-store.js via <script id="immersive-rooms-config">.

6.2 Metaobject type definition

In Admin → Settings → Custom data → Metaobjects:

    Create a new metaobject type, e.g. immersive_room.
    Fields (initial minimum):
        room_key – Single line text (e.g., storefront, lounge, designer_houses, occasions, featured_collections).
        desktop_base_image – File reference (image).
        mobile_base_image – File reference (image).
        desktop_depth_map – File reference (image).
        mobile_depth_map – File reference (image).
    (Optional for later): fields for default hotspot texts or editorial labels.

6.3 Section schema: immersive-canvas

Extend sections/immersive-canvas.liquid schema to enable selecting multiple immersive_room metaobjects:

    Add a setting such as:

json
1
2
3
4
5
6
7
{
  "type": "metaobject",
  "id": "rooms",
  "label": "Immersive rooms",
  "metaobject_type": "immersive_room",
  "limit": 10
}

(Note: the exact schema type might differ depending on current Shopify support; use the documented metaobject or metaobject_list type where applicable.)
6.4 Generating JSON config in Liquid

In immersive-canvas.liquid, build <script id="immersive-rooms-config"> from selected metaobjects:

    For each selected room in section.settings.rooms:
        Output its room_key as the object key.
        Output fully qualified URLs for base and depth images using image_url.

Example pattern (to be adapted to actual schema):
liquid
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
<script id="immersive-rooms-config" type="application/json">
{
  {% for room in section.settings.rooms %}
    {% assign key = room.room_key | strip %}
    {% if key != blank %}
      "{{ key }}": {
        "baseTextureUrl": {{ room.desktop_base_image | image_url: width: 1600 | json }},
        "mobileBaseTextureUrl": {{ room.mobile_base_image | image_url: width: 900 | json }},
        "depthMapUrl": {{ room.desktop_depth_map | image_url: width: 1600 | json }},
        "mobileDepthMapUrl": {{ room.mobile_depth_map | image_url: width: 900 | json }}
      }{% unless forloop.last %},{% endunless %}
    {% endif %}
  {% endfor %}
}
</script>

Important:

    Ensure Liquid generates valid JSON (correct commas, quoting, use of | json filter).
    mergeDynamicRoomConfig() in immersive-store.js must remain as-is, so it can merge this config into STORE_ROOMS.

6.5 JS integration

No changes needed to mergeDynamicRoomConfig() as long as the JSON keys match:

    Room keys: storefront, lounge, designer_houses, occasions, featured_collections.
    Fields: baseTextureUrl, mobileBaseTextureUrl, depthMapUrl, mobileDepthMapUrl.

Ensure:

    If a metaobject is missing a particular field, fallback is handled gracefully in JS (current code already checks for missing URLs and logs warnings).

7. Code Quality & Best Practices Checklist

Before and after changes, KIRO IDE should:

    Run Shopify Theme Check (or the provided validation tooling) on:
        New/modified sections/*.liquid.
        Any new snippets/*.liquid.
        locales/*.json for JSON validity and translation usage.
    Verify:
        No Liquid syntax errors.
        No use of deprecated or legacy patterns (e.g., resource handles instead of object settings).
        All user-facing strings passed through translations.
        All {% schema %} JSON is valid and respects Shopify’s schema shape.
    Confirm selectors match:
        Every significant ID/class used by immersive-store.js is present in sections/snippets and not renamed without updating JS.
    Test in theme editor:
        Immersive Page can be edited independently from Homepage.
        Section blocks behave correctly when added, reordered, or removed.
        No runtime errors in the console when using the editor.

8. Summary for Implementation

    Keep 2D Dawn as canonical home (index.json → /).
    Maintain a dedicated 3D page template (page.immersive.json), assigned to a Page like /pages/immersive.
    Implement a smart Bridge UX:
        Plain <a> links both ways.
        Device/connection-aware messaging via JS, no hard redirects.
    Follow SEO best practices:
        Semantic HTML in immersive-editorial.
        Proper headings and internal links.
        No duplicate structured data from overlays.
    Introduce metaobjects to manage core 3D room configuration:
        Define immersive_room metaobject type.
        Reference them from immersive-canvas section.
        Emit JSON config into immersive-rooms-config, consumed by existing JS merger.
    Validate and test:
        Theme Check, console logs, editor behavior, and performance (Core Web Vitals focus).

This document should be treated as the reference when evolving the theme code for the 3D immersive store and its integration with the classic Dawn homepage.

Sources

    Storefronts > Themes > Architecture > TemplatesTemplates & JSON templates
    Storefronts > Themes > Architecture > SectionsSections & section schema
    Storefronts > Themes > Best Practices > Javascript And Stylesheet TagsJavaScript & stylesheet tags vs asset files

    Storefronts > Themes > Best Practices > PerformancePerformance best practices
    Storefronts > Themes > Navigation Search > SeoSEO and meta tags in themes
    Storefronts > Themes > Navigation Search > Seo > Json LdJSON‑LD structured data
    Apps > Custom Data > MetaobjectsMetaobjects – custom data in themes