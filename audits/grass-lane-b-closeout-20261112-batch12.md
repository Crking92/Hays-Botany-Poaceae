# Hays Grass ID Lab — Scoring Lane B Batch 12: closeout, rooted annual bluegrass, unresolved visual semantics

Date: 2026-11-12
Issue: #70 — scored-character Lane B (exclusive scored files: `species-c2.json` and `species-c3.json`)
Scope: **one** scoring change in `species-c3.json` (*Poa annua*), new standalone regression, and this unique audit. No UI, CI, photo data, credits, candidate admissions, other lane shards or web publications changed.

## Source-backed missed false exclusion: Poa annua low rooted culms

**New conditional visual state:** `Poa annua.traits.habit: ['tuft','mat']` instead of only `['tuft']`. All existing head `airy/compact`, membrane ligule and no conspicuous awns retained.

The *actual* Lab question for `habit:mat` says **"Sprawling or mat-forming at the surface"**, and explicitly allows **"true stolons OR low decumbent culms that root at their nodes"**; it does **not** require a botanist to call every rooted culm a stolon.

**Evidence and preserved disagreement:**

1. **Highest-priority regional vegetative source:** Hagenbuch & Lemke (2015), *Grasses of the Texas Hill Country*, printed **p.59** (original PDF page image independently checked November 12): describes annual bluegrass as cespitose, **rhizomes and stolons absent**, with outermost culms of the clump decumbent. This remains the *usual* Hill Country field expression; `habit:tuft` remains mandatory to support.
   https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf
2. **Flora of North America, R. J. Soreng**, species account: `Poa annua` **densely tufted, sometimes stoloniferous**; culms may be prostrate to erect. The occasional outside-sample stolon state is not grounds to rewrite the regional description as generally stoloniferous.
   https://openherbarium.org/portal/taxa/index.php?clid=28&taxauthid=1&tid=236928
3. **Texas local cross-check, Williamson County:** A. C. Gibson and B. A. Prigge describe `Poa annua` as densely tufted with branches decumbent/spreading, **often rooting at the base** and producing adventitious roots at basal nodes. Such visible rooted low culms fit the Lab's `mat` answer even without a true stolon.
   https://w3.biosci.utexas.edu/prc/K12/pages/Poa%20annua.html

Thus a crew selecting "mat" for a spreading low *Poa annua* must not falsely remove it. The new state is conditional on what the **actual attached crown** shows. It is **not** permission to call pure underground rhizomes, and does not claim a new photographed Hays specimen or exact species identification.

## Additional closeout checks — leave uncertain states intact

- **Poa annua open versus compact panicle:** Regional Diggs (1999), printed p.1313, emphasizes typical small compact flowering heads. UT Austin Williamson County independently describes **open** terminal 70–95 × 28–65 mm arrays with 3–5 mm multi-flowered spikelets. Keep the existing `head:['airy','compact']` as broad conditional photo-observation choices. The "airy" UI phrase "cloud of tiny spikelets" is approximate for the taxon, so require a field photo and comparison before declaring the icon diagnostically reliable. No additional head state added.
- **Sorghum bicolor**: FNA documents **open to contracted** 5–60 cm panicles, with sessile spikelets **3–9 mm**. Keep `head:['airy','compact']` to avoid losing an open Sudangrass-type sample, but `airy` UI text "cloud of tiny spikelets" is a semantic mismatch for stout Sorghum; **Chat 1 owns this UI wording**, not Lane B. Do not delete a defensible scoring path merely to satisfy the current illustration.
  https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=237504
- **Dichanthelium commutatum**: Diggs (1999) under *Panicum divergens* reports an eastern / Lamar County occurrence. No authenticated Hays County voucher was established in this batch; absence of an easily found Hays record is **not evidence of absence**. Retain `range:UNRESOLVED`. Do not infer county-level BONAP nativity from statewide occurrence. For exact local admission, inspect a dated Hays voucher or correctly identified local specimen with collar/season photos.
- **Eragrostis trichodes** vs *E. secundiflora*: Hagenbuch & Lemke (2015) explicitly warns about vegetative overlap; do not fabricate a unique leaf-only score. Need mature matched panicle/spikelets. Existing images include institutional specimens with rights holds, not new cleared diagnostic macros.
- **Muhlenbergia lindheimeri**: early contracted and aging spreading panicles remain conditional; original single scored gallery image does not demonstrate either measured head stage.
- **Dichanthelium oligosanthes**: a winter rosette should leave `head` unanswered, never be forced to select `airy` without a spring/summer panicle.
- **Hordeum pusillum**: keep its true spike; require same-plant 3-spikelet node macro, not bristle-like false foxtail diagnosis.
- **Poa arachnifera**: remains tuft **and rhizome** capable, not automatically `mat` or stoloniferous; strict male/female flower differences need correctly sexed mature specimens.

## QA and release acceptance

New `scripts/test_grass_sprint_lane_b_batch12.cjs` exercises the **actual `currentResults()` production scorer**:
- 8 positive *Poa annua* paths, including rooted mat with airy and compact heads and unknown head/collar.
- 7 negative controls: rhizomes, hair-only/absent ligule, foxtail/paired-head forms and long awn/bristle false inclusions.
- Preserve unknown-states behavior, *Poa arachnifera* comparison and the sorghum open-head hold.
- Guard 112 scored + 57 provisional = 169 unique configured taxa and **514 original scored photo references unchanged**.

**Separate execution gates:** script was created for independent Node execution by coordinator; do **not** state it ran unless a literal Node run or CI log confirms it. Coordinator should run `node scripts/test_grass_sprint_lane_b_batch12.cjs`, the combined regression suite and desktop/mobile preview; merge only if green, then verify public Pages commit parity.

**Lane B first-pass species audit:** 24/24 source decisions recorded as of Batch 11, all earlier B PRs through #132 merged at the start of Batch 12. New Poa improvement proposed here. Source reconciliation and scoring closeout after this PR are nearly done; **specimen, county, rights and real field-device certification are separate incomplete gates**. Candidate inventory remains 57 unadmitted; no separate tracker spreadsheet created.
