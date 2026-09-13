'use client';

import { useEffect } from 'react';

export type PageScript = { type: 'inline' | 'external'; src: string };

/**
 * Loads a page's scripts in the original document order, one at a time.
 *
 * Order is not cosmetic here: pageInitialData must exist before booking_engine
 * runs, and booking_engine expects jQuery and Bootstrap to already be present.
 * So each script is appended only once the previous one has loaded, rather than
 * all at once.
 *
 * Two deliberate substitutions:
 *  - CDN URLs are swapped for the self-hosted copies in /vendor, so the page has
 *    no third-party dependency at runtime;
 *  - the seven `assets/js/modules/*` and `main.js` / `index-form.js` tags are
 *    skipped. Those files return 404 on the live site too — the original ships
 *    dead script tags, and requesting them would only reproduce the 404s.
 */
const VENDOR_MAP: Record<string, string> = {
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js': '/vendor/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js':
    '/vendor/lightbox/lightbox.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox-plus-jquery.min.js':
    '/vendor/lightbox/lightbox-plus-jquery.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js':
    '/vendor/bootstrap.bundle.min.js',
};

/** Present in the markup but 404 on the origin — see the note above. */
const DEAD = [
  '/assets/js/modules/config.js',
  '/assets/js/modules/ui.js',
  '/assets/js/modules/modals.js',
  '/assets/js/modules/cart.js',
  '/assets/js/modules/marketing.js',
  '/assets/js/main.js',
  '/assets/js/index-form.js',
];

export default function PageScripts({ scripts }: { scripts: PageScript[] }) {
  useEffect(() => {
    let cancelled = false;
    const added: HTMLScriptElement[] = [];

    const load = (src: string) =>
      new Promise<void>((resolve) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = false;
        el.dataset.replica = 'true';
        el.onload = () => resolve();
        el.onerror = () => resolve(); // never block the chain on one bad file
        document.body.appendChild(el);
        added.push(el);
      });

    (async () => {
      for (const s of scripts) {
        if (cancelled) return;
        if (DEAD.includes(s.src)) continue;
        const src = VENDOR_MAP[s.src] ?? s.src;
        // The Facebook SDK is the original's own social embed; it is kept so the
        // page behaves the same, but it is the one remaining third-party request.
        await load(src);
      }
      if (!cancelled) {
        // The original's scripts run at parse time and listen for DOMContentLoaded,
        // which has long since fired by the time React mounts. Re-dispatch it so
        // their initialisers run.
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
        window.dispatchEvent(new Event('load'));
      }
    })();

    return () => {
      cancelled = true;
      added.forEach((el) => el.remove());
    };
  }, [scripts]);

  return null;
}
