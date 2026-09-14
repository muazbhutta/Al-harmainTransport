import type { MetadataRoute } from 'next';
import { categories } from '../data/categories';
import { services } from '../data/services';
import { vehicles } from '../data/vehicles';
import { standalonePages } from '../data/pages';
import { guideLangs } from '../data/ziyarat/langs';

/**
 * Change this at launch to the site's real domain.
 * Kept in one place so sitemap.ts and robots.ts cannot disagree.
 */
export const SITE_URL = 'https://alharmainumrahtransport.com';

/** Every route, derived from the same data the pages are generated from. */
// `output: export` needs this declared explicitly for metadata routes.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const at = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    priority,
  });

  return [
    at('/', 1),
    at('/who-we-are', 0.7),
    at('/contact', 0.8),
    // the Ziyarat guide, one entry per language; the print editions are
    // noindex and stay out
    ...guideLangs.map((l) => at(`/ziyarat-guide/${l.code}`, l.code === 'en' ? 0.9 : 0.7)),
    at('/fleet', 0.8),
    ...categories.map((c) => at(`/services/${c.slug}`, 0.8)),
    ...services.map((s) => at(`/services/${s.slug}`, 0.7)),
    ...vehicles.map((v) => at(`/fleet/${v.slug}`, 0.6)),
    // `blog` is live but unlinked on the original; it is still a real page.
    ...standalonePages.map((p) => at(`/${p.slug}`, p.slug === 'book-now' ? 0.9 : 0.4)),
  ];
}
