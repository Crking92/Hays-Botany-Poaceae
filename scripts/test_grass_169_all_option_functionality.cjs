"use strict";
/* Functional QA across every real 169-species Grass ID Lab profile and every
 * live 24-group/111-option selection. No species, photo or botanical edits. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.join(__dirname,"..","site","visual-key-lab");
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
const base=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>read("species-"+n+".json"));
const trialNames=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"];
const publishedTrials=trialNames.flatMap(n=>read(n).profiles);
assert.equal(base.length,112,"112 existing scored species changed");
assert.equal(publishedTrials.length,53,"53 photo-backed research trial profiles changed");
// The actual visitor boot() also loads the four deliberately photo/identity-held
// candidates from the 57-species manifest as trial-only profiles with UNKNOWN core traits.
const candidateManifest=read("hays-candidates.json").candidates;
assert.equal(candidateManifest.length,57,"57-grass research manifest changed");
const seen=new Set(publishedTrials.map(s=>s.id));
const held=candidateManifest.filter(x=>!seen.has(x.id));
assert.equal(held.length,4,"photo-held/unverified candidates must remain separate");
const heldTrials=held.map(c=>({
 id:c.id,scientific:c.scientific,common:c.common||c.scientific,
 trial:true,admission_status:"RESEARCH_TRIAL_NOT_ADMITTED",range:"UNVERIFIED",
 traits:{head:[],habit:[],ligule:[],awns:[]},photos:[]
}));
const trials=[...publishedTrials,...heldTrials];
assert.equal(trials.length,57,"the full provisional research roster must remain 57");
assert(trials.every(s=>s.trial&&s.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"),"research-only status changed");
const species=[...base,...trials];
assert.equal(new Set(species.map(s=>s.id)).size,169,"duplicate species IDs");
const pack=read("optional-refinement-evidence.json");
assert.equal(pack.evidence.length,1815,"source evidence count changed");
assert.equal(pack.characters.length,24,"character-group count changed");
const bySpecies=Object.groupBy?Object.groupBy(pack.evidence,r=>r.id):pack.evidence.reduce((acc,r)=>((acc[r.id]??=[]).push(r),acc),{});
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,"visitor app script absent");
new vm.Script(js);
const section=js.slice(js.indexOf("function refinementEvidence("),js.indexOf("function renderOptionalCharacters(){"));
const results=js.slice(js.indexOf("function currentResults(){"),js.indexOf("function renderTabs(){"));
assert(section&&results&&section.includes("verifiedAdvancedConflict"),"critical key implementation missing");
const state={
 species,refineEvidenceMap:bySpecies,refineCharacters:pack.characters,
 refineSelected:{},refineOnlyDocumented:false,selected:{head:null,habit:null,ligule:null,awns:null},
 range:"all",query:""
};
const qs=["head","habit","ligule","awns"].map(id=>({id}));
const context={state,qs};vm.createContext(context);vm.runInContext(section+"\n"+results,context);
const run=()=>vm.runInContext("progressiveResultGroups(currentResults())",context);
const total=g=>g.confirmed.length+g.unresolved.length+g.excluded.length;
const ids=g=>[...g.confirmed,...g.unresolved,...g.excluded].map(x=>x.s.id);
const initial=run();
assert(!initial.active&&initial.confirmed.length===169&&!initial.unresolved.length&&!initial.excluded.length,"starting pool is not 169");
const rowCounts=new Map(),speciesById=new Map(species.map(s=>[s.id,s]));
for(const row of pack.evidence){
  assert(speciesById.has(row.id),"evidence species missing from visitor key: "+row.id);
  for(const value of row.states){
    const key=row.character+":"+value;
    rowCounts.set(key,(rowCounts.get(key)||0)+1);
  }
}
let choices=0,backed=0,pending=0,withExclusions=0,groupCount=0;
const findings=[];
for(const character of pack.characters){
  groupCount++;
  for(const option of character.options){
    choices++;
    const key=character.id+":"+option.id,num=rowCounts.get(key)||0;
    state.refineSelected={[character.id]:option.id};
    const g=run();
    assert(g.active,"visitor selection ignored: "+key);
    assert.equal(total(g),169,"species silently lost: "+key);
    assert.equal(new Set(ids(g)).size,169,"species duplicated across buckets: "+key);
    if(option.evidence_pending||!num){
      pending++;
      assert(option.evidence_pending&&num===0,"option without source evidence not labeled pending: "+key);
      assert.equal(g.confirmed.length,0,"unsupported option asserted species matches: "+key);
      assert.equal(g.excluded.length,0,"unsupported option excluded species: "+key);
      assert.equal(g.unresolved.length,169,"unsupported option must leave all possible: "+key);
    }else{
      backed++;
      assert(num>0,"source-backed option is missing records: "+key);
      assert.equal(g.confirmed.length,num,"documented option did not show every verified match: "+key);
      assert(g.confirmed.every(x=>bySpecies[x.s.id]?.some(e=>e.character===character.id&&e.states.includes(option.id))),"uncited match shown: "+key);
    }
    for(const x of g.excluded){
      assert(x.contradictions.length>0,"unexplained exclusion: "+key);
      assert(x.contradictions.every(c=>c.source_url?.startsWith("https://")&&
        ["blade_width","ligule_length","florets_per_spikelet"].includes(c.character)),"unapproved exclusion: "+key);
      assert(!x.s.trial||x.s.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED","provisional profile was silently admitted");
    }
    if(g.excluded.length)withExclusions++;
    findings.push({character:character.id,choice:option.id,matches:g.confirmed.length,unresolved:g.unresolved.length,excluded:g.excluded.length});
  }
}
assert.equal(groupCount,24);
assert.equal(choices,111,"visible option inventory changed");
assert.equal(backed,98,"source-backed option inventory changed");
assert.equal(pending,13,"research pending option inventory changed");
// Multiple independently observed structures must retain the full candidate universe.
for(const c of pack.characters.filter(c=>c.multi_select)){
  assert(c.options.length>=2,"multi-select has fewer than two choices: "+c.id);
  state.refineSelected={[c.id]:c.options.slice(0,2).map(o=>o.id)};
  assert.equal(total(run()),169,"multi-select removed a grass: "+c.id);
}
state.refineSelected={};assert.equal(run().confirmed.length,169,"clearing advanced options did not restore 169");
assert(html.includes('const advancedExcluded=groups.excluded.map('),"visitor ruled-out area missing");
assert(html.includes('id="optional-documented-only"'),"explicit documented-only control missing");
assert(html.includes('id="unresolved-candidates"')||html.includes('unknown.id="unresolved-candidates"'),"unknown possible species list missing");
console.log(JSON.stringify({
 result:"PASS",groups:groupCount,options:choices,sourceBackedOptions:backed,
 pendingOptions:pending,selectionCases:choices,sourceEvidence:pack.evidence.length,
 preservedScored:base.length,preservedProvisional:trials.length,choicesWithConservativeExclusions:withExclusions
}));
