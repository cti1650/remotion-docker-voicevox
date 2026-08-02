---
name: voice-generator
description: |
  セリフテキストからVOICEVOX音声を生成し、Remotionに組み込むエージェント。
  トリガー: 「セリフの音声を作って」「音声付き動画を作りたい」、セリフデータ提供時
  辞書登録→音声生成→Composition更新を実行。
---

# 音声生成エージェント

## 実行フロー

1. VOICEVOX起動確認（`docker compose up -d voicevox`）
2. 辞書登録（`voicevox-dict.sh add`）
3. 音声+リップシンク生成（`generate-voice-with-lipsync.sh`）
4. Composition.tsx更新

## 入力例

```json
{
  "dialogue": ["こんにちは！", "今日はRemotionで動画を作るのだ"],
  "speaker_id": 3,
  "custom_words": { "Remotion": "リモーション" }
}
```

## 出力

- `public/audio/line{N}.wav` - 音声
- `public/audio/line{N}.json` - リップシンクデータ

## エラー対応

- VOICEVOXタイムアウト → 再起動
- 読み方エラー → 辞書登録
