#!/usr/bin/env python3
"""Offline nonpublishing Poaceae photo-collection queue; no license upgrades."""
from __future__ import annotations
import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "qa-report/collection-queue"
STAGED = "LICENSE_CANDIDATE_IMAGE_COPIED"
HELD = "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"

def local_path(card_path: Path, value: object) -> str | None:
    if not isinstance(value, str) or not value.strip() or value.startswith(("https://", "http://")):
        return None
    try:
        resolved = (ROOT / value if value.startswith("content/taxa/Poaceae/") else card_path.parent / value).resolve()
        return resolved.relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return None

def targets(card: dict) -> list[str]:
    fields = [card.get("diagnostic_photo_targets")]
    for key in ("field_id_finish_pass", "lane5_practical_closeout_20261026"):
        section = card.get(key)
        if isinstance(section, dict):
            for sub in ("photo_targets", "critical_photo_targets", "what_to_photograph"):
                fields.append(section.get(sub))
    result = []
    for item in fields:
        if isinstance(item, list):
            for entry in item:
                if isinstance(entry, str) and entry.strip() and entry.strip() not in result:
                    result.append(entry.strip()[:350])
    return result[:5]

def main() -> None:
    ledger = json.loads((ROOT / "migration/source-file-ledger.json").read_text(encoding="utf-8"))
    bypath = {row["path"]: row["disposition"] for row in ledger}
    assert len(bypath) == len(ledger) == 1402
    assert Counter(bypath.values())[STAGED] == 788
    assert Counter(bypath.values())[HELD] == 224
    rows = []
    for file in sorted((ROOT / "content/taxa/Poaceae").rglob("species.json")):
        card = json.loads(file.read_text(encoding="utf-8"))
        sid = card["id"]
        physical, held_physical = set(), set()
        external_image_records = 0
        for im in card.get("images", []):
            original = im.get("file")
            rel = local_path(file, original)
            if rel and bypath.get(rel) == STAGED:
                physical.add(rel)
            elif rel and bypath.get(rel) == HELD:
                held_physical.add(rel)
            elif isinstance(original, str) and original.startswith(("https://", "http://")):
                external_image_records += 1
        panels = (card.get("visual_comparison") or {}).get("items") or []
        counts = Counter()
        markers = 0
        for panel in panels:
            src = panel.get("image_url")
            rel = local_path(file, src)
            if rel and bypath.get(rel) == STAGED:
                counts["staged"] += 1
                markers += len(panel.get("markers") or [])
            elif rel and bypath.get(rel) == HELD:
                counts["held"] += 1
            elif isinstance(src, str) and src.startswith(("https://", "http://")):
                counts["external"] += 1
            else:
                counts["unresolved"] += 1
        rows.append({
            "id": sid,
            "scientific_name": card.get("scientific_name", sid),
            "common_name": card.get("common_name") or "",
            "staged_candidate_photo_files": len(physical),
            "held_photo_files_in_original": len(held_physical),
            "external_photo_records": external_image_records,
            "staged_teaching_panels": counts["staged"],
            "held_teaching_panels": counts["held"],
            "external_teaching_panels": counts["external"],
            "unresolved_teaching_panels": counts["unresolved"],
            "staged_marker_coordinates_not_visually_certified": markers,
            "original_diagnostic_photo_targets": targets(card),
            "collection_priority": "SAVE_FOR_LAST" if sid == "muhlenbergia-piniflora" else "REVIEW_FEWEST_CANDIDATE_PHOTOS_FIRST",
        })
    assert len(rows) == 112, len(rows)
    rows.sort(key=lambda r: (r["collection_priority"] == "SAVE_FOR_LAST",
                             r["staged_candidate_photo_files"], -r["held_teaching_panels"], r["id"]))
    OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "status": "RESEARCH_AND_COLLECTION_QUEUE_ONLY_NOT_PUBLIC_RELEASE",
        "authoritative_repository": "Crking92/Hays-County-Botany",
        "staging_repository": "Crking92/Hays-Botany-Poaceae",
        "species_count": len(rows),
        "scoring_note": "Photo counts are metadata-screened distinct candidate files, not six-role photographic completeness, independent license clearance, or anatomical accuracy.",
        "operating_rule": "Keep collection and approved source records canonical in original until explicit handoff. Do not deploy, restart automations, or bulk-sync.",
        "rows": rows,
    }
    (OUT / "poaceae-photo-backfill-queue.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fields = [k for k in rows[0] if k != "original_diagnostic_photo_targets"] + ["original_diagnostic_photo_targets"]
    with (OUT / "poaceae-photo-backfill-queue.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            item = row.copy()
            item["original_diagnostic_photo_targets"] = " | ".join(row["original_diagnostic_photo_targets"])
            writer.writerow(item)
    print("POACEAE_COLLECTION_QUEUE", json.dumps({
        "species": len(rows),
        "zero_candidate_photo_species": sum(not r["staged_candidate_photo_files"] for r in rows),
        "top_ten": [{"id": r["id"], "candidate_photos": r["staged_candidate_photo_files"],
                     "held_panels": r["held_teaching_panels"]} for r in rows[:10]],
        "notice": "Candidate file counts only; not license-cleared or visually certified",
    }))

if __name__ == "__main__":
    main()
