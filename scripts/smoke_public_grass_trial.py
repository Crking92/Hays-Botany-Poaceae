#!/usr/bin/env python3
"""Read-only deployed 112+53+4 unified-key trial audit; no specimen or rights certification."""
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
FILES = ["index.html", "promotion-review-37-20261116.json", "source-scored-admissions.json", "ready-core-gap-assignments.json", "source-scored-gould-followup-20261116.json", "focused-identity-review-20261116.json", "source-scored-bromus-brevis-20261116.json", "source-scored-final-three-20261116.json", "provisional-trial-profiles.json", "provisional-trial-batch2.json", "provisional-trial-batch3.json", "provisional-trial-batch4.json", "provisional-trial-batch5-a.json", "provisional-trial-batch5-b.json", "provisional-trial-batch5-c.json"]
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
            for token in [b"provisional-trial-profiles.json", b"provisional-trial-batch2.json", b"provisional-trial-batch3.json", b"provisional-trial-batch4.json", b"provisional-trial-batch5-a.json", b"provisional-trial-batch5-b.json", b"provisional-trial-batch5-c.json",
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
    six_d = delivered["provisional-trial-batch4.json"]["profiles"]
    batch5_a = delivered["provisional-trial-batch5-a.json"]["profiles"]
    batch5_b = delivered["provisional-trial-batch5-b.json"]["profiles"]
    batch5_c = delivered["provisional-trial-batch5-c.json"]["profiles"]
    groups = six_a + six_b + six_c + six_d + batch5_a + batch5_b + batch5_c
    assert [len(x) for x in [six_a, six_b, six_c, six_d, batch5_a, batch5_b, batch5_c]] == [6, 6, 6, 6, 11, 10, 8], "Seven trial cohorts not fully delivered"
    assert len(groups) == 53 and len({x["id"] for x in groups}) == 53, "Missing or duplicate research trial IDs"
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
    promotions = delivered["source-scored-admissions.json"]["admissions"]
    assert len(promotions) == 37 and all(x["admission_level"] == "SOURCE_SCORED_NOT_LOCAL_VOUCHER" for x in promotions)
    historical_ids = {x["id"] for x in promotions}
    followup = delivered["source-scored-gould-followup-20261116.json"]
    assert followup["schema"] == "HAYS_GRASS_GOULD_TARGETED_ADMISSIONS_V1"
    assert len(followup["admissions"]) == 13
    added_ids = {x["id"] for x in followup["admissions"]}
    assert len(added_ids) == 13 and historical_ids.isdisjoint(added_ids)
    focused = delivered["focused-identity-review-20261116.json"]
    assert focused["schema"] == "HAYS_GRASS_FOCUSED_IDENTITY_ADMISSIONS_V1"
    focused_ids = {x["id"] for x in focused["admissions"]}
    assert focused_ids == {"bothriochloa-longipaniculata", "panicum-miliaceum"}
    assert focused_ids.isdisjoint(historical_ids | added_ids)
    promoted_ids = historical_ids | added_ids | focused_ids
    assert len(promoted_ids) == 52
    assert promoted_ids <= {x["id"] for x in groups}
    review = delivered["promotion-review-37-20261116.json"]
    assert review["approved_count"] == 33 and review["hold_count"] == 4
    older_holds = {x["id"] for x in review["reviewed"] if x["decision"].startswith("HOLD_")}
    assert older_holds.isdisjoint(historical_ids), "Historical admissions altered"
    assert (older_holds - {"cenchrus-ciliaris"} - focused_ids) == {"dichanthelium-acuminatum"}
    assert "cenchrus-ciliaris" in added_ids
    assert set(followup["unresolved_species_holds"]) - focused_ids == set(focused["remaining_holds"])
    assert not set(focused["remaining_holds"]).intersection(promoted_ids)
    brome = delivered["source-scored-bromus-brevis-20261116.json"]
    assert brome["schema"] == "HAYS_GRASS_BROMUS_BREVIS_TARGETED_ADMISSION_V1"
    assert brome["admission"]["id"] == "bromus-brevis"
    assert brome["total_source_scored_after_release"] == 165
    assert set(focused["remaining_holds"]) - {"bromus-brevis"} == set(brome["remaining_holds"])
    final = delivered["source-scored-final-three-20261116.json"]
    assert final["schema"] == "HAYS_GRASS_FINAL_THREE_TAXON_SCOPE_V1"
    final_ids = {a["id"] for a in final["admissions"]}
    assert final_ids == {"phyllostachys-aurea", "cortaderia-selloana", "dichanthelium-acuminatum"}
    assert final["total_source_scored_after_release"] == 168
    assert set(brome["remaining_holds"]) - final_ids == {"lolium-x-boucheanum"}
    assert set(final["remaining_exact_hybrid_taxonomic_hold"]) == {"lolium-x-boucheanum"}
    gaps = delivered["ready-core-gap-assignments.json"]
    assert gaps["schema"] == "HAYS_GRASS_READY_CORE_GAPS_V1"
    assert len(gaps["rows"]) == 28 and len(gaps["held_unknown"]) == 13
    return groups, promoted_ids


def browser_check(groups,promoted_ids):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 390, "height": 844})
            page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_function(
                "() => document.querySelectorAll('#results .result').length === 169",
                timeout=45000)
            labels = page.locator("#results .result .tag").all_text_contents()
            assert sum("Research trial" in x and "unverified" in x for x in labels) == 1, (
                "Unified 169 key missing one narrowly scoped hybrid taxonomic hold")
            assert sum("Source-scored" in x for x in labels) == 56, (
                "Fifty-six literature-scored profiles not labeled separately from source trials")
            matches = []
            for x in groups:
                scientific=x["scientific"]
                page.locator("#species-search").fill(scientific)
                rows=page.locator("#results .result").filter(has_text=scientific)
                assert rows.count() == 1, f"{scientific}: not exactly one normal-key result"
                row=rows.first
                if x["id"] in promoted_ids:
                    assert "Source-scored" in row.inner_text(), f"{scientific}: missing literature-scored badge"
                else:
                    assert "Research trial" in row.inner_text(), f"{scientific}: missing trial badge"
                row.click()
                dialog=page.locator("#detail-dialog")
                assert dialog.evaluate("(x) => x.open"), f"{scientific}: detail didn't open"
                detail=dialog.inner_text()
                if x["id"] in promoted_ids:
                    assert "Source-scored" in detail and "Source-scored character evidence" in detail, (
                        f"{scientific}: cited literature admission not displayed")
                    assert "NOT a Hays County specimen voucher" in detail, (
                        f"{scientific}: publication wrongly implies local voucher")
                else:
                    assert "Research trial · unverified" in detail, (
                        f"{scientific}: unverified detail badge missing")
                    assert "Identification data still being checked." in detail, (
                        f"{scientific}: pending identification notice missing")
                hrefs=dialog.locator("a[href]").evaluate_all("(nodes) => nodes.map(n => n.href)")
                for photo in x["photos"]:
                    assert photo["creator"] in detail and photo["license"] in detail, (
                        f"{scientific}: original named creator/license not visible")
                    assert any(unquote(link)==unquote(photo["source_page"]) for link in hrefs), (
                        f"{scientific}: source photo page missing")
                matches.append(scientific)
                page.get_by_role("button",name="Close species detail").click()
            page.locator("#species-search").fill("Bromus brevis")
            brome_row=page.locator("#results .result")
            assert brome_row.count() == 1 and "Source-scored" in brome_row.first.inner_text()
            brome_row.first.click()
            brome_detail=page.locator("#detail-dialog")
            assert "NOT a Hays County specimen voucher" in brome_detail.inner_text()
            assert "Harry Rose" in brome_detail.inner_text()
            assert brome_detail.locator(".detail-grid img").count() == 3
            page.get_by_role("button",name="Close species detail").click()
            for scientific, photos in [
                ("Dichanthelium acuminatum", 3), ("Phyllostachys aurea", 2),
                ("Cortaderia selloana", 2)]:
                page.locator("#species-search").fill(scientific)
                matches_row=page.locator("#results .result")
                assert matches_row.count() == 1 and "Source-scored" in matches_row.first.inner_text()
                matches_row.first.click()
                dlg=page.locator("#detail-dialog")
                assert "NOT a Hays County specimen voucher" in dlg.inner_text()
                assert dlg.locator(".detail-grid img").count() == photos
                if scientific == "Phyllostachys aurea":
                    assert "Flowers are extremely rare" in dlg.inner_text()
                    assert "Awns / bristles" in dlg.inner_text()
                if scientific == "Dichanthelium acuminatum":
                    assert "BROAD-COMPLEX" in dlg.inner_text()
                page.get_by_role("button",name="Close species detail").click()
            page.locator("#species-search").fill("Lolium × boucheanum")
            assert page.locator("#results .result").count() == 1
            assert "Research trial" in page.locator("#results .result").first.inner_text()
            return matches
        finally:
            browser.close()


def check():
    groups,promoted_ids = http_check()
    visited = browser_check(groups,promoted_ids)
    return {
        "status": "PUBLIC_HTTP_AND_BROWSER_53_ORIGINAL_TRIAL_PACKETS_WITH_52_LITERATURE_ADMISSIONS_VERIFIED",
        "public_url": BASE,
        "files_verified": FILES,
        "original_scored_count_unchanged": 112,
        "historical_source_trial_packets_preserved": len(groups),
        "source_scored_admissions_displayed": len(promoted_ids) + 4,
        "research_only_including_four_manifest_holds": 57 - len(promoted_ids) - 4,
        "total_normal_key_results": 169,
        "total_learner_species": 169,
        "photo_held_research_profiles_in_key": 4,
        "verified_specimen_admissions": 0,
        "trial_source_photo_refs": sum(len(x["photos"]) for x in groups),
        "former_trial_source_cards_and_details_checked": len(visited),
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
            print(f"Published 53-trial key not yet verified ({attempt}/{ATTEMPTS}): {error}", flush=True)
            if attempt != ATTEMPTS:
                time.sleep(DELAY_SECONDS)
    else:
        raise SystemExit(f"Public normal key not in verified 112+53+4 parity: {error}")
