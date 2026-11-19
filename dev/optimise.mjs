// For each CVD type: find the palette closest to the ORIGINAL (in Lab, perceived by normal vision)
// that passes all distinctness + contrast checks when simulated for that deficiency.
import {check} from './cvd-check.mjs';
const O={bg:'#1B33ED',grid:'#4A66FF',ink:'#111111',onBg:'#FFFFFF',cream:'#F9F3E8',paper:'#FFFFFF',pink:'#F996D8',yellow:'#FADF05',hot:'#F04A12'};
const keys=['pink','yellow','hot'];
const h2r=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const r2h=r=>'#'+r.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const lin=c=>(c/=255)<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
const lab=h=>{const l=h2r(h).map(lin);const X=(0.4124*l[0]+0.3576*l[1]+0.1805*l[2])/0.95047,Y=0.2126*l[0]+0.7152*l[1]+0.0722*l[2],Z=(0.0193*l[0]+0.1192*l[1]+0.9505*l[2])/1.08883;const f=v=>v>0.008856?Math.cbrt(v):7.787*v+16/116;return[116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z))];};
const dist=(a,b)=>{const A=lab(a),B=lab(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
const W={pink:1,yellow:4,hot:1};const cost=p=>keys.reduce((s,k)=>s+W[k]*dist(p[k],O[k])**2,0);
const quiet=f=>{const l=console.log;console.log=()=>{};try{return f();}finally{console.log=l;}};
const res={};
for(const t of ['protan','deutan','tritan']){
  let best=null,bc=1e9; let seed=1;
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let run=0;run<24;run++){
    let p={...O};
    for(let it=0;it<2500;it++){
      const q={...p};const k=keys[Math.floor(rnd()*keys.length)];
      const step=it<1200?40:12;
      q[k]=r2h(h2r(q[k]).map(v=>v+(rnd()-.5)*step));
      const pen=x=>{quiet(()=>check('',x,t));return check.short;};
      const cq=cost(q)+pen(q)**2*40, cp=cost(p)+pen(p)**2*40;
      if(cq<=cp) p=q;
    }
    quiet(()=>check('',p,t)); const sc=cost(p)+check.short**2*40; if(sc<bc){bc=sc;best=p;}
  }
  if(!best){console.log(t,'no feasible');continue;} res[t]=best; console.log(t,'cost',bc.toFixed(0),keys.map(k=>k+':'+best[k]+' (ΔE '+dist(best[k],O[k]).toFixed(0)+')').join(' '));
  check('final',best,t);
}
