#!/usr/bin/env python3
"""Batch 1 source-coding integrity check. Never promotes provisional taxa or photos."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
bundle = json.loads((LAB / "optional-refinement-evidence.json").read_text())
html = (LAB / "index.html").read_text()
original = []
for name in ("species-a.json", "species-b.json", "species-c1.json", "species-c2.json",
             "species-c3.json", "species-d1.json", "species-d2.json", "species-d3.json", "species-d4.json"):
    original.extend(json.loads((LAB / name).read_text()))
assert len(original) == 112 and len({x["id"] for x in original}) == 112
trials = []
for name in ("provisional-trial-profiles.json", "provisional-trial-batch2.json",
             "provisional-trial-batch3.json", "provisional-trial-batch4.json"):
    trials.extend(json.loads((LAB / name).read_text())["profiles"])
assert len({x["id"] for x in original + trials}) == len(original) + len(trials)
assert all(x.get("admission_status") == "RESEARCH_TRIAL_NOT_ADMITTED" for x in trials)
universe = json.loads((LAB / "hays-candidates.json").read_text())["candidates"]
assert len(universe) == 57
assert len({x["id"] for x in original + universe}) == 169

assert bundle["schema_version"] == 1
assert bundle["mode"] == "NON_EXCLUDING_POSITIVE_RANKING"
chars = {c["id"]: c for c in bundle["characters"]}
assert len(chars) == len(bundle["characters"]) == 4
for c in chars.values():
    vals = [v["id"] for v in c["options"]]
    assert vals and len(set(vals)) == len(vals)
ids = {x["id"] for x in original + trials}
seen = set()
for row in bundle["evidence"]:
    key = (row["id"], row["character"])
    assert key not in seen, f"duplicate evidence {key}"
    seen.add(key)
    assert row["id"] in ids, f"not active in current key: {row['id']}"
    assert row["character"] in chars
    assert row["states"] and set(row["states"]) <= {o["id"] for o in chars[row["character"]]["options"]}
    assert row["source"].strip() and row["source_url"].startswith("https://")
    assert row["note"].strip()
    assert row["evidence_level"] == "PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"
assert len(bundle["evidence"]) >= 16 and len({r["id"] for r in bundle["evidence"]}) >= 14

# A refinement is never included in the exclusion criteria or original four-character denominator.
scorer = html.split("function currentResults(){", 1)[1].split("function renderTabs(){", 1)[0]
assert "const picks=Object.entries(state.selected)" in scorer
assert "if(!vals.length)unknown++" in scorer
assert ".filter(x=>!x.conflict)" in scorer
assert "b.refinementMatches.length-a.refinementMatches.length" in scorer
assert "refinementMatches:refinementMatches(s)" in scorer
assert "state.refineSelected" not in scorer.split(".filter(x=>!x.conflict)", 1)[0], "extra traits must not cause exclusions"
assert "optional-refinement-evidence.json" in html
assert 'id="optional-character-wrap"' in html
assert "aria-pressed" in html
assert "Source-backed refinements rank positive literature matches only" in html
assert len(re.findall(r'id="optional-character-wrap"', html)) == 1
assert 'id="theme-toggle"' in html and 'id="compare-dialog"' in html
assert "function compareCandidates()" in html
print(f"PASS: {len(original)} existing scored + {len(trials)} provisional key matches, "
      f"{len(universe)} research universe, {len(bundle['evidence'])} sourced extra clues, "
      f"{len({r['id'] for r in bundle['evidence']})} taxa; no new exclusions.")
