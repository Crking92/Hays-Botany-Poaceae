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
def run():
    local=json.loads((LAB/"hays-candidates.json").read_text())
    live=json.loads(download("hays-candidates.json"))
    assert live==local, "Public candidate manifest differs from checked-out main; deployment lag"
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
                    card=page.locator("#list details.card")
                    assert card.count()==1, f"{label}/{species}: expected exactly one filtered research card"
                    root=card.first
                    assert c["scientific"] in root.locator("summary").inner_text()
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
                                    page.wait_for_function(
                                        """([q,ix])=>{
                                          const nodes=document.querySelectorAll('#list details.card');
                                          if(!nodes.length)return false;
                                          const img=nodes[0].querySelectorAll('.checked-gallery figure')[ix]?.querySelector('img');
                                          return !img || img.complete;
                                        }""",arg=[species,i],timeout=8500)
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
