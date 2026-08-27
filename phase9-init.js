// Phase 9 deep-dive research engine bootstrap.
(function(){
  const d=window.ART_PHASE8;
  if(!d) return;
  window.ART_RESEARCH={
    search:function(q){const s=(q||'').toLowerCase().trim(); if(!s) return d.people||[]; return (d.people||[]).filter(p=>[p.name,p.country,...(p.deepDive?.ideas||[]),...(p.deepDive?.roles||[])].join(' ').toLowerCase().includes(s));},
    person:function(id){return (d.people||[]).find(p=>p.id===id)||null;},
    relationships:function(id){return (d.relationships||[]).filter(r=>r.from===id||r.to===id);},
    tracks:d.researchTracks||[],
    editorial:d.editorial||{}
  };
})();
