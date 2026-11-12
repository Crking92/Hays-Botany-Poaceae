# Batch 8 — Hays grass herbarium voucher **original-source** verification
**Date:** 2026-11-12 · **Owner:** Chat 5 provisional specimen-verification lane · **Issue:** [#70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70)

**Scope:** Independently verify collector references in the **actual published 2015 Hill Country flora**, then identify the exact original sheet/barcode and specimen traits still needed. This is a **source-locality audit, not specimen signoff, photo publication, or scoring.**

## Measured progress

| Milestone | Completed | Actual meaning |
|---|---:|---|
| Provisional first-pass literature/identity audits | **57/57 (100%)** | Every candidate has taxonomic risks and morphological proof requirements |
| Recovered Hays source-photo **contact-sheet previews** freshly inspected | **317/317 (100%)** | Thumbnails, not full-resolution or expert-identified individual plants |
| Provisional candidate taxa with published Hays collection citations, now independently checked against the **original 2015 publication** | **7/7 (100%)** | Ten collector-number references in total; not necessarily current wild populations |
| Individual original herbarium sheets photographed/read in this batch | **0/10** | Barcode, specimen morphology, collector label and determinations still to recover |
| Provisional species with full locally verified morphological ID | **0/57 (0%)** | Scored-key admission not justified yet |
| Grass species admitted to scored key | **112/169 (66.3%)** | 57 remain provisional |
| Newly installed or site-visible general photos verified | **0** | Gallery owner retains publication/rights work |

### Seven fully source-checked references

| Candidate in 169-grass inventory | Hays publication citation | Original printed page | Source/identity meaning |
|---|---|---:|---|
| *Melica nitens* | Dingee **89** (SWT) | 85 | A physical collection is cited in a published paper; fresh sheet and modern Hays photographed plant still unconfirmed |
| *Rottboellia campestris* (printed *Coelorachis cylindrica*) | Carr **10681**; Sanders **4100** (TEX-LL) | 78 | Two independently listed Hays gatherings. Retain historical synonym; Kew and USDA/ITIS generic placements differ |
| *Stenotaphrum secundatum* | Litchfield **s.n.** (SWT) | 91 | Credible Hays collected plant, but likely planted turf; no self-sustaining or native-site assumption |
| *Triticum aestivum* | Ruiseco **128** (SWT) | 93 | Hays collection documents wheat's presence, NOT native status or a permanent wild population |
| *Echinochloa colona* | Breckenridge **441** (SWT) | 80 | Independent local specimen citation, not authentication of any new iNaturalist photo |
| *Setaria viridis* | Liang **50**; Osborn **35** (SWT) | 90 | Two named Hays collections; species morphology and local observations remain individually gated |
| *Setaria leucopila* | Breckenridge **490**; Tabler **s.n.** (SWT) | 89 | Two named Hays collections; still need small ciliate membrane/crown and spikelet checks on actual source specimens |

**Source:** [Hagenbuch & Lemke (2015), *Grasses of the Texas Hill Country*, Appendix B and species descriptions](https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf). Original PDF pages 78, 80, 85, 89–91 and 93 and relevant original vegetative description pages **42** and **54** were opened and visually verified with page screenshots, not inferred from the existing GitHub crosswalk.

**Reconciliation result:** **10 of 10** published Hays collection citations already saved in `hays-57-draft-id-cards.json` match the original publication's collector, number, herbarium and county. No mismatched citations or duplicate taxon entries were found.

### Source-backed diagnostic correction with immediate value

- *Melica nitens*: 2015 Hill Country vegetative description calls it a hard, **subrhizomatous** base while explicitly saying **true rhizomes and stolons absent**. The membrane ligule is approximately **3–6 mm**, extending down the sheath edges; the sheath is essentially closed. We must not describe this as a grass with obvious long rhizomes. A clump image alone cannot settle the basal character.
- Carolina jointtail: the same source, under *Coelorachis cylindrica*, does describe **short knotty rhizomes**, a narrow folded/flat blade with scabrous prominent midrib and a tiny approximately **0.5–1-mm membranous ciliate ligule**. The 1999 Flora's reproductive key points to a narrow jointed flowerhead and **sessile fertile spikelet recessed into a rachis niche with a pitted glume**, with reduced pedicelled partner. No retrieved Hays contact-sheet preview resolves all these structures; no scored admission.
- These two have different basal growth forms and both a ciliate **membranous** ligule, not a hair-only ligule. Keep age/wear and lack of visible rootstock as **unknown**, not a negative exclusion.
- *Setaria leucopila*: Hill Country vegetative description reports a perennial, **no rhizomes** and long hairs near the collar plus a tiny **ciliate-membrane ligule**. A choice 'hair ligule' versus 'membrane ligule' needs to preserve the membranous base. This is source evidence, not a scored change by Chat 5.

### Search outcome and blockers

I attempted to find a **direct individual specimen sheet** by exact collector/number for Carr 10681, Sanders 4100 and Dingee 89 through public indexed search and the TORCH portal. The [TORCH data portal](https://portal.torcherbaria.org/) supports herbarium-specific taxon, county and collector search, and [University of Texas Plant Resources Center](https://biodiversity.utexas.edu/collections/plants-collection/explore-plants-collection) confirms its TEX/LL collection is digitally searchable. **No exact barcode, record ID or high-resolution sheet image was recovered** in this run; portal search interfaces could not be queried successfully from this environment. This is an **access limitation, not evidence the cited sheets are nonexistent**. Some UT images are independently distributed as CC0 through iDigBio, but do not infer **these exact specimens** have CC0 media rights.

For the unnumbered *Stenotaphrum* and *Setaria leucopila* collections, exact collector/date/locality should first be resolved to prevent confusion with other `s.n.` sheets before interpreting images.

## Highest-return next specimen verification

Seek the published original sheets using search fields `scientificName`, `recordedBy`, `recordNumber`, `county=Hays`, and herbarium `SWT` (Texas State) or `TEX/LL` (UT). For *Melica nitens*, compare Dingee 89's actual ripe terminal spikelet and basal stem with the historical Hays contact-sheet set. For Carolina jointtail, compare Carr 10681 and Sanders 4100's pitted sessile glumes and joint morphology with the recovered Hays original source photo 684707043 **after exact current CC0/photo identification recheck** by the gallery owner. Do not download those source pictures or republish herbarium images under an assumed open license.

The source-crosswalk files remain preserved in historic GitHub branch `inat-coverage-audit-20261111`. Chat 1 may restore those original files selectively; this PR creates **only the two new original-source audit files** under our dedicated `sprint-20261112` folder. No scored species shards, `hays-candidates.json`, image manifests, credits, UI, legacy repo or other lanes' files were touched.

### Coordinator handoff

- Published Hays collection reference **verified 7/7 candidate taxa**, **10/10 source citations**.
- **None** of the seven has independently examined physical herbarium sheet features; no new admission.
- Priority `Melica nitens` and `Rottboellia campestris` for original sheet retrieval, then sample comparison to dated Hays image and regional reproductive treatment. Hays voucher documentation is stronger occurrence evidence than a lone iNaturalist label, but is not a replacement for current-source specimen identification.
- **No new public website pixel verification**; remain at **112 scored / 169 configured** with **57 research-only provisional species**.
