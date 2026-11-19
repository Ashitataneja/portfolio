// Hash router. Each screen module exports `render(params, ctx)` → { el, mounted?(), destroy?() , title }.
import { store } from './state.js';
import { announce, reducedMotion } from './ui.js';

const routes = [];
let current = null, navToken = 0;

export function route(pattern, loader, key) {
  const names = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, n) => (names.push(n), '([^/]+)')) + '/?$');
  routes.push({ re, names, loader, key });
}
export const go = (hash, { replace = false } = {}) => {
  if (location.hash === hash) return resolve();
  replace ? location.replace(hash) : (location.hash = hash);
};

async function resolve() {
  const token = ++navToken;
  const path = location.hash.replace(/^#/, '') || '/';
  let match = null, params = {};
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) { match = r; r.names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1]))); break; }
  }
  if (!match) return go('#/home', { replace: true });
  const mod = await match.loader();
  if (token !== navToken) return;
  const stage = document.getElementById('main');
  const swap = async () => {
    current?.destroy?.();
    const view = await mod.render(params, { go });
    if (token !== navToken) return;
    stage.replaceChildren(view.el);
    if (!view.noEnter) view.el.classList.add('screen-enter');
    current = view;
    window.scrollTo(0, view.scrollTo ?? 0);
    document.title = (view.title ? view.title + ' — ' : '') + 'Ashita Taneja';
    view.mounted?.();
    // Move focus to the screen heading for keyboard and screen-reader users
    const focusTarget = view.el.querySelector('[data-autofocus]') || view.el.querySelector('h1') ;
    if (focusTarget && !view.keepFocus) { focusTarget.tabIndex = -1; focusTarget.focus({ preventScroll: true }); }
    announce(view.title || '');
  };
  store.set(s => ({ visited: s.visited.includes(match.key) ? s.visited : [...s.visited, match.key],
    lastRoute: match.key.startsWith('postcard') || match.key === 'intro' ? s.lastRoute : location.hash }));
  if (document.startViewTransition && !reducedMotion() && current && !current.skipVT) {
    await document.startViewTransition(swap).finished.catch(() => {});
  } else await swap();
  window.dispatchEvent(new CustomEvent('routechange', { detail: { key: match.key, params } }));
}

export function start() {
  addEventListener('hashchange', resolve);
  resolve();
}
