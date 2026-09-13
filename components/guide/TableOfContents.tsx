'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The chapter bar: "On this page" and every chapter in one row, sticking under
 * the site header as you read — on phones as well as desktop. It highlights
 * whichever chapter is in view and keeps that one scrolled into sight.
 *
 * One of only two client components in the guide. Uses IntersectionObserver
 * rather than a scroll handler so it does no work between intersections, and
 * degrades to a plain row of anchor links if JS never runs.
 *
 * A <div role="navigation">, not a <nav>: the site's CSS pins every <nav> to
 * the top of the window.
 */
export default function TableOfContents({
  items,
  label,
}: {
  items: { id: string; title: string }[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

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
      // Bias the band towards the top of the viewport — below the header and
      // this bar — so the highlight tracks what the reader is looking at.
      { rootMargin: '-140px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  // Stick directly under the site header, whatever height it is right now:
  // 72px on desktop, 65px on a phone, taller if the brand ever wraps. Measured
  // rather than assumed, so the bar never overlaps the header or floats below it.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('nav.navbar');
    if (!header || !bar.current) return undefined;
    const apply = () => {
      bar.current?.style.setProperty('--tocbar-top', `${Math.round(header.getBoundingClientRect().height)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);

  // a chapter further along the bar is scrolled into sight as it becomes active
  useEffect(() => {
    if (!active || !list.current) return;
    const el = list.current.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [active]);

  return (
    <div role="navigation" aria-label={label} className="guide-tocbar" ref={bar}>
      <div className="guide-container guide-tocbar__inner">
        <p className="guide-tocbar__label">
          <i className="fas fa-list-ul" aria-hidden="true" />
          {label}
        </p>

        <ol className="guide-tocbar__list" ref={list}>
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                data-chapter={i.id}
                aria-current={active === i.id ? 'true' : undefined}
                className={active === i.id ? 'is-active' : ''}
              >
                {i.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
