#!/usr/bin/env python3
"""
リップシンク用の母音口パーツを生成するスクリプト

PSDには「い」「う」に相当する口の絵が無いため、既存パーツを変形して作る。

  い (i.png) <- a.png（大きく開いた口）を横長・平たく変形
  う (u.png) <- o.png（縦長の丸口）を小さく平たく変形

rename-parts-to-english.py は出力先を毎回削除するため、
PSDから抽出し直した後は必ずこのスクリプトも実行すること。

  python3 scripts/rename-parts-to-english.py
  python3 scripts/generate-mouth-parts.py
"""

from pathlib import Path

from PIL import Image

BASE_DIR = Path("public/parts/zundamon_en")

# 対象の口ディレクトリ（正面向き・上向き）
MOUTH_DIRS = ["head_front/mouth", "head_up/mouth"]

# (元パーツ, 出力名, 横の縮小率, 縦の縮小率)
DERIVED_MOUTHS = [
    ("a.png", "i.png", 1.30, 0.47),   # 横に広く開いた口
    ("o.png", "u.png", 0.88, 0.65),   # 小さくすぼめた口
]


def derive_mouth(source: Path, output: Path, scale_x: float, scale_y: float) -> None:
    """元パーツを拡縮して口パーツを生成する"""
    src = Image.open(source).convert("RGBA")
    bbox = src.getbbox()

    if bbox is None:
        print(f"  SKIP (empty image): {source}")
        return

    crop = src.crop(bbox)
    new_size = (
        max(1, round(crop.width * scale_x)),
        max(1, round(crop.height * scale_y)),
    )
    resized = crop.resize(new_size, Image.LANCZOS)

    # 元の口の中心に合わせて全体キャンバスへ配置（顔の位置がずれないように）
    center_x = (bbox[0] + bbox[2]) / 2
    center_y = (bbox[1] + bbox[3]) / 2
    canvas = Image.new("RGBA", src.size, (0, 0, 0, 0))
    canvas.paste(
        resized,
        (round(center_x - new_size[0] / 2), round(center_y - new_size[1] / 2)),
        resized,
    )
    canvas.save(output)

    print(f"  {source.name} -> {output.name} ({new_size[0]}x{new_size[1]})")


def main() -> None:
    if not BASE_DIR.exists():
        print(f"Parts directory not found: {BASE_DIR}")
        print("Run scripts/rename-parts-to-english.py first.")
        return

    for mouth_dir in MOUTH_DIRS:
        target_dir = BASE_DIR / mouth_dir

        if not target_dir.exists():
            print(f"Skip (no directory): {target_dir}")
            continue

        print(f"Generating in {target_dir}")

        for source_name, output_name, scale_x, scale_y in DERIVED_MOUTHS:
            source = target_dir / source_name

            if not source.exists():
                print(f"  SKIP (no {source_name})")
                continue

            derive_mouth(source, target_dir / output_name, scale_x, scale_y)

    print()
    print("Done!")


if __name__ == "__main__":
    main()
