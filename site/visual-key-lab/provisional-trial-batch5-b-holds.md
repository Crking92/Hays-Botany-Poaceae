# Chat B — Diagnostic structure and look-alike review (2026-11-12)

**Scope:** `site/visual-key-lab/provisional-trial-batch5-b.json` only, plus independent lane-specific regression tests. No production scored records, existing trial batches, HTML, source photo manifests or gallery assets changed. See [three-lane coordination rules](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70#issuecomment-6842085486). **Staged only; leave PR OPEN and UNMERGED for Chat 1.**

## Outcome

- 11 assigned; 10 *literature-grounded, provisional, not admitted* four-character research profiles; 1 held: *Bromus brevis*.
- All 10 copied their current published gallery reference objects **verbatim** with original creator/license/license URL/source URLs intact (27 references). None are new downloads, permission grants, or claimed local vouchers.
- Status on every staged profile: `trial: true`, `admission_status: RESEARCH_TRIAL_NOT_ADMITTED`, `range: UNVERIFIED`, `reviewed_for_admission: false`.
- The existing four-question interface has **no dedicated short-awn choice**. In particular, neither *Stapfochloa* has its 0.9–5.5 mm awns forced into `long` or `none_obvious`. Both remain searchable by finger-like heads pending microscopic confirmation.
- Zero/unknown traits stay as empty arrays, which the existing matcher retains as possible, not disproven.

## Held identification — Bromus brevis

**Status: HOLD_NOT_SCORED_NOT_TRIAL_READY.** Source-labeled Australian photos are credited in the existing gallery, but do **not** authenticate a Hays County plant. Existing Hays observations include reported ID disagreement, and available photographs do not provide a defensible mature same-plant series of spikelet/glume/lemma/awn/keel. The old Texas regional flora did not directly treat *Bromus brevis*.

Kew treats *B. brevis* as an accepted taxon native to central/southwestern Argentina; its currently listed introduced territories include New South Wales, Tasmania, Victoria and New Zealand South **but not Texas**: https://powo.science.kew.org/taxon/36988-2 . That is not proof of absence in Hays, but it raises the threshold for adding a local learner record to a species-specific identification result. Compare existing local *B. catharticus*, *B. hordeaceus* and *B. japonicus*, with vouchered mature glumes, lemma nerves, width, teeth and awns.

**Release trigger:** Independently verified Hays specimen and published modern key/differential; same-plant mature branch, several intact spikelets, detached lower/upper glumes and lemma with mm scale, collar and rooted habit; reconcile locality and cultivated/introduced context. Keep its current gallery and research dossier untouched.

## Species-specific unresolved comparisons and data quality

| Provisional name | Must compare | What the four-choice ID cannot prove |
|---|---|---|
| *Bothriochloa longipaniculata* | *B. laguroides* subsp. *torreyana*, *B. bladhii* | FNA separates robust cauline plants and a longer (9–20 cm) panicle; green shiny acute sessile glume vs glaucous blunter forms still needs dissection. Single general head photo is insufficient. |
| *Eragrostis curtipedicellata* | *E. minor*, *E. spectabilis* | Sticky/viscid panicle rachis plus perennial base are vital; current source head photos do not show glandular texture or an independently rooted Hays plant. |
| *Eragrostis minor* | *E. curtipedicellata*, *E. cilianensis* | Crateriform glands, mature multiple florets, persistent paleas and tiny ligule need a hand lens. |
| *Stapfochloa ciliata* | *S. canterae*, *Chloris verticillata* | FNA *Chloris ciliata*: typically 2–5(7) shorter racemes and 0.9–1.4 mm awns; ligule may be absent or a ciliate remnant. Leave both ligule and awn answers UNKNOWN. |
| *Briza minor* | *B. maxima*, *Chasmanthium* | Small triangular multi-floret dangling spikelets plus a relatively long papery ligule, not just any waving/flattened flowerhead. |
| *Elymus macgregorii* | *E. virginicus*, *E. glabriflorus*, hybrids | Many nodes with two spikelets, often dark auricles and early bloom; exact FNA values must be checked from one specimen. |
| *Panicum dichotomiflorum* | *P. capillare*, *Janochloa antidotalis* | Bent culms are NOT automatic stolons; local flora describes ciliate membrane whereas beginner field descriptions may call it hairs. Allow BOTH collar appearances; no rooted habit assumed. |
| *Sclerochloa dura* | *Poa annua*, *Sphenopholis* | Low compact RACEME and blunt glabrous lemmas versus Poa panicles/hairy lemmas. “Matted” does NOT prove a rooted stolon in this key. |
| *Stapfochloa canterae* | *S. ciliata*, *Chloris verticillata* | FNA *Chloris canterae* gives erose membrane and larger lemma hairs / awns; do not force a long-awns option just because they are obvious at macro scale. |
| *Janochloa antidotalis* | *Panicum dichotomiflorum*, *Panicum virgatum* | Hard knotted rhizome, swollen culm nodes, mature spikelet type. Nodes with hairs are NOT hair-fringed ligules; source images are nonlocal and establishment uncertain. |

## Botanical source anchors

- FNA direct: https://floranorthamerica.org/Bothriochloa_longipaniculata and https://floranorthamerica.org/Bothriochloa_laguroides
- FNA: https://floranorthamerica.org/Eragrostis_minor
- Kew GrassBase: https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:400988-1/general-information
- FNA: https://floranorthamerica.org/Chloris_ciliata and https://floranorthamerica.org/Chloris_canterae (older genus names for the two *Stapfochloa*)
- FNA: https://floranorthamerica.org/Briza_minor
- FNA: https://floranorthamerica.org/Elymus_macgregorii
- FNA: https://floranorthamerica.org/Panicum_dichotomiflorum
- FNA: https://floranorthamerica.org/Sclerochloa_dura
- FNA under previous name: https://floranorthamerica.org/Panicum_antidotale
- Existing source-identified dossiers in `audits/hays-expansion-20261111/` (packets 2, 3, 5, 6), copied photo manifests under `site/visual-key-lab/hays-candidates.json`.

## Integration and regression contract

Run `node scripts/test_provisional_trial_batch5_b.cjs` (independent test, no writes). Test applies the **production** `currentResults()` evaluator, checks old 112 scored species' accepted character combinations and 24 previous research trials, all newly supported positive paths, deliberate contradictory choices, unknown-state survival, *Stapfochloa* competition, and exact credited photos.

Only Chat 1 may merge and then wire Batch 5 lanes into `index.html`. Before a public release, separately run the full existing CI and mobile browser, test 112 original scores intact, all newly loaded cards visible with complete credits, no false exclusions, and compare after the site actually deploys. Never report 146 results as currently live prior to integration.
