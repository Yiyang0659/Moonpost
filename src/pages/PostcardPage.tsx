import {trackEvent} from '../lib/analytics';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {toast} from '../lib/storage';
import {fileAsDataUrl,readImage,readLocal,removeImage,writeImage,writeLocal,type FavoriteWord,type SavedPostcard} from './postcard/persistence';
import {initialPostcard,messageFits,renderPostcard,templates,type PostcardData,type SealId,type StampId,type TemplateId} from './postcard/render';
import {recipients,type Recipient} from './wall/model';
import './postcard.css';

const blessings=[
  {who:'家人',text:'今晚月亮替我先到家，愿饭桌上的笑声一直热着。'},
  {who:'朋友',text:'把今天收集的月光分你一半，下次见面再把故事讲完。'},
  {who:'爱人',text:'我们看的是同一轮月亮，我想念的是你看月亮的样子。'},
  {who:'自己',text:'谢谢今天认真走到这里的我，明天也慢慢发光。'},
  {who:'同事',text:'愿忙碌有回响，休息有月光，节后再一起把事情做好。'},
];
const stampNames:{id:StampId;name:string;symbol:string}[]=[{id:'moon',name:'月球',symbol:'☾'},{id:'rabbit',name:'玉兔',symbol:'♧'},{id:'flower',name:'桂花',symbol:'✿'},{id:'rocket',name:'地月',symbol:'✦'}];
const sealNames:{id:SealId;name:string;symbol:string}[]=[{id:'moon',name:'月球邮局',symbol:'☾'},{id:'rabbit',name:'玉兔快递',symbol:'♧'},{id:'festival',name:'中秋快乐',symbol:'圆'}];
const assetFor=(id:TemplateId)=>templates.find(t=>t.id===id)!.asset;
const safeDraft=():PostcardData=>{
  const stored=readLocal<Partial<PostcardData>>('postcard-draft',{});
  if(!stored||!templates.some(t=>t.id===stored.templateId))return initialPostcard;
  return {...initialPostcard,...stored};
};
type WishDraft = {id:string;name:string;text:string;recipient:Recipient};
const wishFromNavigation=(state:unknown):WishDraft|null=>{
  if(!state||typeof state!=='object'||!('wishDraft' in state))return null;
  const value=state.wishDraft;
  if(!value||typeof value!=='object')return null;
  const draft=value as Record<string,unknown>;
  const recipient=recipients.find(item=>item.id===draft.recipient);
  if(typeof draft.id!=='string'||!draft.id||typeof draft.name!=='string'||typeof draft.text!=='string'||!draft.text.trim()||!recipient)return null;
  return {id:draft.id,name:draft.name,text:draft.text,recipient:recipient.id};
};
const draftFromWish=(draft:PostcardData,wish:WishDraft):PostcardData=>{
  const recipient=recipients.find(item=>item.id===wish.recipient)!.label;
  return {...draft,sender:wish.name,message:wish.text,recipient,title:`写给${recipient}的月光`};
};
const readHistory=()=>{const value=readLocal<unknown>('postcard-history',[]);return Array.isArray(value)?value.filter((v):v is SavedPostcard=>!!v&&typeof v==='object'&&typeof v.id==='string'&&!!v.data):[];};
const readWords=()=>{const value=readLocal<unknown>('word-favorites',[]);return Array.isArray(value)?value.filter((v):v is FavoriteWord=>!!v&&typeof v==='object'&&typeof v.id==='string'&&typeof v.text==='string'):[];};
const newId=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
const formatDate=(s:string)=>new Date(s).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});

async function assetAsDataUrl(path:string){
  try{const response=await fetch(path);if(!response.ok)return '';const blob=await response.blob();return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}catch{return '';}
}
async function makePng(data:PostcardData,logo?:string){
  const svg=renderPostcard(data,await assetAsDataUrl(assetFor(data.templateId)),logo);
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try{
    const image=new Image();
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('图片生成失败'));image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=data.templateId==='osmanthus'?1800:2400;canvas.height=data.templateId==='osmanthus'?2400:1600;
    const context=canvas.getContext('2d');if(!context)throw new Error('浏览器无法生成图片');
    context.fillStyle='#f8f3e9';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/png');
  }finally{URL.revokeObjectURL(url);}
}
function downloadUrl(url:string,filename:string,templateId:TemplateId,source:'generate'|'editor'|'history'){const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();trackEvent('postcard_export_success',{template:templateId,source});}

export default function PostcardPage(){
  const location=useLocation();
  const navigate=useNavigate();
  const [wishSource]=useState(()=>wishFromNavigation(location.state));
  const consumedWish=useRef(false);
  const [data,setData]=useState<PostcardData>(()=>{
    const draft=safeDraft();
    return wishSource?draftFromWish(draft,wishSource):draft;
  });
  const [logo,setLogo]=useState<string>();
  const [history,setHistory]=useState<SavedPostcard[]>(readHistory);
  const [words,setWords]=useState<FavoriteWord[]>(readWords);
  const [tab,setTab]=useState<'editor'|'history'>('editor');
  const [mobileView,setMobileView]=useState<'edit'|'preview'>('edit');
  const [busy,setBusy]=useState(false);
  const [storageError,setStorageError]=useState(false);
  const [logoError,setLogoError]=useState('');
  const [logoReady,setLogoReady]=useState(false);
  const logoInput=useRef<HTMLInputElement>(null);
  const previewRef=useRef<HTMLDivElement>(null);
  const template=templates.find(t=>t.id===data.templateId)!;
  const overflow=!messageFits(data);
  const svg=useMemo(()=>renderPostcard(data,template.asset,logo),[data,template.asset,logo]);
  useEffect(()=>{readImage('draft-logo').then(image=>{if(image)setLogo(image);}).catch(()=>{}).finally(()=>setLogoReady(true));},[]);
  useEffect(()=>{if(!writeLocal('postcard-draft',data))setStorageError(true);},[data]);
  useEffect(()=>{
    if(!wishSource||consumedWish.current)return;
    consumedWish.current=true;
    // Consume the incoming letter once so reload/back keeps the user's edited draft.
    const state={...(location.state as Record<string,unknown>)};
    delete state.wishDraft;
    navigate({pathname:location.pathname,search:location.search,hash:location.hash},{replace:true,state:Object.keys(state).length?state:null});
  },[wishSource,location,navigate]);
  const edit=<K extends keyof PostcardData>(field:K,value:PostcardData[K])=>setData(current=>({...current,[field]:value}));
  function chooseTemplate(id:TemplateId){edit('templateId',id);if(window.innerWidth<760){setMobileView('preview');requestAnimationFrame(()=>previewRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));}}
  async function uploadLogo(file?:File){
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setLogoError('请上传 PNG、JPEG 或 WebP 图片。');return;}
    if(file.size>1024*1024){setLogoError('图片请控制在 1 MB 以内。');return;}
    try{const image=await fileAsDataUrl(file);setLogo(image);edit('logoKind','image');setLogoError('');
      try{await writeImage('draft-logo',image);}catch{setStorageError(true);setLogoError('图片目前只在这个页面中，刷新后可能丢失。');}
    }catch{setLogoError('读取图片失败，请重试。');}
  }
  async function clearLogo(){setLogo(undefined);edit('logoKind','brand');if(logoInput.current)logoInput.current.value='';try{await removeImage('draft-logo');}catch{/* Current state remains editable. */}}
  async function generate(){
    if(!data.message.trim()){toast('先写下一句想说的话。');return;}
    if(overflow){toast('这段文字超出当前版式，请缩短正文、减少换行或换版式。');return;}
    if(data.logoKind==='image'&&!logo){toast('自定义图片尚未加载完成，请稍后重试。');return;}
    setBusy(true);const id=newId();
    try{const png=await makePng(data,logo);
      try{await writeImage('card-'+id,png);if(data.logoKind==='image'&&logo)await writeImage('logo-'+id,logo);
        const item:SavedPostcard={id,createdAt:new Date().toISOString(),data:{...data},hasImageLogo:data.logoKind==='image'&&!!logo,version:1};
        const next=[item,...history].slice(0,30);if(!writeLocal('postcard-history',next))throw new Error('本机存储失败');
        setHistory(next);setStorageError(false);toast('明信片已生成，并保存在当前浏览器。');
      }catch{setStorageError(true);toast('图片已生成，但未保存到本机。你仍可直接下载。');await Promise.allSettled([removeImage('card-'+id),removeImage('logo-'+id)]);}
      downloadUrl(png,'月球来信-'+template.name+'.png',data.templateId,'generate');
    }catch{toast('生成图片失败，请稍后重试。');}finally{setBusy(false);}
  }
  async function downloadCurrent(){if(!data.message.trim()){toast('先写下一句想说的话。');return;}if(overflow){toast('这段文字超出当前版式，请缩短正文、减少换行或换版式。');return;}if(data.logoKind==='image'&&!logo){toast('自定义图片尚未加载完成，请稍后重试。');return;}setBusy(true);try{downloadUrl(await makePng(data,logo),'月球来信-'+template.name+'.png',data.templateId,'editor');toast('PNG 明信片已下载到本机。');}catch{toast('下载失败，请稍后重试。');}finally{setBusy(false);}}
  async function copyText(){try{await navigator.clipboard.writeText(data.title+'\n'+data.message+'\n——'+data.sender);toast('文字已复制。');}catch{toast('复制失败，请手动选择正文复制。');}}
  function favoriteWord(){const text=data.message.trim();if(!text){toast('先写一句值得收藏的话。');return;}
    const next=[{id:newId(),createdAt:new Date().toISOString(),text,source:'月球明信片'},...words];
    if(writeLocal('word-favorites',next)){setWords(next);toast('这句话已收藏在本机。');}else{setStorageError(true);toast('未能收藏到本机，请先下载或复制文字。');}}
  async function downloadSaved(item:SavedPostcard){try{const png=await readImage('card-'+item.id);if(png){downloadUrl(png,'月球来信-'+(templates.find(t=>t.id===item.data.templateId)?.name||'明信片')+'.png',item.data.templateId,'history');return;}
      const savedLogo=item.hasImageLogo?await readImage('logo-'+item.id):undefined;downloadUrl(await makePng(item.data,savedLogo),'月球来信-明信片.png',item.data.templateId,'history');}catch{toast('这张明信片的图片未能读取。');}}
  async function editCopy(item:SavedPostcard){const savedLogo=item.hasImageLogo?await readImage('logo-'+item.id).catch(()=>undefined):undefined;
    setData({...item.data});setLogo(savedLogo);setTab('editor');setMobileView('edit');
    if(savedLogo)writeImage('draft-logo',savedLogo).catch(()=>setStorageError(true));toast('已打开编辑副本，原作品仍保留在收藏中。');}
  async function deleteSaved(item:SavedPostcard){if(!window.confirm('删除这张保存在当前浏览器的明信片？此操作不会影响游园护照印章。'))return;
    const next=history.filter(card=>card.id!==item.id);if(!writeLocal('postcard-history',next)){setStorageError(true);toast('删除未能保存，请稍后重试。');return;}
    setHistory(next);await Promise.allSettled([removeImage('card-'+item.id),removeImage('logo-'+item.id)]);toast('明信片已删除。');}
  function deleteWord(item:FavoriteWord){const next=words.filter(word=>word.id!==item.id);if(writeLocal('word-favorites',next)){setWords(next);toast('文字已从本机收藏移除。');}else{setStorageError(true);toast('删除未能保存，请稍后重试。');}}
  return <div className="postcard-page">
    <header className="postcard-intro"><div><p className="eyebrow">MOON POST / 月球来信</p><h2>把想念，寄去月亮。</h2><p>挑一张信笺，写下要说的话。每一张都是可以留下的中秋纪念。</p></div><div className="postcard-intro-badge"><span>✦</span><small>给重要的人<br/>一封有月光的信</small></div></header>
    <div className="postcard-tabs" role="tablist" aria-label="明信片工作区"><button type="button" role="tab" aria-selected={tab==='editor'} onClick={()=>setTab('editor')}>制作明信片</button><button type="button" role="tab" aria-selected={tab==='history'} onClick={()=>setTab('history')}>我的收藏 <b>{history.length}</b></button></div>
    {tab==='editor'?<>
      {wishSource&&<p className="postcard-local-note" role="status">已带入「我的心愿册」中的祝福与署名，沿用当前信笺样式。可以继续修改，原心愿会保留。</p>}
      <section className="postcard-template-section" aria-labelledby="postcard-templates-title"><div className="postcard-section-heading"><div><p className="eyebrow">01 / SELECT A DESIGN</p><h3 id="postcard-templates-title">选择你的月球信笺</h3></div><span>换版式时，写好的文字会保留。</span></div><div className="postcard-template-grid">{templates.map(item=>{const sample={...initialPostcard,templateId:item.id};return <button type="button" key={item.id} className="postcard-template" aria-pressed={data.templateId===item.id} onClick={()=>chooseTemplate(item.id)}><div className="postcard-template-art" dangerouslySetInnerHTML={{__html:renderPostcard(sample,item.asset)}}/><span className="postcard-template-text"><strong>{item.name}</strong><small>{item.note}</small></span><span className="postcard-template-check">{data.templateId===item.id?'✓':'选择'}</span></button>})}</div></section>
      <div className="postcard-mobile-switch" role="group" aria-label="编辑或预览"><button type="button" aria-pressed={mobileView==='edit'} onClick={()=>setMobileView('edit')}>编辑内容</button><button type="button" aria-pressed={mobileView==='preview'} onClick={()=>setMobileView('preview')}>预览卡片</button></div>
      <div className={'postcard-workspace postcard-mobile-'+mobileView}><section className="postcard-editor" aria-labelledby="postcard-editor-title"><div className="postcard-section-heading"><div><p className="eyebrow">02 / MAKE IT YOURS</p><h3 id="postcard-editor-title">写一封属于你的信</h3></div></div>
        <div className="postcard-form-grid"><label>收件人<input value={data.recipient} maxLength={14} onChange={e=>edit('recipient',e.target.value)} placeholder="想寄给谁"/></label><label>寄件人<input value={data.sender} maxLength={14} onChange={e=>edit('sender',e.target.value)} placeholder="你的名字"/></label></div>
        <label className="postcard-field">卡片标题<input value={data.title} maxLength={14} onChange={e=>edit('title',e.target.value)} placeholder="给这封信起个名字"/></label>
        <label className="postcard-field">想说的话 <span className={overflow?'over':''}>{data.message.length} / {template.limit} 字建议</span><textarea value={data.message} maxLength={120} rows={5} onChange={e=>edit('message',e.target.value)} placeholder="把此刻的想念写下来……"/></label>
        {overflow&&<p className="postcard-warning" role="alert">这段文字超出当前版式。请缩短正文、减少换行或换用桂花诗笺，避免导出时缺字。</p>}
        <div className="postcard-preset"><strong>写点什么？</strong><div>{blessings.map(blessing=><button type="button" key={blessing.who} onClick={()=>edit('message',blessing.text)}>{blessing.who}</button>)}</div><p>点击对象即可填入示例，随后仍可修改。</p></div>
        <div className="postcard-options"><fieldset><legend>邮票</legend><div className="postcard-choice-row">{stampNames.map(item=><button type="button" key={item.id} aria-pressed={data.stamp===item.id} onClick={()=>edit('stamp',item.id)}><span>{item.symbol}</span>{item.name}</button>)}</div></fieldset><fieldset><legend>邮戳</legend><div className="postcard-choice-row">{sealNames.map(item=><button type="button" key={item.id} aria-pressed={data.seal===item.id} onClick={()=>edit('seal',item.id)}><span>{item.symbol}</span>{item.name}</button>)}</div></fieldset>
        <fieldset><legend>角落标记</legend><div className="postcard-choice-row">{([{id:'brand',name:'月球来信'},{id:'type',name:'文字章'},{id:'image',name:'上传图片'},{id:'none',name:'无标记'}] as const).map(item=><button type="button" key={item.id} aria-pressed={data.logoKind===item.id} onClick={()=>{if(item.id==='image'&&!logo)logoInput.current?.click();else edit('logoKind',item.id);}}>{item.name}</button>)}</div>
          {data.logoKind==='type'&&<label className="postcard-mark-label">文字章内容<input value={data.mark} maxLength={6} onChange={e=>edit('mark',e.target.value)} placeholder="月球来信"/></label>}
          <input ref={logoInput} className="postcard-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadLogo(e.target.files?.[0])} aria-label="上传角落标记图片"/>
          {logo&&<div className="postcard-logo-actions"><img src={logo} alt="已上传的标记预览"/><button type="button" onClick={()=>logoInput.current?.click()}>替换图片</button><button type="button" onClick={clearLogo}>删除图片</button></div>}
          {logoError&&<p className="postcard-warning" role="alert">{logoError}</p>}<small>支持 PNG、JPEG、WebP，最大 1 MB；图片会完整放进角落标记区。</small></fieldset></div>
        <div className="postcard-editor-actions"><button className="postcard-main-action" type="button" disabled={busy||!logoReady} onClick={generate}>{busy?'正在生成…':'生成、保存并下载 PNG'} <span>↗</span></button><div><button type="button" onClick={downloadCurrent} disabled={busy}>仅下载 PNG</button><button type="button" onClick={copyText}>复制文字</button><button type="button" onClick={favoriteWord}>收藏这句话</button></div></div>
        <p className="postcard-local-note">作品保存在当前浏览器，不会自动发送给他人。{storageError&&<strong> 当前浏览器未能保存全部记录，请先下载作品。</strong>}</p>
      </section><section className="postcard-preview-area" ref={previewRef} aria-labelledby="postcard-preview-title"><div className="postcard-preview-heading"><p className="eyebrow">LIVE PREVIEW</p><h3 id="postcard-preview-title">此刻的月球来信</h3><span>{template.name} · {data.templateId==='osmanthus'?'竖版 3:4':'横版 3:2'}</span></div><div className={'postcard-preview-paper postcard-preview-'+data.templateId} dangerouslySetInnerHTML={{__html:svg}}/><p className="postcard-preview-caption">预览随输入更新 · 下载为高清 PNG 图片</p></section></div>
    </>:<section className="postcard-history" aria-labelledby="postcard-history-title"><div className="postcard-section-heading"><div><p className="eyebrow">YOUR MOON POST</p><h3 id="postcard-history-title">留在月球邮局的作品</h3></div><button type="button" onClick={()=>setTab('editor')}>＋ 新写一封</button></div><p className="postcard-history-note">只保存在当前浏览器。清除浏览器数据后，记录无法恢复；记得下载喜欢的卡片。</p>
      {history.length?<div className="postcard-history-grid">{history.map(item=><article key={item.id} className="postcard-saved-card"><div className="postcard-saved-thumb" dangerouslySetInnerHTML={{__html:renderPostcard(item.data,assetFor(item.data.templateId))}}/><div className="postcard-saved-body"><span>{formatDate(item.createdAt)}</span><h4>{item.data.title||'无题明信片'}</h4><p>{templates.find(t=>t.id===item.data.templateId)?.name} · 寄给 {item.data.recipient||'某个人'}</p><div><button type="button" onClick={()=>downloadSaved(item)}>重下 PNG</button><button type="button" onClick={()=>editCopy(item)}>编辑副本</button><button type="button" className="delete" onClick={()=>deleteSaved(item)}>删除</button></div></div></article>)}</div>:<div className="postcard-empty"><span>✉</span><h4>还没有生成过明信片</h4><p>写下第一封信，月球邮局会把它留在这里。</p><button type="button" onClick={()=>setTab('editor')}>开始制作</button></div>}
      {words.length>0&&<div className="postcard-word-list"><h4>收藏的文字</h4>{words.map(item=><article key={item.id}><p>{item.text}</p><span>{formatDate(item.createdAt)} · {item.source}</span><button type="button" onClick={()=>deleteWord(item)}>移除</button></article>)}</div>}</section>}
  </div>;
}
