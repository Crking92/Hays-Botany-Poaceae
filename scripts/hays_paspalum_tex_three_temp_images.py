#!/usr/bin/env python3
"""Fetch 3 UT TEX original specimens (image media CC BY 4.0) for temporary QA.

Digitized sheet image copyright belongs to UT Austin. Contact sheets only in
24-hour GitHub Actions artifact, never committed to the published repository.
"""
import json,pathlib,urllib.request,urllib.parse,time,io
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
src=json.loads((ROOT/"audits/hays-paspalum-langei-tex-three-specimen-metadata-20261111.json").read_text())
out=ROOT/"review_paspalum_tex_3_temp";out.mkdir(exist_ok=True)
summary=[]
Image.MAX_IMAGE_PIXELS=200_000_000
for rec in src["records"]:
  key=rec["gbif_id"]
  m=rec["media"][0] if rec.get("media") else {}
  med=m.get("identifier") or ""
  if "creativecommons.org/licenses/by/4.0" not in str(m.get("license") or ""):
    summary.append({"gbif_id":key,"status":"LICENSE_NOT_PERMITTED","license":m.get("license")});continue
  urls=[med.replace("http://","https://",1),med]
  image=None;fail=[]
  for url in urls:
    try:
      req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (HaysBotanyHerbariumVisualResearch/1.0; noncommercial review)","Accept":"image/jpeg,image/png,image/*"})
      with urllib.request.urlopen(req,timeout=55) as response:
        raw=response.read(32_000_000)
        status=response.status
        mime=response.headers.get("Content-Type")
      im=Image.open(io.BytesIO(raw))
      im.load();image=ImageOps.exif_transpose(im).convert("RGB")
      break
    except Exception as ex:
      fail.append({"url":url,"error":str(ex)[:150]})
  if image is None:
    print("TEX_IMAGE_FAIL",key,fail,flush=True)
    summary.append({"gbif_id":key,"status":"IMAGE_UNAVAILABLE","tried":fail,"original_link":med});continue
  orig=image.size
  image.thumbnail((3300,3800),Image.Resampling.LANCZOS)
  path=out/(str(key)+"-specimen.jpg")
  image.save(path,quality=86,optimize=True)
  sumrec={"gbif_id":key,"status":"IMAGE_SAVED_TEMP_ONLY","dimensions_orig":orig,"dimensions_review":image.size,
          "file":path.name,"media_url":med,"source_license":m["license"],"source_credit":"University of Texas at Austin (TEX herbarium)",
          "catalog":rec["occurrence"].get("catalogNumber")}
  summary.append(sumrec)
  print("TEX_IMAGE_SAVED",sumrec,flush=True)
  time.sleep(.3)
work=[x for x in summary if x["status"]=="IMAGE_SAVED_TEMP_ONLY"]
if work:
  canvas=Image.new("RGB",(len(work)*920,1320),(255,255,255))
  draw=ImageDraw.Draw(canvas)
  for idx,info in enumerate(work):
    im=Image.open(out/info["file"])
    im.thumbnail((880,1190),Image.Resampling.LANCZOS)
    x=idx*920+(920-im.width)//2;y=45
    canvas.paste(im,(x,y))
    draw.text((idx*920+10,4),f"{info['catalog']} | GBIF {info['gbif_id']} | UT TEX | CC BY 4.0",fill="black")
  canvas.save(out/"three-TEX-specimen-review.jpg",quality=86)
(out/"media-review-metadata.json").write_text(json.dumps({"purpose":"Temporary credited research-only herbarium specimen visual review","visual_inspection_status":"PENDING_HUMAN_VISUAL_REVIEW", "source":"University of Texas at Austin, TEX herbarium, GBIF occurrence media", "media_record_licensing":"CC BY 4.0; each source individually checked","results":summary},indent=2)+"\n")
(out/"README.txt").write_text("Temporary visual inspection copy only. UT Austin TEX herbarium CC BY 4.0 source sheet images. Attribute University of Texas at Austin and the original catalog/GBIF source for any proposed reuse. Not approved for public Hays Grass ID website; verify rights per image before publication.\n")
print("TEX_IMAGES_SUMMARY",json.dumps({"available":len(work),"unavailable":[x["gbif_id"] for x in summary if x["status"]!="IMAGE_SAVED_TEMP_ONLY"]}),flush=True)
