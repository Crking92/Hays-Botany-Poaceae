const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{loadApp}=require('./grass_integrated_test_harness.cjs');
const dir=path.resolve(__dirname,'../site/visual-key-lab');
(async()=>{const a=await loadApp(dir+'/index.html'),pack=JSON.parse(fs.readFileSync(dir+'/gould-screenshot-batch-20261118.json'));
 assert.deepEqual(a.warnings,[]);assert.equal(a.state.species.length,169);assert.equal(a.state.species.filter(s=>!s.trial).length,168);assert.equal(a.state.refineCharacters.length,24);
 const run=()=>a.progressiveResultGroups(a.currentResults());let options=0,sourceStates=0;
 for(const g of a.state.refineCharacters){assert.equal(new Set(g.options.map(o=>o.id)).size,g.options.length);if(g.subgroups)for(const o of g.options)assert.equal(g.subgroups.flatMap(s=>s.options).filter(id=>id===o.id).length,1,g.id+':'+o.id);for(const o of g.options){a.state.refineSelected={[g.id]:[o.id]};const r=run();assert.equal(r.confirmed.length+r.unresolved.length+r.excluded.length,169);options++}}
 assert.equal(options,294);
 for(const s of pack.species)for(const row of s.evidence)for(const value of row.states){a.state.refineSelected={[row.character]:[value]};const r=run();assert(r.confirmed.some(x=>x.s.id===s.id),'Own evidence failed '+s.id+'/'+row.character+':'+value);sourceStates++}
 const hybrid=a.state.species.find(s=>s.id==='lolium-x-boucheanum');assert(hybrid.trial);assert(Object.values(hybrid.traits).every(v=>v.length===0));
 const archive=JSON.parse(fs.readFileSync(dir+'/source-reference-gould-1975.json'));for(const s of pack.species){const t=archive.additional_species_treatments.find(t=>t.species_id===s.id);assert(t&&t.learner_diagnostic_checks.length>=2);assert.equal(t.taxon,s.taxon_as_printed)}
 assert.deepEqual(pack.species.find(s=>s.id==='zizania-texana').printed_pages,[48,49]);assert.deepEqual(pack.species.find(s=>s.id==='munroa-pulchella').printed_pages,[]);
 if(process.env.GOULD_BASELINE){const b=await loadApp(path.resolve(process.env.GOULD_BASELINE));assert.equal(JSON.stringify(a.state.species),JSON.stringify(b.state.species),'Existing core traits/media/admissions changed');for(const [id,records] of Object.entries(b.state.refineEvidenceMap))for(const old of records){const now=a.state.refineEvidenceMap[id].find(r=>r.character===old.character);for(const v of old.states)assert(now.states.includes(v),'Prior source state lost');assert.equal(now.note,old.note);assert.equal(now.source,old.source)}}
 console.log(JSON.stringify({status:'PASS',profiles:169,groups:24,options,sourceStates,accounts:pack.species.length,unchangedCoreMediaAdmissions:!!process.env.GOULD_BASELINE}));
})().catch(e=>{console.error(e);process.exitCode=1});
