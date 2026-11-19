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
    <span class="deco home__warn" aria-hidden="true"><svg viewBox="0 0 64 56"><use href="#i-warning"/></svg></span>
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
