import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { contentDir } from '../lib/polish';
import { pageUrl, waLink } from '../lib/whatsapp.mjs';

type Chrome = { nav: string; footer: string; floating: string };

/**
 * The site's header, footer and floating action buttons.
 *
 * These are lifted verbatim from the original's markup (they are byte-identical
 * on every page, verified), so a page built by hand — like the Ziyarat guide —
 * carries exactly the same chrome as the 47 replicated pages, down to the
 * WhatsApp number and the dropdown structure.
 *
 * The chrome is shared by several pages, so its WhatsApp links (marked
 * data-wa by _polish.mjs) are rebuilt here for the page being rendered: the
 * message ends with that page's own address.
 */
async function chrome(): Promise<Chrome> {
  const raw = await readFile(join(process.cwd(), contentDir, '_chrome.json'), 'utf8');
  return JSON.parse(raw) as Chrome;
}

const forPage = (html: string, route: string) =>
  html.replace(/data-wa="(\w+)" href="[^"]*"/g, (_m, type: string) => `data-wa="${type}" href="${waLink({ type, url: pageUrl(route) })}"`);

export async function SiteNav({ route }: { route: string }) {
  const { nav } = await chrome();
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: forPage(nav, route) }} />;
}

export async function SiteFooter({ route }: { route: string }) {
  const { footer, floating } = await chrome();
  return (
    <div
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: forPage(footer + floating, route) }}
    />
  );
}
