(function(){
  const data=window.ART_GLOBAL_POPULATION_MAP;
  if(!data)return;
  const load=(tag,attrs)=>new Promise((resolve,reject)=>{const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e[k]=v);e.onload=resolve;e.onerror=reject;document.head.appendChild(e)});
  function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
  function inject(){
    const old=document.getElementById('globalMapSection'); if(old)old.remove();
    const style=document.createElement('style');style.textContent='.art-map-shell{margin-top:2rem}.art-map-toolbar{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}.art-map-toolbar label{display:flex;gap:.5rem;align-items:center}.art-map-toolbar select,.art-map-toolbar input{background:#10140f;border:1px solid rgba(255,255,255,.16);color:inherit;padding:.7rem .9rem;border-radius:4px}.art-map-toolbar span{margin-left:auto;opacity:.7}.art-global-map{height:70vh;min-height:520px;border:1px solid rgba(255,255,255,.12);border-radius:6px;overflow:hidden;background:#10140f}.art-map-note{margin-top:.9rem;padding:1rem;border-left:2px solid rgba(255,255,255,.2);font-size:.85rem;opacity:.78}.art-map-popup h3{margin:0 0 .35rem}.art-map-popup p{margin:.35rem 0}.leaflet-container{font:inherit}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#11150f;color:#eee}.leaflet-control-zoom a{background:#11150f;color:#eee}';document.head.appendChild(style);
    const section=document.createElement('section');section.id='globalMapSection';section.className='section-pad';section.innerHTML=`<div class="section-heading"><div><span class="section-kicker">10 / THE AFRICAN WORLD</span><h2>Africa is <em>everywhere.</em></h2></div><p class="section-intro">A global city-level map of African, African-descended and Black populations. Zoom from the world to cities; switch between population, diaspora and migration layers.</p></div><div class="art-map-shell"><div class="art-map-toolbar"><label>Layer <select id="artMapLayer"><option value="all">All African world</option><option value="africa">African populations</option><option value="diaspora">African diaspora</option><option value="black">Black populations</option><option value="migration">African-origin migration</option></select></label><input id="artMapSearch" type="search" placeholder="Search city or country…" autocomplete="off"><span id="artMapCount"></span></div><div id="artGlobalMap" class="art-global-map"></div><div class="art-map-note"><strong>Data discipline:</strong> sourced counts are displayed only where a census/source record is attached. Other markers are documented population/community hubs awaiting source import; they are not presented as invented population counts.</div></div>`;
    document.querySelector('main')?.appendChild(section);
    const nav=document.querySelector('.nav'); if(nav&&!nav.querySelector('[href="#globalMapSection"]')){const a=document.createElement('a');a.href='#globalMapSection';a.textContent='Global Map';nav.insertBefore(a,nav.querySelector('[href="#sources"]'));}
  }
  function boot(){
    inject();
    const map=L.map('artGlobalMap',{worldCopyJump:true,minZoom:2,zoomControl:true}).setView([15,0],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
    const groups={all:L.layerGroup().addTo(map),africa:L.layerGroup(),diaspora:L.layerGroup(),black:L.layerGroup(),migration:L.layerGroup()};
    const markers=[];
    data.cities.forEach(c=>{
      const radius=5+(c.tier||1)*2;
      const marker=L.circleMarker([c.lat,c.lng],{radius,weight:1,opacity:.9,fillOpacity:.65});
      const count=c.population?`<p><strong>${esc(c.metric)}</strong> · ${esc(c.year)}</p>`:'<p><strong>Population count:</strong> source import pending</p>';
      marker.bindPopup(`<div class="art-map-popup"><h3>${esc(c.city)}</h3><p>${esc(c.country)}</p><p><strong>Category:</strong> ${esc(data.categories.find(x=>x.id===c.category)?.label||c.category)}</p>${count}<p>${esc(c.metric)}</p><p><strong>Status:</strong> ${esc(c.status)}</p>${c.source?`<p><small>${esc(c.source)}</small></p>`:''}</div>`);
      marker._artData=c;markers.push(marker);groups[c.category].addLayer(marker);groups.all.addLayer(marker);
    });
    const layer=document.getElementById('artMapLayer'),search=document.getElementById('artMapSearch'),count=document.getElementById('artMapCount');
    function render(){const type=layer.value,q=(search.value||'').toLowerCase().trim();Object.values(groups).forEach(g=>map.removeLayer(g));const selected=groups[type]||groups.all;const filtered=markers.filter(m=>{const c=m._artData;return (!q||`${c.city} ${c.country}`.toLowerCase().includes(q))&&(type==='all'||c.category===type)});filtered.forEach(m=>selected.addLayer(m));selected.addTo(map);count.textContent=`${filtered.length} mapped cities`;}
    layer.onchange=render;search.oninput=render;render();
  }
  function start(){load('link',{rel:'stylesheet',href:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'}).then(()=>load('script',{src:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'})).then(boot).catch(()=>{const el=document.getElementById('globalMapSection');if(el)el.querySelector('.art-map-note').textContent='The map library could not be loaded. Population data remains available for the archive integration.';});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
