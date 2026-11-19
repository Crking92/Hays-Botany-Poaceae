#!/usr/bin/env python3
"""Replay the owner's November 18 Lindheimer's muhly field choices in the actual DOM.

Read-only: no botanical edits, media modifications, or source assumptions.
The original final visitor result was 1 supported / 14 still possible; that
count is a recorded human checkpoint, NOT a baked-in expectation now.
"""
from __future__ import annotations

import json
import os
import re
from urllib.parse import urlencode, urlsplit, urlunsplit, parse_qsl

from playwright.sync_api import sync_playwright

DEFAULT_URL = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/index.html"
BASE_URL = os.environ.get("HAYS_GRASS_TEST_URL", DEFAULT_URL)
PICKS = {
    "head": "long_narrow_panicle",
    "habit": "tuft",
    "ligule": "membrane",
    "awns": "none_obvious",
    "more_blade_width": "narrow",     # 2–5 mm (unfolded blade)
    "more_blade_shape": "folded",     # V-shaped blade
    # IMPORTANT: neither leaf-vein nor optional ligule-edge answer was chosen
    "more_blade_hairs": "blade_hairy", # Along the blade
    "more_ligule_length": "long",     # >8 mm true inner ligule
}


def replay_url(base):
    parts = urlsplit(base)
    existing = [(k, v) for k, v in parse_qsl(parts.query)
                if k not in PICKS and k not in ("more_blade_venation", "more_ligule_edge",
                                               "more_mode", "focus")]
    return urlunsplit((parts.scheme, parts.netloc, parts.path,
                      urlencode(existing + list(PICKS.items())), parts.fragment))


def inspect(page):
    page.goto(replay_url(BASE_URL), wait_until="domcontentloaded", timeout=75000)
    page.wait_for_function("""() =>
        document.querySelector('#coded-total')?.textContent === '169' &&
        document.querySelector('#results .progressive-status') &&
        document.querySelector('#results .progressive-status').textContent.includes('unresolved')""",
        timeout=85000)
    summary = page.locator("#results .progressive-status").inner_text()
    found = re.search(r"(\d+) supported match(?:es)? · (\d+) unresolved · (\d+) advanced source conflict(?:s)?", summary)
    assert found, "Cannot read authoritative three-bucket result: " + summary
    supported, unresolved, conflicts = map(int, found.groups())
    assert supported + unresolved + conflicts <= 169, "Active source conflicts exceed roster"
    # Report ONLY actual names rendered in the result groups.
    supported_names = page.locator("#results > .result-row .result .latin").all_inner_texts()
    unresolved_names = page.locator("#unresolved-candidates .result .latin").all_inner_texts()
    assert len(supported_names) == supported, (supported_names, supported, summary)
    assert len(unresolved_names) == unresolved, (unresolved_names, unresolved, summary)
    assert sum([supported, unresolved]) == int(
        page.locator("#count").inner_text().split()[0]), "Possible counter disagrees with DOM"
    for k, v in PICKS.items():
        assert f"{k}={v}" in page.url, f"Selected field choice missing from shared URL: {k}"
    for missing in ("more_blade_venation=", "more_ligule_edge="):
        assert missing not in page.url, "An uncertain character was accidentally selected: " + missing
    assert supported_names == ["Muhlenbergia lindheimeri"], (
        "Lindheimer's muhly no longer the sole supported match: " + repr(supported_names)
    )
    return {
      "date_of_original_field_checkpoint": "2026-11-18",
      "original_supported": 1,
      "original_still_possible": 14,
      "replayed_picks": PICKS,
      "mode": "ALL_169_NOT_DOCUMENTED_ONLY",
      "supported_count": supported,
      "supported_species": supported_names,
      "still_possible_count": unresolved,
      "still_possible_species": unresolved_names,
      "advanced_source_conflict_count": conflicts,
      "all_other_core_ruled_out_count": 169 - supported - unresolved - conflicts,
      "vs_original_still_possible": unresolved - 14,
      "shared_url": page.url,
    }


if __name__ == "__main__":
    with sync_playwright() as p:
        launch_options = {"headless": True}
        chrome_channel = os.environ.get("HAYS_GRASS_BROWSER_CHANNEL")
        if chrome_channel:
            launch_options["channel"] = chrome_channel
        browser = p.chromium.launch(**launch_options)
        try:
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            result = inspect(page)
        finally:
            browser.close()
    print("LINDHEIMER_REPLAY_20261119 " + json.dumps(result, sort_keys=True), flush=True)
