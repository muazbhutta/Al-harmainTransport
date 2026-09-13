/**
 * Replaces site pictures with new ones, keeping the filenames the markup
 * already uses (so no page changes).
 *
 *   node _images.mjs <new file>=<name in public/img> [...]
 *   node _images.mjs _incoming/airport.png=trending_1.jpg
 *
 * Each original is copied to _backup/pre-images/ first. The new picture is
 * resized to at most 1200px wide and saved in the target's format (JPEG q82 /
 * AVIF), then also copied into out/ so the running static server shows it at
 * once.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const pairs = process.argv.slice(2).map((a) => a.split('='));
if (!pairs.length || pairs.some((p) => p.length !== 2)) {
  console.error('usage: node _images.mjs <new file>=<name in public/img> [...]');
  process.exit(1);
}

await mkdir('_backup/pre-images', { recursive: true });
for (const [src, name] of pairs) {
  const target = join('public/img', name);
  try {
    await stat(join('_backup/pre-images', name));
  } catch {
    await copyFile(target, join('_backup/pre-images', name)); // first run only: keep the original
  }
  const img = sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true });
  const ext = extname(name).toLowerCase();
  const out = ext === '.avif' ? img.avif({ quality: 55 }) : ext === '.png' ? img.png() : img.jpeg({ quality: 82, mozjpeg: true });
  const info = await out.toFile(target);
  await copyFile(target, join('out/img', name));
  console.log(`${src} -> /img/${name}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} kB`);
}
