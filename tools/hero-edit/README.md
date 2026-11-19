# Hero video edit (brand review 001)

`assets/video/hero-edit.mp4` (1280×720) and `hero-edit-mobile.mp4` (540×960 portrait) were built with these two scripts:

- `masks.py <W> <H> <fps> <outdir>` draws the transition masks: a diagonal wipe at the angle of the W's strokes, and a reveal through the W from the logo (`assets/img/w-mask.svg`).
- `edit.py <desktop|mobile> <out.mp4> [surf.mp4]` renders the shots (Mixkit stadium aerial and crowd, Uppbeat surf pool shots, three static Willis Hazell project images) and joins them with the masks. The optional third argument adds a surf shot.

Paths inside the scripts point at the builder's workspace; edit them before re-running. Stock clips: Mixkit (stadium aerial, crowd) and Uppbeat (surf pool aerial and surfer, by Spencer Frost, credited in the hero caption). They are not stored in the repo.

The hero's still images (`assets/img/hero-edit-poster.webp`, `hero-edit-mobile-frame.webp`) are the opening frame of each cut, and the loop ends on that frame.
