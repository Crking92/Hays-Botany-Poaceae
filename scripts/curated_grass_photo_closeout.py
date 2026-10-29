"""Narrow October 29 existing-photo restoration without harvesting media.

The 22 source images already exist on Poaceae main. The selected Bob Harms
photos are educational-use-with-credit, NOT CC-licensed. This is a closed
source-photo list, not a global exception for copyrighted archive material.
"""
from pathlib import Path
import csv,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/"migration/curated-existing-grass-photo-closeout-20261029.json").read_text())
assert m["schema_version"]==1 and len(m["entries"])==25
CURATED_BY_SRC={x["src"]:x for x in m["entries"]}
assert len(CURATED_BY_SRC)==25

def make_panel(spec):
    src=spec["src"]
    found=re.fullmatch(r"content/taxa/Poaceae/([^/]+)/([^/]+)/images/([^/]+)",src)
    if not found or found.group(2)!=spec["species_id"] or not (ROOT/src).is_file():
        return None
    parent=ROOT/"content/taxa/Poaceae"/found.group(1)/found.group(2)
    card=json.loads((parent/"species.json").read_text())
    panels=(card.get("visual_comparison") or {}).get("items") or []
    idx=spec["panel_index"]
    if not isinstance(idx,int) or idx<0 or idx>=len(panels):return None
    panel=panels[idx]
    if panel.get("image_url")!=src:return None
    p=next((x for x in card.get("images",[]) if x.get("file")=="images/"+found.group(3)),None)
    if not p or any(p.get(k)!=spec[k] for k in ("creator","license","source_page")):
        return None
    category=spec["permission_kind"]
    if category=="BOB_HARMS_AUTHOR_EDUCATIONAL_WITH_CREDIT":
        if not (p.get("creator")=="Bob Harms"
            and ("NOT Creative Commons" in str(p.get("license") or "") or "NOT CC" in str(p.get("license") or ""))
            and "educational" in str(p.get("public_reuse") or "").lower()
            and any(term in str(p.get("public_reuse") or "").lower() for term in ("credit","attribution"))
            and str(p.get("source_page") or "").startswith(
                "https://w3.biosci.utexas.edu/prc/Monocots/GrassHTML/data/pages/")):
            return None
        lic="© Bob Harms — scientific/educational use with credit (not CC)"
        lurl="https://w3.biosci.utexas.edu/prc/Monocots/"
        note="© Bob Harms. Credited scientific/educational use only under the author's terms; NOT Creative Commons and not general redistribution permission."
    elif category=="USGS_LARRY_ALLAIN_ORIGINAL_PUBLIC_DOMAIN":
        if not (p.get("creator")=="Larry Allain / U.S. Geological Survey"
            and p.get("license")=="US Public Domain (USGS employee-authored)"
            and p.get("source_page")=="https://warcapps.usgs.gov/PlantID/Species/Details/3292"):
            return None
        sha=subprocess.check_output(["git","hash-object",str(ROOT/src)],text=True).strip()
        if sha!=spec["pinned_original_blob_sha"]:return None
        lic="Public domain — Larry Allain / USGS"
        lurl="https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits"
        note="Original Larry Allain / U.S. Geological Survey employee photograph (U.S. public domain); exact bytes verified against pinned original Git blob. Credit USGS/Larry Allain."
    elif category=="USDA_FEIS_CC_BY_SA_4_0":
        if not (p["creator"]=="Cecelia Alexander" and p["license"]=="CC BY-SA 4.0"
            and p["source_page"]=="https://research.fs.usda.gov/feis/species-reviews/eraint"):
            return None
        lic="CC BY-SA 4.0";lurl="https://creativecommons.org/licenses/by-sa/4.0/"
        note="Original USDA Forest Service FEIS page credits Cecelia Alexander (CC BY-SA 4.0); retain attribution and ShareAlike terms."
    elif category in ("ARCHIVED_CC0_PER_PHOTO","ARCHIVED_PHOTO_CC_BY_VERSION_UNKNOWN"):
        expected="CC0" if category=="ARCHIVED_CC0_PER_PHOTO" else "CC BY"
        if p["license"]!=expected or not str(p["source_page"]).startswith((
            "https://www.gbif.org/occurrence/","https://www.inaturalist.org/photos/")):
            return None
        with (parent/"image-sources.csv").open(encoding="utf-8",newline="") as f:
            rows=list(csv.DictReader(f))
        row=next((x for x in rows if x.get("file_name")==found.group(3)),None)
        if row:
            if any(row.get(k)!=spec[k] for k in ("creator","license","source_page")):
                return None
            url=str(row.get("direct_url") or "")
            if not re.fullmatch(
                r"https://inaturalist-open-data\.s3\.amazonaws\.com/photos/[0-9]+/(?:large|original)\.(?:jpe?g|png)",url):
                return None
        elif not (spec["species_id"]=="eriochloa-sericea"
                and str(p.get("source_page") or "").startswith("https://www.gbif.org/occurrence/")
                and "subject to recorded CC source license and creator credit" in str(p.get("public_reuse") or "")):
            # Eriochloa's 2026 CC0/CC BY review images were entered directly in
            # canonical image metadata rather than the old per-photo CSV.
            return None
        if expected=="CC0":
            if spec.get("license_url")!="https://creativecommons.org/publicdomain/zero/1.0/":
                return None
            lic="CC0 1.0";lurl="https://creativecommons.org/publicdomain/zero/1.0/"
            note="Exact archived photographer/photo CC0 attribution; latest upstream image metadata not independently rechecked."
        else:
            lic="CC BY (version not recorded)";lurl=None
            note="Individual archived photo recorded as CC BY; precise version not documented. Original source photo remains linked. Species determination can be provisional."
    else:
        return None
    panel=dict(panel)
    panel.update(src=src,original_panel_index=idx,creator=p["creator"],license=lic,
       license_url=lurl,source_page=p["source_page"],photo_license_note=note,
       photo_review_status="CURATED_ARCHIVED_EXISTING_PHOTO_20261029",
       modifications=p.get("modifications") or panel.get("modifications"))
    return panel
