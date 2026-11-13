#!/usr/bin/env python3
"""Leaf-refinement source-coding integrity. Never promotes trials or photos."""
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
assert len(chars) == len(bundle["characters"]) == 24
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
assert len(bundle["evidence"]) >= 336 and len({r["id"] for r in bundle["evidence"]}) >= 58
width_rows = [r for r in bundle["evidence"] if r["character"] == "blade_width"]
assert len(width_rows) >= 37
def possible_width_states(low, high):
    expected = set()
    if low < 2: expected.add("thread")
    if low < 5 and high > 2: expected.add("narrow")
    if low < 10 and high > 5: expected.add("medium")
    if high > 10: expected.add("broad")
    return expected
for row in width_rows:
    mm = row.get("width_mm")
    assert isinstance(mm, list) and len(mm) == 2 and all(isinstance(x, (float, int)) for x in mm), row["id"]
    lo, hi = mm
    assert 0 < lo <= hi <= 100, row["id"]
    assert set(row["states"]) == possible_width_states(lo, hi), (row["id"], row["states"], mm)
assert any(r["character"] == "blade_tip" for r in bundle["evidence"])
assert any(r["character"] == "blade_edge" for r in bundle["evidence"])
assert any(r["character"] == "blade_midnerve" for r in bundle["evidence"])
assert 'const group=node("details","optional-group")' in html
assert "updateChosen()" in html
assert 'id="optional-section-tabs"' in html
assert "function refinementSection(id)" in html
assert '["stem","Stems / roots"]' in html
assert '["stem_nodes","culm_posture","surface_runners","underground_stems","basal_crown","stem_special"].includes(id)' in html
for character in ("culm_posture","surface_runners","underground_stems","basal_crown","stem_special"):
    assert character in chars
    assert len([e for e in bundle["evidence"] if e["character"]==character])>=7, character
assert len([e for e in bundle["evidence"] if e["character"]=="stem_nodes"])>=14
assert len({e["id"] for e in bundle["evidence"] if e["character"] in ("culm_posture","surface_runners","underground_stems","basal_crown","stem_special","stem_nodes")})>=35
assert any(e["id"]=="cynodon-dactylon" and e["states"]==["long_rhizome"] for e in bundle["evidence"] if e["character"]=="underground_stems")
assert any(e["id"]=="paspalum-pubiflorum" and "rooted_nodes" in e["states"] for e in bundle["evidence"] if e["character"]=="surface_runners")
assert any(e["id"]=="eragrostis-cilianensis" and "gland_ring" in e["states"] for e in bundle["evidence"] if e["character"]=="stem_nodes")
# Reproductive optional character source and identity gate (printed Flora pages, no speculative absence).
flower_ids=("florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position")
assert all(k in chars for k in flower_ids)
assert '["flower","Flowers / spikelets"]' in html
assert '["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"].includes(id)' in html
flower_rows=[x for x in bundle["evidence"] if x["character"] in flower_ids]
assert len(flower_rows)>=85 and len({x["id"] for x in flower_rows})>=28
assert all("Diggs, Lipscomb & O'Kennon" in x["source"] and "printed p." in x["source"] for x in flower_rows)
assert all(x["source_url"]=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas" for x in flower_rows)
assert all(x["id"] in {o["id"] for o in original} for x in flower_rows), "Keep optional key evidence on 112 scored taxa"
def positive(taxon,character,state):
    return any(x["id"]==taxon and x["character"]==character and state in x["states"] for x in flower_rows)
assert positive("arundo-donax","floral_hair_position","lemma")
assert positive("phragmites-australis","floral_hair_position","rachilla")
assert positive("setaria-parviflora","floral_hair_position","below_spikelet")
assert positive("setaria-parviflora","true_lemma_awn","none")
assert positive("sorghum-halepense","true_lemma_awn","short") and positive("sorghum-halepense","true_lemma_awn","none")
assert positive("eragrostis-trichodes","lemma_texture","reddish_spotted")
assert "short_rhizome" in {o["id"] for o in chars["underground_stems"]["options"]}
assert "long_rhizome" in {o["id"] for o in chars["underground_stems"]["options"]}
assert "evidence-pending" in html
assert "Research-pending choices can be recorded" in html
assert "No grass was removed" in html
assert all(c in chars for c in ("blade_venation","ligule_length","ligule_edge","sheath_margins","sheath_surface"))
assert len([r for r in bundle["evidence"] if r["character"]=="ligule_length"]) >= 15
pending=[(c["id"],o["id"]) for c in bundle["characters"] for o in c["options"] if o.get("evidence_pending")]
assert ("blade_venation","raised_ribs") in pending and ("sheath_margins","closed") in pending
assert all(not any(r["character"]==cid and oid in r["states"] for r in bundle["evidence"]) for cid,oid in pending)
for r in bundle["evidence"]:
    if r["character"]!="ligule_length": continue
    lo,hi=r["length_mm"]
    assert isinstance(hi,(int,float)) and hi>0
    if lo is None:
        assert hi<=1 and set(r["states"])=={"tiny"}, r["id"]
        continue
    assert isinstance(lo,(int,float)) and 0<lo<=hi
    expect=set()
    if lo<1: expect.add("tiny")
    if lo<3 and hi>1: expect.add("short")
    if lo<8 and hi>3: expect.add("medium")
    if hi>8: expect.add("long")
    assert set(r["states"])==expect, r["id"]

# A refinement is never included in the exclusion criteria or original four-character denominator.
scorer = html.split("function currentResults(){", 1)[1].split("function renderTabs(){", 1)[0]
assert "const picks=Object.entries(state.selected)" in scorer
assert "if(!vals.length)unknown++" in scorer
assert ".filter(x=>!x.conflict)" in scorer
assert "b.refinementMatches.length-a.refinementMatches.length" in scorer
assert 'refinementMatches:(typeof refinementMatches==="function"?refinementMatches(s):[])' in scorer
assert "state.refineSelected" not in scorer.split(".filter(x=>!x.conflict)", 1)[0], "extra traits must not cause exclusions"
assert "optional-refinement-evidence.json" in html
assert 'id="optional-character-wrap"' in html
assert "aria-pressed" in html
assert "Source-backed refinements rank positive literature matches only" in html
assert len(re.findall(r'id="optional-character-wrap"', html)) == 1
assert 'id="theme-toggle"' in html and 'id="compare-dialog"' in html
assert "function compareCandidates()" in html
assert "function compareCorePrompt(species)" in html
assert 'const next=compareCorePrompt(species);' in html
assert 'if(found.some(v=>!Array.isArray(v)||!v.length))continue' in html
assert 'a.every(v=>!b.includes(v))' in html
assert 'const candidates=qs.filter(q=>!state.selected[q.id]&&new Set(' not in html
assert "function compareRefinementPrompt(species)" in html
assert "if(found.some(e=>!e||!Array.isArray(e.states)||!e.states.length))continue" in html
assert "a.states.every(v=>!b.states.includes(v))" in html
assert "if(state.refineSelected[c.id])continue" in html
assert "compare-scroll-note" in html
assert "On a phone, swipe the feature table sideways" in html
assert "max-height:calc(100dvh - 16px)" in html

print(f"PASS: {len(original)} existing scored + {len(trials)} provisional key matches, "
      f"{len(universe)} research universe, {len(bundle['evidence'])} sourced extra clues, "
      f"{len({r['id'] for r in bundle['evidence']})} taxa; no new exclusions.")
