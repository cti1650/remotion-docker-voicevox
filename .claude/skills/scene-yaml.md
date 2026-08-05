---
name: scene-yaml
description: |
  動画のシーンYAMLを作成するスキル。
  トリガー: 「動画のシーンを作って」「YAMLを作成して」「セリフを設定して」
  表情・背景・画像などを含む構造化されたシーン定義を生成。
---

# シーンYAML作成

## 基本構造

```yaml
title: "動画タイトル"
speaker_id: 3              # ずんだもん=3
fps: 30
width: 1920
height: 1080
defaultBackground: gradient
defaultPause: 0.5

scenes:
  - text: "セリフ"
    emotion: normal
```

## シーンプロパティ

| プロパティ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `text` | ○ | セリフ | `"こんにちは！"` |
| `emotion` | | 表情 | `happy` |
| `background` | | 背景 | `purple` |
| `image` | | 強調画像 | `{ src: "img.png" }` |
| `pause` | | セリフ後の間（秒） | `0.5` |

## 表情（emotion）

- `normal` - 通常
- `happy` - 嬉しい（笑顔、赤い頬）
- `sad` - 悲しい（困り眉、しおれた枝豆）
- `angry` - 怒り（ジト目、怒り眉）
- `surprised` - 驚き（○目、上げ眉、立った枝豆）
- `thinking` - 考え中（上目）
- `smug` - ドヤ顔（ジト目）
- `tired` - 疲れ（リラックス目、青白い）

## 背景（background）

- `gradient` - 紫→ピンクグラデーション（デフォルト）
- `purple` - 紫グラデーション
- `blue` - 青グラデーション
- `green` - 緑グラデーション
- `orange` - オレンジグラデーション
- `pink` - ピンクグラデーション
- `dark` - ダーク単色
- `white` - 白単色

## 強調画像（image）

```yaml
image:
  src: "images/sample.png"     # public/からの相対パス
  position: "top-right"        # top-right/top-left/center/bottom-right/bottom-left
  scale: 1                     # スケール
  animation: "fade-in"         # fade-in/slide-in/zoom-in/none
```

シンプルな場合:
```yaml
image: "images/sample.png"
```

## サンプル

```yaml
title: "Remotion解説動画"
speaker_id: 3

scenes:
  - text: "こんにちは！ずんだもんなのだ！"
    emotion: happy

  - text: "今日はRemotionについて説明するのだ"
    emotion: normal
    background: purple

  - text: "こんな感じで画像も表示できるのだ"
    emotion: thinking
    image:
      src: "images/diagram.png"
      position: "top-right"

  - text: "すごいのだ！"
    emotion: surprised
    background: green
```

## ファイル配置

```bash
scenes/my-video.yaml
npm run video -- scenes/my-video.yaml
```
