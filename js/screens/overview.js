// The case-study intro now lives on the project screen; this old route forwards to the case study itself.
import { h } from '../ui.js';
import { PROJECTS } from '../content.js';
import { store } from '../state.js';

export async function render({ id }, { go }) {
  const p = PROJECTS.find(x => x.id === id);
  const stage = p ? (store.get().caseStage[p.id] || 0) + 1 : 1;
  go(p ? `#/work/${p.id}/case/${stage}` : '#/work', { replace: true });
  return { el: h('<div></div>'), noEnter: true };
}
