(function(){
'use strict';
const data=QUIZ_DATA;
const key='government-quiz-'+data.version;
const root=document.getElementById('app');
let answers={},index=0,view='home',returnToReview=false;
try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved?.answers){for(const q of data.questions){if(q.options.some(o=>o.id===saved.answers[q.id]))answers[q.id]=saved.answers[q.id];}index=Math.min(data.questions.length-1,Math.max(0,Number(saved.index)||0));}}catch{}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const optionText=o=>`${escape(o.label||'')}：${escape(o.text)}`;
const completed=()=>data.questions.every(q=>answers[q.id]);
const count=()=>Object.keys(answers).length;
function save(){try{sessionStorage.setItem(key,JSON.stringify({answers,index}));}catch{}}
function focusTitle(){requestAnimationFrame(()=>{root.querySelector('h1')?.focus();window.scrollTo({top:0,behavior:'instant'});});}
function navigate(to){view=to;render();focusTitle();}
function sourceLinks(country){return `<ul class="sources">${country.sources.map(id=>{const s=data.sources[id];return `<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a></li>`;}).join('')}</ul>`;}
function home(){
root.innerHTML=`<section class="intro election-hero"><div class="election-copy"><h1 tabindex="-1">你的理想政府，<br>最接近哪一國？</h1><p class="hero-description">投下你的選擇，打造心中的理想政府。</p><div class="intro-actions"><button class="button" data-action="start">${count()?(completed()?'查看我的結果':'接著作答'):'開始投票'}</button>${count()?'<button class="button secondary" data-action="reset">重新開始</button>':''}</div></div><div class="ballot-visual" aria-hidden="true"><svg viewBox="0 0 360 390" focusable="false"><path d="M47 207L160 153L311 214L199 277Z" fill="#e5efff" stroke="#173f86" stroke-width="5"/><path d="M47 207V314L198 372V277Z" fill="#173f86" stroke="#173f86" stroke-width="5"/><path d="M198 277V372L311 309V214Z" fill="#b7ceee" stroke="#173f86" stroke-width="5"/><path d="M118 220L225 253" stroke="#173f86" stroke-width="9" stroke-linecap="round"/><g transform="rotate(-14 181 140)"><path d="M106 39H250V215H106Z" fill="#fff" stroke="#173f86" stroke-width="5"/><path d="M125 65H165V105H125Z" fill="none" stroke="#173f86" stroke-width="4"/><path d="M128 81L142 97L174 58" fill="none" stroke="#cf3d3d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M184 78H231M125 133H231M125 158H215M125 184H231" stroke="#173f86" stroke-width="5" stroke-linecap="round"/></g><circle cx="279" cy="82" r="35" fill="#cf3d3d"/><path d="M262 81L275 94L297 67" fill="none" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div></section>`;
}
function question(){
 const q=data.questions[index];
 root.innerHTML=`<section class="quiz"><div class="progress-text"><span>第 ${index+1} 題，共 ${data.questions.length} 題</span><span>已完成 ${count()} 題</span></div><div class="progress-track" role="progressbar" aria-label="已完成題數" aria-valuemin="0" aria-valuemax="${data.questions.length}" aria-valuenow="${count()}"><div class="progress-fill" style="width:${count()/data.questions.length*100}%"></div></div><div class="question"><h1 id="question-title" tabindex="-1">${escape(q.title)}</h1>${q.role_intro?`<div class="role-intro" aria-label="先認識兩個角色">${q.role_intro.map(r=>`<p><strong>${escape(r.label)}</strong><span>${escape(r.description)}</span></p>`).join('')}</div>`:''}${q.stem?`<p class="stem" id="question-stem">${escape(q.stem)}</p>`:''}${q.help?`<details class="helper question-helper" id="question-help" open><summary>小提醒</summary><p>${escape(q.help)}</p></details>`:""}<fieldset class="options" aria-labelledby="question-title" aria-describedby="${q.stem?'question-stem ':''}${q.help?'question-help':''}"><legend class="sr-only">請選一個答案</legend>${q.options.map(o=>`<label class="option ${answers[q.id]===o.id?'selected':''}"><input type="radio" name="${q.id}" value="${o.id}" ${answers[q.id]===o.id?'checked':''}><span class="option-copy"><span class="option-title">${escape(o.label)}</span><span class="option-description">${escape(o.text)}</span></span></label>`).join('')}</fieldset><div class="actions"><button class="button secondary" data-action="previous">${index===0?'回到首頁':'上一題'}</button><button class="button" data-action="next" ${answers[q.id]?'':'disabled'}>${returnToReview?'返回確認答案':index===data.questions.length-1?'確認我的答案':'下一題'}</button></div></div></section>`;
}
function review(){
root.innerHTML=`<section class="quiz review"><h1 tabindex="-1">這是你選的建國規則</h1><p class="stem">看一下，有沒有想改的地方？</p><ol class="review-list">${data.questions.map((q,i)=>{const o=q.options.find(o=>o.id===answers[q.id]);return `<li class="review-row"><div class="review-copy"><p class="review-title">${i+1}. ${escape(q.title)}</p><p class="review-answer">${o?optionText(o):'還沒作答'}</p></div><button class="edit" data-action="edit" data-index="${i}" aria-label="修改第${i+1}題">修改</button></li>`;}).join('')}</ol><div class="actions"><button class="button secondary" data-action="last">回到上題</button><button class="button" data-action="result" ${completed()?'':'disabled'}>揭曉配對</button></div></section>`;
}
function matched(result){return result.details.filter(d=>d.similarity===1).sort((a,b)=>b.question.weight-a.question.weight).slice(0,3);}
function differences(result){return result.details.filter(d=>d.similarity<1).sort((a,b)=>b.lost-a.lost).slice(0,2);}
function rankCard(r,top){const c=r.country;return `<details class="country-rank"><summary><span class="country-summary">${escape(c.name)}<span class="country-type">${escape(c.system)}${r.raw===top?'，最高配對':top-r.raw<=5?'，相近配對':''}</span></span><span class="country-score">${r.percent}%</span></summary><div class="country-body"><p>${escape(c.feature)}</p><h3>需要一起考慮的事</h3><p>${escape(c.tradeoff)}</p><h3>想一想</h3><p>${escape(c.discussion)}</p><details><summary>我的選擇與這個國家的差異</summary>${differences(r).map(d=>`<div class="different"><p class="answer-label">${escape(d.question.title)}</p><p>你選：${optionText(d.choice)}</p><p>${escape(c.name)}的安排：${optionText(d.target)}</p></div>`).join('')||'<p>你選的${data.questions.length}項規則，都符合這個國家在本測驗中的設定。</p>'}</details><details><summary>制度細節與資料來源</summary><p>${escape(c.notes)}</p>${sourceLinks(c)}</details></div></details>`;}
function result(){
 let scored;
 try{scored=QuizEngine.calculate(data,answers);}catch{navigate('review');return;}
 const top=scored.results[0],c=top.country;
 const tied=scored.winners.length>1;
 const heading=tied
  ?`你與${scored.winners.map(r=>escape(r.country.name)).join('、')}<br>同樣適合，各 <span class="percentage">${top.percent}%</span>`
  :`你有 <span class="percentage">${top.percent}%</span><br>適合${escape(c.name)}！`;
 const summary=tied?'你的選擇接近多個國家。展開「比較12個國家」，可以查看各個並列配對。':c.short_feature||c.feature;
 root.innerHTML=`<section class="result result-compact">
  <div class="result-heading">
   <h1 tabindex="-1">${heading}</h1>
   <p class="result-subtitle">${tied?'並列配對':escape(c.system)}</p>
   <p>${escape(summary)}</p>
   ${scored.mixed?'<p class="minor">你的偏好結合了多種制度，這是相對最接近的配對。</p>':''}
  </div>
  <div class="section-actions compact-actions">
   <button class="button" data-action="review">修改答案</button>
   <button class="button secondary" data-action="reset">重新開始</button>
  </div>
  <div class="result-extras">
   <details class="result-more">
    <summary>${tied?'查看配對原因與差異':'為什麼配對到'+escape(c.name)+'？'}</summary>
    <div class="result-detail-body">
     ${tied?'<p class="minor">以下先以'+escape(c.name)+'說明，其他並列國家可在國家比較中展開。</p>':''}
     <h3>與你相同的選擇</h3>
     <ul class="answer-list">${matched(top).map(d=>`<li><p class="answer-label">${escape(d.question.title)}</p><p>${optionText(d.choice)}</p></li>`).join('')||'<li>你的答案多為部分接近，可以從下方差異開始比較。</li>'}</ul>
     <h3>仍有差異的地方</h3>
     ${differences(top).map(d=>`<div class="different"><p class="answer-label">${escape(d.question.title)}</p><p><strong>你選：</strong>${optionText(d.choice)}</p><p><strong>${escape(c.name)}：</strong>${optionText(d.target)}</p></div>`).join('')||'<p>你選的${data.questions.length}項規則，都符合這個國家在本測驗中的設定。</p>'}
     <h3>需要一起考慮的事</h3><p>${escape(c.tradeoff)}</p>
    </div>
   </details>
   <details class="result-more" id="country-comparison">
    <summary>比較12個國家</summary>
    <div class="result-detail-body">${scored.results.map(r=>rankCard(r,top.raw)).join('')}</div>
   </details>
   <details class="result-more explanations">
    <summary>查看各題解析</summary>
    <div class="result-detail-body">${data.questions.map(q=>`<details><summary>${escape(q.title)}</summary><p>${escape(q.explanation)}</p></details>`).join('')}</div>
   </details>
  </div>
 </section>`;
}
function render(){document.body.dataset.view=view;document.querySelector('.footer').hidden=view!=='home';if(view==='home')home();else if(view==='question')question();else if(view==='review')review();else result();}
root.addEventListener('change',event=>{if(event.target.matches('input[type=radio]')){const q=data.questions[index];answers[q.id]=event.target.value;save();root.querySelectorAll('.option').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked));root.querySelector('[data-action=next]').disabled=false;const progress=root.querySelector('[role=progressbar]');progress.setAttribute('aria-valuenow',count());root.querySelector('.progress-fill').style.width=count()/data.questions.length*100+'%';root.querySelector('.progress-text span:last-child').textContent='已完成 '+count()+' 題';}});
root.addEventListener('click',event=>{
const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
switch(button.dataset.action){
case 'start':returnToReview=false;if(completed())navigate('result');else{index=data.questions.findIndex(q=>!answers[q.id]);navigate('question');}break;
case 'reset':answers={};index=0;returnToReview=false;save();navigate('home');break;
case 'previous':returnToReview=false;if(index===0)navigate('home');else{index--;save();navigate('question');}break;
case 'next':if(returnToReview||index===data.questions.length-1){returnToReview=false;navigate('review');}else{index++;save();navigate('question');}break;
case 'last':index=data.questions.length-1;returnToReview=false;navigate('question');break;
case 'edit':index=Number(button.dataset.index);returnToReview=true;navigate('question');break;
case 'result':navigate('result');break;
case 'review':navigate('review');break;
case 'print':window.print();break;
}
});
render();
})();
