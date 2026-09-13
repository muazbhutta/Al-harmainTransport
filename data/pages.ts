// The standalone pages: everything that is not the home page, a service or a
// vehicle. Routes keep the original's own file names, so every existing link on
// the site already points at them without rewriting.

export type StandalonePage = {
  /** Route segment and reference file stem — they are the same here. */
  slug: string;
  /** The original page's <title>, carried over unchanged. */
  title: string;
  /** True when nothing on the site links to it. */
  unlinked?: boolean;
};

export const standalonePages: StandalonePage[] = [
  { slug: 'book-now', title: 'Book Transport | MCOM' },
  { slug: 'customer-faqs', title: 'Customer Terms & FAQs' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'partner-terms', title: 'Partner Terms & Conditions' },
  { slug: 'refund-policy', title: 'Refund Policy' },
  { slug: 'airport-pickup-guidelines', title: 'Airport Pickup Guidelines' },
  // Reachable only by typing the URL — no navigation on the original links here.
  { slug: 'blog', title: 'Our Blog', unlinked: true },
];

export const standaloneBySlug = (slug: string) =>
  standalonePages.find((p) => p.slug === slug);
