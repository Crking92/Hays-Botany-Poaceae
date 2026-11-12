'use strict';
/**
 * Coordinator guard for the five-chat additive scoring sprint (Issue #70).
 * Compare actual PR merge preview / main merge commit against its first parent.
 *
 * Legitimate future *removals* should be handled by a separate reviewed
 * source-backed change to this guard, not silently dropped from a scored shard.
 * Does not claim botanical certainty, photo identity or publication rights.
 */
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const prefix='site/visual-key-lab/';
const baselineRef=process.argv[2]||'HEAD^1';
function git(...args){
  return cp.execFileSync('git', args, {cwd:root,encoding:'utf8',maxBuffer:24*1024*1024});
}
const before=Object.fromEntries(shards.map(s=>[
  s,JSON.parse(git('show',baselineRef+':'+prefix+'species-'+s+'.json'))
]));
const after=Object.fromEntries(shards.map(s=>[
  s,JSON.parse(fs.readFileSync(path.join(root,prefix,'species-'+s+'.json'),'utf8'))
]));
const current=Object.values(after).flat();
const previous=Object.values(before).flat();
assert.equal(current.length,112,'unexpected scored inventory size');
assert.equal(previous.length,112,'historical inventory boundary must be reconciled explicitly');
assert.equal(new Set(current.map(x=>x.id)).size,112,'duplicate scored species');
const allowedChanges=new Set(['traits','field_rule','character_evidence','diagnostic_checks']);
const changes=[];
let newStates=0,priorStatesRetained=0,photoRefs=0;
for(const shard of shards){
  const oldRows=before[shard],newRows=after[shard];
  assert.deepEqual(newRows.map(x=>x.id),oldRows.map(x=>x.id),
    shard+': scored records removed, reordered or moved across ownership shards');
  for(let i=0;i<oldRows.length;i++){
    const old=oldRows[i],now=newRows[i];
    photoRefs+=(now.photos||[]).length;
    if(JSON.stringify(old)===JSON.stringify(now))continue;
    for(const key of new Set([...Object.keys(old),...Object.keys(now)])){
      if(JSON.stringify(old[key])!==JSON.stringify(now[key]))
        assert(allowedChanges.has(key),
          old.id+': unexpected mutation of photo/credit/identity or non-scoring field '+key);
    }
    const priorTraits=old.traits||{},nextTraits=now.traits||{};
    const delta={id:now.id,shard,added:[]};
    for(const [trait,oldValues] of Object.entries(priorTraits)){
      assert(Array.isArray(oldValues),old.id+': nonarray old trait '+trait);
      const newValues=nextTraits[trait];
      assert(Array.isArray(newValues),old.id+': removed trait '+trait);
      for(const value of oldValues){
        assert(newValues.includes(value),old.id+': removed allowed path '+trait+'='+value);
        priorStatesRetained++;
      }
    }
    for(const [trait,values] of Object.entries(nextTraits)){
      assert(Array.isArray(values),old.id+': nonarray trait '+trait);
      assert.equal(new Set(values).size,values.length,old.id+': duplicate trait value '+trait);
      const oldValues=priorTraits[trait]||[];
      for(const v of values)if(!oldValues.includes(v)){
        delta.added.push(trait+'='+v);
        newStates++;
      }
    }
    changes.push(delta);
  }
}
assert.equal(photoRefs,514,'scored photo reference inventory unexpectedly changed');
const candidates=JSON.parse(fs.readFileSync(path.join(root,prefix,'hays-candidates.json'),'utf8')).candidates;
assert.equal(candidates.length,57,'candidate inventory count change must be reviewed');
assert.equal(new Set([...current,...candidates].map(x=>x.id)).size,169);
console.log(JSON.stringify({pass:true,baselineRef,changedRecords:changes.length,
  additions:newStates,priorSupportedChoicesKept:priorStatesRetained,
  scoredPhotoReferencesPreserved:photoRefs,scored:112,provisional:57,
  revisions:changes},null,2));
