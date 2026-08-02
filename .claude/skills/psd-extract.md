---
name: psd-extract
description: |
  PSDファイルからキャラクターパーツを抽出するスキル。
  トリガー: 「PSDからパーツを抽出して」「立ち絵を分解して」
  psd-toolsを使用し、layer.topil()で抽出→英語名に変換。
---

# PSDパーツ抽出

## 前提条件

```bash
pip install psd-tools pillow
```

## 抽出手順

```bash
# 1. パーツ抽出
python3 scripts/extract-psd-parts.py assets/<file>.psd public/parts/<name>

# 2. 英語名変換
python3 scripts/rename-parts-to-english.py

# 3. 日本語版削除
rm -rf public/parts/<name>
```

## 重要: topil()を使用

```python
# NG - 非表示レイヤーで空画像になる
layer_image = layer.composite()

# OK
layer_image = layer.topil()
```

## 出力構造

```
public/parts/zundamon_en/
├── body.png
├── tail.png
├── head_front/
│   ├── eye/
│   │   ├── normal.png
│   │   └── closed.png
│   └── mouth/
│       ├── closed.png  (むふ)
│       ├── a.png       (ほあ)
│       └── u.png       (ほう)
```

## 命名マッピング（口）

| 日本語 | 英語 |
|--------|------|
| むふ | closed |
| ほう | u |
| ほあ | a |
| お | o |

完全なマッピングは`scripts/rename-parts-to-english.py`参照。
