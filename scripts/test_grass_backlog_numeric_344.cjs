'use strict';
// Additive verified Hays Grass Lab #344 numeric measurements; no changes to option thresholds.
const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "aristida-oligantha|blade_width": {
    "mm": [
      1,
      2
    ],
    "page": 35,
    "states": [
      "thread"
    ]
  },
  "aristida-oligantha|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 35,
    "states": [
      "tiny"
    ]
  },
  "aristida-purpurea|blade_width": {
    "mm": [
      1,
      2
    ],
    "page": 35,
    "states": [
      "thread"
    ]
  },
  "aristida-purpurea|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 35,
    "states": [
      "tiny"
    ]
  },
  "elymus-canadensis|blade_width": {
    "mm": [
      4,
      12
    ],
    "page": 47,
    "states": [
      "narrow",
      "medium",
      "broad"
    ]
  },
  "elymus-canadensis|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 47,
    "states": [
      "tiny"
    ]
  },
  "chloris-andropogonoides|ligule_length": {
    "mm": [
      null,
      1
    ],
    "page": 41,
    "states": [
      "tiny"
    ]
  },
  "chloris-verticillata|ligule_length": {
    "mm": [
      1,
      2
    ],
    "page": 42,
    "states": [
      "short"
    ]
  },
  "chloris-virgata|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 42,
    "states": [
      "tiny"
    ]
  },
  "cynodon-dactylon|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 42,
    "states": [
      "tiny"
    ]
  },
  "elymus-virginicus|blade_width": {
    "mm": [
      5,
      15
    ],
    "page": 47,
    "states": [
      "medium",
      "broad"
    ]
  },
  "elymus-virginicus|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 47,
    "states": [
      "tiny"
    ]
  },
  "eriochloa-sericea|ligule_length": {
    "mm": [
      null,
      1
    ],
    "page": 50,
    "states": [
      "tiny"
    ]
  },
  "erioneuron-pilosum|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 51,
    "states": [
      "tiny"
    ]
  },
  "andropogon-gerardi|blade_width": {
    "mm": [
      2,
      10
    ],
    "page": 34,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "andropogon-gerardi|ligule_length": {
    "mm": [
      1,
      2.5
    ],
    "page": 34,
    "states": [
      "short"
    ]
  },
  "eleusine-indica|blade_width": {
    "mm": [
      3,
      8
    ],
    "page": 46,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "eleusine-indica|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 46,
    "states": [
      "tiny"
    ]
  },
  "schizachyrium-scoparium|ligule_length": {
    "mm": [
      1,
      3
    ],
    "page": 60,
    "states": [
      "short"
    ]
  },
  "panicum-hallii|blade_width": {
    "mm": [
      2,
      10
    ],
    "page": 57,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "panicum-hallii|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 57,
    "states": [
      "tiny"
    ]
  },
  "panicum-virgatum|blade_width": {
    "mm": [
      3,
      15
    ],
    "page": 57,
    "states": [
      "narrow",
      "medium",
      "broad"
    ]
  },
  "setaria-parviflora|blade_width": {
    "mm": [
      2,
      8
    ],
    "page": 61,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "setaria-reverchonii|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 61,
    "states": [
      "tiny"
    ]
  },
  "setaria-scheelei|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 62,
    "states": [
      "tiny"
    ]
  },
  "sorghastrum-elliottii|ligule_length": {
    "mm": [
      1,
      4
    ],
    "page": 1322,
    "states": [
      "short",
      "medium"
    ]
  },
  "arundo-donax|blade_width": {
    "mm": [
      40,
      70
    ],
    "page": 35,
    "states": [
      "broad"
    ]
  },
  "arundo-donax|ligule_length": {
    "mm": [
      null,
      1
    ],
    "page": 35,
    "states": [
      "tiny"
    ]
  },
  "bothriochloa-barbinodis|blade_width": {
    "mm": [
      2,
      7
    ],
    "page": 36,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "bothriochloa-barbinodis|ligule_length": {
    "mm": [
      1,
      2
    ],
    "page": 36,
    "states": [
      "short"
    ]
  },
  "bothriochloa-ischaemum|ligule_length": {
    "mm": [
      null,
      1
    ],
    "page": 37,
    "states": [
      "tiny"
    ]
  },
  "cenchrus-spinifex|blade_width": {
    "mm": [
      2,
      6
    ],
    "page": 41,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "cenchrus-spinifex|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 41,
    "states": [
      "tiny"
    ]
  },
  "chasmanthium-latifolium|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 41,
    "states": [
      "tiny"
    ]
  },
  "sorghastrum-nutans|blade_width": {
    "mm": [
      5,
      10
    ],
    "page": 62,
    "states": [
      "medium"
    ]
  },
  "eragrostis-cilianensis|blade_width": {
    "mm": [
      2.5,
      7
    ],
    "page": 47,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "eragrostis-intermedia|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 48,
    "states": [
      "tiny"
    ]
  },
  "eragrostis-secundiflora|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 49,
    "states": [
      "tiny"
    ]
  },
  "eragrostis-spectabilis|blade_width": {
    "mm": [
      3,
      7
    ],
    "page": 49,
    "states": [
      "narrow",
      "medium"
    ]
  },
  "eragrostis-spectabilis|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 49,
    "states": [
      "tiny"
    ]
  },
  "eragrostis-trichodes|ligule_length": {
    "mm": [
      null,
      0.5
    ],
    "page": 49,
    "states": [
      "tiny"
    ]
  },
  "hilaria-belangeri|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "page": 51,
    "states": [
      "tiny"
    ]
  },
  "hilaria-mutica|ligule_length": {
    "mm": [
      1,
      2
    ],
    "page": 51,
    "states": [
      "short"
    ]
  },
  "sorghum-halepense|ligule_length": {
    "mm": [
      1.5,
      4
    ],
    "page": 63,
    "states": [
      "short",
      "medium"
    ]
  }
};
assert.equal(Object.keys(expected).length,44);
const index=new Map();for(const e of pack.evidence){const k=e.id+'|'+e.character;assert(!index.has(k),'Duplicate '+k);index.set(k,e)}
const width=([lo,hi])=>[...(lo<2?['thread']:[]),...(lo<5&&hi>2?['narrow']:[]),...(lo<10&&hi>5?['medium']:[]),...(hi>10?['broad']:[])];
const ligule=([lo,hi])=>lo===null?['tiny']:[...(lo<1?['tiny']:[]),...(lo<3&&hi>1?['short']:[]),...(lo<8&&hi>3?['medium']:[]),...(hi>8?['long']:[])];
for(const [key,item] of Object.entries(expected)){
 const row=index.get(key);assert(row,'Lost measured trait '+key);
 const dimension=row.character==='blade_width'?'width_mm':'length_mm';
 assert.deepEqual(row[dimension],item.mm,'Measurement changed '+key);
 assert.deepEqual([...row.states].sort(),[...item.states].sort(),'State changed '+key);
 assert.deepEqual([...row.states].sort(),(dimension==='width_mm'?width(item.mm):ligule(item.mm)).sort(),'Numeric threshold mismatch '+key);
 assert.equal(row.pdf_printed_page,item.page,'Printed page lost '+key);
 assert(row.source?.includes('printed p. '+item.page)&&row.note?.trim(),'Citation or note lost '+key);
 assert.equal(row.coordination_issue,344);
}
assert(!index.has('sporobolus-vaginiflorus|blade_width'),'Unresolved exactly 2-mm threshold was force-inserted');
assert(![...index.keys()].some(x=>x.startsWith('lolium-x-boucheanum|')),'Held hybrid admitted');
console.log('PASS 44 regional-source width and ligule measurements, boundary and hold integrity');
