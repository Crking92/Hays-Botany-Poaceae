#!/usr/bin/env python3
"""Bounded, non-publishing original iNat photo rights and SHA256 gate for Group B."""
import hashlib, io, json, re, time, urllib.request, urllib.error
from PIL import Image
TARGETS=[
 ("Eragrostis curtipedicellata",401575636,737076545),
 ("Eragrostis curtipedicellata",401575636,737076623),
 ("Elymus macgregorii",368549870,673153394),
]
def get(url,cap=12582912):
 error=None
 for i in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyPoaceae-photo-source-integrity/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)"})
   with urllib.request.urlopen(req,timeout=30) as f:
    b=f.read(cap+1)
    if len(b)>cap: raise ValueError("original too large")
    return b
  except Exception as e:
   error=e;time.sleep(i+1)
 raise RuntimeError(str(error))
records=[]
for species,obs_id,pid in TARGETS:
 obs=json.loads(get("https://api.inaturalist.org/v1/observations/"+str(obs_id)))["results"][0]
 taxon=(obs.get("taxon") or {}).get("name")
 if taxon!=species: raise RuntimeError("taxon mismatch for "+str(pid)+": "+str(taxon))
 phot=next((p for p in obs.get("photos",[]) if p.get("id")==pid),None)
 if not phot:raise RuntimeError("photo not in original observation "+str(pid))
 license=(phot.get("license_code") or "").lower()
 if license!="cc0":raise RuntimeError("per-photo license not CC0 for "+str(pid)+": "+license)
 origin=phot.get("url") or ""
 if not origin: raise RuntimeError("photo source absent")
 original_url=re.sub(r"/(?:square|thumb|small|medium|large)\.", "/original.", origin)
 b=get(original_url)
 image=Image.open(io.BytesIO(b));image.verify()
 image=Image.open(io.BytesIO(b))
 if min(image.size)<500:raise RuntimeError("original resolution too low: "+str(image.size))
 creator=(phot.get("user") or {}).get("name") or (phot.get("user") or {}).get("login") or (obs.get("user") or {}).get("name") or (obs.get("user") or {}).get("login")
 if not creator:raise RuntimeError("missing attribution creator")
 record={"species":species,"observation_id":obs_id,"photo_id":pid,"creator":creator,"attribution":phot.get("attribution"),"photo_license_code":license,"original_photo_url":original_url,"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),"size":list(image.size),"source_page":"https://www.inaturalist.org/photos/"+str(pid)}
 records.append(record)
 print("B12_ORIGINAL_PASS "+json.dumps(record),flush=True)
 time.sleep(.6)
if len({x["sha256"] for x in records})!=len(records):raise RuntimeError("duplicate original SHA")
print("B12_SOURCE_SUMMARY "+json.dumps({"originals_verified":len(records),"unique_sha256":len(records),"publication_status":"NOT_PUBLISHED"}),flush=True)
