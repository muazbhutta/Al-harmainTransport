# PHASE 2 — Ziyarat guide PDF download

## Diagnosis — why "Download PDF" did not work

| Check | Finding |
|---|---|
| Does a PDF exist in `/public`? | **No.** No guide PDF anywhere in the project; the only PDFs are the original site's 26 service brochures. |
| Path and filename case | Nothing to match. Both links pointed at **`/ziyarat-guide/print`**, a page that was never built: the guide's route only accepts language codes, so "print" is a 404. |
| Per language? | **No.** All 11 languages linked to the same `/ziyarat-guide/print`. |
| `download` attribute / `type` | **Neither**, on both the "Download PDF" button and the cover image link (`app/ziyarat-guide/[lang]/page.tsx`). |
| Network | Clicking requested `GET /ziyarat-guide/print` → **404** `text/html` (a 12-byte "404" page). |
| Console | No script error; it is a plain broken link. |

## The fix

**One PDF per language, made from that language's own guide data:**

- **The print edition.** `app/ziyarat-guide/[lang]/print/page.tsx` renders the whole guide from the same data as `/ziyarat-guide/<lang>`:
  - a cover: title, subtitle, cover image, intro, site address and WhatsApp;
  - a contents page;
  - every chapter, starting on a new page, with its scripture cards, lists, steps, tables, callouts and location cards;
  - the all-locations index and the sources note.

  It has no site navigation and no scripts. It is laid out for A4 by `app/guide-print.css`: dark ink on paper, page numbers ("3 / 35"), and nothing split across a page break. It is marked `noindex`, with the guide page as its canonical, so search engines ignore it.
- **The PDFs.** `_pdf.mjs` prints each language's print edition to **`public/downloads/ziyarat-guide-<lang>.pdf`** with the machine's own Chrome (headless, a fresh throwaway profile each run, no extra packages). It checks each file:
  - it refuses to print a page that is not in the requested language (`lang="<code>"`), so nothing falls back to English;
  - a missing PDF is generated; an existing one is kept unless run with `--force`;
  - every output is checked to be a real PDF.
- **Fonts per script**, embedded in each PDF:

  | Script | Languages | Font |
  |---|---|---|
  | Urdu | Urdu | Urdu Typesetting |
  | Arabic script | Arabic, Farsi | Segoe UI / Tahoma |
  | Devanagari, Bengali | Hindi, Bengali | Nirmala UI |
  | Latin | English, Roman Urdu, Indonesian, Malay, Turkish, French | Poppins (including Turkish ş ğ ı) |

  All 11 use Traditional Arabic for the Qur'anic and hadith text.

**The links**, on both the button and the cover image:

```html
<a href="/downloads/ziyarat-guide-ur.pdf" download="ziyarat-guide-ur.pdf" type="application/pdf">
```

- **Same-origin, with `download`:** the browser saves the file under that name.
- **No `target="_blank"`:** no blank tab is opened.
- **Mobile Safari (iOS 13+) and Chrome on Android** both honour `download` for same-origin files. If a browser ignores it, the PDF opens in the same tab, never a blank one.

**Content-Type and download filename.** A static export cannot set response headers itself, so the host must:

| Host | File | Headers |
|---|---|---|
| Apache / LiteSpeed (e.g. Hostinger) | `public/.htaccess` (copied into `out/`) | `AddType application/pdf .pdf`; `Content-Disposition: attachment` for `ziyarat-guide-*.pdf` |
| Netlify / Cloudflare Pages | `public/_headers` | `Content-Type: application/pdf` and `Content-Disposition: attachment` for `/downloads/*.pdf` |
| The local server (`_audit/serve.mjs`) | built in | `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="ziyarat-guide-<lang>.pdf"` |

## Which PDFs had to be generated

**All 11.** None existed. Each was generated from its own language's data.

| Language | File | Pages | Size |
|---|---|---|---|
| English | `ziyarat-guide-en.pdf` | 35 | 697 kB |
| اردو (Urdu) | `ziyarat-guide-ur.pdf` | 36 | 907 kB |
| Roman Urdu | `ziyarat-guide-ur-Latn.pdf` | 35 | 690 kB |
| العربية (Arabic) | `ziyarat-guide-ar.pdf` | 33 | 761 kB |
| فارسی (Farsi) | `ziyarat-guide-fa.pdf` | 34 | 778 kB |
| हिन्दी (Hindi) | `ziyarat-guide-hi.pdf` | 35 | 788 kB |
| বাংলা (Bengali) | `ziyarat-guide-bn.pdf` | 35 | 804 kB |
| Bahasa Indonesia | `ziyarat-guide-id.pdf` | 35 | 696 kB |
| Bahasa Melayu | `ziyarat-guide-ms.pdf` | 36 | 697 kB |
| Türkçe | `ziyarat-guide-tr.pdf` | 35 | 707 kB |
| Français | `ziyarat-guide-fr.pdf` | 35 | 697 kB |

**None is large** (all under 1 MB). The only picture is the cover. It was compressed for print anyway: `kaaba_hero-print.jpg`, 1000 px, 108 kB, from the 229 kB original. The rest of each file is text and the embedded font subsets.

## Verification

- **Every language page:** both links point at that language's own PDF, with `download="ziyarat-guide-<lang>.pdf"`, `type="application/pdf"` and no `target`. Checked on all 11.
- **Every PDF over HTTP:** `200`, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="ziyarat-guide-<lang>.pdf"`, and the file starts `%PDF-`.
- **In its own language:** the text of every page of every PDF was extracted. Urdu has 14,734 Arabic-script characters; Arabic 6,439; Farsi 7,541; Hindi 16,079 in Devanagari; Bengali 17,695 in Bengali script. Every English-alphabet edition contains its own chapter titles, for example "Bölüm 1 · Mekke-i Mükerreme - Giriş" and "Chapitre 1 · La Mecque (Makkah)". The ~1,600 Arabic characters in the Latin editions are the Qur'anic and hadith quotations.
- **Printed on white:** cover, contents, two chapter pages and the last page of every PDF were rendered and measured. Text pages are 94–100% light; the covers are about 67% light, because of the photograph.
- **By eye:** pages were rendered and looked at:
  - English cover and a chapter page;
  - Urdu cover and a chapter page, right to left, with the notice box;
  - Arabic, Hindi and Bengali chapter pages, fully voweled Qur'anic text, correct Devanagari and Bengali (including Bengali numerals);
  - the Turkish contents page.

## Found along the way, fixed

- **Dark background printed.** The first PDFs came out with the site's dark page background printed behind the dark text: unreadable. The print edition now clears every background.
- **Stale Chrome lock.** An interrupted Chrome run left a profile lock that blocked the next run (Chrome exit code 21). `_pdf.mjs` now uses a fresh temporary profile each time.
- **Phone number wrapping.** The cover's WhatsApp number broke across two lines; it now stays on one.

## Your call

- **The draft notice.** The guide's own language files mark the ten translations as a *"machine-assisted draft, pending scholar review"* (`guide.machineNotice`), but the website never shows it. I printed it, in the reader's language, in a box on the cover of the ten translated PDFs, because a PDF travels without the website around it. Tell me if you would rather it not appear. Separately, it is worth deciding whether the web guide should show it too.
- **Contents heading.** The contents page heading reuses the guide's existing "On this page" label (e.g. "Bu sayfada") because the language files have no "Contents" string. It reads fine; a dedicated label would need translating into 10 languages.
- **Rebuilding the PDFs.** After any change to the guide text, run `npm run build`, start the server (`node _audit/serve.mjs 3100`), then `node _pdf.mjs --force`.
