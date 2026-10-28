#!/usr/bin/env python3
"""Sample real arrow landing positions from locally copied grass photos.

Creates small review sheets from original actual pixels (never modifies originals).
The output is evidence for manual judgment, not automatic anatomy certification.
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
from io import BytesIO
import base64,json
ROOT=Path(__file__).resolve().parents[1]
TAXA=[
("Indiangrass","Sorghastrum","sorghastrum-nutans"),
("Silver bluestem","Bothriochloa","bothriochloa-torreyana"),
("KR bluestem","Bothriochloa","bothriochloa-ischaemum"),
("Sideoats grama","Bouteloua","bouteloua-curtipendula"),
("Little bluestem","Schizachyrium","schizachyrium-scoparium"),
("Big bluestem","Andropogon","andropogon-gerardi"),
("Switchgrass","Panicum","panicum-virgatum"),
("Common reed","Phragmites","phragmites-australis")
]
def main():
 cards=sorted((ROOT/"content/taxa/Poaceae").rglob("species.json"))
 index={}
 for p in cards:
  d=json.loads(p.read_text());index[d.get("id",p.parent.name)]=(p,d)
 results=[]
 for title,genus,sid in TAXA:
  if sid not in index:
   results.append({"species":sid,"error":"not in source"});continue
  file,doc=index[sid]
  panels=[]
  for i,p in enumerate(doc.get("visual_comparison",{}).get("items") or []):
   v=p.get("image_url")
   if not isinstance(v,str) or v.startswith(("https:","http:")):continue
   path=ROOT/v if v.startswith("content/taxa/Poaceae/") else file.parent/v
   if path.is_file() and p.get("markers"):
    panels.append((len(p["markers"]),i,path,p))
  if not panels:
   results.append({"species":sid,"error":"No local visible annotated panels"});continue
  _,i,p,panel=max(panels,key=lambda x:x[0])
  try:
   img=ImageOps.exif_transpose(Image.open(p)).convert("RGB")
  except Exception as e:
   results.append({"species":sid,"error":str(e)});continue
  results.append({"species":sid,"title":title,"panel_index":i,"markers":panel["markers"],
      "path":str(p.relative_to(ROOT)),"im":img})
 slides=[x for x in results if "im" in x]
 out=ROOT/"qa-report/arrow-review";out.mkdir(parents=True,exist_ok=True)
 for batch in range((len(slides)+3)//4):
  sheet=Image.new("RGB",(1600,1460),"white")
  draw=ImageDraw.Draw(sheet)
  for i,item in enumerate(slides[batch*4:(batch+1)*4]):
   col=i%2;row=i//2
   ox=col*800;oy=row*730
   img=item["im"];img.thumbnail((750,525))
   x=ox+25+(750-img.width)//2;y=oy+42+(525-img.height)//2
   sheet.paste(img,(x,y))
   draw.text((ox+20,oy+12),item["title"]+" · original panel "+str(item["panel_index"]),fill=(0,0,0))
   for j,m in enumerate(item["markers"]):
    tx=x+img.width*float(m["target_x"])/100
    ty=y+img.height*float(m["target_y"])/100
    lx=x+img.width*float(m["label_x"])/100
    ly=y+img.height*float(m["label_y"])/100
    draw.line([(lx,ly),(tx,ty)],fill=(255,35,10),width=4)
    draw.ellipse((tx-11,ty-11,tx+11,ty+11),fill=(255,48,13),outline="white",width=3)
    draw.text((tx-5,ty-6),str(j+1),fill="white")
    label=str(m.get("label") or "").strip()[:77]
    draw.text((ox+16,oy+575+j*19),f"{j+1}. {label}",fill=(0,0,0))
   draw.text((ox+16,oy+696),item["species"],fill=(0,50,30))
  bio=BytesIO();sheet.save(bio,"JPEG",quality=76,optimize=True)
  path=out/f"grass-arrow-review-{batch+1:02d}.jpg"
  path.write_bytes(bio.getvalue())
  data=base64.b64encode(bio.getvalue()).decode()
  print("ARROW_SHEET_BEGIN",batch+1,len(bio.getvalue()))
  for idx,start in enumerate(range(0,len(data),3000)):print(f"ARROW_SHEET_{batch+1}_{idx}="+data[start:start+3000])
  print("ARROW_SHEET_END",batch+1)
 summary=[{"species":x["species"],"panel_index":x.get("panel_index"),"marker_count":len(x.get("markers",[])),"error":x.get("error"),"source":x.get("path")} for x in results]
 print("ARROW_REVIEW_INDEX",json.dumps(summary))
if __name__=="__main__":main()
