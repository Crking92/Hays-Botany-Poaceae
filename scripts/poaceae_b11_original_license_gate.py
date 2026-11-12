#!/usr/bin/env python3
"""Source-rights and full-original bytes QA for six Group B potential publisher photos.
No media or candidate gallery writes; print per-photo evidence and hashes."""
import hashlib, json, re, sys, time, urllib.request, urllib.error
from html import unescape
from PIL import Image
from io import BytesIO
TARGETS=[
 ("Stapfochloa ciliata",144608484,248229079,"cc-by"),
 ("Stapfochloa ciliata",205834944,364000073,"cc0"),
 ("Tridens congestus",363072901,662722415,"cc0"),
 ("Tridens congestus",276708779,496879955,"cc-by"),
 ("Pappophorum bicolor",325903814,590153581,"cc0"),
 ("Pappophorum bicolor",345524024,629700491,"cc-by"),
]
AGENT="HaysBotany-Poaceae-licensed-photo-review/1.0 (GitHub Crking92/Hays-Botany-Poaceae)"
def load(url, limit=12*1024*1024):
 err=None
 for i in range(3):
  try:
   req=urllib.request.Request(url, headers={"User-Agent":AGENT,"Accept":"*/*"})
   with urllib.request.urlopen(req,timeout=25) as r:
    if r.status!=200: raise RuntimeError(str(r.status))
    b=r.read(limit+1)
    if len(b)>limit: raise ValueError("too large")
    return b
  except Exception as e:
   err=e; time.sleep(i+1)
 raise RuntimeError(f"fetch {url}: {err}")
out=[];cache={}
for species,obs_id,photo_id,want in TARGETS:
 try:
  if obs_id not in cache:
   cache[obs_id]=json.loads(load(f"https://api.inaturalist.org/v1/observations/{obs_id}"))["results"][0]
  obs=cache[obs_id]
  taxon=(obs.get("taxon") or {}).get("name")
  photo=next((p for p in obs.get("photos",[]) if p.get("id")==photo_id),None)
  if photo is None or taxon!=species: raise ValueError("exact taxon/photo observation mismatch")
  rights=(photo.get("license_code") or "").lower()
  if rights!=want: raise ValueError("PER PHOTO LICENSE CHANGED "+str(rights))
  owner=photo.get("user") or obs.get("user") or {}
  creator=owner.get("name") or owner.get("login") or photo.get("attribution") or "UNKNOWN"
  media=photo.get("url")
  if not media: raise ValueError("media original URL absent")
  original_url=re.sub(r"/(square|thumb|small|medium|large)\.", "/original.",media)
  original=load(original_url)
  img=Image.open(BytesIO(original));img.verify()
  img=Image.open(BytesIO(original))
  h=hashlib.sha256(original).hexdigest()
  try:
   page=load(f"https://www.inaturalist.org/photos/{photo_id}", 4*1024*1024).decode("utf-8","replace")
   rights_links=sorted(set(unescape(u).replace("http://","https://") for u in re.findall(r"""https?://creativecommons\.org/(?:licenses/[^\s\"'<>]+|publicdomain/zero/[^\s\"'<>]+)""",page,re.I)))
   page_status="FETCHED"
  except Exception as e:
   rights_links=[];page_status="BLOCKED "+str(e)[:95]
  rec={"photo_id":photo_id,"species":species,"observation":obs_id,"creator":creator,
   "attribution":photo.get("attribution"),"license_code":rights,
   "photo_page":f"https://www.inaturalist.org/photos/{photo_id}",
   "observation_page":f"https://www.inaturalist.org/observations/{obs_id}",
   "full_original_url":original_url,"original_sha256":h,"original_bytes":len(original),
   "width":img.width,"height":img.height,"page_status":page_status,
   "creative_commons_links_on_photo_page":rights_links,"image_verified":True}
  out.append(rec);print("ORIGINAL_PASS "+json.dumps(rec,ensure_ascii=False),flush=True)
 except Exception as e:
  print("ORIGINAL_HOLD "+json.dumps({"photo_id":photo_id,"error":str(e)}),flush=True)
  sys.exit(1)
 time.sleep(.6)
if len(set(x["original_sha256"] for x in out))!=len(out):raise SystemExit("Binary source duplicate within batch")
print("B11_SOURCE_SUMMARY "+json.dumps({"originals_verified":len(out),"distinct_original_sha256":len(set(x["original_sha256"] for x in out)),"staged":0,"published":0}),flush=True)
