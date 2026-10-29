#!/usr/bin/env python3
"""Release a SOURCE-ONLY strict-licensed grass learner using existing main-branch photos.
Consumes already built dist-safe rights-first preview. Never copies image bytes or changes
underlying source taxon cards. Filters additional non-exact provenance conservatively.
"""
import json,re,shutil,sys
from collections import defaultdict,Counter
from pathlib import Path
from curated_grass_photo_closeout import CURATED_BY_SRC,make_panel
ROOT=Path(__file__).resolve().parents[1]
PREVIEW=ROOT/"dist-safe"
SITE=ROOT/"site"
assert (PREVIEW/"data/poaceae-index.json").is_file()
assert (SITE/"index.html").is_file()
manifest=json.loads((PREVIEW/"data/poaceae-index.json").read_text())
assert len(manifest)==112
candidate_files={p.relative_to(PREVIEW).as_posix() for p in PREVIEW.rglob("*")
                 if p.is_file() and p.suffix.lower() in (".jpg",".jpeg",".png",".webp")}
assert candidate_files
# Audit scope for restoring existing on-disk exact-species photographs only.
# These are not blanket source-domain or CC version assumptions.
RESTORATION_TAXA={
    "bouteloua-curtipendula","bouteloua-pectinata","bromus-pubescens",
    "bromus-texensis","sorghum-halepense","sporobolus-compositus",
    "urochloa-reptans","zizania-texana",
    "dichanthelium-lindheimeri","dichanthelium-pedicellatum","festuca-versuta"
}
# A closed, exact-photo list checked against still-matching source-card image records.
# A CC BY class is not evidence that the license version is 4.0.
reviewed=json.loads((ROOT/"migration/reviewed-photo-level-ccby-20261029.json").read_text())
assert reviewed["schema_version"]==1 and len(reviewed["entries"])==18
REVIEW_BY_SRC={e["path"]:e for e in reviewed["entries"]}
assert len(REVIEW_BY_SRC)==18

def exact_reviewed_ccby(panel):
    src=str(panel.get("src") or "")
    rec=REVIEW_BY_SRC.get(src)
    if not rec:return False
    match=re.fullmatch(r"content/taxa/Poaceae/([^/]+)/([^/]+)/images/([^/]+)",src)
    if not match or match.group(2)!=rec["species_id"]:return False
    source=panel.get("source_page")
    if source!=rec["source_page"] or panel.get("creator")!=rec["creator"]:return False
    if not re.fullmatch(r"https://www.inaturalist.org/photos/[0-9]+",str(source)):return False
    card=ROOT/"content/taxa/Poaceae"/match.group(1)/match.group(2)/"species.json"
    original=json.loads(card.read_text())
    candidate=next((im for im in original.get("images",[])
                    if im.get("file")=="images/"+match.group(3)),None)
    if not candidate:return False
    if (candidate.get("creator")!=rec["creator"] or
        candidate.get("source_page")!=source or
        candidate.get("license")!="CC BY"):return False
    pid=str(rec["photo_id"])
    if str(candidate.get("photo_id") or candidate.get("source_photo_id"))!=pid:
        return False
    if source!="https://www.inaturalist.org/photos/"+pid:return False
    if rec["recorded_license"]!="CC BY" or rec["license_version"]!="NOT_RECORDED":
        return False
    if rec["evidence_type"]=="IMAGE_LEVEL_CC_BY_CODE_ARCHIVED":
        return (str(candidate.get("license_code") or "").lower()=="cc-by" and
                bool(re.search(r"exact individual photo CC BY|current exact iNaturalist observation photo license_code cc-by",
                               str(candidate.get("photo_status") or "")+" "+str(candidate.get("source_rights_verified") or ""),re.I)))
    if rec["evidence_type"]=="IMAGE_LEVEL_CC_BY_PIXEL_REVIEW_ARCHIVED":
        return (bool(re.search(r"Source rights and byte archive plus saved pixels verified 2026-10-27",
                               str(candidate.get("photo_status") or ""))) and
                "original individual source image" in str(candidate.get("public_reuse") or "") and
                rec["species_id"]=="dichanthelium-pedicellatum")
    return False
def normalize_commons(source):
    # The repo used both /wiki/File: and URL-escaped /wiki/File%3A links.
    return re.sub(r"/wiki/File%3[Aa]", "/wiki/File:", source)
def is_eligible(p):
    name=str(p.get("license") or "").strip()
    source=str(p.get("source_page") or "")
    creator=str(p.get("creator") or "")
    src=str(p.get("src") or "")
    match=re.search(r"content/taxa/Poaceae/[^/]+/([^/]+)/images/",src)
    sid=match.group(1) if match else ""
    normalized=normalize_commons(source)
    commons=normalized.startswith("https://commons.wikimedia.org/wiki/File:")
    inat=source.startswith("https://www.inaturalist.org/photos/")
    if not creator or not source.startswith("https://"):return False
    if re.search(r"NC|ND|not verified|review|all rights reserved|permission",name,re.I):return False
    if re.fullmatch(r"CC0(?:\s*1\.0)?",name,re.I):
        return commons or inat
    if re.fullmatch(r"CC BY(-SA)?\s*(2\.0|2\.5|3\.0|4\.0)(?:\s+US)?",name,re.I):
        return commons or inat
    if re.search(r"public domain",name,re.I) and creator.strip().lower()=="jim conrad":
        return "backyardnature.net" in source
    if sid not in RESTORATION_TAXA:return False
    if name.upper().replace("-"," ")=="CC BY" and inat and exact_reviewed_ccby(p):
        return True
    license_url=str(p.get("license_url") or "")
    # Original photo-level metadata documents CC BY 4.0 for the individual
    # iNaturalist photographs, not merely for their observation records.
    if name.upper()=="CC BY" and inat and re.fullmatch(
        r"https://creativecommons\.org/licenses/by/4\.0/?",license_url,re.I
    ):
        return True
    if name.upper()=="CC BY-SA" and commons and re.fullmatch(
        r"https://creativecommons\.org/licenses/by-sa/(2\.0|4\.0)/?",license_url,re.I
    ):
        return True
    # Jim Conrad expressly releases his self-authored Backyard Nature photos;
    # his dedication is public domain, not necessarily CC0 as source shorthand.
    if sid=="bouteloua-pectinata" and creator=="Jim Conrad" and (
        name=="CC0 1.0 — author-page linked public-domain dedication"
    ) and source=="https://www.backyardnature.net/n/h/tallgram.htm":
        return True
    # Ryan Hagerty's already-archived official USFWS employee photos are PD-USGov.
    if sid=="zizania-texana" and "Ryan Hagerty" in creator and (
        "U.S. Fish and Wildlife Service" in creator
    ) and re.search(r"public domain",name,re.I) and (
        commons and "Zizania_texana_" in normalized or
        source.startswith("https://www.fws.gov/media/texas-wild-rice")
    ):
        return True
    return False
def source_species_id(src):
    """Read the on-disk source-folder owner; not a botanical voucher claim."""
    m=re.search(r"(?:^|/)content/taxa/Poaceae/[^/]+/([^/]+)/images/",str(src))
    return m.group(1) if m else None

# A single original file may be used in many panels. A conflicting credit record
# holds the entire file rather than allowing selective publication.
references=defaultdict(list)
cards=[]
for path in sorted((PREVIEW/"data/species").glob("*.json")):
    d=json.loads(path.read_text())
    cards.append((path,d))
    for p in d.get("panels",[]):
        references[p["src"]].append(p)
assert len(cards)==112
keep={name for name,refs in references.items() if all(is_eligible(p) for p in refs)}
assert keep and keep.issubset(candidate_files)
assert set(REVIEW_BY_SRC).issubset(keep),("Some reviewed exact photos are not included",sorted(set(REVIEW_BY_SRC)-keep))
stats=Counter(); photosBySpecies={}; source_credits={}
for _,d in cards:
    sid=d["id"]
    original=d.get("panels",[])
    selected=[p for p in original if p["src"] in keep]
    rejected=[p for p in original if p["src"] not in keep]
    newly_restored=set()
    for src,spec in CURATED_BY_SRC.items():
        if spec["species_id"]!=sid or any(p["src"]==src for p in selected):continue
        photo=make_panel(spec)
        assert photo is not None,("Curated photo rights/source mismatch",src)
        selected.append(photo)
        newly_restored.add(spec["panel_index"])
    if newly_restored:
        d["unavailable_references"]=[
          u for u in d.get("unavailable_references",[])
          if u.get("original_panel_index") not in newly_restored
        ]
    # Actual target-species source-folder images lead; comparison panels remain
    # after them, in their original order. Step/tile links are rebuilt below.
    selected.sort(key=lambda p: source_species_id(p["src"])!=sid)
    mapping={p.get("original_panel_index"):i for i,p in enumerate(selected)
             if isinstance(p.get("original_panel_index"),int)}
    for step in d.get("steps",[]):
        original_idx=step.get("original_panel_index")
        step["panel_index"]=mapping.get(original_idx)
        step["photo_unavailable"]=step["panel_index"] is None
    for tile in d.get("tiles",[]):
        indices=tile.get("original_panel_indices") or []
        tile["preview_panel_indices"]=[mapping[i] for i in indices if i in mapping]
        tile["missing_original_panel_indices"]=[i for i in indices if i not in mapping]
    for p in rejected:
        if p.get("original_panel_index") in newly_restored:continue
        d.setdefault("unavailable_references",[]).append({
          "original_panel_index":p.get("original_panel_index"),
          "label":p.get("label"),
          "reason":"Source-specific CC/public domain provenance not independently strong enough for automatic public site release",
          "reference_page":p.get("source_page") or "",
          "license_status":"SOURCE_REFERENCE_HELD"
        })
    for p in selected:
        src=p["src"]
        if src in REVIEW_BY_SRC:
            assert exact_reviewed_ccby(p),("photo review record no longer matches",src)
            p["license"]="CC BY"
            # A versionless generic Creative Commons link cannot establish 4.0.
            # The exact individual photo URL is the reliable license pointer.
            p["license_url"]=None
            p["photo_license_note"]="Individual photo recorded CC BY in the archived source review; exact license version not recorded. Check original photo for its applicable terms."
            p["photo_review_status"]="EXACT_PHOTO_RECORD_ARCHIVED_20261026_27"
        if sid=="bouteloua-pectinata" and p.get("creator")=="Jim Conrad":
            p["license"]="Public domain (Jim Conrad's express dedication)"
            p["license_url"]="https://www.backyardnature.net/j/copyrite.htm"
        if sid=="zizania-texana" and "Ryan Hagerty" in str(p.get("creator")):
            p["license_url"]=p.get("license_url") or "https://commons.wikimedia.org/wiki/Template:PD-USGov-FWS"
        if str(p.get("license") or "").upper()=="CC BY" and re.search(
            r"/licenses/by/4\.0/?$",str(p.get("license_url") or "")
        ):
            p["license"]="CC BY 4.0"
        if str(p.get("license") or "").upper()=="CC BY-SA":
            found=re.search(r"/licenses/by-sa/(2\.0|4\.0)/?$",str(p.get("license_url") or ""))
            if found:p["license"]="CC BY-SA "+found.group(1)
        if str(p.get("license") or "").upper()=="CC0" and not p.get("license_url"):
            p["license_url"]="https://creativecommons.org/publicdomain/zero/1.0/"
        photo_owner=source_species_id(src)
        p["source_species_id"]=photo_owner
        p["photo_role"]=("TARGET_SPECIES_SOURCE" if photo_owner==sid else
                         "COMPARISON_SPECIES_SOURCE" if photo_owner else "SOURCE_OWNER_UNKNOWN")
        assert (ROOT/src).is_file()
        source_credits[src]={"creator":p.get("creator"),"license":p.get("license"),
                             "source_page":p.get("source_page")}
        p["src"]="../"+src
    d["panels"]=selected
    d["preview_only"]=False
    d["note"]="Existing-source public educational gallery: CC photos and explicitly credited Bob Harms science/education-only photographs are distinguished. Source labels and arrows are not independent specimen voucher certification."
    stats["panels"]+=len(selected);stats["held_panels"]+=len(rejected)-len(newly_restored)
    actual=sum(p["photo_role"]=="TARGET_SPECIES_SOURCE" for p in selected)
    comparison=sum(p["photo_role"]=="COMPARISON_SPECIES_SOURCE" for p in selected)
    photosBySpecies[sid]={"count":len(selected),"first_src":selected[0]["src"] if selected else None,
                           "target_species_source_panels":actual,
                           "comparison_source_panels":comparison}
    target=SITE/"data/species"/(sid+".json")
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
    for row in manifest:
        if row["id"]==sid:
            row["local_panel_count"]=len(selected)
            row["target_species_source_panels"]=actual
            row["comparison_source_panels"]=comparison
            row["source_photo_status"]="STRICT_PUBLIC_LICENSE_FILTERED" if selected else "NO_AUTOMATICALLY_CLEARED_PHOTO"
        stats["species"]+=0
    stats["species"]+=1
    stats["photographed_species"]+=int(bool(selected))
assert stats["species"]==112
assert all(entry["target_species_source_panels"]>0 and entry["count"]>0 for entry in photosBySpecies.values()),"Regression: every Poaceae card must retain at least one target-species source photo"

distinct={p["src"].removeprefix("../") for _,d in cards for p in d["panels"]}
assert distinct==keep.union(CURATED_BY_SRC)
# Copy text-only teaching indexes/glossary generated from the canonical original records.
for p in (PREVIEW/"data").glob("*.json"):
    if p.name=="poaceae-index.json":continue
    shutil.copy2(p,SITE/"data"/p.name)
(SITE/"data/poaceae-index.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
(SITE/"data/gallery-index.json").write_text(json.dumps({
  "schema_version":1,"status":"EXISTING_ONLY_SOURCE_CREDITED_EDUCATIONAL_RIGHTS_SCREENED",
  "species":112,"photo_species":stats["photographed_species"],
  "photo_panels":stats["panels"],"photo_files":len(distinct),"entries":photosBySpecies
},ensure_ascii=False,indent=2)+"\n")
release={"stage":"EXISTING_SOURCE_CREDITED_EDUCATIONAL_GALLERY",
         "source_image_candidates_in_rights_first_preview":len(candidate_files),
         "photo_files_referenced_on_public_site":len(distinct),
         "photo_panels_visible":stats["panels"],
         "photo_panels_excluded_in_final_gate":stats["held_panels"],
         "species":112,"species_with_visible_photos":stats["photographed_species"],
         "species_with_target_species_source_photos":sum(x["target_species_source_panels"]>0 for x in photosBySpecies.values()),
         "previously_held_usgs_source_files_recovered_into_family_repo":3,
         "curated_exact_photo_files":len(CURATED_BY_SRC),
         "new_media_files_copied":0,"new_external_media_downloaded":0,
         "source_photo_files_unchanged":True,
         "excluded_source_images_stay_in_original_repo":True,
         "rights_note":"Existing-source educational gallery. Some photographed anatomy is under Bob Harms author educational-use-only permission, not a Creative Commons grant. Archived photo-level attribution does not independently prove diagnostic identity or current rights."}
(SITE/"data/poaceae-release.json").write_text(json.dumps(release,indent=2)+"\n")
(SITE/"PHOTO_PUBLICATION_SCOPE.md").write_text(
 f"# Existing-grass-image release\n\n{len(distinct)} original physical source files are referenced by "+
 f"{stats['panels']} visual panels for {stats['photographed_species']} of 112 grass species. "+
 "Existing CC/CC0 and narrowly credited Bob Harms educational-only photos are distinguished; no blanket third-party reuse. "+
 "Three original Larry Allain/USGS public-domain JPEGs were copied byte-for-byte from the legacy archive with Git blob hash verification; no new external media were harvested. "+
 "Remaining source images stay accounted for and are not included in this photo gallery. "+
 "Human verification of arrows and subtle infraspecific taxa is separate.\n")
html=(SITE/"index.html").read_text()
html=html.replace('content="noindex,nofollow"','content="index,follow"')
html=html.replace("Migration preview — not the public replacement.","Existing-source grass gallery — original learner preserved.")
html=html.replace("The original site remains authoritative. Some photos and comparisons are intentionally absent pending rights review.",
                  "The original site remains available. The images shown here passed an additional conservative source/CC license check; held photos remain excluded.")
html=html.replace("physically archived license-screened photographs present in this staging copy.",
                  "source-credited photographs with each image's actual reuse conditions.")
html=html.replace("The images shown here passed an additional conservative source/CC license check; held photos remain excluded.",
                  "All 112 species have existing archived source photographs. Attribution and photo-specific rights are displayed, including Bob Harms scientific/educational-only use; held photos remain separate.")
html=html.replace("Each gallery shows only source-credited photographs cleared for the strict existing-source public release.",
                  "Every grass has source-credited photos. Bob Harms images are educational-use-only (not CC); see the credit under each photograph.")
html=html.replace("staging preview</title>","Visual Learner</title>")
html=html.replace("app.js?v=photo-level-ccby-20261029","app.js?v=poaceae-photo-coverage-112-20261029")
html=html.replace("styles.css?v=grass-comparison-roles-20261029","styles.css?v=poaceae-photo-coverage-112-20261029")
html=html.replace('href="styles.css"','href="styles.css?v=existing-grass-20261029"')
html=html.replace('src="app.js"','src="app.js?v=existing-grass-20261029"')
(SITE/"index.html").write_text(html)
js=(SITE/"app.js").read_text()
js=js.replace("// Non-deployed Hays Botany Poaceae staging learner. Do not enable Pages or\n// treat broadly licensed photo candidates as fully cleared by this interface.",
              "// Rights-filtered existing-source public Poaceae teaching learner.\n// Original specimen/photo sources and unresolved permissions remain separately preserved.")
js=js.replace("Staging only: photo permissions and arrow landing positions are not fully certified.",
              "Source-credited photographs: some are CC-licensed, while Bob Harms photos are copyrighted and educational-use-only. Anatomy arrows are not all independently certified.")
js=js.replace("Source-licensed photo subset: anatomy arrow landing positions are not all manually certified.",
              "Source-credited photos (including separately licensed educational-use images); subtle anatomy arrows may still need field verification.")
(SITE/"app.js").write_text(js)
(ROOT/"index.html").write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="refresh" content="0;url=./site/"><title>Hays Botany — Grasses</title></head><body><a href="./site/">Open Poaceae Visual Learner</a></body></html>\n')
print("POACEAE_STRICT_EXISTING_SOURCE_SITE_READY",json.dumps(release,sort_keys=True),flush=True)
