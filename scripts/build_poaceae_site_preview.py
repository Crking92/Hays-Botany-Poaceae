#!/usr/bin/env python3
"""Produce NON-DEPLOYED Poaceae Learner prototype using only copied image files.

Do not publish the raw source species JSON: it intentionally retains held-image
records for source integrity. Export safe summary JSON with only approved local
photo candidates. All source photos and canonical JSON remain unchanged.
"""
from __future__ import annotations

import argparse, json, shutil
from collections import Counter
from pathlib import Path

PHOTO_EXTS={".jpg",".jpeg",".png",".webp"}
def dump(path: Path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def normalize(value):
    if isinstance(value,str):return value
    if isinstance(value,list):return ", ".join(str(x) for x in value if x)
    return ""

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=Path("."))
    parser.add_argument("--output",type=Path,default=Path("dist"))
    a=parser.parse_args()
    root=a.root.resolve()
    out=(root/a.output).resolve()
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    report=json.loads((root/"migration/poaceae-transfer-status.json").read_text())
    ledger=json.loads((root/"migration/source-file-ledger.json").read_text())
    assert report["stage"]=="STAGING_ONLY_NOT_PUBLISHED"
    assert not report["website_enabled"]
    allowed={x["path"] for x in ledger if x["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
    held={x["path"] for x in ledger if x["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"}
    assert len(allowed)==788 and len(held)==224

    # Canonical photo records are the attribution authority, not panel prose.
    credit_by_path={}
    canonical_species=[]
    all_species=sorted((root/"content/taxa/Poaceae").rglob("species.json"))
    assert len(all_species)==112
    for path in all_species:
        d=json.loads(path.read_text(encoding="utf-8"))
        canonical_species.append((path,d))
        for photo in d.get("images",[]):
            f=photo.get("file")
            if not isinstance(f,str) or f.startswith(("https://","http://")):
                continue
            p=(path.parent/f).resolve()
            try:
                key=p.relative_to(root).as_posix()
            except ValueError:
                continue
            if key in allowed:
                c=credit_by_path.setdefault(key,[])
                c.append({"creator":normalize(photo.get("creator")),
                          "license":normalize(photo.get("license")),
                          "source_page":normalize(photo.get("source_page")),
                          "license_url":normalize(photo.get("license_url")),
                          "modifications":normalize(photo.get("modifications")),
                          "public_reuse":normalize(photo.get("public_reuse"))})
    assert set(credit_by_path)==allowed, (
      "Every copied candidate image must have at least one exact rights metadata record"
    )

    manifest=[]
    panel_count=0
    image_refs=set()
    marker_count=0
    excluded_panels=0
    no_panels=[]
    for path,d in canonical_species:
        sid=d.get("id") or path.parent.name
        genus=path.parent.parent.name
        sc=normalize(d.get("scientific_name")) or sid.replace("-"," ").title()
        common=normalize(d.get("common_name"))
        safe=[]
        for panel in d.get("visual_comparison",{}).get("items",[]):
            value=panel.get("image_url")
            if not isinstance(value,str) or value.startswith(("https://","http://")):
                excluded_panels+=1;continue
            if value.startswith("content/taxa/Poaceae/"):
                absolute=(root/value).resolve()
            else:
                absolute=(path.parent/value).resolve()
            try:
                rel=absolute.relative_to(root).as_posix()
            except ValueError:
                excluded_panels+=1;continue
            if rel not in allowed or not absolute.is_file():
                excluded_panels+=1;continue
            meta=credit_by_path[rel][0]
            markers=[]
            for m in panel.get("markers",[]) or []:
                if not isinstance(m,dict):
                    continue
                keys=("target_x","target_y","label_x","label_y")
                if all(isinstance(m.get(k),(int,float)) and 0<=m[k]<=100 for k in keys):
                    markers.append({"label":normalize(m.get("label")),**{k:m[k] for k in keys}})
            safe.append({
                "label":normalize(panel.get("label")) or sid,
                "src":rel,
                "caption":normalize(panel.get("caption")),
                "creator":meta["creator"],
                "license":meta["license"],
                "source_page":meta["source_page"],
                "license_url":meta["license_url"],
                "modifications":meta["modifications"],
                "annotation_note":"Hays Botany displays overlaid numbered anatomy pointers; the source JPEG itself is unchanged.",
                "markers":markers
            })
            panel_count+=1;marker_count+=len(markers);image_refs.add(rel)
        tiles=[]
        for t in (d.get("field_id_short_tiles") or [])[:12]:
            if isinstance(t,dict):
                tiles.append({"heading":normalize(t.get("heading") or t.get("title")),
                              "details":normalize(t.get("details") or t.get("summary"))})
        steps=[]
        begin=d.get("beginner_learning_path") or {}
        for s in (begin.get("steps") or [])[:20]:
            if isinstance(s,dict):
                steps.append({"title":normalize(s.get("title")),
                              "look_for":normalize(s.get("look_for")),
                              "why_it_matters":normalize(s.get("why_it_matters"))})
        if not safe:no_panels.append(sid)
        data={
            "id":sid,"scientific":sc,"common":common,"genus":genus,
            "note":"Historical source metadata and held media remain in the original repository. This preview displays only imported local candidate photos; public-use clearance on a new site is a separate review.",
            "tiles":tiles,"steps":steps,"panels":safe,
            "preview_only":True
        }
        dump(out/"data/species"/(sid+".json"),data)
        manifest.append({"id":sid,"scientific":sc,"common":common,"genus":genus,
                         "local_panel_count":len(safe)})
    assert len(manifest)==112 and len({x["id"] for x in manifest})==112
    manifest.sort(key=lambda d:(d["genus"].lower(),d["scientific"].lower()))
    dump(out/"data/poaceae-index.json",manifest)
    for name in ("index.html","styles.css","app.js"):
        shutil.copy2(root/"site"/name,out/name)
    # Rebuild from source photos with unchanged bytes, only copied approved media.
    for rel in sorted(allowed):
        src=root/rel
        assert src.is_file(),rel
        dst=out/rel
        dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(src,dst)
    from enrich_poaceae_lessons import enrich
    lesson_stats=enrich(root,out)
    found={f.relative_to(out).as_posix() for f in out.rglob("*") if f.is_file() and f.suffix.lower() in PHOTO_EXTS}
    assert found==allowed,{"missing":sorted(allowed-found)[:5],"unexpected":sorted(found-allowed)[:5]}
    assert not found.intersection(held)
    assert all((out/p).is_file() for p in image_refs)
    total=sum(x.stat().st_size for x in out.rglob("*") if x.is_file())
    assert total<850_000_000,("Exceeds conservative staging site cap",total)
    q={
       "stage":"UNDEPLOYED_LOCAL_PREVIEW",
       "source_snapshot":report["source_commit"],
       "species":len(manifest),
       "genera":len({x["genus"] for x in manifest}),
       "candidate_image_files":len(allowed),
       "held_source_images_not_published":len(held),
       "visible_teaching_panels":panel_count,
       "photo_markers_in_preview":marker_count,
       "excluded_panel_references":excluded_panels,
       "species_with_no_safe_local_panels":no_panels,
       "size_bytes":total,
       "learner_parity":lesson_stats,
       "site_path":"dist",
       "original_main_website_unchanged":True,
       "production_pages_deployed":False,
       "warning":"Photos are broad public-license candidates, NOT yet cleared for new Pages use; this output is build QA only."
    }
    dump(root/"migration/site-preview-qa.json",q)
    print("POACEAE_UNPUBLISHED_PREVIEW_QA",json.dumps(q,ensure_ascii=False),flush=True)

if __name__=="__main__":
    main()
