#!/usr/bin/env python3
"""Read-only source screen for two Poaceae blank galleries. No publishing or source approvals."""
import hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

TARGETS = {
    "Melica nitens": [379835068,363172021,361851494,282514813],
    "Steinchisma hians": [387883882,82946399,82930069],
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
