/**
 * Phase 2: the Ziyarat guide PDFs, one per language.
 *
 * For each of the 11 languages, public/downloads/ziyarat-guide-<lang>.pdf is
 * checked. A missing one (or every one, with --force) is made by printing that
 * language's print edition — /ziyarat-guide/<lang>/print, rendered from that
 * language's own guide data — to PDF with headless Chrome. There is no
 * fallback: the page must declare lang="<lang>", or the run stops.
 *
 * Needs a fresh `next build` and the static server (node _audit/serve.mjs 3100).
 *
 * Usage: node _pdf.mjs [--force]
 */
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const BASE = 'http://localhost:3100';
const FORCE = process.argv.includes('--force');
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!CHROME) throw new Error('no Chrome or Edge found for printing');

const langs = [...(await readFile('data/ziyarat/langs.ts', 'utf8')).matchAll(/code: '([^']+)'/g)].map((m) => m[1]);
// A fresh throwaway profile for every run: it never attaches to your open
// Chrome, and a lock left by an interrupted run cannot block the next one
// (Chrome exits with code 21, "profile in use").
const profile = await mkdtemp(join(tmpdir(), 'alharmain-pdf-'));
await mkdir('public/downloads', { recursive: true });
await mkdir('out/downloads', { recursive: true });

const pagesIn = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;

const report = [];
for (const lang of langs) {
  const file = `ziyarat-guide-${lang}.pdf`;
  const target = resolve('public/downloads', file);
  let status = 'already there';
  if (FORCE || !existsSync(target)) {
    const url = `${BASE}/ziyarat-guide/${lang}/print`;
    const html = await (await fetch(url)).text();
    if (!new RegExp(`class="guide-print"[^>]*\\blang="${lang}"|\\blang="${lang}"[^>]*class="guide-print"`).test(html)) {
      throw new Error(`${url} is not the ${lang} edition — refusing to fall back to another language`);
    }
    await run(CHROME, [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${profile}`, '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=15000', `--print-to-pdf=${target}`, url,
    ], { timeout: 120000 });
    status = 'generated';
  }
  const buf = await readFile(target);
  if (buf.subarray(0, 5).toString() !== '%PDF-') throw new Error(`${file} is not a PDF`);
  await copyFile(target, join('out/downloads', file));   // the running server shows it without a rebuild
  report.push({ lang, file, status, pages: pagesIn(buf), kb: Math.round((await stat(target)).size / 1024) });
}

await rm(profile, { recursive: true, force: true, maxRetries: 3 });
console.table(report);
await mkdir('_polish', { recursive: true });
await writeFile('_polish/pdf.json', JSON.stringify(report, null, 1));
