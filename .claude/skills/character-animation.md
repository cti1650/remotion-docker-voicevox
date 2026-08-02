---
name: character-animation
description: |
  Remotionでキャラクターアニメーション（口パク・瞬き・呼吸・表情）を実装するスキル。
  トリガー: 「キャラクターを動かして」「表情を変えて」「アニメーションを実装して」
  SceneCompositionコンポーネントとEMOTION_PRESETSの使い方。
---

# キャラクターアニメーション

## シーンYAMLでの表情指定（推奨）

```yaml
scenes:
  - text: "嬉しいのだ！"
    emotion: happy     # 自動で表情パーツが設定される

  - text: "悲しいのだ..."
    emotion: sad
```

## 表情プリセット（src/types/scene.ts）

| emotion | eye | eyebrow | faceColor | edamame |
|---------|-----|---------|-----------|---------|
| normal | normal | normal | cheek_normal | normal |
| happy | smile | normal | cheek_red | normal |
| sad | normal | troubled | cheek_normal | wilted |
| angry | jitome | angry | cheek_red | normal |
| surprised | circle | raised | cheek_normal | standing |
| thinking | normal_up | normal | cheek_normal | normal |
| smug | jitome | normal | cheek_normal | normal |
| tired | relaxed | troubled | pale | wilted |

## 直接コンポーネント使用

```tsx
<ZundamonCharacter
  scale={0.55}
  x={characterX}
  y={characterY}
  mouth={mouth}           // useLipSyncから取得
  eye="normal"
  eyebrow="normal"
  faceColor="cheek_normal"
  edamame="normal"
  enableBlink={true}
  enableBreathing={true}
/>
```

## リップシンク

SceneCompositionでは自動処理。直接使用する場合:

```tsx
import { useLipSync } from "./hooks/useLipSync";

const lipSyncDialogues = scenes.map((scene) => ({
  start: scene.startTime,
  lipsyncData: scene.lipsyncData,
}));

const mouth = useLipSync(lipSyncDialogues, "closed");
```

## 型定義

```tsx
type MouthType = "closed" | "a" | "aa" | "u" | "e" | "o" | "n" | "smile" | ...;
type EyeType = "normal" | "closed" | "smile" | "jitome" | "circle" | ...;
type EyebrowType = "normal" | "angry" | "raised" | "troubled" | ...;
type FaceColorType = "cheek_normal" | "cheek_red" | "blush" | "pale";
type EdamameType = "normal" | "standing" | "standing_bent" | "wilted";
```

## レイヤー順序（下から上）

tail → body → arm_right → arm_left → head → edamame → face_color → eyebrow → eye → mouth
