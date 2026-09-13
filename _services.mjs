/**
 * Group 2 discovery — find every service detail page.
 *
 * Two independent passes, because neither alone is sufficient:
 *   1. follow service_N links on the four category pages;
 *   2. probe service_1 upward until a run of consecutive misses.
 *
 * A "miss" is a hard 404 OR a soft-404: this host answers HTTP 200 with an
 * identical 5,036-byte "This Page Does Not Exist" body for service ids that do
 * not exist, so a status check alone would report them as real pages.
 */
import { readFile, writeFile } from 'node:fs/promises';

const ORIGIN = 'https://lightyellow-squirrel-120253.hostingersite.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const SOFT_404 = /This Page Does Not Exist/i;

const clean = (s) =>
  String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const CATEGORIES = {
  1: { slug: 'airport-pick-drops', file: 'category_1.html' },
  2: { slug: 'inter-city', file: 'category_2.html' },
  3: { slug: 'local-transfers', file: 'category_3.html' },
  4: { slug: 'ziyarat-tours', file: 'category_4.html' },
};

// ---- pass 1: links on the category pages
const linkedBy = new Map(); // id -> [category ids]
for (const [cid, c] of Object.entries(CATEGORIES)) {
  const html = await readFile(`_reference/${c.file}`, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/href=["']service_(\d+)\.html["']/gi)) ids.add(Number(m[1]));
  c.serviceIds = [...ids].sort((a, b) => a - b);
  c.title = clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  for (const id of ids) {
    if (!linkedBy.has(id)) linkedBy.set(id, []);
    linkedBy.get(id).push(Number(cid));
  }
}

// ---- pass 2: probe upward until a run of consecutive misses
const found = new Map();
const misses = [];
let run = 0;
let id = 1;
const MAX_RUN = 8;
while (run < MAX_RUN && id <= 80) {
  const url = `${ORIGIN}/service_${id}.html`;
  let hit = null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) {
      const body = await res.text();
      if (SOFT_404.test(body)) {
        misses.push({ id, kind: 'soft-404 (HTTP 200)', bytes: body.length });
      } else {
        hit = {
          id,
          title: clean((body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]),
          description: clean(
            (body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) || [, ''])[1],
          ),
          bytes: body.length,
        };
      }
    } else {
      misses.push({ id, kind: 'HTTP ' + res.status });
    }
  } catch (e) {
    misses.push({ id, kind: String(e) });
  }
  if (hit) { found.set(id, hit); run = 0; } else { run += 1; }
  id += 1;
}

const rows = [...found.values()].sort((a, b) => a.id - b.id).map((s) => ({
  ...s,
  categories: (linkedBy.get(s.id) ?? []).map((c) => CATEGORIES[c].slug),
  linked: (linkedBy.get(s.id) ?? []).length > 0,
}));

await writeFile('_reference/_services.json', JSON.stringify({ categories: CATEGORIES, services: rows, misses }, null, 2));

console.log(`probed service_1 .. service_${id - 1}  (stopped after ${MAX_RUN} consecutive misses)`);
console.log(`real service pages: ${rows.length}`);
console.log(`misses: ${misses.length}\n`);

console.log('CATEGORY PAGES');
for (const [cid, c] of Object.entries(CATEGORIES)) {
  console.log(`  category_${cid}.html -> /services/${c.slug}`);
  console.log(`      title: ${c.title}`);
  console.log(`      links to ${c.serviceIds.length} services: ${c.serviceIds.join(', ')}`);
}

console.log('\nSERVICE PAGES');
for (const r of rows) {
  const cat = r.categories.length ? r.categories.join(' + ') : 'UNLINKED — no category lists it';
  console.log(`  service_${String(r.id).padEnd(2)}.html  ${r.linked ? ' ' : '*'} ${r.title}`);
  console.log(`      category: ${cat}`);
}

console.log('\nMISSES');
const bySoft = misses.filter((m) => m.kind.startsWith('soft'));
const byHard = misses.filter((m) => !m.kind.startsWith('soft'));
console.log(`  soft-404 (HTTP 200, empty body): ${bySoft.map((m) => m.id).join(', ') || 'none'}`);
console.log(`  hard 404: ${byHard.map((m) => m.id).join(', ') || 'none'}`);
