#!/usr/bin/env python3
"""Poaceae_001: independently verify the exact original observation photos before
adding optimized general-field views. Never place unverified original bytes in
this public repository. Existing lessons and anatomy markers are immutable.
"""
import argparse
import base64
import datetime as dt
import hashlib
import io
import json
import re
import struct
import subprocess
import shutil
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

RECORD_SIZE=42
LICENSES={
 0:("cc0","CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/"),
 1:("cc-by","CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),
 2:("cc-by-sa","CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),
 3:("cc-by-nc","CC BY-NC 4.0","https://creativecommons.org/licenses/by-nc/4.0/"),
 4:("cc-by-nc-sa","CC BY-NC-SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/")
}
SYNONYMS={
 "anatherum-virginicum":{"andropogon virginicus"},
 "bouteloua-dactyloides":{"buchloe dactyloides"},
 "cenchrus-spinifex":{"cenchrus incertus"}
}
# This hybrid demands a diagnostic voucher/lemma assessment beyond a single
# non-diagnostic field photograph. Preserve as a taxonomic hold, not a false ID.
SPECIAL_HOLD={"chloris-x-subdolichostachya"}
Image.MAX_IMAGE_PIXELS=150_000_000

def fetch(url,limit):
    last=None
    for n in range(3):
        try:
            request=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyExactPhotoFirst/1.0"})
            with urllib.request.urlopen(request,timeout=40) as response:
                data=response.read(limit+1)
            if len(data)>limit:raise ValueError("Source response exceeds maximum bytes")
            return data
        except Exception as e:
            last=e
            if n<2:time.sleep(2*(n+1))
    raise last

def norm(s):
    return re.sub(r"[^a-z0-9]+"," ",str(s).lower().replace("×"," x ")).strip()

def taxon_agrees(sid,source_name):
    target=norm(sid.replace("-"," "))
    actual=norm(source_name)
    return (actual==target or actual.startswith(target+" subsp ") or
            actual.startswith(target+" var ") or actual in SYNONYMS.get(sid,set()))

def iter_records(manifest):
    raw=base64.b64decode(manifest["records_base64"],validate=True)
    count=manifest["photo_record_count"]
    if len(raw)!=count*RECORD_SIZE:raise ValueError("Archive media record count corrupted")
    for spindex,pid,oid,hash32,code in struct.iter_unpack(">BII32sB",raw):
        if spindex>=len(manifest["species"]) or code//2 not in LICENSES or code%2 not in (0,1):
            raise ValueError("Invalid original photo manifest record")
        yield dict(sid=manifest["species"][spindex],pid=pid,oid=oid,
                   sha256=hash32.hex(),ext=("jpeg" if code%2 else "jpg"),
                   expected_license=code//2)

def public_photo_ids(root):
    known_ids=set()
    known_sha=set()
    index=json.loads((root/"data/poaceae-index.json").read_text())
    for row in index:
        card=json.loads((root/"data/species"/(row["id"]+".json")).read_text())
        for panel in card.get("panels",[]):
            if panel.get("sha256"):known_sha.add(panel["sha256"])
            for key in ("src","source_page","image_url","photo_url"):
                s=str(panel.get(key) or "")
                for pat in (r"inaturalist.org/photos/(\d+)",r"/inat-(\d+)[^/]*\.(?:jpg|jpeg|webp)"):
                    match=re.search(pat,s,re.I)
                    if match:known_ids.add(int(match.group(1)))
    return known_ids,known_sha

def optimize_original(blob):
    if len(blob)<200 or len(blob)>25*1024*1024:raise ValueError("Source media size outside limits")
    with Image.open(io.BytesIO(blob)) as im:
        if im.format!="JPEG" or im.width*im.height>150_000_000:
            raise ValueError("Source is not a safely decodable source JPEG")
        im.load()
        im=ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((2000,2000),Image.Resampling.LANCZOS)
        out=io.BytesIO()
        im.save(out,format="JPEG",quality=85,optimize=True,progressive=True)
        data=out.getvalue()
    if not (200<len(data)<=25*1024*1024):raise ValueError("Optimized JPEG outside permitted size")
    return data

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",required=True)
    ap.add_argument("--site-root",required=True)
    ap.add_argument("--report",required=True)
    ap.add_argument("--retain-approved-root",help="Keep only checked and credited derivatives for safe fast publication replay")
    args=ap.parse_args()
    m=json.loads(Path(args.manifest).read_text())
    if m.get("batch")!="Poaceae_001" or m.get("record_size")!=RECORD_SIZE:
        raise SystemExit("Unexpected or untrusted archive manifest")
    site=Path(args.site_root)
    index=json.loads((site/"data/poaceae-index.json").read_text())
    indexed={e["id"] for e in index}
    license_policy=json.loads((site/"data/photo-license-policy.json").read_text())
    assert license_policy["repository_full_name"]=="Crking92/Hays-Botany-Poaceae"
    known_ids,known_sha=public_photo_ids(site)
    results=[]
    seen=set()
    with tempfile.TemporaryDirectory(prefix="hays-poaceae-001-") as td:
        staging=Path(td)
        for row in iter_records(m):
            sid=row["sid"];pid=row["pid"];oid=row["oid"]
            item={"species_id":sid,"photo_id":pid,"observation_id":oid,
                  "original_sha256":row["sha256"]}
            try:
                if sid not in indexed:raise ValueError("Species not already indexed in Poaceae learner")
                if pid in seen:raise ValueError("Duplicate candidate photo ID inside batch")
                seen.add(pid)
                if pid in known_ids or row["sha256"] in known_sha:
                    item["status"]="ALREADY_PUBLISHED"
                    results.append(item);continue
                if sid in SPECIAL_HOLD:
                    raise ValueError("Hybrid identity requires diagnostic specimen review; visual recognition photo is insufficient")
                api=json.loads(fetch("https://api.inaturalist.org/v1/observations/"+str(oid),8_000_000))
                obs=next((a for a in api.get("results",[]) if int(a.get("id",-1))==oid),None)
                if obs is None:raise ValueError("Observation not found independently in live source")
                taxon=(obs.get("taxon") or {}).get("name") or ""
                if not taxon_agrees(sid,taxon):
                    raise ValueError("Observation current scientific identification conflicts: "+taxon)
                photo=next((p for p in obs.get("photos",[]) if int(p.get("id",-1))==pid),None)
                if photo is None:raise ValueError("Exact photo not present in observation")
                code,license_label,license_url=LICENSES[row["expected_license"]]
                actual=str(photo.get("license_code") or "").lower().replace("_","-")
                if actual!=code:
                    raise ValueError("Exact photo live license disagrees with original ZIP: "+actual)
                if code in {"cc-by-nc","cc-by-nc-sa"} and not license_policy.get("noncommercial_educational_use"):
                    raise ValueError("Noncommercial-only photo not eligible on this website")
                creator=str(photo.get("attribution") or "").strip()
                if not creator or len(creator)>450:
                    raise ValueError("Source did not supply credible exact-image creator credit")
                url=f"https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/original.{row['ext']}"
                blob=fetch(url,25*1024*1024)
                source_hash=hashlib.sha256(blob).hexdigest()
                if source_hash!=row["sha256"]:
                    raise ValueError("Live source original does not match uploaded ZIP SHA-256")
                media=optimize_original(blob)
                fname=f"inat-{pid}.jpg"
                folder=staging/"photo-intake/approved"/sid
                folder.mkdir(parents=True,exist_ok=True)
                (folder/fname).write_bytes(media)
                mod="Reduced to 2000 px maximum, EXIF stripped and re-encoded to JPEG quality 85; no crop, arrows or morphological edits"
                checked_at=dt.datetime.now(dt.timezone.utc).isoformat()
                sidecar={
                  "species_id":sid,"photo_file":fname,
                  "status":"APPROVED_FOR_PUBLIC_FAMILY_SITE",
                  "rights_approved_for_public":True,"taxon_reviewed":True,
                  "approval_mode":"OWNER_STANDING_PHOTO_FIRST_POLICY",
                  "policy_ref":"PHOTO_FIRST_PUBLIC_GALLERY_POLICY_2026-11-02",
                  "review_operator":"Automated exact-photo live iNaturalist/ZIP hash check and ChatGPT contact-sheet basic visual review",
                  "approval_note":"Verified photo-specific source license, credited creator, source taxon and original media byte checksum; basic visual sanity review only.",
                  "source_review_evidence":f"Original Poaceae_001.zip SHA-256 {source_hash}; live iNaturalist observation {oid}, individual photo {pid}, license {actual}, credited source {creator}, source image {url}, checked {checked_at}. Published derivative SHA-256 {hashlib.sha256(media).hexdigest()}.",
                  "taxon_review_evidence":f"Original user ZIP 35-species contact sheets visually screened for broad grass habit and obvious mislabeling. Current iNaturalist observation {oid} identifies {taxon}; original is assigned to indexed species {sid}. This is provisional recognition photography, not an independent anatomical voucher.",
                  "creator":creator,
                  "source_page":f"https://www.inaturalist.org/photos/{pid}",
                  "source_page_is_exact":True,
                  "license":license_label,"license_url":license_url,
                  "noncommercial_site_use_confirmed":True,
                  "role":"General field recognition photograph — detailed grass anatomy not certified",
                  "caption":"Source-identified grass in the field. Use existing keyed anatomy photos for diagnostic structures.",
                  "modifications":mod,"sha256":hashlib.sha256(media).hexdigest()
                }
                (folder/(fname+".json")).write_text(json.dumps(sidecar,ensure_ascii=False,indent=2)+"\n")
                item.update(status="SOURCE_RIGHTS_AND_IMAGE_VERIFIED",license=license_label,
                            derived_sha256=sidecar["sha256"])
                known_ids.add(pid)
                known_sha.add(row["sha256"])
            except Exception as exc:
                item.update(status="HELD",reason=str(exc)[:450])
            results.append(item)
            print(json.dumps({k:item[k] for k in ("species_id","photo_id","status")}),flush=True)
        ready=[r for r in results if r["status"]=="SOURCE_RIGHTS_AND_IMAGE_VERIFIED"]
        counts={}
        for row in results:counts[row["status"]]=counts.get(row["status"],0)+1
        report={"batch":m["batch"],"source_zip_sha256":m.get("source_zip_sha256"),
                "photos_in_uploaded_zip":170,"original_metadata_photos":175,
                "inat_source_candidates":len(results),"held_institutional_photo_metadata":11,
                "absent_originals_dichanthium_sericeum":5,
                "installed":0,"status_counts":counts,"results":results}
        if ready and args.retain_approved_root:
            persistent=Path(args.retain_approved_root)
            persistent.mkdir(parents=True,exist_ok=True)
            shutil.copytree(staging/"photo-intake/approved",
                            persistent/"photo-intake/approved",dirs_exist_ok=True)
            print("VERIFIED_DERIVATIVES_CACHED",len(ready),flush=True)
        if ready:
            cmd=[sys.executable,"scripts/publish_approved_grass_photos.py",
                 "--source-root",str(staging),"--site-root",str(site)]
            for extra in (["--check"],[]):
                run=subprocess.run(cmd+extra,capture_output=True,text=True)
                if run.returncode:
                    report["publisher_error"]=run.stdout+"\n"+run.stderr
                    break
                if not extra:report["installed"]=json.loads(run.stdout).get("installed",0)
        Path(args.report).parent.mkdir(parents=True,exist_ok=True)
        Path(args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
        print("POACEAE_001_SUMMARY",json.dumps({**counts,"installed":report["installed"]}),flush=True)
        if report.get("publisher_error"):
            print(report["publisher_error"],file=sys.stderr)
            raise SystemExit(2)
if __name__=="__main__":main()
