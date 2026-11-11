# Hays County grasses — cross-chat review and future merge handoff

**Updated November 11, 2026, after final Hays 58 nomenclature crosswalk.** This is the stable discovery pointer on the Poaceae repo's default `main` branch. The active work is intentionally stored in [the isolated Hays audit branch](https://github.com/Crking92/Hays-Botany-Poaceae/tree/inat-coverage-audit-20261111).

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
