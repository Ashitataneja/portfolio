// Screen 19 — "Before you go…" postcard invitation on exit intent (desktop) + persistent mobile entry.
import { h, title, icon, trapFocus, reducedMotion } from './ui.js';
import { store } from './state.js';
import { play } from './sound.js';

// When does the invitation appear?
//  • leaving: the cursor crosses (or flies toward) the top edge of the browser
//  • returning: the visitor switched tab/window and comes back
//  • moving on: at a screen change (4th change; again 6 screens after "Maybe later")
// At most twice per session; "Close" stops it for the session.
const FIRST_AT = 4, LATER_GAP = 6, MAX_SHOWS = 2;
const explored = () => store.get().visited.filter(k => !['intro', 'postcard', 'postcard-preview'].includes(k)).length >= 2;
const onPostcard = () => location.hash.startsWith('#/postcard');
const blocked = () => {
  const s = store.get();
  const snoozed = s.exitCount > 0 && (s.navCount || 0) < (s.exitNextAt || 0);
  return !s.introSeen || s.exitBlocked || snoozed || (s.exitCount || 0) >= MAX_SHOWS || onPostcard() || !location.hash || location.hash === '#/' || location.hash.startsWith('#/intro')
    || document.querySelector('.modal-backdrop, .a11y:not([hidden])');
};
function maybeShow(reason) { if (!open && !blocked() && explored()) showInvite(reason); }

let open = false;
export function showInvite() {
  if (open) return;
  open = true;
  store.set(st => ({ exitShown: true, exitCount: (st.exitCount || 0) + 1 }));
  play('charge'); setTimeout(() => play('shutter'), 260);
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
  const close = (forever = false) => {
    release();
    store.set(st => ({ exitBlocked: forever ? true : st.exitBlocked, exitNextAt: (st.navCount || 0) + LATER_GAP }));
    open = false;
    if (reducedMotion()) return back.remove();
    back.style.animation = 'fadeIn .25s reverse forwards';
    setTimeout(() => back.remove(), 240);
  };
  const release = trapFocus(card, close);
  back.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => close(true)));
  back.querySelector('[data-later]').addEventListener('click', () => close(false));
  back.querySelector('[data-create]').addEventListener('click', () => { release(); open = false; back.remove(); });
  back.addEventListener('click', e => { if (e.target === back) close(false); });
  card.querySelector('[data-create]').focus();
}

export function mountExitIntent() {
  // 1. cursor crosses the top edge of the browser…
  document.documentElement.addEventListener('mouseout', e => {
    if (!e.relatedTarget && e.clientY <= 0) maybeShow('leave');
  });
  // …or is flung quickly toward it (catch the moment before it leaves)
  let lastY = null, lastT = 0;
  addEventListener('mousemove', e => {
    const t = performance.now();
    if (lastY !== null && e.clientY < 14 && (lastY - e.clientY) / Math.max(1, t - lastT) > 1.2) maybeShow('leave');
    lastY = e.clientY; lastT = t;
  }, { passive: true });
  // 2. visitor left for another tab/window and came back
  let leftAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) leftAt = Date.now();
    else if (leftAt && Date.now() - leftAt > 1500) setTimeout(() => maybeShow('return'), 500);
  });
  // 3. changing screens
  addEventListener('routechange', e => {
    if (['intro', 'postcard', 'postcard-preview'].includes(e.detail.key)) return;
    store.set(st => ({ navCount: (st.navCount || 0) + 1 }));
    const st = store.get();
    const due = st.exitCount ? st.navCount >= (st.exitNextAt || Infinity) : st.navCount >= FIRST_AT;
    if (due) setTimeout(() => maybeShow('screen'), 900);
  });
  // Mobile / touch: a persistent, unobtrusive postcard entry point
  const fab = h(`<a class="postcard-fab" href="#/postcard" aria-label="Make a postcard to take with you">${icon('image')}<span>Postcard</span></a>`);
  document.body.appendChild(fab);
  const sync = () => fab.classList.toggle('is-available', store.get().introSeen && !onPostcard() && !location.hash.match(/^#\/?$|#\/intro/));
  addEventListener('routechange', sync); sync();
}
