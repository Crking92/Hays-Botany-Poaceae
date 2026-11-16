'use strict';
// Regression checks for source-verified evidence batch #344 D01–D04.
// Does not change four-question scoring or admit held research species.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../site/visual-key-lab');
const pack=JSON.parse(fs.readFileSync(path.join(root,'optional-refinement-evidence.json'),'utf8'));
const expected={
  "bromus-japonicus|blade_shape": [
    [
      "flat"
    ],
    39
  ],
  "bromus-japonicus|blade_width": [
    [
      "narrow",
      "medium"
    ],
    39
  ],
  "bromus-japonicus|blade_hairs": [
    [
      "blade_hairy"
    ],
    39
  ],
  "bromus-japonicus|ligule_length": [
    [
      "tiny",
      "short"
    ],
    39
  ],
  "bromus-japonicus|ligule_edge": [
    [
      "erose",
      "ciliate"
    ],
    39
  ],
  "bromus-pubescens|blade_shape": [
    [
      "flat"
    ],
    39
  ],
  "bromus-pubescens|blade_width": [
    [
      "medium"
    ],
    39
  ],
  "bromus-pubescens|blade_hairs": [
    [
      "blade_hairy"
    ],
    39
  ],
  "bromus-pubescens|ligule_length": [
    [
      "tiny",
      "short"
    ],
    39
  ],
  "bromus-pubescens|ligule_edge": [
    [
      "erose",
      "ciliate"
    ],
    39
  ],
  "bromus-texensis|blade_shape": [
    [
      "flat"
    ],
    40
  ],
  "bromus-texensis|blade_width": [
    [
      "narrow",
      "medium"
    ],
    40
  ],
  "bromus-texensis|blade_hairs": [
    [
      "blade_hairy"
    ],
    40
  ],
  "bromus-texensis|ligule_length": [
    [
      "short"
    ],
    40
  ],
  "bromus-texensis|ligule_edge": [
    [
      "erose"
    ],
    40
  ],
  "hopia-obtusa|blade_hairs": [
    [
      "base_hairs"
    ],
    51
  ],
  "hopia-obtusa|ligule_length": [
    [
      "short"
    ],
    51
  ],
  "hopia-obtusa|ligule_edge": [
    [
      "entire",
      "lacerate"
    ],
    51
  ],
  "paspalum-dilatatum|ligule_length": [
    [
      "short",
      "medium"
    ],
    57
  ],
  "paspalum-dilatatum|ligule_edge": [
    [
      "entire"
    ],
    57
  ],
  "paspalum-distichum|ligule_length": [
    [
      "short"
    ],
    58
  ],
  "paspalum-distichum|ligule_edge": [
    [
      "entire",
      "erose"
    ],
    58
  ],
  "paspalum-pubiflorum|blade_shape": [
    [
      "flat"
    ],
    58
  ],
  "paspalum-pubiflorum|blade_width": [
    [
      "medium",
      "broad"
    ],
    58
  ],
  "paspalum-pubiflorum|blade_hairs": [
    [
      "base_hairs"
    ],
    58
  ],
  "paspalum-pubiflorum|ligule_length": [
    [
      "short"
    ],
    58
  ],
  "paspalum-pubiflorum|ligule_edge": [
    [
      "entire"
    ],
    58
  ],
  "paspalum-setaceum|blade_shape": [
    [
      "flat"
    ],
    58
  ],
  "paspalum-setaceum|blade_width": [
    [
      "narrow",
      "medium",
      "broad"
    ],
    58
  ],
  "paspalum-setaceum|blade_hairs": [
    [
      "base_hairs",
      "blade_hairy"
    ],
    58
  ],
  "paspalum-setaceum|ligule_length": [
    [
      "tiny"
    ],
    58
  ],
  "paspalum-setaceum|ligule_edge": [
    [
      "entire"
    ],
    58
  ],
  "paspalum-urvillei|ligule_length": [
    [
      "medium"
    ],
    58
  ],
  "paspalum-urvillei|ligule_edge": [
    [
      "lacerate"
    ],
    58
  ],
  "sporobolus-clandestinus|blade_shape": [
    [
      "flat",
      "inrolled"
    ],
    63
  ],
  "sporobolus-clandestinus|blade_width": [
    [
      "thread",
      "narrow"
    ],
    63
  ],
  "sporobolus-clandestinus|blade_hairs": [
    [
      "base_hairs"
    ],
    63
  ],
  "sporobolus-clandestinus|ligule_length": [
    [
      "tiny"
    ],
    63
  ],
  "sporobolus-clandestinus|ligule_edge": [
    [
      "ciliate"
    ],
    63
  ],
  "sporobolus-compositus|blade_shape": [
    [
      "flat",
      "inrolled"
    ],
    64
  ],
  "sporobolus-compositus|blade_width": [
    [
      "thread",
      "narrow"
    ],
    64
  ],
  "sporobolus-compositus|blade_hairs": [
    [
      "base_hairs"
    ],
    64
  ],
  "sporobolus-compositus|ligule_length": [
    [
      "tiny"
    ],
    64
  ],
  "sporobolus-compositus|ligule_edge": [
    [
      "ciliate"
    ],
    64
  ],
  "sporobolus-vaginiflorus|blade_shape": [
    [
      "flat",
      "inrolled"
    ],
    64
  ],
  "sporobolus-vaginiflorus|blade_hairs": [
    [
      "blade_hairy"
    ],
    64
  ],
  "sporobolus-vaginiflorus|ligule_length": [
    [
      "tiny"
    ],
    64
  ],
  "sporobolus-vaginiflorus|ligule_edge": [
    [
      "hair_fringe"
    ],
    64
  ],
  "tridens-flavus|leaf_base": [
    [
      "compressed_sheath"
    ],
    66
  ],
  "tripsacum-dactyloides|ligule_length": [
    [
      "tiny"
    ],
    67
  ],
  "tripsacum-dactyloides|ligule_edge": [
    [
      "erose",
      "ciliate"
    ],
    67
  ]
};
assert.equal(Object.keys(expected).length,51,'Unexpected research handoff count');
const ids=new Set(); const lookup=new Map();
for(const e of pack.evidence){
 const k=e.id+'|'+e.character;
 assert(!ids.has(k),'Duplicate species × field evidence: '+k);
 ids.add(k);lookup.set(k,e);
}
const allowed=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const [k,[states,page]] of Object.entries(expected)){
 const e=lookup.get(k);
 assert(e,'Missing original page-verified Lane D source record '+k);
 assert.deepEqual([...e.states].sort(),[...states].sort(),'Changed verified states for '+k);
 assert.equal(e.pdf_printed_page,page,'Lost printed-page citation '+k);
 assert(e.source.includes('Hagenbuch & Lemke')&&e.source.includes('printed p'),'Source not named '+k);
 assert(e.source_url.endsWith('#page='+page),'PDF page deep link mismatch '+k);
 assert.equal(e.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 assert(e.note.length>=12,'Missing organ and condition note '+k);
 assert(e.states.every(s=>allowed.get(e.character)?.has(s)),'Unavailable UI state '+k);
 if(e.character==='blade_width'){
  const [lo,hi]=e.width_mm||[];
  assert(Number.isFinite(lo)&&Number.isFinite(hi)&&lo<=hi,'Measured width absent '+k);
 }
}
assert(!pack.evidence.some(e=>e.id==='lolium-x-boucheanum'),'Hybrid hard hold lost');
console.log('PASS: 51 Lane D page-backed optional evidence records; no duplicate, UI or taxon-hold regressions');
