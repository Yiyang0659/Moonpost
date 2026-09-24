import {useEffect,useState} from 'react';
import {formatWishDate,recipients,type Wish} from './model';
import './fold-letter.css';

type FoldState='closed'|'half'|'open';
type Props={wish:Wish;preview?:boolean;sealing?:boolean};
const states:{id:FoldState;label:string}[]=[{id:'closed',label:'合起'},{id:'half',label:'半开'},{id:'open',label:'展开'}];

export default function FoldLetter({wish,preview=false,sealing=false}:Props){
  const [state,setState]=useState<FoldState>(preview?'open':'closed');
  const [reply,setReply]=useState(false);
  const recipient=recipients.find(item=>item.id===wish.recipient)!;
  useEffect(()=>{setReply(false);setState(preview?'open':'closed');},[wish.id,preview]);
  useEffect(()=>{if(sealing){setReply(false);setState('closed');}},[sealing]);
  return <div className={`wish-fold-root wish-fold-${state}${sealing?' wish-fold-sealing':''}`}>
    <div className="wish-fold-scene">
      <div className="wish-fold-book">
        <div className="wish-fold-paper" aria-hidden={state!=='open'} inert={state!=='open'}>
          <div className="wish-fold-ornament" aria-hidden="true"><span>✧</span><i/><span>✧</span></div>
          <span className="wish-fold-eyebrow">{reply?'MOON REPLY':'A LETTER TO THE MOON'}</span>
          <h3 className="wish-fold-address">{reply?'月亮的小回笺':`写给${recipient.label}`}</h3>
          <p className={`wish-fold-message${!reply&&!wish.text?' wish-fold-placeholder':''}`}>{reply?(preview?'封存这份心愿后，\n这里会留下一封月亮回笺。':wish.reply):(wish.text||'如果今晚，\n我们看的是\n同一轮月亮……')}</p>
          <span className="wish-fold-divider" aria-hidden="true">✦</span>
          <p className="wish-fold-blessing">愿你抬头有月，<br/>低头有念。</p>
          <div className="wish-fold-signature">{reply?'—— 月亮':`—— ${wish.name||'一位赏月人'}`}</div>
          <small className="wish-fold-date">{reply?(preview?'封存后可拆阅':'月亮回笺 · 预设寄语'):formatWishDate(wish.date)}</small>
          <div className="wish-fold-bottomline">月光所至，皆是团圆</div>
        </div>
        <div className="wish-fold-wing wish-fold-wing-left" aria-hidden="true">
          <div className="wish-fold-face wish-fold-cover-face wish-fold-cover-left"><span className="wish-fold-cover-star">✦</span></div>
          <div className="wish-fold-face wish-fold-inside-face"><span className="wish-fold-side-moon">☾</span><p>山河遥远<br/>人间烟火<br/>总有一轮月亮<br/>为我们而亮</p><small>THE SAME MOON</small></div>
        </div>
        <div className="wish-fold-wing wish-fold-wing-right" aria-hidden="true">
          <div className="wish-fold-face wish-fold-cover-face wish-fold-cover-right"/>
          <div className="wish-fold-face wish-fold-inside-face"><span className="wish-fold-side-star">✧</span><p>月光所至<br/>皆是团圆</p><small>ALWAYS WITH YOU</small></div>
        </div>
        <div className="wish-fold-cover-type" aria-hidden={state!=='closed'}>
          <span>MOON POST</span><h3>写给{recipient.label}</h3><i>✦</i><p>同一轮月亮<br/>也会照亮<br/>不同的远方</p>
        </div>
      </div>
    </div>
    <div className="wish-fold-controls" role="group" aria-label="折页展开方式">
      {states.map(option=><button key={option.id} type="button" aria-pressed={state===option.id} disabled={sealing} onClick={()=>setState(option.id)}>{option.label}</button>)}
    </div>
    <div className="wish-fold-caption" aria-live="polite">{state==='closed'?'一份心意，藏在月光里。':state==='half'?'月光渐显，展开读完这封信。':'山河遥远，月光相同。'}</div>
    {state==='open'&&<button type="button" className="wish-fold-reply" aria-pressed={reply} disabled={sealing} onClick={()=>setReply(value=>!value)}>{reply?'↶ 返回心愿':preview?'☾ 查看回笺说明':'☾ 读月亮回笺'}</button>}
  </div>;
}
