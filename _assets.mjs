/**
 * Step 2 — assets.
 *
 * Scans every saved reference page plus the site's own CSS, collects every asset
 * it references, and mirrors them into ./public at the SAME paths the original
 * uses (/img/LOGO.png stays /img/LOGO.png). Third-party CSS/JS/fonts and icon
 * sets are self-hosted under /vendor so the replica has no external dependency.
 *
 * Records each image's real pixel dimensions into public/_asset-manifest.json so
 * the markup can carry exact width/height and nothing shifts while loading.
 */
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';

const ORIGIN = 'https://lightyellow-squirrel-120253.hostingersite.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const VENDOR = [
  ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', 'vendor/bootstrap.min.css'],
  ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', 'vendor/bootstrap.bundle.min.js'],
  ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', 'vendor/fontawesome/all.min.css'],
  ['https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css', 'vendor/lightbox/lightbox.min.css'],
  ['https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js', 'vendor/lightbox/lightbox.min.js'],
];

const found = new Set();
const ok = [];
const bad = [];

const abs = (href, base) => {
  try { const u = new URL(href, base); u.hash = ''; return u.href; } catch { return null; }
};

const cssUrls = (css) => {
  const out = [];
  for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) {
    const v = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    if (v && !v.startsWith('data:')) out.push(v);
  }
  return out;
};

const attr = (html, tag, a) => {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*?\\b${a}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
  for (const m of html.matchAll(re)) out.push(m[2] ?? m[3] ?? m[4]);
  return out;
};

async function save(relPath, buf) {
  const file = join('public', relPath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
}

async function fetchTo(url, relPath) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: ORIGIN + '/' } });
    if (!res.ok) { bad.push([url, 'HTTP ' + res.status]); return null; }
    const buf = Buffer.from(await res.arrayBuffer());
    await save(relPath, buf);
    ok.push([relPath, buf.length]);
    return buf;
  } catch (e) {
    bad.push([url, String(e)]);
    return null;
  }
}

// ---- 1. collect references from every saved page
const files = (await readdir('_reference')).filter((f) => f.endsWith('.html'));
for (const f of files) {
  const html = await readFile(join('_reference', f), 'utf8');
  const base = ORIGIN + '/' + f;
  for (const [tag, a] of [['img', 'src'], ['script', 'src'], ['source', 'src'],
    ['link', 'href'], ['video', 'poster'], ['iframe', 'src'], ['a', 'href']]) {
    for (const v of attr(html, tag, a)) {
      const u = abs(v, base);
      if (!u || !u.startsWith(ORIGIN)) continue;
      if (!/\.(jpe?g|png|gif|webp|avif|svg|ico|css|js|mjs|woff2?|ttf|eot|pdf|mp4)$/i.test(new URL(u).pathname)) continue;
      found.add(u);
    }
  }
  for (const v of attr(html, 'img', 'srcset').concat(attr(html, 'source', 'srcset'))) {
    for (const s of v.split(',')) {
      const u = abs(s.trim().split(/\s+/)[0], base);
      if (u && u.startsWith(ORIGIN)) found.add(u);
    }
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const v of cssUrls(m[1])) { const u = abs(v, base); if (u && u.startsWith(ORIGIN)) found.add(u); }
  }
  for (const m of html.matchAll(/style\s*=\s*"([^"]*)"/gi)) {
    for (const v of cssUrls(m[1])) { const u = abs(v, base); if (u && u.startsWith(ORIGIN)) found.add(u); }
  }
}

// ---- 2. download them, then follow url() inside any CSS we pulled
const queue = [...found];
const done = new Set();
while (queue.length) {
  const url = queue.shift();
  if (done.has(url)) continue;
  done.add(url);
  const rel = decodeURIComponent(new URL(url).pathname).replace(/^\//, '');
  const buf = await fetchTo(url, rel);
  if (buf && extname(rel).toLowerCase() === '.css') {
    for (const v of cssUrls(buf.toString('utf8'))) {
      const u = abs(v, url);
      if (u && u.startsWith(ORIGIN) && !done.has(u)) queue.push(u);
    }
  }
}

// ---- 3. self-host the vendor CSS/JS, and the webfonts their CSS references
for (const [url, rel] of VENDOR) {
  const buf = await fetchTo(url, rel);
  if (buf && rel.endsWith('.css')) {
    for (const v of cssUrls(buf.toString('utf8'))) {
      const u = abs(v, url);
      if (!u || u.startsWith('data:')) continue;
      const sub = join(dirname(rel), v.split('?')[0].replace(/^\.\//, ''));
      await fetchTo(u, sub.replace(/\\/g, '/'));
    }
  }
}

// ---- 4. Google Fonts: fetch the CSS with a browser UA (gives woff2), self-host faces
const GF = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap';
try {
  const res = await fetch(GF, { headers: { 'User-Agent': UA } });
  let css = await res.text();
  const faces = [...new Set(cssUrls(css))];
  let i = 0;
  for (const f of faces) {
    const name = `vendor/fonts/${String(i++).padStart(2, '0')}-${f.split('/').pop().split('?')[0]}`;
    await fetchTo(f, name);
    css = css.split(f).join('/' + name);
  }
  await save('vendor/fonts/fonts.css', Buffer.from(css, 'utf8'));
  ok.push(['vendor/fonts/fonts.css', css.length]);
} catch (e) {
  bad.push([GF, String(e)]);
}

// ---- 5. record real pixel dimensions for every image
const sharp = (await import('sharp')).default;
const manifest = {};
for (const [rel] of ok) {
  if (!/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(rel)) continue;
  try {
    const m = await sharp(join('public', rel)).metadata();
    manifest['/' + rel] = { width: m.width, height: m.height, format: m.format };
  } catch (e) {
    manifest['/' + rel] = { error: String(e.message || e) };
  }
}
await writeFile('public/_asset-manifest.json', JSON.stringify(manifest, null, 2));

console.log(`downloaded : ${ok.length}`);
console.log(`failed     : ${bad.length}`);
console.log(`images measured: ${Object.keys(manifest).length}`);
console.log('\nby type:');
const byExt = {};
for (const [rel] of ok) { const e = (extname(rel) || 'none').toLowerCase(); byExt[e] = (byExt[e] || 0) + 1; }
console.log('  ' + Object.entries(byExt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  '));
if (bad.length) {
  console.log('\nfailures:');
  for (const b of bad.slice(0, 20)) console.log('  ' + b[0].replace(ORIGIN, '') + '  ->  ' + b[1]);
}
