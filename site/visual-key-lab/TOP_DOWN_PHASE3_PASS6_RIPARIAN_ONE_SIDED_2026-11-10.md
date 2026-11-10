# Hays Botany — Grass Visual ID Key, Phase 3 Pass 6: Crabgrasses, Sprangletops, Cupgrass & Riparian Look-Alikes

**2026-11-10 · Active `Crking92/Hays-Botany-Poaceae` only.** The old hub is untouched. No photos imported, altered, replaced or re-licensed, no extra spreadsheets or websites created.

## Outcome and evidence level

- **8** species gained **24** source-linked anatomical prompts in the existing JSON files. Cumulative Phase 3: **61 of 112 species (54.46%)** have a first-pass species-specific anatomical checklist, comprising **162 checks**. **51** species still lack this initial checklist.
- All 24 checks point to the source taxon description and mark which specimen-level or photo evidence is still missing. Source-backed descriptions **do not** mean Hays specimens or macro photos have been certified.
- **21/21 new candidate-retention cases** passed against the full index, including tricky older cases; nine files still contain 112 unique species and 514 unchanged photo references. No false exclusions in these tested cases. A match is not a positive specimen ID.
- The user-facing key banner and species detail panels show the updated count, new anatomy, look-alikes, uncertainty, and click-through source evidence.

## Eight reviewed grasses and high-value comparisons

| Species | What to inspect on the SAME plant | Main look-alike / limitation |
|---|---|---|
| Southern crabgrass — *Digitaria ciliaris* | Usually 3–7 one-sided terminal fingers, **paired** spikelets along winged triangular rachis; tiny 0.3–0.4 mm lower glume and larger three-veined upper glume; lower sterile lemma about 7 veins; inner membranous ligule | Fall witchgrass has open branching panicle with mostly solitary spikelets; other Digitaria, especially *D. sanguinalis*, may need exact spikelet separation |
| Fall witchgrass — *Digitaria cognata* | Extremely airy branched **tumbling** head; **solitary, long-pedicelled** small fuzzy spikelets; tiny/absent lower glume; lower sheaths often very hairy, white **crinkled blade margin**, true membrane ligule | Crabgrass has close paired spikelets on several fingers. Variants of *D. cognata* may differ in lower-lemma vein number and growth form |
| Green sprangletop — *Disakisperma dubium* | Exserted panicles with often 2–15 somewhat flexing unilateral branches and 4–13-flowered **4–12 mm spikelets**; membrane ligule 0.5–1.5 mm with ciliate rim; **hidden cleistogamous inflorescences** within LOW leaf sheaths | Mucronate Dinebra has numerous straighter branches and tiny 1.8–2.5 mm spikelets, normally just 2–4 florets. Avoid treating ligule cilia as a pure hair-only type |
| Mucronate sprangletop — *Dinebra panicea* subsp. *mucronata* | Narrow, brushlike head with numerous slender, ascending branches; tiny 1.8–2.5 mm laterally compressed spikelets, **2–4(5) florets**, unequal glumes, minute two-toothed lemmas | Data comes from *D. panicea* species-level Kew treatment under older *Leptochloa panicea*. It does **not** certify the subspecies in a Hays voucher |
| Texas / silky cupgrass — *Eriochloa sericea* | True **hair-FRINGE** ligule (the previously unknown character is now sourced); fuzzy paired ~3.6–4.2 mm spikelets, 4–10 short erect one-sided racemes; little **cup-shaped lower spikelet ring**, derived from reduced lower glume fused with basal internode/callus | *Urochloa* and *Paspalum* also have one-sided heads, but don't have this same cupule structure; separate seedhead hairs from inner ligule |
| Barnyardgrass — *Echinochloa crus-galli* | True ligule **ABSENT**, even though collar region may have stray hairs; 2-flowered spikelets ~2.5–4 mm, sterile LOWER lemma may carry no awn or up to ~50 mm awn; hardened fertile UPPER lemma with minute transition line | *E. muricata* and related Echinochloa need microscope-level fertile-lemma features. Awnless appearance is not exclusion |
| Goosegrass — *Eleusine indica* | Compressed pale/whitish keeled fibrous-rooted annual base; typically 4–10(17) flat terminal fingers, occasionally one lower finger; **5–7 florets** inside an attached 4–7 mm spikelet; lower glume 1.1–2.3 mm one-veined and tiny erose membrane ligule | Crabgrass also has digitate head but **two-flowered** paired spikelets along winged branches. Whitish crown needs a live close-up |
| Rice cutgrass — *Leersia oryzoides* | Wetland **rhizomes**; very rough backwards-barbed blade margin; open 10–20 cm panicle or **cleistogamous flowers hidden in UPPER sheaths**; one-flowered flattened spikelets **with BOTH glumes absent**, coarse lemma/palea keel hairs | *Paspalum* may lack only a LOWER glume, while rice cutgrass lacks BOTH and has just one floret; *Disakisperma* hides selfing flowers in LOWER rather than UPPER sheaths |

### Source-based corrections and distinctions

1. *Eriochloa sericea* previously had blank ligule. **Kew GrassBase** and **Texas A&M** separately document **hair-fringe ligule**, so `traits.ligule = ["hairs"]` with citation and photo-pending evidence. Added a field rule that differentiates collar from the cup/callus under the spikelet.
2. *Digitaria ciliaris* can have low decumbent rooted stems or an upright-appearing loose tuft. Both `mat` and `tuft` broad habit choices now remain eligible; it is still an annual and should not gain an invented long rhizome.
3. *Disakisperma dubium* has an anatomically MEMBRANOUS ligule with a ciliate edge, and may flower covertly inside lower sheaths. It remains in both visual hairlike and membrane choices, as described in the prior first pass.
4. *Dinebra panicea* subsp. *mucronata*: the cited morphology is **species-level**, not subspecies-confirming. Do not turn a 2-mm spikelet or a narrow brush head into proof of subspecies identity without exact-name taxonomic/voucher crosswalk.
5. In *Echinochloa crus-galli*, true absence of ligule is positive anatomical evidence, whereas no ligule visible in a photograph is simply unknown. Lower STERILE lemma awns can be present or absent.
6. Hidden self-fertilizing flowers are **lower-sheath** in *Disakisperma dubium* and often **upper-sheath** in *Leersia oryzoides*. Teach the location along an attached culm rather than labeling a detached cluster.

### Requested photo-role targets for the existing separate photo-quality workflow

Inspect cleared and live gallery originals first; record only truly missing actionable roles in the **single** master Photo Needs Queue:

- Southern crabgrass and fall witchgrass: whole attached inflorescences showing paired digitate vs solitary long-pedicelled spikelets; same-scale lower/upper glumes; true ligules; actual rooted base.
- Green sprangletop: carefully opened lower leaf sheath revealing *hidden* spikelets; full flowering branch and a separately measured 4–13-flowered spikelet, plus ciliate membrane.
- Dinebra: one short 2–4-flowered spikelet with glumes and lemmas on mm scale, plus open panicle side profile. Keep subsp. `mucronata` photo identity provisional until specimen-level source.
- Texas cupgrass: true dense hair ligule (NOT culm hair), intact spikelet in ring-like **cupule**, and an empty ring after spikelet fall. Actual tufted rootbase and a dry/winter head if diagnostic.
- Barnyardgrass: clear opened inner collar showing genuine **absence** of a ligule, and same-plant awnless versus awned sterile lower lemmas; microscopic hardened upper fertile lemma, not just a general head.
- Goosegrass: **fresh** white compressed basal crown with attached fibrous roots; a spikelet with 5–7 florets and the erose membrane at the inner collar.
- Rice cutgrass: leaf edge with retrose teeth at close magnification; a one-flowered **glumeless** spikelet from both sides; concealed upper-sheath panicle and connected rhizome in wet habitat.
- Winter rule: photograph attached dry heads or green winter basals only where actually useful; do not make every seasonal stage mandatory and never downgrade rights.

**Rights/release caution:** Prior comprehensive photo QA reported **3 held image files in the public repository and 2 checksum mismatches**; neither category was touched or cleared here. No image bytes changed in Pass 6. Photo-role and exact-photo legal checks remain independent of morphology verification.

## External source links

- [UT Austin PRC — Digitaria ciliaris](https://w3.biosci.utexas.edu/prc/K12/pages/Digitaria%20ciliaris%20ciliaris.html) and [Kew GrassBase Digitaria ciliaris](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1038558-2/general-information)
- [Oklahoma State — Digitaria cognata](https://extension.okstate.edu/programs/plant-id/plant-profiles/fall-witchgrass) and [Texas A&M fall witchgrass](https://rangeplants.tamu.edu/plant/fall-witchgrass/)
- [Peterson et al., *Systematics of Disakisperma* (2014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3817421/)
- [Kew POWO — Dinebra panicea / old Leptochloa panicea](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60458620-2/general-information)
- [Kew Eriochloa sericea](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:402055-1/general-information) and [Texas A&M Texas cupgrass](https://rangeplants.tamu.edu/plant/texas-cupgrass/)
- [FNA Echinochloa crus-galli](https://openherbarium.org/portal/taxa/index.php?clid=140&taxauthid=1&tid=628984) and [FNA Eleusine indica](https://openherbarium.org/portal/taxa/index.php?clid=141&taxauthid=1&tid=239829)
- [FNA Leersia oryzoides](https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Leersia+oryzoides)

**Nativity remains separate:** BONAP NAPA county evidence—not Kew's broad native range or morphology—determines whether the record is native to Hays County or the relevant adjacent western/northern counties. No planting-native classifications were changed.

## Next batch

Focus the next first-pass anatomy work on *Eragrostis* species (look-alike lovegrasses), *Panicum/Dichanthelium* (including winter rosettes and compressed sheath bases), and *Muhlenbergia* dropseed/airy-panicle look-alikes, preserving distinct seasonal phases. Do not conflate this with final field/photo validation.
