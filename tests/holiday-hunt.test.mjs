import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SPECIES,PASSPORT_KEY,normalizeTag,tagFromFragment,isTagFormat,tagHash,findTag,cleanPassport,addFind,readPassport,writePassport} from '../assets/holiday-hunt.mjs';
const code='FF26-P-ABCD2345';
test('only an issued code with a matching design is accepted; malformed and copied-prefix codes fail',async()=>{
  const manifest={campaign:'ff-holiday-2026',tags:[{hash:await tagHash(code),species:'pikachu'}]};
  assert.equal((await findTag(' '+code.toLowerCase()+' ',manifest)).id,'pikachu');
  assert.equal(await findTag('FF26-B-ABCD2345',manifest),null);
  assert.equal(await findTag(code,{...manifest,tags:[{hash:await tagHash(code),species:'squirtle'}]}),null);
  for(const invalid of ['',null,'<img src=x onerror=alert(1)>','FF26-P-00000000','FF26-P-ABCD2345-extra'])assert.equal(await findTag(invalid,manifest),null);
  assert.equal(await findTag(code,{...manifest,campaign:'wrong-campaign'}),null);
});
test('malformed URL fragments never throw and cannot inject a design',()=>{
  assert.equal(tagFromFragment('#ff26-p-abcd2345'),code);assert.equal(tagFromFragment('#%ZZ'),'');
  assert(!isTagFormat(tagFromFragment('#%3Csvg%20onload%3Dalert(1)%3E')));assert.equal(normalizeTag({}), '');
});
test('repeat finds do not inflate the four-design checklist, and untrusted storage is filtered',()=>{
  let found=[];for(const s of SPECIES)found=addFind(addFind(found,s.id),s.id);assert.equal(found.length,4);
  assert.deepEqual(cleanPassport(['__proto__','constructor',null,'pikachu','pikachu']),['pikachu']);
  assert.deepEqual(cleanPassport({pikachu:true}),[]);
});
test('blocked or corrupt browser storage cannot prevent a counter check-in flow',()=>{
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.deepEqual(readPassport(blocked),[]);assert.equal(writePassport(blocked,['pikachu']),false);
  const values=new Map([[PASSPORT_KEY,'{not JSON']]),store={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  assert.deepEqual(readPassport(store),[]);assert(writePassport(store,['pikachu','bad']));assert.deepEqual(readPassport(store),['pikachu']);
});
test('public manifest has exactly 25 of each design and exposes hashes rather than printable codes',()=>{
  const m=JSON.parse(readFileSync(new URL('../assets/holiday-hunt-tags.json',import.meta.url)));
  assert.equal(m.campaign,'ff-holiday-2026');assert.equal(m.tags.length,100);assert.equal(new Set(m.tags.map(t=>t.hash)).size,100);
  for(const s of SPECIES)assert.equal(m.tags.filter(t=>t.species===s.id).length,25);
  for(const t of m.tags){assert.match(t.hash,/^[a-f0-9]{64}$/);assert.deepEqual(Object.keys(t).sort(),['hash','species']);}
});
test('calendar represents Dec 9 Eastern time and is a passive download without attendees',()=>{
  const text=readFileSync(new URL('../assets/holiday-hunt-finale.ics',import.meta.url),'utf8');
  assert(text.includes('DTSTART:20261210T000000Z\r\n'));assert(text.includes('DTEND:20261210T023000Z\r\n'));
  assert(!text.includes('ATTENDEE'));assert(!text.includes('VALARM'));assert(!/(?<!\r)\n/.test(text));
  assert(text.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
});
test('rules keep the locked dates and unresolved fields, while excluding private operator notes',()=>{
  const rules=readFileSync(new URL('../holiday-hunt/rules/index.html',import.meta.url),'utf8');
  for(let n=1;n<=14;n++)assert(rules.includes('id="rule-'+n+'"'));
  assert(rules.includes('December 9, 2026 at 9:30 PM'));assert(rules.includes('December 4, 2026'));assert(rules.includes('December 18, 2026, 5 PM'));
  assert(rules.includes('<mark>CONTACT EMAIL</mark>'));assert(rules.includes('<mark>GRAND PRIZE</mark>'));assert(rules.includes('Add legal entity name'));
  assert(!rules.includes('NOTES FOR STEFAN'));assert(!rules.includes('N.C. Gen. Stat.'));assert(!rules.includes('December 21'));assert(!rules.includes('December 23'));
});
test('a missing script leaves the checker inert and directs visitors to the physical counter',()=>{
  const page=readFileSync(new URL('../holiday-hunt/found/index.html',import.meta.url),'utf8');
  assert(page.includes('name="code" disabled'));assert(page.includes('<button type="submit" disabled>Check tag'));
  assert(page.includes('<noscript>'));assert(!page.includes('type="email"'));assert(!page.includes('name="email"'));
});
