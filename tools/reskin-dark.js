// Round 2 for code-drawn games:
//  1. flips the light "paper" puzzle boards to a dark neon board (backgrounds <-> ink)
//  2. puts Poppins in front of the system font in every game's canvas text
// Run ONCE after reskin-colors.js:  node tools/reskin-dark.js   (--force to repeat; it compounds)
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','games'),marker=path.join(__dirname,'.dark-done');
if(fs.existsSync(marker)&&!process.argv.includes('--force')){console.log('already applied (delete tools/.dark-done or use --force)');process.exit(0)}

const STD='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const AL ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
function dec(s){let o='',n=0,acc=0;for(const ch of s){const v=AL.indexOf(ch);if(v<0)continue;acc=n%4?acc*64+v:v;if(n++%4)o+=String.fromCharCode(255&acc>>(-2*n&6))}
  try{return decodeURIComponent(escape(o))}catch(e){return null}}
function enc(str){const b64=Buffer.from(str,'utf8').toString('base64').replace(/=+$/,'');return b64.split('').map(c=>AL[STD.indexOf(c)]).join('')}

const {flipColor}=require('./flip.js');

// ---- which files are light "paper" boards (judged from the screenshots of each game)
const LIGHT_GAMES=new Set(['05','20','22','35','37','38','39','40','41','42','43','44','45','46','47','48','49','52','53','54','55','56','57','58','59','60','61','62','63','64','66','67','68','69','70']);
const LIGHT_SHARED=new Set(['sudoku-ui.js','sudoku-core.js','loop-ui.js','rect-ui.js']);
const files=[];
for(const d of fs.readdirSync(root,{withFileTypes:true})){
  if(d.isDirectory()){const f=path.join(root,d.name,'index.html');if(fs.existsSync(f))files.push({f,light:LIGHT_GAMES.has(d.name.slice(0,2))})}
  else if(/\.js$/.test(d.name)&&/^(common|gridkit|loop-core|loop-ui|rect-ui|sudoku-core|sudoku-ui)\.js$/.test(d.name))files.push({f:path.join(root,d.name),light:LIGHT_SHARED.has(d.name)});
}
const ARR=/\[(?:'(?:[^'\\]|\\.)*'\s*,\s*){7,}'(?:[^'\\]|\\.)*'\s*,?\s*\]/g;
let flipped=0,fonts=0;
for(const {f,light} of files){
  let src=fs.readFileSync(f,'utf8'),a=0,b=0;
  src=src.replace(ARR,arr=>arr.replace(/'((?:[^'\\]|\\.)*)'/g,(m,s)=>{
    if(s.length<4||s.length>80||/[^A-Za-z0-9+/=]/.test(s))return m;
    const d=dec(s);if(!d)return m;
    if(light){const nc=flipColor(d);if(nc&&nc!==d){a++;return`'${enc(nc)}'`}}
    if(/system-ui/.test(d)&&!/Poppins/.test(d)){b++;return`'${enc(d.replace('system-ui','Poppins, system-ui'))}'`}
    return m}));
  if(a||b){fs.writeFileSync(f,src);flipped+=a;fonts+=b}
  console.log((light?'dark ':'     ')+String(a).padStart(3)+' colours, '+String(b).padStart(2)+' fonts  '+path.relative(root,f));
}
fs.writeFileSync(marker,new Date().toISOString());
console.log('colours flipped:',flipped,'| font strings:',fonts);
