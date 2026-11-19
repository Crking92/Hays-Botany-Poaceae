# Grass ID Lab — permanent verification history baseline (16 November 2026)

This is a **consolidation of existing records, not a fresh certification**. The adjacent [JSON index](VERIFICATION_HISTORY_BASELINE_2026-11-16.json) has all **169 exact species IDs** (112 original scored and 57 unadmitted research candidates), links each original to its real scored shard, preserves four core trait arrays and named character evidence keys, and indexes **514 original exact gallery photo records** plus **156 candidate approved-gallery references**. These candidate photo records are **source-labeled**, not automatically local identity-verified, public-pixel verified, or licensed beyond their own recorded metadata.

## Historical evidence recovered / not discarded

- [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md): 514/514 original gallery references inspected in an early pass, **352 direct and 162 partial**. That is a gallery inspection count, **not** 514 certified species/photo/organ/arrow combinations. The historical tracker does not supply an individually matched 352/162 classification for every current exact photo, so the JSON does **not** fabricate one.
- [source-crosschecks.json](source-crosschecks.json): taxon/character/source agreements, conflicts and printed page references; not an approval of every live option.
- [optional-refinement-evidence.json](optional-refinement-evidence.json): the existing source-backed 24-group advanced character master. Its 1,815 records / 168 species are a **historical coordinator checkpoint**, not freshly recounted by this index.
- [source-register.html](source-register.html) and original nine species JSON shards: active scored traits, character-specific literature notes and source provenance.
- [hays-candidates.json](hays-candidates.json): 57 provisional research dossiers, exact image sources and licensing claims, unresolved identification limitations. No research candidate is promoted by this index.
- GitHub [#336](https://github.com/Crking92/Hays-Botany-Poaceae/issues/336), [#338](https://github.com/Crking92/Hays-Botany-Poaceae/issues/338), [#340](https://github.com/Crking92/Hays-Botany-Poaceae/issues/340), [#344](https://github.com/Crking92/Hays-Botany-Poaceae/issues/344), [#368](https://github.com/Crking92/Hays-Botany-Poaceae/issues/368): phase research, integration holds, visual examples, field testing and published deployment checkpoints. These issue comments may hold individual findings not yet linked to an exact image in this baseline.

## The missing verification distinction

An individual image may be: (1) taxon correctly identified, (2) rights and credit verified, (3) actually rendered on public Pages, (4) correct organ visibly resolved, (5) arrow tip and label botanically verified. **None of those follows automatically from another**. The index therefore starts with conservative NOT_CERTIFIED_FROM_BASELINE per image, even where an earlier chat may have verified a subset. This is a *missing evidence-link state*, **not** a rejection or erasure of earlier work. To upgrade, the coordinator should attach the exact issue comment / PR / dated audit and image key, not redo the botanical research.

A whole species can only be marked fully verified after all relevant source-character/option tests, conditional and unknown behavior, exact image roles, and field paths pass. Some microscopic structures will remain UNKNOWN or NOT_APPLICABLE, rather than falsely negative.

## Next catch-up pass (no blanket re-auditing)

1. Extract exact image IDs, photo annotation references, and already-approved individual claims from the prior 514-photo audit and later PR/issue comments. Attach each to the matching `image_key`, with explicit evidence URL and dated status. Do not infer direct vs partial from aggregate totals.
2. Attach source page/organ evidence to the precise species-option pair for the 24 advanced groups; preserve previously integrated records and documented holds.
3. Run the five frozen nonoverlapping species lanes through every existing option and actual visitor filtering, recording **executed** regressions separately from conceptual cases.
4. Only after all five lanes complete option QA, verify existing gallery photos against actual pixels, identity and credits; only then verify arrow/label targets.

**Editing:** The five scheduled QA automations remain read-only. The coordinator is the only updater of this index, and should retain dated audit history rather than overwrite older verified claims. Source priority is governed by the latest [MORPHOLOGY_SOURCE_POLICY.md](MORPHOLOGY_SOURCE_POLICY.md), not the historical 2026-11-11 handoff.
