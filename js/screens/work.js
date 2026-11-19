// Screen 06 — Work: projects pegged on two clotheslines. Screen 07 — unclipping transition.
import { h, title, deco, icon, img, esc, logo, wait, reducedMotion, announce } from '../ui.js';
import { PROJECTS } from '../content.js';
import { store } from '../state.js';

export const rope = (cls = '') => `<svg class="rope ${cls}" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
  <defs><pattern id="twist" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="22" height="22" fill="var(--c-yellow)"/><rect width="5" height="22" fill="var(--c-ink)" opacity=".9"/></pattern></defs>
  <path d="M-10 14 Q500 62 1010 10" fill="none" stroke="var(--c-ink)" stroke-width="17" stroke-linecap="round"/>
  <path d="M-10 14 Q500 62 1010 10" fill="none" stroke="url(#twist)" stroke-width="11" stroke-linecap="round"/>
</svg>`;
export const clip = c => `<span class="peg peg--${c}" aria-hidden="true"><i></i><b></b></span>`;

const card = (p, i) => `
  <li class="line__item" style="--tilt:${p.tilt}deg;--sag:${Math.sin((i % 5) / 4 * Math.PI) * 1.6}vw">
    <button class="hang" type="button" data-id="${p.id}" aria-label="${esc(`${p.id}. ${p.title} — ${p.category}. Open project`)}">
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
      <div class="line line--1">${rope()}<ul class="line__items">${PROJECTS.slice(0, 5).map(card).join('')}</ul></div>
      <div class="line line--2">${rope()}<ul class="line__items">${PROJECTS.slice(5).map((p, i) => card(p, i)).join('')}</ul></div>
    </div>
    <button class="icon-btn icon-btn--yellow work__arrow work__arrow--l" type="button" aria-label="Previous project">${icon('arrow-l')}</button>
    <button class="icon-btn icon-btn--yellow work__arrow work__arrow--r" type="button" aria-label="Next project">${icon('arrow-r')}</button>
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
    if (e.key === 'ArrowDown' && i < 5) { e.preventDefault(); highlight(i + 5); }
    if (e.key === 'ArrowUp' && i >= 5) { e.preventDefault(); highlight(i - 5); }
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
    // 07a — the peg opens and releases the photo
    b.classList.add('is-unclipping');
    await wait(380);
    // 07b — photo swings off the line and flies to the foreground
    const cardEl = b.querySelector('.hang__card');
    const r = cardEl.getBoundingClientRect();
    const stage = h(`<div class="unclip bg-grid" aria-hidden="true">
      ${rope('unclip__rope')}
      <span class="unclip__peg">${clip(p.clip)}</span>
      <p class="note unclip__bubble">Project<br>unclipped!</p>
      <span class="unclip__cam">${icon('camera')}</span>
      ${deco('burst burst--w', 'burst', 'left:22%;top:26%;transform:rotate(-40deg)')}
      ${deco('burst', 'burst', 'left:52%;top:3%;transform:rotate(-20deg)')}
      <div class="stripes stripes--bottom"></div>
    </div>`);
    const fly = cardEl.cloneNode(true);
    fly.classList.add('unclip__card');
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px' });
    document.body.append(stage, fly);
    cardEl.style.visibility = 'hidden';
    const W = Math.min(innerWidth * 0.42, innerHeight * 0.78), L = (innerWidth - W) / 2, T = innerHeight * 0.16;
    await fly.animate([
      { transform: `rotate(${p.tilt}deg)`, offset: 0 },
      { transform: `translateY(40px) rotate(${p.tilt + 10}deg)`, offset: .25 },
      { left: L + 'px', top: T + 'px', width: W + 'px', transform: 'rotate(8deg)' },
    ], { duration: 900, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished;
    stage.classList.add('is-on');
    await wait(900);
    go(`#/work/${p.id}`);
    setTimeout(() => { stage.remove(); fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => fly.remove()); }, 120);
  }

  return {
    el, title: 'Work',
    mounted() { if (sel) btns[hi].scrollIntoView({ block: 'nearest', inline: 'center' }); },
  };
}
