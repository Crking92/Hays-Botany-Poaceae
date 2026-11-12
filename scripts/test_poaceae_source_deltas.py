#!/usr/bin/env python3
"""Test exact post-import source deltas (does not authorize held photos)."""
from copy import deepcopy
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from poaceae_source_delta_integrity import MANIFEST, reconcile_source_deltas

ledger = json.loads((ROOT / "migration/source-file-ledger.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / MANIFEST).read_text(encoding="utf-8"))
verified = reconcile_source_deltas(ROOT, ledger, manifest)
assert len(verified) == 2
assert len({r["path"] for r in ledger}) == 1402
assert all(row["disposition"] == "SOURCE_DATA_COPIED" for row in (
    next(x for x in ledger if x["path"] == name) for name in verified
))


def must_reject(label, modify):
    example = deepcopy(manifest)
    modify(example)
    try:
        reconcile_source_deltas(ROOT, ledger, example)
    except ValueError:
        return
    raise AssertionError("unsafe source-delta manifest accepted: " + label)


must_reject("changed original hash", lambda m: m["records"][0].__setitem__(
    "source_import_git_blob_sha", "0" * 40))
must_reject("changed current hash", lambda m: m["records"][0].__setitem__(
    "documented_current_git_blob_sha", "f" * 40))
must_reject("changed size", lambda m: m["records"][0].__setitem__(
    "documented_current_bytes", 1))
must_reject("missing history evidence", lambda m: m["records"][0].__setitem__(
    "evidence_kind", "UNKNOWN"))
must_reject("unlicensed held photo as source-data edit", lambda m: m["records"][0].__setitem__(
    "path", "content/taxa/Poaceae/Bouteloua/bouteloua-rigidiseta/images/larry-allain-usgs-texas-grama-field-habit.jpg"))
must_reject("duplicate override", lambda m: m["records"].append(deepcopy(m["records"][0])))
must_reject("unexpected source path", lambda m: m["records"][0].__setitem__(
    "path", "content/taxa/Poaceae/not-original/species.json"))
must_reject("missing rights qualification", lambda m: m["records"][0].__setitem__(
    "rights_scope", ""))

print(json.dumps({
    "pass": True,
    "source_data_revisions_verified": len(verified),
    "negative_manifest_guards": 8,
    "original_import_ledger_changed": False,
    "held_photo_permissions_approved": False,
    "source_data_paths": sorted(verified),
}, indent=2))
