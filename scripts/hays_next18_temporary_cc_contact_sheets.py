#!/usr/bin/env python3
"""Build temporary CONTACT SHEETS of image-level CC photos from Hays observations.

No image bytes committed to the repository. Output artifact expires in one day.
Images are individually license-filtered (CC0, CC BY, CC BY-SA), creator credited.
This is a visual research specimen-screen; third pass, not a photo rights grant for site use.
"""
from PIL import Image,ImageDraw,ImageFont
import json,pathlib,urllib.request,time,io,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=json.loads((ROOT/"audits/hays-58-photo-evidence-review.json").read_text())
LOOK={x["name"]:x for x in RAW["records"]}
CANDIDATES=["Aegilops cylindrica","Avena sativa","Elymus glabriflorus","Megathyrsus maximus","Muhlenbergia capillaris","Polypogon viridis","Sphenopholis interrupta","Tridentopsis elongata","Bromus tectorum","Dactyloctenium aegyptium","Dichanthelium acuminatum","Eragrostis curtipedicellata","Eragrostis minor","Hordeum murinum","Melinis repens","Nassella tenuissima","Stapfochloa ciliata","Tridens congestus"]
OUT=ROOT/"review_temporary_batch4";OUT.mkdir(exist_ok=True)
LICENSES={"cc0","cc-by","cc-by-sa","cc-by-nc","cc-by-nc-sa"}
def fetch_json(url):
  req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyImageVisualReview/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)"})
  with urllib.request.urlopen(req,timeout=35) as res:return json.load(res)
def fetch_image(url):
  req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyImageVisualReview/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)"})
  with urllib.request.urlopen(req,timeout=35) as res:return Image.open(io.BytesIO(res.read())).convert("RGB")
def wrap(s,maxchar=43):
  s=str(s or "")
  return "\n".join(s[i:i+maxchar] for i in range(0,len(s),maxchar))
def render(name,items):
  TILE=(340,310); ncol=3
  nrow=(len(items)+ncol-1)//ncol
  page=Image.new("RGB",(ncol*TILE[0],nrow*TILE[1]+62),"white")
  draw=ImageDraw.Draw(page)
  draw.text((14,13),name+" — selected HAYS OBSERVATIONS, research-only CC images",fill="black")
  draw.text((14,36),"Visual check only • image attribution retained in metadata.json • no images on published site",fill="black")
  for n,z in enumerate(items):
    x=(n%ncol)*TILE[0]; y=(n//ncol)*TILE[1]+62
    im=z["image"];im.thumbnail((328,235))
    page.paste(im,(x+(TILE[0]-im.width)//2,y+4))
    tag=f"{z['observation_id']} | #{z['photo_id']} | {z['license']}"
    draw.text((x+6,y+244),tag,fill="black")
    draw.text((x+6,y+262),str(z["creator"] or "")[:47],fill="black")
    draw.text((x+6,y+280),z["date"] or "",fill="black")
  namefile=re.sub(r"[^A-Za-z0-9]+","-",name).strip("-").lower()
  path=OUT/(namefile+"-contact.jpg");page.save(path,quality=86)
  return path
full=[]
for candidate in CANDIDATES:
  src=LOOK[candidate]
  best=sorted(src["observations"],key=lambda o:(o["photo_count"],o.get("identifications_count",0)),reverse=True)[:9]
  saved=[];metadata=[];seen=set()
  for v in best:
    if len(saved)>=12:break
    oid=v["observation_id"]
    try:
      js=fetch_json("https://api.inaturalist.org/v1/observations/"+str(oid))
      o=(js.get("results") or [None])[0]
      if not o:continue
      for p in (o.get("photos") or [])[:9]:
        code=str(p.get("license_code") or "").lower().strip()
        photo_id=p.get("id")
        if code not in LICENSES or not photo_id or photo_id in seen:continue
        creator=p.get("attribution") or p.get("native_username") or "credited photographer on original observation"
        preview=p.get("url")
        if not preview:continue
        url=preview.replace("/square.","/medium.").replace("/small.","/medium.")
        try: img=fetch_image(url)
        except Exception as exc:
          print("IMAGE_SKIP",candidate,photo_id,str(exc)[:130],flush=True)
          continue
        seen.add(photo_id)
        saved.append({"image":img,"observation_id":oid,"photo_id":photo_id,"license":code,"creator":creator,"date":o.get("observed_on")})
        metadata.append({"candidate":candidate,"observation_id":oid,"photo_id":photo_id,"source_observation":f"https://www.inaturalist.org/observations/{oid}","source_photo_page":f"https://www.inaturalist.org/photos/{photo_id}","image_license":code,"attribution":creator,"image_url":url,
        "visual_review_status":"PENDING_HUMAN_OR_VISION_INSPECTION","site_redistribution":"NOT_APPROVED"})
        if len(saved)>=12:break
      time.sleep(.25)
    except Exception as err:print("OBS_SKIP",candidate,oid,str(err)[:140],flush=True)
  if saved:
    p=render(candidate,saved)
    print("CONTACT_SHEET",candidate,str(p),len(saved),flush=True)
  else:print("NO_CC_PHOTOS",candidate,flush=True)
  full+=metadata
(OUT/"attributions.json").write_text(json.dumps({"generated":"2026-11-11","purpose":"Temporary NONCOMMERCIAL educational review contact sheets of Hays County source photos with exact CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA photo licenses; no image site publication","licenses":sorted(LICENSES),"photos":full},indent=2)+"\n")
(OUT/"README.txt").write_text("CREDITED NONCOMMERCIAL TEMPORARY REVIEW ONLY. 1-day GitHub Actions artifact retention. Photos include CC BY-NC licenses, cannot be rehosted on commercial sites. Third-party images are not in the repository; DO NOT publish on website without confirming exact-source permissions, use and credit. See attributions.json.\n")
print("SUMMARY_CC_PHOTOS",len(full),"PER_SPECIES",json.dumps({k:sum(x["candidate"]==k for x in full) for k in CANDIDATES}),flush=True)
