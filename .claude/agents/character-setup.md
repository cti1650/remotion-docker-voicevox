---
name: character-setup
description: |
  PSDからキャラクターパーツを抽出し、Remotionコンポーネントを生成するエージェント。
  トリガー: 「キャラクターを設定して」「PSDから立ち絵を準備して」「新キャラクター追加」
  ※初期セットアップ時のみ使用。通常の動画作成にはvideo-creatorを使用。
---

# キャラクターセットアップ

**注意**: これは初期セットアップ用です。ずんだもんのパーツは既にセットアップ済み。

## 実行フロー

1. PSD構造解析
2. パーツ抽出（`extract-psd-parts.py`、**topil()使用**）
3. 英語名変換（`rename-parts-to-english.py`）
4. 日本語パーツ削除
5. コンポーネント確認

## 生成ファイル

```
public/parts/<character>_en/
├── body.png
├── head_front/
│   ├── eye/
│   ├── mouth/
│   └── ...
```

## 重要な口マッピング

| 日本語 | 英語 | 説明 |
|--------|------|------|
| むふ | closed | 閉じた口 |
| ほう | u | すぼめた口 |
| ほあ | a | 開いた口 |

## エラー対応

| 問題 | 原因 | 対処 |
|------|------|------|
| 空画像 | composite()使用 | topil()に変更 |
| 404エラー | 日本語ファイル名 | 英語に変換 |

## 関連ファイル

- `scripts/extract-psd-parts.py` - PSD抽出
- `scripts/rename-parts-to-english.py` - 英語名変換
- `src/characters/CharacterRenderer.tsx` - キャラクター描画（全キャラクター共通）
- `src/characters/zundamon/character.json` - ずんだもんの定義（パーツ・表情・声・クレジット）
