#!/usr/bin/env python3
"""Temporarily render unapproved legacy glossary arrow coordinates on exact Commons files.

These overlays are for human inspection only. Nothing is published, copied back
to the read-only Hays Botany hub, or approved by simply rendering this sheet.
"""
import base64,hashlib,io,json,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[1]
terms=json.loads((ROOT/"site/visual-key-lab/shared-glossary-snapshot.json").read_text())["terms"]
KEYS=["culm","collar","spikelet","awn","parallel-veined","node","leaf-sheath","glume","lemma","palea"]
try:FONT=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",17)
except OSError:FONT=ImageFont.load_default()
def retrieve_exact(source):
    marker="wiki/File:"
    assert marker in source, source
    raw=source.split(marker,1)[1].split("?",1)[0].split("#",1)[0]
    filename=urllib.parse.unquote(raw).replace(" ","_")
    digest=hashlib.md5(filename.encode("utf-8")).hexdigest()
    url="https://upload.wikimedia.org/wikipedia/commons/"+digest[0]+"/"+digest[:2]+"/"+urllib.parse.quote(filename,safe="")
    request=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyEducationalImageReview/1.0 (source licensing and photo QA)"})
    with urllib.request.urlopen(request,timeout=22) as response:
        data=response.read(8*1024*1024)
    return Image.open(io.BytesIO(data)).convert("RGB"),url
def render_chunk(records,chunk):
    cols=2;cw=660;ch=575
    rows=(len(records)+cols-1)//cols
    sheet=Image.new("RGB",(cw*cols,ch*rows),(245,245,241))
    draw=ImageDraw.Draw(sheet)
    checked=[]
    for i,key in enumerate(records):
        x=(i%cols)*cw;y=(i//cols)*ch
        item=terms[key];p=item["real_photo"]
        draw.rectangle((x,y,x+cw-1,y+ch-1),outline=(90,120,90),width=2)
        draw.text((x+14,y+11),key.upper()+" · DRAFT annotations only",font=FONT,fill=(20,50,32))
        try:
            img,url=retrieve_exact(p["source_page"])
            original=img.size
            img=ImageOps.exif_transpose(img)
            img.thumbnail((cw-25,ch-105),Image.Resampling.LANCZOS)
            ox=x+(cw-img.width)//2;oy=y+36+(ch-115-img.height)//2
            sheet.paste(img,(ox,oy))
            targets=[]
            for a in p.get("annotations",[]):
                ax=ox+img.width*float(a["x"])/100;ay=oy+img.height*float(a["y"])/100
                lx=ox+img.width*float(a["label_x"])/100;ly=oy+img.height*float(a["label_y"])/100
                draw.line((lx,ly,ax,ay),fill=(230,20,20),width=3)
                draw.ellipse((ax-6,ay-6,ax+6,ay+6),fill=(230,20,20),outline="white",width=2)
                label=a["label"]
                box=draw.textbbox((lx,ly),label,font=FONT,anchor="lt")
                draw.rectangle((box[0]-3,box[1]-3,box[2]+3,box[3]+2),fill=(255,255,230))
                draw.text((lx,ly),label,font=FONT,fill=(65,30,16),anchor="lt")
                targets.append({"label":label,"point_percent":[a["x"],a["y"]],"text_percent":[a["label_x"],a["label_y"]]})
            draw.text((x+14,y+ch-52),f"source={original[0]}x{original[1]}  {item['term']}",font=FONT,fill=(25,45,30))
            checked.append({"term":key,"downloaded":True,"url":url,"annotations":targets,"original_size":original})
        except Exception as exc:
            checked.append({"term":key,"downloaded":False,"error":str(exc)[:230]})
            draw.text((x+20,y+120),"SOURCE IMAGE NOT RETRIEVED",font=FONT,fill=(170,45,35))
    buf=io.BytesIO();sheet.save(buf,format="JPEG",quality=75,optimize=True)
    encoded=base64.b64encode(buf.getvalue()).decode("ascii")
    print(f"HAYS_ARROW_QA_BEGIN {chunk}",flush=True)
    for i in range(0,len(encoded),5000):print(f"HAYS_ARROW_QA_PART_{chunk} "+encoded[i:i+5000],flush=True)
    print(f"HAYS_ARROW_QA_END {chunk}",flush=True)
    print("HAYS_ARROW_QA_RECORD "+json.dumps({"sheet":chunk,"results":checked,"size":sheet.size,"bytes":len(buf.getvalue())}),flush=True)
render_chunk(KEYS[:5],1)
render_chunk(KEYS[5:],2)
