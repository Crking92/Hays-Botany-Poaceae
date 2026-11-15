#!/usr/bin/env python3
"""Create temporary photo QA contact sheets from current approved on-repo grass images.

Never uploads, moves or alters source photos. A low-res contact sheet is emitted
only into the ephemeral CI log for exact-file visual inspection by the reviewer.
"""
import base64
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT=Path(__file__).resolve().parents[1]
LAB=ROOT/"site"/"visual-key-lab"
extra=json.loads((LAB/"grass-glossary-terms.json").read_text())["terms"]
seen={}
for key,term in extra.items():
    p=term.get("photo")
    if not p: continue
    src=p.get("src","")
    prefix="https://crking92.github.io/Hays-Botany-Poaceae/"
    if not src.startswith(prefix): continue
    path=src[len(prefix):]
    if path not in seen:
        seen[path]={"key":key,"label":p.get("label",key),"path":path,
                    "creator":p.get("creator",""),"license":p.get("license","")}
special="content/taxa/Poaceae/Dichanthium/dichanthium-sericeum/images/harry-rose-dichanthium-sericeum-true-exposed-ligule5.jpg"
seen[special]={"key":"ligule","label":"Exposed inner ligule — D. sericeum",
               "path":special,"creator":"Harry Rose","license":"CC BY 2.0"}
items=list(seen.values())
assert len(items)==9, len(items)
cols=3
cell_w,cell_h=440,410
rows=(len(items)+cols-1)//cols
sheet=Image.new("RGB",(cols*cell_w,rows*cell_h),(245,246,239))
draw=ImageDraw.Draw(sheet)
font=ImageFont.load_default()
for idx,photo in enumerate(items):
    path=ROOT/photo["path"]
    assert path.is_file(), path
    with Image.open(path) as image:
        rgb=ImageOps.exif_transpose(image).convert("RGB")
        original=rgb.size
        rgb.thumbnail((cell_w-22,cell_h-92),Image.Resampling.LANCZOS)
        x=(idx%cols)*cell_w
        y=(idx//cols)*cell_h
        ox=x+(cell_w-rgb.width)//2
        oy=y+10+(cell_h-90-rgb.height)//2
        sheet.paste(rgb,(ox,oy))
        draw.rectangle((x,y,x+cell_w-1,y+cell_h-1),outline=(140,160,140),width=2)
        draw.text((x+12,y+cell_h-78),f"{idx+1}. {photo['key']}  [{original[0]}x{original[1]}]",fill=(25,45,30),font=font)
        label=photo["label"]
        draw.text((x+12,y+cell_h-58),label[:57],fill=(25,45,30),font=font)
        draw.text((x+12,y+cell_h-38),photo["creator"][:44]+" · "+photo["license"],fill=(70,70,62),font=font)
payload=io.BytesIO()
sheet.save(payload,format="JPEG",quality=73,optimize=True)
encoded=base64.b64encode(payload.getvalue()).decode("ascii")
print("HAYS_PHOTO_QA_IMAGE_BEGIN",flush=True)
for i in range(0,len(encoded),5000):
    print("HAYS_PHOTO_QA_IMAGE_PART "+encoded[i:i+5000],flush=True)
print("HAYS_PHOTO_QA_IMAGE_END",flush=True)
print("HAYS_PHOTO_QA_RECORDS "+json.dumps({"items":items,"sheet_size":sheet.size,"jpeg_bytes":len(payload.getvalue())}),flush=True)


# Alternate already-published, already-credited grass photographs that can
# replace or qualify weak examples. No downloads; use existing repository bytes.
candidates=[
("open panicle / D. commutatum","content/taxa/Poaceae/Dichanthelium/dichanthelium-commutatum/images/commons-dichanthelium-commutatum-2-archive.jpg"),
("open panicle / D. oligosanthes","content/taxa/Poaceae/Dichanthelium/dichanthelium-oligosanthes/images/commons-dichanthelium-oligosanthes-choess.jpg"),
("pedicel / Eragrostis hirsuta","content/taxa/Poaceae/Eragrostis/eragrostis-hirsuta/images/douglas-goldman-single-spikelet-3.jpg"),
("several pedicels / Eragrostis","content/taxa/Poaceae/Eragrostis/eragrostis-hirsuta/images/douglas-goldman-spikelets-on-branches-4.jpg"),
("grass hair macro / KR bluestem","content/taxa/Poaceae/Bothriochloa/bothriochloa-ischaemum/images/jim-conrad-uvalde-kr-bulbous-based-collar-hairs.jpg"),
("rhizomes/stems / Paspalum","content/taxa/Poaceae/Paspalum/paspalum-distichum/images/harry-rose-rhizomes1-8251311954.jpg"),
("spikelet pair / Dichanthium","content/taxa/Poaceae/Dichanthium/dichanthium-sericeum/images/harry-rose-dichanthium-sericeum-real-spikelet-pair1.jpg"),
("hairy ligule / Panicum hallii","content/taxa/Poaceae/Panicum/panicum-hallii/images/jim-conrad-hallii-true-hairy-ligule-public-domain.jpg")
]
cols=3;cell_w,cell_h=440,410;rows=(len(candidates)+cols-1)//cols
sheet=Image.new("RGB",(cols*cell_w,rows*cell_h),(245,246,239));draw=ImageDraw.Draw(sheet)
for idx,(label,path) in enumerate(candidates):
    with Image.open(ROOT/path) as img:
        rgb=ImageOps.exif_transpose(img).convert("RGB")
        original=rgb.size
        rgb.thumbnail((cell_w-22,cell_h-88),Image.Resampling.LANCZOS)
        x=(idx%cols)*cell_w;y=(idx//cols)*cell_h
        sheet.paste(rgb,(x+(cell_w-rgb.width)//2,y+10+(cell_h-88-rgb.height)//2))
        draw.rectangle((x,y,x+cell_w-1,y+cell_h-1),outline=(140,160,140),width=2)
        draw.text((x+12,y+cell_h-65),f"{idx+1}. {label} [{original[0]}x{original[1]}]",fill=(25,45,30),font=font)
        draw.text((x+12,y+cell_h-45),Path(path).name[:60],fill=(70,70,62),font=font)
buf=io.BytesIO();sheet.save(buf,format="JPEG",quality=75,optimize=True)
encoded=base64.b64encode(buf.getvalue()).decode("ascii")
print("HAYS_PHOTO_QA_CANDIDATES_BEGIN",flush=True)
for i in range(0,len(encoded),5000):
    print("HAYS_PHOTO_QA_CANDIDATES_PART "+encoded[i:i+5000],flush=True)
print("HAYS_PHOTO_QA_CANDIDATES_END",flush=True)
print("HAYS_PHOTO_QA_CANDIDATES_RECORDS "+json.dumps({"items":candidates,"sheet_size":sheet.size,"jpeg_bytes":len(buf.getvalue())}),flush=True)
