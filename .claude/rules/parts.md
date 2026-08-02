---
name: parts
description: キャラクターパーツ画像の管理ルール。英語命名、口マッピング（むふ=closed）、PSD抽出時のtopil()使用。
---

# パーツ管理ルール

## 命名規則

- 英語名のみ使用（日本語はURLエンコーディング問題）
- 小文字・アンダースコア: `cheek_normal.png`

## 口マッピング（重要）

| 日本語 | 英語 | 説明 |
|--------|------|------|
| むふ | closed | 閉じた口 |
| ほう | u | すぼめた口 |
| ほあ | a | 開いた口 |
| お | o | 丸い口 |

**注意**: `ほう`は「閉じた口」ではなく「すぼめた口」

## PSD抽出

`layer.topil()`を使用（`composite()`は非表示レイヤーで空画像）

## 構造

```
public/parts/zundamon_en/
├── body.png
├── head_front/
│   ├── eye/
│   └── mouth/
```
