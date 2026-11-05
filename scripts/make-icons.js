// Regenerates every file in assets/ (icon, adaptive layers, splash, favicon).
// Usage: node scripts/make-icons.js assets   (needs Playwright: npm i -D playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];

// Artwork centred in a 1024 box, kept inside the adaptive-icon safe zone.
const art = (fill) => `
<defs>
  <mask id="carMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#fff"/>
    <!-- windows -->
    <path d="M452 470 L480 440 Q485 436 492 436 L506 436 L506 470 Z" fill="#000"/>
    <path d="M528 436 L552 436 Q560 436 565 441 L592 470 L528 470 Z" fill="#000"/>
    <!-- wheel arches -->
    <circle cx="418" cy="560" r="52" fill="#000"/>
    <circle cx="606" cy="560" r="52" fill="#000"/>
  </mask>
</defs>
<g fill="${fill}">
  <!-- scan frame corners -->
  <g fill="none" stroke="${fill}" stroke-width="38" stroke-linecap="round" stroke-linejoin="round">
    <path d="M277 367 V297 Q277 277 297 277 H367"/>
    <path d="M657 277 H727 Q747 277 747 297 V367"/>
    <path d="M747 657 V727 Q747 747 727 747 H657"/>
    <path d="M367 747 H297 Q277 747 277 727 V657"/>
  </g>
</g>
<g transform="translate(512 512) scale(1.38) translate(-512 -495)"><g mask="url(#hubMask)"><g fill="${fill}">
  <!-- car body -->
  <g mask="url(#carMask)">
    <path d="M356 548 V504 Q356 488 376 484 L436 472 L466 436 Q474 428 488 428 L558 428 Q574 428 584 438 L614 472 L650 484 Q668 488 668 504 V548 Q668 562 654 562 H370 Q356 562 356 548 Z"/>
  </g>
  <!-- wheels -->
  <circle cx="418" cy="560" r="36"/>
  <circle cx="606" cy="560" r="36"/>
</g></g></g>`;

const wheelHubs = (c) => `<circle cx="418" cy="560" r="13" fill="${c}"/><circle cx="606" cy="560" r="13" fill="${c}"/>`;
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F9BFF"/><stop offset="1" stop-color="#1D3FB8"/></linearGradient></defs>`;
const svg = (inner, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${extra}${inner}</svg>`;
// Hubs punched out of wheels via a second mask-free trick: draw in bg colour only where bg is solid.
const hubCut = `<mask id="hubMask"><rect width="1024" height="1024" fill="#fff"/><circle cx="418" cy="560" r="13" fill="#000"/><circle cx="606" cy="560" r="13" fill="#000"/></mask>`;
const wrapArt = (fill) => art(fill);

const scaled = (s, inner) => `<g transform="translate(512 512) scale(${s}) translate(-512 -512)">${inner}</g>`;

const files = {
  // full-bleed legacy / iOS icon, artwork slightly larger
  'icon.png': { w: 1024, bg: true, svg: svg(`<rect width="1024" height="1024" fill="url(#g)"/>${scaled(1.12, wrapArt('#fff'))}`, grad + hubCut) },
  'android-icon-background.png': { w: 1024, bg: true, svg: svg(`<rect width="1024" height="1024" fill="url(#g)"/>`, grad) },
  'android-icon-foreground.png': { w: 1024, svg: svg(wrapArt('#fff'), hubCut) },
  'android-icon-monochrome.png': { w: 1024, svg: svg(wrapArt('#000'), hubCut) },
  'splash-icon.png': { w: 1024, svg: svg(`<rect x="152" y="152" width="720" height="720" rx="170" fill="url(#g)"/>${scaled(0.92, wrapArt('#fff'))}`, grad + hubCut) },
  'favicon.png': { w: 48, svg: svg(`<rect width="1024" height="1024" rx="230" fill="url(#g)"/>${scaled(1.3, wrapArt('#fff'))}`, grad + hubCut) },
};

(async () => {
  const browser = await chromium.launch();
  for (const [name, f] of Object.entries(files)) {
    const page = await browser.newPage({ viewport: { width: f.w, height: f.w } });
    const html = `<html><body style="margin:0;background:transparent">${f.svg.replace('width="1024" height="1024"', `width="${f.w}" height="${f.w}"`)}</body></html>`;
    await page.setContent(html);
    await page.screenshot({ path: `${out}/${name}`, omitBackground: !f.bg });
    await page.close();
  }
  await browser.close();
})();
