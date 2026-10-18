(function(root){
  'use strict';
  function match(question,choice,target,countryId){
    const overrides=question.country_overrides?.[countryId];
    if(overrides&&Object.prototype.hasOwnProperty.call(overrides,choice))return overrides[choice];
    if(choice===target) return 1;
    const pair=question.partial_matches.find(([a,b])=>(a===choice&&b===target)||(a===target&&b===choice));
    return pair?pair[2]:0;
  }
  function calculate(data,answers){
    for(const q of data.questions){
      if(!q.options.some(o=>o.id===answers[q.id])) throw new Error('請先完成所有題目。');
    }
    const results=data.countries.map(country=>{
      const details=data.questions.map(q=>{
        const target=country.profile[q.id];
        const similarity=match(q,answers[q.id],target,country.id);
        return {question:q,choice:q.options.find(o=>o.id===answers[q.id]),target:q.options.find(o=>o.id===target),similarity,points:q.weight*similarity,lost:q.weight*(1-similarity)};
      });
      const raw=details.reduce((sum,d)=>sum+d.points,0);
      return {country,details,raw,percent:Math.round(raw),core:details.slice(0,6).reduce((sum,d)=>sum+d.points,0)};
    }).sort((a,b)=>b.raw-a.raw||a.country.id.localeCompare(b.country.id));
    const top=results[0].raw;
    return {results,winners:results.filter(r=>r.raw===top),near:results.filter(r=>top-r.raw<=5),mixed:top<60};
  }
  const engine={match,calculate};
  if(typeof module!=='undefined'&&module.exports)module.exports=engine;
  else root.QuizEngine=engine;
})(typeof window!=='undefined'?window:globalThis);
