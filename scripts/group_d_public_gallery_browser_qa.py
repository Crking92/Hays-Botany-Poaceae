#!/usr/bin/env python3
"""Read-only public Pages browser test of Group D image pixels, credits and sources.
Never edits shared gallery files or treats a source reference as a Hays voucher.
"""
import json
import os
import pathlib
import time
import urllib.request
from playwright.sync_api import sync_playwright, TimeoutError as BrowserTimeout
ROOT=pathlib.Path(__file__).resolve().parents[1]
LAB=ROOT/"site"/"visual-key-lab"
OUT=ROOT/"group-d-live-evidence"
OUT.mkdir(exist_ok=True)
BASE="https://crking92.github.io/Hays-Botany-Poaceae/site/visual-key-lab/"
SPECIES=[
"lolium-multiflorum","oplismenus-hirtellus","stenotaphrum-secundatum","triticum-aestivum",
"setaria-viridis","polypogon-viridis","dactyloctenium-aegyptium","hordeum-murinum",
"cenchrus-ciliaris","panicum-repens","sclerochloa-dura","sporobolus-cryptandrus",
"bromus-catharticus","lolium-perenne","echinochloa-colona","paspalum-notatum",
"bromus-tectorum"]
def download(name):
    request=urllib.request.Request(BASE+name,headers={
      "User-Agent":"Hays-Botany-GroupD-Visible-Photo-QA/1.0",
      "Cache-Control":"no-cache"})
    with urllib.request.urlopen(request,timeout=30) as response:
        if response.status!=200:raise AssertionError(f"{name}: HTTP {response.status}")
        return response.read()
def _manifest_totals(manifest):
    records=manifest.get("candidates",[])
    return (sum(len(c.get("approved_gallery",[])) for c in records),
            sum(bool(c.get("approved_gallery")) for c in records))

def wait_for_public_manifest(expected, attempts=12, delay=5):
    """Retry transient GitHub Pages deploy lag, but never accept stale or altered gallery data."""
    expected_totals=_manifest_totals(expected)
    observed_totals=None
    for attempt in range(1, attempts+1):
        live=json.loads(download("hays-candidates.json"))
        observed_totals=_manifest_totals(live)
        if live==expected:
            print(f"GROUP_D_PUBLIC_MANIFEST_PARITY_OK refs/species={observed_totals} after_attempt={attempt}",flush=True)
            return live
        print(f"GROUP_D_PUBLIC_MANIFEST_STALE attempt={attempt}/{attempts} expected_refs_species={expected_totals} live_refs_species={observed_totals}",flush=True)
        if attempt<attempts:
            time.sleep(delay)
    raise AssertionError(f"Public candidate manifest differs from checked-out main after {attempts} bounded attempts; expected refs/species={expected_totals}, live={observed_totals}")

def run():
    local=json.loads((LAB/"hays-candidates.json").read_text())
    live=wait_for_public_manifest(local)
    local_by={x["id"]:x for x in local["candidates"]}
    assert len(local_by)==57
    assert all(s in local_by for s in SPECIES)
    assert all(len(local_by[s]["approved_gallery"])>=2 for s in SPECIES)
    # We explicitly test a public HTML page, not just the configured source URLs.
    html=download("hays-candidates.html")
    assert b"checked-gallery" in html and b"figcaption" in html, "Published photo UI absent"
    results=[]
    browser_report={}
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            for label,viewport in [("mobile",{"width":390,"height":844}),
                                   ("desktop",{"width":1280,"height":900})]:
                page=browser.new_page(viewport=viewport,device_scale_factor=1)
                page_errors=[]
                page.on("pageerror",lambda e:page_errors.append(str(e)[:300]))
                page.goto(BASE+"hays-candidates.html",wait_until="domcontentloaded",timeout=60000)
                page.wait_for_function(
                    "() => document.querySelector('#count') && document.querySelector('#count').textContent.includes('of 57')",
                    timeout=45000)
                tested=[]
                # Full 17 species mobile gallery; desktop layout only the 3 priority source-replacement cards.
                subset=SPECIES if label=="mobile" else [
                    "oplismenus-hirtellus","lolium-multiflorum","echinochloa-colona"]
                for species in subset:
                    c=local_by[species]
                    search=page.locator("#search")
                    search.fill(c["scientific"])
                    # Some aliases also contain this scientific name. Find the EXACT
                    # displayed binomial in the summary, not the first fuzzy search hit.
                    cards=page.locator("#list details.card")
                    exact=[node for node in cards.all()
                           if node.locator("summary .latin").inner_text().strip()==c["scientific"]]
                    assert len(exact)==1, f"{label}/{species}: {len(exact)} exact-name cards found"
                    root=exact[0]
                    root.locator("summary").click()
                    fig=root.locator(".checked-gallery figure")
                    assert fig.count()==len(c["approved_gallery"]),(
                        f"{label}/{species}: {fig.count()} public photo cards vs {len(c['approved_gallery'])} configured")
                    photos=[]
                    for i,ref in enumerate(c["approved_gallery"]):
                        figure=fig.nth(i)
                        cap=figure.locator("figcaption").inner_text()
                        links=figure.locator("figcaption a[href]").evaluate_all("(nodes)=>nodes.map(n=>n.href)")
                        assert ref["creator"] in cap and ref["license"] in cap, (
                          f"{label}/{species}/{i}: missing exact photographer/license credit")
                        assert ref["source_page"] in links, f"{label}/{species}/{i}: exact photo source absent"
                        assert ref["license_url"] in links, f"{label}/{species}/{i}: exact license link absent"
                        im=figure.locator("img")
                        if im.count():
                            try:
                                im.scroll_into_view_if_needed(timeout=5000)
                                im.evaluate("(el)=>{el.loading='eager'}")
                                page.wait_for_timeout(450)
                                try:
                                    im.evaluate("(el)=>{if(!el.complete)el.decode().catch(()=>{});}")
                                    handle=im.element_handle()
                                    page.wait_for_function("(el)=>el.complete",arg=handle,timeout=8500)
                                except BrowserTimeout:
                                    pass
                            except Exception as exc:
                                issue=str(exc)[:150]
                            else:issue=""
                        else:issue="Image element replaced by error placeholder"
                        imgs=figure.locator("img")
                        if imgs.count():
                            dims=imgs.first.evaluate("(el)=>({complete:el.complete,width:el.naturalWidth,height:el.naturalHeight})")
                            state="VISIBLE_DECODED" if dims["complete"] and dims["width"]>40 and dims["height"]>40 else "IMAGE_NOT_DECODED"
                        else:
                            dims={"width":0,"height":0,"complete":True}
                            state="FALLBACK_IMAGE_ERROR"
                        photos.append({
                           "index":i,"filename":ref.get("image_filename"),"source_page":ref["source_page"],
                           "creator":ref["creator"],"license":ref["license"],
                           "actual_role":ref.get("role"),"browser_status":state,
                           "natural_width":dims["width"],"natural_height":dims["height"],
                           "credit_and_source_links_visible":True,"error":issue})
                    if label=="mobile":
                        try:
                            root.screenshot(path=str(OUT/(species+".png")),timeout=9000,animations="disabled")
                        except Exception:
                            pass # Image load and captions are separately tested.
                    tested.append({"id":species,"scientific":c["scientific"],
                        "configured_photo_refs":len(c["approved_gallery"]),
                        "visible_photo_pixels":sum(p["browser_status"]=="VISIBLE_DECODED" for p in photos),
                        "all_photo_credits_visible":True,"photos":photos})
                    root.locator("summary").click()
                    page.wait_for_timeout(250) # avoid hammering Commons while scrolling cards
                browser_report[label]={"tested":len(tested),
                     "photo_refs":sum(t["configured_photo_refs"] for t in tested),
                     "visible_photo_pixels":sum(t["visible_photo_pixels"] for t in tested),
                     "species_with_at_least_one_visible_photo":sum(t["visible_photo_pixels"]>0 for t in tested),
                     "missing_credit_count":0,
                     "page_errors":page_errors,"species":tested}
                page.close()
            # Check the SIX original research-trial grasses inside the normal
            # production identifier as well as the separate research galleries.
            first_six=[
                "setaria-viridis","setaria-leucopila","bromus-tectorum",
                "bromus-catharticus","lolium-multiflorum","echinochloa-colona"]
            trial_rows=json.loads((LAB/"provisional-trial-profiles.json").read_text())["profiles"]
            trials_by={x["id"]:x for x in trial_rows}
            assert all(x in trials_by for x in first_six)
            main=browser.new_page(viewport={"width":390,"height":844})
            main.goto(BASE,wait_until="domcontentloaded",timeout=60000)
            main.wait_for_function(
                "() => document.querySelectorAll('#results .result').length >= 130",
                timeout=50000)
            trial_report=[]
            for taxon in first_six:
                t=trials_by[taxon]
                main.locator("#species-search").fill(t["scientific"])
                matching=main.locator("#results button.result")
                exact=[el for el in matching.all()
                       if el.locator(".latin").inner_text().strip()==t["scientific"]]
                assert len(exact)==1, f"{taxon}: expected one exact trial result"
                row=exact[0]
                assert "Research trial" in row.inner_text(),f"{taxon}: unverified result flag missing"
                row.click()
                dlg=main.locator("#detail-dialog")
                assert dlg.evaluate("(el)=>el.open"), f"{taxon}: production dialog did not open"
                assert "Not admitted to the officially scored 112" in dlg.inner_text(), (
                    f"{taxon}: species admitted without voucher signoff")
                figures=dlg.locator(".detail-grid > div")
                assert figures.count()==len(t["photos"]),(
                    f"{taxon}: {figures.count()} displayed vs {len(t['photos'])} trial reference images")
                checked=[]
                for ref in t["photos"]:
                    chosen=None
                    for fig in figures.all():
                        urls=fig.locator("a[href]").evaluate_all("(nodes)=>nodes.map(n=>n.href)")
                        if ref["source_page"] in urls:
                            chosen=fig
                            break
                    assert chosen is not None, (
                        f"{taxon}: original credited trial source page not rendered")
                    assert ref["creator"] in chosen.inner_text() and ref["license"] in chosen.inner_text(), (
                        f"{taxon}: exact credit missing on real trial result")
                    img=chosen.locator("img")
                    if img.count():
                        try:
                            img.scroll_into_view_if_needed(timeout=5000)
                            img.evaluate("(el)=>{el.loading='eager';el.decode().catch(()=>{})}")
                            handle=img.element_handle()
                            main.wait_for_function("(el)=>el.complete",arg=handle,timeout=7500)
                        except Exception:
                            pass
                    if chosen.locator("img").count():
                        pix=chosen.locator("img").first.evaluate(
                            "(el)=>({decoded:el.complete && el.naturalWidth>40 && el.naturalHeight>40,width:el.naturalWidth})")
                    else:
                        pix={"decoded":False,"width":0}
                    checked.append({"filename":ref["image_filename"],
                        "source":ref["source_page"],"photo_visible":bool(pix["decoded"]),
                        "natural_width":pix["width"],
                        "credit_and_source_link_visible":True})
                trial_report.append({"id":taxon,"trial_photos_configured":len(checked),
                    "trial_photos_actually_visible":sum(x["photo_visible"] for x in checked),
                    "photos":checked})
                try:
                    dlg.screenshot(path=str(OUT/("normal-key-"+taxon+".png")),
                                   timeout=9000,animations="disabled")
                except Exception:
                    pass
                main.get_by_role("button",name="Close species detail").click()
                main.wait_for_timeout(200)
            browser_report["normal_production_key_six_trials"]={
                "taxa_tested":6,
                "photo_refs":sum(x["trial_photos_configured"] for x in trial_report),
                "photo_pixels_visible":sum(x["trial_photos_actually_visible"] for x in trial_report),
                "unverified_status_shown_all":True,
                "species":trial_report}
            main.close()
        finally:
            browser.close()
    mobile=browser_report["mobile"]
    # These are verified public card pictures, NOT proof of independent botanical identity.
    report={"site":BASE,"status":"PUBLIC_BROWSER_PHOTO_PIXEL_AND_CREDIT_AUDIT",
      "original_scored_count":112,
      "total_learner_species":169,
      "group_d_species":17,
      "group_d_configured_photo_refs":sum(len(local_by[s]["approved_gallery"]) for s in SPECIES),
      "group_d_photo_refs_checked_mobile":mobile["photo_refs"],
      "group_d_images_decoded_mobile":mobile["visible_photo_pixels"],
      "group_d_species_with_public_visible_pixels":mobile["species_with_at_least_one_visible_photo"],
      "mobile_credits_verified":True,
      "new_group_d_photo_sources_installed":sum(
         any(x["image_filename"]==f for x in local_by[s]["approved_gallery"])
         for s,f in [
          ("oplismenus-hirtellus","Oplismenus hirtellus-flowers.jpg"),
          ("lolium-multiflorum","Lolium multiflorum spikelets1 (6919358915).jpg"),
          ("echinochloa-colona","Echinochloa colona ligule1 (7119935605).jpg")]),
      "site_images_species_id_verification":False,
      "normal_key_six_trial_photo_pixels_visible":browser_report["normal_production_key_six_trials"]["photo_pixels_visible"],
      "normal_key_six_trial_photo_refs_checked":browser_report["normal_production_key_six_trials"]["photo_refs"],
      "normal_key_six_trials_unverified_flag_verified":True,
      "browser_report":browser_report}
    (OUT/"public-photo-browser-results.json").write_text(json.dumps(report,indent=2)+"\n")
    print("GROUP_D_PUBLIC_GALLERY_QA "+json.dumps({k:v for k,v in report.items() if k!="browser_report"}),flush=True)
    for species in mobile["species"]:
        missing=[p["filename"] for p in species["photos"] if p["browser_status"]!="VISIBLE_DECODED"]
        print("GROUP_D_SPECIES_PUBLIC "+json.dumps({"id":species["id"],"visible":species["visible_photo_pixels"],
                     "configured":species["configured_photo_refs"],"missing":missing}),flush=True)
    assert mobile["tested"]==17 and mobile["photo_refs"]>=39
    assert mobile["species_with_at_least_one_visible_photo"]>0,"No public gallery image decoded; investigate website loading"
    return report
if __name__=="__main__":
    run()
