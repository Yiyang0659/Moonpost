const QUESTIONS = [
 ['中秋节通常在农历哪一天？',['八月十五','七月十五','九月初九'],0,'中秋节在农历八月十五，此时正值秋季中间。'],
 ['“但愿人长久，千里共婵娟”出自谁的作品？',['李白','苏轼','杜甫'],1,'这两句出自苏轼的《水调歌头·明月几时有》。'],
 ['传说中，谁在月宫里捣药？',['玉兔','青鸟','白鹿'],0,'玉兔捣药是中国流传已久的月亮神话。'],
 ['“海上生明月，天涯共此时”的作者是谁？',['王维','张九龄','孟浩然'],1,'这两句出自唐代张九龄的《望月怀远》。'],
 ['以下哪一种是中秋节常见的习俗？',['赏月','登高插茱萸','挂艾草'],0,'赏月、吃月饼是中秋节的代表性习俗。'],
 ['传说中，吴刚在月宫里做什么？',['种桃','伐桂','捕鱼'],1,'吴刚伐桂是与月亮相关的民间传说。'],
 ['“举头望明月，低头思故乡”出自哪首诗？',['静夜思','春晓','登鹳雀楼'],0,'这是李白《静夜思》中的诗句，以月亮寄托思乡之情。'],
 ['月亮本身会像太阳一样发光吗？',['会','不会，它反射太阳光','只在中秋会'],1,'我们看到的月光主要来自月面反射的太阳光。'],
 ['从新月到下一次新月大约需要多久？',['7天','15天','29.5天'],2,'月相变化的一个周期称为朔望月，平均约29.5天。'],
 ['“月有阴晴圆缺”下一句是什么？',['此事古难全','把酒问青天','何似在人间'],0,'“人有悲欢离合，月有阴晴圆缺，此事古难全”出自苏轼《水调歌头》。'],
 ['哪种花常与中秋的时节和意象相联系？',['桂花','荷花','梅花'],0,'桂花常在秋季开放，桂香与中秋意象相伴。'],
 ['农历每月十五前后的月相通常叫什么？',['新月','满月','下弦月'],1,'十五前后通常接近满月；实际最圆时刻不一定恰在十五。']
];
const PERSONAS = [
 ['嫦娥','清辉诗人','你珍惜独处，也懂得让温柔被看见。对你来说，美好藏在月光与日常之间。','给自己留一段没有安排的夜晚。','☾'],
 ['玉兔','人间开心果','你有敏锐的好奇心，愿意用小小的行动照亮身边的人。热闹因你而多了一点暖意。','把今天的小惊喜分享给一个朋友。','✧'],
 ['吴刚','踏实筑梦家','你相信慢慢来的力量。面对值得的事，你往往比自己想象中更有耐心。','认真做事，也记得为自己庆祝。','山'],
 ['桂树','温柔守护者','你让相处变得安心。你记得细节，懂得倾听，也有属于自己的坚定。','照顾别人之前，先问问自己的需要。','❋'],
 ['星君','自在探索者','你常从不同角度看世界，喜欢新鲜的风景，也愿意为灵感走一段远路。','沿着好奇心，试试一件小小的新事。','✦'],
 ['月老','团圆连接者','你擅长牵起人与人的联系。你在意共同的回忆，也愿意主动制造下一次相聚。','约一个想念的人，聊聊最近的生活。','∞']
];
const SCENES = [
 ['游园会开场，你会先去哪里？',[['找个安静位置赏月',0],['看看哪个摊位最好玩',1],['约齐朋友一起逛',5]]],
 ['准备中秋礼物，你更愿意……',[['亲手做一份小礼物',2],['挑选对方念叨过的东西',3],['找一件出人意料的新奇好物',4]]],
 ['月下散步时，你最先注意到……',[['水中的月影',0],['路旁飘来的桂花香',3],['远处从没走过的小路',4]]],
 ['朋友聚会有些冷场，你会……',[['提议玩一个小游戏',1],['找一个大家都有共鸣的话题',5],['安静陪伴，等话题自然发生',0]]],
 ['遇到一个很难的灯谜，你会……',[['耐心推敲每个字',2],['换一个有趣的角度想',4],['拉上朋友一起猜',5]]],
 ['突然下雨，赏月计划泡汤了，你会……',[['把房间布置成温暖小茶馆',3],['即兴来一场室内游戏',1],['听雨读书，也很不错',0]]],
 ['一段旅途中，你最看重……',[['探索从未见过的风景',4],['和同行的人留下回忆',5],['踏踏实实走完想走的路',2]]],
 ['朋友有心事时，你通常会……',[['耐心听他说完',3],['用一点幽默让他轻松些',1],['陪他梳理可以做的下一步',2]]],
 ['如果拥有一间月宫小屋，你会放上……',[['书、茶和一扇大窗',0],['一张能坐下很多人的长桌',5],['收藏新奇发现的展示架',4]]],
 ['一起筹备活动，你最愿意负责……',[['把细节一步步落实',2],['照顾大家的需要',3],['设计有趣的互动',1]]],
 ['忙碌一周后，你会如何充电？',[['安静地整理自己的思绪',0],['去陌生街区散散步',4],['和熟悉的人吃顿饭',5]]],
 ['送给今晚一句话，你会选……',[['愿每一份努力都有回响',2],['愿你被世界温柔以待',3],['愿快乐像月光一样满满',1]]]
];
function shuffledQuestions(){const deck=[...QUESTIONS];for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck.slice(0,8);}
function safeList(value,validate){return Array.isArray(value)?value.filter(validate):[];}
function selectOption(buttons,index){buttons.forEach((button,i)=>{button.classList.toggle('selected',i===index);button.setAttribute('aria-pressed',String(i===index));});}
function optionsHTML(opts){return opts.map((v,i)=>`<button class="soc-option" aria-pressed="false" data-choice="${i}"><span>${String.fromCharCode(65+i)}</span><b>${v}</b><i>○</i></button>`).join('');}
export function mountQuiz(container,ctx){
 let deck=shuffledQuestions(), index=0,score=0,chosen=-1,answered=false;
 function render(){
  if(index===deck.length){ctx.award('quiz');const ranks=safeList(ctx.get('quiz-records',[]),r=>r&&Number.isInteger(r.score)&&r.score>=0&&r.score<=8&&typeof r.date==='string'&&/^[0-9/.-]{1,20}$/.test(r.date));ranks.push({score,date:new Date().toLocaleDateString('zh-CN')});ranks.sort((a,b)=>b.score-a.score);ctx.set('quiz-records',ranks.slice(0,5));container.innerHTML=`<div class="soc-result"><div class="eyebrow">MOONLIGHT SCHOLAR</div><div class="soc-seal">知</div><h2>${score>=6?'今夜，你是赏月学士':'又认识了月亮一点'}</h2><p>本轮答对 <strong>${score} / 8</strong> 题，知识问答印章已收好。</p><button class="btn" data-replay>再赴一场月下小考 ↗</button><div class="soc-record"><h3>我的月下成绩册</h3><p class="soc-note">仅记录在当前浏览器</p>${ranks.slice(0,5).map((r,i)=>`<div><span>0${i+1} · ${r.date}</span><b>${r.score} / 8</b></div>`).join('')}</div></div>`;container.querySelector('[data-replay]').onclick=()=>{deck=shuffledQuestions();index=0;score=0;chosen=-1;answered=false;render();};return;}
  const q=deck[index];container.innerHTML=`<div class="soc-quiz"><div class="soc-question-top"><span class="eyebrow">月下小考 · 中秋知识</span><span>${String(index+1).padStart(2,'0')} / 08</span></div><div class="soc-progress"><i style="width:${index/8*100}%"></i></div><h2>${q[0]}</h2><p class="soc-note">选一个答案，让月亮告诉你。</p><div class="soc-options">${optionsHTML(q[1])}</div><div class="soc-feedback" aria-live="polite"></div><button class="btn soc-next" disabled>确认答案 ↗</button></div>`;
  const buttons=[...container.querySelectorAll('[data-choice]')],next=container.querySelector('.soc-next');buttons.forEach((button,i)=>button.onclick=()=>{if(answered)return;chosen=i;selectOption(buttons,i);next.disabled=false;});
  next.onclick=()=>{if(!answered){if(chosen<0)return;answered=true;if(chosen===q[2])score++;buttons.forEach((b,i)=>{b.disabled=true;if(i===q[2])b.classList.add('correct');else if(i===chosen)b.classList.add('incorrect');});container.querySelector('.soc-feedback').textContent=(chosen===q[2]?'答对啦。':'再记住一点月亮的故事。')+' '+q[3];next.textContent=index===7?'查看我的成绩 ↗':'下一题 ↗';}else{index++;chosen=-1;answered=false;render();}};
 }render();return()=>{container.replaceChildren();};
}
export function mountPersona(container,ctx){let index=0,answers=[];
 function result(type){const p=PERSONAS[type];container.innerHTML=`<div class="soc-result soc-persona-result"><div class="eyebrow">你的月宫角色 · JUST FOR FUN</div><div class="soc-orbit"><span>${p[4]}</span></div><p class="soc-note">月光寄来的身份签</p><h2>${p[0]} <small>· ${p[1]}</small></h2><p class="soc-persona-description">${p[2]}</p><blockquote>「 ${p[3]} 」</blockquote><p class="soc-note">一份轻松的游园小测试，不是专业心理评估。</p><button class="btn" data-replay>再遇见一个自己 ↗</button></div>`;container.querySelector('[data-replay]').onclick=()=>{index=0;answers=[];render();};}
 function render(){if(index===12){let points=Array(6).fill(0);answers.forEach(n=>points[n]++);const type=points.indexOf(Math.max(...points));ctx.set('persona-result',type);ctx.award('persona');result(type);return;}
 const scene=SCENES[index];container.innerHTML=`<div class="soc-quiz"><div class="soc-question-top"><span class="eyebrow">月宫来信 · 找到你的角色</span><span>${String(index+1).padStart(2,'0')} / 12</span></div><div class="soc-progress"><i style="width:${index/12*100}%"></i></div><h2>${scene[0]}</h2><p class="soc-note">没有标准答案，选更像你的那一个。</p><div class="soc-options">${optionsHTML(scene[1].map(a=>a[0]))}</div><div class="soc-persona-actions"><button class="btn secondary" data-back ${index===0?'disabled':''}>上一题</button><button class="btn" data-next disabled>${index===11?'揭晓月宫身份':'下一题'} ↗</button></div></div>`;let chosen=scene[1].findIndex(a=>a[1]===answers[index]);const buttons=[...container.querySelectorAll('[data-choice]')],next=container.querySelector('[data-next]');selectOption(buttons,chosen);next.disabled=chosen<0;buttons.forEach((b,i)=>b.onclick=()=>{chosen=i;answers[index]=scene[1][i][1];selectOption(buttons,i);next.disabled=false;});next.onclick=()=>{if(chosen<0)return;answers[index]=scene[1][chosen][1];index++;render();};container.querySelector('[data-back]').onclick=()=>{if(index>0){index--;render();}};
 }const saved=ctx.get('persona-result',null);if(Number.isInteger(saved)&&saved>=0&&saved<6)result(saved);else render();return()=>container.replaceChildren();}
export function mountWall(container,ctx){let messages=safeList(ctx.get('wall-messages',[]),m=>m&&typeof m.id==='string'&&typeof m.name==='string'&&typeof m.text==='string'&&typeof m.date==='string'&&m.text.trim().length>0).slice(-50).map(m=>({...m,name:m.name.slice(0,16),text:m.text.slice(0,40),date:m.date.slice(0,20)}));
 container.innerHTML=`<div class="soc-wall"><div class="soc-lantern-sky" aria-hidden="true"><div class="soc-lantern">团<br>圆</div><div class="soc-lantern">如<br>愿</div><div class="soc-lantern">安<br>康</div><span class="soc-sky-moon"></span></div><div class="soc-wall-layout"><form class="soc-wall-form"><div class="eyebrow">把心愿交给月亮</div><h2>点一盏灯，寄一份念想。</h2><p class="soc-note">本机心愿册，保存在当前浏览器。</p><label>你的名字 <span>（选填）</span><input name="nickname" maxlength="16" placeholder="一位赏月的人" autocomplete="off"></label><label>今夜想说的话<textarea name="wish" maxlength="40" rows="3" required placeholder="愿我们所念皆如愿，所行皆坦途。"></textarea></label><div class="soc-count">0 / 40</div><div class="soc-quick"><button type="button">愿人长久，千里共婵娟</button><button type="button">愿所念皆如愿，月圆人团圆</button><button type="button">愿家人平安，日日有欢喜</button></div><button class="btn" type="submit">放飞我的心愿 ↗</button><div class="soc-wall-status" aria-live="polite"></div></form><section class="soc-wishes"><div class="soc-wishes-heading"><h3>我的心愿灯</h3><span></span></div><div class="soc-message-list"></div></section></div></div>`;
 const form=container.querySelector('form'),field=form.elements.wish, count=container.querySelector('.soc-count');field.oninput=()=>{field.setCustomValidity('');count.textContent=field.value.length+' / 40';};container.querySelectorAll('.soc-quick button').forEach(b=>b.onclick=()=>{field.value=b.textContent;field.oninput();field.focus();});
 function list(){const host=container.querySelector('.soc-message-list');host.replaceChildren();container.querySelector('.soc-wishes-heading span').textContent=messages.length+' 盏';if(!messages.length){const empty=document.createElement('p');empty.className='soc-empty';empty.textContent='月光已经准备好了，等你的第一盏心愿灯。';host.append(empty);return;}messages.slice().reverse().forEach(m=>{const article=document.createElement('article');article.className='soc-wish-card';const icon=document.createElement('span');icon.className='soc-wish-icon';icon.textContent='✦';const content=document.createElement('p');content.textContent=m.text;const footer=document.createElement('footer'),name=document.createElement('span');name.textContent=(m.name||'一位赏月的人')+' · '+m.date;const del=document.createElement('button');del.type='button';del.textContent='收起';del.setAttribute('aria-label','删除这条本机心愿');del.onclick=()=>{messages=messages.filter(x=>x.id!==m.id);ctx.set('wall-messages',messages);list();};footer.append(name,del);article.append(icon,content,footer);host.append(article);});}
 form.onsubmit=e=>{e.preventDefault();const text=field.value.trim();if(!text){field.setCustomValidity('写下一句心愿吧');field.reportValidity();return;}messages.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:form.elements.nickname.value.trim().slice(0,16),text:text.slice(0,40),date:new Date().toLocaleDateString('zh-CN')});messages=messages.slice(-50);ctx.set('wall-messages',messages);ctx.award('wall');field.value='';count.textContent='0 / 40';container.querySelector('.soc-wall-status').textContent='这份心愿已存入本机心愿册。';list();ctx.toast('心愿已点亮，愿你所念皆如愿');};list();return()=>container.replaceChildren();}
