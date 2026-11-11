import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {REPO,LAB,TRACKER,FILES,gitHash,inspect,counts,plan,prepare,validateReview,stage,photoPath} from './grass-photo-batch.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
const bytes=Buffer.from([255,216,255,217]);
function fixture() {
  const s={repo:REPO,commit:'a'.repeat(40),files:{},blobs:{}};
  for(const f of FILES)s.files[f]='[]\n';
  s.files[FILES[0]]=JSON.stringify([{id:'test-grass',genus:'Test',common:'Test grass',scientific:'Test grass',traits:{head:['fingers']},diagnostic_checks:[{check:'unchanged'}],photos:[{i:0,src:'https://crking92.github.io/Hays-Botany-Poaceae/content/taxa/Poaceae/Test/test-grass/images/test.jpg',label:'Original caption',creator:'Original author',license:'CC BY 2.0',source_page:'https://example.org/photo'}]}]);
  s.files[TRACKER]='# Tracker\n**Updated:** 2026-11-11\n| 4. Character-photo matching QA | old |\n\n## Phase 4 — old history\nKeep history.\n';
  for(const [p,content] of Object.entries(s.files))s.blobs[p]=gitHash(Buffer.from(content));
  s.blobs['content/taxa/Poaceae/Test/test-grass/images/test.jpg']=gitHash(bytes);return s;
}
async function setup(t) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'grass-batch-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const snapshot=fixture(),batch=plan(snapshot);
  await fs.mkdir(path.join(dir,'images'));await fs.writeFile(path.join(dir,batch.selected[0].local_file),bytes);
  batch.selected[0].bytes=bytes.length;batch.selected[0].sha256=createHash('sha256').update(bytes).digest('hex');
  const review={commit:snapshot.commit,pass:'PHASE4_TEST',review_date:'2026-11-11',reviewer:'Test reviewer',reference_status:'FLORA_PRIMARY_GRASSBASE_DEFERRED',reference_notes:'Test only.',seasonal_notes:'Test only; no queue addition.',photos:[{id:'test-grass',i:0,opened_full_size:true,verdict:'PARTIAL_VISIBLE',shows:['Test observation'],cannot_verify:['Test limitation'],label:'Scoped caption'}]};
  return {dir,snapshot,batch,review};
}
test('rejects a snapshot with changed credits but old hash',()=>{const s=fixture();s.files[FILES[0]]=s.files[FILES[0]].replace('Original author','Other author');assert.throws(()=>inspect(s),/blob mismatch/);});
test('rejects unknown species instead of silently planning a different group',()=>assert.throws(()=>plan(fixture(),{species:['typo']}),/Unknown species/));
test('rejects external and traversal photo URLs',()=>{assert.throws(()=>photoPath('https://example.org/a.jpg'));assert.throws(()=>photoPath('https://crking92.github.io/Hays-Botany-Poaceae/content/taxa/Poaceae/%2e%2e%2fsecret.jpg'));});
test('pending or unopened reviews cannot advance counts',async t=>{const x=await setup(t);x.review.photos[0].opened_full_size=false;await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/Unreviewed/);});
test('stale review blocked',async t=>{const x=await setup(t);x.review.commit='b'.repeat(40);await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/Stale/);});
test('image tampering blocked',async t=>{const x=await setup(t);await fs.appendFile(path.join(x.dir,x.batch.selected[0].local_file),'bad');await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/bytes changed/);});
test('credit tampering in batch blocked',async t=>{const x=await setup(t);x.batch.selected[0].photo.license='CC0';await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/metadata changed/);});
test('wrong target data file blocked',async t=>{const x=await setup(t);x.batch.selected[0].species_file=FILES[1];await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/Species file changed/);});
test('duplicate reviews blocked',async t=>{const x=await setup(t);x.batch.selected.push(clone(x.batch.selected[0]));x.review.photos.push(clone(x.review.photos[0]));await assert.rejects(validateReview(x.snapshot,x.batch,x.review,x.dir),/Duplicate review/);});
test('staging preserves protected fields, old tracker history and counts',async t=>{
  const x=await setup(t);const result=await stage(x.snapshot,x.batch,x.review,x.dir);assert.equal(result.counts.hosted,1);assert.equal(result.counts.partial,1);
  const proposal=JSON.parse(await fs.readFile(path.join(x.dir,'proposal.json'),'utf8'));assert.equal(proposal.expected_head,x.snapshot.commit);
  assert.deepEqual(Object.keys(proposal.files).sort(),[FILES[0],TRACKER].sort());
  const before=JSON.parse(x.snapshot.files[FILES[0]])[0],after=JSON.parse(proposal.files[FILES[0]])[0];
  delete after.photo_character_audit;after.photos[0].label=before.photos[0].label;assert.deepEqual(after,before);
  assert.match(proposal.files[TRACKER],/Keep history/);assert.match(proposal.files[TRACKER],/1\/1/);
});
test('replay validates but never stages or earns new review credit',async t=>{
  const x=await setup(t);const data=JSON.parse(x.snapshot.files[FILES[0]]);data[0].photo_character_audit={photo_roles:[{i:0,verdict:'PARTIAL',pass:'OLD'}]};x.snapshot.files[FILES[0]]=JSON.stringify(data);x.snapshot.blobs[FILES[0]]=gitHash(Buffer.from(x.snapshot.files[FILES[0]]));
  assert.equal(plan(x.snapshot).selected.length,0);assert.equal(counts(x.snapshot).partial,1);
  x.batch=plan(x.snapshot,{replayPass:'OLD'});x.batch.selected[0].sha256=createHash('sha256').update(bytes).digest('hex');x.batch.selected[0].bytes=bytes.length;
  assert.equal((await validateReview(x.snapshot,x.batch,x.review,x.dir)).newHosted,0);
  await assert.rejects(stage(x.snapshot,x.batch,x.review,x.dir),/Replay cannot stage/);
});
test('preparation reuses verified cache and preserves completed review form',async t=>{
  const x=await setup(t);await fs.writeFile(path.join(x.dir,'review.json'),'completed review');
  await prepare(x.snapshot,x.batch,x.dir);assert.equal(await fs.readFile(path.join(x.dir,'review.json'),'utf8'),'completed review');
  assert.match(await fs.readFile(path.join(x.dir,'review.html'),'utf8'),/Original author/);
});
