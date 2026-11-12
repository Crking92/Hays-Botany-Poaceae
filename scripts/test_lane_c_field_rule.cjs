'use strict';
// Lane C / Issue #78. Run: node scripts/test_lane_c_field_rule.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const d4 = JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'..','site/visual-key-lab/species-d4.json'),'utf8'));
const row = d4.find(s=>s.id==='triplasiella-eragrostoides');
assert(row,'Triplasiella is missing');
const rule = (row.field_rule||'').trim();
assert(rule.endsWith('.'),'Triplasiella crew text must end in a full sentence');
assert(!rule.includes('confirmed ID: verify t'),'truncated original phrase returned');
for(const phrase of [
  'both palea keels','lemma midnerve tip','upper leaf sheaths',
  'cannot establish their absence','panels 8–9','behind panel 1'
]) assert(rule.includes(phrase),'missing critical diagnostic/scope cue: '+phrase);
assert.deepEqual(row.traits,{
  head:['airy'],habit:['tuft'],ligule:['hairs','membrane'],awns:['none_obvious']
},'Issue #78 text repair must not change Triplasiella scoring');
assert.equal(row.photos.length,8,'existing eight photograph references must remain');
assert.equal(row.character_evidence.taxonomy.status,'ACCEPTED_NAME_AND_GENUS_DIAGNOSIS_CONFIRMED_PHOTO_PENDING',
  'existing species/taxon evidence hold changed');
console.log(JSON.stringify({pass:true,id:row.id,scoreUnchanged:true,photosPreserved:row.photos.length,
  sourceAndPhotoLimitsRetained:true,fieldRuleTruncationFixed:true},null,2));
