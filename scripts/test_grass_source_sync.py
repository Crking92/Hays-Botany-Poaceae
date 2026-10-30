#!/usr/bin/env python3
"""Synthetic new grass and existing-grass photo-arrow preservation fixture."""
import importlib.util,json,shutil,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("grass_sync",ROOT/"scripts/sync_grass_source_species.py")
tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
def main():
    with tempfile.TemporaryDirectory(prefix="grass-source-qa-") as d:
        root=Path(d);source=root/"source";site=root/"site"
        shutil.copytree(ROOT/"site/data",site/"data")
        sid="schizachyrium-automatic-ci-test"
        loc=f"content/taxa/Poaceae/Schizachyrium/{sid}/species.json"
        p=source/loc;p.parent.mkdir(parents=True)
        sample={"id":sid,"family":"Poaceae","genus":"Schizachyrium",
                "scientific_name":"Schizachyrium synthetic-test","common_name":"Test grass only",
                "look_here_first":"This is a synthetic CI-only species record."}
        p.write_text(json.dumps(sample))
        assert tool.sync(source,site,[loc],check=True)["new_species"]==1
        assert not (site/"data/species"/(sid+".json")).exists()
        assert tool.sync(source,site,[loc])["new_species"]==1
        card=json.loads((site/"data/species"/(sid+".json")).read_text())
        assert card["panels"]==[] and len(card["tiles"])==1
        sid2="schizachyrium-scoparium"
        previous=json.loads((site/"data/species"/(sid2+".json")).read_text())
        old=f"content/taxa/Poaceae/Schizachyrium/{sid2}/species.json"
        o=source/old;o.parent.mkdir(parents=True,exist_ok=True)
        q={"id":sid2,"family":"Poaceae","genus":"Schizachyrium",
           "scientific_name":"Schizachyrium scoparium","common_name":"Little Bluestem CI test"}
        o.write_text(json.dumps(q))
        tool.sync(source,site,[old])
        after=json.loads((site/"data/species"/(sid2+".json")).read_text())
        assert after["panels"]==previous["panels"]
        assert after["tiles"]==previous["tiles"]
        assert after["steps"]==previous["steps"]
        assert after["common"]=="Little Bluestem CI test"
        sample["family"]="NotPoaceae";p.write_text(json.dumps(sample))
        try:tool.sync(source,site,[loc])
        except ValueError:pass
        else:raise AssertionError("Wrong family passed")
    print("PASS: automated grass card, no fake anatomy arrows, existing panels and steps preserved")
if __name__=="__main__":main()
