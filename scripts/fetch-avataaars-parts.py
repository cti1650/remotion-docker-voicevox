#!/usr/bin/env python3
"""Avataaars（DiceBear経由）からキャラクターのパーツを取り出す

口・目・眉が独立したSVGの層になるので、リップシンク・瞬き・表情がすべて動く。

  python3 scripts/fetch-avataaars-parts.py --name presenter

仕組み:
  DiceBearが返すSVGは <g> が固定の順で並んでいる。
  1つのオプションだけを変えたSVGと見比べて「どの<g>が口・目・眉か」を特定し、
  同じviewBoxのまま層ごとに切り出す。位置合わせは元のtransformがそのまま効く。

ライセンス: Avataaars (Pablo Stanley) — public/parts/<name>/CREDITS.md を参照
"""

import argparse
import json
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
NS = f"{{{SVG_NS}}}"
API = "https://api.dicebear.com/9.x/avataaars/svg"

# 見た目の固定部分。キャラクターの印象はここで決まる
APPEARANCE = {
    "seed": "presenter",
    "flip": "false",
    "top": "shortFlat",
    "hairColor": "2c1b18",
    "clothing": "blazerAndShirt",
    "clothesColor": "3c4f5c",
    "skinColor": "edb98a",
    "facialHairProbability": "0",
    "accessoriesProbability": "0",
}

# 母音キー → avataaarsの口の形
MOUTH_MAP = {
    "a": "screamOpen",   # 大きく開いた口
    "i": "grimace",      # 横に広い口
    "u": "disbelief",    # 小さくすぼめた口
    "e": "smile",        # 半開きの口
    "o": "default",      # 縦に丸い口
    "n": "serious",      # 一文字の口
    "closed": "twinkle", # 閉じた口（無音のときの顔）
}

# 表情プリセット → 目と眉
EMOTIONS = {
    "normal":    {"eye": "default",   "eyebrow": "default"},
    "happy":     {"eye": "happy",     "eyebrow": "raisedExcited"},
    "sad":       {"eye": "cry",       "eyebrow": "sadConcerned"},
    "angry":     {"eye": "squint",    "eyebrow": "angry"},
    "surprised": {"eye": "surprised", "eyebrow": "raisedExcitedNatural"},
    "thinking":  {"eye": "side",      "eyebrow": "upDownNatural"},
    "smug":      {"eye": "wink",      "eyebrow": "upDown"},
    "tired":     {"eye": "squint",    "eyebrow": "sadConcernedNatural"},
}

BLINK_EYE = "closed"   # 瞬きに使う目

# 1920x1080の動画で右寄りに立たせたときの見え方
VIDEO_WIDTH, VIDEO_HEIGHT = 1920, 1080
TARGET_HEIGHT = 780     # 見た目の高さ
TARGET_BOTTOM = 1080    # 見た目の下端（肩を画面下で切る）
TARGET_CENTER_X = 1500  # 見た目の中心（右寄り。左はテロップとスライドの場所）


def fetch(**overrides):
    params = dict(APPEARANCE)
    params.update(overrides)
    url = f"{API}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as res:
        return res.read()


def parse_children(raw):
    """<svg><g mask><g transform> の中の子要素を順番に返す"""
    root = ET.fromstring(raw)
    outer = root.find(f"{NS}g")
    inner = outer.find(f"{NS}g")
    view_box = root.get("viewBox", "0 0 280 280")
    return inner.get("transform", ""), view_box, list(inner)


def find_slot_indices(base_children, defaults):
    """オプションを1つずつ変えて、どの子要素が変わるかで層を特定する"""
    indices = {}
    for slot, (option, other) in {
        "mouth": ("mouth", "serious" if defaults["mouth"] != "serious" else "smile"),
        "eye": ("eyes", "closed" if defaults["eyes"] != "closed" else "default"),
        "eyebrow": ("eyebrows", "angry" if defaults["eyebrows"] != "angry" else "default"),
    }.items():
        probe = dict(defaults)
        probe[option] = other
        _, _, children = parse_children(fetch(**probe))
        if len(children) != len(base_children):
            print(f"ERROR: {slot} を変えたら層の数が変わりました（想定外のSVG構造）")
            sys.exit(1)
        changed = [
            i for i, (a, b) in enumerate(zip(base_children, children))
            if ET.tostring(a) != ET.tostring(b)
        ]
        if len(changed) != 1:
            print(f"ERROR: {slot} に対応する層を特定できません（変化した層: {changed}）")
            sys.exit(1)
        indices[slot] = changed[0]
    return indices


def write_svg(path, transform, view_box, elements):
    """同じviewBoxとtransformで包んで書き出す（層どうしがぴったり重なる）"""
    svg = ET.Element(f"{NS}svg", {"viewBox": view_box, "fill": "none"})
    group = ET.SubElement(svg, f"{NS}g")
    if transform:
        group.set("transform", transform)
    for el in elements:
        group.append(el)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(ET.tostring(svg, encoding="utf-8", xml_declaration=False))


def build_placement(width, height):
    """立ち絵の原寸から本編での置き場所を逆算する（create-character.pyと同じ式）"""
    scale = TARGET_HEIGHT / height
    return {
        "scale": round(scale, 4),
        "offsetX": round(TARGET_CENTER_X - width / 2
                         - (VIDEO_WIDTH - width * scale) / 2, 1),
        "offsetY": round(height - (TARGET_BOTTOM - VIDEO_HEIGHT + TARGET_HEIGHT), 1),
    }


CREDITS = """# {display_name} の素材クレジット

## 出典

- 名称: Avataaars
- 作者: Pablo Stanley (https://avataaars.com/)
- 取得元: DiceBear (https://www.dicebear.com/styles/avataaars/) の API
- リファレンス実装: https://github.com/fangpenlin/avataaars

## ライセンス

作者による表記は「Free for personal and commercial use」。
リファレンス実装 (fangpenlin/avataaars) は **MIT License** で公開されており、
再配布が明示的に許可されている。本リポジトリはそのライセンス表記を下記に同梱した上で
パーツをコミットしている。

```
MIT License

Copyright (c) 2017 Pablo Stanley, Fang-Pen Lin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 再生成

```bash
python3 scripts/fetch-avataaars-parts.py --name {name}
```

見た目（髪型・服・肌の色）はスクリプトの `APPEARANCE` で変えられる。
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--name", default="presenter", help="キャラクターID")
    parser.add_argument("--display-name", default="プレゼンター", help="表示名")
    parser.add_argument("--speaker-id", type=int, default=3, help="VOICEVOXの話者ID")
    parser.add_argument("--pitch", type=float, help="音高 -0.15〜0.15")
    args = parser.parse_args()

    defaults = {"mouth": MOUTH_MAP["closed"],
                "eyes": EMOTIONS["normal"]["eye"],
                "eyebrows": EMOTIONS["normal"]["eyebrow"]}

    print("==> ベースのSVGを取得...")
    transform, view_box, base_children = parse_children(fetch(**defaults))
    width, height = [float(v) for v in view_box.split()[2:]]

    print("==> 口・目・眉の層を特定...")
    slots = find_slot_indices(base_children, defaults)
    print(f"    {slots}（子要素 {len(base_children)} 個中）")

    parts_dir = Path("public/parts") / args.name
    # 出力先を作り直す（前回の残りが混ざらないように）
    if parts_dir.exists():
        for old in sorted(parts_dir.rglob("*"), reverse=True):
            old.unlink() if old.is_file() else old.rmdir()

    # 層を元の重ね順のまま書き出す。可変の層は差し替え、それ以外はまとめて1枚にする
    layers = []
    static_group = []
    static_count = 0
    slot_by_index = {i: slot for slot, i in slots.items()}

    def flush_static():
        nonlocal static_count, static_group
        if not static_group:
            return
        name = f"static/{static_count}.svg"
        write_svg(parts_dir / name, transform, view_box, static_group)
        layers.append({"file": name})
        static_count += 1
        static_group = []

    for i, child in enumerate(base_children):
        slot = slot_by_index.get(i)
        if slot is None:
            static_group.append(child)
            continue
        flush_static()
        layers.append({"dir": slot, "slot": slot})
    flush_static()

    print(f"==> 固定の層を {static_count} 枚書き出し")

    # 差し替える層（口・目・眉）を1つずつ取得する
    def dump_variants(slot, option, values):
        for value in sorted(set(values)):
            probe = dict(defaults)
            probe[option] = value
            _, _, children = parse_children(fetch(**probe))
            write_svg(parts_dir / slot / f"{value}.svg", transform, view_box,
                      [children[slots[slot]]])
        print(f"==> {slot}: {len(set(values))} 種類")

    dump_variants("mouth", "mouth", MOUTH_MAP.values())
    dump_variants("eye", "eyes", [e["eye"] for e in EMOTIONS.values()] + [BLINK_EYE])
    dump_variants("eyebrow", "eyebrows", [e["eyebrow"] for e in EMOTIONS.values()])

    voice = {"defaultSpeakerId": args.speaker_id}
    if args.pitch is not None:
        voice["pitchScale"] = args.pitch

    definition = {
        "name": args.name,
        "displayName": args.display_name,
        "art": {
            "basePath": f"parts/{args.name}",
            "ext": "svg",
            "width": int(width),
            "height": int(height),
            "layers": layers,
        },
        "placement": build_placement(width, height),
        "defaultSlots": {
            "mouth": MOUTH_MAP["closed"],
            "eye": EMOTIONS["normal"]["eye"],
            "eyebrow": EMOTIONS["normal"]["eyebrow"],
        },
        "emotions": EMOTIONS,
        "blink": {"slot": "eye", "closed": BLINK_EYE},
        "mouthSlot": "mouth",
        "mouthMap": dict(MOUTH_MAP, smile=MOUTH_MAP["i"]),  # smileは旧JSON互換
        "voice": voice,
        "credits": [f"VOICEVOX（話者ID: {args.speaker_id}）",
                    "立ち絵: Avataaars by Pablo Stanley (MIT)"],
    }

    char_dir = Path("src/characters") / args.name
    char_dir.mkdir(parents=True, exist_ok=True)
    with open(char_dir / "character.json", "w", encoding="utf-8") as f:
        json.dump(definition, f, ensure_ascii=False, indent=2)
        f.write("\n")

    (parts_dir / "CREDITS.md").write_text(
        CREDITS.format(display_name=args.display_name, name=args.name), encoding="utf-8")

    print()
    print(f"作成しました: {parts_dir}/ と {char_dir}/character.json")
    print(f"src/characters/registry.ts に {args.name} を登録してください")


if __name__ == "__main__":
    main()
