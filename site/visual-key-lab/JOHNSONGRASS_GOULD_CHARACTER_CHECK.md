# Johnsongrass — Gould printed page 575

Source: Frank W. Gould (1975), *The Grasses of Texas*, exact *Sorghum halepense* treatment, printed p. 575, read from the owner's supplied photograph. The photograph is not redistributed. The following *S. almum* account is recorded only as a separate-taxonomy comparison, not admitted as a new profile or merged into Johnsongrass facts.

## Before and after

The public nine-question Lab kept Johnsongrass possible, but an open panicle + rhizomes + membrane + inconspicuous awns, with broad hairless blades, ciliate/truncate ligule, paired spikelets and a short true lemma awn, produced zero supported matches. Hairless blades and truncate outline were selectable after Virginia work but lacked Johnsongrass evidence.

`gould-johnsongrass-character-supplement.json` adds eight exact-species evidence groups and ten positive-only choices, using the same validated extension mechanism as Virginia. The original 1,815-record master and its historical validators are unchanged. The final UI has 24 groups and 134 advanced choices. The nine main tabs and their seventeen promoted illustrated choices stay intact.

- Gould independently supports hairless blades, 8–15(20)-mm blade width, a truncate/ciliate membrane, extensive creeping rhizomes and variable hairless/fine-haired culm joints.
- Ordinary spikelet units pair a sessile bisexual spikelet with a pedicelled staminate or neuter spikelet. Branch ends can have one sessile spikelet plus TWO pedicelled companions. Spikelet count is not floret count.
- The sessile spikelet is mostly 4.5–5.5 mm. Its glumes are broad, leathery, nerveless and shiny except at the tip, hairy at least on their margins. The stalked partner is thinner and narrower, with more conspicuously veined glumes. These organ-specific choices never claim every glume has the same venation.
- The fertile sessile lemma may be awnless or bear a delicate geniculate, readily detached awn with a twisted lower portion, 1–1.5 mm. The usually staminate stalked spikelet is awnless. A new main `short_single` positive state is supported; the broader existing FNA long-awn path remains with its source disagreement.
- Gould and Diggs' 1–1.5-mm account and the existing FNA report to about 13 mm are preserved side by side. Existing conditional UT glume-venation and size reports also remain intact; Gould is the preferred source for the exact regional states. Unknown taxa are never excluded by these new positive states.
- Height 1–2 m (often shorter at unfavorable sites), panicle mostly 15–35 cm, grain 2–3 mm, 2n=40, historical distribution, flowering and safety context are retained in the supplement as non-filter source information. No grazing-safety, specimen or county-nativity finding is made.

Three Gould-based diagnostic checks are appended to Johnsongrass's Lab details at runtime. The source JSON profiles, images, credits, diagrams, arrows, admissions and taxonomy remain intact. The small generic loader refactor retains Virginia's exact schema/taxon/page validation and regression checks.

## Verification

The new Node test exercises all ten new states, exact organ and mm mappings, old source preservation, both node-hair variants, the newly documented short-single main path, the formerly unresolved book combination, one-point-per-group ranking, unchanged photographs and the Virginia regression. Existing unknown-safe, source, option and diagram checks pass.

Browser preview: open panicle, rhizome, membrane, short-single awn; broad hairless blade; ciliate/truncate ligule; ordinary pair/terminal triplet; distinct sessile/pedicelled glume details and awn states produced **1 supported match (Johnsongrass), 14 unresolved**. The nine reported advanced source conflicts concern other candidates, not Johnsongrass. All 169 remain accounted for across supported, unresolved and ruled-out groups. Desktop and mobile visitor sweeps now expect all 134 choices. Deployment is checked separately after merge.
