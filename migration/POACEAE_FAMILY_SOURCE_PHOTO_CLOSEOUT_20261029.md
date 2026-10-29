# Poaceae existing-source family migration — photo coverage closeout

**As of October 29, 2026 — snapshot of generated `site/data/gallery-index.json` and `poaceae-release.json` after Poaceae main's successful source-only publisher.**

## Result

| Gate | Observed |
| --- | ---: |
| Species source cards migrated into Poaceae family repository | **112/112** |
| Species with a published source-folder photograph of their own species | **112/112 (100%)** |
| Species with no released image | **0** |
| Referenced original source-photo files displayed in family site | **486** |
| Reused panels (some files serve multiple lessons) | **604** |
| Other possible photo panels excluded by final rights gate | **213** |
| Existing extra source originals in frozen 2026-10-28 ledger held outside Poaceae main | **56 originally; 3 USGS recovered later, leaving 53 legacy-held** |
| New species/photo collection from external image searches in this photo recovery effort | **0** |

**Meaning of 100%:** Every species has at least one photograph from its own recorded source species folder; none relies exclusively on a different species' comparison image. Folder provenance and preexisting photo taxon labels are **not independently verified genetic, voucher or expert specimen IDs**, and the finding is **not** 100% anatomy-arrow, ligule, glume, lemma or look-alike completion.

## Previously archived photo recovery

1. The first eight rescued own-species galleries used old CC, author public domain, USDA and USFWS originals.
2. [18 exact individually photographed CC BY archive records](reviewed-photo-level-ccby-20261029.json) restored `Dichanthelium lindheimeri` (9), `D. pedicellatum` (5) and `Festuca versuta` (4). Precise CC BY license version was **not archived**, so credit displays `CC BY` and links to the source photograph without inventing a version.
3. [25 curated existing original-photo records](curated-existing-grass-photo-closeout-20261029.json) finished all nine remaining taxon folders:
   - 8 archived per-photo CC BY labels with exact GBIF/iNaturalist image-source link, no guessed version
   - 3 archived CC0 photo records (credit recorded even though CC0 attribution is optional)
   - 1 Cecelia Alexander original credited CC BY-SA 4.0 by the USDA Forest Service FEIS
   - **10 Bob Harms original photos** reproduced for this noncommercial scientific/educational site **with author credit under his Selected Monocots copyright permission**, **NOT Creative Commons**
   - **3 original Larry Allain USGS public-domain photographs**, byte-for-byte copied from original read-only `Hays-County-Botany` repo at **`d4d1ebec8ca7b1f46b7ef2f3b58cbd79e583de42`**, validated using original Git blob SHA hashes:
     - `larry-allain-usgs-texas-grama-field-habit.jpg`: `fe66c9e2fd88ace5ac0801abdf4bc915d6df4f43`
     - `larry-allain-usgs-texas-grama-flower-head-1.jpg`: `658d550e28a1ea4a9f418e0e3a6d241e20ebad01`
     - `larry-allain-usgs-texas-grama-flower-head-2.jpg`: `7baa05de0aba1e0672a9a43f532523e14a359ed7`

These are *existing source images*, not new media harvested for the site. The old repository has not been edited. The publisher itself copies no new media; it publishes references to existing files in the Poaceae main tree. The one-shot public-domain USGS transfer separately copied those three files into the destination after verifying exact source byte equality.

### Rights and source caution

- The latest upstream multimedia license was not independently live rechecked for every archived CC photo; existing photo-level archive metadata is the evidence. An occurrence's own data license is **not necessarily the image's** license.
- The Bob Harms site explicitly permits scientific and educational uses with correct author credit. It does **not** grant general CC redistribution or commercial use. The actual photo card states that restriction. Source: https://w3.biosci.utexas.edu/prc/Monocots/
- The USDA Forest Service page credits Cecelia Alexander with CC BY-SA 4.0 for `Eragrostis intermedia` habit: https://research.fs.usda.gov/feis/species-reviews/eraint
- The USGS page identifies Larry Allain as image author of `Bouteloua rigidiseta`: https://warcapps.usgs.gov/PlantID/Species/Details/3292 and the federal USGS copyright policy is https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits
- **CC BY-NC, all-rights-reserved, private-study-only, and undocumented images are not automatically included** to reach 100%. The 53 other historical held media stay in the original archive, recorded as an intentional hold rather than an accidental deletion.
- Copyright credit must travel with any educational export. This site does not authorize visitors to reuse Bob Harms's images under CC terms.

## Site and routes

- Poaceae family site: https://crking92.github.io/Hays-Botany-Poaceae/site/
- Optional central hub review button: https://crking92.github.io/Hays-Botany-Public/
- Original unified learner is preserved as the hub's **default grass species-search route** until explicitly authorized otherwise, as agreed in the family-routing work.
- Future species/photo/anatomy edits target `Crking92/Hays-Botany-Poaceae` main, not the original hub, under the active routing registry. No old automations restarted.

## Checks

Successful publication pipeline regenerated all 112 species and 604 panels; builder now **refuses to publish a regressed release** if any species loses its own source-photo panel. Previous broad preview, source-hash/rights audit and cross-family routing checks remain available in Actions.

The strengthened [live smoke workflow](../.github/workflows/smoke-public-poaceae-pages.yml) checks each of the 112 target-species cards and compares **every one of the 486 website image responses to the local original file bytes**, plus preserves separate author-license labels, exact source credit and the 18 earlier independently reviewed CC BY photos. A workflow success run is required to call *live delivery* fully verified; source-catalog coverage and GitHub Pages delivery are distinct gates.

## Remaining work outside this photo-transfer milestone

The grass gallery is ready for handoff to the next family on **source-photo presence and recorded rights**, but fine-scale botanical identity/arrow placement, additional plant-part images, missing root/ligule/glume details, genus comparisons and quiz content require their own periodic quality-control passes. Do not conflate them with the now-complete **112/112 photo-presence** migration.
