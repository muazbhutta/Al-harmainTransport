/**
 * The one WhatsApp helper. Every WhatsApp button on the site gets its link
 * from waLink():
 *  - at build time: _polish.mjs rewrites every WhatsApp link in the page
 *    markup, header, footer and floating button;
 *  - at render: components/SiteChrome.tsx, for the guide pages;
 *  - in the browser: _polish.mjs generates public/polish/wa.js from this file,
 *    and the booking pop-up, chat widget and vehicle pop-up call
 *    window.waLink().
 *
 * Messages are short, polite and in English. Each starts with "Assalamu
 * Alaikum" and ends with the page the visitor was on, so the driver knows
 * what was viewed.
 *
 * Plain JavaScript (no imports, no exports beyond these) so the same text can
 * run in Node, in Next.js and in the browser.
 */

/** The company's own address. The export carried two others, both dead. */
export const EMAIL = 'info@alharmainumrahtransport.com';

export const WHATSAPP_NUMBER = '966565476113';
export const SITE_URL = 'https://alharmainumrahtransport.com';

// the package cards abbreviate city names ("Jed Airport to Mak Hotel")
const CITY = { Jed: 'Jeddah', Mak: 'Makkah', Med: 'Madinah' };
const expandCities = (s) => String(s).replace(/\b(Jed|Mak|Med)\b/g, (m) => CITY[m]);

const filled = (v) => v != null && String(v).trim() !== '';

/** Absolute page URL on the live domain, for a route such as "/fleet/coaster". */
export function pageUrl(route) {
  return SITE_URL + (route && route.startsWith('/') ? route : '/');
}

/**
 * The message for one button.
 *   type: general | vehicle | fleet | service | route | package | booking | b2b
 *   name: what the button is about (vehicle, service, package, office…)
 *   extra: type-specific details (see each case)
 *   url: the page the button is on
 */
export function waMessage({ type = 'general', name = '', extra = {}, url = '' } = {}) {
  let body;
  switch (type) {
    case 'vehicle': {
      // extra: { passengers, bags }
      const cap = [
        filled(extra.passengers) && `up to ${extra.passengers} passengers`,
        filled(extra.bags) && `${extra.bags} large bags`,
      ].filter(Boolean).join(', ');
      body = `I would like to book the ${name}${cap ? ` (${cap})` : ''}.`;
      break;
    }
    case 'fleet':
      body = `I would like to book the ${name}.`;
      break;
    case 'service':
      body = `I would like to book ${name}.`;
      break;
    case 'route':
      // extra: { from, to } — a label with no "to" (e.g. "Badr Ziyarat Taxi") uses name
      body = filled(extra.from) && filled(extra.to)
        ? `I would like to book a transfer from ${extra.from} to ${extra.to}.`
        : `I would like to book ${name}.`;
      break;
    case 'package': {
      // extra: { legs: ["Jed Airport to Mak Hotel", …] }
      const legs = (extra.legs || []).map(expandCities);
      body = `I would like to book ${name}${legs.length ? `: ${legs.join(' → ')}` : ''}.`;
      break;
    }
    case 'booking': {
      // extra: whatever the visitor selected
      const rows = [
        ['Trip', extra.trip], ['Route', extra.route], ['Vehicle', extra.vehicle], ['Price', extra.price],
        ['Date', extra.date], ['Pickup', extra.pickup], ['Drop-off', extra.dropoff], ['Flight', extra.flight],
        ['Passengers', extra.passengers], ['Name', extra.name],
      ].filter(([, v]) => filled(v));
      body = rows.length === 1
        ? `I would like to book: ${rows[0][1]}.`
        : `I would like to book:\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}`;
      break;
    }
    case 'quote':
      // A fare enquiry. The site quotes no figures — fares move with route,
      // vehicle and date — so the guest is handed straight to the team.
      body = 'I would like a fare for my journey.';
      break;
    case 'b2b':
      body = 'I am a travel agent and would like your B2B transport rates.';
      break;
    default:
      // name: a person or office the button belongs to, e.g. "Madinah Head Office"
      body = name
        ? `I would like to contact ${name} about your Umrah transport services.`
        : 'I would like to ask about your Umrah transport services.';
  }
  return `Assalamu Alaikum, ${body}${url ? `\nPage: ${url}` : ''}`;
}

/** https://wa.me/<number>?text=<message>. In the browser the page defaults to the one being viewed. */
export function waLink(opts = {}) {
  const url = opts.url || (typeof location !== 'undefined' ? pageUrl(location.pathname) : SITE_URL + '/');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage({ ...opts, url }))}`;
}
