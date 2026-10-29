#!/usr/bin/env python3
"""Build a stricter rights-first website candidate from the existing staging preview.

No publishing. Canonical botanical records and originals remain unchanged.
"""
from pathlib import Path
from collections import defaultdict, Counter
import shutil,json
from audit_poaceae_photo_provenance import kind
ROOT=Path(__file__).resolve().parents[1]

def main():
    stage=ROOT/"dist";safe=ROOT/"dist-safe"
    assert stage.is_dir()
    if safe.exists():shutil.rmtree(safe)
    shutil.copytree(stage,safe)
    ledger=json.loads((ROOT/"migration/source-file-ledger.json").read_text())
    # Match the original preview's exact copied-file set; newer public-license
    # verified Commons originals were transferred after the baseline census.
    allowed_dispositions={"LICENSE_CANDIDATE_IMAGE_COPIED","CURRENT_COMMONS_CC_PHOTO_COPIED"}
    candidates={x["path"] for x in ledger if x["disposition"] in allowed_dispositions}
    records=defaultdict(list)
    for cp in (ROOT/"content/taxa/Poaceae").rglob("species.json"):
        d=json.loads(cp.read_text())
        for im in d.get("images",[]):
            f=im.get("file")
            if not isinstance(f,str) or f.startswith(("https://","http://")):continue
            try:p=(cp.parent/f).resolve().relative_to(ROOT).as_posix()
            except ValueError:continue
            if p in candidates:records[p].append(im)
    assert set(records)==candidates
    keep=set();reasons=Counter()
    for path,items in records.items():
        codes={kind(str(rec.get("license") or "")) for rec in items}
        if len(codes)!=1:reasons["LICENSE_METADATA_CONFLICT"]+=1;continue
        classification=next(iter(codes))
        # Narrow provenance exception: Jim Conrad explicitly dedicates HIS OWN
        # Backyard Nature photographs to the public domain. Each exact source
        # photo record must identify him and a Backyard Nature newsletter page.
        conrad_pd=(classification=="PUBLIC_DOMAIN_CLAIM" and all(
            str(rec.get("creator") or "").strip().lower()=="jim conrad"
            and "backyardnature.net" in str(rec.get("source_page") or "")
            and "public domain" in str(rec.get("license") or "").lower()
            and ("copyrite.htm" in str(rec.get("license_url") or "")
                 or "jim conrad" in str(rec.get("license") or "").lower())
            for rec in items))
        # Exact public-domain federal employee photos already archived in
        # the original Texas wild-rice card. Do not extend this exception to
        # arbitrary government-hosted or third-party images.
        usfws_pd=(classification=="PUBLIC_DOMAIN_CLAIM"
            and path.startswith("content/taxa/Poaceae/Zizania/zizania-texana/images/usfws-hagerty-")
            and all(
                "Ryan Hagerty" in str(rec.get("creator") or "")
                and "U.S. Fish and Wildlife Service" in str(rec.get("creator") or "")
                and "public domain" in str(rec.get("license") or "").lower()
                and (
                    str(rec.get("source_page") or "").startswith("https://commons.wikimedia.org/wiki/File:Zizania_texana_")
                    or str(rec.get("source_page") or "").startswith("https://www.fws.gov/media/texas-wild-rice")
                )
                for rec in items
            ))
        if classification not in {"CC0","CC_BY","CC_BY_SA"} and not (conrad_pd or usfws_pd):
            reasons[classification+"_REVIEW"]+=1;continue
        if not all(str(rec.get("source_page") or "").startswith("https://") for rec in items):
            reasons["NO_HTTPS_SOURCE_PAGE"]+=1;continue
        if not all(str(rec.get("creator") or "").strip() for rec in items):
            reasons["MISSING_CREATOR"]+=1;continue
        if any(str(rec.get("public_reuse") or "").lower().strip() in {"no","pending","review"} for rec in items):
            reasons["PUBLIC_REUSE_REVIEW"]+=1;continue
        if any(rec.get("site_specific_public_permission") for rec in items):
            reasons["SITE_SPECIFIC_GRANT"]+=1;continue
        keep.add(path)
    assert keep.issubset(candidates)
    panels=0;refs=0;unphotographed=[]
    for file in (safe/"data/species").glob("*.json"):
        d=json.loads(file.read_text());filtered=[]
        for p in d["panels"]:
            if p["src"] in keep:filtered.append(p);panels+=1
            else:
                d.setdefault("unavailable_references",[]).append({
                    "original_panel_index":p.get("original_panel_index"),
                    "label":p.get("label"),
                    "reason":"Source photo excluded from rights-first site pending rights verification",
                    "reference_page":p.get("source_page") if str(p.get("source_page") or "").startswith("https://") else "",
                    "license_status":"NOT_CLEARED_FOR_PUBLIC_EMBED"
                });refs+=1
        mapping={p["original_panel_index"]:i for i,p in enumerate(filtered) if isinstance(p.get("original_panel_index"),int)}
        for s in d.get("steps",[]):
            original=s.get("original_panel_index")
            s["panel_index"]=mapping.get(original) if isinstance(original,int) else None
            s["photo_unavailable"]=s["panel_index"] is None
        for t in d.get("tiles",[]):
            indices=t.get("original_panel_indices") or []
            t["preview_panel_indices"]=[mapping[i] for i in indices if i in mapping]
            t["missing_original_panel_indices"]=[i for i in indices if i not in mapping]
        d["panels"]=filtered
        if not filtered:unphotographed.append(d["id"])
        file.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
    for path in candidates-keep:
        file=safe/path
        if file.exists():file.unlink()
    photo_ext={".jpg",".jpeg",".png",".webp",".gif",".tif",".tiff"}
    physical={f.relative_to(safe).as_posix() for f in safe.rglob("*") if f.is_file() and f.suffix.lower() in photo_ext}
    assert physical==keep,{"missing":list(keep-physical)[:3],"unexpected":list(physical-keep)[:3]}
    for file in (safe/"data/species").glob("*.json"):
        for p in json.loads(file.read_text())["panels"]:
            assert p["src"] in keep and (safe/p["src"]).is_file()
    size=sum(f.stat().st_size for f in safe.rglob("*") if f.is_file())
    result={"stage":"RIGHTS_FIRST_PREVIEW_NOT_PUBLISHED",
        "source_images_imported":len(candidates),
        "photo_candidates_in_more_restrictive_preview":len(keep),
        "photo_candidates_excluded_additionally":len(candidates-keep),
        "excluded_reason_counts":dict(reasons),
        "teaching_panels_remaining":panels,
        "new_source_reference_only_panels":refs,
        "species_without_actual_photo":unphotographed,
        "bytes":size,"originals_untouched":True,"release_authorized":False,
        "note":"License screened from canonical metadata only; independent upstream verification and individual anatomy review remain required."}
    path=ROOT/"qa-report/rights-first-preview.json"
    path.parent.mkdir(exist_ok=True,parents=True)
    path.write_text(json.dumps(result,indent=2)+"\n")
    print("POACEAE_RIGHTS_FIRST_SITE",json.dumps(result),flush=True)
if __name__=="__main__":main()
