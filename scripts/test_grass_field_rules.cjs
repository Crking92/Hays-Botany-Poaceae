'use strict';
// Issue #78. Prevent additional truncated crew-facing instructions.
// A small known-backlog allowlist keeps unrelated botanical PRs functional while
// lane owners repair the originals; malformed concatenations are NEVER allowed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '..', 'site/visual-key-lab');
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species = shards.flatMap(s => JSON.parse(
  fs.readFileSync(path.join(dir, 'species-' + s + '.json'),'utf8')));
assert.equal(species.length,112);
const knownTruncated = new Set([
  'chasmanthium-latifolium', 'cynodon-dactylon', 'arundo-donax',
  'bothriochloa-barbinodis', 'triplasiella-eragrostoides'
]);
const unresolved = [];
for(const row of species){
  const text = (row.field_rule || '').trim();
  assert(text.length > 20, 'Missing crew field instruction for ' + row.id);
  if(!/[.!?]$/.test(text)){
    assert(knownTruncated.has(row.id),
      'New truncated field instruction not in Issue #78: ' + row.id + ': ' + text.slice(-80));
    unresolved.push(row.id);
  }
}
const byId = new Map(species.map(s => [s.id,s]));
const forbiddenJoin = [
  ['chasmanthium-latifolium','for the attached A rooted tuft'],
  ['arundo-donax','in on A giant cane stand']
];
for(const [id,fragment] of forbiddenJoin)
  assert(!byId.get(id).field_rule.includes(fragment),
    'Issue #78 malformed appended instruction must be repaired before merge: ' + id);
console.log(JSON.stringify({
  pass:true,scoredProfiles:species.length,issue78KnownTruncationsStillOpen:unresolved,
  newTruncations:0,malformedJoinChecks:forbiddenJoin.length,
  status:unresolved.length ? 'PASS_WITH_DOCUMENTED_EXISTING_TEXT_HOLDS' : 'PASS_ALL_TEXT_ENDINGS'
},null,2));
