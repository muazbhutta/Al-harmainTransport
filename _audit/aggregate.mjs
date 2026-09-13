/**
 * Combines the static scan (_audit/static.json) and every runtime probe result
 * (_audit/results/<width>__<page>.json) into AUDIT.md.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';

const stat = JSON.parse(await readFile('_audit/static.json', 'utf8'));
const files = (await readdir('_audit/results')).filter((f) => f.endsWith('.json') && !f.includes('DONE'));
const results = [];
for (const f of files) {
  const r = JSON.parse(await readFile(`_audit/results/${f}`, 'utf8'));
  if (!r.error) results.push(r);
  else console.warn('probe error on', f, r.error.slice(0, 120));
}
const at = (w) => results.filter((r) => r.width === w);
const R1280 = at(1280);
const R390 = at(390);

/* ------------------------------------------------------------ helpers */

/** Merge one bucket across pages: value -> { n, pages:Set, where:[] } */
function merge(list, bucket) {
  const out = new Map();
  for (const r of list) {
    for (const [value, e] of Object.entries(r.buckets?.[bucket] ?? {})) {
      const m = out.get(value) ?? { n: 0, pages: new Set(), where: [] };
      m.n += e.n;
      m.pages.add(r.route);
      for (const w of e.where) if (m.where.length < 3 && !m.where.includes(w)) m.where.push(w);
      out.set(value, m);
    }
  }
  return [...out.entries()].sort((a, b) => b[1].n - a[1].n);
}
const px = (v) => {
  const m = String(v).match(/^(-?[\d.]+)px$/);
  return m ? +m[1] : null;
};
const onGrid = (v) => {
  const n = px(v);
  return n === null ? null : Math.abs(n % 4) < 0.01 || Math.abs(n % 4) > 3.99;
};
const pagesLabel = (set) => (set.size >= R1280.length - 1 ? 'all pages' : `${set.size} page${set.size === 1 ? '' : 's'}`);
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
// table() escapes cells, so short() only trims (escaping twice printed `\\|`)
const short = (s, n = 60) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const combo = (s) => String(s).split(' | ').filter(Boolean).join(' · ');

const L = [];
const w = (s = '') => L.push(s);
const table = (head, rows) => {
  w(`| ${head.join(' | ')} |`);
  w(`|${head.map(() => '---').join('|')}|`);
  for (const r of rows) w(`| ${r.map((c) => esc(c)).join(' | ')} |`);
  w();
};

/* ------------------------------------------------------------ numbers */

const buckets = ['textColour', 'background', 'border', 'gradient', 'type', 'padding', 'margin', 'gap', 'radius', 'shadow', 'transition', 'buttonStyle', 'cardStyle', 'h1Style', 'h2Style', 'h3Style', 'badgeStyle', 'imageRadius'];
const M = Object.fromEntries(buckets.map((b) => [b, merge(R1280, b)]));
const sizes = new Map();
const weights = new Map();
const lhs = new Map();
const lsUpper = new Map();
const families = new Map();
for (const [combo, e] of M.type) {
  const [fam, size, weight, lh, ls, tt] = combo.split(' | ');
  const add = (map, k) => map.set(k, (map.get(k) ?? 0) + e.n);
  add(families, fam);
  add(sizes, size);
  add(weights, weight);
  add(lhs, lh);
  if (tt === 'uppercase') add(lsUpper, ls);
}
const byN = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

/* ============================================================== REPORT */

w('# AUDIT.md — design consistency audit');
w();
w(`Audited **${R1280.length} pages** at 1280px and **${R390.length}** at 390px — the 47 replicated pages plus the Ziyarat guide (English and Arabic).`);
w();
w('**Method.** Two passes, so nothing is guessed:');
w('- **Static** — every value *written* in the site\'s own stylesheets (`style.css`, `dynamic_styles.css`, `guide.css`), every inline `style=""` in the page markup, and every JSX file.');
w('- **Runtime** — each page loaded in a same-origin iframe at the target width; a probe reads the *computed* style of every visible element and measures alignment (left edges, card rows, button rows, icon centring, image aspect ratios). `content-visibility` and lazy loading are neutralised first so off-screen elements report real sizes.');
w();
w('Raw data: `_audit/static.json`, `_audit/results/*.json`. Re-run with `node _audit/static.mjs` + the harness + `node _audit/aggregate.mjs`.');
w();
w('---');
w();
w('## 0. Scoreboard');
w();
table(['', 'Authored (in source)', 'Rendered at 1280px', 'Target for STEP 2–5'], [
  ['Colours', Object.keys(stat.values.colour).length, `${M.textColour.length} text · ${M.background.length} background · ${M.border.length} border · ${M.gradient.length} gradients`, '~12 tokens'],
  ['Font sizes', Object.keys(stat.values.fontSize).length, sizes.size, '9 (12→48)'],
  ['Font weights', Object.keys(stat.values.fontWeight).length, weights.size, '3–4'],
  ['Line heights', Object.keys(stat.values.lineHeight).length, lhs.size, '2 ratios'],
  ['Letter-spacing values', Object.keys(stat.values.letterSpacing).length, '—', '1 for uppercase labels'],
  ['Padding values', Object.keys(stat.values.padding).length, M.padding.length, '4px scale'],
  ['Margin values', Object.keys(stat.values.margin).length, M.margin.length, '4px scale'],
  ['Gap values', Object.keys(stat.values.gap).length, M.gap.length, '4px scale'],
  ['Border radii', Object.keys(stat.values.radius).length, M.radius.length, '3–4'],
  ['Box shadows', Object.keys(stat.values.shadow).length, M.shadow.length, '2–3'],
  ['Transition durations', Object.keys(stat.values.transition).length, M.transition.length, '1–2'],
  ['Distinct button styles', '—', M.buttonStyle.length, '2 sizes × 2–3 variants'],
  ['Distinct card styles', '—', M.cardStyle.length, '1–2'],
  ['Distinct h2 styles', '—', M.h2Style.length, '1'],
]);
w(`Plus **${stat.inline.total.toLocaleString()} inline \`style=""\` attributes** in the page markup, and **${stat.sheets['style.css'].important + stat.sheets['dynamic_styles.css'].important} \`!important\`** declarations in the two original stylesheets.`);
w();
w('---');
w();

/* ------------------------------------------------------------- colours */
w('## 1. Colour');
w();
w('### 1a. Text colours actually rendered (1280px)');
w();
table(['Colour', 'Elements', 'Where', 'Example'], M.textColour.map(([v, e]) => [`\`${v}\``, e.n, pagesLabel(e.pages), short(e.where[0], 50)]));
w('### 1b. Background colours actually rendered');
w();
table(['Colour', 'Elements', 'Where', 'Example'], M.background.map(([v, e]) => [`\`${v}\``, e.n, pagesLabel(e.pages), short(e.where[0], 50)]));
w('### 1c. Gradients actually rendered');
w();
table(['Gradient', 'Elements', 'Where'], M.gradient.map(([v, e]) => [short(v, 90), e.n, pagesLabel(e.pages)]));
w('### 1d. Border colours actually rendered');
w();
table(['Width + colour', 'Elements', 'Where', 'Example'], M.border.slice(0, 30).map(([v, e]) => [`\`${v}\``, e.n, pagesLabel(e.pages), short(e.where[0], 46)]));
if (M.border.length > 30) w(`…and ${M.border.length - 30} more.\n`);

const pureBW = M.textColour.concat(M.background).filter(([v]) => /^#(000000|ffffff)$/.test(v));
w('### 1e. Pure black / pure white in use');
w();
w(pureBW.length ? pureBW.map(([v, e]) => `- \`${v}\` on ${e.n} elements (${pagesLabel(e.pages)}), e.g. ${short(e.where[0], 60)}`).join('\n') : '- none');
w();
w('### 1f. Hardcoded colours and inline styles in JSX');
w();
const jsxCol = stat.jsx.filter((j) => j.colours.length);
const jsxInline = stat.jsx.filter((j) => j.inlineStyle);
w(`- Hex/rgb literals in JSX: **${jsxCol.length}**${jsxCol.length ? '' : ' — the guide components already take every colour from CSS variables.'}`);
w(`- Inline \`style={{…}}\` objects in JSX: **${jsxInline.length}**, listed below. \`components/GuideBlocks.tsx\` (${jsxInline.filter((j) => j.at.includes('GuideBlocks')).length} of them) is **not imported anywhere** — a leftover from before the guide was rebuilt, and the only file using \`--color-brand-primary\`.`);
w();
table(['Location', 'Code'], jsxInline.map((j) => [`\`${j.at}\``, `\`${short(j.code, 90)}\``]));

/* ---------------------------------------------------------- typography */
w('## 2. Typography');
w();
w('### 2a. Families rendered');
w();
table(['Family', 'Text elements'], byN(families).map(([k, n]) => [k, n]));
w('### 2b. Font sizes rendered');
w();
table(['Size', 'Text elements', 'On a 12/14/16/18/20/24/30/36/48 scale?'],
  byN(sizes).map(([k, n]) => [k, n, [12, 14, 16, 18, 20, 24, 30, 36, 48].includes(px(k)) ? 'yes' : '**no**']));
w('### 2c. Weights and line heights rendered');
w();
table(['Weight', 'Text elements'], byN(weights).map(([k, n]) => [k, n]));
table(['Line height', 'Text elements'], byN(lhs).slice(0, 30).map(([k, n]) => [k, n]));
w('### 2d. Letter-spacing on UPPERCASE labels');
w();
table(['Letter-spacing', 'Elements'], byN(lsUpper).map(([k, n]) => [k, n]));
w('### 2e. Complete type combinations (family · size · weight · line height · tracking · case)');
w();
w(`**${M.type.length}** distinct combinations at 1280px. The 40 most used:`);
w();
table(['Combination', 'Elements', 'Where', 'Example'], M.type.slice(0, 40).map(([v, e]) => [short(combo(v), 70), e.n, pagesLabel(e.pages), short(e.where[0], 40)]));

/* -------------------------------------------------------------- spacing */
w('## 3. Spacing, radius, shadow, motion');
w();
for (const [label, key] of [['Padding', 'padding'], ['Margin (top/bottom)', 'margin'], ['Flex/grid gap', 'gap']]) {
  const list = M[key];
  const off = list.filter(([v]) => onGrid(v) === false);
  w(`### ${label} — ${list.length} distinct values, **${off.length} off the 4px grid**`);
  w();
  table(['Value', 'Uses', 'On 4px grid', 'Where', 'Example'], list.slice(0, 40).map(([v, e]) => [
    `\`${v}\``, e.n, onGrid(v) === null ? '—' : onGrid(v) ? 'yes' : '**no**', pagesLabel(e.pages), short(e.where[0], 38),
  ]));
  if (list.length > 40) w(`…and ${list.length - 40} more.\n`);
}
w(`### Border radius — ${M.radius.length} distinct values`);
w();
table(['Radius', 'Elements', 'Where', 'Example'], M.radius.map(([v, e]) => [`\`${v}\``, e.n, pagesLabel(e.pages), short(e.where[0], 44)]));
w(`### Box shadow — ${M.shadow.length} distinct values`);
w();
table(['Shadow', 'Elements', 'Where', 'Example'], M.shadow.map(([v, e]) => [short(v, 80), e.n, pagesLabel(e.pages), short(e.where[0], 34)]));
w(`### Transition duration — ${M.transition.length} distinct values`);
w();
table(['Duration', 'Elements', 'Where'], M.transition.map(([v, e]) => [v, e.n, pagesLabel(e.pages)]));

/* ------------------------------------------------ same element, differently */
w('## 4. The same element, styled differently');
w();
w(`### 4a. Buttons — ${M.buttonStyle.length} distinct styles`);
w();
w('Signature = height · padding · radius · background · text colour · size/weight · border.');
w();
table(['Button signature', 'Count', 'Where', 'Example'], M.buttonStyle.map(([v, e]) => [short(v, 95), e.n, pagesLabel(e.pages), short(e.where[0], 40)]));
w(`### 4b. Cards — ${M.cardStyle.length} distinct styles`);
w();
table(['Card signature', 'Count', 'Where', 'Example'], M.cardStyle.map(([v, e]) => [short(v, 95), e.n, pagesLabel(e.pages), short(e.where[0], 40)]));
for (const [h, n] of [['h1Style', 'c'], ['h2Style', 'd'], ['h3Style', 'e']]) {
  w(`### 4${n}. \`${h.slice(0, 2)}\` — ${M[h].length} distinct styles`);
  w();
  table(['Signature', 'Count', 'Where', 'Example'], M[h].slice(0, 25).map(([v, e]) => [short(v, 90), e.n, pagesLabel(e.pages), short(e.where[0], 44)]));
}
w(`### 4f. Badges, pills and eyebrow labels — ${M.badgeStyle.length} distinct styles`);
w();
table(['Signature', 'Count', 'Where', 'Example'], M.badgeStyle.map(([v, e]) => [short(v, 95), e.n, pagesLabel(e.pages), short(e.where[0], 36)]));
w('### 4g. Inner-page headers');
w();
const hdr = new Map();
for (const r of R1280) {
  if (!r.header) continue;
  const k = `${r.header.band} · pad ${r.header.bandPadding} · h1 ${r.header.h1} ${r.header.h1Align} · breadcrumb ${r.header.breadcrumb ? 'yes' : 'no'}`;
  (hdr.get(k) ?? hdr.set(k, []).get(k)).push(r.route);
}
table(['Header pattern', 'Pages', 'Examples'], [...hdr.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => [short(k, 100), v.length, v.slice(0, 3).join(', ')]));

/* ------------------------------------------------------------ alignment */
w('## 5. Alignment');
w();
w('### 5a. Container widths (1280px)');
w();
const cont = new Map();
for (const r of R1280) for (const [k, list] of Object.entries(r.containers ?? {})) {
  const e = cont.get(k) ?? { pages: new Set(), cls: new Set() };
  e.pages.add(r.route);
  list.forEach((c) => e.cls.add(c.split('.').slice(0, 3).join('.')));
  cont.set(k, e);
}
table(['Content left edge · width', 'Pages', 'Classes'], [...cont.entries()].sort((a, b) => b[1].pages.size - a[1].pages.size).map(([k, e]) => [k, pagesLabel(e.pages), [...e.cls].slice(0, 3).join(', ')]));
w('### 5b. Left edges of logo, headings, body text and footer (1280px)');
w();
w('A shared left edge means every value in a row is the same. Centred hero headings are expected to differ; everything else should sit on one line. Values ending in **R** are right-to-left content, measured from the right edge.');
w();
const edgeRows = R1280.map((r) => {
  const e = r.edges ?? {};
  const vals = Object.values(e).filter((x) => x !== null);
  return [r.route, e.logo ?? '—', e.h1 ?? '—', e.firstH2 ?? '—', e.bodyText ?? '—', e.footerFirstColumn ?? '—', new Set(vals).size];
}).sort((a, b) => b[6] - a[6]);
table(['Page', 'Logo', 'h1', 'first h2', 'body text', 'footer col 1', 'distinct edges'], edgeRows);

const mism = R1280.flatMap((r) => r.btnMismatch.map((m) => [r.route, m]));
w(`### 5c. Buttons side by side with different heights — ${mism.length} cases`);
w();
table(['Page', 'Pair'], mism.slice(0, 40));
const rows = R1280.flatMap((r) => r.rowIssues.map((i) => [r.route, i]));
w(`### 5d. Card rows: unequal heights, image ratios or button baselines — ${rows.length} rows`);
w();
table(['Page', 'Card', 'Heights', 'Height spread', 'Image ratios', 'Button bottom offsets'], rows.slice(0, 50).map(([p, i]) => [
  p, short(i.card, 34), i.heights.join(' / '), `${i.heightSpread}px`, i.imgAspects.join(' / ') || '—', i.buttonBottomGap.join(' / ') || '—',
]));
const imgRows = R1280.flatMap((r) => r.imgRowIssues.map((i) => [r.route, i]));
w(`### 5e. Images in the same row with different ratios or rounding — ${imgRows.length} rows`);
w();
table(['Page', 'Images', 'Aspect ratios', 'Radii', 'Sample'], imgRows.slice(0, 40).map(([p, i]) => [p, i.count, i.aspects.join(' / '), i.radii.join(' / '), short(i.sample, 30)]));
const stretched = merge(R1280, 'stretchedImage');
w(`### 5f. Stretched images (object-fit: fill, rendered ratio ≠ natural) — ${stretched.length}`);
w();
table(['Image', 'Where'], stretched.slice(0, 30).map(([v, e]) => [short(v, 80), pagesLabel(e.pages)]));
w('### 5g. Icons not centred on their text');
w();
const iconDist = new Map();
for (const r of R1280) for (const [k, n] of Object.entries(r.iconOffsets ?? {})) iconDist.set(k, (iconDist.get(k) ?? 0) + n);
const iconTotal = [...iconDist.values()].reduce((a, b) => a + b, 0);
const iconOff = [...iconDist.entries()].filter(([k]) => Math.abs(parseFloat(k)) > 1.5).reduce((a, [, n]) => a + n, 0);
w(`${iconTotal} icon+text pairs measured; **${iconOff}** are more than 1.5px off their text's vertical centre.`);
w();
const worst = R1280.flatMap((r) => (r.iconWorst ?? []).map((x) => [r.route, x])).sort((a, b) => Math.abs(b[1].off) - Math.abs(a[1].off));
table(['Page', 'Offset', 'Icon', 'In', 'Text'], worst.slice(0, 20).map(([p, x]) => [p, `${x.off}px`, x.icon ?? '—', short(x.in, 34), short(x.text, 24)]));
w('### 5h. Section rhythm');
w();
const sp = new Map();
for (const r of R1280) for (const [k, list] of Object.entries(r.sectionPad ?? {})) {
  const e = sp.get(k) ?? { n: 0, pages: new Set() };
  e.n += list.length;
  e.pages.add(r.route);
  sp.set(k, e);
}
w(`**${sp.size} different section paddings** (top / bottom):`);
w();
table(['Padding', 'Sections', 'Where'], [...sp.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => [k, e.n, pagesLabel(e.pages)]));
const hg = new Map();
for (const r of R1280) for (const [k, list] of Object.entries(r.headingGap ?? {})) {
  const e = hg.get(k) ?? { n: 0, ex: list[0] };
  e.n += list.length;
  hg.set(k, e);
}
w(`**${hg.size} different gaps** between a section heading and the content under it:`);
w();
table(['Gap', 'Headings', 'Example'], [...hg.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25).map(([k, e]) => [k, e.n, short(e.ex, 50)]));
w('### 5i. Mobile (390px)');
w();
const ov = R390.filter((r) => r.overflowX);
w(`- Pages with horizontal overflow at 390px: **${ov.length}**${ov.length ? ' — ' + ov.map((r) => r.route).join(', ') : ''}`);
const mism390 = R390.flatMap((r) => r.btnMismatch.map((m) => [r.route, m]));
w(`- Side-by-side buttons of different heights: **${mism390.length}**`);
const rows390 = R390.flatMap((r) => r.rowIssues.map((i) => [r.route, i]));
w(`- Card rows with unequal heights / ratios / button baselines: **${rows390.length}**`);
w();

/* --------------------------------------------------------------- focus */
// From a real keyboard test (Tab / Shift+Tab so :focus-visible applies): computed
// style at rest vs focused, plus screenshots of the nav. The probe's resting-outline
// count can't see :focus-visible, so it is not reported.
w('## 6. Focus states (real keyboard test)');
w();
w('Each control was reached with Tab / Shift+Tab so `:focus-visible` applies, then its computed style was compared at rest and when focused. Nav links were also checked by screenshot.');
w();
table(['Control', 'Where', 'What changes on keyboard focus', 'Verdict'], [
  ['Nav links `a.nav-link`', 'all pages', 'a faint box (border + darker background)', 'visible, low contrast'],
  ['Nav "WhatsApp" button `a.btn.btn-success`', 'all pages', 'nothing: outline and Bootstrap focus shadow both suppressed', '**no indicator**'],
  ['"Read More About Us" `a.btn.btn-primary`', 'home', 'nothing', '**no indicator**'],
  ['"Select & Configure Your Service" `#open-service-modal-btn`', 'home', 'nothing', '**no indicator**'],
  ['`.primary-button`, `.secondary-button`', 'most inner pages', 'browser default ring', 'visible, unstyled'],
  ['Floating toggle `.fab-main`', '31 pages', 'browser default ring, 1px', 'visible, thin'],
  ['Trending cards `a.content-card`', 'home', 'browser default ring', 'visible, unstyled'],
  ['Guide buttons, TOC and language links', 'guide', 'browser default ring (`guide.css` has no focus rules)', 'visible, unstyled'],
]);
w('Source: `style.css` has 16 `:focus` rules, 5 of them `outline: none` (form fields swap in a box-shadow; `.navbar-toggler:focus` gets nothing). `dynamic_styles.css` has 1, `guide.css` 0. There is no shared focus style anywhere.');
w();

/* ------------------------------------------------------------ contrast */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = c.map(f);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const PAIRS = [
  ['Primary button text', '#0e0e0e', '#c18a1a', '16px', 4.5],
  ['WhatsApp buttons (nav, service pages)', '#ffffff', '#25d366', '14–16.8px', 4.5],
  ['WhatsApp floating button icon', '#ffffff', '#25d366', 'icon', 3],
  ['Facebook floating button icon', '#ffffff', '#1877f2', 'icon', 3],
  ['Body text `.text-secondary` on section', '#a6a6a6', '#111317', '16px', 4.5],
  ['Body text on accordion item', '#a6a6a6', '#2b303b', '16px', 4.5],
  ['`.text-white-50` (white 50% over #111317)', '#888a8b', '#111317', '16px', 4.5],
  ['Lead text', '#cccccc', '#111317', '16px', 4.5],
  ['Headings', '#f2f2f2', '#111317', '32px', 3],
  ['Gold labels / links', '#da9a28', '#12161f', '17.6px', 4.5],
  ['Gold badges', '#d4a017', '#111317', '13.6px', 4.5],
  ['Accordion question text', '#c18a1a', '#2b303b', '16px', 4.5],
  ['Gradient button text', '#212529', '#c18a1a', '14px', 4.5],
  ['AI chat secondary text', '#94a3b8', '#0f172a', '14px', 4.5],
  ['Muted text (1 page)', '#6b7a99', '#0e131d', '14px', 4.5],
  ['Guide eyebrow label', '#d4a017', '#0d0f13', '12px', 4.5],
];
w('## 7. Contrast of the main colour pairs (WCAG AA)');
w();
w('AA needs 4.5:1 for normal text, 3:1 for large text (24px, or 18.7px bold) and for icons. Measured against the solid background each element sits on. Text over photos (the hero) is checked in STEP 6.');
w();
table(['Pair', 'Colours', 'Size', 'Ratio', 'Needs', 'Result'], PAIRS.map(([n, f, b, s, need]) => {
  const r = ratio(f, b);
  return [n, `\`${f}\` on \`${b}\``, s, `${r.toFixed(2)}:1`, `${need}:1`, r >= need ? 'pass' : '**FAIL**'];
}));
w(`For the failures: dark text \`#0e0e0e\` on the WhatsApp green gives ${ratio('#0e0e0e', '#25d366').toFixed(2)}:1 and keeps the brand colour; the accordion text in \`#da9a28\` on \`#2b303b\` gives ${ratio('#da9a28', '#2b303b').toFixed(2)}:1.`);
w();

/* ------------------------------------------------------- other findings */
w('## 8. Other findings');
w();
w('- **Logo colours** (measured from `/img/LOGO.png`, 500×499): dominant navy `#183048`, dark navy averaging `#151e2e` (30% of pixels), silver greys `#787878`–`#d8d8d8` (~30%). Gold is only 2%, a muted `#987d53`. The site\'s gold `#c18a1a` comes from the original CSS, not the logo.');
w('- **Three golds do one job:** `#c18a1a` (buttons, borders, rules), `#da9a28` (spans, AI widget) and `#d4a017` (badges, fleet heroes). There are also two yellows, `#ffcc00` and `#ffc107`.');
w('- **A second palette:** the AI chat widget (`ai_agent.js`, 15 pages) injects Tailwind slate colours (`#0f172a`, `#1e293b`, `#94a3b8`, `#cbd5e1`, `#e2e8f0`) plus its own gold and gradients.');
w('- **Near-identical dark backgrounds:** `#16181d`, `#12161f`, `#111317`, `#0c1017`, `#0b0f19`, `#0d0f13`, `#0e131d`, `#0f141e`, plus 25 gradients, most of them dark-on-dark.');
w('- **Two containers:** Bootstrap 1140px (content edge 74.5px at 1280) vs the guide\'s 1200px (52.5px), so guide text starts 22px left of the logo. `/book-now` sits at 82px, 7.5px off.');
w('- **Non-Latin scripts:** Poppins has no Arabic, Devanagari or Bengali glyphs. The guide\'s ar / ur / fa / hi / bn pages render in whatever fallback font the visitor\'s device has, so they look different on every device. Urdu would normally use a Nastaliq face.');
w('- **Pure white / black:** `#ffffff` on 383 text elements and 48 backgrounds; `#000000` on 1 background, plus black-75% badges.');
w('- **Leftover file:** `components/GuideBlocks.tsx` is not imported anywhere.');
w();

/* ------------------------------------------------------------ decisions */
w('## 9. Decisions needed before STEP 2');
w();
w('**1. Replica or polish.** Everything so far was built to match the original pixel for pixel ("Do not redesign, do not improve"). STEPS 2–5 deliberately change how every page looks, so the pixel-parity checks will stop passing. The content checks (text, headings, images, links, phone numbers) will keep passing. Most of the inconsistency sits in the original markup: **' + stat.inline.total.toLocaleString() + ' inline `style=""` attributes** and 295 `!important` rules, which a normal stylesheet cannot override.');
w();
w('- **A: one override layer (recommended).** A single `polish.css`, loaded last, holds the tokens (colour, type, spacing, radius, shadow, focus) and re-maps the existing classes (`.primary-button`, `.btn`, cards, sections, headings, containers). Where an inline style blocks it, the extractor turns that inline style into a class at build time; page text is untouched. Reversible by removing one file and one build step.');
w('- **B: rewrite each page into components.** Cleanest end state, but much bigger and the highest risk of content drift. Too much for a polish round.');
w('- **C: polish only the guide and the shared parts** (nav, footer, buttons, focus). The 47 replicated pages stay as the original.');
w();
w('**2. Primary colour.** The logo is navy and silver; gold is 2% of it.');
w();
w('- **(a) Navy primary from the logo**, gold only as a small accent. This is the biggest visual change, and what "derive the primary colour from the logo" literally means.');
w('- **(b) Keep the dark ground with gold accents** (what you picked for the guide last round) and derive the neutrals from the logo\'s navy and silver. A smaller change.');
w();
w('The WhatsApp contrast failure is fixed either way (dark text on the green), since the brief requires every pair to pass AA.');
w();

await writeFile('AUDIT.md', L.join('\n'));
console.log(`AUDIT.md written — ${L.length} lines; pages 1280:${R1280.length} 390:${R390.length}`);
