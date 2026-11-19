// Camera-flavoured sound effects, synthesised with Web Audio (no audio files).
// Respects the visitor's Sound setting (Accessibility panel). Audio unlocks on the first gesture.
import { store } from './state.js';

let ctx = null, master = null;
const enabled = () => store.get().a11y?.sound !== false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// unlock on first interaction (autoplay policy)
['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, () => ac(), { once: true, passive: true }));

const noiseBuf = (() => { let b = null; return c => { if (b) return b; b = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }; })();

/** short filtered noise burst */
function burst(t, { dur = 0.03, freq = 3000, q = 1, type = 'bandpass', gain = 0.5, decay = 60 } = {}) {
  const c = ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = noiseBuf(c); f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur + 3 / decay);
  src.connect(f).connect(g).connect(master); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.2);
}
/** pitched thunk / beep */
function tone(t, { freq = 120, to = null, dur = 0.06, type = 'sine', gain = 0.4 } = {}) {
  const c = ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
}

const S = {
  // SLR-style shutter: mirror slap + curtain, then the second curtain closing
  shutter() { const t = ctx.currentTime;
    burst(t, { dur: 0.012, freq: 4200, q: 0.8, gain: 0.9 }); tone(t, { freq: 160, to: 60, dur: 0.07, gain: 0.5 });
    burst(t + 0.065, { dur: 0.02, freq: 2600, q: 1.2, gain: 0.7 }); tone(t + 0.065, { freq: 110, to: 50, dur: 0.08, gain: 0.35 }); },
  // single detent of a rotating dial / lens ring
  tick() { const t = ctx.currentTime; burst(t, { dur: 0.006, freq: 5200, q: 4, gain: 0.45, decay: 120 }); tone(t, { freq: 1800, dur: 0.015, type: 'triangle', gain: 0.06 }); },
  // soft camera-button press
  click() { const t = ctx.currentTime; burst(t, { dur: 0.008, freq: 3200, q: 2, gain: 0.35, decay: 90 }); tone(t, { freq: 320, to: 180, dur: 0.03, gain: 0.12 }); },
  // film advance lever: a quick run of ratchet clicks
  wind() { const t = ctx.currentTime; for (let k = 0; k < 7; k++) burst(t + k * 0.028, { dur: 0.005, freq: 4400 - k * 120, q: 5, gain: 0.32, decay: 140 });
    burst(t + 0.22, { dur: 0.012, freq: 2400, q: 2, gain: 0.4 }); },
  // instant-camera print motor
  print(dur = 1.4) { const c = ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 92; f.type = 'lowpass'; f.frequency.value = 700;
    lfo.frequency.value = 24; lg.gain.value = 10; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.08); g.gain.setValueAtTime(0.16, t + dur - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(master); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    burst(t + dur - 0.05, { dur: 0.01, freq: 2000, gain: 0.4 }); },
  // autofocus confirmation beep (double)
  focus() { const t = ctx.currentTime; tone(t, { freq: 2350, dur: 0.06, type: 'square', gain: 0.05 }); tone(t + 0.09, { freq: 2350, dur: 0.06, type: 'square', gain: 0.05 }); },
  // flash capacitor charging whine
  charge() { const t = ctx.currentTime; tone(t, { freq: 900, to: 4200, dur: 0.45, type: 'sine', gain: 0.04 }); },
  // aperture iris / lens zoom motor
  iris(dur = 1.2) { const c = ctx, t = c.currentTime, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noiseBuf(c); src.loop = true; f.type = 'bandpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(2600, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master); src.start(t); src.stop(t + dur + 0.05); },
  // paper page / book cover swoosh
  page() { const c = ctx, t = c.currentTime, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noiseBuf(c); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3800, t + 0.28);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    src.connect(f).connect(g).connect(master); src.start(t); src.stop(t + 0.4); },
  // whoosh (flying photo, zoom)
  whoosh() { const c = ctx, t = c.currentTime, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noiseBuf(c); f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.25); f.frequency.exponentialRampToValueAtTime(500, t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(f).connect(g).connect(master); src.start(t); src.stop(t + 0.6); },
  // clothes-peg spring snap
  snap() { const t = ctx.currentTime; burst(t, { dur: 0.01, freq: 5800, q: 3, gain: 0.6, decay: 120 }); tone(t, { freq: 900, to: 300, dur: 0.05, type: 'triangle', gain: 0.15 }); },
  // scratching a coin over a card
  scratch() { const t = ctx.currentTime; burst(t, { dur: 0.04, freq: 2400 + Math.random() * 1600, q: 1.4, gain: 0.12, decay: 50 }); },
  // little success chime (all tiles revealed / postcard saved)
  chime() { const t = ctx.currentTime; [1318, 1568, 2093].forEach((f, k) => tone(t + k * 0.09, { freq: f, dur: 0.28, type: 'triangle', gain: 0.08 })); },
};

let lastScratch = 0;
export function play(name, ...args) {
  if (!enabled() || !S[name]) return;
  if (!ac()) return;
  if (name === 'scratch') { const n = performance.now(); if (n - lastScratch < 55) return; lastScratch = n; }
  try { S[name](...args); } catch { /* ignore */ }
}

// Generic UI clicks: every button/link gets a camera-button click unless it declares its own sound.
addEventListener('click', e => {
  const t = e.target.closest('button, a, [role="button"]');
  if (!t || t.closest('[data-sound="none"]') || t.dataset.sound) {
    if (t?.dataset.sound && t.dataset.sound !== 'none') play(t.dataset.sound);
    return;
  }
  play('click');
}, true);
