'use strict';
// Group D: execute actual production currentResults(), never a duplicate scoring function.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'../site/visual-key-lab');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(x=>JSON.parse(read('species-'+x+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
const trials=JSON.parse(read('provisional-trial-profiles.json')).profiles;
const ids=['setaria-viridis','setaria-leucopila','bromus-tectorum','bromus-catharticus','lolium-multiflorum','echinochloa-colona'];
assert.equal(scored.length,112);assert.equal(candidates.length,57);
assert.equal(new Set([...scored,...candidates].map(x=>x.id)).size,169);
for(const id of ids){const t=trials.find(x=>x.id===id);assert(t&&t.trial&&t.admission_status==='RESEARCH_TRIAL_NOT_ADMITTED',id);}
const html=read('index.html');
assert(html.includes('Research trial · unverified')&&html.includes('provisional-trial-profiles.json'));
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(js);new vm.Script(js);
const start=js.indexOf('function currentResults()'),end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start);
const ctx={state:{species:[],selected:{},range:'all',query:''}};vm.createContext(ctx);
vm.runInContext(js.slice(start,end),ctx);
function results(picks={},rows=[...scored,...trials]){
ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
return Array.from(ctx.currentResults(),x=>({id:x.s.id,trial:!!x.s.trial,unknown:x.unknown,confirmed:x.confirmed}));
}
const required=[
['viridis normal','setaria-viridis',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'},true],
['viridis vegetative','setaria-viridis',{habit:'tuft',ligule:'hairs'},true],
['viridis head only','setaria-viridis',{head:'foxtail'},true],
['leucopila ciliate membrane','setaria-leucopila',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'},true],
['leucopila hairlike cilia','setaria-leucopila',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'},true],
['leucopila no flower','setaria-leucopila',{habit:'tuft',ligule:'membrane'},true],
['tectorum mature','bromus-tectorum',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'long'},true],
['tectorum awn skipped','bromus-tectorum',{head:'branched_oat',habit:'tuft',ligule:'membrane'},true],
['catharticus no obvious awn','bromus-catharticus',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'},true],
['catharticus long awn unknown','bromus-catharticus',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'long'},true],
['multiflorum awned','lolium-multiflorum',{head:'spike',habit:'tuft',ligule:'membrane',awns:'long'},true],
['multiflorum awnless','lolium-multiflorum',{head:'spike',habit:'tuft',ligule:'membrane',awns:'none_obvious'},true],
['multiflorum foliage','lolium-multiflorum',{habit:'tuft',ligule:'membrane'},true],
['colona erect','echinochloa-colona',{head:'compact',habit:'tuft',ligule:'absent',awns:'none_obvious'},true],
['colona rooting stems','echinochloa-colona',{head:'one_sided',habit:'mat',ligule:'absent',awns:'none_obvious'},true],
['colona vegetative','echinochloa-colona',{habit:'mat',ligule:'absent'},true],
['colona ascending racemes','echinochloa-colona',{head:'one_sided',habit:'tuft',ligule:'absent'},true],
['viridis true ligule absent','setaria-viridis',{ligule:'absent'},false],
['leucopila true ligule absent','setaria-leucopila',{ligule:'absent'},false],
['tectorum spiny bur','bromus-tectorum',{head:'burrs'},false],
['catharticus cereal spike','bromus-catharticus',{head:'spike'},false],
['multiflorum open cloud','lolium-multiflorum',{head:'airy'},false],
['colona true hair ligule','echinochloa-colona',{ligule:'hairs'},false]
];
const cases=required.map(([name,id,picks,expected])=>{
let matches=results(picks),i=matches.findIndex(x=>x.id===id);
assert(!results(picks,scored).some(x=>x.id===id),'trial in scored inventory '+id);
return {name,id,picks,expected,actual:i>=0,pass:(i>=0)===expected,rank:i<0?null:i+1,officialCompetitors:matches.filter(x=>!x.trial).length,allResults:matches.length};
});
const pitfalls=[
['cheatgrass awns broken','bromus-tectorum',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'},'Source documents broken/missing awns; candidate excluded if user selects no obvious awn'],
['cheatgrass early contracted panicle','bromus-tectorum',{head:'compact',habit:'tuft',ligule:'membrane'},'Juvenile/immature head category ambiguous; skip rather than assert species identity'],
['italian ryegrass low decumbent culm','lolium-multiflorum',{head:'spike',habit:'mat',ligule:'membrane'},'Mat option requires actual rooted stems; decumbent is not necessarily a mat'],
['green foxtail hair fringe misread as membrane','setaria-viridis',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'},'Kew says fringe of hairs; this is ambiguous observer classification, not proven botany error'],
['jungle rice collar hairs misread as ligule','echinochloa-colona',{head:'one_sided',habit:'mat',ligule:'hairs'},'True ligule absent per FNA; user should inspect inside collar'],
['rescue brome unknown awns permits burr choice','bromus-catharticus',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'burs'},'Unscored awn state is intentionally unknown; possible false positive, not positive ID']
].map(([name,id,picks,note])=>{let v=results(picks),i=v.findIndex(x=>x.id===id);return{name,id,picks,found:i>=0,rank:i<0?null:i+1,note,requiresSourceAndPhotoReview:true};});
const empty=results();
assert.equal(empty.filter(x=>!x.trial).length,112);
assert(empty.slice(0,112).every(x=>!x.trial),'trials displaced scored matches');
assert.equal(cases.filter(x=>!x.pass).length,0,'required source-supported regression failed');
const report={summary:{productionSource:'index.html currentResults()',scored:112,trialProfiles:trials.length,trialSpeciesTested:ids.length,configuredSpecies:169,requiredCases:cases.length,passed:cases.filter(x=>x.pass).length,failed:0,observationPitfalls:pitfalls.length,provisionalSpecimenSignoffs:0,livePagePixelsVerified:false},requiredCases:cases,pitfalls};
console.log('GROUP_D_REPORT_START');console.log(JSON.stringify(report,null,2));console.log('GROUP_D_REPORT_END');
console.log('PASS Group D production filter '+cases.length+'/'+cases.length+' required cases; '+pitfalls.length+' field-choice pitfalls exposed.');
