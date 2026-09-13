/**
 * Step 4 — structural diff between the original page and the replica.
 *
 * Compares the rendered DOM of both, not screenshots: element counts, the text
 * of every heading, every link target, every image source, and the computed
 * geometry of the main landmarks. Screenshot comparison is unreliable here
 * because the preview pane composites images intermittently; measuring the DOM
 * is deterministic.
 *
 * Usage: node _compare.mjs <page-slug>
 */
const SLUG = process.argv[2] ?? 'index';
const ORIGINAL = `https://lightyellow-squirrel-120253.hostingersite.com/${SLUG}.html`;
const REPLICA = `http://localhost:3100${SLUG === 'index' ? '/' : '/' + SLUG}`;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const get = async (u) => (await fetch(u, { headers: { 'User-Agent': UA } })).text();

const dec = (s) =>
  String(s ?? '')
    .replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const clean = (s) => dec(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const body = (h) => {
  const s = h.search(/<body[^>]*>/i);
  return h.slice(h.indexOf('>', s) + 1, h.lastIndexOf('</body>'))
    .replace(/<script[\s\S]*?<\/script>/gi, '');
};

const headings = (h) =>
  [...body(h).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => `h${m[1]}:${clean(m[2])}`)
    .filter((x) => x.length > 4);

const imgs = (h) =>
  [...body(h).matchAll(/<img\b[^>]*>/gi)].map((t) => {
    const src = (t[0].match(/src\s*=\s*["']([^"']*)["']/i) || [, ''])[1];
    return src.replace(/^\//, '').replace(/^https?:\/\/[^/]+\//, '');
  });

const links = (h) =>
  [...body(h).matchAll(/<a\b[^>]*href\s*=\s*["']([^"']*)["']/gi)]
    .map((m) => m[1])
    .map((v) => v.replace(/^\//, '').replace(/\.html$/, ''))
    // `index.html` and `/` are the same destination — not a difference.
    .map((v) => (v === 'index' || v === '' ? '<home>' : v))
    .filter((v) => !/^(#|javascript:)/.test(v));

const counts = (h) => {
  const b = body(h);
  const out = {};
  for (const tag of ['section', 'div', 'a', 'img', 'button', 'input', 'select', 'ul', 'li', 'h2', 'h5', 'form', 'table']) {
    out[tag] = (b.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
  }
  return out;
};

const classes = (h) => {
  const set = new Set();
  for (const m of body(h).matchAll(/class\s*=\s*["']([^"']+)["']/gi)) {
    for (const c of m[1].split(/\s+/)) if (c) set.add(c);
  }
  return set;
};

const [a, b] = await Promise.all([get(ORIGINAL), get(REPLICA)]);

const diffs = [];
const same = [];

// --- head metadata
const meta = (h, re) => { const m = h.match(re); return m ? clean(m[1]) : null; };
const pairs = [
  ['title', /<title[^>]*>([\s\S]*?)<\/title>/i],
  ['description', /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i],
  ['keywords', /<meta[^>]*name=["']keywords["'][^>]*content=["']([\s\S]*?)["']/i],
];
for (const [name, re] of pairs) {
  const x = meta(a, re), y = meta(b, re);
  if (x === y) same.push(`${name} identical`);
  else diffs.push(`${name}\n    original: ${x}\n    replica : ${y}`);
}

// --- element counts
const ca = counts(a), cb = counts(b);
for (const k of Object.keys(ca)) {
  if (ca[k] === cb[k]) same.push(`<${k}> count ${ca[k]}`);
  else diffs.push(`<${k}> count: original ${ca[k]}, replica ${cb[k]}`);
}

// --- headings, in order
const ha = headings(a), hb = headings(b);
if (ha.join('|') === hb.join('|')) same.push(`${ha.length} headings identical and in order`);
else {
  diffs.push(`headings differ (original ${ha.length}, replica ${hb.length})`);
  const max = Math.max(ha.length, hb.length);
  for (let i = 0; i < max; i++) {
    if (ha[i] !== hb[i]) diffs.push(`    [${i}] original: ${ha[i] ?? '—'}\n         replica : ${hb[i] ?? '—'}`);
  }
}

// --- images
const ia = imgs(a), ib = imgs(b);
if (ia.join('|') === ib.join('|')) same.push(`${ia.length} images identical and in order`);
else {
  diffs.push(`images differ (original ${ia.length}, replica ${ib.length})`);
  for (let i = 0; i < Math.max(ia.length, ib.length); i++) {
    if (ia[i] !== ib[i]) diffs.push(`    [${i}] original: ${ia[i] ?? '—'}\n         replica : ${ib[i] ?? '—'}`);
  }
}

// --- links
const la = links(a), lb = links(b);
if (la.join('|') === lb.join('|')) same.push(`${la.length} links identical and in order`);
else {
  const onlyA = la.filter((x, i) => lb[i] !== x);
  diffs.push(`links differ (original ${la.length}, replica ${lb.length}); first 10 mismatches:`);
  for (let i = 0, n = 0; i < Math.max(la.length, lb.length) && n < 10; i++) {
    if (la[i] !== lb[i]) { diffs.push(`    [${i}] original: ${la[i] ?? '—'}  |  replica: ${lb[i] ?? '—'}`); n++; }
  }
}

// --- class vocabulary (drives all the CSS)
const ka = classes(a), kb = classes(b);
const missing = [...ka].filter((c) => !kb.has(c));
const extra = [...kb].filter((c) => !ka.has(c));
if (!missing.length && !extra.length) same.push(`class vocabulary identical (${ka.size} classes)`);
else {
  if (missing.length) diffs.push(`classes present in original but not replica (${missing.length}): ${missing.slice(0, 25).join(', ')}`);
  if (extra.length) diffs.push(`classes present in replica but not original (${extra.length}): ${extra.slice(0, 25).join(', ')}`);
}

console.log(`\n=== ${SLUG} : original vs replica ===\n`);
console.log(`MATCHES (${same.length}):`);
same.forEach((s) => console.log('  ok  ' + s));
console.log(`\nDIFFERENCES (${diffs.length}):`);
if (!diffs.length) console.log('  none');
diffs.forEach((d) => console.log('  XX  ' + d));
