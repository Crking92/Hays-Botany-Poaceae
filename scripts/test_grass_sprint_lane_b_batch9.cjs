// Lane B Batch 9: protect an uncommon documented long Phalaris caroliniana panicle.
// Diggs et al. 1999 p.1310, including BRIT/SMU Dallas County specimen Whitehouse 15711.
// Run: node scripts/test_grass_sprint_lane_b_batch9.cjs
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),lab=path.join(base,'site','visual-key-lab');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(x=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+x+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((n,s)=>n+(s.photos||[]).length,0),514);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(js);
const from=js.indexOf('function currentResults()'),to=js.indexOf('\nfunction renderTabs',from);
assert(from>=0&&to>from);
const fn=new Function('state',js.slice(from,to)+'\nreturn currentResults();');
const hits=(selected,records=scored)=>new Set(fn({species:records,selected,range:'all',query:''}).map(x=>x.s.id));
const id='phalaris-caroliniana',plant=scored.find(x=>x.id===id);
assert(plant);
assert.deepEqual(plant.traits.head,['compact','long_narrow_panicle']);
assert(plant.character_evidence.head.reference.includes('Whitehouse 15711'));
const positive=[
 {head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'long_narrow_panicle',ligule:'membrane'},
 {head:'long_narrow_panicle',awns:'none_obvious'}
];
for(const p of positive)assert(hits(p).has(id),'valid long-head Carolina canarygrass excluded: '+JSON.stringify(p));
const invalid=[
 {head:'spike'}, // spike-LIKE panicle is not the UI's true unbranched spike
 {head:'many_one_sided'},
 {head:'airy'},
 {awns:'bristles'},
 {awns:'long'},
 {habit:'rhizome'},
 {ligule:'absent'}
];
for(const p of invalid)assert(!hits(p).has(id),'unsupported Carolina canarygrass scoring state: '+JSON.stringify(p));
const unknown={id:'unknown9',scientific:'Unknown',common:'Unknown',traits:{}};
assert(hits({head:'long_narrow_panicle',ligule:'membrane',habit:'tuft',awns:'none_obvious'},[unknown]).has(unknown.id));
console.log(JSON.stringify({pass:true,positive:positive.length,negative:invalid.length,unknownRetention:true,scored:112,provisional:57,photos:514},null,2));
