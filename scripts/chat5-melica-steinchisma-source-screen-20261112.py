#!/usr/bin/env python3
"""Read-only source screen for two Poaceae blank galleries. No publishing or source approvals."""
import hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

TARGETS = {
    "Melica nitens": [379835068,363172021,361851494,282514813],
    
}
UA = "Hays-Botany-Photo-Source-Review/1.0 (GitHub Crking92/Hays-Botany-Poaceae)"
PERMITTED = {
  "https://creativecommons.org/licenses/by/4.0": "CC BY 4.0",
  "https://creativecommons.org/licenses/by-sa/4.0": "CC BY-SA 4.0",
  "https://creativecommons.org/licenses/by/3.0": "CC BY 3.0",
  "https://creativecommons.org/licenses/by-sa/3.0": "CC BY-SA 3.0",
}
def get(url,limit=12_000_000):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*"})
    with urllib.request.urlopen(req,timeout=22) as f:
        b=f.read(limit+1)
    if len(b)>limit: raise ValueError("size>limit")
    return b
def data(url): return json.loads(get(url,5_000_000))
def original(p):
    url=p.get("url") or ""
    for role in ("square","thumb","small","medium","large"):
        url=url.replace("/"+role+".","/original.")
    if "/original." not in url: raise ValueError("Unknown original photo path")
    return url

cands=json.loads(Path("site/visual-key-lab/hays-candidates.json").read_text())["candidates"]
current=[p for c in cands for p in (c.get("approved_gallery") or [])]
used_text=json.dumps(current)
n=0; holds=0; total=0
for species,observations in TARGETS.items():
    for obsid in observations:
        try:
            o=(data(f"https://api.inaturalist.org/v1/observations/{obsid}").get("results") or [])[0]
            name=(o.get("taxon") or {}).get("name")
            print("OBSERVATION "+json.dumps({"species":species,"obsid":obsid,
               "source_taxon":name,"quality_grade":o.get("quality_grade"),
               "photo_count":len(o.get("photos") or []),"page":f"https://www.inaturalist.org/observations/{obsid}"}),flush=True)
            if name!=species: raise ValueError(f"Exact source species label differs: {name}")
            if o.get("quality_grade")!="research": raise ValueError("Not source research grade")
            for p in (o.get("photos") or [])[:3]:
                total+=1
                pid=p.get("id")
                output={"species":species,"observation_id":obsid,"photo_id":pid,
                        "photo_page":f"https://www.inaturalist.org/photos/{pid}"}
                try:
                    code=(p.get("license_code") or "").lower()
                    output["photo_license_code"]=code
                    if code not in ("cc0","cc-by","cc-by-sa"):
                        raise ValueError("Photo-specific license unsupported or restricted")
                    user=p.get("user") or o.get("user") or {}
                    creator=p.get("attribution") or user.get("name") or user.get("login")
                    output["creator"]=creator
                    if not creator: raise ValueError("No creditable creator")
                    if str(pid) in used_text: raise ValueError("Photo ID already in published manifest")
                    if code=="cc0":
                        output["license"]="CC0 1.0"
                        output["license_url"]="https://creativecommons.org/publicdomain/zero/1.0/"
                    else:
                        key=f"https://www.inaturalist.org/observations/{obsid}"
                        url="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode({"occurrenceId":key,"limit":30})
                        hits=[]
                        for rec in data(url).get("results",[]):
                            if rec.get("occurrenceID")!=key: continue
                            for media in rec.get("media") or []:
                                if f"/photos/{pid}/" in (media.get("identifier") or ""): hits.append((rec,media))
                        if len(hits)!=1: raise ValueError(f"Exact photo GBIF license version match count {len(hits)}")
                        rec,media=hits[0]
                        license_url=(media.get("license") or "").replace("http:","https:").rstrip("/")
                        if license_url not in PERMITTED: raise ValueError("License version not verified")
                        if code=="cc-by" and "/by/" not in license_url: raise ValueError("License class mismatch")
                        if code=="cc-by-sa" and "/by-sa/" not in license_url: raise ValueError("License class mismatch")
                        output.update(license=PERMITTED[license_url],license_url=license_url+"/",
                            gbif_occurrence=f"https://www.gbif.org/occurrence/{rec.get('key')}",
                            gbif_creator=media.get("creator"),gbif_rightsholder=media.get("rightsHolder"))
                    url=original(p)
                    b=get(url)
                    img=Image.open(io.BytesIO(b));img.verify()
                    img=Image.open(io.BytesIO(b))
                    width,height=img.size
                    if min(width,height)<600: raise ValueError(f"Too small for useful gallery ({width}x{height})")
                    sha=hashlib.sha256(b).hexdigest()
                    if sha in used_text: raise ValueError("Exact original hash in published manifest")
                    output.update(original_media_url=url,original_sha256=sha,original_bytes=len(b),
                      width=width,height=height,
                      status="SOURCE_RIGHTS_ORIGINAL_BYTES_PASS_VISUAL_ID_AND_ARCHIVE_REVIEW_STILL_REQUIRED")
                    n+=1
                    print("SOURCE_CANDIDATE "+json.dumps(output,sort_keys=True),flush=True)
                except Exception as e:
                    holds+=1
                    output.update(status="HOLD",reason=str(e))
                    print("SOURCE_HOLD "+json.dumps(output,sort_keys=True),flush=True)
                time.sleep(.2)
        except Exception as e:
            holds+=1
            print("OBSERVATION_HOLD "+json.dumps({"species":species,"observation_id":obsid,"reason":str(e)}),flush=True)
print("SOURCE_SCREEN_SUMMARY "+json.dumps({"possible_source_candidates":n,"photo_holds":holds,
    "photos_seen":total,"species_reviewed":len(TARGETS),"new_photos_published":0,
    "current_provisional_gallery_refs":len(current),
    "none_of_this_is_a_species_identification_or_final_photo_clearance":True}),flush=True)

# Bounded, species-specific global rescue after original Hays-source photographs failed
# rights checks. Query Melica nitens only; never broaden to generic Melica lookalikes.
try:
    seed=(data("https://api.inaturalist.org/v1/observations/379835068").get("results") or [])[0]
    taxonid=(seed.get("taxon") or {}).get("id")
    if not taxonid: raise ValueError("No exact source taxon ID")
    q=urllib.parse.urlencode({"taxon_id":taxonid,"quality_grade":"research","photos":"true",
      "per_page":24,"order_by":"created_at","order":"desc"})
    raw=data("https://api.inaturalist.org/v1/observations?"+q)
    results=[o for o in raw.get("results",[]) if (o.get("taxon") or {}).get("name")=="Melica nitens"]
    print("GLOBAL_MELICA_SCAN "+json.dumps({"taxon_id":taxonid,"queried_observations":len(results),
      "reported_total":raw.get("total_results")}),flush=True)
    eligible=0; checked=0
    known=set(TARGETS["Melica nitens"])
    for o in results:
        if checked>=12 or eligible>=5: break
        oid=o.get("id")
        if oid in known: continue
        for p in (o.get("photos") or [])[:2]:
            pid=p.get("id")
            code=(p.get("license_code") or "").lower()
            if code not in ("cc0","cc-by","cc-by-sa") or str(pid) in used_text: continue
            checked+=1
            record={"observation":oid,"photo":pid,"source_label":(o.get("taxon") or {}).get("name"),
                    "quality":o.get("quality_grade"),"photo_license_code":code,
                    "source_photo_page":f"https://www.inaturalist.org/photos/{pid}"}
            try:
                photo_user=p.get("user") or o.get("user") or {}
                record["source_user_login"]=photo_user.get("login")
                record["source_user_name"]=photo_user.get("name")
                attribution=p.get("attribution") or ""
                creator=(photo_user.get("name") or photo_user.get("login")) if code=="cc0" else (p.get("attribution") or photo_user.get("name") or photo_user.get("login"))
                if not creator: raise ValueError("Creator/account not identified")
                record["creator"]=creator
                record["original_attribution"]=attribution
                if code=="cc0":
                    record.update(license="CC0 1.0",license_url="https://creativecommons.org/publicdomain/zero/1.0/")
                else:
                    occurl="https://www.inaturalist.org/observations/"+str(oid)
                    u="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode({"occurrenceId":occurl,"limit":30})
                    media_matches=[]
                    for occ in data(u).get("results",[]):
                        if occ.get("occurrenceID")!=occurl: continue
                        for m in occ.get("media",[]):
                            if f"/photos/{pid}/" in (m.get("identifier") or ""):media_matches.append((occ,m))
                    if len(media_matches)!=1: raise ValueError("Exact GBIF media match unavailable")
                    occ,m=media_matches[0]
                    licence=(m.get("license") or "").replace("http:","https:").rstrip("/")
                    if licence not in PERMITTED:raise ValueError("Exact media license version unverified")
                    if code=="cc-by" and "/by/" not in licence:raise ValueError("License type mismatch")
                    if code=="cc-by-sa" and "/by-sa/" not in licence:raise ValueError("License type mismatch")
                    record.update(license=PERMITTED[licence],license_url=licence+"/",
                        gbif_occurrence=f"https://www.gbif.org/occurrence/{occ.get('key')}",
                        gbif_creator=m.get("creator"),gbif_rightsholder=m.get("rightsHolder"))
                media_url=original(p)
                b=get(media_url)
                img=Image.open(io.BytesIO(b));img.verify()
                img=Image.open(io.BytesIO(b))
                w,h=img.size
                if min(w,h)<650: raise ValueError("Original too small")
                sha=hashlib.sha256(b).hexdigest()
                if sha in used_text:raise ValueError("Already in gallery")
                record.update(original_media_url=media_url,original_sha256=sha,bytes=len(b),
                              width=w,height=h,
                              status="SOURCE_EVIDENCE_PASS_PHOTO_PIXELS_ID_ARCHIVE_DUP_PENDING")
                eligible+=1
                print("GLOBAL_MELICA_SOURCE_PASS "+json.dumps(record,sort_keys=True),flush=True)
            except Exception as exc:
                record["reason"]=str(exc)
                print("GLOBAL_MELICA_HOLD "+json.dumps(record,sort_keys=True),flush=True)
            time.sleep(.2)
    print("GLOBAL_MELICA_SUMMARY "+json.dumps({"checked_license_eligible":checked,"exact_source_bytes_pass":eligible,
      "published":0,"final_species_photo_approval":False}),flush=True)
except Exception as exc:
    print("GLOBAL_MELICA_SCAN_ERROR "+str(exc),flush=True)
