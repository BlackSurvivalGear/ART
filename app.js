const legacy=window.ART_DATA||{};
const kg=window.ART_KNOWLEDGE||{};
const phase3=window.ART_PHASE3||{};
const sourceRegistry=window.ART_SOURCES||{};
const eras=legacy.eras||[];
const types=legacy.types||[];
const events=legacy.events||[];
const people=legacy.people||[];
const regions=legacy.regions||[];
const graphPeople=kg.entities?.people||[];
const graphEvents=kg.entities?.events||[];
const graphMovements=kg.entities?.movements||[];
const relations=kg.entities?.relations||[];
const archivePeople=phase3.people||[];
const archiveEvents=phase3.events||[];
const archiveMovements=phase3.movements||[];
const archiveSources=phase3.sources||[];
const allPeople=[...people];
[...graphPeople.map(g=>({name:g.name,country:g.country,years:g.active,era:g.era,idea:g.ideas?.[0]||'',bio:g.summary,id:g.id})),...archivePeople.map(g=>({name:g.name,country:g.place,years:g.active,era:'Phase 3 archive',idea:g.ideas?.[0]||'',bio:g.summary,id:g.id}))].forEach(g=>{if(!allPeople.some(p=>p.name===g.name))allPeople.push(g)});
const allEvents=[...events];
[...graphEvents,...archiveEvents.map(e=>({...e,type:'Archive',era:'archive',people:(e.people||[]).map(id=>(archivePeople.find(p=>p.id===id)||{}).name||id),sourceId:e.id}))].forEach(e=>{if(!allEvents.some(x=>x.title===e.title))allEvents.push(e)});
const allMovements=[...graphMovements,...archiveMovements].filter((m,i,a)=>a.findIndex(x=>x.id===m.id)===i);

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let activeType='all',activeEra='all',query='',visible=10;

const eraFilter=$('#eraFilter');
if(eraFilter){[...eras,...([{id:'archive',years:'700–1900',title:'Early & Diaspora Archive'}])].forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=`${e.years} · ${e.title}`;eraFilter.appendChild(o)});}
const typeFilters=$('#typeFilters');
if(typeFilters){const filterTypes=[...types,'Archive'];['all',...filterTypes.filter((x,i,a)=>a.indexOf(x)===i)].forEach(t=>{const b=document.createElement('button');b.className='filter-chip'+(t==='all'?' active':'');b.dataset.type=t;b.textContent=t==='all'?'All':t;b.onclick=()=>{activeType=t;document.querySelectorAll('.filter-chip').forEach(x=>x.classList.toggle('active',x===b));visible=10;renderTimeline()};typeFilters.appendChild(b)});}
if(eraFilter)eraFilter.onchange=()=>{activeEra=eraFilter.value;visible=10;renderTimeline()};
if($('#searchInput'))$('#searchInput').oninput=e=>{query=e.target.value.trim().toLowerCase();visible=10;renderTimeline()};
if($('#focusSearch'))$('#focusSearch').onclick=()=>{location.hash='#timeline';setTimeout(()=>$('#searchInput')?.focus(),150)};
if($('#loadMore'))$('#loadMore').onclick=()=>{visible+=10;renderTimeline()};

function matchesQuery(e){return !query||[e.title,e.place,e.type,e.summary,...(e.people||[])].join(' ').toLowerCase().includes(query)}
function filteredEvents(){return allEvents.filter(e=>(activeType==='all'||e.type===activeType)&&(activeEra==='all'||e.era===activeEra)&&matchesQuery(e))}
function renderTimeline(){const list=$('#timelineList');if(!list)return;const items=filteredEvents();list.innerHTML=items.slice(0,visible).map(e=>`<article class="timeline-item"><div class="timeline-date">${esc(e.year)}</div><span class="timeline-dot"></span><div class="timeline-card" data-key="${esc(e.title)}"><div class="meta"><span>${esc(e.type)}</span><span>${esc(e.place)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><div class="meta"><span>${(e.people||[]).slice(0,5).map(id=>personByName(id)?.name||id).map(esc).join(' · ')}</span></div></div></article>`).join('')||`<div class="timeline-card"><h3>No matches found.</h3><p>Try another person, place, event, movement or era.</p></div>`;document.querySelectorAll('.timeline-card[data-key]').forEach(c=>c.onclick=()=>openEvent(c.dataset.key));if($('#loadMore'))$('#loadMore').style.display=items.length>visible?'block':'none'}

function personGraph(name){return graphPeople.find(p=>p.name===name)||graphPeople.find(p=>slug(p.name)===slug(name))||archivePeople.find(p=>p.name===name)||archivePeople.find(p=>slug(p.name)===slug(name))}
function personByName(name){return allPeople.find(p=>p.name===name)||allPeople.find(p=>slug(p.name)===slug(name))||personGraph(name)}
function personId(name){return personGraph(name)?.id}
function relationFor(name){const id=personId(name);if(!id)return[];return relations.filter(r=>r.from===id||r.to===id)}
function movementFor(name){const id=personId(name);const nameValue=personGraph(name)?.name||name;return allMovements.filter(m=>(m.people||[]).includes(id)||(m.people||[]).includes(nameValue))}
function relatedArchiveEvents(name){const p=personGraph(name);return archiveEvents.filter(e=>(e.people||[]).includes(p?.id))}
function statusForEvent(e){return phase3.sourceStatus?.[e.id]||sourceRegistry.claims?.find(c=>c.entity===e.id)?.status||'Contextual'}

function renderPeople(){const grid=$('#peopleGrid');if(!grid)return;const featured=['Thomas Sankara','Kwame Nkrumah','Patrice Lumumba','Steve Biko','Nelson Mandela','Amílcar Cabral','Toussaint Louverture','Ibrahim Traoré','Yaa Asantewaa','Samori Touré','Rei Amador','Kafuxi Ambari'];grid.innerHTML=featured.map((name,i)=>{const p=personByName(name)||{};return `<article class="person-card" data-person="${esc(p.name||name)}"><span class="person-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(p.name||name)}</h3><p>${esc(p.country)}</p><div class="person-era">${esc(p.idea)} · ${esc(p.years)}</div></div></article>`}).join('');document.querySelectorAll('.person-card').forEach(c=>c.onclick=()=>openPerson(c.dataset.person))}
function renderEras(){const grid=$('#eraGrid');if(!grid)return;grid.innerHTML=eras.map(e=>`<article class="era-card"><strong>${e.number} / ${esc(e.years)}</strong><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><a class="text-link" href="#timeline" onclick="setEra('${e.id}')">Explore →</a></article>`).join('')}
function renderMovementGrid(){const grid=$('#movementGrid');if(!grid)return;grid.innerHTML=allMovements.map(m=>`<article class="movement-card" data-movement="${esc(m.id)}"><strong>${esc(m.period||'Archive')}</strong><h3>${esc(m.name)}</h3><p>${esc(m.summary||'')}</p><div class="movement-meta">${(m.ideas||[]).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div></article>`).join('');document.querySelectorAll('.movement-card').forEach(c=>c.onclick=()=>openMovement(c.dataset.movement))}
function renderRegions(){const list=$('#regionList');if(!list)return;list.innerHTML=regions.map(r=>`<div class="region"><div><strong>${esc(r.name)}</strong><br><small>${esc(r.count)}</small></div><span class="text-link">→</span></div>`).join('')}
window.setEra=id=>{activeEra=id;if(eraFilter)eraFilter.value=id;visible=10;renderTimeline();$('#timeline')?.scrollIntoView({behavior:'smooth'})};

function sourceRows(ids){const rows=ids.map(id=>archiveSources.find(s=>s.id===id)||sourceRegistry.sources?.find(s=>s.id===id)).filter(Boolean);return rows.length?`<div class="source-list">${rows.map(s=>`<div class="source-row"><strong>${esc(s.title)}</strong><small>${esc(s.publisher)} · ${esc(s.kind||s.type||'Source')}</small>${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener">Open source →</a>`:''}</div>`).join('')}</div>`:'<p class="archive-note">Source records are being added progressively. This entry is not presented as fully sourced yet.</p>'}
function openEvent(title){const e=allEvents.find(x=>x.title===title);if(!e||!$('#dialogContent'))return;const ids=e.people||[];const names=ids.map(id=>personByName(id)?.name||graphPeople.find(p=>p.id===id)?.name||archivePeople.find(p=>p.id===id)?.name||id);const sourceMatches=archiveSources.filter(s=>(s.supports||[]).includes(e.id)||s.supports?.some(x=>x===e.movement||x===e.title));const sourceIds=sourceMatches.map(s=>s.id);$('#dialogContent').innerHTML=`<div class="dialog-body"><span class="dialog-label">${esc(e.year)} · ${esc(e.type)} · ${esc(statusForEvent(e))}</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><div class="detail-grid"><div class="detail-box"><strong>Place</strong><span>${esc(e.place)}</span></div><div class="detail-box"><strong>People</strong><span>${names.map(esc).join(', ')||'To be expanded'}</span></div><div class="detail-box"><strong>Archive status</strong><span>${esc(statusForEvent(e))}</span></div></div><div class="archive-note"><strong>Source record</strong>${sourceRows(sourceIds)}</div></div>`;$('#detailDialog')?.showModal()}
function openMovement(id){const m=allMovements.find(x=>x.id===id);if(!m||!$('#dialogContent'))return;const pNames=(m.people||[]).map(id=>personByName(id)?.name||id);const e=allEvents.filter(x=>x.movement===id||x.movement===m.id);$('#dialogContent').innerHTML=`<div class="dialog-body"><span class="dialog-label">${esc(m.period)} · ${esc(m.region||'')}</span><h2>${esc(m.name)}</h2><p>${esc(m.summary)}</p><div class="dialog-columns"><div><strong>Ideas</strong><p>${(m.ideas||[]).map(esc).join(' · ')||'To be expanded'}</p><strong>People</strong><p>${pNames.map(esc).join('<br>')||'Connections will be expanded.'}</p></div><div><strong>Events</strong><p>${e.map(x=>`${esc(x.year)} — ${esc(x.title)}`).join('<br>')||'Related events will be expanded.'}</p></div></div></div>`;$('#detailDialog')?.showModal()}
function openPerson(name){const p=personByName(name)||personGraph(name);if(!p||!$('#dialogContent'))return;const gp=personGraph(p.name);const pId=gp?.id;const relatedEvents=[...events.filter(e=>(e.people||[]).some(x=>x===p.name||x===pId)),...relatedArchiveEvents(p.name).map(x=>({...x,type:'Archive',place:x.place}))].filter((e,i,a)=>a.findIndex(x=>x.title===e.title)===i).slice(0,10);const rel=relationFor(p.name);const mov=movementFor(p.name);const ideas=gp?.ideas||p.ideas||[p.idea].filter(Boolean);const connections=rel.map(r=>{const otherId=r.from===pId?r.to:r.from;const other=graphPeople.find(x=>x.id===otherId)||archivePeople.find(x=>x.id===otherId);return other?`${r.type} · ${other.name}`:null}).filter(Boolean);const sourceClaims=(phase3.sourceStatus||{});const archiveCount=relatedArchiveEvents(p.name).length;$('#dialogContent').innerHTML=`<div class="dialog-body"><span class="dialog-label">${esc(p.era)} · ${esc(p.years||p.active||'')}</span><h2>${esc(p.name)}</h2><p>${esc(p.bio||p.summary||'')}</p><div class="detail-grid"><div class="detail-box"><strong>Country / place</strong><span>${esc(p.country||p.region||'')}</span></div><div class="detail-box"><strong>Core ideas</strong><span>${ideas.map(esc).join(' · ')||'To be expanded'}</span></div><div class="detail-box"><strong>Archive links</strong><span>${relatedEvents.length+archiveCount}</span></div></div><div class="dialog-columns"><div><strong>Movements</strong><p>${mov.map(m=>esc(m.name)).join('<br>')||'More movement connections will be added.'}</p><strong>Relationships</strong><p>${connections.join('<br>')||'More relationships will be added as the archive grows.'}</p></div><div><strong>Timeline</strong><p>${relatedEvents.map(e=>`${esc(e.year)} — ${esc(e.title)}`).join('<br>')||'Related events will be expanded.'}</p></div></div><div class="archive-note"><strong>Source discipline</strong><p>${esc(sourceRegistry.policy?.rule||'Claims should be traceable to reliable historical evidence.')}</p><div class="archive-status">${Object.keys(sourceClaims).length?`${Object.keys(sourceClaims).length} sourced-status records in Phase 3`:''}</div></div></div>`;$('#detailDialog')?.showModal()}
if($('#dialogClose'))$('#dialogClose').onclick=()=>$('#detailDialog').close();
$('#detailDialog')?.addEventListener('click',e=>{if(e.target===$('#detailDialog'))$('#detailDialog').close()});
renderTimeline();renderPeople();renderEras();renderMovementGrid();renderRegions();
