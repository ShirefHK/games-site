// Re-colours every game by rewriting colour strings inside the obfuscated string arrays
// (and plain arrays) of games/*/index.html and the shared games/*.js files.
// Run ONCE from the repo root:  node tools/reskin-colors.js        (use --force to run again; it compounds)
const fs=require('fs'),path=require('path');
const {mapColorString}=require('./palette.js');
const root=path.join(__dirname,'..','games'),marker=path.join(__dirname,'.colors-done');
if(fs.existsSync(marker)&&!process.argv.includes('--force')){console.log('already applied (delete tools/.colors-done or use --force)');process.exit(0)}

const STD='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const AL ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
function dec(s){let o='',n=0,acc=0;for(const ch of s){const v=AL.indexOf(ch);if(v<0)continue;acc=n%4?acc*64+v:v;if(n++%4)o+=String.fromCharCode(255&acc>>(-2*n&6))}
  try{return decodeURIComponent(escape(o))}catch(e){return null}}
function enc(str){const b64=Buffer.from(str,'utf8').toString('base64').replace(/=+$/,'');
  return b64.split('').map(c=>AL[STD.indexOf(c)]).join('')}
// sanity: round trip
for(const t of ['#ff8c42','rgba(0,0,0,.7)','hsl(120,45%,32%)']){if(dec(enc(t))!==t)throw new Error('codec mismatch for '+t)}

const files=[];
for(const d of fs.readdirSync(root,{withFileTypes:true})){
  if(d.isDirectory()){const f=path.join(root,d.name,'index.html');if(fs.existsSync(f))files.push(f)}
  else if(/^(common|gridkit|loop-core|loop-ui|rect-ui|sudoku-core|sudoku-ui)\.js$/.test(d.name))files.push(path.join(root,d.name));
}
const ARR=/\[(?:'(?:[^'\\]|\\.)*'\s*,\s*){7,}'(?:[^'\\]|\\.)*'\s*,?\s*\]/g;
let totalChanged=0;
for(const f of files){
  let src=fs.readFileSync(f,'utf8'),changed=0;
  src=src.replace(ARR,arr=>arr.replace(/'((?:[^'\\]|\\.)*)'/g,(m,s)=>{
    // plain colour literal inside a normal array
    const raw=mapColorString(s);if(raw&&s!==raw){changed++;return`'${raw}'`}
    if(s.length<4||s.length>40||/[^A-Za-z0-9+/=]/.test(s))return m;
    const d=dec(s);if(!d)return m;
    const nc=mapColorString(d);if(!nc||nc===d)return m;
    changed++;return`'${enc(nc)}'`;
  }));
  if(changed){fs.writeFileSync(f,src);totalChanged+=changed}
  console.log(String(changed).padStart(4),path.relative(root,f));
}
fs.writeFileSync(marker,new Date().toISOString());
console.log('colour strings remapped:',totalChanged);
