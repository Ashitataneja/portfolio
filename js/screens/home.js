// Screen 04 — Homepage: name, portrait, introduction, rotary navigation.
import { h, title, deco, icon } from '../ui.js';
import { navDial } from '../dial.js';
import { PROFILE } from '../content.js';

export async function render(_, { go }) {
  const { el: dialEl, destroy } = navDial({ variant: 'home', onOpen: d => go(d.route) });
  const el = h(`<section class="screen home bg-grid" aria-labelledby="home-h">
    <a class="home__mono" href="#/home" aria-label="AT monogram">${title('AT', { tag: 'span' })}</a>
    ${deco('burst', 'burst', 'left:35%;top:9%;transform:rotate(-10deg) scaleX(-1)')}
    ${deco('sparkle twinkle', 'sparkle', 'left:83%;top:6%')}
    ${deco('sparkle twinkle', 'sparkle', 'left:18%;top:80%')}
    <span class="deco home__hi" aria-hidden="true"><svg viewBox="0 0 120 100"><path d="M18 10h84a14 14 0 0114 14v38a14 14 0 01-14 14H56L32 94l4-18H18A14 14 0 014 62V24a14 14 0 0114-14z" fill="var(--c-pink)" stroke="var(--c-ink)" stroke-width="5" stroke-linejoin="round" transform="translate(4 5)"/><path d="M18 10h84a14 14 0 0114 14v38a14 14 0 01-14 14H56L32 94l4-18H18A14 14 0 014 62V24a14 14 0 0114-14z" fill="var(--c-paper)" stroke="var(--c-ink)" stroke-width="5" stroke-linejoin="round"/><text x="60" y="56" text-anchor="middle" font-family="Titan One, sans-serif" font-size="34" fill="var(--c-ink)">Hi!</text></svg></span>
    <div class="home__left">
      ${title('Ashita\nTaneja', { id: 'home-h', cls: 'home__name tilt-l' })}
      <div class="home__intro note">
        <p class="home__tag">${PROFILE.tagline}</p>
        <p>${PROFILE.intro}</p>
      </div>
      ${deco('deco-cursor deco-cursor--w home__cursor', 'cursor', '')}
      <p class="home__hint">Rotate the dial or click a destination to explore.</p>
    </div>
    <div class="home__dial"></div>
    <a class="home__cam" href="#/navigate" aria-label="Zoom into the navigation dial">
      <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-camera"/></svg>
    </a>
    <div class="checker home__checker" aria-hidden="true"></div>
    <div class="stripes home__stripe" aria-hidden="true"></div>
  </section>`);
  el.querySelector('.home__dial').appendChild(dialEl);
  return { el, title: 'Home', destroy };
}
