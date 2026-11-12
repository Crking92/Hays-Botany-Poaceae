#!/usr/bin/env python3
"""Read-only checks of publicly delivered Hays Grass gallery images.

Uses HEAD for photo assets (does not repeatedly download image bodies).
Public transport status is NOT evidence of botanical ID, correct arrows, or reuse rights.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/"
REV = os.environ.get("GITHUB_SHA", "manual-review")


def get_json(relative):
    url = BASE + relative + "?grass_gallery_qa=" + REV
    request = urllib.request.Request(url, headers={
        "User-Agent": "HaysGrassPublicPhotoPresence/1.0",
        "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=25) as response:
        assert response.status == 200, f"{relative}: HTTP {response.status}"
        return json.loads(response.read())


def check_photo(url):
    problem = None
    for attempt in range(2):
        try:
            request = urllib.request.Request(url, method="HEAD", headers={
                "User-Agent": "HaysGrassPublicPhotoPresence/1.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                content_type = (response.headers.get("Content-Type") or "").lower()
                content_length = response.headers.get("Content-Length")
                if response.status != 200 or not content_type.startswith("image/"):
                    raise AssertionError(f"HTTP {response.status}, type {content_type}")
                if content_length and int(content_length) < 500:
                    raise AssertionError(f"implausibly small image length {content_length}")
                return (url, None)
        except Exception as error:
            problem = str(error)
            if attempt == 0:
                time.sleep(1)
    return (url, problem)


def audit():
    local_release = json.loads((ROOT / "site/data/poaceae-release.json").read_text())
    local_gallery = json.loads((ROOT / "site/data/gallery-index.json").read_text())
    release = get_json("data/poaceae-release.json")
    gallery = get_json("data/gallery-index.json")
    assert release == local_release, "public release metadata differs from main"
    assert gallery == local_gallery, "public gallery index differs from main"
    assert release["species"] == gallery["species"] == 112
    assert release["species_with_visible_photos"] == gallery["photo_species"] == 112

    public_index = get_json("data/poaceae-index.json")
    assert len(public_index) == 112
    expected_ids = set(gallery["entries"])
    assert expected_ids == {r["id"] for r in public_index}
    held = json.loads((ROOT / "migration/source-file-ledger.json").read_text())
    held_paths = {row["path"] for row in held
                  if row["disposition"] == "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"}
    urls = set()
    panels = 0
    panel_species = 0
    for sid in sorted(expected_ids):
        card = get_json("data/species/" + sid + ".json")
        assert card["id"] == sid
        parts = card.get("panels", [])
        assert len(parts) == gallery["entries"][sid]["count"]
        if parts:
            panel_species += 1
        for panel in parts:
            assert panel.get("creator") and panel.get("license") and panel.get("source_page"), (
                f"{sid}: a photo lacks visible attribution metadata")
            src = panel["src"]
            assert not src.startswith(("http://", "https://")), (
                f"{sid}: unexpected external source path")
            url = urllib.parse.urljoin(BASE, src)
            parsed = urllib.parse.urlparse(url)
            for held_path in held_paths:
                assert not parsed.path.endswith("/" + held_path), (
                    f"Rights-held source published in gallery: {held_path}")
            urls.add(url)
            panels += 1
    assert panel_species == 112
    assert panels == release["photo_panels_visible"] == gallery["photo_panels"]
    assert len(urls) == release["photo_files_referenced_on_public_site"] == gallery["photo_files"]
    failures = []
    with ThreadPoolExecutor(max_workers=12) as pool:
        for url, error in pool.map(check_photo, sorted(urls)):
            if error:
                failures.append({"url":url, "error":error})
    assert not failures, "Public image HEAD failures: " + json.dumps(failures[:10])
    return {
        "pass":True,
        "public_gallery_species":panel_species,
        "actual_public_photo_heads_ok":len(urls),
        "published_photo_panels":panels,
        "held_photo_references_in_gallery":0,
        "release_index_and_cards_parity":True,
        "method":"PUBLIC_JSON_AND_HTTP_HEAD_NO_MEDIA_BODY_DOWNLOAD",
        "not_verified":["photo pixels","anatomical labels","species identification","current exact photo licenses"]
    }


if __name__ == "__main__":
    print(json.dumps(audit(), indent=2))
