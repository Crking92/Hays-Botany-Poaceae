'use strict';
const a=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
 'anatherum-virginicum|blade_width':[['narrow'],34,'A'],
 'eragrostis-lugens|ligule_length':[['tiny','short'],48,'A'],
 'eragrostis-secundiflora|ligule_edge':[['hair_fringe'],49,'A'],
 'tridentopsis-elongata|lemma_texture':[['hairy'],2,'A'],
 'tridentopsis-elongata|floral_hair_position':[['lemma'],2,'A'],
 'tridentopsis-mutica|glume_marks':[['one_vein'],2,'A'],
 'tridentopsis-mutica|lemma_texture':[['hairy'],2,'A'],
 'tridentopsis-mutica|floral_hair_position':[['lemma'],2,'A'],
 'panicum-virgatum|ligule_length':[['short'],57,'C'],
 'setaria-italica|blade_width':[['broad'],1319,'C'],
 'setaria-parviflora|ligule_length':[['short'],61,'C'],
 'sporobolus-vaginiflorus|blade_width':[['thread'],64,'D'],
 'melica-nitens|underground_stems':[['rhizome_present'],1284,'D']
};
a.equal(Object.keys(expected).length,13);
const options=new Map(pack.characters.map(c=>[c.id,new Map(c.options.map(o=>[o.id,o]))]));
const found=new Map();
for(const row of pack.evidence){const k=row.id+'|'+row.character;a(!found.has(k),'Duplicate key '+k);found.set(k,row);}
for(const [key,[states,page,lane]] of Object.entries(expected)){
 const row=found.get(key);a(row,'Missing final source '+key);
 a.deepEqual(row.states,states,'State mismatch '+key);
 a.equal(row.pdf_printed_page,page,'Printed source page changed '+key);
 a(row.source.includes('printed p. '+page),'Cited page missing '+key);
 a.equal(row.review_lane,lane);a.equal(row.coordination_issue,344);
 a.equal(row.source_status,'READY_PRIMARY');
 a.equal(row.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
 a(row.source_url?.startsWith('https://')&&row.note?.length>60,'Citation/caveat missing '+key);
 for(const v of row.states)a(options.get(row.character)?.get(v)&&!options.get(row.character)?.get(v)?.evidence_pending,'Invalid/pending option '+key+' '+v);
}
a(found.get('eragrostis-lugens|ligule_length').note.includes('FRINGE OF HAIRS'),'Hair ligule confused with membrane');
a(found.get('panicum-virgatum|ligule_length').note.includes('FRINGE'),'Switchgrass ligule organ lost');
a(found.get('tridentopsis-mutica|glume_marks').note.includes('UPPER glume'),'Specific glume site lost');
for(const name of ['tridentopsis-elongata','tridentopsis-mutica']){
 a(found.get(name+'|lemma_texture').note.includes('LEMMA'),'Floral organ confusion '+name);
 a(found.get(name+'|floral_hair_position').note.includes('LEMMA'),'Floral hair attachment confusion '+name);
}
const mel=found.get('melica-nitens|underground_stems');
a(mel.note.includes('SOURCES DISAGREE')&&mel.note.includes('1999, printed p. 1284')&&mel.note.includes('2015, printed p. 54'),'Owner-approved source conflict not visible');
a(mel.conflicting_source_url?.includes('page=54'),'Opposing source lost');
a.deepEqual(mel.states,['rhizome_present'],'Unsupported rhizome type invented');
a(!found.has('echinochloa-crus-galli|true_lemma_awn'),'Sterile lemma awn wrongly admitted as fertile');
a(!found.has('triticum-aestivum|leaf_base'),'Unverified upright auricle orientation admitted');
a(!found.has('stapfochloa-canterae|true_lemma_awn'),'Undecided awn length forced into bin');
a(![...found.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid source hold released');
a.equal(pack.mode,'NON_EXCLUDING_POSITIVE_RANKING');
a(pack.evidence.length>=1806,'Earlier evidence lost');
console.log('PASS: 13 exact final-shard primary records, taxa, anatomy, provenance and holds');
