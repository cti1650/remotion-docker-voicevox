---
name: voicevox-voice
description: |
  VOICEVOXで音声+リップシンクデータを生成するスキル。
  トリガー: 「音声を生成して」「VOICEVOXで喋らせて」
  出力: .wav音声ファイル + .jsonリップシンクデータ
---

# VOICEVOX音声生成

## 前提条件

```bash
docker compose up -d voicevox
curl -s http://localhost:50021/version  # 起動確認
```

## シーンYAMLから一括生成（推奨）

```bash
./scripts/generate-from-scenes.sh scenes/demo.yaml
```

## 個別音声生成

```bash
./scripts/generate-voice-with-lipsync.sh "テキスト" <speaker_id> <output_base>

# 例
./scripts/generate-voice-with-lipsync.sh "こんにちは！" 3 public/audio/demo/scene_001
# 出力: scene_001.wav, scene_001.json
```

話者ID: ずんだもん=3（ノーマル）、1（あまあま）、7（ツンツン）

## 辞書登録

```bash
./scripts/voicevox-dict.sh add Remotion リモーション
./scripts/voicevox-dict.sh export config/voicevox-dict.json
```

## リップシンクJSON構造

```json
{
  "text": "こんにちは",
  "duration": 2.867,
  "lipsync": [
    { "time": 0, "duration": 0.091, "phoneme": "k", "mouth": "n" },
    { "time": 2.367, "duration": 0.5, "phoneme": "end", "mouth": "closed" }
  ]
}
```

最後に`end`エントリ（0.5秒、closed）が自動追加される。

## 口形状マッピング

| 音素 | mouth |
|------|-------|
| a, A | a |
| i, I | smile |
| u, U | u |
| e, E | e |
| o, O | o |
| N, n | n |
| pau, end | closed |
