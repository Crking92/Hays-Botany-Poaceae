# Poaceae automatic photo intake

Grass lessons use individual photo **panels** and annotated anatomy, rather than the other families' `verified_photos` gallery. Upload each cleared new grass image to `main/photo-intake/approved/<species-id>/photo.jpg` and its matching `photo.jpg.json`. The approved-photo workflow validates the existing grass ID, photo bytes, source-rights information and named reviewer evidence, then **appends** a new source-credited panel and updates both grass indexes. All prior panels, arrows, and text remain unchanged.

Sidecar fields follow [the common family upload schema](https://github.com/Crking92/Hays-Botany-Fabaceae/blob/main/photo-intake/README.md); the optional `caption` can describe what is visibly present. Automatic panels contain NO new anatomical arrows—those require reliable image locations, not guesses.

**Public GitHub history warning:** only upload images with actual verified public reuse rights. There is no automatic license grant or confirmed species determination from a filename. Unknown-rights photos must not be committed. New species still require a separate source/release step before photo intake.
