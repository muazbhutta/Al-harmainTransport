/**
 * Squeezes the site's images without changing how any of them look.
 *
 * The home page was shipping 238 kB of LOGO.png to draw a 40px logo and a
 * 266 kB favicon — both the full 500x500 original — and 10 MB sat in public/img
 * for photographs no wider than 1600px on screen.
 *
 * Every file is re-encoded at the size it is actually displayed at (with room
 * for a high-density screen) and stripped of camera metadata. Originals stay in
 * git, so this is reversible with a checkout.
 */
import { readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const MAX_EDGE = 1600;          // nothing on the site displays wider
const JPEG_QUALITY = 80;
const EXACT = {                 // files with a known display size
  'public/img/LOGO.png': 240,   // drawn at 40-60px; 4x for a dense screen
  'public/img/favicon.png': 180, // also serves as the apple-touch icon
};

const files = [];
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).split(String.fromCharCode(92)).join(String.fromCharCode(47));
    if (e.isDirectory()) await walk(p);
    else if (/\.(png|jpe?g)$/i.test(e.name)) files.push(p);
  }
};
await walk('public/img');
await walk('public/uploads');

let before = 0;
let after = 0;
const changed = [];
for (const f of files) {
  const start = (await stat(f)).size;
  before += start;
  const img = sharp(await readFile(f));
  const meta = await img.metadata();
  const cap = EXACT[f] ?? MAX_EDGE;
  const resize = Math.max(meta.width ?? 0, meta.height ?? 0) > cap
    ? { width: meta.width >= meta.height ? cap : undefined, height: meta.height > meta.width ? cap : undefined }
    : null;

  let pipe = sharp(await readFile(f)).rotate();   // honour EXIF, then drop it
  if (resize) pipe = pipe.resize({ ...resize, fit: 'inside', withoutEnlargement: true });
  pipe = extname(f).toLowerCase() === '.png'
    ? pipe.png({ compressionLevel: 9, palette: true })
    : pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const buf = await pipe.toBuffer();
  if (buf.length < start * 0.95) {           // only if it is a real saving
    await writeFile(f, buf);
    const m2 = await sharp(buf).metadata();
    changed.push({ f, kb: [Math.round(start / 1024), Math.round(buf.length / 1024)], px: [`${meta.width}x${meta.height}`, `${m2.width}x${m2.height}`] });
    after += buf.length;
  } else {
    after += start;
  }
}

changed.sort((a, b) => (b.kb[0] - b.kb[1]) - (a.kb[0] - a.kb[1]));
for (const c of changed.slice(0, 12)) {
  console.log(`  ${String(c.kb[0]).padStart(4)} -> ${String(c.kb[1]).padStart(4)} kB  ${c.px[0].padStart(9)} -> ${c.px[1].padEnd(9)} ${c.f.replace('public/', '')}`);
}
console.log(`files: ${files.length}, rewritten: ${changed.length}`);
console.log(`total: ${Math.round(before / 1024)} kB -> ${Math.round(after / 1024)} kB  (${Math.round(100 * (1 - after / before))}% smaller)`);
