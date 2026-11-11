# Hays Botany — Visual Grass Multi-Access Key Progress

**Updated:** 2026-11-11  
**Scope:** 112 Hays Botany Poaceae species, 53 genera. This is the single progress ledger for the key; do not create per-batch spreadsheets.
**Important:** This tracker distinguishes coverage from verification. A species with one checked character is not a fully verified ID.

## Phase dashboard

| Phase | Status | Progress / evidence | Definition of complete |
|---|---|---|---|
| 1. Complete species framework | **COMPLETE** | **112/112 species** (100%), 53 genera, 9 JSON species files, all load and pass integrity tests | Every indexed species available to candidate filtering, unknown traits permitted |
| 2. Initial top-level morphology **source-coverage** | **INITIAL PASS COMPLETE; DETAIL OPEN** | **112/112 species (100%) have at least one source-backed broad or visible character** after group screening across all 112. Individual head, habit, ligule and awn states remain **partly provisional** and must be checked more deeply. | Initial broad group review and at least one cited morphology character per species; **NOT** full morphology verification |
| 3. Diagnostic genus/species characters | **FIRST CHECKLIST PASS COMPLETE — PASSES 1–13 (112/112 profiles, 100%)** | **315** source-linked anatomical checks across all **112** grasses; last 12 cool-season/cereal and riparian grasses covered. **0/112** fully photo-and-dissection certified. | First species-level checklist coverage complete; deeper morphology, voucher, photo-role, taxonomy and source discrepancies still require review |
| 4. Character-photo matching QA | **IN PROGRESS — HOSTED IMAGE PASSES 1–3, 5–8; SOURCE PREVIEWS PASS 4** | **98/514 (19.1%)** unique hosted photo references visually inspected: **21/112** species have all current Lab gallery photos initially audited; **7** additional species partially reviewed. **73 direct / 25 partial** (18 `PARTIAL_VISIBLE` + 7 legacy `PARTIAL`). The eight Pass 4 source previews overlap this hosted total and are not added again. Exact-image source rights remain open. | Review actual images for the stated structure, verify same-photo source rights and credit, avoid conflating general species images with dissections |
| 5. Full-key and field acceptance | **NOT COMPLETE** | **21/21 Pass 12–13** candidate-retention tests passed on all 112 species; **Pages deployment for final species-data commit succeeded**; real phone testing, exact photo rights/roles and local specimens still require verification | Key and pages function on desktop/mobile and field testing confirms paths and avoids false exclusions |

**How far from completion?** Species framework **and the first complete source-coverage pass** are finished: **112/112** indexed and **112/112** with at least one externally supported morphological character. This is NOT 100% completion of the project. All **112** species now have first-pass Phase 3 source-linked diagnostic checklists (315 checks); no species remain for initial coverage. Remaining work: deeper morphology/character/source reconciliation, verifying photographs show the right parts and have exact-image rights (Phase 4), and real mobile/field acceptance (Phase 5). The key is still a prototype, not fully certified.

## Phase 4 — Pass 8 preview-fallback workflow trial (2026-11-11)

- Actually displayed and inspected **21 new GitHub-hosted grass photographs** across **7 species**: Purple threeawn (*Aristida purpurea*) **3/4**; oldfield threeawn (*A. oligantha*) **3/5**; Texas grama (*Bouteloua rigidiseta*) **3/3**; red grama (*B. trifida*) **2/2**; few-flowered panicgrass (*Dichanthelium oligosanthes*) **2/2**; Ozarkgrass (*Limnodea arkansana*) **4/4**; curlymesquite (*Hilaria belangeri*) **4/5**. **18 DIRECT_VISIBLE, 3 PARTIAL_VISIBLE** new narrowly scoped observations. Hosted-photo cumulative becomes **98/514 (19.1%)**, **73 direct / 25 partial**, **416 unreviewed**; **21** species with complete initial Lab galleries and **7** partially inspected.
- **10 inaccurate, incomplete or overconfident captions corrected.** Key fixes: Texas grama image 0 is *not* a whole-plant habit, only reddish flowering branches; Purple threeawn hand-held awns do not prove attachment of three awns to one fertile lemma; few-flowered panicgrass head images show *open attached green spikelets*, not isolated spikelet dissection or winter rosette; Ozarkgrass i=1 units remain on a branch, not isolated florets. No original image, source/license/creator fields or morphological filter was changed.
- **4 original hosted images returned no usable data** and remain uncounted: Purple threeawn i=3; oldfield threeawn i=0,3; curlymesquite i=5. These are not declared broken or missing; they may be large or unavailable through the present connector. The existing seven unavailable photos from Pass 7 are likewise unchanged.
- **Smaller-preview fallback test:** The named upstream Wikimedia source page for Japanese brome i=3 (*Bromus japonicus sl20.jpg*, Stefan.lefnaer) confirms that smaller web previews exist; however, the GitHub-hosted photo still failed direct retrieval in this environment. The preview cannot establish identical hosted bytes or exact source-image license equivalence. **No fallback preview was credited as an audited hosted original**, and no temporary preview/image was published to this repository. For later automation use the validated local helper to resize *private review copies* only, retaining a pinned original-file SHA for exact comparison.
- **Rights-review flags raised for two already-hosted oldfield threeawn herbarium scans** (indices 4 and 5): the visible UT and Kew sheet images say “copyright reserved,” while gallery metadata presently says CC BY 4.0. This does *not* by itself prove the current license is invalid, but neither should those credits be marked cleared. The exact-source licensing team must reconcile the provider record; original files and metadata retained, no automatic release approval.
- New observations distinguish what is visibly shown from microscopic attachment/measurement claims. Direct image-only evidence is **not** specimen identity proof, a complete botanical diagnosis, or winter date certification. A tawny or green photograph alone does not establish November–February provenance.
- QA invariant checks: **112 species / 53 genera / 514 photo references / 315 first-pass diagnostic checks** unchanged. All nine JSON files parse. Exactly seven species records received new photo-role audits and exactly ten captions changed; all unrelated species fields, credits, source links, license values, photo URLs and diagnostic checks are identical. One existing tracker only, no new Photo Needs Queue or spreadsheet.
- Reference policy unchanged: *Illustrated Flora of North Central Texas* is primary for future source-based morphology, GrassBase secondary, and BONAP distribution verification deferred. The private flora PDF was not freshly opened in this image-role pass and no new numerical key character was asserted. Full mobile/field acceptance and the original release/checksum holds remain open.
- **Efficiency outcome:** 21 actually inspectable images in a 25-targeted review selection, with four immediate failures safely skipped. The source-preview workaround did *not* clear the remaining GitHub-byte retrieval limitation. Do not assert a measured elapsed-time improvement, and do not count thumbnails or repeated images as new hosted reviews.

## Phase 4 — Pass 7 optimized hosted photo QA trial (2026-11-11)

- **21 newly visually inspected original hosted photographs**, rather than source previews, from a 28-image attempted pool. Seven large/unavailable image fetches were **not certified** and remain on existing species audit records for recovery. Total **77/514 (15.0%)** with **437** unreviewed; **55 DIRECT_VISIBLE / 22 partial**. **17/112** complete first Lab photo-gallery reviews, plus **4** partially audited galleries.
- Species/photo indices inspected: Japanese brome (`Bromus japonicus`) 0,1,2,4 (**4/6**); little barley (`Hordeum pusillum`) 1,2,3,4 (**4/5**); Canada wildrye (`Elymus canadensis`) 0,1,2 (**3/5**); Virginia wildrye (`Elymus virginicus`) 0,1,2 (**3/3**); sixweeks fescue (`Festuca octoflora`) 0 (**1/3**); Carolina canarygrass (`Phalaris caroliniana`) 0,1 (**2/2**); `Festuca versuta` 0,1,2,3 (**4/4**). **18 direct / 3 partial** this pass. Zero duplicate or inaccessible-photo review credit.
- **Four caption corrections** narrow anatomy claims: Japanese brome image 0 is green developing (not mature) spikelets; its image 2 does not isolate the lower glume vein count. Canada wildrye image 1 does not isolate a complete attached spikelet pair, and image 2 does not resolve paired glume attachments as definitively as the earlier label suggested.
- Strong verified views include little barley attached green spike and external sheath; Virginia wildrye upright awned spikes; Carolina canarygrass real culm node and pale inner ligule membrane; `Festuca versuta` flowering panicle with exposed anthers and actual basal tuft.
- The seven still-uninspected hosted images are Japanese brome i=3,5; little barley i=0; Canada wildrye i=7,9; sixweeks fescue i=1,2. These were returned without usable image bytes by the GitHub connector and are **not** counted, deleted or automatically labeled defective. Reattempt through smaller/private previews only when feasible; do not block other available photos.
- This **20–25 usable photo QA** workflow uses grouped photo retrieval, only unreviewed originals, one consolidated master tracker, and batched review metadata/caption changes. Existing species IDs, every original photo, creator/source/license metadata, all 315 checklist checks, and morphology filters are retained. Existing reviews not overwritten. Counts and file-diff invariants checked across all nine Lab JSON files; no new photos, queue, spreadsheet, public download or source plates created.
- *Illustrated Flora of North Central Texas* remains primary, and no numerical regional morphology was newly asserted; GrassBase deep reconciliation and BONAP remain deferred. Winter relevance is noted, but neither green nor dry material establishes a November–February collection date without provenance; check original archives before declaring a new seasonal gap.
- **Review limits remain open:** specimen ID, isolated glume/lemma homologies, local-season provenance, actual source-image license validation, the original cross-project public-photo holds and checksum mismatches, and mobile/field acceptance. GitHub-returned blob SHAs document fetched files; upstream image identity/rights were not independently proven.
- **Efficiency trial verdict:** fewer repeated lookups and clearer separation of unavailable photos from successful reviews. Completion per request is **21 actual inspected images**, greater than Pass 6's 14, but a direct elapsed-time benchmark was not recorded; do not claim measured speedup in minutes.

## Phase 4 — Pass 6 winter- and cool-season hosted photo review (2026-11-11)

- Inspected **14 new actual hosted images**, not source previews, from five complete Lab galleries: Texas wintergrass (*Nassella leucotricha*) **2/2**, wild oat (*Avena fatua*) **3/3**, annual bluegrass (*Poa annua*) **6/6**, Texas bluegrass (*Poa arachnifera*) **2/2**, and lanceolate brome (*Bromus lanceolatus*) **1/1**. **11 DIRECT_VISIBLE / 3 PARTIAL_VISIBLE** newly recorded, yielding **56/514 (10.9%)**, **37 direct / 19 partial**, with **14/112** full initial gallery reviews. **458** photo references remain uninspected. Counts include no replays or original-source preview double counting.
- Corrected **8** overconfident or outdated labels without changing a photograph, creator, source link, license, morphological filter, or diagnostic-check text. Key corrections: Poa annua tip not demonstrably boat-prow from its current frame; upper-floret palea not isolated; Poa arachnifera hairs do not establish a sexed three-web female callus; Texas wintergrass photo season not known; Avena formerly provisional captions now scope what is actually visible.
- Important strong images: **Avena** exposed membranous true ligule and hairy bent-awn floret; **Poa annua** collar membrane, flowering anthers and exposed fibrous roots; **Poa arachnifera** dense dry flowering heads. Preserve uncertainty for microscopic attachments, measured parts, rhizomes, species identification, seasonal date and license revalidation.
- **Hairy woodland brome (*Bromus pubescens*) hosted photo i=0 was NOT counted or edited**: repository metadata identifies a JPEG blob, but the connected image read supplied no usable image bytes for viewing. Keep it pending for a smaller original/resized private preview, not as a certified review; no new photo request or replacement was made.
- Host file names and GitHub-provided blob SHAs are retained for each newly reviewed record. The connector returned the image content for the 14 counted photos; no independent SHA-256 calculation, upstream original equality, or license certification is claimed. The 15-photo preparatory set therefore yielded **14 actual inspected / 1 still pending**.
- *Illustrated Flora of North Central Texas* remains the primary regional character authority. This pass did not re-open the private PDF or make new source-based numeric morphology claims. GrassBase deeper comparison and BONAP distribution remain deferred.
- **Winter/dormant check:** Photos show a green basal tuft, green flowers, or dry flowerheads, but photo appearance alone does not establish a November–February collection date or fully dormant rooted habit. Reconcile existing archives before adding seasonal gaps to the one existing Photo Needs Queue. No new downloadable batch or spreadsheet created.
- Existing cross-project held-photo files and checksum mismatches remain unresolved. QA here is photo-role evidence, not final site/mobile acceptance or public rights clearance. Original photo files were not replaced.

## Batch preparation helper validated (2026-11-11)

- Added [the reusable batch helper](../../scripts/GRASS_PHOTO_BATCH.md) and automated tests. It pins GitHub data, selects unreviewed photos, retrieves and hash-checks actual JPEGs, reuses valid cache files, and prepares a credited local HTML review sheet with full-size originals.
- **12/12 automated tests passed**, covering stale data, altered images, changed credits, duplicate reviews, wrong target files, pending reviews, replay safeguards and protected-data preservation. Live snapshot retrieval independently reproduced **112 species / 53 genera / 514 photo references / 315 checks / 42 hosted reviews / 9 full Lab galleries**.
- Replayed the **eight Pass 5 hosted JPEGs** using recorded observations and matching hashes: **zero new audit credit**. Replay cannot stage progress updates.
- Prepared **15 pending photos** across Texas wintergrass, wild oat, hairy woodland brome, annual bluegrass, Texas bluegrass and lanceolate brome. Preparation is not visual QA: hosted progress remains **42/514**, and all 15 need full-size anatomy review.
- The helper stages one proposal for existing species JSON and this single tracker, with an expected-main commit for safe saving and readback. It does not push commits, publish images, start workflows, clear licensing, alter nativity, or add photo-needs queues.
- Owner's source preference reaffirmed: **Illustrated Flora of North Central Texas primary; GrassBase secondary, with deeper GrassBase work deferred**. The owner supplied a readable local PDF whose SHA-256 matches the recorded reference; no PDF or plates were uploaded to GitHub. Original morphology references remain unchanged until actually consulted for a new review.
- Next: use the prepared winter-grass batch for direct photo-to-anatomy review, retain precise limitations and seasonal notes, validate the proposal, and save one checked batch commit. Local snapshots/review forms are working inputs, not duplicate trackers or spreadsheets.

## Phase 4 — Pass 5 hosted Silky/Kleberg follow-through (2026-11-11)

- Completed the eight hosted JPEG inspections deferred by Pass 4: Silky indices **1, 2, 5, 7** and Kleberg **1, 3, 4, 5**. Retrieved actual repository bytes pinned to `4124597e2b2b8c2387b721d9b1528182b6752f70`; **8/8 computed Git blob hashes match the repository tree**. SHA-256, byte length, repository path and per-photo observations are recorded in the existing species JSON audit fields.
- **5 new DIRECT_VISIBLE / 3 PARTIAL_VISIBLE** observations bring cumulative hosted review from **34 to 42/514 (8.2%)**, with **472** still uninspected. Full initial **Lab-gallery** reviews rise from **7 to 9/112**: Silky now **8/8**, Kleberg **6/6**. These are limited image-role reviews, not full original-species archive audits or botanical certification. All **112 species / 53 genera / 514 photo refs / 315 diagnostic checks** remain intact.
- Four captions clarified: Silky's flowering bunch has hidden roots; its blade–sheath view does not fully expose the inner ligule; its scaled isolated spikelet does not prove attachment; Kleberg's overlapping spikelet bases do not unambiguously trace the pedicel.
- Existing original photos, all creator/source/license/modification metadata, prior audit entries, morphology filters and diagnostic checklists preserved. No new public image files, spreadsheets, duplicate trackers, source-photo transfers, nativity changes or publication triggers.

| Species / gallery i | Verdict | Visible evidence | Still not proven |
|---|---|---|---|
| Silky / 1 | DIRECT_VISIBLE | living leafy bunch with multiple erect flowering culms and narrow awned heads | underground rhizomes or exposed rooted crown; inner ligule or attached spikelet-pair anatomy; Texas locality or subspecies |
| Silky / 2 | PARTIAL_VISIBLE | leaf blades joining sheaths around a culm; scattered long hairs near blade-sheath junctions | fully exposed inner ligule membrane and its margin; ligule length or hair origin at this viewing angle |
| Silky / 5 | PARTIAL_VISIBLE | hairy elongated spikelet structure with a dark visibly twisted awn; long marginal hairs and longitudinal surface veins | two separately traceable spikelets and their in-situ pedicel attachment; precise fertile-lemma insertion or complete awn length; lower-glume transverse fringe as a taxon-separating character |
| Silky / 7 | DIRECT_VISIBLE | detached hairy spikelet with longitudinal veins beside ruler divisions | original pedicel attachment in an intact pair; calibrated measurement without explicit scale-unit confirmation; same-voucher association with other gallery images |
| Kleberg / 1 | DIRECT_VISIBLE | two detached contrasting spikelets, one with a conspicuous dark awn; long fine hairs on the outer structures | the original in-situ connection of the pair; precise glume and lemma identities or dimensions without scale |
| Kleberg / 3 | PARTIAL_VISIBLE | ribbed sheath ending in a pale rim around an emergent culm; scattered short sheath hairs | complete true inner ligule at an attached blade-sheath junction; ligule margin type or length from this frame |
| Kleberg / 4 | DIRECT_VISIBLE | two close-associated elongated spikelet units converging near the base; one conspicuous twisted awn and long fine hairs | unambiguous pedicel versus rachis tracing at the overlapping base; precise glume/lemma homologies or awn insertion; same-voucher relationship to other gallery photos |
| Kleberg / 5 | DIRECT_VISIBLE | several narrow awned racemes with exposed slender bases arising close together; visible flowering parts along racemes | microscopic glume or ligule details; measured spikelet lengths; species identity from head shape alone |

**Source hierarchy:** `FLORA_PRIOR_REFERENCE_NOT_RECHECKED`. The private *Illustrated Flora of North Central Texas* PDF is not attached to this continuation, so its existing regional characters remain primary but are not claimed as freshly reread. Consulted the existing [Silky GrassBase account at Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398571-1/general-information) and [Kleberg GrassBase account](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:398528-1/general-information) for membrane-ligule and sessile/pedicelled terminology; no measured character or filter state was changed. BONAP nativity audit remains deferred.

**Licensing / identity boundary:** Hash matches establish identity with the pinned GitHub files, not equality to the upstream Wikimedia originals or current license revalidation. Existing Harry Rose / Macleay Grass Man credits and CC BY 2.0 metadata remain unchanged. The Pass 4 source-preview log is retained as historical evidence, its hosted-review pending lists resolved with a Pass 5 follow-up. Its eight previews are not counted a second time. Existing three public-image holds and two unrelated checksum discrepancies are not cleared.

**Seasonal check:** The eight inspected frames show green/flowering or detached reproductive material, not an established rooted dormant winter tuft or frost-stage whole plant. Other archived views were not visually exhausted, so no new seasonal need was added to the single master Photo Needs Queue. Existing diagnostic unmet roles remain on their species records for queue reconciliation.

**Verification and handoff:** Nine JSON files parsed; unique species IDs and photo indices, photo count, source-linked diagnostic-check count, audit-index references and cumulative verdict counts checked. All unrelated species data and every photo field except the four captions are unchanged. Lane: existing Lab photo-role QA in `Crking92/Hays-Botany-Poaceae/main`; shared claims inspected with no Dichanthium/Lab overlap found. No old-hub edits. This pass does not assert Pages deployment or mobile/field acceptance. Next manageable batch: existing sparse-gallery species (for example Texas wintergrass and Texas bluegrass), followed by archive/queue reconciliation for truly missing anatomy and seasonal views.

## Phase 4 — Pass 4 Wikimedia source-preview anatomy audit (2026-11-10)

- **Eight linked original source-page image previews** inspected for *Dichanthium sericeum* (four) and *D. annulatum* (four): **five directly illustrate a specifically scoped visible structure; three are partial evidence**. This is a **separate source-preview audit**, not a retrieval of the GitHub-hosted bytes. **Hosted originals remain 34/514 (6.6%) and 7/112 species with full hosted gallery reviews**.
- Added `source_preview_audit` observations to the two species JSON records (with per-photo i, direct/partial verdict, and details that **cannot** be verified). Clarified eight source-preview photo labels in all (two earlier “LOCAL” wording fixes plus six new visibility/attachment corrections), while keeping existing image URLs and credits.
- **Anatomy correction:** detached paired-looking spikelets cannot, by themselves, prove sessile-versus-pedicelled attachment. A visible pale sheath lip with the blade absent does not conclusively show a complete true ligule junction. Australian-source reference photos are **not local Hays vouchers**.
- [Detailed Pass 4 source-preview notes](PHASE4_PASS4_SOURCE_PREVIEW_SILKY_KLEBERG_2026-11-10.md). The eight actual hosted JPEGs still need byte-level image-role/rights reconciliation; the existing three held public photos and two checksum discrepancies remain separate unresolved release gates. No photos downloaded or published.

## Phase 4 — larger original-photo QA and diagram separation, Pass 3 (2026-11-10)

- **20 new original GitHub photo bytes opened and examined**, across **six species**: blue grama (5 new), hairy grama (4), tall grama (2), little bluestem (3), silky bluestem (4) and Kleberg bluestem (2). The two previously reviewed Pass 2 images were kept, not double-counted.
- **34/514** linked original photo refs inspected across all passes (**6.6%**). **7/112** species now have every currently listed gallery image initially inspected: prior 3 (buffalograss, sideoats grama, KR bluestem), plus blue grama, hairy grama, tall grama, little bluestem. Silky and Kleberg remain partial.
- Evidence in this pass: **14 DIRECT_VISIBLE** for a restricted specific visual structure; **6 PARTIAL_VISIBLE**, bringing the whole audit to 21 direct and 13 partial. This is **not** equivalent to complete taxon, photograph attribution, voucher or anatomy certification.
- **Corrected Blue Grama photo i=1:** the photo is of detached developing floral/spikelet parts, not an intact mature eyelash seedhead. **Qualified Hairy Grama photo i=3:** crowded hairs/awns visible, but an individual second glume is not anatomically isolated. Neither original photo file was replaced.
- **Distinct icons:** split the former shared Chasmanthium-like flat dangling oat illustration from the Bromus-like lax AWNED oat illustration. Reed plume already has separate logic; preserved ongoing previous refinements.
- [Detailed Pass 3 photo report](PHASE4_PASS3_20_PHOTOS_FIELD_DIAGRAMS_2026-11-10.md). No new images downloaded, no new spreadsheet, no unlicensed book images published, and no changes to unrelated photo-release holds.

## Phase 4 — blue and hairy grama original-photo review, Pass 2 (2026-11-10)

- Actual GitHub image BYTES visually opened for **two additional existing photographs**, one of *Bouteloua gracilis* index 3 and one of *B. hirsuta* index 1; only those two images receive photo-level verdicts. Cumulative **14/514** checked; **3** species with full first gallery passes and **2** species only partially inspected.
- Both new images are **DIRECT_VISIBLE** for a precisely scoped flowerhead comparison. Blue grama: arched comb with no long bare rachis after last spikelet. Hairy grama: a clear dark needlelike **naked branch-axis extension** distinct from lemma awns. Both true ligules, individual glumes, length measurements, and nine other photos remain unverified.
- **Primary flora rechecked directly:** *Illustrated Flora of North Central Texas* PDF pp. 171–172, printed pp. 1247–1248. Corrected blue grama checklist: **apical rudimentary spikelets are absent**, not merely 'tending to end with a rudimentary spikelet'. Hairy grama axis extension and its *B. pectinata* floret-base hair-tuft comparison now explicit.
- Original hosted photo bytes, license labels and credited sources preserved; neither photo's exact source license independently revalidated. No new copyright-restricted flora images placed in repo; full original PDF remains privately attached to the chat rather than archived elsewhere.
- [Pass 2 actual-photo audit](PHASE4_PASS2_GRAMA_COMB_TIPS_2026-11-10.md). Next: inspect blue grama collar photo i=2 and hairy grama glume hairs photo i=3 in another limited-size, saved batch. **500** total photo references remain without direct image inspection.

## Phase 4 — actual existing-photo anatomy audit, Pass 1 (2026-11-10)

- **3/112 species visually inspected** using **12/514 actual image files retrieved as image bytes from the connected GitHub repository**. Five files clearly demonstrate their assigned specific visible role; seven are helpful but only **partial** evidence for the detailed anatomy check. No photo was used as proof of structures it cannot resolve.
- **Buffalograss (5 actual photos):** two useful male-flowering views; no photo independently demonstrates female nonspiny hardened seed-cluster units or opened female spikelets. Collar hairs visible but tiny ciliate **membrane base not resolved**, so the photo caption was corrected.
- **Sideoats grama (2 photos):** orange anthers/white feathery stigmas and numerous one-sided hanging branches directly visible. Still lack true ligule membrane, branch-detachment scar, and extracted individual spikelet.
- **King Ranch bluestem (5 photos):** one strong **scaled awn** image; general radiating head and three blade/collar views are partial for the microanatomy. An attached sessile/pedicelled spikelet pair, true inner ligule tissue and papilla-based blade-hair bases remain unconfirmed.
- Each species now stores `photo_character_audit.photo_roles` with **per-image index, evidence verdict, visibly shown structures and NOT-proven structures**, plus `unmet_roles` for reconciliation against the existing SINGLE master Photo Needs Queue. No extra spreadsheet, duplicate queue or downloaded photo was created.
- **Metadata on author, source page and license is present but independent exact-image rights/source verification is still pending.** Earlier held-public-image/checksum problems remain separate blockers.
- [Phase 4 Pass 1 — actual image-by-image audit report](PHASE4_PASS1_ACTUAL_PHOTO_ROLE_AUDIT_2026-11-10.md). Suggested next group: blue/hairy grama, little and Kleberg bluestems. Keep batches small.

## Cross-project release-gate caution (2026-11-10)

The separate **Poaceae comprehensive migration gates (NO deployment)** workflow failed on a **pre-existing broader source/photo-release audit**, distinct from the 112-species visual key's 25/25 candidate-retention tests. [Failing workflow run](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/42915891685) reported **3 held image files in the PUBLIC repository** and **2 source checksum mismatches**; these were not modified, removed, or cleared in this morphology pass. They require exact-path source/photo rights and byte-identity investigation in the appropriate photo-quality workflow before any public release claim. Manual photo inspection and release rights cannot be inferred from a successful key metadata test.

## Phase 4 — metadata-only triage / first photo QA priorities (2026-11-10)

**This is only an inventory based on existing species photo-reference metadata, NOT an inspection of the original images, cropped anatomy, licenses or rights. Do not promote any photo to diagnostic-certified from these counts.**

- **112 species / 514 total linked photo references**: **1 species with zero**, **10 species with one**, **15 species with two**, and **86 species with three or more**. Linked image quantity is not diagnostic anatomical image quality.
- **No photo:** *Muhlenbergia ×involuta* (Canyon / Edwards Plateau muhly) — preserve current zero and source/rights gap; DO NOT substitute Lindheimer or seep muhly parent photos as a true hybrid.
- **Only one linked photo:** *Bromus pubescens, Eragrostis intermedia, Muhlenbergia lindheimeri, Sporobolus compositus, Bromus lanceolatus, Chloris ×subdolichostachya, Erioneuron pilosum, Muhlenbergia reverchonii, Tridens flavus, Tridentopsis mutica*. These are first **visual inspection** candidates, not automatic re-download requests.
- **Two linked photos (15 species):** among them high-value Kyle comparisons *Poa arachnifera, Dichanthelium oligosanthes, Sorghum halepense, Bouteloua curtipendula, Nassella leucotricha* and *Urochloa texana*. Exact ligules, glumes, lemma/palea or dormant stages may already be visible — check the current approved originals before declaring any gap.
- Start photo role QA with **0/1-photo species**, then proceed to anatomy-critical **2-photo species**. Inspect image itself with correct-species provenance, rights/license and credit, whole plant/head/ligule/lemma/glumes/etc., and whether its existing crop/arrow actually points at the named structure. Reuse existing approved images where possible. Put **only actual missing roles** in the existing single master Photo Needs Queue, no new sheets.
- The separate comprehensive release audit most recently still flagged **3 held image files publicly present** plus **2 source checksum mismatches**. These are unresolved hard blockers for full image clearance and need exact-path and metadata/byte identity checks; **no image file has been modified, deleted or newly published** by Phase 3 or this triage.
- Phase 5 actual mobile tap/scroll/photo load and authenticated Hays County field specimens remain independently open. The final GitHub Pages build for 112/112 first-pass checklist page completed successfully, but that is NOT an approval of photo rights, image accuracy or field determinations.

## Phase 3 — completed first-checklist coverage (Passes 12–13, 2026-11-10)

- **112/112 indexed species** now have first-pass source-backed anatomical comparison prompts, **315 checks total**. **0/112** are fully verified with same-plant diagnostic image/photo credits, dissection, and field acceptance. This is checklist coverage complete, NOT overall project complete.
- **Pass 12:** seven cool-season/cereal grasses and 21 checks — *Elymus canadensis*, *E. virginicus*, *Hordeum pusillum*, *Phalaris caroliniana*, *Catapodium rigidum*, *Polypogon monspeliensis*, *Secale cereale*. Compare glume BASE V-versus-U shapes in wildryes with hybrid caution; 3 separate spikelets per barley node versus 1 multi-floret rye spikelet; two sterile plus one fertile floret in Carolina canarygrass; long glume AWNS, not Setaria bristles, in annual beardgrass.
- **Pass 13:** five wetland/riparian grasses and 15 checks — *Chasmanthium latifolium*, *Arundo donax*, *Phragmites australis*, endangered *Zizania texana*, and *Zizaniopsis miliacea*. Distinguish hairs on Arundo LEMMAS from Phragmites RACHILLA INTERNODES; keep Phragmites native/invasive LINEAGE undetermined without the appropriate evidence. Texas wild-rice is endangered; lawful nondisturbing observation only. Giant cutgrass male and female spikelets share flowering branches, unlike Texas wild-rice's separated sex branches.
- **21/21 Passes 12–13 representative candidate-retention tests passed**. Nine valid JSON species files, 112 unique IDs, 514 existing photo references, 315 complete nonempty source-linked diagnostic check entries. These tests only check a selection of filter paths; they are NOT positive field species determinations.
- **Final Pass 13 species-data commit** `40381e13d0ee9e9985db6402fddb28b76eff7b9e` has a **successful GitHub Pages deployment and Poaceae Learner dry-run QA**. Following progress-banner/tracker commits may have separate deployment status.
- **Still open:** Current broad-category image and mobile UX inspection; exact-photo structure visibility/licensing and credit checks; local voucher/taxon-concept QA; protected species handling; Hays/target county nativity via BONAP NAPA. Earlier comprehensive migration/photo-release workflow flagged three held images in public source and two checksum discrepancies; remain unremediated here.
- **Next primary work phase:** Photo-character-role QA and release rights, in small groups, while maintaining a single master Photo Needs Queue; then live phone and field identification testing. Do not label all 112 species photo-certified.

## Phase 3 — latest cumulative status (Pass 11, 2026-11-10)

- **100/112 grasses (89.29%)** now have first source-backed anatomy checklists and **279** source-linked structure checks. **12 species** remain for full first-pass coverage. **0/112** certified by same-plant botanical dissection and actual exact-role photographs.
- Pass 11 added **6 species / 18 checks**: *Bouteloua dactyloides* (Buffalograss), *Cynodon dactylon* (Bermudagrass), *Hopia obtusa* (Vine mesquite), *Erioneuron pilosum* (hairy woollygrass), *Munroa pulchella* (fluffgrass), and *Limnodea arkansana* (Ozarkgrass).
- Botanical distinctions: Buffalograss often dioecious, with **male combs and female hard non-spiny bur-like heads**; Cenchrus's spiny fused-bristle burs are different structures. Both `combs` and `burrs` now retain Buffalograss as possible. Bermudagrass has digitate, **one-flowered** spikelets, and BOTH stolons and scaly rhizomes; goosegrass has 5–7 FLORETS per spikelet.
- Vine mesquite has swollen **hairy stolon nodes**, a few short unilateral flowering rays with relatively **rounded, blunt 3.4–4 mm spikelets**, and 1–2mm true membranous ligule. Hairy woollygrass has multi-flowered heads above bare culms; Munroa has short flowering packets within LEAFY fascicles. *Limnodea* has 3–5-veined glumes, a sterile rachilla extension, and one strongly bent ~8–11mm lemma awn.
- **Source discrepancy:** Munroa true ligule ~0.5mm hair fringe under Kew GrassBase vs FNA older taxon treatment `Dasyochloa pulchella` giving 3–5mm. Neither used as rigid exclusive species cutoff. Accepted name `Munroa pulchella`, historical names retained as synonyms.
- **24/24 Pass 11 candidate-retention tests passed**, including female/male Buffalograss, dual Bermudagrass ligule/habit, and earlier vulnerable cases; **112 unique IDs and 514 existing photo references** intact. This is filter-integrity QA, not a proven real-world ID.
- **Mobile CSS source check:** `viewport` meta tag exists; work area stacks at <=830px and species photo detail becomes a single column at <=480px. Pass 11 raised narrow-screen result filter tap targets to 44px min, close to 44×44px, and primary question buttons to 44px min. **No real-device/touch testing performed yet.** User can use the same public GitHub Pages URL on phone and laptop.
- No photos imported or deleted, no licensing or county-native status changed, and no separate spreadsheet generated. Prior comprehensive photo-release blocks **3 held source files publicly present / 2 checksum mismatches** still await separate investigation.
- [Pass 11 turf/anatomy/mobile report](TOP_DOWN_PHASE3_PASS11_TURF_AND_UNUSUAL_HEADS_2026-11-10.md) · [Pass 10 muhly/dropseed/Hilaria](TOP_DOWN_PHASE3_PASS10_MUHLIES_DROPSEEDS_HILARIA_2026-11-10.md).
- **Next two groups:** 7 cool-season/cereal look-alikes (Canada/Virginia wildryes, little barley, Carolina canarygrass, fern grass, annual beardgrass, cereal rye), then 5 riparian species (inland sea oats, giant reed, common reed, Texas wild-rice, giant cutgrass). After Phase 3 first coverage, Phase 4 photo-role/rights and Phase 5 live/mobile/field verification remain substantial.

## Phase 3 — latest cumulative status (Pass 10, 2026-11-10)

- **94/112 grasses (83.93%)** have first source-backed species anatomy checklists, now **261** botanical examination questions; **18** species remain to cover before Phase 3 first checklist coverage is complete. **0/112** have full exact same-plant photo/dissection certification.
- This pass added **12 species / 36 checks**: 7 *Muhlenbergia* (Lindheimer, seep, Canyon hybrid, pine, nimblewill, aparejo, tumblegrass), 3 *Sporobolus* (tall/composite, hidden/rough, poverty), and 2 *Hilaria* (curlymesquite, tobosa).
- Especially useful comparisons: Lindheimer and seep muhly **true ligule length, blade width, relative glume length** and panicle aging; Canyon hybrid **central 0.5–2 mm awn arising between two tiny lemma teeth** with parentage *M. lindheimeri × M. reverchonii* explicitly retained and ID/photo-license provisional; nimblewill **surface rooting stolons and minute upper glume** versus aparejo **scaly underground rhizomes and 0.6–1 mm full glumes**.
- Source/season nuance: Kew calls Lindheimer's panicle relatively narrow/contracted; UT Texas source describes **older more spreading**. Both `long_narrow_panicle` and `airy` now accepted visually; the source conflict is not a blanket hybrid proof. Historical tumblegrass `Schedonnardus paniculatus` is a SYNONYM of accepted `Muhlenbergia paniculata`, whose spread one-sided branches fit both `wiry` and `one_sided` top-level views.
- True three-spikelet fascicles (central fertile plus two lateral mostly male spikelets) distinguish **Hilaria** reproductive structure from *Aristida* three lemma awns. Curlymesquite stolons vs tobosa short rhizomes separate the two better than false-spike length alone.
- The Texas *Sporobolus compositus/clandestinus* species complex has genuine expert determination conflicts. Gland/lemma hair and wet-pericarp tests require authenticated ripe material; UT's pericarp critique flags gelatinized vs loose terminology as ambiguous. Do not use a binary wet-grain shortcut as exclusive ID.
- **32/32 new candidate-retention scenarios passed**, including all revised multi-state muhly/dry panicle choices and prior trouble spots; **112 unique species in nine JSON files and 514 photo references preserved**. Tested filter outcomes are NOT field specimen determinations.
- The **Canyon muhly hybrid still has 0 hosted key photo references**; UT PlantPics source-labeled images have been found but their exact public rehost rights are not verified; no surrogate parent photos uploaded. Previously flagged **3 held public photos / 2 checksum discrepancies** remain separate Phase 4 source-photo blockers, untouched.
- [Pass 10 Muhlenbergia/Sporobolus/Hilaria report](TOP_DOWN_PHASE3_PASS10_MUHLIES_DROPSEEDS_HILARIA_2026-11-10.md) · [Pass 9 seasonal Panicum/Dichanthelium](TOP_DOWN_PHASE3_PASS9_DICHANTHELIUM_PANICUM_2026-11-10.md).
- **Next:** list remaining 18 exact species IDs; finish their first-pass anatomical checklist in 1–2 controlled batches. Then proceed separately with Phase 4 photo-role/attribution and Phase 5 live/mobile/field verification. The framework/first source coverage are done, not overall certification.

## Phase 3 — latest cumulative status (Pass 9, 2026-11-10)

- **82/112 species (73.21%)** with at least one source-backed first-pass anatomical checklist; **225** distinct detailed checks. **30** remain without this first checklist. **0/112** fully certified from same authenticated specimen, exact anatomical photographs, and local field acceptance.
- Pass 9 adds **8 grass records / 24 checks**: *Dichanthelium commutatum, D. oligosanthes, D. lindheimeri, D. pedicellatum, Panicum hallii, P. virgatum, P. capillare,* and *P. coloratum*.
- Major educational correction: the group has **seasonal growth differences**. *D. oligosanthes* commonly forms a real winter rosette and secondary fall panicles; the Williamson County description of **corm-based D. pedicellatum explicitly says NOT rosetted**. Teach spring versus fall phases where supported, but NEVER use rosette absence to eliminate every Dichanthelium.
- Small collar anatomy: *D. commutatum* FNA gives a tiny **ciliate membrane** while WFO gives minute fringe/absent; visual answers `hairs`, `membrane`, and apparently `absent` are allowed pending same-plant collar QA. *Panicum virgatum* has a ciliate membrane ligule that can abrade and leave a WHITE hair fringe; **upper blade hair TRIANGLE** is a different structure; both `membrane` and hairlike visible collar states allowed.
- *P. hallii* lower sterile floret PALEA descriptions conflict across sources; no misleading positive/negative test added. *P. coloratum* has a male lower floret with developed palea but needs true flowering specimen; *P. capillare* annual tumblehead and swollen sheath-hair bases are distinctive with anatomy.
- **26/26** new candidate-retention scenarios passed across all nine species files, with **112 unique IDs, 514 existing image references** and complete source-linked check fields. No photo bytes imported or altered; no county-nativity relabeling.
- Separate comprehensive image-release audit blocker remains **3 held public-source image files and 2 source checksum mismatches**, unresolved here. Photo anatomical role certification and live/mobile field testing remain separate.
- [Pass 9 report — Dichanthelium & Panicum](TOP_DOWN_PHASE3_PASS9_DICHANTHELIUM_PANICUM_2026-11-10.md) · [Pass 8 — Tridens allies](TOP_DOWN_PHASE3_PASS8_TRIDENS_TRIDENTOPSIS_TRIPLASIELLA_2026-11-10.md).
- **Next recommended Phase 3 group:** *Muhlenbergia* and remaining dropseeds/curlymesquite; keep Canyon muhly hybrid photo gap and exact-name hybrid ID provisional.

## Phase 3 — latest cumulative status (Pass 8, 2026-11-10)

- **74/112 species (66.07%)** now have a first source-linked anatomy checklist containing **201** detailed botanical checks. **38** grasses remain before the full first pass is complete. **0/112** are fully same-specimen dissection and photo-character certified.
- Pass 8 added **6 species and 18 checks**: White Tridens (*Tridens albescens*), Purpletop (*T. flavus*), Texas Tridens (*T. texanus*), Buckley's fluffgrass (*Tridentopsis buckleyana*), slim tridens (*Tridentopsis mutica*), and lovegrass tridens (*Triplasiella eragrostoides*).
- Useful morphological distinctions: narrow *T. albescens* versus *Tridentopsis mutica* with different **lemma nerve hair**; *T. texanus* short glumes versus *T. albescens* glumes nearly lemma-length; *Tridentopsis buckleyana* fewer florets and **lower glume longer than upper**; *Triplasiella* genus supported by **smooth/scabrous palea keels, wide open panicle and lack of upper sheath cleistogamy**.
- Synonym caution: `Triplasiella eragrostoides` is the accepted name; older `Tridens eragrostoides` and `Tridentopsis eragrostoides` are the **same plant**, not extra species. Exact older descriptions need source name concept crosswalk. Tiny **ciliate membrane** ligules in `T. flavus`, `T. texanus`, and `Tridentopsis mutica` may appear hairlike; multi-state visual answers allowed, but the anatomy is not two separate ligules.
- **25/25** new visual candidate-retention regression tests passed; all nine JSON species files still load 112 unique species IDs, with **514 existing photo links** intact; source-linked diagnostics have required fields.
- No source-gallery changes, photos, licensing changes, county-nativity edits or extra spreadsheets. The separate **3 held public-source image files and 2 checksum mismatches** remain in the independent comprehensive photo release gate.
- [Pass 8 Tridens group report](TOP_DOWN_PHASE3_PASS8_TRIDENS_TRIDENTOPSIS_TRIPLASIELLA_2026-11-10.md) · [Pass 7 lovegrasses](TOP_DOWN_PHASE3_PASS7_ERAGROSTIS_2026-11-10.md).
- **Next anatomy group:** *Panicum* and *Dichanthelium* (including winter rosettes and exposed vs hidden flowering heads), then *Muhlenbergia*. Finish Phase 3 coverage before claiming photo-level or field-tested readiness.

## Phase 3 — latest cumulative status (Pass 7, 2026-11-10)

- **68/112 species (60.71%)** now have a first source-linked diagnostic anatomy checklist, **183** character checks. **44** species still lack their first Phase 3 checklist; **0/112** certified through actual same-plant photo macro and specimen dissection.
- Pass 7 added **7 species / 21 checks**, completing all indexed *Eragrostis*: purple lovegrass (*E. spectabilis*), plains (*E. intermedia*), sand (*E. trichodes*), stinkgrass (*E. cilianensis*), bigtop (*E. hirsuta*), mourning (*E. lugens*), red (*E. secundiflora*).
- Most useful distinctions: true inner ligule versus longer sheath-mouth hairs; sheath BODY hair in *E. hirsuta* versus the smoother sheath of *E. lugens*; typical small 2–6-flowered spikelets in *E. hirsuta* vs dense many-flowered *E. secundiflora*; craterlike gland pits in *E. cilianensis*; attached floret count, 3-veined lemma, 2-keeled palea, and branch-axil pubescence in the airy-panicle trio.
- Flagged real source differences: *E. spectabilis* ligule **hairs vs tiny membrane** (Kew vs Missouri); *E. intermedia* knotty **rhizomes described in UT Williamson County** but absent in a different Arizona treatment; *E. secundiflora* species-level Kew and regionally accepted FNA *subsp. oxylepis* floret-number ranges differ. Safe broad filter allows two visual answers on the first two until a diagnostic same-plant photo or specimen resolves them.
- **21/21 Pass 7 candidate-retention tests passed**, including multiple-appearance variants and important prior cases. Nine valid species JSON files remain **112 unique IDs and 514 existing photo references**. These tests detect false exclusions in sampled paths, not confirm a true plant identification.
- No photo bytes or permissions touched, no spreadsheet duplicated, no county native-status relabeling. Prior comprehensive release QA concerns (3 held public-source files / 2 checksum mismatches) remain unresolved outside morphology lane; do not mark the full website production-ready.
- [Pass 7 Eragrostis details](TOP_DOWN_PHASE3_PASS7_ERAGROSTIS_2026-11-10.md) · [Pass 6 riparian](TOP_DOWN_PHASE3_PASS6_RIPARIAN_ONE_SIDED_2026-11-10.md) · [Pass 5 Paspalum](TOP_DOWN_PHASE3_PASS5_PASPALUM_SIGNALGRASS_2026-11-10.md).
- **Next:** Remaining Tridens/Tridentopsis/Triplasiella, then *Panicum/Dichanthelium* including winter rosettes, and *Muhlenbergia*. Continue confidence and season boundaries.

## Phase 3 — latest cumulative status (Pass 6, 2026-11-10)

- **61/112 species (54.46%)** have their initial source-backed species-specific anatomy checklist; **162** linked diagnostic structure checks total, with **51** species remaining before complete first-pass checklist coverage. This is not the number of species certified by actual anatomy photography or specimen dissections (**0/112** fully certified).
- Pass 6 adds **8 species / 24 checks**: southern crabgrass (*Digitaria ciliaris*), fall witchgrass (*D. cognata*), green sprangletop (*Disakisperma dubium*), mucronate sprangletop (*Dinebra panicea* subsp. *mucronata*), Texas cupgrass (*Eriochloa sericea*), barnyardgrass (*Echinochloa crus-galli*), goosegrass (*Eleusine indica*), rice cutgrass (*Leersia oryzoides*).
- Key anatomical distinctions: cup-like reduced lower glume/callus and **hair-fringe ligule** on Texas cupgrass; **no true ligule** on barnyardgrass despite possible collar hairs; **5–7-flowered Eleusine** versus **two-flowered paired Digitaria** spikelets; **glumeless one-flowered Leersia** versus **Dinebra/Disakisperma multiflowered**; hidden lower-sheath flowering in Disakisperma versus upper-sheath flowering in Leersia.
- Data corrections: *E. sericea* unknown ligule now **hair fringe** with Kew + Texas A&M citations; *D. ciliaris* broad growth habit permits `mat` + `tuft`; *Dinebra panicea* subsp. *mucronata* morphology **species-level only**, subspecies not voucher verified.
- **21/21 new candidate-retention tests passed** for the new/revised species and vulnerable older cases, across **112 unique species and 514 existing photo references** in 9 intact JSON files.
- **No photo bytes changed, no source-photo review claimed, no separate spreadsheets generated**. Photo-release blockers remain 3 held public-source images and 2 checksum mismatches as tracked above. Live site deployment and image/field diagnostics still need their separate Phases 4–5.
- [Pass 6 riparian anatomy report](TOP_DOWN_PHASE3_PASS6_RIPARIAN_ONE_SIDED_2026-11-10.md) · [Pass 5 Paspalum & signalgrass](TOP_DOWN_PHASE3_PASS5_PASPALUM_SIGNALGRASS_2026-11-10.md).
- **Next:** lovegrasses (*Eragrostis*), *Panicum/Dichanthelium* and *Muhlenbergia* look-alikes, paying attention to dormant winter rosettes, panicle branch anatomy and tiny spikelets.

## Phase 3 — latest cumulative status (Pass 5, 2026-11-10)

- **53 of 112 grass species (47.32%)** now have a first source-backed anatomical checklist; **138** individual source-linked structure checks; **59** species remain for first-pass coverage. **Zero** species are certified at full specimen dissection + exact-image character-role level.
- Pass 5 added **9 species / 27 anatomical checks**: all six in-scope *Paspalum* species (knotgrass, Dallisgrass, Florida paspalum, *P. pubiflorum*, thin paspalum, Vaseygrass), plus *Urochloa texana*, *U. fusca*, and *U. reptans*.
- Important new distinctions: **lower glume usually absent in Paspalum** (rare tiny vestige in *P. distichum*) versus **developed lower glume in Urochloa**; Dallisgrass 5–7 veins on **both** upper glume and sterile lemma versus Florida paspalum **5 upper / 3 lower sterile** and Vaseygrass **3 / 3**; spikelet **single versus paired**, size and margin hair length.
- Safety corrections: *Paspalum distichum* usually has two head branches but FNA allows a third, so both `paired_spikes` and general `one_sided` are eligible. *Urochloa texana* has a **ciliate membrane** true ligule, which can appear as hairs; broad visual filter allows both `membrane` and `hairs`, without claiming distinct anatomical ligule types.
- **23/23** new candidate-retention tests passed, including representative earlier vulnerable cases; all nine JSON files contain **112 unique species** and preserve **514** linked photo references. No image or range-status changes.
- **Still blocked separately:** photo-release comprehensive QA earlier flagged **3 held files present in public source** and **2 source checksum discrepancies**. These have **not been fixed or cleared** by morphology work; source/photo-rights workflow must investigate exact files before release clearance.
- [Pass 5 report — Paspalum & Urochloa](TOP_DOWN_PHASE3_PASS5_PASPALUM_SIGNALGRASS_2026-11-10.md) · [Pass 4](TOP_DOWN_PHASE3_PASS4_BRISTLEGRASS_SORGHUM_2026-11-10.md) · [Pass 3](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md).
- **Next:** Finish remaining allied one-sided and riparian grasses (*Disakisperma, Dinebra, Digitaria, Eriochloa*), then small panicle, dropseed and lovegrass groups. Continue to display unknown traits and exact-source notes rather than invent diagnostic proof.

## Phase 3 — latest cumulative status (Pass 4, 2026-11-10)

- **44/112 grass species (39.29%)** now have first source-backed anatomical checklists, comprising **111 individual checks**, leaving **68** species without their Phase 3 first checklist pass. **Zero** have complete per-specimen dissection and exact-image character-role certification.
- Pass 4 added **11 species / 30 checks**: marsh, Scheele's and Reverchon's bristlegrasses; foxtail millet; Indiangrass and slender Indiangrass; Johnsongrass and cultivated/weedy sorghum; coastal sandbur, tanglehead and eastern gamagrass.
- FNA/Kew-driven corrections: *Sorghum halepense* permits awnless OR visible awns to ~13 mm; `none_obvious` + `long` now allowed. *Setaria reverchonii* may have short rhizomes; `tuft` + `rhizome` allowed. *Sorghastrum elliottii* has a ciliate **membrane** ligule (2–4 mm). *Heteropogon* ligule source-category conflict is flagged and preserved as a visible two-state possibility.
- Clear structural lessons: Setaria bristles are **separate sterile branchlets**, Cenchrus bristles **fuse into a burr involucre**, Sorghastrum has **bare companion pedicels**, and Sorghum has a **developed pedicelled spikelet**; these are not interchangeable morphological structures.
- **25/25 new candidate-retention regression tests passed**, including all revised multi-state cases and previous important KR/Poa/sideoats cases. 112 unique species loaded across nine JSON files; **514 existing photo references** intact, source URL and field integrity tests passed.
- No gallery/photo bytes imported, no new spreadsheets created, no county-native classifications changed. Phase 4 photo-role and source-rights reviews and Phase 5 deployed/mobile/actual field acceptance remain open.
- Full anatomy/source report: [Phase 3 Pass 4 — bristlegrasses and sorghums](TOP_DOWN_PHASE3_PASS4_BRISTLEGRASS_SORGHUM_2026-11-10.md). Prior reports: [Pass 3](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md), [Pass 2](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md), [Pass 1](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next high-value Phase 3 group:** Paspalum distinctions and one-sided/riparian grass look-alikes; cross-check mature spikelets at scale, not just the number of branches. Still photo-first with a 'can't tell / skip' route.

## Phase 3 — latest cumulative status (Pass 3, 2026-11-10)

- **33 of 112 grasses (29.46%)** now have first source-linked anatomy checklists; **81** individual anatomical checks in total; **79** species remain without a checklist. **None** of these 33 is yet certified through full specimen dissection plus exact-photo anatomy QA.
- Pass 3 added **12 species / 32 checks**: prairie/oldfield threeawn, purple threeawn, annual bluegrass, Texas bluegrass, Japanese brome, hairy woodland brome, lanceolate brome, Texas brome, sixweeks fescue, Texas fescue, Texas wintergrass and wild oat.
- The strongest new distinctions are **3–7 veins versus one vein on the Aristida lower glume; strictly dioecious female Poa arachnifera with three cobwebby callus webs; and Bromus lower/upper glume veins plus lemma/awn attachment**, supported by FNA and Kew.
- Critical source disagreement: FNA *Avena fatua* commonly has **2(3) florets** per spikelet, while older regional flora suggests **3–4**. We retain the conflict and do not make a misleading exclusive filter. Taxon/life-stage variations also remain explicit.
- **24/24 Pass 3 candidate-retention regression checks passed** on all 112 records. Prior passes' **14/14** and **20/20** reported tests and original **24/24** checks were not re-interpreted as specimen ID validations.
- Data integrity: **112 unique IDs across nine JSON files, 514 existing photo references, 33 checklist profiles and 81 complete source-linked checks**.
- **No new image files uploaded or licensed**, and no source/photo confidence has been silently upgraded. Diagnostic character photo-role checks, rights/crops and live mobile confirmation remain phases 4–5.
- [Pass 3 winter-grass report](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md) · [Pass 2](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md) · [Pass 1](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next useful group:** bristlegrasses (*Setaria*, *Cenchrus*), paired spikelet grasses (*Sorghum, Sorghastrum*), or remaining small-grass genera, prioritizing frequent Kyle and winter field encounters.

## Phase 3 — latest cumulative status (Pass 2, 2026-11-10)

- **21 of 112 (18.75%)** now have first source-linked anatomical diagnostic checklists, containing **49** individual checks. **91** remaining for first checklist screening. This is *checklist coverage*, not 21 species confirmed by dissected specimens and diagnostic photos.
- Second pass added **10 species / 25 anatomical checks**: big bluestem, sideoats grama, bushy bluestem, broomsedge, *Anatherum tenuispatheum*, tumble windmillgrass, feather fingergrass, hooded windmillgrass, slender windmillgrass and shortspike windmillgrass hybrid.
- Evidence correction: hooded windmillgrass may have **closely packed whorls**, not necessarily only one; compare shape/awn of the inflated upper sterile floret against *C. verticillata* and possible hybrid intermediates.
- Source inconsistency: FNA describes sideoats grama as **membranous ciliate ligule (0.3–0.5 mm)** while Kew GrassBase describes a **hair fringe (~0.5 mm)**. Two broad key states allowed provisionally, flagged as source-category conflict for collar macro QA.
- *A. tenuispatheum*: published raceme-spathe width, ligule and sessile-spikelet measurements are now stored under its accepted-name profile with older-source taxon-concept warnings; no local voucher/photo anatomy verified.
- **20/20** new candidate-retention scenarios passed on all 112 profiles; the **14/14** previous specific checks and **24/24** legacy candidate tests were also reported passing in their respective passes. These are filtering tests, not specimen-validation tests.
- **514** already linked source-photo references still need actual role/crop/rights QA under Phase 4. **No new photo bytes published** during the key work.
- [Pass 2 report](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md) · [Pass 1 report](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next batch suggestion:** native/introduced bristlegrasses and sorghums, or Poa/Aristida/Bromus regional look-alikes; keep genus/photo decisions skippable pending source-backed anatomy.

## Phase 3 — first species-separating anatomy pass (2026-11-10)

- **11/112 species (9.8%)** have at least two new source-linked diagnostic checks; **24** checks in all. This is **initial checklist coverage**, not a count of fully validated species. Each note names the structure, what should be observable and the principal look-alike; its source is stored on the exact species record.
- Covered: little bluestem, King Ranch bluestem, silky bluestem, cane bluestem, silver bluestem, Kleberg bluestem; blue grama, hairy grama, tall grama, Texas grama, and red grama. Records live in `species-a.json`, `species-c1.json`, and `species-d1.json`.
- Corrected KR bluestem: previous **1–1.5 mm** awn wording disagreed with Flora of North America; true awns are reported **9–17 mm**, geniculate and twisted. Its visual selection now tolerates both clearly evident awns and awns obscured in a whole-head view; key's `none_obvious` option does not mean biologically awnless.
- Source-checked **hair-fringe ligules** for blue and hairy grama. Texas and red grama **remain unscored** in the broad 'three LONG awns' option even though their individual fertile lemmas are three-awned: that button uses an `Aristida` example and is not homologous in appearance to their short macrostructures.
- **New candidate-retention regression:** **14/14** comparison scenarios kept the expected species in the filtered results, including KR with visible and hidden awns, KR after cutting, six bluestem examples, and grama distinctions. Candidate retention does **not** prove that a single result is correctly identified.
- **Photo and specimen QA still pending:** photo-role accuracy for all **514** references remains an independent Phase 4 task; do not mark any species photo verified merely because a textual character is externally supported.
- Source notes: [Phase 3 pass 1 detailed report](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md); [FNA KR](https://openherbarium.org/portal/taxa/index.php?clid=29&taxauthid=1&taxon=237483); [FNA hairy grama](https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427); [Kew POWO/GrassBase](https://powo.science.kew.org/).
- **Pass 1 handoff (completed by Pass 2):** additional big bluestem, sideoats and windmillgrass look-alikes now have first-pass checklist coverage. Preserve all 112 as candidates when traits are unknown. No photos imported in either pass.

## Broad-morphology group-level review — coverage status

| Review group | Species first-pass screened | With ≥1 external morphology source | Still without any source reference |
|---|---:|---:|---:|
| Bluestems, gramas, windmillgrasses | 22 | 22 | 0 |
| Airy-panicle groups (*Panicum, Dichanthelium, Poa, Eragrostis, Muhlenbergia*) | 24 | 24 | 0 |
| One-sided racemes, bristles, sorghums, reeds, wetlands | 28 | 28 | 0 |
| Spikes, awned grasses, dropseeds, cool-season and remaining groups | 38 | 38 | 0 |
| **TOTAL** | **112 / 112** | **112 / 112** | **0** |

**Interpretation:** The **112/112** source-coverage metric only means every species has **at least one** externally supported or compared morphological feature. It is not independent confirmation of the identity of all photographs, measurements, every coded state, taxon synonyms, Hays County native status, or plant specimens. All remaining uncertainty remains eligible for "Can't tell / skip" and source discrepancy review.


## Current subphase: broad morphology by related-grass group

**Bluestems + gramas + windmillgrasses**: 22 existing species records inspected as a group. Eleven changed based on explicit differences in the provided *Illustrated Flora of North Central Texas* and/or existing species lessons:
- KR bluestem (*Bothriochloa ischaemum*): short awns (not “long, obvious”), plus grazed/mown rhizomatous or stoloniferous forms.
- Cane and silver bluestems (*Bothriochloa barbinodis* and *B. torreyana*): contracted silvery branching heads, instead of KR-style finger clusters.
- Big bluestem (*Andropogon gerardii*): allow awned and shorter/awnless forms without forcing one regional subspecies.
- Sideoats grama (*Bouteloua curtipendula*): both tufted and creeping-rhizome forms; ciliate membrane ligule.
- Texas grama (*Bouteloua rigidiseta*): NEW distinct head choice for a few short non-pectinate branches instead of misleading long eyebrow combs. The generic Aristida “three long awns” photo is not sufficient for its triple-awned floral structure, so current awn state left unscored pending actual macro review.
- Hooded windmillgrass (*Chloris cucullata*): one terminal whorl, not the vertically separated tiers diagnostic of tumble windmillgrass.
- Feather fingergrass (*C. virgata*), tumble windmillgrass (*C. verticillata*), slender windmillgrass (*C. andropogonoides*): use a ciliate membranous ligule at the broad-genus level, with detailed species-level verification still needed.
- Shortspike windmillgrass hybrid (*Chloris ×subdolichostachya*): one whorl in the older regional key; hybrid identification **not** proven by head silhouette.

**Previous pass source-checks**: Johnsongrass (*Sorghum halepense*), annual and Texas bluegrass (*Poa annua*, *P. arachnifera*), buffalograss (*Bouteloua dactyloides*). Buffalograss is also part of the 22-species scoped group, hence `4 + 11 = 15` unique species with partial checks.

**Flora:** Diggs, Lipscomb & O'Kennon (1999), *Illustrated Flora of North Central Texas*, user-uploaded monocots excerpt; relevant PDF pp. 162–163, 170–172, 180, 182, 186. Old names are cross-referenced, not automatically silently substituted for accepted names. Flora is North Central Texas, not county-level nativity proof.

## Tested examples (112-species candidate pool)

All nine of these combinations retain their expected species:
1. KR bluestem: terminal fingers + rhizomatous base after mowing + no conspicuous LONG awn.
2. Cane bluestem: contracted bushy head + tuft + long awns.
3. Silver bluestem: narrow panicle + tuft + long awns.
4. Texas grama: short separated non-pectinate racemes + tuft (one match in current pilot).
5. Sideoats grama: short many side racemes + rhizome + membranous ligule (one match in current pilot).
6. Hooded windmillgrass: terminal fingers + tuft + membranous ligule + no conspicuous long awn.
7. Tumble windmillgrass: tiered whorls + membranous ligule + long awns.
8. Feather fingergrass: terminal fingers + membrane + long awns.
9. Big bluestem: terminal fingers + tuft + no conspicuous long awn in variable forms.

These checks do **not** certify field IDs, local nativity, or the candidate system's final botanical accuracy.

## Latest pass — airy and contracted panicles (2026-11-10)

All **24** species in *Panicum, Dichanthelium, Poa, Eragrostis,* and *Muhlenbergia* were screened at the broad-character level; **20** now have partial regional-flora character evidence (two Poa species already had evidence). This is not full species-level validation.

- Hall's panicgrass: a **short splitting membranous ligule fringed with hairs**, so either broad choice can represent what is visible.
- Witchgrass: regional flora says hair ligule; existing FNA-backed record describes a ciliate membrane. Both are provisionally tolerated pending a scaled collar photo.
- Purple lovegrass: tufted but with a short, knotty rhizomatous base (not exposed in the archived habit photos).
- Seep muhly and nimblewill: published awn lengths overlap the visual long/short boundary, so the broad key allows variation.
- Red lovegrass: the regional oxylepis treatment has a very short membranous ligule base partly hidden by hairs; don't extend subspecies-level anatomy to every plant.
- Canyon muhly: the flora supports a short awn (0.5–2 mm), membranous genus-level ligule, and open fine-branched panicle; no CC-cleared public key photo yet.
- Cedar rosette grass: the flora describes a 0.3–1 mm true **hair-fringe ligule** under the historical name *Panicum pedicellatum*.
- Tumblegrass: the older *Schedonnardus paniculatus* name is cross-referenced; the long sparse radiating head is now source-checked.
- These four were pending at the time of the earlier airy-panicle pass: *Dichanthelium commutatum, D. lindheimeri, Eragrostis lugens,* and *Muhlenbergia dubia*. They later received partial external-source evidence in the full-coverage pass; difficult characters still need confirmation.

QA: every one of **112 indexed species** remains unique, all character-state keys are valid, and 7 targeted selection routes retain their expected grasses. The 514 photo references are unchanged.

Full detail: [Airy-panicle source checks](TOP_DOWN_QA_PASS3_AIRY_PANICLES_2026-11-10.md).

## Latest pass — one-sided racemes, bristles, reeds, wetland grasses (2026-11-10)

All **28** species in the selected group now have at least one partial source check, including Johnsongrass from the earlier pass. **27 newly source-checked species** bring the project total to **60/112**. Source descriptions, uncertainties and old-to-new taxon name crosswalks are preserved in the nine species JSON files; underlying Hays Botany species lessons were **not** rewritten.

Key changes: distinct sparse-interrupted *Setaria reverchonii* choice; vaseygrass's numerous ascending one-sided racemes; hairs and rooting lower nodes on *Urochloa texana*; grain sorghum awned/awnless variability; aquatic current-swept Texas wild-rice with separated lower male / upper female floral branches; giant cutgrass with sexes intermingled; glume rather than lemma awns in *Polypogon*. No further species were added.

**18/18** targeted combination tests retained the expected species. Some paths correctly retain multiple candidates (*Paspalum*, *Arundo*/*Phragmites*); they require fine anatomy in Phase 3. JavaScript syntax, state mappings and all photo-choice references passed metadata checks, **not live image inspection**.

Detailed source notes: [Pass 4 — racemes, bristles, reeds and wetlands](TOP_DOWN_QA_PASS4_RACEMES_REEDS_2026-11-10.md).

## Latest pass — full 112-species initial broad-source coverage (2026-11-10)

The formerly unscreened **38** grasses were reviewed for broad head/habit/ligule/awn characters in one pass. Their data files now contain a group-screened marker and external source notes where evidence supports a character. This pass also reconciled the **17** previously pending source gaps in the earlier groups. The project now has **112/112 species with partial external morphology support**, not 112 fully botanically authenticated keys.

Important corrections include:
- **Bermudagrass**: a short **ciliate membranous** ligule, in addition to stolons and rhizomes.
- **Texas wintergrass**: ligule may be effectively absent **or** a tiny membrane; very long *single* floret awn.
- **Tanglehead**: a new photograph-backed **tangled awn raceme** head choice.
- **Threeawns, bromegrasses and fescues**: allow documented head/awn variation and distinguish annuals from perennials by real connected growth habit.
- **Munroa**, tobosa, curlymesquite and hidden dropseeds: retain small clustered/spiciform heads but distinguish stolons from rhizomes and note when a panicle is partially sheathed.
- **Blue, hairy, tall and red gramas**: pectinate branching differs from Texas grama's short *non-pectinate* lateral branches; branch-axis extensions remain high-value Phase 3 targets.
- **Triplasiella eragrostoides**: accepted name crosswalk and broad open panicle size source-checked against Peterson et al. (2016), not a blanket merger with *Triplasis*.
- **Dichanthelium** ligules and **Muhlenbergia dubia** narrow panicle/variable awns: recorded literature variation and historic taxon treatment explicitly.

**Quality gates:** all **112 indexed IDs** unique across **53 genera**; **514** existing photo references; **26** head shapes, **4** growth forms, **3** ligule states and **5** awn/bristle states; every state valid; head choices grouped exactly once; selection-photo references resolved in metadata; JS syntax valid; **24/24** targeted expected-species candidate checks passed. These are static and logical tests, not proof of successful image loading or botanical ID.

[Read full broad-group Pass 5 and source notes](TOP_DOWN_QA_PASS5_FULL_112_2026-11-10.md).

## Next phases — where most work remains

1. **Phase 3: species-separating anatomy**. Organize by real look-alike families starting with bluestems and gramas, then windmillgrasses, panicgrasses, dropseeds, cool-season wildryes, and reeds. Review ligule/collar, spathe vs sheath, rachilla, glume/lemma awn vs foxtail branch bristle, branch insertion, spikelet sex, floret count and measurements. Reconcile old names with Kew/GrassBase, Flora of North America and regional Texas floras rather than silently changing accepted names.
2. **Phase 4: visual photo QA**. For the **26 flowering-head options** and every other trait choice, inspect actual photos at field-usable size. Replace misleading crops with legitimate diagnostic photographs and keep exact creator, source URL and license. Canyon muhly (*Muhlenbergia ×involuta*) remains the one species with zero key-photo refs.
3. **Phase 5: live website and field acceptance**. Verify latest GitHub Pages deployment, photo URLs and mobile interactions; sample real winter, dormant, vegetative and flowering specimens from the Hays County teaching set; compare look-alikes and review false exclusions. Do not promote a final public key until verified.

**Project workflow guardrails:** no changes to the old hub; source species galleries remain untouched, no extra spreadsheets, no forced guessing, unknown states do not eliminate a species, regional-native labels must not be inferred from an old flora's geographic range alone.
