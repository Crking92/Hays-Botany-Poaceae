#!/usr/bin/env python3
"""Read-only exact-media source probe for Sphenopholis interrupta; NO publication.
Only original iNaturalist/GBIF photo-level evidence can grant source clearance.
A third-party image gallery is a lead, never rights or botanical signoff.
"""
import hashlib, io, json, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from PIL import Image

UA="Hays-Botany-Photo-Source-Gate/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)"
TAXON="Sphenopholis interrupta"
TARGET_IDS=(66285609,67351058,66285639,66285678)
MANIFEST=Path("site/visual-key-lab/hays-candidates.json")
def fetch(url,cap=9_000_000):
    last=None
    for attempt in range(2):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*"})
            with urllib.request.urlopen(req,timeout=25) as r:
                data=r.read(cap+1)
                if r.status!=200 or len(data)>cap:raise RuntimeError("HTTP or size threshold")
                return data
        except Exception as exc:
            last=exc
            if attempt==0:time.sleep(2)
    raise RuntimeError(str(last))
def jsonget(url):
    return json.loads(fetch(url,5_000_000))
def inat(path,params=None):
    qs="?"+urllib.parse.urlencode(params) if params else ""
    return jsonget("https://api.inaturalist.org/v1/"+path+qs)
def source_observations():
    found={}
    # One-at-a-time direct exact photo endpoints, as available.
    for pid in TARGET_IDS:
        attempts=["https://api.inaturalist.org/v1/photos/"+str(pid),
                  "https://www.inaturalist.org/photos/"+str(pid)+".json"]
        for url in attempts:
            try:
                v=jsonget(url)
                if isinstance(v,dict):
                    oids=[]
                    for obj in (v.get("results") or []) if isinstance(v.get("results"),list) else [v]:
                        for key in ("observation_id","observationId"):
                            if obj.get(key):oids.append(obj[key])
                        for obs in obj.get("observations",[]) or []:
                            if obs.get("id"):oids.append(obs["id"])
                    for oid in oids:found[int(oid)]="exact_photo_endpoint"
                print("EXACT_PHOTO_ENDPOINT "+json.dumps({"photo_id":pid,"url":url,"keys":list(v)[:15],"observation_ids":oids}),flush=True)
            except Exception as ex:
                print("EXACT_PHOTO_ENDPOINT_UNAVAILABLE "+json.dumps({"photo_id":pid,"url":url,"error":str(ex)[:150]}),flush=True)
    # Direct observation API bounded to exact species and dates; never equate
    # a taxon-level picture with this exact photographer/photo without matching ID.
    for quality in ("research","needs_id"):
        for year in (2020,2021,2019,2022,2023):
            for page in range(1,4):
                args={"taxon_name":TAXON,"quality_grade":quality,
                      "photo_license":"cc-by","d1":f"{year}-01-01",
                      "d2":f"{year}-12-31","per_page":200,"page":page}
                try:res=inat("observations",args)
                except Exception as ex:
                    print("OBSERVATION_QUERY_UNAVAILABLE "+json.dumps({"quality":quality,"year":year,"page":page,"error":str(ex)[:150]}),flush=True)
                    break
                rows=res.get("results") or []
                for obs in rows:
                    ids={x.get("id") for x in obs.get("photos",[]) if x.get("id")}
                    if ids.intersection(TARGET_IDS):
                        found[int(obs["id"])]=f"exact_photo_in_{quality}_{year}_page_{page}"
                if len(rows)<200:break
    return found
def check_license_version(obs,p):
    oid=obs["id"];pid=p["id"]
    q=urllib.parse.urlencode({"occurrenceID":f"https://www.inaturalist.org/observations/{oid}","limit":15})
    try:results=jsonget("https://api.gbif.org/v1/occurrence/search?"+q).get("results",[])
    except Exception as ex:return {"status":"HOLD_GBIF_UNAVAILABLE","error":str(ex)[:160]}
    for item in results:
        if item.get("occurrenceID")!=f"https://www.inaturalist.org/observations/{oid}":continue
        for media in item.get("media",[]):
            url=media.get("identifier") or ""
            if f"/photos/{pid}/" in url:
                creator=media.get("creator") or media.get("rightsHolder")
                lic=media.get("license")
                return {"status":"LICENSE_VERSION_FROM_EXACT_GBIF_MEDIA" if lic and "creativecommons.org/licenses/by/" in lic and "nc" not in lic else "HOLD_MEDIA_LICENSE",
                    "license_url_from_exact_media":lic,"media_creator":creator,
                    "media_identifier":url,"gbif_occurrence":item.get("key"),
                    "observation_license_distinct":item.get("license")}
    return {"status":"HOLD_GBIF_EXACT_MEDIA_UNAVAILABLE"}
def main():
    c=json.loads(MANIFEST.read_text())["candidates"]
    old=[p for row in c for p in row.get("approved_gallery",[])]
    found=source_observations()
    report=[]
    for oid,mode in found.items():
        try:obs=inat("observations/"+str(oid))["results"][0]
        except Exception as ex:
            report.append({"observation_id":oid,"error":"Observation unavailable: "+str(ex)[:150]})
            continue
        name=(obs.get("taxon") or {}).get("name")
        for p in obs.get("photos",[]):
            pid=p.get("id")
            if pid not in TARGET_IDS:continue
            owner=p.get("user") or obs.get("user") or {}
            entry={"photo_id":pid,"observation_id":oid,"found_by":mode,
                   "source_taxon":name,"quality":obs.get("quality_grade"),
                   "creator":owner.get("name") or owner.get("login"),
                   "photo_license_code":p.get("license_code"),
                   "source_page":f"https://www.inaturalist.org/photos/{pid}",
                   "observation_page":f"https://www.inaturalist.org/observations/{oid}",
                   "duplicated_exact_id_in_manifest":any(str(pid) in json.dumps(x) for x in old)}
            if name!=TAXON or (p.get("license_code") or "").lower() not in ("cc0","cc-by","cc-by-sa"):
                entry["status"]="HOLD_TAXON_OR_PHOTO_LICENSE_CODE"
                report.append(entry);continue
            entry["version_check"]=check_license_version(obs,p)
            source=p.get("url") or ""
            for size in ("square","thumb","small","medium","large"):
                source=source.replace("/"+size+".","/original.")
            if "/original." not in source:
                entry["status"]="HOLD_ORIGINAL_SOURCE_URL_UNAVAILABLE";report.append(entry);continue
            try:
                data=fetch(source)
                img=Image.open(io.BytesIO(data));img.verify()
                img=Image.open(io.BytesIO(data));img.load()
                entry.update(original_media_url=source,original_sha256=hashlib.sha256(data).hexdigest(),
                             original_bytes=len(data),image_size=img.size)
                entry["status"]="SOURCE_PIXEL_VERIFIED_RIGHTS_VERSION_AND_SPECIES_DIAGNOSIS_SEPARATE"
            except Exception as ex:
                entry["status"]="HOLD_ORIGINAL_BYTES";entry["error"]=str(ex)[:150]
            report.append(entry)
    print("SPHENOPHOLIS_EXACT_SOURCE_SUMMARY "+json.dumps({"candidate_ids":TARGET_IDS,
        "observations_found":list(found.keys()),"photos_examined":report,
        "cleared_photo_rights_and_identity_for_publication":0,
        "note":"Source media only; GBIF exact photo terms must be explicit; independent species identification not proved by the source label."},ensure_ascii=False),flush=True)
    if not report:raise SystemExit("No exact original observation/photo match; all rights/ID on hold")
if __name__=="__main__":main()
