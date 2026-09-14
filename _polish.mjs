/**
 * STEP 2 — colour system.
 *
 * Rewrites every colour literal the site uses into one of the palette variables
 * defined in public/polish/globals.css, so every page draws from one small
 * palette. The originals are never edited: rewritten copies go to
 * public/polish/ (stylesheets, scripts) and content-polish/ (page markup), and
 * the app reads those while POLISH is on (lib/polish.ts). Switch it off and the
 * approved replica is back exactly as it was.
 *
 * A colour is mapped by WHAT it is (hue family, lightness) and WHERE it is used
 * (text, fill, border, shadow). The same light grey becomes body text when it
 * is a `color`, and the light tint when it is a `background`.
 *
 * Also marks the current section in the navbar (`.active` + aria-current), the
 * one markup change the navbar alignment needs.
 *
 * Usage: node _polish.mjs        (re-run after `npm run extract`)
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, posix, relative, sep } from 'node:path';
import { EMAIL, LICENCE, pageUrl, waLink, waMessage } from './lib/whatsapp.mjs';

/* ------------------------------------------------------------- palette */

// Must match public/polish/globals.css. Used to classify, and as literals inside
// data: URIs, which var() cannot reach.
export const PALETTE = {
  bg: '#0c1119',
  surface: '#121a26',
  'surface-raised': '#1a2432',
  border: '#2b3747',
  brand: '#183048',
  'brand-dark': '#10233a',
  'brand-tint': '#e9eef4',
  heading: '#eef1f5',
  text: '#c3cad4',
  muted: '#97a1af',
  accent: '#d4a02c',
  'accent-hover': '#b8891f',
  'on-accent': '#0c1119',
  success: '#25d366',
  'success-hover': '#1eb257',
  'on-success': '#0c1119',
  warning: '#f08a3c',
  error: '#f06a6a',
};
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/* ------------------------------------------------------- colour maths */

const NAMED = { white: [255, 255, 255], black: [0, 0, 0] };

function parseColour(src) {
  const v = src.trim().toLowerCase();
  if (NAMED[v]) return { r: NAMED[v][0], g: NAMED[v][1], b: NAMED[v][2], a: 1 };
  let m = v.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return { r, g, b, a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
  }
  m = v.match(/^rgba?\(([^)]*)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3 || p.slice(0, 3).some((x) => Number.isNaN(parseFloat(x)))) return null;
    const [r, g, b] = p.slice(0, 3).map((x) => (x.endsWith('%') ? parseFloat(x) * 2.55 : +x));
    const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : +p[3];
    return { r, g, b, a };
  }
  m = v.match(/^hsla?\(([^)]*)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    const [h, s, l] = [parseFloat(p[0]), parseFloat(p[1]) / 100, parseFloat(p[2]) / 100];
    const k = (n) => (n + h / 30) % 12;
    const q = s * Math.min(l, 1 - l);
    const f = (n) => 255 * (l - q * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))));
    return { r: f(0), g: f(8), b: f(4), a: p[3] === undefined ? 1 : parseFloat(p[3]) };
  }
  return null;
}

function hsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0;
  let s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

function family(c) {
  const { h, s, l } = hsl(c);
  if (s < 0.25 || l < 0.1 || l > 0.95) return 'neutral';
  // navy and slate are this palette's neutrals (they come from the logo)
  if (h >= 190 && h <= 250 && (l < 0.3 || s < 0.4)) return 'neutral';
  if (h >= 345 || h < 15) return 'red';
  if (h < 36) return 'orange';
  if (h < 66) return 'gold';
  if (h < 175) return 'green';
  if (h < 250) return 'blue';
  return 'other';
}

/* ------------------------------------------------------------- mapping */

const solid = (tok) => ({ tok, a: 1 });
const alpha = (tok, a) => ({ tok, a });

/**
 * Palette token for colour `c` used in context `ctx`
 * ('text' | 'fill' | 'border' | 'shadow' | null = decide by value).
 * `hover` is true inside :hover / :active / :focus rules.
 */
function pick(c, ctx, hover = false) {
  const fam = family(c);
  const { l } = hsl(c);
  const a = c.a;
  const opaque = a >= 0.999;
  // unnamed: an opaque light neutral is text; a faint one is an overlay
  if (!ctx) ctx = fam === 'neutral' ? (l >= 0.5 && a >= 0.5 ? 'text' : 'fill') : 'fill';
  const effL = a * l + (1 - a) * 0.075; // lightness as seen over the dark ground

  const semantic = (base, dark) => {
    if (ctx === 'text') return solid(base);
    if (!opaque) return alpha(base, a);
    return solid(ctx === 'fill' && (hover || l < 0.4) ? dark : base);
  };
  switch (fam) {
    case 'gold':
      return semantic('accent', 'accent-hover');
    case 'green':
      return semantic('success', 'success-hover');
    case 'red':
      return opaque || ctx === 'text' ? solid('error') : alpha('error', a);
    case 'orange':
      return opaque || ctx === 'text' ? solid('warning') : alpha('warning', a);
    case 'blue':
      if (ctx === 'text') return solid('accent'); // links read in the accent
      if (!opaque) return alpha('brand', a);
      return solid(hover || l < 0.35 ? 'brand-dark' : 'brand');
    case 'other':
      return ctx === 'text' || opaque ? solid('accent') : alpha('accent', a);
    default: // neutral
      if (ctx === 'text') {
        // text is never translucent: it resolves to one solid step of the ramp
        return solid(effL >= 0.86 ? 'heading' : effL >= 0.7 ? 'text' : effL >= 0.38 ? 'muted' : 'on-accent');
      }
      if (ctx === 'border') {
        return solid(effL < 0.13 ? 'bg' : effL < 0.45 ? 'border' : effL < 0.8 ? 'muted' : 'heading');
      }
      if (ctx === 'shadow') {
        const tok = l >= 0.5 ? 'heading' : 'bg'; // no pure black: shadows are navy-black
        return opaque ? solid(tok) : alpha(tok, a);
      }
      {
        // fills keep their translucency — overlays on photos depend on it
        const tok = l < 0.085 ? 'bg' : l < 0.13 ? 'surface' : l < 0.45 ? 'surface-raised' : l < 0.8 ? 'muted' : 'brand-tint';
        return opaque ? solid(tok) : alpha(tok, a);
      }
  }
}

const cssOf = ({ tok, a }) => (a >= 0.999 ? `var(--clr-${tok})` : `rgba(var(--clr-${tok}-rgb), ${+a.toFixed(3)})`);

function literalOf({ tok, a }, hashForm) {
  const hex = PALETTE[tok];
  if (a < 0.999) return `rgba(${rgbOf(hex).join(', ')}, ${+a.toFixed(3)})`;
  return hashForm === '%23' ? `%23${hex.slice(1)}` : `rgb(${rgbOf(hex).join(', ')})`;
}

/* ------------------------------------------------------------ contexts */

const COLOUR_PROP = /^(--[\w-]+|color|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|(-webkit-)?box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(-color)?|column-rule(-color)?|filter|stop-color|-webkit-text-fill-color|-webkit-tap-highlight-color|scrollbar-color|border-image)$/;

function ctxFromName(name) {
  const n = name.toLowerCase();
  if (/shadow/.test(n)) return 'shadow';
  if (/border|outline|ring|divider|sep|hairline|rule|line/.test(n)) return 'border';
  if (/(bg|background|surface|fill|start|end|band|card|tint|scripture)/.test(n)) return 'fill';
  if (/(text|heading|emphasis|link|ink|-color$)/.test(n)) return 'text';
  return null;
}

function ctxFor(prop) {
  if (prop.startsWith('--')) return ctxFromName(prop);
  if (/shadow|filter/.test(prop)) return 'shadow';
  if (/^background/.test(prop)) return 'fill';
  if (/^(border|outline|column-rule|stroke)/.test(prop)) return 'border';
  return 'text';
}

const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/** The CSS property a colour at `i` belongs to, or null (selector, id, prose...). */
function propAt(text, i, mode) {
  const stops = mode === 'js' ? ';{}"\'`\n' : ';{}';
  let depth = 0;
  let j = i - 1;
  for (; j >= 0; j--) {
    const ch = text[j];
    if (ch === ')') depth++;
    else if (ch === '(') { if (depth > 0) depth--; }
    else if (depth === 0 && stops.includes(ch)) break;
  }
  // a comment between the previous declaration and this one hides the property
  const seg = text.slice(j + 1, i).replace(/\/\*[\s\S]*?\*\//g, '');
  let m = seg.match(/^\s*(--[\w-]+|-?[a-zA-Z][\w-]*)\s*:/);
  if (m) return m[1].toLowerCase();
  if (mode === 'js' && j >= 0 && `"'\``.includes(text[j]) && /^\s*$/.test(seg)) {
    // el.style.borderColor = '#fff'   |   { color: '#fff' }
    const before = text.slice(Math.max(0, j - 120), j);
    m = before.match(/([a-zA-Z][\w-]*)\s*[:=]\s*$/);
    if (m) return kebab(m[1]);
    // style="background: ${on ? 'rgba(…)' : 'rgba(…)'}"
    m = before.match(/([a-zA-Z-]+)\s*:[^;:{}]*\$\{[^}]*$/);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

/** true when the rule enclosing `i` is a :hover / :active / :focus state. */
function inStateRule(text, i) {
  const open = text.lastIndexOf('{', i);
  if (open < 0) return false;
  const close = text.lastIndexOf('}', open);
  return /:(hover|active|focus)/.test(text.slice(close + 1, open));
}

/* ----------------------------------------------------------- transform */

const URL_SRC = String.raw`url\(\s*(?:"[^"]*"|'[^']*'|[^)"']*)\s*\)`;
const COLOUR_SRC = String.raw`#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|rgba?\([^()]*\)|hsla?\([^()]*\)|(?<![-\w#.$])(?:white|black)(?![-\w])`;
const RGBVAR_SRC = String.raw`(--[\w-]+-rgb\s*:\s*)(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3})`;
const COMMENT_SRC = String.raw`\/\*[\s\S]*?\*\/`;

export const stats = { files: {}, tokens: {}, map: {}, skipped: [], dataUri: 0 };
const tally = (file, key) => {
  const f = (stats.files[file] ??= { replaced: 0, skipped: 0 });
  f[key] += 1;
};

/**
 * mode: 'css' (stylesheet / <style>), 'decl' (a style="" value), 'js'.
 * baseUrl: the original URL of the file, so relative url()s keep resolving
 * from the copy's new location.
 */
export function transform(text, mode, file, baseUrl = null) {
  const re = new RegExp(`${mode === 'js' ? '' : `(${COMMENT_SRC})|`}(${URL_SRC})|${RGBVAR_SRC}|(${COLOUR_SRC})`, 'g');
  const result = text.replace(re, (...args) => {
    const groups = mode === 'js' ? [undefined, ...args.slice(1, 5)] : args.slice(1, 6);
    const [comment, url, rgbProp, rgbVal, colour] = groups;
    const offset = args[args.length - 2];
    const match = args[0];
    if (comment) return match;
    if (url) return rewriteUrl(url, baseUrl, file);
    if (rgbProp) {
      const [r, g, b] = rgbVal.split(',').map((x) => +x.trim());
      const p = pick({ r, g, b, a: 1 }, ctxFromName(rgbProp.split(':')[0].trim().replace(/-rgb$/, '')));
      tally(file, 'replaced');
      return `${rgbProp}var(--clr-${p.tok}-rgb)`;
    }
    const prop = propAt(text, offset, mode);
    if (!prop || !COLOUR_PROP.test(prop)) {
      tally(file, 'skipped');
      if (stats.skipped.length < 400) stats.skipped.push(`${file}: ${match} (prop ${prop ?? '—'})`);
      return match;
    }
    const c = parseColour(colour);
    if (!c) return match;
    const p = pick(c, ctxFor(prop), mode === 'css' && inStateRule(text, offset));
    const out = cssOf(p);
    tally(file, 'replaced');
    stats.tokens[p.tok] = (stats.tokens[p.tok] ?? 0) + 1;
    const key = `${colour.toLowerCase().replace(/\s+/g, '')} [${ctxFor(prop) ?? 'value'}]`;
    (stats.map[key] ??= {})[out] = ((stats.map[key] ?? {})[out] ?? 0) + 1;
    return out;
  });
  return typeIn(fixPairsIn(result, mode), mode);
}

/* ------------------------------------------------------------- typography */

/*
 * STEP 3: one type scale. Every font-size the site writes (px, rem, the small
 * em values, clamp(), Bootstrap's calc(…vw)) resolves to the nearest step,
 * written as a --text-* variable. The large steps shrink on small screens in
 * globals.css, so a size is on the scale at every width. Weights collapse to
 * 400 / 500 / 600 / 700, and every uppercase rule gets one letter-spacing.
 */
const SCALE = [12, 14, 16, 18, 20, 24, 30, 36, 48];
const STEP = { 12: 'xs', 14: 'sm', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl', 30: '3xl', 36: '4xl', 48: '5xl' };
const SIZE_KEYWORD = { 'xx-small': 9, 'x-small': 10, small: 13, medium: 16, large: 18, 'x-large': 24, 'xx-large': 32 };

/** px for one length; em only below 1em (a "smaller" size); ≥1em stays relative. */
function lengthPx(v) {
  const m = v.trim().toLowerCase().match(/^([+-]?[\d.]+)(px|rem|em|vw)$/);
  if (!m) return null;
  const n = +m[1];
  if (m[2] === 'px') return n;
  if (m[2] === 'rem') return n * 16;
  if (m[2] === 'vw') return n * 12.8;               // measured at 1280px
  return n < 1 ? n * 16 : null;
}

function sizeStep(value) {
  const v = value.trim().toLowerCase();
  if (!v || v.includes('var(') || v.includes('$')) return null;
  let px = null;
  if (SIZE_KEYWORD[v]) px = SIZE_KEYWORD[v];
  else if (v.startsWith('clamp(')) px = lengthPx(v.slice(6, -1).split(',').pop());   // the largest
  else if (v.startsWith('calc(')) {
    const terms = v.slice(5, -1).match(/[+-]?\s*[\d.]+(?:px|rem|em|vw)/g) ?? [];
    px = terms.reduce((sum, t) => sum + (lengthPx(t.replace(/\s+/g, '')) ?? NaN), 0);
    if (!Number.isFinite(px)) px = null;
  } else px = lengthPx(v);
  if (px == null || px <= 0) return null;
  let best = SCALE[0];
  for (const s of SCALE) if (Math.abs(s - px) <= Math.abs(best - px)) best = s;   // ties go up
  return best;
}

export const typeStats = { sizes: {}, weights: {}, caps: 0 };
const bump = (o, k) => { o[k] = (o[k] ?? 0) + 1; };

function fixCaps(block, kind) {
  if (!/text-transform\s*:\s*uppercase/i.test(block)) return block;
  typeStats.caps += 1;
  if (/letter-spacing\s*:/i.test(block)) return block.replace(/(letter-spacing\s*:\s*)[^;"'}!]+/gi, '$1var(--ls-caps)');
  if (kind === 'block') return block.replace(/;?\s*\}$/, ';letter-spacing:var(--ls-caps)}');
  if (kind === 'attr') return block.replace(/;?\s*(["'])$/, '; letter-spacing: var(--ls-caps)$1');
  return block.replace(/;?\s*$/, '; letter-spacing: var(--ls-caps)');
}

function typeIn(text, mode) {
  let out = text.replace(/(font-size\s*:\s*)([^;"'`}{!]+?)(\s*(?:!important)?\s*)(?=[;"'`}]|$)/gim, (m, pre, val, post) => {
    const step = sizeStep(val);
    if (!step) return m;
    bump(typeStats.sizes, `${val.trim()} → ${step}px`);
    return `${pre}var(--text-${STEP[step]})${post}`;
  });
  out = out.replace(/((?<![\w-])font-weight\s*:\s*)(bold|bolder|lighter|normal|\d{3})\b/gi, (m, pre, w) => {
    const n = { bold: 700, bolder: 700, lighter: 400, normal: 400 }[w.toLowerCase()] ?? +w;
    const to = n <= 400 ? 400 : n >= 700 ? 700 : n;
    if (String(to) !== w) bump(typeStats.weights, `${w} → ${to}`);
    return pre + to;
  });
  if (mode === 'decl') return fixCaps(out, 'decl');
  if (mode === 'css') return out.replace(/\{[^{}]*\}/g, (b) => fixCaps(b, 'block'));
  return out.replace(/style\s*=\s*"[^"]*"|style\s*=\s*'[^']*'/g, (s) => fixCaps(s, 'attr'));
}

/**
 * Text on a solid accent or WhatsApp-green fill always takes the dark "on"
 * colour: light text on those fills fails AA (1.75:1 on the green). Applied
 * wherever the fill and the text colour are declared together.
 */
function fixPairs(body) {
  const bg = body.match(/background(?:-color|-image)?\s*:[^;]*?var\(--clr-(success|success-hover|accent|accent-hover)\)/);
  if (!bg) return body;
  const on = bg[1].startsWith('success') ? 'on-success' : 'on-accent';
  return body.replace(/((?:^|[;{\s"'])color\s*:\s*)var\(--clr-(heading|text|muted|brand-tint)\)/g, `$1var(--clr-${on})`);
}

function fixPairsIn(text, mode) {
  if (mode === 'decl') return fixPairs(text);
  if (mode === 'css') return text.replace(/\{[^{}]*\}/g, fixPairs);
  // scripts: only inside style attributes they build (JS blocks are not CSS rules)
  return text.replace(/style\s*=\s*"[^"]*"|style\s*=\s*'[^']*'/g, fixPairs);
}

/** Colours inside data: URIs become literal palette values (var() can't reach there). */
function rewriteUrl(url, baseUrl, file) {
  const inner = url.replace(/^url\(\s*/, '').replace(/\s*\)$/, '');
  const bare = inner.replace(/^["']|["']$/g, '');
  if (/^data:/i.test(bare)) {
    return url.replace(/(%23|#)([0-9a-fA-F]{3,8})\b|rgba?\([^()]*\)/g, (m, pfx, hex) => {
      const c = parseColour(pfx ? `#${hex}` : m);
      if (!c) return m;
      stats.dataUri += 1;
      tally(file, 'replaced');
      return literalOf(pick(c, 'text'), pfx);
    });
  }
  // relative asset path: resolve against the original file's location
  if (baseUrl && bare && !/^(\/|https?:|#|about:)/i.test(bare)) {
    const q = inner.match(/^["']/)?.[0] ?? '';
    return `url(${q}${posix.normalize(posix.join(posix.dirname(baseUrl), bare))}${q})`;
  }
  return url;
}

/** Page markup: <style> blocks and style="" attributes only — never prose. */
export function transformHtml(html, file) {
  return html
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, a, css, b) => a + transform(css, 'css', file) + b)
    .replace(/(\sstyle\s*=\s*)(["'])([\s\S]*?)\2/gi, (m, pre, q, decls) => pre + q + transform(decls, 'decl', file) + q);
}

/* ------------------------------------------------- navbar current page */

const SECTION = [
  [/^\/$/, (text, href) => href === '/'],
  [/^\/who-we-are$/, (text, href) => href === '/who-we-are'],
  [/^\/services\//, (text) => text === 'Services'],
  [/^\/fleet(\/|$)/, (text) => text === 'Vehicles'],
  [/^\/ziyarat-guide(\/|$)/, (text, href) => href === '/ziyarat-guide'],
];

/** Marks the navbar link for the section `route` belongs to. */
export function markCurrent(html, route) {
  const rule = SECTION.find(([re]) => re.test(route));
  return html.replace(/<nav\b[\s\S]*?<\/nav>/i, (nav) => nav
    .replace(/<a class="nav-link([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (m, cls, attrs, inner) => {
      const href = attrs.match(/href="([^"]*)"/)?.[1] ?? '';
      const text = inner.replace(/<[^>]+>/g, '').trim();
      if (!rule || !rule[1](text, href)) return m;
      const current = href === route ? ' aria-current="page"' : '';
      return `<a class="nav-link${cls} active"${attrs}${current}>${inner}</a>`;
    })
    .replace(/<a class="dropdown-item([^"]*)" href="([^"]*)"/g, (m, cls, href) =>
      href === route ? `${m} aria-current="page"` : m));
}

/**
 * A book icon beside the menu button, linking to the Ziyarat guide.
 *
 * Shown where the menu button is (under 992px); on desktop the guide already
 * has its own item in the menu.
 */
export function addGuideIcon(html) {
  return html.replace(/<button class="navbar-toggler"/,
    '<a class="nav-guide-btn d-lg-none" href="/ziyarat-guide" aria-label="Ziyarat Guide" title="Ziyarat Guide">'
    + '<i class="fas fa-book-open" aria-hidden="true"></i></a>'
    + '<button class="navbar-toggler"');
}

/**
 * Vehicle Categories: give the four cards a width on phones.
 *
 * Their wrappers are `col-md-6 col-lg-3` with no base class. Bootstrap only
 * defines a width from the named breakpoint up, so below 768px these divs have
 * no width rule at all and, as flex children of .row, shrink to fit their own
 * titles: the four cards came out 215, 246, 161 and 158px wide in a 390px
 * viewport, wrapping into a ragged two-and-two.
 *
 * Adding the base col-12 is what the markup meant to say. Only wrappers that
 * have no base width are touched, and only the ones holding a category card.
 */
export function categoryGrid(html) {
  // A base width, not a breakpoint one: col-12 is what the markup meant.
  const hasBase = /\bcol(-(\d+|auto))?(\s|$)/;
  return html.replace(
    /<div class="([^"]*)">(\s*<a href="[^"]*" class="vehicle-cat-card">)/g,
    (m, cls, rest) => (hasBase.test(cls) ? m : `<div class="col-12 ${cls.trim()}">${rest}`),
  );
}

/**
 * "Vehicles Suited for Every Group Size" shows the vehicle, not a generic icon.
 *
 * Every card carried a Font Awesome glyph, and the same van glyph stood for
 * both the Staria and the Hiace. The site already ships a photograph of each
 * vehicle — the one that vehicle's own page leads with — so the card uses it.
 *
 * The VIP 50-seater keeps its icon: there is no photograph of one anywhere in
 * the project. The three files the fleet gallery labels "VIP Bus" are each a
 * picture of a Hiace, and a van shown under "VIP Bus (50-Seater)" would
 * misdescribe what the guest is booking.
 */
const FLEET_PHOTO = {
  'Toyota Camry': '/uploads/vehicles/1752554098_camry2025-2.png',
  'Hyundai Sonata': '/uploads/vehicles/1752554133_sonata2025-2.png',
  'GMC Yukon XL': '/uploads/vehicles/1752554276_gmc2025-2.png',
  'Hyundai Staria': '/uploads/vehicles/1752554248_hyundaistaria2025-2.png',
  'Toyota Hiace': '/uploads/vehicles/1752554415_Hiace 2025-2.png',
  'Coaster Minibus': '/uploads/vehicles/1752554405_Coaster2025-2.png',
};

export const fleetPhotoLog = [];

export function fleetPhotos(html) {
  return html.replace(
    /(<i class="fas fa-[a-z-]+"[^>]*><\/i>)(\s*)<h5([^>]*)>([^<]+)<\/h5>/g,
    (m, icon, gap, attrs, name) => {
      const key = name.trim();
      const known = key in FLEET_PHOTO;
      if (!known && !key.startsWith('VIP Bus')) return m;   // not a fleet card
      const heading = `<h5${attrs}>${name}</h5>`;
      if (!known) {
        fleetPhotoLog.push(`${key}: no photograph in the project, icon kept`);
        // the icon keeps a photo-sized box, so the cards stay aligned
        return `<span class="fleet-photo fleet-photo--none">${icon}</span>${gap}${heading}`;
      }
      const src = FLEET_PHOTO[key];
      fleetPhotoLog.push(`${key}: ${src.split('/').pop()}`);
      return `<img class="fleet-photo" src="${encodeURI(src)}" alt="${key}"`
        + ` width="200" height="100" loading="lazy" decoding="async">${gap}${heading}`;
    },
  );
}

/* ------------------------------------------------------- garbled characters */

/**
 * The original site's text was saved as UTF-8 and then read back as
 * Windows-1252, so "–" shows as "â€“", "’" as "â€™", "×" as "Ã—". That is
 * exactly reversible: a mojibake sequence is a UTF-8 lead byte followed by
 * continuation bytes, each shown as its Windows-1252 character. Map those
 * characters back to their bytes and decode the bytes as UTF-8. A match that
 * does not decode as valid UTF-8 is left alone, so real accented text (é, ñ,
 * ã) and all Arabic/Urdu text are untouched.
 */
const CP1252_HIGH = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const byteOf = (ch) => {
  const c = ch.codePointAt(0);
  if (c >= 0xa0 && c <= 0xff) return c;
  const i = CP1252_HIGH.indexOf(ch);
  return i >= 0 ? 0x80 + i : c <= 0x9f && c >= 0x80 ? c : -1;
};
const CONT = `[\\u0080-\\u00BF${CP1252_HIGH}]`;
const MOJIBAKE = new RegExp(`[\\u00C2-\\u00DF]${CONT}|[\\u00E0-\\u00EF]${CONT}{2}|[\\u00F0-\\u00F4]${CONT}{3}`, 'g');
const utf8 = new TextDecoder('utf-8', { fatal: true });

export const mojibakeFixes = {};
export function fixMojibake(text, where = '') {
  if (typeof text !== 'string') return text;
  let out = text;
  for (let pass = 0; pass < 3; pass++) {        // some text was double-garbled
    const next = out.replace(MOJIBAKE, (m) => {
      const bytes = [...m].map(byteOf);
      if (bytes.some((b) => b < 0)) return m;
      try {
        const fixed = utf8.decode(Uint8Array.from(bytes));
        const k = `${m} → ${fixed}`;
        (mojibakeFixes[k] ??= new Set()).add(where);
        return fixed;
      } catch {
        return m;
      }
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

const ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', '#39': "'", '#039': "'" };
/** One level of HTML-entity decoding, for plain-text metadata only. */
const decodeEntities = (s) => s.replace(/&(amp|quot|apos|lt|gt|#0?39);/g, (m, e) => ENTITIES[e] ?? m);

/* ------------------------------------------------------------ navbar logo */

/**
 * The logo was lazy-loaded with `width: auto`, so until it arrived it was 0px
 * wide and the brand text jumped sideways. It is the first thing on every page:
 * load it at once, in a fixed 48 × 48 box (the file is square).
 */
export function fixLogo(html) {
  return html.replace(/(<img src="\/img\/LOGO\.png"[^>]*?)\sloading="lazy"/,
    '$1 loading="eager" fetchpriority="high" width="48" height="48"');
}


/* ------------------------------------------------------- home hero edits */

// Requested by the client: the hero's select buttons go straight to WhatsApp,
// and the tabs' intro lines are removed (only their last word — "Arabia:",
// "group:" — was showing). The message carries the trip type of the tab.
const HERO_TRIP = {
  'open-service-modal-btn': 'Single Trip',
  'open-bundle-modal-btn': 'Umrah Package',
  'open-other-service-modal-btn': 'Ziyarat & Tours',
};

export function heroEdits(html) {
  html = html.replace(/(<div class="tab-pane[^"]*" id="nav-(?:single-trip|bundle|other)">\s*)<p[^>]*>[^<]*<\/p>\s*/g, '$1');
  for (const [id, trip] of Object.entries(HERO_TRIP)) {
    html = html.replace(new RegExp(`<button class="btn fw-bold" id="${id}" style="([^"]*)">([\\s\\S]*?)</button>`), (m, style, inner) => {
      const label = inner.replace(/<i class="[^"]*"><\/i>/, '').trim();
      const opts = { type: 'booking', extra: { trip }, url: pageUrl('/') };
      logWa('/', label, opts);
      const link = `<a class="btn fw-bold" data-wa="booking" href="${waLink(opts)}" target="_blank" rel="noopener" style="${style}"><i class="fab fa-whatsapp me-2"></i> ${label}</a>`;
      // the original button stays, hidden: the tab's route pills still "click"
      // it to open the packages pop-up, as before
      return `${link}<button type="button" id="${id}" hidden aria-hidden="true"></button>`;
    });
  }
  return html;
}

/* --------------------------------------------------------- WhatsApp links */

// Phase 1: every WhatsApp button gets its link from lib/whatsapp.mjs. The
// build rewrites each one in the markup; the type and name come from where
// the button sits (the page, its label, its card).
export const waLog = [];
function logWa(page, label, opts) {
  waLog.push({ page, label, type: opts.type, message: waMessage(opts) });
}

const textOf = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const VEHICLE = Object.fromEntries(
  [...(await readFile('data/vehicles.ts', 'utf8')).matchAll(/slug: "([^"]+)"[\s\S]*?name: "([^"]+)"[\s\S]*?passengers: (\d+|null),\s*largeBags: (\d+|null)/g)]
    .map((m) => [m[1], { name: m[2], passengers: m[3] === 'null' ? null : +m[3], bags: m[4] === 'null' ? null : +m[4] }]));

function classify({ route, cls, label, oldMsg, ctx, before, pageTitle }) {
  if (/(^|\s)(service-page-direct-book|whatsapp-button)(\s|$)/.test(cls) && pageTitle) return { type: 'service', name: pageTitle };
  if (/^Hello! I want to book a Taxi/i.test(oldMsg)) {
    const parts = label.split(/\s+to\s+/i);
    return parts.length === 2 ? { type: 'route', name: label, extra: { from: parts[0], to: parts[1] } } : { type: 'route', name: label };
  }
  if (/^Book Package \d+/i.test(label)) {
    const card = before.slice(Math.max(0, before.lastIndexOf('<h5')));
    const legs = [...card.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => textOf(m[1])).filter(Boolean);
    return { type: 'package', name: label.replace(/^Book\s+/i, ''), extra: { legs } };
  }
  if (/travel agent/i.test(oldMsg) || /\bB2B\b/.test(label)) return { type: 'b2b' };
  if (route === '/fleet' && /^Book via WhatsApp$/i.test(label)) {
    return { type: 'fleet', name: oldMsg.replace(/^Hello! I want to book\s+/i, '').trim() || ctx };   // the photo caption
  }
  if (route === '/who-we-are' && /^Book\s/i.test(label) && ctx) return { type: 'fleet', name: ctx };
  if (/want to (contact|inquire about)/i.test(oldMsg) && ctx) return { type: 'general', name: ctx };
  if (route === '/' && /^Book on WhatsApp$/i.test(label) && ctx) return { type: 'service', name: ctx };
  return { type: 'general' };
}

/** Rewrites every WhatsApp link in a piece of markup through waLink(). */
export function whatsappIn(html, route) {
  const pageTitle = textOf((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1] ?? '');
  return html.replace(/<a\b([^>]*?)href="(https:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (m, pre, href, post, inner, offset, whole) => {
      const attrs = pre + post;
      const cls = (attrs.match(/class="([^"]*)"/) ?? [])[1] ?? '';
      let oldMsg = '';
      try { oldMsg = new URL(href.replace(/&amp;/g, '&')).searchParams.get('text') ?? ''; } catch { /* keep empty */ }
      const before = whole.slice(Math.max(0, offset - 3000), offset);
      const heads = [...before.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
      const ctx = heads.length ? textOf(heads[heads.length - 1][1]) : '';
      const opts = { ...classify({ route, cls, label: textOf(inner), oldMsg, ctx, before, pageTitle }), url: pageUrl(route) };
      logWa(route, textOf(inner) || `(icon${cls ? ` .${cls.split(/\s+/)[0]}` : ''})`, opts);
      return `<a${pre}data-wa="${opts.type}" href="${waLink(opts)}"${post}>${inner}</a>`;
    });
}

/** Vehicle pages: "Book This Vehicle" went to /book-now; it now books that vehicle on WhatsApp. */
export function vehicleButton(html, route) {
  const v = VEHICLE[route.match(/^\/fleet\/(.+)$/)?.[1]];
  if (!v) return html;
  return html.replace(/<a href="\/book-now" class="btn btn-primary mt-3">Book This Vehicle<\/a>/, () => {
    const opts = { type: 'vehicle', name: v.name, extra: { passengers: v.passengers, bags: v.bags }, url: pageUrl(route) };
    logWa(route, 'Book This Vehicle', opts);
    return `<a data-wa="vehicle" href="${waLink(opts)}" target="_blank" rel="noopener" class="btn btn-primary mt-3"><i class="fab fa-whatsapp me-2"></i>Book This Vehicle</a>`;
  });
}

// The chat widget's links, by the message they used to send.
const CHAT_LINK = {
  'Hello! I want to book transport service.': { type: 'general' },
  'I want to book Makkah to Madinah transport': { type: 'route', extra: { from: 'Makkah', to: 'Madinah' } },
  'I need Jeddah Airport Pickup': { type: 'service', name: 'a Jeddah Airport pickup' },
  'I want to book a Ziyarat Tour': { type: 'service', name: 'a Ziyarat tour' },
  'Assalamu Alaikum, I would like a fare for my journey.': { type: 'quote' },
};

/**
 * The scripts that build WhatsApp links at click time call window.waLink()
 * instead. Every patch must apply — if the original changes, the build stops
 * rather than silently shipping a hand-written link.
 */
function patchWhatsApp(url, text) {
  const file = url.split('/').pop();
  const must = (re, to) => {
    if (!re.test(text)) throw new Error(`WhatsApp patch did not apply in ${url}: ${re}`);
    text = text.replace(re, to);
  };
  if (file === 'booking_engine.js') {
    must(/let text = `\*NEW UMRAH TRANSPORT BOOKING\*[\s\S]*?window\.open\(`https:\/\/wa\.me\/\d+\?text=\$\{encodedText\}`, '_blank'\);/,
      `const given = (v, empty) => (v === empty ? '' : v);
        // everything the visitor selected, through the site's one WhatsApp helper
        window.open(window.waLink({ type: 'booking', extra: {
            trip: BOOKING_DATA.categories[service.cat] || 'Transport',
            route: service.name,
            vehicle: \`\${vehicle.name} (\${vehicle.pax})\`,
            price: \`\${state.calculatedPrice} SAR\`,
            date: \`\${pickupDate} \${pickupTime}\`.trim(),
            pickup: given(pickupLoc, 'Not specified'),
            dropoff: service.dropoff !== false ? given(dropoffLoc, 'Not specified') : '',
            flight: service.flight ? given(flightNum, 'N/A') : '',
            passengers: pax,
            name: given(name, 'Valued Guest'),
        } }), '_blank');`);
    must(/window\.open\('https:\/\/wa\.me\/\d+\?text=[^']*', '_blank'\);/, "window.open(window.waLink({ type: 'general' }), '_blank');");
  } else if (file === 'ai_agent.js') {
    must(/href="https:\/\/wa\.me\/\d+(?:\?text=([^"]*))?"/, (m) => m);   // at least one
    text = text.replace(/href="https:\/\/wa\.me\/\d+(?:\?text=([^"]*))?"/g, (m, t) => {
      const opts = CHAT_LINK[t ? decodeURIComponent(t) : ''] ?? { type: 'general' };
      logWa('(chat widget)', t ? decodeURIComponent(t) : 'Open WhatsApp Chat', { ...opts, url: `${pageUrl('/')}…` });
      return `href="\${window.waLink(${JSON.stringify(opts)})}"`;
    });
  } else if (/^s-(7c443d69af0d|3deba3ac234e)\.js$/.test(file)) {
    must(/const message = `Hello AL HARMAIN UMRAH TRANSPORT![\s\S]*?`;\s*const waUrl = `https:\/\/wa\.me\/\d+\?text=\$\{encodeURIComponent\(message\)\}`;/,
      `const given = (v) => (v === 'Not specified' ? '' : v);
            const waUrl = window.waLink({ type: 'booking', extra: { vehicle: vehicle.name, pickup: given(pickup), dropoff: given(drop), date: given(date), passengers: pax } });`);
  }
  if (/wa\.me\//.test(text)) throw new Error(`hand-written wa.me link left in ${url}`);
  return text;
}

/**
 * /book-now had no h1 at all — its own heading, "Our Transport Services", was
 * marked up as an h3. A page with no h1 tells a crawler nothing about what it
 * is, so the heading is promoted. The `h3` class keeps it exactly the size it
 * was: globals.css marks both rules !important, and a class outranks an
 * element selector, so nothing moves on screen.
 */
export function bookNowHeading(html) {
  return html.replace(
    /<h3([^>]*)>(\s*Our Transport Services\s*)<\/h3>/i,
    (m, attrs, text) => `<h1${attrs} class="h3">${text}</h1>`,
  );
}

/**
 * The FAQ page's questions, in the form Google reads.
 *
 * They are lifted from the page's own accordion, so the structured data and
 * the visible text cannot disagree — which is what Google requires of FAQ
 * markup, and what gets a site penalised when it is done any other way.
 */
export function extractFaq(html) {
  const pairs = [];
  const re = /<button[^>]*accordion-button[^>]*>([\s\S]*?)<\/button>[\s\S]{0,400}?<div[^>]*accordion-body[^>]*>([\s\S]*?)<\/div>/gi;
  for (const m of html.matchAll(re)) {
    const q = plainText(m[1]);
    const a = plainText(m[2]);
    if (q && a) pairs.push({ q, a });
  }
  return pairs;
}

/**
 * Three links in the original point at pages that do not exist here.
 *
 *  - the footer's "Contact Us" went to /contact on all 57 pages. That page now
 *    exists (app/contact), so the link is left alone and simply works.
 *  - the cart drawer's "Checkout" went to /checkout, which was never built and
 *    which no script handles: a dead end on 29 pages. Every booking on this
 *    site is completed on WhatsApp, so that is where it goes.
 *  - the blog's three "Read More" links went to post.php?slug=…, the original's
 *    PHP page. The articles themselves were never part of the export, but the
 *    Ziyarat guide covers those exact three subjects in depth, so each card
 *    points at the matching chapter rather than at nothing.
 */
const BLOG_CHAPTER = [
  ['makkah', '#makkah'],
  ['madinah', '#madinah'],
  ['taif', '#taif'],
];

export function deadLinks(html) {
  html = html.replace(/href="\/checkout"/g, `href="${waLink({ type: 'general', url: pageUrl('/book-now') })}" target="_blank" rel="noopener"`);
  html = html.replace(/href="post\.php\?slug=([^"]*)"/g, (m, slug) => {
    const hit = BLOG_CHAPTER.find(([word]) => slug.includes(word));
    return `href="/ziyarat-guide/en${hit ? hit[1] : ''}"`;
  });
  return html;
}

/* ------------------------------------------------------------------ email */

/**
 * One address, everywhere.
 *
 * The export carried two, neither of them right: alharmaintransportksa@gmail.com
 * in 186 places (footer, contact blocks, every page) and
 * info@ALHARMAINTRANSPORT.com in one (the chat agent). Mail sent to either was
 * going nowhere the company reads, so every enquiry by email was being lost.
 *
 * Rewritten at build time rather than in the source, for the same reason the
 * WhatsApp links are: one place decides, and re-exporting the original site
 * cannot quietly reintroduce the old address.
 */
const OLD_EMAILS = [
  'alharmaintransportksa@gmail.com',
  'info@alharmaintransport.com',
];

export let emailCount = 0;

export function emailIn(text) {
  if (typeof text !== 'string') return text;
  for (const old of OLD_EMAILS) {
    // case-insensitive: the agent wrote its copy in capitals
    const re = new RegExp(old.split('.').join('[.]'), 'gi');
    text = text.replace(re, () => { emailCount += 1; return EMAIL; });
  }
  return text;
}

/* ---------------------------------------------------------------- licence */

/**
 * The operating licence, in the footer of every page.
 *
 * The site claims to be "Licensed & Insured" but never showed the number. For
 * a Saudi transport operator that number is the thing a careful guest checks
 * before handing over a family's travel, so it belongs where the other contact
 * details already are — the footer's "Get in Touch" column — and not buried.
 */
export function licenceIn(html) {
  const item = `<li><i class="fas fa-id-card"></i> Licence: <span dir="ltr">${LICENCE}</span></li>`;
  // after the email, the last item in that column
  return html.replace(
    /(<li><i class="fas fa-envelope"><\/i><a href="mailto:[^<]*<\/a><\/li>)/,
    (m) => m + item,
  );
}

/* -------------------------------------------------------- image dimensions */

/**
 * width and height on every local <img>, so the browser reserves the right box
 * before the bytes arrive.
 *
 * 46 of the 47 images on the home page carried neither, so every one of them
 * resized the page as it loaded — the layout shift that Core Web Vitals
 * measures. The values are each file's true intrinsic size, so nothing moves:
 * an attribute that matches the natural size cannot change how the image
 * renders, it only lets the browser hold the space.
 *
 * Filled from a scan done once per build (imageSizes), not per page.
 */
export const imageSizes = new Map();

export function addImageDims(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\bwidth=/i.test(tag) || /\bheight=/i.test(tag)) return tag;
    const src = (tag.match(/\bsrc="([^"]+)"/i) || [])[1];
    if (!src || /^(https?:|data:)/i.test(src)) return tag;          // not ours to measure
    const size = imageSizes.get(decodeURIComponent(src.replace(/^\//, '')));
    if (!size) return tag;
    return tag.replace(/<img\b/i, `<img width="${size.w}" height="${size.h}"`);
  });
}

/* --------------------------------------------------------------------- SEO */

/**
 * A title and a description of its own for every page.
 *
 * The original ships ONE 247-character description on all 46 pages — the same
 * sentence for the Camry, the refund policy and every route — and bare titles
 * like "Toyota Camry" carrying no brand. Google drops duplicate descriptions
 * and writes its own snippet, so every page was throwing its snippet away.
 *
 * Nothing here is invented. The description is the page's own opening
 * paragraph, trimmed to fit a search result; a page whose lead is very short
 * gets one factual clause about the company added, with no claim or number in
 * it. The title is the page's own name plus the brand.
 */
const STOCK_DESC = /^AL HARMAIN UMRAH TRANSPORT provides premium, reliable, and comfortable/i;
const BRAND = 'AL HARMAIN UMRAH TRANSPORT';
const BRAND_CLAUSE = ' Al Harmain Umrah Transport — private Hajj and Umrah transfers across Makkah, Madinah, Jeddah and Taif.';

const plainText = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

/** Trim to a whole word, never past `max`. */
function clampText(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[ ,;:.—-]+$/, '') + '…';
}
/** Text that appears in the header, footer or cart drawer — that is, on every
 *  page. A description taken from there would be shared by all of them, which
 *  is the duplicate this whole step exists to remove. */
export const chromeText = new Set();

export function collectChromeText(chrome) {
  for (const html of Object.values(chrome)) {
    for (const m of String(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
      const t = plainText(m[1]);
      if (t) chromeText.add(t);
    }
  }
}

/**
 * Two pages carry no prose of their own — one is a filterable list, the other
 * is all accordions — so there is no paragraph to lift. These say what the
 * page holds, taken from its own section headings.
 */
const DESCRIPTION = {
  '/book-now': 'Browse Al Harmain Umrah Transport services by category and city, open the details of any trip, choose your vehicle and confirm it on WhatsApp.',
  '/customer-faqs': 'Answers on bookings and reservations, payments and pricing, service and vehicles, and the customer terms for Al Harmain Umrah Transport.',
};

export const seoLog = [];

export function seoMeta(data) {
  const was = { title: data.title, description: data.description };

  // "Book Transport | MCOM" — MCOM is the template the original was built from
  let title = (data.title || '').replace(/\s*\|\s*MCOM\s*$/i, '').trim();
  if (title && !/AL HARMAIN/i.test(title)) {
    const full = `${title} | ${BRAND}`;
    title = full.length <= 60 ? full : `${title} | Al Harmain`;
  }
  // A title the original already branded can still overrun what a result
  // shows; the short form of the name buys 16 characters back.
  if (title.length > 60 && title.includes(BRAND)) {
    title = title.replace(`| ${BRAND}`, '| Al Harmain').replace(BRAND, 'Al Harmain');
  }
  if (title) data.title = title;

  if (DESCRIPTION[data.route]) {
    data.description = DESCRIPTION[data.route];
  } else if (!data.description || STOCK_DESC.test(data.description)) {
    // The stock sentence is a fair description of the business itself, so the
    // home page keeps it (trimmed); it is only its use on all 46 pages that
    // was the problem.
    const company = STOCK_DESC.test(data.description || '') ? data.description : '';
    // A real sentence beats a sub-heading that happens to sit in a <p>, so a
    // substantial paragraph wins when the page has one.
    // The footer is on every page, so a paragraph taken from it would be
    // shared by every page — exactly the duplicate this is fixing.
    const paras = [...String(data.body).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => plainText(m[1]))
      .filter((t) => t.length > 45 && !chromeText.has(t));
    const lead = paras.find((t) => t.length >= 90) || paras[0];
    // A lead that only tells the visitor how to work the page describes
    // nothing to a searcher; the company sentence serves them better.
    const isUi = lead && /^(find|start by|filter|choose|select|click|use the)\b/i.test(lead);
    const chosen = data.route === '/' || !lead || isUi ? (company || lead) : lead;
    if (chosen) data.description = clampText(chosen.length < 90 ? chosen + BRAND_CLAUSE : chosen, 158);
  } else {
    data.description = clampText(data.description, 158);
  }

  seoLog.push({
    route: data.route,
    title: data.title,
    titleLen: (data.title || '').length,
    description: data.description,
    descLen: (data.description || '').length,
    rewritten: was.title !== data.title || was.description !== data.description,
  });
}

/* ----------------------------------------------------------------- run */

async function write(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

async function main() {
  // stylesheets: [source, published url of the original]
  const sheets = [
    ['public/vendor/bootstrap.min.css', '/vendor/bootstrap.min.css'],
    ['public/vendor/lightbox/lightbox.min.css', '/vendor/lightbox/lightbox.min.css'],
    ['public/includes/dynamic_styles.css', '/includes/dynamic_styles.css'],
    ['public/assets/css/style.css', '/assets/css/style.css'],
  ];
  for (const [src, url] of sheets) {
    await write(join('public/polish', url), transform(await readFile(src, 'utf8'), 'css', url, url));
  }

  // scripts that inject styles
  const scripts = [
    ...(await readdir('public/assets/js')).filter((f) => f.endsWith('.js')).map((f) => `/assets/js/${f}`),
    ...(await readdir('public/page-js')).filter((f) => f.endsWith('.js')).map((f) => `/page-js/${f}`),
  ];
  for (const url of scripts) {
    await write(join('public/polish', url), emailIn(patchWhatsApp(url, transform(fixMojibake(await readFile(join('public', url), 'utf8'), url), 'js', url))));
  }

  // measure every image once, so addImageDims can stamp width/height
  {
    const { default: sharp } = await import('sharp');
    const walkImages = async (dir) => {
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) { await walkImages(p); continue; }
        if (!/\.(png|jpe?g|gif|webp|avif)$/i.test(e.name)) continue;
        try {
          const { width, height } = await sharp(p).metadata();
          if (width && height) {
            imageSizes.set(relative('public', p).split(sep).join('/'), { w: width, h: height });
          }
        } catch { /* unreadable image: leave it without dimensions */ }
      }
    };
    await walkImages('public');
    console.log(`images measured: ${imageSizes.size}`);
  }

  // page markup
  await mkdir('content-polish', { recursive: true });
  for (const f of await readdir('content')) {
    if (!f.endsWith('.json')) continue;
    const data = JSON.parse(await readFile(join('content', f), 'utf8'));
    if (f === '_chrome.json') {
      for (const k of Object.keys(data)) data[k] = transformHtml(fixMojibake(data[k], `chrome.${k}`), `chrome.${k}`);
      data.nav = addGuideIcon(fixLogo(markCurrent(data.nav, '/ziyarat-guide'))); // the chrome is only used by the guide
      // WhatsApp links are marked data-wa; SiteChrome re-points them at each guide page
      for (const k of Object.keys(data)) data[k] = whatsappIn(data[k], '/ziyarat-guide');
      for (const k of Object.keys(data)) data[k] = licenceIn(emailIn(deadLinks(addImageDims(data[k]))));
      collectChromeText(data);
    } else if (typeof data.body === 'string') {
      // metadata is plain text: repair it, and undo the one extra level of
      // escaping four titles carry (the tab showed "Ziyarat &amp; Return")
      for (const k of ['title', 'description', 'keywords']) {
        if (typeof data[k] === 'string') data[k] = decodeEntities(fixMojibake(data[k], `${data.route} ${k}`));
      }
      data.body = addGuideIcon(fixLogo(markCurrent(transformHtml(fixMojibake(data.body, data.route), data.route), data.route)));
      data.body = vehicleButton(whatsappIn(data.body, data.route), data.route);
      if (data.route === '/') data.body = heroEdits(categoryGrid(data.body));
      if (data.route === '/who-we-are') data.body = fleetPhotos(data.body);
      if (data.route === '/book-now') data.body = bookNowHeading(data.body);
      if (data.route === '/customer-faqs') data.faq = extractFaq(data.body);
      data.body = licenceIn(emailIn(deadLinks(addImageDims(data.body))));
      seoMeta(data);   // a title and description of its own, from the page's own words
    }
    await write(join('content-polish', f), JSON.stringify(data));
  }

  // the guide's own stylesheet is ours: rewritten in place
  const guide = await readFile('app/guide.css', 'utf8');
  await writeFile('app/guide.css', transform(guide, 'css', 'app/guide.css'));

  // the browser copy of the one WhatsApp helper, generated from lib/whatsapp.mjs
  const helper = await readFile('lib/whatsapp.mjs', 'utf8');
  await write('public/polish/wa.js', `/* Generated by _polish.mjs from lib/whatsapp.mjs — edit that file, not this one. */\n(function () {\n${helper.replace(/^export /gm, '')}\nwindow.waLink = waLink;\nwindow.waMessage = waMessage;\n})();\n`);
  await write('_polish/whatsapp.json', JSON.stringify(waLog, null, 1));
  const byType = waLog.reduce((o, e) => ((o[e.type] = (o[e.type] ?? 0) + 1), o), {});
  console.log(`whatsapp: ${waLog.length} links written by waLink() — ${Object.entries(byType).map(([k, n]) => `${k} ${n}`).join(', ')}`);

  await write('_polish/report.json', JSON.stringify(stats, null, 1));
  await write('_polish/mojibake.json', JSON.stringify(
    Object.fromEntries(Object.entries(mojibakeFixes).map(([k, s]) => [k, [...s].sort()])), null, 1));
  await write('_polish/type.json', JSON.stringify(typeStats, null, 1));
  console.log(`type: ${Object.values(typeStats.sizes).reduce((a, b) => a + b, 0)} font sizes onto the scale, ${Object.values(typeStats.weights).reduce((a, b) => a + b, 0)} weights changed, ${typeStats.caps} uppercase rules given one letter-spacing`);
  console.log(`email addresses corrected: ${emailCount}`);
  console.log(`garbled sequences repaired:${Object.keys(mojibakeFixes).length} kinds, in ${new Set(Object.values(mojibakeFixes).flatMap((s) => [...s])).size} places`);
  const total = Object.values(stats.files).reduce((a, f) => a + f.replaced, 0);
  const skipped = Object.values(stats.files).reduce((a, f) => a + f.skipped, 0);
  console.log(`colour literals rewritten: ${total}  (data: URI literals: ${stats.dataUri})  left alone: ${skipped}`);
  console.log('token use:', Object.entries(stats.tokens).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
}

if (process.argv[1] && process.argv[1].endsWith('_polish.mjs')) await main();
