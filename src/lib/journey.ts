import {get} from './storage';

export const stationIds=['mooncake','quiz','persona','wall','parkour'] as const;
export type StationId=typeof stationIds[number];
export type MooncakeRun={score:number;correct:number;missed:number;maxCombo:number;difficulty:string;at:string};
export type QuizRun={correct:number;total:number;answers:{question:string;selected:number;correct:number}[];at:string};
export type PersonaRun={id:number;answers:number[];at:string};
export type WishRun={id:string;name:string;text:string;at:string};
export type ParkourRun={won:boolean;distance:number;coins:number;mooncakes?:number;passports?:number;at:string};
export type Journey={version:1;visited:Partial<Record<StationId,string>>;completed:Partial<Record<StationId,string>>;mooncake?:{latest:MooncakeRun;best:MooncakeRun};quiz?:{latest:QuizRun;best:QuizRun};persona?:{latest:PersonaRun};wall?:{latest:WishRun};parkour?:{latest:ParkourRun;bestWin?:ParkourRun}};

const fresh=():Journey=>({version:1,visited:{},completed:{}});
export function readJourney():Journey{
  const value=get<unknown>('journey-v1',null);
  if(!value||typeof value!=='object'||(value as Journey).version!==1)return fresh();
  const journey=value as Journey;
  return {...fresh(),...journey,visited:journey.visited&&typeof journey.visited==='object'?journey.visited:{},completed:journey.completed&&typeof journey.completed==='object'?journey.completed:{}};
}
function writeJourney(next:Journey):boolean{
  try{localStorage.setItem('moon-garden:journey-v1',JSON.stringify(next));window.dispatchEvent(new Event('moon:journey'));return true}
  catch{window.dispatchEvent(new CustomEvent('moon:toast',{detail:'本次旅程未能保存在浏览器，请检查存储空间。'}));return false}
}
function update(fn:(journey:Journey)=>void):boolean{const journey=readJourney();fn(journey);return writeJourney(journey)}
export function markVisited(id:StationId){const journey=readJourney();if(journey.visited[id])return;journey.visited[id]=new Date().toISOString();writeJourney(journey)}
function markDone(journey:Journey,id:StationId,at:string){journey.visited[id]??=at;journey.completed[id]??=at}
export function recordMooncake(run:MooncakeRun){return update(j=>{const previous=j.mooncake?.best;j.mooncake={latest:run,best:!previous||run.score>=previous.score?run:previous};if(run.correct>0)markDone(j,'mooncake',run.at)})}
export function recordQuiz(run:QuizRun){return update(j=>{const previous=j.quiz?.best;j.quiz={latest:run,best:!previous||run.correct>=previous.correct?run:previous};markDone(j,'quiz',run.at)})}
export function recordPersona(run:PersonaRun){return update(j=>{j.persona={latest:run};markDone(j,'persona',run.at)})}
export function recordWish(run:WishRun){return update(j=>{j.wall={latest:run};markDone(j,'wall',run.at)})}
export function recordParkour(run:ParkourRun){return update(j=>{j.parkour={latest:run,bestWin:run.won?run:j.parkour?.bestWin};if(run.won)markDone(j,'parkour',run.at)})}
export function completedStamps():StationId[]{const raw=get<unknown>('stamps',[]);return Array.isArray(raw)?stationIds.filter(id=>raw.includes(id)):[]}
