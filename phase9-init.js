// Phase 9 deep-dive research engine bootstrap.
(function(){
  const d=window.ART_PHASE8;
  if(!d) return;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const people=d.people||[];
  window.ART_RESEARCH={
    search:function(q){const s=(q||'').toLowerCase().trim(); if(!s) return people; return people.filter(p=>[p.name,p.country,...(p.deepDive?.ideas||[]),...(p.deepDive?.roles||[])].join(' ').toLowerCase().includes(s));},
    person:function(id){return people.find(p=>p.id===id)||null;},
    relationships:function(id){return (d.relationships||[]).filter(r=>r.from===id||r.to===id);},
    tracks:d.researchTracks||[],
    editorial:d.editorial||{}
  };
  function render(q){const el=document.getElementById('researchResults'); if(!el) return; const results=window.ART_RESEARCH.search(q).slice(0,24); el.innerHTML=results.map(p=>{const x=p.deepDive||{};return `<article class="person-card research-result" data-person="${esc(p.id)}"><div class="person-card-body"><span class="section-kicker">${esc(x.country||p.country||'Africa')}</span><h3>${esc(p.name)}</h3><p>${esc((x.roles||[]).join(' · ')||'Historical figure')}</p><div class="person-tags">${(x.ideas||[]).slice(0,3).map(i=>`<span>${esc(i)}</span>`).join('')}</div></div></article>`;}).join('')||'<p>No research nodes found.</p>'; el.querySelectorAll('[data-person]').forEach(card=>card.addEventListener('click',()=>show(card.dataset.person)));}
  function show(id){const p=window.ART_RESEARCH.person(id), el=document.getElementById('dialogContent'), dlg=document.getElementById('detailDialog'); if(!p||!el||!dlg)return; const x=p.deepDive||{}, rel=window.ART_RESEARCH.relationships(id); el.innerHTML=`<p class="section-kicker">RESEARCH NODE</p><h2>${esc(p.name)}</h2><p>${esc(x.country||p.country||'')}</p><p><strong>${esc(x.birth||'')} ${x.death?'— '+esc(x.death):''}</strong></p><h3>Roles</h3><p>${esc((x.roles||[]).join(' · ')||'—')}</p><h3>Ideas</h3><p>${esc((x.ideas||[]).join(' · ')||'—')}</p><h3>Documents</h3><p>${esc((x.documents||[]).join(' · ')||'—')}</p><h3>Relationships</h3><p>${rel.length?rel.map(r=>esc(r.type)+': '+esc(r.note)).join('<br>'):'No relationship records yet.'}</p><p><small>Editorial status: research records are subject to the archive's source and editorial rules.</small></p>`; dlg.showModal();}
  document.addEventListener('DOMContentLoaded',()=>{const input=document.getElementById('researchSearch'); if(input){input.addEventListener('input',e=>render(e.target.value)); render('');} const close=document.getElementById('dialogClose'); if(close) close.addEventListener('click',()=>document.getElementById('detailDialog')?.close());});
})();
