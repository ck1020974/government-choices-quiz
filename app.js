(function(){
'use strict';
const data=QUIZ_DATA;
const key='government-quiz-'+data.version;
const root=document.getElementById('app');
const engine=QuizEngine;
let answers={},index=0,view='home',returnToReview=false;
const questions=()=>data.questions;
try{
 const saved=JSON.parse(sessionStorage.getItem(key)||'null');
 if(saved?.answers){
  for(const q of questions()){if(q.options.some(o=>o.id===saved.answers[q.id]))answers[q.id]=saved.answers[q.id];}
  index=Math.min(questions().length-1,Math.max(0,Number(saved.index)||0));
 }
}catch{}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const optionText=o=>`${escape(o.label||'')}：${escape(o.text)}`;
const completed=()=>questions().every(q=>answers[q.id]);
const count=()=>questions().filter(q=>answers[q.id]).length;
function save(){try{sessionStorage.setItem(key,JSON.stringify({answers,index}));}catch{}}
function focusTitle(){requestAnimationFrame(()=>{root.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});}
function navigate(to){view=to;render();focusTitle();}
const check='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 12.5l5 5L19.5 6"/></svg>';
function sourceLinks(country){return `<ul class="sources">${country.sources.map(id=>{const s=data.sources[id];return s?`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a></li>`:'';}).join('')}</ul>`;}

function home(){
 const started=count()>0;
 root.innerHTML=`<section class="home">
  <div class="home-copy">
   <h1 tabindex="-1">如果由你建國，<br>你會選哪一種政府？</h1>
   <p class="home-lead">回答幾個關於政府規則的問題，看看你的選擇比較像內閣制、總統制，還是混合制。</p>
   <div class="home-actions">
    <button class="button start" data-action="start">${started?(completed()?'查看我的結果':'接著作答'):'開始投票'}</button>
    ${started?'<button class="button secondary" data-action="reset">重新開始</button>':''}
   </div>
   <p class="home-note">共 ${questions().length} 題，約 3 分鐘</p>
  </div>
  <div class="ballot-visual" aria-hidden="true"><svg viewBox="0 0 360 390" focusable="false"><path d="M47 207L160 153L311 214L199 277Z" fill="#e5efff" stroke="#173f86" stroke-width="5"/><path d="M47 207V314L198 372V277Z" fill="#173f86" stroke="#173f86" stroke-width="5"/><path d="M198 277V372L311 309V214Z" fill="#b7ceee" stroke="#173f86" stroke-width="5"/><path d="M118 220L225 253" stroke="#173f86" stroke-width="9" stroke-linecap="round"/><g transform="rotate(-14 181 140)"><path d="M106 39H250V215H106Z" fill="#fff" stroke="#173f86" stroke-width="5"/><path d="M125 65H165V105H125Z" fill="none" stroke="#173f86" stroke-width="4"/><path d="M128 81L142 97L174 58" fill="none" stroke="#c8372a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M184 78H231M125 133H231M125 158H215M125 184H231" stroke="#173f86" stroke-width="5" stroke-linecap="round"/></g><circle cx="279" cy="82" r="35" fill="#c8372a"/><path d="M262 81L275 94L297 67" fill="none" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
 </section>`;
}

function steps(){
 const qs=questions();
 return `<ol class="steps" aria-label="作答進度">${qs.map((q,i)=>`<li class="${answers[q.id]?'done':''} ${i===index?'current':''}"><span class="sr-only">第${i+1}題${answers[q.id]?'，已作答':''}</span></li>`).join('')}</ol>`;
}

function question(){
 const qs=questions(),q=qs[index];
 root.innerHTML=`<section class="quiz">
  <div class="quiz-top"><p class="progress-text">第 ${index+1} 題<span>／共 ${qs.length} 題</span></p>${steps()}</div>
  <div class="question-head">
   <h1 id="question-title" tabindex="-1">${escape(q.title)}</h1>
   ${q.stem?`<p class="stem" id="question-stem">${escape(q.stem)}</p>`:''}
   ${q.help?`<p class="hint" id="question-help"><span class="hint-label">小提醒</span>${escape(q.help)}</p>`:''}
  </div>
  <fieldset class="options" aria-labelledby="question-title" ${q.stem||q.help?`aria-describedby="${q.stem?'question-stem ':''}${q.help?'question-help':''}"`:''}>
   <legend class="sr-only">請選一個答案</legend>
   ${q.options.map(o=>`<label class="option ${answers[q.id]===o.id?'selected':''}"><input type="radio" name="${q.id}" value="${o.id}" ${answers[q.id]===o.id?'checked':''}><span class="box">${check}</span><span class="option-copy"><span class="option-title">${escape(o.label)}</span><span class="option-description">${escape(o.text)}</span></span></label>`).join('')}
  </fieldset>
  <div class="actions">
   <button class="button secondary" data-action="previous">${index===0?'回到首頁':'上一題'}</button>
   <button class="button" data-action="next" ${answers[q.id]?'':'disabled'}>${returnToReview?'回到確認頁':index===qs.length-1?'確認我的答案':'下一題'}</button>
  </div>
 </section>`;
}

function review(){
 root.innerHTML=`<section class="quiz review">
  <h1 tabindex="-1">這是你的建國方案</h1>
  <p class="stem">看一下，有沒有想改的地方？</p>
  <ol class="review-list">${questions().map((q,i)=>{const o=q.options.find(o=>o.id===answers[q.id]);return `<li class="review-row"><div class="review-copy"><p class="review-title">${i+1}. ${escape(q.title)}</p><p class="review-answer">${o?escape(o.label):'還沒作答'}</p></div><button class="edit" data-action="edit" data-index="${i}" aria-label="修改第${i+1}題">修改</button></li>`;}).join('')}</ol>
  <div class="actions"><button class="button secondary" data-action="last">上一題</button><button class="button" data-action="result" ${completed()?'':'disabled'}>揭曉結果</button></div>
 </section>`;
}

function matched(result){return result.details.filter(d=>d.similarity===1).sort((a,b)=>b.question.weight-a.question.weight).slice(0,3);}
function differences(result){return result.details.filter(d=>d.similarity<1).sort((a,b)=>b.lost-a.lost).slice(0,2);}
function systemOf(country){return data.systems.find(s=>s.id===country.group);}
function rankCard(r,top){
 const c=r.country,sys=systemOf(c);
 return `<details class="country-rank"><summary><span class="country-summary"><span class="country-name">${escape(c.name)}</span><span class="country-type" style="--sys:${sys.color}">${escape(c.system)}</span></span><span class="country-score">${r.percent}%</span></summary>
  <div class="country-body"><p>${escape(c.feature)}</p><h3>需要一起考慮的事</h3><p>${escape(c.tradeoff)}</p><h3>想一想</h3><p>${escape(c.discussion)}</p>
  <details><summary>我的選擇與${escape(c.name)}的差異</summary>${differences(r).map(d=>`<div class="different"><p class="answer-label">${escape(d.question.title)}</p><p>你選：${optionText(d.choice)}</p><p>${escape(c.name)}：${optionText(d.target)}</p></div>`).join('')||`<p>你的每個選擇都和${escape(c.name)}在本測驗中的設定相同。</p>`}</details>
  <details><summary>制度細節與資料來源</summary><p>${escape(c.notes)}</p>${sourceLinks(c)}</details></div></details>`;
}

function result(){
 let scored;
 try{scored=engine.calculate(data,answers);}catch{navigate('review');return;}
 const top=scored.results[0],c=top.country;
 const tiedSystems=scored.topSystems.length>1;
 const lead=scored.topSystems[0].system;
 const nearest=scored.winners.map(r=>`<span class="nowrap">${escape(r.country.name)}</span>`).join('、');
 const card=tiedSystems
  ?`<div class="verdict tied" style="--sys:${scored.topSystems[0].system.color};--sys2:${scored.topSystems[1].system.color};--tint:${lead.tint}">
     <p class="verdict-pre">你的建國方案介於</p>
     <p class="verdict-name"><span class="nowrap">${escape(scored.topSystems[0].system.name)}<span class="verdict-and">和</span></span><span class="nowrap">${escape(scored.topSystems[1].system.name)}<span class="verdict-suffix">之間</span></span></p>
     <p class="verdict-def">你的選擇同時具有兩種制度的特色，可以想想哪一題讓它們分不出高下。</p>
    </div>`
  :`<div class="verdict" style="--sys:${lead.color};--tint:${lead.tint}">
     <p class="verdict-pre">你的建國方案屬於</p>
     <p class="verdict-name">${escape(lead.name)}<span class="verdict-suffix">派</span></p>
     <p class="verdict-def">${escape(lead.definition)}</p>
     <p class="verdict-eg">代表國家：${escape(lead.examples)}</p>
    </div>`;
 const topSys=systemOf(c);
 const countryCard=`<div class="nation" style="--sys:${topSys.color};--tint:${topSys.tint}">
   <div class="nation-main">
    <p class="nation-label">最接近的國家</p>
    <p class="nation-name${scored.winners.length>1?' multi':''}">${nearest}</p>
   </div>
   <p class="nation-score"><span class="nation-num">${top.percent}</span><span class="nation-unit">%</span></p>
   <p class="nation-feature">${scored.winners.length>1?'這幾個國家和你的選擇一樣接近，可以在下方「比較6個國家」展開看看。':`<span class="nation-tag">${escape(c.system)}</span>${escape(c.short_feature||c.feature)}`}</p>
  </div>`;
 const bars=`<div class="bars" role="list" aria-label="三種制度的相似程度">${scored.systems.map(s=>`<div class="bar-row" role="listitem" style="--sys:${s.system.color}"><span class="bar-name">${escape(s.system.name)}</span><span class="bar-track"><span class="bar-fill" style="width:${s.percent}%"></span></span><span class="bar-value">${s.percent}%</span></div>`).join('')}</div>`;
 root.innerHTML=`<section class="result">
  <h1 class="sr-only" tabindex="-1">結果：${tiedSystems?scored.topSystems.map(s=>escape(s.system.name)).join('和')+'之間':escape(lead.name)+'派'}</h1>
  <div class="result-grid">
   <div class="result-main">
    ${card}
    ${tiedSystems?'':`<div class="think"><p class="think-label">想一想</p><p>${escape(lead.think)}</p></div>`}
   </div>
   <div class="result-side">
    ${countryCard}
    ${bars}
    <div class="actions result-actions"><button class="button secondary" data-action="review">修改答案</button><button class="button secondary" data-action="reset">再玩一次</button></div>
   </div>
  </div>
  <div class="result-extras">
   <details class="result-more"><summary>為什麼最接近${escape(c.name)}？</summary><div class="result-detail-body">
    ${scored.winners.length>1?`<p class="minor">你和${nearest}的相似程度相同，以下先以${escape(c.name)}說明。</p>`:''}
    <h3>和${escape(c.name)}相同的選擇</h3>
    <ul class="answer-list">${matched(top).map(d=>`<li><p class="answer-label">${escape(d.question.title)}</p><p>${escape(d.choice.label)}</p></li>`).join('')||'<li>你的答案多為部分接近，可以從下方差異開始比較。</li>'}</ul>
    <h3>不一樣的地方</h3>
    ${differences(top).map(d=>`<div class="different"><p class="answer-label">${escape(d.question.title)}</p><p><strong>你選：</strong>${escape(d.choice.label)}</p><p><strong>${escape(c.name)}：</strong>${escape(d.target.label)}</p></div>`).join('')||`<p>你的每個選擇都和${escape(c.name)}在本測驗中的設定相同。</p>`}
   </div></details>
   <details class="result-more"><summary>比較${scored.results.length}個國家</summary><div class="result-detail-body">${scored.results.map(r=>rankCard(r,top.raw)).join('')}</div></details>
   <details class="result-more"><summary>查看各題解析</summary><div class="result-detail-body">${questions().map(q=>`<details><summary>${escape(q.title)}</summary><p>${escape(q.explanation)}</p></details>`).join('')}</div></details>
  </div>
  <p class="minor result-note">百分比是你的選擇和各國制度設定的相似程度，用來引起討論，不是性向測驗。各國制度都有例外，請搭配課本一起看。</p>
 </section>`;
}

function render(){document.body.dataset.view=view;document.querySelector('.footer').hidden=view!=='home';if(view==='home')home();else if(view==='question')question();else if(view==='review')review();else result();}

root.addEventListener('change',event=>{
 if(!event.target.matches('input[type=radio]'))return;
 const q=questions()[index];answers[q.id]=event.target.value;save();
 root.querySelectorAll('.option').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked));
 root.querySelector('[data-action=next]').disabled=false;
 root.querySelectorAll('.steps li')[index]?.classList.add('done');
});
root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
 switch(button.dataset.action){
  case 'start':returnToReview=false;if(completed())navigate('result');else{index=questions().findIndex(q=>!answers[q.id]);navigate('question');}break;
  case 'reset':answers={};index=0;returnToReview=false;save();navigate('home');break;
  case 'previous':returnToReview=false;if(index===0)navigate('home');else{index--;save();navigate('question');}break;
  case 'next':if(returnToReview||index===questions().length-1){returnToReview=false;navigate('review');}else{index++;save();navigate('question');}break;
  case 'last':index=questions().length-1;returnToReview=false;navigate('question');break;
  case 'edit':index=Number(button.dataset.index);returnToReview=true;navigate('question');break;
  case 'result':navigate('result');break;
  case 'review':navigate('review');break;
 }
});
render();
})();
