#!/usr/bin/env python3
"""Verify all hosted Poaceae images on real Pages; SHA-match every approved Poaceae_002 original."""
import base64, concurrent.futures, hashlib, json, os, struct, time
import urllib.request, urllib.parse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE="https://crking92.github.io/Hays-Botany-Poaceae/site/"
REPORT=ROOT/"audit-live-photo-delivery.json"

def get(rel,method="GET",limit=30_000_000):
    url=urllib.parse.urljoin(BASE,rel)
    if urllib.parse.urlsplit(url).hostname!="crking92.github.io":raise ValueError("Non-Pages URL "+url)
    req=urllib.request.Request(url,headers={"User-Agent":"HaysBotanyPoaceaeLiveQA/20261104","Cache-Control":"no-cache"},method=method)
    with urllib.request.urlopen(req,timeout=28) as r:
        if r.status!=200:raise ValueError("HTTP "+str(r.status)+" "+url)
        mime=r.headers.get("Content-Type","").lower()
        size=int(r.headers.get("Content-Length") or 0)
        body=r.read(limit+1) if method=="GET" else b""
    if len(body)>limit:raise ValueError("Remote file exceeds safe size")
    return body,mime,size

def expected_batch():
    a=json.loads((ROOT/"photo-intake/remote-photo-manifests/poaceae-002-2026-11-04.json").read_text())
    b=json.loads((ROOT/"photo-intake/remote-photo-manifests/poaceae-002-institutional-2026-11-04.json").read_text())
    out={}
    raw=base64.b64decode(a["records_base64"],validate=True)
    assert len(raw)==93*42
    for species_index,pid,observation,sha,ext in struct.iter_unpack(">BII32sB",raw):
        sid=a["species"][species_index]
        name="inat-"+str(pid)+"."+{0:"jpg",1:"jpeg",2:"png"}[ext]
        out.setdefault(sid,{})["media/"+sid+"/"+name]=sha.hex()
    raw=base64.b64decode(b["records_base64"],validate=True)
    assert len(raw)==31*74
    for species_index,gbif,sha,urlhash,lic in struct.iter_unpack(">BQ32s32sB",raw):
        if gbif==1259889635:continue # individual older-version licensing hold
        sid=b["species"][species_index]
        name=f"gbif-{gbif}-{sha.hex()[:12]}.jpg"
        out.setdefault(sid,{})["media/"+sid+"/"+name]=sha.hex()
    assert sum(map(len,out.values()))==123
    for sid,items in out.items():
        for path,sha in items.items():
            assert hashlib.sha256((ROOT/"site"/path).read_bytes()).hexdigest()==sha, path
    return out

def cards_and_gallery():
    data,_,_=get("data/gallery-index.json",limit=4_000_000)
    g=json.loads(data)
    if g.get("species")!=112 or g.get("photo_panels",0)<729:
        raise ValueError("Public Pages gallery still behind approved Poaceae_002 release")
    ids=list(g["entries"])
    if len(ids)!=112:raise ValueError("112 published species not indexed")
    def card(sid):
        data,_,_=get("data/species/"+sid+".json",limit=6_000_000)
        row=json.loads(data)
        if row.get("id")!=sid:raise ValueError("Wrong live species ID "+sid)
        return sid,row
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        cards=dict(pool.map(card,ids))
    return g,cards

def remote_image_status(item):
    url,src=item
    try:
        _,mime,size=get(src,method="HEAD")
        if not (mime.startswith("image/") or mime.startswith("application/octet-stream")):
            raise ValueError("Wrong image Content-Type: "+mime)
        if size and size<200:raise ValueError("Truncated file")
        return None
    except Exception as e:return {"src":src,"reason":str(e)[:180]}

def exact_bytes_status(item):
    sid,src,sha=item
    try:
        body,mime,n=get(src,limit=25*1024*1024)
        if hashlib.sha256(body).hexdigest()!=sha:raise ValueError("Published image SHA256 differs from original")
        if not (body.startswith(bytes.fromhex("ffd8ff")) or body.startswith(bytes.fromhex("89504e470d0a1a0a"))):
            raise ValueError("Public file is not JPEG or PNG")
        return None
    except Exception as e:return {"species":sid,"src":src,"reason":str(e)[:200]}

def main():
    expected=expected_batch()
    latest_error=""
    for attempt in range(30):
        try:
            gallery,cards=cards_and_gallery()
            missing=[]
            for sid,items in expected.items():
                panels={x.get("src"):x for x in cards[sid]["panels"]}
                for src,sha in items.items():
                    p=panels.get(src)
                    if not p or p.get("sha256")!=sha or not p.get("creator") or not p.get("license") or not p.get("source_page_is_exact"):
                        missing.append(src)
            if missing:raise ValueError("Approved photo missing from public species card: "+missing[0])
            print("LIVE_POACEAE_002_CARDS_ALL_123_VISIBLE",gallery["photo_panels"],flush=True)
            break
        except Exception as e:
            latest_error=str(e)
            print("WAITING_FOR_PAGES "+str(attempt+1)+" "+latest_error,flush=True)
            time.sleep(12)
    else:
        raise RuntimeError("123 approved Poaceae_002 photos not confirmed on Pages: "+latest_error)
    links={}; issues=[];credited=0;total=0
    for sid,card in cards.items():
        entries=card["panels"]
        if len(entries)!=gallery["entries"][sid]["count"]:
            issues.append({"species":sid,"reason":"Live card and gallery count differ"})
        for p in entries:
            total+=1
            src=p.get("src")
            if not src:issues.append({"species":sid,"reason":"Missing src"});continue
            if p.get("creator") and p.get("license") and p.get("source_page"):
                credited+=1
            else:issues.append({"species":sid,"src":src,"reason":"Missing individual source or credit"})
            url=urllib.parse.urljoin(BASE,src)
            if urllib.parse.urlsplit(url).hostname=="crking92.github.io":
                links[url]=src
            else:issues.append({"species":sid,"src":src,"reason":"Non-hosted gallery media"})
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        broken=[p for p in pool.map(remote_image_status,links.items()) if p]
    selected=[(sid,src,sha) for sid,items in expected.items() for src,sha in items.items()]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        mismatched=[p for p in pool.map(exact_bytes_status,selected) if p]
    summary={"status":"PASS" if not (issues or broken or mismatched) else "FAIL",
        "live_gallery_panels":gallery["photo_panels"],"live_species":gallery["species"],
        "live_card_panels":total,"panels_with_creator_license_source":credited,
        "unique_hosted_photo_urls_checked":len(links),"broken_photo_urls":broken,
        "card_or_credit_issues":issues,"poaceae_002_approved_originals":123,
        "poaceae_002_byte_identical_public_files":123-len(mismatched),
        "poaceae_002_byte_mismatches":mismatched}
    REPORT.write_text(json.dumps(summary,indent=2)+"\n")
    print("LIVE_POACEAE_PHOTO_DELIVERY_AUDIT",json.dumps({k:len(v) if isinstance(v,list) else v for k,v in summary.items()}),flush=True)
    if summary["status"]!="PASS":raise SystemExit(2)

if __name__=="__main__":main()
