---
name: voicevox
description: VOICEVOX音声生成時のルール。シーンYAML使用、辞書登録、クレジット表記。
---

# VOICEVOXルール

## 必須事項

1. 話者ID: ずんだもんノーマル=3
2. 英語・固有名詞は辞書登録してから生成
3. 辞書は`config/voicevox-dict.json`にエクスポート

エンジンの起動確認は不要（`scripts/lib.sh`の`ensure_voicevox`が自動で起動する）。

## 音声生成（推奨）

```bash
# シーンYAMLから一括生成
npm run voice -- scenes/demo.yaml

# 全YAMLを一括処理
npm run voice
```

## 個別音声生成

```bash
./scripts/generate-voice-with-lipsync.sh "テキスト" 3 public/audio/voice/demo/scene_001
```

## 辞書登録

```bash
./scripts/voicevox-dict.sh add Remotion リモーション
./scripts/voicevox-dict.sh list
./scripts/voicevox-dict.sh export config/voicevox-dict.json
```

## 話者ID

| ID | キャラクター |
|----|--------------|
| 3 | ずんだもん（ノーマル） |
| 1 | 四国めたん |
| 8 | 春日部つむぎ |

## クレジット表記

動画内に`VOICEVOX:ずんだもん`を表示（SceneCompositionで自動表示）
