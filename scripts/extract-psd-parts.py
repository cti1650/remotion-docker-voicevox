#!/usr/bin/env python3
"""
PSDファイルからキャラクターパーツを抽出するスクリプト
坂本アヒル氏のずんだもん立ち絵素材に対応
"""

import os
import sys
import json
import re
from pathlib import Path
from psd_tools import PSDImage
from PIL import Image


def sanitize_name(name: str) -> str:
    """ファイル名として使用できるように文字を置換"""
    # 特殊文字を削除・置換
    name = name.replace("*", "").replace("!", "").replace("/", "_").replace("\\", "_")
    name = name.replace(" ", "_").replace("(", "_").replace(")", "_")
    name = name.replace("<", "").replace(">", "").replace(":", "_")
    name = re.sub(r'_+', '_', name)  # 連続アンダースコアを1つに
    name = name.strip("_")
    return name


def extract_layer_image(layer, psd_size):
    """レイヤーを透過PNG画像として取得（元のキャンバスサイズを維持）"""
    try:
        # レイヤーの生データを取得（非表示でも取得可能）
        layer_image = layer.topil()
        if layer_image is None:
            return None

        # RGBAに変換
        if layer_image.mode != 'RGBA':
            layer_image = layer_image.convert('RGBA')

        # 元のキャンバスサイズで透過画像を作成
        canvas = Image.new('RGBA', psd_size, (0, 0, 0, 0))

        # レイヤーの位置に貼り付け
        bbox = layer.bbox
        if bbox and bbox[2] > bbox[0] and bbox[3] > bbox[1]:
            canvas.paste(layer_image, (bbox[0], bbox[1]))

        return canvas
    except Exception as e:
        print(f"Warning: Could not extract layer: {e}")
        return None


def extract_all_layers(layer, output_dir: Path, psd_size, prefix: str = "", extract_hidden: bool = True):
    """すべてのレイヤーを抽出（非表示含む）"""
    name = sanitize_name(layer.name)
    full_name = f"{prefix}_{name}" if prefix else name

    if layer.is_group():
        # グループディレクトリを作成
        group_dir = output_dir / full_name
        group_dir.mkdir(parents=True, exist_ok=True)

        # 子レイヤーを処理
        for child in layer:
            extract_all_layers(child, group_dir, psd_size, "", extract_hidden)

        # グループ全体も合成して出力（visibleなもののみ）
        try:
            composite = layer.composite()
            if composite:
                canvas = Image.new('RGBA', psd_size, (0, 0, 0, 0))
                bbox = layer.bbox
                if bbox:
                    canvas.paste(composite, (bbox[0], bbox[1]))
                canvas.save(output_dir / f"{full_name}.png")
        except Exception:
            pass
    else:
        # 通常レイヤー（非表示でも抽出）
        if extract_hidden or layer.visible:
            try:
                image = extract_layer_image(layer, psd_size)
                if image:
                    image.save(output_dir / f"{full_name}.png")
            except Exception as e:
                print(f"Warning: Could not export {full_name}: {e}")


def analyze_psd(psd_path: str) -> dict:
    """PSDファイルの構造を解析"""
    psd = PSDImage.open(psd_path)

    def analyze_layer(layer, depth=0):
        info = {
            "name": layer.name,
            "sanitized_name": sanitize_name(layer.name),
            "visible": layer.visible,
            "kind": layer.kind,
            "bbox": list(layer.bbox) if hasattr(layer, 'bbox') else None,
        }

        if layer.is_group():
            info["children"] = [analyze_layer(child, depth + 1) for child in layer]

        return info

    structure = {
        "size": [psd.width, psd.height],
        "layers": [analyze_layer(layer) for layer in psd]
    }

    return structure


def extract_all_parts(psd_path: str, output_dir: str, extract_hidden: bool = True):
    """PSDから全パーツを抽出"""
    psd = PSDImage.open(psd_path)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    psd_size = (psd.width, psd.height)
    print(f"PSD Size: {psd.width}x{psd.height}")
    print(f"Extracting to: {output_path}")
    print(f"Extract hidden layers: {extract_hidden}")

    # 全体の合成画像
    composite = psd.composite()
    composite.save(output_path / "full_composite.png")
    print("Saved: full_composite.png")

    # 各レイヤーを抽出
    for layer in psd:
        extract_all_layers(layer, output_path, psd_size, "", extract_hidden)
        print(f"Processed: {layer.name}")

    # 構造情報を保存
    structure = analyze_psd(psd_path)
    with open(output_path / "structure.json", "w", encoding="utf-8") as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)
    print("Saved: structure.json")


def main():
    if len(sys.argv) < 2:
        print("Usage: extract-psd-parts.py <psd_file> [output_dir]")
        print("")
        print("Commands:")
        print("  extract <psd_file> [output_dir]  - Extract all parts as PNG")
        print("  analyze <psd_file>               - Show layer structure")
        print("")
        print("Options:")
        print("  --visible-only                   - Only extract visible layers")
        sys.exit(1)

    command = sys.argv[1]
    extract_hidden = "--visible-only" not in sys.argv

    if command == "analyze" and len(sys.argv) >= 3:
        psd_path = sys.argv[2]
        structure = analyze_psd(psd_path)
        print(json.dumps(structure, ensure_ascii=False, indent=2))

    elif command == "extract" and len(sys.argv) >= 3:
        psd_path = sys.argv[2]
        output_dir = sys.argv[3] if len(sys.argv) >= 4 and not sys.argv[3].startswith("--") else "assets/parts"
        extract_all_parts(psd_path, output_dir, extract_hidden)

    else:
        # デフォルトは抽出
        psd_path = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) >= 3 and not sys.argv[2].startswith("--") else "assets/parts"
        extract_all_parts(psd_path, output_dir, extract_hidden)


if __name__ == "__main__":
    main()
