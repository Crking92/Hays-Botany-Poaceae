#!/usr/bin/env python3
"""Offline, nondestructive release-gate census for the staged Poaceae Learner.

This does NOT authorize publication. It records every integrity, attribution,
image-resolution, overlay and cross-family navigation concern separately from
pass/fail tests. Source and copied photos remain unchanged.
"""
from __future__ import annotations
from collections import Counter,defaultdict
from hashlib import sha1
from pathlib import Path
from PIL import Image,UnidentifiedImageError
import json,re,sys,argparse

IMG_EXT={".jpg",".jpeg",".png",".webp",".gif",".tif",".tiff"}
CC_RE=re.compile(r"^\s*(?:cc[- ]?(?:0|by(?:[- ]?(?:nc(?:[- ]sa)?|sa))?)|public domain|pd[- ]?mark)",re.I)
DENY_RE=re.compile(r"all rights reserved|private.?study|not cleared|not verified|held|permission required|site specific|no public",re.I)
def loaded(p):
    return json.loads(p.read_text(encoding="utf-8"))
def blob_hash(p):
    size=p.stat().st_size
    h=sha1(b"blob "+str(size).encode("ascii")+b"\0")
    with p.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):h.update(chunk)
    return h.hexdigest(),size
def short_details(data,n=15):
    return {"count":len(data),"samples":data[:n]}
def audit(root:Path, site:Path):
    root=root.resolve();site=site.resolve()
    ledger=loaded(root/"migration/source-file-ledger.json")
    status=loaded(root/"migration/poaceae-transfer-status.json")
    original=loaded(root/"migration/poaceae-source-manifest-20261028.json")
    assert len(ledger)==len(original["files"])==1402
    assert len(set(i["path"] for i in ledger))==1402
    assert all(i["path"].startswith("content/taxa/Poaceae/") for i in ledger)
    copied=[x for x in ledger if x["disposition"]!="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]
    held=[x for x in ledger if x["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]
    allowed={x["path"] for x in ledger if x["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
    assert len(copied)==1178 and len(held)==224 and len(allowed)==788
    problems=defaultdict(list);review=defaultdict(list);summary=Counter()
    bypath={i["path"]:i for i in ledger}
    for i in copied:
        f=root/i["path"]
        if not f.is_file():problems["missing_copied_file"].append(i["path"]);continue
        h,size=blob_hash(f)
        if h!=i["git_blob_sha"] or size!=i["bytes"]:
            problems["source_checksum_mismatch"].append(i["path"])
    for i in held:
        if (root/i["path"]).exists():problems["held_image_in_public_repository"].append(i["path"])
        if (site/i["path"]).exists():problems["held_image_in_preview_site"].append(i["path"])
    for i in copied:
        if (site/i["path"]).exists() and i["path"].endswith("/species.json"):
            problems["raw_canonical_species_json_published"].append(i["path"])

    cards=sorted((root/"content/taxa/Poaceae").rglob("species.json"))
    index=loaded(site/"data/poaceae-index.json")
    assert len(cards)==112 and len(index)==112
    idxids={r["id"] for r in index}
    credits=defaultdict(list)
    local_source_refs=defaultdict(list)
    original_panels=0
    source_markers=0
    for cp in cards:
        card=loaded(cp)
        sid=card.get("id",cp.parent.name)
        if sid not in idxids:problems["missing_species_index_entry"].append(sid)
        for im in card.get("images",[]):
            path=im.get("file")
            if not isinstance(path,str):continue
            if path.startswith(("http://","https://")):continue
            local=(cp.parent/path).resolve()
            try:relative=local.relative_to(root).as_posix()
            except ValueError:continue
            local_source_refs[relative].append(sid)
            if relative in allowed:credits[relative].append((sid,im))
        panels=(card.get("visual_comparison") or {}).get("items") or []
        for p in panels:
            original_panels+=1
            source_markers+=len(p.get("markers") or [])
        card_preview=site/"data/species"/(sid+".json")
        if not card_preview.is_file():
            problems["missing_species_preview"].append(sid);continue
        data=loaded(card_preview)
        if not data.get("preview_only"):problems["species_exposed_as_production"].append(sid)
        summary["source_species"]+=1
        summary["source_photo_records"]+=len(card.get("images",[]))
        summary["source_panels"]+=len(panels)
        summary["source_markers"]+=sum(len(p.get("markers") or []) for p in panels)
        summary["preview_panels"]+=len(data["panels"])
        summary["preview_markers"]+=sum(len(p.get("markers") or []) for p in data["panels"])
        if not data["panels"]:review["species_without_local_panels"].append(sid)
        if not data["tiles"]:review["species_without_field_id_tiles"].append(sid)
        if not data["steps"]:review["species_without_beginner_steps"].append(sid)
        if len(panels)>len(data["panels"]):
            review["reduced_panel_coverage"].append({"species":sid,"source":len(panels),"preview":len(data["panels"]),"missing":len(panels)-len(data["panels"])})
        for p in data["panels"]:
            rel=p.get("src","")
            if rel not in allowed:problems["unapproved_preview_image_reference"].append({"species":sid,"path":rel})
            if not (site/rel).is_file():problems["broken_preview_image_path"].append({"species":sid,"path":rel})
            lic=str(p.get("license") or "")
            author=str(p.get("creator") or "")
            origin=str(p.get("source_page") or "")
            if not author.strip() or author.lower().strip() in {"unknown","none","?"}:
                review["blank_or_unknown_photo_creator"].append({"species":sid,"path":rel,"value":author})
            if not CC_RE.match(lic) or DENY_RE.search(lic):
                review["ambiguous_photo_license"].append({"species":sid,"path":rel,"value":lic})
            if not origin.startswith("https://"):
                review["photo_source_not_https"].append({"species":sid,"path":rel,"source":origin})
            if "nc" in lic.lower() or "noncommercial" in lic.lower():
                summary["cc_noncommercial_panels"]+=1
            if "sa" in lic.lower() or "sharealike" in lic.lower():
                summary["cc_sharealike_panels"]+=1
            for m in p.get("markers") or []:
                coords=[m.get(k) for k in ("target_x","target_y","label_x","label_y")]
                if not all(isinstance(z,(int,float)) and 0<=z<=100 for z in coords):
                    problems["invalid_marker_coordinates"].append({"species":sid,"image":rel,"marker":m})
                if not str(m.get("label") or "").strip():
                    review["missing_marker_label"].append({"species":sid,"image":rel})

    for rel in sorted(allowed):
        if rel not in credits:problems["copied_image_lacks_source_metadata"].append(rel)
        else:
            for sid,im in credits[rel]:
                license_=str(im.get("license") or "")
                if im.get("site_specific_public_permission"):
                    problems["site_specific_grant_migrated"].append({"species":sid,"path":rel})
                if DENY_RE.search(license_+" "+str(im.get("public_reuse") or "")):
                    problems["explicit_hold_migrated"].append({"species":sid,"path":rel})
                if not CC_RE.match(license_):
                    review["source_record_ambiguous_license"].append({"species":sid,"path":rel,"license":license_})
    for rel in sorted(allowed):
        f=root/rel
        try:
            with Image.open(f) as im:
                dims=im.size
                im.verify()
            summary["images_decoded"]+=1
            if min(dims)<500:
                review["image_short_edge_under_500px"].append({"path":rel,"dimensions":dims})
            if min(dims)<800:
                review["image_short_edge_under_800px"].append({"path":rel,"dimensions":dims})
        except (OSError,ValueError,UnidentifiedImageError) as e:
            problems["undecodable_image"].append({"path":rel,"reason":str(e)[:130]})
    # Every physical candidate copied, every held photo withheld; no arbitrary
    # third-party media in generated preview.
    seen_photos={f.relative_to(site).as_posix() for f in site.rglob("*")
                 if f.is_file() and f.suffix.lower() in IMG_EXT}
    if seen_photos!=allowed:
        problems["image_set_mismatch"].append({"missing":sorted(allowed-seen_photos)[:10],
                                               "unexpected":sorted(seen_photos-allowed)[:10]})
    if not (site/"index.html").exists() or not (site/"app.js").exists():
        problems["preview_frontend_missing"].append("HTML or JS")
    size=sum(f.stat().st_size for f in site.rglob("*") if f.is_file())
    summary["preview_size_bytes"]=size
    summary["copied_files"]=len(copied)
    summary["held_files"]=len(held)
    summary["source_canonical_files"]=len(ledger)
    summary["accepted_photo_files"]=len(allowed)
    summary["source_licensed_local_image_records"]=sum(len(x) for x in credits.values())
    summary["source_panels_count_direct"]=original_panels
    summary["source_arrow_count_direct"]=source_markers
    if size>=850_000_000:problems["preview_exceeds_850mb_site_safety_budget"].append(size)
    # Pending portal integration cannot be green on a standalone static stub.
    integration={
        "shared_glossary_links":"NOT_VERIFIED",
        "universal_quiz_integration":"NOT_IMPLEMENTED",
        "cross_family_references":"NOT_VERIFIED",
        "mobile_browser_smoke_test":"NOT_RUN_BY_THIS_TOOL",
        "actual_anatomical_arrow_pixel_accuracy":"REQUIRES_HUMAN_VISUAL_REVIEW",
        "photograph_license_source_website_check":"REQUIRES_ITEM_BY_ITEM_REVIEW",
        "new_destination_pages":"NOT_DEPLOYED"
    }
    return {
       "gate":"PREPUBLICATION_COMPREHENSIVE_NONDESTRUCTIVE_CENSUS",
       "snapshot_commit":status["source_commit"],
       "integrity":"PASS" if not problems else "FAIL",
       "releasable":False,
       "counts":dict(summary),
       "hard_errors":{k:short_details(v) for k,v in sorted(problems.items())},
       "manual_review":{k:short_details(v) for k,v in sorted(review.items())},
       "integration":integration,
       "note":"This static audit validates source hashes, metadata, path integrity, image decodability, marker coordinate bounds, and size. It does NOT establish that the anatomical arrows point to the right visible structures or that the actual photographer authorized reuse on a different public Pages website."
    }
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo",type=Path,default=Path("."))
    p.add_argument("--site",type=Path,default=Path("dist"))
    p.add_argument("--report",type=Path,default=Path("qa-report/poaceae-release-gates.json"))
    a=p.parse_args()
    x=a.repo.resolve();site=(x/a.site).resolve();out=(x/a.report).resolve()
    report=audit(x,site)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("GATE_SUMMARY",json.dumps({
      "integrity":report["integrity"],"releasable":report["releasable"],
      "counts":report["counts"],
      "hard_error_counts":{k:v["count"] for k,v in report["hard_errors"].items()},
      "manual_review_counts":{k:v["count"] for k,v in report["manual_review"].items()},
      "integration":report["integration"]},ensure_ascii=False),flush=True)
    if report["hard_errors"]:
        raise SystemExit("HARD GATES FAILED: investigate report")
if __name__=="__main__":
    main()
