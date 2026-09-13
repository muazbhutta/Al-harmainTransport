/*
 * Runtime half of the design audit. Evaluated inside each page (same-origin
 * iframe), it measures what the browser actually renders: computed colours,
 * type, spacing, radii, shadows, plus component consistency and alignment.
 *
 * Returns a compact JSON-able object. Read-only: it changes nothing except
 * neutralising `content-visibility` and lazy loading so off-screen elements
 * report their real size (both would otherwise fake the measurements).
 */
(async () => {
  const doc = document;

  /* make measurement honest */
  const st = doc.createElement('style');
  st.textContent = '*{content-visibility:visible !important}';
  doc.head.appendChild(st);
  doc.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
  await Promise.race([
    Promise.all([...doc.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = r; i.onerror = r; })))),
    new Promise((r) => setTimeout(r, 6000)),
  ]);
  try { await doc.fonts.ready; } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 300));

  const round = (n) => Math.round(n * 10) / 10;
  // computed colours come as rgb()/rgba(), or — for color-mix() — as
  // `color(srgb r g b / a)` with 0–1 channels
  const channels = (c) => {
    const s = c || '';
    const cm = s.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (cm) return [cm[1] * 255, cm[2] * 255, cm[3] * 255, cm[4] === undefined ? 1 : +cm[4]];
    const m = s.match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1];
  };
  const hex = (c) => {
    const m = channels(c);
    if (!m) return null;
    const [r, g, b, a] = m;
    if (a === 0) return null;
    const h = '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    return a < 1 ? `${h}@${a.toFixed(2)}` : h;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
    return { r, cs };
  };
  const sel = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls.length ? '.' + cls.join('.') : '');
  };
  const buckets = {};
  const bump = (bucket, key, where) => {
    if (!key) return;
    const b = (buckets[bucket] ??= {});
    const e = (b[key] ??= { n: 0, where: [] });
    e.n += 1;
    if (e.where.length < 3 && !e.where.includes(where)) e.where.push(where);
  };

  /* ---------------------------------------------------- value inventory */
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'BR', 'TEMPLATE', 'LINK', 'META']);
  const els = [...doc.body.querySelectorAll('*')].filter((e) => !SKIP.has(e.tagName) && !e.closest('svg'));
  for (const el of els) {
    const v = visible(el);
    if (!v) continue;
    const { cs } = v;
    const s = sel(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasText) {
      bump('textColour', hex(cs.color), s);
      bump('type', [
        cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing === 'normal' ? 'ls:normal' : 'ls:' + cs.letterSpacing,
        cs.textTransform === 'none' ? '' : cs.textTransform,
      ].join(' | '), s);
    }
    bump('background', hex(cs.backgroundColor), s);
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) bump('gradient', cs.backgroundImage.slice(0, 110), s);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const w = parseFloat(cs[`border${side}Width`]);
      if (w > 0 && cs[`border${side}Style`] !== 'none') bump('border', `${round(w)}px ${hex(cs[`border${side}Color`]) || 'transparent'}`, s);
    }
    if (cs.boxShadow !== 'none') bump('shadow', cs.boxShadow, s);
    if (cs.borderRadius && cs.borderRadius !== '0px') bump('radius', cs.borderRadius, s);
    for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      if (cs[p] !== '0px') bump('padding', cs[p], s);
    }
    for (const p of ['marginTop', 'marginBottom']) {
      if (cs[p] !== '0px') bump('margin', cs[p], s);
    }
    if (/(flex|grid)/.test(cs.display) && cs.gap && !['normal', '0px', 'normal normal'].includes(cs.gap)) bump('gap', cs.gap, s);
    if (cs.transitionDuration && cs.transitionDuration !== '0s') bump('transition', cs.transitionDuration.split(',')[0], s);
  }

  const pick = (q) => [...new Set([...doc.querySelectorAll(q)])].filter((e) => visible(e));
  const rect = (el) => el.getBoundingClientRect();
  const Y = (r) => r.top + window.scrollY;

  /* ------------------------------------------------------------ buttons */
  const BTN = 'a.btn, button.btn, .btn, .primary-button, .secondary-button, .guide-btn, .fab-btn, .btn-action, a[class*="button"], button[type="submit"]';
  const buttons = pick(BTN).map((el) => {
    const cs = getComputedStyle(el);
    const r = rect(el);
    return {
      el,
      s: sel(el),
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28),
      h: round(r.height), top: round(Y(r)), left: round(r.left), right: round(r.right),
      sig: [
        `h${round(r.height)}`, `pad ${cs.paddingTop} ${cs.paddingLeft}`, `r ${cs.borderRadius}`,
        `bg ${hex(cs.backgroundColor) || (cs.backgroundImage.includes('gradient') ? 'gradient' : 'none')}`,
        `fg ${hex(cs.color)}`, `${cs.fontSize}/${cs.fontWeight}`,
        parseFloat(cs.borderTopWidth) ? `b ${cs.borderTopWidth} ${hex(cs.borderTopColor)}` : 'b none',
      ].join(' · '),
      transition: cs.transitionDuration,
    };
  });
  for (const b of buttons) bump('buttonStyle', b.sig, `${b.s} "${b.text}"`);

  // side-by-side buttons of different heights
  const btnMismatch = [];
  const sorted = [...buttons].sort((a, b) => a.top - b.top || a.left - b.left);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const sameRow = Math.abs((a.top + a.h / 2) - (b.top + b.h / 2)) < 6;
      const near = b.left - a.right < 48 && b.left > a.left;
      if (sameRow && near && Math.abs(a.h - b.h) > 1) {
        btnMismatch.push(`"${a.text}" ${a.h}px beside "${b.text}" ${b.h}px`);
      }
    }
  }

  /* --------------------------------------------------------------- cards */
  const isCard = (el) => {
    const c = typeof el.className === 'string' ? el.className : '';
    if (!/card|features-box|guide-(scripture|location|callout|infocard)(?![\w-])/.test(c)) return false;
    if (/__|card-(body|title|text|img|overlay|header|footer)|cards-|card-container|scroll-container/.test(c)) return false;
    return true;
  };
  const cardLike = els.filter((e) => isCard(e) && visible(e));
  // a card's own image wrapper / category pill also matches /card/ — keep outermost only
  const cards = cardLike.filter((c) => !cardLike.some((o) => o !== c && o.contains(c)));
  for (const c of cards) {
    const cs = getComputedStyle(c);
    bump('cardStyle', [
      `r ${cs.borderRadius}`, `pad ${cs.padding}`,
      `bg ${hex(cs.backgroundColor) || (cs.backgroundImage.includes('gradient') ? 'gradient' : 'none')}`,
      parseFloat(cs.borderTopWidth) ? `b ${round(parseFloat(cs.borderTopWidth))}px ${hex(cs.borderTopColor)}` : 'b none',
      cs.boxShadow === 'none' ? 'no shadow' : 'shadow',
    ].join(' · '), sel(c));
  }

  // rows of sibling cards: unequal heights / image aspects / button baselines
  const rowIssues = [];
  const groups = new Map();
  for (const c of cards) {
    // cards often sit inside a column wrapper; group by the grid/row container
    const row = c.parentElement.closest('.row, [class*="grid"], .service-carousel') || c.parentElement;
    if (!groups.has(row)) groups.set(row, []);
    groups.get(row).push(c);
  }
  for (const [row, list] of groups) {
    if (list.length < 2) continue;
    const lines = {};
    for (const c of list) {
      const t = Math.round(Y(rect(c)) / 6) * 6;
      (lines[t] ??= []).push(c);
    }
    for (const line of Object.values(lines)) {
      if (line.length < 2) continue;
      const hs = line.map((c) => round(rect(c).height));
      const hSpread = round(Math.max(...hs) - Math.min(...hs));
      const aspects = line.map((c) => {
        const img = c.querySelector('img');
        if (!img) return null;
        const r = rect(img);
        return r.height ? round(r.width / r.height) : null;
      }).filter((x) => x !== null);
      const aSpread = aspects.length > 1 ? round(Math.max(...aspects) - Math.min(...aspects)) : 0;
      const btnGaps = line.map((c) => {
        const b = [...c.querySelectorAll(BTN)].pop();
        return b ? round(rect(c).bottom - rect(b).bottom) : null;
      }).filter((x) => x !== null);
      const bSpread = btnGaps.length > 1 ? round(Math.max(...btnGaps) - Math.min(...btnGaps)) : 0;
      if (hSpread > 1 || aSpread > 0.02 || bSpread > 1) {
        rowIssues.push({
          row: sel(row), cards: line.length, card: sel(line[0]),
          heights: hs, heightSpread: hSpread,
          imgAspects: aspects, aspectSpread: aSpread,
          buttonBottomGap: btnGaps, buttonSpread: bSpread,
        });
      }
    }
  }

  /* ------------------------------------------------- headings & badges */
  for (const h of pick('h1, h2, h3')) {
    const cs = getComputedStyle(h);
    bump(`${h.tagName.toLowerCase()}Style`, [
      cs.fontSize, cs.fontWeight, `lh ${cs.lineHeight}`, cs.letterSpacing === 'normal' ? '' : `ls ${cs.letterSpacing}`,
      cs.textTransform === 'none' ? '' : cs.textTransform, `align ${cs.textAlign}`, `mb ${cs.marginBottom}`, hex(cs.color),
    ].filter(Boolean).join(' · '), `${sel(h)} "${(h.textContent || '').trim().slice(0, 30)}"`);
  }
  for (const b of pick('.badge, [class*="badge"], [class*="pill"], [class*="chip"], [class*="eyebrow"]')) {
    const cs = getComputedStyle(b);
    bump('badgeStyle', [
      `${cs.fontSize}/${cs.fontWeight}`, cs.letterSpacing === 'normal' ? '' : `ls ${cs.letterSpacing}`,
      cs.textTransform === 'none' ? '' : cs.textTransform, `r ${cs.borderRadius}`, `pad ${cs.padding}`,
      `bg ${hex(cs.backgroundColor) || 'none'}`, `fg ${hex(cs.color)}`,
    ].filter(Boolean).join(' · '), sel(b));
  }

  /* --------------------------------------------------------------- images */
  const imgRows = {};
  for (const img of pick('img')) {
    const r = rect(img);
    const cs = getComputedStyle(img);
    if (r.width < 24) continue; // icons / logos-in-text
    const key = `${Math.round(Y(r) / 6) * 6}|${sel(img.parentElement)}`;
    (imgRows[key] ??= []).push({
      src: (img.getAttribute('src') || '').split('/').pop().slice(0, 40),
      ar: round(r.width / r.height), natural: img.naturalHeight ? round(img.naturalWidth / img.naturalHeight) : null,
      fit: cs.objectFit, radius: cs.borderRadius, w: round(r.width), h: round(r.height),
    });
    const stretched = img.naturalHeight && cs.objectFit === 'fill'
      && Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) > 0.05;
    if (stretched) bump('stretchedImage', `${(img.getAttribute('src') || '').split('/').pop().slice(0, 40)}  rendered ${round(r.width / r.height)} vs natural ${round(img.naturalWidth / img.naturalHeight)}`, sel(img));
    bump('imageRadius', cs.borderRadius, sel(img));
  }
  const imgRowIssues = Object.values(imgRows).filter((row) => row.length > 1).map((row) => {
    const ars = row.map((x) => x.ar);
    const radii = [...new Set(row.map((x) => x.radius))];
    return { count: row.length, aspects: ars, spread: round(Math.max(...ars) - Math.min(...ars)), radii, sample: row[0].src };
  }).filter((x) => x.spread > 0.02 || x.radii.length > 1);

  /* ------------------------------------------------ sections & rhythm */
  const sectionPad = {};
  for (const s of pick('main section, body > section, section, footer')) {
    const cs = getComputedStyle(s);
    const k = `${cs.paddingTop} / ${cs.paddingBottom}`;
    (sectionPad[k] ??= []).push(sel(s));
  }
  const headingGap = {};
  for (const h of pick('section h2, section .section-title')) {
    // a heading sharing a flex row with a button: measure from that row instead
    let a = h;
    let next = null;
    for (let up = 0; up < 4 && a && !next; up++) {
      let n = a.nextElementSibling;
      while (n && !visible(n)) n = n.nextElementSibling;
      if (n && rect(n).top >= rect(a).bottom - 1) next = n;
      else a = a.parentElement;
    }
    if (!next) continue;
    const g = round(rect(next).top - rect(a).bottom);
    (headingGap[`${g}px`] ??= []).push(`${sel(h)} "${(h.textContent || '').trim().slice(0, 24)}"`);
  }

  /* ------------------------------------------------- containers & edges */
  const containers = {};
  for (const c of pick('.container, .container-fluid, .guide-container, .page-container')) {
    const r = rect(c);
    const cs = getComputedStyle(c);
    const k = `left ${round(r.left + parseFloat(cs.paddingLeft))} · width ${round(r.width)}`;
    (containers[k] ??= []).push(sel(c));
  }
  // start edge in the element's own direction: RTL content is measured from the right ("R")
  const contentLeft = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    if (cs.direction === 'rtl') {
      const right = rect(el).right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      return `${round(doc.documentElement.clientWidth - right)}R`;
    }
    return round(rect(el).left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth));
  };
  const firstText = (q) => pick(q).find((e) => (e.textContent || '').trim().length > 50);
  const edges = {
    logo: contentLeft(doc.querySelector('.navbar-brand img, .navbar-brand')),
    h1: contentLeft(pick('h1')[0]),
    firstH2: contentLeft(pick('main h2, section h2, h2')[0]),
    bodyText: contentLeft(firstText('main p, section p')),
    footerFirstColumn: contentLeft(doc.querySelector('.main-site-footer .row > *, footer .row > *')),
  };

  /* --------------------------------------------------- icon centring */
  const iconOffsets = {};
  let iconWorst = [];
  for (const i of pick('i[class*="fa-"]')) {
    const p = i.parentElement;
    const tn = [...p.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!tn) continue;
    const range = doc.createRange();
    range.selectNodeContents(tn);
    const tr = range.getClientRects()[0];
    if (!tr) continue;
    const ir = rect(i);
    const off = round((ir.top + ir.height / 2) - (tr.top + tr.height / 2));
    iconOffsets[`${off}px`] = (iconOffsets[`${off}px`] || 0) + 1;
    if (Math.abs(off) > 1.5) iconWorst.push({ off, icon: (i.className || '').toString().match(/fa-[a-z0-9-]+/g)?.pop(), in: sel(p), text: tn.textContent.trim().slice(0, 24) });
  }
  iconWorst = iconWorst.sort((a, b) => Math.abs(b.off) - Math.abs(a.off)).slice(0, 8);

  /* --------------------------------------------------- inner page header */
  const h1 = pick('h1')[0];
  let header = null;
  if (h1) {
    const band = h1.closest('section, header, .page-hero, .hero-section') || h1.parentElement;
    const bcs = getComputedStyle(band);
    const sub = h1.nextElementSibling && visible(h1.nextElementSibling) ? h1.nextElementSibling : null;
    const crumb = band.querySelector('.breadcrumb, [aria-label*="readcrumb" i], .guide-breadcrumb');
    header = {
      band: sel(band),
      bandPadding: `${bcs.paddingTop} / ${bcs.paddingBottom}`,
      bandHeight: round(rect(band).height),
      breadcrumb: Boolean(crumb),
      h1: `${getComputedStyle(h1).fontSize}/${getComputedStyle(h1).fontWeight}`,
      h1Align: getComputedStyle(h1).textAlign,
      subtitle: sub ? `${sel(sub)} ${getComputedStyle(sub).fontSize} gap ${round(rect(sub).top - rect(h1).bottom)}px` : null,
    };
  }

  /* ------------------------------------------------------ focus rings */
  const focusables = pick('a[href], button, input, select, textarea').slice(0, 400);
  let noFocusStyle = 0;
  const focusSamples = [];
  for (const el of focusables) {
    const cs = getComputedStyle(el);
    // `outline: none` with no box-shadow substitute is the usual way focus gets lost
    if ((cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0) && cs.boxShadow === 'none') {
      noFocusStyle += 1;
      if (focusSamples.length < 5) focusSamples.push(sel(el));
    }
  }

  /* ------------------------------------------------------------ contrast */
  // Every text element against what is actually painted behind it: ancestor
  // backgrounds are composited bottom-up, and each gradient stop is tried, so
  // the worst case is reported. Text over a photo is counted, not judged.
  const parseC = (c) => {
    const m = channels(c);
    return m ? { r: m[0], g: m[1], b: m[2], a: m[3] } : null;
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a), a: 1,
  });
  const lumC = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratioC = (x, y) => { const [p, q] = [lumC(x), lumC(y)].sort((a, b) => b - a); return (p + 0.05) / (q + 0.05); };
  const hexC = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const rootBg = [doc.documentElement, doc.body].map((e) => parseC(getComputedStyle(e).backgroundColor)).find((c) => c && c.a > 0) || { r: 255, g: 255, b: 255, a: 1 };

  function backdrops(el) {
    const layers = [];
    let op = 1;
    for (let e = el; e && e !== doc.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      op *= +cs.opacity;
      if (cs.backgroundImage.includes('url(')) return { image: true };
      const stops = cs.backgroundImage.includes('gradient') ? (cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).map(parseC) : [];
      const bg = parseC(cs.backgroundColor);
      layers.push({ bg: bg && bg.a > 0 ? { ...bg, a: bg.a } : null, stops });
      if ((bg && bg.a >= 0.999) || (stops.length && stops.every((s) => s.a >= 0.999))) break;
    }
    if (op < 0.1) return { hidden: true };
    let cands = [rootBg];
    for (const L of layers.reverse()) {
      if (L.bg) cands = cands.map((c) => over(L.bg, c));
      if (L.stops.length) cands = L.stops.flatMap((s) => cands.map((c) => over(s, c))).slice(0, 24);
    }
    return { cands };
  }

  const contrast = { checked: 0, pass: 0, fail: 0, overImage: 0, fails: [] };
  for (const el of els) {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    const v = visible(el);
    if (!v) continue;
    const bd = backdrops(el);
    if (bd.hidden) continue;
    if (bd.image) { contrast.overImage += 1; continue; }
    const fg = parseC(v.cs.color);
    if (!fg) continue;
    let worst = Infinity;
    let worstBg = null;
    for (const c of bd.cands) {
      const r = ratioC(fg.a < 1 ? over(fg, c) : fg, c);
      if (r < worst) { worst = r; worstBg = c; }
    }
    const size = parseFloat(v.cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && +v.cs.fontWeight >= 700);
    const need = large ? 3 : 4.5;
    contrast.checked += 1;
    if (worst >= need) { contrast.pass += 1; continue; }
    contrast.fail += 1;
    if (contrast.fails.length < 40) {
      contrast.fails.push({
        sel: sel(el), text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
        fg: hexC(fg) + (fg.a < 1 ? `@${fg.a}` : ''), bg: hexC(worstBg), ratio: Math.round(worst * 100) / 100, need, size,
      });
    }
  }

  /* ---------------------------------------------------------- typography */
  const SCALE_PX = [12, 14, 16, 18, 20, 24, 30, 36, 48];
  const typeCheck = { checked: 0, offScale: [], offScaleN: 0, weights: {}, headingLH: {}, bodyLH: {}, capsLS: {}, measureOver: [], centredOff: [] };
  const inc = (o, k, ex) => { const e = (o[k] ??= { n: 0, ex }); e.n += 1; };
  const canvas = doc.createElement('canvas').getContext('2d');
  for (const el of els) {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    const v = visible(el);
    if (!v) continue;
    const cs = v.cs;
    const size = parseFloat(cs.fontSize);
    const tag = el.tagName.toLowerCase();
    typeCheck.checked += 1;
    if (!SCALE_PX.some((s) => Math.abs(s - size) < 0.5)) {
      typeCheck.offScaleN += 1;
      if (typeCheck.offScale.length < 25) typeCheck.offScale.push({ size: Math.round(size * 100) / 100, sel: sel(el), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) });
    }
    inc(typeCheck.weights, cs.fontWeight, sel(el));
    const lh = parseFloat(cs.lineHeight);
    if (Number.isFinite(lh)) {
      const ratio = (Math.round((lh / size) * 20) / 20).toFixed(2);   // to the nearest 0.05
      if (/^h[1-6]$/.test(tag)) inc(typeCheck.headingLH, ratio, sel(el));
      else if (/^(p|li|dd|blockquote|figcaption|td|th)$/.test(tag)) inc(typeCheck.bodyLH, ratio, sel(el));
    }
    if (cs.textTransform === 'uppercase') {
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      inc(typeCheck.capsLS, `${(Math.round((ls / size) * 100) / 100).toFixed(2)}em`, `${sel(el)} "${el.textContent.trim().slice(0, 20)}"`);
    }
    if (tag === 'p' && el.textContent.trim().length > 80) {
      canvas.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ch = canvas.measureText('0').width;
      const inner = v.r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const perLine = Math.round(inner / ch);
      if (perLine > 72 && typeCheck.measureOver.length < 20) typeCheck.measureOver.push({ sel: sel(el), ch: perLine, text: el.textContent.trim().slice(0, 30) });
      if (cs.textAlign === 'center') {
        const p = el.parentElement.getBoundingClientRect();
        const pcs = getComputedStyle(el.parentElement);
        const mid = p.left + parseFloat(pcs.paddingLeft) + (p.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)) / 2;
        const off = Math.round(v.r.left + v.r.width / 2 - mid);
        if (Math.abs(off) > 2 && typeCheck.centredOff.length < 20) typeCheck.centredOff.push({ sel: sel(el), off, text: el.textContent.trim().slice(0, 30) });
      }
    }
  }

  return {
    typeCheck,
    contrast,
    docHeight: doc.documentElement.scrollHeight,
    overflowX: doc.documentElement.scrollWidth > window.innerWidth + 1,
    buckets,
    buttons: buttons.length,
    btnMismatch: [...new Set(btnMismatch)].slice(0, 12),
    cards: cards.length,
    rowIssues: rowIssues.slice(0, 20),
    imgRowIssues: imgRowIssues.slice(0, 20),
    sectionPad,
    headingGap,
    containers,
    edges,
    iconOffsets,
    iconWorst,
    header,
    focus: { checked: focusables.length, withoutAnyRestingOutline: noFocusStyle, samples: focusSamples },
  };
})();
