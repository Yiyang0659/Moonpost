import {useEffect,useMemo,useRef,useState,type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {award,get,set} from '../lib/storage';
import {readJourney,recordWish} from '../lib/journey';
import WishCard from './wall/WishCard';
import {examples,formatWishDate,postcardState,quick,readWishes,recipients,replyFor,styles,type Recipient,type Wish,type WishStyle} from './wall/model';
import './wall.css';
import './wall/wish-studio.css';

const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const openings:Record<Recipient,string[]>={
  self:['愿下一次抬头看月亮时，我……','今年最想谢谢自己的一件事是……','把一个小小的期待，留给明天的自己：'],
  family:['下一次团圆，我想和你们……','有句话一直藏在心里，今天想说……','如果月光能替我先到家，请捎去……'],
  friend:['下次见面，我们一起……','想再和你经历一次的，是……','把今晚的月光分你一半，还想告诉你……'],
  far:['隔着这段距离，我想对你说……','如果此刻我们看的是同一轮月亮……','下一次相见，我想先……'],
};

export default function WallPage(){
  const navigate=useNavigate();
  const [wishes,setWishes]=useState<Wish[]>(readWishes);
  const [name,setName]=useState('');
  const [message,setMessage]=useState('');
  const [recipient,setRecipient]=useState<Recipient>('self');
  const [style,setStyle]=useState<WishStyle>('moon');
  const [tab,setTab]=useState<'preview'|'album'>('preview');
  const [sort,setSort]=useState<'new'|'old'>('new');
  const [onlyFavorites,setOnlyFavorites]=useState(false);
  const [editing,setEditing]=useState<Wish|null>(null);
  const [suggestion,setSuggestion]=useState('');
  const [replacement,setReplacement]=useState('');
  const [feedback,setFeedback]=useState('');
  const [error,setError]=useState('');
  const [deleteId,setDeleteId]=useState<string|null>(null);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [ceremony,setCeremony]=useState<Wish|null>(null);
  const [latestSaved,setLatestSaved]=useState<string|null>(null);
  const [newStamp,setNewStamp]=useState(false);
  const submitLock=useRef(false);
  const messageRef=useRef<HTMLTextAreaElement>(null);
  const studioRef=useRef<HTMLDivElement>(null);
  const albumRef=useRef<HTMLDivElement>(null);
  const detailRef=useRef<HTMLDivElement>(null);
  const previewTab=useRef<HTMLButtonElement>(null);
  const albumTab=useRef<HTMLButtonElement>(null);
  const [draftDate,setDraftDate]=useState(Date.now);
  const selected=wishes.find(w=>w.id===selectedId);
  const isExample=wishes.length===0;
  const shown=useMemo(()=>isExample?examples:[...wishes].filter(w=>!onlyFavorites||w.favorite).sort((a,b)=>sort==='new'?b.date-a.date:a.date-b.date),[isExample,wishes,onlyFavorites,sort]);
  const draft:Wish={id:editing?.id||'draft',name:name.trim(),text:message,recipient,style,date:editing?.date||draftDate,reply:editing?.reply||'',favorite:editing?.favorite||false};
  const recipientInfo=recipients.find(r=>r.id===recipient)!;
  const dirty=editing?name!==editing.name||message!==editing.text||style!==editing.style||recipient!==editing.recipient:!!message.trim();

  useEffect(()=>{
    const refresh=(event:StorageEvent)=>{if(event.key==='moon-garden:wishes'||event.key===null)setWishes(readWishes())};
    window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh);
  },[]);
  useEffect(()=>{
    if(!ceremony)return;
    const timer=window.setTimeout(finishSealing,reducedMotion()?0:1750);
    return()=>window.clearTimeout(timer);
  },[ceremony]);

  function revealEditor(){setTab('preview');requestAnimationFrame(()=>{messageRef.current?.focus({preventScroll:true});studioRef.current?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'})})}
  function finishSealing(){
    if(!ceremony)return;
    setSelectedId(ceremony.id);setOnlyFavorites(false);setSort('new');setTab('album');setCeremony(null);submitLock.current=false;
    requestAnimationFrame(()=>{albumRef.current?.focus({preventScroll:true});if(window.innerWidth<900)albumRef.current?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'})});
  }
  function chooseText(text:string){
    setSuggestion(text);
    if(message.trim()&&message!==text){setReplacement(text);return}
    setMessage(text);setReplacement('');setError('');setTab('preview');
  }
  function drawOpening(){
    const choices=openings[recipient].filter(text=>text!==suggestion);
    setSuggestion(choices[Math.floor(Math.random()*choices.length)]);setReplacement('');
  }
  function persist(next:Wish[]){
    if(!set('wishes',next)){setError('未能保存到当前浏览器。你的文字仍在，请检查浏览器存储后重试。');return false}
    setWishes(next);setError('');return true;
  }
  function submit(event:FormEvent){
    event.preventDefault();if(submitLock.current)return;
    const text=message.trim();
    if(!text){setError('先写下一句心愿，再把它交给月亮。');messageRef.current?.focus();return}
    if(message.length>40||name.length>12){setError('请将昵称缩短至 12 字、心愿缩短至 40 字后保存。旧留言在保存前不会改变。');return}
    submitLock.current=true;
    const wish:Wish={...draft,id:editing?.id||crypto.randomUUID(),name:name.trim()||'一位赏月人',text,date:editing?.date||Date.now(),reply:editing?.reply||replyFor(recipient)};
    const current=readWishes();
    if(editing&&!current.some(w=>w.id===editing.id)){setError('这封心愿已在另一页面删除。请取消修改后另写一封。');submitLock.current=false;return}
    const next=editing?current.map(w=>w.id===wish.id?{...wish,favorite:w.favorite}:w):[wish,...current];
    if(!persist(next)){submitLock.current=false;return}
    const stamps=get<unknown>('stamps',[]);const alreadyStamped=Array.isArray(stamps)&&stamps.includes('wall');
    recordWish({id:wish.id,name:wish.name,text:wish.text,at:new Date(wish.date).toISOString()});award('wall');
    const savedStamps=get<unknown>('stamps',[]);setNewStamp(!alreadyStamped&&Array.isArray(savedStamps)&&savedStamps.includes('wall'));
    setFeedback(editing?'修改已保存，原来的月亮回笺也为你留着。':'心愿已保存到当前浏览器。拆开回笺，看看月亮想说什么。');
    setLatestSaved(wish.id);setTab('preview');setCeremony(wish);setEditing(null);setMessage('');setSuggestion('');setReplacement('');setDraftDate(Date.now());
  }
  function editWish(wish:Wish){
    if(dirty&&!window.confirm('当前还有未保存的文字，要放弃这些改动并打开这封心愿吗？'))return;
    setEditing(wish);setName(wish.name);setMessage(wish.text);setRecipient(wish.recipient);setStyle(wish.style);setSuggestion('');setReplacement('');setError('');setFeedback('正在修改已保存的心愿，保存后替换原记录。');revealEditor();
  }
  function newLetter(){
    if(dirty&&!window.confirm('放弃当前尚未保存的文字，另写一封心愿吗？'))return;
    setEditing(null);setMessage('');setSuggestion('');setReplacement('');setError('');setFeedback('');setDraftDate(Date.now());revealEditor();
  }
  function favorite(wish:Wish){
    const current=readWishes();const next=current.map(w=>w.id===wish.id?{...w,favorite:!w.favorite}:w);
    if(persist(next))setFeedback(wish.favorite?'已取消珍藏，心愿仍在册中。':'已珍藏，可以在「只看珍藏」中找到。');
  }
  function remove(id:string){
    const next=readWishes().filter(w=>w.id!==id);
    // Remove the deleted text from the journey's latest-wish snapshot too; keep the earned stamp.
    const journey=readJourney();const previousJourney=structuredClone(journey);let journeyChanged=false;
    if(journey.wall?.latest.id===id){const latest=[...next].sort((a,b)=>b.date-a.date)[0];if(latest)journey.wall={latest:{id:latest.id,name:latest.name,text:latest.text,at:new Date(latest.date).toISOString()}};else delete journey.wall;
      if(!set('journey-v1',journey)){setError('旅程里的心愿副本未能移除，尚未删除这封信。请重试。');return}
      journeyChanged=true;
    }
    if(!persist(next)){if(journeyChanged)set('journey-v1',previousJourney);return}
    if(journeyChanged)window.dispatchEvent(new Event('moon:journey'));
    setDeleteId(null);if(selectedId===id)setSelectedId(null);if(latestSaved===id)setLatestSaved(null);
    if(editing?.id===id){setEditing(null);setMessage('');setReplacement('');setSuggestion('')}
    setFeedback('这封心愿已从本机删除，已获得的游园邮戳会保留。');
  }
  function showWish(wish:Wish){setSelectedId(wish.id);requestAnimationFrame(()=>{detailRef.current?.focus({preventScroll:true});detailRef.current?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'nearest'})})}
  function toPostcard(wish:Wish){if(dirty&&!window.confirm('前往明信片会离开这里，当前未保存的文字不会带入。继续吗？'))return;navigate('/postcard',{state:postcardState(wish)})}

  return <div className="wall-page">
    <section className="wall-hero" aria-labelledby="wall-title">
      <div className="wall-hero-inner">
        <div className="wall-hero-copy"><span className="wall-kicker">✦ &nbsp;04 / MOON WISHES</span><h2 id="wall-title">月光留言板<span>✦</span></h2><p className="wall-hero-lead">把心愿，交给今晚的月亮。</p><p>千里同月，灯火相望。<br/>在这里，写下一句想说的话，<br/>让它随月光升起，飘向更远的地方。</p><span className="wall-handwriting">小小的心愿<br/>也会被月亮记得 ✧</span></div>
        <div className="wall-hero-scene" aria-hidden="true"><div className="wall-moon"><span>愿所有美好<br/>都如期而至</span></div><div className="wall-horizon"/><div className="wall-lantern wall-lantern-one"><span>愿世界温柔<br/>愿你也是。</span></div><div className="wall-lantern wall-lantern-two"><span>下一站，<br/>一定会更好。</span></div><div className="wall-lantern wall-lantern-three"><span>平安喜乐，<br/>万事顺意。</span></div></div>
      </div>
    </section>
    <div className="wish-studio" ref={studioRef}>
      <div className="wish-intro-line"><p><span>一张信笺，一份只属于你的月光。</span> 从写下到珍藏，让心愿有一个落脚的地方。</p><div aria-label="寄信流程"><span className={!ceremony&&tab==='preview'?'is-current':''}>01 写心愿</span><i>—</i><span className={ceremony?'is-current':''}>02 封存盖戳</span><i>—</i><span className={tab==='album'?'is-current':''}>03 收下回笺</span></div></div>
      <section className="wish-compose wish-panel" aria-labelledby="wish-compose-title">
        <div className="wish-section-title"><div><span className="wish-eyebrow">WRITE A LITTLE WISH</span><h3 id="wish-compose-title">{editing?'修改这封心愿':'今晚，想对谁说？'}</h3></div><span className="wish-section-number" aria-hidden="true">01</span></div>
        {editing&&<div className="wish-edit-note">正在修改已保存的心愿 <button type="button" onClick={newLetter} disabled={!!ceremony}>取消修改</button></div>}
        <form id="wish-form" onSubmit={submit}>
          <fieldset disabled={!!ceremony} className="wish-fields"><legend className="wish-sr-only">写下你的心愿</legend>
            <div className="wish-recipient-group" role="group" aria-label="这封心愿写给谁">{recipients.map(r=><button type="button" key={r.id} aria-pressed={recipient===r.id} onClick={()=>{setRecipient(r.id);setSuggestion('');setReplacement('');setTab('preview')}}>{r.label}</button>)}</div>
            <div className="wish-field-label"><label htmlFor="wish-message">想说的话</label><span>留一点月光给{recipientInfo.label}</span></div>
            <div className="wish-input-wrap"><textarea ref={messageRef} id="wish-message" value={message} rows={4} maxLength={Math.max(40,editing?.text.length||0)} aria-describedby="wish-message-count" placeholder={recipientInfo.prompt} onChange={e=>{setMessage(e.target.value);setError('');setReplacement('');setTab('preview')}}/><span id="wish-message-count" className={message.length>40?'is-over':''}>{message.length} / 40</span></div>
            {(message.length>40||name.length>12)&&<p className="wish-legacy-note">旧版长留言已完整保留。修改后请缩短至当前字数上限再保存。</p>}
            <div className="wish-inspiration"><div><span>还没想好怎么开头？</span><button type="button" onClick={drawOpening}>✧ {suggestion?'再抽一张':'抽一张灵感'}</button></div>
              {suggestion&&<div className="wish-suggestion"><p>{suggestion}</p><button type="button" onClick={()=>chooseText(suggestion)}>用这句开始 ↗</button></div>}
              <details><summary>也可以从一句祝福开始 <span>＋</span></summary><div className="wish-quick-options">{quick.map(q=><button key={q} type="button" onClick={()=>chooseText(q)}>{q}</button>)}</div></details>
              {replacement&&<div className="wish-replace-confirm" role="alert"><p>你已经写了内容，要换成这句话吗？</p><button type="button" onClick={()=>{setMessage(replacement);setReplacement('');setError('');setTab('preview')}}>替换当前文字</button><button type="button" onClick={()=>setReplacement('')}>保留原文</button></div>}
            </div>
            <div className="wish-field-label"><label htmlFor="wish-name">落款 <span>选填</span></label><span>{name.length} / 12</span></div><input id="wish-name" autoComplete="nickname" value={name} maxLength={Math.max(12,editing?.name.length||0)} onChange={e=>{setName(e.target.value);setError('');setTab('preview')}} placeholder="留个名字，或做一位赏月人"/>
          </fieldset>
        </form>
      </section>
      <section className="wish-workspace wish-panel" aria-label="心愿预览与收藏">
        <div className="wish-tabs" role="tablist" aria-label="心愿工作区" onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||ceremony)return;e.preventDefault();const next=e.key==='Home'?'preview':e.key==='End'?'album':tab==='preview'?'album':'preview';setTab(next);(next==='preview'?previewTab:albumTab).current?.focus()}}>
          <button ref={previewTab} type="button" id="wish-preview-tab" role="tab" aria-selected={tab==='preview'} aria-controls="wish-preview-panel" tabIndex={tab==='preview'?0:-1} disabled={!!ceremony} onClick={()=>setTab('preview')}>本封预览 <span>LIVE</span></button>
          <button ref={albumTab} type="button" id="wish-album-tab" role="tab" aria-selected={tab==='album'} aria-controls="wish-album-panel" tabIndex={tab==='album'?0:-1} disabled={!!ceremony} onClick={()=>setTab('album')}>我的心愿册 <b>{wishes.length}</b></button>
        </div>
        {tab==='preview'?<div id="wish-preview-panel" role="tabpanel" aria-labelledby="wish-preview-tab" className="wish-preview-panel">
          <div className="wish-preview-heading"><span className="wish-eyebrow">CHOOSE YOUR PAPER</span><p>挑一张信笺，装下此刻的心意。</p></div>
          <div className="wish-style-options" role="group" aria-label="信笺样式">{styles.map(s=><button type="button" key={s.id} disabled={!!ceremony} aria-pressed={style===s.id} onClick={()=>setStyle(s.id)}><span className={`wish-mini-paper wish-mini-${s.id}`} aria-hidden="true"><i>{s.symbol}</i><em/><em/>{style===s.id&&<b>✓</b>}</span><strong>{s.name}</strong></button>)}</div>
          <div className="wish-preview-stage"><WishCard key={ceremony?.id||`draft-${style}`} wish={ceremony||draft} preview={!ceremony} sealing={!!ceremony}/></div>
          {ceremony?<div className="wish-sealing-status" role="status"><span>✓ 已保存到本机 · 正在为心愿盖戳</span><button type="button" onClick={finishSealing}>跳过动画 →</button></div>:<p className="wish-preview-caption">{styles.find(s=>s.id===style)!.note}<span>文字实时呈现 · 换信笺不会丢失内容</span></p>}
        </div>:<div id="wish-album-panel" role="tabpanel" aria-labelledby="wish-album-tab" ref={albumRef} tabIndex={-1} className="wish-album-panel">
          {latestSaved&&selectedId===latestSaved&&<div className="wish-success-note"><span aria-hidden="true">✓</span><div><strong>{newStamp?'月光留言板邮戳，已收集':'这一刻的心愿，已好好收藏'}</strong><p>{newStamp?'第一封心愿已存好。翻到背面，收下月亮的小纸条。':'封存的是心愿，留下的是此刻的你。'}</p></div><button type="button" onClick={newLetter}>再写一封 ↗</button></div>}
          {selected&&<div className="wish-open-letter" ref={detailRef} tabIndex={-1}><div className="wish-detail-heading"><span>正在阅读 · 写给{recipients.find(r=>r.id===selected.recipient)!.label}</span><button type="button" onClick={()=>{setSelectedId(null);albumRef.current?.focus()}}>收起信笺 ×</button></div><WishCard key={selected.id+'-'+selected.style} wish={selected}/><div className="wish-detail-actions"><button type="button" aria-pressed={selected.favorite} onClick={()=>favorite(selected)}>{selected.favorite?'★ 已珍藏':'☆ 珍藏这封信'}</button><button type="button" onClick={()=>editWish(selected)}>修改心愿</button><button type="button" className="wish-postcard-link" onClick={()=>toPostcard(selected)}>把这份心愿做成明信片 ↗</button></div></div>}
          <div className="wish-album-toolbar"><div><h3>{isExample?'让第一封心愿，从这里开始':'留在月光里的心意'}</h3><p>{isExample?'以下为文案示例，不是真实访客留言。':`${wishes.length} 封心愿 · ${wishes.filter(w=>w.favorite).length} 封珍藏 · 只在这台设备`}</p></div>{!isExample&&<select aria-label="心愿排序" value={sort} onChange={e=>setSort(e.target.value as 'new'|'old')}><option value="new">最近写下</option><option value="old">最早写下</option></select>}</div>
          {!isExample&&<div className="wish-filter" role="group" aria-label="心愿筛选"><button type="button" aria-pressed={!onlyFavorites} onClick={()=>setOnlyFavorites(false)}>全部心愿</button><button type="button" aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites(true)}>☆ 只看珍藏</button></div>}
          <div className="wish-summary-grid">{shown.map(w=><article key={w.id} className={`wish-summary wish-summary-${w.style}${selectedId===w.id?' is-selected':''}`}><div className="wish-summary-heading"><span>{styles.find(s=>s.id===w.style)!.name}</span>{isExample?<b>示例</b>:<button type="button" aria-label={`${w.favorite?'取消珍藏':'珍藏'}：${w.text}`} aria-pressed={w.favorite} onClick={()=>favorite(w)}>{w.favorite?'★':'☆'}</button>}</div><span className="wish-summary-to">写给{recipients.find(r=>r.id===w.recipient)!.label}</span><p>{w.text}</p><div className="wish-summary-byline"><span>{w.name}</span><small>{isExample?'灵感文案':formatWishDate(w.date)}</small></div><div className="wish-summary-actions">{isExample?<button type="button" onClick={()=>{chooseText(w.text);setStyle(w.style);setRecipient(w.recipient);revealEditor()}}>用这句开始 ↗</button>:<><button type="button" aria-expanded={selectedId===w.id} onClick={()=>showWish(w)}>打开信笺 ↗</button><button type="button" className="wish-delete-action" onClick={()=>setDeleteId(w.id)}>删除</button></>}</div>{deleteId===w.id&&<div className="wish-delete-confirm" role="alert"><p>删除这封心愿和回笺？删除后无法恢复。</p><button type="button" onClick={()=>setDeleteId(null)}>保留</button><button type="button" onClick={()=>remove(w.id)}>确认删除</button></div>}</article>)}</div>
          {!shown.length&&<div className="wish-empty"><span>☆</span><p>还没有珍藏的心愿。</p><button type="button" onClick={()=>setOnlyFavorites(false)}>去全部心愿挑一封</button></div>}
          <p className="wish-privacy">⌑ 仅保存在当前浏览器，不会公开或自动发送。清除浏览器数据后记录会丢失。</p>
        </div>}
      </section>
      <div className="wish-submit-area"><button type="submit" form="wish-form" className="wish-primary" disabled={!!ceremony}><span>{ceremony?'正在封存…':editing?'保存这封心愿':'封存这份心愿'}</span><span aria-hidden="true">↗</span></button><p className="wish-submit-hint">{editing?'保存修改，保留原来的回笺与纪念日期':'写下一句心愿，收下一封月亮回笺。'}</p><p className="wish-local-caption">仅保存在本机 · 无需登录 · 不会公开发送</p>{error&&<p className="wish-error" role="alert">{error}</p>}<p className="wish-feedback" role="status" aria-live="polite">{feedback}</p></div>
    </div>
  </div>;
}
