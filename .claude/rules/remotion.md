---
name: remotion
description: Remotionでの動画作成ルール。SceneComposition、シーンYAML、クレジット表記。
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

### BGMの置き場所（重要）

再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | 再配布OK（CC BY・パブリックドメインなど） | する |
| `public/audio/bgm/local/` | **再配布NG**（DOVA-SYNDROME・魔王魂・購入音源） | しない |

```yaml
bgm:
  src: "audio/bgm/local/shuffle-shuffle.mp3"   # 再配布NGの素材
  credit: "BGM: shuffle shuffle / KK (DOVA-SYNDROME)"
```

- `local/`は`.gitignore`で除外済みなので`git add -A`しても混入しない
- 迷ったら`local/`に置けば規約違反にはならない
- コミットする音源は`public/audio/bgm/CREDITS.md`にライセンスを追記する
- `generate-from-scenes.sh`がファイルの実在と置き場所をチェックする
  （見つからなければエラー終了、コミット対象の場所なら注意を表示）

## メディアパスの解決

`bgm.src` / `slide.image` / `image.src`は`src/utils/media.ts`の
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
- `thumbnail.variant`: `bold`（既定） / `split` / `simple`

サンプル: `scenes/variants-demo.yaml`、`scenes/opening-demo.yaml`

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

`subtitle` / `slide` / `opening` / `thumbnail` の4グループはすべて
「共通パーツ → バリアント → レジストリ」の3層構成。追加は3ステップで済む。

1. バリアントのコンポーネントを追加（`SubtitleVariantComponent`などを実装）
2. 同ディレクトリの`index.tsx`のレジストリに登録
3. `src/types/scene.ts`の対応する型（`SubtitleVariant` / `SlideVariant` /
   `OpeningVariant` / `ThumbnailVariant`）に名前を追加

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

動画最後の2秒に自動表示:
- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
