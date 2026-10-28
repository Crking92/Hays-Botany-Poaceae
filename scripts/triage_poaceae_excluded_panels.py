#!/usr/bin/env python3
"""Explain exactly why original Poaceae panels were excluded from the new preview.

Read-only. Needed to separate licensing holds from broken or intentionally
cross-family media and decide which panels can be rebuilt with safe links.
"""
from pathlib import Path
from collections import Counter,defaultdict
import json,argparse
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path("."))
    p.add_argument("--out",type=Path,default=Path("qa-report/excluded-panel-triage.json"))
    a=p.parse_args();root=a.root.resolve()
    ledger=json.loads((root/"migration/source-file-ledger.json").read_text())
    allowed={x["path"] for x in ledger if x["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
    held={x["path"]:x for x in ledger if x["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"}
    categories=Counter();species=defaultdict(Counter);excluded=[];source_total=0
    for cp in sorted((root/"content/taxa/Poaceae").rglob("species.json")):
        doc=json.loads(cp.read_text());sid=doc.get("id",cp.parent.name)
        for ix,panel in enumerate(doc.get("visual_comparison",{}).get("items") or []):
            source_total+=1
            value=panel.get("image_url")
            path=""
            if not isinstance(value,str) or not value.strip():
                reason="missing_or_invalid_image_url"
            elif value.startswith(("https://","http://")):
                reason="external_image_not_migrated"
            else:
                f=(root / value if value.startswith("content/taxa/") else cp.parent/value).resolve()
                try:path=f.relative_to(root).as_posix()
                except ValueError: reason="invalid_escape_path"
                else:
                    if path in allowed and f.is_file():continue
                    if path in held:reason="photo_held_by_rights_or_source_metadata"
                    elif path.startswith("content/taxa/") and not path.startswith("content/taxa/Poaceae/"):
                        reason="cross_family_photo_not_staged"
                    elif path.startswith("content/taxa/Poaceae/"):
                        reason="unstaged_or_missing_family_media"
                    else:reason="other_unmigrated_asset"
            categories[reason]+=1
            species[sid][reason]+=1
            excluded.append({
                "species":sid,"original_panel_index":ix,
                "original_label":panel.get("label"),"original_image_url":value,
                "normalized_path":path,"reason":reason,
                "source_page":panel.get("source_page"),"license":panel.get("license")
            })
    total_missing=sum(categories.values())
    assert source_total==1219,(source_total,"source panel count changed")
    assert total_missing==263,(total_missing,categories)
    rows=sorted([{"species":sid,"excluded":sum(c.values()),"reasons":dict(c)} for sid,c in species.items()],
                key=lambda x:-x["excluded"])
    report={"stage":"NONDEPLOYING_EXCLUSION_TRIAGE",
        "source_panels":source_total,
        "retained_preview_panels":source_total-total_missing,
        "excluded_panel_count":total_missing,
        "reason_counts":dict(categories),
        "affected_species_count":len(species),
        "most_affected_species":rows[:30],
        "all_affected_species":rows,
        "excluded_panel_details":excluded,
        "notes":"Do not import held photos into a public repo. Restore external or cross-family links only after confirming source photo permissions, availability, and safe cross-family navigation; do not turn 263 excluded panels into a claim of 263 missing physical photos."}
    out=(root/a.out).resolve();out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print("EXCLUDED_PANEL_TRIAGE",json.dumps({k:v for k,v in report.items() if k not in ("all_affected_species","excluded_panel_details")},ensure_ascii=False),flush=True)
if __name__=="__main__":main()
