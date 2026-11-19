// Screen 08 — Selected project.
import { h, title, deco, icon, img, esc, logo } from '../ui.js';
import { PROJECTS } from '../content.js';
import { store } from '../state.js';

export const starburst = (text, cls = '') => `<span class="starburst ${cls}"><svg viewBox="-50 -50 100 100" aria-hidden="true"><polygon points="${Array.from({ length: 36 }, (_, i) => { const r = i % 2 ? 40 : 49, a = i * Math.PI / 18; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a) * .72).toFixed(1)}`; }).join(' ')}" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="2.6" stroke-linejoin="round"/></svg><b>${text}</b></span>`;

export async function render({ id }, { go }) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) { go('#/work', { replace: true }); return { el: h('<div></div>') }; }
  store.set({ selectedProject: p.id });
  const el = h(`<section class="screen project bg-grid" aria-labelledby="proj-h">
    ${logo()}
    <figure class="project__photo">
      <span class="project__back" aria-hidden="true"></span>
      <span class="polaroid project__card"><span class="ph">${img(p.img, `${p.category} project visual`, 'loading="eager"')}</span></span>
      ${starburst(p.year, 'project__year')}
      ${deco('burst', 'burst', 'left:10%;top:-6%;transform:rotate(-60deg)')}
    </figure>
    <svg class="project__swoosh" viewBox="0 0 220 90" aria-hidden="true"><path d="M210 60C150 92 60 90 20 30" fill="none" stroke="var(--c-ink)" stroke-width="12" stroke-linecap="round"/><path d="M210 60C150 92 60 90 20 30" fill="none" stroke="var(--c-yellow)" stroke-width="7" stroke-linecap="round"/><path d="M4 8l40 6-24 30z" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="3.5" stroke-linejoin="round"/></svg>
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
        <a class="btn btn--primary btn--lg" href="#/work/${p.id}/overview">Open case study ${icon('arrow-r')}</a>
        <a class="btn btn--lg btn--light" href="#/work">${icon('arrow-l')} Back to work</a>
      </div>
    </div>
    ${deco('sparkle twinkle', 'sparkle', 'left:2%;top:34%')}
    ${deco('sparkle twinkle', 'sparkle', 'left:38%;top:79%')}
    ${deco('sparkle twinkle', 'sparkle', 'right:3%;top:31%')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);
  return { el, title: `${p.id}. ${p.title}` };
}
