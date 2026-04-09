# Reference Card — Immersive Journey Bridges

Quick reference for the 48-hour deployment sprint.

---

## 🎯 Your Mission

**Verify** the Immersive Journey Bridges feature works correctly, then **deploy** to production by Friday EOD.

---

## ⏱️ Timeline

| When | What | Time |
|------|------|------|
| **Today (Wed)** | Smoke test all 6 bridges + preference banner + device behavior | 4h |
| **Tomorrow (Thu)** | Cross-browser testing + performance check | 2h |
| **Friday** | Deploy to production + monitor | 1h |
| **TOTAL** | | **7h** |

---

## 📋 Today's Checklist (4 hours)

### Phase 1: Core Functionality (1.5h)
- [ ] Collection bridge renders and navigates
- [ ] Search bridge renders and navigates
- [ ] Product bridge renders and navigates
- [ ] Cart bridge renders and navigates
- [ ] Collections list bridge renders and navigates
- [ ] Content bridge (blog/article) renders and navigates

### Phase 2: Preference Banner (1h)
- [ ] Banner doesn't appear on first visit
- [ ] Banner appears after visiting 3D store
- [ ] Dismiss button works
- [ ] Banner doesn't appear on immersive/index pages

### Phase 3: Device-Aware Behavior (1h)
- [ ] Slow connection warning appears (throttle to Slow 3G)
- [ ] Reduced motion disables animations (enable prefers-reduced-motion)
- [ ] Both together work correctly

### Phase 4: No Regressions (0.5h)
- [ ] Collection filtering still works
- [ ] Search filtering still works
- [ ] Product pages work
- [ ] Cart operations work
- [ ] No console errors

---

## 🔴 Blockers (Stop if you find these)

| Blocker | Symptom | Fix |
|---------|---------|-----|
| Bridge not rendering | Bridge banner doesn't appear | Check snippet included in section |
| Bridge URL not working | Clicking bridge doesn't open panel | Check URL parameter handler |
| Preference banner not appearing | Banner doesn't show after 3D visit | Check `writeImmersivePreference()` called |
| Device-aware not working | Slow connection warning missing | Check `bridge-behavior.js` loaded |
| Console errors | Red errors in DevTools | Check TROUBLESHOOTING-GUIDE.md |

---

## 📁 Key Files

```
snippets/immersive-bridge-btn.liquid          ← Bridge Banner component
sections/main-*.liquid                        ← All 6 bridge locations
assets/immersive-store.js                     ← URL handler, search panel, preferences
assets/bridge-behavior.js                     ← Device-aware behavior
layout/theme.liquid                           ← Preference banner
locales/en.default.json                       ← Localization (28 keys)
```

---

## 🛠️ Debugging Quick Links

| Problem | Solution |
|---------|----------|
| Bridge not showing | → TROUBLESHOOTING-GUIDE.md Issue 1 |
| Bridge not clickable | → TROUBLESHOOTING-GUIDE.md Issue 7 |
| URL parameter not working | → TROUBLESHOOTING-GUIDE.md Issue 2 |
| Preference banner not appearing | → TROUBLESHOOTING-GUIDE.md Issue 3 |
| Device-aware not working | → TROUBLESHOOTING-GUIDE.md Issue 4 |
| Console errors | → TROUBLESHOOTING-GUIDE.md Issue 5 |
| Dismiss button not working | → TROUBLESHOOTING-GUIDE.md Issue 6 |
| Localization missing | → TROUBLESHOOTING-GUIDE.md Issue 8 |

---

## ✅ Success Criteria

**Ready to deploy if:**
- ✅ All 6 bridges render and navigate
- ✅ Preference banner shows/hides correctly
- ✅ Device-aware behavior works
- ✅ No console errors
- ✅ No regressions
- ✅ All browsers/devices tested

**NOT ready if:**
- ❌ Any bridge doesn't work
- ❌ Preference banner doesn't appear
- ❌ Device-aware doesn't work
- ❌ Console errors exist
- ❌ Existing functionality broken

---

## 📚 Documents

| Document | Purpose |
|----------|---------|
| QUICK-START.md | Start here — overview of what to do |
| DEPLOYMENT-CHECKLIST.md | Detailed step-by-step verification guide |
| TROUBLESHOOTING-GUIDE.md | Solutions for common issues |
| IMPLEMENTATION-REVIEW.md | Technical details of what was built |
| DEPLOYMENT-SUMMARY.md | Full summary of the feature |

---

## 🚀 Deploy Command (Friday)

```bash
shopify theme push
```

---

## 💡 Pro Tips

1. **Test on real Shopify store** — Not just local dev
2. **Use DevTools** — Elements, Console, Network, Application tabs are your friends
3. **Check localStorage** — Preference is stored there
4. **Test with throttling** — DevTools Network tab → Slow 3G
5. **Test with reduced motion** — DevTools Rendering → prefers-reduced-motion: reduce
6. **Test on mobile** — Use real device or DevTools device emulation
7. **Check console** — No errors should appear
8. **Document issues** — Write down what you find for future reference

---

## 🎯 Phase Breakdown

### Phase 1: Core Functionality (1.5h)
Test each bridge on its respective page type. Verify it renders, has correct heading/image, and navigates to 3D store.

### Phase 2: Preference Banner (1h)
Test that banner appears after visiting 3D, can be dismissed, and doesn't appear on immersive/index pages.

### Phase 3: Device-Aware Behavior (1h)
Test slow connection warning and reduced motion support. Verify both work together.

### Phase 4: No Regressions (0.5h)
Spot-check that existing functionality (filtering, pagination, add-to-cart) still works.

### Phase 5: Cross-Browser Testing (1h)
Test on Chrome, Firefox, Safari, Edge, iPhone, Android, iPad.

### Phase 6: Performance & Console (1h)
Run Lighthouse, check for console errors, verify no 404s.

### Phase 7-9: Deploy & Monitor (1h)
Final check, deploy, monitor for errors.

---

## 🔍 What to Look For

### ✅ Good Signs
- Bridge banner appears on all 6 page types
- Clicking bridge navigates to `/pages/immersive-store?open_*=...`
- Panel opens in 3D store
- Preference banner appears after visiting 3D
- Dismiss button removes banner
- Slow connection warning appears when throttled
- Animations disabled when prefers-reduced-motion enabled
- No console errors
- No 404s in Network tab
- Existing functionality still works

### ❌ Bad Signs
- Bridge banner missing on any page type
- Clicking bridge doesn't navigate
- Panel doesn't open
- Preference banner doesn't appear
- Dismiss button doesn't work
- Slow connection warning missing
- Animations still play with prefers-reduced-motion
- Console errors present
- 404s in Network tab
- Existing functionality broken

---

## 📞 If You Get Stuck

1. **Check TROUBLESHOOTING-GUIDE.md** — Most issues are documented
2. **Check DevTools** — Elements, Console, Network, Application tabs
3. **Check the files** — Read the Liquid/JS to understand what's happening
4. **Add console.log()** — Debug by logging values
5. **Test in isolation** — Test one bridge at a time

---

## 🎉 You've Got This

The feature is complete and production-ready. You just need to verify it works. The checklist is detailed and straightforward. Most issues are simple fixes.

**You have 48 hours and a clear plan.**

**Let's go.** 🚀

---

## Quick Links

- **Start here:** QUICK-START.md
- **Detailed checklist:** DEPLOYMENT-CHECKLIST.md
- **Stuck?** TROUBLESHOOTING-GUIDE.md
- **Need details?** IMPLEMENTATION-REVIEW.md
- **Full summary:** DEPLOYMENT-SUMMARY.md
