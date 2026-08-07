---
name: character-from-image
description: |
  静止画1枚からリップシンク対応のキャラクターを作るスキル。
  トリガー: 「この画像でキャラクターを作って」「自作キャラに差し替えたい」
  「立ち絵を追加して」「キャラクターを増やしたい」
  scripts/create-character.py で口パーツと character.json を生成する。
---

# 静止画からキャラクターを作る

立ち絵のPNGを1枚渡すと、口パーツを生成してリップシンクできる状態にする。
PSDから多数のパーツを抽出する場合は `psd-extract` スキルを使う。

## 手順

### 1. 画像を置く

```bash
mkdir -p assets/characters
# assets/characters/<name>.png に立ち絵を置く
```

- **背景透過のPNGを推奨**（背景があると四角い板に見える）
- 顔の口がはっきり見える大きさにする
- 幅・高さは自由。原寸は character.json に記録され、配置は自動計算される

### 2. 口の位置を調べる

元画像のどこに口があるかをピクセル座標で指定する必要がある。

```bash
python3 -c "
from PIL import Image
im = Image.open('assets/characters/<name>.png')
print(im.size)"
```

口を含む矩形を `x,y,幅,高さ` で決める。**元の口より一回り大きめ**に取る。
この矩形は「元の口を消す範囲」と「新しい口を描く範囲」を兼ねているため、
小さすぎると元の口がはみ出して二重に見え、口の動きも小さくなる。

### 3. 生成する

```bash
python3 scripts/create-character.py assets/characters/<name>.png \
    --name <name> \
    --display-name "表示名" \
    --mouth 252,336,96,64 \
    --speaker-id 3 \
    --credit "VOICEVOX:ずんだもん" \
    --credit "立ち絵: 作者名"
```

出力:

```
public/parts/<name>/body.png       # 元画像の口を周囲の色で塗ったもの
public/parts/<name>/mouth/*.png    # a/i/u/e/o/n/closed の7種類
src/characters/<name>/character.json
```

主なオプション:

| オプション | 用途 |
|-----------|------|
| `--mouth-color` | 口の色（既定 `#5a2a35`） |
| `--keep-mouth` | 元画像の口を消さない。口の無い絵を渡すとき |
| `--speaker-id` | VOICEVOXの話者ID（既定3）。YAMLで上書きできる |
| `--pitch` | 音高 -0.15〜0.15。上げると高い声になる |
| `--speed` | 話速 0.5〜2.0 |
| `--intonation` | 抑揚 0〜2.0 |
| `--credit` | 動画末尾のクレジット。複数回指定できる |

声の調整は聴き比べてから決めるとよい。

```bash
for p in -0.05 0.00 0.05 0.10; do
  ./scripts/generate-voice-with-lipsync.sh "テストです" 3 /tmp/p$p "{\"pitchScale\":$p}"
done
```

### 4. レジストリに登録する

`src/characters/registry.ts` に2行足す。

```ts
import * as myCharJson from "./my-char/character.json";

export const CHARACTERS: Record<string, CharacterDefinition> = {
  zundamon: zundamonJson as unknown as CharacterDefinition,
  myChar: myCharJson as unknown as CharacterDefinition,
};
```

### 5. 使う

```yaml
title: "テスト"
character: my-char     # これだけで立ち絵と声が切り替わる
scenes:
  - text: "はじめまして。"
```

```bash
npm run voice -- scenes/<name>.yaml
npx remotion still src/index.ts <name> /tmp/check.png --frame=40
```

## 確認すること

生成したら**必ず目視で確認する**。特に次の2点で失敗しやすい。

1. **元の口が消えているか** — `body.png` を開いて、口の跡が残っていないか見る。
   残っていたら `--mouth` の範囲を広げるか、口の無い絵を用意して `--keep-mouth`
2. **口の位置がずれていないか** — `still` でレンダリングして顔と口が合っているか見る

口の動きを一覧で見るには次のようにする。

```bash
python3 -c "
from PIL import Image
names=['closed','a','i','u','e','o','n']
body=Image.open('public/parts/<name>/body.png').convert('RGBA')
w,h=body.size
sheet=Image.new('RGBA',(w*len(names)//2,h//2),(255,255,255,255))
for i,n in enumerate(names):
    m=Image.open(f'public/parts/<name>/mouth/{n}.png').convert('RGBA')
    sheet.paste(Image.alpha_composite(body,m).resize((w//2,h//2)),(i*w//2,0))
sheet.save('/tmp/mouths.png')"
```

## 向き・不向き

塗りつぶしは**周囲が単色に近いイラスト調の絵**を前提にしている。

| | 結果 |
|---|---|
| フラットな塗りのイラスト | きれいに消える |
| グラデーション・テクスチャのある絵 | 塗った矩形が目立つことがある |
| 写真・実写 | 不向き。口の無い絵を用意して `--keep-mouth` を使う |

## 表情を足したいとき

このスクリプトが作るのは口だけなので、`emotions` は空になり
`emotion: happy` を書いてもいつも同じ顔になる。表情を足すには:

1. 目のパーツを `public/parts/<name>/eye/*.png` に用意する
   （元画像と同じサイズの透明PNGで、目の位置に描く）
2. `character.json` の `art.layers` に `{"dir": "eye", "slot": "eye"}` を足す
   （口より前に書くと口の下、後に書くと口の上に重なる）
3. `defaultSlots` に `"eye": "normal"`、`emotions` に表情ごとの上書きを書く
4. 瞬きさせるなら `blink` に `{"slot": "eye", "closed": "closed"}` を足す

詳しくは `.claude/rules/character.md` を参照。
