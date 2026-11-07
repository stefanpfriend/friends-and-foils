export const SPECIES = Object.freeze([
  {id:'pikachu',name:'Pikachu',prefix:'P',motif:'bolt',tone:'electric'},
  {id:'bulbasaur',name:'Bulbasaur',prefix:'B',motif:'leaf',tone:'leaf'},
  {id:'charmander',name:'Charmander',prefix:'C',motif:'flame',tone:'fire'},
  {id:'squirtle',name:'Squirtle',prefix:'S',motif:'drop',tone:'water'},
]);
export const PASSPORT_KEY='ff-holiday-hunt-2026:passport-v1';
const known=new Set(SPECIES.map(s=>s.id));
export function normalizeTag(value){return typeof value==='string'?value.trim().toUpperCase():'';}
export function tagFromFragment(value){try{return normalizeTag(decodeURIComponent(String(value||'').replace(/^#/,'')));}catch{return '';}}
export function isTagFormat(code){return /^FF26-[PBCS]-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/.test(code);}
export async function tagHash(code,subtle=globalThis.crypto.subtle){
  return [...new Uint8Array(await subtle.digest('SHA-256',new TextEncoder().encode(code)))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function findTag(input,manifest,subtle=globalThis.crypto.subtle){
  const code=normalizeTag(input);if(!isTagFormat(code)||manifest?.campaign!=='ff-holiday-2026'||!Array.isArray(manifest.tags))return null;
  const hash=await tagHash(code,subtle),match=manifest.tags.find(t=>t.hash===hash),species=SPECIES.find(s=>s.id===match?.species);
  return species&&species.prefix===code.split('-')[1]?species:null;
}
export function cleanPassport(value){return Array.isArray(value)?[...new Set(value.filter(id=>known.has(id)))]:[];}
export function addFind(value,id){return cleanPassport([...cleanPassport(value),id]);}
export function readPassport(storage){try{return cleanPassport(JSON.parse(storage.getItem(PASSPORT_KEY)||'[]'));}catch{return [];}}
export function writePassport(storage,value){try{storage.setItem(PASSPORT_KEY,JSON.stringify(cleanPassport(value)));return true;}catch{return false;}}
