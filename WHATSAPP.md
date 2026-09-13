# WHATSAPP.md — every WhatsApp button

## After Phase 1 (done)

**Your decisions, applied:**

| Question | Decision |
|---|---|
| Page link domain | `https://alharmainumrahtransport.com` |
| /fleet "Secondary" button | same number, through the helper |
| Booking pop-up price line | kept |
| Gallery photos that aren't a bookable model | the caption is used |
| Unreachable category-page vehicle pop-up | left unreachable; its message now also goes through the helper |

**One helper: `lib/whatsapp.mjs` → `waLink({ type, name, extra, url })`.** Every WhatsApp button on the site gets its link from it:

- **Page markup** (`_polish.mjs`, at build time): every link in the page markup, header, footer and floating button, 504 in all. Each gets a `data-wa="<type>"` marker. The type and name come from where the button sits: the page, its label, its card.
- **Guide pages** (`components/SiteChrome.tsx`, at render): the header, footer and floating buttons get the page link of each guide language.
- **Scripts** (in the browser): `public/polish/wa.js` is generated from the same file, and loaded first. The booking pop-up (`booking_engine.js`), the chat widget (`ai_agent.js`) and the vehicle pop-up (the two page scripts) call `window.waLink()`. Their patches must apply, or the build stops.
- **Vehicle pages:** **Book This Vehicle** (was `/book-now`) now books that vehicle on WhatsApp, with its seat and luggage capacity from `data/vehicles.ts`.

**What changed in the messages:**

- **Tone:** every message starts with *Assalamu Alaikum*, is in English, and ends with the page viewed.
- **Blank chats:** the 223 buttons that sent nothing now send a general enquiry.
- **Service pages:** all three buttons name the service. The old `alharmainumrah.com/service.php` links are gone.
- **Packages:** they send their legs, with city names spelled out.
- **Routes:** they keep the label's "from … to …", including "Airport".
- **Booking pop-up:** it sends everything the visitor selected (trip type, route, vehicle, price, date and time, pickup, drop-off, flight, passengers, name) plus the page.

**Verified:**

| Check | Result |
|---|---|
| Built site (`node _audit/wa-verify.mjs`): WhatsApp links on 58 pages | **538**, all written by the helper, greeting ✓, own page link ✓ |
| Loaded scripts holding a hand-written `wa.me` link | **0** (only the generated helper) |
| Our source files containing `wa.me` | only `lib/whatsapp.mjs` |
| Click-through on the running site (`node _audit/wa-clicks-check.mjs`) | **546 buttons clicked, 0 failed** |

The 546 are every link on all 58 pages, plus the booking pop-up, the six chat-widget replies and the vehicle pop-up. The full list is in **[WHATSAPP-VERIFIED.md](WHATSAPP-VERIFIED.md)**: 166 distinct button-and-message combinations, each with the pages it appears on.

**Sample messages, as captured from the running site:**

- **Book This Vehicle** (`/fleet/coaster`): *Assalamu Alaikum, I would like to book the Coaster / Minibus (up to 20 passengers, 25 large bags).* Page: https://alharmainumrahtransport.com/fleet/coaster
- **Configure & Book** (`/services/jeddah-airport-to-makkah-hotel`): *Assalamu Alaikum, I would like to book Jeddah Airport to Makkah Hotel.* Page: …/services/jeddah-airport-to-makkah-hotel
- **Book Package 1** (home): *Assalamu Alaikum, I would like to book Package 1: Jeddah Airport to Makkah Hotel → Makkah Hotel to Madinah Hotel → Madinah Hotel to Jeddah Airport.* Page: …/
- **Route link "Jeddah Airport to Makkah"** (home): *Assalamu Alaikum, I would like to book a transfer from Jeddah Airport to Makkah.* Page: …/
- **Gallery "Book via WhatsApp"** (`/fleet`): *Assalamu Alaikum, I would like to book the Toyota Camry 2025 Luxury Sedan.* Page: …/fleet
- **Header WhatsApp** (every page): *Assalamu Alaikum, I would like to ask about your Umrah transport services.* Page: {that page}
- **Booking pop-up** (home, Jeddah Airport → Makkah Hotel, GMC, filled in): *Assalamu Alaikum, I would like to book: Trip: Airport Pick & Drops · Route: Jeddah Airport to Makkah Hotel · Vehicle: GMC XL Yukon (7 Pax) · Price: 420 SAR · Date: 2026-10-02 10:00 · Pickup: Jeddah Airport North Terminal · Drop-off: Hilton Makkah · Flight: SV 123 · Passengers: 5 · Name: Test Guest* · Page: …/ (one line per field in WhatsApp)

**Notes:**

- **Replica originals still contain the old links.** The untouched replica files kept for switching the polish off (`POLISH = false`: `public/assets/js/*`, `public/page-js/*`, `content/*.json`) still hold the original hand-written links. The site does not load them while the polish is on.
- **Chat-widget button labels:** the one on the Urdu reply still reads "WhatsApp Par Baat Karein". Only its message changed to English; the label is page content.
- **`/book-now` is still empty**, as noted below. It's Phase 4.

---

## Before Phase 1 — the inventory

This is the inventory as it was before any change.

**How this was found:**
- every page's markup (`content-polish/*.json`, which is what the site renders);
- the shared header, footer and floating buttons (`content/_chrome.json`, used by the 11 guide pages);
- every script that builds a WhatsApp link when clicked;
- our own code;
- a check of what actually happens on click where a script intercepts the button.

"Pages" counts the pages a button appears on. Every link goes to **+966 56 547 6113** (`wa.me/966565476113`).

## Summary

| | |
|---|---|
| Distinct WhatsApp buttons in the page markup | **101** |
| …rendered, counting repeats across pages (plus 44 on the 11 guide pages) | **≈ 440** |
| Buttons that open WhatsApp with **no message at all** | **223** in markup, plus all 44 on the guide pages |
| Script-built messages (booking pop-up, chat widget, vehicle pop-up) | 3 builders + 6 chat-widget links |
| Messages that mention the page the visitor was on | **27**, and all 27 give the wrong address |
| Messages that start with "Assalamu Alaikum" | 0 |
| Hand-written `wa.me` strings | in ~100 markup patterns, 3 scripts and `_polish.mjs` |

## Inventory

### A. On every page: header, footer, floating button

The markup is in each page's `content/<page>.json` (replicated from the original) and in `content/_chrome.json` (the guide pages).

| Button | Where | Pages | Message now |
|---|---|---|---|
| **WhatsApp** (green, header) | navbar | 47 + 11 guide | *(none)* |
| **+966 56 547 6113** | footer "Get in Touch" | 47 + 11 | *(none)* |
| WhatsApp icon | footer "Get in Touch" | 47 + 11 | *(none)* |
| WhatsApp icon | floating button (bottom right) | 47 + 11 | *(none)* |

### B. Service detail pages (27) — `content/service_*.json`

| Button | Pages | Message now |
|---|---|---|
| **Configure & Book** (above "Service Details") | 27 | "Hello! I want to configure and book this service" — **does not name the service** |
| **Configure & Book Now** (sidebar) | 27 | same generic text |
| **Inquire on WhatsApp** (sidebar) | 27 | "Hello, I would like to inquire about the service: 'Jeddah Airport to Makkah Hotel'. Found on your website: `https://alharmainumrah.com/service.php?id=2`" — names the service, but **the link is the old PHP page on another domain** |
| WhatsApp icon (next to "Main Office Number") | 27 + 4 category | *(none)* |
| **AI Agent WhatsApp** | 27 + 4 category | "Hello! I need assistance from AI Agent" |

### C. Category pages (4) — `/services/airport-pick-drops`, `inter-city`, `local-transfers`, `ziyarat-tours`

- **Visible buttons:** the "Main Office Number" icon and "AI Agent WhatsApp" buttons from B.
- **Vehicle pop-up (unreachable):** a page script (`page-js/s-7c443d69af0d.js`, and `s-3deba3ac234e.js` on Ziyarat Tours) builds "Hello AL HARMAIN UMRAH TRANSPORT! I want to book a vehicle: 🚘 Vehicle… 📍 Pickup… 🚩 Drop-off… 📅 Date… 👥 Passengers…". It only ever reaches visitors through a vehicle pop-up, and that pop-up is wired to links containing `all-fleet.html#`. The replica's links now go to `/fleet/<vehicle>`, so the pop-up never opens and this message is never sent.

### D. Vehicle pages (6) — `/fleet/toyota-camry` … `/fleet/coaster`

| Button | Message now |
|---|---|
| **Book This Vehicle** | **not WhatsApp at all.** It goes to `/book-now`, which is an empty page (see Problems) |
| Header / footer / floating | *(none)*, as in A |

### E. All Vehicles `/fleet` — `content/all-fleet.json`

| Button | Count | Message now |
|---|---|---|
| **WhatsApp: +966 56 547 6113** (hero) | 1 | *(none)* |
| **Secondary: +966 56 547 6113** (hero) | 1 | *(none)* — **same number as the first button** |
| **Book via WhatsApp** (one per gallery photo) | 25 | "Hello! I want to book {photo caption}", e.g. "Toyota Camry 2025 Luxury Sedan", "GMC Yukon XL Royal Black Edition". Some captions are not real models: "AL HARMAIN Luxury Fleet Final Showcase", and "Ford Taurus Luxury VIP Sedan", which is not in the fleet data |
| **+966 56 547 6113** ("Contact Support") | 1 | *(none)* |

### F. Home page — `content/index.json`

| Button | Count | Message now |
|---|---|---|
| **Select & Configure Your Service** (hero, Single Trip) | 1 | "Hello! I want to book a private transfer." (added last round) |
| **View & Select All Packages** (hero, Packages) | 1 | "Hello! I want to book an Umrah transport package." (added last round) |
| **Select Specialized Service** (hero, Ziyarat & Tours) | 1 | "Hello! I want to book a Ziyarat tour or a specialized service." (added last round) |
| Hero route chips (e.g. "Jeddah Airport to Makkah") and Trending cards | 7 | open the **booking pop-up** (`booking_engine.js`). Its "Book via WhatsApp" sends a long summary: `*NEW UMRAH TRANSPORT BOOKING*` · Service · Vehicle · Total Price · Date & Time · Pickup · Drop-off · Flight · Passengers · Customer Name. It has **no page link** |
| **Popular Umrah Taxi Routes** links, e.g. "Jeddah Airport to Makkah", "Madinah Airport to Hotel", "Badr Ziyarat Taxi", "Masjid Ayesha Miqat" | 13 | "Hello! I want to book a Taxi From Jeddah to Makkah". The wording drops "Airport" (the label says Jeddah **Airport** to Makkah); Ziyarat links say "For Makkah Ziyarat" |
| **Book Package 1 … 7** | 7 | "Hello! I want to book Package 1" — **no legs**, although each card lists them (Package 1: Jeddah Airport → Makkah Hotel → Madinah Hotel → Jeddah Airport) |
| **Contact on WhatsApp** (Asif Ahmad, MD / Owner) | 1 | "Hello! I want to contact Asif Ahmad MD Owner" |
| **Inquire on WhatsApp** (Madinah Head Office) | 1 | "Hello! I want to inquire about Madinah Head Office services" |
| **Book on WhatsApp** (Makkah Branch Office) | 1 | "Hello! I want to inquire about Makkah Branch Office services" |
| **Book on WhatsApp** ×3 (VIP Airport & Hotel Transfer, Best Taxi Service in KSA, Premium Sacred Journey) | 3 | "Hello! I want to book Airport and Hotel Transfer" / "…Best Taxi in KSA" / "…Sacred Journey Transport" |
| **Book via WhatsApp** ("Book Your Umrah Journey Today!") | 1 | "Hello! I want to book an Umrah Taxi" |

### G. Who We Are — `content/who-we-are.json`

| Button | Count | Message now |
|---|---|---|
| **Book Camry / Sonata / GMC Yukon / Staria / Hiace / Coaster / VIP Bus** | 7 | "Hello! I want to book Toyota Camry" etc. No capacity, no page link |
| **B2B Partner Inquiry on WhatsApp** | 1 | "Hello! I am a Travel Agent and want B2B Transport Rates" |

### H. Chat widget — `public/assets/js/ai_agent.js` (15 pages)

| Link in a bot reply | Message now |
|---|---|
| Book (general) | "Hello! I want to book transport service." |
| Makkah → Madinah | "I want to book Makkah to Madinah transport" |
| Book Airport Pickup | "I need Jeddah Airport Pickup" |
| Book Ziyarat Tour | "I want to book a Ziyarat Tour" |
| Open WhatsApp Chat | *(none)* |
| Urdu reply | "Salam! Mujhe transport booking ki details chahiye" (Roman Urdu) |

### I. Scripts and our own code

| File | What it does |
|---|---|
| `public/assets/js/booking_engine.js:537–571` | `sendWhatsAppBooking()`: the home page's booking pop-up message (F) |
| `public/assets/js/booking_engine.js:669–676` | Fallback for `.service-page-direct-book` **buttons**. It never fires: those are links, and the engine only loads on the home page |
| `public/page-js/s-7c443d69af0d.js`, `s-3deba3ac234e.js` | The category pages' unreachable vehicle pop-up message (C) |
| `_polish.mjs` `HERO_WHATSAPP` | The three hero buttons (F), hand-written `wa.me` URLs |

## Problems found

1. **Book This Vehicle** on all 6 vehicle pages goes to `/book-now`, not WhatsApp. `/book-now` is a service browser whose filtering script was one of the original site's missing (404) files, so it shows a heading, an empty filter bar and nothing else.
2. **223 buttons open WhatsApp with no message at all** (header, footer, floating, office icons): the driver gets a blank chat with no context. All 44 buttons on the guide pages are the same.
3. **All 27 service enquiries link to `alharmainumrah.com/service.php?id=N`**, a different domain and the old PHP URLs. The new site's pages are `/services/<slug>`.
4. **Service "Configure & Book" (×54) does not name the service.**
5. **Packages send only "Package N"**, without the legs printed on the card.
6. **Route links drop "Airport"** ("From Jeddah to Makkah" for "Jeddah **Airport** to Makkah").
7. **The /fleet "Secondary" button** goes to the same number as the primary one.
8. **The category pages' vehicle pop-up and its message are dead code** (the links it looks for were renamed).
9. **Tone varies.** Messages use "Hello!", "Hello,", "Salam!" (in Roman Urdu), "*NEW UMRAH TRANSPORT BOOKING*"; none uses "Assalamu Alaikum", and only the broken service link says which page was viewed.
10. **The home booking pop-up** sends a price ("Total Price: … SAR") that the driver must honour; it has no page link.

## Proposed fix (for your approval)

**One helper, one file: `lib/whatsapp.mjs`.** It is plain JavaScript, so the same function is used by:

- **the build step** (`_polish.mjs`), which rewrites the `href` of every WhatsApp link in the page markup, header, footer and floating button;
- **the Next.js pages** (the guide's chrome);
- **the browser**, as `window.waLink`, loaded before the site's own scripts. `booking_engine.js`, `ai_agent.js` and the page scripts (their polished copies) call it instead of building `wa.me` strings.

```js
waLink({ type, name, extra, url }) // → https://wa.me/966565476113?text=<encodeURIComponent(message)>
```

**The check:** after the build, a search of the built site for `wa.me` must find it only inside the helper.

**Messages.** Each one is short, polite, in English, starts with *Assalamu Alaikum* and ends with the page link:

| `type` | Used by | Example |
|---|---|---|
| `general` | header, footer, floating, office / contact icons, chat "Open WhatsApp Chat" | Assalamu Alaikum, I would like to ask about your Umrah transport services. Page: {url} |
| `vehicle` | vehicle page **Book This Vehicle** | Assalamu Alaikum, I would like to book the Toyota Camry (up to 3 passengers, 2 large bags). Page: {url} |
| `fleet` | /fleet gallery cards, Who We Are "Book Camry…" | Assalamu Alaikum, I would like to book the GMC Yukon XL Royal Black Edition. Page: {url} |
| `service` | service pages (all 3 buttons), home service cards, hero Ziyarat button | Assalamu Alaikum, I would like to book Jeddah Airport to Makkah Hotel. Page: {url} |
| `route` | Popular Routes links, chat-widget route links | Assalamu Alaikum, I would like to book a transfer from Jeddah Airport to Makkah. Page: {url} |
| `package` | Book Package 1–7, hero Packages button | Assalamu Alaikum, I would like to book Package 1: Jeddah Airport → Makkah Hotel → Madinah Hotel → Jeddah Airport. Page: {url} |
| `booking` | home booking pop-up, hero Single Trip button | Assalamu Alaikum, I would like to book: Single Trip · Jeddah Airport to Makkah Hotel · GMC Yukon XL · 5 passengers · 2026-10-02 10:00. Page: {url} |
| `b2b` | Who We Are B2B button | Assalamu Alaikum, I am a travel agent and would like your B2B transport rates. Page: {url} |

- **Vehicle capacities** come from `data/vehicles.ts`: Camry 3 / 2, Sonata 3 / 2, Staria 7 / 7, GMC Yukon XL 7 / 8, Hiace 11 / 14, Coaster 20 / 25 (passengers / large bags).
- **Route from/to** come from the link label.
- **Package legs** come from the card itself.
- **Booking-pop-up details** come from what the visitor selected: trip type, route, vehicle, passengers, date and time, plus pickup and drop-off and the flight number when entered.

**Test.** I will click every WhatsApp button on the running site with navigation blocked, record the exact pre-filled text of each, and list them.

## Decisions needed before I write code

1. **Which domain goes in the page link?** The sitemap uses `https://alharmainumrahtransport.com`, while the old messages use `alharmainumrah.com`. The helper takes one `SITE_URL`; in the browser it uses the address actually being viewed.
2. **The /fleet "Secondary" button:** is there a second WhatsApp number? If not, I'd point it at the same helper (no second number), or you may prefer to remove it.
3. **The booking pop-up's price line:** keep "Total Price: … SAR" in the message, or leave the price for the driver to confirm?
4. **Gallery captions that aren't a bookable model** ("AL HARMAIN Luxury Fleet Final Showcase", "Ford Taurus Luxury VIP Sedan"): send the caption as the vehicle name, or send a general fleet enquiry for those?
5. **The dead category-page vehicle pop-up:** leave it unreachable (its links now go to the vehicle pages, which get the right button), or rewire it?
