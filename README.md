# PSU-GS project demo — current release

Static academic project page for **PSU-GS: Perceptual Surface Unit Guided Gaussian Splatting for In-the-Wild Reconstruction**.

## Run locally

From the repository root:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/demo/>.

No build step or external JavaScript dependency is required.

You can also open `demo/index.html` directly. Scene images load as ordinary image
elements, while the small selection maps are bundled in `embedded-editor-assets.js`
so material picking works under browsers that restrict local `file://` Canvas access.
If the region maps change, regenerate the bundle:

```bash
python demo/generate_material_region_maps.py
python demo/generate_embedded_editor_assets.py
```

## Included interactions

- Six same-view WildGaussians / PSU-GS drag comparisons across Brandenburg Gate, Sacré-Cœur, and Trevi Fountain.
- Illumination editing on three scenes with `t ∈ [0, 1]`, UI step `0.01`.
- Physical material editing on three scenes with `t ∈ [-1, 1]`, UI step `0.01`, four audited PSU masks per scene, and a Selection → Lock → Edit → Unlock workflow.
- Twelve-image visual atlas and expandable method figure.

The illumination UI interpolates between frozen pre-rendered anchor results. It does not claim that browser-interpolated substeps are separately evaluated model renders.

Material click maps are recovered from the audited `selection.png` and matching
`original.png` pairs by `generate_material_region_maps.py`. Material appearance is
driven only by the repository's frozen-model Reduced / Original / Enhanced renders;
the browser applies no color or material filter. Intermediate slider positions blend
the neighboring real endpoint renders and are labeled accordingly. Exact model output
at every `0.01` position would require a 201-frame render sweep for every PSU.

The repository currently contains four audited, rendered PSUs for each scene. The demo
does not inflate that number with synthetic subdivisions. Expanding to 20 meaningful
regions per scene requires selecting additional audited UIDs and rendering their
Selection / Reduced / Original / Enhanced (or full 201-frame) assets from the frozen
checkpoint first.

## Asset provenance

- Comparison images: `our_paper/MIO-GS SOTA/{baseline,v29}`.
- Editing images: `applications/control_demo`.
- Framework: `our_paper/framework_main_20260915/framework_main.png`.
- Paper main figure selected by the authors: `assets/figures/method-main.png`.
- Audited PSU click maps: `assets/regions/*/region-map.png`, recovered from the real selection renders.

All displayed research results are copied from the repository; no synthetic replacement images are used.
