# Hays Botany — One 169-Grass Learner and ID Lab Working Inventory

**Owner directive:** November 11, 2026. **Status:** Single collection with two evidence/release levels. This is the working handoff for manual chats and the five read-only Grass Lab QA automations.

## One set of 169 grasses

- **169 total species/taxon profiles in the Grass Learner**, built from the existing 112 in `site/data/poaceae-index.json` and the 57 unique research candidates in `site/visual-key-lab/hays-candidates.json`. IDs and accepted display-name strings were checked for collisions before integration.
- **112 existing photographed teaching profiles** retain their exact original per-species JSON, verified review records, photo metadata, credits, source URLs, and rights conditions.
- **57 additional research profiles** are searchable alongside the 112 in `site/`, with existing 322 cited literature character targets accessible through the same Learner, Field ID and terminology tabs. They carry an unmistakable `RESEARCH_CANDIDATE_NOT_RELEASED` status. Source observation URLs are research leads, not identity proof, reuse permission, or a photograph to embed.
- **112 currently scored in the multi-access photo ID Lab**. The 57 newer profiles must not silently become scored candidates until meaningful diagnostic states are reconciled and verified. The term "169-grass project" denotes the whole teaching/curation inventory, **not** 169 fully verified identifications or 169 credited-photo galleries.
- **No new source photographs are embedded for the 57 by this text integration**. Approve/publish eligible general habit, foliage, flowers, fruit, seasonal photos as each exact picture passes license + attribution + reasonable identification checks. Never delay a cleared general image until anatomy arrows are done. Count real visible-site images, not downloaded/uploaded/archive files. Existing photo holds remain intact.

## One workflow for all 169, without redoing completed work

1. Treat the 169 as the full planning, search, training and source-audit universe. Do **not** create two progress spreadsheets or separate species queues. Continue using the existing master Photo Needs Queue.
2. For every taxon record, distinguish **Learner-visible provisional profile**, **credited photo(s) visibly published**, **locally verified specimen identity**, **morphology characters source-reconciled**, **active scored-key admission**, and **field-tested ID path**. Do not call the earlier steps equivalent to the later ones.
3. Follow the governing morphology rules at `site/visual-key-lab/MORPHOLOGY_SOURCE_POLICY.md`. Hagenbuch & Lemke (2015), *Grasses of the Texas Hill Country*, leads vegetative morphology; Diggs, Lipscomb & O'Kennon (1999) leads reproductive/spikelet morphology; GrassBase/FNA and local voucher evidence support gap/conflict resolution. Cite printed/page location, current/historical taxon name, observed state, photo evidence and uncertainty. Unknown is not absent. BONAP local nativity is later and distinct from identification.
4. In each manual work batch, fix safely evidenced botanical and UI mistakes directly in the assigned Poaceae repository, preserve concurrent work and exact image credits, run regression tests, merge only passing changes, and confirm Pages visibility separately. Owner tests the normal website and sends screenshots/observations; **no extra Field Test Mode**, debug panel or synthetic specimen photos.
5. The five Grass Lab QA automations remain **strictly READ ONLY**. They must use 169 as the unified inventory denominator, disclose which of the 169 are actually photographed, specimen verified and scored, avoid duplicate reviews and track deployment differences. They do not commit, publish, download, rehost, change rights, or modify any Drive/repository files. Never write to legacy `Crking92/Hays-County-Botany`.
6. Progress reports after each batch must include **169 total**, **number visible in Learner**, **number with own-species live photos**, **number scored in multi-access key**, **changed records/tests**, **holds**, **commit/PR**, **Pages verification**, and **what comes next**. Unknown counts should be marked unverified rather than invented.

## Existing references / source files

- Existing scored set: `site/visual-key-lab/species-a.json` through `species-d4.json` (nine JSON files, 112 total).
- Historical diagnostic checklist: `site/visual-key-lab/PROGRESS_TRACKER.md` (315 original first-pass checks, 514 referenced photograph inspections; these are historical phases, not every one of 169 recertified).
- Expansion diagnostics: `audits/hays-expansion-20261111/` (57 research dossiers; 322 literature character targets).
- Source hierarchy and discrepancies: `site/visual-key-lab/MORPHOLOGY_SOURCE_POLICY.md`, `PRIMARY_MORPHOLOGY_REFERENCE.md` and `REGIONAL_GRASS_REFERENCE_COMPARISON_HANDOFF_2026-11-11.md`.
- Original PDFs are stored in the owner's private Google Drive **Hays Botany ID Builder Data / Reference Floras** folder; do not commit protected book scans or artwork to a public repository.

**Safety:** Merging into the unified learner is teaching/reference visibility, not automatically approving 57 extra photo licenses, taxon identifications, morphological character scores, native status, or publishing permission.
