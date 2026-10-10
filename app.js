'use strict';
// All personal data stays in this site's browser storage. No network requests are used.
const STORAGE_KEY = 'wellnessTracker_v1_private_data';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const enc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const CAT = [
  {id:'breath', name:'Breathing'}, {id:'allergy',name:'Allergies'}, {id:'energy',name:'Energy'},
  {id:'head',name:'Head & mind'}, {id:'circulation',name:'Circulation'}, {id:'pain',name:'Pain'},
  {id:'digestion',name:'Digestion'}, {id:'hormone',name:'Mood & hormones'}
];
let SYMPTOMS = [
  ['breathlessness','Breathlessness','🫁','breath'],['wheezing','Wheezing','🌬️','breath'],['chest-tightness','Chest tightness','🩺','breath'],['cough','Cough','😮‍💨','breath'],['phlegm','Phlegm','💧','breath'],['breath-waking','Night waking (breathing)','🌙','breath'],
  ['blocked-nose','Blocked nose','🤧','allergy'],['sneezing','Sneezing','🌼','allergy'],['itchy-eyes','Itchy eyes','👀','allergy'],['sinus-pain','Sinus / eye pressure','🌸','allergy'],['itchy-skin','Itchy skin','🫧','allergy'],
  ['fatigue','Exhaustion / fatigue','🔋','energy'],['sleepiness','Sleepiness','💤','energy'],['slow-reactions','Slow reactions','🐢','energy'],
  ['headache','Headache','🤕','head'],['brain-fog','Brain fog','🌫️','head'],['heavy-head','Heavy eyes / head','😵','head'],['head-pressure','Head pressure','☁️','head'],
  ['dizziness','Dizziness','💫','circulation'],['palpitations','Palpitations','💓','circulation'],['near-faint','Near fainting','✨','circulation'],['heart-rate-change','Heart rate changes','💗','circulation'],
  ['lower-back-pain','Lower back pain','🦴','pain'],['neck-shoulders','Neck / shoulder pain','💆','pain'],['joint-pain','Joint pain','🦵','pain'],['leg-pain','Heavy / aching legs','🦶','pain'],['foot-pain','Foot pain','👣','pain'],['body-aches','Body aches','🧘','pain'],['upper-back-chest-pain','Upper back / chest pain','❤️‍🩹','pain'],
  ['nausea','Nausea','🤢','digestion'],['bloating','Bloating','🫧','digestion'],['upper-abdominal-pain','Upper abdominal pain','🍃','digestion'],['lower-abdominal-pain','Lower abdominal pain','🌿','digestion'],
  ['low-mood','Low mood / sadness','🌧️','hormone'],['anxiety','Anxiety','🫨','hormone'],['irritability','Irritability','🌩️','hormone'],['cycle-symptoms','Cycle-related symptoms','🌷','hormone']
].map(([id,name,icon,cat])=>({id,name,icon,cat}));
const LEGACY_SYMPTOMS = SYMPTOMS.slice(); // Preserve names for earlier records, even if removed from the new selection.
const INCLUDED_SYMPTOMS = new Set([
  'breathlessness','wheezing','chest-tightness','cough','breath-waking',
  'blocked-nose','sneezing','itchy-eyes','sinus-pain',
  'fatigue','headache','brain-fog',
  'dizziness','palpitations','near-faint',
  'lower-back-pain','neck-shoulders','joint-pain','leg-pain',
  'nausea','bloating','upper-abdominal-pain','lower-abdominal-pain',
  'low-mood'
]);
const STANDARD_SYMPTOMS = SYMPTOMS.filter(s=>INCLUDED_SYMPTOMS.has(s.id));
SYMPTOMS=STANDARD_SYMPTOMS.slice();
const DEFAULT_PINNED=['breathlessness','wheezing','breath-waking','blocked-nose','fatigue','headache','brain-fog','dizziness','palpitations','near-faint','lower-back-pain','nausea','bloating'];
const TRIGGERS=['Pollen','Grass pollen','Tree pollen','Dust','Heat','Cold','Sudden temperature change','Rain / fog','Standing a long time','Walking / activity','Long gap between meals','Work stress','Home stress','Hormonal / cycle changes','Poor sleep','Not enough fluids','Food / meals','Other / unsure'];
const TRIGGER_BY_GROUP = {
  breathing:['Pollen','Dust','Cold','Heat','Sudden temperature change','Rain / fog','Walking / activity','Work stress','Other / unsure'],
  allergy:['Pollen','Grass pollen','Tree pollen','Dust','Sudden temperature change','Other / unsure'],
  circulation:['Heat','Standing a long time','Walking / activity','Long gap between meals','Not enough fluids','Work stress','Home stress','Other / unsure'],
  energy:['Poor sleep','Heat','Walking / activity','Long gap between meals','Work stress','Home stress','Hormonal / cycle changes','Other / unsure'],
  head:['Poor sleep','Heat','Not enough fluids','Pollen','Work stress','Home stress','Hormonal / cycle changes','Other / unsure'],
  pain:['Walking / activity','Standing a long time','Cold','Poor sleep','Hormonal / cycle changes','Other / unsure'],
  digestion:['Food / meals','Long gap between meals','Work stress','Home stress','Hormonal / cycle changes','Other / unsure'],
  mood:['Poor sleep','Work stress','Home stress','Hormonal / cycle changes','Other / unsure']
};
const TRIGGER_GROUP_BY_SYMPTOM = {
  'breathlessness':'breathing','wheezing':'breathing','chest-tightness':'breathing','cough':'breathing','breath-waking':'breathing',
  'blocked-nose':'allergy','sneezing':'allergy','itchy-eyes':'allergy','sinus-pain':'allergy',
  'fatigue':'energy','headache':'head','brain-fog':'head','dizziness':'circulation','palpitations':'circulation','near-faint':'circulation',
  'lower-back-pain':'pain','joint-pain':'pain','leg-pain':'pain',
  'nausea':'digestion','bloating':'digestion','upper-abdominal-pain':'digestion','lower-abdominal-pain':'digestion',
  'low-mood':'mood'
};
const EPISODE_TRIGGERS={
  'Dizziness / near-fainting':'circulation','Palpitations / heartbeat change':'circulation',
  'Breathing / asthma flare':'breathing','Significant pain':'pain',
  'Nausea / digestive flare':'digestion'
};
function triggersForSymptom(s){
 const custom=state?.settings?.customSymptoms?.find(x=>x.id===s.id);
 if(custom && custom.trackTriggers===false)return [];
 const group=TRIGGER_GROUP_BY_SYMPTOM[s.id]||(custom?.trackTriggers?({breath:'breathing',allergy:'allergy',energy:'energy',head:'head',circulation:'circulation',pain:'pain',digestion:'digestion',hormone:'mood'}[s.cat]):null);
 return group?TRIGGER_BY_GROUP[group]||[]:[];
}
const EPISODE_TYPES=['Dizziness / near-fainting','Palpitations / heartbeat change','Breathing / asthma flare','Significant pain','Nausea / digestive flare','Other episode'];
function freshState(){return {version:1,logs:[],settings:{pinned:[...DEFAULT_PINNED],customSymptoms:[]},profile:{notes:'',conditions:[],medications:[],supplements:[]}}}
function readState(){try{const r=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(r && Array.isArray(r.logs)&&r.profile&&Array.isArray(r.profile.conditions)&&Array.isArray(r.profile.medications)&&Array.isArray(r.profile.supplements)&&r.settings&&Array.isArray(r.settings.pinned))return r;}catch(e){console.warn('Stored data could not be read',e)}return freshState()}
function migrateOldFavorites(data){
 const oldDefault=['fatigue','brain-fog','headache','dizziness','palpitations','near-faint','breathlessness','wheezing','chest-tightness','blocked-nose','sinus-pain','lower-back-pain','nausea','bloating','joint-pain','low-mood'];
 const chosen=data?.settings?.pinned;
 if(Array.isArray(chosen)&&chosen.length===oldDefault.length&&chosen.every((id,i)=>id===oldDefault[i])){
   data.settings.pinned=[...DEFAULT_PINNED];return true;
 }
 return false;
}
let state=readState();
if(migrateOldFavorites(state))saveState();
function refreshSymptomCatalog(){SYMPTOMS=[...STANDARD_SYMPTOMS,...(Array.isArray(state.settings.customSymptoms)?state.settings.customSymptoms:[]).filter(s=>s&&typeof s.id==='string'&&typeof s.name==='string'&&CAT.some(c=>c.id===s.cat))]}
refreshSymptomCatalog();
let showAll=false, chosenCat='favourites', searchTerm='', patternDays=30, trendId='fatigue', activePage='today', modalSave=null, chosenRating=null;
const SCORE_MAX = 5;
const scaledScore = (n,scale=10)=>Number(n)*5/(Number(scale)||10);
const scaleOf = (log,field='severity')=>log?.[field+'Scale']||10; // Older entries were rated /10.
const prettyScore = (n)=>Number.isInteger(n)?String(n):n.toFixed(1);
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch(e){alert('This browser could not save your entry. Check your storage settings and export a backup.');return false}}
function localStamp(d=new Date()){const p=v=>String(v).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function displayTime(iso){const d=new Date(iso);return Number.isNaN(+d)?String(iso):d.toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function displayDay(iso){return new Date(iso).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function dayId(iso){const d=new Date(iso);return Number.isNaN(+d)?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function withinDays(log,n){if(n==='all')return true;const d=new Date(log.at);const limit=new Date();limit.setHours(0,0,0,0);limit.setDate(limit.getDate()-(Number(n)-1));return +d>=+limit && +d<=Date.now()+60000}
function symptom(id){return SYMPTOMS.find(s=>s.id===id)||LEGACY_SYMPTOMS.find(s=>s.id===id)||{id,name:id,icon:'🌷',cat:'hormone'}}
function getMedLabel(id){return state.profile.medications.find(m=>m.id===id)?.name || state.profile.supplements.find(m=>m.id===id)?.name || ''}
function toast(message='Entry saved'){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),2100)}
function addLog(log,existingId=null){const entry={...log,id:existingId||uid()};const old=[...state.logs];if(existingId)state.logs=state.logs.map(x=>x.id===existingId?entry:x);else state.logs.push(entry);if(!saveState()){state.logs=old;return false}renderAll();toast(existingId?'Entry updated':'Entry saved');return true}
function go(page){activePage=page;$$('.page').forEach(el=>el.classList.toggle('active',el.id===page));$$('.bottom-nav button').forEach(el=>{el.classList.toggle('active',el.dataset.page===page);if(el.dataset.page===page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'});if(page==='patterns')renderPatterns()}
function renderSymptoms(){const categories=[{id:'favourites',name:'Favourites'}, {id:'all',name:'All'},...CAT];$('#categoryChips').innerHTML=categories.map(c=>`<button type="button" data-cat="${c.id}" class="${chosenCat===c.id?'active':''}">${enc(c.name)}</button>`).join('');let list=SYMPTOMS.filter(s=>!s.archived).filter(s=>chosenCat==='favourites'?state.settings.pinned.includes(s.id):chosenCat==='all'||s.cat===chosenCat);if(chosenCat==='favourites')list.sort((a,b)=>state.settings.pinned.indexOf(a.id)-state.settings.pinned.indexOf(b.id));if(searchTerm)list=list.filter(s=>s.name.toLowerCase().includes(searchTerm.toLowerCase()));$('#symptomGrid').innerHTML=list.map(s=>`<button type="button" class="symptom-tile" data-symptom="${s.id}"><span class="tile-icon ${s.cat}" aria-hidden="true">${s.icon}</span><span class="tile-name">${enc(s.name)}</span></button>`).join('');$('#symptomEmpty').hidden=list.length>0;$('#showAll').textContent=chosenCat==='favourites'?'Show all':'Favourites';$('#symptomSearchWrap').hidden=chosenCat==='favourites';}
function renderToday(){const logs=state.logs.filter(x=>dayId(x.at)===dayId(localStamp()));const distinct=new Set(logs.filter(x=>x.kind==='symptom').map(x=>x.symptomId)).size;$('#todaySummary').innerHTML=`<span class="summary-pill">🌷 ${logs.length} entr${logs.length===1?'y':'ies'} today</span><span class="summary-pill">✨ ${distinct} symptom${distinct===1?'':'s'} logged</span>`;$('#latestList').innerHTML=logs.length?logs.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,10).map(entryHtml).join(''):'<p class="muted">Nothing logged today. There’s no need to record anything unless it feels useful.</p>';}
function summaryOf(log){switch(log.kind){case 'symptom':return `${symptom(log.symptomId).icon} ${symptom(log.symptomId).name}`;case 'episode':return `🩺 ${log.episodeType||'Episode'}`;case 'sleep':return `🌙 Sleep`;case 'medication':return `💊 ${log.medicationName||getMedLabel(log.medicationId)||'Medication'}`;case 'trigger':return '☀️ Trigger / exposure';case 'wellbeing':return '💗 Overall wellbeing';default:return '📝 Note'}}
function subtitleOf(log){const bits=[];if(log.kind==='symptom'||log.kind==='episode')bits.push(log.severity==null?'Severity not rated':`Severity ${log.severity}/${scaleOf(log)}`);if(log.kind==='wellbeing')bits.push(`Wellbeing ${log.value}/${scaleOf(log,'value')}`);if(log.kind==='sleep'){bits.push(`${log.hours||'—'} hours`);if(log.quality!=null)bits.push(`Quality ${log.quality}/${scaleOf(log,'quality')}`);if(log.nightWaking)bits.push('Woke with breathing symptoms')};if(log.kind==='episode'){if(log.duration!=null)bits.push(`${log.duration} min`);if(log.heartRate)bits.push(`Pulse ${log.heartRate} bpm`);if(log.systolic&&log.diastolic)bits.push(`BP ${log.systolic}/${log.diastolic}`);if(log.nightWaking)bits.push('Night waking');if(log.position)bits.push(log.position)}if(log.kind==='medication'&&log.details)bits.push(log.details);if(log.triggers?.length)bits.push(log.triggers.join(', '));if(log.notes)bits.push(log.notes);return bits.map(enc).join(' · ')}
function entryHtml(log){return `<article class="entry"><div class="entry-line"><div><div class="entry-title">${enc(summaryOf(log))}</div><div class="entry-sub">${enc(displayTime(log.at))}</div></div><div class="entry-actions"><button class="mini-btn" data-edit="${enc(log.id)}" type="button" aria-label="Edit entry">Edit</button><button class="mini-btn danger" data-delete="${enc(log.id)}" type="button" aria-label="Delete entry">×</button></div></div>${subtitleOf(log)?`<div class="entry-sub">${subtitleOf(log)}</div>`:''}</article>`}
function renderHistory(){const kind=$('#historyType').value,range=$('#historyRange').value;const matching=state.logs.filter(x=>(kind==='all'||x.kind===kind)&&withinDays(x,range)).sort((a,b)=>b.at.localeCompare(a.at));if(!matching.length){$('#historyList').innerHTML='<p class="muted">No entries in this view yet.</p>';return}let html='',day='';matching.forEach(log=>{const key=dayId(log.at);if(key!==day){day=key;html+=`<div class="timeline-date">${enc(displayDay(log.at))}</div>`}html+=entryHtml(log)});$('#historyList').innerHTML=html}
function renderPatterns(){const logs=state.logs.filter(x=>withinDays(x,patternDays)),syms=logs.filter(x=>x.kind==='symptom'),eps=logs.filter(x=>x.kind==='episode');const distinct=new Set(logs.map(x=>dayId(x.at))).size,aver=syms.length?(syms.reduce((sum,x)=>sum+scaledScore(x.severity,scaleOf(x)),0)/syms.length).toFixed(1):'—';const night=logs.filter(x=>((x.kind==='sleep'||x.kind==='episode')&&x.nightWaking)||(x.kind==='symptom'&&x.symptomId==='breath-waking'&&x.severity>0)).length;const stats=[['Days with entries',`${distinct}`,`of the last ${patternDays} days`],['Symptom ratings',`${syms.length}`,'individual entries'],['Average recorded severity',aver==='—'?aver:`${aver}/5`,'across logged symptoms'],['Detailed episodes',`${eps.length}`,'recorded events'],['Night breathing reports',`${night}`,'entries, not necessarily nights'],['Medicine logs',`${logs.filter(x=>x.kind==='medication').length}`,'recorded entries']];$('#insightCards').innerHTML=stats.map(([label,val,hint])=>`<div class="stat"><small>${enc(label)}</small><strong>${enc(val)}</strong><small>${enc(hint)}</small></div>`).join('');$$('[data-days]').forEach(el=>el.classList.toggle('active',+el.dataset.days===patternDays));let counts={};syms.forEach(x=>counts[x.symptomId]=(counts[x.symptomId]||0)+1);const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);$('#topSymptoms').innerHTML=ranked.length?ranked.slice(0,7).map(([id,n])=>barRow(symptom(id).name,n,ranked[0][1],`${n} log${n===1?'':'s'}`)).join(''):'<p class="muted">Log a few symptoms to see what appears most often.</p>';const triggered={};logs.forEach(x=>(x.triggers||[]).forEach(t=>triggered[t]=(triggered[t]||0)+1));const top=Object.entries(triggered).sort((a,b)=>b[1]-a[1]);$('#topTriggers').innerHTML=top.length?top.slice(0,6).map(([name,n])=>barRow(name,n,top[0][1],`${n} mention${n===1?'':'s'}`)).join(''):'<p class="muted">No triggers recorded in this period.</p>';
 const ids=[...new Set([trendId,...ranked.map(([id])=>id),...DEFAULT_PINNED])].filter(id=>SYMPTOMS.some(x=>x.id===id));$('#trendSymptom').innerHTML=ids.map(id=>`<option value="${enc(id)}" ${id===trendId?'selected':''}>${enc(symptom(id).name)}</option>`).join('');renderTrend();}
function barRow(name,n,max,label){return `<div class="row-bar"><div class="bar-label"><span>${enc(name)}</span><span>${enc(label)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(n/max*100)}%"></div></div></div>`}
function renderTrend(){const now=new Date();now.setHours(0,0,0,0);let days=[];for(let i=patternDays-1;i>=0;i--){let d=new Date(now);d.setDate(d.getDate()-i);days.push(dayId(localStamp(d)))}const best={};state.logs.filter(x=>x.kind==='symptom'&&x.symptomId===trendId).forEach(x=>{const d=dayId(x.at);best[d]=Math.max(best[d]??-1,scaledScore(x.severity,scaleOf(x)))});const used=days.some(d=>d in best);$('#trendGraph').innerHTML=used?`<div class="graph-bars" role="img" aria-label="${enc(symptom(trendId).name)} severity recorded by date over ${patternDays} days"><!-- each bar is an explicitly logged day -->${days.map(d=>{const n=best[d];return `<div class="graph-bar ${n==null?'missing':n>=4?'high':''}" style="height:${n==null?0:Math.max(3,n*20)}%" title="${enc(d)}: ${n==null?'Not logged':prettyScore(n)+'/5'}"></div>`}).join('')}</div><div class="graph-dates"><span>${enc(days[0])}</span><span>${enc(days[days.length-1])}</span></div>`:'<p class="muted">No ratings recorded for this symptom in the selected period.</p>'}
function renderProfile(){const p=state.profile;$('#profileNotes').textContent=p.notes||'No notes yet. Add them here, or import your private starter profile under Data.';const renderList=(items,type,fn)=>items.length?items.map((obj,i)=>`<div class="profile-row"><div><strong>${enc(obj.name)}</strong>${obj.dose?`<p>${enc(obj.dose)}</p>`:''}${obj.detail||obj.notes?`<p>${enc(obj.detail||obj.notes)}</p>`:''}${obj.status==='stopped'?'<p>Previously used · stopped</p>':''}</div><div class="profile-actions"><button type="button" class="mini-btn" data-profile-edit="${type}:${i}">Edit</button><button type="button" class="mini-btn danger" data-profile-delete="${type}:${i}">×</button></div></div>`).join(''):'<p class="muted">No items yet.</p>';$('#conditionList').innerHTML=renderList(p.conditions,'conditions');$('#medicationList').innerHTML=renderList(p.medications,'medications');$('#supplementList').innerHTML=renderList(p.supplements,'supplements');$('#favoritesList').innerHTML=SYMPTOMS.filter(s=>!s.archived).map(s=>`<label><input type="checkbox" data-pin="${s.id}" ${state.settings.pinned.includes(s.id)?'checked':''}>${s.icon} ${enc(s.name)}</label>`).join('');$('#customSymptomsList').innerHTML=(state.settings.customSymptoms||[]).length?`<h3>Added symptoms</h3>${state.settings.customSymptoms.map(s=>`<div class="profile-row"><div><strong>${enc(s.icon||'🌷')} ${enc(s.name)}</strong><p>${enc(CAT.find(c=>c.id===s.cat)?.name||'')}${s.archived?' · Hidden from new entries':''}</p></div><div class="profile-actions"><button class="mini-btn" type="button" data-custom-edit="${enc(s.id)}">Edit</button><button class="mini-btn" type="button" data-custom-archive="${enc(s.id)}">${s.archived?'Restore':'Hide'}</button></div></div>`).join('')}`:''}
function renderAll(){renderSymptoms();renderToday();renderHistory();renderProfile();if(activePage==='patterns')renderPatterns()}
function ratingMarkup(title='Severity',positive=false){
 const hint=positive?'0 = Very poor · 1 = Poor · 2 = Below average · 3 = Okay · 4 = Good · 5 = Very good':'0 = None · 1 = Very mild · 2 = Mild · 3 = Moderate · 4 = Severe · 5 = Extreme';
 return `<div class="rating-header"><strong>${enc(title)} <span aria-hidden="true">(0–5)</span></strong><span class="rating-label" id="ratingResult">Choose a number</span></div><div class="rating-grid" role="group" aria-label="${enc(title)} from zero to five">${Array.from({length:6},(_,n)=>`<button type="button" data-rating="${n}" aria-pressed="false">${n}</button>`).join('')}</div><div class="rating-legend">${hint}</div>`
}
function setRating(value,positive=false){
 chosenRating=value;
 $$('#modal [data-rating]').forEach(b=>{const selected=Number(b.dataset.rating)===value;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});
 const descriptions=positive?['Very poor','Poor','Below average','Okay','Good','Very good']:['None','Very mild','Mild','Moderate','Severe','Extreme'];
 $('#ratingResult').textContent=`${value}/5 · ${descriptions[value]}`;
}
function restoredRating(log,field='severity'){return log?.[field]==null?null:Math.max(0,Math.min(5,Math.round(scaledScore(log[field],scaleOf(log,field)))))}

function inputField(label,id,value='',type='text',attr=''){return `<label class="field">${enc(label)}<input id="${id}" type="${type}" value="${enc(value)}" ${attr}></label>`}
function textField(label,id,value='',rows=3){return `<label class="field">${enc(label)}<textarea id="${id}" rows="${rows}">${enc(value)}</textarea></label>`}
function timeField(existing){return inputField('When?','mDate',existing?.at||localStamp(),'datetime-local','required')}
function triggerMarkup(selected=[],choices=TRIGGERS,always=false){
 if(!choices.length&&!selected.length)return '';
 const options=[...new Set([...choices,...selected])].filter(Boolean);
 return `<details class="trigger-details" ${selected.length||always?'open':''}><summary>Possible triggers <span class="field-hint">(optional)</span>${selected.length?` · ${selected.length} selected`:''}</summary><div class="checkboxes">${options.map(t=>`<label class="check-chip"><input type="checkbox" name="mTrigger" value="${enc(t)}" ${selected.includes(t)?'checked':''}>${enc(t)}</label>`).join('')}</div><p class="muted small">Only select something you think may have contributed. It is fine to leave this blank.</p></details>`;
}
function selectedTriggers(){return $$('#modal input[name="mTrigger"]:checked').map(x=>x.value)}
function refreshEpisodeTriggers(selected=[]){
 const type=$('#mType').value;
 const group=EPISODE_TRIGGERS[type];
 const choices=group?TRIGGER_BY_GROUP[group]:[];
 const host=$('#episodeTriggers');
 host.innerHTML=triggerMarkup(selected,choices);
}

function showModal(html,onSave,edit=false){chosenRating=null;$('#modalContents').innerHTML=html;$('#saveModal').textContent=edit?'Save changes':'Save entry';modalSave=onSave;$('#modal').showModal()}
function requiredRating(){if(chosenRating===null){toast('Choose a number from 0 to 5');return false}return true}
function values(){return {at:$('#mDate').value,notes:$('#mNotes')?.value.trim()||''}}
function openSymptom(symptomId,log){const s=symptom(symptomId);showModal(`<div class="modal-head"><span class="tile-icon ${s.cat}">${s.icon}</span><div><h2 id="modalHeading">${enc(s.name)}</h2><p class="muted">How intense was this symptom?</p></div></div>${ratingMarkup()}${timeField(log)}${triggerMarkup(log?.triggers||[],triggersForSymptom(s))}${textField('A note, if useful (optional)','mNotes',log?.notes||'')}`,()=>{if(!requiredRating()||!$('#mDate').value)return false;return addLog({kind:'symptom',symptomId,severity:chosenRating,severityScale:5,...values(),triggers:selectedTriggers()},log?.id)},!!log);if(log)setRating(restoredRating(log))}
function openEpisode(log){const typ=log?.episodeType||EPISODE_TYPES[0];showModal(`<h2 id="modalHeading">🩺 Detailed episode</h2><p class="muted">For an asthma flare, dizzy spell, heartbeat change or another event you'd like to understand better.</p><label class="field">What happened?<select id="mType">${EPISODE_TYPES.map(x=>`<option ${x===typ?'selected':''}>${enc(x)}</option>`).join('')}</select></label>${ratingMarkup('Severity (optional)')}${timeField(log)}<div class="field-inline">${inputField('Duration (minutes)','mDuration',log?.duration??'','number','min="0" step="1"')}${inputField('Pulse (bpm), if measured','mPulse',log?.heartRate??'','number','min="1" max="250"')}</div><div class="field-inline">${inputField('Blood pressure – top','mSys',log?.systolic??'','number','min="1" max="300"')}${inputField('Blood pressure – bottom','mDia',log?.diastolic??'','number','min="1" max="250"')}</div><label class="field">Position or activity at onset<select id="mPosition"><option value="">Not recorded</option>${['Lying down','Sitting','Standing','Walking / exerting','Getting up','Sleeping / waking','Other'].map(x=>`<option ${log?.position===x?'selected':''}>${enc(x)}</option>`).join('')}</select></label><label class="check-chip" style="margin-top:13px"><input id="mWaking" type="checkbox" ${log?.nightWaking?'checked':''}>Woke from sleep with breathing symptoms</label><div id="episodeTriggers"></div>${textField('Medication or inhaler used, if any','mReliever',log?.relieverUse||'',2)}${textField('What helped / what happened next?','mHelped',log?.helped||'',2)}${textField('Other notes','mNotes',log?.notes||'',2)}`,()=>{if(!$('#mDate').value)return false;const num=id=>$(id).value===''?null:Number($(id).value);return addLog({kind:'episode',episodeType:$('#mType').value,severity:chosenRating,severityScale:5,duration:num('#mDuration'),heartRate:num('#mPulse'),systolic:num('#mSys'),diastolic:num('#mDia'),position:$('#mPosition').value,nightWaking:$('#mWaking').checked,triggers:selectedTriggers(),relieverUse:$('#mReliever').value.trim(),helped:$('#mHelped').value.trim(),...values()},log?.id)},!!log);refreshEpisodeTriggers(log?.triggers||[]);$('#mType').addEventListener('change',()=>refreshEpisodeTriggers(selectedTriggers()));if(log?.severity!=null)setRating(restoredRating(log))}
function openSleep(log){showModal(`<h2 id="modalHeading">🌙 Sleep</h2><p class="muted">Log sleep only when it feels helpful.</p>${timeField(log)}${inputField('Hours of sleep','mHours',log?.hours??'','number','min="0" max="24" step="0.25" required')}${ratingMarkup('Sleep quality (optional)',true)}<label class="check-chip" style="margin-top:14px"><input type="checkbox" id="mWaking" ${log?.nightWaking?'checked':''}>Woke due to breathing symptoms</label>${textField('Notes','mNotes',log?.notes||'')}`,()=>{const hours=Number($('#mHours').value);if($('#mHours').value===''||hours<0||hours>24||!$('#mDate').value)return false;return addLog({kind:'sleep',hours,quality:chosenRating,qualityScale:5,nightWaking:$('#mWaking').checked,...values()},log?.id)},!!log);if(log?.quality!=null)setRating(restoredRating(log,'quality'),true)}
function openMedicationLog(log){const options=[...state.profile.medications.filter(m=>m.status!=='stopped').map(m=>({...m,type:'medications'})),...state.profile.supplements.map(m=>({...m,type:'supplements'}))];const med=log?.medicationId||options[0]?.id||'';showModal(`<h2 id="modalHeading">💊 Medication or supplement</h2><p class="muted">Record what was taken or used; this isn't a reminder to change treatment.</p><label class="field">Which medicine or supplement?<select id="mMed">${options.map(x=>`<option value="${enc(x.id)}" ${x.id===med?'selected':''}>${enc(x.name)}</option>`).join('')}${log?.medicationId&&!options.some(x=>x.id===log.medicationId)?`<option value="${enc(log.medicationId)}" selected>${enc(log.medicationName||'Previous medication')}</option>`:''}</select></label>${timeField(log)}${inputField('Amount / details (optional)','mDetails',log?.details||'','text','placeholder="e.g. one tablet, extra inhaler use"')}${textField('Notes','mNotes',log?.notes||'')}`,()=>{if(!$('#mDate').value||!$('#mMed').value)return false;const id=$('#mMed').value;return addLog({kind:'medication',medicationId:id,medicationName:getMedLabel(id)||log?.medicationName||id,details:$('#mDetails').value.trim(),...values()},log?.id)},!!log)}
function openTrigger(log){showModal(`<h2 id="modalHeading">☀️ Triggers & context</h2><p class="muted">Record environmental, physical or situational factors.</p>${timeField(log)}${triggerMarkup(log?.triggers||[])}${textField('What was happening?','mNotes',log?.notes||'')}`,()=>{if(!$('#mDate').value)return false;const tr=selectedTriggers();if(!tr.length&&!$('#mNotes').value.trim()){toast('Choose a trigger or write a note');return false}return addLog({kind:'trigger',triggers:tr,...values()},log?.id)},!!log)}
function openWellbeing(log){showModal(`<h2 id="modalHeading">💗 Overall wellbeing</h2><p class="muted">Unlike symptom severity, higher numbers here mean you're feeling better.</p>${ratingMarkup('How was your wellbeing?',true)}${timeField(log)}${textField('Notes','mNotes',log?.notes||'')}`,()=>{if(!requiredRating()||!$('#mDate').value)return false;return addLog({kind:'wellbeing',value:chosenRating,valueScale:5,...values()},log?.id)},!!log);if(log?.value!=null)setRating(restoredRating(log,'value'),true)}
function openNote(log){showModal(`<h2 id="modalHeading">📝 Quick note</h2>${timeField(log)}${textField('What would you like to remember?','mNotes',log?.notes||'',5)}`,()=>{if(!$('#mDate').value||!$('#mNotes').value.trim()){toast('Add a note');return false}return addLog({kind:'note',...values()},log?.id)},!!log)}
function openEdit(log){switch(log.kind){case 'symptom':return openSymptom(log.symptomId,log);case 'episode':return openEpisode(log);case 'sleep':return openSleep(log);case 'medication':return openMedicationLog(log);case 'trigger':return openTrigger(log);case 'wellbeing':return openWellbeing(log);default:return openNote(log)}}
function openCustomSymptom(id=null){
 const existing=(state.settings.customSymptoms||[]).find(x=>x.id===id);
 showModal(`<h2 id="modalHeading">${existing?'Edit':'Add'} a symptom</h2><p class="muted">Give it a short name and choose where it belongs.</p>${inputField('Symptom name','cName',existing?.name||'','text','required maxlength="65"')}${inputField('Icon (emoji)','cIcon',existing?.icon||'🌷','text','maxlength="10"')}<label class="field">Category<select id="cCategory">${CAT.map(c=>`<option value="${c.id}" ${existing?.cat===c.id?'selected':''}>${enc(c.name)}</option>`).join('')}</select></label><label class="check-chip" style="margin-top:14px"><input id="cTrackTriggers" type="checkbox" ${existing?.trackTriggers?'checked':''}> Offer category-specific triggers</label><label class="check-chip" style="margin-top:14px"><input id="cPinned" type="checkbox" ${!existing||state.settings.pinned.includes(existing.id)?'checked':''}>Show on Today favourites</label>`,()=>{
 const name=$('#cName').value.trim();if(!name){toast('Enter a symptom name');return false}
 if(SYMPTOMS.some(s=>s.name.toLowerCase()===name.toLowerCase()&&s.id!==id)){toast('That symptom already exists');return false}
 const entry={id:existing?.id||'custom-'+uid(),name,icon:$('#cIcon').value.trim()||'🌷',cat:$('#cCategory').value,trackTriggers:$('#cTrackTriggers').checked,archived:existing?.archived||false};
 if(!Array.isArray(state.settings.customSymptoms))state.settings.customSymptoms=[];
 if(existing)state.settings.customSymptoms=state.settings.customSymptoms.map(s=>s.id===entry.id?entry:s);else state.settings.customSymptoms.push(entry);
 if($('#cPinned').checked)state.settings.pinned=[...new Set([...state.settings.pinned,entry.id])];else state.settings.pinned=state.settings.pinned.filter(x=>x!==entry.id);
 if(!saveState())return false;refreshSymptomCatalog();renderAll();toast('Symptom saved');return true
 },!!existing)
}
function editProfileItem(type,index=null){const labels={conditions:'Condition',medications:'Medicine or HRT',supplements:'Supplement'};const obj=index===null?{}:state.profile[type][index];if(!obj)return;const hasStatus=type==='medications';const details=type==='conditions'?'Background / details':'Dose / timing (confirm with a professional)';showModal(`<h2 id="modalHeading">${index===null?'Add':'Edit'} ${labels[type].toLowerCase()}</h2>${inputField('Name','pName',obj.name||'','text','required')}${type==='conditions'?textField(details,'pDetail',obj.detail||''):inputField(details,'pDose',obj.dose||'')}${type!=='conditions'?textField('Other notes','pNotes',obj.notes||''):''}${hasStatus?`<label class="field">Status<select id="pStatus"><option value="current" ${obj.status!=='stopped'?'selected':''}>Current</option><option value="stopped" ${obj.status==='stopped'?'selected':''}>Stopped / previous</option></select></label>`:''}`,()=>{const name=$('#pName').value.trim();if(!name){toast('Enter a name');return false}const updated={id:obj.id||uid(),name};if(type==='conditions')updated.detail=$('#pDetail').value.trim();else {updated.dose=$('#pDose').value.trim();updated.notes=$('#pNotes').value.trim();if(hasStatus)updated.status=$('#pStatus').value}if(index===null)state.profile[type].push(updated);else state.profile[type][index]=updated;if(!saveState())return false;renderAll();toast('Profile updated');return true},index!==null)}
function editProfileNotes(){showModal(`<h2 id="modalHeading">Health profile notes</h2>${textField('Background, triggers and things to clarify','pNotes',state.profile.notes||'',12)}`,()=>{state.profile.notes=$('#pNotes').value;if(!saveState())return false;renderAll();toast('Profile updated');return true},true)}
function confirmDeleteLog(id){const log=state.logs.find(x=>x.id===id);if(!log||!confirm(`Delete this entry: ${summaryOf(log)}?`))return;state.logs=state.logs.filter(x=>x.id!==id);if(saveState()){renderAll();toast('Entry deleted')}}
function confirmDeleteProfile(type,index){const obj=state.profile[type]?.[index];if(!obj||!confirm(`Remove “${obj.name}” from the health profile? Previous log entries will be kept.`))return;state.profile[type].splice(index,1);if(saveState()){renderAll();toast('Profile updated')}}
function makeCsv(){const headers=['Date/time','Entry type','Item','Severity','Severity scale','Wellbeing/quality','Wellbeing/quality scale','Sleep hours','Duration minutes','Pulse bpm','BP systolic','BP diastolic','Night waking','Position','Triggers','Medication details','What helped','Notes'];const rows=state.logs.slice().sort((a,b)=>a.at.localeCompare(b.at)).map(x=>[x.at,x.kind,x.kind==='symptom'?symptom(x.symptomId).name:x.kind==='medication'?(x.medicationName||getMedLabel(x.medicationId)):x.kind==='episode'?x.episodeType:summaryOf(x),x.severity??'',x.severity==null?'':scaleOf(x),x.value??x.quality??'',x.value!=null?scaleOf(x,'value'):x.quality!=null?scaleOf(x,'quality'):'',x.hours??'',x.duration??'',x.heartRate??'',x.systolic??'',x.diastolic??'',x.nightWaking===undefined?'':x.nightWaking?'Yes':'No',x.position||'',(x.triggers||[]).join('; '),[x.details,x.relieverUse].filter(Boolean).join(' / '),x.helped||'',x.notes||'']);return [headers,...rows].map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n')}
function download(name,contents,type){const blob=new Blob([contents],{type});const link=document.createElement('a');const uri=URL.createObjectURL(blob);link.href=uri;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(uri),1200)}
function appointmentSummary(){const recent=state.logs.filter(x=>withinDays(x,30)).sort((a,b)=>a.at.localeCompare(b.at));const syms=recent.filter(x=>x.kind==='symptom'),eps=recent.filter(x=>x.kind==='episode');const counts={};syms.forEach(x=>{const s=symptom(x.symptomId).name;if(!counts[s])counts[s]={n:0,sum:0,max:0};counts[s].n++;counts[s].sum+=scaledScore(x.severity,scaleOf(x));counts[s].max=Math.max(counts[s].max,scaledScore(x.severity,scaleOf(x)))});const t=Object.entries(counts).sort((a,b)=>b[1].n-a[1].n);let out=`WELLNESS TRACKER — PERSONAL APPOINTMENT SUMMARY\nGenerated: ${new Date().toLocaleString('en-GB')}\nBased on entries from the previous 30 days. Unlogged days do not imply absence of symptoms.
Historic 0–10 ratings are converted to an equivalent 0–5 score for comparison (not rewritten in saved records).\n\nCONDITIONS\n${state.profile.conditions.map(x=>`• ${x.name}${x.detail?' — '+x.detail:''}`).join('\n')}\n\nCURRENT MEDICINES / HRT\n${state.profile.medications.filter(x=>x.status!=='stopped').map(x=>`• ${x.name} — ${x.dose||'Dose not recorded'}${x.notes?' ('+x.notes+')':''}`).join('\n')}\n\nPREVIOUS MEDICINES\n${state.profile.medications.filter(x=>x.status==='stopped').map(x=>`• ${x.name} — ${x.notes||''}`).join('\n')||'None listed'}\n\nSUPPLEMENTS\n${state.profile.supplements.map(x=>`• ${x.name} — ${x.dose||'Dose not recorded'}`).join('\n')}\n\nPROFILE NOTES\n${state.profile.notes}\n\nLAST 30 DAYS\nDays with entries: ${new Set(recent.map(x=>dayId(x.at))).size}\nRecorded symptoms: ${syms.length}\nDetailed episodes: ${eps.length}\n\nMOST LOGGED SYMPTOMS\n${t.map(([s,v])=>`• ${s}: ${v.n} entries; average ${ (v.sum/v.n).toFixed(1) }/5; highest ${prettyScore(v.max)}/5`).join('\n')||'No symptom entries'}\n\nDETAILED EPISODES\n${eps.map(x=>`• ${displayTime(x.at)} — ${x.episodeType}; severity ${x.severity==null?'not rated':x.severity+'/'+scaleOf(x)}; duration ${x.duration??'?'} min; pulse ${x.heartRate??'?'} bpm; BP ${x.systolic??'?'}/${x.diastolic??'?'}; position ${x.position||'not recorded'}; night waking ${x.nightWaking?'yes':'no'}; triggers ${(x.triggers||[]).join(', ')||'none noted'}; medicine ${x.relieverUse||'not recorded'}; helped ${x.helped||'not recorded'}; notes ${x.notes||''}`).join('\n')||'No detailed episodes'}\n\nNIGHT BREATHING REPORTS\n${recent.filter(x=>x.nightWaking||(x.kind==='symptom'&&x.symptomId==='breath-waking'&&x.severity>0)).length} entries marked as night waking / night breathing symptoms (may involve the same night).\n\nRecorded by the person using the app; not a clinical assessment. Medication doses require verification.\n`;return out}
// App event handlers
$$('.bottom-nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$('#todayLabel').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
$('#categoryChips').addEventListener('click',e=>{const btn=e.target.closest('[data-cat]');if(!btn)return;chosenCat=btn.dataset.cat;showAll=chosenCat!=='favourites';if(chosenCat==='favourites'){searchTerm='';$('#symptomSearch').value=''}renderSymptoms()});
$('#showAll').addEventListener('click',()=>{chosenCat=chosenCat==='favourites'?'all':'favourites';showAll=chosenCat!=='favourites';if(!showAll){searchTerm='';$('#symptomSearch').value=''}renderSymptoms()});
$('#symptomSearch').addEventListener('input',e=>{searchTerm=e.target.value;renderSymptoms()});
$('#symptomGrid').addEventListener('click',e=>{const b=e.target.closest('[data-symptom]');if(b)openSymptom(b.dataset.symptom)});
$$('[data-action]').forEach(b=>b.addEventListener('click',()=>({episode:openEpisode,sleep:openSleep,medication:openMedicationLog,trigger:openTrigger,wellbeing:openWellbeing,note:openNote}[b.dataset.action]())));
$('#seeHistory').addEventListener('click',()=>go('history'));
$('#historyType').addEventListener('change',renderHistory);$('#historyRange').addEventListener('change',renderHistory);
['#latestList','#historyList'].forEach(selector=>$(selector).addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){const log=state.logs.find(x=>x.id===edit.dataset.edit);if(log)openEdit(log)}if(del)confirmDeleteLog(del.dataset.delete)}));
$$('[data-days]').forEach(b=>b.addEventListener('click',()=>{patternDays=Number(b.dataset.days);renderPatterns()}));
$('#trendSymptom').addEventListener('change',e=>{trendId=e.target.value;renderTrend()});
$('#downloadSummary').addEventListener('click',()=>download('wellness-appointment-summary.txt',appointmentSummary(),'text/plain;charset=utf-8'));
$('#editProfileNotes').addEventListener('click',editProfileNotes);
$('#addCondition').addEventListener('click',()=>editProfileItem('conditions'));
$('#addMedication').addEventListener('click',()=>editProfileItem('medications'));
$('#addSupplement').addEventListener('click',()=>editProfileItem('supplements'));
['conditions','medications','supplements'].forEach(type=>{const node=$('#'+({conditions:'conditionList',medications:'medicationList',supplements:'supplementList'}[type]));node.addEventListener('click',e=>{const edit=e.target.closest('[data-profile-edit]'),del=e.target.closest('[data-profile-delete]');if(edit)editProfileItem(type,Number(edit.dataset.profileEdit.split(':')[1]));if(del)confirmDeleteProfile(type,Number(del.dataset.profileDelete.split(':')[1]))})});
$('#favoritesList').addEventListener('change',e=>{if(!e.target.matches('[data-pin]'))return;const id=e.target.dataset.pin;state.settings.pinned=e.target.checked?[...new Set([...state.settings.pinned,id])]:state.settings.pinned.filter(x=>x!==id);if(saveState()){renderSymptoms();toast('Quick-log choices updated')}});
$('#addCustomSymptom').addEventListener('click',()=>openCustomSymptom());
$('#customSymptomsList').addEventListener('click',e=>{const edit=e.target.closest('[data-custom-edit]'),archive=e.target.closest('[data-custom-archive]');if(edit)openCustomSymptom(edit.dataset.customEdit);if(archive){const x=(state.settings.customSymptoms||[]).find(s=>s.id===archive.dataset.customArchive);if(!x)return;x.archived=!x.archived;if(x.archived)state.settings.pinned=state.settings.pinned.filter(id=>id!==x.id);if(saveState()){refreshSymptomCatalog();renderAll();toast(x.archived?'Symptom hidden':'Symptom restored')}}});
$('#resetFavorites').addEventListener('click',()=>{state.settings.pinned=[...DEFAULT_PINNED];if(saveState()){renderAll();toast('Favourites reset')}});
$('#modalContents').addEventListener('click',e=>{const b=e.target.closest('[data-rating]');if(b)setRating(+b.dataset.rating,!!$('#modal').querySelector('h2#modalHeading')?.textContent?.includes('wellbeing')||!!$('#modal').querySelector('h2#modalHeading')?.textContent?.includes('Sleep'))});
$('#cancelModal').addEventListener('click',()=>$('#modal').close());
$('#modalForm').addEventListener('submit',e=>{e.preventDefault();if(modalSave?.())$('#modal').close()});
$('#modal').addEventListener('close',()=>{modalSave=null;chosenRating=null});
$('#downloadCsv').addEventListener('click',()=>download('wellness-tracker-log.csv','\ufeff'+makeCsv(),'text/csv;charset=utf-8'));
$('#backupJson').addEventListener('click',()=>download('wellness-tracker-backup-'+dayId(localStamp())+'.json',JSON.stringify({app:'Wellness Tracker',formatVersion:1,exportedAt:new Date().toISOString(),data:state},null,2),'application/json'));
$('#restoreJson').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>10*1024*1024)throw new Error('Backup file is too large.');const doc=JSON.parse(await file.text());const data=doc?.app==='Wellness Tracker'&&doc?.formatVersion===1?doc.data:null;if(!data||!Array.isArray(data.logs)||!data.profile||!Array.isArray(data.profile.conditions)||!Array.isArray(data.profile.medications)||!Array.isArray(data.profile.supplements)||!Array.isArray(data.settings?.pinned))throw new Error('Not a recognised Wellness Tracker backup.');if(data.logs.some(x=>!x||typeof x!=='object'||typeof x.kind!=='string'||typeof x.at!=='string'||Number.isNaN(+new Date(x.at))))throw new Error('Backup contains invalid log entries.');if(confirm('Replace ALL current Wellness Tracker data on this device with this backup? Make a backup of current data first if needed.')){const prev=state;state=data;migrateOldFavorites(state);if(!saveState())state=prev;else{refreshSymptomCatalog();renderAll();toast('Backup restored')}}}catch(err){alert(err.message||'Could not restore this backup.')}finally{e.target.value=''}});
$('#clearData').addEventListener('click',()=>{if(!confirm('This will permanently erase this app’s local records and health profile on this device. Continue?'))return;const answer=prompt('Type DELETE to confirm.');if(answer!=='DELETE')return;const old=state;state=freshState();if(!saveState())state=old;else{refreshSymptomCatalog();chosenCat='favourites';renderAll();go('today');toast('Local data cleared')}});
// PWA installation: same Android WebAPK approach as Life Tracker.
const installBtn=$('#installApp');
const installHeader=$('#installHeader');
const installStatus=$('#installStatus');
let deferredInstallPrompt=null;
function inInstalledApp(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function updateInstallInstructions(){
 const installed=inInstalledApp();
 installBtn.hidden=installed||!deferredInstallPrompt;
 installHeader.hidden=installed||!deferredInstallPrompt;
 installStatus.textContent=installed
  ? 'Installed: Wellness Tracker is running in its own app window.'
  : deferredInstallPrompt
   ? 'Ready to install. Tap Install Wellness Tracker for an app icon and standalone window.'
   : 'On Android, open this website directly in Chrome, then choose Install app in the Chrome menu (⋮). If it is not available, tap Check installation setup below.';
}
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();
 deferredInstallPrompt=event;
 updateInstallInstructions();
});
async function requestAppInstall(){
 if(!deferredInstallPrompt){updateInstallInstructions();return}
 const installPrompt=deferredInstallPrompt;
 deferredInstallPrompt=null;
 updateInstallInstructions();
 try{
  await installPrompt.prompt();
  const choice=await installPrompt.userChoice;
  if(choice?.outcome==='dismissed')installStatus.textContent='Installation cancelled. You can try again from the Chrome menu.';
 }catch(err){installStatus.textContent='Could not start installation. Try Chrome menu (⋮) → Install app.';}
}
installBtn.addEventListener('click',requestAppInstall);
installHeader.addEventListener('click',requestAppInstall);
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallInstructions()});
$('#checkInstall').addEventListener('click',async()=>{
 const box=$('#installChecks');box.hidden=false;box.textContent='Checking installation files…';
 const findings=[];
 let passed=true;
 const add=(ok,label,detail='')=>{findings.push((ok?'✓ ':'✕ ')+label+(detail?' — '+detail:''));if(!ok)passed=false};
 add(location.protocol==='https:'||location.hostname==='localhost', 'Secure HTTPS address', 'Open the published GitHub Pages website, not a downloaded HTML file');
 const link=document.querySelector('link[rel="manifest"]');
 let data;
 try{
  const resp=await fetch(link?.href||'./manifest.webmanifest',{cache:'no-store'});
  if(!resp.ok)throw new Error('HTTP '+resp.status);
  data=await resp.json();
  add(!!(data?.name&&data?.start_url&&data?.display==='standalone'),'Valid app manifest');
 }catch(err){add(false,'Valid app manifest',String(err.message||err))}
 if(data){
  const required=['192x192','512x512'];
  for(const size of required){
   const icon=data.icons?.find(x=>x.sizes===size&&x.purpose!=='maskable');
   if(!icon){add(false,size+' app icon','not in manifest');continue}
   try{
    const url=new URL(icon.src,link.href);
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const type=r.headers.get('content-type')||'';
    if(type.includes('text/html'))throw new Error('Received HTML instead of PNG');
    add(true,size+' app icon');
   }catch(err){add(false,size+' app icon',String(err.message||err))}
  }
 }
 if('serviceWorker' in navigator){
  try{
   const registration=await navigator.serviceWorker.getRegistration('./');
   add(!!registration?.active, 'Offline service worker', registration?.installing?'Still installing — refresh after a moment':registration?.waiting?'Update waiting — close and reopen app':'');
  }catch(err){add(false,'Offline service worker',String(err.message||err))}
 }else add(false,'Offline service worker','Browser does not support service workers');
 box.textContent=findings.join('\n')+(passed?'\nAll installation files look ready. If there is no Install app option, interact with the site, wait briefly, and reopen Chrome.':'\nOne or more checks failed. Make sure all v3 files are uploaded to the GitHub repository root, then refresh.');
});
updateInstallInstructions();
renderAll();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>{console.warn('Wellness Tracker service worker registration failed:',err)}));
}
