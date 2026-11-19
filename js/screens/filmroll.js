// Screen 13 — Memory film roll: frames of the selected memory, main view, prev / next, lightbox.
import { h, title, deco, icon, img, esc, logo, announce, trapFocus, reducedMotion } from '../ui.js';
import { PHOTOS, MEMORY_LABEL } from '../content.js';
import { store } from '../state.js';

export async function render({ photo }, { go }) {
  let i = Math.max(0, PHOTOS.findIndex(p => p.id === photo));
  store.set({ archivePhoto: PHOTOS[i].id });
  const holes = n => `<span class="film__holes" aria-hidden="true">${'<i></i>'.repeat(n)}</span>`;
  const el = h(`<section class="screen filmroll bg-grid" aria-labelledby="fr-h">
    ${logo()}
    <header class="filmroll__head">
      <h1 id="fr-h" class="filmroll__title">${title('Memory', { tag: 'span' })}<br>${title('Film roll', { tag: 'span', cls: 'title--hot' })}</h1>
      <p class="tag filmroll__tag">A collection of moments</p>
    </header>
    ${deco('burst', 'burst', 'left:41%;top:3%;transform:rotate(-10deg)')}
    <p class="note filmroll__note">A glimpse into<br>some special memories.</p>
    <div class="film" role="region" aria-roledescription="film roll" aria-label="${esc(MEMORY_LABEL)} — ${PHOTOS.length} frames">
      ${holes(40)}
      <ol class="film__track">${PHOTOS.map((p, k) => `
        <li class="film__cell"><button class="film__frame" type="button" data-k="${k}" aria-label="Frame ${String(k + 1).padStart(2, '0')}: ${esc(p.alt)}">
          <span class="film__num" aria-hidden="true">${String(k + 1).padStart(2, '0')} ▶</span>
          ${img(p.img, '')}</button></li>`).join('')}</ol>
      ${holes(40)}
      <button class="icon-btn film__nav film__nav--l" type="button" aria-label="Previous frame">${icon('chev-l')}</button>
      <button class="icon-btn film__nav film__nav--r" type="button" aria-label="Next frame">${icon('chev-r')}</button>
    </div>
    <p class="filmroll__caption sr-only"></p>
    <a class="btn btn--sm filmroll__back" href="#/archive">${icon('arrow-l')} Back to gallery</a>
    <p class="filmroll__label btn btn--primary btn--lg" aria-hidden="true">${icon('pin')} ${esc(MEMORY_LABEL)} <span class="filmroll__count"></span></p>
    <div class="stripes stripes--br" aria-hidden="true"></div>
  </section>`);

  const track = el.querySelector('.film__track');
  const frames = [...el.querySelectorAll('.film__frame')];
  const cap = el.querySelector('.filmroll__caption');

  function show(n, announceIt = true) {
    i = (n + PHOTOS.length) % PHOTOS.length;
    frames.forEach((f, k) => { f.classList.toggle('is-active', k === i); f.setAttribute('aria-current', k === i); });
    const f = frames[i];
    // centre the active frame inside the film
    const film = el.querySelector('.film');
    const offset = f.parentElement.offsetLeft + f.parentElement.offsetWidth / 2 - film.clientWidth / 2;
    track.style.transform = `translateX(${-Math.max(0, offset)}px)`;
    el.querySelector('.filmroll__count').textContent = `· ${String(i + 1).padStart(2, '0')}/${String(PHOTOS.length).padStart(2, '0')}`;
    cap.innerHTML = `<b>Frame ${String(i + 1).padStart(2, '0')} / ${String(PHOTOS.length).padStart(2, '0')}</b> — ${esc(PHOTOS[i].alt)}. <span class="filmroll__hint">Click the frame to view it full size.</span>`;
    store.set({ archivePhoto: PHOTOS[i].id });
    history.replaceState(null, '', `#/archive/${PHOTOS[i].id}`);
    if (announceIt) announce(`Frame ${i + 1} of ${PHOTOS.length}: ${PHOTOS[i].alt}`);
  }
  frames.forEach((f, k) => f.addEventListener('click', () => (k === i ? lightbox() : show(k))));
  el.querySelector('.film__nav--l').addEventListener('click', () => show(i - 1));
  el.querySelector('.film__nav--r').addEventListener('click', () => show(i + 1));
  el.querySelector('.film').addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); frames[i].focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); frames[i].focus(); }
  });
  // swipe on touch
  let sx = null;
  track.addEventListener('pointerdown', e => { sx = e.clientX; });
  track.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(i + (e.clientX < sx ? 1 : -1)); sx = null; });

  function lightbox() {
    const p = PHOTOS[i];
    const box = h(`<div class="modal-backdrop lightbox" role="dialog" aria-modal="true" aria-label="Frame ${i + 1}: ${esc(p.alt)}">
      <figure class="lightbox__fig polaroid">${img(p.img, p.alt, 'loading="eager"')}<figcaption><b>${String(i + 1).padStart(2, '0')}</b> · ${esc(MEMORY_LABEL)}</figcaption></figure>
      <button class="icon-btn icon-btn--pink lightbox__x" type="button" aria-label="Close">${icon('close')}</button>
    </div>`);
    document.getElementById('overlay-root').appendChild(box);
    const close = () => { release(); box.remove(); };
    const release = trapFocus(box, close);
    box.querySelector('.lightbox__x').addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    box.querySelector('.lightbox__x').focus();
  }

  const onResize = () => show(i, false);
  addEventListener('resize', onResize);
  return {
    el, title: 'Memory film roll',
    mounted() { track.style.transition = 'none'; show(i, false); requestAnimationFrame(() => { track.style.transition = ''; }); },
    destroy() { removeEventListener('resize', onResize); },
  };
}
