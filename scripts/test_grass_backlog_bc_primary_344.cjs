'use strict';
// Coordinated source and anatomy regression: Issue #344 B/C primary vegetative batches.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const lab=path.resolve(__dirname,'../site/visual-key-lab');
const pack=JSON.parse(fs.readFileSync(path.join(lab,'optional-refinement-evidence.json'),'utf8'));
const expected={
  "aristida-oligantha|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 35,
    "lane": "C"
  },
  "aristida-oligantha|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 35,
    "lane": "C"
  },
  "aristida-purpurea|blade_shape": {
    "states": [
      "inrolled"
    ],
    "page": 35,
    "lane": "C"
  },
  "aristida-purpurea|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 35,
    "lane": "C"
  },
  "elymus-canadensis|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "page": 47,
    "lane": "C"
  },
  "elymus-canadensis|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 47,
    "lane": "C"
  },
  "chloris-andropogonoides|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 41,
    "lane": "B"
  },
  "chloris-andropogonoides|ligule_edge": {
    "states": [
      "erose",
      "ciliate"
    ],
    "page": 41,
    "lane": "B"
  },
  "chloris-cucullata|leaf_base": {
    "states": [
      "compressed_sheath"
    ],
    "page": 41,
    "lane": "B"
  },
  "chloris-verticillata|blade_edge": {
    "states": [
      "whitish"
    ],
    "page": 42,
    "lane": "B"
  },
  "chloris-verticillata|leaf_base": {
    "states": [
      "compressed_sheath"
    ],
    "page": 42,
    "lane": "B"
  },
  "chloris-verticillata|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 42,
    "lane": "B"
  },
  "chloris-virgata|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 42,
    "lane": "B"
  },
  "cynodon-dactylon|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 42,
    "lane": "B"
  },
  "chloris-virgata|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 42,
    "lane": "B"
  },
  "elymus-canadensis|ligule_edge": {
    "states": [
      "entire"
    ],
    "page": 47,
    "lane": "C"
  },
  "elymus-virginicus|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 47,
    "lane": "C"
  },
  "elymus-virginicus|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 47,
    "lane": "C"
  },
  "elymus-virginicus|ligule_edge": {
    "states": [
      "erose",
      "ciliate"
    ],
    "page": 47,
    "lane": "C"
  },
  "eriochloa-sericea|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 50,
    "lane": "C"
  },
  "erioneuron-pilosum|blade_venation": {
    "states": [
      "pale_midvein",
      "prominent_midvein"
    ],
    "page": 51,
    "lane": "C"
  },
  "erioneuron-pilosum|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 51,
    "lane": "C"
  },
  "erioneuron-pilosum|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 51,
    "lane": "C"
  },
  "disakisperma-dubium|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 53,
    "lane": "B"
  },
  "eleusine-indica|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "page": 46,
    "lane": "B"
  },
  "eleusine-indica|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 46,
    "lane": "B"
  },
  "eleusine-indica|ligule_edge": {
    "states": [
      "entire",
      "lacerate"
    ],
    "page": 46,
    "lane": "B"
  },
  "muhlenbergia-lindheimeri|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 54,
    "lane": "B"
  },
  "muhlenbergia-reverchonii|ligule_edge": {
    "states": [
      "lacerate"
    ],
    "page": 55,
    "lane": "B"
  },
  "schizachyrium-scoparium|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 60,
    "lane": "B"
  },
  "schizachyrium-scoparium|leaf_base": {
    "states": [
      "compressed_sheath"
    ],
    "page": 60,
    "lane": "B"
  },
  "schizachyrium-scoparium|ligule_edge": {
    "states": [
      "erose"
    ],
    "page": 60,
    "lane": "B"
  },
  "festuca-octoflora|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 68,
    "lane": "C"
  },
  "panicum-capillare|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "page": 56,
    "lane": "C"
  },
  "panicum-hallii|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-hallii|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-hallii|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-virgatum|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-virgatum|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-virgatum|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 57,
    "lane": "C"
  },
  "setaria-parviflora|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-parviflora|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-parviflora|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-scheelei|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 62,
    "lane": "C"
  },
  "sorghastrum-nutans|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 62,
    "lane": "C"
  },
  "bouteloua-curtipendula|underground_stems": {
    "states": [
      "rhizome_present"
    ],
    "page": 38,
    "lane": "C"
  },
  "bouteloua-hirsuta|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 38,
    "lane": "C"
  },
  "dactyloctenium-aegyptium|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 43,
    "lane": "C"
  },
  "echinochloa-colona|sheath_surface": {
    "states": [
      "lower_compressed"
    ],
    "page": 46,
    "lane": "C"
  },
  "festuca-versuta|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 50,
    "lane": "C"
  },
  "panicum-coloratum|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "page": 56,
    "lane": "C"
  },
  "panicum-hallii|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 56,
    "lane": "C"
  },
  "panicum-hallii|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 56,
    "lane": "C"
  },
  "panicum-hallii|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "page": 57,
    "lane": "C"
  },
  "panicum-virgatum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 57,
    "lane": "C"
  },
  "polypogon-monspeliensis|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 60,
    "lane": "C"
  },
  "setaria-parviflora|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-parviflora|sheath_surface": {
    "states": [
      "rough_surface"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-parviflora|culm_posture": {
    "states": [
      "erect",
      "geniculate"
    ],
    "page": 61,
    "lane": "C"
  },
  "eleusine-indica|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 46,
    "lane": "B"
  },
  "eleusine-indica|sheath_surface": {
    "states": [
      "keeled_lower",
      "lower_compressed",
      "sometimes_hairy"
    ],
    "page": 46,
    "lane": "B"
  },
  "eleusine-indica|culm_posture": {
    "states": [
      "erect",
      "geniculate",
      "decumbent"
    ],
    "page": 46,
    "lane": "B"
  },
  "eleusine-indica|surface_runners": {
    "states": [
      "stolon"
    ],
    "page": 46,
    "lane": "B"
  },
  "muhlenbergia-lindheimeri|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 54,
    "lane": "B"
  },
  "muhlenbergia-reverchonii|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 55,
    "lane": "B"
  },
  "muhlenbergia-reverchonii|sheath_surface": {
    "states": [
      "rough_surface"
    ],
    "page": 55,
    "lane": "B"
  },
  "muhlenbergia-reverchonii|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 55,
    "lane": "B"
  },
  "muhlenbergia-schreberi|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 55,
    "lane": "B"
  },
  "setaria-parviflora|underground_stems": {
    "states": [
      "short_knotty"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|underground_stems": {
    "states": [
      "short_scaly"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-reverchonii|basal_crown": {
    "states": [
      "hard_knotty"
    ],
    "page": 61,
    "lane": "C"
  },
  "setaria-scheelei|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 62,
    "lane": "C"
  },
  "setaria-scheelei|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 62,
    "lane": "C"
  },
  "setaria-scheelei|culm_posture": {
    "states": [
      "geniculate"
    ],
    "page": 62,
    "lane": "C"
  },
  "triplasiella-eragrostoides|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "page": 66,
    "lane": "C"
  },
  "sorghum-halepense|blade_venation": {
    "states": [
      "pale_midvein"
    ],
    "page": 63,
    "lane": "B"
  },
  "sorghum-halepense|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 63,
    "lane": "B"
  },
  "phragmites-australis|surface_runners": {
    "states": [
      "stolon"
    ],
    "page": 59,
    "lane": "B"
  },
  "schizachyrium-scoparium|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 60,
    "lane": "B"
  },
  "schizachyrium-scoparium|sheath_surface": {
    "states": [
      "keeled_lower",
      "lower_compressed",
      "sometimes_hairy"
    ],
    "page": 60,
    "lane": "B"
  },
  "sorghum-halepense|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 63,
    "lane": "B"
  },
  "urochloa-fusca|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 68,
    "lane": "B"
  },
  "urochloa-texana|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 68,
    "lane": "B"
  }
};
assert.equal(Object.keys(expected).length,87);
const index=new Map(); const allowed=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const row of pack.evidence){const key=row.id+'|'+row.character;assert(!index.has(key),'Duplicate '+key);index.set(key,row)}
for(const [key,e] of Object.entries(expected)){
 const row=index.get(key);assert(row,'Missing source-verified pair: '+key);
 assert.deepEqual([...row.states].sort(),[...e.states].sort(),'State drift: '+key);
 assert.equal(row.pdf_printed_page,e.page,'Wrong printed page: '+key);
 assert.equal(row.review_lane,e.lane,'Lost lane provenance: '+key);
 assert.equal(row.coordination_issue,344,'Wrong research issue: '+key);
 assert(row.source.includes('Hagenbuch & Lemke')&&row.source.includes('printed p'),'Lost primary source: '+key);
 assert(row.source_url.endsWith('#page='+e.page),'Wrong PDF page URI: '+key);
 assert(row.note&&row.note.trim().length>=7,'Missing anatomical caveat: '+key);
 assert(row.states.every(s=>allowed.get(row.character)?.has(s)),'Nonexistent UI option: '+key);
 assert(row.evidence_level==='PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
}
assert(!pack.evidence.some(e=>e.id==='lolium-x-boucheanum'),'Taxon-wide hybrid hold was released');
console.log('PASS: 87 B/C primary-source optional records with printed page, valid anatomical state and no hybrid promotion');
