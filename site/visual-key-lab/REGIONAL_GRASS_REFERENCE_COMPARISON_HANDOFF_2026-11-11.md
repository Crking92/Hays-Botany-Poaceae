# Hays Grass ID Lab — regional references comparison & cross-chat handoff

**Prepared:** 2026-11-11  
**Purpose:** Durable research handoff from comparison of Hagenbuch & Lemke (2015) with Diggs, Lipscomb & O'Kennon (1999) for Hays County grass ID. This is **research**, not a species-character import, scored-key release, photo approval or claim of line-by-line certification.  
**Owner direction:** Future batch work should use the primary source by **character role**: H&L first for vegetative; Flora first for reproductive; GrassBase/PolyClave third for supplementary morphological measurements; FNA/local vouchers for range or uncertainty; POWO taxonomy separate from morphology; BONAP NAPA/county nativity separate/later.  
**Governing rules:** [MORPHOLOGY_SOURCE_POLICY.md](MORPHOLOGY_SOURCE_POLICY.md) | [PRIMARY_MORPHOLOGY_REFERENCE.md](PRIMARY_MORPHOLOGY_REFERENCE.md) | [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md).

## Exactly which documents

- **H&L (2015)**: Karl W. Hagenbuch & David E. Lemke, *Grasses of the Texas Hill Country: Vegetative Key and Descriptions*, *Phytoneuron* 2015-4:1–93, covering **160 species in 66 genera**; Hill Country geography includes Hays County. [Official publisher PDF](https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf). The project's Google Drive Reference Floras folder has a verified **PDF link record**, not raw PDF bytes.
- **Flora (1999)**: Diggs, Lipscomb & O'Kennon, *Shinners & Mahler's Illustrated Flora of North Central Texas*, user's 275/276-page PDF monocot excerpt (viewer pagination may differ). [Private Google Drive PDF](https://drive.google.com/file/d/1AhogqmJRi_bvr7Q2fdgnvuh0u9evQiwU/view?usp=drivesdk), also saved in ChatGPT Library at `/Hays Botany ID/References/Flora of North Central Texas-monocots-Acor-Zanni.pdf`; Poaceae approximately PDF page 146 onward, printed p. 1222 onward. Never commit its complete text/images or distribute scan pages in public repos.
- **Drive source-rule record:** [Hays Grass ID Lab — Authoritative Source Roles](https://docs.google.com/document/d/1QaESPjGVr6vAo78GAVwt5JS8ZGPtlPzR3HHrsxfnPow/edit).

## Scope and audit confidence

- The earlier comparison reported **126 exact binomial strings** found in the Flora excerpt among the H&L paper's **160** listed species and **34 without exact string matches**. **PRELIMINARY STRING OVERLAP ONLY**: this count has not been synonym-normalized or re-audited against all Flora species treatments. Text mentions can inflate matches; lack of a literal binomial does not prove a taxon is absent. Do **not** install 34 species, report 126 verified equivalent concepts, or use those counts to alter the Hays teaching list.
- Several species descriptions were **targeted spot checks**, not a full character-by-character comparison across 160 taxa. The findings below are literature-reconciliation tasks with preliminary page pointers. Distinguish a directly re-read passage, an earlier research note, and a botanically verified key state. Re-open the original source and record exact printed/PDF pages before moving a character to `VERIFIED`.
- Snapshot from the current canonical tracker on 2026-11-11: **112 live indexed key species**, **315** source-linked first-pass anatomical checks, **514/514** hosted photo references first-pass inspected, **zero** fully photo/dissection-certified species; **57 proposed expansion species and 322 literature-character targets** must remain research-only pending their separate gates. Read the latest tracker before using progress numbers; no data files or live UI were changed by this comparison.

## Shared/compatible traits (validation leads, NOT automatic approvals)

| Species/complex | Literature convergence reported | Why this helps the Lab | Remaining verification |
|---|---|---|---|
| *Cynodon dactylon* (bermudagrass) | Perennial; stolons/rhizomes; very short ciliate ligule | Vegetative spreading/ligule + Flora flowering spikes | Directly check exact membrane vs hair character and measurement |
| *Sorghum halepense* (Johnsongrass) | Strong rhizomes; membranous hairy-edged ligule; striking blade midrib | Use leaf/base ID in absence of flowering, then flowering key | Check measurement/variation, especially collar photos |
| *Sorghastrum nutans* (Indiangrass) | Short scaly rhizomes, stiff prominent membranous ligule | Highly useful characteristic of fresh field material | Check shape/size, auricles and taxon-specific wording |
| *Eragrostis spectabilis* (purple lovegrass) | Perennial, knotty/rhizomatous base | Basal growth complements open reproductive panicle | Distinguish short rootstock from creeping rhizomes |
| *Setaria parviflora* (knotroot bristlegrass; historical combinations possible) | Perennial, short knotty rhizomes | Distinguish vegetative habit, use floral bristle/spikelet characters later | Name/concept crosswalk and separate bristles from true lemma awns |
| *Bouteloua curtipendula* (sideoats grama) | Perennial; variable rhizomatous vs bunch-like forms | Avoid excluding species on rigid rhizome absence | Verify variety/subspecies and seasonal states |
| *Arundo donax* and *Phragmites australis* (giant/common reed) | Tall rhizomatous perennial reeds | Vegetative separation + reproductive check | Source-specific reed characters, no native/introduced Phragmites lineage certification |

## Possible source disagreements / apparent differences to adjudicate

| Priority | Taxon | Hill Country H&L 2015 (page lead) | Diggs Flora 1999 (page lead) | Working interpretation / recommended key treatment | Status |
|---|---|---|---|---|---|
| High | *Cenchrus spinifex* (common sandbur) | Described as **annual** (p. ~41) | Described as **perennial**, flowering in first year (printed p. ~1254) | Potential facultative/short-lived perennial variation. **Do not make annual/perennial a hard exclusion**; verify exact descriptions, accepted name/taxon concept and current species treatments | **OPEN — real text contrast, life-history resolution provisional** |
| High | *Bothriochloa ischaemum* / var. *songarica* (KR bluestem) | Rhizomes and stolons absent under vegetative account (p. ~37) | Variety account notes **rhizomatous/stoloniferous with mowing or grazing** (printed p. ~1246) | Likely management-/concept-dependent; distinguish variety, disturbed habit and true runners. Never disqualify KR based on a single “stolons absent” choice | **OPEN — conditional trait** |
| Medium | *Bouteloua dactyloides* / *Buchloe dactyloides* (buffalograss) | Ligule ~0.5 mm **fringe of hairs** (p. ~40) | Ligule ~0.5 mm **ciliate membrane** (printed p. ~1253, PDF ~177) | May reflect a very short ciliate membranous base versus apparent hairs. Inspect actual collar at scale. **Do not force exclusive categorical states before review** | **OPEN — terminology/microstructure** |
| High | *Panicum virgatum* (switchgrass) | Fringe with some longer 3–5 mm hairs; nodes glabrous **or pubescent** (p. ~57) | Fringed membrane ~1.5–3 mm; nodes **glabrous** (printed p. ~1302, PDF ~226) | Distinguish membrane length from longest hairs; check source measurements, nodes/regions/variants. Preserve node-hair variability until reconciled | **OPEN — measurement + node-pubescence** |
| Medium | *Schizachyrium scoparium* (little bluestem) | Rhizomes absent **or sometimes short** (p. ~60) | **Non-rhizomatous** (printed p. ~1316, PDF ~240) | Likely scope/degree rather than a categorical taxon conflict. Describe predominantly tufted/non-spreading; not an absolute “all short rhizomes impossible” rule | **OPEN — small scope difference** |
| High | *Chloris* windmillgrass complex (*C. andropogonoides*, *C. cucullata*, *C. verticillata*, *C. ×subdolichostachya*) | Discusses hybrid/intermediate forms (p. ~41–42) | Treats *C. subdolichostachya* as a named taxon (printed p. ~1256) | Add explicit **intermediate/hybrid or unresolved** possibility; do not force a parent species from one leaf or head trait. Verify current hybrid concept in POWO | **OPEN — taxonomic/hybrid concept** |
| High | *Eragrostis secundiflora* vs *E. trichodes* (red/sand lovegrass) | H&L reports no **reliable vegetative separation** (p. ~49) | Distinguishes by characters in broader reproductive species descriptions (printed pp. ~1272–1274) | A vegetative specimen should retain **both** candidates until a reliable flowering/seed character appears | **ACTIONABLE LIMITATION — reread exact H&L statement before release** |

**Key implementation guidance:** Conflicting literature descriptions are not automatically biological contradictions. Check taxon concepts, subspecies, habitat, sex, growth stage, measurement definition, regional phenotype and disturbance (mowing/grazing). Record *both* sources, original names, actual character text paraphrases, page numbers and any photo/voucher proof. Use `UNKNOWN`, multiple allowed states or “needs flower/seed” for unresolved cases; never replace a conflicting state with a manufactured single value.

## Taxonomic and source-coverage notes

| Issue | Reported finding | Next step |
|---|---|---|
| Vine-mesquite | Flora uses *Panicum obtusum*, while H&L/current taxonomy uses *Hopia obtusa* | Crosswalk the two concepts before considering “unmatched” species |
| Buffalograss | Historical *Buchloe/Buchloë dactyloides* vs currently accepted *Bouteloua dactyloides* | Treat as one taxon for comparisons but preserve source names |
| Hybrid windmillgrass | H&L intermediates versus Flora's *Chloris subdolichostachya* and present *C. ×subdolichostachya* treatment | Verify parentage/accepted name before encoding hybrid results |
| Blue grama | *Bouteloua gracilis* present in Flora; reportedly not in H&L 160-species appendix | Verify absence against appendix; use Flora, FNA, GrassBase and voucher where H&L lacks species |
| Common reed lineage | Neither general regional guide establishes the North American native vs introduced lineage of *Phragmites australis* | Maintain separately qualified lineage diagnostics based on the project's specialist *Phragmites* field guide |

## Review order for other chats / workers

1. **Read** AGENTS.md, [MORPHOLOGY_SOURCE_POLICY.md](MORPHOLOGY_SOURCE_POLICY.md), this handoff, and latest [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md); verify active branch and one-writer claims before edits.
2. **Resolve taxonomy first** for every proposed row: current display name, Flora name, H&L name, variety/subspecies and hybrids.
3. **Work the seven flagged conflicts first**, most actionable for false species exclusions: sandbur life cycle, KR bluestem rhizomes, switchgrass ligule/node hairs, buffalograss ligule, little bluestem rhizomes, windmillgrass hybrids, lovegrass vegetative inseparability. For each, open original H&L page and original Flora printed/PDF page; record quotations only in bounded internal notes, and use concise original paraphrases for the public site.
4. **Cross-check character type**: H&L first for vegetative states, Flora first for reproductive states. Use GrassBase/PolyClave for missing ranges, FNA for missing taxa/broader variation, local photographic/voucher material for direct proof. When sources disagree, record parallel notes and keep candidate filtering permissive.
5. **Retest before release**: Compare look-alikes and expected candidate retention, especially winter/nonflowering states and male/female grasses. Only update verified characters in the **assigned branch**, with current SHA and claim checks; leave photo rights, published galleries and 112-species baseline intact unless separately reviewed.
6. **Avoid duplicate work**: Record evidence/review progress in the existing [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md) or existing diagnostic data schema when a worker has exclusive ownership. **Do not create another master spreadsheet or automatically score the 57 draft grass taxa.** This file is a one-time cross-chat **research handoff and discrepancy queue**, not a second progress ledger.

**No changes to morphological JSONs, photos, credits or public website were made as part of creating this reference comparison.**
