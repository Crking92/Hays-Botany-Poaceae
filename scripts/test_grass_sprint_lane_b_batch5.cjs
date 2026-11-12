// Lane B Batch 5: source-backed seasonal and variable one-sided panicle selection.
// Reproductive sources: Diggs et al. (1999); FNA, UT PRC, Peterson et al. (2014), Kew GrassBase.
// Run: node scripts/test_grass_sprint_lane_b_batch5.cjs
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+n+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(s=>s.id)).size,169);
assert.equal(scored.reduce((total,s)=>total+(s.photos||[]).length,0),514,'original scored photo refs changed');
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source,'production source missing');
const start=source.indexOf('function currentResults()'),stop=source.indexOf('\nfunction renderTabs',start);
assert(start>=0 && stop>start,'production scoring filter changed; revalidate extractor');
const currentResults=new Function('state',source.slice(start,stop)+'\nreturn currentResults();');
const find=(selected,records=scored)=>new Set(currentResults({species:records,selected,range:'all',query:''}).map(row=>row.s.id));
const positives=[
 ['Disakisperma usual one-sided', 'disakisperma-dubium',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Disakisperma seven-plus', 'disakisperma-dubium',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['Disakisperma clustered near-tip', 'disakisperma-dubium',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Digitaria near-tip fingers','digitaria-ciliaris',{head:'fingers',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['Digitaria unilateral fingers','digitaria-ciliaris',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Digitaria seven-plus unilateral fingers','digitaria-ciliaris',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['Digitaria one-to-three close whorls','digitaria-ciliaris',{head:'whorls',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['Urochloa ordinary unilateral branches','urochloa-texana',{head:'one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'}],
 ['Urochloa seven-plus hair-like collar','urochloa-texana',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['Urochloa seven-plus true ciliate membrane','urochloa-texana',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'}]
];
for(const [label,id,selection] of positives)assert(find(selection).has(id),label+': false exclusion '+id);
const negatives=[
 ['Digitaria is not long-awned','digitaria-ciliaris',{head:'many_one_sided',awns:'long'}],
 ['Urochloa is not long-awned','urochloa-texana',{head:'many_one_sided',awns:'long'}],
 ['Disakisperma is not a long bristle grass','disakisperma-dubium',{head:'fingers',awns:'bristles'}],
 ['Goosegrass is not seven-plus lateral branches','eleusine-indica',{head:'many_one_sided'}],
 ['Little barley does not have seven-plus lateral racemes','hordeum-pusillum',{head:'many_one_sided'}],
 ['Elymus is not whorled Digitaria','elymus-canadensis',{head:'whorls'}],
 ['Barnyardgrass is not windmill tiers','echinochloa-crus-galli',{head:'whorls'}],
 ['Texas bluegrass is not radiate branches','poa-arachnifera',{head:'fingers'}]
];
for(const [label,id,selection] of negatives)assert(!find(selection).has(id),label+': unsupported state '+id);
for(const [id,valid]of [
 ['disakisperma-dubium',['one_sided','airy','many_one_sided','fingers']],
 ['digitaria-ciliaris',['fingers','one_sided','many_one_sided','whorls']],
 ['urochloa-texana',['one_sided','many_one_sided']]
]){const s=scored.find(row=>row.id===id);assert(s,id);assert.deepEqual(s.traits.head,valid);
assert(s.character_evidence.head.source && s.character_evidence.head.role==='reproductive');
assert(s.diagnostic_checks.some(c=>/Count|count|cluster|tiers/.test(c.look)));}
const unknown={id:'lane-b-unknown',scientific:'Unknown',common:'Unknown',traits:{}};
assert(find({head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},[unknown]).has(unknown.id));
console.log(JSON.stringify({pass:true,scored:112,provisional:57,inventory:169,originalPhotoRefs:514,positiveScenarios:positives.length,negativeControls:negatives.length,unknownRetention:true},null,2));
