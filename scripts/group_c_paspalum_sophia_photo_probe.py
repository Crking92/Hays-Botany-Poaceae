#!/usr/bin/env python3
"""Single-observation read-only photo rights/visual inspection. No gallery writes."""
import hashlib,io,json,re,sys,time
from urllib.request import Request,urlopen
from PIL import Image,ImageDraw,ImageOps
OBS=31311178
def request(url):
  last=None
  for i in range(3):
    try:
      with urlopen(Request(url,headers={"User-Agent":"HaysBotanyGroupCPhotoQA/1.0","Accept":"application/json,image/*,*/*"}),timeout=40) as f:return f.read(16000000)
    except Exception as e:last=e;time.sleep(i+1)
  raise last
def main():
  data=json.loads(request("https://api.inaturalist.org/v1/observations/"+str(OBS)))["results"][0]
  taxon=(data.get("taxon") or {}).get("name","")
  report={"observation_id":OBS,"source":"https://www.inaturalist.org/observations/"+str(OBS),"taxon_reported":taxon,"quality_grade":data.get("quality_grade"),"observer":(data.get("user") or {}).get("login"),"observed_on":data.get("observed_on"),"place_guess":data.get("place_guess"),"photos":[]}
  with open("site/visual-key-lab/hays-candidates.json",encoding="utf8") as f:manifest=json.load(f)
  past=[p for c in manifest["candidates"] if c.get("scientific")=="Paspalum langei" for p in c.get("approved_gallery",[])]
  report["existing_paspalum_refs"]=[p.get("image_filename") for p in past]
  cells=[];issues=[]
  if "langei" not in taxon.lower():issues.append("OBSERVATION TAXON DOES NOT MATCH P. langei")
  for photo in data.get("photos",[])[:12]:
    pid=photo["id"]; lic=photo.get("license_code")
    who=photo.get("attribution") or ""
    item=dict(photo_id=pid,license_code=lic,attribution=who,source="https://www.inaturalist.org/photos/"+str(pid))
    rawurl=photo.get("url","")
    ext=(rawurl.split("?")[0].rsplit(".",1)[-1] or "jpg").lower()
    if ext not in ("jpg","jpeg","png"):ext="jpg"
    url=f"https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/original.{ext}"
    try:
      b=request(url)
      with Image.open(io.BytesIO(b)) as original:
        item.update(dimensions=list(original.size),format=original.format,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
        im=ImageOps.contain(original.convert("RGB"),(420,370))
      tile=Image.new("RGB",(460,420),"white");tile.paste(im,((460-im.width)//2,10))
      ImageDraw.Draw(tile).text((10,385),f"Photo {pid}  {lic} | "+who[:33],fill="black")
      cells.append(tile)
    except Exception as e:item["retrieve_error"]=str(e);issues.append(str(pid)+" download error")
    report["photos"].append(item)
  if not cells:issues.append("NO DECODABLE ORIGINALS")
  if cells:
    cols=2;rows=(len(cells)+1)//2
    sheet=Image.new("RGB",(cols*460,rows*420),"white")
    for i,t in enumerate(cells):sheet.paste(t,((i%cols)*460,(i//cols)*420))
    sheet.save("paspalum-sophia-source-contact.jpg",quality=85)
  report["holds"]=issues
  report["disclaimer"]="Photo-specific iNaturalist license code and original bytes only; wildflowersearch.org separately links Sophia K observation to CC BY 4.0 but must match exact photo ID before installing. Not a certified local voucher."
  with open("paspalum-sophia-source.json","w") as f:json.dump(report,f,indent=2)
  print(json.dumps(report,indent=2))
  if issues:sys.exit(1)
if __name__=="__main__":main()
