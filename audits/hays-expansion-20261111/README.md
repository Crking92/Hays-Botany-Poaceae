# Hays County grass diagnostics — unified reference staging

**Integration date:** 2026-11-11  
**Mode:** reference data imported into the active Poaceae repository; **not** an automatic public-key species release.

## Current counts

- Existing public Grass ID Lab: **112** species, **514/514** hosted photographs audited in first pass; original photo QA data preserved.
- Hays candidate register: **58 original names → 57 proposed new taxa** (56 species + 1 hybrid) and one existing name alias.
- Phase 2 morphology literature dossiers: **48/57 prepared**, **267 source-described characters** across six packets.
- **9 dossiers left:** *Phyllostachys aurea*, *Cortaderia selloana*, *Panicum miliaceum*, *Muhlenbergia capillaris*, *Melinis repens*, *Nassella tenuissima*, *Cenchrus setaceus*, *Lolium × boucheanum*, *Miscanthus sinensis*.
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
3. [Initial import QA / explicit hard stops](hays-expansion-import-QA.md)
4. [Rights assessment records](hays-57-photo-rights-preflight.md) and its [machine-readable version](hays-57-photo-rights-preflight.json)
5. [Accepted names/synonyms crosswalk](../hays-58-nomenclature-final-staging.md)
6. [Seven photo-access/diagnostic holds](../hays-7-flora-diagnostic-proof-gates-20261111.md)

Other raw observation audits, temporary research tools, and GitHub Actions remain on the original diagnostic development branch `inat-coverage-audit-20261111`; **do not merge that entire branch** into `main`, because the development histories have diverged.

## Integration and release gates

- The existing **112 live species and their 514 audited photo references are authoritative for the current public key**. Preserve their metadata, rights records and QA findings.
- Preserve literature-derived new-character descriptions in staging, **not** in the live scoring filters, until the particular taxon and character is checked against the regional flora's taxon concept and credible specimen images. Distinguish literature state from same-specimen visual evidence.
- Do not use a missing photo or trait as an absent character. Do not assert a definitive botanical identification from iNaturalist research-grade status alone.
- Resolve separate **botanical diagnosis**, **rights**, and **local occurrence / planted-vs-established** gates for each candidate. Published Hays reports/vouchers strengthen occurrence evidence but do not by themselves sign off a diagnostic photograph.
- Main morphology reference is Diggs, Lipscomb & O'Kennon, *Illustrated Flora of North Central Texas* (1999), with Flora of North America, GrassBase and regional/voucher sources for complementary or modern taxonomic treatments. Do not republish copyrighted flora figures.
- An old name `Elymus glabriflorus` is mapped to existing `Elymus virginicus` in the register; **do not create a duplicate public card**.
- For each released taxon, add an accurate filter profile and specimen-/photo-backed comparison in a separate tested PR; run candidate/filter acceptance and mobile display tests; confirm website image attribution.
- Prioritize easy-to-encounter Hays grasses and confusing look-alike groups; leave tentative entries invisible to public filtering rather than degrading results.

## Next work from this shared starting point

1. Complete literature descriptions for the nine species listed above, especially the ornamentals whose Hays records may represent landscaping or escape.
2. Map each checked character to the existing Lab's specific trait vocabulary with explicit provenance and certainty.
3. Produce side-by-side field comparisons using already-audited photographs; only promote evidence-backed characters.
4. Run release/Pages QA on each bounded improvement and verify mobile behavior before counting a live deployment.
