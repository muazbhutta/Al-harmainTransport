import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReplicaPage from '../../ReplicaPage';
import { loadPage, metadataFor } from '../../../lib/page';
import { vehicles, vehicleBySlug } from '../../../data/vehicles';

/**
 * All six vehicle detail pages, generated from data/vehicles.ts. Adding a
 * vehicle means adding it to the data, not adding a file here.
 */
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const v = vehicleBySlug(slug);
  if (!v) return {};
  return metadataFor(await loadPage(v.source.replace(/\.html$/, '')));
}

export default async function VehiclePage({ params }: Params) {
  const { slug } = await params;
  const v = vehicleBySlug(slug);
  if (!v) notFound();
  return <ReplicaPage slug={v.source.replace(/\.html$/, '')} />;
}
