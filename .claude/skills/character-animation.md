---
name: character-animation
description: |
  Remotionでキャラクターアニメーション（口パク・瞬き・呼吸・表情）を実装するスキル。
  トリガー: 「キャラクターを動かして」「表情を変えて」「アニメーションを実装して」
  SceneCompositionとキャラクター定義（character.json）の使い方。
---

# キャラクターアニメーション

口パク・瞬き・呼吸・表情はすべて`SceneComposition`が自動処理する。
「何を描くか」はキャラクター定義（`src/characters/<name>/character.json`）が持ち、
「どう動かすか」は`CharacterRenderer`が持つ。

## シーンYAMLでの表情指定（推奨）

```yaml
character: zundamon   # 省略時 zundamon
scenes:
  - text: "嬉しいのだ！"
    emotion: happy     # 自動で表情パーツが設定される

  - text: "悲しいのだ..."
    emotion: sad
```

表情は8種類（`normal` / `happy` / `sad` / `angry` / `surprised` / `thinking` /
`smug` / `tired`）。**どのパーツになるかはキャラクターごとに違う。**
表情パーツを持たないキャラでは、どの表情でも既定の見た目になる（エラーにはならない）。

## 表情プリセット（ずんだもん）

`src/characters/zundamon/character.json` の `emotions`。

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
import { CharacterRenderer, getCharacter } from "../characters";

const character = getCharacter(config.character);

<CharacterRenderer
  character={character}
  scale={character.placement.scale}
  x={characterX}
  y={characterY}
  mouth={mouth}          // useLipSyncから取得（パーツ名）
  emotion="happy"
  slots={{ rightArm: "point_up" }}   // 表情以外のスロットを個別指定
  flags={{ showTears: true }}        // whenを持つレイヤーの出し分け
  enableBlink={true}
  enableBreathing={true}
/>
```

サムネイルのように間にバリアントを挟む場合は、propsではなくコンテキストを使う。

```tsx
import { useCharacter } from "../characters";
const character = useCharacter();   // CharacterProviderが配る
```

## リップシンク

`SceneComposition`では自動処理。直接使う場合:

```tsx
import { useLipSync } from "./hooks/useLipSync";

// dialoguesの各要素は { start, lipsyncData, character } を持つ。
// 途中でキャラクターが変わってもいいよう、口の形はセリフごとに解決する
const mouth = useLipSync(lipSyncDialogues, character); // 第2引数は非再生時のfallback
```

リップシンクJSONに入っているのは母音キー（`a`/`i`/`u`/`e`/`o`/`n`/`closed`）だけで、
実際のパーツ名への変換は`character.json`の`mouthMap`が決める。

音声の先頭には`prePhonemeLength`（既定0.1秒）の無音が入るため、生成時に
その分だけ口パクの開始をずらして吸収している。キャラごとに微調整したいときは
`character.json`の`voice.lipSyncOffset`（秒）を使う。詳細は`.claude/rules/character.md`。
**新しいキャラクターは この7つのキーを埋めれば口パクが動く。**

## アニメーションの実装（CharacterRenderer.tsx）

| 動き | 実装 |
|------|------|
| 瞬き | 3秒ごとに0.12秒だけ`blink.slot`を`blink.closed`に差し替える |
| 呼吸 | 4秒周期のsinで縦に±3px動かす |
| 口パク | `mouth`propで`mouthSlot`を上書きする |

`blink`を持たないキャラ（目のパーツが無い）は瞬きしない。

## スロットの優先順位

後に書いたものが勝つ。

```
defaultSlots → emotions[emotion] → slots(props) → mouth → 瞬き
```

## レイヤー順序

`character.json`の`art.layers`の順。先に書いたものが奥になる。
ずんだもんの場合:

tail → body → arm_right → arm_left → head → edamame → face_color → eyebrow → eye → mouth → sweat → tears

キャラクターを増やす手順は`.claude/rules/character.md`と
`character-from-image`スキルを参照。
