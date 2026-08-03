#!/usr/bin/env python3
"""
日本語ファイル名を英語に変換するスクリプト
"""

import os
import shutil
from pathlib import Path

# 日本語→英語のマッピング
NAME_MAP = {
    # ディレクトリ
    "頭_正面向き": "head_front",
    "頭_上向き": "head_up",
    "右腕": "arm_right",
    "左腕": "arm_left",
    "枝豆": "edamame",
    "顔色": "face_color",
    "口": "mouth",
    "目": "eye",
    "眉": "eyebrow",

    # 体パーツ
    "体": "body",
    "頭": "head",
    "尻尾のような何か": "tail",

    # 腕ポーズ
    "腰": "waist",
    "基本": "default",
    "横": "side",
    "手を挙げる": "raise_hand",
    "指差し横": "point_side",
    "指差し上": "point_up",
    "チョップ": "chop",
    "口元": "near_mouth",
    "腕組み_右腕は非表示に": "cross_arms",
    "あごに指": "finger_chin",
    "非表示": "hidden",

    # 枝豆
    "枝豆通常": "normal",
    "枝豆立ち": "standing",
    "枝豆立ち片折れ": "standing_bent",
    "枝豆萎え": "wilted",

    # 顔色
    "ほっぺ基本": "cheek_normal",
    "ほっぺ赤め": "cheek_red",
    "赤面": "blush",
    "青ざめ": "pale",
    "かげり": "shadow",

    # 目
    "基本目": "normal",
    "基本目↑": "normal_up",
    "基本目←": "normal_left",
    "基本目→": "normal_right",
    "基本目2": "normal2",
    "基本目2↑": "normal2_up",
    "基本目2←": "normal2_left",
    "基本目2→": "normal2_right",
    "ジト目": "jitome",
    "ジト目←": "jitome_left",
    "ジト目→": "jitome_right",
    "ジト目2": "jitome2",
    "ジト目2←": "jitome2_left",
    "ジト目2→": "jitome2_right",
    "細め目": "narrow",
    "細め目ハート": "narrow_heart",
    "閉じ目": "closed",
    "にっこり": "smile",
    "UU": "uu",
    "^^": "happy",
    "なごみ目": "relaxed",
    "〇〇": "circle",
    "普通目": "normal",
    "普通目↑": "normal_up",
    "普通目2": "normal2",
    "普通目2↑": "normal2_up",
    "><": "xeyes",

    # 口
    "ほう": "square",  # 上辺が平らな大きく四角い口（母音の「う」ではない）
    "ほあ": "a",
    "ほあー": "aa",
    "むふ": "closed",  # 閉じた口
    "えへ": "e",
    "あは": "aha",
    "ほほえみ": "smile",
    "にやり": "smirk",
    "ん": "n",
    "んー": "nn",
    "んえー": "ne",
    "お": "o",
    "Δ": "triangle",
    "うわー": "uwaa",
    "むくー": "muku",
    "うへえ": "uhee",
    "うへー": "uhee",

    # 眉
    "基本眉": "normal",
    "基本眉2": "normal2",
    "怒り眉": "angry",
    "怒り眉2": "angry2",
    "上がり眉": "raised",
    "困り眉": "troubled",

    # その他
    "汗": "sweat",
    "汗多め": "sweat_heavy",
    "涙": "tears",
    "下眼瞼": "lower_eyelid",
}


def get_english_name(jp_name: str) -> str:
    """日本語名を英語名に変換"""
    # 拡張子を分離
    base, ext = os.path.splitext(jp_name)

    # マッピングを検索
    if base in NAME_MAP:
        return NAME_MAP[base] + ext

    # 見つからない場合はそのまま
    return jp_name


def rename_recursive(src_dir: Path, dst_dir: Path):
    """ディレクトリを再帰的にリネーム"""
    dst_dir.mkdir(parents=True, exist_ok=True)

    for item in src_dir.iterdir():
        new_name = get_english_name(item.name)
        dst_path = dst_dir / new_name

        if item.is_dir():
            rename_recursive(item, dst_path)
        else:
            shutil.copy2(item, dst_path)
            print(f"  {item.name} -> {new_name}")


def main():
    src = Path("public/parts/zundamon")
    dst = Path("public/parts/zundamon_en")

    if not src.exists():
        print(f"Source directory not found: {src}")
        return

    print(f"Converting: {src} -> {dst}")
    print()

    # 既存の出力ディレクトリを削除
    if dst.exists():
        shutil.rmtree(dst)

    rename_recursive(src, dst)

    print()
    print(f"Done! Output: {dst}")


if __name__ == "__main__":
    main()
