#!/usr/bin/env python3
"""Test the real Grass ID Lab visitor DOM, on a local preview or PUBLIC Pages.

No research, images, photo rights or species records modified. Explicitly check
actual browser interactions and visible images, not just static source parsing.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
URL = os.environ.get("HAYS_GRASS_TEST_URL", BASE + "index.html")
LIVE = os.environ.get("HAYS_GRASS_TEST_LIVE", "0") == "1"
REPORT = ROOT / "qa-report"
REPORT.mkdir(exist_ok=True)


def published_html_parity():
    expected = hashlib.sha256((ROOT / "site/visual-key-lab/index.html").read_bytes()).digest()
    last_error = None
    for attempt in range(1, 19):
        try:
            req = urllib.request.Request(
                BASE + "index.html?grass_visitor_ver=" + os.environ.get("GITHUB_SHA", "check"),
                headers={"User-Agent": "Hays-Grass-Visitor-Live-Browser-QA/1.0",
                         "Cache-Control": "no-cache"},
            )
            with urllib.request.urlopen(req, timeout=25) as response:
                assert response.status == 200, "Public key HTML returned non-200"
                data = response.read()
            assert hashlib.sha256(data).digest() == expected, (
                "Public Grass ID Lab HTML does not yet match this main commit")
            print("PASS PUBLIC_KEY_HTML_PARITY", len(data), flush=True)
            return
        except (AssertionError, urllib.error.URLError, TimeoutError) as exc:
            last_error = str(exc)
            if attempt < 18:
                print("WAIT_PUBLIC_PAGES_PARITY", attempt, last_error, flush=True)
                time.sleep(8)
    raise AssertionError("Published Grass key not updated: " + str(last_error))


def buckets(page):
    txt = page.locator("#results .progressive-status").inner_text(timeout=12000)
    numbers = re.findall(r"(\d+) (?:supported match|unresolved|advanced source conflict)", txt)
    assert len(numbers) == 3, "Bad three-bucket summary: " + txt
    return tuple(map(int, numbers))


def choose_extra(page, section: str, character: str, choice: str):
    wrapper = page.locator("#optional-character-wrap")
    if not wrapper.evaluate("(element) => element.open"):
        wrapper.locator("summary").first.click()
    nav = page.locator("#optional-section-tabs button").filter(has_text=section)
    nav.first.click()
    group = page.locator(f'#optional-character-groups .optional-group[data-character="{character}"]')
    assert group.count() == 1, f"{character}: not one visible group"
    if not group.evaluate("(element) => element.open"):
        group.locator("summary").click()
    button = group.locator(f'button[data-option="{choice}"]')
    assert button.count() == 1, f"{character}/{choice}: absent or duplicated option"
    button.click()
    assert button.get_attribute("aria-pressed") == "true", f"{character}/{choice}: not selected"


def check_view(browser, name, width, height):
    ctx = browser.new_context(viewport={"width": width, "height": height})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    response = page.goto(URL, wait_until="domcontentloaded", timeout=65000)
    assert response and response.status == 200, f"{name}: key URL not served"
    page.wait_for_function(
        "() => document.querySelector('#coded-total')?.textContent === '169' && "
        "document.querySelectorAll('#results .result').length === 169 && "
        "document.querySelectorAll('#optional-character-groups .optional-group').length > 0",
        timeout=75000,
    )
    assert page.locator("#count").inner_text() == "169 possible"
    assert page.locator("#reset-field-key").is_visible(), "One-click reset missing"
    assert "164 source-scored, 5 research-only" in page.locator("#coded-subtitle").inner_text(), (
        "Scored vs research totals did not update in the actual visitor UI")

    # Test the new admitted species in the actual browser, not just source JSON.
    page.locator("#species-search").fill("Setaria viridis")
    page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
    line = page.locator("#results .result").first
    assert "Source-scored" in line.inner_text() and "Research trial" not in line.inner_text(), (
        "Promoted species still looks like a provisional research trial")
    line.click()
    admission = page.locator("#detail-dialog")
    assert admission.evaluate("(dlg)=>dlg.open")
    assert "Source-scored character evidence" in admission.inner_text()
    assert admission.locator("section.detail-botany a[href^='https://']").count() >= 4, (
        "Admission evidence pages not linked in visitor species detail")
    assert admission.locator(".detail-grid img").count() >= 2, "Existing credited source photos were truncated"
    admission.get_by_role("button",name="Close species detail").click()
    page.locator("#species-search").fill("Cenchrus ciliaris")
    page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
    assert "Source-scored" in page.locator("#results .result").first.inner_text(), ("Buffelgrass source-scored option was not admitted")
    # Fresh targeted releases must show as cited literature, not false local vouchers.
    for scientific in ("Bothriochloa longipaniculata", "Panicum miliaceum"):
        page.locator("#species-search").fill(scientific)
        page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
        assert "Source-scored" in page.locator("#results .result").first.inner_text(), (
            scientific + ": newly verified literature admission absent")
        page.locator("#results .result").first.click()
        modal=page.locator("#detail-dialog")
        assert "NOT a Hays County specimen voucher" in modal.inner_text()
        assert modal.locator("section.detail-botany a[href^='https://']").count() >= 4
        assert "Compare with: undefined" not in modal.inner_text(), (
            scientific + ": missing optional comparison data displayed as undefined")
        # Follow the actual link used by the Lab: the destination must show
        # THIS specific grass, not merely the 169-species catalog heading.
        if scientific == "Bothriochloa longipaniculata":
            lesson_url = modal.get_by_role("link",name="Open full Hays Botany lesson").get_attribute("href")
            assert "species=bothriochloa-longipaniculata#species-detail" in lesson_url
            detail_page = ctx.new_page()
            try:
                detail_page.goto(lesson_url,wait_until="domcontentloaded",timeout=65000)
                detail_page.wait_for_function(
                    "() => document.querySelector('#species-detail .subtitle')?.textContent.includes('Bothriochloa longipaniculata')",
                    timeout=60000)
                assert detail_page.evaluate("document.activeElement.id") == "species-detail", (
                    "Deep-linked profile was loaded but stayed unfocused below the catalog")
                assert detail_page.locator("#species-detail").is_visible()
            finally:
                detail_page.close()
        modal.get_by_role("button",name="Close species detail").click()
    page.locator("#species-search").fill("Dichanthelium acuminatum")
    page.wait_for_function("document.querySelectorAll(\'#results .result\').length === 1",timeout=15000)
    assert "Research trial" in page.locator("#results .result").first.inner_text(), ("Broad-complex identity hold was lost")
    page.locator("#species-search").fill("Polypogon viridis")
    page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
    page.locator("#results .result").first.click()
    gap_dialog = page.locator("#detail-dialog")
    assert "Newly source-verified field characters" in gap_dialog.inner_text(), (
        "Previously skipped water bentgrass growth form not published")
    assert "mat" in gap_dialog.inner_text().lower(), "Supported rooting mat habit missing"
    assert gap_dialog.locator("section.detail-botany a[href^='https://']").count() >= 2, (
        "Hays Hill Country source and exact handoff links missing")
    gap_dialog.get_by_role("button",name="Close species detail").click()
    page.locator("#species-search").fill("")

    # Measured leaf width: documented matches, unknowns, and recoverable exclusions.
    choose_extra(page, "Leaf blades", "blade_width", "broad")
    m, u, e = buckets(page)
    assert m > 0 and e > 0 and m + u + e == 169, f"{name}: broad width buckets {m,u,e}"
    assert page.locator("#count").inner_text() == f"{m+u} possible", "Header omits unknown grasses"
    assert page.locator("#caution-details").is_visible(), "Ruled-out sources not reviewable"
    assert page.locator("#caution-list a[href^='https://']").count() >= 1, "Citations missing for exclusions"
    assert page.locator("#results .result").count() == m+u
    broad_buckets = [m, u, e]

    # The initial comparison selection must NEVER choose a grass already ruled out.
    if m+u >= 2:
        page.locator("#compare-toggle").click()
        assert page.locator("#compare-open").is_enabled(), "Expected two preselected possible grasses"
        selected = page.locator("#results .compare-pick[aria-pressed='true']")
        assert selected.count() == 2, "Compare seeded an excluded/unknown offscreen candidate"
        page.locator("#compare-open").click()
        assert page.locator("#compare-dialog").evaluate("(dlg) => dlg.open"), "Comparison dialog never opened"
        page.locator("#compare-dialog button.close").first.click() if page.locator("#compare-dialog button.close").count() else page.locator("#compare-dialog").evaluate("(dlg) => dlg.close()")

    # True start-over clears four core questions, all advanced selections, search,
    # view filters and transient comparison mode without reloading.
    page.locator("#reset-field-key").click()
    assert page.locator("#count").inner_text() == "169 possible"
    assert "more_blade_width" not in page.url
    assert page.locator("#caution-details").is_hidden()
    assert page.locator("#progress-label").inner_text().startswith("0 of 4")

    # Research pending anatomy cannot invent species matches or negate 169 grasses.
    choose_extra(page, "Flowers / spikelets", "glume_marks", "upper_one_vein")
    m, u, e = buckets(page)
    assert (m, u, e) == (0, 169, 0), f"{name}: pending glume option incorrectly scored {m,u,e}"
    assert page.locator("#count").inner_text() == "169 possible"
    assert page.locator("#unresolved-candidates").count() == 1, "Unresolved list inaccessible"
    page.locator("#unresolved-candidates > summary").click()
    assert page.locator("#unresolved-candidates .result").count() == 169

    # Explicit documented-only mode suppresses unknowns reversibly (not exclusion).
    page.locator("#optional-documented-only").click()
    assert page.locator("#count").inner_text() == "0 possible", "Documented-only mode should show no fabricated match"
    page.locator("#optional-documented-only").click()
    assert page.locator("#count").inner_text() == "169 possible"
    page.locator("#reset-field-key").click()

    # Multiple independent glume states survive URL bookmark/reload.
    choose_extra(page, "Flowers / spikelets", "glume_marks", "lower_reduced")
    choose_extra(page, "Flowers / spikelets", "glume_marks", "one_vein")
    assert "more_glume_marks" in page.url and "lower_reduced" in page.url and "one_vein" in page.url
    assert sum(buckets(page)) == 169
    page.reload(wait_until="domcontentloaded",timeout=65000)
    page.wait_for_function(
        "() => document.querySelector('#coded-total')?.textContent === '169' && "
        "document.querySelectorAll('#optional-character-groups [data-character=glume_marks]').length===1",
        timeout=75000)
    group = page.locator('#optional-character-groups [data-character="glume_marks"]')
    for choice in ("lower_reduced", "one_vein"):
        assert group.locator(f'button[data-option="{choice}"]').get_attribute("aria-pressed") == "true", (
            f"{name}: saved glume selection lost: "+choice)
    page.locator("#reset-field-key").click()

    # Core photo questions still eliminate only documented conflicts; reset works.
    page.locator("#steps button.step").first.click()
    page.locator("#question button.answer").first.click()
    assert page.locator("#progress-label").inner_text().startswith("1 of 4")
    page.locator("#reset-field-key").click()
    assert page.locator("#progress-label").inner_text().startswith("0 of 4")
    assert page.locator("#count").inner_text() == "169 possible"

    # One previously credited real photo must be visibly decoded in a normal result,
    # with creator, license and original source link still accessible.
    page.locator("#species-search").fill("Bromus lanceolatus")
    page.wait_for_function("document.querySelectorAll('#results .result').length===1",timeout=15000)
    page.locator("#results .result").click()
    dialog = page.locator("#detail-dialog")
    assert dialog.evaluate("(dlg)=>dlg.open"), "Species photo modal did not open"
    photos = dialog.locator(".detail-grid img")
    assert photos.count() >= 1, "No licensed photographs in the published species gallery"
    photo = photos.first
    photo.scroll_into_view_if_needed()
    photo.evaluate("(img)=>{img.loading='eager'}")
    page.wait_for_function(
        "() => {const img=document.querySelector('#detail-dialog .detail-grid img'); "
        "return !!img && img.complete && img.naturalWidth>40 && img.naturalHeight>40}",
        timeout=45000)
    assert dialog.locator(".mini-credit").count() >= 2, "Individual credit/license captions missing"
    assert dialog.locator("a[href^='https://']").count() >= 1, "Image source links missing"
    natural = photo.evaluate("(img)=>[img.naturalWidth,img.naturalHeight]")
    page.locator("#detail-dialog button.close").first.click()

    overflow = page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
    assert overflow <= 12, f"{name}: horizontal body overflow {overflow}px"
    assert not errors, f"{name}: browser JS exceptions {errors}"
    page.locator("#species-search").fill("")
    page.locator("#reset-field-key").click()
    page.screenshot(path=str(REPORT / f"grass-key-visitor-{name}.png"), full_page=False)
    ctx.close()
    return {"device":name,"viewport":[width,height],"broad_leaf_buckets":broad_buckets,
            "core_and_advanced_reset":"PASS","pending_glume":"PASS",
            "source_links":"PRESENT","comparison":"PASS",
            "multi_select_link":"PASS","real_photo_dimensions":natural,
            "photo_credit":"PRESENT","browser_errors":errors,"overflow_px":overflow}


if __name__ == "__main__":
    if LIVE:
        published_html_parity()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            results = [
                check_view(browser, "desktop", 1366, 850),
                check_view(browser, "mobile", 390, 844),
            ]
        finally:
            browser.close()
    print("PASS HAYS_GRASS_VISITOR_BROWSER", json.dumps({
        "live_pages": LIVE, "source_url":URL,"results":results,
    },sort_keys=True),flush=True)
