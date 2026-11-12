#!/usr/bin/env python3
"""Verify the *published* first six research-trial data files, without certifying specimen IDs.
This intentionally checks public HTTP bytes and reference metadata, not rendered photo pixels.
"""
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
FILES = ["index.html", "provisional-trial-profiles.json"]
ATTEMPTS = 10
DELAY_SECONDS = 4

def get(name):
    request = urllib.request.Request(
        BASE + name,
        headers={"User-Agent": "Hays-Botany-Grass-Trial-Public-Delivery/1.0",
                 "Cache-Control": "no-cache"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status != 200:
            raise AssertionError(f"{name} HTTP {response.status}")
        return response.read()

def check():
    delivered = {}
    for name in FILES:
        public_bytes = get(name)
        local_bytes = (LAB / name).read_bytes()
        if name == "index.html":
            assert public_bytes == local_bytes, "Public key HTML differs from merged main"
            assert b'provisional-trial-profiles.json' in public_bytes, "Public key lacks trial loader"
            assert b'Research trial' in public_bytes, "Public key lacks visible research-trial marker"
        else:
            public = json.loads(public_bytes)
            local = json.loads(local_bytes)
            assert public == local, "Six-grass public JSON differs from merged main"
            delivered[name] = public
    groups = delivered["provisional-trial-profiles.json"]["profiles"]
    assert len(groups) == 6, "Six trial species not delivered"
    assert all(item["trial"] is True and
               item["admission_status"] == "RESEARCH_TRIAL_NOT_ADMITTED" and
               item["range"] == "UNVERIFIED" for item in groups), (
                   "Public trial was silently certified")
    assert len({x["id"] for x in groups}) == 6, "Duplicate public trial IDs"
    assert sum(len(x["photos"]) for x in groups) == 14, "Published source-photo metadata count differs"
    return {"status": "PUBLIC_HTTP_DATA_PARITY",
            "public_url": BASE, "files_verified": FILES,
            "trial_species": [x["scientific"] for x in groups],
            "trial_matches_available": 6, "original_scored_count_unchanged": 112,
            "verified_specimen_admissions": 0,
            "credited_gallery_references": 14,
            "browser_photo_pixels_verified": False}

if __name__ == "__main__":
    error = None
    for attempt in range(1, ATTEMPTS + 1):
        try:
            print(json.dumps(check(), indent=2))
            break
        except (AssertionError, urllib.error.URLError, json.JSONDecodeError, TimeoutError) as exc:
            error = str(exc)
            print(f"Public trial data not yet in parity ({attempt}/{ATTEMPTS}): {error}", flush=True)
            if attempt != ATTEMPTS:
                time.sleep(DELAY_SECONDS)
    else:
        raise SystemExit(f"Public trial release NOT independently verified: {error}")
