'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const rows=new Map(),options=new Map(p.characters.map(c=>[c.id,new Map(c.options.map(o=>[o.id,o]))]));
for(const r of p.evidence){const k=r.id+'|'+r.character;assert(!rows.has(k),'Duplicate '+k);rows.set(k,r);for(const st of r.states)assert(options.get(r.character)?.get(st),'Missing option '+k);}
const expected={
'miscanthus-sinensis|blade_midnerve':['pale_center'],
'miscanthus-sinensis|blade_venation':['pale_midvein','raised_midvein'],
'bothriochloa-longipaniculata|true_lemma_awn':['long'],
'bothriochloa-torreyana|spikelet_position':['paired'],
'cenchrus-setaceus|glume_marks':['lower_reduced','one_vein'],
'cenchrus-spinifex|glume_marks':['one_vein'],
'nassella-tenuissima|true_lemma_awn':['long'],
'zizania-texana|true_lemma_awn':['long','none'],
'dichanthium-sericeum|ligule_length':['tiny','short']
};
assert.equal(Object.keys(expected).length,9);
for(const [k,states] of Object.entries(expected)){
 const r=rows.get(k);assert(r,'Missing verified final supplemental '+k);
 assert.deepEqual(r.states,states,'State mismatch '+k);
 assert.equal(r.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
 assert.equal(r.source_priority_status,'supplemental_not_overriding_primary');
 assert.equal(r.coordination_issue,344);
 assert.equal(r.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 assert(r.original_source_citation?.includes(r.source_url)&&r.note?.length>80,'Citation/caveat lost '+k);
 assert(r.states.every(st=>!options.get(r.character).get(st).evidence_pending),'Pending state used '+k);
}
assert(rows.get('miscanthus-sinensis|blade_venation').note.includes('abaxial'),'Leaf surface differentiation lost');
assert(rows.get('bothriochloa-longipaniculata|true_lemma_awn').note.includes('BENT does not prove TWISTED'),'Twist unsupported');
assert(rows.get('cenchrus-spinifex|glume_marks').note.includes('LOWER glume'),'Glume organ lost');
assert(rows.get('zizania-texana|true_lemma_awn').note.includes('PISTILLATE')&&rows.get('zizania-texana|true_lemma_awn').note.includes('STAMINATE'),'Sex/awns conflated');
assert.deepEqual(rows.get('dichanthium-sericeum|ligule_length').length_mm,[0.5,1.5],'Ligule source bounds changed');
const changes={
'secale-cereale|sheath_margins':['overlapping','open'],
'digitaria-cognata|blade_hairs':['base_hairs','blade_hairy'],
'melinis-repens|blade_shape':['flat','folded'],
'setaria-parviflora|lemma_texture':['wrinkled']
};
for(const [k,states] of Object.entries(changes)){const r=rows.get(k);assert(r,'Existing amendment lost '+k);assert.deepEqual(r.states,states,'In-place states changed '+k);assert(r.note?.length>80,'Source anatomy nuance lost '+k);}
assert(rows.get('secale-cereale|sheath_margins').note.includes('SLIT'),'Open vs overlapping sheath conflated');
assert(rows.get('digitaria-cognata|blade_hairs').note.includes('abaxial'),'Lower face hairs lost');
assert(rows.get('melinis-repens|blade_shape').note.includes('subsp. repens'),'Subspecies caveat lost');
assert.equal(rows.get('setaria-parviflora|lemma_texture').pdf_printed_page,1319,'Diggs species-page correction reversed');
assert(!rows.has('echinochloa-crus-galli|true_lemma_awn'),'Sterile floret awn forced into fertile menu');
assert(!rows.has('triticum-aestivum|leaf_base'),'Unproved upright wheat auricle orientation released');
assert(!rows.has('stapfochloa-canterae|true_lemma_awn'),'Unproved sterile/fertile awn length mapped');
assert(![...rows.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid admitted');
assert.equal(p.mode,'NON_EXCLUDING_POSITIVE_RANKING');
assert(p.evidence.length>=1815);
console.log('PASS: nine A/D supplemental records, four source-specific in-place corrections and protected holds');
