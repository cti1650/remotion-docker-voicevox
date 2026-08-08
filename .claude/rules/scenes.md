---
description: |
  シーンYAML（scenes/*.yaml）のフォーマット仕様。トップレベル設定とシーン設定の全項目、
  既定値、省略時の挙動、書き方で意味が変わる項目（character / slide / se）。
paths:
  - scenes/**
  - schema/scene.schema.json
---

# シーンYAMLルール

`scenes/*.yaml` が動画の入力。ここを書けば音声・リップシンク・動画が生成される。
型の実体は `src/types/scene.ts`（`VideoConfigInput` と `SceneConfig`）。

## スキーマ検証

書ける項目は `schema/scene.schema.json` が正。生成時（`npm run voice` / `npm run video`）に
検証され、**未知のキーはタイポとみなしてエラーで止まる**。

各YAMLの1行目にモデル行を書いてあるので、エディタ（VS Code + YAML拡張）でも
補完と実時間の検証が効く。

```yaml
# yaml-language-server: $schema=../schema/scene.schema.json
```

項目を増やすときは `src/types/scene.ts` と `schema/scene.schema.json` の両方を直す。
片方だけだと「型はあるのに生成時に弾かれる」状態になる。
**型を変えたらこのファイルも更新すること。**

```bash
npm run video -- scenes/<name>.yaml   # 音声生成→レンダリング
```

## 最小構成

```yaml
title: "動画タイトル"

scenes:
  - text: "セリフ"
```

`text` 以外はすべて省略できる。

## トップレベル設定

| キー | 既定 | 説明 |
|------|------|------|
| `title` | ファイル名 | 動画タイトル |
| `character` | `zundamon` | 既定のキャラクターID |
| `speaker_id` | キャラの既定値 | VOICEVOXの話者ID。**既定キャラへの上書き** |
| `voice` | キャラの既定値 | 声の調整。**既定キャラへの上書き** |
| `fps` | `30` | フレームレート |
| `width` / `height` | `1920` / `1080` | 解像度 |
| `defaultBackground` | `gradient` | 背景の既定 |
| `defaultPause` | `0.5` | セリフ後の間（秒） |
| `defaultSubtitle` | `boxed` | テロップの既定 |
| `defaultSlideVariant` | `card` | スライドの既定 |
| `dict` | なし | この動画だけの読み |
| `bgm` | なし | BGM（文字列ならsrcのみ） |
| `defaultSe` | なし | 全シーンのテロップ表示で鳴る効果音 |
| `opening` | なし | 本編前のタイトル演出。`text`を書くと喋り、尺は音声の長さになる |
| `ending` | なし | 本編後の締めの演出。書き方は`opening`と同じ |
| `thumbnail` | なし | サムネイル（動画には出ない） |
| `scenes` | **必須** | シーンの配列 |

`speaker_id` と `voice` は**既定キャラクターにだけ効く**。
途中で切り替えたキャラクターは、そのキャラ自身の声を使う（詳細は`character.md`）。

## シーン設定

| キー | 既定 | 説明 |
|------|------|------|
| `text` | **必須** | セリフ。**そのまま字幕になる** |
| `emotion` | `normal` | `normal` `happy` `sad` `angry` `surprised` `thinking` `smug` `tired` |
| `background` | 動画の既定 | `gradient` `purple` `blue` `green` `orange` `pink` `dark` `white` |
| `subtitle` | 動画の既定 | `boxed` `bar` `outline` `card` `none` |
| `character` | 継続 | 切り替え／表示（下記） |
| `slide` | 継続 | スライド（下記） |
| `highlight` | なし | 強調する箇条書きの番号（**1始まり**） |
| `image` | なし | 強調画像（文字列ならsrcのみ） |
| `se` | `defaultSe` | 効果音（下記） |
| `pause` | `defaultPause` | セリフ後の間（秒） |
| `duration` | 音声長 | 表示時間の上書き（秒） |

## 書き方で意味が変わる項目

この3つは「省略＝継続」で、値によって意味が変わる。**混同しやすいので注意**。

### character

| 書き方 | 意味 |
|--------|------|
| 文字列 | そのキャラクターに切り替える。**以降のシーンにも引き継ぐ**。声も変わる |
| `false` | そのシーンだけ隠す。キャラクター自体は変わらない |
| `true` / 省略 | 直前のキャラクターをそのまま表示 |

トップレベルの `character`（既定キャラのID）とは**別物**。詳細は`character.md`。

### slide

| 書き方 | 意味 |
|--------|------|
| オブジェクト | そのスライドに切り替える。**以降のシーンにも継続表示** |
| `null` | 非表示に戻す |
| 省略 | 直前のスライドを継続（登場アニメは再生されない） |

`background` は継続しないので、同じスライド内でもシーンごとに指定する。

### se

| 書き方 | 意味 |
|--------|------|
| 文字列 | そのファイルを鳴らす（`src`のみの指定） |
| オブジェクト | `src` / `volume` / `delay` を指定 |
| `null` | **鳴らさない** |
| 省略 | `defaultSe` を使う |

## 主なオブジェクトの中身

```yaml
bgm:
  src: "audio/bgm/xxx.mp3"   # public/からの相対パス
  volume: 0.10               # 既定 0.12。セリフを邪魔しない値に
  fadeIn: 1.5                # 既定 1
  fadeOut: 2.5               # 既定 2
  loop: true                 # 既定 true
  credit: "BGM: ... / CC BY 4.0"   # 表記義務がある場合は必須

opening:
  variant: center            # center / band / minimal
  title: "タイトル"           # 必須
  subtitle: "補足の一行"
  badge: "解説"
  accent: "#00d2a0"
  background: "dark"
  emotion: happy
  character: false           # 冒頭でキャラを隠す（真偽値のみ）
  se: "audio/se/transition.ogg"
  text: "喋らせたいセリフ"     # 書くと尺は音声の長さになる
  duration: 3                # textが無いときの尺（既定3）

ending:                      # 本編の後。省略すれば付かない
  variant: center            # center / band / minimal
  title: "ご視聴ありがとうございました"   # 必須
  subtitle: "また次の動画で"
  accent: "#00d2a0"
  background: "dark"
  emotion: happy
  character: false           # エンディングでキャラを隠す（真偽値のみ）
  se: "audio/se/confirm.ogg"
  text: "また会おうなのだ！"   # 書くと尺は音声の長さになる
  duration: 4                # textが無いときの尺（既定4）

thumbnail:
  variant: bold              # bold / split / simple
  title: "サムネの文字"        # 必須
  subtitle: "補足"
  badge: "入門"
  accent: "#00d2a0"
  background: "dark"
  emotion: smug
  image: "images/xxx.png"    # splitで使う
  width: 1280                # 既定 1280
  height: 720                # 既定 720

slide:
  variant: card              # card / fullbleed / title
  title: "見出し"
  bullets: ["項目1", "項目2"]
  image: "images/xxx.png"
  imageLayout: split         # split=箇条書きの右 / stack=下
  caption: "図: 説明"
  note: "下部の補足"
  accent: "#6c5ce7"
  se: "audio/se/slide-in.ogg"   # スライド登場時だけ鳴る

image:
  src: "images/xxx.png"
  position: "center"         # top-right / top-left / center / bottom-right / bottom-left
  scale: 2.6
  animation: "zoom-in"       # fade-in / slide-in / zoom-in / none
```

## 書くときの注意（厳守）

1. **セリフはそのまま字幕になる。** 読みを直すためにカタカナで書かない。
   表記は元のまま書き、読みは `dict` で直す（詳細は`voicevox.md`）
2. **新しいYAMLを作ったら、生成前に全セリフの読みを確認する。**
   英字だけでなく**日本語の複合語**も誤読しやすい
3. `dict` には**セリフに出てくる語だけ**書く。
   スライドやノートの文字は音声にならないので不要
4. BGM・効果音・画像のパスは `public/` からの相対パス。
   素材のライセンスと置き場所は`assets.md`に従う（**厳守**）
5. 長いタイトルは `opening.variant: center` だとキャラクターに重なる。
   長い場合は `band` か `minimal` を使う
   （`ending` は長文前提なので、どのバリアントも自動で折り返す）
6. **クレジットはエンディングと併存する。** 動画末尾2秒のクレジットは
   エンディングの上に重ねて表示される。`ending` を書いても書かなくても出る

## サンプル

| ファイル | 内容 |
|----------|------|
| `scenes/demo.yaml` | 全機能入り |
| `scenes/variants-demo.yaml` | テロップとスライドの見た目 |
| `scenes/opening-demo.yaml` | 冒頭とサムネイル |
| `scenes/slide-demo.yaml` | スライドの基本 |
| `scenes/presenter-demo.yaml` | キャラクターの差し替え |
| `scenes/character-switch-demo.yaml` | 途中でのキャラクター切り替え |
| `scenes/ending-demo.yaml` | 冒頭とエンディング |
| `scenes/git.yaml` ほか | 実際の解説動画 |

## 関連ルール

| 内容 | ルール |
|------|--------|
| 読みの確認・辞書・声の調整 | `voicevox.md` |
| キャラクターの切り替え・表情・クレジット | `character.md` |
| 素材のライセンスと置き場所 | `assets.md` |
| 見た目のバリアントの追加 | `remotion.md` |
