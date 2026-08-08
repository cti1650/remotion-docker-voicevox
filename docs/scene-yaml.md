# シーンYAMLの書き方

`scenes/*.yaml` に動画の中身を書く。ここを書けば音声・リップシンク・動画が生成される。

全項目のリファレンスは末尾の[設定オプション](#設定オプション)を参照。

```yaml
# scenes/my-video.yaml
title: "説明動画"
character: zundamon    # 省略時 zundamon。立ち絵・声・クレジットがまとめて切り替わる
speaker_id: 3           # ずんだもんノーマル（省略時はキャラクターの既定値）

scenes:
  - text: "こんにちは！ずんだもんなのだ！"
    emotion: happy

  - text: "今日はRemotionについて説明するのだ"
    emotion: normal
    background: purple

  - text: "とっても簡単なのだ！"
    emotion: surprised
```

## スライドを見せながら解説する

`slide` を指定すると、画面左側にスライド枠が表示される（キャラクターは右側）。

```yaml
scenes:
  - text: "3ステップで作れるのだ"
    slide:
      title: "作り方は3ステップ"
      bullets:
        - "設定ファイルを書く"
        - "音声を生成する"
        - "レンダリングする"

  - text: "まずは設定ファイルを書くのだ"
    highlight: 1      # 1番目の箇条書きを強調

  - text: "スライドはここで消すのだ"
    slide: null
```

`slide` を書かないシーンは直前のスライドを継続表示する。

スライドには画像も差し込める:

```yaml
    slide:
      title: "画像も差し込める"
      bullets: ["箇条書きの横に並べられる"]
      image: "images/flow.png"
      imageLayout: split   # split=箇条書きの右 / stack=箇条書きの下
      caption: "図: 動画ができるまで"
```

`bullets` を書かなければ画像だけを大きく表示する。

## BGMを流す

トップレベルに `bgm` を書くと、動画全体にループで流れる（フェードイン・アウト付き）。

```yaml
bgm:
  src: "audio/bgm/carefree-kevin-macleod.mp3"  # public/audio/bgm/ に配置
  volume: 0.10                                  # セリフを邪魔しない程度に
  fadeIn: 1.5
  fadeOut: 2.5
  credit: "BGM: Carefree - Kevin MacLeod (incompetech.com) / CC BY 4.0"
```

`src` にはHTTPS URLも書ける（配布元が直リンクを許容している場合のみ）。

音源は再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | 再配布OK（CC BY・パブリックドメインなど） | する |
| `public/audio/bgm/local/` | **再配布NG**（DOVA-SYNDROME・魔王魂・購入音源など） | しない |

`local/` は `.gitignore` で除外しているので、規約違反の素材を誤ってコミットする心配がない。
同梱音源のライセンスは `public/audio/bgm/CREDITS.md` を参照。

動作するサンプルは `scenes/slide-demo.yaml` を参照。

## 効果音を鳴らす

テロップやスライドの表示に合わせて効果音を鳴らせる。

```yaml
# 動画全体の既定（全シーンのテロップ表示で鳴る）
defaultSe:
  src: "audio/se/pop.ogg"
  volume: 0.22        # デフォルト 0.35
  # delay: 0.1        # 表示から遅らせる秒数

opening:
  se: "audio/se/transition.ogg"   # 冒頭で鳴らす

scenes:
  - text: "ここは強調したいのだ"
    se: "audio/se/chime.ogg"      # このシーンだけ差し替え
    slide:
      se: "audio/se/slide-in.ogg" # スライドが出るときに鳴らす

  - text: "ここは静かにしたいのだ"
    se: null                      # 鳴らさない
```

- 文字列だけ書けば `src` の指定になる
- `slide.se` はスライドが**登場したときだけ**鳴る（継続表示のシーンでは鳴らない）
- 音量はセリフを邪魔しない0.2〜0.35程度を推奨

同梱している効果音（すべてCC0）:

| ファイル | 想定用途 |
|----------|----------|
| `pop.ogg` | テロップの表示 |
| `select.ogg` | 箇条書きの強調 |
| `slide-in.ogg` | スライドの登場 |
| `chime.ogg` | 注目させたいところ |
| `confirm.ogg` | 決定・まとめ |
| `transition.ogg` | 章の切り替え |

素材はBGMと同じく再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/se/` | 再配布OK（CC0など） | する |
| `public/audio/se/local/` | **再配布NG**（効果音ラボ・魔王魂など） | しない |

日本語のフリー効果音サイトは「商用利用OK」でも素材ファイルの再配布は禁止していることが
多いので、その場合は `local/` に置く。同梱音源のライセンスは
`public/audio/se/CREDITS.md` を参照。

## 冒頭にタイトル演出を入れる

トップレベルに `opening` を書くと、本編の前にタイトル演出が入る。

```yaml
opening:
  variant: center       # center / band / minimal
  title: "動画の冒頭を作る"
  subtitle: "オープニングとサムネイルの紹介"
  badge: "解説"          # 省略可
  accent: "#6c5ce7"
  background: "dark"    # 本編と違う背景にできる
  emotion: happy
  text: "今日は使い方を紹介するのだ！"   # 書くと喋る。尺は音声の長さ
  # text を書かない場合:
  # duration: 3         # 無音で3秒（デフォルト3秒）
  # character: false    # キャラクターを隠す
```

`text` を書いた場合は音声とリップシンクも生成され、口が動く。

| `variant` | 見た目 |
|-----------|--------|
| `center` | 画面中央に大きくタイトル。上下にアクセントの線（デフォルト） |
| `band` | 斜めの帯が横から滑り込む |
| `minimal` | 左下に控えめに置く。背景やキャラクターを見せたいとき |

## エンディングを入れる

トップレベルに `ending` を書くと、本編の後に締めの演出が入る。書き方は `opening` と同じ。
**省略すれば付かない。**

```yaml
ending:
  variant: center       # center / band / minimal
  title: "ご視聴ありがとうございました"
  subtitle: "また次の動画で"
  accent: "#00d2a0"
  background: "dark"
  emotion: happy
  se: "audio/se/confirm.ogg"
  text: "また会おうなのだ！"   # 書くと喋る。尺は音声の長さ
  # text を書かない場合:
  # duration: 4         # 無音で4秒（デフォルト4秒）
  # character: false    # キャラクターを隠す
```

| `variant` | 見た目 |
|-----------|--------|
| `center` | 画面中央に大きくメッセージ（デフォルト） |
| `band` | 斜めの帯にメッセージを載せる |
| `minimal` | 右上に控えめに置く |

動画末尾のクレジットは**エンディングに重ねて表示される**（併存）。
`ending` を書いても書かなくてもクレジットは出る。

長いメッセージはどのバリアントでも自動で折り返し、キャラクターに重ならない。

動作するサンプルは `scenes/ending-demo.yaml` を参照。

## サムネイルを作る

トップレベルに `thumbnail` を書くと、静止画として書き出せる。動画には出ない。

```yaml
thumbnail:
  variant: bold         # bold / split / simple
  title: "冒頭とサムネを自動で"
  subtitle: "YAMLに書くだけ"
  badge: "Remotion"
  accent: "#6c5ce7"
  background: "purple"
  emotion: smug
  image: "images/flow.png"   # split のときに使う
  # width: 1280 / height: 720（省略時はこの値）
```

```bash
npm run thumbnail -- scenes/my-video.yaml
# output/my-video-thumbnail.png に出力
```

| `variant` | 見た目 |
|-----------|--------|
| `bold` | 左に特大タイトル、右にキャラクター（デフォルト） |
| `split` | 上部にタイトルの帯、下に画像とキャラクター |
| `simple` | 中央寄せの落ち着いた構成 |

動作するサンプルは `scenes/opening-demo.yaml` を参照。

## 見た目を変える

テロップとスライドは、名前を指定するだけで見た目を切り替えられる。

```yaml
defaultSubtitle: boxed       # 動画全体のテロップ（省略時 boxed）
defaultSlideVariant: card    # 動画全体のスライド（省略時 card）

scenes:
  - text: "ここだけ帯にする"
    subtitle: bar            # シーン単位で上書き
    slide:
      variant: title         # スライド単位で上書き
      title: "章の切り替え"
```

| `subtitle` | 見た目 |
|-----------|--------|
| `boxed` | 黒い角丸ボックス（デフォルト） |
| `bar` | 横幅いっぱいの帯。左端にアクセント色 |
| `outline` | 背景なし・縁取り文字。背景を隠さない |
| `card` | 白いカード + アクセントの縦線 |
| `none` | 表示しない |

| `slide.variant` | 見た目 |
|-----------------|--------|
| `card` | 白いカード（デフォルト） |
| `fullbleed` | 枠なしで背景に直接置く。文字は自動で明るい色になる |
| `title` | タイトルだけを大きく見せる章扉 |

動作するサンプルは `scenes/variants-demo.yaml` を参照。

新しい見た目を足したいときは [architecture.md のパーツ構成](architecture.md#パーツ構成) を参照。

## キャラクターを切り替える

立ち絵・表情・声・クレジットはキャラクター定義（`src/characters/<name>/character.json`）
にまとまっていて、トップレベルの `character` で切り替えられる。

```yaml
character: presenter   # 省略時 zundamon
speaker_id: 3           # 省略時はキャラクターの既定値
voice:                  # 省略時はキャラクターの既定値
  pitchScale: 0.1        # 音高 -0.15〜0.15
  speedScale: 1.0        # 話速 0.5〜2.0（変えたら音声を作り直す）
```

同梱しているのは `zundamon`（既定。PNGパーツ）と `presenter`（Avataaars由来のSVGパーツ）。
動作するサンプルは `scenes/presenter-demo.yaml` を参照。

動画の途中で切り替えることもできる。シーンの `character` は書き方で意味が変わる。

```yaml
scenes:
  - text: "まずはぼくが話すのだ"        # 既定のキャラクター

  - text: "交代しました"
    character: presenter               # 切り替え（以降のシーンにも引き継ぐ）

  - text: "このシーンだけ姿を隠します"
    character: false                   # そのシーンだけ隠す
```

声も一緒に切り替わり、**クレジットは出てきた全キャラクターぶんが自動で並ぶ**。
動作するサンプルは `scenes/character-switch-demo.yaml` を参照。

新しいキャラクターを追加する手順は [architecture.md](architecture.md) と
`.claude/rules/character.md` を参照。

## 読み方を直す

セリフは**そのまま字幕として表示される**ので、読みを直すためにカタカナで書いてはいけない。
表記は元のまま書いて、読みは `dict` で指定する。

```yaml
dict:
  Cosense: コセンス
  複数人: フクスウニン     # デフォルトはフクスウジン
  行の頭: ギョウノアタマ   # デフォルトはクダリノアタマ
```

- 英字はそのままだと1文字ずつ読まれる（`Cosense` → シイオオエスイイ…）ので必ず登録する
- **日本語でも複合語は誤読しやすい**ので、気になったら確認して登録する
- 全動画で使う語は `config/voicevox-dict.json` に置く（同じ語はYAML側が勝つ）
- 辞書は生成のたびに自動で入れ替わるため、手動での登録・インポートは不要

読みは生成前に確認できる。

```bash
curl -s -X POST "http://localhost:50021/audio_query?text=$(printf '複数人' | jq -sRr @uri)&speaker=3" | jq -r .kana
# → フクスウ'ジン（辞書登録が必要とわかる）
```

サンプルは `scenes/cosense.yaml` を参照。

## 書き間違いに気付く

書ける項目は `schema/scene.schema.json` が正。生成時（`npm run voice` / `npm run video`）に
検証され、**未知のキーや許可されていない値はエラーで止まる**。

```
scenes/my-video.yaml のスキーマ検証に失敗しました
  /scenes/0/emotion must be equal to one of the allowed values (使えるのは normal / happy / ...)
```

VS Codeに[YAML拡張](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)を
入れると、書いている最中に補完と検証が効く。各YAMLの1行目にあるモデル行がスキーマと結び付けている。

```yaml
# yaml-language-server: $schema=../schema/scene.schema.json
```

項目を増やすときは `src/types/scene.ts` と `schema/scene.schema.json` の両方を直す。

## 設定オプション

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `text` | セリフ（必須） | `"こんにちは！"` |
| `emotion` | 表情 | `normal`, `happy`, `sad`, `angry`, `surprised`, `thinking`, `smug`, `tired` |
| `background` | 背景 | `gradient`, `purple`, `blue`, `green`, `orange`, `pink`, `dark`, `white` |
| `image` | 強調画像 | `{ src: "images/sample.png", position: "top-right" }` |
| `slide` | スライド（`null`で非表示に戻す） | `{ title: "見出し", bullets: [...] }` |
| `highlight` | 強調する箇条書き番号（1始まり） | `1` |
| `subtitle` | テロップの見た目 | `boxed`, `bar`, `outline`, `card`, `none` |
| `character` | キャラクターの切り替え／表示 | `"presenter"`（切り替え）, `false`（隠す） |
| `se` | テロップ表示時の効果音（`null`で無音） | `"audio/se/chime.ogg"` |
| `pause` | セリフ後の間（秒） | `0.5` |

動画全体の設定は `opening`（冒頭演出）、`thumbnail`（サムネイル）、`bgm`、`defaultSe`、
`dict`、`defaultSubtitle`、`defaultSlideVariant` をトップレベルに書く。
