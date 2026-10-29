#!/usr/bin/env python3
"""Second original-photo transfer: recheck exact Commons sources, license and image pixels.

Existing public repo images only; never download NEW species images into the project.
If source metadata/image validation fails, keep original image only in old hub.
"""
import hashlib,io,json,re,subprocess,sys,time,urllib.parse,urllib.request,urllib.error
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
from PIL import Image,ImageOps
import imagehash

SRC=Path(sys.argv[1]).resolve()
DEST=Path(sys.argv[2]).resolve()
MIG=DEST/"migration"
ledger_path=MIG/"source-file-ledger.json"
rows=json.loads(ledger_path.read_text())
source_manifest=json.loads((MIG/"poaceae-source-manifest-20261028.json").read_text())
rights=json.loads((MIG/"image-record-review-ledger.json").read_text())
previous=json.loads((MIG/"poaceae-transfer-status.json").read_text())
assert source_manifest["snapshot_commit"]==previous["source_commit"]
assert subprocess.check_output(["git","-C",str(SRC),"rev-parse","HEAD"],text=True).strip()==source_manifest["snapshot_commit"]
assert len(rows)==len(source_manifest["files"])==1402
assert previous["destination_file_counts"]["SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED"]==157
assert previous["destination_file_counts"]["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]==67
byfile={r["path"]:r for r in source_manifest["files"]}
byright={r.get("resolved_path"):r for r in rights}
assert len(byfile)==1402
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b"","Destination tree is dirty"
def gitsha(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def phash(b):
 with Image.open(io.BytesIO(b)) as im:return imagehash.phash(ImageOps.exif_transpose(im).convert("RGB"))
class Stripper(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,v):self.parts.append(v)
def plain(v):
 parser=Stripper()
 parser.feed(str(v or ""))
 return " ".join(unescape(" ".join(parser.parts)).split())
def norm(v):return " ".join(re.findall(r"[a-z0-9]+",str(v or "").lower()))
def licensed(meta):
 raw=plain(meta.get("LicenseUrl",{}).get("value",""))
 url=raw.lower().replace("http://","https://").rstrip("/")
 # Accept exact Creative Commons BY and BY-SA URL with optional /deed.en
 url=re.sub(r"/deed(?:\.[a-z]{2})?$","",url)
 m=re.fullmatch(r"https://creativecommons.org/licenses/(by|by-sa)/([234](?:\.\d)?)",url)
 if not m:return None
 label=("CC BY-SA " if m.group(1)=="by-sa" else "CC BY ")+m.group(2)
 return label,url+"/"
def fetch(url,mode="binary"):
 last=None
 for i in range(4):
  try:
   req=urllib.request.Request(url,headers={
    "User-Agent":"HaysBotanyGrassSourceAudit/1.0 (photograph attribution; github.com/Crking92/Hays-Botany-Poaceae)",
    "Accept":"application/json" if mode=="json" else "image/*,*/*;q=0.8"})
   with urllib.request.urlopen(req,timeout=33) as response:
    if mode=="json":return json.load(response)
    b=response.read(22_000_001)
    if not 2000<len(b)<22_000_001:raise ValueError("IMAGE_LENGTH_UNEXPECTED")
    return b
  except urllib.error.HTTPError as e:
   last="HTTP_"+str(e.code)
   if e.code not in (429,500,502,503,504):break
   time.sleep(2+i*2)
  except Exception as e:
   last=type(e).__name__
   time.sleep(1+i)
 raise ValueError("UPSTREAM_NOT_VERIFIABLE:"+str(last))
def verify(r,photo):
 path=r["path"]; src=(SRC/path).read_bytes()
 expected=byfile[path]
 if len(src)!=expected["bytes"] or gitsha(src)!=expected["git_blob_sha"]:raise ValueError("ORIGINAL_SHA_OR_LENGTH_MISMATCH")
 url=photo.get("source_page") or ""
 # Six original photo records have a commons URL; the 1906 page is not a
 # distinct taxon photo and must not be moved on a CC BY-SA claim.
 if not url.startswith("https://commons.wikimedia.org/wiki/File:"):raise ValueError("COMMONS_EXACT_FILE_URL_UNAVAILABLE")
 title=urllib.parse.unquote(url.split("/wiki/",1)[1]).replace("_"," ")
 target=path.split("/")[4].replace("-"," ")
 name2=" ".join(re.findall(r"[a-z]+",target)[:2])
 if name2 not in norm(title):raise ValueError("SPECIES_NAME_NOT_IN_SOURCE_FILENAME")
 query=urllib.parse.urlencode({
    "action":"query","format":"json","prop":"imageinfo",
    "iiprop":"url|extmetadata","iiurlwidth":"1200",
    "titles":title})
 doc=fetch("https://commons.wikimedia.org/w/api.php?"+query,"json")
 page=list(doc.get("query",{}).get("pages",{}).values())[0]
 if "missing" in page or not page.get("imageinfo"):raise ValueError("COMMONS_FILE_MISSING")
 info=page["imageinfo"][0];meta=info.get("extmetadata",{})
 license=licensed(meta)
 if not license:raise ValueError("CURRENT_SOURCE_CC_BY_OR_BY_SA_NOT_VERIFIED")
 want=norm(photo["license"])
 if norm(license[0])!=want:raise ValueError("CURRENT_SOURCE_CC_LICENSE_DIFFERS:"+license[0])
 artist=plain(meta.get("Artist",{}).get("value",""))
 if not artist:raise ValueError("CURRENT_SOURCE_CREATOR_UNVERIFIED")
 creator=photo["creator"]
 if norm(creator) not in norm(artist):raise ValueError("CURRENT_CREATOR_DIFFERENT:"+artist[:60])
 matched=None; errors=[]
 for addr in [info.get("thumburl"),info.get("url")]:
  if not addr or not addr.startswith("https://"):continue
  try:
   d=int(phash(src)-phash(fetch(addr)))
   if d<=12:matched=d;break
   errors.append("DIST_"+str(d))
  except Exception as e:errors.append(str(e)[:35])
 if matched is None:raise ValueError("ORIGINAL_PHOTO_PIXEL_MATCH_FAILED:"+",".join(errors)[:70])
 return src,{
 "source_path":path,"source_photo_url":url,"creator":creator,
 "current_source_artist":artist[:240],"current_photo_license":license[0],
 "license_url":license[1],"source_git_blob_sha":expected["git_blob_sha"],
 "source_size_bytes":expected["bytes"],"pixel_hash_distance":matched,
 "photographic_permission":"CURRENT_EXACT_CC_BY_OR_BY_SA_AUTHOR_SOURCE",
 "source_url_is_exact":True,"website_deployment":False
 }
targets=[r for r in rows if r["disposition"]=="IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY" and
    (byright.get(r["path"]) or {}).get("decision")=="explicit_reuse_hold" and
    (byright.get(r["path"]) or {}).get("source_page","").startswith("https://commons.wikimedia.org/wiki/File:") and
    (byright.get(r["path"]) or {}).get("license","").startswith(("CC BY ","CC BY-SA "))]
assert len(targets)==5,("Unexpected Commons exact CC candidate set",len(targets))
new=[];failed=[]
for r in targets:
 photo=byright[r["path"]]
 try:
  src,ev=verify(r,photo)
  path=r["path"]; dst=DEST/path
  dst.parent.mkdir(parents=True,exist_ok=True)
  if dst.exists():assert dst.read_bytes()==src
  else:dst.write_bytes(src)
  assert gitsha(dst.read_bytes())==ev["source_git_blob_sha"]
  new.append(ev)
  r["original_hold_reasons"]=r["hold_reasons"]
  r["hold_reasons"]=[]
  r["disposition"]="CURRENT_COMMONS_CC_PHOTO_COPIED"
 except Exception as e:
  failed.append({"source_path":r["path"],"hold_reason":str(e)[:180]})
 time.sleep(1.1)
counts=Counter(r["disposition"] for r in rows)
assert counts["IMAGE_HELD_IN_ORIGINAL_SOURCE_ONLY"]==67-len(new)
assert counts["CURRENT_COMMONS_CC_PHOTO_COPIED"]==len(new)
assert counts["SITE_SPECIFIC_EDUCATIONAL_PERMISSION_IMAGE_COPIED"]==157
assert counts["SOURCE_DATA_COPIED"]==390 and counts["LICENSE_CANDIDATE_IMAGE_COPIED"]==788
report={
 "status":"POACEAE_EXACT_EXISTING_COMMONS_PHOTO_RIGHTS_AND_BYTES_RECHECKED",
 "candidate_original_photos_checked":5,"new_exact_commons_cc_photos_copied":len(new),
 "still_held_original_photos":67-len(new),
 "original_source_files_copied":1335+len(new),
 "public_source_repository":True,"new_site_deployment":False,
 "replacements_or_newly_sourced_images":0,
 "verified_source_photo_records":new,"held_original_photo_records":failed
}
(MIG/"poaceae-existing-commons-photo-transfer.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
ledger_path.write_text(json.dumps(rows,indent=2,ensure_ascii=False)+"\n")
previous["destination_file_counts"]=dict(counts)
previous["destination_bytes_copied"]+=sum(p["source_size_bytes"] for p in new)
previous["stage"]="BOB_HARMS_PLUS_CURRENT_COMMONS_SOURCE_TRANSFER_NOT_DEPLOYED"
previous["remaining_original_source_photos_held"]=67-len(new)
status_path=MIG/"poaceae-transfer-status.json"
status_path.write_text(json.dumps(previous,indent=2,ensure_ascii=False)+"\n")
def git(*args):subprocess.run(["git","-C",str(DEST),*args],check=True)
git("config","user.name","github-actions[bot]")
git("config","user.email","41898282+github-actions[bot]@users.noreply.github.com")
if new:
 git("add","--",*(x["source_path"] for x in new))
 git("diff","--cached","--check")
 git("commit","-m","Preserve five-source Commons CC images that passed exact author, license, pixel and source checks")
git("add","--","migration/source-file-ledger.json","migration/poaceae-existing-commons-photo-transfer.json","migration/poaceae-transfer-status.json")
git("diff","--cached","--check")
git("commit","-m","Record Commons exact-source rights checks and remaining Poaceae original photo holds")
assert subprocess.check_output(["git","-C",str(DEST),"status","--porcelain"])==b""
print("POACEAE_EXISTING_COMMONS_RECOVERY_PASS",json.dumps({k:v for k,v in report.items() if not isinstance(v,list)},sort_keys=True),flush=True)
