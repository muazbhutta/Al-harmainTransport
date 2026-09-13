/**
 * Rebuilds content/_chrome.json — the nav, footer and floating buttons used by
 * hand-built pages such as the Ziyarat guide.
 *
 * Uses the SAME route map and the SAME guide-link injection as the page
 * extractor, so the chrome on a hand-built page cannot drift from the chrome on
 * the 47 replicated pages.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { addGuideLinks } from './_chrome.mjs';

const ROUTE_MAP = JSON.parse(await readFile('_route-map.json', 'utf8'));
const html = await readFile('_reference/who-we-are.html', 'utf8');

const grab = (re) => (html.match(re) || [null])[0];

const fixLink = (v) => {
  if (/^(https?:|\/\/|data:|mailto:|tel:|#)/i.test(v)) return v;
  const m = v.match(/^\/?([A-Za-z0-9_-]+\.html)$/);
  if (!m) return v;
  return ROUTE_MAP[m[1]] ?? (m[1] === 'index.html' ? '/' : '/' + m[1].replace(/\.html$/, ''));
};

const rewrite = (s) =>
  s
    .replace(/\b(src|poster)\s*=\s*"(?!https?:|\/\/|data:|\/)([^"]*)"/g, '$1="/$2"')
    .replace(/(<a\b[^>]*?\bhref\s*=\s*)"([^"]*)"/gi, (_, pre, v) => `${pre}"${fixLink(v)}"`);

const chrome = {
  nav: rewrite(grab(/<nav class="navbar[\s\S]*?<\/nav>/) ?? ''),
  footer: rewrite(grab(/<footer class="main-site-footer"[\s\S]*?<\/footer>/) ?? ''),
  floating: rewrite(grab(/<div class="fab-container"[\s\S]*?\n {4}<\/div>/) ?? ''),
};
chrome.nav = addGuideLinks(chrome.nav);
chrome.footer = addGuideLinks(chrome.footer);

await writeFile('content/_chrome.json', JSON.stringify(chrome, null, 0));
for (const [k, v] of Object.entries(chrome)) console.log(`  ${k.padEnd(9)} ${v.length} bytes`);
console.log('  nav has guide link   :', chrome.nav.includes('/ziyarat-guide'));
console.log('  footer has guide link:', chrome.footer.includes('/ziyarat-guide'));
console.log('  old routes remaining :', (chrome.nav + chrome.footer).match(/\/(all-fleet|category_\d|service_\d+|index)\b/g)?.length ?? 0);
