// Screen 10 — Case study stages: process index, a small iris button to advance, previous.
import { h, title, deco, icon, img, esc, logo, announce, reducedMotion, apertureSVG, setAperture, animate } from '../ui.js';
import { PROJECTS, STAGES } from '../content.js';
import { store } from '../state.js';
import { play } from '../sound.js';

const IRIS_REST = 0.42; // how far the button's pinhole is open when idle

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
        <button class="case__shutter" type="button" data-sound="none">${apertureSVG({ n: 6, size: 100, id: 'next-iris', glass: false })}<span class="sr-only">Next stage</span></button>
        <span class="case__shutter-label" aria-hidden="true">Next</span>
      </div>
      <span class="case__controls-end" aria-hidden="true"></span>
    </div>
    <a class="btn btn--sm case__exit" href="#/work/${p.id}">${icon('arrow-l')} Back to project</a>
    ${deco('sparkle twinkle', 'sparkle', 'right:2.5%;top:22%')}
    ${deco('sparkle twinkle', 'sparkle', 'right:3.5%;bottom:calc(var(--bar-h) + 40px);width:36px')}
    ${deco('deco-cursor deco-cursor--y case__cursor', 'cursor', '')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const stageEl = el.querySelector('.case__stage');
  const chips = [...el.querySelectorAll('.case__chip')];
  const prevBtn = el.querySelector('.case__prev');
  const shutterBtn = el.querySelector('.case__shutter');
  const iris = shutterBtn.querySelector('.aperture');
  setAperture(iris, IRIS_REST);
  let busy = false;

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
    store.set(st => ({ caseStage: { ...st.caseStage, [p.id]: i } }));
    history.replaceState(null, '', `#/work/${p.id}/case/${i + 1}`);
    document.title = `${s.name} — ${p.id}. ${p.title} — Ashita Taneja`;
  }

  // The small pinhole in the Next button closes and opens again, with the shutter sound. Nothing full-screen.
  async function blink() {
    play('shutter');
    if (reducedMotion()) return;
    await animate(IRIS_REST, 0.02, 140, v => setAperture(iris, v), t => t * t);
    await new Promise(r => setTimeout(r, 50));
    await animate(0.02, IRIS_REST, 260, v => setAperture(iris, v));
  }

  async function goTo(n, withShutter) {
    if (busy || n === i) return;
    if (n >= STAGES.length) return go(`#/work/${p.id}`);
    if (n < 0) return;
    busy = true;
    if (withShutter) { blink(); stageEl.classList.add("is-flip"); await new Promise(r => setTimeout(r, reducedMotion() ? 0 : 170)); }
    else { play('wind'); if (!reducedMotion()) { stageEl.classList.add('is-flip'); await new Promise(r => setTimeout(r, 160)); } }
    i = n; paint();
    stageEl.classList.remove('is-flip');
    stageEl.classList.add('is-develop');
    setTimeout(() => stageEl.classList.remove('is-develop'), 700);
    announce(`Stage ${i + 1}: ${STAGES[i].name}`);
    busy = false;
  }

  shutterBtn.addEventListener('click', () => goTo(i + 1, true));
  prevBtn.addEventListener('click', () => goTo(i - 1, false));
  chips.forEach(c => c.addEventListener('click', e => { e.preventDefault(); goTo(+c.dataset.k, true); }));
  const onKey = e => {
    if (e.target.closest('input, textarea') || document.querySelector('.modal-backdrop')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1, false); }
    else if (/^[1-8]$/.test(e.key)) goTo(+e.key - 1, true);
  };
  document.addEventListener('keydown', onKey);
  paint();

  return { el, title: `${STAGES[i].name} — case study`, destroy: () => document.removeEventListener('keydown', onKey) };
}
