#!/usr/bin/env python3
"""Fail-closed individual GBIF media-rights and original hash verifier for
Poaceae_001 herbarium specimens. This does not loosen the public image gate.
"""
import argparse,datetime as dt,hashlib,io,json,re,subprocess,sys,tempfile,time,urllib.request
from pathlib import Path
from PIL import Image,ImageOps

LICENSES={
 "CC BY 4.0":"https://creativecommons.org/licenses/by/4.0/",
 "CC BY-NC 4.0":"https://creativecommons.org/licenses/by-nc/4.0/",
}
Image.MAX_IMAGE_PIXELS=150_000_000
def fetch(url,maxbytes):
    last=None
    for i in range(2):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanySourceVerifiedGBIFPhoto/1.0"})
            with urllib.request.urlopen(req,timeout=35) as f:data=f.read(maxbytes+1)
            if len(data)>maxbytes:raise ValueError("Exceeded 25 MB source cap")
            return data
        except Exception as exc:
            last=exc
            if i<1:time.sleep(3)
    raise last
def norm(s):
    return re.sub(r"[^a-z0-9]+"," ",str(s).lower()).strip()
def optimize(data):
    with Image.open(io.BytesIO(data)) as im:
        if im.format!="JPEG" or im.width*im.height>150_000_000:
            raise ValueError("Unexpected format or unsafe size")
        im.load();im=ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((2600,2600),Image.Resampling.LANCZOS)
        out=io.BytesIO();im.save(out,format="JPEG",quality=88,optimize=True,progressive=True)
        return out.getvalue()
def main():
    a=argparse.ArgumentParser()
    a.add_argument("--manifest",required=True);a.add_argument("--site-root",required=True);a.add_argument("--report",required=True)
    args=a.parse_args()
    root=Path(args.site_root)
    site_policy=json.loads((root/"data/photo-license-policy.json").read_text())
    assert site_policy["repository_full_name"]=="Crking92/Hays-Botany-Poaceae"
    list_ids={x["id"] for x in json.loads((root/"data/poaceae-index.json").read_text())}
    records=json.loads(Path(args.manifest).read_text())
    assert records["batch"]=="Poaceae_001_institutional"
    audit=[]
    with tempfile.TemporaryDirectory(prefix="grass-gbif-") as tmp:
        source=Path(tmp)
        for item in records["records"]:
            sid=item["species_id"]
            gid=item["gbif_id"]
            status={"species_id":sid,"gbif_id":gid,"status":"HELD"}
            try:
                if sid not in list_ids:raise ValueError("Species not indexed")
                if item["license"] not in LICENSES:
                    raise ValueError("Unimplemented original exact-license version; preserve as held")
                if item["license"]=="CC BY-NC 4.0" and not site_policy["noncommercial_educational_use"]:
                    raise ValueError("NC permission not confirmed for this site")
                photo_path="https://www.gbif.org/occurrence/"+str(gid)
                card=json.loads((root/"data/species"/(sid+".json")).read_text())
                if any(p.get("sha256")==item["original_sha256"] or p.get("source_page")==photo_path for p in card.get("panels",[])):
                    status["status"]="ALREADY_PUBLISHED";audit.append(status);continue
                obs=json.loads(fetch("https://api.gbif.org/v1/occurrence/"+str(gid),3_000_000))
                name=norm(obs.get("species") or obs.get("scientificName") or "")
                expected=norm(sid.replace("-"," "))
                if not (name==expected or name.startswith(expected+" ")):
                    raise ValueError("GBIF current species determination differs: "+name)
                matching=[m for m in (obs.get("media") or []) if m.get("identifier")==item["image_url"]]
                if len(matching)!=1:raise ValueError("Exact institutional media identifier not available in live GBIF occurrence")
                med=matching[0]
                license_url=str(med.get("license") or "").replace("http://","https://").rstrip("/")
                if license_url!=LICENSES[item["license"]].rstrip("/"):
                    raise ValueError("Photo-level GBIF license conflicts or is unspecified: "+license_url)
                credit=" ".join(str(med.get(k) or "") for k in ("creator","rightsHolder","publisher")).strip()
                creator=item["creator"]
                important=[v for v in re.split(r"\W+",creator.lower()) if len(v)>5]
                if important and not any(word in credit.lower() for word in important):
                    raise ValueError("Institutional photo creator or rights holder not established: "+credit)
                original=fetch(item["image_url"],25*1024*1024)
                if hashlib.sha256(original).hexdigest()!=item["original_sha256"]:
                    raise ValueError("Exact source JPEG differs from uploaded ZIP SHA-256")
                image=optimize(original)
                if len(image)>25*1024*1024:raise ValueError("Site copy is too large")
                filename=f"gbif-{gid}.jpg"
                dst=source/"photo-intake/approved"/sid
                dst.mkdir(parents=True,exist_ok=True)
                (dst/filename).write_bytes(image)
                side={
                    "species_id":sid,"photo_file":filename,
                    "status":"APPROVED_FOR_PUBLIC_FAMILY_SITE","rights_approved_for_public":True,"taxon_reviewed":True,
                    "approval_mode":"OWNER_STANDING_PHOTO_FIRST_POLICY",
                    "policy_ref":"PHOTO_FIRST_PUBLIC_GALLERY_POLICY_2026-11-02",
                    "review_operator":"Automated exact GBIF image-license source and original user ZIP SHA-256 verifier with contact-sheet review",
                    "approval_note":"Individual GBIF media license, current taxon identification, institutional provider and original image hash checked.",
                    "source_review_evidence":f"GBIF occurrence {gid} exact photo identifier {item['image_url']}; current media license {license_url}; provider {credit}; original ZIP SHA256 {item['original_sha256']}; check date {dt.datetime.now(dt.timezone.utc).isoformat()}.",
                    "taxon_review_evidence":f"Basic visual contact-sheet review of the supplied Poaceae herbarium specimen; live GBIF occurrence species {name} matches indexed {expected}. Pressed specimen only; full voucher label and diagnostic re-identification deferred.",
                    "creator":creator,"source_page":photo_path,"source_page_is_exact":True,
                    "license":item["license"],"license_url":LICENSES[item["license"]],
                    "noncommercial_site_use_confirmed":True,
                    "role":"General herbarium specimen — diagnostic label verification deferred",
                    "caption":"Source-identified pressed grass specimen. Compare field photographs and the original voucher.",
                    "modifications":"Downsampled to 2600px maximum, JPEG quality 88, EXIF removed; original specimen not cropped or annotated",
                    "sha256":hashlib.sha256(image).hexdigest()
                }
                (dst/(filename+".json")).write_text(json.dumps(side,ensure_ascii=False,indent=2))
                status.update(status="SOURCE_RIGHTS_AND_IMAGE_VERIFIED",license=item["license"])
            except Exception as error:
                status["reason"]=str(error)[:450]
            audit.append(status)
            print(json.dumps(status),flush=True)
        ready=sum(x["status"]=="SOURCE_RIGHTS_AND_IMAGE_VERIFIED" for x in audit)
        report={"batch":records["batch"],"source_zip_sha256":records["source_zip_sha256"],
                "records_checked":len(audit),"source_verified":ready,"installed":0,"results":audit}
        if ready:
            cmd=[sys.executable,"scripts/publish_approved_grass_photos.py","--source-root",str(source),"--site-root",str(root)]
            for extra in (["--check"],[]):
                run=subprocess.run(cmd+extra,text=True,capture_output=True)
                if run.returncode:
                    report["publisher_error"]=run.stdout+"\n"+run.stderr
                    break
                if not extra:report["installed"]=json.loads(run.stdout)["installed"]
        Path(args.report).parent.mkdir(parents=True,exist_ok=True)
        Path(args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
        print("POACEAE_001_INSTITUTIONAL_SUMMARY",json.dumps({k:report[k] for k in ("records_checked","source_verified","installed")}),flush=True)
        if report.get("publisher_error"):raise SystemExit(2)
if __name__=="__main__":main()
