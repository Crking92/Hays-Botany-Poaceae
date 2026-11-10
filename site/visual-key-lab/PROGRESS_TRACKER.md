# Hays Botany — Visual Grass Multi-Access Key Progress

**Updated:** 2026-11-10  
**Scope:** 112 Hays Botany Poaceae species, 53 genera. This is the single progress ledger for the key; do not create per-batch spreadsheets.
**Important:** This tracker distinguishes coverage from verification. A species with one checked character is not a fully verified ID.

## Phase dashboard

| Phase | Status | Progress / evidence | Definition of complete |
|---|---|---|---|
| 1. Complete species framework | **COMPLETE** | **112/112 species** (100%), 53 genera, 9 JSON species files, all load and pass integrity tests | Every indexed species available to candidate filtering, unknown traits permitted |
| 2. Initial top-level morphology **source-coverage** | **INITIAL PASS COMPLETE; DETAIL OPEN** | **112/112 species (100%) have at least one source-backed broad or visible character** after group screening across all 112. Individual head, habit, ligule and awn states remain **partly provisional** and must be checked more deeply. | Initial broad group review and at least one cited morphology character per species; **NOT** full morphology verification |
| 3. Diagnostic genus/species characters | **IN PROGRESS — PASS 1 (11/112 source-backed checklists)** | **24** cited anatomical check prompts across **11** bluestem/grama species; KR awn units corrected, blue/hairy grama ligules source-checked. **0/112** fully photo-and-dissection certified. | Complete comparable morphology matrix, measurements, contradictions, source taxon concepts, and photographs |
| 4. Character-photo matching QA | **NEEDS SYSTEMATIC PASS** | **514** source-licensed image references linked; one key-photo gap at Canyon muhly; presence of a photo does not mean it demonstrates the chosen character | Each public visual character image clearly demonstrates the specified structure and carries exact-source rights |
| 5. Full-key and field acceptance | **NOT COMPLETE** | Data integrity and **24/24** targeted candidate-retention tests passed; actual picture crops, live latest deployment and field specimens still need verification | Key and pages function on desktop/mobile and field testing confirms paths and avoids false exclusions |

**How far from completion?** Species framework **and the first complete source-coverage pass** are finished: **112/112** indexed and **112/112** with at least one externally supported morphological character. This is NOT 100% completion of the project. The remaining work is the 101 species without Phase 3 source-linked checklists, deeper verification of all diagnostic checks, photo-role verification and attribution (Phase 4), and live field acceptance (Phase 5). The current key is an unverified prototype.

## Phase 3 — first species-separating anatomy pass (2026-11-10)

- **11/112 species (9.8%)** have at least two new source-linked diagnostic checks; **24** checks in all. This is **initial checklist coverage**, not a count of fully validated species. Each note names the structure, what should be observable and the principal look-alike; its source is stored on the exact species record.
- Covered: little bluestem, King Ranch bluestem, silky bluestem, cane bluestem, silver bluestem, Kleberg bluestem; blue grama, hairy grama, tall grama, Texas grama, and red grama. Records live in `species-a.json`, `species-c1.json`, and `species-d1.json`.
- Corrected KR bluestem: previous **1–1.5 mm** awn wording disagreed with Flora of North America; true awns are reported **9–17 mm**, geniculate and twisted. Its visual selection now tolerates both clearly evident awns and awns obscured in a whole-head view; key's `none_obvious` option does not mean biologically awnless.
- Source-checked **hair-fringe ligules** for blue and hairy grama. Texas and red grama **remain unscored** in the broad 'three LONG awns' option even though their individual fertile lemmas are three-awned: that button uses an `Aristida` example and is not homologous in appearance to their short macrostructures.
- **Photo and specimen QA still pending:** photo-role accuracy for all **514** references remains an independent Phase 4 task; do not mark any species photo verified merely because a textual character is externally supported.
- Source notes: [Phase 3 pass 1 detailed report](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md); [FNA KR](https://openherbarium.org/portal/taxa/index.php?clid=29&taxauthid=1&taxon=237483); [FNA hairy grama](https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427); [Kew POWO/GrassBase](https://powo.science.kew.org/).
- **Next Phase 3 batch:** complete additional big bluestem, sideoats and remaining native/introduced bluestem look-alikes, then the windmillgrasses. Preserve all 112 as candidates when traits are unknown. No photos imported in this pass.

## Broad-morphology group-level review — coverage status

| Review group | Species first-pass screened | With ≥1 external morphology source | Still without any source reference |
|---|---:|---:|---:|
| Bluestems, gramas, windmillgrasses | 22 | 22 | 0 |
| Airy-panicle groups (*Panicum, Dichanthelium, Poa, Eragrostis, Muhlenbergia*) | 24 | 24 | 0 |
| One-sided racemes, bristles, sorghums, reeds, wetlands | 28 | 28 | 0 |
| Spikes, awned grasses, dropseeds, cool-season and remaining groups | 38 | 38 | 0 |
| **TOTAL** | **112 / 112** | **112 / 112** | **0** |

**Interpretation:** The **112/112** source-coverage metric only means every species has **at least one** externally supported or compared morphological feature. It is not independent confirmation of the identity of all photographs, measurements, every coded state, taxon synonyms, Hays County native status, or plant specimens. All remaining uncertainty remains eligible for "Can't tell / skip" and source discrepancy review.


## Current subphase: broad morphology by related-grass group

**Bluestems + gramas + windmillgrasses**: 22 existing species records inspected as a group. Eleven changed based on explicit differences in the provided *Illustrated Flora of North Central Texas* and/or existing species lessons:
- KR bluestem (*Bothriochloa ischaemum*): short awns (not “long, obvious”), plus grazed/mown rhizomatous or stoloniferous forms.
- Cane and silver bluestems (*Bothriochloa barbinodis* and *B. torreyana*): contracted silvery branching heads, instead of KR-style finger clusters.
- Big bluestem (*Andropogon gerardii*): allow awned and shorter/awnless forms without forcing one regional subspecies.
- Sideoats grama (*Bouteloua curtipendula*): both tufted and creeping-rhizome forms; ciliate membrane ligule.
- Texas grama (*Bouteloua rigidiseta*): NEW distinct head choice for a few short non-pectinate branches instead of misleading long eyebrow combs. The generic Aristida “three long awns” photo is not sufficient for its triple-awned floral structure, so current awn state left unscored pending actual macro review.
- Hooded windmillgrass (*Chloris cucullata*): one terminal whorl, not the vertically separated tiers diagnostic of tumble windmillgrass.
- Feather fingergrass (*C. virgata*), tumble windmillgrass (*C. verticillata*), slender windmillgrass (*C. andropogonoides*): use a ciliate membranous ligule at the broad-genus level, with detailed species-level verification still needed.
- Shortspike windmillgrass hybrid (*Chloris ×subdolichostachya*): one whorl in the older regional key; hybrid identification **not** proven by head silhouette.

**Previous pass source-checks**: Johnsongrass (*Sorghum halepense*), annual and Texas bluegrass (*Poa annua*, *P. arachnifera*), buffalograss (*Bouteloua dactyloides*). Buffalograss is also part of the 22-species scoped group, hence `4 + 11 = 15` unique species with partial checks.

**Flora:** Diggs, Lipscomb & O'Kennon (1999), *Illustrated Flora of North Central Texas*, user-uploaded monocots excerpt; relevant PDF pp. 162–163, 170–172, 180, 182, 186. Old names are cross-referenced, not automatically silently substituted for accepted names. Flora is North Central Texas, not county-level nativity proof.

## Tested examples (112-species candidate pool)

All nine of these combinations retain their expected species:
1. KR bluestem: terminal fingers + rhizomatous base after mowing + no conspicuous LONG awn.
2. Cane bluestem: contracted bushy head + tuft + long awns.
3. Silver bluestem: narrow panicle + tuft + long awns.
4. Texas grama: short separated non-pectinate racemes + tuft (one match in current pilot).
5. Sideoats grama: short many side racemes + rhizome + membranous ligule (one match in current pilot).
6. Hooded windmillgrass: terminal fingers + tuft + membranous ligule + no conspicuous long awn.
7. Tumble windmillgrass: tiered whorls + membranous ligule + long awns.
8. Feather fingergrass: terminal fingers + membrane + long awns.
9. Big bluestem: terminal fingers + tuft + no conspicuous long awn in variable forms.

These checks do **not** certify field IDs, local nativity, or the candidate system's final botanical accuracy.

## Latest pass — airy and contracted panicles (2026-11-10)

All **24** species in *Panicum, Dichanthelium, Poa, Eragrostis,* and *Muhlenbergia* were screened at the broad-character level; **20** now have partial regional-flora character evidence (two Poa species already had evidence). This is not full species-level validation.

- Hall's panicgrass: a **short splitting membranous ligule fringed with hairs**, so either broad choice can represent what is visible.
- Witchgrass: regional flora says hair ligule; existing FNA-backed record describes a ciliate membrane. Both are provisionally tolerated pending a scaled collar photo.
- Purple lovegrass: tufted but with a short, knotty rhizomatous base (not exposed in the archived habit photos).
- Seep muhly and nimblewill: published awn lengths overlap the visual long/short boundary, so the broad key allows variation.
- Red lovegrass: the regional oxylepis treatment has a very short membranous ligule base partly hidden by hairs; don't extend subspecies-level anatomy to every plant.
- Canyon muhly: the flora supports a short awn (0.5–2 mm), membranous genus-level ligule, and open fine-branched panicle; no CC-cleared public key photo yet.
- Cedar rosette grass: the flora describes a 0.3–1 mm true **hair-fringe ligule** under the historical name *Panicum pedicellatum*.
- Tumblegrass: the older *Schedonnardus paniculatus* name is cross-referenced; the long sparse radiating head is now source-checked.
- These four were pending at the time of the earlier airy-panicle pass: *Dichanthelium commutatum, D. lindheimeri, Eragrostis lugens,* and *Muhlenbergia dubia*. They later received partial external-source evidence in the full-coverage pass; difficult characters still need confirmation.

QA: every one of **112 indexed species** remains unique, all character-state keys are valid, and 7 targeted selection routes retain their expected grasses. The 514 photo references are unchanged.

Full detail: [Airy-panicle source checks](TOP_DOWN_QA_PASS3_AIRY_PANICLES_2026-11-10.md).

## Latest pass — one-sided racemes, bristles, reeds, wetland grasses (2026-11-10)

All **28** species in the selected group now have at least one partial source check, including Johnsongrass from the earlier pass. **27 newly source-checked species** bring the project total to **60/112**. Source descriptions, uncertainties and old-to-new taxon name crosswalks are preserved in the nine species JSON files; underlying Hays Botany species lessons were **not** rewritten.

Key changes: distinct sparse-interrupted *Setaria reverchonii* choice; vaseygrass's numerous ascending one-sided racemes; hairs and rooting lower nodes on *Urochloa texana*; grain sorghum awned/awnless variability; aquatic current-swept Texas wild-rice with separated lower male / upper female floral branches; giant cutgrass with sexes intermingled; glume rather than lemma awns in *Polypogon*. No further species were added.

**18/18** targeted combination tests retained the expected species. Some paths correctly retain multiple candidates (*Paspalum*, *Arundo*/*Phragmites*); they require fine anatomy in Phase 3. JavaScript syntax, state mappings and all photo-choice references passed metadata checks, **not live image inspection**.

Detailed source notes: [Pass 4 — racemes, bristles, reeds and wetlands](TOP_DOWN_QA_PASS4_RACEMES_REEDS_2026-11-10.md).

## Latest pass — full 112-species initial broad-source coverage (2026-11-10)

The formerly unscreened **38** grasses were reviewed for broad head/habit/ligule/awn characters in one pass. Their data files now contain a group-screened marker and external source notes where evidence supports a character. This pass also reconciled the **17** previously pending source gaps in the earlier groups. The project now has **112/112 species with partial external morphology support**, not 112 fully botanically authenticated keys.

Important corrections include:
- **Bermudagrass**: a short **ciliate membranous** ligule, in addition to stolons and rhizomes.
- **Texas wintergrass**: ligule may be effectively absent **or** a tiny membrane; very long *single* floret awn.
- **Tanglehead**: a new photograph-backed **tangled awn raceme** head choice.
- **Threeawns, bromegrasses and fescues**: allow documented head/awn variation and distinguish annuals from perennials by real connected growth habit.
- **Munroa**, tobosa, curlymesquite and hidden dropseeds: retain small clustered/spiciform heads but distinguish stolons from rhizomes and note when a panicle is partially sheathed.
- **Blue, hairy, tall and red gramas**: pectinate branching differs from Texas grama's short *non-pectinate* lateral branches; branch-axis extensions remain high-value Phase 3 targets.
- **Triplasiella eragrostoides**: accepted name crosswalk and broad open panicle size source-checked against Peterson et al. (2016), not a blanket merger with *Triplasis*.
- **Dichanthelium** ligules and **Muhlenbergia dubia** narrow panicle/variable awns: recorded literature variation and historic taxon treatment explicitly.

**Quality gates:** all **112 indexed IDs** unique across **53 genera**; **514** existing photo references; **26** head shapes, **4** growth forms, **3** ligule states and **5** awn/bristle states; every state valid; head choices grouped exactly once; selection-photo references resolved in metadata; JS syntax valid; **24/24** targeted expected-species candidate checks passed. These are static and logical tests, not proof of successful image loading or botanical ID.

[Read full broad-group Pass 5 and source notes](TOP_DOWN_QA_PASS5_FULL_112_2026-11-10.md).

## Next phases — where most work remains

1. **Phase 3: species-separating anatomy**. Organize by real look-alike families starting with bluestems and gramas, then windmillgrasses, panicgrasses, dropseeds, cool-season wildryes, and reeds. Review ligule/collar, spathe vs sheath, rachilla, glume/lemma awn vs foxtail branch bristle, branch insertion, spikelet sex, floret count and measurements. Reconcile old names with Kew/GrassBase, Flora of North America and regional Texas floras rather than silently changing accepted names.
2. **Phase 4: visual photo QA**. For the **26 flowering-head options** and every other trait choice, inspect actual photos at field-usable size. Replace misleading crops with legitimate diagnostic photographs and keep exact creator, source URL and license. Canyon muhly (*Muhlenbergia ×involuta*) remains the one species with zero key-photo refs.
3. **Phase 5: live website and field acceptance**. Verify latest GitHub Pages deployment, photo URLs and mobile interactions; sample real winter, dormant, vegetative and flowering specimens from the Hays County teaching set; compare look-alikes and review false exclusions. Do not promote a final public key until verified.

**Project workflow guardrails:** no changes to the old hub; source species galleries remain untouched, no extra spreadsheets, no forced guessing, unknown states do not eliminate a species, regional-native labels must not be inferred from an old flora's geographic range alone.
