// Screen 15 — Individual journal article with previous / next and page-turn.
import { h, title, deco, icon, img, esc, logo, reducedMotion, wait } from '../ui.js';
import { ARTICLES } from '../content.js';
import { store } from '../state.js';
import { bookTabs } from './journal.js';
import { play } from '../sound.js';

export async function render({ slug }, { go }) {
  const i = ARTICLES.findIndex(a => a.slug === slug);
  if (i < 0) { go('#/notes', { replace: true }); return { el: h('<div></div>') }; }
  const a = ARTICLES[i], prev = ARTICLES[(i - 1 + ARTICLES.length) % ARTICLES.length], next = ARTICLES[(i + 1) % ARTICLES.length];
  store.set({ journalLast: a.slug, journalOpen: true });
  const [p1, ...rest] = a.body;
  const el = h(`<section class="screen article bg-grid" aria-labelledby="art-h">
    ${logo()}
    <article class="sheet">
      ${bookTabs()}
      <header class="sheet__head">
        ${title(a.title, { id: 'art-h', cls: 'is-case sheet__title' })}
        ${deco('burst', 'burst', 'left:49%;top:-3%;transform:rotate(-10deg)')}
        <p class="sheet__sub">${esc(a.subtitle)}</p>
        <p class="sheet__meta"><span>${icon('calendar')} <time>${esc(a.date)}</time></span><span aria-hidden="true">|</span><span>${icon('clock')} ${esc(a.read)}</span></p>
        <a class="btn btn--case sheet__back" href="#/notes" data-sound="page">${icon('arrow-l')} Back to Journal</a>
      </header>
      <div class="sheet__body">
        <figure class="sheet__fig">${img(a.img, `Photograph accompanying “${a.title}”`, 'loading="eager"')}${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>
        <div class="sheet__text">
          ${p1 ? [p1, ...(a.img2 ? rest.slice(0, -1) : rest)].map(t => `<p>${esc(t)}</p>`).join('') : `<p class="sheet__lead">${esc(a.subtitle)}</p>`}
          ${a.img2 && rest.length ? `<div class="sheet__pair">${img(a.img2, '')}<p>${esc(rest.at(-1))}</p></div>` : ''}
        </div>
      </div>
    </article>
    <nav class="sheet__nav" aria-label="More articles">
      <a class="btn btn--case btn--lg" href="#/notes/${prev.slug}" rel="prev" data-dir="-1" data-sound="page">${icon('arrow-l')} Previous Article<span class="sr-only">: ${esc(prev.title)}</span></a>
      <a class="btn btn--case btn--lg" href="#/notes/${next.slug}" rel="next" data-dir="1" data-sound="page">Next Article ${icon('arrow-r')}<span class="sr-only">: ${esc(next.title)}</span></a>
    </nav>
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  el.querySelectorAll('.sheet__nav a').forEach(link => link.addEventListener('click', async e => {
    e.preventDefault();
    if (!reducedMotion()) {
      const sheet = el.querySelector('.sheet');
      sheet.classList.add(link.dataset.dir === '1' ? 'turn-next' : 'turn-prev');
      await wait(480);
    }
    go(link.getAttribute('href'));
  }));
  return { el, title: a.title };
}
