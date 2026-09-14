import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import { SiteNav, SiteFooter } from '../../components/SiteChrome';
import { waLink, pageUrl } from '../../lib/whatsapp.mjs';
import { SITE_URL } from '../sitemap';

/**
 * /contact — the page the footer has always linked to.
 *
 * "Contact Us" sits in the footer of all 57 pages and went to a 404: the
 * original's contact page was never part of the export. Every detail here is
 * one the site already publishes — the two numbers and the address in that
 * same footer, the hours in the chat agent. Nothing is invented: no street
 * address, no office photograph, and no form, because a static site has no
 * backend to post one to. The form a visitor actually wants is WhatsApp.
 */
export const metadata: Metadata = {
  title: { absolute: 'Contact Us | AL HARMAIN UMRAH TRANSPORT' },
  description:
    'Reach Al Harmain Umrah Transport on WhatsApp, by phone or by email, any hour of the day, '
    + 'for private transfers across Makkah, Madinah, Jeddah and Taif.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | AL HARMAIN UMRAH TRANSPORT',
    description: 'WhatsApp, phone and email for Al Harmain Umrah Transport — 24 hours a day.',
    url: '/contact',
    siteName: 'AL HARMAIN UMRAH TRANSPORT',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/img/kaaba_hero.jpg', width: 1024, height: 676, alt: 'AL HARMAIN UMRAH TRANSPORT' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | AL HARMAIN UMRAH TRANSPORT',
    description: 'WhatsApp, phone and email for Al Harmain Umrah Transport — 24 hours a day.',
    images: ['/img/kaaba_hero.jpg'],
  },
};

const PHONES = ['+966 56 547 6113', '+966 59 678 9290'];
const EMAIL = 'alharmaintransportksa@gmail.com';
const CITIES = ['Makkah', 'Madinah', 'Jeddah', 'Taif'];

const card: CSSProperties = {
  background: 'var(--clr-surface)',
  border: '1px solid var(--clr-border)',
  borderRadius: '14px',
  padding: '28px',
  height: '100%',
};

const heading: CSSProperties = { fontSize: 'var(--text-xl)', marginBottom: '12px' };
const mark: CSSProperties = { color: 'var(--clr-accent)', marginInlineEnd: '10px' };

export default function ContactPage() {
  const wa = waLink({ type: 'general', url: pageUrl('/contact') });

  return (
    <>
      <SiteNav route="/contact" />

      <main>
        <section className="page-hero">
          <div className="container text-center">
            <h1>Contact Us</h1>
            <p style={{ maxWidth: '46rem', marginInline: 'auto' }}>
              We answer on WhatsApp around the clock. Tell us your route and your date,
              and we will confirm the vehicle and the fare.
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="row g-4">
              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fab fa-whatsapp" aria-hidden="true" style={{ ...mark, color: 'var(--clr-success)' }} />
                    WhatsApp
                  </h2>
                  <p>The fastest way to reach us, day or night.</p>
                  <a className="btn btn-success fw-bold" href={wa} target="_blank" rel="noopener">
                    <i className="fab fa-whatsapp" aria-hidden="true" style={{ marginInlineEnd: '8px' }} />
                    Message us on WhatsApp
                  </a>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fas fa-phone" aria-hidden="true" style={mark} />
                    Call us
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {PHONES.map((phone) => (
                      <li key={phone} style={{ marginBottom: '8px' }}>
                        <a href={`tel:${phone.split(' ').join('')}`}>{phone}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fas fa-envelope" aria-hidden="true" style={mark} />
                    Email
                  </h2>
                  <p style={{ wordBreak: 'break-word' }}>
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fas fa-clock" aria-hidden="true" style={mark} />
                    Hours
                  </h2>
                  <p>24 hours a day, seven days a week.</p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fas fa-map-marker-alt" aria-hidden="true" style={mark} />
                    Where we drive
                  </h2>
                  <p>{CITIES.join(' · ')}, and every route between them.</p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div style={card}>
                  <h2 style={heading}>
                    <i className="fas fa-car" aria-hidden="true" style={mark} />
                    Ready to book?
                  </h2>
                  <p>Browse the routes and the vehicles, then send it to us in one tap.</p>
                  <a className="btn btn-outline-light fw-bold" href="/book-now">See all services</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter route="/contact" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact AL HARMAIN UMRAH TRANSPORT',
            url: `${SITE_URL}/contact`,
            mainEntity: {
              '@type': 'Organization',
              name: 'AL HARMAIN UMRAH TRANSPORT',
              email: EMAIL,
              telephone: PHONES.map((phone) => phone.split(' ').join('')),
              areaServed: CITIES,
            },
          }),
        }}
      />
    </>
  );
}
