#!/usr/bin/env python3
"""Release a SOURCE-ONLY strict-licensed grass learner using existing main-branch photos.
Consumes already built dist-safe rights-first preview. Never copies image bytes or changes
underlying source taxon cards. Filters additional non-exact provenance conservatively.
"""
import json,re,shutil,sys
from collections import defaultdict,Counter
from pathlib import Path
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
def is_eligible(p):
    name=str(p.get("license") or "").strip()
    source=str(p.get("source_page") or "")
    creator=str(p.get("creator") or "")
    if not creator or not source.startswith("https://"):return False
    if re.search(r"NC|ND|not verified|review|all rights reserved|permission",name,re.I):return False
    if re.fullmatch(r"CC0(?:\s*1\.0)?",name,re.I):
        return source.startswith("https://commons.wikimedia.org/wiki/File:") or source.startswith("https://www.inaturalist.org/photos/")
    if re.fullmatch(r"CC BY(-SA)?\s*(2\.0|2\.5|3\.0|4\.0)(?:\s+US)?",name,re.I):
        return source.startswith("https://commons.wikimedia.org/wiki/File:") or source.startswith("https://www.inaturalist.org/photos/")
    if re.search(r"public domain",name,re.I) and creator.strip().lower()=="jim conrad":
        return "backyardnature.net" in source
    return False

def source_species_id(src):
    """Use the exact original Poaceae photo-folder owner for display-role QA.
    This does NOT independently verify the specimen's taxonomic identification.
    """
    match=re.search(r"(?:^|/)content/taxa/Poaceae/[^/]+/([^/]+)/images/",str(src))
    return match.group(1) if match else None

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
stats=Counter(); photosBySpecies={}; source_credits={}
for _,d in cards:
    sid=d["id"]
    original=d.get("panels",[])
    selected=[p for p in original if p["src"] in keep]
    rejected=[p for p in original if p["src"] not in keep]
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
        d.setdefault("unavailable_references",[]).append({
          "original_panel_index":p.get("original_panel_index"),
          "label":p.get("label"),
          "reason":"Source-specific CC/public domain provenance not independently strong enough for automatic public site release",
          "reference_page":p.get("source_page") or "",
          "license_status":"SOURCE_REFERENCE_HELD"
        })
    for p in selected:
        src=p["src"]
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
    d["note"]="Existing-source, strict-license-screened public gallery. Additional historical photos remain held from this site. Anatomy overlays are teaching annotations, not a separate verified voucher determination."
    stats["panels"]+=len(selected);stats["held_panels"]+=len(rejected)
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
distinct={p["src"].removeprefix("../") for _,d in cards for p in d["panels"]}
assert distinct==keep
# Copy text-only teaching indexes/glossary generated from the canonical original records.
for p in (PREVIEW/"data").glob("*.json"):
    if p.name=="poaceae-index.json":continue
    shutil.copy2(p,SITE/"data"/p.name)
(SITE/"data/poaceae-index.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
(SITE/"data/gallery-index.json").write_text(json.dumps({
  "schema_version":1,"status":"EXISTING_ONLY_STRICT_SOURCE_RIGHTS_SCREENED",
  "species":112,"photo_species":stats["photographed_species"],
  "photo_panels":stats["panels"],"photo_files":len(keep),"entries":photosBySpecies
},ensure_ascii=False,indent=2)+"\n")
release={"stage":"EXISTING_SOURCE_STRICT_PUBLIC_GALLERY",
         "source_image_candidates_in_rights_first_preview":len(candidate_files),
         "photo_files_referenced_on_public_site":len(keep),
         "photo_panels_visible":stats["panels"],
         "photo_panels_excluded_in_final_gate":stats["held_panels"],
         "species":112,"species_with_visible_photos":stats["photographed_species"],
         "new_media_files_copied":0,"new_external_media_downloaded":0,
         "source_photo_files_unchanged":True,
         "excluded_source_images_stay_in_original_repo":True,
         "rights_note":"Source metadata screening is not proof that individual arrow targets or every public license determination has undergone manual visual re-review."}
(SITE/"data/poaceae-release.json").write_text(json.dumps(release,indent=2)+"\n")
(SITE/"PHOTO_PUBLICATION_SCOPE.md").write_text(
 f"# Existing-grass-image release\n\n{len(keep)} original physical source files are referenced by "+
 f"{stats['panels']} visual panels for {stats['photographed_species']} of 112 grass species. "+
 "Only strict CC/public-domain and specifically sourced existing files were selected. "+
 "No new photo file bytes were moved or downloaded; the JPEGs remain in content/taxa/Poaceae. "+
 "Remaining source images stay accounted for and are not included in this photo gallery. "+
 "Human verification of arrows and subtle infraspecific taxa is separate.\n")
html=(SITE/"index.html").read_text()
html=html.replace('content="noindex,nofollow"','content="index,follow"')
html=html.replace("Migration preview — not the public replacement.","Existing-source grass gallery — original learner preserved.")
html=html.replace("The original site remains authoritative. Some photos and comparisons are intentionally absent pending rights review.",
                  "The original site remains available. The images shown here passed an additional conservative source/CC license check; held photos remain excluded.")
html=html.replace("physically archived license-screened photographs present in this staging copy.",
                  "source-credited photographs cleared for the strict existing-source public release.")
html=html.replace('href="styles.css"','href="styles.css?v=existing-grass-20261029"')
html=html.replace('src="app.js"','src="app.js?v=existing-grass-20261029"')
(SITE/"index.html").write_text(html)
js=(SITE/"app.js").read_text()
js=js.replace("// Non-deployed Hays Botany Poaceae staging learner. Do not enable Pages or\n// treat broadly licensed photo candidates as fully cleared by this interface.",
              "// Rights-filtered existing-source public Poaceae teaching learner.\n// Original specimen/photo sources and unresolved permissions remain separately preserved.")
js=js.replace("Staging only: photo permissions and arrow landing positions are not fully certified.",
              "Source-licensed photo subset: anatomy arrow landing positions are not all manually certified.")
(SITE/"app.js").write_text(js)
(ROOT/"index.html").write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="refresh" content="0;url=./site/"><title>Hays Botany — Grasses</title></head><body><a href="./site/">Open Poaceae Visual Learner</a></body></html>\n')
print("POACEAE_STRICT_EXISTING_SOURCE_SITE_READY",json.dumps(release,sort_keys=True),flush=True)
