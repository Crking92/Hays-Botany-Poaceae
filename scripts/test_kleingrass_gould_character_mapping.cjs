"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json'));
const raw=read('optional-refinement-evidence.json'),refs={};for(const r of raw.evidence)(refs[r.id]??=[]).push(r);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:raw.characters,refineEvidenceMap:refs,refineSelected:{}};
const ctx={state,structuredClone,virginia:read('gould-virginia-character-supplement.json'),johnson:read('gould-johnsongrass-character-supplement.json'),kr:read('gould-kr-character-supplement.json'),klein:read('gould-kleingrass-character-supplement.json')};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+
 script.slice(script.indexOf('function currentResults(){'),script.indexOf('/* Surface FOUR'))+
 script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),ctx);
const klein=species.find(s=>s.id==='panicum-coloratum'),oldPhotos=JSON.stringify(species.map(s=>s.photos)),oldCore=JSON.stringify(klein.traits),oldRefs=JSON.stringify(refs[klein.id]),switchgrass=JSON.stringify(species.find(s=>s.id==='panicum-virgatum'));
vm.runInContext('applyVirginiaGouldSupplement(virginia);applyJohnsongrassGouldSupplement(johnson);applyKRGouldSupplement(kr)',ctx);
const before=JSON.stringify([state.refineCharacters,state.refineEvidenceMap]);
ctx.bad={...ctx.klein,holds:{...ctx.klein.holds,core:{habit:['tuft']}}};
assert.throws(()=>vm.runInContext('applyKleingrassGouldSupplement(bad)',ctx));
assert.equal(JSON.stringify([state.refineCharacters,state.refineEvidenceMap]),before);
vm.runInContext('applyKleingrassGouldSupplement(klein)',ctx);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(r=>r.states.map(v=>r.character+':'+v))));
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),162);
assert.equal(JSON.stringify(species.map(s=>s.photos)),oldPhotos);assert.equal(JSON.stringify(klein.traits),oldCore,'old core source alternatives must remain stored');
assert.equal(JSON.stringify(species.find(s=>s.id==='panicum-virgatum')),switchgrass,'adjacent switchgrass must be untouched');
assert.equal(klein.diagnostic_checks.filter(c=>c.source?.includes('Gould')).length,3);
assert(klein.gould_prior_field_rule.includes('rhizome'),'prior source history not preserved');
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',ctx);
const resultFor=()=>{const g=run();return {g,confirmed:g.confirmed.some(r=>r.s.id===klein.id),unresolved:g.unresolved.some(r=>r.s.id===klein.id),excluded:g.excluded.some(r=>r.s.id===klein.id)}};
for(const {character,option}of ctx.klein.option_additions){state.refineSelected={[character]:[option.id]};const {g,confirmed}=resultFor();assert(confirmed,option.id+' must have exact Klein evidence');assert.equal(g.excluded.length,0);assert.equal(g.confirmed.length+g.unresolved.length,112);}
state.selected={head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'};
state.refineSelected={blade_width:'narrow',blade_hairs:['hairless'],ligule_length:'short',ligule_edge:['ciliate'],sheath_surface:['glabrous'],stem_nodes:['glabrous_nodes'],underground_stems:['rhizomes_not_developed'],basal_crown:['knotty_base'],florets_per_spikelet:['two','lower_floret_staminate','lower_palea_broad_thin_long'],spikelet_position:['short_pedicelled_spikelets','spreading_rebranched_panicle'],glume_marks:['lower_glume_present_shorter','lower_glume_broad_base_acute'],lemma_texture:['upper_lemma_smooth_shiny','upper_lemma_slight_beak']};
assert.deepEqual(Array.from(run().confirmed,r=>r.s.id),[klein.id]);
state.refineSelected.blade_hairs=['blade_hairy'];state.refineSelected.sheath_surface=['sometimes_hairy','sheath_papilla_hairs'];state.refineSelected.stem_nodes=['hairy_nodes'];
assert(resultFor().confirmed,'hairy variants lost');
state.refineSelected.lemma_texture=['smooth','shiny_hard','upper_lemma_slight_beak'];assert(resultFor().confirmed,'mixing preserved supplemental and exact Gould states must not erase one');
state.refineSelected={underground_stems:['short_knotty']};let g=resultFor();assert(g.unresolved&&!g.confirmed&&!g.excluded,'old short-rhizome route must be unresolved');
assert.equal(vm.runInContext('refinementMatches(state.species.find(s=>s.id==="panicum-coloratum")).length',ctx),0,'held rhizome must not rank positively');
state.refineSelected={};state.selected.habit='rhizome';g=resultFor();assert(g.unresolved&&!g.confirmed&&!g.excluded,'main rhizome route must be possible but not confirmed');
state.selected.habit='tuft';state.refineSelected={glume_marks:['lower_reduced']};g=resultFor();assert(g.unresolved&&!g.confirmed&&!g.excluded,'ambiguous tiny/missing glume route must be held');
state.refineSelected={ligule_length:'tiny'};assert(resultFor().confirmed);state.refineSelected={ligule_length:'short'};assert(resultFor().confirmed);
state.refineSelected={blade_width:'thread'};assert(!resultFor().excluded,'2-mm shared boundary must remain possible');
assert.deepEqual(ctx.klein.source_pages,[452,453]);assert.equal(ctx.klein.non_scoring_context.continuation_page_number,'NOT_VISIBLE_IN_OWNER_PHOTO');
assert(!ctx.klein.evidence.some(r=>r.character==='true_lemma_awn'),'beak is not a proven awn/mucro');
assert(!ctx.klein.evidence.some(r=>r.character==='ligule_edge'&&r.states.includes('truncate')),'KR truncate shape leaked into Klein');
assert(!state.refineEvidenceMap[klein.id].find(r=>r.character==='true_lemma_awn').states.includes('apical_mucro'));
// Audit EVERY advanced option against the resulting real filter functions, not just selected new states.
state.selected={head:null,habit:null,ligule:null,awns:null};const groups=[];
for(const c of state.refineCharacters){const choices=[];for(const o of c.options){state.refineSelected={[c.id]:[o.id]};const r=resultFor();assert.equal(r.g.confirmed.length+r.g.unresolved.length+r.g.excluded.length,112);assert.equal([r.confirmed,r.unresolved,r.excluded].filter(Boolean).length,1);
 const primary=ctx.klein.evidence.some(e=>e.character===c.id&&e.states.includes(o.id)),held=klein.gould_character_holds?.[c.id]?.includes(o.id)||false;
 if(primary)assert(r.confirmed,'primary state not documented '+c.id+':'+o.id);if(held)assert(r.unresolved,'held state not unresolved '+c.id+':'+o.id);
 choices.push({id:o.id,label:o.label,source_status:held?'SOURCE_CONFLICT_HELD':primary?'GOULD_EXACT_POSITIVE':r.confirmed?'PRESERVED_SUPPLEMENTAL_POSITIVE':r.excluded?'MEASURED_OR_EXACT_SOURCE_CONFLICT':'NOT_DOCUMENTED_REMAINS_POSSIBLE',outcome:r.confirmed?'supported':r.unresolved?'unresolved':'ruled_out'});
}groups.push({id:c.id,label:c.label,options:choices});}
assert.equal(groups.length,24);assert.equal(groups.flatMap(g=>g.options).length,162);
const qsText=script.match(/const qs=(\[[\s\S]*?\]);/)?.[1];assert(qsText);vm.runInContext('const qs='+qsText,ctx);const qs=vm.runInContext('qs',ctx),core=[];
for(const q of qs){for(const o of q.options){state.selected={head:null,habit:null,ligule:null,awns:null,[q.id]:o[0]};state.refineSelected={};const rows=vm.runInContext('currentResults()',ctx),r=rows.find(x=>x.s.id===klein.id);core.push({character:q.id,value:o[0],outcome:!r?'core_source_conflict':r.unknown?'unresolved':'supported'});if(klein.gould_core_holds?.[q.id]?.includes(o[0]))assert(r&&r.unknown>0);}}
if(process.argv.includes('--write-audit'))fs.writeFileSync(path.join(dir,'kleingrass-full-option-audit.json'),JSON.stringify({scope:'All current main core choices plus every advanced group/option. Five promoted leaf/ligule tabs reuse the audited advanced options.',source_pages:[452,453],groups:24,advanced_options:162,core_options:core,advanced_groups:groups,original_source_history_preserved:true,source_disagreements:ctx.klein.holds.reasons},null,2)+'\n');
console.log('PASS: Kleingrass all 24 groups / 162 advanced choices and '+core.length+' main core choices; book variants, rhizome/lower-glume holds, 2-mm boundary, organ/adjacent-taxon isolation, old sources/photos and prior species preserved.');

