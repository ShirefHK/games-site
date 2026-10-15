/* In-game "How to play" overlay. Reads the guide for the current game from howto-data.js
   (built from /howto/*.md by tools/build-howto.js). Opens on first visit, then via the ? button or "?" key. */
(function(){
  const folder=decodeURIComponent(location.pathname.split('/').filter(Boolean).slice(-1)[0]||'');
  const md=window.HOWTO&&window.HOWTO[folder];
  if(!md)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const seen='howto:'+folder;

  // --- parse the guide markdown (title, ## sections; tables, ordered and bullet lists, paragraphs)
  const title=(md.match(/^# (.+)$/m)||[,folder])[1];
  const sec={};
  md.split(/^## /m).slice(1).forEach(b=>{const i=b.indexOf('\n');sec[b.slice(0,i).trim()]=b.slice(i+1).trim()});
  const list=t=>(t||'').split('\n').map(l=>l.replace(/^(\d+\.|-)\s+/,'').trim()).filter(Boolean);
  const rows=(sec.Controls||'').split('\n').slice(2).map(l=>l.replace(/^\||\|$/g,'').split('|').map(s=>s.trim())).filter(r=>r.length>=2);
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

  const mount=()=>{document.body.appendChild(ov);document.body.appendChild(btn);let s=0;try{s=localStorage.getItem(seen)}catch(e){}if(!s)open()};
  document.body?mount():addEventListener('DOMContentLoaded',mount);
})();
