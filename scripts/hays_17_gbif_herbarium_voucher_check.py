#!/usr/bin/env python3
"""Cross-check Hays grass candidates for independent preserved specimens in GBIF.

Not proof of identification; these are potential voucher leads requiring original
herbarium label/specimen review. No original coordinates/locality descriptions
or observer photos are stored. Does not edit the published grass collection.
"""
import urllib.request,urllib.parse,json,pathlib,time,collections,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"audits/hays-grasses-independent-voucher-leads-20261111.json"
MD=ROOT/"audits/hays-grasses-independent-voucher-leads-20261111.md"
NAME_GROUPS={
 "Alopecurus carolinianus":["Alopecurus carolinianus"],
 "Cenchrus setaceus":["Cenchrus setaceus","Pennisetum setaceum"],
 "Digitaria californica":["Digitaria californica","Trichachne californica"],
 "Elymus macgregorii":["Elymus macgregorii"],
 "Lolium × boucheanum":["Lolium boucheanum"],
 "Panicum dichotomiflorum":["Panicum dichotomiflorum"],
 "Sporobolus cryptandrus":["Sporobolus cryptandrus"],
 "Aegilops cylindrica":["Aegilops cylindrica"],
 "Tridentopsis elongata":["Tridentopsis elongata","Tridens muticus var. elongatus"],
 "Echinochloa walteri":["Echinochloa walteri"],
 "Sphenopholis obtusata":["Sphenopholis obtusata"],
 "Coelorachis cylindrica":["Coelorachis cylindrica","Mnesithea cylindrica","Rottboellia campestris"],
 "Paspalum langei":["Paspalum langei"],
 "Tridens congestus":["Tridens congestus"],
 "Pappophorum bicolor":["Pappophorum bicolor"],
 "Janochloa antidotalis":["Janochloa antidotalis","Panicum antidotale"],
 "Stapfochloa canterae":["Stapfochloa canterae","Chloris canterae"]
}
assert len(NAME_GROUPS)==17
def get(params):
 url="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode(params)
 err=None
 for k in range(4):
  try:
   req=urllib.request.Request(url,headers={
    "User-Agent":"HaysBotanyVoucherEvidenceAudit/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
    "Accept":"application/json"})
   with urllib.request.urlopen(req,timeout=35) as res:return json.load(res),url,None
  except Exception as ex:
   err=str(ex);time.sleep(min(2**k,8))
 return None,url,err
result=[]
for target,names in NAME_GROUPS.items():
 leads=[];queries=[];errors=[];seen=set()
 for species_name in names:
  for county in ["Hays","Hays County"]:
   parms={"scientificName":species_name,"country":"US","county":county,"basisOfRecord":"PRESERVED_SPECIMEN","limit":30}
   d,u,err=get(parms)
   if err:errors.append({"name":species_name,"county":county,"error":err[:180]});continue
   queries.append({"name":species_name,"county":county,"total_index_hits":d.get("count"),"url":u})
   for x in d.get("results",[]):
    bid=x.get("gbifID") or x.get("key")
    if bid in seen:continue
    locCounty=(x.get("county") or "").lower()
    locState=(x.get("stateProvince") or "").lower()
    if "hays" not in locCounty:continue
    # Missing or ambiguous state is kept as a verification flag rather than asserted Hays TX.
    if locState and not (locState in ["tx","tex.","texas"] or "texas" in locState):continue
    seen.add(bid)
    leads.append({
      "gbif_occurrence_key":bid,
      "record_url":f"https://www.gbif.org/occurrence/{bid}",
      "dataset_name":x.get("datasetName"),
      "institution_code":x.get("institutionCode"),
      "collection_code":x.get("collectionCode"),
      "catalog_number":x.get("catalogNumber"),
      "recorded_name":x.get("scientificName"),
      "accepted_name":x.get("acceptedScientificName"),
      "recorded_year":x.get("year"),
      "county":x.get("county"),
      "state":x.get("stateProvince"),
      "basis":x.get("basisOfRecord"),
      "has_coordinate":x.get("hasCoordinate"),
      "needs_original_specimen_label_verification":True,
      "state_not_explicit":not bool(locState)
    })
   time.sleep(.22)
 result.append({
   "candidate":target,"queried_names":names,"county_queries":queries,
   "possible_preserved_specimens":len(leads),
   "potential_voucher_leads":leads[:25],
   "query_errors":errors,
   "status":"POSSIBLE_INDEPENDENT_VOUCHER_LEADS" if leads else "NO_MATCHING_PRESERVED_SPECIMEN_INDEX_HIT_NOT_PROOF_ABSENT",
   "specimen_image_or_label_independently_verified":False,
   "species_identification_confirmed":False,
   "merge_ready":False})
 print("HAYS_VOUCHER",target,"possible",len(leads),"errors",len(errors),flush=True)
out={"date":"2026-11-11","input_targets":len(NAME_GROUPS),
 "purpose":"Independent voucher leads for seven single-record access holds and ten stronger local grasses.",
 "search_scope":"GBIF indexed PRESERVED_SPECIMEN country=US, county Hays/Hays County, exact candidate name and selected historical combinations. State Texas where supplied.",
 "warnings":["GBIF counts are INDEX HITS only, not a curated voucher validation. Original herbarium labels and the determination must be checked.",
 "GBIF may re-index duplicate specimen images/copies or omit county field; a missing hit does not show a species is absent.",
 "Old scientific combinations can represent broader species concepts (for example, Tridens muticus var elongatus), so never treat a name-only match as current species proof.",
 "County name fields may be wrong or the specimen itself may be cultivated or misidentified.",
 "No specimen image bytes, precise coordinates or locality descriptions were copied, and no published species data was changed."],
 "records":result}
OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
md=["# Hays County grasses — independent herbarium voucher leads","",
"**This is a GBIF preserved-specimen index cross-check, not a verified specimen examination.** It covers the seven photo-access holds plus ten stronger photo-identified candidate grasses. Never use a hit count to certify Hays County nativity, a correct botanical ID, or spontaneous establishment.",
"",
"| Name | Potential GBIF preserved specimens | Representative voucher links |",
"|---|---:|---|"]
for x in result:
 refs=", ".join(f"[{z['gbif_occurrence_key']}]({z['record_url']})" for z in x["potential_voucher_leads"][:3]) or "None in this query"
 md.append(f"| *{x['candidate']}* | {x['possible_preserved_specimens']} | {refs} |")
md+=["","## Next voucher QA","","For any possible Hays record, open original herbarium images and labels, confirm the collector, county, date, species determination, and whether it was cultivated; reconcile name/synonyms and Flora morphological features. No GBIF match has been marked a verified species identity.","",
"**No matches does not mean no local herbarium voucher exists:** digitization, county metadata and synonyms are incomplete. The JSON file contains exact query parameters and sample records, with no exact locality coordinates.",""]
MD.write_text("\n".join(md))
print("VOUCHER_SUMMARY",json.dumps({r["candidate"]:r["possible_preserved_specimens"] for r in result},separators=(",",":")),flush=True)
