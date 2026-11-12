// Scoring Lane B Batch 8: preserve variable eastern gamagrass spike counts and tapered southwestern bristlegrass.
// Reproductive sources: Diggs et al. (1999), pp. 1319, 1332; FNA, UT Austin PRC, Kew GrassBase.
// Run: node scripts/test_grass_sprint_lane_b_batch8.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const shardNames=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shardNames.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+n+'.json'),'utf8')));
const research=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(research.length,57);
assert.equal(new Set([...scored,...research].map(s=>s.id)).size,169);
assert.equal(scored.reduce((t,s)=>t+(s.photos||[]).length,0),514,'original photographs changed');
const source=fs.readFileSync(path.join(lab,'index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source,'missing production inline script');
const begin=source.indexOf('function currentResults()'),end=source.indexOf('\nfunction renderTabs',begin);
assert(begin>=0&&end>begin,'production scorer moved; update test extraction');
const run=new Function('state',source.slice(begin,end)+'\nreturn currentResults();');
const find=(selected,records=scored)=>new Set(run({species:records,selected,query:'',range:'all'}).map(x=>x.s.id));
const good=[
 ['Gamagrass mixed male/female', 'tripsacum-dactyloides',{head:'mixed_gender',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Gamagrass solitary spicate raceme','tripsacum-dactyloides',{head:'spike',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['Gamagrass terminal paired/digitate rames','tripsacum-dactyloides',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Gamagrass single spike and hair-like collar','tripsacum-dactyloides',{head:'spike',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['Gamagrass digitate and rhizomatous','tripsacum-dactyloides',{head:'fingers',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['Scheele bristlegrass foxtail','setaria-scheelei',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}],
 ['Scheele bristlegrass long tapered panicle','setaria-scheelei',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'bristles'}],
 ['Scheele bristlegrass long head with hair fringe','setaria-scheelei',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'bristles'}]
];
for(const [label,id,picks]of good)assert(find(picks).has(id),label+' falsely excluded '+id);
const invalid=[
 ['Gamagrass not bristled','tripsacum-dactyloides',{head:'spike',awns:'bristles'}],
 ['Gamagrass not long-awned','tripsacum-dactyloides',{head:'fingers',awns:'long'}],
 ['Gamagrass not an airy cloud','tripsacum-dactyloides',{head:'airy'}],
 ['Bristlegrass not awnless','setaria-scheelei',{head:'long_narrow_panicle',awns:'none_obvious'}],
 ['Bristlegrass not an unbranched spike','setaria-scheelei',{head:'spike'}],
 ['Bristlegrass not rhizomatous','setaria-scheelei',{head:'long_narrow_panicle',habit:'rhizome'}]
];
for(const [label,id,picks]of invalid)assert(!find(picks).has(id),label+' accidentally retained '+id);
for(const [id,expected]of [['tripsacum-dactyloides',['mixed_gender','spike','fingers']],['setaria-scheelei',['foxtail','long_narrow_panicle']]]){
 const s=scored.find(x=>x.id===id);assert(s,id);
 assert.deepEqual(s.traits.head,expected);
 assert.equal(s.character_evidence.head.role,'reproductive');
 assert(s.character_evidence.head.source.includes('Diggs'));
 assert(s.diagnostic_checks.some(d=>/spike|narrow|taper|terminal/i.test(d.look)));
}
const unknown={id:'lane-b-unknown',scientific:'Unknown',common:'Unknown',traits:{}};
assert(find({head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},[unknown]).has(unknown.id));
console.log(JSON.stringify({pass:true,positive:good.length,negative:invalid.length,unknownRetention:true,scored:112,provisional:57,configured:169,photoReferences:514},null,2));
