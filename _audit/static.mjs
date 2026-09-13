/**
 * Static half of the design audit: every AUTHORED value.
 *
 * Scans the site's own stylesheets (style.css, dynamic_styles.css, guide.css),
 * every inline style="" attribute in the page markup, and every JSX file, and
 * records each colour / type / spacing / radius / shadow value with where it
 * was written. Bootstrap is a third-party library and is reported separately —
 * its effect shows up in the runtime pass.
 *
 * Output: _audit/static.json and _audit/pages.json (the route list the runtime
 * harness walks).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SHEETS = [
  ['style.css', 'public/assets/css/style.css'],
  ['dynamic_styles.css', 'public/includes/dynamic_styles.css'],
  ['guide.css', 'app/guide.css'],
];

/* ------------------------------------------------------------- colours */

const NAMED = { white: '#ffffff', black: '#000000', transparent: 'transparent' };

const toHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

function hsl2rgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

/** Every colour literal in a CSS value, normalised to #rrggbb[@alpha]. */
function colours(value) {
  const out = [];
  const v = value.toLowerCase();
  for (const m of v.matchAll(/#([0-9a-f]{3,8})\b/g)) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 6) out.push('#' + h);
    else if (h.length === 8) out.push('#' + h.slice(0, 6) + '@' + (parseInt(h.slice(6), 16) / 255).toFixed(2));
  }
  for (const m of v.matchAll(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/g)) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    out.push(toHex(+m[1], +m[2], +m[3]) + (a < 1 ? '@' + a.toFixed(2) : ''));
  }
  for (const m of v.matchAll(/hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+))?\s*\)/g)) {
    const [r, g, b] = hsl2rgb(+m[1], +m[2], +m[3]);
    const a = m[4] === undefined ? 1 : +m[4];
    out.push(toHex(r, g, b) + (a < 1 ? '@' + a.toFixed(2) : ''));
  }
  for (const [name, hex] of Object.entries(NAMED)) {
    if (new RegExp(`(^|[\\s:,(])${name}($|[\\s;,)!])`).test(v)) out.push(hex);
  }
  return out;
}

/* ---------------------------------------------------------- collection */

const store = {
  colour: {}, fontSize: {}, fontWeight: {}, lineHeight: {}, letterSpacing: {}, fontFamily: {},
  padding: {}, margin: {}, gap: {}, radius: {}, shadow: {}, transition: {},
};
const bump = (bucket, key, where) => {
  if (!key) return;
  const e = (store[bucket][key] ??= { n: 0, where: [] });
  e.n += 1;
  if (e.where.length < 6 && !e.where.includes(where)) e.where.push(where);
};

const LEN = /-?\d*\.?\d+(px|rem|em|%|vh|vw|ch)?/g;

function decl(prop, value, where) {
  prop = prop.trim().toLowerCase();
  value = value.replace(/!important/g, '').trim();
  if (!prop || !value || value.startsWith('var(')) {
    // still harvest colours inside var() fallbacks / gradients
  }
  for (const c of colours(value)) bump('colour', c, `${where}  [${prop}]`);

  if (prop === 'font-size') bump('fontSize', value, where);
  else if (prop === 'font-weight') bump('fontWeight', value, where);
  else if (prop === 'line-height') bump('lineHeight', value, where);
  else if (prop === 'letter-spacing') bump('letterSpacing', value, where);
  else if (prop === 'font-family') bump('fontFamily', value.split(',')[0].replace(/["']/g, '').trim(), where);
  else if (/^padding/.test(prop)) for (const t of value.match(LEN) ?? []) { if (!/^0(px)?$/.test(t)) bump('padding', t, where); }
  else if (/^margin/.test(prop)) for (const t of value.match(LEN) ?? []) { if (!/^0(px)?$/.test(t)) bump('margin', t, where); }
  else if (/^(gap|row-gap|column-gap|grid-gap)$/.test(prop)) bump('gap', value, where);
  else if (/radius/.test(prop)) bump('radius', value, where);
  else if (prop === 'box-shadow' && value !== 'none') bump('shadow', value, where);
  else if (/^transition/.test(prop)) {
    for (const t of value.match(/\d*\.?\d+m?s\b/g) ?? []) bump('transition', t, where);
  }
}

function parseDecls(block, where) {
  for (const part of block.split(';')) {
    const i = part.indexOf(':');
    if (i > 0) decl(part.slice(0, i), part.slice(i + 1), where);
  }
}

/* ----------------------------------------------------------- stylesheets */

const sheetStats = {};
for (const [name, path] of SHEETS) {
  const css = (await readFile(path, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  let rules = 0;
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ').slice(0, 70);
    if (selector.startsWith('@')) continue;
    rules += 1;
    parseDecls(m[2], `${name} ${selector}`);
  }
  sheetStats[name] = { bytes: css.length, rules, important: (css.match(/!important/g) || []).length };
}

/* --------------------------------------------------------- inline styles */

const index = JSON.parse(await readFile('content/_index.json', 'utf8'));
const inlinePerPage = {};
let inlineTotal = 0;
for (const p of index) {
  const body = JSON.parse(await readFile(join('content', `${p.slug}.json`), 'utf8')).body;
  const styles = [...body.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)];
  inlinePerPage[p.route] = styles.length;
  inlineTotal += styles.length;
  for (const s of styles) parseDecls(s[1], `inline ${p.route}`);
}

/* ------------------------------------------------------------- JSX files */

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx|ts)$/.test(e.name)) out.push(p);
  }
  return out;
}
const jsx = [];
for (const f of [...(await walk('app')), ...(await walk('components'))]) {
  const lines = (await readFile(f, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    const cs = colours(line.replace(/\/\/.*$/, ''));
    const inlineStyle = /style=\{\{/.test(line);
    if (cs.length || inlineStyle) {
      jsx.push({ at: `${f.replace(/\\/g, '/')}:${i + 1}`, colours: cs, inlineStyle, code: line.trim().slice(0, 110) });
      for (const c of cs) bump('colour', c, `jsx ${f.replace(/\\/g, '/')}:${i + 1}`);
    }
  });
}

/* ---------------------------------------------------------------- output */

const sortDesc = (o) =>
  Object.fromEntries(Object.entries(o).sort((a, b) => b[1].n - a[1].n));
const result = {
  sheets: sheetStats,
  inline: { total: inlineTotal, perPage: inlinePerPage },
  jsx,
  values: Object.fromEntries(Object.entries(store).map(([k, v]) => [k, sortDesc(v)])),
};
await writeFile('_audit/static.json', JSON.stringify(result, null, 1));

const pages = [...index.map((p) => p.route), '/ziyarat-guide/en', '/ziyarat-guide/ar'];
await writeFile('_audit/pages.json', JSON.stringify(pages));

console.log('stylesheets:');
for (const [k, v] of Object.entries(sheetStats)) console.log(`  ${k.padEnd(20)} ${v.rules} rules, ${v.important} !important`);
console.log(`inline style="" attributes: ${inlineTotal} across ${index.length} pages`);
console.log(`JSX lines with colours or inline styles: ${jsx.length}`);
console.log('distinct authored values:');
for (const [k, v] of Object.entries(store)) console.log(`  ${k.padEnd(14)} ${Object.keys(v).length}`);
console.log(`pages for runtime pass: ${pages.length}`);
