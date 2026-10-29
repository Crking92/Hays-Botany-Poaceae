#!/usr/bin/env python3
"""Transfer existing Bob Harms source-original photographs under documented educational permission.

Use ONLY original source blobs in already-cataloged Poaceae source manifest.
The original Bob Harms license is a site-specific scientific/educational grant,
NOT Creative Commons, and must not be re-labeled as CC/public domain.
No GitHub Pages publication or website cutover.
"""
import hashlib, json, re, subprocess, sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

SOURCE=Path(sys.argv[1]).resolve()
DEST=Path(sys.argv[2]).resolve()
MIG=DEST/"migration"
ORIGIN="Crking92/Hays-County-Botany"
url_root="https://w3.biosci.utexas.edu/prc/Monocots/"
original=json.loads((MIG/"poaceae-source-manifest-20261028.json").read_text())
ledger_path=MIG/"source-file-ledger.json"
ledger=json.loads(ledger_path.read_text())
reviews=json.loads((MIG/"image-record-review-ledger.json").read_text())
status_path=MIG/"poaceae-transfer-status.json"
previous=json.loads(status_path.read_text())

assert original["file_count"]==len(original["files"])==1402
assert len(ledger)==1402 and len(reviews)==1026
assert original["snapshot_commit"]==previous["source_commit"]
assert previous["destination_file_counts"]=={
  "SOURCE_DATA_COPIED":390,
  "LICENSE_CANDIDATE_IMAGE_COPIED":788,
  "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":224}
assert previous["file_level_checksum_passed"] is True
assert subprocess.check_output(["git","-C",str(SOURCE),"rev-parse","HEAD"],text=True).strip()==original["snapshot_commit"],"Pinned source snapshot mismatch"
assert subprocess.check_output(["git","-C",str(DEST),"branch","--show-current"],text=True).strip()=="main","Do not push a staging branch by accident"
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b"","Destination must start clean"
def sha(data):
    return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
files={x["path"]:x for x in original["files"]}
source_records={x["path"]:x for x in ledger}
review_records={}
for item in reviews:
    key=item.get("resolved_path")
    if key:
        assert key not in review_records,("Duplicate photo source review",key)
        review_records[key]=item
assert len(files)==len(source_records)==1402
assert files.keys()==source_records.keys()
chosen=[]
for item in ledger:
    if item["disposition"]!="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":
        continue
    path=item["path"]
    r=review_records.get(path)
    if not r or r.get("creator")!="Bob Harms":continue
    link=r.get("source_page") or ""
    parsed=urlparse(link)
    assert parsed.scheme=="https" and parsed.hostname=="w3.biosci.utexas.edu"
    assert link.startswith(url_root) and "/GrassHTML/data/" in link,link
    assert "educational" in (r.get("license") or "").lower()
    assert "bob harms" in (r.get("license") or "").lower()
    assert path.startswith("content/taxa/Poaceae/") and "/images/" in path
    assert Path(path).suffix.lower() in (".jpg",".jpeg",".png",".webp")
    chosen.append((item,r))
assert len(chosen)==157,f"Expected 157 Bob Harms original photos; detected {len(chosen)}"
assert len({x[0]["path"] for x in chosen})==157

def copy_exact(path):
    src=SOURCE/path
    assert src.is_file(),f"Missing original source: {path}"
    raw=src.read_bytes()
    assert len(raw)==files[path]["bytes"],f"Original bytes changed: {path}"
    assert sha(raw)==files[path]["git_blob_sha"]==source_records[path]["git_blob_sha"],f"Original SHA mismatch: {path}"
    assert len(raw)<=25*1024*1024,"File exceeds transfer batch policy"
    dest=DEST/path
    if dest.exists():
        assert dest.read_bytes()==raw,"Do not overwrite a different destination photo"
    else:
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(raw)
    assert sha(dest.read_bytes())==files[path]["git_blob_sha"]
    return len(raw)

# Source baseline recheck includes previously imported 390 text and 788 photo originals:
old=Counter()
for entry in ledger:
    path=entry["path"]
    if entry["disposition"] in ("SOURCE_DATA_COPIED","LICENSE_CANDIDATE_IMAGE_COPIED"):
        raw=(DEST/path).read_bytes()
        assert len(raw)==files[path]["bytes"] and sha(raw)==files[path]["git_blob_sha"],f"Previous import drift: {path}"
        old[entry["disposition"]]+=1
assert old["SOURCE_DATA_COPIED"]==390 and old["LICENSE_CANDIDATE_IMAGE_COPIED"]==788

permissions=[]
source_bytes=0
for record,r in chosen:
    path=record["path"]
    n=copy_exact(path)
    source_bytes+=n
    permissions.append({
        "path":path,
        "source_git_blob_sha":record["git_blob_sha"],
        "bytes":n,
        "species":r.get("species"),
        "creator":"Bob Harms",
        "source_photo_page":r["source_page"],
        "source_permission_page":url_root,
        "terms":"Copyright Bob Harms. Free for scientific and educational use provided proper credit.",
        "scope":"Scientific/educational use WITH credit; not Creative Commons or general-purpose commercial redistribution",
        "public_repo_source_copy_only":True,
        "inclusion_in_live_pages":False,
        "original_rights_record":r.get("license"),
        "previous_hold_reasons":record["hold_reasons"],
    })
    record["original_hold_reasons"]=record["hold_reasons"]
    record["hold_reasons"]=[]
    record["disposition"]="SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED"
    record["reuse_notice"]="Bob Harms copyright; educational/scientific use with proper attribution only; not CC"
assert len(permissions)==157

# Distinguish bytes copied to public SOURCE repo from actual public website deployment.
counts=Counter(x["disposition"] for x in ledger)
assert counts=={
 "SOURCE_DATA_COPIED":390,
 "LICENSE_CANDIDATE_IMAGE_COPIED":788,
 "SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED":157,
 "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":67}
assert all(x["path"] not in {p["path"] for p in permissions} for x in ledger if x["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY")
assert all(sha((DEST/p["path"]).read_bytes())==p["source_git_blob_sha"] for p in permissions)
stats={
 "status":"POACEAE_157_BOB_HARMS_EDUCATIONAL_ORIGINALS_COPIED_PUBLIC_SOURCE_ONLY",
 "original_total_source_files":1402,
 "source_snapshot_sha":original["snapshot_commit"],
 "previously_verified_copied_source_files":1178,
 "new_educational_permission_photos_copied":157,
 "total_original_source_files_now_copied":1335,
 "remaining_original_source_photo_holds":67,
 "botanical_scientific_text_originals":390,
 "previous_license_candidate_photos":788,
 "bob_harms_photographs":157,
 "new_source_photo_bytes":source_bytes,
 "current_total_source_bytes":previous["destination_bytes_copied"]+source_bytes,
 "site_specific_permission_source_url":url_root,
 "all_bob_harms_photo_pages_recorded":True,
 "new_cc_or_public_domain_grants_claimed":False,
 "site_educational_scope_required":True,
 "public_repo_source_code_contains_photo_bytes":True,
 "github_pages_or_original_hub_changed":False,
 "actual_live_gallery_deployment":False,
 "previous_rights_hold_originals_released":False,
 "changed_original_source_files":0
}
(MIG/"poaceae-bob-harms-educational-transfer.json").write_text(
    json.dumps({"summary":stats,"photos":permissions},indent=2,ensure_ascii=False)+"\n")
ledger_path.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+"\n")
previous["previous_staging_snapshot_before_educational_import"]={
  "destination_file_counts":previous["destination_file_counts"],
  "destination_bytes_copied":previous["destination_bytes_copied"]}
previous["stage"]="EDUCATIONAL_PHOTO_SOURCE_TRANSFER_NOT_DEPLOYED"
previous["destination_file_counts"]=dict(counts)
previous["destination_bytes_copied"]=stats["current_total_source_bytes"]
previous["bob_harms_permission_url"]=url_root
previous["source_photo_review_notice"]="157 Bob Harms originals transferred under exact credited scientific/educational source permission, not CC; 67 remain held. No live site."
status_path.write_text(json.dumps(previous,indent=2,ensure_ascii=False)+"\n")
(DEST/"BOB_HARMS_PHOTO_PERMISSION.md").write_text("""# Bob Harms original grass photographs — credit and terms

**Copyright © Bob Harms. Not a Creative Commons grant.**

The 157 Bob Harms image files transferred from the original Hays Botany collection
are included for the scientific and educational Hays Botany Visual Learner.
The photographer's [Selected Monocots](https://w3.biosci.utexas.edu/prc/Monocots/)
states that its images and web pages are free for scientific and educational uses
provided that Bob Harms is properly credited.

Credit: **Photograph © Bob Harms — Selected Monocots, University of Texas**.

Each file's exact source-photo page, original blob SHA, and terms are listed in
[migration/poaceae-bob-harms-educational-transfer.json](migration/poaceae-bob-harms-educational-transfer.json).
This copyright permission does **not** make the files CC0, public domain,
open-source, or freely usable for all commercial purposes. Please follow
the original photographer's conditions if reusing them. Contact the rightsholder
about uses outside the stated scientific and educational scope.

**Repository file copy is not an approval to deploy a new public Pages site.**
The prior hub still owns the canonical records and no live site routing changed.
The remaining 67 original held images are not included in this transfer.
""")

# Respect the <=100 file per batch rule. A batch is max 70 new photo files.
def git(*args):
    subprocess.run(["git","-C",str(DEST),*args],check=True)
git("config","user.name","github-actions[bot]")
git("config","user.email","41898282+github-actions[bot]@users.noreply.github.com")
paths=[x["path"] for x in permissions]
for start in range(0,len(paths),70):
    chunk=paths[start:start+70]
    assert len(chunk)<=70
    git("add","--",*chunk)
    git("diff","--cached","--check")
    git("commit","-m",f"Preserve {len(chunk)} existing Bob Harms educational-use grass originals with source hashes and credit")
meta=[
 "migration/poaceae-bob-harms-educational-transfer.json",
 "migration/source-file-ledger.json",
 "migration/poaceae-transfer-status.json",
 "BOB_HARMS_PHOTO_PERMISSION.md"]
git("add","--",*meta)
git("diff","--cached","--check")
git("commit","-m","Document 157 Bob Harms educational licenses, exact source URLs, and 67 remaining media holds")
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
print("POACEAE_BOB_HARMS_EDUCATIONAL_TRANSFER_PASS",json.dumps(stats,sort_keys=True),flush=True)
