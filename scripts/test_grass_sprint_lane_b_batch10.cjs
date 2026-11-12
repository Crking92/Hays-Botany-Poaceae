// Lane B Batch 10 — conditional ciliate ligule on plains lovegrass and 3–4-raceme knotgrass heads.
// Sources: H&L 2015 p.48 / p.58; Go Botany Eragrostis intermedia; Diggs 1999 p.1306;
// UT Austin Williamson County vegetation descriptions.
// Run: node scripts/test_grass_sprint_lane_b_batch10.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(s=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+s+'.json'),'utf8')));
const candidate=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(candidate.length,57);
assert.equal(new Set([...scored,...candidate].map(s=>s.id)).size,169);
assert.equal(scored.reduce((sum,s)=>sum+(s.photos||[]).length,0),514);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,'production index script missing');
const start=js.indexOf('function currentResults()'),stop=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&stop>start,'production scoring filter moved; update this test');
const score=new Function('state',js.slice(start,stop)+'\nreturn currentResults();');
const found=(sel,list=scored)=>new Set(score({species:list,selected:sel,range:'all',query:''}).map(x=>x.s.id));
const positives=[
 ['Plains lovegrass usually hairs','eragrostis-intermedia',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['Plains lovegrass conditional ciliate membrane with tuft','eragrostis-intermedia',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Plains lovegrass conditional ciliate membrane with UT knotty rhizome','eragrostis-intermedia',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['Knotgrass usual two V racemes','paspalum-distichum',{head:'paired_spikes',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['Knotgrass spikelets unilateral','paspalum-distichum',{head:'one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['Knotgrass less usual 3–4 close fingerlike racemes','paspalum-distichum',{head:'fingers',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['Knotgrass 3–4 racemes plus rhizomes','paspalum-distichum',{head:'fingers',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}]
];
for(const [label,id,sel]of positives)assert(found(sel).has(id),label+' false exclusion: '+JSON.stringify(sel));
const negatives=[
 ['Lovegrass not a smooth unligulate plant','eragrostis-intermedia',{ligule:'absent'}],
 ['Lovegrass lacks obvious long awns','eragrostis-intermedia',{awns:'long'}],
 ['Lovegrass is not a fingergrass','eragrostis-intermedia',{head:'fingers'}],
 ['Knotgrass not 7+ unilateral branches','paspalum-distichum',{head:'many_one_sided'}],
 ['Knotgrass not a bristled foxtail','paspalum-distichum',{awns:'bristles'}],
 ['Knotgrass has a membrane, not hair-fringe ligule','paspalum-distichum',{ligule:'hairs'}],
 ['Knotgrass not a true unbranched spike','paspalum-distichum',{head:'spike'}]
];
for(const [label,id,sel]of negatives)assert(!found(sel).has(id),label+' false inclusion: '+JSON.stringify(sel));
const plains=scored.find(s=>s.id==='eragrostis-intermedia');
const knot=scored.find(s=>s.id==='paspalum-distichum');
assert.deepEqual(plains.traits.ligule,['hairs','membrane']);
assert.deepEqual(knot.traits.head,['paired_spikes','one_sided','fingers']);
assert.equal(plains.character_evidence.ligule.role,'vegetative');
assert.equal(knot.character_evidence.head.role,'reproductive');
assert.match(plains.character_evidence.habit.reference,/conflict|contrast/i);
assert.match(knot.character_evidence.habit.reference,/stolon/i);
const unknown={id:'lane-b-unknown',scientific:'Unknown',common:'Unknown',traits:{}};
assert(found({head:'fingers',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},[unknown]).has('lane-b-unknown'));
console.log(JSON.stringify({pass:true,scored:112,provisional:57,configured:169,originalPhotoRefs:514,positive:positives.length,negative:negatives.length,unknownRetention:true},null,2));
