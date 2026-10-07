(() => {
 'use strict';
 const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={"alltag-familie":"Familie","alltag-essen":"Essen & Trinken","alltag-hobbys":"Hobbys & Freizeit","alltag-schule":"Schule & Lernen","alltag-einkaufen":"Einkaufen","alltag-reisen":"Reisen & Unterwegs",'verben-konjugation':'Verben & Konjugation','artikel-nomen':'Artikel & Nomen','adjektive':'Adjektive','pronomen':'Pronomen','verneinungen':'Verneinungen','fragen':'Fragen bilden','praepositionen':'Präpositionen','conditionnel':'Conditionnel','passe-compose':'Passé composé','imparfait':'Imparfait','futur-simple':'Futur simple','unregelmaessige-verben':'Unregelmässige Verben','subjonctif':'Subjonctif','15-Minuten-Einheit':'15-Minuten-Einheit'};
 const availableFiles=new Set(["franzoesisch-alltag-familie-1-oberstufe.html","franzoesisch-alltag-familie-2-oberstufe.html","franzoesisch-alltag-familie-3-oberstufe.html","franzoesisch-alltag-essen-1-oberstufe.html","franzoesisch-alltag-essen-2-oberstufe.html","franzoesisch-alltag-essen-3-oberstufe.html","franzoesisch-alltag-hobbys-1-oberstufe.html","franzoesisch-alltag-hobbys-2-oberstufe.html","franzoesisch-alltag-hobbys-3-oberstufe.html","franzoesisch-alltag-schule-1-oberstufe.html","franzoesisch-alltag-schule-2-oberstufe.html","franzoesisch-alltag-schule-3-oberstufe.html","franzoesisch-alltag-einkaufen-1-oberstufe.html","franzoesisch-alltag-einkaufen-2-oberstufe.html","franzoesisch-alltag-einkaufen-3-oberstufe.html","franzoesisch-alltag-reisen-1-oberstufe.html","franzoesisch-alltag-reisen-2-oberstufe.html","franzoesisch-alltag-reisen-3-oberstufe.html","franzoesisch-theorie-adjektive.html", "franzoesisch-fragen-1-oberstufe.html", "franzoesisch-pruefung-2-oberstufe.html", "franzoesisch-verneinungen-2-oberstufe.html", "franzoesisch-verneinungen-3-oberstufe.html", "franzoesisch-verben-konjugation-3-oberstufe-mit-gemischten-schreibuebungen.html", "franzoesisch-subjonctif-1-oberstufe.html", "franzoesisch-futur-simple-3-oberstufe.html", "franzoesisch-theorie-fragen.html", "franzoesisch-praepositionen-1-oberstufe.html", "franzoesisch-subjonctif-2-oberstufe.html", "franzoesisch-theorie-passe-compose.html", "franzoesisch-pruefung-3-oberstufe.html", "franzoesisch-artikel-nomen-1-oberstufe.html", "franzoesisch-theorie-futur-simple.html", "franzoesisch-verneinungen-1-oberstufe.html", "franzoesisch-theorie-artikel-nomen.html", "franzoesisch-pronomen-3-oberstufe.html", "franzoesisch-artikel-nomen-3-oberstufe.html", "franzoesisch-subjonctif-3-oberstufe.html", "franzoesisch-conditionnel-2-oberstufe.html", "franzoesisch-vokabeltrainer.html", "franzoesisch-theorie-conditionnel.html", "franzoesisch-15-minuten-lerneinheit-aktiv.html", "franzoesisch-15-minuten-lerneinheit.html", "franzoesisch-adjektive-3-oberstufe.html", "franzoesisch-passe-compose-3-oberstufe.html", "franzoesisch-pruefung-1-oberstufe.html", "franzoesisch-unregelmaessige-verben-liste.html", "franzoesisch-theorie-unregelmaessige-verben.html", "franzoesisch-unregelmaessige-verben-2-oberstufe.html", "franzoesisch-pronomen-2-oberstufe.html", "franzoesisch-verben-konjugation-1-oberstufe-mit-gemischten-schreibuebungen.html", "franzoesisch-artikel-nomen-2-oberstufe.html", "franzoesisch-fragen-2-oberstufe.html", "franzoesisch-adjektive-1-oberstufe.html", "franzoesisch-conditionnel-3-oberstufe.html", "franzoesisch-futur-simple-2-oberstufe.html", "franzoesisch-praepositionen-2-oberstufe.html", "franzoesisch-theorie-verneinungen.html", "franzoesisch-conditionnel-1-oberstufe.html", "franzoesisch-unregelmaessige-verben-3-oberstufe.html", "franzoesisch-passe-compose-1-oberstufe.html", "franzoesisch-theorie-verben-konjugation.html", "franzoesisch-fragen-3-oberstufe.html", "index.html", "franzoesisch-theorie-imparfait.html", "franzoesisch-theorie-pronomen.html", "franzoesisch-theorie-praepositionen.html", "franzoesisch-pronomen-1-oberstufe.html", "franzoesisch-futur-simple-1-oberstufe.html", "franzoesisch-unregelmaessige-verben-1-oberstufe.html", "franzoesisch-adjektive-2-oberstufe.html", "franzoesisch-verben-konjugation-2-oberstufe-mit-gemischten-schreibuebungen.html", "franzoesisch-theorie-subjonctif.html", "franzoesisch-passe-compose-2-oberstufe.html", "franzoesisch-praepositionen-3-oberstufe.html", "main.html"]);
 const catalogue=new Map();
 function addExercise(link,label){
  const url=new URL(link.getAttribute('href'),location.href);
  if(url.origin!==location.origin)return;
  const file=url.pathname.split('/').pop();
  if(!availableFiles.has(file))return;
  catalogue.set(file,{file,label});
 }
 document.querySelectorAll('#Spi .topic-card').forEach(card=>{
  const topic=card.querySelector('h3')?.textContent.trim();
  card.querySelectorAll('.level-btn').forEach(link=>addExercise(link,topic+' · '+link.textContent.trim()));
 });
 document.querySelectorAll('a[href*="15-minuten-lerneinheit"]').forEach(link=>addExercise(link,'Deine 15-Minuten-Lerneinheit'));
 function findExercise(file){
  const exact=catalogue.get(file);if(exact)return exact;
  // Older records may omit the extra filename suffix used by Verben & Konjugation.
  const canonical=String(file||'').replace(/-mit-gemischten-schreibuebungen(?=\.html$)/,'');
  return [...catalogue.values()].find(e=>e.file.replace(/-mit-gemischten-schreibuebungen(?=\.html$)/,'')===canonical)||null;
 }
 function practiceLink(p){
  const exercise=findExercise(p.file);if(!exercise)return '';
  const unit=exercise.file.includes('15-minuten-lerneinheit');
  const ids=[...new Set((p.ids||[]).map(String).filter(id=>/^\d+$/.test(id)))].slice(0,10);
  const url=new URL(exercise.file,location.href);
  if(!unit&&ids.length)url.searchParams.set('review_ids',ids.join(','));
  const href=exercise.file+url.search;
  return `<a class="btn-smart fa-practice" href="${esc(href)}">${esc(exercise.label)}${unit?'':` · ${ids.length} Aufgaben wiederholen`}</a>`;
 }
 const title=key=>{
  if(names[key])return names[key];
  if(String(key).startsWith('fr_exam_'))return 'Gesamtprüfung · Niveau '+(String(key).match(/\d+/)?.[0]||'');
  if(key==='fr_unit_15')return 'Deine 15-Minuten-Lerneinheit';
  const file=String(key).replace(/^fr_/,'').replace(/_/g,'-')+'.html';
  return findExercise(file)?.label||String(key).replace(/^fr_franzoesisch_/,'').replace(/_[123]_oberstufe.*$/,'').replace(/_/g,' ');
 };
 let generation=0,actor=null;
 function basic(){
  if(!window.FRLearning)return;
  const current=FRLearning.account;
  if(actor!==current){actor=current;generation++;$('analysisDetail').replaceChildren();$('analysisStatus').textContent='';$('analysisRefresh').disabled=false;}
  const s=FRLearning.summary(),entries=Object.entries(s.modules||{}).filter(([,m])=>m.answered>0).map(([key,m])=>{
   const topic=key.replace(/^fr_franzoesisch_/,'').replace(/_[123]_oberstufe.*$/,'').replace(/_/g,'-');
   return {label:findExercise(key.replace(/^fr_/,'').replace(/_/g,'-')+'.html')?.label||(key.startsWith('fr_exam_')||key==='fr_unit_15'?title(key):title(topic)+' · Niveau '+(key.match(/_([123])_oberstufe/)?.[1]||'?')),n:m.answered,wrong:m.answered-m.correct};
  }).sort((a,b)=>b.wrong/Math.max(1,b.n)-a.wrong/Math.max(1,a.n));
  $('analysisBasic').innerHTML=entries.length?entries.slice(0,6).map(e=>`<div class="fa-topic"><div><strong>${esc(e.label)}</strong><p>${e.wrong} von ${e.n} Antworten falsch${e.n<5?' · noch wenige Daten':''}</p></div><span>${Math.round((e.n-e.wrong)/e.n*100)} % richtig</span></div>`).join(''):'<p class="fa-muted">Noch keine Antworten gespeichert. Bearbeite zuerst eine Übung.</p>';
  $('analysisAccount').textContent=current==='guest'?'Gastmodus: Die Themenübersicht verwendet den Fortschritt auf diesem Gerät. Für die Detailanalyse bitte anmelden.':'Die Analyse gehört zu deinem angemeldeten Konto.';
 }
 function exerciseForTopic(t){
  for(const p of t.practice||[]){const e=findExercise(p.file);if(e&&!e.file.includes('15-minuten'))return {...e,ids:p.ids||[]};}
  const byKey=findExercise(String(t.topic).replace(/^fr_/,'').replace(/_/g,'-')+'.html');
  if(byKey)return {...byKey,ids:[]};
  const matching=[...catalogue.values()].filter(e=>e.label.split(' · ')[0]===title(t.topic));
  const stats=FRLearning.summary().modules||{};
  return matching.sort((a,b)=>{
   const n=e=>stats['fr_'+e.file.replace('.html','').replace(/-/g,'_')]?.answered||0;
   return n(b)-n(a)||a.label.localeCompare(b.label);
  })[0]||null;
 }
 function directButton(e,text,ids=[]){
  if(!e)return '';
  const valid=[...new Set(ids.map(String).filter(x=>/^\d+$/.test(x)))].slice(0,10);
  const url=new URL(e.file,location.href);
  if(valid.length)url.searchParams.set('review_ids',valid.join(','));
  return `<a class="btn-smart fa-practice" href="${esc(e.file+url.search)}">${esc(text)}: ${esc(e.label)}</a>`;
 }
 function makePlan(d){
  const candidates=d.topics.filter(t=>t.wrong>0).map(t=>({t,e:exerciseForTopic(t)})).filter(x=>x.e&&!x.e.file.includes('15-minuten'));
  const first=candidates[0];
  if(!first){
   const studied=Object.entries(FRLearning.summary().modules||{}).sort((a,b)=>(b[1].answered||0)-(a[1].answered||0)).map(([key])=>findExercise(key.replace(/^fr_/,'').replace(/_/g,'-')+'.html')).find(Boolean);
   const e=studied||[...catalogue.values()].find(x=>x.label.endsWith('Niveau 1'));
   return e?[{e,title:'Deinen Lernstand prüfen',body:'Löse fünf Aufgaben ohne Hilfe. Daraus entsteht dein persönlicher Schwerpunkt.',ids:[]},{e,title:'Unsichere Antworten wiederholen',body:'Erkläre nach jeder falschen Antwort die richtige Lösung in eigenen Worten und übe weiter.',ids:[]},{e,title:'Nochmals selbst lösen',body:'Starte eine neue Runde. Ziel: mindestens vier von fünf Antworten richtig. Aktualisiere danach die Analyse.',ids:[]}]:[];
  }
  const second=candidates.find(x=>x.e.file!==first.e.file)||first;
  return [{e:first.e,title:'Deinen grössten Schwerpunkt üben',body:`${first.e.label}: ${first.t.wrong} von ${first.t.recent} zuletzt beantworteten Aufgaben falsch. Löse die vorgeschlagenen Aufgaben und lies die Erklärung nach jedem Fehler.`,ids:first.e.ids||[]},
   {e:second.e,title:second===first?'Dasselbe Thema festigen':'Den nächsten Schwerpunkt festigen',body:second===first?'Löse eine neue Runde ohne Hilfe. Sprich oder schreibe die richtige Regel nach jedem Fehler in eigenen Worten auf.':`${second.e.label}: Übe dieses Thema als Nächstes. Nimm dir fünf bis zehn Aufgaben vor.`,ids:[]},
   {e:first.e,title:'Deinen Fortschritt überprüfen',body:'Löse erneut fünf Aufgaben ohne Hilfe. Ziel: mindestens vier richtig. Aktualisiere danach die Fehleranalyse; dein Plan wird aus deinen neuen Antworten erstellt.',ids:[]}];
 }
 function render(d){
  const plan=makePlan(d),weak=d.topics.filter(t=>t.wrong>0);
  let html='<div class="fa-summary"><h4>'+(weak.length?'Das solltest du als Nächstes üben':'Dein nächster Lernschritt')+'</h4>';
  if(weak.length){const t=weak[0],e=exerciseForTopic(t);html+=`<p><strong>${esc(e?.label||title(t.topic))}</strong></p><p>${t.wrong} von ${t.recent} zuletzt beantworteten Aufgaben waren falsch. Beginne mit diesem Thema.</p>`+directButton(e,'Übung öffnen',e?.ids||[]);}
  else html+='<p>'+(!d.total?'Bearbeite zuerst eine Übung. Danach passen wir deinen Plan an deine Antworten an.':'In den zuletzt ausgewerteten Antworten ist kein Fehlerschwerpunkt erkennbar. Festige dein zuletzt geübtes Thema.')+'</p>';
  if(d.legacy&&!d.detailed)html+='<p class="fa-muted">Für deine bisherigen Antworten kennen wir nur richtig oder falsch. Konkrete Fehlerbeispiele erscheinen, sobald neue Antworten mit Lösungen gespeichert werden.</p>';
  html+='</div><h4>Dein Lernplan: die nächsten drei Schritte</h4><p class="fa-muted">Gehe der Reihe nach vor. Plane je Schritt ungefähr fünf Minuten ein.</p><div class="fa-plan-grid">';
  html+=plan.map((p,i)=>`<article class="fa-step"><span class="fa-step-number">${i+1}</span><h5>${esc(p.title)}</h5><p>${esc(p.body)}</p>${directButton(p.e,'Schritt '+(i+1)+' starten',p.ids)}</article>`).join('');
  html+='</div><h4>Deine Fehler verstehen</h4>';
  const examples=d.topics.filter(t=>t.examples?.length);
  if(!examples.length)html+='<p class="fa-muted">Noch keine Fehlerbeispiele verfügbar. Das bedeutet nicht automatisch, dass alle Antworten richtig waren.</p>';
  html+=examples.slice(0,3).map(t=>`<article class="fa-card"><h5>${esc(title(t.topic))}</h5>`+t.examples.slice(0,2).map(e=>`<div class="fa-example"><p><strong>${esc(e.question)}</strong></p><p>Deine Antwort: <span class="fa-wrong">${esc(e.own)}</span></p><p>Richtig wäre: <span class="fa-right">${esc(e.right)}</span></p><p>${esc(e.explanation||'Übe diese Aufgabe nochmals und vergleiche die Lösungen.')}</p>${e.latestCorrect?'<p class="fa-muted">Beim letzten Versuch hast du diese Aufgabe richtig gelöst.</p>':''}</div>`).join('')+'</article>').join('');
  html+='<details class="fa-more"><summary>Weitere Ergebnisse anzeigen</summary>';
  html+=d.topics.map(t=>`<div class="fa-topic"><div><strong>${esc(title(t.topic))}</strong><p>${t.recent?t.wrong+' von '+t.recent+' zuletzt beantworteten Aufgaben falsch.':'Bisher nur Wiederholungen erfasst.'}${!t.enough?' Noch wenige Antworten – vorläufige Einschätzung.':''}</p>${t.trend===null?'':`<p class="fa-muted">In deinen letzten zehn Antworten waren ${t.trend>0?'mehr':t.trend<0?'weniger':'gleich viele'} Lösungen richtig als in den zehn davor. Die Aufgaben können unterschiedlich schwierig sein.</p>`}</div>${directButton(exerciseForTopic(t),'Übung öffnen')}</div>`).join('');
  html+='</details>';
  $('analysisDetail').innerHTML=html;
 }
 async function detail(){
  const token=++generation,owner=FRLearning.account;const button=$('analysisRefresh');button.disabled=true;$('analysisStatus').textContent='Dein persönlicher Lernplan wird erstellt …';$('analysisDetail').replaceChildren();
  try{
   if(owner==='guest')throw new Error('Bitte melde dich zuerst an. Die Detailanalyse gehört zu Premium.');
   await FRLearning.sync();
   const d=await FRPremium.call('premium-access',{action:'analysis'});
   if(token!==generation||owner!==FRLearning.account)return;
   render(d);$('analysisStatus').textContent='Dein Lernplan ist aktualisiert.';
  }catch(e){if(token===generation){$('analysisStatus').textContent=e.message;}}
  finally{if(token===generation)button.disabled=false;}
 }
 $('analysisRefresh').addEventListener('click',detail);
 window.addEventListener('frlearningchange',basic);
 (async()=>{await FRLearning.ready;basic();})();
})();
