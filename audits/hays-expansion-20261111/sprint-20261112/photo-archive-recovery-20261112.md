# Recovering original Hays grass specimen-photo evidence — 2026-11-12

**Owner:** Chat 5 source/specimen evidence lane · **Issue:** [#70](https://github.com/Crking92/Hays-Botany-Poaceae/issues/70) · **Mode:** nonpublishing audit only

## What was actually recovered and reexamined

Five one-day-expiring GitHub Actions artifacts were successfully downloaded and unpacked. Their filenames, artifact IDs, SHA256 hashes, photo counts, archived licenses and original source QA paths are preserved in [the companion machine-readable recovery record](photo-archive-recovery-20261112.json).

| Verified metric | Count |
|---|---:|
| Original source photographic thumbnail tiles recovered | **317** |
| Original historical name-specific contact sheets recovered | **51** |
| Distinct provisional species among those sheets | **50** |
| Historical synonym-only sheet | **1**, *Elymus glabriflorus* (existing *E. virginicus* alias under current Kew policy) |
| Remaining source records with zero previously licensed photo pixels | **7** |
| Contact sheets freshly **opened and visually examined** this turn | **23** |
| Individual contact-sheet photo tiles represented by those 23 opened sheets | **143** |
| Additional photo tiles recovered but not reexamined this turn | **174** |
| Definitive local Hays specimen species ID approvals this turn | **0** |
| Provisional species admitted to scored key | **0** |
| New photos installed / verified visible on public website | **0** |

**Rights:** Archived 317 photo labels = **289 CC BY-NC**, **24 CC BY**, **3 CC0**, **1 CC BY-NC-SA** (historical photo metadata only). Exact live source photo URLs were unavailable this turn, so **0 licenses or photographers were independently reverified now** and **0 images are approved for publication**. Some photographs lack detailed structures. The artifacts have original `attributions.json` listing exact photo IDs, observation IDs, photographer credits and stored license codes and retained their README warnings. Source photographs are not in this PR or any proposed public repo gallery. **Contact sheets are medium/thumbnail review copies, not full-size downloaded original images.**

The five original artifacts were preserved in the current conversation as one **private review-only ZIP**, rather than committing third-party NC photographs into this public repository or adding them to the user's Library. GitHub Actions source artifacts originally had one-day retention and may expire.

## Critical preservation finding: source QA is present in an old branch, absent from main

The main candidate records' `source_files.images`, `source_files.hill_country` and `source_files.candidate_queue` pointers were audited against a GitHub tree listing. **All 57 candidate records point to original visual-QA/2015-Hill-Country/observation-queue files not present in `main`.** These files **are present and retrievable** from historical branch **`inat-coverage-audit-20261111`**, tree SHA `3a84adba5fc7fc684d7e922ef5692850973c271d`. Actual historical source files recovered include:

- `audits/hays-58-first-five-visual-qa-20261111.json`
- `audits/hays-58-next-eight-visual-qa-20261111.json`
- `audits/hays-58-pass3-visual-qa-20261111.json`
- `audits/hays-58-pass4-visual-qa-20261111.json`
- `audits/hays-58-pass5-visual-qa-20261111.json`
- `audits/hays-58-photo-access-holds-20261111.json`
- `audits/hays-58-texas-hill-country-2015-crosswalk.json`
- `audits/inat-2026-11-11-hays-only.json`

The source branch also has additional historical taxonomy, taxon-status exceptions, and photo access reports. **Chat 1 should selectively restore these source audit records to main after checking overlaps**, rather than asking for reuploads or merging the old branch wholesale with its workflows. The existing 57 literature packets and new five-batch screening records must remain intact. This Chat 5 PR does **not** modify or restore original files outside its exclusive sprint audit folder.

## Evidence-backed fresh visual findings

| Hays candidate | Newly seen actual image details | Species gate still missing |
|---|---|---|
| *Stapfochloa canterae* | Four images: curved ciliate raceme with ruler, hairy culm junction, dissected spikelet-like units on ruler | Precisely count and compare fertile/sterile florets and lemma awns/hairs versus Texas-native *S. ciliata* |
| *Pappophorum bicolor* | Four images: grassland tuft, feathery raceme and close seedhead views | Single lemma's exact awn attachment/count and **lemma body** measured against *P. mucronulatum*, which also has 11–15 awns |
| *Echinochloa walteri* | Eleven images: awned branched heads plus **papilla-based sheath hairs** with collar and leaf | Measured glume/lemma and awn insertion versus *E. crus-galli* and *E. muricata* |
| *Janochloa antidotalis* | Eight images from one Hays record: **swollen hairy nodes**, leaf junction, flowering panicle and whole culms | Connected rhizome/base and separated sterile versus fertile florets; forage vs self-established habitat |
| *Melica nitens* | Twelve images: drooping spikelets, hand closeups, leafy bases across several observations | Mature spikelet rudiment/lemma characteristics, opened ligule, hard crown with rhizome vs tuft nuance |
| *Paspalum langei* | Twelve images: long racemes, closeup spikelets, basal foliage | Valid glume and lemma measurements on same source plant; comparisons with other locally collected Paspalum |
| *Bothriochloa longipaniculata* | Twelve images: narrow silvery flowering clusters, hand-scale and basal grass habit | Precisely measured sessile spikelet/glume sheen and modern species-level comparison with *B. torreyana* |
| *Briza minor* | Three photos: **small triangular dangling spikelets** and small whole grass | Isolated 3–8-flowered spikelet + 5–10 mm membranous ligule; only one Hays source |
| *Rostraria cristata* | Five images: compact bristly green heads, including **three historically CC BY Chris Hughes photos** | Glume vein count, floret count, awn insertion and ligule; licenses must be freshly rechecked |
| *Cenchrus ciliaris* | Five images: dense bristly head and ciliate collar | Joined bristle bases forming an entire detachable bur, unlike persistent Setaria bristles |
| *Sphenopholis obtusata* | Nine images: green and dried narrow panicles; one collar closeup | Upper glume broad/blunt apex and floret measurements versus *S. interrupta* |
| *Setaria leucopila* | Six images: narrow heads/foliage, flowering head held for hand scale | Ligule membrane+ciliate rim, no knotty rhizome, transverse lemma wrinkles |
| *Paspalum notatum* | Eight images: **Y-shaped paired terminal racemes** in maintained short turf | Underground rhizomes and spikelet margins/size; wild establishment vs planted Bahia lawn |
| *Cortaderia selloana* | Seven images: **Hays observation 62141431 clearly contains multiple short cylindrical bottlebrush/fountain-grass-type heads**, unlike classic wide branching pampas panicles | **Priority species-misidentification hold.** Retag this observation for botanical re-identification, not provisional verified *Cortaderia*. Other pampas-looking sheets also need exact floral proof and landscaping status |
| *Setaria viridis* | Eleven images: immature green and straw colored mature bristly inflorescences, some rooted bases | Fertile lemma microscopic wrinkles, 2-floered spikelet, annual base; avoid Setaria lookalikes |
| *Phyllostachys aurea* | Seven photos: dense bamboo grove, leaf and branching habit | Compressed shortened internodes at base of culm, true species anatomy, planted-site classification |
| *Steinchisma hians* | Three photos: open panicle plus some leaves | Inflated lower sterile palea protruding at gaping ripe spikelet tip |
| *Stenotaphrum secundatum* | Four photos: maintained broad-leaved turf | Stolons, ciliate membranous ligule and flattened corky fertile spike; planted lawn not wild proof |
| *Triticum aestivum* | Four photos: mature wheatlike spikes with broad cereal habit | Glume and floret anatomy; deliberate crop or seed spill status |
| *Panicum miliaceum* | Four photos: coarse blades/sheath and tight immature-looking green head | Ripe millet grains and spikelet diagnosis; green head may be immature or misidentified |
| *Panicum repens* | One photo: dense grassy mat | Connected sharp-tipped, underground *torpedo* rhizome and mature spikelets |
| *Miscanthus sinensis* | One photo: big arching ornamental grass in garden-type context | A true paired spikelet inflorescence and self-established status |
| *Sclerochloa dura* | Two photos: compact one-sided small grass flowering heads | Thick blunt-nerved ripe glumes, 3–4 florets and true 1–2 mm membrane |

These descriptions come from **new examination of the original archived image pixels**, not merely historical QA prose. This **does not** equal a fresh complete Hays specimen ID: in most cases the diagnostic structure is absent or too small for measurement. No claims about the 174 unreviewed images are upgraded; their earlier historical review descriptions remain available on the source branch.

## Next useful action for coordinator and photo lane

First, **selectively restore the missing original QA JSON/crosswalk/queue text** so future chats can find the exact source photo records with no loss of earlier work. Second, the photo-gallery lane should **not copy/publish the recovered NC contact sheets**, but may use the original photo IDs and observer credits to find authorized general-photo alternatives. Third, target *Stapfochloa canterae*, *Janochloa antidotalis*, *Echinochloa walteri*, *Paspalum langei* and *Melica nitens* for original-resolution **same-specimen** florets/collar/rootstock checks; those have richer existing image coverage and may be closer to a real ID gate. Fourth, independently recheck *Cortaderia* Hays observation 62141431 before using it in any official source-labeled image collection.

Do **not** change 169 configured / 112 scored / 57 provisional, existing master photo-needs queue, published gallery manifests or source image rights; the existing photo owner and Chat 1 coordinator retain their exclusive ownership. This report contains actionable recovered proof and actual image findings, not a second planning spreadsheet.
