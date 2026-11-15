// Lane B Batch 7 — goosegrass unilateral and seven-plus fingers, correcting false-negative regressions.
// Diggs et al. 1999 printed p.1268; Kew GrassBase Eleusine indica (1–10(17) unilateral racemes).
// Run: node scripts/test_grass_sprint_lane_b_batch7.cjs
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const ids=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=ids.flatMap(x=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+x+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((total,s)=>total+(s.photos||[]).length,0),514);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8'),src=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(src);const b=src.indexOf('function currentResults()'),e=src.indexOf('\nfunction renderTabs',b);
assert(b>=0&&e>b);
const filter=new Function('state',src.slice(b,e)+'\nreturn currentResults();');
const get=(selected,rows=scored)=>new Set(filter({species:rows,selected,range:'all',query:''}).map(x=>x.s.id));
const id='eleusine-indica',s=scored.find(x=>x.id===id);assert(s);
assert.deepEqual(s.traits.head,['fingers','one_sided','many_one_sided']);
assert(s.character_evidence.head.source.includes('Diggs'));
const positive=[
 {head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'one_sided',ligule:'membrane'},
 {head:'many_one_sided',awns:'none_obvious'}
];
for(const p of positive)assert(get(p).has(id),'valid goosegrass excluded: '+JSON.stringify(p));
const unsupported=[
 {head:'foxtail'},
 {head:'compact'},
 {awns:'bristles'},
 {awns:'long'},
 {habit:'rhizome'},
 {ligule:'absent'}
];
for(const p of unsupported)assert(!get(p).has(id),'unsupported goosegrass state: '+JSON.stringify(p));
const oldTests=['scripts/test_grass_sprint_lane_b_batch4.cjs','scripts/test_grass_sprint_lane_b_batch5.cjs'];
for(const old of oldTests){const content=fs.readFileSync(path.join(root,old),'utf8');assert(!/many_one_sided.{0,80}eleusine-indica|eleusine-indica.{0,80}many_one_sided/.test(content),'old invalid goosegrass assertion still present: '+old);}
const unknown={id:'unknown-lane-b',scientific:'Unknown',common:'Unknown',traits:{}};
assert(get({head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},[unknown]).has('unknown-lane-b'));
console.log(JSON.stringify({pass:true,positive:positive.length,negative:unsupported.length,unknownRetention:true,scored:112,provisional:57,photoRefs:514},null,2));
