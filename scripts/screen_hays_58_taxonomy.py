#!/usr/bin/env python3
"""Screen all 58 Hays-grass candidates with the GBIF name backbone.
All files are review-only; never change live source cards or photos.
GBIF and iNaturalist are machine signals, not Flora verification.
"""
import datetime,json,pathlib,re,time,urllib.parse,urllib.request
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1]
queue=json.loads((ROOT/"audits/inat-2026-11-11-hays-only.json").read_text())
ev=json.loads((ROOT/"audits/inat-2026-11-11-hays-observation-evidence.json").read_text())
base=json.loads((ROOT/"site/data/poaceae-index.json").read_text())
assert len(queue["candidates"])==58 and len(ev["results"])==58 and len(base)==112
by_ev={r["inat_taxon_id"]:r for r in ev["results"]}
def canon(s):
    b=re.sub(r"\s+"," ",str(s or "").lower().replace("×","x").strip()).split()
    return " ".join(b[:2])
existing={canon(r["scientific"]):r["id"] for r in base}
def query_gbif(name):
    u="https://api.gbif.org/v1/species/match?"+urllib.parse.urlencode({"name":name,"family":"Poaceae","strict":"false","verbose":"true"})
    for k in range(4):
        try:
            req=urllib.request.Request(u,headers={"User-Agent":"HaysBotanyBotanicalAudit/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)","Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=40) as r:return json.load(r),u,None
        except Exception as exc:
            last=str(exc)
            time.sleep(min(2**k,8))
    return None,u,last
rows=[]
for i,c in enumerate(queue["candidates"],1):
    name=c["scientific_name"]
    evidence=by_ev[c["inat_taxon_id"]]
    assert evidence["documented_status"]=="RECORDS_DOCUMENTED"
    j,u,error=query_gbif(name)
    if j:
        match=j.get("matchType")
        status=j.get("status")
        accepted=j.get("acceptedScientificName") or j.get("scientificName")
        guess_existing=existing.get(canon(accepted))
        if match=="NONE":screen="NO_BACKBONE_MATCH_REVIEW"
        elif guess_existing:screen="POSSIBLE_EXISTING_SPECIES_REVIEW"
        elif match!="EXACT" or (isinstance(j.get("confidence"),(int,float)) and j["confidence"]<90):screen="FUZZY_OR_LOW_CONFIDENCE_REVIEW"
        elif status=="SYNONYM":screen="BACKBONE_SYNONYM_REVIEW"
        else:screen="NAME_MATCHED_BOTANICAL_ID_PENDING"
        gbif={"query_url":u,"match_type":match,"name":j.get("scientificName"),
              "accepted_name":accepted,"rank":j.get("rank"),
              "status":status,"confidence":j.get("confidence"),
              "usage_key":j.get("usageKey"),"accepted_usage_key":j.get("acceptedUsageKey"),
              "possible_existing_species_id":guess_existing,
              "alternatives_count":len(j.get("alternatives") or [])}
    else:
        screen="GBIF_API_ERROR"
        gbif={"query_url":u,"error":error}
    flags=list(dict.fromkeys(c.get("review_flags",[])+
          (["SINGLE_OR_DOUBLE_HAYS_RECORD"] if c["hays_observations"]<=2 else [])+
          (["CHECK_TAXONOMY"] if screen!="NAME_MATCHED_BOTANICAL_ID_PENDING" else [])))
    rows.append({
      "queue_id":c["queue_id"],"inat_name":name,"common_name":c.get("common_name"),
      "inat_taxon_id":c["inat_taxon_id"],"hays_records":c["hays_observations"],
      "observers_in_saved_sample":evidence["distinct_observers_in_sample"],
      "record_links":[{"url":z["url"],"date":z["observed_on"],"photos":z["photo_count"]} for z in evidence["evidence"]],
      "gbif":gbif,"automated_screen":screen,"flags":flags,
      "documented_in_hays":"RESEARCH_GRADE_PHOTOGRAPHED_WILD_TAGGED_RECORD",
      "photo_identification_qa":"PENDING","natural_establishment_qa":"PENDING",
      "flora_of_north_central_texas":"PENDING","flora_of_north_america":"PENDING",
      "accepted_species_decision":"PENDING","photo_rights":"NOT_STARTED",
      "visual_key_lesson":"NOT_STARTED","merge_ready":False
    })
    print("TAXON_SCREEN",i,"of 58",name,screen,flush=True)
    time.sleep(.45)
counts=dict(Counter(r["automated_screen"] for r in rows))
out={"version":"v1-2026-11-11","scope":"Hays County Texas",
     "baseline_grasses":112,"candidate_count":len(rows),
     "status":"ALL_58_IN_TAXONOMIC_SCREENING_NONE_MERGE_READY",
     "automated_screen_counts":counts,
     "limitations":[
       "iNaturalist research-grade wild-tagged records do not prove correct species identity or wild establishment.",
       "GBIF is only a secondary nomenclature screen, not a replacement for Flora of North Central Texas or Flora of North America.",
       "The sample may not represent all county observers.",
       "No specimen photos were visually checked in this machine pass; no image bytes were downloaded.",
       "All 58 remain pending verification; none is authorized for merge."],
     "records":rows}
prefix=ROOT/"audits/hays-58-botanical-crosswalk"
prefix.with_suffix(".json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
md=["# Hays County 58 candidate grasses — botanical crosswalk","",
"Review branch only. All original 112 live species remain untouched.","",
"All 58 have photographed iNaturalist research-grade records marked wild in Hays County.",
"This screening independently checks name placement against the GBIF backbone. It does NOT visually verify identifications or settle Flora taxonomy.","",
"## Automated name-screen totals",""]
md += [f"- {k}: {v}" for k,v in sorted(counts.items())]
md+=["","## All candidate names","",
"| ID | Candidate | Hays observations | GBIF accepted-name signal | Result |",
"|---|---|---:|---|---|"]
for r in rows:
    md.append("| {} | {} | {} | {} | {} |".format(r["queue_id"],r["inat_name"],r["hays_records"],r["gbif"].get("accepted_name","not matched"),r["automated_screen"]))
md+=["","## Required before merge","",
"1. Inspect linked Hays observation photos and identification histories.",
"2. Confirm exact name and diagnostic traits against Flora of North Central Texas / Flora of North America.",
"3. Review evidence of wild versus cultivated occurrence.",
"4. Assess whether the grass is a distinct useful addition, introduced or native; flag questionable sightings.",
"5. Only then acquire photo-level licensed media, annotate structures, build ID pathways, and merge a small tested batch.",
"",
"Full evidence links and per-species statuses are in the adjacent JSON file. No live site files were modified.",""]
prefix.with_suffix(".md").write_text("\n".join(md))
print("TAXON_SCREEN_SUMMARY",json.dumps(counts,sort_keys=True),flush=True)
