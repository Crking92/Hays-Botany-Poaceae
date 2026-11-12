// Scoring Lane C, batch 3. Run: node scripts/test_lane_c_batch3.cjs [baseline-SHA]
// Uses the real production currentResults() function; no mock ranking/filter behavior.
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab='site/visual-key-lab/';
const baseline=process.argv[2]||'f7f1bc9e08da840446d43c2c556cb0d01389416d';
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replaceAll('\r\n','\n');
const old=f=>cp.execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const allShards=['a','b','c1','c2','c3','d1','d2','d3','d4'],focused=['d1','d2','d3','d4'];
const species=allShards.flatMap(id=>JSON.parse(read(lab+'species-'+id+'.json')));
const current=focused.flatMap(id=>JSON.parse(read(lab+'species-'+id+'.json')));
const previous=focused.flatMap(id=>JSON.parse(old(lab+'species-'+id+'.json')));
const src=read(lab+'index.html');
const start=src.indexOf('function currentResults()'),stop=src.indexOf('\nfunction renderTabs');
assert(start>=0&&stop>start,'production filter missing');
const state={species,selected:{},range:'all',query:''};
const currentResults=new Function('state',src.slice(start,stop)+';return currentResults;')(state);
const resultIds=(picks,rows=species)=>{
 state.species=rows;state.selected=picks;state.range='all';state.query='';
 return currentResults().map(x=>x.s.id);
};
const deltas={
 'dinebra-panicea-subsp-mucronata':{head:'many_one_sided'},
 'hilaria-mutica':{habit:'tuft'},
 'panicum-coloratum':{ligule:'hairs'},
 'paspalum-urvillei':{habit:'rhizome'},
 'urochloa-fusca':{head:'many_one_sided'},
 'urochloa-reptans':{head:'many_one_sided'}
};
const realChanges=[],added=[];
let preserved=0,photos=0;
for(const before of previous){
 const after=current.find(x=>x.id===before.id);assert(after,'lost '+before.id);
 if(JSON.stringify(before)!==JSON.stringify(after)) realChanges.push(before.id);
 for(const k of ['id','scientific','common','genus','range','photos','photo_character_audit','source_blob_sha'])
  assert.deepEqual(after[k],before[k],before.id+' protected data altered: '+k);
 photos+=(before.photos||[]).length;
 for(const [k,values]of Object.entries(before.traits)){
  const extras=deltas[before.id]?.[k]?[deltas[before.id][k]]:[];
  assert.deepEqual(after.traits[k],[...values,...extras],before.id+' unexpected '+k+' scoring change');
  added.push(...extras.map(v=>({id:before.id,trait:k,value:v})));
 }
 const tuples=Object.entries(before.traits).filter(([,v])=>v.length);
 const visit=(n,p={})=>{
  if(n===tuples.length){assert(resultIds(p,current).includes(before.id),'old path excluded: '+before.id+'/'+JSON.stringify(p));preserved++;return;}
  const [k,values]=tuples[n];for(const val of values)visit(n+1,{...p,[k]:val});
 };
 visit(0);
}
assert.deepEqual(new Set(realChanges),new Set(Object.keys(deltas)));
assert.equal(added.length,6);
for(const id of Object.keys(deltas)){
 const after=current.find(x=>x.id===id);
 assert(Object.values(after.character_evidence||{}).some(e=>e.review_date==='2026-11-12'&&e.status?.includes('NONEXCLUSION')&&e.source_url),id+' missing dated source evidence');
}
const fixed=[
 ['hilaria-mutica',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['panicum-coloratum',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['panicum-coloratum',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['paspalum-urvillei',{head:'many_one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['paspalum-urvillei',{head:'one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['dinebra-panicea-subsp-mucronata',{head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['urochloa-fusca',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['urochloa-fusca',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['urochloa-reptans',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['urochloa-reptans',{head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'}]
];
for(const [id,selection]of fixed){
 assert(!resultIds(selection,previous).includes(id),'does not reproduce old exclusion: '+id);
 assert(resultIds(selection,current).includes(id),'correction failed: '+id);
}
const negatives=[
 ['hilaria-mutica',{habit:'mat'}],
 ['panicum-coloratum',{ligule:'absent'}],
 ['urochloa-reptans',{head:'fingers'}],
 ['dinebra-panicea-subsp-mucronata',{head:'foxtail'}],
 ['paspalum-urvillei',{habit:'mat'}]
];
for(const [id,selection]of negatives)assert(!resultIds(selection,current).includes(id),'invalid negative retained: '+id);
assert(resultIds({head:'airy',habit:'tuft'},[{id:'unknown-test',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}}]).includes('unknown-test'),'unknown must remain eligible');
const provisional=JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(species.length,112);assert.equal(provisional.length,57);
assert.equal(new Set([...species,...provisional].map(s=>s.id)).size,169);
assert.equal(photos,261);
console.log(JSON.stringify({pass:true,corrected:realChanges,scoreAdditions:added.length,newValidScenarios:fixed.length,negatives:negatives.length,previousCombosPreserved:preserved,photosUnchanged:photos,inventory:169,scored:112,provisional:57},null,2));
