#!/usr/bin/env python3
"""One-time read-only exact photo provenance check; never approve held originals or publish anything."""
import hashlib, io, json, time, urllib.parse, urllib.request
from PIL import Image
PID=2123917
TAXON="Bouteloua rigidiseta"
UA="Hays-Botany-Source-Probe/1.0 (github.com/Crking92/Hays-Botany-Poaceae)"
def get(url,limit=13_000_000):
    last=None
    for i in range(3):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*"})
            with urllib.request.urlopen(req,timeout=24) as r:
                content=r.read(limit+1)
                if r.status != 200 or len(content)>limit:raise RuntimeError("HTTP !=200 / bytes too large")
                return content
        except Exception as ex:
            last=ex
            if i<2:time.sleep(2+i)
    raise RuntimeError(str(last))
def jget(url):return json.loads(get(url,6_000_000))
def main():
    matches=[]
    for year in (2014,2015,2016,2017,2018,2013):
        args={"taxon_id":159359,"user_id":"sambiology","per_page":200,"page":1,
              "d1":f"{year}-01-01","d2":f"{year}-12-31"}
        for page in range(1,4):
            args["page"]=page
            url="https://api.inaturalist.org/v1/observations?"+urllib.parse.urlencode(args)
            try:
                obj=jget(url)
            except Exception as ex:
                print("QUERY_FAILED "+json.dumps({"year":year,"page":page,"error":str(ex)[:180]}),flush=True)
                break
            rows=obj.get("results") or []
            for obs in rows:
                for p in obs.get("photos") or []:
                    if p.get("id")==PID:matches.append((obs,p))
            print("PHOTO_SOURCE_SEARCH "+json.dumps({"year":year,"page":page,"returned":len(rows),"matched":len(matches)}),flush=True)
            if matches or len(rows)<200:break
        if matches:break
    if len(matches)!=1:
        print("TEXAS_GRAMA_SOURCE_HOLD "+json.dumps({"photo_id":PID,"exact_source_count":len(matches),"reason":"Could not uniquely identify original observation/photo; exact rights remain unverified"}),flush=True)
        return
    obs,p=matches[0];oid=obs["id"]
    owner=p.get("user") or obs.get("user") or {}
    rec={"photo_id":PID,"observation_id":oid,"source_taxon":(obs.get("taxon") or {}).get("name"),
         "grade":obs.get("quality_grade"),"creator":owner.get("name") or owner.get("login"),
         "photo_license_code":p.get("license_code"),
         "source_photo":f"https://www.inaturalist.org/photos/{PID}",
         "observation_page":f"https://www.inaturalist.org/observations/{oid}"}
    if rec["source_taxon"]!=TAXON or p.get("license_code") not in ("cc-by","cc0","cc-by-sa"):
        rec["status"]="HOLD_EXACT_TAXON_OR_LICENSE_CODE";print("TEXAS_GRAMA_SOURCE "+json.dumps(rec),flush=True);return
    occurrence_uri=f"https://www.inaturalist.org/observations/{oid}"
    uri="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode({"occurrenceID":occurrence_uri,"limit":15})
    try:
        results=jget(uri).get("results") or []
        matching=[x for x in results if x.get("occurrenceID")==occurrence_uri]
        med=next((m for x in matching for m in (x.get("media") or []) if f"/photos/{PID}/" in (m.get("identifier") or "")),None)
        if med:
            rec["gbif_photo_media"]={"creator":med.get("creator"),"license":med.get("license"),"identifier":med.get("identifier"),
                                       "occurrence_keys":[x.get("key") for x in matching]}
        else:rec["gbif_photo_media"]={"status":"HOLD_EXACT_MEDIA_LICENSE_VERSION_NOT_PRESENT"}
    except Exception as ex:rec["gbif_photo_media"]={"status":"HOLD_GBIF_UNAVAILABLE","error":str(ex)[:150]}
    url=p.get("url") or ""
    for size in ("square","thumb","small","medium","large"):url=url.replace("/"+size+".","/original.")
    if "/original." in url:
        try:
            blob=get(url)
            img=Image.open(io.BytesIO(blob));img.verify()
            img=Image.open(io.BytesIO(blob));img.load()
            rec.update(original_media_url=url,original_sha256=hashlib.sha256(blob).hexdigest(),
                       image_dimensions=img.size,original_bytes=len(blob),
                       source_file_decoded=True)
        except Exception as ex:rec["original_status"]="HOLD_BINARY_UNAVAILABLE "+str(ex)[:140]
    rec["status"]="SOURCE_LEAD_ONLY_NOT_PUBLICATION_APPROVAL"
    print("TEXAS_GRAMA_EXACT_PHOTO_PROBE "+json.dumps(rec,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
