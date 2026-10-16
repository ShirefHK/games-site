// Round 2b: colour literals written directly in the game code ('#fff', '#111', '#f4f1ea', ...).
// reskin-colors.js only reached colours inside the string tables, so these kept the original look.
// Maps them through the palette and, for the light "paper" boards, flips them to the dark board.
// Run ONCE after reskin-dark.js:  node tools/reskin-literals.js   (--force repeats; it compounds)
const fs=require('fs'),path=require('path');
const {mapColorString}=require('./palette.js');
const root=path.join(__dirname,'..','games'),marker=path.join(__dirname,'.literals-done');
if(fs.existsSync(marker)&&!process.argv.includes('--force')){console.log('already applied (delete tools/.literals-done or use --force)');process.exit(0)}
const FLIP=require('./flip.js');

const LIGHT_GAMES=new Set(['05','20','22','35','37','38','39','40','41','42','43','44','45','46','47','48','49','52','53','54','55','56','57','58','59','60','61','62','63','64','66','67','68','69','70']);
const LIGHT_SHARED=new Set(['sudoku-ui.js','sudoku-core.js','loop-ui.js','rect-ui.js']);
const files=[];
for(const d of fs.readdirSync(root,{withFileTypes:true})){
  if(d.isDirectory()){const f=path.join(root,d.name,'index.html');if(fs.existsSync(f))files.push({f,light:LIGHT_GAMES.has(d.name.slice(0,2))})}
  else if(/^(common|gridkit|loop-core|loop-ui|rect-ui|sudoku-core|sudoku-ui)\.js$/.test(d.name))files.push({f:path.join(root,d.name),light:LIGHT_SHARED.has(d.name)});
}
const ARR=/\[(?:'(?:[^'\\]|\\.)*'\s*,\s*){7,}'(?:[^'\\]|\\.)*'\s*,?\s*\]/g;
// quoted colour literal: '#abc' "#aabbcc" 'rgba(1,2,3,.4)' 'hsl(...)'
const LIT=/(['"])(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)|hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\))\1/g;
let total=0;
for(const {f,light} of files){
  let src=fs.readFileSync(f,'utf8');
  const keep=[];src=src.replace(ARR,m=>{keep.push(m);return`\u0000ARR${keep.length-1}\u0000`});   // leave the string tables alone
  let n=0;
  src=src.replace(LIT,(m,q,c)=>{const mapped=mapColorString(c);if(!mapped)return m;const out=light?(FLIP.flipColor(mapped)||mapped):mapped;if(out===c)return m;n++;return q+out+q});
  src=src.replace(/\u0000ARR(\d+)\u0000/g,(m,i)=>keep[+i]);
  if(n){fs.writeFileSync(f,src);total+=n}
  console.log((light?'dark ':'     ')+String(n).padStart(3)+'  '+path.relative(root,f));
}
fs.writeFileSync(marker,new Date().toISOString());
console.log('literals remapped:',total);
