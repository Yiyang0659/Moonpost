import {useEffect,useRef} from 'react';
import './moon-courier.css';

type Point={x:number;y:number};
const START=.12,END=2.8,TRAVEL_SECONDS=12,PLACE_SECONDS=1.3,RESET_SECONDS=.65;
const orbitPoint=(angle:number):Point=>({x:305+280*Math.cos(angle)*.94+155*Math.sin(angle)*.342,y:315-280*Math.cos(angle)*.342+155*Math.sin(angle)*.94});
const orbitPath=(from:number,to:number)=>Array.from({length:81},(_,i)=>{const p=orbitPoint(from+(to-from)*i/80);return `${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`}).join(' ');
const endpoint=orbitPoint(END),TARGET={x:endpoint.x+80,y:endpoint.y-66};

export default function MoonCourier({onDelivered}:{onDelivered:()=>void}){
 const host=useRef<HTMLDivElement>(null),rabbit=useRef<HTMLButtonElement>(null),letter=useRef<SVGGElement>(null),glow=useRef<SVGGElement>(null);
 const trigger=useRef<()=>void>(()=>{}),notify=useRef(onDelivered);notify.current=onDelivered;
 useEffect(()=>{
  const el=host.current,ship=rabbit.current;if(!el||!ship)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0,last=0,time=0,visible=true,rush=false,phase='',delivered=false;
  const setPhase=(next:string)=>{if(next!==phase){phase=next;el.dataset.phase=next;ship.setAttribute('aria-busy',String(next==='placing'))}};
  const place=(p:Point,lean=0)=>{ship.style.left=`${p.x/660*100}%`;ship.style.top=`${p.y/600*100}%`;ship.style.setProperty('--courier-lean',`${lean}deg`)};
  const hideEffects=()=>{letter.current?.setAttribute('opacity','0');glow.current?.setAttribute('opacity','0')};
  const render=()=>{
   if(time<TRAVEL_SECONDS){
    setPhase('travelling');hideEffects();place(orbitPoint(START+(END-START)*time/TRAVEL_SECONDS));
   }else if(time<TRAVEL_SECONDS+PLACE_SECONDS){
    setPhase('placing');hideEffects();const progress=(time-TRAVEL_SECONDS)/PLACE_SECONDS;
    const reach=progress*progress*(3-2*progress);place({x:endpoint.x+14*reach,y:endpoint.y-8*reach},8*reach);
   }else{
    // Hide the entire rabbit at the exact hand-off, then respawn at the first dot.
    setPhase('resetting');const progress=(time-TRAVEL_SECONDS-PLACE_SECONDS)/RESET_SECONDS;
    letter.current?.setAttribute('transform',`translate(${TARGET.x} ${TARGET.y}) rotate(-7) scale(${1.15-progress*.4})`);
    letter.current?.setAttribute('opacity',String(Math.max(0,1-progress)));
    glow.current?.setAttribute('transform',`translate(${TARGET.x} ${TARGET.y}) scale(${.35+progress*1.5})`);
    glow.current?.setAttribute('opacity',String(Math.sin(progress*Math.PI)*.85));
    if(!delivered){delivered=true;notify.current()}
   }
  };
  trigger.current=()=>{if(reduced.matches){notify.current();return}if(time<TRAVEL_SECONDS)rush=true};
  const tick=(now:number)=>{
   raf=0;if(!visible||document.hidden||reduced.matches)return;
   const dt=last?Math.min((now-last)/1000,.05):0;last=now;
   time+=dt*(rush&&time<TRAVEL_SECONDS?3:1);
   if(time>=TRAVEL_SECONDS+PLACE_SECONDS+RESET_SECONDS){time=0;rush=false;delivered=false}
   render();raf=requestAnimationFrame(tick);
  };
  const sync=()=>{
   cancelAnimationFrame(raf);raf=0;last=0;el.classList.toggle('courier-paused',!visible||document.hidden||reduced.matches);
   if(reduced.matches){time=0;rush=false;delivered=false;render()}
   if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(tick);
  };
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync()},{threshold:.05});observer.observe(el);
  render();document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);trigger.current=()=>{}};
 },[]);
 return <div ref={host} className="courier-system" data-phase="travelling">
  <svg className="courier-track courier-track-back" viewBox="0 0 660 600" preserveAspectRatio="none" aria-hidden="true"><path d={orbitPath(Math.PI,Math.PI*2)}/></svg>
  <svg className="courier-track courier-track-front" viewBox="0 0 660 600" preserveAspectRatio="none" aria-hidden="true"><path d={orbitPath(0,Math.PI)}/>{[START,END].map(a=>{const p=orbitPoint(a);return <g key={a}><circle cx={p.x} cy={p.y} r="7" fill="#d6dbd9" fillOpacity=".12"/><circle cx={p.x} cy={p.y} r="3" fill="#dfddcf"/></g>})}</svg>
  <button ref={rabbit} className="courier-rabbit" onClick={()=>trigger.current()} aria-label="让玉兔加速送信" aria-describedby="lunar-drag-hint"><img className="courier-seated-rabbit" src="/images/moon/seated-rabbit.webp" alt="" draggable={false}/></button>
  <svg className="courier-delivery" viewBox="0 0 660 600" preserveAspectRatio="none" aria-hidden="true"><g ref={letter}><path d="M-17-11H17V11H-17ZM-17-11 0 2 17-11M-17 11-5 1M17 11 5 1" fill="#dcc69a" stroke="#f5e9ca" strokeWidth="1.3"/><circle cy="2" r="2" fill="#a58a55"/></g><g ref={glow}><circle r="16" fill="#efdfb0" fillOpacity=".14"/><circle r="11" fill="none" stroke="#f5deb0" strokeWidth="1"/><path d="M-22 0h7m30 0h7M0-22v7m0 30v7" stroke="#f5deb0" strokeWidth="1.4"/></g></svg>
 </div>
}
