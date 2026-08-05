---
name: voicevox
description: VOICEVOX音声生成時のルール。シーンYAML使用、辞書登録、クレジット表記。
---

# VOICEVOXルール

## 必須事項

1. 音声生成前にエンジン起動確認: `curl -s http://localhost:50021/version`
2. 話者ID: ずんだもんノーマル=3
3. 英語・固有名詞は辞書登録してから生成
4. 辞書は`config/voicevox-dict.json`にエクスポート

## 音声生成（推奨）

```bash
# シーンYAMLから一括生成
./scripts/generate-from-scenes.sh scenes/demo.yaml

# 全YAMLを一括処理
./scripts/generate-from-scenes.sh
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
