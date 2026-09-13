# AUDIT.md — design consistency audit

Audited **49 pages** at 1280px and **49** at 390px — the 47 replicated pages plus the Ziyarat guide (English and Arabic).

**Method.** Two passes, so nothing is guessed:
- **Static** — every value *written* in the site's own stylesheets (`style.css`, `dynamic_styles.css`, `guide.css`), every inline `style=""` in the page markup, and every JSX file.
- **Runtime** — each page loaded in a same-origin iframe at the target width; a probe reads the *computed* style of every visible element and measures alignment (left edges, card rows, button rows, icon centring, image aspect ratios). `content-visibility` and lazy loading are neutralised first so off-screen elements report real sizes.

Raw data: `_audit/static.json`, `_audit/results/*.json`. Re-run with `node _audit/static.mjs` + the harness + `node _audit/aggregate.mjs`.

---

## 0. Scoreboard

|  | Authored (in source) | Rendered at 1280px | Target for STEP 2–5 |
|---|---|---|---|
| Colours | 165 | 18 text · 34 background · 31 border · 25 gradients | ~12 tokens |
| Font sizes | 48 | 37 | 9 (12→48) |
| Font weights | 6 | 7 | 3–4 |
| Line heights | 19 | 58 | 2 ratios |
| Letter-spacing values | 12 | — | 1 for uppercase labels |
| Padding values | 60 | 44 | 4px scale |
| Margin values | 36 | 30 | 4px scale |
| Gap values | 19 | 13 | 4px scale |
| Border radii | 24 | 21 | 3–4 |
| Box shadows | 49 | 28 | 2–3 |
| Transition durations | 8 | 5 | 1–2 |
| Distinct button styles | — | 20 | 2 sizes × 2–3 variants |
| Distinct card styles | — | 8 | 1–2 |
| Distinct h2 styles | — | 16 | 1 |

Plus **2,976 inline `style=""` attributes** in the page markup, and **295 `!important`** declarations in the two original stylesheets.

---

## 1. Colour

### 1a. Text colours actually rendered (1280px)

| Colour | Elements | Where | Example |
|---|---|---|---|
| `#cccccc` | 2492 | all pages | p.lead.text-white-50 |
| `#f2f2f2` | 1102 | all pages | h2.section-title-static |
| `#a6a6a6` | 502 | 44 pages | p.text-secondary |
| `#ffffff` | 383 | all pages | a.nav-link |
| `#0e0e0e` | 253 | 44 pages | a.primary-button.d-block.text-center |
| `#da9a28` | 176 | all pages | span |
| `#d4a017` | 167 | 5 pages | span.badge.mb-2.px-3 |
| `#c18a1a` | 125 | 33 pages | button.accordion-button |
| `#e2e8f0` | 34 | 15 pages | strong |
| `#ffffff@0.50` | 27 | 1 page | p.text-white-50 |
| `#212529` | 26 | 1 page | a.btn.fw-bold.px-4 |
| `#0a0d14` | 22 | 2 pages | button#open-service-modal-btn.btn.fw-bold |
| `#cbd5e1` | 19 | 2 pages | p |
| `#aab4c8` | 14 | 1 page | div |
| `#6b7a99` | 14 | 1 page | div |
| `#94a3b8` | 7 | 1 page | div |
| `#ffc107` | 5 | 3 pages | strong.text-warning |
| `#ffcc00` | 1 | 1 page | span |

### 1b. Background colours actually rendered

| Colour | Elements | Where | Example |
|---|---|---|---|
| `#c18a1a` | 320 | 44 pages | a.primary-button.d-block.text-center |
| `#ffffff@0.04` | 207 | 3 pages | div.feature-box-hover |
| `#25d366` | 185 | all pages | a.btn.btn-success |
| `#16181d` | 84 | all pages | nav.navbar.navbar-expand-lg.navbar-custom |
| `#12161f` | 78 | all pages | footer.main-site-footer |
| `#da9a28@0.12` | 75 | 15 pages | span.ai-chip |
| `#ffffff@0.10` | 70 | 42 pages | button#ai-close-chat.ai-close-btn |
| `#ffcc00@0.20` | 55 | 29 pages | main#cart-items-container |
| `#2b303b` | 52 | 31 pages | div.accordion-item |
| `#ffffff` | 48 | all pages | div |
| `#c18a1a@0.07` | 42 | 2 pages | figure.guide-scripture |
| `#0c1017` | 31 | 7 pages | div |
| `#010100@0.15` | 28 | 4 pages | div.service-card-category |
| `#000000@0.75` | 25 | 1 page | span.badge |
| `#1877f2` | 17 | 17 pages | a.fab-btn.facebook |
| `#111317` | 16 | 16 pages | section.content-section.py-5 |
| `#0f172a` | 15 | 15 pages | div.ai-chat-footer |
| `#1e293b@0.80` | 15 | 15 pages | input#ai-chat-input.ai-input |
| `#141923@0.95` | 14 | 1 page | div |
| `#0e131d` | 10 | 1 page | div |
| `#101622@0.95` | 7 | 1 page | div |
| `#c18a1a@0.15` | 6 | 2 pages | span |
| `#ffcc00@0.25` | 6 | 1 page | th |
| `#c18a1a@0.18` | 6 | 1 page | div |
| `#0f141e` | 5 | 1 page | a.content-card |
| `#ffcc00@0.10` | 5 | 1 page | td.highlight-cell |
| `#d4a017@0.12` | 4 | 1 page | a |
| `#000000@0.30` | 2 | 1 page | input#search-input |
| `#0b0f19` | 2 | 2 pages | section.content-section |
| `#0d0f13` | 2 | 2 pages | section.guide-hero |
| `#000000` | 1 | 1 page | button.accordion-button |
| `#da9a28@0.15` | 1 | 1 page | span.badge.mb-2.px-3 |
| `#06090f@0.96` | 1 | 1 page | div#nav-tab.nav.nav-tabs.hero-form-tabs |
| `#d4a017@0.15` | 1 | 1 page | span |

### 1c. Gradients actually rendered

| Gradient | Elements | Where |
|---|---|---|
| linear-gradient(145deg, rgba(55, 62, 80, 0.7), rgba(45, 52, 70, 0.8)) | 87 | 35 pages |
| linear-gradient(rgb(34, 38, 48) 0%, rgb(18, 20, 23) 100%) | 80 | all pages |
| linear-gradient(rgb(24, 29, 41) 0%, rgb(13, 16, 23) 100%) | 78 | all pages |
| linear-gradient(135deg, rgb(193, 138, 26), rgb(212, 160, 23)) | 35 | 3 pages |
| linear-gradient(135deg, rgb(218, 154, 40), rgb(245, 200, 66)) | 30 | 15 pages |
| linear-gradient(135deg, rgb(37, 211, 102) 0%, rgb(18, 140, 126) 100%) | 15 | 15 pages |
| linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%) | 15 | 15 pages |
| linear-gradient(135deg, rgb(193, 138, 26) 0%, rgb(212, 160, 23) 100%) | 13 | 1 page |
| linear-gradient(145deg, rgba(20, 27, 40, 0.9), rgba(10, 14, 22, 0.95)) | 6 | 1 page |
| linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0)) | 5 | 1 page |
| linear-gradient(135deg, rgba(16, 22, 34, 0.94) 0%, rgba(8, 11, 18, 0.98) 100%) | 4 | 1 page |
| linear-gradient(145deg, rgba(16, 22, 34, 0.95), rgba(8, 11, 18, 0.98)) | 4 | 1 page |
| linear-gradient(135deg, rgba(193, 138, 26, 0.25), rgba(212, 160, 23, 0.1)) | 3 | 1 page |
| linear-gradient(90deg, rgb(193, 138, 26), rgb(255, 255, 255)) | 3 | 2 pages |
| linear-gradient(rgba(11, 15, 23, 0.85), rgba(11, 15, 23, 0.95)), url("http://localhost:31… | 1 | 1 page |
| linear-gradient(145deg, rgba(16, 22, 34, 0.97) 0%, rgba(8, 11, 18, 0.99) 100%) | 1 | 1 page |
| linear-gradient(90deg, rgba(193, 138, 26, 0.2) 0%, rgba(212, 160, 23, 0.08) 100%) | 1 | 1 page |
| linear-gradient(135deg, rgba(193, 138, 26, 0.25) 0%, rgba(212, 160, 23, 0.1) 100%) | 1 | 1 page |
| linear-gradient(135deg, rgb(17, 22, 34) 0%, rgb(27, 35, 51) 100%) | 1 | 1 page |
| linear-gradient(rgb(13, 18, 31) 0%, rgb(7, 9, 15) 100%) | 1 | 1 page |
| linear-gradient(135deg, rgb(13, 17, 23) 0%, rgb(22, 27, 39) 100%) | 1 | 1 page |
| linear-gradient(135deg, rgb(17, 24, 39) 0%, rgb(30, 41, 59) 50%, rgb(17, 24, 39) 100%) | 1 | 1 page |
| radial-gradient(circle, rgba(212, 160, 23, 0.15), rgba(0, 0, 0, 0) 70%) | 1 | 1 page |
| radial-gradient(circle, rgba(212, 160, 23, 0.1), rgba(0, 0, 0, 0) 70%) | 1 | 1 page |
| linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 14, 22, 0.98)) | 1 | 1 page |

### 1d. Border colours actually rendered

| Width + colour | Elements | Where | Example |
|---|---|---|---|
| `1px #ffffff@0.15` | 2150 | all pages | footer.main-site-footer |
| `1px #ffffff@0.07` | 542 | 2 pages | td |
| `1px #da9a28@0.40` | 300 | 15 pages | span.ai-chip |
| `1px #25d366` | 220 | all pages | a.btn.btn-success |
| `1px #ffffff@0.12` | 136 | all pages | nav.navbar.navbar-expand-lg.navbar-custom |
| `2px #0f172a` | 120 | 15 pages | span#ai-agent-badge |
| `1px #d4a017` | 120 | 2 pages | span.badge.mb-2.px-3 |
| `3px #c18a1a` | 95 | 39 pages | h2.section-title-static |
| `1px #c18a1a` | 80 | 11 pages | a.btn.fw-bold.px-4 |
| `1px #da9a28@0.30` | 75 | 15 pages | div.ai-chat-header |
| `1px #c18a1a@0.30` | 74 | 2 pages | div |
| `2px #ffffff` | 60 | 15 pages | button#ai-agent-btn |
| `2px #c18a1a` | 60 | 1 page | div.hero-booking-form-container |
| `1px #c18a1a@0.40` | 32 | 2 pages | span |
| `1px #c18a1a@0.25` | 29 | 2 pages | section |
| `2px #d4a017@0.45` | 24 | 6 pages | div |
| `1px #c18a1a@0.35` | 20 | 1 page | div |
| `2px transparent` | 20 | 2 pages | a |
| `1px #d4a017@0.40` | 16 | 1 page | a |
| `1px #da9a28@0.25` | 15 | 15 pages | div.ai-chat-footer |
| `1px #c18a1a@0.45` | 12 | 1 page | div |
| `3px #d4a017` | 7 | 7 pages | section.page-hero |
| `1px #c18a1a@0.20` | 5 | 1 page | section.content-section.premium-features-sect… |
| `2px #c18a1a@0.40` | 4 | 1 page | img.img-fluid.rounded.shadow-lg |
| `1px #d4a017@0.30` | 4 | 1 page | span |
| `2px #d4a017` | 4 | 1 page | a |
| `3px #e74c3c` | 4 | 2 pages | div.guide-callout.guide-callout--warning |
| `1px #ffffff@0.05` | 2 | 1 page | section.content-section |
| `2px #da9a28@0.30` | 1 | 1 page | section.page-hero.text-center.py-5 |
| `1px #ffffff@0.08` | 1 | 1 page | div.d-flex.flex-wrap.justify-content-center |

…and 1 more.

### 1e. Pure black / pure white in use

- `#ffffff` on 383 elements (all pages), e.g. a.nav-link
- `#ffffff` on 48 elements (all pages), e.g. div
- `#000000` on 1 elements (1 page), e.g. button.accordion-button

### 1f. Hardcoded colours and inline styles in JSX

- Hex/rgb literals in JSX: **0** — the guide components already take every colour from CSS variables.
- Inline `style={{…}}` objects in JSX: **24**, listed below. `components/GuideBlocks.tsx` (12 of them) is **not imported anywhere** — a leftover from before the guide was rebuilt, and the only file using `--color-brand-primary`.

| Location | Code |
|---|---|
| `app/ReplicaPage.tsx:24` | `<div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: page.body }} />` |
| `app/ziyarat-guide/[lang]/page.tsx:107` | `<div className="guide-grid" style={{ alignItems: 'center' }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:108` | `<div style={{ gridColumn: '1 / -1', maxWidth: '48rem' }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:111` | `<p className="guide-lead" style={{ marginTop: '1.25rem' }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:122` | `<div className="guide-grid" style={{ alignItems: 'center' }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:142` | `<p className="guide-note" style={{ marginTop: '1.5rem' }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:156` | `<section className="guide-section" style={{ paddingTop: 0 }}>` |
| `app/ziyarat-guide/[lang]/page.tsx:171` | `style={{ marginBottom: '4rem' }}` |
| `app/ziyarat-guide/[lang]/page.tsx:178` | `<p className="guide-lead" style={{ marginTop: '1rem' }}>{chapter.intro}</p>` |
| `components/guide/LocationsIndex.tsx:87` | `<div key={city} style={{ marginBottom: '3rem' }}>` |
| `components/GuideBlocks.tsx:36` | `<h3 id={block.id} className="mt-5 mb-3" style={{ scrollMarginTop: '90px' }}>` |
| `components/GuideBlocks.tsx:48` | `style={{` |
| `components/GuideBlocks.tsx:61` | `<h4 className="mb-2" style={{ color: 'var(--color-brand-primary)' }}>{block.title}</h4>` |
| `components/GuideBlocks.tsx:76` | `<figure className="p-4 my-4" style={{ ...CARD, borderInlineStart: '4px solid var(--color-…` |
| `components/GuideBlocks.tsx:84` | `<figcaption className="small" style={{ color: 'var(--color-brand-primary)' }}>` |
| `components/GuideBlocks.tsx:98` | `style={{ background: 'var(--color-brand-primary)', color: 'var(--color-text-on-brand)' }}` |
| `components/GuideBlocks.tsx:109` | `<figcaption className="small" style={{ color: 'var(--color-brand-primary)' }}>` |
| `components/GuideBlocks.tsx:120` | `<ol className="mb-4 ps-0" style={{ listStyle: 'none' }}>` |
| `components/GuideBlocks.tsx:126` | `style={{` |
| `components/GuideBlocks.tsx:144` | `<div className="my-4" style={{ ...CARD, overflowX: 'auto' }}>` |
| `components/GuideBlocks.tsx:145` | `<table className="table table-dark table-striped mb-0" style={{ background: 'transparent'…` |
| `components/GuideBlocks.tsx:162` | `<h4 className="mb-3" style={{ color: 'var(--color-brand-primary)' }}>{block.title}</h4>` |
| `components/SiteChrome.tsx:21` | `return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: nav }} />;` |
| `components/SiteChrome.tsx:28` | `style={{ display: 'contents' }}` |

## 2. Typography

### 2a. Families rendered

| Family | Text elements |
|---|---|
| Poppins | 5369 |

### 2b. Font sizes rendered

| Size | Text elements | On a 12/14/16/18/20/24/30/36/48 scale? |
|---|---|---|
| 16px | 2018 | yes |
| 14px | 859 | yes |
| 14.72px | 458 | **no** |
| 14.4px | 298 | **no** |
| 12px | 228 | yes |
| 20px | 212 | yes |
| 15px | 184 | **no** |
| 28px | 137 | **no** |
| 17.6px | 107 | **no** |
| 14.08px | 102 | **no** |
| 24px | 93 | yes |
| 12.48px | 93 | **no** |
| 18px | 82 | yes |
| 12.8px | 72 | **no** |
| 13.12px | 58 | **no** |
| 32px | 57 | **no** |
| 21.6px | 54 | **no** |
| 16.8px | 45 | **no** |
| 15.2px | 43 | **no** |
| 48px | 41 | yes |
| 15.68px | 32 | **no** |
| 36px | 22 | yes |
| 10px | 15 | **no** |
| 35.2px | 11 | **no** |
| 18.4px | 10 | **no** |
| 57.6px | 6 | **no** |
| 13px | 6 | **no** |
| 19.2px | 6 | **no** |
| 38.4px | 4 | **no** |
| 44.8px | 4 | **no** |
| 40px | 3 | **no** |
| 36.8px | 2 | **no** |
| 28.8px | 2 | **no** |
| 13.6px | 2 | **no** |
| 11.52px | 1 | **no** |
| 43.2px | 1 | **no** |
| 41.6px | 1 | **no** |

### 2c. Weights and line heights rendered

| Weight | Text elements |
|---|---|
| 400 | 2481 |
| 600 | 1528 |
| 700 | 971 |
| 500 | 313 |
| 800 | 46 |
| 300 | 20 |
| 900 | 10 |

| Line height | Text elements |
|---|---|
| 24px | 1153 |
| 21px | 816 |
| 28.8px | 623 |
| 22.08px | 465 |
| 19.2px | 273 |
| 28px | 242 |
| 21.6px | 232 |
| 18px | 183 |
| 22.5px | 162 |
| 33.6px | 137 |
| 27.2px | 120 |
| 18.72px | 93 |
| 21.12px | 84 |
| 26.4px | 56 |
| 32.4px | 54 |
| 40px | 52 |
| 20.24px | 50 |
| 15.088px | 50 |
| 24.48px | 46 |
| 57.6px | 43 |
| 20px | 42 |
| 25.2px | 31 |
| 38.4px | 30 |
| 32px | 27 |
| 12px | 25 |
| 20.52px | 25 |
| 26px | 23 |
| 21.75px | 22 |
| 16px | 20 |
| 25.344px | 18 |

### 2d. Letter-spacing on UPPERCASE labels

| Letter-spacing | Elements |
|---|---|
| ls:normal | 192 |
| ls:0.72px | 162 |
| ls:0.5px | 52 |
| ls:1.92px | 26 |
| ls:1px | 6 |
| ls:2px | 5 |
| ls:1.5px | 4 |

### 2e. Complete type combinations (family · size · weight · line height · tracking · case)

**106** distinct combinations at 1280px. The 40 most used:

| Combination | Elements | Where | Example |
|---|---|---|---|
| Poppins · 16px · 400 · 24px · ls:normal | 919 | all pages | p.text-secondary |
| Poppins · 14px · 400 · 21px · ls:normal | 508 | 3 pages | a.text-white-50.text-decoration-none |
| Poppins · 16px · 400 · 28.8px · ls:normal | 346 | 28 pages | p.text-secondary |
| Poppins · 14px · 600 · 21px · ls:normal | 268 | 3 pages | a.btn.btn-success.btn-sm |
| Poppins · 14.72px · 500 · 22.08px · ls:normal | 245 | all pages | a.nav-link |
| Poppins · 14.4px · 400 · 21.6px · ls:normal | 221 | 33 pages | p.card-text.text-secondary.small |
| Poppins · 16px · 600 · 24px · ls:normal | 214 | 42 pages | a.primary-button.d-block.text-center |
| Poppins · 16px · 700 · 19.2px · ls:normal · uppercase | 192 | all pages | h5.footer-heading |
| Poppins · 16px · 700 · 28.8px · ls:normal | 183 | 28 pages | strong |
| Poppins · 12px · 700 · 18px · ls:0.72px · uppercase | 162 | 2 pages | dt.guide-location__term |
| Poppins · 15px · 600 · 22.5px · ls:normal | 162 | 2 pages | dd.guide-location__value |
| Poppins · 20px · 600 · 28px · ls:-0.5px | 160 | 2 pages | h3#kabah |
| Poppins · 14.72px · 600 · 22.08px · ls:normal | 144 | all pages | a |
| Poppins · 28px · 600 · 33.6px · ls:normal | 137 | 31 pages | h3.mt-4 |
| Poppins · 16px · 400 · 27.2px · ls:normal | 120 | 2 pages | li |
| Poppins · 24px · 600 · 28.8px · ls:normal | 93 | 36 pages | h4.card-title |
| Poppins · 12.48px · 600 · 18.72px · ls:normal | 79 | 15 pages | span.ai-chip |
| Poppins · 18px · 600 · 28px · ls:-0.45px | 76 | 2 pages | p.guide-scripture__label |
| Poppins · 14.08px · 600 · 21.12px · ls:normal | 53 | all pages | a.btn.btn-success |
| Poppins · 17.6px · 700 · 20.24px · ls:0.5px | 49 | all pages | span |
| Poppins · 13.12px · 700 · 15.088px · ls:0.5px · uppercase | 49 | all pages | span |
| Poppins · 14.72px · 400 · 22.08px · ls:normal | 49 | all pages | li |
| Poppins · 21.6px · 700 · 32.4px · ls:0.5px | 48 | all pages | span |
| Poppins · 14.4px · 400 · 24.48px · ls:normal | 46 | 46 pages | p.footer-text |
| Poppins · 14px · 500 · 20px · ls:normal | 42 | 2 pages | figcaption.guide-source |
| Poppins · 14px · 700 · 21px · ls:normal | 40 | 4 pages | a.btn.btn-sm.fw-bold |
| Poppins · 12.8px · 400 · 19.2px · ls:normal | 39 | 2 pages | span |
| Poppins · 14.08px · 700 · 21.12px · ls:normal | 30 | 15 pages | strong |
| Poppins · 20px · 400 · 40px · ls:normal | 30 | 2 pages | p.guide-arabic |
| Poppins · 17.6px · 400 · 26.4px · ls:normal | 29 | 29 pages | span.label |
| Poppins · 32px · 600 · 38.4px · ls:normal | 28 | 28 pages | h3 |
| Poppins · 16.8px · 700 · 25.2px · ls:normal | 28 | 28 pages | a |
| Poppins · 12.8px · 600 · 19.2px · ls:normal | 28 | 4 pages | div.service-card-category |
| Poppins · 17.6px · 700 · 26.4px · ls:normal | 27 | 27 pages | a |
| Poppins · 32px · 400 · 32px · ls:normal | 27 | 27 pages | button#cart-close-btn |
| Poppins · 48px · 600 · 57.6px · ls:normal | 27 | 27 pages | h1 |
| Poppins · 12px · 700 · 12px · ls:normal | 25 | 1 page | span.badge |
| Poppins · 15.2px · 700 · 20.52px · ls:normal | 25 | 1 page | h6.card-title.text-white.fw-bold |
| Poppins · 16px · 400 · 26px · ls:normal | 23 | 2 pages | p.guide-translation |
| Poppins · 15px · 400 · 21.75px · ls:normal | 22 | 2 pages | a |

## 3. Spacing, radius, shadow, motion

### Padding — 44 distinct values, **29 off the 4px grid**

| Value | Uses | On 4px grid | Where | Example |
|---|---|---|---|---|
| `12px` | 2363 | yes | all pages | div.container |
| `16px` | 2079 | yes | 45 pages | div#ai-chat-body.ai-chat-body |
| `12.8px` | 912 | **no** | all pages | a.nav-link |
| `24px` | 810 | yes | all pages | section.page-hero |
| `8px` | 736 | yes | all pages | h5.footer-heading |
| `6.4px` | 628 | **no** | all pages | a.nav-link |
| `20px` | 612 | yes | 31 pages | button.accordion-button |
| `28px` | 584 | yes | 44 pages | a.primary-button.d-block.text-center |
| `6px` | 510 | **no** | all pages | nav.navbar.navbar-expand-lg.navbar-cu… |
| `10px` | 260 | **no** | all pages | div |
| `13.6px` | 232 | **no** | 2 pages | span.guide-eyebrow-pill |
| `1px` | 184 | **no** | 46 pages | button#ai-close-chat.ai-close-btn |
| `48px` | 141 | yes | all pages | section.content-section.py-5 |
| `2px` | 98 | **no** | all pages | a.navbar-brand.d-flex.align-items-cen… |
| `14.4px` | 98 | **no** | all pages | a.btn.btn-success |
| `32px` | 87 | yes | 31 pages | ul.text-secondary |
| `80px` | 78 | yes | 39 pages | section.page-hero |
| `22px` | 74 | **no** | 2 pages | div |
| `18px` | 72 | **no** | 15 pages | div.ai-chat-header |
| `64px` | 64 | yes | 30 pages | section.content-section |
| `5px` | 62 | **no** | 3 pages | span.badge |
| `4px` | 56 | yes | 4 pages | div.service-card-category |
| `7.2px` | 44 | **no** | 2 pages | a |
| `15.2px` | 44 | **no** | 2 pages | a |
| `14px` | 40 | **no** | 15 pages | div.ai-chat-header |
| `9px` | 38 | **no** | 15 pages | input#ai-chat-input.ai-input |
| `11px` | 34 | **no** | 1 page | a |
| `7px` | 31 | **no** | 15 pages | span#ai-agent-badge |
| `3px` | 30 | **no** | 15 pages | span#ai-agent-badge |
| `21.6px` | 26 | **no** | 2 pages | ul.guide-takeaways |
| `104px` | 12 | yes | 6 pages | section.page-hero |
| `26px` | 12 | **no** | 1 page | div |
| `15px` | 10 | **no** | 1 page | div.service-carousel |
| `40px` | 4 | yes | 2 pages | section.content-section.premium-featu… |
| `85px` | 4 | **no** | 1 page | section.content-section |
| `35px` | 4 | **no** | 1 page | div |
| `5.6px` | 4 | **no** | 2 pages | span.guide-eyebrow-pill |
| `61.6px` | 4 | **no** | 2 pages | section.guide-section--tight |
| `75px` | 2 | **no** | 1 page | section.content-section |
| `90px` | 2 | **no** | 1 page | section |

…and 4 more.

### Margin (top/bottom) — 30 distinct values, **16 off the 4px grid**

| Value | Uses | On 4px grid | Where | Example |
|---|---|---|---|---|
| `16px` | 952 | yes | all pages | p.lead.text-white-50 |
| `12px` | 829 | yes | all pages | li |
| `24px` | 697 | yes | all pages | h2.section-title-static |
| `8px` | 428 | yes | all pages | h1.display-4.text-white |
| `20px` | 425 | yes | all pages | h5.footer-heading |
| `5px` | 304 | **no** | all pages | i.fas.fa-phone-alt |
| `2.4px` | 200 | **no** | 2 pages | dt.guide-location__term |
| `40px` | 162 | yes | 3 pages | p |
| `9.6px` | 126 | **no** | 2 pages | li |
| `48px` | 110 | yes | 40 pages | header.page-header.text-center.mb-5 |
| `-24px` | 60 | yes | all pages | div.row.gy-4 |
| `17.6px` | 38 | **no** | 2 pages | li |
| `-48px` | 34 | yes | 34 pages | div.row.g-5.mb-5 |
| `14px` | 33 | **no** | 2 pages | span |
| `64px` | 20 | yes | 2 pages | article.guide-prose |
| `10px` | 18 | **no** | 2 pages | h1.h1 |
| `18px` | 14 | **no** | 2 pages | p |
| `6px` | 7 | **no** | 1 page | h5 |
| `4px` | 5 | yes | 2 pages | h3 |
| `-1px` | 3 | **no** | 1 page | button.nav-link.active |
| `7px` | 3 | **no** | 1 page | h4 |
| `-16px` | 2 | yes | 2 pages | div.row.g-3 |
| `20.5156px` | 2 | **no** | 1 page | div.mt-auto.d-grid.gap-2 |
| `22px` | 2 | **no** | 2 pages | div |
| `11.2px` | 2 | **no** | 2 pages | span.guide-langs__label |
| `14.4px` | 2 | **no** | 2 pages | p.guide-toc__title.d-none.d-lg-block |
| `32px` | 1 | yes | 1 page | div.top-filters-container |
| `50px` | 1 | **no** | 1 page | footer.main-site-footer.py-5 |
| `22.4px` | 1 | **no** | 1 page | p.hero-subtitle |
| `28px` | 1 | yes | 1 page | p |

### Flex/grid gap — 13 distinct values, **5 off the 4px grid**

| Value | Uses | On 4px grid | Where | Example |
|---|---|---|---|---|
| `8px` | 304 | yes | all pages | ul.navbar-nav.ms-auto.align-items-lg-… |
| `12px` | 262 | yes | all pages | a.navbar-brand.d-flex.align-items-cen… |
| `6.4px` | 236 | **no** | 2 pages | a.guide-btn |
| `16px` | 213 | yes | 33 pages | div.cart-actions-buttons |
| `10px` | 199 | **no** | all pages | li |
| `6px` | 79 | **no** | all pages | a.btn.btn-success |
| `5px` | 75 | **no** | 15 pages | span.ai-chip |
| `14px` | 14 | **no** | 1 page | div |
| `64px` | 6 | yes | 2 pages | div.guide-grid |
| `24px` | 2 | yes | 1 page | div.reviews-ticker-track |
| `32px` | 1 | yes | 1 page | div.service-view-grid |
| `4px` | 1 | yes | 1 page | div#nav-tab.nav.nav-tabs.hero-form-ta… |
| `20px` | 1 | yes | 1 page | div.service-carousel |

### Border radius — 21 distinct values

| Radius | Elements | Where | Example |
|---|---|---|---|
| `16px` | 460 | 4 pages | a.vehicle-cat-card |
| `8px` | 282 | all pages | img |
| `6px` | 264 | all pages | a.nav-link |
| `50%` | 199 | all pages | a.fab-btn.whatsapp |
| `20px` | 112 | 16 pages | span.ai-chip |
| `12px` | 95 | 36 pages | div.card.service-card.h-100 |
| `7px` | 49 | all pages | a.btn.btn-success |
| `4px` | 48 | all pages | div |
| `14px` | 28 | 8 pages | img.img-fluid.w-100 |
| `9999px` | 28 | 4 pages | div.service-card-category |
| `50px` | 27 | 27 pages | a.whatsapp-button |
| `5px 5px 0px 0px` | 26 | 2 pages | button.accordion-button |
| `18px` | 24 | 2 pages | a |
| `999px` | 24 | 2 pages | span.guide-eyebrow-pill |
| `25px` | 20 | 15 pages | input#ai-chat-input.ai-input |
| `10px` | 16 | 15 pages | span#ai-agent-badge |
| `30px` | 15 | 1 page | span |
| `2px` | 3 | 2 pages | div |
| `6px 6px 0px 0px` | 1 | 1 page | div.accordion-item |
| `0px 0px 6px 6px` | 1 | 1 page | div.accordion-item |
| `0px 0px 5px 5px` | 1 | 1 page | button.accordion-button.collapsed |

### Box shadow — 28 distinct values

| Shadow | Elements | Where | Example |
|---|---|---|---|
| rgba(0, 0, 0, 0.18) 0px 1px 2px 0px, rgba(0, 0, 0, 0.35) 0px 8px 24px -12px | 122 | 2 pages | a.guide-btn |
| rgba(0, 0, 0, 0.2) 0px 4px 15px 0px | 92 | 35 pages | div.card.service-card.h-100 |
| rgba(0, 0, 0, 0.85) 0px 4px 25px 0px | 80 | all pages | nav.navbar.navbar-expand-lg.navba… |
| rgba(255, 204, 0, 0.25) 0px 4px 12px 0px | 31 | 31 pages | button#fabToggle.fab-main |
| rgba(255, 204, 0, 0.2) 0px 2px 8px 0px | 27 | 27 pages | a.whatsapp-button |
| rgba(37, 211, 102, 0.45) 0px 4px 15px 0px | 17 | 17 pages | a.fab-btn.whatsapp |
| rgba(24, 119, 242, 0.45) 0px 4px 15px 0px | 17 | 17 pages | a.fab-btn.facebook |
| rgba(37, 211, 102, 0.5) 0px 8px 25px 0px, rgba(37, 211, 102, 0.4) 0px 0px 15px … | 15 | 15 pages | button#ai-agent-btn |
| rgba(0, 0, 0, 0.5) 0px 2px 5px 0px | 15 | 15 pages | span#ai-agent-badge |
| rgba(218, 154, 40, 0.4) 0px 2px 10px 0px | 15 | 15 pages | div.ai-avatar |
| rgba(218, 154, 40, 0.4) 0px 3px 10px 0px | 15 | 15 pages | button#ai-send-btn.ai-send-btn |
| rgba(0, 0, 0, 0.4) 0px 4px 10px 0px | 14 | 1 page | img.client-avatar-img |
| rgba(193, 138, 26, 0.35) 0px 4px 16px 0px | 13 | 1 page | a |
| rgba(0, 0, 0, 0.85) 0px 20px 50px 0px, rgba(212, 160, 23, 0.3) 0px 0px 30px 0px | 6 | 6 pages | div |
| rgba(0, 0, 0, 0.4) 0px 8px 25px 0px | 6 | 1 page | div |
| rgba(0, 0, 0, 0.4) 0px 8px 30px 0px | 6 | 1 page | div |
| rgba(0, 0, 0, 0.7) 0px 6px 20px 0px, rgba(212, 160, 23, 0.25) 0px 0px 12px 0px | 4 | 1 page | div |
| rgba(0, 0, 0, 0.45) 0px 10px 30px 0px | 4 | 1 page | a.vehicle-cat-card |
| rgba(0, 0, 0, 0.5) 0px 8px 25px 0px | 4 | 1 page | div |
| rgba(193, 138, 26, 0.2) 0px 4px 15px 0px | 3 | 1 page | div |
| rgba(255, 204, 0, 0.2) 0px 4px 15px 0px | 2 | 1 page | button.carousel-prev |
| rgba(255, 255, 255, 0.15) 0px -1px 0px 0px inset | 1 | 1 page | button.accordion-button |
| rgba(0, 0, 0, 0.85) 0px 25px 70px 0px, rgba(193, 138, 26, 0.2) 0px 0px 40px 0px | 1 | 1 page | div.hero-booking-form-container |
| rgb(212, 160, 23) 0px -3px 0px 0px inset | 1 | 1 page | button.nav-link.active |
| rgba(193, 138, 26, 0.4) 0px 6px 18px 0px | 1 | 1 page | button#open-service-modal-btn.btn… |
| rgba(0, 0, 0, 0.176) 0px 16px 48px 0px | 1 | 1 page | img.img-fluid.rounded.shadow-lg |
| rgba(37, 211, 102, 0.35) 0px 8px 25px 0px | 1 | 1 page | a |
| rgba(0, 0, 0, 0.6) 0px 10px 35px 0px | 1 | 1 page | div |

### Transition duration — 5 distinct values

| Duration | Elements | Where |
|---|---|---|
| 0.3s | 1488 | all pages |
| 0.2s | 694 | all pages |
| 0.15s | 109 | all pages |
| 0.4s | 63 | 30 pages |
| 0.35s | 15 | 15 pages |

## 4. The same element, styled differently

### 4a. Buttons — 20 distinct styles

Signature = height · padding · radius · background · text colour · size/weight · border.

| Button signature | Count | Where | Example |
|---|---|---|---|
| h37 · pad 8px 16px · r 16px · bg #c18a1a · fg #0e0e0e · 14px/600 · b none | 122 | 2 pages | a.guide-btn "تحميل PDF" |
| h39 · pad 8px 16px · r 16px · bg none · fg #cccccc · 14px/600 · b 1px #ffffff@0.15 | 114 | 2 pages | a.guide-btn.guide-btn--ghost "احصل على … |
| h49.6 · pad 12.8px 28px · r 8px · bg #c18a1a · fg #0e0e0e · 16px/600 · b none | 85 | 32 pages | a.primary-button.d-block.text-center "R… |
| h35.9 · pad 6.4px 14.4px · r 7px · bg #25d366 · fg #ffffff · 14.08px/600 · b 1px #25d366 | 49 | all pages | a.btn.btn-success "WhatsApp" |
| h72 · pad 0px 0px · r 0px · bg none · fg #c18a1a · 16px/400 · b none | 31 | 31 pages | a.whatsapp-chat-button "AI AI Agent Wha… |
| h75.6 · pad 12.8px 28px · r 8px · bg #ffffff@0.10 · fg #f2f2f2 · 16px/600 · b 1px #ffffff@0.15 | 29 | 29 pages | button#continue-shopping-btn.secondary-… |
| h75.6 · pad 12.8px 28px · r 8px · bg #c18a1a · fg #0e0e0e · 16px/600 · b none | 29 | 29 pages | a#proceed-to-checkout-link.primary-butt… |
| h49.2 · pad 12px 20px · r 50px · bg #25d366 · fg #ffffff · 16.8px/700 · b none | 27 | 27 pages | a.whatsapp-button "Inquire on WhatsApp" |
| h51.6 · pad 12.8px 28px · r 8px · bg #ffffff@0.10 · fg #f2f2f2 · 16px/600 · b 1px #ffffff@0.15 | 26 | 26 pages | a.secondary-button.mt-4 "Download Broch… |
| h46.6 · pad 12.8px 28px · r 8px · bg gradient · fg #212529 · 14px/700 · b none | 25 | 1 page | a.btn.btn-sm.fw-bold "Book via WhatsApp" |
| h52 · pad 0px 0px · r 50% · bg #25d366 · fg #ffffff · 26px/400 · b none | 17 | 17 pages | a.fab-btn.whatsapp "" |
| h52 · pad 0px 0px · r 50% · bg #1877f2 · fg #ffffff · 22px/400 · b none | 17 | 17 pages | a.fab-btn.facebook "" |
| h51.6 · pad 12.8px 28px · r 6px · bg #c18a1a · fg #0e0e0e · 16px/600 · b 1px #c18a1a | 7 | 7 pages | a.btn.btn-primary.mt-3 "Book This Vehic… |
| h48.6 · pad 12.8px 28px · r 8px · bg gradient · fg #0a0d14 · 14px/700 · b 1px #c18a1a | 7 | 1 page | a.btn.btn-sm.fw-bold "Book Camry" |
| h43 · pad 10px 16px · r 6px · bg #25d366 · fg #ffffff · 14px/600 · b 1px #25d366 | 6 | 1 page | a.btn.btn-success.btn-sm "Contact on Wh… |
| h42 · pad 8px 24px · r 8px · bg gradient · fg #212529 · 16px/700 · b 1px #c18a1a | 1 | 1 page | a.btn.fw-bold.px-4 "WhatsApp: +966 56 5… |
| h42 · pad 8px 24px · r 8px · bg #c18a1a · fg #0e0e0e · 16px/700 · b 1px #c18a1a | 1 | 1 page | a.btn.fw-bold.px-4 "Secondary: +966 56 … |
| h41.1 · pad 10px 10px · r 10px · bg gradient · fg #0a0d14 · 14.08px/700 · b none | 1 | 1 page | button#open-service-modal-btn.btn.fw-bo… |
| h48.8 · pad 12px 24px · r 8px · bg gradient · fg #0a0d14 · 15.2px/700 · b 1px #c18a1a | 1 | 1 page | a.btn.fw-bold "B2B Partner Inquiry on W… |
| h48.8 · pad 12px 24px · r 8px · bg #c18a1a · fg #0e0e0e · 15.2px/700 · b 1px #c18a1a | 1 | 1 page | a.btn.btn-outline-light.fw-bold "Call S… |

### 4b. Cards — 8 distinct styles

| Card signature | Count | Where | Example |
|---|---|---|---|
| r 16px · pad 20px · bg #ffffff@0.04 · b 1px #ffffff@0.15 · no shadow | 114 | 2 pages | aside.guide-location |
| r 12px · pad 0px · bg gradient · b 1px #ffffff@0.15 · shadow | 56 | 6 pages | div.card.service-card.h-100 |
| r 16px · pad 28px · bg #c18a1a@0.07 · b 1px #ffffff@0.15 · no shadow | 42 | 2 pages | figure.guide-scripture |
| r 16px · pad 24px · bg #ffffff@0.04 · b 1px #ffffff@0.15 · no shadow | 26 | 2 pages | section.guide-infocard |
| r 18px · pad 24px · bg #ffffff@0.04 · b 1px #ffffff@0.12 · no shadow | 14 | 1 page | div.review-ticker-card |
| r 16px · pad 20px 24px · bg #ffffff@0.04 · b 1px #ffffff@0.15 · no shadow | 14 | 2 pages | div.guide-callout.guide-callout--warning |
| r 12px · pad 0px · bg #0f141e · b 1px #c18a1a@0.30 · shadow | 5 | 1 page | a.content-card |
| r 16px · pad 0px · bg #141923@0.95 · b 1px #ffffff@0.15 · shadow | 4 | 1 page | a.vehicle-cat-card |

### 4c. `h1` — 6 distinct styles

| Signature | Count | Where | Example |
|---|---|---|---|
| 48px · 600 · lh 57.6px · align center · mb 8px · #f2f2f2 | 27 | 27 pages | h1 "3-in-1 Kiswa Factory / Makkah " |
| 48px · 300 · lh 57.6px · align center · mb 8px · #ffffff | 11 | 11 pages | h1.display-4.text-white "Airport Pickup Gui… |
| 57.6px · 900 · lh 69.12px · ls 1px · uppercase · align center · mb 12px · #f2f2f2 | 6 | 6 pages | h1 "Coaster / Minibus" |
| 48px · 700 · lh 48px · ls -1.2px · align start · mb 0px · #f2f2f2 | 2 | 2 pages | h1 "الدليل الشامل للأماكن المقدّسة" |
| 48px · 700 · lh 57.6px · align center · mb 16px · #ffffff | 1 | 1 page | h1.display-4.text-white.fw-bold "All Vehicl… |
| 36.8px · 800 · lh 44.16px · ls 0.5px · uppercase · align center · mb 10px · #f2f2f2 | 1 | 1 page | h1.h1 "Your Journey, Our Priority" |

### 4d. `h2` — 16 distinct styles

| Signature | Count | Where | Example |
|---|---|---|---|
| 32px · 600 · lh 38.4px · align start · mb 8px · #f2f2f2 | 27 | 27 pages | h2 "Service Details" |
| 36px · 700 · lh 40px · ls -0.9px · align start · mb 0px · #f2f2f2 | 12 | 2 pages | h2#all-locations "جميع مواقع الزيارات" |
| 36px · 700 · lh 40px · ls -0.9px · align right · mb 0px · #f2f2f2 | 10 | 1 page | h2#makkah "الفصل الأول · مكة المكرمة - مق" |
| 32px · 600 · lh 38.4px · align start · mb 0px · #f2f2f2 | 9 | 1 page | h2.accordion-header "How do I book a ride?" |
| 35.2px · 800 · lh 42.24px · align start · mb 16px · #f2f2f2 | 6 | 6 pages | h2.section-title-static "Vehicle Overview" |
| 35.2px · 600 · lh 42.24px · align start · mb 24px · #f2f2f2 | 4 | 4 pages | h2.section-title-static "Your Arrival Proce… |
| 35.2px · 600 · lh 42.24px · align center · mb 48px · #f2f2f2 | 1 | 1 page | h2.section-title-static.text-center.mb-5 "F… |
| 32px · 700 · lh 38.4px · align center · mb 8px · #ffffff | 1 | 1 page | h2.fw-bold.mb-2.text-white "Live Fleet Gall… |
| 40px · 600 · lh 48px · align center · mb 48px · #f2f2f2 | 1 | 1 page | h2.section-title "Trending Services" |
| 28.8px · 800 · lh 34.56px · align center · mb 8px · #f2f2f2 | 1 | 1 page | h2 "Premium Transport for Hajj & U" |
| 44.8px · 800 · lh 53.76px · ls 1px · align center · mb 10px · #f2f2f2 | 1 | 1 page | h2 "AL HARMAIN UMRAH TRANSPORT" |
| 43.2px · 800 · lh 51.84px · ls -0.5px · align center · mb 16px · #ffffff | 1 | 1 page | h2 "Popular Umrah Taxi Routes in S" |
| 40px · 600 · lh 48px · align center · mb 40px · #f2f2f2 | 1 | 1 page | h2.section-title "Vehicle Categories" |
| 40px · 800 · lh 48px · align center · mb 10px · #f2f2f2 | 1 | 1 page | h2 "What Our Clients Say" |
| 44.8px · 800 · lh 53.76px · align left · mb 16px · #ffffff | 1 | 1 page | h2 "Book Your Umrah               " |
| 41.6px · 800 · lh 49.92px · align center · mb 12px · #f2f2f2 | 1 | 1 page | h2 "Premium Pilgrim Transportation" |

### 4e. `h3` — 8 distinct styles

| Signature | Count | Where | Example |
|---|---|---|---|
| 28px · 600 · lh 33.6px · align start · mb 8px · #f2f2f2 | 137 | 31 pages | h3.mt-4 "1. After Landing" |
| 20px · 600 · lh 28px · ls -0.5px · align start · mb 12px · #f2f2f2 | 83 | 2 pages | h3.guide-index__city "Makkah (26)" |
| 20px · 600 · lh 28px · ls -0.5px · align right · mb 12px · #f2f2f2 | 77 | 1 page | h3#kabah "1.1 الكعبة - أول بيتٍ وُضع للع" |
| 20px · 700 · lh 24px · align center · mb 8px · #f2f2f2 | 6 | 1 page | h3.home-card-title "Asif Ahmad (MD / Owner)" |
| 20px · 600 · lh 24px · align start · mb 16px · #f2f2f2 | 2 | 1 page | h3 "Service Category" |
| 32px · 600 · lh 38.4px · align center · mb 4px · #f2f2f2 | 1 | 1 page | h3 "Our Transport Services" |
| 32px · 800 · lh 38.4px · align center · mb 8px · #f2f2f2 | 1 | 1 page | h3 "Vehicles Suited for Every Grou" |
| 28.8px · 800 · lh 34.56px · align center · mb 10px · #f2f2f2 | 1 | 1 page | h3 "Trusted Ground Partner for 1,5" |

### 4f. Badges, pills and eyebrow labels — 6 distinct styles

| Signature | Count | Where | Example |
|---|---|---|---|
| 12.48px/600 · r 20px · pad 6px 12px · bg #da9a28@0.12 · fg #da9a28 | 75 | 15 pages | span.ai-chip |
| 16px/400 · r 0px · pad 0px · bg none · fg #c18a1a | 31 | 31 pages | span.ai-agent-badge |
| 12px/700 · r 20px · pad 5px 10px · bg #000000@0.75 · fg #d4a017 | 25 | 1 page | span.badge |
| 12px/600 · ls 1.92px · uppercase · r 0px · pad 0px · bg none · fg #d4a017 | 20 | 2 pages | span.guide-eyebrow |
| 12px/600 · ls 1.92px · uppercase · r 999px · pad 5.6px 13.6px · bg #c18a1a · fg #0e0e0e | 2 | 2 pages | span.guide-eyebrow-pill |
| 13.6px/700 · ls 1px · r 6px · pad 8px 16px · bg #da9a28@0.15 · fg #d4a017 | 1 | 1 page | span.badge.mb-2.px-3 |

### 4g. Inner-page headers

| Header pattern | Pages | Examples |
|---|---|---|
| div.container · pad 0px / 0px · h1 48px/600 center · breadcrumb no | 27 | /services/3-in-1-kiswa-factory-makkah-museum-sulah-hudaibiyah, /services/airport-concierge-and-meet-greet, /services/jeddah-airport-to-jeddah-hotel |
| section.page-hero · pad 80px / 80px · h1 48px/300 center · breadcrumb no | 7 | /airport-pickup-guidelines, /blog, /customer-faqs |
| section.page-hero · pad 104px / 104px · h1 57.6px/900 center · breadcrumb no | 6 | /fleet/coaster, /fleet/gmc-xl-yukon, /fleet/hiace-grand-cabin |
| section.page-hero.text-center · pad 80px / 80px · h1 48px/300 center · breadcrumb no | 4 | /services/airport-pick-drops, /services/inter-city, /services/local-transfers |
| section.guide-hero · pad 64px / 64px · h1 48px/700 start · breadcrumb yes | 2 | /ziyarat-guide/ar, /ziyarat-guide/en |
| section.page-hero.text-center.py-5 · pad 48px / 48px · h1 48px/700 center · breadcrumb no | 1 | /fleet |
| section.hero-section · pad 80px / 80px · h1 36.8px/800 center · breadcrumb no | 1 | / |

## 5. Alignment

### 5a. Container widths (1280px)

| Content left edge · width | Pages | Classes |
|---|---|---|
| left 74.5 · width 1140 | all pages | div.container, div.container.py-4, div.container.text-center |
| left 52.5 · width 1200 | 2 pages | div.guide-container |
| left 82 · width 1140 | 1 page | div.container |
| left 24 · width 1280 | 1 page | div.page-container |
| left 0 · width 1265 | 1 page | div.container-fluid.px-0 |

### 5b. Left edges of logo, headings, body text and footer (1280px)

A shared left edge means every value in a row is the same. Centred hero headings are expected to differ; everything else should sit on one line. Values ending in **R** are right-to-left content, measured from the right edge.

| Page | Logo | h1 | first h2 | body text | footer col 1 | distinct edges |
|---|---|---|---|---|---|---|
| /ziyarat-guide/ar | 90.5R | 52.5R | 376.5R | 52.5R | 74.5R | 4 |
| /fleet/coaster | 74.5 | 74.5 | 753.5 | 149.5 | 74.5 | 3 |
| /fleet/hyundai-sonata | 74.5 | 74.5 | 753.5 | 149.5 | 74.5 | 3 |
| /fleet/hyundai-staria | 74.5 | 74.5 | 753.5 | 149.5 | 74.5 | 3 |
| / | 74.5 | 182.5 | 74.5 | 332.5 | 74.5 | 3 |
| /ziyarat-guide/en | 74.5 | 52.5 | 376.5 | 52.5 | 74.5 | 3 |
| /airport-pickup-guidelines | 74.5 | 74.5 | 169.5 | 74.5 | 74.5 | 2 |
| /customer-faqs | 74.5 | 74.5 | 169.5 | 74.5 | 74.5 | 2 |
| /fleet | 74.5 | 74.5 | 74.5 | 257.5 | 74.5 | 2 |
| /fleet/gmc-xl-yukon | 74.5 | 74.5 | 753.5 | 753.5 | 74.5 | 2 |
| /fleet/hiace-grand-cabin | 74.5 | 74.5 | 753.5 | 753.5 | 74.5 | 2 |
| /fleet/toyota-camry | 74.5 | 74.5 | 753.5 | 753.5 | 74.5 | 2 |
| /privacy-policy | 74.5 | 74.5 | 169.5 | 74.5 | 74.5 | 2 |
| /refund-policy | 74.5 | 74.5 | 169.5 | 169.5 | 74.5 | 2 |
| /services/airport-pick-drops | 74.5 | 74.5 | — | 99.5 | 74.5 | 2 |
| /services/inter-city | 74.5 | 74.5 | — | 99.5 | 74.5 | 2 |
| /services/local-transfers | 74.5 | 74.5 | — | 99.5 | 74.5 | 2 |
| /services/ziyarat-tours | 74.5 | 74.5 | — | 99.5 | 74.5 | 2 |
| /blog | 74.5 | 74.5 | — | 74.5 | 74.5 | 1 |
| /book-now | 82 | — | — | — | 82 | 1 |
| /partner-terms | 74.5 | 74.5 | — | 74.5 | 74.5 | 1 |
| /services/3-in-1-kiswa-factory-makkah-museum-sulah-hudaibiyah | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/airport-concierge-and-meet-greet | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-airport-to-jeddah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-airport-to-madinah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-airport-to-makkah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-hotel-to-jeddah-airport | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-hotel-to-madinah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-hotel-to-makkah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/jeddah-local-city-transfer | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-airport-to-madinah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-jeddah-airport | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-jeddah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-madinah-airport | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-makkah-hotel-via-badar-and-roha-well | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-makkah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-hotel-to-train-station | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/madinah-ziyarat | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-jeddah-airport | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-jeddah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-madinah-hotel-via-badar-and-roha-well | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-madinah-hotel-via-taif | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-madinah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-hotel-to-train-station | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-to-taif-ziyarat-and-return | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/makkah-ziyarat | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/train-station-to-madinah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /services/train-station-to-makkah-hotel | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |
| /who-we-are | 74.5 | 74.5 | 74.5 | 74.5 | 74.5 | 1 |

### 5c. Buttons side by side with different heights — 0 cases

| Page | Pair |
|---|---|

### 5d. Card rows: unequal heights, image ratios or button baselines — 2 rows

| Page | Card | Heights | Height spread | Image ratios | Button bottom offsets |
|---|---|---|---|---|---|
| /blog | div.card.service-card.h-100 | 526 / 526 / 526 | 0px | 1.8 / 1.8 / 7.4 | 25 / 25 / 25 |
| /services/ziyarat-tours | div.service-card.h-100 | 509.2 / 509.2 / 509.2 | 0px | 1.8 / 1.8 / 1.6 | 25 / 25 / 25 |

### 5e. Images in the same row with different ratios or rounding — 2 rows

| Page | Images | Aspect ratios | Radii | Sample |
|---|---|---|---|---|
| /blog | 3 | 1.8 / 1.8 / 7.4 | 0px | 1781158582_6a2a52b69ef82_makk… |
| /services/ziyarat-tours | 3 | 1.8 / 1.8 / 1.6 | 0px | makkah_taif_ziyarat.jpg |

### 5f. Stretched images (object-fit: fill, rendered ratio ≠ natural) — 0

| Image | Where |
|---|---|

### 5g. Icons not centred on their text

726 icon+text pairs measured; **0** are more than 1.5px off their text's vertical centre.

| Page | Offset | Icon | In | Text |
|---|---|---|---|---|

### 5h. Section rhythm

**12 different section paddings** (top / bottom):

| Padding | Sections | Where |
|---|---|---|
| 48px / 48px | 68 | all pages |
| 24px / 24px | 55 | 31 pages |
| 64px / 64px | 32 | 30 pages |
| 80px / 80px | 12 | 12 pages |
| 104px / 104px | 6 | 6 pages |
| 85px / 85px | 2 | 1 page |
| 61.6px / 61.6px | 2 | 2 pages |
| 0px / 112px | 2 | 2 pages |
| 0px / 0px | 2 | 2 pages |
| 40px / 40px | 1 | 1 page |
| 75px / 75px | 1 | 1 page |
| 90px / 90px | 1 | 1 page |

**10 different gaps** between a section heading and the content under it:

| Gap | Headings | Example |
|---|---|---|
| 16px | 32 | h2 "Popular Umrah Taxi Route" |
| 40px | 17 | h2.section-title-static "Who We Are" |
| 0px | 7 | h2.accordion-header "How do I book a ride?" |
| 32px | 6 | h2.section-title-static "Vehicle Overview" |
| 24px | 5 | h2.section-title-static "Your Arrival Process" |
| 48px | 4 | h2.accordion-header "How far in advance shoul" |
| 8px | 2 | h2.fw-bold.mb-2.text-white "Live Fleet Gallery (2… |
| 10px | 2 | h2 "AL HARMAIN UMRAH TRANSPO" |
| 72px | 1 | h2.section-title-static.text-center.mb-5 "Frequen… |
| 12px | 1 | h2 "Premium Pilgrim Transpor" |

### 5i. Mobile (390px)

- Pages with horizontal overflow at 390px: **0**
- Side-by-side buttons of different heights: **0**
- Card rows with unequal heights / ratios / button baselines: **0**

## 6. Focus states (real keyboard test)

Each control was reached with Tab / Shift+Tab so `:focus-visible` applies, then its computed style was compared at rest and when focused. Nav links were also checked by screenshot.

| Control | Where | What changes on keyboard focus | Verdict |
|---|---|---|---|
| Nav links `a.nav-link` | all pages | a faint box (border + darker background) | visible, low contrast |
| Nav "WhatsApp" button `a.btn.btn-success` | all pages | nothing: outline and Bootstrap focus shadow both suppressed | **no indicator** |
| "Read More About Us" `a.btn.btn-primary` | home | nothing | **no indicator** |
| "Select & Configure Your Service" `#open-service-modal-btn` | home | nothing | **no indicator** |
| `.primary-button`, `.secondary-button` | most inner pages | browser default ring | visible, unstyled |
| Floating toggle `.fab-main` | 31 pages | browser default ring, 1px | visible, thin |
| Trending cards `a.content-card` | home | browser default ring | visible, unstyled |
| Guide buttons, TOC and language links | guide | browser default ring (`guide.css` has no focus rules) | visible, unstyled |

Source: `style.css` has 16 `:focus` rules, 5 of them `outline: none` (form fields swap in a box-shadow; `.navbar-toggler:focus` gets nothing). `dynamic_styles.css` has 1, `guide.css` 0. There is no shared focus style anywhere.

## 7. Contrast of the main colour pairs (WCAG AA)

AA needs 4.5:1 for normal text, 3:1 for large text (24px, or 18.7px bold) and for icons. Measured against the solid background each element sits on. Text over photos (the hero) is checked in STEP 6.

| Pair | Colours | Size | Ratio | Needs | Result |
|---|---|---|---|---|---|
| Primary button text | `#0e0e0e` on `#c18a1a` | 16px | 6.36:1 | 4.5:1 | pass |
| WhatsApp buttons (nav, service pages) | `#ffffff` on `#25d366` | 14–16.8px | 1.98:1 | 4.5:1 | **FAIL** |
| WhatsApp floating button icon | `#ffffff` on `#25d366` | icon | 1.98:1 | 3:1 | **FAIL** |
| Facebook floating button icon | `#ffffff` on `#1877f2` | icon | 4.23:1 | 3:1 | pass |
| Body text `.text-secondary` on section | `#a6a6a6` on `#111317` | 16px | 7.64:1 | 4.5:1 | pass |
| Body text on accordion item | `#a6a6a6` on `#2b303b` | 16px | 5.43:1 | 4.5:1 | pass |
| `.text-white-50` (white 50% over #111317) | `#888a8b` on `#111317` | 16px | 5.36:1 | 4.5:1 | pass |
| Lead text | `#cccccc` on `#111317` | 16px | 11.58:1 | 4.5:1 | pass |
| Headings | `#f2f2f2` on `#111317` | 32px | 16.61:1 | 3:1 | pass |
| Gold labels / links | `#da9a28` on `#12161f` | 17.6px | 7.44:1 | 4.5:1 | pass |
| Gold badges | `#d4a017` on `#111317` | 13.6px | 7.83:1 | 4.5:1 | pass |
| Accordion question text | `#c18a1a` on `#2b303b` | 16px | 4.35:1 | 4.5:1 | **FAIL** |
| Gradient button text | `#212529` on `#c18a1a` | 14px | 5.08:1 | 4.5:1 | pass |
| AI chat secondary text | `#94a3b8` on `#0f172a` | 14px | 6.96:1 | 4.5:1 | pass |
| Muted text (1 page) | `#6b7a99` on `#0e131d` | 14px | 4.31:1 | 4.5:1 | **FAIL** |
| Guide eyebrow label | `#d4a017` on `#0d0f13` | 12px | 8.07:1 | 4.5:1 | pass |

For the failures: dark text `#0e0e0e` on the WhatsApp green gives 9.73:1 and keeps the brand colour; the accordion text in `#da9a28` on `#2b303b` gives 5.43:1.

## 8. Other findings

- **Logo colours** (measured from `/img/LOGO.png`, 500×499): dominant navy `#183048`, dark navy averaging `#151e2e` (30% of pixels), silver greys `#787878`–`#d8d8d8` (~30%). Gold is only 2%, a muted `#987d53`. The site's gold `#c18a1a` comes from the original CSS, not the logo.
- **Three golds do one job:** `#c18a1a` (buttons, borders, rules), `#da9a28` (spans, AI widget) and `#d4a017` (badges, fleet heroes). There are also two yellows, `#ffcc00` and `#ffc107`.
- **A second palette:** the AI chat widget (`ai_agent.js`, 15 pages) injects Tailwind slate colours (`#0f172a`, `#1e293b`, `#94a3b8`, `#cbd5e1`, `#e2e8f0`) plus its own gold and gradients.
- **Near-identical dark backgrounds:** `#16181d`, `#12161f`, `#111317`, `#0c1017`, `#0b0f19`, `#0d0f13`, `#0e131d`, `#0f141e`, plus 25 gradients, most of them dark-on-dark.
- **Two containers:** Bootstrap 1140px (content edge 74.5px at 1280) vs the guide's 1200px (52.5px), so guide text starts 22px left of the logo. `/book-now` sits at 82px, 7.5px off.
- **Non-Latin scripts:** Poppins has no Arabic, Devanagari or Bengali glyphs. The guide's ar / ur / fa / hi / bn pages render in whatever fallback font the visitor's device has, so they look different on every device. Urdu would normally use a Nastaliq face.
- **Pure white / black:** `#ffffff` on 383 text elements and 48 backgrounds; `#000000` on 1 background, plus black-75% badges.
- **Leftover file:** `components/GuideBlocks.tsx` is not imported anywhere.

## 9. Decisions needed before STEP 2

**1. Replica or polish.** Everything so far was built to match the original pixel for pixel ("Do not redesign, do not improve"). STEPS 2–5 deliberately change how every page looks, so the pixel-parity checks will stop passing. The content checks (text, headings, images, links, phone numbers) will keep passing. Most of the inconsistency sits in the original markup: **2,976 inline `style=""` attributes** and 295 `!important` rules, which a normal stylesheet cannot override.

- **A: one override layer (recommended).** A single `polish.css`, loaded last, holds the tokens (colour, type, spacing, radius, shadow, focus) and re-maps the existing classes (`.primary-button`, `.btn`, cards, sections, headings, containers). Where an inline style blocks it, the extractor turns that inline style into a class at build time; page text is untouched. Reversible by removing one file and one build step.
- **B: rewrite each page into components.** Cleanest end state, but much bigger and the highest risk of content drift. Too much for a polish round.
- **C: polish only the guide and the shared parts** (nav, footer, buttons, focus). The 47 replicated pages stay as the original.

**2. Primary colour.** The logo is navy and silver; gold is 2% of it.

- **(a) Navy primary from the logo**, gold only as a small accent. This is the biggest visual change, and what "derive the primary colour from the logo" literally means.
- **(b) Keep the dark ground with gold accents** (what you picked for the guide last round) and derive the neutrals from the logo's navy and silver. A smaller change.

The WhatsApp contrast failure is fixed either way (dark text on the green), since the brief requires every pair to pass AA.
