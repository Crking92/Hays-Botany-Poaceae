#!/usr/bin/env python3
"""Browser regression for Hays Grass ID Lab glossary (remote source blocked on purpose)."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("GRASS_GLOSSARY_TEST_BASE", "http://127.0.0.1:8770").rstrip("/")
URL = BASE + "/site/visual-key-lab/index.html"
HOSTED = "https://crking92.github.io/Hays-Botany-Poaceae/"

def check(condition, message):
    if not condition:
        raise AssertionError(message)

def test(browser, width, height):
    context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
    page = context.new_page()
    page_errors = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    # Mandatory test: the other site cannot load; all 147 shared glossary terms
    # must still be available from the Poaceae local mirror.
    page.route("https://crking92.github.io/Hays-County-Botany/data/learning-layer.json",
               lambda route: route.abort("failed"))
    # Reuse exact gallery files from the checked-out source, not live web photos.
    def route_original(route):
        relative = route.request.url[len(HOSTED):].split("?")[0]
        source = ROOT / relative
        if source.is_file():
            route.fulfill(path=str(source))
        else:
            route.abort("failed")
    page.route(HOSTED + "**", route_original)
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_function("window.HaysGrassGlossary && window.HaysGrassGlossary.available() === 173", timeout=25000)
    page.wait_for_selector("#question .answer", timeout=25000)
    check(page.locator("#coded-total").inner_text() == "165" or int(page.locator("#coded-total").inner_text()) >= 112,
          "Grass key failed to load its scored and research species")
    total_before = page.locator("#progress-label").inner_text()
    check(page.locator("#question .grass-terms-quick").count() == 1, "Missing lesson vocabulary disclosure")
    check(page.locator('#question [data-grass-term="panicle"]').count() >= 1, "Panicle definition link missing")
    page.locator("#grass-glossary-launch").click()
    check(page.locator("#grass-glossary-dialog").evaluate("(d)=>d.open"), "Glossary did not open")
    check("173 terms available" in page.locator("#grass-glossary-content").inner_text(),
          "The shared glossary fallback was not loaded")
    page.locator("#grass-glossary-search").fill("stolon")
    page.locator('#grass-glossary-results [data-grass-term="stolon"]').click()
    check(page.locator(".grass-glossary-definition h3").inner_text() == "Stolon",
          "Glossary term opening failed")
    check(page.locator(".grass-glossary-figure figcaption").count() > 0,
          "Existing glossary reference photograph is missing")
    page.locator(".grass-glossary-back").click()
    page.locator("#grass-glossary-search").fill("ligule")
    page.locator('#grass-glossary-results [data-grass-term="ligule"]').click()
    caption = page.locator(".grass-glossary-figure figcaption").inner_text()
    check("Harry Rose" in caption and "CC BY 2.0" in caption and "GFDL" not in caption,
          "Restricted original ligule reference was not replaced")
    page.locator(".grass-glossary-back").click()
    page.locator("#grass-glossary-search").fill("legume")
    page.locator('#grass-glossary-results [data-grass-term="legume"]').click()
    check(page.locator(".grass-glossary-definition img").count() == 0,
          "A rights-uncertain legacy photo was displayed")
    check(page.locator(".grass-glossary-missing").count() == 1,
          "Missing/uncleared photos need honest placeholders")
    page.locator(".grass-glossary-close").click()
    check(not page.locator("#grass-glossary-dialog").evaluate("(d)=>d.open"),
          "Glossary dialog failed to close")
    check(page.locator("#progress-label").inner_text() == total_before,
          "Glossary click changed the saved identification answers")
    wrap = page.locator("#optional-character-wrap")
    check(wrap.count() == 1 and not wrap.evaluate("(el)=>el.hidden"),
          "Advanced character sections were not loaded")
    wrap.locator("summary").first.click()
    if not wrap.evaluate("(el)=>el.open"):
        wrap.evaluate("(el)=>el.open=true")
    section = page.locator("#optional-character-groups .optional-group").first
    section.locator("summary").click()
    page.wait_for_function('document.querySelectorAll("#optional-character-groups .grass-group-terms .grass-term-chip").length > 0', timeout=10000)
    check(page.locator("#progress-label").inner_text() == total_before,
          "Opening optional term definitions changed scoring")
    # Page + popup should work within a narrow field-crew phone viewport.
    if width < 500:
        overflow = page.evaluate("document.documentElement.scrollWidth-innerWidth")
        check(overflow < 10, "Mobile page overflows viewport: " + str(overflow))
    mode = page.locator("html").get_attribute("data-theme")
    if mode != "dark":
        page.locator("#theme-toggle").click()
    check(page.locator("html").get_attribute("data-theme") == "dark", "Dark mode did not activate")
    page.locator("#grass-glossary-launch").click()
    check(page.locator("#grass-glossary-dialog").evaluate("(d)=>d.open"), "Dark-mode glossary did not open")
    page.locator(".grass-glossary-close").click()
    check(not page_errors, "JS errors: " + repr(page_errors))
    result = {"device": "mobile" if width < 500 else "desktop", "viewport": [width, height],
              "glossary_terms": 173, "remote_glossary": "intentionally blocked",
              "source_photo_credit": "PASS", "rights_hold": "PASS", "dark_mode": "PASS",
              "scoring_state_preserved": "PASS", "js_errors": page_errors}
    context.close()
    return result

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    results = [test(browser, 1365, 850), test(browser, 390, 844)]
    browser.close()
    print("GRASS_GLOSSARY_BROWSER_QA " + json.dumps({"status": "PASS", "results": results}, sort_keys=True))
