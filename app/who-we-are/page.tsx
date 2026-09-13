import type { Metadata } from 'next';
import ReplicaPage from '../ReplicaPage';
import { loadPage, metadataFor } from '../../lib/page';

const SLUG = 'who-we-are';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadPage(SLUG));
}

export default function WhoWeArePage() {
  return <ReplicaPage slug={SLUG} />;
}
