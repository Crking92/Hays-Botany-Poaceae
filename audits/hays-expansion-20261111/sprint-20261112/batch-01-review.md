# Provisional admission lane — batch 1 (2026-11-12)

**Purpose:** Nonpublishing, review-only evidence recommendations for the Chat 1 integration coordinator. Own branch `codex/grass-sprint-provisional`. Reference [Issue #70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70).

## Honest scorecard

| Measure | Result |
|---|---:|
| Existing scored / configured | **112 / 169** |
| Provisional candidates / literature targets | 57 / 322 |
| Candidate files reviewed in this batch | **8** |
| Newly inspected original Hays photo pixels | **0** (source pages inaccessible in this run) |
| Species with full identification-gate signoff this batch | **0** |
| New scored admissions authorized | **0** |
| Rights approvals / public deployments | **0 / 0** |

The source observations, historic photographs reviewed previously, local voucher citations, literature descriptions, candidate gallery illustrations, and verified *current Hays individual* are distinct. This batch checks evidence consistency; it **does not** relabel literature descriptions as specimen observations. Candidate photo/observation URL access returned no images for fresh examination; prior QA notes are explicitly marked historical.

## Eight priority determinations

| Candidate | Decision | Precise next proof / blocker |
|---|---|---|
| *Melica nitens* | **Hold** | From one Hays collected or documented plant: rooted basal crown, entire sheath-throat/ligule with millimeter scale, one mature dissected spikelet exposing 2–3 fertile florets and terminal sterile rudiments. Compare M. mutica. |
| *Rottboellia campestris* | **Hold** | Same Hays source plant: sharply focused 1-mm-scale rachis joint in which sessile spikelet sits in its niche, pitted outer glume, disarticulated joint and basal ligule. Compare other jointed Andropogoneae. |
| *Paspalum langei* | **Hold** | Revisit original Hays TEX00568499, TEX00568501 and TEX00485588 at 1-mm scale, resolve first glume on each paired spikelet, glume glandular spots and hairs; match a current Hays source plant. Check the possible planted 2019 yard specimen separately. |
| *Setaria viridis* | **Hold** | One mature Hays plant photographed from rooted annual base through collar to inflorescence, with separated spikelet, counted bristles and finely wrinkled fertile lemma at scale; compare S. pumila and S. parviflora. |
| *Echinochloa colona* | **Hold** | Same rooted Hays individual: leaf collar proving ligule absence plus multiple mature spikelets viewed dorsally and in profile at mm scale; document awn and sterile lemma surface, compare E. walteri and E. crus-galli. |
| *Tridentopsis elongata* | **Hold** | From single Hays plant: measure blade width, photograph one flattened illuminated upper glume to count 3–7 nerves and verify size, with other spikelets, lemma/callus traits and a 1-mm ruler; compare T. mutica and T. buckleyana. |
| *Sphenopholis interrupta* | **Hold** | One Hays flowering individual: 1–2 mm ligule, hispid sheath, mature spikelet showing upper glume shape, awn and floret details; matched comparison against S. obtusata, not head outline alone. |
| *Phyllostachys aurea* | **Hold** | Photograph measured lower culm internodes, nodal groove/flattening, unequal branches, sheath tip bristles from the same patch; obtain location/management or historical record proving planted, escaped or naturally reproducing. |

## Important reconciliations and errors discovered

1. **Melica nitens:** The staged packet calls this rhizomatous, but the vegetative primary source, Hagenbuch & Lemke (2015) **p.54**, explicitly says clumping with true rhizomes and stolons absent, albeit a hard subrhizomatous base. This must **not** be encoded as an unequivocal rhizome-present state. Compare 2–3 fertile florets, terminal sterile rudiments, ligule and crown before species signoff. Regional Hays voucher **Dingee 89 (SWT)** remains separate from live photo determinations.
2. **Sphenopholis interrupta:** The 2015 Hill Country vegetative treatment is findable under **Trisetum interruptum**, verified as a synonym by ITIS. Its p.67 account supplies annual tufted growth, hairy sheaths, and a short membranous ligule. Import it as **literature-only comparative evidence**, not proof that the Hays photos show the needed upper glume/spikelet structure.
3. **Rottboellia campestris:** POWO currently accepts this name and explicitly treats the regional Flora's *Coelorachis cylindrica* as synonym. Existing candidate `taxonomy_url` is the **old synonym landing page**; later update the candidate record to the accepted-name URL, retaining alias. Local Carr/Sanders vouchers and one CC0 image preflight are promising but the pitted glume/rachis niche remains unresolved.
4. **Paspalum langei:** POWO/GrassBase and staged regional flora describe a tufted perennial and typically 2–5 racemes, while Faccenda (2023, Bishop Museum Hawaiian account) describes annual and typically 1–3 branches. Keep both source statements and **do not use duration or branch count to reject specimens** until taxon-concept differences are reconciled; microscopic lower-glume and glume gland/hair characters still needed from TEX sheets and Hays observations.
5. **Tridentopsis elongata:** POWO accepts as separate species; Diggs 1999 treats *Tridens muticus* var. *elongatus*. Old broad *muticus* determinations cannot certify *elongata* without countable upper-glume nerves and blade/lemma detail. Reject misfuzzy `Trisetopsis` matching.
6. **Setaria viridis:** Count bristles by individual spikelet, not just color or fuzzy head. FNA supporting comparison with *S. pumila*, *S. parviflora* requires fertile lemma details and ligule/basal evidence.
7. **Echinochloa colona:** Purple transverse bands and ligule absence support the genus/context but do not independently exclude *E. walteri* or *E. crus-galli*; no source-scaled spikelet correspondence.
8. **Phyllostachys aurea:** Species ID needs lower culm/node anatomy; separately prove planted-colony versus escape/establishment. Do not make flowering mandatory.

## Evidence/provenance links

- [Hagenbuch & Lemke (2015), Grasses of the Texas Hill Country](https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf): **pp.54 and 67 directly inspected** in public source screenshots.
- **Diggs, Lipscomb & O'Kennon (1999)**: prepared source-linked packet 1, packet 2, packet 7 in this repository; their reproductive interpretations were reviewed as **existing source packets**, not independently reopened during this batch.
- [POWO — Rottboellia campestris accepted](https://powo.science.kew.org/taxon/419621-1), [historical Coelorachis cylindrica synonym](https://powo.science.kew.org/taxon/62724-2).
- [POWO — Tridentopsis elongata](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77313940-1), [ITIS — Trisetum interruptum mapping](https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=41305).
- [POWO/GrassBase — Paspalum langei](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A184424-2/general-information) vs. [Faccenda 2023, Bishop Museum Occasional Papers](https://hbs.bpbmwebdata.org/PUBS-ONLINE/pdf/op155p83-156.pdf); life-history discrepancy intentionally open.
- [FNA-derived Setaria viridis description](https://biorepo.neonscience.org/portal/taxa/index.php?clid=8679&taxauthid=1&tid=16726) and [comparative Setaria key](https://idtools.org/id/weed-tool/key/GrapeGrassKey/Media/Html/fact_sheets/Setaria.html).
- Original Hays observation URLs, saved historical photo-license metadata, Hays specimen-citation source and exact unproven characters are in `batch-01-evidence.json`.

## Coordinator handoff

**Recommendation: 0/8 admissions now; no key changes.** Review the two primary source crosswalk/vegetative fixes before future scoring; correct the POWO accepted-name URL only when the photo-owning candidate file owner has time. No overwrite of PR #68's packet 3/7/README work. Chat 1 can merge this audit by itself; the scoring shards, live candidate manifest, galleries, UI, and credits must remain untouched.

Next evidence collection order: **Melica nitens → Rottboellia campestris → Setaria viridis → Paspalum langei → Tridentopsis elongata → Sphenopholis interrupta**, collecting same-specimen botanical macros rather than more generic habit photographs. Then test new visually verified candidates with coordinator's real filter and false-exclusion suite.