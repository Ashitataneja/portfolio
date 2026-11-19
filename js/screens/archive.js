// Screen 12 — Photography: a pile of photographs; lift one to open its memory.
import { h, title, deco, icon, img, esc, logo, reducedMotion, announce } from '../ui.js';
import { PHOTOS } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

// Pile layout echoes the design: [left%, top%, width%, rotation, z]
const PILE = {
  cat: [4, 26, 20, -7, 1], college: [9, 3, 36, -8, 2], park: [61, 0, 30, 6, 3],
  flowers: [0, 33, 35, -11, 4], palace: [63, 33, 31, 9, 5], sunset: [32, 14, 37, 4, 6],
};

export async function render(_, { go }) {
  const last = store.get().archivePhoto;
  const el = h(`<section class="screen archive bg-grid" aria-labelledby="arc-h">
    ${logo()}
    <header class="archive__head">
      ${title('Photography', { id: 'arc-h', cls: 'tilt-l' })}
      <p class="tag archive__tag">Moments, captured.</p>
    </header>
    ${deco('burst', 'burst', 'left:59%;top:4%;transform:rotate(-10deg)')}
    <p class="note archive__tip tilt-r">Click on a photograph<br>to explore the memory.</p>
    <span class="archive__cam" aria-hidden="true">${camSticker()}</span>
    <ul class="pile" aria-label="Photographs — choose one to open its memory">
      ${PHOTOS.map((p, i) => { const [l, t, w, r, z] = PILE[p.id]; return `
        <li class="pile__item" style="left:${l}%;top:${t}%;width:${w}%;--r:${r}deg;z-index:${z}">
          <button data-sound="none" class="pile__photo polaroid${p.id === last ? ' is-last' : ''}" type="button" data-id="${p.id}" aria-label="Open memory: ${esc(p.alt)}">
            <span class="ph">${img(p.img, '', i > 3 ? '' : 'loading="eager"')}</span>
          </button>
        </li>`; }).join('')}
    </ul>
    <a class="archive__explore" href="#/archive/${last || PHOTOS[0].id}" aria-label="Explore memories in the film roll">
      <svg viewBox="-50 -50 100 100" aria-hidden="true"><polygon points="${Array.from({ length: 40 }, (_, i) => { const r = i % 2 ? 41 : 48, a = i * Math.PI / 20; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a) * .78).toFixed(1)}`; }).join(' ')}" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="2.4"/></svg>
      <b>Explore<br>memories</b>
    </a>
    <a class="btn btn--sm archive__back" href="#/home">${icon('arrow-l')} Back to home</a>
    ${deco('deco-cursor archive__cursor', 'cursor', '')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  let busy = false;
  el.querySelectorAll('.pile__photo').forEach(b => b.addEventListener('click', async () => {
    if (busy) return; busy = true;
    const id = b.dataset.id;
    store.set({ archivePhoto: id });
    announce('Opening memory');
    if (reducedMotion()) return go(`#/archive/${id}`);
    const li = b.parentElement;
    el.querySelector('.pile').classList.add('is-lifting');
    li.classList.add('is-lifted'); play('whoosh');
    await new Promise(r => setTimeout(r, 420));
    // expand toward the viewing area of the film roll
    const r = b.getBoundingClientRect();
    const fly = b.cloneNode(true);
    fly.className = 'polaroid pile__fly';
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.appendChild(fly);
    b.style.visibility = 'hidden';
    const W = Math.min(innerWidth * .34, innerHeight * .55), H = W * .72;
    await fly.animate([
      { transform: `rotate(${li.style.getPropertyValue('--r')})` },
      { left: (innerWidth - W) / 2 + 'px', top: innerHeight * .38 + 'px', width: W + 'px', height: H + 'px', transform: 'rotate(-3deg)' },
    ], { duration: 560, easing: 'cubic-bezier(.6,0,.25,1)', fill: 'forwards' }).finished;
    play('shutter');
    go(`#/archive/${id}`);
    setTimeout(() => fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, fill: 'forwards' }).finished.then(() => fly.remove()), 200);
  }));
  return { el, title: 'Photography' };
}

export const camSticker = () => `<svg viewBox="0 0 120 90"><g stroke="var(--c-ink)" stroke-width="4" stroke-linejoin="round"><rect x="14" y="8" width="26" height="14" rx="4" fill="var(--c-pink)"/><rect x="4" y="16" width="112" height="70" rx="14" fill="var(--c-hot)"/><rect x="4" y="16" width="112" height="22" rx="10" fill="var(--c-cream)"/><circle cx="62" cy="50" r="27" fill="var(--c-yellow)"/><circle cx="62" cy="50" r="17" fill="var(--c-ink)"/></g><circle cx="56" cy="44" r="5" fill="#fff"/></svg>`;
