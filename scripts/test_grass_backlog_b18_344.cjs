'use strict';
// Issue #344 Lane B18: preserve separate sterile and fertile lemmas.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const pairs=new Map(), opts=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(x=>x.id))]));
for (const row of pack.evidence) {
  const k=row.id+'|'+row.character;
  assert(!pairs.has(k),'Duplicate evidence pair: '+k);
  assert(row.states.every(s=>opts.get(row.character)?.has(s)),'Invalid source-to-option state: '+k);
  pairs.set(k,row);
}
const expected={
  'dichanthelium-pedicellatum|floral_hair_position':{
    source:'https://w3.biosci.utexas.edu/prc/K12/pdf/Dichanthelium%20pedicellatum',
    name:'Gibson',page:'PDF p. 1'
  },
  'dichanthelium-acuminatum|floral_hair_position':{
    source:'https://idtools.org/id/weed-tool/key/GrapeGrassKey/Media/Html/fact_sheets/Dic-acu.html',
    name:'IDTools',page:'unpaginated'
  }
};
for(const [key,ref] of Object.entries(expected)){
  const row=pairs.get(key);
  assert(row,'Missing verified lower-sterile lemma record: '+key);
  assert.deepEqual(row.states,['lemma'],'Wrong hair attachment organ: '+key);
  assert.equal(row.source_url,ref.source);
  assert(row.source.includes(ref.name)&&row.source.includes(ref.page),'Source detail lost: '+key);
  assert.equal(row.review_lane,'B');
  assert.equal(row.coordination_issue,344);
  assert.equal(row.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
  assert.equal(row.source_priority_status,'supplemental_not_overriding_primary');
  assert.equal(row.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
  assert(row.original_source_citation.includes(ref.source),'Source hyperlink lost: '+key);
  assert(/LOWER STERILE/i.test(row.note),'Lower sterile lemma warning lost: '+key);
  assert(/UPPER FERTILE/i.test(row.note),'Upper fertile lemma distinction lost: '+key);
  assert(/positive|observ/i.test(row.note),'Conditional observation warning lost: '+key);
}
assert(/sensu lato|broad/i.test(pairs.get('dichanthelium-acuminatum|floral_hair_position').note),'Taxon concept warning lost');
assert(!pairs.has('stapfochloa-canterae|true_lemma_awn'),'Unresolved fertile awn bin was falsely admitted');
assert(!pairs.has('echinochloa-crus-galli|true_lemma_awn'),'Sterile awn was misassigned to fertile lemma');
assert(![...pairs.keys()].some(x=>x.startsWith('lolium-x-boucheanum|')),'Held Lolium hybrid admitted');
assert(pack.evidence.length>=1793,'Previously merged evidence lost');
assert.equal(pack.mode,'NON_EXCLUDING_POSITIVE_RANKING','Changed scoring semantics');
console.log('PASS: Lane B18 two lower sterile lemma hair records, sources and protected holds');
