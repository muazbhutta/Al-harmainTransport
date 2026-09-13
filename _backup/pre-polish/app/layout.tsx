import type { ReactNode } from 'react';

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
 * No global stylesheet of our own is imported anywhere: the original CSS is the
 * only CSS, which is what keeps this pixel-faithful.
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
        <link rel="stylesheet" href="/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/vendor/lightbox/lightbox.min.css" />
        <link rel="stylesheet" href="/includes/dynamic_styles.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
