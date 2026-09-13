/**
 * Compares a whole group of replicated pages against the originals.
 *
 * Usage: node _verify-group.mjs [services|fleet|all]
 *
 * Compares parsed values rather than raw bytes for head metadata: that still
 * catches entity double-encoding, while tolerating the original's invalid raw
 * `&` in meta descriptions, which Next correctly escapes and which parses to the
 * same string in a browser.
 */
import { readFile } from 'node:fs/promises';

const ORIGIN = 'https://lightyellow-squirrel-120253.hostingersite.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const GROUP = process.argv[2] ?? 'services';

/* ---------------------------------------------------------------- page list */
const rows = [];

if (GROUP === 'services' || GROUP === 'all') {
  for (const f of ['data/categories.ts', 'data/services.ts']) {
    const src = await readFile(f, 'utf8');
    for (const m of src.matchAll(/\{ id: \d+, slug: "([^"]+)", source: "([^"]+)"/g)) {
      rows.push({ slug: m[1], source: m[2], route: `/services/${m[1]}` });
    }
  }
}

if (GROUP === 'standalone' || GROUP === 'all') {
  const src = await readFile('data/pages.ts', 'utf8');
  for (const m of src.matchAll(/\{ slug: '([^']+)'/g)) {
    rows.push({ slug: m[1], source: `${m[1]}.html`, route: `/${m[1]}` });
  }
}

if (GROUP === 'fleet' || GROUP === 'all') {
  rows.push({ slug: 'all-fleet', source: 'all-fleet.html', route: '/fleet' });
  const src = await readFile('data/vehicles.ts', 'utf8');
  for (const m of src.matchAll(/slug: "([^"]+)",[^]*?source: "([^"]+)"/g)) {
    rows.push({ slug: m[1], source: m[2], route: `/fleet/${m[1]}` });
  }
}

/* ------------------------------------------------------------------ helpers */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', 39: "'", '039': "'" };
const dec1 = (t) => t.replace(/&(amp|lt|gt|quot|apos|nbsp|#0?39);/g, (_, e) => ENT[e] ?? _);
const decAll = (t) => {
  let prev = t;
  let next = dec1(t);
  while (next !== prev) {
    prev = next;
    next = dec1(next);
  }
  return next;
};
const clean = (s) => decAll(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const bodyOf = (h) => {
  const s = h.search(/<body[^>]*>/i);
  return h
    .slice(h.indexOf('>', s) + 1, h.lastIndexOf('</body>'))
    .replace(/<script[\s\S]*?<\/script>/gi, '');
};
const headings = (h) =>
  [...bodyOf(h).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => `h${m[1]}:${clean(m[2])}`)
    .filter((x) => x.length > 4);
const imgs = (h) =>
  [...bodyOf(h).matchAll(/<img\b[^>]*>/gi)].map((t) =>
    ((t[0].match(/src\s*=\s*["']([^"']*)["']/i) || [, ''])[1]).replace(/^\//, ''),
  );
const classes = (h) => {
  const set = new Set();
  for (const m of bodyOf(h).matchAll(/class\s*=\s*["']([^"']+)["']/gi)) {
    for (const c of m[1].split(/\s+/)) if (c) set.add(c);
  }
  return set;
};
/**
 * Visible text, with <style> dropped (those hold the required asset-path
 * rewrite) and the deliberately-added "Ziyarat Guide" nav/footer link removed.
 *
 * That link is the ONE intentional divergence from the original markup, added
 * on request. Normalising it here keeps the comparison meaningful: any OTHER
 * text difference is still reported.
 */
const GUIDE_LINK = /<li[^>]*>\s*<a[^>]*href="\/ziyarat-guide"[^>]*>[^<]*<\/a>\s*<\/li>/gi;
const textOf = (h) =>
  clean(bodyOf(h).replace(/<style[\s\S]*?<\/style>/gi, '').replace(GUIDE_LINK, ''));
const waLinks = (h) => [...bodyOf(h).matchAll(/https:\/\/wa\.me\/[^"'\s<>\\]+/g)].map((m) => decAll(m[0]));
const telLinks = (h) => [...bodyOf(h).matchAll(/tel:[^"'\s<>]+/g)].map((m) => m[0]);

const get = async (u) => (await fetch(u, { headers: { 'User-Agent': UA } })).text();

/* --------------------------------------------------------------------- run */
const problems = [];
let ok = 0;

for (const r of rows) {
  const [a, b] = await Promise.all([
    get(`${ORIGIN}/${r.source}`),
    get(`http://localhost:3100${r.route}`),
  ]);
  const issues = [];

  const metaVal = (h, re) => decAll((h.match(re) || [, ''])[1].replace(/\s+/g, ' ').trim());
  for (const [name, re] of [
    ['title', /<title[^>]*>([\s\S]*?)<\/title>/i],
    ['description', /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i],
    ['keywords', /<meta[^>]*name=["']keywords["'][^>]*content=["']([\s\S]*?)["']/i],
  ]) {
    const x = metaVal(a, re);
    const y = metaVal(b, re);
    if (x !== y) issues.push(`${name}: "${x.slice(0, 60)}" vs "${y.slice(0, 60)}"`);
  }

  const ha = headings(a);
  const hb = headings(b);
  if (ha.join('|') !== hb.join('|')) issues.push(`headings ${ha.length} vs ${hb.length}`);

  const ia = imgs(a);
  const ib = imgs(b);
  if (ia.join('|') !== ib.join('|')) issues.push(`images ${ia.length} vs ${ib.length}`);

  const ka = classes(a);
  const kb = classes(b);
  const missing = [...ka].filter((c) => !kb.has(c));
  const extra = [...kb].filter((c) => !ka.has(c));
  if (missing.length || extra.length) {
    issues.push(
      `classes missing [${missing.slice(0, 5).join(',') || '-'}] extra [${extra.slice(0, 5).join(',') || '-'}]`,
    );
  }

  if (textOf(a) !== textOf(b)) issues.push('visible text differs');
  if (waLinks(a).join('|') !== waLinks(b).join('|')) issues.push('whatsapp links differ');
  if (telLinks(a).join('|') !== telLinks(b).join('|')) issues.push('tel links differ');

  if (issues.length) problems.push({ ...r, issues });
  else ok += 1;
}

console.log(`group: ${GROUP}`);
console.log(`compared ${rows.length} pages`);
console.log(`identical: ${ok}`);
console.log(`with differences: ${problems.length}\n`);
for (const p of problems) {
  console.log(`  ${p.source}  ->  ${p.route}`);
  p.issues.forEach((i) => console.log(`      - ${i}`));
}
