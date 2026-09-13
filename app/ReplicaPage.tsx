import PageScripts from './PageScripts';
import { loadPage } from '../lib/page';

/**
 * Renders one replicated page.
 *
 * Every route is this component with a different slug, so the header, footer,
 * cart drawer, floating WhatsApp button and script loading behave identically
 * everywhere — there is exactly one code path for all of them.
 *
 * The original ships the nav and footer markup inside each page rather than in
 * an include, and those blocks are byte-identical across pages (verified), so
 * they are kept where the original puts them instead of being hoisted into a
 * shared component. Hoisting would change nothing visually and would introduce
 * a place for the replica to drift from the source.
 */
export default async function ReplicaPage({ slug }: { slug: string }) {
  const page = await loadPage(slug);
  return (
    <>
      {/* React cannot set innerHTML on a fragment, so the markup needs one
          wrapper. `display: contents` makes it generate no box at all, so the
          children lay out exactly as direct children of <body>. */}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: page.body }} />
      <PageScripts scripts={page.scripts} />
    </>
  );
}
