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
character: zundamon        # 省略可（既定 zundamon）。立ち絵・声・クレジットが切り替わる
speaker_id: 3               # ずんだもん=3（省略時はキャラクターの既定値）
fps: 30
width: 1920
height: 1080
defaultBackground: gradient
defaultPause: 0.5

dict:                      # この動画だけの読み（省略可）
  Cosense: コセンス

scenes:
  - text: "セリフ"
    emotion: normal
```

## 読み方（dict）

セリフはそのまま字幕になるので、**読みを直すためにカタカナで書かない**。
表記は元のままにして`dict`で読みを指定する。

```yaml
dict:
  Cosense: コセンス        # 英字は放置すると1文字ずつ読まれる
  複数人: フクスウニン      # 日本語の複合語も誤読しやすい
```

全動画で使う語は`config/voicevox-dict.json`へ。生成時に自動適用される。
誤読の確認方法は`.claude/rules/voicevox.md`を参照。

## シーンプロパティ

| プロパティ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `text` | ○ | セリフ | `"こんにちは！"` |
| `emotion` | | 表情 | `happy` |
| `background` | | 背景 | `purple` |
| `image` | | 強調画像 | `{ src: "img.png" }` |
| `subtitle` | | テロップの見た目 | `bar` |
| `character` | | キャラクターの切り替え／表示 | `presenter` / `false` |
| `se` | | 効果音（`null`で無音） | `"audio/se/chime.ogg"` |
| `pause` | | セリフ後の間（秒） | `0.5` |

## 見た目のバリアント

- `subtitle`: `boxed`（既定） / `bar` / `outline` / `card` / `none`
- `slide.variant`: `card`（既定） / `fullbleed` / `title`
- `opening.variant`: `center`（既定） / `band` / `minimal`
- `thumbnail.variant`: `bold`（既定） / `split` / `simple`

## 効果音

```yaml
defaultSe:                        # 全シーンのテロップ表示で鳴る
  src: "audio/se/pop.ogg"
  volume: 0.22

scenes:
  - text: "セリフ"
    se: "audio/se/chime.ogg"      # シーン単位で上書き（nullで無音）
    slide:
      se: "audio/se/slide-in.ogg" # スライド登場時だけ鳴る
```

同梱: `pop` / `select` / `slide-in` / `chime` / `confirm` / `transition`（すべてCC0）。
再配布NGの素材は`public/audio/se/local/`に置く。

## オープニングとサムネイル

```yaml
opening:            # 本編の前のタイトル演出
  title: "タイトル"
  text: "喋らせるセリフ"   # 省略すると無音（duration秒）

thumbnail:          # npm run thumbnail -- scenes/x.yaml でPNG出力
  title: "サムネの文字"
```

動画全体の既定は`defaultSubtitle` / `defaultSlideVariant`で指定する。
サンプル: `scenes/variants-demo.yaml`、`scenes/opening-demo.yaml`

## 表情（emotion）

表情の見た目はキャラクターごとに違う（`character.json`の`emotions`）。
以下は既定キャラクター`zundamon`の場合。

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

図をじっくり見せたいときは`character: false`でキャラクターを隠し、
`position: center`で大きく表示できる。

```yaml
scenes:
  - text: "図をじっくり見せるのだ"
    character: false
    image:
      src: "images/diagram.png"
      position: "center"
      scale: 2.6
      animation: "zoom-in"
```

## キャラクターの切り替え（character）

シーンの`character`は書き方で意味が変わる（`slide`と同じ書き味）。

| 書き方 | 意味 |
|--------|------|
| 文字列 | そのキャラクターに切り替える。以降のシーンにも引き継ぐ |
| `false` | そのシーンだけ隠す。キャラクター自体は変わらない |
| `true` / 省略 | 直前のキャラクターをそのまま表示 |

```yaml
character: zundamon        # 動画の既定キャラクター

scenes:
  - text: "まずはぼくが話すのだ"

  - text: "交代しました"
    character: presenter   # 声も一緒に切り替わる

  - text: "図をじっくり見せるのだ"
    character: false       # 姿だけ隠す
```

クレジットは出てきた全キャラクターぶんが自動で並ぶ。
サンプル: `scenes/character-switch-demo.yaml`

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
