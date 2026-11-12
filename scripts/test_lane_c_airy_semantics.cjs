'use strict';
// Lane C Batch 10 semantic calibration: open is not necessarily an "airy cloud of tiny spikelets".
// Run: node scripts/test_lane_c_airy_semantics.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..','site/visual-key-lab');
const read=s=>fs.readFileSync(path.join(root,s),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shards.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(species.length,112);
assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
assert.equal(species.reduce((total,row)=>total+row.photos.length,0),514);
const html=read('index.html');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script);
new vm.Script(script);
const start=script.indexOf('function currentResults()'),end=script.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start);
const context={state:{species,selected:{},range:'all',query:''}};
vm.createContext(context);vm.runInContext(script.slice(start,end),context);
const results=(picks,items=species)=>{
 context.state.species=items;context.state.selected=picks;context.state.range='all';context.state.query='';
 return Array.from(context.currentResults(),entry=>entry.s.id);
};
assert(html.includes('Many thin branches form an open cloud of tiny spikelets.'),
  'If airy button wording changes, re-evaluate these exclusions; do not silently keep this rule');
const restricted=[
 ['bromus-texensis',['branched_oat'],{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['festuca-versuta',['branched_oat'],{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['sorghastrum-elliottii',['golden_plume','long_narrow_panicle'],{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}]
];
for(const [id,heads,positive] of restricted){
 const row=species.find(s=>s.id===id);assert(row,id+' absent');
 for(const value of heads) assert(row.traits.head.includes(value),id+' lost source-supported field choice '+value);
 assert(!results({head:'airy'},species).includes(id),'misleading airy UI false-positive: '+id);
 assert(results(positive).includes(id),'lost real valid answer for '+id);
 const audit=row.character_evidence.head_airy_ui_semantic_correction;
 assert(audit?.source_url&&audit?.ui_description?.includes('tiny spikelets')&&
   audit.status==='REJECTED_OVERBROAD_FIELD_CHOICE_NOT_SPECIMEN_EXCLUSION',
   'source evidence and rejected-choice rationale missing: '+id);
 assert(row.field_rule.includes('tiny')&&row.field_rule.trim().endsWith('.'),'crew-facing warning missing');
}
const normalTinyHead=[
 ['eragrostis-secundiflora',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['eragrostis-lugens',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['dichanthelium-pedicellatum',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks]of normalTinyHead)assert(results(picks).includes(id),'appropriate airy grass excluded '+id);
assert(results({head:'airy'},[{id:'unknown-probe',scientific:'?',common:'?',range:'UNRESOLVED',traits:{}}]).some(x=>x==='unknown-probe'),
 'missing trait must not hard-exclude');
console.log(JSON.stringify({pass:true,misleadingAiryStatesRemoved:3,validHeadRoutesPreserved:3,
 validTinySpikeletCloudExamples:normalTinyHead.length,photosUnchanged:514,
 totalScored:112,provisional:57,sourceEvidenceRetained:true},null,2));
