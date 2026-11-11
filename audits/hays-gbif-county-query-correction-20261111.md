# Correction: earlier Hays GBIF herbarium search did not filter county reliably

**2026-11-11. This supersedes the negative conclusions of `hays-grasses-independent-voucher-leads-20261111.json` and its Markdown companion.**

The earlier index script passed `county=Hays` to GBIF's `/v1/occurrence/search`. The published [GBIF occurrence-search supported parameters](https://gbif.github.io/gbif-api/apidocs/org/gbif/api/model/occurrence/search/OccurrenceSearchParameter.html) do **not** include a county parameter. It returned broad specimen totals, and our local code filtered only the first 30 results, creating substantial **false-negative risk**.

**Therefore DO NOT conclude that the other 15 taxa lack Hays herbarium vouchers.** The zero counts are **invalid, not evidence of absence**. Likewise, nationwide query `count` is NOT a Hays specimen count.

**The three `Paspalum langei` TEX specimens remain valid positive evidence:** [TEX00568499](https://www.gbif.org/occurrence/3866879449), [TEX00568501](https://www.gbif.org/occurrence/3866886419), [TEX00485588](https://www.gbif.org/occurrence/5236506306). All three actual Hays-labeled sheets were separately opened and examined, with dates, habitats, collector-initial inconsistency, and remaining microscopic character gaps documented in [the authentic visual review](hays-paspalum-langei-3-sheets-visual-inspection-20261111.md).

**Two supposed `Tridentopsis elongata` leads also remain rejected**, because they were in fact `Tridens muticus var. muticus` (the different `Tridentopsis mutica`).

## Corrected required search method

1. Use a verified Hays County GADM level-2 region ID to query **georeferenced** preserved specimens, check all pages, and verify the regional assignment.
2. Because older herbarium vouchers may lack coordinates, complement GADM with a **Texas-only** paginated specimen search and filter `county` in returned records, using accepted names and historic combinations.
3. For every positive candidate, inspect the actual herbarium label and preferably the image/specimen determination; avoid taxonomic fuzzy-match false positives.
4. If a specimen is absent from either filtered route, label it `NO_RECORD_RECOVERED_IN_THIS_SEARCH`, never `ABSENT_IN_HAYS`.

**No public grass card or image was modified by this correction.** This is a source-quality correction intended to avoid wrong expansion decisions.
