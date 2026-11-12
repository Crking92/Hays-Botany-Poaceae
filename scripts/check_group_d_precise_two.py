#!/usr/bin/env python3
"""One-shot READ ONLY: verify full original bytes and photo-specific rights for two Group D macros."""
import hashlib,html,io,json,re,sys,time
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image

root=Path(__file__).resolve().parents[1]
rows=[
 {"taxon":"dactyloctenium-aegyptium","file":"Dactyloctenium aegyptium, blomme, a, Pretoria.jpg","creator":"JMK","license_path":"/by-sa/3.0/","role":"Close two-row flowering branch, exserted anthers/stigmas"},
 {"taxon":"stenotaphrum-secundatum","file":"Stenotaphrum secundatum node2 (7417603604).jpg","creator":"Harry Rose","license_path":"/by/2.0/","role":"Hairs along sheath and collar at stem node, side view"}
]
s=requests.Session();s.headers["User-Agent"]="HaysBotanyPhotoQA/1.0 (source-specific reusable photo check)"
def get(url,**kw):
 last=None
 for n in range(3):
  try:
   r=s.get(url,timeout=35,**kw)
   if r.status_code in (429,500,502,503,504):time.sleep(2*(n+1));continue
   r.raise_for_status();return r
  except Exception as e:
   last=e;time.sleep(n+1)
 raise last or RuntimeError("all URL attempts failed")
data=get("https://commons.wikimedia.org/w/api.php",params={"action":"query","format":"json","prop":"imageinfo","iiprop":"url|size|sha1|extmetadata","titles":"|".join("File:"+x["file"] for x in rows)}).json()
pages={p["title"].replace("_"," ").removeprefix("File:"):p for p in data["query"]["pages"].values() if p.get("imageinfo")}
d=json.loads((root/"site/visual-key-lab/hays-candidates.json").read_text());published=[p for c in d["candidates"] for p in c.get("approved_gallery",[])]
failed=False;hashes=[]
for item in rows:
 name=item["file"];p=pages.get(name);errors=[]
 if not p:errors.append("MISSING_EXACT_COMMONS_FILE")
 if any((v.get("image_filename") or "").casefold()==name.casefold() for v in published):errors.append("ALREADY_CONFIGURED_IMAGE")
 if p:
  v=p["imageinfo"][0];m=v.get("extmetadata") or {}
  artist=html.unescape(re.sub("<[^>]*>"," ",str(m.get("Artist",{}).get("value",""))))
  license_url=html.unescape(str(m.get("LicenseUrl",{}).get("value","")))
  item["commons_creator"]=artist[:180];item["commons_license_url"]=license_url;item["commons_original_sha1"]=v.get("sha1");item["commons_bytes"]=v.get("size")
  if item["creator"].lower() not in artist.lower():errors.append("AUTHOR_NOT_MATCHED")
  if item["license_path"] not in license_url:errors.append("FILE_LICENSE_VERSION_MISMATCH")
  if any(x in license_url for x in ("/by-nc/","/by-nd/","/by-nc-sa/")):errors.append("RESTRICTED_LICENSE")
  for suffix in ("", "?download=1"):
   try:
    raw=get(v["url"]+suffix).content
    img=Image.open(io.BytesIO(raw));img.verify();img=Image.open(io.BytesIO(raw))
    item["original_dimensions"]=list(img.size)
    item["original_bytes"]=len(raw)
    item["source_sha1_computed"]=hashlib.sha1(raw).hexdigest()
    item["original_sha256_computed"]=hashlib.sha256(raw).hexdigest()
    hashes.append(item["original_sha256_computed"])
    if item["original_bytes"]!=v.get("size"):errors.append("FILE_BYTES_MISMATCH")
    if item["source_sha1_computed"]!=v.get("sha1"):errors.append("COMMONS_SHA1_MISMATCH")
    if min(img.size)<750:errors.append("SMALL_IMAGE")
    break
   except Exception as e:item["download_error"]=str(e)[:180]
  if "original_sha256_computed" not in item:errors.append("ORIGINAL_BYTE_ACCESS_OR_DECODE_FAILURE")
 item["status"]="SOURCE_RIGHTS_AND_ORIGINAL_OK" if not errors else "HOLD"
 item["errors"]=errors
 if errors:failed=True
 print("GROUP_D_PRECISE_MACRO",json.dumps({k:item.get(k) for k in ("file","status","errors","original_dimensions","original_sha256_computed")}),flush=True)
if len(hashes)!=len(set(hashes)):failed=True
out={"source_file_count":len(rows),"verified":sum(x["status"]=="SOURCE_RIGHTS_AND_ORIGINAL_OK" for x in rows),"holds":sum(x["status"]=="HOLD" for x in rows),
 "unique_original_SHA256":len(set(hashes)),"historical_archive_byte_dedup_not_claimed":True,"local_specimen_identity_not_certified":True,"photos_published_by_this_probe":0,"rows":rows}
dest=root/"qa-report/group-d-precise-macro-sources.json";dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(out,indent=2)+"\n")
print("GROUP_D_PRECISE_SUMMARY",json.dumps({k:v for k,v in out.items() if k!="rows"}),flush=True)
sys.exit(1 if failed else 0)
