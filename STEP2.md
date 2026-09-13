# STEP 2 — colour system, and the navbar

Approved direction: **A** (one override layer, page text untouched) and **b** (keep the dark ground with gold accents, derive the neutrals from the logo's navy and silver).

## The palette — `public/polish/globals.css`

| Variable | Value | Role | Comes from |
|---|---|---|---|
| `--clr-brand` | `#183048` | deep brand colour | the logo's dominant navy |
| `--clr-brand-dark` | `#10233a` | brand hover / active | logo navy, darker |
| `--clr-brand-tint` | `#e9eef4` | the very light tint | logo navy, near white |
| `--clr-accent` | `#d4a02c` | the one accent: primary buttons, small highlights | the site's gold, one value instead of five |
| `--clr-accent-hover` | `#b8891f` | accent hover | accent, darker |
| `--clr-on-accent` | `#0c1119` | text on the accent | = page background |
| `--clr-bg` | `#0c1119` | page background | logo navy, near black |
| `--clr-surface` | `#121a26` | card surface, bands | logo navy |
| `--clr-surface-raised` | `#1a2432` | menus, inputs, accordions | logo navy |
| `--clr-border` | `#2b3747` | borders, hairlines | logo navy |
| `--clr-heading` | `#eef1f5` | heading text | the logo's silver, light |
| `--clr-text` | `#c3cad4` | body text | the same silver, one step down |
| `--clr-muted` | `#97a1af` | muted text | the same silver, two steps down |
| `--clr-success` | `#25d366` | WhatsApp green | WhatsApp brand |
| `--clr-success-hover` | `#1eb257` | its hover | |
| `--clr-on-success` | `#0c1119` | text on green | |
| `--clr-warning` | `#f08a3c` | warning | kept apart from the gold so it never reads as an accent |
| `--clr-error` | `#f06a6a` | error | |

Every variable has an `-rgb` twin for the translucent uses (photo overlays, hairlines, glows), for example `rgba(var(--clr-accent-rgb), 0.3)`.

**The rules, checked:**

- **No pure black, no pure white.** `#ffffff` became `--clr-heading` (text) or `--clr-brand-tint` (fills); `#000000` became `--clr-bg`, and shadows are navy-black.
- **Headings and body share one neutral.** Headings and body are the same silver neutral at different weights (`heading` / `text` / `muted`). They used to be `#f2f2f2`, `#e5e5e5`, `#cccccc`, `#a6a6a6` plus the chat widget's slate `#e2e8f0` / `#cbd5e1` / `#94a3b8`.
- **One gold.** `#c18a1a`, `#da9a28`, `#d4a017`, `#ffcc00` and `#ffc107` are now all `--clr-accent`.

## How the palette reaches every page

`_polish.mjs` rewrote **4,999 colour literals** into these variables. They came from:

- the two original stylesheets
- Bootstrap and Lightbox
- 2,976 inline `style=""` attributes in the page markup
- the colours injected by `ai_agent.js` and `booking_engine.js`
- the guide's `guide.css`

A colour is mapped by what it is (hue, lightness) and where it is used. The same light grey becomes `--clr-text` as a `color` and `--clr-brand-tint` as a `background`. Gold fills inside `:hover` rules become `--clr-accent-hover`.

- **The originals are untouched.** The rewritten copies live in `public/polish/` and `content-polish/`. `lib/polish.ts` has one switch, `POLISH`; set it to `false` and the approved replica comes back exactly. There is also a full snapshot in `_backup/pre-polish/`.
- **8 literals were deliberately left:** 6 are Bootstrap mask gradients (a mask's colour never shows) and 2 are the `#add` ID selector, which is not a colour.
- **29 colours inside `data:` SVG icons** (toggler bars, the select arrow, the close ×) are literal palette values, because `var()` cannot reach inside a URL.
- **Hardcoded colours in components: none left.** The JSX had none. `guide.css` now uses the variables only, and the unused `components/GuideBlocks.tsx` was removed (a copy is in the backup).

## Contrast of every palette pair (WCAG AA needs 4.5:1)

| Text | On | Ratio | Result |
|---|---|---|---|
| heading | bg / surface / raised | 16.70 / 15.43 / 13.81 | AA |
| text | bg / surface / raised | 11.46 / 10.59 / 9.48 | AA |
| muted | bg / surface / raised | 7.24 / 6.69 / 5.98 | AA |
| accent | bg / surface / raised | 7.99 / 7.38 / 6.60 | AA |
| success | bg / surface / raised | 9.54 / 8.81 / 7.89 | AA |
| warning | bg / surface / raised | 7.57 / 7.00 / 6.26 | AA |
| error | bg / surface / raised | 6.28 / 5.81 / 5.20 | AA |
| on-accent | accent / accent-hover | 7.99 / 5.98 | AA |
| on-success | success / success-hover | 9.54 / 6.81 | AA |
| heading | brand / brand-dark | 11.92 / 14.00 | AA |
| on-accent · brand | brand-tint | 16.22 · 11.57 | AA |

The three failures from AUDIT.md §7 are gone:

| Pair | Before | After |
|---|---|---|
| WhatsApp buttons: white on green | 1.98:1 | 9.54:1 (dark text) |
| FAQ question text | 4.35:1 | 6.60:1 |
| Muted text | 4.31:1 | 5.98:1 or better |

## Navbar alignment

The navbar now follows the usual web convention: logo on the container's left edge, the menu centred on the page, the call to action on the right edge, every item on one centre line, spacing on the 4px scale.

| | Before | After |
|---|---|---|
| Bar height | 77px | 72px (48px logo row + 12px top and bottom) |
| Links | hugging the logo (290–776px), then a 288px empty gap before WhatsApp centred on the page (0px off at 992–1920px), at least 26px clear of the logo; 992–1199px uses 8px link padding and a 16px brand name to fit |
| Link size | 14.72px text, padding 6.4 / 12.8px, 35px tall | 14px, padding 8 / 12px, 40px tall |
| WhatsApp button | 35.9px tall, white text 1.98:1 | 40px tall, same as the links, dark text 9.54:1 |
| Centre line | all items at y = 38 | all items at y = 36 |
| Left / right edges at 1280 | 74.5 / 1190.5 | 74.6 / 1190.6 (the container edges) |
| Current page | never marked | marked: gold `.active` + `aria-current="page"` |
| Mobile toggler | 52 × 45px | 44 × 44px, on the right container edge |
| Mobile menu rows | 35px tall | 44px touch targets, each as wide as the WhatsApp button |

### Navbar, round 2

- **The logo went missing on some pages.** It was lazy-loaded with `width: auto`, so it measured 0px until it arrived and the brand text jumped sideways. It now loads immediately (preloaded, `fetchpriority="high"`) in a fixed 48 × 48 box; the file is square (500 × 499). It measures 48 × 48 on every page at both widths.
- **Dropdown menus** use the links' type and grid: 14px text, 40px rows, 16px sides. They were 14.72px text with 9.6 / 20.8px padding.
- **One corner radius** (8px) for the link highlight and the WhatsApp button; they were 6px and 7px.

## Page heroes

The original forces the navbar to `position: fixed`, so every hero started underneath it. On most inner pages the title sat **7px** below the bar, and on the Ziyarat guide the breadcrumb was hidden behind it. The heroes also came in six different styles.

Every inner page now follows one pattern: title, then subtitle. (Breadcrumbs were added, then removed at the client's request.)

| | 1280px | 390px |
|---|---|---|
| Band starts | 64px below the navbar | 40px below the navbar |
| Title | 48px / 700, line height 1.2, centred, balanced line breaks | 30px / 700 |
| Subtitle (where the page has one) | 18px, body text, 60ch wide, 16px under the title | 16px |
| Below the last line | 64px, then a 1px border | 40px |
| Photo backgrounds | one overlay (navy-black 72% → 90%), so the text always reads | same |

- **Measured on the built site.** Every hero type hits these numbers: service, category, vehicle, `/fleet`, standalone, and the guide.
- **No breadcrumbs** on any page, including the Ziyarat guide (removed at the client's request).
- **Changed looks:**
  - the vehicle pages' 57.6px heavy all-caps title and gold subtitle;
  - the 300-weight titles on the standalone and category pages;
  - the service pages' bare title with no band.
- **The home hero is unchanged.** It is the booking hero and already sat 115px clear of the navbar.
- **The Ziyarat guide hero is centred too**, in the same order (pill, title, intro) with the same spacing and title type.
- **Centring fix, after review.** On the 14 pages whose hero text sits in the original's `.hero-content` block, that block is capped at 900px but was never centred. So the title and subtitle sat left of centre: 108px off at 1280px and 198px at 1600px. It is now centred. The text itself (not its box) was then measured on all 47 hero pages at 390, 1280, 1600 and 1920px: title and subtitle are within 2px of the page centre.

### Home hero and the Who We Are stat cards (client requests)

- **The booking box's tab bar covered its own content.** The tabs sit inside a `<nav>`, and the original CSS pins every `<nav>` in place. So the tab bar was lifted out of the layout and laid over:
  - the "Instant Fare & Ride Configurator" label;
  - the route chips;
  - all but the last word of each tab's intro line ("Arabia:", "group:").

  It is back in the flow at every width. On phones the three tabs now sit side by side, icon over label, instead of a 180px stack. Measured at 390, 768 and 1280px: the content starts directly under the tabs, no route chip is covered, and nothing scrolls sideways.
- **Intro lines removed** from all three tabs (client request).
- **The hero's select buttons go straight to WhatsApp** (+966 56 547 6113), opening in a new tab with a prefilled message:

  | Tab | Button | Message |
  |---|---|---|
  | Single Trip | Select & Configure Your Service | "Hello! I want to book a private transfer." |
  | Packages | View & Select All Packages | "Hello! I want to book an Umrah transport package." |
  | Ziyarat & Tours | Select Specialized Service | "Hello! I want to book a Ziyarat tour or a specialized service." |

  The original buttons stay hidden, so the Packages tab's two route chips still open the packages pop-up, as before (tested).
- **Who We Are stat cards:**
  - numbers are 36px / 800 (28px on phones); they were a fixed 38px / 900 that ran past the card edge on phones;
  - every card in a row is the same height;
  - number and label are centred as one block.

  At 390px all four numbers sit inside their cards and all four cards are 120px tall.

### Garbled characters (client request)

The original site's text was saved as UTF-8 and then read back as Windows-1252, so characters were shown as their bytes. For example, "–" appeared as "â€“", "’" as "â€™", "×" as "Ã—", and the vehicle-booking WhatsApp message's emoji as "ðŸš˜". `fixMojibake` in `_polish.mjs` reverses this exactly: each garbled sequence is mapped back to its bytes and decoded as UTF-8. Anything that does not decode is left alone, so real accented and Arabic/Urdu text is untouched. No wording changed.

- **What was repaired:** 14 kinds of sequence in 33 places. That is 31 pages (the 27 service pages and the 4 category pages) plus the two page scripts that build the WhatsApp booking message, which now sends 🚘 📍 🚩 📅 👥. The floating button's close icon on the category pages had been garbled two or three times over ("ÃƒÆ’Ã¢â‚¬â€"); it is "×" again. The full list is in `_polish/mojibake.json`.
- **Four page titles** carried one extra level of escaping, so the browser tab showed "Makkah to Taif Ziyarat &amp; Return". They now read "&".
- **Checked:** a scan of all 141 built pages and scripts finds no garbled sequence left. Titles, close icons and body text were also checked on the live pages.

## Interpretations to confirm

- **"A very light tint for section backgrounds."** On a dark site, a light section band would be a redesign, so the tint is used only where the original had white fills: the Facebook embed frame and Bootstrap's light surfaces. The dark section bands use `--clr-surface`.
- **The Facebook button** was Facebook blue. It is now the logo navy, because the palette has no blue.

## Verification on the built site

All 49 pages were run through the audit probe at 1280px and 390px, on the static export (`_audit/step2.mjs`, results in `_audit/step2-1280.json` and `_audit/step2-390.json`).

| Check | 1280px | 390px |
|---|---|---|
| Text elements measured against what is painted behind them | 5,257 | 4,915 |
| Below WCAG AA | **0** | **0** |
| Rendered text / background / border / gradient colours outside the palette | **0** | **0** |
| Text over photos (not judged by the probe; checked in STEP 6) | 7 | 7 |

Four things the page-wide check found, all fixed:

- **"What's Included" list** on the service pages: muted text on a gold-tinted box measured 4.18:1. It now uses body text.
- **"Book via WhatsApp"** on the home page: light text on a green background set in the same markup (1.75:1). The rewrite now gives any text on a solid gold or green fill the dark "on" colour.
- **The Facebook embed's fallback link**: silver on the light frame (1.42:1). It is now navy (11.57:1).
- **The open FAQ item**: its `color-mix()` of gold into the surface was not a palette value. It is now the raised surface under a 10% accent layer, which looks the same.

## The three new pictures

They map to the home page's Trending cards, whose current pictures are the weak ones:

| New picture | Replaces | Card |
|---|---|---|
| Airport pickup with the Al Harmain car | `/img/trending_1.jpg` (also on `/services/airport-pick-drops`) | Jeddah Airport to Makkah Hotel |
| Madinah sites collage (sharp version of the current one) | `/img/trending_madinah.jpg` (626×420 today) | Madinah Ziyarat |
| Kaaba · stone mosque split (sharp version of the current one) | `/img/trending_taif.jpg` (320×167 today) | Makkah to Taif Ziyarat & Return |

The cards crop to a near-square from the centre. On a split picture that centre is the divider, so the Ta'if card's crop now aims at the Kaaba.

**Done.** The files were found in Downloads, copied to `_incoming/` and swapped in by `node _images.mjs` under the same filenames, so no markup changed:

| Source (Downloads) | Now at | Size |
|---|---|---|
| `ChatGPT Image Sep 8, 2026, 11_41_22 PM.png` | `/img/trending_1.jpg` | 1200×800, 172 kB |
| `madinah_ziyarat_collage.png` | `/img/trending_madinah.jpg` | 1200×805, 212 kB |
| `trending_taif.png` | `/img/trending_taif.jpg` | 1200×626, 127 kB |

- The originals the site used are in `_backup/pre-images/`.
- On the running site all three load at full size, on the home page Trending cards and, for the airport picture, on `/services/airport-pick-drops`. Each one decodes to real photo pixels, and nothing opaque covers the cards; only the title gradient sits over the bottom half.
- A fourth image in Downloads (a white Al Harmain Camry on black) was not one of the three pasted, so it was left alone.
