---
name: voicevox
description: VOICEVOX音声生成時のルール。エンジン起動確認、辞書登録、クレジット表記。
---

# VOICEVOXルール

## 必須事項

1. 音声生成前にエンジン起動確認: `curl -s http://localhost:50021/version`
2. 話者ID: ずんだもんノーマル=3
3. 英語・固有名詞は辞書登録してから生成
4. 辞書は`config/voicevox-dict.json`にエクスポート

## 音声生成

```bash
./scripts/generate-voice-with-lipsync.sh "テキスト" 3 public/audio/output
```

## クレジット表記

動画内に`VOICEVOX:ずんだもん`を表示
