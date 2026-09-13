import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReplicaPage from '../../ReplicaPage';
import { loadPage, metadataFor } from '../../../lib/page';
import { categories } from '../../../data/categories';
import { services } from '../../../data/services';

/**
 * Every /services/* page — the four category pages and all 27 service detail
 * pages — is served by this one route, driven entirely by data/categories.ts and
 * data/services.ts. Adding or removing a page means changing the data, never
 * adding a file here.
 *
 * Flat routing is deliberate: four services are linked from no category on the
 * original and one is linked from two, so a /services/<category>/<service> shape
 * could not represent the source without inventing categories that do not exist.
 */
type Params = { params: Promise<{ slug: string }> };

/** slug -> the reference page it is replicated from. */
function sourceSlug(slug: string): string | null {
  const c = categories.find((x) => x.slug === slug);
  if (c) return c.source.replace(/\.html$/, '');
  const s = services.find((x) => x.slug === slug);
  if (s) return s.source.replace(/\.html$/, '');
  return null;
}

export function generateStaticParams() {
  return [
    ...categories.map((c) => ({ slug: c.slug })),
    ...services.map((s) => ({ slug: s.slug })),
  ];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const src = sourceSlug(slug);
  if (!src) return {};
  return metadataFor(await loadPage(src));
}

export default async function ServicesPage({ params }: Params) {
  const { slug } = await params;
  const src = sourceSlug(slug);
  if (!src) notFound();
  return <ReplicaPage slug={src} />;
}
