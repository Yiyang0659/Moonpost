/** Anonymous, non-blocking analytics. Never pass user-written content here. */
type Properties=Record<string,string|number|boolean>;
type Payload=Record<string,unknown>;
declare global {interface Window {moonAnalyticsBeforeSend?:(type:string,payload:Payload)=>Payload;umami?:{track:(payload:Payload)=>Promise<unknown>|void}}}
const WEBSITE='a41616f5-45df-484f-a774-3d75c24b9b6d';
const pages:Record<string,string>={'/':'首页','/mooncake':'月饼分拣站','/quiz':'月亮知识局','/persona':'月下身份所','/wall':'月光留言板','/parkour':'玉兔配送中','/postcard':'月球明信片','/certificate':'游园纪念证','/letter':'拆开来信','/mailbox':'私密收件箱'};
function cleanPath(path:string){if(/^\/letter(?:\/|$)/.test(path))return '/letter';if(/^\/mailbox(?:\/|$)/.test(path))return '/mailbox';return Object.hasOwn(pages,path)?path:'/unknown';}
const fields=new Set(['station','stage','difficulty','score','correct','total','missed','max_combo','maxCombo','outcome','won','distance','coins','mooncakes','passports','result_id','result','is_edit','style','template','template_id','source','side','elapsed_seconds','reason','enabled']);
let started=false,ready=false,failed=false,currentPath='/',lastPath='';
const queue:Payload[]=[];
let active:{station:string;at:number;props:Properties}|null=null;
const campaign:Properties={};
const enabled=()=>location.hostname==='moonpost.pages.dev'&&navigator.doNotTrack!=='1';
function base():Payload{
 return {website:WEBSITE,hostname:location.hostname,url:currentPath,title:pages[currentPath]||'月球来信',language:navigator.language,screen:`${screen.width}x${screen.height}`,referrer:referrer()};
}
function referrer(){try{return document.referrer?new URL(document.referrer).origin:''}catch{return ''}}
function send(payload:Payload){
 if(!enabled()||failed)return;
 if(!ready||!window.umami){if(queue.length<80)queue.push(payload);return;}
 try{void Promise.resolve(window.umami.track(payload)).catch(()=>{});}catch{/* Analytics must never interrupt the app. */}
}
export function initAnalytics(){
 if(started||!enabled())return;started=true;
 const params=new URLSearchParams(location.search);
 for(const key of ['utm_source','utm_medium','utm_campaign']){const value=params.get(key);if(value&&/^[a-zA-Z0-9_-]{1,80}$/.test(value))campaign[key]=value;}
 // Script loading is asynchronous and never awaited by React or game engines.
 window.moonAnalyticsBeforeSend=(_type,payload)=>{
  let path=typeof payload.url==='string'?payload.url:'/';
  try{if(path.startsWith('http')){const url=new URL(path);path=url.hash.startsWith('#/')?url.hash.slice(1):url.pathname;}}catch{path='/unknown';}
  path=path.split('?')[0];
  const clean=cleanPath(path);
  return {...payload,url:clean,title:pages[clean]||'月球来信',referrer:referrer()};
 };
 const script=document.createElement('script');script.src='https://cloud.umami.is/script.js';script.async=true;
 script.dataset.beforeSend='moonAnalyticsBeforeSend';script.dataset.websiteId=WEBSITE;script.dataset.autoPageview='false';script.dataset.performance='true';script.dataset.domains='moonpost.pages.dev';script.dataset.doNotTrack='true';
 script.onload=()=>{ready=true;queue.splice(0).forEach(send)};
 script.onerror=()=>{failed=true;queue.length=0;};document.head.appendChild(script);
}
export function trackEvent(name:string,props:Properties={}){
 const safe:Properties={...campaign};
 for(const [key,value] of Object.entries(props))if(fields.has(key)&&(typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value)||typeof value==='string'&&value.length<=80))safe[key]=value;
 send({...base(),name,data:safe});
}
export function trackPage(path:string){
 const clean=cleanPath(path);if(clean===lastPath)return;
 if(active)finishActivity(active.station,{outcome:'abandoned',reason:'route_change'});
 currentPath=clean;lastPath=clean;
 send({...base(),data:{...campaign}});
 trackEvent('station_view',{station:clean==='/'?'home':clean.slice(1)});
}
export function startActivity(station:string,props:Properties={}){
 if(active)finishActivity(active.station,{outcome:'abandoned',reason:'restart'});
 active={station,at:performance.now(),props};trackEvent('activity_start',{...props,station});
}
export function finishActivity(station:string,props:Properties={}){
 if(!active||active.station!==station)return;
 const run=active;active=null;
 trackEvent('activity_end',{...run.props,...props,station,elapsed_seconds:Math.round((performance.now()-run.at)/1000)});
}
