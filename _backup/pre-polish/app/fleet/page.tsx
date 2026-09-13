import type { Metadata } from 'next';
import ReplicaPage from '../ReplicaPage';
import { loadPage, metadataFor } from '../../lib/page';

const SLUG = 'all-fleet';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadPage(SLUG));
}

/** /fleet — the full gallery page (all-fleet.html). */
export default function FleetPage() {
  return <ReplicaPage slug={SLUG} />;
}
