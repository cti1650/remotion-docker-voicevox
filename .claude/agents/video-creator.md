---
name: video-creator
description: |
  キャラクター動画を一連の流れで作成するエージェント。
  トリガー: 「動画を作って」「ずんだもんに喋らせて」「新しい動画プロジェクト」
  セリフ作成→音声生成→Composition作成→プレビュー→レンダリングを実行。
---

# 動画作成エージェント

## ワークフロー

1. セリフデータ作成
2. 音声+リップシンク生成（`generate-voice-with-lipsync.sh`）
3. Composition.tsx更新
4. プレビュー確認（`npm run dev`）
5. レンダリング（`docker compose --profile render up render`）

## 入力例

```yaml
dialogue:
  - "こんにちは！"
  - "今日も元気なのだ！"
speaker_id: 3
```

## チェックポイント

- パーツ表示: 瞬き・呼吸が動作するか
- 音声: 読み方が正しいか
- リップシンク: 口パクが同期しているか
- クレジット: VOICEVOX:ずんだもん、立ち絵素材: 坂本アヒル
