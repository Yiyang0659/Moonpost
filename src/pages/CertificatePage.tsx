import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {PERSONAS} from '../data/content';
import {completedStamps,readJourney,stationIds,type StationId,type Journey} from '../lib/journey';
import {get} from '../lib/storage';
import './certificate.css';

type StyleId='honor'|'star'|'passport';
type Entry={id:StationId;name:string;short:string;result:string;detail:string;date:string};
type Certificate={id:string;version:number;issuedAt:string;recipient:string;personal:string;blessing:string;style:StyleId;entries:Entry[];sourceSignature:string};
const names:Record<StationId,{name:string;short:string}>={mooncake:{name:'月饼分拣站',short:'月饼'},quiz:{name:'月亮知识局',short:'知识'},persona:{name:'月下身份所',short:'身份'},wall:{name:'月光留言板',short:'月信'},parkour:{name:'玉兔配送中',short:'玉兔'}};
const styles:{id:StyleId;name:string;desc:string}[]=[{id:'honor',name:'月白荣誉证',desc:'暖纸 · 金线 · 朱砂印'},{id:'star',name:'深蓝星航证',desc:'星图 · 航线 · 月光章'},{id:'passport',name:'五站护照内页',desc:'站点格 · 旅程档案'}];
const STORAGE_KEY='moon-garden:certificates-v1';
const blessingDefault='愿你收藏今晚的月光，也记得把团圆带回日常。';
function validDate(value:unknown){return typeof value==='string'&&!Number.isNaN(Date.parse(value))?value:''}
function dateFromTimestamp(value:number|undefined){if(typeof value!=='number')return '';const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toISOString()}
function displayDate(value:string){return value?new Date(value).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}):'日期未记录'}
function readHistory():Certificate[]{try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(parsed)?parsed.filter((c):c is Certificate=>!!c&&typeof c==='object'&&typeof c.id==='string'&&typeof c.recipient==='string'&&typeof c.personal==='string'&&typeof c.blessing==='string'&&typeof c.issuedAt==='string'&&styles.some(style=>style.id===c.style)&&Array.isArray(c.entries)&&c.entries.length===5&&c.entries.every((entry:Entry)=>!!entry&&typeof entry.name==='string'&&typeof entry.result==='string'&&typeof entry.detail==='string'&&typeof entry.date==='string')):[]}catch{return []}}
function writeHistory(items:Certificate[]){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));return true}catch{return false}}
function finite(value:unknown){return typeof value==='number'&&Number.isFinite(value)?value:null}
function legacyNumber(key:string){const value=get<unknown>(key,null);return typeof value==='number'&&Number.isFinite(value)?value:null}
function makeEntries(journey:Journey):Entry[]{
 const legacyPersona=get<unknown>('persona-result',null);
 const wishes=get<unknown>('wishes',[]);
 const wishList=Array.isArray(wishes)?wishes.filter((w):w is {id:string;text:string;name:string;date:number}=>!!w&&typeof w==='object'&&typeof w.id==='string'&&typeof w.text==='string'&&typeof w.date==='number'&&Number.isFinite(w.date)):[];
 // The wall is shared by all visitors. Never attribute an unrelated legacy wish to this traveller.
 const originalWish=wishList.find(w=>w.id===journey.wall?.latest?.id);
 return stationIds.map(id=>{
  const base={id,...names[id],date:validDate(journey.completed[id])};
  if(id==='mooncake'){
   const run=journey.mooncake?.best;
   if(run&&finite(run.score)!==null)return {...base,result:`最佳完整局 ${run.score} 分`,detail:`正确分拣 ${finite(run.correct)??'未记录'} 枚 · 漏单 ${finite(run.missed)??'未记录'} 枚 · 最高连击 ${finite(run.maxCombo)??'未记录'}`};
   const old=legacyNumber('mooncake-best');
   return {...base,result:old!==null?`历史最佳 ${old} 分`:'已完成',detail:'历史明细未记录'};
  }
  if(id==='quiz'){
   const run=journey.quiz?.best;
   if(run&&finite(run.correct)!==null)return {...base,result:`最佳完整局 ${run.correct}/${finite(run.total)??8} 题`,detail:Array.isArray(run.answers)&&run.answers.length?`完成 ${run.answers.length} 道题的选择记录`:'逐题选择未记录'};
   const old=legacyNumber('quiz-best');
   return {...base,result:old!==null?`历史最佳 ${old}/8 题`:'已完成',detail:'历史明细未记录'};
  }
  if(id==='persona'){
   const recent=journey.persona?.latest;
   const old=legacyPersona&&typeof legacyPersona==='object'?legacyPersona as {id?:unknown;answers?:unknown;date?:unknown}:null;
   const personaId=typeof recent?.id==='number'?recent.id:typeof old?.id==='number'?old.id:-1;
   const persona=PERSONAS[personaId];
   return {...base,date:base.date||validDate(recent?.at)||validDate(old?.date),result:persona?`${persona[0]} · ${persona[1]}`:'已完成',detail:recent?.answers?.length===12||Array.isArray(old?.answers)&&old.answers.length===12?'完成 12 个生活场景的选择':'历史明细未记录'};
  }
  if(id==='wall')return {...base,date:base.date||dateFromTimestamp(originalWish?.date),result:originalWish?'已留下月光祝福':'已完成',detail:originalWish?.text||'历史明细未记录'};
  const win=journey.parkour?.bestWin;
  return {...base,result:win&&finite(win.distance)!==null?`成功抵达 ${win.distance} 米`:'已完成',detail:win&&finite(win.mooncakes)!==null?`本局收集月饼 ${win.mooncakes} 枚 · 护照贴纸 ${win.passports??0} 枚`:win&&finite(win.coins)!==null?`本局收集月币 ${win.coins} 枚`:'历史明细未记录'};
 });
}
function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function wrap(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number,maxLines:number){let line='',lines=0;for(const char of Array.from(text)){const candidate=line+char;if(ctx.measureText(candidate).width>maxWidth&&line){ctx.fillText(line,x,y+lines*lineHeight);lines++;line=char;if(lines>=maxLines)return}else line=candidate}if(line&&lines<maxLines)ctx.fillText(line,x,y+lines*lineHeight)}
function fitFont(ctx:CanvasRenderingContext2D,text:string,maxWidth:number,size:number,minSize:number,weight='normal'){let result=size;do{ctx.font=`${weight} ${result}px Georgia, 'Noto Serif SC', serif`;if(ctx.measureText(text).width<=maxWidth)break;result-=2}while(result>minSize);return result}
function drawCertificate(cert:Certificate,side:'front'|'back'):HTMLCanvasElement{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');if(!c)throw new Error('Canvas unavailable');
 const dark=cert.style==='star',passport=cert.style==='passport';
 c.fillStyle=dark?'#172231':passport?'#f0eee2':'#f5efe1';c.fillRect(0,0,1080,1440);
 if(dark){c.fillStyle='#c8b88e';for(let i=0;i<110;i++){const x=(i*751)%1030+24,y=(i*359)%1380+30;c.globalAlpha=i%5===0?.65:.24;c.beginPath();c.arc(x,y,i%7===0?2:1,0,Math.PI*2);c.fill()}c.globalAlpha=1}
 c.strokeStyle=dark?'#b8a581':passport?'#7b978b':'#b79c6e';c.lineWidth=3;c.strokeRect(45,45,990,1350);c.lineWidth=1;c.strokeRect(62,62,956,1316);
 if(passport){c.fillStyle='#1f3a40';c.fillRect(76,78,928,106)}
 const ink=dark?'#f3ead4':'#21303c',muted=dark?'#b7b49e':'#8a785e',accent=dark?'#d8bd80':passport?'#65867b':'#b49054';
 c.textAlign='center';c.fillStyle=passport?'#f6efdc':accent;c.font='22px sans-serif';c.fillText('MOON POST  ·  LUNAR TRAVEL RECORD',540,125);
 c.fillStyle=ink;c.font='56px Georgia, serif';c.fillText(side==='front'?'月 球 漫 游 纪 念 证':'五 站 游 园 记 录',540,260);
 c.strokeStyle=accent;c.beginPath();c.moveTo(260,292);c.lineTo(820,292);c.stroke();
 if(side==='front'){
  c.fillStyle=muted;c.font='25px sans-serif';c.fillText('谨授予完成五站旅程的月球旅人',540,365);
  c.fillStyle=ink;fitFont(c,cert.recipient,800,78,40,'bold');c.fillText(cert.recipient,540,470);
  c.fillStyle=accent;c.font='30px serif';c.fillText('全 境 漫 游 者',540,530);
  c.fillStyle=muted;c.font='22px sans-serif';c.fillText('FIVE STATIONS  ·  ONE SHARED MOON',540,580);
  c.textAlign='left';c.font='23px sans-serif';cert.entries.forEach((entry,i)=>{const y=655+i*82;c.fillStyle=accent;c.fillText(`0${i+1}   ${entry.name}`,130,y);c.fillStyle=ink;wrap(c,entry.result,600,y,340,28,1)});
  c.strokeStyle=accent;c.beginPath();c.moveTo(130,1045);c.lineTo(950,1045);c.stroke();
  c.fillStyle=muted;c.font='21px sans-serif';c.fillText('我的月球心语',130,1080);c.fillStyle=ink;c.font='26px Georgia, serif';wrap(c,cert.personal||'此行的月光，值得珍藏。',130,1115,800,32,3);
  c.fillStyle=muted;c.font='21px sans-serif';c.fillText('月球邮局寄语',130,1205);c.fillStyle=ink;c.font='21px Georgia, serif';wrap(c,cert.blessing,130,1235,680,28,3);
 }else{
  c.textAlign='left';cert.entries.forEach((entry,i)=>{const y=347+i*183;c.fillStyle=accent;c.font='25px sans-serif';c.fillText(`0${i+1}   ${entry.name}`,116,y);c.fillStyle=ink;fitFont(c,entry.result,825,27,18);c.fillText(entry.result,116,y+46);c.fillStyle=muted;c.font='20px sans-serif';wrap(c,entry.detail,116,y+82,825,28,2);c.fillText(`完成日期：${displayDate(entry.date)}`,116,y+143);c.strokeStyle=accent;c.globalAlpha=.3;c.beginPath();c.moveTo(116,y+163);c.lineTo(964,y+163);c.stroke();c.globalAlpha=1});
  c.fillStyle=muted;c.font='18px sans-serif';c.fillText('记录来自此浏览器。未保存的历史细节不会补造。',116,1313);
 }
 c.textAlign='right';c.strokeStyle=cert.style==='honor'?'#a54339':accent;c.fillStyle=cert.style==='honor'?'#a54339':accent;c.lineWidth=4;c.beginPath();c.arc(898,1302,61,0,Math.PI*2);c.stroke();c.beginPath();c.arc(898,1302,47,0,Math.PI*2);c.stroke();c.font='bold 29px Georgia, serif';c.textAlign='center';c.fillText(cert.id.startsWith('预览')?'待 领':'圆 满',898,1313);
 c.fillStyle=muted;c.font='16px sans-serif';c.textAlign='left';c.fillText(`${cert.id}  ·  ${displayDate(cert.issuedAt)}`,78,1365);
 return canvas;
}
async function saveImage(cert:Certificate,side:'front'|'back'){await document.fonts.ready;const canvas=drawCertificate(cert,side);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('导出失败');downloadBlob(blob,`月球漫游纪念证书-${cert.version}-${side==='front'?'正面':'游园记录'}.png`)}
function CertificateSheet({cert,side}:{cert:Certificate;side:'front'|'back'}){
 const [src,setSrc]=useState('');
 const serialized=JSON.stringify(cert);
 useEffect(()=>{let active=true;void document.fonts.ready.then(()=>{if(active)setSrc(drawCertificate(cert,side).toDataURL('image/png'))});return()=>{active=false}},[serialized,side]);
 return <figure className="cert-rendered"><img src={src||undefined} width={1080} height={1440} alt={side==='front'?`月球漫游纪念证正面，颁给${cert.recipient}。${cert.entries.map(entry=>`${entry.name}：${entry.result}`).join('；')}`:`五站游园记录。${cert.entries.map(entry=>`${entry.name}：${entry.result}，${entry.detail}`).join('；')}`}/></figure>
}
export default function CertificatePage(){
 const [stamps,setStamps]=useState<StationId[]>(()=>completedStamps());const [journey,setJourney]=useState<Journey>(()=>readJourney());const [history,setHistory]=useState<Certificate[]>(readHistory);const [recipient,setRecipient]=useState('月球旅人');const [personal,setPersonal]=useState('');const [blessing,setBlessing]=useState(blessingDefault);const [style,setStyle]=useState<StyleId>('honor');const [side,setSide]=useState<'front'|'back'>('front');const [selectedId,setSelectedId]=useState<string|null>(()=>readHistory()[0]?.id??null);const [feedback,setFeedback]=useState('');const [exporting,setExporting]=useState(false);
 useEffect(()=>{const sync=()=>{setStamps(completedStamps());setJourney(readJourney());setHistory(readHistory())};window.addEventListener('moon:stamp',sync);window.addEventListener('moon:journey',sync);window.addEventListener('storage',sync);window.addEventListener('focus',sync);return()=>{window.removeEventListener('moon:stamp',sync);window.removeEventListener('moon:journey',sync);window.removeEventListener('storage',sync);window.removeEventListener('focus',sync)}},[]);
 const entries=useMemo(()=>makeEntries(journey).map(entry=>stamps.includes(entry.id)?entry:{...entry,result:'待完成',detail:'完成站点后生成真实记录',date:''}),[journey,stamps]);const signature=JSON.stringify(entries);const eligible=stamps.length===5;const missing=stationIds.filter(id=>!stamps.includes(id));const selected=history.find(item=>item.id===selectedId);const preview:Certificate=selected??{id:'预览 · 尚未领取',version:history.length+1,issuedAt:new Date().toISOString(),recipient:recipient.trim()||'月球旅人',personal:personal.trim(),blessing:blessing.trim()||blessingDefault,style,entries,sourceSignature:signature};
 const newest=history[0];const newResults=!!newest&&newest.sourceSignature!==signature;
 function claim(){if(!eligible)return;const name=recipient.trim().slice(0,16);if(!name){setFeedback('请先填写证书上的展示昵称。');return}const next:Certificate={id:`MP-${Date.now().toString(36).toUpperCase()}`,version:(history.reduce((max,c)=>Math.max(max,c.version||0),0))+1,issuedAt:new Date().toISOString(),recipient:name,personal:personal.trim().slice(0,80),blessing:blessing.trim().slice(0,90)||blessingDefault,style,entries:JSON.parse(JSON.stringify(entries)) as Entry[],sourceSignature:signature};if(!writeHistory([next,...history])){setFeedback('领取未保存到本机。请检查浏览器存储空间后重试。');return}setHistory([next,...history]);setSelectedId(next.id);setFeedback('已盖上圆满纪念印，证书保存在当前浏览器。')}
 function startNew(){if(selected){setRecipient(selected.recipient);setPersonal(selected.personal);setBlessing(selected.blessing);setStyle(selected.style)}setSelectedId(null);setFeedback('现在可预览并领取一个新版本；旧证书仍保留。')}
 async function exportOne(which:'front'|'back'|'both'){if(!selected){setFeedback('请先领取正式证书，再下载。');return}setExporting(true);try{if(which==='both'){await saveImage(selected,'front');await saveImage(selected,'back')}else await saveImage(selected,which);setFeedback('图片已下载到你的设备。')}catch{setFeedback('图片导出失败，请重试。')}finally{setExporting(false)}}
 return <div className="certificate-page"><div className="certificate-hero"><p className="certificate-kicker">05 / LUNAR TRAVEL CERTIFICATE</p><h1>把走过的月光，<br/><span>留作一份纪念。</span></h1><p>五座站点，五枚印章。属于你的月球漫游，值得一张有名字、有记录的证书。</p><div className="certificate-hero-meta"><span>◐ FIVE STAMPS</span><span>✦ ONE SHARED MOON</span><span>LOCAL KEEPSAKE</span></div></div>{!eligible&&<section className="certificate-lock" aria-labelledby="cert-lock-heading"><div><p className="certificate-kicker">PASSPORT PROGRESS · {stamps.length}/5</p><h2 id="cert-lock-heading">还差 {missing.length} 枚印章，就能领取。</h2><p>先完成以下站点的挑战。可以提前查看证书样式；正式领取会填入你在本机留下的真实成绩。</p></div><div className="certificate-missing">{missing.map(id=><Link key={id} to={`/${id}`}>{names[id].name}<span>前往盖章 ↗</span></Link>)}</div></section>}
 <div className="certificate-workspace"><section className="certificate-controls" aria-labelledby="cert-controls-heading"><p className="certificate-kicker">MAKE IT YOURS</p><h2 id="cert-controls-heading">你的月球纪念证</h2><p className="certificate-control-intro">预览可随时调整，点击领取后固定本次姓名、话语与五站成绩。</p>{selected&&<div className="certificate-viewing"><strong>正在查看第 {selected.version} 版</strong><span>领取于 {displayDate(selected.issuedAt)}</span><button type="button" onClick={startNew}>创建新版本 ↗</button></div>}{newResults&&<p className="certificate-update">检测到新的游园记录。创建新版可收录新成绩，旧证书保持原样。</p>}<fieldset className="certificate-style-field"><legend>01 / 选择证书样式</legend><div className="certificate-style-list">{styles.map(item=><button key={item.id} type="button" className={preview.style===item.id?'is-active':''} onClick={()=>{if(selected){setRecipient(selected.recipient);setPersonal(selected.personal);setBlessing(selected.blessing);setSelectedId(null)}setStyle(item.id)}} aria-pressed={preview.style===item.id}><span className={`certificate-swatch certificate-swatch-${item.id}`}/><span><strong>{item.name}</strong><small>{item.desc}</small></span><i>{preview.style===item.id?'✓':'↗'}</i></button>)}</div></fieldset><div className="certificate-fields"><label htmlFor="cert-recipient">02 / 展示昵称 <small>最多 16 字</small></label><input id="cert-recipient" maxLength={16} value={selected?selected.recipient:recipient} onChange={e=>setRecipient(e.target.value)} disabled={!!selected}/><label htmlFor="cert-personal">03 / 我想记住的一句话 <small>选填，最多 80 字</small></label><textarea id="cert-personal" maxLength={80} rows={3} value={selected?selected.personal:personal} onChange={e=>setPersonal(e.target.value)} disabled={!!selected} placeholder="这趟月球旅行，让我想起……"/><label htmlFor="cert-blessing">04 / 月球邮局寄语 <small>最多 90 字</small></label><textarea id="cert-blessing" maxLength={90} rows={3} value={selected?selected.blessing:blessing} onChange={e=>setBlessing(e.target.value)} disabled={!!selected}/></div><div className="certificate-actions">{!selected&&<button type="button" className="certificate-primary" disabled={!eligible} onClick={claim}>{eligible?'领取并盖上纪念印 →':`还差 ${missing.length} 枚印章`}</button>}{selected&&<><button type="button" className="certificate-primary" disabled={exporting} onClick={()=>void exportOne('both')}>{exporting?'正在生成…':'下载正面与记录页 ↓'}</button><div className="certificate-download-pair"><button type="button" disabled={exporting} onClick={()=>void exportOne('front')}>仅下载正面</button><button type="button" disabled={exporting} onClick={()=>void exportOne('back')}>仅下载记录页</button></div></>}<p role="status" aria-live="polite">{feedback||'作品与成绩仅保存在当前浏览器；清除浏览器数据后无法恢复。'}</p></div></section><section className="certificate-preview" aria-label="证书预览"><div className="certificate-preview-bar"><div><span className="certificate-kicker">LIVE PREVIEW</span><strong>{selected?'已领取的证书':'领取前预览'}</strong></div><div role="group" aria-label="切换证书页面"><button type="button" className={side==='front'?'is-active':''} onClick={()=>setSide('front')} aria-pressed={side==='front'}>证书正面</button><button type="button" className={side==='back'?'is-active':''} onClick={()=>setSide('back')} aria-pressed={side==='back'}>游园记录</button></div></div><CertificateSheet cert={preview} side={side}/><p className="certificate-preview-note">数字纪念品 · 导出 1080 × 1440 PNG · 邮戳为本站原创设计</p></section></div>{history.length>0&&<section className="certificate-history"><div><p className="certificate-kicker">MY MOON ARCHIVE</p><h2>我的证书收藏</h2><p>每次领取都会固定一份快照。重下同一版，不会改变原成绩。</p></div><div className="certificate-history-grid">{history.map(item=><button key={item.id} type="button" onClick={()=>{setSelectedId(item.id);setSide('front');document.querySelector('.certificate-workspace')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}} className={selectedId===item.id?'is-active':''}><span>第 {item.version} 版 · {styles.find(s=>s.id===item.style)?.name??'纪念证书'}</span><strong>{item.recipient}</strong><small>{displayDate(item.issuedAt)} · {item.id}</small></button>)}</div></section>}</div>
}
