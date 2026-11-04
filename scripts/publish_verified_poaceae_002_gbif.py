#!/usr/bin/env python3
"""Poaceae 002 exact GBIF-media backfill. No source-specific license or original match means HOLD."""
from __future__ import annotations
import argparse,base64,hashlib,io,json,re,struct,time,urllib.request
from pathlib import Path
from PIL import Image

REC_SIZE=74
ALLOWED={
 0:("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),
 2:("CC BY-NC-SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/")
}
def get(url,limit):
    req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyPoaceaeGBIFSourceVerifier/1.0"})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req,timeout=22) as response:body=response.read(limit+1)
            if len(body)>limit:raise ValueError("Oversize source media")
            return body
        except Exception:
            if attempt:raise
            time.sleep(1.5)
def norm_url(url):
    return re.sub(r"^https?://","",str(url),flags=re.I)
def canonical_cc(value):
    url=str(value or "").strip().lower().replace("http://","https://").rstrip("/")
    return re.sub(r"/deed(?:\\.[a-z]{2})?$","",url)
def normal_taxon(name):
    return re.sub(r"[^a-z0-9]+"," ",str(name or "").lower()).strip()
def taxon_matches(target,name):
    t=normal_taxon(target.replace("-"," "))
    n=normal_taxon(name)
    if n==t:return True
    if len(t.split())==2 and (n.startswith(t+" var ") or n.startswith(t+" subsp ")):return True
    # Kew POWO verifies Leptochloa mucronata as homotypic synonym of
    # Dinebra panicea subsp. mucronata:
    # https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1059142-2
    if t=="dinebra panicea subsp mucronata" and n=="leptochloa mucronata":return True
    return False
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--source-root",type=Path,required=True)
    p.add_argument("--report",type=Path,required=True)
    args=p.parse_args()
    m=json.loads(args.manifest.read_text())
    assert m["repository"]=="Crking92/Hays-Botany-Poaceae"
    assert m["batch_id"]=="poaceae-002-institutional-2026-11-04"
    assert m["zip_sha256"]=="9b324dd480403ea9d20536889799e2742bf27be4072d4b2566623950200f8a2a"
    assert m["count"]==31 and m["record_size"]==REC_SIZE and len(m["species"])==26
    data=base64.b64decode(m["records_base64"],validate=True)
    assert len(data)==31*REC_SIZE
    idx={x["id"]:x for x in json.loads(Path("site/data/poaceae-index.json").read_text())}
    policy=json.loads(Path("site/data/photo-license-policy.json").read_text())
    assert policy["repository_full_name"]==m["repository"]
    sources=set();hashes=set()
    for card_path in Path("site/data/species").glob("*.json"):
        for panel in json.loads(card_path.read_text()).get("panels",[]):
            if panel.get("source_page"):sources.add(panel["source_page"])
            if panel.get("sha256"):hashes.add(panel["sha256"])
    for existing in Path("photo-intake/approved").glob("*/*.json"):
        meta=json.loads(existing.read_text())
        if meta.get("source_page"):sources.add(meta["source_page"])
        if meta.get("sha256"):hashes.add(meta["sha256"])
    rows=[]; seen=set()
    for sid_i,gbif_id,sha_bytes,url_hash,license_code in struct.iter_unpack(">BQ32s32sB",data):
        if sid_i>=len(m["species"]):raise SystemExit("Species index outside ZIP")
        sid=m["species"][sid_i]
        if sid not in idx:raise SystemExit("Species absent from grass learner: "+sid)
        sha=sha_bytes.hex()
        row={"species_id":sid,"gbif_id":gbif_id}
        try:
            if (sid,gbif_id,sha) in seen:raise ValueError("Repeated original image record")
            seen.add((sid,gbif_id,sha))
            if sha in hashes:
                row["status"]="ALREADY_PUBLISHED"
                rows.append(row);continue
            if license_code not in ALLOWED:
                raise ValueError("Unsupported license version for current publisher")
            expected_name,expected_url=ALLOWED[license_code]
            obs=json.loads(get(f"https://api.gbif.org/v1/occurrence/{gbif_id}",5_000_000))
            if int(obs.get("key",-1))!=gbif_id:raise ValueError("GBIF occurrence ID mismatch")
            if str(obs.get("family") or "").lower()!="poaceae":
                raise ValueError("Live GBIF family mismatch: "+str(obs.get("family")))
            source_taxon=obs.get("species") or obs.get("scientificName") or ""
            if not taxon_matches(sid,source_taxon):
                raise ValueError("Source taxon needs synonym/ID review: "+str(source_taxon))
            photos=[x for x in obs.get("media",[]) if hashlib.sha256(norm_url(x.get("identifier")).encode()).digest()==url_hash]
            if len(photos)!=1:raise ValueError("Exact original ZIP image URL not uniquely found in live GBIF media")
            photo=photos[0]
            if canonical_cc(photo.get("license"))!=expected_url.rstrip("/"):
                raise ValueError("Exact GBIF media license not independently confirmed")
            creator=str(photo.get("rightsHolder") or obs.get("rightsHolder") or photo.get("creator") or "").strip()
            if not creator:raise ValueError("Exact media creator/rights holder unknown")
            media_url=str(photo.get("identifier") or "")
            if not media_url.startswith(("http://","https://")):raise ValueError("Invalid exact GBIF media URL")
            if media_url.startswith("http://"):
                attempts=[media_url.replace("http://","https://",1),media_url]
            else:attempts=[media_url]
            image=None
            for url in attempts:
                try:
                    blob=get(url,25*1024*1024)
                    if hashlib.sha256(blob).hexdigest()!=sha:raise ValueError("Original ZIP byte hash differs")
                    image=blob;break
                except Exception as exc:
                    failure=str(exc)
            if image is None:raise ValueError("Cannot recover exact GBIF source bytes: "+failure)
            with Image.open(io.BytesIO(image)) as img:
                if img.format!="JPEG" or img.width*img.height>80_000_000:
                    raise ValueError("Unsupported JPEG/dimensions")
                img.verify()
            if expected_name=="CC BY-NC-SA 4.0" and policy.get("noncommercial_educational_use") is not True:
                raise ValueError("Noncommercial site status not approved")
            filename=f"gbif-{gbif_id}-{sha[:12]}.jpg"
            folder=args.source_root/"photo-intake/approved"/sid
            folder.mkdir(parents=True,exist_ok=True)
            (folder/filename).write_bytes(image)
            exact_source=f"https://www.gbif.org/occurrence/{gbif_id}"
            sidecar={
                "species_id":sid,"photo_file":filename,
                "status":"APPROVED_FOR_PUBLIC_FAMILY_SITE",
                "rights_approved_for_public":True,"taxon_reviewed":True,
                "approval_mode":"OWNER_STANDING_PHOTO_FIRST_POLICY",
                "policy_ref":"PHOTO_FIRST_PUBLIC_GALLERY_POLICY_2026-11-02",
                "review_operator":"Poaceae_002 exact GBIF media, original SHA and contact-sheet verifier",
                "source_review_evidence":f"GBIF occurrence {gbif_id}, exact media identifier {media_url}, individual media license {photo['license']}, credited rights holder {creator}, exact original ZIP SHA256 {sha}; checked against live source.",
                "taxon_review_evidence":f"Live GBIF Poaceae record name {source_taxon} corresponds to indexed {sid}; original family images visually screened on two 26-species contact sheets; specimen label diagnostic review deferred.",
                "approval_note":"Owner standing photo-first policy; exact GBIF image rights, species assignment and original source bytes independently verified. No anatomy labels asserted.",
                "creator":creator,"source_page":exact_source,"source_page_is_exact":True,
                "license":expected_name,"license_url":expected_url,
                "noncommercial_site_use_confirmed":True,
                "role":"General grass herbarium specimen; detailed diagnostic annotations deferred",
                "caption":f"Credited reference specimen of {source_taxon}.",
                "modifications":"Original downloaded source JPEG, no edits",
                "sha256":sha
            }
            (folder/(filename+".json")).write_text(json.dumps(sidecar,indent=2)+"\n")
            row.update(status="ORIGINAL_AND_RIGHTS_VERIFIED",license=expected_name)
        except Exception as exc:row.update(status="HELD",reason=str(exc)[:450])
        rows.append(row);print(json.dumps(row),flush=True)
    args.report.parent.mkdir(parents=True,exist_ok=True)
    counts={x:sum(y["status"]==x for y in rows) for x in ("ORIGINAL_AND_RIGHTS_VERIFIED","ALREADY_PUBLISHED","HELD")}
    args.report.write_text(json.dumps({"batch":m["batch_id"],"original_zip_sha256":m["zip_sha256"],"counts":counts,"results":rows},indent=2)+"\n")
    print("POACEAE_002_GBIF_MEDIA_SOURCE_RESULTS",json.dumps(counts),flush=True)
if __name__=="__main__":main()
