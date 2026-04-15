# Implementation Plan

- [x] 1. Write bug condition exploration tests (BEFORE implementing any fix)
  - **Property 1: Bug Condition** - Product Card Click Interception & Layout Pollution
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: Scope each property to the concrete failing case(s) for reproducibility

  **Bug 1a — Click delegation misses `<a>` links inside product cards:**
  - Set up jsdom with a `#glass-panel` containing a rendered `.immersive-product-card` article
  - The article has `data-product-handle="test-product"` and contains an `<a class="immersive-product-link" href="/products/test-product" data-product-handle="test-product">` child
  - Attach the `openCollectionPanel` click handler (spy on `openProductPanel`)
  - Use fast-check to generate click targets: `fc.constantFrom('article', 'a.immersive-product-link', 'a.immersive-product-title-link')`
  - For clicks on `<a>` children: assert `openProductPanel` is NOT called (confirms delegation gap)
  - Run on UNFIXED code — **EXPECTED OUTCOME: test FAILS for `<a>` targets** (confirms Bug 1 exists)
  - Document counterexample: "click on `.immersive-product-link` does not call `openProductPanel`"

  **Bug 1b — Silent failure when `data-msg-load-error` is absent from `#glass-panel`:**
  - Set up jsdom with `#glass-panel` that has `data-msg-load-product-error` and `data-msg-load-collection-error` but NOT `data-msg-load-error`
  - Call `openGlassPanelWithSection` with a mock `fetchSectionHtml` that returns `null`
  - Assert that `panel.getAttribute('data-msg-load-error')` returns `null` (confirms missing attribute)
  - Run on UNFIXED code — **EXPECTED OUTCOME: test FAILS** (confirms Bug 1b exists)

  **Bug 2 — Editorial banners render for non-custom layouts:**
  - Parse the Liquid template `sections/immersive-editorial.liquid` as a string in jsdom
  - Simulate rendered HTML for `layout = 'occasions'` (inject the occasions block HTML)
  - Assert `.immersive-editorial__banners` IS present in the DOM (confirms layout pollution)
  - Use fast-check: `fc.constantFrom('occasions', 'featured_collections', 'designers', 'gallery')` — for all non-custom layouts, banners should NOT render
  - Run on UNFIXED code — **EXPECTED OUTCOME: test FAILS** (banners are present for all layouts)
  - Document counterexample: "layout='occasions' renders `.immersive-editorial__banners`"

  **Bug 3 — Editorial collection links missing `data-collection`:**
  - Parse the banner content HTML from `sections/immersive-editorial.liquid`
  - Find `.immersive-editorial__collection-link` anchor elements
  - Assert each has a `data-collection` attribute
  - Run on UNFIXED code — **EXPECTED OUTCOME: test FAILS** (attribute is absent)
  - Document counterexample: "`.immersive-editorial__collection-link` has no `data-collection` attribute"

  - Mark task complete when all exploration tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing any fix)
  - **Property 2: Preservation** - Non-Product-Card Interactions & Non-Custom Layout Rendering
  - **IMPORTANT**: Follow observation-first methodology — observe UNFIXED code behaviour first
  - **GOAL**: Capture baseline behaviour that must not regress after the fix

  **Preservation 2a — Collection hotspot opens collection panel (not product panel):**
  - Observe: clicking a hotspot with `targetCollection` calls `openCollectionPanel(handle)`, not `openProductPanel`
  - Use fast-check: `fc.string({ minLength: 1 })` for collection handles
  - Property: for any collection handle, `openCollectionPanel(handle)` fetches `/collections/{handle}?sections=glass-panel`
  - Verify test PASSES on UNFIXED code

  **Preservation 2b — Panel close button does not call `openProductPanel`:**
  - Observe: clicking `.immersive-store__panel-close` calls `closePanel()`, never `openProductPanel`
  - Use fast-check: generate arbitrary click targets that are NOT `.immersive-product-card` or `[data-product-handle]`
  - Property: for all non-product-card click targets inside `#glass-panel`, `openProductPanel` is never called
  - Verify test PASSES on UNFIXED code

  **Preservation 2c — `fetchSectionHtml` builds correct URL for collection path:**
  - Observe: `fetchSectionHtml('/collections/suffuse', 'glass-panel', {})` fetches `/collections/suffuse?sections=glass-panel`
  - Use fast-check: `fc.string({ minLength: 1 })` for collection handles
  - Property: for any handle, the fetched URL always contains `?sections=glass-panel`
  - Verify test PASSES on UNFIXED code

  **Preservation 2d — Non-custom editorial layouts do NOT render banners (baseline: currently broken, skip if fails):**
  - Note: this preservation test documents the DESIRED baseline; if it fails on unfixed code, record that and proceed
  - For `layout = 'custom'`, assert `.immersive-editorial__banners` IS present
  - Verify this specific assertion PASSES on UNFIXED code (custom layout does render banners)

  - Mark task complete when all preservation tests are written, run, and passing on UNFIXED code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix: Glass panel product open failure, editorial banner layout pollution, and editorial collection links

  - [x] 3.1 Change 1 — Broaden product card click selector in `openCollectionPanel` (`assets/immersive-store.js`)
    - Locate the `panel.onclick` handler inside `openCollectionPanel`
    - Replace `event.target.closest('.immersive-product-card')` with `event.target.closest('.immersive-product-card, [data-product-handle]')`
    - After the `closest()` call, resolve the handle: try `card.getAttribute('data-product-handle')` first, then walk up to the nearest `.immersive-product-card` and read its `data-product-handle`
    - Move `event.preventDefault()` to fire immediately after the `closest()` match, before the handle resolution
    - _Bug_Condition: isBugCondition(event) where event.target is an `<a>` or child element inside `.immersive-product-card` with `data-product-handle`_
    - _Expected_Behavior: `event.preventDefault()` called; `openProductPanel(handle, collectionHandle)` called with correct handle_
    - _Preservation: clicks on close button, backdrop, back button, and non-product-card elements must NOT call `openProductPanel`_
    - _Requirements: 2.1, 2.4_

  - [x] 3.2 Change 2 — Add `data-msg-load-error` fallback to `#glass-panel` (`sections/immersive-canvas.liquid`)
    - Locate the `<section id="glass-panel" ...>` element
    - Add `data-msg-load-error="{{ 'sections.immersive_store.error_load_product' | t | escape }}"` alongside the existing `data-msg-load-product-error` and `data-msg-load-collection-error` attributes
    - _Bug_Condition: `openGlassPanelWithSection` reads `panel.getAttribute('data-msg-load-error')` which returns `null`_
    - _Expected_Behavior: attribute is present; error message is shown instead of silent close_
    - _Requirements: 2.2, 2.3_

  - [x] 3.3 Change 3 — Add optional `collection_handle` param and emit `data-collection-handle` on article (`snippets/immersive-product-card.liquid`)
    - Add `@param {String} [collection_handle]` to the `{% doc %}` block
    - On the `<article class="immersive-product-card">` element, add the conditional attribute:
      - If `collection_handle != blank` → `data-collection-handle="{{ collection_handle | escape }}"`
      - Elsif `collection != blank` → `data-collection-handle="{{ collection.handle | escape }}"`
    - _Bug_Condition: article element has no `data-collection-handle`; JS cannot thread collection context from search/wishlist/editorial surfaces_
    - _Expected_Behavior: article emits `data-collection-handle` when collection context is available_
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Change 4 — Pass `collection_handle` to `immersive-product-card` snippet (`sections/glass-panel.liquid`)
    - Locate `{% render 'immersive-product-card', product: product %}`
    - Replace with `{% render 'immersive-product-card', product: product, collection: collection, collection_handle: collection.handle %}`
    - _Requirements: 2.1, 2.2_

  - [x] 3.5 Change 5 — Gate `immersive-editorial__banners` div to `custom` layout only (`sections/immersive-editorial.liquid`)
    - Wrap the entire `<div class="immersive-editorial__banners">...</div>` block with `{%- if section.settings.layout == 'custom' -%}` / `{%- endif -%}`
    - _Bug_Condition: `section.settings.layout != 'custom'` (any of: occasions, featured_collections, designers, gallery)_
    - _Expected_Behavior: `.immersive-editorial__banners` is absent from rendered HTML for all non-custom layouts_
    - _Preservation: `layout == 'custom'` must still render banners_
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.6 Change 6 — Update `layout` select options in `{% schema %}` (`sections/immersive-editorial.liquid`)
    - Rename `options__2` value from `'collections'` to `'custom'`
    - Reorder options to: `designers`, `occasions`, `featured_collections`, `gallery`, `custom`
    - Update `default` to `'custom'`
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.7 Change 7 — Add 5 layout-specific block types to `{% schema %}` (`sections/immersive-editorial.liquid`)
    - Add block types: `banner` (custom layout), `occasion_card` (occasions), `featured_item` (featured_collections), `designer` (designers), `gallery_card` (gallery)
    - Each block type exposes only the settings relevant to its layout (see design.md Change 7 table)
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.8 Change 8 — Update `locales/en.default.schema.json` with new block type translations
    - Add translations for `occasion_card`, `featured_item`, `designer`, `gallery_card` block types under `sections.immersive_editorial.blocks`
    - Rename `banner` block name from `"Banner"` to `"Custom banner"`
    - Update `layout.options__2.label` from `"Collection banners"` to `"Custom banners"`
    - Update all layout option labels to match the new order: Designer timeline, Occasions, Featured collections, Horizontal gallery, Custom banners
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.9 Change 9 — Update Liquid block iteration per layout (`sections/immersive-editorial.liquid`)
    - In the `occasions` layout loop: add `{%- if block.type == 'occasion_card' -%}` guard
    - In the `featured_collections` layout loop: add `{%- if block.type == 'featured_item' -%}` guard
    - In the `designers` layout loop: add `{%- if block.type == 'designer' -%}` guard
    - In the `gallery` layout loop: add `{%- if block.type == 'gallery_card' -%}` guard
    - In the `custom` banners loop (now gated by Change 5): add `{%- if block.type == 'banner' -%}` guard
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.10 Change 10 — Add 4 presets to `{% schema %}` (`sections/immersive-editorial.liquid`)
    - Add presets: Designer Houses (`designers` layout), Occasions (`occasions` layout), Featured Collections (`featured_collections` layout), Custom Banners (`custom` layout)
    - Each preset includes 2–3 starter blocks of the correct type (see design.md Change 10)
    - _Requirements: 2.1 (Bug 2)_

  - [x] 3.11 Change 11 — Add `data-collection` to `immersive-editorial__collection-link` (`sections/immersive-editorial.liquid`)
    - Locate the `<a class="immersive-editorial__collection-link" href="{{ block.settings.collection.url }}">` inside `.immersive-editorial__banner-content`
    - Add `data-collection="{{ block.settings.collection.handle | escape }}"` attribute
    - _Bug_Condition: `.immersive-editorial__collection-link` has no `data-collection` attribute; overlay click handler does not intercept the click_
    - _Expected_Behavior: click handler intercepts via `event.target.closest('[data-collection]')`; calls `exitEditorialMode()` then `openCollectionPanel(handle)`; no full-page navigation_
    - _Preservation: `immersive-editorial__cta` (free-form URL) intentionally has no `data-collection` — do not add it_
    - _Requirements: 2.1 (Bug 3)_

  - [x] 3.12 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Product Card Click Interception & Layout Pollution
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior; passing confirms all 3 bugs are fixed
    - Run all exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4 (Bug 1); 2.1 Bug 2; 2.1 Bug 3_

  - [x] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Product-Card Interactions & Non-Custom Layout Rendering
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Confirm collection panel, panel close, back button, URL deep-link, and search panel all behave identically to pre-fix

- [x] 4. Checkpoint — Ensure all tests pass
  - Run `npm test` (single pass, not watch mode)
  - All exploration tests from task 1 must PASS
  - All preservation tests from task 2 must PASS
  - No regressions in existing test suite
  - Ask the user if any questions arise
