// Global colour-vision control. One instance, mounted once, persists across every screen.
// Writes CSS custom properties (tokens) on :root — no filters are applied to the page.
import { PALETTES, MODES, TOKENS } from './palettes.js';
import { store } from './state.js';
import { announce } from './ui.js';

const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = r => '#' + r.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
// Blend in linear-light space so mid-slider colours stay clean.
const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = c => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function mix(a, b, t) {
  const A = hexToRgb(a).map(toLin), B = hexToRgb(b).map(toLin);
  return rgbToHex(A.map((v, i) => toSrgb(v + (B[i] - v) * t)));
}
const cssName = k => '--c-' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

export function currentTokens() {
  const { mode, amount } = store.get().colour;
  const from = PALETTES.original, to = PALETTES[mode] || from, t = amount / 100;
  const out = {};
  for (const k of TOKENS) out[k] = mix(from[k], to[k], t);
  return out;
}

export function applyTokens() {
  const tok = currentTokens();
  const root = document.documentElement.style;
  for (const k of TOKENS) root.setProperty(cssName(k), tok[k]);
  const { mode, amount } = store.get().colour;
  document.documentElement.dataset.cvd = amount > 0 ? mode : 'original';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tok.bg);
  window.dispatchEvent(new CustomEvent('tokens-changed', { detail: tok }));
}

export function mountColourBar(root) {
  const bar = document.createElement('section');
  bar.className = 'cbar is-collapsed';
  bar.setAttribute('aria-label', 'Colour vision settings');
  bar.innerHTML = `
    <div class="cbar__label" id="cbar-title"><svg aria-hidden="true"><use href="#i-palette"/></svg><span class="txt">Colour vision</span></div>
    <button type="button" class="cbar__toggle" aria-expanded="false" aria-controls="cbar-modes"><span class="cur"></span> ▾</button>
    <div class="cbar__modes" id="cbar-modes" role="radiogroup" aria-label="Colour vision type">
      ${MODES.map(m => `
        <button type="button" class="cbar__mode" role="radio" data-mode="${m.id}" aria-checked="false" title="${m.label} (${m.hint})">
          <span class="sw" aria-hidden="true"><i data-k="pink"></i><i data-k="yellow"></i><i data-k="hot"></i></span>
          <span class="long">${m.label}</span><span class="short">${m.short}</span>
        </button>`).join('')}
    </div>
    <div class="cbar__slider">
      <label for="cbar-range">Original</label>
      <input id="cbar-range" class="cbar__range" type="range" min="0" max="100" step="1"
        aria-describedby="cbar-title" aria-valuetext="">
      <label for="cbar-range">Colour-friendly</label>
      <output class="cbar__val" for="cbar-range" aria-hidden="true"></output>
    </div>
    <button type="button" class="cbar__reset" title="Return to the original palette"><svg aria-hidden="true"><use href="#i-refresh"/></svg>Reset</button>`;
  root.appendChild(bar);

  const range = bar.querySelector('.cbar__range');
  const val = bar.querySelector('.cbar__val');
  const toggle = bar.querySelector('.cbar__toggle');
  const modeBtns = [...bar.querySelectorAll('.cbar__mode')];

  function render() {
    const { mode, amount } = store.get().colour;
    const m = MODES.find(x => x.id === mode);
    range.value = amount;
    val.textContent = amount + '%';
    range.setAttribute('aria-valuetext', amount === 0 ? 'Original palette' : `${amount}% adjusted for ${m.label}`);
    toggle.querySelector('.cur').textContent = m.short;
    modeBtns.forEach(b => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
      const P = PALETTES[b.dataset.mode];
      b.querySelectorAll('i').forEach(i => { i.style.background = P[i.dataset.k]; });
    });
    // Track previews where the slider leads: original accents → friendly accents
    const O = PALETTES.original, F = PALETTES[mode];
    bar.style.setProperty('--cbar-track',
      `linear-gradient(90deg, ${O.pink}, ${O.yellow} 22%, ${O.hot} 38%, ${F.hot} 62%, ${F.yellow} 78%, ${F.pink})`);
  }

  let raf = 0;
  range.addEventListener('input', () => {
    const amount = +range.value;
    store.set(s => ({ colour: { ...s.colour, amount } }), 'local');
    val.textContent = amount + '%';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { applyTokens(); render(); });
  });
  range.addEventListener('change', () => {
    const { mode, amount } = store.get().colour;
    announce(amount === 0 ? 'Original palette' : `Colours ${amount}% adjusted for ${MODES.find(m => m.id === mode).label}`);
  });

  function selectMode(id, focus) {
    store.set(s => ({ colour: { mode: id, amount: s.colour.amount === 0 ? 100 : s.colour.amount } }), 'local');
    applyTokens(); render();
    const m = MODES.find(x => x.id === id);
    announce(`${m.label} palette, ${store.get().colour.amount}% strength`);
    if (focus) bar.querySelector(`[data-mode="${id}"]`).focus();
  }
  modeBtns.forEach(b => b.addEventListener('click', () => selectMode(b.dataset.mode)));
  bar.querySelector('.cbar__modes').addEventListener('keydown', e => {
    const i = MODES.findIndex(m => m.id === store.get().colour.mode);
    let n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % MODES.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + MODES.length) % MODES.length;
    if (n !== null) { e.preventDefault(); selectMode(MODES[n].id, true); }
  });
  bar.querySelector('.cbar__reset').addEventListener('click', () => {
    store.set(s => ({ colour: { ...s.colour, amount: 0 } }), 'local');
    applyTokens(); render(); announce('Original palette restored');
  });
  toggle.addEventListener('click', () => {
    const open = bar.classList.toggle('is-collapsed') === false;
    toggle.setAttribute('aria-expanded', open);
  });

  render();
  applyTokens();
}
