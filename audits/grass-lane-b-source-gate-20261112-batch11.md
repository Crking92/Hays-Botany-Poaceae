# Hays Grass ID Lab — Lane B Batch 11: source-based closure audit

Date: 2026-11-12  
Owner: Scoring Lane B, Issue #70  
Scope: `species-c2.json` and `species-c3.json` only; 24 existing scored species.  
**This file records source-supported broad scoring decisions, not specimen-level ID or image publication rights.**

## Result

All 8 species lacking an earlier distinct Lane B scoring correction now have an explicit first-pass source decision. **One** needs a new, legitimate scored head state (*Heteropogon contortus*). **Seven** do not justify another unconditional scoring state from the evidence checked here; they remain in the 112-species scored inventory with earlier valid character choices preserved. This is **completion of a source/character audit**, not resolution of every specimen, image, synonym or local-occurrence question.

Status categories:
- `SCORE_CHANGE` = a new broad field answer was previously falsely excluding a species and is newly supported.
- `UNCHANGED_SOURCE_SUPPORTED` = no additional key option justified; maintain existing scored choices.
- `UNCHANGED_WITH_HOLD` = source supports existing choices but an observation, regional identity or UI-wording conflict remains; retain, don't invent.
- In every case, exact photo identity, local voucher, photographer, license and diagnostic macro coverage remain independently gated.

| Species | Decision | Existing key states reviewed | Evidence and exact unresolved blockers |
|---|---|---|---|
| **Heteropogon contortus** (tanglehead; c2) | **SCORE_CHANGE** | Head `spike`, `tangled_awns` → additionally `one_sided`; tuft; membrane/hair-fringe ligule; long awns unchanged | Kew GrassBase describes **one single erect UNILATERAL raceme**, and a U.S. government grass guide explicitly says one-sided solitary seedhead. Hill Country H&L (2015) p. **51**, checked original PDF screenshot, documents the true **membranous ~1 mm ligule with ciliate margins**, tufted base, absent rhizomes/stolons. Generic one-sided head option is valid before or during awn tangling, but paired spikelets and sharp bearded callus are essential. Hays linked raceme/collar/awns photo pair not verified; no published Diggs species account exists in the 1999 north-central volume, so do not invent one. |
| **Dichanthelium commutatum** (variable panicgrass; c2) | **UNCHANGED_WITH_HOLD** | Head airy, tuft; ligule hair-like / tiny membrane / *absent-looking*, awns not obvious | FNA says spring open panicles and later reduced/selfing secondary panicles; extremely short ciliate membrane may register as hairs or not visible. `absent` here is **visual absence only**, never botanical assertion of zero ligule tissue. Diggs (1999) under **Panicum divergens** [*D. commutatum*] reports occurrence in north-central TX from **Lamar County / Red River** and mainly farther east; independently verify a Hays voucher/observation before presenting **local occurrence** as established. Requires fresh inner collar and same-plant spring/fall photos. |
| **Dichanthelium oligosanthes** (few-flowered panicgrass; c2) | **UNCHANGED_SOURCE_SUPPORTED**, photo hold | Head airy for spring flowering, tuft; ligule **hairs only**; awns not conspicuous | H&L (2015) p. **47** specifically states fringe-of-hairs ligule and no rhizomes/stolons; Diggs (1999) under *Panicum oligosanthes* describes regional varieties, long hair ligule and spring/late flowering. No membrane state added. The distinctive November–February basal **winter rosette** is not currently a scored head type; users should leave head unanswered when absent, rather than being forced to call a vegetative rosette 'airy.' Winter root-to-shoot picture and authenticated spring/fall macro still needed. |
| **Eragrostis trichodes** (sand lovegrass; c2) | **UNCHANGED_SOURCE_SUPPORTED**, reproductive hold | Airy open head, tuft, hair ligule, no conspicuous awns | H&L (2015) pp. **49–50** describes a short hair-fringe ligule, no rhizomes/stolons, and explicitly says there are **no reliable vegetative characters separating this species from *E. secundiflora***. Diggs (1999) reproductive key describes more openly spreading panicle branches, bareness near branch bases and lemma measures; Kew GrassBase confirms 35–55 × 7–30 cm open, effuse head. **Do not** invent a species-only vegetative shortcut; same-plant mature spikelets and comparative *E. secundiflora* photos remain necessary. |
| **Hordeum pusillum** (little barley; c2) | **UNCHANGED_SOURCE_SUPPORTED**, photo hold | True spike, annual tuft, membranous ligule, conspicuous lemma awns | H&L (2015) p. **52**: tiny (<0.5 mm) **membranous** ligule, absence of rhizomes, annual tuft. Diggs (1999) pp. **1279–1280**: flattened spike, scabrous non-ciliate glumes and lemma awns 2–10(–15) mm. It's not `foxtail` bristles or `many_one_sided` lateral branches. Need close-up of intact three-spikelet node to separate introduced hare barley and rye analogs. |
| **Muhlenbergia lindheimeri** (Lindheimer muhly; c3) | **UNCHANGED_WITH_HOLD** | Long narrow and less-typical airy aging head, tuft, long membrane, no or occasionally visible awn | H&L (2015) p. **54**: long 8–15 mm membrane, densely tufted, no rhizomes. Diggs (1999) pp. **1286–1288** and Kew GrassBase: dense narrow contracted panicles, small spikelets; UT Austin Williamson County specimen description says older heads can spread/open and become feathery. Keep both broad **stage-dependent** visual states pending attached early/late correctly ID'd photographs. Kew gives mainly ~1–1.5-cm width while UT describes much wider mature panicles: don't use age/width to diagnose hybrid by itself. |
| **Poa annua** (annual bluegrass; c3) | **UNCHANGED_WITH_HOLD** | Short compact *or* somewhat open head; tuft, membranous ligule, unawned | H&L (2015) p. **59**: annual, tuft, no rhizome, 1.5–4 mm membranous ligule and prow-shaped tips. Diggs (1999) p. **1313** says usual **small compact erect panicle**; FNA allows variation in short primary flowering heads. Existing `airy` broad option needs an actual open-head photographed example **against the UI's precise 'cloud of tiny spikelets' wording** before claiming it as a reliable standalone appearance. Do not remove until coordinator and photo QA check actual stages and no exclusion of legitimate open plants. |
| **Sorghum bicolor** (cultivated sorghum and weedy complex; c3) | **UNCHANGED_WITH_HOLD** | Open/airy vs compact head, non-rhizomatous tillered tuft, membrane, unawned/long awns | Diggs (1999) p. **1323** explicitly keys **compact unawned subsp. bicolor** against **open awned subsp. drummondii**. FNA and Kew confirm open to contracted panicles and sessile spikelets **3–9 mm** (not especially tiny). Therefore the broad `airy` choice is understandable for open types, but the UI text 'open cloud of **tiny** spikelets' is an imperfect match. **Coordinator UI wording review required before removing the only open-head option.** H&L p. **63** calls some plants solitary annuals while FNA permits tillering; the UI does not currently offer a 'solitary annual' choice. This is an introduced/cultivated/weedy complex, not automatic Hays native restoration species; local and cultivated identity separately held. |

## New Batch 11 scoring guard

- Positive: retain *Heteropogon contortus* for `head:one_sided` with actual `habit:tuft`, either visible short ciliate-membrane ligule category and `awns:long`; also retain original `head:spike` and `head:tangled_awns` paths.
- Negative: do not include this taxon when `awns:none_obvious`, `awns:bristles`, `habit:rhizome`, `head:fingers` or `head:many_one_sided` are asserted with enough visible evidence.
- No other species scoring records change in Batch 11; unknown/missing trait states must remain eligible.

## Pending actions, not a new scoring mandate

1. Hays *Dichanthelium commutatum* local voucher/occurrence determination and sex/stage-linked macro.
2. Mature leaf+panicle+measured spikelets for *E. trichodes* vs *E. secundiflora*; winter rosette/seasonal photos for *D. oligosanthes*; attached three-spikelet node for *H. pusillum*.
3. Early/mature head pair of correctly identified *M. lindheimeri*; open *Poa annua* head; sorghum open-panicle screenshot for **coordinator-only** review of the `airy` choice wording.
4. Continue field tests after new Batch 11 scoring PR merges, including actual Pages rendering, separate specimen verification and photo-license audit.

## Key sources

- Hagenbuch & Lemke (2015), vegetative reference: https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf
- Diggs, Lipscomb & O'Kennon (1999), reproductive Flora, supplied volume: https://drive.google.com/file/d/1AhogqmJRi_bvr7Q2fdgnvuh0u9evQiwU/view
- Kew GrassBase *Heteropogon contortus*: https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:404772-1/general-information
- US federal tanglehead description (single one-sided raceme): https://www.govinfo.gov/content/pkg/GOVPUB-A-PURL-gpo24344/pdf/GOVPUB-A-PURL-gpo24344.pdf
- Texas A&M tanglehead: https://rangeplants.tamu.edu/plant/tanglehead/
- Kew GrassBase *Eragrostis trichodes*: https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:401659-1/general-information
- Kew GrassBase *Muhlenbergia lindheimeri*: https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:164816-2/general-information
- UT Austin *M. lindheimeri* specimen: https://w3.biosci.utexas.edu/prc/K12/pdf/Muhlenbergia%20lindheimeri
- FNA *Sorghum bicolor*: https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=237504

**No publication, photo identity, local nativity or specimen-grade acceptance is implied by an unchanged score or by this audit.**
