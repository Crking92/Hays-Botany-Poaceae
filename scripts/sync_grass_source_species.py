#!/usr/bin/env python3
"""Sync modified main-branch grass source species into the dedicated learner.

Existing anatomy/photo panels and arrows are NEVER overwritten by generic
source edits. New grass species get a provisional text-first card and no invented
anatomy arrows. Exact file paths are restricted to content/taxa/Poaceae.
"""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
def fail(s):raise ValueError("GRASS_SOURCE_SYNC_BLOCKED: "+s)
def read(p):return json.loads(p.read_text(encoding="utf-8"))
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+"\n")
def changed(source,before):
    if not re.fullmatch(r"[0-9a-f]{40}",before):fail("Unrecognized prior commit")
    p=subprocess.run(["git","diff","--name-only","--diff-filter=AM",before,"HEAD","--","content/taxa/Poaceae"],cwd=source,capture_output=True,text=True)
    if p.returncode:fail("Cannot inspect exact source change window")
    return [x for x in p.stdout.splitlines() if x.endswith("/species.json")]
def sync(source,site,paths,check=False):
    index_path=site/"data/poaceae-index.json";gallery_path=site/"data/gallery-index.json"
    idx=read(index_path);gal=read(gallery_path)
    byid={x["id"]:x for x in idx}
    if len(byid)!=len(idx) or len(idx)<112 or gal["species"]!=len(idx) or set(gal["entries"])!=set(byid):
        fail("Original grass site index/IDs do not match")
    planned=[];created=[]
    for name in sorted(set(paths)):
        parts=Path(name).parts
        if len(parts)!=6 or parts[:3]!=("content","taxa","Poaceae") or parts[-1]!="species.json":
            fail("Unassigned grass source path: "+name)
        genus,sid=parts[3:5]
        if not re.fullmatch(r"[A-Z][A-Za-z-]+",genus) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",sid):
            fail("Invalid grass source taxon ID")
        f=source/name
        if not f.is_file() or f.is_symlink():fail("Missing species source JSON")
        payload=f.read_bytes();raw=json.loads(payload)
        if not isinstance(raw,dict) or raw.get("id")!=sid or raw.get("family")!="Poaceae" or raw.get("genus")!=genus:
            fail("Source grass identity conflict")
        sci=raw.get("scientific_name")
        if not isinstance(sci,str) or not sci.strip():fail("Grass source lacks scientific name")
        common=raw.get("common_name") or sci
        if not isinstance(common,str):fail("Invalid grass common name")
        p=site/"data/species"/(sid+".json")
        card=read(p) if p.is_file() else None
        if card and card.get("id")!=sid:fail("Existing grass species card identity drift")
        original=dict(card or {})
        if card is None:
            first=raw.get("look_here_first") or "Automatic source import; verify the morphological evidence before field use."
            morph=raw.get("morphology_keys") or {}
            traits=morph.get("best_field_traits",[]) if isinstance(morph,dict) else []
            note="; ".join(str(t) for t in traits[:6]) if isinstance(traits,list) else ""
            original.update({"id":sid,"scientific":sci,"common":common,"genus":genus,
                "note":"Automated source-first entry; photo and diagnostic anatomy review welcome.",
                "tiles":[{"heading":"01 · FIRST LOOK (source record)","details":first+" "+note,
                          "short":first[:200],"status":"AUTO_IMPORTED_SOURCE_RECORD_REVIEW_WELCOME",
                          "glossary":[],"preview_panel_indices":[]}],
                "steps":[{"title":"Find the plant","look_for":first,
                          "why_it_matters":"Source field guidance; review exact structures when photographs are added",
                          "source":"AUTOMATED_SOURCE_RECORD","panel_index":None}],
                "panels":[],"preview_only":True,"unavailable_references":[],
                "intro":first,"memory_rule":"","safety_note":"",
                "field_rule":first,"related":[]})
        else:
            original["scientific"]=sci
            original["common"]=common
            if raw.get("look_here_first") and original.get("source_sync_status")=="AUTO_IMPORTED_SOURCE_RECORD_REVIEW_WELCOME":
                original["intro"]=raw["look_here_first"]
        original["source_record_sha256"]=hashlib.sha256(payload).hexdigest()
        original["source_sync_status"]="AUTO_IMPORTED_SOURCE_RECORD_REVIEW_WELCOME"
        if sid in byid:
            row=byid[sid]
            if row.get("genus")!=genus:fail("Cannot silently move genus/ID")
            row["scientific"]=sci;row["common"]=common
        else:
            idx.append({"id":sid,"scientific":sci,"common":common,"genus":genus,
                        "local_panel_count":0,"target_species_source_panels":0,
                        "comparison_source_panels":0,"source_photo_status":"NO_SOURCE_PHOTOS_YET"})
            byid[sid]=idx[-1]
            gal["entries"][sid]={"count":0,"first_src":None,
                                 "target_species_source_panels":0,"comparison_source_panels":0}
            created.append(sid)
        planned.append((p,original))
    if created:gal["species"]=len(idx)
    result={"status":"CHECK_PASSED" if check else "PUBLIC_GRASS_SOURCE_CARDS_UPDATED",
            "changed_species":len(planned),"new_species":len(created),"added":created}
    if not check and planned:
        for p,card in planned:write(p,card)
        write(index_path,idx);write(gallery_path,gal)
    print(json.dumps(result))
    return result
def main():
    ap=argparse.ArgumentParser();ap.add_argument("--source-root",type=Path,required=True)
    ap.add_argument("--site-root",type=Path,required=True)
    ap.add_argument("--changed-from");ap.add_argument("--file",action="append")
    ap.add_argument("--check",action="store_true")
    args=ap.parse_args()
    files=changed(args.source_root,args.changed_from) if args.changed_from else (args.file or [])
    if not files:
        print(json.dumps({"status":"NO_CHANGED_GRASS_SOURCE","changed_species":0}))
        return
    sync(args.source_root.resolve(),args.site_root.resolve(),files,args.check)
if __name__=="__main__":
    try:main()
    except (ValueError,KeyError,TypeError) as exc:
        print(str(exc),flush=True);raise SystemExit(2)
