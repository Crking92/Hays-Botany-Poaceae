#!/usr/bin/env python3
"""Original full-size source audit for two supplemental CC0 Poaceae image leads."""
import hashlib, io, json, re, time, urllib.request
from PIL import Image
LEADS=[("Tridens congestus",355629216,648545557),("Pappophorum bicolor",321509957,581468317)]
def get(u):
  exc=None
  for i in range(3):
    try:
      req=urllib.request.Request(u,headers={"User-Agent":"HaysBotanyPhotoSourceAudit/1.0 (GitHub Crking92/Hays-Botany-Poaceae)"})
      with urllib.request.urlopen(req,timeout=24) as h:
        b=h.read(12582913)
        if len(b)>12582912:raise ValueError("file too large")
        return b
    except Exception as e:exc=e;time.sleep(i+1)
  raise RuntimeError(str(exc))
records=[]
for species,obsid,pid in LEADS:
    obs=json.loads(get(f"https://api.inaturalist.org/v1/observations/{obsid}"))["results"][0]
    if (obs.get("taxon") or {}).get("name")!=species:raise RuntimeError(f"Observation taxon mismatch: {pid}")
    ph=next((p for p in obs["photos"] if p["id"]==pid),None)
    if not ph:raise RuntimeError(f"Original observation missing photo {pid}")
    if ph.get("license_code")!="cc0":raise RuntimeError(f"Per-photo CC0 rights unavailable: {pid}")
    author=(ph.get("user") or {}).get("name") or (ph.get("user") or {}).get("login") or (obs.get("user") or {}).get("name") or (obs.get("user") or {}).get("login")
    if not author:raise RuntimeError("Photographer unknown")
    original=re.sub(r"/(?:square|thumb|small|medium|large)\.","/original.",ph["url"])
    data=get(original)
    image=Image.open(io.BytesIO(data));image.verify()
    image=Image.open(io.BytesIO(data))
    if min(image.size)<400:raise RuntimeError("Image too small")
    rec={"species":species,"observation_id":obsid,"photo_id":pid,"photographer":author,"photo_license":ph.get("license_code"),"source_photo":f"https://www.inaturalist.org/photos/{pid}","original":original,"bytes":len(data),"width":image.width,"height":image.height,"original_sha256":hashlib.sha256(data).hexdigest()}
    records.append(rec);print("B17_ORIGINAL_PASS "+json.dumps(rec),flush=True)
if len({x["original_sha256"] for x in records})!=len(records):raise SystemExit("Duplicate original bytes")
print("B17_SUMMARY "+json.dumps({"original_cc0_verified":len(records),"same_sha_collisions":0,"published":0}),flush=True)
