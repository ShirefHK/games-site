// Light -> dark board colour flip, shared by reskin-dark.js and reskin-literals.js
// ---- colour maths
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};
  if(!s)return[l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]}
function flip(r,g,b){
  const[h,s,l]=rgb2hsl(r,g,b);const c=(Math.max(r,g,b)-Math.min(r,g,b))/255;
  const lum=(.2126*r+.7152*g+.0722*b)/255;
  if(c>=.30)return[r,g,b];                       // saturated marks keep their colour
  if(lum>.62){                                    // light paper / pastel fill -> deep tinted fill
    const nl=.06+(1-lum)*.85;
    return c<.05?hsl2rgb(268,.45,nl):hsl2rgb(h,Math.min(.75,s*1.2+.25),nl)}
  if(lum<.30){                                    // dark ink -> light lavender
    const nl=.97-lum*.9;return hsl2rgb(c<.05?262:h,c<.05?.55:Math.min(.7,s+.15),Math.min(.93,nl))}
  return[r,g,b]}
const hex=n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0');
function flipColor(str){
  let m=str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(m){let v=m[1];if(v.length===3)v=v.split('').map(c=>c+c).join('');
    const o=flip(parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16));return'#'+hex(o[0])+hex(o[1])+hex(o[2])}
  m=str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m){const o=flip(+m[1],+m[2],+m[3]).map(Math.round);return m[4]!==undefined?`rgba(${o[0]},${o[1]},${o[2]},${m[4]})`:`rgb(${o[0]},${o[1]},${o[2]})`}
  m=str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m){const rgb=hsl2rgb(+m[1],+m[2]/100,+m[3]/100);const o=flip(...rgb);const[h,s,l]=rgb2hsl(...o);
    const hs=`${Math.round(h)},${Math.round(s*100)}%,${Math.round(l*100)}%`;return m[4]!==undefined?`hsla(${hs},${m[4]})`:`hsl(${hs})`}
  return null}

module.exports={flipColor,flip};
