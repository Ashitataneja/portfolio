// Screen 16 — About Me: scratch-to-reveal tiles → emoji rain → downloadable snapshot keepsake.
import { h, title, deco, icon, img, esc, logo, announce, reducedMotion, downloadBlob, loadImage, cssVar, trapFocus } from '../ui.js';
import { ABOUT_TILES, PROFILE } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

const FRAME = { pink: 'pink', yellow: 'yellow', hot: 'hot' };

export async function render(_, { go }) {
  const revealed = new Set(store.get().aboutRevealed);
  const el = h(`<section class="screen about bg-grid" aria-labelledby="ab-h">
    ${logo()}
    <header class="about__head">
      ${title('About me', { id: 'ab-h', cls: 'tilt-l' })}
      <p class="tag about__tag">Scratch to discover more!</p>
    </header>
    ${deco('burst', 'burst', 'left:46%;top:3%;transform:rotate(-10deg)')}
    ${deco('burst', 'burst', 'left:6%;top:36%;transform:rotate(200deg)')}
    <a class="btn btn--case btn--sm about__skip" href="#/about/profile">Skip the Scratch ${icon('arrow-r')}</a>
    <p class="note about__bubble">${esc(PROFILE.aboutBubble)}</p>
    <p class="sr-only" id="scratch-help">Scratch or brush across a tile with your mouse, finger or pen to reveal it. Keyboard users: focus a tile and press Enter or Space to brush it clean.</p>
    <ul class="tiles">${ABOUT_TILES.map((t, k) => `
      <li class="tile tile--${FRAME[t.frame]}${revealed.has(t.id) ? ' is-revealed' : ''}" style="--r:${[-3, -2, 2, 2, -1, 1][k]}deg" data-id="${t.id}">
        <div class="tile__card">
          <div class="tile__media" role="button" tabindex="0" aria-describedby="scratch-help"
               aria-label="${esc(t.title)} — ${revealed.has(t.id) ? 'revealed' : 'hidden photograph, scratch to reveal'}">
            ${img(t.img, revealed.has(t.id) ? `${t.title} photograph` : '', 'draggable="false"')}
            <canvas class="tile__scratch" aria-hidden="true"></canvas>
            <span class="tile__hand" aria-hidden="true"><svg><use href="#i-hand"/></svg></span>
            <p class="tile__note">${esc(t.note)}</p>
          </div>
          <h2 class="tile__title">${esc(t.title)}</h2>
          <p class="tile__sub">${esc(t.sub)}</p>
          <span class="tile__badge" aria-hidden="true">${icon('check')}</span>
        </div>
      </li>`).join('')}</ul>
    <p class="about__count" aria-live="polite"></p>
    <div class="about__cloud"><span>Let’s<br>see what<br>else there is…</span></div>
    ${deco('sparkle sparkle--y twinkle', 'sparkle', 'right:3%;top:58%;width:40px')}
    <a class="btn btn--case about__profile" href="#/about/profile">View My Profile ${icon('arrow-r')}</a>
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const count = el.querySelector('.about__count');
  const tiles = [...el.querySelectorAll('.tile')];
  const updateCount = () => {
    const n = revealed.size;
    count.textContent = n === ABOUT_TILES.length ? 'All revealed! Your keepsake is ready.' : `${n} of ${ABOUT_TILES.length} revealed`;
  };

  function markRevealed(li) {
    const id = li.dataset.id, t = ABOUT_TILES.find(x => x.id === id);
    if (revealed.has(id)) return;
    revealed.add(id);
    li.classList.add('is-revealed'); play('focus');
    li.querySelector('img').alt = `${t.title} photograph`;
    li.querySelector('.tile__media').setAttribute('aria-label', `${t.title} — revealed. ${t.note}`);
    store.set({ aboutRevealed: [...revealed] });
    announce(`${t.title} revealed: ${t.note}`);
    updateCount();
    if (revealed.size === ABOUT_TILES.length) setTimeout(celebrate, 500);
  }

  // --- scratch surfaces ---
  const cleanups = [];
  function setupScratch(li) {
    const media = li.querySelector('.tile__media');
    const cv = li.querySelector('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let w = 0, hgt = 0, dpr = 1, drawing = false, last = null, moves = 0;
    function paint() {
      const r = media.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      w = Math.max(1, r.width); hgt = Math.max(1, r.height);
      cv.width = w * dpr; cv.height = hgt * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      // grey brushed paint, like the design
      ctx.fillStyle = '#a7a7a7'; ctx.fillRect(0, 0, w, hgt);
      let seed = li.dataset.id.length * 97;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let k = 0; k < 26; k++) {
        ctx.strokeStyle = ['#9a9a9a', '#b4b4b4', '#8f8f8f', '#bdbdbd'][k % 4];
        ctx.lineWidth = hgt * (0.06 + rnd() * 0.1); ctx.lineCap = 'round';
        ctx.beginPath();
        const y = rnd() * hgt; ctx.moveTo(-10, y + hgt * 0.3);
        ctx.quadraticCurveTo(w * rnd(), y - hgt * 0.2, w + 10, y - hgt * 0.35);
        ctx.stroke();
      }
    }
    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(26, w * 0.13); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      if (last) ctx.moveTo(last[0], last[1]); else ctx.moveTo(x - .1, y);
      ctx.lineTo(x, y); ctx.stroke();
      last = [x, y];
    }
    function cleared() {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let k = 3; k < d.length; k += 4 * 24) { total++; if (d[k] < 40) clear++; }
      return clear / total;
    }
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => {
      if (li.classList.contains('is-revealed')) return;
      drawing = true; last = null; cv.setPointerCapture(e.pointerId);
      li.classList.add('is-scratching');
      scratch(...pos(e));
    });
    cv.addEventListener('pointermove', e => {
      if (!drawing && (e.buttons & 1) && !li.classList.contains('is-revealed')) { drawing = true; last = null; li.classList.add('is-scratching'); }
      if (!drawing) return;
      scratch(...pos(e)); play('scratch');
      if (++moves % 12 === 0 && cleared() > 0.55) finish();
    });
    const up = () => { if (!drawing) return; drawing = false; last = null; if (cleared() > 0.5) finish(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    function finish() { drawing = false; cv.classList.add('is-clearing'); markRevealed(li); }
    // keyboard: brush strokes sweep across the tile
    async function brush() {
      if (li.classList.contains('is-revealed')) return;
      li.classList.add('is-scratching');
      const steps = reducedMotion() ? 1 : 14;
      for (let k = 0; k <= steps; k++) {
        const row = k / steps;
        last = null; scratch(-10, hgt * (row - 0.1)); scratch(w + 10, hgt * (row + 0.15)); play('scratch');
        if (steps > 1) await new Promise(r => setTimeout(r, 28));
      }
      finish();
    }
    media.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); brush(); } });
    const ro = new ResizeObserver(() => { if (!li.classList.contains('is-revealed')) paint(); });
    ro.observe(media);
    cleanups.push(() => ro.disconnect());
  }
  tiles.forEach(li => { if (!li.classList.contains('is-revealed')) setupScratch(li); });
  updateCount();

  function celebrate() {
    play('shutter'); setTimeout(() => play('chime'), 180);
    emojiRain();
    keepsake([...revealed]);
  }

  return {
    el, title: 'About me',
    mounted() { if (revealed.size === ABOUT_TILES.length) el.querySelector('.about__count').insertAdjacentHTML('afterend', `<button class="btn btn--primary btn--sm about__again" type="button">${icon('image')} Open my keepsake</button>`), el.querySelector('.about__again').addEventListener('click', () => keepsake([...revealed])); },
    destroy() { cleanups.forEach(f => f()); },
  };
}

export function emojiRain() {
  const EMO = ['🎨', '📸', '✨', '💖', '🌸', '🌈', '⭐', '🎉', '💛', '📓', '🌻', '🧡', '💜', '🎈'];
  const wrap = h('<div class="emoji-rain" aria-hidden="true"></div>');
  const n = reducedMotion() ? 14 : 70;
  for (let k = 0; k < n; k++) {
    const s = document.createElement('span');
    s.textContent = EMO[k % EMO.length];
    s.style.left = Math.random() * 100 + 'vw';
    if (reducedMotion()) { s.style.top = Math.random() * 80 + 'vh'; s.style.animation = 'none'; }
    else {
      s.style.animationDuration = 2.6 + Math.random() * 2.6 + 's';
      s.style.animationDelay = Math.random() * 1.6 + 's';
      s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    }
    wrap.appendChild(s);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), reducedMotion() ? 1800 : 7000);
}

/** Draws the keepsake snapshot from the revealed tiles. */
async function drawKeepsake(ids) {
  await document.fonts.ready;
  const W = 2400, H = 1700, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const col = k => cssVar('--c-' + k);
  // grid background
  x.fillStyle = col('bg'); x.fillRect(0, 0, W, H);
  x.strokeStyle = col('grid'); x.lineWidth = 3;
  for (let gx = 0; gx < W; gx += 120) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 0; gy < H; gy += 120) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  // title sticker
  stickerText(x, 'ABOUT ME', 120, 230, 170, col, -0.05);
  x.font = '700 54px Outfit'; x.fillStyle = col('onBg');
  x.fillText('A snapshot of ' + PROFILE.name, 135, 330);
  const tiles = ABOUT_TILES.filter(t => ids.includes(t.id));
  const imgs = await Promise.all(tiles.map(t => loadImage(`assets/img/${t.img}.jpg`)));
  const cw = 660, ch = 560, gap = 90, ox = (W - (cw * 3 + gap * 2)) / 2, oy = 420;
  tiles.forEach((t, k) => {
    const cx = ox + (k % 3) * (cw + gap), cy = oy + Math.floor(k / 3) * (ch + 70);
    x.save(); x.translate(cx + cw / 2, cy + ch / 2); x.rotate([-3, -2, 2, 2, -1, 1][k] * Math.PI / 180);
    x.fillStyle = col('ink'); roundRect(x, -cw / 2 + 12, -ch / 2 + 16, cw, ch, 30); x.fill();
    x.fillStyle = col(t.frame); roundRect(x, -cw / 2, -ch / 2, cw, ch, 30); x.fill();
    x.lineWidth = 6; x.strokeStyle = col('ink'); x.stroke();
    x.fillStyle = col('cream'); roundRect(x, -cw / 2 + 22, -ch / 2 + 22, cw - 44, ch - 44, 20); x.fill(); x.stroke();
    const iw = cw - 80, ih = 340, im = imgs[k];
    x.save(); roundRect(x, -iw / 2, -ch / 2 + 40, iw, ih, 14); x.clip();
    const s = Math.max(iw / im.width, ih / im.height);
    x.drawImage(im, -im.width * s / 2, -ch / 2 + 40 + ih / 2 - im.height * s / 2, im.width * s, im.height * s);
    x.restore();
    x.fillStyle = col('ink'); x.textAlign = 'center';
    x.font = '800 50px Outfit'; x.fillText(t.title, 0, ch / 2 - 110);
    x.font = '500 34px Outfit'; x.fillText(t.sub, 0, ch / 2 - 62);
    x.restore(); x.textAlign = 'left';
  });
  x.font = '700 40px Outfit'; x.fillStyle = col('onBg');
  x.fillText('AT · Ashita Taneja · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 135, H - 70);
  return c;
}
export function roundRect(x, X, Y, w, hh, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, hh, r) : x.rect(X, Y, w, hh); }
/** Canvas version of the sticker title: ink edge, yellow outline, pink fill. */
export function stickerText(x, text, X, Y, size, col, rot = 0, lines = [text]) {
  x.save(); x.translate(X, Y); x.rotate(rot);
  x.font = `${size}px "Titan One"`; x.lineJoin = 'round'; x.textBaseline = 'alphabetic';
  lines.forEach((t, k) => {
    const y = k * size * 0.95;
    x.strokeStyle = col('ink'); x.lineWidth = size * 0.46; x.strokeText(t, size * .03, y + size * .085);
    x.strokeStyle = col('yellow'); x.lineWidth = size * 0.32; x.strokeText(t, 0, y);
  });
  lines.forEach((t, k) => {
    const y = k * size * 0.95;
    x.fillStyle = col('ink'); x.fillText(t, size * .045, y + size * .055);
    x.strokeStyle = col('ink'); x.lineWidth = size * 0.075; x.strokeText(t, 0, y);
    x.fillStyle = col('pink'); x.fillText(t, 0, y);
  });
  x.restore();
}

async function keepsake(ids) {
  const back = h(`<div class="modal-backdrop keepsake" role="dialog" aria-modal="true" aria-labelledby="ks-h">
    <div class="keepsake__card">
      <h2 id="ks-h" class="keepsake__h">You revealed everything! 🎉</h2>
      <p>Here’s a snapshot keepsake of what you discovered.</p>
      <div class="keepsake__preview"><span class="keepsake__loading">Developing…</span></div>
      <div class="keepsake__btns">
        <button class="btn btn--primary" type="button" data-dl data-sound="shutter" disabled>${icon('download')} Save snapshot</button>
        <a class="btn" href="#/about/profile" data-prof>View my profile ${icon('arrow-r')}</a>
        <button class="btn" type="button" data-close>Close</button>
      </div>
    </div>
  </div>`);
  document.getElementById('overlay-root').appendChild(back);
  const close = () => { release(); back.remove(); };
  const release = trapFocus(back, close);
  back.querySelector('[data-close]').addEventListener('click', close);
  back.querySelector('[data-prof]').addEventListener('click', close);
  back.querySelector('[data-close]').focus();
  const canvas = await drawKeepsake(ids);
  const prev = back.querySelector('.keepsake__preview');
  const im = new Image(); im.alt = 'Snapshot keepsake: six revealed About Me photographs'; im.src = canvas.toDataURL('image/jpeg', 0.85);
  prev.replaceChildren(im);
  const dl = back.querySelector('[data-dl]');
  dl.disabled = false;
  dl.addEventListener('click', () => canvas.toBlob(b => downloadBlob(b, 'ashita-taneja-about-keepsake.png'), 'image/png'));
}
