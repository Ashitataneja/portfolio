// Screen 09 — Case study introduction (no dedicated design supplied; built from the Screen 08/10 language).
import { h, title, deco, icon, img, esc, logo } from '../ui.js';
import { PROJECTS, STAGES } from '../content.js';
import { store } from '../state.js';

export async function render({ id }, { go }) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) { go('#/work', { replace: true }); return { el: h('<div></div>') }; }
  store.set({ selectedProject: p.id });
  const resume = store.get().caseStage[p.id] || 0;
  const el = h(`<section class="screen overview bg-grid" aria-labelledby="ov-h">
    ${logo()}
    <a class="btn btn--sm overview__back" href="#/work/${p.id}">${icon('arrow-l')} Back to project</a>
    <div class="overview__grid">
      <div class="overview__text">
        <p class="tag overview__kicker">${icon('camera')} Case study · ${esc(p.category)}</p>
        ${title(`${p.id}. ${p.title}`, { id: 'ov-h', cls: 'overview__title' })}
        <div class="overview__card">
          <h2>Overview</h2>
          <p>${esc(p.overview)}</p>
          <dl class="overview__facts">
            <div>${icon('user')}<dt>Role</dt><dd>${esc(p.role)}</dd></div>
            <div>${icon('calendar')}<dt>Duration</dt><dd>${esc(p.duration)}</dd></div>
            <div>${icon('users')}<dt>Team</dt><dd>${esc(p.team)}</dd></div>
          </dl>
        </div>
        <div class="overview__actions">
          <a class="btn btn--primary btn--lg" href="#/work/${p.id}/case/${resume + 1}">${resume ? 'Resume' : 'Enter'} case study ${icon('arrow-r')}</a>
          <span class="overview__stages">${STAGES.length} stages · ${STAGES.map(s => s.name).join(' → ')}</span>
        </div>
      </div>
      <figure class="overview__visual">
        <span class="polaroid"><span class="ph">${img(p.img, `${p.category} project visual`, 'loading="eager"')}</span></span>
        ${deco('burst burst--p', 'burst', 'left:-8%;top:-10%;transform:rotate(-70deg)')}
      </figure>
    </div>
    ${deco('sparkle twinkle', 'sparkle', 'right:3%;top:12%')}
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);
  return { el, title: `Case study — ${p.id}. ${p.title}` };
}
