import type { GuideBlock } from '../data/ziyarat/types';

/**
 * Renders the guide's content blocks.
 *
 * Server Component, no state, no client JS. Styling uses the site's own
 * Bootstrap classes and CSS variables so the guide sits inside the existing
 * design rather than looking like a separate project.
 *
 * Qur'anic and hadith text is rendered verbatim, with its citation, exactly as
 * the source data carries it.
 */

/** Arabic scripture always renders RTL, whatever language the reader chose. */
const ARABIC: React.CSSProperties = {
  direction: 'rtl',
  textAlign: 'right',
  fontSize: '1.5rem',
  lineHeight: 2.1,
  color: 'var(--color-text-heading)',
};

const CARD: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  background: 'linear-gradient(145deg, var(--color-surface-start), var(--color-surface-end))',
};

function Block({ block, labels }: { block: GuideBlock; labels: Labels }) {
  switch (block.type) {
    case 'p':
      return <p className="mb-3">{block.text}</p>;

    case 'h3':
      return (
        <h3 id={block.id} className="mt-5 mb-3" style={{ scrollMarginTop: '90px' }}>
          {block.text}
        </h3>
      );

    case 'h4':
      return <h4 className="mt-4 mb-2">{block.text}</h4>;

    case 'note':
      return (
        <div
          className="p-3 my-4"
          style={{
            ...CARD,
            borderInlineStart: `4px solid ${block.variant === 'warning' ? 'var(--color-error)' : 'var(--color-brand-primary)'}`,
          }}
        >
          <p className="mb-0">{block.text}</p>
        </div>
      );

    case 'callout':
      return (
        <div className="p-4 my-4" style={CARD}>
          {block.title ? (
            <h4 className="mb-2" style={{ color: 'var(--color-brand-primary)' }}>{block.title}</h4>
          ) : null}
          <p className="mb-0">{block.text}</p>
        </div>
      );

    case 'list':
      return block.ordered ? (
        <ol className="mb-4 ps-4">{block.items.map((t, i) => <li key={i} className="mb-2">{t}</li>)}</ol>
      ) : (
        <ul className="mb-4 ps-4">{block.items.map((t, i) => <li key={i} className="mb-2">{t}</li>)}</ul>
      );

    case 'verse':
      return (
        <figure className="p-4 my-4" style={{ ...CARD, borderInlineStart: '4px solid var(--color-brand-primary)' }}>
          {block.pending ? (
            <p className="mb-0 fst-italic text-muted">{labels.pending}</p>
          ) : (
            <>
              {block.arabic ? <p lang="ar" dir="rtl" style={ARABIC} className="mb-3">{block.arabic}</p> : null}
              {block.translation ? <blockquote className="mb-2">{block.translation}</blockquote> : null}
              {block.reference ? (
                <figcaption className="small" style={{ color: 'var(--color-brand-primary)' }}>
                  {block.reference}
                </figcaption>
              ) : null}
            </>
          )}
        </figure>
      );

    case 'hadith':
      return (
        <figure className="p-4 my-4" style={CARD}>
          <span
            className="badge mb-2"
            style={{ background: 'var(--color-brand-primary)', color: 'var(--color-text-on-brand)' }}
          >
            {block.badge ?? labels.hadith}
          </span>
          {block.pending ? (
            <p className="mb-0 fst-italic text-muted">{labels.pending}</p>
          ) : (
            <>
              {block.arabic ? <p lang="ar" dir="rtl" style={ARABIC} className="mb-3">{block.arabic}</p> : null}
              {block.text ? <blockquote className="mb-2">{block.text}</blockquote> : null}
              {block.source ? (
                <figcaption className="small" style={{ color: 'var(--color-brand-primary)' }}>
                  {block.source}
                </figcaption>
              ) : null}
            </>
          )}
        </figure>
      );

    case 'steps':
      return (
        <ol className="mb-4 ps-0" style={{ listStyle: 'none' }}>
          {block.items.map((s, i) => (
            <li key={i} className="d-flex gap-3 mb-3">
              <span
                aria-hidden
                className="flex-shrink-0 d-inline-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--color-brand-primary)', color: 'var(--color-text-on-brand)',
                }}
              >
                {i + 1}
              </span>
              <span>
                <strong className="d-block mb-1">{s.title}</strong>
                {s.text}
              </span>
            </li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div className="my-4" style={{ ...CARD, overflowX: 'auto' }}>
          <table className="table table-dark table-striped mb-0" style={{ background: 'transparent' }}>
            {block.caption ? <caption className="px-3 pb-3">{block.caption}</caption> : null}
            <thead>
              <tr>{block.columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'infocard':
      return (
        <section className="p-4 my-4" style={CARD}>
          <h4 className="mb-3" style={{ color: 'var(--color-brand-primary)' }}>{block.title}</h4>
          {block.blocks.map((b, i) => <Block key={i} block={b} labels={labels} />)}
        </section>
      );

    default:
      return null;
  }
}

export type Labels = { hadith: string; pending: string };

export default function GuideBlocks({
  blocks,
  labels,
}: {
  blocks: GuideBlock[];
  labels: Labels;
}) {
  return <>{blocks.map((b, i) => <Block key={i} block={b} labels={labels} />)}</>;
}
