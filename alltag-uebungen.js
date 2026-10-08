(() => {
 'use strict';
 const config=window.FRAlltag,$=id=>document.getElementById(id);
 if(!config||!Array.isArray(config.questions))return;
 const normalize=value=>String(value).normalize('NFC').trim().toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[.!?]+$/,'');
 const requested=(new URL(location.href).searchParams.get('review_ids')||'').split(',').filter(x=>/^\d+$/.test(x)).map(Number);
 const selected=config.questions.filter(q=>requested.includes(q.id));
 const targeted=selected.length>0,base=targeted?selected:config.questions;
 let round=[],examAnswers=[],deadline=0,timer=null;
 let queue=[],position=0,correct=0,answered=0,locked=false,actor=null,finished=false,last=new Map();
 function shuffled(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function start(){
  round=targeted?selected:(config.exam?shuffled([...new Set(base.map(q=>q.topic))].flatMap(topic=>shuffled(base.filter(q=>q.topic===topic)).slice(0,5))):shuffled(base).slice(0,15));
  queue=round.map(q=>({...q,repetition:0}));examAnswers=[];clearInterval(timer);
  if(config.exam){deadline=Date.now()+30*60*1000;timer=setInterval(()=>{const left=Math.max(0,deadline-Date.now());$('examTime').textContent=Math.ceil(left/60000)+' Min. verbleiben';if(!left)finishExam();},1000);}
  
  position=0;correct=0;answered=0;last=new Map();finished=false;
  $('result').hidden=true;$('quizCard').hidden=false;render();
 }
 function render(){
  locked=false;const q=queue[position];
  $('step').textContent='Aufgabe '+(position+1)+' von '+queue.length;
  $('score').textContent=config.exam?'Prüfungsmodus':correct+'/'+answered+' im ersten Durchgang';
  $('fill').style.width=Math.round(position/queue.length*100)+'%';
  $('mode').textContent=(q.repetition||targeted?'Wiederholung · ':'')+(q.type==='write'?'Schreiben':'Auswahl');
  $('question').textContent=q.type==='write'?'Ergänze die Lücke auf Französisch.':'Welche Antwort passt zur Situation?';
  $('context').textContent=q.prompt;$('options').replaceChildren();$('feedback').replaceChildren();
  $('next').disabled=true;$('next').classList.remove('active');
  $('writeForm').hidden=q.type!=='write';$('writeAnswer').value='';$('writeAnswer').disabled=false;$('writeAnswer').classList.remove('correct','wrong');$('checkWrite').disabled=false;
  if(q.type==='choice')shuffled(q.options).forEach(option=>{const b=document.createElement('button');b.type='button';b.className='option';b.textContent=option;b.onclick=()=>respond(option,b);$('options').append(b);});
 }
 function respond(own,selectedButton){
  if(locked||finished)return;
  if(!String(own).trim()){$('feedback').textContent='Gib zuerst eine Antwort ein.';return;}
  locked=true;const q=queue[position],ok=normalize(own)===normalize(q.answer);
  if(config.exam){examAnswers.push({q,own,ok});$('options').querySelectorAll('button').forEach(b=>b.disabled=true);if(selectedButton)selectedButton.classList.add('exam-selected');$('writeAnswer').disabled=true;$('checkWrite').disabled=true;$('feedback').textContent='Antwort gespeichert.';$('next').disabled=false;$('next').classList.add('active');$('next').textContent=position===queue.length-1?'Prüfung abgeben':'Weiter →';return;}
  if(!q.repetition){answered++;if(ok)correct++;}
  last.set(q.id,ok);
  if(!ok&&q.repetition<2)queue.push({...q,repetition:q.repetition+1});
  $('options').querySelectorAll('button').forEach(b=>{b.disabled=true;if(normalize(b.textContent)===normalize(q.answer))b.classList.add('correct');});
  if(selectedButton&&!ok)selectedButton.classList.add('wrong');
  $('writeAnswer').classList.add(ok?'correct':'wrong');$('writeAnswer').disabled=true;$('checkWrite').disabled=true;
  const text=document.createElement('p');text.textContent=ok?'Richtig!':'Noch nicht richtig. Die passende Ergänzung lautet: '+q.answer;
  const solution=document.createElement('div');solution.className='solution';solution.textContent=q.explanation;$('feedback').replaceChildren(text,solution);
  $('coachImage').src=ok?'fuchs-richtig.png':'fuchs-falsch.png';$('foxBubble').textContent=ok?'Très bien ! Weiter so.':'Lies die Erklärung. Du bekommst die Aufgabe später noch einmal.';
  if(window.FRLearning)FRLearning.record(config.module,q.id,ok,!!q.repetition||targeted,q.prompt,{own,right:q.answer,prompt:q.prompt,explanation:q.explanation,topic:config.topic,file:config.file,type:q.type});
  $('score').textContent=config.exam?'Prüfungsmodus':correct+'/'+answered+' im ersten Durchgang';$('step').textContent='Aufgabe '+(position+1)+' von '+queue.length;
  $('next').disabled=false;$('next').classList.add('active');$('next').textContent=position===queue.length-1?'Auswertung →':'Weiter →';
 }
 $('writeForm').onsubmit=e=>{e.preventDefault();respond($('writeAnswer').value);};
 $('next').onclick=()=>{
  if(!locked||finished)return;
  position++;
  if(config.exam&&position>=queue.length){finishExam();return;}
  if(position<queue.length){$('next').textContent='Weiter →';render();return;}
  finished=true;const pct=Math.round(correct/round.length*100),open=[...last.values()].filter(ok=>!ok).length;
  $('quizCard').hidden=true;$('result').hidden=false;$('fill').style.width='100%';
  $('resultScore').textContent=correct+' / '+round.length;
  $('resultText').textContent='Im ersten Durchgang '+pct+' % richtig. '+(queue.length-round.length)+' Wiederholungen bearbeitet. '+(open?open+' Aufgaben sind noch unsicher. Übe sie nochmals.':'Alle Aufgaben zuletzt richtig beantwortet.');
  if(window.FRLearning)FRLearning.finish(config.module,pct);
 };
 function finishExam(){
  if(finished)return;finished=true;clearInterval(timer);$('quizCard').hidden=true;$('result').hidden=false;$('fill').style.width='100%';
  const good=examAnswers.filter(a=>a.ok).length,pct=Math.round(good/round.length*100);$('resultScore').textContent=good+' / '+round.length;$('resultText').textContent=pct+' % richtig. Nicht beantwortete Aufgaben zählen als falsch.';
  const detail=document.createElement('div');detail.id='examReview';
  round.forEach((q,i)=>{const a=examAnswers.find(a=>a.q.id===q.id);const card=document.createElement('div');card.className='solution';const h=document.createElement('p');h.textContent=(i+1)+'. '+q.prompt;const own=document.createElement('p');own.textContent='Deine Antwort: '+(a?.own||'Nicht beantwortet');const right=document.createElement('p');right.textContent=(a?.ok?'Richtig. ':'Lösung: '+q.answer+'. ')+q.explanation;card.append(h,own,right);detail.append(card);
   if(window.FRLearning)FRLearning.record(q.practiceModule,q.practiceId,!!a?.ok,false,q.prompt,{own:a?.own||'',right:q.answer,prompt:q.prompt,explanation:q.explanation,topic:q.topic,file:q.practiceFile,type:q.type,unanswered:!a});
  });document.getElementById('examReview')?.remove();$('result').append(detail);if(window.FRLearning)FRLearning.finish(config.module,pct);
 }
 $('restart').onclick=()=>{document.getElementById('examReview')?.remove();start();};
 function accountChanged(){const next=window.FRLearning?.account||'guest';if(next===actor)return;actor=next;start();}
 window.addEventListener('frlearningchange',accountChanged);
 if(window.FRLearning?.ready)window.FRLearning.ready.then(accountChanged).catch(()=>{actor='guest';start();});else accountChanged();
})();
