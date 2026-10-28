#!/usr/bin/env python3
"""Verify iNaturalist photo license at the exact observation + photo ID.

One request per second, with caching per observation. Never infer the license
of one photo from the observation's own license or a sibling photo.
"""
import json,re,time
from pathlib import Path
from collections import defaultdict,Counter
from urllib.parse import urlparse
import requests
ROOT=Path(__file__).resolve().parents[1]
def main():
    ledger=json.loads((ROOT/"migration/source-file-ledger.json").read_text())
    accepted={r["path"] for r in ledger if r["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
    rows=[]
    for cp in (ROOT/"content/taxa/Poaceae").rglob("species.json"):
        d=json.loads(cp.read_text())
        for rec in d.get("images",[]):
            f=rec.get("file")
            if not isinstance(f,str) or f.startswith(("https:","http:")):continue
            try:path=(cp.parent/f).resolve().relative_to(ROOT).as_posix()
            except ValueError:continue
            if path not in accepted:continue
            source=str(rec.get("source_page") or "")
            if "inaturalist.org" not in source:continue
            obs=rec.get("source_observation_id")
            if not obs:
                m=re.search(r"/observations/(\d+)",source)
                if m:obs=m.group(1)
            pid=rec.get("source_photo_id")
            if not pid:
                m=re.search(r"/photos/(\d+)",source)
                if m:pid=m.group(1)
            if not pid:
                for field in (rec.get("source_image"),rec.get("archived_original_url"),f):
                    m=re.search(r"/photos/(\d+)|inat[-_](\d{7,})",str(field or ""))
                    if m:pid=m.group(1) or m.group(2);break
            rows.append({"path":path,"obs_id":str(obs or ""),"photo_id":str(pid or ""),"license":rec.get("license"),
                         "creator":rec.get("creator"),"source":source})
    print("INAT_AUDIT_STARTED",len(rows),"exact_observation_and_photo",sum(bool(x["obs_id"] and x["photo_id"]) for x in rows),flush=True)
    unique_obs=sorted({int(x["obs_id"]) for x in rows if x["obs_id"].isdigit() and x["photo_id"].isdigit()})
    session=requests.Session();session.headers["User-Agent"]="HaysBotanyVisualLearner/1.0 (photo license author and source verification)"
    observed={};last_request=0
    for i,obs in enumerate(unique_obs):
        delay=1.1-(time.monotonic()-last_request)
        if delay>0:time.sleep(delay)
        last_request=time.monotonic()
        try:
            res=session.get(f"https://api.inaturalist.org/v1/observations/{obs}",timeout=25)
            res.raise_for_status()
            records=(res.json().get("results") or [])
            if records:
                observed[obs]={str(p["id"]):str(p.get("license_code") or "").lower() for p in records[0].get("photos",[])}
        except Exception as e:
            observed[obs]={"_error":str(e)[:150]}
        if (i+1)%30==0:print("INAT_PROGRESS",i+1,len(unique_obs),flush=True)
    totals=Counter()
    for entry in rows:
        if not (entry["obs_id"].isdigit() and entry["photo_id"].isdigit()):
            status="PHOTO_OR_OBSERVATION_ID_MISSING"
        else:
            photos=observed.get(int(entry["obs_id"]),{})
            actual=photos.get(entry["photo_id"])
            if not actual:status="PHOTO_NOT_FOUND_IN_OBSERVATION"
            else:
                from audit_poaceae_photo_provenance import kind
                expected_bucket=kind(str(entry["license"] or ""))
                actual_bucket=kind(actual)
                status="PHOTO_LICENSE_MATCH" if expected_bucket==actual_bucket and actual_bucket!="UNKNOWN_OR_RESTRICTED" else "PHOTO_LICENSE_MISMATCH"
                entry["live_photo_license"]=actual
        entry["verification"]=status;totals[status]+=1
    result={"total_inat_source_records":len(rows),"unique_observations_queried":len(unique_obs),
            "counts":dict(totals),"records":rows,
            "note":"Only a matching photo ID and matching exact observation photo license qualifies. Photo ID gaps require further original photo work; observation-level license is not a substitute."}
    dest=ROOT/"qa-report/inat-exact-photo-license-review.json";dest.parent.mkdir(exist_ok=True,parents=True)
    dest.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("INAT_EXACT_LICENSE_TOTALS",json.dumps({k:v for k,v in result.items() if k!="records"}),flush=True)
if __name__=="__main__":main()
