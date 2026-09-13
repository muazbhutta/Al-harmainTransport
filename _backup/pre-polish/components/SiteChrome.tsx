import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

type Chrome = { nav: string; footer: string; floating: string };

/**
 * The site's header, footer and floating action buttons.
 *
 * These are lifted verbatim from the original's markup (they are byte-identical
 * on every page, verified), so a page built by hand — like the Ziyarat guide —
 * carries exactly the same chrome as the 47 replicated pages, down to the
 * WhatsApp number and the dropdown structure.
 */
async function chrome(): Promise<Chrome> {
  const raw = await readFile(join(process.cwd(), 'content', '_chrome.json'), 'utf8');
  return JSON.parse(raw) as Chrome;
}

export async function SiteNav() {
  const { nav } = await chrome();
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: nav }} />;
}

export async function SiteFooter() {
  const { footer, floating } = await chrome();
  return (
    <div
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: footer + floating }}
    />
  );
}
