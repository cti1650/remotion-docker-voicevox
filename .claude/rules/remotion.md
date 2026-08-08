---
description: |
  Remotionでの動画作成ルール。SceneComposition、シーンYAML、見た目のバリアント、
  BGM・効果音の指定、メディアパスの解決、クレジット表記。
paths:
  - src/**
  - scripts/render.mjs
  - remotion.config.ts
---

# Remotionルール

## 動画作成フロー

```bash
# 1. シーンYAMLを作成
vim scenes/my-video.yaml

# 2. 音声生成からレンダリングまで一括実行（VOICEVOXは自動起動）
npm run video -- scenes/my-video.yaml
```

途中で確認する場合:

```bash
npm run voice -- scenes/my-video.yaml                  # 音声+リップシンクのみ
npm run dev                                            # プレビュー
npm run video -- scenes/my-video.yaml --skip-generate  # レンダリングのみ
```

## シーンYAML構造

**フォーマットの仕様は`.claude/rules/scenes.md`にまとめてある**（全項目・既定値・
省略時の挙動）。ここでは動画側の機能ごとの使い方だけを扱う。

## スライド解説形式

`slide`を指定すると画面左側にスライド枠が出る（キャラクターは右側）。
サンプル: `scenes/slide-demo.yaml`

```yaml
scenes:
  - text: "3ステップで作れるのだ"
    slide:
      title: "作り方は3ステップ"
      bullets: ["設定を書く", "音声を生成", "レンダリング"]
      accent: "#0984e3"   # 省略可
      note: "所要時間は数分" # 省略可

  - text: "まず設定を書くのだ"
    highlight: 1      # 1番目の箇条書きを強調（1始まり）

  - text: "スライドを消すのだ"
    slide: null       # 非表示に戻す
```

- `slide`を省略したシーンは**直前のスライドを継続**する（登場アニメは再生されない）
- `background`は引き継がれないため、同じスライド内でもシーンごとに指定する
- 配置は`src/components/slide/layout.ts`の`SLIDE_AREA`で調整（全バリアント共通）

### スライドへの画像差し込み

```yaml
    slide:
      title: "画像も差し込める"
      bullets: ["箇条書きの横に並べられる"]
      image: "images/flow.png"
      imageLayout: split   # split=箇条書きの右 / stack=箇条書きの下
      caption: "図: 動画ができるまで"
```

`bullets`を書かなければ画像だけを大きく表示する。画像は箇条書きが出そろってから現れる。

## BGM

トップレベルに`bgm`を書くと動画全体にループで流れる。

```yaml
bgm:
  src: "audio/bgm/carefree-kevin-macleod.mp3"
  volume: 0.10    # デフォルト 0.12
  fadeIn: 1.5     # 秒（デフォルト 1）
  fadeOut: 2.5    # 秒（デフォルト 2）
  loop: true      # デフォルト true
```

- 文字列だけ書くこともできる: `bgm: "audio/bgm/carefree-kevin-macleod.mp3"`
- セリフを邪魔しないよう`volume`は0.1前後を推奨
- `credit`を書くと動画末尾のクレジットに追記される

### BGMの置き場所

**ライセンスと置き場所の判断は`.claude/rules/assets.md`に従う（厳守）。**
再配布NGの素材は`public/audio/bgm/local/`（`.gitignore`済み）に置く。

```yaml
bgm:
  src: "audio/bgm/local/shuffle-shuffle.mp3"   # 再配布NGの素材
  credit: "BGM: shuffle shuffle / KK (DOVA-SYNDROME)"
```

`generate.mjs`がファイルの実在と置き場所をチェックする
（見つからなければエラー終了、コミット対象の場所なら注意を表示）。

## 効果音

テロップ・スライドの表示に合わせて1回だけ鳴らす。

```yaml
defaultSe:                        # 全シーンのテロップ表示で鳴る
  src: "audio/se/pop.ogg"
  volume: 0.22                    # 既定 0.35
  # delay: 0.1                    # 表示から遅らせる秒数

opening:
  se: "audio/se/transition.ogg"

scenes:
  - text: "強調したいのだ"
    se: "audio/se/chime.ogg"      # シーン単位で上書き
    slide:
      se: "audio/se/slide-in.ogg" # スライド登場時だけ鳴る

  - text: "静かにしたいのだ"
    se: null                      # 鳴らさない
```

- 文字列だけ書けば`src`の指定になる
- `slide.se`は**スライドが切り替わったときだけ**鳴る（継続表示のシーンでは鳴らない）
- 実装は`src/components/SoundEffect.tsx`。`Sequence`で開始フレームに合わせている

### 効果音の置き場所

BGMと同じ。**判断は`.claude/rules/assets.md`に従う（厳守）。**

同梱しているのはKenney Interface Sounds（CC0）から採った6種類。
`pop` / `select` / `slide-in` / `chime` / `confirm` / `transition`。

## メディアパスの解決

`bgm.src` / `se.src` / `slide.image` / `image.src`は`src/utils/media.ts`の
`resolveMediaSrc`で解決される。

| 書き方 | 解決先 |
|--------|--------|
| `audio/bgm/foo.mp3` | `public/audio/bgm/foo.mp3` |
| `https://example.com/foo.mp3` | URLをそのまま参照 |

URLを使う場合の注意:
- レンダリング時に毎回ダウンロードが走るため、ネットワーク断で失敗する
- 配布元が直リンク（ホットリンク）を禁止していないか確認する
- 自前のS3/CDNなど、参照が許可されている場所を使う

## 見た目のバリアント

テロップとスライドは名前で切り替える。

```yaml
defaultSubtitle: boxed       # 動画全体の既定
defaultSlideVariant: card

scenes:
  - text: "ここだけ帯にする"
    subtitle: bar            # シーン単位で上書き
    slide:
      variant: title         # スライド単位で上書き
```

- `subtitle`: `boxed`（既定） / `bar` / `outline` / `card` / `none`
- `slide.variant`: `card`（既定） / `fullbleed` / `title`
- `opening.variant`: `center`（既定） / `band` / `minimal`
- `ending.variant`: `center`（既定） / `band` / `minimal`
- `thumbnail.variant`: `bold`（既定） / `split` / `simple`

サンプル: `scenes/variants-demo.yaml`、`scenes/opening-demo.yaml`

### キャラクターの切り替え

立ち絵はバリアントではなく`character:`で切り替える。
シーンにも書けるので、動画の途中で交代させられる（`.claude/rules/character.md`参照）。
声・表情・クレジットも一緒に切り替わる。

```yaml
character: presenter    # src/characters/presenter/character.json
```

同梱しているのは`zundamon`（既定）と`presenter`（Avataaars / MIT）。
追加手順は`.claude/rules/character.md`、
静止画1枚から作る場合は`character-from-image`スキルを参照。
サンプル: `scenes/presenter-demo.yaml`

## オープニングとサムネイル

```yaml
opening:              # 本編の前に流れる
  variant: center
  title: "タイトル"
  text: "喋らせたいセリフ"   # 書くと音声を生成し、尺は音声の長さになる
  # duration: 3            # textが無いときの尺（既定3秒）
  # character: false       # キャラクターを隠す

thumbnail:            # 動画には出ない。静止画として書き出す
  variant: bold
  title: "サムネの文字"
  # width: 1280 / height: 720（既定）
```

```bash
npm run thumbnail -- scenes/my-video.yaml   # output/my-video-thumbnail.png
```

- `opening`があるとシーンの`startTime`はその分だけ後ろにずれる（生成時に計算済み）
- サムネイルは`Still`コンポジションとして`Root.tsx`に自動登録される
  （`thumbnail:`を書いたYAMLだけ）

### バリアントの追加手順

`subtitle` / `slide` / `opening` / `ending` / `thumbnail` の5グループはすべて
「共通パーツ → バリアント → レジストリ」の3層構成。追加は3ステップで済む。

1. バリアントのコンポーネントを追加（`SubtitleVariantComponent`などを実装）
2. 同ディレクトリの`index.tsx`のレジストリに登録
3. `src/types/scene.ts`の対応する型（`SubtitleVariant` / `SlideVariant` /
   `OpeningVariant` / `EndingVariant` / `ThumbnailVariant`）に名前を追加

`SceneComposition.tsx`は触らない。スライドのバリアントは
`parts/`（SlideShell・SlideHeader・SlideBody・SlideFooter・Bullet・SlideImage）を
組み合わせて作ると、配置と登場アニメーションが自動的に揃う。

バリアントには絶対フレームではなく`localFrame`（表示開始からの経過フレーム）が渡る。

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
src/generated/             # 生成されたシーンJSON（git管理する）
public/parts/zundamon_en/  # パーツ
public/audio/bgm/          # BGM（手で配置・git管理する）
public/audio/voice/<video>/  # 音声+JSON（git管理外・再生成する）
```

`src/generated/<video>.json`だけは`src/Root.tsx`がimportするためコミットする。
`public/audio/voice/`は`.gitignore`で丸ごと除外しているので、
別環境では`npm run voice`を実行してから使う。
動画を追加しても`.gitignore`を編集する必要はない。

Remotionに登録されるのは、YAML由来の`SceneVideo`（動画）と、
`thumbnail:`を書いたYAMLの`<id>-thumbnail`（静止画）だけ。

## クレジット（自動表示）

動画最後の2秒に自動表示される。

- 声・立ち絵は各キャラクターの`character.json`の`credits`。
  **動画に出てきた全キャラクターぶんが自動で並ぶ**
- BGMはシーンYAMLの`bgm.credit`

素材のライセンスと表記義務は`.claude/rules/assets.md`に従う（**厳守**）。
