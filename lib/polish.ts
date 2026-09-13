/**
 * Design polish switch.
 *
 * true  — the app reads the rewritten copies made by `node _polish.mjs`
 *         (public/polish/ and content-polish/) and loads public/polish/globals.css.
 * false — the approved pixel-faithful replica, exactly as it was.
 */
export const POLISH = true;

export const contentDir = POLISH ? 'content-polish' : 'content';

/** An original asset's path, or its rewritten copy's while POLISH is on. */
export const polished = (path: string) => (POLISH ? `/polish${path}` : path);
