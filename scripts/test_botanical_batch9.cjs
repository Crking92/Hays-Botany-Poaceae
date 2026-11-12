// node scripts/test_botanical_batch9.cjs [baseline ref]
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=process.argv[2]||'962cb0ded2dd4a592391c785de979dcd5a51f100',lab='site/visual-key-lab/';
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replaceAll('\r\n','\n');
const old=f=>cp.execFileSync('git',['show',`${base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shards.flatMap(s=>JSON.parse(read(lab+`species-${s}.json`))),baseline=shards.flatMap(s=>JSON.parse(old(lab+`species-${s}.json`)));
const script=read(lab+'index.html').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const ctx={state:{species,selected:{},range:'all',query:''}};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('function currentResults()'),script.indexOf('\nfunction renderTabs')),ctx);
const opts={};vm.createContext(opts);vm.runInContext(script.slice(script.indexOf('const qs='),script.indexOf('const state='))+';globalThis.questions=qs;',opts);
const allowed=Object.fromEntries(opts.questions.map(q=>[q.id,q.options.map(o=>o[0])]));
const results=(picks,rows=species)=>{ctx.state.species=rows;ctx.state.selected=picks;return Array.from(ctx.currentResults(),r=>r.s.id);};
const additions={'setaria-parviflora':{habit:['tuft']},'setaria-scheelei':{ligule:['membrane']},'setaria-reverchonii':{ligule:['membrane'],awns:['none_obvious']}};
let combinations=0,photos=0;const changes=[];
for(const before of baseline){
 const after=species.find(s=>s.id===before.id);assert(after);
 if(JSON.stringify(before)!==JSON.stringify(after))changes.push(before.id);
 for(const key of ['photos','photo_character_audit','scientific','range'])assert.deepEqual(after[key],before[key]);
 photos+=before.photos.length;
 for(const [key,values]of Object.entries(after.traits)){
  for(const value of values)assert(allowed[key].includes(value));
  assert.deepEqual(values,[...before.traits[key],...(additions[before.id]?.[key]||[])],`${before.id}: unexpected score edit`);
 }
 const visit=(entries,picks={})=>{if(!entries.length){assert(results(picks).includes(before.id));combinations++;return;}const [[key,values],...rest]=entries;for(const value of values)visit(rest,{...picks,[key]:value});};
 visit(Object.entries(before.traits).filter(([,v])=>v.length));
}
assert.deepEqual(new Set(changes),new Set(Object.keys(additions)));
const fixed=[
 ['setaria-parviflora',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}],
 ['setaria-scheelei',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'}],
 ['setaria-reverchonii',{head:'sparse_bristles',habit:'tuft',ligule:'membrane',awns:'bristles'}],
 ['setaria-reverchonii',{head:'sparse_bristles',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['setaria-reverchonii',{head:'sparse_bristles',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks]of fixed){assert(!results(picks,baseline).includes(id),'must reproduce previous exclusion');assert(results(picks).includes(id));}
assert(!results({awns:'long'}).some(id=>Object.hasOwn(additions,id)),'bristles must not become lemma awns');
assert(!results({awns:'burs'}).some(id=>Object.hasOwn(additions,id)),'unfused bristles must not become burs');
const unknown={id:'unknown',common:'Unknown',scientific:'Unknown',traits:{},range:'UNRESOLVED'};assert.deepEqual(results({ligule:'membrane'},[unknown]),['unknown']);
for(const f of ['site/app.js',lab+'hays-candidates.json',lab+'index.html','site/data/poaceae-index.json'])assert(read(f)===old(f),`${f} changed`);
const candidates=JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(species.length,112);assert.equal(new Set(species.map(s=>s.id)).size,112);assert.equal(candidates.length,57);assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
console.log(JSON.stringify({pass:true,changedRecords:changes.length,scoreAdditions:4,regressionsFailBeforePassAfter:fixed.length,negativeControls:2,unknownRetention:true,priorCombinationsRetained:combinations,photoReferencesPreserved:photos,inventory:169,scored:112,provisional:57,expansionPhotoReferences:candidates.reduce((n,s)=>n+(s.approved_gallery||[]).length,0),expansionTaxaWithReferences:candidates.filter(s=>s.approved_gallery?.length).length},null,2));
