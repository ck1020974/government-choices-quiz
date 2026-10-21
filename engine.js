(function(root){
  'use strict';
  function match(question,choice,target,countryId){
    const overrides=question.country_overrides?.[countryId];
    if(overrides&&Object.prototype.hasOwnProperty.call(overrides,choice))return overrides[choice];
    if(choice===target) return 1;
    const pair=(question.partial_matches||[]).find(([a,b])=>(a===choice&&b===target)||(a===target&&b===choice));
    return pair?pair[2]:0;
  }
  function calculate(data,answers){
    const questions=data.questions;
    for(const q of questions){
      if(!q.options.some(o=>o.id===answers[q.id])) throw new Error('請先完成所有題目。');
    }
    const total=questions.reduce((s,q)=>s+q.weight,0);
    const results=data.countries.map(country=>{
      const details=questions.map(q=>{
        const raw=country.profile[q.id];
        // 合併後的選項（例如Q4德國）以target_map對應。
        const target=q.target_map?.[raw]||raw;
        const similarity=match(q,answers[q.id],target,country.id);
        return {question:q,choice:q.options.find(o=>o.id===answers[q.id]),target:q.options.find(o=>o.id===target),similarity,points:q.weight*similarity,lost:q.weight*(1-similarity)};
      });
      const raw=details.reduce((sum,d)=>sum+d.points,0)/total*100;
      return {country,details,raw,percent:Math.round(raw)};
    }).sort((a,b)=>b.raw-a.raw||a.country.id.localeCompare(b.country.id));
    const top=results[0].raw;
    // 制度傾向：各制度組內取最高的國家分數比較，不累加國家數。
    const systems=data.systems.map(sys=>{
      const best=results.find(r=>r.country.group===sys.id);
      return {system:sys,score:best.raw,percent:best.percent,best};
    });
    const order=[...systems].sort((a,b)=>b.score-a.score);
    const topSystems=order.filter(s=>Math.abs(s.score-order[0].score)<1e-9);
    return {results,systems,topSystems,winners:results.filter(r=>Math.abs(r.raw-top)<1e-9)};
  }
  const engine={match,calculate};
  if(typeof module!=='undefined'&&module.exports)module.exports=engine;
  else root.QuizEngine=engine;
})(typeof window!=='undefined'?window:globalThis);
