'use client';

import { useEffect } from 'react';

// Bootstrap hangs itself off window when the bundle runs.
declare global {
  interface Window { bootstrap?: unknown }
}

/**
 * Bootstrap's JS for pages that borrow the site chrome.
 *
 * The 47 replicated pages get it from PageScripts, as part of the original's
 * own script list. A page built by hand — the Ziyarat guide — renders the same
 * chrome markup, which carries data-bs-toggle on the menu button and on the two
 * nav dropdowns, but loaded no JS at all: the menu button and both dropdowns
 * did nothing when tapped.
 *
 * Loaded once per document. Bootstrap registers delegated listeners on the
 * document when it loads, so a second copy would toggle the menu twice per
 * click — hence both guards.
 */
export default function ChromeScripts() {
  useEffect(() => {
    if (window.bootstrap || document.querySelector('script[data-chrome-js]')) return;
    const el = document.createElement('script');
    el.src = '/vendor/bootstrap.bundle.min.js';
    el.async = false;
    el.dataset.chromeJs = 'true';
    document.body.appendChild(el);
  }, []);

  return null;
}
