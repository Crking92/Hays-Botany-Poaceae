#!/usr/bin/env python3
"""Preserve existing grass photos explicitly permitted by original authors Dave Thayer and Tom Chester.

No new photo research/download. Exact Git source blobs only. No CC re-licensing.
"""
import hashlib,json,subprocess,sys
from pathlib import Path
from collections import Counter
SOURCE=Path(sys.argv[1]).resolve()
DEST=Path(sys.argv[2]).resolve()
MIG=DEST/"migration"
baseline=json.loads((MIG/"poaceae-source-manifest-20261028.json").read_text())
ledgerfile=MIG/"source-file-ledger.json"
ledger=json.loads(ledgerfile.read_text())
review=json.loads((MIG/"image-record-review-ledger.json").read_text())
statusfile=MIG/"poaceae-transfer-status.json"
status=json.loads(statusfile.read_text())
assert baseline["snapshot_commit"]==subprocess.check_output(["git","-C",str(SOURCE),"rev-parse","HEAD"],text=True).strip()
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
assert len(ledger)==1402
assert status["destination_file_counts"]=={
  "SOURCE_DATA_COPIED":390,"LICENSE_CANDIDATE_IMAGE_COPIED":788,
  "SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED":157,
  "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":67}
def gitsha(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
rows={x["path"]:x for x in baseline["files"]}
refs={x["resolved_path"]:x for x in review if x.get("resolved_path")}
target=[]
for record in ledger:
 if record["disposition"]!="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":continue
 match=refs.get(record["path"])
 if not match:continue
 by=match.get("creator") or ""
 url=match.get("source_page") or ""
 if by=="Dave Thayer":
  assert url=="https://www.azgrasses.org/pages-grasses/BB/Bothriochloa%20ischaemum.html"
  rights="Artist's own photos and drawings free for use in any way, per Arizona Grasses introduction"
  rights_page="https://www.azgrasses.org/index.html"
  category="SITE_SPECIFIC_AUTHOR_FREE_USE_IMAGE_COPIED"
 elif by=="Tom Chester":
  assert url.startswith("https://tchester.org/gc/plants/species/pix/erioneuron_pilosum/")
  rights="Author's source-page credited reproduction permission, per species page"
  rights_page="https://tchester.org/gc/plants/species/erioneuron_pilosum.html"
  category="SITE_SPECIFIC_AUTHOR_CREDITED_REPRODUCTION_IMAGE_COPIED"
 else:continue
 assert record["path"].startswith("content/taxa/Poaceae/")
 assert "/images/" in record["path"]
 target.append((record,match,rights,rights_page,category))
assert len(target)==5,[(x[0]["path"],x[1]["creator"]) for x in target]
assert Counter(x[1]["creator"] for x in target)=={"Dave Thayer":2,"Tom Chester":3}
entries=[]
copied=0
for r,rev,rights,rights_page,category in target:
 path=r["path"]
 b=(SOURCE/path).read_bytes()
 assert gitsha(b)==rows[path]["git_blob_sha"]==r["git_blob_sha"] and len(b)==rows[path]["bytes"]
 assert len(b)<=25*1024*1024
 dst=DEST/path
 assert not dst.exists(), "Original was already installed; inspect before overwriting"
 dst.parent.mkdir(parents=True,exist_ok=True)
 dst.write_bytes(b)
 assert gitsha(dst.read_bytes())==r["git_blob_sha"]
 copied+=len(b)
 entries.append({"path":path,"species":rev["species"],"creator":rev["creator"],
    "permission_basis":rights,"permission_url":rights_page,"source_page":rev["source_page"],
    "original_sha":r["git_blob_sha"],"bytes":len(b),
    "source_rights_label":rev["license"],"new_CC_license_inferred":False,
    "approved_for_live_pages":False})
 r["original_hold_reasons"]=r["hold_reasons"]
 r["hold_reasons"]=[]
 r["disposition"]=category
 r["reuse_notice"]=rights+"; credit "+rev["creator"]+" with source"
counts=Counter(x["disposition"] for x in ledger)
assert counts=={
 "SOURCE_DATA_COPIED":390,
 "LICENSE_CANDIDATE_IMAGE_COPIED":788,
 "SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED":157,
 "SITE_SPECIFIC_AUTHOR_FREE_USE_IMAGE_COPIED":2,
 "SITE_SPECIFIC_AUTHOR_CREDITED_REPRODUCTION_IMAGE_COPIED":3,
 "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":62}
stats={
 "status":"POACEAE_EXISTING_AUTHOR_PERMISSION_5_ADDED_NOT_DEPLOYED",
 "original_files":1402,
 "original_photos_total":1012,
 "new_thayer_photo_copies":2,"new_chester_photo_copies":3,
 "new_source_media_bytes_copied":copied,
 "total_source_files_transferred":1340,
 "remaining_original_photo_holds":62,
 "verified_exact_git_source_blobs":5,
 "rights_preserved_no_CC_relicensing":True,
 "original_hub_unchanged":True,"site_published":False}
(MIG/"poaceae-author-photo-5-transfer.json").write_text(json.dumps({"summary":stats,"photos":entries},indent=2,ensure_ascii=False)+"\n")
ledgerfile.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+"\n")
status["destination_file_counts"]=dict(counts)
status["destination_bytes_copied"]+=copied
status["author_permission_transfer_5_summary"]="Two Dave Thayer originals freely reusable by stated site terms; three Tom Chester originals under credited reproduction permission"
statusfile.write_text(json.dumps(status,indent=2,ensure_ascii=False)+"\n")
(DEST/"OTHER_AUTHOR_PHOTO_PERMISSION.md").write_text("""# Additional original author photo permissions — Poaceae

These five original photos were transferred from the existing Hays Botany source,
not sourced or modified during this transfer.

* **Dave Thayer (2):** [Wild Grasses of Arizona](https://www.azgrasses.org/index.html)
  states that his own photographs and drawings are free to use in any way.
* **Tom Chester (3):** [Erioneuron pilosum source page](https://tchester.org/gc/plants/species/erioneuron_pilosum.html)
  grants permission to reproduce the page with credit to Tom Chester and the source.

These are site/author-specific permissions, not Creative Commons re-licensing.
The exact source photograph links, file IDs, source hashes, creators and
original credit statements are in
[migration/poaceae-author-photo-5-transfer.json](migration/poaceae-author-photo-5-transfer.json).

The other held original photos remain outside the public Poaceae repository.
Public GitHub Pages cutover and gallery presentation have **not** been approved.
""")
subprocess.run(["git","-C",str(DEST),"config","user.name","github-actions[bot]"],check=True)
subprocess.run(["git","-C",str(DEST),"config","user.email","41898282+github-actions[bot]@users.noreply.github.com"],check=True)
paths=[r["path"] for r,_,_,_,_ in target]+[
 "migration/poaceae-author-photo-5-transfer.json",
 "migration/source-file-ledger.json","migration/poaceae-transfer-status.json",
 "OTHER_AUTHOR_PHOTO_PERMISSION.md"]
subprocess.run(["git","-C",str(DEST),"add","--",*paths],check=True)
subprocess.run(["git","-C",str(DEST),"diff","--cached","--check"],check=True)
subprocess.run(["git","-C",str(DEST),"commit","-m",
    "Transfer 5 original Thayer and Chester grass photos under exact public author permissions"],check=True)
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
print("POACEAE_THAYER_CHESTER_SOURCE_TRANSFER_PASS",json.dumps(stats,sort_keys=True),flush=True)
