# Grass Lab batch helper

This helper prepares and checks Phase 4 batches. An assistant can operate the entire workflow; the owner does not need to download photos, run scripts, or build tools. It uses Node.js 22+ with no added packages. It never pushes GitHub changes, starts workflows, publishes media, or changes licensing.

## Source policy

Use *Illustrated Flora of North Central Texas* as the primary character reference. The owner provided the matching private PDF locally on 2026-11-11 (SHA-256 `9b9418075dbd1de0eefa43540b8b524a6fad64890a13a8e7ae2940f6a58db2fb`, 18,436,407 bytes). Do not commit the PDF or its plates. GrassBase remains secondary; defer deeper GrassBase analysis until requested. A visible photo feature does not establish a measurement, taxon identity, or anatomical attachment that cannot be resolved. BONAP audit remains deferred.

## Assistant workflow

Run from the repository or a private working directory. Substitute actual working paths; generated snapshots, images, HTML, reviews and proposals belong in local `work/`, never in a public commit. These are disposable batch inputs/outputs, not new project trackers or Photo Needs Queues.

```sh
node scripts/grass-photo-batch.mjs sync --out work/snapshot
node scripts/grass-photo-batch.mjs counts --snapshot work/snapshot/snapshot.json
node scripts/grass-photo-batch.mjs prepare --snapshot work/snapshot/snapshot.json --out work/batch-06 --species nassella-leucotricha,poa-arachnifera --limit 16
```

`sync` pins main, retrieves all nine Lab JSON files and the single existing tracker, and verifies Git blob hashes. `prepare` selects only unreviewed references, downloads with four concurrent workers, checks pinned photo hashes, reuses valid cached bytes, and writes `review.html`, `batch.json`, and a **PENDING** `review.json`. Both existing source-folder and `site/media` JPEG routes are supported. `--cache path/to/images` can reuse a previous local cache. Invalid/stale bytes are never accepted.

Open the labeled HTML overview and inspect each full-size original separately. HTML previews alone do not certify microscopic structures. Complete `review.json` with pass/date/reviewer, actual reference-use notes, seasonal coverage, and per-photo `opened_full_size`, `verdict`, `shows`, `cannot_verify`, and optional corrected `label`. Allowed new verdicts: `DIRECT_VISIBLE`, `PARTIAL_VISIBLE`. Use the source text only where actually consulted, and keep limitations explicit. The program validates the review declaration; it cannot independently establish that the reviewer looked at the image or that the botanical interpretation is correct.

Check winter/dormant relevance in each review. Inspect the remaining existing galleries and cleared archives before adding a truly missing seasonal view to the existing master Photo Needs Queue. This tool does not invent or add queue entries.

```sh
node scripts/grass-photo-batch.mjs validate --snapshot work/snapshot/snapshot.json --out work/batch-06
node scripts/grass-photo-batch.mjs stage --snapshot work/snapshot/snapshot.json --out work/batch-06
node --test scripts/grass-photo-batch.test.mjs
```

`validate` rejects missing observations, pending/unopened images, duplicate indices, changed credits, wrong target files, stale snapshot IDs, and altered image bytes. Existing `PARTIAL` and `PARTIAL_VISIBLE` both count as partial evidence. A zero-photo species never counts as a fully reviewed gallery.

`stage` writes a local `proposal.json` containing only the changed Lab species files and the existing `PROGRESS_TRACKER.md`, plus the expected main commit. It appends per-photo hash evidence, permits caption changes, preserves original images, credits, scientific traits, diagnostic checks and unrelated species, and recalculates the dashboard and batch entry. Original audit observations and tracker history are retained. It does not clear source licenses, source-preview holds, unmet-role text, taxonomy or deployment gates automatically; the assistant must reconcile stale pending notes narrowly when a batch resolves them.

Before saving a proposal: inspect its exact diff, confirm reference/seasonal statements, refresh main and shared work claims, and reject/rebase if main differs from `expected_head`. Commit the proposal's exact files with an expected-head check using the GitHub connector; then read back the files and verify their contents/counts. Do not upload the working directory or trigger a release. Report committed status separately from deployed status.

## Replay validation

```sh
node scripts/grass-photo-batch.mjs prepare --snapshot work/snapshot/snapshot.json --out work/pass5-replay --replay-pass PHASE4_PASS5 --limit 20 --cache work/images
```

Replay selects only previously recorded observations bearing that exact pass. Fill its review from those recorded observations, identify it explicitly as a replay, then run `validate`. It earns **zero** new hosted reviews; `stage` refuses replay batches. Do not represent replay as new visual inspection.

## Verified baseline, 2026-11-11

At main `7863fbe42027935b8d2d13807b20dcd4cd67f610`: 112 species, 53 genera, 514 photo references, 315 checks, 42 hosted reviews (26 direct / 16 partial), nine full initial Lab galleries. Eight Pass 5 JPEGs replayed with matching bytes and zero progress inflation. Counts are computed from records on every run, not hardcoded targets. Prepared work is not an anatomy, licensing or deployment certification.
