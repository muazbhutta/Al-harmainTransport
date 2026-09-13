'use client';

import { useEffect, useState } from 'react';

/**
 * Language switcher for the guide.
 *
 * Keeps the reader's place: the current `#anchor` is carried onto the new
 * language's URL, which works because anchor ids are identical across all 11
 * languages. The choice is remembered so the guide opens in the same language
 * next time.
 *
 * Plain links, so it works with JS disabled — the anchor-preserving and
 * remembering behaviour is the progressive enhancement.
 */
export type GuideLang = { code: string; native: string; dir: 'ltr' | 'rtl' };

export default function LanguageSwitcher({
  langs,
  current,
  label,
}: {
  langs: GuideLang[];
  current: string;
  label: string;
}) {
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('ziyarat-lang', current);
    } catch {
      // Private mode / storage disabled — remembering is a convenience, not a
      // requirement, so a failure here must not break the page.
    }
  }, [current]);

  return (
    <div className="guide-langs" role="group" aria-label={label}>
      <span className="guide-langs__label">{label}</span>
      <ul className="guide-langs__list list-unstyled mb-0">
        {langs.map((l) => (
          <li key={l.code}>
            <a
              href={`/ziyarat-guide/${l.code}${hash}`}
              hrefLang={l.code}
              lang={l.code}
              dir={l.dir}
              aria-current={l.code === current ? 'true' : undefined}
              className={l.code === current ? 'is-active' : ''}
            >
              {l.native}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
