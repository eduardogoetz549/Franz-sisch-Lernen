(() => {
 'use strict';
 const normalize=v=>String(v??'').normalize('NFC').trim().toLocaleLowerCase('fr').replace(/[’‘`´]/g,"'").replace(/\s*'\s*/g,"'").replace(/\s*([,;:])\s*/g,'$1 ').replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();
 function variants(answer,accepted=[]){
  const found=new Set([answer,...accepted].map(normalize));
  for(const s of [...found]){
   found.add(s.replace(/\bpaie([a-z]*)\b/g,'paye$1').replace(/\bessaie([a-z]*)\b/g,'essaye$1'));
   found.add(s.replace(/\bpaye([a-z]*)\b/g,'paie$1').replace(/\bessaye([a-z]*)\b/g,'essaie$1'));
   found.add(s.replace(/s'il vous plaît/g,"s'il vous plait").replace(/s'il te plaît/g,"s'il te plait"));
  }
  return found;
 }
 window.FRAnswers={normalize,variants,check:(own,answer,accepted=[])=>!!normalize(own)&&variants(answer,accepted).has(normalize(own))};
})();
