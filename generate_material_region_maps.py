#!/usr/bin/env python3
"""Build click maps from the audited PSU selection renders.

Each selection image is a visualization of one real surface unit.  The mask is
recovered by comparing that image with its matching original render.  No
synthetic segmentation or geometric grid is used.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parent
UNITS = {
    "Brandenburg": [62, 19, 76, 12],
    "Sacre": [205, 109, 171, 58],
    "Trevi": [159, 35, 101, 19],
}


def main() -> None:
    for scene, uids in UNITS.items():
        scores = []
        for uid in uids:
            folder = ROOT / "assets" / "material" / scene / f"uid_{uid}"
            original = np.asarray(Image.open(folder / "original.png").convert("RGB"), dtype=np.int16)
            selection = np.asarray(Image.open(folder / "selection.png").convert("RGB"), dtype=np.int16)
            difference = np.max(np.abs(selection - original), axis=2).astype(np.float32)
            scale = max(float(np.percentile(difference[difference > 10], 99)), 1.0)
            components, count = ndimage.label(difference > 10)
            if count == 0:
                raise RuntimeError(f"{scene} UID {uid}: empty audited selection mask")
            sizes = np.bincount(components.ravel())
            sizes[0] = 0
            support = components == int(np.argmax(sizes))
            support = ndimage.binary_closing(support, iterations=1)
            support = ndimage.binary_fill_holes(support)
            scores.append(np.where(support, np.maximum(difference / scale, 0.1), 0.0))

        stacked = np.stack(scores)
        strongest = np.argmax(stacked, axis=0)
        confidence = np.max(stacked, axis=0)
        labels = np.where(confidence > 0, strongest + 1, 0).astype(np.uint8)

        output = ROOT / "assets" / "regions" / scene / "region-map.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(labels, mode="L").save(output, optimize=True)
        areas = [round(float((labels == index).mean() * 100), 2) for index in range(1, len(uids) + 1)]
        print(f"{scene}: real UIDs {uids}; click-map areas {areas}%")


if __name__ == "__main__":
    main()
