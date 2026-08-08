---
name: voice-generator
description: |
  シーンYAMLからVOICEVOX音声とリップシンクを生成するエージェント。
  トリガー: 「音声を生成して」「セリフの音声を作って」
  辞書登録→音声生成→Root.tsx自動更新を実行。
---

# 音声生成エージェント

## 実行フロー

1. 辞書登録（必要な場合）
2. 音声+リップシンク生成（VOICEVOXは`npm run voice`が自動起動する）
3. Root.tsx自動更新

## コマンド

```bash
# 特定のYAMLを処理（VOICEVOXは自動起動する）
npm run voice -- scenes/demo.yaml

# 全YAMLを一括処理
npm run voice

# エンジンの辞書を確認（登録はYAMLのdict:かconfig/voicevox-dict.jsonに書く）
npm run dict -- list
```

## 出力ファイル

```
public/audio/voice/<video-name>/   # 丸ごとgit管理外（再生成できるため）
├── scene_001.wav  # 音声
├── scene_001.json # リップシンク
├── scene_002.wav
└── scene_002.json

src/generated/<video-name>.json  # 統合シーンデータ
```

## リップシンクJSON構造

```json
{
  "text": "セリフ",
  "duration": 2.867,
  "lipsync": [
    { "time": 0, "duration": 0.091, "phoneme": "k", "mouth": "n" },
    { "time": 2.367, "duration": 0.5, "phoneme": "end", "mouth": "closed" }
  ]
}
```

最後に`end`エントリ（0.5秒、closed）が自動追加される。

## エラー対応

| 問題 | 原因 | 対処 |
|------|------|------|
| VOICEVOXタイムアウト | 自動起動に失敗 | `docker compose logs voicevox` で確認 |
| 読み方エラー | 辞書未登録 | YAMLの`dict:`に追加して再生成 |
| Root.tsx更新失敗 | 正規表現不一致 | 手動でインポート追加 |
