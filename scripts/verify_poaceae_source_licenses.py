#!/usr/bin/env python3
"""Best-effort independent source-license checks for migrated grass photos.

Verifies explicit Commons File pages in batched Wikimedia queries, and exact
iNaturalist photo IDs via iNat photo API when preserved. All other sources
remain unconfirmed, rather than silently declaring permission.
"""
from __future__ import annotations
import concurrent.futures,json,re,time
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse,unquote
import requests
from audit_poaceae_photo_provenance import kind
ROOT=Path(__file__).resolve().parents[1]
SESSION=requests.Session()
SESSION.headers.update({"User-Agent":"HaysBotanyVisualLearner/1.0 (botanical photo source rights audit; GitHub licensed-asset review)"})
def request_json(url,params=None):
    for i in range(3):
        try:
            res=SESSION.get(url,params=params,timeout=25)
            if res.status_code in (429,500,502,503):
                time.sleep(1.8*(i+1));continue
            res.raise_for_status()
            return res.json()
        except Exception:
            if i==2:return None
            time.sleep(0.5*(i+1))
    return None
def commons_title(url):
    p=urlparse(url)
    if p.netloc!="commons.wikimedia.org":return None
    slug=unquote(p.path).split("/wiki/",1)
    if len(slug)<2 or not slug[1].startswith("File:"):return None
    return slug[1].split("#",1)[0].replace("_"," ")
def canonical(s):
    s=(s or "").lower().replace("_"," ").replace("creative commons","cc")
    if re.search(r"\bcc\s*(?:[- ]?zero|0)\b",s) or "public domain" in s:return "CC0_OR_PD"
    if re.search(r"cc\s*[- ]?by\s*[- ]?nc",s):return "NC_REVIEW_ONLY"
    if re.search(r"cc\s*[- ]?by\s*[- ]?sa",s):return "CC_BY_SA"
    if re.search(r"cc\s*[- ]?by",s):return "CC_BY"
    return "UNKNOWN"
def photos():
    out={}
    for file in (ROOT/"content/taxa/Poaceae").rglob("species.json"):
        taxon=json.loads(file.read_text())
        for x in taxon.get("images",[]):
            p=x.get("file")
            if not isinstance(p,str) or p.startswith(("http:","https:")):continue
            path=(file.parent/p).resolve()
            try:key=path.relative_to(ROOT).as_posix()
            except ValueError:continue
            out.setdefault(key,[]).append(x)
    return out
def main():
    ledger=json.loads((ROOT/"migration/source-file-ledger.json").read_text())
    allowed={x["path"] for x in ledger if x["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
    records=photos()
    commons={}
    inat={}
    for path in allowed:
        rs=records.get(path,[])
        if len(rs)!=1:continue
        source=str(rs[0].get("source_page") or "")
        title=commons_title(source)
        if title:commons.setdefault(title,[]).append(path)
        else:
            explicit=rs[0].get("source_photo_id")
            if not explicit:
                m=re.search(r"/photos/(\d+)",source)
                if m:explicit=m.group(1)
            if explicit and str(explicit).isdigit() and "inaturalist.org" in source:
                inat.setdefault(int(explicit),[]).append(path)
    print("RIGHTS_LOOKUP_START",json.dumps({"commons_titles":len(commons),"exact_inat_photo_ids":len(inat),"total_images":len(allowed)}),flush=True)
    verified={}
    # Commons API understands File: titles and returns license info as displayed at source.
    for n in range(0,len(commons),25):
        batch=list(commons)[n:n+25]
        data=request_json("https://commons.wikimedia.org/w/api.php",{"action":"query","format":"json","prop":"imageinfo","iiprop":"extmetadata","titles":"|".join(batch)})
        pages=(data or {}).get("query",{}).get("pages",{})
        for page in pages.values():
            title=(page.get("title") or "").replace("_"," ")
            if not title:continue
            if title.startswith("File:"):title=title
            meta=(page.get("imageinfo") or [{}])[0].get("extmetadata") or {}
            val=" ".join(str(meta.get(k,{}).get("value","")) for k in ("LicenseShortName","LicenseUrl","UsageTerms"))
            info={"source":"Wikimedia Commons API","license_string":val[:350],
                  "source_url":"https://commons.wikimedia.org/wiki/"+title.replace(" ","_"),
                  "detected":canonical(val)}
            for path in commons.get(title,[]):verified[path]=info
    def inspect_inat(pid):
        d=request_json(f"https://api.inaturalist.org/v1/photos/{pid}")
        rows=(d or {}).get("results") or []
        if not rows:return pid,None
        item=rows[0]
        val=str(item.get("license_code") or "")
        return pid,{"source":"iNaturalist exact photo API","license_string":val,
              "detected":canonical(val),"source_url":f"https://www.inaturalist.org/photos/{pid}",
              "source_photo_id":pid}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        for pid,info in ex.map(inspect_inat,inat):
            if info:
                for path in inat[pid]:verified[path]=info
    rows=[];count=Counter()
    for p in sorted(allowed):
        orig=records.get(p,[])
        expected=kind(str(orig[0].get("license") or "")) if orig else "UNKNOWN"
        check=verified.get(p)
        if not check:status="NOT_INDEPENDENTLY_VERIFIED"
        elif expected=="PUBLIC_DOMAIN_CLAIM" and check["detected"]=="CC0_OR_PD":status="SOURCE_COMPATIBLE"
        elif expected=="CC0" and check["detected"]=="CC0_OR_PD":status="SOURCE_COMPATIBLE"
        elif expected==check["detected"]:status="SOURCE_COMPATIBLE"
        elif check["detected"]=="UNKNOWN":status="SOURCE_LICENSE_UNCLEAR"
        else:status="SOURCE_LICENSE_MISMATCH_REVIEW"
        if expected=="NC_REVIEW_ONLY" and status=="SOURCE_COMPATIBLE":status="SOURCE_CONFIRMED_NC_REVIEW_ONLY"
        count[status]+=1
        rows.append({"path":p,"original_bucket":expected,"verification":status,
                     "checked":check,"source_url":str(orig[0].get("source_page") or "") if orig else ""})
    report={"source_license_verification":dict(count),"attempted_commons_titles":len(commons),
        "attempted_inat_exact_photo_ids":len(inat),"rows":rows,
        "notes":"This checks exact photo source license where API metadata can be matched. Unmatched iNat observation IDs, GBIF and other hosts remain review-only. Even compatible source metadata doesn't by itself verify all attribution or edited derivatives."}
    output=ROOT/"qa-report/independent-source-license-results.json";output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print("RIGHTS_INDEPENDENT_SUMMARY",json.dumps({k:v for k,v in report.items() if k!="rows"}),flush=True)
if __name__=="__main__":main()
