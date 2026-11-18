# Kleingrass — complete Gould character check

> Historical standalone review. Its options and source decisions are integrated in the combined November18 release; current combined counts and verification are recorded in [COMBINED_GOULD_RELEASE.md](COMBINED_GOULD_RELEASE.md). Earlier standalone counts and deployment notes below describe the proposal at that time.

Scope: *Panicum coloratum* L., exact Gould (1975) account on printed pp.452–453, plus its distribution/flowering continuation in an owner photo with the page number not visible. Do not infer the continuation page number. The neighboring *P. virgatum* account, the *P. obtusum* Fig.241 caption and *P. coloratum* homonyms attributed to Walter/Cavanilles are separate. No copyrighted page images are republished.

Snapshot: main `d2ae1a893df4d347b2cbe1578ad59813416bebe0` plus this supplement. All nine main questions are covered: the four photographed question definitions contain 45 core choices; the five illustrated leaf/ligule tabs reuse audited advanced states. The full matrix covers **24 groups and 162 advanced choices**. See `kleingrass-full-option-audit.json` for each choice's actual filter outcome and source class.

## Full group review

| Group | Decision |
|---|---|
| Leaf blade shape | Existing H&L flat state preserved; Gould's elongate description alone does not prove cross-section. |
| Leaf width | Gould 2–6(–8) mm; narrow/medium supported, approximate 2-mm boundary preserved as possible. |
| Leaf tip | Not stated; no new tip inferred. |
| Blade edge | Not stated; no serration/edge color inferred. |
| Leaf midrib | Not stated; no pale/raised midrib inferred. |
| Veins/ribs/grooves | Not stated; remains unknown. |
| Blade surface/hairs | Hairless or hispid on one or both faces. Do not require every variant on one plant. |
| Leaf base/auricles | Not stated; no auricles or sheath compression inferred. |
| Ligule height | 0.5–2 mm INCLUDING fringe hairs; tiny/short supported. |
| Ligule edge/outline | Fringed membrane; ciliate state supported, not an anatomically hair-only ligule or unreported truncate outline. |
| Sheath opening | Existing H&L open state preserved; Gould does not describe opening here. |
| Sheath surface | Hairless or hispid with papilla-based hairs, separately from blade/node hairs. |
| Culm posture | Existing supplementary erect/decumbent states retained; height alone does not establish angle. |
| Surface runners | Gould silent; prior conditional rooted-surface-culm accounts preserved without a new stolon absence claim. |
| Underground stems | Gould explicitly says rhizomes not developed. H&L/older short-rhizome report preserved but rhizome routes held unresolved. |
| Crown/base | Often knotty bases; new precise state does not infer hardness or a rhizome. Older hard-crown evidence separately retained. |
| Other stem clues | No new branching/gland/succulence/prop-root claims. |
| Culm nodes | Hairless or minutely puberulent; no borrowed KR age-related glabration. |
| Florets/palea | Two florets; lower male floret with broad thin palea equaling upper floret's length. Sex/palea options are not numerical count exclusions. |
| Spikelets/flowering axes | Short-pedicelled spikelets on spreading freely rebranched panicle branches; not a sessile-plus-stalked pair. |
| Outer glumes | Hairless spikelets; first glume present, 1–1.5 mm, broad-based and abruptly acute; second glume/lower lemma about equal or second glume longer. Ambiguous tiny/missing lower-glume mapping held. |
| Lemma surface/apex | Upper lemma smooth, shiny, slightly beaked; not the lower thin palea. Older firmness evidence retained separately. |
| True lemma awns | Earlier genus-based awnless evidence retained; Gould's slight beak is not assigned to a proven awn or midvein mucro. |
| Floral hairs | Whole spikelet glabrous; do not infer external bristle, rachilla or callus anatomy from silence. |

## Corrections and preserved disagreements

The initial live rhizome + short-knotty-underground-stem route showed Kleingrass as one of three supported matches. That is too certain after the owner's preferred Gould source explicitly says rhizomes are not developed. The source data and older diagnostic text remain stored; the main rhizome state and advanced rhizome variants now remain **possible/unresolved**, award no held-trait ranking point and receive an explicit source-disagreement notice. A knotty crown no longer serves as proof of a rhizome. No hard deletion/exclusion of broader regional or overseas variety evidence is introduced.

The existing `lower_reduced` record came from the Diggs p.1293 Panicum key couplet specifically identifying P. coloratum using about a quarter-length first glume. Gould's exact account gives a present 1–1.5-mm first glume against 2.8–3.2-mm spikelets. New precise present/shorter and shape choices are supported; the ambiguous “tiny or missing” route remains held, without erasing its older citation.

Fourteen new choices and thirteen primary evidence groups are added in `gould-kleingrass-character-supplement.json`. Three exact-source diagnostic checks lead the Kleingrass detail panel. The source's node, sheath and blade hair variants remain alternatives. Its 0.5–2-mm ligule range includes hairs. Morphological facts omitted by Gould remain unknown or separately attributed to existing lower-priority sources.

Height mostly 60–135 cm, panicle mostly 8–25 cm, spikelet and first-glume measurements, cytological reports (several 2n=36; others 18/32/44), historical African origin/Texas forage distribution and mostly May–September flowering are retained as source context. County nativity, local specimen identity and the overseas reference-photo variety are not certified.

## Verification

- Exhaustive functional sweep: 45 core choices plus every one of 162 advanced choices across all 24 groups; no original scored profile lost.
- Exact book combination, hairless/hairy variants, both ligule size bands and shared width boundaries pass.
- Core rhizome, advanced short-knotty rhizome and ambiguous lower-glume routes remain possible but not documented matches; held traits do not boost ranking.
- Mixed new/older states in one group preserve the union of independently sourced states; new citations do not erase prior evidence.
- New male-floret/palea observations cannot accidentally trigger numeric floret-count exclusions.
- Virginia, Johnsongrass and KR regressions pass; original photos, credits, diagrams, source-history and neighboring switchgrass data are unchanged.
- Preview full book combination: **1 supported Kleingrass match, 28 unresolved**. Preview disputed rhizome combination: **2 other supported matches, 21 unresolved including Kleingrass**. All 169 are accounted for. Live deployment is verified separately after CI and merge.

## Direct Diggs cross-check

The owner-connected official monocot excerpt was read for the exact P. coloratum entry on printed p.1296 and its genus-key couplet on p.1293. The named entry corroborates the knotty tuft, source height, 0.5–2-mm fringed membrane including hairs, variable sheath/blade pubescence and historical forage/phenology account. It does not state rhizome presence or absence, so no absence is inferred from silence. The p.1293 key describes a reduced PRESENT first glume, not a missing one. Both sources remain preserved beside the precise Gould measurements and the UI mapping hold. No book pages or figures are rehosted.

