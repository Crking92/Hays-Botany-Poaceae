'use strict';
// Supplemental botanical sources: qualified, positive-only evidence with exact citation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "bothriochloa-bladhii|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "bothriochloa-bladhii|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "cenchrus-setaceus|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=631323",
    "lane": "A"
  },
  "dichanthium-sericeum|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398571-1/general-information",
    "lane": "D"
  },
  "melinis-repens|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=239884",
    "lane": "D"
  },
  "oplismenus-hirtellus|blade_shape": {
    "states": [
      "flat"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1004002-1/general-information",
    "lane": "D"
  },
  "oplismenus-hirtellus|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://naturalhistory2.si.edu/botany/hawaiianflora/speciesdescr.cfm?genus=Oplismenus&species=hirtellus",
    "lane": "D"
  },
  "paspalum-langei|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?clid=8707&taxauthid=1&tid=20916",
    "lane": "D"
  },
  "paspalum-notatum|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "url": "https://sernecportal.org/portal/taxa/index.php?taxon=Paspalum+notatum",
    "lane": "D"
  },
  "cortaderia-selloana|blade_edge": {
    "states": [
      "serrate"
    ],
    "url": "https://keyserver.lucidcentral.org/weeds/data/media/Html/cortaderia_selloana.htm",
    "lane": "A"
  },
  "cortaderia-selloana|blade_venation": {
    "states": [
      "prominent_midvein"
    ],
    "url": "https://nzflora.info/factsheet/taxon/Cortaderia-selloana.html",
    "lane": "A"
  },
  "cortaderia-selloana|blade_hairs": {
    "states": [
      "base_hairs",
      "blade_hairy"
    ],
    "url": "https://nzflora.info/factsheet/taxon/Cortaderia-selloana.html",
    "lane": "A"
  },
  "briza-minor|blade_shape": {
    "states": [
      "flat"
    ],
    "url": "https://www.burkeherbarium.org/imagecollection/taxon.php?Taxon=Briza+minor",
    "lane": "B"
  },
  "muhlenbergia-capillaris|blade_shape": {
    "states": [
      "flat",
      "inrolled"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:408959-1/general-information",
    "lane": "B"
  },
  "secale-cereale|blade_shape": {
    "states": [
      "flat",
      "inrolled"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Secale%20cereale",
    "lane": "B"
  },
  "secale-cereale|blade_hairs": {
    "states": [
      "base_hairs",
      "blade_hairy"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Secale%20cereale",
    "lane": "B"
  },
  "briza-minor|sheath_margins": {
    "states": [
      "open"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?taxon=236510",
    "lane": "B"
  },
  "briza-minor|sheath_surface": {
    "states": [
      "hyaline_margins"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?taxon=236510",
    "lane": "B"
  },
  "eragrostis-minor|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Eragrostis+minor",
    "lane": "A"
  },
  "paspalum-notatum|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://sernecportal.org/portal/taxa/index.php?taxon=Paspalum+notatum",
    "lane": "D"
  },
  "rostraria-cristata|ligule_edge": {
    "states": [
      "erose"
    ],
    "url": "https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=sp&name=Rostraria~cristata&page=nswfl",
    "lane": "D"
  },
  "tridens-congestus|blade_shape": {
    "states": [
      "inrolled"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Tridens%20congestus",
    "lane": "D"
  },
  "tridens-congestus|blade_venation": {
    "states": [
      "rough_vein_lines"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Tridens%20congestus",
    "lane": "D"
  },
  "briza-minor|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:393299-1/general-information",
    "lane": "B"
  },
  "lolium-multiflorum|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:407486-1/general-information",
    "lane": "B"
  },
  "muhlenbergia-capillaris|sheath_surface": {
    "states": [
      "rough_surface"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:408959-1/general-information",
    "lane": "B"
  },
  "muhlenbergia-capillaris|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:408959-1/general-information",
    "lane": "B"
  },
  "megathyrsus-maximus|blade_shape": {
    "states": [
      "flat"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A60426565-2/general-information",
    "lane": "A"
  },
  "megathyrsus-maximus|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A60426565-2/general-information",
    "lane": "A"
  },
  "dichanthium-aristatum|surface_runners": {
    "states": [
      "stolon"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398529-1/general-information",
    "lane": "D"
  },
  "dichanthium-sericeum|culm_posture": {
    "states": [
      "erect",
      "decumbent"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398571-1/general-information",
    "lane": "D"
  },
  "dichanthium-sericeum|underground_stems": {
    "states": [
      "short_rhizome"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398571-1/general-information",
    "lane": "D"
  },
  "dinebra-panicea-subsp-mucronata|stem_special": {
    "states": [
      "culm_branches"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Leptochloa%20panicea%20mucronata",
    "lane": "D"
  },
  "melinis-repens|stem_special": {
    "states": [
      "rooting_lower_nodes",
      "culm_branches"
    ],
    "url": "https://plant-directory.ifas.ufl.edu/plant-directory/melinis-repens/",
    "lane": "D"
  },
  "oplismenus-hirtellus|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "url": "https://www.nzflora.info/factsheet/Taxon/Oplismenus-hirtellus.html",
    "lane": "D"
  },
  "oplismenus-hirtellus|culm_posture": {
    "states": [
      "decumbent"
    ],
    "url": "https://naturalhistory2.si.edu/botany/hawaiianflora/speciesdescr.cfm?genus=Oplismenus&species=hirtellus",
    "lane": "D"
  },
  "oplismenus-hirtellus|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "url": "https://www.nzflora.info/factsheet/Taxon/Oplismenus-hirtellus.html",
    "lane": "D"
  },
  "oplismenus-hirtellus|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "url": "https://naturalhistory2.si.edu/botany/hawaiianflora/speciesdescr.cfm?genus=Oplismenus&species=hirtellus",
    "lane": "D"
  },
  "secale-cereale|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Secale%20cereale",
    "lane": "B"
  },
  "urochloa-reptans|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Urochloa%20reptans",
    "lane": "B"
  },
  "paspalum-floridanum|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?clid=8707&taxauthid=1&tid=20897",
    "lane": "D"
  },
  "bothriochloa-bladhii|sheath_surface": {
    "states": [
      "weak_keel"
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "bothriochloa-bladhii|stem_special": {
    "states": [
      "culm_branches"
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "bothriochloa-bladhii|stem_nodes": {
    "states": [
      "hairy_nodes"
    ],
    "url": "https://www.nzflora.info/factsheet/taxon/Bothriochloa-bladhii.html",
    "lane": "A"
  },
  "tridens-congestus|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Tridens%20congestus",
    "lane": "D"
  },
  "tridens-congestus|culm_posture": {
    "states": [
      "geniculate"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Tridens%20congestus",
    "lane": "D"
  },
  "cortaderia-selloana|sheath_margins": {
    "states": [
      "open",
      "overlapping"
    ],
    "url": "https://www.smmflowers.org/mobile/ANF-descriptions/Cortaderia_selloana_UCLA_SantaMonicas.pdf",
    "lane": "A"
  },
  "cortaderia-selloana|sheath_surface": {
    "states": [
      "sometimes_hairy"
    ],
    "url": "https://www.smmflowers.org/mobile/ANF-descriptions/Cortaderia_selloana_UCLA_SantaMonicas.pdf",
    "lane": "A"
  },
  "cortaderia-selloana|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://www.smmflowers.org/mobile/ANF-descriptions/Cortaderia_selloana_UCLA_SantaMonicas.pdf",
    "lane": "A"
  },
  "cortaderia-selloana|underground_stems": {
    "states": [
      "thick_rhizome",
      "scaly_rhizome"
    ],
    "url": "https://www.smmflowers.org/mobile/ANF-descriptions/Cortaderia_selloana_UCLA_SantaMonicas.pdf",
    "lane": "A"
  },
  "miscanthus-sinensis|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A408768-1/general-information",
    "lane": "A"
  },
  "miscanthus-sinensis|underground_stems": {
    "states": [
      "short_rhizome"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A408768-1/general-information",
    "lane": "A"
  },
  "nassella-tenuissima|sheath_surface": {
    "states": [
      "rough_surface"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630068",
    "lane": "A"
  },
  "phyllostachys-aurea|culm_posture": {
    "states": [
      "erect"
    ],
    "url": "https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200025882",
    "lane": "A"
  },
  "phyllostachys-aurea|basal_crown": {
    "states": [
      "stout_base",
      "large_cane"
    ],
    "url": "https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200025882",
    "lane": "A"
  },
  "zizania-texana|stem_special": {
    "states": [
      "rooting_lower_nodes"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A271183-2/general-information",
    "lane": "A"
  },
  "bouteloua-gracilis|blade_shape": {
    "states": [
      "flat",
      "inrolled"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "bouteloua-gracilis|blade_hairs": {
    "states": [
      "base_hairs"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "bouteloua-gracilis|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "echinochloa-walteri|blade_shape": {
    "states": [
      "flat"
    ],
    "url": "https://ask.ifas.ufl.edu/publication/SC095",
    "lane": "C"
  },
  "elymus-macgregorii|blade_hairs": {
    "states": [
      "blade_hairy"
    ],
    "url": "https://gobotany.nativeplanttrust.org/species/elymus/macgregorii/",
    "lane": "C"
  },
  "panicum-repens|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "url": "https://plant-directory.ifas.ufl.edu/plant-directory/panicum-repens/",
    "lane": "C"
  },
  "sclerochloa-dura|blade_tip": {
    "states": [
      "boat_tipped"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Sclerochloa+dura",
    "lane": "C"
  },
  "setaria-italica|blade_shape": {
    "states": [
      "flat"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Setaria+italica",
    "lane": "C"
  },
  "setaria-italica|ligule_edge": {
    "states": [
      "hair_fringe"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1207294-2/general-information",
    "lane": "C"
  },
  "sorghastrum-elliottii|blade_shape": {
    "states": [
      "flat",
      "folded"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:240815-2/general-information",
    "lane": "C"
  },
  "sorghastrum-elliottii|ligule_edge": {
    "states": [
      "ciliate"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:240815-2/general-information",
    "lane": "C"
  },
  "alopecurus-carolinianus|sheath_margins": {
    "states": [
      "overlapping"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Alopecurus%20carolinianus",
    "lane": "D"
  },
  "alopecurus-carolinianus|culm_posture": {
    "states": [
      "erect",
      "decumbent"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Alopecurus%20carolinianus",
    "lane": "D"
  }
};
assert.equal(Object.keys(expected).length,69);
const index=new Map(),opts=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const e of pack.evidence){const k=e.id+'|'+e.character;assert(!index.has(k),'Duplicate '+k);index.set(k,e)}
for(const [key,want] of Object.entries(expected)){
 const e=index.get(key);assert(e,'Missing conditional source record '+key);
 assert.deepEqual([...e.states].sort(),[...want.states].sort(),'Changed positive states '+key);
 assert.equal(e.review_lane,want.lane);assert.equal(e.coordination_issue,344);
 assert.equal(e.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
 assert.equal(e.source_url,want.url,'Lost exact online source link '+key);
 assert(e.original_source_citation?.includes(want.url),'Original cited reference lost '+key);
 assert(e.note?.trim()&&e.source.includes('supplemental treatment'),'Conditional note missing '+key);
 assert(e.states.every(s=>opts.get(e.character)?.has(s)),'Unsupported UI option '+key);
 assert.equal(e.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
}
for(const key of ['miscanthus-sinensis|blade_midnerve','miscanthus-sinensis|blade_venation','eragrostis-secundiflora|ligule_edge'])
 assert(!index.has(key),'Unresolved source page/disagreement was admitted '+key);
assert(![...index.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')));
console.log('PASS: 69 nonregional source-verified conditional vegetative records, exact links and holds');
