const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const d=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(d,n),'utf8'));
const html=fs.readFileSync(d+'/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json')),base=read('optional-refinement-evidence.json'),refs={};
for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const ctx={state,structuredClone};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+script.slice(script.indexOf('function coreChoiceStatus('),script.indexOf('/* Surface FOUR'))+script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),ctx);
for(const [file,fn]of [['virginia','applyVirginiaGouldSupplement'],['johnsongrass','applyJohnsongrassGouldSupplement'],['kr','applyKRGouldSupplement']]){ctx.pack=read('gould-'+file+'-character-supplement.json');vm.runInContext(fn+'(pack)',ctx);}
ctx.pack=read('gould-chloris-virgata-character-supplement.json');
const photos=JSON.stringify(species.map(s=>s.photos)),originalTraits=JSON.stringify(species.find(s=>s.id==='chloris-virgata').traits);
vm.runInContext('applyChlorisVirgataGouldSupplement(pack)',ctx);
state.refineEvidenceOptionKeys=new Set(Object.values(refs).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',ctx),id='chloris-virgata';
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),153);
assert.equal(JSON.stringify(species.map(s=>s.photos)),photos);assert.equal(JSON.stringify(species.find(s=>s.id===id).traits),originalTraits);
for(const row of ctx.pack.evidence)for(const v of row.states){state.refineSelected={[row.character]:[v]};assert(run().confirmed.some(x=>x.s.id===id),row.character+':'+v);}
state.refineSelected={florets_per_spikelet:['two','several'],glume_marks:['glabrous','smooth_glume_rough_midnerve']};assert(run().confirmed.some(x=>x.s.id===id),'independent states retained');
state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'short_single'};
state.refineSelected={blade_width:'narrow',blade_hairs:['base_hairs','papilla_based_hairs'],ligule_length:'tiny',ligule_edge:['truncate'],sheath_surface:['glabrous'],true_lemma_awn:['fertile_awn_1_to_1_5mm','bent_twisted','pedicelled_awnless'],glume_marks:['sessile_first_glume_unpitted','sessile_first_glume_scabrous_margins','sessile_first_glume_hispid_back']};
const kr=run();assert(kr.confirmed.some(x=>x.s.id==='bothriochloa-ischaemum'));assert(kr.unresolved.some(x=>x.s.id===id),'unknown KR-specific traits must remain possible');assert(!kr.excluded.some(x=>x.s.id===id));
// Exhaustive species-record stress check includes conditional and age variants.
// These are literature alternatives, not instructions to observe them on one plant.
for(const row of read('gould-kr-character-supplement.json').evidence)state.refineSelected[row.character]=row.states;
const allKR=run();assert(allKR.confirmed.some(x=>x.s.id==='bothriochloa-ischaemum'),'all Gould KR source states');assert(allKR.unresolved.some(x=>x.s.id===id),'all KR source states keep undocumented Chloris possible');
const evidence=state.refineEvidenceMap[id];
assert(!evidence.some(e=>e.states.some(v=>['papilla_based_hairs','bent_twisted','sessile_first_glume_hispid_back','pedicelled_awnless'].includes(v))),'no fabricated KR organ states');
const audit={source:'Gould p.321; supplied image',kr_combination:state.refineSelected,kr_result:{supported:kr.confirmed.map(x=>x.s.id),chloris:'unresolved'},advanced:[]};
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const c of state.refineCharacters)for(const o of c.options){state.refineSelected={[c.id]:[o.id]};const g=run();const classification=g.confirmed.some(x=>x.s.id===id)?'supported':g.excluded.some(x=>x.s.id===id)?'source-conflict':'unresolved';audit.advanced.push({group:c.id,option:o.id,label:o.label,classification});assert.equal(g.confirmed.length+g.unresolved.length+g.excluded.length,112);}
if(process.argv.includes('--write-audit'))fs.writeFileSync(d+'/chloris-virgata-kr-comparison-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('PASS: 24 groups / 153 choices; every Gould state positive; full KR combination keeps Chloris unresolved; 2/rarely3 florets, mixed-source state union, exact organs, old traits/photos preserved.');

