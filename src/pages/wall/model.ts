import {get} from '../../lib/storage';

export type WishStyle = 'moon' | 'note' | 'fold' | 'ticket';
export type Recipient = 'self' | 'family' | 'friend' | 'far';
export type Wish = {
  id:string;
  name:string;
  text:string;
  date:number;
  style:WishStyle;
  recipient:Recipient;
  reply:string;
  favorite:boolean;
};

export const styles:{id:WishStyle;name:string;note:string;symbol:string}[] = [
  {id:'moon',name:'月光邮笺',note:'把认真写下的话，交给月光。',symbol:'☾'},
  {id:'note',name:'桂花便签',note:'一张小纸条，装下温柔的心意。',symbol:'✿'},
  {id:'fold',name:'团圆折页',note:'轻轻打开，读一份藏好的牵挂。',symbol:'◇'},
  {id:'ticket',name:'月球票根',note:'为此刻的心愿，留一张纪念。',symbol:'✦'},
];

export const recipients:{id:Recipient;label:string;prompt:string;opening:string}[] = [
  {id:'self',label:'自己',prompt:'最近，有哪件小事值得夸夸自己？',opening:'愿下一次抬头看月亮时，我……'},
  {id:'family',label:'家人',prompt:'有一句平时不好意思说的话……',opening:'下一次团圆，我想和你们……'},
  {id:'friend',label:'朋友',prompt:'有一个一起度过的瞬间，想再说给你听……',opening:'下次见面，我们一起……'},
  {id:'far',label:'远方的人',prompt:'如果今晚我们看的是同一轮月亮……',opening:'隔着这段距离，我想对你说……'},
];

export const quick = ['愿家人平安，岁岁团圆。','愿所念之人，万事顺遂。','愿每一步，都走向更好的自己。','同一轮月亮，我们从未孤单。'];

const replies:Record<Recipient,string[]> = {
  self:['不必每一天都圆满，你也有自己的月相。','认真走过的每一步，都在慢慢照亮你。','今晚先好好休息，明天再继续发光。'],
  family:['一句惦念，就是团圆开始的地方。','月光会落在窗边，你的牵挂也有了归处。','愿下一次围坐时，饭菜热着，笑声也热着。'],
  friend:['那些一起笑过的时刻，会在记忆里一直发光。','隔些日子再见，也能接着上次的故事。','好朋友之间，总有一条被月光照亮的小路。'],
  far:['距离很远，今晚的月亮却离你们一样近。','有些牵挂不用大声说，也会温柔地陪着你。','愿下一次相见，有月光，也有说不完的话。'],
};

export function replyFor(recipient:Recipient):string {
  const choices = replies[recipient];
  return choices[Math.floor(Math.random()*choices.length)];
}

export const examples:Wish[] = [
  {id:'example-1',name:'长安客',text:'愿人长久，千里共婵娟。愿所有重要的人，都平安喜乐。',date:0,style:'moon',recipient:'family',reply:replies.family[0],favorite:false},
  {id:'example-2',name:'桂花小兔',text:'希望今年的我，比去年更勇敢，更靠近想要的生活。',date:0,style:'note',recipient:'self',reply:replies.self[0],favorite:false},
  {id:'example-3',name:'晚风',text:'把遗憾交给月亮，把期待留给明天。',date:0,style:'ticket',recipient:'far',reply:replies.far[0],favorite:false},
];

export function readWishes():Wish[] {
  const stored = get<unknown>('wishes',[]);
  if(!Array.isArray(stored))return [];
  const seen = new Set<string>();
  return stored.flatMap((value:unknown):Wish[]=>{
    if(!value || typeof value!=='object')return [];
    const item = value as Record<string,unknown>;
    if(typeof item.id!=='string' || !item.id.trim() || seen.has(item.id) || typeof item.name!=='string' || typeof item.text!=='string' || !item.text.trim() || typeof item.date!=='number' || !Number.isFinite(item.date) || item.date<0 || Number.isNaN(new Date(item.date).getTime()))return [];
    const style = styles.find(option=>option.id===item.style)?.id ?? 'moon';
    const recipient = recipients.find(option=>option.id===item.recipient)?.id ?? 'self';
    seen.add(item.id);
    // Legacy messages keep every character; new composition limits belong to the editor.
    // A stable migration reply prevents old messages changing on every page visit.
    return [{id:item.id,name:item.name,text:item.text,date:item.date,style,recipient,reply:typeof item.reply==='string'&&item.reply.trim()?item.reply:replies[recipient][0],favorite:item.favorite===true}];
  });
}

export function formatWishDate(date:number):string {
  if(!Number.isFinite(date) || Number.isNaN(new Date(date).getTime()))return '日期待确认';
  return new Date(date).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
}

export function postcardState(wish:Wish) {
  return {wishDraft:{id:wish.id,name:wish.name,text:wish.text,recipient:wish.recipient}};
}
