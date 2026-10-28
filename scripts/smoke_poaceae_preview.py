#!/usr/bin/env python3
"""Headless desktop/mobile smoke tests of a nonpublished static Poaceae preview.

Requires: python -m pip install playwright; python -m playwright install chromium.
Invoke with POACEAE_TEST_URL=http://127.0.0.1:8765.
"""
from __future__ import annotations
import os,json
from playwright.sync_api import sync_playwright
URL=os.environ.get("POACEAE_TEST_URL","http://127.0.0.1:8765")
def run():
    report={"status":"NONPUBLIC_BROWSER_SMOKE","tests":[],"errors":[]}
    with sync_playwright() as browser:
        engine=browser.chromium.launch(headless=True)
        for name,width,height,mobile in [
            ("desktop",1366,850,False),
            ("mobile",390,844,True)
        ]:
            context=engine.new_context(viewport={"width":width,"height":height},
                                       is_mobile=mobile,has_touch=mobile)
            page=context.new_page()
            js=[]
            page.on("pageerror",lambda error:js.append(str(error)))
            response=page.goto(URL,wait_until="domcontentloaded",timeout=60000)
            assert response and response.status==200,(name,response.status if response else None)
            page.wait_for_function("document.querySelector('#count')?.textContent?.includes('112')",timeout=45000)
            assert page.locator("#species-list button").count()==112
            page.locator("#search").fill("Sorghastrum nutans")
            page.wait_for_function("document.querySelectorAll('#species-list button').length===1",timeout=12000)
            page.locator("#species-list button").first.click()
            page.wait_for_function("window.location.search.includes('sorghastrum-nutans')",timeout=25000)
            page.wait_for_function("document.querySelector('#species-detail h2')?.textContent.length>0",timeout=15000)
            heading=page.locator("#species-detail h2").inner_text()
            assert page.locator("#species-detail .learner-step").count()>=6
            assert page.locator(".view-switch button").count()==3
            page.locator(".view-switch button").filter(has_text="Learn terms").click()
            page.locator("#species-detail h3").filter(has_text="Grass anatomy basics").wait_for()
            assert page.locator("#species-detail .glossary-chip").count()>=10
            page.locator(".view-switch button").filter(has_text="Field ID").click()
            page.locator("#species-detail .field-tile").first.wait_for()
            assert page.locator("#species-detail .field-tile").count()>=3
            page.locator(".view-switch button").filter(has_text="Learner").click()
            page.locator("#species-detail .learner-step").first.wait_for()
            page.locator("#glossary-open").click()
            page.locator("#all-glossary-dialog").wait_for(state="visible")
            assert page.locator("#glossary-list .glossary-chip").count()==156
            page.locator("#glossary-list .glossary-chip").filter(has_text="Ligule").first.click()
            page.locator("#term-dialog").wait_for(state="visible")
            page.locator("#term-close").click()
            page.locator("#all-glossary-close").click()
            page.locator("#all-glossary-dialog").wait_for(state="hidden")
            page.locator("#species-detail figure.photo").first.wait_for(state="visible",timeout=25000)
            assert page.locator("#species-detail .marker-number").count()>0, "Missing visible numbered anatomy targets"
            assert page.locator("#species-detail .source-only-references").count()>0, "Missing safe source-only image references"
            assert page.locator("#species-detail .credit").count()>0
            assert page.locator("#species-detail a[href^='https://']").count()>0
            page.locator("#search").fill("Bothriochloa torreyana")
            page.wait_for_function("document.querySelectorAll('#species-list button').length===1",timeout=12000)
            page.locator("#species-list button").first.click()
            page.wait_for_function("window.location.search.includes('bothriochloa-torreyana')",timeout=25000)
            page.wait_for_function("document.querySelector('#species-detail h2')?.textContent.length>0",timeout=15000)
            page.locator("#species-detail figure.photo").first.wait_for(state="visible",timeout=25000)
            assert page.locator("#species-detail .learner-step").count()>=7
            panels=page.locator("#species-detail figure.photo").count()
            assert panels>0
            gal=page.locator("#species-detail figure.photo").first
            gal.scroll_into_view_if_needed()
            gal.locator("img").evaluate("(img)=>{img.loading='eager';}")
            page.wait_for_function("(()=>{const x=document.querySelector('#species-detail figure.photo img');return x&&x.complete&&x.naturalWidth>0})()",timeout=40000)
            imgdims=gal.locator("img").evaluate("(img)=>[img.naturalWidth,img.naturalHeight]")
            page.locator("#search").fill("Bouteloua curtipendula")
            page.wait_for_function("document.querySelectorAll('#species-list button').length===1",timeout=12000)
            page.locator("#species-list button").first.click()
            page.wait_for_function("window.location.search.includes('bouteloua-curtipendula')",timeout=25000)
            assert page.locator("#species-detail .learner-step").count()>=3, "Missing restored original-card beginner fallback"
            assert page.locator("#species-detail .step-image").count()>=1, "No matching real photo linked to navigation"
            page.locator(".view-switch button").filter(has_text="Field ID").click()
            assert page.locator("#species-detail .field-tile").count()>=3
            page.locator(".view-switch button").filter(has_text="Learner").click()
            overflow=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            if overflow>12:raise AssertionError(f"{name} body horizontal overflow {overflow}px")
            assert not js,(name,js)
            assert page.locator("nav a[href*='Hays-County-Botany/quiz.html']").count()==1
            report["tests"].append({
               "device":name,"viewport":[width,height],
               "species_search":"PASS","source_photo_loaded":"PASS",
               "silver_panels":panels,"loaded_photo_dimensions":imgdims,
               "browser_errors":js,"body_horizontal_overflow_px":overflow,
               "sorghastrum_heading":heading,
               "existing_hub_link":"PRESENT_EXTERNAL",
               "note":"Browser smoke check; manual arrow target validity and cross-family workflow still need review."
            })
            if name=="mobile":
                page.screenshot(path="qa-report/poaceae-mobile-preview.png",full_page=False)
            else:
                page.screenshot(path="qa-report/poaceae-desktop-preview.png",full_page=False)
            context.close()
        engine.close()
    os.makedirs("qa-report",exist_ok=True)
    with open("qa-report/poaceae-browser-smoke.json","w",encoding="utf-8") as f:
        json.dump(report,f,indent=2)
    print("POACEAE_BROWSER_SMOKE",json.dumps(report))
if __name__=="__main__":
    os.makedirs("qa-report",exist_ok=True)
    run()
