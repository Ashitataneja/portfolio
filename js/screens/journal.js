// Screen 14 — Journal: a physical notebook that opens to show the entries; page-turn into an article.
import { h, title, deco, icon, img, esc, logo, reducedMotion, announce, wait, curvedArrow } from '../ui.js';
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
          <span class="book__x" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M22 8l28 28 28-28 14 14-28 28 28 28-14 14-28-28-28 28L8 78l28-28L8 22z" fill="var(--c-pink)" stroke="var(--c-ink)" stroke-width="6" stroke-linejoin="round"/></svg></span>
          <span class="book__band" aria-hidden="true"></span>
        </span>
        <span class="book__cta"><span class="sr-only">${open ? 'Journal open' : 'Open the journal'}</span><span aria-hidden="true">${open ? '' : 'Tap to open'}</span></span>
      </button>
      ${deco('burst', 'burst', 'left:-9%;top:22%;transform:rotate(-100deg)')}
      ${curvedArrow({ cls: "book__arrow", viewBox: "0 0 170 90", d: "M12 72C42 14 108 8 146 40", head: "M166 62l-6-38-30 22z", width: 8 })}
      <div class="book__spread" id="journal-entries" ${open ? '' : 'hidden'}>
        <span class="book__left" aria-hidden="true"></span>
        <span class="book__under" aria-hidden="true">${bookTabs()}</span>
        <div class="book__page">
          <h2 class="sr-only">Entries</h2>
          <ul class="entries">${ARTICLES.map(a => `
            <li><a data-sound="none" class="entry${a.slug === st.journalLast ? ' is-last' : ''}" href="#/notes/${a.slug}" data-slug="${a.slug}">
              <span class="entry__img">${img(a.img, '')}</span>
              <span class="entry__txt"><b>${esc(a.title)}</b><span>${esc(a.subtitle)}</span><small>${esc(a.date)} • ${esc(a.read)}</small></span>
              <span class="entry__go" aria-hidden="true">${icon('chev-r')}</span>
            </a></li>`).join('')}</ul>
        </div>
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
      // The page lifts from its right edge and swings over the spine: first half shows the entries tilting away,
      // second half shows the paper back of the page landing on the left, revealing the next page underneath.
      const page = el.querySelector('.book__page');
      const leaf = h('<span class="book__leaf" aria-hidden="true"></span>');
      page.after(leaf);
      page.classList.add('is-turning'); play('page');
      await wait(290);
      page.style.visibility = 'hidden';
      leaf.classList.add('is-on');
      await wait(380);
    }
    go(a.getAttribute('href'));
  }));

  return { el, title: 'Journal', skipVT: true, scrollTo: open ? st.journalScroll : 0, keepFocus: !!st.journalLast,
    mounted() { if (open && st.journalLast) el.querySelector(`.entry[data-slug="${st.journalLast}"]`)?.focus({ preventScroll: true }); } };
}
