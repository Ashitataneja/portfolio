// Tiny store. Colour settings persist per visitor (localStorage);
// navigation state (selected project, photo, article, scratch progress…) persists for the session.
const LOCAL_KEY = 'at-portfolio:prefs';
const SESSION_KEY = 'at-portfolio:session';

const defaults = {
  colour: { mode: 'deuteranopia', amount: 0 },
  introSeen: false,
  homeIndex: 0,          // dial position on home / navigate
  contactIndex: 0,       // contact dial position
  selectedProject: null, // id
  caseStage: {},         // { [projectId]: stageIndex }
  archivePhoto: null,    // selected memory id
  journalOpen: false,
  journalScroll: 0,
  journalLast: null,     // last article slug
  aboutRevealed: [],     // tile ids
  postcardPhoto: null,
  visited: [],           // route keys visited this session
  exitShown: false,
  startedAt: Date.now(),
};
const LOCAL_FIELDS = ['colour'];

function read(storage, key) {
  try { return JSON.parse(storage.getItem(key) || '{}'); } catch { return {}; }
}
function write(storage, key, obj) {
  try { storage.setItem(key, JSON.stringify(obj)); } catch { /* storage unavailable: keep in memory */ }
}

let state = { ...defaults, ...read(sessionStorage, SESSION_KEY), ...read(localStorage, LOCAL_KEY) };
if (!state.colour || typeof state.colour.amount !== 'number') state.colour = { ...defaults.colour };
const subs = new Set();

export const store = {
  get: () => state,
  set(patch) {
    const p = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...p };
    const local = {}, session = {};
    for (const [k, v] of Object.entries(state)) (LOCAL_FIELDS.includes(k) ? local : session)[k] = v;
    write(localStorage, LOCAL_KEY, local);
    write(sessionStorage, SESSION_KEY, session);
    subs.forEach(fn => fn(state));
  },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
};
