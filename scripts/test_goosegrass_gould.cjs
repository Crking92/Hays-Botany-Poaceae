const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const d=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(d,n),'utf8'));
const html=fs.readFileSync(d+'/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json')),base=read('optional-refinement-evidence.json'),refs={};for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const ctx={state,structuredClone};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('const qs=['),script.indexOf('const state='))+script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+script.slice(script.indexOf('function coreChoiceStatus('),script.indexOf('/* Surface FOUR'))+script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),ctx);
for(const [file,fn]of [['virginia','applyVirginiaGouldSupplement'],['johnsongrass','applyJohnsongrassGouldSupplement'],['kr','applyKRGouldSupplement']]){ctx.pack=read('gould-'+file+'-character-supplement.json');vm.runInContext(fn+'(pack)',ctx);}
ctx.pack=read('gould-goosegrass-character-supplement.json');const id='eleusine-indica',s=species.find(s=>s.id===id),photos=JSON.stringify(species.map(s=>s.photos)),traits=JSON.stringify(s.traits),before=JSON.stringify(state.refineEvidenceMap);
ctx.bad=structuredClone(ctx.pack);ctx.bad.exact_awn_absence.pdf_printed_page=223;assert.throws(()=>vm.runInContext('applyGoosegrassGouldSupplement(bad)',ctx));assert.equal(JSON.stringify(state.refineEvidenceMap),before,'invalid proof rejected atomically');
ctx.bad=structuredClone(ctx.pack);ctx.bad.evidence[0].pdf_printed_page=224;assert.throws(()=>vm.runInContext('applyGoosegrassGouldSupplement(bad)',ctx));assert.equal(JSON.stringify(state.refineEvidenceMap),before,'adjacent taxon page rejected');
vm.runInContext('applyGoosegrassGouldSupplement(pack)',ctx);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',ctx),has=(g,k)=>g[k].some(x=>x.s.id===id);
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),153);assert.equal(JSON.stringify(species.map(s=>s.photos)),photos);assert.equal(JSON.stringify(s.traits),traits);
for(const row of ctx.pack.evidence)for(const v of row.states){state.refineSelected={[row.character]:[v]};assert(has(run(),'confirmed'),row.character+':'+v);}
for(const v of ctx.pack.exact_awn_absence.conflicting_states){state.refineSelected={true_lemma_awn:[v]};assert(has(run(),'excluded'),'explicit awnless versus '+v);assert.equal(run().excluded.filter(x=>x.contradictions.some(c=>c.policy==='EXACT_SPECIES_EXPLICIT_AWNLESS')).length,1,'narrow species-specific rule');}
for(const v of ['none','apical_mucro','pedicelled_awnless','lower_sterile_awn_variable']){state.refineSelected={true_lemma_awn:[v]};assert(!has(run(),'excluded'),'not a demonstrated true awn: '+v);}
state.refineSelected={};state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'short_single'};assert(!has(run(),'excluded'),'beginner short bristle is ambiguous');assert(run().unresolved.some(x=>x.s.id===id),'broad option retains unknown');
state.refineSelected={true_lemma_awn:['fertile_awn_1_to_1_5mm']};assert(has(run(),'excluded'),'precise KR awn rules goosegrass out');assert(run().confirmed.some(x=>x.s.id==='bothriochloa-ischaemum'));
for(const row of read('gould-kr-character-supplement.json').evidence)state.refineSelected[row.character]=row.states;
const kr=run();assert(has(kr,'excluded'));assert(kr.confirmed.some(x=>x.s.id==='bothriochloa-ischaemum'));assert(kr.unresolved.some(x=>x.s.id==='chloris-virgata'),'no absence rule leaked into Chloris');
const audit={source:'Gould pp.222–223 and exact Diggs p.1268; supplied screenshot',kr_result:{goosegrass:'ruled_out',reason:'Verified true lemma awn conflicts with explicit awnless spikelets',supported:kr.confirmed.map(x=>x.s.id)},advanced:[],core:[]};
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const c of state.refineCharacters)for(const o of c.options){state.refineSelected={[c.id]:[o.id]};const g=run();audit.advanced.push({group:c.id,option:o.id,label:o.label,status:has(g,'confirmed')?'supported':has(g,'excluded')?'source-conflict':'unresolved'});assert.equal(g.confirmed.length+g.unresolved.length+g.excluded.length,112);}
state.refineSelected={};ctx.core=vm.runInContext('qs.map(q=>({id:q.id,options:q.options.map(o=>({id:o.id,label:o.label}))}))',ctx);
for(const c of ctx.core)for(const o of c.options){state.selected={head:null,habit:null,ligule:null,awns:null,[c.id]:o.id};const g=run();audit.core.push({group:c.id,option:o.id,status:has(g,'confirmed')?'supported':has(g,'unresolved')?'unresolved':'core-conflict'});}
assert.equal(audit.core.length,45);
state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'};state.refineSelected={};for(const r of ctx.pack.evidence)state.refineSelected[r.character]=r.states;assert(has(run(),'confirmed'),'full source-supported goosegrass combination');
assert(!state.refineEvidenceMap[id].some(e=>e.states.includes('papilla_based_hairs')),'no inferred papilla bases');
if(process.argv.includes('--write-audit'))fs.writeFileSync(d+'/goosegrass-full-option-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('PASS: all 45 core / 24 groups / 153 advanced; full KR excludes only on verified true awn; mucro/uncertain beginner choices safe; all Gould states positive; exact organ/page guards; photos/core preserved.');

