// Colour tokens.
// ORIGINAL = colours sampled directly from the supplied screen designs.
// The colour-friendly targets are the *smallest* adjustments to the original accents that make
// every pair distinguishable for that colour-vision type (found with tools/optimise.mjs,
// verified by tools/run-check.mjs using Machado 2009 simulation + WCAG contrast on simulated colours).
// Background, grid, cream surfaces and ink are intentionally never changed.
// The accessibility slider blends ORIGINAL → target, so 0% is always exactly the design.
const BASE = {
  bg: '#1B33ED', grid: '#4A66FF', ink: '#111111', onBg: '#FFFFFF',
  cream: '#F9F3E8', paper: '#FFFFFF',
};
export const PALETTES = {
  original:     { ...BASE, pink: '#F996D8', yellow: '#FADF05', hot: '#F04A12' },
  // red-blind: the red-orange reads too dark for black labels and too close to yellow → brighter orange
  protanopia:   { ...BASE, pink: '#F996D8', yellow: '#FDE10D', hot: '#FF742F' },
  // green-blind: separate yellow and red-orange a touch further, cooler pink
  deuteranopia: { ...BASE, pink: '#EE90D5', yellow: '#FFEE00', hot: '#F25537' },
  // blue-yellow-blind: pink and yellow merge → pink moves toward orchid, yellow kept
  tritanopia:   { ...BASE, pink: '#E46FEC', yellow: '#ECD500', hot: '#E86200' },
};
export const MODES = [
  { id: 'protanopia', label: 'Protanopia', short: 'Protan', hint: 'red-blind' },
  { id: 'deuteranopia', label: 'Deuteranopia', short: 'Deutan', hint: 'green-blind' },
  { id: 'tritanopia', label: 'Tritanopia', short: 'Tritan', hint: 'blue–yellow' },
];
export const TOKENS = ['bg', 'grid', 'ink', 'onBg', 'cream', 'paper', 'pink', 'yellow', 'hot'];
