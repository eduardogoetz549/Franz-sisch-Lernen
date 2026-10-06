(() => {
 'use strict';
 const file=decodeURIComponent(location.pathname.split('/').pop());
 const unit=/^franzoesisch-15-minuten-lerneinheit(?:-aktiv)?\.html$/.test(file);
 const title=document.getElementById('title'),message=document.getElementById('message'),start=document.getElementById('start');
 let loading=false;
 async function load(){
  if(loading)return;loading=true;start.disabled=true;
  try {
   const result=await FRPremium.call('premium-access',{action:'lesson',file});
   if(typeof result.html!=='string')throw new Error('Die Übung konnte nicht geladen werden.');
   // Same URL: relative assets, exercise IDs and existing links stay correct.
   document.open();document.write(result.html);document.close();
  }catch(e){message.textContent=e.message;start.disabled=false;loading=false;}
 }
 (async()=>{
  try{
   await FRLearning.ready;
   if(FRLearning.account==='guest'){title.textContent='Bitte zuerst anmelden';message.textContent='Melde dich über „Mein Konto“ an und öffne diese Übung danach erneut.';return;}
   const status=await FRPremium.status();
   if(unit){
    title.textContent='Deine 15-Minuten-Lerneinheit';
    message.textContent=status.premium?'Premium: Du kannst deine Einheit starten.':`Noch ${status.remaining} von 2 kostenlosen Starts diese Woche. Jeder neue Start zählt, auch nach einem Neuladen. Wochenbeginn: Montag.`;
    if(status.premium||status.remaining>0){start.hidden=false;start.onclick=load;}else{message.textContent='Du hast diese Woche bereits zwei Einheiten gestartet. Weitere Starts gehören zu Premium.';}
   }else if(!status.premium){title.textContent='Diese Übung gehört zu Premium';message.textContent='Niveau 2 und 3 sowie alle Prüfungen und Gesamtprüfungen sind mit aktivem Premium-Abo verfügbar.';}
   else await load();
  }catch(e){title.textContent='Zugang konnte nicht geprüft werden';message.textContent=e.message;}
 })();
})();
