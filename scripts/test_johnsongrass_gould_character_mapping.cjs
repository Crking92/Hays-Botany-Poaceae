"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json'));
const base=read('optional-refinement-evidence.json'),refs={};for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const sandbox={state,structuredClone,virginia:read('gould-virginia-character-supplement.json'),johnson:read('gould-johnsongrass-character-supplement.json')};vm.createContext(sandbox);
vm.runInContext(script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+
 script.slice(script.indexOf('function currentResults(){'),script.indexOf('/* Surface FOUR'))+
 script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),sandbox);
const original=species.find(s=>s.id==='sorghum-halepense'),oldPhotos=JSON.stringify(species.map(s=>s.photos));
const oldGlumes=structuredClone(refs['sorghum-halepense'].find(e=>e.character==='glume_marks'));
vm.runInContext('applyVirginiaGouldSupplement(virginia);applyJohnsongrassGouldSupplement(johnson)',sandbox);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),134);
assert.equal(JSON.stringify(species.map(s=>s.photos)),oldPhotos);
assert(original.traits.awns.includes('long')&&original.traits.awns.includes('none_obvious')&&original.traits.awns.includes('short_single'));
assert(original.character_evidence.awns.reference.includes('13 mm'),'broader FNA report lost');
assert.equal(original.diagnostic_checks.filter(d=>d.source?.includes('Gould')).length,3);
const currentGlumes=state.refineEvidenceMap[original.id].find(e=>e.character==='glume_marks');
assert.equal(currentGlumes.source,oldGlumes.source);assert.equal(currentGlumes.note,oldGlumes.note);assert(currentGlumes.states.includes('first_enclosing'));
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',sandbox);
for(const {character,option}of sandbox.johnson.option_additions){
 state.refineSelected={[character]:[option.id]};const g=run();
 assert(g.confirmed.some(r=>r.s.id===original.id),character+':'+option.id+' missing Johnsongrass');
 assert.equal(g.excluded.length,0,'new positive option cannot exclude other taxa');
 assert.equal(g.confirmed.length+g.unresolved.length,112);
}
state.selected={head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'};
state.refineSelected={blade_width:'broad',blade_hairs:['hairless'],ligule_edge:['ciliate','truncate'],spikelet_position:['paired'],true_lemma_awn:['short']};
assert(run().confirmed.some(r=>r.s.id===original.id),'book-based formerly unresolved path remains unresolved');
state.selected.awns='short_single';assert(run().confirmed.some(r=>r.s.id===original.id),'short-single main choice should be documented');
state.refineSelected.glume_marks=['sessile_glume_nerveless','sessile_glume_leathery_shiny','sessile_glume_margin_hairs','pedicelled_glume_veined'];
state.refineSelected.true_lemma_awn=['fertile_awn_1_to_1_5mm','deciduous_awn','pedicelled_awnless'];
const g=run();assert.deepEqual(Array.from(g.confirmed,r=>r.s.id),[original.id]);
assert.equal(vm.runInContext('refinementMatches(state.species.find(s=>s.id==="sorghum-halepense")).filter(r=>r.character==="glume_marks").length',sandbox),1);
const rows=state.refineEvidenceMap[original.id];assert(!rows.find(e=>e.character==='true_lemma_awn').states.includes('fertile_awn_2_to_5mm'),'1–1.5 mm is not 2–5 mm');
assert.equal(species.length,112);assert(!species.some(s=>s.id==='sorghum-almum'),'neighboring taxon must not be silently admitted');
assert.equal(sandbox.johnson.printed_page,575);assert.deepEqual(sandbox.johnson.non_scoring_context.sessile_spikelet_length_mm,[4.5,5.5]);
assert.deepEqual(sandbox.johnson.evidence.find(r=>r.character==='true_lemma_awn').awn_length_mm,[1,1.5]);
console.log('PASS: Gould p.575 Johnsongrass; ten new choices/eight groups; 134 options; both hairless/hairy nodes, primary source variation, separate sessile/pedicelled glumes and awns; old evidence/photos and Virginia preserved.');
