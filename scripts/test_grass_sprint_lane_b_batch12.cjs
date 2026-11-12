// Lane B Batch 12 — annual bluegrass decumbent/rooted-mat visual choice.
// Source hierarchy: Hagenbuch & Lemke (2015) printed p.59, FNA Poa annua,
// UT Austin Williamson County Poa annua: conditional low culms rooting at nodes.
// Run independently: node scripts/test_grass_sprint_lane_b_batch12.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const repo=path.resolve(__dirname,'..'),lab=path.join(repo,'site','visual-key-lab');
const names=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+n+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112,'original scored inventory');
assert.equal(provisional.length,57,'research-only candidate inventory');
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((sum,s)=>sum+(s.photos||[]).length,0),514,'existing photos untouched');
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
assert.match(html,/Sprawling or mat-forming at the surface/);
assert.match(html,/true stolons OR low decumbent culms that root at their nodes/);
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(code,'missing production script');
const from=code.indexOf('function currentResults()'),to=code.indexOf('\nfunction renderTabs',from);
assert(from>=0&&to>from,'production filter function moved');
const current=new Function('state',code.slice(from,to)+'\nreturn currentResults();');
const results=(picks,species=scored)=>new Set(current({
  species,selected:{head:null,habit:null,ligule:null,awns:null,...picks},range:'all',query:''
}).map(x=>x.s.id));
const poa=scored.find(x=>x.id==='poa-annua');
assert(poa,'Poa annua missing');
assert.deepEqual(poa.traits.habit,['tuft','mat']);
assert.deepEqual(poa.traits.head,['airy','compact']);
assert.deepEqual(poa.traits.ligule,['membrane']);
assert.deepEqual(poa.traits.awns,['none_obvious']);
assert.match(poa.character_evidence.habit.reference,/Hill Country/);
assert.match(poa.character_evidence.habit.reference,/rooting at the base/);
assert.match(poa.character_evidence.habit.reference,/CONDITIONAL/);
const yes=[
  ['normal annual tuft with common compact head',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
  ['normal annual tuft with open head',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
  ['low rooted growth, open head',{head:'airy',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
  ['low rooted growth, compact head',{head:'compact',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
  ['spreading base only; head unknown',{habit:'mat'}],
  ['spreading base and membrane; head unknown',{habit:'mat',ligule:'membrane'}],
  ['open head and spreading base; collar unknown',{head:'airy',habit:'mat'}],
  ['compact head and spreading base; awn state unscored',{head:'compact',habit:'mat',ligule:'membrane'}]
];
for(const [why,picks] of yes)assert(results(picks).has('poa-annua'),why+' must retain P. annua');
const no=[
  ['underground rhizomes',{habit:'rhizome'}],
  ['hair-only true ligule',{ligule:'hairs'}],
  ['ligule absent',{ligule:'absent'}],
  ['foxtail-shaped bristles',{head:'foxtail'}],
  ['paired terminal spikes',{head:'paired_spikes'}],
  ['long obvious lemma awns',{awns:'long'}],
  ['separate Setaria bristles',{awns:'bristles'}]
];
for(const [why,picks] of no)assert(!results(picks).has('poa-annua'),why+' should not spuriously match');
assert(results({habit:'mat'},[{id:'unknown-b12',scientific:'Unknown',common:'Unknown',traits:{}}]).has('unknown-b12'),'unknown-state inclusion');
const texasBlue=scored.find(x=>x.id==='poa-arachnifera');
assert(texasBlue,'Texas bluegrass missing');
assert(texasBlue.traits.habit.includes('rhizome')&&texasBlue.traits.habit.includes('tuft')&&!texasBlue.traits.habit.includes('mat'));
assert(results({head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}).has('sorghum-bicolor'),'preserve pending UI semantics hold without removing open sorghum');
const audit=fs.readFileSync(path.join(repo,'audits','grass-lane-b-closeout-20261112-batch12.md'),'utf8');
assert(audit.includes('Poa annua')&&audit.includes('Dichanthelium commutatum')&&audit.includes('Sorghum bicolor'));
console.log(JSON.stringify({pass:true,corrected:'poa-annua',positivePaths:yes.length,negativeControls:no.length,unknownRetained:true,scored:112,provisional:57,inventory:169,scoredPhotoRefs:514},null,2));
