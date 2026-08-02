---
name: remotion
description: Remotion動画コンポーネントのルール。staticFile、Sequence、フレーム計算、クレジット表記。
---

# Remotionルール

## 基本

```tsx
import { staticFile, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// 静的ファイル
<Img src={staticFile("parts/body.png")} />
<Audio src={staticFile("audio/line1.wav")} />

// タイミング制御
<Sequence from={startFrame} durationInFrames={duration}>
  <Component />
</Sequence>

// フレーム計算
const currentTime = frame / fps;
const startFrame = Math.floor(startTime * fps);
```

## ファイル配置

```
public/
├── parts/zundamon_en/  # パーツ
└── audio/              # 音声+JSON
```

## クレジット

- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
