/** Minimal static server for the `out/` export — no dependency needed. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = process.argv[3] ?? "out";
const PORT = Number(process.argv[2] ?? 3100);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  for (const cand of [join(ROOT, path), join(ROOT, path, 'index.html'), join(ROOT, path + '.html')]) {
    try {
      const s = await stat(cand);
      if (!s.isFile()) continue;
      res.writeHead(200, { 'Content-Type': TYPES[extname(cand).toLowerCase()] ?? 'application/octet-stream' });
      res.end(await readFile(cand));
      return;
    } catch { /* try next candidate */ }
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1>');
}).listen(PORT, () => console.log(`serving ./${ROOT} on http://localhost:${PORT}`));
