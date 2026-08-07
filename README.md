# Remotion + VOICEVOX Docker Environment

DockerでRemotionとVOICEVOXを使った動画作成環境。YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成。

## 必要条件

- Docker / Docker Compose
- Node.js 18+ (ローカル開発時)
- Python 3 + PyYAML（音声生成スクリプトが使用）

## クイックスタート

`scenes/demo.yaml` に全機能を詰め込んだサンプルがある。
`scenes/` にYAMLを置いたら、動画になるまでは1コマンド。

```bash
npm install                          # 初回のみ
npm run video -- scenes/demo.yaml    # 音声生成 → レンダリング → output/demo.mp4
```

VOICEVOXエンジンは起動していなければ自動で立ち上がる（初回はイメージのpullで数分かかる）。

```bash
npm run video -- scenes/demo.yaml                    # 音声生成 + レンダリング
npm run video -- scenes/demo.yaml --skip-generate    # レンダリングのみ（音声は再利用）
npm run voice -- scenes/demo.yaml                    # 音声・リップシンク生成のみ
npm run dev                                          # Remotion Studioでプレビュー
npm run voicevox:down                                # VOICEVOXを停止
```

`npm run video` を引数なしで実行すると、`scenes/` にあるYAMLの一覧が出る。

## ワークフロー

### 1. シーンYAMLを作成

`scenes/` ディレクトリにYAMLファイルを作成:

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

#### スライドを見せながら解説する

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

#### BGMを流す

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

#### 効果音を鳴らす

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

#### 冒頭にタイトル演出を入れる

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

#### サムネイルを作る

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

#### 見た目を変える

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

新しい見た目を足したいときは [パーツ構成](#パーツ構成) を参照。

#### キャラクターを切り替える

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

新しいキャラクターを追加する手順は `.claude/rules/character.md` を参照。

#### 読み方を直す

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

### 2. 動画を生成

```bash
npm run video -- scenes/my-video.yaml
# output/my-video.mp4 に出力
```

音声・リップシンクの生成からレンダリングまでを通しで実行する。

### 3. 途中で確認したい場合

```bash
npm run voice -- scenes/my-video.yaml   # 音声とリップシンクだけ生成
npm run dev                             # プレビュー（http://localhost:3000）
npm run video -- scenes/my-video.yaml --skip-generate   # 音声を使い回してレンダリング
```

セリフを変えずにレイアウトだけ調整するときは `--skip-generate` を使うと速い。

## シーン設定オプション

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `text` | セリフ（必須） | `"こんにちは！"` |
| `emotion` | 表情 | `normal`, `happy`, `sad`, `angry`, `surprised`, `thinking`, `smug`, `tired` |
| `background` | 背景 | `gradient`, `purple`, `blue`, `green`, `orange`, `pink`, `dark`, `white` |
| `image` | 強調画像 | `{ src: "images/sample.png", position: "top-right" }` |
| `slide` | スライド（`null`で非表示に戻す） | `{ title: "見出し", bullets: [...] }` |
| `highlight` | 強調する箇条書き番号（1始まり） | `1` |
| `subtitle` | テロップの見た目 | `boxed`, `bar`, `outline`, `card`, `none` |
| `character` | キャラクターを出すか（デフォルト`true`） | `false` |
| `se` | テロップ表示時の効果音（`null`で無音） | `"audio/se/chime.ogg"` |
| `pause` | セリフ後の間（秒） | `0.5` |

動画全体の設定は `opening`（冒頭演出）、`thumbnail`（サムネイル）、`bgm`、`defaultSe`、
`dict`、`defaultSubtitle`、`defaultSlideVariant` をトップレベルに書く。

## ディレクトリ構成

```
.
├── scenes/                    # シーン定義YAML
│   └── demo.yaml
├── scripts/
│   ├── render-video.sh           # 音声生成 + レンダリング（npm run video）
│   ├── render-thumbnail.sh       # サムネイル出力（npm run thumbnail）
│   ├── generate-from-scenes.sh   # 音声・リップシンク生成（npm run voice）
│   ├── generate-voice-with-lipsync.sh
│   └── lib.sh                    # python検出・VOICEVOX起動の共通処理
├── src/
│   ├── characters/             # キャラクター定義（立ち絵・表情・声・クレジット）
│   │   ├── CharacterRenderer.tsx  # layersを重ねるだけの汎用描画
│   │   ├── registry.ts            # 名前 → 定義のレジストリ
│   │   ├── zundamon/character.json
│   │   └── presenter/character.json
│   ├── components/
│   │   ├── SceneComposition.tsx   # 全体の組み立て
│   │   ├── Background.tsx
│   │   ├── HighlightImage.tsx
│   │   ├── subtitle/          # テロップの見た目バリアント
│   │   ├── slide/             # スライドの見た目バリアント
│   │   ├── opening/           # 冒頭のタイトル演出バリアント
│   │   └── thumbnail/         # サムネイルのバリアント
│   ├── generated/             # 生成されたシーンJSON
│   └── types/scene.ts
├── public/
│   ├── parts/zundamon_en/     # ずんだもんのパーツ（PNG）
│   ├── parts/presenter/       # Avataaars由来のパーツ（SVG。CREDITS.md参照）
│   └── audio/
│       ├── bgm/               # BGM（手で置く・git管理する）
│       ├── se/                # 効果音（同上。CC0素材を同梱）
│       └── voice/             # 生成された音声+リップシンク（git管理外）
└── output/                    # 出力動画
```

### パーツ構成

テロップとスライドは「共通パーツ → バリアント → レジストリ」の3層に分けている。
見た目を増やすときは既存のバリアントを触らずに済む。

4つのグループ（`subtitle` / `slide` / `opening` / `thumbnail`）がすべて同じ形をしている。

```
src/components/subtitle/
├── layout.ts          # 配置とフェードイン（全バリアント共通）
├── types.ts           # SubtitleVariantProps
├── BoxedSubtitle.tsx  # 各バリアント
├── BarSubtitle.tsx
├── OutlineSubtitle.tsx
├── CardSubtitle.tsx
└── index.tsx          # SUBTITLE_VARIANTS + SubtitleRenderer

src/components/slide/
├── layout.ts          # SLIDE_AREA・アクセント色・アニメの遅延
├── types.ts           # SlideVariantProps
├── parts/             # バリアントから組み合わせるパーツ
│   ├── SlideShell.tsx   # 外枠と登場アニメーション
│   ├── SlideHeader.tsx  # タイトル行
│   ├── SlideBody.tsx    # 箇条書きと画像の並べ方
│   ├── SlideFooter.tsx  # 補足とページ番号
│   ├── Bullet.tsx       # 箇条書き1行（明暗2トーン）
│   └── SlideImage.tsx
├── CardSlide.tsx      # 各バリアント（partsを組み合わせるだけ）
├── FullBleedSlide.tsx
├── TitleSlide.tsx
└── index.tsx          # SLIDE_VARIANTS + SlideRenderer

src/components/opening/    # Center / Band / Minimal
src/components/thumbnail/  # Bold / Split / Simple
```

`opening/parts/TitleStack.tsx`（バッジ+タイトル+サブタイトル）は
オープニングとサムネイルで共用している。

新しい見た目を足す手順は3つだけ。`SceneComposition.tsx` は触らなくてよい。

1. バリアントのコンポーネントを追加（`SlideVariantComponent` などを実装）
2. `index.tsx` のレジストリに登録
3. `src/types/scene.ts` の `SlideVariant` / `SubtitleVariant` / `OpeningVariant` /
   `ThumbnailVariant` に名前を追加

バリアントには絶対フレームではなく `localFrame`（表示開始からの経過フレーム）が渡るので、
配置やアニメーションのタイミングを気にせず中身だけ書けばよい。

### 生成物のgit管理

音声まわりは、手で用意するものと自動生成されるもので置き場所を分けている。

| 置き場所 | 中身 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | BGM（手で配置） | する |
| `public/audio/voice/` | `generate-from-scenes.sh` の出力（`.wav` + リップシンク`.json`） | **しない** |

`public/audio/voice/` は `.gitignore` で丸ごと除外しているので、動画を増やしても
`.gitignore` を触る必要がない。

| ファイル | git管理 | 理由 |
|----------|---------|------|
| `src/generated/<動画名>.json` | する | `src/Root.tsx` がimportするため、無いとビルドが通らない |
| `public/audio/voice/<動画名>/` | しない | コマンドで再生成できる。リップシンクの中身は `src/generated/` 側の `lipsyncData` と重複する |
| `output/*.mp4` | しない | レンダリング成果物 |

clone直後は音声が無い状態なので、`npm run voice`（または `npm run video`）を
実行してからプレビュー・レンダリングする。

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run video -- scenes/demo.yaml` | 音声生成からレンダリングまで通しで実行 |
| `npm run video -- scenes/demo.yaml --skip-generate` | 音声を使い回してレンダリングのみ |
| `npm run video` | `scenes/` にあるYAMLの一覧を表示 |
| `npm run voice -- scenes/demo.yaml` | 音声・リップシンクのみ生成 |
| `npm run voice` | `scenes/*.yaml` を全部まとめて音声生成 |
| `npm run thumbnail -- scenes/demo.yaml` | サムネイルをPNGで書き出す |
| `npm run dev` | Remotion Studioでプレビュー |
| `npm run voicevox:up` / `npm run voicevox:down` | VOICEVOXの起動・停止 |

```bash
# エンジンに今入っている辞書を確認（デバッグ用）
./scripts/voicevox-dict.sh list
```

`npm run video` / `npm run voice` はVOICEVOXが止まっていれば自動で起動するので、
`voicevox:up` を先に叩く必要はない。

スクリプトは `./scripts/render-video.sh scenes/demo.yaml` のように直接実行してもよい。

## Docker管理

`npm run video` / `npm run voice` がVOICEVOXを自動起動するため、通常は以下の操作は不要。
手動で管理したい場合や、トラブル時に使う。

### 初期設定

```bash
# イメージのダウンロード（初回のみ、数GBあるので時間がかかる）
docker compose pull

# または起動時に自動でダウンロード
docker compose up -d voicevox
```

### 起動

```bash
# VOICEVOXエンジンを起動（バックグラウンド）
docker compose up -d voicevox

# 起動確認
curl http://localhost:50021/version
```

### 停止

```bash
# コンテナを停止（データは保持）
docker compose stop

# または完全に削除（コンテナのみ、ボリュームは保持）
docker compose down
```

### データクリア

```bash
# コンテナとボリューム（辞書データ等）を完全削除
docker compose down -v

# イメージも含めて完全削除（再ダウンロードが必要になる）
docker compose down -v --rmi all

# 未使用のDockerリソースを一括クリーンアップ
docker system prune -a
```

### トラブルシューティング

```bash
# ログ確認
docker compose logs voicevox

# コンテナの状態確認
docker compose ps

# コンテナを再起動
docker compose restart voicevox
```

## VOICEVOX設定

VOICEVOXエンジンは http://localhost:50021 で動作。

```bash
# 話者一覧確認
curl http://localhost:50021/speakers | jq
```

主な話者ID:
- 3: ずんだもん（ノーマル）
- 1: 四国めたん
- 8: 春日部つむぎ

## ライセンス・クレジット

### VOICEVOX音声

- **クレジット表記必須**: `VOICEVOX:ずんだもん`
- [利用規約](https://zunko.jp/con_ongen_kiyaku.html)

### 立ち絵素材

動画内のクレジットはキャラクターごとの `character.json` の `credits` から自動表示される。

**zundamon**（既定）
- 作者: 坂本アヒル
- [ニコニコ静画](https://seiga.nicovideo.jp/seiga/im10788496)

```
VOICEVOX:ずんだもん
立ち絵素材: 坂本アヒル
```

**presenter**
- 素材: [Avataaars](https://avataaars.com/)（作者: Pablo Stanley）
- ライセンス: MIT（[fangpenlin/avataaars](https://github.com/fangpenlin/avataaars)。全文は `public/parts/presenter/CREDITS.md`）
