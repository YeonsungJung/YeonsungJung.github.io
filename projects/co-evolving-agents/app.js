
'use strict';
const $=s=>document.querySelector(s);
const f2=n=>n.toFixed(2);
const gainLabel=n=>(n>=0?'+':'')+n.toFixed(1);
function gainCell(label,base,ours,isAverage=false){
 const gain=ours-base,shade=.035+Math.min(Math.abs(gain)/15,1)*.24;
 return `<td class="${isAverage?'score-average':''}"><div class="score-cell" style="--gain-shade:${shade.toFixed(3)}"><span class="score-mobile-metric">${label.replace(' · ','<br>')}</span><strong class="score-gain">${gainLabel(gain)}</strong><span class="score-pair"><span>${f2(base)}</span><i aria-hidden="true">→</i><b>${f2(ours)}</b></span></div></td>`;
}
function modelName(name){return name.replace('Qwen3.5-','Qwen3.5-<wbr>').replace('Gemma-4-','Gemma-4-<wbr>');}
async function results(){
 try{
 const response=await fetch('data.json');if(!response.ok)throw new Error('Results could not be loaded');const d=await response.json();
 const groups=d.models.map(m=>({model:m.name,icon:m.icon,ours:d.main.find(r=>r.model===m.name&&r.method==='Ours').values,eto:d.main.find(r=>r.model===m.name&&r.method==='ETO').values}));
 const average=(key,col)=>groups.reduce((sum,g)=>sum+g[key][col],0)/groups.length;
 const averageRow={model:'Average',ours:d.columns.map((_,i)=>average('ours',i)),eto:d.columns.map((_,i)=>average('eto',i)),isAverage:true};
 let html='<table class="gain-table"><caption class="sr-only">Task reward: gains over ETO, with both ETO and Ours scores.</caption><thead><tr><th scope="col">Target model</th>'+d.columns.map((c,i)=>`<th scope="col" class="${i===4?'score-average':''}">${c.replace(' · ','<small>')}${c.includes(' · ')?'</small>':''}</th>`).join('')+'</tr></thead><tbody>';
 for(const g of [...groups,averageRow]){html+=`<tr class="${g.isAverage?'score-mean-row':''}"><th scope="row"><div class="score-model">${g.icon?`<img src="assets/icons/${g.icon}.svg" alt="">`:''}<span>${modelName(g.model)}${g.isAverage?'<small>Across three models</small>':''}</span></div></th>`+d.columns.map((c,i)=>gainCell(c,g.eto[i],g.ours[i],i===4)).join('')+'</tr>';}
 $('#main-chart').innerHTML=html+'</tbody></table>';
 const delta=groups.reduce((sum,g)=>sum+g.ours.slice(0,4).reduce((a,v,i)=>a+v-g.eto[i],0),0)/12;$('#overall-gain').textContent=gainLabel(delta);
 for(const kind of ['sampling','ablations']){
 const models=d.models.slice(1),variants=kind==='sampling'?[['SRLM','SRLM'],['Best-of-N','Best-of-N'],['Ours','Ours']]:[['w/o Failure Agent','Positive agent'],['w/o Co-Evolution','Frozen failure agent'],['Ours','Ours']];
 let h='<table class="comparison-table"><caption>Average task reward <span>over four evaluation splits</span></caption><thead><tr><th scope="col">Method</th>'+models.map(m=>`<th scope="col">${modelName(m.name)}</th>`).join('')+'</tr></thead><tbody>';
 for(const [key,label] of variants){h+=`<tr class="${key==='Ours'?'comparison-ours':''}"><th scope="row">${label}</th>`+models.map(m=>{const row=d[kind].find(r=>r.model===m.name&&r.method===key);return `<td>${key==='Ours'?'<strong>':''}${f2(row.values[4])}${key==='Ours'?'</strong>':''}</td>`;}).join('')+'</tr>';}
 $(kind==='sampling'?'#sampling-chart':'#ablation-chart').innerHTML=h+'</tbody></table>';
 }
 }catch(e){$('#main-chart').innerHTML='<p>Results are available in Table 2 of the paper.</p>';console.error(e)}
}
results();
$('#copy-bib').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);$('#copy-bib').innerHTML='<i class="icon copy-icon"></i>Copied';$('#copy-status').textContent='BibTeX copied to clipboard';setTimeout(()=>{$('#copy-bib').innerHTML='<i class="icon copy-icon"></i>Copy BibTeX'},2200)}catch{$('#copy-status').textContent='Select and copy the BibTeX below.'}});
