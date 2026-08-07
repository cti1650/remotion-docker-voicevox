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

# サムネイルを静止画で書き出す（YAMLに thumbnail: がある場合）
npm run thumbnail -- scenes/<name>.yaml

# 全YAMLを一括で音声生成
npm run voice
```

## シーンYAMLテンプレート

```yaml
title: "動画タイトル"
character: zundamon   # 省略可。立ち絵・声・クレジットがまとめて切り替わる
speaker_id: 3          # 省略時はキャラクターの既定値

dict:                 # 誤読する語（英字・日本語の複合語）
  Cosense: コセンス

opening:              # 省略可。本編前のタイトル演出
  variant: center     # center/band/minimal
  title: "タイトル"
  text: "喋らせたいセリフ"   # 省略すると無音（duration秒）

thumbnail:            # 省略可。npm run thumbnail で静止画出力
  variant: bold       # bold/split/simple
  title: "サムネの文字"

scenes:
  - text: "こんにちは！"
    emotion: happy

  - text: "説明するのだ"
    emotion: normal
    background: purple
    subtitle: bar     # 省略可。boxed/bar/outline/card/none
    slide:            # 省略可。以降のシーンも継続表示される
      variant: card   # card/fullbleed/title
      title: "見出し"
      bullets: ["項目1", "項目2"]

  - text: "すごいのだ！"
    emotion: surprised
    highlight: 1      # 箇条書きの強調（1始まり）
```

全機能を使ったサンプルは `scenes/demo.yaml` を参照。

## 表情プリセット（zundamon）

表情パーツはキャラクターごとに違う（`src/characters/<name>/character.json`の`emotions`）。
以下はずんだもんの場合。

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
- レイアウト: スライドやテロップがキャラクターに被っていないか
  （暗い背景を敷くバリアントは特に確認する）
- クレジット: 使用キャラクターの`character.json`の`credits`が自動表示される
  （zundamonなら VOICEVOX:ずんだもん、立ち絵素材: 坂本アヒル）
