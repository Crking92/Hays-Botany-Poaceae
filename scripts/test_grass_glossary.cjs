'use strict';
/* Regression for the Hays Botany glossary bridge: no character scoring edits. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const base=path.join(root,'site/visual-key-lab');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const helper=read('grass-glossary-bridge.js');
const html=read('index.html');
const ext=JSON.parse(read('grass-glossary-terms.json'));
const mirrored=JSON.parse(read('shared-glossary-snapshot.json'));
const morph=JSON.parse(read('optional-refinement-evidence.json'));
assert.doesNotThrow(()=>new vm.Script(helper));
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(inline.length,1,'one self-contained inline grass key script');
assert.doesNotThrow(()=>new vm.Script(inline[0][1]));
assert.match(html,/grass-glossary-bridge\.js/);
assert.match(html,/grass-glossary\.css/);
assert.match(html,/HaysGrassGlossarySketches/);
assert.match(html,/state\.species\.length!==112/);
assert.equal(mirrored.source_repo,'Crking92/Hays-County-Botany');
assert.equal(mirrored.source_path,'data/learning-layer.json');
assert.match(mirrored.source_sha,/^[a-f0-9]{40}$/);
assert.equal(Object.keys(mirrored.terms).length,147);
assert.equal(Object.keys(ext.terms).length,26);
assert.equal(new Set([...Object.keys(mirrored.terms),...Object.keys(ext.terms)]).size,173);
for(const [name,item] of Object.entries({...mirrored.terms,...ext.terms})){
 assert.ok(item.term&&item.plain,name+': missing definition');
 assert.ok(item.pronunciation,name+': missing pronunciation');
}
const maps=helper.match(/const termsByFeature=(\{.*?\});/);
const labelMap=helper.match(/const featureByLabel=(\{.*?\});/);
assert.ok(maps&&labelMap,'per-character link maps exist');
const featureTerms=JSON.parse(maps[1]),featureLabels=JSON.parse(labelMap[1]);
assert.equal(Object.keys(featureTerms).length,28);
const ids=morph.characters.map(c=>c.id);
assert.equal(ids.length,24,'advanced morphology group count unexpectedly changed');
for(const c of morph.characters){
 assert.ok(featureTerms[c.id]?.length,c.id+': no glossary links');
 assert.equal(featureLabels[c.label],c.id,'feature label not linked: '+c.id);
 for(const key of featureTerms[c.id])assert.ok(mirrored.terms[key]||ext.terms[key],c.id+' missing glossary term '+key);
}
for(const id of ['head','habit','ligule','awns'])assert.ok(featureTerms[id].length>2,id+': no question vocabulary');
const sketches=html.slice(html.indexOf('window.HaysGrassGlossarySketches={'));
const bespoke=helper.slice(helper.indexOf('function additionalSketch'));
const creditOK=v=>/\bCC\s*(?:0|BY(?:-SA)?)\b|public[\s-]*domain|PD[\s-]*mark/i.test(v)&&!/\b(?:NC|ND|GFDL|all rights reserved)\b/i.test(v);
let photographed=0,uniquePhotos=new Set();
for(const [name,item] of Object.entries(ext.terms)){
 assert.ok(item.pronunciation&&item.where&&item.why,name+': missing field-friendly explanation');
 const sketch=sketches.includes('"'+name+'":')||bespoke.includes('"'+name+'"');
 assert.ok(item.photo||sketch,name+': missing all visual support');
 if(!item.photo)continue;
 photographed++;
 const p=item.photo;
 assert.ok(p.src&&p.src.startsWith('https://crking92.github.io/Hays-Botany-Poaceae/'));
 assert.ok(p.label&&p.creator&&p.license&&p.source_page&&p.note);
 assert.ok(creditOK(p.license),name+': rights unclear');
 assert.ok(/^https:\/\//.test(p.source_page),name+': source missing');
 const local=p.src.replace('https://crking92.github.io/Hays-Botany-Poaceae/','');
 assert.ok(fs.existsSync(path.join(root,local)),name+': referenced original image file missing: '+local);
 uniquePhotos.add(local);
}
assert.equal(photographed,18);
assert.equal(uniquePhotos.size,8);
assert.match(helper,/shared-glossary-snapshot\.json/,'local fallback must load');
assert.match(helper,/read\(SHARED\)\.then/,'canonical glossary should refresh when accessible');
assert.match(helper,/key==="ligule"/,'the unsupported legacy GFDL ligule image must be replaced');
assert.match(helper,/route|right|photo|copyright/i);
console.log('GRASS_GLOSSARY_QA PASS '+JSON.stringify({shared:Object.keys(mirrored.terms).length,new:Object.keys(ext.terms).length,total:173,advancedGroups:ids.length,coreGroups:4,photoUses:photographed,distinctPhotoFiles:uniquePhotos.size,originalSketchFallbacks:8}));
