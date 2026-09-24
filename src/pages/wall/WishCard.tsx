import {useState} from 'react';
import FoldLetter from './FoldLetter';
import {formatWishDate,recipients,type Wish} from './model';
import './wish-card.css';

type Props={wish:Wish;preview?:boolean;sealing?:boolean};
type Face='letter'|'envelope'|'reply';
const receiver=(wish:Wish)=>recipients.find(item=>item.id===wish.recipient)!.label;
const sender=(wish:Wish)=>wish.name||'一位赏月人';
const dateText=(date:number)=>new Date(date).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','.');
const letterText=(wish:Wish)=>wish.text||'把没来得及说的话，\n交给今晚的月亮。';
const replyText=(wish:Wish,preview:boolean)=>preview?'先写下你的心愿，\n再收下月亮的回信。':wish.reply;

function Postmark({label='月球邮局',className=''}:{label?:string;className?:string}){
  return <svg className={`wish-ink-postmark ${className}`} viewBox="0 0 188 118" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="62" cy="59" r="49"/><circle cx="62" cy="59" r="43"/><path d="M87 23a31 31 0 1 0 0 61A34 34 0 0 1 87 23Z"/><path d="M104 51c18-13 32 11 53 0s24-8 28-5M104 60c18-13 32 11 53 0s24-8 28-5M104 69c18-13 32 11 53 0s24-8 28-5M104 78c18-13 32 11 53 0s24-8 28-5"/></g><g fill="currentColor" textAnchor="middle"><text x="62" y="29" fontSize="9" letterSpacing="2">MOON POST</text><text x="62" y="92" fontSize="10" letterSpacing="2">{label}</text><text x="27" y="63" fontSize="12">✦</text><text x="96" y="43" fontSize="10">✦</text></g></svg>;
}
function Postage(){return <span className="wish-paper-postage" aria-hidden="true"><i>☾</i><small>月光寄语</small></span>}
function LetterFooter({wish}:{wish:Wish}){return <div className="wish-paper-footer"><span><small>FROM</small><b>{sender(wish)}</b></span><time dateTime={new Date(wish.date).toISOString()}>{formatWishDate(wish.date)}</time></div>}
function StateCaption({children,english}:{children:string;english:string}){return <p className="wish-object-caption"><span aria-hidden="true">—</span> {children} <small>· {english}</small> <span aria-hidden="true">—</span></p>}

function MoonLetter({wish,preview=false,sealing=false}:Props){
  const [face,setFace]=useState<Face>(preview?'letter':'envelope');
  const active=sealing?'envelope':face;
  return <div className={`wish-letter-wrap wish-moon-letter${sealing?' is-sealing':''}`}>
    <div className="wish-moon-stage">
      {active==='letter'&&<article className="wish-paper wish-moon-paper">
        <header className="wish-paper-heading"><div><h4>月光邮笺</h4><small>MOON POST</small></div><p>愿所有温柔的心意<br/>都能被月光看见<small>TO A BRIGHTER YOU</small></p><Postage/></header>
        <div className="wish-paper-address"><small>TO</small><span>写给{receiver(wish)}</span></div>
        <p className="wish-paper-message">{letterText(wish)}</p>
        <LetterFooter wish={wish}/>
      </article>}
      {active==='envelope'&&<button type="button" className="wish-sealed-envelope" disabled={sealing} aria-label={preview?'打开封套预览':'拆开这封心愿'} onClick={()=>setFace('letter')}>
        <span className="wish-envelope-scene" aria-hidden="true"/><span className="wish-envelope-seams" aria-hidden="true"/>
        <span className="wish-envelope-flap" aria-hidden="true"/>
        <span className="wish-envelope-title"><strong>月光邮笺</strong><small>MOON POST</small><em>把心意，寄给{receiver(wish)}</em></span>
        <span className="wish-wax-seal" aria-hidden="true"><span>☾</span><i>✦</i></span>
        <Postmark/>
        <span className="wish-envelope-poem">山河辽阔，<br/>月亮会替我记得。</span>
        <span className="wish-envelope-open-hint">{sealing?'正在封存这份心意':'轻触蜡封，打开这封信'}</span>
      </button>}
      {active==='reply'&&<article className="wish-paper wish-moon-reply">
        <header className="wish-paper-heading"><div><h4>月亮回笺 · 预设寄语</h4><small>MOON POST</small></div><span className="wish-reply-moon" aria-hidden="true">☾</span></header>
        <div className="wish-reply-quotes"><blockquote className="wish-reply-personal">{replyText(wish,preview)}<small>{preview?'封存之后，留下一份温柔':'这封心愿的月亮回笺'}</small></blockquote><blockquote>所有的等待，<br/>都会在合适的时间相遇。</blockquote><blockquote>愿你在忙碌的日子里，<br/>也别忘了抬头看看月亮。</blockquote><blockquote>愿下一个月圆时，<br/>你会比现在更喜欢自己。</blockquote></div>
        <footer className="wish-reply-foot"><span>✦</span><p>月亮一直都在，等你。</p><small>{preview?'回笺效果预览 · 不会自动发送':'THE MOON IS ALWAYS HERE · 回笺已随心愿保存'}</small></footer>
      </article>}
    </div>
    <StateCaption english={active==='letter'?'WRITE':active==='envelope'?'SEALED':'BACK'}>{active==='letter'?'书写心愿':active==='envelope'?'封存心意':'月亮回笺'}</StateCaption>
    <div className="wish-object-controls" role="group" aria-label="月光邮笺展示状态">{([{id:'letter',label:'信笺正面'},{id:'envelope',label:'蜡封信封'},{id:'reply',label:preview?'回笺预览':'拆开月亮回笺'}] as const).map(item=><button key={item.id} type="button" disabled={sealing} aria-pressed={active===item.id} onClick={()=>setFace(item.id)}>{item.label}</button>)}</div>
    {preview&&active==='envelope'&&<p className="wish-object-help">封套外观预览，点击「封存这份心愿」才会保存。</p>}
  </div>;
}

function NoteLetter({wish,preview=false,sealing=false}:Props){
  const [back,setBack]=useState(false);
  return <div className={`wish-letter-wrap wish-note-letter${back?' is-note-turned':''}${sealing?' is-sealing':''}`}>
    <div className="wish-note-object"><div className="wish-note-rotator">
      <article className="wish-note-front wish-paper" aria-hidden={back} inert={back}>
        <header className="wish-note-heading"><div><small>MOON POST</small><h4>桂花便签</h4></div><span aria-hidden="true">✿</span></header>
        <div className="wish-note-address">写给{receiver(wish)}</div><p className="wish-note-message">{wish.text||'愿所念所想，\n终有团圆。'}</p>
        <div className="wish-note-signature"><span>—— {sender(wish)}</span><time dateTime={new Date(wish.date).toISOString()}>{formatWishDate(wish.date)}</time></div>
        <footer className="wish-note-foot"><span>让思念<br/>随月光，抵达更远的地方。</span><small>MOON POST ☾</small></footer>
        <button className="wish-note-corner" type="button" aria-label="翻起纸角，读月亮回笺" disabled={sealing} onClick={()=>setBack(true)}><span aria-hidden="true">✿</span></button>
      </article>
      <article className="wish-note-back wish-paper" aria-hidden={!back} inert={!back}>
        <header className="wish-note-heading"><div><h4>来自月亮的回信</h4><small>MOON REPLY</small></div><span aria-hidden="true">☾</span></header>
        <p className="wish-note-message">{replyText(wish,preview)}</p><span className="wish-note-reply-sign">—— 月亮</span>
        <footer className="wish-note-foot"><span>山海有尽，<br/>而思念，会被月光温柔收藏。</span><small>{preview?'封存后可拆阅':'预设寄语 · 本机留存'}</small></footer>
      </article>
    </div></div>
    <StateCaption english={back?'MOON REPLY':'LITTLE WISH'}>{back?'来自月亮的回信':'一张桂花便签'}</StateCaption>
    <button className="wish-turn" type="button" aria-pressed={back} disabled={sealing} onClick={()=>setBack(v=>!v)}>{back?'↶ 返回心愿正面':preview?'轻轻翻角，看看背面 ↗':'轻轻翻角，拆开回笺 ↗'}</button>
  </div>;
}

type TicketState='whole'|'punched'|'collected';
function TicketLetter({wish,preview=false,sealing=false}:Props){
  const [demoState,setDemoState]=useState<TicketState>('whole');
  const [back,setBack]=useState(false);
  const state=preview?demoState:wish.favorite?'collected':'punched';
  const ticketNumber=`MP${new Date(wish.date).getFullYear()}${wish.id==='draft'?' · 待封存':wish.id.replace(/[^a-z0-9]/gi,'').slice(-6).toUpperCase()}`;
  return <div className={`wish-letter-wrap wish-ticket-letter wish-ticket-${state}${sealing?' is-sealing':''}`}>
    <article className="wish-ticket-object wish-paper">
      <div className="wish-ticket-main"><header className="wish-ticket-heading"><div><h4>{back?'月亮回笺':'月球邮局'}</h4><small>MOON POST</small></div><span>{back?'愿每一份心意，都有回声。':'把心愿，交给今晚的月亮。'}<small>TO A BRIGHTER TOMORROW</small></span></header>
        <span className="wish-ticket-to">{back?'来自月亮的预设寄语':`写给${receiver(wish)}`}</span><p className="wish-ticket-message">{back?replyText(wish,preview):(wish.text||'愿下一次相见时，\n我们仍有同一轮月亮。')}</p>
        <footer className="wish-ticket-footer"><span>月光会记得，而我也会。</span><small>THE SAME MOON<br/>ALWAYS SHINES ON US.</small></footer>
      </div>
      <aside className="wish-ticket-stub"><div className="wish-ticket-stub-title"><small>MOON POST</small><h4>月球票根</h4><span className="wish-ticket-moon" aria-hidden="true">☾</span></div><dl><div><dt>DATE</dt><dd>{dateText(wish.date)}</dd></div><div><dt>FROM</dt><dd>{sender(wish)}</dd></div><div><dt>No.</dt><dd>{ticketNumber}</dd></div></dl><div className="wish-ticket-collection"><small>LOCAL COLLECTION</small><span>{state==='collected'?'已珍藏此刻的月光':'收藏此刻的月光'} <b aria-hidden="true">✦ ✦ ✦</b></span></div>{state==='collected'&&<Postmark label="本机珍藏" className="wish-ticket-postmark"/>}</aside>
    </article>
    <StateCaption english={state==='whole'?'FULL TICKET':state==='punched'?'PUNCHED TICKET':'COLLECTED'}>{state==='whole'?'完整票根':state==='punched'?'打孔票根':'已珍藏'}</StateCaption>
    {preview?<><div className="wish-object-controls" role="group" aria-label="票根效果预览">{([{id:'whole',label:'完整票根'},{id:'punched',label:'打孔效果'},{id:'collected',label:'收藏效果'}] as const).map(item=><button type="button" key={item.id} aria-pressed={state===item.id} disabled={sealing} onClick={()=>setDemoState(item.id)}>{item.label}</button>)}</div><p className="wish-object-help">效果预览 · 封存后自动打孔，在心愿册珍藏后盖戳。</p></>:<p className="wish-object-help">{wish.favorite?'已盖上收藏邮戳，这份月光为你留存。':'票根已打孔。点击下方「珍藏这封信」，留下收藏邮戳。'}</p>}
    <button className="wish-turn" type="button" aria-pressed={back} disabled={sealing} onClick={()=>setBack(v=>!v)}>{back?'↶ 返回心愿正面':preview?'☾ 查看回笺说明':'☾ 读月亮回笺'}</button>
  </div>;
}

export default function WishCard(props:Props){
  if(props.wish.style==='fold')return <FoldLetter {...props}/>;
  if(props.wish.style==='note')return <NoteLetter {...props}/>;
  if(props.wish.style==='ticket')return <TicketLetter {...props}/>;
  return <MoonLetter {...props}/>;
}
