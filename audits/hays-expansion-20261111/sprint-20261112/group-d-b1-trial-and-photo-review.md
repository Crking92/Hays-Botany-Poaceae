# Group D — actual production trial regressions and 17 gallery photo-pixel QA (Batch 1)

**Date:** 2026-11-12 · **Repo:** Crking92/Hays-Botany-Poaceae · **Issue:** [#70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70) · **Owner:** Chat 5 Group D

**The real production key was tested.** This is not a separate Field Test Mode and does not admit unverified species into official scoring.

## Confirmed scoring test execution

- **Successful GitHub Actions run:** [43298427728](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/43298427728); [actual test output and contact-sheet artifact](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/43298427728/artifacts/13980636203).
- `scripts/test_group_d_production_trials_b1.cjs` extracts and evaluates **the actual `currentResults()` function** from the present `site/visual-key-lab/index.html`, using Node `vm`. It does **not** implement an alternative score engine.
- **23/23 source-backed required positive, partial/unknown, and negative-control field paths PASSED** for PR #137's six originally integrated research trials: *Setaria viridis*, *S. leucopila*, *Bromus tectorum*, *B. catharticus*, *Lolium multiflorum* and *Echinochloa colona*.
- **6 additional field observation pitfalls were executed** and recorded as risk cases, **not** presumed passed or automatic species admissions. At the time of testing, **112 official scored** species remained first in result order and **6 research-trial matches** were visibly labeled `Research trial · unverified`. 57 candidates retained research-only status and 169 remained searchable in Learner.

### Field-observation challenges: measured result, impact and disposition

| Field observation / four-choice path | Production outcome | Classification and what Chat 1 should do |
|---|---|---|
| **Cheatgrass with broken/worn awns**: `branched_oat / tuft / membrane / none_obvious` | **Bromus tectorum disappeared** | **1 credible source-supported false-exclusion risk.** [IDtools cheatgrass fact sheet](https://idtools.org/id/weed-tool/key/GrapeGrassKey/Media/Html/fact_sheets/Bro-tec.html) explicitly shows an awn missing and broken from otherwise normal florets. Recommend a field instruction to **skip uncertain/damaged awn choice**, and source-backed tests before any scored-state expansion. Never infer a truly awnless cheatgrass genotype from damage. |
| Immature cheatgrass head called `compact` | Cheatgrass disappeared | Field-category ambiguity, **not a confirmed error**: an unexpanded panicle may appear contracted. When a flowerhead is immature, advise skipping that question and looking at later structure. |
| Italian ryegrass decumbent plant called `mat` | Italian ryegrass disappeared | Not enough evidence for defect: the UI `mat` choice specifically means true stolons or culms **rooted at nodes**, while a merely reclining ryegrass culm is not necessarily a rooted mat. [USFS FEIS describes decumbent culms](https://research.fs.usda.gov/feis/species-reviews/lolperm). |
| Green foxtail hair-fringe ligule called `membrane` | Green foxtail disappeared | Likely user-choice confusion, not a demonstrated species trait fault: [Kew calls *S. viridis* ligule a fringe of hairs](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1171009-2/general-information). Examine the true blade/sheath junction or **skip uncertain**. |
| Jungle rice collar hairs counted as true ligule hairs | Jungle rice disappeared | **Correct exclusion of an incorrect observation**: [FNA *Echinochloa colona*](https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=644462) says the true ligule is absent; nearby sheath/collar hairs must not be misidentified as a ligule. A new clear collar photo is identified below. |
| Rescue brome with `awns=burs`, despite a branched-oat head | Rescue brome **still matched, rank #1** | **False-inclusion / overpermissive unknown state risk.** The trial's `awns: []` is deliberately unknown, which bypasses every awn choice. [Texas A&M](https://rangeplants.tamu.edu/plant/rescuegrass/) describes short or no awns, not spiny burs. Preserve unknown for now but flag that **a trial match is a possibility, not proof**. Do not convert botanical unknown to hard false exclusion without separate source-and-photo validation. |

### Real-key result rank / ambiguity matters

For four specific diagnostic choices, the observed trial rank (official 112 matched first by design) was:
- *Setaria viridis* **rank 4**; reduced to habit+ligule only **rank 61**.
- *Setaria leucopila* **rank 3** with ciliate membrane; hair-fringe interpretation **rank 5**; habit+ligule only **rank 93**.
- *Bromus tectorum* **rank 7** on fully obvious characters, rank 8 with awn choice skipped.
- *Bromus catharticus* **rank 3** with not-obvious awns, rank 8 with long awn input (unknown).
- *Lolium multiflorum* **rank 6** long awns, rank 2 no obvious awns, vegetative-only **rank 92**.
- *Echinochloa colona* **rank 1** on erect/decumbent full and vegetative paths, rank 2 on ascending raceme form.

The UI's `renderResults()` actually appends **all** matching cards, so these trial species are not literally missing when low-ranked. But they can be **buried under many official scored species** in a realistic nonflowering field scenario. That is a beginner usability issue for Chat 1 to consider **without changing protected production sorting or prematurely promoting a trial**.

## Group D actual photo pixel review — 17 assigned galleries

**From the current configured manifest:** **17/17 species have at least two refs, total 39**. GitHub Actions successfully retrieved **36 of 39 exact Commons photo previews** (900 px) and verified **36 unique byte hashes**, with **3 source URL HTTP 429 rate-limit responses**, **not definitive 404s**. I personally examined all 17 resulting contact sheets, with incomplete coverage for the 429 images. The actual original 36 image pixels were inspected, not just filename labels. **No actual public Pages rendered/DOM image verification was achieved** in this batch; no images were installed.

The complete per-photo filename/photographer/license and per-species findings are in [`group-d-b1-actual-photo-quality.json`](group-d-b1-actual-photo-quality.json). Highest-value findings:

| Species | Existing photo coverage / actual seen | Highest value photo or metadata fix |
|---|---|---|
| *Lolium multiflorum* | **2**, both distant roadside vegetation; second mislabeled **Spikelets** though no real detail | Add truly close multiflowered ryegrass spikelet; show ligule/auricle; flag overclaimed role |
| *Oplismenus hirtellus* | **2**, both leaf/groundcover habitat, neither flowering | Add one-sided awned inflorescence; source below already checked |
| *Stenotaphrum secundatum* | **2**, flowerhead + grass patch | Add macro of flattened spike with embedded spikelets, actual rooting stolon |
| *Triticum aestivum* | **2**, young wheat spike + sharp ripe wheat glumes | Relabel two generic roles; add mature whole stand and auricles |
| *Setaria viridis* | **2**, useful whole tuft and isolated seedhead; **roles essentially reversed** | Relabel current first/second roles; add true ligule, mature lemma and bristle insertion |
| *Polypogon viridis* | **2**, highly similar water-edge tuft views | Add ligule and awnless glume macro, not another habit repeat |
| *Dactyloctenium aegyptium* | **2**, both overhead finger-spike views | Add rooted plant, naked terminal rachis extension, ciliate collar |
| *Hordeum murinum* | **2**, two bristly head/stand shots, nearly same role | Add intact three-spikelet rachis node and auricle/collar |
| *Cenchrus ciliaris* | **2**, tuft and visible flowerhead | Add isolated fused-bristle involucre versus *Setaria* free bristles |
| *Panicum repens* | **2**, distant growth and almost imperceptible inflorescence | Add sharp-tipped underground **torpedo rhizome**, clear spikelets and ligule |
| *Sclerochloa dura* | **2**, one dry flattened mat loaded, second returned **429** | Retry blocked source; seek clearer green one-sided mature head, glumes, ligule |
| *Sporobolus cryptandrus* | **2**, both **429**, none inspected fresh | Retry source without burst requests, verify actual public load; then add whole plant and mature open panicle |
| *Bromus catharticus* | **3**, decent habit and broad drooping heads; foliage image is vague grassy clump | Add true collar and lemma showing short/absent awn; caption foliage photo cautiously |
| *Lolium perenne* | **3**, two useful close flower/spikelet photos and wider inflorescence; all labeled generic plant reference | Change actual roles to spikelet/anther and flowering head; add true auricle/collar |
| *Echinochloa colona* | **3**, useful uprooted habit and flowerhead; middle image is extremely tiny detached seed against empty background, with overclaimed **Seed and flowering-unit context** role | Deprioritize tiny-isolate image; add clean missing-ligule photo below |
| *Paspalum notatum* | **3**, genuinely complementary lawn habit, forked flowerhead and rooted basal stems | Already a stronger photo set; optional ligule and isolated spikelet |
| *Bromus tectorum* | **3**, good tuft, drooping heads, general plant; so-called **Flowering spikelet detail** is a whole-head photo | Add mature lemma/awn and broken-awn closeup, relabel current photo |

**Image quality flags are observations of visible media, not independent Hays specimen identification certificates.** Botanical taxon labels/photographer attribution remain those shown on the exact original Commons file pages. We have not changed the original species names, labels or source files.

### Three useful, complementary, licensed photographs — source AND actual pixel check

All three sources were independently checked at exact [Wikimedia Commons](https://commons.wikimedia.org/) file pages for named photographer, file license and original record, then **actual 960-pixel image previews were fetched and visually inspected**. They show the claimed missing ID structures. Handoff data and separate source/rights descriptions: [`group-d-b1-photo-source-leads.json`](group-d-b1-photo-source-leads.json).

1. **`Oplismenus hirtellus-flowers.jpg`** — **Forest & Kim Starr**, CC BY 2.0, [exact file page](https://commons.wikimedia.org/wiki/File:Oplismenus_hirtellus-flowers.jpg). Verified pixel view: narrow inflorescence with green spikelets and conspicuous reddish-purple hairlike awns; adds truly missing reproductive photo to two foliage-only source cards. Hawaiian nonlocal reference.
2. **`Lolium multiflorum spikelets1 (6919358915).jpg`** — **Harry Rose**, CC BY 2.0, [exact file page](https://commons.wikimedia.org/wiki/File:Lolium_multiflorum_spikelets1_(6919358915).jpg). Verified pixels: close single ryegrass spike with multiple florets and pale projecting awns; supplies structure absent from distant current photos. Australian nonlocal reference.
3. **`Echinochloa colona ligule1 (7119935605).jpg`** — **Harry Rose**, CC BY 2.0, [exact file page](https://commons.wikimedia.org/wiki/File:Echinochloa_colona_ligule1_(7119935605).jpg). Verified pixels: close blade/sheath junction with **no true ligule**; useful to prevent users mistaking collar hair or dark junction as hairy ligule. Australian nonlocal reference.

**All three source previews loaded and matched their stated visual roles.** They are original source-named and reuse-eligible **nonlocal reference candidates**, not expert-authenticated Hays specimens. The final photo publisher must check existing database hashes, species provenance against lookalikes, exact attribution/caption and live Pages rendering before adding them. These were not installed by Group D.

## Pending exact checks and next steps

1. **Chat 1:** Review the source-backed cheatgrass broken-awn false-exclusion risk and the rescue-brome overpermissive unknown state. Preserve six trial tags and 112 scored shards, rerun these same real `currentResults()` paths after each production change; do not create separate Field Test Mode.
2. **Photo publisher:** Install those three high-value CC BY 2.0 general/diagnostic pictures after final eligibility checks, fix misleading photo-role labels, and attempt lower-rate or alternative-hosted retrieval of the three current 429 photos.
3. **Live website verification:** Current runner **downloaded source pixels, not a rendered photo inside the public Learner**, and a separate web retrieval could not access the public Pages route. Require a headless-browser/public Pages pixel-and-credits test before calling photo-gallery coverage live.
4. **Next Group D batch:** Expand diagnostic roles especially for *Panicum repens*, *Dactyloctenium aegyptium*, *Hordeum murinum*, *Cenchrus ciliaris*, *Lolium multiflorum* and the failed *Sporobolus* images. Avoid redundant habit photos; don't trigger BONAP county work yet.

**Sprint scoreboard:** 17/17 Group D galleries inspected at contact-sheet level, 39 configured photo refs, **36 actual images loaded**, **3 rate-limited**; six PR #137 research-trial species tested with **23/23 required production paths passed** and six field pitfalls documented; **0 new source photos public-site verified**, **0 full provisional species admitted**, **112 official scored**, **6 six-species research trial matches** in the existing key and **169 configured Learner entries**.
