# Hays County new-grass batch — staging integration QA

**TECHNICAL_STAGING_COMPLETE_FINAL_BOTANICAL_RELEASE_BLOCKED**. All source and target counts pass validation. This report intentionally does not authorize the cards to join the public 112-species field key.

| Check | Result |
|---|---|
| Existing live species unchanged | 112 species |
| Original Hays names | 58 |
| Distinct staged candidates | 57 (56 species + 1 hybrid) |
| Existing alias | Elymus glabriflorus → Elymus virginicus |
| Duplicate IDs/names in existing 112 | 0 |
| Source observation links | 151 |
| New candidate photo sets previously visually inspected | 50/57 |
| Unreviewed licensed-photo holds | 7/57 |
| Third-party photo bytes added | 0 |
| Unknown morphology states guessed as present/absent | 0 |
| Taxonomy references missing | 0 |
| Botanically signed-off candidates | 0 — explicit release gate |

## Current evidence tiers

- PHOTO_GROUP_SUPPORT_SPECIES_DIAGNOSIS_PENDING: **42**
- PUBLISHED_COUNTY_SPECIMEN_AND_PHOTO_SUPPORT_SPECIES_MICRO_PENDING: **7**
- ORIGINAL_HERBARIUM_SHEETS_SEEN_MICRO_ID_PENDING: **1**
- PHOTO_PIXEL_ACCESS_PENDING: **7**

## What this batch actually finishes

All 58 original name records are reconciled to 57 distinct new draft taxon cards and one existing alias. Every draft card has an accepted name, common name where known, synonyms, original Hays iNaturalist observation links, photo review status, targeted diagnostic follow-up, county/specimen sources and deliberate 'unknown' rather than invented field-key characters. Separate logs preserve original TEX specimens and seven photo-rights holds.

## Remaining tasks before live field-ID key import

- Seven original observation photo sets cannot be reproduced in current rights-filtered workflow
- All 57 new candidate species/hybrid diagnoses still need distinguishing specimen-level verification
- Nativity and planted-vs-established context remain unverified
- Images must clear rights review before being published in the field key
- Do not automatically display candidate cards among the 112 vetted live cards

**Hard stop:** Do NOT feed all 57 draft profiles directly into the interactive field key; empty trait choices mean uncertain and would degrade identification results. Fill only independently checked character states and images. Preserve provisional cards in isolated staging until each species passes the botany, rights and local-context gates.

Sources: [candidate data](hays-57-draft-id-cards.json), [human-readable register](hays-57-draft-id-cards.md), [nomenclature mapping](../hays-58-nomenclature-final-staging.json), [Hill Country 2015 comparison](../hays-58-texas-hill-country-2015-crosswalk.json).
