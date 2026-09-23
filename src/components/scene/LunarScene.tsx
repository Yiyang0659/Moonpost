import { useEffect, useId, useRef, useState } from 'react';
import './lunar-scene.css';
import {createMoonRenderer} from '../../lib/moonRenderer';

function RabbitFigure(){const uid=useId().replace(/:/g,'');const p=(key:string)=>`url(#${uid}${key})`;return <svg className="lunar-rabbit-svg" viewBox="0 0 340 430" fill="none" aria-hidden="true"><defs>
 <radialGradient id={`${uid}fur`} cx=".32" cy=".24" r=".8"><stop stopColor="#fffef6"/><stop offset=".5" stopColor="#e9e6dc"/><stop offset=".8" stopColor="#babcc0"/><stop offset="1" stopColor="#747e8d"/></radialGradient>
 <radialGradient id={`${uid}suit`} cx=".28" cy=".2" r=".9"><stop stopColor="#f6f6ef"/><stop offset=".4" stopColor="#d6dbe0"/><stop offset=".77" stopColor="#8895a4"/><stop offset="1" stopColor="#48596e"/></radialGradient>
 <linearGradient id={`${uid}ear`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ccbab2"/><stop offset=".5" stopColor="#eed8c9"/><stop offset="1" stopColor="#90929b"/></linearGradient>
 <radialGradient id={`${uid}glass`} cx=".28" cy=".17" r=".95"><stop stopColor="#e9f5ff" stopOpacity=".16"/><stop offset=".45" stopColor="#daeaff" stopOpacity=".02"/><stop offset=".88" stopColor="#9db9d2" stopOpacity=".08"/><stop offset="1" stopColor="#c8def3" stopOpacity=".32"/></radialGradient>
 <radialGradient id={`${uid}eye`} cx=".32" cy=".2" r=".8"><stop stopColor="#515a62"/><stop offset=".6" stopColor="#202833"/><stop offset="1" stopColor="#070e17"/></radialGradient>
 <linearGradient id={`${uid}gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ede1bb"/><stop offset=".5" stopColor="#b4a079"/><stop offset="1" stopColor="#716858"/></linearGradient>
 <filter id={`${uid}shadow`} x="-.4" y="-.4" width="1.8" height="1.8"><feGaussianBlur stdDeviation="7"/></filter>
 </defs>

 <path d="M115 250q-31-29-40 3l1 74 32 14" fill="#627286" stroke="#b8c5d1" strokeWidth="2"/><path d="M95 267v44" stroke="#d6e0e5" strokeWidth="6" strokeLinecap="round"/>
 <ellipse cx="174" cy="310" rx="68" ry="71" fill={p('suit')}/><path d="M129 344q-16 15-23 39-1 17 22 17 35 1 32-25l-1-21" fill={p('suit')} stroke="#8191a0" strokeWidth="1.3"/><path d="M180 354q-1 25 7 36 13 17 39 5 13-5 5-22l-23-30" fill={p('suit')} stroke="#8191a0" strokeWidth="1.3"/>
 <path d="M111 387q18 8 41-3M191 387q17 2 37-9" stroke="#5d6c7d" strokeWidth="6" strokeLinecap="round"/>
 <path d="M117 278q-21-9-33 12-15 28 5 38 17 6 35-17" fill={p('suit')} stroke="#8c9caa" strokeWidth="1.2"/><path d="M96 292q-4 12-13 18" stroke="#8998a5" strokeWidth="3"/><ellipse cx="85" cy="321" rx="16" ry="19" transform="rotate(-25 85 321)" fill={p('fur')}/>
 <g className="lunar-rabbit-wave"><path d="M224 283q26 2 35-17l10-27" stroke="#768b9c" strokeWidth="34" strokeLinecap="round"/><path d="M225 278q23 0 32-16l9-22" stroke={p('suit')} strokeWidth="29" strokeLinecap="round"/><path d="m251 254 23 7" stroke="#c6d2d9" strokeWidth="4"/><ellipse cx="272" cy="231" rx="16" ry="23" transform="rotate(19 272 231)" fill={p('fur')}/><path d="m266 216 1 16m8-17-2 17" stroke="#c7c5bc" strokeWidth="1.5" strokeLinecap="round"/></g>
 <path d="m128 270 80 81" stroke="#536477" strokeWidth="14"/><path d="m129 270 79 81" stroke="#b6c0c6" strokeWidth="6"/><rect x="155" y="313" width="73" height="54" rx="9" transform="rotate(12 155 313)" fill={p('gold')} stroke="#e3d8b9" strokeWidth="1.3"/><path d="m162 323 25 24 33-12" stroke="#786c57" strokeWidth="2"/><circle cx="188" cy="344" r="4" fill="#e6dfcc"/>
 <rect x="144" y="278" width="42" height="25" rx="6" fill="#526378" stroke="#b0c4d5"/><circle cx="154" cy="290" r="3" fill="#b9d3e5"/><path d="M163 287h15m-15 6h9" stroke="#bdc7ca" strokeWidth="1.5" strokeLinecap="round"/>
 <g className="lunar-rabbit-head">
 <path d="M115 120C74 55 88 9 107 16c23 7 40 73 36 101" fill={p('fur')} stroke="#d8dce0" strokeWidth="1" className="lunar-ear lunar-ear-left"/><path d="M111 96C97 59 96 31 104 34c13 6 26 54 27 65" fill={p('ear')} className="lunar-ear lunar-ear-left"/>
 <path d="M186 115c-8-70 8-107 28-98 21 10 1 71-4 102" fill={p('fur')} stroke="#d8dce0" strokeWidth="1" className="lunar-ear lunar-ear-right"/><path d="M197 95c1-34 7-63 14-60 8 6-3 47-5 64" fill={p('ear')} className="lunar-ear lunar-ear-right"/>
 <circle cx="164" cy="178" r="100" fill="#131d2e" fillOpacity=".22" stroke="#9aaebf" strokeWidth="3"/><ellipse cx="164" cy="183" rx="80" ry="73" fill={p('fur')}/>
 <path d="M117 221q46 27 95-1" stroke="#c4c3bb" strokeOpacity=".25" strokeWidth="3"/>
 <g className="lunar-rabbit-face"><ellipse cx="126" cy="191" rx="14" ry="7" fill="#dbbfb5" opacity=".32"/><ellipse cx="201" cy="191" rx="14" ry="7" fill="#dbbfb5" opacity=".32"/>
 <ellipse cx="131" cy="173" rx="9" ry="13" fill={p('eye')}/><ellipse cx="195" cy="173" rx="9" ry="13" fill={p('eye')}/><g className="lunar-rabbit-pupils"><ellipse cx="129" cy="169" rx="3.1" ry="4" fill="#f5fbff"/><ellipse cx="193" cy="169" rx="3.1" ry="4" fill="#f5fbff"/><circle cx="134" cy="179" r="1.4" fill="#b8c7d2"/><circle cx="198" cy="179" r="1.4" fill="#b8c7d2"/></g>
 <path d="M156 192q8-5 16 0l-8 7Z" fill="#9e8c88"/><path d="M164 198v6m0-1q-6 9-12 2m12-2q6 9 12 2" stroke="#8b8382" strokeWidth="1.7" strokeLinecap="round"/>
 </g>
 <circle cx="164" cy="178" r="98" fill={p('glass')}/>
 <path d="M91 152q9-40 45-56" stroke="#f3fbff" strokeOpacity=".65" strokeWidth="5" strokeLinecap="round"/><path d="M92 170q-2-4 0-8" stroke="#f3fbff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/><path d="M218 246q25-17 32-43" stroke="#c5dbea" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round"/>
 <ellipse cx="164" cy="258" rx="56" ry="14" fill="#76899a" stroke="#bdcdd6" strokeWidth="2"/><path d="M121 257q44 15 86 0" stroke="#d0dbe0" strokeWidth="3"/><circle cx="110" cy="248" r="7" fill={p('gold')}/><circle cx="217" cy="248" r="7" fill={p('gold')}/>
 </g>
 </svg>}

export default function LunarScene(){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [greeting,setGreeting]=useState(''),[dragging,setDragging]=useState(false),[fallback,setFallback]=useState(false);
 const timeout=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),count=useRef(0);
 const rotation=useRef(0),tilt=useRef(-.04),pointer=useRef<{id:number;x:number;y:number}|null>(null),lastInteraction=useRef(-Infinity),paint=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const host=root.current,c=canvas.current;if(!host||!c)return;
  const renderer=createMoonRenderer(c,()=>setFallback(true));if(!renderer)setFallback(true);
  const media=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,raf=0,last=0,lost=false;
  const draw=()=>{if(!lost)renderer?.draw(rotation.current,tilt.current,1.13)};paint.current=draw;
  const resize=()=>{renderer?.resize(c.clientWidth,c.clientHeight);draw()};
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(c);resize();
  const tick=(now:number)=>{
   raf=0;if(!visible||document.hidden||media.matches||lost)return;
   const delta=last?Math.min(now-last,50):0;last=now;
   if(!pointer.current&&now-lastInteraction.current>3500){rotation.current+=delta*.000024;draw()}
   raf=requestAnimationFrame(tick);
  };
  const sync=()=>{cancelAnimationFrame(raf);raf=0;last=0;const active=visible&&!document.hidden&&!media.matches;host.classList.toggle('lunar-paused',!active);if(active&&!lost&&renderer)raf=requestAnimationFrame(tick)};
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync()},{threshold:.03});observer.observe(host);
  const cancelDrag=()=>{pointer.current=null;setDragging(false);sync()};
  const contextLost=()=>{lost=true;cancelAnimationFrame(raf);setFallback(true)};
  c.addEventListener('webglcontextlost',contextLost);document.addEventListener('visibilitychange',cancelDrag);media.addEventListener('change',sync);sync();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();sizeObserver.disconnect();c.removeEventListener('webglcontextlost',contextLost);document.removeEventListener('visibilitychange',cancelDrag);media.removeEventListener('change',sync);clearTimeout(timeout.current);paint.current=()=>{};renderer?.dispose()};
 },[]);
 const greet=()=>{const phrases=['月亮收到你的想念了。','今晚的月光，分你一半。','你好，地球来的朋友。','下一封信，要寄给谁？'];setGreeting(phrases[count.current++%phrases.length]);clearTimeout(timeout.current);timeout.current=setTimeout(()=>setGreeting(''),4200)};
 const release=()=>{pointer.current=null;lastInteraction.current=performance.now();setDragging(false)};
 return <div ref={root} className={`lunar-scene lunar-floating-scene ${greeting?'is-greeting':''}`} onPointerMove={event=>{if(event.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;event.currentTarget.style.setProperty('--rabbit-x',`${x*9}px`);event.currentTarget.style.setProperty('--rabbit-y',`${y*6}px`);event.currentTarget.style.setProperty('--rabbit-turn',`${x*5}deg`)}} onPointerLeave={event=>{event.currentTarget.style.setProperty('--rabbit-x','0px');event.currentTarget.style.setProperty('--rabbit-y','0px');event.currentTarget.style.setProperty('--rabbit-turn','0deg')}}>
  <div className="lunar-scene-halo"/><div className="lunar-scene-orbit"/><div className="lunar-hover-shadow"/>
  <div className={`lunar-moon-wrap ${dragging?'is-dragging':''} ${fallback?'lunar-moon-fallback':''}`}>
   <canvas ref={canvas} className="lunar-moon" tabIndex={fallback?-1:0} role="img" aria-label="悬浮月球，可上下左右拖动旋转；键盘四个方向键旋转，Home 键复位" aria-describedby="lunar-drag-hint"
    onPointerDown={e=>{if(pointer.current||fallback)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};lastInteraction.current=performance.now();e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}}
    onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;rotation.current+=(e.clientX-p.x)*.006;tilt.current+=(e.clientY-p.y)*.006;p.x=e.clientX;p.y=e.clientY;lastInteraction.current=performance.now();paint.current()}}
    onPointerUp={e=>{if(pointer.current?.id===e.pointerId)release()}} onPointerCancel={e=>{if(pointer.current?.id===e.pointerId)release()}} onLostPointerCapture={e=>{if(pointer.current?.id===e.pointerId)release()}}
    onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){rotation.current=0;tilt.current=-.04}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){rotation.current+=e.key==='ArrowLeft'?-.16:.16}else{tilt.current+=e.key==='ArrowUp'?-.16:.16;}lastInteraction.current=performance.now();paint.current()}}/>
   {fallback&&<span className="lunar-fallback-text" role="img" aria-label="悬浮月球插画"/>}
  </div>
  <div className="lunar-coordinate" aria-hidden="true"><span>THE QUIET SIDE OF THE MOON</span><i>384,400 KM FROM HOME</i></div>
  <button className="lunar-rabbit" onClick={greet} aria-label="和玉兔邮差打招呼"><RabbitFigure/></button>
  <div className="lunar-greeting" role="status" aria-live="polite">{greeting}</div>
  <div className="lunar-interaction-hint" id="lunar-drag-hint"><span/>{fallback?'轻触玉兔，打个招呼':'上下左右拖动月球 · 轻触玉兔打招呼'} <i>✥</i></div>
 </div>
}
