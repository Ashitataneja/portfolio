// Screen 08 — Selected project.
import { h, title, deco, icon, img, esc, logo, curvedArrow } from '../ui.js';
import { PROJECTS, STAGES } from '../content.js';
import { store } from '../state.js';

export const starburst = (text, cls = '') => `<span class="starburst ${cls}"><svg viewBox="-50 -50 100 100" aria-hidden="true"><polygon points="${Array.from({ length: 36 }, (_, i) => { const r = i % 2 ? 40 : 49, a = i * Math.PI / 18; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a) * .72).toFixed(1)}`; }).join(' ')}" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="2.6" stroke-linejoin="round"/></svg><b>${text}</b></span>`;

export async function render({ id }, { go }) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) { go('#/work', { replace: true }); return { el: h('<div></div>') }; }
  store.set({ selectedProject: p.id });
  const resume = store.get().caseStage[p.id] || 0;
  const el = h(`<section class="screen project bg-grid" aria-labelledby="proj-h">
    ${logo()}
    <a class="btn btn--sm project__top-back" href="#/work">${icon('arrow-l')} Back to work</a>
    <figure class="project__photo">
      <span class="project__back" aria-hidden="true"></span>
      <span class="polaroid project__card"><span class="ph">${img(p.img, `${p.category} project visual`, 'loading="eager"')}</span></span>
      ${starburst(p.year, 'project__year')}
      ${deco('burst', 'burst', 'left:10%;top:-6%;transform:rotate(-60deg)')}
    </figure>
    ${curvedArrow({ cls: "project__swoosh", viewBox: "0 0 220 90", d: "M210 58C150 90 64 88 26 34", head: "M4 8l40 6-24 30z", width: 8 })}
    <div class="project__info">
      ${title(`${p.id}. ${p.title}`, { id: 'proj-h', cls: 'project__title' })}
      ${deco('burst', 'burst', 'right:-2%;top:-1%;transform:rotate(10deg)')}
      <p class="tag project__cat">${esc(p.category)}</p>
      <p class="project__desc">${esc(p.description)}</p>
      <hr class="project__rule">
      <ul class="project__meta">
        <li>${icon('user')} My Role: ${esc(p.role)}</li>
        <li>${icon('calendar')} Duration: ${esc(p.duration)}</li>
      </ul>
      <div class="project__actions">
        <a class="btn btn--primary btn--lg" href="#/work/${p.id}/case/${resume + 1}">${resume ? 'Resume' : 'Enter'} case study ${icon('arrow-r')}</a>
      </div>
      <p class="project__stages">${STAGES.length} stages · ${STAGES.map(s => esc(s.name)).join(' → ')}</p>
    </div>
    ${deco('sparkle twinkle', 'sparkle', 'left:2%;top:34%')}
    ${deco('sparkle twinkle', 'sparkle', 'left:38%;top:79%')}
    ${deco('sparkle twinkle', 'sparkle', 'right:3%;top:31%')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);
  return { el, title: `${p.id}. ${p.title}` };
}
