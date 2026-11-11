#!/usr/bin/env python3
"""GBIF Hays spatial filter sanity check (no photos, no repo data changes)."""
import json,urllib.request,urllib.parse
def get(url):
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyGADMVerification/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)","Accept":"application/json"})
  with urllib.request.urlopen(req,timeout=30) as f:
   return json.load(f)
 except Exception as ex:return {"ERROR":str(ex)[:220]}
for u in [
 "https://api.gbif.org/v1/geocode/gadm/search?q=Hays",
 "https://api.gbif.org/v1/geocode/gadm/search?name=Hays",
 "https://api.gbif.org/v1/occurrence/3866879449",
 "https://api.gbif.org/v1/occurrence/search?scientificName=Paspalum%20langei&country=US&basisOfRecord=PRESERVED_SPECIMEN&county=Hays&limit=1",
 "https://api.gbif.org/v1/occurrence/search?scientificName=Paspalum%20langei&country=US&basisOfRecord=PRESERVED_SPECIMEN&limit=1"
]:
 d=get(u)
 if "/occurrence/3866879449" in u and "ERROR" not in d:
  d={k:v for k,v in d.items() if any(n in k.lower() for n in ["gadm","county","state","lat","lon","geospatial","catalog","key","locality"])}
 if "/occurrence/search" in u and "ERROR" not in d:
  d={"count":d.get("count"),"endOfRecords":d.get("endOfRecords"),"first":[{"gbifID":o.get("gbifID"),"county":o.get("county"),"state":o.get("stateProvince"),"gadm":o.get("gadm")} for o in d.get("results",[])][:1]}
 print("HAYS_GBIF_SPATIAL_CHECK",u,json.dumps(d,ensure_ascii=False)[:3800],flush=True)
