// Accessibility settings: one icon (top-right, every screen) opening one shared panel.
// Colour vision writes colour TOKENS (--c-*) on :root — no page-wide colour filter.
import { PALETTES, MODES, TOKENS } from './palettes.js';
import { store } from './state.js';
import { announce, h, icon } from './ui.js';
import { play } from './sound.js';

export const A11Y_DEFAULTS = { textScale: 100, brightness: 100, contrast: false, readable: false, motion: false, sound: true };
const a11y = () => ({ ...A11Y_DEFAULTS, ...(store.get().a11y || {}) });
const setA11y = patch => store.set(s => ({ a11y: { ...A11Y_DEFAULTS, ...(s.a11y || {}), ...patch } }));

const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = r => '#' + r.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = c => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const mix = (a, b, t) => { const A = hexToRgb(a).map(toLin), B = hexToRgb(b).map(toLin); return rgbToHex(A.map((v, i) => toSrgb(v + (B[i] - v) * t))); };
const cssName = k => '--c-' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

export function currentTokens() {
  const { mode, amount } = store.get().colour;
  const from = PALETTES.original, to = PALETTES[mode] || from, t = amount / 100;
  const out = {};
  for (const k of TOKENS) out[k] = mix(from[k], to[k], t);
  return out;
}
export function applyTokens() {
  const tok = currentTokens(), root = document.documentElement;
  for (const k of TOKENS) root.style.setProperty(cssName(k), tok[k]);
  const { mode, amount } = store.get().colour;
  root.dataset.cvd = amount > 0 ? mode : 'original';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tok.bg);
  window.dispatchEvent(new CustomEvent('tokens-changed', { detail: tok }));
}
export function applyA11y() {
  const a = a11y(), root = document.documentElement;
  root.style.setProperty('--text-scale', a.textScale / 100);
  root.style.setProperty('--brightness', a.brightness / 100);
  root.classList.toggle('a11y-contrast', a.contrast);
  root.classList.toggle('a11y-readable', a.readable);
  root.classList.toggle('reduce-motion', a.motion);
}

const toggleRow = (key, label, hint) => `
  <div class="a11y__row a11y__row--toggle">
    <span><b id="a11y-${key}-l">${label}</b><small>${hint}</small></span>
    <button type="button" class="a11y__switch" role="switch" data-key="${key}" aria-labelledby="a11y-${key}-l" data-sound="none"><span class="on">On</span><span class="off">Off</span></button>
  </div>`;

export function mountAccessibility(root) {
  const btn = h(`<button class="a11y-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="a11y-panel" data-sound="none">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--c-paper)" stroke="var(--c-ink)" stroke-width="2"/><circle cx="12" cy="6.2" r="1.9" fill="var(--c-ink)"/><path d="M5.5 9.2l6.5 1.3 6.5-1.3M12 10.5v4.2l-3 4.8M12 14.7l3 4.8" fill="none" stroke="var(--c-ink)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span class="sr-only">Accessibility settings</span></button>`);
  const panel = h(`<section class="a11y" id="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-h" hidden>
    <header class="a11y__head"><h2 id="a11y-h">Accessibility</h2>
      <button type="button" class="a11y__x" aria-label="Close accessibility settings">${icon('close')}</button></header>

    <div class="a11y__group">
      <h3 id="a11y-cvd">${icon('palette')} Colour vision</h3>
      <div class="a11y__modes" role="radiogroup" aria-labelledby="a11y-cvd">
        ${MODES.map(m => `<button type="button" class="a11y__mode" role="radio" data-mode="${m.id}" data-sound="none" title="${m.hint}">
          <span class="sw" aria-hidden="true"><i data-k="pink"></i><i data-k="yellow"></i><i data-k="hot"></i></span>${m.label}</button>`).join('')}
      </div>
      <div class="a11y__range">
        <input id="a11y-cvd-range" type="range" min="0" max="100" step="1" aria-label="Colour adjustment: original to colour-friendly">
        <div class="a11y__ends" aria-hidden="true"><span>Original</span><output data-out="cvd"></output><span>Colour-friendly</span></div>
      </div>
    </div>

    <div class="a11y__group">
      <h3>☀︎ Brightness</h3>
      <div class="a11y__range">
        <input id="a11y-bright" type="range" min="60" max="120" step="5" aria-label="Brightness">
        <div class="a11y__ends" aria-hidden="true"><span>Dimmer</span><output data-out="bright"></output><span>Brighter</span></div>
      </div>
    </div>

    <div class="a11y__group">
      <h3 id="a11y-text">Aa Text size</h3>
      <div class="a11y__steps" role="group" aria-labelledby="a11y-text">
        <button type="button" data-step="-10" aria-label="Smaller text">A−</button>
        <output data-out="text" aria-live="polite"></output>
        <button type="button" data-step="10" aria-label="Larger text">A+</button>
      </div>
    </div>

    <div class="a11y__group">
      ${toggleRow('readable', 'Readable font', 'Atkinson Hyperlegible, wider spacing')}
      ${toggleRow('contrast', 'High contrast', 'Bolder outlines, solid text backgrounds')}
      ${toggleRow('motion', 'Reduce motion', 'Skip animations and transitions')}
      ${toggleRow('sound', 'Sounds', 'Camera clicks, dial ticks and shutters')}
    </div>

    <button type="button" class="btn btn--sm a11y__reset">${icon('refresh')} Reset all</button>
  </section>`);
  root.append(btn, panel);

  const $ = s => panel.querySelector(s);
  const cvd = $('#a11y-cvd-range'), bright = $('#a11y-bright');
  const modeBtns = [...panel.querySelectorAll('.a11y__mode')];

  function render() {
    const { mode, amount } = store.get().colour, a = a11y();
    const m = MODES.find(x => x.id === mode);
    cvd.value = amount;
    cvd.setAttribute('aria-valuetext', amount === 0 ? 'Original palette' : `${amount}% adjusted for ${m.label}`);
    $('[data-out="cvd"]').textContent = amount + '%';
    const O = PALETTES.original, F = PALETTES[mode];
    cvd.style.setProperty('--track', `linear-gradient(90deg, ${O.pink}, ${O.yellow} 22%, ${O.hot} 38%, ${F.hot} 62%, ${F.yellow} 78%, ${F.pink})`);
    modeBtns.forEach(b => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
      b.querySelectorAll('i').forEach(i => { i.style.background = PALETTES[b.dataset.mode][i.dataset.k]; });
    });
    bright.value = a.brightness;
    bright.setAttribute('aria-valuetext', a.brightness + '%');
    $('[data-out="bright"]').textContent = a.brightness + '%';
    $('[data-out="text"]').textContent = a.textScale + '%';
    panel.querySelector('[data-step="-10"]').disabled = a.textScale <= 90;
    panel.querySelector('[data-step="10"]').disabled = a.textScale >= 150;
    panel.querySelectorAll('.a11y__switch').forEach(s => s.setAttribute('aria-checked', !!a[s.dataset.key]));
    btn.classList.toggle('is-custom', amount > 0 || JSON.stringify(a) !== JSON.stringify(A11Y_DEFAULTS));
  }

  // --- open / close ---
  const open = () => {
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); play('click');
    (panel.querySelector('.a11y__mode[aria-checked="true"]') || cvd).focus();
  };
  const close = (refocus = true) => {
    if (panel.hidden) return;
    panel.hidden = true; btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  };
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  $('.a11y__x').addEventListener('click', () => close());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, true);
  document.addEventListener('pointerdown', e => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(false); });
  addEventListener('routechange', () => close(false));

  // --- colour vision ---
  let raf = 0;
  cvd.addEventListener('input', () => {
    store.set(s => ({ colour: { ...s.colour, amount: +cvd.value } }));
    cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { applyTokens(); render(); });
    if (+cvd.value % 10 === 0) play('tick');
  });
  cvd.addEventListener('change', () => { const { mode, amount } = store.get().colour; announce(amount === 0 ? 'Original palette' : `Colours ${amount}% adjusted for ${MODES.find(m => m.id === mode).label}`); });
  const selectMode = (id, focus) => {
    store.set(s => ({ colour: { mode: id, amount: s.colour.amount === 0 ? 100 : s.colour.amount } }));
    applyTokens(); render(); play('tick');
    announce(`${MODES.find(x => x.id === id).label} palette, ${store.get().colour.amount}% strength`);
    if (focus) panel.querySelector(`[data-mode="${id}"]`).focus();
  };
  modeBtns.forEach(b => b.addEventListener('click', () => selectMode(b.dataset.mode)));
  $('.a11y__modes').addEventListener('keydown', e => {
    const i = MODES.findIndex(m => m.id === store.get().colour.mode);
    const n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (n) { e.preventDefault(); selectMode(MODES[(i + n + MODES.length) % MODES.length].id, true); }
  });

  // --- brightness / text / toggles ---
  bright.addEventListener('input', () => { setA11y({ brightness: +bright.value }); applyA11y(); render(); play('tick'); });
  panel.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
    const v = Math.min(150, Math.max(90, a11y().textScale + +b.dataset.step));
    setA11y({ textScale: v }); applyA11y(); render(); announce(`Text size ${v}%`);
  }));
  panel.querySelectorAll('.a11y__switch').forEach(s => s.addEventListener('click', () => {
    const k = s.dataset.key, v = !a11y()[k];
    setA11y({ [k]: v }); applyA11y(); render();
    if (k === 'sound' ? v : true) play('click');
    announce(`${s.closest('.a11y__row').querySelector('b').textContent} ${v ? 'on' : 'off'}`);
  }));
  $('.a11y__reset').addEventListener('click', () => {
    store.set(s => ({ colour: { ...s.colour, amount: 0 }, a11y: { ...A11Y_DEFAULTS } }));
    applyTokens(); applyA11y(); render(); announce('All accessibility settings reset');
  });

  applyTokens(); applyA11y(); render();
}
