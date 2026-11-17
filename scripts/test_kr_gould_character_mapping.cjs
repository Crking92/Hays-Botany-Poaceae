"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json'));
const base=read('optional-refinement-evidence.json'),refs={};for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const ctx={state,structuredClone,virginia:read('gould-virginia-character-supplement.json'),johnson:read('gould-johnsongrass-character-supplement.json'),kr:read('gould-kr-character-supplement.json')};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+
 script.slice(script.indexOf('function currentResults(){'),script.indexOf('/* Surface FOUR'))+
 script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),ctx);
const krSpecies=species.find(s=>s.id==='bothriochloa-ischaemum'),photos=JSON.stringify(species.map(s=>s.photos)),oldAwnEvidence=JSON.stringify(krSpecies.character_evidence.awns);
vm.runInContext('applyVirginiaGouldSupplement(virginia);applyJohnsongrassGouldSupplement(johnson)',ctx);
const before=JSON.stringify([state.refineCharacters,state.refineEvidenceMap]);
ctx.bad={...ctx.kr,evidence:ctx.kr.evidence.map((r,i)=>i?r:{...r,pdf_printed_page:603})};
assert.throws(()=>vm.runInContext('applyKRGouldSupplement(bad)',ctx));
assert.equal(JSON.stringify([state.refineCharacters,state.refineEvidenceMap]),before,'invalid caption-page evidence must fail atomically');
vm.runInContext('applyKRGouldSupplement(kr)',ctx);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),148);
assert.equal(JSON.stringify(species.map(s=>s.photos)),photos);assert.equal(JSON.stringify(krSpecies.character_evidence.awns),oldAwnEvidence);
assert(krSpecies.traits.awns.includes('short_single')&&krSpecies.traits.awns.includes('long')&&krSpecies.traits.awns.includes('none_obvious'));
assert.equal(krSpecies.diagnostic_checks.filter(c=>c.source?.includes('Gould')).length,3);
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',ctx);
for(const {character,option}of ctx.kr.option_additions){
 state.refineSelected={[character]:[option.id]};const g=run();
 assert(g.confirmed.some(r=>r.s.id===krSpecies.id),option.id+' must positively support scoped KR');
 assert.equal(g.excluded.length,0,'new organ/conditional observations must not exclude unrecorded grasses');
 assert.equal(g.confirmed.length+g.unresolved.length,112);
}
state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'};
state.refineSelected={blade_width:'narrow',blade_hairs:['base_hairs'],ligule_length:'tiny',ligule_edge:['truncate'],sheath_surface:['glabrous'],true_lemma_awn:['fertile_awn_1_to_1_5mm']};
assert(run().confirmed.some(r=>r.s.id===krSpecies.id),'original book combination should be documented');
state.selected.awns='short_single';assert(run().confirmed.some(r=>r.s.id===krSpecies.id),'short main awn path lost');
state.refineSelected.glume_marks=['sessile_first_glume_unpitted','sessile_first_glume_scabrous_margins','sessile_first_glume_hispid_back'];
assert.deepEqual(Array.from(run().confirmed,r=>r.s.id),[krSpecies.id]);
assert.equal(vm.runInContext('refinementMatches(state.species.find(s=>s.id==="bothriochloa-ischaemum")).filter(r=>r.character==="glume_marks").length',ctx),1);
for(const habit of ['tuft','mat','rhizome']){state.selected.habit=habit;assert(!run().excluded.some(r=>r.s.id===krSpecies.id),'Gould management-permitted habit falsely excluded');}
const ev=state.refineEvidenceMap[krSpecies.id];
assert(ev.find(r=>r.character==='ligule_edge').states.includes('erose'),'old H&L erose rim erased');
assert(!ev.find(r=>r.character==='ligule_edge').states.includes('ciliate'),'B. pertusa ciliation must not leak into KR');
assert(!ev.find(r=>r.character==='true_lemma_awn').states.includes('deciduous_awn'),'Johnsongrass awn shedding must not leak into KR');
assert(!ev.find(r=>r.character==='underground_stems').states.includes('creeping_rhizomes'),'conditional KR roots must not become extensive Johnsongrass rhizomes');
const roots=ctx.kr.evidence.filter(r=>['surface_runners','underground_stems'].includes(r.character));
assert(roots.every(r=>r.condition==='UNDER_CLOSE_GRAZING_OR_CUTTING'&&r.pdf_printed_page===602&&r.source_disagreement));
assert.deepEqual(ctx.kr.evidence.find(r=>r.character==='true_lemma_awn').awn_length_mm,[1,1.5]);
assert.equal(ctx.kr.taxon_as_printed,'Bothriochloa ischaemum var. songarica');assert.equal(species.length,112);
console.log('PASS: KR Gould pp.602/604; 14 new choices / 13 groups / 148 total; management/variety/age scope, exact first glumes, short-awns/FNA disagreement, caption-page rejection, old evidence/photos and prior species mappings preserved.');
