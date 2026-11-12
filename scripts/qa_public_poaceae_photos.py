#!/usr/bin/env python3
"""Read-only public Pages photo-pixel and attribution QA for 57 provisional grasses.

Checks the *published*, JavaScript-rendered Poaceae Learner and its external images.
No source photo is downloaded into the repository; no botanical identity or rights
approval is inferred from successful browser rendering.
"""
import json
import os
import time
import urllib.request
from urllib.parse import unquote
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "site/visual-key-lab/hays-candidates.json"
BASE = "https://crking92.github.io/Hays-Botany-Poaceae/site/"
OUT = ROOT / "qa-report/public-provisional-photo-pixels.json"


def json_public(relative):
    req = urllib.request.Request(
        BASE + relative, headers={"User-Agent": "HaysBotany-Public-Photo-QA/1.0",
                                  "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Public HTTP {resp.status}: {relative}")
        return json.loads(resp.read())


def audit():
    local = json.loads(MANIFEST.read_text(encoding="utf-8"))
    candidates = local["candidates"]
    assert len(candidates) == 57, "Configured 57 provisional records changed"
    expected = [c for c in candidates if c.get("approved_gallery")]
    expected_photos = sum(len(c["approved_gallery"]) for c in expected)
    # GitHub Pages commonly lags a merged manifest; retry *only* exact data parity
    # before opening any photo cards. Never convert stale Pages into a success.
    for attempt in range(1, 13):
        public = json_public("visual-key-lab/hays-candidates.json")
        if public == local:
            break
        if attempt < 12:
            actual_public = public.get("candidates", [])
            n_public = sum(len(c.get("approved_gallery") or []) for c in actual_public)
            print(f"Pages parity pending ({attempt}/12): public {n_public} photo refs vs "
                  f"main {expected_photos}; retrying exact data", flush=True)
            time.sleep(5)
    if public != local:
        actual_public=public.get("candidates",[])
        published_refs=sum(len(c.get("approved_gallery") or []) for c in actual_public)
        public_species=sum(bool(c.get("approved_gallery")) for c in actual_public)
        raise RuntimeError("Public candidates manifest differs from current branch; "
                           f"Pages serves {published_refs} refs/{public_species} species, "
                           f"branch has {expected_photos} refs/{len(expected)} species. "
                           "No public pixel counts can be trusted until exact parity.")

    data = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
            page.goto(BASE, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_function(
                "() => (document.querySelector('#count')?.textContent || '').includes('169')",
                timeout=35000)
            for index,c in enumerate(expected, 1):
                photos = c["approved_gallery"]
                record = {"id": c["id"], "scientific": c["scientific"],
                          "configured":len(photos), "visible_with_credit":0,
                          "photos":[]}
                try:
                    page.locator("#search").fill(c["scientific"])
                    matched = page.locator("#species-list button").filter(has_text=c["scientific"])
                    if matched.count() < 1:
                        raise RuntimeError("Species absent from public Learner search")
                    matched.first.click()
                    page.wait_for_function(
                        "(name) => document.querySelector('#species-detail .subtitle')?.textContent?.trim() === name",
                        arg=c["scientific"], timeout=15000)
                    figs=page.locator("#species-detail .gallery figure.photo")
                    if figs.count() != len(photos):
                        raise RuntimeError(f"Rendered gallery has {figs.count()} panels, expected {len(photos)}")
                    for j,phot in enumerate(photos):
                        fig=figs.nth(j)
                        caption=fig.locator("figcaption").inner_text(timeout=8000)
                        links=fig.locator("figcaption a[href]").evaluate_all(
                            "(nodes) => nodes.map(n => n.href)")
                        creator=phot.get("creator", "")
                        license_name=phot.get("license", "")
                        source=phot.get("source_page", "")
                        credit_ok=bool(creator and license_name and creator in caption
                                       and license_name in caption)
                        source_ok=bool(source and any(unquote(link)==unquote(source) for link in links))
                        license_terms=phot.get("license_url","")
                        license_link_ok=bool(license_terms and any(unquote(link)==unquote(license_terms) for link in links))
                        image=fig.locator("img")
                        pixel_ok=False
                        src_ok=False
                        reason=""
                        if image.count():
                            src_ok=image.first.get_attribute("src")==phot.get("src")
                            try:
                                image.first.scroll_into_view_if_needed(timeout=7000)
                                handle=image.first.element_handle(timeout=4000)
                                page.wait_for_function(
                                    "(el) => el && el.isConnected && el.complete && el.naturalWidth > 40 && el.naturalHeight > 40",
                                    arg=handle, timeout=11000)
                                pixel_ok=bool(image.first.is_visible())
                            except (PWTimeout, Exception) as ex:
                                reason=f"Image did not render: {type(ex).__name__}"
                        else:
                            reason="Missing image element / public gallery fallback"
                        passed=bool(pixel_ok and credit_ok and source_ok and src_ok and license_link_ok)
                        record["visible_with_credit"] += int(passed)
                        record["photos"].append({
                            "label":phot.get("label"),"visible_and_credited":passed,
                            "pixels":pixel_ok,"creator_license":credit_ok,
                            "exact_source_link":source_ok,"exact_asset_link":src_ok,
                            "exact_license_terms_link":license_link_ok,
                            "failure":reason if not passed else ""})
                except Exception as ex:
                    record["error"]=str(ex)[:500]
                data.append(record)
                for failure in record['photos']:
                    if not failure['visible_and_credited']:
                        print('PHOTO_QA_FAILURE '+c['scientific']+' '+json.dumps(failure,ensure_ascii=False),flush=True)
                print(f"{index}/{len(expected)} {c['scientific']}: {record['visible_with_credit']}/{len(photos)} visible & credited", flush=True)
        finally:
            browser.close()

    visible=sum(row["visible_with_credit"] for row in data)
    species=sum(row["visible_with_credit"]>0 for row in data)
    return {
        "check":"PUBLIC_RENDERED_BROWSER_IMAGE_AND_CREDIT_QA",
        "source":"Live GitHub Pages in headless Chromium; data parity checked",
        "total_learner":169, "production_scored":112,
        "provisional_taxa":57,
        "configured_photo_refs":expected_photos,
        "configured_taxa_with_photos":len(expected),
        "actual_public_visible_and_credited_photos":visible,
        "actual_public_species_with_visible_credited_photo":species,
        "additional_live_photos_since_2026_11_12_baseline_54":visible-54,
        "additional_photographed_species_since_baseline_32":species-32,
        "zero_configured_gallery_taxa":57-len(expected),
        "not_visible_or_credit_failed":expected_photos-visible,
        "note":"Rendering only. Does not verify species identity, Hays specimen origin, diagnosis, copyright permission or field accuracy.",
        "results":data,
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        summary=audit()
    except Exception as ex:
        summary={"check":"PUBLIC_RENDERED_BROWSER_IMAGE_AND_CREDIT_QA",
                 "status":"BLOCKED_NO_VISIBLE_COUNTS",
                 "error":str(ex)[:600]}
    OUT.write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    minimal={k:v for k,v in summary.items() if k!="results"}
    print(json.dumps(minimal,indent=2),flush=True)
    if summary.get("status")=="BLOCKED_NO_VISIBLE_COUNTS":
        raise SystemExit(2)
    if summary.get("not_visible_or_credit_failed",0) > 0:
        raise SystemExit("Public gallery has "+str(summary["not_visible_or_credit_failed"])+
                         " missing image pixels or required source/credit metadata; inspect QA artifact")

if __name__=="__main__":
    main()
