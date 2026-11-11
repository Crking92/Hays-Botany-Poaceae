#!/usr/bin/env python3
"""Inspect authoritative GBIF occurrence and TEX specimen metadata for 3 Hays leads.

Does not assume indexed records are genuinely identified or wild. Records contain
no exact coordinates or sensitive detailed locality strings. Only openly licensed
specimen images will be downloaded into a short-lived review artifact, never git.
"""
import json,pathlib,urllib.request,time,urllib.parse,io
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"audits/hays-paspalum-langei-tex-three-specimen-metadata-20261111.json"
MD=ROOT/"audits/hays-paspalum-langei-tex-three-specimen-metadata-20261111.md"
IMG=ROOT/"review_tex_temporary"
IMG.mkdir(exist_ok=True)
IDS=[3866879449,3866886419,5236506306]
ALLOWED={"CC0_1_0","CC_BY_4_0","CC_BY_3_0","CC_BY_SA_4_0","CC_BY_NC_4_0","CC_BY_NC_SA_4_0"}
def request_json(url):
    req=urllib.request.Request(url,headers={
      "User-Agent":"HaysBotanyHerbariumProofReview/1.0 (https://github.com/Crking92/Hays-Botany-Poaceae)",
      "Accept":"application/json"})
    for j in range(3):
      try:
        with urllib.request.urlopen(req,timeout=35) as r:return json.load(r),None
      except Exception as e: err=str(e);time.sleep(2**j)
    return None,err
rows=[]
for key in IDS:
    url=f"https://api.gbif.org/v1/occurrence/{key}"
    rec,error=request_json(url)
    verb,ve=request_json(url+"/verbatim")
    if error or not rec:
        rows.append({"gbif_id":key,"status":"API_UNAVAILABLE","error":error or "unknown"})
        continue
    media=[{"type":m.get("type"),"format":m.get("format"),"identifier":m.get("identifier"),
            "license":m.get("license"),"creator":m.get("creator"),"rightsHolder":m.get("rightsHolder"),
            "title":m.get("title"),"description":(m.get("description") or "")[:220]} for m in rec.get("media",[])]
    interesting=["id","key","occurrenceID","catalogNumber","institutionCode","collectionCode","datasetName","datasetKey","scientificName","acceptedScientificName","taxonKey","acceptedTaxonKey",
      "recordedBy","recordNumber","eventDate","year","month","day","country","stateProvince","county","basisOfRecord","typeStatus","identificationID",
      "identifiedBy","dateIdentified","references","associatedReferences","associatedMedia","license","rightsHolder","verbatimScientificName","occurrenceRemarks",
      "identificationRemarks","establishmentMeans","degreeOfEstablishment","cultivationStatus","taxonRank","modified","gbifID"]
    interesting_verbatim=["catalogNumber","scientificName","recordedBy","recordNumber","eventDate","dateIdentified","identifiedBy","county","stateProvince",
      "associatedMedia","references","occurrenceID","basisOfRecord","institutionCode","collectionCode","rights","rightsHolder","license"]
    row={
       "gbif_id":key,"status":"GBIF_METADATA_RETRIEVED",
       "record_url":f"https://www.gbif.org/occurrence/{key}",
       "occurrence":{k:rec.get(k) for k in interesting if k in rec},
       "media_count":len(media),"media":media,
       "verbatim_fields":{k:verb.get(k) for k in interesting_verbatim if isinstance(verb,dict) and k in verb} if isinstance(verb,dict) else {},
       "verbatim_available":bool(verb),"verbatim_error":ve,
       "original_specimen_sheet_pixels_checked":False,"label_manually_checked":False,"diagnostic_spikelet_anatomy_checked":False,
       "specimen_species_identification_verified":False,
       "independent_Hays_evidence_tier":"INDEXED_SPECIMEN_METADATA_NOT_VISUAL_CONFIRMED"
    }
    rows.append(row)
    print("TEX_META",key,row["occurrence"].get("catalogNumber"),"media",len(media),"references",rec.get("references"),"associatedMedia",bool(rec.get("associatedMedia")),"verbatim",bool(verb),flush=True)
    time.sleep(.3)
data={"date":"2026-11-11","targets":IDS,"count_retrieved":sum(x["status"]=="GBIF_METADATA_RETRIEVED" for x in rows),"records":rows,
      "warnings":["GBIF metadata is not itself a viewed herbarium specimen. It may link out to the official TEX portal.","No precise collecting locality or coordinates exported in this report.","GBIF media links may be dead, have separate image rights or depict a specimen not suitable for identifying minute spikelet structures.","No flora/specimen identification or wild establishment has been certified."]}
OUT.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
lines=["# Three TEX herbarium Paspalum langei leads — source detail cross-check","",
      "The three GBIF indexed herbarium records were queried by exact occurrence key. **Do not call a specimen 'examined' until a sheet image and labels are actually opened and inspected.**","",
      "| GBIF link | TEX catalog | Collector | Collection date | Media in GBIF | External record link |",
      "|---|---|---|---|---:|---|"]
for x in rows:
  if x["status"]!="GBIF_METADATA_RETRIEVED":
    lines.append(f"| [{x['gbif_id']}](https://www.gbif.org/occurrence/{x['gbif_id']}) | — | — | — | — | API error |")
    continue
  rec=x["occurrence"]
  ext=rec.get("references") or rec.get("occurrenceID") or "—"
  lines.append(f"| [{x['gbif_id']}]({x['record_url']}) | {rec.get('catalogNumber','—')} | {rec.get('recordedBy','—')} | {rec.get('eventDate','—')} | {x['media_count']} | {ext} |")
lines+=["","If images are absent or rights restricted, use the official Lundell Plant Diversity Portal/TEX herbarium and search by catalog number, or request the curator's specimen scan. Verify original sheet/label, collector, locality, date, annotations, flowering heads and spikelets, and whether it is planted.","",
"Diagnostic traits from Flora of North America: Paspalum langei perennial, 1–3(4) inflorescence branches, paired imbricate spikelets 2.1–3.3 mm, lower glumes variably present, upper glume and lower lemma with papillose-based pubescence. Morphology source: https://biorepo.neonscience.org/portal/taxa/index.php?clid=8707&taxauthid=1&tid=20916","",
"See [JSON report](hays-paspalum-langei-tex-three-specimen-metadata-20261111.json) for original institution links and available media/license metadata.",""]
MD.write_text("\n".join(lines))
print("TEX_META_DONE",data["count_retrieved"],flush=True)
