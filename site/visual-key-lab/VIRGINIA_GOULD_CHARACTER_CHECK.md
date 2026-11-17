# Virginia wildrye — Gould page 166 character mapping

Owner requested the supplied book description be usable in the live ID Lab, including relevant suboptions. Source: Frank W. Gould (1975), *The Grasses of Texas*, exact *Elymus virginicus* treatment, printed p. 166. The owner's page photograph was read; its image is not redistributed.

The existing `source-reference-gould-1975.json` already preserves the complete source-specific intake, contextual measurements, habitat and two diagnostic checks. The new `gould-virginia-character-supplement.json` connects ten groups of these facts to scoring, including thirteen new positive-only choices. The original 1,815-row evidence master and historical 111-option validation stages are preserved. Final UI has 24 groups and 124 options.

## Character mapping

- Tuft, true spike and membrane ligule continue to use existing beginner choices.
- Erect or basally decumbent culms and flat adult blades corroborate existing states. Gould's mostly 60–120 cm culm height, green/glaucous color, habitat, historic distribution and chromosome count remain non-filter context.
- Blade widths mostly 5–15 mm retain measured evidence and shared-boundary caution; do not select every width bin as though describing one plant.
- Hairless, rough or minutely pubescent blade variants are distinct positive observations. A rough blade is not necessarily a serrate edge.
- Hairless sheaths gain a selectable state. H&L's occasional pilose variant and its prior source remain intact.
- Truncate ligule outline gains a selectable state. It does not assert a smooth rim or invent a numeric size; H&L's 0.5–1 mm and erose/ciliolate details remain supplemental.
- A stiffly erect spike and a spike partly held in its upper sheath become selectable under spike position. Neither asserts a sessile-plus-pedicelled spikelet pair.
- Strongly veined glume bodies, firm yellowish glumes, outward-bowed nerveless bases, somewhat curved apices and straight glume awns are selectable separately. Do not infer vein number, transfer body venation into the base, or conflate glume and lemma awns.
- Hairless lemmas now receive positive matching evidence. Sparse stiff lemma hairs gain a separate option rather than being mislabeled conspicuously hairy.
- Short or long lemma awns are permitted across Gould's 5–25 mm range. Straight/slightly curved shape is a separate choice; age-related bending and twisting are not inferred.

All new states are positive-only. Missing records for another taxon never prove absence; glume shape alone does not certify a local specimen or resolve hybrids. Photos, credits, arrows, diagrams, taxonomy/admission status and county nativity are unchanged.

## Verification

Five Node regression scripts pass, including malformed-supplement atomicity, preservation of old evidence and measurement boundaries, the formerly unresolved smooth lemma, sparse-hair variants, all thirteen new choices and one-point-per-group ranking.

Browser preview based on main `7495a14c42560f51624dfc5cff1adfdc90f44370` (including the owner's new beginner controls): spike + tuft + membrane + long awns, with flat blade, erect culm, straight/slightly curved lemma awn, smooth lemma, bowed/hardened/veined glumes and erect/sheath-enclosed spike produced **1 supported match (Virginia wildrye), 19 unresolved, 0 advanced source conflicts; 149 ruled out by earlier core characters**. Total partition remains 169. This is a literature-supported match, not a specimen determination. Live publication must be verified separately after merge.
