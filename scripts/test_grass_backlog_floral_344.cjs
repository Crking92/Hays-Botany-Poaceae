'use strict';
// Issue #344: direct Diggs Flora printed page evidence, kept out of admission and hard exclusions.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "panicum-coloratum|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-coloratum|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "page": 1293,
    "lane": "C"
  },
  "panicum-coloratum|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-coloratum|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-dichotomiflorum|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-dichotomiflorum|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "page": 1292,
    "lane": "C"
  },
  "panicum-dichotomiflorum|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-dichotomiflorum|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-hallii|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-hallii|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1291,
    "lane": "C"
  },
  "panicum-hallii|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1291,
    "lane": "C"
  },
  "bouteloua-rigidiseta|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1247,
    "lane": "C"
  },
  "muhlenbergia-utilis|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1290,
    "lane": "B"
  },
  "muhlenbergia-x-involuta|true_lemma_awn": {
    "states": [
      "short"
    ],
    "page": 1288,
    "lane": "B"
  },
  "chloris-x-subdolichostachya|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1256,
    "lane": "B"
  },
  "chloris-x-subdolichostachya|true_lemma_awn": {
    "states": [
      "short"
    ],
    "page": 1257,
    "lane": "B"
  },
  "catapodium-rigidum|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "page": 1260,
    "lane": "C"
  },
  "catapodium-rigidum|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1260,
    "lane": "C"
  },
  "echinochloa-colona|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-colona|spikelet_position": {
    "states": [
      "one_side"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-colona|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-colona|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1266,
    "lane": "C"
  },
  "echinochloa-crus-galli|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-crus-galli|spikelet_position": {
    "states": [
      "one_side"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-crus-galli|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-walteri|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-walteri|spikelet_position": {
    "states": [
      "one_side"
    ],
    "page": 1265,
    "lane": "C"
  },
  "echinochloa-walteri|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "page": 1265,
    "lane": "C"
  },
  "elymus-canadensis|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "page": 1268,
    "lane": "C"
  },
  "elymus-canadensis|true_lemma_awn": {
    "states": [
      "long"
    ],
    "page": 1268,
    "lane": "C"
  },
  "elymus-virginicus|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "page": 1268,
    "lane": "C"
  },
  "elymus-virginicus|true_lemma_awn": {
    "states": [
      "long"
    ],
    "page": 1268,
    "lane": "C"
  },
  "eriochloa-sericea|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1274,
    "lane": "C"
  },
  "eriochloa-sericea|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "page": 1274,
    "lane": "C"
  },
  "eriochloa-sericea|true_lemma_awn": {
    "states": [
      "none",
      "short"
    ],
    "page": 1274,
    "lane": "C"
  },
  "festuca-octoflora|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "page": 1335,
    "lane": "C"
  },
  "festuca-octoflora|lemma_texture": {
    "states": [
      "smooth",
      "hairy"
    ],
    "page": 1336,
    "lane": "C"
  },
  "festuca-octoflora|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "page": 1336,
    "lane": "C"
  },
  "festuca-octoflora|true_lemma_awn": {
    "states": [
      "short"
    ],
    "page": 1336,
    "lane": "C"
  },
  "leersia-oryzoides|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "page": 1280,
    "lane": "C"
  },
  "leersia-oryzoides|spikelet_position": {
    "states": [
      "one_side"
    ],
    "page": 1280,
    "lane": "C"
  },
  "leersia-oryzoides|lemma_texture": {
    "states": [
      "hairy"
    ],
    "page": 1280,
    "lane": "C"
  },
  "leersia-oryzoides|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "page": 1280,
    "lane": "C"
  },
  "polypogon-monspeliensis|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "page": 1314,
    "lane": "C"
  },
  "polypogon-viridis|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "page": 1314,
    "lane": "C"
  },
  "lolium-multiflorum|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1282,
    "lane": "B"
  },
  "lolium-perenne|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1282,
    "lane": "B"
  },
  "disakisperma-dubium|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "page": 1281,
    "lane": "B"
  },
  "disakisperma-dubium|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1281,
    "lane": "B"
  },
  "steinchisma-hians|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1291,
    "lane": "B"
  },
  "steinchisma-hians|glume_marks": {
    "states": [
      "glabrous"
    ],
    "page": 1298,
    "lane": "B"
  },
  "steinchisma-hians|lemma_texture": {
    "states": [
      "smooth"
    ],
    "page": 1298,
    "lane": "B"
  },
  "urochloa-fusca|glume_marks": {
    "states": [
      "glabrous"
    ],
    "page": 1335,
    "lane": "B"
  },
  "bromus-catharticus|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "page": 1251,
    "lane": "D"
  },
  "dinebra-panicea-subsp-mucronata|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "page": 1281,
    "lane": "D"
  },
  "dinebra-panicea-subsp-mucronata|spikelet_position": {
    "states": [
      "two_rows",
      "one_side"
    ],
    "page": 1281,
    "lane": "D"
  },
  "dinebra-panicea-subsp-mucronata|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1281,
    "lane": "D"
  },
  "melica-nitens|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1284,
    "lane": "D"
  },
  "sporobolus-clandestinus|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "page": 1326,
    "lane": "D"
  },
  "avena-fatua|true_lemma_awn": {
    "states": [
      "long",
      "bent_twisted"
    ],
    "page": 1244,
    "lane": "A"
  },
  "cenchrus-spinifex|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "page": 1254,
    "lane": "A"
  },
  "chasmanthium-latifolium|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "page": 1255,
    "lane": "A"
  },
  "chasmanthium-latifolium|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1227,
    "lane": "A"
  },
  "tridentopsis-elongata|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1330,
    "lane": "A"
  },
  "tridentopsis-mutica|true_lemma_awn": {
    "states": [
      "none"
    ],
    "page": 1330,
    "lane": "A"
  }
};
const index=new Map(),allowed=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const row of pack.evidence){const key=row.id+'|'+row.character;assert(!index.has(key),'Duplicate '+key);index.set(key,row)}
assert.equal(Object.keys(expected).length,65,'Expected 65 new primary reproductive rows');
for(const [key,e] of Object.entries(expected)){
 const row=index.get(key);assert(row,'Lost reproductive record '+key);
 assert.deepEqual([...row.states].sort(),[...e.states].sort(),'Wrong reproductive states '+key);
 assert.equal(row.pdf_printed_page,e.page,'Wrong printed source page '+key);
 assert.equal(row.review_lane,e.lane,'Provenance changed '+key);
 assert.equal(row.coordination_issue,344);
 assert(row.source.includes("Diggs, Lipscomb & O'Kennon")&&row.source.includes('printed p. '+e.page),'Flora source mismatch '+key);
 assert.equal(row.source_url,'https://shopbritpress.org/products/illustrated-flora-of-north-central-texas');
 assert.equal(row.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 assert(row.note?.trim()&&row.states.every(x=>allowed.get(row.character)?.has(x)),'Unsupported state/note '+key);
}
assert(!index.has('echinochloa-crus-galli|true_lemma_awn'),'Sterile lemma awn incorrectly transferred to fertile lemma field');
assert(![...index.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid taxon-wide hold released');
console.log('PASS: 65 source-backed Flora reproductive records; true organ anatomy and held hybrid protected.');
