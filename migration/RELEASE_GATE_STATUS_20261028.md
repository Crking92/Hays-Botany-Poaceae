# Poaceae migration — release-gate results
**Checked:** 2026-10-28  
**Status:** **STAGING VERIFIED; NOT READY FOR PUBLIC CUTOVER**

## Safety and migration
- Original site and source `Crking92/Hays-County-Botany` have not been deleted, changed for cutover, or redirected.
- Protected source snapshot: `d5812999ea32d03b873110db1a526e20ac6ea730`.
- Most recent recheck against original `main`: `9c491c6778efe502b5f17dfcd6b27286c197925f`. The 9 commits since the snapshot did not change `content/taxa/Poaceae/**` at that checkpoint.
- Five grass-related ChatGPT task automations confirmed **paused** (no automation restart).
- **1,178 of 1,178** imported files matched original Git blob SHAs and sizes, source files retained. This includes 390 non-image records and 788 conservative license-candidate image files (approximately 396.8 MB).
- **224 physical images** deliberately excluded from destination (remain in original source). No held images leaked into destination.
- All **112 species**, **53 genera** transferred as complete canonical botanical records.
- Dry-run static site generated: **388,544,264 bytes**; NO Pages deployment.

## Automated checks completed
- [x] Source and destination Git-tree byte-level verification, 1,178/1,178.
- [x] No missing or mismatched staged media blobs.
- [x] 788/788 candidate image files decoded without error.
- [x] No held media in candidate gallery or staged static site.
- [x] 956 source-credited, local media teaching panels resolve to actual files.
- [x] 1,261 displayed anatomy markers have numeric coordinates within bounds; this does NOT validate anatomy target accuracy.
- [x] Desktop Chromium at 1366 x 850: species search, Indiangrass and silver bluestem pages, image load, absence of browser exceptions and horizontal overflow.
- [x] Mobile Chromium at 390 x 844: same interactions passed, zero body overflow.
- [x] Original source check: no later Poaceae source modifications as of recheck.
- [x] No Pages publication and no universal hub change.

## Known exclusions and gaps (block cutover)
- **263 / 1,219 original teaching-panel references omitted** in preview. Triage: **197** held/unverified-rights physical media references; **66** unarchived external-image links. **64 species** are affected. These are panel references, not 263 different missing photos.
- **106 species** in the *simplified staging preview* lack explicit structured beginner steps. Their complete canonical species records are still transferred; the full original Learner uses additional layout/data logic we have not rebuilt.
- **3 species** lack standalone `field_id_short_tiles` in preview; need a real fallback/compare content check.
- **248** imported pictures have shorter dimension under 800 px, including **50** under 500 px. They decode fine but require visual review for ligules/spikelets/glumes.
- **788 photos are only transfer candidates**, not fully re-cleared by contacting every original rights holder or independently validating every photo license/version/site-specific permission. Display must remain gated; CC BY-NC means noncommercial license constraints, not unrestricted reuse; CC BY-SA requires appropriate share-alike treatment when making adaptations.
- **1,261 marker coordinates are syntactically valid**, but placement on visible anatomical structures still needs visual audit.
- Staging preview has navigation links back to old main site, but **universal search, glossary links, quiz hand-off, cross-family comparisons, accessibility and full feature parity are not implemented/verified**.
- Need live new-Pages testing and license gate approval *before* any switch.

## Priority next implementation passes
1. **Rights/fidelity pass:** review 788 image candidates and rank the 197 held-panel references plus 66 external ones by native field-ID value. Keep restricted originals only in source archive. Validate actual imagery at macro scale and visible arrows.
2. **Feature-parity pass:** rebuild original beginner Learner fallback for 106 affected species using the transferred canonical data; restore Field ID behavior, genus/family glossary links, look-alike links and quiz routing. Do not invent anatomy or IDs.
3. **Mobile/manual validation pass:** inspect sample annotated macro photographs (ligules, nodes, paired spikelets), accessibility including screen readers, and photo credits/NC/SA compliance.
4. **Separate public destination release** only after applicable rights checks and QA passed; keep original unified website intact and current URLs unmodified.
5. **Source re-sync/byte-match** immediately before any cutover, then small controlled internal navigation links, followed by reversible main hub transition after user review.

## Audit runs
- [Comprehensive image/file/marker gate — PASS](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40702612404)
- [Missing-panel reason triage — PASS](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40703163740)
- [Final desktop + mobile Chromium browser test — PASS](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40703238537)
- [Initial verified import — PASS](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40700525218)

No original content was deleted, no site was made public, and all grass automations remain paused.
