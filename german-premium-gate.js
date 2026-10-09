(() => {
 'use strict';
 const file=decodeURIComponent(location.pathname.split('/').pop());
 const unit=/^deutsch-en-15-minuten-lerneinheit(?:-aktiv)?\.html$/.test(file);
 const title=document.getElementById('title'),message=document.getElementById('message'),start=document.getElementById('start');
 let loading=false;
 async function load(){
  if(loading)return;loading=true;start.disabled=true;
  try {
   const result=await FRPremium.call('premium-access',{action:'lesson',file});
   if(typeof result.html!=='string')throw new Error('The exercise could not be loaded.');
   const lesson = new DOMParser().parseFromString(result.html, 'text/html');
   for (const script of lesson.querySelectorAll('script[src]')) {
    const scriptFile = new URL(script.getAttribute('src'), location.href).pathname.split('/').pop();
    if (scriptFile === 'german-premium-gate.js') {
     throw new Error('The private bucket contains an access page instead of the full exercise. Replace it with the full HTML file in premium-content.');
    }
    // Der bereits angemeldete Lernspeicher wird weiterverwendet.
    if (scriptFile === 'german-learning-core.js') script.remove();
   }
   document.open();
   document.write('<!doctype html>\n' + lesson.documentElement.outerHTML);
   document.close();
   window.dispatchEvent(new Event('frpremiumlessonloaded'));
  }catch(e){message.textContent=e.message;start.disabled=false;loading=false;}
 }
 (async()=>{
  try{
   await FRLearning.ready;
   if(FRLearning.account==='guest'){title.textContent='Please sign in first';message.textContent='Sign in through My account, then open this exercise again.';return;}
   const status=await FRPremium.status();
   if(unit){
    title.textContent='Your 15-minute learning session';
    message.textContent=status.premium?'Premium: you can start your session.':`${status.remaining} of 2 free starts left this week. Each new start counts, including reloads. The week starts on Monday (Europe/Zurich).`;
    if(status.premium||status.remaining>0){start.hidden=false;start.onclick=load;}else{message.textContent='You have already started two sessions this week. Further starts require Premium.';}
   }else if(!status.premium){title.textContent='This exercise requires Premium';message.textContent='Levels 2 and 3 and all exams require an active Premium subscription.';}
   else await load();
  }catch(e){title.textContent='Access check failed';message.textContent=e.message;}
 })();
})();
