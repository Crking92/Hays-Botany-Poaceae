#!/usr/bin/env python3
"""Hays County 58-name accepted-usage collision and synonym audit via GBIF.

Queries all 58 Hays names AND all 112 existing Poaceae site names against
GBIF species match and dereferences acceptedUsageKey. DO NOT conflate accepted
GBIF backbone with Kew/POWO or Flora of North Central Texas taxon concepts.
Never edit the published grass index, labels, photos, or anatomy.
"""
import json,re,urllib.request,urllib.parse,time,pathlib,collections,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
Q=json.loads((ROOT/"audits/inat-2026-11-11-hays-only.json").read_text())
BASE=json.loads((ROOT/"site/data/poaceae-index.json").read_text())
assert len(Q["candidates"])==58 and len(BASE)==112
def get(url):
    last=None
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={
              "User-Agent":"HaysBotanyTaxonomyReconciliation/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
              "Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=32) as resp:return json.load(resp),None
        except Exception as e:
            last=str(e)
            time.sleep(min(2**attempt,8))
    return None,last
def normalize(s):
    return " ".join(str(s or "").lower().replace("×","x").split())
def binomial(s):
    t=normalize(s)
    t=re.sub(r"\([^)]*\)","",t)
    t=t.split()
    return " ".join(t[:2]) if len(t)>1 else t
CACHE={}
def resolve(name):
    key=normalize(name)
    if key in CACHE:return CACHE[key]
    url="https://api.gbif.org/v1/species/match?"+urllib.parse.urlencode({"name":name,"family":"Poaceae","verbose":"true","strict":"false"})
    r,error=get(url)
    if error:
        z={"query":name,"request_url":url,"error":error,"match_usable":False}
    else:
        m=r.get("matchType")
        status=r.get("status")
        rank=r.get("rank")
        score=r.get("confidence")
        exact=(m=="EXACT")
        usage=r.get("usageKey")
        accepted_key=r.get("acceptedUsageKey") or usage
        # Follow only confident EXACT species-level matches, never a fuzzy or family result.
        usable=bool(exact and rank=="SPECIES" and isinstance(accepted_key,int))
        accepted_payload=None
        accepted_error=None
        if usable and accepted_key:
            accepted_payload,accepted_error=get("https://api.gbif.org/v1/species/"+str(accepted_key))
        z={"query":name,"request_url":url,"match_type":m,"rank":rank,"taxonomic_status":status,
           "confidence":score,"usage_key":usage,"accepted_usage_key":accepted_key,
           "match_scientific_name":r.get("scientificName"),
           "match_canonical_name":r.get("canonicalName"),
           "accepted_canonical_name":(accepted_payload or {}).get("canonicalName"),
           "accepted_scientific_name":(accepted_payload or {}).get("scientificName"),
           "accepted_status":(accepted_payload or {}).get("taxonomicStatus"),
           "accepted_key_query_error":accepted_error,
           "match_usable":usable}
    CACHE[key]=z
    time.sleep(.32)
    return z
main=[]
for idx,b in enumerate(BASE,1):
    v=resolve(b["scientific"])
    main.append({"project_id":b["id"],"project_name":b["scientific"],"gbif":v})
    if idx%20==0:print("MAIN_PROGRESS",idx,flush=True)
bykey=collections.defaultdict(list)
for r in main:
    k=r["gbif"].get("accepted_usage_key") if r["gbif"].get("match_usable") else None
    if k is not None:bykey[k].append({"project_id":r["project_id"],"name":r["project_name"]})
cands=[]
for idx,c in enumerate(Q["candidates"],1):
    v=resolve(c["scientific_name"])
    k=v.get("accepted_usage_key") if v.get("match_usable") else None
    dup=bykey.get(k,[]) if k is not None else []
    status=("POSSIBLE_EXISTING_DUPLICATE_REVIEW" if dup else
            "EXACT_BACKBONE_NAME_RESOLVED" if v.get("match_usable") and v.get("taxonomic_status")=="ACCEPTED" else
            "EXACT_BACKBONE_SYNONYM_REQUIRES_CANONICAL_NAME" if v.get("match_usable") else
            "UNRESOLVED_BACKBONE_MATCH_REQUIRES_KEW_FLORA")
    cands.append({"id":c["queue_id"],"reported_name":c["scientific_name"],
                  "hays_count":c["hays_observations"],"inat_taxon_id":c["inat_taxon_id"],
                  "gbif":v,"existing_112_same_gbif_accepted_key":dup,
                  "screen":status,"final_project_name":None,
                  "source_authority_for_final_name":"NOT_SELECTED",
                  "name_decision":"PENDING_INDEPENDENT_TAXONOMIC_REVIEW"})
    print("CANDIDATE",idx,"of 58",c["scientific_name"],status,v.get("accepted_canonical_name"),("MAIN_ID:"+",".join(x["project_id"] for x in dup) if dup else ""),flush=True)
    time.sleep(.35)
counts=dict(collections.Counter(r["screen"] for r in cands))
out={"checked_date":"2026-11-11","scope":"58 Hays grass candidates crosswalk against 112 published grass names",
     "source":"GBIF species match + acceptedUsageKey dereference; not independent nomenclatural authority",
     "baseline_count":len(main),"candidate_count":len(cands),"screen_counts":counts,
     "warning":"Accepted usage keys reflect GBIF taxonomic concepts, which may conflict with Kew POWO and the regional Flora. A collision is a review lead, not permission to merge.",
     "existing_baseline_gbif_crosswalk":main,"candidate_crosswalk":cands}
path=ROOT/"audits/hays-58-gbif-accepted-usage-crosswalk.json"
path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
md=["# Hays County grass list — GBIF accepted usage and duplicate screening","",
"**GBIF is a secondary database; do not make accepted-name decisions from this alone.**",
"",
"All 58 candidate names were checked against all 112 published names, dereferencing GBIF's accepted taxon keys when the match was exact and species-level.","",
"## Counts",""]
md += ["- "+k+": **"+str(v)+"**" for k,v in sorted(counts.items())]
md += ["","## All 58 results","","| Candidate | GBIF name treatment | Proposed 112 collision | Status |","|---|---|---|---|"]
for c in cands:
  v=c["gbif"]
  name=v.get("accepted_canonical_name") or v.get("match_scientific_name") or "no reliable exact species match"
  dups=", ".join(d["project_id"] for d in c["existing_112_same_gbif_accepted_key"]) or "—"
  md.append("| {} | {} | {} | {} |".format(c["reported_name"],name,dups,c["screen"]))
md+=["",
"## Editorial requirements","",
"1. Consult Kew POWO/WCVP and the user-provided Flora for each proposed accepted name.",
"2. For same-key pairs, check whether synonymy actually applies under the project's chosen species concept.",
"3. Preserve original iNaturalist name aliases; do not create duplicate cards.",
"4. Keep newer accepted genus placements distinct from historical regional Flora key headings.",
"5. Mark uncertain genus and species boundaries for review instead of assigning a false name.",
"6. No live site's 112 species or photo/arrow assets were edited.",
""]
(ROOT/"audits/hays-58-gbif-accepted-usage-crosswalk.md").write_text("\n".join(md))
print("GBIF_ACCEPTED_USAGE_SUMMARY",json.dumps(counts),flush=True)
