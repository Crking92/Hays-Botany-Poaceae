#!/usr/bin/env python3
"""Group B final photo evidence gate: no gallery writes, no publication, no scoring changes.
Exact photo membership, research label, source rights, original-file SHA, manifest duplication.
"""
import hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

UA="HaysBotanyGroupBFinalSourceQA/1.0 (github.com/Crking92/Hays-Botany-Poaceae)"
# All exactly preexisting primary-source photo IDs, NOT a broad photo search.
TARGETS=[
 ("Stapfochloa ciliata",144608484,248229079,"Cleveland Powell","Curved hairy unilateral inflorescence held in fingers (prior Group B actual preview)"),
 ("Stapfochloa ciliata",397795965,729639648,"Eric Knight","Finger-scaled inflorescence close-up (prior Group B actual preview)"),
 ("Elymus macgregorii",401708293,737334737,"Bryan Connolly","Long-awned mature spike close-up (prior Group B actual preview)"),
 ("Elymus macgregorii",366458488,669195696,"kent ozment","ADDITIONAL source CC0, image content not independently inspected in this pass"),
 ("Elymus macgregorii",379861752,694889625,"Harry Podschwit","Dry seedhead (prior Group B actual preview)"),
]
def read(url,limit=16*1024*1024):
    err=None
    for i in range(3):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*"})
            with urllib.request.urlopen(req,timeout=28) as res:
                if res.status!=200:raise RuntimeError(f"HTTP {res.status}")
                b=res.read(limit+1)
                if len(b)>limit:raise RuntimeError("exceeds 16MiB bound")
                return b
        except Exception as e:
            err=e
            if i<2:time.sleep(2*(i+1))
    raise RuntimeError(str(err))
def api(url):return json.loads(read(url,5*1024*1024))
def observation(obsid):
    o=api("https://api.inaturalist.org/v1/observations/"+str(obsid)).get("results") or []
    if len(o)!=1:raise RuntimeError("Source observation absent")
    return o[0]
def gbif_record(obsid,pid):
    occurrence_id=f"https://www.inaturalist.org/observations/{obsid}"
    lookup="https://api.gbif.org/v1/occurrence/search?"+urllib.parse.urlencode({"occurrenceId":occurrence_id,"limit":20})
    raw=api(lookup)
    records=[x for x in raw.get("results",[]) if x.get("occurrenceID")==occurrence_id]
    matches=[]
    for rec in records:
        for m in rec.get("media",[]):
            if f"/photos/{pid}/" in (m.get("identifier") or ""):matches.append((rec,m))
    if len(matches)!=1:raise RuntimeError(f"GBIF exact photo media occurrence match {len(matches)} (expected 1)")
    return matches[0]
def original_photo_url(p):
    link=p.get("url") or ""
    for s in ("square","thumb","small","medium","large"):link=link.replace("/"+s+".","/original.")
    if "/original." not in link:raise RuntimeError("Original media URL not recognizable")
    return link
def main():
    cands=json.loads(Path("site/visual-key-lab/hays-candidates.json").read_text())["candidates"]
    existing=[p for c in cands for p in (c.get("approved_gallery") or [])]
    selected=[]
    for name,oid,pid,expected,role in TARGETS:
        rec={"species":name,"observation_id":oid,"photo_id":pid,"expected_creator":expected,"preview_role":role}
        try:
            o=observation(oid); species=(o.get("taxon") or {}).get("name")
            if species!=name:raise ValueError(f"Source label wrong {species!r}")
            if o.get("quality_grade")!="research":raise ValueError("Source not research grade")
            p=next((p for p in o.get("photos",[]) if p.get("id")==pid),None)
            if p is None:raise ValueError("photo ID not in given source observation")
            code=(p.get("license_code") or "").lower()
            if code not in ("cc0","cc-by","cc-by-sa"):raise ValueError("Unsupported photo-specific rights "+code)
            user=p.get("user") or o.get("user") or {}
            candidate_names=[str(user.get("name") or ""),str(user.get("login") or ""),str(p.get("attribution") or "")]
            if expected.lower() not in " | ".join(candidate_names).lower():raise ValueError("Photo creator mismatch "+str(candidate_names))
            if code=="cc0":
                license="CC0 1.0";license_url="https://creativecommons.org/publicdomain/zero/1.0/"
                gbif_evidence="Not required for photo-specific CC0 from original iNat API"
                media_url=original_photo_url(p)
            else:
                item,media=gbif_record(oid,pid)
                found=(media.get("license") or "").replace("http:","https:").rstrip("/")
                prefix="https://creativecommons.org/licenses/"
                valid={"https://creativecommons.org/licenses/by/4.0":"CC BY 4.0","https://creativecommons.org/licenses/by-sa/4.0":"CC BY-SA 4.0",
                  "https://creativecommons.org/licenses/by/3.0":"CC BY 3.0","https://creativecommons.org/licenses/by-sa/3.0":"CC BY-SA 3.0"}
                if found not in valid:raise ValueError("Unsupported/unverified exact GBIF media version: "+found)
                if code=="cc-by" and "/by/" not in found:raise ValueError("GBIF license not matching iNat photo CC BY")
                if code=="cc-by-sa" and "/by-sa/" not in found:raise ValueError("GBIF license not matching iNat photo CC BY-SA")
                credited=(media.get("creator") or "")+" "+(media.get("rightsHolder") or "")
                if expected.lower() not in credited.lower():raise ValueError("GBIF creator mismatch "+credited)
                license=valid[found];license_url=found+"/"
                gbif_evidence="https://www.gbif.org/occurrence/"+str(item.get("key"))
                media_url=media["identifier"]
            blob=read(media_url);image=Image.open(io.BytesIO(blob));image.verify()
            image=Image.open(io.BytesIO(blob))
            w,h=image.size
            if min(w,h)<650:raise ValueError("Photo too small")
            sha=hashlib.sha256(blob).hexdigest()
            existing_hits=[]
            for x in existing:
                text=" ".join(str(x.get(k) or "") for k in ("source_page","original_source_page","image_filename","src","original_media_url"))
                if str(pid) in text: existing_hits.append("source/photo ID")
                if x.get("original_sha256")==sha: existing_hits.append("original sha")
            if existing_hits:raise ValueError("Previously configured source/photo "+str(existing_hits))
            rec.update(photographer=expected,photo_license=license,photo_license_url=license_url,
                photo_page=f"https://www.inaturalist.org/photos/{pid}",observation_page=f"https://www.inaturalist.org/observations/{oid}",
                gbif_media_rights_source=gbif_evidence,original_media_url=media_url,
                full_original_sha256=sha,original_bytes=len(blob),width=w,height=h,
                research_grade_source=True,original_decode=True,source_manifest_photo_id_collision=False,
                status="PHOTO_SOURCE_AND_ORIGINAL_CHECK_PASS_FINAL_BOTANICAL_ROLE_AND_ARCHIVE_DUP_OWED")
            selected.append(rec)
            print("GROUP_B_FINAL_ORIGINAL_PASS "+json.dumps(rec,sort_keys=True),flush=True)
        except Exception as err:
            rec["error"]=str(err)
            print("GROUP_B_FINAL_SOURCE_HOLD "+json.dumps(rec,sort_keys=True),flush=True)
        time.sleep(.4)
    hashes=[r["full_original_sha256"] for r in selected]
    if len(hashes)!=len(set(hashes)):raise RuntimeError("Hash duplication within candidate batch")
    print("GROUP_B_FINAL_SUMMARY "+json.dumps({"passed":len(selected),"candidate_total":len(TARGETS),
        "holds":len(TARGETS)-len(selected),"distinct_hashes":len(set(hashes)),
        "current_gallery_refs_compared":len(existing),"new_photos_installed":0,
        "archive_wide_sha_comparison":"NOT_DONE","species_id":"SOURCE_RESEARCH_LABEL_NOT_VOUCHER_CERTIFICATION"},sort_keys=True),flush=True)
    if len(selected)<2: raise RuntimeError("Too few verified source candidates")
if __name__=="__main__":main()
