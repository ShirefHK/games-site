/* shared motion for demo pages */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const o=document.createElement('div');o.className='orbs';o.setAttribute('aria-hidden','true');o.innerHTML='<i></i><i></i><i></i>';document.body.prepend(o);
  const panels=[...document.querySelectorAll('.panel')];
  if(!reduce&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.05});
    panels.forEach(p=>{p.classList.add('rv');io.observe(p)});
  }
  panels.forEach(p=>{const h=p.querySelector(':scope>h2');if(h)h.addEventListener('click',()=>p.classList.toggle('collapsed'))});
  const eb=document.querySelector('.eyebrow');
  if(eb&&!reduce){const full=eb.textContent;let i=0;eb.innerHTML='<span></span><i class="caret"></i>';const s=eb.firstChild;(function t(){s.textContent=full.slice(0,++i);if(i<full.length)setTimeout(t,32)})()}
  document.addEventListener('mousemove',e=>{
    const c=e.target.closest&&e.target.closest('.panel,.stat,.headline-stat');if(!c)return;
    const b=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-b.left)+'px');c.style.setProperty('--my',(e.clientY-b.top)+'px');
  });
})();