/**
 * STEP 2 check, from the probe results in _audit/results/:
 *  - contrast: every text element against what is painted behind it (WCAG AA)
 *  - palette: every rendered text / background / border / gradient colour must
 *    be a palette colour (at any alpha)
 *
 * Usage: node _audit/step2.mjs [width]     (default 1280)
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { PALETTE } from '../_polish.mjs';

const W = process.argv[2] ?? '1280';
const pal = new Set(Object.values(PALETTE).map((h) => h.toLowerCase()));
const files = (await readdir('_audit/results')).filter((f) => f.startsWith(`${W}__`) && !f.includes('DONE'));

const total = { checked: 0, pass: 0, fail: 0, overImage: 0 };
const fails = new Map();
const offPalette = new Map();
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('');

for (const f of files) {
  const r = JSON.parse(await readFile(`_audit/results/${f}`, 'utf8'));
  if (r.error) { console.warn('probe error', f); continue; }
  for (const k of Object.keys(total)) total[k] += r.contrast?.[k] ?? 0;
  for (const x of r.contrast?.fails ?? []) {
    const key = `${x.sel.split('.').slice(0, 2).join('.')} · ${x.fg} on ${x.bg} · ${x.ratio}:1 (needs ${x.need})`;
    const e = fails.get(key) ?? { n: 0, pages: new Set(), text: x.text };
    e.n += 1;
    e.pages.add(r.route);
    fails.set(key, e);
  }
  for (const bucket of ['textColour', 'background', 'border', 'gradient']) {
    for (const [value, e] of Object.entries(r.buckets?.[bucket] ?? {})) {
      const found = bucket === 'gradient'
        // a fully transparent stop (the `transparent` keyword) is not a colour
        ? [...value.matchAll(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/g)]
          .filter((m) => m[4] === undefined || +m[4] > 0).map((m) => toHex(m[1], m[2], m[3]))
        : [...value.matchAll(/#[0-9a-f]{6}/g)].map((m) => m[0]);
      for (const hex of found) {
        if (pal.has(hex)) continue;
        const key = `${bucket} ${hex}`;
        const o = offPalette.get(key) ?? { n: 0, pages: new Set(), ex: e.where[0] };
        o.n += e.n;
        o.pages.add(r.route);
        offPalette.set(key, o);
      }
    }
  }
}

const out = {
  width: W,
  pages: files.length,
  contrast: total,
  fails: [...fails.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => ({ pair: k, n: e.n, pages: e.pages.size, text: e.text })),
  offPalette: [...offPalette.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => ({ colour: k, n: e.n, pages: e.pages.size, example: e.ex })),
};
await writeFile(`_audit/step2-${W}.json`, JSON.stringify(out, null, 1));

console.log(`${W}px · ${out.pages} pages`);
console.log(`contrast: ${total.checked} text elements checked · ${total.pass} pass · ${total.fail} fail · ${total.overImage} over photos (not judged)`);
for (const x of out.fails.slice(0, 30)) console.log(`  FAIL ${x.pair}  ×${x.n} on ${x.pages} page(s)  "${x.text}"`);
console.log(`colours outside the palette: ${out.offPalette.length}`);
for (const x of out.offPalette.slice(0, 30)) console.log(`  ${x.colour}  ×${x.n} on ${x.pages} page(s)  e.g. ${x.example}`);
