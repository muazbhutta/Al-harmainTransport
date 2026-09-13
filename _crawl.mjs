/**
 * Step 1 — crawl and inventory.
 *
 * 1. BFS from index.html following every internal <a href> until closure.
 * 2. Additionally probe numbered pages that the site never links (service_N,
 *    category_N), so unlinked-but-live pages are not missed.
 * 3. Save every 200 response verbatim into ./_reference/.
 * 4. Emit _inventory.json: url, status, title, meta description/keywords,
 *    heading outline and section markers for each page.
 *
 * Nothing is guessed: probed URLs are recorded only when the server returns 200
 * with real HTML.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://lightyellow-squirrel-120253.hostingersite.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const OUT = '_reference';

const dec = (s) =>
  String(s ?? '')
    .replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '’')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—');

const clean = (s) => dec(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function abs(href, base) {
  try {
    const u = new URL(href, base);
    u.hash = '';
    return u.href;
  } catch {
    return null;
  }
}

const isAsset = (u) =>
  /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|css|js|mjs|woff2?|ttf|eot|pdf|mp4|webm|zip|xml|txt|json)$/i
    .test(new URL(u).pathname);

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const ct = res.headers.get('content-type') || '';
  const body = res.ok && /text\/html/i.test(ct) ? await res.text() : null;
  return { ok: res.ok, status: res.status, ct, body, finalUrl: res.url };
}

function meta(html, name) {
  const re = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*content=["']([\\s\\S]*?)["']`, 'i');
  const re2 = new RegExp(
    `<meta[^>]*content=["']([\\s\\S]*?)["'][^>]*name=["']${name}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? clean(m[1]) : null;
}

/** Heading outline + the section wrappers each heading sits in. */
function outline(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const heads = [];
  for (const m of stripped.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = clean(m[2]);
    if (text && text.length > 1) heads.push({ level: +m[1], text, at: m.index });
  }
  const sections = [];
  for (const m of stripped.matchAll(/<section\b([^>]*)>/gi)) {
    const cls = (m[1].match(/class=["']([^"']*)["']/i) || [, ''])[1];
    sections.push({ cls: cls.trim(), at: m.index });
  }
  return { heads, sections };
}

const pages = new Map();
const failed = [];
const linkedFrom = new Map();

async function visit(url, viaLink) {
  if (pages.has(url)) return null;
  let r;
  try {
    r = await get(url);
  } catch (e) {
    failed.push({ url, reason: String(e) });
    return null;
  }
  if (!r.ok || !r.body) {
    failed.push({ url, reason: 'HTTP ' + r.status + (r.body ? '' : ' / non-HTML') });
    return null;
  }
  const html = r.body;
  const path = decodeURIComponent(new URL(url).pathname);
  const file = join(OUT, path.replace(/^\//, '') || 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);

  const { heads, sections } = outline(html);
  pages.set(url, {
    url,
    path,
    status: r.status,
    discoveredBy: viaLink ? 'link' : 'probe',
    title: clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]),
    description: meta(html, 'description'),
    keywords: meta(html, 'keywords'),
    bytes: html.length,
    headings: heads.map((h) => `h${h.level}: ${h.text}`),
    sectionClasses: [...new Set(sections.map((s) => s.cls).filter(Boolean))],
  });
  return html;
}

// ---- 1. BFS over linked pages
const queue = [ORIGIN + '/index.html'];
const seen = new Set(queue);
while (queue.length) {
  const url = queue.shift();
  const html = await visit(url, true);
  if (!html) continue;
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const href = m[1];
    if (/^(mailto:|tel:|javascript:|#|https?:\/\/(wa\.me|api\.whatsapp|www\.(facebook|instagram|youtube|tiktok)))/i.test(href)) continue;
    const u = abs(href, url);
    if (!u || !u.startsWith(ORIGIN) || isAsset(u)) continue;
    if (!linkedFrom.has(u)) linkedFrom.set(u, new Set());
    linkedFrom.get(u).add(new URL(url).pathname);
    if (!seen.has(u)) { seen.add(u); queue.push(u); }
  }
}
const afterLinks = pages.size;

// ---- 2. Probe numbered pages the site may never link
const probes = [];
for (let n = 1; n <= 60; n++) probes.push(`${ORIGIN}/service_${n}.html`);
for (let n = 1; n <= 10; n++) probes.push(`${ORIGIN}/category_${n}.html`);
for (const name of ['contact', 'checkout', 'cart', 'about', 'about-us', 'services',
  'fleet', 'blog', 'gallery', 'terms', 'refund-policy', 'airport-pickup-guidelines',
  'customer-faqs', 'partner-terms', 'privacy-policy', 'book-now', 'all-fleet',
  'who-we-are', 'thank-you', 'sitemap']) probes.push(`${ORIGIN}/${name}.html`);

const CONC = 8;
let i = 0;
await Promise.all(
  Array.from({ length: CONC }, async () => {
    while (i < probes.length) {
      const u = probes[i++];
      if (pages.has(u)) continue;
      await visit(u, false);
    }
  }),
);

const inventory = {
  origin: ORIGIN,
  crawledAt: new Date().toISOString(),
  totals: {
    pages: pages.size,
    viaLinks: afterLinks,
    viaProbe: pages.size - afterLinks,
    failed: failed.length,
  },
  pages: [...pages.values()].sort((a, b) => a.path.localeCompare(b.path, 'en', { numeric: true })),
  linkedFrom: [...linkedFrom].map(([u, s]) => ({ path: new URL(u).pathname, from: [...s] })),
  failed,
};
await writeFile(join(OUT, '_inventory.json'), JSON.stringify(inventory, null, 2));

console.log(`pages saved : ${pages.size}  (linked ${afterLinks}, probe-only ${pages.size - afterLinks})`);
console.log(`failed/404  : ${failed.length}`);
console.log('\nprobe-only discoveries:');
for (const p of inventory.pages) if (p.discoveredBy === 'probe') console.log('  ' + p.path + '  — ' + p.title);
