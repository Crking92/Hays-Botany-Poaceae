#!/usr/bin/env python3
"""Install the THREE explicitly authorized Bob Harms DigFlora KR anatomy images.
Permission: UT PRC curator George Yatskievych, email to Calvin King 2026-11-02.
Not CC; not a blanket license to other Harms/UT collections.
Run only after checkout of the current Poaceae main; safe to re-run.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image
import hashlib, io, json, time

ROOT=Path("content/taxa/Poaceae/Bothriochloa/bothriochloa-ischaemum")
SITE=Path("site/data/species/bothriochloa-ischaemum.json")
GALLERY=Path("site/data/gallery-index.json")
RIGHTS=Path("migration/ut-prc-bob-harms-kr-permission-20261102.json")
ORIGINAL="https://w3.biosci.utexas.edu/prc/DigFlora/KR/"
SOURCE=ORIGINAL+"BOISS-morph.html"
CREDIT="Robert Harms, Plant Resources Center, University of Texas at Austin"
LICENSE="Direct written permission from UT Plant Resources Center (2026-11-02); copyrighted; NOT Creative Commons"
GRANT="For the Hays Botany public educational project: store GitHub copies, display, reproduce, annotate, resize and crop the three requested images. Credit Robert Harms at UT Plant Resources Center. No third-party CC license granted."
PHOTOS=[
  ("true_ligule","BOISS-LX-21Jul-A.JPG","ut-harms-kr-true-ligule.jpg","North Hays KR — true ligule and leaf junction","Actual Harms DigFlora North Hays var. songarica leaf junction with a photographed scale strip. The short membranous/ciliate ligule region is visible; review carefully before adding any precise arrows. Original UT JPEG, not cropped or modified."),
  ("papilla_hairs","BOISS-papbashairs.JPG","ut-harms-kr-papilla-based-leaf-hairs.jpg","North Hays KR — papilla-based hairs above the collar","Bob Harms North Hays blade/sheath junction and long papilla-based hairs on the upper blade, with photographic scale. Useful for locating the hairs; exact bases and measurements must be checked before adding arrows. Original UT JPEG."),
  ("spikelet_pairs","BOISS-2spksegs-23Jul-A.JPG","ut-harms-kr-paired-spikelets-rachis.jpg","North Hays KR — paired spikelets and axis sections","Bob Harms North Hays close-up of two mature spikelet-pair/rachis units, showing the awned fertile spikelet and pedicellate companion in each unit. A real photographed scale appears at right. Preserve botanical caution when labeling individual parts. Original UT JPEG."),
]
def read(path): return json.loads(path.read_text())
def save(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
def download(url):
    for base in ("https://w3.biosci.utexas.edu","https://www.biosci.utexas.edu"):
        link=url.replace("https://w3.biosci.utexas.edu",base)
        for attempt in range(2):
            try:
                req=Request(link,headers={"User-Agent":"HaysBotanyEducationalArchive/1.0","Accept":"image/jpeg,*/*"})
                with urlopen(req,timeout=35) as resp: data=resp.read()
                if not data.startswith(b"\xff\xd8") or len(data)<7000: raise ValueError("Not a credible original JPEG")
                with Image.open(io.BytesIO(data)) as im:
                    im.verify()
                return data
            except Exception as exc:
                print("RETRY_SOURCE",link,str(exc)[:200],flush=True)
                time.sleep(3)
    raise RuntimeError("UT source photo unavailable: "+url)
def main():
    card=read(SITE)
    src_card=read(ROOT/"species.json")
    index=read(GALLERY)
    records=src_card.setdefault("images",[])
    panels=card.setdefault("panels",[])
    prev=len(panels)
    ent=index["entries"]["bothriochloa-ischaemum"]
    if ent["count"]!=prev: raise RuntimeError("Gallery count has changed independently; do not overwrite")
    added=0
    metadata=[]
    for role,original_name,filename,label,caption in PHOTOS:
        url=ORIGINAL+"0-BOISS4Web/"+original_name
        dest=ROOT/"images"/filename
        if dest.exists():
            raw=dest.read_bytes()
            if not raw.startswith(b"\xff\xd8"): raise RuntimeError("Existing file is not a JPEG: "+str(dest))
        else:
            raw=download(url)
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_bytes(raw)
        with Image.open(io.BytesIO(raw)) as img:
            img.verify()
        sh=hashlib.sha256(raw).hexdigest()
        src="../"+dest.as_posix()
        common={"creator":CREDIT,"license":LICENSE,"source_page":url}
        if not any(x.get("file")==f"images/{filename}" for x in records):
            records.append({
                "file":f"images/{filename}","role":label,**common,
                "source_collection":SOURCE,"source_type":"UT Austin Plant Resources Center DigFlora — Bob Harms North Hays",
                "study_use":"yes","public_reuse":"YES for this educational Hays Botany website / GitHub archive by explicit UT PRC curator permission dated 2026-11-02; not Creative Commons and not a general redistribution grant",
                "permission_evidence":"Email from George A. Yatskievych to Calvin King on November 2, 2026, following consultation with Tom Wendt",
                "original_sha256":sh,"original_bytes":len(raw),"image_original_unchanged":True
            })
        if not any(p.get("src")==src for p in panels):
            panels.append({
                "label":label,"src":src,"caption":caption,
                **common,"license_url":None,"modifications":"Unmodified original low-resolution UT web JPEG; no crop, resize or arrows",
                "annotation_note":"Direct UT PRC educational-project permission 2026-11-02; attribution required; no Creative Commons license; no arrows yet",
                "markers":[],"original_panel_index":None,
                "publication_status":"DIRECT_UT_PRC_PROJECT_PERMISSION_20261102",
                "source_species_id":"bothriochloa-ischaemum","photo_role":"TARGET_SPECIES_SOURCE",
            })
            added+=1
        metadata.append({"role":role,"source_file":url,"installed_file":str(dest),"site_src":src,"sha256":sh,"bytes":len(raw)})
    if added:
        ent["count"]+=added
        ent["target_species_source_panels"]+=added
        index["photo_panels"]+=added
        index["photo_files"]+=added
    assert ent["count"]==len(panels)
    assert len(metadata)==3 and all(Path(m["installed_file"]).is_file() for m in metadata)
    perm=src_card.setdefault("curation_status",{})
    perm["kr_harms_digflora_permission_20261102"]={
        "stage":"THREE_NORTH_HAYS_DIAGNOSTIC_PHOTOS_RIGHTS_CLEARED_AND_INSTALLED",
        "permission_date":"2026-11-02","rights_grantor":"George A. Yatskievych, Curator, UT Plant Resources Center",
        "photographer":"Robert (Bob) Harms","source_collection":SOURCE,
        "scope":"three specifically requested DigFlora KR bluestem photographs, public GitHub copies, educational website, reproduction and annotations",
        "creativecommons":False,"instructional_arrows_reviewed":False,
        "original_image_bytes_retained":True,"image_count":3
    }
    # Historical rights holds remain as history; the later dated status above supersedes them.
    src_card.setdefault("morphology_keys",{}).setdefault("advanced_confirmation",{})["Spikelet pairs"] = (
        "The newly authorized Bob Harms North Hays image shows mature spikelet pair and attached axis sections; confirm parts on intact same-plant specimens before labeling individual florets."
    )
    for step in card.get("steps",[]):
        if "Inspect hairs just above the leaf collar" in step.get("title",""):
            matching=next(i for i,p in enumerate(panels) if p.get("label","").startswith("North Hays KR — papilla-based"))
            step["panel_index"]=matching
            step["photo_unavailable"]=False
            step["look_for"]="Bob Harms's actual North Hays KR bluestem photograph shows stiff papilla-based hairs on the blade immediately above the collar, with a photographed scale. The next two North Hays gallery photographs show the true ligule junction and a pair of spikelet segments."
            step["why_it_matters"]="These hard-to-find local diagnostic structures now have individually authorized educational photographs. Precise arrows and micrometric interpretations still require separate anatomy QA."
    card["photo_data_caution"]=(card.get("photo_data_caution") or "") + " Three Bob Harms North Hays KR anatomy photographs have direct UT PRC site-specific permission dated 2026-11-02; copyrighted/not CC; arrows pending careful visual review."
    save(SITE,card);save(ROOT/"species.json",src_card);save(GALLERY,index)
    save(RIGHTS,{
      "scope":"EXACT THREE REQUESTED PHOTOS ONLY","grant_date":"2026-11-02",
      "permission_source":"Email from George A. Yatskievych, Curator, UT Austin Plant Resources Center, to Calvin King; after consulting former curator Tom Wendt",
      "confirmation":"The UT Plant Resources Center controls the late Bob Harms web pages; curator explicitly authorized reproducing the requested materials, keeping pertinent page/document copies on the user's public GitHub site, and annotating images and text as needed.",
      "required_credit":CREDIT,"license_status":"DIRECT WRITTEN PROJECT PERMISSION; NOT CC; NOT blanket authority for other UT photos; does NOT license third-party reuse",
      "no_original_higher_resolution_available":True,"source_collection":SOURCE,
      "source_email_custodian":"Calvin King; keep original email with its sender/date as evidence",
      "images":metadata,"new_panels":added,"panel_count":len(panels),
      "status":"COMMITTED_TO_SOURCE_AND_SITE_REFERENCE; LIVE_PAGES_DELIVERY_REQUIRES_SEPARATE_VERIFY"
    })
    print("UT_PRC_APPROVED_KR_INSTALL",json.dumps({"new_panels":added,"panel_count":len(panels),"files":len(metadata),"gallery_panels":index["photo_panels"],"gallery_files":index["photo_files"]}),flush=True)
if __name__=="__main__":main()
