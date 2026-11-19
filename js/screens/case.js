// Screen 10 — Case study stages: process index, shutter to advance, previous, evidence panel.
import { h, title, deco, icon, img, esc, logo, shutter, announce, reducedMotion } from '../ui.js';
import { PROJECTS, STAGES } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

const apertureIcon = `<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="46" fill="var(--c-paper)" stroke="var(--c-ink)" stroke-width="6"/>${Array.from({ length: 6 }, (_, i) =>
  `<path transform="rotate(${i * 60})" d="M-6 -12 L 8 -42 A42 42 0 0 1 34 -24 L 12 -4 Z" fill="var(--c-ink)"/>`).join('')}<circle r="10" fill="var(--c-paper)"/></svg>`;

export async function render({ id, stage }, { go }) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) { go('#/work', { replace: true }); return { el: h('<div></div>') }; }
  let i = Math.min(STAGES.length - 1, Math.max(0, (parseInt(stage, 10) || 1) - 1));
  store.set(s => ({ selectedProject: p.id, caseStage: { ...s.caseStage, [p.id]: i } }));

  const el = h(`<section class="screen case bg-grid" aria-labelledby="case-h">
    ${logo()}
    <nav class="case__index" aria-label="Case study stages">
      <ol>${STAGES.map((s, k) => `<li><a href="#/work/${p.id}/case/${k + 1}" data-k="${k}" class="case__chip" data-sound="none"><span class="n">${k + 1}</span>${esc(s.name)}</a></li>`).join('')}</ol>
    </nav>
    <div class="case__stage" aria-live="polite"></div>
    <div class="case__controls">
      <button class="btn btn--lg case__prev" type="button" data-sound="none">${icon('arrow-l')} Previous</button>
      <div class="case__shutter-wrap">
        ${deco('burst', 'burst', 'left:-62%;top:18%;transform:rotate(-100deg) scale(.7)')}
        ${deco('burst', 'burst', 'right:-62%;top:18%;transform:rotate(80deg) scale(.7) scaleY(-1)')}
        <button class="case__shutter" type="button" data-sound="none">${apertureIcon}<span class="sr-only">Next stage</span></button>
        <span class="case__shutter-label" aria-hidden="true">Next</span>
      </div>
      <div class="case__evidence-slot"></div>
    </div>
    <a class="btn btn--sm case__exit" href="#/work/${p.id}/overview">${icon('arrow-l')} Case overview</a>
    ${deco('sparkle twinkle', 'sparkle', 'right:2.5%;top:22%')}
    ${deco('sparkle twinkle', 'sparkle', 'right:3.5%;bottom:calc(var(--bar-h) + 40px);width:36px')}
    ${deco('deco-cursor deco-cursor--y case__cursor', 'cursor', '')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const stageEl = el.querySelector('.case__stage');
  const chips = [...el.querySelectorAll('.case__chip')];
  const prevBtn = el.querySelector('.case__prev');
  const shutterBtn = el.querySelector('.case__shutter');
  const evSlot = el.querySelector('.case__evidence-slot');
  let evOpen = false, busy = false;

  function paint() {
    const s = STAGES[i];
    chips.forEach((c, k) => {
      c.classList.toggle('is-current', k === i);
      c.classList.toggle('is-done', k < i);
      k === i ? c.setAttribute('aria-current', 'step') : c.removeAttribute('aria-current');
    });
    stageEl.innerHTML = `
      <div class="case__left">
        ${title(`${String(i + 1).padStart(2, '0')}. ${s.name}`, { tag: 'h1', id: 'case-h', cls: 'case__title' })}
        <p class="case__sub">${esc(s.subtitle)}</p>
        <figure class="case__visual">
          ${deco('burst burst--p', 'burst', 'left:-9%;top:-14%;transform:rotate(-80deg)')}
          <span class="case__frame">${img(s.img || p.img, `${s.name} stage visual`, 'loading="eager"')}</span>
        </figure>
      </div>
      <article class="case__card">
        <span class="case__clip" aria-hidden="true"></span>
        <h2>${esc(s.cardTitle)}</h2>
        <p>${esc(s.text)}</p>
        ${s.facts ? `<ul class="case__facts">${s.facts.map(f => `<li>${icon(f.icon)}<b>${esc(f.label)}</b><span>${esc(f.value)}</span></li>`).join('')}</ul>` : ''}
        <p class="case__progress" aria-hidden="true">Stage ${i + 1} of ${STAGES.length}</p>
      </article>`;
    prevBtn.disabled = i === 0;
    prevBtn.setAttribute('aria-label', i === 0 ? 'Previous stage (this is the first stage)' : `Previous stage: ${STAGES[i - 1].name}`);
    const last = i === STAGES.length - 1;
    shutterBtn.querySelector('.sr-only').textContent = last ? 'Finish — back to the project' : `Next stage: ${STAGES[i + 1].name}`;
    el.querySelector('.case__shutter-label').textContent = last ? 'Finish' : 'Next';
    renderEvidence();
    store.set(st => ({ caseStage: { ...st.caseStage, [p.id]: i } }));
    history.replaceState(null, '', `#/work/${p.id}/case/${i + 1}`);
    document.title = `${s.name} — ${p.id}. ${p.title} — Ashita Taneja`;
  }

  function renderEvidence() {
    const ev = STAGES[i].evidence;
    evSlot.innerHTML = evOpen
      ? `<aside class="case__evidence" id="evidence" aria-label="Evidence for ${esc(STAGES[i].name)}">
          <span class="case__ev-icon">${icon('camera')}</span>
          <div><h3>${esc(ev.title)}</h3><p>${esc(ev.text)}</p></div>
          <button class="case__ev-x" type="button" aria-label="Close evidence">${icon('close')}</button>
         </aside>`
      : `<button class="case__ev-open" type="button" data-sound="focus" aria-expanded="false" aria-controls="evidence">
          <span class="case__ev-icon">${icon('camera')}</span><span><b>Evidence</b><small>See research material</small></span></button>`;
    evSlot.querySelector('.case__ev-open')?.addEventListener('click', () => toggleEv(true));
    evSlot.querySelector('.case__ev-x')?.addEventListener('click', () => toggleEv(false));
  }
  function toggleEv(open) {
    evOpen = open; renderEvidence();
    (open ? evSlot.querySelector('.case__ev-x') : evSlot.querySelector('.case__ev-open')).focus();
    announce(open ? `Evidence: ${STAGES[i].evidence.text}` : 'Evidence closed');
  }

  async function goTo(n, withShutter) {
    if (busy || n === i) return;
    if (n >= STAGES.length) return go(`#/work/${p.id}`);
    if (n < 0) return;
    busy = true;
    if (withShutter) await shutter();
    else { play('wind'); }
    if (!withShutter && !reducedMotion()) { stageEl.classList.add('is-flip'); await new Promise(r => setTimeout(r, 160)); }
    i = n; paint();
    stageEl.classList.remove('is-flip');
    stageEl.classList.add('is-develop');
    setTimeout(() => stageEl.classList.remove('is-develop'), 700);
    announce(`Stage ${i + 1}: ${STAGES[i].name}`);
    busy = false;
  }

  shutterBtn.addEventListener('click', () => {
    shutterBtn.classList.remove('is-click'); void shutterBtn.offsetWidth; shutterBtn.classList.add('is-click');
    goTo(i + 1, true);
  });
  prevBtn.addEventListener('click', () => goTo(i - 1, false));
  chips.forEach(c => c.addEventListener('click', e => { e.preventDefault(); goTo(+c.dataset.k, true); }));
  const onKey = e => {
    if (e.target.closest('input, textarea') || document.querySelector('.modal-backdrop')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1, false); }
    else if (/^[1-8]$/.test(e.key)) goTo(+e.key - 1, true);
    else if (e.key.toLowerCase() === 'e') toggleEv(!evOpen);
    else if (e.key === 'Escape' && evOpen) toggleEv(false);
  };
  document.addEventListener('keydown', onKey);
  paint();

  return { el, title: `${STAGES[i].name} — case study`, destroy: () => document.removeEventListener('keydown', onKey) };
}
