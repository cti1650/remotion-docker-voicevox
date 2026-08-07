#!/usr/bin/env python3
"""静止画1枚からリップシンク対応のキャラクターを作る

立ち絵のPNGと「口の位置」を渡すと、口パーツを生成して
public/parts/<name>/ と src/characters/<name>/character.json を書き出す。

  python3 scripts/create-character.py assets/characters/simple.png \
      --name simple --display-name "しんぷるくん" \
      --mouth 250,470,110,70 --speaker-id 3

仕組み:
  1. 元画像の口の位置を、周囲の色で塗りつぶして body.png にする
     （元の絵に描かれている口を消して、口パーツと二重に見えないようにする）
  2. 同じサイズの透明画像に母音ごとの口を描いて mouth/*.png にする

塗りつぶしは周囲が単色に近い（イラスト調の）絵を前提にしている。
うまく消えないときは --keep-mouth を付けて、口の無い絵を用意する。
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow が必要です: pip install Pillow")
    sys.exit(1)


# 母音ごとの口の形。値は口ボックスに対する (幅の割合, 高さの割合, 形)
# 形は ellipse（開いた口）か line（閉じた口）
MOUTH_SHAPES = {
    "a": (0.75, 0.95, "ellipse"),
    "i": (0.95, 0.30, "ellipse"),
    "u": (0.45, 0.55, "ellipse"),
    "e": (0.80, 0.55, "ellipse"),
    "o": (0.60, 0.90, "ellipse"),
    "n": (0.50, 0.12, "line"),
    "closed": (0.70, 0.10, "line"),
}


def parse_box(value):
    parts = value.split(",")
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("--mouth は x,y,幅,高さ の形式で指定してください")
    try:
        return tuple(int(p) for p in parts)
    except ValueError:
        raise argparse.ArgumentTypeError("--mouth は整数で指定してください")


def parse_color(value):
    """#RRGGBB を (r, g, b, a) にする"""
    v = value.lstrip("#")
    if len(v) != 6:
        raise argparse.ArgumentTypeError("色は #RRGGBB で指定してください")
    return tuple(int(v[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def surrounding_color(image, box, margin=6):
    """口ボックスの外周をぐるっと見て、いちばん多い色を返す

    口を消すときの塗りつぶし色に使う。周囲が透明なら透明を返す。
    """
    x, y, w, h = box
    counts = {}

    def sample(px, py):
        if 0 <= px < image.width and 0 <= py < image.height:
            pixel = image.getpixel((px, py))
            counts[pixel] = counts.get(pixel, 0) + 1

    for px in range(x - margin, x + w + margin):
        sample(px, y - margin)
        sample(px, y + h + margin)
    for py in range(y - margin, y + h + margin):
        sample(x - margin, py)
        sample(x + w + margin, py)

    if not counts:
        return (0, 0, 0, 0)
    return max(counts.items(), key=lambda kv: kv[1])[0]


def build_body(source, box, keep_mouth):
    """元画像から body.png を作る（口の位置を周囲の色で塗る）"""
    body = source.copy()
    if keep_mouth:
        return body

    fill = surrounding_color(body, box)
    x, y, w, h = box
    draw = ImageDraw.Draw(body)
    # 角を丸めて塗ると、輪郭線の内側になじみやすい
    draw.rounded_rectangle(
        [x, y, x + w, y + h],
        radius=max(2, min(w, h) // 3),
        fill=fill,
    )
    return body


def build_mouth(size, box, name, color):
    """母音1つ分の口パーツ（元画像と同じサイズの透明画像）を作る"""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    x, y, w, h = box
    cx, cy = x + w / 2, y + h / 2
    ratio_w, ratio_h, shape = MOUTH_SHAPES[name]

    half_w = w * ratio_w / 2
    half_h = max(1.5, h * ratio_h / 2)
    bounds = [cx - half_w, cy - half_h, cx + half_w, cy + half_h]

    if shape == "line":
        draw.rounded_rectangle(bounds, radius=half_h, fill=color)
    else:
        draw.ellipse(bounds, fill=color)

    return layer


# 1920x1080の動画で、画面右寄りに立たせたときの見え方の目安
VIDEO_WIDTH, VIDEO_HEIGHT = 1920, 1080
TARGET_HEIGHT = 800    # 見た目の高さ
TARGET_BOTTOM = 1050   # 見た目の下端（画面下から30px上）
TARGET_CENTER_X = 1500 # 見た目の中心（右寄り。左側はテロップとスライドの場所）


def build_placement(size):
    """立ち絵の原寸から、本編での置き場所を逆算する

    src/characters/types.ts の CharacterPlacement と同じ式を解いている。
    実際の見え方を見て character.json を手で調整してもよい。
    """
    width, height = size
    scale = TARGET_HEIGHT / height
    offset_y = height - (TARGET_BOTTOM - VIDEO_HEIGHT + TARGET_HEIGHT)
    offset_x = TARGET_CENTER_X - width / 2 - (VIDEO_WIDTH - width * scale) / 2
    return {
        "scale": round(scale, 4),
        "offsetX": round(offset_x, 1),
        "offsetY": round(offset_y, 1),
    }


def build_voice(speaker_id, pitch, speed, intonation):
    """声の設定。既定値と同じものは書かない（character.jsonを短く保つ）"""
    voice = {"defaultSpeakerId": speaker_id}
    for key, value, default in (
        ("pitchScale", pitch, 0.0),
        ("speedScale", speed, 1.0),
        ("intonationScale", intonation, 1.0),
    ):
        if value is not None and value != default:
            voice[key] = value
    return voice


def build_definition(name, display_name, size, speaker_id, credits, voice):
    width, height = size
    return {
        "name": name,
        "displayName": display_name,
        "art": {
            "basePath": f"parts/{name}",
            "width": width,
            "height": height,
            "layers": [
                {"file": "body.png"},
                {"dir": "mouth", "slot": "mouth"},
            ],
        },
        "placement": build_placement(size),
        "defaultSlots": {"mouth": "closed"},
        # 表情パーツを持たないので空。全ての表情が既定の見た目になる
        "emotions": {},
        "mouthSlot": "mouth",
        "mouthMap": {
            "a": "a", "i": "i", "u": "u", "e": "e", "o": "o",
            "n": "n", "closed": "closed",
            # 旧JSON互換（「い」がsmileで記録されていた時期のデータ用）
            "smile": "i",
        },
        "voice": voice,
        "credits": credits,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image", help="立ち絵のPNG（背景透過を推奨）")
    parser.add_argument("--name", required=True, help="キャラクターID（英小文字）")
    parser.add_argument("--display-name", help="表示名（省略時は--nameと同じ）")
    parser.add_argument("--mouth", required=True, type=parse_box,
                        help="口の位置 x,y,幅,高さ（元画像のピクセル座標）")
    parser.add_argument("--speaker-id", type=int, default=3,
                        help="VOICEVOXの話者ID（既定: 3 = ずんだもんノーマル）")
    parser.add_argument("--pitch", type=float,
                        help="音高 -0.15〜0.15（既定0）。上げると高い声になる")
    parser.add_argument("--speed", type=float,
                        help="話速 0.5〜2.0（既定1.0）")
    parser.add_argument("--intonation", type=float,
                        help="抑揚 0〜2.0（既定1.0）")
    parser.add_argument("--mouth-color", type=parse_color, default=parse_color("#5a2a35"),
                        help="口の色 #RRGGBB（既定: #5a2a35）")
    parser.add_argument("--credit", action="append", default=[],
                        help="クレジット表記（複数回指定できる）")
    parser.add_argument("--keep-mouth", action="store_true",
                        help="元画像の口を消さない（口の無い絵を渡すとき）")
    args = parser.parse_args()

    source_path = Path(args.image)
    if not source_path.is_file():
        print(f"ERROR: 画像が見つかりません: {source_path}")
        sys.exit(1)

    source = Image.open(source_path).convert("RGBA")

    x, y, w, h = args.mouth
    if w <= 0 or h <= 0:
        print("ERROR: --mouth の幅・高さは1以上にしてください")
        sys.exit(1)
    if x < 0 or y < 0 or x + w > source.width or y + h > source.height:
        print(f"ERROR: --mouth が画像({source.width}x{source.height})からはみ出しています")
        sys.exit(1)

    name = args.name
    display_name = args.display_name or name

    parts_dir = Path("public/parts") / name
    mouth_dir = parts_dir / "mouth"
    mouth_dir.mkdir(parents=True, exist_ok=True)

    build_body(source, args.mouth, args.keep_mouth).save(parts_dir / "body.png")
    for vowel in MOUTH_SHAPES:
        build_mouth(source.size, args.mouth, vowel, args.mouth_color).save(
            mouth_dir / f"{vowel}.png")

    credits = args.credit or [f"VOICEVOX（話者ID: {args.speaker_id}）"]
    voice = build_voice(args.speaker_id, args.pitch, args.speed, args.intonation)
    definition = build_definition(name, display_name, source.size,
                                  args.speaker_id, credits, voice)

    char_dir = Path("src/characters") / name
    char_dir.mkdir(parents=True, exist_ok=True)
    definition_path = char_dir / "character.json"
    with open(definition_path, "w", encoding="utf-8") as f:
        json.dump(definition, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"作成しました:")
    print(f"  {parts_dir}/body.png")
    print(f"  {mouth_dir}/*.png ({len(MOUTH_SHAPES)}種類)")
    print(f"  {definition_path}")
    print()
    print("次の2ステップで使えるようになります:")
    print(f"  1. src/characters/index.ts に登録する")
    print(f'       import * as {name}Json from "./{name}/character.json";')
    print(f"       CHARACTERS に {name}: {name}Json as unknown as CharacterDefinition,")
    print(f"  2. シーンYAMLに character: {name} と書く")


if __name__ == "__main__":
    main()
