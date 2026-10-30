#!/usr/bin/env python3
"""Add source-reviewed grass photographs as NEW panels, preserving every old tile/arrow.

Main-branch intake photo-intake/approved/<species>/<image> plus image.json.
Never overwrites existing lessons, panels or the older original learner.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
from publish_approved_family_photos import read_approved, load, save, blob_sha, fail

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--source-root",type=Path,required=True)
    ap.add_argument("--site-root",type=Path,required=True)
    ap.add_argument("--check",action="store_true")
    args=ap.parse_args()
    source=args.source_root.resolve();site=args.site_root.resolve()
    inbox=source/"photo-intake/approved"
    if not inbox.exists():
        print(json.dumps({"status":"NO_APPROVED_INTAKE","installed":0}))
        return
    if inbox.is_symlink() or not inbox.is_dir():fail("Unsafe intake directory")
    for item in inbox.rglob("*"):
        if item.is_symlink():fail("Symlinks forbidden")
        if item.is_file() and item.suffix.lower() in {".jpg",".jpeg",".png",".webp"} and not item.with_name(item.name+".json").is_file():
            fail("Unapproved photo without matching metadata: "+str(item))
        if item.is_file() and item.name.endswith(".json") and not item.with_suffix("").is_file():
            fail("Photo metadata lacks the original image file: "+str(item))
    index_path=site/"data/poaceae-index.json"
    gallery_path=site/"data/gallery-index.json"
    index=load(index_path);gallery=load(gallery_path)
    by_id={row["id"]:row for row in index}
    if len(index)!=len(by_id) or len(index)!=112 or gallery.get("species")!=112 or set(gallery["entries"])!=set(by_id):
        fail("Grass release inventory changed; do not invent species or rewrite panels")
    if gallery["status"]!="EXISTING_ONLY_SOURCE_CREDITED_EDUCATIONAL_RIGHTS_SCREENED":
        fail("Unknown current grass photo publication policy")
    changed={}
    pending=[]
    added=[]
    for sidecar in sorted(inbox.glob("*/*.json")):
        sid=sidecar.parent.name
        if sid not in by_id:fail("Species not in grass learner: "+sid)
        meta,image,payload,sha256=read_approved(source,sid,sidecar)
        dest=site/"media"/sid/image.name
        if not dest.resolve().is_relative_to((site/"media").resolve()):fail("Unsafe destination")
        if dest.exists() and (dest.is_symlink() or dest.read_bytes()!=payload):fail("Image name collision")
        record_path=site/"data/species"/(sid+".json")
        if sid not in changed:changed[sid]=load(record_path)
        record=changed[sid]
        if record.get("id")!=sid:fail("Wrong species card")
        panels=record.get("panels")
        if not isinstance(panels,list):fail("Invalid grass anatomy panel list")
        url="media/"+sid+"/"+image.name
        old=next((p for p in panels if p.get("src")==url),None)
        if old:
            if old.get("source_blob_sha")!=blob_sha(payload) or old.get("creator")!=meta["creator"] or old.get("license")!=meta["license"]:
                fail("Existing published grass panel differs: "+sid)
            if not dest.is_file():fail("Missing existing panel photo")
            continue
        if any(p.get("source_blob_sha")==blob_sha(payload) for p in panels):
            fail("Exact image already published for this species")
        role=meta["role"].strip()
        panel={"label":role,"src":url,"caption":meta.get("caption") or role,
               "creator":meta["creator"].strip(),"license":meta["license"],
               "license_url":meta["license_url"],"source_page":meta["source_page"],
               "source_page_is_exact":True,"modifications":meta.get("modifications") or "Unmodified credited original",
               "photo_role":"TARGET_SPECIES_SOURCE","source_species_id":sid,
               "publication_status":"APPROVED_PUBLIC_FAMILY_PHOTO",
               "source_blob_sha":blob_sha(payload),"sha256":sha256,
               "approval_note":meta["approval_note"],"approved_by":meta["approved_by"],
               "markers":[]}
        panels.append(panel)
        row=by_id[sid]
        row["local_panel_count"]=len(panels)
        row["target_species_source_panels"]=int(row.get("target_species_source_panels") or 0)+1
        slot=gallery["entries"][sid]
        slot["count"]=len(panels)
        slot["target_species_source_panels"]=int(slot.get("target_species_source_panels") or 0)+1
        if not slot.get("first_src"):slot["first_src"]=url
        if not dest.is_file():pending.append((dest,payload))
        added.append({"species_id":sid,"photo":url})
    if not added:
        print(json.dumps({"status":"NO_NEW_APPROVED_PHOTOS","installed":0}))
        return
    gallery["photo_panels"]=sum(len(changed[x["id"]]["panels"]) if x["id"] in changed else len(load(site/"data/species"/(x["id"]+".json"))["panels"]) for x in index)
    gallery["photo_files"]=int(gallery["photo_files"])+len(pending)
    gallery["photo_species"]=sum(x["count"]>0 for x in gallery["entries"].values())
    if any(by_id[sid]["local_panel_count"]!=gallery["entries"][sid]["count"] for sid in by_id):
        fail("Grass index/panel mismatch")
    result={"status":"CHECK_PASSED" if args.check else "PUBLISHED_SITE_SOURCE_UPDATED",
            "installed":len(added),"new_panels":len(added),"photo_panels":gallery["photo_panels"],
            "added":added}
    if not args.check:
        for dst,data in pending:
            dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
        for sid,record in changed.items():save(site/"data/species"/(sid+".json"),record)
        save(index_path,index);save(gallery_path,gallery)
    print(json.dumps(result,indent=2))
if __name__=="__main__":
    try:main()
    except (ValueError,KeyError,TypeError,RuntimeError) as exc:
        print(str(exc),flush=True)
        raise SystemExit(2)
