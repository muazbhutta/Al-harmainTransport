/**
 * Phase 1 check on the built site (out/):
 *  - every WhatsApp link on every page carries data-wa (it was written by
 *    lib/whatsapp.mjs), starts with "Assalamu Alaikum" and ends with the
 *    page's own address on alharmainumrahtransport.com;
 *  - no script the pages load holds a hand-written wa.me link (only the
 *    generated helper, polish/wa.js, may).
 *
 * Usage: node _audit/wa-verify.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE = 'https://alharmainumrahtransport.com';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let pages = 0;
let links = 0;
const problems = [];
const byType = {};
for await (const p of walk('out')) {
  if (!p.endsWith('.html')) continue;
  const rel = relative('out', p).split(sep).join('/').replace(/\.html$/, '');
  const route = rel === 'index' ? '/' : `/${rel}`;
  const html = await readFile(p, 'utf8');
  let n = 0;
  for (const m of html.matchAll(/<a\b([^>]*)href="(https:\/\/wa\.me\/[^"]*)"([^>]*)>/g)) {
    n += 1;
    links += 1;
    const attrs = m[1] + m[3];
    const type = (attrs.match(/data-wa="(\w+)"/) ?? [])[1];
    byType[type ?? '(none)'] = (byType[type ?? '(none)'] ?? 0) + 1;
    const text = new URL(m[2].replace(/&amp;/g, '&')).searchParams.get('text') ?? '';
    const want = `Page: ${SITE}${route}`;
    const issues = [];
    if (!type) issues.push('no data-wa (not written by the helper)');
    if (!text.startsWith('Assalamu Alaikum')) issues.push('no greeting');
    if (!text.endsWith(want)) issues.push(`ends ${JSON.stringify(text.split('\n').pop())}, want ${want}`);
    if (issues.length) problems.push(`${route}: ${issues.join('; ')}`);
  }
  if (n) pages += 1;
}

const scripts = [];
for await (const p of walk(join('out', 'polish'))) {
  if (p.endsWith('.js') && !p.endsWith(`${sep}wa.js`) && /wa\.me\//.test(await readFile(p, 'utf8'))) scripts.push(p);
}

console.log(`pages with WhatsApp links: ${pages} · links checked: ${links}`);
console.log('by type:', Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`links not from the helper / wrong greeting / wrong page link: ${problems.length}`);
for (const x of problems.slice(0, 20)) console.log(`   ${x}`);
console.log(`loaded scripts with a hand-written wa.me link: ${scripts.length}${scripts.length ? ` — ${scripts.join(', ')}` : ''}`);
process.exitCode = problems.length || scripts.length ? 1 : 0;
