#!/usr/bin/env python3
"""Corrected GBIF Hays County voucher search with *supported* search filters.

Unlike the superseded 2026-11-11 audit this does NOT use the unsupported
\`county=Hays\` search param. Pages through **all Texas** preserved specimen
results then checks each returned original county name. The GADM path is an
additional future coverage route for georeferenced specimens with no county
text; this report must not be called an exhaustive county inventory.
No precise coordinates / localities and no image bytes saved.
"""
from __future__ import annotations
import json, pathlib, urllib.request, urllib.parse, time, re, collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"audits/hays-17-texas-paginated-voucher-recheck-20261111.json"
MD=ROOT/"audits/hays-17-texas-paginated-voucher-recheck-20261111.md"
TARGETS={
"Alopecurus carolinianus":["Alopecurus carolinianus"],
"Cenchrus setaceus":["Cenchrus setaceus","Pennisetum setaceum"],
"Digitaria californica":["Digitaria californica","Trichachne californica"],
"Elymus macgregorii":["Elymus macgregorii"],
"Lolium × boucheanum":["Lolium boucheanum","Lolium x boucheanum"],
"Panicum dichotomiflorum":["Panicum dichotomiflorum"],
"Sporobolus cryptandrus":["Sporobolus cryptandrus"],
"Aegilops cylindrica":["Aegilops cylindrica"],
"Tridentopsis elongata":["Tridentopsis elongata","Tridens elongatus","Tridens muticus var. elongatus"],
"Echinochloa walteri":["Echinochloa walteri"],
"Sphenopholis obtusata":["Sphenopholis obtusata"],
"Coelorachis cylindrica":["Coelorachis cylindrica","Mnesithea cylindrica","Rottboellia campestris"],
"Paspalum langei":["Paspalum langei"],
"Tridens congestus":["Tridens congestus"],
"Pappophorum bicolor":["Pappophorum bicolor"],
"Janochloa antidotalis":["Janochloa antidotalis","Panicum antidotale"],
"Stapfochloa canterae":["Stapfochloa canterae","Chloris canterae"]
}
assert len(TARGETS)==17
def get(url):
 for k in range(4):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyPaginatedCountyAudit/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)","Accept":"application/json"})
   with urllib.request.urlopen(req,timeout=45) as r:return json.load(r),None
  except Exception as ex:
   error=str(ex);time.sleep(min(2**k,8))
 return None,error
def norm(s):return re.sub(r"\s+"," ",str(s or "").lower().replace("×","x").strip())
def name_relation(candidate, names, record):
 observed=norm(record.get("scientificName"))
 verbatim=norm(record.get("verbatimScientificName"))
 accepted=norm(record.get("acceptedScientificName"))
 supplied=[norm(x) for x in names]
 # Matches require an actual recorded or original accepted name string matching
 # whole binomial / original variety name; not fuzzy 'contains' or accepted broad
 # species matching a DIFFERENT infraspecific specimen.
 def properprefix(v,n):
  if not v:return False
  return v==n or v.startswith(n+" ") or v.startswith(n+" (")
 hits=[n for n in supplied if properprefix(observed,n) or properprefix(verbatim,n)]
 if hits:return "NAME_ALIGNED_REPORTED_OR_VERBATIM",hits
 if observed.startswith(norm(candidate)+" ") or accepted.startswith(norm(candidate)+" "):
  return "ONLY_ACCEPTED_NAME_MATCH_NEEDS_SPECIMEN_CHECK",[]
 return "RELATED_OR_MISMATCHED_NAME_EXCLUDE",[]
def in_hays(x):
 c=norm(x.get("county")).replace(" county","")
 state=norm(x.get("stateProvince")).replace(".","")
 return c=="hays" and (not state or state in ("texas","tex","tx"))
def safe_record(x,review,matched):
 return {"gbif_id":x.get("gbifID") or x.get("key"),
  "record_url":"https://www.gbif.org/occurrence/"+str(x.get("gbifID") or x.get("key")),
  "catalog":x.get("catalogNumber"),"institution":x.get("institutionCode"),"collection":x.get("collectionCode"),
  "date":x.get("eventDate"),"year":x.get("year"),
  "name_on_record":x.get("scientificName"),"verbatim_name":x.get("verbatimScientificName"),
  "accepted_name":x.get("acceptedScientificName"),
  "state":x.get("stateProvince"),"county":x.get("county"),
  "basis":x.get("basisOfRecord"),"matched_original_queries":matched,
  "name_match_type":review,"label_and_image_checked":False,
  "not_planted_or_exotically_established_confirmed":False,
  "botanical_ID_verified":False}
result=[]
for i,(target,names) in enumerate(TARGETS.items(),1):
  included={};excluded={};errors=[];pages=0;overall=0;complete=True
  for name in names:
   offset=0;per_page=300;series=0
   while True:
    q={"scientificName":name,"country":"US","stateProvince":"Texas",
        "basisOfRecord":"PRESERVED_SPECIMEN","limit":per_page,"offset":offset}
    u="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode(q)
    j,error=get(u)
    if error or not j:
      errors.append({"name":name,"offset":offset,"error":(error or "unknown")[:200]})
      complete=False;break
    pages+=1
    if offset==0:overall+=j.get("count",0)
    observations=j.get("results") or []
    for x in observations:
      if not in_hays(x):continue
      status,hits=name_relation(target,names,x)
      z=safe_record(x,status,hits)
      key=z["gbif_id"]
      if status=="RELATED_OR_MISMATCHED_NAME_EXCLUDE":
        excluded[key]=z
      else:
        included[key]=z
    series+=len(observations)
    if j.get("endOfRecords") or not observations:break
    offset+=len(observations)
    if offset>=24000:
      errors.append({"name":name,"offset":offset,"error":"Safety limit: >24000 Texas records, search truncated"})
      complete=False;break
    time.sleep(.12)
   print("TEXAS_NAME_PAGE_RESULT",target,name,"scanned",series,"queryCountTexas",j.get("count") if j else None,flush=True)
  included_list=sorted(included.values(),key=lambda z:(z["name_match_type"],z["institution"] or ""))
  excluded_list=list(excluded.values())
  rec={"candidate":target,"queried_names":names,"texas_index_count_sum_can_double_count_synonyms":overall,
       "pages_fetched":pages,"search_completed_all_pages":complete,
       "hays_name_aligned_specimen_count":len(included_list),
       "name_aligned_hays_leads":included_list[:200],
       "hays_related_or_misidentified_name_exclusions":excluded_list[:75],
       "excluded_count":len(excluded_list),
       "errors":errors,
       "source_evidence_status":"COUNTY_TEXT_MATCH_INDEX_ONLY_NOT_SPECIMEN_VERIFIED",
       "absence_statement_allowed":False}
  result.append(rec)
  print("TEXAS_PAGINATED_HAYS",i,"/17",target,"match",len(included_list),"excl",len(excluded_list),"pages",pages,"complete",complete,flush=True)
out={"date":"2026-11-11",
 "correction_of":"audits/hays-grasses-independent-voucher-leads-20261111.json",
 "method":"GBIF occurrence search with valid stateProvince=Texas, US and PRESERVED_SPECIMEN filters; full pages; exact returned county Hays; verify name correspondence after retrieval. This covers Texas records with state field and county text, NOT all georeferenced records or unindexed collections.",
 "total_targets":17,
 "all_targets_queried":len(result),
 "targets_with_matching_hays_index_leads":sum(x["hays_name_aligned_specimen_count"]>0 for x in result),
 "total_name_aligned_hays_hits":sum(x["hays_name_aligned_specimen_count"] for x in result),
 "warnings":["Broad GBIF scientificName matching and accepted name harmonization can return different varietal species; inspect original determination.",
 "Dataset index may contain multiple sheets of the same gathering and non-TEX institutional copies.",
 "No direct herbarium images have been inspected from the new index results.",
 "No returned exact-county record is proof of valid species ID or wild population.",
 "Records lacking Texas state or Hays county text are outside scope, not absent."],
 "records":result}
OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
md=["# Corrected Hays County preserved-specimen index audit — Texas paginated",
"",
"**Replaces the previously invalid zero-count conclusions.** Uses valid GBIF \`stateProvince=Texas\` plus complete pagination, then checks each returned \`county\` field (and scientific name) for Hays County. No images or exact locality coordinates were stored.",
"",
"| Candidate | Name-aligned Hays specimen index leads | Related-name exclusions | Full page scan | Representative source links |",
"|---|---:|---:|---|---|"]
for x in result:
 links=", ".join(f"[{y['institution']} {y['catalog']}]({y['record_url']})" for y in x["name_aligned_hays_leads"][:3]) or "—"
 md.append(f"| *{x['candidate']}* | {x['hays_name_aligned_specimen_count']} | {x['excluded_count']} | {'Yes' if x['search_completed_all_pages'] else 'No'} | {links} |")
md += ["","## Meaning","",
 "A result is a name-aligned **GBIF index lead**. Source specimens and determinations still need verification; old genus combinations and variety names may be treated differently by Kew, FNA and GBIF. No species is approved for merging.",
 "",
 "A zero here only means no matching \`county=Hays\` text among indexed GBIF preserved specimens with \`stateProvince=Texas\` after the requested-name search. It does **not** establish absence. The GADM georeferenced route, and botanical collections not indexed in GBIF, remain separate.",
 "",
 "Superseded first-pass query: [county-filter correction](hays-gbif-county-query-correction-20261111.md). Machine-readable per-accession IDs: [JSON](hays-17-texas-paginated-voucher-recheck-20261111.json).",""]
MD.write_text("\n".join(md))
print("PAGINATED_HAYS_RESULTS",json.dumps({r["candidate"]:r["hays_name_aligned_specimen_count"] for r in result},sort_keys=True),flush=True)
