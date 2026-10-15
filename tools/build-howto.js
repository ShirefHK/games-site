// Bundles howto/*.md into games/howto-data.js (so guides work on file:// and GitHub Pages).
// Run: node tools/build-howto.js
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','howto'),data={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.md')))data[f.slice(0,-3)]=fs.readFileSync(path.join(dir,f),'utf8');
fs.writeFileSync(path.join(__dirname,'..','games','howto-data.js'),'window.HOWTO='+JSON.stringify(data)+';\n');
console.log('bundled',Object.keys(data).length,'guides');
