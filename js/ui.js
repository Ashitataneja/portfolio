// Shared UI helpers & reusable components.
export const reducedMotion = () =>
  document.documentElement.classList.contains('reduce-motion') ||
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
export const img = (name, alt = '', extra = '') => `<img src="assets/img/${name}.jpg" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
export const wait = ms => new Promise(r => setTimeout(r, reducedMotion() ? 0 : ms));

/** Sticker-style display title. Layers share the same text so line wrapping matches. */
export function title(text, { tag = 'h1', cls = '', id = '' } = {}) {
  const t = esc(text).replace(/\n/g, '<br>');
  return `<${tag} class="title ${cls}" ${id ? `id="${id}"` : ''}>
    <span class="t-layer t-edge" aria-hidden="true">${t}</span>
    <span class="t-layer t-yellow" aria-hidden="true">${t}</span>
    <span class="t-layer t-shade" aria-hidden="true">${t}</span>
    <span class="t-main">${t}</span></${tag}>`;
}
export const logo = () => `<a class="logo" href="#/home" aria-label="AT — Ashita Taneja, home">AT</a>`;
export const deco = (cls, sym, style) => `<span class="deco ${cls}" style="${style}" aria-hidden="true"><svg><use href="#i-${sym}"/></svg></span>`;
export const stripes = (cls = 'stripes--bottom') => `<div class="stripes ${cls}" aria-hidden="true"></div>`;

let liveTimer;
export function announce(msg) {
  const el = document.getElementById('announcer');
  if (!el) return;
  el.textContent = '';
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { el.textContent = msg; }, 60);
}
export function toast(msg, ms = 2600) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = h(`<div class="toast" role="status">${esc(msg)}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ---------- Sound ---------- */
import { play } from './sound.js';
export function shutterSound() { play('shutter'); }

/* ---------- Aperture (SVG) — used by the intro lens and the case-study "next" button ---------- */
// Each blade is a large sheet whose inner edge is tangent to a circle of radius `d`; together they leave
// a small N-gon hole. The leading edge of every blade is curved, so the closed iris reads as a pinwheel
// (like a real lens) instead of straight spokes. Rotating slightly as it opens gives the iris swirl.
export function apertureSVG({ n = 6, size = 200, id = 'ap', glass = true } = {}) {
  const R = size / 2;
  return `<svg viewBox="${-R} ${-R} ${size} ${size}" class="aperture" data-n="${n}" data-r="${R}" aria-hidden="true">
    <defs>
      <clipPath id="${id}-clip"><circle r="${R * 0.99}"/></clipPath>
      <linearGradient id="${id}-blade" gradientUnits="userSpaceOnUse" x1="${-R * 0.25}" y1="${-R * 0.1}" x2="${R * 0.75}" y2="${-R * 0.55}"><stop offset="0" stop-color="#060708"/><stop offset=".5" stop-color="#15171b"/><stop offset="1" stop-color="#2e3138"/></linearGradient>
      <radialGradient id="${id}-glass" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="color-mix(in srgb, var(--c-bg) 55%, #fff)"/><stop offset=".55" stop-color="var(--c-bg)"/><stop offset="1" stop-color="var(--c-bg-deep)"/></radialGradient>
    </defs>
    <circle r="${R}" fill="${glass ? `url(#${id}-glass)` : 'transparent'}"/>
    <g clip-path="url(#${id}-clip)" class="blades">${Array.from({ length: n }, (_, i) =>
      `<g transform="rotate(${(360 / n) * i})"><path class="blade" fill="url(#${id}-blade)" stroke="#000" stroke-width="${R * 0.022}" stroke-linejoin="round"/></g>`).join('')}
    </g>
    <circle r="${R * 0.985}" fill="none" stroke="#050505" stroke-width="${R * 0.03}"/>
  </svg>`;
}
export function setAperture(svg, open) {
  const n = +svg.dataset.n, R = +svg.dataset.r;
  const d = Math.max(0.0001, open) * R;            // inradius of the hole
  const swirl = (1 - Math.min(open, 1)) * 24;      // degrees
  const x0 = -d * Math.tan(Math.PI / n) - R * 0.01, yb = -d, yt = -d - R * 2.4, w = R * 2.8;
  // curved seam from the hole corner out to the rim
  const dPath = `M${x0} ${yb} C${x0 - R * 0.42} ${yb - R * 0.35} ${x0 - R * 0.55} ${yb - R * 1.1} ${x0 - R * 0.2} ${yt} L${x0 + w} ${yt} L${x0 + w} ${yb} Z`;
  svg.querySelectorAll('.blade').forEach(p => {
    p.setAttribute('d', dPath);
    p.setAttribute('transform', `rotate(${swirl})`);
  });
}
/** Decorative curved arrow: solid white, no outline (used on every screen). */
export function curvedArrow({ viewBox, d, head, cls = '', width = 9 }) {
  return `<svg class="${cls} c-arrow" viewBox="${viewBox}" aria-hidden="true" focusable="false">
    <path d="${d}" fill="none" stroke="#fff" stroke-width="${width}" stroke-linecap="round"/>
    <path d="${head}" fill="#fff" stroke="#fff" stroke-width="${width * .45}" stroke-linejoin="round"/></svg>`;
}
export function animate(fromV, toV, ms, onFrame, ease = t => 1 - (1 - t) ** 3) {
  return new Promise(res => {
    if (reducedMotion() || ms <= 0) { onFrame(toV); return res(); }
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ms);
      onFrame(fromV + (toV - fromV) * ease(t));
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
}

/** Full-screen shutter: close then open the iris. */
export async function shutter({ sound = true } = {}) {
  if (sound) shutterSound();
  if (reducedMotion()) return;
  const wrap = h(`<div class="shutter">${apertureSVG({ n: 8, size: 400, id: 'sh' })}</div>`);
  const svg = wrap.querySelector('svg');
  svg.querySelector('circle').setAttribute('fill', 'transparent');
  document.body.appendChild(wrap);
  await animate(1.6, 0, 170, v => setAperture(svg, v));
  await wait(60);
  await animate(0, 1.6, 230, v => setAperture(svg, v));
  wrap.remove();
}

/* ---------- Rotary dial behaviour (shared by home, navigate and contact) ---------- */
// el: rotating element; count: options; onChange(index); returns API.
export function makeDial(el, { count, index = 0, onChange, onActivate, pointerAngle = 0 }) {
  const step = 360 / count;
  let rot = -index * step + pointerAngle, cur = index, down = false, dragging = false, startA = 0, startRot = 0, pid = null;
  const norm = i => ((i % count) + count) % count;
  const apply = (snap = true) => {
    el.style.transition = snap && !reducedMotion() ? '--rot .6s var(--ease-spring)' : 'none';
    el.style.setProperty('--rot', rot + 'deg');
  };
  function setIndex(i, { silent = false } = {}) {
    const target = norm(i);
    let delta = ((-target * step + pointerAngle) - rot) % 360;
    if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
    rot += delta; cur = target; apply(true);
    const n = Math.round(Math.abs(delta) / step);
    for (let k = 0; k < n; k++) setTimeout(() => play('tick'), k * 75);
    if (!silent) onChange?.(cur);
  }
  const center = () => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const angle = e => { const [cx, cy] = center(); return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI; };
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    down = true; dragging = false; pid = e.pointerId; startA = angle(e); startRot = rot;
  });
  el.addEventListener('pointermove', e => {
    if (!down) return;
    let d = angle(e) - startA; if (d > 180) d -= 360; if (d < -180) d += 360;
    if (!dragging && Math.abs(d) > 5) { dragging = true; el.setPointerCapture(pid); el.classList.add('is-dragging'); }
    if (!dragging) return;
    rot = startRot + d; apply(false);
    const live = norm(Math.round((pointerAngle - rot) / step));
    if (live !== cur) { cur = live; play('tick'); onChange?.(cur, true); }
  });
  const end = () => {
    if (!down) return;
    down = false;
    if (dragging) {
      dragging = false; el.classList.remove('is-dragging');
      setIndex(Math.round((pointerAngle - rot) / step));
      el.dataset.justDragged = '1'; setTimeout(() => delete el.dataset.justDragged, 60);
    }
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.style.touchAction = 'none';
  apply(false);
  return {
    get index() { return cur; },
    setIndex,
    next: () => setIndex(cur + 1), prev: () => setIndex(cur - 1),
    activate: () => onActivate?.(cur),
    wasDrag: () => !!el.dataset.justDragged,
  };
}

/** Clamp focus inside a dialog. Returns a release fn. */
export function trapFocus(container, onEscape) {
  const prev = document.activeElement;
  const sel = 'button, [href], input, [tabindex]:not([tabindex="-1"])';
  const key = e => {
    if (e.key === 'Escape') { e.preventDefault(); onEscape?.(); }
    if (e.key !== 'Tab') return;
    const f = [...container.querySelectorAll(sel)].filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  };
  document.addEventListener('keydown', key);
  return () => { document.removeEventListener('keydown', key); prev?.focus?.(); };
}

export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
export function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
