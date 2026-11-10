# Visual Grass ID Key — morphology-source and character decision rules

Updated: 2026-11-10. Scope: `site/visual-key-lab/` in the active Poaceae repository. This rule controls the **identification key** only; it does not rewrite species records, county-native status, or photo approval.

## Source priority and purpose

1. **Hays Botany species records** define the 112-species regional teaching set and retain the species-card name, photographs, existing field observations, status, captions, photo permissions, and diagnostic caveats.
2. **GrassBase, v2** (Vorontsova et al. 2026, https://zenodo.org/records/22302582; CC BY 4.0) is a **primary morphological reference** for individual grass structures and character states: inflorescence type, ligule, leaf/sheath, culm, rhizome, spikelet, glume, lemma, palea, awn, floret and growth traits. The data were compiled from older floristic literature; treat source records and their taxon concepts as evidence, not automatic current-name authority.
3. **Flora of North America, regional Texas floras/UT Austin Plant Resources Center, and other relevant peer-reviewed treatments** resolve field-diagnostic differences, measurements, and regional variation. When sources differ, retain both accounts with attribution and an explicit uncertainty note. Do not silently convert a range into one fixed state.
4. **BONAP NAPA and documented voucher/occurrence evidence** govern geographic nativity and relevant county inclusion, independent of morphology. Introduced plants remain in the key as identification/look-alike subjects but never become native restoration recommendations by default.

## Key conversion rules

- Scientific names: preserve current Hays Botany display names. Store original GrassBase taxon name and accepted-name crosswalk separately; flag ambiguous synonyms/hybrids.
- Each coded character must have a source reference, the actual observed state(s), a certainty level (reviewed; provisional; conflicting; unavailable) and, where relevant, season and sex/floral phase. A missing state means **unknown**, never **absent**.
- Multiple states are allowed for species with variability; e.g. awned **or** awnless fertile spikelets. Do not automatically rule a species out for a state not yet verified.
- Differentiate nonhomologous structures: *Setaria* sterile branch bristles are not lemma awns; stigmas are neither. Rhizomes are underground stems, stolons are surface runners, and root hairs are not ligules.
- A photo is not morphologically verified merely because the species identity was identified. Select images showing the **actual botanical character** requested; whole-panicle choices require whole-head views; microstructures need close focus/scale and may require a hand lens. Mark unclear photos as pending; do not substitute a photograph of a different plant while labeling it as the target.
- Preserve the exact image rights, photographer, original image identity/source page and license. Do not treat CC BY-NC, educational permission, and public-domain/CC BY licenses as interchangeable; do not import new files without rights review.
- Multi-access UI: allow selecting traits in any order; provide “Can't tell / skip”; don't penalize unknown states; show look-alikes and explain conflicting selections without falsely claiming an ID is definite.
- Use field-friendly photograph + short botanical terminology. Longer explanations belong in existing learner, not inside the key's selection workflow.
- **Framework assembled 2026-11-10:** All 112 indexed Poaceae species now have preliminary multi-access character profiles across 9 data files. Characters are **provisional** and originate in existing Hays Botany species records; they are not yet a full GrassBase row-by-row mapping. The first pass validates data integrity and candidate mechanics, NOT the botanical accuracy of every state.
- **Current exceptions:** Canyon muhly (*Muhlenbergia ×involuta*) still lacks a widely reusable source photo in the key; leave the placeholder rather than presenting limited-permission photos as open licensed. Missing or conflicting character states must remain unscored and visible as uncertain.
- **Next workflow:** (1) check taxon names and top-level character definitions across all 112; (2) review flowerhead and growth states by genus and look-alike group, prioritizing grasses encountered in Hays County and neighboring west/north counties; (3) verify ligules, spikelets, bristles versus awns, measured glumes/lemmas, and seasonal variation against GrassBase plus the user-provided *Illustrated Flora of North Central Texas* monocot section and other regional floras; (4) replace misleading diagnostic photos using confirmed appropriate rights; (5) run 112-species candidate/filter acceptance tests and live-page visual checks. Avoid introducing new species, duplicate spreadsheets, or changes to unrelated learner pages.
- The uploaded 275-page excerpt of the *Illustrated Flora of North Central Texas* contains family recognition, keys, species diagnoses and botanical illustrations. Use the morphological facts and key distinctions as source evidence; **do not republish its illustrations or long text passages** without an appropriate copyright basis. It is a North Central Texas reference, **not** a direct Hays County nativity map.

## Source acknowledgment

Vorontsova, M. S., Humphreys, A. M., Kellogg, E. A. E., Teisher, J., Vorontsova, S., Xanthos, M., & Hackel, J. (2026). *GrassBase, a morphology and life history dataset for Poaceae* (v2). Zenodo. https://zenodo.org/records/22302582. CC BY 4.0.

GrassBase data licensing **does not include independent website software or photograph licenses**.