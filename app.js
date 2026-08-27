const legacy=window.ART_DATA||{};
const kg=window.ART_KNOWLEDGE||{};
const sourceRegistry=window.ART_SOURCES||{};
const eras=legacy.eras||[];
const types=legacy.types||[];
const events=legacy.events||[];
const people=legacy.people||[];
const regions=legacy.regions||[];
const graphPeople=kg.entities?.people||[];
const graphEvents=kg.entities?.events||[];
const movements=kg.entities?.movements||[];
const relations=kg.entities?.relations||[];
const allPeople=[...people];
graphPeople.forEach(g=>{if(!allPeople.some(p=>p.name===g.name))allPeople.push({name:g.name,country:g.country,years:g.active,era:g.era,idea:g.ideas?.[0]||'',bio:g.summary})});

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let activeType='all',activeEra='all',query='',visible=10;

const eraFilter=$('#eraFilter');
if(eraFilter){eras.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=`${e.years} · ${e.title}`;eraFilter.appendChild(o)});}
const typeFilters=$('#typeFilters');
if(typeFilters){['all',...types].forEach(t=>{const b=document.createElement('button');b.className='filter-chip'+(t==='all'?' active':'');b.dataset.type=t;b.textContent=t==='all'?'All':t;b.onclick=()=>{activeType=t;document.querySelectorAll('.filter-chip').forEach(x=>x.classList.toggle('active',x===b));visible=10;renderTimeline()};typeFilters.appendChild(b)});}
if(eraFilter)eraFilter.onchange=()=>{activeEra=eraFilter.value;visible=10;renderTimeline()};
if($('#searchInput'))$('#searchInput').oninput=e=>{query=e.target.value.trim().toLowerCase();visible=10;renderTimeline()};
if($('#focusSearch'))$('#focusSearch').onclick=()=>{location.hash='#timeline';setTimeout(()=>$('#searchInput')?.focus(),150)};
if($('#loadMore'))$('#loadMore').onclick=()=>{visible+=10;renderTimeline()};

function matchesQuery(e){return !query||[e.title,e.place,e.type,e.summary,...(e.people||[])].join(' ').toLowerCase().includes(query)}
function filteredEvents(){return events.filter(e=>(activeType==='all'||e.type===activeType)&&(activeEra==='all'||e.era===activeEra)&&matchesQuery(e))}
function renderTimeline(){const list=$('#timelineList');if(!list)return;const items=filteredEvents();list.innerHTML=items.slice(0,visible).map(e=>`<article class="timeline-item"><div class="timeline-date">${esc(e.year)}</div><span class="timeline-dot"></span><div class="timeline-card" data-key="${esc(e.title)}"><div class="meta"><span>${esc(e.type)}</span><span>${esc(e.place)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><div class="meta"><span>${(e.people||[]).slice(0,4).map(esc).join(' · ')}</span></div></div></article>`).join('')||`<div class="timeline-card"><h3>No matches found.</h3><p>Try another person, place, event or era.</p></div>`;document.querySelectorAll('.timeline-card[data-key]').forEach(c=>c.onclick=()=>openEvent(c.dataset.key));if($('#loadMore'))$('#loadMore').style.display=items.length>visible?'block':'none'}

function personGraph(name){return graphPeople.find(p=>p.name===name)||graphPeople.find(p=>slug(p.name)===slug(name))}
function personByName(name){return allPeople.find(p=>p.name===name)||allPeople.find(p=>slug(p.name)===slug(name))}
function relationFor(name){const id=personGraph(name)?.id;if(!id)return[];return relations.filter(r=>r.from===id||r.to===id)}
function movementFor(name){const id=personGraph(name)?.id;if(!id)return[];return movements.filter(m=>(m.people||[]).includes(id))}

function renderPeople(){const grid=$('#peopleGrid');if(!grid)return;const featured=['Thomas Sankara','Kwame Nkrumah','Patrice Lumumba','Steve Biko','Nelson Mandela','Amílcar Cabral','Toussaint Louverture','Ibrahim Traoré'];grid.innerHTML=featured.map((name,i)=>{const p=personByName(name)||{};return `<article class="person-card" data-person="${esc(p.name||name)}"><span class="person-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(p.name||name)}</h3><p>${esc(p.country)}</p><div class="person-era">${esc(p.idea)} · ${esc(p.years)}</div></div></article>`}).join('');document.querySelectorAll('.person-card').forEach(c=>c.onclick=()=>openPerson(c.dataset.person))}
function renderEras(){const grid=$('#eraGrid');if(!grid)return;grid.innerHTML=eras.map(e=>`<article class="era-card"><strong>${e.number} / ${esc(e.years)}</strong><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><a class="text-link" href="#timeline" onclick="setEra('${e.id}')">Explore →</a></article>`).join('')}
function renderRegions(){const list=$('#regionList');if(!list)return;list.innerHTML=regions.map(r=>`<div class="region"><div><strong>${esc(r.name)}</strong><br><small>${esc(r.count)}</small></div><span class="text-link">→</span></div>`).join('')}
window.setEra=id=>{activeEra=id;if(eraFilter)eraFilter.value=id;visible=10;renderTimeline();$('#timeline')?.scrollIntoView({behavior:'smooth'})};
function openEvent(title){const e=events.find(x=>x.title===title)||graphEvents.find(x=>x.title===title);if(!e||!$('#dialogContent'))return;const names=(e.people||[]).map(id=>personByName(id)?.name||graphPeople.find(p=>p.id===id)?.name||id);$('#dialogContent').innerHTML=`<div class="dialog-body"><span class="dialog-label">${esc(e.year)} · ${esc(e.type)}</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><div class="dialog-columns"><div><strong>Place</strong><p>${esc(e.place)}</p></div><div><strong>People</strong><p>${names.map(esc).join('<br>')||'Archive connections will be expanded as sourcing continues.'}</p></div></div><div class="archive-note"><strong>Archive status</strong><p>Chronology and interpretation should be read with the source record as it is expanded.</p></div></div>`;$('#detailDialog')?.showModal()}
function openPerson(name){const p=personByName(name)||personGraph(name);if(!p||!$('#dialogContent'))return;const gp=personGraph(p.name);const personId=gp?.id;const relatedEvents=events.filter(e=>(e.people||[]).some(x=>x===p.name||x===personId)).slice(0,8);const rel=relationFor(p.name);const mov=movementFor(p.name);const ideas=gp?.ideas||[p.idea].filter(Boolean);const connections=rel.map(r=>{const otherId=r.from===personId?r.to:r.from;const other=graphPeople.find(x=>x.id===otherId);return other?`${r.type} · ${other.name}`:null}).filter(Boolean);$('#dialogContent').innerHTML=`<div class="dialog-body"><span class="dialog-label">${esc(p.era)} · ${esc(p.years||p.active||'')}</span><h2>${esc(p.name)}</h2><p>${esc(p.bio||p.summary||'')}</p><div class="dialog-columns"><div><strong>Country / region</strong><p>${esc(p.country)}</p><strong>Core ideas</strong><p>${ideas.map(esc).join(' · ')||'To be expanded'}</p>${mov.length?`<strong>Movements</strong><p>${mov.map(m=>esc(m.name)).join('<br>')}</p>`:''}</div><div><strong>Archive connections</strong><p>${connections.join('<br>')||'More relationships will be added as the archive grows.'}</p><strong>Timeline</strong><p>${relatedEvents.map(e=>`${esc(e.year)} — ${esc(e.title)}`).join('<br>')||'Related events will be expanded.'}</p></div></div><div class="archive-note"><strong>Source discipline</strong><p>${esc(sourceRegistry.policy?.rule||'Claims should be traceable to reliable historical evidence.')}</p></div></div>`;$('#detailDialog')?.showModal()}
if($('#dialogClose'))$('#dialogClose').onclick=()=>$('#detailDialog').close();
$('#detailDialog')?.addEventListener('click',e=>{if(e.target===$('#detailDialog'))$('#detailDialog').close()});
renderTimeline();renderPeople();renderEras();renderRegions();
