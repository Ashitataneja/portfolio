// Screen 20 — Choose a photograph for the postcard.
import { h, title, deco, icon, img, esc, logo, announce, reducedMotion } from '../ui.js';
import { PHOTOS, POSTCARD_PHOTOS } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

export async function render(_, { go }) {
  const list = POSTCARD_PHOTOS.map(id => PHOTOS.find(p => p.id === id));
  let sel = store.get().postcardPhoto;               // preserved when coming back via "Choose another photo"
  // slot order: [left-top, left-bottom, CENTER, right-top, right-bottom]
  let order = list.map(p => p.id);
  const centre = () => order[2];
  if (sel && order.includes(sel)) { const k = order.indexOf(sel); [order[2], order[k]] = [order[k], order[2]]; }
  const back = store.get().lastRoute || '#/home';

  const el = h(`<section class="screen pchoose bg-grid" aria-labelledby="pc-h">
    ${logo()}
    <header class="pchoose__head">
      ${title('Choose a\nphotograph', { id: 'pc-h', cls: 'tilt-l' })}
      <p class="tag pchoose__tag">Choose a moment to take with you.</p>
    </header>
    ${deco('burst', 'burst', 'left:51%;top:3%;transform:rotate(-10deg)')}
    <p class="pill pchoose__count" aria-live="polite">${icon('image')} <span></span></p>
    <div class="pchoose__stage" role="radiogroup" aria-label="Photographs for your postcard">
      ${list.map(p => `<button class="pchoose__ph polaroid" type="button" data-sound="none" role="radio" data-id="${p.id}" aria-label="${esc(p.alt)}">
        <span class="ph">${img(p.img, '', 'loading="eager"')}</span><span class="pchoose__check" aria-hidden="true">${icon('check')}</span></button>`).join('')}
      <p class="pchoose__hint" aria-hidden="true">Tap a photo to select it</p>
    </div>
    <button class="icon-btn icon-btn--pink pchoose__arrow pchoose__arrow--l" type="button" aria-label="Select previous photograph">${icon('arrow-l')}</button>
    <button class="icon-btn icon-btn--pink pchoose__arrow pchoose__arrow--r" type="button" aria-label="Select next photograph">${icon('arrow-r')}</button>
    <a class="btn pchoose__back" href="${esc(back)}">${icon('arrow-l')} Back to website</a>
    <a class="btn btn--primary btn--lg pchoose__go" data-sound="shutter" href="#" aria-disabled="true">Continue ${icon('arrow-r')}</a>
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const stage = el.querySelector('.pchoose__stage');
  const btns = Object.fromEntries([...el.querySelectorAll('.pchoose__ph')].map(b => [b.dataset.id, b]));
  const go_ = el.querySelector('.pchoose__go');

  function layout(animate) {
    const first = {};
    if (animate && !reducedMotion()) for (const id in btns) first[id] = btns[id].getBoundingClientRect();
    order.forEach((id, slot) => { btns[id].dataset.slot = slot; });
    if (animate && !reducedMotion()) for (const id in btns) {
      const a = first[id], b = btns[id].getBoundingClientRect();
      btns[id].animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})` }, { transform: 'none' }],
        { duration: 520, easing: 'cubic-bezier(.3,1.3,.5,1)', composite: 'add' });
    }
  }
  function paint() {
    for (const id in btns) { const on = id === sel; btns[id].setAttribute('aria-checked', on); btns[id].classList.toggle('is-sel', on); btns[id].tabIndex = (sel ? on : id === centre()) ? 0 : -1; }
    el.querySelector('.pchoose__count span').textContent = sel ? '1 selected' : '0 selected';
    stage.classList.toggle('has-sel', !!sel);
    if (sel) { go_.removeAttribute('aria-disabled'); go_.href = `#/postcard/${sel}`; }
    else { go_.setAttribute('aria-disabled', 'true'); go_.href = '#'; }
  }
  function choose(id, focus) {
    if (centre() !== id) { const k = order.indexOf(id); [order[2], order[k]] = [order[k], order[2]]; layout(true); }
    sel = id; store.set({ postcardPhoto: id }); paint(); play('focus');
    announce(`Selected: ${PHOTOS.find(p => p.id === id).alt}`);
    if (focus) btns[id].focus();
  }
  Object.values(btns).forEach(b => b.addEventListener('click', () => choose(b.dataset.id)));
  const step = d => { const ids = list.map(p => p.id); const k = sel ? ids.indexOf(sel) : (d > 0 ? -1 : 0); choose(ids[(k + d + ids.length) % ids.length], true); };
  el.querySelector('.pchoose__arrow--l').addEventListener('click', () => step(-1));
  el.querySelector('.pchoose__arrow--r').addEventListener('click', () => step(1));
  stage.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); step(1); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); step(-1); }
  });
  go_.addEventListener('click', e => {
    if (!sel) { e.preventDefault(); announce('Please choose a photograph first.'); stage.classList.remove('is-nudge'); void stage.offsetWidth; stage.classList.add('is-nudge'); }
  });
  layout(false); paint();
  return { el, title: 'Choose a photograph' };
}
