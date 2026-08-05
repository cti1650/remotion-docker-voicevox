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
2. `npm run video` で音声生成からレンダリングまで実行

## コマンド

```bash
# 音声生成→レンダリングを一括実行（VOICEVOXは自動起動）
npm run video -- scenes/<name>.yaml

# 音声だけ生成してプレビューで確認したい場合
npm run voice -- scenes/<name>.yaml
npm run dev
npm run video -- scenes/<name>.yaml --skip-generate

# 全YAMLを一括で音声生成
npm run voice
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
- 音声: 読み方が正しいか（生成前に`audio_query`の`kana`で確認し、
  誤読はYAMLの`dict:`に登録する。英語だけでなく日本語の複合語も要注意）
- リップシンク: 口パクが同期しているか
- クレジット: VOICEVOX:ずんだもん、立ち絵素材: 坂本アヒル（自動表示）
