#!/usr/bin/env python3
"""Photo ID QA preparation for all 58 Hays County grasses.

Fetches public iNaturalist observation and photo metadata. DOES NOT download
or publish third-party photo bytes. Does not change live 112-species collection.
This is review preparation; image pixels still require visual examination.
"""
import json,pathlib,urllib.request,urllib.parse,time,statistics,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
QUEUE=json.loads((ROOT/"audits/inat-2026-11-11-hays-only.json").read_text())
DEST=ROOT/"audits/hays-58-photo-evidence-review.json"
REPORT=ROOT/"audits/hays-58-photo-evidence-review.md"
assert len(QUEUE["candidates"])==58
def get(params):
    url="https://api.inaturalist.org/v1/observations?"+urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={
              "User-Agent":"HaysBotanyObservationPhotoQA/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
              "Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=40) as r:return json.load(r),url
        except Exception as err:
            last=str(err)
            time.sleep(2**attempt)
    raise RuntimeError(last)
output=[]
for idx,row in enumerate(QUEUE["candidates"],1):
    p={"place_id":326,"taxon_id":row["inat_taxon_id"],"quality_grade":"research","captive":"false","photos":"true","order_by":"observed_on","order":"desc","per_page":12}
    try:
        j,url=get(p)
        examples=[]
        for obs in j.get("results",[]):
            ps=[]
            for ph in (obs.get("photos") or [])[:4]:
                photo_url=ph.get("url")
                ps.append({"photo_id":ph.get("id"),"preview_url":photo_url,
                           "license_code":ph.get("license_code"),"attribution":ph.get("attribution"),
                           "width":(ph.get("original_dimensions") or {}).get("width"),
                           "height":(ph.get("original_dimensions") or {}).get("height")})
            examples.append({
              "observation_id":obs.get("id"),
              "observation_url":"https://www.inaturalist.org/observations/"+str(obs.get("id")),
              "observed_on":obs.get("observed_on"),
              "observer":(obs.get("user") or {}).get("login"),
              "reported_taxon":(obs.get("taxon") or {}).get("name"),
              "taxon_id":(obs.get("taxon") or {}).get("id"),
              "quality_grade":obs.get("quality_grade"),
              "captive":obs.get("captive"),
              "agreements":obs.get("num_identification_agreements"),
              "disagreements":obs.get("num_identification_disagreements"),
              "identifications_count":len(obs.get("identifications") or []),
              "description_excerpt":str(obs.get("description") or "")[:240],
              "photo_count":len(obs.get("photos") or []),
              "photos":ps,
            })
        n_obs=len(examples)
        obs_n=len({z["observer"] for z in examples if z["observer"]})
        unique_dates=len({z["observed_on"] for z in examples if z["observed_on"]})
        mismatch=sum(1 for z in examples if z["taxon_id"]!=row["inat_taxon_id"])
        disagree=sum(1 for z in examples if z["disagreements"] is not None and z["disagreements"]>0)
        any_3=sum(1 for z in examples if z["photo_count"]>=3)
        labels=[]
        if row["hays_observations"]<=2:labels.append("VERY_SPARSE_LOCAL_RECORDS")
        if row["hays_observations"]<=4:labels.append("LIMITED_LOCAL_RECORDS")
        if mismatch:labels.append("TAXON_ID_MISMATCH_IN_SAMPLE")
        if disagree:labels.append("DISAGREEMENTS_IN_SAMPLE")
        if obs_n<=1:labels.append("ONLY_ONE_SAMPLED_OBSERVER")
        if not any_3:labels.append("NO_3_PLUS_PHOTO_OBSERVATION_IN_SAMPLE")
        if "CHECK_PLANTED_OR_ESCAPED" in row.get("review_flags",[]):labels.append("PLANTED_ESCAPE_CONTEXT")
        if "TAXONOMIC_REVIEW" in row.get("review_flags",[]):labels.append("NAME_REVIEW")
        state="PHOTO_LINKS_READY_FOR_VISUAL_INSPECTION" if examples else "NO_OBSERVATIONS_RETURNED"
        result={
          "queue_id":row["queue_id"],"name":row["scientific_name"],"inat_taxon_id":row["inat_taxon_id"],
          "hays_research_grade_wild_photo_count":j.get("total_results"),
          "sample_size":n_obs,"sample_unique_observers":obs_n,"sample_unique_dates":unique_dates,
          "sample_multi_photo_records":any_3,"sample_with_disagreements":disagree,
          "sample_with_taxon_id_mismatch":mismatch,
          "risk_flags":labels,"photo_id_review_status":state,
          "photo_pixels_visually_inspected":False,
          "botanical_species_identity_confirmed":False,
          "native_or_wild_establishment_verified":False,
          "query_url":url,
          "observations":examples,
        }
    except Exception as e:
        result={"queue_id":row["queue_id"],"name":row["scientific_name"],"inat_taxon_id":row["inat_taxon_id"],
                "photo_id_review_status":"API_ERROR","error":str(e)[:250],
                "photo_pixels_visually_inspected":False,"botanical_species_identity_confirmed":False,
                "observations":[]}
    output.append(result)
    print("PHOTO_EVIDENCE",idx,"/58",result["name"],result["photo_id_review_status"],"sample",result.get("sample_size"),"photo3+",result.get("sample_multi_photo_records"),flush=True)
    time.sleep(0.45)
counts=dict(collections.Counter(z["photo_id_review_status"] for z in output))
summary={
"report_date":"2026-11-11","scope":"58 iNaturalist Hays County grass candidates",
"record_source":"iNaturalist GET /v1/observations; Hays place ID 326",
"filters":"research grade, captive=false, photos=true; latest 12 observations per species",
"disclosure":"Downloaded zero photos. All preview links are pointers to original external iNaturalist photos, not licenses for reuse.",
"candidate_count":len(output),"statuses":counts,
"total_observations_sampled":sum(z.get("sample_size",0) for z in output),
"sum_unique_observers_per_taxon":sum(z.get("sample_unique_observers",0) for z in output),
"species_with_3_plus_photo_observation":sum(z.get("sample_multi_photo_records",0)>0 for z in output),
"species_with_sample_disagreements":sum(z.get("sample_with_disagreements",0)>0 for z in output),
"species_with_single_sampled_observer":sum(z.get("sample_unique_observers",0)<=1 for z in output),
"species_with_too_few_records":sum(z.get("hays_research_grade_wild_photo_count",0)<=2 for z in output if isinstance(z.get("hays_research_grade_wild_photo_count"),int)),
"limitations":["Photo links and identification metadata alone DO NOT prove morphology or exact field ID.",
"Research-grade community consensus can contain wrong grass identifications.",
"Wild-tagged records can be cultivated or ambiguous.",
"Source photos are third-party copyrighted; review image-level attribution and licensing before any reuse.",
"Details of the identification histories and anatomy must be manually checked in the original observation pages.",
"No coordinates or precise locality strings are stored."],
"records":output}
DEST.write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n")
lines=["# Hays County 58-grass photo-ID evidence preparation",
       "",
       "**This is a photo-link/metadata pass, not image-pixel or botanist species verification.**",
       "",
       f"- Species: **{summary['candidate_count']}**",
       f"- Sampled observations: **{summary['total_observations_sampled']}**",
       f"- Species with a sampled observation of 3+ photos: **{summary['species_with_3_plus_photo_observation']}**",
       f"- Species with disagreement in sampled records: **{summary['species_with_sample_disagreements']}**",
       f"- Species with one or fewer sampled observers: **{summary['species_with_single_sampled_observer']}**",
       "",
       "## All 58 observation photo-review queues",
       "",
       "| Candidate | Sampled observers | 3+ photo records | Flags | Source example |",
       "|---|---:|---:|---|---|"]
for x in output:
    first=x.get("observations",[None])[0] if x.get("observations") else None
    url=f"[open]({first['observation_url']})" if first else "—"
    lines.append("| {} | {} | {} | {} | {} |".format(x["name"],x.get("sample_unique_observers","—"),x.get("sample_multi_photo_records","—"),", ".join(x.get("risk_flags",[])) or "—",url))
lines += ["",
"## What a visual identification review must establish",
"",
"1. Open multiple independent Hays observation photo sets, especially those with flowering and ligule details.",
"2. Compare mature panicle/raceme, complete spikelets and glumes/lemma traits against Flora of North Central Texas; use Flora of North America when appropriate.",
"3. Inspect whether the photos show a wild stand versus cultivated landscaping, fields or turf; record evidence, not assumptions.",
"4. Mark ambiguous photos 'insufficient characters' and retain the species in the review queue.",
"5. Do not republish other people's photos without checking exact photo licenses; nothing is copied into the live repository.",
"",
"The machine-readable [photo metadata file](hays-58-photo-evidence-review.json) includes original observation/photo links, observer names, dates, available license codes, disagreement counts and explicit NOT-YET-VISUALLY-INSPECTED status.",
""]
REPORT.write_text("\n".join(lines))
print("PHOTO_EVIDENCE_TOTALS",json.dumps({k:v for k,v in summary.items() if k not in ["records","limitations"]},separators=(",",":")),flush=True)
