# CLAUDE.md

Remotion + VOICEVOXでキャラクター動画を作成するプロジェクト。
YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成。

## クイックスタート

```bash
docker compose up -d voicevox              # VOICEVOX起動
./scripts/generate-from-scenes.sh scenes/demo.yaml  # 音声生成
npm run dev                                 # プレビュー
./scripts/render-video.sh scenes/demo.yaml  # レンダリング
```

## ディレクトリ

```
scenes/                    # シーン定義YAML
src/generated/             # 生成されたシーンJSON（自動更新）
src/components/            # Remotionコンポーネント
src/types/scene.ts         # シーン型定義・表情プリセット
public/parts/zundamon_en/  # パーツ画像（英語名）
public/audio/              # 音声(.wav) + リップシンク(.json)
scripts/                   # ユーティリティ
```

## ワークフロー

1. `scenes/` にYAMLを作成
2. `./scripts/generate-from-scenes.sh scenes/<name>.yaml` で音声生成
3. `npm run dev` でプレビュー
4. `./scripts/render-video.sh scenes/<name>.yaml` でレンダリング

## シーンYAML構造

```yaml
title: "動画タイトル"
speaker_id: 3

scenes:
  - text: "セリフ"
    emotion: happy      # normal/happy/sad/angry/surprised/thinking/smug/tired
    background: purple  # gradient/purple/blue/green/orange/pink/dark/white
    image:              # オプション
      src: "images/sample.png"
      position: "top-right"
```

## 重要な知見

- **Root.tsx**: generate-from-scenes.sh実行時に自動更新
- **口のデフォルト**: `closed`（`むふ`から抽出）
- **PSD抽出**: `layer.topil()`使用
- **リップシンク**: JSONの最後に`end`エントリが自動追加
- **JSON更新後**: Remotionサーバー再起動が必要

## クレジット

- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
