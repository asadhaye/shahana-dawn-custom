# assets/immersive/panels/glass-panel.js — Branch Diff

**launch-readiness-fixes → main**

---

## Change 1: `closePanel()` — fluid reveal teardown removed

### launch-readiness-fixes
```javascript
function closePanel(panel, closeMethod) {
  // ...
  closeDialogFocus(panel._panelTrigger);
  panel._panelTrigger = null;

  // Destroy fluid reveal effect before hiding the panel
  if (typeof ImmersiveFluidReveal !== 'undefined') {
    ImmersiveFluidReveal.destroy();
  }

  // Wait for CSS transition before hiding from DOM
  setTimeout(function () {
    panel.classList.add('hidden');
    // ...
  }, ...);
}
```

### main
```javascript
function closePanel(panel, closeMethod) {
  // ...
  closeDialogFocus(panel._panelTrigger);
  panel._panelTrigger = null;

  // Wait for CSS transition before hiding from DOM
  setTimeout(function () {
    panel.classList.add('hidden');
    // ...
  }, ...);
}
```

**Impact:** `ImmersiveFluidReveal.destroy()` call removed. The `fluid-reveal.js` module is no longer loaded (removed from `layout/theme.liquid`), so this guard was unnecessary and has been cleaned up.
