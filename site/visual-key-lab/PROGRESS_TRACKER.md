# Hays Botany — Visual Grass Multi-Access Key Progress

**Updated:** 2026-11-10  
**Scope:** 112 Hays Botany Poaceae species, 53 genera. This is the single progress ledger for the key; do not create per-batch spreadsheets.
**Important:** This tracker distinguishes coverage from verification. A species with one checked character is not a fully verified ID.

## Phase dashboard

| Phase | Status | Progress / evidence | Definition of complete |
|---|---|---|---|
| 1. Complete species framework | **COMPLETE** | **112/112 species** (100%), 53 genera, 9 JSON species files, all load and pass integrity tests | Every indexed species available to candidate filtering, unknown traits permitted |
| 2. Initial top-level morphology **source-coverage** | **INITIAL PASS COMPLETE; DETAIL OPEN** | **112/112 species (100%) have at least one source-backed broad or visible character** after group screening across all 112. Individual head, habit, ligule and awn states remain **partly provisional** and must be checked more deeply. | Initial broad group review and at least one cited morphology character per species; **NOT** full morphology verification |
| 3. Diagnostic genus/species characters | **IN PROGRESS — PASSES 1–5 (53/112 checklist profiles, 47.32%)** | **138** source-linked anatomical checks across **53** grasses; completed all six Paspalum and three Urochloa records with source-backed glume/spikelet comparisons. **0/112** fully photo-and-dissection certified. | Complete comparable morphology matrix, measurements, contradictions, source taxon concepts, and photographs |
| 4. Character-photo matching QA | **NEEDS SYSTEMATIC PASS** | **514** source-licensed image references linked; one key-photo gap at Canyon muhly; presence of a photo does not mean it demonstrates the chosen character | Each public visual character image clearly demonstrates the specified structure and carries exact-source rights |
| 5. Full-key and field acceptance | **NOT COMPLETE** | Data integrity and **24/24** targeted candidate-retention tests passed; actual picture crops, live latest deployment and field specimens still need verification | Key and pages function on desktop/mobile and field testing confirms paths and avoids false exclusions |

**How far from completion?** Species framework **and the first complete source-coverage pass** are finished: **112/112** indexed and **112/112** with at least one externally supported morphological character. This is NOT 100% completion of the project. The remaining work is the 59 species without Phase 3 source-linked checklists, deeper verification of all diagnostic checks, photo-role verification and attribution (Phase 4), and live field acceptance (Phase 5). The current key is an unverified prototype.

## Cross-project release-gate caution (2026-11-10)

The separate **Poaceae comprehensive migration gates (NO deployment)** workflow failed on a **pre-existing broader source/photo-release audit**, distinct from the 112-species visual key's 25/25 candidate-retention tests. [Failing workflow run](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/42915891685) reported **3 held image files in the PUBLIC repository** and **2 source checksum mismatches**; these were not modified, removed, or cleared in this morphology pass. They require exact-path source/photo rights and byte-identity investigation in the appropriate photo-quality workflow before any public release claim. Manual photo inspection and release rights cannot be inferred from a successful key metadata test.

## Phase 3 — latest cumulative status (Pass 5, 2026-11-10)

- **53 of 112 grass species (47.32%)** now have a first source-backed anatomical checklist; **138** individual source-linked structure checks; **59** species remain for first-pass coverage. **Zero** species are certified at full specimen dissection + exact-image character-role level.
- Pass 5 added **9 species / 27 anatomical checks**: all six in-scope *Paspalum* species (knotgrass, Dallisgrass, Florida paspalum, *P. pubiflorum*, thin paspalum, Vaseygrass), plus *Urochloa texana*, *U. fusca*, and *U. reptans*.
- Important new distinctions: **lower glume usually absent in Paspalum** (rare tiny vestige in *P. distichum*) versus **developed lower glume in Urochloa**; Dallisgrass 5–7 veins on **both** upper glume and sterile lemma versus Florida paspalum **5 upper / 3 lower sterile** and Vaseygrass **3 / 3**; spikelet **single versus paired**, size and margin hair length.
- Safety corrections: *Paspalum distichum* usually has two head branches but FNA allows a third, so both `paired_spikes` and general `one_sided` are eligible. *Urochloa texana* has a **ciliate membrane** true ligule, which can appear as hairs; broad visual filter allows both `membrane` and `hairs`, without claiming distinct anatomical ligule types.
- **23/23** new candidate-retention tests passed, including representative earlier vulnerable cases; all nine JSON files contain **112 unique species** and preserve **514** linked photo references. No image or range-status changes.
- **Still blocked separately:** photo-release comprehensive QA earlier flagged **3 held files present in public source** and **2 source checksum discrepancies**. These have **not been fixed or cleared** by morphology work; source/photo-rights workflow must investigate exact files before release clearance.
- [Pass 5 report — Paspalum & Urochloa](TOP_DOWN_PHASE3_PASS5_PASPALUM_SIGNALGRASS_2026-11-10.md) · [Pass 4](TOP_DOWN_PHASE3_PASS4_BRISTLEGRASS_SORGHUM_2026-11-10.md) · [Pass 3](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md).
- **Next:** Finish remaining allied one-sided and riparian grasses (*Disakisperma, Dinebra, Digitaria, Eriochloa*), then small panicle, dropseed and lovegrass groups. Continue to display unknown traits and exact-source notes rather than invent diagnostic proof.

## Phase 3 — latest cumulative status (Pass 4, 2026-11-10)

- **44/112 grass species (39.29%)** now have first source-backed anatomical checklists, comprising **111 individual checks**, leaving **68** species without their Phase 3 first checklist pass. **Zero** have complete per-specimen dissection and exact-image character-role certification.
- Pass 4 added **11 species / 30 checks**: marsh, Scheele's and Reverchon's bristlegrasses; foxtail millet; Indiangrass and slender Indiangrass; Johnsongrass and cultivated/weedy sorghum; coastal sandbur, tanglehead and eastern gamagrass.
- FNA/Kew-driven corrections: *Sorghum halepense* permits awnless OR visible awns to ~13 mm; `none_obvious` + `long` now allowed. *Setaria reverchonii* may have short rhizomes; `tuft` + `rhizome` allowed. *Sorghastrum elliottii* has a ciliate **membrane** ligule (2–4 mm). *Heteropogon* ligule source-category conflict is flagged and preserved as a visible two-state possibility.
- Clear structural lessons: Setaria bristles are **separate sterile branchlets**, Cenchrus bristles **fuse into a burr involucre**, Sorghastrum has **bare companion pedicels**, and Sorghum has a **developed pedicelled spikelet**; these are not interchangeable morphological structures.
- **25/25 new candidate-retention regression tests passed**, including all revised multi-state cases and previous important KR/Poa/sideoats cases. 112 unique species loaded across nine JSON files; **514 existing photo references** intact, source URL and field integrity tests passed.
- No gallery/photo bytes imported, no new spreadsheets created, no county-native classifications changed. Phase 4 photo-role and source-rights reviews and Phase 5 deployed/mobile/actual field acceptance remain open.
- Full anatomy/source report: [Phase 3 Pass 4 — bristlegrasses and sorghums](TOP_DOWN_PHASE3_PASS4_BRISTLEGRASS_SORGHUM_2026-11-10.md). Prior reports: [Pass 3](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md), [Pass 2](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md), [Pass 1](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next high-value Phase 3 group:** Paspalum distinctions and one-sided/riparian grass look-alikes; cross-check mature spikelets at scale, not just the number of branches. Still photo-first with a 'can't tell / skip' route.

## Phase 3 — latest cumulative status (Pass 3, 2026-11-10)

- **33 of 112 grasses (29.46%)** now have first source-linked anatomy checklists; **81** individual anatomical checks in total; **79** species remain without a checklist. **None** of these 33 is yet certified through full specimen dissection plus exact-photo anatomy QA.
- Pass 3 added **12 species / 32 checks**: prairie/oldfield threeawn, purple threeawn, annual bluegrass, Texas bluegrass, Japanese brome, hairy woodland brome, lanceolate brome, Texas brome, sixweeks fescue, Texas fescue, Texas wintergrass and wild oat.
- The strongest new distinctions are **3–7 veins versus one vein on the Aristida lower glume; strictly dioecious female Poa arachnifera with three cobwebby callus webs; and Bromus lower/upper glume veins plus lemma/awn attachment**, supported by FNA and Kew.
- Critical source disagreement: FNA *Avena fatua* commonly has **2(3) florets** per spikelet, while older regional flora suggests **3–4**. We retain the conflict and do not make a misleading exclusive filter. Taxon/life-stage variations also remain explicit.
- **24/24 Pass 3 candidate-retention regression checks passed** on all 112 records. Prior passes' **14/14** and **20/20** reported tests and original **24/24** checks were not re-interpreted as specimen ID validations.
- Data integrity: **112 unique IDs across nine JSON files, 514 existing photo references, 33 checklist profiles and 81 complete source-linked checks**.
- **No new image files uploaded or licensed**, and no source/photo confidence has been silently upgraded. Diagnostic character photo-role checks, rights/crops and live mobile confirmation remain phases 4–5.
- [Pass 3 winter-grass report](TOP_DOWN_PHASE3_PASS3_WINTER_GRASSES_2026-11-10.md) · [Pass 2](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md) · [Pass 1](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next useful group:** bristlegrasses (*Setaria*, *Cenchrus*), paired spikelet grasses (*Sorghum, Sorghastrum*), or remaining small-grass genera, prioritizing frequent Kyle and winter field encounters.

## Phase 3 — latest cumulative status (Pass 2, 2026-11-10)

- **21 of 112 (18.75%)** now have first source-linked anatomical diagnostic checklists, containing **49** individual checks. **91** remaining for first checklist screening. This is *checklist coverage*, not 21 species confirmed by dissected specimens and diagnostic photos.
- Second pass added **10 species / 25 anatomical checks**: big bluestem, sideoats grama, bushy bluestem, broomsedge, *Anatherum tenuispatheum*, tumble windmillgrass, feather fingergrass, hooded windmillgrass, slender windmillgrass and shortspike windmillgrass hybrid.
- Evidence correction: hooded windmillgrass may have **closely packed whorls**, not necessarily only one; compare shape/awn of the inflated upper sterile floret against *C. verticillata* and possible hybrid intermediates.
- Source inconsistency: FNA describes sideoats grama as **membranous ciliate ligule (0.3–0.5 mm)** while Kew GrassBase describes a **hair fringe (~0.5 mm)**. Two broad key states allowed provisionally, flagged as source-category conflict for collar macro QA.
- *A. tenuispatheum*: published raceme-spathe width, ligule and sessile-spikelet measurements are now stored under its accepted-name profile with older-source taxon-concept warnings; no local voucher/photo anatomy verified.
- **20/20** new candidate-retention scenarios passed on all 112 profiles; the **14/14** previous specific checks and **24/24** legacy candidate tests were also reported passing in their respective passes. These are filtering tests, not specimen-validation tests.
- **514** already linked source-photo references still need actual role/crop/rights QA under Phase 4. **No new photo bytes published** during the key work.
- [Pass 2 report](TOP_DOWN_PHASE3_PASS2_WINDBLUESTEM_2026-11-10.md) · [Pass 1 report](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md).
- **Next batch suggestion:** native/introduced bristlegrasses and sorghums, or Poa/Aristida/Bromus regional look-alikes; keep genus/photo decisions skippable pending source-backed anatomy.

## Phase 3 — first species-separating anatomy pass (2026-11-10)

- **11/112 species (9.8%)** have at least two new source-linked diagnostic checks; **24** checks in all. This is **initial checklist coverage**, not a count of fully validated species. Each note names the structure, what should be observable and the principal look-alike; its source is stored on the exact species record.
- Covered: little bluestem, King Ranch bluestem, silky bluestem, cane bluestem, silver bluestem, Kleberg bluestem; blue grama, hairy grama, tall grama, Texas grama, and red grama. Records live in `species-a.json`, `species-c1.json`, and `species-d1.json`.
- Corrected KR bluestem: previous **1–1.5 mm** awn wording disagreed with Flora of North America; true awns are reported **9–17 mm**, geniculate and twisted. Its visual selection now tolerates both clearly evident awns and awns obscured in a whole-head view; key's `none_obvious` option does not mean biologically awnless.
- Source-checked **hair-fringe ligules** for blue and hairy grama. Texas and red grama **remain unscored** in the broad 'three LONG awns' option even though their individual fertile lemmas are three-awned: that button uses an `Aristida` example and is not homologous in appearance to their short macrostructures.
- **New candidate-retention regression:** **14/14** comparison scenarios kept the expected species in the filtered results, including KR with visible and hidden awns, KR after cutting, six bluestem examples, and grama distinctions. Candidate retention does **not** prove that a single result is correctly identified.
- **Photo and specimen QA still pending:** photo-role accuracy for all **514** references remains an independent Phase 4 task; do not mark any species photo verified merely because a textual character is externally supported.
- Source notes: [Phase 3 pass 1 detailed report](TOP_DOWN_PHASE3_PASS1_BLUESTEMS_GRAMAS_2026-11-10.md); [FNA KR](https://openherbarium.org/portal/taxa/index.php?clid=29&taxauthid=1&taxon=237483); [FNA hairy grama](https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427); [Kew POWO/GrassBase](https://powo.science.kew.org/).
- **Pass 1 handoff (completed by Pass 2):** additional big bluestem, sideoats and windmillgrass look-alikes now have first-pass checklist coverage. Preserve all 112 as candidates when traits are unknown. No photos imported in either pass.

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
