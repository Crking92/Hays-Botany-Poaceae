#!/usr/bin/env python3
"""Read-only Group C: inspect exact originals; never write gallery, assets or scored taxa."""
import hashlib,html,io,json,re,sys,time
from urllib.parse import urlencode,quote
from urllib.request import Request,urlopen
from PIL import Image

C=[
 ("Eragrostis minor","Eragrostis minor habit.jpg","Mark Marathon","https://creativecommons.org/licenses/by-sa/3.0/","dry whole plant"),
 ("Eragrostis minor","Eragrostis minor seedhead.jpg","Mark Marathon","https://creativecommons.org/licenses/by-sa/3.0/","mature panicle"),
 ("Cenchrus setaceus","Fountain Grass seed on stem (8661935077).jpg","John Tann","https://creativecommons.org/licenses/by/2.0/","bristled flowering head"),
 ("Miscanthus sinensis","Bloeiwijze van Miscanthus sinensis. Locatie, De Kruidhof Buitenpost.jpg","Dominicus Johannes Bergsma","https://creativecommons.org/licenses/by-sa/4.0/","fresh pink inflorescence")
]
O=[
 ("Sphenopholis obtusata","3a5f30cee308c1fb6428feccfc48a23b.jpg","Utah State Intermountain Herbarium","CC0", "pressed whole plant","https://yavapaiplants.extension.arizona.edu/sites/default/files/Grasses/Images/3a5f30cee308c1fb6428feccfc48a23b.jpg","https://yavapaiplants.extension.arizona.edu/sites/default/files/styles/az_natural/public/Grasses/Images/3a5f30cee308c1fb6428feccfc48a23b.jpg.webp?itok=yzHGsNVk"),
 ("Muhlenbergia capillaris","Management_ParksProtectedAreas_BotanicalGardensZoosEtc_00042.jpg","Elizabeth A. Sellers / USGS","PD","whole flowering tuft","https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/Management_ParksProtectedAreas_BotanicalGardensZoosEtc_00042.jpg",None)
]
import os
if os.environ.get("GROUP_C_ONLY_CENCHRUS")=="1":
  C[:]=[x for x in C if x[0]=="Cenchrus setaceus"]
  O[:]=[]
def get(url):
  last=None
  for attempt in range(3):
    try:
      with urlopen(Request(url,headers={"User-Agent":"HaysBotanySourceCheck/1.0 (educational photography review)"}),timeout=40) as r:
        return r.read(16000000),r.geturl()
    except Exception as e:
      last=e; time.sleep(attempt+1)
  raise last
def digest(b):
  with Image.open(io.BytesIO(b)) as im:
    dimensions=list(im.size); fmt=im.format;im.verify()
  return dict(bytes=len(b),dimensions=dimensions,format=fmt,sha1=hashlib.sha1(b).hexdigest(),sha256=hashlib.sha256(b).hexdigest())
def main():
  with open("site/visual-key-lab/hays-candidates.json",encoding="utf8") as f: data=json.load(f)
  refs=[p for t in data["candidates"] for p in t.get("approved_gallery",[])]
  existing={p.get("image_filename") for p in refs}
  titles="|".join("File:"+x[1] for x in C)
  api="https://commons.wikimedia.org/w/api.php?"+urlencode(dict(action="query",format="json",prop="imageinfo",iiprop="url|sha1|size|extmetadata",titles=titles))
  results=[];issues=[];pages={}
  try:
    payload,_=get(api)
    pages={v["title"].removeprefix("File:"):v for v in json.loads(payload)["query"]["pages"].values()}
  except Exception as e: issues.append("Commons API unavailable: "+str(e))
  for taxon,name,creator,lic,role in C:
    out=dict(species=taxon,filename=name,creator=creator,expected_license=lic,role=role,duplicate_filename=name in existing)
    results.append(out)
    info=(pages.get(name) or {}).get("imageinfo",[])
    if not info:out["status"]="HOLD_METADATA_UNAVAILABLE";issues.append(name+": metadata absent");continue
    info=info[0];meta=info.get("extmetadata",{})
    artist=html.unescape(re.sub("<[^>]*>"," ",meta.get("Artist",{}).get("value","")))
    licurl=meta.get("LicenseUrl",{}).get("value","").replace("http://","https://").rstrip("/")
    out.update(artist_metadata=artist[:200],license_metadata=licurl,commons_sha1=info.get("sha1"))
    if creator.casefold() not in artist.casefold() or lic.rstrip("/")!=licurl:
      out["status"]="HOLD_AUTHOR_OR_LICENSE";issues.append(name+": author/license not matched");continue
    try:
      b,final=get(info["url"]);out.update(digest(b));out["download_url"]=final
      out["status"]="ORIGINAL_PASS" if out["sha1"]==info.get("sha1") and not out["duplicate_filename"] else "HOLD_HASH_OR_DUPLICATE"
    except Exception as e:out["status"]="HOLD_BYTES_UNAVAILABLE";out["error"]=str(e)
    if out["status"]!="ORIGINAL_PASS":issues.append(name+": "+out["status"])
  for taxon,name,creator,lic,role,url,fallback in O:
    out=dict(species=taxon,filename=name,creator=creator,source_license_page_prechecked=lic,role=role,duplicate_filename=name in existing)
    results.append(out);used_fallback=False
    try:
      try:b,final=get(url)
      except Exception:
        if not fallback:raise
        b,final=get(fallback);used_fallback=True
      out.update(digest(b));out["download_url"]=final;out["derivative_only"]=used_fallback
      out["status"]="HOLD_DERIVATIVE_OR_DUPLICATE" if used_fallback or out["duplicate_filename"] else "SOURCE_BYTES_PASS"
    except Exception as e:out["status"]="HOLD_BYTES_UNAVAILABLE";out["error"]=str(e)
    if not out["status"].endswith("PASS"):issues.append(name+": "+out["status"])
  hashes=[x["sha256"] for x in results if "sha256" in x]
  if len(set(hashes))!=len(hashes):issues.append("within-batch SHA256 collision")
  report=dict(scope="GROUP_C_EXACT_SIX_READ_ONLY",configured_refs_before_pub=len(refs),verified_originals=sum(x["status"]=="ORIGINAL_PASS" for x in results),source_bytes_verified=sum(x["status"]=="SOURCE_BYTES_PASS" for x in results),holds=issues,photos=results,limitations="Image bytes and metadata only, no species voucher ID, archive-wide dedup or public pixel certification; USGS/Arizona license citations remain on their individual source pages")
  with open("group-c-six-source-qa.json","w") as f:json.dump(report,f,indent=2)
  print(json.dumps(report,indent=2))
  if issues:sys.exit(1)
if __name__=="__main__":main()
