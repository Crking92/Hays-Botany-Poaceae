#!/usr/bin/env python3
"""READ-ONLY Group B complement image original gate; never writes gallery or image files."""
import hashlib, io, json, time, urllib.request
from pathlib import Path
from PIL import Image

UA = "HaysBotanyGroupBSourceQA/1.0 (github.com/Crking92/Hays-Botany-Poaceae)"
TARGETS = (
    {"species":"Tridens congestus","observation_id":355629216,"photo_id":648545557,
     "creator":"dsorenson","role":"Mature tan compact panicles (seasonal contrast)"},
    {"species":"Pappophorum bicolor","observation_id":321509957,"photo_id":581468317,
     "creator":"sonoresmore","role":"Pale feathery flowerhead close view"},
)
MANIFEST = "site/visual-key-lab/hays-candidates.json"

def get(url, limit=15_000_000):
    error=None
    for attempt in range(3):
        try:
            req=urllib.request.Request(url, headers={"User-Agent":UA,"Accept":"application/json,image/*"})
            with urllib.request.urlopen(req,timeout=25) as r:
                if r.status != 200: raise RuntimeError("HTTP "+str(r.status))
                data=r.read(limit+1)
                if len(data)>limit: raise RuntimeError("More than 15MB")
                return data
        except Exception as ex:
            error=ex
            if attempt<2: time.sleep((attempt+1)*3)
    raise RuntimeError(str(error))

def api_observation(obs):
    obj=json.loads(get(f"https://api.inaturalist.org/v1/observations/{obs}"))
    rows=obj.get("results") or []
    if len(rows)!=1: raise RuntimeError("Expected exactly one source observation")
    return rows[0]

def current_galleries():
    manifest=json.loads(Path(MANIFEST).read_text())
    photos=[]
    for c in manifest["candidates"]:
        for photo in c.get("approved_gallery",[]):
            photos.append((c.get("scientific"),photo))
    return photos

def original_url(p):
    raw=p.get("url") or ""
    for size in ("square","thumb","small","medium","large"):
        raw=raw.replace("/"+size+".","/original.")
    if "/original." not in raw: raise RuntimeError("Cannot identify original-media path: "+raw)
    return raw

def main():
    current=current_galleries()
    output=[]
    for target in TARGETS:
        name=target["species"]; obsid=target["observation_id"]; photoid=target["photo_id"]
        observation=api_observation(obsid)
        observed=(observation.get("taxon") or {}).get("name")
        if observed != name: raise RuntimeError(f"{photoid}: source taxon mismatch {observed!r} != {name!r}")
        if observation.get("quality_grade") != "research":
            raise RuntimeError(f"{photoid}: source observation not research-grade")
        p=next((p for p in observation.get("photos",[]) if p.get("id")==photoid),None)
        if p is None: raise RuntimeError(f"{photoid}: exact source photo not found under observation")
        code=(p.get("license_code") or "").lower()
        if code!="cc0": raise RuntimeError(f"{photoid}: photo-specific license not CC0: {code}")
        owner=p.get("user") or observation.get("user") or {}
        creator=owner.get("login") or owner.get("name")
        attribution=(p.get("attribution") or "")
        if target["creator"].lower() not in (creator or "").lower() and target["creator"].lower() not in attribution.lower():
            raise RuntimeError(f"{photoid}: creator mismatch: {creator!r}, {attribution!r}")
        url=original_url(p)
        blob=get(url)
        img=Image.open(io.BytesIO(blob))
        img.verify()
        img=Image.open(io.BytesIO(blob))
        width,height=img.size
        if min(width,height)<650: raise RuntimeError(f"{photoid}: insufficient full resolution {width}x{height}")
        sha=hashlib.sha256(blob).hexdigest()
        relevant_refs=[]
        for species,existing in current:
            oldid=str(existing.get("image_filename") or "")+"|"+str(existing.get("source_page") or "")+"|"+str(existing.get("src") or "")+"|"+str(existing.get("original_media_url") or "")
            if str(photoid) in oldid: relevant_refs.append((species,"photo_id"))
            if existing.get("original_sha256")==sha: relevant_refs.append((species,"sha256"))
        if relevant_refs: raise RuntimeError(f"{photoid}: source/historical collision in manifest {relevant_refs}")
        output.append({"species":name,"photo_id":photoid,"observation_id":obsid,
           "research_grade_source_taxon":observed,
           "photographer":creator,"photo_attribution":attribution,
           "source_page":f"https://www.inaturalist.org/photos/{photoid}",
           "observation_page":f"https://www.inaturalist.org/observations/{obsid}",
           "source_photo_license":"CC0 1.0","license_url":"https://creativecommons.org/publicdomain/zero/1.0/",
           "original_url":url,"original_sha256":sha,
           "original_bytes":len(blob),"width":width,"height":height,
           "preview_reviewed_role":target["role"],
           "role_note":"From prior separately reviewed Group B contact sheets, NOT a new species voucher",
           "status":"SOURCE_AND_ORIGINAL_VERIFIED_NOT_PUBLISHED"})
        print("GROUP_B_ORIGINAL_PASS "+json.dumps(output[-1],sort_keys=True),flush=True)
        time.sleep(0.5)
    if len({o["original_sha256"] for o in output})!=len(output):
        raise RuntimeError("Same exact file content across candidates")
    print("GROUP_B_SUMMARY "+json.dumps({"originals_checked":len(output),
       "distinct_original_hashes":len(output),"manifest_refs_compared":len(current),
       "publisher_handoff":"READY_FOR_SPECIES_ROLE_AND_FINAL_ARCHIVE_DEDUP",
       "live_new_photos":0,"note":"No original-image archive-wide SHA parity claimed."},sort_keys=True),flush=True)

if __name__=="__main__":main()
