"""Exact-blob post-import source-history reconciliation.

Only SOURCE_DATA_COPIED JSON/CSV revisions may be accounted for. This is not
a license decision, photograph approval, or amendment of original import hashes.
"""
from __future__ import annotations

from hashlib import sha1
from pathlib import Path
import json
import re

MANIFEST = "migration/documented-post-import-source-deltas-20261112.json"
SCHEMA = "hays-poaceae-documented-post-import-source-deltas-v1"
HEX40 = re.compile(r"^[0-9a-f]{40}$")


def git_blob_identity(path: Path):
    size = path.stat().st_size
    h = sha1(b"blob " + str(size).encode("ascii") + b"\0")
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest(), size


def reconcile_source_deltas(root: Path, ledger: list, manifest: dict | None = None) -> dict:
    """Fail closed unless all pinned import and current identities match exactly.

    Returns a lookup keyed by source-data path. The caller still enforces all
    unrelated held-image, rights, source-credit, and geometry integrity checks.
    """
    root = root.resolve()
    if manifest is None:
        manifest = json.loads((root / MANIFEST).read_text(encoding="utf-8"))
    if manifest.get("schema") != SCHEMA:
        raise ValueError("unexpected post-import source-delta schema")
    entries = manifest.get("records")
    if not isinstance(entries, list) or not entries:
        raise ValueError("source-delta manifest must contain explicit records")
    originals = {r["path"]: r for r in ledger}
    if len(originals) != len(ledger):
        raise ValueError("original source ledger contains duplicate paths")
    result = {}
    for entry in entries:
        path = entry.get("path")
        if not isinstance(path, str) or path in result:
            raise ValueError("missing or duplicate source-delta path")
        if (
            not path.startswith("content/taxa/Poaceae/")
            or Path(path).is_absolute()
            or ".." in Path(path).parts
            or Path(path).suffix.lower() not in {".json", ".csv"}
        ):
            raise ValueError("source-delta path not a canonical Poaceae data file: " + path)
        original = originals.get(path)
        if not original or original["disposition"] != "SOURCE_DATA_COPIED":
            raise ValueError("source-delta path not original copied source data: " + path)
        if entry.get("disposition") != original["disposition"]:
            raise ValueError("source-delta disposition mismatch: " + path)
        if (
            entry.get("source_import_git_blob_sha") != original["git_blob_sha"]
            or entry.get("source_import_bytes") != original["bytes"]
        ):
            raise ValueError("source-delta import identity disagrees with immutable ledger: " + path)
        old_sha = entry["source_import_git_blob_sha"]
        current_sha = entry.get("documented_current_git_blob_sha")
        if (
            not all(isinstance(s, str) and HEX40.fullmatch(s) for s in
                    (old_sha, current_sha, entry.get("change_commit"), entry.get("change_parent")))
            or current_sha == old_sha
        ):
            raise ValueError("source-delta has missing/invalid commit or changed blob identity: " + path)
        if entry.get("evidence_kind") != "COMMIT_PARENT_SHA_AND_PATCH_CHECKED":
            raise ValueError("source-delta has no documented commit review: " + path)
        if not entry.get("change_summary") or not entry.get("rights_scope"):
            raise ValueError("source-delta evidence/rights qualification missing: " + path)
        file_path = root / path
        if not file_path.is_file():
            raise ValueError("documented source-data file missing: " + path)
        actual_sha, actual_bytes = git_blob_identity(file_path)
        if (actual_sha != current_sha
                or actual_bytes != entry.get("documented_current_bytes")):
            raise ValueError("documented source-delta no longer matches actual bytes: " + path)
        result[path] = entry
    return result
