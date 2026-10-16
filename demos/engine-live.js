/* Autopilot for the demo pages: each demo runs itself by driving its own controls,
   so it looks alive on load. Any real input pauses it; it resumes after a short idle. */
(function(){
  const page=(location.pathname.split('/').pop()||'').replace('.html','');
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let on=!reduce,t0=performance.now(),lastUser=-1e9,ticks=0,idleMs=9000;

  // ---- helpers that drive the page's own controls
  const setRange=(el,f)=>{ // f in 0..1
    if(!el)return;const min=+el.min||0,max=+el.max||100,step=+el.step||1;
    const v=Math.round((min+(max-min)*f)/step)*step;
    if(+el.value!==v){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}
  };
  const wave=(t,period,phase=0)=>.5+.5*Math.sin((t/period+phase)*Math.PI*2);
  const click=el=>{if(el&&!el.disabled)el.click()};
  const cycle=(sel,state)=>{const b=$$(sel);if(!b.length)return;state.i=((state.i??-1)+1)%b.length;click(b[state.i])};
  const every=(ms,fn)=>{let n=0;return(t)=>{if(t-n>=ms){n=t;fn(t)}}};

  // ---- per-demo autopilot: returns a function called ~20x/second with elapsed ms
  const PILOTS={
    'mesh-weight':()=>{const c=$('#count'),cy={};const sw=every(7000,()=>cycle('[data-v]',cy));
      return t=>{setRange(c,.06+.9*wave(t,16000));sw(t)}},
    'room-fit':()=>{const w=$('#room-w'),d=$('#room-d'),pr={},sh=every(5000,()=>click($('#shuffle-btn'))),sp=every(14000,()=>cycle('[data-v]',pr));
      return t=>{setRange(w,wave(t,13000));setRange(d,wave(t,17000,.3));sh(t);sp(t)}},
    'shop-sync':()=>{const st=every(2600,()=>{const n=$$('#log div').length;Math.random()<.55?click($('#add-shopper')):click($('#rm-shopper'))});
      let seeded=false;return t=>{if(!seeded){seeded=true;for(let i=0;i<3;i++)click($('#add-shopper'))}st(t)}},
    'talk-loop':()=>{const nx=every(7500,()=>{const pill=$('#state-pill');if(pill&&/idle/i.test(pill.textContent)){const b=$$('#phrases button');click(b[Math.floor(Math.random()*b.length)])}});
      return t=>{if(t>1500)nx(t)}},
    'block-runner':()=>{const adds=['forward','left','right','forward'];let phase=0,at=0;
      return t=>{const run=$('#run-btn');if(!run)return;
        if(t-at<(phase?1500:2500))return;at=t;
        if(!phase){click($('[data-add=clear]'));const n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++)click($(`[data-add=${adds[Math.floor(Math.random()*adds.length)]}]`));phase=1}
        else{if(run.disabled){return}click(run);phase=0;at=t+3000}}},
    'exposure-room':()=>{const i=$('#intensity'),cy={},v=every(11000,()=>cycle('[data-v]',cy));
      return t=>{setRange(i,wave(t,14000));v(t)}},
    'rig-console':()=>{const p=$('#pump');let started=false;
      return t=>{setRange(p,.15+.7*wave(t,12000));if(!started&&t>2500){started=true;const b=$('#sess-btn');if(b&&/start/i.test(b.textContent))click(b)}}},
    'advergame-set':()=>{const sw=every(16000,()=>{const cards=$$('.cab-card'),cur=cards.findIndex(c=>c.classList.contains('active'));click(cards[(cur+1)%cards.length])});
      let started=false;
      return t=>{
        if(!started&&t>1200){started=true;click($('#start-btn'))}
        if(typeof drops!=='undefined'&&typeof paddleX!=='undefined'&&drops.length){ // steer the catcher toward the lowest drop
          const d=drops.reduce((a,b)=>b.y>a.y?b:a);paddleX+=(d.x-paddleX)*.18}
        sw(t)}}
  };
  const pilot=(PILOTS[page]||(()=>null))();
  if(!pilot)return;

  // ---- LIVE badge
  const css=document.createElement('style');
  css.textContent=`#live{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:9px;padding:9px 16px;border-radius:999px;border:1px solid var(--accent-soft,#4f228d);background:color-mix(in srgb,var(--panel-2,#130428) 90%,transparent);backdrop-filter:blur(8px);color:var(--ink,#ccd6f6);font:600 12px var(--font-mono,monospace);cursor:pointer;box-shadow:0 8px 28px -8px var(--accent,#a362ff)}
  #live:hover{border-color:var(--accent,#a362ff)}#live i{width:9px;height:9px;border-radius:50%;background:#7ee0b0;box-shadow:0 0 0 0 #7ee0b0;animation:livePing 1.6s infinite}
  #live.off i{background:#9a93b8;animation:none}#live small{font:400 11px var(--font-mono,monospace);color:var(--ink-dim,#9a93b8)}
  @keyframes livePing{70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}`;
  document.head.appendChild(css);
  const badge=document.createElement('button');badge.id='live';badge.type='button';badge.setAttribute('aria-pressed',String(on));
  document.body.appendChild(badge);
  const paint=()=>{const idle=on&&performance.now()-lastUser<idleMs;badge.className=on&&!idle?'':'off';
    const s=Math.floor((performance.now()-t0)/1000);
    badge.innerHTML=`<i></i>${on?(idle?'PAUSED · you have control':'LIVE · autopilot'):'AUTOPILOT OFF'} <small>${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}</small>`;
    badge.setAttribute('aria-pressed',String(on))};
  badge.onclick=()=>{on=!on;lastUser=-1e9;paint()};
  // real user input pauses the autopilot (ignore our own synthetic events)
  const user=e=>{if(e.isTrusted&&!e.target.closest('#live'))lastUser=performance.now()};
  ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>addEventListener(ev,user,{passive:true,capture:true}));
  addEventListener('input',e=>{if(e.isTrusted)lastUser=performance.now()},true);

  setInterval(()=>{ticks++;const now=performance.now();
    if(on&&now-lastUser>=idleMs&&!document.hidden){try{pilot(now-t0)}catch(e){}}
    if(ticks%10===0)paint()},50);
  paint();
})();
