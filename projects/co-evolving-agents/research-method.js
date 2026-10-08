(()=>{
 document.querySelectorAll('.rw').forEach(root=>{
  const nav=[...root.querySelectorAll('[data-rw-step]')],panels=[...root.querySelectorAll('.rw-panel')],button=root.querySelector('.rw-play'),reduce=root.querySelector('[data-rw-reduce]'),progress=root.querySelector('.rw-progress span');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let reduced=motion.matches,playing=!reduced,current=0,elapsed=0,last=0,visible=false;const duration=8500;
  reduce.checked=reduced;
  function controls(){renderExchange();root.classList.toggle('paused',!playing);root.classList.toggle('reduced',reduced);button.textContent=playing?'Pause':'Play';button.setAttribute('aria-label',(playing?'Pause':'Play')+' method walkthrough');}
  function renderExchange(){const scene=panels[current];if(!scene.classList.contains('rw-coevolution'))return;const settled=reduced||!playing;scene.querySelectorAll('.rw-transfer').forEach((row,i)=>{const track=row.querySelector('.rw-track'),parcel=row.querySelector('.rw-parcel'),available=Math.max(0,track.clientWidth-parcel.offsetWidth),phase=Math.min(1,Math.max(0,(elapsed-(i===0?350:4400))/2400)),p=settled?1:phase,ease=p*p*(3-2*p),mobile=matchMedia('(max-width:750px)').matches;track.style.setProperty('--travel',(mobile?(settled?0:(ease-.5)*12):(i===0?ease:1-ease)*available)+'px');row.classList.toggle('received',p>=.95);});}
  function render(){renderExchange();const beat=reduced?2:elapsed<850?0:elapsed<2100?1:2;panels[current].dataset.beat=beat;progress.style.width=(elapsed/duration*100)+'%';}
  function show(i,restart=false){current=(i+panels.length)%panels.length;elapsed=0;panels.forEach((p,k)=>{p.hidden=k!==current;p.dataset.beat='0';});nav.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===current)));if(restart&&!reduced)playing=true;controls();render();}
  nav.forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));
  button.addEventListener('click',()=>{if(reduced){reduce.checked=false;reduce.dispatchEvent(new Event('change'));}else{playing=!playing;}controls();});
  reduce.addEventListener('change',()=>{reduced=reduce.checked;playing=!reduced;controls();render();});
  motion.addEventListener('change',e=>{reduce.checked=e.matches;reduce.dispatchEvent(new Event('change'));});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;},{threshold:.15}).observe(root);
  function frame(now){const dt=last?Math.min(now-last,100):0;last=now;if(playing&&visible&&!document.hidden){elapsed+=dt;if(elapsed>=duration)show(current+1);else render();}requestAnimationFrame(frame);}
  new ResizeObserver(()=>renderExchange()).observe(root);show(0);requestAnimationFrame(frame);
 });
})();
