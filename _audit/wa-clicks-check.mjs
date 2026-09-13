/**
 * Phase 1 click-through check. The browser clicked every WhatsApp button on
 * every page of the running site (navigation blocked) and saved the URL each
 * one would open to _audit/results/wa-clicks-*.json. This checks every
 * captured message:
 *  - starts with "Assalamu Alaikum" and ends with the page it was clicked on;
 *  - carries the right detail for its button type (the service page's own
 *    title, the vehicle's name and capacity, the package's legs, the route…).
 * Writes _audit/wa-verified.json and prints the grouped list of buttons.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';

const SITE = 'https://alharmainumrahtransport.com';
const files = (await readdir('_audit/results')).filter((f) => /^wa-clicks-.*\.json$/.test(f));
const clicks = (await Promise.all(files.map(async (f) => JSON.parse(await readFile(`_audit/results/${f}`, 'utf8'))))).flat();

const expect = {
  service: (c) => (c.path.startsWith('/services/') && c.h1 && !/^(Airport Pick|Inter-City|Local Transfer|Ziyarat\/Tours)/.test(c.h1)
    ? c.text.includes(`book ${c.h1}.`) : /I would like to book .+\./.test(c.text)),
  vehicle: (c) => c.text.includes(`book the ${c.h1}`) && /up to \d+ passengers, \d+ large bags/.test(c.text),
  fleet: (c) => /I would like to book the .+\./.test(c.text),
  package: (c) => /book Package \d+: .+ → .+/.test(c.text),
  route: (c) => /book (a transfer from .+ to .+|.+)\./.test(c.text),
  booking: (c) => /I would like to book:/.test(c.text),
  b2b: (c) => /travel agent/.test(c.text),
  general: (c) => /(ask about|contact .+ about) your Umrah transport services\./.test(c.text),
  chat: (c) => /I would like to (book|ask)/.test(c.text),
};

const failed = [];
for (const c of clicks) {
  const issues = [];
  if (!c.text) issues.push('opened nothing');
  else {
    if (!c.text.startsWith('Assalamu Alaikum, ')) issues.push('no greeting');
    const want = `Page: ${SITE}${c.path}`;
    if (!c.text.endsWith(want)) issues.push(`page link: ${c.text.split('\n').pop()} ≠ ${want}`);
    const check = expect[c.type];
    if (!check) issues.push(`unknown type ${c.type}`);
    else if (!check(c)) issues.push(`${c.type} detail missing`);
  }
  if (issues.length) failed.push({ page: c.r, label: c.label, issues, text: c.text });
}

// group identical buttons (same label + type + message minus the page link)
const groups = new Map();
for (const c of clicks) {
  const body = (c.text ?? '').replace(/\nPage: .*$/, '');
  const key = `${c.label}|${c.type}|${body}`;
  const g = groups.get(key) ?? { label: c.label, type: c.type, message: body, pages: new Set() };
  g.pages.add(c.r);
  groups.set(key, g);
}
const verified = [...groups.values()].map((g) => ({ ...g, pages: [...g.pages] }));
await writeFile('_audit/wa-verified.json', JSON.stringify({ clicks: clicks.length, failed, verified }, null, 1));

const pages = new Set(clicks.map((c) => c.r)).size;
console.log(`buttons clicked: ${clicks.length} on ${pages} pages/flows · failed: ${failed.length}`);
for (const f of failed.slice(0, 20)) console.log('  FAIL', f.page, '|', f.label, '|', f.issues.join('; '));
const byType = clicks.reduce((o, c) => ((o[c.type] = (o[c.type] ?? 0) + 1), o), {});
console.log('by type:', Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`distinct button + message combinations: ${verified.length}`);
