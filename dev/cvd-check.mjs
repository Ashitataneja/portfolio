// Validates palettes: simulated CVD distinctness (CIEDE76 in Lab) + WCAG contrast.
const M={ // Machado et al. 2009, severity 1.0 (linear RGB)
 protan:[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
 deutan:[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
 tritan:[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
 none:[[1,0,0],[0,1,0],[0,0,1]]};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const lin=c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
const sim=(h,t)=>{const l=hex(h).map(lin);return M[t].map(r=>Math.min(1,Math.max(0,r[0]*l[0]+r[1]*l[1]+r[2]*l[2])));};
const lab=l=>{const X=(0.4124*l[0]+0.3576*l[1]+0.1805*l[2])/0.95047,Y=0.2126*l[0]+0.7152*l[1]+0.0722*l[2],Z=(0.0193*l[0]+0.1192*l[1]+0.9505*l[2])/1.08883;
 const f=v=>v>0.008856?Math.cbrt(v):7.787*v+16/116;return[116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z))];};
const dE=(a,b,t)=>{const A=lab(sim(a,t)),B=lab(sim(b,t));return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
const L=h=>{const l=hex(h).map(lin);return 0.2126*l[0]+0.7152*l[1]+0.0722*l[2];};
const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
const LS=(h,t)=>{const l=sim(h,t);return 0.2126*l[0]+0.7152*l[1]+0.0722*l[2];};
const crS=(a,b,t)=>{const x=LS(a,t),y=LS(b,t);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
export function check(name,p,t){
  const pairs=[['bg','pink',44],['bg','yellow',44],['bg','hot',44],['pink','yellow',+(process.env.PY||45)],['pink','hot',44],['yellow','hot',44],['cream','yellow',+(process.env.CY||28)],['cream','pink',32],['cream','hot',32]];
  const contrast=[['ink','cream',7],['ink','yellow',7],['ink','pink',6.9],['ink','hot',5.45],['onBg','bg',4.5],['ink','paper',7]];
  let ok=true,out=[],short=0;
  for(const[a,b,m]of pairs){const d=dE(p[a],p[b],t);out.push(`${a}/${b}:${d.toFixed(0)}`);if(d<m){ok=false;short+=(m-d);}}
  for(const[a,b,m]of contrast){const c=Math.min(cr(p[a],p[b]),crS(p[a],p[b],t));out.push(`${a}on${b}:${c.toFixed(1)}`);if(c<m){ok=false;short+=(m-c)*12;}}
  console.log((ok?'PASS ':'FAIL ')+name+' ['+t+'] '+out.join(' '));
  check.short=short;return ok;
}
