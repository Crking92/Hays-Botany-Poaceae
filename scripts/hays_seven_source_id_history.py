#!/usr/bin/env python3
"""Review metadata + ID histories for 7 Hays iNaturalist photo-rights holds.

Does not download, reproduce or publish any observer media. Does not change
published botanical data. Preserves iNaturalist source IDs and user names only
as necessary for provenance; coordinates/locality strings are not exported.
"""
import json, pathlib, time, urllib.request, collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
P=ROOT/"audits/hays-58-photo-access-holds-20261111.json"
OUT=ROOT/"audits/hays-58-photo-access-holds-id-history-20261111.json"
MD=ROOT/"audits/hays-58-photo-access-holds-id-history-20261111.md"
src=json.loads(P.read_text())
assert len(src["records"])==7
def fetch(u):
  last=None
  for attempt in range(4):
    try:
      req=urllib.request.Request(u,headers={
        "User-Agent":"HaysBotanyObservationHistoryReview/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
        "Accept":"application/json"})
      with urllib.request.urlopen(req,timeout=40) as f:return json.load(f),None
    except Exception as ex:
      last=str(ex);time.sleep(min(2**attempt,8))
  return None,last
results=[]
for row in src["records"]:
  oid=row["source_observation_ids"][0]
  base="https://api.inaturalist.org/v1/observations/"+str(oid)
  data,error=fetch(base)
  if error:
    results.append({"candidate":row["name"],"observation_id":oid,"retrieval_status":"ERROR","error":error[:180],"image_pixels_inspected":False})
    continue
  obs=(data.get("results") or [{}])[0]
  ident=[]
  for idn in obs.get("identifications",[]):
    tax=idn.get("taxon") or {}
    user=idn.get("user") or {}
    ident.append({"taxon":tax.get("name"),"taxon_id":tax.get("id"),"category":idn.get("category"),"current":idn.get("current"),"own_observation":user.get("id")==(obs.get("user") or {}).get("id"),"user":user.get("login"),"body_excerpt":(idn.get("body") or "")[:240]})
  photo=[]
  for p in obs.get("photos") or []:
    photo.append({"photo_id":p.get("id"),"license_code":p.get("license_code"),"attribution":p.get("attribution"),"image_bytes_retrieved":False})
  tax=obs.get("taxon") or {}
  agree=obs.get("num_identification_agreements")
  disagree=obs.get("num_identification_disagreements")
  result={
    "candidate":row["name"],"observation_id":oid,
    "observation_url":"https://www.inaturalist.org/observations/"+str(oid),
    "retrieval_status":"OK",
    "reported_taxon_name":tax.get("name"),"reported_taxon_id":tax.get("id"),
    "observer":(obs.get("user") or {}).get("login"),
    "observed_on":obs.get("observed_on"),
    "quality_grade":obs.get("quality_grade"),
    "captive_flag":obs.get("captive"),
    "place_accuracy_m":obs.get("positional_accuracy"),
    "photos":photo,
    "number_photos":len(photo),
    "photo_license_counts":dict(collections.Counter((p.get("license_code") or "all-rights-reserved-or-unspecified") for p in photo)),
    "identification_agreements":agree,
    "identification_disagreements":disagree,
    "full_id_history":ident,
    "comments_count":len(obs.get("comments") or []),
    "observed_description_excerpt":(obs.get("description") or "")[:350],
    "image_pixels_inspected":False,
    "botanical_species_id_confirmed":False,
    "suitability_for_merge":"NOT_READY"
  }
  results.append(result)
  print("HOLD_REVIEW",row["name"],oid,"licenses",result["photo_license_counts"],"ids",len(ident),"agree",agree,"disagree",disagree,"grade",obs.get("quality_grade"),flush=True)
  time.sleep(.2)
out={"checked_date":"2026-11-11","scope":"7 Hays County grass observation media holds",
"method":"Original observation detail and identification history metadata only. No photo bytes copied; no coordinates/location details saved.",
"limitations":["iNaturalist Research Grade is not an expert-confirmed specimen ID.",
 "A zero for eligible image licenses is not proof there are no source photos.",
 "Observation flag captive=false does not establish natural recruitment/escaped populations.",
 "Historical identifications include replaced and superseded IDs; only current status is meaningful.",
 "The seven photo pixels remain NOT viewed here."],
 "records":results}
OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
md=["# Hays 58 — seven inaccessible-photo observation histories","",
 "**No image pixels were reviewed in this pass.** The seven original observation pages were queried directly for photo-level rights, identification votes, and date/context metadata. No image bytes or coordinates were fetched or saved.",
 "",
 "| iNaturalist name | Obs | Photos | Photo licenses | ID agreements/disagreements | Current taxon |",
 "|---|---|---:|---|---|---|"]
for z in results:
 if z["retrieval_status"]!="OK":
   md.append(f'| *{z["candidate"]}* | [{z["observation_id"]}](https://www.inaturalist.org/observations/{z["observation_id"]}) | — | API ERROR | — | — |')
 else:
   lic=", ".join(f"{k}: {v}" for k,v in z["photo_license_counts"].items())
   md.append(f'| *{z["candidate"]}* | [{z["observation_id"]}]({z["observation_url"]}) | {z["number_photos"]} | {lic} | {z["identification_agreements"]} / {z["identification_disagreements"]} | *{z["reported_taxon_name"]}* |')
md+=["","## What this means","","- The presence of a research-grade name and ID votes documents a claim, not the presence of diagnostic spikelet parts.","- For all-rights-reserved photos, open the original page yourself or request direct viewing permission from the observer; don't copy the image into the public repo.","- For single-record observations, seek nearby herbarium voucher evidence and multiple observers before calling an established local wild population.","- Retain all seven on an explicit IMAGE-ID-REVIEW hold until actual pixels or a verified voucher can be examined.","","See [complete data and prior identification history](hays-58-photo-access-holds-id-history-20261111.json).",""]
MD.write_text("\n".join(md))
print("HOLDS_METADATA_SUMMARY",len(results),"okay",sum(x.get("retrieval_status")=="OK" for x in results),flush=True)
