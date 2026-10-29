#!/usr/bin/env python3
"""Source-exact recheck then transfer five EXISTING held Commons CC grass photos.

The photo record's historical CC claim is not sufficient by itself:
current Commons exact file, current photo-level reuse terms, named attribution,
original SHA, exact species and perceptual image pixel match are all required.
No new photos, Pages publication or source-site changes.
"""
import hashlib,io,json,re,subprocess,sys,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image,ImageOps
import imagehash

SOURCE=Path(sys.argv[1]).resolve()
DEST=Path(sys.argv[2]).resolve()
MIG=DEST/"migration"
original=json.loads((MIG/"poaceae-source-manifest-20261028.json").read_text())
rightsfile=MIG/"image-record-review-ledger.json"
reviews=json.loads(rightsfile.read_text())
ledgerfile=MIG/"source-file-ledger.json"
ledger=json.loads(ledgerfile.read_text())
statusfile=MIG/"poaceae-transfer-status.json"
status=json.loads(statusfile.read_text())
assert subprocess.check_output(["git","-C",str(SOURCE),"rev-parse","HEAD"],text=True).strip()==original["snapshot_commit"]
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
assert status["destination_file_counts"]=={
 "SOURCE_DATA_COPIED":390,"LICENSE_CANDIDATE_IMAGE_COPIED":788,
 "SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED":157,
 "SITE_SPECIFIC_AUTHOR_FREE_USE_IMAGE_COPIED":2,
 "SITE_SPECIFIC_AUTHOR_CREDITED_REPRODUCTION_IMAGE_COPIED":3,
 "IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":62}
refs={r["resolved_path"]:r for r in reviews if r.get("resolved_path")}
filerefs={r["path"]:r for r in original["files"]}
def sha(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def phash(b):
 with Image.open(io.BytesIO(b)) as im:return imagehash.phash(ImageOps.exif_transpose(im).convert("RGB"))
class Stripped(HTMLParser):
 def __init__(self):super().__init__();self.d=[]
 def handle_data(self,s):self.d.append(s)
def plain(s):
 p=Stripped();p.feed(str(s or ""));return " ".join(unescape(" ".join(p.d)).split())
def norm(v):return " ".join(re.findall("[a-z0-9]+",str(v or "").lower()))
def download(url,as_json=False):
 last=None
 for i in range(4):
  try:
   req=urllib.request.Request(url,headers={
    "User-Agent":"HaysBotanyPoaceae/1.0 (CC original-image license verification; github.com/Crking92/Hays-Botany-Poaceae)",
    "Accept":"application/json" if as_json else "image/*,*/*;q=0.8"})
   with urllib.request.urlopen(req,timeout=32) as resp:
    if as_json:return json.load(resp)
    b=resp.read(18_000_001)
    if not 2000<len(b)<18_000_001:raise ValueError("IMAGE_EMPTY_OR_OVERSIZE")
    return b
  except Exception as e:
   last=str(e)[:120]
   if isinstance(e,urllib.error.HTTPError) and e.code not in (429,500,502,503,504):break
   time.sleep(1+2*i)
 raise RuntimeError(last or "SOURCE_FETCH_FAILED")
def current_license(meta):
 v=plain(meta.get("LicenseUrl",{}).get("value","")).lower().replace("http://","https://")
 match=re.match(r"^https://creativecommons.org/licenses/(by|by-sa)/([234]\.0)(?:/|$)",v)
 if not match:return None,None
 kind,num=match.groups()
 lic=("CC BY-SA " if kind=="by-sa" else "CC BY ")+num
 return lic,"https://creativecommons.org/licenses/"+kind+"/"+num+"/"
selected=[]
for record in ledger:
 if record["disposition"]!="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY":continue
 r=refs.get(record["path"])
 if r and r.get("source_page","").startswith("https://commons.wikimedia.org/wiki/File:") and r.get("license","").strip().startswith("CC BY-SA"):
  selected.append((record,r))
assert len(selected)==5,[(x[0]["path"],x[1]["license"]) for x in selected]
results=[]
cleared=[]
for record,rec in selected:
 path=record["path"]
 out={"path":path,"species":rec.get("species"),"claimed_creator":rec["creator"],
   "original_license_record":rec["license"],"source_page":rec["source_page"]}
 try:
  original_bytes=(SOURCE/path).read_bytes()
  assert len(original_bytes)==filerefs[path]["bytes"]
  assert sha(original_bytes)==filerefs[path]["git_blob_sha"]==record["git_blob_sha"]
  title=urllib.parse.unquote(rec["source_page"].split("/wiki/",1)[1]).replace("_"," ")
  sid=rec["species"]
  assert " ".join(norm(sid).split()[:2]) in norm(title),("TITLE_SPECIES_NOT_MATCHING",title,sid)
  query=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo",
    "iiprop":"url|extmetadata","iiurlwidth":1200,"titles":title})
  obj=download("https://commons.wikimedia.org/w/api.php?"+query,True)
  page=list(obj["query"]["pages"].values())[0]
  if "missing" in page:raise ValueError("SOURCE_IMAGE_REMOVED")
  info=page["imageinfo"][0]
  metadata=info.get("extmetadata",{})
  label,url=current_license(metadata)
  if label not in ("CC BY-SA 2.0","CC BY-SA 4.0"):
   raise ValueError("CURRENT_LICENSE_NOT_ACCEPTED:"+str(label))
  oldnum=re.search(r"\b(?:2\.0|4\.0)\b",rec["license"])
  if not oldnum or oldnum.group()!=label.rsplit(" ",1)[-1]:raise ValueError("LICENSE_VERSION_CONFLICT")
  author=plain(metadata.get("Artist",{}).get("value",""))
  if not author:raise ValueError("CREATOR_MISSING")
  if norm(rec["creator"]) not in norm(author) and norm(author) not in norm(rec["creator"]):
   raise ValueError("CREATOR_DIFFERENT_FROM_ORIGINAL_CREDIT")
  distances=[]
  for upstream in (info.get("thumburl"),info.get("url")):
   if not upstream or not upstream.startswith("https://"):continue
   try:
    dist=int(phash(original_bytes)-phash(download(upstream)))
    if dist<=12:distances.append(dist)
   except Exception:pass
  if not distances:raise ValueError("NO_MATCHING_UPSTREAM_IMAGE_PIXELS")
  d=DEST/path
  assert not d.exists(),"Unexpected existing image; do not overwrite"
  d.parent.mkdir(parents=True,exist_ok=True)
  d.write_bytes(original_bytes)
  assert sha(d.read_bytes())==record["git_blob_sha"]
  record["original_hold_reasons"]=record["hold_reasons"]
  record["hold_reasons"]=[]
  record["disposition"]="CURRENT_COMMONS_CC_BY_SA_IMAGE_COPIED"
  record["reuse_notice"]="Photo "+label+"; original source and author attribution required"
  record["verified_creator"]=author
  record["verified_license"]=label
  record["verified_license_url"]=url
  cleared.append({"path":path,"source_git_blob_sha":record["git_blob_sha"],
   "bytes":len(original_bytes),"species":sid,"photographer":author,
   "license":label,"license_url":url,"source_page":rec["source_page"],
   "original_license_claim":rec["license"],"pixel_phash_distance":min(distances),
   "publication":False,"adaptations":"Original bytes unchanged; no arrows or extra photo sourcing"})
  out.update(status="TRANSFERRED_ORIGINAL_WITH_VERIFIED_CURRENT_CC_LICENSE",
             verified_license=label,creator=author,phash=min(distances))
 except Exception as e:
  out.update(status="HELD_PENDING_EXACT_SOURCE_REVIEW",reason=str(e)[:150])
 results.append(out)
 time.sleep(0.8)
counts=Counter(x["disposition"] for x in ledger)
assert len(cleared)+counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]==62
assert counts["CURRENT_COMMONS_CC_BY_SA_IMAGE_COPIED"]==len(cleared)
assert all(x["verified_license"] in ("CC BY-SA 2.0","CC BY-SA 4.0") for x in ledger if x["disposition"]=="CURRENT_COMMONS_CC_BY_SA_IMAGE_COPIED")
summary={"stage":"EXISTING_COMMONS_CC_PHOTO_SOURCE_TRANSFER_NOT_DEPLOYED",
 "source_originals_checked":5,
 "new_originals_physically_transferred":len(cleared),
 "original_files_copied_cumulative":1340+len(cleared),
 "held_original_photo_files":counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"],
 "verified_commons_photos_claim_no_new_rights":True,
 "original_hub_untouched":True,
 "website_published":False}
(MIG/"poaceae-existing-commons-license-transfer.json").write_text(
 json.dumps({"summary":summary,"images":cleared,"holds":results},indent=2,ensure_ascii=False)+"\n")
ledgerfile.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+"\n")
status["destination_file_counts"]=dict(counts)
status["destination_bytes_copied"]+=sum(x["bytes"] for x in cleared)
status["current_commons_image_recheck"]=summary
statusfile.write_text(json.dumps(status,indent=2,ensure_ascii=False)+"\n")
subprocess.run(["git","-C",str(DEST),"config","user.name","github-actions[bot]"],check=True)
subprocess.run(["git","-C",str(DEST),"config","user.email","41898282+github-actions[bot]@users.noreply.github.com"],check=True)
group=[x["path"] for x in cleared]+[
 "migration/poaceae-existing-commons-license-transfer.json",
 "migration/source-file-ledger.json","migration/poaceae-transfer-status.json"]
assert len(group)<=100
subprocess.run(["git","-C",str(DEST),"add","--",*group],check=True)
subprocess.run(["git","-C",str(DEST),"diff","--cached","--check"],check=True)
subprocess.run(["git","-C",str(DEST),"commit","-m",f"Transfer {len(cleared)} existing CC BY-SA Commons grass originals after photo, author and current-license matching"],check=True)
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
print("POACEAE_COMMONS_VERIFIED_EXISTING_PHOTOS",json.dumps(summary,sort_keys=True),flush=True)
