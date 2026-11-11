#!/usr/bin/env python3
"""Collect high-resolution detail views of 10 Hays grass candidate photo sets.

Select ONLY existing CC0/CC BY/CC BY-SA/CC BY-NC/CC BY-NC-SA source photos,
for temporary noncommercial diagnostic examination; never commit images.
"""
import pathlib,json,urllib.request,urllib.parse,io,re,time
from PIL import Image,ImageDraw,ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"temporary_hays_ten_highres";OUT.mkdir(exist_ok=True)
TARGETS={
  "Aegilops cylindrica":[395469443,395469501,395469509,395469521],
  "Tridentopsis elongata":[670314012,670314131,689363680,689363853],
  "Echinochloa walteri":[565860695,565860733,565860769,565860887],
  "Sphenopholis obtusata":[200097163,200097280,200097255,200097207],
  "Coelorachis cylindrica":[412317136,412317183,412317218,396965912],
  "Paspalum langei":[585430238,585430288,720856976,720854977],
  "Tridens congestus":[231979560,231979600,412193093,412316786],
  "Pappophorum bicolor":[233448887,233448911,233448926,233448964],
  "Janochloa antidotalis":[601150373,601152831,601152915,601150359],
  "Stapfochloa canterae":[235666625,235666609,235666615,235666602],
}
REPORTS=[
 ("audits/hays-58-first-five-visual-qa-20261111.json","taxa","name","observations_examined"),
 ("audits/hays-58-pass3-visual-qa-20261111.json","records","scientific_name","source_observation_ids"),
 ("audits/hays-58-pass4-visual-qa-20261111.json","records","scientific_name","source_observation_ids"),
 ("audits/hays-58-pass5-visual-qa-20261111.json","reviewed","name","source_observation_id")
]
OBSIDS={}
for rel,main,nfield,ofield in REPORTS:
  d=json.loads((ROOT/rel).read_text())
  for row in d[main]:
    n=row[nfield]
    if n not in TARGETS:continue
    obs=row[ofield]
    if isinstance(obs,int):obs=[obs]
    OBSIDS[n]=obs
assert len(OBSIDS)==len(TARGETS),(len(OBSIDS),list(OBSIDS))
OK={"cc0","cc-by","cc-by-sa","cc-by-nc","cc-by-nc-sa"}
CACHE={}
def get(url,is_json):
  err=None
  for attempt in range(3):
    try:
      req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyTemporaryIDCharacterQA/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
         "Accept":"application/json" if is_json else "image/jpeg,image/*"})
      with urllib.request.urlopen(req,timeout=35) as x:
        data=x.read(12_000_000)
      return json.loads(data) if is_json else data,None
    except Exception as ex:err=str(ex);time.sleep(min(2**attempt,5))
  return None,err
def get_obs(oid):
  if oid not in CACHE:
    j,err=get("https://api.inaturalist.org/v1/observations/"+str(oid),True)
    CACHE[oid]=(j.get("results") or [{}])[0] if j else {}
  return CACHE[oid]
allmeta=[]
Image.MAX_IMAGE_PIXELS=130_000_000
for name,ids in TARGETS.items():
  candidatephotos={}
  for oid in OBSIDS[name]:
    ob=get_obs(oid)
    for p in ob.get("photos",[]):
      if p.get("id") in ids:candidatephotos[p["id"]]=(oid,p)
    time.sleep(.1)
  imgs=[]
  for pid in ids:
    if pid not in candidatephotos:
      allmeta.append({"name":name,"photo_id":pid,"status":"NOT_IN_SAMPLED_OBSERVATION"});continue
    oid,p=candidatephotos[pid]
    license=(p.get("license_code") or "").lower()
    if license not in OK:
      allmeta.append({"name":name,"photo_id":pid,"status":"LICENSE_NOT_ELIGIBLE","license":license});continue
    url=p.get("url") or ""
    large=re.sub(r"/(square|small|medium|thumb|large)\.", "/large.",url)
    body,err=get(large,False)
    if body is None:
      allmeta.append({"name":name,"photo_id":pid,"status":"IMAGE_REQUEST_FAILED","error":err});continue
    try:
      image=ImageOps.exif_transpose(Image.open(io.BytesIO(body)).convert("RGB"))
      size=image.size
      image.thumbnail((1900,1900),Image.Resampling.LANCZOS)
      base=f"{name.lower().replace(' ','-').replace('×','x')}-{pid}"
      outfile=OUT/(base+".jpg")
      image.save(outfile,quality=89,optimize=True)
      data={"name":name,"photo_id":pid,"observation_id":oid,"status":"HIGHRES_REVIEW_COPY",
        "source_observation_url":f"https://www.inaturalist.org/observations/{oid}",
        "source_photo_url":f"https://www.inaturalist.org/photos/{pid}",
        "license":license,"attribution":p.get("attribution"),
        "source_width_height":size,"review_size":image.size,
        "image_file":outfile.name,"species_id_approved":False}
      allmeta.append(data);imgs.append((image,data))
      print("DETAIL_PHOTO",name,pid,"size",size,license,flush=True)
    except Exception as ex:
      allmeta.append({"name":name,"photo_id":pid,"status":"DECODE_ERROR","error":str(ex)[:150]})
  if imgs:
    w=2200;h=((len(imgs)+1)//2)*1300+60
    sheet=Image.new("RGB",(w,h),"white");draw=ImageDraw.Draw(sheet)
    draw.text((18,16),name+" | High-res source photo review | noncommercial temporary only",fill="black")
    for i,(im,z) in enumerate(imgs):
      col=i%2;row=i//2
      image=im.copy()
      image.thumbnail((1050,1180),Image.Resampling.LANCZOS)
      x=col*1100+(1100-image.width)//2;y=60+row*1300+(1190-image.height)//2
      sheet.paste(image,(x,y))
      draw.text((col*1100+10,60+row*1300+1190),f"photo {z['photo_id']} | obs {z['observation_id']} | {z['license']}",fill="black")
    fn=name.lower().replace(" ","-").replace("×","x")+"-highres-sheet.jpg"
    sheet.save(OUT/fn,quality=86,optimize=True)
    print("HIGHRES_SHEET",name,fn,"photos",len(imgs),flush=True)
(OUT/"highres-review-metadata.json").write_text(json.dumps({"purpose":"Examine diagnostic spikelet/ligule/lemma characters on known licensed Hays observation images",
 "rights":"All images remain with original creators; credits in this manifest; temporary artifact expires after 1 day; no website publication or copying into GitHub.",
 "species_count":len(TARGETS),"images":allmeta},ensure_ascii=False,indent=2)+"\n")
(OUT/"README.txt").write_text("Hays Grass ID 10 priority specimen high-resolution photos, research only. Source licenses individually restricted to CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA. DO NOT copy into public website without separately verifying licensing/credits and final botanical ID.\n")
print("HIGHRES_SUMMARY",json.dumps({"requested":len(TARGETS)*4,"saved":sum(x["status"]=="HIGHRES_REVIEW_COPY" for x in allmeta),"errors":sum(x["status"]!="HIGHRES_REVIEW_COPY" for x in allmeta)}),flush=True)
