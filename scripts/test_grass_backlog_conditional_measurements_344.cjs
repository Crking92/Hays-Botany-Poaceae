'use strict';
// Validated source-backed supplementary sizes in the current 24-category field key.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "bothriochloa-bladhii|ligule_length": {
    "mm": [
      0.5,
      1
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "alopecurus-carolinianus|blade_width": {
    "mm": [
      0.9,
      3
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Alopecurus+carolinianus",
    "lane": "D"
  },
  "dichanthium-sericeum|blade_width": {
    "mm": [
      2,
      4
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398571-1/general-information",
    "lane": "D"
  },
  "oplismenus-hirtellus|ligule_length": {
    "mm": [
      0.4,
      1.5
    ],
    "url": "https://naturalhistory2.si.edu/botany/hawaiianflora/speciesdescr.cfm?genus=Oplismenus&species=hirtellus",
    "lane": "D"
  },
  "paspalum-notatum|blade_width": {
    "mm": [
      2,
      10
    ],
    "url": "https://sernecportal.org/portal/taxa/index.php?taxon=Paspalum+notatum",
    "lane": "D"
  },
  "cortaderia-selloana|blade_width": {
    "mm": [
      3,
      20
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A66317-2/general-information",
    "lane": "A"
  },
  "cortaderia-selloana|ligule_length": {
    "mm": [
      3,
      5
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A66317-2/general-information",
    "lane": "A"
  },
  "briza-minor|blade_width": {
    "mm": [
      1,
      10
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?taxon=236510",
    "lane": "B"
  },
  "lolium-multiflorum|blade_width": {
    "mm": [
      4,
      10
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:407486-1/general-information",
    "lane": "B"
  },
  "lolium-multiflorum|ligule_length": {
    "mm": [
      1,
      2
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:407486-1/general-information",
    "lane": "B"
  },
  "muhlenbergia-capillaris|blade_width": {
    "mm": [
      1,
      4
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:408959-1/general-information",
    "lane": "B"
  },
  "muhlenbergia-capillaris|ligule_length": {
    "mm": [
      1.8,
      10
    ],
    "url": "https://sernecportal.org/portal/taxa/index.php?taxon=Muhlenbergia+capillaris",
    "lane": "B"
  },
  "secale-cereale|blade_width": {
    "mm": [
      3,
      12
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=92&taxauthid=1&tid=237747",
    "lane": "B"
  },
  "stapfochloa-canterae|blade_width": {
    "mm": [
      1,
      5
    ],
    "url": "https://www.scielo.org.mx/pdf/abm/n112/n112a8.pdf",
    "lane": "B"
  },
  "paspalum-notatum|ligule_length": {
    "mm": [
      0.2,
      0.6
    ],
    "url": "https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=sp&name=Paspalum~notatum&page=nswfl",
    "lane": "D"
  },
  "rostraria-cristata|ligule_length": {
    "mm": [
      0.5,
      1.5
    ],
    "url": "https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=sp&name=Rostraria~cristata&page=nswfl",
    "lane": "D"
  },
  "miscanthus-sinensis|blade_width": {
    "mm": [
      5,
      20
    ],
    "url": "https://plantdatabase.kpu.ca/PlantPrint/misi",
    "lane": "A"
  },
  "bouteloua-gracilis|blade_width": {
    "mm": [
      0.5,
      2.5
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "bouteloua-gracilis|ligule_length": {
    "mm": [
      0.1,
      0.4
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "echinochloa-walteri|blade_width": {
    "mm": [
      19,
      25
    ],
    "url": "https://ask.ifas.ufl.edu/publication/SC095",
    "lane": "C"
  },
  "panicum-miliaceum|blade_width": {
    "mm": [
      7,
      25
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Panicum+miliaceum",
    "lane": "C"
  },
  "sclerochloa-dura|blade_width": {
    "mm": [
      1,
      4
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Sclerochloa+dura",
    "lane": "C"
  },
  "setaria-italica|ligule_length": {
    "mm": [
      1,
      2
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Setaria+italica",
    "lane": "C"
  },
  "sorghastrum-elliottii|blade_width": {
    "mm": [
      2.5,
      5.5
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:240815-2/general-information",
    "lane": "C"
  }
};
assert.equal(Object.keys(expected).length,24);
const rows=new Map(),options=new Map(p.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const r of p.evidence){const k=r.id+'|'+r.character;assert(!rows.has(k),'Duplicate '+k);rows.set(k,r)}
const width=([lo,hi])=>[...(lo<2?['thread']:[]),...(lo<5&&hi>2?['narrow']:[]),...(lo<10&&hi>5?['medium']:[]),...(hi>10?['broad']:[])];
const ligule=([lo,hi])=>[...(lo<1?['tiny']:[]),...(lo<3&&hi>1?['short']:[]),...(lo<8&&hi>3?['medium']:[]),...(hi>8?['long']:[])];
for(const [key,want] of Object.entries(expected)){
 const e=rows.get(key);assert(e,'Missing measured source '+key);
 const dimension=e.character==='blade_width'?'width_mm':'length_mm';
 assert.deepEqual(e[dimension],want.mm,'Source range drift '+key);
 assert.deepEqual([...e.states].sort(),(dimension==='width_mm'?width(want.mm):ligule(want.mm)).sort(),'Wrong numeric bin '+key);
 assert.equal(e.source_url,want.url,'Cited page changed '+key);
 assert.equal(e.review_lane,want.lane,'Source lane changed '+key);
 assert.equal(e.coordination_issue,344);
 assert.equal(e.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
 assert.equal(e.source_priority_status,'supplemental_not_overriding_primary');
 assert(e.original_source_citation?.includes(want.url)&&e.note?.trim(),'Lost source/note '+key);
 assert(e.states.every(v=>options.get(e.character)?.has(v)),'Unrecognized UI state '+key);
}
// Lane D12 supplies a documented 1–2 mm range. Only the 1–<2 mm
// subset qualifies for 'thread'; exactly 2 mm is NOT reclassified 'narrow'.
const sporo=rows.get('sporobolus-vaginiflorus|blade_width');
assert(sporo,'D12 source-qualified positive thread observation missing');
assert.deepEqual(sporo.states,['thread'],'2 mm strict boundary falsely assigned another width bin');
assert.deepEqual(sporo.width_mm,[1,2],'Original 1–2 mm width source bounds changed');
assert(sporo.note.includes('Exactly 2 mm'),'Missing strict 2 mm caveat');
// D12 exact-species AusGrass and Kew measurements now resolve this as a
// 0.5–1.5 mm MEMBRANE, legitimately spanning tiny and short bins.
const dser=rows.get('dichanthium-sericeum|ligule_length');
assert(dser&&dser.states.join(',')==='tiny,short','D12 exact true-ligule states lost');
assert.deepEqual(dser.length_mm,[0.5,1.5],'Exact source range drift');
assert(/MEMBRANOUS/.test(dser.note)&&/collar hairs/.test(dser.note),'Ligule anatomy qualification lost');
assert(![...rows.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid hold released');
console.log('PASS: 24 supplemental measured traits, threshold QA and excluded uncertain boundary cases');
