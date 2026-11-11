# Hays County Grass ID — active candidate review

**Status:** Staging only. Neither the current 112 species nor the public ID Lab has been changed.

## Snapshot

- **112** existing grass species
- **60** initially unmatched iNaturalist names reported inside Hays County
- **2** already represented under aliases in the current 112
- **58** remaining Hays candidate names
- **21** high-observation candidates (5+ research-grade observations)
- **37** lower-observation candidates (1–4 research-grade observations)

**Scope:** iNaturalist research-grade Poaceae records inside Hays County (place 326), as captured November 11, 2026. Counts represent observation totals, not independent taxonomically confirmed species. Records from all 12 counties remain in `inat-2026-11-11-cleaned.json`; they are not being pursued in this phase.

## Already in the 112 — do not create a new species card

- *Muhlenbergia × involuta* → *Muhlenbergia ×involuta* (13 Hays observations)
- *Tridens buckleyanus* → *Tridentopsis buckleyana* (6 Hays observations)

## Priority 1 — 5+ Hays observations

| # | Candidate | Hays obs | Review flags |
|---:|---|---:|---|
| 1 | *Bromus catharticus* | 171 | introduced? |
| 2 | *Melica nitens* | 125 | — |
| 3 | *Eragrostis superba* | 59 | planted?; introduced? |
| 4 | *Lolium perenne* | 53 | planted?; introduced? |
| 5 | *Bothriochloa longipaniculata* | 25 | — |
| 6 | *Paspalum langei* | 23 | taxonomy review |
| 7 | *Bothriochloa bladhii* | 18 | introduced? |
| 8 | *Dichanthium aristatum* | 15 | introduced? |
| 9 | *Phyllostachys aurea* | 12 | planted?; introduced? |
| 10 | *Lolium multiflorum* | 11 | planted?; introduced? |
| 11 | *Bromus brevis* | 10 | taxonomy review |
| 12 | *Coelorachis cylindrica* | 10 | taxonomy review |
| 13 | *Oplismenus hirtellus* | 9 | — |
| 14 | *Stenotaphrum secundatum* | 9 | planted?; introduced? |
| 15 | *Triticum aestivum* | 8 | planted? |
| 16 | *Echinochloa colona* | 7 | introduced? |
| 17 | *Paspalum notatum* | 7 | introduced? |
| 18 | *Setaria viridis* | 7 | — |
| 19 | *Cortaderia selloana* | 6 | planted?; introduced? |
| 20 | *Echinochloa walteri* | 6 | — |
| 21 | *Rostraria cristata* | 5 | — |

## Priority 2 — 1–4 Hays observations

| # | Candidate | Hays obs | Review flags |
|---:|---|---:|---|
| 1 | *Panicum miliaceum* | 4 | — |
| 2 | *Setaria leucopila* | 4 | — |
| 3 | *Sphenopholis obtusata* | 4 | — |
| 4 | *Steinchisma hians* | 4 | — |
| 5 | *Aegilops cylindrica* | 3 | — |
| 6 | *Avena sativa* | 3 | planted? |
| 7 | *Elymus glabriflorus* | 3 | — |
| 8 | *Megathyrsus maximus* | 3 | introduced? |
| 9 | *Muhlenbergia capillaris* | 3 | planted? |
| 10 | *Polypogon viridis* | 3 | — |
| 11 | *Sphenopholis interrupta* | 3 | — |
| 12 | *Tridentopsis elongata* | 3 | taxonomy review |
| 13 | *Bromus tectorum* | 2 | introduced? |
| 14 | *Dactyloctenium aegyptium* | 2 | — |
| 15 | *Dichanthelium acuminatum* | 2 | — |
| 16 | *Eragrostis curtipedicellata* | 2 | — |
| 17 | *Eragrostis minor* | 2 | — |
| 18 | *Hordeum murinum* | 2 | — |
| 19 | *Melinis repens* | 2 | introduced? |
| 20 | *Nassella tenuissima* | 2 | — |
| 21 | *Stapfochloa ciliata* | 2 | — |
| 22 | *Tridens congestus* | 2 | — |
| 23 | *Alopecurus carolinianus* | 1 | — |
| 24 | *Briza minor* | 1 | — |
| 25 | *Cenchrus ciliaris* | 1 | introduced? |
| 26 | *Cenchrus setaceus* | 1 | planted? |
| 27 | *Digitaria californica* | 1 | — |
| 28 | *Elymus macgregorii* | 1 | — |
| 29 | *Janochloa antidotalis* | 1 | — |
| 30 | *Lolium × boucheanum* | 1 | planted? |
| 31 | *Miscanthus sinensis* | 1 | planted? |
| 32 | *Panicum dichotomiflorum* | 1 | — |
| 33 | *Panicum repens* | 1 | introduced? |
| 34 | *Pappophorum bicolor* | 1 | — |
| 35 | *Sclerochloa dura* | 1 | — |
| 36 | *Sporobolus cryptandrus* | 1 | — |
| 37 | *Stapfochloa canterae* | 1 | — |

## Steps before promotion into the field ID key

1. Resolve current accepted name and synonyms, retaining the original iNaturalist name and taxon ID.
2. Cross-check known morphological characters against the *Flora of North Central Texas* and, where appropriate, *Flora of North America*; validate that the record is plausibly within their taxon concepts.
3. Inspect representative Hays specimens and iNaturalist IDs for misidentifications or horticultural-only occurrence.
4. Record whether the candidate is a naturally occurring native, established introduced grass, planted specimen, uncertain, or otherwise.
5. Mark confirmed distinct field-ID candidates for a later test merge; preserve the 112 source records and site data unchanged.

**Do not automatically discard introduced grasses**; the ID key should identify common nonnatives as well. Native status is tracked separately and not yet certified. The full regional audit is archived, not deleted.

## Files

- `inat-2026-11-11-hays-only.json` — machine-readable review staging queue
- `inat-2026-11-11-cleaned.json` — full 12-county review and taxon matching
- `inat-2026-11-11-raw-candidates.json` — untouched raw records

