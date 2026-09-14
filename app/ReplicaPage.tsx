import PageScripts from './PageScripts';
import { loadPage } from '../lib/page';
import { SITE_URL } from './sitemap';

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

  // Breadcrumbs for a crawler. The trail is the route's own segments, so it
  // cannot claim a path the site does not have.
  const parts = page.route.split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', url: SITE_URL }].concat(
    parts.map((seg, i) => ({
      name: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `${SITE_URL}/${parts.slice(0, i + 1).join('/')}`,
    })),
  );

  const schema: Record<string, unknown>[] = [];
  if (parts.length) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.name, item: c.url,
      })),
    });
  }
  // Only the FAQ page has these, and they are the page's own visible text.
  if (page.faq?.length) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  // The schema is concatenated into the injected markup rather than rendered as
  // React children: a <script> in the tree is re-inserted during hydration
  // rather than matched, which left two copies of every block in the DOM.
  const schemaHtml = schema
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s).split('<').join('\u003c')}</script>`)
    .join('');

  return (
    <>
      {/* React cannot set innerHTML on a fragment, so the markup needs one
          wrapper. `display: contents` makes it generate no box at all, so the
          children lay out exactly as direct children of <body>. */}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: page.body + schemaHtml }} />
      <PageScripts scripts={page.scripts} />
    </>
  );
}
