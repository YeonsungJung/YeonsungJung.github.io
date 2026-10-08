(()=>{
 const copy=[
  ['Offline preparation','Collect answer-flipping pairs.','Keep paired inputs whose final predictions differ.','Original and answer-flipping pairs.'],
  ['Offline preparation','Compute activation differences.','Subtract paired hidden states at the same layer.','One difference vector δᵢ per pair.'],
  ['Offline preparation','Estimate the flip subspace.','Apply SVD to the stacked differences and retain the top-k directions.','A compact basis U.'],
  ['Inference','Gate uncertain decoding steps.','Open the gate when the top-2 next-token margin is small.','Steer or keep the original distribution.'],
  ['Inference','Attenuate the flip component.','Subtract the projection onto U, then recompute the remaining layers.','A steered next-token distribution.']
 ];
 document.querySelectorAll('.fm').forEach(root=>{
  const nav=[...root.querySelectorAll('[data-fm-step]')],scenes=[...root.querySelectorAll('[data-fm-scene]')],play=root.querySelector('.fm-play'),reduce=root.querySelector('[data-fm-reduce]'),phase=root.querySelector('.fm-phase'),title=root.querySelector('.fm-copy h3'),body=root.querySelector('.fm-copy p'),out=root.querySelector('.fm-footer span'),bar=root.querySelector('.fm-progress span');
  const media=matchMedia('(prefers-reduced-motion: reduce)');let current=0,reduced=media.matches,playing=!reduced,elapsed=0,last=0,visible=false;const duration=7600;
  reduce.checked=reduced;
  const syncSvg=()=>root.querySelectorAll('svg[data-fm-animated]').forEach(svg=>{try{if(reduced){svg.pauseAnimations();svg.setCurrentTime(2.35)}else if(playing)svg.unpauseAnimations();else svg.pauseAnimations()}catch(_){}});
  const controls=()=>{root.classList.toggle('is-paused',!playing);root.classList.toggle('is-reduced',reduced);play.textContent=playing?'Pause':'Play';play.setAttribute('aria-label',(playing?'Pause':'Play')+' method walkthrough');syncSvg();};
  const render=()=>bar.style.width=`${Math.min(100,elapsed/duration*100)}%`;
  const show=(i,restart=false)=>{current=(i+scenes.length)%scenes.length;elapsed=0;scenes.forEach((scene,k)=>{const active=k===current;scene.classList.remove('is-active');scene.setAttribute('aria-hidden',String(!active));if(active){const svg=scene.querySelector('svg[data-fm-animated]');if(svg)try{svg.setCurrentTime(reduced?2.35:0)}catch(_){}requestAnimationFrame(()=>scene.classList.add('is-active'));}});nav.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===current)));phase.textContent=copy[current][0];title.textContent=copy[current][1];body.textContent=copy[current][2];out.textContent=copy[current][3];if(restart&&!reduced)playing=true;controls();render();};
  nav.forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));
  play.addEventListener('click',()=>{if(reduced){reduce.checked=false;reduced=false;playing=true}else playing=!playing;controls();});
  reduce.addEventListener('change',()=>{reduced=reduce.checked;playing=!reduced;controls();show(current,false);});
  media.addEventListener('change',e=>{reduce.checked=e.matches;reduce.dispatchEvent(new Event('change'));});
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=0},{threshold:.15}).observe(root);
  const tick=now=>{const dt=last?Math.min(now-last,100):0;last=now;if(playing&&visible&&!document.hidden){elapsed+=dt;if(elapsed>=duration)show(current+1);else render()}requestAnimationFrame(tick)};
  show(0);requestAnimationFrame(tick);
 });
})();
