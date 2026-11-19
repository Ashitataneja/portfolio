// Screen 17 — About details with section navigation and resume download.
import { h, title, deco, icon, esc, logo, announce, reducedMotion } from '../ui.js';
import { ABOUT_SECTIONS, PROFILE } from '../content.js';
import { wireResume } from '../resume.js';

const ART = { education: '<svg class="pc__art" viewBox="0 0 64 48"><use href="#i-cap"/></svg><svg class="pc__art pc__art--2" viewBox="0 0 64 40"><use href="#i-scroll"/></svg>',
  experience: '<svg class="pc__art" viewBox="0 0 64 48"><use href="#i-laptop"/></svg>', practice: '<svg class="pc__art" viewBox="0 0 64 64"><use href="#i-pencil"/></svg>',
  skills: '<svg class="pc__art" viewBox="0 0 48 48"><use href="#i-tools"/></svg>', research: '<svg class="pc__art" viewBox="0 0 64 48"><use href="#i-book"/></svg>' };

export async function render() {
  const S = Object.fromEntries(ABOUT_SECTIONS.map(s => [s.id, s]));
  const head = s => `<h2 class="pc__h"><span class="pc__n" aria-hidden="true">${s.n}</span><span class="pc__name">${esc(s.name)}</span></h2>`;
  const el = h(`<section class="screen profile bg-grid" aria-labelledby="pr-h">
    <header class="profile__head">
      ${title(PROFILE.name, { id: 'pr-h', cls: 'tilt-l' })}
      <p class="tag profile__tag">${esc(PROFILE.aboutTagline)}</p>
    </header>
    ${deco('burst', 'burst', 'left:48%;top:2%;transform:rotate(-10deg)')}
    <a class="btn btn--case profile__resume" href="#">${icon('download')} <span data-label>Download Resume</span></a>
    <nav class="profile__nav" aria-label="About sections">
      <ul>${ABOUT_SECTIONS.map(s => `<li><a href="#pc-${s.id}" data-id="${s.id}"><span>${s.n}</span><b>${esc(s.name)}</b>${icon('chev-r')}</a></li>`).join('')}</ul>
    </nav>
    <div class="profile__cards">
      <article class="pc pc--intro" id="pc-introduction" tabindex="-1">${head(S.introduction)}
        <p>Hi! I’m <b>${esc(PROFILE.name)}</b>, a designer with a keen interest in creating meaningful and engaging experiences through design.</p>
        <figure class="pc__photo"><img src="assets/img/portrait_about.jpg" alt="Portrait of Ashita Taneja" loading="lazy"></figure>
      </article>
      <article class="pc pc--edu" id="pc-education" tabindex="-1">${head(S.education)}
        ${S.education.items.map(it => `<div class="pc__item"><b>${esc(it.title)}</b><span>${esc(it.meta)}</span></div>`).join('')}${ART.education}
      </article>
      <article class="pc pc--exp" id="pc-experience" tabindex="-1">${head(S.experience)}
        ${S.experience.items.map(it => `<div class="pc__item"><b>${esc(it.title)}</b><span>${esc(it.meta)}</span><p>${esc(it.text)}</p></div>`).join('')}${ART.experience}
      </article>
      ${['practice', 'skills', 'research', 'beyond'].map(id => `
      <article class="pc pc--${id}" id="pc-${id}" tabindex="-1">${head(S[id])}<p>${esc(S[id].text)}</p>${ART[id] || '<span class="pc__art pc__art--cam">' + camArt() + '</span>'}</article>`).join('')}
    </div>
    <a class="icon-btn icon-btn--pink profile__back" href="#/about" aria-label="Back to About Me">${icon('arrow-l')}</a>
    ${deco('burst', 'burst', 'right:2%;bottom:calc(var(--bar-h) + 30px);transform:rotate(160deg)')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  wireResume(el.querySelector('.profile__resume'));
  const links = [...el.querySelectorAll('.profile__nav a')];
  const setActive = id => links.forEach(a => { const on = a.dataset.id === id; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
  setActive('introduction');
  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const card = el.querySelector('#pc-' + a.dataset.id);
    setActive(a.dataset.id);
    card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    card.focus({ preventScroll: true });
    card.classList.remove('is-flash'); void card.offsetWidth; card.classList.add('is-flash');
    announce(a.dataset.id);
  }));
  el.querySelector('.profile__nav').addEventListener('keydown', e => {
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
  });
  return { el, title: 'Profile' };
}
const camArt = () => `<svg viewBox="0 0 120 90" aria-hidden="true"><g stroke="var(--c-ink)" stroke-width="4" stroke-linejoin="round"><rect x="16" y="6" width="30" height="16" rx="4" fill="var(--c-ink)"/><rect x="4" y="16" width="112" height="70" rx="12" fill="var(--c-pink)"/><rect x="4" y="16" width="112" height="20" rx="8" fill="var(--c-yellow)"/><circle cx="62" cy="52" r="28" fill="var(--c-yellow)"/><circle cx="62" cy="52" r="18" fill="var(--c-ink)"/></g><circle cx="56" cy="46" r="5" fill="#fff"/></svg>`;
