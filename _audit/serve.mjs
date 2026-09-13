/**
 * Static server for the audit: serves the `out/` export on :3100, serves the
 * audit tools from `_audit/` under /_audit/, and accepts POST /__save/<name>
 * to write probe results to _audit/results/<name>.json.
 *
 * Same origin as the site, so the harness can read iframe documents and POST
 * back without any CORS setup.
 */
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? 3100);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
  '.xml': 'application/xml', '.txt': 'text/plain',
};

await mkdir('_audit/results', { recursive: true });

async function file(res, candidates) {
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (!s.isFile()) continue;
      const headers = { 'Content-Type': TYPES[extname(c).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' };
      // PDFs download under their own name rather than opening a viewer tab
      if (/\.pdf$/i.test(c)) headers['Content-Disposition'] = `attachment; filename="${c.split(/[\\/]/).pop()}"`;
      res.writeHead(200, headers);
      res.end(await readFile(c));
      return true;
    } catch { /* next */ }
  }
  return false;
}

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'POST' && path.startsWith('/__save/')) {
    const name = path.slice('/__save/'.length).replace(/[^\w.-]/g, '_');
    const chunks = [];
    for await (const c of req) chunks.push(c);
    await writeFile(join('_audit/results', `${name}.json`), Buffer.concat(chunks));
    res.writeHead(204);
    res.end();
    return;
  }

  if (path.startsWith('/_audit/')) {
    const rel = normalize(path.slice('/_audit/'.length)).replace(/^(\.\.[\\/])+/, '');
    if (await file(res, [join('_audit', rel)])) return;
  }

  if (await file(res, [join('out', path), join('out', path, 'index.html'), join('out', path + '.html')])) return;

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1>');
}).listen(PORT, () => console.log(`audit server: http://localhost:${PORT}`));
