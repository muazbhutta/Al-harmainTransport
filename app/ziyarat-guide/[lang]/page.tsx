import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { SiteNav, SiteFooter } from '../../../components/SiteChrome';
import TableOfContents from '../../../components/guide/TableOfContents';
import LanguageSwitcher from '../../../components/guide/LanguageSwitcher';
import LocationsIndex from '../../../components/guide/LocationsIndex';
import { renderBlock, LocationCard, type GuideLabels } from '../../../components/guide/blocks';
import { guideLangs, langByCode } from '../../../data/ziyarat/langs';
import { getGuide } from '../../../data/ziyarat/guides';
import { locationSlotsForBlocks, getPlace } from '../../../data/ziyarat/places';
import { SITE_URL } from '../../sitemap';
import '../../guide.css';

/** Trim to a whole word so a search result is not cut mid-word. */
const clamp = (text: string, max: number) => {
  const t = text.replace(/s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
};

type Params = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return guideLangs.map((l) => ({ lang: l.code }));
}

export const dynamicParams = false;

/** UI strings for one language, straight from the repo's own message files. */
async function ui(lang: string) {
  const raw = await readFile(join(process.cwd(), 'data', 'ziyarat', 'ui', `${lang}.json`), 'utf8');
  return JSON.parse(raw) as Record<string, Record<string, unknown>>;
}
const s = (o: Record<string, unknown> | undefined, k: string, fb: string) =>
  typeof o?.[k] === 'string' ? (o[k] as string) : fb;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const meta = langByCode(lang);
  if (!meta) return {};
  const guide = getGuide(lang);
  const t = await ui(lang);

  return {
    title: { absolute: `${guide.title} | AL HARMAIN UMRAH TRANSPORT` },
    description: clamp(guide.intro, 158),
    keywords: s(t.guide, 'keywords', 'Ziyarat guide, Umrah guide, Hajj guide, Makkah, Madinah'),
    alternates: {
      canonical: `/ziyarat-guide/${lang}`,
      // hreflang links all 11 versions to each other.
      languages: Object.fromEntries(
        guideLangs.map((l) => [l.hreflang, `${SITE_URL}/ziyarat-guide/${l.code}`]),
      ),
    },
    openGraph: {
      title: guide.title,
      description: clamp(guide.intro, 158),
      url: `${SITE_URL}/ziyarat-guide/${lang}`,
      locale: meta.hreflang,
      type: 'article',
      images: [{ url: '/img/kaaba_hero.jpg', width: 1024, height: 676, alt: guide.title }],
    },
  };
}

export default async function ZiyaratGuideLangPage({ params }: Params) {
  const { lang } = await params;
  const meta = langByCode(lang);
  if (!meta) notFound();

  const guide = getGuide(lang);
  const t = await ui(lang);
  const g = t.guide as Record<string, unknown> | undefined;
  const loc = t.ziyaratLocation as Record<string, unknown> | undefined;
  const idx = t.ziyaratIndex as Record<string, unknown> | undefined;

  const labels: GuideLabels = {
    quran: s(loc, 'quran', "Qur'an"),
    hadith: s(loc, 'hadith', 'Hadith'),
    dua: s(loc, 'dua', "Du'a"),
    pending: s(loc, 'pending', 'Awaiting verified text.'),
    distance: s(loc, 'distance', 'Distance'),
    bestTime: s(loc, 'bestTimeLabel', 'Best time'),
    directions: s(loc, 'directions', 'Get Directions'),
    city: s(loc, 'city', 'City'),
  };

  const cityLabels: Record<string, string> = {
    makkah: s(idx, 'makkah', 'Makkah'),
    madinah: s(idx, 'madinah', 'Madinah'),
    taif: s(idx, 'taif', 'Taif'),
    jeddah: s(idx, 'jeddah', 'Jeddah'),
  };

  // The bar shows the chapter's own name: "Chapter 3 · Hajj" becomes "Hajj",
  // and a trailing " - Sacred Sites" is dropped. Every language separates the
  // chapter label with the same "·", so this holds in all 11.
  const shortTitle = (t: string) => t.split('·').pop()!.split(' - ')[0].trim();
  const toc = guide.chapters.map((c) => ({ id: c.id, title: shortTitle(c.title) }));

  return (
    <div className="guide" dir={meta.dir} lang={lang}>
      <SiteNav route={`/ziyarat-guide/${lang}`} />

      <main>
        {/* 1 + 2 — dark hero band: pill, title, intro, switcher */}
        <section className="guide-hero">
          <div className="guide-container">
            <div className="guide-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: '1 / -1', maxWidth: '48rem' }}>
                <span className="guide-eyebrow-pill">{s(g, 'eyebrow', 'Flagship Guide')}</span>
                <h1>{guide.title}</h1>
                <p className="guide-lead" style={{ marginTop: '1.25rem' }}>
                  {s(g, 'subtitle', guide.intro)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* cover, language choice, sources note and the PDF button */}
        <section className="guide-section--tight">
          <div className="guide-container">
            <div className="guide-grid" style={{ alignItems: 'center' }}>
              <a
                className="guide-hero__media"
                href={`/downloads/ziyarat-guide-${lang}.pdf`}
                download={`ziyarat-guide-${lang}.pdf`}
                type="application/pdf"
                aria-hidden
                tabIndex={-1}
              >
                <img
                  src="/img/kaaba_hero.jpg"
                  alt=""
                  width={1024}
                  height={676}
                  loading="eager"
                />
              </a>

              <div className="guide-prose">
                <p className="guide-lead">{guide.intro}</p>

                <LanguageSwitcher
                  langs={guideLangs.map(({ code, native, dir }) => ({ code, native, dir }))}
                  current={lang}
                  label={s(g, 'chooseLanguage', 'Read in your language')}
                />

                <p className="guide-note" style={{ marginTop: '1.5rem' }}>
                  {s(g, 'sourcesNote',
                    "All Qur'anic verses and ahadith are checked against authentic sources.")}
                </p>

                {/* this language's own PDF (made by _pdf.mjs from this language's guide
                    data); same-origin + download = saved, not opened in a new tab */}
                <a
                  className="guide-btn"
                  href={`/downloads/ziyarat-guide-${lang}.pdf`}
                  download={`ziyarat-guide-${lang}.pdf`}
                  type="application/pdf"
                >
                  {s(g, 'download', 'Download PDF')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — the chapter bar, sticky under the site header */}
        <TableOfContents items={toc} label={s(g, 'onThisPage', 'On this page')} />

        {/* 4 — the chapters */}
        <section className="guide-section" style={{ paddingTop: 0 }}>
          <div className="guide-container">
            <div className="guide-chapters">
              <div>
                {guide.chapters.map((chapter, n) => {
                  // Which h3 blocks in this chapter are known ziyarat locations.
                  const slots = locationSlotsForBlocks(chapter.blocks);
                  return (
                    <article
                      key={chapter.id}
                      className="guide-prose"
                      style={{ marginBottom: '4rem' }}
                    >
                      <span className="guide-eyebrow">
                        {s(g, 'chapterLabel', 'Chapter')} {n + 1}
                      </span>
                      <h2 id={chapter.id}>{chapter.title}</h2>
                      {chapter.intro ? (
                        <p className="guide-lead" style={{ marginTop: '1rem' }}>{chapter.intro}</p>
                      ) : null}

                      {chapter.blocks.map((b, i) => {
                        // A place's card closes its section, so it is emitted
                        // after the block that ends the run — not on the heading.
                        const slot = slots.get(i);
                        const place = slot ? getPlace(slot.id) : undefined;
                        return (
                          <div key={i}>
                            {renderBlock(b, i, labels)}
                            {slot && place ? (
                              <LocationCard
                                id={slot.id}
                                name={slot.name}
                                labels={labels}
                                cityLabel={cityLabels[place.city] ?? place.city}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </article>
                  );
                })}

                {/* 6 — all locations */}
                <LocationsIndex
                  guide={guide}
                  cityLabels={cityLabels}
                  labels={{
                    heading: s(idx, 'title', 'All Ziyarat Locations'),
                    directions: labels.directions,
                    openRoute: s(idx, 'openRoute', 'Open full route in Google Maps'),
                    routeCapped: (shown, total) =>
                      `${shown} of ${total} stops — Google Maps caps a route at 25 points.`,
                    noCoords: s(idx, 'noCoords', '—'),
                    distance: labels.distance,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter route={`/ziyarat-guide/${lang}`} />

      {/* Article schema, per language. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.intro.slice(0, 300),
            inLanguage: meta.hreflang,
            image: `${SITE_URL}/img/kaaba_hero.jpg`,
            mainEntityOfPage: `${SITE_URL}/ziyarat-guide/${lang}`,
            author: { '@type': 'Organization', name: 'AL HARMAIN UMRAH TRANSPORT' },
            publisher: {
              '@type': 'Organization',
              name: 'AL HARMAIN UMRAH TRANSPORT',
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/img/LOGO.png` },
            },
          }),
        }}
      />
    </div>
  );
}
