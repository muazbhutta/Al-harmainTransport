/**
 * Shared helpers for the site chrome.
 *
 * `addGuideLinks` is the ONE intentional divergence from the original markup:
 * it adds "Ziyarat Guide" to the main nav and the footer's Quick Links, as a new
 * section of the site that the original does not have. It is applied uniformly
 * to every page and to the standalone chrome, so the navigation is identical
 * everywhere.
 */

export const GUIDE_HREF = '/ziyarat-guide';
export const GUIDE_LABEL = 'Ziyarat Guide';

const NAV_ITEM =
  `<li class="nav-item">\n                    <a class="nav-link" href="${GUIDE_HREF}">${GUIDE_LABEL}</a>\n                </li>\n                `;

const FOOTER_ITEM = `<li><a href="${GUIDE_HREF}">${GUIDE_LABEL}</a></li>`;

/** Inserts the guide into the nav (after the Vehicles dropdown) and the footer. */
export function addGuideLinks(html) {
  if (html.includes(GUIDE_HREF)) return html; // already applied

  // --- nav: the Vehicles dropdown is the last top-level item; add after it.
  const vehiclesIdx = html.indexOf('>Vehicles</a>');
  if (vehiclesIdx !== -1) {
    // find the </li> that closes that dropdown's <li>
    const ulEnd = html.indexOf('</ul>', vehiclesIdx);
    const liEnd = html.indexOf('</li>', ulEnd);
    if (liEnd !== -1) {
      const at = liEnd + '</li>'.length;
      html = html.slice(0, at) + '\n                ' + NAV_ITEM.trimEnd() + html.slice(at);
    }
  }

  // --- footer: append to the Quick Links list.
  const qlIdx = html.indexOf('Quick Links');
  if (qlIdx !== -1) {
    const ulStart = html.indexOf('<ul', qlIdx);
    const ulEnd = html.indexOf('</ul>', ulStart);
    if (ulStart !== -1 && ulEnd !== -1) {
      html = html.slice(0, ulEnd) + FOOTER_ITEM + html.slice(ulEnd);
    }
  }

  return html;
}
