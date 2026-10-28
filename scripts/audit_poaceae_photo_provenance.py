#!/usr/bin/env python3
"""Classify every staged photograph's publisher, exact license text and provenance.

This is an evidence inventory, not a rights transfer. Output includes one row
per physical photo and all potentially conflicting canonical metadata records.
"""
from pathlib import Path
from urllib.parse import urlparse
from collections import defaultdict,Counter
import json,re,argparse

def kind(s):
 s=(s or "").lower().strip().replace("_","-")
 if re.search(r"\bcc[- ]?by[- ]?nc",s):return "NC_REVIEW_ONLY"
 if re.search(r"\bcc[- ]?by[- ]?sa",s):return "CC_BY_SA"
 if re.search(r"\bcc[- ]?by",s):return "CC_BY"
 if "cc0" in s or "cc-0" in s:return "CC0"
 if "public domain" in s or "public-domain" in s or "us public" in s:return "PUBLIC_DOMAIN_CLAIM"
 if "not creative commons" in s or "not cc" in s or "copyright" in s or "©" in s or "permission" in s:return "SPECIAL_PERMISSION"
 return "UNKNOWN_OR_RESTRICTED"
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--root",default=".",type=Path)
 p.add_argument("--out",default="qa-report/rights-source-inventory.json",type=Path)
 a=p.parse_args()
 root=a.root.resolve()
 ledger=json.loads((root/"migration/source-file-ledger.json").read_text())
 accepted={x["path"] for x in ledger if x["disposition"]=="LICENSE_CANDIDATE_IMAGE_COPIED"}
 records=defaultdict(list)
 for cp in (root/"content/taxa/Poaceae").rglob("species.json"):
  data=json.loads(cp.read_text())
  for im in data.get("images",[]):
   f=im.get("file")
   if not isinstance(f,str) or f.startswith(("https:","http:")):continue
   try:key=(cp.parent/f).resolve().relative_to(root).as_posix()
   except ValueError:continue
   if key not in accepted:continue
   license_=str(im.get("license") or "")
   src=str(im.get("source_page") or "")
   records[key].append({
      "species":data.get("id"),"license":license_,"license_bucket":kind(license_),
      "creator":str(im.get("creator") or ""),"source":src,
      "domain":urlparse(src).netloc.lower(),
      "public_reuse":str(im.get("public_reuse") or ""),
      "source_photo_id":im.get("source_photo_id"),
      "license_url":str(im.get("license_url") or ""),
      "photo_review":str(im.get("photo_review") or "")[:220],
      "rights_note":str(im.get("archive_license_verified") or "")[:200]
   })
 assert set(records)==accepted,(len(records),len(accepted))
 rows=[];categories=Counter();domains=Counter();review=Counter()
 for path in sorted(accepted):
  rec=records[path]
  buckets={x["license_bucket"] for x in rec}
  decision="MULTIPLE_LICENSE_CONFLICT_REVIEW" if len(buckets)!=1 else next(iter(buckets))
  if any(x["public_reuse"].lower().strip() in ("no","review","pending","") for x in rec):
   review["needs_public_reuse_manual_look"]+=1
  if any(x["domain"] not in ("www.inaturalist.org","inaturalist.org","commons.wikimedia.org","en.wikipedia.org") for x in rec):
   review["unusual_source_domain"]+=1
  categories[decision]+=1
  for v in rec:domains[v["domain"]]+=1
  rows.append({"path":path,"classification":decision,"records":rec})
 report={"photo_files":len(rows),"license_bucket_counts":dict(categories),
    "source_domain_counts":dict(domains.most_common()),"review_flags":dict(review),
    "rows":rows,
    "note":"CC BY-NC and special permissions are NOT automatically suitable for a general public replacement site. This is canonical-record evidence, not independent confirmation at publisher. Held originals remain unchanged."}
 path=root/a.out;path.parent.mkdir(exist_ok=True,parents=True);path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("PHOTO_RIGHTS_TOTALS",json.dumps({k:v for k,v in report.items() if k!="rows"}),flush=True)
if __name__=="__main__":main()
