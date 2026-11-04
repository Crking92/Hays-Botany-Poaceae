#!/usr/bin/env python3
"""Photo-first source-verified original ZIP image backfill. No unverified media is published."""
from __future__ import annotations
import argparse,base64,hashlib,io,json,os,re,struct,time,urllib.request
from pathlib import Path
from PIL import Image

LICENSES={
 "cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/"),
 "cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),
 "cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),
 "cc-by-nc":("CC BY-NC 4.0","https://creativecommons.org/licenses/by-nc/4.0/"),
 "cc-by-nc-sa":("CC BY-NC-SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/")
}
RECORD_SIZE=42
# Only names already checked as direct synonyms, not broader unidentified look-alikes.
# iNaturalist omits the subspecies rank marker; Kew accepts the ranked concept:
# https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60458622-2
# Only the exact independently verified ranked taxon alias is admitted here.
SYNONYMS={"dinebra-panicea-subsp-mucronata":{"dinebra panicea mucronata"}}
def grab(url,maxsize):
    req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyEducationalPhotoFirst/1.0 (original-media license verification)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=30) as r:data=r.read(maxsize+1)
            if len(data)>maxsize:raise ValueError("Source media exceeds size limit")
            return data
        except Exception:
            if attempt==2:raise
            time.sleep(1+attempt)
def decode(m):
    data=base64.b64decode(m["records_base64"],validate=True)
    if len(data)%RECORD_SIZE:raise ValueError("Corrupt original photo record size")
    for sidindex,pid,oid,hash_bytes,ext in struct.iter_unpack(">BII32sB",data):
        if sidindex>=len(m["species"]) or ext not in (0,1,2):raise ValueError("Bad source record")
        yield m["species"][sidindex],pid,oid,hash_bytes.hex(),({0:"jpg",1:"jpeg",2:"png"}[ext])
def matches(expected,taxon):
    norm=lambda n: re.sub(r"[^a-z0-9]+"," ",str(n).lower().replace("×","x")).strip()
    target=norm(expected); name=norm(taxon)
    species_level=len(target.split())==2
    return name==target or (species_level and (name.startswith(target+" subsp ") or name.startswith(target+" var "))) or name in {norm(v) for v in SYNONYMS.get(expected,set())}
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",type=Path,required=True)
    parser.add_argument("--source-root",type=Path,required=True)
    parser.add_argument("--report",type=Path,required=True)
    args=parser.parse_args()
    m=json.loads(args.manifest.read_text())
    source=json.loads(Path("site/data/poaceae-index.json").read_text())
    site_meta=json.loads(Path("site/data/photo-license-policy.json").read_text())
    cards={x["id"]:x for x in source}
    if m["batch_id"]!="poaceae-002-2026-11-04":raise SystemExit("Unexpected batch")
    if len(m["species"])!=26 or len(set(m["species"]))!=26:raise SystemExit("Source ZIP species count mismatch")
    if m.get("original_images")!=129 or m.get("inat_count")!=93 or m.get("institutional_count")!=31 or m.get("missing_metadata_images")!=5 or m.get("missing_image_records")!=1:
        raise SystemExit("Original ZIP image and source-hold inventory mismatch")
    if len(m.get("zip_sha256",""))!=64:raise SystemExit("Invalid original ZIP SHA256")
    if site_meta.get("repository_full_name")!="Crking92/Hays-Botany-Poaceae":
        raise SystemExit("Wrong family site destination")
    current=set(); current_sources=set(); current_shas=set()
    # Scan every live panel, not merely this batch: previous sources and lookalike panels
    # can be shared across species. Do not re-download or republish an identical photo.
    for sid in m["species"]:
        if sid not in cards:raise SystemExit("Target species not in this family repo: "+sid)
    for file in Path("site/data/species").glob("*.json"):
        card=json.loads(file.read_text())
        for x in card.get("panels",[]):
            current.add((x.get("source_page"),x.get("sha256")))
            if x.get("source_page"): current_sources.add(x["source_page"])
            if x.get("sha256"): current_shas.add(x["sha256"])
    # Photos can also already be in approved intake or public species content.
    for file in Path("photo-intake/approved").glob("*/*.json"):
        try:
            x=json.loads(file.read_text())
            if x.get("source_page"):current_sources.add(x["source_page"])
            if x.get("sha256"):current_shas.add(x["sha256"])
        except Exception:raise SystemExit("Unreadable pre-existing approved-photo metadata")
    report=[];seen=set()
    records=list(decode(m))
    if len(records)!=93:raise SystemExit("Source records do not match uploaded original ZIP inventory")
    for sid,pid,oid,sha,ext in records:
        row={"species_id":sid,"photo_id":pid,"observation_id":oid}
        try:
            if (sid,pid) in seen:raise ValueError("Duplicate original photo ID")
            seen.add((sid,pid))
            src=f"https://www.inaturalist.org/photos/{pid}"
            if src in current_sources or (src,sha) in current or sha in current_shas:
                row["status"]="ALREADY_PUBLISHED"
                report.append(row);continue
            obs_json=json.loads(grab(f"https://api.inaturalist.org/v1/observations/{oid}",5_000_000))
            obs=next((x for x in obs_json.get("results",[]) if int(x.get("id",-1))==oid),None)
            if obs is None:raise ValueError("Source observation not found")
            name=str((obs.get("taxon") or {}).get("name") or "")
            if not matches(sid,name):raise ValueError("Species name/synonym needs later review: "+name)
            photo=next((x for x in obs.get("photos",[]) if int(x.get("id",-1))==pid),None)
            if photo is None:raise ValueError("Individual photo not found on observation")
            code=str(photo.get("license_code") or "").lower().replace("_","-")
            if code not in LICENSES:raise ValueError("Unsupported/unknown individual source license: "+code)
            license_name,license_url=LICENSES[code]
            is_nc=code in {"cc-by-nc","cc-by-nc-sa"}
            if is_nc and site_meta.get("noncommercial_educational_use") is not True:
                raise ValueError("Site has not explicitly enabled noncommercial-only images")
            attribution=str(photo.get("attribution") or "").strip()
            attribution_origin="live iNaturalist API"
            if not attribution or attribution.lower() in {"no rights reserved","some rights reserved"}:
                attribution=str(m.get("source_metadata_credits",{}).get(str(pid)) or "").strip()
                attribution_origin="original user ZIP credit record"
                if not attribution:raise ValueError("Neither live provider nor original ZIP establishes creator credit")
            if len(attribution)>400:raise ValueError("Unreasonable credit length")
            url=f"https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/original.{ext}"
            img=grab(url,25*1024*1024)
            if hashlib.sha256(img).hexdigest()!=sha:raise ValueError("Exact source original SHA256 differs from supplied ZIP")
            with Image.open(io.BytesIO(img)) as image:
                if image.format!=("PNG" if ext=="png" else "JPEG") or image.width*image.height>80_000_000:raise ValueError("Invalid original photo")
                image.verify()
            filename=f"inat-{pid}.{ext}"
            folder=args.source_root/"photo-intake/approved"/sid
            folder.mkdir(parents=True,exist_ok=True)
            (folder/filename).write_bytes(img)
            sidecar={
               "species_id":sid,"photo_file":filename,
               "status":"APPROVED_FOR_PUBLIC_FAMILY_SITE",
               "rights_approved_for_public":True,"taxon_reviewed":True,
               "approval_mode":"OWNER_STANDING_PHOTO_FIRST_POLICY",
               "policy_ref":"PHOTO_FIRST_PUBLIC_GALLERY_POLICY_2026-11-02",
               "review_operator":"Hays Botany Poaceae_002 exact-source and contact-sheet verifier",
               "source_review_evidence":f"Live iNaturalist observation {oid}, photo {pid}, individual license {code}, exact source photo URL. Source media SHA256 matches supplied original ZIP: {sha}. Credit evidence: {attribution_origin}.",
               "taxon_review_evidence":f"Two contact sheets of all 26 Poaceae_002 species visually checked for obvious misassigned images; specialist diagnostic grass morphology is deferred. Live source name {name} maps to indexed species {sid}; specialist morphology and BONAP range deferred.",
               "approval_note":"Owner standing photo-first authorization: original image, live photo-specific source reuse rights, and basic species assignment verified. Detailed plant anatomy deferred.",
               "creator":attribution,"source_page":src,"source_page_is_exact":True,
               "license":license_name,"license_url":license_url,
               "noncommercial_site_use_confirmed":True,
               "role":"General field grass photograph; additional habit or inflorescence view, detailed diagnostic anatomy deferred",
               "modifications":"Original source photo, no edits",
               "sha256":sha
            }
            (folder/(filename+".json")).write_text(json.dumps(sidecar,indent=2)+"\n")
            row["status"]="ORIGINAL_AND_RIGHTS_VERIFIED"
            row["license"]=license_name
        except Exception as err:
            row.update(status="HELD",reason=str(err)[:450])
        print(json.dumps(row),flush=True)
        report.append(row)
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps({"batch":m["batch_id"],"original_zip_sha256":m["zip_sha256"],
                    "library_backup":"Owner-original Poaceae_002.zip remains offline", "institutional_photo_holds":31,"missing_metadata_photo_holds":5,"missing_original_photo_records":1,"results":report},indent=2)+"\n")
    counts={s:sum(x["status"]==s for x in report) for s in ("ORIGINAL_AND_RIGHTS_VERIFIED","ALREADY_PUBLISHED","HELD")}
    print("POACEAE_002_SOURCE_RESULTS",json.dumps({**counts,"INSTITUTIONAL_HELD":31,"MISSING_METADATA_HELD":5,"MISSING_IMAGE_FILE":1}),flush=True)
if __name__=="__main__":main()
