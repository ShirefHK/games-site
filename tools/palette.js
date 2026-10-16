// Shared colour mapping for the game re-skin ("synthwave night" palette).
// Same maths is mirrored in tools/reskin-assets.py so code colours and image pixels agree.
const HUE_IN =[0,  30, 60, 120,180,240,280,330,360];
const HUE_OUT=[335,372,400,525,550,615,645,680,695];
function mapHue(h){h=((h%360)+360)%360;
  for(let i=0;i<HUE_IN.length-1;i++){if(h>=HUE_IN[i]&&h<=HUE_IN[i+1]){const t=(h-HUE_IN[i])/(HUE_IN[i+1]-HUE_IN[i]);return (HUE_OUT[i]+(HUE_OUT[i+1]-HUE_OUT[i])*t)%360}}
  return h}
const STOPS=[[0,[13,5,24]],[.5,[92,54,156]],[1,[238,230,253]]];
function neutral(y){y=Math.max(0,Math.min(1,y));
  for(let i=0;i<STOPS.length-1;i++){const[a,ca]=STOPS[i],[b,cb]=STOPS[i+1];if(y<=b){const t=(y-a)/(b-a);return ca.map((v,k)=>v+(cb[k]-v)*t)}}
  return STOPS[STOPS.length-1][1]}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
  return[h,s,l]}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};
  if(!s)return[l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
  return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]}
function mapRGB(r,g,b){
  const[h,s,l]=rgb2hsl(r,g,b);
  const lum=(.2126*r+.7152*g+.0722*b)/255;
  const c=(Math.max(r,g,b)-Math.min(r,g,b))/255;
  if(c<.14){const n=neutral(lum);const k=c/.14; // blend toward true hue mapping as saturation grows
    const hs=hsl2rgb(mapHue(h),Math.min(1,s*1.4+.15),l);return n.map((v,i)=>v*(1-k)+hs[i]*k)}
  return hsl2rgb(mapHue(h),Math.min(1,s*1.08),Math.max(.06,Math.min(.92,l*.96+.02)))}
const hex=n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0');
function mapColorString(str){
  let m=str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(m){let v=m[1];if(v.length===3)v=v.split('').map(c=>c+c).join('');
    const[r,g,b]=mapRGB(parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16));return'#'+hex(r)+hex(g)+hex(b)}
  m=str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m){const[r,g,b]=mapRGB(+m[1],+m[2],+m[3]);return m[4]!==undefined?`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${m[4]})`:`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`}
  m=str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if(m){const h=Math.round(mapHue(+m[1]));return m[4]!==undefined?`hsla(${h},${m[2]}%,${m[3]}%,${m[4]})`:`hsl(${h},${m[2]}%,${m[3]}%)`}
  return null}
module.exports={mapHue,mapRGB,mapColorString,neutral};
