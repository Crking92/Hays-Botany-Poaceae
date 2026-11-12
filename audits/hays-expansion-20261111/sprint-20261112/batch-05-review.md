# Hays Grass ID Lab — Final provisional first-pass audit (Batch 5)

**Completed:** 2026-11-12  
**Lane:** Chat 5, dedicated source/specimen admission evidence  
**Issue:** [#70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70)  
**Branch:** `codex/grass-sprint-provisional-batch5`  
**Intended PR:** new append-only evidence review, coordinator-controlled merge; do **not** score-admit candidates from this report

## Accurate sprint scoreboard

| Measure | Value |
|---|---:|
| Configured Learner grass profiles | **169** |
| Existing scored grass key | **112** |
| Research-only Hays provisional profiles | **57** |
| Literature character targets previously prepared | 322 |
| Candidate first-pass audit sizes (Batches 1–5) | 8 + 10 + 12 + 14 + **13** |
| **Unique provisional candidates first-pass audited** | **57/57** |
| Remaining **first-pass source reviews** | **0** |
| Individual Hays specimen-ID admission gates genuinely cleared | **0/57** |
| Candidates newly added to scored key | **0** |
| Original local Hays specimen photo pixels **newly** viewed in this sprint | **0** |
| Current expansion general reference media configured in Learner | **54 refs across 32/57 species** |
| Provisional taxa with no configured general-photo reference | **25/57** |
| Current public Pages image pixels individually tested for this audit | **None** |

**Do not reinterpret “57/57 first-pass audited” as “57/57 plants identified.”** We checked botanical names, historic Hays observation pointers, earlier picture-QA notes, supporting literature, rights preflight and exact missing diagnostic proof. Original Hays iNaturalist source pixels were inaccessible for fresh examination, so every provisional species still needs specimen-level identification signoff (and any applicable photo rights, score tests and site display verification).

## All 13 Batch 5 admission decisions

| Candidate | Current status | Key missing specimen evidence / discrepancy |
|---|---|---|
| *Alopecurus carolinianus* | **HOLD** | No permitted original Hays image; isolated 1-flowered spikelet, silky glumes, dorsal bent awn and 3.5–7-mm membranous ligule. |
| *Briza minor* | **HOLD** | Three prior photos show triangular hanging heads; floret count and 5–10-mm membranous ligule unmeasured. |
| *Cenchrus setaceus* | **HOLD** | Zero local image pixels; ornamental ‘Rubrum’ could be different hybrid *Cenchrus × cupreus*. |
| *Digitaria californica* | **HOLD** | Zero source pixels; measure Digitaria spikelet 2–4-mm white hairs and hard crown against congeners. |
| *Elymus macgregorii* | **HOLD** | CRITICAL: packet wrongly assigned *E. glabriflorus* node/auricle states to *E. macgregorii*; Texas transitions require expert voucher. |
| *Lolium × boucheanum* | **HOLD** | CRITICAL: Kew boucheanum = perenne × rigidum; Kew hybridum = multiflorum × perenne; hybrid ID not diagnosable by one phone photo. |
| *Miscanthus sinensis* | **HOLD** | Single landscaped vegetative clump; need unequal-pedicel spikelets, glume hairs and planting history. |
| *Panicum dichotomiflorum* | **HOLD** | Zero source pixels; measure lower-glume fraction, ciliate membrane and flowering panicle. |
| *Panicum repens* | **HOLD** | Torpedograss-like lawn mat is inconclusive; uncover the connected sharp-tipped scaly rhizome. |
| *Pappophorum bicolor* | **HOLD** | Count 11–15 awns per lemma BUT *P. mucronulatum* also has 11–15; measure 3–4-mm vs 2–3-mm lemma bodies and other traits. |
| *Sclerochloa dura* | **HOLD** | Tiny one-sided head not diagnostic; need stout 3–4-flowered spikelets and membranous ligule. |
| *Sporobolus cryptandrus* | **HOLD** | Zero source pixels; photograph white sheath-mouth hairs and both enclosed and emerged panicle phases. |
| *Stapfochloa canterae* | **HOLD** | Prior four images have ruler/ligule/spikelets; verify actual florets/awns against native *S. ciliata* and local plant provenance. |

The companion `batch-05-evidence.json` contains observation URLs, historical photo counts, original rights preflight, paired-plant comparison targets, photo-specific and voucher-specific proof requirements, and accepted-name source URLs for **all thirteen**, none falsely authorized for scoring or photo publication.

## Critical source corrections — coordinator action required

### 1. Elymus macgregorii incorrectly inherits Elymus glabriflorus morphology

The saved [diagnostic packet 6](../hays-8-flora-diagnostic-packet-6-20261111.json) states **15–30 spike nodes with 3–5-mm internodes and 0–2-mm auricles** for *Elymus macgregorii*. These are **Elymus glabriflorus** traits, not those of *E. macgregorii* in the [Native Plant Trust Go Botany key](https://gobotany.nativeplanttrust.org/dkey/elymus/) (2026) and [Arthur Haines, Botanical Notes 3](https://static1.squarespace.com/static/5369617de4b054aef368005b/t/53d9d29ee4b047a1cbd79135/1406784158788/Botanical_Notes_number_3.pdf), **p.5** (direct PDF page screenshot visually checked).

The latter two sources give **9–18 nodes, 4–7-mm internodes, 2–3-mm auricles** for *macgregorii*. Haines also warns that material from **Texas, Oklahoma, Arkansas and Missouri can be transitional to E. virginicus var. jejunus**. Do **not** use the misattributed packet character values in the scored key or in future new-species diagnosis without source correction and a Hays voucher determination.

**Related disputed alias:** [Kew POWO](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:90247-2) folds *Elymus glabriflorus* into *E. virginicus*, but [ITIS](https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=512821) treats *glabriflorus* as an accepted species. The earlier original-58-to-57-taxa collapse followed Kew. **This is a reference-policy choice, not a unanimously accepted taxonomic identity.** Do not silently turn 169 into 170 or change the synonym crosswalk without Chat 1 resolving taxonomy; keep both concepts and photos distinct until verification.

### 2. Lolium hybrid formula collision

[Kew *Lolium × boucheanum*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:407425-1) specifies **L. perenne × L. rigidum**. [Kew *L. × hybridum*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:407468-1) specifies **L. multiflorum × L. perenne**. Agronomic and alternate treatment names have used boucheanum for the latter, but a general ryegrass photograph does not resolve the parentage. This existing Hays provisional hybrid remains **not score-admittable** without explicit taxon-concept selection and expert genetic/voucher evidence. Overlapping awn, auricle and glume traits are not exclusive endpoints.

### 3. Ornamental purple fountain grass: true setaceus vs horticultural hybrid

[Kew *Cenchrus setaceus*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77106046-1) is an accepted North African/Asian **Texas introduction**. [Kew *Cenchrus × cupreus*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77176991-1) and [EPPO](https://gd.eppo.int/taxon/PESAD) identify a different garden hybrid (from *C. elegans × C. setaceus*) traded historically as *Pennisetum setaceum* 'Rubrum' and *P. × advena*. A burgundy planted clump in Kyle cannot certify the non-hybrid *C. setaceus*. Keep garden-trade and wild-escape records separate; existing one Hays record has zero previously viewed source pixels.

### 4. Pappophorum bicolor is not identified by counting 11–15 awns alone

[Kew GrassBase *P. bicolor*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:413618-1/general-information) and [Kew GrassBase *P. mucronulatum*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:413653-1/general-information) both report **11–15 awns from each mature lemma**. Packet 5's count is a useful genus-level structure but not a species-exclusive difference. Compare **~3–4 mm** fertile lemma body for *bicolor* versus **~2–3 mm** for *mucronulatum* (ranges touch), plus all other available glume, floret and head differences. Pinkish flowerhead and native-Texas flag alone cannot verify the single Hays specimen.

### 5. Stapfochloa canterae vs Stapfochloa ciliata is the next highest-value photo reinspection

[Kew *Stapfochloa canterae*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60469004-2) is accepted and **introduced to Texas**, while [*S. ciliata*](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60469005-2) is native to Texas (state level). The historic Hays *canterae* observation **137935400** reportedly already includes measured spikelets, scale, node and inner collar among four reviewed images. Prior photo notes are not sufficient to verify exact fertile/sterile floret differences and current license, but **re-accessing this one source is likely higher yield than finding more general habit pictures.** Protect *S. ciliata* from being mistaken for the exotic.

### 6. Field character traps in the remaining seven

- *Digitaria californica*: a modern accepted Texas-native species, but Hays source photo access zero. Show **glume and sterile lemma long hairs**, maturity and rooted hard crown before differentiating local crabgrasses.
- *Sporobolus cryptandrus*: check the distinctive **white sheath-mouth hair tufts** and compare **panicle partly enclosed vs opened in different seasons**; do not treat one seasonal state as exclusive. Kew also recognizes *S. giganteus* and *S. flexuosus* separately, so historical variety accounts cannot be pasted wholesale.
- *Alopecurus carolinianus*: unknown original specimen; inspect **1-flowered spikelet, silky paired glumes, dorsal bent lemma awn, prominent membrane** rather than the foxtail-like head.
- *Panicum dichotomiflorum*: unknown original specimen; isolate the lower glume and compare *P. repens*, Urochloa and annual Panicum with same-plant collar.
- *Panicum repens*: a planted/wild invasive question, locally unconfirmed; a dense green mat alone does not demonstrate **connected torpedo-pointed scaly rhizomes**.
- *Briza minor*: three historical photos suggest characteristic little triangular hanging spikelets but lack **floret counts and scale**; Texas introduced per Kew.
- *Sclerochloa dura*: low one-sided heads resemble diminutive Poa/Catapodium; demonstrate **stout glumes, 3–4 florets and 1–2-mm membranous ligule** on one Hays plant.

## What must happen after first-pass literature audit is complete

**The next phase is targeted original Hays specimen/image access and local identity signoff, not another broad literature-writing cycle.** Use the existing master Photo Needs Queue and the established family repository, without a new spreadsheet. Keep diagnosis and image rights separately gated. The priority source-photograph targets are:

1. **Reinspect rich historic source first:** *Stapfochloa canterae* (observation 137935400; compare *S. ciliata*), *Pappophorum bicolor* (136755826), *Briza minor* (346027854), *Sclerochloa dura* (148348772), and other previously diagnosed but morphologically unresolved source sets. First verify actual image pixels and exact photo credit/license.
2. **Unblock zero-source-pixel cases:** *Alopecurus carolinianus* (5938511), *Cenchrus setaceus* (36111263), *Digitaria californica* (387716642), *Elymus macgregorii* (314369187), *Lolium × boucheanum* (45834760), *Panicum dichotomiflorum* (61315171), *Sporobolus cryptandrus* (192579863). If a source cannot be safely accessed, obtain a new legally reusable verified specimen photo. Do not infer evidence from search thumbnails.
3. **Expert taxonomy before image volume:** unresolved *Elymus* complex/alias, ryegrass hybrid name, ornamental *Cenchrus × cupreus*, and strongly conflicting original Hays observation identifications (e.g. *Bromus brevis*, *Cortaderia selloana*). Non-hybrid and cultivar names should not be silently substituted.
4. **Continue ordinary legally reusable general-photo installs through the gallery lane** without waiting for anatomy arrows; maintain exact image credit and taxonomy label, and verify **public-site pixels**. The configuration of 54 refs for 32 taxa is **not** a verified count of displayed images.

## Sources and validation boundaries

The 57 candidate evidence notes are additive and independently saved across `batch-01-evidence.json` through `batch-05-evidence.json`, with accompanying reviews. Original full-resolution sources, rights and previous gallery work remain untouched.

**Proof policy:** 57 first-pass literature/source screenings are complete; **0 of 57** Hays sample specimens has fresh specimen-photo identification signoff. Live Hays site photo display was **not** checked here. All 169 profiles remain configured; the 112 existing scored profiles remain the only admitted key species. All 322 literature targets remain targets, not specimen-confirmed character states.

**Preserve ownership:** Chat 1 coordinates merge/tests/release and repairs existing source files as assigned. Chat 5 creates only new audit files, does not edit `site/visual-key-lab/hays-candidates.json`, existing scoring shards, packets 3/7 owned elsewhere, image galleries, existing rights credits, or the legacy repository. Any future candidate admission needs separately verified Hays evidence, local occurrence status, non-contradictory morphology, and scored-key false-exclusion regression tests.
