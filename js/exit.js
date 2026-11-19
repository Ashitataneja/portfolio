// Screen 19 — "Before you go…" postcard invitation on exit intent (desktop) + persistent mobile entry.
import { h, title, icon, trapFocus, reducedMotion } from './ui.js';
import { store } from './state.js';

const MIN_SCREENS = 3, MIN_MS = 40000;
const explored = () => {
  const s = store.get();
  const keys = s.visited.filter(k => !['intro', 'postcard', 'postcard-preview'].includes(k));
  return keys.length >= MIN_SCREENS || (keys.length >= 2 && Date.now() - s.startedAt > MIN_MS);
};
const onPostcard = () => location.hash.startsWith('#/postcard');

let open = false;
export function showInvite() {
  if (open) return;
  open = true;
  store.set({ exitShown: true });
  const back = h(`<div class="modal-backdrop bg-grid exit" role="presentation">
    <div class="exit__card" role="dialog" aria-modal="true" aria-labelledby="exit-h" aria-describedby="exit-q">
      <button class="exit__x icon-btn icon-btn--pink" type="button" data-close aria-label="Close">${icon('close')}</button>
      <div class="exit__title">${title('Before\nyou go…', { tag: 'h2', id: 'exit-h', cls: 'tilt-l' })}</div>
      <p id="exit-q" class="exit__q">Would you like to take a photograph with you?</p>
      <figure class="exit__photo" aria-hidden="true">
        <img src="assets/img/palace.jpg" alt="">
        <span class="stamp">${icon('camera')}</span>
        <svg class="postmark" viewBox="0 0 150 60"><path d="M2 12c25-12 50 12 75 0s50 12 73 0M2 30c25-12 50 12 75 0s50 12 73 0M2 48c25-12 50 12 75 0s50 12 73 0" fill="none" stroke="var(--c-ink)" stroke-width="3"/></svg>
      </figure>
      <div class="exit__btns">
        <a class="btn btn--primary btn--lg" href="#/postcard" data-create>${icon('camera')} Create my postcard</a>
        <button class="btn btn--lg" type="button" data-later>Maybe later</button>
        <button class="btn btn--lg" type="button" data-close>Close</button>
      </div>
    </div>
  </div>`);
  document.getElementById('overlay-root').appendChild(back);
  const card = back.querySelector('.exit__card');
  const close = () => {
    release();
    open = false;
    if (reducedMotion()) return back.remove();
    back.style.animation = 'fadeIn .25s reverse forwards';
    setTimeout(() => back.remove(), 240);
  };
  const release = trapFocus(card, close);
  back.querySelectorAll('[data-close],[data-later]').forEach(b => b.addEventListener('click', close));
  back.querySelector('[data-create]').addEventListener('click', () => { release(); open = false; back.remove(); });
  back.addEventListener('click', e => { if (e.target === back) close(); });
  card.querySelector('[data-create]').focus();
}

export function mountExitIntent() {
  document.documentElement.addEventListener('mouseout', e => {
    if (e.relatedTarget || e.clientY > 8) return;          // leaving through the top edge only
    const s = store.get();
    if (s.exitShown || onPostcard() || !explored()) return;
    showInvite();
  });
  // Mobile / touch: a persistent, unobtrusive postcard entry point
  const fab = h(`<a class="postcard-fab" href="#/postcard" aria-label="Make a postcard to take with you">${icon('image')}<span>Postcard</span></a>`);
  document.body.appendChild(fab);
  const sync = () => fab.classList.toggle('is-available', store.get().introSeen && !onPostcard() && !location.hash.match(/^#\/?$|#\/intro/));
  addEventListener('routechange', sync); sync();
}
