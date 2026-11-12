// Lane B Batch 6: correct hooded windmillgrass unilateral-ray and tiny ligule visual false exclusions.
// Sources: Hagenbuch & Lemke 2015 p.41 (vegetative); Diggs et al. 1999, Chloris (reproductive); Kew GrassBase.
// Run: node scripts/test_grass_sprint_lane_b_batch6.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const names=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+n+'.json'),'utf8')));
const provisional=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((sum,r)=>sum+(r.photos||[]).length,0),514);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8'),src=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(src);
const start=src.indexOf('function currentResults()'),end=src.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'production scorer changed');
const score=new Function('state',src.slice(start,end)+'\nreturn currentResults();');
const candidates=(p,list=scored)=>new Set(score({species:list,selected:p,range:'all',query:''}).map(r=>r.s.id));
const id='chloris-cucullata',rec=scored.find(x=>x.id===id);
assert(rec);
assert.deepEqual(rec.traits.head,['fingers','whorls','one_sided','many_one_sided']);
assert.deepEqual(rec.traits.ligule,['membrane','hairs']);
assert.match(rec.character_evidence.head.reference,/10.?20/i);
assert.match(rec.character_evidence.ligule.reference,/MEMBRANOUS/);
const valid=[
 {head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'whorls',habit:'mat',ligule:'membrane',awns:'none_obvious'},
 {head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},
 {head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'},
 {head:'whorls',habit:'tuft',ligule:'hairs',awns:'none_obvious'},
 {head:'one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'},
 {head:'fingers',habit:'tuft',ligule:'hairs',awns:'none_obvious'}
];
for(const p of valid)assert(candidates(p).has(id),'source-supported Chloris state was excluded: '+JSON.stringify(p));
const invalid=[
 {head:'foxtail'},
 {head:'spike'},
 {awns:'bristles'},
 {awns:'long'},
 {habit:'rhizome'},
 {ligule:'absent'}
];
for(const p of invalid)assert(!candidates(p).has(id),'Chloris unsupported state included: '+JSON.stringify(p));
const unknown={id:'unknown',common:'unknown',scientific:'unknown',traits:{}};
assert(candidates({head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},[unknown]).has('unknown'));
console.log(JSON.stringify({pass:true,scored:112,provisional:57,photoReferences:514,positive:valid.length,negative:invalid.length,unknownRetention:true},null,2));
