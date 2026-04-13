# Shahana Collection — canonical entity profile

**Last updated:** 2026-04-12

## Entity

| Field | Value |
|--------|--------|
| **Canonical name** | Shahana Collection |
| **Type** | Organization / retail brand (e‑commerce; curated designer fashion) |
| **Primary international storefront** | https://shahana.uk |
| **Pakistan-only storefront** | https://shahanacollection.pk |

**Positioning:** One brand, two market-specific storefronts — not two unrelated businesses.

---

## Lost domain (critical)

| Domain | Status |
|--------|--------|
| **shahanacollection.com** | **Former** official domain — **no longer controlled by Shahana Collection.** Registration lapsed; another party now holds it. |

**Implications:**

- Third-party content on that hostname can **confuse** users, search engines, and AI systems that still associate the brand with `.com`.
- Old **backlinks**, bookmarks, directory listings, social posts, and cached SERPs may still point at `.com`.
- **Entity disambiguation:** machine-readable and human copy should steer “official Shahana Collection” to **shahana.uk** and **shahanacollection.pk** only.

**Ongoing mitigations (checklist):**

- [ ] Audit **Google Business Profile** (if any), **Bing Places**, and major directories — update URLs to `.uk` / `.pk` as appropriate.
- [ ] Update **social profile** website fields and link-in-bio tools to the correct domains.
- [ ] Search for **“Shahana Collection” + shahanacollection.com** in press, partners, and apps; request link updates where possible.
- [ ] In **Search Console** (for properties you own), monitor; you cannot fix the lost domain property, but you can grow authority on owned domains.
- [ ] Add a short **FAQ or footer note** only if useful: e.g. “Our official sites are shahana.uk and shahanacollection.pk — we do not operate shahanacollection.com.” (Keep tone factual; legal review if implying fraud by the new registrant.)
- [ ] **Wikidata / Knowledge Panel** (if pursued): ensure **official website (P856)** and references use **current** URLs only.

---

## Entity signals — theme / site implementation

- **Organization** JSON-LD appears in `layout/theme.liquid` and `sections/header.liquid` — **deduplicate** to a single coherent graph (see theme SEO notes).
- **`sameAs`:** should list **real** social URLs from theme settings; avoid dead or wrong-domain links.
- **Markets:** Shopify Markets + hreflang should align with **UK/international** vs **Pakistan**; avoid conflicting manual `hreflang` if Markets already emits tags.

---

## Canonical URLs for handoff

| Market | URL |
|--------|-----|
| International | https://shahana.uk |
| Pakistan | https://shahanacollection.pk |

**Do not** treat **https://shahanacollection.com** as owned by Shahana Collection for any canonical, schema, or marketing reference.

---

## Open loops

- [ ] Confirm whether **legal/trading name** in Shopify admin matches “Shahana Collection” everywhere (invoices, policies).
- [ ] Run **AI entity resolution** queries quarterly (see entity-optimizer skill) and log wrong answers tied to old `.com` mentions.
- [ ] Optional: **brand monitoring** for the old domain or impersonation (customer support, social).

---

## One-line verdict

**Shahana Collection** is a single entity served by **shahana.uk** (international) and **shahanacollection.pk** (Pakistan); **shahanacollection.com** is **lost** and must be actively disambiguated from all official entity and marketing signals.
