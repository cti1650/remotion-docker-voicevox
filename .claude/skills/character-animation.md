---
name: character-animation
description: |
  Remotionでキャラクターアニメーション（口パク・瞬き・呼吸）を実装するスキル。
  トリガー: 「キャラクターを動かして」「口パクを実装して」「瞬きを追加して」
  ZundamonCharacterコンポーネントの使い方とuseLipSyncフックの実装。
---

# キャラクターアニメーション

## コンポーネント使用

```tsx
<ZundamonCharacter
  scale={0.55}
  x={characterX}
  y={characterY}
  mouth={mouth}           // useLipSyncから取得
  eye="normal"
  eyebrow="normal"
  enableBlink={true}
  enableBreathing={true}
/>
```

## リップシンク（推奨）

```tsx
import { useLipSync } from "./hooks/useLipSync";
import line1LipSync from "../public/audio/line1.json";

const dialogue = [
  { start: 0.5, lipsyncData: line1LipSync },
];

const mouth = useLipSync(dialogue, "closed");
```

## 口の形マッピング

| 音素 | mouth | 説明 |
|------|-------|------|
| a, A | a | あ |
| i, I | smile | い |
| u, U | u | う |
| e, E | e | え |
| o, O | o | お |
| N, n | n | ん |
| pau, end | closed | 閉じ |

## レイヤー順序（下から上）

1. tail → 2. body → 3. arm_right → 4. arm_left → 5. head → 6. edamame → 7. face_color → 8. eyebrow → 9. eye → 10. mouth

## 型定義

```tsx
type MouthType = "closed" | "a" | "aa" | "u" | "e" | "o" | "n" | "smile" | ...;
type EyeType = "normal" | "closed" | "smile" | "jitome" | ...;
type EyebrowType = "normal" | "angry" | "raised" | "troubled" | ...;
```

## 注意

- 口のデフォルト: `closed`（`むふ`から抽出）
- JSON更新後はRemotionサーバー再起動が必要
