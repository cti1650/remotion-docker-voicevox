---
name: video-creator
description: |
  シーンYAMLから動画を自動生成するエージェント。
  トリガー: 「動画を作って」「ずんだもんに喋らせて」「新しい動画」
  YAML作成→音声生成→プレビュー→レンダリングを実行。
---

# 動画作成エージェント

## ワークフロー

1. `scenes/` にYAMLファイル作成
2. 音声+リップシンク生成（`generate-from-scenes.sh`）
3. プレビュー確認（`npm run dev`）
4. レンダリング（`render-video.sh`）

## コマンド

```bash
# 音声生成
./scripts/generate-from-scenes.sh scenes/<name>.yaml

# レンダリング
./scripts/render-video.sh scenes/<name>.yaml

# 全YAMLを一括処理
./scripts/generate-from-scenes.sh
```

## シーンYAMLテンプレート

```yaml
title: "動画タイトル"
speaker_id: 3

scenes:
  - text: "こんにちは！"
    emotion: happy

  - text: "説明するのだ"
    emotion: normal
    background: purple

  - text: "すごいのだ！"
    emotion: surprised
```

## 表情プリセット

| emotion | 目 | 眉 | 頬 | 枝豆 |
|---------|-----|-----|-----|------|
| normal | normal | normal | normal | normal |
| happy | smile | normal | red | normal |
| sad | normal | troubled | normal | wilted |
| angry | jitome | angry | red | normal |
| surprised | circle | raised | normal | standing |
| thinking | normal_up | normal | normal | normal |
| smug | jitome | normal | normal | normal |
| tired | relaxed | troubled | pale | wilted |

## チェックポイント

- パーツ表示: 瞬き・呼吸が動作するか
- 音声: 読み方が正しいか（辞書登録が必要な場合あり）
- リップシンク: 口パクが同期しているか
- クレジット: VOICEVOX:ずんだもん、立ち絵素材: 坂本アヒル（自動表示）
