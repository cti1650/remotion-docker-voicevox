---
name: parts
description: キャラクターパーツ画像の管理ルール。英語命名、口マッピング（むふ=closed）、PSD抽出時のtopil()使用。
---

# パーツ管理ルール

## 命名規則

- 英語名のみ使用（日本語はURLエンコーディング問題）
- 小文字・アンダースコア: `cheek_normal.png`

## 口マッピング（重要）

リップシンクで使う母音パーツは`a`/`i`/`u`/`e`/`o`に統一されている。
ただし**`i`と`u`はPSDに該当する絵が無く、生成した派生パーツ**。

| ファイル名 | 由来 | 形 |
|-----------|------|-----|
| a | ほあ | 大きく開いた口 |
| i | **a.pngから生成** | 横に広く薄く開いた口 |
| u | **o.pngから生成** | 小さくすぼめた口 |
| e | えへ | 半開きの口 |
| o | お | 縦長の丸口 |
| n | ん | 小さい線 |
| closed | むふ | 閉じた口（無音・促音） |

**注意**: PSDのレイヤー名は母音の呼称と一致しない。
`ほう`は「う」の口ではなく上辺が平らな大きく四角い口のため`square`に改名済み。

## 派生パーツ

PSDに「い」「う」の口が無いため、既存パーツを変形して生成する。

```bash
python3 scripts/generate-mouth-parts.py
```

縮小率は`scripts/generate-mouth-parts.py`の`DERIVED_MOUTHS`で調整する。

**重要**: `rename-parts-to-english.py`は出力先ディレクトリを毎回削除するため、
PSDから抽出し直したら必ずこのスクリプトも実行する。

## PSD抽出

`layer.topil()`を使用（`composite()`は非表示レイヤーで空画像）

```bash
python3 scripts/rename-parts-to-english.py
python3 scripts/generate-mouth-parts.py   # 派生パーツの再生成（必須）
```

## 構造

```
public/parts/zundamon_en/
├── body.png
├── head_front/
│   ├── eye/
│   └── mouth/
```
