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
- The initial 56 key-coded grasses have **provisional** traits from existing Hays Botany records, not a comprehensive GrassBase row-by-row import. They require a complete photo/character crosswalk and QA before being marked final.
- The remaining 56 source-index species are visible but **not key-coded**. Do not imply a 56-species filtered candidate set has comprehensively eliminated the other 56.

## Source acknowledgment

Vorontsova, M. S., Humphreys, A. M., Kellogg, E. A. E., Teisher, J., Vorontsova, S., Xanthos, M., & Hackel, J. (2026). *GrassBase, a morphology and life history dataset for Poaceae* (v2). Zenodo. https://zenodo.org/records/22302582. CC BY 4.0.

GrassBase data licensing **does not include independent website software or photograph licenses**.