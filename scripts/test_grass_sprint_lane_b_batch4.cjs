// Lane B Batch 4: preserve source-supported many-raceme barnyardgrass answers.
// Node: node scripts/test_grass_sprint_lane_b_batch4.cjs
// Reproductive sources: Diggs et al. 1999, pp. 1265–1267; Kew GrassBase.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(id=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+id+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(s=>s.id)).size,169);
assert.equal(scored.reduce((sum,s)=>sum+(s.photos?.length||0),0),514,'original photo refs changed');
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const scripts=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(scripts,'production script missing');
const begin=scripts.indexOf('function currentResults()'),end=scripts.indexOf('\nfunction renderTabs',begin);
assert(begin>=0 && end>begin,'production filter moved; review extractor');
const compute=new Function('state',scripts.slice(begin,end)+'\nreturn currentResults();');
const hits=(selected,records=scored)=>new Set(compute({species:records,selected,range:'all',query:''}).map(v=>v.s.id));
const id='echinochloa-crus-galli';
const plant=scored.find(s=>s.id===id);
assert(plant && plant.traits.head.includes('many_one_sided') && plant.traits.head.includes('one_sided'));
const positive=[
 {head:'one_sided',habit:'tuft',ligule:'absent',awns:'long'},
 {head:'many_one_sided',habit:'tuft',ligule:'absent',awns:'long'},
 {head:'many_one_sided',habit:'tuft',ligule:'absent',awns:'none_obvious'},
 {head:'many_one_sided',ligule:'absent'}
];
for(const p of positive)assert(hits(p).has(id),'barnyardgrass falsely excluded: '+JSON.stringify(p));
const negative=[
 [{head:'many_one_sided'},'eleusine-indica'],
 [{head:'many_one_sided'},'elymus-canadensis'],
 [{head:'many_one_sided'},'dichanthelium-oligosanthes'],
 [{head:'many_one_sided',awns:'bristles'},id]
];
for(const [p,taxon]of negative)assert(!hits(p).has(taxon),'unsupported '+taxon+' inclusion');
const unknown={id:'unknown-lane-b',scientific:'Unknown',common:'Unknown',traits:{}};
assert(hits({head:'many_one_sided',ligule:'absent',awns:'long'},[unknown]).has(unknown.id));
console.log(JSON.stringify({pass:true,newBarnyardPaths:positive.length,negativeControls:negative.length,unknownRetention:true,scored:112,provisional:57,photoReferences:514},null,2));
