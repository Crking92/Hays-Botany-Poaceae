#!/usr/bin/env python3
"""Read-only deployed 112+18 normal-key trial audit; no specimen or rights certification."""
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
FILES = ["index.html", "provisional-trial-profiles.json", "provisional-trial-batch2.json", "provisional-trial-batch3.json"]
ATTEMPTS = 12
DELAY_SECONDS = 5


def get(name):
    request = urllib.request.Request(
        BASE + name,
        headers={"User-Agent": "Hays-Botany-Grass-Trial-Public-Delivery/2.0",
                 "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=25) as response:
        if response.status != 200:
            raise AssertionError(f"{name} HTTP {response.status}")
        return response.read()


def http_check():
    delivered = {}
    for name in FILES:
        public_bytes = get(name)
        local_bytes = (LAB / name).read_bytes()
        if name == "index.html":
            assert public_bytes == local_bytes, "Public normal key HTML differs from current main"
            for token in [b"provisional-trial-profiles.json", b"provisional-trial-batch2.json", b"provisional-trial-batch3.json",
                          b"Research trial"]:
                assert token in public_bytes, f"Published key missing {token!r}"
        else:
            public = json.loads(public_bytes)
            local = json.loads(local_bytes)
            assert public == local, f"Published {name} differs from current main"
            delivered[name] = public
    six_a = delivered["provisional-trial-profiles.json"]["profiles"]
    six_b = delivered["provisional-trial-batch2.json"]["profiles"]
    six_c = delivered["provisional-trial-batch3.json"]["profiles"]
    groups = six_a + six_b + six_c
    assert len(six_a) == len(six_b) == len(six_c) == 6 and len(groups) == 18, "Eighteen trial profiles not delivered"
    assert len({x["id"] for x in groups}) == 18, "Duplicate trial IDs"
    assert all(x["trial"] is True and
               x["admission_status"] == "RESEARCH_TRIAL_NOT_ADMITTED" and
               x["range"] == "UNVERIFIED" for x in groups), "Trial data silently admitted/certified"
    # The publisher can legitimately add licensed photos. Keep the trial image
    # list an exact mirror of the corresponding candidate gallery, rather than
    # freezing a historical source-photo count of 38 forever.
    candidates = json.loads((LAB / "hays-candidates.json").read_text())["candidates"]
    by_id = {c["id"]: c for c in candidates}
    for trial in groups:
        ref = by_id[trial["id"]]["approved_gallery"]
        assert len(trial["photos"]) == len(ref), (
            f"{trial['id']}: source gallery / trial photo count mismatch")
        for i, photo in enumerate(trial["photos"]):
            assert photo["i"] == i, f"{trial['id']}: photo index mismatch"
            copied = {k: v for k, v in photo.items() if k != "i"}
            assert copied == ref[i], f"{trial['id']}: credits/source metadata diverged"
    assert sum(len(x["photos"]) for x in groups) >= 38, (
        "Original research-trial image coverage was unexpectedly removed")
    return groups


def browser_check(groups):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 390, "height": 844})
            page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_function(
                "() => document.querySelectorAll('#results .result').length === 130",
                timeout=45000)
            labels = page.locator("#results .result .tag").all_text_contents()
            assert sum("Research trial" in x and "unverified" in x for x in labels) == 18, (
                "Normal four-character key missing or relabeling its twelve research trials")
            matches = []
            for x in groups:
                scientific=x["scientific"]
                page.locator("#species-search").fill(scientific)
                rows=page.locator("#results .result").filter(has_text=scientific)
                assert rows.count() == 1, f"{scientific}: not exactly one normal-key result"
                row=rows.first
                assert "Research trial" in row.inner_text(), f"{scientific}: missing trial badge"
                row.click()
                dialog=page.locator("#detail-dialog")
                assert dialog.evaluate("(x) => x.open"), f"{scientific}: detail didn't open"
                detail=dialog.inner_text()
                assert "Not admitted to the officially scored 112" in detail, (
                    f"{scientific}: unverified detail notice missing")
                hrefs=dialog.locator("a[href]").evaluate_all("(nodes) => nodes.map(n => n.href)")
                for photo in x["photos"]:
                    assert photo["creator"] in detail and photo["license"] in detail, (
                        f"{scientific}: original named creator/license not visible")
                    assert any(unquote(link)==unquote(photo["source_page"]) for link in hrefs), (
                        f"{scientific}: source photo page missing")
                matches.append(scientific)
                page.get_by_role("button",name="Close species detail").click()
            return matches
        finally:
            browser.close()


def check():
    groups = http_check()
    visited = browser_check(groups)
    return {
        "status": "PUBLIC_HTTP_AND_BROWSER_18_TRIALS_VERIFIED",
        "public_url": BASE,
        "files_verified": FILES,
        "original_scored_count_unchanged": 112,
        "trial_matches_available": len(groups),
        "total_normal_key_results": 130,
        "total_learner_species": 169,
        "provisional_still_research_only": 39,
        "verified_specimen_admissions": 0,
        "trial_source_photo_refs": sum(len(x["photos"]) for x in groups),
        "research_trial_cards_and_details_checked": len(visited),
        "species_checked": visited,
        "browser_photo_pixels_verified": False,
        "important_limit": "Links, labels, metadata and UI tested. No Hays specimen ID, exact image rights or photo-pixel confirmation."
    }


if __name__ == "__main__":
    error = None
    for attempt in range(1, ATTEMPTS + 1):
        try:
            report = check()
            print(json.dumps(report, indent=2), flush=True)
            break
        except (AssertionError, urllib.error.URLError, json.JSONDecodeError, TimeoutError, Exception) as exc:
            error = f"{type(exc).__name__}: {exc}"
            print(f"Published 18-trial key not yet verified ({attempt}/{ATTEMPTS}): {error}", flush=True)
            if attempt != ATTEMPTS:
                time.sleep(DELAY_SECONDS)
    else:
        raise SystemExit(f"Public normal key not in verified 112+18 parity: {error}")
