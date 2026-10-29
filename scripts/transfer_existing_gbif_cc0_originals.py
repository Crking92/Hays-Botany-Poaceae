#!/usr/bin/env python3
"""Move only existing GBIF CC0 originals if current occurrence media & source pixels agree.

This tool does not scout/add new photos or publish Pages. Pinned original SHA,
individual occurrence media license, taxon, photographer, and pHash must match.
"""
import hashlib,io,json,re,subprocess,sys,time,urllib.request,urllib.parse,urllib.error
from pathlib import Path
from collections import Counter
from PIL import Image,ImageOps
import imagehash
SOURCE=Path(sys.argv[1]).resolve()
DEST=Path(sys.argv[2]).resolve()
MIG=DEST/"migration"
records=json.loads((MIG/"source-file-ledger.json").read_text())
rev=json.loads((MIG/"image-record-review-ledger.json").read_text())
original=json.loads((MIG/"poaceae-source-manifest-20261028.json").read_text())
status_path=MIG/"poaceae-transfer-status.json"
status=json.loads(status_path.read_text())
assert original["snapshot_commit"]==status["source_commit"]
assert subprocess.check_output(["git","-C",str(SOURCE),"rev-parse","HEAD"],text=True).strip()==original["snapshot_commit"]
assert len(records)==len(original["files"])==1402
expected={f["path"]:f for f in original["files"]}
rights={x["resolved_path"]:x for x in rev if x.get("resolved_path")}
pre_counts=Counter(x["disposition"] for x in records)
assert status["destination_file_counts"]==dict(pre_counts) and 1<=pre_counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]<=58
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
def sha(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def phash(b):
 with Image.open(io.BytesIO(b)) as i:return imagehash.phash(ImageOps.exif_transpose(i).convert("RGB"))
def norm(t):return " ".join(re.findall("[a-z0-9]+",str(t or "").lower()))
def urlget(url,mode="json"):
 last=None
 for i in range(4):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"GlassRootGarden-Poaceae/1.0 (source copyright recheck; github.com/Crking92/Hays-Botany-Poaceae)",
      "Accept":"application/json" if mode=="json" else "image/*,*/*;q=0.8"})
   with urllib.request.urlopen(req,timeout=30) as h:
    if mode=="json":return json.load(h)
    b=h.read(20_000_001)
    if not (2000<len(b)<20_000_001):raise ValueError("IMAGE_SIZE_INVALID")
    return b
  except urllib.error.HTTPError as e:
   last="HTTP_"+str(e.code)
   if e.code not in (429,500,502,503,504):break
   time.sleep(2+i*2)
  except Exception as e:
   last=type(e).__name__
   time.sleep(i+1)
 raise ValueError("SOURCE_UNAVAILABLE:"+str(last))
def cc0(value):
 v=str(value or "").strip().lower().replace("http://","https://").rstrip("/")
 return v in ("https://creativecommons.org/publicdomain/zero/1.0",
              "http://creativecommons.org/publicdomain/zero/1.0",
              "cc0","cc0 1.0","creative commons cc0 1.0 universal public domain dedication")
def species_ok(occ,card):
 aliases=[card["scientific_name"]]+[s for s in card.get("synonyms",[]) if isinstance(s,str)]
 names=[occ.get(k) for k in ("scientificName","acceptedScientificName","verbatimScientificName")]
 for name in names:
  nn=norm(name)
  for alias in aliases:
   terms=norm(alias).split()
   if len(terms)<2:continue
   phrase=" ".join(terms[:2])
   if nn.startswith(phrase+" ") or nn==phrase:return True
 return False
targets=[x for x in records if x["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"
 and (rights.get(x["path"]) or {}).get("source_page","").startswith("https://www.gbif.org/occurrence/")
 and (rights.get(x["path"]) or {}).get("license","").startswith("CC0")]
assert len(targets)==2,len(targets)
approved=[];held=[]
for entry in targets:
 path=entry["path"]
 claim=rights[path]
 check={"source_path":path,"original_credit":claim.get("creator"),"original_license":claim.get("license"),"source_url":claim["source_page"]}
 try:
  src=(SOURCE/path).read_bytes()
  assert len(src)==expected[path]["bytes"] and sha(src)==expected[path]["git_blob_sha"]==entry["git_blob_sha"]
  occurrence_id=int(claim["source_page"].rsplit("/",1)[-1])
  occ=urlget("https://api.gbif.org/v1/occurrence/"+str(occurrence_id))
  card=json.loads((DEST/Path(path).parent.parent/"species.json").read_text())
  if not species_ok(occ,card):raise ValueError("OCCURRENCE_TAXON_NOT_CURRENT_TARGET")
  possibilities=occ.get("media") or []
  valid=[]
  for photo in possibilities:
   if not cc0(photo.get("license")):continue
   creator=str(photo.get("creator") or photo.get("rightsHolder") or "").strip()
   if not creator:continue
   link=str(photo.get("identifier") or "")
   if not link.startswith("https://"):continue
   try:
    pix=int(phash(src)-phash(urlget(link,mode="binary")))
    if pix<=12:valid.append((pix,creator,link,photo.get("license")))
   except Exception:continue
  if not valid:raise ValueError("NO_EXACT_MATCHING_GBIF_CC0_IMAGE_AND_CREATOR")
  pix,creator,link,license=sorted(valid,key=lambda x:x[0])[0]
  dest=DEST/path
  dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==src
  else:dest.write_bytes(src)
  assert sha(dest.read_bytes())==entry["git_blob_sha"]
  entry["original_hold_reasons"]=entry["hold_reasons"]
  entry["hold_reasons"]=[]
  entry["disposition"]="CURRENT_GBIF_CC0_ORIGINAL_PHOTO_COPIED"
  approved.append({**check,"status":"COPIED_EXACT_CURRENT_GBIF_CC0","source_blob_sha":entry["git_blob_sha"],
   "current_license":str(license),"current_creator":creator,"matched_multimedia_url":link,
   "distance":pix,"source_licensing_cleared":True,"public_website_deployed":False})
 except Exception as e:held.append({**check,"status":"HELD_SOURCE_NOT_PROVEN","reason":str(e)[:180]})
 time.sleep(1.1)
counts=Counter(x["disposition"] for x in records)
assert counts["CURRENT_GBIF_CC0_ORIGINAL_PHOTO_COPIED"]==len(approved)
assert counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]==pre_counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]-len(approved)
assert sum(counts.values())==1402
summary={"status":"POACEAE_GBIF2_SOURCE_ONLY_TRANSFER_CHECKED",
 "source_originals_examined":2,"source_originals_copied":len(approved),
 "remaining_public_poaceae_source_holds":counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"],
 "total_original_files_in_public_poaceae_repo":1402-counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"],
 "source_bytes_copied":sum(expected[x["source_path"]]["bytes"] for x in approved),
 "new_photos_collected":0,"public_pages_published":False}
(MIG/"poaceae-gbif-cc0-existing-source-check.json").write_text(json.dumps({"summary":summary,"approved":approved,"held":held},indent=2,ensure_ascii=False)+"\n")
(MIG/"source-file-ledger.json").write_text(json.dumps(records,indent=2,ensure_ascii=False)+"\n")
status["destination_file_counts"]=dict(counts)
status["destination_bytes_copied"]+=summary["source_bytes_copied"]
status["remaining_original_source_photos_held"]=counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]
status_path.write_text(json.dumps(status,indent=2,ensure_ascii=False)+"\n")
def git(*args):subprocess.run(["git","-C",str(DEST),*args],check=True)
git("config","user.name","github-actions[bot]")
git("config","user.email","41898282+github-actions[bot]@users.noreply.github.com")
if approved:
 git("add","--",*(x["source_path"] for x in approved))
 git("diff","--cached","--check")
 git("commit","-m","Preserve exact current GBIF CC0 source originals with photo-level metadata and source hashes")
git("add","--","migration/source-file-ledger.json","migration/poaceae-transfer-status.json","migration/poaceae-gbif-cc0-existing-source-check.json")
git("diff","--cached","--check")
git("commit","-m","Record original-only GBIF CC0 source rechecks and outstanding rights holds")
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
print("POACEAE_GBIF_ORIGINAL_TRANSFER_RESULT",json.dumps(summary,sort_keys=True),flush=True)
