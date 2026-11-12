// Lane C first-batch scoring regression.
// Run: node scripts/test_lane_c_batch1.cjs [baseline-commit]
const assert=require('node:assert/strict');
const fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab='site/visual-key-lab/';
const baselineCommit=process.argv[2]||'b1bb1fd62cc1a5c7ee12329255d85eb3aa39bd67';
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const prior=p=>cp.execFileSync('git',['show',baselineCommit+':'+p],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shards.flatMap(s=>JSON.parse(read(lab+'species-'+s+'.json')));
const baselineD1=JSON.parse(prior(lab+'species-d1.json'));
const nowD1=JSON.parse(read(lab+'species-d1.json'));
const source=read(lab+'index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const ctx={state:{species,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function currentResults()'),source.indexOf('\nfunction renderTabs')),ctx);
const optionsCtx={};vm.createContext(optionsCtx);
vm.runInContext(source.slice(source.indexOf('const qs='),source.indexOf('const state='))+';globalThis.questions=qs;',optionsCtx);
const allowed=Object.fromEntries(optionsCtx.questions.map(q=>[q.id,q.options.map(o=>o[0])]));
const resultIds=(picks,rows=species)=>{
  ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
  return Array.from(ctx.currentResults(),r=>r.s.id);
};
const changes={
 'digitaria-cognata':{habit:'rhizome'},
 'anatherum-virginicum':{ligule:'hairs'},
 'dichanthelium-pedicellatum':{ligule:'membrane'}
};
let retainedPaths=0,photoRefs=0;
for(const before of baselineD1){
  const after=nowD1.find(s=>s.id===before.id);
  assert(after,'lost '+before.id);
  for(const k of ['id','scientific','common','range','photos','photo_character_audit','source_blob_sha'])
    assert.deepEqual(after[k],before[k],before.id+' modified protected metadata '+k);
  photoRefs+=after.photos.length;
  for(const [trait,vals] of Object.entries(before.traits)){
    for(const val of vals){
      assert(after.traits[trait].includes(val),before.id+' lost '+trait+'/'+val);
      assert(allowed[trait].includes(val),before.id+' unknown preexisting enum');
    }
  }
  for(const [trait,vals] of Object.entries(after.traits))
    for(const val of vals)assert(allowed[trait].includes(val),before.id+' illegal state '+trait+'/'+val);
  for(const [trait,vals] of Object.entries(before.traits)){
    const pairs=Object.entries(before.traits).filter(([,v])=>v.length);
    const visit=(parts,picks={})=>{
      if(!parts.length){assert(resultIds(picks).includes(before.id),before.id+' original path excluded '+JSON.stringify(picks));retainedPaths++;return;}
      const [[key,states],...rest]=parts;
      for(const state of states)visit(rest,{...picks,[key]:state});
    };if(trait===Object.keys(before.traits)[0])visit(pairs);
  }
}
const revised=['digitaria-cognata','anatherum-virginicum','dichanthelium-pedicellatum'];
for(const [id,addition]of Object.entries(changes)){
  const before=baselineD1.find(s=>s.id===id),after=nowD1.find(s=>s.id===id);assert(before&&after);
  for(const [trait,value]of Object.entries(addition)){
    assert(!before.traits[trait].includes(value),id+' baseline already contained '+value);
    assert(after.traits[trait].includes(value),id+' missing '+value);
    assert(after.character_evidence?.[trait]?.source_url?.includes('2015Phytoneuron'),id+' no cited regional source');
  }
}
const checks=[
 ['digitaria-cognata',{head:'wiry',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['digitaria-cognata',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['anatherum-virginicum',{head:'short_racemes',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['dichanthelium-pedicellatum',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks]of checks){
  assert(!resultIds(picks,baselineD1).includes(id),'regression must reproduce baseline false exclusion for '+id);
  assert(resultIds(picks).includes(id),id+' still excluded with '+JSON.stringify(picks));
}
// Do not turn a buried rhizome into a surface stolon or confused floral structures.
assert(!resultIds({habit:'mat',head:'wiry'},nowD1).includes('digitaria-cognata'));
assert(!resultIds({awns:'bristles',head:'short_racemes'},nowD1).includes('anatherum-virginicum'));
const unknown={id:'unknown-test',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(resultIds({ligule:'membrane',habit:'rhizome'},[unknown]),['unknown-test']);
assert.equal(species.length,112);assert.equal(new Set(species.map(s=>s.id)).size,112);
const candidates=JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
console.log(JSON.stringify({pass:true,targets:revised,scoreAdditions:3,regressionPaths:checks.length,negativeControls:2,baselinePathsRetained:retainedPaths,photoReferencesPreservedInD1:photoRefs,unknownStillEligible:true,scored:112,provisional:57,configured:169},null,2));
