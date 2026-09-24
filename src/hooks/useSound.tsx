import {trackEvent} from '../lib/analytics';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
const SoundContext=createContext({enabled:true,toggle:()=>{},chime:()=>{}});
export function SoundProvider({children}:{children:ReactNode}){
 const [enabled,setEnabled]=useState(true);
 const enabledRef=useRef(true);
 const audio=useRef<AudioContext|null>(null);
 const voices=useRef(new Set<OscillatorNode>());
 const ensureAudio=()=>{
  try{
   if(!audio.current){
    const AudioCtor=window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(!AudioCtor)return null;
    audio.current=new AudioCtor();
   }
   if(audio.current.state==='suspended')void audio.current.resume().catch(()=>{});
   return audio.current;
  }catch{return null;}
 };
 const stopNotes=()=>{for(const voice of voices.current){try{voice.stop();}catch{/* Already ended. */}}voices.current.clear();};
 const notes=()=>{
  if(!enabledRef.current)return;
  const context=ensureAudio();if(!context)return;
  const now=context.currentTime;
  [440,587.33,659.25].forEach((freq,i)=>{
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type='sine';oscillator.frequency.value=freq;
   gain.gain.setValueAtTime(0,now+i*.1);
   gain.gain.linearRampToValueAtTime(.04,now+i*.1+.02);
   gain.gain.exponentialRampToValueAtTime(.001,now+i*.1+.8);
   oscillator.connect(gain);gain.connect(context.destination);
   voices.current.add(oscillator);
   oscillator.onended=()=>{voices.current.delete(oscillator);oscillator.disconnect();gain.disconnect();};
   oscillator.start(now+i*.1);oscillator.stop(now+i*.1+.85);
  });
 };
 useEffect(()=>{
  // Audio is enabled by default, but browsers require a user gesture to unlock it.
  const unlock=(e:Event)=>{if(enabledRef.current && !(e.target instanceof Element && e.target.closest('.sound-toggle')))ensureAudio();};
  const play=(e:MouseEvent)=>{if(e.target instanceof Element && e.target.closest('button:not(.sound-toggle),a'))notes();};
  document.addEventListener('pointerdown',unlock);
  document.addEventListener('keydown',unlock);
  document.addEventListener('click',play);
  return()=>{
   document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);document.removeEventListener('click',play);
   stopNotes();void audio.current?.close().catch(()=>{});audio.current=null;
  };
 },[]);
 const toggle=()=>{
  const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);trackEvent('sound_toggle',{enabled:next});
  if(next)notes();else{stopNotes();void audio.current?.suspend().catch(()=>{});}
 };
 return <SoundContext.Provider value={{enabled,toggle,chime:notes}}>{children}</SoundContext.Provider>;
}
export const useSound=()=>useContext(SoundContext);
