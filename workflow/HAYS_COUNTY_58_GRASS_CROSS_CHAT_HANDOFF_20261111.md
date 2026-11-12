# Hays County grasses — cross-chat review and future merge handoff

**Updated November 11, 2026, after final Hays 58 nomenclature crosswalk.** This is the stable discovery pointer on the Poaceae repo's default `main` branch. The active work is intentionally stored in [the isolated Hays audit branch](https://github.com/Crking92/Hays-Botany-Poaceae/tree/inat-coverage-audit-20261111).

## Important correction: prior GBIF county filtering was incomplete (Nov 11)

**Do not treat zero GBIF voucher counts as absence of a Hays County specimen.** The first GBIF preserved-specimen script used an unsupported `county=Hays` search parameter and scanned only the first 30 broad results. Its negative conclusions for 15 other taxa are **withdrawn pending a corrected GADM/paginated county check**. Exact original TEX *Paspalum langei* sheets and labels remain verified; the two false *Tridentopsis* matches remain excluded.

Read [the technical correction before any herbarium inference](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-gbif-county-query-correction-20261111.md).

## Current nomenclature decision — final as of November 11, 2026

**Stop using the raw 58-name list for merger decisions.** The authoritative reviewed name and synonym map is now:

- [Human-readable finalized nomenclature crosswalk (all 58 names, historical aliases and primary taxon links)](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-nomenclature-final-staging.md)
- [Structured naming crosswalk / official candidate target names](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-nomenclature-final-staging.json)
- [Independent GBIF accepted-usage audit (58 candidates against existing 112)](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-gbif-accepted-usage-crosswalk.json)

**Staging name outcome:** 58 iNaturalist names → 56 unchanged accepted names, 1 renamed *Coelorachis cylindrica* → *Rottboellia campestris*, and 1 already in the existing 112 (*Elymus glabriflorus* = *Elymus virginicus*). **57 candidate taxa remain (56 species + 1 accepted hybrid)**. These are not 57 confirmed Hays populations nor automatically approved website additions.

**Major safeguards:** *Bothriochloa longipaniculata* is a distinct accepted name from *B. torreyana* under Kew, despite the broader 1999 regional Flora concept. Reject GBIF's unrelated fuzzy hit for *Tridentopsis elongata*. Keep *Echinochloa colona* and *Janochloa antidotalis*; do not replace their names with GBIF fuzzy/higher-rank guesses. *Lolium × boucheanum* is a hybrid. *Bromus brevis* is accepted nomenclaturally, but its photographed Hays occurrence needs high-scrutiny ID confirmation.

**Research source:** Kew POWO/WCVP accepted names (57 direct POWO links; one WCVP/WFO supported), 1999 *Flora of North Central Texas*, and exact GBIF accepted-usage-key crosswalk. Curated synonyms are useful searchable aliases, **not an exhaustive global synonym index**. Never make a species card merely from a taxonomic name match. Next step is physical photo ID/establishment verification, followed later by media/license work and safe merge testing.

## What exists

- **Existing live species:** 112, protected. Their photos, arrows, morphology panels and visual-key code are NOT part of this review.
- **Candidate scope:** 58 additional iNaturalist names with research-grade, photographed records marked wild inside **Hays County, Texas** (place ID 326). Names may still be misidentified, cultivated, taxonomic duplicates, or otherwise unsuitable.
- **Regional 12-county dataset:** retained in the same branch for future use, but not active in this phase.
- **Current phase:** All 58 completed preliminary GBIF name screening and Kew exception review; **278 Hays observation photo records cataloged with external URLs** for specimen image QA. First five have morphology targets from the user's Flora PDF. **No Hays observation photo pixels were visually adjudicated**, and no species has been approved for live merge. Do specimen photo and planting-context review before lessons.
- **Review outcome:** **zero additions yet merged into the original 112**. A taxonomic match is not a botanical identification.

## Exact source-of-truth paths — audit branch ONLY

- [Hays-only staged candidate data](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-hays-only.json) — 58 queue records; IDs, Hays observation totals, evidence links, review status.
- [Hays-only readable checklist](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-hays-only.md).
- [Observation ledger](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-hays-observation-evidence.json) — linked original observation IDs and sampled observer evidence, with explicit unverified-ID caveat.
- [Observation summary](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-hays-observation-evidence.md).
- [All-region original candidates](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-raw-candidates.json) — untouched original API comparison.
- [All-region normalized review list](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-cleaned.json) — retain for later, don't merge now.
- [Automated 58-species botanical name crosswalk](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-botanical-crosswalk.json) — **saved and workflow passed**. All 58 queued; 53 accepted exact name matches and five name anomalies. This is taxonomic screening only.
- [Readable crosswalk](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-botanical-crosswalk.md) — generated by same Action.
- [Taxonomy crosswalk script](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/scripts/screen_hays_58_taxonomy.py).
- [All 58 photo evidence manifest](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-photo-evidence-review.json) — 278 sampled Hays observation records; source photo links, image-level metadata/attribution, sample observers, disagreements, dates. **Photo pixels NOT visually verified; photos NOT copied or rehosted.**
- [Readable all-58 photo-review queue](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-photo-evidence-review.md) — species-by-species review readiness, flags, and observation links.
- [58-species evidence-quality triage](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-photo-review-triage.md) — 15 single-record candidates, 20 lacking multi-photo sample, and a Bromus brevis identification disagreement. No independent visual ID conclusions.
- [First five diagnostic photo-review targets](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-first-five-diagnostic-photo-checks.md) — source-grounded anatomy targets from the user-provided Flora PDF and relevant species concept cautions, **not completed image QA**. Treat Bothriochloa longipaniculata vs existing B. torreyana as a formal species-concept review hold (regional Flora lumped them, USGS/GRIN distinguish).

- [Five Kew taxonomy exception notes](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-independent-taxonomy-exceptions.md) — includes the **proposed Elymus glabriflorus = existing Elymus virginicus synonym** under Kew, and the GBIF false fuzzy match for Tridentopsis elongata. Read before adding new cards.
- [Five taxonomy exceptions machine data](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-independent-taxonomy-exceptions.json).

## Visual photo-ID QA began November 11, 2026

- [Batch 1 actual pixel inspection (5 grasses, 60 photographs)](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-first-five-visual-qa-20261111.md)
- [Batch 1 machine-readable results with original observation and photo IDs](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-first-five-visual-qa-20261111.json)
- [Batch 2 actual pixel inspection (8 grasses, 80 source photos)](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-next-eight-visual-qa-20261111.md)
- [Batch 2 machine-readable outcomes and source photo IDs](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-next-eight-visual-qa-20261111.json)
- **Cumulative actual image pixels reviewed: 13 of 58 candidate names, 140 actual images** (45 names not yet visually reviewed). No final species-ID signoffs; all 13 still require at least one definitive diagnostic character or other specimen evidence. *Bromus brevis* is specifically HIGH-RISK because the photo habits vary, Hays observation ID disagreement exists, and Texas occurrence is uncertain. 
- The Hays queue JSON has been updated with `photo_visual_qa_actual_pixels_inspected`, reviewed photo counts, source observation IDs and permanent result file per each of 13 grasses. Other 45 candidate queue records unchanged.
- The contact sheets were generated temporarily from exact image-level CC0, CC BY, CC BY-SA, CC BY-NC and CC BY-NC-SA photos, with creator credits and one-day artifact retention; NO third-party image bytes are in repo. The 60 photos were actually viewed. All five showed broadly compatible morphology, but fine diagnostically necessary structures were not conclusive; **zero species fully signed off**.
- Don't promote a genus-level or compatible-habit appearance to a verified species ID. Follow the recorded next-anatomy-photo checklist.

## Photo-ID Pass 3 — November 11, 2026

- [Photo review pass 3 report: 12 more species, 79 visually inspected photos](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-pass3-visual-qa-20261111.md)
- [Pass 3 machine-readable source photo ID list and conclusions](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-pass3-visual-qa-20261111.json)
- **Cumulative actual photo-ID checks:** 25 / 58 original names, **219 individual photos**, 33 remaining, zero species-final signoffs; Hays staging JSON contains individual QA states and photos inspected.
- **Important flags:** possible photo-ID mismatch for *Cortaderia selloana* (some observations show narrow fountain-grass-like plumes) and *Panicum miliaceum* (uncharacteristically narrow grain-bearing heads). *Stenotaphrum secundatum* photos mostly cultivated turf, not spontaneous stand evidence. *Echinochloa walteri* has good awned panicles and hairy-sheath photographs. No species or photographs released to public site.

## Hays County photo-ID sweep — November 11, 2026

**Current true status: All 58 Hays iNaturalist candidate NAMES triaged; 51 names had actual source image pixels inspected across FIVE batches, total 317 individual photographs. Seven one-record names had no eligible photo in the temporary CC-licensed image review and remain NOT visually inspected. Zero botanist-grade species identity signoffs. No species added to the public 112-name index.**

- [Pass 3 — 12 grasses, 79 actual photographs](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-pass3-visual-qa-20261111.md)
- [Pass 4 — 18 sparse-record grasses, 70 actual photographs](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-pass4-visual-qa-20261111.md)
- [Pass 5 — 8 additional visually checked names, 28 actual photographs; 7 legal photo-access holds](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-pass5-visual-qa-20261111.md)
- [Seven explicit image-access holds with exact source observation links](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-photo-access-holds-20261111.md)
- [Updated authoritative 58-original-name status queue](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/inat-2026-11-11-hays-only.json)

**Important biological/QA flags from pixel review:** likely photo mislabel candidates *Cortaderia selloana* and *Panicum miliaceum* need expert/specimen follow-up; *Stenotaphrum secundatum*, *Nassella tenuissima*, *Muhlenbergia capillaris*, and *Miscanthus sinensis* have cultivation context concerns. Strong photo sets exist for *Echinochloa walteri*, *Tridentopsis elongata*, *Aegilops cylindrica*, *Stapfochloa ciliata*, *Stapfochloa canterae*, *Tridens congestus*, and *Janochloa antidotalis*, yet still require exact keyed floral characters. *Elymus glabriflorus* remains alias of existing *Elymus virginicus*; do NOT create second card.

**Next phase (not photos already released):** find/inspect diagnostic floral parts against the user-provided Flora and newer taxonomic treatments, independently vet records with likely planted context or visual anomalies, obtain direct permissible viewing/observer permission or authentic voucher for seven image-access holds, and only then consider new card/media sourcing and small-tested merge. Photo contact sheets used CC-licensed single-source images for **one-day temporary review**. Original image bytes are not stored in GitHub; author credit and source photo IDs are preserved in QA JSON reports.

## Next review phase — November 11, 2026: source ID histories and Flora diagnostic gates

**The seven copyright-blocked observations were revisited through the original iNaturalist observation API (no image downloads):** each does have photographs, with one *Alopecurus carolinianus* CC BY-NC-ND photo and six observations whose photos are all-rights-reserved/unspecified. Each record's identification history, observed date, source photo rights and original observation ID were saved. Still **zero source pixels viewed for these seven**.

- [All seven source observation ID histories, rights and dates](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-photo-access-holds-id-history-20261111.md)
- [Seven precise ID character gates using regional Flora and current sources](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-7-flora-diagnostic-proof-gates-20261111.md)
- [Ten strongest observed Hays photo sets — diagnostic proof checklist](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-10-priority-diagnostic-proof-gates-20261111.md)

**Priority next comparisons:** *Elymus macgregorii* vs existing *E. virginicus* (glume awns, node count, auricles; 12 source photos under copyright, observer permission needed); *Tridentopsis elongata* vs existing *T. mutica* (second-glume veins/length); *Echinochloa walteri* (papilla-based sheath hairs and measured spikelets); *Janochloa antidotalis* (rhizomatous base and glumes); *Pappophorum bicolor* (11–15 lemma awns); *Aegilops cylindrica* (truly jointed spike with niches).

**Caution:** *Cenchrus setaceus* history contains old identifications under synonym *Pennisetum setaceum*, not an independently established conflicting species determination. *Lolium × boucheanum* has a historical *L. perenne* identification, so keep the hybrid identification on expert-review hold. Do not count historical maverick flags as current species conflicts without examining the nomenclatural context.

**Status unchanged:** 51/58 names visually inspected across 317 individual source photos; seven copyright-held source images still not visually inspected; zero species fully confirmed for publication and zero live species merges. The 58-name staging JSON points to all new audit files.

## Independent Hays specimen indexing — November 11, 2026

Seventeen targets (7 photo-access holds + 10 high-value morphology candidates) were checked against GBIF's preserved-specimen index for Hays County. Only **three direct name-aligned Hays TEX herbarium specimen index records** surfaced, all for ***Paspalum langei***: accessions TEX00568499 (2021), TEX00568501 (2021), TEX00485588 (2019). Original specimen sheets/labels and flower parts have NOT been independently inspected yet. Do not claim voucher confirmation, only credible leads.

**Crucial false-positive correction:** Searching an old broad *Tridens muticus var. elongatus* name returned two Hays *Tridens muticus var. muticus* records, accepted as *Tridentopsis mutica*, NOT the candidate *T. elongata*. These are excluded from positive evidence for elongata (and may later be used as look-alike voucher comparisons).

- [Curated Hays herbarium voucher evidence and rejected taxon false positives](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-grasses-curated-voucher-evidence-20261111.md)
- [Structured name-aligned preserved specimen evidence](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-grasses-curated-voucher-evidence-20261111.json)
- [Unfiltered GBIF query ledger (CAUTION: includes broad-name matches, not all correctly identified as the requested candidate)](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-grasses-independent-voucher-leads-20261111.md)

No-hit species may still have physical/unindexed vouchers, incorrect county fields, or holdings under old synonyms; a zero is NOT absence proof. The central Hays review JSON now carries the three Paspalum source URLs and the Tridentopsis false-positive rejection.

## Actual TEX Paspalum specimen sheet review — November 11, 2026

Three **original UT Austin TEX herbarium sheet images and their readable labels have now actually been examined** (not just GBIF metadata): *Paspalum langei* TEX00485588 (2019-10-01), TEX00568499 (2021-11-09), TEX00568501 (2021-11-12). The images are individually CC BY 4.0 under UT Austin as rights holder and were inspected in a one-day temporary review artifact; image bytes were **not** committed or published.

- [Actual 3-sheet visual inspection report, habitat labels and exact unconfirmed microscopic characters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-paspalum-langei-3-sheets-visual-inspection-20261111.md)
- [Machine-readable 3-sheet provenance, collector initials and review flags](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-paspalum-langei-3-sheets-visual-inspection-20261111.json)

**Important Hays habitat findings:** Nov 9 2021 shaded slope label says **"Many plants here"**; Nov 12 2021 Onion Creek conservation-area floodplain label says **"Five plants here"**, including co-occurring *Paspalum pubiflorum* that needs explicit discrimination. The 2019 label describes a residential yard under Ashe juniper, so cultivation versus naturally occurring there is unclear.

**Specimen metadata correction:** GBIF lists Thomas J. Watson as recordedBy for all three; physical 2021 sheet labels instead read **Thomas L. Watson**, while the 2019 label reads **Thomas J. Watson**. This could reflect transcription/initial error and is NOT evidence by itself of two independent collectors.

**Species confidence:** Pressed plants support the general *P. langei* habit, several narrow racemes and closely arranged spikelets, but the definitive lower glumes and papillose-based hairs cannot be independently checked at full sheet image scale. Species-level anatomical signoff remains PENDING; no live merge.

## High-resolution diagnostic photo reinspection — November 11, 2026

The strongest **10 Hays candidate taxa** had **40 previously reviewed iNaturalist photos revisited at their source's 1024-pixel size**, selected for glumes, awns, spikelets, nodes, ligules and grass-head architecture. **These are NOT 40 newly unique images**—the existing cumulative unique photo review remains **317** (51 of 58 names; 7 copyright-held records). Photos and license/attributions were used only in 1-day source-credit artifacts; no image bytes or new species cards were published.

- [Actual ten-taxon enlarged photo character findings and exact remaining proof](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-10-highres-anatomy-check-20261111.md)
- [Machine-readable ten-taxon photo IDs, visible traits, and missing species characters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-10-highres-anatomy-check-20261111.json)

The enlarged photos confirm strong *group-level* inflorescence traits for *Aegilops cylindrica*, *Tridentopsis elongata*, *Echinochloa walteri*, *Sphenopholis obtusata*, *Coelorachis cylindrica* (= *Rottboellia campestris*), *Paspalum langei*, *Tridens congestus*, *Pappophorum bicolor*, *Janochloa antidotalis* and *Stapfochloa canterae*. They do NOT yet prove required microscopic keys (e.g. second-glume veins, lower-glume presence, papilla hair bases, deeply cleft lemma apex, actual appendix counts or fertile/sterile floret differences). **ZERO new species-level ID signoffs.**

Priority follow-up: examine TEX *Paspalum langei* mature glumes and papilla hairs under microscope, with comparison to sympatric *P. pubiflorum*; then controlled scale-matched *Stapfochloa canterae* vs *S. ciliata* dissections, and *Tridentopsis elongata* second glume vein count against *T. mutica*.

## New species-level distinctions and GBIF correction — November 11

- [Three higher-confidence species differentiations with Hays photo IDs](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-three-species-level-differentials-20261111.md) — *Stapfochloa canterae* vs *S. ciliata*: published key uses **<12 versus 12–20 spikelets per centimeter** and sterile lemma awn **1.4–3.6 versus 0.4–1.6 mm**. Hays ruler/photo 235666609 appears to support the lower-density branch; count is preliminary. *Paspalum langei* vs co-occurring *P. pubiflorum*: lower glume present vs absent, overlapping lengths. *Tridentopsis elongata*: Kew distinct species, USDA GRIN variety, FNA broader *T. mutica*, with 3–7 versus mostly one-veined upper glume differential. **None is signed off for species identification.**
- **Correction to historical voucher search:** GBIF's `county=Hays` parameter was ignored, and the script saw only the first 30 broad hits, so old "no Hays voucher" conclusions are invalid. Read [correction](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-gbif-county-query-correction-20261111.md). The actual three *P. langei* TEX sheets remain valid individually confirmed Hays collections.
- [Corrected 17-taxon Texas-paginated Hays specimen query code](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/scripts/hays_17_texas_paginated_voucher_recheck.py) and [Action run](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/43097640595) — **queued, not yet completed or verified** at last check. Do not treat its future output as a completed result until the run succeeds and per-specimen county/name screening is checked. Supplement with GADM for specimens lacking county text.
- Current real status remains 51/58 candidate names with 317 original photo pixels viewed, seven copyright-held image review cases, three genuine TEX Hays specimen sheets viewed, zero species signed off and zero live merges.

## Newly added regional authority — 2015 Texas Hill Country grass vegetative key

**Important November 11 progress:** Found and indexed *Grasses of the Texas Hill Country: Vegetative Key and Descriptions* by Karl W. Hagenbuch and David E. Lemke (Texas State University), Phytoneuron 2015-4:1–93. This is directly Hays/Edwards Plateau relevant and has a **160-species vegetative key** plus **Appendix B cited herbarium collections by county**. Treat as a second regional plant-structure authority alongside *Flora of North Central Texas*, NOT replacement for its reproductive anatomy or Kew current accepted names.

- [Original 2015 scientific PDF](https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf)
- [All 58 Hays candidate names crossed against the 2015 key, with vegetative trait leads and seven positive Hays gathering references](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-texas-hill-country-2015-crosswalk.md)
- [Structured 58-name comparative evidence for another chat/merger](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-58-texas-hill-country-2015-crosswalk.json)

**Crosswalk status:** 23 exact Appendix A names, 4 under historical names or existing covered taxon concepts, 2 found only under broader historical concepts, 29 not included as named 2015 species. **Seven original Hays candidate names have 10 individual published county specimen-gathering citations** transcribed from Appendix B: *Melica nitens* (Dingee 89/SWT); *Coelorachis cylindrica* = *Rottboellia campestris* (Carr 10681, Sanders 4100/TEX-LL); *Echinochloa colona* (Breckenridge 441/SWT); *Setaria viridis* (Liang 50, Osborn 35/SWT); *Setaria leucopila* (Breckenridge 490, Tabler s.n./SWT); *Stenotaphrum secundatum* (Litchfield s.n./SWT); *Triticum aestivum* (Ruiseco 128/SWT). These are **published specimen literature citations**, original sheets **NOT yet directly inspected**. The three prior *Paspalum langei* TEX sheets remain a separate stronger original-sheet source.

**Diagnostic photo targets improved:** *Melica nitens* nearly closed sheaths + 3–6 mm membranous ligule; *Eragrostis curtipedicellata* viscid stems and ~90-degree spreading blades; *Setaria leucopila* distinctly hairy sheath throat vs annual *S. viridis*; *Echinochloa colona* ligule absent; *Stenotaphrum secundatum* distichous foliage + stolons; *Sphenopholis obtusata* divided collar; *Digitaria californica* paper explicitly warns vegetative features alone cannot reliably differentiate from some other Digitaria.

**Lookalike safeguards:** The same 2015 Appendix B names Hays vouchers of *Paspalum pubiflorum* and *Tridens muticus* under broad historical concepts, but **do not** reassign them as *P. langei* or modern distinct *Tridentopsis elongata*. No new species signed off from this paper alone.

## Shared Library source reference for ALL projects (November 11, 2026)

The user has chosen **Hagenbuch & Lemke (2015), _Grasses of the Texas Hill Country: Vegetative Key and Descriptions_** as an ongoing common field-ID source across grass lessons, conservation crew training and other botanical projects.

- **Persistent ChatGPT Library index:** `/Hays Botany ID/References/Hill_Country_Grasses_2015_REFERENCE_START_HERE.md` — contains full citation, publisher-hosted 93-page PDF URL, authority scope, image/copyright cautions, and links to the 58-name crosswalk. It is accessible to other chats via Library.
- **Original publisher PDF:** https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf
- **The physical PDF is NOT yet verified as saved inside Library** (direct download into model workspace blocked); don't tell user it is stored until an actual Library upload succeeds.
- **Use order:** Kew POWO for accepted names/species concepts; Hagenbuch & Lemke for Hays/Hill Country vegetative traits and appendix specimen clues; the user's Flora of North Central Texas for flower/spikelet anatomy; Flora of North America for additional taxa and newer concepts. Keep review source and diagnostic certainty explicit.
- This work is already **crosswalked against all 58 expansion candidates** in `audits/hays-58-texas-hill-country-2015-crosswalk.json`. The publication covers 160 Hill Country species. Inclusion does not itself prove Hays County collection, and a 2015 synonym is not necessarily a separate 2026 species.

## Hays County 58-name expansion batch — draft cards assembled (November 11, 2026)

**NEW CANONICAL STAGING HANDOFF.** User asked to finish the new grass batch. The *technical draft-card assembly is COMPLETE* in isolated branch `inat-coverage-audit-20261111`: 58 original research-grade iNaturalist Hays name labels → **57 candidate taxa** (56 species plus one recognized hybrid) + **one alias of an existing 112-species taxon**, `Elymus glabriflorus` → `Elymus virginicus`. This is **NOT a live merge or scientific species signoff**. Do not silently bulk-import into the public scored ID key.

- [All 57 staging cards in machine-readable, source-linked, site-compatible format](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)
- [Human-readable all-57 name, evidence and next-key-character review](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.md)
- [Import readiness QA — zero duplicate existing names/IDs, zero invented morphological states or unlicensed image files](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-expansion-import-QA.md)
- [Updated morphology source policy incorporating 2015 Hill Country grass key alongside regional 1999 Flora](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/site/visual-key-lab/MORPHOLOGY_SOURCE_POLICY.md)

**Staging QA results:** 57 unique accepted-name IDs, 1 existing searchable alias, 50 new taxa with visually inspected source photo sets, 7 with copyright-based pixel access holds, 151 original observation links embedded, 7 taxa with regional paper Hays specimen citations, 1 taxon with three original TEX specimen sheets directly inspected; no name collisions with the 112 published species. The 2 photos of existing synonym *E. glabriflorus* are excluded from new-species photo totals; 317 distinct source photographs were inspected across all **58 original names**, including the alias.

**Safety guard:** `photos=[]` and `traits.head/habit/ligule/awns=[]` on every staging draft by design. Do not interpret unknown structure as absence. Before a specific taxon goes live, verify species diagnostics, spontaneous-vs-planted context, image license and attribution, and later BONAP/NAPA nativity as a separate label. High-scrutiny examples include *Bromus brevis*, *Cortaderia selloana*, *Panicum miliaceum*, *Tridentopsis elongata*, *Bothriochloa longipaniculata* and the accepted hybrid *Lolium × boucheanum*.

**End of first batch:** Name standardization, literature crosswalk, county-evidence manifest, source photo inventory/review and all 57 draft ID card objects are assembled. **Separate unreleased stage:** final verified diagnostic trait values, public photos and live keyed cards. Avoid a repetitive new general-photo sweep; close the targeted diagnostic/specimen gaps from the staged records instead.

## Hays expansion Phase 2 — photo rights and eight Flora diagnostic packets (November 11, 2026)

**New completed Phase 2 work (review branch `inat-coverage-audit-20261111`):**

- [Photo-rights preflight for all 57 staged taxa, with source/photo IDs, current recorded licenses and credits](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-photo-rights-preflight.md). Across **534 sampled image metadata records**, **11 taxa** have at least one CC0/CC BY/CC BY-SA photo candidate; **39** have only CC BY-NC/NC-SA candidates (requires project-specific actual noncommercial-use determination); **7** have no eligible CC candidates in the saved sample. NONE are site-rights-approved yet. Source individual licenses, photographer credits, adaptation/ShareAlike conditions, role and image quality must be rechecked before use. No image bytes copied.
- [Eight-species Flora-based morphology versus actual Hays-photo evidence](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-20261111.md): **37 source-backed diagnostic character statements** across *Melica nitens*, *Rottboellia campestris* (old *Coelorachis cylindrica*), *Paspalum langei*, *Setaria viridis*, *Setaria leucopila*, *Echinochloa walteri*, *Sphenopholis obtusata*, and *Tridentopsis elongata*. Every expectation cites exact PDF page/treatment, states what Hays photos show, and identifies the **unverified** decisive characters. The statements are **NOT yet approved active key traits**.
- [Updated structured 57 candidate drafts](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json) now link the appropriate photo-rights summary for all 57 and actual regional diagnostic packet for the first eight. Existing `photos:[]`, `traits` arrays empty as **unknown**, `merge_ready:false` and all 112 live species untouched.

**Current workstream boundary:** "Continue Grass QA" separately reviews already-hosted image roles among the live 112 species (Phase 4); this Hays expansion stage covers only *new potential taxa*, source morphology and photo rights. The 317 original iNaturalist source photographs previously viewed and 514 original hosted Lab photo references are disjoint accounting systems; do not add their progress totals. Review only the expansion branch, and allow the other team to keep reviewing `main` hosted photos.

**Next actionable items:** same-specimen microphotography/verified voucher characters (first glume/pubescence of *P. langei*, true jointed spikelet niche in *R. campestris*, glume vein counts in *T. elongata*, fertile lemma wrinkles in *Setaria*, papilla-based sheath hairs in *E. walteri*) and photo license/attribution updates before any candidate gets a positive release flag. No species final signoffs, and no change to the 112 live cards.

## Directions for a new chat/agent

1. Read this pointer, then fetch the branch **inat-coverage-audit-20261111** and the current reviewed JSON records. Do **not** work from raw iNaturalist count alone.
2. Compare the branch against the latest live `main` index (currently 112). Review source paths, SHA, the active routing registry and other running Grass ID Lab work before any edit.
3. Continue **all 58** in the Hays-only queue. For each, inspect linked local observations and identification history, confirm taxonomic treatment and diagnostic features using *Flora of North Central Texas* as key botanical authority, and consider *Flora of North America* for additional coverage. A GBIF backbone match is only preliminary evidence.
4. Preserve introduced grasses that are relevant to local field identification, but flag cultivated-only or uncertain occurrences. Keep native/county distribution certification as a separate status; do not assume iNaturalist proves native range.
5. Before sourcing photos, verify plant ID and inspect existing image evidence. Review exact-image licensing/creator attribution before copying anything into this PUBLIC repo. Preserve the dormant/winter photo rule.
6. Do not create `content/taxa/Poaceae/**/species.json`, alter `site/data/poaceae-index.json`, or modify visual-key code until reviewed candidate(s) are truly ready. Those writes can cause auto-sync and collide with parallel Grass ID QA.
7. When ready, prepare a narrow 5–10 species test merge, confirm no duplicates/synonyms and no existing 112 species changes, test the visual key, and only then expand the live species set.
8. Maintain per-taxon evidence and review status in the isolated Hays files; never overwrite accepted review decisions with new raw API results.

**No automatic merge is authorized by this handoff.** The user wants all 58 worked on now and future merger by another chat when evidence is sufficient.

## Hays expansion Phase 2 — packet 2 saved, November 11, 2026

**Progress now: 16/57 candidate taxa with source-backed diagnostic packets; 81 literature-described characters (37 first packet + 44 second).** These are scientific reference descriptions and exact next specimen checks, NOT 16 botanically approved Hays specimens. **0 new photographs reviewed in this packet, 0 additional species signoffs, 0 public image approvals, 0 live species merges.**

- [Eight new comparisons: goatgrass, gummy lovegrass, California cottontop, sand dropseed, St. Augustinegrass, jungle rice, blue panic, pink tridens](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-2-20261111.md)
- [Structured packet 2 character descriptions, rights lanes and original Hays observation links](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-2-20261111.json)
- [57 staged cards, with 16 packet cross-references and current counters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)

**Special holds:** Digitaria californica and Sporobolus cryptandrus have literature profiles but no source pixels viewed under rights-safe process. St. Augustinegrass photos are primarily turf rather than demonstrated escaped populations. Eragrostis curtipedicellata lacks the critical viscid axis image. No approved active trait states, no added website images and no changes to 112 original keyed species. **Next packet begins with remaining unprofiled taxa; leave the original 8 and second 8 untouched unless a source correction is required.**

## Hays expansion Phase 2 packet 3 — November 11, 2026

**24/57 candidate diagnostic profiles prepared, with 123 total literature-backed statements (newest batch 42).** New names: Bromus catharticus, Eragrostis superba, Lolium perenne, Bothriochloa longipaniculata, Bothriochloa bladhii, Dichanthium aristatum, Lolium multiflorum, Bromus brevis. **No specimen-level Hays ID signoffs; 0 additional source photographs inspected in this source-literature batch; no public photos or species merges.**

- [Read eight new comparisons](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-3-20261111.md)
- [Structured packet 3](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-3-20261111.json)
- [Updated 57 staging cards](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)

**High-risk exceptions:** modern B. longipaniculata needs key separating it from historical lumped torreyana; L. perenne / L. multiflorum / hybrid overlap requires true spikelet and auricle checks; Bromus brevis is accepted taxonomically but cannot be assumed to occur as a verified Hays species. Existing 112 live pages and photos untouched.

## Hays expansion Phase 2 diagnostic packet 4 — November 11, 2026

**32/57 diagnostic species packets prepared, 171 reference-backed character descriptions.** Latest eight: Paspalum notatum, Bromus tectorum, Sphenopholis interrupta, Rostraria cristata, Polypogon viridis, Hordeum murinum, Dactyloctenium aegyptium, Oplismenus hirtellus.

- [Readable 8-taxon diagnostic report](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-4-20261111.md)
- [Source-linked packet 4 JSON](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-4-20261111.json)
- [Current candidate cards and progress counters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)

**Scope caution:** Literature profiles only, not observed specimen IDs. 0 newly inspected image pixels, 0 final ID signoffs, 0 authorized published images, 0 live merges; original 112 species and site files untouched. Keep *Oplismenus hirtellus* historical *setarius* split, *Sphenopholis interrupta* old *Trisetum* classification, *Hordeum murinum* leporinum issue and mowed *Paspalum notatum* turf context as review holds. Remaining diagnostic packet taxa: 25.

## Hays expansion Phase 2 diagnostic packet 5 — November 11, 2026

**40/57 research-only source diagnostic profiles complete with 219 reference statements**. Latest eight: Steinchisma hians, Dichanthelium acuminatum, Panicum dichotomiflorum, Panicum repens, Pappophorum bicolor, Stapfochloa ciliata, Stapfochloa canterae, Megathyrsus maximus.

- [Packet 5 readable report](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-5-20261111.md)
- [Packet 5 data](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-5-20261111.json)
- [57 staging card index / counters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)

**Critical holds:** D. acuminatum old Panicum-variety concepts; S. hians historical name P. hians; S. canterae-versus-S. ciliata true microscopic discriminant not yet confirmed; Panicum dichotomiflorum remains zero source pixels viewed; P. repens missing sharp-tipped rhizome; M. maximus may only be planted. **Zero new source images inspected in this pass, zero botanical species signoffs, zero rights-approved new photos, zero live merges.** Original 112 live key and galleries untouched. **17 candidates remain for Phase 2 reference dossier preparation.**

## Hays expansion Phase 2 diagnostic packet 6 — November 11, 2026

**48/57 candidate reference profiles prepared, 267 source-described character/photo targets**. The new eight are Triticum aestivum, Avena sativa, Eragrostis minor, Alopecurus carolinianus, Briza minor, Cenchrus ciliaris, Sclerochloa dura and Elymus macgregorii. Reconciled **8 missing original packet-1 references** in the 57 draft cards without changing packet content or cumulative count.

- [Readable packet 6 morphology](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-6-20261111.md)
- [Structured packet 6](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-8-flora-diagnostic-packet-6-20261111.json)
- [57 candidate draft ID cards with cross-links and up-to-date counters](https://github.com/Crking92/Hays-Botany-Poaceae/blob/inat-coverage-audit-20261111/audits/hays-expansion-20261111/hays-57-draft-id-cards.json)

**Critical holds:** *Elymus macgregorii* was not recognized in old 1999 Flora; northeastern keys need Texas vouchers for reliable split against E. virginicus. A. carolinianus and E. macgregorii have zero original source pixels reviewed in staged sample; no rights-safe photo rehosting. Avena sativa and T. aestivum may be planted/volunteer cereal plants, not wild-established grasses. No specimen species signoffs or site changes, no new photo pixels, no photo rights release. 112 live species untouched; 9 unprofiled taxa remain.
