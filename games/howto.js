/* In-game "How to play" overlay. Reads the guide for the current game from howto-data.js
   (built from /howto/*.md by tools/build-howto.js). Opens on first visit, then via the ? button or "?" key. */
(function(){
  const folder=decodeURIComponent(location.pathname.split('/').filter(Boolean).slice(-1)[0]||'');
  const mdRaw=window.HOWTO&&window.HOWTO[folder];
  if(!mdRaw)return;
  // phones/tablets: on-screen controls, tap wording instead of click
  const TOUCH=/[?&]touch\b/.test(location.search)||(matchMedia('(pointer:coarse)').matches&&Math.min(innerWidth,innerHeight)<=820);
  const md=TOUCH?mdRaw.replace(/right[- ]click/gi,'Long-press').replace(/left[- ]click/gi,'Tap').replace(/\bclick(ing|s)?\b/gi,(m,x)=>(m[0]==='C'?'Tap':'tap')+(x?x==='s'?'s':'ping':'')):mdRaw;
  try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const seen='howto:'+folder;
  // #thumb mode: clean, chrome-free view used to capture the landing-page thumbnails
  const THUMB=location.hash==='#thumb';
  if(THUMB){const ts=document.createElement('style');ts.textContent='#bar,#help,#hw-btn,#hw-fs,#hw-ap,#hw,body>main>.row:first-child{display:none!important}html,body{background:#0d0518!important}body{padding:0!important}canvas{margin:0!important;box-shadow:none!important;border-radius:0!important;animation:none!important}';document.head.appendChild(ts)}

  // --- parse the guide markdown (title, ## sections; tables, ordered and bullet lists, paragraphs)
  const title=(md.match(/^# (.+)$/m)||[,folder])[1];
  const sec={};
  md.split(/^## /m).slice(1).forEach(b=>{const i=b.indexOf('\n');sec[b.slice(0,i).trim()]=b.slice(i+1).trim()});
  const list=t=>(t||'').split('\n').map(l=>l.replace(/^(\d+\.|-)\s+/,'').trim()).filter(Boolean);
  const rowsOf=t=>(t||'').split('\n').slice(2).map(l=>l.replace(/^\||\|$/g,'').split('|').map(s=>s.trim())).filter(r=>r.length>=2);
  const rows=rowsOf(sec.Controls);
  const rowsRaw=rowsOf((mdRaw.split(/^## /m).find(b=>/^Controls\b/.test(b))||'').replace(/^[^\n]*\n/,''));
  const keycaps=k=>k.split(' / ').map(g=>{
    const parts=g.split(' ');
    return (parts.length>1&&parts.every(p=>p.length<=2)?parts:[g]).map(p=>`<kbd>${esc(p)}</kbd>`).join('');
  }).join('<span class="or">or</span>');

  const css=`
  #hw-btn{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:9px 16px 9px 12px;border:1px solid #4f228d;border-radius:999px;background:#1a0b2e;color:#ccd6f6;font:600 13px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 24px -6px #763cac}
  #hw-btn:hover{background:#251043;border-color:#a362ff}
  #hw-btn b{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#a362ff;color:#0d0518;font-size:13px}
  #hw{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(8,2,18,.78);backdrop-filter:blur(6px);font:14px/1.55 Poppins,system-ui,sans-serif;color:#ccd6f6}
  #hw.open{display:flex}
  #hw .card{width:min(640px,100%);max-height:calc(100vh - 32px);overflow:auto;background:linear-gradient(137deg,#130428,#1a0b2e);border:1px solid #4f228d;border-radius:14px;box-shadow:0 30px 80px -20px #763cac;animation:hwin .25s ease-out}
  @keyframes hwin{from{opacity:0;transform:translateY(14px) scale(.98)}}
  #hw header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-bottom:1px solid #07020f}
  #hw header small{display:block;color:#9a93b8;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  #hw h2{margin:2px 0 0;font:22px Preahvihear,Poppins,sans-serif;color:#fff}
  #hw .x{border:0;background:#251043;color:#ccd6f6;width:32px;height:32px;border-radius:8px;font-size:16px;cursor:pointer}
  #hw .x:hover{background:#4f228d}
  #hw section{padding:16px 22px 0}
  #hw h3{margin:0 0 10px;font:600 12px Poppins,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#a362ff}
  #hw .goal{margin:0;padding:12px 14px;border-left:3px solid #a362ff;background:#251043;border-radius:0 8px 8px 0}
  #hw .ctl{display:grid;grid-template-columns:minmax(120px,auto) 1fr;gap:8px 16px;align-items:center}
  #hw kbd{display:inline-block;min-width:30px;margin:0 3px 0 0;padding:4px 9px;text-align:center;font:600 14px "IBM Plex Mono",ui-monospace,monospace;color:#fff;background:#251043;border:1px solid #4f228d;border-bottom-width:3px;border-radius:7px;white-space:nowrap}
  #hw .or{margin:0 6px 0 3px;font-size:11px;color:#9a93b8}
  #hw ol{margin:0;padding:0;list-style:none;counter-reset:s}
  #hw ol li{counter-increment:s;position:relative;padding:4px 0 10px 40px}
  #hw ol li::before{content:counter(s);position:absolute;left:0;top:2px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#4f228d;color:#fff;font-weight:600;font-size:12px}
  #hw ul{margin:0;padding:0 0 0 18px;color:#e5b645}
  #hw ul li{padding:2px 0}#hw ul li span{color:#ccd6f6}
  #hw footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px 20px}
  #hw footer span{color:#9a93b8;font-size:12px}
  #hw .go{border:0;border-radius:9px;padding:11px 22px;background:#a362ff;color:#0d0518;font:600 14px Poppins,sans-serif;cursor:pointer}
  #hw .go:hover{background:#b98aff}
  @media(max-width:520px){#hw .ctl{grid-template-columns:1fr}#hw footer span{display:none}#hw .go{width:100%}}
  @media(prefers-reduced-motion:reduce){#hw .card{animation:none}}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  const ov=document.createElement('div');ov.id='hw';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','How to play '+title);
  ov.innerHTML=`<div class="card"><header><div><small>How to play</small><h2>${esc(title)}</h2></div><button class="x" type="button" aria-label="Close">✕</button></header>
  <section><h3>Goal</h3><p class="goal">${esc(sec.Goal||'')}</p></section>
  <section><h3>Controls</h3><div class="ctl">${rows.map(r=>`<div>${keycaps(r[0])}</div><div>${esc(r[1])}</div>`).join('')}</div></section>
  <section><h3>Step by step</h3><ol>${list(sec['How to play']).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
  ${list(sec.Tips).length?`<section><h3>Tips</h3><ul>${list(sec.Tips).map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ul></section>`:''}
  <footer><span>Press <b>?</b> any time to reopen this</span><button class="go" type="button">Got it — let's play</button></footer></div>`;
  const btn=document.createElement('button');btn.id='hw-btn';btn.type='button';btn.innerHTML='<b>?</b> How to play';

  const open=()=>{ov.classList.add('open');ov.querySelector('.go').focus()};
  const close=()=>{ov.classList.remove('open');try{localStorage.setItem(seen,'1')}catch(e){}btn.focus()};
  // while open, swallow keys so the game behind does not move
  addEventListener('keydown',e=>{
    if(ov.classList.contains('open')){
      const onBtn=e.target.tagName==='BUTTON'&&ov.contains(e.target);
      if(e.key==='Escape'||e.key==='Enter'&&!onBtn)close();
      if(e.key!=='Tab'&&!(onBtn&&(e.key==='Enter'||e.key===' '))){e.stopImmediatePropagation();e.preventDefault()}
    }else if(e.key==='?'&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName)){open();e.stopImmediatePropagation()}
  },true);
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.x,.go'))close()});
  btn.onclick=open;

  // --- scale the game canvas to fill the window + optional true fullscreen
  const fsBtn=document.createElement('button');fsBtn.id='hw-fs';fsBtn.type='button';fsBtn.innerHTML='<b>⛶</b> Fullscreen';
  const css2=document.createElement('style');css2.textContent='#hw-fs{position:fixed;right:16px;bottom:60px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:9px 16px 9px 12px;border:1px solid #4f228d;border-radius:999px;background:#1a0b2e;color:#ccd6f6;font:600 13px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 24px -6px #763cac}#hw-fs:hover{background:#251043;border-color:#a362ff}#hw-fs b{font-size:15px;font-weight:600;color:#a362ff}body.hw-full #bar{display:none}body.hw-full{padding-top:0!important}canvas.hw-fit{max-width:none!important}';
  document.head.appendChild(css2);
  let cv=null,last='';
  const fit=()=>{
    cv=cv||document.querySelector('body > canvas');if(!cv)return;
    const bar=document.getElementById('bar'),help=document.getElementById('help');
    const barH=bar&&bar.offsetParent?bar.offsetHeight:0,helpH=help?help.offsetHeight+8:0;
    const padH=TOUCH?['hw-pad','hw-tools'].reduce((n,i)=>{const e=document.getElementById(i);return n+(e?e.offsetHeight+8:0)},0):0;
    const availW=innerWidth-(TOUCH?12:32),availH=innerHeight-barH-(TOUCH?0:helpH)-padH-(TOUCH?28:48);
    const k=Math.max(.2,Math.min(availW/cv.width,availH/cv.height));
    const w=Math.floor(cv.width*k)+'px';
    if(w!==last||!cv.classList.contains('hw-fit')){last=w;cv.classList.add('hw-fit');cv.style.width=w;cv.style.height='auto'}
  };
  const toggleFs=()=>{const d=document,r=d.documentElement;
    if(d.fullscreenElement)d.exitFullscreen();else if(r.requestFullscreen)r.requestFullscreen().catch(()=>{});};
  fsBtn.onclick=()=>{toggleFs();fsBtn.blur()};
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('hw-full',!!document.fullscreenElement);fsBtn.innerHTML=document.fullscreenElement?'<b>✕</b> Exit fullscreen':'<b>⛶</b> Fullscreen';last='';fit()});
  addEventListener('resize',fit);setInterval(fit,500);
  // --- Auto-play demo: random input drawn from this game's own controls, so the game looks alive.
  const ctlText=rowsRaw.map(r=>r.join(' ')).join(' ');
  const keys=[];
  const addK=(...c)=>c.forEach(k=>keys.includes(k)||keys.push(k));
  if(/Arrow|Arrows/.test(ctlText))addK('ArrowLeft','ArrowRight','ArrowUp','ArrowDown');
  if(/←/.test(ctlText))addK('ArrowLeft');if(/→/.test(ctlText))addK('ArrowRight');
  if(/↑/.test(ctlText))addK('ArrowUp');if(/↓/.test(ctlText))addK('ArrowDown');
  if(/W A S D|WASD/.test(ctlText))addK('KeyW','KeyA','KeyS','KeyD');else if(/W A D/.test(ctlText))addK('KeyW','KeyA','KeyD');
  if(/Space/.test(ctlText)&&!/Space[^|]*Computer plays/.test(ctlText))addK('Space');
  const mouse=/Click|Drag/i.test(ctlText);
  const hold=/accelerate|Gas|Thrust/i.test(ctlText)?'ArrowUp':null;
  const restartK=rows.some(r=>r[0]==='R');
  const canAuto=document.querySelector('body > canvas')&&(keys.length||mouse);
  const apBtn=document.createElement('button');apBtn.id='hw-ap';apBtn.type='button';apBtn.innerHTML='<b>▶</b> Auto-play demo';
  const css3=document.createElement('style');css3.textContent='#hw-ap{position:fixed;right:16px;bottom:104px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:9px 16px 9px 12px;border:1px solid #4f228d;border-radius:999px;background:#1a0b2e;color:#ccd6f6;font:600 13px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 24px -6px #763cac}#hw-ap:hover{background:#251043;border-color:#a362ff}#hw-ap b{font-size:13px;color:#a362ff}#hw-ap.on{border-color:#7ee0b0}#hw-ap.on b{color:#7ee0b0}';
  document.head.appendChild(css3);
  let ap=false,apTimer=null,lastUser=-1e9,held=false,lastR=0;
  const kev=(type,code)=>dispatchEvent(new KeyboardEvent(type,{code,key:code.replace(/^Key|^Arrow/,''),bubbles:true,cancelable:true}));
  const tap=code=>{kev('keydown',code);setTimeout(()=>kev('keyup',code),60+Math.random()*90)};
  const mev=(type,x,y,t)=>(t||document.querySelector('body > canvas')).dispatchEvent(new MouseEvent(type,{clientX:x,clientY:y,bubbles:true,cancelable:true,button:0,buttons:type==='mouseup'?0:1}));
  const step=()=>{
    if(ov.classList.contains('open')||document.hidden||performance.now()-lastUser<6000)return;
    if(hold&&!held){held=true;kev('keydown',hold)}
    const c=document.querySelector('body > canvas'),r=c.getBoundingClientRect();
    const pt=()=>[r.left+r.width*(.05+.9*Math.random()),r.top+r.height*(.05+.9*Math.random())];
    const move=keys.filter(k=>k!==hold);
    if(mouse&&(!move.length||Math.random()<.4)){const [x,y]=pt();mev('mousemove',x,y);mev('mousedown',x,y);if(/Drag/i.test(ctlText)){const [x2,y2]=pt();mev('mousemove',x2,y2)}mev('mouseup',x,y);mev('click',x,y)}
    else if(move.length)tap(move[Math.floor(Math.random()*move.length)]);
    if(restartK&&performance.now()-lastR>45000){lastR=performance.now();tap('KeyR')}
  };
  const setAp=on=>{ap=on;apBtn.classList.toggle('on',on);apBtn.innerHTML=on?'<b>❚❚</b> Stop auto-play':'<b>▶</b> Auto-play demo';
    clearInterval(apTimer);if(on){lastR=performance.now();apTimer=setInterval(step,170)}else if(held){held=false;kev('keyup',hold)}};
  apBtn.onclick=()=>{setAp(!ap);apBtn.blur()};
  ['mousedown','keydown','touchstart'].forEach(ev=>addEventListener(ev,e=>{if(e.isTrusted&&!(e.target.closest&&e.target.closest('#hw-ap')))lastUser=performance.now()},true));
  // --- Touch support: pad built from this game's Controls table + touch->mouse bridge for the canvas
  const tools=document.createElement('div');tools.id='hw-tools';
  const pad=document.createElement('div');pad.id='hw-pad';
  let rightMode=false;
  const buildTouch=()=>{
    const cvs=document.querySelector('body > canvas');if(!cvs)return;
    const KS={Space:{code:'Space',key:' '},Enter:{code:'Enter',key:'Enter'},Backspace:{code:'Backspace',key:'Backspace'},Esc:{code:'Escape',key:'Escape'},Tab:{code:'Tab',key:'Tab'},'[':{code:'BracketLeft',key:'['},']':{code:'BracketRight',key:']'}};
    const spec=n=>KS[n]||(/^[A-Z]$/.test(n)?{code:'Key'+n,key:n.toLowerCase()}:/^\d$/.test(n)?{code:'Digit'+n,key:n}:null);
    const fire=(type,k)=>document.body.dispatchEvent(new KeyboardEvent(type,{code:k.code,key:k.key,bubbles:true,cancelable:true}));
    const dirs=new Set(),dirs2=new Set(),acts=[],digs=[];let letters=false,rclick=false;
    const AR={'←':'ArrowLeft','↑':'ArrowUp','↓':'ArrowDown','→':'ArrowRight'};
    const WS={W:'ArrowUp',A:'ArrowLeft',S:'ArrowDown',D:'ArrowRight'};
    rowsRaw.forEach(([k,d])=>{
      if(/right click|shift/i.test(k))rclick=true;
      if(/^(Left click|Right click|Click|Drag|Mouse|Swipe|Tap)/i.test(k))return;
      if(/Arrow/i.test(k))Object.values(AR).forEach(a=>dirs.add(a));
      const toks=k.split(/\s*\/\s*|\s+or\s+/);
      toks.forEach(t=>{
        t=t.trim();
        if(/^W A S D$|^W A D$/.test(t)){t.split(' ').forEach(c=>dirs2.add(WS[c]));return}
        if(/^[←↑↓→]( [←↑↓→])*$/.test(t)){t.split(' ').forEach(c=>dirs.add(AR[c]));return}
        const m=t.match(/^(\d)\s*[–-]\s*(\d|N)/);
        if(m){const hi=m[2]==='N'?9:+m[2];for(let i=+m[1];i<=hi;i++)digs.includes(i)||digs.push(i);return}
        if(/^Digits$/i.test(t)){for(let i=0;i<=9;i++)digs.includes(i)||digs.push(i);return}
        if(/^(Letters|A–Z)$/i.test(t)){letters=true;return}
        if(t==='0'){digs.includes(0)||digs.push(0);return}
        const sp=spec(t);
        if(sp&&!acts.some(a=>a.t===t))acts.push({t,sp,d:toks.length>1?'':d});
      });
    });
    if(folder==='32 Gridwords'){letters=false;acts.splice(0,acts.length,...acts.filter(x=>x.t==='Esc'))}   // draws its own keyboard
    // tap-to-select puzzles don't need arrow keys; they get a number/letter pad instead
    if(rowsRaw.some(r=>/click|drag/i.test(r[0])))dirs.clear();
    if(digs.length&&rowsRaw.some(r=>/Backspace|\b0\b/.test(r.join(' ')))&&!digs.includes(0))digs.push(0);
    const el=(c,h)=>{const e=document.createElement('div');e.className=c;if(h)e.innerHTML=h;return e};
    // press = keydown, release = keyup; direction buttons auto-repeat like a held key
    const hold=(b,k,rep)=>{
      let on=false,t1=0,t2=0;
      const up=()=>{if(!on)return;on=false;clearTimeout(t1);clearInterval(t2);b.classList.remove('dn');fire('keyup',k)};
      b.addEventListener('pointerdown',e=>{e.preventDefault();if(on)return;on=true;b.classList.add('dn');try{b.setPointerCapture(e.pointerId)}catch(_){}
        fire('keydown',k);if(rep)t1=setTimeout(()=>{t2=setInterval(()=>fire('keydown',k),85)},320)});
      ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,up));
      b.addEventListener('contextmenu',e=>e.preventDefault());
    };
    const mk=(label,k,rep,cls)=>{const b=document.createElement('button');b.type='button';b.className='pb '+cls;b.innerHTML=label;b.setAttribute('aria-label',k.code);hold(b,k,rep);return b};
    const dpad=(set,cls)=>{
      if(!set.size)return null;
      const g=el('dp '+cls),G={ArrowUp:['▲',2,1],ArrowLeft:['◀',1,2],ArrowDown:['▼',2,2],ArrowRight:['▶',3,2]};
      const vert=set.has('ArrowUp')||set.has('ArrowDown');
      Object.keys(G).filter(a=>set.has(a)).forEach(a=>{
        const b=mk(G[a][0],{code:a,key:a},true,'dir');b.style.gridColumn=G[a][1];b.style.gridRow=vert?G[a][2]:1;g.appendChild(b)});
      return g;
    };
    const d1=dpad(dirs,'p1'),d2=dpad(dirs2,'p2');
    if(d1||d2){const row=el('prow');if(d2)row.appendChild(d2);if(d1)row.appendChild(d1);pad.appendChild(row)}
    if(acts.length||rclick){
      const ar=el('acts');
      if(rclick){const b=document.createElement('button');b.type='button';b.className='pb act tgl';b.innerHTML='<b>Flag / mark</b><i>or long-press</i>';
        b.onclick=()=>{rightMode=!rightMode;b.classList.toggle('on',rightMode);b.querySelector('b').textContent=rightMode?'Flag mode ON':'Flag / mark'};ar.appendChild(b)}
      acts.forEach(a=>ar.appendChild(mk('<b>'+esc(a.t)+'</b>'+(a.d?'<i>'+esc(a.d.split(/[(,.]/)[0].trim().split(' ').slice(0,2).join(' '))+'</i>':''),a.sp,false,'act')));
      pad.appendChild(ar);
    }
    if(digs.length){
      const nr=el('nums');digs.sort((a,b)=>(a||10)-(b||10)).forEach(n=>nr.appendChild(mk(n===0?'⌫':String(n),spec(String(n)),false,'num')));
      pad.appendChild(nr);
    }
    if(letters){
      const kb=el('kb');['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach(r=>{const rr=el('kr');[...r].forEach(c=>rr.appendChild(mk(c,spec(c),false,'let')));kb.appendChild(rr)});
      pad.appendChild(kb);
    }
    if(pad.querySelector('button'))cvs.after(pad);

    // touch -> mouse bridge (drag, hover, long-press = right click). 2048 already handles swipes itself.
    if(folder==='25 2048')return;
    const me=(type,t,b,down)=>cvs.dispatchEvent(new MouseEvent(type,{clientX:t.clientX,clientY:t.clientY,screenX:t.screenX||0,screenY:t.screenY||0,bubbles:true,cancelable:true,view:window,button:b||0,buttons:down?(b===2?2:1):0}));
    const rc=t=>{me('mousemove',t);me('mousedown',t,2,1);me('contextmenu',t,2,1);me('mouseup',t,2)};
    let st=null;
    cvs.addEventListener('touchstart',e=>{
      if(e.touches.length>1)return;
      e.preventDefault();const t=e.changedTouches[0];
      st={x:t.clientX,y:t.clientY,moved:false,down:false,done:false,timer:0};
      me('mousemove',t);
      if(rightMode)return;
      if(!rclick){me('mousedown',t,0,1);st.down=true}   // no right-click in this game: press at once (drag-friendly)
      else st.timer=setTimeout(()=>{if(st&&!st.moved&&!st.down){st.done=true;rc(t);navigator.vibrate&&navigator.vibrate(15)}},450);
    },{passive:false});
    cvs.addEventListener('touchmove',e=>{
      if(!st)return;e.preventDefault();const t=e.changedTouches[0];
      if(Math.hypot(t.clientX-st.x,t.clientY-st.y)>8){
        st.moved=true;clearTimeout(st.timer);
        if(!st.down&&!st.done&&!rightMode){me('mousedown',{clientX:st.x,clientY:st.y},0,1);st.down=true}
      }
      if(!st.done)me('mousemove',t,0,st.down);
    },{passive:false});
    const end=e=>{
      if(!st)return;e.preventDefault();clearTimeout(st.timer);
      const t=e.changedTouches[0],s=st;st=null;
      if(e.type==='touchcancel'){if(s.down)me('mouseup',t);return}
      if(s.done)return;
      if(rightMode){rc(t);return}
      if(!s.down)me('mousedown',t,0,1);
      me('mouseup',t);
      if(!s.moved)me('click',t);
    };
    cvs.addEventListener('touchend',end,{passive:false});cvs.addEventListener('touchcancel',end,{passive:false});
  };
  if(TOUCH){
    const tcss=document.createElement('style');tcss.textContent=`
    body.hw-touch #hw-tools{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;width:100%;margin-top:8px}
    body.hw-touch #hw-btn,body.hw-touch #hw-fs,body.hw-touch #hw-ap{position:static;padding:7px 12px 7px 9px;font-size:12px;box-shadow:none}
    body.hw-touch #help{display:none}
    #hw-pad{width:100%;max-width:520px;margin:8px auto 0;display:flex;flex-direction:column;gap:8px;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none}
    #hw-pad button{font-family:Poppins,system-ui,sans-serif;touch-action:none;-webkit-tap-highlight-color:transparent;border:1px solid #4f228d;background:#1a0b2e;color:#ccd6f6;cursor:pointer}
    #hw-pad button.dn,#hw-pad button.on{background:#a362ff;color:#0d0518;border-color:#a362ff}
    #hw-pad .prow{display:flex;justify-content:center;align-items:flex-end;gap:12px}
    #hw-pad .dp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:54px;gap:6px;flex:1;max-width:200px}
    #hw-pad .dir{font-size:20px;border-radius:14px}
    #hw-pad .acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
    #hw-pad .act{min-width:68px;height:46px;padding:4px 10px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
    #hw-pad .act b{font:600 14px "IBM Plex Mono",ui-monospace,monospace}#hw-pad .act i{font-style:normal;font-size:10px;opacity:.75}
    #hw-pad .nums{display:flex;gap:5px}
    #hw-pad .num{flex:1;min-width:0;height:46px;border-radius:10px;font-size:18px;font-weight:600}
    #hw-pad .kb{display:flex;flex-direction:column;gap:5px}#hw-pad .kr{display:flex;justify-content:center;gap:4px}
    #hw-pad .let{flex:1;max-width:40px;height:42px;padding:0;border-radius:8px;font-size:15px;font-weight:600}
    #hw .ctl{grid-template-columns:auto 1fr!important;gap:6px 12px!important}#hw section{padding:12px 16px 0!important}#hw header{padding:14px 16px!important}#hw footer{padding:14px 16px 16px!important}
    `;document.head.appendChild(tcss);
  }
  const mount=()=>{document.body.appendChild(ov);const hasCv=!!document.querySelector("body > canvas");
    if(TOUCH&&hasCv){document.body.classList.add('hw-touch');tools.appendChild(btn);if(document.documentElement.requestFullscreen)tools.appendChild(fsBtn);document.body.appendChild(tools);buildTouch();fit();setTimeout(fit,50)}
    else{document.body.appendChild(btn);if(hasCv){document.body.appendChild(fsBtn);fit();if(canAuto)document.body.appendChild(apBtn)}}
    let s=0;try{s=localStorage.getItem(seen)}catch(e){}if(!s&&!THUMB)open()};
  document.body?mount():addEventListener('DOMContentLoaded',mount);
})();
