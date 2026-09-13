# STEP 3 — typography

## The scale, defined once — `public/polish/globals.css`

| Variable | Size | 768–991px | ≤767px | ≤575px |
|---|---|---|---|---|
| `--text-xs` | 12px | | | |
| `--text-sm` | 14px | | | |
| `--text-base` | 16px | | | |
| `--text-lg` | 18px | | | |
| `--text-xl` | 20px | | | |
| `--text-2xl` | 24px | | | |
| `--text-3xl` | 30px | | 24px | 24px |
| `--text-4xl` | 36px | | 30px | 24px |
| `--text-5xl` | 48px | 36px | 30px | 30px |

The three largest steps shrink on smaller screens, to other steps of the same scale, so text is on the scale at every width.

**Headings** share one family (Poppins), one weight (700) and one line height (1.2), with one size per level:

| | Desktop | ≤991px | ≤767px | ≤575px |
|---|---|---|---|---|
| h1 | 48 | 36 | 30 | 30 |
| h2 | 36 | 36 | 30 | 24 |
| h3 | 24 | 24 | 24 | 20 |
| h4 | 20 | | | |
| h5 | 18 | | | |
| h6 | 16 | | | |

**Body text:**
- Weight 400, line height 1.6 (paragraphs, list items, definitions, quotes, captions, table cells).
- Lines capped at `70ch`. A centred paragraph stays centred once capped.
- Emphasis and interface text use 500 (navigation) and 600 (buttons, labels, `<strong>`).

**Uppercase labels:** one letter-spacing, `0.08em`.

## How it reaches every page

`_polish.mjs` rewrites every font size the site writes onto the scale. The same build step already handles the colours, and the original files stay untouched. That covers:
- the original stylesheets and Bootstrap;
- the inline styles in the page markup;
- the scripts' injected styles;
- the guide's `guide.css`.

In total, **1,345 font sizes** were rewritten:
- `px` and `rem` values go to the nearest step, rounding up on a tie. For example, 14.72 → 14, 15 → 16, 17.6 → 18, 28 → 30, 44.8 → 48.
- `clamp()` takes its largest value; the responsive steps handle smaller screens.
- Bootstrap's fluid `calc(… + vw)` sizes are measured at 1280px.
- Small `em` sizes (`.875em`) are converted too; `1em` stays relative.

The full list is in `_polish/type.json`.

- **55 weights changed:** 800 / 900 / `bold` → 700, 300 / `lighter` → 400.
- **152 uppercase rules** now share `--ls-caps`.

## Verification on the built site

All 49 pages were audited at 1280px and 390px (`_audit/step3.mjs`, results in `_audit/step3-1280.json` / `step3-390.json`). The "before" column is from AUDIT.md.

| Check | Before (AUDIT.md) | 1280px | 390px |
|---|---|---|---|
| Text elements measured | 5,369 | 5,338 | 4,995 |
| Distinct font sizes rendered | 37 | 9 steps | 9 steps |
| Text off the scale | 3,100+ | **0** | **0** |
| Weights | 7 (300–900) | 4: 400 / 500 / 600 / 700 | same |
| Heading line height | mixed | **1.2** on all 811 | same |
| Body line height | 58 values overall | **1.6** on all 1,836 | same |
| Letter-spacing on uppercase | 7 values | **0.08em** on all 392 labels | same |
| Paragraphs over ~70 characters a line | not measured | **0** | **0** |
| Centred paragraphs off-centre once capped | — | **0** | **0** |
| Contrast (from STEP 2) | — | 0 failures, 0 colours outside the palette | same |

Two paragraphs set their own inline max-width wider than the measure: 920px on the home page (92 characters a line) and 750px on Who We Are. They are capped too. The narrower inline caps (560–600px) were already inside the measure and are unchanged.

## What you will notice

- **Headings are sized by level.** The home page's section titles were 40–44.8px; as h2 they are now 36. Vehicle titles were 57.6px and are now 48. Card titles (h4) go from 24 to 20. Footer headings (h5) go from 16 to 18. The home hero title was a one-off 36.8px and is now 48px, like every page title.
- **Much calmer phones.** Titles step down by level instead of shrinking arbitrarily. "Premium Pilgrim Transportation Services" on Who We Are was four lines at 44px; it is now two lines at 24px. The stat numbers use the same steps (36 / 30 / 24).
- **No more 800 / 900 weights.** Headings and big numbers are 700.

## Deliberate exceptions and interpretations

- **The "TRANSPORT" wordmark** in the navbar keeps its wide 2px tracking. It is part of the logo lockup, not a label. It is the only uppercase text not at `0.08em`, and it appears once per page (the 49 in the audit).
- **One font family.** The brief says headings share one family and weight pattern, "body another". The site uses Poppins throughout, so I read "another" as its own weight pattern (headings 700, body 400), not a second typeface; adding a second typeface would be a redesign. If you want a separate body face, name one and I'll add it.
- **Buttons, navigation links and badges** keep line heights that set their fixed control heights (for example, 40px navigation links). They are interface controls, not body text, so they are outside the 1.6 rule.
- **Arabic text** falls back to the system font, because Poppins has no Arabic letters. This was already true; a dedicated Arabic face would be a STEP 5 detail.
