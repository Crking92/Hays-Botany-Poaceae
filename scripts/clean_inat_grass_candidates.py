#!/usr/bin/env python3
"""Read-only Poaceae coverage cleanup. Never edits the published 112 species.

Input is the live iNaturalist species_counts snapshot, not an authoritative
flora or a nativity certification. An unmatched name remains only a lead.
"""
import json, pathlib, re, unicodedata
from collections import Counter,defaultdict
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/"audits/inat-2026-11-11-raw-candidates.json"
INDEX=ROOT/"site/data/poaceae-index.json"
SOURCES=ROOT/"content/taxa/Poaceae"
OUT=ROOT/"audits/inat-2026-11-11-cleaned.json"
MD=ROOT/"audits/inat-2026-11-11-cleaned.md"
assert RAW.is_file() and INDEX.is_file()
base=json.loads(INDEX.read_text())
assert len(base)==112
raw=json.loads(RAW.read_text())["candidates"]
assert len(raw)==157
def norm(s):
    s=unicodedata.normalize("NFKC",str(s or "")).lower().replace("×"," x ")
    s=re.sub(r"\s+", " ",s).strip()
    s=re.sub(r"\b[x]\s+(?=[a-z])","x",s)  # × involuta -> xinvoluta
    return s
def taxon_key(s):
    bits=norm(s).split(" ")
    if len(bits)<2:return None
    return " ".join(bits[:2])
index_aliases=defaultdict(set)
for row in base:index_aliases[taxon_key(row["scientific"])].add(row["scientific"])
source_count=0
for p in SOURCES.glob("*/*/species.json"):
    data=json.loads(p.read_text())
    source_count+=1
    primary=data.get("scientific_name") or ""
    # Main canonical index name takes precedence, so an alias never erases the
    # installed ID. Only explicitly curated synonym fields are considered.
    mainrow=next((r for r in base if r["id"]==data.get("id")),None)
    if not mainrow:continue
    canonical=mainrow["scientific"]
    for name in [primary]+(data.get("synonyms",[]) if isinstance(data.get("synonyms"),list) else []):
        if isinstance(name,dict):
            name=name.get("scientific_name") or name.get("name") or ""
        if isinstance(name,str) and taxon_key(name):
            index_aliases[taxon_key(name)].add(canonical)
assert source_count>=112,source_count
# A tag is never grounds for excluding a grass by itself.
planting_context={
"Phyllostachys aurea","Triticum aestivum","Cortaderia selloana",
"Zea mays","Hordeum vulgare","Miscanthus sinensis",
"Miscanthus sacchariflorus","Cenchrus setaceus",
"Cenchrus longisetus","Lagurus ovatus","Phalaris canariensis",
"Avena sativa","Lolium perenne","Lolium multiflorum",
"Lolium × boucheanum","Stenotaphrum secundatum",
"Muhlenbergia dumosa","Muhlenbergia capillaris",
"Eragrostis superba","Melinis nerviglumis",
}
introduced_context={
"Bromus catharticus","Eragrostis superba","Lolium perenne",
"Bothriochloa bladhii","Dichanthium aristatum",
"Lolium multiflorum","Paspalum notatum","Echinochloa colona",
"Bromus tectorum","Eragrostis curvula","Melinis repens",
"Panicum repens","Cenchrus ciliaris","Megathyrsus maximus",
"Eragrostis lehmanniana","Aira caryophyllea","Arthraxon hispidus",
"Phyllostachys aurea","Stenotaphrum secundatum","Cortaderia selloana",
}
nomenclature_attention={
"Coelorachis cylindrica":"GENERIC_PLACEMENT_DISAGREEMENT: POWO uses Rottboellia campestris; USDA GRIN lists Mnesithea cylindrica. No species merged into old list.",
"Tridentopsis elongata":"Kew accepts this separately; older treatment under Tridens muticus var. elongatus. Do not auto-merge with Tridentopsis mutica.",
"Anatherum ternarium":"Kew accepts separately; historical combination Andropogon ternarius. Do not auto-merge with existing Anatherum species.",
"Anatherum gyrans":"Kew accepts separately; historical combination Andropogon gyrans.",
"Paspalum langei":"Kew accepts separately; check local specimen and distinction from other Paspalum.",
"Bromus brevis":"Kew accepts separately but published native range in Argentina; Texas determinations need voucher review.",
}
planting_context={norm(x) for x in planting_context}
introduced_context={norm(x) for x in introduced_context}
attention={norm(k):v for k,v in nomenclature_attention.items()}
out=[]
for item in raw:
    n=norm(item["name"])
    aliases=sorted(index_aliases.get(taxon_key(item["name"]),set()))
    hays=int(item.get("hays_count",0))
    reg=int(item.get("region_count",0))
    counties=int(item.get("county_count",0))
    flags=[]
    if n in planting_context:flags.append("CHECK_PLANTED_OR_ESCAPED")
    if n in introduced_context:flags.append("CHECK_INTRODUCED_STATUS")
    if n in attention:flags.append("TAXONOMIC_REVIEW")
    if len(aliases)>1:flags.append("AMBIGUOUS_EXISTING_SYNONYM")
    if aliases:
        category="ALREADY_COVERED_NAME_OR_SYNONYM"
        priority=0
    elif hays>=5:
        category="HAYS_HIGH_PRIORITY"
        priority=1
    elif hays>0:
        category="HAYS_RECORD_REVIEW"
        priority=2
    elif counties>=3 and reg>=10:
        category="REGIONAL_PRIORITY"
        priority=3
    else:
        category="REGIONAL_LOWER_EVIDENCE"
        priority=4
    out.append({**item,"category":category,"priority":priority,
                "matched_existing":aliases,"review_flags":flags,
                "nomenclatural_note":attention.get(n),
                "merge_ready":False,
                "review_decision":"KEEP_AS_LEAD" if not aliases else "ALREADY_ON_112_NO_NEW_CARD"})
out.sort(key=lambda x:(x["priority"],-x["hays_count"],-x["region_count"],x["name"]))
counts=Counter(x["category"] for x in out)
summary={
"source_count":len(base),"source_species_files_checked":source_count,
"total_name_leads":len(raw),"by_category":dict(counts),
"distinct_provisional_leads":len([x for x in out if not x["matched_existing"]]),
"matched_existing":[{"candidate":x["name"],"existing":x["matched_existing"]} for x in out if x["matched_existing"]],
"planting_context_count":sum("CHECK_PLANTED_OR_ESCAPED" in x["review_flags"] for x in out),
"introduced_context_count":sum("CHECK_INTRODUCED_STATUS" in x["review_flags"] for x in out),
"limitations":["This is name matching against current 112 source records, NOT full worldwide synonym resolution.",
"iNaturalist research grade is not proof of a wild population, native status, or correct grass identity.",
"Exact taxonomic identity must be reconciled with Flora of North Central Texas and current treatments.",
"Review flags are not exclusion decisions. No candidate is merged until approved."],
"records":out}
OUT.write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n")
rows=["# Hays Botany – iNaturalist grass list cleanup (Nov 11, 2026)","",
"Working review data only; the existing 112-species index and live site are untouched.","",
f"- Existing grass source cards checked: **{len(base)}**",
f"- iNaturalist unmatched names from 12 counties: **{len(raw)}**",
f"- Names recognized as an existing source taxon/synonym: **{counts['ALREADY_COVERED_NAME_OR_SYNONYM']}**",
f"- Remaining candidates for botanical review: **{summary['distinct_provisional_leads']}**",
f"- Hays high-priority leads (5+ research-grade records): **{counts['HAYS_HIGH_PRIORITY']}**",
f"- Other Hays leads: **{counts['HAYS_RECORD_REVIEW']}**",
f"- Regional priority: **{counts['REGIONAL_PRIORITY']}**",
f"- Regional lower evidence: **{counts['REGIONAL_LOWER_EVIDENCE']}**",
"","## Already present — no new card",""]
for x in out:
    if x["matched_existing"]:rows.append(f"- **{x['name']}** → {', '.join(x['matched_existing'])} ({x['hays_count']} Hays observations)")
rows += ["","## Candidate list by review category",""]
for cat in ["HAYS_HIGH_PRIORITY","HAYS_RECORD_REVIEW","REGIONAL_PRIORITY","REGIONAL_LOWER_EVIDENCE"]:
    rows += [f"### {cat}","", "| Candidate | Hays obs | Region obs | County count | Attention flags |","|---|---:|---:|---:|---|"]
    for x in out:
        if x["category"]!=cat:continue
        rows.append("| {} | {} | {} | {} | {} |".format(x["name"],x["hays_count"],x["region_count"],x["county_count"],", ".join(x["review_flags"]) or "—"))
    rows.append("")
rows += ["## Protocol","",
"1. Resolve taxonomic name and synonyms first, then evaluate FNA flora compatibility.",
"2. Review research-grade specimen photos and location evidence, particularly for unusual records.",
"3. Separate native-range assessment from field-ID inclusion; introduced grasses may be included.",
"4. Stage new provisional records on a review branch, not the 112-species live list.",
"5. Merge only reviewed species in small batches after visual-key regression tests.",""]
MD.write_text("\n".join(rows))
print("CLEANUP_JSON_BEGIN")
print(json.dumps({k:v for k,v in summary.items() if k!="records"},separators=(",",":")))
print("CLEANUP_JSON_END")
