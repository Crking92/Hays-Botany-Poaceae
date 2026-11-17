const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const d=path.resolve(__dirname,'../site/visual-key-lab'),read=n=>JSON.parse(fs.readFileSync(path.join(d,n),'utf8'));
const html=fs.readFileSync(d+'/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json')),base=read('optional-refinement-evidence.json'),refs={};for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const ctx={state,structuredClone};vm.createContext(ctx);
vm.runInContext(script.slice(script.indexOf('const qs=['),script.indexOf('const state='))+script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+script.slice(script.indexOf('function coreChoiceStatus('),script.indexOf('/* Surface FOUR'))+script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),ctx);
for(const [file,fn]of [['virginia','applyVirginiaGouldSupplement'],['johnsongrass','applyJohnsongrassGouldSupplement'],['kr','applyKRGouldSupplement']]){ctx.pack=read('gould-'+file+'-character-supplement.json');vm.runInContext(fn+'(pack)',ctx);}
ctx.pack=read('gould-big-bluestem-character-supplement.json');const id='andropogon-gerardi',s=species.find(s=>s.id===id),photos=JSON.stringify(species.map(s=>s.photos)),characterEvidence=JSON.stringify(s.character_evidence),before=JSON.stringify(state.refineEvidenceMap);
ctx.bad=structuredClone(ctx.pack);ctx.bad.variety_key[2].taxon_as_printed='Andropogon ternarius';assert.throws(()=>vm.runInContext('applyBigBluestemGouldSupplement(bad)',ctx));assert.equal(JSON.stringify(state.refineEvidenceMap),before);
ctx.bad=structuredClone(ctx.pack);ctx.bad.evidence[0].pdf_printed_page=551;assert.throws(()=>vm.runInContext('applyBigBluestemGouldSupplement(bad)',ctx));assert.equal(JSON.stringify(state.refineEvidenceMap),before,'partial neighboring page rejected atomically');
vm.runInContext('applyBigBluestemGouldSupplement(pack)',ctx);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',ctx),has=(g,k)=>g[k].some(x=>x.s.id===id);
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),159);assert.equal(JSON.stringify(species.map(s=>s.photos)),photos);assert.equal(JSON.stringify(s.character_evidence),characterEvidence);
assert(s.traits.awns.includes('long')&&s.traits.awns.includes('none_obvious')&&s.traits.awns.includes('short_single'));
for(const row of ctx.pack.evidence)for(const v of row.states){state.refineSelected={[row.character]:[v]};assert(has(run(),'confirmed'),row.character+':'+v);}
state.refineSelected={lemma_texture:['lower_lemma_thin_hyaline','upper_lemma_deep_two_lobes']};assert.equal(run().confirmed.find(x=>x.s.id===id).refinementMatches.length,1,'one point per organ group');
state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'short_single'};state.refineSelected={};assert(has(run(),'confirmed'),'short/absent variety path must be positive');
for(const row of read('gould-kr-character-supplement.json').evidence)state.refineSelected[row.character]=row.states;
const kr=run();assert(has(kr,'unresolved'),'full KR specialized traits must not falsely exclude big bluestem');assert(kr.confirmed.some(x=>x.s.id==='bothriochloa-ischaemum'));
const evidence=state.refineEvidenceMap[id];for(const value of ['upper_one_vein','lower_one_vein','bent_twisted','glabrate_aging','glabrous_nodes','fertile_awn_1_to_1_5mm'])assert(!evidence.some(e=>e.states.includes(value)),'no invented organ state: '+value);
assert(!ctx.pack.evidence.some(e=>e.character==='ligule_length'),'unmeasured short ligule is not a fabricated interval');
assert.equal(ctx.pack.variety_key[0].rhizomes,'well-developed');assert.equal(ctx.pack.variety_key[1].rhizomes,'absent or short');assert.equal(ctx.pack.variety_key[2].rhizomes,'well-developed');
const audit={source:'Gould p.550 exact species and three-variety key; Diggs pp.1238–1239 cross-check',kr_result:{big_bluestem:'unresolved',reason:'Specialized KR states undocumented; awn/rhizome alternatives retained',supported:kr.confirmed.map(x=>x.s.id)},advanced:[],core:[]};
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const c of state.refineCharacters)for(const o of c.options){state.refineSelected={[c.id]:[o.id]};const g=run();audit.advanced.push({group:c.id,option:o.id,label:o.label,status:has(g,'confirmed')?'supported':has(g,'excluded')?'source-conflict':'unresolved'});assert.equal(g.confirmed.length+g.unresolved.length+g.excluded.length,112);}
state.refineSelected={};ctx.core=vm.runInContext('qs.map(q=>({id:q.id,options:q.options.map(o=>({id:o.id,label:o.label}))}))',ctx);
for(const c of ctx.core)for(const o of c.options){state.selected={head:null,habit:null,ligule:null,awns:null,[c.id]:o.id};const g=run();audit.core.push({group:c.id,option:o.id,status:has(g,'confirmed')?'supported':has(g,'unresolved')?'unresolved':'core-conflict'});}
assert.equal(audit.core.length,45);
state.selected={head:'fingers',habit:'tuft',ligule:'membrane',awns:'long'};state.refineSelected={};for(const r of ctx.pack.evidence)state.refineSelected[r.character]=r.states;assert(has(run(),'confirmed'),'aggregate source-supported states positive without universal co-occurrence claim');
if(process.argv.includes('--write-audit'))fs.writeFileSync(d+'/big-bluestem-full-option-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('PASS: 45 core / 24 groups / 159 advanced; short/absent/long awns, variety rhizomes/hairs; full KR keeps big bluestem possible; one-keel not one-vein, rachis-node not culm-node, twisted not necessarily bent; photos/evidence preserved.');

