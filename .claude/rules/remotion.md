---
name: remotion
description: Remotionでの動画作成ルール。SceneComposition、シーンYAML、クレジット表記。
---

# Remotionルール

## 動画作成フロー

```bash
# 1. シーンYAMLを作成
vim scenes/my-video.yaml

# 2. 音声+リップシンク生成
./scripts/generate-from-scenes.sh scenes/my-video.yaml

# 3. プレビュー
npm run dev

# 4. レンダリング
./scripts/render-video.sh scenes/my-video.yaml
```

## シーンYAML構造

```yaml
title: "動画タイトル"
speaker_id: 3
defaultBackground: gradient

scenes:
  - text: "セリフ"
    emotion: happy
    background: purple
    pause: 0.5
```

## SceneComposition

シーンは`src/components/SceneComposition.tsx`で自動処理される。

```tsx
<SceneComposition
  config={videoConfig}
  scenes={generatedScenes}
/>
```

## ファイル配置

```
scenes/                    # シーン定義YAML
src/generated/             # 生成されたシーンJSON
public/parts/zundamon_en/  # パーツ
public/audio/<video>/      # 音声+JSON
```

## クレジット（自動表示）

動画最後の2秒に自動表示:
- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
