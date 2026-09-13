import { readFile, writeFile } from 'node:fs/promises';

const inv = JSON.parse(await readFile('_reference/_inventory.json', 'utf8'));
const isSoft404 = (p) => /does not exist/i.test(p.title);
const real = inv.pages.filter((p) => !isSoft404(p));
const soft = inv.pages.filter(isSoft404);

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

/** Section headings that describe the page body (drops the shared chrome). */
const CHROME = /^(h[45]): (Your Cart|Quick Links|Our Company|Get in Touch|Follow Us)$/i;
const bodyHeadings = (p) => p.headings.filter((h) => !CHROME.test(h));

const group = (path) => {
  if (path === '/index.html') return '1. Home';
  if (/^\/(who-we-are|all-fleet|book-now|blog)\.html$/.test(path)) return '2. Core';
  if (/^\/category_\d+\.html$/.test(path)) return '3. Service categories';
  if (/^\/service_\d+\.html$/.test(path)) return '4. Services';
  if (/^\/(toyota-camry|hyundai-sonata|hyundai-staria|gmc-xl-yukon|hiace-grand-cabin|coaster)\.html$/.test(path))
    return '5. Vehicles';
  return '6. Info & legal';
};

const groups = new Map();
for (const p of real) {
  const g = group(p.path);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(p);
}

const L = [];
const w = (s = '') => L.push(s);

w('# PAGES.md — crawl inventory');
w();
w(`Source: <${inv.origin}/index.html>  ·  crawled ${inv.crawledAt.slice(0, 19).replace('T', ' ')} UTC`);
w();
w('Raw HTML for every page below is saved verbatim in `./_reference/`, at the same');
w('path as the original (e.g. `_reference/service_2.html`).');
w();
w('| | |');
w('|---|---|');
w(`| Pages found (real) | **${real.length}** |`);
w(`| — discovered by following links | ${real.filter((p) => p.discoveredBy === 'link').length} |`);
w(`| — found only by probing | ${real.filter((p) => p.discoveredBy === 'probe').length} |`);
w(`| Soft-404s excluded | ${soft.length} |`);
w(`| Hard 404s among the URLs you listed | 2 (\`contact.html\`, \`checkout.html\`) |`);
w();
w('---');
w();
w('## ⚠ Read this before building');
w();
w('**1. `contact.html` and `checkout.html` do not exist.** Both return HTTP 404 on the');
w('live site, yet the footer links to `contact.html` from every page and the cart links');
w('to `checkout.html` from 25 pages. They are dead links on the original. I have not');
w('invented replacements — tell me what you want these to do.');
w();
w('**2. Seven `service_N.html` URLs return HTTP 200 with an empty "This Page Does Not');
w('Exist" body** (5,036 bytes each): `service_26`, `27`, `28`, `29`, `31`, `32`, `33`.');
w('These are soft-404s, not real pages, and are excluded from the build list.');
w();
w('**3. Five live pages are not linked from anywhere on the site** and would have been');
w('missed by a link-only crawl:');
for (const p of real.filter((x) => x.discoveredBy === 'probe')) {
  w(`- \`${p.path}\` — ${p.title}`);
}
w();
w('`blog.html` in particular is a whole page the navigation never exposes.');
w();
w('---');
w();

for (const g of [...groups.keys()].sort()) {
  const list = groups.get(g).sort((a, b) =>
    a.path.localeCompare(b.path, 'en', { numeric: true }));
  w(`## ${g}  _(${list.length})_`);
  w();
  for (const p of list) {
    const heads = bodyHeadings(p);
    w(`### \`${p.path}\``);
    w();
    w(`- **Title:** ${esc(p.title)}`);
    w(`- **Meta description:** ${p.description ? esc(p.description) : '_none_'}`);
    w(`- **Meta keywords:** ${p.keywords ? esc(p.keywords.slice(0, 160)) + (p.keywords.length > 160 ? '…' : '') : '_none_'}`);
    w(`- **Discovered by:** ${p.discoveredBy === 'probe' ? '**probe (unlinked)**' : 'link'}`);
    w(`- **Size:** ${p.bytes.toLocaleString()} bytes`);
    if (heads.length) {
      w('- **Sections:**');
      for (const h of heads) {
        const lvl = Number(h.match(/^h(\d)/)[1]);
        w(`${'  '.repeat(Math.max(0, lvl - 1))}- ${esc(h)}`);
      }
    } else {
      w('- **Sections:** _no headings_');
    }
    w();
  }
}

w('---');
w();
w('## Soft-404s (excluded)');
w();
w('| Path | Returns | Body |');
w('|---|---|---|');
for (const p of soft) w(`| \`${p.path}\` | HTTP 200 | ${esc(p.title)} (${p.bytes} bytes) |`);
w();
w('## Hard 404s');
w();
w('| Path | Linked from |');
w('|---|---|');
const linked = new Map(inv.linkedFrom.map((x) => [x.path, x.from]));
for (const f of inv.failed) {
  const path = new URL(f.url).pathname;
  if (/service_|category_/.test(path)) continue;
  const from = linked.get(path);
  w(`| \`${path}\` | ${from ? `${from.length} page(s)` : 'not linked — probed only'} |`);
}
w();

await writeFile('PAGES.md', L.join('\n'));
console.log('PAGES.md written —', L.length, 'lines,', real.length, 'real pages');
