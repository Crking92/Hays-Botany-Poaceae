'use strict';
// Exact botanical organ and sex-conditional source QA for issue 344 batch.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "panicum-dichotomiflorum|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "source_url": "https://shopbritpress.org/products/illustrated-flora-of-north-central-texas",
    "page": 1296,
    "status": "READY_PRIMARY",
    "lane": "C"
  },
  "hopia-obtusa|lemma_texture": {
    "states": [
      "shiny_hard"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77077132-1/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "D"
  },
  "dichanthelium-pedicellatum|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "source_url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Dichanthelium%20pedicellatum",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "dichanthelium-pedicellatum|true_lemma_awn": {
    "states": [
      "none"
    ],
    "source_url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Dichanthelium%20pedicellatum",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "janochloa-antidotalis|lemma_texture": {
    "states": [
      "shiny_hard"
    ],
    "source_url": "https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=239881",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "avena-fatua|lemma_texture": {
    "states": [
      "hairy"
    ],
    "source_url": "https://shopbritpress.org/products/illustrated-flora-of-north-central-texas",
    "page": 1244,
    "status": "READY_PRIMARY",
    "lane": "A"
  },
  "phalaris-caroliniana|true_lemma_awn": {
    "states": [
      "none"
    ],
    "source_url": "https://w3.biosci.utexas.edu/prc/K12/pages/Phalaris%20caroliniana.html",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "eriochloa-sericea|lemma_texture": {
    "states": [
      "wrinkled"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:402055-1/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "C"
  },
  "urochloa-fusca|lemma_texture": {
    "states": [
      "wrinkled"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1156554-2/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "urochloa-reptans|lemma_texture": {
    "states": [
      "wrinkled"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:426280-1/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "urochloa-texana|lemma_texture": {
    "states": [
      "wrinkled"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:943745-1/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "avena-sativa|lemma_texture": {
    "states": [
      "smooth"
    ],
    "source_url": "https://shopbritpress.org/products/illustrated-flora-of-north-central-texas",
    "page": 1244,
    "status": "READY_PRIMARY",
    "lane": "A"
  },
  "avena-sativa|true_lemma_awn": {
    "states": [
      "none"
    ],
    "source_url": "https://shopbritpress.org/products/illustrated-flora-of-north-central-texas",
    "page": 1244,
    "status": "READY_PRIMARY",
    "lane": "A"
  },
  "cortaderia-selloana|lemma_texture": {
    "states": [
      "hairy"
    ],
    "source_url": "https://shopbritpress.org/products/illustrated-flora-of-north-central-texas",
    "page": 1258,
    "status": "READY_PRIMARY",
    "lane": "A"
  },
  "dichanthelium-acuminatum|lemma_texture": {
    "states": [
      "shiny_hard"
    ],
    "source_url": "https://idtools.org/id/weed-tool/key/GrapeGrassKey/Media/Html/fact_sheets/Dic-acu.html",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "B"
  },
  "megathyrsus-maximus|lemma_texture": {
    "states": [
      "wrinkled"
    ],
    "source_url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A60426565-2/general-information",
    "page": null,
    "status": "READY_SUPPLEMENTAL_CONDITIONAL",
    "lane": "A"
  }
};
assert.equal(Object.keys(expected).length,16);
const ids=new Map(),options=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const r of pack.evidence){const k=r.id+'|'+r.character;assert(!ids.has(k),'duplicate '+k);ids.set(k,r)}
for(const [key,ref] of Object.entries(expected)){
 const row=ids.get(key);assert(row,'Missing exact organ source '+key);
 assert.deepEqual([...row.states].sort(),[...ref.states].sort(),'States changed '+key);
 assert.equal(row.source_url,ref.source_url,'Citation changed '+key);
 assert.equal(row.review_lane,ref.lane,'Provenance changed '+key);
 assert.equal(row.coordination_issue,344);
 assert(row.note?.trim()&&row.states.every(s=>options.get(row.character)?.has(s)),'Missing anatomical caveat or UI option '+key);
 assert.equal(row.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 if(ref.status==='READY_PRIMARY'){
  assert(row.source.includes("Diggs, Lipscomb & O'Kennon")&&row.source.includes('printed p. '+ref.page),'Primary printed Flora citation missing '+key);
  assert.equal(row.pdf_printed_page,ref.page);
 }else{
  assert.equal(row.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
  assert.equal(row.source_priority_status,'supplemental_not_overriding_primary');
  assert(row.original_source_citation?.includes(ref.source_url),'Original secondary source missing '+key);
 }
}
assert(ids.get('cortaderia-selloana|lemma_texture')?.note.includes('FEMALE'),'Sex-specific female lemma condition lost');
assert(ids.get('avena-sativa|true_lemma_awn')?.note.includes('ABSENT'),'Optional awnless oat condition lost');
assert(ids.get('phalaris-caroliniana|true_lemma_awn')?.note.includes('sterile lemmas'),'Sterile scale incorrectly read as a true awn');
for(const id of ['urochloa-fusca','urochloa-reptans','urochloa-texana'])
 assert(/FERTILE|fertile/.test(ids.get(id+'|lemma_texture')?.note||''),'Upper fertile lemma identity lost '+id);
assert(!ids.has('echinochloa-crus-galli|true_lemma_awn'),'Lower sterile awn transferred to true fertile awn');
assert(![...ids.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Held hybrid admitted');
console.log('PASS: 16 source-verified organ-specific, sex-qualified grass evidence additions');
