import type {PostcardData} from './render';

const prefix='moon-garden:';
export type SavedPostcard={id:string;createdAt:string;data:PostcardData;hasImageLogo:boolean;version:1};
export type FavoriteWord={id:string;createdAt:string;text:string;source:string};

export function readLocal<T>(key:string,fallback:T):T{
  try {const raw=window.localStorage.getItem(prefix+key);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}
}
export function writeLocal(key:string,value:unknown):boolean{
  try {window.localStorage.setItem(prefix+key,JSON.stringify(value));return true;}catch{return false;}
}

const dbName='moon-garden-images';
const storeName='postcard-logos';
function database():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB unavailable'));return;}
    const request=indexedDB.open(dbName,1);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName);};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
export async function readImage(key:string):Promise<string|undefined>{
  const db=await database();
  return new Promise((resolve,reject)=>{
    const request=db.transaction(storeName,'readonly').objectStore(storeName).get(key);
    request.onsuccess=()=>{resolve(typeof request.result==='string'?request.result:undefined);db.close();};
    request.onerror=()=>{reject(request.error);db.close();};
  });
}
export async function writeImage(key:string,image:string):Promise<void>{
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(image,key);
    tx.oncomplete=()=>{resolve();db.close();};tx.onerror=()=>{reject(tx.error);db.close();};
  });
}
export async function removeImage(key:string):Promise<void>{
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).delete(key);
    tx.oncomplete=()=>{resolve();db.close();};tx.onerror=()=>{reject(tx.error);db.close();};
  });
}
export function fileAsDataUrl(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
}
