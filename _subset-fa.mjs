/**
 * Subsets Font Awesome's CSS to the icons this site actually uses.
 *
 * FA ships ~100 kB of CSS defining thousands of `.fa-*` rules; the site uses a
 * few dozen. Only the rules whose class appears in the markup or in the original
 * scripts are kept, plus everything structural: @font-face, the `.fa`/`.fas`
 * family rules, sizing, spin/animation and the base `::before`.
 *
 * The webfonts are untouched, so every kept glyph renders from the same file at
 * the same codepoint — the rendering cannot change, only unused rules go.
 *
 * The full file is kept as all.full.css so this is reversible.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const CSS = 'public/vendor/fontawesome/all.min.css';
const FULL = 'public/vendor/fontawesome/all.full.css';

/* ---- 1. which fa-* tokens does the site reference? ---- */
const used = new Set();
const scan = (text) => {
  // class attributes and JS strings that build class names
  for (const m of text.matchAll(/fa-[a-z0-9]+(?:-[a-z0-9]+)*/g)) used.add(m[0]);
};
for (const f of (await readdir('_reference')).filter((f) => f.endsWith('.html'))) {
  scan(await readFile(`_reference/${f}`, 'utf8'));
}
for (const f of (await readdir('public/assets/js')).filter((f) => f.endsWith('.js'))) {
  scan(await readFile(`public/assets/js/${f}`, 'utf8'));
}

/* ---- 2. split the stylesheet into top-level rules ---- */
let css;
try {
  css = await readFile(FULL, 'utf8'); // already subset once — start from the original
} catch {
  css = await readFile(CSS, 'utf8');
  await writeFile(FULL, css);
}

const rules = [];
let depth = 0;
let start = 0;
let inStr = null;
for (let i = 0; i < css.length; i++) {
  const c = css[i];
  if (inStr) {
    if (c === '\\') i += 1;
    else if (c === inStr) inStr = null;
    continue;
  }
  if (c === '"' || c === "'") { inStr = c; continue; }
  if (c === '{') depth += 1;
  else if (c === '}') {
    depth -= 1;
    if (depth === 0) {
      rules.push(css.slice(start, i + 1));
      start = i + 1;
    }
  }
}
const leading = css.slice(0, css.indexOf('{') >= 0 ? css.indexOf(rules[0] ?? '') : css.length);

/* ---- 3. keep structural rules + rules for used icons ---- */
const STRUCTURAL =
  /@font-face|@keyframes|\.fa\b[^-]|\.fas\b|\.far\b|\.fab\b|\.fa-solid\b|\.fa-regular\b|\.fa-brands\b|::before|:root|\.sr-only|\.fa-fw|\.fa-\dx|\.fa-lg|\.fa-spin|\.fa-pulse|\.fa-border|\.fa-pull|\.fa-rotate|\.fa-flip|\.fa-stack|\.fa-inverse|\.fa-beat|\.fa-fade|\.fa-bounce|\.fa-shake|\.fa-spin-pulse|\.fa-li|\.fa-ul|\.svg-inline/;

const iconRule = /^\s*(\.fa-[a-z0-9-]+(?:::?before)?\s*,?\s*)+\{/;

let kept = 0;
let dropped = 0;
const out = [];
for (const rule of rules) {
  const head = rule.slice(0, rule.indexOf('{'));
  const isIconOnly = iconRule.test(rule) && !STRUCTURAL.test(head);
  if (!isIconOnly) { out.push(rule); kept += 1; continue; }
  // Icon rule: keep only if one of its selectors names a used icon.
  const names = [...head.matchAll(/\.(fa-[a-z0-9-]+)/g)].map((m) => m[1]);
  if (names.some((n) => used.has(n))) { out.push(rule); kept += 1; }
  else dropped += 1;
}

const result = leading + out.join('');
await writeFile(CSS, result);

const before = css.length;
const after = result.length;
console.log(`fa tokens used by the site : ${used.size}`);
console.log(`top-level rules            : ${rules.length}`);
console.log(`  kept                     : ${kept}`);
console.log(`  dropped (unused icons)   : ${dropped}`);
console.log(`css ${Math.round(before / 1024)} kB -> ${Math.round(after / 1024)} kB  (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);
console.log(`original preserved at ${FULL}`);
