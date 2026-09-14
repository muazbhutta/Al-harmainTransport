import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { POLISH, polished } from '../lib/polish';
import { SITE_URL } from './sitemap';
import { EMAIL, LICENCE } from '../lib/whatsapp.mjs';
import JsonLd from '../components/JsonLd';

/**
 * metadataBase turns the relative canonical and og:url that lib/page.ts sets
 * into the absolute URLs those tags must carry.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

/**
 * Who the business is, in the form a search engine reads.
 *
 * Every fact here is already published on the site — the two numbers and the
 * address in the footer, the cities in the services. Nothing is asserted that
 * the site does not say: no licence number, no rating, no price range, no
 * street address, because none of those appear anywhere in the content.
 */
const BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: 'AL HARMAIN UMRAH TRANSPORT',
  description:
    'Private Hajj and Umrah transport across Makkah, Madinah, Jeddah and Taif — '
    + 'sedans, SUVs, minivans, coasters and coaches with professional drivers.',
  url: SITE_URL,
  logo: `${SITE_URL}/img/LOGO.png`,
  image: `${SITE_URL}/img/kaaba_hero.jpg`,
  telephone: '+966565476113',
  email: EMAIL,
  address: { '@type': 'PostalAddress', addressCountry: 'SA' },
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Operating licence',
    value: LICENCE,
  },
  areaServed: ['Makkah', 'Madinah', 'Jeddah', 'Taif'].map((name) => ({ '@type': 'City', name })),
  sameAs: ['https://www.facebook.com/ALHARMAINUMRAHTAXI'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

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
        <link rel="apple-touch-icon" sizes="180x180" href="/img/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* the address bar matches the page, rather than flashing white */}
        <meta name="theme-color" content="#0c1119" />

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
      <body>
        {children}
        <JsonLd data={BUSINESS} />
      </body>
    </html>
  );
}
