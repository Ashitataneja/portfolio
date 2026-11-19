import {check} from './cvd-check.mjs';
import {PALETTES} from '../js/palettes.js';
// tolerance of 1 unit for rounding at thresholds
for(const [mode,sim] of [['protanopia','protan'],['deuteranopia','deutan'],['tritanopia','tritan']]){
  if(sim==='tritan'){process.env.PY=35;process.env.CY=23;} else {process.env.PY=44;process.env.CY=27;}
  console.log('--',mode); check('original seen with '+sim, PALETTES.original, sim); check('friendly palette', PALETTES[mode], sim);
}
