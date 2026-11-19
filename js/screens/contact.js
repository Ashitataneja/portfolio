// Screen 18 — Contact: rotary dial moves a pointer; the camera's screen shows the matching action.
import { h, title, deco, icon, esc, logo, announce, reducedMotion } from '../ui.js';
import { play } from '../sound.js';
import { CONTACT } from '../content.js';
import { store } from '../state.js';
import { resumeInfo } from '../resume.js';

const OPTS = [ // clockwise from top
  { id: 'email', label: 'Email', icon: 'mail', head: 'Email Me', line: CONTACT.email, cta: 'Send an Email', href: () => `mailto:${CONTACT.email}` },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', head: 'Find me on LinkedIn', line: 'Let’s connect professionally.', cta: 'Open LinkedIn', href: () => CONTACT.linkedin || CONTACT.linkedinFallback, ext: true },
  { id: 'hello', label: 'Say Hello', icon: 'chat', head: 'Say Hello!', line: 'Got an idea, a question or just want to chat?', cta: 'Say Hello', href: () => `mailto:${CONTACT.email}?subject=${encodeURIComponent('Hello Ashita!')}` },
  { id: 'resume', label: 'Resume', icon: 'doc', head: 'My Resume', line: 'Education, experience and skills in one place.', cta: 'Download Resume', resume: true },
];
const P = (r, a) => [50 + r * Math.sin(a * Math.PI / 180), 50 - r * Math.cos(a * Math.PI / 180)];
const quad = i => { const a0 = i * 90 - 45, a1 = i * 90 + 45, [x0, y0] = P(46, a0), [x1, y1] = P(46, a1), [x2, y2] = P(18, a1), [x3, y3] = P(18, a0); return `M${x0} ${y0}A46 46 0 0 1 ${x1} ${y1}L${x2} ${y2}A18 18 0 0 0 ${x3} ${y3}Z`; };

export async function render() {
  let i = store.get().contactIndex || 0;
  const el = h(`<section class="screen contact bg-grid" aria-labelledby="ct-h">
    ${logo()}
    <header class="contact__head">
      ${title('Contact', { id: 'ct-h', cls: 'tilt-l' })}
      <p class="tag contact__tag">Let’s connect!</p>
    </header>
    ${deco('burst', 'burst', 'left:52%;top:2%;transform:rotate(-10deg)')}
    <p class="note contact__tip tilt-r">Choose an option<br>from the dial!</p>
    <div class="cdial">
      <svg class="cdial__arrows" viewBox="0 0 100 100" aria-hidden="true"><path d="M8 26a50 50 0 0 1 16-16M76 92a50 50 0 0 0 16-16" fill="none" stroke="var(--c-paper)" stroke-width="2.2" stroke-linecap="round"/><path d="M5 22l3 6 5-3M88 78l4-4 1 6M21 7l5 1-2 5M78 95l-5-1 2-5" fill="none" stroke="var(--c-paper)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div class="cdial__face" role="radiogroup" aria-label="Contact options — use arrow keys or drag to turn the dial">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="49" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="1.6"/>
          <circle cx="50" cy="50" r="46.5" fill="var(--c-ink)"/>
          ${OPTS.map((o, k) => `<path class="cdial__seg" data-k="${k}" d="${quad(k)}" fill="var(--c-${k % 2 ? 'cream' : 'pink'})" stroke="var(--c-ink)" stroke-width="1.2"/>`).join('')}
          <circle cx="50" cy="50" r="16" fill="var(--c-yellow)" stroke="var(--c-ink)" stroke-width="1.6"/>
        </svg>
        ${OPTS.map((o, k) => { const [x, y] = P(32, k * 90); return `<button class="cdial__opt" role="radio" type="button" data-sound="none" data-k="${k}" style="left:${x}%;top:${y}%">${icon(o.icon)}<b>${esc(o.label)}</b></button>`; }).join('')}
      </div>
      <div class="cdial__ring" aria-hidden="true"><span class="cdial__pointer"></span></div>
    </div>
    ${deco('burst', 'burst', 'left:37%;top:46%;transform:rotate(-20deg)')}
    <div class="ccam">
      <svg class="ccam__body" viewBox="0 0 860 560" aria-hidden="true"><g stroke="var(--c-ink)" stroke-width="8" stroke-linejoin="round">
        <rect x="290" y="14" width="250" height="70" rx="20" fill="var(--c-hot)"/>
        <rect x="690" y="20" width="110" height="60" rx="14" fill="var(--c-pink)"/>
        <rect x="610" y="60" width="200" height="40" rx="14" fill="var(--c-cream)"/>
        <rect x="806" y="230" width="48" height="230" rx="20" fill="var(--c-yellow)"/>
        <rect x="14" y="70" width="820" height="470" rx="70" fill="var(--c-cream)"/>
        <path d="M14 230V140a70 70 0 0 1 70-70h680a70 70 0 0 1 70 70v90z" fill="var(--c-hot)"/>
        <path d="M14 440v30a70 70 0 0 0 70 70h680a70 70 0 0 0 70-70v-30z" fill="var(--c-hot)"/>
        <rect x="64" y="110" width="140" height="100" rx="14" fill="var(--c-cream)"/>
        <rect x="84" y="126" width="100" height="68" rx="8" fill="var(--c-ink)"/>
        <circle cx="140" cy="320" r="50" fill="var(--c-yellow)"/>
      </g><path d="M98 140h30v24h-30z" fill="#fff" opacity=".85"/></svg>
      <div class="ccam__screen" aria-live="polite"></div>
      <span class="ccam__flash" aria-hidden="true"></span>
      ${deco('burst', 'burst', 'right:-6%;top:-4%;transform:rotate(15deg)')}
    </div>
    <div class="stripes stripes--bottom" aria-hidden="true"></div>
  </section>`);

  const face = el.querySelector('.cdial__face');
  const ring = el.querySelector('.cdial__ring');
  const opts = [...el.querySelectorAll('.cdial__opt')];
  const screen = el.querySelector('.ccam__screen');
  const flash = el.querySelector('.ccam__flash');
  let ringRot = i * 90;

  async function paintScreen() {
    const o = OPTS[i];
    let href = o.href?.(), label = o.cta, dl = '', ext = o.ext ? ' target="_blank" rel="noopener"' : '';
    if (o.resume) { const r = await resumeInfo(); href = r.href; label = r.label; dl = r.download ? ` download="${r.download}"` : ''; }
    screen.innerHTML = `<div class="ccam__content" data-k="${i}">
      ${icon(o.icon, 'ccam__icon')}
      <h2>${esc(o.head)}</h2>
      <p class="${o.id === 'email' ? 'ccam__email' : ''}">${esc(o.line)}</p>
      <a class="btn btn--case ccam__cta" data-sound="shutter" href="${esc(href)}"${dl}${ext}>${esc(label)} ${icon('arrow-r')}${o.ext ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>
    </div>`;
  }
  function select(n, { sound = true, focus = false } = {}) {
    const prev = i;
    i = (n + OPTS.length) % OPTS.length;
    let d = (i * 90 - ringRot) % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
    ringRot += d;
    for (let k = 0; k < Math.round(Math.abs(d) / 90); k++) setTimeout(() => play('tick'), k * 80);
    ring.style.transition = reducedMotion() ? 'none' : '';
    ring.style.transform = `rotate(${ringRot}deg)`;
    opts.forEach((b, k) => { b.setAttribute('aria-checked', k === i); b.tabIndex = k === i ? 0 : -1; b.classList.toggle('is-on', k === i); });
    el.querySelectorAll('.cdial__seg').forEach((s, k) => s.setAttribute('stroke-width', k === i ? 3 : 1.2));
    store.set({ contactIndex: i });
    if (prev !== i || !screen.innerHTML) {
      if (sound && prev !== i) setTimeout(() => play('charge'), 120);
      flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on');
      paintScreen();
      if (prev !== i) announce(`${OPTS[i].label}: ${OPTS[i].head}`);
    }
    if (focus) opts[i].focus();
  }
  opts.forEach((b, k) => b.addEventListener('click', () => { if (!dragged) select(k); }));
  face.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); select(i + 1, { focus: true }); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); select(i - 1, { focus: true }); }
  });
  // Drag / rotate: the pointer follows the drag angle and snaps to the nearest option
  let dragging = false, dragged = false;
  const angleOf = e => { const r = face.getBoundingClientRect(); const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; return (a + 360) % 360; };
  face.addEventListener('pointerdown', e => { dragging = true; dragged = false; face.dataset.sa = angleOf(e); });
  face.addEventListener('pointermove', e => {
    if (!dragging) return;
    const a = angleOf(e);
    if (!dragged && Math.abs(a - face.dataset.sa) > 8) { dragged = true; face.setPointerCapture(e.pointerId); }
    if (!dragged) return;
    let d = (a - ringRot) % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
    ringRot += d; ring.style.transition = 'none'; ring.style.transform = `rotate(${ringRot}deg)`;
    const k = Math.round(((ringRot % 360) + 360) % 360 / 90) % 4;
    if (k !== i) { i = k; play('tick'); paintScreen(); opts.forEach((b, j) => b.classList.toggle('is-on', j === k)); }
  });
  const end = () => { if (!dragging) return; dragging = false; if (dragged) { ring.style.transition = ''; const k = i; i = -1; select(k); setTimeout(() => (dragged = false), 0); } };
  face.addEventListener('pointerup', end); face.addEventListener('pointercancel', end);
  face.style.touchAction = 'none';

  select(i, { sound: false });
  return { el, title: 'Contact' };
}
