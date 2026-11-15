#!/usr/bin/env python3
"""Confirm the ACTUAL published Grass ID Lab glossary, not just local source/CI previews.

Run from a GitHub runner with internet access and Playwright Chromium installed.
All read-only checks: no deployment, edits, specimen admissions or site mutations.
"""
import hashlib
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "site" / "visual-key-lab"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
RELEASE = os.environ.get("GITHUB_SHA", "manual-live-audit")
FILES = [
    "index.html", "grass-glossary-bridge.js", "grass-glossary.css",
    "grass-glossary-terms.json", "shared-glossary-snapshot.json",
    "glossary-approved-source-photos.json",
]
PHOTO_PATHS = [
    "content/taxa/Poaceae/Dichanthium/dichanthium-sericeum/images/harry-rose-dichanthium-sericeum-true-exposed-ligule5.jpg",
    "content/taxa/Poaceae/Cynodon/cynodon-dactylon/images/jimmex-410585094-stolon-leafy-node.jpg",
]

def retrieve(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Hays-Grass-Glossary-Live-Pages-QA/1.0",
                 "Cache-Control": "no-cache"},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        if response.status != 200:
            raise AssertionError(f"HTTP {response.status}: {url}")
        return response.read()

def byte_parity():
    last_error = None
    for attempt in range(1, 16):
        try:
            for path in FILES:
                actual = retrieve(BASE + path + "?glossary_release_check=" + RELEASE)
                expected = (LAB / path).read_bytes()
                if hashlib.sha256(actual).digest() != hashlib.sha256(expected).digest():
                    raise AssertionError("Published asset differs from main: " + path)
            for path in PHOTO_PATHS:
                url = "https://crking92.github.io/Hays-Botany-Poaceae/" + path
                payload = retrieve(url + "?glossary_photo_check=" + RELEASE)
                if not payload.startswith(b"\xff\xd8\xff") and not payload.startswith(b"\x89PNG"):
                    raise AssertionError("Published reference photo not decodable JPG/PNG: " + path)
            return
        except (AssertionError, urllib.error.URLError, TimeoutError) as exc:
            last_error = str(exc)
            print(f"Live glossary release not in parity (attempt {attempt}/15): {last_error}", flush=True)
            if attempt < 15:
                time.sleep(8)
    raise AssertionError("Public glossary deployment could not be confirmed: " + str(last_error))

def require(value, message):
    if not value:
        raise AssertionError(message)

def check_photo(page, word, expected, require_image=True):
    page.locator("#grass-glossary-launch").click()
    page.locator("#grass-glossary-search").fill(word)
    page.locator(f'#grass-glossary-results [data-grass-term="{word}"]').click()
    require(page.locator(".grass-glossary-definition h3").inner_text().lower() == expected.lower(),
            "Wrong definition opened: " + word)
    image = page.locator(".grass-glossary-definition img")
    if require_image:
        require(image.count() > 0, "Missing credited image for " + word)
        try:
            image.wait_for(state="visible", timeout=7000)
            page.wait_for_function(
                "document.querySelector('.grass-glossary-definition img')?.complete",
                timeout=12000
            )
        except Exception as exc:
            raise AssertionError("Image did not load for " + word + ": " + str(exc))
        require(image.evaluate("(img)=>img.naturalWidth > 10 && img.naturalHeight > 10"),
                "Broken or empty published image: " + word)
    page.locator(".grass-glossary-close").click()

def audit_view(browser, width, height):
    page_errors = []
    context = browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1)
    page = context.new_page()
    page.on("pageerror",lambda error:page_errors.append(str(error)))
    page.goto(BASE + "index.html?glossary_live_audit=" + RELEASE,
              wait_until="domcontentloaded",timeout=30000)
    page.wait_for_function("window.HaysGrassGlossary?.available() === 173", timeout=30000)
    page.wait_for_function("window.HaysGrassGlossary?.approvedPhotos() === 26", timeout=30000)
    page.wait_for_selector("#question .answer",timeout=20000)
    require(page.locator("#grass-glossary-launch").is_visible(), "Glossary button missing from live site")
    require(page.locator("#coded-total").inner_text().strip() == "165",
            "Unexpected live trial/scored inventory; do not silently change scoring")
    before=page.locator("#progress-label").inner_text()
    require(page.locator('#question [data-grass-term="panicle"]').count()>0,
            "Core botanical term link missing")
    check_photo(page,"ligule","Ligule")
    check_photo(page,"stolon","Stolon")
    for term,title in [("panicle","Panicle"),("pedicel","Pedicel"),("trichome","Trichome")]:
        check_photo(page,term,title)
    # Legacy image was held, recovered under exact CC BY-SA source permission.
    check_photo(page,"legume","Legume")
    page.locator("#grass-glossary-launch").click()
    page.locator("#grass-glossary-search").fill("coriaceous")
    page.locator('#grass-glossary-results [data-grass-term="coriaceous"]').click()
    require(page.locator(".grass-glossary-definition img").count()==0,
            "Rights-uncertain coriaceous photograph published")
    require(page.locator(".grass-glossary-sketch svg").count()==1,
            "Correct fallback botanical illustration missing")
    page.locator(".grass-glossary-close").click()
    for term in ["ciliate","sheath-margin","geniculate","decumbent"]:
        page.locator("#grass-glossary-launch").click()
        page.locator("#grass-glossary-search").fill(term)
        page.locator('#grass-glossary-results [data-grass-term="'+term+'"]').click()
        require(page.locator(".grass-glossary-definition img").count()==0,
                "Misleading glossary photo displayed: "+term)
        require(page.locator(".grass-glossary-sketch svg").count()==1,
                "Original anatomy sketch missing for "+term)
        page.locator(".grass-glossary-close").click()
    require(before==page.locator("#progress-label").inner_text(),
            "Glossary interactions altered scoring")
    wrap=page.locator("#optional-character-wrap")
    require(not wrap.evaluate("(el)=>el.hidden"),"Advanced morphology options absent")
    wrap.locator("summary").first.click()
    group=page.locator("#optional-character-groups .optional-group").first
    group.locator("summary").click()
    page.wait_for_function(
        'document.querySelector("#optional-character-groups .grass-group-terms .grass-term-chip") !== null',
        timeout=12000
    )
    require(before==page.locator("#progress-label").inner_text(),"Advanced glossary terms changed score")
    if width<500:
        width_excess=page.evaluate("document.documentElement.scrollWidth - innerWidth")
        require(width_excess<10,"Mobile horizontal overflow: "+str(width_excess))
    if page.locator("html").get_attribute("data-theme") != "dark":
        page.locator("#theme-toggle").click()
    require(page.locator("html").get_attribute("data-theme")=="dark",
            "Dark mode unavailable")
    page.locator("#grass-glossary-launch").click()
    require(page.locator("#grass-glossary-dialog").evaluate("(d)=>d.open"),"Dark-mode dialog failed")
    page.locator(".grass-glossary-close").click()
    require(not page_errors,"Public browser JS errors: "+repr(page_errors))
    summary={"device":"mobile" if width<500 else "desktop","viewport":[width,height],
             "terms":173,"licence_records":26,"key_matches":165,
             "ligule_photo":"LOADED","stolon_photo":"LOADED","legume_photo":"LOADED",
             "held_photo":"NOT_DISPLAYED","dark_mode":"PASS",
             "scoring_unchanged":"PASS","browser_errors":page_errors}
    context.close()
    return summary

def main():
    byte_parity()
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        results=[audit_view(browser,1366,850),audit_view(browser,390,844)]
        browser.close()
    print("HAYS_GRASS_GLOSSARY_LIVE_SITE_AUDIT "+json.dumps({
        "status":"PASS","release":RELEASE,"matching_files":FILES,
        "photo_paths_verified":len(PHOTO_PATHS),
        "browser_results":results,
        "note":"Real public HTML/JS/CSS/JSON/image bytes and live desktop/mobile browser interactions checked; not an exhaustive visual-ID audit of all 173 illustrations."
    },sort_keys=True))

if __name__=="__main__":
    main()
