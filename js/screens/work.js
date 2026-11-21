// Screen 06 — Work: projects pegged on two clotheslines. Screen 07 — unclipping transition.
import { h, title, deco, icon, img, esc, logo, wait, reducedMotion, announce } from '../ui.js';
import { PROJECTS } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

export const rope = (cls = '') => `<svg class="rope ${cls}" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
  <defs><pattern id="twist" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="22" height="22" fill="var(--c-yellow)"/><rect width="5" height="22" fill="var(--c-ink)" opacity=".9"/></pattern></defs>
  <path d="M-10 14 Q500 62 1010 10" fill="none" stroke="var(--c-ink)" stroke-width="17" stroke-linecap="round"/>
  <path d="M-10 14 Q500 62 1010 10" fill="none" stroke="url(#twist)" stroke-width="11" stroke-linecap="round"/>
</svg>`;
// A wooden clothes-peg seen from the front: back jaw, front jaw, metal spring. `.is-open` parts the jaws.
export const clip = c => `<span class="peg peg--${c}" aria-hidden="true"><svg viewBox="0 0 44 110" overflow="visible">
  <g class="peg__jaw peg__jaw--back"><path d="M10 4h22a4 4 0 014 4v86a10 10 0 01-10 10h-10a10 10 0 01-10-10V8a4 4 0 014-4z" fill="var(--peg-dark)" stroke="var(--c-ink)" stroke-width="3.2" stroke-linejoin="round"/></g>
  <g class="peg__jaw peg__jaw--front"><path d="M7 2h22a4 4 0 014 4v86a10 10 0 01-10 10H13A10 10 0 013 92V6a4 4 0 014-4z" fill="var(--peg)" stroke="var(--c-ink)" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M9 9v30" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/><path d="M3 78h30" stroke="var(--c-ink)" stroke-width="2.4" opacity=".35"/></g>
  <g class="peg__spring"><rect x="-3" y="44" width="46" height="12" rx="5" fill="#b9bcc6" stroke="var(--c-ink)" stroke-width="3"/><circle cx="40" cy="50" r="6.5" fill="#d7d9e0" stroke="var(--c-ink)" stroke-width="3"/><circle cx="40" cy="50" r="2" fill="var(--c-ink)"/></g>
</svg></span>`;

const card = (p, i) => `
  <li class="line__item" style="--tilt:${p.tilt}deg;--sag:${Math.sin((i % 5) / 4 * Math.PI) * 1.6}vw">
    <button class="hang" type="button" data-sound="none" data-id="${p.id}" aria-label="${esc(`${p.id}. ${p.title} — ${p.category}. Open project`)}">
      ${clip(p.clip)}
      <span class="polaroid hang__card">
        <span class="ph">${img(p.img, '')}</span>
        <span class="cap"><b>${p.id}. ${esc(p.title)}</b><span>${esc(p.category)}</span></span>
      </span>
    </button>
  </li>`;

export async function render(_, { go }) {
  const sel = store.get().selectedProject;
  const el = h(`<section class="screen work bg-grid" aria-labelledby="work-h">
    ${logo()}
    <a class="btn btn--sm work__back" href="#/home">${icon('arrow-l')} Back to home</a>
    <header class="work__head">
      ${title('Work', { id: 'work-h' })}
      ${deco('burst', 'burst', 'right:-14%;top:-4%;transform:rotate(-15deg)')}
      <p class="note work__tag tilt-l">Designing for people,<br>one project at a time.</p>
    </header>
    ${deco('sparkle twinkle', 'sparkle', 'right:16%;top:11%')}
    ${deco('sparkle twinkle', 'sparkle', 'right:1.5%;top:76%;width:40px')}
    ${deco('sparkle twinkle', 'sparkle', 'right:9%;top:88%;width:40px')}
    ${deco('burst', 'burst', 'left:1%;top:31%;transform:rotate(200deg)')}
    <div class="lines" role="region" aria-label="Projects">
      <div class="line line--1">${rope()}<ul class="line__items">${PROJECTS.map(card).join('')}</ul></div>
    </div>
    <button class="icon-btn icon-btn--yellow work__arrow work__arrow--l" type="button" data-sound="tick" aria-label="Previous project">${icon('arrow-l')}</button>
    <button class="icon-btn icon-btn--yellow work__arrow work__arrow--r" type="button" data-sound="tick" aria-label="Next project">${icon('arrow-r')}</button>
    ${deco('deco-cursor work__cursor', 'cursor', '')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const btns = [...el.querySelectorAll('.hang')];
  let hi = Math.max(0, PROJECTS.findIndex(p => p.id === sel));
  const highlight = (i, focus = true) => {
    hi = (i + btns.length) % btns.length;
    btns.forEach((b, k) => b.classList.toggle('is-hi', k === hi));
    const b = btns[hi];
    if (focus) b.focus({ preventScroll: true });
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    const p = PROJECTS[hi];
    announce(`${p.id}. ${p.title}, ${p.category}`);
  };
  if (sel) btns[hi].classList.add('is-hi', 'is-sel');
  el.querySelector('.work__arrow--l').addEventListener('click', () => highlight(hi - 1, false));
  el.querySelector('.work__arrow--r').addEventListener('click', () => highlight(hi + 1, false));
  el.addEventListener('keydown', e => {
    if (!e.target.closest('.hang')) return;
    const i = btns.indexOf(e.target.closest('.hang'));
    if (e.key === 'ArrowRight') { e.preventDefault(); highlight(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); highlight(i - 1); }
  });
  btns.forEach(b => {
    b.addEventListener('mouseenter', () => btns.forEach(x => x.classList.toggle('is-hi', x === b)));
    b.addEventListener('focus', () => { hi = btns.indexOf(b); btns.forEach(x => x.classList.toggle('is-hi', x === b)); });
    b.addEventListener('click', () => unclip(b));
  });

  let busy = false;
  async function unclip(b) {
    if (busy) return; busy = true;
    const p = PROJECTS.find(x => x.id === b.dataset.id);
    store.set({ selectedProject: p.id });
    announce(`Project ${p.id} unclipped`);
    if (reducedMotion()) return go(`#/work/${p.id}`);
    const cardEl = b.querySelector('.hang__card');
    const peg = b.querySelector('.peg');

    // 1 — the peg's jaws open (snap), and the photo drops off the line with a little swing
    b.classList.add('is-hi');
    peg.classList.add('is-open'); play('snap');
    await wait(170);
    cardEl.classList.add('is-dropping');
    await wait(330);
    peg.classList.remove('is-open'); play('tick');   // empty peg springs shut on the line

    // 2 — everything else steps back; the photo flies forward and grows
    const r = cardEl.getBoundingClientRect();
    const stage = h(`<div class="unclip bg-grid" aria-hidden="true">
      ${rope('unclip__rope')}
      <span class="unclip__peg">${clip(p.clip).replace('class="peg ', 'class="peg is-open ')}</span>
      <p class="note unclip__bubble">Project<br>unclipped!</p>
      <span class="unclip__cam">${icon('camera')}</span>
      ${deco('burst burst--w', 'burst', 'left:24%;top:30%;transform:rotate(-40deg)')}
      ${deco('burst', 'burst', 'right:30%;top:10%;transform:rotate(20deg)')}
      <div class="stripes stripes--bottom"></div>
    </div>`);
    const fly = cardEl.cloneNode(true);
    fly.classList.remove('is-dropping');
    fly.classList.add('unclip__card');
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px' });
    document.body.append(stage, fly);
    cardEl.style.visibility = 'hidden';
    requestAnimationFrame(() => stage.classList.add('is-on'));
    play('whoosh');
    const W = Math.min(innerWidth * 0.36, innerHeight * 0.56), L = (innerWidth - W) / 2, T = innerHeight * 0.2;
    // rope sits on the photo's top edge, the peg will clip both together
    const ropeEl = stage.querySelector('.unclip__rope');
    Object.assign(ropeEl.style, { top: (T - 33) + 'px' });
    const pegWrap = stage.querySelector('.unclip__peg');
    const pegW = Math.max(34, W * 0.12);
    Object.assign(pegWrap.style, { width: pegW + 'px', left: (innerWidth / 2 - pegW / 2) + 'px', top: (T - pegW * 1.7) + 'px' });
    await fly.animate([
      { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', transform: `rotate(${p.tilt + 6}deg)` },
      { left: L + 'px', top: T + 'px', width: W + 'px', transform: 'rotate(-2deg)' },
    ], { duration: 720, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' }).finished;

    // 3 — clip! a peg drops onto the rope and pinches the photo
    pegWrap.classList.add('is-landing');
    await wait(260);
    pegWrap.querySelector('.peg').classList.remove('is-open'); play('snap');
    fly.animate([{ transform: 'rotate(-2deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(-1deg)' }],
      { duration: 420, easing: 'ease-out', fill: 'forwards' });
    stage.classList.add('is-clipped');
    await wait(950);
    go(`#/work/${p.id}`);
    setTimeout(() => { stage.remove(); fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => fly.remove()); }, 120);
  }

  return {
    el, title: 'Work',
    mounted() { if (sel) btns[hi].scrollIntoView({ block: 'nearest', inline: 'center' }); },
  };
}
