---
name: parts
description: キャラクターパーツ画像の管理ルール。英語命名、口マッピング（むふ=closed）、PSD抽出時のtopil()使用。
---

# パーツ管理ルール

## 命名規則

- 英語名のみ使用（日本語はURLエンコーディング問題）
- 小文字・アンダースコア: `cheek_normal.png`

## 口マッピング（重要）

パーツ名はPSDレイヤー名由来のため、**母音の呼称と一致しない**。

| 日本語 | ファイル名 | 実際の形 | リップシンクでの母音 |
|--------|-----------|----------|---------------------|
| むふ | closed | 閉じた口 | 無音・促音 |
| ほあ | a | 大きく開いた口 | あ |
| うへえ | uhee | 横に平たく開いた口 | **い** |
| ほう | u | 大きな丸口（`aa`に近い） | **お** |
| お | o | 小さくすぼめた丸口 | **う** |

**注意**: `ほう`(u.png)は「すぼめた口」ではなく大きく開いた丸口。
母音→パーツの割り当ては`src/hooks/useLipSync.ts`の`convertToMouthType`と
`ZundamonCharacter.tsx`の`MOUTH_MAP`で行う（ファイル名 ≠ 母音）。

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
