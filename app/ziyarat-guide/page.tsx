import { redirect } from 'next/navigation';

/** /ziyarat-guide -> the English guide. */
export default function ZiyaratGuideIndex() {
  redirect('/ziyarat-guide/en');
}
