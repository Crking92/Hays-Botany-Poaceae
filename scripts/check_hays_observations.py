#!/usr/bin/env python3
"""Verify Hays County research-grade, wild, photographed iNaturalist records.

Read-only query of 58 candidate taxa. Saves an observation-evidence ledger;
does not make botanical identifications, certify wild establishment, or edit cards.
"""
import json, pathlib, time, urllib.request, urllib.parse
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1]
QUEUE=ROOT/"audits/inat-2026-11-11-hays-only.json"
EVIDENCE=ROOT/"audits/inat-2026-11-11-hays-observation-evidence.json"
REPORT=ROOT/"audits/inat-2026-11-11-hays-observation-evidence.md"
API="https://api.inaturalist.org/v1"
FOCUS={
    "Melica nitens",
    "Bothriochloa longipaniculata",
    "Paspalum langei",
    "Coelorachis cylindrica",
    "Bromus catharticus",
}
def get(path,params=None):
    q=("?"+urllib.parse.urlencode(params)) if params else ""
    url=API+path+q
    last=None
    for k in range(4):
        try:
            req=urllib.request.Request(url,headers={
                "User-Agent":"HaysBotanyHaysOnlyRecordAudit/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
                "Accept":"application/json",
            })
            with urllib.request.urlopen(req,timeout=45) as res:
                return json.load(res)
        except Exception as e:
            last=e
            print("RETRY",path,"attempt",k+1,str(e)[:150],flush=True)
            time.sleep(min(2**k,8))
    raise RuntimeError(f"API unavailable at {path}: {last}")
data=json.loads(QUEUE.read_text())
assert len(data["candidates"])==58, "Unexpected Hays staging queue length"
county=get("/places/326")
place=county["results"][0] if county.get("results") else county
assert place["id"]==326 and "Hays" in place["name"],place
print("VERIFIED_PLACE",place["name"],place.get("display_name"),flush=True)
entries=[]
for i,plant in enumerate(data["candidates"],1):
    name=plant["scientific_name"]
    detailed=name in FOCUS
    params={
        "place_id":326,
        "taxon_id":plant["inat_taxon_id"],
        "quality_grade":"research",
        "captive":"false",
        "photos":"true",
        "per_page":20 if detailed else 8,
        "order_by":"observed_on",
        "order":"desc"
    }
    try:
        obs=get("/observations",params)
        total=obs.get("total_results",0)
        observations=obs.get("results",[])
        examples=[]
        for v in observations:
            tax=v.get("taxon") or {}
            examples.append({
                "observation_id":v.get("id"),
                "url":f"https://www.inaturalist.org/observations/{v.get('id')}",
                "observed_on":v.get("observed_on"),
                "quality_grade":v.get("quality_grade"),
                "captive":v.get("captive"),
                "photo_count":len(v.get("photos") or []),
                "observer":(v.get("user") or {}).get("login"),
                "reported_taxon":tax.get("name"),
                "reported_taxon_id":tax.get("id"),
                "identifications_agree":v.get("num_identification_agreements"),
                "identifications_disagree":v.get("num_identification_disagreements"),
                "coordinate_obscured":v.get("coordinates_obscured"),
            })
        users=len({x["observer"] for x in examples if x["observer"]})
        # At this gate "verified" refers to the presence of matching public
        # records only. It does not verify botanical ID or wild establishment.
        status="RECORDS_DOCUMENTED" if total>0 else "NO_MATCHING_PHOTO_RECORDS"
        entry={
            "queue_id":plant["queue_id"],"scientific_name":name,
            "inat_taxon_id":plant["inat_taxon_id"],
            "previous_research_grade_count":plant["hays_observations"],
            "wild_photo_research_grade_count":total,
            "sample_size":len(examples),
            "distinct_observers_in_sample":users,
            "documented_status":status,
            "botanical_identification_verified":False,
            "natural_establishment_verified":False,
            "cultivation_review":"PENDING",
            "record_filter_params":params,
            "evidence":examples,
            "original_review_flags":plant.get("review_flags",[])
        }
    except Exception as e:
        entry={
            "queue_id":plant["queue_id"],"scientific_name":name,
            "inat_taxon_id":plant["inat_taxon_id"],
            "previous_research_grade_count":plant["hays_observations"],
            "wild_photo_research_grade_count":None,
            "sample_size":0,
            "distinct_observers_in_sample":0,
            "documented_status":"API_ERROR",
            "error":str(e)[:300],
            "botanical_identification_verified":False,
            "natural_establishment_verified":False,
            "cultivation_review":"PENDING",
            "evidence":[],
            "original_review_flags":plant.get("review_flags",[])
        }
    entries.append(entry)
    print("HAYS_EVIDENCE",f"{i}/{len(data['candidates'])}",name,entry["documented_status"],entry["wild_photo_research_grade_count"],flush=True)
    time.sleep(0.5)
totals=dict(Counter(x["documented_status"] for x in entries))
out={
    "report_date":"2026-11-11","scope":"Hays County, Texas, iNaturalist place ID 326",
    "source":"https://api.inaturalist.org/v1/observations",
    "criteria":"quality_grade=research; captive=false; photos=true; place_id=326; taxon_id=the candidate's iNaturalist taxon ID",
    "candidate_count":len(entries),"counts_by_status":totals,
    "definitions":{
       "RECORDS_DOCUMENTED":"At least one Hays County matching public research-grade record with a photo, currently tagged wild on iNaturalist. This is NOT independent field confirmation.",
       "NO_MATCHING_PHOTO_RECORDS":"No matching public photographed research-grade observations currently flagged wild, despite previous overall research-grade counts.",
       "API_ERROR":"Evidence could not be fetched; not a negative ecological finding."
    },
    "limitations":[
       "Research-grade ID on iNaturalist can still be incorrect, especially among look-alike grasses.",
       "A plant marked wild on iNaturalist might have been planted or have inaccurate location/identification.",
       "The query checks observation metadata and presence of photos, not visual morphology or voucher examination.",
       "A Hays occurrence is not the same as Hays County nativity or evidence of a persistent local population.",
       "Distinct observers counted only within sample, not across all county observations.",
       "Photographs are not downloaded or licensed for reuse by this evidence check."
    ],
    "focus_first_five":sorted(FOCUS),
    "results":entries
}
EVIDENCE.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
lines=[
"# Hays County grass observations — live iNaturalist evidence",
"",
"**Research-grade + iNaturalist marked wild + at least one photo + Hays County only.**",
"",
f"Reviewed **{len(entries)}** existing Hays candidate names. "
f"Records documented: **{totals.get('RECORDS_DOCUMENTED',0)}**; "
f"no matching photographed wild record: **{totals.get('NO_MATCHING_PHOTO_RECORDS',0)}**; "
f"API errors: **{totals.get('API_ERROR',0)}**.",
"",
"**This verifies observation-record existence only.** It does *not* certify ID, wild establishment, habitat, or nativity. No species or photos have been added to the website.",
"",
"## First five species — observation evidence",
"",
"| Candidate | Earlier research-grade reports | Wild research-grade records with photos | Observers in checked sample | Example observations |",
"|---|---:|---:|---:|---|"
]
for e in entries:
    if e["scientific_name"] not in FOCUS:continue
    links=", ".join(f"[{v['observation_id']}]({v['url']})" for v in e.get("evidence",[])[:3]) or "No records available"
    lines.append(f"| *{e['scientific_name']}* | {e['previous_research_grade_count']} | {e['wild_photo_research_grade_count']} | {e['distinct_observers_in_sample']} | {links} |")
lines += ["","## All 58 Hays candidates — records check","",
         "| Name | Wild RG photos | Sampled observers | Status |",
         "|---|---:|---:|---|"]
for e in entries:
    lines.append(f"| *{e['scientific_name']}* | {e['wild_photo_research_grade_count'] if e['wild_photo_research_grade_count'] is not None else '—'} | {e['distinct_observers_in_sample']} | {e['documented_status']} |")
lines += ["","## Recommended next gate","",
          "For records-documented candidates, open original Hays observations and inspect flowerhead, collar, leaves, plant habit, location context, and disputed identifications, then cross-check with *Flora of North Central Texas*. Keep horticultural-only or dubious identities separate. Only after accepted name and identification are credible should photo sourcing and anatomy work begin.",
          "",
          "See the [full JSON ledger](inat-2026-11-11-hays-observation-evidence.json) for stable links, dates, photo counts and observer diversity. The current 112 species are unchanged.",
          ""]
REPORT.write_text("\n".join(lines))
print("HAYS_EVIDENCE_SUMMARY",json.dumps({"counts_by_status":totals,"focus":{x["scientific_name"]:{"total":x["wild_photo_research_grade_count"],"observers":x["distinct_observers_in_sample"],"links":[v["url"] for v in x.get("evidence",[])[:3]]} for x in entries if x["scientific_name"] in FOCUS}},separators=(",",":")),flush=True)
