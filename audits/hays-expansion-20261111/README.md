# Hays County grass diagnostics — unified reference staging

**Integration date:** 2026-11-11  
**Mode:** reference data imported into the active Poaceae repository; **not** an automatic public-key species release.

## Current counts

**Admission-readiness check, 2026-11-12 (main 962cb0d):** All 57 candidate records still carry `RESEARCH_CANDIDATE_NOT_RELEASED`; all seven packets retain specimen-ID holds. The 322 literature targets are prepared, not 322 verified specimen characters. The current Learner configuration contains 169 profiles (112 scored + 57 provisional). Gallery configuration now contains 54 references across 32 candidates; 25 have no configured gallery. These are not live-display counts or specimen approvals. No candidate has a recorded completed admission gate in these packets. This check inspected records, not new specimen pixels or licenses. Run `node scripts/check_grass_admission_readiness.cjs` to reproduce the inventory and hold checks.

The historical counts below describe the original import. Reference-only Learner visibility has since been authorized by the [unified working rules](../../site/visual-key-lab/UNIFIED_169_WORKING_RULES.md); old wording withholding all public cards must not be read as withholding that visibility. Scored-key admission remains a separate per-species decision.

- Existing public Grass ID Lab: **112** species, **514/514** hosted photographs audited in first pass; original photo QA data preserved.
- Hays candidate register: **58 original names → 57 proposed new taxa** (56 species + 1 hybrid) and one existing name alias.
- Phase 2 morphology literature dossiers: **57/57 prepared**, **322 source-described character targets** across seven packets. Literature-writing phase complete; Hays specimen ID/rights gates remain open.
- **0 literature dossiers left.** The final nine cover *Phyllostachys aurea*, *Cortaderia selloana*, *Panicum miliaceum*, *Muhlenbergia capillaris*, *Melinis repens*, *Nassella tenuissima*, *Cenchrus setaceus*, *Lolium × boucheanum*, and *Miscanthus sinensis*. These still require appropriate specimen-level diagnosis before public release.
- **0** of the 57 proposed new taxa is signed off for a public species-card merge. Literature descriptions are not independent verification of a Hays specimen. Rights approvals remain separate.

## Read these files

1. [57 draft cards and source links](hays-57-draft-id-cards.json) and [human register](hays-57-draft-id-cards.md)
2. Six pairs of source packets (JSON + Markdown):
   - [Packet 1](hays-8-flora-diagnostic-packet-20261111.md)
   - [Packet 2](hays-8-flora-diagnostic-packet-2-20261111.md)
   - [Packet 3](hays-8-flora-diagnostic-packet-3-20261111.md)
   - [Packet 4](hays-8-flora-diagnostic-packet-4-20261111.md)
   - [Packet 5](hays-8-flora-diagnostic-packet-5-20261111.md)
   - [Packet 6](hays-8-flora-diagnostic-packet-6-20261111.md)
3. [Final nine species — packet 7](hays-9-flora-diagnostic-packet-7-20261111.md) and [machine-readable character targets](hays-9-flora-diagnostic-packet-7-20261111.json), including the conflicting Lolium hybrid-parentage accounts
4. [Initial import QA / explicit hard stops](hays-expansion-import-QA.md)
5. [Rights assessment records](hays-57-photo-rights-preflight.md) and its [machine-readable version](hays-57-photo-rights-preflight.json)
6. [Accepted names/synonyms crosswalk](../hays-58-nomenclature-final-staging.md)
7. [Seven photo-access/diagnostic holds](../hays-7-flora-diagnostic-proof-gates-20261111.md)

Other raw observation audits, temporary research tools, and GitHub Actions remain on the original diagnostic development branch `inat-coverage-audit-20261111`; **do not merge that entire branch** into `main`, because the development histories have diverged.

## Integration and release gates

- The existing **112 live species and their 514 audited photo references are authoritative for the current public key**. Preserve their metadata, rights records and QA findings.
- Preserve literature-derived new-character descriptions in staging, **not** in the live scoring filters, until the particular taxon and character is checked against the regional flora's taxon concept and credible specimen images. Distinguish literature state from same-specimen visual evidence.
- Do not use a missing photo or trait as an absent character. Do not assert a definitive botanical identification from iNaturalist research-grade status alone.
- Resolve separate **botanical diagnosis**, **rights**, and **local occurrence / planted-vs-established** gates for each candidate. Published Hays reports/vouchers strengthen occurrence evidence but do not by themselves sign off a diagnostic photograph.
- Follow the [current role-specific source policy](../../site/visual-key-lab/MORPHOLOGY_SOURCE_POLICY.md): Hagenbuch & Lemke (2015) first for vegetative characters; Diggs, Lipscomb & O'Kennon (1999) first for reproductive characters; GrassBase/PolyClave supplementary, with FNA and verified local vouchers clarifying gaps. Do not republish copyrighted flora figures.
- An old name `Elymus glabriflorus` is mapped to existing `Elymus virginicus` in the register; **do not create a duplicate public card**.
- For each released taxon, add an accurate filter profile and specimen-/photo-backed comparison in a separate tested PR; run candidate/filter acceptance and mobile display tests; confirm website image attribution.
- Prioritize easy-to-encounter Hays grasses and confusing look-alike groups; leave tentative entries invisible to public filtering rather than degrading results.

## Next work from this shared starting point

1. **Literature profiles complete (57/57).** Next, validate critical same-specimen traits, plant origin context and the unresolved Lolium hybrid parentage before field-key release.
2. Map each checked character to the existing Lab's specific trait vocabulary with explicit provenance and certainty.
3. Produce side-by-side field comparisons using already-audited photographs; only promote evidence-backed characters.
4. Run release/Pages QA on each bounded improvement and verify mobile behavior before counting a live deployment.
