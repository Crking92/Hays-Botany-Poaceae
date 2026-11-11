#!/usr/bin/env node
// Preparation and bookkeeping only. Anatomy verdicts require actual image review.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export const REPO = 'Crking92/Hays-Botany-Poaceae';
export const LAB = 'site/visual-key-lab/';
export const TRACKER = LAB + 'PROGRESS_TRACKER.md';
export const FILES = ['a','b','c1','c2','c3','d1','d2','d3','d4'].map(s => LAB + `species-${s}.json`);
const HASH = /^[a-f0-9]{40}$/;
const ok = (condition, message) => { if (!condition) throw new Error(message); };
const clone = value => JSON.parse(JSON.stringify(value));
export const gitHash = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const key = p => `${p.id}:${p.i}`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const json = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const writeJSON = (p, value) => fs.writeFile(p, JSON.stringify(value, null, 2) + '\n');

export function photoPath(src) {
  const u = new URL(src);
  ok(u.origin === 'https://crking92.github.io' && ['/Hays-Botany-Poaceae/content/taxa/Poaceae/','/Hays-Botany-Poaceae/site/media/'].some(prefix=>u.pathname.startsWith(prefix)), 'Photo is not an existing repository-hosted Poaceae image');
  const p = decodeURIComponent(u.pathname.slice('/Hays-Botany-Poaceae/'.length));
  ok(!p.split('/').some(s => s === '..' || s === '.') && !p.includes('\\') && /\.jpe?g$/i.test(p), 'Unsafe photo path');
  return p;
}

export function inspect(snapshot) {
  ok(snapshot.repo === REPO && HASH.test(snapshot.commit), 'Invalid snapshot identity');
  const species = [];
  for (const filename of [...FILES, TRACKER]) {
    ok(typeof snapshot.files[filename] === 'string', `Missing ${filename}`);
    ok(gitHash(Buffer.from(snapshot.files[filename])) === snapshot.blobs[filename], `Snapshot blob mismatch: ${filename}`);
    if (filename !== TRACKER) for (const record of JSON.parse(snapshot.files[filename])) species.push({filename, record});
  }
  const ids = new Set();
  for (const {record:s} of species) {
    ok(!ids.has(s.id), `Duplicate species: ${s.id}`); ids.add(s.id);
    const indices = new Set();
    for (const p of s.photos) {
      ok(Number.isInteger(p.i) && !indices.has(p.i), `Duplicate/invalid photo index: ${s.id}`); indices.add(p.i);
      ok(HASH.test(snapshot.blobs[photoPath(p.src)] || ''), `Missing photo blob: ${s.id}:${p.i}`);
    }
    const audited = new Set();
    for (const r of s.photo_character_audit?.photo_roles || []) {
      ok(indices.has(r.i) && !audited.has(r.i), `Invalid/duplicate audit index: ${s.id}:${r.i}`); audited.add(r.i);
      ok(['DIRECT_VISIBLE','PARTIAL_VISIBLE','PARTIAL'].includes(r.verdict), `Unknown verdict: ${r.verdict}`);
    }
  }
  return species;
}

export function counts(snapshot) {
  const species = inspect(snapshot).map(x => x.record);
  const roles = species.flatMap(s => s.photo_character_audit?.photo_roles || []);
  return {species:species.length, genera:new Set(species.map(s => s.genus)).size,
    photos:species.reduce((n,s) => n+s.photos.length,0), checks:species.reduce((n,s) => n+(s.diagnostic_checks?.length || 0),0),
    hosted:roles.length, direct:roles.filter(r => r.verdict === 'DIRECT_VISIBLE').length,
    partial:roles.filter(r => ['PARTIAL','PARTIAL_VISIBLE'].includes(r.verdict)).length,
    full:species.filter(s => s.photos.length > 0 && s.photo_character_audit?.photo_roles.length === s.photos.length).length,
    partialSpecies:species.filter(s => s.photo_character_audit?.photo_roles.length > 0 && s.photo_character_audit.photo_roles.length < s.photos.length).length};
}

export function plan(snapshot, {species=[], limit=16, replayPass=''}={}) {
  ok(Number.isInteger(limit) && limit > 0 && limit <= 50, 'Batch limit must be 1–50');
  const all=inspect(snapshot); const wanted=new Set(species);
  for (const id of wanted) ok(all.some(x=>x.record.id===id), `Unknown species: ${id}`);
  const selected=[];
  for (const {filename,record:s} of all) {
    if (wanted.size && !wanted.has(s.id)) continue;
    for (const photo of s.photos) {
      const prior=(s.photo_character_audit?.photo_roles || []).find(r=>r.i===photo.i);
      if (replayPass ? prior?.pass !== replayPass : !!prior) continue;
      const repositoryPath=photoPath(photo.src);
      selected.push({id:s.id, i:photo.i, species_file:filename, common:s.common, scientific:s.scientific,
        photo:clone(photo), repository_path:repositoryPath, git_blob_sha:snapshot.blobs[repositoryPath],
        local_file:`images/${s.id}-${photo.i}.jpg`});
      if(selected.length===limit) break;
    }
    if(selected.length===limit) break;
  }
  return {schema:1,repo:REPO,commit:snapshot.commit,replay_pass:replayPass,baseline:counts(snapshot),selected};
}

async function get(url, binary=false) {
  const response=await fetch(url,{headers:{'User-Agent':'Hays-Grass-Photo-Batch/1'},signal:AbortSignal.timeout(60000)});
  ok(response.ok, `HTTP ${response.status}: ${url}`);
  return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
}
async function parallel(items, task) {
  let cursor=0;
  await Promise.all(Array.from({length:Math.min(4,items.length)}, async()=>{while(cursor<items.length){const item=items[cursor++];await task(item);}}));
}

export async function sync(dir) {
  await fs.mkdir(dir,{recursive:true});
  const ref=await get(`https://api.github.com/repos/${REPO}/git/ref/heads/main`);
  const commit=ref.object.sha;
  const tree=await get(`https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`);
  ok(!tree.truncated, 'Incomplete repository tree');
  const blobs=Object.fromEntries(tree.tree.filter(x=>x.type==='blob').map(x=>[x.path,x.sha]));
  const files={};
  await parallel([...FILES,TRACKER],async p=>{const b=await get(`https://raw.githubusercontent.com/${REPO}/${commit}/${p}`,true);ok(gitHash(b)===blobs[p],`Download hash mismatch: ${p}`);files[p]=b.toString('utf8');});
  const snapshot={repo:REPO,commit,blobs,files}; inspect(snapshot);
  await writeJSON(path.join(dir,'snapshot.json'),snapshot);return counts(snapshot);
}

export async function prepare(snapshot, batch, dir, cacheDir='') {
  ok(batch.commit===snapshot.commit, 'Stale batch');
  try {
    const existing=await json(path.join(dir,'batch.json'));
    ok(existing.commit===batch.commit && existing.replay_pass===batch.replay_pass && JSON.stringify(existing.selected.map(key))===JSON.stringify(batch.selected.map(key)), 'Output folder belongs to a different batch; use a fresh work folder');
  } catch(e) { if(e.code!=='ENOENT')throw e; }
  await fs.mkdir(path.join(dir,'images'),{recursive:true});
  await parallel(batch.selected,async p=>{
    const dest=path.join(dir,p.local_file);let b;
    // Reuse only bytes that match the pinned repository blob, regardless of cache name.
    for (const candidate of [dest,...(cacheDir?[path.join(cacheDir,path.basename(p.local_file))]:[])]) {
      try {const cached=await fs.readFile(candidate);if(gitHash(cached)===p.git_blob_sha){b=cached;break;}}catch(e){if(e.code!=='ENOENT')throw e;}
    }
    if(!b)b=await get(`https://raw.githubusercontent.com/${REPO}/${batch.commit}/${p.repository_path}`,true);
    ok(b[0]===0xff && b[1]===0xd8 && gitHash(b)===p.git_blob_sha,`JPEG/hash mismatch: ${key(p)}`);
    await fs.writeFile(dest,b);p.sha256=sha256(b);p.bytes=b.length;
  });
  await writeJSON(path.join(dir,'batch.json'),batch);
  const review={commit:batch.commit,pass:'',review_date:'',reviewer:'',reference_status:'FLORA_PRIMARY_GRASSBASE_DEFERRED',reference_notes:'',seasonal_notes:'',
    photos:batch.selected.map(p=>({id:p.id,i:p.i,opened_full_size:false,verdict:'PENDING',shows:[],cannot_verify:[]}))};
  // Never overwrite completed reviewer work when preparation is rerun.
  try {await fs.writeFile(path.join(dir,'review.json'),JSON.stringify(review,null,2)+'\n',{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Grass photo review</title><style>body{font:16px system-ui;margin:24px;background:#f4f5ef}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}article{background:white;padding:16px;border-radius:12px}img{width:100%;height:280px;object-fit:contain}p{overflow-wrap:anywhere}small{color:#455}</style><h1>Grass photo review</h1><p>${esc(batch.commit)} · ${batch.selected.length} photos · ${batch.replay_pass?'REPLAY: no new audit credit':'PENDING: download does not mean reviewed'}</p><p>Flora first. Open each original for anatomy details. Credits are retained metadata, not fresh licensing clearance.</p><main>${batch.selected.map(p=>`<article><h2>${esc(p.common)} · ${p.i}</h2><a href="${esc(p.local_file)}"><img src="${esc(p.local_file)}" alt="${esc(p.photo.label)}"></a><p>${esc(p.photo.label)}</p><small>${esc(p.photo.creator)} · ${esc(p.photo.license)}</small><p><a href="${esc(p.photo.source_page)}">Recorded source</a></p><small>${esc(p.git_blob_sha)}</small></article>`).join('')}</main></html>`;
  await fs.writeFile(path.join(dir,'review.html'),html);return batch;
}

export async function validateReview(snapshot,batch,review,dir) {
  inspect(snapshot);ok(review.commit===snapshot.commit && batch.commit===snapshot.commit,'Stale review/snapshot');
  ok(nonempty(review.pass) && /^\d{4}-\d{2}-\d{2}$/.test(review.review_date) && nonempty(review.reviewer),'Review pass, date and reviewer required');
  for(const field of ['reference_status','reference_notes','seasonal_notes'])ok(nonempty(review[field]),`Missing ${field}`);
  ok(review.photos.length===batch.selected.length && batch.selected.length>0,'Review must cover exactly the selected batch');
  const seen=new Set();
  for(const r of review.photos) {
    ok(!seen.has(key(r)),`Duplicate review: ${key(r)}`);seen.add(key(r));
    const p=batch.selected.find(p=>key(p)===key(r));ok(p,`Unselected photo: ${key(r)}`);
    const entry=inspect(snapshot).find(x=>x.record.id===r.id);const s=entry?.record;
    ok(p.species_file===entry?.filename,'Species file changed');
    const source=s?.photos.find(x=>x.i===r.i);
    ok(source && JSON.stringify(source)===JSON.stringify(p.photo),'Photo metadata changed');
    ok(p.repository_path===photoPath(source.src) && p.git_blob_sha===snapshot.blobs[p.repository_path] && p.local_file===`images/${r.id}-${r.i}.jpg`,'Batch identity/path changed');
    ok(r.opened_full_size===true && ['DIRECT_VISIBLE','PARTIAL_VISIBLE'].includes(r.verdict),'Unreviewed/invalid verdict');
    for(const field of ['shows','cannot_verify'])ok(Array.isArray(r[field]) && r[field].length>0 && r[field].every(nonempty),`Missing ${field}`);
    if(r.label!==undefined)ok(nonempty(r.label),'Empty caption');
    const b=await fs.readFile(path.join(dir,p.local_file));
    ok(gitHash(b)===p.git_blob_sha && sha256(b)===p.sha256 && b.length===p.bytes,'Reviewed image bytes changed');
    const prior=s.photo_character_audit?.photo_roles.find(x=>x.i===r.i);
    ok(batch.replay_pass ? prior?.pass===batch.replay_pass : !prior,'Photo already audited or invalid replay');
  }
  return {reviewed:seen.size,newHosted:batch.replay_pass?0:seen.size,baseline:counts(snapshot)};
}

export async function stage(snapshot,batch,review,dir) {
  await validateReview(snapshot,batch,review,dir);ok(!batch.replay_pass,'Replay cannot stage changes or increment progress');
  const next=clone(snapshot), byFile=new Map();
  for(const filename of FILES)byFile.set(filename,JSON.parse(snapshot.files[filename]));
  for(const r of review.photos) {
    const p=batch.selected.find(x=>key(x)===key(r));const s=byFile.get(p.species_file).find(x=>x.id===r.id);
    const a=s.photo_character_audit ||= {photo_roles:[],unmet_roles:[],rights_status:'EXISTING_CREDITS_RETAINED_EXACT_IMAGE_SOURCE_LICENSE_NOT_REVALIDATED'};
    a.photo_roles.push({i:r.i,verdict:r.verdict,shows:r.shows,cannot_verify:r.cannot_verify,pass:review.pass,review_date:review.review_date,
      hosted_file:p.repository_path,hosted_commit:batch.commit,git_blob_sha:p.git_blob_sha,sha256:p.sha256,bytes:p.bytes,byte_verification:'MATCHES_PINNED_GITHUB_BLOB'});
    a.photo_roles.sort((x,y)=>x.i-y.i);if(a.pass!==review.pass)a.previous_pass=a.pass || null;a.pass=review.pass;a.review_date=review.review_date;
    a.status=`INITIAL_VISUAL_REVIEW_${a.photo_roles.length}_OF_${s.photos.length}_IMAGES`;
    a.scope=`${a.photo_roles.length} of ${s.photos.length} current Lab references inspected across recorded passes; not an archive, identity, rights, or field certification.`;
    a.summary=`${a.photo_roles.length} hosted photos reviewed; ${s.photos.length-a.photo_roles.length} remain. See per-photo limitations.`;
    a.reference_status=review.reference_status;a.reference_notes=review.reference_notes;a.seasonal_notes=review.seasonal_notes;
    if(r.label!==undefined)s.photos.find(p=>p.i===r.i).label=r.label;
  }
  const changes={};
  for(const [filename,data] of byFile) {
    if(JSON.stringify(data)===JSON.stringify(JSON.parse(snapshot.files[filename])))continue;
    next.files[filename]=JSON.stringify(data,null,2)+'\n';next.blobs[filename]=gitHash(Buffer.from(next.files[filename]));changes[filename]=next.files[filename];
  }
  const before=counts(snapshot),after=counts(next);
  for(const field of ['species','genera','photos','checks'])ok(before[field]===after[field],`Protected count changed: ${field}`);
  ok(after.hosted===before.hosted+review.photos.length,'Incorrect cumulative audit count');
  const old=snapshot.files[TRACKER];const line=old.split('\n').filter(s=>s.startsWith('| 4. Character-photo'));
  ok(line.length===1,'Tracker dashboard row ambiguous');
  const dashboard=`| 4. Character-photo matching QA | **IN PROGRESS** | **${after.hosted}/${after.photos} (${(100*after.hosted/after.photos).toFixed(1)}%)** hosted references inspected; **${after.full}/${after.species}** full initial Lab-gallery reviews; **${after.partialSpecies}** additional partial galleries; **${after.direct} direct / ${after.partial} partial**. Source previews are not added to hosted totals. | Actual image-role review; source rights, identity and field acceptance remain separate |`;
  const section=`\n## ${review.pass} — hosted photo batch (${review.review_date})\n\n- ${review.photos.length} new hosted JPEGs inspected; cumulative **${after.hosted}/${after.photos}**. Review by ${review.reviewer}.\n- Primary reference: Illustrated Flora of North Central Texas. ${review.reference_status}: ${review.reference_notes}\n- Seasonal coverage: ${review.seasonal_notes}\n- Original files and licensing retained. No source-rights clearance, BONAP audit, deployment or field certification implied.\n- Per-photo evidence and hashes recorded in the existing species JSON.\n\n| Species / i | Verdict | Visible | Not verified |\n|---|---|---|---|\n${review.photos.map(r=>`| ${r.id} / ${r.i} | ${r.verdict} | ${r.shows.join('; ').replaceAll('|','/').replaceAll('\n',' ')} | ${r.cannot_verify.join('; ').replaceAll('|','/').replaceAll('\n',' ')} |`).join('\n')}\n\n`;
  ok(!old.includes(`## ${review.pass} — hosted photo batch`),'Pass already recorded');
  let tracker=old.replace(line[0],dashboard).replace(/\*\*Updated:\*\* \d{4}-\d{2}-\d{2}/,`**Updated:** ${review.review_date}`);
  const at=tracker.indexOf('\n## Phase 4');ok(at>=0,'Tracker insertion point missing');tracker=tracker.slice(0,at)+section+tracker.slice(at);
  changes[TRACKER]=tracker;
  const proposal={repo:REPO,expected_head:snapshot.commit,counts:after,files:changes};
  await writeJSON(path.join(dir,'proposal.json'),proposal);return {files:Object.keys(changes),counts:after};
}

async function main() {
  const [command,...args]=process.argv.slice(2);const opts={};
  for(let i=0;i<args.length;i+=2){ok(args[i].startsWith('--') && args[i+1]!==undefined,'Use --option value pairs');opts[args[i].slice(2)]=args[i+1];}
  if(command==='sync'){ok(opts.out,'--out required');console.log(await sync(opts.out));return;}
  ok(opts.snapshot,'--snapshot required');const snapshot=await json(opts.snapshot);
  if(command==='counts'){console.log(counts(snapshot));return;}
  ok(opts.out,'--out required');
  if(command==='prepare') {
    const batch=plan(snapshot,{species:opts.species?.split(',') || [],limit:Number(opts.limit || 16),replayPass:opts['replay-pass'] || ''});
    ok(batch.selected.length,'No matching unreviewed photos');
    await prepare(snapshot,batch,opts.out,opts.cache);console.log({commit:batch.commit,prepared:batch.selected.length,replay:!!batch.replay_pass});return;
  }
  const batch=await json(path.join(opts.out,'batch.json')),review=await json(path.join(opts.out,'review.json'));
  if(command==='validate')console.log(await validateReview(snapshot,batch,review,opts.out));
  else if(command==='stage')console.log(await stage(snapshot,batch,review,opts.out));
  else throw new Error('Commands: sync, counts, prepare, validate, stage');
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
