# Hays Botany Visual Grass Key — Top-down accuracy pass 1
Date: 2026-11-10. Scope: visual-key-lab only; the existing species source lessons remain unchanged.

## Baseline
- All **112 species across 53 genera** load across nine species JSON files, with **514 source-image references**.
- No missing species, duplicate IDs, invalid option names, or restricted-license key photo references were found by the current metadata checks.
- Canyon muhly (Muhlenbergia ×involuta) lacks a generally reusable key photograph; do not substitute educational-use-only images.
- All species profiles remain **preliminary**; only selected characters on four species below have been checked against the uploaded regional flora.
- Twenty-one flowerhead options are now organized under five photo-first navigation headings: open/spreading panicles, narrow/plumed/crowded heads, distinct fingers/racemes/combs, spikes/foxtails/burs, and unusual male/female arrangements. Group headings do not eliminate species.

## Flora-backed corrections (user-uploaded Illustrated Flora of North Central Texas)
1. **Sorghum halepense — Johnsongrass** (uploaded PDF p. 248; printed p. 1324): panicles may be *open or narrow/contracted*, so both states are allowed. True ligule is a ciliate membrane; short awns (or none) do not qualify as conspicuous long awns.
2. **Poa arachnifera — Texas bluegrass** (PDF p. 236; printed p. 1313): dense, narrow, erect panicles, not a default airy cloud; separate-sex florets and cobwebby pistillate lemma hairs need their own eventual photo choices.
3. **Poa annua — annual bluegrass** (PDF p. 236; printed p. 1313): small, compact, erect panicle state added; older airy state remains *provisional* pending life-stage/photo verification.
4. **Bouteloua dactyloides — buffalograss**, formerly Buchloe (PDF p. 177; printed p. 1253): short *ciliate membranous* ligule, not a hair-only ligule. Male combs differ from usually hidden female bur-like heads; these must not be mistaken for spiny Cenchrus burs.

Source-specific notes and status fields are attached to the corresponding species records. No other species has been promoted to independently verified.

## Safety against wrong elimination
- Candidate filtering remains strict for selected coded states, but a new collapsed section shows species that disagree with provisional descriptions and **which selected trait** caused the exclusion. Users can inspect them rather than assuming they are impossible.
- Missing character data never eliminate a species.
- Rhizomes (underground stems), stolons (surface runners) and mere tuft-like appearance are not equivalent; skip a trait if the structure is not actually exposed.
- Compact heads need not be true spikes; Setaria sterile bristles, lemma awns and feathery stigmas are anatomically different.

## Regression tests against all 112 species
PASS: Johnsongrass retained under *open + rhizomes* and *contracted + rhizomes*; Texas bluegrass retained under *narrow + rhizomes* and *compact + rhizomes*; buffalograss retained under *male comb + creeping mat + membrane*; Cenchrus retained under *sandburs + bur involucres*. All 21 flowerhead states occur once in the navigation groupings, and every character value in the data has a matching selectable option.

These are logic and source-description checks, **not** a photo-by-photo visual audit or a field identification validation.

## Next passes
1. Genus-group comparison for the bluestems, gramas and windmillgrasses (Anatherum, Andropogon, Bothriochloa, Dichanthium, Schizachyrium, Bouteloua, Chloris): morphology, branch insertion, spathe and growth form.
2. Panicles and ligules of Poa, Panicum, Dichanthelium, Eragrostis and Muhlenbergia, including variable / seasonal states.
3. Bristles, one-sided racemes, reeds, and wetland groups; then measured spikelet, glume and lemma photo vetting.
4. GrassBase v2 structured crosswalk alongside the regional flora, Flora of North America, and BONAP for geographic nativity. The full GrassBase matrix has **not** been imported yet.

Reference: Diggs, Lipscomb & O'Kennon, *Illustrated Flora of North Central Texas* (1999), user-provided monocots excerpt, Poaceae section; GrassBase v2 (Vorontsova et al. 2026), https://zenodo.org/records/22302582. Do not reuse book illustrations or lengthy copyrighted passages without permission.
