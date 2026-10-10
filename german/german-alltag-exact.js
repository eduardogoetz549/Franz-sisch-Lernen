(() => {
 'use strict';
 const config=window.FRAlltag,$=id=>document.getElementById(id),answers=window.FRAnswers;
 if(!config||!Array.isArray(config.questions)||!answers)return;
 const requested=(new URL(location.href).searchParams.get('review')||new URL(location.href).searchParams.get('review_ids')||'').split(',').filter(x=>/^\d+$/.test(x)).map(Number);
 const selected=[...config.questions,...(config.legacyQuestions||[])].filter(q=>requested.includes(q.id));
 const targeted=!config.exam&&selected.length>0;
 let round=[],queue=[],position=0,correct=0,answered=0,locked=false,actor=null,finished=false,last=new Map(),examAnswers=[],timer=null,deadline=0,orderHistory=[];
 function shuffled(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function sample(pool,counts){return shuffled(Object.entries(counts).flatMap(([type,n])=>shuffled(pool.filter(q=>q.type===type)).slice(0,n)));}
 function start(){
  clearInterval(timer);document.getElementById('examReview')?.remove();
  round=targeted?selected:config.exam?shuffled([...new Set(config.questions.map(q=>q.topic))].flatMap(topic=>sample(config.questions.filter(q=>q.topic===topic),{choice:2,write:2,order:1}))):sample(config.questions,{choice:6,write:6,order:3});
  queue=round.map(q=>({...q,repetition:0}));position=0;correct=0;answered=0;locked=false;finished=false;last=new Map();examAnswers=[];
  $('result').hidden=true;$('quizCard').hidden=false;$('coachImage').src='fuchs-tipp.png';$('foxBubble').textContent=config.exam?'Exam mode: results appear after submission.':'Lies die Situation. Nutze bei Fehlern die Erklärung und den Beispielsatz.';
  if(config.exam){deadline=Date.now()+30*60*1000;$('examTime').textContent='30:00';timer=setInterval(()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('examTime').textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');if(!left)finishExam();},1000);}
  render();setupFreeWriting();
 }
 function render(){
  locked=false;orderHistory=[];const q=queue[position];
  $('step').textContent='Question '+(position+1)+' of '+queue.length;$('score').textContent=config.exam?'Exam mode':correct+'/'+answered+' on the first attempt';$('fill').style.width=Math.round(position/queue.length*100)+'%';
  $('mode').textContent=(q.repetition||targeted?'Review · ':'')+(q.taskLabel||(q.type==='write'?'Writing':'Choice'));
  $('question').textContent=q.type==='order'?'Put the words in the correct order.':q.type==='write'?'Write a suitable answer.':'Choose the correct answer.';
  $('context').textContent=q.prompt;$('options').replaceChildren();$('feedback').replaceChildren();$('next').disabled=true;$('next').classList.remove('active');$('next').textContent='Continue →';
  $('writeForm').hidden=q.type==='choice';$('writeAnswer').value='';$('writeAnswer').disabled=false;$('writeAnswer').readOnly=q.type==='order';$('writeAnswer').classList.remove('correct','wrong');$('checkWrite').disabled=false;
  if(q.type==='choice')shuffled(q.options).forEach(option=>{const b=document.createElement('button');b.type='button';b.className='option';b.textContent=option;b.onclick=()=>respond(option,b);$('options').append(b);});
  if(q.type==='order'){
   shuffled(q.tokens.map((word,index)=>({word,index}))).forEach(token=>{const b=document.createElement('button');b.type='button';b.className='word-token';b.textContent=token.word;b.onclick=()=>{if(locked)return;b.disabled=true;orderHistory.push({word:token.word,button:b});$('writeAnswer').value=orderHistory.map(t=>t.word).join(' ');};$('options').append(b);});
   const undo=document.createElement('button');undo.type='button';undo.className='word-undo';undo.textContent='Undo last word';undo.onclick=()=>{if(locked)return;const last=orderHistory.pop();if(last)last.button.disabled=false;$('writeAnswer').value=orderHistory.map(t=>t.word).join(' ');};$('options').append(undo);
  }
 }
 function respond(own,selectedButton){
  if(locked||finished)return;
  if(!answers.normalize(own)){$('feedback').textContent='Enter an answer first.';return;}
  locked=true;const q=queue[position],ok=answers.check(own,q.answer,q.accepted||[]);
  $('options').querySelectorAll('button').forEach(b=>b.disabled=true);$('writeAnswer').disabled=true;$('checkWrite').disabled=true;
  if(config.exam){examAnswers.push({q,own,ok});if(selectedButton)selectedButton.classList.add('exam-selected');$('feedback').textContent='Answer saved.';}
  else{
   if(!q.repetition){answered++;if(ok)correct++;}last.set(q.id,ok);if(!ok&&q.repetition<2)queue.push({...q,repetition:q.repetition+1});
   if(q.type==='choice')$('options').querySelectorAll('button').forEach(b=>{if(answers.check(b.textContent,q.answer,q.accepted||[]))b.classList.add('correct');});
   if(selectedButton&&!ok)selectedButton.classList.add('wrong');if(q.type!=='choice')$('writeAnswer').classList.add(ok?'correct':'wrong');
   const text=document.createElement('p');text.textContent=ok?'Correct!':'Not quite. One suitable answer is: '+q.answer;const explanation=document.createElement('div');explanation.className='solution';explanation.textContent=q.explanation;$('feedback').replaceChildren(text,explanation);
   $('coachImage').src=ok?'fuchs-richtig.png':'fuchs-falsch.png';$('foxBubble').textContent=ok?'Sehr gut! Keep it up.':'Read the rule and example. You will practise this question again later.';
   if(window.FRLearning)FRLearning.record(config.module,q.id,ok,!!q.repetition||targeted,q.prompt,{own,right:q.answer,prompt:q.prompt,explanation:q.explanation,topic:config.topic,file:config.file,type:q.type});
   $('score').textContent=correct+'/'+answered+' on the first attempt';
  }
  $('step').textContent='Question '+(position+1)+' of '+queue.length;$('next').disabled=false;$('next').classList.add('active');$('next').textContent=position===queue.length-1?(config.exam?'Submit exam':'Results →'):'Continue →';
 }
 $('writeForm').onsubmit=e=>{e.preventDefault();respond($('writeAnswer').value);};
 $('next').onclick=()=>{
  if(!locked||finished)return;position++;
  if(position<queue.length){render();return;}
  if(config.exam){finishExam();return;}
  finished=true;const pct=Math.round(correct/round.length*100),open=[...last.values()].filter(ok=>!ok).length;$('quizCard').hidden=true;$('result').hidden=false;$('fill').style.width='100%';$('resultScore').textContent=correct+' / '+round.length;
  $('resultText').textContent='On the first attempt: '+pct+' % correct. '+(queue.length-round.length)+' review attempts completed. '+(open?open+' questions still need practice.':'All questions were answered correctly on the last attempt.');if(window.FRLearning)FRLearning.finish(config.module,pct);
 };
 function finishExam(){
  if(finished)return;finished=true;clearInterval(timer);$('quizCard').hidden=true;$('result').hidden=false;$('fill').style.width='100%';const good=examAnswers.filter(a=>a.ok).length,pct=Math.round(good/round.length*100);$('resultScore').textContent=good+' / '+round.length;$('resultText').textContent=pct+' % correct. Unanswered questions count as incorrect.';
  const detail=document.createElement('div');detail.id='examReview';
  round.forEach((q,i)=>{const a=examAnswers.find(a=>a.q.id===q.id),card=document.createElement('div');card.className='solution';const h=document.createElement('p');h.textContent=(i+1)+'. '+q.prompt;const own=document.createElement('p');own.textContent='Your answer: '+(a?.own||'Unanswered');const right=document.createElement('p');right.textContent=(a?.ok?'Correct. ':'One suitable answer: '+q.answer+'\n')+q.explanation;card.append(h,own,right);detail.append(card);
   if(window.FRLearning)FRLearning.record(q.practiceModule,q.practiceId,!!a?.ok,false,q.prompt,{own:a?.own||'',right:q.answer,prompt:q.prompt,explanation:q.explanation,topic:q.topic,file:q.practiceFile,type:q.type,unanswered:!a});
  });$('result').append(detail);if(window.FRLearning)FRLearning.finish(config.module,pct);
 }
 function setupFreeWriting(){
  if(config.exam||!config.freeWriting)return;document.getElementById('freeWriting')?.remove();const section=document.createElement('section');section.id='freeWriting';section.className='card free-writing';const title=document.createElement('h2');title.textContent='Now write your own text';const task=document.createElement('p');task.textContent=config.freeWriting.prompt;const input=document.createElement('textarea');input.rows=5;input.maxLength=1000;input.lang='de';input.id='ownMessage';const label=document.createElement('label');label.htmlFor=input.id;label.textContent='Your own message';const button=document.createElement('button');button.type='button';button.className='home-btn';button.textContent='Compare with an example';const model=document.createElement('div');model.className='solution';model.hidden=true;model.textContent='Example:\n'+config.freeWriting.model+'\n\nSelf-check: does my message fit the situation? Are my verb forms correct? Are my sentences complete?\nSeveral expressions are possible. Your free text is not automatically graded.';button.onclick=()=>model.hidden=!model.hidden;
  const key='foxora:message:'+actor+':'+config.module;try{input.value=localStorage.getItem(key)||'';}catch{}input.oninput=()=>{try{localStorage.setItem(key,input.value);}catch{}};const help=document.createElement('div');help.className='language-help';const hint=document.createElement('p');hint.textContent='Copy your text and check it with LanguageTool. Select German.';const link=document.createElement('a');link.href='https://languagetool.org/';link.target='_blank';link.rel='noopener noreferrer';link.className='home-btn';link.textContent='Open LanguageTool ↗';help.append(hint,link);section.append(title,task,label,input,help,button,model);$('quizCard').parentNode.insertBefore(section,$('quizCard').nextSibling);
 }
 $('restart').onclick=start;
 function accountChanged(){const next=window.FRLearning?.account||'guest';if(next===actor)return;actor=next;start();}
 window.addEventListener('frlearningchange',accountChanged);
 if(window.FRLearning?.ready)window.FRLearning.ready.then(accountChanged).catch(()=>{actor='guest';start();});else accountChanged();
})();
