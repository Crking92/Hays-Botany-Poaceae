#!/usr/bin/env python3
"""Loss-audited, non-destructive Poaceae transfer into a staging repository.

The old source repository is *never* modified. Every source file is accounted
for; only broadly licensed source photos are candidates for copying into this
public repo. Staging is not license clearance or website publication.
"""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
from hashlib import sha1
import json
from pathlib import Path
import re
import shutil
import sys

FAMILY = "content/taxa/Poaceae/"
PHOTO = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif"}
LICENSE = re.compile(r"^\s*(?:cc\s*[- ]?(?:0|by(?:[- ]?(?:sa|nc|nc[- ]?sa))?)\b|public domain\b|pd[- ]?mark\b)", re.I)
DENY = re.compile(r"held|not verified|not cleared|private.?study|all rights reserved|copyright|permission required|study only|no public|pending", re.I)

def blob_sha(path: Path) -> tuple[str, int]:
    """Hash actual file bytes the same way Git does, using a streaming pass."""
    size = path.stat().st_size
    h = sha1()
    h.update(b"blob " + str(size).encode("ascii") + b"\0")
    with path.open("rb") as inp:
        while True:
            b = inp.read(1024 * 1024)
            if not b:
                break
            h.update(b)
    return h.hexdigest(), size

def main() -> None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source",type=Path,required=True)
    parser.add_argument("--destination",type=Path,required=True)
    parser.add_argument("--manifest",type=Path,required=True)
    a=parser.parse_args()
    src=a.source.resolve()
    dest=a.destination.resolve()
    manifest=json.loads(a.manifest.read_text(encoding="utf-8"))
    assert manifest["schema"]=="hays-poaceae-source-baseline-v1"
    assert manifest["snapshot_commit"]=="d5812999ea32d03b873110db1a526e20ac6ea730"
    expected=manifest["files"]
    assert len(expected)==manifest["file_count"]==1402
    assert sum(i["bytes"] for i in expected)==manifest["total_bytes"]==434996996
    known={i["path"]:i for i in expected}
    assert len(known)==len(expected)

    # Fail before any destination modification if *any* source file changed,
    # disappeared, or acquired an unexpected blob SHA since snapshot.
    for i in expected:
        path=i["path"]
        if not path.startswith(FAMILY) or ".." in Path(path).parts:
            raise RuntimeError("Unexpected source path "+path)
        f=src / path
        if not f.is_file():
            raise RuntimeError("Missing source: "+path)
        sha,size=blob_sha(f)
        if sha != i["git_blob_sha"] or size!=i["bytes"]:
            raise RuntimeError("Source SHA/size mismatch: "+path)
    print("SOURCE_SNAPSHOT_VERIFIED",len(expected),manifest["total_bytes"],flush=True)

    sys.path.insert(0,str(src / "scripts"))
    from build_public_pages_snapshot import rights

    accepted=set()
    held_by_path=defaultdict(set)
    source_photos=Counter()
    record_decisions=[]
    for i in expected:
        if not i["path"].endswith("/species.json"):
            continue
        card=json.loads((src / i["path"]).read_text(encoding="utf-8"))
        for photo in card.get("images",[]):
            filename=photo.get("file")
            category="unsuitable"
            relpath=""
            if not isinstance(filename,str) or not filename.strip():
                category="missing_or_invalid_file_path"
            elif filename.startswith(("https://","http://")):
                category="external_url_stays_as_metadata"
            else:
                f=(src / Path(i["path"]).parent / filename).resolve()
                try:
                    relpath=f.relative_to(src).as_posix()
                except ValueError:
                    category="escapes_source_repository"
                else:
                    if not relpath.startswith(FAMILY) or relpath not in known:
                        category="outside_pinned_poaceae_snapshot"
                    else:
                        lic=str(photo.get("license") or "")
                        reuse=str(photo.get("public_reuse") or "")
                        if photo.get("site_specific_public_permission"):
                            category="site_specific_permission_review"
                        elif DENY.search(lic+" "+reuse):
                            category="explicit_reuse_hold"
                        elif not LICENSE.search(lic):
                            category="missing_general_reuse_license"
                        else:
                            permitted,reason=rights(photo,True)
                            category="license_candidate" if permitted else "rights_preflight_hold:"+str(reason)[:75]
                        if category=="license_candidate":
                            accepted.add(relpath)
                        else:
                            held_by_path[relpath].add(category)
            source_photos[category]+=1
            record_decisions.append({
                "species":card.get("id"),"source_file":filename,"resolved_path":relpath,
                "decision":category,"creator":photo.get("creator"),
                "license":photo.get("license"),"source_page":photo.get("source_page")
            })

    # Conservative conflict handling: if two records disagree about same file,
    # the entire file waits for manual review instead of silently being copied.
    conflicting=accepted.intersection(held_by_path)
    accepted-=conflicting

    rows=[]
    status_counts=Counter()
    written=0
    for i in expected:
        path=i["path"]
        is_photo=Path(path).suffix.lower() in PHOTO
        if not is_photo:
            disposition="SOURCE_DATA_COPIED"
        elif path in accepted:
            disposition="LICENSE_CANDIDATE_IMAGE_COPIED"
        else:
            disposition="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"
        should_copy=not is_photo or path in accepted
        if should_copy:
            dst=dest/path
            dst.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(src/path,dst)
            sha,size=blob_sha(dst)
            if sha!=i["git_blob_sha"] or size!=i["bytes"]:
                raise RuntimeError("Destination checksum mismatch: "+path)
            written+=size
        rows.append({**i,"disposition":disposition,
                     "hold_reasons":sorted(held_by_path.get(path,set()))})
        status_counts[disposition]+=1
    assert written>0
    assert sum(status_counts.values())==1402
    assert status_counts["LICENSE_CANDIDATE_IMAGE_COPIED"]==788, status_counts
    assert status_counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]==224, status_counts
    assert status_counts["SOURCE_DATA_COPIED"]==390, status_counts
    assert len(record_decisions)==1026

    # Zero forbidden source images in the destination, including any leftover
    # media from an earlier attempt. Only the 792 explicit candidate photos
    # can exist here. The site is not to be published at this stage.
    found=set()
    for f in (dest/FAMILY).rglob("*"):
        if f.is_file() and f.suffix.lower() in PHOTO:
            found.add(f.relative_to(dest).as_posix())
    assert found==accepted, {
      "extra":sorted(found-accepted)[:6], "missing":sorted(accepted-found)[:6]
    }

    report={
      "stage":"STAGING_ONLY_NOT_PUBLISHED",
      "source_repository":"Crking92/Hays-County-Botany",
      "source_commit":manifest["snapshot_commit"],
      "original_source_files":1402,
      "original_source_bytes":434996996,
      "destination_file_counts":dict(status_counts),
      "destination_bytes_copied":written,
      "source_image_record_classification":dict(source_photos),
      "conflicting_source_license_paths":sorted(conflicting),
      "source_image_records":len(record_decisions),
      "file_level_checksum_passed":True,
      "source_preserved":True,
      "no_original_deletion":True,
      "external_and_held_image_metadata_remains_in_species_json":True,
      "website_enabled":False,
      "species_json_originals_unchanged":True,
      "pending_checks":[
         "Exact license/source metadata and NC use review for all migrated images",
         "Check 220 held/unreferenced images against original-only archive",
         "Sanitize published species.json galleries to avoid broken/restricted image references",
         "Verify all arrows point at actual pictured structures",
         "Implement family frontend and cross-family links, glossary, universal search and quiz",
         "Final sync to newest main after staged source snapshot",
         "Verify mobile Pages before cutover"
       ],
      "note":"This staging data retains raw canonical species metadata (including references to excluded photos); it is NOT a website-ready or rights-cleared release."
    }
    folder=dest/"migration"
    folder.mkdir(parents=True,exist_ok=True)
    (folder/"source-file-ledger.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (folder/"image-record-review-ledger.json").write_text(json.dumps(record_decisions,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (folder/"poaceae-transfer-status.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("POACEAE_TRANSFER_REPORT",json.dumps(report,ensure_ascii=False),flush=True)

if __name__=="__main__":
    main()
