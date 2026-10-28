# Poaceae Learner feature-parity milestone — 2026-10-28

**Status: STAGING FEATURE RESTORATION PASSED AUTOMATED TESTS. No GitHub Pages deployment, cutover, original-source deletion, or automation restart.**

The new Poaceae learner is built from exact source species records already copied and verified, with **only rights-screened local source photo candidates**. This is an educational feature milestone, NOT final license clearance or anatomical photo certification.

## Implemented
- **All 112 grass species have guided learning sequences.** Six retain original species-authored `beginner_learning_path` steps; 106 now have source-grounded teaching sequences assembled from the original `look_here_first`, recorded morphology, field check notes and differential descriptions. No new taxonomic determinations were invented.
- **538 teaching steps**, of which **426** currently link to a physically present, source-recorded candidate photograph. Missing or restricted step photos remain explicitly flagged, not substituted with unrelated images.
- Learner, Learn Terms and Field ID viewing modes; expandable Field ID tiles; 3 missing original `field_id_short_tiles` get a clearly labeled fallback from original canonical morphology/field notes.
- **32 grassroots anatomy terms**, with definitions and botanical where/why guidance adapted from original `data/learning-layer.json` plus standard anatomy terms. Terms without local definitions remain marked as unavailable rather than guessed.
- **406 original look-alike references** exposed as local species links where the taxon exists in Poaceae; nonlocal/missing entries are labeled as pointers to the existing unified hub, not invented deep links.
- The original unified Quiz and full Glossary remain linked from the family learner; we have **not** duplicated the quiz engine.
- Each retained photo shows original source name, image attribution and license, 1,261 existing arrow markers where coordinates are valid, and a source link. Only photo metadata and pixels already screened into the staging repository are eligible for its generated site.

## Checks passed
- [PASS] 112 / 112 source species with lessons (106 generated from existing notes + 6 explicit).
- [PASS] 538 lesson steps / 426 linked photo examples.
- [PASS] 3 Field ID tile fallback species no longer blank.
- [PASS] 32 glossary terms and three teaching modes in desktop/mobile.
- [PASS] Chromium desktop 1366×850 and mobile 390×844: user search for Indiangrass, silver bluestem and sideoats; image loading; photo-gallery navigation; glossary open/close; Field ID panels; no JS errors or horizontal page overflow.
- [PASS] No change to 788 transferred photo candidate count, 224 held images, 956 displayed panels, 1,261 annotation-coordinate markers.
- [PASS] Previous comprehensive data-integrity/photo-decoding gates remain successful on new UI commit. The generated unpublished family preview is approximately 390 MB, comfortably below the 1 GB Pages size limit.
- [PASS] Five scheduled ChatGPT grass automations remain disabled per user request.

## What still blocks replacing the original
- **Photo rights**: the imported 788 images are metadata-screened candidates, not a completed photo-by-photo permission audit for the new site. 224 held physical originals remain *only* in the original. CC BY-NC and CC BY-SA attribution and adaptation obligations remain.
- **Missing original panels**: 263 of 1,219 original references are excluded from staging (197 reference held images, 66 are external links), involving 64 species. This does not mean 263 unique files are missing. Cannot restore copyright-held media into public history.
- **Botanical accuracy review**: automated checks confirm arrow coordinates are valid, but the anatomical landing positions on real photographed structures need a visual audit; 248 smaller photos have a short dimension below 800 px.
- **Deep UI parity**: family site is a purpose-built staging interface; it is not a byte-for-byte replica of the original unified learner. Only 32 glossary definitions are locally present; full glossary photos, cross-family comparison UI, universal search and unified quiz integration still reside in original.
- **Public cutover**: no new Poaceae Pages deployment, and original homepage/search/quiz/glossary links remain unchanged. Final rights review, mobile/human image checks and source resynchronization needed.

## GitHub Actions verification
- [Tiered learner desktop/mobile smoke test](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40705495404)
- [Non-deploying comprehensive source and photo QA](https://github.com/Crking92/Hays-Botany-Poaceae/actions/runs/40705328175)
- [Initial 112-species transfer verification](https://github.com/Crking92/Hays-Botany-Poaceae/blob/main/migration/poaceae-destination-verification-20261028.json)

**Next:** make a prioritized image-rights and annotation audit while preserving the existing website; then build a reversible connection from the unified hub to the family learner *only after* the family site receives its own tested public release.