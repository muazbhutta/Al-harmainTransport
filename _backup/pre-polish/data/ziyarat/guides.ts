import type { Guide } from './types';
import en from './en';
import ur from './ur';
import urLatn from './ur-Latn';
import ar from './ar';
import fa from './fa';
import hi from './hi';
import bn from './bn';
import id from './id';
import ms from './ms';
import tr from './tr';
import fr from './fr';

/**
 * The guide content for each of the 11 languages, copied verbatim from the
 * source repo. Anchor ids are identical across every language, which is what
 * lets a reader switch language and stay on the same section.
 */
const guides: Record<string, Guide> = {
  en, ur, 'ur-Latn': urLatn, ar, fa, hi, bn, id, ms, tr, fr,
};

export function getGuide(lang: string): Guide {
  return guides[lang] ?? en;
}
