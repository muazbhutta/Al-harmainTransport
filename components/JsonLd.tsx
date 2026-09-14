/**
 * A JSON-LD block that survives hydration.
 *
 * A <script> rendered as a React child is re-inserted rather than matched when
 * React hydrates the page, which left two copies of every schema block in the
 * DOM — the served HTML was correct, the rendered page was not. Injecting it as
 * markup keeps it opaque to React, so exactly one copy exists either way.
 *
 * `display: contents` means the wrapper generates no box, so it cannot affect
 * layout wherever it is placed.
 */
export default function JsonLd({ data }: { data: unknown }) {
  // `<` is escaped so a stray "</script>" inside any string cannot close the tag
  const json = JSON.stringify(data).split('<').join('\\u003c');

  return (
    <div
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: `<script type="application/ld+json">${json}</script>` }}
    />
  );
}
