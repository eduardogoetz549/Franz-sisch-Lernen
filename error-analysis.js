(() => {
 'use strict';
 const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={'verben-konjugation':'Verben & Konjugation','artikel-nomen':'Artikel & Nomen','adjektive':'Adjektive','pronomen':'Pronomen','verneinungen':'Verneinungen','fragen':'Fragen bilden','praepositionen':'Präpositionen','conditionnel':'Conditionnel','passe-compose':'Passé composé','imparfait':'Imparfait','futur-simple':'Futur simple','unregelmaessige-verben':'Unregelmässige Verben','subjonctif':'Subjonctif','15-Minuten-Einheit':'15-Minuten-Einheit'};
 const title=key=>names[key]||key;
 let generation=0,actor=null;
 function basic(){
  if(!window.FRLearning)return;
  const current=FRLearning.account;
  if(actor!==current){actor=current;generation++;$('analysisDetail').replaceChildren();$('analysisStatus').textContent='';$('analysisRefresh').disabled=false;}
  const s=FRLearning.summary(),entries=Object.entries(s.modules||{}).filter(([,m])=>m.answered>0).map(([key,m])=>{
   const topic=key.replace(/^fr_franzoesisch_/,'').replace(/_[123]_oberstufe.*$/,'').replace(/_/g,'-');
   return {label:key.startsWith('fr_exam_')?'Gesamtprüfung · Niveau '+key.match(/\d+/)?.[0]:key==='fr_unit_15'?'15-Minuten-Einheit':title(topic)+' · Niveau '+(key.match(/_([123])_oberstufe/)?.[1]||'?'),n:m.answered,wrong:m.answered-m.correct};
  }).sort((a,b)=>b.wrong/Math.max(1,b.n)-a.wrong/Math.max(1,a.n));
  $('analysisBasic').innerHTML=entries.length?entries.slice(0,6).map(e=>`<div class="fa-topic"><div><strong>${esc(e.label)}</strong><p>${e.wrong} von ${e.n} Antworten falsch${e.n<5?' · noch wenige Daten':''}</p></div><span>${Math.round((e.n-e.wrong)/e.n*100)} % richtig</span></div>`).join(''):'<p class="fa-muted">Noch keine Antworten gespeichert. Bearbeite zuerst eine Übung.</p>';
  $('analysisAccount').textContent=current==='guest'?'Gastmodus: Die Themenübersicht verwendet den Fortschritt auf diesem Gerät. Für die Detailanalyse bitte anmelden.':'Die Analyse gehört zu deinem angemeldeten Konto.';
 }
 function render(d){
  if(!d.total){$('analysisDetail').innerHTML='<p class="fa-muted">Noch keine Antworten mit deinem Konto synchronisiert. Bearbeite eine Übung und öffne die Analyse danach erneut.</p>';return;}
  let html=`<p class="fa-muted">${d.total} Antworten ausgewertet · ${d.detailed} mit Antwortdetails. Trends vergleichen die letzten zehn mit den vorherigen zehn Erstversuchen je Thema. Wiederholungen zählen dort nicht mit.</p>`;
  if(d.legacy)html+=`<p class="fa-notice">Bei ${d.legacy} älteren Antworten fehlen die Antwortdetails. Daraus lässt sich keine konkrete Verwechslung ableiten. Alte Pronomen-Ergebnisse können mit Adjektiven vermischt sein; neue Antworten werden getrennt erfasst.</p>`;
  const priorities=d.topics.filter(t=>t.enough&&t.wrong>0).slice(0,3);
  html+='<h4>Dein nächster Lernschritt</h4>';
  html+=priorities.length?'<ol class="fa-plan">'+priorities.map(t=>`<li><strong>${esc(title(t.topic))}</strong>: ${t.wrong} von ${t.recent} letzten Erstversuchen falsch. Wiederhole eine Regel, löse die unten vorgeschlagenen Aufgaben und erkläre danach die richtige Lösung in eigenen Worten.</li>`).join('')+'</ol>':'<p class="fa-muted">Für eine Empfehlung brauchen wir mindestens fünf Erstversuche pro Thema mit mindestens einem Fehler.</p>';
  html+=d.topics.map(t=>{
   const trend=t.trend===null?'Für einen Trend fehlen noch Erstversuche.':t.trend>0?`${t.trend} Prozentpunkte besser als in den vorherigen zehn Erstversuchen.`:t.trend<0?`${Math.abs(t.trend)} Prozentpunkte weniger richtige Antworten als zuvor.`:'Die Trefferquote blieb gleich.';
   let row=`<article class="fa-card"><h4>${esc(title(t.topic))}</h4><p>${t.recent?t.accuracy+' % richtig bei den letzten '+t.recent+' Erstversuchen.':'Bisher nur Wiederholungen erfasst.'} ${!t.enough?'Noch keine belastbare Einschätzung.':''}</p><p class="fa-muted">${trend}</p>`;
   if(t.unanswered)row+=`<p>${t.unanswered} Prüfungsaufgaben ohne Antwort abgegeben. Das belegt noch keinen Grammatikfehler.</p>`;
   if(t.patterns.length)row+='<h5>Wiederholt beobachtete Antworten</h5>'+t.patterns.map(p=>`<p><strong>${esc(p.own)}</strong> statt <strong>${esc(p.right)}</strong> · ${p.count} Mal. Prüfe die Regel am Aufgabenbeispiel; die Ursache kann daraus allein nicht bestimmt werden.</p>`).join('');
   row+=t.examples.map(e=>`<details><summary>${e.wrong} Mal falsch · ${esc(e.question)}${e.latestCorrect?' · zuletzt richtig':''}</summary><div class="fa-example"><p>Deine damalige Antwort: <strong>${esc(e.own)}</strong></p><p>Richtige Lösung: <strong>${esc(e.right)}</strong></p><p>${esc(e.explanation||'Für diese Aufgabe ist keine Erklärung gespeichert.')}</p></div></details>`).join('');
   if(!t.examples.length)row+='<p class="fa-muted">Keine offenen Aufgaben mit gespeicherten Antwortdetails. Eine Aufgabe wird nach zwei richtigen Antworten in Folge aus der Fehlerliste entfernt.</p>';
   row+=t.practice.map(p=>`<a class="btn-smart fa-practice" href="${esc(p.file)}?review_ids=${encodeURIComponent(p.ids.join(','))}">Meine Fehler üben · ${p.ids.length} Aufgaben</a>`).join('');
   return row+'</article>';
  }).join('');
  $('analysisDetail').innerHTML=html;
 }
 async function detail(){
  const token=++generation,owner=FRLearning.account;const button=$('analysisRefresh');button.disabled=true;$('analysisStatus').textContent='Dein Fortschritt wird synchronisiert und ausgewertet …';$('analysisDetail').replaceChildren();
  try{
   if(owner==='guest')throw new Error('Bitte melde dich zuerst an. Die Detailanalyse gehört zu Premium.');
   await FRLearning.sync();
   const d=await FRPremium.call('premium-access',{action:'analysis'});
   if(token!==generation||owner!==FRLearning.account)return;
   render(d);$('analysisStatus').textContent='Analyse aktualisiert. '+FRLearning.status;
  }catch(e){if(token===generation){$('analysisStatus').textContent=e.message;}}
  finally{if(token===generation)button.disabled=false;}
 }
 $('analysisRefresh').addEventListener('click',detail);
 window.addEventListener('frlearningchange',basic);
 (async()=>{await FRLearning.ready;basic();})();
})();
