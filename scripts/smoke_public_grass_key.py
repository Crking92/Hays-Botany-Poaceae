#!/usr/bin/env python3
"""Verify that GitHub Pages serves the current scored Grass ID Lab, not merely a successful build.

This is a byte/data-delivery check, NOT independent plant ID, photo rights, or screenshot verification.
"""
import hashlib
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
RELEASE_REF = os.environ.get("GITHUB_SHA", "manual-local-check")
SHARDS = ["a", "b", "c1", "c2", "c3", "d1", "d2", "d3", "d4"]
TRIAL_FILES = ["provisional-trial-profiles.json", "provisional-trial-batch2.json", "provisional-trial-batch3.json", "provisional-trial-batch4.json", "provisional-trial-batch5-a.json", "provisional-trial-batch5-b.json", "provisional-trial-batch5-c.json"]
FILES = ["species-" + x + ".json" for x in SHARDS] + ["hays-candidates.json"] + TRIAL_FILES + ["source-scored-admissions.json", "ready-core-gap-assignments.json", "index.html"]


def read_public(name):
    req = urllib.request.Request(
        BASE + name + "?grass_key_release_check=" + RELEASE_REF,
        headers={"User-Agent": "Hays-Grass-Lab-Public-Key-QA/1.0", "Cache-Control": "no-cache"},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        assert response.status == 200, f"{name} returned {response.status}"
        return response.read()


def verify():
    public = {}
    for name in FILES:
        raw = read_public(name)
        if name.endswith(".json"):
            public[name] = json.loads(raw)
            local = json.loads((LAB / name).read_text(encoding="utf-8"))
            assert public[name] == local, f"Public JSON differs from main: {name}"
        else:
            local_bytes = (LAB / name).read_bytes()
            assert hashlib.sha256(raw).digest() == hashlib.sha256(local_bytes).digest(), (
                "Published Grass ID Lab index.html differs from current main"
            )
            assert b"function currentResults()" in raw, "Scoring function missing on public page"
    scored = [item for suffix in SHARDS for item in public["species-" + suffix + ".json"]]
    candidates = public["hays-candidates.json"]["candidates"]
    ids = [x["id"] for x in scored + candidates]
    assert len(scored) == 112, f"Expected 112 scored; received {len(scored)}"
    assert len(candidates) == 57, f"Expected 57 provisional; received {len(candidates)}"
    assert len(set(ids)) == 169, "Public scored/provisional IDs not unique"
    assert all(c["status"] == "RESEARCH_CANDIDATE_NOT_RELEASED" for c in candidates)
    counts = [len(public[f]["profiles"]) for f in TRIAL_FILES]
    assert counts == [6, 6, 6, 6, 11, 10, 8], f"Public trial batches incomplete: {counts}"
    trials = [p for f in TRIAL_FILES for p in public[f]["profiles"]]
    assert len(trials) == 53 and len({p["id"] for p in trials}) == 53
    assert len(scored) + len(trials) == 165
    candidate_by_id = {c["id"]: c for c in candidates}
    assert len({c["id"] for c in candidates} - {p["id"] for p in trials}) == 4
    promotions = public["source-scored-admissions.json"]["admissions"]
    assert public["source-scored-admissions.json"]["schema"] == "HAYS_GRASS_SOURCE_SCORED_ADMISSIONS_V1"
    promoted_ids = {p["id"] for p in promotions}
    assert len(promotions) == len(promoted_ids) == 4
    assert promoted_ids <= {p["id"] for p in trials}, "Source scored admission lacks trial source packet"
    assert all(p["admission_level"] == "SOURCE_SCORED_NOT_LOCAL_VOUCHER" for p in promotions)
    core_gaps = public["ready-core-gap-assignments.json"]
    assert core_gaps["schema"] == "HAYS_GRASS_READY_CORE_GAPS_V1"
    assert core_gaps["integration_count"] == len(core_gaps["rows"]) == 28
    assert len(core_gaps["held_unknown"]) == 13
    assert core_gaps["prior_research_master_records"] == 1815
    assert {r["id"] for r in core_gaps["rows"]} <= {p["id"] for p in trials}
    for p in trials:
        assert p["trial"] is True and p["admission_status"] == "RESEARCH_TRIAL_NOT_ADMITTED" and p["range"] == "UNVERIFIED"
        source = candidate_by_id[p["id"]]["approved_gallery"]
        assert len(p["photos"]) == len(source)
        for i, photo in enumerate(p["photos"]):
            assert photo["i"] == i
            assert {k: v for k, v in photo.items() if k != "i"} == source[i], f"{p['id']}: credited source changed"
    print(json.dumps({
        "pass": True,
        "public_url": BASE,
        "public_files_matching_main": len(FILES),
        "original_scored_unchanged": len(scored), "promoted_source_scored": len(promotions),
        "live_source_scored_total": len(scored) + len(promotions),
        "research_only_remaining": len(candidates) - len(promotions), "provisional_manifest_unchanged": len(candidates),
        "configured": len(ids),
        "normal_key_species": len(ids), "previous_trial_source_packets_preserved": len(trials),
        "source_reviewed_new_core_fields": len(core_gaps["rows"]), "explicit_core_unknown_holds": len(core_gaps["held_unknown"]),
        "manifest_only_holds": len(candidates) - len(trials),
        "verification": "PUBLIC_HTML_AND_JSON_BYTES_NOT_BROWSER_PIXELS",
        "photo_identity_rights_and_rendered_pixels": "NOT_CERTIFIED",
    }, indent=2))


if __name__ == "__main__":
    last_error = None
    for attempt in range(1, 16):
        try:
            verify()
            break
        except (AssertionError, urllib.error.URLError, json.JSONDecodeError) as exc:
            last_error = exc
            print(f"Public Pages not yet in parity (attempt {attempt}/15): {exc}", flush=True)
            if attempt < 15:
                time.sleep(8)
    else:
        raise SystemExit(f"Grass Lab public Pages still mismatched after deployment checks: {last_error}")
