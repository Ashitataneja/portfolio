// Five-destination rotary navigation dial (Homepage + Navigate My World).
import { h, icon, esc, makeDial, announce, reducedMotion, curvedArrow } from './ui.js';
import { NAV } from './content.js';
import { store } from './state.js';
import { play } from './sound.js';

const P = (r, a) => [r * Math.sin(a * Math.PI / 180), -r * Math.cos(a * Math.PI / 180)];
function sector(i, n, rIn, rOut) {
  const s = 360 / n, a0 = i * s - s / 2, a1 = i * s + s / 2;
  const [x0, y0] = P(rOut, a0), [x1, y1] = P(rOut, a1), [x2, y2] = P(rIn, a1), [x3, y3] = P(rIn, a0);
  return `M${x0} ${y0}A${rOut} ${rOut} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${rIn} ${rIn} 0 0 0 ${x3} ${y3}Z`;
}
const BASE = ['pink', 'hot', 'pink', 'hot', 'pink'];

/**
 * variant: 'home' (portrait centre) | 'focus' (lens centre = open button)
 */
export function navDial({ variant = 'home', onOpen }) {
  const n = NAV.length, rIn = variant === 'home' ? 50 : 40, rOut = 92;
  const el = h(`<div class="dial dial--${variant}">
    <div class="dial__pointer" aria-hidden="true"></div>
    <button class="dial__spin dial__spin--prev" type="button" data-sound="none" aria-label="Rotate dial anticlockwise">${curvedArrow({ viewBox: "0 0 60 60", d: "M54 18C44 6 26 6 15 18", head: "M5 13l5 17 15-9z" })}</button>
    <button class="dial__spin dial__spin--next" type="button" data-sound="none" aria-label="Rotate dial clockwise">${curvedArrow({ viewBox: "0 0 60 60", d: "M47 6c8 12 6 28-4 38", head: "M31 56l18-2-6-17z" })}</button>
    <div class="dial__wheel" role="group" aria-roledescription="rotary dial" aria-label="Navigation dial. Use arrow keys to rotate, Enter to open.">
      <svg class="dial__svg" viewBox="-100 -100 200 200" aria-hidden="true">
        <defs><pattern id="hatch-${variant}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="var(--c-yellow)"/><rect width="2" height="7" fill="color-mix(in srgb, var(--c-ink) 12%, transparent)"/></pattern></defs>
        <circle r="99" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="3"/>
        <circle r="${rOut + 1}" fill="var(--c-ink)"/>
        ${NAV.map((_, i) => `<path class="dial__seg" data-i="${i}" d="${sector(i, n, rIn, rOut)}" fill="var(--c-${BASE[i]})" stroke="var(--c-ink)" stroke-width="2.4"/>`).join('')}
        <circle r="${rIn + (variant === 'home' ? 4 : 6)}" fill="${variant === 'home' ? 'var(--c-cream)' : 'var(--c-yellow)'}" stroke="var(--c-ink)" stroke-width="3"/>
      </svg>
      ${NAV.map((d, i) => {
        const [x, y] = P((rIn + rOut) / 2 + 2, i * 72);
        return `<button class="dial__label" type="button" data-sound="none" data-i="${i}" style="left:${50 + x / 2}%;top:${50 + y / 2}%" aria-label="${esc(d.label)}">
          <span class="dial__label-in">${icon(variant === 'home' ? d.icon : d.icon2)}<b>${esc(d.label)}</b><small class="dial__go" aria-hidden="true">Open ${icon('arrow-r')}</small></span></button>`;
      }).join('')}
    </div>
    ${variant === 'home'
      ? `<div class="dial__center dial__center--portrait"><img src="assets/img/portrait_home.jpg" alt="Portrait of Ashita Taneja smiling" decoding="async"></div>`
      : `<button class="dial__center dial__center--lens" type="button" data-sound="none" aria-label="Open selected destination"><span></span></button>`}
  </div>`);

  const wheel = el.querySelector('.dial__wheel');
  const labels = [...el.querySelectorAll('.dial__label')];
  const segs = [...el.querySelectorAll('.dial__seg')];
  let pendingOpen = null;

  function highlight(i) {
    labels.forEach((b, k) => {
      b.classList.toggle('is-selected', k === i);
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
      b.setAttribute('aria-label', NAV[k].label + (k === i ? ' — selected, press Enter to open' : ''));
      b.tabIndex = k === i ? 0 : -1;
    });
    segs.forEach((s, k) => s.setAttribute('fill', k === i ? `url(#hatch-${variant})` : `var(--c-${BASE[k]})`));
    segs.forEach((s, k) => s.setAttribute('stroke-width', k === i ? 4 : 2.4));
  }
  const dial = makeDial(wheel, {
    count: n, index: store.get().homeIndex || 0,
    onChange(i, live) {
      highlight(i);
      store.set({ homeIndex: i });
      if (!live) announce(NAV[i].label + ' selected');
    },
  });
  highlight(dial.index);

  const open = i => { store.set({ homeIndex: i }); play('shutter'); onOpen(NAV[i]); };
  labels.forEach(b => b.addEventListener('click', () => {
    if (dial.wasDrag()) return;
    const i = +b.dataset.i;
    clearTimeout(pendingOpen);
    if (i === dial.index) return open(i);
    // Direct click: rotate it under the pointer, then open
    dial.setIndex(i);
    pendingOpen = setTimeout(() => open(i), reducedMotion() ? 0 : 650);
  }));
  wheel.addEventListener('click', e => {
    const seg = e.target.closest('.dial__seg');
    if (seg && !dial.wasDrag()) labels[+seg.dataset.i].click();
  });
  wheel.addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown'].includes(k)) { e.preventDefault(); dial.next(); labels[dial.index].focus(); }
    else if (['ArrowLeft', 'ArrowUp'].includes(k)) { e.preventDefault(); dial.prev(); labels[dial.index].focus(); }
    else if (k === 'Home') { e.preventDefault(); dial.setIndex(0); labels[0].focus(); }
    else if (k === 'End') { e.preventDefault(); dial.setIndex(n - 1); labels[n - 1].focus(); }
  });
  el.querySelector('.dial__spin--prev').addEventListener('click', () => dial.prev());
  el.querySelector('.dial__spin--next').addEventListener('click', () => dial.next());
  el.querySelector('.dial__center--lens')?.addEventListener('click', () => open(dial.index));
  return { el, dial, destroy: () => clearTimeout(pendingOpen) };
}
