// Lane B Batch 11: one-sided solitary tanglehead racemes, preserving old spike/tangled-awn paths.
// Reproductive evidence: Kew GrassBase Heteropogon contortus (one unilateral raceme)
// and U.S. government grass guide (solitary, one-sided seedhead).
// Vegetative: Hagenbuch & Lemke 2015 Hill Country p.51 (membrane with ciliate margin).
// Run: node scripts/test_grass_sprint_lane_b_batch11.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'..'),lab=path.join(repo,'site','visual-key-lab');
const names=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+n+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((sum,s)=>sum+(s.photos||[]).length,0),514);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(code,'missing inline production filter');
const from=code.indexOf('function currentResults()'),to=code.indexOf('\nfunction renderTabs',from);
assert(from>=0&&to>from,'currentResults() extractor moved');
const current=new Function('state',code.slice(from,to)+'\nreturn currentResults();');
const found=(choices,species=scored)=>new Set(current({species,selected:choices,range:'all',query:''}).map(x=>x.s.id));
const id='heteropogon-contortus',rec=scored.find(x=>x.id===id);
assert(rec,'missing Heteropogon');
assert.deepEqual(rec.traits.head,['spike','tangled_awns','one_sided']);
assert.deepEqual(rec.traits.ligule,['membrane','hairs']);
assert.match(rec.character_evidence.head.reference,/UNILATERAL/);
const positive=[
 ['Original spike view',{head:'spike',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['Original tangled mature awns',{head:'tangled_awns',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['One-sided one-raceme outline',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['One-sided with hair-like ciliate membrane',{head:'one_sided',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['One-sided alone; leaf/head traits not yet determined',{head:'one_sided'}],
 ['One-sided plus tuft; no collar selection',{head:'one_sided',habit:'tuft'}],
 ['One-sided plus awn observation; ligule unknown',{head:'one_sided',awns:'long'}]
];
for(const [label,picks]of positive)assert(found(picks).has(id),label+': source-backed false exclusion');
const negative=[
 ['Not a separate bristle grass',{awns:'bristles'}],
 ['No underground rhizome system',{habit:'rhizome'}],
 ['Does not have near-apex multiple finger branches',{head:'fingers'}],
 ['Not seven-plus separate lateral racemes',{head:'many_one_sided'}],
 ['Membranous ciliate ligule is not anatomically absent',{ligule:'absent'}]
];
for(const [label,picks]of negative)assert(!found(picks).has(id),label+': unsupported score state');
const unknown={id:'unknown11',scientific:'Unknown',common:'Unknown',traits:{}};
assert(found({head:'one_sided',habit:'tuft',ligule:'membrane',awns:'long'},[unknown]).has(unknown.id));
const audit=fs.readFileSync(path.join(repo,'audits','grass-lane-b-source-gate-20261112-batch11.md'),'utf8');
assert(audit.includes('Heteropogon contortus')&&audit.includes('Dichanthelium commutatum')&&audit.includes('Sorghum bicolor'));
assert(audit.includes('No new actual Hays')===false); // score file separately states voucher hold
console.log(JSON.stringify({pass:true,newHeadState:'one_sided',positiveScenarios:positive.length,negativeControls:negative.length,unknownRetained:true,scored:112,provisional:57,configured:169,photoRefs:514},null,2));
