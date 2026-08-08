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

## シーンYAML

**フォーマットの仕様は `.claude/rules/scenes.md`**（全項目・既定値・省略時の挙動）。
`scenes/**` を編集すると自動で読み込まれる。

**出力までの流れは `video-pipeline` スキル**（読みの確認 → 音声生成 →
静止画で確認 → レンダリング）。順番を守ること。

表情プリセットはキャラクターごとに違う（`character.json`の`emotions`）。
一覧は `.claude/rules/character.md` を参照。

全機能を使ったサンプルは `scenes/demo.yaml`。

## チェックポイント

- パーツ表示: 瞬き・呼吸が動作するか
- 音声: 読み方が正しいか（生成前に`audio_query`の`kana`で確認し、
  誤読はYAMLの`dict:`に登録する。英語だけでなく日本語の複合語も要注意）
- リップシンク: 口パクが同期しているか
- レイアウト: スライドやテロップがキャラクターに被っていないか
  （暗い背景を敷くバリアントは特に確認する）
- クレジット: 使用キャラクターの`character.json`の`credits`が自動表示される
  （zundamonなら VOICEVOX:ずんだもん、立ち絵素材: 坂本アヒル）
