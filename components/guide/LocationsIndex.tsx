import type { Guide } from '../../data/ziyarat/types';
import { extractPlaceEntries, getPlace, type ZiyaratCity } from '../../data/ziyarat/places';

/**
 * "All Ziyarat Locations" — every location in the guide, grouped by city.
 *
 * Counts, rows and map URLs are all derived from the data, so adding a place to
 * places.ts updates this index with no edit here.
 */

/**
 * Google Maps caps a directions URL at an origin, a destination and 23
 * waypoints. Anything past that is dropped rather than silently mangled, and
 * the UI says so.
 */
const MAX_WAYPOINTS = 23;

type Labels = {
  heading: string;
  directions: string;
  openRoute: string;
  routeCapped: (shown: number, total: number) => string;
  noCoords: string;
  distance: string;
};

const CITY_ORDER: ZiyaratCity[] = ['makkah', 'madinah', 'taif', 'jeddah'];

/** Builds a maps/dir/ URL from the coordinates of the places in one city. */
function routeUrl(coords: { lat: number; lng: number }[]): string | null {
  if (coords.length < 2) return null;
  const capped = coords.slice(0, MAX_WAYPOINTS + 2);
  const origin = capped[0];
  const destination = capped[capped.length - 1];
  const waypoints = capped.slice(1, -1);
  const p = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
  });
  if (waypoints.length) {
    p.set('waypoints', waypoints.map((c) => `${c.lat},${c.lng}`).join('|'));
  }
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

export default function LocationsIndex({
  guide,
  labels,
  cityLabels,
}: {
  guide: Guide;
  labels: Labels;
  cityLabels: Record<string, string>;
}) {
  // Place entries come from the guide's own headings, so the index and the
  // chapters can never drift apart.
  const entries = extractPlaceEntries(guide.chapters);

  // `extractPlaceEntries` already pairs each located place with its localised
  // name, in the order the guide presents them.
  const byCity = new Map<ZiyaratCity, { id: string; name: string }[]>();
  for (const e of entries) {
    const list = byCity.get(e.place.city) ?? [];
    list.push({ id: e.place.id, name: e.name });
    byCity.set(e.place.city, list);
  }

  const cities = CITY_ORDER.filter((c) => (byCity.get(c)?.length ?? 0) > 0);
  if (!cities.length) return null;

  return (
    <section className="guide-locations" aria-labelledby="all-locations">
      <h2 id="all-locations">
        {labels.heading}
      </h2>

      {cities.map((city) => {
        const list = byCity.get(city)!;
        const withCoords = list
          .map((l) => ({ ...l, place: getPlace(l.id)! }))
          .filter((l) => l.place.coords);
        const url = routeUrl(withCoords.map((l) => l.place.coords!));
        const capped = Math.min(withCoords.length, MAX_WAYPOINTS + 2);

        return (
          <div key={city} style={{ marginBottom: '3rem' }}>
            <h3 className="guide-index__city">
              {cityLabels[city] ?? city} <span className="guide-index__count">({list.length})</span>
            </h3>

            <ul className="guide-index__list">
              {list.map((l) => {
                const p = getPlace(l.id)!;
                const href = p.coords
                  ? `https://www.google.com/maps/search/?api=1&query=${p.coords.lat},${p.coords.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.name)}`;
                return (
                  <li key={l.id} className="guide-index__row">
                    <a href={`#${l.id}`} className="guide-index__name">
                      {l.name}
                    </a>
                    <span className="guide-index__dist">
                      {p.distanceFromHaramKm != null ? `${p.distanceFromHaramKm} km` : labels.noCoords}
                    </span>
                    <a
                      className="guide-btn guide-btn--ghost"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {labels.directions}
                    </a>
                  </li>
                );
              })}
            </ul>

            {url ? (
              <>
                <a className="guide-btn" href={url} target="_blank" rel="noopener noreferrer">
                  {labels.openRoute}
                </a>
                <p className="guide-index__note">{labels.routeCapped(capped, list.length)}</p>
              </>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
