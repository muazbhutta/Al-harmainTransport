# DESIGN-TOKENS.md — Ziyarat guide reference

Source: <https://www.alsaleemtransport.com/en/ziyarat-guide>

**How these were obtained.** Values are read from the reference's own CSS
(`/_next/static/css/b3330c1d4c2ac57f.css` and `e5994d32543ac633.css`) and from
the **computed styles of the rendered page**, not guessed from a screenshot.

The browser pane blocks the live site's cross-origin CSS (`SecurityError`), so
the page, both stylesheets and all 17 webfonts were mirrored locally and served
same-origin — that is the only way the real computed values could be measured.

> ⚠ **No screenshots arrived.** Your message refers to attached screenshots but
> nothing came through. Everything below is from the CSS and the live DOM, which
> is more precise than a screenshot anyway — but please re-attach them for Step 3
> so I can compare against what you are actually looking at.

---

## 1. Colour

The reference is a **light theme**: warm sand page, white/emerald-tinted cards,
deep emerald for dark bands, brass for accents.

### Emerald (primary)

| Token | RGB | Hex |
|---|---|---|
| `--emerald-50` | 238 245 242 | `#EEF5F2` |
| `--emerald-100` | 213 231 224 | `#D5E7E0` |
| `--emerald-200` | 173 207 195 | `#ADCFC3` |
| `--emerald-300` | 127 179 162 | `#7FB3A2` |
| `--emerald-400` | 78 146 128 | `#4E9280` |
| `--emerald-500` | 42 115 98 | `#2A7362` |
| `--emerald-600` | 23 90 75 | `#175A4B` |
| `--emerald-700` | 15 70 58 | `#0F463A` |
| `--emerald-800` | 11 46 39 | `#0B2E27` |
| `--emerald-900` | 6 35 29 | `#06231D` |
| `--emerald-950` | 4 23 19 | `#041713` |

### Brass (accent)

| Token | RGB | Hex |
|---|---|---|
| `--brass-300` | 224 192 120 | `#E0C078` |
| `--brass-400` | 212 175 98 | `#D4AF62` |
| `--brass-500` **= `--accent`** | 201 162 75 | `#C9A24B` |
| `--brass-600` **= `--accent-strong`** | 184 135 63 | `#B8873F` |
| `--brass-700` | 150 108 49 | `#966C31` |
| `--brass-800` | 130 92 38 | `#825C26` |

### Sand (page surfaces)

| Token | RGB | Hex |
|---|---|---|
| `--sand-50` **= `--surface-base`** | 251 248 241 | `#FBF8F1` |
| `--sand-100` | 246 240 229 | `#F6F0E5` |
| `--sand-200` **= `--surface-muted`** | 242 235 221 | `#F2EBDD` |
| `--sand-300` | 230 220 199 | `#E6DCC7` |

### Text

| Token | RGB | Hex | Use |
|---|---|---|---|
| `--ink` | 26 36 32 | `#1A2420` | body and headings |
| `--ink-soft` | 74 85 81 | `#4A5551` | translations, secondary |
| `--ink-faint` | 96 105 101 | `#606965` | muted / meta |

### Semantic

| Token | Value |
|---|---|
| `--surface-base` | `#FBF8F1` (page) |
| `--surface-raised` | `#FFFFFF` (cards) |
| `--surface-muted` | `#F2EBDD` |
| `--surface-inverse` | `#06231D` (dark bands) |
| `--on-surface-inverse` | `#FBF8F1` |
| `--border-hairline` | `#0B2E27` used at **10% alpha** |
| WhatsApp | `#25D366`, dark `#128C7E` |

---

## 2. Typography

| Role | Family | Source |
|---|---|---|
| Headings + body | **Poppins** | `--font-sans` |
| Arabic | **Noto Naskh Arabic**, serif fallback | `--font-arabic` |

Measured at 1280px:

| Element | Size | Weight | Line height | Letter spacing | Colour |
|---|---|---|---|---|---|
| `h1` | **48px** | 700 | 48px (1.0) | **−1.2px** | `#FBF8F1` on dark band |
| `h2` (chapter) | **36px** | 700 | 40px (1.11) | **−0.9px** | `#1A2420` |
| `h3` (subsection) | **20px** | 600 | 28px (1.4) | **−0.5px** | `#1A2420` |
| Scripture card heading | 18px | 600 | 28px | −0.45px | `#0F463A` emerald-700 |
| Eyebrow ("Chapter 1") | **12px** | 600 | 16px | **+1.92px**, UPPERCASE | `#825C26` brass-800 |
| Body `p` | 16px | 400 | 24px (1.5) | normal | `#1A2420` |
| Translation | 16px | 400 | **26px** | normal | `#4A5551` ink-soft |
| Source line | 14px | **500** | 20px | normal | `#0F463A` emerald-700 |
| Small / meta | 12px | 400 | 16px | normal | `#606965` |
| **Arabic** | **20px** | 400 | **40px (2.0)** | normal | `#1A2420` |
| Table `th` | 14px | 600 | — | — | on dark |
| Table `td` | 14px | 400 | — | — | `#1A2420` |

Note the negative letter-spacing on headings and the **+1.92px positive**
tracking on the uppercase eyebrow — that contrast is a big part of the look.

---

## 3. Layout and spacing

| Token | Value |
|---|---|
| `--section-y` | **5rem** mobile → **7rem** desktop |
| `--header-h` | 4.25rem mobile → **6rem** desktop |
| `--rail-h` | 3.5rem (sticky TOC bar) |
| Container | **1200px** content width (1270px incl. padding at 1280 viewport) |
| Container padding | 20px |
| Prose column | **768px** |
| Hero band padding | **64px 20px** |
| Card gap / stack | 24px (`gap-6`) |
| `scroll-margin-top` | `header-h + rail-h` |

---

## 4. Shape, border, shadow

| Token | Value |
|---|---|
| `--radius-card` | **1rem (16px)** |
| `--radius-pill` | 999px |
| Hairline border | **0.57px** solid `#0B2E27 @ 10%` |
| `--shadow-card` | `0 1px 2px rgb(4 23 19 / .04), 0 8px 24px -12px rgb(4 23 19 / .18)` |
| `--shadow-card-hover` | `0 2px 4px rgb(4 23 19 / .06), 0 16px 32px -14px rgb(4 23 19 / .24)` |

Cards in the guide body carry **no shadow** — they are separated by tint and
hairline border only.

---

## 5. Component recipes (measured)

### Scripture card (Qur'an / Hadith)

```
figure.rounded-2xl
  background      #EEF5F2   (emerald-50)
  border          0.57px solid #0B2E27 @10%
  border-inline-start  2.86px solid #175A4B   (emerald-600)
  border-radius   16px
  padding         28px
  box-shadow      none
```
Inside: emerald-700 heading (18/600) → Arabic (Noto Naskh, 20px / 40px) →
translation (16px / 26px, ink-soft) → source line (14px / 500, emerald-700).

### Location card

```
aside.rounded-2xl
  background      #0B2E27 @ 5%
  border          0.57px solid #0B2E27 @10%
  border-radius   16px
  padding         20px  (16px below sm)
  box-shadow      none
```

### Get Directions button

```
background  #C9A24B   (brass-500)
color       #1A2420   (ink)
radius      16px
padding     8px 16px
font        14px / 600
border      none
```

### Sticky TOC rail

```
nav.guide-rail
  position      sticky, top: var(--header-h)
  background    #FFFFFF @ 75%  + backdrop-blur(8px)
  border-block  0.57px #0B2E27 @10%
  height        --rail-h 3.5rem
```

### Table

```
th   14px / 600, padding 12px 16px, on dark band
td   14px, padding 12px 16px
row separator  #0B2E27 @10%
```

---

## 6. Page architecture

1. **Dark emerald hero band** (`--surface-inverse` `#06231D`), full-bleed:
   breadcrumb → brass "FLAGSHIP GUIDE" pill → h1 48px light → intro paragraph.
2. **Sand body** (`#FBF8F1`) below it: cover image left, intro right, the small
   verification note, then the brass Download PDF button.
3. Sticky TOC rail, then chapters, then the locations index.

---

## ⚠ One decision needed before I apply these

This palette **conflicts with your earlier instruction**. Last round you said the
guide should use *"this site's colours and fonts… it should read as part of the
site, not as a copy of the reference site's branding."* So I built it on the
Al Harmain palette — dark charcoal `#111317` with gold `#c18a1a`.

The reference is the opposite: a **light sand page with emerald and brass**. The
two cannot both be satisfied.

**Which do you want?**

- **A — Adopt the reference palette** (what this file describes). The guide will
  match the screenshots exactly, but will look like a different site from the
  other 47 pages, which are dark.
- **B — Keep Al Harmain's dark palette, adopt everything else** — the layout,
  type scale, spacing rhythm, card recipes, eyebrow treatment, hero band, TOC
  rail. I map sand→charcoal, emerald→charcoal-surface, brass→the existing gold.
  Structurally identical to the reference, visually part of this site.

I'd suggest **B**, but it's your brand — say the word and I'll apply either.
Nothing in the guide's content or structure changes in this round either way.
