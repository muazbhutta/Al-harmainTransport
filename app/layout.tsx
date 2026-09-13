import type { ReactNode } from 'react';
import { POLISH, polished } from '../lib/polish';

/**
 * Root layout.
 *
 * The stylesheets are declared in the SAME ORDER as the original document,
 * because that order decides which rules win: dynamic_styles.css overrides
 * Bootstrap, and style.css overrides both. Changing the order changes the
 * rendering, so it is preserved exactly.
 *
 * Every one is self-hosted from /vendor, so the replica has no runtime
 * dependency on a CDN staying up.
 *
 * With POLISH on (lib/polish.ts) the colour-rewritten copies are loaded in the
 * same order, followed by the palette in /polish/globals.css.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="AL HARMAIN UMRAH TRANSPORT" />

        <link rel="icon" type="image/png" href="/img/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/img/favicon.png" />
        <link rel="apple-touch-icon" href="/img/favicon.png" />

        {/* Order matters — see the note above. */}
        <link rel="stylesheet" href="/vendor/fonts/fonts.css" />
        <link rel="stylesheet" href="/vendor/fontawesome/all.min.css" />
        <link rel="stylesheet" href={polished('/vendor/bootstrap.min.css')} />
        <link rel="stylesheet" href={polished('/vendor/lightbox/lightbox.min.css')} />
        <link rel="stylesheet" href={polished('/includes/dynamic_styles.css')} />
        <link rel="stylesheet" href={polished('/assets/css/style.css')} />
        {POLISH && <link rel="stylesheet" href="/polish/globals.css" />}
        {/* the navbar logo is the first image on every page */}
        {POLISH && <link rel="preload" as="image" href="/img/LOGO.png" fetchPriority="high" />}
      </head>
      <body>{children}</body>
    </html>
  );
}
