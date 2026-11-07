// Offline print preparation only. The public site never imports this tool or its dependencies.
// Keep the master inventory and all printable codes outside this public repository.
import {readFile,writeFile,mkdir,chmod} from 'node:fs/promises';
import {randomInt,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
import assert from 'node:assert/strict';
import {SPECIES,isTagFormat,tagHash} from '../assets/holiday-hunt.mjs';
const argv=process.argv.slice(2),option=name=>{const i=argv.indexOf(name);return i<0?null:argv[i+1];};
const inventoryPath=option('--inventory'),out=option('--out'),tooling=option('--tooling');
if(!inventoryPath||!out||!tooling)throw new Error('Use --inventory /private/inventory.json --out /private/print-kit --tooling /private/npm-tools [--create-inventory].');
const repo=path.resolve(new URL('..',import.meta.url).pathname);
for(const dest of [inventoryPath,out])assert(!path.resolve(dest).startsWith(repo+path.sep),'Inventories and printable codes must stay outside the public repo.');
const require=createRequire(path.resolve(tooling,'package.json')),QRCode=require('qrcode'),jsQR=require('jsqr'),{PNG}=require('pngjs');
let inventory;
try{inventory=JSON.parse(await readFile(inventoryPath,'utf8'));}
catch(error){
  if(error.code!=='ENOENT'||!argv.includes('--create-inventory'))throw error;
  const alphabet='23456789ABCDEFGHJKMNPQRSTUVWXYZ',used=new Set();
  inventory={campaign:'ff-holiday-2026',inventoryId:randomUUID(),createdAt:new Date().toISOString(),tags:[]};
  for(const species of SPECIES)for(let n=1;n<=25;n++){
    let code;do{code='FF26-'+species.prefix+'-'+Array.from({length:8},()=>alphabet[randomInt(alphabet.length)]).join('');}while(used.has(code));
    used.add(code);inventory.tags.push({serial:species.prefix+String(n).padStart(2,'0'),species:species.id,code});
  }
  await mkdir(path.dirname(path.resolve(inventoryPath)),{recursive:true,mode:0o700});await writeFile(inventoryPath,JSON.stringify(inventory,null,2)+'\n',{mode:0o600});
}
assert.equal(inventory.campaign,'ff-holiday-2026');assert.equal(inventory.tags.length,100);assert.equal(new Set(inventory.tags.map(t=>t.code)).size,100);
const manifestPath=path.join(repo,'assets/holiday-hunt-tags.json');
try{const existing=JSON.parse(await readFile(manifestPath,'utf8'));assert.equal(existing.inventoryId,inventory.inventoryId,'Refusing to replace another printed inventory. Reuse its master inventory.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(path.join(out,'qr'),{recursive:true,mode:0o700});
const manifest={campaign:inventory.campaign,inventoryId:inventory.inventoryId,tags:[]},sheets=[];let decoded=0;const modules=new Set();
for(const tag of inventory.tags){
  const species=SPECIES.find(s=>s.id===tag.species);assert(species&&tag.code.split('-')[1]===species.prefix&&isTagFormat(tag.code));
  const url='https://friendsandfoils.com/holiday-hunt/found/#'+tag.code;
  const opts={errorCorrectionLevel:'M',margin:4,width:720,color:{dark:'#000000ff',light:'#ffffffff'}};
  const svg=await QRCode.toString(url,{...opts,type:'svg'});await writeFile(path.join(out,'qr',tag.serial+'.svg'),svg,{mode:0o600});
  const image=await QRCode.toBuffer(url,opts);await writeFile(path.join(out,'qr',tag.serial+'.png'),image,{mode:0o600});
  const png=PNG.sync.read(image),scan=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert.equal(scan?.data,url,'Independent QR decode failed for '+tag.serial);decoded++;modules.add(QRCode.create(url,opts).modules.size);
  manifest.tags.push({hash:await tagHash(tag.code),species:tag.species});
  sheets.push(`<article><strong>F&amp;F HOLIDAY HUNT</strong><span>${species.name} · ${tag.serial}</span><img src="qr/${tag.serial}.svg" alt="QR code for ${species.name}"><code>${tag.code}</code><b>Take one. Leave the rest.</b><small>Scan to check your find. Bring the physical keychain to Friends &amp; Foils to enter. No purchase necessary.</small></article>`);
}
for(const species of SPECIES){
  const tag=inventory.tags.find(t=>t.species===species.id),url='https://friendsandfoils.com/holiday-hunt/found/#'+tag.code;
  const png=PNG.sync.read(await QRCode.toBuffer(url,{errorCorrectionLevel:'M',margin:4,width:180}));assert.equal(jsQR(new Uint8ClampedArray(png.data),png.width,png.height)?.data,url);
}
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const csv='serial,design,code,host,placed_at,checked_in_at,household_spin_reference\r\n'+inventory.tags.map(t=>[t.serial,SPECIES.find(s=>s.id===t.species).name,t.code,'','','',''].join(',')).join('\r\n')+'\r\n';
// Never overwrite a ledger that may already contain counter check-ins.
await writeFile(path.join(out,'counter-ledger.csv'),csv,{mode:0o600,flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});
await writeFile(path.join(out,'print-tags.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>F&F Holiday Hunt — private print kit</title><style>*{box-sizing:border-box}body{font:12px Arial,sans-serif;margin:0}.note{padding:16px;background:#eee}main{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;padding:10mm}article{break-inside:avoid;border:1px dashed #777;display:flex;flex-direction:column;align-items:center;text-align:center;padding:4mm;gap:2mm}article img{width:50mm;height:50mm}code{font-size:11px}small{font-size:9px;max-width:54mm}@page{size:A4;margin:6mm}@media print{.note{display:none}main{padding:0;gap:4mm}article{min-height:81mm}}</style><div class="note"><b>PRIVATE PRINT KIT — do not upload to the public site.</b> Keep the ledger at the counter. Test one physical print with a real phone before manufacturing the batch. These labels do not confirm prize inventory or legal approval.</div><main>${sheets.join('')}</main></html>`,{mode:0o600});
const proof={campaign:inventory.campaign,total:100,per_design:Object.fromEntries(SPECIES.map(s=>[s.id,inventory.tags.filter(t=>t.species===s.id).length])),independent_png_decodes:decoded,independent_180px_decodes:4,error_correction:'M',quiet_zone_modules:4,qr_module_sizes:[...modules],physical_print_camera_test:false,inventory_private:true};
await writeFile(path.join(out,'verification.json'),JSON.stringify(proof,null,2)+'\n',{mode:0o600});await chmod(inventoryPath,0o600);console.log(JSON.stringify(proof));
