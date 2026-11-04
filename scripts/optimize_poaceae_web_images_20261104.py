#!/usr/bin/env python3
"""Loss-conscious WEB-ONLY Poaceae image optimisation.
Preserves original site/media JPEG bytes on an immutable pre-optimisation
Git archive branch; never modifies content/taxa originals. Updates the
published species-card modification metadata for every changed JPEG.
"""
from pathlib import Path
from collections import Counter
import io,json,hashlib,subprocess
from PIL import Image,ImageOps,ImageFile
Image.MAX_IMAGE_PIXELS=100_000_000
THRESHOLD=5*1024*1024
MAX_LONG_SIDE=3600
QUALITY=88
ROOT=Path("site")
MEDIA=ROOT/"media"
CARD=ROOT/"data/species"
OUT=Path("migration/poaceae-web-image-optimization-20261104.json")
ORIGINAL_BRANCH="archive/poaceae-full-resolution-before-web-optimization-20261104"
def sha(raw):return hashlib.sha256(raw).hexdigest()
def gitblob(path):
 return subprocess.check_output(["git","hash-object",str(path)],text=True).strip()
def main():
 candidates=sorted(p for p in MEDIA.rglob("*") if p.is_file() and p.suffix.lower() in (".jpg",".jpeg") and p.stat().st_size>THRESHOLD)
 cards={}
 for card in CARD.glob("*.json"):
  d=json.loads(card.read_text())
  for p in d.get("panels",[]):
   src=p.get("src","")
   if src.startswith("media/"):
    cards.setdefault(src,[]).append((card,d,p))
 manifest=[]
 saved=0
 for path in candidates:
  rel=path.relative_to(ROOT).as_posix()
  associations=cards.get(rel,[])
  # Never rewrite an image whose published references cannot be accounted for.
  if not associations:
   print("SKIP_NO_PUBLISHED_PANEL",rel,flush=True)
   continue
  original=path.read_bytes()
  original_blob=gitblob(path)
  try:
   archived_blob=subprocess.check_output(
    ["git","rev-parse",f"origin/{ORIGINAL_BRANCH}:site/{rel}"],
    text=True,stderr=subprocess.DEVNULL).strip()
  except subprocess.CalledProcessError:
   print("SKIP_NOT_IN_IMMUTABLE_FULL_RES_ARCHIVE",rel,flush=True)
   continue
  if archived_blob!=original_blob:
   print("SKIP_ORIGINAL_NOT_MATCHING_ARCHIVED_BLOB",rel,flush=True)
   continue
  with Image.open(io.BytesIO(original)) as source:
   source.verify()
  with Image.open(io.BytesIO(original)) as source:
   # Apply EXIF orientation before stripping location/metadata from the web copy.
   converted=ImageOps.exif_transpose(source).convert("RGB")
   old_size=converted.size
   if max(old_size)>MAX_LONG_SIDE:
    converted.thumbnail((MAX_LONG_SIDE,MAX_LONG_SIDE),Image.Resampling.LANCZOS)
   new_size=converted.size
   b=io.BytesIO()
   converted.save(b,format="JPEG",quality=QUALITY,subsampling=0,optimize=True,progressive=True)
   new=b.getvalue()
   # Avoid destructive transcoding unless there is a meaningful benefit.
   if len(new)>=len(original)*0.82:
    print("SKIP_LOW_SAVING",rel,old_size,new_size,len(original),len(new),flush=True)
    continue
   with Image.open(io.BytesIO(new)) as confirm:
    confirm.verify()
   path.write_bytes(new)
   message=(f"Public web display derivative: EXIF orientation normalized, JPEG quality {QUALITY}, "
            f"progressive, longest side <= {MAX_LONG_SIDE}px; source original retained "
            f"at Poaceae Git branch {ORIGINAL_BRANCH}, blob {original_blob}; "
            f"photographer and source license unchanged.")
   for card,d,p in associations:
    previous=p.get("modifications") or ""
    p["modifications"]=(previous+" | "+message) if previous else message
   saved+=len(original)-len(new)
   manifest.append({"website_image":rel,"original_git_blob":original_blob,
     "original_sha256":sha(original),"website_sha256":sha(new),
     "original_bytes":len(original),"website_bytes":len(new),
     "original_oriented_size":list(old_size),"website_size":list(new_size),
     "published_panel_references":len(associations)})
   print("OPTIMIZED",rel,len(original),len(new),old_size,new_size,flush=True)
 for card,d in {v[0]:v[1] for xs in cards.values() for v in xs}.items():
  if any(m["website_image"] in [p.get("src","") for p in d.get("panels",[])] for m in manifest):
   card.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
 assert all(m["website_bytes"]<m["original_bytes"] for m in manifest)
 report={
  "phase":"WEBSITE_DERIVATIVES_ONLY","original_backup_branch":ORIGINAL_BRANCH,
  "image_threshold_bytes":THRESHOLD,"longest_side_limit_px":MAX_LONG_SIDE,
  "jpeg_quality":QUALITY,"originals_preserved":"Git branch pinned to pre-optimization tree; content/taxa originals untouched",
  "candidate_images":len(candidates),"optimized_images":len(manifest),
  "original_bytes_total":sum(m["original_bytes"] for m in manifest),
  "optimized_bytes_total":sum(m["website_bytes"] for m in manifest),
  "saved_bytes":saved,"images":manifest}
 OUT.parent.mkdir(exist_ok=True,parents=True)
 OUT.write_text(json.dumps(report,indent=2)+"\n")
 print("POACEAE_OPTIMIZATION_SUMMARY",json.dumps({k:v for k,v in report.items() if k!="images"},sort_keys=True),flush=True)
if __name__=="__main__":main()
