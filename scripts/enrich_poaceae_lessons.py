#!/usr/bin/env python3
"""Add original field-botany teaching content to the non-deployed family preview.

Never modifies canonical source records or held photo bytes. Existing explicit
beginner paths take precedence; remaining paths are navigational sequences
assembled verbatim from recorded field cues and field-ID tiles, not new species
determinations or newly observed anatomical characters.
"""
from pathlib import Path
import json
from collections import Counter

def norm(v):
    if isinstance(v,str):return v.strip()
    if isinstance(v,list):return "; ".join(norm(i) for i in v if norm(i))
    return ""

def enrich(root:Path,out:Path):
    root=root.resolve();out=out.resolve()
    ledger=json.loads((root/"migration/source-file-ledger.json").read_text())
    # Match the preview builder's current copied, photo-specific Commons subset.
    accepted={"LICENSE_CANDIDATE_IMAGE_COPIED","CURRENT_COMMONS_CC_PHOTO_COPIED"}
    allowed={x["path"] for x in ledger if x["disposition"] in accepted}
    term_file=root/"site/data/grass-terms.json"
    glossary=json.loads(term_file.read_text(encoding="utf-8"))
    (out/"data").mkdir(parents=True,exist_ok=True)
    (out/"data/grass-terms.json").write_text(json.dumps(glossary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    cards=sorted((root/"content/taxa/Poaceae").rglob("species.json"))
    assert len(cards)==112
    names={}
    for p in cards:
        d=json.loads(p.read_text(encoding="utf-8"))
        names[norm(d.get("scientific_name")).lower()]=d.get("id") or p.parent.name
    summary=Counter()
    for source in cards:
        d=json.loads(source.read_text(encoding="utf-8"))
        sid=d.get("id") or source.parent.name
        file=out/"data/species"/(sid+".json")
        lesson=json.loads(file.read_text(encoding="utf-8"))
        panels=(d.get("visual_comparison") or {}).get("items") or []
        kept=[]
        for original_index,panel in enumerate(panels):
            image=panel.get("image_url")
            if not isinstance(image,str) or image.startswith(("https://","http://")):
                continue
            if image.startswith("content/taxa/Poaceae/"): candidate=root/image
            else:candidate=source.parent/image
            try:rel=candidate.resolve().relative_to(root).as_posix()
            except ValueError:continue
            if rel in allowed and candidate.is_file():
                kept.append(original_index)
        assert len(kept)==len(lesson["panels"]),(sid,len(kept),len(lesson["panels"]))
        original_to_preview={orig:i for i,orig in enumerate(kept)}
        for idx,panel in enumerate(lesson["panels"]):
            panel["original_panel_index"]=kept[idx]
            # Researching a photo licensing candidate does not complete anatomy verification.
            panel["publication_status"]="TRANSFER_CANDIDATE_NOT_FINAL_PHOTO_PERMISSION_CLEARANCE"
        tiles=d.get("field_id_short_tiles") or []
        quick=d.get("field_photo_quickcheck") or {}
        morph=d.get("morphology_keys") or {}
        comparison=d.get("comparisons") or {}
        visual=d.get("visual_comparison") or {}
        look=norm(d.get("look_here_first"))
        native=d.get("project_inclusion") or {}
        if not isinstance(native,dict):native={}
        base_steps=(d.get("beginner_learning_path") or {}).get("steps") or []
        output_steps=[]
        if base_steps:
            for idx,step in enumerate(base_steps[:25]):
                if not isinstance(step,dict):continue
                pidx=step.get("panel_index")
                output_steps.append({
                    "title":norm(step.get("title")) or "Field observation",
                    "look_for":norm(step.get("look_for")),
                    "why_it_matters":norm(step.get("why_it_matters")),
                    "source":"EXPLICIT_ORIGINAL_BEGINNER_STEP",
                    "original_panel_index":pidx if isinstance(pidx,int) else None,
                    "panel_index":original_to_preview.get(pidx) if isinstance(pidx,int) else None,
                    "photo_unavailable":isinstance(pidx,int) and pidx not in original_to_preview
                })
            summary["explicit_beginner_paths"]+=1
        else:
            # Existing texts only, no fabricated plant anatomy, no invented completeness.
            def step(title,desc,why,orig_indices=None):
                if not desc:return
                possible=[p for p in (orig_indices or []) if isinstance(p,int) and p in original_to_preview]
                first=possible[0] if possible else None
                output_steps.append({
                    "title":title,"look_for":desc,"why_it_matters":why,
                    "source":"EXISTING_CARD_FIELD_GUIDANCE",
                    "original_panel_index":first,
                    "panel_index":original_to_preview.get(first) if first is not None else None,
                    "photo_unavailable":first is None
                })
            main_indices=tiles[0].get("photo_panel_indices",[]) if tiles else []
            step("1 · First, recognize the plant", look or norm(tiles[0].get("details")) if tiles else look,
                 "Start with the recorded recognition characters before making a species identification.",main_indices)
            first_quick=(quick.get("steps") or [None])[0]
            step("2 · Examine the whole plant",norm(morph.get("habit")) or norm(first_quick),
                 "Habit and growing context are supporting evidence, not proof of hidden roots or rhizomes.",
                 quick.get("featured_photo_indices",[]))
            leaves=norm(morph.get("leaves"))
            if not leaves:
                for t in tiles:
                    if any(w in norm(t.get("heading")).lower() for w in ("collar","ligule","sheath","node","leaf","base")):
                        leaves=norm(t.get("details")) or norm(t.get("short"))
                        break
            step("3 · Inspect leaves, collar and nodes",leaves,
                 "Examine the real structures; the photo may not expose or measure all the described characters.",
                 next((t.get("photo_panel_indices",[]) for t in tiles if any(
                     w in norm(t.get("heading")).lower() for w in ("ligule","collar","node","leaf","base"))),[]))
            reproduction=norm(morph.get("inflorescence")) or norm(morph.get("spikelets"))
            if not reproduction:
                for t in tiles:
                    if any(w in norm(t.get("heading")).lower() for w in ("seedhead","spikelet","lemma","glume","flower","raceme","panicle")):
                        reproduction=norm(t.get("details")) or norm(t.get("short"))
                        break
            step("4 · Check the flowering structure",reproduction,
                 "Use an attached, correctly identified specimen when deciding the flower or spikelet structures.",
                 next((t.get("photo_panel_indices",[]) for t in tiles if any(
                     w in norm(t.get("heading")).lower() for w in ("seedhead","spikelet","lemma","glume","flower","raceme","panicle"))),[]))
            distinctive=norm(comparison.get("key_distinctions")) or norm(morph.get("comparison_training"))
            step("5 · Compare similar grasses",distinctive,
                 "Confirm at least two independent botanical characters; do not remove a native candidate from color alone.",
                 next((t.get("photo_panel_indices",[]) for t in tiles if any(
                     w in norm(t.get("heading")).lower() for w in ("look-alike","compare","versus"))),[]))
            if not output_steps:
                for t in tiles[:3]:
                    step(norm(t.get("heading")) or "Existing field cue",norm(t.get("details")) or norm(t.get("short")),
                         "This is an original species-card observation, not newly verified anatomy.",
                         t.get("photo_panel_indices",[]))
            if not output_steps:
                step("Existing botanical description",norm(d.get("look_here_first")) or norm(quick.get("field_rule")),
                     "Photographic and species determination remains provisional.",[])
            assert output_steps,("No scientifically grounded guidance",sid)
            summary["generated_existing_card_paths"]+=1
        for t,old in zip(lesson["tiles"],tiles):
            indices=old.get("photo_panel_indices") or []
            t["short"]=norm(old.get("short"))
            t["status"]=norm(old.get("status"))
            t["glossary"]=list(old.get("glossary") or [])
            t["original_panel_indices"]=[i for i in indices if isinstance(i,int)]
            t["preview_panel_indices"]=[original_to_preview[i] for i in indices if i in original_to_preview]
            t["missing_original_panel_indices"]=[i for i in indices if isinstance(i,int) and i not in original_to_preview]
        if not lesson["tiles"]:
            # There are 3 original cards without short-tile records.
            for label,body in (
                ("Look here first",look),
                ("Whole plant and leaf traits",norm(morph.get("habit")) or norm(morph.get("leaves"))),
                ("Flowering and seed structures",norm(morph.get("inflorescence")) or norm(morph.get("spikelets"))),
                ("Look-alike comparison",norm(comparison.get("key_distinctions"))),
            ):
                if body:lesson["tiles"].append({
                    "heading":label,"short":"","details":body,
                    "status":"FALLBACK_FROM_CANONICAL_RECORD_NOT_A_NEW_PHOTO",
                    "glossary":[],
                    "original_panel_indices":[],"preview_panel_indices":[],
                    "missing_original_panel_indices":[]})
            assert lesson["tiles"],("No recorded field facts",sid)
            summary["field_id_tile_fallbacks"]+=1
        related=[]
        for label in comparison.get("confused_with",[]) if isinstance(comparison,dict) else []:
            label=norm(label)
            if not label:continue
            ref=names.get(label.lower())
            related.append({"scientific":label,"species_id":ref,
                            "location":"LOCAL_POACEAE" if ref else "UNIFIED_HUB_REFERENCE",
                            "status":"SOURCE_REFERENCE_ONLY_NOT_NEW_PHOTO_DETERMINATION"})
        # Preserve every unavailable original panel as an explicitly non-embedded
        # source/reference link. No uncertain photo pixels are published.
        unavailable=[]
        for original_i,panel in enumerate(panels):
            if original_i in original_to_preview:
                continue
            image=panel.get("image_url")
            source_page=panel.get("source_page")
            link=""
            if isinstance(source_page,str) and source_page.startswith("https://"):
                link=source_page
            elif isinstance(image,str) and image.startswith("https://"):
                link=image
            unavailable.append({
                "original_panel_index":original_i,
                "label":norm(panel.get("label")) or "Original comparison photograph",
                "reason":"External-only reference; image not archived for new site" if
                    isinstance(image,str) and image.startswith(("https://","http://"))
                    else "Source photo withheld from public replacement pending rights review",
                "reference_page":link,
                "license_status":"NOT_CLEARED_FOR_PUBLIC_EMBED"
            })
        lesson["unavailable_references"]=unavailable
        lesson["steps"]=output_steps
        lesson["intro"]=norm((d.get("beginner_learning_path") or {}).get("intro")) or look
        lesson["memory_rule"]=norm((d.get("beginner_learning_path") or {}).get("memory_rule")) or norm(visual.get("memory_rule"))
        lesson["safety_note"]=norm((d.get("beginner_learning_path") or {}).get("safety_note")) or norm(quick.get("warning"))
        lesson["field_rule"]=norm(quick.get("field_rule"))
        lesson["family_profile_key"]="Poaceae"
        lesson["native_target_zone_calculated"]=d.get("native_target_zone_calculated")
        lesson["target_zone_status"]=native.get("target_zone_status","UNRESOLVED")
        lesson["photo_data_caution"]="Missing or restricted comparison photographs have not been replaced by guesses. Source statements are not proof the associated structure is visible in any available photo."
        lesson["related"]=related
        lesson["comparison_text"]=norm(comparison.get("key_distinctions")) or norm(morph.get("comparison_training"))
        lesson["learning_source"]="EXPLICIT_ORIGINAL_BEGINNER_PATH" if base_steps else "SOURCE_CANONICAL_FIELD_NOTES_FALLBACK"
        lesson["morphology"]={k:norm(v) for k,v in morph.items() if k in ("habit","leaves","inflorescence","spikelets","floral_detail") and norm(v)}
        lesson["eco_habitat"]=norm((d.get("ecological_notes") or {}).get("habitat")) if isinstance(d.get("ecological_notes"),dict) else ""
        lesson["family_glossary_terms"]=list(dict.fromkeys(x for tile in lesson["tiles"] for x in tile.get("glossary",[])))
        file.write_text(json.dumps(lesson,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        summary["species_enriched"]+=1
        summary["total_learning_steps"]+=len(output_steps)
        summary["steps_with_linked_photo"]+=sum(1 for step in output_steps if step["panel_index"] is not None)
        summary["related_taxon_links"]+=len(related)
    assert summary["species_enriched"]==112
    assert summary["explicit_beginner_paths"]+summary["generated_existing_card_paths"]==112
    assert summary["field_id_tile_fallbacks"]==3
    assert summary["total_learning_steps"]>=112
    print("POACEAE_LEARNER_PARITY",json.dumps(dict(summary),ensure_ascii=False),flush=True)
    return dict(summary)

if __name__=="__main__":
    import argparse
    a=argparse.ArgumentParser()
    a.add_argument("--root",type=Path,default=Path("."))
    a.add_argument("--out",type=Path,default=Path("dist"))
    x=a.parse_args()
    enrich(x.root,x.out)
