# layout/theme.liquid — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: Script loading block (lines ~46–72)

### launch-readiness-fixes (removed in main)
```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive/core/state-manager.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/core/room-manager.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/core/atmosphere.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/core/webgl-engine.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/search.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/filters.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/gestures.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/quick-add.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/fab.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/room-recommender.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/features/limited-time.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/panels/glass-panel.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/panels/collection-panel.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/panels/product-panel.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/panels/wishlist-panel.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/editorial/editorial-mode.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/editorial/scroll-reveal.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/editorial/hero-parallax.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/editorial/timeline.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/guided/guided-mode.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/fetch.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/analytics.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/dom.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive/utils/skeleton.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive/fluid-reveal.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
```

### main (simplified)
```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
```

**Impact:** 25 modular script tags removed. Main loads only the monolith `immersive-store.js`. All the modular files (`state-manager`, `atmosphere`, `webgl-engine`, `search`, `filters`, `gestures`, `quick-add`, `fab`, `room-recommender`, `limited-time`, `collection-panel`, `scroll-reveal`, `timeline`, `guided-mode`, `fetch`, `analytics`, `dom`, `skeleton`, `fluid-reveal`) are no longer loaded.

---

## Change 2: Preference banner — `data-dismiss-timeout` attribute removed

### launch-readiness-fixes
```liquid
<div
  class="immersive-preference-banner"
  role="region"
  aria-label="{{ 'sections.immersive_journey_bridges.preference_banner_aria' | t }}"
  data-dismiss-timeout="{{ settings.bridge_dismiss_timeout | default: 0 }}"
  hidden
>
```

### main
```liquid
<div
  class="immersive-preference-banner"
  role="region"
  aria-label="{{ 'sections.immersive_journey_bridges.preference_banner_aria' | t }}"
  hidden
>
```

**Impact:** Auto-dismiss timeout feature removed. The `data-dismiss-timeout` attribute and the corresponding `settings.bridge_dismiss_timeout` theme setting are gone.

---

## Change 3: Preference banner dismiss logic — simplified

### launch-readiness-fixes
The dismiss logic was extracted into a named `dismissBanner()` function with:
- `prefers-reduced-motion` check wrapped in try/catch
- Animated fade-out (opacity + translateY transition)
- Auto-dismiss timer (`autoDismissTimer`) reading from `data-dismiss-timeout`
- `mouseenter` and `focusin` listeners to cancel auto-dismiss

### main
The dismiss logic is inlined directly in the click handler:
- `prefers-reduced-motion` check without try/catch
- Same animated fade-out
- No auto-dismiss timer
- No `mouseenter`/`focusin` listeners

**Impact:** Auto-dismiss feature removed. Simpler, inline dismiss handler. The try/catch around `matchMedia` was also removed (minor robustness difference).
