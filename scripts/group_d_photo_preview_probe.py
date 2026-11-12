#!/usr/bin/env python3
"""Group D read-only exact-URL photo pixel inspection helper. No gallery writes."""
import concurrent.futures, hashlib, io, json, pathlib, re, requests
from PIL import Image, ImageDraw, ImageOps, ImageFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUTPUT=ROOT/"group-d-results"
OUTPUT.mkdir(exist_ok=True)
IDS=["lolium-multiflorum","oplismenus-hirtellus","stenotaphrum-secundatum",
"triticum-aestivum","setaria-viridis","polypogon-viridis","dactyloctenium-aegyptium",
"hordeum-murinum","cenchrus-ciliaris","panicum-repens","sclerochloa-dura",
"sporobolus-cryptandrus","bromus-catharticus","lolium-perenne","echinochloa-colona",
"paspalum-notatum","bromus-tectorum"]
allc=json.loads((ROOT/"site/visual-key-lab/hays-candidates.json").read_text())["candidates"]
rows=[x for x in allc if x["id"] in IDS]
assert len(rows)==17
jobs=[(c["id"], i, p) for c in rows for i,p in enumerate(c.get("approved_gallery",[]))]
assert len(jobs)>=34
def fetch(item):
    sp,i,p=item; src=p.get("src","")
    out=dict(species_id=sp,index=i,filename=p.get("image_filename"),
      role=p.get("role"),creator=p.get("creator"),license=p.get("license"),
      source_page=p.get("source_page"),url=src)
    if not src.startswith("https://commons.wikimedia.org/wiki/Special:FilePath/"):
        out.update(status="UNSUPPORTED_SOURCE_HOST",http_code=None);return out,None
    try:
        res=requests.get(src,headers={"User-Agent":"HaysBotanyResearchPhotoQA/1.0 (noncommercial educational audit)"},timeout=25)
        out["http_code"]=res.status_code
        res.raise_for_status()
        if len(res.content)>10_000_000: raise ValueError("unexpected >10 MB image")
        image=Image.open(io.BytesIO(res.content))
        image=ImageOps.exif_transpose(image).convert("RGB")
        out.update(status="IMAGE_PIXELS_LOADED",width=image.width,height=image.height,
                   sha256=hashlib.sha256(res.content).hexdigest(),bytes=len(res.content))
        return out,image
    except Exception as exc:
        out.update(status="SOURCE_PIXELS_INACCESSIBLE",error=str(exc)[:230])
        return out,None
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results=list(pool.map(fetch,jobs))
meta=[a for a,_ in results]
pr=OUTPUT/"previews";pr.mkdir(exist_ok=True)
bySpecies={}
for (result,image) in results:bySpecies.setdefault(result["species_id"],[]).append((result,image))
for sp in IDS:
    arr=bySpecies.get(sp,[])
    W=1200; cellW=400; cellH=380
    canvas=Image.new("RGB",(W,cellH*max(1,(len(arr)+2)//3)),(250,249,243))
    draw=ImageDraw.Draw(canvas)
    for j,(entry,img) in enumerate(arr):
        left=(j%3)*cellW;top=(j//3)*cellH
        draw.rectangle((left,top,left+399,top+379),outline=(150,160,151),width=2)
        if img:
            img.thumbnail((386,285))
            canvas.paste(img,(left+(cellW-img.width)//2,top+4+(282-img.height)//2))
        else:
            draw.text((left+18,top+130),"PIXELS UNAVAILABLE",fill=(140,0,0))
        caption=[
            (entry.get("role") or "")[:48],
            (entry.get("creator") or "")[:48],
            (entry.get("filename") or "")[:52],
            ("Status: "+entry.get("status",""))[:52]]
        for k,line in enumerate(caption):
            draw.text((left+8,top+284+22*k),line,fill=(20,40,29))
    canvas.save(pr/(sp+".jpg"),quality=80,optimize=True)
def shaRows(d):
    return [x["sha256"] for x in d if x.get("sha256")]
allsha=shaRows(meta)
res={
"species_requested":len(IDS),
"image_refs_tested":len(jobs),
"image_pixels_loaded":sum(x["status"]=="IMAGE_PIXELS_LOADED" for x in meta),
"image_pixels_unavailable":sum(x["status"]!="IMAGE_PIXELS_LOADED" for x in meta),
"duplicate_image_byte_hashes":len(allsha)-len(set(allsha)),
"live_public_page_pixels_verified":False,
"note":"Source-image fetch is NOT an independent confirmation of actual rendered Pages gallery. Photo IDs/licensing remain as stored; genus/species pictured require visual review.",
"photos":meta}
(OUTPUT/"photo-pixel-probe.json").write_text(json.dumps(res,indent=2)+"\n")
print("GROUP_D_PHOTO_PIXEL_PROBE "+json.dumps({k:v for k,v in res.items() if k!="photos"}))
