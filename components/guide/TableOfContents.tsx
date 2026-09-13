'use client';

import { useEffect, useState } from 'react';

/**
 * "On this page" — sticky on desktop, collapsible on mobile, and it highlights
 * whichever chapter is currently in view.
 *
 * One of only two client components in the guide. Uses IntersectionObserver
 * rather than a scroll handler so it does no work between intersections, and
 * degrades to a plain list of anchor links if JS never runs.
 */
export default function TableOfContents({
  items,
  label,
}: {
  items: { id: string; title: string }[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        // The topmost heading currently intersecting wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band towards the top of the viewport so the highlight tracks
      // what the reader is actually looking at.
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="guide-toc">
      <button
        type="button"
        className="guide-toc__toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>

      <div className={`guide-toc__panel ${open ? 'is-open' : ''}`}>
        <p className="guide-toc__title d-none d-lg-block">{label}</p>
        <ol>
          {items.map((i, n) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? 'true' : undefined}
                className={active === i.id ? 'is-active' : ''}
                onClick={() => setOpen(false)}
              >
                <span className="guide-toc__num">{n + 1}.</span> {i.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
