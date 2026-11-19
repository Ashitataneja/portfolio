// Screen 21 — Postcard preview, generated from the exact chosen photo; download = postcard artwork only.
import { h, icon, esc, logo, loadImage, cssVar, downloadBlob, announce, toast } from '../ui.js';
import { PHOTOS } from '../content.js';
import { store } from '../state.js';
import { stickerText, roundRect } from './about.js';

export async function drawPostcard(photoId, scale = 1) {
  await document.fonts.ready;
  const p = PHOTOS.find(x => x.id === photoId);
  const [photo, me] = await Promise.all([loadImage(`assets/img/${p.img}.jpg`), loadImage('assets/img/portrait_cutout.png')]);
  const W = 2400 * scale, H = 1500 * scale, S = scale;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const col = k => cssVar('--c-' + k);
  x.scale(S, S);
  // card
  x.fillStyle = col('cream'); roundRect(x, 0, 0, 2400, 1500, 48); x.fill();
  x.lineWidth = 14; x.strokeStyle = col('ink'); roundRect(x, 7, 7, 2386, 1486, 44); x.stroke();
  // photo with white border
  const px = 90, py = 90, pw = 1530, ph = 1150;
  x.fillStyle = '#fff'; x.fillRect(px - 26, py - 26, pw + 52, ph + 52);
  x.lineWidth = 6; x.strokeStyle = col('ink'); x.strokeRect(px - 26, py - 26, pw + 52, ph + 52);
  x.save(); x.beginPath(); x.rect(px, py, pw, ph); x.clip();
  const s = Math.max(pw / photo.width, ph / photo.height);
  x.drawImage(photo, px + pw / 2 - photo.width * s / 2, py + ph / 2 - photo.height * s / 2, photo.width * s, photo.height * s);
  x.restore();
  // stamp
  const sx = 1960, sy = 90, sw = 330, sh = 380;
  x.fillStyle = '#fff'; x.fillRect(sx, sy, sw, sh);
  x.fillStyle = col('cream'); for (let k = 0; k <= 12; k++) { [[sx + k * sw / 12, sy], [sx + k * sw / 12, sy + sh]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 11, 0, 7); x.fill(); }); }
  for (let k = 0; k <= 14; k++) { [[sx, sy + k * sh / 14], [sx + sw, sy + k * sh / 14]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 11, 0, 7); x.fill(); }); }
  x.lineWidth = 5; x.strokeStyle = col('ink'); x.setLineDash([10, 10]); x.strokeRect(sx + 4, sy + 4, sw - 8, sh - 8); x.setLineDash([]);
  x.fillStyle = col('pink'); x.fillRect(sx + 34, sy + 34, sw - 68, sh - 68); x.strokeRect(sx + 34, sy + 34, sw - 68, sh - 68);
  drawCamera(x, sx + sw / 2, sy + sh / 2, 1.5, col);
  // postmark waves
  x.lineWidth = 9; x.lineCap = 'round'; x.strokeStyle = col('ink');
  for (let k = 0; k < 3; k++) { x.beginPath(); for (let t = 0; t <= 300; t += 6) { const X = 1640 + t, Y = 180 + k * 52 + Math.sin(t / 32) * 14; t ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
  // THANK YOU sticker text
  x.font = '100px "Titan One"';
  const fit = Math.min(200, 100 * 1120 / Math.max(...['THANK YOU', 'FOR VISITING.'].map(t => x.measureText(t).width)));
  stickerText(x, '', 1250, 640, fit, col, -0.07, ['THANK YOU', 'FOR VISITING.']);
  // pink underline swoosh
  x.strokeStyle = col('pink'); x.lineWidth = 26; x.beginPath(); x.moveTo(1640, 1090); x.quadraticCurveTo(1900, 1030, 2200, 1040); x.stroke();
  // sparkles
  [[2050, 1170, 60], [2180, 1140, 46]].forEach(([a, b, r]) => sparkle(x, a, b, r, col));
  // portrait sticker + note
  x.save(); x.translate(180, 900);
  x.beginPath(); x.ellipse(170, 230, 210, 250, 0, 0, 7); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 8; x.strokeStyle = col('ink'); x.stroke();
  x.save(); x.beginPath(); x.ellipse(170, 230, 196, 236, 0, 0, 7); x.clip();
  const ms = 470 / me.height; x.drawImage(me, 170 - me.width * ms / 2, 10, me.width * ms, me.height * ms); x.restore();
  x.translate(330, 270); x.rotate(-0.06);
  x.fillStyle = '#fff'; roundRect(x, 0, 0, 420, 190, 40); x.fill(); x.lineWidth = 7; x.stroke();
  x.fillStyle = col('ink'); x.font = '700 76px Caveat'; x.fillText('With love,', 36, 82); x.fillText('Ashita', 60, 158);
  x.fillStyle = col('pink'); heart(x, 330, 125, 34); x.restore();
  // footer: logo + site
  x.fillStyle = col('ink'); roundRect(x, 1660, 1310, 150, 90, 45); x.fill();
  x.fillStyle = col('paper'); x.font = '64px "Titan One"'; x.textAlign = 'center'; x.fillText('AT', 1735, 1378);
  x.fillStyle = col('ink'); x.textAlign = 'left'; x.font = '700 46px Outfit';
  const site = /^https?:/.test(location.protocol) && !/localhost|127\.0\.0\.1|claudeusercontent|claude\.ai/.test(location.host) ? location.host : 'Ashita Taneja · Portfolio';
  x.fillText(site, 1840, 1372);
  return c;
}
function sparkle(x, cx, cy, r, col) { x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? r * .28 : r; x.lineTo(cx + rr * Math.sin(a), cy - rr * Math.cos(a)); } x.closePath(); x.fillStyle = col('yellow'); x.fill(); x.lineWidth = 6; x.strokeStyle = col('ink'); x.stroke(); }
function heart(x, cx, cy, r) { x.beginPath(); x.moveTo(cx, cy + r); x.bezierCurveTo(cx - r * 2, cy - r * .2, cx - r * .8, cy - r * 1.6, cx, cy - r * .5); x.bezierCurveTo(cx + r * .8, cy - r * 1.6, cx + r * 2, cy - r * .2, cx, cy + r); x.fill(); }
function drawCamera(x, cx, cy, k, col) {
  x.save(); x.translate(cx, cy); x.scale(k, k); x.fillStyle = col('ink');
  roundRect(x, -70, -40, 140, 95, 16); x.fill(); roundRect(x, -30, -58, 60, 30, 8); x.fill();
  x.beginPath(); x.arc(0, 8, 30, 0, 7); x.fillStyle = col('pink'); x.fill();
  x.beginPath(); x.arc(0, 8, 20, 0, 7); x.fillStyle = col('ink'); x.fill(); x.restore();
}

export async function render({ photo }, { go }) {
  const p = PHOTOS.find(x => x.id === photo);
  if (!p) { go('#/postcard', { replace: true }); return { el: h('<div></div>') }; }
  store.set({ postcardPhoto: p.id });
  const back = store.get().lastRoute || '#/home';
  const el = h(`<section class="screen ppreview bg-grid" aria-labelledby="pp-h">
    ${logo()}
    <h1 id="pp-h" class="sr-only">Your postcard — Thank you for visiting.</h1>
    <figure class="ppreview__card"><span class="ppreview__back" aria-hidden="true"></span>
      <span class="ppreview__img"><span class="ppreview__loading">Printing your postcard…</span></span></figure>
    <div class="ppreview__btns">
      <a class="btn btn--lg" href="${esc(back)}">${icon('arrow-l')} Back to website</a>
      <button class="btn btn--primary btn--lg" type="button" data-dl disabled>${icon('download')} Download postcard</button>
      <a class="btn btn--lg" href="#/postcard">${icon('refresh')} Choose another photo</a>
    </div>
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);
  const dl = el.querySelector('[data-dl]');
  let current = null;
  async function paint() {
    const c = await drawPostcard(p.id, 0.5);
    const im = new Image();
    im.src = c.toDataURL('image/jpeg', 0.9);
    im.alt = `Postcard: ${p.alt}, with the message “Thank you for visiting.” and a note “With love, Ashita”`;
    el.querySelector('.ppreview__img').replaceChildren(im);
    dl.disabled = false;
  }
  dl.addEventListener('click', async () => {
    dl.disabled = true; dl.lastChild.textContent = ' Preparing…';
    const c = await drawPostcard(p.id, 1.5);              // 3600 × 2250 px
    c.toBlob(b => { downloadBlob(b, `ashita-taneja-postcard-${p.id}.png`); dl.disabled = false; dl.lastChild.textContent = ' Download postcard'; toast('Postcard saved — thank you for visiting!'); announce('Postcard downloaded'); }, 'image/png');
  });
  const onTok = () => { clearTimeout(current); current = setTimeout(paint, 120); };
  addEventListener('tokens-changed', onTok);
  return { el, title: 'Your postcard', mounted: paint, destroy: () => removeEventListener('tokens-changed', onTok) };
}
