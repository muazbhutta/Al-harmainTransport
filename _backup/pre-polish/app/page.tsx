import type { Metadata } from 'next';
import ReplicaPage from './ReplicaPage';
import { loadPage, metadataFor } from '../lib/page';

const SLUG = 'index';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor(await loadPage(SLUG));
}

export default function HomePage() {
  return <ReplicaPage slug={SLUG} />;
}
