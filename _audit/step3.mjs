/**
 * STEP 3 check, from the probe results in _audit/results/:
 *  - every rendered text size on the 12/14/16/18/20/24/30/36/48 scale
 *  - weights in use
 *  - line height as a ratio of size: headings (~1.2) and body text (~1.6)
 *  - letter-spacing on uppercase text
 *  - paragraphs wider than ~70 characters a line, and centred paragraphs
 *    that sit off-centre once capped
 *
 * Usage: node _audit/step3.mjs [width]     (default 1280)
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';

const W = process.argv[2] ?? '1280';
const files = (await readdir('_audit/results')).filter((f) => f.startsWith(`${W}__`) && !f.includes('DONE'));

const sum = { pages: 0, checked: 0, offScale: 0 };
const offScale = new Map();
const merge = (target, src) => {
  for (const [k, e] of Object.entries(src ?? {})) {
    const t = (target[k] ??= { n: 0, ex: e.ex });
    t.n += e.n;
  }
};
const weights = {}, headingLH = {}, bodyLH = {}, capsLS = {};
const measure = new Map(), centred = new Map();
const group = (map, key, route) => {
  const e = map.get(key) ?? { n: 0, pages: new Set() };
  e.n += 1;
  e.pages.add(route);
  map.set(key, e);
};

for (const f of files) {
  const r = JSON.parse(await readFile(`_audit/results/${f}`, 'utf8'));
  const t = r.typeCheck;
  if (!t) continue;
  sum.pages += 1;
  sum.checked += t.checked;
  sum.offScale += t.offScaleN;
  for (const x of t.offScale) group(offScale, `${x.size}px · ${x.sel.split('.').slice(0, 2).join('.')} "${x.text}"`, r.route);
  merge(weights, t.weights);
  merge(headingLH, t.headingLH);
  merge(bodyLH, t.bodyLH);
  merge(capsLS, t.capsLS);
  for (const x of t.measureOver) group(measure, `${x.ch}ch · ${x.sel.split('.').slice(0, 2).join('.')} "${x.text}"`, r.route);
  for (const x of t.centredOff) group(centred, `${x.off}px · ${x.sel.split('.').slice(0, 2).join('.')} "${x.text}"`, r.route);
}

const top = (o) => Object.entries(o).sort((a, b) => b[1].n - a[1].n);
const rows = (m) => [...m.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => ({ k, n: e.n, pages: e.pages.size }));
const out = {
  width: W, ...sum,
  offScaleList: rows(offScale), weights: top(weights), headingLH: top(headingLH), bodyLH: top(bodyLH), capsLS: top(capsLS),
  measureOver: rows(measure), centredOff: rows(centred),
};
await writeFile(`_audit/step3-${W}.json`, JSON.stringify(out, null, 1));

console.log(`${W}px · ${sum.pages} pages · ${sum.checked} text elements`);
console.log(`off the scale: ${sum.offScale}`);
for (const x of out.offScaleList.slice(0, 20)) console.log(`   ${x.k}  ×${x.n} on ${x.pages} page(s)`);
console.log('weights:', out.weights.map(([k, e]) => `${k}×${e.n}`).join('  '));
console.log('heading line-height ratios:', out.headingLH.map(([k, e]) => `${k}×${e.n}`).join('  '));
console.log('body line-height ratios:   ', out.bodyLH.map(([k, e]) => `${k}×${e.n}`).join('  '));
console.log('uppercase letter-spacing:  ', out.capsLS.map(([k, e]) => `${k}×${e.n} (${e.ex})`).join('  |  '));
console.log(`paragraphs over ~70ch: ${out.measureOver.length}`);
for (const x of out.measureOver.slice(0, 10)) console.log(`   ${x.k}  ×${x.n} on ${x.pages}`);
console.log(`centred paragraphs off-centre: ${out.centredOff.length}`);
for (const x of out.centredOff.slice(0, 10)) console.log(`   ${x.k}  ×${x.n} on ${x.pages}`);
