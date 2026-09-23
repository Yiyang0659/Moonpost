import { useEffect, useRef, useState } from 'react';
import './lunar-scene.css';
import {createMoonRenderer} from '../../lib/moonRenderer';

export default function LunarScene(){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [dragging,setDragging]=useState(false),[fallback,setFallback]=useState(false);
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
  return()=>{cancelAnimationFrame(raf);observer.disconnect();sizeObserver.disconnect();c.removeEventListener('webglcontextlost',contextLost);document.removeEventListener('visibilitychange',cancelDrag);media.removeEventListener('change',sync);paint.current=()=>{};renderer?.dispose()};
 },[]);
 const release=()=>{pointer.current=null;lastInteraction.current=performance.now();setDragging(false)};
 return <div ref={root} className="lunar-scene lunar-floating-scene">
  <div className="lunar-scene-halo"/><div className="lunar-hover-shadow"/>
  <div className={`lunar-moon-wrap ${dragging?'is-dragging':''} ${fallback?'lunar-moon-fallback':''}`}>
   <canvas ref={canvas} className="lunar-moon" tabIndex={fallback?-1:0} role="img" aria-label="悬浮月球，可上下左右拖动旋转；键盘四个方向键旋转，Home 键复位" aria-describedby="lunar-drag-hint"
    onPointerDown={e=>{if(pointer.current||fallback)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};lastInteraction.current=performance.now();e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}}
    onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;rotation.current+=(e.clientX-p.x)*.006;tilt.current+=(e.clientY-p.y)*.006;p.x=e.clientX;p.y=e.clientY;lastInteraction.current=performance.now();paint.current()}}
    onPointerUp={e=>{if(pointer.current?.id===e.pointerId)release()}} onPointerCancel={e=>{if(pointer.current?.id===e.pointerId)release()}} onLostPointerCapture={e=>{if(pointer.current?.id===e.pointerId)release()}}
    onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){rotation.current=0;tilt.current=-.04}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){rotation.current+=e.key==='ArrowLeft'?-.16:.16}else{tilt.current+=e.key==='ArrowUp'?-.16:.16;}lastInteraction.current=performance.now();paint.current()}}/>
   {fallback&&<span className="lunar-fallback-text" role="img" aria-label="悬浮月球插画"/>}
  </div>
  <div className="lunar-scene-orbit" aria-hidden="true"/>
  <span className="lunar-interaction-hint" id="lunar-drag-hint">{fallback?'月面静静等你来信':'拖动月球旋转；方向键也可操作'}</span>
 </div>
}
