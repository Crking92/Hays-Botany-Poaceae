#!/usr/bin/env python3
import urllib.request, io, base64
from PIL import Image, ImageDraw, ImageOps
photos=[(678391628,"A.G. / photo 1"),(678391717,"A.G. / photo 2"),(671801480,"IDClaire / photo 1"),(671801500,"IDClaire / photo 2"),(189514621,"Existing Hays / samlutfy")]
im=Image.new("RGB",(960,760),"white");draw=ImageDraw.Draw(im)
for i,(pid,label) in enumerate(photos):
    url=f"https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/large.jpg"
    req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyPhotoQA/1.0"})
    with urllib.request.urlopen(req,timeout=24) as r: content=r.read()
    src=Image.open(io.BytesIO(content)).convert("RGB")
    src.thumbnail((310,335))
    x=20+(i%3)*320+(310-src.width)//2
    y=20+(i//3)*380+(335-src.height)//2
    im.paste(src,(x,y))
    draw.text((20+(i%3)*320,355+(i//3)*380),f"{pid} - {label}",fill="black")
out=io.BytesIO();im.save(out,format="JPEG",quality=67,optimize=True)
print("MELICA_CONTACT_SHEET_BEGIN"+base64.b64encode(out.getvalue()).decode()+"MELICA_CONTACT_SHEET_END",flush=True)
