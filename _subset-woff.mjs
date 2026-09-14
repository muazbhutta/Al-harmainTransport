/**
 * Subsets the Font Awesome webfonts to the icons the site actually draws.
 *
 * _subset-fa.mjs already cut the stylesheet from 100 kB to 21 kB, but the
 * fonts themselves still shipped every glyph: 147 kB of fa-solid-900 and
 * 106 kB of fa-brands-400 on every page, for roughly eighty icons.
 *
 * The codepoints come out of the subset stylesheet, so a glyph is kept exactly
 * when a rule that can render it survived — the two cannot drift apart. The
 * untouched originals are kept alongside as *.full.woff2.
 */
import { readFile, writeFile, stat, copyFile, access } from 'node:fs/promises';
import subsetFont from 'subset-font';

const CSS = 'public/vendor/fontawesome/all.min.css';
const css = await readFile(CSS, 'utf8');

// every `content: "\f0c9"` left in the subset stylesheet
const BS = String.fromCharCode(92);
const points = new Set();
for (const chunk of css.split('content:').slice(1)) {
  const open = chunk.indexOf('"');
  if (open === -1 || open > 2) continue;              // not `content:"..."`
  const value = chunk.slice(open + 1, chunk.indexOf('"', open + 1));
  if (!value.startsWith(BS)) continue;                // not an escaped codepoint
  const code = parseInt(value.slice(1), 16);
  if (Number.isFinite(code)) points.add(String.fromCodePoint(code));
}
const text = [...points].join('');
console.log(`icons referenced by the stylesheet: ${points.size}`);

for (const file of ['fa-solid-900', 'fa-brands-400', 'fa-regular-400']) {
  const path = `public/vendor/webfonts/${file}.woff2`;
  const full = `public/vendor/webfonts/${file}.full.woff2`;
  try { await access(path); } catch { continue; }
  try { await access(full); } catch { await copyFile(path, full); }   // keep the original once

  const before = (await stat(path)).size;
  const out = await subsetFont(await readFile(full), text, { targetFormat: 'woff2' });
  await writeFile(path, out);
  console.log(`  ${file}: ${Math.round(before / 1024)} kB -> ${Math.round(out.length / 1024)} kB`);
}
