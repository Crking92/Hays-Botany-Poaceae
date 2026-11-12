#!/usr/bin/env python3
"""Read-only original-file/rights/duplicate gate for six Group D photo candidates.

Does NOT certify botanical specimen identification or write publisher manifests.
Reports both source metadata and hashes of independently downloaded original bytes.
"""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
API = "https://commons.wikimedia.org/w/api.php"
FILES = [
    ("stenotaphrum-secundatum", "Stenotaphrum secundatum spikelet2 (7112588215).jpg", "Harry Rose", "by/2.0"),
    ("stenotaphrum-secundatum", "Stenotaphrum secundatum stolon1 (7417603262).jpg", "Harry Rose", "by/2.0"),
    ("dactyloctenium-aegyptium", "Starr 080602-5396 Dactyloctenium aegyptium.jpg", "Forest", "by/3.0"),
    ("polypogon-viridis", "Polypogon viridis leaf (02).jpeg", "Daniel Cahen", "by/4.0"),
    ("polypogon-viridis", "Polypogon viridis flower (14).jpeg", "Daniel Cahen", "by/4.0"),
    ("bromus-tectorum", "Bromus tectorum sl15.jpg", "Stefan.lefnaer", "by-sa/4.0"),
]

def value(meta, key):
    return str(meta.get(key, {}).get("value", ""))

def no_html(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).strip()

def get(session, url, *, params=None):
    for attempt in range(4):
        try:
            r = session.get(url, params=params, timeout=38)
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(2 * (attempt + 1))
                continue
            r.raise_for_status()
            return r
        except requests.RequestException:
            if attempt == 3:
                raise
            time.sleep(attempt + 1)
    raise RuntimeError("HTTP retries exhausted: " + url)

def main():
    session=requests.Session()
    session.headers.update({"User-Agent": "HaysBotanyOriginalSourceAudit/1.0 (educational photo-provenance validation)"})
    manifest=json.loads((ROOT/"site/visual-key-lab/hays-candidates.json").read_text())
    candidates=manifest["candidates"]
    existing=[p for c in candidates for p in c.get("approved_gallery", [])]
    before_count=len(existing)
    titles=["File:"+name for _,name,_,_ in FILES]
    rows=[]
    failed=False
    try:
        payload=get(session, API,params={
            "action":"query","format":"json","prop":"imageinfo",
            "iiprop":"url|size|sha1|extmetadata", "titles":"|".join(titles),
        }).json()
        pages=list(payload.get("query",{}).get("pages",{}).values())
        info_by_name={p["title"].replace("_"," ").removeprefix("File:"):p for p in pages if p.get("imageinfo")}
    except Exception as exc:
        print("ORIGINAL_SOURCE_API_BLOCKED",str(exc),flush=True)
        payload={}
        info_by_name={}
    for taxon,name,expected_creator,expected_license in FILES:
        row={"species_id":taxon,"filename":name,
             "source_page":"https://commons.wikimedia.org/wiki/File:"+quote(name.replace(" ","_"),safe="()"),
             "expected_creator":expected_creator,"expected_cc_path":expected_license,
             "source_only_not_hays_voucher":True}
        problems=[]
        prior=[p for p in existing if p.get("image_filename","").casefold()==name.casefold()
            or p.get("source_page","").replace("%20","_").replace(" ","_").endswith(name.replace(" ","_"))]
        if prior: problems.append("PRESENT_IN_APPROVED_GALLERY")
        p=info_by_name.get(name)
        if not p:
            problems.append("COMMONS_SOURCE_METADATA_UNAVAILABLE")
        else:
            ii=p["imageinfo"][0];meta=ii.get("extmetadata") or {}
            artist=no_html(value(meta,"Artist"))
            license_url=html.unescape(value(meta,"LicenseUrl"))
            short=no_html(value(meta,"LicenseShortName"))
            row.update({"commons_creator":artist[:280],"commons_license":short,
                "commons_license_url":license_url,"commons_sha1_reported":ii.get("sha1"),
                "commons_original_bytes":ii.get("size"),"original_url":ii.get("url")})
            if expected_creator.casefold() not in artist.casefold():
                problems.append("CREATOR_MISMATCH_OR_ABSENT")
            if expected_license not in license_url.lower() or "/licenses/" not in license_url.lower():
                problems.append("LICENSE_VERSION_OR_URL_MISMATCH")
            if any(s in license_url.lower() for s in ("/by-nc/","/by-nd/","/by-nc-sa/")):
                problems.append("RESTRICTED_LICENSE")
            try:
                b=get(session,ii["url"]).content
                row["computed_original_sha1"]=hashlib.sha1(b).hexdigest()
                row["computed_original_sha256"]=hashlib.sha256(b).hexdigest()
                row["downloaded_original_bytes"]=len(b)
                with Image.open(io.BytesIO(b)) as im:
                    im.verify()
                with Image.open(io.BytesIO(b)) as im:
                    w,h=im.size
                row["decoded_original_px"]=[w,h]
                if len(b)!=ii.get("size"):problems.append("ORIGINAL_BYTE_COUNT_MISMATCH")
                if not (w>=600 and h>=600):problems.append("SOURCE_IMAGE_TOO_SMALL")
                sha1=ii.get("sha1","")
                if re.fullmatch(r"[0-9a-f]{40}",sha1) and sha1!=row["computed_original_sha1"]:
                    problems.append("COMMONS_SHA1_AND_DOWNLOADED_BYTES_MISMATCH")
            except Exception as exc:
                problems.append("ORIGINAL_BYTES_DOWNLOAD_DECODE_FAILED")
                row["download_error"]=str(exc)[:280]
        row["holds"]=problems
        row["result"]="SOURCE_ORIGINAL_OK_FINAL_ID_AND_ARCHIVE_CHECK_PENDING" if not problems else "HOLD"
        if problems:failed=True
        rows.append(row)
        print("GROUP_D_ORIGINAL",json.dumps({"filename":name,"status":row["result"],
                   "holds":problems,"sha256":row.get("computed_original_sha256"),
                   "dimensions":row.get("decoded_original_px")}),flush=True)
    sha=[row.get("computed_original_sha256") for row in rows if row.get("computed_original_sha256")]
    if len(set(sha))!=len(sha):
        failed=True
        print("GROUP_D_ORIGINAL_DUPLICATE_SHA256_IN_BATCH",flush=True)
    report={"original_grass_gallery_ref_count":before_count,
        "candidate_files":len(FILES),"full_originals_verified":sum(x["result"].startswith("SOURCE_ORIGINAL_OK") for x in rows),
        "distinct_downloaded_sha256":len(set(sha)),
        "holds":sum(x["result"]=="HOLD" for x in rows),
        "human_species_id_needed":True,"historical_archive_sha_match_not_claimed":True,
        "scope":"READ_ONLY; no photo installed, no rights claims based solely on metadata",
        "rows":rows}
    out=ROOT/"qa-report/group-d-six-original-file-gate.json"
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print("GROUP_D_SIX_ORIGINAL_SUMMARY",json.dumps({k:v for k,v in report.items() if k!="rows"}),flush=True)
    return 1 if failed else 0

if __name__=="__main__":
    sys.exit(main())
