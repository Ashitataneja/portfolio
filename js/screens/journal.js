// Screen 14 — Journal: a physical notebook that opens to show the entries; page-turn into an article.
import { h, title, deco, icon, img, esc, logo, reducedMotion, announce, wait } from '../ui.js';
import { ARTICLES } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

export const bookTabs = () => `<span class="book__tabs" aria-hidden="true"><i></i><i></i><i></i></span>`;

export async function render(_, { go }) {
  const st = store.get();
  const open = st.journalOpen;
  const el = h(`<section class="screen journal bg-grid" aria-labelledby="j-h">
    ${logo()}
    <header class="journal__head">
      ${title('Journal', { id: 'j-h', cls: 'tilt-l' })}
      <p class="tag journal__tag">Ideas, thoughts and more.</p>
    </header>
    ${deco('burst', 'burst', 'left:44%;top:2%;transform:rotate(-10deg)')}
    <p class="note journal__note">Read. Explore. Repeat.</p>
    <div class="book ${open ? 'is-open' : ''}">
      <button class="book__cover" type="button" data-sound="none" aria-expanded="${open}" aria-controls="journal-entries">
        <span class="book__pages" aria-hidden="true"></span>
        <span class="book__face">
          <span class="book__star" aria-hidden="true">★</span>
          <span class="book__label">My<br>Journal</span>
          <span class="book__x" aria-hidden="true"></span>
          <span class="book__band" aria-hidden="true"></span>
        </span>
        <span class="book__cta"><span class="sr-only">${open ? 'Journal open' : 'Open the journal'}</span><span aria-hidden="true">${open ? '' : 'Tap to open'}</span></span>
      </button>
      ${deco('burst', 'burst', 'left:-9%;top:22%;transform:rotate(-100deg)')}
      <svg class="book__arrow" viewBox="0 0 170 90" aria-hidden="true"><path d="M10 70C40 10 110 4 150 40" fill="none" stroke="var(--c-ink)" stroke-width="14" stroke-linecap="round"/><path d="M10 70C40 10 110 4 150 40" fill="none" stroke="var(--c-yellow)" stroke-width="8" stroke-linecap="round"/><path d="M166 60l-6-38-30 22z" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="3.5" stroke-linejoin="round"/></svg>
      <div class="book__spread" id="journal-entries" ${open ? '' : 'hidden'}>
        <span class="book__left" aria-hidden="true"></span>
        <div class="book__page">
          <h2 class="sr-only">Entries</h2>
          <ul class="entries">${ARTICLES.map(a => `
            <li><a data-sound="none" class="entry${a.slug === st.journalLast ? ' is-last' : ''}" href="#/notes/${a.slug}" data-slug="${a.slug}">
              <span class="entry__img">${img(a.img, '')}</span>
              <span class="entry__txt"><b>${esc(a.title)}</b><span>${esc(a.subtitle)}</span><small>${esc(a.date)} • ${esc(a.read)}</small></span>
              <span class="entry__go" aria-hidden="true">${icon('chev-r')}</span>
            </a></li>`).join('')}</ul>
        </div>
        ${bookTabs()}
      </div>
    </div>
    <a class="btn btn--sm journal__back" href="#/home">${icon('arrow-l')} Back to home</a>
    ${deco('deco-cursor journal__cursor', 'cursor', '')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const book = el.querySelector('.book');
  const cover = el.querySelector('.book__cover');
  const spread = el.querySelector('.book__spread');
  async function openBook() {
    if (book.classList.contains('is-open')) return;
    play('page'); setTimeout(() => play('page'), 220);
    spread.hidden = false;
    void spread.offsetWidth;
    book.classList.add('is-open');
    cover.setAttribute('aria-expanded', 'true');
    cover.querySelector('.book__cta').innerHTML = '<span class="sr-only">Journal open</span>';
    store.set({ journalOpen: true });
    announce(`Journal opened. ${ARTICLES.length} entries.`);
    await wait(650);
    el.querySelector('.entry').focus({ preventScroll: true });
  }
  cover.addEventListener('click', () => { book.classList.contains('is-open') ? el.querySelector('.entry').focus() : openBook(); });

  el.querySelectorAll('.entry').forEach(a => a.addEventListener('click', async e => {
    e.preventDefault();
    store.set({ journalLast: a.dataset.slug, journalScroll: scrollY, journalOpen: true });
    if (!reducedMotion()) {
      const page = el.querySelector('.book__page');
      page.classList.add('is-turning'); play('page');
      await wait(560);
    }
    go(a.getAttribute('href'));
  }));

  return { el, title: 'Journal', scrollTo: open ? st.journalScroll : 0, keepFocus: !!st.journalLast,
    mounted() { if (open && st.journalLast) el.querySelector(`.entry[data-slug="${st.journalLast}"]`)?.focus({ preventScroll: true }); } };
}
