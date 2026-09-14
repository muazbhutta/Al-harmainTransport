# Pre-launch pass — SEO, performance, and what still needs a decision

Measured on the built site (`out/`), 72 pages, and on the running site at every
width. Numbers are before → after.

---

## 1. SEO

### The big one: every page had the same description

All 46 replicated pages shipped one identical 247-character description — the
same sentence for the Toyota Camry, the refund policy and every route. Google
discards duplicate descriptions and writes its own snippet, so every page was
throwing its search snippet away.

Each page now describes itself, in its own words: `seoMeta()` in `_polish.mjs`
takes the page's own opening paragraph, skips anything that also appears in the
shared header or footer, and trims it to a whole word inside 158 characters.
Nothing is invented. Two pages carry no prose at all (`/book-now` is a filter
list, `/customer-faqs` is all accordions) and get a description written from
their own section headings.

| | before | after |
|---|---|---|
| duplicate descriptions | 46 pages sharing 1 | **0** |
| duplicate titles | 0 | 0 |
| descriptions over 160 chars | 55 | 3 |
| titles under 25 chars | 13 | 0 |

Titles were bare — "Toyota Camry", "Who We Are" — with no brand. They now read
`Toyota Camry | AL HARMAIN UMRAH TRANSPORT`, dropping to the short form of the
name when the full one would overrun a search result. `/book-now` was titled
"Book Transport | MCOM" — MCOM is the template the original was built from.

### Tags that were missing everywhere

Only the 11 guide pages (hand-built) had these. The other 60 had none.

| tag | before | after |
|---|---|---|
| canonical | 11 | **70 of 72** |
| Open Graph (title, description, image, url, type, locale) | 11 | **59** |
| Twitter card | 11 | **59** |

The two without a canonical are `/404` and `/ziyarat-guide` (a redirect stub).
The 13 without Open Graph are those two plus the 11 print editions, which are
`noindex` by design.

This matters more than usual here: most of this company's guests arrive by a
WhatsApp share, and without Open Graph a shared link unfurls as a bare grey box.

### Structured data

| schema | pages | source |
|---|---|---|
| LocalBusiness | 71 | footer facts only — no licence number, rating or price range, because the site publishes none |
| BreadcrumbList | 46 | the route's own segments |
| Article | 11 | guide pages |
| FAQPage | 1 | the FAQ page's own 9 visible Q&As |
| ContactPage | 1 | new contact page |

FAQ markup is lifted from the visible accordion text, so the structured data and
the page cannot disagree — which is what Google requires and what gets sites
penalised when done any other way.

### Other fixes

- `/book-now` had **no `<h1>`** — its heading was an `<h3>`. Promoted, with the
  `h3` class so it stays exactly the size it was.
- Guide descriptions were cut at 300 characters mid-word; now trimmed to a word
  inside 158.
- Sitemap was missing **all 11 Ziyarat guide pages** — the flagship content.
  48 → 59 entries. Print editions stay out, as they are `noindex`.
- `robots.txt` and `sitemap.xml` verified served and correct.

---

## 2. Broken links

Crawled all 1,834 internal links across 72 pages.

| target | linked from | fix |
|---|---|---|
| `/contact` | **57 pages** (footer "Contact Us") | page built — see below |
| `/checkout` | 29 pages (cart drawer) | was a dead href no script handled; now goes to WhatsApp, where every booking here is actually completed |
| `post.php?slug=…` | 3 blog "Read More" links | the articles were never exported; each now points at the Ziyarat guide chapter on that exact subject (Makkah, Madinah, Taif) |

**Broken internal links: 3 → 0.**

### The new `/contact` page

Footers on 57 pages had pointed at a 404 since the export. Every detail on the
new page is one the site already publishes — the two numbers and the address
from the footer, the hours from the chat agent. There is no street address, no
office photograph and no contact form, because the site publishes no address and
a static site has no backend to post a form to. The form a visitor actually
wants is WhatsApp.

---

## 3. Performance

Measured on the home page. **Caveat:** the local test server sends no gzip, so
the CSS and JS figures below are raw. On a host with compression they drop by
roughly 70%.

| | before | after |
|---|---|---|
| total page weight | 1,977 kB | **1,417 kB** |
| images | 479 kB | **190 kB** |
| fonts | 283 kB | **12 kB** |
| requests | 36 | 32 |
| load event | 967 ms | **486 ms** |

### Images

`LOGO.png` was **238 kB at 500×500 — to draw a 40px logo**, and preloaded at
high priority on every page. `favicon.png` was **266 kB**. `madinah.jpg` was
274 kB at 474×284.

`_images.mjs` re-encodes every image at the size it is actually displayed
(with room for a dense screen) and strips camera metadata. Originals remain in
git, so it is reversible with a checkout.

| file | before | after |
|---|---|---|
| favicon.png | 266 kB | **13 kB** |
| LOGO.png | 237 kB | **20 kB** |
| madinah.jpg | 274 kB | **38 kB** |
| all images | 13.7 MB | 10.2 MB |

### Layout shift

**46 of 47 images on the home page had no `width`/`height`**, so every one of
them resized the page as it loaded — the shift Core Web Vitals measures.
`addImageDims()` stamps each local image with its true intrinsic size, measured
at build time. An attribute matching the natural size cannot change how an image
renders; it only lets the browser hold the space. All 18 local images on the
home page now carry both.

### Icon fonts

The stylesheet had been subset to 21 kB, but the fonts still shipped every
glyph: 147 kB of `fa-solid-900` and 106 kB of `fa-brands-400` on every page, for
about eighty icons. `_subset-woff.mjs` cuts them to the codepoints the subset
stylesheet still references, so a glyph survives exactly when a rule that can
draw it survives.

| font | before | after |
|---|---|---|
| fa-solid-900 | 147 kB | **8 kB** |
| fa-brands-400 | 105 kB | **3 kB** |
| fa-regular-400 | 24 kB | **2 kB** |

Verified across the home, fleet, who-we-are, guide and FAQ pages: 143 icons,
43 distinct, **0 failed to render**. Untouched originals kept as `*.full.woff2`.

### Icons and manifest

Added `apple-touch-icon` at 180×180, `site.webmanifest`, and a `theme-color`
so the phone address bar matches the page instead of flashing white.

---

## 4. Things I did not change — your call

**1. Fourteen Unsplash stock photos are hotlinked as customer testimonial
avatars**, and the Google logo is hotlinked from Wikimedia (14 times). Two
problems: they are third-party requests on every page load that leak your
visitors' IPs and break if those hosts change anything, and they present stock
photographs as photographs of your customers. Replacing them with initials
avatars would be quick, self-hosted, and honest. **This is the one I would fix
before launch.**

**2. `connect.facebook.net`** loads on every page — the original's social embed
and the only remaining third-party script.

**3. Gallery thumbnails load full-size images.** The fleet gallery draws 26
photos at about 235px wide but downloads the full 1024–1600px file for each.
Proper thumbnails with `srcset` would cut the gallery page substantially. I left
it because it changes markup across the gallery and wanted your go-ahead.

**4. Enable gzip or brotli on the host.** The single biggest remaining win:
about 1.2 MB of the 1.4 MB page is CSS and JS, which compresses by roughly 70%.
Nothing in the code can do this — it is a host setting.

**5. Three titles still run slightly over 60 characters** because the service
names themselves are long (for example "3-in-1 Kiswa Factory / Makkah Museum /
Sulah Hudaibiyah"). Shortening means renaming the service, which is your
decision, not mine. The distinctive part comes first, so Google truncates only
the brand.

**6. The chat agent lists `info@ALHARMAINTRANSPORT.com`**, while the footer and
the rest of the site use `alharmaintransportksa@gmail.com` (94 places against 1).
If that first address does not receive mail, enquiries sent to it are being lost.

**7. `/blog` has three teaser cards and no articles.** The posts were never part
of the export. The cards now link to the matching guide chapters, which is
honest and useful, but if you want a real blog those three articles need writing.

---

## How to re-run these checks

```bash
node _images.mjs        # re-compress any newly added images
node _subset-fa.mjs     # cut the Font Awesome stylesheet to what is used
node _subset-woff.mjs   # then cut the webfonts to match
node _polish.mjs        # rebuild page content, metadata and image dimensions
npx next build          # produce out/
```
