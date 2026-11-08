import {SPECIES,PASSPORT_KEY,normalizeTag,tagFromFragment,findTag,addFind,readPassport,writePassport} from './holiday-hunt.mjs';
let storage;try{storage=window.localStorage;}catch{storage=null;}
let passport=readPassport(storage),manifestPromise,request=0;
function renderPassport(){
  for(const root of document.querySelectorAll('[data-passport]')){
    root.replaceChildren(...SPECIES.map(species=>{
      const li=document.createElement('li');li.className='passport-find '+species.tone+(passport.includes(species.id)?' found':'');
      const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 64 64');icon.setAttribute('aria-hidden','true');
      const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#hunt-'+species.motif);icon.append(use);
      const name=document.createElement('strong');name.textContent=species.name;const status=document.createElement('span');status.textContent=passport.includes(species.id)?'Found on this browser':'Still to find';li.append(icon,name,status);return li;
    }));
  }
  for(const count of document.querySelectorAll('[data-passport-count]'))count.textContent=passport.length+' / 4 found';
  for(const complete of document.querySelectorAll('[data-passport-complete]'))complete.hidden=passport.length!==4;
}
for(const reset of document.querySelectorAll('[data-passport-reset]'))reset.addEventListener('click',()=>{
  passport=[];writePassport(storage,passport);renderPassport();
  const note=document.querySelector('[data-storage-note]');if(note)note.textContent='Your checklist was cleared on this browser. This does not change any in-store entry.';
});
function loadManifest(){return manifestPromise??=fetch('/assets/holiday-hunt-tags.json').then(r=>{if(!r.ok)throw new Error('Tag list unavailable');return r.json();}).catch(error=>{manifestPromise=null;throw error;});}
const form=document.getElementById('tag-check'),result=document.getElementById('tag-result');
function fragmentCode(){
  // Ordinary in-page navigation (including Skip to content) is not a tag scan.
  try{if(document.getElementById(decodeURIComponent(location.hash.slice(1))))return '';}catch{}
  return tagFromFragment(location.hash);
}
async function check(input,manual=false){
  const current=++request,button=form?.querySelector('button'),title=document.querySelector('[data-find-title]'),message=document.querySelector('[data-find-message]');
  if(button)button.disabled=true;result?.setAttribute('aria-busy','true');
  try{
    const species=await findTag(input,await loadManifest());if(current!==request)return;
    result.hidden=false;
    if(!species){result.querySelector('[data-find-art]')?.setAttribute('hidden','');result.dataset.state='error';title.textContent='Let’s check that code.';message.textContent='We couldn’t match this tag. Enter the code printed on the back, or bring the keychain to the Friends & Foils counter.';return;}
    if(manual)history.replaceState(null,'',location.pathname+'#'+normalizeTag(input));
    const repeat=passport.includes(species.id);passport=addFind(passport,species.id);const saved=writePassport(storage,passport);
    result.dataset.state='found';title.textContent='Nice find. '+species.name+'!';message.textContent=(repeat?species.name+' is already on your browser’s checklist.':species.name+' was added to your four-design checklist.')+' Bring the physical keychain to the counter to enter. Scanning is not an entry.';
    const art=result.querySelector('[data-find-art]');art.removeAttribute('hidden');art.setAttribute('class','find-art '+species.tone);art.querySelector('use').setAttribute('href','#hunt-'+species.motif);
    const note=document.querySelector('[data-storage-note]');if(note)note.textContent=saved?'Checklist saved on this browser only. Staff verify keychains and entries in person.':'This browser could not save your checklist. You can still bring your keychains to the counter.';
    renderPassport();
  }catch{
    if(current!==request)return;result.hidden=false;result.querySelector('[data-find-art]')?.setAttribute('hidden','');result.dataset.state='error';title.textContent='Your keychain can still be checked.';message.textContent='The tag checker could not load. Try again when you’re online, or bring the physical keychain to Friends & Foils.';
  }finally{if(current===request){if(button)button.disabled=false;result?.removeAttribute('aria-busy');}}
}
if(form){
  form.elements.code.disabled=false;form.querySelector('button').disabled=false;
  form.addEventListener('submit',event=>{event.preventDefault();check(form.elements.code.value,true);});
  const code=fragmentCode();if(code){form.elements.code.value=code;check(code);}
  window.addEventListener('hashchange',()=>{const value=fragmentCode();if(value){form.elements.code.value=value;check(value);}});
}
window.addEventListener('storage',event=>{if(event.key===PASSPORT_KEY){passport=readPassport(storage);renderPassport();}});
renderPassport();
