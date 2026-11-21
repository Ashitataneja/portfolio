// Screen 05 — Navigation focus: the dial alone, lens centre opens the selected destination.
import { h, title, deco, logo, curvedArrow } from '../ui.js';
import { navDial } from '../dial.js';

export async function render(_, { go }) {
  const { el: dialEl, destroy } = navDial({ variant: 'focus', onOpen: d => go(d.route) });
  const el = h(`<section class="screen navigate bg-grid" aria-labelledby="nav-h">
    ${logo()}
    <div class="stripes stripes--top-l" aria-hidden="true"></div>
    <div class="stripes stripes--br" aria-hidden="true"></div>
    <div class="navigate__title">${title('Navigate\nmy world', { id: 'nav-h', cls: 'tilt-l' })}</div>
    ${deco('burst', 'burst', 'left:24%;top:16%;transform:rotate(-15deg)')}
    ${deco('burst', 'burst', 'left:58%;top:3%;transform:rotate(-30deg)')}
    ${deco('sparkle twinkle', 'sparkle', 'right:8%;top:14%')}
    ${deco('sparkle twinkle', 'sparkle', 'left:13%;top:68%')}
    <div class="navigate__dial"><svg class="navigate__wobble" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M6 6q-6 14 0 28M2 2q-8 18 0 36M94 6q6 14 0 28M98 2q8 18 0 36" fill="none" stroke="var(--c-ink)" stroke-width="1.2" stroke-linecap="round"/></svg></div>
    <div class="navigate__tip">
      ${curvedArrow({ cls: "navigate__arrow", viewBox: "0 0 120 70", d: "M108 62C106 24 72 12 36 28", head: "M10 38l30-22 6 28z", width: 8 })}
      <p class="note tilt-r">Rotate or click<br>to explore!</p>
    </div>
    <a class="btn btn--sm navigate__back" href="#/home">${'<svg aria-hidden="true"><use href="#i-arrow-l"/></svg>'} Back to home</a>
  </section>`);
  el.querySelector('.navigate__dial').prepend(dialEl);
  return { el, title: 'Navigate my world', destroy };
}
