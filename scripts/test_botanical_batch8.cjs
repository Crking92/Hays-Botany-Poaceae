// node scripts/test_botanical_batch8.cjs [baseline ref, default 962cb0d]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=process.argv[2]||'962cb0ded2dd4a592391c785de979dcd5a51f100';
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replaceAll('\r\n','\n');
const old=f=>cp.execFileSync('git',['show',`${base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const lab='site/visual-key-lab/';
const files=['a','b','c1','c2','c3','d1','d2','d3','d4'].map(s=>lab+`species-${s}.json`);
const species=files.flatMap(f=>JSON.parse(read(f)));
const baseline=files.flatMap(f=>JSON.parse(old(f)));
const script=read(lab+'index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const ctx={state:{species,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('function currentResults()'),script.indexOf('\nfunction renderTabs')),ctx);
const options={};vm.createContext(options);
vm.runInContext(script.slice(script.indexOf('const qs='),script.indexOf('const state='))+';globalThis.questions=qs;',options);
const allowed=Object.fromEntries(options.questions.map(q=>[q.id,q.options.map(o=>o[0])]));
const results=(picks,rows=species)=>{ctx.state.species=rows;ctx.state.selected=picks;return Array.from(ctx.currentResults(),r=>r.s.id);};
const changed=[];let combinations=0,photoReferences=0;
const expectedAdditions={
 'schizachyrium-scoparium':{habit:['rhizome']},
 'cenchrus-spinifex':{habit:['mat'],ligule:['membrane']}
};
for(const before of baseline){
 const after=species.find(s=>s.id===before.id);assert(after);
 if(JSON.stringify(before)!==JSON.stringify(after))changed.push(before.id);
 for(const key of ['photos','photo_character_audit','range','scientific'])assert.deepEqual(after[key],before[key],`${before.id}: ${key} changed`);
 photoReferences+=before.photos.length;
 for(const [key,values]of Object.entries(after.traits)){
  for(const v of values)assert(allowed[key].includes(v));
  assert.deepEqual(values,[...before.traits[key],...(expectedAdditions[before.id]?.[key]||[])],`${before.id}: unexpected score edit`);
 }
 const visit=(entries,picks={})=>{
  if(!entries.length){assert(results(picks).includes(before.id),`${before.id}: old route lost`);combinations++;return;}
  const [[key,values],...rest]=entries;
  for(const v of values)visit(rest,{...picks,[key]:v});
 };
 visit(Object.entries(before.traits).filter(([,v])=>v.length));
}
assert.deepEqual(new Set(changed),new Set(['schizachyrium-scoparium','cenchrus-spinifex','bothriochloa-ischaemum','panicum-virgatum']));
const fixed=[
 ['schizachyrium-scoparium',{head:'short_racemes',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['cenchrus-spinifex',{head:'burrs',habit:'tuft',ligule:'membrane',awns:'burs'}],
 ['cenchrus-spinifex',{head:'burrs',habit:'mat',ligule:'hairs',awns:'burs'}],
 ['cenchrus-spinifex',{head:'burrs',habit:'mat',ligule:'membrane',awns:'burs'}]
];
for(const [id,picks]of fixed){assert(!results(picks,baseline).includes(id),'regression must fail before correction');assert(results(picks).includes(id));}
for(const habit of ['tuft','mat','rhizome'])assert(results({habit,head:'fingers',ligule:'membrane'}).includes('bothriochloa-ischaemum'));
for(const ligule of ['hairs','membrane'])assert(results({ligule,head:'airy',habit:'rhizome'}).includes('panicum-virgatum'));
assert(!results({head:'short_racemes',habit:'mat'}).includes('schizachyrium-scoparium'));
assert(!results({head:'burrs',awns:'bristles'}).includes('cenchrus-spinifex'));
const unknown={id:'unknown',common:'Unknown',scientific:'Unknown',traits:{},range:'UNRESOLVED'};
assert.deepEqual(results({ligule:'membrane'},[unknown]),['unknown']);
for(const f of ['site/app.js',lab+'hays-candidates.json',lab+'index.html','site/data/poaceae-index.json'])assert(read(f)===old(f),`${f} protected content changed`);
const candidates=JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(species.length,112);assert.equal(new Set(species.map(s=>s.id)).size,112);
assert.equal(candidates.length,57);assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
console.log(JSON.stringify({pass:true,changedRecords:changed.length,scoreAdditions:3,regressionsFailBeforePassAfter:fixed.length,retainedTargetScenarios:5,negativeControls:2,priorCombinationsRetained:combinations,photoReferencesPreserved:photoReferences,unknownRetention:true,inventory:169,scored:112,provisional:57,expansionPhotoReferences:candidates.reduce((n,s)=>n+(s.approved_gallery||[]).length,0),expansionTaxaWithReferences:candidates.filter(s=>s.approved_gallery?.length).length},null,2));
