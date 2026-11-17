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


def sweep_all_optional_options(page, name):
    """Exercise every rendered advanced control, without choosing botanical answers."""
    wrapper = page.locator("#optional-character-wrap")
    if not wrapper.evaluate("(element) => element.open"):
        wrapper.locator("summary").first.click()
    inspected_groups = inspected_choices = 0
    for section in ("Leaf blades", "Collars / sheaths", "Stems / roots", "Flowers / spikelets"):
        page.locator("#optional-section-tabs button").filter(has_text=section).first.click()
        groups = page.locator("#optional-character-groups .optional-group")
        for group_index in range(groups.count()):
            group = groups.nth(group_index)
            character = group.get_attribute("data-character")
            assert character, f"{name}: rendered advanced group without character id"
            inspected_groups += 1
            if not group.evaluate("(element) => element.open"):
                group.locator("summary").first.click()
            buttons = group.locator("button[data-option]")
            for option_index in range(buttons.count()):
                button = buttons.nth(option_index)
                option = button.get_attribute("data-option")
                assert option, f"{name}/{character}: option missing ID"
                assert button.get_attribute("aria-pressed") == "false", (
                    f"{name}/{character}/{option}: stale or leaked selection")
                button.click()
                assert button.get_attribute("aria-pressed") == "true", (
                    f"{name}/{character}/{option}: click did not activate option")
                assert f"more_{character}={option}" in page.url, (
                    f"{name}/{character}/{option}: state not written into share URL")
                m, u, e = buckets(page)
                assert m + u + e == 169, (
                    f"{name}/{character}/{option}: {m,u,e} silently lost a grass")
                assert page.locator("#count").inner_text() == f"{m+u} possible", (
                    f"{name}/{character}/{option}: displayed count disagrees with candidates")
                button.click()
                assert button.get_attribute("aria-pressed") == "false", (
                    f"{name}/{character}/{option}: clicking again did not clear")
                assert f"more_{character}=" not in page.url, (
                    f"{name}/{character}/{option}: cleared URL still retains selection")
                assert page.locator("#count").inner_text() == "169 possible", (
                    f"{name}/{character}/{option}: clearing did not restore every grass")
                inspected_choices += 1
    assert (inspected_groups, inspected_choices) == (24, 111), (
        f"{name}: expected all 24 groups and 111 options, got {inspected_groups}/{inspected_choices}")
    return {"groups": inspected_groups, "options_clicked_and_cleared": inspected_choices}


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
    # Main-question photographs are reused from ORIGINAL credited Learner
    # photo records, with the exact historic coordinates and no image crop.
    for q_index, label, pointer_count in [
        (0, "Many little hanging side branches", 2),
        (1, "A bunch or tuft", 1),
        (2, "A fringe of hairs", 2),
        (3, "Separate bristles under spikelets", 2)
    ]:
        page.locator("#steps button.step").nth(q_index).click()
        card = page.locator("#question .answer").filter(has_text=label)
        assert card.count() == 1, f"{name}: annotated photo answer missing: {label}"
        frame = card.locator(".photo-frame.with-reviewed-arrows")
        assert frame.count() == 1, f"{name}: missing approved arrow overlay: {label}"
        photo = frame.locator("img")
        photo.scroll_into_view_if_needed()
        photo.evaluate("(img) => {img.loading='eager'}")
        frame.locator("svg.field-photo-arrows circle").first.wait_for(
            state="attached", timeout=50000)
        assert frame.locator("svg.field-photo-arrows circle").count() == pointer_count*2, (
            f"{name}: image arrow overlay does not match source marker count: {label}")
        assert card.locator("ol.photo-arrow-legend li").count() == pointer_count, (
            f"{name}: marker numbers have no corresponding structure labels: {label}")
        assert "Not proven here:" in card.inner_text(), (
            f"{name}: annotation is implying undocumented plant anatomy: {label}")
        actual = photo.evaluate("(img) => [img.naturalWidth,img.naturalHeight]")
        assert min(actual) > 40, f"{name}: source image did not visibly decode: {label}"
        viewbox = frame.locator("svg.field-photo-arrows").get_attribute("viewBox")
        assert viewbox == f"0 0 {actual[0]} {actual[1]}", (
            f"{name}: arrow overlay proportions differ from actual photo: {label}")
        assert photo.evaluate("(img) => getComputedStyle(img).objectFit") == "contain", (
            f"{name}: diagnostic photo was cropped underneath a marker: {label}")
    # A photo without reviewed arrows must say it is a GENERAL example.
    page.locator("#steps button.step").nth(2).click()
    unknown = page.locator("#question .answer").filter(has_text="No true ligule apparent")
    assert unknown.locator("svg.field-photo-arrows").count() == 0
    assert "General reference photo" in unknown.inner_text()
    page.locator("#steps button.step").first.click()

    # The source-backed Pappophorum option should lead to a real documented
    # match. The optional focus button hides unknown records but NEVER calls
    # them botanical contradictions, and clearing the view restores all 169.
    focus=page.locator("#focus-confirmed")
    assert focus.is_visible() and focus.is_disabled()
    page.locator("#steps .step").nth(3).click()
    page.locator("#question .answer").filter(has_text="Many feathery awns on one lemma").click()
    page.wait_for_function("document.querySelector('#count')?.textContent.endsWith('possible')",timeout=15000)
    all_possible=page.locator("#results .result").count()
    assert all_possible > 1, "Positive-only specialized awn was made a false exclusion"
    assert "supported match" in page.locator(".progressive-status").inner_text()
    assert focus.is_enabled()
    focus.click()
    assert focus.get_attribute("aria-pressed") == "true"
    documented=page.locator("#results .result").count()
    assert 1 <= documented < all_possible, "Documented match view did not focus candidates"
    assert "documented matches" in page.locator("#count").inner_text()
    assert "Pappophorum bicolor" in page.locator("#results").inner_text()
    assert "not ruled out" in page.locator("#focus-note").inner_text()
    focus.click()
    assert focus.get_attribute("aria-pressed") == "false"
    assert page.locator("#results .result").count() == all_possible, (
        "Toggling off focus failed to restore all unknown possibilities")
    page.locator("#reset-field-key").click()
    assert page.locator("#count").inner_text() == "169 possible"

    # A previously EMPTY advanced choice now has an exact plant-organ source.
    # Poa annua sheath closure is botanically documented; no other grass is
    # eliminated just because its sheath is not documented.
    choose_extra(page, "Collars / sheaths", "sheath_margins", "closed")
    target=page.locator('#optional-character-groups .optional-group[data-character="sheath_margins"] button[data-option="closed"]')
    assert "Reference data pending" not in target.inner_text()
    assert "source-documented" in target.inner_text()
    matches, unknown, ruled_out = buckets(page)
    assert matches >= 1 and unknown > 0 and ruled_out == 0, (
        "Exact source-backed sheath should rank Poa annua without ruling out unknowns")
    focus.click()
    assert "Poa annua" in page.locator("#results").inner_text()
    assert "documented matches" in page.locator("#count").inner_text()
    focus.click()
    assert page.locator("#count").inner_text() == "169 possible"
    page.locator("#reset-field-key").click()
    assert page.locator("#count").inner_text() == "169 possible"

    # Seven pre-existing source-backed anatomy choices needed seven distinct
    # diagrams, not the generic spikelet fallback. Test the actual selected
    # rendered SVG, labelled target organ, field tip, result status and reset
    # on both desktop and mobile. No diagram implies a reviewed photo arrow.
    for character, choice, labels, clue in [
        ("glume_marks","upper_one_vein",("1 LOWER","2 UPPER"),"UPPER"),
        ("glume_marks","lower_one_vein",("1 LOWER","2 UPPER"),"LOWER"),
        ("true_lemma_awn","fertile_awn_2_to_5mm",
         ("LOWER STERILE","UPPER FERTILE"),"FERTILE"),
        ("true_lemma_awn","lower_sterile_awn_variable",
         ("LOWER STERILE","UPPER FERTILE"),"VARIABLE"),
        ("floral_hair_position","lower_sterile_lemma_hairs",
         ("LOWER STERILE","UPPER FERTILE"),"STERILE"),
        ("floral_hair_position","upper_fertile_lemma_hairs",
         ("LOWER STERILE","UPPER FERTILE","FEMALE ONLY"),"FEMALE"),
        ("floral_hair_position","spikelet_callus_hairs",
         ("BASAL CALLUS HAIRS",),"callus")
    ]:
        choose_extra(page,"Flowers / spikelets",character,choice)
        group = page.locator(
            f'#optional-character-groups .optional-group[data-character="{character}"]')
        chosen = group.locator(f'button[data-option="{choice}"]')
        assert "source-documented" in chosen.inner_text(), (
            f"{name}/{character}/{choice}: source-backed option still shown as pending")
        guide = group.locator(".flower-field-guide")
        drawing = guide.locator("svg")
        assert drawing.count() == 1, (
            f"{name}/{character}/{choice}: missing custom botanical drawing")
        assert "not a specimen photograph" in drawing.get_attribute("aria-label")
        for label in labels:
            assert label in drawing.locator("text").all_text_contents(), (
                f"{name}/{character}/{choice}: missing separate target organ label {label}")
        assert clue.lower() in guide.inner_text().lower(), (
            f"{name}/{character}/{choice}: beginner clue not displayed")
        assert "no verified species-level match yet" not in guide.inner_text().lower(), (
            f"{name}/{character}/{choice}: source-linked teaching choice fell back")
        m,u,e=buckets(page)
        assert m >= 1 and u > 0 and e == 0 and m+u+e == 169, (
            f"{name}/{character}/{choice}: positive-only evidence or unknowns changed")
        page.locator("#reset-field-key").click()
        assert page.locator("#count").inner_text() == "169 possible"

    # Final four advanced choices must actually rank a known exact species,
    # use corrected FIRST-GLUME anatomy and retain nonmatching unknown grasses.
    for section, character, choice, scientific in [
        ("Leaf blades","blade_venation","raised_ribs","Lolium perenne"),
        ("Flowers / spikelets","true_lemma_awn","apical_mucro","Setaria italica"),
        ("Flowers / spikelets","glume_marks","central_glume_glabrous","Setaria italica"),
        ("Flowers / spikelets","glume_marks","central_glume_scabrous","Poa annua")
    ]:
        choose_extra(page, section, character, choice)
        selected=page.locator(
            f'#optional-character-groups .optional-group[data-character="{character}"] button[data-option="{choice}"]')
        assert selected.count()==1 and "Reference data pending" not in selected.inner_text()
        assert "source-documented" in selected.inner_text()
        m,u,e=buckets(page)
        assert m>=1 and m+u+e==169 and e==0, (
            scientific+": final anatomical option failed to produce a positive match without false exclusions")
        assert scientific in page.locator("#results").inner_text()
        if choice.startswith("central_glume"):
            assert selected.inner_text().startswith("Lower glume midnerve"), (
                "Key still describes a nonexistent third central glume")
        page.locator("#reset-field-key").click()
        assert page.locator("#count").inner_text()=="169 possible"

    assert "168 source-scored, 1 research-only" in page.locator("#coded-subtitle").inner_text(), (
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
            # The link is the future public URL, but a PR cannot yet serve
            # unmerged site/app.js on public Pages. Exercise the corresponding
            # local Learner during PR QA, then the real link on main deploy.
            check_url = lesson_url if LIVE else URL.replace(
                "/visual-key-lab/index.html", "/index.html").split("?")[0] + (
                "?species=bothriochloa-longipaniculata#species-detail")
            detail_page = ctx.new_page()
            try:
                detail_page.goto(check_url,wait_until="domcontentloaded",timeout=65000)
                detail_page.wait_for_function(
                    "() => document.querySelector('#species-detail .subtitle')?.textContent.includes('Bothriochloa longipaniculata')",
                    timeout=60000)
                # The title appears during select(), just before its awaited
                # deep-link scroll/focus action finishes. Wait for that action.
                detail_page.wait_for_function(
                    "() => document.activeElement?.id === 'species-detail'",
                    timeout=15000)
                assert detail_page.locator("#species-detail").is_visible()
            finally:
                detail_page.close()
        modal.get_by_role("button",name="Close species detail").click()
    # Historical manifest-only Bromus is literature-scored but is NOT a Hays voucher.
    page.locator("#species-search").fill("Bromus brevis")
    page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
    assert "Source-scored" in page.locator("#results .result").first.inner_text()
    page.locator("#results .result").first.click()
    brome=page.locator("#detail-dialog")
    assert "NOT a Hays County specimen voucher" in brome.inner_text()
    assert "compact-panicled" in brome.inner_text()
    assert brome.locator(".detail-grid img").count() == 3
    brome.get_by_role("button",name="Close species detail").click()
    for scientific,count,needle in [
        ("Dichanthelium acuminatum",3,"BROAD-COMPLEX"),
        ("Phyllostachys aurea",2,"Flowers are extremely rare"),
        ("Cortaderia selloana",2,"dense, tall tuft")]:
        page.locator("#species-search").fill(scientific)
        page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
        assert "Source-scored" in page.locator("#results .result").first.inner_text(), (
            scientific + ": scoped literature evidence not surfaced")
        page.locator("#results .result").first.click()
        dlg=page.locator("#detail-dialog")
        assert needle.lower() in dlg.inner_text().lower(), (
            scientific + ": critical taxon or field-character caveat missing")
        assert dlg.locator(".detail-grid img").count()==count
        assert "NOT a Hays County specimen voucher" in dlg.inner_text()
        dlg.get_by_role("button",name="Close species detail").click()
    page.locator("#species-search").fill("Lolium × boucheanum")
    page.wait_for_function("document.querySelectorAll('#results .result').length === 1",timeout=15000)
    assert "Research trial" in page.locator("#results .result").first.inner_text(), (
        "Hybrid lineage conflict must remain on hold")
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

    # Upper ONE-veined glume now has an exact named species source:
    # Eragrostis spectabilis, Kew GrassBase. Other grasses remain unknown.
    choose_extra(page, "Flowers / spikelets", "glume_marks", "upper_one_vein")
    m, u, e = buckets(page)
    assert (m, u, e) == (1, 168, 0), f"{name}: cited upper-glume evidence not integrated {m,u,e}"
    assert page.locator("#count").inner_text() == "169 possible"
    assert "Eragrostis spectabilis" in page.locator("#results").inner_text()
    assert page.locator("#unresolved-candidates").count() == 1, "Unresolved list inaccessible"
    page.locator("#unresolved-candidates > summary").click()
    assert page.locator("#unresolved-candidates .result").count() == 168

    # Explicit documented-only mode suppresses unknowns reversibly (not exclusion).
    page.locator("#optional-documented-only").click()
    assert page.locator("#count").inner_text() == "1 possible", "Documented-only mode should focus exactly the cited glume match"
    page.locator("#optional-documented-only").click()
    assert page.locator("#count").inner_text() == "169 possible"

    # Regression: literature-supported positive-only head states do not establish
    # the absence of other flowering forms. Evidence-only view may HIDE an
    # undocumented advanced observation, but must never move that species to
    # "Ruled out" based on an unlisted, explicitly nonexclusive core state.
    page.locator("#steps button.step").first.click()
    page.locator("#question .answer").filter(has_text="Wheat-like upright or nodding spike").click()
    assert "Panicum miliaceum" in page.locator("#results").text_content(), (
        f"{name}: documented cultivar variation was incorrectly excluded from possible")
    page.locator("#optional-documented-only").click()
    assert "Panicum miliaceum" not in page.locator("#caution-list").text_content(), (
        f"{name}: evidence-only view falsely classified unknown proso-millet head as ruled out")
    page.locator("#optional-documented-only").click()
    assert "Panicum miliaceum" in page.locator("#results").text_content(), (
        f"{name}: reversing evidence-only view failed to restore possible proso millet")
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
    advanced_sweep = sweep_all_optional_options(page, name)
    page.locator("#reset-field-key").click()
    page.screenshot(path=str(REPORT / f"grass-key-visitor-{name}.png"), full_page=False)
    ctx.close()
    return {"device":name,"viewport":[width,height],"broad_leaf_buckets":broad_buckets,
            "core_and_advanced_reset":"PASS","pending_glume":"PASS",
            "source_links":"PRESENT","comparison":"PASS",
            "multi_select_link":"PASS","real_photo_dimensions":natural,
            "photo_credit":"PRESENT","browser_errors":errors,"overflow_px":overflow,
            "full_advanced_option_click_sweep":advanced_sweep}


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
