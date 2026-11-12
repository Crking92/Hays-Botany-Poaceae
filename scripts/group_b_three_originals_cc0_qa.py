#!/usr/bin/env python3
"""Scoped original-photo check for three held Group B grass galleries.
READ-ONLY: no uploads, site/gallery writes, or rights/ID certification.
Review exact iNat per-photo codes, author, 2048px original bytes/hash.
Also search a limited CC0-only taxon set for Tridentopsis elongata.
"""
import hashlib, io, json, time, urllib.request, urllib.parse
from PIL import Image
UA="HaysBotanyPhotoOriginalQA/1.0 (github.com/Crking92/Hays-Botany-Poaceae)"
TARGETS=[
 ("Eragrostis curtipedicellata",401575636,737076545),
 ("Eragrostis curtipedicellata",401575636,737076623),
 ("Elymus macgregorii",368549870,673153394)
]
def read(url,limit=14*1024*1024):
  last=None
  for retry in range(3):
    try:
      req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*"})
      with urllib.request.urlopen(req,timeout=22) as r:
        if r.status!=200:raise RuntimeError("HTTP "+str(r.status))
        blob=r.read(limit+1)
        if len(blob)>limit:raise RuntimeError("Response >14MB")
        return blob
    except Exception as e:
      last=e
      if retry<2:time.sleep((retry+1)*2.5)
  raise RuntimeError(str(last))
def api(path,params=None):
  q="?"+urllib.parse.urlencode(params or {}) if params else ""
  return json.loads(read("https://api.inaturalist.org/v1/"+path+q))
def show(rec,prefix):
  print(prefix+" "+json.dumps(rec,ensure_ascii=False,sort_keys=True),flush=True)
def originals():
  inspected=[];cache={}
  for species,obs_id,pid in TARGETS:
    rec={"expected_species":species,"observation_id":obs_id,"photo_id":pid}
    try:
      o=cache.get(obs_id)
      if o is None:
        o=api("observations/"+str(obs_id))["results"][0]
        cache[obs_id]=o
      rec["source_taxon"]=o.get("taxon",{}).get("name")
      rec["observation_quality"]=o.get("quality_grade")
      if rec["source_taxon"]!=species:raise ValueError("Exact source taxon mismatch")
      p=next((p for p in o.get("photos",[]) if p["id"]==pid),None)
      if p is None:raise ValueError("Photo not in source observation")
      code=(p.get("license_code") or "").lower()
      if code!="cc0":raise ValueError("Not an individual CC0 image: "+code)
      owner=p.get("user") or o.get("user") or {}
      rec.update(license_code=code,creator=owner.get("name") or owner.get("login"),
        attribution=p.get("attribution"),source_page="https://www.inaturalist.org/photos/"+str(pid),
        observation_page="https://www.inaturalist.org/observations/"+str(obs_id))
      imgurl=p.get("url")
      if not imgurl:raise ValueError("No source media")
      for label in ("square","thumb","small","medium","large"):
        imgurl=imgurl.replace("/"+label+".","/original.")
      blob=read(imgurl)
      im=Image.open(io.BytesIO(blob)); im.verify()
      im=Image.open(io.BytesIO(blob))
      rec.update(original_url=imgurl,bytes=len(blob),width=im.width,height=im.height,
        original_sha256=hashlib.sha256(blob).hexdigest(),image_decoded=True,
        rights_status="CC0 source API metadata, source-specific pixel role from prior reviewed contact sheets",
        publication="NOT_INSTALLED")
      inspected.append(rec)
      show(rec,"SOURCE_ORIGINAL_PASS")
    except Exception as ex:
      rec["error"]=str(ex)
      show(rec,"SOURCE_ORIGINAL_HOLD")
      raise
    time.sleep(0.4)
  if len({r["original_sha256"] for r in inspected})!=len(inspected):
    raise RuntimeError("Duplicate original hash within batch")
  show({"originals_verified":len(inspected),"distinct_full_resolution_sha256":len(inspected),"installed":0},"ORIGINAL_SUMMARY")
def cc0_search():
  count=0
  # Results filtered for requested taxon and photo-level rights; exact actual
  # photo licenses AND exact observation taxon checked again client-side.
  for quality in ("research","needs_id"):
    all_rows=[]
    for page in (1,2):
      data=api("observations",{
         "taxon_name":"Tridentopsis elongata", "photo_license":"cc0",
         "quality_grade":quality, "photos":"true","per_page":100,"page":page
      })
      rows=data.get("results",[])
      all_rows.extend(rows)
      if len(rows)<100:break
    eligible=[]
    for o in all_rows:
      if (o.get("taxon") or {}).get("name")!="Tridentopsis elongata":continue
      for p in o.get("photos",[]):
        if (p.get("license_code") or "").lower()!="cc0":continue
        owner=p.get("user") or o.get("user") or {}
        eligible.append({"photo_id":p.get("id"),"observation_id":o["id"],
          "photographer":owner.get("name") or owner.get("login"),
          "source":"https://www.inaturalist.org/photos/"+str(p.get("id")),
          "observation":"https://www.inaturalist.org/observations/"+str(o["id"]),
          "source_taxon":(o.get("taxon") or {}).get("name"),"photo_license":"cc0",
          "quality_grade":o.get("quality_grade"),"identification_status":"UNREVIEWED"})
    show({"scope":quality,"observations_returned":len(all_rows),
       "eligible_exact_name_cc0_photos":len(eligible),"examples":eligible[:14]},
      "TRIDENTOPSIS_CC0_SEARCH")
    count+=len(eligible)
  show({"all_tridentopsis_cc0_hits":count,
        "note":"Source label and CC0 code alone do not prove species ID; no gallery changes"},
        "TRIDENTOPSIS_DISCOVERY_SUMMARY")
if __name__=="__main__":
  originals()
  cc0_search()
