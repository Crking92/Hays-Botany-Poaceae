'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const idx=new Map();for(const r of pack.evidence){const k=r.id+'|'+r.character;assert(!idx.has(k),'Duplicate '+k);idx.set(k,r);}
const eragrostis={
 'eragrostis-secundiflora':1272,
 'eragrostis-spectabilis':1273,
 'eragrostis-trichodes':1274,
 'eragrostis-lugens':null
};
for(const [id,page] of Object.entries(eragrostis)){
 const r=idx.get(id+'|florets_per_spikelet');
 assert(r,'Missing original species floret row '+id);
 assert.deepEqual(r.states,['several'],'Genus-level two-floret overgeneralization survived '+id);
 assert.equal(r.review_lane,'A');assert.equal(r.coordination_issue,344);
 assert.equal(r.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 assert(r.note.length>100&&/species|exact|spikelet/i.test(r.note),'Taxon/source caveat lost '+id);
 if(page){
  assert.equal(r.pdf_printed_page,page,'Diggs species page lost '+id);
  assert(r.source.includes("Diggs, Lipscomb & O'Kennon")&&r.source_url==='https://shopbritpress.org/products/illustrated-flora-of-north-central-texas');
 }else{
  assert.equal(r.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
  assert.equal(r.source_priority_status,'supplemental_not_overriding_primary');
  assert(r.original_source_citation.includes('powo.science.kew.org'),'Kew exact named species citation lost');
 }
}
const intermediate=idx.get('eragrostis-intermedia|florets_per_spikelet');
assert.deepEqual(intermediate.states,['two','several'],'Held local-vs-Flora E. intermedia measurement adjudicated without verification');
const chloris=idx.get('chloris-virgata|florets_per_spikelet');
assert.deepEqual(chloris.states,['two'],'Diggs regional count preference changed without adjudication');
assert(chloris.note.includes('OCCASIONAL THREE')&&chloris.source_disagreement_url?.startsWith('https://'),'FNA third sterile floret discrepancy erased');
const tri=idx.get('tridens-congestus|underground_stems');
assert.deepEqual(tri.states,['long_rhizome']);
assert(/VERY SHORT RHIZOME INTERNODES/.test(tri.note)&&/TOTAL rhizome length/.test(tri.note),'Short internode incorrectly conflated with total rhizome length');
for(const id of ['eragrostis-intermedia','eragrostis-spectabilis']) {
 const row=idx.get(id+'|lemma_texture');
 assert.deepEqual(row.states,['smooth']);
 assert(row.note.includes('KEEL/MIDRIB'),'Glabrous-to-polished inference returned '+id);
}
assert(!idx.has('stapfochloa-canterae|true_lemma_awn'));
assert(!idx.has('triticum-aestivum|leaf_base'));
assert(!idx.has('echinochloa-crus-galli|true_lemma_awn'));
assert(pack.evidence.length===1815,'Final reconciliation changed the number of unique rows');
assert.equal(pack.mode,'NON_EXCLUDING_POSITIVE_RANKING');
console.log('PASS: four exact-species floret revisions, three annotated source conflicts, all holds');
