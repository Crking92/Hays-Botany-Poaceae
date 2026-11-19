# Grass ID Lab — durable verification ledger and next-action queue

**Baseline:** 2026-11-16. **Scope:** historical recovery only. This is a navigation and gate ledger, **not** a new taxon, license, pixel, or filter certification. The existing [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md) remains the historical tracker; this document is its evidence-linked verification supplement, not a competing progress dashboard.

## Historical evidence now recoverable

| Evidence | Saved index | Correct interpretation |
|---|---|---|
| All 169 grasses, 112 original + 57 research | [Species baseline](VERIFICATION_HISTORY_BASELINE_2026-11-16.json) | Exact species IDs and source records; no implied final admission |
| 514 original gallery images | [Per-photo anatomical roles](VERIFICATION_RECOVERED_PHOTO_ROLES_BATCH3_2026-11-16.json) | 485 exact photo-role observations recovered; 29 lack per-photo role entry in current shards |
| 156 candidate image references | [Candidate image metadata](VERIFICATION_RECOVERED_CANDIDATE_PHOTOS_BATCH4_2026-11-16.json) | Existing creator/license/source labels, not new independent rights/ID approval |
| 14 installed arrows on 8 photo placements | [Arrow/organ recovery](VERIFICATION_RECOVERED_ARROWS_BATCH5_2026-11-16.json) | Exact target and label coordinates from merged PR398; includes corrected PR403 ligule pointer |
| Original issue-based photo findings | [Historical audit evidence](VERIFICATION_RECOVERED_AUDITS_2026-11-16.json) | 14 named findings, 6 major QA checkpoints and original source links |
| Historical photo scouting and fixes | [Batch 2 issue archive](VERIFICATION_RECOVERED_AUDITS_BATCH2_2026-11-16.json) | 22 issue-70 audit packets; previously resolved bugs separately marked |
| A–D option/advanced tests | [Option history](VERIFICATION_RECOVERED_OPTION_TESTS_BATCH6_2026-11-16.json) | 12 issue reports and 7 regression/release proofs; not a complete 169 × option matrix |
| Fixed-versus-held crosswalk | [Reconciliation](VERIFICATION_RECONCILIATION_BATCH7_2026-11-16.json) | Avoids reopening fixed PR403 bug; keeps unresolved science holds |

### Source and provenance

Preserve [source-crosschecks.json](source-crosschecks.json), [optional-refinement-evidence.json](optional-refinement-evidence.json), all nine original species shards, [hays-candidates.json](hays-candidates.json), [Issue #70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70), [Issue #344](https://github.com/Crking92/Hays-Botany-Poaceae/issues/344), and [Issue #368](https://github.com/Crking92/Hays-Botany-Poaceae/issues/368). Source priority: **Gould (1975) > Diggs (1999) > Hagenbuch & Lemke (2015)** when higher-ranked work actually addresses same taxon concept and character; supplementary FNA/GrassBase when needed. Unknown is not absent.

## Prioritized work queue — do not redo completed audits

1. **Link 29 missing exact per-image roles:** `digitaria-ciliaris` (8), `echinochloa-crus-galli` (8), `catapodium-rigidum` (7), `polypogon-monspeliensis` (6). Search their original photo QA PR/issue records before doing any new pixel inspection. This does not invalidate the historical 514/514 aggregate inspection count.
2. **Complete 169-grass actual option-matrix tests** using the five currently enabled nonoverlapping read-only automation lanes. Record exact species ID, option ID, expected behavior, observed visitor filtering, unknown/variable handling, browser/commit, date and evidence. Thematic A–D audits and 111/111 examples are **not** a substitute for this test.
3. **Resolve three rhizome source conflicts** only with owner-reviewed printed page/specimen evidence: `bouteloua-dactyloides`, `eragrostis-intermedia`, `hopia-obtusa`. Current public behavior is **STILL POSSIBLE**, not rhizome-present or absent. Do not automatically promote.
4. **Review five proposed arrows** in [Batch 5](VERIFICATION_RECOVERED_ARROWS_BATCH5_2026-11-16.json) against natural photo pixels and current display: upper whorl of `chloris-verticillata`; rhizome of `sorghum-halepense`; rhizome nodes of `phragmites-australis`; hairy node of `leersia-oryzoides`; rooting joints of `paspalum-distichum`. None is installed by this recovery.
5. **Review candidate rights exceptions before publishing/reuse.** Existing Bob Harms educational-with-credit assets are not Creative Commons. Preserve exact source permission, license conditions and credit; a license label alone does not prove a given image was independently rechecked.
6. **Run public pixel/caption/arrow verification only for genuinely missing gates.** Previously verified browser smoke tests, credits and historical pixel observations remain linked. An image showing an organ does not automatically certify species identity, local voucher, arrow target or every advanced suboption.
7. **Check current UI source-priority wording** against the canonical morphology policy. Historical issue/source-register pages may reflect earlier hierarchy; fix stale *visible* wording in a separate code PR after confirmation, without rewriting historical evidence.

## Verification gate vocabulary

For each species-option-photo-annotation combination, store separate gates: `SOURCE_CHARACTER`, `OPTION_MAPPING`, `EXECUTED_FILTER`, `PHOTO_TAXON`, `PHOTO_RIGHTS`, `PHOTO_LIVE`, `PHOTO_ORGAN`, `ARROW_TARGET`, `FIELD_PATH`. Gate states: `VERIFIED`, `PARTIAL`, `HOLD`, `NOT_TESTED`, `NOT_APPLICABLE`. Historical `DIRECT_VISIBLE` means the specified *visible part* was observable; it does **not** set all other gates to VERIFIED.

**Evidence upgrade rule:** Every new VERIFIED gate must include exact species ID, exact photo URL/image index where relevant, option ID, original source/page or pixel proof, review date, reviewer/automation, PR/issue/CI link and main commit. Preserve earlier evidence even when superseded. Do not silently overwrite a failed check or promote an unverified candidate. If the underlying image, source or option changes, invalidate only affected gates.

**Ownership:** Five automation lanes are read-only. The central coordinator alone reconciles findings and writes production/ledger updates. The original 8 recovery batches do **not** claim exhaustive reconstruction of every unindexed chat message, and historical merge claims are not fresh November 16 browser runs.
