#!/usr/bin/env python3
"""Read-only PUBLIC Pages verification of Grass ID Lab supplemental source photographs.

Uses exact file bytes and browser-visible photographs/credits, not gallery counts
or staged references as a proxy for publication. No new photos are downloaded
into the repository and no source records are modified.
"""
import argparse
import hashlib
import json
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/"
PUBLIC = BASE + "site/visual-key-lab/"
MANIFEST = "photo-general-archive-extras.json"
SHARDS = ["a", "b", "c1", "c2", "c3", "d1", "d2", "d3", "d4"]


def git_blob_sha1(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def local_records():
    manifest = json.loads((LAB / MANIFEST).read_text())
    assert manifest["schema"] == "HAYS_GRASS_GENERAL_PHOTO_ARCHIVE_EXTRAS_V1"
    assert len(manifest["photos"]) >= 9, "Previously verified general-photo extras missing"
    scored = [s for shard in SHARDS for s in json.loads((LAB / ("species-" + shard + ".json")).read_text())]
    assert len(scored) == 112 and len({s["id"] for s in scored}) == 112
    assert sum(len(s["photos"]) for s in scored) == 514, "Original scored photos were overwritten"
    by_id = {s["id"]: s for s in scored}
    known = set()
    images = set()
    for entry in manifest["photos"]:
        sid, p = entry["species_id"], entry["photo"]
        assert sid in by_id and not by_id[sid].get("trial"), f"Unexpected species {sid}"
        assert (sid, p["i"]) not in known, "Repeated species/photo index"
        assert p["src"] not in images, "Same photo double-counted"
        known.add((sid, p["i"]))
        images.add(p["src"])
        assert p["i"] > 0 and p["creator"] and p["license"] and p["source_page"]
        assert p["license_url"].startswith("https://")
        assert p["source_page"].startswith("https://")
        assert p["src"].startswith(BASE + "content/taxa/Poaceae/")
        rel = p["src"][len(BASE):]
        path = ROOT / rel
        assert path.is_file(), "Source family image missing: " + rel
        data = path.read_bytes()
        assert len(data) > 25000 and data.startswith(b"\xff\xd8\xff"), "Image not valid JPEG: " + rel
        assert git_blob_sha1(data) == p["hosted_git_blob_sha"], "Source image hash mismatch: " + rel
        if p["creator"] == "Tom Chester":
            assert p["license_url"] == "https://tchester.org/gc/plants/species/erioneuron_pilosum.html"
            assert "permission" in p["license"].lower() and "not CC" in p["license"]
        if p["creator"] == "Joey Santore":
            assert p["license"] == "CC BY-NC 4.0"
            assert p["license_url"] == "https://creativecommons.org/licenses/by-nc/4.0/"
    return manifest, by_id


def fetch(url, *, attempts=1):
    assert url.startswith(BASE), "Refusing unrelated URL: " + url
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(
                url, headers={"Cache-Control": "no-cache",
                              "User-Agent": "HaysBotanyGrassArchivePublicPhotoQA/1.0"})
            with urllib.request.urlopen(req, timeout=35) as r:
                assert r.status == 200, f"HTTP {r.status}: {url}"
                data = r.read(22_000_000)
                assert len(data) < 22_000_000, "Unexpectedly large hosted photo"
                return data
        except Exception as exc:
            last = exc
            if attempt + 1 < attempts:
                time.sleep(4)
    raise RuntimeError(f"Public URL unavailable: {url}: {last}")


def remote_parity(manifest):
    local_html = (LAB / "index.html").read_bytes()
    local_manifest = (LAB / MANIFEST).read_bytes()
    local_review = (LAB / "photo-review.html").read_bytes()
    last = None
    for attempt in range(24):
        try:
            live_html = fetch(PUBLIC + "index.html")
            live_manifest = fetch(PUBLIC + MANIFEST)
            live_review = fetch(PUBLIC + "photo-review.html")
            assert live_html == local_html, "Public Grass ID key HTML is not at this commit"
            assert live_manifest == local_manifest, "Public photo manifest does not match main"
            assert live_review == local_review, "Public photo review page does not match main"
            assert b"applyApprovedGeneralPhotos" in live_html
            assert b"photo-general-archive-extras.json" in live_html
            break
        except Exception as exc:
            last = exc
            print(f"WAIT_FOR_PAGES_PHOTO_PARITY {attempt+1}/24 {exc}", flush=True)
            time.sleep(6)
    else:
        raise AssertionError(f"Published photo supplement was not deployed: {last}")
    verified = 0
    for entry in manifest["photos"]:
        p = entry["photo"]
        live = fetch(p["src"], attempts=3)
        assert live.startswith(b"\xff\xd8\xff"), "Published file not a JPEG: " + p["src"]
        assert git_blob_sha1(live) == p["hosted_git_blob_sha"], (
            "Published photo pixels do not match approved Git file: " + p["src"])
        verified += 1
    print(f"LIVE_PHOTO_FILE_BYTES_VERIFIED {verified}/{len(manifest['photos'])}", flush=True)
    return verified


def browser_photo_cards(manifest, by_id):
    from playwright.sync_api import sync_playwright

    groups = defaultdict(list)
    for entry in manifest["photos"]:
        groups[entry["species_id"]].append(entry["photo"])
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            for width, height in [(1280, 900), (390, 844)]:
                page = browser.new_page(viewport={"width": width, "height": height})
                page.goto(PUBLIC + "index.html", wait_until="domcontentloaded", timeout=70000)
                page.wait_for_function(
                    "() => document.querySelectorAll('#results .result').length === 169",
                    timeout=70000)
                for sid, photos in groups.items():
                    scientific = by_id[sid]["scientific"]
                    page.locator("#species-search").fill(scientific)
                    row = page.locator("#results .result").filter(has_text=scientific)
                    assert row.count() == 1, f"{scientific}: not one public grass result"
                    row.first.click()
                    dialog = page.locator("#detail-dialog")
                    assert dialog.evaluate("(x) => x.open"), "Gallery did not open for " + sid
                    gallery_images = dialog.locator(".detail-grid img")
                    expected_total = len(by_id[sid]["photos"]) + len(photos)
                    assert expected_total <= 4, sid + ": more photos than the detail modal displays"
                    assert gallery_images.count() == expected_total, (
                        f"{sid}: {gallery_images.count()} photo elements, expected {expected_total}")
                    actual_sources = gallery_images.evaluate_all(
                        "(images) => images.map(image => image.currentSrc || image.src)")
                    hrefs = dialog.locator("a[href]").evaluate_all(
                        "(links) => links.map(link => decodeURIComponent(link.href))")
                    gallery_text = dialog.inner_text()
                    for p in photos:
                        assert p["src"] in actual_sources, sid + ": approved photo not rendered in public card"
                        assert p["creator"] in gallery_text and p["license"] in gallery_text, (
                            sid + ": displayed photo credit or license missing")
                        assert urllib.parse.unquote(p["source_page"]) in hrefs, (
                            sid + ": direct original source link missing")
                        assert urllib.parse.unquote(p["license_url"]) in hrefs, (
                            sid + ": actual license / author permission URL missing")
                    for i in range(gallery_images.count()):
                        img = gallery_images.nth(i)
                        img.scroll_into_view_if_needed()
                        page.wait_for_function(
                            """(i) => {
                              const img = document.querySelectorAll('#detail-dialog .detail-grid img')[i];
                              return !!img && img.complete && img.naturalWidth > 40 && img.naturalHeight > 40;
                            }""", arg=i, timeout=35000)
                    results.append(f"{sid}@{width}")
                    page.get_by_role("button", name="Close species detail").click()
                page.close()
        finally:
            browser.close()
    assert len(results) == len(groups) * 2
    print("LIVE_BROWSER_PHOTO_GALLERIES_VISIBLE_AND_CREDITED",
          json.dumps({"cards_verified": len(results),
                      "unique_species": len(groups),
                      "viewports": [1280, 390],
                      "species_checks": results}), flush=True)



def browser_review_page(manifest):
    """Confirm the review interface itself is visible, searchable and fully attributed."""
    from playwright.sync_api import sync_playwright
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            for width, height in [(1280, 900), (390, 844)]:
                page = browser.new_page(viewport={"width": width, "height": height})
                page_errors = []
                page.on("pageerror", lambda error: page_errors.append(str(error)))
                page.goto(PUBLIC + "photo-review.html", wait_until="domcontentloaded", timeout=70000)
                page.wait_for_function(
                    "() => document.querySelector('#total')?.textContent === '169' && document.querySelectorAll('#cards .card').length > 0",
                    timeout=70000)
                assert int(page.locator("#photographed").inner_text()) >= 160, "Photos not in the public review gallery"
                assert page.locator("#holds").inner_text().strip() == "5", "Withheld images incorrectly promoted"
                assert page.locator("a[href='index.html']").count() == 1, "No link back to main identification key"
                for scientific,creator in [
                    ("Muhlenbergia reverchonii", "Sam Kieschnick"),
                    ("Bromus lanceolatus", "Tyler Cannon"),
                ]:
                    page.locator("#search").fill(scientific)
                    card = page.locator("#cards .card")
                    assert card.count() == 1, scientific + ": should be one search result"
                    assert creator in card.inner_text(), scientific + ": photo creator not shown"
                    assert "Original scored" in card.inner_text(), scientific + ": source scored status missing"
                    card.locator("details summary").click()
                    assert card.locator(".extra-grid .photo").count() == 3, scientific + ": source photo sequence incomplete"
                    for img in card.locator(".extra-grid img").all():
                        img.scroll_into_view_if_needed()
                        page.wait_for_function(
                            "(src) => [...document.querySelectorAll('#cards .extra-grid img')].some(x => x.src === src && x.complete && x.naturalWidth > 40)",
                            arg=img.get_attribute("src"), timeout=30000)
                    assert card.locator("a").filter(has_text="Photo source").count() >= 3, scientific + ": source link absent"
                    assert card.locator("a").filter(has_text="Reuse terms").count() >= 3, scientific + ": license link absent"
                page.locator("#search").fill("Bromus brevis")
                page.locator('button[data-filter="gaps"]').click()
                assert page.locator("#cards .card").count() == 1
                assert "No approved photograph" in page.locator("#cards .card").inner_text(), "Held research photo invented"
                page.locator("#theme").click()
                assert page.locator("html").get_attribute("data-theme") == "dark", "Dark review mode broken"
                if width < 500:
                    assert page.evaluate("document.documentElement.scrollWidth-innerWidth") < 10, "Mobile gallery overflows"
                assert not page_errors, "Photo review browser errors: " + repr(page_errors)
                results.append({"width":width,"scientific_cards_checked":2,"held_photo_status":"NO_IMAGE","dark_mode":"PASS"})
                page.close()
        finally:
            browser.close()
    print("LIVE_PHOTO_REVIEW_PAGE_VISIBLE", json.dumps(results), flush=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--local-only", action="store_true")
    args = parser.parse_args()
    manifest, scored = local_records()
    if args.local_only:
        print("PASS_LOCAL_SOURCE_VERIFIED_PHOTO_FILES", len(manifest["photos"]), flush=True)
        return
    n = remote_parity(manifest)
    browser_photo_cards(manifest, scored)
    browser_review_page(manifest)
    print(json.dumps({"status": "PASS", "public_photo_files_byte_verified": n,
                      "scored_source_photo_refs_unchanged": 514,
                      "source_published": PUBLIC,
                      "warning": "Source-photo general ID and license records are not same-plant specimen vouchers."}),
          flush=True)


if __name__ == "__main__":
    main()
