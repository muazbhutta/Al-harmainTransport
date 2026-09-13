import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import LocationsIndex from '../../../../components/guide/LocationsIndex';
import { renderBlock, LocationCard, type GuideLabels } from '../../../../components/guide/blocks';
import { guideLangs, langByCode } from '../../../../data/ziyarat/langs';
import { getGuide } from '../../../../data/ziyarat/guides';
import { locationSlotsForBlocks, getPlace } from '../../../../data/ziyarat/places';
import { SITE_URL } from '../../../sitemap';
import '../../../guide-print.css';

/**
 * The print edition of one language's guide: the source of that language's PDF.
 *
 * _pdf.mjs prints this page to public/downloads/ziyarat-guide-<lang>.pdf with
 * headless Chrome. It is built from the same data as /ziyarat-guide/<lang> —
 * every chapter, scripture card, location and the full locations index — laid
 * out for A4 (app/guide-print.css), with no site navigation and no scripts.
 * Not for search engines: the guide page itself is the canonical version.
 */

type Params = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return guideLangs.map((l) => ({ lang: l.code }));
}

export const dynamicParams = false;

async function ui(lang: string) {
  const raw = await readFile(join(process.cwd(), 'data', 'ziyarat', 'ui', `${lang}.json`), 'utf8');
  return JSON.parse(raw) as Record<string, Record<string, unknown>>;
}
const s = (o: Record<string, unknown> | undefined, k: string, fb: string) =>
  typeof o?.[k] === 'string' ? (o[k] as string) : fb;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!langByCode(lang)) return {};
  const guide = getGuide(lang);
  return {
    title: { absolute: `${guide.title} — PDF edition | AL HARMAIN UMRAH TRANSPORT` },
    robots: { index: false, follow: false },
    alternates: { canonical: `/ziyarat-guide/${lang}` },
  };
}

export default async function ZiyaratGuidePrintEdition({ params }: Params) {
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
  // the repo marks the ten translations as machine-assisted drafts: say so on
  // the cover, in the reader's language — a PDF travels without the website
  const notice = lang !== 'en' ? s(g, 'machineNotice', '') : '';
  const pageAddress = `${SITE_URL}/ziyarat-guide/${lang}`;

  return (
    <div className="guide-print" lang={lang} dir={meta.dir} data-guide-lang={lang}>
      <section className="guide-print__cover">
        <span className="guide-print__eyebrow">{s(g, 'eyebrow', 'Flagship Guide')}</span>
        <h1>{guide.title}</h1>
        <p className="guide-print__lead">{s(g, 'subtitle', guide.intro)}</p>
        <img src="/img/kaaba_hero-print.jpg" alt="" width={1000} height={660} />
        <p>{guide.intro}</p>
        {notice ? <p className="guide-print__notice">{notice}</p> : null}
        <p className="guide-print__meta" dir="ltr">
          AL HARMAIN UMRAH TRANSPORT · <a href={pageAddress}>{pageAddress.replace('https://', '')}</a> ·{' '}
          <span className="guide-print__nowrap">WhatsApp +966 56 547 6113</span>
        </p>
      </section>

      {/* a <section>, not <nav>: the site CSS pins every <nav> to the window */}
      <section className="guide-print__toc">
        <h2>{s(g, 'onThisPage', 'On this page')}</h2>
        <ol>
          {guide.chapters.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`}>{c.title}</a>
            </li>
          ))}
        </ol>
      </section>

      {guide.chapters.map((chapter, n) => {
        const slots = locationSlotsForBlocks(chapter.blocks);
        return (
          <article key={chapter.id} className="guide-print__chapter">
            <span className="guide-eyebrow">
              {s(g, 'chapterLabel', 'Chapter')} {n + 1}
            </span>
            <h2 id={chapter.id}>{chapter.title}</h2>
            {chapter.intro ? <p className="guide-lead">{chapter.intro}</p> : null}
            {chapter.blocks.map((b, i) => {
              const slot = slots.get(i);
              const place = slot ? getPlace(slot.id) : undefined;
              return (
                <div key={i}>
                  {renderBlock(b, i, labels)}
                  {slot && place ? (
                    <LocationCard id={slot.id} name={slot.name} labels={labels} cityLabel={cityLabels[place.city] ?? place.city} />
                  ) : null}
                </div>
              );
            })}
          </article>
        );
      })}

      <section className="guide-print__index">
        <LocationsIndex
          guide={guide}
          cityLabels={cityLabels}
          labels={{
            heading: s(idx, 'title', 'All Ziyarat Locations'),
            directions: labels.directions,
            openRoute: s(idx, 'openRoute', 'Open full route in Google Maps'),
            routeCapped: (shown, total) => `${shown} of ${total} stops — Google Maps caps a route at 25 points.`,
            noCoords: s(idx, 'noCoords', '—'),
            distance: labels.distance,
          }}
        />
      </section>

      <p className="guide-print__end">
        {s(g, 'sourcesNote', "All Qur'anic verses and ahadith are checked against authentic sources.")}
      </p>
    </div>
  );
}
