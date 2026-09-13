import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReplicaPage from '../ReplicaPage';
import { loadPage, metadataFor } from '../../lib/page';
import { standalonePages, standaloneBySlug } from '../../data/pages';

/**
 * The standalone pages, generated from data/pages.ts.
 *
 * This sits at the route root, but the static segments (/services, /fleet,
 * /who-we-are) take precedence in Next's matcher, and `dynamicParams = false`
 * means anything not in the data 404s rather than being caught here.
 */
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return standalonePages.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!standaloneBySlug(slug)) return {};
  return metadataFor(await loadPage(slug));
}

export default async function StandalonePageRoute({ params }: Params) {
  const { slug } = await params;
  if (!standaloneBySlug(slug)) notFound();
  return <ReplicaPage slug={slug} />;
}
