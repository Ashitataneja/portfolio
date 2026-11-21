// Screens 01–03: aperture opens → zoom through the lens → instant camera prints the first photo.
import { h, title, deco, apertureSVG, setAperture, animate, wait, reducedMotion, shutterSound, announce } from '../ui.js';
import { store } from '../state.js';
import { play } from '../sound.js';

export const cameraSVG = () => `
<svg class="ic-camera" viewBox="0 0 640 470" aria-hidden="true">
  <g stroke="var(--c-ink)" stroke-width="7" stroke-linejoin="round">
    <rect x="170" y="14" width="300" height="96" rx="26" fill="var(--c-yellow)"/>
    <rect x="58" y="78" width="524" height="244" rx="44" fill="var(--c-pink)"/>
    <rect x="94" y="120" width="54" height="20" rx="10" fill="var(--c-paper)" stroke-width="5"/>
    <circle cx="146" cy="236" r="40" fill="var(--c-hot)"/>
    <path d="M128 222a22 22 0 0 1 22-10" stroke="var(--c-paper)" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/>
    <rect x="446" y="106" width="96" height="76" rx="16" fill="var(--c-ink)"/>
    <rect x="462" y="120" width="64" height="48" rx="6" fill="#cfcfcf" stroke="none"/>
    <circle cx="320" cy="200" r="112" fill="var(--c-yellow)"/>
    <circle cx="320" cy="200" r="76" fill="var(--c-ink)"/>
    <circle cx="320" cy="200" r="58" fill="#1e1f24" stroke="#333" stroke-width="3"/>
    <circle cx="298" cy="172" r="13" fill="#fff" stroke="none"/>
    <circle cx="282" cy="196" r="5" fill="#fff" stroke="none"/>
    <path d="M362 238a54 54 0 0 1-30 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    <rect x="34" y="296" width="572" height="64" rx="30" fill="var(--c-yellow)"/>
  </g>
</svg>`;
export const cameraFrontSVG = () => `
<svg class="ic-camera-front" viewBox="0 0 640 140" aria-hidden="true">
  <path d="M40 8h560a30 30 0 0 1 30 30v42a42 42 0 0 1-42 42H52a42 42 0 0 1-42-42V38A30 30 0 0 1 40 8z" fill="var(--c-hot)" stroke="var(--c-ink)" stroke-width="7"/>
  <rect x="104" y="34" width="432" height="38" rx="16" fill="var(--c-ink)"/>
</svg>`;

export async function render() {
  const el = h(`<section class="screen intro" aria-labelledby="intro-h">
    <h1 id="intro-h" class="sr-only">Ashita Taneja — portfolio intro</h1>
    <div class="intro__white">
      <div class="lens" aria-hidden="true">
        <div class="lens__ring">${apertureSVG({ n: 6, size: 200, id: 'intro', glass: true })}<span class="lens__glare"><svg viewBox="0 0 100 100"><path d="M64 12C42 16 26 32 20 54" fill="none" stroke="#fff" stroke-width="8.5" stroke-linecap="round"/><circle cx="12" cy="74" r="6" fill="#fff"/></svg></span></div>
      </div>
    </div>
    <div class="intro__capture bg-grid" hidden>
      <div class="stripes stripes--top-l" aria-hidden="true"></div>
      <div class="stripes stripes--br" aria-hidden="true"></div>
      <div class="fc-title">${title('The\nFirst\nCapture', { tag: 'h2', cls: 'tilt-l' })}</div>
      ${deco('burst burst--w', 'burst', 'left:29%;top:13%;width:clamp(40px,4vw,70px);transform:rotate(-20deg)')}
      ${deco('burst', 'burst', 'left:64%;top:5%;transform:rotate(-30deg)')}
      ${deco('burst', 'burst', 'left:67%;top:71%;width:clamp(36px,3.6vw,60px);transform:rotate(40deg)')}
      ${deco('sparkle twinkle', 'sparkle', 'right:13%;top:12%')}
      ${deco('sparkle twinkle', 'sparkle', 'left:21%;top:79%')}
      <span class="fc-badge" aria-hidden="true"><svg><use href="#i-camera"/></svg></span>
      <div class="fc-camera">
        ${cameraSVG()}
        <div class="fc-slot">
          <button class="fc-photo" type="button" data-sound="none" aria-label="Take the photograph and step into my design world" disabled>
            <span class="fc-photo__inner"></span>
          </button>
        </div>
        ${cameraFrontSVG()}
      </div>
      <p class="note fc-tip tilt-r">Click the photo<br>to step into my<br>design world!</p>
      ${deco('deco-cursor deco-cursor--w fc-cursor', 'cursor', '')}
    </div>
    <button class="btn btn--sm intro__skip" type="button">Skip intro ${'<svg aria-hidden="true"><use href="#i-arrow-r"/></svg>'}</button>
  </section>`);

  const white = el.querySelector('.intro__white');
  const lens = el.querySelector('.lens');
  const svg = el.querySelector('.aperture');
  const capture = el.querySelector('.intro__capture');
  const photo = el.querySelector('.fc-photo');
  let cancelled = false;

  setAperture(svg, 0.015);

  async function showCapture() {
    white.hidden = true;
    capture.hidden = false;
    capture.classList.add('is-in');
    await wait(500);
    if (cancelled) return;
    // Print: the blank photograph emerges from the slot
    photo.classList.add('is-printing');
    play('shutter'); setTimeout(() => play('print', 1.45), 120);
    await wait(reducedMotion() ? 0 : 1500);
    photo.disabled = false;
    photo.classList.add('is-ready');
    announce('A photograph has printed. Activate it to enter the portfolio.');
    photo.focus({ preventScroll: true, focusVisible: false });
  }

  // (named runIntro: it used to be called `play`, which hid the sound function and restarted the intro)
  async function runIntro() {
    await wait(650);
    // 01 — aperture blades open
    play('iris', 1.3);
    await animate(0.015, 0.34, 1300, v => setAperture(svg, v), t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    if (cancelled) return;
    // 02 — zoom through the aperture
    lens.classList.add('is-zooming'); play('whoosh');
    await animate(0.34, 1.25, 1250, v => setAperture(svg, v));
    if (cancelled) return;
    white.classList.add('is-through');
    await wait(320);
    if (!cancelled) showCapture();
  }

  photo.addEventListener('click', async () => {
    if (photo.disabled) return;
    photo.disabled = true;
    play('shutter');
    store.set({ introSeen: true });
    // Slide fully out, then expand into the homepage
    photo.classList.add('is-out');
    await wait(520);
    const r = photo.getBoundingClientRect();
    const fly = h(`<div class="fc-fly" aria-hidden="true"><span></span></div>`);
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.appendChild(fly);
    photo.style.visibility = 'hidden';
    if (!reducedMotion()) {
      await fly.animate([
        { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: 'rotate(0deg)' },
        { left: '0px', top: '0px', width: innerWidth + 'px', height: innerHeight + 'px', transform: 'rotate(0deg)' },
      ], { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).finished;
    }
    location.hash = '#/home';
    setTimeout(() => { fly.classList.add('is-gone'); setTimeout(() => fly.remove(), 500); }, 80);
  });

  el.querySelector('.intro__skip').addEventListener('click', () => {
    cancelled = true;
    store.set({ introSeen: true });
    location.hash = '#/home';
  });

  return {
    el, title: 'Welcome', noEnter: true, skipVT: true,
    mounted() { reducedMotion() ? showCapture() : runIntro(); },
    destroy() { cancelled = true; },
  };
}
