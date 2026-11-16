'use strict';
// Issue 344 A/D original source leaf, sheath, node, culm, rhizome positive states.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "anatherum-virginicum|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "page": 35,
    "lane": "A"
  },
  "anatherum-virginicum|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 35,
    "lane": "A"
  },
  "andropogon-gerardi|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|leaf_base": {
    "states": [
      "compressed_sheath"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|ligule_edge": {
    "states": [
      "erose",
      "ciliate"
    ],
    "page": 34,
    "lane": "A"
  },
  "arundo-donax|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 35,
    "lane": "A"
  },
  "arundo-donax|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 35,
    "lane": "A"
  },
  "bothriochloa-barbinodis|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 36,
    "lane": "A"
  },
  "bothriochloa-barbinodis|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "page": 36,
    "lane": "A"
  },
  "bothriochloa-barbinodis|ligule_edge": {
    "states": [
      "erose",
      "lacerate"
    ],
    "page": 36,
    "lane": "A"
  },
  "bothriochloa-ischaemum|ligule_edge": {
    "states": [
      "erose"
    ],
    "page": 37,
    "lane": "A"
  },
  "cenchrus-spinifex|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 41,
    "lane": "A"
  },
  "cenchrus-spinifex|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 41,
    "lane": "A"
  },
  "cenchrus-spinifex|leaf_base": {
    "states": [
      "compressed_sheath"
    ],
    "page": 41,
    "lane": "A"
  },
  "cenchrus-spinifex|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 41,
    "lane": "A"
  },
  "chasmanthium-latifolium|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "page": 41,
    "lane": "A"
  },
  "eragrostis-cilianensis|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "page": 47,
    "lane": "A"
  },
  "eragrostis-cilianensis|blade_midnerve": {
    "states": [
      "pale_center"
    ],
    "page": 47,
    "lane": "A"
  },
  "eragrostis-intermedia|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 48,
    "lane": "A"
  },
  "eragrostis-lugens|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 48,
    "lane": "A"
  },
  "eragrostis-secundiflora|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|blade_hairs": {
    "states": [
      "base_hairs",
      "blade_hairy"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 49,
    "lane": "A"
  },
  "digitaria-ciliaris|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "page": 44,
    "lane": "D"
  },
  "hopia-obtusa|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 51,
    "lane": "D"
  },
  "hopia-obtusa|stem_nodes": {
    "states": [
      "hairy_stolon_nodes"
    ],
    "page": 51,
    "lane": "D"
  },
  "eragrostis-trichodes|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "page": 49,
    "lane": "A"
  },
  "hilaria-belangeri|blade_shape": {
    "states": [
      "flat"
    ],
    "page": 51,
    "lane": "A"
  },
  "hilaria-belangeri|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "page": 51,
    "lane": "A"
  },
  "hilaria-belangeri|ligule_edge": {
    "states": [
      "lacerate"
    ],
    "page": 51,
    "lane": "A"
  },
  "hilaria-mutica|ligule_edge": {
    "states": [
      "lacerate"
    ],
    "page": 51,
    "lane": "A"
  },
  "anatherum-virginicum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 35,
    "lane": "A"
  },
  "anatherum-virginicum|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 35,
    "lane": "A"
  },
  "anatherum-virginicum|stem_special": {
    "states": [
      "culm_branches"
    ],
    "page": 35,
    "lane": "A"
  },
  "andropogon-gerardi|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|underground_stems": {
    "states": [
      "short_rhizome"
    ],
    "page": 34,
    "lane": "A"
  },
  "andropogon-gerardi|stem_special": {
    "states": [
      "culm_branches"
    ],
    "page": 34,
    "lane": "A"
  },
  "paspalum-dilatatum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 57,
    "lane": "D"
  },
  "paspalum-dilatatum|sheath_surface": {
    "states": [
      "lower_compressed"
    ],
    "page": 57,
    "lane": "D"
  },
  "paspalum-distichum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 58,
    "lane": "D"
  },
  "paspalum-distichum|sheath_surface": {
    "states": [
      "weak_keel"
    ],
    "page": 58,
    "lane": "D"
  },
  "paspalum-pubiflorum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 58,
    "lane": "D"
  },
  "paspalum-setaceum|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 58,
    "lane": "D"
  },
  "paspalum-setaceum|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 58,
    "lane": "D"
  },
  "paspalum-urvillei|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 58,
    "lane": "D"
  },
  "cenchrus-spinifex|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 41,
    "lane": "A"
  },
  "cenchrus-spinifex|sheath_surface": {
    "states": [
      "sometimes_hairy",
      "hyaline_margins"
    ],
    "page": 41,
    "lane": "A"
  },
  "sporobolus-clandestinus|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 63,
    "lane": "D"
  },
  "sporobolus-clandestinus|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 63,
    "lane": "D"
  },
  "sporobolus-compositus|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 64,
    "lane": "D"
  },
  "sporobolus-compositus|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 64,
    "lane": "D"
  },
  "sporobolus-vaginiflorus|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 64,
    "lane": "D"
  },
  "sporobolus-vaginiflorus|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 64,
    "lane": "D"
  },
  "sporobolus-vaginiflorus|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 64,
    "lane": "D"
  },
  "tridens-albescens|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "page": 65,
    "lane": "D"
  },
  "tripsacum-dactyloides|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 67,
    "lane": "D"
  },
  "chasmanthium-latifolium|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 41,
    "lane": "A"
  },
  "eragrostis-intermedia|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 48,
    "lane": "A"
  },
  "eragrostis-lugens|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 48,
    "lane": "A"
  },
  "eragrostis-secundiflora|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-secundiflora|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|culm_posture": {
    "states": [
      "erect",
      "geniculate"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-spectabilis|underground_stems": {
    "states": [
      "short_knotty"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-trichodes|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-trichodes|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "page": 49,
    "lane": "A"
  },
  "eragrostis-trichodes|culm_posture": {
    "states": [
      "erect"
    ],
    "page": 49,
    "lane": "A"
  },
  "heteropogon-contortus|stem_special": {
    "states": [
      "culm_branches"
    ],
    "page": 51,
    "lane": "A"
  },
  "hilaria-belangeri|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "page": 51,
    "lane": "A"
  },
  "hilaria-mutica|sheath_margins": {
    "states": [
      "open"
    ],
    "page": 51,
    "lane": "A"
  }
};
assert.equal(Object.keys(expected).length,75);
const idx=new Map(),choices=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const e of pack.evidence){const k=e.id+'|'+e.character;assert(!idx.has(k),'Duplicate species character '+k);idx.set(k,e)}
for(const [k,want] of Object.entries(expected)){
 const e=idx.get(k);assert(e,'Lost original evidence '+k);
 assert.deepEqual([...e.states].sort(),[...want.states].sort(),'State drift '+k);
 assert.equal(e.pdf_printed_page,want.page,'Wrong Hill Country printed page '+k);
 assert.equal(e.review_lane,want.lane);assert.equal(e.coordination_issue,344);
 assert(e.source.includes('Hagenbuch & Lemke')&&e.source.includes('printed p. '+want.page));
 assert(e.source_url.endsWith('#page='+want.page),'Wrong official PDF page anchor '+k);
 assert(e.note?.trim()&&e.states.every(s=>choices.get(e.character)?.has(s)));
 assert.equal(e.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
}
const secundiflora=idx.get('eragrostis-secundiflora|ligule_edge');
assert(secundiflora&&secundiflora.states.join(',')==='hair_fringe'&&secundiflora.pdf_printed_page===49,'Exact H&L p49 short-hair ligule correction lost');
assert(!idx.has('triticum-aestivum|leaf_base'),'Two-source pointed auricle hold incorrectly released');
assert(![...idx.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid hold incorrectly released');
console.log('PASS: 75 source-page primary vegetative traits; historic source conflicts retained on hold');
