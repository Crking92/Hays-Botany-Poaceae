#!/usr/bin/env python3
"""Make temporary, credited contact sheets of exact iNat photo IDs.

This is source review ONLY. It does not approve identification, publish or
copy original photos into the GitHub repository, or edit Hays gallery files.
Output files are solely workflow artifacts for human botanical picture review.
"""
import hashlib
import io
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

TARGETS = [
  ("Tridentopsis elongata", 377001623, 689363680),
  ("Tridentopsis elongata", 377001623, 689363761),
  ("Tridentopsis elongata", 377001623, 689363853),
  ("Tridentopsis elongata", 403412171, 740687416),
  ("Eragrostis curtipedicellata", 409703200, 753366028),
  ("Eragrostis curtipedicellata", 409703200, 753366084),
  ("Eragrostis curtipedicellata", 401575636, 737076545),
  ("Eragrostis curtipedicellata", 401575636, 737076623),
  ("Elymus macgregorii", 401708293, 737334737),
  ("Elymus macgregorii", 401708293, 737334689),
  ("Elymus macgregorii", 368549870, 673153394),
  ("Elymus macgregorii", 379861752, 694889625),
]
ALLOW = {"cc0", "cc-by", "cc-by-sa"}
OUT = Path("qa-report/group-b-final-three-contact-sheet")
OUT.mkdir(parents=True, exist_ok=True)
AGENT = "HaysBotanyPoaceaeContactSheet/1.0 (source rights and actual pixel QA, GitHub Crking92/Hays-Botany-Poaceae)"

def get(url):
    error = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":AGENT,"Accept":"*/*"})
            with urllib.request.urlopen(req, timeout=24) as r:
                if r.status != 200:
                    raise RuntimeError("HTTP "+str(r.status))
                data=r.read(9*1024*1024+1)
                if len(data)>9*1024*1024:
                    raise ValueError("Preview too large")
                return data
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, RuntimeError, ValueError) as e:
            error=e
            if attempt<2:
                time.sleep((attempt+1)*2.0)
    raise RuntimeError(str(error))

def quote(s, limit):
    s = str(s or "not recorded").strip()
    return s[:limit-1]+"…" if len(s)>limit else s

def draw_card(rec, cell_w=425, cell_h=390):
    card = Image.new("RGB", (cell_w, cell_h), "#f6f6f4")
    d = ImageDraw.Draw(card)
    band = {"Tridentopsis elongata":"#1b6976", "Eragrostis curtipedicellata":"#a15c50",
            "Elymus macgregorii":"#72579d"}.get(rec["expected_species"], "#5a6470")
    d.rectangle((0,0,cell_w,39), fill=band)
    d.text((14,11),rec["expected_species"],fill="#ffffff")
    if rec.get("preview_file"):
        im=Image.open(OUT/rec["preview_file"])
        im=ImageOps.exif_transpose(im).convert("RGB")
        fit=ImageOps.contain(im,(cell_w-24,273),Image.Resampling.LANCZOS)
        x=(cell_w-fit.width)//2
        y=46+(273-fit.height)//2
        card.paste(fit,(x,y))
    else:
        d.text((25,140),"PREVIEW UNAVAILABLE",fill="#c13333")
    d.line([(10,325),(cell_w-10,325)],fill="#cccccc",width=1)
    d.text((12,332),f"photo {rec['photo_id']}  |  {rec.get('license','HOLD')}",fill="#191919")
    d.text((12,349),quote(rec.get("creator"),56),fill="#333333")
    d.text((12,366),f"Obs {rec['observation_id']}  |  PIXELS / ID: UNREVIEWED",fill="#65412f")
    return card

def main():
    cache={}
    results=[]
    for ix,(expected,obs_id,photo_id) in enumerate(TARGETS,1):
        rec={"expected_species":expected, "observation_id":obs_id,
             "photo_id":photo_id,
             "source_photo_page":f"https://www.inaturalist.org/photos/{photo_id}",
             "source_observation_page":f"https://www.inaturalist.org/observations/{obs_id}",
             "review_status":"SOURCE_PHOTO_LICENSE_RETRIEVED_VISUAL_ID_PENDING",
             "published":False}
        try:
            if obs_id not in cache:
                obs=json.loads(get(f"https://api.inaturalist.org/v1/observations/{obs_id}").decode())["results"][0]
                cache[obs_id]=obs
            o=cache[obs_id]
            rec["observed_taxon"]=o.get("taxon",{}).get("name")
            rec["research_grade"]=o.get("quality_grade")=="research"
            if rec["observed_taxon"]!=expected:
                raise ValueError(f"Taxon mismatch: {rec['observed_taxon']} != {expected}")
            p=next((p for p in o.get("photos",[]) if p.get("id")==photo_id),None)
            if p is None:raise ValueError("Photo ID not in original observation")
            rec["license"]=(p.get("license_code") or "none").lower()
            rec["attribution"]=p.get("attribution")
            rec["creator"]=(p.get("user") or {}).get("name") or (p.get("user") or {}).get("login") or (o.get("user") or {}).get("name") or (o.get("user") or {}).get("login") or "unknown"
            if rec["license"] not in ALLOW:
                raise ValueError("Photo license is not CC0/BY/BY-SA; hold")
            src=p.get("url")
            if not src: raise ValueError("Original photo API URL absent")
            # Image API uses square image; use the associated, same photo-id
            # medium rendition so botanical structures can be visually checked.
            preview_url=src.replace("/square.", "/medium.")
            rec["preview_url"]=preview_url
            payload=get(preview_url)
            im=Image.open(io.BytesIO(payload))
            im.verify()
            im=Image.open(io.BytesIO(payload))
            rec["preview_size"]=list(im.size)
            rec["preview_sha256"]=hashlib.sha256(payload).hexdigest()
            ext="jpg"
            preview_name=f"photo_{photo_id}.{ext}"
            im.convert("RGB").save(OUT/preview_name,format="JPEG",quality=85)
            rec["preview_file"]=preview_name
            rec["stage"]="LICENSE_MATCH_PREVIEW_DOWNLOADED_NOT_PUBLISHED"
        except Exception as e:
            rec["stage"]="HOLD_PREVIEW_OR_SOURCE_FAILURE"
            rec["error"]=str(e)
        results.append(rec)
        print("PHOTO_CONTACT "+json.dumps(rec,ensure_ascii=False),flush=True)
        if ix<len(TARGETS):time.sleep(0.6)

    sheets=[]
    for start in range(0,len(results),6):
        block=results[start:start+6]
        sheet=Image.new("RGB",(425*3,390*2),"#ffffff")
        for j,rec in enumerate(block):
            sheet.paste(draw_card(rec),((j%3)*425,(j//3)*390))
        name=f"contact_sheet_{start//6+1}.jpg"
        sheet.save(OUT/name,quality=87,optimize=True)
        sheets.append(name)
    summary={
      "scope":"12 original photo IDs for last 3 nonhybrid zero-photo Group B grasses",
      "origin":"iNaturalist per-photo public API; image previews for QA ONLY",
      "license_eligible_records":sum(x.get("license") in ALLOW for x in results),
      "visual_previews_downloaded":sum("preview_file" in x for x in results),
      "images_approved_for_publication":0,
      "images_installed":0,
      "contact_sheets":sheets,
      "note":"Publisher must inspect actual image species ID/role and source license VERSION, compare originals/hashes against archive, then publish and verify live website pixels/credits. Contact sheets are crops/previews, not permission or scientific identification."
    }
    (OUT/"sources.json").write_text(json.dumps({"summary":summary,"photos":results},indent=2,ensure_ascii=False))
    print("CONTACT_SUMMARY "+json.dumps(summary),flush=True)
    if summary["visual_previews_downloaded"]<7:raise SystemExit("Fewer than seven previews accessible; inspect source failures")

if __name__=="__main__":main()
