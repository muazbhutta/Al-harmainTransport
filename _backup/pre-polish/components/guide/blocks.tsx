import type { GuideBlock } from '../../data/ziyarat/types';
import { getPlace } from '../../data/ziyarat/places';

/**
 * The reusable blocks the guide is built from.
 *
 * All Server Components — the guide ships no client JS of its own. Styling uses
 * the site's own CSS variables so the guide reads as part of this site.
 */

export type GuideLabels = {
  quran: string;
  hadith: string;
  dua: string;
  pending: string;
  distance: string;
  bestTime: string;
  directions: string;
  city: string;
};

/* ------------------------------------------------------------- ScriptureCard */

/**
 * Qur'an / Hadith / Du'a / Talbiyah.
 *
 * The Arabic is always `dir="rtl"` and `lang="ar"` regardless of the page's own
 * direction, so scripture renders correctly even on an LTR page.
 */
export function ScriptureCard({
  badge,
  arabic,
  translation,
  source,
  pending,
  pendingLabel,
}: {
  badge: string;
  arabic?: string;
  translation?: string;
  source?: string;
  pending?: boolean;
  pendingLabel: string;
}) {
  return (
    <figure className="guide-scripture">
      <p className="guide-scripture__label">{badge}</p>

      {pending ? (
        <p className="guide-note fst-italic">{pendingLabel}</p>
      ) : (
        <>
          {arabic ? (
            <p lang="ar" dir="rtl" className="guide-arabic">
              {arabic}
            </p>
          ) : null}
          {translation ? <p className="guide-translation">{translation}</p> : null}
          {source ? <figcaption className="guide-source">{source}</figcaption> : null}
        </>
      )}
    </figure>
  );
}

/* -------------------------------------------------------------- TakeawayList */

export function TakeawayList({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className="guide-takeaways">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </List>
  );
}

/* -------------------------------------------------------------- LocationCard */

const mapsSearch = (place: { coords: { lat: number; lng: number } | null; id: string }, name: string) =>
  place.coords
    ? `https://www.google.com/maps/search/?api=1&query=${place.coords.lat},${place.coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

/**
 * The small boxed card under a location's heading.
 *
 * Distance is straight-line from Masjid al-Haram / an-Nabawi (that is what the
 * data holds), so it is labelled "distance" and never presented as a drive.
 * Rows with no data are omitted rather than shown empty.
 */
export function LocationCard({
  id,
  name,
  labels,
  cityLabel,
  bestTimeLabel,
}: {
  id: string;
  name: string;
  labels: GuideLabels;
  cityLabel: string;
  bestTimeLabel?: string;
}) {
  const place = getPlace(id);
  if (!place) return null;

  return (
    <aside className="guide-location">
      <dl className="guide-location__grid">
        <div>
          <dt className="guide-location__term">{labels.city}</dt>
          <dd className="guide-location__value">{cityLabel}</dd>
        </div>
        {place.distanceFromHaramKm != null ? (
          <div>
            <dt className="guide-location__term">{labels.distance}</dt>
            <dd className="guide-location__value">{place.distanceFromHaramKm} km</dd>
          </div>
        ) : null}
        {bestTimeLabel ? (
          <div>
            <dt className="guide-location__term">{labels.bestTime}</dt>
            <dd className="guide-location__value">{bestTimeLabel}</dd>
          </div>
        ) : null}
      </dl>
      <a className="guide-btn" href={mapsSearch(place, name)} target="_blank" rel="noopener noreferrer">
        {labels.directions}
      </a>
    </aside>
  );
}

/* ------------------------------------------------------------------ StepList */

export function StepList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="guide-steps">
      {items.map((s, i) => (
        <li key={i}>
          <span aria-hidden className="guide-steps__num">{i + 1}</span>
          <span>
            <strong className="guide-steps__title">{s.title}</strong>
            {s.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------- DataTable */

/** Scrolls horizontally on small screens rather than squashing the text. */
export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption?: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="guide-table">
      <table>
        {caption ? <caption className="px-3 pb-3">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------- Callout */

export function Callout({
  title,
  text,
  variant = 'info',
}: {
  title?: string;
  text: string;
  variant?: 'info' | 'warning';
}) {
  return (
    <div className={`guide-callout${variant === 'warning' ? ' guide-callout--warning' : ''}`}>
      {title ? <p className="guide-callout__title">{title}</p> : null}
      <p className="mb-0">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------ block dispatch */

/**
 * Renders one block. The location card is NOT emitted here: a place's card
 * belongs after the last block of its section, which the caller decides using
 * `locationSlotsForBlocks`.
 */
export function renderBlock(
  block: GuideBlock,
  key: number,
  labels: GuideLabels,
): React.ReactNode {
  switch (block.type) {
    case 'p':
      return (
        <p key={key}>
          {block.text}
        </p>
      );

    case 'h3':
      return (
        <h3 key={key} id={block.id}>
          {block.text}
        </h3>
      );

    case 'h4':
      return (
        <h4 key={key}>
          {block.text}
        </h4>
      );

    case 'note':
      return <Callout key={key} text={block.text} variant={block.variant} />;

    case 'callout':
      return <Callout key={key} title={block.title} text={block.text} />;

    case 'list':
      return <TakeawayList key={key} items={block.items} ordered={block.ordered} />;

    case 'verse':
      return (
        <ScriptureCard
          key={key}
          badge={labels.quran}
          arabic={block.arabic}
          translation={block.translation}
          source={block.reference}
          pending={block.pending}
          pendingLabel={labels.pending}
        />
      );

    case 'hadith':
      return (
        <ScriptureCard
          key={key}
          badge={block.badge ?? labels.hadith}
          arabic={block.arabic}
          translation={block.text}
          source={block.source}
          pending={block.pending}
          pendingLabel={labels.pending}
        />
      );

    case 'steps':
      return <StepList key={key} items={block.items} />;

    case 'table':
      return <DataTable key={key} caption={block.caption} columns={block.columns} rows={block.rows} />;

    case 'infocard':
      return (
        <section key={key} className="guide-infocard">
          <h4>{block.title}</h4>
          {block.blocks.map((b, i) => renderBlock(b, i, labels))}
        </section>
      );

    default:
      return null;
  }
}
